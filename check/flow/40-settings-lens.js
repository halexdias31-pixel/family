/* ---------- THE ADMIN'S LENS (rules.json 9.7): Find › Settings drawn as a parent's, a tick saved to their row, then back to your own ---------- */
check('An admin opens a parent\'s settings in Find through the lens, sees their choices, flips one onto their row, and the ✕ brings back their own settings', async () => {
  const W = cardWorld_();
  const bad = [];
  const real = ['lensOpen', 'setNotify', 'updateProfile', 'myProfile'];
  const reply = b => (real.indexOf(b.action) !== -1 ? W.real.post(b) : W.reply(b));
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return [a.err];
  const findSet_ = async () => { a.t.go('stuff', false, true); a.w.findSettings_(''); a.w.paintStuff(); await wait(400); };
  const inFind = sel => a.d.querySelector('#s-stuff ' + sel);
  /* FIND DRAWS A WINDOW OF PAGES: a setting further down is opened by its card, as a person scrolls to it (flow 30). */
  const open = async (name, sel) => { if (inFind(sel)) return inFind(sel);
    const i = a.w.stuffPages_().findIndex(pg => pg.x && pg.x.name === name && !pg.part); if (i < 0) return null;
    a.w.goPage('stuff', a.w.stuffFirstResult_() + i, true); await wait(300); return inFind(sel); };
  const shot = n => { try { if (typeof onboardShot_ === 'function') onboardShot_(a, 'lens-' + n); } catch (e) { /* a picture is a nicety */ } };
  /* THE PEOPLE CARDS THE PICKER SEARCHES, as an admin's payload carries them (flow 35 does the same). */
  a.t.DATA().everyone = [{ personId: 'P-C1', title: 'Pat P.', handle: 'patparent', role: 'Client', image: '' },
    { personId: 'P-S1', title: 'Sam S.', handle: 'samstudent', role: 'Student', image: '' }]; a.t.memoDrop();
  await findSet_();
  /* 1. THE PICKER: the people picker the Edit form uses, its hits a tap each. */
  const q = inFind('.lens-card [data-fam-q="lens"]');
  if (!q) return ['Find › Settings has no View as picker for the admin: ' + a.w.settingDoorItems_().map(x => x.name).join(', ')];
  q.value = 'Pat'; q.dispatchEvent(new a.w.Event('input', { bubbles: true })); await wait(100);
  const hit = inFind('.lens-card [data-do="lens-pick"][data-id="P-C1"]');
  if (!hit) return ['typing Pat offered no tile for P-C1: ' + (inFind('.lens-card .fam-hits') || {}).innerHTML];
  a.A('lens-pick', hit); await wait(700);
  const opened = a.sent.find(b => b.action === 'lensOpen');
  if (!opened || opened.targetId !== 'P-C1' || opened.personId !== 'P-A1') bad.push('the pick sent no lensOpen for P-C1 as the admin: ' + JSON.stringify(opened));
  await findSet_();
  /* 2. THE BANNER, A REMOVABLE TAG, and their sign-out shut, greyed not hidden. */
  const tag = inFind('.lens-card .lens-tag');
  if (!tag || !/Viewing Pat/.test(tag.textContent)) return bad.concat(['no "Viewing Pat…" tag after the pick: ' + ((inFind('.lens-card') || {}).outerHTML || 'no lens card')]);
  shot('banner');
  const out = await open('Signed in', '.signed-in [data-do="signout"]');
  if (!out) bad.push('Sign out is hidden in the lens, not greyed');
  else if (!out.disabled) bad.push('Sign out is pressable in the lens');
  if (out && !out.closest('.is-locked')) bad.push('the Signed in card is not shut in the lens');
  const pin = await open('Signing in', '#pin-now, [data-lock-id="pin-now"]');
  if (!pin) bad.push('the Signing in card is hidden in the lens, not shown shut');
  else if (!pin.disabled) bad.push('the PIN boxes can be typed into in the lens');
  /* 3. THEIR EMAIL CHOICES, flipped onto their row. */
  const tick = await open('Notifications', '.notify-card [data-do="notify-pick"]');
  if (!tick) return bad.concat(['the lens shows no email choices for Pat: ' + ((inFind('.notify-card') || {}).textContent || 'no Notifications card').slice(0, 200)]);
  const kind = tick.getAttribute('data-kind'), col = W.real.ev('NOTIFY_KINDS[' + JSON.stringify(kind) + '].col');
  const was = !!tick.checked;
  tick.checked = !was; a.A('notify-pick', tick); await wait(700);
  const sn = a.sent.filter(b => b.action === 'setNotify').pop();
  if (!sn || sn.targetId !== 'P-C1' || sn.personId !== 'P-A1') bad.push('the flip sent no setNotify for P-C1 by the admin: ' + JSON.stringify(sn));
  const cell = W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-C1')")[col];
  if (String(cell) !== (was ? 'no' : 'yes')) bad.push('Pat\'s ' + col + ' cell is "' + cell + '" after the flip');
  if (W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-A1')")[col] && String(W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-A1')")[col]) === (was ? 'no' : 'yes')) bad.push('the flip landed on the admin\'s own row');
  const log = W.sheet('read(TAB.lens_log).rows');
  if (!log.some(r => r.by_id === 'P-A1' && r.for_id === 'P-C1' && r.action === 'setNotify')) bad.push('the flip left no lens_log row: ' + JSON.stringify(log));
  shot('flipped');
  /* 4. THE ✕: back to the admin's own settings. */
  const x = await open('Viewing Pat Parent', '.lens-tag [data-do="lens-off"]');
  if (!x) return bad.concat(['the tag has no ✕']);
  a.A('lens-off', x); await wait(300);
  await findSet_();
  if (inFind('.lens-tag')) bad.push('the tag is still up after its ✕');
  if (!(await open('View as', '.lens-card [data-fam-q="lens"]'))) bad.push('the View as picker did not come back after the ✕');
  if (a.w.settingDoorItems_().some(x2 => /^Viewing/.test(x2.name))) bad.push('Find still lists the lens after the ✕');
  const own = await open('Signed in', '.signed-in [data-do="signout"]');
  if (own && own.disabled) bad.push('the admin\'s own Sign out is still shut after the ✕');
  if (!a.w.settingDoorItems_().some(x2 => [].concat(x2.settingFor).indexOf('Business') !== -1)) bad.push('the admin\'s Business settings did not come back after the ✕');
  return bad;
});
