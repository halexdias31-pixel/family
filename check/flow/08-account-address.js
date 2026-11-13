/* ---------- AN UNLISTED TUTOR IS THE SERVER'S DECISION, AND THE FORM HAD ITS OWN COPY § */
check('an unlisted tutor is offered to an admin, marked, with its value untouched', async () => {
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
  const D = w.__t.DATA();
  const held = (D.tutors || []).slice();
  D.tutors = held.concat([Object.assign({}, held[0] || {},
    { title: 'Switched Off', listed: false })]);
  const B = w.__t.BOOKING;
  B.how = 'Instant class'; B.loc = 'Colliers Wood Library';
  const step = w.__t.STEPS.find(s => s.id === 'tutor');
  const bad = [];
  if (!step) { D.tutors = held; return ['there is no tutor step']; }
  const opts = step.options().filter(Boolean);
  if (opts.indexOf('Switched Off') === -1) {
    bad.push('an admin is not offered the unlisted tutor: ' + JSON.stringify(opts));
  }
  const shown = step.label_ ? step.label_('Switched Off') : 'Switched Off';
  if (shown === 'Switched Off') bad.push('the unlisted tutor is offered with nothing saying so');
  /* SINCE 549 A TUTOR'S LABEL CARRIES THEIR RATE; only "not listed" is the mark. */
  if (step.label_ && /not listed/.test(step.label_('Sasha Matola'))) {
    bad.push('a listed tutor is marked too: ' + step.label_('Sasha Matola'));
  }
  D.tutors = held;
  return bad;
});

check('a waiting list is asked everything an instant class is, bar the four it cannot answer', async () => {
  /* ---------- THE WAITING BRANCH USED TO BE ASKED ALMOST NOTHING, AND THREE OF THOSE WERE WRONG § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  /* THE TWO KINDS READ OFF THE STEP, not typed here — the sister journey below records what two
     invented strings cost when the labels changed underneath them. */
  const kinds = (w.__t.STEPS.find(s => s.id === 'how') || { options: () => [] }).options();
  const waitLabel = kinds.filter(k => /wait/i.test(k))[0];
  const nowLabel = kinds.filter(k => !/wait/i.test(k))[0];
  if (!waitLabel || !nowLabel) return ['the Kind question does not offer both kinds — not a pass'];
  const askedFor = how => {
    B.how = how; B.loc = 'Colliers Wood Library'; B.tutor = '';
    return w.__t.STEPS.filter(s => s.id !== 'how')
      .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
      .map(s => s.id);
  };
  const bad = [];
  const session = askedFor(nowLabel);
  const klass = askedFor(waitLabel);
  ['subjects', 'level', 'loc', 'slots', 'interval', 'n'].forEach(id => {
    if (!session.includes(id)) bad.push('a session is not asked "' + id + '"');
  });
  ['tutor', 'slots'].forEach(id => {
    if (klass.includes(id)) bad.push('a list is asked "' + id + '", which it cannot answer');
  });
  ['subjects', 'n', 'interval', 'loc', 'level'].forEach(id => {
    if (!klass.includes(id)) bad.push('a list is not asked "' + id + '", which it can answer');
  });

  /* ---------- AND THE ONE LOCKED ROW SAYS WHAT IT WILL BE SUBMITTED AS § */
  /* THROUGH THE REAL `change` LISTENER, because `book-set` is not an `on()` action — a select is answered by choosing, which fires `change` and never a click, so § */
  B.how = nowLabel; B.tutor = 'Sasha Matola';
  const sel = w.document.createElement('select');
  sel.setAttribute('data-do', 'book-set');
  sel.setAttribute('data-step', 'how');
  const opt = w.document.createElement('option');
  opt.value = waitLabel; opt.textContent = waitLabel;
  sel.appendChild(opt); sel.value = waitLabel;
  w.document.body.appendChild(sel);
  try { sel.dispatchEvent(new w.Event('change', { bubbles: true })); }
  catch (e) { bad.push('choosing the waiting kind threw: ' + e.message); }
  sel.remove();
  if (!/wait/i.test(String(B.how || ''))) {
    bad.push('choosing ' + JSON.stringify(waitLabel) + ' did not set the kind — not a pass');
  }
  const tutor = w.__t.STEPS.find(s => s.id === 'tutor');
  if (!tutor) bad.push('there is no tutor step');
  else {
    if ((tutor.options() || []).filter(Boolean).length) {
      bad.push('a waiting list offers a tutor to choose, and who teaches one is settled when it fills');
    }
    const fb = tutor.fallback ? String(tutor.fallback() || '') : '';
    if (fb !== 'No preference') {
      bad.push('a waiting list\'s tutor row falls back to ' + JSON.stringify(fb) + ', not "No preference"');
    }
    if (B.tutor) {
      bad.push('switching to a waiting list keeps the tutor ' + JSON.stringify(B.tutor)
               + ', so the locked row prints it instead of the fallback');
    }
  }
  return bad;
});

/* ---------- EVERY DROPDOWN ON THE BOOKING CARD IS THE SAME CONTROL (owner, 29 Oct; docs/history/530) § */
check('every several-answer question on the booking card is the same dropdown as the ones above: a pick adds, a ticked one taken off', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  if (!w.__t.control) return ['stepControl_ is not exported — NOTHING was checked'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'], children: ['Amy Parent', 'Al Parent'] });
  const D = w.__t.DATA();
  D.intervals = (D.intervals || []).concat([{ term: 'Second term', label: 'Second term', kind: 'term', startDate: '01/01/2030', endDate: '01/03/2030', weeks: 8 }]);
  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'Instant class'; B.n = '3';
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  /* THE FORM PREFILLS THE SOONEST TERM (1040 friction); this journey picks from an empty question. */
  B.interval = [];
  try { w.__t.go('booking', false, true); } catch (e) {}
  await wait(60);
  const bad = [];
  const shape = html => {
    const box = d.createElement('div'); box.innerHTML = html;
    const s = box.querySelector('select');
    return s ? [s.tagName, s.multiple, s.className, s.dataset.do, !!box.querySelector('button')].join('|') : 'no select: ' + html.slice(0, 60);
  };
  const level = (w.__t.STEPS || []).find(x => x.id === 'level');
  const want = level ? shape(w.__t.control(level)) : '';
  if (!/^SELECT\|false\|bk-sel\|book-set\|false$/.test(want)) return ['Level\'s control is ' + JSON.stringify(want) + ', so there is nothing to compare with — NOTHING was checked'];
  const ids = ['subjects', 'interval', 'kids'];
  const phone = q => ({ matches: /coarse/.test(String(q)), media: String(q), addEventListener() {}, removeEventListener() {} });
  const wasMM = w.matchMedia;
  ids.forEach(id => {
    const st = (w.__t.STEPS || []).find(x => x.id === id);
    if (!st) { bad.push('no "' + id + '" question'); return; }
    const opts = st.options().filter(Boolean);
    if (opts.length < 2) { bad.push('"' + id + '" offers ' + opts.length + ' answers — the pick was NOT checked'); return; }
    /* THE SAME CONTROL AS LEVEL, on a computer and on a phone. */
    [['a computer', wasMM], ['a phone', phone]].forEach(([on, mm]) => {
      w.matchMedia = mm;
      const got = shape(w.__t.control(st));
      if (got !== want) bad.push('on ' + on + ' the "' + id + '" control is ' + JSON.stringify(got) + ', not Level\'s ' + JSON.stringify(want));
    });
    w.matchMedia = wasMM;
    /* PICKED THROUGH THE REAL SELECT ON THE CARD: two picks are two answers, a third of a ticked one takes it off. */
    const pick = v => {
      const s = d.querySelector('#bookr select[data-step="' + id + '"]');
      if (!s) { bad.push('the "' + id + '" row has no select on the card'); return false; }
      s.value = v;
      s.dispatchEvent(new w.Event('change', { bubbles: true }));
      return true;
    };
    if (!pick(opts[0]) || !pick(opts[1])) return;
    if ((B[id] || []).length !== 2) bad.push('two picks on "' + id + '" left ' + JSON.stringify(B[id]));
    const s = d.querySelector('#bookr select[data-step="' + id + '"]');
    const row = s && s.closest('.bk-row');
    const face = ((row && row.querySelector('.bk-said')) || {}).textContent || '';
    if (opts.slice(0, 2).some(o => face.indexOf(o) === -1)) bad.push('the "' + id + '" row reads ' + JSON.stringify(face) + ', not both answers');
    const ticked = s ? [...s.options].filter(o => /^✓ /.test(o.textContent)).map(o => o.value) : [];
    if (ticked.join('|') !== opts.slice(0, 2).join('|')) bad.push('the "' + id + '" list ticks ' + JSON.stringify(ticked) + ', not the two chosen');
    if (s && s.value !== '') bad.push('the "' + id + '" select is left on an answer, so picking it again would not reach the handler');
    pick(opts[0]);
    if ((B[id] || []).join('|') !== opts[1]) bad.push('picking a ticked "' + id + '" answer again left ' + JSON.stringify(B[id]) + ', wanted it taken off');
  });
  if (d.querySelector('#bookr [data-do="book-many"], #bookr [data-do="book-many-pick"], #bookr select[multiple], #bookr .bk-many-list')) bad.push('the card still draws the old ticked list');
  return bad;
});


