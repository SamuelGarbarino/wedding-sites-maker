/* George & Silvia · 18.09.2027 */
(() => {
const CONFIG = {
  // URL della Web App Google Apps Script (vedi HANDOFF.md). Vuoto = RSVP disattivato (simulato solo in locale).
  SCRIPT_URL: "",
  WEDDING: new Date("2027-09-18T11:00:00+02:00"),
  ADDRESS: "Villa Fenaroli Palace Hotel, Via Giuseppe Mazzini 14, 25086 Rezzato BS",
};

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const KENTE = ["#C9A13B", "#0F4D3A", "#C9A13B", "#8C1C24", "#C9A13B", "#14110D"];

/* ---------- simboli: <use> -> copia inline, così i tratti si animano ---------- */
$$("svg.draw use").forEach((u) => {
  const g = $(u.getAttribute("href")).cloneNode(true);
  g.removeAttribute("id");
  u.replaceWith(g);
});
const drawIn = (svg, opt = {}) =>
  hasGsap && !reduce
    ? gsap.to($$("[pathLength]", svg), { strokeDashoffset: 0, autoRound: false, duration: 1.4, stagger: 0.1, ease: "power2.inOut", ...opt })
    : svg.classList.add("is-drawn");

/* ---------- lingua ---------- */
const store = (k, v) => { try { return v === undefined ? localStorage.getItem(k) : localStorage.setItem(k, v); } catch {} };
let lang = store("lang") || (navigator.language || "it").slice(0, 2);
if (!I18N[lang]) lang = "en";
const t = (k) => I18N[lang][k] ?? I18N.it[k] ?? k;
function applyLang(root = document) {
  $$("[data-i18n]", root).forEach((el) => (el.textContent = t(el.dataset.i18n)));
  $$("[data-i18n-ph]", root).forEach((el) => (el.placeholder = t(el.dataset.i18nPh)));
  $$("[data-i18n-aria]", root).forEach((el) => el.setAttribute("aria-label", t(el.dataset.i18nAria)));
  if (root === document) {
    document.documentElement.lang = lang;
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.lang === lang));
  }
}
applyLang();

let splits = [];
$$("[data-lang]").forEach((b) =>
  b.addEventListener("click", () => {
    if (b.dataset.lang === lang) return;
    const swap = () => {
      lang = b.dataset.lang;
      store("lang", lang);
      splits.forEach((s) => s.revert());
      splits = [];
      applyLang();
      if (hasGsap) ScrollTrigger.refresh();
    };
    if (!hasGsap || reduce) return swap();
    gsap.to("main, .footer", { opacity: 0, duration: 0.25, onComplete() { swap(); gsap.to("main, .footer", { opacity: 1, duration: 0.5 }); } });
  })
);

/* ---------- nav ---------- */
const nav = $("#nav");
addEventListener("scroll", () => nav.classList.toggle("is-scrolled", scrollY > 40), { passive: true });

/* ---------- timeline: percorso del nastro ---------- */
// Curva a S che passa dal centro di ogni illustrazione; ricalcolata quando cambia il layout.
const tlBox = $(".tl");
function ribbon() {
  const W = tlBox.offsetWidth, H = tlBox.offsetHeight, mobile = W < 720;
  // offset* ignorano le trasformazioni GSAP. Desktop: il nastro passa dietro le card, non sopra gli sposi.
  // Mobile (una colonna): passa nella fascia libera accanto a ogni illustrazione e attraversa dietro le card.
  const pts = [[mobile ? W * 0.93 : W / 2, -40], ...$$(".tl__item", tlBox).map((li, i) => {
    const el = $(mobile ? ".tl__art" : ".tl__card", li);
    const y = el.offsetTop + el.offsetHeight / 2;
    return mobile ? [W * (i % 2 ? 0.07 : 0.93), y] : [el.offsetLeft + el.offsetWidth / 2, y];
  }), [W / 2, H + 40]];
  let d = "M" + pts[0].join(" ");
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], k = (y1 - y0) * 0.6;
    d += ` C${x0} ${y0 + k} ${x1} ${y1 - k} ${x1} ${y1}`;
  }
  $$(".tl__ribbon path", tlBox).forEach((p) => p.setAttribute("d", d));
}
new ResizeObserver(ribbon).observe(tlBox);

