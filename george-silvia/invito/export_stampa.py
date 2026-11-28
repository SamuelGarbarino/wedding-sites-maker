# PDF di stampa per Stampaprint: 152x214 mm (2 mm abbondanza), CMYK FOGRA39, 600 dpi raster (niente font = testi "in tracciati")
from playwright.sync_api import sync_playwright
from PIL import Image, ImageCms
import fitz, pathlib, io

d = pathlib.Path(r"C:\Users\Samuel\Desktop\Matrimonio George e Silvia\george-silvia\invito")
out = d / "stampa"; out.mkdir(exist_ok=True)
DPI = 600; SCALE = DPI / 96
MM = DPI / 25.4
W, H, CROP = round(152 * MM), round(214 * MM), round(1 * MM)  # HTML ha 3 mm di abbondanza, Stampaprint ne vuole 2
FOGRA = ImageCms.getOpenProfile(r"C:\Windows\System32\spool\drivers\color\CoatedFOGRA39.icc")
SRGB = ImageCms.createProfile("sRGB")
xf = ImageCms.buildTransform(SRGB, FOGRA, "RGB", "CMYK", ImageCms.Intent.RELATIVE_COLORIMETRIC, ImageCms.Flags.BLACKPOINTCOMPENSATION)
# su carta avorio il bianco = nessun inchiostro: l'avorio stampato del retro (e dei dettagli) sparisce
PRINT_CSS = ":root{--ivory:#fff}"
SAFE_JS = """() => { const mm = 96/25.4, lim = (3+4)*mm, bad = [];
  document.querySelectorAll('.page').forEach((pg, i) => { if (i > 1) return; const P = pg.getBoundingClientRect();
    pg.querySelectorAll('.safe *').forEach(el => { const r = el.getBoundingClientRect(); if (!r.width) return;
      const m = Math.min(r.left-P.left, r.top-P.top, P.right-r.right, P.bottom-r.bottom);
      if (m < lim) bad.push([i, el.tagName, el.className.baseVal ?? el.className, (m/mm-3).toFixed(1)]); }); });
  return bad; }"""

with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome")
    pg = b.new_page(viewport={"width": 700, "height": 900}, device_scale_factor=SCALE)
    for lang in ("it", "en"):
        pg.goto(d.joinpath("invito.html").as_uri() + f"?lang={lang}", wait_until="networkidle")
        pg.add_style_tag(content=PRINT_CSS)
        pg.evaluate("document.fonts.ready")
        print(lang, "fuori dal margine di 4 mm:", pg.evaluate(SAFE_JS) or "nessuno")
        pages = []
        for i, s in enumerate(pg.query_selector_all(".page")[:2]):
            im = Image.open(io.BytesIO(s.screenshot())).convert("RGB")
            im = im.crop((CROP, CROP, CROP + W, CROP + H))
            pages.append(ImageCms.applyTransform(im, xf))
        tmp = out / f"_{lang}.pdf"
        pages[0].save(tmp, save_all=True, append_images=pages[1:], resolution=DPI, quality=95)
        doc = fitz.open(tmp)
        b2 = 2 * 72 / 25.4
        for page in doc:
            r = page.mediabox
            page.set_bleedbox(r)
            page.set_trimbox(fitz.Rect(r.x0 + b2, r.y0 + b2, r.x1 - b2, r.y1 - b2))
        dest = out / f"invito-{lang}-stampa-cmyk.pdf"
        doc.save(dest, garbage=3, deflate=True); doc.close(); tmp.unlink()
        chk = fitz.open(dest)
        assert len(chk) == 2
        for page in chk:
            mm = lambda v: round(v * 25.4 / 72, 1)
            assert (mm(page.mediabox.width), mm(page.mediabox.height)) == (152.0, 214.0), page.mediabox
            assert (mm(page.trimbox.width), mm(page.trimbox.height)) == (148.0, 210.0), page.trimbox
            img = chk.extract_image(page.get_images()[0][0])
            assert img["colorspace"] == 4, img["colorspace"]  # CMYK
            assert not page.get_text().strip()  # nessun font
        print(lang, "ok", dest.name, round(dest.stat().st_size / 1e6, 1), "MB")
    b.close()