/* ---------- AT THE CLIENT'S OWN HOUSE THE SPACE IS THEIRS (owner, 29 Oct; docs/history/530) § */
check('with the client\'s house as the venue the Space row cannot be filled in, and says Yes', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const D = w.__t.DATA();
  D.venues = (D.venues || []).concat([{ title: 'Client House', bestRate: 0 }]);
  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'Instant class'; B.subjects = ['Maths']; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const bad = [];
  const spaceSel = () => d.querySelector('#bookr select[data-step="hosting"]');
  const spaceRow = () => [...d.querySelectorAll('#bookr .bk-row')].find(r => ((r.querySelector('.bk-k') || {}).textContent || '').trim() === 'Space');
  const setLoc = v => {
    const s = d.querySelector('#bookr select[data-step="loc"]');
    if (!s) { bad.push('no Venue select on the card'); return false; }
    if (![...s.options].some(o => o.value === v)) { bad.push('the Venue list does not offer ' + JSON.stringify(v)); return false; }
    s.value = v; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    return true;
  };
  /* A PAID ROOM ASKS IT: the select is there, and No is an answer. */
  if (!spaceSel()) return bad.concat('at a library the Space row has no select, so the rule was NOT checked');
  B.hosting = 'No';
  ['At home', 'Client House'].forEach(home => {
    B.hosting = 'No';
    if (!setLoc(home)) return;
    const row = spaceRow();
    if (spaceSel()) bad.push('with "' + home + '" as the venue the Space row can still be filled in');
    if (!row || !/Yes/.test(row.textContent)) bad.push('with "' + home + '" the Space row reads ' + JSON.stringify(row && row.textContent.replace(/\s+/g, ' ').trim()) + ', wanted Yes');
    if (B.hosting) bad.push('an earlier "No" still stands under "' + home + '": ' + JSON.stringify(B.hosting));
    const sp = w.__t.spec();
    if (!sp || sp.hosting !== true) bad.push('with "' + home + '" the booking is not hosted by the client: ' + JSON.stringify(sp && sp.hosting));
  });
  setLoc('Colliers Wood Library');
  if (!spaceSel()) bad.push('back at the library the Space row is not asked again');
  return bad;
});

/* ---------- ANOTHER CLIENT, ANOTHER FAMILY (owner, 29 Oct; docs/history/530) ----------
   "2 different clients' children are showing up in the children field. It's because I changed the client on the booking." */
check('changing the client on a booking leaves only that client\'s children on it', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Test Admin', personId: 'PA', role: 'admin', roles: ['admin'] });
  const D = w.__t.DATA();
  D.clients = [{ name: 'Ann Client', children: ['Amy Client', 'Abe Client'] }, { name: 'Bob Client', children: ['Ben Client'] }];
  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = 'Instant class'; B.n = '3';
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const bad = [];
  const set = (id, v) => {
    const s = d.querySelector('#bookr select[data-step="' + id + '"]');
    if (!s || ![...s.options].some(o => o.value === v)) { bad.push('the "' + id + '" list does not offer ' + JSON.stringify(v)); return false; }
    s.value = v; s.dispatchEvent(new w.Event('change', { bubbles: true }));
    return true;
  };
  if (!set('client', 'Ann Client') || !set('kids', 'Amy Client')) return bad.concat('Ann\'s child could not be picked — NOTHING was checked');
  if ((B.kids || []).join() !== 'Amy Client') return bad.concat('picking Amy left ' + JSON.stringify(B.kids) + ' — NOTHING was checked');
  set('client', 'Bob Client');
  if ((B.kids || []).some(k => /Amy|Abe/.test(k))) bad.push('after changing the client to Bob the booking still has Ann\'s child: ' + JSON.stringify(B.kids));
  const ks = d.querySelector('#bookr select[data-step="kids"]');
  const row = ks && ks.closest('.bk-row');
  if (row && /Amy|Abe/.test(row.textContent)) bad.push('the Child row still shows Ann\'s children under Bob: ' + JSON.stringify(row.textContent.replace(/\s+/g, ' ').trim()));
  set('kids', 'Ben Client');
  if ((B.kids || []).join() !== 'Ben Client') bad.push('Bob\'s child is not the one on the booking: ' + JSON.stringify(B.kids));
  return bad;
});

/* ---------- AND ON EVERY OTHER WAY IN (owner, 7 Nov: two of four children offered were another client's) ----------
   The admin's own client row, not a stale `USER.children`, and a child set straight into BOOKING never drawn. */
check('the Child list holds only the chosen client\'s children, the admin booking for themselves included', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  w.__t.USER({ name: 'Test Admin', personId: 'PA', role: 'admin', roles: ['admin'], children: ['Ann Kid', 'Bob Kid'] });
  const D = w.__t.DATA();
  D.clients = [{ name: 'Test Admin', children: ['Ann Kid'] }, { name: 'Bob Client', children: ['Bob Kid'] }];
  const B = w.__t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  Object.assign(B, { how: 'Instant class', n: '3', client: 'Test Admin', kids: ['Ann Kid', 'Bob Kid'] });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const bad = [];
  const ks = d.querySelector('#bookr select[data-step="kids"]');
  if (!ks) return ['the booking form draws no Child list — NOTHING was checked'];
  const offered = [...ks.options].map(o => o.value);
  if (offered.indexOf('Bob Kid') !== -1) bad.push('Bob\'s child is offered to Test Admin: ' + JSON.stringify(offered));
  if (offered.indexOf('Ann Kid') === -1) bad.push('Test Admin\'s own child is not offered: ' + JSON.stringify(offered));
  if ((B.kids || []).indexOf('Bob Kid') !== -1) bad.push('Bob\'s child stayed on Test Admin\'s booking: ' + JSON.stringify(B.kids));
  return bad;
});

/* ---------- WHAT THE CARD HELD GOES WITH A SUGGESTION ABOUT IT (owner, 29 Oct; docs/history/530) § */
check('Suggest a change on the Booking widget sends the filled-in fields, people as initials', async () => {
  const reply = b => b.action === 'suggest' ? { success: true, serious: true, notes: [] } : { success: true };
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Hal Admin', personId: 'PA', role: 'admin', roles: ['admin'], token: 'tok-PA', handle: 'ha2026' });
  const D = t.DATA();
  D.clients = [{ name: 'Ann Client', children: ['Amy Client'] }];
  const B = t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  Object.assign(B, { client: 'Ann Client', how: 'Instant class', subjects: ['Maths'], level: 'GCSE', kids: ['Amy Client'], n: '1',
    split: ['someone@example.org'], discValue: '30', note: 'secret words about my child' });
  const host = d.createElement('div');
  host.className = 'pane';
  host.innerHTML = '<div class="card"><h3>Booking</h3><div class="tile-row">' + w.tile_(w.suggestOpts_('widget', 'booking', 'Booking')) + '</div></div>';
  d.body.appendChild(host);
  const tile = host.querySelector('[data-do="rep-box"]');
  if (!tile) return ['the Booking widget has no Suggest a change tile — NOTHING was checked'];
  t.ACTIONS['rep-box'](tile);
  const box = d.querySelector('.rep-box[data-rk="widget"][data-ri="booking"]');
  if (!box) return ['the suggestion box did not open — NOTHING was checked'];
  box.querySelector('textarea').value = 'make the term list bigger';
  t.ACTIONS['rep-send'](box.querySelector('[data-do="rep-send"]'));
  for (let i = 0; i < 50 && !sent.some(b => b.action === 'suggest'); i++) await wait(50);
  const got = sent.find(b => b.action === 'suggest');
  if (!got) return bad.concat('no suggestion was sent');
  const note = String(got.note || '');
  if (note.indexOf('make the term list bigger') !== 0) bad.push('the owner\'s words are not first in the note: ' + JSON.stringify(note.slice(0, 80)));
  ['Fields:', 'For: A.C.', 'Kind: Instant class', 'Subject: Maths', 'Level: GCSE', 'Child: A.C.', 'Split: 1 address', 'Discount: 30%'].forEach(x => {
    if (note.indexOf(x) === -1) bad.push('the note does not say ' + JSON.stringify(x) + ': ' + JSON.stringify(note));
  });
  ['Ann', 'Amy', 'someone@example.org', 'secret words'].forEach(x => { if (note.indexOf(x) !== -1) bad.push('the note carries ' + JSON.stringify(x) + ' — a public repository reads these'); });
  /* AND ONLY THE BOOKING WIDGET'S: a suggestion about anything else is the words alone. */
  host.innerHTML = '<div class="card"><h3>Other</h3><div class="tile-row">' + w.tile_(w.suggestOpts_('widget', 'other', 'Other')) + '</div></div>';
  t.ACTIONS['rep-box'](host.querySelector('[data-do="rep-box"]'));
  const box2 = d.querySelector('.rep-box[data-ri="other"]');
  if (box2) {
    box2.querySelector('textarea').value = 'plain';
    t.ACTIONS['rep-send'](box2.querySelector('[data-do="rep-send"]'));
    for (let i = 0; i < 50 && sent.filter(b => b.action === 'suggest').length < 2; i++) await wait(50);
    const two = sent.filter(b => b.action === 'suggest')[1];
    if (two && two.note !== 'plain') bad.push('a suggestion about another widget carried the booking\'s fields: ' + JSON.stringify(two.note));
  }
  host.remove();
  return bad;
});

