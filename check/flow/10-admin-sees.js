check('a class with seats offers Take a seat as a tile on its receipt, and its seats as a line', async () => {
  const { w } = boot();
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  let pg;
  try { pg = joinPage_(w, 'W-LIST'); } catch (e) { return ['opening the class threw: ' + e.message]; }
  if (!pg) return ['the class has no page on the Booking column — nothing to look at'];
  const bad = [];
  onPaperOnly_(pg, bad);
  const foot = [...pg.querySelectorAll('.rc .rc-tiles [data-do]')].map(x => x.dataset.do);
  const tile = pg.querySelector('.rc .rc-tiles [data-do="job-take-seat"]');
  if (!tile) bad.push('no Take a seat tile in the receipt\'s foot (the foot holds: ' + foot.join(', ') + ')');
  else {
    if (!tile.classList.contains('tile')) bad.push('Take a seat is in the foot but is not a tile');
    if (tile.dataset.id !== 'W-LIST') bad.push('the Take a seat tile carries no id for the class');
    if (foot[0] !== 'job-take-seat') bad.push('Take a seat is not first in the foot: ' + foot.join(', '));
  }
  if (foot.includes('job-join')) bad.push('a class offers Ask to join, which is the act for a family\'s session');
  const sharing = rowSays_(pg, 'Split');
  if (sharing == null) bad.push('no Split row on the class\'s paper');
  else if (!/2 seats free/.test(sharing)) bad.push('the Split row says "' + sharing + '", wanted the 2 seats going');
  const seat = [...pg.querySelectorAll('.rc .rc-total .bk-t')].map(x => x.textContent.trim());
  if (!seat.includes('£19.00')) bad.push('the seat price is not on the paper\'s total row: ' + JSON.stringify(seat));
  const can = rowSays_(pg, 'Can come');
  const bars = pg.querySelectorAll('.rc .bk-row.bk-tally .wc-row').length;
  if (can == null) bad.push('the list\'s tally is not a Can come row of the paper');
  else if (bars !== 2 || !/Monday evening/.test(can)) bad.push('the Can come row draws ' + bars + ' bars ("' + can + '"), wanted the 2 slots sent');

  /* AND SOMEBODY ON THE LIST SEES THE TALLY TOO, and is offered no seat they already have. */
  w.__t.USER({ name: 'Dee Parent', personId: 'P7', role: 'parent', roles: ['parent'] });
  const D = w.__t.DATA();
  (D.liveJobs || []).forEach(j => { if (j.id === 'W-LIST') j.canAsk = false; });
  let mine;
  try { mine = joinPage_(w, 'W-LIST'); } catch (e) { return bad.concat(['opening it as a member threw: ' + e.message]); }
  if (!mine) bad.push('the list has no page for a family on it');
  else {
    if (mine.querySelector('[data-do="job-take-seat"]')) bad.push('a family already on the list is offered a seat');
    if (rowSays_(mine, 'Can come') == null) bad.push('a family on the list cannot see when the others can come');
  }

  /* THE TILE IS WIRED: pressed as a finger would, it fills the form in for this class. */
  if (tile) {
    w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
    (D.liveJobs || []).forEach(j => { if (j.id === 'W-LIST') j.canAsk = true; });
    const t = joinPage_(w, 'W-LIST').querySelector('.rc-tiles [data-do="job-take-seat"]');
    t.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(250);
    if (!/wait/i.test(String(w.__t.BOOKING.how || '')) || !w.__t.BOOKING.joining) {
      bad.push('pressing the Take a seat tile did not turn to the form for this class');
    }
  }
  return bad;
});

check('a session a family booked offers Ask to join as a tile, and says its seats are open', async () => {
  /* ONE MORE SESSION, OPEN, SEEN BY SOMEBODY NOT ON IT — in the shape `doGet` sends a stranger: § */
  const p = payload();
  const open = { id: 'J-OPEN', jobId: 'J-OPEN', type: 'job', kind: '', status: 'unconfirmed',
    subject: 'Maths', level: 'GCSE', title: 'GCSE Maths', price: 240, location: 'Mitcham library',
    tutor: '', weekday: 'Wednesday', time: '17:00', hours: '1', term: 'Autumn 1', dates: '',
    maxKids: 4, currentKids: 1, slots: [{ n: 1, client: '', status: 'Agreed', chat: '' }],
    tutorSlots: [], events: [], canAsk: true, seatsGoing: 3, openToOthers: true, splitEmails: '',
    whenCould: null, client: '' };
  p.jobs.push(open);
  const { w } = boot({ payload: p });
  await wait(300);
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  let pg;
  try { pg = joinPage_(w, 'J-OPEN'); } catch (e) { return ['opening the session threw: ' + e.message]; }
  if (!pg) return ['the open session has no page on the Booking column — nothing to look at'];
  const bad = [];
  onPaperOnly_(pg, bad);
  const foot = [...pg.querySelectorAll('.rc .rc-tiles [data-do]')].map(x => x.dataset.do);
  const tile = pg.querySelector('.rc .rc-tiles [data-do="job-join"]');
  if (!tile) bad.push('no Ask to join tile in the receipt\'s foot (the foot holds: ' + foot.join(', ') + ')');
  else if (tile.dataset.id !== 'J-OPEN' || foot[0] !== 'job-join' || !foot.includes('book-share')) {
    bad.push('Ask to join is not first beside Share with its id: ' + foot.join(', '));
  }
  if (foot.includes('job-take-seat')) bad.push('a family\'s session offers Take a seat, which is the act for a list');
  const sharing = rowSays_(pg, 'Split');
  if (sharing == null) bad.push('no Split row on the session\'s paper');
  else if (/just you/i.test(sharing) || !/3 seats free/.test(sharing)) {
    bad.push('the Split row says "' + sharing + '" on a session offering you one of its 3 seats');
  }
  if (rowSays_(pg, 'Can come') != null) bad.push('a session with a day draws a waiting list\'s tally');

  /* "JUST YOU" IS STILL THE ANSWER WHERE IT IS TRUE: nothing going and nobody named. */
  const rows = w.__t.jobRows(Object.assign({}, open, { seatsGoing: 0 }));
  const full = (rows.find(r => r.k === 'Split') || {}).v;
  if (full !== 'Just you') bad.push('a session with no seat going says "' + full + '", wanted "Just you"');

  if (tile) {
    tile.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true }));
    await wait(250);
    if (!/instant/i.test(String(w.__t.BOOKING.how || '')) || !w.__t.BOOKING.joining) {
      bad.push('pressing the Ask to join tile did not turn to the form for this session');
    }
  }
  return bad;
});

check('festive cards are gone (506): an old payload still sending `festive` draws no festive card and no join', async () => {
  const p = payload();
  p.festive = [{ id: 'H1', holiday: 'Christmas Day', name: 'Christmas party', venue: 'Hall', date: '25 Dec', price: 10, left: 5, seats: 10 }];
  const { w } = boot({ payload: p });
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  w.__t.go('feed', false, true);
  await wait(200);
  const el = w.document.getElementById('s-feed');
  if (!el) return ['there is no #s-feed — the feed screen did not draw at all'];
  const bad = [];
  if (el.querySelector('.fest, [data-item="item:feed:festive"]') || /Christmas party/.test(el.textContent)) bad.push('a festive card is still drawn on the feed');
  if (w.__t.ACTIONS['fest-join'] || w.__t.ACTIONS['fest-join-go']) bad.push('the festive join handlers still exist');
  if (typeof w.festiveCard === 'function') bad.push('festiveCard is still defined');
  return bad;
});

check('the docket keeps the text you typed, whatever it starts with', async () => {
  /* ---------- THE BUG, DEMONSTRATED BEFORE IT WAS FIXED § */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.dockLines !== 'function' || typeof w.__t.dockText !== 'function') return [];

  const bad = [];
  const round = t => {
    w.__t.USER({ name: 'R', personId: 'P1', todo: w.__t.dockText([{ done: false, text: t }]) });
    return (w.__t.dockLines() || [])[0];
  };

  ['x ray results', 'X marks the spot', '\u2713 already ticked?', 'Buy milk'].forEach(t => {
    const got = round(t);
    if (!got) { bad.push('"' + t + '" vanished from the docket entirely'); return; }
    if (got.text !== t) bad.push('"' + t + '" came back as "' + got.text + '" \u2014 the text was eaten');
    if (got.done) bad.push('"' + t + '" came back ticked, and nobody ticked it');
  });

  /* A TICK MUST STILL SURVIVE A ROUND TRIP, or the fix traded one failure for the other. */
  w.__t.USER({ name: 'R', personId: 'P1', todo: w.__t.dockText([{ done: true, text: 'Pay the invoice' }]) });
  const ticked = (w.__t.dockLines() || [])[0];
  if (!ticked || !ticked.done) bad.push('a ticked line did not come back ticked');
  if (ticked && ticked.text !== 'Pay the invoice') bad.push('a ticked line lost its text');

  /* AND EVERY DOCKET WRITTEN BEFORE THE BOXES EXISTED still has to read correctly, or the fix
     silently unticks everybody's finished work the first time they open it. */
  w.__t.USER({ name: 'R', personId: 'P1', todo: 'x old style\n\u2713 also old\nplain line' });
  const legacy = w.__t.dockLines() || [];
  if (legacy.length !== 3) bad.push('a legacy docket did not read back as three lines');
  if (legacy[0] && (!legacy[0].done || legacy[0].text !== 'old style')) {
    bad.push('the legacy `x ` form stopped reading as done');
  }
  if (legacy[2] && legacy[2].done) bad.push('a plain legacy line came back ticked');
  return bad;
});

