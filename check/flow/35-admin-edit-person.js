/* EDIT ON SOMEBODY'S CARD (edit-person): an admin opens a student's card in Find › Profiles, Edit, types a first name, and the row changes; a tutor has no Edit and the server refuses. */
check('an admin edits a student\'s first name from their Find card and the row changes; a tutor sees no Edit and updateProfile refuses them', async () => {
  const W = cardWorld_();
  const reply = b => (['updateProfile', 'personGet'].indexOf(b.action) !== -1 ? W.real.post(b) : { success: true, messages: [] });
  const bad = [];
  const profiles = async c => {
    c.t.DATA().everyone = [{ personId: 'P-S1', title: 'Sam S.', handle: 'samstudent', role: 'Student', image: '' }];
    c.t.go('stuff', false, true);
    const KS = c.t.STUFF(); KS.filters.length = 0; KS.filters.push({ field: 'kindLabel', value: 'Profiles' }); c.w.paintStuff(); await wait(300);
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
  const tu = await cardOpen_(W, 'tutor@example.org', { reply });
  if (tu.err) return bad.concat([tu.err]);
  await profiles(tu);
  if (tu.d.querySelector('[data-do="person-edit"]')) bad.push('a tutor is offered Edit');
  const u = tu.u, no = W.real.post({ action: 'updateProfile', token: u.token, name: u.name, personId: u.personId, target: 'Sam', targetId: 'P-S1', fields: { first_name: 'Nope' } });
  if (no.success) bad.push('the backend let a tutor edit a student');
  if (W.sheet("read(TAB.people).rows.find(r => r.person_id === 'P-S1')").first_name !== 'Samuel') bad.push('the tutor\'s refused edit changed the row');
  return bad;
});