/* ---------- A SELECT IS THE PLATFORM'S OWN, AND NOTHING IN THE APP STANDS IN FRONT OF IT § */
check('a select is the platform\'s own: its press is not cancelled, its focus is not taken, nothing opens over it', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document;
  /* A PHONE, because the focus listener that stood here acted only on a coarse pointer. */
  w.matchMedia = q => ({ matches: /coarse/.test(String(q)), media: String(q), addEventListener() {}, removeEventListener() {} });
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  try { w.__t.repaint(true); w.__t.go('booking', false, true); } catch (e) { return ['opening booking threw: ' + e.message]; }
  await wait(120);
  const bad = [];
  const pick = () => d.querySelector('#bookr select.bk-sel:not(:disabled)');
  let sel = pick();
  if (!sel) return ['the booking form draws no enabled select — NOTHING was checked, not a pass'];
  const stepId = sel.dataset.step;
  const bodyKids = () => d.body.children.length;
  const kids0 = bodyKids();
  const floating = () => !!(d.getElementById('drop') || d.getElementById('drop-back')
    || d.querySelector('[role="listbox"]'));
  const press = (el, type) => {
    const ev = new w.MouseEvent(type, { bubbles: true, cancelable: true, button: 0 });
    el.dispatchEvent(ev);
    return ev;
  };

  if (floating()) bad.push('a floating list is in the document before anything was pressed');
  /* ---------- THE ROW'S WORD IS THE SELECT'S LABEL § */
  const rowsWithControl = [...d.querySelectorAll('#bookr .bk-row')]
    .filter(r => r.querySelector('select.bk-sel, button.bk-many, input.bk-in'));
  if (!rowsWithControl.length) bad.push('no booking row carries a control — the row labels were NOT checked');
  rowsWithControl.forEach(r => {
    const ctl = r.querySelector('select.bk-sel, button.bk-many, input.bk-in');
    const k = r.querySelector('.bk-k');
    if (!k || k.tagName !== 'LABEL') bad.push('the "' + (ctl.dataset.step || ctl.dataset.do) + '" row\'s word is a ' + (k ? k.tagName : 'nothing') + ', not a label — a tap on it reaches nothing');
    else if (k.control !== ctl) bad.push('the "' + (ctl.dataset.step || ctl.dataset.do) + '" row\'s label is for ' + JSON.stringify(k.htmlFor) + ', not its own control');
  });
  if (press(sel, 'mousedown').defaultPrevented) bad.push('the mousedown on the "' + stepId + '" select was cancelled — the platform\'s list opens from it');
  if (press(sel, 'click').defaultPrevented) bad.push('the click on the "' + stepId + '" select was cancelled');
  await wait(30);
  if (floating()) bad.push('pressing a select put a list of the app\'s own in the document');
  if (bodyKids() !== kids0) bad.push('pressing a select added ' + (bodyKids() - kids0) + ' element(s) to <body>');

  /* FOCUS STAYS. On a phone the old listener blurred a select the moment it took focus. */
  sel = pick();
  sel.focus();
  await wait(30);
  if (d.activeElement !== pick()) bad.push('a select that took focus on a phone lost it again — something is standing in for its list');
  if (floating()) bad.push('focus on a select opened a list of the app\'s own');
  try { sel.blur(); } catch (e) {}

  /* THE ANSWER, AS THE PLATFORM'S LIST GIVES IT: the value, then `input` and `change`. */
  sel = pick();
  const other = [...sel.options].find(o => o.index !== sel.selectedIndex && !o.disabled && o.value);
  if (!other) bad.push('no second answer to choose — the change was NOT checked');
  else {
    let changes = 0;
    const count = e => { if (e.target && e.target.dataset && e.target.dataset.step === stepId) changes++; };
    d.addEventListener('change', count);
    sel.value = other.value;
    sel.dispatchEvent(new w.Event('input', { bubbles: true }));
    sel.dispatchEvent(new w.Event('change', { bubbles: true }));
    await wait(30);
    d.removeEventListener('change', count);
    if (changes !== 1) bad.push('one pick reached the document as ' + changes + ' change events');
    if (String(w.__t.BOOKING[stepId] || '') !== other.value) {
      bad.push('the booking handler never heard the pick: BOOKING.' + stepId + ' is ' + JSON.stringify(w.__t.BOOKING[stepId]));
    }
    if (!pick() || pick().value !== other.value) bad.push('the redrawn select does not hold ' + JSON.stringify(other.value));
  }

  /* A SWIPE THAT ENDS ON A SELECT OPENS NOTHING — the one press the app does cancel. */
  if (typeof w.__t.pressMoved !== 'function') bad.push('pressMoved is not exported — the swipe guard was NOT checked');
  else {
    sel = pick();
    w.__t.pressMoved(true);
    const md = press(sel, 'mousedown');
    const ck = press(sel, 'click');
    w.__t.pressMoved(false);
    if (!md.defaultPrevented) bad.push('a swipe\'s mousedown on a select was not cancelled — the list opens under a lifting thumb');
    if (!ck.defaultPrevented) bad.push('a swipe\'s click on a select was not cancelled');
  }

  /* ---------- NO TWO LINES OF THE PLATFORM'S LIST SAY THE SAME THING § */
  {
    const S = w.__t.STEPS || [];
    const client = S.find(x => x.id === 'client');
    w.__t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'] });
    const names = client ? (() => { try { return client.options().filter(Boolean); } catch (e) { return []; } })() : [];
    const fb = client && client.fallback ? String(client.fallback() || '') : '';
    if (!client || !w.__t.control) bad.push('the For step or stepControl_ is not there — the repeated blank was NOT checked');
    else if (!fb || !names.some(n => n === fb)) {
      bad.push('the admin\'s own name (' + JSON.stringify(fb) + ') is not on the For list — the repeated blank was NOT checked');
    } else {
      const box = d.createElement('div');
      box.innerHTML = String(w.__t.control(client));
      const s = box.querySelector('select');
      const blank = s && [...s.options].find(o => o.value === '');
      if (!blank) bad.push('the For select has no blank option');
      else if (blank.textContent.trim() === fb) bad.push('the For select\'s blank reads ' + JSON.stringify(fb) + ', which is also a person on the list');
    }
    S.filter(x => !x.multi && !x.grid && !x.emails).forEach(x => {
      const box = d.createElement('div');
      try { box.innerHTML = String(w.__t.control(x)); } catch (e) { return; }
      const s = box.querySelector('select');
      if (!s) return;
      const seen = new Set();
      [...s.options].map(o => o.textContent.trim()).forEach(t => {
        if (seen.has(t)) bad.push('the "' + x.id + '" select says ' + JSON.stringify(t) + ' on two lines of its list');
        seen.add(t);
      });
    });
    w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  }

  /* THE CAPTION OF A `.field` IS A WAY IN TOO, and its activation is the browser's to run. */
  try { w.__t.go('account', false, true); w.paint('account'); } catch (e) { bad.push('drawing settings threw: ' + e.message); return bad; }
  await wait(60);
  const pages = [...d.querySelectorAll('#s-account > .page')];
  const at = pages.findIndex(p => p.querySelector('label.field > select:not(:disabled)'));
  if (at < 0) bad.push('no settings page carries a select in a label — the label route was NOT checked');
  else {
    w.__t.goPage('account', at, true);
    const lab = pages[at].querySelector('label.field > select:not(:disabled)').parentNode;
    if (press(lab, 'click').defaultPrevented) bad.push('a tap on a select\'s label was cancelled, so it cannot focus its select');
    if (floating()) bad.push('a tap on a select\'s label opened a list of the app\'s own');
  }
  return bad;
});

check('a class books through joinWaitlist, a session through createJob', async () => {
  /* ---------- THE TWO KINDS ARE READ OFF THE STEP, NOT TYPED HERE § */
  const bad = [];
  const { w: w0 } = boot();
  await wait(300);
  const kind = (w0.__t.STEPS || []).find(s => s.id === 'how');
  if (!kind) return ['the Kind step is not in BOOK_STEPS — cannot check the send paths'];
  const kinds = kind.options().filter(Boolean);
  if (kinds.length !== 2) return ['the Kind question offers ' + kinds.length + ' answers, not 2'];
  const pairs = kinds.map(k => [k, /wait/i.test(k) ? 'joinWaitlist' : 'createJob']);
  if (new Set(pairs.map(p => p[1])).size !== 2) {
    return ['both Kind answers take the same send path: ' + JSON.stringify(pairs)];
  }
  for (const [how, action] of pairs) {
    const { w, sent } = boot();
    await wait(300);
    w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
    const B = w.__t.BOOKING;
    Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
    B.how = how; B.level = 'GCSE'; B.loc = 'Colliers Wood Library';
    B.subjects = ['Maths']; B.n = '1'; B.hosting = 'No — we book the room';
    B.slots = ['m16']; B.interval = ['Autumn 1']; B.avail = ['Weekday evenings'];
    try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); }
    catch (e) { bad.push(how + ' threw: ' + e.message); continue; }
    await wait(250);
    const got = sent.map(x => x.action);
    if (!got.includes(action)) {
      bad.push(how + ' sent [' + (got.join(', ') || 'nothing') + '], expected ' + action);
    }
  }
  return bad;
});

