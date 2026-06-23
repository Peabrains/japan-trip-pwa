'use strict';

const BookingsScreen = (() => {
  let root;
  let activeTab = 'bookings';
  let bookingFilter = 'all';
  const EXPENSE_CATS = ['Food','Transport','Accommodation','Activities','Shopping','Other'];

  /* ─── Sub-tab nav ───────────────────────────────────────── */
  function tabBar() {
    const bar = document.createElement('div');
    bar.className = 'sub-tab-bar';
    [['bookings','Bookings'],['accom','Stays'],['budget','Budget'],['packing','Packing']].forEach(([id,lbl]) => {
      const btn = document.createElement('button');
      btn.className = `sub-tab ${activeTab === id ? 'sub-tab--active' : ''}`;
      btn.textContent = lbl;
      btn.addEventListener('click', () => { activeTab = id; render(); });
      bar.appendChild(btn);
    });
    return bar;
  }

  /* ═══ BOOKINGS TAB ══════════════════════════════════════ */
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
    pills.style.padding = '0 var(--s3) var(--s3)';
    ['all','urgent','pending','booked'].forEach(f => {
      const btn = document.createElement('button');
      btn.className = `pill ${bookingFilter === f ? 'active' : ''}`;
      btn.textContent = f === 'all' ? 'All' : f.charAt(0).toUpperCase()+f.slice(1);
      btn.addEventListener('click', () => { bookingFilter = f; render(); });
      pills.appendChild(btn);
    });
    frag.appendChild(pills);

    const list = document.createElement('div');
    list.className = 'booking-list';
    const statusCls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'};
    const statusLbl = {booked:'✓ Booked',pending:'Pending',urgent:'⚡ Urgent',open:'Open'};
    const items = Data.getBookingsList().filter(s => bookingFilter === 'all' || s.booking.status === bookingFilter);

    if (!items.length) {
      list.innerHTML = `<div class="empty-state"><p class="empty-title">Nothing here</p><p class="empty-sub">All clear for this filter.</p></div>`;
    } else {
      items.forEach(stop => {
        const day = Data.getDays().find(d => d.id === stop.dayId);
        const row = document.createElement('div');
        row.className = 'booking-row';
        row.innerHTML = `
          <div class="booking-row-inner">
            <div class="booking-info">
              <p class="booking-name">${stop.name}</p>
              <div class="booking-meta">
                ${day ? `<span>${day.label} · ${day.date}</span>` : ''}
                ${stop.booking.cost ? `<span>¥${stop.booking.cost.toLocaleString()}</span>` : ''}
                ${stop.booking.deadline ? `<span style="color:var(--danger-text)">By ${new Date(stop.booking.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</span>` : ''}
              </div>
            </div>
            <span class="badge ${statusCls[stop.booking.status]}">${statusLbl[stop.booking.status]}</span>
          </div>`;
        row.addEventListener('click', () => BottomSheet.openStop(stop, day));
        list.appendChild(row);
      });
    }
    frag.appendChild(list);
    return frag;
  }

  /* ═══ STAYS / ACCOMMODATIONS TAB ════════════════════════ */
  function renderAccom() {
    const frag = document.createDocumentFragment();

    const hdr = document.createElement('p');
    hdr.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);padding:var(--s3) 0 var(--s2);text-transform:uppercase;letter-spacing:.05em;font-weight:500';
    hdr.textContent = 'All overnight stays in day order';
    frag.appendChild(hdr);

    const statusCls = {booked:'badge-booked',pending:'badge-pending',urgent:'badge-urgent',open:'badge-open'};
    const statusLbl = {booked:'✓ Booked',pending:'Pending',urgent:'⚡ Urgent',open:'Open'};

    // Collect one accommodation per day (last stop that has one)
    const nights = [];
    Data.getDays().forEach(day => {
      const stops = Data.getStopsByDay(day.id);
      const accomStop = [...stops].reverse().find(s => s.accommodation);
      if (accomStop) nights.push({ day, stop: accomStop });
    });

    if (!nights.length) {
      const em = document.createElement('div');
      em.className = 'empty-state';
      em.innerHTML = '<p class="empty-title">No accommodations listed</p><p class="empty-sub">Tap any stop → Edit → add where you\'re staying each night.</p>';
      frag.appendChild(em);
      return frag;
    }

    nights.forEach(({ day, stop }) => {
      const cls = statusCls[stop.booking.status] || 'badge-open';
      const lbl = statusLbl[stop.booking.status] || 'Open';
      const card = document.createElement('div');
      card.className = 'card';
      card.style.marginBottom = 'var(--s2)';
      card.style.cursor = 'pointer';

      const inner = document.createElement('div');
      inner.style.cssText = 'padding:12px var(--s3);display:flex;align-items:flex-start;gap:var(--s2);min-height:var(--touch)';

      const left = document.createElement('div');
      left.style.cssText = 'flex:1;min-width:0';
      left.innerHTML = `
        <div style="display:flex;align-items:center;gap:6px;margin-bottom:3px">
          <span class="badge badge-open" style="font-size:9px;padding:1px 6px">${day.label}</span>
          <span style="font-size:var(--text-xs);color:var(--text-muted)">${day.date}</span>
        </div>
        <p style="font-weight:500;font-size:var(--text-sm);color:var(--text-primary)">${stop.accommodation}</p>
        ${stop.booking.ref ? `<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">Ref: ${stop.booking.ref}</p>` : ''}
        ${stop.booking.cost ? `<p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">¥${stop.booking.cost.toLocaleString()}</p>` : ''}
        ${stop.booking.deadline ? `<p style="font-size:var(--text-xs);color:var(--danger-text);margin-top:2px">Book by ${new Date(stop.booking.deadline).toLocaleDateString('en-GB',{day:'numeric',month:'short'})}</p>` : ''}
        <p style="font-size:var(--text-xs);color:var(--text-muted);margin-top:2px">${stop.notes || ''}</p>`;

      const badge = document.createElement('span');
      badge.className = `badge ${cls}`;
      badge.textContent = lbl;

      inner.appendChild(left);
      inner.appendChild(badge);
      card.appendChild(inner);
      card.addEventListener('click', () => BottomSheet.openStop(stop, day));
      frag.appendChild(card);
    });

    // Summary count
    const booked = nights.filter(n => n.stop.booking.status === 'booked').length;
    const summary = document.createElement('p');
    summary.style.cssText = 'font-size:var(--text-xs);color:var(--text-muted);text-align:center;padding:var(--s3) 0';
    summary.textContent = `${booked} of ${nights.length} nights confirmed`;
    frag.appendChild(summary);
    return frag;
  }

  /* ═══ BUDGET TAB ════════════════════════════════════════ */
  function renderBudget() {
    const frag = document.createDocumentFragment();
    const pax      = 2;
    const totalJPY = Data.getTotalSpentJPY();
    const budgetJPY= Config.BUDGET_MYR * Config.EXCHANGE_RATE_JPY;
    const pct      = Math.min(100, Math.round(totalJPY / budgetJPY * 100));
    const perPerson= Math.round(totalJPY / pax);

    const header = document.createElement('div');
    header.className = 'budget-header';
    header.innerHTML = `
      <div class="budget-total">
        <p class="budget-spent">¥${totalJPY.toLocaleString()}</p>
        <p class="budget-of">of ¥${budgetJPY.toLocaleString()} (RM${Config.BUDGET_MYR.toLocaleString()})</p>
        <div class="budget-bar"><div class="budget-fill" style="width:${pct}%;background:${pct>90?'var(--danger-text)':pct>70?'var(--warning-text)':'var(--accent)'}"></div></div>
        <p class="budget-remaining">¥${(budgetJPY-totalJPY).toLocaleString()} remaining · ${100-pct}%</p>
        <div class="split-badge">
          ${Icons.users('icon-sm')}
          <span>Per person (÷${pax}):</span>
          <span class="split-amount">¥${perPerson.toLocaleString()}</span>
          <span style="color:var(--text-muted)">≈ RM${Math.round(perPerson/Config.EXCHANGE_RATE_JPY).toLocaleString()}</span>
        </div>
      </div>
      <button class="btn btn-primary" id="add-expense-btn" style="flex-shrink:0;align-self:flex-start">+ Add</button>`;
    frag.appendChild(header);

    const addForm = document.createElement('div');
    addForm.id = 'add-expense-form';
    addForm.className = 'add-expense-form';
    addForm.style.display = 'none';
    addForm.innerHTML = `
      <p class="form-title">Log expense</p>
      <select id="exp-day" class="bs-input"><option value="">Day…</option>${Data.getDays().map(d=>`<option value="${d.id}">${d.label} · ${d.date}</option>`).join('')}</select>
      <select id="exp-cat" class="bs-input"><option value="">Category…</option>${EXPENSE_CATS.map(c=>`<option>${c}</option>`).join('')}</select>
      <input id="exp-desc" class="bs-input" type="text" placeholder="Description">
      <input id="exp-amt" class="bs-input" type="number" placeholder="Amount (¥)">
      <input id="exp-paid" class="bs-input" type="text" placeholder="Paid by (e.g. C, K, or Both)">
      <div class="split-row">
        ${Icons.users('icon-sm')}
        <span>Split between</span>
        <input id="exp-split" class="bs-input" type="number" value="${pax}" min="1" max="10" style="width:56px;text-align:center">
        <span>pax</span>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn btn-primary" id="exp-save" style="flex:1">Save</button>
        <button class="btn btn-ghost" id="exp-cancel" style="flex:1">Cancel</button>
      </div>`;
    frag.appendChild(addForm);

    const expenses = Data.getExpenses();
    if (!expenses.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = '<p class="empty-title">No expenses yet</p><p class="empty-sub">Tap + Add to log your first spend.</p>';
      frag.appendChild(empty);
    } else {
      const byDay = {};
      expenses.forEach(e => { if (!byDay[e.dayId]) byDay[e.dayId]=[]; byDay[e.dayId].push(e); });
      Object.entries(byDay).forEach(([dayId, exps]) => {
        const day = Data.getDays().find(d => d.id === dayId);
        const dayTotal = exps.reduce((s,e) => s+e.amountJPY, 0);
        const sec = document.createElement('div');
        sec.className = 'expense-section';
        sec.innerHTML = `<div class="expense-day-header"><span>${day?.label||dayId} · ${day?.date||''}</span><span>¥${dayTotal.toLocaleString()}</span></div>`;
        exps.forEach(exp => {
          const splitPax = exp.splitPax || pax;
          const perHead  = Math.round(exp.amountJPY / splitPax);
          const row = document.createElement('div');
          row.className = 'expense-row';
          row.innerHTML = `
            <span class="expense-cat">${exp.category}</span>
            <div class="expense-info">
              <p class="expense-desc">${exp.description}</p>
              <p class="expense-split-line">${exp.paidBy ? 'Paid by '+exp.paidBy+' · ' : ''}÷${splitPax} = ¥${perHead.toLocaleString()} pp</p>
            </div>
            <div style="text-align:right;flex-shrink:0">
              <p class="expense-amt">¥${exp.amountJPY.toLocaleString()}</p>
              <p class="expense-per">¥${perHead.toLocaleString()} pp</p>
            </div>
            <button class="expense-del" data-id="${exp.id}">×</button>`;
          row.querySelector('.expense-del').addEventListener('click', async (e) => {
            e.stopPropagation();
            await Data.deleteExpense(exp.id);
            Toast.show('Expense removed', 'info');
            render();
          });
          sec.appendChild(row);
        });
        frag.appendChild(sec);
      });
    }

    setTimeout(() => {
      root.querySelector('#add-expense-btn')?.addEventListener('click', () => {
        const f = root.querySelector('#add-expense-form');
        if (f) f.style.display = f.style.display==='none' ? 'flex' : 'none';
      });
      root.querySelector('#exp-save')?.addEventListener('click', async () => {
        const dayId = root.querySelector('#exp-day').value;
        const cat   = root.querySelector('#exp-cat').value;
        const desc  = root.querySelector('#exp-desc').value.trim();
        const amt   = parseInt(root.querySelector('#exp-amt').value);
        const paid  = root.querySelector('#exp-paid').value.trim();
        const split = parseInt(root.querySelector('#exp-split').value) || pax;
        if (!dayId||!cat||!desc||!amt) { Toast.show('Fill all fields','warning'); return; }
        await Data.addExpense({dayId,category:cat,description:desc,amountJPY:amt,paidBy:paid,splitPax:split});
        Toast.show('¥'+amt.toLocaleString()+' logged (¥'+Math.round(amt/split).toLocaleString()+' pp)','success');
        render();
      });
      root.querySelector('#exp-cancel')?.addEventListener('click', () => {
        const f = root.querySelector('#add-expense-form');
        if (f) f.style.display = 'none';
      });
    }, 0);

    return frag;
  }

  /* ═══ PACKING TAB ═══════════════════════════════════════ */
  function renderPacking() {
    const frag = document.createDocumentFragment();
    const items = Data.getPackingItems();
    const done  = items.filter(i => i.checked).length;

    const header = document.createElement('div');
    header.className = 'packing-header';
    header.innerHTML = `<span>${done}/${items.length} packed</span><div class="budget-bar" style="flex:1;margin-left:12px"><div class="budget-fill" style="width:${items.length ? Math.round(done/items.length*100) : 0}%;background:var(--success-text)"></div></div>`;
    frag.appendChild(header);

    const bycat = Data.getPackingByCategory();
    Object.entries(bycat).forEach(([cat, catItems]) => {
      const sec = document.createElement('div');
      sec.className = 'packing-section';
      const doneInCat = catItems.filter(i=>i.checked).length;
      sec.innerHTML = `<div class="packing-cat-header"><span>${cat}</span><span>${doneInCat}/${catItems.length}</span></div>`;

      catItems.forEach(item => {
        const row = document.createElement('div');
        row.className = `packing-row ${item.checked ? 'packing-row--done' : ''}`;
        row.innerHTML = `
          <input type="checkbox" ${item.checked?'checked':''} style="accent-color:var(--accent);width:16px;height:16px;flex-shrink:0;cursor:pointer">
          <span class="packing-item">${item.item}</span>
          ${item.essential ? '<span class="packing-tag">Essential</span>' : ''}
          <button class="packing-del" title="Remove">×</button>`;
        row.querySelector('input').addEventListener('change', async (e) => {
          await Data.togglePacking(item.id, e.target.checked);
          render();
        });
        row.querySelector('.packing-del').addEventListener('click', async () => {
          await Data.deletePacking(item.id);
          Toast.show(`${item.item} removed`, 'info');
          render();
        });
        sec.appendChild(row);
      });

      const addRow = document.createElement('div');
      addRow.className = 'packing-add-row';
      addRow.innerHTML = `
        <input type="text" class="packing-add-input" placeholder="Add item to ${cat}…">
        <button class="packing-add-btn">Add</button>`;
      addRow.querySelector('.packing-add-btn').addEventListener('click', async () => {
        const input = addRow.querySelector('.packing-add-input');
        const text  = input.value.trim();
        if (!text) return;
        await Data.addPackingItem({cat, item:text, essential:false});
        Toast.show(`${text} added`, 'success');
        input.value = '';
        render();
      });
      addRow.querySelector('.packing-add-input').addEventListener('keydown', e => {
        if (e.key === 'Enter') addRow.querySelector('.packing-add-btn').click();
      });
      sec.appendChild(addRow);
      frag.appendChild(sec);
    });
    return frag;
  }

  /* ─── Main render ───────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(tabBar());
    const content = document.createElement('div');
    content.style.padding = '0 var(--s3)';
    if      (activeTab === 'bookings') content.appendChild(renderBookings());
    else if (activeTab === 'accom')    content.appendChild(renderAccom());
    else if (activeTab === 'budget')   content.appendChild(renderBudget());
    else                               content.appendChild(renderPacking());
    root.appendChild(content);
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.BookingsScreen = BookingsScreen;
