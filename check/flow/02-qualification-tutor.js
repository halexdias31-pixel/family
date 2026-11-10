/* ---------- A REPLY THAT LANDS LEAVES AN OPEN LIST WHERE IT IS § */
check('a reply that lands leaves an open list where it is: a focused select keeps its node, an open venues field stays open', async () => {
  const P = payload();
  const { w } = boot({ payload: Object.assign(P, { profileFields: Object.assign({}, P.profileFields || {}, { 'Contact & address': ['favourite_colour', 'email', 'venues_ok'] }) }),
    reply: b => b.action === 'myProfile'
      ? { success: true, personId: 'P9', role: 'tutor', roles: ['tutor'], profile: { first_name: 'Ada', last_name: 'Tutor', phone_cc: '+44', email: 'ada@example.org', venues_ok: '' } }
      : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.landRepaint_ !== 'function') return ['landRepaint_ is not a global — the landing repaint was NOT checked'];
  t.USER({ name: 'Ada Tutor', personId: 'P9', role: 'tutor', roles: ['tutor'], token: 'tk',
           profile: { first_name: 'Ada', last_name: 'Tutor', phone_cc: '+44', email: 'ada@example.org', venues_ok: '' } });

  /* THE BOOKING FORM'S SELECT, its list open, and the payload's own repaint landing behind it. */
  try { t.repaint(true); t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const kind = d.querySelector('#bookr select.bk-sel[data-step="how"]:not(:disabled)');
  if (!kind) bad.push('no Kind select on the booking form — the booking half was NOT checked');
  else {
    kind.focus();
    w.landRepaint_();
    await wait(30);
    if (!kind.isConnected) bad.push('a payload landing rebuilt the booking card under a focused select — its list now belongs to nothing');
    else if (d.activeElement !== kind) bad.push('a payload landing took the focus off the booking select');
    const to = [...kind.options].find(o => o.value && !o.disabled);
    if (to) {
      kind.value = to.value;
      kind.dispatchEvent(new w.Event('change', { bubbles: true }));
      await wait(30);
      if (t.BOOKING.how !== to.value) bad.push('the pick made in the held select did not reach BOOKING.how: ' + JSON.stringify(t.BOOKING.how));
    }
    try { kind.blur(); } catch (e) {}
  }

  /* THE SETTINGS COLUMN: a select focused, then `profileRefresh_`'s repaint. */
  try { t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing settings threw: ' + e.message); return bad; }
  await wait(200);
  /* ITS PAGE BROUGHT IN FRONT FIRST (561): a page off the glass is inert, and nobody focuses a box in it. */
  let cc = d.querySelector('#s-account select[data-me]');
  const ccPage = cc && cc.closest('#s-account .page');
  if (ccPage && typeof w.goPage === 'function') {
    try { w.goPage('account', [...ccPage.parentElement.children].filter(x => x.classList.contains('page')).indexOf(ccPage), true); } catch (e) {}
    await wait(200);
    cc = d.querySelector('#s-account select[data-me]');
  }
  if (!cc) bad.push('no select on Settings (' + JSON.stringify([...d.querySelectorAll('#s-account [data-me]')].map(x => x.tagName + ':' + x.dataset.me).slice(0, 12)) + ') — the settings half was NOT checked');
  else if (typeof w.profileRefresh_ !== 'function') bad.push('profileRefresh_ is not a global — its repaint was NOT checked');
  else {
    cc.focus();
    w.profileRefresh_();
    await wait(300);
    if (!cc.isConnected) bad.push('profileRefresh_ rebuilt Settings under a focused select');
    try { cc.blur(); } catch (e) {}
    await wait(500);
  }

  /* THE VENUES FIELD, OPENED AND UNTOUCHED — a clean card, which `settingsKeep_` lets a repaint redraw. */
  w.paint('account');
  await wait(100);
  const det = () => d.querySelector('#s-account .field.many details');
  if (!det()) bad.push('no venues field on Settings — the open-list half was NOT checked');
  else {
    det().open = true;
    det().dispatchEvent(new w.Event('toggle'));
    await wait(30);
    const form = det().closest('.me-form');
    if (form && form.dataset.dirty) bad.push('opening the list marked its card dirty — a card held until Save for being read');
    w.landRepaint_();
    w.paint('account');
    await wait(60);
    if (!det() || !det().open) bad.push('the venues field shut when a payload landed, with nobody pressing it');
    det().open = false;
    det().dispatchEvent(new w.Event('toggle'));
    await wait(30);
    w.paint('account');
    await wait(60);
    if (det() && det().open) bad.push('the venues field, shut by the person, came back open after a repaint');
  }
  return bad;
});

/* ---------- THE QUALIFICATIONS CARD: ONE LINE A QUALIFICATION, EDITED IN PLACE, SAVED AS YOU GO § */
const QUAL_TUTOR = {
  qual_1: 'Maths', qual_1_level: 'GCSE', qual_1_grade: '9', qual_1_board: 'Hill Top School', qual_1_received: '2016', qual_1_teach: 'TRUE', qual_1_spec: 'TRUE',
  qual_2: 'Maths', qual_2_level: 'A-Level', qual_2_grade: 'A*', qual_2_board: 'Hill Top Sixth Form', qual_2_received: '2018', qual_2_teach: 'TRUE', qual_2_spec: 'TRUE',
  qual_3: 'Physics', qual_3_level: 'GCSE', qual_3_grade: '8', qual_3_received: '2016', qual_3_teach: 'TRUE', qual_3_spec: 'FALSE',
  qual_4: 'Physics', qual_4_level: 'A-Level', qual_4_grade: 'A', qual_4_board: 'Hill Top Sixth Form', qual_4_received: '2018', qual_4_teach: 'TRUE', qual_4_spec: 'FALSE',
  qual_5: 'English Literature', qual_5_level: 'GCSE', qual_5_grade: '7', qual_5_received: '2016',
  qual_6: 'Bible and Theology', qual_6_level: "Bachelor's degree", qual_6_received: 'Present',
  qual_7: 'DBS', qual_7_level: 'Enhanced', qual_7_received: '2025',
};
async function qualCard_(profile) {
  const quals = [];
  for (let i = 1; i <= 10; i++) ['', '_level', '_board', '_grade', '_received', '_teach', '_spec'].forEach(k => quals.push('qual_' + i + k));
  const b = boot({ payload: Object.assign(payload(), { profileFields: { Qualifications: quals } }),
                   reply: { success: true, changed: 1 } });
  await wait(300);
  b.w.__t.USER({ name: 'Ada Tutor', personId: 'P002', role: 'tutor', roles: ['tutor'], token: 'tk',
                 profile: Object.assign({ first_name: 'Ada', last_name: 'Tutor', phone_cc: '+44' }, profile || QUAL_TUTOR) });
  /* WHAT YOU TEACH IS ON THE TUTOR COLUMN since 444. */
  b.w.__t.go('staff', false, true); b.w.paint('staff');
  await wait(300);
  const d = b.w.document;
  const q = {
    b, w: b.w, d, sent: b.sent,
    A: (act, el) => b.w.__t.ACTIONS[act](el),
    shelf: () => d.querySelector('#s-staff .q-shelf'),
    slot: i => q.shelf() && q.shelf().querySelector('.q-slot[data-slot="' + i + '"]'),
    box: (i, k) => (q.slot(i) || d).querySelector('[data-me="qual_' + i + k + '"]') || {},
    line: i => q.slot(i) && q.slot(i).querySelector(':scope > .q-line'),
    seg: i => q.slot(i).querySelector('select.q-teach'),
    face: i => q.slot(i).querySelector('.q-mark-b'),
    /* A PICK FROM A LIST, the way the platform's own list makes one: the value, then `input` and
       `change`, both bubbling — which is also what `sel-pick` copied while the app had a panel. */
    pick: (el, v) => { el.value = v; el.dispatchEvent(new b.w.Event('input', { bubbles: true }));
                       el.dispatchEvent(new b.w.Event('change', { bubbles: true })); },
    posts: () => b.sent.filter(x => x.action === 'updateProfile'),
    last: () => { const p = q.posts(); return (p[p.length - 1] || {}).fields || null; },
    said: () => String((d.getElementById('toast') || {}).textContent || ''),
  };
  return q;
}
check('the qualifications card reads one line a qualification, written as the profile chip writes it', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  const shelf = q.shelf();
  if (!shelf) return ['there is no qualifications card on the settings column'];
  if (q.d.querySelectorAll('#s-staff [data-me^="qual_"]').length !== 70) bad.push('the form does not hold all seventy qual_ boxes');
  const lines = [...shelf.querySelectorAll('.q-list .q-line')];
  if (lines.length !== 7) bad.push('seven qualifications drew ' + lines.length + ' lines, not one each');
  /* THE SUBJECT ONCE, AT THE HEAD OF ITS OWN LINES. */
  const named = lines.map(l => l.querySelector('.q-who').textContent.trim()).filter(Boolean);
  const want = ['Maths', 'Physics', 'English Literature', 'Bible and Theology', 'DBS'];
  if (JSON.stringify(named) !== JSON.stringify(want)) bad.push('the subjects named on the lines are ' + JSON.stringify(named) + ', not each once in order');
  if (!q.line(2) || q.line(2).querySelector('.q-who').textContent.trim()) bad.push('Maths A-Level repeats its subject');
  /* THE LEVEL RAISED OVER THE GRADE, in the profile chip's own `.prof-iso`. */
  const iso = i => { const s = q.line(i) && q.line(i).querySelector('.prof-iso');
    return s ? [...s.children].map(c => c.tagName + ':' + c.innerHTML).join(' ') : 'plain'; };
  if (iso(1) !== 'SUP:GCSE SUB:9') bad.push('Maths GCSE 9 is drawn as ' + iso(1) + ', not the level raised over the grade');
  if (iso(2) !== 'SUP:A-Level SUB:A*') bad.push('Maths A-Level A* is drawn as ' + iso(2));
  if (iso(6) !== "SUP:Bachelor's degree SUB:<i>studying</i>") bad.push('a degree still being studied is drawn as ' + iso(6) + ', not "studying" in the grade\'s place');
  /* A CERTIFICATE IS WRITTEN PLAIN, as on the card. */
  if (iso(7) !== 'plain' || (q.line(7).querySelector('.q-plain') || {}).textContent !== 'Enhanced') bad.push('the Enhanced DBS is drawn as notation rather than plain');
  /* TEACH AS THE GOLD CHIP, CAN TEACH AS A WORD, NOTHING FOR NOT TEACHING. */
  const mark = i => { const m = q.line(i).querySelector('.q-mark'); return m.querySelector('.q-chip') ? 'chip' : m.textContent.trim(); };
  const marks = [1, 2, 3, 4, 5].map(mark);
  if (JSON.stringify(marks) !== JSON.stringify(['chip', 'chip', 'Can teach', 'Can teach', ''])) bad.push('the teaching marks read ' + JSON.stringify(marks));
  /* WHAT THE FACE LEAVES OFF IS IN THE LINE'S NAME. */
  const name = q.line(1).getAttribute('aria-label') || '';
  if (!/Hill Top School/.test(name) || !/2016/.test(name) || !/teach/.test(name)) bad.push('the Maths GCSE line is named "' + name + '", without its school, year and teaching');
  /* NOTHING TO PRESS BUT THE LINES AND THE `+`, and nothing open. */
  const acts = [...new Set([...shelf.querySelectorAll('[data-do]')].filter(b => !b.closest('.q-ed, .q-pool')).map(b => b.dataset.do))].sort();
  if (JSON.stringify(acts) !== JSON.stringify(['qual-add', 'qual-open', 'qual-teach'])) bad.push('the read card offers ' + JSON.stringify(acts) + ', not the lines and one +');
  const add = shelf.querySelector('[data-do="qual-add"]');
  if (!add || !add.classList.contains('tile') || add.disabled) bad.push('the + is not a live tile');
  if (shelf.querySelector('.is-open') || shelf.querySelector('input[type="checkbox"]')) bad.push('the card arrived with a line open, or with a checkbox on it');
  return bad;
});
check('a qualification opens in place, and each answer is saved as it is chosen', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(4) || !q.slot(5)) return ['the card has no Physics A-Level or English GCSE to work on'];
  /* ONE TAP OPENS IT, and only it. */
  q.A('qual-open', q.line(5));
  q.A('qual-open', q.line(4));
  const open = [...q.shelf().querySelectorAll('.q-slot.is-open')].map(s => s.dataset.slot);
  if (JSON.stringify(open) !== '["4"]') bad.push('opening Physics A-Level after English left ' + JSON.stringify(open) + ' open');
  if (q.line(4).getAttribute('aria-expanded') !== 'true') bad.push('the open line does not say it is expanded');
  /* A GRADE CHOSEN IS A GRADE SAVED — no Save to find. */
  q.sent.length = 0;
  const saidLine = q.shelf().closest('.me-form').querySelector('.me-said');
  if (saidLine) saidLine.textContent = 'An old refusal';
  q.pick(q.box(4, '_grade'), 'A*');
  await wait(300);
  let f = q.last();
  if (!f) bad.push('choosing a grade saved nothing');
  /* THE TOAST IS THE RECEIPT; THE LINE UNDER THE CARD IS FOR A REFUSAL. § */
  const saidNow = q.shelf().closest('.me-form').querySelector('.me-said');
  if (!saidNow || saidNow.textContent !== '') bad.push('after a save the line under the card says "' + (saidNow && saidNow.textContent) + '", not nothing');
  else {
    if (f.qual_4_grade !== 'A*' || f.qual_4_level !== 'A-Level' || f.qual_4 !== 'Physics') bad.push('the grade posted Physics as ' + JSON.stringify([f.qual_4, f.qual_4_level, f.qual_4_grade]));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('the grade did not post all seventy qual_ boxes');
  }
  if (!q.slot(4).classList.contains('is-open')) bad.push('the line shut after its grade was saved, so a second answer means opening it again');
  if (!q.d.querySelector('#s-staff .q-shelf').closest('.me-form').dataset.dirty) bad.push('an open line does not hold the column, so the repaint after a save would shut it');
  if ((q.line(4).querySelector('.prof-iso sub') || {}).textContent !== 'A*') bad.push('the line does not show the new grade');
  /* TEACH ON A SECOND LEVEL LEAVES THE FIRST'S — *"it unticks the other one. i dont want that"*. */
  /* ONE ROW, THE PHONE'S OWN PICKER: Can teach, Teaches or Not teaching. */
  if (q.slot(4).querySelectorAll('.q-ed select.q-teach').length !== 1 || q.slot(4).querySelector('.q-ed [data-do="qual-teach"]')) bad.push('the editor has more than one teaching control');
  q.sent.length = 0;
  q.pick(q.seg(4), 'spec');
  await wait(300);
  f = q.last();
  if (!f) bad.push('Teach saved nothing');
  else {
    if (f.qual_4_spec !== 'TRUE' || f.qual_4_teach !== 'TRUE') bad.push('Teach posted ' + JSON.stringify([f.qual_4_spec, f.qual_4_teach]) + ', not Teach and Can teach');
    if (f.qual_1_spec !== 'TRUE' || f.qual_2_spec !== 'TRUE') bad.push('Teach on Physics took Teach off Maths');
  }
  if (!q.line(4).querySelector('.q-chip')) bad.push('the line does not show the gold Teach chip it was just given');
  /* AND NOT TEACHING IS BOTH BOXES FALSE, ON THIS LINE ONLY. */
  q.sent.length = 0;
  q.pick(q.seg(4), 'no');
  await wait(300);
  f = q.last();
  if (!f || f.qual_4_spec !== 'FALSE' || f.qual_4_teach !== 'FALSE') bad.push('Not teaching did not post both of its boxes FALSE');
  else if (f.qual_3_teach !== 'TRUE') bad.push('Not teaching on the A-Level changed the GCSE');
  if (q.seg(4).value !== 'no' || q.seg(4).selectedOptions[0].textContent !== 'Not teaching') bad.push('the control does not read Not teaching');
  q.sent.length = 0;
  q.pick(q.seg(4), 'teach');
  await wait(300);
  f = q.last();
  if (!f || f.qual_4_spec !== 'FALSE' || f.qual_4_teach !== 'TRUE') bad.push('Can teach picked did not post Can teach');
  /* A SAVED LINE CANNOT LOSE ITS LEVEL BY A PICK: refused before anything is sent. */
  q.sent.length = 0;
  q.pick(q.box(4, '_level'), '');
  await wait(300);
  if (q.posts().length) bad.push('a line with its level emptied was saved');
  if (!/choose a level/i.test(q.said())) bad.push('emptying the level said "' + q.said() + '"');
  q.pick(q.box(4, '_level'), 'A-Level');
  await wait(300);
  /* THE SECOND TAP SHUTS IT, and with nothing left to save it sends nothing. */
  q.sent.length = 0;
  q.A('qual-open', q.line(4));
  await wait(300);
  if (q.posts().length) bad.push('shutting a line with nothing new in it saved again');
  if (q.shelf().querySelector('.is-open')) bad.push('the second tap did not shut the line');
  if (q.shelf().closest('.me-form').dataset.dirty) bad.push('a shut card still holds the column');
  /* A PRESS THAT REACHES A SHUT LINE'S TEACH — a raced redraw, or `check/press.js` pressing every action
     in turn — opens that line and answers, rather than doing nothing. */
  q.sent.length = 0;
  q.pick(q.seg(5), 'teach');
  await wait(300);
  const g = q.last();
  if (!g || g.qual_5_teach !== 'TRUE' || !q.slot(5).classList.contains('is-open')) bad.push('Teach pressed on a shut line did nothing');
  /* THE LINE'S OWN MARK CYCLES WITHOUT OPENING IT. */
  q.A('qual-open', q.line(5));
  await wait(300);
  q.sent.length = 0;
  q.A('qual-teach', q.face(5));
  await wait(300);
  const h = q.last();
  if (!h || h.qual_5_spec !== 'TRUE') bad.push('tapping the line\'s mark did not cycle Can teach to Teaches');
  if (q.slot(5).classList.contains('is-open')) bad.push('tapping the line\'s mark opened the line');
  if ((q.face(5).textContent || '').trim() !== 'Teaches') bad.push('the line\'s mark reads "' + q.face(5).textContent.trim() + '" after the tap');
  return bad;
});
/* A TAP THAT LANDS WHILE A TYPED ANSWER IS SAVING. § */
check('a tap on another qualification while a typed answer is saving still opens it', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(1) || !q.slot(2)) return ['the card has no Maths GCSE and A-Level to work on'];
  q.A('qual-open', q.line(2));
  const school = q.box(2, '_board');
  school.value = 'Kings College';
  school.dispatchEvent(new q.w.Event('input', { bubbles: true }));
  q.sent.length = 0;
  school.dispatchEvent(new q.w.Event('change', { bubbles: true }));
  if (!q.shelf().closest('.me-form').classList.contains('is-sending')) bad.push('the school\'s change did not start a save, so this journey proves nothing');
  q.line(1).click();
  await wait(400);
  const f = q.last();
  if (!f || f.qual_2_board !== 'Kings College') bad.push('the typed school was not saved');
  if (q.posts().length !== 1) bad.push('one typed answer and one tap made ' + q.posts().length + ' saves');
  const open = [...q.shelf().querySelectorAll('.q-slot.is-open')].map(s => s.dataset.slot);
  if (JSON.stringify(open) !== '["1"]') bad.push('the tap on Maths GCSE during the save left ' + JSON.stringify(open) + ' open, not the GCSE');
  /* AND THE TICK, pressed the same way, shuts the line once the save is in. */
  q.A('qual-open', q.line(2));
  const s2 = q.box(2, '_board');
  s2.value = 'Kings College London';
  s2.dispatchEvent(new q.w.Event('input', { bubbles: true }));
  s2.dispatchEvent(new q.w.Event('change', { bubbles: true }));
  q.slot(2).querySelector('[data-do="qual-done"]').click();
  await wait(400);
  if ((q.last() || {}).qual_2_board !== 'Kings College London') bad.push('the second school was not saved');
  if (q.shelf().querySelector('.is-open')) bad.push('the tick pressed during the save did not shut the line');
  return bad;
});
/* A CERTIFICATE HAS NO GRADE AND IS NOT TAUGHT. § */
check('a qualification moved onto a certificate drops its grade and its teaching', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  if (!q.slot(4)) return ['the card has no Physics A-Level to work on'];
  q.A('qual-open', q.line(4));
  if (q.slot(4).classList.contains('is-cert')) bad.push('Physics A-Level is marked a certificate');
  if (!q.slot(7).classList.contains('is-cert')) bad.push('the Enhanced DBS is not marked a certificate');
  q.sent.length = 0;
  q.pick(q.box(4, ''), 'First Aid');
  await wait(300);
  const f = q.last();
  if (!f) bad.push('moving the line onto First Aid saved nothing');
  else if (f.qual_4 !== 'First Aid' || f.qual_4_grade !== '' || f.qual_4_teach !== 'FALSE' || f.qual_4_spec !== 'FALSE') {
    bad.push('First Aid posted as ' + JSON.stringify([f.qual_4, f.qual_4_grade, f.qual_4_teach, f.qual_4_spec]) + ', keeping a grade or a teaching tick');
  }
  const s4 = q.slot(4);
  if (!s4 || !s4.classList.contains('is-cert')) bad.push('the line moved onto First Aid is not marked a certificate');
  if (s4 && s4.querySelector('.q-line .q-mark').textContent.trim()) bad.push('the certificate still wears a teaching mark');
  return bad;
});
check('adding a qualification: the + asks for the subject, then the level, and saves the moment it has both', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  q.sent.length = 0;
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const fresh = q.shelf().querySelector('.q-subj.is-new .q-slot.is-open[data-new]');
  if (!fresh) return ['+ did not open a new line'];
  const n = fresh.dataset.slot;
  const subj = fresh.querySelector('select.q-name');
  /* THE SUBJECT BOX HAS THE FOCUS, YOUR SUBJECTS FIRST IN ITS LIST. § */
  await wait(20);
  if (q.d.activeElement !== subj) bad.push('+ did not give the subject box the focus');
  const first = subj.querySelector('optgroup');
  const yours = first ? [...first.querySelectorAll('option')].map(o => o.value) : [];
  if (!first || first.label !== 'Your subjects' || JSON.stringify(yours) !== JSON.stringify(['Maths', 'Physics', 'English Literature', 'Bible and Theology', 'DBS'])) {
    bad.push('the subject list does not start with your own subjects (' + JSON.stringify(yours) + ')');
  }
  /* A SUBJECT ALONE IS NOT A QUALIFICATION: nothing posted, and the level is asked for next. */
  q.pick(subj, 'Maths');
  await wait(100);
  if (q.posts().length) bad.push('a subject with no level was saved');
  if (q.d.activeElement !== q.box(n, '_level')) bad.push('choosing the subject did not give the level box the focus');
  q.pick(q.box(n, '_level'), 'AS');
  await wait(300);
  const f = q.last();
  if (!f) bad.push('a subject and a level were not saved');
  else {
    if (f['qual_' + n] !== 'Maths' || f['qual_' + n + '_level'] !== 'AS') bad.push('the new line posted as ' + JSON.stringify([f['qual_' + n], f['qual_' + n + '_level']]));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('adding did not post all seventy qual_ boxes');
    if (f.qual_1 !== 'Maths' || f.qual_7_level !== 'Enhanced') bad.push('adding disturbed the lines already saved');
  }
  /* AND IT IS A MATHS LINE NOW — in the Maths group itself, its subject not said a second time, open for its grade, no longer new. § */
  const moved = q.slot(n);
  if (!moved || !q.slot(1) || moved.closest('.q-subj') !== q.slot(1).closest('.q-subj')
      || moved.querySelector('.q-who').textContent.trim() || q.shelf().querySelector('.q-subj.is-new')) {
    bad.push('the new AS did not join the Maths lines');
  }
  if (!moved || !moved.classList.contains('is-open') || moved.dataset.new) bad.push('the new line is not open as a saved line for the rest of its answers');
  /* A LINE THAT NEVER GOT ITS LEVEL GOES BACK UNSAVED. */
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const half = q.shelf().querySelector('.q-slot[data-new]');
  q.sent.length = 0;
  if (half) { q.pick(half.querySelector('select.q-name'), 'Physics'); await wait(100);
              q.A('qual-done', half.querySelector('[data-do="qual-done"]')); await wait(200); }
  if (!half || q.posts().length || q.shelf().querySelector('.q-list .q-slot[data-new]')) bad.push('a line with a subject and no level was kept or saved');
  /* AN EMPTY SLOT REACHED BY A PRESS OPENS AS A NEW LINE — what `+` does with the next one — rather
     than redrawing the card exactly as it was. */
  const pooled = q.shelf().querySelector('.q-pool .q-line');
  if (pooled) { q.A('qual-open', pooled); await wait(100); }
  if (!pooled || !q.shelf().querySelector('.q-list .q-slot.is-open[data-new]')) bad.push('a press on an empty slot did nothing');
  /* TEN IS THE MOST: the + is off, and the line under it says why. */
  const ten = {};
  for (let i = 1; i <= 10; i++) Object.assign(ten, { ['qual_' + i]: 'Subject ' + i, ['qual_' + i + '_level']: 'GCSE' });
  const q10 = await qualCard_(ten);
  const add10 = q10.shelf() && q10.shelf().querySelector('[data-do="qual-add"]');
  if (!add10 || !add10.disabled) bad.push('the + is live at ten qualifications');
  if (!/ten is the most/i.test((q10.shelf() && q10.shelf().querySelector('.q-full') || {}).textContent || '')) bad.push('nothing says why there is no room for an eleventh');
  return bad;
});
check('removing a qualification: the bin saves at once, and only that one goes', async () => {
  let q;
  try { q = await qualCard_(); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  const bad = [];
  q.A('qual-open', q.line(7));
  q.sent.length = 0;
  q.A('qual-drop', q.slot(7).querySelector('[data-do="qual-drop"]'));
  await wait(300);
  const f = q.last();
  if (!f) bad.push('the bin did not save');
  else {
    const blank = ['', '_level', '_grade', '_board', '_received'].every(k => f['qual_7' + k] === '')
               && f.qual_7_spec === 'FALSE' && f.qual_7_teach === 'FALSE';
    if (!blank) bad.push('the bin posted the DBS as ' + JSON.stringify(['', '_level', '_received'].map(k => f['qual_7' + k])));
    if (Object.keys(f).filter(k => /^qual_/.test(k)).length !== 70) bad.push('the bin did not post all seventy qual_ boxes');
    if (f.qual_6_level !== "Bachelor's degree" || f.qual_1_grade !== '9') bad.push('the bin took another qualification with it');
  }
  if (q.shelf().querySelector('.q-list .q-slot[data-slot="7"]')) bad.push('the DBS is still on the card after the bin');
  if (!/Removed DBS Enhanced/.test(q.said())) bad.push('the bin said "' + q.said() + '"');
  /* A LINE BEING ADDED WAS NEVER SAVED: its bin only puts it back. */
  q.A('qual-add', q.shelf().querySelector('[data-do="qual-add"]'));
  await wait(100);
  const fresh = q.shelf().querySelector('.q-slot[data-new]');
  q.sent.length = 0;
  if (fresh) { q.A('qual-drop', fresh.querySelector('[data-do="qual-drop"]')); await wait(200); }
  if (!fresh || q.posts().length || q.shelf().querySelector('.q-list .q-slot[data-new]')) bad.push('the bin on an unsaved line saved, or left the line on the card');
  return bad;
});

/* ---------- A TUTOR EDITS THEIR OWN CARD, ON THE CARD (docs/history/330) § */
const CARD_ADA_ = { headline: 'Maths, mostly', rate_per_hour: 20, extra_seat_rate: 0.5, min_students: 1, max_students: 4,
  years_experience: 5, age_min: 8, age_max: 16, adjective_1: 'calm', adjective_2: 'clear', adjective_3: 'kind',
  favourite_colour: 'Blue', travel_km: 5, photos: 'https://example.org/one.jpg', availability: 'm16,m17',
  /* A PHOTOGRAPH LINK FOR A FACE — the one kind of picture `savePhoto` cannot write back, so Cancel putting
     it back is a real test of the door it uses (`card-cancel`, me.js). */
  photo: 'https://example.org/ada.jpg' };
/* `more.people`: extra rows on the people tab, made by the same `P` — the review of 339 seats a parent who shares
   a listed tutor's name beside her. */
const cardWorld_ = (more) => {
  const real = require('./check-gas-load.js').backend();
  const base = { pin: '0000', verified: 'TRUE', listed: true, city: 'London' };
  const P = (id, first, last, role, email, more) => Object.assign({ person_id: id, first_name: first, last_name: last,
    handle: (first + last).toLowerCase(), email: email, role: role }, base, more || {});
  real.seed('people', [
    P('P-A1', 'Hal', 'Admin', 'admin', 'admin@example.org', { rate_per_hour: 30, headline: 'Runs the place' }),
    P('P-T1', 'Ada', 'Tutor', 'tutor', 'tutor@example.org', CARD_ADA_),
    /* BEN'S FACE IS ONE OF THE TEN (docs/history/324) — a token, not a link, so an admin's form showing it
       through anything but `personFace_` draws a broken image. */
    P('P-T2', 'Ben', 'Teacher', 'tutor', 'ben@example.org', { headline: 'Physics, mostly', rate_per_hour: 22, availability: 'sa10', photo: 'pfp:fox' }),
    P('P-C1', 'Pat', 'Parent', 'client', 'parent@example.org'),
    P('P-S1', 'Sam', 'Student', 'student', 'student@example.org'),
  ].concat(((more && more.people) || []).map(a => P.apply(null, a))));
  real.seed('venues', [
    { name: 'Colliers Wood Library', postcode: 'SW19 2HR', lat: 51.418, lng: -0.178, tutors_happy_here: 'P-T1' },
    { name: 'Mitcham Library', postcode: 'CR4 2YR', lat: 51.402, lng: -0.166 },
    { name: 'Online' },
  ]);
  real.seed('qualifications', [
    { person_id: 'P-T1', subject: 'Maths', level: 'GCSE', grade: '9', completed: '2016', teach: 'TRUE', can_teach: 'FALSE' },
  ]);
  const user = who => {
    const d = real.post({ action: 'verifyLogin', email: who, pin: '0000' });
    /* AND THE LOOK, as the sign-in reply carries it and the phone keeps it: your own card's Edit holds the
       wardrobe now (docs/history/339), which draws from `avatar`, `avatarItems`, `xp` and `credits`. */
    return d && d.success ? { name: d.name, personId: d.personId, role: d.role, roles: d.roles, token: d.token,
      handle: d.handle, profile: d.profile, avatar: d.avatar, avatarItems: d.avatarItems, xp: d.xp, credits: d.credits } : null;
  };
  /* THE THREE PROFILE ACTIONS GO TO THE REAL `doPost`, AND `savePhoto` — a tap in the picture grid is a
     token and needs no Drive, so the real door answers it; the app's other polls are answered plainly. */
  const reply = b => (['updateProfile', 'myProfile', 'getProfile', 'savePhoto'].indexOf(b.action) !== -1)
    ? real.post(b) : { success: true, messages: [] };
  /* THE PAYLOAD IS THE REAL `doGet`'S, asked again on every load — so the card a Save redraws is drawn from
     what the server now sends, qualifications included. */
  const GET = () => {
    const g = real.get({});
    const p = Object.assign(payload(), { features: ['setNotify'], tutors: g.tutors, venues: g.venues,
      profileFields: g.profileFields, studentFields: g.studentFields, clientFields: g.clientFields,
      validations: g.validations, profileReadonly: g.profileReadonly, phoneCodes: g.phoneCodes, rules: g.rules });
    /* `more.vars`: config numbers laid over the fixture's — the seat's `c` and `B` (docs/history/345). */
    if (more && more.vars) p.constants = Object.assign({}, p.constants, { vars: Object.assign({}, (p.constants || {}).vars, more.vars) });
    return p;
  };
  /* AND A PAYLOAD THAT CAN BE HELD — the live one takes seconds, and "the card says it at once" is a
     question about the seconds before it lands, which an instant stub would answer for it. */
  let held = null;
  const W = { real, user, reply, GET, holding: false,
    release: () => { const h = held; held = null; if (h) h(); },
    serve: u => (!/script\.google\.com/.test(u) ? undefined
      : !W.holding ? GET() : new Promise(ok => { held = () => ok(GET()); })),
    sheet: js => { real.ev('clearCache()'); return JSON.parse(real.ev('JSON.stringify(' + js + ')')); } };
  return W;
};
const cardOpen_ = async (W, who, more) => {
  more = more || {};
  const u = who ? W.user(who) : null;
  if (who && !u) return { err: who + ' could not sign in to the real backend' };
  const b = boot({ payload: W.GET(), reply: more.reply || W.reply, serve: W.serve, before: more.before || (u ? signedInAs_(u) : undefined) });
  for (let k = 0; k < 80 && !b.w.__t; k++) await wait(100);
  if (!b.w.__t) return { err: 'the app did not finish loading' };
  await wait(600);
  const t = b.w.__t, d = b.w.document;
  const home = t.homeCol();
  try { t.go(home, false, true); b.w.paint(home); } catch (e) { return { err: 'drawing the ' + home + ' column threw: ' + e.message }; }
  /* AND THE OTHER PEOPLE AND SETTINGS COLUMNS (453). */
  ['tutors', 'students', 'parents', 'staff', 'account', 'family', 'biz'].forEach(id => { try { if (id !== home && d.getElementById('s-' + id)) b.w.paint(id); } catch (e) {} });
  await wait(250);
  /* `more.col` names the card's face (453); your own card is edited on that face's settings column (464), somebody else's on Tutors (`T`). */
  const SETOF = { tutors: 'staff', students: 'account', parents: 'family' };
  const S = '#s-' + (SETOF[more.col || home] || more.col || home), T = '#s-tutors';
  /* 468: YOUR OWN CARD IS ALWAYS OPEN ON ITS SETTINGS COLUMN, A CARD PER SECTION — `form()` is the column holding them, `sec(id)` one card. */
  const F = '#s-' + (more.col || home);
  /* 469: EVERYBODY'S FOUR ARE ON STUDENT SETTINGS, the rest on the face's own column — the cards read across both, Student settings first. */
  const R = ['#s-account'].concat(S === '#s-account' ? [] : [S]);
  const all = sel => [].concat(...R.map(r => [...d.querySelectorAll(r + ' ' + sel)]));
  const both = { querySelector: sel => all(sel)[0] || null, querySelectorAll: sel => all(sel) };
  const c = {
    b, w: b.w, t, d, u, sent: b.sent, gets: b.gets, S,
    A: (act, el) => t.ACTIONS[act](el),
    cards: () => all('.card-ed'),
    secs: () => c.cards().map(x => x.dataset.sec),
    card: () => all('.card-ed')[0] || null,
    sec: id => all('.card-ed[data-sec="' + id + '"]')[0] || null,
    form: () => all('.card-ed .me-form').length ? both : null,
    box: f => all('.card-ed [data-me="' + f + '"]')[0] || null,
    /* NO SAVE TILE ON A SETTINGS SECTION (owner, 8 Nov: saved as typed); `card-save` on the card itself saves it now, as the wait would. */
    tileOn: (id, act) => c.sec(id) && (act === 'card-save' ? c.sec(id) : c.sec(id).querySelector('[data-do="' + act + '"]')),
    /* SAVE ON EACH NAMED SECTION'S CARD, one after the other, as a person goes down the column. */
    saveAll: async ids => { for (const id of ids) { const t1 = c.tileOn(id, 'card-save'); if (t1) { c.A('card-save', t1); await wait(400); } } },
    /* A BOX TYPED INTO AND LEFT, the way a person does it: `input`, then `change`, both bubbling. */
    type: (el, v) => { el.value = v; el.dispatchEvent(new b.w.Event('input', { bubbles: true }));
                       el.dispatchEvent(new b.w.Event('change', { bubbles: true })); },
    tick: (el, on) => { el.checked = on; el.dispatchEvent(new b.w.Event('change', { bubbles: true })); },
    posts: () => b.sent.filter(x => x.action === 'updateProfile'),
    said: () => c.cards().map(k => String((k.querySelector('.me-said') || {}).textContent || '')).join(' ').trim(),
    saidOn: id => String(((c.sec(id) && c.sec(id).querySelector('.me-said')) || {}).textContent || ''),
    dirty: () => all('.card-ed .me-form[data-dirty]').map(f => f.closest('.card-ed').dataset.sec),
    toast: () => toastOf_(d),
    drafts: () => Object.keys(keptStore_(b.w)).filter(k => /:card:/.test(k)),
    /* YOUR OWN CARD AS DRAWN — on the profile column alone (468), first there; somebody else's by a tile that names them. */
    pageOf: pid => pid === String((t.whoami() || {}).personId || '')
      ? [...d.querySelectorAll(F + ' > .page')].find(pg => pg.querySelector('.card') && !pg.querySelector('.add-card, .ps-card, .help-list'))
      : [...d.querySelectorAll(T + ' .page')].find(pg => pg.querySelector('[data-pid="' + pid + '"]')),
  };
  return c;
};
/* SPLIT SINCE 444: You edits the first four; the Tutor column the rest, less the rate, which the Staff hub edits; the week is Available's (487). */
const CARD_YOU_ = ['picture', 'figure', 'name', 'handle'];
const CARD_STAFF_ = ['seat', 'cut', 'size', 'headline', 'photos', 'words', 'glance', 'quals', 'where', 'week'];
/* A TUTOR'S CUT IS WORDS, NOT A BOX (620): the one field of theirs the cards show and do not offer. */
const SHOWN_ONLY_RE_ = /^extra_seat_cut$/;
/* WHAT THE CARD'S FIVE SECTIONS ARE CHANGED TO, one field or more in each, and the qualification's grade. */
const cardEditEverything_ = async c => {
  const f = c.form();
  c.type(c.box('headline'), 'Maths and physics, mostly');
  const more = f.querySelector('.ph-shelf [data-do="shelf-more"]');
  if (more) c.A('shelf-more', more);
  c.type(c.box('photos_2'), 'https://example.org/two.jpg');
  c.type(c.box('adjective_2'), 'patient');
  c.type(c.box('years_experience'), '6');
  c.type(c.box('favourite_colour'), 'Green');
  c.type(c.box('age_max'), '18');
  /* HOW LONG A SESSION IS — writable since the review of 330, in At a glance where the card prints it. */
  const hours = !!(c.box('min_hours') && c.box('max_hours'));
  if (hours) { c.type(c.box('min_hours'), '2'); c.type(c.box('max_hours'), '3'); }
  const line = f.querySelector('.q-slot[data-slot="1"] > .q-line');
  if (line) c.A('qual-open', line);
  await wait(50);
  c.type(c.box('qual_1_grade'), '8');
  await wait(50);
  /* BY AREA (owner, 8 Nov): Mitcham Library's area ticked afresh brings in every venue of it. */
  const mitcham = f.querySelector('input[data-where-area]');
  if (mitcham) { c.tick(mitcham, false); c.tick(mitcham, true); }
  c.type(c.box('travel_km'), '8');
  await wait(50);
  return { more: !!more, line: !!line, mitcham: !!mitcham, 'session length': hours };
};
const CARD_PLAIN_ = { headline: 'Maths and physics, mostly', adjective_2: 'patient',
  years_experience: '6', favourite_colour: 'Green', age_max: '18', min_hours: '2', max_hours: '3',
  venues_ok: 'Colliers Wood Library, Mitcham Library, Online', travel_km: '8' };
const CARD_WHOLE_RE_ = /^photos_\d+$|^qual_\d+(_\w+)?$/;

check('a tutor edits every section of their tutor card on Tutor settings, each section a card of its own with no preview (468): each Save posts its own section\'s changes, the sheet holds them, and the profile on Tutors redraws with them', async () => {
  const W = cardWorld_();
  const c = await cardOpen_(W, 'tutor@example.org', { col: 'tutors' });
  if (c.err) return [c.err];
  const bad = [];
  /* NO PREVIEW AND NO EDIT TILE: the settings column is only the editing (468). */
  if (c.d.querySelector(c.S + ' .own-set, ' + c.S + ' [data-do="card-edit"], ' + c.S + ' .me-card')) bad.push('Tutor settings still draws your card as others see it, or an Edit tile');
  const form = c.form();
  if (!form) return bad.concat(['Tutor settings draws no editing cards for Ada']);
  /* THE CARD'S ORDER, A CARD EACH. */
  const wantSecs = CARD_YOU_.concat(CARD_STAFF_);
  if (JSON.stringify(c.secs()) !== JSON.stringify(wantSecs)) bad.push('the section cards read ' + JSON.stringify(c.secs()) + ', not the card\'s order ' + JSON.stringify(wantSecs));
  c.cards().forEach(k => {
    const id = k.dataset.sec;
    if (k.dataset.layCard !== 'own:' + (CARD_YOU_.indexOf(id) !== -1 ? 'account' : 'staff') + ':' + id) bad.push('the ' + id + ' card\'s layout id is ' + JSON.stringify(k.dataset.layCard));
    if (k.querySelectorAll('.ce-sec').length !== 1) bad.push('the ' + id + ' card holds ' + k.querySelectorAll('.ce-sec').length + ' sections, not one');
    /* A SECTION WHOSE FIRST LINE NAMES IT HAS NO TITLE (491); every card keeps its line saying what it is for. */
    const untitled = ['headline', 'photos', 'words', 'glance', 'quals', 'where', 'figure', 'handle'].indexOf(id) !== -1;
    if (!!k.querySelector('h3') === untitled || !k.querySelector('.card-say')) bad.push('the ' + id + ' card ' + (untitled ? 'has a title its first line already says (491)' : 'has no title') + ', or no line saying what it is for');
    const sv = k.querySelector('[data-do="card-save"]'), cn = k.querySelector('[data-do="card-cancel"]');
    if (sv || !cn || !cn.classList.contains('tile')) bad.push('the ' + id + ' card has ' + (sv ? 'a Save tile (it saves as typed)' : 'no Cancel tile'));
    if (k.dataset.pid !== 'P-T1' || !k.classList.contains('is-prof')) bad.push('the ' + id + ' card is not Ada\'s');
  });
  /* EVERY FIELD A TUTOR'S FIVE PAGES HELD HAS A BOX HERE (the picture is the picker). */
  const groups = c.t.DATA().profileFields || {};
  const five = Object.keys(groups).filter(g => !/contact|library/i.test(g)).reduce((a, g) => a.concat(groups[g]), []);
  const missing = five.filter(f => f !== 'photo' && f !== 'first_name' && f !== 'last_name' && !SHOWN_ONLY_RE_.test(f) && !c.box(f));
  if (!five.length) bad.push('the payload sent no profileFields, so the boxes were NOT checked');
  if (missing.length) bad.push('the cards have no box for ' + missing.slice(0, 8).join(', ') + (missing.length > 8 ? ' (+' + (missing.length - 8) + ')' : ''));
  ['venues_ok', 'travel_km'].forEach(f => { if (!c.box(f)) bad.push('there is no ' + f + ' — where they tutor is not editable'); });
  /* THE RATE IS ON ITS OWN CARD (620), the hub only tries figures. */
  if (!form.querySelector('.card-ed[data-sec="seat"] [data-me="rate_per_hour"]')) bad.push('the tutor card\'s editor has no rate on its Rate and extra seat card');
  if (!form.querySelector('.card-ed .me-week')) bad.push('Tutor settings has no Available week (487)');
  /* THE EDITOR'S PHOTOGRAPHS ARE FETCHED AT ONCE — the owner, 10 Oct: § */
  const lazy = [...form.querySelectorAll('.card-ed img')].filter(i => i.getAttribute('loading') === 'lazy');
  if (!form.querySelector('.ph-shelf .ph-thumb img')) bad.push('the editor drew no photograph thumbnail, so whether they wait to be scrolled to was NOT checked');
  if (lazy.length) bad.push(lazy.length + ' picture(s) on the cards being edited are loading="lazy" (' + lazy.map(i => i.closest('[class]').className).join(', ') + ') — not fetched until scrolled to');
  const did = await cardEditEverything_(c);
  Object.keys(did).forEach(k => { if (!did[k]) bad.push('there is no ' + k + ' to press, so that section was NOT edited'); });
  if (form.querySelector('.prof-heat')) bad.push('Tutor settings draws the venue map (491: the map is the profile\'s; settings is configuration)');
  { const wv = form.querySelector('.card-ed[data-sec="where"] details[data-fold="where"] .ce-v'); if (!wv || !/3 venues/.test(wv.textContent)) bad.push('ticking Mitcham\'s area did not count its three venues: ' + (wv && wv.textContent)); }
  const dirty = c.dirty();
  if (JSON.stringify(dirty) !== JSON.stringify(['headline', 'photos', 'words', 'glance', 'quals', 'where'])) bad.push('the cards typed into are ' + JSON.stringify(dirty));
  c.sent.length = 0;
  W.holding = true;
  const g0 = c.gets.length;
  await c.saveAll(dirty);
  const posts = c.posts();
  if (posts.length !== dirty.length) return bad.concat(['six Saves posted ' + posts.length + ' updateProfile requests, not one each: ' + JSON.stringify(c.sent.map(x => x.action))]);
  /* EACH SAVE SENDS ITS OWN CARD'S BOXES AND NO OTHER'S. */
  posts.forEach((p, i) => {
    const k = c.sec(dirty[i]);
    const own = new Set([...((k && k.querySelectorAll('[data-me]')) || [])].map(x => x.dataset.me));
    const stray = Object.keys(p.fields || {}).filter(f => !own.has(f));
    if (stray.length) bad.push('Save on ' + dirty[i] + ' sent boxes of another card: ' + stray.slice(0, 5).join(', '));
  });
  const f = Object.assign({}, ...posts.map(p => p.fields || {}));
  if (posts.some(p => p.targetId !== 'P-T1')) bad.push('a Save was addressed to somebody other than Ada');
  /* EXACTLY WHAT CHANGED — and the three packed cells whole, because the server rebuilds each from what arrives. */
  const keys = Object.keys(f);
  const extra = keys.filter(k => !CARD_WHOLE_RE_.test(k) && !(k in CARD_PLAIN_));
  const absent = Object.keys(CARD_PLAIN_).filter(k => !(k in f));
  if (extra.length) bad.push('the Save sent fields nobody changed: ' + extra.join(', '));
  if (absent.length) bad.push('the Save left out fields that changed: ' + absent.join(', '));
  Object.keys(CARD_PLAIN_).forEach(k => { if (k in f && String(f[k]) !== CARD_PLAIN_[k]) bad.push(k + ' was sent as ' + JSON.stringify(f[k]) + ', typed ' + JSON.stringify(CARD_PLAIN_[k])); });
  const count = re => keys.filter(k => re.test(k)).length;
  if (count(/^photos_\d+$/) !== 8) bad.push('one photograph changed and ' + count(/^photos_\d+$/) + ' photograph boxes were sent, not all eight');
  if (count(/^qual_\d+/) !== 70) bad.push('one grade changed and ' + count(/^qual_\d+/) + ' qualification boxes were sent, not all seventy');
  if (count(/^(m|tu|w|th|f|sa|su)\d\d$/)) bad.push('the tutor card sent hour codes, which the hub edits');
  /* THE SHEET HOLDS IT. */
  const row = W.real.row('P-T1');
  const want = { headline: 'Maths and physics, mostly', adjective_2: 'patient',
                 years_experience: 6, favourite_colour: 'Green', age_max: 18, min_hours: 2, max_hours: 3, travel_km: 8, last_name: 'Tutor', extra_seat_rate: 0.5, adjective_1: 'calm' };
  Object.keys(want).forEach(k => { if (String(row[k]) !== String(want[k])) bad.push('the sheet\'s ' + k + ' is ' + JSON.stringify(row[k]) + ', wanted ' + JSON.stringify(want[k])); });
  if (String(row.photos) !== 'https://example.org/one.jpg | https://example.org/two.jpg') bad.push('the sheet\'s photographs are ' + JSON.stringify(row.photos));
  const venues = W.sheet('read(TAB.venues).rows.map(r => [S(r.name), S(r.tutors_happy_here)])');
  if (!venues.some(v => v[0] === 'Mitcham Library' && /P-T1/.test(v[1])) || !venues.some(v => v[0] === 'Colliers Wood Library' && /P-T1/.test(v[1]))) bad.push('the venues tab does not have Ada at both libraries: ' + JSON.stringify(venues));
  const quals = W.sheet('read(TAB.qualifications).rows.filter(r => S(r.person_id) === "P-T1").map(r => [S(r.subject), S(r.level), S(r.grade)])');
  if (JSON.stringify(quals) !== JSON.stringify([['Maths', 'GCSE', '8']])) bad.push('the qualifications tab holds ' + JSON.stringify(quals) + ', wanted Maths GCSE 8 alone');
  /* THE CARDS STAY OPEN WITH WHAT WAS SAVED, AND THE PROFILE SAYS IT AT ONCE — the payload that follows the Save is held here. */
  if (c.dirty().length) bad.push('after the Saves these cards still hold unsaved typing: ' + c.dirty().join(', '));
  if (!c.box('headline') || c.box('headline').value !== 'Maths and physics, mostly') bad.push('after Save the headline card does not hold the saved headline');
  if (!/Saved/.test(c.toast())) bad.push('the toast says "' + c.toast() + '", not Saved');
  if (c.drafts().length) bad.push('the card\'s draft is still on the device after Save: ' + c.drafts().join(', '));
  const pg = () => c.pageOf('P-T1');
  const text = () => String((pg() && pg().textContent) || '');
  if (!/Maths and physics, mostly/.test(text())) bad.push('the card does not carry the new headline straight after Save');
  if (!/patient/i.test(text())) bad.push('the card does not carry the new word straight after Save');
  if (!/2–3 hours/.test(text())) bad.push('the card does not say the new session length, 2–3 hours, straight after Save');
  /* AND THE PAYLOAD THAT FOLLOWS — the server's — draws the qualification as saved. */
  if (!c.gets.slice(g0).some(g => /script\.google\.com/.test(g))) bad.push('the Save asked for no payload after it, so the card was NOT seen redrawn from the server\'s');
  W.holding = false;
  W.release();
  for (let k = 0; k < 30; k++) {
    const r = (c.t.DATA().tutors || []).find(x => x.personId === 'P-T1');
    if (r && (r.qualsParts || []).some(q => String(q.grade) === '8')) break;
    await wait(100);
  }
  const sub = pg() && [...pg().querySelectorAll('.prof-iso sub')].map(s => s.textContent);
  if (!sub || sub.indexOf('8') === -1) bad.push('after the payload landed the card\'s Maths GCSE grade reads ' + JSON.stringify(sub) + ', not 8');
  return bad;
});

check('Cancel on a section\'s card puts it back as it was and sends nothing; a refused Save keeps the card, says why, and writes nothing (468)', async () => {
  const W = cardWorld_();
  const c = await cardOpen_(W, 'tutor@example.org', { col: 'tutors' });
  if (c.err) return [c.err];
  const bad = [];
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.form()) return ['Tutor settings draws no editing cards for Ada'];
  /* A QUALIFICATION BEING ADDED WITH A SUBJECT AND NO LEVEL IS NOT SENT — Settings never saves one either. */
  const add = c.sec('quals') && c.sec('quals').querySelector('.q-shelf [data-do="qual-add"]');
  if (!add) bad.push('the Qualifications card has no + to add a qualification, so a half-added one was NOT checked');
  else {
    c.A('qual-add', add);
    await wait(50);
    const fresh = c.sec('quals').querySelector('.q-list .q-slot[data-new]');
    if (!fresh) bad.push('+ on the Qualifications card did not start a line');
    else {
      c.type(fresh.querySelector('select.q-name'), 'Physics');
      c.sent.length = 0;
      c.A('card-save', c.tileOn('quals', 'card-save'));
      await wait(300);
      if (c.posts().length) bad.push('the card posted a qualification with a subject and no level');
      if (!/Choose a level/.test(c.saidOn('quals'))) bad.push('a half-added qualification is refused with "' + c.saidOn('quals') + '"');
      const again = c.sec('quals') && c.sec('quals').querySelector('.q-list .q-slot[data-new]');
      if (again) { c.A('qual-drop', again.querySelector('[data-do="qual-drop"]')); await wait(50); }
    }
  }
  /* REFUSED: a youngest older than the oldest. `ageRefusal_` refuses before anything is written. */
  c.type(c.box('age_min'), '17');
  c.type(c.box('age_max'), '9');
  c.type(c.box('headline'), 'Typed, and refused with the ages');
  c.sent.length = 0;
  c.A('card-save', c.tileOn('glance', 'card-save'));
  await wait(500);
  if (c.posts().length !== 1) bad.push('the refused Save posted ' + c.posts().length + ' requests');
  if (!c.sec('glance')) bad.push('a refused Save took away the At a glance card');
  else if (!/youngest age/i.test(c.saidOn('glance')) || !/Nothing was saved/i.test(c.saidOn('glance'))) bad.push('the line under At a glance says "' + c.saidOn('glance') + '", not the server\'s refusal');
  if (!c.box('headline') || c.box('headline').value !== 'Typed, and refused with the ages') bad.push('the refused Save on another card emptied the headline box');
  const row = W.real.row('P-T1');
  if (String(row.headline) !== 'Maths, mostly' || String(row.age_min) !== '8') bad.push('a refused Save wrote to the sheet: headline ' + JSON.stringify(row.headline) + ', age_min ' + JSON.stringify(row.age_min));
  /* CANCEL ON EACH CARD TYPED INTO: nothing sent, each box back, no draft. */
  const mitcham = c.sec('where') && c.sec('where').querySelector('input[data-where-area]');
  if (mitcham) { c.tick(mitcham, false); c.tick(mitcham, true); }
  if (!c.tileOn('where', 'card-cancel')) return bad.concat(['there is no Cancel on the Where you teach card, so Cancel was NOT checked']);
  c.sent.length = 0;
  for (const id of ['quals', 'glance', 'headline', 'where']) { c.A('card-cancel', c.tileOn(id, 'card-cancel')); await wait(300); }
  if (c.posts().length) bad.push('Cancel posted ' + c.posts().length + ' updateProfile requests');
  if (!c.box('headline') || c.box('headline').value !== 'Maths, mostly') bad.push('after Cancel the headline box holds ' + JSON.stringify(c.box('headline') && c.box('headline').value) + ', not the saved headline');
  if (!c.box('venues_ok') || c.box('venues_ok').value !== 'Colliers Wood Library') bad.push('after Cancel the venues are ' + JSON.stringify(c.box('venues_ok') && c.box('venues_ok').value));
  if (c.said()) bad.push('after Cancel a card says "' + c.said() + '"');
  if (c.drafts().length) bad.push('Cancel left a card\'s draft on the device: ' + c.drafts().join(', '));
  const text = String((c.pageOf('P-T1') || {}).textContent || '');
  if (!/Maths, mostly/.test(text) || /Typed, and refused/.test(text)) bad.push('after Cancel the profile on Tutors does not carry the headline it had');
  /* ---------- AND CANCEL ON THE PICTURE'S CARD PUTS THE PICTURE BACK — the review of 330 § */
  const fox = c.sec('picture') && c.sec('picture').querySelector('.pfp [data-do="pfp-choose"][data-pic="fox"]');
  if (!fox) return bad.concat(['the Picture card has no fox to tap, so Cancel putting the picture back was NOT checked']);
  c.sent.length = 0;
  c.A('pfp-choose', fox);
  for (let k = 0; k < 20 && String(W.real.row('P-T1').photo) !== 'pfp:fox'; k++) await wait(100);
  if (String(W.real.row('P-T1').photo) !== 'pfp:fox') return bad.concat(['tapping the fox did not save it (sheet: ' + JSON.stringify(W.real.row('P-T1').photo) + '), so Cancel putting it back was NOT checked']);
  c.w.dispatchEvent(new c.w.Event('pagehide'));
  const two = await cardOpen_(W, null, { before: fromStore_(keptStore_(c.w)), col: 'tutors' });
  if (two.err) return bad.concat(['after the reload: ' + two.err]);
  for (let k = 0; k < 20 && !two.tileOn('picture', 'card-cancel'); k++) await wait(100);
  if (!two.tileOn('picture', 'card-cancel')) return bad.concat(['after the reload the Picture card has no Cancel, so Cancel after a reload was NOT checked']);
  two.sent.length = 0;
  two.A('card-cancel', two.tileOn('picture', 'card-cancel'));
  for (let k = 0; k < 20 && !two.posts().length; k++) await wait(100);
  await wait(300);
  const back = two.posts();
  if (back.length !== 1 || JSON.stringify(back[0].fields) !== JSON.stringify({ photo: 'https://example.org/ada.jpg' }) || back[0].targetId !== 'P-T1') {
    bad.push('Cancel after a picture was chosen sent ' + JSON.stringify(back.map(x => x.fields)) + ', not one updateProfile putting back the link she opened with');
  }
  if (two.sent.some(x => x.action === 'savePhoto')) bad.push('Cancel sent a savePhoto');
  if (String(W.real.row('P-T1').photo) !== 'https://example.org/ada.jpg') bad.push('after Cancel the sheet\'s picture is ' + JSON.stringify(W.real.row('P-T1').photo) + ', not the link Ada opened with');
  if (String((two.t.whoami().profile || {}).photo) !== 'https://example.org/ada.jpg') bad.push('after Cancel Ada\'s own profile says her picture is ' + JSON.stringify((two.t.whoami().profile || {}).photo));
  const face = two.pageOf('P-T1') && two.pageOf('P-T1').querySelector('.prof-top .prof-pic');
  if (!face || face.tagName !== 'IMG' || face.getAttribute('src') !== 'https://example.org/ada.jpg') bad.push('after Cancel Ada\'s profile shows ' + (face ? face.outerHTML.slice(0, 80) : 'no face') + ', not her photograph');
  if (!/your picture too/.test(two.toast())) bad.push('after Cancel the toast says "' + two.toast() + '", not that the picture was put back as well');
  if (two.drafts().length) bad.push('Cancel with a picture left a card\'s draft on the device: ' + two.drafts().join(', '));
  return bad;
});

