# HANDOFF — Wedding Sites Maker · George & Silvia

Ultimo aggiornamento: 27/11/2026 (sera)

## Riparti da qui
Stato (27/11/2026): sito online con la dissolvenza WebGL nell'hero (il bordo segue lo scroll e resta visibile, avorio al massimo ~1/3 di schermo) e le correzioni della revisione UX/UI; invito PDF IT/EN pronto; RSVP non ancora attivo (manca il deploy di Apps Script da parte di Samuel).
- **Shader:** adattato da `Ironhill-section-rebuild-main/` in WebGL puro (niente Three.js), funzione `heroVeil()` in `main.js`, canvas `.hero__veil`. Disattivato con `prefers-reduced-motion`; senza WebGL il canvas viene rimosso.
- **Revisione UX/UI fatta** (due agenti). Applicato: contrasti WCAG, target tattili da 44 px, nav più opaca, bottone RSVP smeraldo, localStorage protetto, timeout di 15 s sull'invio, focus sul primo campo errato, ARIA dell'intro, ancore `/#rsvp` dopo l'intro, "È oggi!" dopo la data.
- **Non fatto (scelte):** pulsante "Modifica risposta", intro solo alla prima visita, traduzione titolo mappa e dettagli calendario, contatto WhatsApp nel messaggio d'errore (serve il numero degli sposi).

**Fatto il 27/11 (notte):**
- Programma ridisegnato: sezione avorio, nastro oro pieno che si allunga e si ritrae con lo scroll dietro le card (come su bysamlab.com: scrub 0.5, da "top 78%" a "bottom 58%"). Attenzione: le animazioni di `strokeDashoffset` con `pathLength=1` vogliono `autoRound: false`, altrimenti GSAP arrotonda a 0/1 e il tratto scatta. Percorso calcolato in JS (`ribbon()` in `main.js`): desktop passa dal centro delle card, mobile nella fascia libera accanto alle illustrazioni.
- 5 illustrazioni (rifatte il 27/11: sposa con capelli ricci senza copricapo, sposo ispirato alla foto di Samuel, pranzo seduti con i piatti, festa piena di invitati di diverse origini, senza tamburo) (cerimonia, aperitivo, pranzo, torta, festa) generate con Gemini via Claude in Chrome: `george-silvia/assets/img/tl-1..5.webp` (originali in `Documents/Media Gen/2026-11-27-gemini-timeline/`). Fondo bianco + `mix-blend-mode: multiply` sull'avorio.
- Icone Phosphor Light (MIT) inline nello sprite SVG: Sì/No, aggiungi/rimuovi accompagnatore, invia, calendario, indicazioni, copia.
- "RSVP" nel menu sostituito da "Conferma presenza" / "Reply".

**Fatto (27/11, commit `eab84d0`): titolo dell'hero sul modello "Welcome to our traditional marriage" (riferimento TikTok Veloradesignsuk), ma con i nomi molto più grandi.** Piano:
- Gerarchia: 1) "Akwaaba" in corsivo oro ("benvenuti" in twi, stessa parola in IT/EN, `lang="ak"`); 2) etichetta maiuscola tra due filetti oro "Benvenuti al matrimonio tradizionale di" / "Welcome to the traditional wedding of", che fa anche da traduzione di Akwaaba; 3) nomi H1 come ora (restano l'elemento dominante); 4) "Insieme alle loro famiglie vi invitano a festeggiare" / "Together with their families, they invite you to celebrate"; 5) data e luogo come ora.
- Scartato "Sei stato invitato/a": la barra pesa e sembra un modulo; il plurale "vi" copre tutti.
- File: `index.html` (hero), `i18n.js` (hero.kicker, hero.lead nuova, hero.invite), `style.css` (`.hero__lead` con filetti), `main.js` (aggiungere `.hero__lead` all'animazione d'ingresso). Verificato a 1366 e 375 px: tutto nel primo schermo; su mobile i filetti si nascondono e l'etichetta va su due righe bilanciate.

**Fatto il 27/11 (sera, commit `0f69697` e `e0fdebb`):**
- Logo "G & S" nella nav più marcato (28 px, `-webkit-text-stroke`, altezza 44 px).
- Programma: in ogni card prima il nome del momento (Italiana grande, smeraldo, h3), poi l'orario in DM Sans 500 con inizio e fine della stessa misura (la fine più leggera e più tenue, contrasto AA 4.65:1), poi la descrizione.
- Nomi dell'hero: variante F scelta da Samuel tra 7 proposte (artefatto https://claude.ai/artifact/1gyMcFFzqtWuPbxJk5XHM8): Cormorant Garamond corsivo 500 in lamina, George a sinistra e Silvia a destra, & grande trasparente dietro. Larghezza `.names` limitata a 4.6em, altrimenti a schermi medi i nomi finiscono ai due bordi.
- "Benvenuti al matrimonio tradizionale di" spostato dall'hero alla fine dell'intro (`.intro__lead`, sotto il medaglione, su fondo smeraldo). Nell'hero restano Akwaaba, nomi, invito, data, luogo. Con `prefers-reduced-motion` l'intro non c'è e la frase non si vede.
- Sezione Dove: niente più iframe Google Maps. Mappa SVG illustrata ricalcata da OpenStreetMap (villa a 45.51508, 10.31151): via Mazzini/SS45bis, parco della villa, ferrovia, tangenziale sud, A4, colli (Colle San Pietro, Monte Regogna), Rezzato, Brescia, Botticino, bussola. Animazione GSAP: zone, strade, percorso oro, spillo che cade. Su mobile la mappa è quadrata (le etichette stanno tra x 175 e 625 del viewBox).
- Critica dell'hero con 3 agenti EGM (zoom-out, comprehension, inventive-catalyst). Consigli NON ancora applicati: togliere "Insieme alle loro famiglie vi invitano a festeggiare", data e luogo su una riga con il mese in lettere, & più visibile, logo G&S quasi invisibile su desktop sopra l'hero (da capire), "Conferma presenza" su due righe nella nav mobile.

Prossimo passo: decidere con Samuel quali consigli degli agenti applicare all'hero; poi prova su un telefono vero (nastro, illustrazioni, mappa) (finora solo browser desktop e simulazione 375 px). Poi: deploy Apps Script e test di una RSVP reale; confermare scadenza e testi con gli sposi.

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
