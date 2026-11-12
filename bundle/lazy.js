/* ==== js/records.js ==== */
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

/* ---------- WHAT NEEDS YOU (400): "maybe the business widgets glow red" — the owner, 24 Oct ----------
   Each Business card registers its count by key (`bizNeed_`) and carries `data-need`; `bizNeedsPaint_` glows it. */
const BIZ_NEEDS = {}, BIZ_NEEDS_NOW = {};
/* `now`: how many of the n are overdue, which glows the card harder (`needs-now`). */
function bizNeed_(key, n, say, now) {
  n = Math.max(0, Math.floor(Number(n) || 0));
  BIZ_NEEDS[key] = n;
  BIZ_NEEDS_NOW[key] = Math.max(0, Math.floor(Number(now) || 0));
  return n ? `<p class="biz-need" role="status">${esc(say)}</p>` : '';
}
function bizNeedsPaint_() {
  document.querySelectorAll('#s-biz [data-need], #s-site [data-need]').forEach(c => { c.classList.toggle('needs-you', (BIZ_NEEDS[c.dataset.need] || 0) > 0); c.classList.toggle('needs-now', (BIZ_NEEDS_NOW[c.dataset.need] || 0) > 0); });
  /* NO DOT IN THE TOP BAR (owner, 6 Nov): what it counted is Find › Settings › Admin › Notifications (`notifyDoorCard_`). */
}
/* THE RECORDS DUE ON ONE CARD: soon or overdue, counted only once the sheet has answered. */
const bizDueCount_ = pg => !BIZ.list ? 0 : pg.items.filter(item => bizState_(item, bizRow_(item.id).due_on)).length;
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

const bizCap_ = (item, st) => `${esc(item.title)} <span class="qtags biz-when"><span class="qtag">${esc(item.due.toLowerCase())}</span></span>${
  st ? ` <b class="biz-flag">${st === 'overdue' ? 'Overdue' : 'Due soon'}</b>` : ''}`;
/* THE CARD'S OWN LINE SAYS ONLY A REFUSAL NOW. § */
const bizSaid_ = () => BIZ.error || '';
/* WAITING: asked and not yet answered. A refusal is an answer, and draws the boxes with it. */
const bizWaiting_ = () => !BIZ.list && !BIZ.error;

function bizItem_(item) {
  const r = bizRow_(item.id);
  const st = bizState_(item, r.due_on);
  /* EACH BOX A DRAFT UNTIL ITS CARD IS SAVED (data.js; docs/history/317): § */
  const box = (k, ph, v, extra) => formLine_('', formInput_(`type="${k === 'due_on' ? 'date' : 'text'}"
      data-biz="${esc(item.id)}" data-k="${k}" value="${esc(draftVal_('rec', item.id + ':' + k, v || ''))}" placeholder="${esc(ph)}"
      aria-label="${esc(item.title + ' — ' + ph)}" autocomplete="off" ${extra || ''}${draftAttr_('rec', item.id + ':' + k, v || '')}`));
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
  const due = bizDueCount_(pg);
  /* SPLIT (464): an admin's Split draws each record its own card with its own Save, in the same place; Join puts them back. */
  const id = typeof splitId_ === 'function' ? splitId_('biz', 'rec', pg.title) : '';
  const tiles = n => (id && typeof splitTiles_ === 'function' ? splitTiles_(id, n) : '');
  /* A PIECE IS A CARD OF ITS OWN (466): `data-lay-card` names it, so it moves, goes or starts alone. */
  const one = (title, items, first, piece) => card_(`<div class="biz"${first ? ` data-need="rec:${esc(pg.title)}"` : ''}${id ? ` data-split="${esc(id)}"` : ''}${piece ? ` data-lay-card="${esc(piece)}"` : ''}><div class="me-form" data-biz-page="${esc(pg.title)}">
    <h3>${esc(title)}</h3>
    ${first ? `<div class="biz-need-slot">${bizNeed_('rec:' + pg.title, due, due + (due === 1 ? ' record due' : ' records due'))}</div>` : ''}
    <div class="biz-body"${wait ? ' aria-busy="true"' : ''}>
      ${items.map(bizItem_).join('')}
      <div class="tile-row">${tile_({ icon: 'save', label: 'Save', act: 'biz-save' })}</div>
    ${wait ? loading_() : ''}</div>
    <p class="note me-said biz-said">${esc(bizSaid_())}</p>
  </div>${tiles(items.length)}</div>`);
  if (id && typeof splitOn_ === 'function' && splitOn_(id)) return pg.items.map((it, i) => one(it.title, [it], i === 0, typeof pieceId_ === 'function' ? pieceId_(id, it.title) : ''));
  return [one(pg.title, pg.items, true)];
}

/* THE PAGES, OR NONE. A card is not a permission — `listRecords` and `saveRecordsPage` are `admin` in `ACTION_ACCESS` — but a page a non-admin cannot use is a § */
function bizPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  /* PROFIT FIRST, as the column opens; then applications, staff and the records. The site's own cards are the Site column's (491). */
  /* STAFF (405) after applications: who has agreed to the tutor terms, and any tutor's statement — `staffCard_` in staff.js. */
  const staff = typeof staffCard_ === 'function' ? [staffCard_()].filter(Boolean) : [];
  return profitCards_().concat([bizSettingsCard_()], typeof bizCheckCard_ === 'function' ? [bizCheckCard_()].filter(Boolean) : [], appsCard_(), errsCard_(), staff, [].concat(...BIZ_PAGES.map(bizCard_)));
}
/* THE SITE COLUMN'S CARDS (491): Setup (400), posts and reports to moderate, the library import, the weekly email. */
function siteBizPages_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  /* NO SETUP OR RULES CARD (owner, 10 Nov: "delete this"): the Optimiser covers setup. */
  return [].concat(postsWaitCard_(), reportsCard_(), libImpCard_(), digestWordsCard_(), tplCard_());
}

/* ---------- POSTS WAITING FOR APPROVAL (413) ----------
   From the payload — an admin is sent every waiting post — so no request of its own; each is decided here or opened on the feed. */
function postsWaitCard_() {
  const list = (typeof feedPosts === 'function' ? feedPosts() : []).filter(p => p && p.waiting);
  const wait = typeof awaiting_ === 'function' && awaiting_();
  const n = wait ? 0 : list.length;
  const item = p => `<div class="biz-item post-wait-item" data-id="${esc(p.id)}">
      <p class="biz-cap"><b>${esc(p.author || p.handle || '')}</b> <span class="qtags biz-when"><span class="qtag">${esc(p.when || '')}</span></span></p>
      ${p.caption ? `<p class="app-line">${esc(p.caption)}</p>` : ''}
      <div class="tile-row">${tile_({ icon: 'open', label: 'Open', note: 'on the feed', act: 'post-open', data: { id: p.id } })}${
        tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'everyone sees it', act: 'post-approve', data: { id: p.id, on: '1' } })}${
        tile_({ icon: 'close', label: 'Decline', note: 'stays hidden', act: 'post-approve', data: { id: p.id, on: '' } })}</div>
    </div>`;
  return card_(`<div class="biz posts-wait" data-need="posts">
    <h3>Posts waiting</h3>
    ${bizNeed_('posts', n, n + (n === 1 ? ' post to approve' : ' posts to approve'))}
    <div class="biz-body"${wait ? ' aria-busy="true"' : ''}>
      ${!wait && !list.length ? empty_('None waiting.') : ''}
      ${list.map(item).join('')}
      ${wait ? loading_() : ''}</div>
  </div>`);
}

/* ---------- APPLICATIONS TO TEACH (400) ----------
   Asked with `listApplications`, admin at the gate. Approve makes the person Staff and lists them; Interview and Decline only say so, by email. */
const APPS = { list: null, open: 0, asking: false, error: '' };
const APP_STATUS_SAID = { new: 'New', interview: 'Interview', approved: 'Approved', declined: 'Declined' };
function appsCard_() {
  const wait = !APPS.list && !APPS.error && typeof loading_ === 'function';
  return card_(`<div class="biz apps" data-apps data-need="apps">${appsInner_(wait)}</div>`);
}
/* THE APPLICANT'S DOCUMENTS AND CV, each an https link: the documents sit in the private folder, so only an admin it is shared with can open them. */
function appDocs_(a) {
  const ok = u => /^https:\/\//.test(u || '');
  const docs = [['ID', a.id_doc], ['Right to work', a.rtw_doc]].concat(String(a.qual_docs || '').split(/\s+/).filter(ok).map((u, i) => ['Qualification ' + (i + 1), u]))
    .concat([['CV', a.cv_link]]).filter(d => ok(d[1]));
  return docs.length ? `<p class="app-line app-docs"><b>Documents</b> ${docs.map(d => `<a href="${esc(d[1])}" data-do="file-view" target="_blank" rel="noopener">${esc(d[0])}</a>`).join(' · ')}</p>` : '';
}
function appsInner_(wait) {
  const list = (APPS.list || []).filter(a => a.status === 'new' || a.status === 'interview');
  const when = ms => { try { return ms ? date_(ms) : ''; } catch (e) { return ''; } };
  const line = (k, v) => v ? `<p class="app-line"><b>${esc(k)}</b> ${esc(v)}</p>` : '';
  const item = a => `<div class="biz-item app-item" data-id="${esc(a.id)}">
      <p class="biz-cap"><b>${esc(a.name || a.handle)}</b> <span class="qtags biz-when"><span class="qtag">${esc(APP_STATUS_SAID[a.status] || a.status)} · ${esc(when(a.at))}</span></span></p>
      ${line('Full name', a.full_name)}${line('Contact', [a.phone, a.email].filter(Boolean).join(' · '))}
      ${line('Address', [a.address, a.postcode].filter(Boolean).join(', '))}${line('Born', a.dob)}
      ${line('Teaches', a.subjects)}${line('Rate', a.rate ? perHour_(a.rate) : '')}${line('Qualifications', a.qualifications)}
      ${line('DBS', a.dbs_needed === 'TRUE' ? 'needs one' : [a.dbs_number, a.dbs_issued].filter(Boolean).join(', issued ') + (a.dbs_update_consent === 'TRUE' ? ' · may check on the Update Service' : ''))}
      ${line('Right to work in the UK', a.right_to_work)}${line('Experience', a.experience)}${line('Available', a.availability)}
      ${line('Area', a.area)}${line('References', [1, 2].map(n => [a['ref' + n + '_name'], a['ref' + n + '_relationship'], a['ref' + n + '_email'] || a['ref' + n + '_contact'], a['ref' + n + '_phone']].filter(Boolean).join(', ')).join('; '))}
      ${line('Statement', a.statement)}
      ${appDocs_(a)}
      <div class="tile-row">${tile_({ icon: 'tick', label: 'Approve', tone: 'buy', note: 'lists them as staff', act: 'app-decide', data: { id: a.id, status: 'approved' } })}${
        a.status === 'new' ? tile_({ icon: 'chat', label: 'Interview', note: 'emails them', act: 'app-decide', data: { id: a.id, status: 'interview' } }) : ''}${
        tile_({ icon: 'close', label: 'Decline', act: 'app-decide', data: { id: a.id, status: 'declined' } })}</div>
    </div>`;
  const n = list.filter(a => a.status === 'new').length;
  return `<h3>Applications to teach</h3>
    ${bizNeed_('apps', APPS.list ? n : 0, n + ' to approve')}
    <div class="biz-body app-body"${wait ? ' aria-busy="true"' : ''}>
      ${APPS.list && !list.length ? empty_('None waiting.') : ''}
      ${list.map(item).join('')}
    ${wait ? loading_() : ''}</div>
    <p class="note me-said app-said">${esc(APPS.error)}</p>`;
}
const appsDraw_ = () => { document.querySelectorAll('[data-apps]').forEach(c => { cardFill_(c, appsInner_(false)); }); bizNeedsPaint_(); };
function appsStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || APPS.asking) return;
  APPS.asking = true;
  apiKept_({ action: 'listApplications' }, d => {
      APPS.asking = false;
      if (!d || d.error) { APPS.error = String((d && d.error) || 'The applications did not come.'); return; }
      APPS.error = ''; APPS.list = Array.isArray(d.applications) ? d.applications : []; APPS.open = Number(d.open) || 0;
    }, appsDraw_)
    .catch(() => { APPS.asking = false; APPS.error = 'The applications could not be fetched — check the connection.'; appsDraw_(); });
}
on('app-decide', el => {
  if (!isAdmin()) return;
  const id = el.dataset.id, status = el.dataset.status;
  if (status === 'declined' && !sure_(el, 'Turn it down?')) return;
  send_({ action: 'decideApplication', id, status }, { button: el, where: el.closest('.card').querySelector('.app-said'), busy: 'Saving…' })
    .then(d => {
      const a = (APPS.list || []).find(x => x.id === id);
      if (a) a.status = d.status || status;
      appsDraw_();
      toast(status === 'approved' ? 'Approved — they are staff now' : status === 'interview' ? 'Marked for interview' : 'Declined');
      /* THE TUTOR LIST IS IN THE PAYLOAD, so an approval asks for it again. */
      if (status === 'approved') { try { load(); } catch (e) {} }
    })
    .catch(() => {});
});

/* ---------- THE ERROR LOG (O5): what broke on phones, one row per distinct error, from `listClientErrors` (admin at the gate) ---------- */
const ERRS = { list: null, asking: false, error: '' };
const ERRS_DRAWN = 15;
function errsCard_() {
  const wait = !ERRS.list && !ERRS.error && typeof loading_ === 'function';
  return card_(`<div class="biz errs" data-errs>${errsInner_(wait)}</div>`);
}
function errsInner_(wait) {
  const list = ERRS.list || [];
  const when = ms => { try { return ms ? date_(ms) : ''; } catch (e) { return ''; } };
  const item = r => `<div class="biz-item err-item" data-id="${esc(r.id)}">
      <p class="biz-cap"><b>${esc(r.message)}</b> <span class="qtags biz-when"><span class="qtag">${esc(r.count + '× · last ' + when(r.last))}</span></span></p>
    </div>`;
  return `<h3>Error log</h3>
    <div class="biz-body err-body"${wait ? ' aria-busy="true"' : ''}>
      ${ERRS.list ? `<p class="err-count">${list.length ? list.length + ' distinct' : 'Nothing has broken'}</p>` : ''}
      ${list.slice(0, ERRS_DRAWN).map(item).join('')}
    ${wait ? loading_() : ''}</div>
    <div class="tile-row">${tile_({ icon: 'sync', label: 'Refresh', act: 'errs-refresh' })}${
      /* OLD SHEET ROWS INTO TODAY'S SHAPE (owner, 8 Nov): `migrateOldRows_`, safe to press twice. */
      tile_({ icon: 'merge', label: 'Tidy old rows', act: 'tidy-old-rows' })}</div>
    <p class="note me-said errs-said">${esc(ERRS.error)}</p>`;
}
const errsDraw_ = () => { document.querySelectorAll('[data-errs]').forEach(c => { cardFill_(c, errsInner_(false)); }); };
function errsStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || ERRS.asking) return;
  ERRS.asking = true;
  apiKept_({ action: 'listClientErrors' }, d => {
      ERRS.asking = false;
      if (!d || d.error) { ERRS.error = String((d && d.error) || 'The error log did not come.'); return; }
      ERRS.error = ''; ERRS.list = Array.isArray(d.errors) ? d.errors.filter(r => r && typeof r === 'object') : [];
    }, errsDraw_)
    .catch(() => { ERRS.asking = false; ERRS.error = 'The error log could not be fetched — check the connection.'; errsDraw_(); });
}
on('errs-refresh', () => { ERRS.list = null; ERRS.error = ''; errsDraw_(); document.querySelectorAll('[data-errs] .err-body').forEach(b => { b.setAttribute('aria-busy', 'true'); b.insertAdjacentHTML('beforeend', loading_()); }); errsStart_(); });

on('tidy-old-rows', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  send_({ action: 'tidyOldRows' }, { button: el, where: el.closest('.card').querySelector('.errs-said'), busy: 'Tidying…' })
    .then(d => { const n = Number(d && d.changed) || 0; toast(n ? n + (n === 1 ? ' old row tidied' : ' old rows tidied') : 'No old rows left'); })
    .catch(() => {});
});

/* ---------- SUGGESTIONS (494): a non-admin's, waiting — Confirm sends it to Notes for Claude, Dismiss drops it ----------
   `listSuggestions`, admin at the gate; `null` is "not asked yet". Messages flagged before 486 too. */
const REPS = { list: null, open: 0, msgs: [], asking: false, error: '' };
const REPS_DRAWN = 20;

function reportsCard_() {
  const wait = !REPS.list && !REPS.error && typeof loading_ === 'function';
  return card_(`<div class="biz reports" data-reports data-need="reports">${reportsInner_(wait)}</div>`);
}
const REP_FINDS_ = ['question', 'content', 'practical', 'project', 'talmud', 'quran', 'bible'];
function reportsInner_(wait) {
  const list = REPS.list || [];
  const when = ms => { try { return ms ? date_(ms) : ''; } catch (e) { return ''; } };
  const st = (r, decision, icon, label, note) => tile_({ icon, label, note, act: 'rep-status', data: { id: r.id, decision } });
  const item = r => `<div class="biz-item rep-item" data-id="${esc(r.id)}">
      <p class="biz-cap"><b>${esc(r.label || r.itemId)}</b> <span class="qtags biz-when"><span class="qtag">${esc(r.kind)}</span></span></p>
      ${r.note ? `<p class="rep-note-said">“${esc(r.note)}”</p>` : ''}
      <div class="tile-row">${REP_FINDS_.indexOf(r.kind) !== -1 ? tile_({ icon: 'open', label: 'Open', note: 'the card', act: 'rep-open', data: { k: r.itemId } }) : ''}${
        st(r, 'confirm', 'tick', 'Confirm', 'to Notes for Claude') + st(r, 'dismiss', 'close', 'Dismiss')}</div>
    </div>`;
  const more = REPS.open > Math.min(list.length, REPS_DRAWN) ? REPS.open - Math.min(list.length, REPS_DRAWN) : 0;
  const msgs = REPS.msgs || [];
  const mItem = r => `<div class="biz-item rep-item rep-msg" data-id="${esc(r.id)}">
      <p class="biz-cap"><b>Message from ${esc(r.from || 'someone')} to ${esc(r.to || 'someone')}</b> <span class="qtags biz-when"><span class="qtag">${esc(when(r.at))}</span></span></p>
      <p class="rep-note-said">${esc(r.reason || 'No reason given')}</p>
      <div class="tile-row">${tile_({ icon: 'tick', label: 'Dealt with', act: 'rep-status', data: { id: r.id, decision: 'dismiss', kind: 'message' } })}</div>
    </div>`;
  const n = REPS.list ? REPS.open + msgs.length : 0;
  return `<h3>Suggestions</h3>
    ${bizNeed_('reports', n, n + ' waiting')}
    <div class="biz-body rep-body"${wait ? ' aria-busy="true"' : ''}>
      ${REPS.list ? `<p class="rep-count">${n ? REPS.open + ' waiting' : 'None waiting'}${msgs.length ? ' · ' + msgs.length + (msgs.length === 1 ? ' message' : ' messages') : ''}</p>` : ''}
      ${msgs.map(mItem).join('')}
      ${list.slice(0, REPS_DRAWN).map(item).join('')}
    ${wait ? loading_() : ''}</div>
    <p class="note me-said rep-said">${esc(REPS.error)}</p>`;
}
const reportsDraw_ = () => { document.querySelectorAll('[data-reports]').forEach(c => { cardFill_(c, reportsInner_(false)); }); bizNeedsPaint_(); };

function reportsStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || REPS.asking) return;
  REPS.asking = true;
  apiKept_({ action: 'listSuggestions' }, d => {
      REPS.asking = false;
      if (!d || d.error) { REPS.error = String((d && d.error) || 'The suggestions did not come.'); return; }
      REPS.error = ''; REPS.list = Array.isArray(d.suggestions) ? d.suggestions : []; REPS.open = Number(d.open) || 0;
      REPS.msgs = Array.isArray(d.messages) ? d.messages : [];
    }, reportsDraw_)
    .catch(() => { REPS.asking = false; REPS.error = 'The suggestions could not be fetched — check the connection.'; reportsDraw_(); });
}

on('rep-status', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const id = el.getAttribute('data-id'), decision = el.getAttribute('data-decision') || '';
  const kind = el.getAttribute('data-kind') || '';
  const card = el.closest('[data-reports]');
  send_({ action: 'decideSuggestion', personId: (USER && USER.personId) || '', id, decision, kind }, { button: el, where: card && card.querySelector('.rep-said') })
    .then(d => {
      if (kind === 'message') { REPS.msgs = (REPS.msgs || []).filter(r => r.id !== id); reportsDraw_(); toast('Marked dealt with'); return; }
      REPS.list = (REPS.list || []).filter(x => x.id !== id);
      REPS.open = Math.max(0, REPS.open - 1);
      if (DATA && d && Array.isArray(d.notes)) DATA.claudeNotes = d.notes;
      if (DATA && d && Array.isArray(d.reportedItems)) DATA.reportedItems = d.reportedItems;
      reportsDraw_();
      toast(decision === 'confirm' ? 'Sent to Notes for Claude' : 'Dismissed');
    })
    .catch(() => {});
});

/* OPEN TAKES THE ADMIN TO THE CARD IN FIND, by its key — `find-open`'s route. A report from before 486 named a question by its bare id. */
on('rep-open', el => {
  const raw = el.getAttribute('data-k') || '';
  const k = /^[a-z]{1,3}:/.test(raw) ? raw : 'q:' + raw;
  let x = null;
  try { x = typeof stuffItemsAll_ === 'function' ? stuffItemsAll_().find(i => i && i.key === k) : null; } catch (e) { x = null; }
  if (!x) { toast('That card is not in the list any more.'); return; }
  finderOpen_(x, null, FINDERS.stuff);
});

/* ---------- LIBRARY UPDATES A SESSION LEFT IN DRIVE (407) ----------
   `libImportList` counts the lib-import-*.json (and .zip) files in family-library-imports and its subfolders; the tile imports them (`libImportDrive`). */
const LIBIMP = { list: null, last: null, auto: null, asking: false, error: '' };
function libImpCard_() {
  const wait = !LIBIMP.list && !LIBIMP.error && typeof loading_ === 'function';
  return card_(`<div class="biz libimp" data-libimp data-need="libimp">${libImpInner_(wait)}</div>`);
}
/* WHAT THE LAST PRESS DID, a line a file: its counts per library file, or why nothing of it was written. */
function libImpSaid_(r) {
  /* A ZIP A LINE: how many files it gave, or why it was refused. */
  const zips = r && Array.isArray(r.zips) ? '' : '';
  if (!r || !Array.isArray(r.files) || !r.files.length) return zips;
  const counts = c => Object.keys(c || {}).map(k => `${k} ${c[k].added} new, ${c[k].replaced} changed${c[k].same ? ', ' + c[k].same + ' unchanged' : ''}`).join('; ');
  /* AND WHAT IMPORTED BUT CANNOT BE MARKED YET (457, `libSelfTest_`): options with no right one, say -- named, one paragraph */
  const flagged = f => (Array.isArray(f.flagged) && f.flagged.length ? ' Waiting for a scheme: ' + f.flagged.join('; ') + '.' : '');
  return zips;
}
/* THE HOURLY RUN (443): when it last found files, and what it imported. */
function libImpAuto_(a) {
  if (!a || !a.at) return '';
  const when = new Date(a.at), said = isNaN(when) ? String(a.at) : date_(when) + ' ' + time_(when);
  const n = Number(a.imported) || 0, f = Number(a.failed) || 0;
  return `<p class="note libimp-auto">Last automatic import ${esc(said)}: ${n} ${n === 1 ? 'file' : 'files'} imported${f ? ', ' + f + ' not' : ''}.</p>${libImpSaid_(a)}`;
}
function libImpInner_(wait) {
  const n = (LIBIMP.list || []).length;
  return `<h3>Library updates</h3>
    ${bizNeed_('libimp', LIBIMP.list ? n : 0, n + (n === 1 ? ' file waits' : ' files wait') + ' in Drive')}
    <div class="biz-body libimp-body"${wait ? ' aria-busy="true"' : ''}>
      ${(LIBIMP.list || []).filter(f => f.zip).map(f => `<p class="note libimp-zip"><b>${esc(f.name)}</b> — ${esc(f.said || '')}</p>`).join('')}
      ${LIBIMP.list ? libImpAuto_(LIBIMP.auto) : ''}
      ${LIBIMP.last && !LIBIMP.last.auto ? libImpSaid_(LIBIMP.last) : ''}
      <div class="tile-row">${tile_({ icon: 'in', label: 'Import library updates (' + n + ')', note: 'into the Ledger', act: 'lib-import', off: !n })}</div>
    ${wait ? loading_() : ''}</div>
    <p class="note me-said libimp-said">${esc(LIBIMP.error)}</p>`;
}
const libImpDraw_ = () => { document.querySelectorAll('[data-libimp]').forEach(c => { cardFill_(c, libImpInner_(false)); }); bizNeedsPaint_(); };
function libImpStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || LIBIMP.asking) return;
  LIBIMP.asking = true;
  apiKept_({ action: 'libImportList' }, d => {
      LIBIMP.asking = false;
      if (!d || d.error) { LIBIMP.error = String((d && d.error) || 'The Drive folder did not answer.'); return; }
      LIBIMP.error = ''; LIBIMP.list = Array.isArray(d.pending) ? d.pending : []; LIBIMP.last = d.last || null; LIBIMP.auto = d.auto || null;
    }, libImpDraw_)
    .catch(() => { LIBIMP.asking = false; LIBIMP.error = 'Drive could not be asked — check the connection.'; libImpDraw_(); });
}
on('lib-import', el => {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const card = el.closest('[data-libimp]');
  send_({ action: 'libImportDrive', personId: (USER && USER.personId) || '' }, { button: el, where: card && card.querySelector('.libimp-said') })
    .then(d => {
      LIBIMP.last = d;
      LIBIMP.error = '';
      const out = {};
      (d.files || []).concat(d.zips || []).forEach(f => { if (!f.error) out[f.name] = 1; });
      LIBIMP.list = (LIBIMP.list || []).filter(f => !out[f.name]);
      libImpDraw_();
      toast(d.failed ? d.imported + ' imported, ' + d.failed + ' not — see the card' : d.imported + (d.imported === 1 ? ' file imported' : ' files imported'));
      /* WORDS ALREADY ON THIS PHONE ARE THE OLD ONES — forgotten, so an opened card asks again. */
      try { if (d.imported && typeof libForget_ === 'function') libForget_(); } catch (e) {}
    })
    /* A REFUSAL IS ALREADY SAID ON THE CARD'S LINE BY send_; the next list carries the press's report. */
    .catch(() => {});
});

