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

const bizCap_ = (item, st) => `${esc(item.title)} <span class="qtags biz-when">${qtag_(`${esc(item.due.toLowerCase())}`)}</span>${
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
  const tiles = n => (id && typeof splitRow_ === 'function' ? splitRow_(id, n) : '');
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
      <p class="biz-cap"><b>${esc(p.author || p.handle || '')}</b> <span class="qtags biz-when">${qtag_(`${esc(p.when || '')}`)}</span></p>
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
      <p class="biz-cap"><b>${esc(a.name || a.handle)}</b> <span class="qtags biz-when">${qtag_(`${esc(APP_STATUS_SAID[a.status] || a.status)} · ${esc(when(a.at))}`)}</span></p>
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
      <p class="biz-cap"><b>${esc(r.message)}</b> <span class="qtags biz-when">${qtag_(`${esc(r.count + '× · last ' + when(r.last))}`)}</span></p>
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
on('errs-refresh', () => { ERRS.list = null; ERRS.error = ''; errsDraw_(); document.querySelectorAll('[data-errs] .err-body').forEach(waiting_); errsStart_(); });

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
      <p class="biz-cap"><b>${esc(r.label || r.itemId)}</b> <span class="qtags biz-when">${qtag_(`${esc(r.kind)}`)}</span></p>
      ${r.note ? `<p class="rep-note-said">“${esc(r.note)}”</p>` : ''}
      <div class="tile-row">${REP_FINDS_.indexOf(r.kind) !== -1 ? tile_({ icon: 'open', label: 'Open', note: 'the card', act: 'rep-open', data: { k: r.itemId } }) : ''}${
        st(r, 'confirm', 'tick', 'Confirm', 'to Notes for Claude') + st(r, 'dismiss', 'close', 'Dismiss')}</div>
    </div>`;
  const more = REPS.open > Math.min(list.length, REPS_DRAWN) ? REPS.open - Math.min(list.length, REPS_DRAWN) : 0;
  const msgs = REPS.msgs || [];
  const mItem = r => `<div class="biz-item rep-item rep-msg" data-id="${esc(r.id)}">
      <p class="biz-cap"><b>Message from ${esc(r.from || 'someone')} to ${esc(r.to || 'someone')}</b> <span class="qtags biz-when">${qtag_(`${esc(when(r.at))}`)}</span></p>
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
  const tiles = n => (id && typeof splitRow_ === 'function' ? splitRow_(id, n) : '');
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
    <div class="qtags">${qtag_(`A sample card`)}${qtag_(`A tag`)}</div>
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
  /* THE TICK ON THE LEFT, THE THING IN WORDS BESIDE IT — one line, as a checklist reads (`.row.kid-item` lays out a tile and its caption). */
  /* ONE CHILD LINE A THING (10 Nov): its words, its status as a tag coloured by urgency (gold soon, red overdue), its tile in the row. */
  const glow = s.expired ? ' is-over' : s.soon ? ' is-soon' : '';
  const line = `<p class="kc-line bc-line">${esc(item.title)} <span class="qtags">${qtag_(`${esc(bcTag_(s))}`, '', `bc-tag${glow}`)}</span></p>
    <div class="tile-row">${tile_({ icon: s.sorted ? 'tick' : s.expired || (s.auto && s.auto.ok === false) ? 'flag' : 'plus', label: item.title,
    note: bcStatus_(s), tone: s.sorted ? 'buy' : '', on: BC.open === item.id, act: 'bc-open', data: { id: item.id } })}</div>`;
  if (BC.open !== item.id) return `<div class="kc-item bc-item" data-bc="${esc(item.id)}">${line}</div>`;
  const t = s.tick || {}, cyc = s.cyc && !s.cyc.continuous;
  return `<div class="kc-item bc-item is-open" data-bc="${esc(item.id)}">${line}
    ${s.cyc ? `<p class="bc-cycle">${qtag_(`${esc(bcCycleSay_(item))}`)}${s.due ? ` ${qtag_(`expires ${esc(bcSaid_(s.due))}`)}` : ''}${
      t.result ? ` ${qtag_(`${esc(t.result)}`)}` : ''}${t.doc_link ? ` <a href="${esc(t.doc_link)}" data-do="file-view">Document</a>` : ''}</p>` : ''}
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
  return `<div class="qtags">${qtag_(`Business`)}${qtag_(`Admin only`)}${qtag_(`Guidance, not advice`)}</div>
    <h3>Business checker</h3>
    ${bizNeed_('bizcheck', BC.list ? renew : 0, renew + (renew === 1 ? ' thing to renew' : ' things to renew') + (over ? ' · ' + over + ' overdue' : ''), BC.list ? over : 0)}
    <div class="kc-items biz-body bc-body"${wait ? ' aria-busy="true"' : ''}>
      ${BC.list ? `<p class="bc-count"><b>${done} of ${counted.length} sorted</b></p>${money}
      ${next.length ? next.map(i => bcItem_(i, st[i.id])).join('') : '<p>Everything that applies is sorted.</p>'}
      ${groups.map(g => { const gi = all.filter(i => i.group === g && next.indexOf(i) === -1);
        return gi.length ? `<h4 class="bc-group">${esc(g)} ${qtag_(`${gi.filter(i => st[i.id].sorted).length}/${gi.filter(i => !st[i.id].info).length}`)}</h4>${gi.map(i => bcItem_(i, st[i.id])).join('')}` : ''; }).join('')}
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
    <p class="oq-q">${q.philosophy ? qtag_('Philosophy') + ' ' : ''}${esc(q.question)}</p>
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
  const head = '<div class="qtags">' + qtag_('Business') + qtag_('Admin only') + '</div><h3>Optimiser</h3>';
  if (!s) return head + (HEALTH && HEALTH.failed ? '<p class="me-said">The score could not be read. Run node tools/health.js and push.</p>' : (typeof loading_ === 'function' ? loading_() : '')) + oqInbox_();
  const A = checksAreas_(s);
  return `${head}<p class="stab-score">Optimiser: ${esc(String(checksTotal_(s, A)))}%</p>
    ${CHECK_AREAS.filter(([k]) => A[k]).map(([k, n]) => `<h4>${esc(n)} ${esc(String(A[k].score))}%${(s.weights || {})[k] ? '' : ' ' + qtag_('inside the others')}</h4>
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

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. § */
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
  /* INDEX LAWS AND GRAPH SHAPES START AT Y9. § */
  { id: 'M15', name: 'Index laws', face: 'aᵐaⁿ index',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 24,  half: true, inExam: false },
  { id: 'M16', name: 'Graph shapes', face: 'y=x² graphs',       lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 40,  half: false, inExam: false },
  /* AS BUT NOT ALEVEL was the clearest error in the table: § */
  { id: 'M17', name: 'Straight line', face: 'y = mx + c',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 29,  half: true, inExam: false },
  { id: 'M18', name: 'Averages', face: 'x̄ averages',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 24,  half: true, inExam: false },
  /* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file. § */
  { id: 'M19', name: 'Pythagoras & trig', face: 'a²+b²=c²',  lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true, inExam: true },
  { id: 'M20', name: 'Angle rules', face: '180° rules',        lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 35,  half: true, inExam: false },
  { id: 'M21', name: 'Area & perimeter', face: '½bh area',   lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  /* SATs. Percentages of an amount is Y6, and fractions, rounding, area and averages all carry SATs on the rows around this one — four neighbours teaching the same § */
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
      /* THE SHEET CAN ADD A TIER AND IT CAN TAKE ONE AWAY. § */
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

  /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a column of blank `sort_order` cells leaves the sheet exactly as it prints § */
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

  /* REVERSE PERCENTAGE IS THE HIGHER LINE. § */
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
                 /* NO CLAMP. Returning 9 near zero was a way of forcing a skip under the old single-line drawing; now the skip is real, `1/x` can be handed over as itself and the § */
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
  /* SQUARED: WHOLE SQUARES ONLY, centred in the drawing. § */
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
  /* `is-wide` / `is-narrow` BECAUSE A LABEL/VALUE BLOCK LAYS ITSELF OUT DIFFERENTLY at a third of the page (two columns) and across the whole of it (four) — the § */
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
  /* THE MARGIN BELONGS TO THE RULER, so it goes when the ruler does. § */
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
  /* WHAT GOES TO THE PRINTER is the sheet exactly as it was measured — slots grown, top row marked — kept as markup so `mat-print` prints the page the gauge was § */
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
  return `<div class="row ib-item${r.unread ? ' is-unread' : ''}">
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
/* ==== js/tools.js ==== */
/* @family. — tools.js THE TIMER, THE CALENDAR, THE TIMETABLE AND TOUCH TYPING: Find's Tools cards (owner, 12 Nov), back from games.js (docs/history/1110). */

/* ---------- THE TIMER § */

/* ONE interval, ever. A second one started without clearing the first makes the clock run at
   double speed, which is the classic way a timer loses two seconds a second. */
function timerTick() {
  clearInterval(timerState.tick);
  timerState.tick = setInterval(() => {
    if (!timerState.running) return;
    timerState.left--;
    if (timerState.left <= 0) {
      timerState.left = 0;
      timerState.running = false;
      clearInterval(timerState.tick);
      toast('Time');
      /* A sound BUILT rather than fetched — a file is a request that can fail silently, and a
         timer that ends in silence has not ended. */
      try {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) {
          const ac = new AC();
          const o = ac.createOscillator(), g = ac.createGain();
          o.connect(g); g.connect(ac.destination);
          o.frequency.value = 880; g.gain.value = 0.08;
          o.start(); o.stop(ac.currentTime + 0.35);
        }
      } catch {}
      navigator.vibrate?.([200, 100, 200]);
    }
    paintTimer();
  }, 1000);
}

/* Draws the clock as it stands, and picks a running one back up. Does NOT stop it. */
function initTimer() {
  paintTimer();
  if (timerState.running) timerTick();
}

on('timer-toggle', () => {
  if (!timerState.left) timerState.left = timerState.total;   // finished: play starts it again
  timerState.running = !timerState.running;
  if (timerState.running) timerTick(); else clearInterval(timerState.tick);
  paintTimer();
});

on('timer-reset', el => {
  if (!sure_(el, 'Reset it?')) return;
  timerState.running = false;
  clearInterval(timerState.tick);
  timerState.left = timerState.total;
  paintTimer();
});

on('timer-set', el => {
  const mins = Number(el.dataset.min) || 25;
  timerState.total = mins * 60;
  timerState.left = mins * 60;
  timerState.running = false;
  clearInterval(timerState.tick);
  paintTimer();
});

/* ---------- THE CALENDAR § */
/* THE MONTH ON SCREEN, { y, m }; null until the card first starts. */
let CAL_VIEW = null;
/* `MONTHS` was a second copy of the twelve month names, identical to `MONTH_NAMES` in data.js.
   Two lists of the same twelve words is two places to fix a typo and one of them will be missed. */

/* ---------- A PLAIN CALENDAR (466) ----------
   The owner: "It's a plain calendar." No terms, sessions, exams or holidays are laid on it; term end dates are the Term dates widget. */

function initCalendar() {
  if (!$('cal-body')) return;
  const now = new Date();
  CAL_VIEW = CAL_VIEW || { y: now.getFullYear(), m: now.getMonth() };
  drawCalendar();
}

function drawCalendar() {
  const host = $('cal-body');
  if (!host) return;
  const y = calView().y, m = CAL_VIEW.m;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const startDay = (new Date(y, m, 1).getDay() + 6) % 7;   // Monday-first
  const days = new Date(y, m + 1, 0).getDate();
  const label = $('cal-label');
  if (label) label.textContent = `${MONTH_NAMES[m]} ${y}`;

  const cells = [];
  ['M','T','W','T','F','S','S'].forEach(d => cells.push(`<span class="cal-h">${d}</span>`));
  for (let i = 0; i < startDay; i++) cells.push('<span></span>');
  for (let d = 1; d <= days; d++) {
    const isToday = new Date(y, m, d).getTime() === today.getTime();
    cells.push(`<span class="cal-d${isToday ? ' cal-today' : ''}" data-d="${d}">${d}</span>`);
  }
  host.innerHTML = cells.join('');
}

/* CAL_VIEW is filled by initCalendar, which `wake` runs before the screen can be touched — so this cannot be null in practice. § */
const calView = () => (CAL_VIEW = CAL_VIEW
  || { y: new Date().getFullYear(), m: new Date().getMonth() });

on('cal-back', () => {
  calView().m--;
  if (CAL_VIEW.m < 0) { CAL_VIEW.m = 11; CAL_VIEW.y--; }
  drawCalendar();
});
on('cal-fwd', () => {
  calView().m++;
  if (CAL_VIEW.m > 11) { CAL_VIEW.m = 0; CAL_VIEW.y++; }
  drawCalendar();
});

/* ---------- THE TIMETABLE § */
const TMT_DAY_NAMES = SLOT_DAYS.map(d => d[1]);   // Monday … Sunday, the list book.js already holds
let TMT_DAY = -1;      // which day is on screen; -1 until the first draw picks today
let TMT_OPEN = '';     // the id of the lesson whose boxes are showing

const tmtKey_ = () => 'tmt' + (whoIs_() ? ':' + whoIs_() : '');
let TMT_TIMER = null;

/* A timetable, or null — from the cell's text, the device's text, or anything else. The shape is
   checked rather than trusted, because a cell somebody typed into would otherwise be drawn as a week
   and then saved back over. */
function tmtParse_(raw) {
  try {
    const t = typeof raw === 'string' ? JSON.parse(raw || 'null') : raw;
    if (t && Array.isArray(t.days) && t.days.length === 7 && t.days.every(Array.isArray)) return t;
  } catch (e) {}
  return null;
}
const tmtEmpty_ = () => ({ weekend: false, days: [[], [], [], [], [], [], []] });
function tmtLocal_() {
  try { return tmtParse_(localStorage.getItem(tmtKey_())); } catch (e) { return null; }
}

function tmtRead_() {
  if (typeof USER !== 'undefined' && USER) {
    const mine = tmtParse_(USER.timetable);
    if (mine) return mine;
    /* ---------- THE FIRST TIME ON THE ACCOUNT, WHAT THIS PHONE HELD COMES WITH YOU § */
    const here = tmtLocal_();
    if (here && here.days.some(d => d.length)) { tmtSave_(here); return here; }
    return tmtEmpty_();
  }
  return tmtLocal_() || tmtEmpty_();
}
/* ---------- KEPT ON THE PHONE FIRST, THEN SENT § */
function tmtSave_(t) {
  if (typeof USER !== 'undefined' && USER) {
    USER.timetable = JSON.stringify(t);
    try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch (e) {}
    clearTimeout(TMT_TIMER);
    /* AND BOOKED TO GO AS THE PAGE GOES (`keepDue_`, data.js; docs/history/317). */
    const send = keepalive => {
      clearTimeout(TMT_TIMER);
      keepDue_('timetable', null);
      if (!USER) return;
      return api({ action: 'saveTimetable', name: USER.name, personId: USER.personId || '',
            timetable: USER.timetable }, keepalive ? { keepalive: true } : undefined)
        .then(d => { if (d && d.error) throw new Error(d.error); })
        .catch(err => toast('Timetable not saved — ' + why_(err)));
    };
    TMT_TIMER = setTimeout(send, 900);
    keepDue_('timetable', send);
    return;
  }
  try { localStorage.setItem(tmtKey_(), JSON.stringify(t)); }
  catch (e) { toast('Not saved — this browser is not keeping anything.'); }
}

/* ---------- THE COLOUR IS THE SUBJECT'S, NOT THE LESSON'S § */
const TMT_HUES = 10;
/* LETTERS IN ANY ALPHABET, NOT a-z. § */
const tmtSubKey_ = s => String(s || '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

/* Brings `t.colours` in line with the subjects actually in the week. Answers whether it changed. */
function tmtColours_(t) {
  const was = JSON.stringify(t.colours || {});
  const have = {};
  t.days.forEach(d => (d || []).forEach(l => { const k = tmtSubKey_(l.subject); if (k) have[k] = 1; }));
  const c = {};
  Object.keys(t.colours || {}).forEach(k => { if (have[k]) c[k] = t.colours[k]; });
  Object.keys(have).forEach(k => { if (!(k in c)) c[k] = tmtFreeHue_(c); });
  t.colours = c;
  return JSON.stringify(c) !== was;
}
function tmtFreeHue_(c) {
  const worn = new Array(TMT_HUES).fill(0);
  Object.values(c).forEach(i => { if (worn[i] !== undefined) worn[i]++; });
  return worn.indexOf(Math.min(...worn));
}
/* What a subject is wearing — or, while it is still being typed, what it WOULD wear. */
function tmtColour_(t, subject) {
  const k = tmtSubKey_(subject);
  if (!k) return '';
  const c = t.colours || {};
  return 'var(--tmt-' + (k in c ? c[k] : tmtFreeHue_(c)) + ')';
}

/* "09:00" sorts as text, and a lesson with no time yet goes last rather than first. */
const tmtOrder_ = (a, b) => {
  const x = a.at || '99', y = b.at || '99';
  return x < y ? -1 : x > y ? 1 : 0;
};

function tmtRow_(l, t) {
  const c = tmtColour_(t, l.subject);
  const style = c ? ` style="--tmt-c:${c}"` : '';
  const id = esc(l.id);
  if (l.id !== TMT_OPEN) {
    return tile_({ form: true, look: 'tmt-row', act: 'tmt-open', data: { id: l.id }, attrs: style.trim(),
      html: `<span class="tmt-at">${esc(l.at || '--:--')}</span><span class="tmt-what"><span class="tmt-sub">${esc(l.subject || 'Untitled')}</span>${
        l.note ? `<span class="tmt-note">${esc(l.note)}</span>` : ''}</span>` });
  }
  /* A FORM, SO BUTTONS. `Done` shuts it and puts it in time order; `Remove` takes it off. § */
  return `<div class="tmt-ed"${style}>
      <div class="tmt-ed-top">
        <input class="tmt-in tmt-time" type="time" data-id="${id}" data-f="at"
               value="${esc(l.at || '')}" aria-label="Starts at">
        <input class="tmt-in" data-id="${id}" data-f="subject" value="${esc(l.subject || '')}"
               placeholder="Subject" autocomplete="off">
      </div>
      <input class="tmt-in" data-id="${id}" data-f="note" value="${esc(l.note || '')}"
             placeholder="Note — room, teacher, homework" autocomplete="off">
      <div class="btn-row">
        ${tile_({ form: true, label: 'Done', act: 'tmt-open', data: { id: id }, kind: 'quiet' })}
        ${tile_({ form: true, label: 'Remove', act: 'tmt-drop', data: { id: id }, kind: 'danger' })}
      </div>
    </div>`;
}

/* A BOOKED SESSION WAS DRAWN HERE, LOCKED. The timetable is only its own lessons now: nothing syncs into it (466). */
function tmtHtml_() {
  const t = tmtRead_();
  /* NOT SAVED WHEN DRAWN AHEAD (`AHEAD.running`, shell.js; docs/history/341). § */
  if (tmtColours_(t) && !(typeof AHEAD !== 'undefined' && AHEAD.running)) tmtSave_(t);
  const shown = t.weekend ? 7 : 5;
  if (TMT_DAY < 0) TMT_DAY = (new Date().getDay() + 6) % 7;      // Monday-first, as SLOT_DAYS is
  if (TMT_DAY >= shown) TMT_DAY = 0;
  const rows = (t.days[TMT_DAY] || []).map(l => ({ at: l.at || '99', html: () => tmtRow_(l, t) }))
    .sort(tmtOrder_);
  const chips = TMT_DAY_NAMES.slice(0, shown).map((n, i) =>
    tile_({ form: true, look: 'tmt-day' + (i === TMT_DAY ? ' on' : '') + ((t.days[i] || []).length ? ' has' : ''),
      act: 'tmt-day', data: { day: i }, pressed: i === TMT_DAY, aria: n, label: n.slice(0, 3) })).join('');
  return `<div class="tmt">
    <div class="tmt-days n${shown}">${chips}</div>
    <div class="tmt-list">${rows.length ? rows.map(r => r.html()).join('')
      : empty_('Nothing on ' + TMT_DAY_NAMES[TMT_DAY] + '.')}</div>
    ${/* ONE ROW FOR BOTH, because a full Monday at 320 is the card that runs out of height first and
          a line of its own for a tickbox is 44px of it. */''}
    <div class="tmt-foot">${tile_({ form: true, label: 'Add a lesson', act: 'tmt-add', kind: 'quiet' })}
      <label class="check tmt-wkend"><input type="checkbox" data-do="tmt-weekend"${t.weekend ? ' checked' : ''}>
        <span class="box"></span><span>Weekend</span></label></div>
  </div>`;
}

/* EVERY COPY, BY CLASS. The Saved column draws this same markup, so `$()` would hand the second copy
   the first one's box — the `$('msg-text')` fault `cartPaint_` is written against one file along. */
function tmtPaint_() {
  const html = tmtHtml_();
  document.querySelectorAll('.tmt-box').forEach(el => { el.innerHTML = html; });
}
function initTimetable() { tmtPaint_(); }

/* ---------- A LESSON SHUT WITH NOTHING IN IT IS NOT A LESSON § */
function tmtShut_() {
  if (!TMT_OPEN) return;
  const t = tmtRead_();
  let gone = false;
  t.days = t.days.map(d => (d || []).filter(l => {
    const blank = l.id === TMT_OPEN && !String(l.subject || '').trim() && !String(l.note || '').trim();
    if (blank) gone = true;
    return !blank;
  }));
  if (gone) tmtSave_(t);
  TMT_OPEN = '';
}

on('tmt-day', el => {
  TMT_DAY = Number(el.dataset.day) || 0;
  tmtShut_();
  tmtPaint_();
});

/* THE BOX IS FOUND BEFORE THE REPAINT, because the repaint replaces the element that was pressed and
   `closest` on a detached node finds nothing. */
on('tmt-open', el => {
  const want = TMT_OPEN === el.dataset.id ? '' : el.dataset.id;
  tmtShut_();
  TMT_OPEN = want;
  const box = el.closest('.tmt-box');
  tmtPaint_();
  if (TMT_OPEN) box?.querySelector(`.tmt-in[data-f="subject"][data-id="${TMT_OPEN}"]`)?.focus();
});

on('tmt-add', el => {
  tmtShut_();
  const t = tmtRead_();
  const day = t.days[TMT_DAY] || (t.days[TMT_DAY] = []);
  /* AN HOUR AFTER THE LAST ONE, because lessons follow each other and the next time is usually the
     one somebody would have typed. Nine o'clock for an empty day. */
  const last = day.map(l => l.at).filter(Boolean).sort().pop();
  const h = last ? Math.min(23, Number(last.slice(0, 2)) + 1) : 9;
  const id = 'L' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  day.push({ id, at: String(h).padStart(2, '0') + (last ? last.slice(2) : ':00'), subject: '', note: '' });
  tmtSave_(t);
  TMT_OPEN = id;
  const box = el.closest('.tmt-box');
  tmtPaint_();
  box?.querySelector(`.tmt-in[data-f="subject"][data-id="${id}"]`)?.focus();
});

on('tmt-drop', el => {
  if (!sure_(el, 'Remove it?')) return;
  const t = tmtRead_();
  t.days = t.days.map(d => (d || []).filter(l => l.id !== el.dataset.id));
  tmtSave_(t);
  TMT_OPEN = '';
  tmtPaint_();
});

/* A CHECKBOX, SO IT IS READ AFTER IT HAS MOVED — the box has already changed by the time this runs. */
on('tmt-weekend', el => {
  const t = tmtRead_();
  t.weekend = !!el.checked;
  tmtSave_(t);
  if (!t.weekend && TMT_DAY > 4) TMT_DAY = 4;
  tmtPaint_();
});

/* KEPT ON EVERY KEYSTROKE AND NOT REDRAWN. § */
function tmtKeep_(e) {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('tmt-in')) return;
  const t = tmtRead_();
  for (const d of t.days) {
    const l = (d || []).find(x => x.id === el.dataset.id);
    if (l) { l[el.dataset.f] = el.value; tmtSave_(t); break; }
  }
  /* THE COLOUR FOLLOWS THE SUBJECT AS IT IS TYPED, so what it will be is visible before Done. */
  if (el.dataset.f === 'subject') {
    const ed = el.closest('.tmt-ed');
    const c = tmtColour_(t, el.value);
    if (ed) { if (c) ed.style.setProperty('--tmt-c', c); else ed.style.removeProperty('--tmt-c'); }
  }
}
document.addEventListener('input', tmtKeep_);
document.addEventListener('change', tmtKeep_);

/* TOUCH TYPING — the `typing` widget on the Tools column. § */

/* THE LADDER. `keys` is every letter the lesson may use; `fresh` is what it adds, and a line leans towards words that hold one, because a home-row word in the § */
const KT_HOME = 'asdfghjkl', KT_TOP = 'qwertyuiop', KT_LOW = 'zxcvbnm';
const KT_LESSONS = [
  { name: 'Home row',    keys: KT_HOME,                          fresh: KT_HOME },
  { name: 'Top row',     keys: KT_HOME + KT_TOP,                 fresh: KT_TOP },
  { name: 'Bottom row',  keys: KT_HOME + KT_TOP + KT_LOW,        fresh: KT_LOW },
  { name: 'Capitals',    keys: KT_HOME + KT_TOP + KT_LOW,        fresh: '', caps: true },
  { name: 'Punctuation', keys: KT_HOME + KT_TOP + KT_LOW + "'",  fresh: "'", caps: true, marks: true },
];
/* "AS ACCURACY HOLDS": § */
const KT_HOLD = 0.9, KT_LINES_TO_OPEN = 3;

/* ONE LIST, FILTERED PER LESSON, rather than five lists. § */
const KT_WORDS = (
  'a as ad add all ask asks dad fad fall falls flag flags flask gas glad glass had half hall has ' +
  'lad lads lag lass sad salad shall flash dash hash sash slash alas gala jags ' +
  'the they their there here her were we you your it is to too at of off out our quite quiet ' +
  'type tree free fire wire write route power pretty paper party report opera equal usual ' +
  'house south photo tissue trip ship shop stop sure true what that this with sheet ' +
  'zebra zero zone box fox mix next fix exam extra van vote very cave move back black cabin ' +
  'blank bank came come name climb maze lazy jazz and for have from will one would about which ' +
  'when make can like time just know take people into year good some could them see other than ' +
  'then now look only over think also after use too how work first well way even new want because ' +
  "any these give day most don't it's can't won't isn't we're you're that's let's"
).split(' ');
/* Capitals are practised on names as well as on the first word of a sentence, because a name is
   where a capital turns up in the middle of a line. */
const KT_NAMES = ['London', 'Paris', 'Monday', 'Friday', 'Sam', 'Kit', 'Zoe', 'Max', 'Ben', 'June'];

/* THE KEYBOARD, AND WHICH FINGER OWNS EACH KEY. § */
const KT_ROWS = ['qwertyuiop', "asdfghjkl;'", 'zxcvbnm,./'];
const KT_COL_FINGER = [0, 1, 2, 3, 3, 4, 4, 5, 6, 7, 7];
/* WHAT A SHIFTED MARK IS UNDER. A capital is its own letter; these are not. */
const KT_SHIFTED = { '?': '/', ':': ';', '"': "'", '<': ',', '>': '.' };

function ktFinger_(base) {
  if (base === ' ') return 8;
  for (const row of KT_ROWS) { const i = row.indexOf(base); if (i >= 0) return KT_COL_FINGER[i]; }
  return -1;
}
/* The keycap a character is on, and whether shift is held for it. */
function ktCap_(ch) {
  if (KT_SHIFTED[ch]) return { base: KT_SHIFTED[ch], shift: true };
  const lo = ch.toLowerCase();
  return { base: lo, shift: lo !== ch };
}

/* ---------- KEPT ON THE DEVICE, UNDER WHOEVER IS SIGNED IN § */
function ktKey_() { const w = typeof whoIs_ === 'function' ? whoIs_() : ''; return 'kt' + (w ? ':' + w : ''); }
function ktRead_() {
  try {
    const p = JSON.parse(localStorage.getItem(ktKey_()) || 'null');
    if (p && Array.isArray(p.held)) {
      p.open = Math.max(0, Math.min(KT_LESSONS.length - 1, Number(p.open) || 0));
      p.at = Math.max(0, Math.min(p.open, Number(p.at) || 0));
      while (p.held.length < KT_LESSONS.length) p.held.push(0);
      return p;
    }
  } catch (e) {}
  return { at: 0, open: 0, held: KT_LESSONS.map(() => 0), best: 0, lines: 0 };
}
function ktSave_(p) {
  try { localStorage.setItem(ktKey_(), JSON.stringify(p)); }
  catch (e) { /* A browser keeping nothing still types — it just forgets the ladder on reload. */ }
}

/* THE LINE IN HAND. In memory, and stamped with who it belongs to, so a sign-in on the same machine does not hand the next person the last one's half-finished § */
let KT = null;
function ktFresh_(who, p, said, last) {
  return { who, p, line: ktLine_(p.at), pos: 0, right: 0, wrong: 0, t0: 0, t1: 0, miss: '',
           said: said || '', last: last || null };
}
function ktNow_() {
  const who = ktKey_();
  if (!KT || KT.who !== who) KT = ktFresh_(who, ktRead_());
  return KT;
}

/* A LESSON BY ITS NUMBER, the first for one that is not there. § */
function ktLesson_(n) { return KT_LESSONS[n] || KT_LESSONS[0]; }
function ktLessonCount_() { return KT_LESSONS.length; }

/* A LINE OF ABOUT FORTY CHARACTERS — two rows of the card on a 320 phone, one on a laptop. */
function ktLine_(n) {
  const L = ktLesson_(n);
  const fits = w => [...w.toLowerCase()].every(c => L.keys.includes(c));
  const pool = KT_WORDS.filter(fits);
  const fresh = L.fresh ? pool.filter(w => [...w].some(c => L.fresh.includes(c))) : [];
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const words = [];
  let len = 0;
  while (len < 38) {
    /* NOT THE SAME WORD TWICE RUNNING. § */
    const was = words.length ? words[words.length - 1].toLowerCase().replace(/[^a-z']/g, '') : '';
    let w = '';
    for (let tries = 0; tries < 8 && (!w || w.toLowerCase() === was); tries++) {
      w = L.caps && Math.random() < 0.15 ? pick(KT_NAMES)
        : fresh.length && Math.random() < 0.6 ? pick(fresh) : pick(pool);
    }
    if (L.caps && (!words.length || Math.random() < 0.3)) w = w[0].toUpperCase() + w.slice(1);
    /* MARKS BETWEEN WORDS, not a mark per word: one gap in three, and a full stop or a question mark
       starts the next word with a capital, as a sentence would. */
    if (L.marks && words.length && Math.random() < 0.3) {
      const m = pick([',', ',', '.', '?', ';', ':']);
      words[words.length - 1] += m;
      if (m === '.' || m === '?') w = w[0].toUpperCase() + w.slice(1);
    }
    words.push(w);
    len += w.length + 1;
  }
  return words.join(' ') + (L.marks ? '.' : '');
}

/* ---------- WHAT A LINE SCORES § */
function ktWpm_(s) {
  const ms = (s.t1 || 0) - (s.t0 || 0);
  return ms > 0 && s.right > 1 ? Math.round((s.right / 5) / (ms / 60000)) : 0;
}
function ktAcc_(s) {
  const all = s.right + s.wrong;
  return all ? s.right / all : 1;
}

/* ONE KEY. `ch` is the character typed, from whichever door it came in by. */
function ktType_(ch) {
  const s = ktNow_();
  const want = s.line[s.pos];
  if (want === undefined) return;
  const now = Date.now();
  if (!s.t0) s.t0 = now;
  s.t1 = now;
  if (ch === want) { s.pos++; s.right++; s.miss = ''; }
  else { s.wrong++; s.miss = ch; }
  if (s.pos >= s.line.length) ktDone_(s);
}

function ktDone_(s) {
  const p = s.p;
  const wpm = ktWpm_(s), acc = ktAcc_(s);
  p.lines = (p.lines || 0) + 1;
  p.best = Math.max(p.best || 0, wpm);
  let said = `Last line: ${wpm} wpm, ${Math.round(acc * 100)}% right.`;
  if (acc >= KT_HOLD) {
    p.held[p.at] = (p.held[p.at] || 0) + 1;
    if (p.at === p.open && p.open < KT_LESSONS.length - 1 && p.held[p.at] >= KT_LINES_TO_OPEN) {
      p.open++;
      said += ` ${KT_LESSONS[p.open].name} is open.`;
    }
  } else {
    said += ` Under ${Math.round(KT_HOLD * 100)}% does not count — slow down, eyes on the screen.`;
  }
  ktSave_(p);
  KT = ktFresh_(s.who, p, said, { wpm, acc });
}

/* ---------- DRAWN § */
function ktKeyHtml_(base, label, next, miss, extra) {
  const f = ktFinger_(base);
  const cls = ['kt-k', 'f' + (f < 0 ? 8 : f)];
  if (KT_ROWS[1].indexOf(base) >= 0 && KT_ROWS[1].indexOf(base) < 10) cls.push('home');
  if (base === 'f' || base === 'j') cls.push('bump');
  if (next) cls.push('next');
  if (miss) cls.push('miss');
  if (extra) cls.push(extra);
  return `<span class="${cls.join(' ')}">${esc(label)}</span>`;
}

function ktBoardHtml_(want, miss) {
  const w = want ? ktCap_(want) : null;
  const m = miss ? ktCap_(miss).base : '';
  /* SHIFT ON THE OTHER HAND, which is the rule a touch typist is taught: the left little finger holds
     shift for a letter the right hand types, and the other way round. */
  const wf = w ? ktFinger_(w.base) : -1;
  const shL = !!(w && w.shift && wf >= 4 && wf <= 7), shR = !!(w && w.shift && wf >= 0 && wf <= 3);
  const row = r => [...r].map(c => ktKeyHtml_(c, c, !!w && w.base === c, m === c)).join('');
  /* THE SHIFTS ARE NAMED BY A KEY ON THEIR OWN SIDE — `z` and `/` — only so `ktFinger_` gives them
     the left and right little finger's colours without a second table. */
  return `<div class="kt-kb" aria-hidden="true">
    <div class="kt-r kt-r1">${row(KT_ROWS[0])}</div>
    <div class="kt-r kt-r2">${row(KT_ROWS[1])}</div>
    <div class="kt-r kt-r3">${ktKeyHtml_('z', '⇧', shL, false, 'kt-sh')}${row(KT_ROWS[2])}${
      ktKeyHtml_('/', '⇧', shR, false, 'kt-sh')}</div>
    <div class="kt-r kt-r4">${ktKeyHtml_(' ', 'space', !!w && w.base === ' ', m === ' ', 'kt-sp')}</div>
  </div>`;
}

function ktViewHtml_() {
  const s = ktNow_(), p = s.p;
  const L = ktLesson_(p.at);
  const cur = s.line[s.pos] === undefined ? '' : s.line[s.pos];
  const wpm = s.pos ? ktWpm_(s) : (s.last ? s.last.wpm : 0);
  const acc = s.right + s.wrong ? ktAcc_(s) : (s.last ? s.last.acc : 1);
  /* THE RUNGS ARE A PICKER, the timetable's day chips: 44px, the open ones pressable, the shut ones
     drawn and disabled so the ladder can be seen before it is climbed. */
  const rungs = KT_LESSONS.map((l, i) => {
    const shut = i > p.open;
    return tile_({ form: true, look: 'kt-rung' + (i === p.at ? ' on' : '') + ((p.held[i] || 0) >= KT_LINES_TO_OPEN ? ' held' : ''),
      act: 'kt-lesson', data: { n: i }, pressed: i === p.at, off: shut, aria: l.name + (shut ? ' (not open yet)' : ''), label: i + 1 });
  }).join('');
  const toGo = p.at === p.open && p.open < KT_LESSONS.length - 1
    ? Math.max(0, KT_LINES_TO_OPEN - (p.held[p.at] || 0)) : 0;
  /* THE LINE IS ONE BUTTON WITH NO WHITESPACE INSIDE IT — the spans run on — because a gap between
     them in the markup is a space drawn in the middle of the line that nobody is meant to type. */
  return `<div class="kt-rungs">${rungs}</div>
    <p class="kt-lesson"><b>${esc(L.name)}</b>${toGo
      ? ` <span>· ${toGo} more at ${Math.round(KT_HOLD * 100)}% opens ${esc(KT_LESSONS[p.at + 1].name)}</span>`
      : ''}</p>
    ${tile_({ form: true, look: 'kt-line', act: 'kt-focus', aria: 'Type this line: ' + s.line, html: `<span class="kt-done">${
      esc(s.line.slice(0, s.pos))}</span><span class="kt-cur${s.miss ? ' miss' : ''}${cur === ' ' ? ' sp' : ''}">${
      esc(cur)}</span><span class="kt-rest">${esc(s.line.slice(s.pos + 1))}</span>` })}
    <p class="kt-hint"><span class="kt-go">Tap the line, then type.</span><span class="kt-on">Eyes here, not on your hands.</span></p>
    <div class="kt-stats"><span><b class="kt-wpm">${wpm}</b> wpm</span><span><b class="kt-acc">${
      Math.round(acc * 100)}%</b> right</span>${p.best ? `<span>best ${p.best}</span>` : ''}</div>
    ${ktBoardHtml_(cur, s.miss)}
    <p class="note kt-said" aria-live="polite">${esc(s.said || '')}</p>
    <p class="kt-real">Made for a real keyboard. A phone's own keys work, but the point is not looking down.</p>`;
}

/* EVERY COPY, BY CLASS — the Saved column draws this markup again, the timetable's reason. § */
function ktPaint_() {
  const html = ktViewHtml_();
  document.querySelectorAll('.kt-box').forEach(el => {
    let v = el.querySelector(':scope > .kt-view');
    if (!v) {
      el.innerHTML = `<input class="kt-in" type="text" autocomplete="off" autocapitalize="off"
        autocorrect="off" spellcheck="false" enterkeyhint="next" aria-label="Type here">
        <div class="kt-view"></div>`;
      v = el.querySelector(':scope > .kt-view');
    }
    v.innerHTML = html;
    el.classList.toggle('typing', document.activeElement === el.querySelector('.kt-in'));
  });
}
function initTyping() { ktPaint_(); }

