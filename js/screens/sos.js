'use strict';

/* ── Pre-loaded guide links ─────────────────────────────────── */
const GUIDE_LINKS = [
  {
    section:'Kumano Kodo Trail', icon:'🗾',
    items:[
      {title:'Nakahechi Route Map',            desc:'Takijiri → Takahara (PDF)',        url:'https://www2.tb-kumano.jp/en/kumano-kodo/pdf/Kumano-Kodo-Nakahechi-Route-Maps-Takijiri-Takahara.pdf'},
      {title:'Nachisan Travel Guide',           desc:'Nachi Taisha & waterfall area',    url:'https://visitwakayama.jp/en/stories/detail_539.html'},
      {title:'Bus: Kii-Tanabe → Hongu',         desc:'Ryujin bus schedule (PDF)',         url:'http://www2.tb-kumano.jp/en/transport/pdf/Tanabe-Shirahama-to-Hongu-bus.pdf'},
      {title:'Bus: Hongu → Shingu',             desc:'Bus schedule (PDF)',                url:'http://www2.tb-kumano.jp/en/transport/pdf/Hongu-Koguchi-Shingu-bus.pdf'},
      {title:'Bus: Hongu ↔ Kawayu ↔ Yunomine', desc:'Hot spring shuttle (PDF)',          url:'http://www2.tb-kumano.jp/en/transport/pdf/Hongu-Kawayu-Yunomine-bus.pdf'},
      {title:'Bus: Nachi ↔ Kii-Katsuura',       desc:'Bus schedule (PDF)',                url:'https://www2.tb-kumano.jp/en/transport/pdf/Nachi-Kii-Katsuura-bus.pdf'},
    ]
  },
  {
    section:'Alpine Route & Murodo', icon:'🏔',
    items:[
      {title:'Murodo Walks Map',                desc:'Official plateau guide (PDF)',      url:'https://www.alpen-route.com/en/assets_v2/file/walks_map.pdf'},
      {title:'Timetable: Nagano → Toyama',      desc:'Alpine Route 2026 (PDF)',           url:'https://www.alpen-route.com/en/wp-content/uploads/2026/04/2026_timetable_nagano-toyamaedit.pdf'},
      {title:'Timetable: Toyama → Nagano',      desc:'Alpine Route 2026 (PDF)',           url:'https://www.alpen-route.com/en/wp-content/uploads/2026/04/2026_timetable_toyama-naganoedit-1.pdf'},
      {title:'Alpine Route Booking Portal',     desc:'Reserve tickets online',            url:'https://tateyama-kurobe-webservice.jp/AlpenTour/html/VW001W0010.html?lang=en'},
    ]
  },
];