/* ---------- PROFIT: THE BUSINESS'S SUM, WRITTEN OUT, EVERY TERM A CONTROL (docs/history/393) ----------
   The terms are `priceFrom`'s and `bookMoney_`'s (core.js): the tutor keeps the first seat's rate and c of each extra seat. */
const PROFIT_KEY = 'profit:whatif';
const PROFIT_PERIODS = { week: { w: 1, m: 12 / 52, say: 'a week' },
                         month: { w: 52 / 12, m: 1, say: 'a month' },
                         year: { w: 52, m: 12, say: 'a year' } };
const PROFIT_VARS = [
  { k: 'S',  sym: 'S',  label: 'Sessions a week',                 min: 0, max: 60,   step: 1 },
  { k: 'h',  sym: 'h',  label: 'Hours a session',                 min: 0.5, max: 4,  step: 0.25 },
  { k: 'n',  sym: 'n',  label: 'Seats a session',                 min: 1, max: 12,   step: 1 },
  { k: 'P',  sym: 'P',  label: 'Rate an hour, first seat',        min: 0, max: 80,   step: 0.5, cash: true },
  { k: 'c',  sym: 'c',  label: 'Tutor’s share of each extra seat', min: 0, max: 2, step: 0.05 },
  { k: 'B',  sym: 'B',  label: 'Business’s share of each extra seat', min: 0, max: 2, step: 0.05 },
  { k: 'V',  sym: 'V',  label: 'Room hire an hour',               min: 0, max: 60,   step: 0.5, cash: true },
  { k: 'd',  sym: 'd',  label: 'Discount, % of teaching',         min: 0, max: 50,   step: 1, pct: true },
  { k: 'f',  sym: 'f',  label: 'Card fee, % of what is charged',  min: 0, max: 5,    step: 0.1, pct: true },
  { k: 'f0', sym: 'f₀', label: 'Card fee per payment',            min: 0, max: 2,    step: 0.05, cash: true },
  { k: 'q',  sym: 'q',  label: 'Payments a week',                 min: 0, max: 30,   step: 1 },
  { k: 'O',  sym: 'O',  label: 'Other costs a month',             min: 0, max: 3000, step: 5, cash: true },
];
/* WHAT THE ADMIN HAS MOVED, ON THIS DEVICE ONLY — a what-if is never written to the sheet. */
const PROFIT = (() => {
  let o = {};
  try { o = JSON.parse(localStorage.getItem(PROFIT_KEY) || '{}') || {}; } catch (e) { o = {}; }
  return { vals: o.vals && typeof o.vals === 'object' ? o.vals : {}, period: PROFIT_PERIODS[o.period] ? o.period : 'month',
           x: PROFIT_VARS.some(v => v.k === o.x) ? o.x : 'n' };
})();
const profitKeep_ = () => {
  const v = JSON.stringify({ vals: PROFIT.vals, period: PROFIT.period, x: PROFIT.x });
  try { if (typeof keepPut_ === 'function') keepPut_(PROFIT_KEY, v, true); else localStorage.setItem(PROFIT_KEY, v); } catch (e) {}
};

/* THIS CALENDAR MONTH OF BOOKINGS, each job's figures shared over its dates — admins alone are sent `tutorPay`/`adminKeeps` (doget.gs). */
function profitActual_() {
  const now = new Date(), y = now.getFullYear(), mo = now.getMonth();
  const out = { sessions: 0, seats: 0, hours: 0, charged: 0, tutor: 0, kept: 0, paid: 0, jobs: 0, priced: 0 };
  ((typeof DATA !== 'undefined' && DATA && DATA.clientClasses) || []).forEach(j => {
    if (!j || norm(j.kind) === 'waitlist' || norm(j.status) === 'cancelled') return;
    let ds = [];
    try { ds = jobDates_(j); } catch (e) { ds = []; }
    const here = ds.filter(d => d.getFullYear() === y && d.getMonth() === mo);
    if (!ds.length || !here.length) return;
    const share = here.length / ds.length, num_ = v => (v === '' || v == null || !isFinite(Number(v)) ? null : Number(v));
    out.jobs++;
    out.sessions += here.length;
    out.seats += here.length * Math.max(1, Number(j.currentKids) || 1);
    out.hours += here.length * (Number(j.hours) || 0);
    if (ds[0].getFullYear() === y && ds[0].getMonth() === mo) out.paid++;
    const pr = num_(j.price), tp = num_(j.tutorPay), ak = num_(j.adminKeeps);
    if (pr == null || tp == null) return;
    out.priced++;
    out.charged += pr * share; out.tutor += tp * share; out.kept += (ak || 0) * share;
  });
  return out.sessions ? out : null;
}

/* EACH TERM'S STARTING VALUE AND WHERE IT CAME FROM: this month's bookings, then config, then the tutors' and venues' own rows, then a placeholder. */
function profitDefaults_() {
  const v = ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
  const cfg = (k, or) => { const x = num(v[k]); return isFinite(x) ? x : or; };
  const avg = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN;
  const r2 = x => Math.round(x * 100) / 100;
  const A = profitActual_();
  const weeks = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate() / 7; })();
  const out = {}, from = {};
  const put = (k, x, src) => { out[k] = x; from[k] = src; };
  put('c', cfg('c', 0), isFinite(num(v.c)) ? 'config' : 'placeholder');
  put('B', cfg('B', 0), isFinite(num(v.B)) ? 'config' : 'placeholder');
  put('f', cfg('card_fee_pct', 0), isFinite(num(v.card_fee_pct)) ? 'config' : 'placeholder');
  put('f0', cfg('card_fee_fixed', 0), isFinite(num(v.card_fee_fixed)) ? 'config' : 'placeholder');
  put('d', 0, 'placeholder');
  put('O', 0, 'placeholder');
  if (A) {
    put('S', r2(A.sessions / weeks), 'this month');
    put('n', Math.max(1, Math.round(A.seats / A.sessions)), 'this month');
    put('h', A.hours > 0 ? r2(A.hours / A.sessions) : cfg('h', 2), A.hours > 0 ? 'this month' : 'config');
    put('q', r2(A.paid / weeks), 'this month');
  } else {
    put('S', 0, 'placeholder'); put('n', 1, 'placeholder'); put('h', cfg('h', 2), isFinite(num(v.h)) ? 'config' : 'placeholder');
    put('q', 0, 'placeholder');
  }
  /* P AND V BACK OUT OF WHAT WAS BOOKED: tutor £/h = P(1 + c(n−1)), and what is left after the tutor and the business is the room. */
  const hrs = A ? A.hours * (A.priced / Math.max(1, A.jobs)) : 0;
  if (A && A.priced && hrs > 0 && A.tutor > 0) {
    put('P', r2(A.tutor / hrs / (1 + out.c * (out.n - 1))), 'this month');
    put('V', r2(Math.max(0, (A.charged - A.tutor - A.kept) / hrs)), 'this month');
  } else {
    const rates = ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).map(t => Number(t.rate)).filter(x => x > 0);
    const rooms = ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).map(t => parseFloat(t.bestRate)).filter(x => x > 0);
    put('P', rates.length ? r2(avg(rates)) : OPEN_RATE, rates.length ? 'tutors’ rates' : 'open rate');
    put('V', rooms.length ? r2(avg(rooms)) : 0, rooms.length ? 'venues’ rates' : 'placeholder');
  }
  return { vals: out, from, actual: A };
}

const profitVals_ = D => {
  const o = {};
  PROFIT_VARS.forEach(p => { const x = Number(PROFIT.vals[p.k]); o[p.k] = isFinite(x) && PROFIT.vals[p.k] !== '' && PROFIT.vals[p.k] != null ? x : D.vals[p.k]; });
  return o;
};
/* THE SUM. Kept in one place so the bars, the line and the figures can never disagree. */
function profitSum_(x, period) {
  const pe = PROFIT_PERIODS[period] || PROFIT_PERIODS.month;
  const N = x.S * pe.w, extra = Math.max(0, x.n - 1);
  const teach = x.P * (1 + (x.c + x.B) * extra);
  const revenue = N * x.h * (teach * (1 - x.d / 100) + x.V);
  const tutor = N * x.h * x.P * (1 + x.c * extra);
  const room = N * x.h * x.V;
  const fees = revenue * x.f / 100 + x.f0 * x.q * pe.w;
  const other = x.O * pe.m;
  return { N, revenue, tutor, room, fees, other, profit: revenue - tutor - room - fees - other };
}

const profitMoney_ = money_;
const profitShort_ = money_;

/* THE BARS: revenue up, each cost down from where the last left off, profit what is left. */
function profitBars_(r) {
  const W = 340, H = 168, top = 18, base = 132, L = 6, R = 6;
  const steps = [['Revenue', r.revenue, 'rev'], ['Tutor', -r.tutor, 'cost'], ['Room', -r.room, 'cost'],
                 ['Fees', -r.fees, 'cost'], ['Other', -r.other, 'cost']];
  let run = 0;
  const bars = steps.map(([k, v, cls]) => { const from = run; run += v; return { k, v, cls, a: from, b: run }; });
  bars.push({ k: 'Profit', v: r.profit, cls: r.profit < 0 ? 'loss' : 'gain', a: 0, b: r.profit });
  const hi = Math.max(0, ...bars.map(b => Math.max(b.a, b.b))), lo = Math.min(0, ...bars.map(b => Math.min(b.a, b.b)));
  /* NOTHING YET (every figure £0): the bars sit on the base line over their names, not at the top over an empty gap. */
  const span = (hi - lo) || 1, Y = y => (hi === lo ? base : top + (hi - y) / span * (base - top));
  const slot = (W - L - R) / bars.length, bw = Math.min(34, slot * .56);
  const g = bars.map((b, i) => {
    const x = L + slot * i + (slot - bw) / 2, y1 = Y(Math.max(b.a, b.b)), y2 = Y(Math.min(b.a, b.b));
    const h = Math.max(1, y2 - y1), say = b.k + ': ' + profitMoney_(b.v);
    return `<g class="pf-bar is-${b.cls}"><title>${esc(say)}</title>
      <rect x="${x.toFixed(1)}" y="${y1.toFixed(1)}" width="${bw.toFixed(1)}" height="${h.toFixed(1)}" rx="2"/>
      <text class="pf-val" x="${(x + bw / 2).toFixed(1)}" y="${(y1 - 4).toFixed(1)}">${esc(profitShort_(b.v))}</text>
      <text class="pf-lab" x="${(x + bw / 2).toFixed(1)}" y="${H - 18}">${esc(b.k)}</text></g>`;
  }).join('');
  const v0 = hi === lo ? base - 22 : 0;
  return `<svg class="pf-chart" viewBox="0 ${v0} ${W} ${H - 10 - v0}" role="img" aria-label="${esc('Revenue ' + profitMoney_(r.revenue)
    + ', less tutor, room, fees and other costs, leaves ' + profitMoney_(r.profit))}">
    <line class="pf-zero" x1="${L}" x2="${W - R}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}"/>${g}</svg>`;
}

/* THE LINE: profit as one term runs over its whole slider, everything else held, today's value marked. */
function profitLine_(x, period) {
  const p = PROFIT_VARS.find(v => v.k === PROFIT.x) || PROFIT_VARS[0];
  const W = 340, H = 160, L = 40, R = 10, top = 12, base = 128, K = 48;
  const pts = Array.from({ length: K + 1 }, (_, i) => {
    const t = p.min + (p.max - p.min) * i / K;
    return [t, profitSum_(Object.assign({}, x, { [p.k]: t }), period).profit];
  });
  const cur = profitSum_(x, period).profit;
  const ys = pts.map(q => q[1]).concat(cur, 0);
  const hi = Math.max(...ys), lo = Math.min(...ys), span = (hi - lo) || 1;
  const X = t => L + (t - p.min) / ((p.max - p.min) || 1) * (W - L - R), Y = y => top + (hi - y) / span * (base - top);
  const d = pts.map((q, i) => (i ? 'L' : 'M') + X(q[0]).toFixed(1) + ' ' + Y(q[1]).toFixed(1)).join('');
  const cx = X(Math.min(p.max, Math.max(p.min, x[p.k]))), cy = Y(cur);
  const fmt = t => p.cash ? money_(t) : p.pct ? t + '%' : String(t);
  return `<svg class="pf-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc('Profit against ' + p.label + '; now ' + profitMoney_(cur) + ' at ' + fmt(x[p.k]))}">
    <line class="pf-zero" x1="${L}" x2="${W - R}" y1="${Y(0).toFixed(1)}" y2="${Y(0).toFixed(1)}"/>
    <text class="pf-axis" x="${L - 4}" y="${(top + 4).toFixed(1)}" text-anchor="end">${esc(profitShort_(hi))}</text>
    <text class="pf-axis" x="${L - 4}" y="${(base + 4).toFixed(1)}" text-anchor="end">${esc(profitShort_(lo))}</text>
    <line class="pf-now-rule" x1="${cx.toFixed(1)}" x2="${cx.toFixed(1)}" y1="${top}" y2="${base}"/>
    <path class="pf-line" d="${d}"/>
    <circle class="pf-now" cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5"><title>${esc(p.sym + ' = ' + fmt(x[p.k]) + ' → ' + profitMoney_(cur))}</title></circle>
    <text class="pf-axis" x="${L}" y="${H - 14}">${esc(fmt(p.min))}</text>
    <text class="pf-axis" x="${W - R}" y="${H - 14}" text-anchor="end">${esc(fmt(p.max))}</text>
    <text class="pf-axis pf-xname" x="${((L + W - R) / 2).toFixed(1)}" y="${H - 2}" text-anchor="middle">${esc(p.sym + ' · ' + p.label)}</text>
  </svg>`;
}

/* THE FIGURES UNDER THE FORMULA, one line per term of the sum. */
function profitRows_(r, period) {
  const row = (k, sum, t, cls) => `<div class="pf-row${cls ? ' ' + cls : ''}"><span class="pf-k">${k}</span><span class="pf-sum">${sum}</span><span class="pf-v">${esc(t)}</span></div>`;
  const m = profitMoney_;
  return row('N', 'S × weeks', (Math.round(r.N * 10) / 10) + ' sessions', 'is-count')
    + row('Revenue', 'N·h·(P(1 + (c+B)(n−1))(1 − d%) + V)', m(r.revenue))
    + row('− Tutor', 'N·h·P(1 + c(n−1))', m(-r.tutor))
    + row('− Room', 'N·h·V', m(-r.room))
    + row('− Fees', 'f%·Revenue + f₀·q·weeks', m(-r.fees))
    + row('− Other', 'O', m(-r.other))
    + row('Profit', PROFIT_PERIODS[period].say, m(r.profit), 'is-total' + (r.profit < 0 ? ' is-bad' : ''));
}

/* ONE ROW A TERM: what it is and where its value came from, its slider, its box. */
function profitControl_(p, x, from) {
  const id = 'pf-' + p.k, v = x[p.k], moved = PROFIT.vals[p.k] != null && PROFIT.vals[p.k] !== '';
  const max = Math.max(p.max, v), min = Math.min(p.min, v);
  return `<div class="pf-var${moved ? ' is-moved' : ''}" data-pf-var="${p.k}">
    <p class="pf-name" id="${id}-name"><b class="pf-sym">${esc(p.sym)}</b> ${esc(p.label)}${p.cash ? ' (£)' : ''}
      <span class="pf-from">${esc(moved ? 'what-if' : from[p.k] || '')}</span></p>
    ${formSlider_(`data-pf="${p.k}"`, { id: id, min: min, max: max, step: p.step, value: v, label: p.label })}
  </div>`;
}
/* THE RESULT, ON THE TERMS' OWN PAGE, so a value moved there is seen to move it. */
const profitHead_ = r => `<span class="pf-k">Profit ${esc(PROFIT_PERIODS[PROFIT.period].say)}</span>
  <b class="pf-v${r.profit < 0 ? ' is-bad' : ''}">${esc(profitMoney_(r.profit))}</b>
  <span class="pf-sum">revenue ${esc(profitMoney_(r.revenue))} · costs ${esc(profitMoney_(r.revenue - r.profit))}</span>`;

/* TWO PAGES — the sum and its charts, then the terms — so neither is taller than a phone. An admin's only; `bizPages_` asks too. */
function profitCards_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return [];
  const D = profitDefaults_(), x = profitVals_(D), r = profitSum_(x, PROFIT.period);
  const A = D.actual;
  const opt = (v, t, on) => `<option value="${esc(v)}"${on ? ' selected' : ''}>${esc(t)}</option>`;
  const waiting = typeof awaiting_ === 'function' && awaiting_();
  const sum = card_(`<div class="biz profit" data-profit="sum">
    <h3>Profit</h3>
    <p class="pf-formula">
      <span>Profit = Revenue − Tutor − Room − Fees − Other</span>
      <span>Revenue = N·h·(P·(1 + (c + B)(n − 1))·(1 − d%) + V)</span>
      <span>Tutor = N·h·P·(1 + c(n − 1)) · Room = N·h·V</span>
      <span>Fees = f%·Revenue + f₀·q·weeks · N = S × weeks</span></p>
    ${formLine_('Period', formSelect_('data-pf-period aria-label="Period"',
      Object.keys(PROFIT_PERIODS).map(k => opt(k, 'Per ' + k, k === PROFIT.period)).join('')), 'pf-period')}
    <div class="pf-rows">${profitRows_(r, PROFIT.period)}</div>
    <div class="pf-bars">${profitBars_(r)}</div>
    ${formLine_('Profit against', formSelect_('data-pf-x aria-label="Profit against"',
      PROFIT_VARS.map(p => opt(p.k, p.sym + ' · ' + p.label, p.k === PROFIT.x)).join('')), 'pf-against')}
    <div class="pf-lines">${profitLine_(x, PROFIT.period)}</div>
  </div>`);
  const said = `<p class="note pf-said">${A
      ? esc('This month’s bookings so far: ' + A.sessions + ' sessions, ' + profitMoney_(A.charged) + ' charged, '
        + profitMoney_(A.tutor) + ' to tutors, ' + profitMoney_(A.kept) + ' kept. ')
      : esc(waiting ? '' : 'No bookings this month, so the starting values are config and placeholders. ')}${
      esc('What you move here stays on this device; nothing is written to the sheet.')}</p>`;
  /* SPLIT (464): each term its own card after the head, in the same place; Join puts them back. */
  const id = typeof splitId_ === 'function' ? splitId_('biz', 'profit-terms') : '';
  const split = id && typeof splitOn_ === 'function' && splitOn_(id);
  const tiles = n => (id && typeof splitTiles_ === 'function' ? splitTiles_(id, n) : '');
  const pc = k => (typeof pieceId_ === 'function' ? ` data-lay-card="${esc(pieceId_(id, k))}"` : '');
  if (split) return [sum, card_(`<div class="biz profit" data-profit="terms" data-split="${esc(id)}"${pc('head')}>
    <h3>Profit · the terms</h3>
    <p class="pf-head">${profitHead_(r)}</p>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Reset to actual', act: 'profit-reset' })}</div>${said}${tiles(1)}</div>`)]
    .concat(PROFIT_VARS.map(p => card_(`<div class="biz profit" data-profit="term" data-split="${esc(id)}"${pc(p.label)}>
    <div class="pf-vars">${profitControl_(p, x, D.from)}</div>${tiles(1)}</div>`)));
  const terms = card_(`<div class="biz profit" data-profit="terms"${id ? ` data-split="${esc(id)}"` : ''}>
    <h3>Profit · the terms</h3>
    <p class="pf-head">${profitHead_(r)}</p>
    <div class="pf-vars">${PROFIT_VARS.map(p => profitControl_(p, x, D.from)).join('')}</div>
    <div class="tile-row">${tile_({ icon: 'undo', label: 'Reset to actual', act: 'profit-reset' })}</div>
    ${said}${tiles(PROFIT_VARS.length)}
  </div>`);
  return [sum, terms];
}

/* REDRAWN IN PLACE as a value moves — not a repaint of the column, which would take the slider from under the finger. */
function profitRedraw_(skip) {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  const D = profitDefaults_(), x = profitVals_(D), r = profitSum_(x, PROFIT.period);
  document.querySelectorAll('[data-profit]').forEach(card => {
    const put = (sel, html) => { const el = card.querySelector(sel); if (el) el.innerHTML = html; };
    put('.pf-rows', profitRows_(r, PROFIT.period));
    put('.pf-bars', profitBars_(r));
    put('.pf-lines', profitLine_(x, PROFIT.period));
    put('.pf-head', profitHead_(r));
    card.querySelectorAll('select[data-pf-period]').forEach(el => { el.value = PROFIT.period; });
    card.querySelectorAll('[data-pf-var]').forEach(box => {
      const k = box.dataset.pfVar, moved = PROFIT.vals[k] != null && PROFIT.vals[k] !== '';
      box.classList.toggle('is-moved', moved);
      const f = box.querySelector('.pf-from'); if (f) f.textContent = moved ? 'what-if' : D.from[k] || '';
      box.querySelectorAll('[data-pf]').forEach(inp => { if (inp !== skip) inp.value = x[k]; });
    });
  });
}
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-profit] [data-pf]');
  if (!el) return;
  const x = Number(el.value);
  if (el.value === '' || !isFinite(x) || x < 0) return;
  PROFIT.vals[el.dataset.pf] = x;
  profitKeep_();
  profitRedraw_(el);
});
document.addEventListener('change', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-profit] select');
  if (!el) return;
  if (el.hasAttribute('data-pf-period') && PROFIT_PERIODS[el.value]) PROFIT.period = el.value;
  if (el.hasAttribute('data-pf-x') && PROFIT_VARS.some(p => p.k === el.value)) PROFIT.x = el.value;
  profitKeep_();
  profitRedraw_();
});
on('profit-reset', el => {
  if (!(typeof isAdmin === 'function' && isAdmin()) || !sure_(el, 'Reset?')) return;
  PROFIT.vals = {};
  profitKeep_();
  profitRedraw_();
  toast('Back to this month’s figures');
});

/* THE COLUMN, AND ITS RECORDS ASKED FOR AS SOON AS IT IS DRAWN FOR AN ADMIN — not when it is arrived at. § */
screen('biz', () => {
  if (typeof isAdmin === 'function' && isAdmin()) setTimeout(() => { try { bizStart_(); } catch (e) {}
    try { if (!APPS.list) appsStart_(); } catch (e) {} oopsTry_('errsStart', () => { if (!ERRS.list) errsStart_(); }); try { if (typeof staffStart_ === 'function' && !STAFF.list) staffStart_(); } catch (e) {}
    try { bizNeedsPaint_(); } catch (e) {} }, 0);
  return pages('biz', typeof cardsOf_ === 'function' ? cardsOf_('biz') : adminPages_());
});
screen('site', () => {
  if (typeof isAdmin === 'function' && isAdmin()) setTimeout(() => { try { if (!REPS.list) reportsStart_(); } catch (e) {}
    try { if (!LIBIMP.list) libImpStart_(); } catch (e) {} try { bizNeedsPaint_(); } catch (e) {}
    try { if (typeof initInbox === 'function') initInbox(); } catch (e) {} try { digestShownStart_(); } catch (e) {} }, 0);
  return pages('site', typeof cardsOf_ === 'function' ? cardsOf_('site') : sitePages_());
});