/* ---------- HOW KEYS GET IN § */
document.addEventListener('keydown', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('kt-in')) return;
  if (e.ctrlKey || e.metaKey || e.altKey || e.isComposing) return;
  if (e.key === 'Backspace') { e.preventDefault(); e.stopPropagation(); return; }
  if (!e.key || e.key.length !== 1) return;     // Tab, Escape, the arrows: theirs, not ours
  e.preventDefault();
  e.stopPropagation();
  ktType_(e.key);
  ktPaint_();
}, true);

document.addEventListener('input', e => {
  const el = e.target;
  if (!el || !el.classList || !el.classList.contains('kt-in')) return;
  const got = String(el.value || '');
  el.value = '';
  if (!got) return;
  [...got].forEach(ktType_);
  ktPaint_();
});

/* THE CARD SAYS WHETHER IT IS LISTENING. A typist who clicked elsewhere and goes on typing is typing
   into nothing, so the hint under the line changes and the line loses its lit letter. */
document.addEventListener('focusin', e => {
  if (e.target && e.target.classList && e.target.classList.contains('kt-in')) {
    e.target.closest('.kt-box')?.classList.add('typing');
  }
});
document.addEventListener('focusout', e => {
  if (e.target && e.target.classList && e.target.classList.contains('kt-in')) {
    e.target.closest('.kt-box')?.classList.remove('typing');
  }
});

/* FOCUSED IN THE TAP ITSELF, synchronously — iOS opens its keyboard only for a focus inside the gesture that asked for it. § */
function ktFocus_(at) {
  const box = at && at.closest && at.closest('.kt-box');
  const input = box && box.querySelector('.kt-in');
  if (!input) return;
  try { input.focus({ preventScroll: true }); } catch (e) { input.focus(); }
  /* ONLY IF THE FOCUS TOOK. § */
  box.classList.toggle('typing', document.activeElement === input);
}
on('kt-focus', el => ktFocus_(el));

on('kt-lesson', el => {
  const s = ktNow_();
  const n = Number(el.dataset.n) || 0;
  if (n > s.p.open) return;
  s.p.at = n;
  ktSave_(s.p);
  KT = ktFresh_(s.who, s.p);
  /* THE BOX IS FOUND BEFORE THE REPAINT; the rung pressed is replaced by it. And the typing goes on:
     a click on a rung took the focus off the hidden box, so it is handed straight back. */
  const box = el.closest('.kt-box');
  ktPaint_();
  if (box) ktFocus_(box);
});



/* ---------- ONE MORE THING: a fact a card, tap for the next (owner, 12 Nov: a tool again). Words only; a clip opens where it lives. */
function feedColours(seed) {
  /* ONE OF THE TEN SUBJECT COLOURS (the timetable's tokens), fading to the page; the subject's word in ink. */
  return [`var(--tmt-${hashOf(String(seed || '?')) % 10})`, 'var(--bg)', 'var(--ink)'];
}
function feedSlide(it) {
  const c = feedColours(it.subject);
  const clip = it.clip && /^https?:\/\//i.test(it.clip) ? `<div class="tile-row">${tile_({ icon: 'film', label: 'Watch', note: 'the clip', act: 'file-view', data: { url: it.clip, title: it.heading || 'The clip' } })}</div>` : '';
  return `<div class="feed-art" style="--a:${c[0]};--b:${c[1]};--c:${c[2]}">
    <span class="feed-mark">${esc(initial(it.subject))}</span>
    <span class="feed-credit"></span>
    <div class="feed-text">
      <span class="feed-subject">${esc(it.subject)}</span>
      ${it.heading ? `<h3 class="feed-head">${esc(it.heading)}</h3>` : ''}
      ${it.body ? `<p class="feed-body">${esc(it.body)}</p>` : ''}${clip}
    </div>
  </div>`;
}

;
/* ==== js/games.js ==== */
/* @family. — games.js THE CONSOLE AND THE WORD GAMES (owner, 12 Nov: back under Games in Find), from the games.js of docs/history/1110. */


/* ---------- TIMES TABLES SPRINT § */
/* THE SPRINT IN PLAY, or null between rounds. */
let ttState = null;
const ttQuestion = () => ({ a: 1 + Math.floor(Math.random() * 12),
                            b: 1 + Math.floor(Math.random() * 12) });

function ttAsk() {
  ttState.cur = ttQuestion();
  const q = $('tt-q');
  if (q) q.textContent = `${ttState.cur.a} × ${ttState.cur.b}`;
}

function startTimesTables() {
  if (!$('tt-q')) return;
  clearInterval(ttState && ttState.timer);     // a second Start must not run two clocks
  ttState = { score: 0, left: 60, cur: ttQuestion(), timer: null, asked: 0 };

  $('tt-idle')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  $('tt-question')?.classList.remove('hidden');   // the line that was missing entirely
  $('tt-score').textContent = '0';
  $('tt-time').textContent = '60';
  $('tt-feedback').textContent = '';
  ttAsk();

  const input = $('tt-answer');
  input.value = '';
  input.focus();

  ttState.timer = setInterval(() => {
    if (!ttState) return;
    ttState.left--;
    const t = $('tt-time');
    if (t) { t.textContent = ttState.left; t.classList.toggle('bad', ttState.left <= 10); }
    if (ttState.left <= 0) endTimesTables();
  }, 1000);

  /* Checked on every keystroke, with no Enter to press. § */
  input.oninput = () => {
    if (!ttState) return;
    /* Named `answer`, not `val`. There is a global `val()` that reads an input by id, and a local
       shadowing it inside a function that also reads inputs is a trap set for whoever edits this
       next. */
    const answer = parseInt(input.value, 10);
    if (isNaN(answer)) return;
    if (answer === ttState.cur.a * ttState.cur.b) {
      ttState.score++;
      ttState.asked++;
      $('tt-score').textContent = ttState.score;
      $('tt-feedback').textContent = '✓';
      ttAsk();
      input.value = '';
    }
  };
}

/**
 * SIXTY SECONDS, UP. Called by the clock and by the give-up button, and safe to call twice —
 * the interval is cleared first, so a tap landing in the same tick as the timeout cannot run
 * this over the top of itself.
 */
/* The screen is redrawn every time Arcade is opened, so the sprint starts again from its idle state — and a clock left running behind a screen that no longer has § */
function initTables() {
  if (!$('tt-idle')) return;
  if (ttState) { clearInterval(ttState.timer); ttState = null; }
  $('tt-idle')?.classList.remove('hidden');
  $('tt-question')?.classList.add('hidden');
  $('tt-over')?.classList.add('hidden');
  paintBoard_('tt-board', 'ttHighscore');
}
/* START, AGAIN AND GIVE UP: the sprint's buttons had no handler when games.js came back (12 Nov). */
on('tt-begin', () => startTimesTables());
on('tt-stop', () => endTimesTables());

function endTimesTables() {
  if (!ttState) return;
  clearInterval(ttState.timer);
  const score = ttState.score;
  const best = Math.max(Number(USER && USER.ttHighscore) || 0, score);
  ttState = null;

  $('tt-question')?.classList.add('hidden');
  const over = $('tt-over');
  if (over) {
    over.classList.remove('hidden');
    over.innerHTML = `
      <p class="mono tt-big">${score}</p>
      <p class="note game-said">${
        score === 0 ? 'None. It happens — try a slower start.'
      : score >= best && score > 0 && score > (Number(USER && USER.ttHighscore) || 0)
        ? 'A new best.'
      : 'Your best is ' + best + '.'}</p>
      ${tile_({ form: true, look: `btn`, attrs: `data-do="tt-begin"`, html: `Again` })}`;
  }

  /* Kept only if it beats the old one, and only for somebody signed in. § */
  if (USER && score > (Number(USER.ttHighscore) || 0)) {
    const was = Number(USER.ttHighscore) || 0;
    USER.ttHighscore = score;
    api({ action: 'saveTtHighscore',
      name: USER.name, personId: USER.personId, score })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        if (typeof d.best === 'number') USER.ttHighscore = d.best;
        try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
        /* ---------- AND THE ROW THE BOARD READS, WHICH THIS NEVER TOUCHED § */
        const meRow = (DATA.students || []).concat(DATA.tutors || []).filter(mineIs_)[0];
        if (meRow) meRow.ttHighscore = Number(USER.ttHighscore) || 0;
        paintBoard_('tt-board', 'ttHighscore');
      })
      .catch(() => {
        /* Said quietly rather than left as a lie. A child told they set a record and finding it
           gone next visit has nothing to explain it. */
        USER.ttHighscore = was;
        const over2 = $('tt-over');
        if (over2) over2.insertAdjacentHTML('beforeend',
          '<p class="note game-said">Not saved — no connection.</p>');
      });
  }
}

/* ---------- HERD MENTALITY § */
const HERD_BUILTIN = [
  'Name something you would find in a school bag.',
  'Name a subject that should not exist.',
  'Name something that is always late.',
  'Name a snack that is worth the money.',
  'Name something you would take to a desert island.',
  'Name an animal that would be rubbish as a pet.',
  'Name something everybody says they will do and nobody does.',
  'Name the best day of the week.',
  'Name something that is better cold than hot.',
  'Name a smell that reminds you of school.',
  'Name something you always lose.',
  'Name a film everybody has seen.',
  'Name something that is harder than it looks.',
  'Name a word people spell wrong.',
  'Name something you would never share.',
  'Name a place that is always too cold.',
  'Name something that takes far too long.',
  'Name a sound that makes everybody look up.',
  'Name something you own too many of.',
  'Name a rule everybody breaks.',

  /* ---------- AND EIGHTY MORE, SO THE DECK IS A HUNDRED — AND FOUR HUNDRED MORE AT THE FOOT -- § */
  'Name a biscuit.', 'Name a flavour of crisps.', 'Name something people put on toast.',
  'Name a sandwich filling.', 'Name a vegetable children leave on the side of the plate.',
  'Name a topping on a pizza.', 'Name something people put on chips.',
  'Name a pudding that is better with custard.', 'Name a drink for a cold day.',
  'Name a food that is better the next day.',
  'Name something you would never eat for breakfast.', 'Name something that melts too quickly.',
  'Name an animal you would see at the zoo.', 'Name a bird you see in a garden.',
  'Name an animal that is faster than you.', 'Name a farm animal.', 'Name a sea creature.',
  'Name something a dog does that a cat never would.',
  'Name something a teacher says every day.', 'Name something everybody wants the last one of.',
  'Name something you are not allowed to bring into school.',
  'Name a PE activity nobody looks forward to.',
  'Name something every classroom has on the wall.', 'Name an excuse for late homework.',
  'Name something that happens on the last day of term.',
  'Name something sold at a school fair.', 'Name something written on a whiteboard.',
  'Name something everybody borrows and never gives back.',
  'Name a chore nobody volunteers for.', 'Name something found down the back of a sofa.',
  'Name something everybody keeps in a kitchen drawer.',
  'Name something that is always running out.', 'Name a noise a house makes at night.',
  'Name something you would find in a shed.',
  'Name something that only works if you give it a thump.',
  'Name something you would use to prop a door open.', 'Name something you do before bed.',
  'Name something that makes a room feel cosy.', 'Name something the weather ruins.',
  'Name something you need when it rains.', 'Name a month with nothing good in it.',
  'Name something you would find on a British beach.', 'Name something you do on a wet Sunday.',
  'Name a kind of shop on every high street.', 'Name something you see from a bus window.',
  'Name something that is always too hot to eat straight away.',
  'Name something you hear at a railway station.', 'Name something that only happens in summer.',
  'Name something you pack and never use.', 'Name a way to pass the time on a long journey.',
  'Name something that goes wrong on a car journey.', 'Name something you would take camping.',
  'Name a country with better weather than here.', 'Name a way to travel.', 'Name a board game.',
  'Name a playground game.', 'Name a sport played with a ball.',
  'Name something you only ever use once a year.', 'Name a card game.',
  'Name something that is always missing a piece.',
  'Name an instrument that is loud to practise.', 'Name something that takes ages to dry.',
  'Name a number between one and ten.', 'Name something that is always covered in fingerprints.',
  'Name a fairy tale.', 'Name a nursery rhyme.', 'Name a superhero.',
  'Name something that is always tangled.', 'Name a job that starts very early.',
  'Name something that is impossible to open.', 'Name something that is always sticky.',
  'Name something that is never as good as the advert.',
  'Name something that is never charged when you need it.', 'Name something in a first aid kit.',
  'Name something everybody pretends to enjoy.',
  'Name something people say when they are not listening.',
  'Name a phrase adults use far too often.', 'Name something you cannot do quietly.',
  'Name something that is worth queueing for.', 'Name something that is easier with two people.',
  'Name something yellow.', 'Name something round.', 'Name a fruit you would find in a lunchbox.',
  'Name something you eat with a spoon.', 'Name something you eat with your hands.',
  'Name a breakfast cereal.', 'Name a flavour of ice cream.', 'Name a kind of cake.',
  'Name something you would find at a birthday party.', 'Name something you blow.',
  'Name something that bounces.', 'Name something that floats.', 'Name something that sinks.',
  'Name something that rolls.', 'Name something with wheels.', 'Name something with wings.',
  'Name something with a tail.', 'Name something with stripes.', 'Name something with buttons.',
  'Name something with a lid.', 'Name something with a handle.', 'Name something with keys.',
  'Name something that beeps.', 'Name something that ticks.', 'Name something that buzzes.',
  'Name something that rings.', 'Name something that squeaks.',
  'Name something that smells horrible.', 'Name something that is soft.',
  'Name something that is prickly.', 'Name something that is slimy.',
  'Name something that is shiny.', 'Name something that is heavy.',
  'Name something that is very light.', 'Name something that is cold to touch.',
  'Name something that is very quiet.', 'Name something that is very small.',
  'Name something that is enormous.', 'Name something that is very long.',
  'Name something that is always wet.', 'Name something that is red.',
  'Name something that is blue.', 'Name something that is orange.', 'Name something that is purple.',
  'Name something that is black and white.', 'Name something that is brown.',
  'Name something made of wood.', 'Name something made of glass.', 'Name something made of plastic.',
  'Name something made of metal.', 'Name something made of rubber.', 'Name something you can fold.',
  'Name something you can pour.', 'Name something you can squeeze.', 'Name something you can climb.',
  'Name something you can throw.', 'Name something you can catch.', 'Name something you can ride.',
  'Name something you can plant.', 'Name something you can wear on your head.',
  'Name something you can wear on your feet.', 'Name something you wear to the beach.',
  'Name something people wear to a wedding.', 'Name something you wear to bed.',
  'Name a part of your face.', 'Name a part of your body that you have two of.',
  'Name something you do with your feet.', 'Name something you do when you are bored.',
  'Name something you do when you are nervous.', 'Name something you do when you are happy.',
  'Name something you do in the bath.', 'Name something you do at the park.',
  'Name something you do at the beach.', 'Name something you do in the snow.',
  'Name something you do on a sunny day.', 'Name something you do at a sleepover.',
  'Name something you do after school.', 'Name something you do on your birthday.',
  'Name something you do when you cannot sleep.', 'Name something that makes you laugh.',
  'Name something that makes you sneeze.', 'Name something that makes you jump.',
  'Name something that makes you yawn.', 'Name something that makes you hungry.',
  'Name something that makes you thirsty.', 'Name something that is scary in the dark.',
  'Name something that is fun to do with a friend.', 'Name something you find in a fridge.',
  'Name something you find in a bathroom.', 'Name something you find in a garden.',
  'Name something you find in a park.', 'Name something you find in a playground.',
  'Name something you find in a library.', 'Name something you find in a hospital.',
  'Name something you find at a funfair.', 'Name something you find in a forest.',
  'Name something you find in the sky.', 'Name something you find under the sea.',
  'Name something you find in space.', 'Name something you find in a castle.',
  'Name something you find in a toy box.', 'Name something you find in a toolbox.',
  'Name something you find in a handbag.', 'Name something you find in your pocket.',
  'Name something you find in a classroom.', 'Name something you find in a sports bag.',
  'Name something you find on a desk.', 'Name something you find on a Christmas tree.',
  'Name something you find at a bus stop.', 'Name something you find in a cinema.',
  'Name something you find in a swimming pool.', 'Name something you find at a football match.',
  'Name something you find on a pirate ship.', 'Name something you find in a haunted house.',
  'Name something you find in a spaceship.', 'Name an animal that lives in the jungle.',
  'Name an animal that lives in the Arctic.', 'Name an animal that lives in a tree.',
  'Name an animal that can swim.', 'Name an animal that can climb.', 'Name an animal that hops.',
  'Name an animal that is very slow.', 'Name an animal that is very small.',
  'Name an animal with a long neck.', 'Name an animal with a long tail.',
  'Name an animal with big ears.', 'Name an animal that is black and white.',
  'Name an animal people are scared of.', 'Name an animal that sleeps all day.',
  'Name an animal you might see in a garden.', 'Name an animal in a nursery rhyme.',
  'Name a baby animal.', 'Name an insect.', 'Name a creepy-crawly.', 'Name a dinosaur.',
  'Name a dog\'s name.', 'Name a cat\'s name.', 'Name a name for a goldfish.',
  'Name something a dog chews.', 'Name something a cat chases.', 'Name a job where you help people.',
  'Name a job where you work outside.', 'Name a job where you work with animals.',
  'Name a job you would like to try for a day.', 'Name a job in a hospital.',
  'Name a job in a school.', 'Name a job where you drive.', 'Name a job on a film set.',
  'Name a famous wizard.', 'Name a famous bear.', 'Name a famous mouse.', 'Name a famous pig.',
  'Name a famous duck.', 'Name a cartoon character.', 'Name a character from a fairy tale.',
  'Name a baddie from a film.', 'Name a princess.', 'Name a monster.', 'Name a robot from a film.',
  'Name a character in a Christmas story.', 'Name a Roald Dahl book.',
  'Name a film with animals in it.', 'Name a film that makes people cry.',
  'Name a film with a song everybody knows.', 'Name a TV show for children.',
  'Name a cartoon on TV.', 'Name a song everybody knows the words to.',
  'Name a song you sing at a party.', 'Name a dance.', 'Name a musical instrument you blow.',
  'Name a musical instrument with strings.', 'Name a sport you do in water.',
  'Name a sport you do on your own.', 'Name a sport with a net.', 'Name a sport in the Olympics.',
  'Name a sport people watch on TV.', 'Name a football team.', 'Name something a footballer does.',
  'Name something at sports day.', 'Name a game you play in the car.',
  'Name a game you play at Christmas.', 'Name a game you play with dice.',
  'Name a game with a chasing part.', 'Name a toy that needs batteries.',
  'Name a toy that is older than you.', 'Name a type of puzzle.', 'Name something you build with.',
  'Name something you colour with.', 'Name something you draw.', 'Name something that has a face but is not a person.',
  'Name a number people think is lucky.', 'Name a number bigger than a hundred.',
  'Name a word that rhymes with light.', 'Name a word that starts with Z.',
  'Name a word that means big.', 'Name a word that means happy.', 'Name a word you shout.',
  'Name something you say on the phone.', 'Name something you say when you meet someone.',
  'Name something you say when you are sorry.', 'Name something you say when you hurt yourself.',
  'Name something parents say too often.', 'Name something children say too often.',
  'Name something teachers say when it is noisy.', 'Name something you say at the dinner table.',
  'Name a way to say hello.', 'Name a greeting in another language.', 'Name a country.',
  'Name a country in Europe.', 'Name a famous building.', 'Name a place people visit in London.',
  'Name a planet.', 'Name something in the solar system.', 'Name something about the Moon.',
  'Name something you see in winter.', 'Name something you see in spring.',
  'Name something you see in autumn.', 'Name something you do on a bike.', 'Name a day people look forward to.',
  'Name something you celebrate.', 'Name a festival.', 'Name something you eat at a party.',
  'Name something you eat on bonfire night.', 'Name something you eat at the cinema.',
  'Name something you eat at the seaside.', 'Name something you eat for lunch.',
  'Name something you eat for tea.', 'Name something you eat cold.', 'Name something you dip.',
  'Name something you peel.', 'Name something you crunch.', 'Name something you bake.',
  'Name something you fry.', 'Name something you boil.', 'Name something you grate.',
  'Name something you put in soup.', 'Name something you put in a smoothie.',
  'Name something you put on a pizza that is a bit odd.', 'Name something you put in a pie.',
  'Name something on a burger.', 'Name a fruit.', 'Name a vegetable.', 'Name a berry.',
  'Name a nut.', 'Name something made from eggs.', 'Name something made from milk.',
  'Name something made from flour.', 'Name something made with chocolate.', 'Name a crunchy snack.',
  'Name a drink.', 'Name a juice.', 'Name a sauce.', 'Name something that is sour.',
  'Name something that is salty.', 'Name something that is sweet.',
  'Name a food that is bright green.', 'Name a food that is white.', 'Name a food children hate.',
  'Name a food people argue about.', 'Name something that goes with fish.',
  'Name something that goes with beans.', 'Name something in a picnic basket.',
  'Name a room in a house.', 'Name something in a bedroom.', 'Name something in a kitchen.',
  'Name something in a living room.', 'Name something on a wall.', 'Name something on a shelf.',
  'Name something in a cupboard.', 'Name something under a bed.',
  'Name something by the front door.', 'Name something you plug in.',
  'Name something that needs batteries.', 'Name something with a switch.',
  'Name something that goes round and round.', 'Name something that goes up and down.',
  'Name something that opens and shuts.', 'Name something you turn.', 'Name something you push.',
  'Name something you press.', 'Name something you tie.', 'Name something you zip.',
  'Name something you wash.', 'Name something you fix.', 'Name something you share.',
  'Name something you collect.', 'Name something you count.', 'Name something you keep in a box.',
  'Name something you keep in your bag.', 'Name something you keep in a drawer.',
  'Name something you forget to bring.', 'Name something you lose at school.',
  'Name something that breaks easily.', 'Name something that gets dirty quickly.',
  'Name something that goes mouldy.', 'Name something that needs a password.',
  'Name something that is hard to carry.', 'Name something that is hard to draw.',
  'Name something that is hard to spell.', 'Name something that is hard to say.',
  'Name something that is easy to learn.', 'Name something you learn in primary school.',
  'Name something you learn to do as a baby.', 'Name something you learn to ride.',
  'Name a times table people find hard.', 'Name a school subject with lots of homework.',
  'Name something in a science lab.', 'Name something you do in art.',
  'Name something you do in music.', 'Name something you learn in history.',
  'Name something you learn in geography.', 'Name a school rule.', 'Name a school club.',
  'Name something in a school assembly.', 'Name something teachers carry.',
  'Name a reason to go to the office at school.', 'Name something that happens on a snow day.',
  'Name something you see on the way to school.', 'Name something in a fairy tale forest.',
  'Name something a witch has.', 'Name something a pirate has.', 'Name something a knight has.',
  'Name something a clown has.', 'Name something a chef has.', 'Name something a doctor has.',
  'Name something a builder has.', 'Name something a firefighter has.',
  'Name something a baby needs.', 'Name something a dog needs.', 'Name something a snowman has.',
  'Name something a superhero wears.', 'Name something the tooth fairy leaves.',
  'Name something the Easter bunny brings.', 'Name something on a birthday cake.',
  'Name something in a party bag.', 'Name a fancy dress costume.',
  'Name something scary at Halloween.', 'Name something you see at a firework display.',
  'Name something you see at a circus.', 'Name something you see at the aquarium.',
  'Name something you see at a train station.', 'Name something you see in a garden centre.',
  'Name something you see at the vet.', 'Name something you see in the countryside.',
  'Name something you see on a motorway.', 'Name something you see in a river.',
  'Name something you see at night.', 'Name something you hear in the morning.',
  'Name something you hear at the seaside.', 'Name something you hear in a classroom.',
  'Name something you hear in a kitchen.', 'Name something you hear at a football match.',
  'Name something that comes in pairs.', 'Name something that comes in a tin.',
  'Name something that comes in a jar.', 'Name something that comes in a box.',
  'Name something that has a hole in it.', 'Name something that has a lot of legs.',
  'Name something that has feathers.', 'Name something that has scales.',
  'Name something that has a shell.', 'Name something that grows.', 'Name something that shrinks.',
  'Name something that changes colour.', 'Name something that goes pop.',
  'Name something that goes bang.', 'Name something that falls from the sky.',
  'Name something that flies.', 'Name something that swims.', 'Name something that crawls.',
  'Name something that glows in the dark.', 'Name something that is always cold.',
  'Name something that is always hot.', 'Name something that is always changing.',
  'Name something that is always full.', 'Name something that is always empty.',
  'Name something you should not touch.', 'Name something you should never run with.',
  'Name something you should always wash.', 'Name something that is good for you.',
  'Name something that keeps you warm.', 'Name something that keeps you cool.',
  'Name something that keeps you dry.', 'Name something that wakes you up.',
  'Name something that cheers you up.', 'Name something you do to get fit.',
  'Name something you do to relax.', 'Name something that is nice to give.',
  'Name something that is nice to hear.', 'Name something that is nice to smell.',
  'Name a way to say thank you.', 'Name a way to make a friend.', 'Name a good name for a robot.',
  'Name a good name for a dragon.', 'Name a good name for a unicorn.',
  'Name a good name for a spaceship.', 'Name a good name for a band.',
  'Name a good name for a café.', 'Name a good name for a school hamster.',
  'Name a good name for a new sweet.'
];

let herd = null;

