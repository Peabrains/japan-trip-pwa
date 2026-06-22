'use strict';

const SOSScreen = (() => {
  let root;

  function section(title, rows, iconName) {
    const div = document.createElement('div');
    div.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = title;
    div.appendChild(h);

    rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'card sos-item';
      const iconSpan = document.createElement('span');
      iconSpan.innerHTML = Icons[iconName]?.('icon-md') || '';
      iconSpan.style.color = 'var(--accent)';
      iconSpan.style.flexShrink = '0';
      const textDiv = document.createElement('div');
      textDiv.style.flex = '1';
      const label = document.createElement('p');
      label.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted)';
      label.textContent = row.label;
      const value = document.createElement('p');
      value.style.cssText = 'font-size:var(--text-sm);font-weight:500;color:var(--text-primary);margin-top:2px';
      value.textContent = row.value || row.jp || '';
      textDiv.appendChild(label);
      textDiv.appendChild(value);
      if (row.jp && row.value) {
        const jp = document.createElement('p');
        jp.style.cssText = 'font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px';
        jp.textContent = row.jp;
        textDiv.appendChild(jp);
      }
      item.appendChild(iconSpan);
      item.appendChild(textDiv);

      // Copy button
      const copyText = row.value || row.jp || '';
      if (copyText && copyText !== 'Confirm when collected') {
        const copyBtn = document.createElement('button');
        copyBtn.style.cssText = 'background:var(--surface-raised);border:1px solid var(--border);border-radius:var(--r-sm);padding:3px 8px;font-size:var(--text-xs);color:var(--text-secondary);flex-shrink:0;cursor:pointer;font-family:var(--font)';
        copyBtn.textContent = 'Copy';
        copyBtn.addEventListener('click', () => {
          const full = row.jp ? `${row.value || ''}\n${row.jp}` : copyText;
          navigator.clipboard?.writeText(full).then(() => {
            copyBtn.textContent = '✓';
            setTimeout(() => copyBtn.textContent = 'Copy', 1500);
            Toast.show(`Copied: ${row.label}`, 'success');
          }).catch(() => Toast.show('Copy failed', 'warning'));
        });
        item.appendChild(copyBtn);
      }
      div.appendChild(item);
    });
    return div;
  }

  /* ─── Hidden print content ─────────────────────────────── */
  function buildPrintContent(sos) {
    let el = document.getElementById('sos-print-content');
    if (!el) { el = document.createElement('div'); el.id = 'sos-print-content'; document.body.appendChild(el); }
    el.innerHTML = `
      <div class="print-header">
        <p class="print-title">🇲🇾 Japan Trip 2026 — SOS Card</p>
        <p class="print-sub">Apr 10–26 · 2 pax · Kumano Kodo → Alpine Route → Hakuba → Osaka</p>
      </div>
      <div class="print-section print-emergency">
        <p class="print-section-title">Emergency numbers</p>
        ${sos.emergency.map(e=>`<div class="print-row"><span class="print-label">${e.label}</span><span class="print-value">${e.value}</span></div>`).join('')}
      </div>
      <div class="print-section">
        <p class="print-section-title">Lodging</p>
        ${sos.lodging.map(l=>`<div class="print-row"><span class="print-label">${l.label}</span><div><span class="print-value">${l.value}</span>${l.jp?`<span class="print-jp"> · ${l.jp}</span>`:''}</div></div>`).join('')}
      </div>
      <div class="print-section">
        <p class="print-section-title">Passes</p>
        ${sos.passes.map(p=>`<div class="print-row"><span class="print-label">${p.label}</span><span class="print-value">${p.value}</span></div>`).join('')}
      </div>
      <div class="print-section">
        <p class="print-section-title">Addresses in Japanese</p>
        ${sos.addresses.map(a=>`<div class="print-row"><span class="print-label">${a.label}</span><span class="print-value print-jp">${a.jp}</span></div>`).join('')}
      </div>
      <div class="print-footer">Printed from Japan Trip PWA · Keep this card accessible offline</div>
    `;
  }

  function render() {
    if (!root) return;
    root.innerHTML = '';
    const sos = Data.getSOS();

    const banner = document.createElement('div');
    banner.className = 'sos-banner';
    banner.innerHTML = `${Icons.shield('icon-md')}<div><p style="font-weight:500;font-size:var(--text-sm);color:var(--danger-text)">Offline SOS card</p><p style="font-size:var(--text-xs);color:var(--danger-text);opacity:.8;margin-top:2px">Cached by service worker · works without data</p></div>`;
    root.appendChild(banner);

    root.appendChild(section('Emergency numbers', sos.emergency, 'phone'));
    root.appendChild(section('Lodging', sos.lodging, 'building'));
    root.appendChild(section('Passes & documents', sos.passes, 'card'));
    root.appendChild(section('Addresses in Japanese', sos.addresses.map(a => ({ label:a.label, value:a.jp })), 'language'));

    buildPrintContent(sos);

    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn btn-ghost';
    exportBtn.style.cssText = 'width:100%;margin:var(--s4) var(--s3);width:calc(100% - 2*var(--s3))';
    exportBtn.innerHTML = `${Icons.download('icon-sm')} Save as PDF`;
    exportBtn.addEventListener('click', () => {
      Toast.show('Opening print dialog…', 'info');
      setTimeout(() => window.print(), 300);
    });
    root.appendChild(exportBtn);
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
  };
})();

window.SOSScreen = SOSScreen;
