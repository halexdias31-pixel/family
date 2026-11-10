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
  return `<div class="card biz bc-card${glow}" data-bizcheck data-need="bizcheck">${inner}</div>`;
}
const bcDraw_ = () => { document.querySelectorAll('[data-bizcheck]').forEach(c => { c.innerHTML = bcInner_(); }); if (typeof bizNeedsPaint_ === 'function') bizNeedsPaint_(); };

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