/* FISHER–YATES, NOT `sort(() => Math.random() - 0.5)`. § */
function herdShuffle_(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function herdPack_() {
  /* THE SHEET FIRST, AND ONLY IF IT SAYS ANYTHING. § */
  const rows = ((typeof DATA !== 'undefined' && DATA.herd) || [])
    .filter(r => r && r.active !== false && String(r.question || '').trim())
    .map(r => String(r.question).trim());
  return rows.length ? rows : HERD_BUILTIN;
}

/* ---------- THERE IS NO ROUND, AND THERE NEVER SHOULD HAVE BEEN ONE § */
function initHerd() {
  if (!$('herd-q')) return;
  herd = { pack: herdShuffle_(herdPack_()), at: 0 };
  herdPaint();
}

function herdPaint() {
  const q = $('herd-q');
  if (!q || !herd) return;
  q.textContent = herd.pack[herd.at] || '';
}

on('herd-next', () => {
  if (!herd) return;
  herd.at++;
  /* RESHUFFLED WHEN IT RUNS OUT, silently. Nothing says so, because nothing needs to: five hundred
     questions later is not a moment anybody is keeping track of. */
  if (herd.at >= herd.pack.length) {
    herd.pack = herdShuffle_(herdPack_());
    herd.at = 0;
  }
  herdPaint();
});

/* SENTENCE SCRAMBLE — the words of one sentence, cut up and shuffled; tap them back into order. § */
const SS_BANDS = [['KS2', 'KS2 · ages 7–11'], ['KS3', 'KS3 · ages 11–14'], ['KS4', 'KS4 · GCSE']];

const SS_SENTENCES = {
  /* KS2 — simple and compound sentences, fronted adverbials with their comma, relative clauses,
     apostrophes, questions, commands and exclamations: what the Year 3–6 grammar list asks for. */
  KS2: [
    'My sister plays the piano every evening.',
    'The hungry fox crept towards the henhouse.',
    'We packed our bags because the bus was leaving early.',
    'After lunch, the children played football on the field.',
    'Can you pass me the salt, please?',
    'Remember to close the door when you leave.',
    'What a beautiful rainbow that is!',
    'The boy who lost his shoe hopped all the way home.',
    'Our class visited the museum, which was full of dinosaur bones.',
    'Mum’s car would not start this morning.',
    'The dog’s tail wagged when he saw his lead.',
    'Although it was raining, we went for a walk.',
    'I could not sleep, so I read my book.',
    'The swimmers dived into the pool at the sound of the whistle.',
    'Please wash your hands before dinner.',
    'The children’s paintings were hung in the hall.',
    'If you are tired, you should go to bed.',
    'Grandpa told us a story about a dragon.',
    'The cake, which Dad baked, was delicious.',
    'Our teacher smiled because everyone had finished their work.',
    'Have you ever seen a shooting star?',
    'The kite flew high above the trees.',
    'Lily’s brother is taller than her.',
    'The farmer fed the pigs before breakfast.',
    'Carefully, she carried the eggs across the kitchen.',
    'There are seven days in a week.',
    'Tom kicked the ball and it smashed the window.',
    ['The baby giggled when the puppy licked her face.',
     'The puppy giggled when the baby licked her face.'],
    'We will visit our cousins in the summer holidays.',
    'My favourite subject at school is science.',
    'The moon lit up the path through the woods.',
    'When the bell rang, everyone rushed outside.',
    'Have you finished your homework yet?',
    'The giant’s footsteps shook the ground.',
    'Stop running in the corridor!',
    'Ben, who is my best friend, lives next door.',
    'The flowers grew tall because they had lots of sunshine.',
    'She wasn’t hungry, so she didn’t eat her lunch.',
    'Owls hunt for mice at night.',
    'The pirate buried his treasure on a deserted island.',
    'I’ve lost my pencil case again!',
    'The bus driver waited for the last passenger.',
    'Despite the wind, the boat reached the harbour safely.',
    'Those muddy boots belong to my dad.',
    'A spider spun a web in the corner of the room.',
    'We clapped at the end of the show.',
    'Where did you put the scissors?',
    'The rabbit hopped out of its burrow and sniffed the air.',
    'Everyone cheered as the winner crossed the line.',
    'My grandma knits warm jumpers for the whole family.',
    'The library is closed on Sundays.',
    'Because he was late, Sam ran to school.',
    'The ice cream melted in the hot sun.',
    'Our neighbour’s cat climbed onto the shed roof.',
    'How many legs does a spider have?',
    'The knight drew his sword and charged at the dragon.',
    'Mum asked me to tidy my bedroom.',
    ['The leaves turn orange and fall in autumn.', 'The leaves fall and turn orange in autumn.'],
    'It was so cold that the pond froze.',
    'The hedgehog curled into a tight ball.',
    'Did you remember to feed the fish?',
    'Running across the playground, Mia tripped over her laces.',
    'The postman left a parcel by the front door.',
    'Is it your turn to walk the dog?',
    'The tallest tower in the city has fifty floors.',
    'Wait for the green man before you cross.',
  ],
  /* KS3 — subordinate and relative clauses, the passive, conditionals, semicolons, inversion for
     emphasis, and lists with their commas. */
  KS3: [
    'The cake sank because the oven had not been heated properly.',
    'Having finished the race, the runners collapsed onto the grass.',
    'The castle, which was built in 1066, still stands today.',
    'If I had known about the party, I would have come.',
    'The novel was written by a teenager in just six weeks.',
    'She was nervous; nevertheless, she stepped onto the stage.',
    'Not only did he win, but he also broke the record.',
    'The volcano erupted without warning, destroying several villages.',
    'Although the film was long, nobody in the audience left early.',
    'The detective examined the footprints that had been left in the mud.',
    'Climate change is affecting wildlife all over the world.',
    'My uncle, a keen gardener, grows his own vegetables.',
    'Whoever finishes first will receive a prize.',
    'The students were told to bring a calculator and a ruler.',
    'Unless you apologise, she will never speak to you again.',
    'The bridge, which had stood for centuries, collapsed in the flood.',
    'Rarely have I seen such a spectacular sunset.',
    'The ancient Egyptians built pyramids as tombs for their kings.',
    'We could hear the waves crashing against the rocks below.',
    'The scientist, who had worked through the night, made a breakthrough.',
    'Despite being injured, the goalkeeper refused to leave the pitch.',
    ['The museum is closed while the new gallery is being built.',
     'The new gallery is closed while the museum is being built.'],
    'Tired and hungry, the explorers set up camp for the night.',
    'The more you practise, the better you become.',
    'Shakespeare wrote many of his plays for the Globe Theatre.',
    'The puppy, which had been abandoned, was adopted by a kind family.',
    'As soon as the alarm sounded, the building was evacuated.',
    'The witness claimed that she had seen a man running away.',
    ['Plants need light, water and carbon dioxide to grow.',
     'Plants need light, carbon dioxide and water to grow.'],
    'The teacher, smiling, handed back the test papers.',
    ['Neither the coach nor the players expected the result.',
     'Neither the players nor the coach expected the result.'],
    'The village was cut off after heavy snow blocked the roads.',
    'Some people believe that the house is haunted.',
    'The athlete trained every day so that she could compete in the Olympics.',
    'Wearing a disguise, the spy slipped past the guards.',
    'The town’s oldest resident celebrated her hundredth birthday.',
    'It is important to drink plenty of water during exercise.',
    'The storm had passed, but fallen trees blocked every road.',
    'When the curtain rose, the audience fell silent.',
    'The fossil, discovered by a schoolgirl, is millions of years old.',
    ['You should revise regularly rather than cramming the night before.',
     'You should regularly revise rather than cramming the night before.'],
    'The cheetah is the fastest land animal in the world.',
    'Should you need any help, please ask a member of staff.',
    'The ship sank after it struck an iceberg.',
    ['Many of the trees in the forest were planted a century ago.',
     'Many of the trees were planted in the forest a century ago.'],
    'The company apologised for the delay and offered a refund.',
    'Having read the instructions, I assembled the bookshelf.',
    'There is no evidence that the vaccine causes harm.',
    'The poem describes a soldier’s memories of the war.',
    'Because the river had flooded, the match was postponed.',
    'The headteacher announced that the school would close early.',
    'Hardly anyone noticed when the lights went out.',
    'The recipe calls for two eggs, flour and a pinch of salt.',
    'The orchestra played so beautifully that some people cried.',
    'Our planet is the only one known to support life.',
  ],
  /* KS4 — the sentences a GCSE essay is built from: participle and absolute phrases, the subjunctive,
     inversion after a negative, colons and semicolons, and the vocabulary of literature and science
     answers. */
  KS4: [
    'Had the government acted sooner, thousands of lives might have been saved.',
    'The evidence suggests that the fire was started deliberately.',
    'Macbeth’s ambition, fuelled by the witches’ prophecy, leads to his downfall.',
    'It is essential that every student submit their coursework on time.',
    'The writer uses pathetic fallacy to reflect the character’s despair.',
    'Not until the final chapter is the murderer’s identity revealed.',
    'Social media, despite its benefits, can have a harmful effect on teenagers.',
    ['The results were inconclusive; further research is therefore required.',
     'The results were inconclusive; therefore further research is required.'],
    ['Whereas the first poem celebrates nature, the second presents it as threatening.',
     'Whereas the second poem celebrates nature, the first presents it as threatening.'],
    'Scrooge, once bitter and lonely, is transformed by the end.',
    'The protesters demanded that the factory be closed immediately.',
    'Only by working together can we solve the climate crisis.',
    'The narrator’s use of the first person creates a sense of intimacy.',
    'Inflation rose sharply, causing the price of food to increase.',
    'Were the bridge to collapse, the town would be cut off completely.',
    'The data, which was collected over ten years, reveals a clear trend.',
    'Although she was offered a promotion, she chose to retire.',
    'The author presents the city as a place of danger and corruption.',
    'The candidate who receives the most votes will become mayor.',
    'Language is constantly evolving, as new words enter everyday use.',
    'The theme of isolation is explored throughout the play.',
    'Under no circumstances should the fire doors be left open.',
    'The reaction speeds up when the temperature is increased.',
    'In the final stanza, the speaker reflects on what has been lost.',
    'Priestley uses the Inspector as a mouthpiece for his own views.',
    'The industrial revolution transformed the way people lived and worked.',
    'So convincing was his argument that the jury acquitted him.',
    ['The juxtaposition of light and dark highlights the contrast between good and evil.',
     'The juxtaposition of dark and light highlights the contrast between good and evil.'],
    'What the tragedy ultimately reveals is the destructive power of jealousy.',
    'Exercise not only improves fitness but also reduces stress.',
    'The colonies gained independence after decades of resistance.',
    'Despite repeated warnings, the climbers continued towards the summit.',
    'Her refusal to conform makes her a symbol of rebellion.',
    'The lower the temperature, the slower the particles move.',
    'Having been rejected by society, the creature seeks revenge.',
    'It could be argued that the ending is deliberately ambiguous.',
    'The report, published last week, criticises the government’s response.',
    'Never before had the village witnessed such a celebration.',
    'The metaphor suggests that memory is both fragile and precious.',
    'Carbon dioxide is released when fossil fuels are burned.',
    'If the treaty had been signed, the war might have been avoided.',
    'The speaker’s tone shifts from anger to acceptance.',
    'Unemployment, which had been falling, began to rise again.',
    'The poet’s use of enjambment mirrors the flow of the river.',
    'Tybalt’s death marks the turning point of the play.',
    'Antibiotics are ineffective against viruses because viruses lack cells.',
    'To what extent is Lady Macbeth responsible for the murder?',
    'The government introduced the policy, hoping to reduce traffic.',
    'The setting, a remote island, heightens the sense of danger.',
    'Few could have predicted how quickly the empire would fall.',
    'Although widely praised, the film failed to make a profit.',
    'The second law of thermodynamics states that entropy always increases.',
  ],
};

/* THE WORDS OF AN ENTRY, AS CHIPS. Split on spaces and nothing else, so a comma or a full stop stays
   on the word it was printed against — which is what a strip of cut paper does. */
function ssOrders_(entry) {
  return (Array.isArray(entry) ? entry : [entry]).map(s => String(s).trim().split(/\s+/));
}

/* RIGHT IF IT IS ANY OF THE STATED ORDERS, compared word by word as TEXT rather than chip by chip, so
   two chips that both say "the" are interchangeable — which they are on paper too. */
function ssRight_(entry, words) {
  const got = (words || []).join(' ');
  return ssOrders_(entry).some(o => o.join(' ') === got);
}

/* HOW MANY WORDS FROM THE START ARE RIGHT, against whichever stated order agrees for longest. That is
   the one hint the card gives, and it is the one a teacher gives: "you're right up to here". */
function ssPrefix_(entry, words) {
  let best = 0;
  ssOrders_(entry).forEach(o => {
    let n = 0;
    while (n < o.length && n < words.length && o[n] === words[n]) n++;
    if (n > best) best = n;
  });
  return best;
}

/* ONE PILE PER BAND, dealt from the top and shuffled again when it runs out — the promise `impDraw_`
   makes: no sentence comes round twice until the band has. */
const SS_PILE = {};
function ssDraw_(band) {
  const list = SS_SENTENCES[band] || SS_SENTENCES.KS2;
  if (!SS_PILE[band] || !SS_PILE[band].length) SS_PILE[band] = herdShuffle_(list.map((_, i) => i));
  return list[SS_PILE[band].pop()];
}

function ssBand_(b) {
  if (b !== undefined) {
    try { localStorage.setItem('ss-band', b); } catch (e) {}
    return b;
  }
  let v = 'KS2';
  try { v = localStorage.getItem('ss-band') || 'KS2'; } catch (e) {}
  return SS_SENTENCES[v] ? v : 'KS2';
}

let SS = null;

/* SHUFFLED UNTIL IT IS NOT ALREADY RIGHT. A deal that came out in order is a sentence handed over
   solved, and with five words that is one deal in a hundred and twenty. */
function ssDeal_(band) {
  const entry = ssDraw_(band);
  const words = ssOrders_(entry)[0];
  let chips = herdShuffle_(words);
  for (let i = 0; i < 20 && ssRight_(entry, chips); i++) chips = herdShuffle_(words);
  SS = { band: band, entry: entry, chips: chips, picked: [], verdict: '', said: '' };
}

/* DRAWN FROM THE STATE, the `REEL_HELD` rule, and EVERY CONTROL IS BUILT HERE — the Scrabble
   lesson: Check is not on the page until there is a sentence to check. */
function ssPaint() {
  const box = $('ss-box'), said = $('ss-said'), sel = $('ss-level');
  if (!box || !SS) return;
  if (sel) sel.value = SS.band;
  const right = SS.verdict === 'right';
  const words = SS.picked.map(i => SS.chips[i]);
  const all = SS.picked.length === SS.chips.length;
  box.innerHTML = `<p class="ss-built${right ? ' is-right' : ''}${SS.verdict === 'wrong' ? ' is-wrong' : ''}">`
    + (words.length ? esc(words.join(' ')) : '<span class="ss-empty">Tap the first word</span>')
    + `</p>`
    /* NO CHIPS ONCE IT IS RIGHT. § */
    + (right ? '' : `<div class="ss-chips">`
      + SS.chips.map((w, i) => {
          const used = SS.picked.indexOf(i) !== -1;
          return tile_({ form: true, look: 'ss-chip' + (used ? ' used' : ''), act: 'ss-word', data: { i }, pressed: used, label: w });
        }).join('')
      + `</div>`)
    + `<div class="ss-acts">`
    + (right
        ? `${tile_({ form: true, label: 'Next sentence', act: 'ss-next' })}`
        : `${tile_({ form: true, look: `btn`, attrs: `data-do="ss-check"${all ? '' : ' disabled'}`, html: `Check` })}`
          + `${tile_({ form: true, label: 'Skip', act: 'ss-new', kind: 'quiet' })}`)
    + `</div>`;
  if (said) said.textContent = SS.said;
}

function initScramble() {
  if (!$('ss-box')) return;
  const sel = $('ss-level');
  if (sel && !sel.options.length) {
    sel.innerHTML = SS_BANDS.map(b => `<option value="${b[0]}">${esc(b[1])}</option>`).join('');
  }
  if (!SS) ssDeal_(ssBand_());
  ssPaint();
}

on('ss-word', el => {
  if (!SS || SS.verdict === 'right') return;
  const i = parseInt(el.getAttribute('data-i'), 10);
  if (!(i >= 0 && i < SS.chips.length)) return;
  const at = SS.picked.indexOf(i);
  if (at === -1) SS.picked.push(i); else SS.picked.splice(at, 1);
  SS.verdict = ''; SS.said = '';
  ssPaint();
});
on('ss-check', () => {
  if (!SS || SS.picked.length !== SS.chips.length) return;
  const words = SS.picked.map(i => SS.chips[i]);
  if (ssRight_(SS.entry, words)) {
    SS.verdict = 'right';
    SS.said = 'That’s it.';
  } else {
    const n = ssPrefix_(SS.entry, words);
    SS.verdict = 'wrong';
    SS.said = n === 0 ? 'Not quite — the first word isn’t right. Tap a word to take it back.'
      : 'Not quite — the first ' + (n === 1 ? 'word is' : n + ' words are') + ' right.'
        + ' Tap a word to take it back.';
  }
  ssPaint();
});
/* NEXT AND SKIP ARE THE SAME DEAL WITH DIFFERENT WORDS ON THEM: § */
on('ss-next', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-new', () => { ssDeal_(SS ? SS.band : ssBand_()); ssPaint(); });
on('ss-level', el => {
  const b = SS_SENTENCES[el.value] ? el.value : 'KS2';
  ssBand_(b);
  ssDeal_(b);
  ssPaint();
});

/* WORD SEARCH — a grid of letters with a list of words hidden in it. § */
const WS_DIRS = { e: [1, 0], s: [0, 1], se: [1, 1], ne: [1, -1],
                  w: [-1, 0], n: [0, -1], nw: [-1, -1], sw: [-1, 1] };
const WS_FORWARD = ['e', 's', 'se'];

/* EVERY THEME SAYS ITS OWN SIZE, HOW MANY WORDS, AND WHETHER THEY ONLY READ FORWARDS, because "for younger" is a fact about the theme rather than a second § */
const WS_THEMES = [
  { id: 'y34', name: 'Years 3–4 spellings', young: true, size: 8, n: 6, words: [
    'accident', 'actual', 'address', 'answer', 'appear', 'arrive', 'believe', 'bicycle', 'breath',
    'build', 'busy', 'business', 'calendar', 'caught', 'centre', 'century', 'certain', 'circle',
    'complete', 'consider', 'continue', 'decide', 'describe', 'early', 'earth', 'eight', 'enough',
    'exercise', 'extreme', 'famous', 'February', 'forward', 'fruit', 'grammar', 'group', 'guard',
    'guide', 'heard', 'height', 'history', 'imagine', 'increase', 'interest', 'island', 'learn',
    'length', 'library', 'material', 'medicine', 'mention', 'minute', 'natural', 'naughty', 'notice',
    'occasion', 'often', 'opposite', 'ordinary', 'peculiar', 'perhaps', 'popular', 'position',
    'possess', 'possible', 'potatoes', 'pressure', 'probably', 'promise', 'purpose', 'quarter',
    'question', 'recent', 'regular', 'reign', 'remember', 'sentence', 'separate', 'special',
    'straight', 'strange', 'strength', 'suppose', 'surprise', 'though', 'thought', 'through',
    'various', 'weight', 'woman', 'women'] },
  { id: 'animals', name: 'Animals', young: true, size: 8, n: 6, words: [
    'badger', 'beaver', 'camel', 'cheetah', 'dolphin', 'eagle', 'ferret', 'gerbil', 'giraffe',
    'gorilla', 'hamster', 'hedgehog', 'jaguar', 'koala', 'leopard', 'lizard', 'lobster', 'meerkat',
    'octopus', 'ostrich', 'otter', 'panda', 'parrot', 'penguin', 'pigeon', 'rabbit', 'reindeer',
    'salmon', 'squirrel', 'tiger', 'toucan', 'turtle', 'walrus', 'weasel', 'whale', 'zebra'] },
  { id: 'sci2', name: 'Science, KS2', young: true, size: 8, n: 6, words: [
    'magnet', 'light', 'shadow', 'mirror', 'plant', 'root', 'stem', 'flower', 'seed', 'pollen',
    'force', 'gravity', 'friction', 'circuit', 'battery', 'switch', 'bulb', 'wire', 'solid',
    'liquid', 'melt', 'freeze', 'rock', 'soil', 'fossil', 'skeleton', 'muscle', 'teeth', 'lungs',
    'habitat', 'planet', 'orbit', 'moon', 'sound', 'vibrate', 'magnify'] },
  { id: 'y56', name: 'Years 5–6 spellings', young: true, size: 10, n: 7, words: [
    'amateur', 'ancient', 'apparent', 'attached', 'available', 'average', 'awkward', 'bargain',
    'bruise', 'category', 'cemetery', 'committee', 'community', 'conscience', 'conscious',
    'correspond', 'criticise', 'curiosity', 'definite', 'desperate', 'determined', 'develop',
    'dictionary', 'disastrous', 'embarrass', 'equipment', 'especially', 'exaggerate', 'excellent',
    'existence', 'familiar', 'foreign', 'forty', 'frequently', 'government', 'guarantee', 'harass',
    'hindrance', 'identity', 'immediate', 'individual', 'interfere', 'interrupt', 'language',
    'leisure', 'lightning', 'marvellous', 'muscle', 'necessary', 'neighbour', 'nuisance', 'occupy',
    'occur', 'parliament', 'persuade', 'physical', 'prejudice', 'privilege', 'profession',
    'programme', 'queue', 'recognise', 'recommend', 'relevant', 'restaurant', 'rhyme', 'rhythm',
    'sacrifice', 'secretary', 'shoulder', 'signature', 'sincere', 'soldier', 'stomach',
    'sufficient', 'suggest', 'symbol', 'system', 'thorough', 'twelfth', 'variety', 'vegetable',
    'vehicle', 'yacht'] },
  { id: 'sci34', name: 'Science, KS3–4', young: false, size: 10, n: 8, words: [
    'atom', 'element', 'compound', 'molecule', 'electron', 'proton', 'neutron', 'nucleus',
    'isotope', 'enzyme', 'osmosis', 'diffusion', 'mitosis', 'chromosome', 'velocity', 'momentum',
    'energy', 'current', 'voltage', 'resistance', 'wavelength', 'frequency', 'catalyst',
    'reaction', 'oxidation', 'acid', 'alkali', 'neutral', 'density', 'pressure', 'organism',
    'ecosystem', 'predator', 'species', 'hormone', 'insulin', 'glucose', 'vaccine', 'antibody',
    'bacteria', 'virus', 'gene', 'protein', 'neuron'] },
  { id: 'maths', name: 'Maths', young: false, size: 10, n: 8, words: [
    'fraction', 'decimal', 'percent', 'integer', 'prime', 'factor', 'multiple', 'square', 'cube',
    'radius', 'diameter', 'triangle', 'polygon', 'angle', 'parallel', 'vertex', 'volume', 'area',
    'perimeter', 'symmetry', 'equation', 'formula', 'gradient', 'sequence', 'ratio', 'average',
    'median', 'mode', 'range', 'algebra', 'quadratic', 'tangent', 'sine', 'cosine', 'vector',
    'hexagon', 'pentagon', 'circle', 'cylinder', 'product', 'quotient', 'inverse'] },
  { id: 'geog', name: 'Geography', young: false, size: 10, n: 8, words: [
    'river', 'mountain', 'valley', 'volcano', 'glacier', 'desert', 'climate', 'weather', 'erosion',
    'delta', 'estuary', 'tributary', 'meander', 'continent', 'country', 'capital', 'equator',
    'latitude', 'longitude', 'ocean', 'island', 'tsunami', 'earthquake', 'tectonic', 'magma',
    'rainforest', 'tundra', 'savanna', 'population', 'migration', 'settlement', 'urban', 'rural',
    'contour', 'compass', 'monsoon', 'drought', 'flood', 'coast'] },
];

/* A COPY OF `HANDLE_BLOCKED` FROM backend/constants.gs, and `check-widgets.js` fails if the two differ. § */
const WS_NOT = [
  'anal', 'anus', 'arse', 'bastard', 'bitch', 'bollock', 'boner', 'clit', 'cock', 'coon', 'cum',
  'cunt', 'dick', 'dildo', 'dyke', 'fag', 'fanny', 'fuck', 'gash', 'gook', 'incest', 'jizz',
  'kike', 'knob', 'minge', 'nigg', 'nonce', 'paedo', 'pedo', 'penis', 'piss', 'porn', 'prick',
  'pussy', 'queer', 'rape', 'retard', 'scrote', 'semen', 'sex', 'shag', 'shit', 'slag', 'slut',
  'smeg', 'spastic', 'spic', 'sperm', 'tits', 'titty', 'tosser', 'tranny', 'twat', 'vagina',
  'wank', 'whore', 'wog', 'nazi', 'hitler', 'kkk', 'isis', 'suicide', 'selfharm',
];

/* THE LETTERS OF A WORD, which is what goes in the grid: capitals, nothing but A to Z. */
const wsKey_ = w => String(w).toUpperCase().replace(/[^A-Z]/g, '');

/* DOES THE GRID SPELL ANYTHING ON `WS_NOT`, read from every cell in every one of the eight
   directions. */
function wsRude_(grid, size) {
  const bad = WS_NOT.map(wsKey_);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      for (const k of Object.keys(WS_DIRS)) {
        const [dx, dy] = WS_DIRS[k];
        let s = '';
        for (let i = 0, cx = x, cy = y; i < 8 && cx >= 0 && cy >= 0 && cx < size && cy < size;
             i++, cx += dx, cy += dy) s += grid[cy * size + cx];
        if (bad.some(b => s.startsWith(b))) return true;
      }
    }
  }
  return false;
}

/* ONE PUZZLE. Longest words first, because they are the hard ones to fit and a short word fits in whatever is left. § */
function wsBuild_(theme) {
  const size = theme.size, dirs = theme.young ? WS_FORWARD : Object.keys(WS_DIRS);
  const words = theme.words.filter(w => { const k = wsKey_(w); return k.length >= 3 && k.length <= size; });
  for (let attempt = 0; attempt < 60; attempt++) {
    const grid = new Array(size * size).fill('');
    const placed = [];
    /* THE DEAL IS THE FIRST `n` OF A SHUFFLE, AND ONLY THE DEAL IS PLACED LONGEST-FIRST. § */
    const pool = [];
    let full = 0;
    for (const w of herdShuffle_(words)) {
      if (pool.length >= theme.n * 3) break;
      if (wsKey_(w).length === size) { if (full) continue; full++; }
      pool.push(w);
    }
    const byLen = (a, b) => wsKey_(b).length - wsKey_(a).length;
    pool.splice(0, theme.n, ...pool.slice(0, theme.n).sort(byLen));
    for (const word of pool) {
      if (placed.length >= theme.n) break;
      const key = wsKey_(word);
      if (placed.some(p => p.key.indexOf(key) !== -1 || key.indexOf(p.key) !== -1)) continue;
      for (let t = 0; t < 150; t++) {
        const [dx, dy] = WS_DIRS[dirs[Math.floor(Math.random() * dirs.length)]];
        const x0 = Math.floor(Math.random() * size), y0 = Math.floor(Math.random() * size);
        const x1 = x0 + dx * (key.length - 1), y1 = y0 + dy * (key.length - 1);
        if (x1 < 0 || y1 < 0 || x1 >= size || y1 >= size) continue;
        const cells = [];
        let ok = true;
        for (let i = 0; i < key.length; i++) {
          const at = (y0 + dy * i) * size + (x0 + dx * i);
          if (grid[at] && grid[at] !== key[i]) { ok = false; break; }
          cells.push(at);
        }
        if (!ok) continue;
        cells.forEach((at, i) => { grid[at] = key[i]; });
        placed.push({ word: word, key: key, cells: cells, found: false });
        break;
      }
    }
    if (placed.length < theme.n) continue;
    const empty = [];
    grid.forEach((c, i) => { if (!c) empty.push(i); });
    for (let r = 0; r < 40; r++) {
      empty.forEach(i => { grid[i] = String.fromCharCode(65 + Math.floor(Math.random() * 26)); });
      if (!wsRude_(grid, size)) {
        placed.sort((a, b) => a.word.localeCompare(b.word));
        return { theme: theme.id, size: size, grid: grid, words: placed, got: [], sel: null, said: '' };
      }
    }
  }
  return null;
}

const wsTheme_ = id => WS_THEMES.find(t => t.id === id) || WS_THEMES[0];

function wsThemeId_(id) {
  if (id !== undefined) {
    try { localStorage.setItem('ws-theme', id); } catch (e) {}
    return id;
  }
  let v = WS_THEMES[0].id;
  try { v = localStorage.getItem('ws-theme') || v; } catch (e) {}
  return wsTheme_(v).id;
}

let WS = null;

function wsDeal_(id) {
  WS = wsBuild_(wsTheme_(id));
  if (!WS) WS = { theme: id, size: 0, grid: [], words: [], got: [], sel: null,
                  said: 'That puzzle would not fit together. Press New puzzle.' };
}

/* THE CELLS FROM ONE TAP TO ANOTHER, or null if the two are not on one line — across, down, or a
   true diagonal. The same cell twice is not a line either. */
function wsLine_(size, a, b) {
  const ax = a % size, ay = (a / size) | 0, bx = b % size, by = (b / size) | 0;
  const dx = Math.sign(bx - ax), dy = Math.sign(by - ay);
  const nx = Math.abs(bx - ax), ny = Math.abs(by - ay);
  if (a === b || (nx && ny && nx !== ny)) return null;
  const len = Math.max(nx, ny) + 1, out = [];
  for (let i = 0; i < len; i++) out.push((ay + dy * i) * size + (ax + dx * i));
  return out;
}

/* THE SECOND TAP. Read either way, because a child who taps the last letter first has still found
   the word — and in an older puzzle the word may be written backwards anyway. */
function wsPick_(i) {
  const g = WS;
  if (!g || !g.size || !(i >= 0 && i < g.grid.length)) return;
  if (g.words.every(w => w.found)) return;
  if (g.sel === null) { g.sel = i; g.said = ''; return; }
  if (g.sel === i) { g.sel = null; g.said = ''; return; }
  const cells = wsLine_(g.size, g.sel, i);
  if (!cells) { g.sel = i; g.said = 'Not in a straight line — that letter is the new start.'; return; }
  const s = cells.map(c => g.grid[c]).join('');
  const r = s.split('').reverse().join('');
  const hit = g.words.find(w => !w.found && (w.key === s || w.key === r));
  g.sel = null;
  if (!hit) { g.said = 'That’s not one of the words.'; return; }
  hit.found = true;
  hit.cells = cells;
  cells.forEach(c => { if (g.got.indexOf(c) === -1) g.got.push(c); });
  const left = g.words.filter(w => !w.found).length;
  g.said = left ? 'Found ' + hit.word + '. ' + left + ' to go.'
                : 'All ' + g.words.length + ' found!';
}

function wsPaint() {
  const box = $('ws-grid'), list = $('ws-words'), said = $('ws-said'), sel = $('ws-theme');
  if (!box || !WS) return;
  if (sel) sel.value = WS.theme;
  const done = WS.words.length && WS.words.every(w => w.found);
  box.style.setProperty('--ws-n', String(WS.size || 1));
  box.innerHTML = WS.grid.map((c, i) => {
    const cls = ['ws-c'];
    if (WS.got.indexOf(i) !== -1) cls.push('got');
    if (WS.sel === i) cls.push('sel');
    return tile_({ form: true, look: cls.join(' '), act: 'ws-cell', data: { i }, pressed: WS.sel === i, off: done, label: c });
  }).join('');
  if (list) {
    list.innerHTML = WS.words.map(w => w.found
      ? `<li class="got"><s>${esc(w.word)}</s></li>` : `<li>${esc(w.word)}</li>`).join('');
  }
  if (said) said.textContent = WS.said;
}

function initWordSearch() {
  if (!$('ws-grid')) return;
  const sel = $('ws-theme');
  if (sel && !sel.options.length) {
    const group = (young, label) => `<optgroup label="${label}">`
      + WS_THEMES.filter(t => t.young === young)
          .map(t => `<option value="${t.id}">${esc(t.name)}</option>`).join('')
      + '</optgroup>';
    sel.innerHTML = group(true, 'Younger — words read forwards')
                  + group(false, 'Older — words go any way');
  }
  if (!WS) wsDeal_(wsThemeId_());
  wsPaint();
}

on('ws-cell', el => { wsPick_(parseInt(el.getAttribute('data-i'), 10)); wsPaint(); });
on('ws-again', () => { wsDeal_(WS ? WS.theme : wsThemeId_()); wsPaint(); });
on('ws-theme', el => { wsDeal_(wsThemeId_(wsTheme_(el.value).id)); wsPaint(); });

/* ARTICULATE — describe it without saying it. § */
const ART_DECK = {
  Object: ['umbrella', 'kettle', 'stapler', 'ladder', 'trampoline', 'harmonica', 'wheelbarrow',
           'telescope', 'zip', 'hoover', 'candle', 'passport', 'skateboard', 'saucepan',
           'toothbrush', 'seatbelt', 'chandelier', 'padlock', 'compass', 'radiator',
           'hourglass', 'lawnmower', 'wheelie bin', 'megaphone', 'jigsaw puzzle', 'escalator',
           'washing line', 'hammock', 'weathervane', 'drawing pin',
           'toaster', 'microwave', 'fridge', 'dishwasher', 'washing machine', 'calculator', 'ruler',
           'rubber', 'sellotape', 'scissors', 'glue stick', 'paperclip', 'envelope', 'stamp',
           'postcard', 'calendar', 'alarm clock', 'doorbell', 'letterbox', 'doormat', 'coat hanger',
           'clothes peg', 'ironing board', 'frying pan', 'rolling pin', 'whisk', 'colander',
           'cheese grater', 'tin opener', 'teapot', 'mug', 'lunchbox', 'flask', 'backpack',
           'suitcase', 'wallet', 'keyring', 'torch', 'battery', 'plug', 'remote control',
           'headphones', 'microphone', 'keyboard', 'computer mouse', 'printer', 'lamp', 'pillow',
           'duvet', 'curtain', 'sponge', 'flannel', 'hairdryer', 'comb', 'mirror', 'tweezers',
           'plaster', 'thermometer', 'stethoscope', 'crutches', 'highchair', 'bunk bed', 'sofa',
           'beanbag', 'deckchair', 'parasol', 'bucket and spade', 'goggles'
  ],
  Nature: ['avalanche', 'hedgehog', 'thunderstorm', 'coral reef', 'acorn', 'glacier', 'moth',
           'quicksand', 'rainbow', 'beaver', 'tide', 'fossil', 'cactus', 'eclipse', 'swamp',
           'pollen', 'volcano', 'otter', 'frost', 'mushroom',
           'badger', 'waterfall', 'dandelion', 'tadpole', 'whirlpool', 'icicle', 'puffin',
           'nettle', 'sand dune', 'conker',
           'earthquake', 'tornado', 'hurricane', 'tsunami', 'lightning', 'fog', 'drizzle',
           'hailstone', 'snowflake', 'puddle', 'rock pool', 'cave', 'cliff', 'island', 'desert',
           'meadow', 'pond', 'stream', 'geyser', 'lava', 'crater', 'meteor', 'comet',
           'shooting star', 'full moon', 'sunrise', 'sunset', 'dew', 'breeze', 'gale', 'drought',
           'flood', 'iceberg', 'seaweed', 'starfish', 'seahorse', 'walrus', 'polar bear', 'reindeer',
           'fox', 'mole', 'woodlouse', 'ladybird', 'dragonfly', 'slug', 'beetle', 'ant', 'wasp',
           'grasshopper', 'robin', 'swan', 'eagle', 'pigeon', 'seagull', 'crow', 'parrot', 'toucan',
           'ostrich', 'hummingbird', 'panda', 'koala', 'hippo', 'rhino', 'cheetah', 'leopard',
           'wolf', 'deer'
  ],
  Action: ['juggling', 'whispering', 'sneezing', 'hitchhiking', 'tiptoeing', 'yawning',
           'hibernating', 'shrugging', 'wrestling', 'queueing', 'gargling', 'skimming a stone',
           'blushing', 'haggling', 'eavesdropping', 'sprinting', 'knitting', 'shivering',
           'applauding', 'daydreaming',
           'whistling', 'somersaulting', 'sleepwalking', 'abseiling', 'tying a shoelace',
           'blowing out candles', 'plaiting hair', 'revising', 'snorkelling', 'sulking',
           'bouncing', 'tickling', 'winking', 'stretching', 'kneeling', 'crawling', 'hopping',
           'skipping', 'galloping', 'marching', 'limping', 'waddling', 'wobbling', 'shuffling',
           'clapping', 'pointing', 'nodding', 'bowing', 'curtseying', 'saluting', 'waving',
           'hugging', 'snoring', 'humming', 'chewing', 'nibbling', 'slurping', 'sipping', 'munching',
           'blinking', 'frowning', 'squinting', 'sniffing', 'scratching', 'hiding', 'peeping',
           'tidying', 'dusting', 'sprinkling', 'spreading', 'grating', 'unwrapping', 'folding',
           'sharpening', 'colouring', 'doodling', 'scribbling', 'spelling', 'counting', 'measuring',
           'weighing', 'rhyming', 'guessing', 'cheating', 'bragging', 'apologising', 'complaining',
           'interrupting', 'fidgeting', 'dawdling', 'rummaging', 'recycling', 'volunteering',
           'hula hooping', 'leapfrogging'
  ],
  World: ['Iceland', 'the Sahara', 'Mount Everest', 'the Amazon', 'Venice', 'the Great Wall',
          'Antarctica', 'Tokyo', 'the Nile', 'Stonehenge', 'the Alps', 'Cairo', 'New Zealand',
          'the Panama Canal', 'Lisbon', 'the Dead Sea', 'Kenya', 'Niagara Falls', 'Sicily',
          'the Arctic Circle',
           'the Eiffel Tower', 'Loch Ness', 'the Grand Canyon', 'Big Ben', 'Machu Picchu',
           'the Channel Tunnel', 'the Colosseum', 'the Taj Mahal', 'the Lake District',
           'the Sydney Opera House',
          'Paris', 'Rome', 'New York', 'the London Eye', 'Buckingham Palace',
          'the Statue of Liberty', 'the Pyramids', 'the Leaning Tower of Pisa',
          'the Great Barrier Reef', 'the Mississippi', 'the Thames', 'the Pacific Ocean',
          'the Mediterranean', 'the North Pole', 'the South Pole', 'the Equator', 'Australia',
          'Canada', 'Brazil', 'Mexico', 'Egypt', 'India', 'China', 'Japan', 'Greece', 'Spain',
          'Scotland', 'Wales', 'Ireland', 'Jamaica', 'Hawaii', 'Hollywood', 'Mount Kilimanjaro',
          'Ben Nevis', 'Snowdon', 'the Himalayas', 'the Rocky Mountains', 'the Andes', 'Siberia',
          'the Outback', 'the Serengeti', 'the Galapagos Islands', 'Amsterdam', 'Berlin',
          'Barcelona', 'Edinburgh Castle', 'Blackpool Tower', 'the Angel of the North',
          'Hadrian\'s Wall', 'the Isle of Wight', 'Cornwall', 'the Giant\'s Causeway', 'Mount Fuji',
          'the Golden Gate Bridge', 'the White House', 'Mount Rushmore', 'Uluru', 'the Caribbean',
          'Rio de Janeiro', 'Greenland', 'Timbuktu', 'Hong Kong', 'Tower Bridge',
          'St Paul\'s Cathedral', 'Windsor Castle', 'the Shard', 'the Norwegian fjords'
  ],
  Person: ['a lifeguard', 'a blacksmith', 'a referee', 'an astronaut', 'a plumber', 'a busker',
           'a detective', 'a midwife', 'a lighthouse keeper', 'a beekeeper', 'a paramedic',
           'a librarian', 'a sculptor', 'a chimney sweep', 'a surgeon', 'a tour guide',
           'a lollipop lady', 'an archaeologist', 'a barista', 'a train driver',
           'a window cleaner', 'a magician', 'a vet', 'a shepherd', 'a park ranger',
           'a goalkeeper', 'a puppeteer', 'a weather forecaster', 'a caretaker',
           'a stunt double',
           'a nurse', 'a dentist', 'a pilot', 'a firefighter', 'a police officer', 'a postman',
           'a farmer', 'a chef', 'a baker', 'a butcher', 'a builder', 'an electrician',
           'a carpenter', 'a hairdresser', 'a teacher', 'a head teacher', 'a dinner lady',
           'a gardener', 'a zookeeper', 'a pirate', 'a knight', 'a king', 'a queen', 'a princess',
           'a wizard', 'a fortune teller', 'a clown', 'an acrobat', 'a ringmaster', 'a ballerina', 'a DJ',
           'a newsreader', 'a journalist', 'a photographer', 'an author', 'a poet', 'a scientist',
           'an inventor', 'an explorer', 'a mountaineer', 'a sailor', 'a spy', 'a judge', 'a mayor',
           'a prime minister', 'a bus driver', 'a taxi driver', 'a lorry driver', 'a mechanic',
           'a pharmacist', 'an optician', 'a cashier', 'a shopkeeper', 'a waiter', 'a jockey',
           'a cowboy', 'a lumberjack', 'a fisherman', 'a scuba diver', 'a babysitter', 'a twin',
           'a grandma', 'a pen pal', 'a toddler', 'a teenager', 'a football manager'
  ],
  Random: ['jet lag', 'a leap year', 'homesickness', 'a power cut', 'déjà vu', 'the alphabet',
           'a rumour', 'a traffic jam', 'small talk', 'a nickname', 'bad luck', 'an alibi',
           'a bargain', 'a heatwave', 'stage fright', 'a countdown', 'an echo', 'a punchline',
           'a shortcut', 'a coincidence',
           'a tongue twister', 'a time capsule', 'a sleepover', 'a riddle', 'a head start',
           'a false alarm', 'a cliffhanger', 'an apology', 'a wild goose chase',
           'a wrong number',
           'a secret', 'a surprise', 'a promise', 'a joke', 'a nightmare', 'a wish', 'half term',
           'a fire drill', 'a school report', 'a hiccup', 'the giggles', 'brain freeze',
           'pins and needles', 'butterflies in your stomach', 'a lucky charm', 'a high five',
           'a thumbs up', 'a group photo', 'a password', 'a spelling test', 'a penalty shoot-out',
           'a world record', 'a to-do list', 'a shopping list', 'a recipe', 'a timetable',
           'a deadline', 'the weekend', 'Monday morning', 'a bank holiday', 'midnight',
           'the dawn chorus', 'a lie-in', 'a nap', 'bedtime', 'a bedtime story', 'a happy ending',
           'a plot twist', 'a spoiler', 'a sequel', 'an encore', 'a standing ovation', 'a mascot',
           'a trophy', 'a medal', 'a certificate', 'a gold star', 'beginner\'s luck',
           'a second chance', 'a fresh start', 'musical chairs', 'pass the parcel',
           'a treasure hunt', 'a secret code', 'an emoji', 'the internet', 'gravity', 'electricity',
           'friendship', 'kindness', 'patience', 'courage', 'curiosity', 'boredom', 'excitement',
           'teamwork', 'a compliment'
  ],
};

