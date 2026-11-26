/**
 * RSVP George & Silvia — backend Google Sheets.
 * Incollare in: Foglio Google > Estensioni > Apps Script. Deploy come App web
 * (Esegui come: Me · Chi ha accesso: Chiunque). Istruzioni complete in HANDOFF.md.
 *
 * Scrive UNA RIGA PER PERSONA nel foglio "Risposte" e tiene i conteggi in "Riepilogo".
 */
const HEADERS = ['Data/ora', 'ID gruppo', 'Ruolo', 'Nome', 'Cognome', 'Presente', 'Età', 'Allergie/intolleranze', 'Referente', 'Lingua'];
const MAX_GUESTS = 15;

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json({ ok: true }); // honeypot: bot

    const nome = clean(d.nome, 60), cognome = clean(d.cognome, 60);
    const presente = d.presente === 'si' ? 'Sì' : d.presente === 'no' ? 'No' : '';
    if (!nome || !cognome || !presente) return json({ ok: false, error: 'campi mancanti' });

    const guests = presente === 'Sì' && Array.isArray(d.accompagnatori) ? d.accompagnatori.slice(0, MAX_GUESTS) : [];
    const now = new Date();
    const id = Utilities.formatDate(now, 'Europe/Rome', 'yyMMdd-HHmmss') + '-' + Math.floor(Math.random() * 1000);
    const ref = nome + ' ' + cognome;
    const lingua = d.lingua === 'en' ? 'EN' : 'IT';

    const rows = [[now, id, 'Referente', nome, cognome, presente, 'Adulto', clean(d.allergie, 200), ref, lingua]];
    guests.forEach(function (g) {
      const gn = clean(g.nome, 60), gc = clean(g.cognome, 60);
      if (!gn || !gc) return;
      rows.push([now, id, 'Accompagnatore', gn, gc, 'Sì', g.tipo === 'bambino' ? 'Bambino' : 'Adulto', clean(g.allergie, 200), ref, lingua]);
    });

    const sh = sheets().risposte;
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return json({ ok: true, righe: rows.length });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, servizio: 'RSVP George & Silvia' });
}

/** Esegui una volta a mano per creare i fogli (facoltativo: lo fa anche il primo invio). */
function setup() {
  sheets();
}

function sheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let risposte = ss.getSheetByName('Risposte');
  if (!risposte) {
    risposte = ss.insertSheet('Risposte', 0);
    risposte.appendRow(HEADERS);
    risposte.setFrozenRows(1);
    risposte.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#0F4D3A').setFontColor('#F4EDE0');
    risposte.getRange('A:A').setNumberFormat('dd/MM/yyyy HH:mm');
  }
  if (!ss.getSheetByName('Riepilogo')) {
    const r = ss.insertSheet('Riepilogo', 1);
    // setFormula usa sempre la sintassi inglese (virgole), anche con il foglio in italiano
    const data = [
      ['Persone presenti', '=COUNTIF(Risposte!F2:F,"Sì")'],
      ['   di cui adulti', '=COUNTIFS(Risposte!F2:F,"Sì",Risposte!G2:G,"Adulto")'],
      ['   di cui bambini', '=COUNTIFS(Risposte!F2:F,"Sì",Risposte!G2:G,"Bambino")'],
      ['Non presenti', '=COUNTIF(Risposte!F2:F,"No")'],
      ['Presenti con allergie', '=COUNTIFS(Risposte!F2:F,"Sì",Risposte!H2:H,"?*")'],
      ['Risposte ricevute', '=COUNTUNIQUE(Risposte!B2:B)'],
    ];
    r.getRange(1, 1, data.length, 1).setValues(data.map(function (x) { return [x[0]]; }));
    data.forEach(function (x, i) { r.getRange(i + 1, 2).setFormula(x[1]); });
    r.getRange('A:A').setFontWeight('bold');
    r.setColumnWidth(1, 220);
  }
  return { risposte: risposte };
}

// Testo pulito, troncato, e protetto dall'iniezione di formule nel foglio.
function clean(v, max) {
  let s = String(v == null ? '' : v).replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