/* ---------- countdown ---------- */
const cdEls = Object.fromEntries($$("[data-cd]").map((el) => [el.dataset.cd, el]));
function tick() {
  let s = Math.max(0, Math.floor((CONFIG.WEDDING - Date.now()) / 1000));
  const v = { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
  for (const k in v) {
    const txt = k === "d" ? String(v[k]) : String(v[k]).padStart(2, "0");
    if (cdEls[k].textContent === txt) continue;
    cdEls[k].textContent = txt;
    if (hasGsap && !reduce) gsap.fromTo(cdEls[k], { yPercent: -35, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.6, ease: "expo.out" });
  }
}
tick();
const cdTimer = setInterval(() => {
  tick();
  if (CONFIG.WEDDING > Date.now()) return;
  clearInterval(cdTimer);
  const k = $('[data-i18n="cd.kicker"]');
  k.dataset.i18n = "cd.today";
  applyLang(k.parentNode);
}, 1000);

$("#cal-google").href =
  "https://calendar.google.com/calendar/render?" +
  new URLSearchParams({
    action: "TEMPLATE",
    text: "Matrimonio George & Silvia",
    dates: "20270918T090000Z/20270918T210000Z",
    location: CONFIG.ADDRESS,
    details: "Cerimonia 11:00 · Aperitivo 13:00 · Pranzo 14:30 · Taglio torta 17:00 · Festa 18:00–23:00",
  });

/* ---------- copia indirizzo ---------- */
const toastEl = $("#toast");
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add("is-on");
  clearTimeout(toast.t);
  toast.t = setTimeout(() => toastEl.classList.remove("is-on"), 2400);
}
$("#copy-addr").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(CONFIG.ADDRESS);
  } catch {
    const ta = Object.assign(document.createElement("textarea"), { value: CONFIG.ADDRESS });
    document.body.append(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    if (!ok) return toast(CONFIG.ADDRESS);
  }
  toast(t("vn.copied"));
});

/* ---------- RSVP ---------- */
const form = $("#rsvp-form");
const more = $("#rsvp-more");
const guests = $("#guests");
const errEl = $("#rsvp-error");

form.addEventListener("change", (e) => {
  if (e.target.name !== "presente") return;
  const yes = e.target.value === "si";
  if (yes === !more.hidden) return;
  more.hidden = !yes;
  if (yes && hasGsap && !reduce) gsap.from(more, { opacity: 0, y: -12, duration: 0.6, ease: "expo.out" });
});

$("#add-guest").addEventListener("click", () => {
  const li = $("#guest-tpl").content.firstElementChild.cloneNode(true);
  applyLang(li);
  li.querySelector(".guest__remove").addEventListener("click", () => { li.remove(); $("#add-guest").focus(); });
  guests.append(li);
  if (hasGsap && !reduce) gsap.from(li, { opacity: 0, y: -10, duration: 0.5, ease: "expo.out" });
  li.querySelector("input").focus();
});

function collect() {
  const f = new FormData(form);
  const val = (k) => (f.get(k) || "").toString().trim();
  const presente = val("presente");
  return {
    nome: val("nome"),
    cognome: val("cognome"),
    presente,
    allergie: presente === "si" ? val("allergie") : "",
    accompagnatori:
      presente === "si"
        ? $$(".guest", guests).map((li) => ({
            nome: li.querySelector('[name="g_nome"]').value.trim(),
            cognome: li.querySelector('[name="g_cognome"]').value.trim(),
            tipo: li.querySelector('[name="g_tipo"]').value,
            allergie: li.querySelector('[name="g_allergie"]').value.trim(),
          }))
        : [],
    lingua: lang,
    website: val("website"),
  };
}

function validate(d) {
  $$("[aria-invalid]", form).forEach((el) => el.removeAttribute("aria-invalid"));
  const bad = (sel) => $$(sel, form).filter((i) => !i.value.trim()).forEach((i) => i.setAttribute("aria-invalid", "true"));
  if (!d.nome || !d.cognome) return bad('[name="nome"], [name="cognome"]'), "rs.err.name";
  if (!d.presente) return "rs.err.choice";
  if (d.accompagnatori.some((g) => !g.nome || !g.cognome)) return bad('[name="g_nome"], [name="g_cognome"]'), "rs.err.guest";
  return "";
}