check('a reload in the middle of editing the cards keeps every typed value, says they are not saved, and each card\'s Save sends them (468)', async () => {
  const W = cardWorld_();
  const c = await cardOpen_(W, 'tutor@example.org', { col: 'tutors' });
  if (c.err) return [c.err];
  const bad = [];
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.form()) return ['Tutor settings draws no editing cards for Ada'];
  const did = await cardEditEverything_(c);
  if (Object.keys(did).some(k => !did[k])) bad.push('not every section could be edited before the reload: ' + JSON.stringify(did));
  if (c.posts().length) bad.push('editing the card posted ' + c.posts().length + ' updateProfile requests before Save — the shelf saved as it went');
  c.w.dispatchEvent(new c.w.Event('pagehide'));
  const kept = keptStore_(c.w);
  const two = await cardOpen_(W, null, { before: fromStore_(kept), col: 'tutors' });
  if (two.err) return bad.concat(['after the reload: ' + two.err]);
  for (let k = 0; k < 20 && !two.form(); k++) await wait(100);
  if (!two.form()) return bad.concat(['after the reload Ada\'s card is a card again — what was typed is on the device and nothing on the screen says so']);
  Object.keys(CARD_PLAIN_).forEach(f => {
    const b = two.box(f);
    if (!b || String(b.value) !== CARD_PLAIN_[f]) bad.push('after the reload ' + f + ' holds ' + JSON.stringify(b && b.value) + ', typed ' + JSON.stringify(CARD_PLAIN_[f]));
  });
  if (!two.box('photos_2') || two.box('photos_2').value !== 'https://example.org/two.jpg') bad.push('after the reload the second photograph is gone');
  if (!two.box('qual_1_grade') || two.box('qual_1_grade').value !== '8') bad.push('after the reload the qualification\'s grade is ' + JSON.stringify(two.box('qual_1_grade') && two.box('qual_1_grade').value));
  if (!/Not saved yet/.test(two.said())) bad.push('after the reload the line under the form says "' + two.said() + '", not that what is in the boxes is not saved');
  two.sent.length = 0;
  /* EACH CARD'S SAVE SENDS ITS OWN (468): six cards were typed into, so six requests. */
  await two.saveAll(['headline', 'photos', 'words', 'glance', 'quals', 'where']);
  const p = two.posts(), sent = Object.assign({}, ...p.map(x => x.fields || {}));
  if (p.length !== 6) bad.push('Save on the six cards after the reload posted ' + p.length + ' requests');
  Object.keys(CARD_PLAIN_).forEach(f => { if (String(sent[f]) !== CARD_PLAIN_[f]) bad.push('Save after the reload sent ' + f + ' as ' + JSON.stringify(sent[f])); });
  const row = W.real.row('P-T1');
  if (String(row.headline) !== CARD_PLAIN_.headline) bad.push('the sheet after the reload\'s Save holds headline ' + JSON.stringify(row.headline));
  if (two.dirty().length || two.drafts().length) bad.push('after the Saves unsaved typing is still held: ' + two.dirty().concat(two.drafts()).join(', '));
  return bad;
});

