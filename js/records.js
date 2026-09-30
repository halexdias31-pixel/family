/* ==================================================================================================
   BUSINESS RECORDS — insurance, tax, legal, safeguarding: the paperwork a tutoring business keeps.

   AN ADMIN'S TOOL, on the Tools column beside the flyer maker (`admin: true` on its roster entry,
   and `widgetFor_` is the one test every door asks). The rows live in the Ledger's `records` tab and
   come by a POST — see backend/records.gs for why never the payload.

   THE REGISTER IS SORTED BY WHEN THINGS FALL DUE, because that is the question it exists to answer:
   what needs doing next. Anything past its date is marked overdue and anything within thirty days
   due soon, and the line at the top counts both, so opening the tool is enough to know.

   A RECORD IS ONE LINE UNTIL IT IS OPENED — the qualification shelf's shape: the summary line, then
   the boxes in place, one open at a time, with Save, Open the document and Remove as tiles.

   AND WHAT IS NOT RECORDED YET IS LISTED UNDER IT. `REC_CHECKLIST` is what a small UK tutoring
   business normally has to hold, each with one line saying why; an item whose title matches a
   record is left off, and tapping one opens a new record already named. It is advice about what to
   keep, not a statement of what is legally required of this business — whether employers' liability
   or Companies House applies depends on how the business is set up, and each line says so.
================================================================================================== */
const REC_CATEGORIES = ['Insurance', 'Tax', 'Legal', 'Safeguarding', 'Money', 'Company', 'Other'];
const REC_SOON_DAYS = 30;
const REC_CHECKLIST = [
  { category: 'Insurance', title: 'Public liability insurance',
    why: 'Cover if somebody is hurt or property is damaged during a session, at a home or a venue.' },
  { category: 'Insurance', title: 'Professional indemnity insurance',
    why: 'Cover if a family claims your teaching or advice caused them a loss.' },
  { category: 'Insurance', title: "Employers' liability insurance",
    why: 'Required by law once you employ anybody. Self-employed tutors usually do not count — check.' },
  { category: 'Tax', title: 'HMRC self-assessment registration (UTR)',
    why: 'Register by 5 October after the tax year you started trading.' },
  { category: 'Tax', title: 'Self-assessment tax return',
    why: 'Filed online by 31 January after the tax year ends on 5 April.' },
  { category: 'Tax', title: 'Payments on account',
    why: 'Due 31 January and 31 July when the last tax bill was over £1,000.' },
  { category: 'Tax', title: 'VAT threshold check',
    why: 'Register for VAT if turnover in any 12 months passes the threshold (£90,000 from April 2024).' },
  { category: 'Legal', title: 'ICO data protection fee',
    why: 'Most businesses holding personal data pay the ICO a yearly fee — renews every year.' },
  { category: 'Legal', title: 'Privacy notice',
    why: 'What you hold about families and children, why, and for how long.' },
  { category: 'Legal', title: 'Terms and conditions for families',
    why: 'Prices, cancellations and what happens if a session is missed.' },
  { category: 'Legal', title: 'Tutor agreements',
    why: 'The agreement each tutor signs, and which version they signed.' },
  { category: 'Safeguarding', title: 'Safeguarding policy',
    why: 'Written, dated, and reviewed at least once a year.' },
  { category: 'Safeguarding', title: 'Enhanced DBS checks',
    why: 'One per person who teaches children — the Update Service keeps them current.' },
  { category: 'Safeguarding', title: 'Safeguarding training',
    why: 'Who has done it and when it needs refreshing.' },
  { category: 'Money', title: 'Business bank account',
    why: 'Keeps business money apart from personal money, which makes the tax return far simpler.' },
  { category: 'Money', title: 'Bookkeeping and receipts',
    why: 'Income and expenses for the year, kept for at least five years after the return is due.' },
  { category: 'Company', title: 'Companies House confirmation statement',
    why: 'Only if the business is a limited company: filed every year.' },
  { category: 'Company', title: 'Company accounts',
    why: 'Only if the business is a limited company: filed with Companies House every year.' },
];

const REC = { list: null, error: '', open: null, draft: null, todo: false };