async function send(d) {
  if (d.website) return; // honeypot: bot, finto successo
  if (!CONFIG.SCRIPT_URL) {
    if (/^(localhost|127\.0\.0\.1)$/.test(location.hostname)) return new Promise((r) => setTimeout(r, 900));
    throw new Error("SCRIPT_URL mancante");
  }
  const res = await fetch(CONFIG.SCRIPT_URL, { method: "POST", body: JSON.stringify(d), signal: AbortSignal.timeout?.(15000) }); // text/plain: niente preflight CORS
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "errore");
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const d = collect();
  const err = validate(d);
  errEl.textContent = err ? t(err) : "";
  if (err) return ($("[aria-invalid]", form) || $('[name="presente"]', form)).focus();
  const btn = $(".form__submit", form);
  btn.disabled = true;
  $("span", btn).textContent = t("rs.sending");
  try {
    await send(d);
  } catch (ex) {
    console.error(ex);
    errEl.textContent = t("rs.err.send");
    btn.disabled = false;
    $("span", btn).textContent = t("rs.send");
    return;
  }
  const thanks = $("#rsvp-thanks");
  $("#thanks-title").dataset.i18n = d.presente === "si" ? "rs.thanks.yes" : "rs.thanks.no";
  applyLang(thanks);
  form.hidden = true;
  thanks.hidden = false;
  thanks.focus();
  drawIn($("svg", thanks), { duration: 1.8 });
  if (hasGsap && !reduce) gsap.from(".thanks__title", { opacity: 0, y: 20, duration: 1, delay: 0.4, ease: "expo.out" });
  if (d.presente === "si" && !reduce) confetti();
});

/* ---------- coriandoli kente ---------- */
function confetti() {
  const c = $("#confetti");
  const ctx = c.getContext("2d");
  const dpr = Math.min(devicePixelRatio, 2);
  c.width = innerWidth * dpr;
  c.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const parts = Array.from({ length: 160 }, () => ({
    x: innerWidth / 2 + (Math.random() - 0.5) * 200,
    y: innerHeight * 0.55,
    vx: (Math.random() - 0.5) * 16,
    vy: -Math.random() * 18 - 6,
    w: 6 + Math.random() * 10,
    h: 3 + Math.random() * 4,
    r: Math.random() * 6,
    vr: (Math.random() - 0.5) * 0.3,
    col: KENTE[(Math.random() * KENTE.length) | 0],
  }));
  const t0 = performance.now();
  (function frame(now) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.45; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r);
      ctx.fillStyle = p.col; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.r * 2)) + 1);
      ctx.restore();
    }
    if (now - t0 < 4000) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(t0);
}

/* ---------- intro: tessitura kente ---------- */
function weaveSVG() {
  // strisce kente: blocchi pieni alternati a blocchi rigati, sfalsati a scacchiera
  const rows = 16, cols = 10, h = 1000 / rows, w = 1000 / cols;
  const solid = ["#0F4D3A", "#8C1C24", "#14110D", "#0F4D3A"];
  const lines = ["#0F4D3A", "#8C1C24", "#14110D"];
  let blocks = "", warp = "";
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) {
      const x = j * w, y = i * h;
      let g = `<rect x="${x}" y="${y}" width="${w + 0.5}" height="${h + 0.5}" fill="${(i + j) % 2 ? solid[(i + (j >> 1)) % 4] : "#C9A13B"}"/>`;
      if ((i + j) % 2 === 0)
        lines.forEach((c, k) => (g += `<rect x="${x}" y="${y + h * (0.22 + k * 0.24)}" width="${w + 0.5}" height="${h * 0.08}" fill="${c}"/>`));
      blocks += `<g class="wf" data-i="${i}" data-j="${j}">${g}</g>`;
    }
  for (let k = 1; k < 80; k++)
    warp += `<line class="wp" pathLength="1" x1="${k * 12.5}" y1="0" x2="${k * 12.5}" y2="1000" vector-effect="non-scaling-stroke"/>`;
  return `<svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">${blocks}
    <g stroke="rgba(20,17,13,.28)" stroke-width="1" stroke-dasharray="1" stroke-dashoffset="1">${warp}</g></svg>`;
}

const intro = $("#intro");
const endIntro = () => {
  intro?.remove();
  document.documentElement.style.overflow = "";
};