/* CHARADES — the same round, mimed instead of described. § */
const CHA_DECK = {
  /* THIRTY EACH ONCE (four hundred more were added later, plus `Animal` and `Sport`, which are things a body can SHOW), AND `Action` IS THE ONE THAT HAD TO BE § */
  Film: [
    'Jurassic Park', 'Finding Nemo', 'Toy Story', 'Paddington', 'The Lion King', 'Frozen',
    'Harry Potter', 'Shrek', 'E.T. the Extra-Terrestrial', 'The Wizard of Oz', 'Mary Poppins',
    'Chitty Chitty Bang Bang', '101 Dalmatians', 'Wallace and Gromit', 'Chicken Run',
    'Despicable Me', 'Ratatouille', 'Up', 'The Incredibles', 'Ice Age', 'Star Wars',
    'The Sound of Music', 'Peter Pan', 'Moana', 'Kung Fu Panda', 'How to Train Your Dragon',
    'Babe', 'Nanny McPhee', 'Madagascar', 'Night at the Museum',
    'Cars', 'Coco', 'Encanto', 'Inside Out', 'Zootropolis', 'Tangled', 'Aladdin',
    'The Little Mermaid', 'Beauty and the Beast', 'Cinderella', 'Snow White and the Seven Dwarfs',
    'Sleeping Beauty', 'Mulan', 'Pinocchio', 'Dumbo', 'Bambi', 'Lady and the Tramp', 'Robin Hood',
    'The Aristocats', 'Hercules', 'Tarzan', 'Lilo and Stitch', 'Brave', 'WALL-E', 'Monsters Inc',
    'A Bug\'s Life', 'Luca', 'Turning Red', 'Soul', 'Onward', 'Elemental', 'Big Hero 6',
    'Wreck-It Ralph', 'Bolt', 'Minions', 'The Secret Life of Pets', 'Sing', 'Trolls',
    'The Lego Movie', 'Cloudy with a Chance of Meatballs', 'Rio', 'Happy Feet', 'Megamind',
    'Bee Movie', 'Shark Tale', 'The Boss Baby', 'Puss in Boots', 'Spider-Man', 'Batman', 'Superman',
    'Annie', 'Oliver!', 'The Greatest Showman', 'Grease', 'Hook', 'Jumanji', 'Back to the Future',
    'Honey I Shrunk the Kids', 'Free Willy', 'Beethoven', 'Stuart Little', 'The Karate Kid',
    'Cool Runnings', 'Space Jam', 'The Parent Trap', 'The Goonies', 'Flushed Away', 'Early Man',
    'My Neighbour Totoro', 'Sonic the Hedgehog'
  ],
  TV: [
    'Bake Off', 'Doctor Who', 'Strictly Come Dancing', 'Blue Peter', 'Top Gear',
    'Only Fools and Horses', 'Match of the Day', 'Ninja Warrior', 'Peppa Pig', 'Postman Pat',
    'Fireman Sam', 'Thomas the Tank Engine', 'Bob the Builder', 'Teletubbies', 'Shaun the Sheep',
    'Horrible Histories', 'Mr Tumble', 'Robot Wars', 'Rastamouse', 'Art Attack',
    'SpongeBob SquarePants', 'Scooby Doo', 'Tom and Jerry', 'The Simpsons', 'Danger Mouse',
    'Mr Bean', 'Gladiators', 'Dragons Den', 'The Repair Shop', 'The Crystal Maze',
    'Bluey', 'Paw Patrol', 'Hey Duggee', 'In the Night Garden', 'Something Special', 'Balamory',
    'Tweenies', 'Noddy', 'The Clangers', 'The Wombles', 'Pingu', 'Bananas in Pyjamas', 'Pokémon',
    'Newsround', 'Countryfile', 'Gardeners\' World', 'Antiques Roadshow', 'Blue Planet',
    'Springwatch', 'Top of the Pops', 'EastEnders', 'Coronation Street', 'Emmerdale', 'Neighbours',
    'Casualty', 'Dad\'s Army', 'Fawlty Towers', 'Blackadder', 'Grange Hill', 'Tracy Beaker',
    'Thunderbirds', 'Ben and Holly\'s Little Kingdom', 'Octonauts', 'Sarah and Duck', 'Numberblocks',
    'Mister Maker', 'Andy\'s Dinosaur Adventures', 'Britain\'s Got Talent',
    'The Great British Sewing Bee', 'The Masked Singer', 'Dancing on Ice', 'Changing Rooms',
    'Grand Designs', 'Total Wipeout', 'Record Breakers', 'The Muppet Show', 'Sesame Street',
    'Fraggle Rock', 'Power Rangers', 'Teenage Mutant Ninja Turtles'
  ],
  Book: [
    'Matilda', 'The Gruffalo', 'Treasure Island', 'The Hobbit', 'Robinson Crusoe',
    'Charlie and the Chocolate Factory', 'James and the Giant Peach', 'The BFG',
    'Fantastic Mr Fox', 'The Twits', 'The Lion the Witch and the Wardrobe', 'The Jungle Book',
    'Alice in Wonderland', 'The Wind in the Willows', 'Winnie the Pooh',
    'The Very Hungry Caterpillar', 'Where the Wild Things Are', 'The Railway Children',
    'The Secret Garden', 'Swallows and Amazons', 'Black Beauty', 'The Tiger Who Came to Tea',
    'Room on the Broom', 'The Worst Witch', 'Horrid Henry', 'Diary of a Wimpy Kid',
    'Stig of the Dump', 'The Iron Man', 'Around the World in Eighty Days', 'The Cat in the Hat',
    'Charlotte\'s Web', 'The Borrowers', 'The Tale of Peter Rabbit',
    'The Owl Who Was Afraid of the Dark', 'Dear Zoo', 'We\'re Going on a Bear Hunt',
    'The Snail and the Whale', 'Stick Man', 'Zog', 'The Smartest Giant in Town', 'Tiddler',
    'Superworm', 'The Highway Rat', 'Monkey Puzzle', 'Each Peach Pear Plum', 'Pippi Longstocking',
    'Heidi', 'Oliver Twist', 'Great Expectations', 'The Famous Five', 'The Secret Seven',
    'Malory Towers', 'The Magic Faraway Tree', 'The Little Prince', 'Gulliver\'s Travels',
    'Moby Dick', 'Frankenstein', 'Kidnapped', 'The Three Musketeers', 'War Horse',
    'Private Peaceful', 'Holes', 'Wonder', 'The Midnight Gang', 'Gangsta Granny', 'Billionaire Boy',
    'Mr Stink', 'The Witches', 'The Enormous Crocodile', 'George\'s Marvellous Medicine',
    'Danny the Champion of the World', 'Esio Trot', 'The Magic Finger', 'Percy Jackson',
    'Tom\'s Midnight Garden', 'The Enormous Turnip', 'The Little Red Hen',
    'Goldilocks and the Three Bears', 'The Three Little Pigs', 'Jack and the Beanstalk',
    'Little Red Riding Hood', 'Hansel and Gretel', 'Rapunzel', 'The Ugly Duckling',
    'The Princess and the Pea'
  ],
  Song: [
    'Happy Birthday', 'Twinkle Twinkle Little Star', 'YMCA', 'We Will Rock You',
    'Row Row Row Your Boat', 'The Hokey Cokey', 'The Wheels on the Bus',
    'Head Shoulders Knees and Toes', 'If You Are Happy and You Know It',
    'Old MacDonald Had a Farm', 'Incy Wincy Spider', 'I Am a Little Teapot', 'Five Little Ducks',
    'Ten Green Bottles', 'One Man Went to Mow', 'The Grand Old Duke of York',
    'London Bridge is Falling Down', 'Baa Baa Black Sheep', 'Humpty Dumpty',
    'Hickory Dickory Dock', 'Jack and Jill', 'Pop Goes the Weasel', 'Twist and Shout',
    'The Animals Went in Two by Two', 'You Are My Sunshine', 'The Macarena',
    'Singing in the Rain', 'Yellow Submarine', 'Walking on Sunshine', 'Here Comes the Sun',
    'Mary Had a Little Lamb', 'Hey Diddle Diddle', 'Little Bo Peep', 'Little Miss Muffet',
    'Hot Cross Buns', 'Oranges and Lemons', 'Ring a Ring o\' Roses', 'The Farmer\'s in His Den',
    'Polly Put the Kettle On', 'Sing a Song of Sixpence', 'Three Blind Mice', 'Rock-a-bye Baby',
    'Wind the Bobbin Up', 'Miss Polly Had a Dolly', 'Five Little Speckled Frogs',
    'Five Little Monkeys Jumping on the Bed', 'Ten in the Bed', 'Baby Shark', 'Let It Go',
    'Old King Cole', 'Doctor Foster', 'Little Jack Horner', 'Pat-a-Cake', 'This Old Man',
    'Here We Go Round the Mulberry Bush', 'Bingo', 'Five Currant Buns', 'Alice the Camel',
    'Dancing Queen', 'Don\'t Stop Me Now', 'Shake It Off', 'Happy', 'Can\'t Stop the Feeling',
    'Uptown Funk', 'Who Let the Dogs Out', 'I\'m a Believer', 'Stayin\' Alive', 'Hey Jude',
    'Octopus\'s Garden', 'All You Need Is Love', 'Let It Be', 'Somewhere Over the Rainbow',
    'The Lion Sleeps Tonight', 'Hakuna Matata', 'Under the Sea', 'A Whole New World',
    'How Far I\'ll Go', 'We Don\'t Talk About Bruno', 'Supercalifragilisticexpialidocious',
    'The Bare Necessities', 'I Just Can\'t Wait to Be King', 'You\'ve Got a Friend in Me',
    'Circle of Life', 'Let\'s Go Fly a Kite', 'Do-Re-Mi'
  ],
  Action: [
    'building a flat-pack wardrobe', 'walking a dog that will not walk',
    'carrying too many shopping bags', 'putting up a tent in the wind', 'trying to open a jar',
    'wrapping an awkward present', 'getting chewing gum off a shoe', 'parallel parking',
    'changing a duvet cover', 'steering a shopping trolley with a wonky wheel',
    'getting stuck halfway out of a jumper', 'blowing up a balloon until it goes pop',
    'eating a chip that is far too hot', 'untangling a pair of headphones',
    'doing up a tie for the first time', 'catching a spider under a glass to put it outside',
    'carrying a full mug of tea across a room', 'swatting a fly that keeps landing on you',
    'pulling on a pair of wet wellies', 'cleaning a window that is still smeary',
    'painting a ceiling and getting drips on your face', 'peeling a satsuma in one long piece',
    'hunting for your keys at the bottom of a deep bag',
    'skipping with a rope that keeps catching your feet',
    'washing up in rubber gloves that are too big', 'fishing the last crisp out of the packet',
    'running for a train and just missing it', 'threading a needle and missing every time',
    'icing a cake with a wobbly hand', 'folding a big map back up the way it was',
    'flipping a pancake', 'walking across an icy pavement', 'blowing bubbles',
    'building a sandcastle before the tide comes in', 'mowing the lawn',
    'planting a seed and watering it', 'hanging out the washing on a windy day', 'ironing a shirt',
    'hoovering under the sofa', 'making a bed', 'washing a car', 'changing a light bulb',
    'taking a selfie', 'posting a letter', 'walking on hot sand without shoes',
    'walking through deep mud', 'playing hide and seek', 'brushing a horse', 'milking a cow',
    'feeding the ducks', 'flying a kite', 'kneading bread dough', 'chopping onions and crying',
    'eating a big plate of spaghetti', 'eating a sandwich that is too big to bite',
    'drinking through a straw', 'licking an ice cream before it drips',
    'opening a window that is stuck', 'wading into a cold sea', 'pumping up a bike tyre',
    'squeezing onto a crowded bus', 'finding a seat in a dark cinema',
    'trying to sneeze and it will not come', 'putting on sun cream', 'lifting a very heavy rucksack',
    'climbing into a sleeping bag', 'rowing a boat', 'catching a boot on a fishing line',
    'hammering a nail and hitting your thumb', 'sawing a plank of wood', 'painting a fence',
    'hanging wallpaper', 'washing a dog that does not want a bath', 'carrying a sleeping baby',
    'pushing a pram up a hill', 'feeding a baby with a spoon', 'spinning a plate on a stick',
    'walking along a tightrope', 'standing still as a statue', 'conducting an orchestra',
    'playing the drums', 'playing the violin', 'playing the piano', 'playing the trumpet',
    'playing the guitar', 'singing into a hairbrush', 'dancing at a disco', 'sweeping the floor',
    'mopping a slippery floor', 'scrubbing a very dirty pan', 'setting the table',
    'carrying a tray of drinks', 'cracking an egg into a bowl', 'stirring a giant pot of soup',
    'typing a very long email', 'sending a text with cold fingers',
    'reading a newspaper in the wind', 'knocking over a line of dominoes',
    'making a paper aeroplane', 'putting on gloves that are too tight',
    'walking in shoes that are too big', 'trying on a hat in a mirror', 'sewing on a button',
    'hanging a picture straight', 'looking for the TV remote', 'trying to get a signal on a phone',
    'hailing a taxi', 'directing traffic', 'getting a splinter out',
    'stepping on a building brick in bare feet', 'eating a slice of lemon', 'digging a hole',
    'picking apples from a tree', 'watering the garden with a hose'
  ],
  Animal: [
    'a kangaroo', 'a penguin', 'an elephant', 'a monkey', 'a giraffe', 'a snake', 'a crab', 'a frog',
    'a chicken', 'a gorilla', 'a lion', 'a crocodile', 'a flamingo', 'a rabbit', 'a horse', 'an owl',
    'a bat', 'a butterfly', 'a spider', 'a bee', 'a duck', 'a dog', 'a cow', 'a pig', 'a sheep',
    'a tortoise', 'a snail', 'a seal', 'a dolphin', 'a shark', 'an octopus', 'a jellyfish',
    'a peacock', 'a sloth', 'a meerkat', 'a bear', 'a tiger', 'a camel', 'a squirrel', 'a chameleon',
    'a woodpecker', 'a caterpillar', 'a worm', 'a mouse'
  ],
  Sport: [
    'football', 'tennis', 'golf', 'cricket', 'rugby', 'basketball', 'netball', 'swimming', 'fencing',
    'archery', 'ten-pin bowling', 'darts', 'snooker', 'table tennis', 'badminton', 'canoeing',
    'sailing', 'surfing', 'skiing', 'snowboarding', 'ice skating', 'cycling', 'weightlifting',
    'horse riding', 'javelin', 'shot put', 'hurdles', 'long jump', 'a relay race', 'a sack race',
    'an egg and spoon race', 'a three-legged race', 'tug of war', 'hockey', 'baseball', 'volleyball',
    'karate', 'yoga', 'rock climbing', 'water polo', 'curling', 'boxing'
  ],
}

/* ONE ROUND, TWO GAMES. § */
/* NINETY AND A HUNDRED AND EIGHTY, ASKED FOR IN THOSE WORDS: § */
const ROUND_GAMES = {
  art: { secs: 90, deck: () => ART_DECK, name: 'Articulate',
         say: 'Describe it. Not the word, not a rhyme, not the initials.' },
  cha: { secs: 180, deck: () => CHA_DECK, name: 'Charades',
         say: 'Act it out. No words, no sounds, no pointing.' },
};

function roundClock_(secs) {
  const n = Math.max(0, secs | 0);
  return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
}

/* ONE STATE PER GAME, not one shared. Both cards can be on the screen at once — they are two pages
   of the same column — and a single state would have the second one wiping the first's clock. */
const roundAt = { art: null, cha: null };

function roundPick_(k) {
  /* THE CATEGORY IS CHOSEN FOR YOU, and that is the change the owner asked for: § */
  const deck = ROUND_GAMES[k].deck();
  const cats = Object.keys(deck);
  return cats[Math.floor(Math.random() * cats.length)];
}

function roundStop_(k) {
  const s = roundAt[k];
  if (s && s.timer) { clearInterval(s.timer); s.timer = 0; }
}

/* DRAWN FROM THE STATE, never patched by the handler that changed it — the `REEL_HELD` rule. § */
/* EVERY COPY OF THE CARD (Find draws one, a page ahead may hold another): an id names the first alone, so a press on the second changed nothing (owner, 12 Nov). */
function roundPaint(k) {
  const all = id => [...document.querySelectorAll('[id="' + id + '"]')];
  const cards = all(k + '-card'), saids = all(k + '-said'), lefts = all(k + '-left'), gots = all(k + '-got');
  cards.forEach((card, i) => roundPaintOne_(k, card, saids[i], lefts[i], gots[i]));
}
function roundPaintOne_(k, card, said, left, got) {
  const g = ROUND_GAMES[k];
  if (!card || !g) return;
  const s = roundAt[k];
  /* GOT IT AND PASS ARE DRAWN FROM THE START, greyed until Start (the owner, 6 Nov): never hidden, so nothing moves. */
  document.querySelectorAll('[data-do="rg-next"][data-g="' + k + '"]').forEach(b => b.setAttribute('aria-disabled', s && s.phase === 'go' ? 'false' : 'true'));
  if (!s || s.phase === 'idle') {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="rg-begin" data-g="${esc(k)}"`, html: `Start` })}`;
    if (said) said.textContent = g.say;
    if (left) left.textContent = roundClock_(g.secs);
    if (got) got.textContent = '0';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-cat-of">${esc(s.cat)}</p>`;
    if (said) said.textContent = 'Start again for another.';
    if (left) left.textContent = roundClock_(0);
    return;
  }
  card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
    <p class="art-word">${esc(s.word || '')}</p>`;
  if (said) said.textContent = g.say;
  if (left) left.textContent = roundClock_(s.left);
  if (got) got.textContent = String(s.score);
}

function roundNext_(k) {
  const s = roundAt[k];
  if (!s) return;
  /* DEALT FROM A SHUFFLED PILE, refilled when it empties, so one round cannot show a word twice — which is the whole reason a category does not have to be enormous § */
  if (!s.pile.length) s.pile = herdShuffle_(ROUND_GAMES[k].deck()[s.cat] || []);
  s.word = s.pile.pop() || '';
}

function initRound(k) {
  if (!$(k + '-card')) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
}

on('rg-begin', el => {
  const k = el.getAttribute('data-g');
  const g = ROUND_GAMES[k];
  if (!g) return;
  roundStop_(k);
  const cat = roundPick_(k);
  roundAt[k] = { phase: 'go', cat: cat, score: 0, left: g.secs, word: '',
                 pile: herdShuffle_(g.deck()[cat] || []), timer: 0 };
  roundNext_(k);
  roundAt[k].timer = setInterval(() => {
    const s = roundAt[k];
    if (!s || s.phase !== 'go') return;
    s.left--;
    if (s.left <= 0) { s.phase = 'done'; roundStop_(k); }
    roundPaint(k);
  }, 1000);
  roundPaint(k);
});

/* GOT IT AND PASS ARE THE SAME MOVE with one number different, so they are one handler — two would
   be two places to get "deal the next one" wrong. */
on('rg-next', el => {
  const k = el.getAttribute('data-g');
  const s = roundAt[k];
  if (!s || s.phase !== 'go') return;
  if (el.getAttribute('data-got') === '1') s.score++;
  roundNext_(k);
  roundPaint(k);
});

on('rg-again', el => {
  const k = el.getAttribute('data-g');
  if (!ROUND_GAMES[k]) return;
  roundStop_(k);
  roundAt[k] = null;
  roundPaint(k);
});

/* IMPOSTER — three or more people, one phone, one word that everybody knows but one of them. § */
const IMP_MIN = 3, IMP_MAX = 12;

/* A CARD IS WHAT ITS PICTURE SHOWS — A THING, A FACE, A GESTURE OR A SIGN — AND NEVER AN IDEA. § */
const IMP_DECK = {
  Food: { sym: '😋', cards: [
    '🍕 pizza', '🍔 burger', '🍟 chips', '🥪 sandwich', '🍝 spaghetti', '🌭 hot dog', '🍲 soup',
    '🍛 curry', '🍣 sushi', '🌮 tacos', '🍜 noodles', '🍚 rice', '🥟 dumplings', '🥧 pie',
    '🍗 chicken leg', '🍳 fried egg', '🌯 burrito', '🥙 kebab', '🥩 steak', '🍫 chocolate', '🍬 sweets',
    '🍭 lollipop', '🍪 cookie', '🧁 cupcake', '🍩 doughnut', '🍿 popcorn', '🍰 cake', '🧇 waffle',
    '🥞 pancakes', '🧆 falafel',
  ] },
  'Fruit and veg': { sym: '🥗', cards: [
    '🍎 apple', '🍌 banana', '🍊 orange', '🍓 strawberry', '🍇 grapes', '🥕 carrot',
    '🍉 watermelon', '🍍 pineapple', '🍅 tomato', '🥒 cucumber', '🍐 pear', '🍋 lemon', '🍒 cherry',
    '🥦 broccoli', '🌽 sweetcorn', '🥔 potato', '🥭 mango', '🍑 peach', '🥝 kiwi', '🥥 coconut',
    '🥬 lettuce', '🧅 onion', '🍄 mushroom', '🥑 avocado', '🌶️ chilli', '🍈 melon', '🧄 garlic',
    '🥜 peanuts', '🍠 sweet potato', '🍆 aubergine',
  ] },
  'In the kitchen': { sym: '🥘', cards: [
    '🍽️ plate', '🥣 bowl', '🥄 spoon', '🍴 cutlery', '🔪 knife', '🥢 chopsticks',
    '🥓 bacon', '☕ cup', '🥛 milk', '🥚 egg', '🧀 cheese', '🍞 bread', '🧈 butter', '🧂 salt',
    '🥫 tin', '🍯 honey', '🧊 ice cube', '🧃 juice box', '🍼 baby bottle', '🧽 sponge', '🚰 tap',
    '⏲️ timer', '🧯 fire extinguisher', '🥤 fizzy drink', '🥡 takeaway', '🥐 croissant', '🥯 bagel',
    '🥖 baguette', '🥨 pretzel', '🗑️ bin',
  ] },
  'At home': { sym: '🏠', cards: [
    '🛏️ bed', '🛋️ sofa', '🛁 bath', '📺 television', '🚪 door', '🪑 chair', '🚽 toilet', '🔑 key',
    '🧼 soap', '🧶 wool', '⏰ alarm clock', '🚿 shower', '🧻 toilet roll', '☎️ telephone',
    '⌨️ keyboard', '💻 laptop', '🖼️ picture', '✉️ letter', '📰 newspaper', '🧳 suitcase',
    '🪒 razor', '🕰️ clock', '💳 credit card', '🖨️ printer', '📦 parcel', '📱 mobile phone',
    '🧺 basket', '🖥️ computer', '📷 camera', '👪 family',
  ] },
  Toolbox: { sym: '🧰', cards: [
    '🔨 hammer', '🔧 spanner', '🔦 torch', '🔋 batteries', '💡 light bulb', '🔒 padlock',
    '🧱 brick', '🪓 axe', '🔍 magnifying glass', '⛓️ chain', '🔩 nuts and bolts', '⛏️ pickaxe',
    '🏗️ crane', '🥽 safety goggles', '🦺 hi-vis vest', '🚧 roadworks', '⚙️ cog', '🗜️ clamp',
    '🛢️ barrel', '🧲 magnet', '🔌 plug', '📌 drawing pin', '🧷 safety pin', '⚖️ scales',
    '⛑️ helmet', '📏 ruler', '✂️ scissors', '🖌️ paintbrush', '⏱️ stopwatch', '🧭 compass',
  ] },
  Clothes: { sym: '👚', cards: [
    '🧦 socks', '🧕 headscarf', '👖 jeans', '👗 dress', '🩳 shorts', '🧥 coat', '👢 boots',
    '👟 trainers', '👞 shoes', '🧣 scarf', '🧤 gloves', '🧢 cap', '🕶️ sunglasses', '👓 glasses',
    '🩱 swimming costume', '🩲 pants', '👔 tie', '👠 high heels', '⌚ watch', '💍 ring',
    '👜 handbag', '👛 purse', '🎩 top hat', '👘 kimono', '🥻 sari', '👳 turban', '🥾 walking boots',
    '🎽 vest', '🥼 lab coat', '🎀 bow',
  ] },
  'The body': { sym: '🧍', cards: [
    '👃 nose', '👁️ eye', '👂 ear', '👄 mouth', '👅 tongue', '🦷 tooth', '🧠 brain', '🦴 bone',
    '💀 skull', '🦵 leg', '🦶 foot', '👣 footprints', '✋ hand', '😷 face mask', '☝️ finger', '✊ fist',
    '💪 muscles', '💅 nails', '❤️ heart', '🩸 blood', '🧔 beard', '👩‍🦱 curly hair',
    '👩‍🦰 red hair', '👨‍🦲 bald head', '🩹 plaster', '💉 injection', '🦠 germs', '💊 medicine',
    '🩺 stethoscope', '🦻 hearing aid',
  ] },
  Feelings: { sym: '🎭', cards: [
    '😀 happy', '😢 sad', '😭 crying', '😂 laughing', '😠 angry', '😨 scared', '😱 screaming',
    '😮 surprised', '😴 asleep', '🤢 sick', '🤒 poorly', '🤕 hurt', '🥵 hot', '🥶 cold', '😵 dizzy',
    '😍 in love', '😎 cool', '🤪 silly', '🤔 thinking', '😟 worried', '😳 embarrassed',
    '🤩 excited', '😒 grumpy', '😑 bored', '😬 nervous', '😜 cheeky', '🤧 sneezing', '🥱 yawning',
    '🤫 quiet', '🤨 suspicious',
  ] },
  Actions: { sym: '🚶', cards: [
    '🏃 running', '🛌 sleeping', '🛀 having a bath', '👋 waving', '✍️ writing',
    '🤳 taking a selfie', '🤗 hugging', '🤷 shrugging', '🤦 facepalm', '🙇 bowing', '🧎 kneeling',
    '👉 pointing', '👊 fist bump', '🙌 cheering', '🤞 fingers crossed', '👌 OK sign',
    '✌️ peace sign', '👎 thumbs down', '🗣️ talking', '💆 massage', '🙏 praying',
    '😘 blowing a kiss', '🧘 yoga', '🤝 shaking hands', '🙅 saying no', '💇 getting a haircut',
    '👍 thumbs up', '⛹️ bouncing a ball', '😉 winking', '👏 clapping',
  ] },
  People: { sym: '👥', cards: [
    '👩‍🏫 teacher', '👨‍⚕️ doctor', '👩‍🚒 firefighter', '👮 police officer', '👨‍🌾 farmer',
    '👩‍🍳 chef', '👨‍✈️ pilot', '👷 builder', '👩‍🔬 scientist', '👨‍🎨 artist', '👩‍🔧 mechanic',
    '🕵️ detective', '👨‍⚖️ judge', '👨‍💼 office worker', '👩‍💻 computer programmer', '👩‍🏭 welder',
    '💂 soldier', '🤡 clown', '🤠 cowboy', '🤹 juggler', '🏇 jockey', '👨 man', '👨‍🎤 rock star',
    '👶 baby', '👦 boy', '👧 girl', '👵 grandma', '👴 grandad', '👩‍🎓 student', '🤰 pregnant woman',
  ] },
  'Wild animals': { sym: '🐯', cards: [
    '🐘 elephant', '🦁 lion', '🐒 monkey', '🦒 giraffe', '🦧 orangutan', '🦓 zebra', '🐼 panda',
    '🦘 kangaroo', '🐊 crocodile', '🐻 bear', '🦛 hippo', '🦏 rhino', '🐨 koala', '🐪 camel',
    '🦊 fox', '🦉 owl', '🐿️ squirrel', '🐗 boar', '🦇 bat', '🦡 badger', '🦅 eagle',
    '🦩 flamingo', '🦍 gorilla', '🐃 buffalo', '🦢 swan', '🦥 sloth', '🦨 skunk', '🦦 otter',
    '🦝 raccoon', '🐆 leopard',
  ] },
  'Pets and farm animals': { sym: '🐾', cards: [
    '🐕 dog', '🐈 cat', '🐇 rabbit', '🐹 hamster', '🐟 fish', '🐎 horse', '🐄 cow', '🐖 pig',
    '🐑 sheep', '🐔 chicken', '🦆 duck', '🐁 mouse', '🐤 chick', '🐐 goat', '🐦 bird', '🦜 parrot',
    '🐀 rat', '🦃 turkey', '🐂 bull', '🐓 cockerel', '🦙 llama', '🐏 ram', '🦎 lizard', '🐍 snake',
    '🕊️ dove', '🦮 guide dog', '🐩 poodle', '🦚 peacock', '🐢 tortoise', '🐣 hatching chick',
  ] },
  'At the seaside': { sym: '🌊', cards: [
    '🦈 shark', '🐬 dolphin', '🐳 whale', '🐙 octopus', '🦀 crab', '🦞 lobster', '🦐 prawn',
    '🦑 squid', '🐡 pufferfish', '🐠 tropical fish', '🦪 oyster', '🐚 shell', '🐧 penguin',
    '🏖️ beach', '🏝️ island', '🌅 sunset', '🤿 snorkel', '🎢 roller coaster', '⚓ anchor', '🎣 fishing rod',
    '⛵ sailing boat', '🛥️ motor boat', '🎡 big wheel', '🎠 merry-go-round', '🏊 swimming', '🏄 surfing',
    '🍦 ice cream', '👙 bikini', '👒 sun hat', '👡 sandals',
  ] },
  Nature: { sym: '🏞️', cards: [
    '🌋 volcano', '⛰️ mountain', '🏜️ desert', '🌳 tree', '🌲 pine tree', '🌴 palm tree',
    '🌵 cactus', '🌸 blossom', '🌻 sunflower', '🌹 rose', '🌷 tulip', '🌼 flower', '🦂 scorpion',
    '🌾 wheat', '🍂 autumn leaves', '🦔 hedgehog', '🍀 four-leaf clover', '🌰 conker', '🌱 seedling',
    '🔥 fire', '🐝 bee', '🐞 ladybird', '🦋 butterfly', '🐜 ant', '🐌 snail', '🐛 caterpillar',
    '🦗 grasshopper', '🕷️ spider', '🕸️ cobweb', '🦟 mosquito',
  ] },
  'Space and weather': { sym: '🔭', cards: [
    '☀️ sun', '🌙 moon', '🌕 full moon', '☂️ umbrella', '⭐ star', '🌠 shooting star', '☄️ comet',
    '🪐 Saturn', '🌍 Earth', '🚀 rocket', '🛸 flying saucer', '🛰️ satellite', '👩‍🚀 astronaut',
    '👽 alien', '🌌 Milky Way', '📡 satellite dish', '🌈 rainbow', '☁️ cloud', '🌧️ rain', '🌨️ snow',
    '❄️ snowflake', '⚡ lightning', '⛈️ thunderstorm', '🌪️ tornado', '🌬️ wind', '🌫️ fog',
    '🌡️ thermometer', '☃️ snowman', '🌄 sunrise', '💧 raindrop',
  ] },
  'Fairy tales': { sym: '🧚', cards: [
    '🏰 castle', '🐉 dragon', '🧙‍♀️ witch', '🧙‍♂️ wizard', '👻 ghost', '🦄 unicorn', '🧜‍♀️ mermaid',
    '👸 princess', '🤴 prince', '👑 crown', '⚔️ sword', '🛡️ shield', '🏹 bow and arrow', '🐺 wolf',
    '🧞 genie', '🧝 elf', '🧛 vampire', '🧟 zombie', '🤥 Pinocchio', '🧹 broomstick',
    '🔮 crystal ball', '🗡️ dagger', '💎 diamond', '🗝️ old key', '📜 scroll', '🏴‍☠️ pirate flag',
    '🐸 frog', '💰 money bag', '⚰️ coffin', '👹 monster',
  ] },
  Countries: { sym: '🌐', cards: [
    '🏴󠁧󠁢󠁥󠁮󠁧󠁿 England', '🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland', '🏴󠁧󠁢󠁷󠁬󠁳󠁿 Wales', '🇫🇷 France', '🇪🇸 Spain', '🇮🇪 Ireland',
    '🇺🇸 America', '🇦🇺 Australia', '🇮🇹 Italy', '🇨🇳 China', '🇯🇵 Japan', '🇮🇳 India',
    '🇪🇬 Egypt', '🇩🇪 Germany', '🇨🇦 Canada', '🇯🇲 Jamaica', '🇲🇽 Mexico', '🇬🇷 Greece',
    '🇧🇷 Brazil', '🇨🇭 Switzerland', '🇳🇱 Holland', '🇳🇿 New Zealand', '🇵🇱 Poland',
    '🇿🇦 South Africa', '🇰🇪 Kenya', '🇵🇹 Portugal', '🇵🇰 Pakistan', '🇳🇬 Nigeria',
    '🇹🇭 Thailand', '🇵🇪 Peru',
  ] },
  'Around town': { sym: '🏘️', cards: [
    '🏥 hospital', '🛒 supermarket', '🏫 school', '⛪ church', '🚏 bus stop', '🏨 hotel',
    '🏤 post office', '🎪 circus', '📮 postbox', '🛍️ shopping bags', '🚦 traffic lights', '🏦 bank',
    '🏛️ museum', '🏪 corner shop', '🏕️ campsite', '⛽ petrol station', '🚉 train station',
    '🏟️ stadium', '⛲ fountain', '🅿️ car park', '🏭 factory', '🕌 mosque', '🕍 synagogue',
    '🛕 temple', '🏧 cash machine', '🚻 public toilets', '🏙️ city', '🏢 office block',
    '🌉 bridge', '💈 barber’s',
  ] },
  Sport: { sym: '🏅', cards: [
    '⚽ football', '🎾 tennis', '🏏 cricket', '🏉 rugby', '🏀 basketball', '🥊 boxing', '⛳ golf',
    '🥋 karate', '🏑 hockey', '🏒 ice hockey', '🏸 badminton', '⚾ baseball',
    '🏈 American football', '🏐 volleyball', '🏆 trophy', '🤸 gymnastics', '🥍 lacrosse',
    '⛸️ ice skating', '⛷️ skiing', '🏂 snowboarding', '🥌 curling', '🤺 fencing',
    '🏋️ weightlifting', '🚣 rowing', '🚴 cycling', '🧗 climbing', '🤼 wrestling',
    '🚵 mountain biking', '🤾 handball', '🤽 water polo',
  ] },
  School: { sym: '🎒', cards: [
    '✏️ pencil', '🖊️ pen', '🖋️ fountain pen', '🖍️ crayons', '🎨 paints', '📖 book', '📓 notebook',
    '⚛️ atom', '📝 notepad', '💯 hundred', '🌟 gold star', '🔤 alphabet', '🔢 numbers',
    '🙋 hands up', '🔬 microscope', '🧪 test tube', '🧬 DNA', '🗺️ map', '📎 paper clip',
    '📋 clipboard', '📅 calendar', '🔖 bookmark', '🧮 abacus', '📐 set square', '📊 bar chart',
    '📈 graph', '📁 folder', '🍱 lunchbox', '🧫 petri dish', '🏷️ label',
  ] },
  Transport: { sym: '🚥', cards: [
    '🚗 car', '🚕 taxi', '🚓 police car', '🏎️ racing car', '🚌 bus', '🚐 minibus', '🚛 lorry',
    '🚨 siren', '🚜 tractor', '🚒 fire engine', '🚑 ambulance', '🚲 bicycle', '🏍️ motorbike',
    '🛵 moped', '🛺 tuk-tuk', '🚂 train', '🚅 bullet train', '🚇 underground', '🚝 monorail',
    '🚋 tram', '🛤️ train track', '✈️ aeroplane', '🚁 helicopter', '🚡 cable car', '🛶 canoe',
    '🚤 speedboat', '⛴️ ferry', '🛳️ cruise ship', '🚢 ship', '🦽 wheelchair',
  ] },
  Celebrations: { sym: '🎈', cards: [
    '🎂 birthday cake', '🎁 presents', '🐰 Easter bunny', '🥳 party', '🎊 confetti', '🎄 Christmas',
    '🎅 Father Christmas', '🤶 Mrs Claus', '👼 angel', '🎃 Halloween', '💌 love letter',
    '💒 wedding', '👰 bride', '🤵 groom', '💐 bouquet', '🎆 fireworks', '🎇 sparkler',
    '🧨 firecracker', '🪔 Diwali', '🕎 Hanukkah', '🏮 lantern', '🕺 disco', '🎓 graduation',
    '🦌 reindeer', '✨ sparkles', '💘 Valentine’s Day', '💏 kiss', '🎖️ medal', '🕯️ candle',
    '💑 couple',
  ] },
  'Toys and games': { sym: '🎲', cards: [
    '🧸 teddy bear', '🎎 dolls', '🤖 robot', '🦕 dinosaur', '🦖 T-Rex', '🦸 superhero', '🪁 kite',
    '🪀 yo-yo', '🥎 ball', '🥏 frisbee', '🔫 water pistol', '🛷 sledge', '🪂 parachute',
    '🧩 jigsaw', '♟️ chess', '🃏 playing cards', '🎮 controller', '🕹️ joystick', '🎱 pool',
    '🛹 skateboard', '🛴 scooter', '🎳 skittles', '🏓 table tennis', '🎯 dartboard', '🦹 villain',
    '👾 space invader', '♠️ spades', '♣️ clubs', '⛺ tent', '🥅 goal',
  ] },
  Music: { sym: '🎶', cards: [
    '🎸 guitar', '🥁 drums', '🎹 piano', '🎻 violin', '🎺 trumpet', '🎷 saxophone', '🪕 banjo',
    '📯 horn', '🔔 bell', '🔁 repeat', '🎤 microphone', '🎧 headphones', '📻 radio', '💿 CD',
    '🔊 speaker', '📣 megaphone', '⏩ fast forward', '💃 dancer', '🎼 treble clef',
    '👩‍🎤 pop star', '🩰 ballet', '🎫 ticket', '▶️ play button', '⏸️ pause button', '🔇 mute',
    '⏹️ stop button', '🤘 rock on', '⏪ rewind', '🔀 shuffle', '⏺️ record button',
  ] },
  'Signs and symbols': { sym: '🔣', cards: [
    '🛑 stop', '⛔ no entry', '⚠️ warning', '♻️ recycling', '#️⃣ hashtag', '🚼 baby changing',
    '🚭 no smoking', '📵 no phones', '🚳 no bikes', '🚸 children crossing', '✅ tick', '❌ cross',
    '❓ question mark', '❗ exclamation mark', '➕ plus', '➖ minus', '🟥 square', '➗ divide',
    '⭕ circle', '🆘 SOS', '🆕 new', '🏁 chequered flag', '🏳️ white flag', 'ℹ️ information',
    '⬆️ arrow', '🔺 triangle', '♾️ infinity', '☢️ radioactive', '🚮 litter', '📶 signal',
  ] },
};

/* EVERY CARD AS `[category, word, picture]`, read out of '🍕 pizza' at its first space — see "a card is written as it is drawn" over `IMP_DECK`. § */
function impCards_() {
  const all = [];
  Object.keys(IMP_DECK).forEach(c => ((IMP_DECK[c] || {}).cards || []).forEach(s => {
    const str = String(s), sp = str.indexOf(' ');
    const sym = sp > 0 ? str.slice(0, sp) : '';
    all.push(sym && !/[A-Za-z]/.test(sym) ? [c, str.slice(sp + 1), sym] : [c, str, '']);
  }));
  return all;
}

/* ONE PILE OF EVERY (category, word) PAIR, shuffled once and dealt from the top, so no word comes round twice until the whole deck has — which is the same § */
let IMP_PILE = [];
function impDraw_() {
  if (!IMP_PILE.length) IMP_PILE = herdShuffle_(impCards_());
  return IMP_PILE.pop();
}

/* HOW MANY PLAY IS KEPT ON THE DEVICE, because it is the same four people at the same table next
   week. The try is the house rule for storage: a browser that refuses it still gets a game. */
function impCount_(n) {
  if (n !== undefined) {
    try { localStorage.setItem('imp-n', String(n)); } catch (e) {}
    return n;
  }
  let v = 4;
  try { v = parseInt(localStorage.getItem('imp-n'), 10) || 4; } catch (e) {}
  return Math.max(IMP_MIN, Math.min(IMP_MAX, v));
}

/* ---------- READ ALOUD, FOR THE ONES WHO CANNOT READ YET § */
function impCanSay_() { return canSay_(); }
function impAloud_(on) {
  if (on !== undefined) {
    try { localStorage.setItem('imp-aloud', on ? '1' : '0'); } catch (e) {}
    return on;
  }
  let v = false;
  try { v = localStorage.getItem('imp-aloud') === '1'; } catch (e) {}
  return v && impCanSay_();
}
function impHush_() { hush_(); }
/* THE VOICE IS `say_`'s (shell.js), shared with a question's Read aloud since 394; quieter here, because the phone is passed round a table. */
function impSay_(text) {
  if (!impAloud_()) return;
  say_(text, { rate: 0.9, volume: 0.6 });
}

/* `phase` IS ONE OF idle · deal · play · reveal, and `at` is whose turn it is to look while dealing. § */
const IMP_IDLE = () => ({ phase: 'idle', n: 0, at: 0, shown: false, imp: 0, first: 0, cat: '', word: '',
                          sym: '', catSym: '' });
let IMP = IMP_IDLE();

/* ---------- A SECOND TAP IS NOT A SECOND PRESS § */
const IMP_GAP = 600;
let IMP_PRESSED = -Infinity;
function impTooSoon_(e) {
  if (!e) return false;
  try { return performance.now() - IMP_PRESSED < IMP_GAP; } catch (err) { return false; }
}
function impPressed_(e) {
  if (!e) return;
  try { IMP_PRESSED = performance.now(); } catch (err) {}
}

function impDeal_(n) {
  const [cat, word, sym] = impDraw_();
  IMP = { phase: 'deal', n: n, at: 0, shown: false,
          imp: Math.floor(Math.random() * n), first: Math.floor(Math.random() * n),
          cat: cat, word: word, sym: sym || '', catSym: (IMP_DECK[cat] || {}).sym || '' };
}

/* THE SLOTS EVERY SCREEN FROM THE FIRST HAND-OVER TO "Reveal" IS DRAWN IN — see "the big line and the button do not move" above: § */
function impFrame_(sym, big, small, button, foot, imp) {
  return `<p class="imp-sym${imp ? ' is-imp' : ''}" aria-hidden="true">${esc(sym)}</p>
    <p class="art-word imp-big">${esc(big)}</p>
    <p class="art-cat-of imp-lab">${esc(small)}</p>
    ${button}${foot || ''}`;
}
/* THE MARK BESIDE THE WORD, NOT INSTEAD OF IT — `tile_`'s own rule turned round, because a gold button that a reader reads and a non-reader recognises has to § */
const impShow_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-show"`, html: `${tileIcon_('show')}<span>Show</span>` })}`;
const impHideBtn_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-hide"`, html: `${tileIcon_('hide')}<span>Hide</span>` })}`;
const impReveal_ = () => `${tile_({ form: true, look: `art-go imp-go`, attrs: `data-do="imp-reveal"`, html: `<span>Reveal</span>` })}`;

/* ---------- READ ALOUD IS A TILE, THE REELS' SOUND TILE'S OWN PAIR § */
const impAloudTile_ = on => tile_({ icon: on ? 'sound' : 'mute', label: on ? 'Read aloud on' : 'Read aloud off',
                                    act: 'imp-aloud', cls: 'imp-aloud', on: !!on, pressed: !!on });

/* DRAWN FROM THE STATE, the `REEL_HELD` rule — the handlers change `IMP` and ask for a paint, and nothing is ever patched onto the element. § */
function impPaint() {
  const card = $('imp-card'), acts = $('imp-acts');
  if (!card) return;
  const s = IMP;
  const player = i => 'Player ' + (i + 1);
  if (acts) acts.innerHTML = '';
  if (s.phase === 'idle') {
    const n = impCount_();
    const on = impAloud_();
    card.innerHTML = `<p class="art-cat-of">Players</p>
      <div class="imp-count">
        ${tile_({ form: true, look: `imp-step`, attrs: `data-do="imp-count" data-d="-1" aria-label="One player fewer"           ${n <= IMP_MIN ? 'disabled' : ''}`, html: `&minus;` })}
        <span class="art-score" id="imp-n">${n}</span>
        ${tile_({ form: true, look: `imp-step`, attrs: `data-do="imp-count" data-d="1" aria-label="One player more"           ${n >= IMP_MAX ? 'disabled' : ''}`, html: `+` })}
      </div>
      ${impCanSay_() ? impAloudTile_(on) : ''}
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="imp-begin"`, html: `Deal` })}`;
    return;
  }
  const aloud = impAloud_();
  const room = aloud ? '<span class="imp-foot" aria-hidden="true"></span>' : '';
  if (s.phase === 'deal' && !s.shown) {
    card.innerHTML = impFrame_('', player(s.at), '', impShow_(), room);
    return;
  }
  /* THE IMPOSTER'S CARD CARRIES THE CATEGORY'S PICTURE where everybody else's carries the word's — see "every card has a picture" above: § */
  if (s.phase === 'deal') {
    const me = s.at === s.imp;
    card.innerHTML = impFrame_(me ? s.catSym : s.sym, me ? 'Imposter' : s.word, me ? s.cat : '', impHideBtn_(),
      aloud ? tile_({ icon: 'speak', label: 'Listen', act: 'imp-listen', tone: 'listen' }) : '', me);
    return;
  }
  if (s.phase === 'play') {
    card.innerHTML = impFrame_(s.catSym, player(s.first) + ' starts', s.cat, impReveal_(), room);
    return;
  }
  /* THE REVEAL: who, and the word with its picture. § */
  card.innerHTML = `<p class="art-over">Imposter</p>
    <p class="art-score">${esc(player(s.imp))}</p>
    <p class="imp-sym" aria-hidden="true">${esc(s.sym)}</p>
    <p class="art-word">${esc(s.word)}</p>`;
  if (acts) {
    acts.innerHTML = `${tile_({ form: true, label: 'Deal', act: 'imp-again' })}
      ${tile_({ form: true, label: 'Players', act: 'imp-players', kind: 'quiet' })}`;
  }
}