check('a student sees their parents on Parents and brothers and sisters on Students, a parent their children on Students (453)', async () => {
  /* ---------- ASKED FOR AS "students should be able to see their parents and likewise" § */
  const { w, sent } = boot();
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const bad = [];
  const D = w.__t.DATA();
  const heads = () => w.__t.accountPages().map(h => (h.match(/<h3>([^<]*)/) || [])[1] || '').map(x => x.trim());
  const names = () => w.__t.accountPages().join('');

  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'] });
  delete D.family;
  const before = w.__t.accountPages().length;
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('with no `family` key a family card was drawn anyway');

  D.family = [
    { personId: 'P-P', title: 'Pat Parentworth', relation: 'parent', handle: 'pat_calm12', image: '' },
    { personId: 'P-S', title: 'Sam Student', relation: 'child', handle: 'sam_calm13', image: '' },
  ];
  /* A LIST BUILT FOR SOMEBODY ELSE, OR STAMPED BY NOBODY, DRAWS NOTHING. § */
  D.familyFor = 'P-P';
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('a family list built for somebody else (P-P) was drawn on P-S\'s account column');
  delete D.familyFor;
  if (heads().some(h => /^Your (parent|child)/.test(h))) bad.push('a family list with no `familyFor` stamp was drawn');
  D.familyFor = 'P-S';
  const hs = heads();
  if (hs.filter(h => h === 'Your parent').length !== 1) bad.push('a student sent one parent drew ' + hs.filter(h => h === 'Your parent').length + ' "Your parent" card(s)');
  if (!/Pat Parentworth/.test(names())) bad.push('the parent\'s name is not on the student\'s account column');
  if (hs.some(h => h === 'Your child')) bad.push('a family entry for the signed-in person themselves was drawn as a card');
  if (w.__t.accountPages().length !== before + 1) bad.push('one parent added ' + (w.__t.accountPages().length - before) + ' page(s), not 1');

  /* AND A BROTHER OR SISTER, ON *"students should be able to see their parents and siblings likewise"*. § */
  {
    const held = D.family;
    D.family = held.concat([{ personId: 'P-S2', title: 'Sasha Student', relation: 'sibling', handle: 'sasha_kind14', image: '' },
                            { personId: 'P-X', title: 'Xan Unknownrel', relation: 'cousin', handle: 'xan_odd15', image: '' }]);
    const hs2 = heads();
    if (hs2.filter(h => h === 'Your brother or sister').length !== 1) bad.push('a student sent one sibling drew ' + hs2.filter(h => h === 'Your brother or sister').length + ' "Your brother or sister" card(s)');
    if (!/Sasha Student/.test(names())) bad.push('the sibling\'s name is not on the student\'s account column');
    if (hs2.filter(h => h === 'Your parent').length !== 1) bad.push('adding a sibling lost or doubled the parent card');
    if (/Xan Unknownrel/.test(names())) bad.push('a relation with no label (cousin) was drawn anyway');
    D.family = held;
  }

  /* A PARENT WHO IS ALSO A TUTOR IS DRAWN ONCE ON EACH COLUMN THEY BELONG TO (453): Parents and Tutors. */
  /* Seeded rather than taken from the fixture, whose one tutor carries no `personId` — and the
     match between a family entry and a tutor row is by that id and nothing else. */
  const heldTutors = D.tutors;
  const tutor = Object.assign({}, (D.tutors || [])[0] || {}, { personId: 'P-TP', title: 'Terry Tutorparent', handle: 'terry_kind21' });
  D.tutors = (D.tutors || []).concat([tutor]);
  {
    w.__t.USER({ name: 'Kid Two', personId: 'P-K2', role: 'student', roles: ['student'] });
    D.family = [{ personId: tutor.personId, title: tutor.title, relation: 'parent', handle: tutor.handle, image: '' }];
    D.familyFor = 'P-K2';
    const parentHeads = heads().filter(h => /^Your parent/.test(h));
    if (parentHeads.length !== 1) bad.push('a parent who is a tutor drew ' + parentHeads.length + ' family card(s)');
    for (const c of ['parents', 'tutors']) {
      const pagesWith = w.__t.accountPages(c).filter(h => h.indexOf('>' + tutor.title + '<') !== -1).length;
      if (pagesWith !== 1) bad.push('a parent who is also a tutor is on ' + pagesWith + ' pages of ' + c + ', not 1');
    }
    if (w.__t.accountPages('students').some(h => h.indexOf('>' + tutor.title + '<') !== -1)) bad.push('a parent who is a tutor is drawn on Students');
  }
  D.tutors = heldTutors;

  /* AND A PARENT SEES THEIR CHILD. */
  w.__t.USER({ name: 'Pat Parentworth', personId: 'P-P', role: 'client', roles: ['client'] });
  D.family = [{ personId: 'P-S', title: 'Sam Student', relation: 'child', handle: 'sam_calm13', image: '' }];
  D.familyFor = 'P-P';
  if (heads().filter(h => h === 'Your child').length !== 1) bad.push('a parent sent one child did not draw one "Your child" card');

  /* AND THE REQUEST THAT BECOMES A LINK. § */
  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], token: 'tk' });
  D.family = []; D.familyFor = 'P-S';
  D.claims = [{ rowIndex: 7, from: 'Pat Parentworth', asked: '01/10/2026' }];
  if (!/Pat Parentworth says they are your parent/.test(names())) bad.push('a claim waiting on the child is not on the child\'s account column');
  D.familyFor = 'P-P';
  if (/says they are your parent/.test(names())) bad.push('a claim list built for somebody else was drawn');
  D.familyFor = 'P-S';
  try { w.__t.go('parents', false, true); w.paint('parents'); } catch (e) { bad.push('drawing Parents threw: ' + e.message); }
  const yes = w.document.querySelector('#s-parents [data-do="claim-yes"]');
  if (!yes) bad.push('the claim card on Parents has no Yes button');
  else {
    sent.length = 0;
    w.__t.ACTIONS['claim-yes'](yes);
    await wait(300);
    const post = sent.find(b => b.action === 'answerClaim');
    if (!post) bad.push('pressing Yes posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no answerClaim');
    else if (String(post.rowIndex) !== '7' || post.accept !== true) bad.push('pressing Yes posted ' + JSON.stringify(post) + ' — wanted row 7, accept true');
    if ((D.claims || []).length) bad.push('the answered claim is still in the list the column is drawn from');
  }
  delete D.family; delete D.familyFor; delete D.claims;
  w.__t.USER(null);
  return bad;
});

check('an admin sees everyone on the people column, and nobody else sees more than before', async () => {
  /* ---------- ASKED FOR AS "Admin should be able to see every one in the people column." § */
  const { w } = boot();
  await wait(400);
  if (!w.__t.accountPages) return ['accountPages_ is not exported — cannot check the account column'];
  const bad = [];
  const D = w.__t.DATA();
  const all = () => w.__t.accountPages().join('');
  const count = n => w.__t.accountPages().filter(h => h.indexOf('>' + n + '<') !== -1).length;
  D.everyone = [
    /* `Evie` ALONE: a child reaches the admin by first name too (the owner, 10 Oct — `nameFor_`,
       check-surnames.js), and this list is the shape `doGet` sends. */
    { personId: 'P-E1', title: 'Evie', handle: 'evie_calm31', role: 'Student', image: '' },
    { personId: 'P-E2', title: 'Carl Everyclient', handle: 'carl_kind32', role: 'Client', image: '' },
    { personId: 'P-AD', title: 'Ada Admin', handle: 'ada_brave33', role: 'Client', image: '' },
  ];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'] });
  if (/>Evie<|Carl Everyclient/.test(all())) bad.push('a student was drawn the admin\'s `everyone` list');

  w.__t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  if (count('Evie') !== 1) bad.push('an admin\'s column drew the student ' + count('Evie') + ' time(s), not once');
  if (count('Carl Everyclient') !== 1) bad.push('an admin\'s column drew the client ' + count('Carl Everyclient') + ' time(s), not once');
  if (count('Ada Admin') !== 1) bad.push('the admin is on ' + count('Ada Admin') + ' pages of their own column, not 1');
  const evie = w.__t.accountPages().find(h => h.indexOf('>Evie<') !== -1) || '';
  if (!/data-do="msg-open"/.test(evie)) bad.push('a student on the admin\'s column has no Message tile');
  if (/data-do="set-listed"/.test(evie)) bad.push('a student on the admin\'s column carries the tutor-only Listed switch');
  if (/prof-nohours/.test(evie)) bad.push('a student on the admin\'s column is told they "haven\'t set their hours", a tutor\'s warning');
  delete D.everyone;
  if (/>Evie</.test(all())) bad.push('with no `everyone` key the student was drawn anyway');
  w.__t.USER(null);
  return bad;
});

/* TUTORS NEVER SEE A STUDENT'S WORKING PHOTOS (owner, 28 Oct; backend `workingMaySee_`): the tile is drawn by that rule -- the admin, or a parent of theirs */
check('Working photos is drawn for an admin and for a parent of the child, never for a tutor', async () => {
  const { w } = boot();
  await wait(400);
  if (!w.__t.accountPages || typeof w.workSeeTile_ !== 'function') return ['accountPages_ or workSeeTile_ is not reachable — NOT checked'];
  const bad = [];
  const D = w.__t.DATA();
  const photos = () => w.__t.accountPages().filter(h => /data-do="work-see"/.test(h)).length;
  D.everyone = [{ personId: 'P-E1', title: 'Evie', handle: 'evie_calm31', role: 'Student', image: '' }];
  w.__t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tk' });
  if (photos() !== 1) bad.push('an admin\'s students list draws Working photos ' + photos() + ' time(s), wanted once, on Evie');
  /* A TUTOR, the same list still in the payload (a copy kept from before a rank changed): the tile is the tutor's own rule, not only the list's */
  w.__t.USER({ name: 'Tom Tutor', personId: 'P-TT', role: 'tutor', roles: ['tutor'], rank: 'staff', token: 'tt' });
  if (photos()) bad.push('a tutor is drawn Working photos ' + photos() + ' time(s)');
  if (w.workSeeTile_('P-E1')) bad.push('workSeeTile_ draws the tile for a tutor: the backend refuses them, so the tile is a door onto nothing');
  /* A PARENT OF THE CHILD, a tutor or not, may: their family card carries it */
  D.familyFor = 'P-TT';
  D.family = [{ personId: 'P-KID', title: 'Kit', handle: 'kit_kind7', relation: 'child' }];
  if (photos() !== 1) bad.push('a tutor who is the child\'s parent is drawn Working photos ' + photos() + ' time(s) on their family, wanted once');
  w.__t.USER({ name: 'Pat Parent', personId: 'P-PP', role: 'parent', roles: ['parent'], rank: 'client', token: 'tp' });
  D.familyFor = 'P-PP';
  if (photos() !== 1) bad.push('a parent is drawn Working photos ' + photos() + ' time(s) for their child, wanted once');
  delete D.everyone; delete D.family; delete D.familyFor;
  w.__t.USER(null);
  return bad;
});