if (!hasGsap || reduce) {
  endIntro();
  $$("svg.draw").forEach((s) => s.classList.add("is-drawn"));
} else {
  gsap.registerPlugin(ScrollTrigger, SplitText);
  history.scrollRestoration = "manual";
  scrollTo(0, 0);
  document.documentElement.style.overflow = "hidden";

  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.1, anchors: { offset: -60 } });
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  const panels = $$(".intro__panel");
  panels.forEach((p) => (p.innerHTML = weaveSVG()));
  const heroBits = [".hero__kicker", ".hero__lead", ".names__line", ".names__and", ".hero__invite", ".hero__date", ".hero__place", ".nav"];
  gsap.set(heroBits, { opacity: 0 });

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  tl.to($$(".wp", intro), { strokeDashoffset: 0, autoRound: false, duration: 0.9, stagger: { each: 0.005, from: "center" } })
    .from($$(".wf", intro), {
      scaleX: 0,
      transformOrigin: (k, el) => (el.dataset.i % 2 ? "100% 50%" : "0% 50%"),
      duration: 0.55,
      ease: "power3.out",
      stagger: (k, el) => {
        const i = +el.dataset.i, j = +el.dataset.j;
        return i * 0.055 + (i % 2 ? 9 - j : j) * 0.022;
      },
    }, 0.15)
    .fromTo(".intro__medal", { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.9 }, "-=0.5")
    .to($$(".intro__medal [pathLength]"), { strokeDashoffset: 0, autoRound: false, duration: 1.1, stagger: 0.07, ease: "power2.inOut" }, "<0.1")
    .addLabel("open", "+=0.25")
    .to(".intro__medal", { scale: 1.5, opacity: 0, duration: 0.8, ease: "power2.in" }, "open")
    .to(".intro__panel--top", { yPercent: -52, duration: 1.4, ease: "expo.inOut" }, "open+=0.35")
    .to(".intro__panel--bottom", { yPercent: 52, duration: 1.4, ease: "expo.inOut" }, "<")
    .fromTo(".hero__media img", { scale: 1.25 }, { scale: 1, duration: 2.4, ease: "expo.out" }, "<")
    .add(heroIn, "<0.6")
    .add(() => {
      endIntro(); lenis?.start(); ScrollTrigger.refresh();
      // link condiviso con ancora (es. /#rsvp): ci si arriva dopo l'intro
      const target = location.hash && document.getElementById(location.hash.slice(1));
      if (target) lenis ? lenis.scrollTo(target, { offset: -60 }) : target.scrollIntoView();
    });

  $(".intro__skip").addEventListener("click", () => tl.timeScale(6));
  // fail-safe: mai bloccati dietro l'intro
  setTimeout(() => { if (intro.isConnected) { tl.progress(1); endIntro(); gsap.set(heroBits, { opacity: 1 }); } }, 9000);

  function heroIn() {
    gsap.timeline({ defaults: { ease: "expo.out", duration: 1.4 } })
      .fromTo(".hero__kicker", { opacity: 0, y: 24, filter: "blur(8px)" }, { opacity: 1, y: 0, filter: "blur(0px)" })
      .fromTo(".hero__lead", { opacity: 0, y: 12 }, { opacity: 1, y: 0 }, "<0.3")
      .fromTo(".names__line", { opacity: 0, yPercent: 30, letterSpacing: "0.2em", filter: "blur(14px)" },
        { opacity: 1, yPercent: 0, letterSpacing: "-0.02em", filter: "blur(0px)", duration: 1.8, stagger: 0.18 }, "<0.15")
      .fromTo(".names__and", { opacity: 0, scale: 0.6, rotate: -12 }, { opacity: 1, scale: 1, rotate: 0 }, "<0.4")
      .fromTo(".names", { "--fx": "100%" }, { "--fx": "30%", duration: 2.4, ease: "power2.inOut" }, "<")
      .fromTo([".hero__invite", ".hero__date", ".hero__place"], { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.12 }, "<0.5")
      .fromTo(".nav", { opacity: 0, y: -20 }, { opacity: 1, y: 0 }, "<0.2");
  }

  // riflesso della lamina oro che segue il puntatore
  if (matchMedia("(hover: hover) and (pointer: fine)").matches)
    $("#hero").addEventListener("pointermove", (e) =>
      gsap.to(".names", { "--fx": `${10 + (e.clientX / innerWidth) * 80}%`, duration: 1.2, ease: "power3.out", overwrite: "auto" })
    );

  document.fonts.ready.then(scrollAnims);

  // Dissolvenza WebGL (shader adattato da Ironhill): l'avorio sale dal basso con bordo di rumore fbm e filo d'oro.
  function heroVeil() {
    const c = $(".hero__veil"), gl = c.getContext("webgl", { antialias: false });
    if (!gl) return c.remove();
    const vs = "attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;gl_Position=vec4(p,0.,1.);}";
    const fs = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float uP;uniform vec2 uR;varying vec2 v;
float h(vec2 p){return fract(sin(dot(vec3(p,1.),vec3(37.1,61.7,12.4)))*3758.5453123);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f*=f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){return n(p)*.5+n(p*2.)*.25+n(p*4.)*.125;}
void main(){
  vec2 c=(v-.5)*vec2(uR.x/uR.y,1.);
  float d=v.y-uP*1.2+fbm(c*9.)*.3, px=1./uR.y;
  float a=1.-smoothstep(-px,px,d);
  vec3 col=mix(vec3(.957,.929,.878),vec3(.788,.631,.231),smoothstep(-7.*px,0.,d));
  gl_FragColor=vec4(col*a,a);
}`;
    const pr = gl.createProgram();
    [[gl.VERTEX_SHADER, vs], [gl.FRAGMENT_SHADER, fs]].forEach(([t, src]) => {
      const sh = gl.createShader(t);
      gl.shaderSource(sh, src); gl.compileShader(sh); gl.attachShader(pr, sh);
    });
    gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return c.remove();
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uP = gl.getUniformLocation(pr, "uP"), uR = gl.getUniformLocation(pr, "uR");
    let p = 0;
    const draw = () => { gl.uniform1f(uP, p); gl.drawArrays(gl.TRIANGLES, 0, 3); };
    const size = () => {
      const r = Math.min(devicePixelRatio, 2), w = c.clientWidth, hh = c.clientHeight;
      c.width = w * r; c.height = hh * r;
      gl.viewport(0, 0, c.width, c.height); gl.uniform2f(uR, w, hh); draw();
    };
    size();
    addEventListener("resize", size);
    // bordo medio b (coordinate hero, 0 = fondo) che sale con lo scroll ma resta nella parte ancora visibile (1 - s):
    // l'avorio non supera ~1/3 di schermo e non arretra mai. 0.13 = media del rumore fbm*.3.
    ScrollTrigger.create({ trigger: "#hero", start: "top top", end: "bottom top", onUpdate: (st) => {
      const s = st.progress, b = s < 0.5 ? s * (1 - s) : s / 2;
      p = (b + 0.13 * Math.min(1, s * 4)) / 1.2;
      draw();
    } });
  }

  function scrollAnims() {
    // parallasse hero
    gsap.to(".hero__media img", { yPercent: -10, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });
    gsap.to(".hero__content", { yPercent: -18, opacity: 0.2, ease: "none", scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: true } });

    heroVeil();

    // nastri kente che "scorrono sul telaio"
    $$(".kente-band").forEach((b) =>
      gsap.fromTo(b, { backgroundPosition: "0px 0px, 0px 0px" }, { backgroundPosition: "0px 0px, 632px 0px", ease: "none", scrollTrigger: { trigger: b, start: "top bottom", end: "bottom top", scrub: true } })
    );

    // titoli: righe che salgono dalla maschera
    $$("[data-split-lines]").forEach((el) => {
      const s = SplitText.create(el, { type: "lines", mask: "lines" });
      splits.push(s);
      gsap.from(s.lines, { yPercent: 110, duration: 1.2, stagger: 0.1, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%" } });
    });

    // reveal generici
    ScrollTrigger.batch(".section .kicker, .rsvp__note, .venue__addr, .cd__unit, .cal, .venue__map, .section > .btn-row, .card, .footer > *", {
      start: "top 90%",
      once: true,
      onEnter: (els) => gsap.fromTo(els, { opacity: 0, y: 32 }, { opacity: 1, y: 0, duration: 1, stagger: 0.1, ease: "expo.out", overwrite: true }),
    });

    // timeline: il nastro kente si srotola con lo scroll, le illustrazioni entrano al passaggio
    // come su bysamlab.com: il nastro oro si allunga e si ritrae seguendo lo scroll
    gsap.fromTo(".tl__band", { strokeDashoffset: 1 }, { strokeDashoffset: 0, autoRound: false, ease: "none", scrollTrigger: { trigger: ".tl", start: "top 78%", end: "bottom 58%", scrub: 0.5 } });
    $$(".tl__item").forEach((item) => {
      const st = { trigger: item, start: "top 75%" };
      gsap.from($(".tl__art", item), { scale: 0.85, opacity: 0, duration: 1.2, ease: "expo.out", scrollTrigger: st });
      gsap.from($(".tl__card", item), { y: 48, opacity: 0, duration: 1.1, delay: 0.1, ease: "expo.out", scrollTrigger: st });
    });

    // simbolo del footer
    ScrollTrigger.create({ trigger: ".footer", start: "top 85%", once: true, onEnter: () => drawIn($(".footer__symbol")) });
  }
}
})();