const SOSScreen = (() => {
  let root;
  let activeTab = 'help';

  /* ── Shared: section header + copy-card rows ──────────────── */
  function infoSection(title, rows, iconName) {
    const div = document.createElement('div');
    div.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = title;
    div.appendChild(h);
    rows.forEach(row => {
      const item = document.createElement('div');
      item.className = 'card sos-item';
      const icon = document.createElement('span');
      icon.innerHTML = Icons[iconName]?.('icon-md') || '';
      icon.style.cssText = 'color:var(--accent);flex-shrink:0';
      const text = document.createElement('div');
      text.style.flex = '1';
      const lbl = document.createElement('p');
      lbl.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted)';
      lbl.textContent = row.label;
      const val = document.createElement('p');
      val.style.cssText = 'font-size:var(--text-sm);font-weight:500;color:var(--text-primary);margin-top:2px';
      val.textContent = row.value || row.jp || '';
      text.appendChild(lbl);
      text.appendChild(val);
      if (row.jp && row.value) {
        const jp = document.createElement('p');
        jp.style.cssText = 'font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px';
        jp.textContent = row.jp;
        text.appendChild(jp);
      }
      item.appendChild(icon);
      item.appendChild(text);
      const copyText = row.value || row.jp || '';
      if (copyText && copyText !== 'Confirm when collected') {
        const btn = document.createElement('button');
        btn.className = 'kit-copy-btn';
        btn.textContent = 'Copy';
        btn.addEventListener('click', () => {
          const full = row.jp ? `${row.value||''}\n${row.jp}` : copyText;
          navigator.clipboard?.writeText(full).then(() => {
            btn.textContent = '✓';
            setTimeout(() => btn.textContent = 'Copy', 1500);
            Toast.show(`Copied: ${row.label}`, 'success');
          }).catch(() => Toast.show('Copy failed', 'warning'));
        });
        item.appendChild(btn);
      }
      div.appendChild(item);
    });
    return div;
  }

  /* ── Shared: link card ────────────────────────────────────── */
  function linkCard(title, desc, url, onDelete) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.cssText = 'margin-bottom:var(--s2);display:flex;align-items:center;gap:var(--s2);padding:10px var(--s3);min-height:44px';
    const text = document.createElement('div');
    text.style.flex = '1';
    const t = document.createElement('p');
    t.style.cssText = 'font-size:var(--text-sm);font-weight:500;color:var(--text-primary)';
    t.textContent = title;
    const d = document.createElement('p');
    d.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px';
    d.textContent = desc || url;
    text.appendChild(t);
    text.appendChild(d);
    card.appendChild(text);
    const openBtn = document.createElement('button');
    openBtn.style.cssText = 'background:var(--accent);color:#fff;border:none;border-radius:var(--r-sm);padding:4px 10px;font-size:var(--text-xs);cursor:pointer;flex-shrink:0;font-family:var(--font)';
    openBtn.textContent = 'Open ↗';
    openBtn.addEventListener('click', () => window.open(url, '_blank'));
    card.appendChild(openBtn);
    if (onDelete) {
      const del = document.createElement('button');
      del.style.cssText = 'background:none;border:none;color:var(--text-muted);font-size:16px;cursor:pointer;padding:0 2px;flex-shrink:0;line-height:1';
      del.textContent = '×';
      del.addEventListener('click', onDelete);
      card.appendChild(del);
    }
    return card;
  }

  /* ── Tab bar ──────────────────────────────────────────────── */
  function tabBar() {
    const bar = document.createElement('div');
    bar.className = 'sub-tab-bar';
    [['help','Help'],['stay','Stay'],['places','Places'],['guides','Guides']].forEach(([id,label]) => {
      const btn = document.createElement('button');
      btn.className = `sub-tab ${activeTab===id?'sub-tab--active':''}`;
      btn.textContent = label;
      btn.addEventListener('click', () => { activeTab = id; render(); });
      bar.appendChild(btn);
    });
    return bar;
  }

  /* ══ HELP TAB ═════════════════════════════════════════════ */
  function renderHelp(sos) {
    const wrap = document.createElement('div');
    const banner = document.createElement('div');
    banner.className = 'sos-banner';
    banner.innerHTML = `${Icons.shield('icon-md')}<div><p style="font-weight:500;font-size:var(--text-sm);color:var(--danger-text)">Offline Kit</p><p style="font-size:var(--text-xs);color:var(--danger-text);opacity:.8;margin-top:2px">Cached · works without data</p></div>`;
    wrap.appendChild(banner);
    wrap.appendChild(infoSection('Emergency numbers', sos.emergency, 'phone'));
    wrap.appendChild(renderPhrases());
    wrap.appendChild(renderHospitals());
    wrap.appendChild(renderFirstAid());
    return wrap;
  }

  function renderPhrases() {
    const div = document.createElement('div');
    div.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = 'Medical phrases — show your screen';
    div.appendChild(h);
    const phrases = [
      {en:'Please call an ambulance',         jp:'救急車を呼んでください',       rom:'Kyukyusha wo yonde kudasai'},
      {en:'I need a doctor',                   jp:'医者が必要です',               rom:'Isha ga hitsuyō desu'},
      {en:'It hurts here',                     jp:'ここが痛いです',               rom:'Koko ga itai desu'},
      {en:'I have chest pain',                 jp:'胸が痛いです',                 rom:'Mune ga itai desu'},
      {en:'I feel dizzy',                      jp:'めまいがします',               rom:'Memai ga shimasu'},
      {en:'I twisted my ankle',                jp:'足首をひねりました',           rom:'Ashikubi wo hinerimashita'},
      {en:'Please take me to a hospital',      jp:'病院に連れて行ってください',   rom:'Byōin ni tsurete itte kudasai'},
      {en:'I am allergic to ___',              jp:'___にアレルギーがあります',    rom:'___ ni arerugī ga arimasu'},
    ];
    phrases.forEach(p => {
      const card = document.createElement('div');
      card.className = 'card kit-phrase-card';
      card.innerHTML = `
        <p class="kit-phrase-en">${p.en}</p>
        <p class="kit-phrase-jp">${p.jp}</p>
        <p class="kit-phrase-rom">${p.rom}</p>`;
      const btn = document.createElement('button');
      btn.className = 'kit-copy-btn kit-copy-btn--right';
      btn.textContent = 'Copy';
      btn.addEventListener('click', () => {
        navigator.clipboard?.writeText(p.jp).then(() => {
          btn.textContent = '✓';
          setTimeout(() => btn.textContent = 'Copy', 1500);
        });
      });
      card.appendChild(btn);
      div.appendChild(card);
    });
    return div;
  }

  function renderHospitals() {
    const div = document.createElement('div');
    div.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = 'Nearest hospitals';
    div.appendChild(h);
    (Data.getHospitals?.() || []).forEach(hosp => {
      const card = document.createElement('div');
      card.className = 'card kit-hosp-card';
      card.innerHTML = `
        <p class="kit-hosp-region">${hosp.region}</p>
        <p class="kit-hosp-name">${hosp.name}</p>
        ${hosp.note ? `<p class="kit-hosp-note">${hosp.note}</p>` : ''}`;
      const btns = document.createElement('div');
      btns.className = 'kit-hosp-btns';
      const tel = document.createElement('a');
      tel.href = `tel:${hosp.tel}`;
      tel.className = 'kit-copy-btn';
      tel.textContent = hosp.tel;
      btns.appendChild(tel);
      const maps = document.createElement('a');
      maps.href = hosp.maps;
      maps.target = '_blank';
      maps.rel = 'noopener';
      maps.className = 'kit-maps-btn';
      maps.textContent = 'Maps ↗';
      btns.appendChild(maps);
      card.appendChild(btns);
      div.appendChild(card);
    });
    return div;
  }

  function renderFirstAid() {
    const div = document.createElement('div');
    div.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = 'First aid — trail protocols';
    div.appendChild(h);
    (Data.getFirstAid?.() || []).forEach(item => {
      const card = document.createElement('div');
      card.className = 'card kit-fa-card';
      const header = document.createElement('div');
      header.className = 'kit-fa-header';
      header.innerHTML = `<span class="kit-fa-title">${item.title}</span><span class="kit-fa-arrow">▸</span>`;
      const body = document.createElement('p');
      body.className = 'kit-fa-body';
      body.textContent = item.content;
      header.addEventListener('click', () => {
        const open = body.style.display !== 'none';
        body.style.display = open ? 'none' : 'block';
        header.querySelector('.kit-fa-arrow').style.transform = open ? '' : 'rotate(90deg)';
      });
      card.appendChild(header);
      card.appendChild(body);
      div.appendChild(card);
    });
    return div;
  }

  /* ══ STAY TAB ════════════════════════════════════════════ */
  function renderStay(sos) {
    const wrap = document.createElement('div');
    wrap.appendChild(infoSection('Lodging', sos.lodging, 'building'));
    wrap.appendChild(infoSection('Passes & documents', sos.passes, 'card'));
    return wrap;
  }

  /* ══ PLACES TAB ═════════════════════════════════════════ */
  function renderPlaces(sos) {
    const wrap = document.createElement('div');
    wrap.appendChild(infoSection('Addresses in Japanese', sos.addresses.map(a => ({label:a.label, value:a.jp})), 'language'));
    return wrap;
  }

  /* ══ GUIDES TAB ══════════════════════════════════════════ */
  function renderGuides() {
    const wrap = document.createElement('div');
    wrap.className = 'sos-section';
    const h = document.createElement('p');
    h.className = 'sos-section-title';
    h.textContent = 'References & Guides';
    wrap.appendChild(h);
    GUIDE_LINKS.forEach(group => {
      const gHead = document.createElement('p');
      gHead.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);font-weight:500;text-transform:uppercase;letter-spacing:.04em;padding:var(--s3) 0 var(--s2)';
      gHead.textContent = `${group.icon} ${group.section}`;
      wrap.appendChild(gHead);
      group.items.forEach(item => wrap.appendChild(linkCard(item.title, item.desc, item.url)));
    });
    // Custom links
    const customLinks = Data.getCustomLinks?.() || [];
    const myHead = document.createElement('p');
    myHead.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);font-weight:500;text-transform:uppercase;letter-spacing:.04em;padding:var(--s3) 0 var(--s2)';
    myHead.textContent = '🔖 My links';
    wrap.appendChild(myHead);
    if (!customLinks.length) {
      const em = document.createElement('p');
      em.style.cssText = 'font-size:var(--text-sm);color:var(--text-muted);font-style:italic;margin-bottom:var(--s3)';
      em.textContent = 'No custom links yet.';
      wrap.appendChild(em);
    } else {
      customLinks.forEach(link => {
        wrap.appendChild(linkCard(link.title, link.url, link.url, async () => {
          await Data.deleteCustomLink(link.id);
          Toast.show('Link removed', 'info');
          render();
        }));
      });
    }
    // Add link form
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-ghost';
    addBtn.style.cssText = 'width:100%;margin-top:var(--s2)';
    addBtn.textContent = '+ Add custom link';
    wrap.appendChild(addBtn);
    const addForm = document.createElement('div');
    addForm.style.cssText = 'display:none;flex-direction:column;gap:var(--s2);margin-top:var(--s2)';
    const dayOpts = Data.getDays().map(d => `<option value="${d.id}">${d.label} · ${d.date}</option>`).join('');
    addForm.innerHTML = `
      <input id="cl-title" class="bs-input" type="text" placeholder="Title (e.g. Hotel confirmation)">
      <input id="cl-url"   class="bs-input" type="url"  placeholder="https://...">
      <div class="bs-edit-group">
        <label class="bs-edit-label" for="cl-day">Show on day (optional)</label>
        <select id="cl-day" class="bs-input">
          <option value="">Guides only</option>
          ${dayOpts}
        </select>
      </div>
      <div style="display:flex;gap:var(--s2)">
        <button class="btn btn-primary" id="cl-save"   style="flex:1">Save</button>
        <button class="btn btn-ghost"   id="cl-cancel" style="flex:1">Cancel</button>
      </div>`;
    wrap.appendChild(addForm);
    addBtn.addEventListener('click', () => { addBtn.style.display='none'; addForm.style.display='flex'; addForm.querySelector('#cl-title')?.focus(); });
    addForm.querySelector('#cl-save')?.addEventListener('click', async () => {
      const title = addForm.querySelector('#cl-title')?.value?.trim();
      const url   = addForm.querySelector('#cl-url')?.value?.trim();
      if (!title || !url) { Toast.show('Title and URL required', 'warning'); return; }
      const dayId = addForm.querySelector('#cl-day')?.value || null;
      await Data.addCustomLink({ title, url, dayId: dayId || null });
      Toast.show('Link saved', 'success');
      render();
    });
    addForm.querySelector('#cl-cancel')?.addEventListener('click', () => { addForm.style.display='none'; addBtn.style.display='block'; });
    return wrap;
  }

  /* ── Print content (unchanged) ────────────────────────────── */
  function buildPrintContent(sos) {
    let el = document.getElementById('sos-print-content');
    if (!el) { el = document.createElement('div'); el.id = 'sos-print-content'; document.body.appendChild(el); }
    el.innerHTML = `
      <div class="print-header"><p class="print-title">🇲🇾 Japan Trip — Kit Card</p><p class="print-sub">Apr 9–23 · 2 pax · Kumano Kodo → Togakushi → Alpine Route → Osaka</p></div>
      <div class="print-section print-emergency"><p class="print-section-title">Emergency numbers</p>${sos.emergency.map(e=>`<div class="print-row"><span class="print-label">${e.label}</span><span class="print-value">${e.value}</span></div>`).join('')}</div>
      <div class="print-section"><p class="print-section-title">Lodging</p>${sos.lodging.map(l=>`<div class="print-row"><span class="print-label">${l.label}</span><div><span class="print-value">${l.value}</span>${l.jp?`<span class="print-jp"> · ${l.jp}</span>`:''}</div></div>`).join('')}</div>
      <div class="print-section"><p class="print-section-title">Passes</p>${sos.passes.map(p=>`<div class="print-row"><span class="print-label">${p.label}</span><span class="print-value">${p.value}</span></div>`).join('')}</div>
      <div class="print-section"><p class="print-section-title">Addresses</p>${sos.addresses.map(a=>`<div class="print-row"><span class="print-label">${a.label}</span><span class="print-value print-jp">${a.jp}</span></div>`).join('')}</div>
      <div class="print-footer">Japan Trip PWA · Kit Card · Keep accessible offline</div>`;
  }

  /* ── Main render ──────────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';
    const sos = Data.getSOS();

    root.appendChild(tabBar());

    const content = document.createElement('div');
    content.className = 'kit-tab-content';
    if      (activeTab === 'help')   content.appendChild(renderHelp(sos));
    else if (activeTab === 'stay')   content.appendChild(renderStay(sos));
    else if (activeTab === 'places') content.appendChild(renderPlaces(sos));
    else if (activeTab === 'guides') content.appendChild(renderGuides());
    root.appendChild(content);

    buildPrintContent(sos);

    if (activeTab === 'guides') {
      const exportBtn = document.createElement('button');
      exportBtn.className = 'btn btn-ghost';
      exportBtn.style.cssText = 'width:calc(100% - 2*var(--s3));margin:var(--s4) var(--s3)';
      exportBtn.innerHTML = `${Icons.download('icon-sm')} Save as PDF`;
      exportBtn.addEventListener('click', () => { Toast.show('Opening print dialog…','info'); setTimeout(() => window.print(), 300); });
      content.appendChild(exportBtn);
    }
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.SOSScreen = SOSScreen;