/* "I MYSELF NEED TO BE ABLE TO ADD NEW PEOPLE … ADD OR DELETE OR EDIT PEOPLE FROM ADMIN ACCOUNT" (373): the "+" above everybody, its form, Edit and Delete. */
check('an admin adds a person from the "+" on Students (453), edits one and deletes one (a parent, on Parents), each seen without a reload; nobody else is offered any of it', async () => {
  const PIN = ['6', '1', '4', '8', '2', '7'].join('');
  let hold = false, release = null;
  const { w, sent } = boot({
    /* THE PAYLOAD THAT `load()` ASKS FOR AFTER A SAVE IS HELD, so what the column shows is the reply's doing. */
    serve: () => hold ? new Promise(res => { release = () => res(null); }) : undefined,
    reply: b => b.action === 'personGet'
      ? { success: true, parents: [{ personId: 'P-E2', name: 'Carl Handled' }],
          person: b.targetId === 'P-E1' ? { personId: 'P-E1', firstName: 'Evie', lastName: 'Child', roles: ['student'], email: '',
                                            dob: '2015-03-02', handle: 'evie_calm31', parentIds: ['P-E2'] } : null }
      : b.action === 'personSave'
        ? (b.targetId ? { success: true, made: false, person: { personId: b.targetId, title: b.firstName, handle: 'evie_calm31', role: 'Student', image: '' },
                          first: b.firstName, handle: 'evie_calm31', pin: '' }
                      : { success: true, made: true, person: { personId: 'P-NEW', title: b.firstName, handle: 'na2026', role: 'Student', image: '' },
                          first: b.firstName, handle: 'na2026', pin: PIN })
        : b.action === 'personDelete' ? { success: true, deleted: b.targetId } : { success: true } });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  /* `DATA` IS ASKED FOR EACH TIME — the `load()` after a save replaces it whole. */
  if (!t.accountPages) return ['accountPages_ is not exported — cannot check the people column'];
  const rows = () => [{ personId: 'P-E1', title: 'Evie', handle: 'evie_calm31', role: 'Student', image: '' },
                      { personId: 'P-E2', title: 'Carl Handled', handle: 'carl_kind32', role: 'Client', image: '' }];
  t.DATA().everyone = rows();
  const all = () => t.accountPages().join('');
  /* STUDENTS FOR EVIE AND THE NEW CHILD, PARENTS FOR CARL (453). */
  const draw = (c = 'students') => { try { t.repaint(true); t.go(c, false, true); w.paint(c); } catch (e) { bad.push('drawing ' + c + ' threw: ' + e.message); } };
  const col = (c = 'students') => d.querySelector('#s-' + c);
  /* NOT AN ADMIN: no "+", no Edit, no Delete, and the doors do nothing — over a tutor and a parent who have ids to name. */
  const tutors0 = t.DATA().tutors;
  t.DATA().tutors = (tutors0 || []).slice(0, 1).map(x => Object.assign({}, x, { personId: 'P-TX', title: 'Tom Tutorid' }));
  t.DATA().family = [{ personId: 'P-PX', title: 'Pip Parent', relation: 'parent', handle: 'pip_kind12', image: '' }];
  t.DATA().familyFor = 'P-S';
  t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], token: 'tk1' });
  if (!/Tom Tutorid/.test(all()) || !/Pip Parent/.test(all())) bad.push('the student\'s column did not draw the tutor and parent this asks about');
  if (/data-do="person-(add|edit|del)"/.test(all())) bad.push('a student is offered the admin\'s +, Edit or Delete');
  t.USER({ name: 'Tia Tutor', personId: 'P-T', role: 'tutor', roles: ['tutor'], token: 'tk2' });
  if (/data-do="person-(add|edit|del)"/.test(all())) bad.push('a tutor is offered the admin\'s +, Edit or Delete');
  sent.length = 0;
  const fake = d.createElement('button'); fake.setAttribute('data-id', 'P-E1');
  ['person-add', 'person-edit', 'person-del', 'person-del'].forEach(a => { try { t.ACTIONS[a](fake); } catch (e) {} });
  await wait(150);
  if (sent.some(b => /^person/.test(b.action))) bad.push('a tutor pressing the admin\'s doors posted ' + sent.filter(b => /^person/.test(b.action)).map(b => b.action).join(', '));
  if (/person-form/.test(all())) bad.push('a tutor pressing + was drawn the new-person form');

  t.DATA().tutors = tutors0; delete t.DATA().family; delete t.DATA().familyFor;
  /* AN ADMIN: the "+" once, the very first card, above even their own (447); Edit and Delete on others, not on themselves. */
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  const pages = t.accountPages('students');
  const at = pages.findIndex(h => /data-do="person-add"/.test(h)), evieAt = pages.findIndex(h => h.indexOf('>Evie<') !== -1);
  if (pages.filter(h => /data-do="person-add"/.test(h)).length !== 1) bad.push('Students does not have exactly one "+"');
  /* THE "+" LEADS EVERY PEOPLE COLUMN FOR AN ADMIN (453), above Find by handle and everybody. */
  /* NEEDS HELP (455) IS ABOVE IT FOR STAFF AND UP (461). */
  const helpAt = pages.findIndex(h => /help-list/.test(h));
  if (!(helpAt === 0 && at === 1 && evieAt > at)) bad.push('the "+" is at page ' + at + ' of Students (Needs help at ' + helpAt + '), wanted 1 under Needs help (Evie at ' + evieAt + ')');
  if (/data-do="person-(edit|del)"/.test(t.accountPages('tutors').find(h => /card-edit/.test(h) && /data-pid="P-AD"/.test(h)) || '')) bad.push('the admin\'s own card offers Edit or Delete of themselves');
  const evie = pages[evieAt] || '';
  /* NO EDIT (467): "Profile cards are uneditable by anyone, including admin" — Delete stays. */
  if (/data-do="person-edit"/.test(evie) || !/data-do="person-del" data-id="P-E1"/.test(evie)) bad.push('Evie\'s card offers the admin Edit, or has no Delete');
  if (!/data-do="msg-open"/.test(evie) || !/data-do="kid-pin"/.test(evie)) bad.push('Edit and Delete pushed Message or New PIN off the card');

  /* ADD: the form, then `personSave` with no target, then the slip and the new person in the list. */
  draw();
  await wait(200);
  const plus = col() && col().querySelector('[data-do="person-add"]');
  if (!plus) return bad.concat(['the "+" is not drawn on the people column']);
  t.ACTIONS['person-add'](plus);
  await wait(250);
  let form = col().querySelector('.person-form');
  if (!form) return bad.concat(['pressing + drew no form']);
  if (!form.querySelector('[data-pf="first"]') || !form.querySelector('[data-pf="email"]') || !form.querySelector('[data-pf="dob"]')
      || form.querySelectorAll('[data-pf-role]').length !== 4) bad.push('the new-person form lacks a name, email, date of birth or the four roles');
  form.querySelector('[data-pf="first"]').value = 'Nia';
  form.querySelector('[data-pf="last"]').value = 'Newby';
  form.querySelector('[data-pf="parent"]').value = 'P-E2';
  sent.length = 0;
  hold = true;
  t.ACTIONS['person-save'](form.querySelector('[data-do="person-save"]'));
  await wait(300);
  const add = sent.find(b => b.action === 'personSave');
  if (!add || add.targetId || add.firstName !== 'Nia' || add.lastName !== 'Newby' || add.personId !== 'P-AD'
      || JSON.stringify(add.roles) !== '["student"]' || JSON.stringify(add.parentIds) !== '["P-E2"]') bad.push('saving the new person posted ' + JSON.stringify(add));
  const slip = col().querySelector('.person-made .pin-slip');
  if (!slip || !/@na2026/.test(slip.textContent) || slip.textContent.indexOf(PIN) === -1) bad.push('after adding there is no slip with the handle and the PIN');
  if (!t.accountPages().some(h => h.indexOf('>Nia<') !== -1)) bad.push('the new person is not on the column until a reload');
  t.ACTIONS['person-cancel'](col().querySelector('.person-made [data-do="person-cancel"]'));
  if (release) release();
  hold = false;
  await wait(300);
  t.DATA().everyone = rows();

  /* DELETE (420): asked on the tile itself — the first press arms it in words, no pop-up; the second posts `personDelete`. */
  draw('parents');
  await wait(200);
  const del = col('parents').querySelector('[data-do="person-del"][data-id="P-E2"]');
  if (!del) return bad.concat(['Carl has no Delete tile on the drawn column']);
  sent.length = 0;
  t.ACTIONS['person-del'](del);
  await wait(100);
  if (sent.some(b => b.action === 'personDelete')) bad.push('Delete deleted before asking');
  if (!d.getElementById('sheet').classList.contains('hidden')) bad.push('Delete opened the sheet: ' + JSON.stringify((d.getElementById('sheet-title') || {}).textContent));
  if (!del.dataset.sure || !/Tap again to confirm/.test(del.textContent) || !del.classList.contains('is-sure')) bad.push('the first press did not arm the tile with "Tap again to confirm": ' + JSON.stringify(del.textContent.trim()));
  /* A YES UNDER 400 MS IS A DOUBLE TAP'S SECOND HALF (534): ignored, and the tile stays armed. */
  t.ACTIONS['person-del'](del);
  await wait(50);
  if (sent.some(b => b.action === 'personDelete') || !del.dataset.sure) bad.push('a second press 150 ms after arming deleted, or disarmed the tile');
  await wait(300);
  hold = true;
  t.ACTIONS['person-del'](del);
  await wait(300);
  const gone = sent.find(b => b.action === 'personDelete');
  if (!gone || gone.targetId !== 'P-E2' || gone.personId !== 'P-AD') bad.push('saying Delete posted ' + JSON.stringify(gone));
  if (t.accountPages().some(h => h.indexOf('>Carl Handled<') !== -1)) bad.push('Carl is still on the column after being deleted');
  if (release) release();
  hold = false;
  await wait(200);
  delete t.DATA().everyone;
  t.USER(null);
  return bad;
});

