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
/* EACH VALUE AS THE BROWSER HAS IT NOW, so the card can never disagree with style.css; the swatch wears the token (`--tok`, style.css). */
const tplTok_ = k => { try { return getComputedStyle(document.documentElement).getPropertyValue(k).trim(); } catch (e) { return ''; } };
function tplSample_() {
  const h = card_(`<div class="tpl-sample"><img src="icon.png" alt="A sample picture"><h3>A sample card</h3>
    <div class="qtags">${qtag_(`A sample card`)}${qtag_(`A tag`)}</div>
    <p>What the thing holds, in plain words, centred.</p></div>`, 'panel', 'A sample card');
  return TPL_PARTS_.reduce((x, [p, say]) => x.replace(`<div class="kc-${p}">`, `<div class="kc-${p}" data-tpl="${esc(say)}">`), h);
}
function tplCard_() {
  const scale = TPL_SCALE_.map(([name, k, list]) => `<p class="tpl-group">${esc(name)}</p><div class="tpl-row tpl-${k}">${list.map(t =>
    `<span class="tpl-sw"><i aria-hidden="true" data-t="${t}" style="--tok: var(${t})"></i><code>${esc(t)}</code><small>${esc(dash_(tplTok_(t)))}</small></span>`).join('')}</div>`).join('');
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