/* ---------- THE WEEKLY EMAIL, SEEN AND WORDED HERE (491, 547): the email itself, as the backend renders and sends it (`digestPreview`); its four lines are config rows. ---------- */
const DIGEST_WORDS_ = [
  ['digest_subject', 'Subject', '{child}’s week: {count}'],
  ['digest_greeting', 'Greeting', 'Hi {parent},'],
  ['digest_intro', 'First line', 'Here’s what {child} worked on this week: {count} ({span}).'],
  ['digest_footer', 'Last line', 'Don’t want these any more? Just reply and say so.'],
];
const digestVars_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.constants && DATA.constants.vars) || {});
/* WHAT THE BACKEND LAST SHOWED: { subject, html, sample, learner } or { said }; `seq` drops a reply overtaken by a later ask. */
const DIGEST_SHOWN_ = { got: null, busy: false, seq: 0, timer: 0 };
/* AS IS (owner, 1 Nov: "show how the emails will look AS IS. PERFECTLY SYNCED"): the HTML the backend sends, in a sandboxed frame -- never a copy drawn here (547). */
function digestShownHtml_() {
  const g = DIGEST_SHOWN_.got;
  /* THE CARD ASKS FOR ITSELF WHEN DRAWN, wherever it is drawn (Find › Settings, not only its old column). */
  if (!g) { setTimeout(() => { try { digestShownStart_(); } catch (e) {} }, 0); return `<div class="dw-frame-box" aria-busy="true">${loading_()}</div>`; }
  if (!g.html) return `<p class="note">${esc(g.said || 'The email could not be shown.')}</p>`;
  return `<p class="dp-subj"><span>Subject</span> ${esc(g.subject || '')}</p>
    <div class="dw-frame-box"${DIGEST_SHOWN_.busy ? ' aria-busy="true"' : ''}><iframe class="dw-frame" title="The weekly email" sandbox="" referrerpolicy="no-referrer" srcdoc="${esc(g.html)}"></iframe>${DIGEST_SHOWN_.busy ? loading_() : ''}</div>`;
}
function digestShownPaint_() { document.querySelectorAll('.digest-look .dw-preview').forEach(box => { box.innerHTML = digestShownHtml_(); }); }
/* ONE ASK OF THE BACKEND'S OWN RENDERER, with the words being typed when there are any; nothing is written or sent by it. */
function digestShownAsk_(words) {
  if (!USER || !(typeof isAdmin === 'function' && isAdmin())) return;
  const seq = ++DIGEST_SHOWN_.seq;
  DIGEST_SHOWN_.busy = true;
  digestShownPaint_();
  const body = { action: 'digestPreview', name: USER.name, personId: USER.personId || '' };
  if (words) body.words = words;
  send_(body, {}).then(d => {
    if (seq !== DIGEST_SHOWN_.seq) return;
    DIGEST_SHOWN_.busy = false;
    /* AN OLDER BACKEND sends the week's emails but no `shown`: the first of them is still the email as is. */
    const m = d && (d.shown || (d.emails || [])[0]);
    DIGEST_SHOWN_.got = m && m.html ? m : { said: (d && d.error) || 'No family has an email this week, and this backend cannot show a made-up one yet: sync backend/ and Deploy → New version.' };
    digestShownPaint_();
  }).catch(err => {
    if (seq !== DIGEST_SHOWN_.seq) return;
    DIGEST_SHOWN_.busy = false;
    DIGEST_SHOWN_.got = { said: why_(err) };
    digestShownPaint_();
  });
}
function digestWordsCard_() {
  const v = digestVars_(), w = {};
  DIGEST_WORDS_.forEach(([k, , d]) => { w[k] = String(v[k] || '').trim() || d; });
  const rows = DIGEST_WORDS_.map(([k, label, d]) => formLine_(label, formInput_(`data-dw="${k}" value="${esc(w[k])}" placeholder="${esc(d)}" maxlength="300" aria-label="${esc(label)}"`), 'dw-row')).join('');
  /* TWO CARDS, the look and the words: together they are taller than a pane, and the look follows the typing either way. */
  return [card_(`<div class="biz digest-look"><h3>Weekly email</h3><div class="dw-preview">${digestShownHtml_()}</div></div>`),
    card_(`<div class="biz digest-words"><h3>Weekly email's words</h3>
    ${rows}
    <div class="tile-row">${tile_({ icon: 'save', label: 'Save', note: 'the email\'s words', act: 'digest-words-save', tone: 'admin' })}</div>
    <p class="note dw-said" aria-live="polite"></p></div>`)];
}
/* ---------- THE ONE CARD TEMPLATE, SHOWN (owner, 11 Nov): a sample drawn BY findCard with each part outlined and named, and the fixed scale read live from :root. ---------- */
const TPL_PARTS_ = [['pic', 'Picture — only if real'], ['tags', 'Tags — the name first'], ['lines', 'Content'], ['act', 'Buttons — round; hold or hover for the word']];
const TPL_SCALE_ = [
  ['Text', 'fs', ['--fs-small', '--fs-title', '--fs-body']], ['Spacing', 'sp', ['--s0', '--s1', '--s2', '--s3', '--s4', '--s5', '--s6']],
  ['Button', 'bt', ['--tile', '--tile-i', '--tap']], ['Picture', 'pc', ['--pic-s', '--pic-l', '--pic-h']],
  ['Corners', 'cr', ['--r-ui', '--r-round']],
  ['Colours', 'co', ['--bg', '--raised', '--line', '--ink', '--dim', '--faint', '--gold', '--good', '--warn', '--bad', '--paper', '--paper-ink']]];
/* EACH VALUE AS THE BROWSER HAS IT NOW, so the card can never disagree with style.css; the swatch wears the token itself. */
const TPL_WEAR_ = { fs: 'font-size', sp: 'width', bt: 'width: VAR; height', pc: 'width: VAR; height', cr: 'border-radius', co: 'background' };
const tplTok_ = k => { try { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); } catch (e) { return ''; } };
function tplSample_() {
  const h = card_(`<div class="tpl-sample"><img src="icon.png" alt="A sample picture"><h3>A sample card</h3>
    <div class="qtags"><span class="qtag">A sample card</span><span class="qtag">A tag</span></div>
    <p>What the thing holds, in plain words, centred.</p></div>`, 'panel', 'A sample card');
  return TPL_PARTS_.reduce((x, [p, say]) => x.replace(`<div class="kc-${p}">`, `<div class="kc-${p}" data-tpl="${esc(say)}">`), h);
}
function tplCard_() {
  const scale = TPL_SCALE_.map(([name, k, list]) => `<p class="tpl-group">${esc(name)}</p><div class="tpl-row tpl-${k}">${list.map(t =>
    `<span class="tpl-sw"><i aria-hidden="true" style="${TPL_WEAR_[k].replace('VAR', 'var(' + t + ')')}: var(${t})"></i><code>${esc(t)}</code><small>${esc(dash_(tplTok_(t)))}</small></span>`).join('')}</div>`).join('');
  const outer = card_(`<div class="biz tpl-card"><h3>Card template</h3>
    <p class="note">Every card on the site is drawn by this one template: picture, tags, content, buttons, top to bottom on one centre line.</p>
    <div class="tpl-spec"></div>
    <p class="note">The fixed scale, as the page has it now:</p>${scale}</div>`);
  return outer.replace('<div class="tpl-spec"></div>', `<div class="tpl-spec">${tplSample_()}</div>`);
}
/* THE FIRST LOOK, when Site is opened by an admin; after that a typed word or a Save asks again. */
function digestShownStart_() { if (!DIGEST_SHOWN_.got && !DIGEST_SHOWN_.busy) digestShownAsk_(null); }
const digestWordsNow_ = card => { const w = {}; DIGEST_WORDS_.forEach(([k, , d]) => { const el = card.querySelector('[data-dw="' + k + '"]'); w[k] = (el && String(el.value).trim()) || d; }); return w; };
document.addEventListener('input', e => {
  const el = e.target, card = el && el.closest && el.dataset && el.dataset.dw ? el.closest('.digest-words') : null;
  if (!card) return;
  /* A PAUSE IN THE TYPING, not every key: each ask renders the whole week on the backend. */
  clearTimeout(DIGEST_SHOWN_.timer);
  DIGEST_SHOWN_.timer = setTimeout(() => digestShownAsk_(digestWordsNow_(card)), 1200);
});
on('digest-words-save', el => {
  const card = el.closest('.digest-words');
  if (!card || !USER || !(typeof isAdmin === 'function' && isAdmin())) return;
  const words = {};
  DIGEST_WORDS_.forEach(([k, , d]) => { const i = card.querySelector('[data-dw="' + k + '"]'); const t = i ? String(i.value).trim() : ''; words[k] = t === d ? '' : t; });
  send_({ action: 'digestWordsSave', name: USER.name, personId: USER.personId || '', words }, { button: el, where: card.querySelector('.dw-said') || undefined, busy: 'Saving…' })
    .then(d => {
      if (!d || !d.success) return;
      try { Object.assign(digestVars_(), d.words || words); } catch (x) { /* no vars yet: the next payload carries them */ }
      toast('The email\'s words are saved');
      digestShownAsk_(null);
    });
});

/* ---------- BUSINESS SETTINGS (owner, 9 Nov): share B, fees, discounts and rates in one list, set here and only here; bookings only read them. Venues and rooms below it. ---------- */
const BIZ_SETTINGS = [
  ['B', "@family.'s share of each extra seat (0.5 is half)"], ['c', "the tutor's share of each extra seat"],
  ['M', 'fallback tutor pay per hour'], ['w', 'markup on tutor pay (1 is none)'], ['s', 'extra per hour for each extra subject'],
  ['b', 'bulk discount per session booked'], ['a', 'advance-booking discount per week ahead'], ['h', 'hours per session'],
  ['open_rate', 'pay per hour with No preference'], ['open_tutor_rate', 'a waitlist seat’s tutor rate'],
  ['waitlist_seats', 'seats on a waitlist session'], ['waitlist_extra_seat', 'added per hour for each seat after the first'],
  ['max_students_per_job', 'seat cap when neither tutor nor venue sets one'], ['max_open_requests', 'live requests one family may hold'],
  ['travel_on_client', '1 adds venue travel to the client’s price'],
  ['print_rate_per_page', 'a printed page'], ['print_minimum', 'least a print job costs'], ['postage_flat', 'postage per order'],
];
const bizSettingNow_ = k => { try { const v = ((DATA.constants || {}).vars || {})[k]; return v == null ? '' : String(v); } catch (e) { return ''; } };
function bizSettingsCard_() {
  const admin = typeof isAdmin === 'function' && isAdmin();
  const line = ([k, say]) => `<div class="biz-item biz-setting" data-key="${esc(k)}">${fieldHtml('biz_' + k, bizSettingNow_(k), { label: say, draft: false,
      extra: `type="number" min="0" step="any" inputmode="decimal"${admin ? '' : ' disabled'}` })}
    <div class="tile-row set-save">${tile_({ icon: 'save', label: 'Save', act: 'biz-setting-save', off: !admin, data: { key: k } })}</div></div>`;
  const places = ((DATA && DATA.venues) || []).map(v => `<li>${esc(v.title || '')} · ${esc(money_(Number(v.bestRate) || 0))}/h · ${esc(String(v.maxCapacity || ''))} seats${v.takesAllSeats ? ' · takes all the tutor’s seats' : ''}${(v.rooms || []).length ? ' · ' + v.rooms.length + ' rooms' : ''}</li>`).join('');
  return card_(`<div class="biz biz-settings set-shape${admin ? '' : ' is-locked'}"><h3 class="set-title">Business settings</h3>
    ${BIZ_SETTINGS.map(line).join('')}
    <h4>Venues and rooms</h4>
    <ul class="biz-venues">${places || `<li>${empty_('No venues yet.')}</li>`}</ul>
    <p class="note fs-said" aria-live="polite"></p></div>`);
}
on('biz-setting-save', el => {
  const item = el.closest('.biz-setting'), card = el.closest('.biz-settings'), box = item && item.querySelector('input');
  const key = el.getAttribute('data-key') || '';
  if (!box || !key || !USER || !(typeof isAdmin === 'function' && isAdmin())) return;
  send_({ action: 'businessSettingSave', personId: USER.personId || '', key, value: String(box.value).trim() }, { button: el, where: (card && card.querySelector('.fs-said')) || undefined, busy: 'Saving…' })
    .then(d => {
      if (!d || !d.success) return;
      try { ((DATA.constants = DATA.constants || {}).vars = DATA.constants.vars || {})[d.key] = d.value; } catch (x) { /* the next payload carries it */ }
      toast('Saved');
    });
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
  const due = bizDueCount_(pg), slot = form.querySelector('.biz-need-slot');
  if (slot) slot.innerHTML = bizNeed_('rec:' + pg.title, due, due + (due === 1 ? ' record due' : ' records due'));
  /* AND THE LOADER COMES OFF, with the values already in the boxes under it — so they appear filled
     rather than empty and then filled. A refusal takes it off too: it is an answer, not a wait. */
  if (!bizWaiting_() && typeof loaded_ === 'function') loaded_(form.querySelector('.biz-body'));
}
const bizFillAll_ = () => { bizFillEach_(); bizNeedsPaint_(); };
const bizFillEach_ = () => document.querySelectorAll('.me-form[data-biz-page]')
  .forEach(f => {
    if (!f.dataset.dirty && !f.classList.contains('is-sending')) bizFill_(f);
    /* A CARD KEPT FOR WHAT IS TYPED IN IT IS NOT FILLED, AND IT STOPS WAITING ALL THE SAME — the loader
       is about the answer having come, and it has. */
    else if (!bizWaiting_() && typeof loaded_ === 'function') loaded_(f.querySelector('.biz-body'));
  });

function bizStart_() {
  if (!can_(myRole_(), 'action', 'listRecords') || BIZ.list || BIZ.asking) return;
  BIZ.asking = true; BIZ.error = '';
  apiKept_({ action: 'listRecords', name: USER && USER.name }, (d, old) => {
      BIZ.asking = false;
      if (d && d.error) BIZ.error = String(d.error);
      else { BIZ.list = (d && Array.isArray(d.records)) ? d.records : []; BIZ.stale = !!old; }
    }, bizFillAll_)
    .catch(() => { BIZ.asking = false; BIZ.error = 'The records could not be fetched — check the connection.'; bizFillAll_(); });
}

on('biz-save', el => {
  const form = el.closest('.me-form');
  if (!form || !can_(myRole_(), 'action', 'saveRecordsPage')) return;
  if (!BIZ.list || BIZ.stale) {
    toast(BIZ.error ? 'The records have not loaded, so nothing was saved — trying again.'
                    : 'The records are still on their way — a moment.');
    if (BIZ.error) { BIZ.error = ''; bizStart_(); }
    return;
  }
  const pg = BIZ_PAGES.find(p => p.title === form.dataset.bizPage);
  if (!pg) return;
  /* ONLY THE RECORDS WHOSE BOXES ARE IN THIS CARD — a split piece (464) must not blank its neighbours. */
  const records = pg.items.filter(item => form.querySelector(`[data-biz="${item.id}"]`)).map(item => {
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

;
/* ==== js/biz-check.js ==== */
/* THE BUSINESS CHECKER (1050): what the business needs, in order, ticked by itself where the site's own data can tell, else by the owner. */
/* The items are data/settings/biz-checklist.json; the owner's ticks are the biz_checks tab (backend/bizchecks.gs). Guidance, not advice. */
const BC = { list: null, facts: {}, money: {}, ticks: null, error: '', asking: false, open: '', fetched: false };
const BC_SOON_DAYS = 30;
const BC_DOMAINS = /^https:\/\/([a-z0-9-]+\.)*(gov\.uk|ico\.org\.uk|nspcc\.org\.uk)\//;
const BC_VAT_FALLBACK = 90000;
const BC_GOAL_FALLBACK = 100000;

const bcVars_ = () => ((typeof DATA !== 'undefined' && DATA && DATA.constants) || {}).vars || {};
const bcNum_ = (k, or) => { const x = Number(bcVars_()[k]); return isFinite(x) && bcVars_()[k] !== '' && bcVars_()[k] != null ? x : or; };
const bcMoney_ = x => money_(Math.max(0, x || 0));
const bcIso_ = d => { try { return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); } catch (e) { return ''; } };
const bcToday_ = () => bcIso_(new Date());
const bcAddMonths_ = (iso, m) => { const d = new Date(iso + 'T12:00:00'); if (isNaN(d)) return ''; d.setMonth(d.getMonth() + Number(m)); return bcIso_(d); };
const bcDays_ = iso => Math.round((new Date(iso + 'T12:00:00') - new Date(bcToday_() + 'T12:00:00')) / 864e5);
const bcSaid_ = iso => date_(iso);

/* ---------- RENEWALS (10 Nov): an item's `cycle` in the checklist file says when it falls due again ---------- */
const bcCycle_ = item => (item && item.cycle && typeof item.cycle === 'object') ? item.cycle : null;
/* THE FIRST OF THE CYCLE'S FIXED DAYS (MM-DD) STRICTLY AFTER `iso`. */
function bcNextFixed_(dates, iso) {
  const y = Number(String(iso).slice(0, 4)), out = [];
  [y, y + 1].forEach(yy => (dates || []).forEach(md => { if (/^\d{2}-\d{2}$/.test(md)) out.push(yy + '-' + md); }));
  return out.sort().find(d => d > iso) || '';
}
/* WHEN IT FALLS DUE: the expiry Renewed recorded, else worked out from the cycle and the last renewal, else from today for a fixed date. */
function bcDueOf_(item, tick) {
  const c = bcCycle_(item) || {};
  if (c.continuous) return '';
  if (tick && tick.expires_on) return tick.expires_on;
  if (c.dates) return bcNextFixed_(c.dates, tick && tick.done_on ? tick.done_on : bcIso_(new Date(Date.now() - 864e5)));
  const m = Number(c.months || item.renew);
  return tick && tick.done_on && m > 0 ? bcAddMonths_(tick.done_on, m) : '';
}
const bcCycleSay_ = item => { const c = bcCycle_(item); if (!c) return '';
  return c.continuous ? 'watched all the time' : c.dates ? 'due ' + c.dates.map(md => date_('2000-' + md).slice(0, 5)).join(' and ') + ' each year'
    : Number(c.months) === 12 ? 'renews yearly' : 'renews every ' + (Number(c.months) % 12 ? c.months + ' months' : Number(c.months) / 12 + ' years'); };

/* ---------- THE TAX POT (10 Nov): a share (`tax_set_aside`, data) of what came in through paid bookings, this month and this tax year ---------- */
function bcTaxPot_() {
  const now = new Date(), y = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 6) ? now.getFullYear() : now.getFullYear() - 1;
  const from = new Date(y, 3, 6), month = new Date(now.getFullYear(), now.getMonth(), 1);
  const rate = bcNum_('tax_set_aside', Number((BC.money || {}).tax_set_aside) || 0.25);
  let year = 0, inMonth = 0;
  ((typeof DATA !== 'undefined' && DATA && DATA.clientClasses) || []).forEach(j => {
    if (!j || norm(j.status) !== 'booked' || norm(j.kind) === 'waitlist') return;
    let ds = [];
    try { ds = typeof jobDates_ === 'function' ? jobDates_(j) : []; } catch (e) { ds = []; }
    const pr = Number(j.price);
    if (!ds.length || !isFinite(pr) || j.price === '' || j.price == null) return;
    const each = pr / ds.length;
    ds.forEach(d => { if (d >= from && d <= now) { year += each; if (d >= month) inMonth += each; } });
  });
  const next = bcNextFixed_(['01-31', '07-31'], bcIso_(new Date(now.getTime() - 864e5)));
  return { rate, year: year * rate, month: inMonth * rate, next, days: next ? bcDays_(next) : 999 };
}
const bcTaxLine_ = p => 'Put aside ' + bcMoney_(p.month) + ' this month · ' + bcMoney_(p.year) + ' this tax year (' + Math.round(p.rate * 100) + '%)'
  + (p.next ? ' · next tax payment ' + bcSaid_(p.next) : '') + '.';

/* A FACT IS THE CONFIG'S `biz_<fact>` WHEN SET (TRUE, yes, a number above 0), else the checklist file's default. */
function bcFact_(k) {
  const v = bcVars_()['biz_' + k];
  if (v === undefined || v === null || v === '') return !!(BC.facts || {})[k];
  if (typeof v === 'number') return v > 0;
  return /^(true|yes|y|1)$/i.test(String(v).trim()) || Number(v) > 0;
}
const bcApplies_ = item => Object.keys(item.when || {}).every(k => bcFact_(k) === !!item.when[k]);

/* ---------- MONEY: this tax year's bookings (from 6 April), the run-rate, and what the goal needs each week ---------- */
function bcMoneyNow_() {
  const now = new Date(), y = now.getMonth() > 3 || (now.getMonth() === 3 && now.getDate() >= 6) ? now.getFullYear() : now.getFullYear() - 1;
  const from = new Date(y, 3, 6), to = new Date(y + 1, 3, 6);
  let sofar = 0, sessions = 0, priced = 0;
  ((typeof DATA !== 'undefined' && DATA && DATA.clientClasses) || []).forEach(j => {
    if (!j || norm(j.kind) === 'waitlist' || norm(j.status) === 'cancelled') return;
    let ds = [];
    try { ds = typeof jobDates_ === 'function' ? jobDates_(j) : []; } catch (e) { ds = []; }
    const here = ds.filter(d => d >= from && d <= now);
    const pr = Number(j.price);
    if (!ds.length || !here.length || !isFinite(pr) || j.price === '' || j.price == null) return;
    sofar += pr * here.length / ds.length; sessions += here.length; priced += pr * here.length / ds.length;
  });
  const weeksIn = Math.max(1, (now - from) / 6048e5), weeksLeft = Math.max(1, (to - now) / 6048e5);
  const goal = bcNum_('income_goal', BC_GOAL_FALLBACK);
  const rates = ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).map(t => Number(t.rate)).filter(x => x > 0);
  const perSession = sessions ? priced / sessions : (rates.length ? rates.reduce((a, b) => a + b, 0) / rates.length : 0) * bcNum_('h', 1);
  const weekly = Math.max(0, goal - sofar) / weeksLeft;
  return { sofar, sessions, goal, runRate: sofar / weeksIn * 52, weekly, perSession, perWeek: perSession > 0 ? Math.ceil(weekly / perSession) : 0, from };
}

/* ---------- THE AUTO RULES: each takes the item and answers {ok: true|false|null, say}; null = cannot tell, the owner ticks ---------- */
const BC_RULES = {
  records: item => {
    if (typeof BIZ === 'undefined' || !BIZ.list) return { ok: null, say: 'Business records not loaded yet.' };
    const key = String(item.sense).split(':')[1];
    const r = (BIZ.list || []).find(x => x.id === key) || {};
    if (!r.provider && !r.reference) return { ok: null, say: 'Fill this in under Business records (below) and it ticks itself.' };
    if (r.due_on && bcDays_(r.due_on) < 0) return { ok: false, say: 'Business records say it ran out on ' + bcSaid_(r.due_on) + '.', due: r.due_on };
    return { ok: true, say: 'From Business records' + (r.due_on ? ' · next ' + bcSaid_(r.due_on) : '') + '.', due: r.due_on || '' };
  },
  'tutor-terms': () => {
    if (typeof STAFF === 'undefined' || !STAFF.list) return { ok: null, say: 'The staff list is not loaded yet.' };
    if (!STAFF.list.length) return { ok: null, say: NO_TUTOR + '.' };
    const n = STAFF.list.filter(s => typeof staffAgreed_ === 'function' && !staffAgreed_(s)).length;
    return n ? { ok: false, say: n + ' not agreed to the current tutor terms — see Staff.' } : { ok: true, say: 'Every tutor has agreed to the current terms.' };
  },
  'dbs-tutors': () => {
    if (typeof STAFF !== 'undefined' && STAFF.list && STAFF.list.length && typeof staffDbsDue_ === 'function') {
      const due = STAFF.list.filter(staffDbsDue_).length;
      return due ? { ok: false, say: due + ' of ' + STAFF.list.length + ' tutors need their DBS checked online — see Staff.' } : { ok: true, say: 'Every tutor\'s DBS was checked online in the last 12 months.' };
    }
    const ts = ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).filter(t => t && t.title);
    if (!ts.length) return { ok: null, say: NO_TUTOR + '.' };
    const no = ts.filter(t => !t.dbs).length;
    const dates = 'The site holds a DBS tick, not a date: add a DBS date to each tutor\'s record (dbs_checked in the people tab) and renew every 3 years.';
    return no ? { ok: false, say: no + ' of ' + ts.length + ' listed tutors have no DBS ticked. ' + dates } : { ok: true, say: 'Every listed tutor has DBS ticked. ' + dates };
  },
  'income-goal': () => {
    const m = bcMoneyNow_();
    return { ok: m.sofar >= m.goal, info: true, say: bcMoney_(m.sofar) + ' so far this tax year of ' + bcMoney_(m.goal) + ' · ' + bcMoney_(m.weekly) + ' a week from now'
      + (m.perWeek ? ' · about ' + m.perWeek + ' sessions a week at ' + bcMoney_(m.perSession) : '') + '.' };
  },
  'vat-watch': () => {
    const m = bcMoneyNow_(), set = bcVars_().vat_threshold, t = bcNum_('vat_threshold', BC_VAT_FALLBACK);
    const note = set ? '' : ' (threshold assumed ' + bcMoney_(t) + ' — check the current figure on gov.uk and set vat_threshold in config)';
    if (m.runRate >= t) return { ok: false, say: 'Run-rate ' + bcMoney_(m.runRate) + ' a year is over the VAT threshold' + note + '. Register within 30 days of passing it.' };
    if (m.runRate >= t * 0.8) return { ok: false, say: 'Run-rate ' + bcMoney_(m.runRate) + ' a year is near the VAT threshold' + note + '. Get ready to register.' };
    return { ok: true, say: 'Run-rate ' + bcMoney_(m.runRate) + ' a year, under the VAT threshold' + note + '.' };
  },
  'staff-count': () => {
    const n = ((typeof DATA !== 'undefined' && DATA && DATA.tutors) || []).filter(t => t && t.title && t.listed !== false).length;
    const m = bcMoneyNow_(), each = bcNum_('sessions_per_tutor', 15), need = Math.max(1, Math.ceil(m.perWeek / Math.max(1, each)));
    return { ok: n >= need, say: n + ' listed ' + (n === 1 ? 'tutor' : 'tutors') + '; the goal needs about ' + need + ' at ' + each + ' sessions a week each.' };
  },
};
const bcRuleOf_ = sense => { const s = String(sense || ''); return s === 'manual' ? null : BC_RULES[s.split(':')[0]] || null; };

/* ONE ITEM'S STATE: sensed, ticked by hand (and whether its renewal is due), or still to do. */
function bcState_(item) {
  const rule = bcRuleOf_(item.sense);
  let auto = null;
  try { auto = rule ? rule(item) : null; } catch (e) { auto = { ok: null, say: '' }; }
  const t = (BC.ticks || {})[item.id] || null;
  const cyc = bcCycle_(item);
  let due = '';
  if (cyc) due = bcDueOf_(item, t);
  else if (t && t.done_on && item.renew) due = bcAddMonths_(t.done_on, item.renew);
  if (auto && auto.due && !(t && t.expires_on)) due = auto.due;
  /* A FIXED DATE NEVER TICKED IS STILL COMING: it glows 30 days before, without waiting for a first tick. */
  const expired = !!due && bcDays_(due) < 0 && !!((t && t.done_on) || cyc);
  const byHand = !!(t && t.done_on) && !expired;
  const sorted = !expired && (!!(auto && auto.ok === true) || (byHand && !(auto && auto.ok === false)));
  const soon = !expired && !!due && bcDays_(due) <= BC_SOON_DAYS && (sorted || !!cyc);
  return { auto, tick: t, due, expired, sorted, soon, info: !!(auto && auto.info), cyc };
}

/* THE TAG: Done, Renew by dd/mm/yy, Overdue, else the status in words. */
function bcTag_(s) {
  if (s.expired) return 'Overdue';
  if (s.soon) return 'Renew by ' + bcSaid_(s.due);
  if (s.sorted && !s.info) return 'Done';
  return bcStatus_(s);
}
function bcStatus_(s) {
  if (s.info) return s.auto.ok ? 'reached' : 'in progress';
  if (s.expired) return 'overdue since ' + bcSaid_(s.due);
  if (s.cyc && s.soon && !s.sorted) return 'due ' + bcSaid_(s.due);
  if (s.sorted && s.auto && s.auto.ok === true) return 'sensed' + (s.soon ? ' · renew by ' + bcSaid_(s.due) : '');
  if (s.sorted) return 'done ' + bcSaid_(s.tick.done_on) + (s.soon ? ' · renew by ' + bcSaid_(s.due) : '');
  if (s.auto && s.auto.ok === false) return 'needs you';
  return 'to do';
}

function bcItem_(item, s) {
  /* THE TICK ON THE LEFT, THE THING IN WORDS BESIDE IT — one line, as a checklist reads (`.kid-row` lays out a tile and its caption). */
  /* ONE CHILD LINE A THING (10 Nov): its words, its status as a tag coloured by urgency (gold soon, red overdue), its tile in the row. */
  const glow = s.expired ? ' is-over' : s.soon ? ' is-soon' : '';
  const line = `<p class="kc-line bc-line">${esc(item.title)} <span class="qtags"><span class="qtag bc-tag${glow}">${esc(bcTag_(s))}</span></span></p>
    <div class="tile-row">${tile_({ icon: s.sorted ? 'tick' : s.expired || (s.auto && s.auto.ok === false) ? 'flag' : 'plus', label: item.title,
    note: bcStatus_(s), tone: s.sorted ? 'buy' : '', on: BC.open === item.id, act: 'bc-open', data: { id: item.id } })}</div>`;
  if (BC.open !== item.id) return `<div class="kc-item bc-item" data-bc="${esc(item.id)}">${line}</div>`;
  const t = s.tick || {}, cyc = s.cyc && !s.cyc.continuous;
  return `<div class="kc-item bc-item is-open" data-bc="${esc(item.id)}">${line}
    ${s.cyc ? `<p class="bc-cycle"><span class="qtag">${esc(bcCycleSay_(item))}</span>${s.due ? ` <span class="qtag">expires ${esc(bcSaid_(s.due))}</span>` : ''}${
      t.result ? ` <span class="qtag">${esc(t.result)}</span>` : ''}${t.doc_link ? ` <a href="${esc(t.doc_link)}" data-do="file-view">Document</a>` : ''}</p>` : ''}
    <p class="bc-why">${esc(item.why)}</p>
    ${item.run ? `<div class="tile-row">${tile_({ icon: 'ext', label: item.run, href: item.link, leave: true })}</div>` : ''}
    <p class="bc-how">${esc(item.how)} <a href="${esc(item.link)}" data-do="file-view" target="_blank" rel="noopener">Official guidance</a>${item.doc && typeof policyHref_ === 'function' && policyHref_(item.doc)
      ? ` <a href="${esc(policyHref_(item.doc))}" data-do="file-view" target="_blank" rel="noopener">Our policy</a>` : ''}</p>
    ${s.info ? '' : `<div class="me-form bc-form">
      <div class="lib-row q-row"><label class="field"><input type="date" data-bc-k="done_on" value="${esc(cyc ? bcToday_() : t.done_on || bcToday_())}" aria-label="${esc(item.title + (cyc ? ' — renewed on' : ' — done on'))}"></label>
      ${Array.isArray(item.results) ? `<label class="field">Result <select data-bc-k="result" aria-label="${esc(item.title + ' — result')}">${
        item.results.map(r => `<option${r === t.result ? ' selected' : ''}>${esc(r)}</option>`).join('')}</select></label>` : ''}
      ${cyc ? `<label class="field">${item.results ? 'Review by' : 'New expiry'} <input type="date" data-bc-k="expires_on" value="${esc(bcDueOf_(item, { done_on: bcToday_() }))}" aria-label="${esc(item.title + ' — new expiry')}"></label>
      <label class="field">Document (optional) <input type="file" data-bc-k="doc" accept="application/pdf,image/*" aria-label="${esc(item.title + ' — document')}"></label>` : ''}
      <label class="field"><input type="text" data-bc-k="note" value="${esc(t.note || '')}" placeholder="Proof or note, e.g. policy no." maxlength="200" aria-label="${esc(item.title + ' — note')}" autocomplete="off"></label></div>
      <div class="tile-row">${tile_({ form: true, label: item.results ? 'Done' : cyc ? 'Renewed' : t.done_on ? 'Save' : 'Mark done', act: 'bc-tick', data: { id: item.id } })}${
        t.done_on ? tile_({ form: true, kind: 'quiet', label: 'Untick', act: 'bc-untick', data: { id: item.id } }) : ''}</div>
    </div>`}
  </div>`;
}

function bcInner_() {
  const wait = (!BC.list || (!BC.ticks && !BC.error)) && typeof loading_ === 'function';
  const all = (BC.list || []).filter(bcApplies_), later = (BC.list || []).length - all.length;
  const st = {};
  all.forEach(i => { st[i.id] = bcState_(i); });
  const counted = all.filter(i => !st[i.id].info), done = counted.filter(i => st[i.id].sorted).length;
  const next = counted.filter(i => !st[i.id].sorted).slice(0, 3);
  const renew = counted.filter(i => st[i.id].expired || st[i.id].soon).length;
  const over = counted.filter(i => st[i.id].expired).length;
  let pot = null;
  try { pot = BC.list ? bcTaxPot_() : null; if (pot) pot.say = bcTaxLine_(pot); } catch (e) { pot = null; }
  const money = (pot ? `<p class="bc-money bc-tax${pot.days <= BC_SOON_DAYS ? ' is-soon' : ''}">${esc(pot.say)}</p>` : '')
    + all.filter(i => st[i.id].info).map(i => `<p class="bc-money">${esc(st[i.id].auto.say)}</p>`).join('');
  const groups = [];
  all.forEach(i => { if (groups.indexOf(i.group) === -1) groups.push(i.group); });
  return `<div class="qtags"><span class="qtag">Business</span><span class="qtag">Admin only</span><span class="qtag">Guidance, not advice</span></div>
    <h3>Business checker</h3>
    ${bizNeed_('bizcheck', BC.list ? renew : 0, renew + (renew === 1 ? ' thing to renew' : ' things to renew') + (over ? ' · ' + over + ' overdue' : ''), BC.list ? over : 0)}
    <div class="kc-items biz-body bc-body"${wait ? ' aria-busy="true"' : ''}>
      ${BC.list ? `<p class="bc-count"><b>${done} of ${counted.length} sorted</b></p>${money}
      ${next.length ? next.map(i => bcItem_(i, st[i.id])).join('') : '<p>Everything that applies is sorted.</p>'}
      ${groups.map(g => { const gi = all.filter(i => i.group === g && next.indexOf(i) === -1);
        return gi.length ? `<h4 class="bc-group">${esc(g)} <span class="qtag">${gi.filter(i => st[i.id].sorted).length}/${gi.filter(i => !st[i.id].info).length}</span></h4>${gi.map(i => bcItem_(i, st[i.id])).join('')}` : ''; }).join('')}
      ` : ''}
    ${wait ? loading_() : ''}</div>
    <p class="note me-said bc-said">${esc(BC.error)}</p>`;
}

function bizCheckCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  if (!BC.asking && !BC.fetched) setTimeout(bcStart_, 0);
  /* A REPAINTED COLUMN KEEPS THE GLOW: the inner is drawn first, so its counts are known for the card's own class. */
  const inner = bcInner_(), need = typeof BIZ_NEEDS !== 'undefined' ? BIZ_NEEDS : {}, now = typeof BIZ_NEEDS_NOW !== 'undefined' ? BIZ_NEEDS_NOW : {};
  const glow = (need.bizcheck ? ' needs-you' : '') + (now.bizcheck ? ' needs-now' : '');
  return card_(`<div class="biz bc-card${glow}" data-bizcheck data-need="bizcheck">${inner}</div>`);
}
const bcDraw_ = () => { document.querySelectorAll('[data-bizcheck]').forEach(c => { cardFill_(c, bcInner_()); }); if (typeof bizNeedsPaint_ === 'function') bizNeedsPaint_(); };

