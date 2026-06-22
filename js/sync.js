'use strict';

/* ============================================================
   SYNC — two-way sync between IndexedDB and GAS
   Pull: GAS → DB (on open, on manual refresh)
   Push: DB queue → GAS (on reconnect, on manual sync)
   ============================================================ */
const Sync = (() => {

  async function post(payload) {
    const url = Config.GAS_URL;
    if (!url) throw new Error('GAS_URL not set in config.js');
    const res = await fetch(url, {
      method: 'POST',
      body:   JSON.stringify(payload),
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.data?.error || 'Sync error');
    return json.data;
  }

  async function get() {
    const url = Config.GAS_URL;
    if (!url) throw new Error('GAS_URL not set');
    const res  = await fetch(url + '?t=' + Date.now());
    const json = await res.json();
    if (!json.ok) throw new Error('Fetch error');
    return json.data;
  }

  /* Push current local state up to GAS (first sync / init) */
  async function initRemote() {
    const stops    = Data.getStops();
    const stamps   = [...window._STAMPS_COLLECTED || []];
    const expenses = Data.getExpenses();
    const packing  = Data.getPackingItems();
    await post({ action:'initData', data:{ stops, stamps, expenses, packing } });
  }

  /* Pull remote data and merge into local */
  async function pull() {
    if (!Config.GAS_URL || !navigator.onLine) return false;
    App.updateSyncStatus('syncing');
    try {
      const remote     = await get();
      const localStops = await DB.loadStops();
      const lastSync   = await DB.getLastSync() || 0;

      /* Conflict check: if remote was updated after our last sync
         AND we have queued local changes → show conflict banner */
      const queue = await DB.loadQueue();
      if (remote.updatedAt > lastSync && queue.length > 0) {
        App.showConflict(remote);
        App.updateSyncStatus('error');
        return false;
      }

      /* Apply remote stops */
      if (remote.stops?.length) {
        await DB.saveStops(remote.stops);
        Data.setStops(remote.stops);
      }

      /* Apply remote stamps */
      if (remote.stamps) {
        for (const id of remote.stamps) {
          await DB.saveStamp(id, true);
          Data.setStampCollected(id, true);
        }
      }

      /* Apply remote expenses */
      if (remote.expenses) {
        for (const exp of remote.expenses) await DB.saveExpense(exp);
        Data.setExpenses(remote.expenses);
      }

      /* Apply remote packing */
      if (remote.packing) {
        await DB.savePacking(remote.packing);
        Data.setPackingItems(remote.packing);
      }

      await DB.setLastSync(Date.now());
      App.updateSyncStatus('synced');
      return true;
    } catch (err) {
      console.warn('[Sync] pull failed:', err);
      App.updateSyncStatus('offline');
      return false;
    }
  }

  /* Flush queued changes up to GAS */
  async function push() {
    if (!Config.GAS_URL || !navigator.onLine) return false;
    const queue = await DB.loadQueue();
    if (!queue.length) { App.updateSyncStatus('synced'); return true; }

    App.updateSyncStatus('syncing');
    try {
      for (const change of queue) {
        await post(change);
      }
      await DB.clearQueue();
      await DB.setLastSync(Date.now());
      App.updateSyncStatus('synced');
      Toast.show('Changes saved to Google Sheet', 'success');
      return true;
    } catch (err) {
      console.warn('[Sync] push failed:', err);
      App.updateSyncStatus('error');
      Toast.show('Sync failed — will retry when online', 'warning');
      return false;
    }
  }

  async function sync() {
    const pushed = await push();
    if (pushed) await pull();
  }

  /* Accept remote data in a conflict, discarding local queue */
  async function acceptRemote(remote) {
    await DB.clearQueue();
    if (remote.stops)    { await DB.saveStops(remote.stops);    Data.setStops(remote.stops); }
    if (remote.expenses) { Data.setExpenses(remote.expenses); }
    await DB.setLastSync(Date.now());
    App.updateSyncStatus('synced');
    App.hideConflict();
    Toast.show('Synced with Google Sheet', 'success');
  }

  /* Keep local changes, push to remote */
  async function keepLocal() {
    App.hideConflict();
    await push();
  }

  return { pull, push, sync, initRemote, acceptRemote, keepLocal };
})();

window.Sync = Sync;
