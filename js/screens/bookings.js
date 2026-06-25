'use strict';

const BookingsScreen = (() => {
  let root;
  let activeTab = 'bookings';
  let bookingFilter = 'all';
  const EXPENSE_CATS = ['Food','Transport','Accommodation','Activities','Shopping','Other'];

  /* ─── Tab bar ────────────────────────────────────────────── */
  function tabBar() {
    const bar = document.createElement('div');
    bar.className = 'sub-tab-bar';
    [['bookings','Bookings'],['accom','Stays'],['budget','Budget'],['packing','Packing'],['settings','Settings']].forEach(([id,lbl]) => {
      const btn = document.createElement('button');
      btn.className = `sub-tab ${activeTab===id?'sub-tab--active':''}`;
      btn.textContent = lbl;
      btn.addEventListener('click', () => { activeTab=id; render(); });
      bar.appendChild(btn);
    });
    return bar;
  }

  /* ═══ BOOKINGS ══════════════════════════════════════════ */
  function renderBookings() {
    const frag = document.createDocumentFragment();
    const { urgent, pending, booked } = Data.getStats();
    const stats = document.createElement('div');
    stats.className = 'booking-stats';
    stats.innerHTML = `
      <div class="stat-card"><span class="stat-num" style="color:var(--danger-text)">${urgent}</span><span class="stat-label">Urgent</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--warning-text)">${pending}</span><span class="stat-label">Pending</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--success-text)">${booked}</span><span class="stat-label">Booked</span></div>`;
    frag.appendChild(stats);

    const pills = document.createElement('div');
    pills.className = 'pill-bar';
    pills.style.padding = '0 0 var(--s3)';
    ['all','urgent','pending','booked'].forEach(f => {
      const btn = document.createElement('button');
      btn.className = `pill ${bookingFilter===f?'active':''}`;
      btn.textContent = f==='all'?'All':f.charAt(0).toUpperCase()+f.slice(1);
      btn.addEventListener('click', () => { bookingFilter=f; render(); });
      pills.appendChild(btn);
    });
    frag.appendChild(pills);

    const statusCls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'};
    const statusLbl = {booked:'✓ Booked',pending:'Pending',urgent:'⚡ Urgent',open:'Open'};
    const items = Data.getBookingsList().filter(s => bookingFilter==='all'||s.booking.status===bookingFilter);
    const list = document.createElement('div');
    list.className = 'booking-list';
    if (!items.length) {
      list.innerHTML = '<div class="empty-state"><p class="empty-title">Nothing here</p></div>';
    } else {
      items.forEach(stop => {
        const day = Data.getDays().find(d=>d.id===stop.dayId);
        const row = document.createElement('div');
        row.className = 'booking-row';
        row.innerHTML = `<div class="booking-row-inner"><div class="booking-info"><p class="booking-name">${stop.name}</p><div class="booking-meta">${day?`<span>${day.label} · ${day.date}</span>`:''} ${stop.booking.cost?`<span>¥${stop.booking.cost.toLocaleString()}</span>`:''} ${stop.booking.deadline?`<span style="color:var(--danger-text)">By ${new Date(stop.booking.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>`:''}</div></div><span class="badge ${statusCls[stop.booking.status]}">${statusLbl[stop.booking.status]}</span></div>`;
        row.addEventListener('click', () => BottomSheet.openStop(stop, day));
        list.appendChild(row);
      });
    }
    frag.appendChild(list);
    return frag;
  }

  /* ═══ STAYS ═════════════════════════════════════════════ */
  function renderAccom() {
    const frag = document.createDocumentFragment();
    const hdr = document.createElement('p');
    hdr.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);padding:var(--s3) 0 var(--s2);text-transform:uppercase;letter-spacing:.05em;font-weight:500';
    hdr.textContent = 'All overnight stays in day order';
    frag.appendChild(hdr);

    const statusCls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'};
    const statusLbl = {booked:'✓ Booked',pending:'Pending',urgent:'⚡ Urgent',open:'Open'};
    const nights = Data.getDays().map(day=>({day,o:Data.getOvernight(day.id)})).filter(({o})=>o?.name);

    if (!nights.length) {
      frag.appendChild(Object.assign(document.createElement('div'), {className:'empty-state',innerHTML:'<p class="empty-title">No stays listed</p><p class="empty-sub">Tap the overnight card on any itinerary day to add accommodation.</p>'}));
      return frag;
    }

    let bookedCount = 0;
    nights.forEach(({day,o}) => {
      if (o.status==='booked') bookedCount++;
      const card = document.createElement('div');
      card.className = 'card';
      card.style.cssText = 'margin-bottom:var(--s2);cursor:pointer';
      card.innerHTML = `<div style="padding:12px var(--s3);display:flex;align-items:flex-start;gap:var(--s2);min-height:var(--touch)"><div style="flex:1;min-width:0"><div style="display:flex;align-items:center;gap:6px;margin-bottom:3px"><span class="badge badge-open" style="font-size:9px;padding:1px 6px">${day.label}</span><span style="font-size:var(--text-xs);color:var(--text-muted)">${day.date}</span></div><p style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary)">${o.name}</p>${o.ref?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">Ref: ${o.ref}</p>`:''} ${o.cost?`<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">¥${o.cost.toLocaleString()}</p>`:''} ${o.deadline?`<p style="font-size:var(--text-xs);color:var(--danger-text);margin-top:2px">Book by ${new Date(o.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p>`:''}</div><span class="badge ${statusCls[o.status]||'badge-open'}">${statusLbl[o.status]||'Open'}</span></div>`;
      card.addEventListener('click', () => BottomSheet.openOvernight(day));
      frag.appendChild(card);
    });

    const summary = document.createElement('p');
    summary.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);text-align:center;padding:var(--s3) 0';
    summary.textContent = `${bookedCount} of ${nights.length} nights confirmed`;
    frag.appendChild(summary);
    return frag;
  }

  /* ═══ BUDGET — traveler-specific ════════════════════════ */
  function renderBudget() {
    const frag = document.createDocumentFragment();
    const travelers = Data.getTravelers();
    const expenses  = Data.getExpenses();
    const totalJPY  = Data.getTotalSpentJPY();
    const budgetJPY = Config.BUDGET_MYR * Config.EXCHANGE_RATE_JPY;
    const pct       = Math.min(100, totalJPY ? Math.round(totalJPY/budgetJPY*100) : 0);

    // ── No travelers set yet ──
    if (!travelers.length) {
      const notice = document.createElement('div');
      notice.className = 'settlement-card';
      notice.style.marginTop = 'var(--s3)';
      notice.innerHTML = `<p style="font-size:var(--text-sm);color:var(--text-secondary);text-align:center">${Icons.users('icon-sm')} Add travelers in <strong>Settings</strong> to split expenses</p>`;
      frag.appendChild(notice);
    }

    // ── Overall summary ──
    const summary = document.createElement('div');
    summary.className = 'settlement-card';
    summary.style.marginTop = 'var(--s3)';

    let summaryHTML = `
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s2);text-transform:uppercase;letter-spacing:.04em;font-weight:500">Total spent</p>
      <p style="font-size:22px;font-weight:500;color:var(--text-primary)">¥${totalJPY.toLocaleString()}</p>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:6px">of ¥${budgetJPY.toLocaleString()} (RM${Config.BUDGET_MYR.toLocaleString()})</p>
      <div class="budget-bar"><div class="budget-fill" style="width:${pct}%;background:${pct>90?'var(--danger-text)':pct>70?'var(--warning-text)':'var(--accent)'}"></div></div>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:4px">¥${(budgetJPY-totalJPY).toLocaleString()} remaining</p>`;

    // ── Per-traveler spend ──
    if (travelers.length && expenses.length) {
      const paid = {};
      const share = {};
      travelers.forEach(t => { paid[t] = 0; share[t] = 0; });
      expenses.forEach(exp => {
        if (exp.paidBy && paid[exp.paidBy] !== undefined) paid[exp.paidBy] += exp.amountJPY;
        if (exp.splitBetween?.length) {
          const perHead = exp.amountJPY / exp.splitBetween.length;
          exp.splitBetween.forEach(t => { if (share[t] !== undefined) share[t] += perHead; });
        }
      });
      summaryHTML += `<div style="margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--border-subtle)">`;
      travelers.forEach(t => {
        summaryHTML += `<div class="settlement-row"><span style="font-weight:500">${t}</span><span style="color:var(--text-muted)">paid ¥${(paid[t]||0).toLocaleString()} · share ¥${Math.round(share[t]||0).toLocaleString()}</span></div>`;
      });
      summaryHTML += `</div>`;

      // ── Settlement ──
      const balances = Data.calcSettlement();
      const positives = travelers.filter(t => balances[t] > 0.5);
      const negatives = travelers.filter(t => balances[t] < -0.5);
      const settled   = positives.length === 0 && negatives.length === 0;

      summaryHTML += `<div style="margin-top:var(--s3);padding-top:var(--s3);border-top:1px solid var(--border-subtle)">`;
      if (settled) {
        summaryHTML += `<p class="settlement-settled">✓ All settled</p>`;
      } else {
        negatives.forEach(debtor => {
          positives.forEach(creditor => {
            const amt = Math.round(Math.min(Math.abs(balances[debtor]), balances[creditor]));
            if (amt > 0) summaryHTML += `<p class="settlement-owed">💸 ${debtor} owes ${creditor} ¥${amt.toLocaleString()}</p>`;
          });
        });
      }
      summaryHTML += `</div>`;
    }

    summary.innerHTML = summaryHTML;
    frag.appendChild(summary);

    // ── Add expense form ──
    const addBtn = document.createElement('button');
    addBtn.className = 'btn btn-primary bs-full-btn';
    addBtn.style.marginBottom = 'var(--s3)';
    addBtn.textContent = '+ Log expense';
    addBtn.addEventListener('click', () => {
      addBtn.style.display = 'none';
      addForm.style.display = 'flex';
    });
    frag.appendChild(addBtn);

    const addForm = document.createElement('div');
    addForm.className = 'add-expense-form';
    addForm.style.display = 'none';

    // Build paid-by chips
    const paidByChips = travelers.map((t,i) =>
      `<button type="button" class="traveler-chip paid-chip ${i===0?'traveler-chip--active':''}" data-name="${t}">${t}</button>`
    ).join('');

    // Build split-between chips
    const splitChips = travelers.map(t =>
      `<button type="button" class="traveler-chip split-chip traveler-chip--active" data-name="${t}">${t}</button>`
    ).join('');

    addForm.innerHTML = `
      <p class="form-title">Log expense</p>
      <select id="exp-day" class="bs-input"><option value="">Day…</option>${Data.getDays().map(d=>`<option value="${d.id}">${d.label} · ${d.date}</option>`).join('')}</select>
      <select id="exp-cat" class="bs-input"><option value="">Category…</option>${EXPENSE_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
      <input id="exp-desc" class="bs-input" type="text" placeholder="Description">
      <input id="exp-amt" class="bs-input" type="number" placeholder="Amount (¥)">
      ${travelers.length ? `
        <div class="bs-edit-group">
          <label class="bs-edit-label">Paid by</label>
          <div class="split-chips" id="paid-by-chips">${paidByChips}</div>
        </div>
        <div class="bs-edit-group">
          <label class="bs-edit-label">Split between</label>
          <div class="split-chips" id="split-chips">${splitChips}</div>
        </div>` : `<input id="exp-paid" class="bs-input" type="text" placeholder="Paid by">`}
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" id="exp-save" style="flex:1">Save</button>
        <button class="btn btn-ghost" id="exp-cancel" style="flex:1">Cancel</button>
      </div>`;
    frag.appendChild(addForm);

    // ── Expense list ──
    if (!expenses.length) {
      frag.appendChild(Object.assign(document.createElement('div'), {className:'empty-state',innerHTML:'<p class="empty-title">No expenses yet</p>'}));
    } else {
      const byDay = {};
      expenses.forEach(e => { const key = e.dayId || 'unknown'; if (!byDay[key]) byDay[key]=[]; byDay[key].push(e); });
      Object.entries(byDay).forEach(([dayId, exps]) => {
        const day = Data.getDays().find(d=>d.id===dayId);
        const dayTotal = exps.reduce((s,e)=>s+e.amountJPY,0);
        const sec = document.createElement('div');
        sec.className = 'expense-section';
        sec.innerHTML = `<div class="expense-day-header"><span>${day?.label||dayId} · ${day?.date||''}</span><span>¥${dayTotal.toLocaleString()}</span></div>`;
        exps.forEach(exp => {
          const splitPax = Math.max(1, exp.splitBetween?.length || 1);
          const perHead  = Math.round(exp.amountJPY / splitPax);
          const splitInfo = exp.splitBetween?.length
            ? exp.splitBetween.join(' + ')
            : (exp.paidBy || '');
          const row = document.createElement('div');
          row.className = 'expense-row';
          row.innerHTML = `
            <span class="expense-cat">${exp.category}</span>
            <div class="expense-info">
              <p class="expense-desc">${exp.description}</p>
              <p class="expense-split-line">${exp.paidBy?exp.paidBy+' paid':''} ${splitInfo?'· split '+splitInfo:''} · ¥${perHead.toLocaleString()} pp</p>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <p class="expense-amt">¥${exp.amountJPY.toLocaleString()}</p>
              <p class="expense-per">¥${perHead.toLocaleString()} pp</p>
            </div>
            <button class="expense-del">×</button>`;
          row.querySelector('.expense-del').addEventListener('click', async e => {
            e.stopPropagation();
            await Data.deleteExpense(exp.id);
            Toast.show('Expense removed','info');
            render();
          });
          sec.appendChild(row);
        });
        frag.appendChild(sec);
      });
    }

    // Wire add form after DOM insertion
    setTimeout(() => {
      // Paid-by: single select (radio behavior)
      root.querySelectorAll('.paid-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          root.querySelectorAll('.paid-chip').forEach(c => c.classList.remove('traveler-chip--active'));
          chip.classList.add('traveler-chip--active');
        });
      });
      // Split: toggle (checkbox behavior)
      root.querySelectorAll('.split-chip').forEach(chip => {
        chip.addEventListener('click', () => chip.classList.toggle('traveler-chip--active'));
      });

      root.querySelector('#exp-save')?.addEventListener('click', async () => {
        const g = id => root.querySelector('#'+id)?.value?.trim()||'';
        if (!g('exp-day')||!g('exp-cat')||!g('exp-desc')||!g('exp-amt')) {
          Toast.show('Fill all fields','warning'); return;
        }
        const paidBy = travelers.length
          ? root.querySelector('.paid-chip.traveler-chip--active')?.dataset.name || ''
          : g('exp-paid');
        const splitBetween = travelers.length
          ? [...root.querySelectorAll('.split-chip.traveler-chip--active')].map(c=>c.dataset.name)
          : travelers;
        await Data.addExpense({
          dayId: g('exp-day'), category: g('exp-cat'),
          description: g('exp-desc'), amountJPY: parseInt(g('exp-amt')),
          paidBy, splitBetween,
        });
        Toast.show('Expense logged','success');
        render();
      });
      root.querySelector('#exp-cancel')?.addEventListener('click', () => {
        addForm.style.display = 'none';
        addBtn.style.display = 'block';
      });
    }, 0);

    return frag;
  }

  /* ═══ PACKING ════════════════════════════════════════ */
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
        row.querySelector('input').addEventListener('change', async e => { await Data.togglePacking(item.id, e.target.checked); render(); });
        row.querySelector('.packing-del').addEventListener('click', async () => { await Data.deletePacking(item.id); Toast.show(`${item.item} removed`,'info'); render(); });
        sec.appendChild(row);
      });
      const addRow = document.createElement('div');
      addRow.className = 'packing-add-row';
      addRow.innerHTML = `<input type="text" class="packing-add-input" placeholder="Add to ${cat}…"><button class="packing-add-btn">Add</button>`;
      addRow.querySelector('.packing-add-btn').addEventListener('click', async () => {
        const input = addRow.querySelector('.packing-add-input');
        const text  = input.value.trim();
        if (!text) return;
        await Data.addPackingItem({cat, item:text, essential:false});
        input.value=''; render();
      });
      addRow.querySelector('.packing-add-input').addEventListener('keydown', e => { if(e.key==='Enter') addRow.querySelector('.packing-add-btn').click(); });
      sec.appendChild(addRow);
      frag.appendChild(sec);
    });
    return frag;
  }

  /* ═══ SETTINGS ═══════════════════════════════════════ */
  function renderSettings() {
    const frag = document.createDocumentFragment();
    const travelers = Data.getTravelers();

    // ── Travelers section ──
    const tSection = document.createElement('div');
    tSection.className = 'settings-section';
    tSection.innerHTML = `
      <p class="settings-section-title">Travelers</p>
      <p style="font-size:var(--text-xs);color:var(--text-muted);margin-bottom:var(--s3)">Names are used to split and track expenses. Changes sync to all devices.</p>`;

    const chipWrap = document.createElement('div');
    chipWrap.className = 'split-chips';
    chipWrap.id = 'traveler-chips';

    if (!travelers.length) {
      chipWrap.innerHTML = '<p style="font-size:var(--text-sm);color:var(--text-muted)">No travelers added yet.</p>';
    } else {
      travelers.forEach((name, i) => {
        const chip = document.createElement('span');
        chip.className = 'traveler-chip traveler-chip--active';
        chip.innerHTML = `${name}<button class="traveler-chip-del" data-idx="${i}">×</button>`;
        chip.querySelector('.traveler-chip-del').addEventListener('click', async () => {
          const updated = travelers.filter((_,j)=>j!==i);
          await Data.updateTravelers(updated);
          Toast.show(`${name} removed`,'info');
          render();
        });
        chipWrap.appendChild(chip);
      });
    }
    tSection.appendChild(chipWrap);

    const addRow = document.createElement('div');
    addRow.className = 'traveler-add-row';
    addRow.innerHTML = `
      <input id="traveler-input" class="bs-input" type="text" placeholder="Traveler name (e.g. C, K, or full name)" style="flex:1">
      <button class="btn btn-primary" id="traveler-add-btn">Add</button>`;
    tSection.appendChild(addRow);
    frag.appendChild(tSection);

    // ── Trip settings section ──
    const tripSection = document.createElement('div');
    tripSection.className = 'settings-section';
    tripSection.innerHTML = `
      <p class="settings-section-title">Budget</p>
      <div class="bs-edit-group">
        <label class="bs-edit-label">Budget (RM)</label>
        <input id="cfg-budget" class="bs-input" type="number" value="${Config.BUDGET_MYR}" placeholder="8000">
      </div>
      <div class="bs-edit-group">
        <label class="bs-edit-label">Exchange rate (1 MYR = ? JPY)</label>
        <input id="cfg-rate" class="bs-input" type="number" value="${Config.EXCHANGE_RATE_JPY}" placeholder="33">
      </div>
      <button class="btn btn-primary" id="cfg-save-btn" style="width:100%;margin-top:var(--s2)">Save budget settings</button>`;
    frag.appendChild(tripSection);

    // Wire after DOM insertion
    setTimeout(() => {
      root.querySelector('#traveler-add-btn')?.addEventListener('click', async () => {
        const input = root.querySelector('#traveler-input');
        const name  = input?.value?.trim();
        if (!name) return;
        if (travelers.includes(name)) { Toast.show(`${name} already added`,'warning'); return; }
        await Data.updateTravelers([...travelers, name]);
        Toast.show(`${name} added as traveler`,'success');
        render();
      });
      root.querySelector('#traveler-input')?.addEventListener('keydown', e => {
        if (e.key==='Enter') root.querySelector('#traveler-add-btn')?.click();
      });
      root.querySelector('#cfg-save-btn')?.addEventListener('click', () => {
        const budget = parseInt(root.querySelector('#cfg-budget')?.value) || Config.BUDGET_MYR;
        const rate   = parseInt(root.querySelector('#cfg-rate')?.value)   || Config.EXCHANGE_RATE_JPY;
        Config.BUDGET_MYR = budget;
        Config.EXCHANGE_RATE_JPY = rate;
        Toast.show('Budget settings saved','success');
        render();
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
    if      (activeTab==='bookings') content.appendChild(renderBookings());
    else if (activeTab==='accom')    content.appendChild(renderAccom());
    else if (activeTab==='budget')   content.appendChild(renderBudget());
    else if (activeTab==='packing')  content.appendChild(renderPacking());
    else                             content.appendChild(renderSettings());
    root.appendChild(content);
  }

  return {
    init(el) { root=el; render(); },
    destroy() { root=null; },
    refresh() { render(); },
  };
})();

window.BookingsScreen = BookingsScreen;