/* ---------- AN EMPTY WIDGET IS ITS TITLE AND NOTHING ELSE (414) */
check('an empty Spotlight, Saved, shop and basket draw their title and, for a signed-in viewer, the one Suggest a change (owner, 1 Nov), for a visitor and an admin alike', async () => {
  const { w } = boot();
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  const only = (html, title, who) => {
    const box = d.createElement('div'); box.innerHTML = html;
    const card = box.firstElementChild;
    const kids = card ? [...card.children] : [];
    const row = card && card.querySelector(':scope > .tile-row');
    const acts = row ? [...row.querySelectorAll('[data-do]')].map(e => e.getAttribute('data-do')) : [];
    if (!card || !kids[0] || kids[0].tagName !== 'H3' || kids[0].textContent.trim() !== title || kids.length > 2 || (kids[1] && kids[1] !== row)) {
      bad.push(who + '’s empty ' + title + ' draws more than its title: ' + JSON.stringify(box.textContent.replace(/\s+/g, ' ').trim().slice(0, 100)));
    }
    if (acts.join() !== (who === 'a visitor' ? '' : 'rep-box')) bad.push(who + '’s empty ' + title + ' has the tiles ' + JSON.stringify(acts) + ', wanted ' + (who === 'a visitor' ? 'none (signed out)' : 'Suggest a change alone'));
  };
  for (const who of [null, { name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' }]) {
    t.USER(who);
    const name = who ? 'an admin' : 'a visitor';
    if (w.spotPages().length) return bad.concat(['the fixture has something spotlit, so the empty Spotlight was NOT checked']);
    const sp = w.spotlightCards_();
    if (sp.length !== 1) bad.push(name + '’s empty Spotlight is ' + sp.length + ' cards'); else only(sp[0], 'Spotlight', name);
    const sv = w.savedCards_();
    if (!who || (sv.length === 1 && /is-empty/.test(sv[0]))) only(sv[0], 'Saved', name);
    else if (who) bad.push('an admin’s Saved is not empty in the fixture (' + sv.length + ' cards), so it was NOT checked');
  }
  if (w.cartCard_ && t.setCart) { t.setCart([]); if (String(w.cartCard_()).trim()) bad.push('an empty basket draws words under its title: ' + w.cartCard_()); }
  t.USER(null);
  return bad;
});

/* ---------- EVERY TILE SHOWN (420): "remove all pop up menus I DONT LIKE POP UP MENUS" — no "Admin"/"More" tile, the admin's grouped last, lines balanced */
check('an admin sees every tile on a tutor card — Message, Share, Save on one line, the admin\'s grouped on the next — nothing behind a More tile, and a trait typed twice is said once', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  if (typeof w.cardTiles_ !== 'function' || typeof w.tileRow_ !== 'function') return ['the tile row is not reachable — NOT checked'];
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  const row = { personId: 'P-G', title: 'George Tutor', handle: 'george', listed: true, role: 'Tutor', tags: 'patient, driven, driven' };
  const item = { kind: 'tutor', name: row.title, key: row.title, row, account: true,
                 more: typeof w.peopleTiles_ === 'function' ? w.peopleTiles_(row) : '' };
  const box = d.createElement('div');
  box.innerHTML = w.cardTiles_(item);
  d.body.appendChild(box);
  const r = box.querySelector('.tile-row');
  if (!r) return ['the tutor card drew no tile row'];
  const tiles = [...r.querySelectorAll('.tile')];
  const acts = tiles.map(el => el.getAttribute('data-do'));
  if (/tile-more|tile-sheet/.test(box.innerHTML) || r.querySelector('[hidden]')) bad.push('a tile is behind a More/Admin tile or hidden: ' + acts.join(' '));
  if (acts.slice(0, 3).join(' ') !== 'msg-open tutor-share fav') bad.push('the viewer\'s tiles do not lead in the order Message, Share, Save: ' + acts.join(' '));
  const grp = r.querySelector(':scope > .tile-group.is-admin');
  const inGroup = grp ? [...grp.querySelectorAll('.tile')].map(el => el.getAttribute('data-do')) : [];
  ['spot', 'person-del'].forEach(a => { if (inGroup.indexOf(a) === -1) bad.push('the admin group, shown in the row, has no ' + a + ': ' + inGroup.join(' ')); });
  if (inGroup[inGroup.length - 1] !== 'person-del') bad.push('Delete is not last in the admin group: ' + inGroup.join(' '));
  /* ONE FLOW (487): however many tiles, no break into lines. */
  const fake = n => Array.from({ length: n }, (_, i) => w.tile_({ icon: 'chat', label: 'T' + i, act: 'msg-open' })).join('');
  if (/tile-break/.test(w.tileRow_(fake(13)))) bad.push('13 tiles broke into lines — tiles flow like words (487)');
  /* A SHORT ROW IS LEFT AS IT IS. */
  const plain = w.tileRow_(w.tile_({ icon: 'chat', label: 'Message', act: 'msg-open' }) + w.tile_({ icon: 'share', label: 'Share', act: 'tutor-share' }));
  if (/tile-more|tile-sheet|tile-break/.test(plain)) bad.push('a row of two tiles grew a More tile or a break');
  const words = w.profList_(row.tags);
  if (words.join('|') !== 'patient|driven') bad.push('the traits "patient, driven, driven" read ' + JSON.stringify(words));
  box.remove();
  t.USER(null);
  return bad;
});

/* "I WANT TO USE CLAUDE LESS FOR ADDING STUFF … A PLUS WIDGET ON REELS LIKE YOU DID FOR PEOPLE" (404): the "+" leads Reels for an admin, a pasted Short is looked up (oEmbed stubbed), saved, and shown. */
check('an admin adds a reel from the "+" just before the first reel, where the column stands — a pasted Short looked up, saved as mediaSave, and in the column without a reload; a student has no "+"', async () => {
  const ID = 'Ab3_dEfGh-1';
  let hold = false;
  /* THE PAYLOAD `load()` ASKS FOR AFTER A SAVE IS HELD, so what the column shows is the reply's doing. */
  const { w, sent } = boot({ serve: () => hold ? new Promise(() => {}) : undefined, before: w => {
      const real = w.fetch;
      w.fetch = (url, o) => /youtube\.com\/oembed/.test(String(url))
        ? Promise.resolve({ ok: true, status: 200, json: () => Promise.resolve({ title: 'Fractions in a minute', author_name: 'A Channel',
            thumbnail_url: 'https://i.ytimg.com/vi/' + ID + '/hqdefault.jpg' }) })
        : real(url, o);
    },
    reply: b => b.action === 'mediaSave'
      ? { success: true, kind: 'reel', id: ID, media: [{ kind: 'reel', id: ID, url: 'https://youtube.com/shorts/' + ID, title: b.title, subject: b.subject }] }
      : { success: true } });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  const draw = () => { try { t.go('reel', false, true); w.paint('reel'); } catch (e) { bad.push('drawing Reels threw: ' + e.message); } };
  const col = () => d.querySelector('#s-reel');
  t.USER({ name: 'Sam Student', personId: 'P-S', role: 'student', roles: ['student'], token: 'tk1' });
  draw(); await wait(200);
  if (!col() || !col().querySelector('.reel')) return bad.concat(['the Reels column drew no reel for a student, so nothing below can be asked']);
  if (col().querySelector('[data-do="media-add"], .media-add')) bad.push('a student is drawn the admin\'s "+" on Reels');
  /* THE FIRST REEL IS WHERE THE COLUMN STANDS (414), the widgets before it — Videos among them. */
  const pagesNow = () => [...col().querySelectorAll(':scope > .page')];
  const reelAt = () => pagesNow().findIndex(p => p.querySelector('.reel'));
  if (t.PAGE().reel !== reelAt()) bad.push('a student\'s Reels stands on page ' + t.PAGE().reel + ', not on the first reel (page ' + reelAt() + ')');
  const vidAt = pagesNow().findIndex(p => p.querySelector('#wgt-videos'));
  if (vidAt < 0 || vidAt > reelAt()) bad.push('the Videos widget is not a page before the first reel (at ' + vidAt + ', first reel ' + reelAt() + ')');
  sent.length = 0;
  const fake = d.createElement('button'); fake.setAttribute('data-kind', 'reel'); fake.setAttribute('data-id', ID);
  ['media-add', 'media-hide', 'media-del', 'media-del'].forEach(a => { try { t.ACTIONS[a](fake); } catch (e) {} });
  await wait(150);
  if (sent.some(b => /^media/.test(b.action))) bad.push('a student pressing the admin\'s doors posted ' + sent.map(b => b.action).join(', '));

  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  draw(); await wait(200);
  /* THE "+" IS THE PAGE JUST BEFORE THE FIRST REEL, AND NOT WHERE THE COLUMN STANDS (414): the first reel is, the "+" one swipe back. */
  const plusAt = pagesNow().findIndex(p => p.querySelector('[data-do="media-add"][data-kind="reel"]'));
  const first = plusAt >= 0 ? pagesNow()[plusAt] : null;
  const plus = first && first.querySelector('[data-do="media-add"][data-kind="reel"]');
  if (!plus) return bad.concat(['the admin\'s Reels column has no "+" page']);
  if (plusAt !== reelAt() - 1) bad.push('the "+" is page ' + plusAt + ', not the one just before the first reel (' + reelAt() + ')');
  if (t.PAGE().reel !== reelAt()) bad.push('an admin\'s Reels stands on page ' + t.PAGE().reel + ', not the first reel (' + reelAt() + ') — the "+" is the default again');
  if (first.querySelector('.reel')) bad.push('the "+" page also carries a reel');
  t.ACTIONS['media-add'](plus);
  await wait(200);
  let form = col().querySelector('.media-form');
  if (!form) return bad.concat(['pressing + drew no form']);
  const url = form.querySelector('[data-mf="url"]');
  url.value = 'https://youtube.com/shorts/' + ID + '?feature=share';
  url.dispatchEvent(new w.Event('input', { bubbles: true }));
  await wait(300);
  form = col().querySelector('.media-form');
  const title = form && form.querySelector('[data-mf="title"]');
  if (!title || title.value !== 'Fractions in a minute') return bad.concat(['the pasted Short was not looked up: title ' + JSON.stringify(title && title.value)]);
  if (!form.querySelector('img.media-thumb[src*="i.ytimg.com"]')) bad.push('the form shows no preview picture');
  const subj = form.querySelector('[data-mf="subject"]');
  subj.value = 'Maths'; subj.dispatchEvent(new w.Event('input', { bubbles: true }));
  sent.length = 0;
  hold = true;
  t.ACTIONS['media-save'](form.querySelector('[data-do="media-save"]'));
  await wait(300);
  const sv = sent.find(b => b.action === 'mediaSave');
  if (!sv || sv.kind !== 'reel' || sv.title !== 'Fractions in a minute' || sv.subject !== 'Maths' || sv.personId !== 'P-AD'
      || !/shorts\/Ab3_dEfGh-1/.test(sv.url)) bad.push('saving posted ' + JSON.stringify(sv));
  draw(); await wait(200);
  const clips = [...col().querySelectorAll('.reel')].map(r => r.innerHTML).join('');
  if (clips.indexOf(ID) === -1) bad.push('the new reel is not in the Reels column after Save');
  if (col().querySelector('.media-form')) bad.push('the form stayed open after Save');
  if (!col().querySelector('.media-list [data-do="media-edit"][data-id="' + ID + '"]')) bad.push('the added reel has no Edit tile on the "+" page');
  t.DATA().media = [];
  t.USER(null);
  return bad;
});

/* "ADD A REEL SHOULD ALSO GIVE ME OPTION TO UPLOAD A FILE INSTEAD" (474): a video file, no `capture`, sent as mediaUpload and played from Drive. */
check('an admin uploads a reel as a video file — an Upload tile, accept="video/*" with no capture, over 20 MB refused, sent as mediaUpload, and in the column as a Drive clip', async () => {
  const FID = 'f1761480000000';
  let hold = false;
  const { w, sent } = boot({ serve: () => hold ? new Promise(() => {}) : undefined,
    reply: b => b.action === 'mediaUpload'
      ? { success: true, kind: 'reel', id: FID, media: [{ kind: 'reel', id: FID, url: 'https://drive.google.com/file/d/FILEreel1234567890abcdefgh/view#video', title: b.title, subject: b.subject }] }
      : { success: true } });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  const col = () => d.querySelector('#s-reel');
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  try { t.go('reel', false, true); w.paint('reel'); } catch (e) { return ['drawing Reels threw: ' + e.message]; }
  await wait(200);
  const plus = col() && col().querySelector('[data-do="media-add"][data-kind="reel"]');
  if (!plus) return ['the admin\'s Reels column has no "+"'];
  t.ACTIONS['media-add'](plus);
  await wait(150);
  let form = col().querySelector('.media-form');
  const tile = form && form.querySelector('.tile[data-do="media-file"]');
  const inp = form && form.querySelector('input[type="file"].media-file-in');
  if (!tile) bad.push('the new-reel form has no "Upload a video" tile');
  if (!inp) return bad.concat(['the new-reel form has no file input']);
  if (inp.getAttribute('accept') !== 'video/*') bad.push('the file input accepts "' + inp.getAttribute('accept') + '", not video/*');
  if (inp.hasAttribute('capture')) bad.push('the file input carries `capture`, so an iPhone would open only the camera');
  if (!form.querySelector('[data-mf="url"]')) bad.push('the YouTube link box went — upload is an option, not a replacement');
  const pick = file => { Object.defineProperty(inp, 'files', { value: [file], configurable: true }); inp.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const big = new w.File(['x'], 'huge.mp4', { type: 'video/mp4' });
  Object.defineProperty(big, 'size', { value: 21 * 1048576 });
  pick(big); await wait(150);
  form = col().querySelector('.media-form');
  if (!/over 20 MB/.test((form.querySelector('.media-said') || {}).textContent || '')) bad.push('a 21 MB video was not refused on the form');
  const fresh = () => col().querySelector('input.media-file-in');
  Object.defineProperty(fresh(), 'files', { value: [new w.File(['abc'], 'fractions_in_a_minute.mp4', { type: 'video/mp4' })], configurable: true });
  fresh().dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(300);
  form = col().querySelector('.media-form');
  const title = form && form.querySelector('[data-mf="title"]');
  if (!title || title.value !== 'fractions in a minute') return bad.concat(['the chosen file did not fill the title: ' + JSON.stringify(title && title.value)]);
  if (form.querySelector('.tile[data-do="media-file"]')) bad.push('the Upload tile is still offered with a file held');
  sent.length = 0;
  hold = true;
  t.ACTIONS['media-save'](form.querySelector('[data-do="media-save"]'));
  await wait(300);
  const up = sent.find(b => b.action === 'mediaUpload');
  if (!up || up.kind !== 'reel' || !/^data:video\/mp4;base64,/.test(String(up.data)) || up.title !== 'fractions in a minute' || up.personId !== 'P-AD') bad.push('saving posted ' + JSON.stringify(up && Object.assign({}, up, { data: String(up.data).slice(0, 30) })));
  if (sent.some(b => b.action === 'mediaSave')) bad.push('an upload also sent mediaSave');
  w.paint('reel'); await wait(200);
  const vid = [...col().querySelectorAll('.reel video[data-clip]')].find(v => /FILEreel/.test(v.dataset.clip));
  if (!vid) bad.push('the uploaded reel is not a clip in the column');
  else if (!/^https:\/\/drive\.usercontent\.google\.com\/download\?id=FILEreel/.test(vid.dataset.clip)) bad.push('the uploaded reel plays from ' + vid.dataset.clip + ', not Drive\'s download address');
  if (!col().querySelector('.media-list [data-do="media-edit"][data-id="' + FID + '"]')) bad.push('the uploaded reel has no Edit tile');
  t.DATA().media = [];
  t.USER(null);
  return bad;
});

/* "THE PROFILE PICTURE SHOULD BE IN SYNC WITH MY DP FOR MY ACCOUNT" (474): a person's post wears their picture by person id, read when it is drawn. */
check('a post wears its author\'s account picture by person id — your own follows a change of picture without a reload, a person with none is their initial and never the brand mark, the business post keeps the mark', async () => {
  const { w } = boot({});
  await wait(400);
  const t = w.__t, d = w.document, bad = [], D = t.DATA();
  const keep = D.posts, keepBrand = D.brand;
  D.brand = Object.assign({}, D.brand, { logo_square: 'icon.png' });
  const post = (id, o) => Object.assign({ id, author: 'Ada Admin', handle: '@ada', avatar: '', image: 'data/reels/archetest.jpg', media: ['data/reels/archetest.jpg'],
    caption: 'A trip', body: '', location: '', when: '', at: 0, pinned: false, active: true, waiting: false, refused: false, approvedBy: '', poll: null,
    reactions: { emoji: ['👍'], counts: [0], total: 0, yours: '', by: [] }, comments: { total: 0, list: [] }, rowIndex: 2 }, o);
  const face = id => d.querySelector('#s-feed article[data-post="' + id + '"] .post-face');
  const PHOTO = 'https://drive.google.com/file/d/FILEpfp1234567890abcdefgh/view';
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk', handle: '@ada', photo: '', profile: {} });
  D.posts = [post('PO-ME', { authorId: 'P-AD' }), post('PO-BIZ', { author: '@family.', handle: '@family.', authorId: '' }),
             post('PO-THEM', { author: 'Tom Tutor', handle: '@tom', authorId: 'P-TT', avatar: 'https://drive.google.com/file/d/FILEtom1234567890abcdefgh/view' })];
  try { w.paint('feed'); } catch (e) { return ['drawing the feed threw: ' + e.message]; }
  await wait(150);
  const me = face('PO-ME');
  if (!me) return ['your post drew no face'];
  if (me.tagName === 'IMG') bad.push('with no picture on your account your post wears ' + me.getAttribute('src') + ', not your initial');
  else if (me.textContent.trim() !== 'A') bad.push('with no picture your post shows "' + me.textContent.trim() + '", not your initial A');
  const biz = face('PO-BIZ');
  if (!biz || biz.tagName !== 'IMG') bad.push('the business post lost the brand mark');
  const them = face('PO-THEM');
  if (!them || !/FILEtom/.test(them.getAttribute('src') || '')) bad.push('another person\'s post does not wear their picture');
  /* THE PICTURE CHANGES IN SETTINGS: `pfpTake_` writes USER.photo and calls `postFacesMine_`. */
  const u = t.whoami(); u.photo = PHOTO; u.profile = { photo: PHOTO };
  w.postFacesMine_();
  const now = face('PO-ME');
  if (!now || now.tagName !== 'IMG' || !/lh3\.googleusercontent\.com\/d\/FILEpfp/.test(now.getAttribute('src') || '')) bad.push('after a change of picture your post shows ' + (now ? now.outerHTML.slice(0, 90) : 'nothing') + ', not the new picture');
  if (!/FILEtom/.test((face('PO-THEM') || {}).getAttribute && face('PO-THEM').getAttribute('src') || '')) bad.push('your change of picture touched somebody else\'s post');
  w.paint('feed'); await wait(100);
  if (!/FILEpfp/.test(((face('PO-ME') || {}).getAttribute && face('PO-ME').getAttribute('src')) || '')) bad.push('a repaint of the feed lost your new picture');
  D.posts = keep; D.brand = keepBrand;
  t.USER(null);
  return bad;
});

/* "ADD AGE RESTRICTION FOR VIDEOS AND REELS — HOW OLD THEY HAVE TO BE TO WATCH IT" (406): the phone hides what the viewer is too young for. */
check('a ten-year-old student sees no 12+ reel or video, anyone with no date of birth or nobody sees only unrated, an adult and the admin see all with an age badge', async () => {
  const { w } = boot({});
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  const ALL = 'AAAAAAAAAAA', TWELVE = 'BBBBBBBBBBB', FIFTEEN = 'CCCCCCCCCCC', V18 = 'DDDDDDDDDDD', V0 = 'EEEEEEEEEEE';
  t.DATA().media = [{ kind: 'reel', id: ALL, title: 'All', age: '' }, { kind: 'reel', id: TWELVE, title: 'Twelve', age: '12' },
                    { kind: 'reel', id: FIFTEEN, title: 'Fifteen', age: '15' },
                    { kind: 'video', id: V18, title: 'Eighteen video', age: '18' }, { kind: 'video', id: V0, title: 'Everyone video', age: '' }];
  const y = new Date().getFullYear();
  const col = () => d.querySelector('#s-reel');
  const look = (who, say) => {
    t.USER(who);
    try { w.eval('REEL_CLIPS = null'); t.go('reel', false, true); w.paint('reel'); } catch (e) { bad.push(say + ': drawing Reels threw ' + e.message); }
    const html = [...((col() && col().querySelectorAll('.reel')) || [])].map(r => r.outerHTML).join('');
    const vids = (typeof w.videosAll_ === 'function' ? w.videosAll_() : []).map(r => r.url).join(' ');
    return { html, vids, has: id => html.indexOf(id) !== -1, video: id => vids.indexOf(id) !== -1 };
  };
  if (typeof w.videosAll_ !== 'function') return ['videosAll_ is not reachable, so nothing about videos can be asked'];
  let s = look({ name: 'Kit Young', personId: 'P-K', role: 'student', roles: ['student'], rank: 'student', token: 'tk1', profile: { dob_d: '1', dob_m: '1', dob_y: String(y - 10) } }, 'a ten-year-old');
  if (!s.has(ALL)) bad.push('a ten-year-old does not see the reel for everyone, so the question below is empty');
  if (s.has(TWELVE) || s.has(FIFTEEN)) bad.push('a ten-year-old student is shown a 12+ or 15+ reel');
  if (s.video(V18) || !s.video(V0)) bad.push('a ten-year-old sees the 18 video, or not the one for everyone: ' + s.vids);
  /* A SHEET ROW TOO OLD FOR HER COMES AS A VEIL (the server's `mediaVeil_`, 957cb7b5 for this repository Short) AND HIDES THE REPOSITORY COPY. */
  if (!s.has('jD2Yy_wCBLE')) bad.push('the repository Short is not in a ten-year-old\'s column before any veil, so the veil question is empty');
  t.DATA().media.push({ kind: 'reel', veil: '957cb7b5', hidden: true });
  s = look(t.whoami(), 'a ten-year-old, veiled');
  if (s.has('jD2Yy_wCBLE')) bad.push('a veiled repository Short still shows to the ten-year-old');
  t.DATA().media.pop();
  s = look({ name: 'Ada Pupil', personId: 'P-S', role: 'student', roles: ['student'], rank: 'student', token: 'tk2', profile: {} }, 'an unknown-age student');
  /* NO DATE OF BIRTH IS UNDERAGE, WHATEVER THE RANK (450). */
  if (!s.has(ALL) || s.has(TWELVE) || s.has(FIFTEEN) || s.video(V18) || !s.video(V0)) bad.push('a student with no date of birth is not shown only the unrated');
  s = look(null, 'nobody');
  if (!s.has(ALL) || s.has(TWELVE) || s.has(FIFTEEN) || s.video(V18)) bad.push('a signed-out visitor is not shown only the unrated');
  s = look({ name: 'Nia Parent', personId: 'P-N', role: 'client', roles: ['client'], rank: 'client', token: 'tk4', profile: {} }, 'a client with no date of birth');
  if (!s.has(ALL) || s.has(TWELVE) || s.video(V18)) bad.push('a client with no date of birth is shown a rated reel or video');
  s = look({ name: 'Cal Parent', personId: 'P-C', role: 'client', roles: ['client'], rank: 'client', token: 'tk3', profile: { dob_d: '2', dob_m: '3', dob_y: String(y - 30) } }, 'an adult');
  if (!s.has(TWELVE) || !s.has(FIFTEEN) || !s.video(V18)) bad.push('an adult is not shown the 12+, 15+ reels and the 18 video');
  if (!/class="media-age-badge[^"]*"[^>]*>15\+</.test(s.html)) bad.push('the 15+ reel has no "15+" badge for the adult');
  s = look({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], rank: 'admin', token: 'tk', profile: { dob_y: String(y - 9) } }, 'the admin');
  if (!s.has(FIFTEEN) || !s.video(V18)) bad.push('the admin is not shown everything');
  if (!col().querySelector('.media-list') || col().querySelector('.media-list').textContent.indexOf('15+') === -1) bad.push('the admin\'s list does not say 15+');
  t.DATA().media = [];
  t.USER(null);
  return bad;
});

/* "I NEED TO SEND ASH THE WORK ERNIE DID LAST WEEK" (378): Send last week on a parent's card, for an admin, and on nothing else. */
check('an admin has "Send last week" on a parent\'s card only, and pressing it posts digestSendNow and toasts the reply; nobody else has it', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'digestSendNow'
    ? { success: true, said: 'Sent to Carl — 32 questions (12–18 Oct)', sent: 1, questions: 32 } : { success: true } });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  if (!t.accountPages) return ['accountPages_ is not exported — cannot check the people column'];
  t.DATA().everyone = [{ personId: 'P-E1', title: 'Evie', handle: 'evie_calm31', role: 'Student', image: '' },
                       { personId: 'P-E2', title: 'Carl Handled', handle: 'carl_kind32', role: 'Client', image: '' }];
  const page = name => t.accountPages().find(h => h.indexOf('>' + name + '<') !== -1) || '';
  const door = /data-do="digest-send-now"/;
  t.USER({ name: 'Tia Tutor', personId: 'P-T', role: 'tutor', roles: ['tutor'], token: 'tk2' });
  if (door.test(t.accountPages().join(''))) bad.push('a tutor is offered Send last week');
  sent.length = 0;
  const fake = d.createElement('button'); fake.setAttribute('data-id', 'P-E2');
  try { t.ACTIONS['digest-send-now'](fake); } catch (e) {}
  await wait(150);
  if (sent.some(b => b.action === 'digestSendNow')) bad.push('a tutor pressing Send last week posted digestSendNow');
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  const carl = page('Carl Handled');
  if (!/data-do="digest-send-now" data-id="P-E2"/.test(carl) || !/aria-label="Send last week/.test(carl)) bad.push('the parent\'s card has no "Send last week" tile for the admin');
  if (door.test(page('Evie'))) bad.push('a student\'s card offers Send last week');
  if (door.test(t.accountPages().find(h => !/data-do="person-add"/.test(h)) || '')) bad.push('the admin\'s own card offers Send last week');
  try { t.repaint(true); t.go('parents', false, true); w.paint('parents'); } catch (e) { bad.push('drawing the people column threw: ' + e.message); }
  await wait(200);
  const tile = d.querySelector('#s-parents [data-do="digest-send-now"][data-id="P-E2"]');
  if (!tile) return bad.concat(['the Send last week tile is not drawn on the people column']);
  sent.length = 0;
  t.ACTIONS['digest-send-now'](tile);
  await wait(300);
  const post = sent.find(b => b.action === 'digestSendNow');
  if (!post || post.targetId !== 'P-E2' || post.personId !== 'P-AD') bad.push('pressing it posted ' + JSON.stringify(post));
  const said = String((d.getElementById('toast') || {}).textContent || '');
  if (said.indexOf('Sent to Carl — 32 questions (12–18 Oct)') === -1) bad.push('the toast says "' + said + '", not the server\'s sentence');
  t.USER(null);
  return bad;
});