function initImposter() {
  if (!$('imp-card')) return;
  impPaint();
}

/* A WORD LEFT UP WHEN THE COLUMN GOES IS A WORD THE NEXT PERSON SEES, so leaving hides it. § */
function impHide_() {
  impHush_();
  /* AND REPAINTED, not just forgotten: the column is still in the document off to one side, so a
     word left in its markup is a word the next repaint of anything is not obliged to remove. */
  if (IMP.phase === 'deal' && IMP.shown) { IMP.shown = false; impPaint(); }
}

on('imp-count', el => {
  const d = parseInt(el.getAttribute('data-d'), 10) || 0;
  impCount_(Math.max(IMP_MIN, Math.min(IMP_MAX, impCount_() + d)));
  impPaint();
});
on('imp-aloud', () => { impAloud_(!impAloud_()); impPaint(); });
on('imp-begin', (el, e) => { impHush_(); impPressed_(e); impDeal_(impCount_()); impPaint(); });
/* SHOW, HIDE AND REVEAL TAKE `(el, e)` FOR `impTooSoon_` — see "a second tap is not a second press" —
   and so do the reveal's Deal and Players, below. */
on('imp-show', (el, e) => {
  if (IMP.phase !== 'deal' || IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = true;
  impPaint();
});
/* THE ONLY PLACE ANYTHING IS SPOKEN, and only with the card up — so only by the person who pressed Show. § */
on('imp-listen', () => {
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  impHush_();
  impSay_(IMP.at === IMP.imp ? 'Imposter' : String(IMP.word));
});
/* HUSHED BEFORE THE GUARD, so a second tap that is ignored still stops the voice — which is never
   wrong when the phone may be on its way to somebody else. */
on('imp-hide', (el, e) => {
  impHush_();
  if (IMP.phase !== 'deal' || !IMP.shown) return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP.shown = false;
  if (IMP.at < IMP.n - 1) IMP.at++;
  else IMP.phase = 'play';
  impPaint();
});
/* GUARDED BEFORE THE HUSH, the other way round from Hide. § */
on('imp-reveal', (el, e) => {
  if (IMP.phase !== 'play') return;
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impHush_();
  IMP.phase = 'reveal';
  impPaint();
});
/* `imp-again` IS THE REVEAL'S "Deal" — it was "Play again" until the 11 Oct trim — and deals for the same number of players without going back through the setup § */
on('imp-again', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  impDeal_(IMP.n || impCount_());
  impPaint();
});
on('imp-players', (el, e) => {
  impHush_();
  if (impTooSoon_(e)) return;
  impPressed_(e);
  IMP = IMP_IDLE();
  impPaint();
});

/* FOUR CLASSROOM GAMES — Just a Minute, Taboo, Hot Seat and 20 Questions. § */
/* ---------- THE DECKS § */
const JAM_DECK = [
  'My perfect Saturday', 'The best invention ever', 'Breakfast', 'My dream holiday',
  'Rainy days', 'Forests', 'Learning to ride a bike', 'Space travel', 'The perfect sandwich',
  'Why homework exists', 'Being the youngest', 'Being the oldest', 'Snow days', 'Board games',
  'The seaside', 'The perfect pet', 'Pets I would like', 'Things that make me laugh', 'Ice cream flavours',
  'Superheroes', 'If I ruled the world', 'Inventing a new sport', 'My bedroom', 'Going underground',
  'The smell of rain', 'Shoes', 'Grandparents', 'Camping', 'The moon', 'Wild animals', 'Nature walks',
  'Video games', 'Bath time', 'Autumn leaves', 'Sleep', 'Musical instruments',
  'The journey to school', 'Tidying up', 'Splashing about', 'Animals in the sea', 'Animals at night', 'The ocean floor',
  'Trees', 'My favourite colour', 'Hats', 'Birds in the garden', 'Things I would invent', 'Time travel',
  'Being invisible for a day', 'Flying cars', 'The best smell in the world', 'Cooking',
  'Gardening', 'Maths', 'Why we go to school', 'My favourite animal', 'Mobile phones', 'Tiny things', 'The sun',
  'Mountains', 'Rivers', 'Treasure', 'Things that need batteries', 'A day without screens', 'Ghost stories', 'The Romans',
  'The ancient Egyptians', 'Things that fly', 'Farm animals', 'Big cats', 'The jungle', 'The Arctic',
  'My best friend', 'Lucky things', 'Keeping a secret', 'Making new friends', 'Being brave', 'Things I am good at', 'Something I would like to learn', 'Old toys', 'Staying up late',
  'Farms', 'Circuses', 'Theme parks', 'Roller coasters', 'Running', 'Dancing', 'Singing',
  'Drawing', 'Reading', 'Writing stories', 'Comics', 'Cartoons', 'Haircuts', 'Teeth',
  'My favourite book', 'Manners', 'Shopping', 'Money', 'Saving up', 'Pocket money', 'Chores', 'Weather',
  'Thunder', 'Windy days', 'Summer holidays', 'The first day of school', 'Lost property',
  'Lunchtime', 'Packed lunches', 'School dinners', 'Digging in the garden', 'Origami',
  'Lego', 'Slime', 'Magic tricks', 'Quiet places', 'Building a den', 'Picnics', 'Big cities',
  'Bread', 'Cheese', 'Getting up in the morning', 'Vegetables I like', 'Vegetables I do not like', 'Fruit',
  'Cereal', 'Toast', 'Soup', 'Puddings', 'Sweets', 'Biscuits', 'My best day ever',
  'The worst present I ever got', 'What I want to be when I grow up', 'Holidays at home',
  'Car journeys', 'Aeroplanes', 'Boats', 'Buses', 'Lazy Sundays', 'Tall buildings', 'Museums',
  'Football boots', 'Pet fish', 'My favourite film', 'Cats', 'Sports day', 'Hamsters', 'School trips',
  'Fairy tales', 'People I look up to', 'Bugs in the garden', 'Stars', 'Planets', 'Saving the planet', 'Swimming lessons',
  'Mysteries', 'Kings and queens', 'Puzzles', 'Myths and legends', 'Numbers', 'Shapes', 'Team games',
  'Hot places', 'Seasons', 'Winter', 'Spring', 'Summer', 'Autumn',
];

/* TABOO: THE WORD, THEN THE FIVE YOU MAY NOT SAY. The five are the words anybody would reach for
   first — which is the whole game — so they are the obvious ones, not the clever ones. */
const TABOO_DECK = [
  ['pizza', 'cheese', 'Italy', 'slice', 'tomato', 'topping'],
  ['library', 'books', 'borrow', 'quiet', 'read', 'shelves'],
  ['birthday', 'cake', 'candles', 'party', 'present', 'age'],
  ['snowman', 'snow', 'carrot', 'winter', 'build', 'melt'],
  ['space suit', 'space', 'astronaut', 'helmet', 'wear', 'moon'],
  ['dinosaur', 'extinct', 'T. rex', 'fossil', 'reptile', 'Jurassic'],
  ['penalty kick', 'football', 'goal', 'spot', 'shoot', 'keeper'],
  ['eye patch', 'pirate', 'eye', 'cover', 'black', 'one'],
  ['toothpaste', 'teeth', 'brush', 'tube', 'mint', 'white'],
  ['volcanic eruption', 'lava', 'mountain', 'explode', 'ash', 'hot'],
  ['cornflakes', 'cereal', 'breakfast', 'milk', 'bowl', 'corn'],
  ['ice skates', 'ice', 'rink', 'blades', 'skate', 'boots'],
  ['jelly beans', 'sweets', 'jelly', 'beans', 'colourful', 'chewy'],
  ['rainforest', 'trees', 'Amazon', 'jungle', 'wet', 'animals'],
  ['homework', 'school', 'teacher', 'evening', 'worksheet', 'due'],
  ['pencil case', 'pens', 'school', 'zip', 'bag', 'pencils'],
  ['hula hoop', 'hips', 'spin', 'circle', 'plastic', 'wiggle'],
  ['cobweb', 'spider', 'web', 'dust', 'corner', 'sticky'],
  ['bicycle', 'pedal', 'wheels', 'ride', 'helmet', 'bike'],
  ['popcorn', 'cinema', 'corn', 'pop', 'butter', 'snack'],
  ['ghost', 'scary', 'haunted', 'boo', 'sheet', 'spirit'],
  ['castle', 'king', 'tower', 'moat', 'drawbridge', 'stone'],
  ['rocket', 'space', 'launch', 'blast off', 'astronaut', 'fly'],
  ['dragon', 'fire', 'wings', 'breathe', 'myth', 'scales'],
  ['sticky tape', 'stick', 'roll', 'clear', 'wrap', 'Sellotape'],
  ['lifejacket', 'boat', 'float', 'water', 'safety', 'wear'],
  ['pyjamas', 'bed', 'sleep', 'night', 'wear', 'clothes'],
  ['zebra', 'stripes', 'horse', 'Africa', 'black', 'white'],
  ['scrambled eggs', 'eggs', 'breakfast', 'toast', 'mix', 'yellow'],
  ['hospital', 'doctor', 'nurse', 'ill', 'ward', 'ambulance'],
  ['combine harvester', 'farm', 'wheat', 'field', 'machine', 'crops'],
  ['robot', 'machine', 'metal', 'beep', 'computer', 'program'],
  ['unicorn', 'horn', 'horse', 'magic', 'rainbow', 'myth'],
  ['scuba tank', 'diving', 'air', 'underwater', 'oxygen', 'back'],
  ['raincoat', 'rain', 'wet', 'coat', 'hood', 'waterproof'],
  ['throne', 'king', 'queen', 'chair', 'royal', 'sit'],
  ['carrot', 'orange', 'vegetable', 'rabbit', 'root', 'eat'],
  ['magnet', 'attract', 'metal', 'fridge', 'north', 'pull'],
  ['tape measure', 'measure', 'metres', 'long', 'ruler', 'centimetres'],
  ['skeleton', 'bones', 'body', 'skull', 'Halloween', 'ribs'],
  ['cocoon', 'caterpillar', 'butterfly', 'silk', 'change', 'wrap'],
  ['train', 'track', 'station', 'carriage', 'railway', 'driver'],
  ['safari', 'Africa', 'animals', 'jeep', 'lions', 'wild'],
  ['sunflower', 'yellow', 'tall', 'seeds', 'petals', 'flower'],
  ['bathtub', 'water', 'bubbles', 'wash', 'bathroom', 'soak'],
  ['honey', 'bee', 'sweet', 'sticky', 'jar', 'golden'],
  ['clock', 'time', 'hands', 'tick', 'hour', 'wall'],
  ['moustache', 'face', 'hair', 'lip', 'beard', 'shave'],
  ['lettuce', 'salad', 'green', 'leaves', 'vegetable', 'rabbit'],
  ['treasure map', 'X', 'pirate', 'dig', 'gold', 'island'],
  ['microscope', 'small', 'lens', 'science', 'look', 'cells'],
  ['banana', 'yellow', 'fruit', 'peel', 'monkey', 'bunch'],
  ['scarecrow', 'farm', 'birds', 'straw', 'field', 'crows'],
  ['roller blades', 'skates', 'wheels', 'roll', 'boots', 'skating'],
  ['suit of armour', 'knight', 'metal', 'wear', 'castle', 'protect'],
  ['lemon', 'yellow', 'sour', 'fruit', 'juice', 'citrus'],
  ['firework', 'bang', 'sky', 'night', 'November', 'sparkle'],
  ['midnight snack', 'night', 'food', 'kitchen', 'sleep', 'eat'],
  ['school bus', 'yellow', 'children', 'ride', 'driver', 'morning'],
  ['paintbrush', 'paint', 'art', 'bristles', 'colour', 'canvas'],
  ['zip wire', 'slide', 'rope', 'fast', 'harness', 'trees'],
  ['igloo', 'ice', 'snow', 'house', 'cold', 'dome'],
  ['boomerang', 'Australia', 'throw', 'come back', 'curved', 'wood'],
  ['spaceship', 'alien', 'fly', 'space', 'UFO', 'rocket'],
  ['tooth fairy', 'tooth', 'pillow', 'money', 'night', 'fairy'],
  ['toffee apple', 'apple', 'sticky', 'sweet', 'stick', 'fair'],
  ['strawberry', 'red', 'fruit', 'seeds', 'cream', 'summer'],
  ['climbing frame', 'climb', 'playground', 'bars', 'monkey', 'park'],
  ['hot chocolate', 'drink', 'warm', 'cocoa', 'mug', 'marshmallows'],
  ['magic wand', 'magic', 'wizard', 'spell', 'stick', 'wave'],
  ['garden', 'grass', 'flowers', 'outside', 'plants', 'shed'],
  ['bakery', 'bread', 'cakes', 'shop', 'oven', 'bake'],
  ['swimming pool', 'water', 'swim', 'dive', 'lane', 'chlorine'],
  ['broccoli', 'green', 'vegetable', 'tree', 'healthy', 'florets'],
  ['tractor', 'farm', 'field', 'drive', 'wheels', 'plough'],
  ['alien', 'space', 'green', 'Mars', 'UFO', 'planet'],
  ['handbag', 'bag', 'carry', 'purse', 'shoulder', 'strap'],
  ['football pitch', 'grass', 'goal', 'lines', 'play', 'match'],
  ['snowball', 'snow', 'throw', 'cold', 'round', 'fight'],
  ['school bell', 'ring', 'school', 'break', 'loud', 'lesson'],
  ['marshmallow', 'soft', 'pink', 'white', 'toast', 'sweet'],
  ['abacus', 'beads', 'count', 'maths', 'wires', 'add'],
  ['zoo', 'animals', 'cages', 'visit', 'keeper', 'lion'],
  ['blanket', 'bed', 'warm', 'cover', 'wool', 'snuggle'],
  ['bubblegum', 'chew', 'blow', 'pink', 'sticky', 'pop'],
  ['egg cup', 'egg', 'boiled', 'breakfast', 'cup', 'spoon'],
  ['bookcase', 'books', 'shelves', 'wood', 'library', 'furniture'],
  ['traffic lights', 'red', 'green', 'amber', 'road', 'stop'],
  ['gravy', 'sauce', 'roast', 'brown', 'meat', 'dinner'],
  ['rollercoaster', 'ride', 'fast', 'theme park', 'loop', 'scream'],
  ['potato', 'chips', 'vegetable', 'mash', 'jacket', 'crisps'],
  ['cardigan', 'wool', 'jumper', 'buttons', 'wear', 'knit'],
  ['bridge', 'river', 'cross', 'over', 'water', 'road'],
  ['rainstorm', 'rain', 'wet', 'clouds', 'umbrella', 'heavy'],
  ['satchel', 'bag', 'leather', 'school', 'strap', 'books'],
  ['surfboard', 'waves', 'sea', 'beach', 'stand', 'ride'],
  ['playground', 'swings', 'slide', 'school', 'break', 'play'],
  ['nest', 'bird', 'eggs', 'tree', 'twigs', 'build'],
  ['leaf', 'tree', 'green', 'autumn', 'fall', 'plant'],
  ['oasis', 'desert', 'water', 'palm', 'sand', 'island'],
  ['pillow fight', 'pillow', 'feathers', 'bed', 'hit', 'sleepover'],
  ['mud', 'dirty', 'wet', 'brown', 'puddle', 'pig'],
  ['crisps', 'packet', 'salt', 'potato', 'crunch', 'snack'],
  ['wooden spoon', 'spoon', 'stir', 'kitchen', 'wood', 'cooking'],
  ['snowboard', 'snow', 'mountain', 'board', 'ski', 'slope'],
  ['cupcake', 'cake', 'icing', 'small', 'bake', 'sprinkles'],
  ['birdhouse', 'bird', 'box', 'garden', 'nest', 'wood'],
  ['lily pad', 'pond', 'frog', 'float', 'leaf', 'water'],
  ['map', 'directions', 'country', 'lost', 'paper', 'roads'],
  ['grandad', 'old', 'grandma', 'family', 'dad', 'grandparent'],
  ['bus stop', 'wait', 'bus', 'sign', 'road', 'shelter'],
  ['ketchup', 'red', 'sauce', 'tomato', 'chips', 'bottle'],
  ['science fair', 'science', 'experiment', 'school', 'project', 'show'],
  ['doorknob', 'door', 'handle', 'turn', 'open', 'round'],
  ['hot-water bottle', 'warm', 'bed', 'rubber', 'cold', 'fill'],
  ['fingerprint', 'finger', 'print', 'police', 'clue', 'swirl'],
  ['stopwatch', 'time', 'race', 'seconds', 'start', 'clock'],
  ['bookworm', 'read', 'books', 'worm', 'library', 'love'],
  ['greenhouse', 'glass', 'plants', 'garden', 'warm', 'grow'],
  ['cuckoo clock', 'bird', 'time', 'Switzerland', 'wooden', 'hour'],
  ['water bottle', 'drink', 'plastic', 'fill', 'thirsty', 'lid'],
  ['snowdrop', 'flower', 'white', 'winter', 'spring', 'snow'],
  ['goldfish', 'orange', 'bowl', 'pet', 'swim', 'memory'],
  ['tennis racket', 'ball', 'strings', 'hit', 'court', 'sport'],
  ['skyscraper', 'tall', 'building', 'city', 'floors', 'lift'],
  ['rubber duck', 'bath', 'yellow', 'toy', 'float', 'quack'],
  ['sunglasses', 'sun', 'eyes', 'dark', 'summer', 'wear'],
  ['shepherd’s pie', 'potato', 'mince', 'meat', 'oven', 'dinner'],
  ['moon landing', 'moon', 'astronaut', 'Apollo', 'step', 'space'],
  ['pin cushion', 'pins', 'sewing', 'needle', 'soft', 'prick'],
  ['braces', 'teeth', 'metal', 'dentist', 'straighten', 'smile'],
  ['cardboard box', 'cardboard', 'brown', 'packing', 'move', 'square'],
];

/* HOT SEAT: THINGS, NOT IDEAS. The class shouts clues at somebody who cannot see the word, so it has
   to be a thing everybody in the room can describe in a hurry. */
const HOT_DECK = [
  'pineapple', 'sledge', 'lantern', 'footstool', 'mittens', 'lobster', 'saxophone', 'windmill',
  'fire engine', 'wardrobe', 'doughnut', 'tiara', 'paddling pool', 'snorkel', 'coconut',
  'treehouse', 'jet ski', 'yo-yo', 'wellington boots', 'xylophone', 'raft', 'pumpkin',
  'scooter', 'spanner', 'radish', 'watermelon', 'cauliflower', 'bagpipes', 'snowplough',
  'ferris wheel', 'hot-air balloon', 'cannon', 'parachute', 'shopping basket', 'apron',
  'tambourine', 'tuba', 'sausage', 'meringue', 'kiwi fruit', 'avocado', 'mango', 'cherry',
  'grapes', 'plum', 'pepper', 'cucumber', 'sweetcorn', 'peas', 'fish pie', 'lasagne',
  'burrito', 'crumpet', 'fish and chips', 'hosepipe', 'flapjack', 'trifle', 'custard',
  'porridge', 'muffin', 'croissant', 'bagel', 'pretzel', 'waffle', 'smoothie', 'milkshake',
  'lemonade', 'orange juice', 'kazoo', 'cello', 'flute', 'recorder', 'harp', 'banjo',
  'accordion', 'maracas', 'triangle', 'cymbals', 'ukulele', 'drumsticks', 'helicopter',
  'canoe', 'tram', 'police car', 'motorbike', 'lorry', 'ferry', 'cable car', 'go-kart',
  'tandem', 'unicycle', 'roller skates', 'pogo stick', 'space hopper', 'helter-skelter',
  'climbing wall', 'bowling ball', 'dartboard', 'chessboard', 'playing cards', 'dice',
  'marbles', 'teddy bear', 'rocking horse', 'doll’s house', 'toy garage', 'kaleidoscope',
  'magnifying glass', 'binoculars', 'globe', 'atlas', 'dictionary', 'encyclopaedia',
  'notebook', 'pencil sharpener', 'protractor', 'set square', 'highlighter', 'crayon',
  'felt-tip pen', 'chalk', 'blackboard', 'easel', 'paint palette', 'clay', 'glitter',
  'tinsel', 'bauble', 'stocking', 'wreath', 'snow globe', 'cracker', 'paper chain', 'stilts',
  'bus ticket', 'feather duster', 'nutcracker', 'tutu', 'gazebo', 'fountain', 'bird table',
];

/* 20 QUESTIONS: A PERSON, A PLACE OR A THING, and the people are from history lessons and books rather than from this week's news — a living celebrity is a card § */
const TWQ_DECK = {
  Person: [
    'Isaac Newton', 'Florence Nightingale', 'Albert Einstein', 'William Shakespeare',
    'Queen Victoria', 'Henry VIII', 'Charles Darwin', 'Marie Curie', 'Neil Armstrong',
    'Amelia Earhart', 'Leonardo da Vinci', 'Mary Seacole', 'Julius Caesar', 'Cleopatra',
    'Tutankhamun', 'Rosa Parks', 'Nelson Mandela', 'Martin Luther King', 'Emmeline Pankhurst',
    'Winston Churchill', 'Isambard Kingdom Brunel', 'Ada Lovelace', 'Alan Turing',
    'Grace Darling', 'Guy Fawkes', 'King Arthur', 'Father Christmas', 'Charles Dickens',
    'Sherlock Holmes', 'Boudicca', 'Thomas Edison', 'Galileo', 'Christopher Columbus',
    'Beatrix Potter', 'Roald Dahl', 'Mozart', 'Elizabeth I', 'Louis Braille', 'Sir Francis Drake',
    'Mickey Mouse', 'Wonder Woman', 'Anne Frank', 'Jane Austen', 'Captain Cook',
  ],
  Place: [
    'Mars', 'Jupiter', 'Saturn', 'Venus', 'Neptune', 'Africa', 'Lapland', 'London', 'Cardiff',
    'Disneyland', 'a dentist’s waiting room', 'a lifeboat station', 'a fish market', 'a fire station',
    'an attic', 'a bamboo forest', 'a coral island', 'a farmyard',
    'a football stadium', 'a swimming baths', 'a canal boat', 'a space station',
    'a log cabin', 'a bus garage', 'an aquarium', 'a toy shop', 'a post office',
    'a seesaw', 'a vegetable patch', 'a haunted house', 'the top of a mountain',
    'the bottom of the sea', 'a matchbox', 'a supermarket checkout', 'a laundrette',
    'a car wash', 'a petrol station', 'a harbour', 'a pet shop', 'a sweet shop',
    'an ice rink', 'a village hall', 'a cruise ship', 'a recording studio',
  ],
  Thing: [
    'a cork', 'a teaspoon', 'a safety pin', 'a paper clip', 'a fork', 'a door handle',
    'a flower pot', 'a light switch', 'a piggy bank', 'a crown', 'a sugar cube', 'a pine cone',
    'a pine needle', 'a pebble', 'a seashell', 'a raindrop', 'a cloud', 'a pair of glasses',
    'a thimble', 'a key', 'a coin', 'a banknote', 'a tennis ball', 'a rugby ball',
    'a cricket bat', 'a golf club', 'a hockey stick', 'a frisbee', 'a bowl of cereal',
    'a slice of toast', 'a boiled egg', 'an apple core', 'a peach stone', 'a jam jar',
    'a cup of tea', 'a glass of milk', 'a bar of soap', 'a towel', 'a sock', 'a woolly hat',
    'a nail file', 'a car tyre', 'a traffic cone', 'a lunch tray',
  ],
};

const PARTY = { jam: null, tab: null, hot: null, twq: null };
const PARTY_TICK = {};

/* EVERY ROUND IS DEALT FROM A SHUFFLED PILE, refilled when it runs out — `herdShuffle_` for the
   reason its own note gives — so nothing comes round twice until everything has. */
const PARTY_PILE = {};
function partyDraw_(key, list) {
  if (!PARTY_PILE[key] || !PARTY_PILE[key].length) PARTY_PILE[key] = herdShuffle_(list);
  return PARTY_PILE[key].pop();
}

function partyMs_(s) { return s ? (s.ends ? Math.max(0, s.ends - Date.now()) : (s.left || 0)) : 0; }
function partyClock_(s) { return roundClock_(Math.ceil(partyMs_(s) / 1000)); }

/* WHERE A STOP CAME FROM: § */
function partyHere_(k) {
  if (typeof AT === 'undefined') return true;
  const scr = document.getElementById('s-' + AT);
  return !!(scr && scr.querySelector('#' + k + '-card'));
}

function partyRun_(k) {
  const s = PARTY[k];
  if (!s) return;
  clearInterval(PARTY_TICK[k]);
  s.run = true;
  s.ends = Date.now() + s.left;
  PARTY_TICK[k] = setInterval(() => partyTick_(k), 250);
}

function partyHold_(k) {
  clearInterval(PARTY_TICK[k]);
  PARTY_TICK[k] = 0;
  const s = PARTY[k];
  if (s && s.ends) { s.left = partyMs_(s); s.ends = 0; }
}

/* THE TICK WRITES THE CLOCK AND NOTHING ELSE. § */
function partyTick_(k) {
  const s = PARTY[k];
  if (!s || !s.ends) { partyHold_(k); return; }
  if (partyMs_(s) <= 0) {
    partyHold_(k);
    s.left = 0;
    s.run = false;
    PARTY_GAMES[k].end(s);
    PARTY_GAMES[k].paint();
    return;
  }
  const c = $(k + '-left');
  if (c) c.textContent = partyClock_(s);
}

/* THE WIDGET'S `start`: redraw what is in progress, and set a clock running again if a repaint is
   all that stopped it. */
function partyStart_(k) {
  const s = PARTY[k];
  if (s && s.run && !s.ends && s.left > 0) partyRun_(k);
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

/* THE WIDGET'S `stop`. § */
function partyStop_(k) {
  partyHold_(k);
  if (partyHere_(k)) return;
  const s = PARTY[k];
  if (!s) return;
  s.run = false;
  if (k === 'twq' && s.phase === 'shown') s.phase = 'hand';
  if (PARTY_GAMES[k]) PARTY_GAMES[k].paint();
}

on('party-resume', el => {
  const k = el.getAttribute('data-g');
  const s = PARTY[k];
  if (!s || s.phase !== 'go' || s.left <= 0) return;
  partyRun_(k);
  PARTY_GAMES[k].paint();
});

/* ONE PAINT FOR THE PAUSED CARD, because all four timed games pause the same way and say nothing secret while they do. § */
function partyHeld_(k, head, line, go) {
  return `<p class="art-cat-of">${esc(head)}</p>
    <p class="party-clock" id="${esc(k)}-left">${partyClock_(PARTY[k])}</p>
    ${line ? `<p class="imp-pass">${esc(line)}</p>` : ''}
    ${tile_({ form: true, look: `art-go`, attrs: `data-do="party-resume" data-g="${esc(k)}"`, html: `${esc(go || 'Resume')}` })}`;
}

function partyBits_(k) {
  return { card: $(k + '-card'), acts: $(k + '-acts'), said: $(k + '-said') };
}

/* ---------- JUST A MINUTE § */
function jamPaint() {
  const { card, acts, said } = partyBits_('jam');
  if (!card) return;
  const s = PARTY.jam;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="jam-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Talk for a minute. No hesitation, no repetition, no deviation.';
    return;
  }
  const t = s.tally;
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-word">${esc(s.topic)}</p>
      <p class="party-sum">Hesitation ${t.h} &middot; Repetition ${t.r} &middot; Deviation ${t.d}</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next topic', act: 'jam-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('jam', 'Paused', s.topic);
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Talk about</p>
    <p class="art-word">${esc(s.topic)}</p>
    <p class="party-clock" id="jam-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="h"`, html: `Hesitation<b>${t.h}</b>` })}
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="r"`, html: `Repetition<b>${t.r}</b>` })}
      ${tile_({ form: true, look: `btn quiet party-call`, attrs: `data-do="jam-call" data-c="d"`, html: `Deviation<b>${t.d}</b>` })}
    </div>`;
  }
  if (said) said.textContent = 'Tap one when somebody catches the speaker out.';
}

on('jam-begin', () => {
  partyHold_('jam');
  PARTY.jam = { phase: 'go', topic: partyDraw_('jam', JAM_DECK), left: 60000, ends: 0, run: false,
                tally: { h: 0, r: 0, d: 0 } };
  partyRun_('jam');
  jamPaint();
});
on('jam-call', el => {
  const s = PARTY.jam;
  const c = el.getAttribute('data-c');
  if (!s || s.phase !== 'go' || !s.run || !(c in s.tally)) return;
  s.tally[c]++;
  jamPaint();
});

/* GOT IT AND PASS DRAWN FROM THE START (owner, 6 Nov: Taboo, Hot Seat as Articulate): greyed until the round runs, never hidden. */
function partyPair_(act, yes, live) {
  return `<div class="btn-row">
      ${tile_({ form: true, label: yes, act, data: { got: '1' }, off: !live })}
      ${tile_({ form: true, label: 'Pass', act, data: { got: '0' }, kind: 'quiet', off: !live })}
    </div>`;
}

/* ---------- TABOO § */
function tabPaint() {
  const { card, acts, said } = partyBits_('tab');
  if (!card) return;
  const s = PARTY.tab;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="tab-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = partyPair_('tab-next', 'Correct', false);
    if (said) said.textContent = 'Whoever is watching listens for a word from the list.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">correct &middot; ${s.passed} passed</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next round', act: 'tab-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    /* THE WORD IS NOT ON A PAUSED CARD: whoever picks the phone up next may be on the other side. */
    card.innerHTML = partyHeld_('tab', 'Paused', s.score + ' correct so far');
    if (acts) acts.innerHTML = partyPair_('tab-next', 'Correct', false);
    if (said) said.textContent = '';
    return;
  }
  const [word, ...ban] = s.card;
  card.innerHTML = `<p class="art-cat-of">Describe</p>
    <p class="art-word">${esc(word)}</p>
    <p class="art-over">Don’t say</p>
    <ul class="tab-ban">${ban.map(b => `<li>${esc(b)}</li>`).join('')}</ul>
    <p class="party-clock" id="tab-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = partyPair_('tab-next', 'Correct', true);
  }
  if (said) said.textContent = s.score + ' correct so far.';
}

on('tab-begin', () => {
  partyHold_('tab');
  PARTY.tab = { phase: 'go', card: partyDraw_('tab', TABOO_DECK), score: 0, passed: 0,
                left: 60000, ends: 0, run: false };
  partyRun_('tab');
  tabPaint();
});
on('tab-next', el => {
  const s = PARTY.tab;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++; else s.passed++;
  s.card = partyDraw_('tab', TABOO_DECK);
  tabPaint();
});

/* ---------- HOT SEAT § */
function hotPaint() {
  const { card, acts, said } = partyBits_('hot');
  if (!card) return;
  const s = PARTY.hot;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="hot-begin"`, html: `Start` })}`;
    if (acts) acts.innerHTML = partyPair_('hot-next', 'Got it', false);
    if (said) said.textContent = 'Whoever is in the hot seat sits with their back to the screen.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">Time</p>
      <p class="art-score">${s.score}</p>
      <p class="art-over">guessed</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Next player', act: 'hot-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  if (!s.run) {
    card.innerHTML = partyHeld_('hot', s.left < 60000 ? 'Paused' : 'Ready',
      'Hold the phone up so only the class can see it.', 'Show the word');
    if (acts) acts.innerHTML = partyPair_('hot-next', 'Got it', false);
    if (said) said.textContent = 'The one in the hot seat does not look.';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">Clues for</p>
    <p class="art-word hot-word">${esc(s.word)}</p>
    <p class="party-clock" id="hot-left">${partyClock_(s)}</p>`;
  if (acts) {
    acts.innerHTML = partyPair_('hot-next', 'Got it', true);
  }
  if (said) said.textContent = s.score + ' guessed so far.';
}

on('hot-begin', () => {
  partyHold_('hot');
  PARTY.hot = { phase: 'go', word: partyDraw_('hot', HOT_DECK), score: 0, left: 60000, ends: 0,
                run: false };
  hotPaint();
});
on('hot-next', el => {
  const s = PARTY.hot;
  if (!s || s.phase !== 'go' || !s.run) return;
  if (el.getAttribute('data-got') === '1') s.score++;
  s.word = partyDraw_('hot', HOT_DECK);
  hotPaint();
});

/* ---------- 20 QUESTIONS § */
const TWQ_MAX = 20;

function twqPaint() {
  const { card, acts, said } = partyBits_('twq');
  if (!card) return;
  const s = PARTY.twq;
  if (!s) {
    card.innerHTML = `${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-begin"`, html: `Choose a secret` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'One of you holds the phone and answers; everybody else asks.';
    return;
  }
  if (s.phase === 'hand') {
    card.innerHTML = `<p class="imp-pass">Hand the phone to <b>whoever answers</b></p>
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-show"`, html: `Show me` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Nobody else looks.';
    return;
  }
  if (s.phase === 'shown') {
    card.innerHTML = `<p class="art-cat-of">${esc(s.cat)}</p>
      <p class="art-word">${esc(s.word)}</p>
      ${tile_({ form: true, look: `art-go`, attrs: `data-do="twq-hide"`, html: `Hide it` })}`;
    if (acts) acts.innerHTML = '';
    if (said) said.textContent = 'Remember it, then hide it.';
    return;
  }
  if (s.phase === 'done') {
    card.innerHTML = `<p class="art-over">${s.asked >= TWQ_MAX ? 'Out of questions' : 'It was'}</p>
      <p class="art-word">${esc(s.word)}</p>
      <p class="art-over">${s.asked} of ${TWQ_MAX} questions asked</p>`;
    if (acts) acts.innerHTML = `${tile_({ form: true, label: 'Play again', act: 'twq-begin' })}`;
    if (said) said.textContent = '';
    return;
  }
  card.innerHTML = `<p class="art-cat-of">It’s a ${esc(s.cat.toLowerCase())}</p>
    <p class="art-score">${s.asked} <span class="party-of">of ${TWQ_MAX}</span></p>
    <p class="art-over">questions asked</p>`;
  if (acts) {
    acts.innerHTML = `<div class="btn-row">
      ${tile_({ form: true, label: 'Yes', act: 'twq-ask' })}
      ${tile_({ form: true, label: 'No', act: 'twq-ask' })}
    </div>
    ${tile_({ form: true, label: 'Reveal', act: 'twq-reveal', kind: 'quiet', cls: 'party-more' })}`;
  }
  if (said) said.textContent = 'Answer each question, then tap how you answered.';
}

on('twq-begin', () => {
  const [cat, word] = partyDraw_('twq', Object.keys(TWQ_DECK)
    .reduce((all, c) => all.concat(TWQ_DECK[c].map(w => [c, w])), []));
  PARTY.twq = { phase: 'hand', cat: cat, word: word, asked: 0 };
  twqPaint();
});
on('twq-show', () => { if (PARTY.twq && PARTY.twq.phase === 'hand') { PARTY.twq.phase = 'shown'; twqPaint(); } });
on('twq-hide', () => { if (PARTY.twq && PARTY.twq.phase === 'shown') { PARTY.twq.phase = 'play'; twqPaint(); } });
on('twq-ask', () => {
  const s = PARTY.twq;
  if (!s || s.phase !== 'play') return;
  s.asked++;
  if (s.asked >= TWQ_MAX) s.phase = 'done';
  twqPaint();
});
on('twq-reveal', () => { if (PARTY.twq && PARTY.twq.phase === 'play') { PARTY.twq.phase = 'done'; twqPaint(); } });


/* WHAT EACH GAME DOES WHEN ITS CLOCK RUNS OUT, and how it draws. Read by the tick, `partyStart_` and
   `partyStop_`, so a fifth timed game is a row here. */
const PARTY_GAMES = {
  jam: { paint: jamPaint, end: s => { s.phase = 'done'; } },
  tab: { paint: tabPaint, end: s => { s.phase = 'done'; } },
  hot: { paint: hotPaint, end: s => { s.phase = 'done'; } },
  twq: { paint: twqPaint, end: () => {} },
};

