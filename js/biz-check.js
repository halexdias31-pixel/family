/* THE BUSINESS CHECKER (1050): what the business needs, in order, ticked by itself where the site's own data can tell, else by the owner. */
/* The items are data/settings/biz-checklist.json; the owner's ticks are the biz_checks tab (backend/bizchecks.gs). Guidance, not advice. */
const BC = { list: null, facts: {}, ticks: null, error: '', asking: false, open: '', fetched: false };
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
  let due = '', expired = false;
  if (t && t.done_on && item.renew) { due = bcAddMonths_(t.done_on, item.renew); expired = !!due && bcDays_(due) < 0; }
  if (auto && auto.due) due = auto.due;
  const byHand = !!(t && t.done_on) && !expired;
  const sorted = !!(auto && auto.ok === true) || (byHand && !(auto && auto.ok === false));
  const soon = sorted && due && bcDays_(due) <= BC_SOON_DAYS;
  return { auto, tick: t, due, expired, sorted, soon, info: !!(auto && auto.info) };
}

function bcStatus_(s) {
  if (s.info) return s.auto.ok ? 'reached' : 'in progress';
  if (s.expired) return 'renew now';
  if (s.sorted && s.auto && s.auto.ok === true) return 'sensed' + (s.soon ? ' · renew by ' + bcSaid_(s.due) : '');
  if (s.sorted) return 'done ' + bcSaid_(s.tick.done_on) + (s.soon ? ' · renew by ' + bcSaid_(s.due) : '');
  if (s.auto && s.auto.ok === false) return 'needs you';
  return 'to do';
}

function bcItem_(item, s) {
  /* THE TICK ON THE LEFT, THE THING IN WORDS BESIDE IT — one line, as a checklist reads (`.kid-row` lays out a tile and its caption). */
  const line = `<div class="kid-row bc-line"><div class="tile-row">${tile_({ icon: s.sorted ? 'tick' : s.expired || (s.auto && s.auto.ok === false) ? 'flag' : 'plus', label: item.title,
    note: bcStatus_(s), tone: s.sorted ? 'buy' : (s.expired || s.soon) ? 'admin' : '', on: BC.open === item.id, act: 'bc-open', data: { id: item.id } })}</div>
    <p class="biz-cap">${esc(item.title)} <span class="qtags biz-when"><span class="qtag">${esc(bcStatus_(s))}</span></span></p></div>`;
  if (BC.open !== item.id) return `<div class="bc-item" data-bc="${esc(item.id)}">${line}</div>`;
  const t = s.tick || {};
  return `<div class="bc-item is-open" data-bc="${esc(item.id)}">${line}
    <p class="bc-why">${esc(item.why)}</p>
    <p class="bc-how">${esc(item.how)} <a href="${esc(item.link)}" data-do="file-view" target="_blank" rel="noopener">Official guidance</a></p>
    ${s.auto && s.auto.say ? `<p class="faint bc-sense">${esc(s.auto.say)}</p>` : ''}
    ${s.info ? '' : `<div class="me-form bc-form">
      <div class="lib-row q-row"><label class="field"><input type="date" data-bc-k="done_on" value="${esc(t.done_on || bcToday_())}" aria-label="${esc(item.title + ' — done on')}"></label>
      <label class="field"><input type="text" data-bc-k="note" value="${esc(t.note || '')}" placeholder="Proof or note, e.g. policy no." maxlength="200" aria-label="${esc(item.title + ' — note')}" autocomplete="off"></label></div>
      <div class="tile-row">${tile_({ form: true, label: t.done_on ? 'Save' : 'Mark done', act: 'bc-tick', data: { id: item.id } })}${
        t.done_on ? tile_({ form: true, kind: 'quiet', label: 'Untick', act: 'bc-untick', data: { id: item.id } }) : ''}</div>
      ${item.renew ? `<p class="faint">Renews every ${item.renew} months — it comes back here when due.</p>` : ''}
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
  const money = all.filter(i => st[i.id].info).map(i => `<p class="bc-money">${esc(st[i.id].auto.say)}</p>`).join('');
  const groups = [];
  all.forEach(i => { if (groups.indexOf(i.group) === -1) groups.push(i.group); });
  return `<div class="qtags"><span class="qtag">Business</span><span class="qtag">Admin only</span><span class="qtag">Guidance, not advice</span></div>
    <h3>Business checker</h3>
    ${bizNeed_('bizcheck', BC.list ? renew : 0, renew + (renew === 1 ? ' thing to renew' : ' things to renew'))}
    <div class="biz-body bc-body"${wait ? ' aria-busy="true"' : ''}>
      ${BC.list ? `<p class="bc-count"><b>${done} of ${counted.length} sorted</b></p>${money}
      ${next.length ? `<p class="faint">Next:</p>${next.map(i => bcItem_(i, st[i.id])).join('')}` : '<p>Everything that applies is sorted.</p>'}
      ${groups.map(g => { const gi = all.filter(i => i.group === g && next.indexOf(i) === -1);
        return gi.length ? `<h4 class="bc-group">${esc(g)} <span class="qtag">${gi.filter(i => st[i.id].sorted).length}/${gi.filter(i => !st[i.id].info).length}</span></h4>${gi.map(i => bcItem_(i, st[i.id])).join('')}` : ''; }).join('')}
      ${later ? `<p class="faint">${later} more for later (a venue, employees) appear when config says so: biz_venue, biz_employees.</p>` : ''}
      <p class="faint">Guidance only, not legal or financial advice; links go to gov.uk, the ICO and the NSPCC.</p>` : ''}
    ${wait ? loading_() : ''}</div>
    <p class="faint me-said bc-said">${esc(BC.error)}</p>`;
}

