'use strict';

const BookingsScreen = (() => {
  let root;
  let activeTab = 'bookings'; // 'bookings' | 'budget' | 'packing'
  let bookingFilter = 'all';

  const EXPENSE_CATS = ['Food','Transport','Accommodation','Activities','Shopping','Other'];

  /* ─── Sub-tab nav ──────────────────────────────────────── */
  function tabBar() {
    const bar = document.createElement('div');
    bar.className = 'sub-tab-bar';
    [['bookings','Bookings'],['budget','Budget'],['packing','Packing']].forEach(([id,lbl]) => {
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

    // Stats row
    const stats = document.createElement('div');
    stats.className = 'booking-stats';
    stats.innerHTML = `
      <div class="stat-card"><span class="stat-num" style="color:var(--danger-text)">${urgent}</span><span class="stat-label">Urgent</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--warning-text)">${pending}</span><span class="stat-label">Pending</span></div>
      <div class="stat-card"><span class="stat-num" style="color:var(--success-text)">${booked}</span><span class="stat-label">Booked</span></div>`;
    frag.appendChild(stats);

    // Filter pills
    const pills = document.createElement('div');
    pills.className = 'pill-bar';
    pills.style.padding = '0 var(--s3) var(--s3)';
    ['all','urgent','pending','booked'].forEach(f => {
      const btn = document.createElement('button');
      btn.className = `pill ${bookingFilter === f ? 'active' : ''}`;
      btn.textContent = f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1);
      btn.addEventListener('click', () => { bookingFilter = f; render(); });
      pills.appendChild(btn);
    });
    frag.appendChild(pills);

    const list = document.createElement('div');
    list.className = 'booking-list';
    const items = Data.getBookingsList().filter(s => bookingFilter === 'all' || s.booking.status === bookingFilter);
    const statusCls = { booked:'badge-booked', pending:'badge-pending', urgent:'badge-urgent', open:'badge-open' };
    const statusLbl = { booked:'✓ Booked', pending:'Pending', urgent:'⚡ Urgent', open:'Open' };

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

  /* ═══ BUDGET TAB ════════════════════════════════════════ */
  function renderBudget() {
    const frag = document.createDocumentFragment();
    const totalJPY  = Data.getTotalSpentJPY();
    const budgetJPY = Config.BUDGET_MYR * Config.EXCHANGE_RATE_JPY;
    const pct       = Math.min(100, Math.round(totalJPY / budgetJPY * 100));

    const header = document.createElement('div');
    header.className = 'budget-header';
    header.innerHTML = `
      <div class="budget-total">
        <p class="budget-spent">¥${totalJPY.toLocaleString()}</p>
        <p class="budget-of">of ¥${budgetJPY.toLocaleString()} (RM${Config.BUDGET_MYR.toLocaleString()})</p>
        <div class="budget-bar"><div class="budget-fill" style="width:${pct}%;background:${pct>90?'var(--danger-text)':pct>70?'var(--warning-text)':'var(--accent)'}"></div></div>
        <p class="budget-remaining">¥${(budgetJPY - totalJPY).toLocaleString()} remaining · ${100 - pct}%</p>
      </div>
      <button class="btn btn-primary" id="add-expense-btn" style="flex-shrink:0">+ Add</button>`;
    frag.appendChild(header);

    const expenses = Data.getExpenses();
    if (!expenses.length) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.innerHTML = `<p class="empty-title">No expenses yet</p><p class="empty-sub">Tap + Add to log your first spend.</p>`;
      frag.appendChild(empty);
    } else {
      // Group by day
      const byDay = {};
      expenses.forEach(e => { if (!byDay[e.dayId]) byDay[e.dayId]=[]; byDay[e.dayId].push(e); });
      Object.entries(byDay).forEach(([dayId, exps]) => {
        const day    = Data.getDays().find(d => d.id === dayId);
        const dayTotal = exps.reduce((s,e) => s + e.amountJPY, 0);
        const sec = document.createElement('div');
        sec.className = 'expense-section';
        sec.innerHTML = `<div class="expense-day-header"><span>${day?.label || dayId} · ${day?.date || ''}</span><span>¥${dayTotal.toLocaleString()}</span></div>`;
        exps.forEach(exp => {
          const row = document.createElement('div');
          row.className = 'expense-row';
          row.innerHTML = `
            <span class="expense-cat">${exp.category}</span>
            <span class="expense-desc">${exp.description}</span>
            <span class="expense-amt">¥${exp.amountJPY.toLocaleString()}</span>
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

    // Add expense modal (inline below)
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
      <div style="display:flex;gap:8px;margin-top:8px">
        <button class="btn btn-primary" id="exp-save" style="flex:1">Save</button>
        <button class="btn btn-ghost" id="exp-cancel" style="flex:1">Cancel</button>
      </div>`;
    frag.appendChild(addForm);

    setTimeout(() => {
      root.querySelector('#add-expense-btn')?.addEventListener('click', () => {
        addForm.style.display = addForm.style.display === 'none' ? 'block' : 'none';
      });
      root.querySelector('#exp-save')?.addEventListener('click', async () => {
        const dayId = root.querySelector('#exp-day').value;
        const cat   = root.querySelector('#exp-cat').value;
        const desc  = root.querySelector('#exp-desc').value.trim();
        const amt   = parseInt(root.querySelector('#exp-amt').value);
        if (!dayId || !cat || !desc || !amt) { Toast.show('Fill all fields', 'warning'); return; }
        await Data.addExpense({ dayId, category:cat, description:desc, amountJPY:amt });
        Toast.show(`¥${amt.toLocaleString()} logged`, 'success');
        render();
      });
      root.querySelector('#exp-cancel')?.addEventListener('click', () => { addForm.style.display = 'none'; });
    }, 0);

    return frag;
  }

  /* ═══ PACKING TAB ═══════════════════════════════════════ */
  function renderPacking() {
    const frag = document.createDocumentFragment();
    const items  = Data.getPackingItems();
    const done   = items.filter(i => i.checked).length;
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
        const row = document.createElement('label');
        row.className = `packing-row ${item.checked ? 'packing-row--done' : ''} ${item.essential ? 'packing-row--essential' : ''}`;
        row.innerHTML = `<input type="checkbox" ${item.checked ? 'checked' : ''} style="accent-color:var(--accent);width:16px;height:16px;flex-shrink:0"><span class="packing-item">${item.item}</span>${item.essential ? '<span class="packing-tag">Essential</span>' : ''}`;
        row.querySelector('input').addEventListener('change', async (e) => {
          await Data.togglePacking(item.id, e.target.checked);
          render();
        });
        sec.appendChild(row);
      });
      frag.appendChild(sec);
    });
    return frag;
  }

  /* ─── Main render ──────────────────────────────────────── */
  function render() {
    if (!root) return;
    root.innerHTML = '';
    root.appendChild(tabBar());
    const content = document.createElement('div');
    content.style.padding = '0 var(--s3)';

    if (activeTab === 'bookings') content.appendChild(renderBookings());
    else if (activeTab === 'budget') content.appendChild(renderBudget());
    else content.appendChild(renderPacking());
    root.appendChild(content);
  }

  return {
    init(el) { root = el; render(); },
    destroy() { root = null; },
    refresh() { render(); },
  };
})();

window.BookingsScreen = BookingsScreen;