/* WAITS FOR ANOTHER CARD'S LIST (records, staff) so its rule can sense, giving up after a while. */
const bcWaitFor_ = (ready, ms) => new Promise(res => { const t0 = Date.now(); (function tick() { if (ready() || Date.now() - t0 > ms) res(); else setTimeout(tick, 300); })(); });

function bcStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || BC.asking) return;
  BC.asking = true; BC.fetched = true; BC.error = '';
  try { if (typeof bizStart_ === 'function') bizStart_(); if (typeof staffStart_ === 'function') staffStart_(); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'business checker'); }
  const list = BC.list ? Promise.resolve() : fetch('data/settings/biz-checklist.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(j => { BC.list = Array.isArray(j && j.items) ? j.items : []; BC.facts = (j && j.facts) || {}; BC.money = (j && j.money) || {}; })
    .catch(() => { BC.list = BC.list || []; BC.error = 'The checklist could not be fetched — check the connection.'; });
  const ticks = api({ action: 'listBizChecks', name: USER && USER.name })
    .then(d => { if (!d || d.error) { BC.ticks = {}; BC.error = String((d && d.error) || 'The ticks did not come.'); return; } BC.ticks = bcTicksOf_(d.checks); })
    .catch(() => { BC.ticks = {}; BC.error = 'The ticks could not be fetched — the list shows with nothing ticked.'; });
  Promise.all([list, ticks]).then(bcDraw_)
    .then(() => bcWaitFor_(() => (typeof BIZ === 'undefined' || BIZ.list || BIZ.error) && (typeof STAFF === 'undefined' || STAFF.list || STAFF.error), 20000))
    .then(() => { BC.asking = false; bcDraw_(); });
}
/* A CHOSEN FILE AS {name, type, data}, or null — read only when Renewed is pressed. */
const bcFile_ = box => new Promise(res => {
  const f = box && box.querySelector('[data-bc-k="doc"]'), file = f && f.files && f.files[0];
  if (!file) return res(null);
  try { const r = new FileReader(); r.onload = () => res({ name: file.name, type: file.type, data: String(r.result || '') }); r.onerror = () => res(null); r.readAsDataURL(file); } catch (e) { res(null); }
});
const bcTicksOf_ = rows => { const o = {}; (Array.isArray(rows) ? rows : []).forEach(r => { if (r && r.id && r.done_on) o[r.id] = r; }); return o; };

on('bc-open', el => { const id = el.dataset.id; BC.open = BC.open === id ? '' : id; bcDraw_(); });
function bcSave_(el, untick) {
  if (!isAdmin()) return;
  const id = el.dataset.id, box = el.closest('.bc-item');
  if (!box || !BC.ticks) { toast('The ticks are still on their way — a moment.'); return; }
  const v = k => { const b = box.querySelector(`[data-bc-k="${k}"]`); return b ? String(b.value || '').trim() : ''; };
  const done_on = untick ? '' : v('done_on') || bcToday_(), expires_on = untick ? '' : v('expires_on');
  if (expires_on && expires_on < done_on) { toast('The new expiry is before the renewal date.'); return; }
  bcFile_(untick ? null : box).then(doc => send_({ action: 'saveBizCheck', name: USER && USER.name, id, done_on, expires_on, doc, result: untick ? '' : v('result'), note: untick ? '' : v('note') },
        { button: el, where: box.closest('.card').querySelector('.bc-said'), busy: 'Saving…' }))
    .then(d => {
      const c = (d && d.check) || { id, done_on, expires_on, note: v('note') };
      if (c.done_on) BC.ticks[id] = c; else delete BC.ticks[id];
      BC.open = ''; bcDraw_();
      toast(d && d.docError ? d.docError : untick ? 'Unticked' : expires_on ? 'Renewed' : 'Ticked');
    })
    .catch(() => {});
}
on('bc-tick', el => bcSave_(el, false));
on('bc-untick', el => bcSave_(el, true));

;
/* ==== js/one-place.js ==== */
/* CHECKS (1060), js/one-place.js: the one place — the one score per area, each area's next three, then the owner's inbox. docs/philosophy.md is the why. */
/* Scores are data/health.json (tools/health.js); the questions data/settings/owner-questions.json; answers the owner_answers tab. */
const OQ = { list: null, answers: null, error: '', asking: false, watching: false };
const CHECK_AREAS = [['code', 'Code'], ['logic', 'Find logic'], ['ui', 'Design and UI'], ['friction', 'Friction'], ['cost', 'AI cost'], ['speed', 'Speed'], ['business', 'Business']];

/* THE BUSINESS AREA, LIVE: the checker's sorted share once its ticks came, else the file's figure. */
function checksBizLive_() {
  try {
    if (typeof BC === 'undefined' || !BC.list || !BC.ticks || typeof bcApplies_ !== 'function') return null;
    const all = BC.list.filter(bcApplies_).map(i => ({ i, s: bcState_(i) })).filter(x => !x.s.info);
    if (!all.length) return null;
    const left = all.filter(x => !x.s.sorted);
    return { score: Math.round(all.filter(x => x.s.sorted).length / all.length * 1000) / 10, next: left.slice(0, 3).map(x => x.i.title) };
  } catch (e) { return null; }
}
function checksAreas_(s) {
  const A = Object.assign({}, (s && s.areas) || {}), live = checksBizLive_();
  if (live) A.business = Object.assign({}, A.business || {}, { score: live.score, next: live.next, live: true });
  return A;
}
/* THE TOTAL: the file's weights over the weighted areas, with business live when it is. */
function checksTotal_(s, A) {
  const W = (s && s.weights) || {};
  const ks = Object.keys(W).filter(k => A[k] && isFinite(Number(A[k].score)));
  const sum = ks.reduce((a, k) => a + W[k], 0);
  return sum ? Math.round(ks.reduce((a, k) => a + W[k] * Number(A[k].score), 0) / sum * 10) / 10 : (s && s.score);
}

function oqStart_() {
  if (OQ.asking || OQ.list) return;
  OQ.asking = true;
  const list = fetch('data/settings/owner-questions.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(j => { OQ.list = Array.isArray(j && j.questions) ? j.questions : []; })
    .catch(() => { OQ.list = []; OQ.error = 'The questions could not be fetched — check the connection.'; });
  const got = api({ action: 'listOwnerAnswers', name: USER && USER.name })
    .then(d => { OQ.answers = oqOf_(d && !d.error ? d.answers : []); if (d && d.error) OQ.error = String(d.error); })
    .catch(() => { OQ.answers = {}; OQ.error = 'The answers could not be fetched — the questions show unanswered.'; });
  Promise.all([list, got]).then(() => { OQ.asking = false; checksDraw_(); });
}
const oqOf_ = rows => { const o = {}; (Array.isArray(rows) ? rows : []).forEach(r => { if (r && r.id) o[r.id] = r; }); return o; };

/* ONE LINE PER QUESTION: its words, its answers as form buttons, Something else with its box; nothing appears or moves on a press. */
function oqItem_(q) {
  const a = (OQ.answers || {})[q.id] || (q.status === 'answered' ? { choice: q.answer || 'note', note: q.note || '' } : null);
  const opts = Object.keys(q.options || {}).filter(k => q.options[k]);
  const said = a ? 'Answered: ' + (a.choice === 'note' ? '' : '(' + a.choice + ') ' + ((q.options || {})[a.choice] || '')) + (a.note ? ' “' + a.note + '”' : '') : '';
  return `<div class="oq-item" data-oq="${esc(q.id)}">
    <p class="oq-q">${q.philosophy ? '<span class="qtag">Philosophy</span> ' : ''}${esc(q.question)}</p>
    <div class="tile-row">${opts.map(k => tile_({ form: true, kind: a && a.choice === k ? '' : 'quiet', label: k + ') ' + q.options[k], act: 'oq-answer', data: { id: q.id, choice: k } })).join('')}</div>
    <label class="field"><input type="text" data-oq-note value="${esc((a && a.note) || '')}" placeholder="Something else…" maxlength="500" aria-label="${esc(q.question)} — something else" autocomplete="off"></label>
    <div class="tile-row">${tile_({ form: true, kind: 'quiet', label: 'Send note', act: 'oq-answer', data: { id: q.id, choice: 'note' } })}</div>
    <p class="me-said oq-said">${esc(said) || '&nbsp;'}</p>
  </div>`;
}
/* THE INBOX: the five open questions that settle most (philosophy first, then `settles`, then file order); answered fold away. */
const OQ_SHOWN = 5;
const oqDone_ = q => q.status === 'answered' || !!(OQ.answers || {})[q.id];
const oqWeight_ = q => (q.philosophy ? 100 : 0) + (Number(q.settles) || 0);
function oqInbox_() {
  if (!OQ.list) { oqStart_(); return '<h4>Owner questions</h4>' + (typeof loading_ === 'function' ? loading_() : ''); }
  const open = OQ.list.filter(q => !oqDone_(q)).map((q, i) => ({ q, i })).sort((x, y) => oqWeight_(y.q) - oqWeight_(x.q) || x.i - y.i).map(x => x.q);
  const done = OQ.list.filter(oqDone_);
  return `<h4>Owner questions · ${open.length} open${open.length > OQ_SHOWN ? ', ' + OQ_SHOWN + ' shown' : ''}</h4>${OQ.error ? `<p class="me-said">${esc(OQ.error)}</p>` : ''}${open.slice(0, OQ_SHOWN).map(oqItem_).join('')}
    ${done.length ? `<details class="oq-done"><summary>Answered · ${done.length}</summary>${done.map(oqItem_).join('')}</details>` : ''}`;
}

function checksInner_() {
  const s = typeof HEALTH !== 'undefined' ? HEALTH.got : null;
  if (typeof siteHealthCard_ === 'function' && typeof HEALTH !== 'undefined' && !HEALTH.asked) siteHealthCard_();
  if (typeof bizCheckCard_ === 'function' && typeof BC !== 'undefined' && !BC.asking && !BC.fetched && typeof bcStart_ === 'function') setTimeout(bcStart_, 0);
  const head = '<div class="qtags"><span class="qtag">Business</span><span class="qtag">Admin only</span></div><h3>Optimiser</h3>';
  if (!s) return head + (HEALTH && HEALTH.failed ? '<p class="me-said">The score could not be read. Run node tools/health.js and push.</p>' : (typeof loading_ === 'function' ? loading_() : '')) + oqInbox_();
  const A = checksAreas_(s);
  return `${head}<p class="stab-score">Optimiser: ${esc(String(checksTotal_(s, A)))}%</p>
    ${CHECK_AREAS.filter(([k]) => A[k]).map(([k, n]) => `<h4>${esc(n)} ${esc(String(A[k].score))}%${(s.weights || {})[k] ? '' : ' <span class="qtag">inside the others</span>'}</h4>
      <ol class="stab-top">${(A[k].next || []).slice(0, 3).map(t => `<li>${esc(String(t))}</li>`).join('') || '<li>Nothing to do.</li>'}</ol>`).join('')}
    ${oqInbox_()}`;
}
/* THE ONE CARD, then the detail it sums (the Optimiser's code worklist with What's missing, and the business checker's ticks), nothing lost. */
function checksCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  let more = '';
  try { more = (typeof healthWithMissing_ === 'function' ? healthWithMissing_(siteHealthCard_(true)) : '') + (typeof bizCheckCard_ === 'function' ? bizCheckCard_() : ''); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'checks detail'); }
  if (!checksBizLive_()) setTimeout(checksWatchBiz_, 0);
  return card_(`<div class="checks-card" data-checks>${checksInner_()}</div>${more}`);
}
const checksDraw_ = () => { document.querySelectorAll('[data-checks]').forEach(c => { cardFill_(c, checksInner_()); }); };
/* THE LIVE BUSINESS SCORE: redraw once the checker's ticks have come (or a minute passes), without the checker knowing about this card. */
function checksWatchBiz_() {
  if (OQ.watching) return;
  OQ.watching = true;
  const t0 = Date.now();
  (function tick() { if (checksBizLive_() || (typeof BC !== 'undefined' && BC.error) || Date.now() - t0 > 60000) { OQ.watching = false; checksDraw_(); } else setTimeout(tick, 500); })();
}

on('oq-answer', el => {
  if (!isAdmin()) return;
  const id = el.dataset.id, choice = el.dataset.choice, box = el.closest('.oq-item');
  if (!box || !OQ.answers) { toast('The answers are still on their way — a moment.'); return; }
  const note = String((box.querySelector('[data-oq-note]') || {}).value || '').trim();
  if (choice === 'note' && !note) { toast('Write the note first.'); return; }
  send_({ action: 'saveOwnerAnswer', name: USER && USER.name, id, choice, note },
        { button: el, where: box.querySelector('.oq-said'), busy: 'Saving…' })
    .then(d => { OQ.answers[id] = (d && d.answer) || { id, choice, note }; checksDraw_(); })
    .catch(() => { /* send_ already said why in the line */ });
});

/* CHECKS REGISTERS ITSELF as a health card (`healthCardOf_`, missing.js) once every file has run, whatever the load order. */
setTimeout(() => { if (typeof HEALTH_MORE_ !== 'undefined') HEALTH_MORE_.checks = checksCard_; }, 0);

;
/* ==== js/mat.js ==== */
/* @family. — js/mat.js (19 of 20) THE CHEAT SHEET MAKER — one sheet of A4, built from components you tick, printed from the app. § */

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. Measured on the real sheet, not
   derived from 297 minus some margins — the header and foot are content and their height is
   whatever the font makes it. */
const MAT_ROOM = 262;

/* ---------- HOW MANY NARROW BLOCKS GO ACROSS § */
/* ---------- EVERY COMPONENT HAS A FACE § */
/* ---------- EVERY COMPONENT HAS A FIXED AREA § */
const MAT_TRACKS = 6;
/* THE GUTTER, ONCE — the gap between two tracks. The CSS spends it (`.mat-cols` column-gap) and the
   pricing has to know it, so the stylesheet reads it through `--mat-gut` set from here. */
const MAT_GUT = 6;
/* THE ROW UNIT. Slots are whole numbers of these tall, so a slot's height is exact rather than a
   fractional track the browser rounds differently on each sheet. */
const MAT_ROW = 2;
/* THE TEXT BLOCK IS 184mm AND STAYS 184mm. § */
const MAT_TEXT_W = 184;
/* ONE TRACK, AND A SPAN OF N OF THEM — the same two constants the stylesheet is given, so the price in the picker and the width on the paper cannot disagree § */
const matTrackW = () => (MAT_TEXT_W - MAT_GUT * (MAT_TRACKS - 1)) / MAT_TRACKS;
const matSpanW = n => n * matTrackW() + (n - 1) * MAT_GUT;
/* A NARROW BLOCK IS A THIRD, a `pair` block (the hundred square and the times table) two thirds. */
const matColW = () => matSpanW(2);
const matPairW = () => matSpanW(4);
/* HOW MANY TRACKS A COMPONENT TAKES, from what it is rather than from what is beside it. */
const matSpan = c => c.pair ? 4 : (c.half ? 2 : MAT_TRACKS);

/* ---------- THE SECOND FILTER, AND WHY LEVEL ALONE WAS NOT ENOUGH § */
const MAT_TIERED = ['Y9 Mocks', 'GCSE'];

/* WHICH TIER WAS LAST CHOSEN, and separately WHICH TIER IS BEING DRAWN (`MAT_SHOW`). § */
let MAT_TIER = 'H';
/* ---------- GIVEN IN THE EXAM, AS A FILTER § */
let MAT_EXAM = 'all';
let MAT_SHOW = 'H';

/* Does this row survive the tier being drawn? A flag of 'H' means Higher only; anything else — and
   that is most rows — means it is on both papers. */
const matKeep = flag => flag !== 'H' || MAT_SHOW === 'H';