/* WORD GAMES — Articulate, Charades, Taboo, Hot Seat, Just a Minute, 20 Questions, Imposter, Herd Mentality, Word Search and Sentence Scramble (441) in one widget. § */
const WORD_GAMES = [
  { k: 'art', name: 'Articulate', start: () => initRound('art'), stop: () => roundStop_('art'),
    body: `<p>Describe it without saying it. Ninety seconds.</p>
    <div id="art-card" class="art"></div>
    <div class="art-row">
      ${tile_({ form: true, label: 'Got it', act: 'rg-next', data: { g: 'art', got: '1' } })}
      ${tile_({ form: true, label: 'Pass', act: 'rg-next', data: { g: 'art', got: '0' }, kind: 'quiet' })}
    </div>
    <p class="art-meta"><span id="art-left">1:30</span> left &middot;
      <b id="art-got">0</b> so far</p>
    <p class="note" id="art-said"></p>
    ${tile_({ form: true, label: 'New round', act: 'rg-again', data: { g: 'art' }, kind: 'quiet' })}` },
  { k: 'cha', name: 'Charades', start: () => initRound('cha'), stop: () => roundStop_('cha'),
    body: `<p>Act it out. No words, no sounds. Three minutes.</p>
    <div id="cha-card" class="art"></div>
    <div class="art-row">
      ${tile_({ form: true, label: 'Got it', act: 'rg-next', data: { g: 'cha', got: '1' } })}
      ${tile_({ form: true, label: 'Pass', act: 'rg-next', data: { g: 'cha', got: '0' }, kind: 'quiet' })}
    </div>
    <p class="art-meta"><span id="cha-left">3:00</span> left &middot;
      <b id="cha-got">0</b> so far</p>
    <p class="note" id="cha-said"></p>
    ${tile_({ form: true, label: 'New round', act: 'rg-again', data: { g: 'cha' }, kind: 'quiet' })}` },
  { k: 'tab', name: 'Taboo', party: true,
    body: `<p>Describe the word without the words under it. Sixty seconds.</p>` },
  { k: 'hot', name: 'Hot Seat', party: true,
    body: `<p>The class gives clues; the one in the hot seat guesses. Sixty seconds.</p>` },
  { k: 'jam', name: 'Just a Minute', party: true,
    body: `<p>Talk about the topic for sixty seconds without stopping.</p>` },
  { k: 'twq', name: '20 Questions', party: true,
    body: `<p>Twenty yes-or-no questions to find a person, a place or a thing.</p>` },
  { k: 'imp', name: 'Imposter', start: () => initImposter(), stop: () => impHide_(),
    /* NO NOTE LINE UNDER THE CARD. § */
    body: `<div id="imp-card" class="art"></div>
    <div id="imp-acts" class="art-row"></div>` },
  /* HERD MENTALITY, MOVED IN BY THE OWNER — "heard mentality is a word game so should go there." § */
  { k: 'herd', name: 'Herd Mentality', start: () => initHerd(), stop: () => {},
    body: `<div id="herd-card" class="herd-card">
    <p>Everybody answers. You want to match the room, not be right.</p>
    <p class="herd-q" id="herd-q"></p>
    ${tile_({ form: true, label: 'Next question', act: 'herd-next' })}
    </div>` },
  /* WORD SEARCH AND SENTENCE SCRAMBLE, MOVED IN BY THE OWNER (441) — their own cards before; nothing runs between taps, so no stop. */
  { k: 'ws', name: 'Word Search', start: () => initWordSearch(), stop: () => {},
    body: `<p>Tap the first letter of a word, then its last.</p>
    <label class="mat-sel ws-top"><select id="ws-theme" data-do="ws-theme"
      aria-label="Which words"></select></label>
    <div id="ws-grid" class="ws"></div>
    <ul id="ws-words" class="ws-list"></ul>
    <p class="note game-said" id="ws-said"></p>
    ${tile_({ form: true, label: 'New puzzle', act: 'ws-again', kind: 'quiet' })}` },
  /* THE TIMES TABLES SPRINT, MOVED IN BY THE OWNER (461): its own card before; its best is still `saveTtHighscore`'s. */
  { k: 'tt', name: 'Times Tables Sprint', start: () => initTables(),
    stop: () => { if (typeof ttState !== 'undefined' && ttState) { clearInterval(ttState.timer); ttState = null; } },
    body: `<div id="tt-idle">
      <p>Sixty seconds. As many as you can.</p>
      ${tile_({ form: true, look: `btn`, attrs: `id="tt-play" data-do="tt-begin"`, html: `Start` })}
    </div>
    <div id="tt-question" class="hidden tt">
      <p class="mono tt-big" id="tt-q">—</p>
      <input id="tt-answer" inputmode="numeric" placeholder="answer" autocomplete="off">
      <p class="note game-said" id="tt-feedback"></p>
      ${rowLive('Time', '60', 'tt-time')}
      ${rowLive('Right', '0', 'tt-score')}
      ${tile_({ form: true, look: `btn quiet`, attrs: `data-do="tt-stop"`, html: `Give up` })}
    </div>
    <div id="tt-over" class="hidden"></div>
    <div id="tt-board" class="board"></div>` },
  { k: 'ss', name: 'Sentence Scramble', start: () => initScramble(), stop: () => {},
    body: `<p>Tap the words in order to put the sentence back together.</p>
    <label class="mat-sel ws-top"><select id="ss-level" data-do="ss-level"
      aria-label="Level"></select></label>
    <div id="ss-box"></div>
    <p class="note game-said" id="ss-said"></p>` },
];

/* A party game's body is its sentence and the frame `PARTY_GAMES[k].paint` fills — the same three
   elements for all four, so they are written once here rather than four times above. */
function wgBody_(g) {
  if (!g.party) return g.body;
  return g.body + `
    <div id="${g.k}-card" class="art"></div>
    <div id="${g.k}-acts" class="party-acts"></div>
    <p class="note game-said" id="${g.k}-said"></p>`;
}

function wgGame_(k) { return WORD_GAMES.find(g => g.k === k) || WORD_GAMES[0]; }

/* REMEMBERED ON THE DEVICE, `ws-theme`'s rule: the game a family played last week is the one they
   open to, and a remembered key nothing answers any more falls back to the first. */
function wgChosen_() {
  let k = '';
  try { k = localStorage.getItem('wg-game') || ''; } catch (e) {}
  return wgGame_(k).k;
}

/* WHAT THE WIDGET'S MARKUP CARRIES — read by the getter on the `wordgames` entry in map.js, so a
   repaint puts the chosen game's card down with everything else rather than an empty slot. */
function wgOptions_() {
  const k = wgChosen_();
  return WORD_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function wgSlot_() {
  const g = wgGame_(wgChosen_());
  return `<div data-g="${esc(g.k)}" class="wg-game">${wgBody_(g)}</div>`;
}

/* THE PICKER AND THE CHOSEN GAME'S CARD, AND NOTHING THAT RUNS — the widget's declared `draw`, which the builder uses to draw it before anybody arrives § */
function wgPaint_() {
  const slots = document.querySelectorAll('#wg-slot');
  if (!slots.length) return false;
  const g = wgGame_(wgChosen_());
  /* EVERY COPY, the Games card and a starred one on Saved (441), so a pick on one is not undone by the other. */
  document.querySelectorAll('#wg-pick').forEach(sel => { if (sel.value !== g.k) sel.innerHTML = wgOptions_(); });
  /* REBUILT ONLY WHEN THE GAME CHANGED. § */
  slots.forEach(slot => {
    const now = slot.firstElementChild;
    if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = wgSlot_();
  });
  return g;
}
function initWordGames() {
  const g = wgPaint_();
  if (!g) return;
  if (g.party) partyStart_(g.k);
  else g.start();
}

function wordGamesStop_() {
  WORD_GAMES.forEach(g => {
    try { if (g.party) partyStop_(g.k); else g.stop(); }
    catch (e) { console.warn('[word games]', g.k, e); }
  });
}

on('wg-pick', el => {
  const k = wgGame_(el.value).k;
  try { localStorage.setItem('wg-game', k); } catch (e) {}
  /* THE OLD GAME IS STOPPED AFTER ITS CARD HAS LEFT THE DOCUMENT, which is the order that makes its own stop read it as "the column is gone": § */
  document.querySelectorAll('#wg-slot').forEach(x => { x.innerHTML = ''; });
  wordGamesStop_();
  initWordGames();
});

/* LINKED PICTURES (570): tap two matching pictures that a line with at most two turns can join, through empty squares or round the edge. */
const LK_W = 6, LK_H = 6, LK_PICS = ['🍎', '🐟', '⭐', '🌙', '🔔', '🎈', '🌵', '🐢', '🍄'];
let LK = null;
function lkNew_() {
  const n = LK_W * LK_H, cells = [];
  for (let i = 0; i < n; i++) cells.push(LK_PICS[Math.floor(i / 2) % LK_PICS.length]);
  for (let i = n - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); const t = cells[i]; cells[i] = cells[j]; cells[j] = t; }
  LK = { cells, pick: -1, left: n };
}
/* THE GRID WITH A BORDER OF EMPTY SQUARES, so a line may run round the outside; a breadth-first walk counting turns. */
function lkJoins_(a, b) {
  const W = LK_W + 2, H = LK_H + 2, at = i => (Math.floor(i / LK_W) + 1) * W + (i % LK_W) + 1;
  const free = p => { const x = p % W - 1, y = Math.floor(p / W) - 1; return x < 0 || y < 0 || x >= LK_W || y >= LK_H || !LK.cells[y * LK_W + x]; };
  const s = at(a), t = at(b), D = [[1, 0], [-1, 0], [0, 1], [0, -1]], best = {};
  const q = D.map((d, k) => [s, k, 0]);
  while (q.length) {
    const [p, k, turns] = q.shift();
    const x = p % W + D[k][0], y = Math.floor(p / W) + D[k][1];
    if (x < 0 || y < 0 || x >= W || y >= H) continue;
    const np = y * W + x;
    if (np === t) return true;
    if (!free(np)) continue;
    for (let k2 = 0; k2 < 4; k2++) {
      const nt = turns + (k2 === k ? 0 : 1), key = np * 4 + k2;
      if (nt > 2 || (key in best && best[key] <= nt)) continue;
      best[key] = nt; q.push([np, k2, nt]);
    }
  }
  return false;
}
function lkPaint_() {
  if (!LK) lkNew_();
  document.querySelectorAll('.lk-grid').forEach(g => {
    g.innerHTML = LK.cells.map((c, i) => tile_({ form: true, look: 'lk-sq' + (i === LK.pick ? ' on' : ''), act: 'lk-sq', data: { i }, off: !c, aria: c ? 'picture ' + (i + 1) : 'empty', html: c })).join('');
  });
  document.querySelectorAll('.lk-tiles').forEach(x => { x.innerHTML = tile_({ icon: 'again', label: 'New board', act: 'lk-new' }); });
  document.querySelectorAll('.lk-left').forEach(x => { x.textContent = LK.left ? LK.left / 2 + ' pairs left' : 'Cleared. Well done.'; });
}
on('lk-sq', el => {
  const i = +el.getAttribute('data-i');
  if (!LK || !LK.cells[i]) return;
  if (LK.pick === -1 || LK.pick === i) { LK.pick = LK.pick === i ? -1 : i; return lkPaint_(); }
  const a = LK.pick;
  if (LK.cells[a] === LK.cells[i] && lkJoins_(a, i)) { LK.cells[a] = LK.cells[i] = ''; LK.left -= 2; LK.pick = -1; }
  else LK.pick = i;
  lkPaint_();
});
on('lk-new', () => { lkNew_(); lkPaint_(); });

/* THE GUESSER (570): the site asks yes-or-no questions and names the person you picked from a small list of figures from history. */
const GS_PEOPLE = [
  { n: 'Julius Caesar', a: ['ancient', 'ruler', 'soldier', 'europe'] },
  { n: 'Cleopatra', a: ['ancient', 'ruler', 'woman', 'africa'] },
  { n: 'Elizabeth I', a: ['ruler', 'woman', 'europe', 'britain'] },
  { n: 'Henry VIII', a: ['ruler', 'europe', 'britain'] },
  { n: 'Isaac Newton', a: ['science', 'europe', 'britain'] },
  { n: 'Marie Curie', a: ['science', 'woman', 'europe', 'modern'] },
  { n: 'Charles Darwin', a: ['science', 'europe', 'britain', 'traveller'] },
  { n: 'Florence Nightingale', a: ['woman', 'europe', 'britain', 'medicine'] },
  { n: 'Mary Seacole', a: ['woman', 'britain', 'medicine', 'traveller'] },
  { n: 'Napoleon Bonaparte', a: ['ruler', 'soldier', 'europe'] },
  { n: 'Winston Churchill', a: ['ruler', 'soldier', 'europe', 'britain', 'modern', 'writer'] },
  { n: 'William Shakespeare', a: ['writer', 'europe', 'britain'] },
  { n: 'Christopher Columbus', a: ['europe', 'traveller'] },
  { n: 'Genghis Khan', a: ['ruler', 'soldier', 'asia'] },
  { n: 'Mahatma Gandhi', a: ['asia', 'modern', 'writer'] },
  { n: 'Nelson Mandela', a: ['ruler', 'africa', 'modern'] },
  { n: 'Leonardo da Vinci', a: ['science', 'artist', 'europe'] },
  { n: 'Ada Lovelace', a: ['science', 'woman', 'europe', 'britain'] },
  { n: 'Confucius', a: ['ancient', 'asia', 'writer'] },
  { n: 'Martin Luther King Jr.', a: ['modern', 'writer', 'america'] },
];
const GS_ASK = { ancient: 'Did they live more than 2,000 years ago?', ruler: 'Did they rule or lead a country?', soldier: 'Did they lead armies?',
  woman: 'Are they a woman?', europe: 'Were they from Europe?', britain: 'Were they British or English?', science: 'Are they known for science or invention?',
  medicine: 'Are they known for caring for the sick?', traveller: 'Did they make a famous journey?', writer: 'Are they known for their writing or speeches?',
  modern: 'Were they alive in the 20th century?', asia: 'Were they from Asia?', africa: 'Were they from Africa?', artist: 'Were they an artist?', america: 'Were they from America?' };
let GS = null;
function gsNew_() { GS = { left: GS_PEOPLE.slice(), asked: [], q: '' }; gsNext_(); }
/* THE QUESTION THAT SPLITS WHAT IS LEFT MOST EVENLY. */
function gsNext_() {
  GS.q = '';
  if (GS.left.length <= 1) return;
  let best = 1e9;
  Object.keys(GS_ASK).forEach(k => {
    if (GS.asked.indexOf(k) !== -1) return;
    const yes = GS.left.filter(p => p.a.indexOf(k) !== -1).length, d = Math.abs(GS.left.length - 2 * yes);
    if (yes && yes < GS.left.length && d < best) { best = d; GS.q = k; }
  });
}
function gsPaint_() {
  if (!GS) gsNew_();
  const said = !GS.left.length ? 'I give up. You beat me.'
    : !GS.q ? 'You are thinking of ' + GS.left[0].n + '.' + (GS.left.length > 1 ? ' Or ' + GS.left.slice(1).map(p => p.n).join(', or ') + '.' : '')
    : GS_ASK[GS.q];
  const tiles = GS.q ? tile_({ icon: 'tick', label: 'Yes', act: 'gs-say', data: { y: '1' } }) + tile_({ icon: 'close', label: 'No', act: 'gs-say', data: { y: '0' } })
    + tile_({ icon: 'suggest', label: 'Not sure', act: 'gs-say', data: { y: '?' } }) : '';
  document.querySelectorAll('.gs-box').forEach(b => {
    b.innerHTML = `<p class="gs-q">${esc(said)}</p><div class="tile-row">${tiles}${tile_({ icon: 'again', label: 'Start again', act: 'gs-new' })}</div>`;
  });
}
on('gs-say', el => {
  if (!GS || !GS.q) return;
  const y = el.getAttribute('data-y'), k = GS.q;
  GS.asked.push(k);
  if (y !== '?') GS.left = GS.left.filter(p => (p.a.indexOf(k) !== -1) === (y === '1'));
  gsNext_(); gsPaint_();
});
on('gs-new', () => { gsNew_(); gsPaint_(); });

/* THE CONSOLE PLAYS EVERY GAME (441): the person's game files, Flabby Pird and the Colliers Wood racer, one picker — the board games' shape (414). */
const CONSOLE_GAMES = [
  { k: 'file', name: 'Game files', start: () => { nesPaint_(); nesPadWatch_(); }, still: () => nesPaint_(),
    stop: () => { nesStop_(); nesPadUnwatch_(); },
    body: `<p class="cs-one" title="NES, SNES, Game Boy, Game Boy Color, Game Boy Advance, N64 and DS">NES to DS games you own; they stay on this device.</p>
    <div id="nes-box" class="nes-box"></div>` },
  /* TWO SMALL ONES (570): linked pictures and the guesser; nothing runs between taps, so stopping stops nothing. */
  { k: 'link', name: 'Linked pictures', start: () => lkPaint_(), still: () => lkPaint_(), stop: () => {},
    body: `<p>Join two the same with a line of up to two turns.</p>
    <div class="lk-grid"></div><p class="note lk-left"></p>
    <div class="tile-row lk-tiles"></div>` },
  { k: 'guess', name: 'I can guess', start: () => gsPaint_(), still: () => gsPaint_(), stop: () => {},
    body: `<p>Think of someone from history: ${GS_PEOPLE.map(p => p.n).join(', ')}. I will ask until I know.</p>
    <div class="gs-box"></div>` },
];
function csGame_(k) { return CONSOLE_GAMES.find(g => g.k === k) || CONSOLE_GAMES[0]; }
/* REMEMBERED ON THE DEVICE under `cs-game`, `bg-game`'s rule. */
function csChosen_() {
  let k = '';
  try { k = localStorage.getItem('cs-game') || ''; } catch (e) {}
  return csGame_(k).k;
}
function csOptions_() {
  const k = csChosen_();
  return CONSOLE_GAMES.map(x =>
    `<option value="${esc(x.k)}"${x.k === k ? ' selected' : ''}>${esc(x.name)}</option>`).join('');
}
function csSlot_() {
  const g = csGame_(csChosen_());
  return `<div data-g="${esc(g.k)}" class="cs-game">${g.body}</div>`;
}
/* THE PICKER AND THE CHOSEN GAME'S MARKUP; rebuilt only when the game changed, so a running emulator keeps its box. */
/* EVERY COPY — the Games card and a starred one on Saved — so a pick on one is not undone by the other. */
function csPaint_() {
  const slots = document.querySelectorAll('#cs-slot');
  if (!slots.length) return false;
  const g = csGame_(csChosen_());
  document.querySelectorAll('#cs-pick').forEach(sel => { if (sel.value !== g.k) sel.innerHTML = csOptions_(); });
  slots.forEach(slot => {
    const now = slot.firstElementChild;
    if (!now || now.getAttribute('data-g') !== g.k) slot.innerHTML = csSlot_();
  });
  return g;
}
function initConsole() { const g = csPaint_(); if (g) g.start(); }
function consoleStill_() { const g = csPaint_(); if (g) g.still(); }
function consoleStop_() {
  CONSOLE_GAMES.forEach(g => { try { g.stop(); } catch (e) { console.warn('[console]', g.k, e); } });
}
on('cs-pick', el => {
  const k = csGame_(el.value).k;
  try { localStorage.setItem('cs-game', k); } catch (e) {}
  consoleStop_();
  document.querySelectorAll('#cs-slot').forEach(x => { x.innerHTML = ''; });
  initConsole();
});

/* ---------- CONSOLE: an NES player, and only the player (docs/history/389; SNES, Game Boy and N64 files too, 391) */
/* The engine is jsnes (Apache-2.0), fetched only when Play is pressed. The game file is the person's own:
   picked from their device, kept in this device's IndexedDB, never uploaded or sent. */
const NES_LIB = 'https://cdn.jsdelivr.net/npm/jsnes@2.1.0/dist/jsnes.min.js';
const NES_LIB_2 = 'https://unpkg.com/jsnes@2.1.0/dist/jsnes.min.js';
const NES_DB = 'family-console', NES_HZ = 60.0988;
const NES_ = { nes: null, rom: null, saved: null, running: false, raf: 0, last: 0, acc: 0, ctx: null, img: null,
  u32: null, audio: null, node: null, ring: null, rd: 0, wr: 0, keys: {}, pads: {}, touch: {}, held: {}, lib: null,
  sys: 'nes', kind: null, axes: [0, 0, 0, 0] };
/* NES buttons in jsnes's numbering, so every input source speaks one language. */
const NES_B = { a: 0, b: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7 };
/* KEYS BY WHERE THEY ARE (`e.code`), per system (419): arrows and WASD steer, Z/X are B/A, Q/E the shoulders, I/J/K/L a diamond of face buttons (N64: the C buttons). */
const NES_KEY_MOVE = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', KeyW: 'up', KeyS: 'down', KeyA: 'left', KeyD: 'right' };
const NES_KEY_MID = { Enter: 'start', NumpadEnter: 'start', ShiftLeft: 'select', ShiftRight: 'select' };
const NES_KEY_TWO = { KeyZ: 'b', KeyK: 'b', KeyX: 'a', KeyL: 'a', Space: 'a' };
const NES_KEY_LR = { KeyQ: 'l', KeyE: 'r' };
const NES_KEY_FOUR = { KeyZ: 'b', KeyK: 'b', KeyX: 'a', KeyL: 'a', Space: 'a', KeyC: 'y', KeyJ: 'y', KeyV: 'x', KeyI: 'x' };
/* N64 in RetroPad names: its A is RetroPad B and its B is RetroPad Y (391); Z is L2; the right stick is the C buttons. No Select. */
const NES_KEY_N64 = { KeyX: 'b', Space: 'b', KeyZ: 'y', KeyC: 'l2', ShiftLeft: 'l2', ShiftRight: 'l2', KeyQ: 'l', KeyE: 'r',
  KeyI: 'cu', KeyK: 'cd', KeyJ: 'cl', KeyL: 'cr', Enter: 'start', NumpadEnter: 'start' };
const NES_KEYMAP = {
  nes: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID), gb: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID),
  gbc: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_MID), gba: Object.assign({}, NES_KEY_MOVE, NES_KEY_TWO, NES_KEY_LR, NES_KEY_MID),
  snes: Object.assign({}, NES_KEY_MOVE, NES_KEY_FOUR, NES_KEY_LR, NES_KEY_MID), nds: Object.assign({}, NES_KEY_MOVE, NES_KEY_FOUR, NES_KEY_LR, NES_KEY_MID),
  n64: Object.assign({}, NES_KEY_MOVE, NES_KEY_N64) };
/* A BROWSER THAT SENDS NO `code` is read by the letter instead. */
const NES_KEY_OF = { ' ': 'Space', Spacebar: 'Space', Enter: 'Enter', Shift: 'ShiftLeft', ArrowUp: 'ArrowUp', ArrowDown: 'ArrowDown', ArrowLeft: 'ArrowLeft', ArrowRight: 'ArrowRight' };
function nesKeyFor_(e, sys) {
  const map = NES_KEYMAP[sys] || NES_KEYMAP.nes;
  const code = (e && e.code) || NES_KEY_OF[e && e.key] || (/^[a-z]$/i.test((e && e.key) || '') ? 'Key' + e.key.toUpperCase() : '');
  return map[code] || null;
}
/* WHAT THE LEGEND CALLS EACH BUTTON on that system, in the order it lists them. */
const NES_KEY_SAY = { a: 'A', b: 'B', x: 'X', y: 'Y', l: 'L', r: 'R', start: 'Start', select: 'Select' };
const NES_KEY_SAY_N64 = { b: 'A', y: 'B', l2: 'Z', l: 'L', r: 'R', cu: 'C↑', cd: 'C↓', cl: 'C←', cr: 'C→', start: 'Start' };
const NES_KEY_NAME = { Space: 'Space', Enter: 'Enter', ShiftLeft: 'Shift', ArrowUp: '↑', ArrowDown: '↓', ArrowLeft: '←', ArrowRight: '→' };
/* [what it does, the keys] for the legend: the steering first, then each button with every key that presses it. */
function nesKeyRows_(sys) {
  const map = NES_KEYMAP[sys] || NES_KEYMAP.nes, say = sys === 'n64' ? NES_KEY_SAY_N64 : NES_KEY_SAY;
  const rows = [[sys === 'n64' ? 'Stick' : 'Move', ['↑ ↓ ← →', 'W A S D']]];
  Object.keys(say).forEach(btn => {
    const keys = Object.keys(map).filter(c => map[c] === btn && !NES_KEY_MOVE[c] && c !== 'NumpadEnter' && c !== 'ShiftRight')
      .map(c => NES_KEY_NAME[c] || c.replace(/^Key/, ''));
    if (keys.length) rows.push([say[btn], keys]);
  });
  return rows;
}
function nesLegendHtml_(sys) {
  return nesKeyRows_(sys).map(([what, keys]) =>
    `<span class="nes-lg"><span class="nes-lg-k">${keys.map(k => `<kbd>${esc(k)}</kbd>`).join('')}</span><span class="nes-lg-v">${esc(what)}</span></span>`).join('');
}

/* THE ONE PLACE INDEXEDDB IS TOUCHED. Any failure (private window, blocked storage) is "no file kept"; a full device is remembered as `NES_.fullDb` (399). */
function nesDb_(mode, fn) {
  NES_.fullDb = false;
  const quota = e => { if (e && /quota/i.test(e.name || '')) NES_.fullDb = true; };
  return new Promise(res => {
    try {
      const rq = indexedDB.open(NES_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('rom');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('rom', mode), r = fn(tx.objectStore('rom'));
          tx.oncomplete = () => { res(r && 'result' in r ? r.result : true); rq.result.close(); };
          tx.onerror = tx.onabort = () => { quota(tx.error); res(null); rq.result.close(); };
        } catch (e) { quota(e); res(null); }
      };
    } catch (e) { res(null); }
  });
}
const nesKept_ = () => nesDb_('readonly', s => s.get('last'));
const nesKeep_ = (bytes, kind) => nesDb_('readwrite', s => { s.put(kind || 'nes', 'kind'); return s.put(bytes, 'last'); });
const nesForgetDb_ = () => nesDb_('readwrite', s => { s.delete('kind'); return s.delete('last'); });
const nesKind_ = () => nesDb_('readonly', s => s.get('kind'));

/* iNES: "NES" then 0x1A, and at least one 16 KB bank after the 16-byte header. */
function nesValid_(u8) {
  return !!u8 && u8.length >= 16 + 16384 && u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a;
}

function nesPaint_() {
  const box = $('nes-box');
  if (!box) return;
  /* NOT REDRAWN WHILE A GAME PLAYS (478): the tiles rewritten under a running core cost a layout per call and gave nothing. */
  if (NES_.running && box.querySelector('.nes-wrap')) return;
  if (!USER) { box.innerHTML = empty_('Sign in to use the console.'); return; }
  if (!box.querySelector('.nes-wrap')) {
    box.innerHTML = `<div class="nes-wrap" id="nes-wrap">
      <span class="ds-part ds-lid" aria-hidden="true"><i class="ds-grille"></i><i class="ds-grille ds-grille-r"></i></span><span class="ds-part ds-base" aria-hidden="true"><i class="ds-power"></i></span>
      <span class="ds-part ds-cover ds-cover-a" aria-hidden="true"></span><span class="ds-part ds-cover ds-cover-b" aria-hidden="true"></span><span class="ds-part ds-hinge" id="ds-hinge" aria-hidden="true"></span>
      <div class="nes-stage" id="nes-stage"><canvas id="nes-canvas" class="nes-canvas" width="256" height="240"></canvas><span class="nes-hinge" id="nes-hinge" aria-hidden="true"></span><div class="nes-ctl nes-deco" id="nes-deco" aria-hidden="true"></div></div>
      <div class="nes-legend" id="nes-legend" aria-label="Keys" hidden></div>
      <div class="nes-ctl nes-pad" id="nes-pad" aria-hidden="true">${nesPadHtml_(NES_.sys)}</div>
    </div>
    <p id="nes-padnote" hidden>Controller connected</p>
    <div class="tile-row" id="nes-tiles"></div>
    <p class="note" id="nes-say" role="status"></p>
    <p id="nes-kept" hidden></p>
    <p id="nes-sysnote" hidden></p>
    <input type="file" id="nes-file" class="nes-file" accept="${NES_ACCEPT}">`;
    nesPadWire_($('nes-pad'));
    nesModeWire_($('nes-wrap'));
    nesSeen_($('nes-wrap'));
    /* A REDRAWN SCREEN KEEPS A RUNNING GAME: EmulatorJS's own box moves into the new stage rather than being lost with the old one. */
    const host = EMU_.ejs && EMU_.ejs.elements && EMU_.ejs.elements.parent;
    if (host && $('nes-stage')) $('nes-stage').appendChild(host);
  }
  nesSysSet_(NES_.sys);
  nesBlit_();
  nesRowPaint_();
  csvLine_();
  if (NES_.saved == null) Promise.all([nesKept_(), nesKind_()]).then(([b, k]) => {
    NES_.saved = b ? new Uint8Array(b) : false; NES_.kind = typeof k === 'string' ? k : null;
    /* THE KEPT GAME'S SHAPE AND PAD NOW, not when Play is pressed: the stage changes shape once, before anyone is looking at a game (419). */
    if (NES_.saved && NES_DIMS[NES_.kind] && !NES_.rom && !EMU_.ejs) nesSysSet_(NES_.kind);
    nesRowPaint_(); });
}

/* THE CONSOLE'S TILES AS `tile_` OPTIONS: the same tiles playing or not (419), so the row never grows under a thumb; Forget is greyed with nothing kept. */
function nesOpts_() {
  const have = NES_.rom || NES_.saved, keys = nesLegendOn_();
  return [NES_.running ? { icon: 'pause', label: 'Pause', act: 'nes-pause' } : { icon: 'play', label: 'Play', act: 'nes-play', note: have ? '' : 'choose a game file' },
    { icon: 'open', label: 'Choose file', act: 'nes-pick' },
    { icon: 'bin', label: 'Forget file', act: 'nes-forget', off: !have, note: have ? '' : 'nothing kept' },
    nesMode_() === 'touch' ? null : { icon: 'keys', label: 'Keys', act: 'nes-keys', on: keys, pressed: keys, note: keys ? 'hide the key list' : 'show the key list' }];
}
/* THE ROW, REPAINTED; the padlock is the widget's (`gameLockTile_`, 461). */
function nesRowPaint_() {
  const t = $('nes-tiles');
  if (!t) return;
  t.innerHTML = tile_(nesOpts_());
  nesPadShow_();
}

const nesSay_ = s => { const p = $('nes-say'); if (p) p.textContent = s || ''; };

/* THE SCRIPT, ONCE, from the pinned CDN and then its mirror. */
function nesLib_() {
  if (window.jsnes && window.jsnes.NES) return Promise.resolve(window.jsnes);
  if (NES_.lib) return NES_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.crossOrigin = 'anonymous';
    s.onload = () => (window.jsnes && window.jsnes.NES ? ok(window.jsnes) : no(new Error('no engine')));
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  NES_.lib = one(NES_LIB).catch(() => one(NES_LIB_2)).catch(e => { NES_.lib = null; throw e; });
  return NES_.lib;
}

/* SOUND MUST BE MADE INSIDE THE TAP on iOS, so this runs synchronously in every handler that may start a game. */
function nesAudio_() {
  try {
    if (!NES_.audio) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      NES_.audio = new AC();
      NES_.ring = new Float32Array(8192 * 2); NES_.rd = NES_.wr = 0;
      const node = NES_.audio.createScriptProcessor(1024, 0, 2);
      node.onaudioprocess = e => {
        const L = e.outputBuffer.getChannelData(0), R = e.outputBuffer.getChannelData(1), n = NES_.ring.length;
        for (let i = 0; i < L.length; i++) {
          if (NES_.rd !== NES_.wr && NES_.running) { L[i] = NES_.ring[NES_.rd]; R[i] = NES_.ring[NES_.rd + 1]; NES_.rd = (NES_.rd + 2) % n; }
          else { L[i] = 0; R[i] = 0; }
        }
      };
      node.connect(NES_.audio.destination);
      NES_.node = node;
    }
    if (NES_.audio.state === 'suspended') NES_.audio.resume();
  } catch (e) {}
}
function nesSample_(l, r) {
  const n = NES_.ring.length, nx = (NES_.wr + 2) % n;
  if (nx === NES_.rd) return;   // full: drop rather than lag
  NES_.ring[NES_.wr] = l; NES_.ring[NES_.wr + 1] = r; NES_.wr = nx;
}

function nesFrame_(buf) {
  if (!NES_.u32) return;
  for (let i = 0; i < 61440; i++) NES_.u32[i] = 0xff000000 | buf[i];
  nesBlit_();
}
function nesBlit_() {
  const c = $('nes-canvas');
  if (!c || !NES_.img) return;
  const g = c.getContext('2d');
  if (g) g.putImageData(NES_.img, 0, 0);
}