/* "ADMIN SHOULD BE ABLE TO SEE EACH PERSON'S PIN" (454): fetched on the tap, one line on the card, gone on a second tap or on leaving. */
check('an admin\'s "Show PIN" posts pinShow, shows one line on that card, hides it on a second tap and on leaving the column; a tutor has no tile', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'pinShow'
    ? (b.targetId === 'P-E2' ? { success: true, pin: '0000' } : { success: true, pin: '', said: 'No PIN' }) : { success: true } });
  await wait(400);
  const t = w.__t, d = w.document, bad = [];
  if (!t.accountPages) return ['accountPages_ is not exported — cannot check the people column'];
  t.DATA().everyone = [{ personId: 'P-E1', title: 'Evie', handle: 'evie_calm31', role: 'Student', image: '' },
                       { personId: 'P-E2', title: 'Carl Handled', handle: 'carl_kind32', role: 'Client', image: '' }];
  t.USER({ name: 'Tia Tutor', personId: 'P-T', role: 'tutor', roles: ['tutor'], token: 'tk2' });
  if (/data-do="pin-show"/.test(t.accountPages().join(''))) bad.push('a tutor is offered Show PIN');
  t.USER({ name: 'Ada Admin', personId: 'P-AD', role: 'admin', roles: ['admin'], token: 'tk' });
  if (/data-do="pin-show"/.test(t.accountPages().find(h => !/data-do="person-add"/.test(h)) || '')) bad.push('the admin\'s own card offers Show PIN');
  if (JSON.stringify(t.DATA()).indexOf('0000') !== -1) bad.push('a PIN is in DATA before anybody asked');
  /* EVIE ON STUDENTS, CARL ON PARENTS (453). */
  try { t.repaint(true); w.paint('students'); t.go('parents', false, true); w.paint('parents'); } catch (e) { bad.push('drawing the people columns threw: ' + e.message); }
  await wait(200);
  const tile = id => d.querySelector('#s-students [data-do="pin-show"][data-id="' + id + '"], #s-parents [data-do="pin-show"][data-id="' + id + '"]');
  if (!tile('P-E2') || !tile('P-E1')) return bad.concat(['the Show PIN tile is not drawn on every other person\'s card']);
  const lines = () => [...d.querySelectorAll('#s-students .person-pin, #s-parents .person-pin')];
  sent.length = 0;
  t.ACTIONS['pin-show'](tile('P-E2'));
  await wait(300);
  const post = sent.find(b => b.action === 'pinShow');
  if (!post || post.targetId !== 'P-E2' || post.personId !== 'P-AD') bad.push('Show PIN posted ' + JSON.stringify(post));
  const one = lines();
  if (one.length !== 1 || one[0].textContent.trim() !== 'PIN 0000') bad.push('after the tap the card shows ' + JSON.stringify(one.map(n => n.textContent)));
  else if (one[0].previousElementSibling !== tile('P-E2').closest('.tile-row')) bad.push('the PIN line is not under that card\'s own tile row');
  if (JSON.stringify(t.DATA()).indexOf('0000') !== -1) bad.push('the PIN was kept in DATA');
  try { if (Object.keys(w.localStorage).some(k => String(w.localStorage.getItem(k)).indexOf('0000') !== -1)) bad.push('the PIN was stored on the device'); } catch (e) {}
  sent.length = 0;
  t.ACTIONS['pin-show'](tile('P-E2'));
  await wait(150);
  if (lines().length) bad.push('a second tap left the PIN showing');
  if (sent.some(b => b.action === 'pinShow')) bad.push('the second tap asked the server again instead of hiding');
  t.ACTIONS['pin-show'](tile('P-E1'));
  await wait(300);
  if ((lines()[0] || {}).textContent !== 'No PIN') bad.push('an empty PIN cell shows ' + JSON.stringify(lines().map(n => n.textContent)) + ', not "No PIN"');
  try { t.go('feed', false, true); } catch (e) {}
  await wait(150);
  if (d.querySelectorAll('.person-pin').length) bad.push('leaving the column left the PIN line on the card');
  t.USER(null);
  return bad;
});

