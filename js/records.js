/* BUSINESS RECORDS — insurance, tax, legal, safeguarding: § */
const BIZ_SOON_DAYS = 30;
const BIZ_PAGES = [
  { title: 'Insurance', items: [
    { id: 'pub_liability', title: 'Public liability insurance', provider: true, ref: 'Policy no.', due: 'Renews' },
    { id: 'prof_indemnity', title: 'Professional indemnity insurance', provider: true, ref: 'Policy no.', due: 'Renews' },
    { id: 'employers_liability', title: "Employers' liability insurance", provider: true,
      ref: 'Policy no. (once you employ)', due: 'Renews' },
  ] },
  { title: 'Tax', items: [
    { id: 'hmrc_utr', title: 'HMRC self-assessment (UTR)', ref: 'UTR', due: 'Registered', track: false },
    { id: 'tax_return', title: 'Self-assessment tax return', ref: 'Tax year, e.g. 2025–26', due: 'Due' },
    { id: 'payments_on_account', title: 'Payments on account', ref: 'Amount', due: 'Next due' },
    { id: 'vat', title: 'VAT', ref: 'VAT no., if registered', due: 'Check by' },
  ] },
  { title: 'Legal and data', items: [
    { id: 'ico_fee', title: 'ICO data protection fee', ref: 'Registration no.', due: 'Renews' },
    { id: 'privacy_notice', title: 'Privacy notice', ref: 'Version', due: 'Review by' },
    { id: 'family_terms', title: 'Terms and conditions for families', ref: 'Version', due: 'Review by' },
    { id: 'tutor_agreements', title: 'Tutor agreements', ref: 'Version', due: 'Review by' },
  ] },
  { title: 'Safeguarding', items: [
    { id: 'safeguarding_policy', title: 'Safeguarding policy', ref: 'Version', due: 'Review by' },
    { id: 'dbs_checks', title: 'Enhanced DBS checks', ref: 'Certificate no.', due: 'Check by' },
    { id: 'safeguarding_training', title: 'Safeguarding training', ref: 'Course', due: 'Refresh by' },
  ] },
  { title: 'Money and company', items: [
    { id: 'bank_account', title: 'Business bank account', ref: 'Bank', due: 'Opened', track: false },
    { id: 'bookkeeping', title: 'Bookkeeping and receipts', ref: 'Kept where', due: 'Next check' },
    { id: 'ch_confirmation', title: 'Companies House confirmation', ref: 'Company no., if limited', due: 'Due' },
    { id: 'company_accounts', title: 'Company accounts', ref: 'Company no., if limited', due: 'Due' },
  ] },
];

/* `list` is null until `listRecords` answers — the difference between "nothing recorded" and "not
   asked yet", which Save has to know. */
const BIZ = { list: null, asking: false, error: '' };

const recDays_ = iso => {
  const m = String(iso || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3]);
  const now = new Date(); now.setHours(0, 0, 0, 0);
  return Math.round((d - now) / 864e5);
};
const bizState_ = (item, iso) => {
  if (item.track === false) return '';
  const n = recDays_(iso);
  return n == null ? '' : n < 0 ? 'overdue' : n <= BIZ_SOON_DAYS ? 'soon' : '';
};
const bizRow_ = id => (BIZ.list || []).find(r => r.id === id) || {};

const bizCap_ = (item, st) => `${esc(item.title)} <span class="biz-when">· ${esc(item.due.toLowerCase())}</span>${
  st ? ` <b class="biz-flag">${st === 'overdue' ? 'Overdue' : 'Due soon'}</b>` : ''}`;
/* THE CARD'S OWN LINE SAYS ONLY A REFUSAL NOW. § */
const bizSaid_ = () => BIZ.error || '';
/* WAITING: asked and not yet answered. A refusal is an answer, and draws the boxes with it. */
const bizWaiting_ = () => !BIZ.list && !BIZ.error;

function bizItem_(item) {
  const r = bizRow_(item.id);
  const st = bizState_(item, r.due_on);
  /* EACH BOX A DRAFT UNTIL ITS CARD IS SAVED (data.js; docs/history/317): § */
  const box = (k, ph, v, extra) => `<label class="field"><input type="${k === 'due_on' ? 'date' : 'text'}"
      data-biz="${esc(item.id)}" data-k="${k}" value="${esc(draftVal_('rec', item.id + ':' + k, v || ''))}" placeholder="${esc(ph)}"
      aria-label="${esc(item.title + ' — ' + ph)}" autocomplete="off" ${extra || ''}${draftAttr_('rec', item.id + ':' + k, v || '')}></label>`;
  const date = box('due_on', item.due.toLowerCase(), r.due_on);
  const ref = box('reference', item.ref, r.reference);
  /* THE DATE'S MEANING IS IN THE CAPTION — `renews`, `due`, `review by` — because a date input draws
     no placeholder: the box says dd/mm/yyyy whatever it is for. */
  return `<div class="biz-item${st ? ' is-' + st : ''}" data-item="${esc(item.id)}">
    <p class="biz-cap">${bizCap_(item, st)}</p>
    ${item.provider
      ? `<div class="lib-row q-row">${box('provider', 'Provider', r.provider)}${ref}</div>${date}`
      : `<div class="lib-row q-row">${ref}${date}</div>`}
  </div>`;
}

