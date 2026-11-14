/* SWITCHED OFF (owner, 14 Nov): the avatar maker (choosing one of the ten pictures). Lines 621-644 of check/flow/03-tutor-admin.js before 14 Nov. */
check('review 339: Save with nothing typed after a pick or a picture says what was saved, not "Nothing had changed"', async () => {
  const W = cardWorld_();
  const reply = b => (['saveAvatar', 'savePhoto'].indexOf(b.action) !== -1 ? W.real.post(b) : W.reply(b));
  const c = await cardOpen_(W, 'parent@example.org', { reply });
  if (c.err) return [c.err];
  const bad = [];
  const open = async () => { for (let k = 0; k < 30 && !c.form(); k++) await wait(100); return !!c.form(); };
  const save = async () => { c.A('card-save', c.tileOn('name', 'card-save')); await wait(400); return c.toast(); };
  if (!(await open())) return ['Pat\'s card did not open — NOT checked'];
  const sw = c.form().querySelector('.ce-sec[data-sec="figure"] [data-do="av-colour"][data-field="shirt"][data-value="5"]');
  const fox = c.form().querySelector('.pfp [data-do="pfp-choose"][data-pic="fox"]');
  if (!sw || !fox) return bad.concat(['no shirt 5 or no fox on Pat\'s form — NOT checked']);
  c.A('av-colour', sw);
  c.A('pfp-choose', fox);
  for (let k = 0; k < 30 && String(W.real.row('P-C1').photo) !== 'pfp:fox'; k++) await wait(100);
  await wait(300);
  let said = await save();
  if (!/picture and figure were saved/.test(said)) bad.push('Save after a pick and a picture said ' + JSON.stringify(said));
  if (!(await open())) return bad.concat(['Pat\'s card did not open a third time — NOT checked']);
  said = await save();
  if (!/Nothing had changed/.test(said)) bad.push('Save with nothing done at all said ' + JSON.stringify(said));
  return bad;
});

