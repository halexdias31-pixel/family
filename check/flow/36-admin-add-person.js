/* ADD A PERSON AND LINK A FAMILY FROM FIND (add-person, edit-person): an admin makes parent Pat Example for Finley, then takes the link off and puts it back on Finley's Edit; a tutor has neither and the server refuses. */
check('an admin adds parent Pat Example linked to Finley from Find › Profiles, and edits the link; a tutor has no Add card and the server refuses', async () => {
  const W = cardWorld_({ people: [['P-S9', 'Finley', 'Example', 'student', '']] });
  const reply = b => (['personSave', 'personGet', 'linkChild', 'adminUnlinkFamily', 'updateProfile'].indexOf(b.action) !== -1 ? W.real.post(b) : { success: true, messages: [] });
  const bad = [];
  const everyone = () => [{ personId: 'P-S9', title: 'Finley E.', handle: 'finleyexample', role: 'Student', image: '' },
    { personId: 'P-C1', title: 'Pat P.', handle: 'patparent', role: 'Client', image: '' }];
  const profiles = async c => {
    c.t.DATA().everyone = everyone(); c.t.memoDrop();
    c.t.go('stuff', false, true);
    const KS = c.t.STUFF(); KS.filters.length = 0; KS.filters.push({ field: 'kindLabel', value: 'Profiles' }, { field: 'profileType', value: 'Student' }); c.w.paintStuff(); await wait(300);
  };
  const famRows = () => W.sheet("read(TAB.family).rows.filter(f => f.child_id === 'P-S9').map(f => ({ p: String(f.parent_id), s: String(f.state) }))");
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return [a.err];
  await profiles(a);
  const card = () => a.d.querySelector('#s-stuff .pa-card');
  if (!card()) return ['no Add a person card in Find › Profiles for the admin: ' + a.w.stuffFiltered().map(x => x.kind + ':' + x.name).join(', ')];
  const role = card().querySelector('[data-pa="role"]');
  role.value = 'client'; role.dispatchEvent(new a.w.Event('change', { bubbles: true })); await wait(300);
  if (!/Their child/.test(card().textContent)) bad.push('choosing Parent did not offer "Their child"');
  [['first', 'Pat'], ['last', 'Example'], ['email', 'pat@example.org']].forEach(([k, v]) => a.type(card().querySelector('[data-pa="' + k + '"]'), v));
  const q = card().querySelector('[data-fam-q="pa"]');
  q.value = 'fin'; q.dispatchEvent(new a.w.Event('input', { bubbles: true }));
  const hit = card().querySelector('[data-do="pa-pick"][data-id="P-S9"]');
  if (!hit) return bad.concat(['typing "fin" found no Finley in the child picker']);
  a.A('pa-pick', hit);
  if (!/Finley/.test(card().querySelector('.pa-picked').textContent)) bad.push('Finley is not shown as picked');
  a.A('pa-save', card().querySelector('[data-do="pa-save"]')); await wait(1200);
  const save = a.sent.find(b => b.action === 'personSave');
  if (!save || JSON.stringify(save.roles) !== '["client"]' || save.invite) bad.push('personSave posted ' + JSON.stringify(save));
  const pat = W.sheet("(read(TAB.people).rows.find(r => r.first_name === 'Pat' && r.last_name === 'Example') || {}).person_id");
  if (!pat) return bad.concat(['no Pat Example row was made']);
  if (!famRows().some(f => f.p === pat && f.s === 'accepted')) bad.push('Finley has no accepted link to Pat: ' + JSON.stringify(famRows()));
  const got = W.real.post({ action: 'personGet', token: a.u.token, personId: a.u.personId, targetId: 'P-S9' });
  if (!((got.person || {}).parentIds || []).includes(pat)) bad.push('personGet for Finley does not list Pat among the parents: ' + JSON.stringify(got.person));
  if (!/PIN/.test(String((card() || {}).textContent)) || /went to/.test(String((card() || {}).textContent))) bad.push('the card does not show Pat\'s PIN on screen (nothing is emailed)');

  /* THE EDIT FORM ON FINLEY: Pat listed with Remove; Remove takes the row off, the picker puts it back. */
  a.t.DATA().everyone = everyone().concat([{ personId: pat, title: 'Pat E.', handle: 'patexample', role: 'Client', image: '' }]);
  a.t.memoDrop(); a.w.paintStuff(); await wait(200);
  const edit = a.d.querySelector('#s-stuff [data-do="person-edit"][data-id="P-S9"]');
  if (!edit) return bad.concat(['no Edit tile on Finley\'s card']);
  a.A('person-edit', edit); await wait(600);
  const fam = () => a.d.querySelector('#s-stuff .pe-form .pe-fambox');
  if (!fam() || !/Pat/.test(fam().textContent)) return bad.concat(['the Edit form does not list Pat as a parent']);
  /* TAP AGAIN TO CONFIRM (sure_): the first press only asks. */
  const rm = fam().querySelector('[data-do="pe-unlink"][data-id="' + pat + '"]');
  a.A('pe-unlink', rm); await wait(700);
  if (!famRows().some(f => f.p === pat)) bad.push('one tap on Remove took the link off without asking');
  a.A('pe-unlink', rm); await wait(600);
  if (famRows().some(f => f.p === pat)) bad.push('Remove left the family row');
  if (/Pat E/.test(fam().textContent.split('Add a parent')[0])) bad.push('Pat is still listed after Remove');
  const q2 = fam().querySelector('[data-fam-q="pe"]');
  q2.value = 'pat'; q2.dispatchEvent(new a.w.Event('input', { bubbles: true }));
  const hit2 = fam().querySelector('[data-do="pe-link"][data-id="' + pat + '"]');
  if (!hit2) bad.push('the parent picker did not find Pat');
  else { a.A('pe-link', hit2); await wait(600); }
  if (!famRows().some(f => f.p === pat && f.s === 'accepted')) bad.push('linking from the Edit form made no accepted row');

  /* A TUTOR: no card, and the server refuses both actions. */
  const tu = await cardOpen_(W, 'tutor@example.org', { reply });
  if (tu.err) return bad.concat([tu.err]);
  await profiles(tu);
  if (tu.d.querySelector('.pa-card')) bad.push('a tutor is offered Add a person');
  const u = tu.u;
  const made = W.real.post({ action: 'personSave', token: u.token, personId: u.personId, targetId: '', firstName: 'No', lastName: 'Body', roles: ['client'], email: 'no@example.org' });
  if (made.success) bad.push('the backend let a tutor make a person');
  const cut = W.real.post({ action: 'adminUnlinkFamily', token: u.token, personId: u.personId, parentId: pat, childId: 'P-S9' });
  if (cut.success || !famRows().some(f => f.p === pat)) bad.push('the backend let a tutor take a family link off');
  return bad;
});
