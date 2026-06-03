// Spalten im Tab "Feedback" – müssen exakt zum Mapping in lib/appsScript.ts
// (loadFeedback) passen. Die Reihenfolge ist die Soll-Reihenfolge, wenn die
// Header-Zeile neu angelegt wird; fehlende Spalten werden rechts ergänzt.
const FEEDBACK_HEADERS = [
  "Zeitstempel",
  "Ausbildung",
  "Modul",
  "Trainer",
  "Name",
  "Inhalte ★",
  "Didaktik ★",
  "Aufbau ★",
  "Trainer ★",
  "Inhalte Kommentar",
  "Didaktik Kommentar",
  "Aufbau Kommentar",
  "Trainer Kommentar",
  "Erkenntnis",
  "Ausprobieren",
  "Take-away"
];

function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const action = e.parameter.action;

  // Schreibpfad: Feedback-Einreichung aus der App
  // (GET-Vertrag aus lib/appsScript.ts: ?action=submit&data=<JSON FeedbackEntry>)
  if (action === "submit") {
    return handleSubmit(ss, e.parameter.data);
  }

  if (action === "getTrainers") {
    const trainerSheet = ss.getSheetByName("Trainer");
    if (!trainerSheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const rows = trainerSheet.getDataRange().getValues();
    const seen = {};
    const trainers = [];
    rows.slice(1).forEach(row => {                  // Kopfzeile überspringen
      const name = String(row[0] || "").trim();     // Spalte A = Vollname
      const rufname = String(row[1] || "").trim();  // Spalte B = Rufname
      if (!name || seen[name]) return;              // leere Zeilen + Duplikate raus
      seen[name] = true;
      trainers.push({ name: name, rufname: rufname });
    });
    return ContentService.createTextOutput(JSON.stringify(trainers)).setMimeType(ContentService.MimeType.JSON);
  }

  // Lesepfad: alle Feedback-Zeilen als JSON (Keys = Header-Zeile)
  const sheet = ss.getSheetByName("Feedback");
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  const rows = sheet.getDataRange().getValues();
  if (rows.length === 0) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h] = row[i]);
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

// Schreibt eine Feedback-Einreichung in den Tab "Feedback".
// Header-basiert: Die Werte werden über die Spaltennamen der Kopfzeile
// zugeordnet, damit eine Umsortierung der Spalten nichts kaputt macht.
// Fehlende Spalten (z.B. das neue "Ausbildung") werden automatisch rechts
// ergänzt; existiert der Tab oder die Kopfzeile noch nicht, wird beides
// angelegt. Bei Erfolg kommt {"status":"ok"} zurück – die App wertet jede
// Antwort mit "error"/"exception"/HTML als Fehlschlag.
function handleSubmit(ss, data) {
  const entry = JSON.parse(data || "{}");
  const ratings = entry.ratings || {};
  const followUps = entry.followUps || {};
  const openAnswers = entry.openAnswers || {};
  const values = {
    "Zeitstempel": entry.timestamp || "",
    "Ausbildung": entry.ausbildung || "",
    "Modul": entry.module || "",
    "Trainer": entry.trainer || "",
    "Name": entry.name || "",
    "Inhalte ★": ratings.inhalt || "",
    "Didaktik ★": ratings.didaktik || "",
    "Aufbau ★": ratings.gestaltung || "",
    "Trainer ★": ratings.trainer || "",
    "Inhalte Kommentar": followUps.inhalt || "",
    "Didaktik Kommentar": followUps.didaktik || "",
    "Aufbau Kommentar": followUps.gestaltung || "",
    "Trainer Kommentar": followUps.trainer || "",
    "Erkenntnis": openAnswers.erkenntnis || "",
    "Ausprobieren": openAnswers.ausprobieren || "",
    "Take-away": openAnswers.takeaway || ""
  };

  // Lock gegen verschränkte Schreibzugriffe bei gleichzeitigen Einreichungen
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    let sheet = ss.getSheetByName("Feedback");
    if (!sheet) sheet = ss.insertSheet("Feedback");

    let headers = sheet.getLastColumn() > 0
      ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0].map(String)
      : [];
    const missing = FEEDBACK_HEADERS.filter(h => headers.indexOf(h) === -1);
    if (missing.length > 0) {
      headers = headers.concat(missing);
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }

    const row = headers.map(h => Object.prototype.hasOwnProperty.call(values, h) ? values[h] : "");
    sheet.appendRow(row);
  } finally {
    lock.releaseLock();
  }

  return ContentService.createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
