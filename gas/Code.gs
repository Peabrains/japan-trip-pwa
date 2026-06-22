/*
  JAPAN TRIP PWA — Google Apps Script Backend
  ============================================
  Setup:
  1. Open your Google Sheet
  2. Extensions → Apps Script
  3. Paste this entire file, replacing any existing code
  4. Click Deploy → New deployment → Web app
  5. Execute as: Me | Who has access: Anyone
  6. Deploy → Copy the web app URL
  7. Paste that URL into js/config.js → GAS_URL

  The script stores all PWA data in Script Properties (JSON).
  It also writes a human-readable summary to a "PWA Sync" sheet tab.
*/

const PROP_KEY = 'japanTripData';

/* ─── Router ──────────────────────────────────────────────────── */
function doGet(e) {
  return respond(getData());
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;

    if (action === 'init')          return respond(initData(payload.data));
    if (action === 'updateStop')    return respond(updateStop(payload.id, payload.patch));
    if (action === 'collectStamp')  return respond(collectStamp(payload.id, payload.collected));
    if (action === 'addExpense')    return respond(addExpense(payload.expense));
    if (action === 'deleteExpense') return respond(deleteExpense(payload.id));
    if (action === 'togglePacking') return respond(togglePacking(payload.id, payload.checked));
    if (action === 'pushAll')       return respond(pushAll(payload.data));

    return respond({ error: 'Unknown action: ' + action });
  } catch(err) {
    return respond({ error: err.toString() });
  }
}

/* ─── CORS helper ─────────────────────────────────────────────── */
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: true, data, ts: Date.now() }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─── Data store (Script Properties) ─────────────────────────── */
function load() {
  const raw = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  return raw ? JSON.parse(raw) : null;
}

function save(data) {
  data.updatedAt = Date.now();
  PropertiesService.getScriptProperties().setProperty(PROP_KEY, JSON.stringify(data));
  writeSummarySheet(data);
  return data;
}

/* ─── Actions ─────────────────────────────────────────────────── */
function getData() {
  return load() || { stops:[], stamps:[], expenses:[], packing:[], updatedAt:0 };
}

function initData(seedData) {
  const existing = load();
  if (existing && existing.updatedAt > 0) {
    return { message: 'Data already initialised — use pushAll to overwrite', existing };
  }
  return save(seedData);
}

function pushAll(data) {
  return save(data);
}

function updateStop(id, patch) {
  const data = getData();
  const idx  = data.stops.findIndex(s => s.id === id);
  if (idx === -1) return { error: 'Stop not found: ' + id };
  data.stops[idx] = Object.assign({}, data.stops[idx], patch, { updatedAt: Date.now() });
  return save(data);
}

function collectStamp(stopId, collected) {
  const data = getData();
  if (!data.stamps) data.stamps = [];
  if (collected) {
    if (!data.stamps.includes(stopId)) data.stamps.push(stopId);
  } else {
    data.stamps = data.stamps.filter(id => id !== stopId);
  }
  return save(data);
}

function addExpense(expense) {
  const data = getData();
  if (!data.expenses) data.expenses = [];
  expense.id = 'exp_' + Date.now();
  expense.ts = Date.now();
  data.expenses.push(expense);
  return save(data);
}

function deleteExpense(id) {
  const data = getData();
  data.expenses = (data.expenses || []).filter(e => e.id !== id);
  return save(data);
}

function togglePacking(id, checked) {
  const data = getData();
  const item = (data.packing || []).find(p => p.id === id);
  if (item) item.checked = checked;
  return save(data);
}

/* ─── Human-readable summary sheet ───────────────────────────── */
function writeSummarySheet(data) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sh = ss.getSheetByName('PWA Sync');
    if (!sh) sh = ss.insertSheet('PWA Sync');
    sh.clearContents();

    sh.appendRow(['Last sync', new Date().toLocaleString()]);
    sh.appendRow(['Stops', (data.stops || []).length]);
    sh.appendRow(['Stamps collected', (data.stamps || []).length]);
    sh.appendRow(['Expenses logged', (data.expenses || []).length]);
    sh.appendRow([]);
    sh.appendRow(['Stop ID', 'Name', 'Booking status', 'Ref', 'Cost (JPY)']);

    (data.stops || []).forEach(s => {
      sh.appendRow([s.id, s.name, s.booking?.status, s.booking?.ref || '', s.booking?.cost || '']);
    });
  } catch(_) {}
}