const recDays_ = iso => {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 864e5);
};
const recState_ = r => {
  const n = recDays_(r.due_on);
  return n == null ? '' : n < 0 ? 'overdue' : n <= REC_SOON_DAYS ? 'soon' : '';
};
const recDate_ = iso => {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return '';
  return new Date(+m[1], +m[2] - 1, +m[3]).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

function recordsHtml_() {
  if (REC.error) {
    return `<p class="note">${esc(REC.error)}</p>
      <div class="tile-row">${tile_({ icon: 'undo', label: 'Try again', act: 'rec-load' })}</div>`;
  }
  if (!REC.list) return `<p class="faint">Loading the records…</p>`;
  const list = REC.list.slice().sort((a, b) => {
    const x = recDays_(a.due_on), y = recDays_(b.due_on);
    return (x == null ? 1e9 : x) - (y == null ? 1e9 : y) || a.title.localeCompare(b.title);
  });
  const over = list.filter(r => recState_(r) === 'overdue').length;
  const soon = list.filter(r => recState_(r) === 'soon').length;
  const head = !list.length ? 'Nothing recorded yet — start with the list below.'
    : [over ? over + ' overdue' : '', soon ? soon + ' due within ' + REC_SOON_DAYS + ' days' : '']
        .filter(Boolean).join(' · ') || 'Nothing due in the next ' + REC_SOON_DAYS + ' days.';
  const have = new Set(list.map(r => norm(r.title)));
  const todo = REC_CHECKLIST.filter(c => !have.has(norm(c.title)));
  const rows = list.map(r => recRow_(r)).join('')
    + (REC.open === 'new' ? recRow_(REC.draft || {}, true) : '');
  return `<p class="rec-head${over ? ' is-over' : soon ? ' is-soon' : ''}">${esc(head)}</p>
    <div class="rec-list">${rows}
      <button type="button" class="q-sum rec-add" data-do="rec-new"><span class="q-sum-t">+ Add a record</span></button>
    </div>
    ${/* ONE LINE UNTIL OPENED, like everything else here: eighteen items with a sentence each made the
          card taller than a phone and it was drawn small to fit. The sentence is shown on the record
          it opens, where it is read. */''}
    ${todo.length ? `<button type="button" class="q-sum rec-todo-sum${REC.todo ? '' : ' is-shut'}" data-do="rec-todo"
        aria-expanded="${REC.todo}"><span class="q-sum-t">${todo.length} ${todo.length === 1 ? 'thing' : 'things'} not recorded yet</span></button>
      ${REC.todo ? `<div class="rec-todo">${todo.map(c => `<button type="button" class="rec-todo-i" data-do="rec-new"
        data-i="${REC_CHECKLIST.indexOf(c)}">${esc(c.title)}</button>`).join('')}</div>` : ''}` : ''}`;
}

function recRow_(r, fresh) {
  const id = fresh ? 'new' : r.id;
  const open = REC.open === id;
  const st = fresh ? '' : recState_(r);
  const when = r.due_on ? (st === 'overdue' ? 'overdue since ' : 'due ') + recDate_(r.due_on) : '';
  const say = [r.title || 'New record', r.provider, when].filter(Boolean).join(' · ');
  const f = (k, ph, extra) => `<label class="field"><input type="text" data-rec="${k}" value="${esc(r[k] || '')}"
      placeholder="${esc(ph)}" aria-label="${esc(ph)}" autocomplete="off" ${extra || ''}></label>`;
  return `<div class="rec${open ? '' : ' is-shut'}${st ? ' is-' + st : ''}" data-id="${esc(id)}">
    <button type="button" class="q-sum rec-sum" data-do="rec-open" aria-expanded="${open}"><span class="q-sum-t">${
      st ? `<b class="rec-flag">${st === 'overdue' ? 'Overdue' : 'Due soon'}</b> ` : ''}${esc(say)}</span></button>
    ${open ? `<div class="rec-body">
      ${r.why ? `<p class="rec-why">${esc(r.why)}</p>` : ''}
      <div class="lib-row q-row">
        <label class="field"><select data-rec="category" aria-label="Category">
          ${REC_CATEGORIES.map(c => `<option${(r.category || 'Other') === c ? ' selected' : ''}>${esc(c)}</option>`).join('')}
        </select></label>
        <label class="field"><input type="date" data-rec="due_on" value="${esc(r.due_on || '')}" aria-label="Renews or due"></label>
      </div>
      ${f('title', 'What it is — e.g. Public liability insurance')}
      <div class="lib-row q-row">${f('provider', 'Provider')}${f('reference', 'Policy or reference no.')}</div>
      <div class="lib-row q-row">${f('cost', 'Cost, e.g. £120 a year')}${f('link', 'Link to the document', 'type="url" inputmode="url"')}</div>
      <label class="field"><textarea data-rec="notes" rows="2" placeholder="Notes" aria-label="Notes">${esc(r.notes || '')}</textarea></label>
      <div class="tile-row">
        ${tile_({ icon: 'save', label: 'Save', act: 'rec-save' })}
        ${r.link && /^https?:\/\//i.test(r.link) ? tile_({ icon: 'open', label: 'Open the document', href: r.link }) : ''}
        ${fresh ? '' : tile_({ icon: 'bin', label: 'Remove', act: 'rec-drop' })}
      </div>
      <p class="faint me-said rec-said"></p>
    </div>` : ''}
  </div>`;
}

/* EVERY BOX WITH THE TOOL IN IT — the Tools column and, if it has been starred, the Saved column. */
function recordsPaint_() {
  document.querySelectorAll('.rec-box').forEach(b => { b.innerHTML = recordsHtml_(); });
  if (typeof placeCells === 'function') placeCells('y', true, 0, AT);
}

function recordsLoad_() {
  REC.error = '';
  api({ action: 'listRecords', name: USER && USER.name })
    .then(d => {
      if (d && d.error) { REC.error = String(d.error); REC.list = null; }
      else REC.list = (d && Array.isArray(d.records)) ? d.records : [];
      recordsPaint_();
    })
    .catch(() => { REC.error = 'The records could not be fetched — check the connection.'; recordsPaint_(); });
}

function initRecords() {
  if (!(typeof isAdmin === 'function' && isAdmin())) {
    document.querySelectorAll('.rec-box').forEach(b => { b.innerHTML = ''; });
    return;
  }
  recordsPaint_();
  if (!REC.list) recordsLoad_();
}

/* WHAT IS TYPED, READ OFF THE OPEN RECORD — so a repaint of a list that arrives late keeps it. */
const recRead_ = el => {
  const out = {};
  el.querySelectorAll('[data-rec]').forEach(b => { out[b.dataset.rec] = String(b.value || '').trim(); });
  return out;
};

on('rec-todo', () => { REC.todo = !REC.todo; recordsPaint_(); });
on('rec-load', () => { REC.list = null; recordsPaint_(); recordsLoad_(); });
on('rec-open', el => {
  const id = el.closest('.rec').dataset.id;
  REC.open = REC.open === id ? null : id;
  if (REC.open !== 'new') REC.draft = null;
  recordsPaint_();
});
on('rec-new', el => {
  const c = REC_CHECKLIST[Number(el.dataset.i)];
  REC.draft = c ? { category: c.category, title: c.title, why: c.why } : { category: 'Other' };
  REC.open = 'new';
  recordsPaint_();
});
on('rec-save', el => {
  const row = el.closest('.rec');
  const id = row.dataset.id;
  const record = Object.assign(recRead_(row), id === 'new' ? {} : { id });
  send_({ action: 'saveRecord', name: USER && USER.name, record },
        { button: el, where: row.querySelector('.rec-said'), lock: row })
    .then(d => {
      const saved = d && d.record;
      if (saved) {
        REC.list = (REC.list || []).filter(r => r.id !== saved.id).concat(saved);
      }
      REC.open = null; REC.draft = null;
      toast('Saved');
      recordsPaint_();
    })
    .catch(() => {});
});
on('rec-drop', el => {
  const row = el.closest('.rec');
  const id = row.dataset.id;
  /* TWO PRESSES, not a browser dialogue — the app's own rule (see `sure_` in receipt.js). A tile has
     no word to swap, so the first press lights it and says so; a second within four seconds removes. */
  if (!el.dataset.sure) {
    el.dataset.sure = '1'; el.classList.add('on');
    toast('Press the bin again to remove it. It stays in the sheet, marked inactive.');
    setTimeout(() => { delete el.dataset.sure; el.classList.remove('on'); }, 4000);
    return;
  }
  send_({ action: 'dropRecord', name: USER && USER.name, id }, { button: el, where: row.querySelector('.rec-said') })
    .then(() => { REC.list = (REC.list || []).filter(r => r.id !== id); REC.open = null; toast('Removed'); recordsPaint_(); })
    .catch(() => {});
});