check('every pager counts the pages its screen actually draws', async () => {
  /* ---------- THE BUG THIS IS WRITTEN FOR, AND IT HAS HAPPENED THREE TIMES § */
  const { w } = boot();
  await wait(400);
  if (!w.__t.PAGER) return ['PAGER is not exported — cannot check the pagers'];

  /* SIGNED IN, because half these columns draw a sign-in card and nothing else when signed out —
     a roster of one page agrees with anything and proves nothing. */
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  /* AND REPAINTED, BECAUSE THAT IS WHAT SIGNING IN DOES. § */
  if (typeof w.__t.repaint === 'function') w.__t.repaint(true);
  await wait(200);

  const bad = [];
  /* ---------- AND IT WALKED `PAGER`, SO A SCREEN WITH NO ENTRY WAS INVISIBLE TO IT § */
  const ids = (w.__t.TABS || []).map(t => t.id);
  if (!ids.length) return ['TABS is empty — cannot tell which screens exist'];
  for (const id of ids) {
    try { w.__t.go(id, false, true); } catch (e) { bad.push(id + ' threw on go(): ' + e.message); continue; }
    await wait(120);
    const el = w.document.getElementById('s-' + id);
    if (!el) { bad.push(id + ' has no #s-' + id + ' to draw into'); continue; }
    const drawn = el.querySelectorAll('.page').length;
    /* A SCREEN THAT DRAWS PAGES AND HAS NO PAGER gets no `paged` class and no axis — see the note above. § */
    if (!w.__t.PAGER[id]) {
      if (drawn > 1) {
        bad.push(id + ': ' + drawn + ' pages drawn and no PAGER entry \u2014 so the screen gets no '
                    + 'axis and none of them can be reached');
      }
      continue;
    }
    let says;
    /* THE ONE DEFINITION, asked of the app rather than reproduced here. § */
    try { says = w.__t.pageCount(id); }
    catch (e) { bad.push(id + ' pager threw: ' + e.message); continue; }
    /* A SCREEN THAT DRAWS NO PAGES IS NOT PAGED AT ALL and its pager saying nothing is correct. */
    if (!drawn && !says) continue;
    /* ---------- A WINDOWED SCREEN HOLDS FEWER ELEMENTS THAN IT HAS PAGES § */
    const keep = (w.__t.PAGE_KEEP && w.__t.PAGE_KEEP[id]) || 0;
    const want = keep ? Math.min(says, keep + (w.__t.STUFF_WIN || 0)) : says;
    if (drawn !== want) {
      bad.push(id + ': ' + drawn + ' page' + (drawn === 1 ? '' : 's') + ' drawn, pager counts '
                  + says + (want === says ? '' : ' (window holds ' + want + ')')
                  + ' \u2014 so the header and the screen disagree and moving down will '
                  + 'stop early or refuse');
    }
  }
  return bad;
});

check('an admin still has every action on a session after the move to tiles', async () => {
  /* ---------- THE JOURNEY I PROMISED BEFORE MOVING THEM § */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.jobAdmin !== 'function') return [];   // only checkable where it is exported

  const bad = [];
  const job = { id: 'J-1', price: 40, slots: [] };
  const has = (html, act) => html.indexOf('data-do="' + act + '"') !== -1;

  /* A REQUEST NOBODY HAS ANSWERED: both halves of the decision, and the way to end it. */
  const asking = w.__t.jobAdmin(job, 'application', false);
  ['job-answer', 'job-delete'].forEach(a => {
    if (!has(asking, a)) bad.push('an unanswered request has no `' + a + '`');
  });
  if (has(asking, 'job-paid')) {
    bad.push('an unaccepted booking offers `job-paid` — the backend refuses that, so it must not be '
           + 'offered');
  }
  /* BOTH HALVES, not one. They are one decision and a tile row with only Accept on it is a trap. */
  if ((asking.match(/data-do="job-answer"/g) || []).length < 2) {
    bad.push('only one half of Accept/Decline is there');
  }

  /* ACCEPTED: paying by hand becomes possible — a form on the receipt, not a tile opening a sheet (owner, 7 Nov). */
  const agreed = w.__t.jobAdmin(job, 'application', true);
  if (has(agreed, 'job-paid')) bad.push('Mark paid is a tile again — it is the form on the receipt (`jobPaidForm_`)');
  if (typeof w.__t.jobPaid === 'function') {
    const paid = w.__t.jobPaid(job, 'application', true);
    if (!has(paid, 'job-paid') || paid.indexOf('paid-how') === -1) bad.push('an accepted booking has no Mark paid form with its how box');
    if (w.__t.jobPaid(job, 'application', false)) bad.push('an unaccepted booking offers the Mark paid form');
  }
  if (!has(agreed, 'job-delete')) bad.push('an accepted booking has no `job-delete`');

  /* A RUNNING SESSION: nothing to answer, nothing to mark, still endable. */
  const live = w.__t.jobAdmin(job, 'booked', true);
  if (has(live, 'job-answer')) bad.push('a booked session still offers `job-answer`');
  if (!has(live, 'job-delete')) bad.push('a booked session cannot be deleted');

  /* THEY ARE TILES NOW — and the ROW is the receipt's foot, built once in `jobPage_`, so this
     hands back marks rather than a row of its own. A row here would be a row inside a row. */
  if (asking.indexOf('class="tile') === -1) {
    bad.push('the admin actions are not tiles — they should look like every other thing\'s actions');
  }
  if (asking.indexOf('tile-row') !== -1) {
    bad.push('`jobAdminTiles_` wraps its own `.tile-row` again — the row is the receipt\'s foot');
  }
  if (/<button class="btn/.test(asking)) {
    bad.push('a plain `.btn` came back in among the tiles');
  }
  return bad;
});