check('a booking over several days reads in the week\'s own order', async () => {
  /* ---------- THE RUNS CAME BACK ALPHABETICALLY BY THEIR CODE PREFIX § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.spec) return ['bookSpec is not exported — cannot check the day order'];
  const B = w.__t.BOOKING;
  const bad = [];

  [['Monday and Friday', ['m10', 'm11', 'f16', 'f17'], 'Monday, Friday', '10:00'],
   ['Thursday and Saturday', ['th14', 'sa10'], 'Thursday, Saturday', '14:00'],
   ['three days', ['m10', 'm11', 'w15', 'f9', 'f10', 'f11'], 'Monday, Wednesday, Friday', '10:00'],
   ['Sunday and Monday', ['su12', 'm9'], 'Monday, Sunday', '09:00'],
  ].forEach(([name, slots, day, time]) => {
    B.slots = slots;
    const s = w.__t.spec();
    if (s.day !== day) bad.push(name + ': the days read "' + s.day + '", wanted "' + day + '"');
    if (s.time !== time) bad.push(name + ': the session starts "' + s.time + '", wanted "' + time + '"');
  });
  B.slots = [];
  return bad;
});

check('a refusal is a toast and never a banner that outlives it', async () => {
  /* REPORTED AS *"I don't like how name or pin not recognised is a banner. It should be like the other pop ups that come up at the bottom of screen."* Measured § */
  const { w } = boot({ reply: { success: false, error: 'Name or PIN not recognised.' } });
  await wait(300);
  const t = w.__t;
  const bad = [];
  t.USER(null);
  const d = w.document;
  /* ---------- WHAT THE BANNER SAID BEFORE, BECAUSE A STANDING ONE IS CORRECT § */
  const bannerWas = (() => { const b = d.getElementById('banner');
    return b && !b.classList.contains('hidden') ? String(b.textContent || '') : ''; })();
  /* SIGNED IN ON FIND NOW (owner, 13 Nov): the name, then four digit tags. */
  const no = await findSign_(w, 'Nobody', '9999');
  if (no) return [no + ', so nothing can be refused'];
  await wait(400);

  const toastEl = d.getElementById('toast');
  const said = toastEl ? String(toastEl.textContent || '') : '';
  if (!/not recognised/i.test(said)) {
    bad.push('the refusal is not in a toast (the toast says ' + JSON.stringify(said) + ')');
  }
  const ban = d.getElementById('banner');
  const shown = ban && !ban.classList.contains('hidden') ? String(ban.textContent || '') : '';
  if (shown !== bannerWas) {
    bad.push('the refusal changed the banner to ' + JSON.stringify(shown)
             + (bannerWas ? ' (it said ' + JSON.stringify(bannerWas) + ' before)' : ''));
  }

  /* AND NOTHING IS LEFT ON THE CARD. `#in-said` carried a third copy — a faint line under the
     button — and it is gone; a rule that only checked the banner would let it come back. */
  if (d.getElementById('in-said')) bad.push('#in-said is back, so the sentence is on screen twice');
  return bad;
});

check('Find\'s sign-in tags come from the one tag maker, and Make an account posts register', async () => {
  /* ASKED FOR AS *"turn the sign in and forgot pin buttons into tiles."*; since 13 Nov they are Find tags (owner): one maker, all on show, nothing behind ⋯. */
  const { w, sent } = boot({ reply: b => b.action === 'register'
    ? { success: true, name: 'Rae Newcomer', pending: true } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const no = await findSign_(w, null);
  if (no) return [no];
  const row = d.querySelector('#stuff-groups .sign-who');
  const acts = row ? [...row.querySelectorAll('.row.tap.counted')].map(x => x.dataset.do) : [];
  if (acts.join(',') !== 'sign-guest,sign-join,forgot-pin') {
    bad.push('the first menu\'s tags are ' + JSON.stringify(acts) + ', wanted sign-guest, sign-join, forgot-pin');
  }
  const loose = [...d.querySelectorAll('#stuff-groups [data-do="sign-guest"], #stuff-groups [data-do="forgot-pin"], #stuff-groups [data-do="sign-join"]')]
    .filter(x => !x.matches('.row.tap.counted'));
  if (loose.length) bad.push(loose.length + ' sign-in control(s) are not Find tags: ' + loose.map(x => x.dataset.do).join(', '));

  /* ENTER IN THE NAME TAG MOVES ON TO THE DIGITS, and the fourth digit sends verifyLogin. */
  sent.length = 0;
  const no2 = await findSign_(w, 'x@example.org', '0000');
  if (no2) bad.push(no2);
  await wait(300);
  if (!sent.some(b => b.action === 'verifyLogin')) bad.push('the name and four digits posted ' + JSON.stringify(sent.map(b => b.action)) + ', not verifyLogin');
  t.USER(null);

  /* MAKE AN ACCOUNT ON FIND draws the form in place of the menu. */
  t.ACTIONS['sign-restart'](d.createElement('button'));
  t.ACTIONS['sign-join'](d.querySelector('#stuff-groups [data-do="sign-join"]') || d.createElement('button'));
  if (!d.querySelector('#stuff-groups .reg-card .reg-form')) bad.push('Make an account on Find drew no form');
  t.ACTIONS['sign-restart'](d.createElement('button'));
  t.go('account', false, true); try { w.paint('account'); } catch (e) {} await wait(80);
  const reg = d.querySelector('#s-account .reg-card');
  if (!reg) return bad.concat(['there is no Make an account card on the account column']);
  await wait(50);
  if (d.querySelector('#sheet:not(.hidden)')) bad.push('pressing Make an account opened a sheet — the form is in its card (owner, 7 Nov)');
  if (!d.querySelector('#s-account .reg-card .reg-form')) return bad.concat(['the account column has no Make an account card with its form']);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  if (!['reg-first', 'reg-last', 'reg-email', 'reg-pin'].every(id => fill(id, ''))) {
    return bad.concat(['the register form is missing one of its four boxes']);
  }
  const go_ = d.querySelector('#s-account .reg-card [data-do="reg-send"]');
  if (!go_) return bad.concat(['the register form has no button']);
  /* WHO IT IS FOR, FIRST — the journey after this one asks the question itself; here it is answered
     so the rest of the form can be asked about. */
  const asStudent = d.querySelector('#s-account .reg-card #reg-who-in option[data-who="student"]');
  if (!asStudent) return bad.concat(['the register form does not ask who the account is for']);
  t.ACTIONS['reg-who'](asStudent);

  /* A BAD PIN, REFUSED ON THE PHONE. Three digits and a letter are both things the server refuses. */
  fill('reg-first', 'Rae'); fill('reg-last', 'Newcomer'); fill('reg-email', 'rae@example.org');
  for (const p of ['123', '12a4', '123456789']) {
    fill('reg-pin', p);
    sent.length = 0;
    t.ACTIONS['reg-send'](go_);
    await wait(200);
    if (sent.some(b => b.action === 'register')) bad.push('a PIN of "' + p + '" was posted — the backend refuses it, so the phone should');
  }

  fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](go_);
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) bad.push('a filled form posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register');
  else {
    const want = { who: 'student', first_name: 'Rae', last_name: 'Newcomer', email: 'rae@example.org', pin: '0000' };
    Object.keys(want).forEach(k => { if (post[k] !== want[k]) bad.push('register carried ' + k + ' = ' + JSON.stringify(post[k]) + ', wanted ' + JSON.stringify(want[k])); });
  }
  if ((d.getElementById('reg-pin') || {}).value) bad.push('the PIN is still in the form after the account was made');
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/link/i.test(said)) bad.push('after registering the toast says ' + JSON.stringify(said) + ' — nothing about the emailed link');
  return bad;
});

check('arriving on ?verify= confirms the address once and takes it out of the bar', async () => {
  /* `register` MAILS `?verify=<token>` AND, BEFORE THIS, NOTHING ON THE SITE READ IT. § */
  const { w, sent } = boot({ url: 'https://example.org/?verify=Vabc123&post=P9',
    reply: b => b.action === 'verifyEmail' ? { success: true, name: 'Rae Newcomer' } : { success: true } });
  await wait(400);
  const bad = [];
  const posts = sent.filter(b => b.action === 'verifyEmail');
  if (posts.length !== 1) bad.push('booting on ?verify= posted verifyEmail ' + posts.length + ' time(s), wanted once');
  else if (posts[0].token !== 'Vabc123') bad.push('verifyEmail carried token ' + JSON.stringify(posts[0].token) + ', wanted "Vabc123"');
  /* SINGLE-USE ON THE SERVER, so a refresh must not send it again. The rest of the address stays. */
  const q = String(w.location.search);
  if (/verify=/.test(q)) bad.push('the token is still in the address (' + q + '), so a refresh posts it again');
  if (!/post=P9/.test(q)) bad.push('taking the token out also took the rest of the address (' + q + ')');
  const said = String((w.document.getElementById('toast') || {}).textContent || '');
  if (!/confirmed/i.test(said)) bad.push('after verifying the toast says ' + JSON.stringify(said));

  /* AND AN ORDINARY START POSTS NOTHING OF THE KIND. */
  const plain = boot({});
  await wait(300);
  if (plain.sent.some(b => b.action === 'verifyEmail')) bad.push('an ordinary start posted verifyEmail');
  return bad;
});

check('a child\'s forgotten-PIN link, opened from the business inbox, lands signed in as that child', async () => {
  /* The owner, 12 Nov: the mail for JP and Theo goes to the admin; its `?signin=` must sign in as the child. */
  const { w, sent } = boot({ url: 'https://example.org/family/?signin=Rkidkey123',
    reply: b => b.action === 'pinLink' && b.key === 'Rkidkey123'
      ? { success: true, pinLink: true, role: 'kid', roles: ['kid'], name: 'JP', personId: 'P-JP', handle: 'jp_kind1', token: 'tok-JP', message: 'Signed in.' }
      : { success: true } });
  await wait(400);
  const bad = [];
  const posts = sent.filter(b => b.action === 'pinLink');
  if (posts.length !== 1) bad.push('booting on ?signin= posted pinLink ' + posts.length + ' time(s), wanted once');
  const u = w.__t.whoami() || {};
  if (u.personId !== 'P-JP' && u.person_id !== 'P-JP') bad.push('after the link the device is signed in as ' + JSON.stringify(u.personId || u.name || null) + ', not the child');
  if (/signin=/.test(String(w.location.search))) bad.push('the key is still in the address bar');
  return bad;
});

