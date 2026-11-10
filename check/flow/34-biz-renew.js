/* ---------- BUSINESS ADMIN RUNS ITSELF (10 Nov): renewals glow and count, Renewed records the new expiry, the tax pot, a tutor's DBS check logged ---------- */
const BIZRENEW_ACTIONS_ = ['listBizChecks', 'saveBizCheck', 'listStaff', 'tutorDbsChecked'];
const bizRenewWorld_ = () => {
  const iso = n => { const d = new Date(Date.now() + n * 864e5); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
  const W = cardWorld_({ vars: { tax_set_aside: 0.25 } });
  W.iso = iso;
  W.real.ev("(function () { const t = read(TAB.people); const r = t.rows.find(x => x.person_id === 'P-T1'); setCell(t, r, 'dbs_number', 'C000123'); setCell(t, r, 'dbs_checked_on', '" + iso(-400) + "'); })()");
  W.real.seed('biz_checks', [
    { check_id: 'pub_liability', done_on: iso(-350), expires_on: iso(15), note: 'policy 1', by: 'Hal Admin' },
    { check_id: 'ico_fee', done_on: iso(-380), expires_on: iso(-3), note: '', by: 'Hal Admin' },
  ]);
  const list = JSON.parse(fs.readFileSync(path.join(dir, '..', 'data/settings/biz-checklist.json'), 'utf8'));
  const serve0 = W.serve;
  W.serve = u => /biz-checklist\.json/.test(u) ? list : serve0(u);
  W.reply = b => BIZRENEW_ACTIONS_.indexOf(b.action) !== -1 ? W.real.post(b) : { success: true, messages: [], records: [] };
  return W;
};
check('Business (10 Nov): renewals glow and count on the Business dot, Renewed keeps the new expiry, the tax-pot line shows, a teacher\'s DBS check is logged, admin only', async () => {
  const W = bizRenewWorld_();
  const a = await cardOpen_(W, 'admin@example.org', { col: 'biz' });
  if (a.err) return [a.err];
  const bad = [];
  try { a.w.paint('biz'); } catch (e) { return ['painting Business threw: ' + e.message]; }
  for (let k = 0; k < 40 && !(a.d.querySelector('[data-bizcheck] .bc-count') && a.d.querySelector('[data-staff] .staff-item')); k++) await wait(150);
  const card = () => a.d.querySelector('[data-bizcheck]');
  if (!card() || !card().querySelector('.bc-count')) return ['the Business checker did not draw its list: ' + String((card() || {}).textContent || 'no card').slice(0, 160)];
  const item = id => card().querySelector('.bc-item[data-bc="' + id + '"]');
  if (!item('pub_liability') || !item('pub_liability').classList.contains('is-soon')) bad.push('public liability, 15 days off, does not glow');
  if (!item('ico_fee') || !item('ico_fee').classList.contains('is-over')) bad.push('the ICO fee, 3 days past, is not overdue');
  const need = String((card().querySelector('.biz-need') || {}).textContent || '');
  if (!/overdue/.test(need) || !(Number((need.match(/^(\d+)/) || [])[1]) >= 2)) bad.push('the dot line reads ' + JSON.stringify(need) + ', wanted 2 or more to renew and 1 overdue');
  if (!card().classList.contains('needs-now')) bad.push('the checker card does not glow harder with something overdue: ' + card().className);
  if (!/Put aside £\d+\.\d{2} this month · £\d+\.\d{2} this tax year \(25%\)/.test(card().textContent)) bad.push('no tax pot line: ' + String((card().querySelector('.bc-money') || {}).textContent || ''));
  /* RENEWED: open the overdue item, a new expiry a year out, press Renewed. */
  a.A('bc-open', item('ico_fee').querySelector('[data-do="bc-open"]')); await wait(150);
  const open = item('ico_fee');
  const exp = open && open.querySelector('[data-bc-k="expires_on"]');
  const go = open && [...open.querySelectorAll('[data-do="bc-tick"]')][0];
  if (!exp || !open.querySelector('[data-bc-k="doc"]')) bad.push('the open ICO item has no new-expiry box or document picker');
  if (!go || !/Renewed/.test(go.getAttribute('aria-label') || go.title || go.textContent)) bad.push('the open ICO item has no Renewed tile');
  if (exp && go) {
    exp.value = W.iso(362);
    a.A('bc-tick', go); await wait(500);
    const p = a.sent.filter(x => x.action === 'saveBizCheck').pop();
    if (!p || p.expires_on !== W.iso(362)) bad.push('Renewed posted ' + JSON.stringify(p));
    if (W.sheet("isoDate_(read(TAB.biz_checks).rows.find(r => r.check_id === 'ico_fee').expires_on)") !== W.iso(362)) bad.push('the sheet did not keep the new expiry');
    if (item('ico_fee') && item('ico_fee').classList.contains('is-over')) bad.push('the ICO item still glows overdue after Renewed');
  }
  /* HMRC'S EMPLOYMENT STATUS CHECK: its own link tile, a result picked, Done keeps it. */
  const es = item('employment_status');
  if (!es) bad.push('no employment status item');
  else {
    a.A('bc-open', es.querySelector('[data-do="bc-open"]')); await wait(150);
    const box = item('employment_status');
    if (!box.querySelector('a[href="https://www.gov.uk/guidance/check-employment-status-for-tax"]')) bad.push('employment status has no Run the HMRC check link');
    const sel = box.querySelector('[data-bc-k="result"]');
    if (!sel || !box.querySelector('[data-bc-k="doc"]')) bad.push('employment status has no result picker or PDF attach');
    else {
      sel.value = 'Self-employed';
      a.A('bc-tick', box.querySelector('[data-do="bc-tick"]')); await wait(500);
      if (W.sheet("read(TAB.biz_checks).rows.find(r => r.check_id === 'employment_status').result") !== 'Self-employed') bad.push('the sheet did not keep the employment status result');
    }
  }
  /* THE TUTOR'S DBS, on the Staff card. */
  const staff = a.d.querySelector('[data-staff]');
  const ada = staff && staff.querySelector('.staff-item[data-id="P-T1"]');
  if (!ada) bad.push('Ada is not on the Staff card: ' + String((staff || {}).textContent || 'no card').slice(0, 120));
  else {
    if (!/DBS check due/.test(ada.textContent) || !/C000123/.test(ada.textContent)) bad.push('Ada\'s row has no DBS-due line with her certificate: ' + ada.textContent.trim().slice(0, 160));
    if (!ada.querySelector('a[href="https://secure.crbonline.gov.uk/crsc/check"]')) bad.push('Ada\'s row has no DBS online check link');
    const done = ada.querySelector('[data-do="staff-dbs"]');
    if (!done) bad.push('Ada\'s row has no Checked today tile');
    else {
      a.A('staff-dbs', done); await wait(400);
      if (W.sheet("isoDate_(read(TAB.people).rows.find(r => r.person_id === 'P-T1').dbs_checked_on)") !== W.iso(0)) bad.push('Checked today did not write today\'s date on the sheet');
      const again = a.d.querySelector('[data-staff] .staff-item[data-id="P-T1"]');
      if (again && /DBS check due/.test(again.textContent)) bad.push('the DBS-due line stays after Checked today');
    }
  }
  /* ADMIN ONLY: a tutor's door refuses, and a tutor's Business draws none of it. */
  const u = W.user('tutor@example.org');
  const no = W.real.post({ action: 'tutorDbsChecked', tutorId: 'P-T1', name: u.name, token: u.token });
  if (!no || !no.error) bad.push('a tutor could log a DBS check: ' + JSON.stringify(no));
  const no2 = W.real.post({ action: 'saveBizCheck', id: 'ico_fee', done_on: W.iso(0), name: u.name, token: u.token });
  if (!no2 || !no2.error) bad.push('a tutor could save a renewal: ' + JSON.stringify(no2));
  a.w.close();
  const b = await cardOpen_(W, 'tutor@example.org');
  if (b.err) return bad.concat([b.err]);
  if (b.d.querySelector('[data-bizcheck], [data-do="staff-dbs"]')) bad.push('a tutor is drawn the checker or a DBS tile');
  b.w.close();
  return bad;
});
