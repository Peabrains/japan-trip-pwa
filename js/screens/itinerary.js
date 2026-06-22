'use strict';

const ItineraryScreen = (() => {
  let root;
  let stampExpanded = false;
  const TRANSPORT_ICON = { plane:'ti-plane', train:'ti-train', bus:'ti-bus', walk:'ti-walk', boat:'ti-anchor', cable:'ti-roller-coaster' };
  const SEG_COLOR = { kumano:'var(--seg-kumano)', alpine:'var(--seg-alpine)', hakuba:'var(--seg-hakuba)', osaka:'var(--seg-osaka)' };

  function badge(status) {
    const m = { booked:['badge-booked','✓ Booked'], pending:['badge-pending','Pending'], urgent:['badge-urgent','⚡ Urgent'], open:['badge-open','Open'] };
    const [cls, lbl] = m[status] || m.open;
    return `<span class="badge ${cls}">${lbl}</span>`;
  }

  /* ─── Stamp banner ─────────────────────────────────────── */
  function stampBanner() {
    const p = Data.getStampProgress();
    const stamps = Data.getStampStops();
    const wrap = document.createElement('div');
    wrap.className = 'stamp-banner';

    const header = document.createElement('div');
    header.className = 'stamp-header';
    header.innerHTML = `
      <div class="stamp-header-left">
        <span class="stamp-title">御朱印帳</span>
        <span class="stamp-sub">Pilgrim Passport</span>
      </div>
      <div class="stamp-header-right">
        <span class="stamp-count">${p.collected}/${p.total}</span>
        <span class="stamp-sanzan">Sanzan ${p.sanzanCollected}/${p.sanzanTotal}</span>
        <i class="ti ${stampExpanded ? 'ti-chevron-up' : 'ti-chevron-down'} stamp-chevron"></i>
      </div>`;
    header.addEventListener('click', () => { stampExpanded = !stampExpanded; render(); });

    const bar = document.createElement('div');
    bar.className = 'stamp-progress-bar';
    bar.innerHTML = `<div class="stamp-progress-fill" style="width:${p.total ? Math.round(p.collected/p.total*100) : 0}%"></div>`;

    wrap.appendChild(header);
    wrap.appendChild(bar);

    if (stampExpanded) {
      const grid = document.createElement('div');
      grid.className = 'stamp-grid';
      stamps.forEach(stop => {
        const collected = Data.isStampCollected(stop.id);
        const dot = document.createElement('button');
        dot.className = `stamp-dot ${collected ? 'stamp-dot--collected' : ''} ${stop.isSanzan ? 'stamp-dot--sanzan' : ''}`;
        dot.innerHTML = `<span class="stamp-kanji">${stop.stampKanji}</span><span class="stamp-romaji">${stop.stampRomaji}</span>${stop.isSanzan ? `<span class="stamp-tag">S${stop.sanzanNum}</span>` : ''}`;
        dot.addEventListener('click', async (e) => {
          e.stopPropagation();
          const now = await Data.toggleStamp(stop.id);
          const prog = Data.getStampProgress();
          if (prog.sanzanComplete && now && stop.isSanzan && stop.sanzanNum === 3) {
            Toast.show('三山達成 — Kumano Sanzan complete!', 'success');
          } else {
            Toast.show(now ? `${stop.name} stamp collected` : `${stop.name} uncollected`, now ? 'success' : 'info');
          }
          render();
        });
        grid.appendChild(dot);
      });
      wrap.appendChild(grid);
      wrap.insertAdjacentHTML('beforeend', '<p class="stamp-hint">Tap to collect · Red border = Kumano Sanzan</p>');
    }
    return wrap;
  }

  /* ─── Day header with weather ──────────────────────────── */
  function dayHeader(day, stops) {
    const wrap = document.createElement('div');
    const h = document.createElement('div');
    h.className = 'tl-day-header';
    h.innerHTML = `<span class="tl-day-label">${day.label}</span><span class="tl-day-date">${day.date.toUpperCase()}</span><span class="tl-day-title">— ${day.title}</span>`;
    wrap.appendChild(h);

    // Weather strip for first stop that has coords
    const wxStop = stops.find(s => s.lat && s.lng);
    if (wxStop && navigator.onLine) {
      const wxEl = document.createElement('div');
      wxEl.className = 'wx-container';
      wrap.appendChild(wxEl);
      Weather.renderStrip(wxEl, wxStop.lat, wxStop.lng, wxStop.name);
    }
    return wrap;
  }

  /* ─── Timeline stop row ────────────────────────────────── */
  function stopRow(stop, isLast) {
    const day = Data.getDays().find(d => d.id === stop.dayId);
    const iconCls = TRANSPORT_ICON[stop.transportType] || 'ti-map-pin';
    const stampCollected = stop.hasStamp && Data.isStampCollected(stop.id);
    const segColor = SEG_COLOR[stop.segment] || 'var(--text-muted)';

    const row = document.createElement('div');
    row.className = 'tl-row';
    row.innerHTML = `
      <div class="tl-time">
        <span class="tl-time-val">${stop.time || '—'}</span>
        <span class="tl-time-tz">${stop.timeZone || ''}</span>
      </div>
      <div class="tl-connector">
        <div class="tl-icon-circle" style="border-color:${segColor}30;color:${segColor}">
          <i class="ti ${iconCls}" style="font-size:13px"></i>
        </div>
        ${!isLast ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-content">
        <div class="tl-name-row">
          <p class="tl-name">${stop.name}</p>
          ${stop.hasStamp ? `<span class="tl-stamp-dot ${stampCollected ? 'tl-stamp-dot--on' : ''}" title="Pilgrim stamp">判</span>` : ''}
        </div>
        <p class="tl-activity">${stop.activity}</p>
        ${stop.transport ? `<p class="tl-transport">${stop.transport}</p>` : ''}
        ${stop.accommodation ? `<p class="tl-accommodation"><i class="ti ti-moon" style="font-size:11px;vertical-align:-1px"></i> ${stop.accommodation}</p>` : ''}
        ${stop.notes ? `<p class="tl-note">${stop.notes}</p>` : ''}
        <div class="tl-footer">${badge(stop.booking.status)}</div>
      </div>`;

    row.addEventListener('click', () => BottomSheet.openStop(stop, day));
    return row;
  }

  /* ─── Render ───────────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(stampBanner());
    Data.getDays().forEach(day => {
      const stops = Data.getStopsByDay(day.id);
      if (!stops.length) return;
      root.appendChild(dayHeader(day, stops));
      stops.forEach((s, i) => root.appendChild(stopRow(s, i === stops.length - 1)));
    });
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.ItineraryScreen = ItineraryScreen;