/* ---------- 317'S RULE ON THE CARD: A NEWER SAVE BEATS AN OLDER DRAFT § */
check('a card draft typed over a value saved elsewhere since does not win after a reload — the newer save is drawn (317 on the card)', async () => {
  const W = cardWorld_();
  const c = await cardOpen_(W, 'tutor@example.org', { col: 'tutors' });
  if (c.err) return [c.err];
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.box('headline')) return ['Tutor settings draws no headline box'];
  c.type(c.box('headline'), 'Mine, typed and not saved');
  await wait(50);
  if (!c.drafts().length) return ['typing on the card kept no draft, so a newer save beating it was NOT checked'];
  const a = W.real.post({ action: 'verifyLogin', email: 'admin@example.org', pin: '0000' });
  const r = W.real.post({ action: 'updateProfile', token: a.token, name: a.name, personId: 'P-A1', target: 'Ada Tutor',
    targetId: 'P-T1', fields: { headline: 'Saved by the admin since' } });
  if (!r.success) return ['the admin\'s save was refused: ' + r.error];
  c.w.dispatchEvent(new c.w.Event('pagehide'));
  const two = await cardOpen_(W, null, { before: fromStore_(keptStore_(c.w)), col: 'tutors' });
  if (two.err) return ['after the reload: ' + two.err];
  /* THE REMEMBERED SIGN-IN STILL HOLDS THE OLD HEADLINE; `myProfile` brings the new one and redraws the card. */
  for (let k = 0; k < 40; k++) {
    const v = two.box('headline') && two.box('headline').value;
    if (v === 'Saved by the admin since') break;
    await wait(100);
  }
  const v = two.box('headline') && two.box('headline').value;
  if (!two.form()) return ['after the reload Ada\'s card is not open for editing'];
  return v === 'Saved by the admin since' ? []
    : ['after the reload the headline box holds ' + JSON.stringify(v) + ' — the older card draft won over a save made since'];
});

