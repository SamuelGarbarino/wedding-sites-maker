# HANDOFF — Wedding Sites Maker · George & Silvia

Ultimo aggiornamento: 26/11/2026

## Il matrimonio
- **Sposi:** George & Silvia — matrimonio tradizionale ganese
- **Data:** sabato 18/09/2027
- **Luogo:** Villa Fenaroli Palace Hotel, Via Giuseppe Mazzini 14, 25086 Rezzato (BS)
- **Programma:** Cerimonia 11:00–13:00 · Aperitivo 13:00–14:30 · Pranzo 14:30–17:00 · Taglio torta 17:00–18:00 · Festa 18:00–23:00

## Decisioni
| Tema | Scelta |
|---|---|
| Stile | Editoriale dal riferimento "bliss-and-bone" (serif sottile con nomi in lamina oro, "&" in corsivo), reinterpretato in chiave ganese: tessuto kente + simboli ispirati agli Adinkra (solo estetica, nessuna sezione esplicativa) |
| Palette | Smeraldo `#0F4D3A` · Oro kente `#C9A13B` · Cremisi `#8C1C24` · Avorio `#F4EDE0` · Nero `#14110D` |
| Font | Italiana (nomi/titoli) · Pinyon Script (& e corsivi) · DM Sans (testo) |
| Lingue | Italiano + Inglese (toggle sul sito, rileva la lingua del browser; invito in due PDF) |
| Database RSVP | Google Sheets via Google Apps Script (gratis) |
| Campi RSVP | Nome, cognome, presente sì/no, allergie, accompagnatori (nome, cognome, adulto/bambino, allergie) |
| Immagini | Macro di kente generate con AI (Fal.ai, nano-banana-pro): `george-silvia/assets/img/hero*.{webp,jpg}` |
| Hosting | GitHub Pages, repo `wedding-sites-maker` (una cartella per matrimonio) |

## Struttura
```
george-silvia/
  index.html  style.css  main.js  i18n.js     sito (statico, GSAP + Lenis da CDN)
  assets/george-silvia.ics                    evento calendario (Apple/Outlook)
  assets/img/                                 hero, hero-portrait, og.jpg, favicon
  invito/invito.html                          invito A5 (+3 mm abbondanza): fronte, retro, fodera busta
  invito/invito-it.pdf, invito-en.pdf         PDF pronti per la tipografia
apps-script/Code.gs                           backend RSVP
```

## Animazioni (cosa c'è)
1. Intro: i fili dell'ordito si tendono, i blocchi kente si tessono riga per riga, al centro si disegna in oro l'Akoma Ntoaso ("cuori uniti"), poi il tessuto si apre a sipario sull'hero. Si può saltare.
2. Hero: lamina oro dei nomi con riflesso che segue il mouse, nomi che entrano sfocati, parallasse.
3. Countdown con cifre che scorrono · nastri kente che scorrono con lo scroll · titoli che salgono dalla maschera.
4. Programma: filo d'oro che si tesse durante lo scroll, simboli Adinkra disegnati a tratto.
5. RSVP: carte Sì/No che ruotano, accompagnatori dinamici, coriandoli kente alla conferma.
- Rispetta `prefers-reduced-motion`. Se il JS fallisce, la pagina resta leggibile e l'intro sparisce dopo 10 s.

## Da fare per andare live (Samuel)
### 1. Attivare il database RSVP (10 minuti)
1. Crea un Foglio Google, ad es. "RSVP George & Silvia".
2. Menu **Estensioni → Apps Script**. Cancella il codice e incolla `apps-script/Code.gs`. Salva.
3. Seleziona la funzione `setup` ed esegui **Esegui** una volta (autorizza l'accesso al foglio). Si creano i tab "Risposte" e "Riepilogo".
4. **Esegui il deployment → Nuovo deployment → Tipo: App web**. Esegui come: **Me**. Chi ha accesso: **Chiunque**. Copia l'URL che finisce con `/exec`.
5. Incolla l'URL in `george-silvia/main.js`, riga `SCRIPT_URL: ""`. Commit e push.
6. Prova: invia una risposta con 2 accompagnatori → devono comparire 3 righe in "Risposte".
7. Agli sposi: **Condividi** il foglio con la loro email come **Visualizzatore** (o "Chiunque abbia il link: visualizzatore"). Vedono nomi e cognomi in tempo reale; "Riepilogo" ha i conteggi (presenti, adulti, bambini, assenti, allergie).

Nota: se modifichi `Code.gs` dopo il deploy, serve **Gestisci deployment → Modifica → Nuova versione** (l'URL resta lo stesso).

### 2. Confermare con gli sposi (segnaposto attuali)
- **Scadenza RSVP:** ora "30 giugno 2027" in `i18n.js` (`rs.note`) e nell'invito (`invito.html`, testo `rsvp2`).
- Testo invito ("Insieme alle loro famiglie…"), eventuali nomi dei genitori.
- Contatto di riferimento (telefono) se lo vogliono sul sito o sull'invito.

### 3. Invito cartaceo
- Rigenerare i PDF dopo modifiche: servire la cartella (`python -m http.server 5173` dalla root) e lanciare l'export Playwright (vedi sezione Comandi).
- Per la tipografia: formato finito A5 148×210 mm, PDF con 3 mm di abbondanza (154×216 mm). Nomi in oro: chiedere **lamina a caldo oro** sulla scritta GEORGE & SILVIA (serve un file vettoriale separato per la lamina, da preparare quando si sceglie la tipografia). Pagina 3 = fodera busta.

## Comandi
```powershell
# anteprima locale (dalla root del progetto)
python -m http.server 5173 --bind 127.0.0.1
# poi apri http://localhost:5173/george-silvia/
```
Export PDF invito: script Playwright (Chrome) che apre `invito.html?lang=it|en` e stampa con `prefer_css_page_size=True`.

## Link
- Sito: https://samuelgarbarino.github.io/wedding-sites-maker/george-silvia/
- Repo: https://github.com/SamuelGarbarino/wedding-sites-maker

## Note / rischi
- Il repo è pubblico (serve per GitHub Pages gratis): contiene solo dati già pubblici sul sito. L'URL Apps Script è pubblico per natura; c'è un campo honeypot anti-bot, nessun captcha.
- La mappa è un embed Google Maps senza API key.
- In locale (localhost) senza `SCRIPT_URL` il modulo simula l'invio; online mostra un errore finché l'URL non è impostato.
