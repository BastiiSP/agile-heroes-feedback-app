function doGet(e) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  if (e.parameter.action === "getTrainers") {
      const trainerSheet = ss.getSheetByName("Trainer");
      if (!trainerSheet) return
  ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
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

   if (e.parameter.action === "getTrainers") {
    const trainerSheet = ss.getSheetByName("Trainer");
    if (!trainerSheet) return
  ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);
    const rows = trainerSheet.getDataRange().getValues();
    const names = rows.slice(1).map(row => row[0]).filter(String); // Spalte A = Name
    const unique = [...new Set(names)];
    return ContentService.createTextOutput(JSON.stringify(unique)).setMimeType(ContentService.MimeType.JSON);
  }

  const sheet = ss.getSheetByName("Feedback");
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