function bizCheckCard_() {
  if (!(typeof isAdmin === 'function' && isAdmin())) return '';
  if (!BC.asking && !BC.fetched) setTimeout(bcStart_, 0);
  return `<div class="card biz bc-card" data-bizcheck data-need="bizcheck">${bcInner_()}</div>`;
}
const bcDraw_ = () => { document.querySelectorAll('[data-bizcheck]').forEach(c => { c.innerHTML = bcInner_(); }); if (typeof bizNeedsPaint_ === 'function') bizNeedsPaint_(); };

/* WAITS FOR ANOTHER CARD'S LIST (records, staff) so its rule can sense, giving up after a while. */
const bcWaitFor_ = (ready, ms) => new Promise(res => { const t0 = Date.now(); (function tick() { if (ready() || Date.now() - t0 > ms) res(); else setTimeout(tick, 300); })(); });

function bcStart_() {
  if (!(typeof isAdmin === 'function' && isAdmin()) || BC.asking) return;
  BC.asking = true; BC.fetched = true; BC.error = '';
  try { if (typeof bizStart_ === 'function') bizStart_(); if (typeof staffStart_ === 'function') staffStart_(); } catch (e) { if (typeof oops_ === 'function') oops_(e, 'business checker'); }
  const list = BC.list ? Promise.resolve() : fetch('data/settings/biz-checklist.json' + (typeof deployStamp_ === 'function' ? deployStamp_() : ''), { cache: 'default' })
    .then(r => r.json()).then(j => { BC.list = Array.isArray(j && j.items) ? j.items : []; BC.facts = (j && j.facts) || {}; })
    .catch(() => { BC.list = BC.list || []; BC.error = 'The checklist could not be fetched — check the connection.'; });
  const ticks = api({ action: 'listBizChecks', name: USER && USER.name })
    .then(d => { if (!d || d.error) { BC.ticks = {}; BC.error = String((d && d.error) || 'The ticks did not come.'); return; } BC.ticks = bcTicksOf_(d.checks); })
    .catch(() => { BC.ticks = {}; BC.error = 'The ticks could not be fetched — the list shows with nothing ticked.'; });
  Promise.all([list, ticks]).then(bcDraw_)
    .then(() => bcWaitFor_(() => (typeof BIZ === 'undefined' || BIZ.list || BIZ.error) && (typeof STAFF === 'undefined' || STAFF.list || STAFF.error), 20000))
    .then(() => { BC.asking = false; bcDraw_(); });
}
const bcTicksOf_ = rows => { const o = {}; (Array.isArray(rows) ? rows : []).forEach(r => { if (r && r.id && r.done_on) o[r.id] = r; }); return o; };

on('bc-open', el => { const id = el.dataset.id; BC.open = BC.open === id ? '' : id; bcDraw_(); });
function bcSave_(el, untick) {
  if (!isAdmin()) return;
  const id = el.dataset.id, box = el.closest('.bc-item');
  if (!box || !BC.ticks) { toast('The ticks are still on their way — a moment.'); return; }
  const v = k => { const b = box.querySelector(`[data-bc-k="${k}"]`); return b ? String(b.value || '').trim() : ''; };
  const done_on = untick ? '' : v('done_on') || bcToday_();
  send_({ action: 'saveBizCheck', name: USER && USER.name, id, done_on, note: untick ? '' : v('note') },
        { button: el, where: box.closest('.card').querySelector('.bc-said'), busy: 'Saving…' })
    .then(d => {
      const c = (d && d.check) || { id, done_on, note: v('note') };
      if (c.done_on) BC.ticks[id] = c; else delete BC.ticks[id];
      BC.open = ''; bcDraw_();
      toast(untick ? 'Unticked' : 'Ticked');
    })
    .catch(() => {});
}
on('bc-tick', el => bcSave_(el, false));
on('bc-untick', el => bcSave_(el, true));