/* Each component: what it is called, which levels it suits, what it costs in millimetres, and whether it sits half-width so it can pair with the next one. § */
/* WHAT PUTS A COMPONENT UNDER A LEVEL, since the first set were tagged by which exam the topic belongs to and that is the wrong question. § */
/* GIVEN IN THE EXAM, OR NOT — `inExam` ON EACH COMPONENT § */
const MAT_PARTS = [
  /* ---------- THE RULER IS A COMPONENT LIKE ANY OTHER § */
  /* `h` IS ITS REAL HEIGHT, THE WHOLE PAGE. § */
  { id: 'M01', name: 'Ruler down the edge', face: '|·| ruler', lv: [], h: 262, half: false, edge: true,
    note: 'prints at true size' },
  /* ---------- THE TWO GRIDS ARE TWO THIRDS OF THE PAGE WIDE § */
  { id: 'M02', name: 'Number square', face: '100 square',      lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 94,  half: true, pair: true },
  { id: 'M03', name: 'Times tables', face: '12×12 tables',       lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 100, half: true, pair: true },
  /* ---------- THE FOUR THAT KEEP THE FULL WIDTH § */
  { id: 'M04', name: 'Number line', face: '0 ½ 1 line',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 20,  half: false },
  { id: 'M05', name: 'Place value', face: 'Th H T U',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 15,  half: true },
  /* MEASURES AND FRACTION=DECIMAL REACH B-TEC. § */
  { id: 'M06', name: 'Measures', face: 'km→m units',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 39,  half: true, inExam: false },
  { id: 'M07', name: 'Angles named', face: '∠ named',       lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 28,  half: true },
  { id: 'M08', name: 'Protractor', face: '◡ protractor',         lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 54,  half: true,
    note: 'prints at true size' },
  /* Y1 AS WELL AS Y2. Naming a triangle and a square is the first year's work, and the block was
     offered to the second year and withheld from the one that starts it. */
  { id: 'M09', name: '2D shapes', face: '△ ▢ ⬠ shapes',          lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 35,  half: false },
  { id: 'M10', name: 'Roman numerals', face: 'XIV numerals',     lv: ['SATs','11+'],                               h: 13,  half: true },
  { id: 'M11', name: 'Fraction = decimal', face: '½ = 0.5', lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 15,  half: true, inExam: false },
  /* NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS. § */
  /* ---------- EIGHT FORMULAE, EIGHT TICKBOXES § */
  { id: 'M12A', name: 'Circle', face: 'πr² circle',            lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12B', name: 'Arc & sector', face: 'θ/360 arc',      lv: ['Y9 Mocks','GCSE'],                          h: 10, half: true, inExam: false },
  { id: 'M12C', name: 'Sphere', face: '⁴⁄₃πr³ sphere',            lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12D', name: 'Cone', face: '⅓πr²h cone',              lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12E', name: 'Prism', face: 'A × l prism',             lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12F', name: 'Compound measures', face: 'd/t speed', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12G', name: 'Percentage change', face: '%Δ change', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12H', name: 'Compound interest', face: 'P(1+r)ⁿ interest', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: true },
  { id: 'M13', name: 'Exact trig values', face: 'sin30 exact',  lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  { id: 'M14', name: 'The trig trick', face: '√n⁄2 trick',     lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  /* INDEX LAWS AND GRAPH SHAPES START AT Y9. Both are Y8/Y9 teaching, and both were tagged from
     GCSE up while the straight line beside them started at Y9 — the same year, three rows apart,
     disagreeing about when algebra begins. */
  { id: 'M15', name: 'Index laws', face: 'aᵐaⁿ index',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 24,  half: true, inExam: false },
  { id: 'M16', name: 'Graph shapes', face: 'y=x² graphs',       lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 40,  half: false, inExam: false },
  /* AS BUT NOT ALEVEL was the clearest error in the table: § */
  { id: 'M17', name: 'Straight line', face: 'y = mx + c',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 29,  half: true, inExam: false },
  { id: 'M18', name: 'Averages', face: 'x̄ averages',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 24,  half: true, inExam: false },
  /* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file. § */
  { id: 'M19', name: 'Pythagoras & trig', face: 'a²+b²=c²',  lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true, inExam: true },
  { id: 'M20', name: 'Angle rules', face: '180° rules',        lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 35,  half: true, inExam: false },
  { id: 'M21', name: 'Area & perimeter', face: '½bh area',   lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  /* SATs. Percentages of an amount is Y6, and fractions, rounding, area and averages all carry
     SATs on the rows around this one — four neighbours teaching the same year, and this the only
     one saying otherwise. */
  { id: 'M22', name: 'Percentages', face: '15% of 40',        lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  { id: 'M23', name: 'Rounding & bounds', face: '≈ bounds',  lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  { id: 'M24', name: 'Standard form', face: 'a × 10ⁿ',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 35,  half: true, inExam: false },
  /* SATs, for the same reason: continuing a number sequence is Y6, and the nth term on top of it
     is what the later levels add rather than what makes the block start. */
  { id: 'M25', name: 'Sequences', face: 'nth term',          lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 41,  half: true, inExam: false },
  /* B-TEC, LIKE THE ALGEBRA EITHER SIDE OF IT. § */
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M26', name: 'Quadratics', face: 'ax²+bx+c',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 23,  half: true, inExam: true },
  /* 11+, WHERE IT IS ASKED. Simple probability is on entrance papers, and this was the only block
     on a common 11+ topic that an 11+ student could not see. */
  { id: 'M27', name: 'Probability', face: 'P(A) chance',        lv: ['11+','Y9 Mocks','GCSE','B-TEC'],            h: 28,  half: true, inExam: false },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M28', name: 'Primes, HCF & LCM', face: 'HCF · LCM',  lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 23,  half: true, inExam: false },
  /* SET NOTATION SITS BESIDE PROBABILITY because that is where the sheet already talks about A and B — 'A and B' and 'A or B' are M27's words for what this block § */
  { id: 'M49', name: 'Set notation', face: 'A ∩ B sets',        lv: ['GCSE'],                                     h: 47,  half: true, tier: 'H', inExam: false },
  /* HIGHER, AND WHOLLY SO — both of these are Higher-only content top to bottom, which is what makes
     them component-wide tiers rather than the row-level ones inside M22, M23, M25 and M26. */
  { id: 'M29', name: 'Sine & cosine rule', face: 'a⁄sin A rule', lv: ['GCSE','AS','Alevel'],                       h: 18,  half: false, tier: 'H', inExam: true },
  { id: 'M30', name: 'Circle theorems', face: '◯ theorems',    lv: ['GCSE'],                                     h: 28,  half: false, tier: 'H', inExam: false },
  { id: 'M31', name: 'Fractions', face: 'a⁄b + c⁄d',          lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  /* YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE. § */
  { id: 'M32', name: 'Differentiation', face: 'dy/dx differ.',    lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M33', name: 'Differentiation rules', face: 'uv′ rules', lv: ['Alevel'],                                h: 29,  half: true },
  { id: 'M34', name: 'Integration', face: '∫ integrate',        lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M35', name: 'Integration methods', face: '∫u dv by parts', lv: ['Alevel'],                                  h: 35,  half: true },
  { id: 'M36', name: 'Logs & exponentials', face: 'ln x logs', lv: ['AS','Alevel'],                             h: 23,  half: true },
  { id: 'M37', name: 'Binomial expansion', face: 'ⁿCᵣ binomial', lv: ['AS','Alevel'],                              h: 17,  half: true },
  { id: 'M38', name: 'Trig identities', face: 'sin²+cos²',    lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M39', name: 'Double & addition', face: 'sin 2A double',  lv: ['Alevel'],                                   h: 23,  half: true },
  { id: 'M40', name: 'Radians', face: 'π = 180° rad',            lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M41', name: 'Series', face: 'Σ series',             lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M42', name: 'Circles & points', face: '(x−a)² eqn',   lv: ['AS','Alevel'],                              h: 23,  half: true },
  { id: 'M43', name: 'Vectors', face: '⟶ vectors',            lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M44', name: 'SUVAT & forces', face: 'F = ma forces',     lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M45', name: 'Binomial distribution', face: 'B(n,p) binomial', lv: ['AS','Alevel'],                           h: 35,  half: true },
  { id: 'M46', name: 'Normal distribution', face: 'N(μ,σ²) normal', lv: ['Alevel'],                                  h: 29,  half: true },
  { id: 'M47', name: 'Hypothesis testing', face: 'H₀ testing', lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M48', name: 'Numerical methods', face: 'xₙ₊₁ iter',  lv: ['Alevel'],                                   h: 23,  half: true },
  /* ---------- THE PERIODIC TABLE § */
  { id: 'M50', subject: 'Science', name: 'Periodic table', face: 'H He table',  lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 96,  half: false, inExam: true },
  /* ---------- THE pH SCALE AND THE INDICATORS § */
  { id: 'M51', subject: 'Science', name: 'Acids, alkalis & indicators', face: 'pH 0–14', lv: ['Y9 Mocks','GCSE','B-TEC'], h: 34, half: true, pair: true, inExam: false },
  /* ---------- THE NUMBER LINE WITH NEGATIVES § */
  { id: 'M52', name: 'Negative number line', face: '−10 0 10 line', lv: ['SATs','11+','Y9 Mocks','GCSE'], h: 15, half: false, inExam: false, at0: 35 },
];

/* ---------- EACH COMPONENT'S HEIGHT, IN MILLIMETRES OF PAPER § */
const MAT_SLOT = {
  M02: 112, M03: 112, M04: 28, M05: 20, M06: 42, M07: 30, M08: 60, M09: 40, M10: 18, M11: 24,
  M12A: 14, M12B: 18, M12C: 18, M12D: 18, M12E: 14, M12F: 14, M12G: 18, M12H: 14,
  M13: 36, M14: 44, M15: 54, M16: 46, M17: 38, M18: 32, M19: 54, M20: 72, M21: 42, M22: 46,
  M23: 46, M24: 38, M25: 42, M26: 44, M27: 50, M28: 46, M29: 24, M30: 36, M31: 46, M32: 46,
  M33: 66, M34: 44, M35: 56, M36: 50, M37: 36, M38: 46, M39: 46, M40: 46, M41: 54, M42: 42,
  M43: 38, M44: 54, M45: 38, M46: 46, M47: 42, M48: 44, M49: 60, M50: 98, M51: 42, M52: 22,
  /* M52 MEASURED ON THE PRINTED SHEET: 18.8mm under a block, with its rule and the 3mm beneath it —
     given a millimetre for another browser's mono and rounded up to the row, 22. */
  /* THE ENGLISH PIECES (see `MAT_PARTS_EN`), measured the same way — each alone at its own slot width, its scroll height read off the page — and given a millimetre § */
  E02: 22, E03: 54, E04: 34, E05: 66, E06: 42, E07: 58, E08: 58, E09: 42, E10: 34, E11: 48,
  E12: 26, E13: 36, E14: 36, E15: 66, E16: 50, E17: 42, E18: 32, E19: 56, E20: 52, E21: 30,
  E22: 44,
};
const matSlot = c => {
  const mm = MAT_SLOT[c.id] || (Number(c.h) || 20) + 8;
  return Math.ceil(mm / MAT_ROW) * MAT_ROW;
};


/* WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says. § */
function matStart() {
  /* ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO § */
  return (DATA.cheatsheet || []).filter(r => r && r.startOn).map(r => r.id);
}
/* ---------- NOTHING IS CHOSEN FOR YOU § */
let MAT_LEVEL = 'all';
let MAT_ON = [];   /* filled from the sheet by matStart() when the tool opens */
/* WHETHER ANYBODY HAS CHOSEN ANYTHING YET. Without this, opening the tool a second time would
   silently undo the sheet somebody had just built. */
let MAT_TOUCHED = false;

/* THE LEVELS THE REST OF THE SITE USES. § */
function matLevels() {
  /* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as options, which is the proof. § */
  const got = ((DATA.dropdowns || {}).levels || []).filter(Boolean);
  return got.length ? got
    : ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel', 'B-TEC'];
}

/* THE BRAND, READ THE WAY THE FLYER READS IT. § */
const matBrand = () => ({
  name:  brand('name', '@family.'),
  area:  brand('area', 'Merton & Wandsworth'),
  site:  brand('site', 'halexdias31-pixel.github.io/family/'),
  phone: brand('phone', ''),
});

/* ---------- WHERE THE COMPONENTS COME FROM § */
/* THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'. § */
const matTierFlag = v => /^h/i.test(String(v || '').trim()) ? 'H'
                       : (/^f/i.test(String(v || '').trim()) ? 'F' : '');

function matParts() {
  const rows = DATA.cheatsheet || [];
  const by = {};
  rows.forEach(r => { if (r && r.id) by[String(r.id).toUpperCase()] = r; });

  /* THE MATHS AND THE ENGLISH, one list — see `MAT_PARTS_EN`. Concatenated here rather than
     written into `MAT_PARTS`, so the English is one block that can be read, and moved, whole. */
  const all = MAT_PARTS.concat(MAT_PARTS_EN);

  const out = all.map((c, i) => {
    const r = by[c.id];
    /* IN THE CODE AND NOT IN THE SHEET is not the same as switched off. § */
    if (!r) return Object.assign({}, c, { h: c.edge ? MAT_ROOM : matSlot(c), at: c.at0 || (i + 1) * 10 });
    const levels = String(r.levels || '').split(/[,\n|]/).map(s => s.trim()).filter(Boolean);
    return Object.assign({}, c, {
      name:  r.name || c.name,
      /* A SUBJECT THE SHEET CAN SET, and an empty cell leaves the code's — see `matSubjectOf`. */
      subject: r.subject || c.subject,
      lv:    levels.length ? levels : c.lv,
      /* THE SHEET CAN ADD A TIER AND IT CAN TAKE ONE AWAY. `'-'` is how you say "both papers" about
         a component the code calls Higher-only, since an empty cell already means "no opinion" and
         one value cannot mean both. */
      tier:  r.tier === '-' ? '' : (matTierFlag(r.tier) || c.tier),
      /* ---------- AN EDGE PIECE'S HEIGHT IS NOT A SETTING § */
      /* ---------- AND THE SLOT IS NOT A SETTING EITHER § */
      h:     c.edge ? MAT_ROOM : matSlot(c),
      /* WHETHER THE EXAM GIVES YOU THIS. Only the sheet knows — nothing in the code has an opinion,
         and null stays null so "nobody has checked" survives all the way to the screen. */
      /* THE SHEET WINS, THE CODE ANSWERS WHEN IT IS SILENT. `null` from the tab means the cell was
         empty, which is "nobody has checked" — and that is not the same as the code not knowing. */
      inExam: (r.inExam === undefined || r.inExam === null)
                ? (c.inExam === undefined ? null : c.inExam) : r.inExam,
      at:    r.order === null || r.order === undefined ? (c.at0 || (i + 1) * 10) : r.order,
    });
  });

  /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a column
     of blank `sort_order` cells leaves the sheet exactly as it prints today, and filling in one cell
     moves one component. */
  /* ONE SUBJECT AFTER ANOTHER, THEN THE SHEET'S ORDER WITHIN IT. § */
  const order = matSubjectOrder(out);
  const rank = c => { const s = matSubjectOf(c); return s ? order.indexOf(s) + 1 : 0; };
  return out.sort((a, b) => rank(a) - rank(b) || a.at - b.at);
}

/* ---------- THE BLOCKS § */
const MAT_HTML = {
  M02: () => matGrid('mat-hun', 100, n => {
    const c = n % 10 === 0 ? ' ten' : (n % 5 === 0 ? ' five' : '');
    return `<i class="${c.trim()}">${n}</i>`;
  }),
  M03: () => {
    let h = '<i class="h"></i>';
    for (let x = 1; x <= 12; x++) h += `<i class="h">${x}</i>`;
    for (let y = 1; y <= 12; y++) {
      h += `<i class="h">${y}</i>`;
      for (let x = 1; x <= 12; x++) h += `<i class="${x === y ? 'sq' : ''}">${x * y}</i>`;
    }
    return `<div class="mat-tt">${h}</div>`;
  },
  M04: () => {
    const W = 100;
    const fr = [[0,1,'0'],[1,4,'¼'],[1,3,'⅓'],[1,2,'½'],[2,3,'⅔'],[3,4,'¾'],[1,1,'1']];
    let h = fr.map(([n, d, l]) =>
      `<i style="left:${W*n/d}%"></i><b style="left:${W*n/d}%">${l}</b>`).join('');
    for (let k = 0; k <= 10; k++) {
      h += `<u style="left:${k*10}%"></u>`;
      /* THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT. § */
      if ([2,4,6,8].indexOf(k) !== -1) h += `<s style="left:${k*10}%">${(k/10).toFixed(1)}</s>`;
    }
    return `<div class="mat-nl">${h}</div>`;
  },
  M05: () => `<div class="mat-pv">${
    [['Th','1000'],['H','100'],['T','10'],['U','1'],['•',''],['t','0.1'],['h','0.01']]
      .map(([c, v]) => `<i class="${c === '•' ? 'dot' : ''}"><b>${c}</b><em>${v}</em></i>`).join('')}</div>`,
  M06: () => `<div class="mat-meas">${
    [['Length', ['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km']],
     ['Mass', ['1000 g = 1 kg','1000 kg = 1 tonne']],
     ['Capacity', ['1000 ml = 1 litre','100 cl = 1 litre']],
     ['Time', ['60 sec = 1 min','60 min = 1 hr','24 hr = 1 day']]]
      .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  M07: () => matAngles(),
  M08: () => matProtractor(),
  M09: () => `<div class="mat-shapes">${
    [['triangle',3],['square',4],['pentagon',5],['hexagon',6],
     ['heptagon',7],['octagon',8],['nonagon',9],['decagon',10]]
      .map(([n, k]) => `<div>${matPoly(k)}<span>${n}</span><em>${k} sides</em></div>`).join('')}</div>`,
  M10: () => `<div class="mat-rom">${
    [['I',1],['V',5],['X',10],['L',50],['C',100],['D',500],['M',1000]]
      .map(([a, b]) => `<i><b>${a}</b>${b}</i>`).join('')}
    <i class="wide">4 = IV · 9 = IX · 40 = XL · 90 = XC · 2026 = MMXXVI</i></div>`,
  M11: () => `<div class="mat-fdp">${
    [[fr('1','2'),'0.5','50%'], [fr('1','4'),'0.25','25%'], [fr('3','4'),'0.75','75%'],
     [fr('1','3'),'0.33','33⅓%'], [fr('1','5'),'0.2','20%'], [fr('1','10'),'0.1','10%'],
     [fr('1','8'),'0.125','12.5%'], [fr('1','1'),'1.0','100%']]
      .map(([f, d, p]) => `<i><b>${f}</b><em>${d}</em><em>${p}</em></i>`).join('')}</div>`,
  /* THE THIRD ENTRY IS THE TIER. § */
  M12A: () => matPairs([['Circle','A = πr² · C = 2πr']]),
  M12B: () => matPairs([['Arc, sector', fr('θ','360') + ' × 2πr · × πr²']]),
  M12C: () => matPairs([['Sphere', 'V = ' + fr('4','3') + 'πr³ · A = 4πr²']]),
  M12D: () => matPairs([['Cone', 'V = ' + fr('1','3') + 'πr²h · πrl']]),
  M12E: () => matPairs([['Prism','V = cross-section × length']]),
  M12F: () => matPairs([['Compound','speed = d/t · density = m/v']]),
  M12G: () => matPairs([['% change', fr('new − old','old') + ' × 100']]),
  M12H: () => matPairs([['Interest','P(1 + r)ⁿ']]),
  /* EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY. § */
  M13: () => {
    const surd = n => fr('√' + n, '2');
    const rows = [['sin', [0, 1, 2, 3, 4].map(surd)],
                  ['cos', [4, 3, 2, 1, 0].map(surd)],
                  ['tan', ['0', '√3/3', '1', '√3', '—']]];
    let h = ['', '0°', '30°', '45°', '60°', '90°'].map(x => `<i class="h">${x}</i>`).join('');
    rows.forEach(([name, vs]) => {
      h += `<i class="h">${name}</i>` + vs.map(v => `<i>${v}</i>`).join('');
    });
    return `<div class="mat-trig">${h}</div>`;
  },
  M14: () => matTrick(),
  /* POSITIVE POWERS AND THE ZERO INDEX ARE ON BOTH PAPERS. Negative and fractional indices are
     Higher, and they are the two rows a Foundation student would spend the longest reading. */
  M15: () => matPairs([['aᵐ × aⁿ','aᵐ⁺ⁿ'],['aᵐ ÷ aⁿ','aᵐ⁻ⁿ'],['(aᵐ)ⁿ','aᵐⁿ'],
                       ['a⁰','1'],['a⁻ⁿ', fr('1','aⁿ'), 'H'],
                       /* SUPERSCRIPT, LIKE THE FIVE ABOVE IT. § */
                       ['a<sup>1/n</sup>','ⁿ√a','H'],
                       ['a<sup>1/2</sup>','√a','H']]),
  M16: () => matGraphs(),
  /* PARALLEL IS ON BOTH PAPERS AND PERPENDICULAR IS NOT — the one distinction in this block, and
     the reason it could not be tiered as a whole. */
  M17: () => matPairs([['y = mx + c','m is the gradient, c the crossing'],
                       ['gradient', fr('y₂ − y₁','x₂ − x₁')],
                       ['parallel','same m'], ['perpendicular','m₁ × m₂ = −1', 'H']]),
  M18: () => matPairs([['mean','add up, divide by how many'], ['median','in order, take the middle'],
                       ['mode','the one that appears most'], ['range','biggest minus smallest']]),

  /* ---------- THE SECONDARY SET § */
  M19: () => matPairs([['a² + b² = c²','c is the longest side'], ['a shorter side','c² − a²'],
                       ['sin', fr('opp','hyp')], ['cos', fr('adj','hyp')], ['tan', fr('opp','adj')],
                       ['an angle','sin⁻¹ cos⁻¹ tan⁻¹']]),

  M20: () => matPairs([['straight line','180°'], ['at a point','360°'], ['triangle','180°'],
                       ['quadrilateral','360°'], ['vertically opposite','equal'],
                       ['alternate (Z)','equal'], ['corresponding (F)','equal'],
                       ['co-interior (C)','180°'], ['exterior sum','360°'],
                       ['interior sum','(n − 2) × 180°']]),

  M21: () => matPairs([['rectangle','bh'], ['triangle','½bh'], ['parallelogram','bh'],
                       ['trapezium','½(a + b)h'], ['circle','πr²'], ['compound','split it, add up']]),

  /* REVERSE PERCENTAGE IS THE HIGHER LINE. Finding the original amount is the one thing in this
     block a Foundation paper does not ask for, and it is also the one people get wrong by doing the
     obvious thing instead. */
  M22: () => matPairs([['15% of 40','0.15 × 40'], ['up 15%','× 1.15'], ['down 15%','× 0.85'],
                       ['reverse','÷ the multiplier','H'], ['change', fr('new − old','old')],
                       ['compound','P(1 + r)ⁿ']]),

  M23: () => matPairs([['3 s.f.','from the first non-zero'], ['2 d.p.','after the point'],
                       ['5 or more','rounds up'], ['estimating','1 s.f. each first'],
                       ['error interval','± half the unit','H'], ['bounds of a sum','max + max','H']]),

  M24: () => matPairs([['a × 10ⁿ','1 ≤ a < 10'], ['big','n positive'], ['small','n negative'],
                       ['×','× the a, add the n'], ['÷','÷ the a, take the n']]),

  M25: () => matPairs([['linear nth term','difference × n, adjust'],
                       ['term-to-term','what gets the next one'],
                       ['quadratic','2nd difference ÷ 2','H'], ['geometric','× a common ratio'],
                       ['triangular','1 3 6 10 15 21'], ['Fibonacci','add the two before']]),

  /* FULL WIDTH, because two of these values are twenty-four characters of algebra that cannot be
     said any shorter and would wrap to three lines in a half-width column. */
  M26: () => matPairs([['factorising','× to c, + to b'], ['two squares','x² − a² = (x + a)(x − a)'],
                       ['the formula', fr('−b ± √(b² − 4ac)','2a'), 'H'],
                       ['completing the square','(x + b/2)² − (b/2)² + c','H'],
                       ['discriminant','b² − 4ac','H']]),

  M27: () => matPairs([['all outcomes','add to 1'], ['not A','1 − P(A)'],
                       ['A and B','× along branches'], ['A or B','+ the branches'],
                       ['expected number','P × trials'], ['relative frequency', fr('successes','trials')]]),

  M28: () => matPairs([['prime','exactly two factors'], ['primes to 30','2 3 5 7 11 13 17 19 23 29'],
                       ['product of primes','divide by the smallest'], ['HCF','the shared primes'],
                       ['LCM','every prime, shared once'], ['BIDMAS','brackets, indices, ÷×, +−']]),

  M29: () => matPairs([['sine rule', fr('a','sin A') + ' = ' + fr('b','sin B')],
                       ['cosine rule','a² = b² + c² − 2bc cos A'], ['area','½ab sin C'],
                       ['which one','angle between → cosine']]),

  M30: () => `<div class="mat-circ">${[
  /* THE DIAMETER IS DASHED, because it is construction rather than part of the theorem — the
     theorem is the two lines to the edge and the right angle they make. */
  matCirc('<path d="M20,52 L100,52" class="dash"/>' +
          '<path d="M20,52 L60,12 L100,52" class="ln"/>' +
          '<path d="M60,12 L54.3,17.7 L60,23.4 L65.7,17.7 Z" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'semicircle &rarr; 90&deg;'),

  matCirc('<path d="M25.4,72 L60,52 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L60,12 L94.6,72" class="ln"/>' +
          '<text x="60" y="70" class="lb" text-anchor="middle">2x</text>' +
          '<text x="60" y="34" class="lb" text-anchor="middle">x</text>',
          'centre &rarr; twice the edge'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ch"/>' +
          '<path d="M25.4,72 L40,17.4 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L80,17.4 L94.6,72" class="ln"/>' +
          '<text x="34" y="33" class="lb">x</text><text x="79" y="33" class="lb">x</text>',
          'same segment &rarr; equal'),

  matCirc('<polygon points="31.7,23.7 88.3,23.7 94.6,72 25.4,72" class="ln"/>' +
          '<text x="36" y="37" class="lb">x</text><text x="82" y="66" class="lb">y</text>',
          'cyclic quad &rarr; 180&deg;'),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,52 L60,92" class="ln"/>' +
          '<path d="M60,84 L68,84 L68,92" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'tangent &amp; radius &rarr; 90&deg;'),

  /* THIS ONE IS DRAWN ON ITS OWN CIRCLE — the external point has to sit inside the box, so the circle moves up and shrinks rather than the point falling off the § */
  matCirc('<circle cx="60" cy="45" r="34" class="rim"/>' +
          '<path d="M60,100 L27.7,58.9 M60,100 L92.3,58.9" class="ln"/>' +
          '<path d="M44,80 L50,76 M76,80 L70,76" class="mk"/>' +
          '<circle cx="60" cy="100" r="1.8" class="dot"/>',
          'two tangents &rarr; equal', true),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,92 L94.6,32" class="ln"/>' +
          '<path d="M25.4,32 L60,92 M25.4,32 L94.6,32" class="ln"/>' +
          '<text x="67" y="87" class="lb">x</text><text x="30" y="46" class="lb">x</text>',
          'alternate segment &rarr; same'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ln"/><path d="M60,52 L60,72" class="ln"/>' +
          '<path d="M60,64 L68,64 L68,72" class="mk"/>' +
          '<path d="M42.7,68 L42.7,76 M77.3,68 L77.3,76" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'centre to chord &rarr; bisects')
].join('')}</div>`,

  M49: () => `<div class="mat-venn">${[
    matVenn(VS_LENS, 'A &#8745; B', 'in both'),
    matVenn('<circle class="vs-on" cx="38" cy="28" r="22"/><circle class="vs-on" cx="58" cy="28" r="22"/>',
            'A &#8746; B', 'in either'),
    /* NOT-A IS THE BOX WITH ONE HOLE IN IT, and the hole is A alone. § */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>' +
            '<circle class="vs-out" cx="38" cy="28" r="22"/>',
            'A&#8242;', 'not in A'),
    /* AND &#958; IS EVERYTHING, circles included — shading the box but leaving the two circles white
       says "everything except A and B", which is the one thing &#958; is not. */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>',
            '&#958;', 'everything'),
  ].join('')}</div>`,

  M31: () => matPairs([['adding','same denominator first'], ['multiplying','tops × tops'],
                       ['dividing','flip and multiply'], ['of','× the fraction'],
                       ['mixed → improper','whole × bottom, + top'], ['simplifying','÷ both by the HCF']]),

  /* ---------- A-LEVEL § */
  M32: () => matPairs([['xⁿ','nxⁿ⁻¹'], ['gradient there','put x into f′(x)'],
                       ['tangent','y − y₁ = m(x − x₁)'], ['normal', 'gradient −' + fr('1','m')],
                       ['stationary','f′(x) = 0'], ['max or min','f″(x) < 0 is a max']]),

  M33: () => matPairs([['chain','f′(g) × g′'], ['product','u′v + uv′'],
                       ['quotient', fr('u′v − uv′','v²')], ['sin x','cos x'], ['cos x','−sin x'],
                       ['eˣ','eˣ'], ['ln x', fr('1','x')], ['dy/dx', fr('1','dx/dy')]]),

  M34: () => matPairs([['xⁿ', fr('xⁿ⁺¹','n + 1') + ' + c'], ['the + c','indefinite only'],
                       ['definite','F(b) − F(a)'], ['area under a curve','∫ between the limits'],
                       ['below the axis','comes out negative']]),

  M35: () => matPairs([['by parts','∫u dv = uv − ∫v du'], ['substitution','change the limits too'],
                       [fr('1','x'), 'ln |x| + c'], ['eˣ','eˣ + c'], ['sin x','−cos x + c'],
                       ['cos x','sin x + c'], [fr('f′(x)','f(x)'), 'ln |f(x)| + c']]),

  M36: () => matPairs([['log a + log b','log ab'], ['log a − log b', 'log ' + fr('a','b')],
                       ['n log a','log aⁿ'], ['log 1','0'], ['aˣ = b', 'x = ' + fr('log b','log a')],
                       ['ln and eˣ','undo each other']]),

  M37: () => matPairs([['(a + b)ⁿ','ⁿCr aⁿ⁻ʳ bʳ'], ['ⁿCr', fr('n!','r!(n − r)!')],
                       ['the terms','r counts from 0'], ['(1 + x)ⁿ, any n','|x| < 1']]),

  M38: () => matPairs([['sin² + cos²','1'], ['tan', fr('sin','cos')], ['1 + tan²','sec²'],
                       ['1 + cot²','cosec²'], ['sin(−x)','−sin x'], ['cos(−x)','cos x']]),

  /* FULL WIDTH — these are the longest values in the file and there is no shorter way to write an
     addition formula that is still the formula. */
  M39: () => matPairs([['sin(A ± B)','sinA cosB ± cosA sinB'],
                       ['cos(A ± B)','cosA cosB ∓ sinA sinB'], ['sin 2A','2 sinA cosA'],
                       ['cos 2A','1 − 2sin²A'], ['tan 2A', fr('2 tanA','1 − tan²A')],
                       ['a sinx + b cosx','R sin(x + α)']]),

  M40: () => matPairs([['180°','π radians'], ['arc','rθ'], ['sector','½r²θ'],
                       ['sin θ ≈','θ'], ['tan θ ≈','θ'], ['cos θ ≈', '1 − ' + fr('θ²','2')]]),

  M41: () => matPairs([['arithmetic nth','a + (n − 1)d'],
                       ['arithmetic sum','½n(2a + (n − 1)d)'], ['geometric nth','arⁿ⁻¹'],
                       ['geometric sum', fr('a(1 − rⁿ)','1 − r')], ['to infinity', fr('a','1 − r')],
                       ['it converges when','|r| < 1']]),

  M42: () => matPairs([['circle','(x − a)² + (y − b)² = r²'], ['centre','(a, b)'],
                       ['tangent','perpendicular to the radius'], ['semicircle','angle is 90°'],
                       ['midpoint','average the ends'], ['distance','√((x₂−x₁)² + (y₂−y₁)²)']]),

  M43: () => matPairs([['magnitude','√(x² + y²)'], ['unit vector','÷ its magnitude'],
                       ['i and j','across and up'], ['parallel','one is a multiple'],
                       ['position vector','from the origin']]),

  M44: () => matPairs([['v','u + at'], ['s','ut + ½at²'], ['v²','u² + 2as'],
                       ['s (average)','½(u + v)t'], ['F','ma'], ['weight','mg'],
                       ['friction','F ≤ μR'], ['g','9.8 m s⁻²']]),

  M45: () => matPairs([['when','fixed n, two outcomes'], ['X ~','B(n, p)'],
                       ['P(X = r)','ⁿCr pʳ (1 − p)ⁿ⁻ʳ'], ['mean','np'],
                       ['P(X ≤ r)','tables or calculator']]),

  M46: () => matPairs([['X ~','N(μ, σ²)'], ['standardise', 'Z = ' + fr('x − μ','σ')], ['Z ~','N(0, 1)'],
                       ['within 1σ','about 68%'], ['within 2σ','about 95%'],
                       ['inverse normal','from a probability']]),

  M47: () => matPairs([['H₀','the assumption'], ['H₁','what you suspect'],
                       ['one tail','5% at one end'], ['two tail','2.5% each end'],
                       ['reject H₀','p < the level'], ['then say it','in context']]),

  M48: () => matPairs([['sign change','a root lies between'],
                       ['Newton–Raphson', 'x − ' + fr('f(x)','f′(x)')],
                       ['trapezium','½h[(y₀ + yₙ) + 2(rest)]'], ['h', fr('b − a','n')],
                       ['iteration','xₙ₊₁ = g(xₙ)']]),

  M50: () => matPeriodic(),

  M51: () => matPh(),
  /* −10 TO 10, ONE TICK A WHOLE NUMBER, PLACED BY PERCENTAGE like M04 so the line is the same at any slot width. § */
  M52: () => {
    let h = '<em class="l"></em><em class="r"></em>';
    for (let n = -10; n <= 10; n++) {
      const at = (n + 10) * 5;
      const z = n === 0 ? ' class="z"' : '';
      h += `<i${z} style="left:${at}%"></i><b${z} style="left:${at}%">${n < 0 ? '−' + (-n) : n}</b>`;
    }
    return `<div class="mat-neg">${h}</div>`;
  },
};

/* ---------- THE pH SCALE § */
const MAT_PH = ['#d7191c', '#e8402b', '#f0672d', '#f68f2f', '#fbb72f', '#f7dc33', '#c9d936', '#5fb846',
                '#2f9e6b', '#1f8aa0', '#2168b0', '#2f4ea3', '#4a3a96', '#5e2c86', '#6d1f75'];
function matPh() {
  if (MAT_PH.length !== 15) return '<p class="mat-gone">The pH scale has a colour missing.</p>';
  const cells = MAT_PH.map((c, n) =>
    `<i style="background:${c};color:var(${n >= 3 && n <= 7 ? '--paper-ink' : '--white'})">${n}</i>`).join('');
  /* THE THREE INDICATORS, as the words a mark scheme accepts. § */
  const ind = [['litmus', 'red', 'blue'], ['methyl orange', 'red', 'yellow'],
               ['phenolphthalein', 'colourless', 'pink']]
    .map(([n, a, b]) => `<i><b>${n}</b><em>${a}</em><em>${b}</em></i>`).join('');
  return `<div class="mat-ph">
    <div class="mat-ph-bar">${cells}</div>
    <div class="mat-ph-say"><span>&larr; acid</span><span>neutral 7</span><span>alkali &rarr;</span></div>
    <p class="mat-ph-note">strong acid 0&ndash;2 &middot; weak acid 3&ndash;6 &middot; weak alkali 8&ndash;11 &middot; strong alkali 12&ndash;14. One pH lower is 10&times; more H&#8314; ions.</p>
    <div class="mat-ph-ind"><i><b></b><em>in acid</em><em>in alkali</em></i>${ind}</div>
  </div>`;
}

/* ---------- THE PERIODIC TABLE, 118 OF THEM § */
const MAT_ELEMENTS = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu '
  + 'Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm '
  + 'Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np '
  + 'Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' ');

/* WHERE ELEMENT Z SITS: § */
function matPtAt(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  const small = (start, row) => {           /* periods 2 and 3: two s-block, then six p-block */
    const k = z - start;
    return [row, k < 2 ? k + 1 : k + 11];
  };
  if (z <= 10) return small(3, 2);
  if (z <= 18) return small(11, 3);
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  const heavy = (start, row, fRow, fFrom) => {  /* periods 6 and 7, with their f-block pulled out */
    if (z < start + 2) return [row, z - start + 1];
    if (z <= fFrom + 14) return [fRow, z - fFrom + 3];
    return [row, z - fFrom - 11];
  };
  if (z <= 86) return heavy(55, 6, 9, 57);
  return heavy(87, 7, 10, 89);
}

/* THE CELL IS A NUMBER AND A SYMBOL, which is what the question asked for and what fits: § */
function matPeriodic() {
  if (MAT_ELEMENTS.length !== 118) return '<p class="mat-gone">The periodic table has a symbol missing.</p>';
  let h = '';
  [[1, '1'], [2, '2'], [13, '3'], [14, '4'], [15, '5'], [16, '6'], [17, '7'], [18, '0']]
    .forEach(([col, g]) => { h += `<s style="grid-area:1/${col}">${g}</s>`; });
  MAT_ELEMENTS.forEach((sym, n) => {
    const z = n + 1, [row, col] = matPtAt(z);
    h += `<i style="grid-area:${row + 1}/${col}"><em>${z}</em><b>${sym}</b></i>`;
  });
  /* WHERE THE f-BLOCK WAS TAKEN FROM, so the gap under barium reads as a reference rather than as a
     missing element. */
  h += '<u style="grid-area:7/3">57–71</u><u style="grid-area:8/3">89–103</u>';
  return `<div class="mat-pt">${h}</div>`;
}

const matGrid = (cls, n, cell) => {
  let h = '';
  for (let k = 1; k <= n; k++) h += cell(k);
  return `<div class="${cls}">${h}</div>`;
};
/* EVERY PAIRS BLOCK IS TIER-FILTERED HERE, once, rather than in each of the four that use it — so a
   row tagged 'H' anywhere disappears on Foundation without its block having to know about tiers. */
/* ---------- A FRACTION, DRAWN AS ONE § */
const fr = (top, bottom) =>
  `<span class="mat-fr"><span>${top}</span><span>${bottom}</span></span>`;


/* ---------- FOUR VENNS, ONE PICTURE EACH § */
const matVenn = (fill, sym, say) =>
  `<i><svg viewBox="0 0 96 56" xmlns="http://www.w3.org/2000/svg">
      <rect class="vs-box" x="3" y="3" width="90" height="50"/>
      ${fill}
      <circle class="vs-c" cx="38" cy="28" r="22"/>
      <circle class="vs-c" cx="58" cy="28" r="22"/>
      <text class="vs-l" x="20" y="14">A</text><text class="vs-l" x="72" y="14">B</text>
      <text class="vs-x" x="7" y="50">&#958;</text>
    </svg><b>${sym}</b><em>${say}</em></i>`;

/* THE LENS. Both arcs bulge the same way, so the path traces one circle down and the other back up
   — the two crossing points are where x = 48 and y = 28 &plusmn; &radic;(22&sup2; &minus; 10&sup2;). */
const VS_LENS = '<path class="vs-on" d="M48 8.4 A22 22 0 0 0 48 47.6 A22 22 0 0 0 48 8.4 Z"/>';

/* `own` IS FOR THE ONE FIGURE THAT NEEDS A DIFFERENT CIRCLE. § */
const matCirc = (inner, cap, own) =>
  `<i><svg viewBox="0 0 120 104" xmlns="http://www.w3.org/2000/svg">${
     own ? '' : '<circle cx="60" cy="52" r="40" class="rim"/>'}${inner}</svg><em>${cap}</em></i>`;

const matPairs = rows => `<div class="mat-two">${
  rows.filter(r => matKeep(r[2])).map(([a, b]) => `<i><b>${a}</b><em>${b}</em></i>`).join('')}</div>`;

/* ---------- THE DRAWN PIECES § */
/* ---------- EVERY SHAPE THE SAME SIZE ON THE PAGE § */
function matPoly(n) {
  const off = n === 4 ? Math.PI / n : 0;
  const raw = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + off + 2 * Math.PI * k / n;
    raw.push([Math.cos(a), Math.sin(a)]);
  }
  const xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  /* THE LARGER DIMENSION DECIDES, so a tall shape and a wide one both fit and neither is cropped. */
  const k = 32 / Math.max(w, h);
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const pts = raw.map(([x, y]) =>
    (20 + (x - midX) * k).toFixed(1) + ',' + (20 + (y - midY) * k).toFixed(1));
  return `<svg viewBox="0 0 40 40"><polygon points="${pts.join(' ')}" fill="none"
    stroke="currentColor" stroke-width="1.4"/></svg>`;
}

/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. § */
function matProtractor() {
  /* A PROTRACTOR YOU CAN ACTUALLY READ AT THE ENDS. § */
  const R = 41, cx = R + 4, cy = R + 4;
  const INK = 'ink', MID = 'mid', FAINT = 'faint', RED = 'red';
  const at = (r, t) => [(cx + r * Math.cos(t)).toFixed(2), (cy - r * Math.sin(t)).toFixed(2)];

  let p = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none"
    class="s-${MID}" stroke-width=".4"/>`;

  for (let a = 0; a <= 180; a++) {
    const t = Math.PI * (180 - a) / 180;
    const ten = a % 10 === 0, five = a % 5 === 0;
    const [x1, y1] = at(ten ? R - 6.5 : (five ? R - 4.5 : R - 2.4), t);
    const [x2, y2] = at(R, t);
    p += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      class="s-${ten ? INK : (five ? MID : FAINT)}" stroke-width="${ten ? .45 : (five ? .3 : .18)}"/>`;

    if (!ten) continue;
    /* ROTATED WITH THE RADIUS. `a - 90` is upright at the top and a quarter turn at either end,
       which is exactly how the two scales stop overlapping down there. */
    const turn = a - 90;
    const [ox, oy] = at(R - 10.5, t);
    const [ix, iy] = at(R - 16, t);
    p += `<text x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" class="f-${INK}" transform="rotate(${turn} ${ox} ${oy})">${a}</text>`;
    p += `<text x="${ix}" y="${iy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" class="f-${RED}" transform="rotate(${turn} ${ix} ${iy})">${180 - a}</text>`;
  }

  /* THE BASELINE, AND THE CROSS YOU LINE UP WITH THE VERTEX. The cross is the one part of a
     protractor that is used rather than read, so it stays the strongest mark on it. */
  p += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" class="s-${INK}" stroke-width=".5"/>
    <line x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" class="s-${RED}" stroke-width=".6"/>
    <line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}" class="s-${RED}" stroke-width=".6"/>
    <circle cx="${cx}" cy="${cy}" r="1.1" fill="none" class="s-${RED}" stroke-width=".4"/>`;

  return `<div class="mat-prot"><svg viewBox="0 0 ${2 * (R + 4)} ${R + 8}">${p}</svg></div>`;
}

function matAngles() {
  const kinds = [['acute', 45, 'less than 90'], ['right', 90, 'exactly 90'],
                 ['obtuse', 130, '90 to 180'], ['straight', 180, 'exactly 180'],
                 ['reflex', 250, 'more than 180']];
  return `<div class="mat-ang">${kinds.map(([name, deg, note]) => {
    const t = Math.PI * deg / 180;
    const x = 20 + 15 * Math.cos(t), y = 22 - 15 * Math.sin(t);
    const arc = deg === 180 ? '' :
      `<path d="M 27 22 A 7 7 0 ${deg > 180 ? 1 : 0} 0
        ${(20 + 7 * Math.cos(t)).toFixed(1)} ${(22 - 7 * Math.sin(t)).toFixed(1)}"
        fill="none" class="s-red" stroke-width=".7"/>`;
    return `<div><svg viewBox="0 0 40 30">
      <line x1="20" y1="22" x2="36" y2="22" stroke="currentColor" stroke-width="1.4"/>
      <line x1="20" y1="22" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
        stroke="currentColor" stroke-width="1.4"/>${arc}</svg>
      <span>${name}</span><em>${note}</em></div>`;
  }).join('')}</div>`;
}

/* ---------- THE TRICK, WHICH BEATS THE TABLE § */
function matTrick() {
  const angs = ['0°','30°','45°','60°','90°'];
  const row = (label, ns, simp) =>
    `<div class="mat-tk-row"><b>${label}</b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
       <div class="mat-tk-nums">${ns.map(n => `<i>${n}</i>`).join('')}</div></div></div>
     <div class="mat-tk-simp"><b></b><div class="mat-tk-nums">${
       simp.map(v => `<u>${v}</u>`).join('')}</div></div>`;
  return `<div class="mat-tk">
    <div class="mat-tk-row"><b></b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
      <div class="mat-tk-nums">${angs.map(a => `<em>${a}</em>`).join('')}</div></div></div>
    ${row('sin', ['0','1','2','3','4'], ['0','½','√2/2','√3/2','1'])}
    ${row('cos', ['4','3','2','1','0'], ['1','√3/2','√2/2','½','0'])}
    <p class="mat-tk-say">Every one is <b>√n over 2</b>. Count up for sine, down for cosine.
      tan = sin ÷ cos.</p></div>`;
}

/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the half of it nobody can use. § */
function matGraphs() {
  const W = 44, H = 34;
  /* ---------- A BREAK IN A CURVE IS PART OF THE CURVE § */
  const curve = f => {
    const runs = [];
    let run = [];
    for (let k = 0; k <= 40; k++) {
      const x = -1.6 + 3.2 * k / 40;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 3) {
        if (run.length > 1) runs.push(run);
        run = [];
        continue;
      }
      run.push((W / 2 + x * W / 3.6).toFixed(1) + ',' + (H / 2 - y * H / 7).toFixed(1));
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };
  /* FOUNDATION RECOGNISES LINEAR AND QUADRATIC. Cubic, reciprocal and exponential are Higher, and
     the tier is the fourth entry rather than the third because the third is the function. */
  const kinds = [['linear','y = x', x => x], ['quadratic','y = x²', x => x * x],
                 ['cubic','y = x³', x => x ** 3, 'H'],
                 /* NO CLAMP. Returning 9 near zero was a way of forcing a skip under the old
                    single-line drawing; now the skip is real, `1/x` can be handed over as itself
                    and the |y| > 3 test does the cutting. */
                 ['reciprocal','y = 1/x', x => 1 / x, 'H'],
                 ['exponential','y = 2ˣ', x => Math.pow(2, x) - 1, 'H']];
  return `<div class="mat-graphs">${kinds.filter(k => matKeep(k[3])).map(([n, eq, f]) =>
    `<div><svg viewBox="0 0 ${W} ${H}">
      ${/* AXES IN THE SHEET'S GREY. § */
            ''}
      <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" class="s-faint" stroke-width=".4"/>
      <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" class="s-faint" stroke-width=".4"/>
      ${curve(f).map(pts =>
        `<polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/>`
      ).join('')}
    </svg><span>${n}</span><em>${eq}</em></div>`).join('')}</div>`;
}

/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. § */
function matRuler(mmHigh) {
  let h = '';
  for (let mm = 0; mm <= mmHigh; mm++) {
    /* THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE. § */
    const long = mm % 10 === 0, mid = mm % 5 === 0;
    h += `<i class="${long ? 'cm' : (mid ? 'mid' : '')}" style="top:${mm}mm"></i>`;
    if (long && mm > 0) h += `<b style="top:${mm}mm">${mm / 10}</b>`;
  }
  /* ---------- THE SHEET SAYS WHAT TO DO WHEN IT COMES OUT WRONG § */
  h += '<s class="mat-rule-say">100% scale<br>no fit to page</s>';
  return h;
}

/* A SUBJECT, AND THE ENGLISH PIECES IT OPENS § */
const MAT_PARTS_EN = [
  { id: 'E02', subject: 'English', name: 'Alphabet — print and cursive', face: 'Aa Bb alphabet',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 22, half: false, inExam: false },
  { id: 'E03', subject: 'English', name: 'Word classes', face: 'noun · verb',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E04', subject: 'English', name: 'Sentence types', face: 'sentences',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E05', subject: 'English', name: 'Punctuation and what it does', face: '. , ; : marks',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 52, half: true, inExam: false },
  { id: 'E06', subject: 'English', name: 'Apostrophes', face: '’s apostrophes',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 30, half: true, inExam: false },
  { id: 'E07', subject: 'English', name: 'Homophones', face: 'their · there',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E08', subject: 'English', name: 'Spelling rules', face: 'i before e',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E09', subject: 'English', name: 'PEE / PETAL paragraph', face: 'PEE · PETAL',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 48, half: true, inExam: false },
  { id: 'E10', subject: 'English', name: 'What to say about a quotation', face: '“…” quotes',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 46, half: true, inExam: false },
  { id: 'E11', subject: 'English', name: 'AFOREST', face: 'AFOREST',
    lv: ['11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E12', subject: 'English', name: 'Ethos, pathos, logos', face: 'ethos · pathos',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 26, half: true, inExam: false },
  { id: 'E13', subject: 'English', name: 'Connectives by job', face: 'however · so',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E14', subject: 'English', name: 'Sentence openers', face: 'openers',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 32, half: true, inExam: false },
  { id: 'E15', subject: 'English', name: 'Devices worth naming', face: 'simile · etc.',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 56, half: true, inExam: false },
  { id: 'E16', subject: 'English', name: 'Structure methods', face: '↻ structure',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E17', subject: 'English', name: "Instead of 'said', 'good', 'bad'", face: 'said → muttered',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 34, half: true, inExam: false },
  { id: 'E18', subject: 'English', name: 'Letter, article, speech', face: 'Dear… forms',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 42, half: true, inExam: false },
  { id: 'E19', subject: 'English', name: 'Reading question stems', face: '“How does…”',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 36, half: true, inExam: false },
  { id: 'E20', subject: 'English', name: 'Poetry: form and sound', face: 'enjambment',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E21', subject: 'English', name: 'Tiers of vocabulary', face: 'tier 1 2 3 words',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 28, half: true, inExam: false },
  { id: 'E22', subject: 'English', name: 'Proofreading checklist', face: '✓ proofread',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 26, half: true, inExam: false },
];

/* ---------- THE ENGLISH DRAWINGS § */
const MAT_ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAT_HTML_EN = {
  /* PRINT OVER JOINED, LETTER BY LETTER. § */
  E02: () => `<div class="mat-abc">${MAT_ABC.map(l =>
    `<i><b>${l}${l.toLowerCase()}</b><em>${l}${l.toLowerCase()}</em></i>`).join('')}</div>`,
  E03: () => matPairs([['noun', 'dog, London, joy'], ['verb', 'run, is, think'],
                       ['adjective', 'tall, red'], ['adverb', 'quickly, soon'],
                       ['pronoun', 'she, it, they'], ['preposition', 'under, after'],
                       ['conjunction', 'and, because'], ['determiner', 'the, a, some']]),
  E04: () => matPairs([['simple', 'one main clause'],
                       ['compound', 'two main clauses: and, but, or, so'],
                       ['complex', 'main + subordinate: because, although, when, if'],
                       ['minor', 'not a full sentence: “Nice one.”']]),
  E05: () => matPairs([['.', 'ends a sentence'], [',', 'splits a list or a clause'],
                       ['?', 'ends a question'], ['!', 'surprise or force'],
                       ['’', 'a missing letter, or belonging'], ['“ ”', 'the words spoken'],
                       [':', 'brings in a list or a reason'], [';', 'joins two linked sentences'],
                       ['( )', 'extra information'], ['–', 'a pause, or an aside']]),
  /* ITS AND IT'S GET A ROW EACH, because that is the line the sheet's note says catches everybody —
     and it catches them precisely because every other belonging word takes the apostrophe. */
  E06: () => matPairs([['missing letters', 'do not → don’t'], ['one owner', 'the dog’s bone'],
                       ['more than one', 'the dogs’ bones'], ['no s plural', 'the children’s'],
                       ['its', 'belonging: its tail'], ['it’s', 'it is, or it has']]),
  E07: () => matPairs([['their', 'belongs to them'], ['there', 'a place'], ['they’re', 'they are'],
                       ['your', 'belongs to you'], ['you’re', 'you are'],
                       ['to · too · two', 'towards · also · 2'], ['of · off', 'belonging · not on'],
                       ['were · we’re · where', 'was, plural · we are · a place']]),
  E08: () => matPairs([['most plurals', '+ s: cats'], ['s x ch sh', '+ es: boxes'],
                       ['consonant + y', 'y → ies: babies'], ['f, fe', 'often ves: leaves'],
                       ['short vowel', 'double it: hop → hopping'],
                       ['silent e', 'drop it: make → making'],
                       ['i before e', 'except after c: receive'],
                       ['and where it fails', 'weird, seize, science']]),
  /* THE STEMS ARE THE POINT, which is what the note asks for: § */
  E09: () => matPairs([['Point', 'The writer presents…'], ['Evidence', 'This is shown when “…”'],
                       ['Technique', 'The writer uses…'], ['Analysis', 'The word “…” suggests…'],
                       ['Link', 'This links to… / So…'],
                       ['PEE', 'Point, Evidence, Explain = T + A']]),
  E10: () => matPairs([['zoom in', 'The word “…” suggests…'], ['name it', 'a metaphor, a verb…'],
                       ['the effect', 'It makes the reader feel…'],
                       ['link it out', 'This fits the wider idea that…']]),
  E11: () => matPairs([['A', 'alliteration'], ['F', 'facts'], ['O', 'opinions'],
                       ['R', 'rhetorical questions'], ['E', 'emotive language'],
                       ['S', 'statistics'], ['T', 'triples — the rule of three']]),
  /* THE TEST IS A QUESTION TO ASK OF THE TEXT, which is what the note means by a one-line test: the
     names are easy to learn and hard to spot, and each of these is the thing to ask to spot one. */
  E12: () => matPairs([['ethos', 'trust: why believe the speaker?'],
                       ['pathos', 'feeling: does it move you?'],
                       ['logos', 'logic: reasons and evidence?']]),
  E13: () => matPairs([['adding', 'and, also, furthermore'], ['contrasting', 'but, however, whereas'],
                       ['causing', 'because, so, therefore'], ['sequencing', 'first, then, finally'],
                       ['concluding', 'overall, in conclusion']]),
  E14: () => matPairs([['adverb', 'Slowly, …'], ['-ing', 'Running to the door, …'],
                       ['simile', 'Like a ghost, …'], ['preposition', 'Under the bridge, …'],
                       ['subordinate', 'Although it was late, …']]),
  E15: () => matPairs([['simile', 'like or as'], ['metaphor', 'says it IS something else'],
                       ['personification', 'a thing acting human'], ['alliteration', 'same first sound'],
                       ['onomatopoeia', 'sounds like it means: buzz'], ['hyperbole', 'deliberate exaggeration'],
                       ['imagery', 'a picture in words'], ['juxtaposition', 'opposites side by side'],
                       ['pathetic fallacy', 'weather matches mood'], ['semantic field', 'a group of linked words']]),
  E16: () => matPairs([['opening', 'how it hooks you'], ['shift', 'focus moves: out → in, past → now'],
                       ['cyclical', 'ends where it began'], ['foreshadowing', 'a hint of what comes'],
                       ['zoom', 'narrows to a detail, or widens'], ['flashback', 'a jump back in time']]),
  /* THREE SHORT COLUMNS, as the note says — which is the measures block's shape with a third column,
     so it borrows `.mat-meas` rather than starting a fourth kind of list. */
  E17: () => `<div class="mat-meas mat-three">${[
      ['said', ['whispered', 'shouted', 'muttered', 'replied', 'gasped', 'insisted']],
      ['good', ['brilliant', 'kind', 'excellent', 'skilful', 'delightful', 'generous']],
      ['bad', ['awful', 'cruel', 'dreadful', 'harmful', 'rotten', 'terrible']]]
    .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  E18: () => matPairs([['letter', 'Dear… → Yours sincerely (a name), faithfully (Sir, Madam)'],
                       ['article', 'headline, strapline, subheadings'],
                       ['speech', 'greet them, say “you”, end with what to do']]),
  E19: () => matPairs([['list four', 'short facts, from the lines given'],
                       ['how… language', 'words, methods, effect'],
                       ['how… structured', 'start, shifts, ending'],
                       ['to what extent', 'judge it, with quotations'],
                       ['summarise', 'the differences, inferred'],
                       ['compare', 'both texts, views and methods']]),
  E20: () => matPairs([['stanza', 'a verse: a group of lines'], ['metre', 'the beat: iambic is da-DUM'],
                       ['rhyme scheme', 'ABAB, AABB…'], ['enjambment', 'a sentence runs over the line'],
                       ['caesura', 'a pause inside a line'], ['volta', 'the turn in the thought'],
                       ['writing it', 'name it, quote it, say what it does']]),
  E21: () => matPairs([['tier 1', 'everyday: happy, walk — talk'],
                       ['tier 2', 'academic: analyse, significant — any essay'],
                       ['tier 3', 'subject: metaphor, sonnet — naming it']]),
  E22: () => matPairs([['1', 'capitals and full stops'], ['2', 'spellings from the question'],
                       ['3', 'a new paragraph for each new point, time or speaker'],
                       ['4', 'its / it’s, their / there'],
                       ['5', 'read it back: does each sentence make sense?']]),
};
Object.assign(MAT_HTML, MAT_HTML_EN);

/* ---------- WHICH SUBJECT A PIECE IS § */
const matSubjectOf = c => (!c || c.edge) ? '' : String(c.subject || 'Maths');

/* WHAT IS CHOSEN. Maths until somebody says otherwise, because the maths is most of the library and
   what this tool was built as; `all` is "every subject" and mixes them on one sheet. */
let MAT_SUBJECT = 'Maths';

/* THE SUBJECTS THAT HAVE PIECES, and no others — a subject with nothing under it is an option that empties the list, which is a dead control wearing a name. § */
function matSubjectOrder(list) {
  const n = {};
  (list || []).forEach(c => { const s = matSubjectOf(c); if (s) n[s] = (n[s] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b));
}
const matSubjects = parts => matSubjectOrder(parts || matParts());

/* ---------- THE PIECES A GROUP AT A TIME § */
const MAT_GROUPS = [
  ['Number',               ['M02', 'M03', 'M04', 'M05', 'M10', 'M52', 'M28']],
  ['Fractions & %',        ['M11', 'M31', 'M22', 'M12G', 'M12H', 'M23', 'M24']],
  ['Algebra',              ['M25', 'M26', 'M15', 'M37', 'M41', 'M36']],
  ['Graphs & rates',       ['M17', 'M16', 'M42', 'M12F']],
  ['Geometry',             ['M07', 'M08', 'M09', 'M20', 'M30']],
  ['Area & volume',        ['M21', 'M06', 'M12A', 'M12B', 'M12C', 'M12D', 'M12E']],
  ['Trigonometry',         ['M19', 'M13', 'M14', 'M29', 'M38', 'M39', 'M40']],
  ['Data & chance',        ['M18', 'M27', 'M49', 'M45', 'M46', 'M47']],
  ['Calculus',             ['M32', 'M33', 'M34', 'M35', 'M48', 'M43', 'M44']],
  ['Spelling',             ['E02', 'E07', 'E08', 'E21']],
  ['Grammar',              ['E03', 'E04', 'E05', 'E06']],
  ['Writing',              ['E11', 'E12', 'E13', 'E14', 'E17', 'E18', 'E22']],
  ['Reading',              ['E09', 'E10', 'E15', 'E16', 'E19', 'E20']],
  ['Chemistry',            ['M50', 'M51']],
];
const MAT_GROUP_OTHER = 'Other';
const MAT_GROUP_BY = {};
MAT_GROUPS.forEach(([g, ids]) => ids.forEach(id => { MAT_GROUP_BY[id] = g; }));
/* THE RULER IS IN EVERY GROUP, for the reason it is in every subject: it goes down the edge of any
   sheet, so it is offered wherever you are rather than filed under one topic you might never open. */
const matGroupOf = c => (!c || c.edge) ? '' : (MAT_GROUP_BY[c.id] || MAT_GROUP_OTHER);
/* WHICH GROUP IS ON THE SCREEN. Empty until settled, and `matSettle` puts it on the first group the
   subject and level have pieces in — a group that has emptied (Calculus at SATs) is not left showing. */
let MAT_GROUP = '';
const matInGroup = c => { const g = matGroupOf(c); return !g || g === MAT_GROUP; };
/* THE GROUPS THIS SUBJECT AND LEVEL HAVE PIECES IN, in the table's order — asked of `matShown`, so a
   group appears exactly when the paper could carry something from it. */
function matGroupChoices(parts) {
  const has = {};
  (parts || matParts()).forEach(c => { const g = matGroupOf(c); if (g && matShown(c)) has[g] = true; });
  return MAT_GROUPS.map(x => x[0]).concat(MAT_GROUP_OTHER).filter(g => has[g]);
}

/* ---------- AND WHERE IT OPENS FOR A STUDENT § */
function matOwnLevel_(parts) {
  if (typeof USER === 'undefined' || !USER) return null;
  const known = matLevelChoices(parts).map(o => o.v.split('|')[0]);
  const fit = l => known.find(k => norm(k) === norm(l)) || '';
  const own = fit(USER.level || (USER.profile || {}).level || '');
  if (own) return { level: own, subject: '' };
  let jobs = [];
  try { jobs = (DATA.liveJobs || DATA.jobs || []).filter(j => j && norm(j.client) === norm(USER.name)); }
  catch (e) { jobs = []; }
  jobs.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
  const subs = matSubjects(parts);
  for (const j of jobs) {
    const level = fit(j.level);
    if (!level) continue;
    /* "English Language", "(Single) Chemistry" — the bookable names — carry this tool's subject as a
       word inside them, or carry nothing it knows. */
    const subject = subs.find(s => norm(j.subject).indexOf(norm(s)) !== -1) || '';
    return { level, subject };
  }
  return null;
}

/* ---------- ONE LIST OF LEVELS, AND THE TIER INSIDE IT § */
const MAT_TIERED_SUBJECTS = ['Maths'];
const matTierSplits = l => MAT_TIERED.indexOf(l) !== -1
  && (MAT_SUBJECT === 'all' || MAT_TIERED_SUBJECTS.indexOf(MAT_SUBJECT) !== -1);
const matLevelValue = () => MAT_LEVEL === 'all' ? 'all'
  : (matTierSplits(MAT_LEVEL) ? MAT_LEVEL + '|' + MAT_TIER : MAT_LEVEL);

function matLevelChoices(parts) {
  const used = {};
  (parts || matParts()).forEach(c => {
    if (c.edge) return;
    if (MAT_SUBJECT !== 'all' && matSubjectOf(c) !== MAT_SUBJECT) return;
    c.lv.forEach(l => { used[l] = true; });
  });
  const known = matLevels();
  const levels = known.filter(l => used[l])
    .concat(Object.keys(used).filter(l => known.indexOf(l) === -1));
  const out = [{ v: 'all', say: 'Every level' }];
  levels.forEach(l => {
    if (matTierSplits(l)) out.push({ v: l + '|F', say: l + ' Foundation' }, { v: l + '|H', say: l + ' Higher' });
    else out.push({ v: l, say: l });
  });
  return out;
}

/* ---------- WHAT IS ON THE SHEET IS WHAT IS SHOWN, TICKED § */
function matShown(c, ignoreExam) {
  if (!c) return false;
  const s = matSubjectOf(c);
  if (s && MAT_SUBJECT !== 'all' && s !== MAT_SUBJECT) return false;
  /* NO LEVEL MEANS EVERY LEVEL — the ruler's `lv` is empty, and reading that as "belongs to nothing"
     would hide it at every level. */
  if (MAT_LEVEL !== 'all' && c.lv.length && c.lv.indexOf(MAT_LEVEL) === -1) return false;
  if (!matKeep(c.tier)) return false;
  if (!ignoreExam && MAT_EXAM === 'not' && c.inExam === true) return false;
  return true;
}

/* THE CHOICES, PUT RIGHT BEFORE ANYTHING IS DRAWN. § */
function matSettle(parts) {
  const subs = matSubjects(parts);
  if (MAT_SUBJECT !== 'all' && subs.indexOf(MAT_SUBJECT) === -1) MAT_SUBJECT = subs[0] || 'all';
  if (matLevelChoices(parts).map(o => o.v).indexOf(matLevelValue()) === -1) MAT_LEVEL = 'all';
  MAT_SHOW = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL)) ? MAT_TIER : 'H';
  /* THE GROUP LAST, because which groups have pieces is a question about the subject, the level
     and the tier just settled — and it reads `matShown`, which reads `MAT_SHOW`. */
  const groups = matGroupChoices(parts);
  if (groups.indexOf(MAT_GROUP) === -1) MAT_GROUP = groups[0] || '';
}

/* THE OPTIONS ARE WRITTEN ONLY WHEN THEY CHANGE. § */
/* A WeakMap rather than an attribute, so the markup does not carry a copy of itself, and so a select
   `initMat` has just rebuilt starts with nothing remembered and is always written. */
const MAT_OPTS = new WeakMap();
const matOptions_ = (sel, html) => {
  if (MAT_OPTS.get(sel) === html) return;
  sel.innerHTML = html;
  MAT_OPTS.set(sel, html);
};
/* THE TWO SELECTS AND THE ONE BOX, drawn from the same state every time rather than patched by the handler that changed them — a control that says one thing § */
function matChoices(parts) {
  const sub = $('mat-subject'), lev = $('mat-level'), given = $('mat-given');
  const subs = matSubjects(parts);
  if (sub) {
    matOptions_(sub, subs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')
      + '<option value="all">Every subject</option>' + matPaperOptions_());
    sub.value = MAT_SUBJECT;
    /* ONE SUBJECT WAS NO CHOICE and the select was hidden — but the practice paper kinds are in it
       now (`matPaperOptions_`), so there is always a choice and it is always drawn. */
  }
  if (lev) {
    matOptions_(lev, matLevelChoices(parts)
      .map(o => `<option value="${esc(o.v)}">${esc(o.say)}</option>`).join(''));
    lev.value = matLevelValue();
  }
  /* THE GROUP, WITH WHAT IS TICKED IN EACH ON ITS OWN OPTION. § */
  const grp = $('mat-group');
  if (grp) {
    const groups = matGroupChoices(parts);
    const ticked = g => parts.filter(c => !c.edge && matGroupOf(c) === g && matShown(c)
      && MAT_ON.indexOf(c.id) !== -1).length;
    matOptions_(grp, groups.map(g => {
      const n = ticked(g);
      return `<option value="${esc(g)}">${esc(g + (n ? ' · ' + n + '✓' : ''))}</option>`;
    }).join(''));
    grp.value = MAT_GROUP;
    /* ONE GROUP IS NO CHOICE — the subject select's own rule. Science is two pieces in one group. */
    (grp.closest('.mat-sel') || grp).hidden = groups.length < 2;
  }
  /* "GIVEN IN THE EXAM" ONLY WHERE SOMETHING IS. § */
  if (given) {
    given.hidden = !parts.some(c => c.inExam === true && matShown(c, true));
    const box = given.querySelector('input');
    if (box) box.checked = MAT_EXAM === 'not';
  }
}

/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, OR SQUARED § */
const MAT_KINDS = [
  { v: 'cheat', say: 'Cheat sheet' },
  { v: 'hand',  say: 'Handwriting' },
  { v: 'lined', say: 'Lined paper' },
  { v: 'grid',  say: 'Squared paper' },
];
const MAT_KIND_WORD = { cheat: 'Cheat sheet', hand: 'Handwriting worksheet', lined: 'Lined paper',
                        grid: 'Squared paper' };
let MAT_KIND = 'cheat';

/* `for` IS WHICH KIND OF PAPER ASKS THE QUESTION. § */
const MAT_BLANK_OPTS = {
  size:  { for: 'hand',  say: 'Writing size', opts: [['8', 'Large · 8mm'], ['6', 'Medium · 6mm'], ['4', 'Small · 4mm']] },
  gap:   { for: 'hand',  say: 'Practice rows', opts: [['1', '1 practice row'], ['2', '2 practice rows']] },
  line:  { for: 'lined', say: 'Line spacing', opts: [['8', '8mm · standard'], ['6', '6mm · narrow'],
                                                     ['10', '10mm · wide'], ['12', '12mm · early years']] },
  grid:  { for: 'grid',  say: 'Square size', opts: [['5', '5mm squares'], ['7', '7mm squares'], ['10', '1cm squares']] },
};
const MAT_TEXT_MAX = 120;
const MAT_TEXT_FIRST = 'The quick brown fox jumps over the lazy dog.';
const matBlankFresh_ = () => ({ text: MAT_TEXT_FIRST, size: '8', gap: '1', line: '8', grid: '5' });
let MAT_BLANK = matBlankFresh_();

/* THE ONE DOOR EVERY SETTING COMES IN BY — the select, the text box and `matRecall` all call it — so
   the closed list is enforced in one place. Answers whether it took the value. */
function matBlankSet_(k, v) {
  if (k === 'text') {
    /* CONTROL CHARACTERS OUT, runs of space to one: the words are drawn on one line each, and a
       pasted tab or newline would be a gap nobody typed. */
    MAT_BLANK.text = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ').trim().slice(0, MAT_TEXT_MAX);
    return true;
  }
  const o = MAT_BLANK_OPTS[k];
  if (!o || !o.opts.some(p => p[0] === String(v))) return false;
  MAT_BLANK[k] = String(v);
  return true;
}

/* THE CONTROLS, ALL OF THEM, each wrapped with the kind it belongs to. Built once by `initMat`;
   `matBlankPaint_` shows the ones for the kind chosen and sets each value from `MAT_BLANK`. */
function matBlankControls_() {
  const sel = k => {
    const o = MAT_BLANK_OPTS[k];
    return `<label class="mat-sel" data-for="${o.for}"><select data-do="mat-blank" data-k="${k}"
      aria-label="${esc(o.say)}">${o.opts.map(p =>
        `<option value="${esc(p[0])}">${esc(p[1])}</option>`).join('')}</select></label>`;
  };
  /* A TEXT BOX AT 16px, the global rule's size, because anything smaller makes iOS zoom the page on focus. § */
  return `<input type="text" id="mat-text" class="mat-text" data-for="hand" maxlength="${MAT_TEXT_MAX}"
      autocomplete="off" aria-label="Words to trace" placeholder="Words to trace — or leave blank">
    ${Object.keys(MAT_BLANK_OPTS).map(sel).join('')}`;
}

/* ---------- THE RULINGS, AS SVG STROKES § */
const MAT_BLANK_H = 260;
const matN = v => +(+v).toFixed(2);

/* THE FOUR-LINE RULING. § */
function matHandRows_() {
  /* A SKIP BETWEEN RULINGS, a band and a half. § */
  const b = +MAT_BLANK.size, skip = 1.5 * b, pitch = 3 * b + skip;
  const rows = Math.max(1, Math.floor((MAT_BLANK_H - b + skip) / pitch));
  /* THE RULINGS ARE CENTRED IN THE DRAWING, so the white left over above and below is shared rather
     than all left under the last one. */
  const y0 = (MAT_BLANK_H - (rows * pitch - skip)) / 2;
  /* WRAPPED BY ESTIMATE, at 0.55em a character — a lower-case alphabet in these faces averages about 0.5em, and an estimate erring wide only ends a row a word § */
  const fs = b / matXRatio_();
  const per = Math.max(4, Math.floor((MAT_TEXT_W - 6) / (0.55 * fs)));
  const words = [];
  MAT_BLANK.text.split(' ').filter(Boolean).forEach(w => {
    /* A WORD LONGER THAN A ROW is cut at the row, not left to run off it. */
    while (w.length > per) { words.push(w.slice(0, per)); w = w.slice(per); }
    if (w) words.push(w);
  });
  const wrap = n => words.reduce((out, w) => {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + 1 + w.length <= n) out[out.length - 1] = last + ' ' + w;
    else out.push(w);
    return out;
  }, []);
  /* BALANCED, NOT GREEDY. § */
  let lines = wrap(per);
  for (let n = Math.ceil(words.join(' ').length / Math.max(1, lines.length)); n < per; n++) {
    const tryIt = wrap(n);
    if (tryIt.length <= lines.length) { lines = tryIt; break; }
  }
  /* THE TRACE ROWS AND THE PRACTICE ROWS, IN TURN, AND THE WORDS COME ROUND AGAIN until the page is full — a sheet that traced its sentence once and then had § */
  const plan = [];
  const each = 1 + +MAT_BLANK.gap;
  for (let r = 0; r < rows; r++) {
    const k = r % each;
    plan.push(lines.length && k === 0 ? lines[Math.floor(r / each) % lines.length] : '');
  }
  return { b, pitch, plan, fs, y0 };
}

/* ---------- THE x-HEIGHT, MEASURED IN THE FACE THAT WILL PRINT § */
const MAT_TRACE_FONT = '"Comic Sans MS", "Comic Neue", "Andika", "Century Gothic", "Trebuchet MS", sans-serif';
let MAT_XR = 0;
function matXRatio_() {
  if (MAT_XR) return MAT_XR;
  try {
    const i = document.createElement('i');
    i.style.cssText = 'position:absolute;left:-1000px;top:0;visibility:hidden;display:block;'
                    + 'font-size:100px;height:1ex;width:1px;font-family:' + MAT_TRACE_FONT;
    document.body.appendChild(i);
    const h = i.getBoundingClientRect().height;
    i.remove();
    /* A FACE WITH AN x-HEIGHT OUTSIDE A THIRD TO TWO THIRDS OF ITS SIZE is a measurement gone wrong,
       not a face — kept out rather than drawing letters twice the ruling. */
    if (h > 33 && h < 67) MAT_XR = h / 100;
  } catch (e) { /* no layout: the fallback below */ }
  return MAT_XR || .52;
}

function matBlankSvg_() {
  const W = MAT_TEXT_W, H = MAT_BLANK_H;
  const svg = inner => `<svg class="mat-ruling" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"
    style="width:${W}mm;height:${H}mm" aria-hidden="true">${inner}</svg>`;
  const path = (cls, d) => d ? `<path class="${cls}" d="${d}"/>` : '';
  if (MAT_KIND === 'hand') {
    const { b, pitch, plan, fs, y0 } = matHandRows_();
    let top = '', mid = '', base = '', foot = '', words = '';
    plan.forEach((t, r) => {
      const y = y0 + r * pitch;
      top += `M0 ${matN(y)}H${W}`;
      mid += `M0 ${matN(y + b)}H${W}`;
      base += `M0 ${matN(y + 2 * b)}H${W}`;
      foot += `M0 ${matN(y + 3 * b)}H${W}`;
      if (t) words += `<text class="mat-trace" x="3" y="${matN(y + 2 * b)}" font-size="${matN(fs)}"
        font-family='${MAT_TRACE_FONT}'>${esc(t)}</text>`;
    });
    return svg(path('mat-ln', top + foot) + path('mat-ln-mid', mid) + path('mat-ln-base', base) + words);
  }
  if (MAT_KIND === 'lined') {
    /* EXERCISE-BOOK RULING: § */
    const s = +MAT_BLANK.line;
    let d = '';
    for (let y = s; y <= H + 0.01; y += s) d += `M0 ${matN(y)}H${W}`;
    return svg(path('mat-ln', d) + path('mat-ln-margin', `M25 0V${H}`));
  }
  /* SQUARED: WHOLE SQUARES ONLY, centred in the drawing. A part-square down one edge is a square a
     child counts and gets wrong, and a grid hard against the left with 3mm spare on the right reads
     as printed crooked. */
  const s = +MAT_BLANK.grid;
  const nx = Math.floor(W / s), ny = Math.floor(H / s);
  const x0 = (W - nx * s) / 2, y0 = (H - ny * s) / 2;
  let d = '';
  for (let i = 0; i <= nx; i++) d += `M${matN(x0 + i * s)} ${matN(y0)}V${matN(y0 + ny * s)}`;
  for (let j = 0; j <= ny; j++) d += `M${matN(x0)} ${matN(y0 + j * s)}H${matN(x0 + nx * s)}`;
  return svg(path('mat-ln mat-ln-grid', d));
}

/* WHAT THE PAPER SAYS ABOUT ITSELF, for the head, the order and the line under the card. § */
function matBlankSay_() {
  const opt = k => (MAT_BLANK_OPTS[k].opts.find(p => p[0] === MAT_BLANK[k]) || ['', ''])[1];
  if (MAT_KIND === 'hand') return { title: 'Handwriting practice', size: opt('size'),
    parts: [MAT_BLANK.text ? 'Words: ' + MAT_BLANK.text : 'No words — ruling only', opt('size'), opt('gap')] };
  if (MAT_KIND === 'lined') return { title: 'Lined paper · ' + MAT_BLANK.line + 'mm', size: opt('line'), parts: [opt('line')] };
  return { title: 'Squared paper · ' + (MAT_BLANK.grid === '10' ? '1cm' : MAT_BLANK.grid + 'mm'), size: opt('grid'),
    parts: [opt('grid')] };
}

/* THE PAINT FOR PAPER, called by `matPaint` in place of everything after the choices. § */
function matBlankPaint_(list) {
  const pick = $('mat-blank');
  if (pick) {
    pick.querySelectorAll('[data-for]').forEach(el => { el.hidden = el.getAttribute('data-for') !== MAT_KIND; });
    pick.querySelectorAll('select[data-k]').forEach(s => { s.value = MAT_BLANK[s.getAttribute('data-k')]; });
    /* NOT WHILE SOMEBODY IS TYPING IN IT — setting a focused box's value moves the caret to the end. */
    const t = $('mat-text');
    if (t && document.activeElement !== t) t.value = MAT_BLANK.text;
  }
  const B = matBrand();
  const say = matBlankSay_();
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  MAT_SHEET = `<div class="mat-sheet is-blank is-${MAT_KIND}">
    <div class="mat-head"><h3>${esc(say.title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-name"><span>Name</span><i></i><span>Date</span><i></i></div>
    ${matBlankSvg_()}
    <div class="mat-foot"><span>${esc(foot)}</span><b>${esc(B.site)}</b></div></div>`;
  const rows = MAT_KIND === 'hand' ? matHandRows_().plan.length : 0;
  $('mat-said').className = 'mat-said';
  /* A COUNT, NOT THE SETTING AGAIN — the select right above already says "8mm". How many lines or
     squares the page holds is the thing the select cannot say. */
  const sq = +MAT_BLANK.grid;
  $('mat-said').innerHTML = `<b>One A4 page</b> · ${esc(MAT_KIND === 'hand'
    ? rows + ' rulings' + (MAT_BLANK.text ? '' : ', no words to trace')
    : MAT_KIND === 'lined' ? Math.floor(MAT_BLANK_H / +MAT_BLANK.line) + ' lines'
    : Math.floor(MAT_TEXT_W / sq) + ' × ' + Math.floor(MAT_BLANK_H / sq) + ' squares')}`;
  $('mat-go').disabled = false;
  /* THE BASKET LINE: the same `print` line as a cheat sheet, so the laminate switch comes with it and nothing in the basket learns a new kind. § */
  MAT_ORDER = {
    ok: true,
    key: 'paper:' + MAT_KIND + '|' + (MAT_KIND === 'hand' ? MAT_BLANK.size + '|' + MAT_BLANK.gap + '|' + MAT_BLANK.text
      : MAT_KIND === 'lined' ? MAT_BLANK.line : MAT_BLANK.grid),
    name: MAT_KIND_WORD[MAT_KIND] + ' — ' + (MAT_KIND === 'hand'
      ? (MAT_BLANK.text ? '“' + (MAT_BLANK.text.length > 28 ? MAT_BLANK.text.slice(0, 27) + '…' : MAT_BLANK.text) + '”, ' : '')
        + say.size.split(' · ')[0].toLowerCase()
      : say.size.split(' · ')[0]),
    parts: say.parts,
  };
  const trolley = list && list.closest('#mat-box') && list.closest('#mat-box').querySelector('[data-do="mat-cart"]');
  if (trolley) {
    const inCart = typeof CART !== 'undefined' && CART.some(c => c.kind === 'print' && c.key === MAT_ORDER.key);
    tileSet_(trolley, inCart ? { label: 'In your basket', note: '', on: true, off: false }
                             : { label: 'Have it printed', note: 'into your basket', on: false, off: false });
  }
}

/* THE PAPER KINDS AS OPTIONS OF THE SUBJECT SELECT — see the note in `initMat`. Prefixed, so no
   subject the sheet could ever name is mistaken for one. */
const MAT_PAPER_AT = 'paper:';
const matPaperOptions_ = () => '<optgroup label="Practice paper">' + MAT_KINDS.filter(k => k.v !== 'cheat')
  .map(k => `<option value="${MAT_PAPER_AT}${k.v}">${esc(k.say)}</option>`).join('') + '</optgroup>';
on('mat-blank', el => {
  MAT_TOUCHED = true;
  matBlankSet_(el.getAttribute('data-k'), el.value);
  matPaint();
  matRemember();
});
/* TYPED INTO, SO NOT THROUGH THE CLICK OR CHANGE DISPATCHER — the search box's own pattern in find.js.
   Debounced: the sheet is rebuilt on each paint, and a rebuild per keystroke is a box that lags. */
let matTextTimer = null;
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'mat-text') return;
  MAT_TOUCHED = true;
  matBlankSet_('text', e.target.value);
  clearTimeout(matTextTimer);
  matTextTimer = setTimeout(() => { keepDue_('mat', null); matPaint(); matRemember(); }, 200);
  /* KEPT AS THE PAGE GOES even inside the 0.2 s (`keepDue_`, data.js; docs/history/317). */
  keepDue_('mat', () => { clearTimeout(matTextTimer); matRemember(); });
});

/* ---------- WHERE YOU LEFT IT § */
const MAT_KEEP_AT = 'matChoice';
function matRemember() {
  try {
    localStorage.setItem(MAT_KEEP_AT, JSON.stringify({
      s: MAT_SUBJECT, l: MAT_LEVEL, t: MAT_TIER, x: MAT_EXAM, g: MAT_GROUP, on: MAT_ON,
      k: MAT_KIND, p: MAT_BLANK }));
  } catch (e) { /* a phone that will not store it simply opens fresh next time */ }
}
function matRecall() {
  try {
    const v = JSON.parse(localStorage.getItem(MAT_KEEP_AT) || 'null');
    if (!v || typeof v !== 'object') return false;
    if (typeof v.s === 'string') MAT_SUBJECT = v.s;
    if (typeof v.l === 'string') MAT_LEVEL = v.l;
    if (v.t === 'F' || v.t === 'H') MAT_TIER = v.t;
    MAT_EXAM = v.x === 'not' ? 'not' : 'all';
    /* A GROUP FROM BEFORE GROUPS EXISTED IS NO GROUP, and `matSettle` picks the first. */
    if (typeof v.g === 'string') MAT_GROUP = v.g;
    if (Array.isArray(v.on)) MAT_ON = v.on.map(String);
    /* A KIND THIS VERSION DOES NOT KNOW IS THE CHEAT SHEET, and the paper's settings are each put back through `matBlankSet_`, which refuses a value it does not § */
    MAT_KIND = MAT_KINDS.some(k => k.v === v.k) ? v.k : 'cheat';
    if (v.p && typeof v.p === 'object') Object.keys(v.p).forEach(k => matBlankSet_(k, v.p[k]));
    return true;
  } catch (e) { return false; }
}

/* ---------- THERE IS NO FILL AND NO CLEAR § */

/* ---------- THE PICKER AND THE SHEET § */
function initMat() {
  const box = $('mat-box');
  if (!box) return;
  /* SET EACH TIME THE TOOL OPENS, not once at load: § */
  if (!MAT_TOUCHED) {
    if (matRecall()) MAT_TOUCHED = true;
    else {
      MAT_ON = matStart();
      /* A STUDENT'S OWN LEVEL, when their sessions say it — see `matOwnLevel_`. Not marked as a
         choice: nobody chose it, so a later visit with a new booking may answer differently. */
      const own = matOwnLevel_(matParts());
      if (own) { MAT_LEVEL = own.level; if (own.subject) MAT_SUBJECT = own.subject; }
    }
  }
  box.innerHTML = `
    <div class="mat-pick">
      ${/* SELECTS, IN THE ORDER THE QUESTION IS ASKED: § */
            ''}
      <label class="mat-sel"><select id="mat-subject" data-do="mat-subject"
        aria-label="Subject"></select></label>
      <label class="mat-sel" data-cheat><select id="mat-level" data-do="mat-level"
        aria-label="Level"></select></label>
      ${/* THE THIRD QUESTION, WHICH TOPIC — see `MAT_GROUPS`. It is what keeps the list under the
            fold of a 320x568 phone, and it says on each option how much of the sheet is in it. */''}
      <label class="mat-sel" data-cheat><select id="mat-group" data-do="mat-group"
        aria-label="Topic"></select></label>
    </div>
    ${/* ---------- PRACTICE PAPER IS ASKED FOR IN THE SUBJECT SELECT, NOT A SELECT OF ITS OWN § */
          ''}
    <div id="mat-blank" class="mat-blank-pick" hidden>${matBlankControls_()}</div>
    <div id="mat-cheat">
    <label class="check mat-given" id="mat-given" hidden><input type="checkbox" data-do="mat-exam">
      <span class="box"></span><span>Skip what the exam gives you</span></label>
    ${/* ---------- THE LIST IS THE WHOLE LIST, AND THE PANE DECIDES WHAT FITS § */
          ''}
    <div class="mat-list" id="mat-list"></div>
    <div class="mat-gauge" id="mat-gauge"><i></i></div>
    </div>
    <p class="mat-said" id="mat-said"></p>
    ${/* ---------- PRINT IT YOURSELF, OR HAVE IT PRINTED § */
          ''}
    <div class="mat-do">
      ${tile_({ form: true, act: 'mat-print', id: 'mat-go', label: 'Print the sheet' })}
      ${tile_({ icon: 'cart', label: 'Have it printed', note: 'into your basket', act: 'mat-cart' })}
    </div>`;

  /* ONE LIBRARY, SO NO HEADINGS. § */
  $('mat-list').innerHTML = matParts().map(c => {
    /* GIVEN IN THE EXAM IS SAID ON THE ROW, IN WORDS, and only on the few it is true of. § */
    const notes = [c.note, c.inExam === true ? 'given in the exam' : '']
      .filter(Boolean).map(n => `<em class="mat-note">${esc(n)}</em>`).join('');
    return `<label title="${esc(c.name)}" aria-label="${esc(c.name)}" data-id="${esc(c.id)}"${
      c.inExam === true ? ' class="given"' : ''}><input
       type="checkbox" data-do="mat-tick"
       data-id="${esc(c.id)}"${MAT_ON.indexOf(c.id) !== -1 ? ' checked' : ''}>
     <span class="mat-txt"><b class="mat-face">${esc(c.face || c.name)}</b>${
       /* A NOTE BELONGS TO THE COMPONENT, NOT TO THE TOOL. § */
       notes}</span></label>`;
  }).join('');
  matPaint();
}

/* SWITCHING SUBJECT OR LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. § */
on('mat-subject', el => {
  MAT_TOUCHED = true;
  /* A PAPER KIND IS NOT A SUBJECT, and choosing one leaves the subject where it was — so coming back
     from lined paper finds the cheat sheet as it was left. */
  const v = String(el.value || 'all');
  if (v.indexOf(MAT_PAPER_AT) === 0) {
    const k = v.slice(MAT_PAPER_AT.length);
    MAT_KIND = MAT_KINDS.some(x => x.v === k && k !== 'cheat') ? k : 'cheat';
    matPaint(); matRemember(); return;
  }
  MAT_KIND = 'cheat';
  MAT_SUBJECT = v;
  matPaint();
  matRemember();
});
on('mat-level', el => {
  MAT_TOUCHED = true;
  const [l, t] = String(el.value || 'all').split('|');
  MAT_LEVEL = l || 'all';
  if (t === 'F' || t === 'H') MAT_TIER = t;
  matPaint();
  matRemember();
});
/* A GROUP CHANGES WHAT IS LISTED AND NOTHING ELSE — the paper is every tick at this subject and
   level, whichever group is showing, so the gauge does not move when this does. */
on('mat-group', el => {
  MAT_TOUCHED = true;
  MAT_GROUP = String(el.value || '');
  matPaint();
  matRemember();
});
on('mat-exam', el => {
  MAT_TOUCHED = true;
  MAT_EXAM = el.checked ? 'not' : 'all';
  matPaint();
  matRemember();
});
on('mat-tick', el => {
  MAT_TOUCHED = true;
  const id = el.getAttribute('data-id');
  const at = MAT_ON.indexOf(id);
  if (el.checked && at === -1) MAT_ON.push(id);
  if (!el.checked && at !== -1) MAT_ON.splice(at, 1);
  matPaint();
  matRemember();
});

/* WHAT DRAWS A PIECE. One lookup: § */
function matDraw(c) {
  return MAT_HTML[c.id] ? MAT_HTML[c.id]()
    : `<p class="mat-gone">${esc(c.name)} has nothing to draw it.</p>`;
}

function matPaint() {
  const list = $('mat-list');
  /* THE PICKER IS WHAT MUST BE THERE — there is no sheet on the card to look for any more. */
  if (!list || !$('mat-said')) return;
  /* ONE READ OF THE PARTS FOR THE WHOLE PAINT — the choices, the list and the sheet are all asked
     about the same list, so they cannot be answering about two. */
  const parts = matParts();

  /* THE CHOICES FIRST, BECAUSE EVERYTHING BELOW READS THEM. § */
  matSettle(parts);
  matChoices(parts);

  /* ---------- PRACTICE PAPER TAKES THE PAINT FROM HERE § */
  const sub = $('mat-subject');
  if (sub && MAT_KIND !== 'cheat') sub.value = MAT_PAPER_AT + MAT_KIND;
  const box_ = list.closest('#mat-box');
  if (box_) box_.querySelectorAll('.mat-pick [data-cheat]').forEach(el => {
    /* THE TOPIC'S OWN "one group is no choice" WAS DECIDED BY `matChoices` above; only hide here. */
    if (MAT_KIND !== 'cheat') el.hidden = true;
    else if (el.querySelector('#mat-level')) el.hidden = false;
  });
  const cheatBox = $('mat-cheat'), blankBox = $('mat-blank');
  if (cheatBox) cheatBox.hidden = MAT_KIND !== 'cheat';
  if (blankBox) blankBox.hidden = MAT_KIND === 'cheat';
  if (MAT_KIND !== 'cheat') { matBlankPaint_(list); return; }

  /* THE LIST AND THE PAPER ASK ONE QUESTION — `matShown` — and the tick on each row is drawn from `MAT_ON` rather than left to the box, so a remembered sheet § */
  const byId = {};
  parts.forEach(c => { byId[c.id] = c; });
  let listed = 0;
  if (list) list.querySelectorAll('label').forEach(el => {
    const id = el.getAttribute('data-id');
    const show = matShown(byId[id]);
    /* LISTED IS SHOWN AND IN THE GROUP; PRINTED IS SHOWN. § */
    el.classList.toggle('off', !(show && matInGroup(byId[id])));
    const tick = el.querySelector('input');
    if (tick) tick.checked = MAT_ON.indexOf(id) !== -1;
    /* PIECES, NOT THE RULER. § */
    if (show && byId[id] && !byId[id].edge) listed++;
  });

  const on_ = parts.filter(c => MAT_ON.indexOf(c.id) !== -1 && matShown(c));

  /* AN EDGE PIECE IS NOT IN THE COLUMN. The ruler lives in the margin, so it must not be laid out
     with the others or it would take a row of its own and push everything down a sheet. */
  const pieces = on_.filter(c => !c.edge);

  /* ONE FUNCTION, CALLED ONCE PER BLOCK. The first version had a ternary that invoked `MAT_HTML`
     twice for the same component — drawing a protractor's 181 ticks and throwing one copy away. */
  /* A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE. § */
  /* ---------- ONE GRID, AND EVERY BLOCK TAKES ITS OWN SLOT IN IT § */
  let cellN = 0;
  /* `is-wide` / `is-narrow` BECAUSE A LABEL/VALUE BLOCK LAYS ITSELF OUT DIFFERENTLY at a third of
     the page (two columns) and across the whole of it (four) — the stylesheet reads the class
     rather than working the width out again. */
  const cell = c => `<div class="mat-box${c.bare ? ' bare' : ''}${
    matSpan(c) === MAT_TRACKS ? ' is-wide' : ' is-narrow'}" data-i="${cellN++}" data-id="${
    esc(c.id)}" style="grid-column:span ${matSpan(c)};grid-row:span ${Math.round(c.h / MAT_ROW)}">${
    c.bare ? '' : `<h4>${esc(c.name)}</h4>`}${matDraw(c)}</div>`;
  const h = pieces.map(cell).join('');

  /* THE SUBJECT AND THE LEVEL ARE ON THE PAPER. § */
  const B = matBrand();
  const tierWord = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL))
    ? (MAT_TIER === 'F' ? ' Foundation' : ' Higher') : '';
  const title = (MAT_SUBJECT === 'all' ? 'Cheat sheet' : MAT_SUBJECT + ' cheat sheet')
    + (MAT_LEVEL === 'all' ? '' : ' — ' + MAT_LEVEL + tierWord);
  /* PHONE ONLY IF THE TAB HAS ONE — a separator with nothing after it reads as something missing
     rather than something not offered. */
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  /* THE MARGIN BELONGS TO THE RULER, so it goes when the ruler does. Left reserved, an untick
     would take the scale away and leave a 20mm strip of nothing down the page — which reads as a
     printing fault rather than as a choice. */
  const ruled = MAT_ON.indexOf('M01') !== -1;
  /* THE GRID'S THREE NUMBERS ARE HANDED TO THE STYLESHEET FROM HERE, so the tracks the paper is laid out on and the widths the picker prices from are the same § */
  const grid = `--mat-tracks:${MAT_TRACKS};--mat-gut:${MAT_GUT}mm;--mat-row:${MAT_ROW}mm;`
             + `width:${MAT_TEXT_W}mm`;
  const probe = matProbe(`<div class="mat-sheet${ruled ? ' ruled' : ''}">${
    ruled ? `<div class="mat-rule">${matRuler(285)}</div>` : ''}
    <div class="mat-head"><h3>${esc(title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-cols" style="${grid}">${h}</div>
    <div class="mat-foot"><span>${esc(foot)}</span>
      <b>${esc(B.site)}</b></div></div>`);

  /* ---------- A SLOT IS NEVER ALLOWED TO CUT A FORMULA OFF § */
  const px = matPx();
  const cols = probe.querySelector('.mat-cols');
  if (cols) cols.querySelectorAll('.mat-box').forEach(b => {
    if (b.scrollHeight <= b.clientHeight + 1) return;
    const rows = Math.ceil(b.scrollHeight / px / MAT_ROW);
    b.style.gridRow = 'span ' + rows;
    if (typeof console !== 'undefined') {
      console.warn('[mat] ' + b.getAttribute('data-id') + ' needs ' + rows * MAT_ROW
                 + 'mm and its slot is smaller — update MAT_SLOT');
    }
  });
  /* THE TOP ROW TAKES NO HAIRLINE. § */
  if (cols) {
    const top = cols.getBoundingClientRect().top;
    cols.querySelectorAll('.mat-box').forEach(b =>
      b.classList.toggle('is-top', b.getBoundingClientRect().top - top < 1));
  }

  /* MEASURED, NOT ADDED UP. The slots are fixed, but which of them the grid packs side by side is
     not something a table of numbers can know. Reading the rendered column is the figure that is
     always right. */
  /* ---------- THE PAGE IS AN AREA, NOT A HEIGHT § */
  const PAGE_H = MAT_ROOM;                       /* usable height, inside the margins */
  const ruleW = ruled ? 20 : 0;
  /* THE WIDTH IS MEASURED TOO. § */
  const box = cols ? cols.getBoundingClientRect() : null;
  const colW = box ? box.width / matPx() : 0;
  const colH = box ? box.height / matPx() : 0;
  const room = Math.round(ruleW * PAGE_H + colW * PAGE_H);
  const used = Math.round(ruleW * PAGE_H + colW * colH);
  const over = used > room;

  /* IN CENTIMETRES SQUARED, and the percentage first. 41,382mm2 is a number nobody can picture;
     414cm2 is a postcard, and "38% used" is what actually gets read. */
  const pct = Math.min(100, Math.round(used / room * 100));
  const left = Math.max(0, Math.round((room - used) / 100));
  $('mat-gauge').classList.toggle('over', over);
  $('mat-gauge').firstElementChild.style.setProperty('--f', (pct / 100).toFixed(3));
  $('mat-said').className = 'mat-said' + (over ? ' over' : '');
  /* A PERCENTAGE OF ONE PAGE AND A COUNT, which are the two things somebody holding a phone can picture. § */
  const n = pieces.length;
  $('mat-said').innerHTML = over
    /* NOT "OR THE BOTTOM IS CUT OFF", which it said — and could not happen, because Print is disabled while the gauge is over (below). § */
    ? `<b>${Math.round(used / room * 100)}% of one page</b> — untick something`
    : `<b>${pct}% of the page</b> · ${
        n ? `${n} piece${n === 1 ? '' : 's'}${left ? '' : ' · full'}`
        : !listed ? (MAT_EXAM === 'not' && parts.some(c => !c.edge && matShown(c, true))
            ? 'all given in the exam' : 'nothing here for this level yet')
        : 'tick pieces'}`;
  $('mat-go').disabled = over || !n;
  /* ---------- AND WHAT THE BASKET WOULD BE GIVEN § */
  const say = [MAT_SUBJECT === 'all' ? 'every subject' : MAT_SUBJECT,
               MAT_LEVEL === 'all' ? 'every level' : MAT_LEVEL + tierWord].join(' · ');
  MAT_ORDER = {
    ok: !over && n > 0,
    key: 'mat:' + MAT_SUBJECT + '|' + matLevelValue() + '|' + on_.map(c => c.id).sort().join(','),
    name: 'Cheat sheet — ' + say + ' (' + n + ' piece' + (n === 1 ? '' : 's') + ')',
    parts: on_.map(c => c.name),
  };
  /* THE TROLLEY FILLS WHEN THIS EXACT SHEET IS IN THE BASKET, and empties the moment a tick makes it
     a different sheet — the bundle's trolley rule (`cartPaint_`), for one line rather than several. */
  const trolley = list.closest('#mat-box') && list.closest('#mat-box').querySelector('[data-do="mat-cart"]');
  if (trolley) {
    const inCart = typeof CART !== 'undefined' && CART.some(c => c.kind === 'print' && c.key === MAT_ORDER.key);
    tileSet_(trolley, inCart ? { label: 'In your basket', note: '', on: true, off: false }
                             : { label: 'Have it printed', note: 'into your basket', on: false,
                                 off: !MAT_ORDER.ok });
  }
  /* WHAT GOES TO THE PRINTER is the sheet exactly as it was measured — slots grown, top row marked —
     kept as markup so `mat-print` prints the page the gauge was talking about rather than a second
     rendering of it. */
  MAT_SHEET = probe.innerHTML;
  probe.remove();
}

/* THE SHEET AS A BASKET LINE — see the note where `matPaint` fills it. Empty until the first paint. */
let MAT_ORDER = { ok: false, key: '', name: '', parts: [] };

/* ---------- INTO THE BASKET, AS A PRINTED PAGE § */
on('mat-cart', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  const o = MAT_ORDER;
  if (!o.ok) { toast('Tick some pieces that fit on one page first'); return; }
  if (CART.some(c => c.kind === 'print' && c.key === o.key)) { toast('Already in your basket'); return; }
  CART.push({ key: o.key, kind: 'print', name: o.name, pages: 1, cost: 0, parts: o.parts.slice() });
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: 'In your basket', note: '', on: true });
  /* THE UPGRADE IS NAMED ONLY WHEN IT IS OFFERED — a rate of 0 in the Ledger means no laminating. */
  toast((MAT_KIND_WORD[MAT_KIND] || 'Cheat sheet') + ' in your basket' + (typeof laminateOffered_ === 'function' && laminateOffered_()
    ? ' — laminate it there' : ''));
});

/* ---------- THERE IS NO PREVIEW § */
let MAT_SHEET = '';
function matProbe(html) {
  const p = document.createElement('div');
  p.className = 'mat-probe';
  p.style.cssText = 'position:absolute;left:-10000px;top:0;width:210mm;visibility:hidden;'
                  + 'pointer-events:none';
  p.setAttribute('aria-hidden', 'true');
  p.innerHTML = html;
  document.body.appendChild(p);
  return p;
}

/* HOW MANY PIXELS A MILLIMETRE IS, measured rather than assumed — 3.7795 is what a browser SHOULD make of one, and under a page zoom it is not. § */
function matPx() {
  const p = document.createElement('div');
  p.style.cssText = 'width:100mm;position:absolute;visibility:hidden';
  document.body.appendChild(p);
  const k = p.getBoundingClientRect().width / 100;
  p.remove();
  return k || 3.7795;
}
/* PRINTING FROM INSIDE THE APP. § */
on('mat-print', () => {
  if (!MAT_SHEET) return;
  /* BUILT AT THE END OF THE BODY, from the sheet the gauge measured. § */
  const paper = document.createElement('div');
  paper.className = 'mat-paper';
  paper.innerHTML = MAT_SHEET;
  document.body.appendChild(paper);
  document.body.classList.add('printing-mat');
  const done = () => {
    document.body.classList.remove('printing-mat');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER, because some browsers never fire `afterprint` on a cancelled dialogue, and the app
     would be left with everything hidden: a blank screen that looks exactly like a crash. */
  setTimeout(done, 4000);
  /* `window.print()`, NOT `print()`. Bare it works — it is a global — and it reads as a function
     this file forgot to declare, which is exactly what `check.js` said. */
  window.print();
});

;
/* ==== js/inbox.js ==== */
/* @family. — inbox.js — THE EMAIL WIDGET (493): the owner's Gmail, read-only, admin only, a static overview (547). backend/inbox.gs; docs/history/493, 547. */

/* ONE STATE, the list as last asked. Never stored: an inbox is not kept on a phone or in a sheet. */
const INBOX_ = { rows: [], said: '', busy: false };
/* THE LAST FOUR, STATIC (owner, 29 Oct and 1 Nov): "just static overview" -- sender, subject, time, snippet; nothing opens, no search, chips or More (547). */
const INBOX_SHOWN = 4;

function inboxWhen_(ms) {
  if (!ms) return '';
  const d = new Date(ms), now = new Date();
  return d.toDateString() === now.toDateString() ? time_(d) : date_(d);
}
function inboxRowHtml_(r) {
  return `<div class="ib-row${r.unread ? ' is-unread' : ''}">
    <span class="ib-dot" aria-label="${r.unread ? 'Unread' : ''}"></span>
    <span class="ib-from">${esc(r.from || '(no sender)')}${r.count > 1 ? ` <small>${r.count}</small>` : ''}</span>
    <span class="ib-at">${esc(inboxWhen_(r.at))}</span>
    <span class="ib-subj">${esc(r.subject || '(no subject)')}</span>
    <span class="ib-snip">${esc(r.snippet)}</span>
  </div>`;
}

function inboxHtml_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  const list = INBOX_.rows.length ? INBOX_.rows.slice(0, INBOX_SHOWN).map(inboxRowHtml_).join('')
    : (INBOX_.busy || INBOX_.said ? '' : empty_());
  return `<div class="ib-list"${INBOX_.busy ? ' aria-busy="true"' : ''}>${list}${INBOX_.busy ? loading_() : ''}</div>`;
}

/* THE CARD ON SITE (500): the owner asked for it there, beside the weekly email, not in Tools. Drawn with what is already known; initInbox asks. */
function inboxCard_() {
  /* THE CARD ASKS FOR ITSELF WHEN DRAWN, wherever it is drawn (Find › Settings, not only its old column). */
  if (!INBOX_.rows.length && !INBOX_.busy) setTimeout(() => { try { initInbox(); } catch (e) {} }, 0);
  return card_(`<div class="biz inbox-card">
    <h3>Email</h3>
    <div class="ib-box" id="ib-box">${inboxHtml_()}</div>
  </div>`);
}

function inboxPaint_() {
  document.querySelectorAll('.ib-box').forEach(b => { b.innerHTML = inboxHtml_(); });
}

/* ---------- ASKING: the inbox's newest threads, the first four kept. Read-only: nothing here writes to Gmail. */
function inboxFetch_() {
  if (!can_(myRole_(), 'action', 'inboxList') || INBOX_.busy) return;
  const f = (typeof DATA !== 'undefined' && DATA && DATA.features) || [];
  if (f.length && f.indexOf('inboxList') < 0) {
    INBOX_.said = 'The live backend has no Email yet. In Apps Script: sync, run authoriseGmail and Allow (tick every box), THEN Deploy → New version.';
    inboxPaint_(); return;
  }
  INBOX_.busy = true;
  INBOX_.rows = [];
  INBOX_.said = '';
  inboxPaint_();
  send_({ action: 'inboxList', q: 'in:inbox', page: '', name: USER.name, personId: USER.personId }, {})
    .then(d => {
      INBOX_.busy = false;
      if (!d || d.error) { INBOX_.said = (d && d.error) || 'Gmail did not answer.'; }
      else {
        INBOX_.rows = (d.rows || []).slice(0, INBOX_SHOWN);
        if (!INBOX_.rows.length) INBOX_.said = 'Nothing in the inbox.';
      }
      inboxPaint_();
    })
    .catch(err => { INBOX_.busy = false; INBOX_.said = why_(err); inboxPaint_(); });
}

function initInbox() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return;
  inboxPaint_();
  if (!INBOX_.rows.length && !INBOX_.busy) inboxFetch_();
}

;