/* EVERY WAY A CHILD GETS IN, ON THE SCREEN. § */
check('a child with no email makes their own account with a grown-up\'s address, and is handed their handle', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'register'
    ? (b.parent_email ? { success: true, name: 'Ben Mum', pending: true, handle: 'ben_kind42', confirmBy: 'grown-up' }
                      : { success: true, name: 'Rae Newcomer', pending: true, handle: 'rae_kind43', confirmBy: 'self' })
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const open = () => { const reg = d.querySelector('#s-account .reg-card'); return !!reg; };
  if (!open()) return ['there is no Make an account tile to press'];
  await wait(50);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  /* A STUDENT — the grown-up's-email tick is theirs alone (see the next journey for the parent). */
  const student = () => { const b = d.querySelector('#s-account .reg-card #reg-who-in option[data-who="student"]'); if (b) t.ACTIONS['reg-who'](b); return !!b; };
  if (!student()) return ['the register form does not ask who the account is for'];
  const tick = d.getElementById('reg-noemail');
  if (!tick) return ['the register form has no "I have no email" tick, so a child with no address has no way in'];
  if (tick.closest('label.check') === null) bad.push('the no-email tick is not the app\'s own .check control');
  fill('reg-first', 'Ben'); fill('reg-last', 'Mum'); fill('reg-email', 'mum@example.org'); fill('reg-pin', '0000');
  tick.checked = true;
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#s-account .reg-card [data-do="reg-send"]'));
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) return bad.concat(['the ticked form posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register']);
  if (post.parent_email !== 'mum@example.org') bad.push('the grown-up\'s address went as ' + JSON.stringify(post.parent_email) + ', not parent_email');
  if (post.email) bad.push('the grown-up\'s address was ALSO sent as the child\'s own email — it would be their sign-in address');
  const box = d.getElementById('in-name');
  if (!box || box.value !== '@ben_kind42') bad.push('after registering with no email the sign-in box holds ' + JSON.stringify(box && box.value) + ' — not the handle the child signs in with');
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (!/@ben_kind42/.test(said) || !/grown-up/i.test(said)) bad.push('the toast after a no-email sign-up says ' + JSON.stringify(said) + ' — not the handle and not who opens the link');
  /* AND UNTICKED IT IS THE ADDRESS IT ALWAYS WAS. */
  await wait(50);
  if (!open()) return bad.concat(['the Make an account tile went after one use']);
  await wait(50);
  student();
  fill('reg-first', 'Rae'); fill('reg-last', 'Newcomer'); fill('reg-email', 'rae@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#s-account .reg-card [data-do="reg-send"]'));
  await wait(300);
  const post2 = sent.find(b => b.action === 'register');
  if (!post2 || post2.email !== 'rae@example.org' || post2.parent_email) bad.push('unticked, register posted ' + JSON.stringify(post2));
  if (box && box.value !== 'rae@example.org') bad.push('unticked, the sign-in box holds ' + JSON.stringify(box.value) + ', not the address');
  return bad;
});

check('a grown-up opening a no-email child\'s link is told the child\'s handle', async () => {
  const { w } = boot({ url: 'https://example.org/?verify=Vkid42',
    reply: b => b.action === 'verifyEmail'
      ? { success: true, name: 'Ben Mum', handle: 'ben_kind42', noEmail: true, linkedTo: 'Mia Mum' } : { success: true } });
  await wait(400);
  const said = String((w.document.getElementById('toast') || {}).textContent || '');
  const bad = [];
  if (!/@ben_kind42/.test(said)) bad.push('the grown-up was told ' + JSON.stringify(said) + ' — not the handle the child signs in with');
  if (/sign in with it/i.test(said)) bad.push('the grown-up was told to sign in with their own address, which signs nobody in for the child');
  return bad;
});

/* AND WHEN THE PARENT ACCOUNT ON THAT ADDRESS IS STILL PENDING, the child is confirmed and NOT put on it § */
check('a grown-up whose account is unconfirmed is told how to add the child, in a sheet that stays', async () => {
  const { w } = boot({ url: 'https://example.org/?verify=Vkid43',
    reply: b => b.action === 'verifyEmail'
      ? { success: true, name: 'Ben Mum', handle: 'ben_kind43', noEmail: true, linkedTo: '', parentPending: true } : { success: true } });
  await wait(400);
  const d = w.document, bad = [];
  const sheet = () => d.getElementById('sheet-body');
  const said = () => String((sheet() || {}).textContent || '').replace(/\s+/g, ' ');
  const open = () => { const s = d.getElementById('sheet'); return !!(s && sheet() && said().trim() && !s.hidden && !/\bhidden\b/.test(s.className)); };
  if (!open()) return ['the grown-up was told nothing that stays — no sheet after the link: ' + JSON.stringify(String((d.getElementById('toast') || {}).textContent || ''))];
  if (!/@ben_kind43/.test(said())) bad.push('the sheet does not say the handle the child signs in with: ' + JSON.stringify(said()));
  if (!/not on your account/i.test(said())) bad.push('the sheet does not say the child is NOT on their account yet: ' + JSON.stringify(said()));
  if (/is on your account/i.test(said().replace(/not on your account/ig, ''))) bad.push('the sheet says the child is on their account, which the backend refused to do');
  if (!/Confirm your @family\. account|Send the link again/.test(said()) || !/Add your child/.test(said()))
    bad.push('the sheet does not give the next step — open your own link, then "Add your child": ' + JSON.stringify(said()));
  if (!/Forgotten your PIN\?/.test(said())) bad.push('the sheet does not tell a grown-up who never made an account how to take theirs back');
  /* STILL THERE AFTER A TOAST WOULD HAVE GONE — the whole point of the sheet. */
  await wait(3000);
  if (!open()) bad.push('the sheet went by itself, like the toast it replaced');
  const done = d.querySelector('#sheet-body [data-do="sheet-done"]');
  if (!done) bad.push('the sheet has no Done to close it');
  else {
    w.__t.ACTIONS['sheet-done'](done);
    await wait(400);
    if (open()) bad.push('Done did not close the sheet');
  }
  return bad;
});

/* AN ADDRESS NOBODY HAS PROVED, ON THE PHONE. § */
check('a parent whose address is unconfirmed is told their mail is held, and can have the link sent again', async () => {
  const jo = { name: 'Jo Smith', personId: 'P-JO', role: 'parent', roles: ['parent'], token: 'tk-jo', handle: 'jo_kind94',
               pendingEmail: 'jsmith1@example.org', profile: { first_name: 'Jo', last_name: 'Smith' } };
  /* `say` IS WHAT THE SHEET HOLDS, read at each request, so the address can be proved under the phone. */
  let say = 'jsmith1@example.org';
  const reply = b => b.action === 'myProfile'
      ? { success: true, personId: 'P-JO', profile: jo.profile, role: 'parent', roles: ['parent'], tutorPending: false, pendingEmail: say }
    : b.action === 'resendLink'
      ? { success: true, pendingEmail: say, message: 'A new link is on its way to jsmith1@example.org.' }
    : { success: true, messages: [] };
  const { w, sent } = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(jo)); } catch (e) {} } });
  await wait(700);
  const t = w.__t, d = w.document, bad = [];
  const text = el => String((el || {}).textContent || '').replace(/\s+/g, ' ');

  /* THE YOU COLUMN: the line under your own card, and the tile beside Sign out. */
  t.go('account', false, true);
  await wait(250);
  const line = d.querySelector('#s-account .mail-held');
  if (!line || !/jsmith1@example\.org/.test(text(line)) || !/email you/i.test(text(line)))
    bad.push('a signed-in PENDING person is not told on their own card that their mail waits for the link: ' + JSON.stringify(text(line)));
  const youTile = d.querySelector('#s-account [data-do="resend-link"]');
  if (!youTile) bad.push('there is no "Send the link again" on their own card');
  else {
    sent.length = 0;
    t.ACTIONS['resend-link'](youTile);
    await wait(250);
    const post = sent.find(b => b.action === 'resendLink');
    if (!post) bad.push('"Send the link again" posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no resendLink');
    else if (post.to || post.email) bad.push('"Send the link again" put an address on the request — where it goes is the server\'s to say: ' + JSON.stringify(post));
    if (!/on its way/.test(text(d.getElementById('toast')))) bad.push('pressing it said ' + JSON.stringify(text(d.getElementById('toast'))) + ', not the server\'s answer');
  }

  /* SETTINGS: "Manage your child", one card, saying in place of its two forms which address to open the link
     from, with the same tile (docs/history/339 — it was a card of its own drawn instead of two). */
  t.go('students', false, true);
  await wait(250);
  const held = d.querySelector('#s-students .kid-manage .kid-held');
  if (d.querySelectorAll('#s-students .kid-manage').length !== 1) bad.push('a PENDING parent\'s Settings draws ' + d.querySelectorAll('#s-students .kid-manage').length + ' "Manage your child" cards, wanted one');
  if (!held) bad.push('a PENDING parent\'s "Manage your child" does not say to open the link first where "Make your child\'s account" would be');
  else {
    if (!/jsmith1@example\.org/.test(text(held)) || !/link/i.test(text(held))) bad.push('the held card does not say which address to open the link from: ' + JSON.stringify(text(held)));
    if (!held.querySelector('[data-do="resend-link"]')) bad.push('the held card has no "Send the link again"');
  }
  if (d.querySelector('#s-students [data-kid-new], #s-students [data-kid]'))
    bad.push('a PENDING parent is still offered a child form the server will refuse');

  /* AND WHEN THE ADDRESS IS PROVED — on another phone, by the link — the next open puts the forms back
     and takes the line away. */
  say = '';
  const again = boot({ reply, before: w => { try { w.localStorage.setItem('familyUser', JSON.stringify(jo)); } catch (e) {} } });
  await wait(700);
  const t2 = again.w.__t, d2 = again.w.document;
  if ((t2.whoami() || {}).pendingEmail) bad.push('myProfile said the address is proved and the phone kept it waiting: ' + JSON.stringify(t2.whoami().pendingEmail));
  t2.go('students', false, true);
  await wait(250);
  if (d2.querySelector('#s-students .kid-held') || !d2.querySelector('#s-students .kid-manage .kid-add'))
    bad.push('once the address was proved, Settings still holds the child back, or "Manage your child" has no "Add your child" section');
  t2.go('account', false, true);
  await wait(250);
  if (d2.querySelector('#s-account .mail-held, #s-account [data-do="resend-link"]')) bad.push('once the address was proved, the You column still says the mail is held');
  return bad;
});