/* ---------- SIGN OUT IS UNDER THE FORM, AND KEEPS WHAT WAS TYPED FOR THE SAME PERSON § */
check('Sign out is on Student settings (453), not under a tutor\'s card while they edit it; it keeps the typing for them, and shows it to nobody else on the phone', async () => {
  const W = cardWorld_();
  const c = await cardOpen_(W, 'tutor@example.org');
  if (c.err) return [c.err];
  const bad = [];
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.form()) return ['Tutor settings draws no editing cards for Ada'];
  if (c.d.querySelector(c.S + ' [data-do="signout"]')) bad.push('Sign out is on Tutor settings beside the cards being edited — it is on Student settings');
  if (c.d.querySelector('[data-do="card-edit"]')) bad.push('an Edit tile is drawn — your own card is always open on its settings column (468)');
  const outs = c.d.querySelectorAll('#s-account [data-do="signout"]');
  if (outs.length !== 1) return bad.concat(['Student settings holds ' + outs.length + ' Sign out tiles, not one']);
  c.type(c.box('first_name'), 'Typed, then signed out');
  await wait(50);
  c.A('signout', outs[0]);
  await wait(400);
  try { ['tutors', 'staff', 'account'].forEach(id => c.w.paint(id)); } catch (e) {}
  await wait(100);
  if (c.card()) bad.push('the form is still drawn after Sign out');
  if (!c.drafts().length) bad.push('Sign out threw away what Ada typed on her card');
  /* SOMEBODY ELSE ON THE SAME PHONE: no form, no Edit on Ada's card — Edit on Pat's own card only, which is
     everybody's since docs/history/339. */
  const pat = W.real.post({ action: 'verifyLogin', email: 'parent@example.org', pin: '0000' });
  try { c.w.signedIn_(pat, 'parent@example.org'); } catch (e) { return bad.concat(['signing Pat in threw: ' + e.message]); }
  await wait(300);
  try { ['tutors', 'parents', 'staff', 'family', 'account'].forEach(id => c.w.paint(id)); c.t.go('account', false, true); } catch (e) {}
  await wait(150);
  if (c.d.querySelector('.card-ed[data-pid="P-T1"]')) bad.push('Pat, signed in on the same phone, sees Ada\'s card open for editing');
  /* 469: Pat's own four are on Student settings, as everybody's are, and no profile column offers them. */
  const patEdits = [...new Set([...c.d.querySelectorAll('.card-ed')].map(x => x.dataset.pid + '@' + String((x.closest('#screen > .screen') || {}).id || '').replace(/^s-/, '')))];
  if (JSON.stringify(patEdits) !== '["P-C1@account"]') bad.push('Pat is given editing cards for ' + JSON.stringify(patEdits) + ', wanted her own on Student settings alone');
  c.A('signout', c.d.createElement('button'));
  await wait(300);
  /* ADA BACK, SAME TAB: her card open, what she typed in its box, said as not saved. */
  const ada = W.real.post({ action: 'verifyLogin', email: 'tutor@example.org', pin: '0000' });
  try { c.w.signedIn_(ada, 'tutor@example.org'); } catch (e) { return bad.concat(['signing Ada back in threw: ' + e.message]); }
  await wait(300);
  try { c.t.go('account', false, true); c.w.paint('account'); c.w.paint('staff'); } catch (e) {}
  for (let k = 0; k < 20 && !c.form(); k++) await wait(100);
  if (!c.form()) bad.push('Ada signed back in on the same tab finds no editing cards — what she typed waits with nothing saying so');
  else {
    if (c.box('first_name').value !== 'Typed, then signed out') bad.push('Ada signed back in finds the first name ' + JSON.stringify(c.box('first_name').value));
    if (!/Not saved yet/.test(c.said())) bad.push('Ada signed back in is not told her typing is not saved: "' + c.said() + '"');
  }
  return bad;
});