/* ---------- WHO IS SHOWN WHICH FIGURE, AND WHERE THE ACTIONS ARE § */
check('each person sees their own figure on a session, and its tiles are on the paper', async () => {
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.jobMoney !== 'function' || typeof w.__t.jobPage !== 'function') {
    return ['`jobMoney_` or `jobPage_` is not exported, so who sees which figure cannot be checked'];
  }
  const bad = [];
  const job = {
    id: 'J-M', jobId: 'J-M', kind: '', subject: 'Maths', level: 'GCSE', price: 270,
    tutorPay: 189, adminKeeps: 81, tutor: 'Ada Tutor', location: 'Colliers Wood Library',
    dates: '06/10/26, 13/10/26', startDate: '06/10/26', endDate: '13/10/26',
    slots: [{ n: 1, client: 'Pat Parent', status: 'Booked' }],
    tutorSlots: [{ key: 'a', name: 'Ada Tutor', status: 'Confirmed' }], events: [],
  };
  const doc = h => { const d = w.document.createElement('div'); d.innerHTML = h; return d; };
  /* THE MONEY LINES: the total bar, or an admin's Client pays / earns lines (the form's own, owner 8 Nov). */
  const totals = d => [...d.querySelectorAll('.rc .rc-total, .rc .rc-pays, .rc .rc-earn')]
    .map(r => r.querySelector('.bk-k').textContent.trim() + ' ' + r.querySelector('.bk-t').textContent.trim());

  /* THE CLIENT: what they pay, and not one other figure. */
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const c = totals(doc(w.__t.jobPage(job)));
  if (c.length !== 1 || !/270\.00/.test(c[0])) bad.push('the client sees ' + JSON.stringify(c) + ', wanted their £270.00 alone');
  if (c.some(x => /189|81\./.test(x))) bad.push('the client is shown what the tutor or the admin takes: ' + JSON.stringify(c));

  /* THE TUTOR: what they earn IN PLACE OF the client total — never beside it. */
  w.__t.USER({ name: 'Ada Tutor', personId: 'P2', role: 'tutor', roles: ['tutor'] });
  const t = totals(doc(w.__t.jobPage(job)));
  if (t.length !== 1 || !/^YOU EARN|^You earn/i.test(t[0]) || !/189\.00/.test(t[0])) {
    bad.push('the tutor sees ' + JSON.stringify(t) + ', wanted "You earn £189.00" alone');
  }
  if (t.some(x => /270\.00/.test(x))) bad.push('the tutor is shown the client\'s total: ' + JSON.stringify(t));
  /* A BLANK `tutor_pay` IS A DASH, NOT A NOUGHT — every job before the phone sent it. */
  const unpaid = w.__t.jobMoney(Object.assign({}, job, { tutorPay: '' }));
  if (unpaid.total !== '—') bad.push('an unrecorded tutor pay reads ' + JSON.stringify(unpaid.total) + ', wanted a dash');

  /* A SECOND TUTOR WHO HAS ONLY APPLIED is on `tutorSlots` and not in `j.tutor`, which is the first
     name on the roster — so a test of `j.tutor` alone would hand them the client's line. */
  w.__t.USER({ name: 'Ben Tutor', personId: 'P3', role: 'tutor', roles: ['tutor'] });
  const t2 = totals(doc(w.__t.jobPage(Object.assign({}, job, {
    tutorSlots: job.tutorSlots.concat([{ key: 'b', name: 'Ben Tutor', status: 'Applied' }]) }))));
  if (t2.length !== 1 || !/you earn/i.test(t2[0]) || t2.some(x => /270\.00/.test(x))) {
    bad.push('a tutor who has applied but is not first on the roster sees ' + JSON.stringify(t2) + ', wanted "You earn"');
  }

  /* THE ADMIN: all three, as rows of the paper — no block under it. */
  w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
  const ad = doc(w.__t.jobPage(job));
  const a = totals(ad);
  const want = [/client pays.*270\.00/i, /tutor earns.*189\.00/i, /admin earns.*81\.00/i];
  if (a.length !== 3 || want.some((re, i) => !re.test(a[i] || ''))) {
    bad.push('the admin sees ' + JSON.stringify(a) + ', wanted Client pays £270.00, Tutor earns £189.00, Admin earns £81.00');
  }
  if (ad.querySelector('.money-note')) bad.push('a money block still floats under the paper');
  /* A WAITING LIST'S `price` IS ONE SEAT, so the admin's line must not call it what the client pays. */
  const wl = totals(doc(w.__t.jobPage(Object.assign({}, job, { kind: 'waitlist' }))));
  if (!/^each seat pays/i.test(wl[0] || '')) bad.push('an admin reading a waiting list sees ' + JSON.stringify(wl[0]) + ', wanted "Each seat pays" over the per-seat figure');

  /* THE TILES ARE THE RECEIPT'S FOOT. Every action on the page is inside `.rc`, and a session
     already paid for offers no Pay. */
  const loose = [...ad.querySelectorAll('[data-do]')].filter(x => !x.closest('.rc'));
  if (loose.length) bad.push('actions float outside the paper: ' + loose.map(x => x.dataset.do).join(', '));
  if (!ad.querySelector('.rc .rc-tiles [data-do="job-delete"]')) bad.push('the admin\'s tiles are not on the receipt\'s foot');
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const paid = doc(w.__t.jobPage(job));
  if (paid.querySelector('[data-do="job-pay"]')) bad.push('a session already booked and paid offers Pay');
  const owed = doc(w.__t.jobPage(Object.assign({}, job, { slots: [{ n: 1, client: 'Pat Parent', status: 'Agreed' }] })));
  if (!owed.querySelector('.rc .rc-tiles [data-do="job-pay"]')) bad.push('an accepted, unpaid session has no Pay on its paper');

  /* AND THE FORM: Client pays, Tutor earns, Admin earns, the saved booking's three (owner, 8 Nov: the form is the record); no charged, venue, card fees or net profit (29 Oct). */
  if (typeof w.__t.formMoney === 'function' && typeof w.bookMoney_ === 'function') {
    const earn = w.bookMoney_({ tutorPay: 90, profit: 12, venue: 0 });
    const L = { total: earn.charged, tutorPay: 90, profitTotal: 12, earn };
    w.__t.USER({ name: 'Halex Dias', personId: 'PA', role: 'admin', roles: ['admin'] });
    const fa = w.__t.formMoney(L);
    if (fa.label !== 'Client pays' || (fa.more || []).map(x => x.k).join() !== 'Tutor earns,Admin earns' || fa.say) {
      bad.push('an admin pricing a booking is shown ' + JSON.stringify(fa) + ', wanted Client pays, Tutor earns, Admin earns');
    }
    w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
    const fp = w.__t.formMoney(L);
    if (fp.label || (fp.more || []).length || fp.say) bad.push('a client pricing the form is shown an admin\'s figure: ' + JSON.stringify(fp));
  } else bad.push('formMoney_ or bookMoney_ is not reachable, so the admin\'s figure was not checked');
  return bad;
});