/* GOOGLE TAKING A PENDING ROW BACK CLEARS ITS PIN, and the person is told in a sheet — as often the real
   registrant, who would otherwise find their PIN refused tomorrow with no idea why. */
check('signing in with Google on an unconfirmed account says the PIN has gone, in a sheet', async () => {
  const msg = 'Signed in with Google, and that has confirmed your email. The account was made with a PIN before '
            + 'anybody had confirmed the address, so that PIN no longer works.';
  const { w } = boot({ reply: b => b.action === 'googleLogin'
    ? { success: true, name: 'Val Owner', personId: 'P-VAL', role: 'parent', roles: ['parent'], token: 'tk-val',
        pendingEmail: '', pinCleared: true, message: msg, profile: { first_name: 'Val' } }
    : { success: true, messages: [] } });
  await wait(300);
  const d = w.document, bad = [];
  if (typeof w.googleSignedIn_ !== 'function') return ['googleSignedIn_ is not reachable, so the Google reply was NOT checked'];
  w.googleSignedIn_({ credential: 'a-google-token' });
  await wait(400);
  const said = String((d.getElementById('sheet-body') || {}).textContent || '').replace(/\s+/g, ' ');
  if (!/PIN no longer works/.test(said)) bad.push('the Google reply said the PIN was cleared and no sheet says so: ' + JSON.stringify(said));
  /* AND AN ORDINARY GOOGLE SIGN-IN OPENS NOTHING. */
  const b2 = boot({ reply: b => b.action === 'googleLogin'
    ? { success: true, name: 'Cy Done', personId: 'P-CY', role: 'parent', roles: ['parent'], token: 'tk-cy', pendingEmail: '', profile: {} }
    : { success: true, messages: [] } });
  await wait(300);
  b2.w.googleSignedIn_({ credential: 'a-google-token' });
  await wait(400);
  const s2 = b2.w.document.getElementById('sheet');
  if (s2 && String((b2.w.document.getElementById('sheet-body') || {}).textContent || '').trim() && !s2.hidden && !/\bhidden\b/.test(s2.className))
    bad.push('an ordinary Google sign-in opened a sheet');
  return bad;
});

/* ROUND THREE OF THE PR #130 REVIEW, ON THE PHONE. § */
const JO_PENDING = { name: 'Jo Smith', personId: 'P-JO', role: 'parent', roles: ['parent'], token: 'tk-jo', handle: 'jo_kind94',
                     pendingEmail: 'jsmith1@example.org', profile: { first_name: 'Jo', last_name: 'Smith' } };
const toastOf_ = d => String((d.getElementById('toast') || {}).textContent || '');
const sheetOpen_ = d => { const s = d.getElementById('sheet'), b = d.getElementById('sheet-body');
  return !!(s && b && String(b.textContent || '').trim() && !s.hidden && !/\bhidden\b/.test(s.className)); };

check('proof: your own link opened while signed in takes the held card away, and a myProfile that answers after it cannot bring it back', async () => {
  /* THE ORDER THE REVIEW MEASURED: § */
  let asked = 0, confirmed = false;
  const reply = b => {
    if (b.action === 'verifyEmail') return new Promise(r => setTimeout(() => { confirmed = true;
      r({ success: true, name: 'Jo Smith', handle: 'jo_kind94', noEmail: false, linkedTo: '', parentPending: false }); }, 300));
    if (b.action === 'myProfile') {
      asked++;
      const said = { success: true, personId: 'P-JO', profile: JO_PENDING.profile, role: 'parent', roles: ['parent'], tutorPending: false,
                     pendingEmail: confirmed ? '' : 'jsmith1@example.org' };
      return asked === 1 ? new Promise(r => setTimeout(() => r(said), 800)) : said;
    }
    return { success: true, messages: [] };
  };
  const { w, sent } = boot({ url: 'https://example.org/?verify=Vjo-own', reply, before: signedInAs_(JO_PENDING) });
  await wait(1600);
  const t = w.__t, d = w.document, bad = [];
  if (!sent.some(b => b.action === 'verifyEmail')) return ['the link was not posted, so this journey asked nothing'];
  if (asked < 1) bad.push('no myProfile left at start-up, so the order the review found was NOT played');
  if ((t.whoami() || {}).pendingEmail) bad.push('after your own link was opened the phone still holds the address as waiting: '
    + JSON.stringify(t.whoami().pendingEmail) + (asked >= 2 ? '' : ' — the late myProfile painted over the confirmation'));
  if (!/add your child/i.test(toastOf_(d)) && !/confirmed/i.test(toastOf_(d))) bad.push('the toast after your own link says ' + JSON.stringify(toastOf_(d)));
  t.go('students', false, true);
  await wait(250);
  if (d.querySelector('#s-students .kid-held') || !d.querySelector('#s-students .kid-manage .kid-add'))
    bad.push('Settings still holds the child back after your own link was opened — under a toast saying you can add your child');
  t.go('account', false, true);
  await wait(250);
  if (d.querySelector('#s-account .mail-held')) bad.push('the You column still says your mail is held after your own link was opened');
  return bad;
});

check('proof: "Send the link again" on an address already confirmed takes the held cards away', async () => {
  const reply = b => b.action === 'resendLink'
      ? { success: true, why: 'confirmed', pendingEmail: '', message: 'Your email is confirmed already — there is nothing to open.' }
    /* AN OLD SERVER FOR `myProfile`, so the only thing that can clear the cards is the answer under test. */
    : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
    : { success: true, messages: [] };
  const { w } = boot({ reply, before: signedInAs_(JO_PENDING) });
  await wait(700);
  const t = w.__t, d = w.document, bad = [];
  t.go('account', false, true);
  await wait(250);
  const tile = d.querySelector('#s-account [data-do="resend-link"]');
  if (!tile) return ['there was no "Send the link again" to press, so the confirmed answer was NOT checked'];
  t.ACTIONS['resend-link'](tile);
  await wait(300);
  if (!/confirmed already/.test(toastOf_(d))) bad.push('the server\'s sentence was not said: ' + JSON.stringify(toastOf_(d)));
  if ((t.whoami() || {}).pendingEmail) bad.push('the server said the address is confirmed and the phone kept it waiting');
  if (d.querySelector('#s-account .mail-held, #s-account [data-do="resend-link"]')) bad.push('the You column still says the mail is held');
  t.go('students', false, true);
  await wait(250);
  if (d.querySelector('#s-students .kid-held')) bad.push('Settings still holds the child back');
  return bad;
});

check('proof: a new address typed on the Contact card waits, says so, and the box keeps it', async () => {
  const jo = { name: 'Jo Smith', personId: 'P-JO', role: 'parent', roles: ['parent'], token: 'tk-jo', handle: 'jo_kind111', pendingEmail: '',
               profile: { first_name: 'Jo', last_name: 'Smith', email: 'jsmith@example.org', phone: '', phone_cc: '+44', phone_no: '', email_moving: '' } };
  const moved = Object.assign({}, jo.profile, { email_moving: 'jsmith1@example.org' });
  const reply = b => b.action === 'updateProfile'
      /* AS `updateProfile` SENDS IT FOR A MOVE: the row's address unchanged, the waiting one beside it. */
      ? { success: true, changed: 0, profile: moved, movingEmail: 'jsmith1@example.org',
          said: 'Saved. To finish changing your email, open the link we sent to jsmith1@example.org on a phone where you are '
              + 'signed in. Until then it stays jsmith@example.org — sign in with that, or your handle.' }
    : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
    : { success: true, messages: [] };
  const { w, sent } = boot({ reply, before: signedInAs_(jo) });
  await wait(700);
  const t = w.__t, d = w.document, bad = [];
  /* A PARENT'S CONTACT CARD IS ON STUDENT SETTINGS, as everybody's is (469). */
  t.go('account', false, true);
  await wait(300);
  const box = () => d.querySelector('#s-account [data-me="email"]');
  if (!box()) return ['there is no email box on Student settings, so the Contact card was NOT checked'];
  const card = () => box() && box().closest('.me-form');
  sent.length = 0;
  /* SAVED AS TYPED (owner, 8 Nov): no Save to press — the card sends itself ~800ms after the last change. */
  box().value = 'jsmith1@example.org';
  box().dispatchEvent(new w.Event('input', { bubbles: true }));
  await wait(1400);
  const post = sent.find(b => b.action === 'updateProfile');
  if (!post || (post.fields || {}).email !== 'jsmith1@example.org') bad.push('the Save did not post the typed address: ' + JSON.stringify(post && post.fields));
  if (!/open the link we sent to jsmith1@example\.org/.test(toastOf_(d))) bad.push('the toast says ' + JSON.stringify(toastOf_(d)) + ' — "Saved" over an address that has not changed');
  const note = card() && card().querySelector('.mail-moving');
  const said = String((note || {}).textContent || '').replace(/\s+/g, ' ');
  if (!note || !/jsmith1@example\.org/.test(said) || !/jsmith@example\.org/.test(said))
    bad.push('the Contact card does not say the new address waits, and which one still signs in: ' + JSON.stringify(said));
  if (!box() || box().value !== 'jsmith1@example.org') bad.push('the box went back to the old address, so the next Save of this page would cancel the change: ' + JSON.stringify(box() && box().value));
  if (!card() || !card().querySelector('[data-do="resend-link"]')) bad.push('the Contact card has no "Send the link again" for the waiting address');
  return bad;
});