/* ---------- SETTINGS HOLDS WHAT IS NOT ON YOUR CARD, FOR EVERYBODY (docs/history/330, 339) § */
/* THE SETUP CARD (361): the owner's "open the site once" ends here — an admin sees what ran; nobody else sees it, or is sent it. */
check('no Setup card anywhere (owner, 10 Nov: the health checker covers it); the setup report still reaches only an admin', async () => {
  const W = cardWorld_();
  const bad = [];
  const a = await cardOpen_(W, 'admin@example.org');
  if (a.err) return [a.err];
  const asAdmin = W.real.get({ token: a.u && a.u.token });
  if (!asAdmin.setup || !Array.isArray(asAdmin.setup.jobs)) bad.push('doGet with the admin\'s token sent no setup report');
  if (W.real.get({}).setup) bad.push('doGet with no token sent the setup report');
  a.t.go('site', false, true); a.w.paint('site'); await wait(300);
  if (a.d.querySelector('.setup-card')) bad.push('the Setup card is still drawn');
  return bad;
});

/* ---------- APPLY TO TEACH → THE ADMIN SAYS YES → LISTED (400) ---------- */
check('a client applies to teach from You, the admin\'s Business column glows "1 to approve" with the application, Approve makes them Staff on the tutor list, and the glow goes', async () => {
  const W = cardWorld_();
  const bad = [];
  const real = ['applyTeach', 'listApplications', 'decideApplication'];
  const reply = b => (real.indexOf(b.action) !== -1 ? W.real.post(b) : W.reply(b));
  /* NO DATE OF BIRTH IS UNDERAGE (450): Pat gives one before applying. */
  { const h = W.real.tabs.people[0], r = W.real.tabs.people.find(x => x[h.indexOf('person_id')] === 'P-C1'); r[h.indexOf('date_of_birth')] = '01/05/1980'; }
  const p = await cardOpen_(W, 'parent@example.org', { reply });
  if (p.err) return [p.err];
  /* 464, 1150: Tutor settings is a padlock for a client, and Apply to teach a card of its own beside it. */
  const card = p.d.querySelector('#s-staff .apply-card');
  /* NO SHEET (owner, 8 Nov): the form is in the card from the start. */
  const f = card && card.querySelector('.app-form');
  if (!f) return ['a client\x27s Apply to teach card has no form in it'];
  const set = (sel, v) => { const el = f.querySelector(sel); if (!el) { bad.push('the form has no ' + sel); return; }
    if (el.type === 'checkbox') el.checked = !!v; else el.value = v; };
  set('[data-app-subj="0"]', 'Maths'); set('[data-app-level="0"]', 'GCSE');
  set('[data-app="dbsNeeded"]', true); set('[data-app="rightToWork"]', 'yes');
  set('[data-app="ref1Name"]', 'Ref One'); set('[data-app="ref1Contact"]', 'ref1@example.org');
  set('[data-app="ref2Name"]', 'Ref Two'); set('[data-app="ref2Contact"]', 'ref2@example.org');
  set('[data-app="statement"]', 'I like explaining things.');
  /* WITHOUT THE CONSENT TICK: refused, nothing written. */
  p.A('apply-send', f.querySelector('[data-do="apply-send"]')); await wait(300);
  const rows = () => (W.real.tabs.applications || [[]]).length - 1;
  if (rows()) bad.push('an application without the consent tick was written');
  set('[data-app="consent"]', true);
  p.A('apply-send', f.querySelector('[data-do="apply-send"]')); await wait(400);
  if (rows() !== 1) return bad.concat(['the application was not written: ' + rows() + ' rows']);
  const st = p.d.querySelector('#s-staff .apply-card .apply-tiles');
  if (!st || !/Application sent/.test(st.innerHTML) || p.d.querySelector('#s-staff .apply-card [data-do="apply-open"]:not([disabled])')) bad.push('Tutor settings does not say the application is sent: ' + (st ? st.innerHTML : 'no tile row'));
  /* THE ADMIN: the card glows, the dot says 1, Approve. */
  const a = await cardOpen_(W, 'admin@example.org', { reply });
  if (a.err) return bad.concat([a.err]);
  /* A SETUP WITH NOTHING WRONG, so the dot counts the application alone. */
  const clean = JSON.parse(JSON.stringify(W.real.get({ token: a.u && a.u.token }).setup || {}));
  (clean.jobs || []).forEach(j => { delete j.error; }); clean.files = {};
  a.t.DATA().setup = clean;
  a.t.go('biz', false, true); a.w.paint('biz'); await wait(500);
  const apps = () => a.d.querySelector('#s-biz .apps');
  if (!apps() || !/Pat Parent/.test(apps().textContent) || !/Maths \(GCSE\)/.test(apps().textContent)) return bad.concat(['the Business column does not show Pat\'s application: ' + (apps() ? apps().textContent.slice(0, 200) : 'no card')]);
  if (!apps().classList.contains('needs-you') || !/1 to approve/.test(apps().textContent)) bad.push('the applications card does not glow "1 to approve"');
  const dot = () => a.d.getElementById('biz-dot');
  if (!dot() || dot().textContent !== '1') bad.push('the Business dot does not say 1: ' + (dot() ? dot().textContent : 'no dot'));
  const yes = apps().querySelector('[data-do="app-decide"][data-status="approved"]');
  if (!yes) return bad.concat(['no Approve tile']);
  a.A('app-decide', yes); await wait(500);
  if (!/tutor/.test(W.real.row('P-C1').role)) bad.push('Approve did not make Pat a tutor: ' + W.real.row('P-C1').role);
  W.real.ev('clearCache()');
  if (!(W.real.get({}).tutors || []).some(t => t.personId === 'P-C1')) bad.push('Pat is not on the public tutor list after Approve');
  /* THE APPROVAL ASKS FOR THE PAYLOAD AGAIN, and this world's is the anonymous one — the clean setup is laid back on. */
  a.t.DATA().setup = clean; a.w.paint('biz'); await wait(300);
  if (!apps() || apps().classList.contains('needs-you')) bad.push('the applications card still glows after Approve');
  if (dot()) bad.push('the Business dot is still drawn after Approve: ' + dot().textContent);
  return bad;
});