check('an admin\'s booking form ends on Discount, one percentage, and Client pays, lines like the ones above, and a parent sees neither', async () => {
  /* ---------- THE OWNER'S NOTES OF 29 OCT ON THE BOOKING WIDGET (docs/history/530) § */
  const { w, sent } = boot();
  await wait(300);
  if (!w.__t.paper || !w.__t.DATA) return ['bookBreakdown or DATA is not exported — cannot check the form'];
  const bad = [];
  const ddmmyy = d => [d.getDate(), d.getMonth() + 1, d.getFullYear()].map(x => String(x).padStart(2, '0')).join('/');
  const from = new Date(Date.now() + 7 * 864e5), to = new Date(Date.now() + 28 * 864e5);
  w.__t.DATA().intervals = (w.__t.DATA().intervals || []).concat([{ label: 'Money test term', term: 'Money test term',
    startDate: ddmmyy(from), endDate: ddmmyy(to), lastSun: ddmmyy(to), weeks: 3 }]);
  const seed = extra => {
    const B = w.__t.BOOKING;
    Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
    Object.assign(B, { how: 'Instant class', level: 'GCSE', loc: 'Colliers Wood Library', subjects: ['Maths'],
      /* FOUR SEATS, THE ROOM THEIRS, AND @FAMILY. KEEPING HALF OF EACH EXTRA SEAT: room under the cap for 30% (owner, 8 Nov: a discount stops where admin would go below 0). */
      n: '4', hosting: 'Yes', slots: ['m16', 'm17'],
      /* A TERM OF ITS OWN, a week from today for three weeks, so a journey run next month still has Mondays to price. */
      interval: ['Money test term'], discValue: '30' }, extra || {});
  };
  const doc = h => { const d = w.document.createElement('div'); d.innerHTML = h; return d; };
  const rowsOf = d => [...d.querySelectorAll('.bk > .bk-row')];
  const kOf = r => ((r.querySelector('.bk-k') || {}).textContent || '').trim();
  const tOf = r => ((r.querySelector('.bk-t') || {}).textContent || '').trim();
  const gbp = n => '£' + (Number(n) || 0).toFixed(2);

  w.__t.USER({ name: 'Test Admin', personId: 'PA', role: 'admin', roles: ['admin'] });
  (w.__t.DATA().constants = w.__t.DATA().constants || {}).vars = Object.assign({}, (w.__t.DATA().constants || {}).vars || {}, { c: 0.5, B: 1, card_fee_pct: 0, card_fee_fixed: 0 });
  seed({ discValue: '' });
  const full = (w.__t.price() || {}).total;
  seed();
  const off = (w.__t.price() || {}).total;
  if (!(full > 0)) return bad.concat('the admin\'s booking did not price, so NOTHING was checked: ' + JSON.stringify(full));
  if (Math.round(off * 100) !== Math.round(full * 70)) bad.push('30 in Discount took ' + full + ' to ' + off + ', wanted 30% off: ' + Math.round(full * 70) / 100);
  const a = doc(w.__t.paper());
  const rows = rowsOf(a), keys = rows.map(kOf);
  /* ONE DISCOUNT LINE: a number box and nothing else — no type, no "How much", no code, no "Absorbed by". */
  const disc = rows.filter(r => r.matches('.rc-disc, .rc-disc-more') || kOf(r) === 'Discount');
  if (disc.length !== 1) bad.push('the discount is ' + disc.length + ' lines: ' + JSON.stringify(disc.map(kOf)));
  const box = disc[0] && disc[0].querySelector('.bk-v input[data-do="book-disc"][data-field="discValue"]');
  if (!box || box.type !== 'number' || disc[0].querySelectorAll('select, input').length !== 1) bad.push('the Discount line is not one number box');
  else if (box.value !== '30') bad.push('the Discount box reads ' + JSON.stringify(box.value) + ', wanted 30');
  ['How much', 'Code or reason', 'Absorbed by'].forEach(k => { if (keys.indexOf(k) !== -1) bad.push('the form still has a "' + k + '" line'); });
  /* CLIENT PAYS IS THE NEXT LINE, an ordinary row like the ones above — not the total bar, and nothing under it. */
  const pays = disc[0] && disc[0].nextElementSibling;
  if (!pays || kOf(pays) !== 'Client pays') bad.push('the line under Discount is ' + JSON.stringify(pays && kOf(pays)) + ', wanted Client pays');
  else {
    if (pays.classList.contains('rc-total') || pays.classList.contains('rc-more')) bad.push('Client pays is still drawn as the total bar, not as a line like the ones above');
    if (['bk-n', 'bk-k', 'bk-v', 'bk-m', 'bk-r', 'bk-t'].some(c => !pays.querySelector('.' + c))) bad.push('Client pays does not have the six cells every line above has');
    if (tOf(pays) !== gbp(off)) bad.push('Client pays reads ' + JSON.stringify(tOf(pays)) + ', wanted ' + gbp(off));
    if (tOf(disc[0]) !== '− ' + gbp(full - off)) bad.push('the Discount line\'s figure reads ' + JSON.stringify(tOf(disc[0])) + ', wanted − ' + gbp(full - off));
    /* THEN WHO EARNS WHAT, the saved booking's lines too (owner, 8 Nov), and nothing else. */
    const under = []; for (let r = pays.nextElementSibling; r && r.matches('.bk-row, .bk-say'); r = r.nextElementSibling) under.push(kOf(r));
    if (under.join() !== 'Tutor earns,Admin earns') bad.push('under Client pays: ' + JSON.stringify(under) + ', wanted Tutor earns, Admin earns');
  }
  if (a.querySelector('.rc-total, .rc-more, .rc-money, .rc-money-say')) bad.push('the admin\'s form still draws a total bar or the money block under it');
  ['Charged', 'Tutor payout', 'Card fees', 'Net profit'].forEach(k => {
    if (keys.some(x => x === k || x.indexOf(k + ' ') === 0)) bad.push('the admin\'s form still has a "' + k + '" line');
  });
  /* NO FORMAT, PRACTICAL OR TRIP LINE (463): trips and practicals are shop items. */
  ['Format', 'Practical', 'Trip', 'Materials', 'Tickets', 'Travel'].forEach(k => {
    if (keys.indexOf(k) !== -1) bad.push('the form still has a "' + k + '" row (463)');
  });
  /* WHAT GOES ON THE WIRE: the price the client pays after the discount, the discount as a percentage the business absorbs. */
  try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); } catch (e) { bad.push('the admin sending threw: ' + e.message); }
  await wait(250);
  const aj = sent.find(x => x.action === 'createJob');
  if (!aj) bad.push('the admin\'s booking was never sent');
  else {
    if (Math.round(Number(aj.price) * 100) !== Math.round(off * 100)) bad.push('the admin\'s booking sent price ' + aj.price + ', wanted what the client pays, ' + off);
    if (aj.discountType !== '%' || aj.discountValue !== '30' || aj.discountAbsorbedBy !== 'Business' || aj.discountCode) {
      bad.push('the admin\'s booking sent the discount as ' + JSON.stringify([aj.discountType, aj.discountValue, aj.discountAbsorbedBy, aj.discountCode]));
    }
  }
  sent.length = 0;

  /* THE PARENT, WITH THE ADMIN'S DISCOUNT STILL IN THE DRAFT. */
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  seed();
  const p = doc(w.__t.paper());
  if (p.querySelector('.rc-pays, .rc-money, .rc-money-say')) bad.push('a parent is shown the admin\'s Client pays line');
  /* ONLY AN ADMIN SETS A DISCOUNT (owner, 7 Nov): the parent sees the line greyed and empty. */
  const pBox = p.querySelector('.rc-disc input[data-field="discValue"]');
  if (pBox && (!pBox.disabled || pBox.value)) bad.push('a parent can type a discount, or sees the admin\'s: ' + pBox.value);
  const pCost = [...p.querySelectorAll('.rc-total .bk-t')].map(x => x.textContent);
  if (pCost.length !== 1 || /\u2212/.test(pCost[0]) || pCost[0] === gbp(off)) bad.push('a parent\'s COST is ' + JSON.stringify(pCost) + ', which carries the admin\'s discount');
  try { w.__t.ACTIONS['book-send']({ disabled: false, dataset: {} }); } catch (e) { bad.push('sending threw: ' + e.message); }
  await wait(250);
  const job = sent.find(x => x.action === 'createJob');
  if (!job) bad.push('the parent\'s booking was never sent');
  else {
    if (job.discountType || job.discountValue) bad.push('a parent\'s booking sent discount fields: ' + job.discountType + ' ' + job.discountValue);
    ['format', 'practicalId', 'tripId', 'materialsCost', 'ticketsCost'].forEach(k => {
      if (k in job) bad.push('the job still sends ' + k + ' (463)');
    });
  }
  return bad;
});

check('the camera card starts itself and offers the gallery', async () => {
  /* ---------- THIS JOURNEY HAS OUTLIVED TWO OF ITS OWN SUBJECTS § */
  const { w } = boot();
  await wait(300);
  if (typeof w.__t.card !== 'function') return [];      // only checkable where the card is exported

  const bad = [];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const html = w.__t.card();

  if (!/id="cam-view"/.test(html)) bad.push('the camera card has no viewfinder');
  if (!/id="cam-pick"/.test(html)) bad.push('there is no way to pick a picture from the gallery');
  /* `image/*` STILL, AND NOW `video/*` BESIDE IT — a post takes clips as well as photographs. The
     test reads the attribute rather than matching it whole, so the order the two are written in is
     not a fault. */
  const acc = (html.match(/id="cam-pick"[^>]*accept="([^"]*)"/) || [])[1] || '';
  if (!/type="file"/.test(html) || !/image\/\*/.test(acc)) {
    bad.push('the gallery control is not a file input that accepts pictures');
  }
  /* `capture` WOULD REOPEN THE CAMERA, which is the thing the Photos button exists to be an
     alternative to — a one-word attribute that quietly turns the gallery back into a viewfinder. */
  if (/\bcapture\b/.test(html)) bad.push('the gallery control carries `capture`, so it opens the camera');

  /* THE START BUTTON IS ALLOWED TO EXIST AND NOT TO SHOW. It is the way back from a refused prompt.
     What must never come back is it being on the normal path — so if it is there, it is hidden. */
  const on = /<button[^>]*id="cam-on"[^>]*>/.exec(html);
  if (on && !/\bhidden\b/.test(on[0])) {
    bad.push('the camera card still shows a start button — it is meant to start on arrival');
  }
  if (/Turn the camera on/i.test(html)) bad.push('`Turn the camera on` is back on the card');
  /* ---------- `Write a post` IS A TILE NOW, AND WHAT THIS ASSERTS IS THE OPPOSITE § */
  if (!/Write a post/i.test(html)) bad.push('`Write a post` is gone from the camera card again');
  if (!/data-do="new-post"/.test(html)) {
    bad.push('`Write a post` is on the card with no `data-do="new-post"`, so nothing opens it');
  }

  /* SIGNED OUT THERE IS NO VIEWFINDER AT ALL. `feedCamCard_` renders a sentence instead, and a
     camera that starts for somebody who is not signed in is a permission prompt with no purpose. */
  w.__t.USER(null);
  if (typeof w.__t.makeScreen === 'function') {
    const out = String(w.__t.makeScreen() || '');
    if (/id="cam-view"/.test(out)) bad.push('the viewfinder is drawn for somebody who is not signed in');
  }
  return bad;
});

/* ---------- THE CAMERA ASKS FOR NOTHING UNTIL SOMEBODY SWIPES UP TO IT § */
/* ---------- WHAT `doGet` SENDS FOR A POST NOBODY HAS REACTED TO § */
const NO_REACTIONS_ = () => ({ emoji: ['👍', '❤️', '😂', '😮', '👏', '🎉'], counts: [0, 0, 0, 0, 0, 0],
                               total: 0, yours: '', by: [] });
const camBoot_ = o => {
  const gum = { asks: 0, open: 0, hold: null, tracks: [] };
  /* HOW MANY OPEN STREAMS HAVE THEIR TRACK SWITCHED ON — a parked one is open and dark (427). */
  gum.live = () => gum.tracks.filter(t => t.on && t.enabled !== false).length;
  const p = payload();
  /* TWO POSTS UNDER THE CAMERA, because the front door is "the newest post" and `payload()` has
     none — with no post below it the camera is the last page, and the column cannot open past it. */
  if (!o.noPosts) {
    p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '',
      image: '', media: [], caption: 'Post ' + i, body: '', location: '', when: '0' + i + '/09/2026',
      at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false,
      reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }));
  }
  const b = boot({ payload: p, before: w => {
    try { if (o.user) w.localStorage.setItem('familyUser', JSON.stringify(o.user)); } catch (e) {}
    /* WHAT THE DEVICE KEPT FROM AN EARLIER VISIT — a reload is a new window with the same storage. */
    try { Object.keys(o.store || {}).forEach(k => w.localStorage.setItem(k, o.store[k])); } catch (e) {}
    if (o.perm) {
      Object.defineProperty(w.navigator, 'permissions', { configurable: true, value: {
        query: () => Promise.resolve({ state: o.perm }) } });
    }
    const stream = () => {
      gum.open++;
      const track = { kind: 'video', on: true, enabled: true,
        stop() { if (this.on) { this.on = false; gum.open--; } } };
      gum.tracks.push(track);
      return { getTracks: () => [track], getVideoTracks: () => [track] };
    };
    Object.defineProperty(w.navigator, 'mediaDevices', { configurable: true, value: {
      getUserMedia: () => {
        gum.asks++;
        if (o.refuse) return Promise.reject(Object.assign(new Error('refused'), { name: 'NotAllowedError' }));
        if (o.slow) return new Promise(ok => { gum.hold = () => ok(stream()); });
        return Promise.resolve(stream());
      },
      enumerateDevices: () => Promise.resolve([]),
    } });
  } });
  b.gum = gum;
  b.at = () => (b.w.__t && typeof b.w.__t.AT === 'function' ? b.w.__t.AT() : '?');
  b.page = () => (b.w.__t.PAGE() || {}).feed;
  b.cam = () => (typeof b.w.feedCamAt_ === 'function' ? b.w.feedCamAt_() : -1);
  return b;
};
/* PAST `afterSlide_`'s 300ms and any settle, which is when `goPage` runs `feedCamWatch_`. */
const CAM_SLIDE = 700;
/* AND LONGER ONLY WHEN THE ANSWER IS NOT IN YET -- for the waits that expect the camera TO be asked. § */
const camAsked_ = async pred => { await wait(CAM_SLIDE); for (let i = 0; i < 40 && !pred(); i++) await wait(100); };