check('proof: a link that moves your address, opened before signing in, finishes by itself once you are in', async () => {
  const reply = b => b.action === 'verifyEmail'
      ? (b.session === 'tk-jo'
        ? { success: true, moved: true, email: 'jsmith1@example.org', name: 'Jo Smith', handle: 'jo_kind111', noEmail: false }
        : { error: 'This link changes the email address on an @family. account, so it only works where you are signed in to '
                 + 'that account. Sign in, and it will finish by itself.', why: 'sign-in-first' })
    : b.action === 'verifyLogin'
      ? { success: true, name: 'Jo Smith', personId: 'P-JO', handle: 'jo_kind111', token: 'tk-jo', role: 'parent', roles: ['parent'],
          tutorPending: false, pendingEmail: '', profile: { first_name: 'Jo', email: 'jsmith@example.org', email_moving: 'jsmith1@example.org' } }
    : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
    : { success: true, messages: [] };
  const { w, sent } = boot({ url: 'https://example.org/?verify=Mmove1', reply });
  await wait(500);
  const t = w.__t, d = w.document, bad = [];
  const first = sent.filter(b => b.action === 'verifyEmail');
  if (first.length !== 1 || first[0].token !== 'Mmove1') return ['booting on the move link posted ' + JSON.stringify(first)];
  if (/verify=/.test(String(w.location.search))) bad.push('the link is still in the address bar');
  if (!/signed in/.test(toastOf_(d))) bad.push('opened signed out, the person was not told to sign in: ' + JSON.stringify(toastOf_(d)));
  t.go('account', false, true);
  await wait(200);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  { const no = await findSign_(w, 'jsmith@example.org', ['3', '8', '1', '5'].join('')); if (no) return bad.concat([no]); }
  await wait(600);
  const again = sent.filter(b => b.action === 'verifyEmail');
  if (again.length !== 2 || again[1].token !== 'Mmove1' || again[1].session !== 'tk-jo')
    bad.push('after signing in the link was not sent again with the session: ' + JSON.stringify(again));
  if (((t.whoami() || {}).profile || {}).email !== 'jsmith1@example.org' || ((t.whoami() || {}).profile || {}).email_moving)
    bad.push('the moved address is not the phone\'s address now: ' + JSON.stringify((t.whoami() || {}).profile));
  if (!/jsmith1@example\.org/.test(toastOf_(d))) bad.push('the move was not said: ' + JSON.stringify(toastOf_(d)));
  return bad;
});

check('proof: the sign-in link in a forgotten-PIN email signs its owner in once, and says what it did in a sheet', async () => {
  const msg = 'Signed in. The PIN in that email is your PIN now, and anyone else signed in to this account has been signed out. '
            + 'Your email is confirmed now. The account was in use before anybody had confirmed it, so the child on it has been taken off';
  const { w, sent } = boot({ url: 'https://example.org/?signin=Rkey123&post=P9',
    reply: b => b.action === 'pinLink'
      ? { success: true, name: 'Vic Owner', personId: 'P-VIC', handle: 'vic_kind1', token: 'tk-vic', role: 'parent', roles: ['parent'],
          tutorPending: false, pendingEmail: '', pinLink: true, childrenHeld: 1, message: msg, profile: { first_name: 'Vic' } }
      : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
      : { success: true, messages: [] } });
  await wait(600);
  const t = w.__t, d = w.document, bad = [];
  const posts = sent.filter(b => b.action === 'pinLink');
  if (posts.length !== 1 || posts[0].key !== 'Rkey123') bad.push('booting on ?signin= posted pinLink ' + JSON.stringify(posts));
  const q = String(w.location.search);
  if (/signin=/.test(q)) bad.push('the key is still in the address (' + q + '), so a refresh posts it again');
  if (!/post=P9/.test(q)) bad.push('taking the key out also took the rest of the address');
  if ((t.whoami() || {}).token !== 'tk-vic') bad.push('the link did not sign the phone in');
  if (!sheetOpen_(d) || !/taken off/.test(String(d.getElementById('sheet-body').textContent))) bad.push('what the link did — the children held — is not in a sheet that stays');
  const plain = boot({});
  await wait(300);
  if (plain.sent.some(b => b.action === 'pinLink')) bad.push('an ordinary start posted pinLink');
  return bad;
});