function nesStart_(bytes) {
  const stage = $('nes-stage');
  if (!stage) return;
  const sys = nesSys_(bytes, NES_.kind);
  if (!sys) { nesSay_(NES_NOT); return; }
  if (sys !== 'nes') { emuStart_(bytes, sys); return; }
  emuEnd_(); nesSysSet_('nes');
  nesSay_('');
  waiting_(stage);
  nesLib_().then(lib => {
    loaded_(stage);
    nesStop_();
    try {
      NES_.nes = new lib.NES({ onFrame: nesFrame_, onAudioSample: NES_.ring ? nesSample_ : null,
        emulateSound: !!NES_.ring, sampleRate: NES_.audio ? NES_.audio.sampleRate : 48000 });
      NES_.nes.loadROM(bytes);
    } catch (e) { NES_.nes = null; nesSay_('This game file could not be started: ' + (e && e.message || e)); return; }
    NES_.rom = bytes;
    NES_.img = $('nes-canvas').getContext('2d').createImageData(256, 240);
    NES_.u32 = new Uint32Array(NES_.img.data.buffer);
    nesGo_();
    csvBegin_(bytes, 'nes', 'nes', csvApplyNes_);
  }).catch(() => { loaded_(stage); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

function nesGo_() {
  if (EMU_.ejs) { emuGo_(); return; }
  if (!NES_.nes || NES_.running) return;
  nesRun_(true); NES_.last = 0; NES_.acc = 0;
  const loop = t => {
    if (!NES_.running) return;
    NES_.raf = requestAnimationFrame(loop);
    if (!$('nes-canvas')) { nesStop_(); return; }
    const dt = NES_.last ? Math.min(100, t - NES_.last) : 1000 / NES_HZ;
    NES_.last = t; NES_.acc += dt;
    nesPadsPoll_();
    let n = 0;
    while (NES_.acc >= 1000 / NES_HZ && n < 3) {
      try { NES_.nes.frame(); } catch (e) { nesStop_(); nesSay_('The game stopped: ' + (e && e.message || e)); return; }
      NES_.acc -= 1000 / NES_HZ; n++;
    }
    if (n === 3) NES_.acc = 0;
  };
  NES_.raf = requestAnimationFrame(loop);
  nesRowPaint_();
}
/* PAUSED, NOT ENDED: the game stays in memory and Play carries on from here. */
function nesStop_(force) {
  const was = NES_.running;
  nesRun_(false);
  cancelAnimationFrame(NES_.raf);
  NES_.held = {}; NES_.keys = {}; NES_.codes = {}; NES_.touch = {};
  if (NES_.nes) Object.values(NES_B).forEach(b => { try { NES_.nes.buttonUp(1, b); } catch (e) {} });
  if (EMU_.ejs) emuPause_(force);
  else if (was && NES_.nes) csvKeep_(force);
  if (was) nesRowPaint_();
}

/* EVERY SOURCE (keys, pad, touch) IS OR-ED, then only changes reach the engine. */
function nesSync_() {
  nesLight_();
  if (EMU_.ejs) { emuSync_(); return; }
  if (!NES_.nes) return;
  Object.keys(NES_B).forEach(k => {
    const on = !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
    if (on === !!NES_.held[k]) return;
    NES_.held[k] = on;
    try { on ? NES_.nes.buttonDown(1, NES_B[k]) : NES_.nes.buttonUp(1, NES_B[k]); } catch (e) {}
  });
}

/* THE DRAWN BUTTONS LIGHT UNDER THE KEYS AND A CONTROLLER (437), so a key list's "X  A" is seen pressing the console's A; touched only when what is held changes. */
function nesLight_() {
  const held = Object.assign({}, NES_.keys, NES_.pads), sig = Object.keys(held).sort().join();
  if (sig === NES_.lit) return;
  NES_.lit = sig;
  const d = $('nes-deco');
  if (d) d.querySelectorAll('[data-k]').forEach(el => el.classList.toggle('is-down', el.dataset.k === 'dpad'
    ? ['up', 'down', 'left', 'right'].some(k => held[k]) : !!held[el.dataset.k]));
}

/* EVERY PAD, EVERY FRAME, connected event or not: Safari shows a pad only after a press with the page focused (390). Nintendo positions: right face A, bottom B. */
function nesPadsPoll_() {
  const p = {}, axes = [0, 0, 0, 0];
  let any = false;
  try {
    [...(navigator.getGamepads ? navigator.getGamepads() : [])].forEach(g => {
      if (!g || g.connected === false) return;
      any = true;
      const b = i => !!(g.buttons && g.buttons[i] && (g.buttons[i].pressed || g.buttons[i].value > 0.5));
      const ax = g.axes || [], x = Math.abs(ax[0] || 0) > 0.25 ? ax[0] : 0, y = Math.abs(ax[1] || 0) > 0.25 ? ax[1] : 0, std = g.mapping === 'standard';
      const four = NES_FOUR[NES_.sys], stick = NES_.sys !== 'n64';
      if (four) { if (b(1)) p.a = 1; if (b(0)) p.b = 1; if (b(3)) p.x = 1; if (b(2)) p.y = 1; }
      else { if (b(1) || b(3)) p.a = 1; if (b(0) || b(2)) p.b = 1; }
      if (b(4)) p.l = 1;
      if (b(5)) p.r = 1;
      if (std && b(6)) p.l2 = 1;
      if (std && b(7)) p.r2 = 1;
      if (b(10)) p.l3 = 1;
      if (b(11)) p.r3 = 1;
      if (b(9) || (!std && b(7))) p.start = 1;
      if (b(8) || (!std && b(6))) p.select = 1;
      if (b(12) || (stick && y < -0.5)) p.up = 1;
      if (b(13) || (stick && y > 0.5)) p.down = 1;
      if (b(14) || (stick && x < -0.5)) p.left = 1;
      if (b(15) || (stick && x > 0.5)) p.right = 1;
      const dz = v => (Math.abs(v || 0) > 0.25 ? Math.max(-1, Math.min(1, v)) : 0);
      if (!axes[0] && !axes[1]) { axes[0] = x; axes[1] = y; }
      if (!axes[2] && !axes[3]) { axes[2] = dz(ax[2]); axes[3] = dz(ax[3]); }
      /* A HAT SWITCH on axis 9 (many non-standard pads): -1 is up, clockwise in steps of 2/7, above 1 is centred. */
      const h = ax[9];
      if (!std && typeof h === 'number' && h >= -1.05 && h <= 1.05) {
        const s = Math.round((h + 1) * 3.5) % 8;
        if (s === 7 || s <= 1) p.up = 1;
        if (s >= 1 && s <= 3) p.right = 1;
        if (s >= 3 && s <= 5) p.down = 1;
        if (s >= 5 && s <= 7) p.left = 1;
      }
    });
  } catch (e) {}
  const wasStart = !!(NES_.pads && NES_.pads.start), was = Object.keys(NES_.pads || {}).length;
  NES_.pads = p; NES_.axes = axes;
  if (Object.keys(p).length && !was) { nesAudio_(); emuWake_(); }   // any press is a gesture enough to wake the sound

  if (any !== !!NES_.padOn) { NES_.padOn = any; nesPadShow_(); }
  if (p.start && !wasStart && !NES_.running) nesPadPlay_();
  nesSync_();
}

/* A CONTROLLER'S START BEGINS PLAY with a kept game; with none, it can only say so — a file picker needs a tap. */
function nesPadPlay_() {
  if (NES_.nes || EMU_.ready) { nesAudio_(); nesGo_(); return; }
  if (EMU_.ejs) return;
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesAudio_(); nesStart_(bytes); return; }
  nesSay_('Controller connected. Choose a game file to play.');
}

/* WHILE NOTHING RUNS the game loop does not poll, so this does, for as long as the console is drawn. */
function nesPadWatch_() {
  if (NES_.watch) return;
  const tick = () => {
    if (!$('nes-wrap')) { NES_.watch = 0; return; }
    if (!NES_.running || EMU_.ejs) nesPadsPoll_();
    NES_.watch = requestAnimationFrame(tick);
  };
  NES_.watch = requestAnimationFrame(tick);
}
function nesPadUnwatch_() { cancelAnimationFrame(NES_.watch); NES_.watch = 0; }

/* TOUCH OR KEYS (419): a coarse pointer starts on the touch pad, a fine one on keys; a finger on the console or a key while it plays changes it. */
function nesMode_() {
  if (!NES_.mode) {
    let coarse = false;
    try { coarse = !!(window.matchMedia && matchMedia('(pointer: coarse)').matches); } catch (e) {}
    const touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    NES_.mode = coarse && touch ? 'touch' : 'keys';
  }
  return NES_.mode;
}
function nesModeSet_(m) {
  if (nesMode_() === m) return;
  NES_.mode = m;
  nesPadShow_(); nesRowPaint_();
}
function nesModeWire_(w) {
  if (!w) return;
  w.addEventListener('pointerdown', e => { if (e.pointerType === 'touch') nesModeSet_('touch'); }, true);
}
/* THE KEY LIST: hidden until the Keys tile asks, on every system, and not remembered (481): a "show" kept from before 478 was still showing it. */
try { localStorage.removeItem('nes-keys'); } catch (e) {}
function nesLegendOn_() {
  return nesMode_() === 'keys' && NES_.legend === true;
}
on('nes-keys', () => {
  NES_.legend = !nesLegendOn_();
  nesPadShow_(); nesRowPaint_();
});

/* THE TOUCH PAD on touch with no controller, from the first paint, so nothing moves when a game starts (419); the key list beside it. */
function nesPadShow_() {
  const pad = $('nes-pad'), lg = $('nes-legend'), w = $('nes-wrap');
  if (!pad) return;
  /* THE DS ALWAYS WEARS ITS BUTTONS (478): its pad is the lower shell, pressed by a finger or a mouse alike. */
  const on = NES_.sys === 'nds' || (nesMode_() === 'touch' && !NES_.padOn);
  pad.classList.toggle('on', on);
  if (w) { w.classList.toggle('nes-has-pad', on); w.classList.toggle('nes-has-deco', !on); }
  if (lg) {
    if (lg.dataset.sys !== NES_.sys) { lg.dataset.sys = NES_.sys; lg.innerHTML = nesLegendHtml_(NES_.sys); }
    lg.hidden = !nesLegendOn_();
    if (w) w.classList.toggle('nes-has-legend', !lg.hidden);
  }
  const n = $('nes-padnote');
  if (n) n.hidden = !NES_.padOn;
}

function nesPadWire_(pad) {
  if (!pad) return;
  const dirs = (el, e) => {
    const r = el.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
    const dead = r.width * 0.15;
    return { left: dx < -dead, right: dx > dead, up: dy < -dead, down: dy > dead };
  };
  /* ONE ENTRY PER FINGER, so two held buttons stay held while a third comes and goes; each finger is captured by the pad itself (419). */
  const ptrs = new Map();
  const redo = () => {
    const t = {};
    ptrs.forEach(v => Object.keys(v.keys).forEach(k => { if (v.keys[k]) t[k] = 1; }));
    NES_.touch = t; nesSync_();
    pad.querySelectorAll('[data-k]').forEach(el => el.classList.toggle('is-down', el.dataset.k === 'dpad'
      ? ['up', 'down', 'left', 'right'].some(d => t[d]) : !!t[el.dataset.k]));
  };
  /* A FINGER SLID FROM ONE FACE BUTTON ONTO ANOTHER presses the one it is on now; the D-pad keeps the finger that started on it. */
  const under = e => { const el = document.elementFromPoint(e.clientX, e.clientY); const k = el && el.closest && el.closest('[data-k]'); return k && pad.contains(k) ? k : null; };
  pad.addEventListener('pointerdown', e => {
    const k = e.target.closest('[data-k]');
    if (!k) return;
    e.preventDefault(); emuWake_();
    try { pad.setPointerCapture(e.pointerId); } catch (err) {}
    ptrs.set(e.pointerId, { el: k, keys: k.dataset.k === 'dpad' ? dirs(k, e) : { [k.dataset.k]: true } });
    redo();
  });
  pad.addEventListener('pointermove', e => {
    const p = ptrs.get(e.pointerId);
    if (!p) return;
    if (p.el.dataset.k === 'dpad') { p.keys = dirs(p.el, e); redo(); return; }
    const k = under(e);
    if (k && k !== p.el && k.dataset.k !== 'dpad') { p.el = k; p.keys = { [k.dataset.k]: true }; redo(); }
  });
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(n =>
    pad.addEventListener(n, e => { if (ptrs.delete(e.pointerId)) redo(); }));
  pad.addEventListener('contextmenu', e => e.preventDefault());
  /* NO SELECTING, MAGNIFYING OR DOUBLE-TAP ZOOM under a held thumb (iOS starts those from touch events, not pointer ones). */
  pad.addEventListener('touchstart', e => { if (e.cancelable) e.preventDefault(); }, { passive: false });
}

/* A PAD KEY PRESSED WITH NO GAME RUNNING says what to do, rather than nothing (owner, 12 Nov). */
document.addEventListener('click', e => {
  const k = e.target && e.target.closest && e.target.closest('.nes-pad [data-k]');
  if (!k || NES_.nes || EMU_.ready) return;
  document.querySelectorAll('[id="nes-kept"]').forEach(n => { n.hidden = false; n.textContent = 'Choose a game file you own to play it.'; });
});
on('nes-play', () => {
  nesAudio_(); emuWake_();
  if (NES_.nes || EMU_.ready) { nesGo_(); return; }
  if (EMU_.ejs) return;   // still loading: it starts by itself
  const bytes = NES_.rom || NES_.saved;
  if (bytes) { nesStart_(bytes); return; }
  /* NOTHING TO PLAY YET: say so on every copy, then open the chooser (a press always answers, owner 12 Nov). */
  document.querySelectorAll('[id="nes-kept"]').forEach(n => { n.hidden = false; n.textContent = 'Choose a game file you own to play it.'; });
  const f = $('nes-file');
  if (f) f.click();
});
on('nes-pick', () => { nesAudio_(); const f = $('nes-file'); if (f) f.click(); });
on('nes-pause', () => nesStop_());
on('nes-forget', () => {
  nesStop_();
  emuEnd_();
  NES_.nes = null; NES_.rom = null; NES_.saved = false; NES_.kind = null; NES_.img = null; NES_.u32 = null;
  const c = $('nes-canvas'); if (c) c.getContext('2d').clearRect(0, 0, 256, 240);
  nesForgetDb_().then(() => { nesRowPaint_(); nesSay_('Forgotten. The file is no longer kept on this device.'); });
});

document.addEventListener('change', e => {
  if (!e.target || e.target.id !== 'nes-file') return;
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  f.arrayBuffer().then(ab => {
    const u8 = new Uint8Array(ab), sys = nesSys_(u8, f.name);
    if (!sys) { nesSay_(NES_NOT); return; }
    nesStop_(); emuEnd_();
    NES_.nes = null; NES_.rom = null; NES_.saved = u8; NES_.kind = sys;
    /* put() copies the bytes as it is called, so no second copy is made first: a DS file can be 256 MB (399). */
    nesKeep_(ab, sys).then(ok => { if (ok || !NES_.fullDb) return; nesSay_(NES_ROOM); nesForgetDb_(); });
    nesStart_(u8);
  }).catch(() => nesSay_('That file could not be read.'));
});

/* KEYS ONLY WHILE A GAME RUNS, and the arrows and Space neither turn the column nor scroll the page under it; a shortcut with Ctrl, Alt or Cmd is the browser's. */
['keydown', 'keyup'].forEach(type => document.addEventListener(type, e => {
  if (!NES_.running) return;
  const k = nesKeyFor_(e, NES_.sys);
  if (!k) return;
  if (e.target && /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
  const down = type === 'keydown';
  if (down && (e.ctrlKey || e.metaKey || e.altKey)) return;
  e.preventDefault(); e.stopPropagation();
  if (down && nesMode_() !== 'keys') nesModeSet_('keys');
  /* BY KEY, so Z let go while K still holds B leaves B held. */
  const code = e.code || e.key, codes = NES_.codes || (NES_.codes = {});
  if (!!codes[code] === down) return;   // a held key repeating
  if (down) codes[code] = k; else delete codes[code];
  const keys = {};
  Object.keys(codes).forEach(c => { keys[codes[c]] = true; });
  NES_.keys = keys; nesSync_();
}, true));
/* A KEY LET GO WHILE THE WINDOW HAD NO FOCUS never sends its keyup: nothing stays held after a switch away. */
window.addEventListener('blur', () => { NES_.codes = {}; if (Object.keys(NES_.keys).length) { NES_.keys = {}; nesSync_(); } });

/* ---------- THE REST OF THE APP HOLDS STILL WHILE A GAME PLAYS (419): the builder, every other widget, and the looping animations. */
function nesRun_(on) {
  NES_.running = !!on;
  nesQuiet_(NES_.running);
}
function nesQuiet_(on) {
  if (!!on === !!NES_.quiet) return;
  NES_.quiet = !!on;
  try { document.body.classList.toggle('nes-on', NES_.quiet); } catch (e) {}
  if (NES_.quiet) {
    /* THE BUILDER'S OWN HOLD (shell.js), taken only if nobody else holds it, and given back the same way. */
    if (!window.__aheadHold) { window.__aheadHold = true; NES_.aheadHeld = true; }
    try { toolsStop_(e => String(e.w.id) === 'console', () => false); } catch (e) {}
    return;
  }
  if (NES_.aheadHeld) { NES_.aheadHeld = false; window.__aheadHold = false; try { aheadKick_(); } catch (e) {} }
  /* AFTER THIS TASK: a pause can come from inside `toolsStop_` (the column being left), which must finish first. */
  setTimeout(() => {
    if (NES_.quiet) return;
    try { if (WIDGET_COLS.indexOf(AT) !== -1) widgetsWake_(widgetsOn_(AT), AT, true); widgetsGlass_(true); } catch (e) {}
  }, 0);
}

document.addEventListener('visibilitychange', () => { if (document.hidden) nesStop_(true); });
/* OFF THE SCREEN IS PAUSED (478): a console scrolled or slid out of view stops running the core for nobody. */
function nesSeen_(w) {
  if (!w || w.seen_ || typeof window.IntersectionObserver !== 'function') return;
  w.seen_ = true;
  try { new window.IntersectionObserver(es => es.forEach(e => { if (!e.isIntersecting && NES_.running && e.target.isConnected) nesStop_(); })).observe(w); } catch (e) {}
}
window.addEventListener('gamepadconnected', () => { NES_.padOn = true; nesPadShow_(); nesPadWatch_(); });
window.addEventListener('gamepaddisconnected', () => nesPadsPoll_());

/* ---------- THE OTHER SYSTEMS (391): SNES, Game Boy / Color / Advance, N64 and DS (399), the person's own files.
   EmulatorJS (GPL-3.0) and its cores, pinned, fetched only when one is played. */
const NES_ACCEPT = '.nes,.sfc,.smc,.gb,.gbc,.gba,.z64,.n64,.v64,.nds,application/octet-stream,*&#47;*';
const NES_ROOM = "This device hasn't room to keep the file — pick it each time.";
const NES_NOT = 'That is not a console game file — it should be a .nes, .sfc/.smc, .gb/.gbc/.gba, .z64/.n64/.v64 or .nds file.';
/* THE DS HINGE (437, 481): melonDS leaves this many black rows between its screens; the two halves and the hinge are drawn over exactly them (90 is a real DS Lite's spacing), so no game pixel is covered and the pen lands where put. */
const NES_GAP = 90;
/* Each system's picture in pixels, for the stage's shape and the full-screen fit. DS: its two 256x192 screens stacked, top above bottom, the hinge's rows between. */
const NES_DIMS = { nes: [256, 240], snes: [256, 224], gb: [160, 144], gbc: [160, 144], gba: [240, 160], n64: [320, 240], nds: [256, 384 + NES_GAP] };
/* THE SHAPE A TELEVISION SHOWED (446): a home console's pixels were wider than tall, so its picture is 4:3; a handheld's are square. */
const NES_SHOW = { nes: 4 / 3, snes: 4 / 3, n64: 4 / 3 };
const nesShow_ = sys => NES_SHOW[sys] || NES_DIMS[sys][0] / NES_DIMS[sys][1];
/* Systems with four face buttons read a controller by position (right A, bottom B, top X, left Y); two-button ones fold them onto A and B. */
const NES_FOUR = { snes: 1, n64: 1, nds: 1 };
/* THE ONE LINE UNDER A HEAVY SYSTEM, said plainly: these run on the page's one thread, and a slow laptop or an older phone shows it (419). */
const NES_SLOW = { n64: 'N64 games need a fast device; older phones may stutter.',
  nds: 'DS games need a fast device; on an older laptop or phone they may run slow. Closing other tabs helps.' };
const NES_NAME = { nes: 'NES', snes: 'SNES', gb: 'Game Boy', gbc: 'Game Boy Color', gba: 'Game Boy Advance', n64: 'N64', nds: 'DS' };

/* WHICH SYSTEM, from the bytes first (header magic and checksums), then the file's extension. Nothing of any game is kept here. */
function nesSys_(u8, hint) {
  if (!u8 || u8.length < 512) return null;
  const ext = String(hint || '').toLowerCase().replace(/^.*\./, '');
  if (u8[0] === 0x4e && u8[1] === 0x45 && u8[2] === 0x53 && u8[3] === 0x1a) return nesValid_(u8) ? 'nes' : null;
  if (nesDs_(u8)) return 'nds';
  const w = (u8[0] << 24 | u8[1] << 16 | u8[2] << 8 | u8[3]) >>> 0;
  if (w === 0x80371240 || w === 0x37804012 || w === 0x40123780) return 'n64';   // big-endian, byte-swapped, little-endian
  if (u8.length >= 0xc0 && u8[0xb2] === 0x96 && u8[3] === 0xea) return 'gba';   // fixed byte, and a branch as the first word
  if (u8.length >= 0x8000) {
    let x = 0;
    for (let i = 0x134; i <= 0x14c; i++) x = (x - u8[i] - 1) & 0xff;
    if (x === u8[0x14d] && (u8[0x100] === 0x00 || u8[0x100] === 0xc3)) return u8[0x143] & 0x80 ? 'gbc' : 'gb';
    const off = u8.length % 1024 === 512 ? 512 : 0;
    const ok = at => { const b = off + at; return b + 0x20 <= u8.length && ((u8[b + 0x1c] | u8[b + 0x1d] << 8) ^ (u8[b + 0x1e] | u8[b + 0x1f] << 8)) === 0xffff; };
    if (ok(0x7fc0) || ok(0xffc0)) return 'snes';
  }
  const by = { sfc: 'snes', smc: 'snes', snes: 'snes', gb: 'gb', gbc: 'gbc', gba: 'gba', z64: 'n64', n64: 'n64', v64: 'n64', nds: 'nds' };
  return by[ext] || (by[hint] ? hint : null);
}

/* A DS CARTRIDGE HEADER: the logo's fixed checksum 0xCF56 at 0x15C, and the header's own CRC-16 (over 0-0x15D) at 0x15E. */
function nesDs_(u8) {
  if (u8.length < 0x200 || u8[0x15c] !== 0x56 || u8[0x15d] !== 0xcf) return false;
  let c = 0xffff;
  for (let i = 0; i < 0x15e; i++) { c ^= u8[i]; for (let j = 0; j < 8; j++) c = c & 1 ? (c >>> 1) ^ 0xa001 : c >>> 1; }
  return c === (u8[0x15e] | u8[0x15f] << 8);
}

/* THE TOUCH PAD per system: shoulders, a face diamond on SNES and DS, A, B, Z and C on N64 (no Select: it has none).
   `drawn`: the same buttons as pictures beside the screen while keys play (437), spans. */
function nesPadHtml_(sys, drawn) {
  const tag = drawn ? 'span' : 'button', type = drawn ? '' : ' type="button"';
  const k = (key, label, cls) => `<${tag}${type} class="nes-key ${cls || 'nes-round'}" data-k="${key}">${label}</${tag}>`;
  const mid = `<div class="nes-mid">${sys === 'n64' ? '' : k('select', 'Select', 'nes-small')}${k('start', 'Start', 'nes-small')}</div>`;
  const dpad = `<div class="nes-dpad${sys === 'n64' ? ' nes-stick' : ''}" data-k="dpad"></div>`;
  let top = '', face;
  if (sys === 'snes' || sys === 'nds') {
    top = k('l', 'L', 'nes-small nes-l') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-face">${k('x', 'X', 'nes-round nes-n nes-x')}${k('y', 'Y', 'nes-round nes-w nes-y')}${k('a', 'A', 'nes-round nes-e nes-a')}${k('b', 'B', 'nes-round nes-s nes-b')}</div>`;
  } else if (sys === 'n64') {
    top = k('l', 'L', 'nes-small nes-l') + k('l2', 'Z', 'nes-small nes-z') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-right"><div class="nes-ab">${k('y', 'B', 'nes-round nes-b')}${k('b', 'A', 'nes-round nes-a')}</div>`
      + `<div class="nes-face nes-c">${k('cu', 'C↑', 'nes-c1 nes-n')}${k('cl', 'C←', 'nes-c1 nes-w')}${k('cr', 'C→', 'nes-c1 nes-e')}${k('cd', 'C↓', 'nes-c1 nes-s')}</div></div>`;
  } else {
    if (sys === 'gba') top = k('l', 'L', 'nes-small nes-l') + k('r', 'R', 'nes-small nes-r');
    face = `<div class="nes-ab">${k('b', 'B', 'nes-round nes-b')}${k('a', 'A', 'nes-round nes-a')}</div>`;
  }
  return (top ? `<div class="nes-shoulders">${top}</div>` : '') + dpad + mid + face;
}

/* ONE SYSTEM AT A TIME on the stage: its shape, its pad, and the N64 line about older phones. */
function nesSysSet_(sys) {
  NES_.sys = sys || 'nes';
  const s = $('nes-stage'), pad = $('nes-pad'), note = $('nes-sysnote'), wrap = $('nes-wrap');
  if (wrap) { wrap.dataset.sys = NES_.sys; wrap.style.setProperty('--ds-gap', String(NES_GAP)); }   // its pad's height; the DS's gap rows, style.css
  /* `--nes-ar` too: the stage's width is capped by the screen's height through it (style.css), so a tall DS picture fits a laptop's screen. */
  if (s) { const ar = nesShow_(NES_.sys); s.style.aspectRatio = String(ar); s.style.setProperty('--nes-ar', String(ar)); s.dataset.sys = NES_.sys; }
  if (pad && pad.dataset.sys !== NES_.sys) {
    pad.dataset.sys = NES_.sys; pad.innerHTML = nesPadHtml_(NES_.sys);
  }
  const deco = $('nes-deco');
  if (deco && deco.dataset.sys !== NES_.sys) { deco.dataset.sys = NES_.sys; deco.innerHTML = nesPadHtml_(NES_.sys, true); NES_.lit = null; nesLight_(); }
  /* THE HINGE over the DS's black rows between its screens, as fractions of the stage so it follows any size. */
  const hinge = $('nes-hinge');
  if (hinge) { const [, h] = NES_DIMS[NES_.sys]; hinge.style.top = (NES_.sys === 'nds' ? 19200 / h : 0) + '%'; hinge.style.height = (NES_.sys === 'nds' ? 100 * NES_GAP / h : 0) + '%'; }
  if (note) { note.hidden = !EMU_HEAVY[NES_.sys]; note.textContent = NES_SLOW[NES_.sys] || ''; }
  nesPadShow_();
}

/* ---------- EMULATORJS, ONCE, with its menus, start button, own keys and own pad switched off: the Console's tiles and inputs drive it. */
const EMU_VER = '4.2.3';
const EMU_CDN = ['https://cdn.jsdelivr.net/npm/', 'https://unpkg.com/'];
const EMU_SRC = ['storage.js', 'gamepad.js', 'nipplejs.js', 'shaders.js', 'GameManager.js', 'compression.js', 'emulator.js'];
/* Gambatte for Game Boy and Color, mGBA for Advance (mGBA refused a Game Boy file in the test, 391). Safari on iPhone and iPad gets parallel_n64, as EmulatorJS itself chooses there. */
const EMU_CORE = { snes: 'snes9x', gb: 'gambatte', gbc: 'gambatte', gba: 'mgba', n64: 'mupen64plus_next', nds: 'melonds' };
/* RetroPad numbering (libretro): every input source's names land here. 16-23 are the sticks, sent as two half-axes each. */
const EMU_IDX = { b: 0, y: 1, select: 2, start: 3, up: 4, down: 5, left: 6, right: 7, a: 8, x: 9, l: 10, r: 11, l2: 12, r2: 13, l3: 14, r3: 15 };
const EMU_ = { ejs: null, ready: false, sys: null, key: '', base: null, lib: null, held: {}, ax: [] };

function emuLib_() {
  if (window.EmulatorJS && EMU_.base) return Promise.resolve(EMU_.base);
  if (EMU_.lib) return EMU_.lib;
  const one = src => new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = src; s.async = false; s.crossOrigin = 'anonymous';
    s.onload = ok;
    s.onerror = () => { s.remove(); no(new Error('engine did not load')); };
    document.head.appendChild(s);
  });
  const from = cdn => EMU_SRC.reduce((p, f) => p.then(() => one(cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/src/' + f)), Promise.resolve())
    .then(() => { if (!window.EmulatorJS) throw new Error('no engine'); emuQuiet_(); EMU_.base = cdn; return cdn; });
  EMU_.lib = from(EMU_CDN[0]).catch(() => from(EMU_CDN[1])).catch(e => { EMU_.lib = null; throw e; });
  return EMU_.lib;
}

/* TWO EMULATORJS COSTS ON A SLOW LAPTOP (419): its controller poll, a 10 ms timer though its controls are off (the Console polls
   each frame), and 64 ms of sound, which crackles at a DS or N64 game's first slow frame: 128. */
function emuQuiet_() {
  try {
    const G = window.GamepadHandler;
    if (G && !G.quiet_) { G.quiet_ = true; G.prototype.loop = function () {}; }
  } catch (e) {}
  try {
    const M = window.EJS_GameManager;
    if (M && !M.quiet_ && typeof M.prototype.getRetroArchCfg === 'function') {
      M.quiet_ = true;
      const cfg = M.prototype.getRetroArchCfg;
      M.prototype.getRetroArchCfg = function () {
        const s = cfg.call(this);
        return EMU_HEAVY[EMU_.sys] ? String(s).replace(/audio_latency = \d+/, 'audio_latency = 128') : s;
      };
    }
  } catch (e) {}
}
const EMU_HEAVY = { nds: 1, n64: 1 };
/* NOTHING EXTRA PER FRAME (481): EmulatorJS's own defaults, written down so a later version cannot turn them on; its five-minute save timer off, as the Console saves at a pause. */
const EMU_LEAN = { rewindEnabled: 'disabled', shader: 'disabled', 'save-save-interval': '0' };
/* THREADS NEED A CROSS-ORIGIN-ISOLATED PAGE, and GitHub Pages sends no COOP/COEP headers: the core runs on the page's one thread.
   On an isolated page the threaded build is taken, and melonDS draws 3D on its own thread. */
const emuThreads_ = () => !!(window.crossOriginIsolated && typeof SharedArrayBuffer === 'function');

/* A NAME FOR THE BATTERY SAVE, from the bytes, so two games never share one; the file's own name is never used. */
function emuName_(u8, sys) {
  let h = 0x811c9dc5;
  for (let i = 0; i < u8.length; i += 1 + (u8.length >> 22)) { h ^= u8[i]; h = Math.imul(h, 0x01000193) >>> 0; }
  return 'game-' + h.toString(16) + '-' + u8.length.toString(16) + '.' + ({ snes: 'sfc', gb: 'gb', gbc: 'gbc', gba: 'gba', n64: 'z64', nds: 'nds' })[sys];
}

const emuIos_ = () => /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const NES_NO_DS_IOS = 'DS games do not run on an iPhone or iPad yet. They play on a computer, or on an Android phone or tablet.';
function emuStart_(bytes, sys) {
  const stage = $('nes-stage');
  if (!stage) return;
  const name = emuName_(bytes, sys);
  if (EMU_.ejs && EMU_.key === name) { emuGo_(); return; }
  /* NOT THE DS ON AN IPHONE OR IPAD (446): "ds isn't working on my iPad" — melonDS stops there with no word, so a plain one is said instead. */
  if (sys === 'nds' && emuIos_()) { nesStop_(); emuEnd_(); nesSysSet_(sys); nesRowPaint_(); nesSay_(NES_NO_DS_IOS); return; }
  nesStop_(); NES_.nes = null; emuEnd_();
  nesSysSet_(sys); nesSay_('');
  NES_.rom = bytes;
  waiting_(stage);
  emuLib_().then(cdn => {
    if (!$('nes-stage')) return;
    const ios = emuIos_();
    const core = sys === 'n64' && ios ? 'parallel_n64' : EMU_CORE[sys], pkg = cdn + '@emulatorjs/core-' + core + '@' + EMU_VER + '/';
    const files = { [core + '.json']: pkg + 'reports/' + core + '.json' };
    const threads = emuThreads_();
    (threads ? ['-thread-wasm.data', '-thread-legacy-wasm.data'] : ['-wasm.data', '-legacy-wasm.data']).forEach(t => { files[core + t] = pkg + core + t; });
    const host = document.createElement('div');
    host.id = 'emu-host'; host.className = 'emu-host';
    $('nes-stage').appendChild(host);
    const none = { 0: {}, 1: {}, 2: {}, 3: {} };
    const ejs = new window.EmulatorJS('#emu-host', {
      gameUrl: bytes, gameName: name, system: core, dataPath: cdn + '@emulatorjs/emulatorjs@' + EMU_VER + '/data/',
      filePaths: files, startOnLoad: true, defaultControllers: none, noAutoFocus: true, disableLocalStorage: true,
      volume: 1, threads, backgroundColor: getComputedStyle(document.documentElement).getPropertyValue('--on-gold').trim(), buttonOpts: {}, cheats: [],
      defaultOptions: Object.assign({}, EMU_LEAN, sys === 'nds' ? Object.assign({ melonds_screen_gap: String(NES_GAP) }, threads ? { melonds_threaded_renderer: 'enabled' } : {}) : {}) });
    EMU_.ejs = ejs; EMU_.sys = sys; EMU_.key = name; EMU_.ready = false; EMU_.held = {}; EMU_.ax = [];
    const fail = m => { if (EMU_.ejs !== ejs) return; loaded_($('nes-stage')); emuEnd_(); nesRowPaint_(); nesSay_('This game file could not be started: ' + (m || 'the engine stopped') + '.'); };
    const said = ejs.startGameError.bind(ejs);
    ejs.startGameError = m => { try { said(m); } catch (e) {} fail(String(m || '').replace(/\s+/g, ' ')); };
    ejs['on']('start', () => {   // EmulatorJS's own event, not a tile
      if (EMU_.ejs !== ejs) return;
      loaded_($('nes-stage'));
      EMU_.ready = true;
      try { ejs.gameManager.setKeyboardEnabled(false); } catch (e) {}
      ejs.enableMouseLock = false;   // a DS screen is touched where it is, so a mouse click must not capture the pointer (399)
      if (sys === 'nds') emuTouch_(ejs.canvas);
      if (!$('nes-wrap') || document.hidden) { try { ejs.pause(true); } catch (e) {} nesRun_(false); }
      else nesRun_(true);
      emuWake_(); nesRowPaint_();
      csvBegin_(bytes, sys, name, csvApplyEmu_);
    });
  }).catch(() => { loaded_(stage); emuEnd_(); nesRowPaint_(); nesSay_('The console could not load. Check the connection and press Play again.'); });
}

/* A FINGER IS THE DS PEN: the core reads only the mouse, so the first finger on its picture is passed on as one (399). */
function emuTouch_(c) {
  if (!c || c.dataset.touch) return;
  c.dataset.touch = '1';
  let id = null;
  const as = (type, t) => c.dispatchEvent(new window.MouseEvent(type, { bubbles: true, cancelable: true, clientX: t.clientX, clientY: t.clientY, button: 0, buttons: type === 'mouseup' ? 0 : 1 }));
  const mine = e => [...e.changedTouches].find(t => t.identifier === id);
  c.addEventListener('touchstart', e => {
    e.preventDefault(); emuWake_();
    if (id !== null) return;
    const t = e.changedTouches[0]; id = t.identifier; as('mousemove', t); as('mousedown', t);
  }, { passive: false });
  c.addEventListener('touchmove', e => { e.preventDefault(); const t = mine(e); if (t) as('mousemove', t); }, { passive: false });
  ['touchend', 'touchcancel'].forEach(n => c.addEventListener(n, e => { const t = mine(e); if (t) { id = null; as('mouseup', t); } }));
}

function emuGo_() {
  if (!EMU_.ready || NES_.running) return;
  try { EMU_.ejs.play(true); } catch (e) { return; }
  nesRun_(true); emuWake_(); nesRowPaint_();
}
/* PAUSE KEEPS THE BATTERY SAVE: the cartridge's memory is written to this device's IndexedDB (EmulatorJS's own) at every pause. */
function emuPause_(force) {
  if (!EMU_.ready) return;
  emuSync_(true);
  try { EMU_.ejs.pause(true); } catch (e) {}
  try { EMU_.ejs.gameManager.saveSaveFiles(); } catch (e) {}
  csvKeep_(force);
}
/* THE SOUND WAKES INSIDE A TAP: iOS starts EmulatorJS's audio suspended, and its own "click to resume" box is hidden with its menus. */
function emuWake_() {
  try {
    const al = EMU_.ejs && EMU_.ejs.Module && EMU_.ejs.Module.AL;
    if (al && al.currentCtx) al.currentCtx.sources.forEach(c => { const x = c.gain && c.gain.context; if (x && x.state === 'suspended') x.resume(); });
    if (al && al.currentCtx && al.currentCtx.audioCtx && al.currentCtx.audioCtx.state === 'suspended') al.currentCtx.audioCtx.resume();
  } catch (e) {}
}
function emuEnd_() {
  if (EMU_.ready) csvKeep_(true);
  const ejs = EMU_.ejs;
  EMU_.ejs = null; EMU_.ready = false; EMU_.sys = null; EMU_.key = ''; EMU_.held = {}; EMU_.ax = [];
  if (ejs) {
    try { if (ejs.started) ejs.gameManager.saveSaveFiles(); } catch (e) {}
    try { ejs.callEvent('exit'); } catch (e) {}
  }
  const h = $('emu-host'); if (h) h.remove();
}

/* EVERY SOURCE OR-ED, then only changes reach the core. On N64 the arrows and the touch D-pad steer the stick, which is how its games are driven. */
function emuSync_(off) {
  const g = EMU_.ready && EMU_.ejs && EMU_.ejs.gameManager;
  if (!g) return;
  const src = k => !off && !!(NES_.keys[k] || NES_.pads[k] || NES_.touch[k]);
  const n64 = EMU_.sys === 'n64', dig = k => !off && !!(NES_.keys[k] || NES_.touch[k]);
  Object.keys(EMU_IDX).forEach(k => {
    const on = n64 && /^(up|down|left|right)$/.test(k) ? !off && !!NES_.pads[k] : src(k);
    if (on === !!EMU_.held[k]) return;
    EMU_.held[k] = on;
    try { g.simulateInput(0, EMU_IDX[k], on ? 1 : 0); } catch (e) {}
  });
  const pa = off ? [0, 0, 0, 0] : NES_.axes || [0, 0, 0, 0], one = (p, m) => (dig(p) ? 1 : 0) - (dig(m) ? 1 : 0);
  const lx = n64 && one('right', 'left') ? one('right', 'left') : pa[0], ly = n64 && one('down', 'up') ? one('down', 'up') : pa[1];
  const rx = one('cr', 'cl') || pa[2], ry = one('cd', 'cu') || pa[3];
  [lx, ly, rx, ry].forEach((v, i) => {
    const plus = Math.round(Math.max(0, v) * 0x7fff), minus = Math.round(Math.max(0, -v) * 0x7fff), at = 16 + i * 2;
    if (EMU_.ax[at] !== plus) { EMU_.ax[at] = plus; try { g.simulateInput(0, at, plus); } catch (e) {} }
    if (EMU_.ax[at + 1] !== minus) { EMU_.ax[at + 1] = minus; try { g.simulateInput(0, at + 1, minus); } catch (e) {} }
  });
}


/* ---------- A CONSOLE GAME KEEPS ITS PROGRESS (446): the battery save and a save state, per game file, on this device and on the account. */
/* Keyed by a hash of the file's bytes; the file itself is never stored with a save nor sent. One save per game, the latest. */
const CSV_DB = 'family-console-saves';
const CSV_MAX = 2 * 1024 * 1024;   // the backend's CONSOLE_SAVE_MAX: an account keeps 2 MB per game once packed
const CSV_ = { hash: '', sys: '', at: 0, where: '', said: '', sent: '', timer: 0, rom: null, took: 0 };
/* ONE SAVE A MINUTE AT MOST (478): a DS state is megabytes, read, zipped and posted on the page's one thread, so a pause, a slide or a scroll does not each take one. Leaving always does. */
const CSV_EVERY = 60000;

/* SHA-256 where the browser has it; the same bytes give the same key on every device. A plain-http page falls back to a longer FNV. */
function csvHash_(u8) {
  const fnv = () => { let a = 0x811c9dc5, b = 0x01000193 ^ u8.length;
    for (let i = 0; i < u8.length; i++) { a = Math.imul(a ^ u8[i], 0x01000193) >>> 0; b = Math.imul(b ^ u8[i], 0x5bd1e995) >>> 0; }
    return Promise.resolve(('0000000' + a.toString(16)).slice(-8) + ('0000000' + b.toString(16)).slice(-8) + ('0000000' + u8.length.toString(16)).slice(-8)); };
  try {
    if (!(window.crypto && crypto.subtle)) return fnv();
    return crypto.subtle.digest('SHA-256', u8).then(d => [...new Uint8Array(d)].slice(0, 16).map(x => ('0' + x.toString(16)).slice(-2)).join('')).catch(fnv);
  } catch (e) { return fnv(); }
}

/* Its own database, so the kept game file's store is never upgraded under it. Any failure is "nothing kept on this device". */
function csvDb_(mode, fn) {
  return new Promise(res => {
    try {
      const rq = indexedDB.open(CSV_DB, 1);
      rq.onupgradeneeded = () => rq.result.createObjectStore('save');
      rq.onerror = () => res(null);
      rq.onsuccess = () => {
        try {
          const tx = rq.result.transaction('save', mode), r = fn(tx.objectStore('save'));
          tx.oncomplete = () => { res(r && 'result' in r ? r.result : true); rq.result.close(); };
          tx.onerror = tx.onabort = () => { res(null); rq.result.close(); };
        } catch (e) { res(null); }
      };
    } catch (e) { res(null); }
  });
}

/* gzip, then base64, for the account; a browser with no CompressionStream keeps its saves on the device only. */
function csvPack_(u8) {
  if (!u8 || !u8.length) return Promise.resolve('');
  const loop = a => { let s = ''; for (let i = 0; i < a.length; i += 0x8000) s += String.fromCharCode.apply(null, a.subarray(i, i + 0x8000)); return btoa(s); };
  /* THE BROWSER'S OWN BASE64 off the script's thread where it can (478); the string loop where it cannot. */
  const b64 = a => new Promise(ok => {
    try {
      const r = new window.FileReader();
      r.onload = () => { const u = String(r.result || ''), i = u.indexOf(','); ok(i < 0 ? loop(a) : u.slice(i + 1)); };
      r.onerror = () => ok(loop(a));
      r.readAsDataURL(new window.Blob([a]));
    } catch (e) { ok(loop(a)); }
  });
  try {
    if (typeof window.CompressionStream !== 'function') return Promise.resolve('');
    return new window.Response(new Blob([u8]).stream().pipeThrough(new window.CompressionStream('gzip'))).arrayBuffer().then(ab => b64(new Uint8Array(ab))).catch(() => '');
  } catch (e) { return Promise.resolve(''); }
}
function csvUnpack_(s) {
  if (!s) return Promise.resolve(null);
  try {
    if (typeof window.DecompressionStream !== 'function') return Promise.resolve(null);
    const bin = atob(s), u8 = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
    return new window.Response(new Blob([u8]).stream().pipeThrough(new window.DecompressionStream('gzip'))).arrayBuffer().then(ab => new Uint8Array(ab)).catch(() => null);
  } catch (e) { return Promise.resolve(null); }
}

/* THE GAME AS IT IS NOW, read at once (before a pause or an exit changes it): EmulatorJS's own state and save file, or jsnes's JSON. */
function csvCapture_() {
  if (!CSV_.hash) return null;
  let sram = null, state = null;
  if (EMU_.ejs && EMU_.ready && EMU_.key === CSV_.rom) {
    const g = EMU_.ejs.gameManager;
    try { const f = g.getSaveFile(); if (f && f.length) sram = new Uint8Array(f); } catch (e) {}
    try { if (!g.supportsStates || g.supportsStates()) { const s = g.getState(); if (s && s.length) state = new Uint8Array(s); } } catch (e) {}
  } else if (NES_.nes && NES_.rom && CSV_.rom === 'nes') {
    try { state = new TextEncoder().encode(JSON.stringify(NES_.nes.toJSON())); } catch (e) {}
  } else return null;
  return sram || state ? { hash: CSV_.hash, sys: CSV_.sys, at: Date.now(), sram, state } : null;
}

/* AT EVERY PAUSE AND LEAVE: on this device first, then, signed in, on the account. A save the same as the last one sent is not sent again. */
function csvKeep_(force) {
  if (!force && CSV_.took && Date.now() - CSV_.took < CSV_EVERY) return;
  const rec = csvCapture_();
  if (!rec) return;
  CSV_.took = Date.now();
  csvDb_('readwrite', s => s.put(rec, rec.hash)).then(ok => { if (ok) { CSV_.at = rec.at; CSV_.where = 'device'; csvLine_(); } });
  if (typeof USER !== 'object' || !USER || !USER.token) return;
  Promise.all([csvPack_(rec.sram), csvPack_(rec.state)]).then(([sram, state]) => {
    if (!sram && !state) return;
    const sig = rec.hash + sram.length + ':' + state.length + ':' + sram.slice(-64) + state.slice(-64);
    if (sig === CSV_.sent) { CSV_.where = 'account'; csvLine_(); return; }
    /* OVER THE CAP: refused here, politely, before anything is sent; the device copy stands. */
    if (Math.floor((sram.length + state.length) * 3 / 4) > CSV_MAX) { CSV_.said = 'Too big for your account (over 2 MB), so it is kept on this device only.'; csvLine_(); return; }
    return api({ action: 'consoleSave', personId: USER.personId || '', hash: rec.hash, sys: rec.sys, at: rec.at, sram, state }).then(d => {
      if (d && d.error) { CSV_.said = String(d.error); csvLine_(); return; }
      CSV_.sent = sig; CSV_.said = ''; CSV_.at = rec.at; CSV_.where = 'account'; csvLine_();
    });
  }).catch(() => { CSV_.said = ''; csvLine_(); });
}

/* THE NEWEST OF THE DEVICE'S AND THE ACCOUNT'S, as raw bytes; nothing at all is a fresh game. */
function csvFind_(hash) {
  const mine = csvDb_('readonly', s => s.get(hash)).then(r => (r && r.hash === hash ? r : null));
  const theirs = (typeof USER === 'object' && USER && USER.token)
    ? api({ action: 'consoleLoad', personId: USER.personId || '', hash }).then(d => {
      const v = d && d.save;
      if (!v || !(v.sram || v.state)) return null;
      return Promise.all([csvUnpack_(v.sram), csvUnpack_(v.state)]).then(([sram, state]) => ({ hash, sys: v.sys, at: Number(v.at) || 0, sram, state, account: true }));
    }).catch(() => null)
    : Promise.resolve(null);
  return Promise.all([mine, theirs]).then(([a, b]) => (a && b ? (b.at > a.at ? b : a) : a || b));
}

/* A GAME STARTING: its key, then its save put back. `rom` is EmulatorJS's game name, or 'nes'; a game swapped meanwhile is left alone. */
function csvBegin_(bytes, sys, rom, apply) {
  CSV_.hash = ''; CSV_.sys = sys; CSV_.rom = rom; CSV_.at = 0; CSV_.where = ''; CSV_.said = ''; CSV_.sent = ''; CSV_.took = 0;
  csvLine_();
  return csvHash_(bytes).then(h => {
    if (CSV_.rom !== rom) return null;
    CSV_.hash = h;
    return csvFind_(h);
  }).then(rec => {
    if (!rec || CSV_.rom !== rom || rec.hash !== CSV_.hash) return;
    try { apply(rec); } catch (e) { return; }
    CSV_.at = rec.at; CSV_.where = rec.account ? 'account' : 'device'; csvLine_();
  });
}
/* EMULATORJS: the battery file written where the core reads it and read again, then the state on top. */
function csvApplyEmu_(rec) {
  const g = EMU_.ejs && EMU_.ejs.gameManager;
  if (!g) return;
  if (rec.sram && rec.sram.length) { try { g.FS.writeFile(g.getSaveFilePath(), rec.sram); g.loadSaveFiles(); } catch (e) {} }
  if (rec.state && rec.state.length) g.loadState(rec.state);
}
function csvApplyNes_(rec) {
  if (rec.state && NES_.nes) NES_.nes.fromJSON(JSON.parse(new TextDecoder().decode(rec.state)));
}

/* THE QUIET LINE UNDER THE CONSOLE: when the game was last kept and where, or why it could not be. */
function csvLine_() {
  const p = $('nes-kept');
  if (!p) return;
  let s = CSV_.said;
  if (!s && CSV_.at && CSV_.hash) {
    const m = Math.round((Date.now() - CSV_.at) / 60000);
    s = 'Saved ' + (m < 1 ? 'just now' : m === 1 ? '1 min ago' : m < 60 ? m + ' min ago' : m < 1440 ? Math.round(m / 60) + ' h ago' : Math.round(m / 1440) + ' days ago')
      + (CSV_.where === 'account' ? ' to your account' : ' on this device');
  }
  p.textContent = s || '';
  p.hidden = !s;
  clearTimeout(CSV_.timer);
  if (s && !CSV_.said) CSV_.timer = setTimeout(csvLine_, 30000);
}

;
/* ==== js/newspaper.js ==== */
/* @family. — newspaper.js SUNDAY FUNDAY (owner, 12 Nov): a Sunday paper's fun section on one card, one page, read from data/settings/newspaper.json. */

/* ASKED ONCE, when the card first starts: no other screen reads it, so it is never on the first load. */
let NP = null, NP_ASK = null, NP_SHOW = false;
function npAsk_() {
  if (NP_ASK) return NP_ASK;
  NP_ASK = fetch('data/settings/newspaper.json' + deployStamp_(), { cache: 'default' }).then(r => (r.ok ? r.json() : null))
    .then(j => { NP = j && Array.isArray(j.rows) ? j : { rows: [] }; }, () => { NP = { rows: [] }; });
  return NP_ASK;
}
function npHtml_() {
  if (!NP) return loading_();
  const rows = (NP.rows || []).filter(r => r && r.q);
  if (!rows.length) return '<p class="note">This week\'s paper did not arrive.</p>';
  const any = rows.some(r => r.a);
  return rows.map(r => `<div class="np-item"><p class="np-head">${esc(r.head || '')}</p><p class="np-q">${esc(r.q)}</p>${
    r.a && NP_SHOW ? `<p class="np-a">${esc(r.a)}</p>` : ''}</div>`).join('')
    + (any ? `<div class="tile-row">${tile_({ icon: NP_SHOW ? 'hide' : 'show', label: NP_SHOW ? 'Hide' : 'Answers', note: NP_SHOW ? 'the answers' : 'show them', act: 'np-answers', pressed: NP_SHOW })}</div>` : '');
}
function npPaint_() { document.querySelectorAll('[id="np-box"]').forEach(el => { el.innerHTML = npHtml_(); }); }
function initNewspaper_() { npPaint_(); npAsk_().then(npPaint_); }
on('np-answers', () => { NP_SHOW = !NP_SHOW; npPaint_(); });

;
/* ==== js/spotify.js ==== */
/* ---------- SPOTIFY (510): each person's OWN Spotify account, connected in this browser alone ---------- */
/* Authorization Code with PKCE: no client secret, no backend. Tokens never go to our server; docs/spotify.md has the owner's setup and the 25-user limit. */
const SP_API = 'https://api.spotify.com/v1';
const SP_AUTH = 'https://accounts.spotify.com/authorize';
const SP_TOKEN = 'https://accounts.spotify.com/api/token';
const SP_SCOPES = ['user-read-currently-playing', 'user-read-playback-state', 'user-modify-playback-state', 'playlist-read-private'];
const SP = { how: false, token: '', exp: 0, now: null, lists: null, found: null, err: '', premium: '', busy: false };
const spClientId_ = () => String(brand('spotify_client_id', '') || '').trim();
/* THE REDIRECT the owner registers: this page plus ?spotify=cb — on the live site https://atfamily.co.uk/?spotify=cb. */
const spRedirect_ = () => location.origin + location.pathname + '?spotify=cb';

/* STORAGE: the access token for this tab (sessionStorage); the refresh token on this device (localStorage) so a phone stays connected — Disconnect forgets both. */
const spGet_ = (s, k) => { try { return window[s].getItem(k) || ''; } catch (e) { return ''; } };
const spSet_ = (s, k, v) => { try { v ? window[s].setItem(k, v) : window[s].removeItem(k); } catch (e) { /* storage blocked (private window): the token just is not kept */ } };
function spKeep_(t, secs, refresh) {
  SP.token = t || ''; SP.exp = t ? Date.now() + Math.max(60, (+secs || 3600) - 60) * 1000 : 0;
  spSet_('sessionStorage', 'spTok', t ? JSON.stringify({ t: SP.token, e: SP.exp }) : '');
  if (refresh !== undefined) spSet_('localStorage', 'spRefresh', refresh || '');
}
function spToken_() {
  if (SP.token && Date.now() < SP.exp) return SP.token;
  try { const s = JSON.parse(spGet_('sessionStorage', 'spTok') || 'null'); if (s && s.t && Date.now() < s.e) { SP.token = s.t; SP.exp = s.e; return s.t; } } catch (e) { /* no stored token: sign in again */ }
  return '';
}
const spLinked_ = () => !!(spToken_() || spGet_('localStorage', 'spRefresh'));

/* PKCE: a random verifier, its SHA-256 as base64url is the challenge. */
const spB64_ = buf => btoa(String.fromCharCode.apply(null, new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
function spRandom_(n) {
  const a = new Uint8Array(n); crypto.getRandomValues(a);
  return spB64_(a.buffer).slice(0, n);
}
async function spChallenge_(v) { return spB64_(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(v))); }

async function spConnect_() {
  const cid = spClientId_();
  if (!cid) return;
  try {
    const v = spRandom_(64), state = spRandom_(16), ch = await spChallenge_(v);
    spSet_('sessionStorage', 'spPkce', JSON.stringify({ v, state, cid, back: spRedirect_() }));
    const q = new URLSearchParams({ client_id: cid, response_type: 'code', redirect_uri: spRedirect_(),
      code_challenge_method: 'S256', code_challenge: ch, state, scope: SP_SCOPES.join(' ') });
    spGo_(SP_AUTH + '?' + q.toString());
  } catch (e) { SP.err = 'This browser cannot connect to Spotify.'; spPaint_(); }
}
/* One seam for leaving the page, so a journey can catch the address instead of navigating. */
function spGo_(url) { location.assign(url); }

async function spTokenCall_(body) {
  const r = await fetch(SP_TOKEN, { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(body).toString() });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || !j.access_token) throw new Error(j.error_description || j.error || ('HTTP ' + r.status));
  spKeep_(j.access_token, j.expires_in, j.refresh_token || spGet_('localStorage', 'spRefresh'));
  return j.access_token;
}

/* THE WAY BACK: ?spotify=cb&code=…&state=… is read as this file loads, the address cleaned at once, the swap done in the background — boot never waits on it. */
function spCallback_() {
  let q;
  try { q = new URLSearchParams(location.search); } catch (e) { return; }
  if (q.get('spotify') !== 'cb') return;
  try { history.replaceState(null, '', location.pathname + location.hash); } catch (e) { /* the code stays in the address bar; harmless */ }
  let pk = null;
  try { pk = JSON.parse(spGet_('sessionStorage', 'spPkce') || 'null'); } catch (e) { /* no verifier kept: the exchange below refuses plainly */ }
  spSet_('sessionStorage', 'spPkce', '');
  if (q.get('error')) { SP.err = q.get('error') === 'access_denied' ? 'You said no to Spotify — nothing was connected.' : 'Spotify did not connect.'; return; }
  if (!pk || !q.get('code') || q.get('state') !== pk.state) { SP.err = 'Spotify did not connect (the reply did not match). Try again.'; return; }
  SP.busy = true;
  spTokenCall_({ grant_type: 'authorization_code', code: q.get('code'), redirect_uri: pk.back, client_id: pk.cid, code_verifier: pk.v })
    .then(() => { SP.busy = false; SP.err = ''; spRefreshAll_(); try { if (typeof toast === 'function') toast('Spotify connected'); } catch (e) { /* a toast is a nicety */ } })
    .catch(() => { SP.busy = false; SP.err = 'Spotify did not connect. Try again.'; spPaint_(); });
}

/* EVERY CALL: a fresh token if the old one ran out; 403 PREMIUM_REQUIRED is remembered and said, not thrown. */
async function spFetch_(path, o) {
  let t = spToken_();
  if (!t) {
    const rt = spGet_('localStorage', 'spRefresh'), cid = spClientId_();
    if (!rt || !cid) throw new Error('not connected');
    try { t = await spTokenCall_({ grant_type: 'refresh_token', refresh_token: rt, client_id: cid }); }
    catch (e) { spKeep_('', 0, ''); throw new Error('not connected'); }
  }
  const r = await fetch(SP_API + path, Object.assign({}, o, { headers: { Authorization: 'Bearer ' + t } }));
  if (r.status === 204) return null;
  const j = await r.json().catch(() => null);
  if (r.status === 403 && j && j.error && /PREMIUM_REQUIRED/.test(String(j.error.reason || ''))) { SP.premium = 'Play, pause and skip need Spotify Premium — your account can still see what is playing and your playlists.'; return null; }
  if (r.status === 401) { spKeep_('', 0); }
  if (!r.ok) throw new Error((j && j.error && j.error.message) || ('HTTP ' + r.status));
  return j;
}

async function spRefreshAll_() {
  if (!spLinked_()) { spPaint_(); return; }
  try {
    const [now, lists] = await Promise.all([spFetch_('/me/player/currently-playing'), spFetch_('/me/playlists?limit=20')]);
    SP.now = now && now.item ? now : null;
    SP.lists = (lists && lists.items) || [];
  } catch (e) { if (!spLinked_()) SP.err = 'Spotify signed you out — connect again.'; }
  spPaint_();
}

async function spControl_(what) {
  const m = { play: ['PUT', '/me/player/play'], pause: ['PUT', '/me/player/pause'], next: ['POST', '/me/player/next'], prev: ['POST', '/me/player/previous'] }[what];
  if (!m) return;
  try { await spFetch_(m[1], { method: m[0] }); } catch (e) { SP.err = /NO_ACTIVE_DEVICE|404/.test(e.message) ? 'Open Spotify on a device first, then try again.' : 'Spotify did not do that.'; }
  setTimeout(spRefreshAll_, 400);
  spPaint_();
}

async function spSearch_() {
  const box = typeof $ === 'function' ? $('sp-q') : null, q = box ? String(box.value || '').trim() : '';
  if (!q) return;
  try {
    const j = await spFetch_('/search?type=track,playlist&limit=5&q=' + encodeURIComponent(q));
    SP.found = [].concat(((j && j.tracks && j.tracks.items) || []), ((j && j.playlists && j.playlists.items) || [])).filter(Boolean);
  } catch (e) { SP.found = []; SP.err = 'Search did not work.'; }
  spPaint_();
}

function spDisconnect_() {
  spKeep_('', 0, ''); spSet_('sessionStorage', 'spPkce', '');
  Object.assign(SP, { now: null, lists: null, found: null, err: '', premium: '', busy: false });
  spPaint_();
}

/* STUDY FOCUS: playlists you starred, on this device only. */
const spFocus_ = () => { try { return JSON.parse(spGet_('localStorage', 'spFocus') || '[]'); } catch (e) { return []; } };
function spFocusToggle_(id) {
  const f = spFocus_(), i = f.indexOf(id);
  i === -1 ? f.push(id) : f.splice(i, 1);
  spSet_('localStorage', 'spFocus', JSON.stringify(f)); spPaint_();
}

const spOpen_ = x => (x && x.external_urls && x.external_urls.spotify) || '';
function spLine_(x, star) {
  const who = x.type === 'track' ? (x.artists || []).map(a => a.name).join(', ') : x.type === 'playlist' ? 'Playlist' : '';
  const href = spOpen_(x);
  return `<div class="sp-line"><span class="spot-name">${esc(x.name || '')}${who ? ` <span>· ${esc(who)}</span>` : ''}</span>${
    star ? tile_({ icon: 'star', label: 'Study focus', act: 'sp-focus', data: { id: x.id }, pressed: spFocus_().indexOf(x.id) !== -1, on: spFocus_().indexOf(x.id) !== -1 }) : ''}${
    href ? tile_({ icon: 'open', label: 'Open in Spotify', href }) : ''}</div>`;
}

/* THE CARD: one line per thing, tiles under it (house style). */
function spCard_() {
  const row = h => `<p>${h}</p>`;
  let body;
  if (!spClientId_()) {
    /* NOT SWITCHED ON: Spotify's own player is one tap away, and More says what turns this card on (a safe press, owner 12 Nov). */
    body = row('Not switched on yet — the site\'s admin turns it on.')
      + (SP.how ? row(typeof isAdmin === 'function' && isAdmin() ? 'Admin: make a Spotify app and put its Client ID in the brand tab as <b>spotify_client_id</b>; the redirect URI is <code>' + esc(spRedirect_()) + '</code> (docs/spotify.md).'
        : 'Until then, Spotify\'s own player works in its app or at open.spotify.com.') : '')
      + tileRow_(tile_({ icon: 'open', label: 'Open Spotify', note: 'its own player', href: 'https://open.spotify.com/', leave: true })
        + tile_({ icon: SP.how ? 'up' : 'more', label: SP.how ? 'Less' : 'More', note: 'how it turns on', act: 'sp-how', pressed: !!SP.how }), '', true);
  } else if (SP.busy) {
    body = typeof loading_ === 'function' ? loading_() : '';
  } else if (!spLinked_()) {
    body = row('Connect your own Spotify account. It stays in this browser; we never see it.')
      + tileRow_(tile_({ icon: 'in', label: 'Connect', note: 'your Spotify account', act: 'sp-connect' }), '', true);
  } else {
    const it = SP.now && SP.now.item, img = it && it.album && (it.album.images || []).slice(-2)[0];
    const now = it ? `<div class="sp-now">${img ? `<img class="sp-art" src="${esc(img.url)}" alt="">` : ''}<div><p class="sp-title">${esc(it.name || '')}</p><p>${esc((it.artists || []).map(a => a.name).join(', '))}</p></div></div>`
      : row(SP.lists ? 'Nothing playing right now.' : '…');
    const playing = !!(SP.now && SP.now.is_playing);
    const ctl = tileRow_(tile_({ icon: 'left', label: 'Previous', act: 'sp-ctl', data: { c: 'prev' } })
      + tile_({ icon: playing ? 'pause' : 'play', label: playing ? 'Pause' : 'Play', act: 'sp-ctl', data: { c: playing ? 'pause' : 'play' } })
      + tile_({ icon: 'right', label: 'Next', act: 'sp-ctl', data: { c: 'next' } })
      + (it && spOpen_(it) ? tile_({ icon: 'open', label: 'Open in Spotify', href: spOpen_(it), leave: true }) : ''), '', true);
    const f = spFocus_(), lists = SP.lists || [];
    const focus = lists.filter(p => p && f.indexOf(p.id) !== -1);
    body = now + ctl + (SP.premium ? `<p class="sp-premium">${esc(SP.premium)}</p>` : '')
      + `<div class="sp-search"><input id="sp-q" class="sp-q" type="search" placeholder="Find a song or playlist" aria-label="Find on Spotify">${tile_({ icon: 'search', label: 'Search', act: 'sp-search' })}</div>`
      + (SP.found ? (SP.found.length ? SP.found.map(x => spLine_(x)).join('') : row('Nothing found.')) : '')
      + (focus.length ? `<p class="k">Study focus</p>` + focus.map(p => spLine_(p, true)).join('') : '')
      + (lists.length ? `<p class="k">Your playlists</p>` + lists.filter(Boolean).map(p => spLine_(p, true)).join('') : '')
      + tileRow_(tile_({ icon: 'sync', label: 'Refresh', act: 'sp-refresh' }) + tile_({ icon: 'out', label: 'Disconnect', act: 'sp-off' }), '', true);
  }
  return `<div class="sp-card">${body}${SP.err ? `<p class="sp-err">${esc(SP.err)}</p>` : ''}</div>`;
}
function spPaint_() { try { const el = typeof $ === 'function' && $('sp-box'); if (el) el.innerHTML = spCard_(); } catch (e) { /* the box is not on screen */ } }
function initSpotify() { spPaint_(); if (spLinked_() && spClientId_()) spRefreshAll_(); }

on('sp-connect', () => spConnect_());
on('sp-how', () => { SP.how = !SP.how; spPaint_(); });
on('sp-ctl', el => spControl_(el.dataset.c));
on('sp-search', () => spSearch_());
on('sp-refresh', () => { SP.err = ''; spRefreshAll_(); });
on('sp-off', () => spDisconnect_());
on('sp-focus', el => spFocusToggle_(el.dataset.id));
try { document.addEventListener('keydown', e => { if (e.key === 'Enter' && e.target && e.target.id === 'sp-q') { e.preventDefault(); spSearch_(); } }); } catch (e) { /* no document (node checks) */ }
spCallback_();

;
/* ==== js/favlinks.js ==== */
/* @family. — favlinks.js FAVOURITE LINKS, A TOOL (509). Ten links a person keeps on their account; the payload carries the viewer's own as
   `DATA.favLinks` (doGet's fresh half), and a change posts the whole list (`favLinksSave`). */

/* THE SAME RULE AS THE BACKEND'S `favUrlOk_`: http or https with a host, no spaces or quotes, so javascript: and data: never get in. */
function favUrlOk_(u) {
  const v = String(u == null ? '' : u).trim();
  if (!v || v.length > 2000 || /[\s\u0000-\u001f\u007f<>"`]/.test(v)) return '';
  const m = /^(https?):\/\/([^\/?#@\s]+@)?([a-z0-9.-]+|\[[0-9a-f:]+\])(:\d{1,5})?([\/?#].*)?$/i.exec(v);
  if (!m || !/[a-z0-9]/i.test(m[3]) || /^[.-]|[.-]$/.test(m[3])) return '';
  return v;
}
const FAV_MAX_ = 10;
const favHost_ = u => String(u).replace(/^https?:\/\//i, '').split(/[\/?#]/)[0].replace(/^[^@]*@/, '');
const favList_ = () => (typeof DATA === 'object' && DATA && Array.isArray(DATA.favLinks) ? DATA.favLinks : [])
  .filter(x => x && favUrlOk_(x.url)).slice(0, FAV_MAX_);
let FAV_SAID_ = '';
let FAV_BUSY_ = false;
let FAV_EDIT_ = false;
/* THE SITE'S OWN ICON, from its own origin; an address by number or a bare name has none worth asking for. */
const favIco_ = u => { try { return new URL(u).origin + '/favicon.ico'; } catch (e) { return ''; } };
const favIcoOk_ = h => /\.[a-z]{2,}$/i.test(String(h).replace(/:\d+$/, ''));
/* AN ICON THAT IS NOT THERE goes, and the letter under it shows. */
document.addEventListener('error', e => { const t = e.target; if (t && t.classList && t.classList.contains('fav-img')) t.remove(); }, true);

function favDraw_(into) {
  if (!into) return;
  if (!USER) { into.innerHTML = `<p class="note">Sign in and your favourite links are kept here.</p>`; return; }
  if (typeof awaiting_ === 'function' && awaiting_() && !(DATA && Array.isArray(DATA.favLinks))) { into.innerHTML = loading_(); return; }
  /* WHAT IS HALF TYPED IN THE ADD ROW STAYS through a redraw — the list changes under it, not the boxes. */
  const keepT = (into.querySelector('[data-fav="title"]') || {}).value || '';
  const keepU = (into.querySelector('[data-fav="url"]') || {}).value || '';
  const list = favList_();
  /* A GRID OF THE SITES (720), each its own icon: the site's /favicon.ico, asked of that site alone (no icon service learns what you keep), over its first letter. */
  const grid = list.map(l => { const httpUrl = favUrlOk_(l.url), host = favHost_(l.url), name = l.title || host;
    return `<a class="fav-cell" href="${esc(httpUrl)}" target="_blank" rel="noopener noreferrer" data-do="file-view" data-url="${esc(httpUrl)}" title="${esc(host)}">
      <span class="fav-ico" aria-hidden="true"><span class="fav-letter">${esc((name.replace(/^www\./i, '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase())}</span>${
        favIcoOk_(host) ? `<img class="fav-img" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" src="${esc(favIco_(httpUrl))}">` : ''}</span>
      <span class="fav-name">${esc(name)}</span></a>`; }).join('');
  const rows = !FAV_EDIT_ ? '' : list.map((l, i) => `<div class="row fav-edit">
      <span class="fav-a">${esc(l.title || favHost_(l.url))}<span class="fav-host">${esc(favHost_(l.url))}</span></span>
      <div class="tile-row fav-tiles">${
        tile_({ icon: 'up', label: 'Move up', act: 'fav-move', data: { i: i, by: -1 }, off: !i || FAV_BUSY_ })
      }${tile_({ icon: 'down', label: 'Move down', act: 'fav-move', data: { i: i, by: 1 }, off: i === list.length - 1 || FAV_BUSY_ })
      }${tile_({ icon: 'bin', label: 'Remove', note: l.title, act: 'fav-del', data: { i: i }, off: FAV_BUSY_ })}</div>
    </div>`).join('');
  const full = list.length >= FAV_MAX_;
  into.innerHTML = `<div class="fav">
    ${grid ? `<div class="fav-grid">${grid}</div>` : '<p class="note">No links yet. Add the sites you use most.</p>'}
    ${list.length ? `<div class="tile-row">${tile_({ icon: 'edit', label: FAV_EDIT_ ? 'Done' : 'Edit links', act: 'fav-edit', on: FAV_EDIT_ })}</div>` : ''}
    ${rows}
    ${full ? `<p class="note">That is ${FAV_MAX_} — remove one to add another.</p>` : `<div class="fav-new">
      <label class="fav-line"><span>Title</span><input data-fav="title" maxlength="80" placeholder="e.g. BBC Bitesize" autocomplete="off"></label>
      <label class="fav-line"><span>Address</span><input data-fav="url" type="url" inputmode="url" maxlength="2000" placeholder="https://…" autocomplete="off"></label>
      <div class="tile-row">${tile_({ icon: 'plus', label: 'Add link', act: 'fav-add', off: FAV_BUSY_ })}</div>
    </div>`}
    <p class="fav-said">${esc(FAV_SAID_ || (list.length + ' of ' + FAV_MAX_))}</p>
  </div>`;
  const t = into.querySelector('[data-fav="title"]'), u = into.querySelector('[data-fav="url"]');
  if (t) t.value = keepT;
  if (u) u.value = keepU;
}
function initFavLinks_() { favRedraw_(true); }
/* EVERY COPY (Tools', and Saved's if starred) — but not one somebody is typing in, unless it is the one that asked. */
function favRedraw_(force) {
  document.querySelectorAll('[id="fav-box"]').forEach(into => {
    if (force === true || !into.contains(document.activeElement)) favDraw_(into);
  });
}

/* THE WHOLE LIST GOES, and the server's answer is what is drawn; a refusal puts the old list back and says why. */
function favSave_(next, said) {
  const was = favList_();
  DATA.favLinks = next;
  FAV_BUSY_ = true; FAV_SAID_ = 'Saving…';
  favRedraw_(true);
  const done = d => {
    FAV_BUSY_ = false;
    if (d && d.success && Array.isArray(d.links)) { DATA.favLinks = d.links; FAV_SAID_ = said; }
    else { DATA.favLinks = was; FAV_SAID_ = (d && (d.message || d.error)) || 'Could not save — try again in a moment.'; }
    favRedraw_(true);
  };
  api({ action: 'favLinksSave', personId: USER.personId, links: next }).then(done, () => done(null));
}

on('fav-edit', () => { FAV_EDIT_ = !FAV_EDIT_; favRedraw_(true); });

on('fav-add', el => {
  const box = el.closest('.fav');
  if (!box || !USER || FAV_BUSY_) return;
  const tIn = box.querySelector('[data-fav="title"]'), uIn = box.querySelector('[data-fav="url"]');
  let raw = String((uIn && uIn.value) || '').trim();
  /* A BARE ADDRESS ("bbc.co.uk") IS MEANT AS A WEB ONE; anything with its own scheme is judged as typed. */
  if (raw && !/^[a-z][a-z0-9+.-]*:/i.test(raw)) raw = 'https://' + raw;
  const url = favUrlOk_(raw);
  const list = favList_();
  if (!url) { FAV_SAID_ = 'That is not a web address — it must start https:// or http://.'; favRedraw_(true); return; }
  if (list.length >= FAV_MAX_) { FAV_SAID_ = FAV_MAX_ + ' links at most — remove one first.'; favRedraw_(true); return; }
  const title = String((tIn && tIn.value) || '').trim().slice(0, 80) || favHost_(url);
  if (tIn) tIn.value = '';
  if (uIn) uIn.value = '';
  favSave_(list.concat([{ title: title, url: url }]), 'Added.');
});
on('fav-del', el => {
  if (!sure_(el, 'Remove it?')) return;
  if (!USER || FAV_BUSY_) return;
  const i = Number(el.dataset.i), list = favList_();
  if (!(i >= 0 && i < list.length)) return;
  favSave_(list.filter((_, k) => k !== i), 'Removed.');
});
on('fav-move', el => {
  if (!USER || FAV_BUSY_) return;
  const i = Number(el.dataset.i), j = i + Number(el.dataset.by), list = favList_().slice();
  if (!(i >= 0 && j >= 0 && i < list.length && j < list.length)) return;
  const x = list[i]; list[i] = list[j]; list[j] = x;
  favSave_(list, 'Moved.');
});

;
/* ==== js/pixel.js ==== */
/* @family. — pixel.js THE PIXEL EDITOR, A TOOL (547): bare bones -- a grid, a colour, pen or eraser, Clear and a PNG. This device only (`pixelArt`). */

/* THREE GRID SIZES, square. The owner asked for bare bones (30 Oct): nothing past what coddy's maker has at its plainest. */
const PXE_SIZES = [8, 16, 32];
const PXE_KEY = 'pixelArt';
/* ONE PICTURE PER DEVICE: { n, colour, tool, px: ['' | '#rrggbb', ...] } row by row; '' is see-through. */
let PXE = null;
const pxeHex_ = v => (/^#[0-9a-f]{6}$/i.test(String(v || '')) ? String(v).toLowerCase() : '');
/* THE FIRST COLOUR IN THE HAND: the site's own ink on gold (black), read off its token and written out long, as a colour box needs. */
function pxeInk_() {
  let v = '';
  try { v = getComputedStyle(document.documentElement).getPropertyValue('--on-gold').trim(); } catch (e) { v = ''; }
  return pxeHex_(/^#[0-9a-f]{3}$/i.test(v) ? v.replace(/^#(.)(.)(.)$/, '#$1$1$2$2$3$3') : v);
}
function pxeLoad_() {
  if (PXE) return PXE;
  let got = null;
  try { got = JSON.parse(localStorage.getItem(PXE_KEY) || 'null'); } catch (e) { got = null; }
  const n = got && PXE_SIZES.indexOf(Number(got.n)) >= 0 ? Number(got.n) : 16;
  const px = new Array(n * n).fill('');
  if (got && Array.isArray(got.px)) got.px.slice(0, n * n).forEach((c, i) => { px[i] = pxeHex_(c); });
  PXE = { n, colour: pxeHex_(got && got.colour) || pxeInk_(), tool: got && got.tool === 'eraser' ? 'eraser' : 'pen', px };
  return PXE;
}
function pxeKeep_() { try { localStorage.setItem(PXE_KEY, JSON.stringify(PXE)); } catch (e) { /* storage blocked: the picture lives until the page goes */ } }

function pxeHtml_() {
  pxeLoad_();
  const cells = PXE.px.map((c, i) => `<span class="pxe-c" data-pxe="${i}"${c ? ` style="background:${c}"` : ''}></span>`).join('');
  return `<div class="pxe">
    <label class="pxe-line"><span>Grid</span><select data-pxe-set="n" aria-label="Grid">${PXE_SIZES.map(s => `<option value="${s}"${s === PXE.n ? ' selected' : ''}>${s} × ${s}</option>`).join('')}</select></label>
    <label class="pxe-line"><span>Colour</span><input type="color" data-pxe-set="colour" value="${esc(PXE.colour)}" aria-label="Colour"></label>
    <div class="tile-row">${
      /* ONE TILE SAYS WHICH IS IN THE HAND AND SWAPS IT: every press changes something (owner, 12 Nov). */
      PXE.tool === 'eraser' ? tile_({ icon: 'close', label: 'Eraser', note: 'tap for the pen', act: 'pxe-tool', data: { tool: 'pen' }, on: true })
        : tile_({ icon: 'pen', label: 'Pen', note: 'tap for the eraser', act: 'pxe-tool', data: { tool: 'eraser' }, on: true })}${
      tile_({ icon: 'bin', label: 'Clear', note: 'every square', act: 'pxe-clear' })}${
      tile_({ icon: 'save', label: 'Export PNG', note: 'the picture', act: 'pxe-png' })}</div>
    <div class="pxe-grid" style="grid-template-columns:repeat(${PXE.n}, 1fr)" aria-label="${esc(PXE.n + ' by ' + PXE.n + ' grid')}">${cells}</div>
  </div>`;
}
function pxePaint_() { document.querySelectorAll('[id="pxe-box"]').forEach(el => { el.innerHTML = pxeHtml_(); }); }
function initPixel_() { pxePaint_(); }

/* THE PICTURE, one PNG pixel per square times a whole number, so it stays sharp: 512 px a side; see-through squares stay see-through. */
function pxeCanvas_() {
  pxeLoad_();
  const k = Math.floor(512 / PXE.n), cv = document.createElement('canvas');
  cv.width = cv.height = k * PXE.n;
  const g = cv.getContext && cv.getContext('2d');
  if (!g) return cv;
  PXE.px.forEach((c, i) => { if (c) { g.fillStyle = c; g.fillRect((i % PXE.n) * k, Math.floor(i / PXE.n) * k, k, k); } });
  return cv;
}

/* A FILE HANDED TO THE PHONE TO KEEP; revoked later, as a download can start after the click returns. */
function saveBlob_(blob, name) {
  const href = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = href; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(href), 60000);
}

/* ---------- PAINTING: a press paints the square under it, and a drag paints every square it crosses (the grid takes the drag, never the column). */
let PXE_DOWN = false;
function pxeAt_(e) {
  const hit = (document.elementFromPoint && document.elementFromPoint(e.clientX, e.clientY)) || e.target;
  const c = hit && hit.closest ? hit.closest('[data-pxe]') : null;
  if (!c) return;
  const i = Number(c.dataset.pxe), v = PXE.tool === 'eraser' ? '' : PXE.colour;
  if (PXE.px[i] === v) return;
  PXE.px[i] = v;
  c.style.background = v;
}
document.addEventListener('pointerdown', e => {
  if (!(e.target && e.target.closest && e.target.closest('.pxe-grid'))) return;
  pxeLoad_();
  PXE_DOWN = true;
  e.preventDefault();
  pxeAt_(e);
});
document.addEventListener('pointermove', e => { if (PXE_DOWN) pxeAt_(e); });
function pxeUp_() { if (!PXE_DOWN) return; PXE_DOWN = false; pxeKeep_(); }
document.addEventListener('pointerup', pxeUp_);
document.addEventListener('pointercancel', pxeUp_);

/* THE FORM'S TWO ROWS: a new grid size starts a blank picture of that size; the colour is kept as it is picked. */
document.addEventListener('change', e => {
  const s = e.target && e.target.closest ? e.target.closest('[data-pxe-set]') : null;
  if (!s) return;
  pxeLoad_();
  if (s.dataset.pxeSet === 'n' && PXE_SIZES.indexOf(Number(s.value)) >= 0 && Number(s.value) !== PXE.n) {
    PXE.n = Number(s.value); PXE.px = new Array(PXE.n * PXE.n).fill(''); pxeKeep_(); pxePaint_(); return;
  }
  if (s.dataset.pxeSet === 'colour' && pxeHex_(s.value)) { PXE.colour = pxeHex_(s.value); PXE.tool = 'pen'; pxeKeep_(); pxePaint_(); }
});

on('pxe-tool', el => { pxeLoad_().tool = el.dataset.tool === 'eraser' ? 'eraser' : 'pen'; pxeKeep_(); pxePaint_(); });
on('pxe-clear', () => { const p = pxeLoad_(); p.px = new Array(p.n * p.n).fill(''); pxeKeep_(); pxePaint_(); });
on('pxe-png', () => {
  const cv = pxeCanvas_();
  try {
    cv.toBlob(b => { if (b) { saveBlob_(b, 'pixel-art-' + PXE.n + 'x' + PXE.n + '.png'); toast('Picture saved'); } }, 'image/png');
  } catch (e) { toast('The picture could not be made here.'); }
});

;
