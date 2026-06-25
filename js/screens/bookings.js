'use strict';

const BookingsScreen = (() => {
  let root;
  let activeTab = 'reservations';
  const EXPENSE_CATS = ['Food','Transport','Accommodation','Activities','Shopping','Other'];

  /* ─── Tab bar ────────────────────────────────────────────── */
  function tabBar() {
    const bar = document.createElement('div');
    bar.className = 'sub-tab-bar';
    [['reservations','Reservations'],['budget','Budget'],['packing','Packing'],['settings','Settings']].forEach(([id,lbl]) => {
      const btn = document.createElement('button');
      btn.className = `sub-tab ${activeTab===id?'sub-tab--active':''}`;
      btn.textContent = lbl;
      btn.addEventListener('click', () => { activeTab=id; render(); });
      bar.appendChild(btn);
    });
    return bar;
  }

  /* ═══ RESERVATIONS TAB ══════════════════════════════════ */
  function renderReservations() {
    const frag = document.createDocumentFragment();
    frag.appendChild(renderAccommodation());
    frag.appendChild(renderTransport());
    frag.appendChild(renderActivities());
    return frag;
  }

  /* ─── Section header helper ──────────────────────────────── */
  function sectionHead(title, count) {
    const div = document.createElement('div');
    div.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:var(--s4) 0 var(--s2);margin-top:var(--s2)';
    div.innerHTML = `
      <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary)">${title}</p>
      <span style="font-size:var(--text-xs);color:var(--text-muted)">${count} items</span>`;
    return div;
  }

  function statusBadge(status) {
    const cls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'}[status]||'badge-open';
    const lbl = {booked:'✓ Booked',pending:'Pending',urgent:'⚡',open:'Open'}[status]||'Open';
    return `<span class="badge ${cls}">${lbl}</span>`;
  }

  /* ─── Accommodation ──────────────────────────────────────── */
  function renderAccommodation() {
    const frag = document.createDocumentFragment();
    const nights = Data.getDays().map(d=>({day:d,o:Data.getOvernight(d.id)})).filter(({o})=>o?.name);
    const booked = nights.filter(({o})=>o.status==='booked').length;

    frag.appendChild(sectionHead(`🏨 Accommodation`, `${booked}/${nights.length} confirmed`));

    if (!nights.length) {
      const em = document.createElement('div');
      em.style.cssText = 'font-size:var(--text-sm);color:var(--text-muted);padding:var(--s3) 0';
      em.textContent = 'Tap the overnight card on any itinerary day to add.';
      frag.appendChild(em);
      return frag;
    }

    nights.forEach(({day,o}) => {
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'margin-bottom:var(--s2);cursor:pointer';
      card.innerHTML = `
        <div style="padding:10px var(--s3);display:flex;align-items:flex-start;gap:var(--s2);min-height:44px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
              <span class="badge badge-open" style="font-size:9px;padding:1px 5px">${day.label}</span>
              <span style="font-size:var(--text-xs);color:var(--text-muted)">${day.date}</span>
            </div>
            <p style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary)">${o.name}</p>
            ${o.ref?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:1px">Ref: ${o.ref}</p>`:''}
            ${o.cost?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:1px">¥${o.cost.toLocaleString()}</p>`:''}
            ${o.deadline?`<p style="font-size:var(--text-xs);color:var(--danger-text);margin-top:1px">Book by ${new Date(o.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p>`:''}
          </div>
          ${statusBadge(o.status)}
        </div>`;
      card.addEventListener('click', () => BottomSheet.openOvernight(day));
      frag.appendChild(card);
    });
    return frag;
  }

  /* ─── Transport + JR Cheat Sheet ────────────────────────── */
  function renderTransport() {
    const frag = document.createDocumentFragment();
    const stops = Data.getTransportReservations();
    frag.appendChild(sectionHead('🚄 Transport', stops.length + ' to track'));

    if (!stops.length) {
      const em = document.createElement('p');
      em.style.cssText = 'font-size:var(--text-sm);color:var(--text-muted);padding:var(--s2) 0';
      em.textContent = 'No transport bookings flagged. Edit any stop to mark "Needs booking."';
      frag.appendChild(em);
    } else {
      stops.forEach(stop => {
        const day = Data.getDays().find(d=>d.id===stop.dayId);
        const card = document.createElement('div');
        card.className = 'card';
        card.style.cssText = 'margin-bottom:var(--s2);cursor:pointer';
        const icon = {plane:'✈',train:'🚆',bus:'🚌',boat:'⛵',cable:'🚠'}[stop.transportType]||'🚌';
        card.innerHTML = `
          <div style="padding:10px var(--s3);display:flex;align-items:flex-start;gap:var(--s2);min-height:44px">
            <span style="font-size:16px;margin-top:1px">${icon}</span>
            <div style="flex:1;min-width:0">
              <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
                <span class="badge badge-open" style="font-size:9px;padding:1px 5px">${day?.label||''}</span>
                <span style="font-size:var(--text-xs);color:var(--text-muted)">${day?.date||''}</span>
              </div>
              <p style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary)">${stop.name}</p>
              ${stop.trainDetail?.service?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:1px">${stop.trainDetail.service}</p>`:''}
              ${stop.trainDetail?.seatReservation?`<p style="font-size:var(--text-xs);color:var(--accent);margin-top:1px">Seat reservation required</p>`:''}
              ${stop.trainDetail?.jrPass===false?`<p style="font-size:var(--text-xs);color:var(--warning-text);margin-top:1px">Not on JR Pass</p>`:''}
            </div>
            ${statusBadge(stop.booking.status)}
          </div>`;
        card.addEventListener('click', () => BottomSheet.openStop(stop, day));
        frag.appendChild(card);
      });
    }

    // ── JR Seat Reservation Cheat Sheet ──
    const jrLegs = Data.getJRSeatReservations();
    if (jrLegs.length) {
      const jrSection = document.createElement('div');
      jrSection.style.cssText = 'background:var(--accent-subtle);border:1.5px solid var(--stamp-border);border-radius:var(--r-lg);padding:var(--s3);margin-top:var(--s3);margin-bottom:var(--s3)';

      const jrHeader = document.createElement('div');
      jrHeader.style.cssText = 'display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--s3)';
      jrHeader.innerHTML = `
        <div>
          <p style="font-size:var(--text-sm);font-weight:500;color:var(--accent)">JR Pass Seat Reservations</p>
          <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">Show this to the officer when booking</p>
        </div>
        <button id="jr-share-btn" class="btn btn-primary" style="font-size:var(--text-xs);min-height:32px;padding:0 12px">Share</button>`;
      jrSection.appendChild(jrHeader);

      let shareText = 'JR PASS SEAT RESERVATIONS — Japan Trip Apr 2027\n\n';

      jrLegs.forEach(stop => {
        const day = Data.getDays().find(d=>d.id===stop.dayId);
        const td = stop.trainDetail || {};
        const row = document.createElement('div');
        row.style.cssText = 'padding:var(--s2) 0;border-bottom:1px solid var(--stamp-border)';
        row.innerHTML = `
          <div style="display:flex;align-items:center;gap:5px;margin-bottom:3px">
            <span class="badge badge-open" style="font-size:9px;padding:1px 5px">${day?.label||''}</span>
            <span style="font-size:var(--text-xs);color:var(--text-muted)">${day?.date||''}</span>
          </div>
          <p style="font-size:var(--text-sm);font-weight:500;color:var(--text-primary)">${td.service||stop.name}</p>
          ${td.origin&&td.destination?`<p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px">${td.origin} → ${td.destination}</p>`:''}
          <p style="font-size:var(--text-xs);color:var(--text-secondary);margin-top:2px">
            Depart: ${stop.time||'TBD'} · Arrive: ${td.arriveTime||'TBD'} · ${td.duration||''}
          </p>
          ${td.trainNumber?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:1px">Train: ${td.trainNumber}</p>`:''}
          <p style="font-size:var(--text-xs);margin-top:1px">${td.jrPass===false?'<span style="color:var(--warning-text)">NOT on JR Pass</span>':'<span style="color:var(--success-text)">JR Pass ✓</span>'} · Seat reservation required</p>`;
        jrSection.appendChild(row);

        // Build share text
        shareText += `${day?.label||''} · ${day?.date||''}\n`;
        shareText += `  ${td.service||stop.name}\n`;
        if (td.origin&&td.destination) shareText += `  ${td.origin} → ${td.destination}\n`;
        shareText += `  Depart: ${stop.time||'TBD'}  Arrive: ${td.arriveTime||'TBD'}  ${td.duration||''}\n`;
        if (td.trainNumber) shareText += `  Train no: ${td.trainNumber}\n`;
        shareText += `  ${td.jrPass===false?'NOT on JR Pass':'JR Pass ✓'} · Seat reservation required\n\n`;
      });

      jrSection.appendChild(Object.assign(document.createElement('div'),{style:'height:1px'}));
      frag.appendChild(jrSection);

      // Wire share button
      setTimeout(() => {
        root.querySelector('#jr-share-btn')?.addEventListener('click', () => {
          if (navigator.share) {
            navigator.share({ title:'JR Pass Reservations — Japan 2027', text: shareText });
          } else {
            navigator.clipboard?.writeText(shareText).then(() => Toast.show('Copied to clipboard','success'));
          }
        });
      }, 0);
    }

    return frag;
  }

  /* ─── Activities ─────────────────────────────────────────── */
  function renderActivities() {
    const frag = document.createDocumentFragment();
    const stops = Data.getActivityReservations();
    frag.appendChild(sectionHead('🎌 Activities', stops.length + ' to book'));

    if (!stops.length) {
      const em = document.createElement('p');
      em.style.cssText = 'font-size:var(--text-sm);color:var(--text-muted);padding:var(--s2) 0 var(--s4)';
      em.textContent = 'No activities flagged. Edit any stop to mark as Activity.';
      frag.appendChild(em);
      return frag;
    }

    stops.forEach(stop => {
      const day = Data.getDays().find(d=>d.id===stop.dayId);
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'margin-bottom:var(--s2);cursor:pointer';
      card.innerHTML = `
        <div style="padding:10px var(--s3);display:flex;align-items:flex-start;gap:var(--s2);min-height:44px">
          <div style="flex:1;min-width:0">
            <div style="display:flex;align-items:center;gap:5px;margin-bottom:2px">
              <span class="badge badge-open" style="font-size:9px;padding:1px 5px">${day?.label||''}</span>
              <span style="font-size:var(--text-xs);color:var(--text-muted)">${day?.date||''}</span>
            </div>
            <p style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary)">${stop.name}</p>
            <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:1px">${stop.activity||''}</p>
            ${stop.booking.deadline?`<p style="font-size:var(--text-xs);color:var(--danger-text);margin-top:1px">Book by ${new Date(stop.booking.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p>`:''}
          </div>
          ${statusBadge(stop.booking.status)}
        </div>`;
      card.addEventListener('click', () => BottomSheet.openStop(stop, day));
      frag.appendChild(card);
    });
    return frag;
  }

  /* ═══ BUDGET ════════════════════════════════════════════ */
  function renderBudget() {
    const frag = document.createDocumentFragment();
    const travelers = Data.getTravelers();
    const expenses  = Data.getExpenses();
    const totalJPY  = Data.getTotalSpentJPY();
    const budgetJPY = Config.BUDGET_MYR * Config.EXCHANGE_RATE_JPY;
    const pct       = Math.min(100, totalJPY ? Math.round(totalJPY/budgetJPY*100) : 0);

    if (!travelers.length) {
      const notice = document.createElement('div');
      notice.className = 'settlement-card';
      notice.style.marginTop = 'var(--s3)';
      notice.innerHTML = `<p style="font-size:var(--text-sm);color:var(--text-secondary);text-align:center">Add travelers in <strong>Settings</strong> to split expenses</p>`;
      frag.appendChild(notice);
    }

    const summary = document.createElement('div');
    summary.className = 'settlement-card';
    summary.style.marginTop = 'var(--s3)';
    let summaryHTML = `
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s2);text-transform:uppercase;letter-spacing:.04em;font-weight:500">Total spent</p>
      <p style="font-size:22px;font-weight:500;color:var(--text-primary)">¥${totalJPY.toLocaleString()}</p>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:6px">of ¥${budgetJPY.toLocaleString()} (RM${Config.BUDGET_MYR.toLocaleString()})</p>
      <div class="budget-bar"><div class="budget-fill" style="width:${pct}%;background:${pct>90?'var(--danger-text)':pct>70?'var(--warning-text)':'var(--accent)'}"></div></div>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">¥${(budgetJPY-totalJPY).toLocaleString()} remaining</p>`;

    if (travelers.length && expenses.length) {
      const paid = {}; const share = {};
      travelers.forEach(t => { paid[t]=0; share[t]=0; });
      expenses.forEach(exp => {
        if (exp.paidBy && paid[exp.paidBy]!==undefined) paid[exp.paidBy] += exp.amountJPY;
        if (exp.splitBetween?.length) {
          const perHead = exp.amountJPY / exp.splitBetween.length;
          exp.splitBetween.forEach(t => { if (share[t]!==undefined) share[t] += perHead; });
        }
      });
      summaryHTML += `<div style="margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--border-subtle)">`;
      travelers.forEach(t => {
        summaryHTML += `<div class="settlement-row"><span style="font-weight:500">${t}</span><span style="color:var(--text-muted)">paid ¥${(paid[t]||0).toLocaleString()} · share ¥${Math.round(share[t]||0).toLocaleString()}</span></div>`;
      });
      summaryHTML += `</div>`;
      const balances = Data.calcSettlement();
      const positives = travelers.filter(t=>balances[t]>0.5);
      const negatives = travelers.filter(t=>balances[t]<-0.5);
      summaryHTML += `<div style="margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--border-subtle)">`;
      if (!positives.length && !negatives.length) {
        summaryHTML += `<p class="settlement-settled">✓ All settled</p>`;
      } else {
        negatives.forEach(debtor => {
          positives.forEach(creditor => {
            const amt = Math.round(Math.min(Math.abs(balances[debtor]), balances[creditor]));
            if (amt>0) summaryHTML += `<p class="settlement-owed">💸 ${debtor} owes ${creditor} ¥${amt.toLocaleString()}</p>`;
          });
        });
      }
      summaryHTML += `</div>`;
    }
    summary.innerHTML = summaryHTML;
    frag.appendChild(summary);

    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary bs-full-btn';
    addBtn.style.marginBottom = 'var(--s3)';
    addBtn.textContent = '+ Log expense';
    frag.appendChild(addBtn);

    const addForm = document.createElement('div');
    addForm.className = 'add-expense-form';
    addForm.style.display = 'none';
    const pax = travelers.length || 1;
    const paidByChips = travelers.map((t,i) =>
      `<button type="button" class="traveler-chip paid-chip ${i===0?'traveler-chip--active':''}" data-name="${t}">${t}</button>`
    ).join('');
    const splitChips = travelers.map(t =>
      `<button type="button" class="traveler-chip split-chip traveler-chip--active" data-name="${t}">${t}</button>`
    ).join('');
    addForm.innerHTML = `
      <p class="form-title">Log expense</p>
      <select id="exp-day" class="bs-input"><option value="">Day…</option>${Data.getDays().map(d=>`<option value="${d.id}">${d.label} · ${d.date}</option>`).join('')}</select>
      <select id="exp-cat" class="bs-input"><option value="">Category…</option>${EXPENSE_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
      <input id="exp-desc" class="bs-input" type="text" placeholder="Description">
      <input id="exp-amt" class="bs-input" type="number" placeholder="Amount (¥)">
      ${travelers.length?`
        <div class="bs-edit-group"><label class="bs-edit-label">Paid by</label><div class="split-chips" id="paid-by-chips">${paidByChips}</div></div>
        <div class="bs-edit-group"><label class="bs-edit-label">Split between</label><div class="split-chips" id="split-chips">${splitChips}</div></div>`
      :`<input id="exp-paid" class="bs-input" type="text" placeholder="Paid by">`}
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" id="exp-save" style="flex:1">Save</button>
        <button class="btn btn-ghost" id="exp-cancel" style="flex:1">Cancel</button>
      </div>`;
    frag.appendChild(addForm);

    // Wire add form
    addBtn.addEventListener('click', () => { addBtn.style.display='none'; addForm.style.display='flex'; });
    addForm.querySelectorAll('.paid-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        addForm.querySelectorAll('.paid-chip').forEach(c=>c.classList.remove('traveler-chip--active'));
        chip.classList.add('traveler-chip--active');
      });
    });
    addForm.querySelectorAll('.split-chip').forEach(chip => {
      chip.addEventListener('click', () => chip.classList.toggle('traveler-chip--active'));
    });
    const g = id => addForm.querySelector('#'+id)?.value?.trim()||'';
    const saveBtn = addForm.querySelector('#exp-save');
    saveBtn?.addEventListener('click', async () => {
      if (!g('exp-day')||!g('exp-cat')||!g('exp-desc')||!g('exp-amt')) { Toast.show('Fill all fields','warning'); return; }
      const paidBy = travelers.length ? addForm.querySelector('.paid-chip.traveler-chip--active')?.dataset.name||'' : g('exp-paid');
      const splitBetween = travelers.length ? [...addForm.querySelectorAll('.split-chip.traveler-chip--active')].map(c=>c.dataset.name) : [];
      saveBtn.disabled = true;
      await Data.addExpense({ dayId:g('exp-day'), category:g('exp-cat'), description:g('exp-desc'), amountJPY:parseInt(g('exp-amt')), paidBy, splitBetween });
      Toast.show('Expense logged','success');
      render();
    });
    addForm.querySelector('#exp-cancel')?.addEventListener('click', () => { addForm.style.display='none'; addBtn.style.display='block'; });

    if (!expenses.length) {
      frag.appendChild(Object.assign(document.createElement('div'),{className:'empty-state',innerHTML:'<p class="empty-title">No expenses yet</p>'}));
    } else {
      const byDay = {};
      expenses.forEach(e => { const k=e.dayId||'unknown'; if(!byDay[k])byDay[k]=[]; byDay[k].push(e); });
      Object.entries(byDay).forEach(([dayId,exps]) => {
        const day = Data.getDays().find(d=>d.id===dayId);
        const sec = document.createElement('div');
        sec.className = 'expense-section';
        sec.innerHTML = `<div class="expense-day-header"><span>${day?.label||dayId} · ${day?.date||''}</span><span>¥${exps.reduce((s,e)=>s+e.amountJPY,0).toLocaleString()}</span></div>`;
        exps.forEach(exp => {
          const splitPax = Math.max(1, exp.splitBetween?.length||1);
          const perHead  = Math.round(exp.amountJPY/splitPax);
          const row = document.createElement('div');
          row.className = 'expense-row';
          row.innerHTML = `
            <span class="expense-cat">${exp.category}</span>
            <div class="expense-info">
              <p class="expense-desc">${exp.description}</p>
              <p class="expense-split-line">${exp.paidBy?exp.paidBy+' paid':''} ${exp.splitBetween?.length?'· '+exp.splitBetween.join('+'):''} · ¥${perHead.toLocaleString()} pp</p>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <p class="expense-amt">¥${exp.amountJPY.toLocaleString()}</p>
              <p class="expense-per">¥${perHead.toLocaleString()} pp</p>
            </div>
            <button class="expense-del">×</button>`;
          row.querySelector('.expense-del').addEventListener('click', async e => {
            e.stopPropagation(); await Data.deleteExpense(exp.id); Toast.show('Removed','info'); render();
          });
          sec.appendChild(row);
        });
        frag.appendChild(sec);
      });
    }
    return frag;
  }

  /* ═══ PACKING ════════════════════════════════════════════ */
  function renderPacking() {
    const frag = document.createDocumentFragment();
    const items = Data.getPackingItems();
    const done  = items.filter(i=>i.checked).length;
    const hdr = document.createElement('div');
    hdr.className = 'packing-header';
    hdr.innerHTML = `<span>${done}/${items.length} packed</span><div class="budget-bar" style="flex:1;margin-left:12px"><div class="budget-fill" style="width:${items.length?Math.round(done/items.length*100):0}%;background:var(--success-text)"></div></div>`;
    frag.appendChild(hdr);
    Object.entries(Data.getPackingByCategory()).forEach(([cat,catItems]) => {
      const sec = document.createElement('div');
      sec.className = 'packing-section';
      sec.innerHTML = `<div class="packing-cat-header"><span>${cat}</span><span>${catItems.filter(i=>i.checked).length}/${catItems.length}</span></div>`;
      catItems.forEach(item => {
        const row = document.createElement('div');
        row.className = `packing-row ${item.checked?'packing-row--done':''}`;
        row.innerHTML = `<input type="checkbox" ${item.checked?'checked':''} style="accent-color:var(--accent);width:16px;height:16px;flex-shrink:0;cursor:pointer"><span class="packing-item">${item.item}</span>${item.essential?'<span class="packing-tag">Essential</span>':''}<button class="packing-del">×</button>`;
        row.querySelector('input').addEventListener('change', async e => { await Data.togglePacking(item.id,e.target.checked); render(); });
        row.querySelector('.packing-del').addEventListener('click', async () => { await Data.deletePacking(item.id); render(); });
        sec.appendChild(row);
      });
      const addRow = document.createElement('div');
      addRow.className = 'packing-add-row';
      addRow.innerHTML = `<input type="text" class="packing-add-input" placeholder="Add to ${cat}…"><button class="packing-add-btn">Add</button>`;
      addRow.querySelector('.packing-add-btn').addEventListener('click', async () => {
        const inp = addRow.querySelector('.packing-add-input');
        if (!inp.value.trim()) return;
        await Data.addPackingItem({cat,item:inp.value.trim(),essential:false});
        inp.value=''; render();
      });
      addRow.querySelector('.packing-add-input').addEventListener('keydown', e => { if(e.key==='Enter') addRow.querySelector('.packing-add-btn').click(); });
      sec.appendChild(addRow);
      frag.appendChild(sec);
    });
    return frag;
  }

  /* ═══ SETTINGS ═══════════════════════════════════════════ */
  function renderSettings() {
    const frag = document.createDocumentFragment();
    const travelers = Data.getTravelers();

    const tSection = document.createElement('div');
    tSection.className = 'settings-section';
    tSection.innerHTML = `
      <p class="settings-section-title">Travelers</p>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s3)">Names are used to split and track expenses. Synced across devices.</p>`;
    const chipWrap = document.createElement('div');
    chipWrap.className = 'split-chips';
    if (!travelers.length) {
      chipWrap.innerHTML = '<p style="font-size:var(--text-sm);color:var(--text-muted)">No travelers added yet.</p>';
    } else {
      travelers.forEach((name,i) => {
        const chip = document.createElement('span');
        chip.className = 'traveler-chip traveler-chip--active';
        chip.innerHTML = `${name}<button class="traveler-chip-del" data-idx="${i}">×</button>`;
        chip.querySelector('.traveler-chip-del').addEventListener('click', async () => {
          await Data.updateTravelers(travelers.filter((_,j)=>j!==i));
          Toast.show(`${name} removed`,'info'); render();
        });
        chipWrap.appendChild(chip);
      });
    }
    tSection.appendChild(chipWrap);
    const addRow = document.createElement('div');
    addRow.className = 'traveler-add-row';
    addRow.innerHTML = `<input id="traveler-input" class="bs-input" type="text" placeholder="Traveler name (e.g. C or K)" style="flex:1"><button class="btn btn-primary" id="traveler-add-btn">Add</button>`;
    tSection.appendChild(addRow);
    frag.appendChild(tSection);

    const budgetSection = document.createElement('div');
    budgetSection.className = 'settings-section';
    budgetSection.innerHTML = `
      <p class="settings-section-title">Budget</p>
      <div class="bs-edit-group"><label class="bs-edit-label">Budget (RM)</label><input id="cfg-budget" class="bs-input" type="number" value="${Config.BUDGET_MYR}"></div>
      <div class="bs-edit-group"><label class="bs-edit-label">Exchange rate (1 MYR = ? JPY)</label><input id="cfg-rate" class="bs-input" type="number" value="${Config.EXCHANGE_RATE_JPY}"></div>
      <button class="btn btn-primary" id="cfg-save-btn" style="width:100%;margin-top:var(--s2)">Save budget settings</button>`;
    frag.appendChild(budgetSection);

    setTimeout(() => {
      root.querySelector('#traveler-add-btn')?.addEventListener('click', async () => {
        const inp = root.querySelector('#traveler-input');
        const name = inp?.value?.trim();
        if (!name) return;
        if (travelers.includes(name)) { Toast.show(`${name} already added`,'warning'); return; }
        await Data.updateTravelers([...travelers,name]);
        Toast.show(`${name} added`,'success'); render();
      });
      root.querySelector('#traveler-input')?.addEventListener('keydown', e => { if(e.key==='Enter') root.querySelector('#traveler-add-btn')?.click(); });
      root.querySelector('#cfg-save-btn')?.addEventListener('click', () => {
        Config.BUDGET_MYR        = parseInt(root.querySelector('#cfg-budget')?.value)||Config.BUDGET_MYR;
        Config.EXCHANGE_RATE_JPY = parseInt(root.querySelector('#cfg-rate')?.value)||Config.EXCHANGE_RATE_JPY;
        Toast.show('Budget settings saved','success'); render();
      });
    }, 0);
    return frag;
  }

  /* ─── Main render ───────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(tabBar());
    const content = document.createElement('div');
    content.style.padding = '0 var(--s3)';
    if      (activeTab==='reservations') content.appendChild(renderReservations());
    else if (activeTab==='budget')       content.appendChild(renderBudget());
    else if (activeTab==='packing')      content.appendChild(renderPacking());
    else                                 content.appendChild(renderSettings());
    root.appendChild(content);
  }

  return {
    init(el) { root=el; render(); },
    destroy() { root=null; },
    refresh() { render(); },
  };
})();

window.BookingsScreen = BookingsScreen;
