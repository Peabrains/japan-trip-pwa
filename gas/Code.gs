/*
  JAPAN TRIP PWA — Google Apps Script
  =====================================
  Setup:
  1. Extensions → Apps Script → paste this entire file
  2. Deploy → New deployment → Web app
     Execute as: Me  |  Who has access: Anyone
  3. Authorise → copy the /exec URL
  4. Paste into js/config.js → GAS_URL: '...'

  Data lives in Script Properties as a single JSON blob.
  A human-readable "PWA Sync" sheet tab is written on every save.
*/

const PROP_KEY = 'japanTripData_v2';

/* ─── Router ──────────────────────────────────────────────── */
function doGet(e) {
  return respond(load() || { stops:[], stamps:[], expenses:[], packing:[], updatedAt:0 });
}

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents);
    const action  = payload.action;
    if (action === 'pushAll')       return respond(pushAll(payload.data));
    if (action === 'updateStop')    return respond(updateStop(payload.id, payload.patch));
    if (action === 'addStop')       return respond(addStop(payload.stop));
    if (action === 'deleteStop')    return respond(deleteStop(payload.id));
    if (action === 'collectStamp')  return respond(collectStamp(payload.id, payload.collected));
    if (action === 'addExpense')    return respond(addExpense(payload.expense));
    if (action === 'deleteExpense') return respond(deleteExpense(payload.id));
    if (action === 'togglePacking') return respond(togglePacking(payload.id, payload.checked));
    if (action === 'addPacking')    return respond(addPacking(payload.item));
    if (action === 'deletePacking') return respond(deletePacking(payload.id));
    return respondError('Unknown action: ' + action);
  } catch(err) {
    return respondError(err.toString());
  }
}

/* ─── Response helpers ────────────────────────────────────── */
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok:true, data, ts:Date.now() }))
    .setMimeType(ContentService.MimeType.JSON);
}
function respondError(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok:false, data:{ error:msg }, ts:Date.now() }))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ─── Storage ─────────────────────────────────────────────── */
function load() {
  const raw = PropertiesService.getScriptProperties().getProperty(PROP_KEY);
  return raw ? JSON.parse(raw) : null;
}
function save(data) {
  data.updatedAt = Date.now();
  PropertiesService.getScriptProperties().setProperty(PROP_KEY, JSON.stringify(data));
  try { writeSummarySheet(data); } catch(_) {}
  return data;
}
function loadOrInit() {
  return load() || { stops:[], stamps:[], expenses:[], packing:[], updatedAt:0 };
}

/* ─── Actions ─────────────────────────────────────────────── */
function pushAll(incoming) {
  /* Full replace — used on first sync and conflict resolution */
  return save({
    stops:    incoming.stops    || [],
    stamps:   incoming.stamps   || [],
    expenses: incoming.expenses || [],
    packing:  incoming.packing  || [],
  });
}

function updateStop(id, patch) {
  const data = loadOrInit();
  const idx  = data.stops.findIndex(function(s){ return s.id === id; });
  if (idx === -1) {
    /* Stop not found — the app's local data might be newer. Accept patch as new stop. */
    if (patch && patch.id) {
      data.stops.push(Object.assign({ updatedAt: Date.now() }, patch));
      return save(data);
    }
    return { warning: 'Stop not found: ' + id + ' (skipped)' };
  }
  data.stops[idx] = Object.assign({}, data.stops[idx], patch, { updatedAt: Date.now() });
  return save(data);
}

function addStop(stop) {
  const data = loadOrInit();
  const existing = data.stops.findIndex(function(s){ return s.id === stop.id; });
  if (existing === -1) data.stops.push(stop);
  return save(data);
}

function deleteStop(id) {
  const data  = loadOrInit();
  data.stops  = data.stops.filter(function(s){ return s.id !== id; });
  return save(data);
}

function collectStamp(stopId, collected) {
  const data = loadOrInit();
  data.stamps = data.stamps || [];
  if (collected) {
    if (data.stamps.indexOf(stopId) === -1) data.stamps.push(stopId);
  } else {
    data.stamps = data.stamps.filter(function(id){ return id !== stopId; });
  }
  return save(data);
}

function addExpense(expense) {
  const data = loadOrInit();
  data.expenses = data.expenses || [];
  data.expenses.push(expense);
  return save(data);
}

function deleteExpense(id) {
  const data    = loadOrInit();
  data.expenses = (data.expenses || []).filter(function(e){ return e.id !== id; });
  return save(data);
}

function togglePacking(id, checked) {
  const data = loadOrInit();
  data.packing = data.packing || [];
  const item   = data.packing.find(function(p){ return p.id === id; });
  if (item) item.checked = checked;
  return save(data);
}

function addPacking(newItem) {
  const data = loadOrInit();
  data.packing = data.packing || [];
  if (!data.packing.find(function(p){ return p.id === newItem.id; })) {
    data.packing.push(newItem);
  }
  return save(data);
}

function deletePacking(id) {
  const data   = loadOrInit();
  data.packing = (data.packing || []).filter(function(p){ return p.id !== id; });
  return save(data);
}

/* ─── Human-readable sheet summary ───────────────────────── */
function writeSummarySheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh   = ss.getSheetByName('PWA Sync');
  if (!sh) sh = ss.insertSheet('PWA Sync');
  sh.clearContents();

  sh.appendRow(['Last sync', new Date().toLocaleString()]);
  sh.appendRow(['Stops', (data.stops || []).length]);
  sh.appendRow(['Stamps collected', (data.stamps || []).length]);
  sh.appendRow(['Expenses logged', (data.expenses || []).length]);
  sh.appendRow([]);
  sh.appendRow(['Day','Stop name','Status','Ref','Cost (JPY)','Accommodation']);

  (data.stops || []).forEach(function(s) {
    sh.appendRow([
      s.dayId || '',
      s.name  || '',
      (s.booking && s.booking.status) || '',
      (s.booking && s.booking.ref)    || '',
      (s.booking && s.booking.cost)   || '',
      s.accommodation || '',
    ]);
  });
}

/* ─── Manual reset (run from Apps Script editor if needed) ── */
function resetData() {
  PropertiesService.getScriptProperties().deleteProperty(PROP_KEY);
  Logger.log('Data reset. Next app open will re-initialise.');
}
