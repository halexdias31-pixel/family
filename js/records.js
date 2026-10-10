/* ==================================================================================================
   BUSINESS RECORDS — insurance, tax, legal, safeguarding: the paperwork a tutoring business keeps.

   PAGES OF THE SETTINGS COLUMN, FOR AN ADMIN AND NOBODY ELSE. They were a widget on the Tools column,
   a register you added rows to. *"no the business stuff should not be on tools it should be on the
   account settings column. only admin sees. also it should be like everything else, like e.g. public
   liability insurance:________ then i have to enter that bit in."* So it is a FORM now, shaped like
   every other settings page: a fixed list of things, each a caption with its boxes beside each other
   (the library shelf's `.lib-row`), and one Save per page through `send_`.

   A FIXED LIST RATHER THAN A REGISTER, and that is the whole of what changed. Each item has a slug
   (`pub_liability`) that is its `record_id` in the Ledger's `records` tab, so the tab keeps its shape
   and a row is found by what it IS rather than by an id the phone invented. What somebody fills in
   is a reference and a date — and for insurance, who provides it. It is advice about what to keep,
   not a statement of what the law requires of this business: employers' liability and Companies
   House depend on how the business is set up, and the placeholders say so.

   THE DATE IS MARKED WHEN IT IS NEAR, which is what the register was for: past it and the caption
   says Overdue, within thirty days Due soon. Only on a date that is a DEADLINE — a registration or
   the day an account was opened is in the past on purpose, and calling it overdue would be a red
   flag on something that is fine. `track: false` says which.

   A POST AND NEVER THE PAYLOAD — see backend/records.gs. `listRecords` is asked once, when an admin
   first arrives at the column (`bizStart_`, from `startScreen_`). Until it answers, Save refuses: a
   page saved before the rows arrived would post six empty boxes over whatever the sheet holds.
================================================================================================== */
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
const bizSaid_ = () => BIZ.error ? BIZ.error : BIZ.list ? '' : 'Fetching what is recorded…';

function bizItem_(item) {
  const r = bizRow_(item.id);
  const st = bizState_(item, r.due_on);
  /* EACH BOX A DRAFT UNTIL ITS CARD IS SAVED (data.js; docs/history/317): a provider, a reference and a
     date typed and not yet saved went with a reload. Drawn holding the draft, with the recorded value as
     the one that takes it away (`bizFill_` keeps that value current once the records arrive). */
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

function bizCard_(pg) {
  return `<div class="card biz"><div class="me-form" data-biz-page="${esc(pg.title)}">
    <h3>${esc(pg.title)}</h3>
    ${pg.items.map(bizItem_).join('')}
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'biz-save' })}</div>
    <p class="faint me-said biz-said">${esc(bizSaid_())}</p>
  </div></div>`;
}

/* THE PAGES, OR NONE. A card is not a permission — `listRecords` and `saveRecordsPage` are `admin` in
   `ACTION_ACCESS` — but a page a non-admin cannot use is a page they should not have to swipe past. */
function bizPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  return BIZ_PAGES.map(bizCard_);
}

/* WHAT ARRIVED, WRITTEN INTO THE CARDS ALREADY ON THE PAGE rather than a repaint of the column. A
   repaint throws away every pane's fitted zoom and the column is re-measured a frame later; filling
   the boxes in place changes a few values and a caption, and the cards stay the elements
   `paneWatch_` is already watching. A card with something typed into it is left alone — the same
   rule `settingsKeep_` applies to the whole column. */
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
}
const bizFillAll_ = () => document.querySelectorAll('.me-form[data-biz-page]')
  .forEach(f => { if (!f.dataset.dirty && !f.classList.contains('is-sending')) bizFill_(f); });

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
                    : 'Still fetching what is recorded — a moment.');
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
