'use strict';

const App = (() => {
  const SCREENS = {
    itinerary: () => window.ItineraryScreen,
    map:       () => window.MapScreen,
    bookings:  () => window.BookingsScreen,
    sos:       () => window.SOSScreen,
  };

  let currentScreen = null;
  let currentModule = null;

  /* ─── Screen switch ─────────────────────────────────────── */
  function switchTo(name) {
    if (!(name in SCREENS)) return;
    currentModule?.destroy?.();
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b.dataset.screen === name));
    const el = document.getElementById('screen-content');
    el.innerHTML = '';
    el.scrollTop = 0;
    el.classList.toggle('map-active', name === 'map');
    currentScreen = name;
    currentModule = SCREENS[name]();
    currentModule.init(el);
    try { sessionStorage.setItem('lastScreen', name); } catch(_) {}
  }

  /* ─── Sync status ───────────────────────────────────────── */
  function updateSyncStatus(state) {
    const el = document.getElementById('sync-badge');
    if (!el) return;
    const m = {
      synced:  ['badge-booked',  'Synced'],
      syncing: ['badge-pending', 'Syncing…'],
      offline: ['badge-open',    'Offline'],
      error:   ['badge-urgent',  'Sync error'],
    };
    const [cls, txt] = m[state] || m.offline;
    el.className = `badge ${cls}`;
    el.textContent = txt;
  }

  /* ─── Conflict UI ───────────────────────────────────────── */
  let _remoteConflict = null;

  function showConflict(remote) {
    _remoteConflict = remote;
    let banner = document.getElementById('conflict-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'conflict-banner';
      banner.className = 'conflict-banner';
      document.getElementById('app').insertBefore(banner, document.getElementById('screen-content'));
    }
    banner.innerHTML = `
      <p class="conflict-msg">⚠ Google Sheet was updated while you had offline changes.</p>
      <div class="conflict-btns">
        <button id="conflict-keep" class="btn btn-ghost" style="font-size:11px;min-height:32px">Keep mine</button>
        <button id="conflict-remote" class="btn btn-primary" style="font-size:11px;min-height:32px">Use Sheet</button>
      </div>
    `;
    banner.style.display = 'flex';
    document.getElementById('conflict-keep').onclick   = () => Sync.keepLocal();
    document.getElementById('conflict-remote').onclick = () => Sync.acceptRemote(_remoteConflict);
  }

  function hideConflict() {
    const b = document.getElementById('conflict-banner');
    if (b) b.style.display = 'none';
  }

  /* ─── Urgent badge ──────────────────────────────────────── */
  function updateUrgentBadge() {
    const el = document.getElementById('urgent-count');
    if (!el) return;
    const { urgent } = Data.getStats();
    el.textContent = urgent;
    el.style.display = urgent > 0 ? 'flex' : 'none';
  }

  /* ─── Connectivity watch ────────────────────────────────── */
  function watchConnectivity() {
    const update = async () => {
      if (navigator.onLine) {
        updateSyncStatus('synced');
        if (Config.GAS_URL) {
          await Sync.push(); // flush any queued offline changes
        }
      } else {
        updateSyncStatus('offline');
      }
    };
    window.addEventListener('online',  update);
    window.addEventListener('offline', update);
  }

  /* ─── Service worker ────────────────────────────────────── */
  function registerSW() {
    if (!('serviceWorker' in navigator)) return;
    navigator.serviceWorker.register('./sw.js').then(reg => {
      console.log('[SW] registered', reg.scope);
    }).catch(err => console.warn('[SW]', err));
  }

  /* ─── Init ──────────────────────────────────────────────── */
  async function init() {
    registerSW();

    // Boot data from IndexedDB (or seed)
    await DB.init();
    await Data.init();

    watchConnectivity();
    updateUrgentBadge();
    updateSyncStatus(navigator.onLine ? 'synced' : 'offline');

    // Wire nav
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', () => switchTo(btn.dataset.screen));
    });

    // Wire sync button
    document.getElementById('sync-btn')?.addEventListener('click', async () => {
      if (!Config.GAS_URL) {
        Toast.show('Set GAS_URL in js/config.js first', 'warning');
        return;
      }
      await Sync.sync();
      currentModule?.refresh?.();
      updateUrgentBadge();
    });

    // Countdown
    const trip = new Date(Config.TRIP_DATE);
    const diff = Math.ceil((trip - new Date()) / 864e5);
    const el   = document.getElementById('countdown');
    if (el && diff > 0) el.textContent = `${diff} days to go`;

    // Start on last visited screen
    let start = 'itinerary';
    try { start = sessionStorage.getItem('lastScreen') || 'itinerary'; } catch(_) {}
    switchTo(start);

    // Pull latest data in background if online
    if (navigator.onLine && Config.GAS_URL) {
      setTimeout(() => Sync.pull().then(() => currentModule?.refresh?.()), 1500);
    }
  }

  return { init, switchTo, updateSyncStatus, updateUrgentBadge, showConflict, hideConflict };
})();

document.addEventListener('DOMContentLoaded', App.init);
window.App = App;
