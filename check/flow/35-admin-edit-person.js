/* EDIT ON SOMEBODY'S CARD (edit-person): an admin opens a student's card in Find › Profiles, Edit, types a first name, and the row changes; a tutor has no Edit and the server refuses. */
check('an admin edits a student\'s first name from their Find card and the row changes; a tutor sees no Edit and updateProfile refuses them; the form ticks their notifications', async () => {
  const W = cardWorld_();
  const reply = b => (['updateProfile', 'personGet', 'setNotify'].indexOf(b.action) !== -1 ? W.real.post(b) : { success: true, messages: [] });
  const bad = [];
  const profiles = async c => {
    c.t.DATA().everyone = [{ personId: 'P-S1', title: 'Sam S.', handle: 'samstudent', role: 'Student', image: '' }]; c.t.memoDrop();
    c.t.go('stuff', false, true);
    const KS = c.t.STUFF(); KS.filters.length = 0; KS.filters.push({ field: 'kindLabel', value: 'Profiles' }, { field: 'profileType', value: 'Student' }); c.w.paintStuff(); await wait(300);
  };
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return [a.err];
  await profiles(a);
  const tile = a.d.querySelector('#s-stuff [data-do="person-edit"][data-id="P-S1"]');
  if (!tile) return ['no Edit tile on the student\'s card for the admin: ' + a.w.stuffFiltered().map(x => x.kind + ':' + x.name).join(', ')];
  a.A('person-edit', tile); await wait(600);
  const box = a.d.querySelector('#s-stuff .pe-form [data-pe="first_name"]');
  if (!box) return ['Edit did not open the form on the card'];
  if (box.value !== 'Sam') bad.push('the form opened with first name "' + box.value + '"');
  a.type(box, 'Samuel'); await wait(1200);
  const post = a.sent.find(b => b.action === 'updateProfile');
  if (!post || post.targetId !== 'P-S1') bad.push('no updateProfile for P-S1 was sent: ' + JSON.stringify(post));
  const row = W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-S1')");
  if (row.first_name !== 'Samuel') bad.push('the row\'s first name is "' + row.first_name + '", not Samuel');
  if (!/Saved/.test(String((a.d.querySelector('#s-stuff .pe-said') || {}).textContent))) bad.push('the card does not say Saved');
  /* THEIR NOTIFICATIONS ON THE SAME FORM: the student's kinds, ticked as the sheet says; unticking one writes `no` on their row. */
  const tick = a.d.querySelector('#s-stuff .pe-form [data-do="pe-notify"][data-kind="messages"]');
  if (!tick) bad.push('the Edit form shows no Messages tick for the student');
  else {
    if (!tick.checked) bad.push('a student\'s untouched Messages tick is drawn off');
    tick.checked = false; a.A('pe-notify', tick); await wait(600);
    const sn = a.sent.find(b => b.action === 'setNotify');
    if (!sn || sn.targetId !== 'P-S1' || sn.on !== false) bad.push('unticking sent no setNotify for P-S1: ' + JSON.stringify(sn));
    const cellNow = W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-S1')").messages_email;
    if (String(cellNow) !== 'no') bad.push('the student\'s messages cell is "' + cellNow + '", not no');
  }
  const tu = await cardOpen_(W, 'tutor@example.org', { reply });
  if (tu.err) return bad.concat([tu.err]);
  await profiles(tu);
  if (tu.d.querySelector('[data-do="person-edit"]')) bad.push('a tutor is offered Edit');
  const u = tu.u, no = W.real.post({ action: 'updateProfile', token: u.token, name: u.name, personId: u.personId, target: 'Sam', targetId: 'P-S1', fields: { first_name: 'Nope' } });
  if (no.success) bad.push('the backend let a tutor edit a student');
  if (W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-S1')").first_name !== 'Samuel') bad.push('the tutor\'s refused edit changed the row');
  return bad;
});
