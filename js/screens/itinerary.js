'use strict';

const ItineraryScreen = (() => {
  let root;

  // Persist expanded state across navigations (fix #1)
  function getStampExpanded() {
    try { return sessionStorage.getItem('stampExpanded') === 'true'; } catch(_) { return false; }
  }
  function setStampExpanded(v) {
    try { sessionStorage.setItem('stampExpanded', v); } catch(_) {}
  }

  const SEG_COLOR = {
    kumano: '#2B41B0', alpine: '#2A7A4B', hakuba: '#1E6FA8', osaka: '#888888'
  };

  // Tabler icon class per transport type (fix #3 — needs Tabler CDN in index.html)
  const TRANSPORT_ICON_CLS = {
    plane:  'ti-plane',
    train:  'ti-train',
    bus:    'ti-bus',
    walk:   'ti-walk',
    boat:   'ti-anchor',
    cable:  'ti-arrow-up-circle',
  };

  function badge(status) {
    const m = {
      booked:  ['badge-booked',  '✓ Booked'],
      pending: ['badge-pending', 'Pending'],
      urgent:  ['badge-urgent',  '⚡ Urgent'],
      open:    ['badge-open',    'Open'],
    };
    const [cls, lbl] = m[status] || m.open;
    return `<span class="badge ${cls}">${lbl}</span>`;
  }

  /* ─── Stamp banner ─────────────────────────────────────── */
  function stampBanner() {
    try {
      const expanded = getStampExpanded();
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
          <i class="ti ${expanded ? 'ti-chevron-up' : 'ti-chevron-down'} stamp-chevron"></i>
        </div>`;
      header.addEventListener('click', () => {
        setStampExpanded(!getStampExpanded());
        render();
      });

      const bar = document.createElement('div');
      bar.className = 'stamp-progress-bar';
      bar.innerHTML = `<div class="stamp-progress-fill" style="width:${p.total ? Math.round(p.collected/p.total*100) : 0}%"></div>`;

      wrap.appendChild(header);
      wrap.appendChild(bar);

      if (expanded) {
        const grid = document.createElement('div');
        grid.className = 'stamp-grid';
        stamps.forEach(stop => {
          const collected = Data.isStampCollected(stop.id);
          const dot = document.createElement('button');
          dot.className = `stamp-dot ${collected ? 'stamp-dot--collected' : ''} ${stop.isSanzan ? 'stamp-dot--sanzan' : ''}`;
          dot.innerHTML = `
            <span class="stamp-kanji">${stop.stampKanji}</span>
            <span class="stamp-romaji">${stop.stampRomaji}</span>
            ${stop.isSanzan ? `<span class="stamp-tag">S${stop.sanzanNum}</span>` : ''}`;
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
    } catch(e) {
      console.error('[stampBanner]', e);
      const fallback = document.createElement('div');
      fallback.style.cssText = 'padding:12px;font-size:12px;color:var(--text-muted)';
      fallback.textContent = 'Pilgrim passport loading…';
      return fallback;
    }
  }

  /* ─── Day header — bigger, more distinct (fix #4) ───────── */
  function dayHeader(day, stops) {
    const wrap = document.createElement('div');
    wrap.className = 'tl-day-block';

    // Prominent date pill + date text
    wrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:2px">
        <div class="tl-day-pill"><span class="tl-day-label">${day.label}</span></div>
        <span class="tl-day-date">${day.date}</span>
      </div>
      <p class="tl-day-title-text">${day.title}</p>`;

    // Weather strip
    const wxStop = stops.find(s => s.lat && s.lng);
    if (wxStop && navigator.onLine) {
      const wxEl = document.createElement('div');
      wxEl.className = 'wx-container';
      wxEl.style.paddingLeft = '0';
      wrap.appendChild(wxEl);
      Weather.renderStrip(wxEl, wxStop.lat, wxStop.lng, wxStop.name);
    }

    const divider = document.createElement('div');
    divider.className = 'tl-day-divider';
    wrap.appendChild(divider);

    return wrap;
  }

  /* ─── Timeline stop row ────────────────────────────────── */
  function stopRow(stop, isLast) {
    const day = Data.getDays().find(d => d.id === stop.dayId);
    const iconCls = TRANSPORT_ICON_CLS[stop.transportType] || 'ti-map-pin';
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
        <div class="tl-icon-circle" style="border-color:${segColor};color:${segColor}">
          <i class="ti ${iconCls}"></i>
        </div>
        ${!isLast ? '<div class="tl-line"></div>' : ''}
      </div>
      <div class="tl-content">
        <div class="tl-name-row">
          <p class="tl-name">${stop.name}</p>
          ${stop.hasStamp ? `<span class="tl-stamp-dot ${stampCollected ? 'tl-stamp-dot--on' : ''}" title="Pilgrim stamp">判</span>` : ''}
        </div>
        <p class="tl-activity">${stop.activity}</p>
        ${stop.transport ? `
          <div class="tl-transport">
            <i class="ti ${iconCls}"></i>
            <span>${stop.transport}</span>
          </div>` : ''}
        ${stop.trainDetail?.platform ? `<p style="font-size:10px;color:var(--text-muted);margin-top:2px;padding-left:18px">Platform ${stop.trainDetail.platform}${stop.trainDetail.car ? ` · Car ${stop.trainDetail.car}` : ''}${stop.trainDetail.jrPass ? ' · JR Pass ✓' : ''}</p>` : ''}
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
    try {
      root.innerHTML = '';
      root.appendChild(stampBanner());

      Data.getDays().forEach(day => {
        const stops = Data.getStopsByDay(day.id);
        if (!stops.length) return;
        root.appendChild(dayHeader(day, stops));
        stops.forEach((s, i) => root.appendChild(stopRow(s, i === stops.length - 1)));
      });
    } catch(e) {
      console.error('[ItineraryScreen.render]', e);
    }
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.ItineraryScreen = ItineraryScreen;