/* ---------- UNTIL THE SHEET HAS ANSWERED, THE BOXES ARE UNDER THE ONE LOADER § */
function bizCard_(pg) {
  const wait = bizWaiting_() && typeof loading_ === 'function';
  return `<div class="card biz"><div class="me-form" data-biz-page="${esc(pg.title)}">
    <h3>${esc(pg.title)}</h3>
    <div class="biz-body"${wait ? ' aria-busy="true"' : ''}>
      ${pg.items.map(bizItem_).join('')}
      <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'biz-save' })}</div>
    ${wait ? loading_() : ''}</div>
    <p class="faint me-said biz-said">${esc(bizSaid_())}</p>
  </div></div>`;
}

/* THE PAGES, OR NONE. A card is not a permission — `listRecords` and `saveRecordsPage` are `admin` in `ACTION_ACCESS` — but a page a non-admin cannot use is a § */
function bizPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return BIZ_PAGES.map(bizCard_);
}

/* THE COLUMN, AND ITS RECORDS ASKED FOR AS SOON AS IT IS DRAWN FOR AN ADMIN — not when it is arrived at. § */
screen('biz', () => {
  if (typeof isAdmin === 'function' && isAdmin()) setTimeout(() => { try { bizStart_(); } catch (e) {} }, 0);
  return pages('biz', bizPages_());
});

/* WHAT ARRIVED, WRITTEN INTO THE CARDS ALREADY ON THE PAGE rather than a repaint of the column. § */
function bizFill_(form) {
  const pg = BIZ_PAGES.find(p => p.title === form.dataset.bizPage);
  if (!pg) return;
  pg.items.forEach(item => {
    const r = bizRow_(item.id);
    const st = bizState_(item, r.due_on);
    const it = form.querySelector(`.biz-item[data-item="${item.id}"]`);
    if (!it) return;
    it.classList.toggle('is-soon', st === 'soon');
    it.classList.toggle('is-overdue', st === 'overdue');
    const cap = it.querySelector('.biz-cap');
    if (cap) cap.innerHTML = bizCap_(item, st);
    it.querySelectorAll('[data-biz]').forEach(b => {
      const was = r[b.dataset.k] || '';
      b.setAttribute('data-draft-was', was);
      b.value = draftVal_('rec', item.id + ':' + b.dataset.k, was);
    });
  });
  const said = form.querySelector('.biz-said');
  if (said) said.textContent = bizSaid_();
  /* AND THE LOADER COMES OFF, with the values already in the boxes under it — so they appear filled
     rather than empty and then filled. A refusal takes it off too: it is an answer, not a wait. */
  if (!bizWaiting_() && typeof loaded_ === 'function') loaded_(form.querySelector('.biz-body'));
}
const bizFillAll_ = () => document.querySelectorAll('.me-form[data-biz-page]')
  .forEach(f => {
    if (!f.dataset.dirty && !f.classList.contains('is-sending')) bizFill_(f);
    /* A CARD KEPT FOR WHAT IS TYPED IN IT IS NOT FILLED, AND IT STOPS WAITING ALL THE SAME — the loader
       is about the answer having come, and it has. */
    else if (!bizWaiting_() && typeof loaded_ === 'function') loaded_(f.querySelector('.biz-body'));
  });

function bizStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || BIZ.list || BIZ.asking) return;
  BIZ.asking = true; BIZ.error = '';
  api({ action: 'listRecords', name: USER && USER.name })
    .then(d => {
      BIZ.asking = false;
      if (d && d.error) BIZ.error = String(d.error);
      else BIZ.list = (d && Array.isArray(d.records)) ? d.records : [];
    })
    .catch(() => { BIZ.asking = false; BIZ.error = 'The records could not be fetched — check the connection.'; })
    .then(bizFillAll_);
}

on('biz-save', el => {
  const form = el.closest('.me-form');
  if (!form || !isAdmin()) return;
  if (!BIZ.list) {
    toast(BIZ.error ? 'The records have not loaded, so nothing was saved — trying again.'
                    : 'The records are still on their way — a moment.');
    if (BIZ.error) { BIZ.error = ''; bizStart_(); }
    return;
  }
  const pg = BIZ_PAGES.find(p => p.title === form.dataset.bizPage);
  if (!pg) return;
  const records = pg.items.map(item => {
    const out = { id: item.id, title: item.title, category: pg.title };
    form.querySelectorAll(`[data-biz="${item.id}"]`).forEach(b => { out[b.dataset.k] = String(b.value || '').trim(); });
    return out;
  });
  send_({ action: 'saveRecordsPage', name: USER && USER.name, records },
        { button: el, where: form.querySelector('.biz-said'), busy: 'Saving…' })
    .then(d => {
      const got = (d && Array.isArray(d.records)) ? d.records : records;
      const ids = new Set(got.map(r => r.id));
      BIZ.list = (BIZ.list || []).filter(r => !ids.has(r.id)).concat(got);
      delete form.dataset.dirty;
      /* SAVED, SO THIS CARD'S DRAFTS GO. */
      records.forEach(r => ['provider', 'reference', 'due_on'].forEach(k => { try { draftDrop_('rec', r.id + ':' + k); } catch (e) {} }));
      /* THIS CARD ONLY — the flags follow the dates just saved, and another card with something
         typed into it is not touched. */
      bizFill_(form);
      toast('Saved');
    })
    .catch(() => {});
});