/* THE WAY BACK FROM STRIPE (430): `createCheckout` sends a card payment to `?paid=1&ref=…`, and before this nothing on the site read it, so a card payment never booked. */
const PAY_REPLY_ = (calls, jobId) => b => {
  if (b.action !== 'finalizePayment') return { success: true, messages: [] };
  calls.push(b);
  return calls.length === 1 ? { success: true, jobId } : { success: true, alreadyDone: true, jobId };
};
check('a fake Stripe return finalizes the payment once, says you are booked and opens that receipt', async () => {
  const calls = [];
  const { w } = boot({ url: 'https://example.org/?paid=1&ref=PAY-111-7&post=P9', reply: PAY_REPLY_(calls, 'J-PAID'), member: true });
  await wait(900);
  const t = w.__t, d = w.document, bad = [];
  if (calls.length !== 1) return ['booting on ?paid=1&ref= posted finalizePayment ' + calls.length + ' time(s), wanted once'];
  if (calls[0].ref !== 'PAY-111-7') bad.push('finalizePayment carried ref ' + JSON.stringify(calls[0].ref));
  if (calls[0].token !== MEMBER_.token) bad.push('finalizePayment went without the signed-in token, so the gate refuses it');
  const q = String(w.location.search);
  if (/paid=|ref=/.test(q)) bad.push('the payment is still in the address (' + q + '), so a refresh asks again');
  if (!/post=P9/.test(q)) bad.push('taking the payment out also took the rest of the address (' + q + ')');
  if (!/Payment received — you're booked/.test(toastOf_(d))) bad.push('the toast says ' + JSON.stringify(toastOf_(d)) + ', not "Payment received — you\'re booked"');
  if (t.openJob() !== 'J-PAID' || t.screenAt() !== 'booking') bad.push('the receipt opened is ' + JSON.stringify(t.openJob()) + ' on ' + t.screenAt() + ', not J-PAID on booking');
  /* A SIGN-IN AFTER IT DOES NOT ASK AGAIN: the kept ref went with the answer. */
  w.eval('afterSignIn_({})');
  await wait(300);
  if (calls.length !== 1) bad.push('a sign-in after the payment finished asked finalizePayment again (' + calls.length + ' times)');
  /* A CANCELLED CHECKOUT POSTS NOTHING AND SAYS SO; AN ORDINARY START POSTS NOTHING. */
  const gone = []; const c = boot({ url: 'https://example.org/?paid=0', reply: PAY_REPLY_(gone, 'J-PAID'), member: true });
  await wait(400);
  if (gone.length) bad.push('a cancelled checkout posted finalizePayment');
  if (!/cancelled/i.test(toastOf_(c.w.document))) bad.push('a cancelled checkout says ' + JSON.stringify(toastOf_(c.w.document)));
  if (/paid=/.test(String(c.w.location.search))) bad.push('?paid=0 was left in the address');
  const none = []; boot({ reply: PAY_REPLY_(none, 'J-PAID'), member: true });
  await wait(300);
  if (none.length) bad.push('an ordinary start posted finalizePayment');
  return bad;
});

check('a Stripe return before signing in waits for the sign-in, and a refused one says why and books nothing', async () => {
  const calls = [];
  const reply = b => b.action === 'verifyLogin'
    ? { success: true, name: 'Mo Member', personId: 'P-MEMBER', handle: 'momember', token: 't-member', role: 'parent', roles: ['parent'], rank: 'client', pendingEmail: '', profile: {} }
    : PAY_REPLY_(calls, 'J-PAID')(b);
  const { w } = boot({ url: 'https://example.org/?paid=1&ref=PAY-222-8', reply });
  await wait(500);
  const t = w.__t, d = w.document, bad = [];
  if (calls.length) bad.push('signed out, the return posted finalizePayment with no token — the gate refuses it and the ref is lost');
  if (!/sign in/i.test(toastOf_(d))) bad.push('signed out, the return says ' + JSON.stringify(toastOf_(d)) + ', nothing about signing in');
  if (/paid=|ref=/.test(String(w.location.search))) bad.push('signed out, the payment was left in the address');
  t.go('account', false, true);
  await wait(150);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  { const no = await findSign_(w, 'mo@example.org', ['2', '9', '1', '7'].join('')); if (no) return bad.concat([no]); }
  await wait(900);
  if (calls.length !== 1 || calls[0].ref !== 'PAY-222-8') bad.push('after signing in finalizePayment was posted ' + JSON.stringify(calls.map(c => c.ref)) + ', wanted PAY-222-8 once');
  else if (calls[0].token !== 't-member') bad.push('after signing in finalizePayment went without the new token');
  if (t.openJob() !== 'J-PAID') bad.push('after signing in the paid receipt did not open (' + JSON.stringify(t.openJob()) + ')');
  /* REFUSED: the server's words, "nothing was booked", and no receipt. */
  const r = boot({ url: 'https://example.org/?paid=1&ref=PAY-333-9', member: true,
    reply: b => b.action === 'finalizePayment' ? { error: 'Stripe says that session has not been paid.' } : { success: true, messages: [] } });
  await wait(700);
  const said = toastOf_(r.w.document);
  if (!/not been paid/.test(said) || !/nothing was booked/i.test(said)) bad.push('a refused payment says ' + JSON.stringify(said));
  if (r.w.__t.openJob()) bad.push('a refused payment opened a receipt (' + r.w.__t.openJob() + ')');
  /* A CHILD'S PHONE NEVER ASKS (398). */
  const kidCalls = [];
  boot({ url: 'https://example.org/?paid=1&ref=PAY-444-1', reply: PAY_REPLY_(kidCalls, 'J-PAID'),
    before: signedInAs_({ name: 'Kit Young', personId: 'P-K', role: 'student', roles: ['student'], rank: 'student', token: 'tk-kit', handle: 'kit_y' }) });
  await wait(500);
  if (kidCalls.length) bad.push('a child\'s phone posted finalizePayment');
  return bad;
});

check('proof: a PIN sign-in that took an account back says the children were taken off, in a sheet', async () => {
  const msg = 'Your email is confirmed now. The account was in use before anybody had confirmed it, so the 2 children on it have been taken off';
  const { w } = boot({ reply: b => b.action === 'verifyLogin'
      ? { success: true, name: 'Jo Smith', personId: 'P-JO', handle: 'jo_kind121', token: 'tk-jo', role: 'parent', roles: ['parent'],
          tutorPending: false, pendingEmail: '', childrenHeld: 2, message: msg, profile: { first_name: 'Jo' } }
      : b.action === 'myProfile' ? { error: 'That action is not recognised.' }
      : { success: true, messages: [] } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(150);
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; return !!el; };
  { const no = await findSign_(w, 'jsmith1@example.org', ['2', '9', '1', '7'].join('')); if (no) return [no]; }
  await wait(500);
  if (!sheetOpen_(d) || !/taken off/.test(String(d.getElementById('sheet-body').textContent))) bad.push('the children taken off the account were said nowhere that stays: ' + JSON.stringify(toastOf_(d)));
  /* AND AN ORDINARY SIGN-IN OPENS NOTHING. */
  const b2 = boot({ reply: b => b.action === 'verifyLogin'
      ? { success: true, name: 'Cy Done', personId: 'P-CY', handle: 'cy_kind1', token: 'tk-cy', role: 'parent', roles: ['parent'], pendingEmail: '', profile: {} }
      : { success: true, messages: [] } });
  await wait(300);
  b2.w.__t.USER(null); b2.w.__t.go('account', false, true);
  await wait(150);
  const d2 = b2.w.document;
  { const no = await findSign_(b2.w, 'cy@example.org', ['2', '9', '1', '7'].join('')); if (no) return bad.concat([no]); }
  await wait(500);
  if (sheetOpen_(d2)) bad.push('an ordinary sign-in opened a sheet');
  return bad;
});

/* WHO THE ACCOUNT IS FOR. § */
check('Make an account asks who it is for first, and a parent is a parent from the first sign-in', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'register'
      ? { success: true, name: 'Dana Brook', pending: true, handle: 'dana_kind44', confirmBy: 'self',
          role: b.who === 'parent' ? 'parent' : 'kid' }
    : b.action === 'verifyLogin'
      /* `pendingEmail` AS `loginReplyFor_` REALLY SENDS IT — a fixture must send what the backend sends,
         and the first sign-in after registering is before anybody has opened the link. */
      ? { success: true, name: 'Dana Brook', personId: 'P-DANA', handle: 'dana_kind44', token: 'tk-dana',
          role: 'parent', roles: ['parent'], tutorPending: false, pendingEmail: 'dana@example.org',
          profile: { first_name: 'Dana', last_name: 'Brook' } }
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  t.go('account', false, true);
  await wait(120);
  const reg = d.querySelector('#s-account .reg-card');
  if (!reg) return ['there is no Make an account tile to press'];
  await wait(50);
  const choice = who => d.querySelector('#s-account .reg-card #reg-who-in option[data-who="' + who + '"]');
  const rest = () => d.getElementById('reg-rest');
  const tickRow = () => { const x = d.getElementById('reg-noemail'); return x && x.closest('.reg-kid'); };
  if (!choice('parent') || !choice('student')) return ['the register form does not ask "a parent or a student?"'];
  /* THE QUESTION FIRST: the boxes and the button are not shown, and nothing is chosen for you. */
  if (!rest() || !rest().hidden) bad.push('the boxes are shown before anybody has said who the account is for');
  if (d.getElementById('reg-who-in').value) bad.push('an answer is already chosen when the sheet opens — the default is the fault this question ends');
  if (!choice('parent').closest('label.field > select')) bad.push('the choice is not one row with the phone\'s own picker');
  /* AND A SEND THAT SOMEHOW HAPPENS UNANSWERED POSTS NOTHING. */
  const fill = (id, v) => { const el = d.getElementById(id); if (el) el.value = v; };
  fill('reg-first', 'Dana'); fill('reg-last', 'Brook'); fill('reg-email', 'dana@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#s-account .reg-card [data-do="reg-send"]'));
  await wait(200);
  if (sent.some(b => b.action === 'register')) bad.push('an unanswered sheet posted register — the server would make them a student');

  /* A STUDENT TICKS THE GROWN-UP'S BOX, THEN SAYS PARENT: the tick goes, and is not sent. */
  t.ACTIONS['reg-who'](choice('student'));
  if (rest().hidden) bad.push('answering did not show the boxes');
  if (!tickRow() || tickRow().hidden) bad.push('a student is not offered "It\'s a grown-up\'s email"');
  d.getElementById('reg-noemail').checked = true;
  t.ACTIONS['reg-who'](choice('parent'));
  if (!choice('parent').selected || choice('student').selected) {
    bad.push('the picker does not show the chosen answer');
  }
  if (!tickRow().hidden || d.getElementById('reg-noemail').checked) bad.push('a parent is still offered, or still has ticked, the grown-up\'s-email box');
  const note = String((d.getElementById('reg-note') || {}).textContent || '');
  if (!/Add as my child/.test(note) || !/Student profiles?/.test(note)) bad.push('a parent\'s note does not say where their child is added: ' + JSON.stringify(note));

  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#s-account .reg-card [data-do="reg-send"]'));
  await wait(300);
  const post = sent.find(b => b.action === 'register');
  if (!post) return bad.concat(['the parent\'s form posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no register']);
  if (post.who !== 'parent') bad.push('the parent\'s register carried who = ' + JSON.stringify(post.who));
  if (post.email !== 'dana@example.org' || post.parent_email) bad.push('the parent\'s address did not go as their own email: ' + JSON.stringify({ email: post.email, parent_email: post.parent_email }));

  /* THE FIRST SIGN-IN, AND SETTINGS ON THE VERY NEXT PAINT — nothing reloaded, nobody signed out. */
  t.go('account', false, true);
  await wait(80);
  { const no = await findSign_(w, 'dana@example.org', '0000'); if (no) return bad.concat([no]); }
  await wait(300);
  const u = t.whoami();
  if (!u || u.role !== 'parent') return bad.concat(['signing in did not leave a parent signed in: ' + JSON.stringify(u && u.role)]);
  try { t.go('students', false, true); } catch (e) { return bad.concat(['going to settings threw: ' + e.message]); }
  await wait(250);
  /* "MAKE YOUR CHILD'S ACCOUNT" IS THERE FROM THE FIRST PAINT — as the one sentence that says what comes first while the address is unproved (`confirmFirst_`) § */
  const heldCard = d.querySelector('#s-students .kid-held');
  if (!heldCard || !/Add your child/.test(String(heldCard.textContent || '')) || !/dana@example\.org/.test(String(heldCard.textContent || '')))
    bad.push('a parent who has just signed in for the first time has no "Add your child" on Student profiles saying to open the link sent to their address');
  if (d.querySelector('#s-students [data-kid-new]')) bad.push('a parent whose address nobody has proved yet is offered the make-child form, which the server refuses');

  /* A STUDENT'S POST SAYS STUDENT. */
  t.USER(null);
  t.go('account', false, true);
  try { w.paint('account'); } catch (e) {}
  await wait(80);
  await wait(50);
  t.ACTIONS['reg-who'](choice('student'));
  fill('reg-first', 'Mo'); fill('reg-last', 'Learner'); fill('reg-email', 'mo@example.org'); fill('reg-pin', '0000');
  sent.length = 0;
  t.ACTIONS['reg-send'](d.querySelector('#s-account .reg-card [data-do="reg-send"]'));
  await wait(300);
  const post2 = sent.find(b => b.action === 'register');
  if (!post2 || post2.who !== 'student') bad.push('a student\'s register carried who = ' + JSON.stringify(post2 && post2.who));
  return bad;
});

