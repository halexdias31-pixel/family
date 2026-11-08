/* ---------- A NEW TEACHER, END TO END THROUGH FIND (owner, 7 Nov; docs/history/1150) */
/* The settings columns are off since the core freeze (1090), so every step here is reached through Find alone. */
check('Onboarding through Find: apply from Find › Settings, the admin approves in Find › Settings, the new card saves, Find lists them and Book opens booking', async () => {
  const W = cardWorld_({ people: [['P-C2', 'Cara', 'Client', 'client', 'cara@example.org']] });
  const bad = [];
  const real = ['applyTeach', 'listApplications', 'decideApplication'];
  const reply = b => (real.indexOf(b.action) !== -1 ? W.real.post(b) : W.reply(b));
  { const h = W.real.tabs.people[0], r = W.real.tabs.people.find(x => x[h.indexOf('person_id')] === 'P-C1'); r[h.indexOf('date_of_birth')] = '01/05/1980'; }
  /* THE SETTINGS FILES AS THE SITE SERVES THEM, so `setting-for` tags each card with its account types as on the phone. */
  const serve0 = W.serve;
  W.serve = u => { const m = /data\/(settings\/[\w-]+)\.json/.exec(u); if (!m) return serve0(u);
    try { return JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'data', m[1] + '.json'), 'utf8')); } catch (e) { return serve0(u); } };
  const findSet_ = async (c, type) => { c.t.go('stuff', false, true); c.w.findSettings_(type); c.w.paintStuff(); await wait(300); };
  const inFind = (c, sel) => c.d.querySelector('#s-stuff ' + sel);
  /* 1. PAT, A PARENT, FINDS APPLY TO TEACH IN FIND › SETTINGS. */
  const p = await cardOpen_(W, 'parent@example.org', { reply });
  if (p.err) return [p.err];
  await findSet_(p, 'Parent');
  onboardShot_(p, 'apply-tile');
  /* NO SHEET (owner, 8 Nov): the form is in the card from the start. */
  const f = inFind(p, '.apply-card .app-form');
  if (!f) return ['Find › Settings › Parent has no Apply to teach: ' + JSON.stringify(p.w.settingDoorItems_().filter(x => /Apply/.test(x.name))) + ' F=' + JSON.stringify(p.t.STUFF().filters) + ' list=' + p.w.stuffFiltered().map(x => x.name).join(',') + ' drawn=' + [...p.d.querySelectorAll('#s-stuff h3')].map(x => x.textContent).join(',')];
  const set = (sel, v) => { const el = f.querySelector(sel); if (!el) { bad.push('the form has no ' + sel); return; }
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v; };
  set('[data-app-subj="0"]', 'Maths'); set('[data-app-level="0"]', 'GCSE');
  set('[data-app="dbsNeeded"]', true); set('[data-app="rightToWork"]', 'yes');
  set('[data-app="ref1Name"]', 'Ref One'); set('[data-app="ref1Contact"]', 'ref1@example.org');
  set('[data-app="ref2Name"]', 'Ref Two'); set('[data-app="ref2Contact"]', 'ref2@example.org');
  set('[data-app="statement"]', 'I like explaining things.'); set('[data-app="consent"]', true);
  onboardShot_(p, 'apply-form');
  p.A('apply-send', f.querySelector('[data-do="apply-send"]')); await wait(400);
  if ((W.real.tabs.applications || [[]]).length !== 2) return bad.concat(['the application was not written']);
  await findSet_(p, 'Parent');
  if (!/Application sent/.test((inFind(p, '.apply-tiles [data-do="apply-open"][disabled]') || { getAttribute: () => '' }).getAttribute('aria-label'))) bad.push('Find › Settings does not say the application is sent: ' + ((inFind(p, '.apply-card') || {}).outerHTML || 'no card') + JSON.stringify(p.t.whoami().application));
  onboardShot_(p, 'apply-sent');
  /* 2. THE ADMIN SEES IT IN FIND › SETTINGS › BUSINESS AND APPROVES. */
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return bad.concat([a.err]);
  await findSet_(a, 'Business'); await wait(400); a.w.paintStuff(); await wait(200);
  const apps = () => inFind(a, '.apps');
  if (!apps() || !/Pat Parent/.test(apps().textContent)) return bad.concat(['Find › Settings › Business does not show Pat\'s application: ' + a.w.settingDoorItems_().map(x => x.name + '[' + x.settingFor + ']').join(', ')]);
  onboardShot_(a, 'admin-review');
  const yes = apps().querySelector('[data-do="app-decide"][data-status="approved"]');
  if (!yes) return bad.concat(['no Approve tile in Find']);
  a.A('app-decide', yes); await wait(500);
  if (!/tutor/.test(W.real.row('P-C1').role)) return bad.concat(['Approve did not make Pat a tutor: ' + W.real.row('P-C1').role]);
  W.real.ev('clearCache()');
  if (!(W.real.get({}).tutors || []).some(t => t.personId === 'P-C1')) bad.push('Pat is not on the public tutor list after Approve');
  /* 3. PAT SIGNS IN AGAIN AS A TUTOR: the card is in Find › Settings › Staff, and every section saves. */
  const c = await cardOpen_(W, 'parent@example.org', { reply });
  if (c.err) return bad.concat([c.err]);
  await findSet_(c, 'Staff');
  const names = c.w.settingDoorItems_().filter(x => x.settingFor.indexOf('Staff') !== -1 && x.mine !== false).map(x => x.name);
  ['Picture', 'Headline', 'Qualifications', 'Rate and extra seat', 'Class size', 'Available', 'At a glance', 'Where you teach'].forEach(n => { if (names.indexOf(n) === -1) bad.push('Find › Settings › Staff has no ' + n + ' for the new tutor: ' + names.join(', ')); });
  /* EACH SECTION OPENED IN FIND BY ITS NAME, CHANGED AND SAVED, as the tutor goes down the list. */
  const one = async name => { const S = c.t.STUFF(); S.q = name; c.w.paintStuff(); await wait(200); return c.d.querySelector('#s-stuff .card-ed'); };
  const type = (el, v) => { el.value = v; el.dispatchEvent(new c.w.Event('input', { bubbles: true })); el.dispatchEvent(new c.w.Event('change', { bubbles: true })); };
  const tick = el => { el.checked = true; el.dispatchEvent(new c.w.Event('change', { bubbles: true })); };
  const save = async (k, name) => { const sv = k.querySelector('[data-do="card-save"]'); if (!sv) { bad.push(name + ' has no Save in Find'); return; } c.A('card-save', sv); await wait(500); };
  const EDITS = [
    ['Headline', { headline: 'Maths, calmly' }],
    ['Rate and extra seat', { rate_per_hour: '26' }],
    ['Class size', { max_students: '3' }],
    ['At a glance', { years_experience: '4' }],
    ['Available', { m17: true, w18: true }],
  ];
  for (const [name, fields] of EDITS) {
    const k = await one(name);
    if (!k) { bad.push('Find drew no card for ' + name); continue; }
    Object.keys(fields).forEach(f => { const el = k.querySelector('[data-me="' + f + '"]'); if (!el) { bad.push(name + ' has no ' + f + ' box'); return; }
      if (fields[f] === true) tick(el); else type(el, fields[f]); });
    if (name === 'Headline') onboardShot_(c, 'card');
    await save(k, name);
  }
  /* THE PICTURE: one of the drawn faces, tapped — `savePhoto` keeps it at once. */
  { const k = await one('Picture'), pick = k && k.querySelector('[data-do="pfp-choose"]:not([data-pic="avatar"])');
    if (!pick) bad.push('the Picture card in Find has no faces to choose'); else { c.A('pfp-choose', pick); await wait(500); } }
  W.real.ev('clearCache()');
  const row = W.real.row('P-C1');
  const want = { headline: 'Maths, calmly', rate_per_hour: '26', max_students: '3', years_experience: '4' };
  Object.keys(want).forEach(f => { if (String(row[f]) !== want[f]) bad.push('the sheet holds ' + f + ' = ' + JSON.stringify(row[f]) + ', not ' + want[f]); });
  if (!/m17/.test(String(row.availability)) || !/w18/.test(String(row.availability))) bad.push('the week did not save: ' + JSON.stringify(row.availability));
  if (!row.photo) bad.push('the picture did not save');
  /* 4. CARA, A PARENT, FINDS PAT IN FIND › PROFILES, AND BOOK OPENS FIND › BOOKING WITH PAT ON THE FORM. */
  const k = await cardOpen_(W, 'cara@example.org', { reply });
  if (k.err) return bad.concat([k.err]);
  k.t.go('stuff', false, true);
  const KS = k.t.STUFF(); KS.filters.length = 0; KS.filters.push({ field: 'kindLabel', value: 'Profiles' }); KS.q = 'Pat'; k.w.paintStuff(); await wait(300);
  const pat = [...k.d.querySelectorAll('#s-stuff .card')].find(x => /Pat Parent/.test(x.textContent));
  if (!pat) return bad.concat(['Find › Profiles does not list Pat: ' + k.w.stuffFiltered().map(x => x.kind + ':' + x.name).join(', ')]);
  onboardShot_(k, 'listed');
  const book = pat.querySelector('[data-do="book-with"]');
  if (!book) return bad.concat(['Pat\'s card in Find › Profiles has no Book tile: ' + [...pat.querySelectorAll('[data-do]')].map(x => x.dataset.do).join(',')]);
  k.A('book-with', book); await wait(400);
  const door = (k.t.STUFF().filters || []).some(f => f.value === 'Booking');
  if (!door) bad.push('Book did not open Find › Booking: ' + JSON.stringify(k.t.STUFF().filters));
  const step = k.d.querySelector('#s-stuff [data-step="tutor"]');
  if (!step || !/Pat Parent/.test(step.value || '')) bad.push('the booking form does not show Pat as the tutor: ' + (step ? step.outerHTML.slice(0, 200) : 'no tutor step drawn'));
  onboardShot_(k, 'book');
  return bad;
});

/* A PICTURE OF EACH STEP (`ONBOARD_SHOTS=dir`): the page's HTML, drawn at 390px by a browser afterwards. */
function onboardShot_(c, name) {
  const dir = process.env.ONBOARD_SHOTS;
  if (!dir) return;
  try { require('fs').writeFileSync(require('path').join(dir, 'onboard-' + name + '.html'), '<!doctype html>' + c.d.documentElement.outerHTML); } catch (e) {}
}