/* ---------- A TUTOR'S OWN LINK (400) ---------- */
check('?tutor=<handle> opens that tutor\'s card signed out, prices and a Share tile on it; an admin who teaches has "Share my profile" on their own card, which gives their link', async () => {
  const W = cardWorld_();
  const bad = [];
  const b = boot({ payload: W.GET(), serve: W.serve, url: 'https://example.org/?tutor=adatutor' });
  for (let k = 0; k < 80 && !b.w.__t; k++) await wait(100);
  await wait(800);
  const d = b.w.document;
  const body = d.getElementById('sheet-body');
  const text = String(body ? body.textContent : '');
  if (!/Ada/.test(text)) return ['?tutor=adatutor did not open Ada\'s card: ' + text.slice(0, 120)];
  if (!/£\s?20/.test(text)) bad.push('the shared card shows no price to a visitor: ' + text.slice(0, 200));
  const share = body.querySelector('[data-do="tutor-share"]');
  if (!share || share.dataset.handle !== 'adatutor') bad.push('the shared card has no Share tile with Ada\'s handle');
  const a = await cardOpen_(W, 'admin@example.org');
  if (a.err) return bad.concat([a.err]);
  const mine = [...a.d.querySelectorAll('#s-tutors [data-do="tutor-share"]')].find(x => x.dataset.handle === 'haladmin' && /Share my profile/.test(x.textContent + ' ' + (x.getAttribute('aria-label') || '') + ' ' + (x.title || '')));
  if (!mine) return bad.concat(['the admin\'s own card has no "Share my profile" tile: ' + [...a.d.querySelectorAll('#s-tutors [data-do]')].slice(0, 12).map(x => x.dataset.do).join(',')]);
  const r = profilePng_(a.w);
  a.A('tutor-share', mine);
  await r.till(() => r.shared.length);
  const got = r.shared[0] || {};
  if (!/\?tutor=haladmin/.test(String(got.text || ''))) bad.push('"Share my profile" did not hand over the admin\'s own link: ' + JSON.stringify(got.text));
  if (!((got.files || [])[0] || {}).type) bad.push('"Share my profile" handed over no picture');
  return bad;
});

