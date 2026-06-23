'use strict';

/* ============================================================
   SYNC
   Flow:
   1. push() — checks if GAS has data.
      - Empty → pushAll (first-time init) then clear queue
      - Has data → flush queued changes one by one
   2. pull() — fetches latest from GAS, overwrites local DB
   3. sync() — push then pull

   The "Synced" badge and toast only fire after a confirmed
   round-trip. Never on mere online detection.
   ============================================================ */

const Sync = (() => {

  /* ─── HTTP helpers ───────────────────────────────────────── */
  async function gasGet() {
    const url = Config.GAS_URL;
    if (!url) throw new Error('GAS_URL not configured in js/config.js');
    const res  = await fetch(url + '?t=' + Date.now());
    if (!res.ok) throw new Error(`GAS GET ${res.status}`);
    const json = await res.json();
    if (!json.ok) throw new Error(json.data?.error || 'GAS GET failed');
    return json.data;
  }

  async function gasPost(payload) {
    const url = Config.GAS_URL;
    if (!url) throw new Error('GAS_URL not configured in js/config.js');
    const res  = await fetch(url, { method:'POST', body: JSON.stringify(payload) });
    if (!res.ok) throw new Error(`GAS POST ${res.status}`);
    const json = await res.json();
    /* GAS returns ok:true even for app-level errors — check data.error */
    if (json.data?.error) throw new Error(json.data.error);
    return json.data;
  }

  /* ─── Push all local data (first-time init) ──────────────── */
  async function pushAll() {
    const stamps = [];
    (Data.getStampStops() || []).forEach(s => {
      if (Data.isStampCollected(s.id)) stamps.push(s.id);
    });
    return gasPost({
      action: 'pushAll',
      data: {
        stops:    Data.getStops(),
        stamps,
        expenses: Data.getExpenses(),
        packing:  Data.getPackingItems(),
        updatedAt: Date.now(),
      },
    });
  }

  /* ─── Push ───────────────────────────────────────────────── */
  async function push() {
    if (!Config.GAS_URL || !navigator.onLine) return false;
    App.updateSyncStatus('syncing');

    try {
      /* Step 1: check if GAS has been initialised */
      const remote = await gasGet();

      if (!remote.stops?.length) {
        /* GAS is empty — push everything */
        await pushAll();
        await DB.clearQueue();
        await DB.setLastSync(Date.now());
        App.updateSyncStatus('synced');
        Toast.show('Trip data saved to Google Sheet', 'success');
        return true;
      }

      /* Step 2: flush queued changes */
      const queue = await DB.loadQueue();
      if (!queue.length) {
        App.updateSyncStatus('synced');
        return true; /* nothing to push — not a toast-worthy event */
      }

      let failed = 0;
      for (const change of queue) {
        try { await gasPost(change); }
        catch(e) { console.warn('[Sync] change failed:', change, e); failed++; }
      }

      if (failed === 0) {
        await DB.clearQueue();
        await DB.setLastSync(Date.now());
        App.updateSyncStatus('synced');
        Toast.show('Changes saved to Google Sheet', 'success');
        return true;
      } else {
        App.updateSyncStatus('error');
        Toast.show(`${failed} change(s) failed to sync — will retry`, 'warning');
        return false;
      }

    } catch (err) {
      console.warn('[Sync] push error:', err);
      App.updateSyncStatus('error');
      Toast.show('Sync failed: ' + err.message, 'warning');
      return false;
    }
  }

  /* ─── Pull ───────────────────────────────────────────────── */
  async function pull() {
    if (!Config.GAS_URL || !navigator.onLine) return false;
    App.updateSyncStatus('syncing');

    try {
      const remote    = await gasGet();
      const lastSync  = await DB.getLastSync() || 0;
      const queue     = await DB.loadQueue();

      /* Conflict: remote changed after our last sync AND we have unsent local changes */
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
      if (Array.isArray(remote.stamps)) {
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
      if (remote.packing?.length) {
        await DB.savePacking(remote.packing);
        Data.setPackingItems(remote.packing);
      }

      await DB.setLastSync(Date.now());
      App.updateSyncStatus('synced');
      return true;

    } catch (err) {
      console.warn('[Sync] pull error:', err);
      /* Don't overwrite 'synced' badge if we're just offline */
      App.updateSyncStatus(navigator.onLine ? 'error' : 'offline');
      return false;
    }
  }

  /* ─── Full sync cycle ────────────────────────────────────── */
  async function sync() {
    const pushed = await push();
    if (pushed) await pull();
  }

  /* ─── Conflict resolution ────────────────────────────────── */
  async function acceptRemote(remote) {
    await DB.clearQueue();
    if (remote.stops?.length) { await DB.saveStops(remote.stops); Data.setStops(remote.stops); }
    if (remote.expenses)      { Data.setExpenses(remote.expenses); }
    await DB.setLastSync(Date.now());
    App.updateSyncStatus('synced');
    App.hideConflict();
    Toast.show('Synced with Google Sheet', 'success');
  }

  async function keepLocal() {
    App.hideConflict();
    /* Re-push our local state as a pushAll to overwrite remote */
    try {
      await pushAll();
      await DB.clearQueue();
      await DB.setLastSync(Date.now());
      App.updateSyncStatus('synced');
      Toast.show('Local changes pushed to Google Sheet', 'success');
    } catch(e) {
      Toast.show('Push failed: ' + e.message, 'warning');
    }
  }

  return { push, pull, sync, acceptRemote, keepLocal };
})();

window.Sync = Sync;