/* ---------- THE PROFILE AS A PICTURE (412) ----------
   No canvas in jsdom: a recording one stands in, so the journey asks what was DRAWN (the words) and what was shared. */
const profilePng_ = (w, o) => {
  o = o || {};
  const r = { texts: [], images: [], canvases: [], shared: [], clicks: [], copied: [] };
  const ctx = new Proxy({ measureText: s => ({ width: String(s).length * 16 }), fillText: s => { r.texts.push(String(s)); },
    drawImage: img => { r.images.push(img); }, createRadialGradient: () => ({ addColorStop() {} }), getImageData: () => ({ data: [0, 0, 0, 0] }) },
    { get: (x, k) => (k in x ? x[k] : () => {}), set: (x, k, v) => { x[k] = v; return true; } });
  w.HTMLCanvasElement.prototype.getContext = function () { r.canvases.push(this); return ctx; };
  w.HTMLCanvasElement.prototype.toBlob = function (cb, type) {
    const b = new w.Blob(['\x89PNG'], { type }); b.__w = this.width; b.__h = this.height; r.blob = b; setTimeout(() => cb(b), 0); };
  /* A PHOTO LOADS, or (`o.photoFails`) refuses — the face then falls back to the initial. */
  w.Image = class { set src(v) { this._src = v; const no = o.photoFails && /^https?:/.test(v);
    setTimeout(() => (no ? this.onerror && this.onerror() : this.onload && this.onload()), 0); }
    get src() { return this._src; } get naturalWidth() { return 100; } get naturalHeight() { return 100; } };
  /* JSDOM DOES NOT DO PSEUDO-ELEMENTS (the receipt's journey says the same): the element's own style, so the snapshot adds no ::before. */
  const gcs = w.__gcs0 || (w.__gcs0 = w.getComputedStyle);
  w.getComputedStyle = (el, pseudo) => gcs.call(w, el);
  /* AND THE SNAPSHOT FETCHES THE PHOTO TO CARRY IT AS DATA (547): ada.jpg comes, or (`o.photoFails`) does not. */
  const fetch0 = w.__fetch0 || (w.__fetch0 = w.fetch);
  w.fetch = (u, x) => (/ada\.jpg/.test(String(u)) ? (o.photoFails ? Promise.reject(new Error('blocked'))
    : Promise.resolve({ ok: true, blob: () => Promise.resolve(new w.Blob(['jpg'], { type: 'image/jpeg' })) })) : fetch0 ? fetch0(u, x) : Promise.reject(new Error('no fetch')));
  w.navigator.canShare = x => !o.noFiles && !!(x && x.files && x.files.length && x.files[0].type === 'image/png');
  w.navigator.share = x => { r.shared.push(x); return Promise.resolve(); };
  Object.defineProperty(w.navigator, 'clipboard', { configurable: true, value: { writeText: s => { r.copied.push(s); return Promise.resolve(); } } });
  w.URL.createObjectURL = () => 'blob:profile'; w.URL.revokeObjectURL = () => {};
  w.HTMLAnchorElement.prototype.click = function () { r.clicks.push({ href: this.href, download: this.download }); };
  r.till = async ok => { const t0 = Date.now(); while (!ok() && Date.now() - t0 < 6000) await wait(20); };
  return r;
};
check('Share on a tutor card (412, 547) hands over a PNG of the very card the site draws (findCard, snapshotted) and the link; a child\'s phone has no price on it; a photo that will not come is left out; without file sharing the PNG is saved and the link copied', async () => {
  const W = cardWorld_();
  const bad = [];
  const open = async before => {
    const b = boot({ payload: W.GET(), serve: W.serve, url: 'https://example.org/?tutor=adatutor', before });
    for (let k = 0; k < 80 && !b.w.__t; k++) await wait(100);
    await wait(800);
    return { w: b.w, tile: b.w.document.querySelector('#sheet-body [data-do="tutor-share"]') };
  };
  /* THE SNAPSHOT'S HTML, out of the SVG the canvas drew, and the card on the screen beside it: the same words, in the same order. */
  const flat = s => String(s || '').replace(/\s+/g, ' ').trim();
  const shot = (w, r) => {
    const img = r.images.find(i => /^data:image\/svg\+xml/.test(i._src || ''));
    if (!img) return null;
    const svg = decodeURIComponent(img._src.replace(/^data:image\/svg\+xml;charset=utf-8,/, ''));
    /* READ AS HTML: jsdom's serializer writes the xmlns twice, which a browser does not, and an XML parser refuses. */
    const m = svg.match(/<foreignObject[^>]*>([\s\S]*)<\/foreignObject>/);
    const html = m ? m[1] : '';
    const box = w.document.createElement('div'); box.innerHTML = html;
    return { svg, text: flat(box.textContent), html };
  };
  /* A MAP WHOSE TILES WILL NOT COME IS LEFT OUT WHOLE (547), its caption with it unless tags follow: so the site's words, less what `tpngInline_` drops. */
  const site = (w, pic) => {
    const card = w.document.querySelector('#sheet-body .is-prof');
    if (!card) return '';
    const c = card.cloneNode(true);
    if (pic && !/prof-heat/.test(pic.html)) c.querySelectorAll('.prof-heat').forEach(heat => {
      const cap = heat.previousElementSibling, next = heat.nextElementSibling;
      heat.remove();
      if (cap && cap.classList.contains('prof-cap') && !(next && next.classList.contains('prof-tags'))) cap.remove();
    });
    return flat(c.textContent);
  };
  /* ---------- 1. A VISITOR ON A PHONE: one PNG and the link, to the share sheet ---------- */
  const v = await open();
  if (!v.tile) return ['?tutor=adatutor opened no card with a Share tile'];
  let r = profilePng_(v.w);
  v.w.__t.ACTIONS['tutor-share'](v.tile);
  await r.till(() => r.shared.length);
  if (r.shared.length !== 1) return ['Share handed ' + r.shared.length + ' shares to the share sheet, not 1'];
  const f = (r.shared[0].files || [])[0];
  if (!f || f.type !== 'image/png' || !/\.png$/.test(f.name) || !(f instanceof v.w.File)) bad.push('the share was not one PNG File: ' + (f ? f.type + ' ' + f.name : 'no file'));
  if (!/\?tutor=adatutor$/.test(String(r.shared[0].text || ''))) bad.push('the share\'s text is not Ada\'s link: ' + r.shared[0].text);
  const s1 = shot(v.w, r);
  if (!s1) bad.push('no snapshot of the card was drawn');
  else {
    console.log('          shot: ' + s1.text.slice(0, 160));
    if (!/is-prof/.test(s1.svg)) bad.push('the picture is not the profile card');
    if (!site(v.w, s1) || s1.text !== site(v.w, s1)) bad.push('the picture does not say what the card on the site says: picture "' + s1.text.slice(0, 200) + '" / site "' + site(v.w, s1).slice(0, 200) + '"');
    if (!/£20/.test(s1.text)) bad.push('a visitor\'s picture has no rate on it');
    if (!/<img[^>]+src="data:image\/jpeg/.test(s1.html)) bad.push('Ada\'s photo is not carried in the picture as data: ' + (s1.html.match(/<img[^>]*>/) || ['no img'])[0].slice(0, 160));
  }
  if (r.texts.length) bad.push('words were drawn on the canvas by hand: ' + r.texts.slice(0, 5).join(' | '));
  if (v.w.document.querySelector('.tpng-host')) bad.push('the card drawn for the picture was left on the page');
  /* ---------- 2. A LAPTOP: no file sharing, so the PNG is downloaded and the link copied ---------- */
  r = profilePng_(v.w, { noFiles: true });
  v.w.__t.ACTIONS['tutor-share'](v.tile);
  await r.till(() => r.clicks.length && /saved/i.test(toastOf_(v.w.document)));
  if (r.shared.length) bad.push('a browser that cannot share files was still sent to navigator.share');
  if (!r.clicks.length || !/\.png$/.test(r.clicks[0].download || '')) bad.push('no PNG was downloaded: ' + JSON.stringify(r.clicks));
  if (!r.copied.some(s => /\?tutor=adatutor$/.test(s))) bad.push('the link was not copied: ' + JSON.stringify(r.copied));
  if (!/Image saved/.test(toastOf_(v.w.document))) bad.push('the toast said "' + toastOf_(v.w.document) + '", not "Image saved"');
  /* ---------- 3. A CHILD'S PHONE (398): the child's card, so no price; a photo that will not come is left out, never a broken picture ---------- */
  const kid = W.user('student@example.org');
  if (!kid) return bad.concat(['Sam could not sign in']);
  const k = await open(signedInAs_(kid));
  if (!k.tile) return bad.concat(['a child opening ?tutor=adatutor saw no Share tile']);
  r = profilePng_(k.w, { photoFails: true });
  k.w.__t.ACTIONS['tutor-share'](k.tile);
  await r.till(() => r.shared.length);
  const s3 = shot(k.w, r);
  if (!s3 || !/Ada Tutor/.test(s3.text)) bad.push('the child\'s picture was not the card: ' + (s3 ? s3.text.slice(0, 120) : 'no snapshot'));
  else {
    if (/£|\/h\b/.test(s3.text)) bad.push('a child\'s phone drew a price on the picture: ' + s3.text.slice(0, 200));
    if (/<img[^>]+src="https?:/i.test(s3.html)) bad.push('a photo from outside is still in the picture, where it cannot load');
  }
  return bad;
});

/* ---------- THE STAFF HUB (405) ----------
   Ada (a tutor) through the real doPost: the terms by version, pricing drawn by `priceFrom`, her own statement; the admin's Staff card. */
const HUB_ACTIONS_ = ['signAgreement', 'payStatement', 'listStaff', 'updateProfile', 'myProfile', 'getProfile', 'savePhoto'];
const hubWorld_ = () => {
  const W = cardWorld_({ vars: { c: 0.5, B: 0.25, card_fee_pct: 2, card_fee_fixed: 0.2 } });
  /* `seed` ADDS ROWS: one more venue, the only one with a rate, so it is the room the bars start at. */
  W.real.seed('venues', [{ name: 'Merton Hall', postcode: 'SW19 1AA', lat: 51.41, lng: -0.19, cost_per_hour: 15, tutors_happy_here: 'P-T1' }]);
  /* THIS MONTH'S TWO DATES AND ONE NEXT MONTH, on a booking a family has paid for — so the default month has rows whenever it runs. */
  const now = new Date(), dmy = (m, d) => { const x = new Date(now.getFullYear(), now.getMonth() + m, d); return x.getDate() + '/' + (x.getMonth() + 1) + '/' + x.getFullYear(); };
  W.real.seed('jobs', [{ job_id: 'J-HUB', subject: 'Maths', level: 'GCSE', hours_per_session: 1, venue: 'Online', price_total: 90, tutor_pay: 60,
    admin_profit: 15, session_dates: [dmy(0, 2), dmy(0, 9), dmy(1, 2)].join(', '), for_children: 'Kit' }]);
  const ev = (id, actor, role, action, target) => ({ event_id: id, at: '01/10/2026', job_id: 'J-HUB', actor, role, action, target: target || '' });
  W.real.seed('events', [ev('HE1', 'Ada Tutor', 'tutor', 'Request'), ev('HE2', 'Pat Parent', 'client', 'Request'),
    ev('HE3', 'Pat Parent', 'client', 'Accept', 'Ada Tutor'), ev('HE4', 'Pat Parent', 'client', 'Confirm')]);
  W.hubReply = b => HUB_ACTIONS_.indexOf(b.action) !== -1 ? W.real.post(b) : { success: true, messages: [] };
  return W;
};
const hubBoot_ = async (W, who) => {
  const a = await cardOpen_(W, who, { reply: W.hubReply });
  if (a.err) return a;
  a.sheet = () => a.d.querySelector('#s-staff .staff-top:not(.is-locked) .hub[data-hub]') || a.d.createElement('div');
  a.part = async k => { const t = a.sheet().querySelector('[data-do="hub-part"][data-part="' + k + '"]'); if (t) a.A('hub-part', t); await wait(250); return !!t; };
  return a;
};

