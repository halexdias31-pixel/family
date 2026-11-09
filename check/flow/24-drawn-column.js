/* ---------- AND A PHONE SIGNED IN BEFORE THE MOVE LEARNS IT ON ITS NEXT OPEN, ONCE § */
check('a phone signed in before her handle moved takes the new one from myProfile and says so once', async () => {
  let b;
  try { b = movedWorld_(); } catch (e) { return ['the real backend could not be built — ' + e.message]; }
  const signed = b.post({ action: 'verifyLogin', email: 'ej2345', name: 'ej2345', pin: '0000' });
  if (!signed.success) return ['she could not sign in on the real backend, so NOTHING was asked — ' + JSON.stringify(signed).slice(0, 200)];
  const stale = Object.assign(JSON.parse(JSON.stringify(signed)), { handle: 'ella_kind42', friends: 'ab_kind11' });
  const bad = [];
  const toastsIn = win => { const said = []; const obs = new win.MutationObserver(() => {
    const el = win.document.getElementById('toast'); if (el && el.textContent) said.push(el.textContent); });
    obs.observe(win.document.body, { childList: true, subtree: true, characterData: true }); return said; };
  const first = boot({ payload: b.get({ token: signed.token }), reply: body => b.post(body),
    before: win => win.localStorage.setItem('familyUser', JSON.stringify(stale)) });
  const said1 = toastsIn(first.w);
  for (let k = 0; k < 80 && !first.w.__t; k++) await wait(100);
  const t = first.w.__t;
  if (!t) return ['the app did not finish loading'];
  for (let k = 0; k < 40 && (t.whoami() || {}).handle !== 'ej2345'; k++) await wait(100);
  const u = t.whoami() || {};
  if (u.handle !== 'ej2345') bad.push('the phone still calls her @' + u.handle + ' after myProfile — a moved handle stays stale for thirty days');
  if (u.friends !== 'ab3456') bad.push('the phone kept the old friends list ' + JSON.stringify(u.friends) + ' — its next save would post names nobody has');
  let said = {};
  try { said = t.handleSaid(); } catch (e) {}
  if (!said || said.text !== 'You were @ella_kind42.' || said.pid !== 'P-EJ') bad.push('the line under her handle does not say who she was — ' + JSON.stringify(said));
  if (!said1.some(m => /Your handle is @ej2345 now/.test(m))) bad.push('nothing told her the new handle — toasts: ' + JSON.stringify(said1));
  /* THE NEXT OPEN, from what that one stored: nothing more to say. */
  let kept = '';
  try { kept = first.w.localStorage.getItem('familyUser'); } catch (e) {}
  const second = boot({ payload: b.get({ token: signed.token }), reply: body => b.post(body),
    before: win => { if (kept) win.localStorage.setItem('familyUser', kept); } });
  const said2 = toastsIn(second.w);
  for (let k = 0; k < 80 && !second.w.__t; k++) await wait(100);
  await wait(1200);
  if (said2.some(m => /Your handle is/.test(m))) bad.push('the next open said the new handle again — it is said once');
  if (first.errs.length || second.errs.length) bad.push('errors: ' + first.errs.concat(second.errs).slice(0, 3).join(' | '));
  return bad;
});

/* ---------- AFTER REVIEW, ROUND 1 (docs/history/342): the device's chips, and the two races § */
function movedWorld3_() {
  const b = movedWorld_();
  b.seed('people', [{ person_id: 'P-CD', role: 'student', first_name: 'Cy', last_name: 'Dunn', handle: 'cd4567',
    pin: '0000', verified: 'TRUE', listed: true, city: 'London', xp: 0, credits: 0, email: '' }]);
  return b;
}
/* SIGNED IN AS ELLA, THE APP OPEN, AND THE `myProfile` IT ASKED AT OPEN HELD until `release()`. */
async function heldProfileOpen_(b) {
  const signed = b.post({ action: 'verifyLogin', email: 'ej2345', name: 'ej2345', pin: '0000' });
  if (!signed.success) throw new Error('she could not sign in on the real backend');
  let release, held = null;
  const gate = new Promise(r => { release = r; });
  const reply = body => {
    if (body.action === 'myProfile' && !held) { held = b.post(body); return gate.then(() => held); }
    return b.post(body);
  };
  const { w, errs } = boot({ payload: b.get({ token: signed.token }), reply,
    before: win => { win.localStorage.setItem('familyUser', JSON.stringify(signed)); } });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  if (!w.__t) throw new Error('the app did not finish loading');
  for (let k = 0; k < 60 && !held; k++) await wait(100);
  if (!held) throw new Error('myProfile was never asked at open, so the race was NOT set up');
  return { w, t: w.__t, d: w.document, errs, release: () => release() };
}
const serverCell_ = (b, pid, col) => JSON.parse(b.ev('JSON.stringify(String(read(TAB.people).rows.find(r => r.person_id === '
  + JSON.stringify(pid) + ').' + col + ' || ""))'));
check('a myProfile asked at open and answered after a friend is added keeps the new friend', async () => {
  let b, o;
  try { b = movedWorld3_(); o = await heldProfileOpen_(b); } catch (e) { return [e.message]; }
  o.t.ACTIONS['friend-add-open']();
  await wait(100);
  const box = o.d.getElementById('fr-add');
  if (!box) return ['there is no Add a friend box, so the race was NOT set up'];
  box.value = 'cd4567';
  o.t.ACTIONS['friend-add']();
  for (let k = 0; k < 30 && serverCell_(b, 'P-EJ', 'friends').indexOf('cd4567') === -1; k++) await wait(100);
  const server = serverCell_(b, 'P-EJ', 'friends');
  if (server.indexOf('cd4567') === -1) return ['the friend was never saved on the server, so the race was NOT set up: ' + server];
  o.release(); await wait(1500);
  const u = o.t.whoami() || {};
  return String(u.friends) !== server ? ['the server has friends ' + JSON.stringify(server) + ' but after the reply asked at open landed the phone has ' + JSON.stringify(u.friends)] : [];
});

/* ---------- AFTER REVIEW, ROUND 2 (docs/history/342): A FIGURE NOBODY DRESSED KEEPS ITS FACE § */
check('a figure nobody dressed keeps its face when her handle moves: a phone that learns the move from myProfile', async () => {
  const bad = [];
  const faceIn = (w, packed, handle) => { const c = w.avatarConfig(packed, handle); return [c.skin, c.hairColour, c.hair, c.legs].join('/'); };
  /* THE MOVE, AS `renameHandles_` LEAVES IT: the old handle's look written into her blank cell. */
  let b;
  try { b = movedWorld3_(); } catch (e) { return ['the real backend could not be built — ' + e.message]; }
  const kept = JSON.parse(b.ev('JSON.stringify(handleFaceKept_(read(TAB.people), { avatar: "" }, "ella_kind42").avatar || "")'));
  if (!kept) return ['the server keeps no look for a blank cell, so the phone\'s half was NOT asked'];
  b.ev('(function () { const t = read(TAB.people); const r = t.rows.find(x => S(x.person_id) === "P-EJ"); setCell(t, r, "avatar", '
    + JSON.stringify(kept) + '); clearCache(); })()');
  const signed = b.post({ action: 'verifyLogin', email: 'ej2345', name: 'ej2345', pin: '0000' });
  if (!signed.success) return ['she could not sign in on the real backend — ' + JSON.stringify(signed).slice(0, 160)];
  const stale = Object.assign(JSON.parse(JSON.stringify(signed)), { handle: 'ella_kind42', avatar: '' });
  const one = boot({ payload: b.get({ token: signed.token }), reply: body => b.post(body),
    before: win => win.localStorage.setItem('familyUser', JSON.stringify(stale)) });
  for (let k = 0; k < 80 && !one.w.__t; k++) await wait(100);
  if (!one.w.__t) return ['the app did not finish loading'];
  for (let k = 0; k < 40 && (one.w.__t.whoami() || {}).handle !== 'ej2345'; k++) await wait(100);
  const u1 = one.w.__t.whoami() || {};
  if (u1.handle !== 'ej2345') bad.push('the phone never took the moved handle from myProfile, so the face was NOT asked');
  else if (faceIn(one.w, u1.avatar, u1.handle) !== faceIn(one.w, '', 'ella_kind42')) {
    bad.push('after myProfile moved her handle the phone draws her with ' + JSON.stringify(u1.avatar || '(a blank look)') + ' on @' + u1.handle
      + ' — a different figure from the one @ella_kind42 drew; the server kept ' + JSON.stringify(kept));
  }
  if (one.errs.length) bad.push('errors: ' + one.errs.slice(0, 3).join(' | '));
  return bad;
});

/* WHAT A FLICK CAN REACH IS DRAWN BEFORE IT GETS THERE — THE BUILDER'S OWN JOURNEYS (docs/history/341) § */
/* AT REST: the builder's list empty and everything booked for after a slide run — or the cap, and then the journey says it never came. § */
/* FOUR MINUTES, NOT ONE AND A HALF: under a load average of forty a jsdom fill of one boxing card took up to
   970ms, and forty-one of them is the Resources window alone. A builder that never finishes still fails. */
const aheadQuiet_ = async (t, cap) => {
  const t0 = Date.now();
  await wait(500);
  while (Date.now() - t0 < (cap || 240000)) {
    let q = false;
    try { q = t.quiet() && !t.aheadBusy(); } catch (e) { q = true; }
    if (q) { await wait(150); try { if (t.quiet() && !t.aheadBusy()) return true; } catch (e) { return true; } }
    await wait(150);
  }
  return false;
};
const aheadBoot_ = async (opts) => {
  const b = boot(Object.assign({ ahead: true, member: true }, opts || {}));
  for (let i = 0; i < 80 && !b.w.__t; i++) await wait(25);
  await wait(400);
  return b;
};
const SAM_ = { name: 'Sam Student', personId: 'P9', person_id: 'P9', role: 'student', roles: ['student'], token: 't-sam' };
/* A QUESTION ANSWERED ON THE RESOURCES COLUMN — the boxing shelf — so it has a window of results to fill;
   with nothing asked a finder is its question alone. */
const resAsk_ = w => {
  const R = findView_(w), S = w.__t.RES();
  const x = R.stuffItemsAll_().find(it => it.kind === 'boxer');
  if (!x) return false;
  S.filters.length = 0; S.filters.push({ field: 'shelf', value: x.shelf });
  w.paintFinder_('res');
  return w.document.querySelectorAll('#s-res > .page.is-res').length > 0;
};
const veiled_ = (w, col) => [...w.document.querySelectorAll('#s-' + col + ' .widget-slot[aria-busy]')]
  .filter(sl => sl.querySelector(':scope > .loading')).map(sl => sl.id);

check('the builder draws every stale column and every widget slot in the quiet, and never under a finger, a settle or a booked slide', async () => {
  /* THE RESOURCES IN THE PAYLOAD, so the second finder has a window to fill. */
  const p = await resPayload_();
  if (!p) return ['the resources payload could not be made — NOT checked'];
  const { w } = await aheadBoot_({ payload: p });
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadBusy !== 'function' || typeof t.aheadLog !== 'function') return ['the builder is not reachable — NOT checked'];
  if (!resAsk_(w)) return ['the Resources column has no boxing shelf to fill — NOT checked'];
  const r0 = w.performance.now();
  t.USER(SAM_); t.repaint();
  /* A FINGER DOWN FOR A SECOND AND A HALF, once the builder is under way: § */
  for (let k = 0; k < 600 && t.aheadLog().filter(x => x.t >= r0).length < 3; k++) await wait(50);
  if (t.aheadLog().filter(x => x.t >= r0).length < 3) bad.push('the builder never got under way after the repaint, so the finger was not asked about');
  const f0 = w.performance.now();
  t.swipeLive(true);
  await wait(1500);
  t.swipeLive(false);
  const f1 = w.performance.now();
  const under = t.aheadLog().filter(x => x.t >= f0 && x.t <= f1);
  if (under.length) bad.push(under.length + ' slice(s) ran while a finger was down: ' + under.slice(0, 3).map(x => x.key).join(', '));
  if (!(await aheadQuiet_(t))) bad.push('the builder never finished: ' + JSON.stringify(t.aheadLog().slice(-3)));
  const stale = t.TABS.map(x => x.id).filter(id => t.stale(id));
  if (stale.length) bad.push('still STALE after the quiet: ' + stale.join(', '));
  ['tools', 'games', 'shop'].forEach(col => {
    const left = veiled_(w, col).filter(id => id !== 'wgt-reels' && id !== 'wgt-console');
    if (left.length) bad.push(col + ' still has widget slots under the loader after the quiet: ' + left.join(', '));
  });
  const log = t.aheadLog();
  if (log.length < 5) bad.push('the builder ran ' + log.length + ' slice(s) — it did not draw anything, so nothing was checked');
  const wrong = log.filter(x => x.live || x.settle || x.after || x.quiet < 400);
  if (wrong.length) bad.push(wrong.length + ' slice(s) ran under a finger, a settle, a booked slide or within 400ms of input: ' + JSON.stringify(wrong.slice(0, 2)));
  if (!log.some(x => /^widget:/.test(x.key))) bad.push('no widget slot was drawn by the builder');
  if (!log.some(x => /^fill:/.test(x.key))) bad.push('no finder page was filled by the builder');
  t.USER(null);
  return bad;
});

check('a paint the builder is refused (a Settings form being edited) stays stale and waits, and is drawn once a box lets go', async () => {
  const admin = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], token: 't-adm' };
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadLog !== 'function') return ['the builder is not reachable — NOT checked'];
  t.USER(admin); t.go('feed', false, true); t.repaint();
  await aheadQuiet_(t);
  const form = w.document.querySelector('#s-account .me-form');
  if (!form) { t.USER(null); return ['no Settings form drawn for an admin — NOT checked']; }
  form.setAttribute('data-dirty', '1');
  t.repaint();
  await aheadQuiet_(t, 20000);
  if (!t.stale('account')) bad.push('Settings was drawn again while a form on it was being edited — the typing would be lost');
  const tries = t.aheadLog().filter(x => x.key === 'paint:settings').length;
  if (tries > 3) bad.push('the refused paint was tried ' + tries + ' times — it should wait for its reason to change, not loop');
  if (t.stale('stuff')) bad.push('Tools was left stale too — one refused column held up the rest');
  const f2 = w.document.querySelector('#s-account .me-form[data-dirty]');
  if (f2) f2.removeAttribute('data-dirty');
  w.document.dispatchEvent(new w.Event('focusout'));
  await aheadQuiet_(t, 20000);
  if (t.stale('account')) bad.push('Settings stayed stale after the box let go — the builder was never asked again');
  t.USER(null);
  return bad;
});

check('a widget drawn ahead with nothing changed is adopted on arrival without starting; after a press, a carried drawing, a change of person or a start on another copy it is started', async () => {
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.widgetsOf !== 'function') return ['the widgets are not reachable — NOT checked'];
  /* FIND SHOWING TOOLS, then left (790): its filled cards are what is drawn ahead, as Tools' column was. */
  t.USER(SAM_); t.findGroupOn('stuff', 'Tools'); t.go('feed', false, true); t.repaint();
  await aheadQuiet_(t);
  const tools = t.widgetsOf('tool');
  const calc = tools.find(x => String(x.id) === 'calculator'), cal = tools.find(x => String(x.id) === 'mat');
  if (!calc || !cal) { t.USER(null); return ['no calculator or calendar on Tools — NOT checked']; }
  const n = { calculator: 0, mat: 0 };
  [calc, cal].forEach(x => { const real = x.start; x.start = function () { n[x.id]++; return real.apply(this, arguments); }; });
  const arrive = async () => { n.calculator = 0; n.mat = 0; t.go('stuff', false, true); await wait(LEAVE_MS); await woken_(); };
  const leave = async () => { t.go('feed', false, true); await wait(LEAVE_MS); await woken_(); };
  const slot = id => t.slotOn('stuff', id);
  /* 1. NOTHING MOVED: adopted. */
  if (!slot('calculator') || slot('calculator').getAttribute('aria-busy')) bad.push('the calculator was not drawn ahead on Tools');
  await arrive();
  if (n.calculator || n.mat) bad.push('arriving at drawn, unchanged widgets started them again (' + JSON.stringify(n) + ') — they should be adopted');
  if (!t.running().some(e => e.id === 'calculator' && e.col === 'stuff')) bad.push('the adopted calculator is not entered as running');
  /* 2. A PRESS: the next drawing ahead, then an action, then the arrival — started. */
  await leave(); t.repaint(); t.findGroupOn('stuff', 'Tools'); await aheadQuiet_(t);   /* Find back on Tools while away (790) */
  /* ANY PRESS (`on`'s wrapper bumps ACT_EPOCH): Clear done on the docket, which changes nothing Find shows — the funnel's Clear would empty Find's Tools answer (790). */
  try { t.ACTIONS['dock-clear'](w.document.createElement('button')); } catch (e) {}
  await arrive();
  if (!n.mat) bad.push('after a press the cheat sheet maker (beside the calculator on Find) drawn before it was adopted, not started');
  /* 3. A DRAWING CARRIED THROUGH A PAINT (pure, the calculator) keeps its old clocks: started behind it. */
  await leave(); t.repaint(); t.findGroupOn('stuff', 'Tools'); await aheadQuiet_(t);   /* Find back on Tools while away (790) */
  const before = slot('calculator');
  t.repaint(); await aheadQuiet_(t);
  if (slot('calculator') !== before) bad.push('the pure calculator was not carried through the paint — its drawing was thrown away');
  await arrive();
  if (!n.calculator) bad.push('a calculator drawn before a repaint and carried through it was adopted rather than started');
  /* 4. A CHANGE OF PERSON, with the builder held so nothing is drawn again: started, never adopted. */
  await leave(); t.repaint(); t.findGroupOn('stuff', 'Tools'); await aheadQuiet_(t);   /* Find back on Tools while away (790) */
  w.__aheadHold = true;
  t.USER(Object.assign({}, SAM_, { name: 'Ada Other', personId: 'P8', person_id: 'P8' }));
  await arrive();
  if (!n.calculator && slot('calculator') && !slot('calculator').getAttribute('aria-busy')) bad.push('a drawing made for Sam was adopted for somebody else');
  w.__aheadHold = false;
  t.USER(null);
  return bad;
});

check('every widget with a stop is drawn ahead by its draw and runs nothing: no sprint, no frame loop, no classroom round, no film', async () => {
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.widgetState !== 'function') return ['the widgets\' state is not reachable — NOT checked'];
  t.USER(SAM_); t.findGroupOn('stuff', 'Games', 'wordgames'); t.go('feed', false, true); t.repaint();   /* Find showing Games, left (790) */
  await aheadQuiet_(t);
  const st = t.widgetState();
  if (st.tt) bad.push('the times-tables sprint is running after being drawn ahead');
  if (st.flappy && st.flappy.raf) bad.push('Flabby Pird\'s frame loop is running after being drawn ahead');
  const P = st.party || {};
  Object.keys(P).forEach(k => { if (P[k] && (P[k].ends || P[k].run)) bad.push('a classroom round (' + k + ') is running after being drawn ahead'); });
  if (st.vid) bad.push('a film is playing in the videos card after being drawn ahead (' + st.vid + ')');
  if (t.running().length) bad.push('drawn-ahead widgets are entered as running: ' + t.running().map(e => e.id).join(', '));
  /* DRAWN: each slot with a stop is out from under its loader — but Flabby Pird, whose still drawing needs a
     box and jsdom has none, and the reels card when its fact is a clip (`feedPaint_`). */
  /* VIDEOS LEADS THE REELS NOW (414), and is drawn ahead there. */
  [['stuff', 'wordgames'], ['reel', 'videos']].forEach(([col, id]) => {
    const sl = t.slotOn(col, id);
    if (!sl) bad.push('no ' + id + ' slot on ' + col);
    else if (sl.getAttribute('aria-busy')) bad.push(id + ' is still under its loader after the quiet — its draw did not draw it');
  });
  t.USER(null);
  return bad;
});

check('the first payload draws the column in front (and the glass), and every other column keeps the boot\'s loader until it is drawn — never empty', async () => {
  const { w } = boot();
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.paints !== 'function') return ['the paint counter is not reachable — NOT checked'];
  const P = t.paints(), at = t.AT(), glass = t.glass().cols;
  const again = Object.keys(P).filter(id => P[id] > 1 && id !== at && glass.indexOf(id) === -1);
  if (again.length) bad.push('the landing drew columns that are neither in front nor on the glass: ' + again.join(', '));
  if (!(P[at] > 1)) bad.push('the column in front was not drawn by the payload (' + at + ': ' + P[at] + ')');
  const empty = t.TABS.map(x => x.id).filter(id => { const el = w.document.getElementById('s-' + id); return el && !el.firstElementChild; });
  if (empty.length) bad.push('columns left empty after the first payload: ' + empty.join(', '));
  const held = t.TABS.map(x => x.id).filter(id => id !== at && glass.indexOf(id) === -1 && !t.stale(id));
  if (held.length) bad.push('columns neither drawn nor marked stale after the first payload: ' + held.join(', '));
  return bad;
});

check('a landing never leaves a drawing made from old facts on the glass: a widget that reads facts is veiled at once and drawn again; a pure one is the same element throughout', async () => {
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.landRepaint !== 'function') return ['landRepaint_ is not reachable — NOT checked'];
  t.USER(SAM_); t.findGroupOn('stuff', 'Tools'); t.findFillAll('stuff'); t.go('feed', false, true); t.repaint();   /* Find showing Tools, every card filled, then left (790) */
  await aheadQuiet_(t);
  const cal0 = t.slotOn('stuff', 'countdowns'), calc0 = t.slotOn('stuff', 'calculator');
  if (!cal0 || cal0.getAttribute('aria-busy') || !calc0) { t.USER(null); return ['Countdowns was not drawn ahead on Tools — NOT checked']; }
  w.__aheadHold = true;
  /* COUNTDOWNS READ FACTS (Term dates is the school year's own rules since 491) (the calendar is plain and `pure` since 466): a term the landing brings. */
  const d = new Date(); d.setDate(d.getDate() + 1);
  const dd = String(d.getDate()).padStart(2, '0') + '/' + String(d.getMonth() + 1).padStart(2, '0') + '/' + d.getFullYear();
  const D = t.DATA();
  D.intervals = [{ term: 'Landed term', label: 'Landed term', kind: 'holiday', startDate: dd, endDate: dd }].concat(D.intervals || []);
  t.landRepaint();
  const cal1 = t.slotOn('stuff', 'countdowns');
  if (!cal1 || !cal1.getAttribute('aria-busy')) bad.push('Countdowns drawn from the old facts is still showing after the landing');
  if (t.slotOn('stuff', 'calculator') !== calc0) bad.push('the pure calculator was replaced by the landing');
  w.__aheadHold = false; t.aheadKick();
  await aheadQuiet_(t);
  const cal2 = t.slotOn('stuff', 'countdowns');
  if (!cal2 || cal2.getAttribute('aria-busy')) bad.push('Countdowns was not drawn again from the new facts in the quiet');
  else if (!/Landed term/.test(cal2.textContent)) bad.push('Countdowns drawn again does not show the term the landing brought');
  if (t.slotOn('stuff', 'calculator') !== calc0) bad.push('the pure calculator was replaced while the builder drew the rest');
  t.USER(null);
  return bad;
});

check('signing out puts away the widgets drawn for the last person, before the repaint returns — no idle moment in between', async () => {
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof w.signedOut_ !== 'function') return ['signedOut_ is not reachable — NOT checked'];
  t.USER(SAM_); t.findGroupOn('stuff', 'Tools'); t.findFillAll('stuff'); t.go('feed', false, true); t.repaint();   /* Find showing Tools, every card filled, then left (790) */
  await aheadQuiet_(t);
  /* THE NOTEPAD AND THE TIMETABLE, both asked: § */
  const ids = ['notepad', 'timetable'];
  const drawn = ids.filter(id => { const sl = t.slotOn('stuff', id); return sl && !sl.getAttribute('aria-busy'); });
  if (drawn.length < 2) { t.USER(null); return ['the notepad and the timetable were not both drawn ahead for Sam (' + drawn.join(', ') + ') — NOT checked']; }
  w.signedOut_();
  ids.forEach(id => {
    const now = t.slotOn('stuff', id);
    if (now && !now.getAttribute('aria-busy') && now.WHO === 'P9') bad.push('the ' + id + ' drawn for Sam is still drawn after signing out');
  });
  return bad;
});

check('every screen draws the same markup twice from the same facts — a landing can only skip a column if that is true', async () => {
  const { w } = boot();
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.screenDraw !== 'function') return ['the screens are not reachable — NOT checked'];
  for (const who of [null, SAM_]) {
    t.USER(who);
    t.TABS.forEach(x => {
      let a, b;
      try { a = t.screenDraw(x.id); b = t.screenDraw(x.id); } catch (e) { bad.push(x.id + ' threw: ' + e.message); return; }
      if (a !== b) {
        let i = 0; while (i < a.length && a[i] === b[i]) i++;
        bad.push((who ? 'signed in' : 'signed out') + ', ' + x.id + ' drew different markup twice, first at ' + i + ': ' + JSON.stringify(String(a).slice(Math.max(0, i - 30), i + 40)));
      }
    });
  }
  t.USER(null);
  return bad;
});

check('a landing that changes nothing writes nothing — every element of a column off the glass is the one it was, and its mark is cleared; after a press the next landing writes it', async () => {
  const { w } = boot();
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.paint !== 'function') return ['paint is not reachable — NOT checked'];
  t.go('feed', false, true); await wait(LEAVE_MS); await woken_();
  const cols = ['tools', 'account', 'spotlight'].filter(id => w.document.getElementById('s-' + id) && id !== t.AT() && t.glass().cols.indexOf(id) === -1);
  if (!cols.length) return ['no column off the glass to ask about — NOT checked'];
  cols.forEach(id => t.paint(id));
  const kids = id => [...w.document.querySelectorAll('#s-' + id + ' *')];
  const was = {}; cols.forEach(id => { was[id] = kids(id); });
  /* THE LANDING MARKS, AND THE COLUMN IS DRAWN AS THE BUILDER OR AN ARRIVAL WOULD DRAW IT — `paint`, not fresh. */
  t.landRepaint();
  cols.forEach(id => {
    if (!t.stale(id)) bad.push(id + ' was not marked by the landing at all, so this asked nothing');
    t.paint(id);
    if (t.stale(id)) bad.push(id + ' is still marked after it was drawn (it should be answered by writing nothing)');
    const now = kids(id);
    if (now.length !== was[id].length || now.some((el, i) => el !== was[id][i])) bad.push(id + ' was written by a landing that changed nothing');
  });
  /* BUT A `repaint()`'S MARK OF 1 ALWAYS WRITES, with nothing pressed and nothing changed. § */
  const r = cols[cols.length - 1];
  const rWas = kids(r);
  t.repaint();
  if (!t.stale(r)) bad.push(r + ' was not marked by a repaint at all, so this asked nothing');
  t.paint(r);
  if (kids(r)[0] === rWas[0]) bad.push('a repaint\'s mark of 1 kept ' + r + ' as it was — the identical-markup skip is a landing\'s, never a repaint\'s');
  /* AND AFTER A PRESS, THE NEXT LANDING WRITES: a press can have edited the column in place. */
  try { t.ACTIONS['filter-clear'](w.document.createElement('button')); } catch (e) {}
  t.landRepaint();
  const id = cols[0];
  t.paint(id);
  if (kids(id)[0] === was[id][0]) bad.push('after a press the next landing kept ' + id + ' as it was — a press can have edited it in place');
  return bad;
});

check('a column\'s page count follows its pages: a reel appended and a paint are both counted', async () => {
  const { w } = boot();
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.reelMore !== 'function') return ['the reels are not reachable — NOT checked'];
  t.go('reel', false, true); await wait(LEAVE_MS); await woken_();
  const count = () => w.document.querySelectorAll('#s-reel > .page').length;
  const a = t.pageCount('reel');
  if (a !== count()) bad.push('the count says ' + a + ' and the column holds ' + count() + ' pages');
  t.reelMore(2);
  const b = t.pageCount('reel');
  if (b !== count()) bad.push('after two reels appended the count says ' + b + ' and the column holds ' + count());
  if (b === a && count() !== a) bad.push('the count did not move when reels were appended');
  t.paint('reel');
  const c = t.pageCount('reel');
  if (c !== count()) bad.push('after a paint the count says ' + c + ' and the column holds ' + count());
  return bad;
});

/* AFTER THE REVIEW OF 12 OCT (docs/history/341, "After review"): § */
/* THE 76-QUESTION PAPER the swipe checks run Find down (check/swipe.js), served as the library — a window of
   results long enough to have pages either side of the one in front, past the window's edge. */
const paper2F_ = () => {
  const lib = LIB_FULL.rows('questions');
  const rows = lib.filter(r => r.paper_id === 'P-AQA-8461-2406-2F');
  return { rows, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined), ask: [{ field: 'paperId', value: 'P-AQA-8461-2406-2F' }] };
};
/* EVERY SLICE THAT ASKS THE NETWORK, by the job it was running — `fetch` is the window's, so a wrapper put
   there after boot sees every ask the app makes from then on. */
const aheadNet_ = (w, t) => {
  const out = [];
  const f0 = w.fetch;
  w.fetch = function (url, o) {
    const k = t.aheadRunning();
    if (k) {
      let what = String(url);
      try { if (o && o.body) what = JSON.parse(o.body).action || what; } catch (e) {}
      out.push({ key: String(k), what });
    }
    return f0.apply(this, arguments);
  };
  return out;
};

check('a landing never deals a reel twice: the reels topped up in the quiet and landed on three times are each there once, and the count is the column', async () => {
  /* REVIEW, 12 Oct: the identical-markup skip kept a reel column the builder had appended to, after the reel draw had counted its reels from nought — every landing § */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.landRepaint !== 'function') return ['landRepaint_ is not reachable — NOT checked'];
  t.USER(SAM_); t.go('feed', false, true); t.repaint();
  await aheadQuiet_(t);
  const reels = () => [...w.document.querySelectorAll('#s-reel > .page .reel[data-reel]')].map(el => Number(el.dataset.reel));
  const n0 = reels().length;
  if (n0 < 13) bad.push('the quiet left ' + n0 + ' reels in the column — it keeps twelve past the one in front (so the top-up this asks about never ran)');
  for (let k = 0; k < 3; k++) {
    t.landRepaint();
    await aheadQuiet_(t);
    const got = reels();
    const dup = got.filter((v, i) => got.indexOf(v) !== i);
    if (dup.length) { bad.push('after landing ' + (k + 1) + ' the column deals reel(s) ' + [...new Set(dup)].join(', ') + ' twice: ' + got.join(',')); break; }
    /* `data-reel` IS THE PAGE, so the first reel is numbered by the pages that lead it (414: the column's widgets). */
    const lead = [...w.document.querySelectorAll('#s-reel > .page')].findIndex(p => p.querySelector('.reel'));
    if (got.some((v, i) => v !== i + lead)) { bad.push('after landing ' + (k + 1) + ' the reels run ' + got.join(',') + ' — not one after another from the first reel\'s page (' + lead + ')'); break; }
    const pages = w.document.querySelectorAll('#s-reel > .page').length;
    if (t.pageCount('reel') !== pages) { bad.push('after landing ' + (k + 1) + ' the count says ' + t.pageCount('reel') + ' and the column holds ' + pages + ' pages'); break; }
  }
  t.USER(null);
  return bad;
});

check('nothing drawn ahead asks the network: three repaints with the builder on send no messages ask, and no slice sends anything', async () => {
  /* REVIEW, 12 Oct: the Messages column's draw asks for the inbox (`dmSync_`), and the builder drew it after every repaint and landing for nobody — one POST each § */
  const { w, sent } = await aheadBoot_({ before: x => { try { x.localStorage.setItem('familyUser', JSON.stringify(SAM_)); } catch (e) {} } });
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadRunning !== 'function') return ['the builder\'s running job is not reachable — NOT checked'];
  if (!(t.whoami() && t.whoami().personId === 'P9')) return ['Sam was not signed in at boot — NOT checked'];
  await aheadQuiet_(t);
  const asks = () => sent.filter(b => b && b.action === 'messages').length;
  if (!asks()) bad.push('the payload\'s own inbox ask was never made, so the count below proves nothing');
  const n0 = asks();
  const net = aheadNet_(w, t);
  for (let k = 0; k < 3; k++) {
    t.dmLast0();
    t.repaint();
    await aheadQuiet_(t);
  }
  if (asks() > n0) bad.push('three repaints sent ' + (asks() - n0) + ' messages ask(s) with nobody on Messages — the builder\'s draw asked');
  if (net.length) bad.push(net.length + ' ask(s) from inside a builder slice: ' + net.slice(0, 4).map(x => x.key + ' → ' + x.what).join(', '));
  if (!t.aheadLog().some(x => x.key === 'paint:dm')) bad.push('the builder never drew Messages, so this asked nothing');
  const dm = w.document.getElementById('s-dm');
  if (dm && !dm.textContent.trim() && dm.querySelector('.loading')) bad.push('Messages is still the loader after the quiet, with the inbox answered');
  t.USER(null);
  return bad;
});

check('signing out puts away every widget drawing the last person had, including the ones the next person has no slot for: an admin\'s tools and her stars', async () => {
  /* REVIEW, 12 Oct: the re-veil at a change of person walked the NEW person's widgets, so the admin's flyer maker, availability and uploads on Tools, and every § */
  const admin = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], token: 't-adm' };
  const { w } = await aheadBoot_({ before: x => { try {
    x.localStorage.setItem('familyUser', JSON.stringify(admin));
    x.localStorage.setItem('favs', JSON.stringify(['w:calculator', 'w:notepad']));
  } catch (e) {} } });
  const t = w.__t, bad = [];
  if (!t || typeof w.signedOut_ !== 'function') return ['signedOut_ is not reachable — NOT checked'];
  t.findGroupOn('stuff', 'Tools', 'flyers'); t.go('feed', false, true); t.repaint();   /* Find showing the admin's tools, left (790) */
  await aheadQuiet_(t);
  const ask = [['stuff', 'flyers'], ['saved', 'calculator'], ['saved', 'notepad']];
  const drawn = ask.filter(([c, id]) => { const sl = t.slotOn(c, id); return sl && !sl.getAttribute('aria-busy') && sl.WHO === 'P001'; });
  if (drawn.length < ask.length) { return ['not every slot was drawn ahead for the admin (' + drawn.map(x => x.join(':')).join(', ') + ') — NOT checked']; }
  w.signedOut_();
  ask.forEach(([c, id]) => {
    const sl = t.slotOn(c, id);
    if (sl && !sl.getAttribute('aria-busy') && sl.WHO === 'P001') bad.push('the ' + id + ' drawn for the admin on ' + c + ' is still drawn after signing out');
  });
  return bad;
});

check('a column marked stale by a press with no finger lifted — a star from the keyboard — is drawn in the quiet all the same', async () => {
  /* REVIEW, 12 Oct: six places marked `STALE` themselves, and the builder runs nothing periodic — so a star pressed without a `pointerup` left thirteen columns § */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadKick !== 'function') return ['the builder is not reachable — NOT checked'];
  t.USER(SAM_); t.findGroup('Tools'); t.repaint();
  await aheadQuiet_(t);
  const star = w.document.createElement('button');
  star.setAttribute('data-key', 'w:timer'); star.setAttribute('data-kind', 'widget');
  t.ACTIONS.fav(star);
  if (!t.TABS.some(x => x.id !== t.AT() && t.stale(x.id))) bad.push('the star marked nothing stale, so this asked nothing');
  if (!(await aheadQuiet_(t, 60000))) bad.push('the builder never went quiet after the star — nothing kicked it');
  const stale = t.TABS.map(x => x.id).filter(id => t.stale(id));
  if (stale.length) bad.push('still stale after the star and the quiet: ' + stale.join(', '));
  t.USER(null);
  return bad;
});

check('a sideways landing in the first seconds after a load draws every column it shows: none is left on the boot\'s loader, on a phone or a wide window', async () => {
  /* REVIEW, 12 Oct: the first payload draws the column in front and the glass, and leaves the rest on the boot's loader for the builder — which a hand that keeps § */
  const bad = [];
  for (const wide of [false, true]) {
    const { w } = boot(wide ? { before: x => { x.matchMedia = q => ({ matches: /min-width/.test(String(q)), addEventListener() {}, removeEventListener() {} }); } } : {});
    for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
    await wait(600);
    const t = w.__t;
    const say = wide ? 'wide' : 'phone';
    if (!t || typeof t.PRE_PAYLOAD !== 'function') { bad.push(say + ': the boot\'s columns are not reachable — NOT checked'); continue; }
    if (!t.PRE_PAYLOAD().length) { bad.push(say + ': no column was left on the boot\'s markup, so nothing was asked'); continue; }
    const ids = t.TABS.map(x => x.id);
    const to = ids[Math.min(ids.length - 2, ids.indexOf(t.AT()) + 4)];
    t.go(to, false);
    await wait(LEAVE_MS);
    const ti = ids.indexOf(t.AT());
    /* ONE SCROLLING PAGE (900): one centred column at every width, no glass -- what shows beside it is its neighbours above and below. */
    const flow = w.document.documentElement.classList.contains('flow'), glassy = wide && !flow;
    if (wide && flow && t.glass().cols.length > 1) bad.push(say + ': on the one scrolling page the glass still shows ' + t.glass().cols.length + ' columns');
    const shown = glassy ? t.glass().cols : [ids[ti - 1], ids[ti + 1]].filter(Boolean);
    if (glassy && shown.length < 2) bad.push(say + ': the glass shows ' + shown.length + ' column(s) at ' + to + ', so nothing beside it was asked');
    const left = shown.filter(id => id !== t.AT() && t.PRE_PAYLOAD().indexOf(id) !== -1);
    if (left.length) bad.push(say + ': landed on ' + t.AT() + ' and ' + left.join(', ') + ' — ' + (glassy ? 'on the glass' : 'beside it') + ' — still hold the boot\'s loader');
  }
  return bad;
});

check('a landing that changes nothing keeps the column in front, and an arrival after it keeps the column it arrives at; after a press, or with widgets in front, it is drawn again', async () => {
  /* REVIEW, 12 Oct: the identical-markup skip was never for the column in front, so a landing redrew the Feed from nothing (its pictures gone for 120ms and more) § */
  const { w } = boot();
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.landRepaint !== 'function') return ['landRepaint_ is not reachable — NOT checked'];
  const kids = id => [...w.document.querySelectorAll('#s-' + id + ' *')];
  const same = (a, b) => a.length === b.length && a.every((el, i) => el === b[i]);
  t.go('feed', false, true); await wait(LEAVE_MS); await woken_();
  /* 1. THE COLUMN IN FRONT, A LANDING WITH NOTHING NEW: kept. */
  const f0 = kids('feed'), p0 = t.paints().feed || 0;
  t.landRepaint();
  if ((t.paints().feed || 0) !== p0 || !same(kids('feed'), f0)) bad.push('a landing that changed nothing wrote the Feed in front again');
  /* 2. AFTER A PRESS: written. */
  try { t.ACTIONS['filter-clear'](w.document.createElement('button')); } catch (e) {}
  t.landRepaint();
  if ((t.paints().feed || 0) === p0) bad.push('after a press the next landing kept the Feed in front — a press can have edited it in place');
  /* 3. AN ARRIVAL AFTER A LANDING THAT CHANGED NOTHING: the column arrived at is kept. */
  t.paint('account');
  const a0 = kids('account'), q0 = t.paints().account || 0;
  t.landRepaint();
  if (!t.stale('account')) bad.push('Account was not marked by the landing, so the arrival asked nothing');
  t.go('account', false, true); await wait(LEAVE_MS); await woken_();
  if ((t.paints().account || 0) !== q0 || !same(kids('account'), a0)) bad.push('arriving at Account after a landing that changed nothing wrote it again');
  /* 4. A COLUMN OF WIDGETS IN FRONT IS STILL DRAWN AGAIN AT A LANDING — 331's restart. */
  t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
  const r0 = t.paints().stuff || 0;
  t.landRepaint();
  if ((t.paints().stuff || 0) === r0) bad.push('a landing kept Find › Tools in front — a column of widgets in front is drawn again and restarted, as it always was');
  return bad;
});

check('a landing that brings a fact draws it: a new post is in the Feed once the column is drawn as the builder draws it', async () => {
  /* REVIEW, 12 Oct: the identical-markup skip's own comparison (`el.DRAWN.html === html`) could be taken out
     with every journey green — the skip would keep a column whatever the facts said. */
  const p = payload();
  p.posts = [1, 2].map(i => ({ id: 'PO' + i, author: '@family.', handle: '@family.', avatar: '',
    image: '', media: [], caption: 'Post ' + i, body: '', location: '', when: '0' + i + '/09/2026',
    at: Date.UTC(2026, 8, i), pinned: false, active: true, waiting: false, refused: false,
    reactions: NO_REACTIONS_(), comments: { total: 0, list: [] } }));
  const { w } = boot({ payload: p });
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.landRepaint !== 'function') return ['landRepaint_ is not reachable — NOT checked'];
  t.findGroup('Tools'); await wait(LEAVE_MS); await woken_();
  t.paint('feed');
  if (!/Post 1/.test(w.document.getElementById('s-feed').textContent)) return ['the Feed does not show its first post, so a new one proves nothing — NOT checked'];
  const D = t.DATA();
  D.posts.unshift(Object.assign({}, D.posts[0], { id: 'PZ', caption: 'ZZ-new-post-landed', at: Date.UTC(2026, 8, 9), when: '09/09/2026' }));
  t.landRepaint();
  t.paint('feed');
  if (!/ZZ-new-post-landed/.test(w.document.getElementById('s-feed').textContent)) bad.push('the landing brought a post and the Feed, drawn after it, does not show it — the skip kept old markup');
  return bad;
});

check('a window drawn afresh in front is filled as far as the glass shows, both ways — not only the card in front and one either side', async () => {
  /* REVIEW, 12 Oct: a repaint drew Find in front from nothing and filled three cards; on an iPad the pages above the card in front sat on the glass as empty shells § */
  const P = paper2F_();
  const { w } = boot({ member: true, serve: P.serve });
  for (let i = 0; i < 80 && !w.__t; i++) await wait(25);
  await wait(600);
  const t = w.__t, bad = [];
  if (!t || typeof t.STUFF !== 'function') return ['Find is not reachable — NOT checked'];
  t.go('stuff', false, true); await wait(LEAVE_MS); await woken_();
  const S = t.STUFF();
  S.filters = P.ask.slice();
  w.paintFinder_('stuff');
  const first = w.inFinder_(w.finderOf_('stuff'), () => w.stuffFirstResult_());
  t.goPage('stuff', first + 6, true);
  await wait(LEAVE_MS); await woken_();
  t.repaint();
  await wait(0);
  const at = t.PAGE().stuff;
  const host = w.document.getElementById('s-stuff');
  const filled = i => { const el = host.querySelectorAll(':scope > .page')[t.domIndex('stuff', i)]; return !!(el && el.dataset.filled === '1'); };
  const want = [-3, -2, 2, 3].map(d => at + d).filter(i => i >= first);
  if (want.length < 4 || !(at > first)) return ['Find is on page ' + at + ' with its first result at ' + first + ' — the band either side was NOT asked'];
  const empty = want.filter(i => !filled(i));
  if (empty.length) bad.push('straight after a repaint with Find in front at page ' + at + ', pages ' + empty.join(', ') + ' are not filled — only the card in front and one either side were');
  return bad;
});

check('the builder waits for the hand: no slice within 400ms of a key or a pointer, none while a box has the focus, a slide or a settle runs, the page is hidden or an input is already waiting — and it carries on after each', async () => {
  /* REVIEW, 12 Oct: every one of these gates could be taken out with every check green — jsdom sends no
     pointer, wheel or key, J1's quiet assertion could never fail, and nothing focused a box or hid the page. */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.slideUntil !== 'function') return ['the builder\'s gates are not reachable — NOT checked'];
  t.USER(SAM_); t.go('feed', false, true); t.repaint();
  await aheadQuiet_(t);
  const ran = (a, b) => t.aheadLog().filter(x => x.t >= a && x.t <= b);
  const stale = () => t.TABS.map(x => x.id).filter(id => t.stale(id));
  const work = () => { t.repaint(); return w.performance.now(); };
  /* 1. A KEY EVERY 100ms FOR 1.5s, the work made a moment into it. */
  {
    const key = () => w.document.dispatchEvent(new w.KeyboardEvent('keydown', { bubbles: true, key: 'Shift' }));
    key();
    const a = w.performance.now();
    work();
    let last = a;
    while (w.performance.now() - a < 1500) { key(); last = w.performance.now(); await wait(100); }
    const under = ran(a, last + 380);
    if (under.length) bad.push(under.length + ' slice(s) ran within 400ms of a key: ' + under.slice(0, 3).map(x => x.key + ' (quiet ' + x.quiet + 'ms)').join(', '));
    if (!(await aheadQuiet_(t, 60000)) || stale().length) bad.push('after the keys stopped the builder did not finish: ' + stale().join(', '));
  }
  /* 2. A BOX WITH THE FOCUS. */
  {
    const box = w.document.createElement('input');
    box.type = 'text';
    w.document.getElementById('s-stuff').appendChild(box);
    box.focus();
    if (w.document.activeElement !== box) bad.push('the box would not take the focus, so the typing gate was NOT asked');
    const a = work();
    await wait(1500);
    const under = ran(a, w.performance.now());
    if (under.length) bad.push(under.length + ' slice(s) ran while a box had the focus: ' + under.slice(0, 3).map(x => x.key).join(', '));
    box.blur(); box.remove();
    w.document.dispatchEvent(new w.Event('focusout'));
    if (!(await aheadQuiet_(t, 60000)) || stale().length) bad.push('after the box let go the builder did not finish: ' + stale().join(', '));
  }
  /* 3. A TAPPED SLIDE STILL GLIDING, THEN A SETTLE. */
  for (const [what, shut] of [['a tapped slide', u => t.slideUntil(u)], ['a settle', u => t.settleOn({ until: u })]]) {
    const a = w.performance.now();
    shut(a + 1500);
    work();
    await wait(1400);
    const under = ran(a, a + 1500);
    if (under.length) bad.push(under.length + ' slice(s) ran inside ' + what + ': ' + under.slice(0, 3).map(x => x.key).join(', '));
    if (!(await aheadQuiet_(t, 60000)) || stale().length) bad.push('after ' + what + ' the builder did not finish: ' + stale().join(', '));
    shut(0);
  }
  /* 4. THE PAGE HIDDEN, THEN SHOWN. */
  {
    let hidden = true;
    try { Object.defineProperty(w.document, 'hidden', { get: () => hidden, configurable: true }); }
    catch (e) { bad.push('document.hidden could not be stood in for, so the hidden gate was NOT asked'); }
    w.document.dispatchEvent(new w.Event('visibilitychange'));
    const a = work();
    await wait(1500);
    const under = ran(a, w.performance.now());
    if (under.length) bad.push(under.length + ' slice(s) ran while the page was hidden: ' + under.slice(0, 3).map(x => x.key).join(', '));
    if (!stale().length) bad.push('nothing was left stale while hidden, so showing the page again asked nothing');
    hidden = false;
    w.document.dispatchEvent(new w.Event('visibilitychange'));
    if (!(await aheadQuiet_(t, 60000)) || stale().length) bad.push('after the page was shown again the builder did not finish: ' + stale().join(', '));
  }
  /* 5. AN INPUT THE BROWSER HOLDS AND THE PAGE HAS NOT HEARD YET § */
  {
    let pending = true;
    try { Object.defineProperty(w.navigator, 'scheduling', { value: { isInputPending: () => pending }, configurable: true }); }
    catch (e) { bad.push('navigator.scheduling could not be stood in for, so the waiting-input gate was NOT asked'); }
    const a = work();
    await wait(1500);
    const under = ran(a, w.performance.now());
    if (under.length) bad.push(under.length + ' slice(s) ran while an input was waiting: ' + under.slice(0, 3).map(x => x.key).join(', '));
    if (!stale().length) bad.push('nothing was left stale while an input waited, so its going asked nothing');
    pending = false;
    if (!(await aheadQuiet_(t, 60000)) || stale().length) bad.push('after the input was handled the builder did not finish: ' + stale().join(', '));
    try { delete w.navigator.scheduling; } catch (e) {}
  }
  t.USER(null);
  return bad;
});

check('the first slices after the screen is up need their quiet too, a column\'s first draw from a payload waits a whole second of it, and the device remembers what was slow', async () => {
  /* REVIEW, 12 Oct: the quiet was measured from nothing (`AHEAD.input` 0), so the first slices after the splash ran at once; and `AHEAD_SLOW` started empty, so § */
  const b = boot({ ahead: true, before: x => { try { x.localStorage.setItem('familyAheadSlow', JSON.stringify(['paint:account'])); } catch (e) {} } });
  const w = b.w;
  for (let i = 0; i < 400 && !w.__t; i++) await wait(5);
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadOpened !== 'function') return ['the builder\'s opening is not reachable — NOT checked'];
  const kept = t.aheadSlow();
  await aheadQuiet_(t);
  const opened = t.aheadOpened();
  const log = t.aheadLog().filter(x => x.t >= opened);
  if (!opened || !log.length) return ['the builder never opened or never ran — NOT checked'];
  if (log[0].t - opened < 390) bad.push('the first slice ran ' + Math.round(log[0].t - opened) + 'ms after the builder opened — it needs 400ms of quiet like any other');
  /* AND THE QUIET IT COUNTED STARTS NO EARLIER THAN THE OPENING: § */
  if (log[0].quiet > log[0].t - opened + 50) bad.push('the first slice counted ' + log[0].quiet + 'ms of quiet ' + Math.round(log[0].t - opened) + 'ms after the builder opened — the quiet was counted from before the screen was up');
  const firstPaints = {};
  log.forEach(x => { if (/^paint:/.test(x.key) && !firstPaints[x.key]) firstPaints[x.key] = x; });
  const hurried = Object.values(firstPaints).filter(x => x.quiet < 990);
  if (!Object.keys(firstPaints).length) bad.push('no column was drawn by the builder after the first payload, so nothing was asked');
  if (hurried.length) bad.push('a column\'s first draw from the payload ran after less than a second of quiet: ' + hurried.slice(0, 4).map(x => x.key + ' ' + x.quiet + 'ms').join(', '));
  /* AND WHAT THE DEVICE KEPT: read in before any slice (`kept`, at boot), and written back as it was learned —
     Account, slow last visit, was timed again on this one and the device holds what it found. */
  if (kept.indexOf('paint:account') === -1) bad.push('the slow bit kept on the device (paint:account) was not read in at boot: ' + JSON.stringify(kept));
  const mem = t.aheadSlow().filter(k => /^(paint|widget):/.test(k)).sort();
  let disk = null;
  try { disk = JSON.parse(w.localStorage.getItem('familyAheadSlow') || 'null'); } catch (e) {}
  if (!Array.isArray(disk) || JSON.stringify(disk.slice().sort()) !== JSON.stringify(mem)) bad.push('the device keeps ' + JSON.stringify(disk) + ' and the builder learned ' + JSON.stringify(mem) + ' — what was learned was not written back');
  return bad;
});

check('a column\'s first draw from a payload waits a whole second of quiet even when nothing else is in its way', async () => {
  /* REVIEW ROUND 1, 12 Oct: § */
  const b = boot({ ahead: true, before: x => { x.__aheadHold = true; } });
  const w = b.w;
  for (let i = 0; i < 400 && !w.__t; i++) await wait(5);
  const t = w.__t, bad = [];
  if (!t || typeof t.PRE_PAYLOAD !== 'function') return ['the builder is not reachable — NOT checked'];
  for (let i = 0; i < 200 && !t.afterIdle(); i++) await wait(25);
  await wait(300);
  const cold = t.PRE_PAYLOAD().filter(id => t.stale(id) && id !== t.AT());
  if (!cold.length) return ['no column was left on the boot\'s markup, so nothing was asked — NOT checked'];
  w.document.dispatchEvent(new w.KeyboardEvent('keydown', { bubbles: true, key: 'Shift' }));
  const k = w.performance.now();
  w.__aheadHold = false;
  t.aheadKick();
  for (let i = 0; i < 200 && !t.aheadLog().some(x => x.t >= k && /^paint:/.test(x.key) && cold.indexOf(x.key.slice(6)) !== -1); i++) await wait(25);
  const first = t.aheadLog().find(x => x.t >= k && /^paint:/.test(x.key) && cold.indexOf(x.key.slice(6)) !== -1);
  if (!first) return ['the builder drew none of the columns on the boot\'s markup — NOT checked'];
  if (first.t - k < 990) bad.push(first.key + ', a first draw from the payload, ran ' + Math.round(first.t - k) + 'ms after a key — it waits a second');
  return bad;
});

check('a finder drawn for nobody is filled inside the builder\'s slices: no card of it is built outside one', async () => {
  /* REVIEW, 12 Oct: the finder's draw queued its own fill as a microtask, which ran after the builder's slice had ended and outside the time it measured — 2.7s of § */
  const P = paper2F_();
  const { w } = await aheadBoot_({ serve: P.serve });
  const t = w.__t, bad = [];
  if (!t || typeof t.finder !== 'function') return ['the finders are not reachable — NOT checked'];
  t.go('feed', false, true);
  await aheadQuiet_(t);
  /* AN ASK, so Find has a window of results to fill — with nothing asked a finder is its question alone. Made once
     the builder has drawn Find from the payload, so it lands on Find's own question and not the boot's loader. */
  const S = t.STUFF();
  S.filters = P.ask.slice();
  /* THE PAPER'S CHIPS STILL ASK, so its cards are shown as the reveal tile shows them (`findDone_`). */
  w.inFinder_(w.finderOf_('stuff'), () => w.findShow_());
  w.paintFinder_('stuff');
  await aheadQuiet_(t);
  if (!w.document.querySelectorAll('#s-stuff > .page.is-res').length) return ['Find holds no result pages for the paper, so nothing was asked — NOT checked'];
  let outside = 0, inside = 0;
  const f0 = w.stuffFillOne_;
  w.stuffFillOne_ = function () {
    const r = f0.apply(this, arguments);
    if (r && t.finder() !== t.AT() && t.glass().cols.indexOf(t.finder()) === -1) { if (t.aheadRunning()) inside++; else outside++; }
    return r;
  };
  t.repaint();
  await aheadQuiet_(t);
  w.stuffFillOne_ = f0;
  if (!t.aheadLog().some(x => x.key === 'paint:stuff')) bad.push('the builder never drew Find, so this asked nothing');
  if (outside) bad.push(outside + ' card(s) of a finder nobody is looking at were built outside a builder slice — after it, unmeasured');
  if (!inside) bad.push('no card of a finder off the glass was built by the builder, so this asked nothing');
  return bad;
});

check('a finder drawn for nobody after a landing is warmed a step a slice before its paint, each step in its own binding, and its paint builds no list', async () => {
  /* REVIEW ROUND 1, 12 Oct (the first thirty seconds, measured again): § */
  const P = paper2F_();
  const { w } = await aheadBoot_({ serve: P.serve });
  const t = w.__t, bad = [];
  if (!t || typeof t.finder !== 'function' || typeof w.load !== 'function') return ['the finders or load() are not reachable — NOT checked'];
  t.go('feed', false, true);
  await aheadQuiet_(t);
  const builds = [];
  const b0 = w.stuffItemsBuild_;
  w.stuffItemsBuild_ = function () { builds.push({ key: String(t.aheadRunning() || ''), finder: t.finder() }); return b0.apply(this, arguments); };
  const D0 = t.DATA();
  const a = w.performance.now();
  w.load();
  for (let i = 0; i < 400 && t.DATA() === D0; i++) await wait(25);
  if (t.DATA() === D0) { w.stuffItemsBuild_ = b0; return ['load() brought no new payload, so nothing was asked — NOT checked']; }
  await aheadQuiet_(t);
  w.stuffItemsBuild_ = b0;
  const log = t.aheadLog().filter(x => x.t >= a);
  ['stuff', 'res'].forEach(fid => {
    if (!t.TABS.some(x => x.id === fid)) return;
    const paintAt = log.findIndex(x => x.key === 'paint:' + fid);
    if (paintAt < 0) { bad.push('the builder never drew ' + fid + ' after the landing, so nothing was asked of it'); return; }
    const steps = log.slice(0, paintAt).filter(x => x.key.indexOf('warm:' + fid + ':') === 0).map(x => +x.key.split(':')[2]);
    if (steps.join() !== '0,1,2,3') bad.push(fid + ' was painted after warm steps [' + steps.join(',') + '] — every step, in order, comes before the paint');
    const inPaint = builds.filter(x => x.key === 'paint:' + fid).length;
    if (inPaint) bad.push(fid + '\'s paint built its list ' + inPaint + ' time(s) — the warm had not built it');
  });
  const wrong = builds.filter(x => /^warm:/.test(x.key) && x.key.split(':')[1] !== x.finder);
  if (wrong.length) bad.push('a warm step ran outside its own finder\'s binding: ' + wrong.slice(0, 3).map(x => x.key + ' bound to ' + x.finder).join(', '));
  if (!builds.some(x => /^warm:/.test(x.key))) bad.push('no warm step built a list, so the warm did nothing');
  return bad;
});

check('a card the builder fills ahead of the card in front asks for its pictures as one the placement saw: nothing lazy from two behind to six ahead, at rest', async () => {
  /* REVIEW ROUND 1, 12 Oct, found re-running check/reach.js: § */
  const p = await resPayload_();
  if (!p) return ['the resources payload could not be made — NOT checked'];
  const reflect = x => { try { Object.defineProperty(x.HTMLImageElement.prototype, 'loading', { configurable: true,
    get() { return this.getAttribute('loading') || 'auto'; }, set(v) { this.setAttribute('loading', String(v)); } }); } catch (e) {} };
  const { w } = await aheadBoot_({ payload: p, before: x => { signedInAs_(MEMBER_)(x); reflect(x); } });
  const t = w.__t, bad = [];
  if (!t || typeof t.domIndex !== 'function') return ['the builder is not reachable — NOT checked'];
  if (!resAsk_(w)) return ['the Resources column has no boxing shelf to fill — NOT checked'];
  t.go('res', false, true);
  await aheadQuiet_(t);
  /* THE CARDS FOUR TO SIX AHEAD EMPTIED AND LEFT TO THE BUILDER — filled again in the quiet with nothing placing the column after, which is the case: § */
  const pages = () => [...w.document.querySelectorAll('#s-res > .page')];
  const k = t.domIndex('res', t.PAGE().res || 0);
  const ahead = [4, 5, 6].map(d => pages()[k + d]).filter(pg => pg && pg.dataset.filled === '1' && pg.querySelector('img'));
  if (!ahead.length) return ['no filled card with a picture four to six ahead of the card in front, so nothing was asked — NOT checked'];
  ahead.forEach(pg => w.stuffBlank_(pg));
  t.aheadKick();
  await aheadQuiet_(t);
  const back = ahead.filter(pg => pg.dataset.filled === '1');
  if (back.length !== ahead.length) return ['the builder did not fill the emptied cards again, so nothing was asked — NOT checked'];
  const lazy = back.filter(pg => pg.querySelector('img[loading="lazy"]')).map(pg => pages().indexOf(pg) - k);
  if (lazy.length) bad.push('at rest, the cards ' + lazy.map(d => '+' + d).join(', ') + ' from the one in front, filled by the builder after the last placement, still hold a lazy picture');
  return bad;
});

check('everything booked after a slide counts as booked until the last of it has run, and no builder slice runs between its jobs', async () => {
  /* REVIEW ROUND 1, 12 Oct: § */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.afterIdle !== 'function' || typeof w.afterSlide_ !== 'function') return ['the after-slide list is not reachable — NOT checked'];
  t.USER(SAM_); t.go('feed', false, true); t.repaint();
  await aheadQuiet_(t);
  t.repaint();
  const seen = [];
  const busy = ms => { const e = w.performance.now() + ms; while (w.performance.now() < e) { /* the job's own work */ } };
  for (let i = 0; i < 5; i++) w.afterSlide_(() => { seen.push({ i, t: w.performance.now(), idle: t.afterIdle() }); busy(60); }, 'chain-' + i);
  for (let k = 0; k < 200 && seen.length < 5; k++) await wait(25);
  if (seen.length < 5) return ['only ' + seen.length + ' of the five jobs ran — NOT checked'];
  const early = seen.filter(x => x.idle).map(x => x.i);
  if (early.length) bad.push('job(s) ' + early.join(', ') + ' of five ran with the list already saying nothing was booked');
  const a = seen[0].t, b = seen[4].t;
  const between = t.aheadLog().filter(x => x.t > a && x.t < b);
  if (between.length) bad.push(between.length + ' builder slice(s) ran between the jobs of one slide: ' + between.slice(0, 3).map(x => x.key).join(', '));
  if (!(await aheadQuiet_(t, 60000))) bad.push('the builder did not finish after the chain');
  t.USER(null);
  return bad;
});

check('the reels are kept six ahead at every turn and twelve ahead after the quiet', async () => {
  /* REVIEW, 12 Oct: 7/6/6, the one-slide append in a turn and the builder's top-up could all be reverted with
     every check green. */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.pageCount !== 'function') return ['the reels are not reachable — NOT checked'];
  t.go('reel', false, true);
  await aheadQuiet_(t);
  const pages = () => w.document.querySelectorAll('#s-reel > .page').length;
  const at = () => t.PAGE().reel || 0;
  if (pages() - 1 - at() < 12) bad.push('after the quiet the reels hold ' + (pages() - 1 - at()) + ' past the one in front — twelve are kept');
  w.__aheadHold = true;
  for (let k = 0; k < 14; k++) {
    t.goPage('reel', at() + 1);
    if (pages() - 1 - at() < 6) { bad.push('after turning to reel ' + at() + ' only ' + (pages() - 1 - at()) + ' are ahead — six are kept in a turn'); break; }
  }
  w.__aheadHold = false;
  return bad;
});

check('the quiet puts a finder\'s window where a run needs it: the card in front thirteen or fourteen from the end it is leaving', async () => {
  /* REVIEW, 12 Oct: the builder's `centre` job could be dropped with every check green — the release's slide by six kept BUILT AHEAD satisfied. § */
  const lib = LIB_FULL.rows('questions');
  /* A QUESTION IS ONE PAGE, its parts on it, so one paper is a dozen pages: the Edexcel maths papers together are well over sixty. */
  const rows = lib.filter(r => /^P-1MA1-/.test(r.paper_id));
  const { w } = await aheadBoot_({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  const t = w.__t, bad = [];
  if (!t || typeof t.stuffBehind !== 'function') return ['the window is not reachable — NOT checked'];
  t.go('stuff', false, true);
  const S = t.STUFF();
  S.filters = [{ field: 'kindLabel', value: 'Practice' }, { field: 'kindOwn', value: 'Questions' }];
  w.inFinder_(w.finderOf_('stuff'), () => w.findShow_());
  w.paintFinder_('stuff');
  await aheadQuiet_(t);
  const first = w.inFinder_(w.finderOf_('stuff'), () => w.stuffFirstResult_());
  const n = w.inFinder_(w.finderOf_('stuff'), () => w.stuffPages_().length);
  if (n < 60) return ['the Edexcel GCSE maths questions are ' + n + ' page(s) on Find — this needs sixty, so it was NOT checked'];
  w.__aheadHold = true;
  t.goPage('stuff', first, true);
  for (let k = 0; k < 40; k++) t.goPage('stuff', t.PAGE().stuff + 1);
  const slid = t.pageLo().stuff || 0;
  w.__aheadHold = false; t.aheadKick();
  await aheadQuiet_(t);
  const r = t.PAGE().stuff - first;
  const want = Math.max(0, Math.min(n - t.STUFF_WIN, r - t.stuffBehind()));
  const lo = t.pageLo().stuff || 0;
  if (lo !== want) bad.push('after a run to result ' + r + ' and the quiet the window starts at ' + lo + ' (slid to ' + slid + ') — the quiet puts it at ' + want + ', ' + t.stuffBehind() + ' behind');
  if (slid === want) bad.push('the run itself left the window where the quiet would, so the centring was NOT asked');
  return bad;
});

check('a column\'s widget slots are drawn before any column further out is painted — the one beside you first, every page of it', async () => {
  /* REVIEW, 12 Oct (a nit, and the loaders it left): § */
  const { w } = await aheadBoot_();
  const t = w.__t, bad = [];
  if (!t || typeof t.aheadLog !== 'function') return ['the builder is not reachable — NOT checked'];
  /* SAVED IN FRONT, FIND 2 SHOWING TOOLS BESIDE IT (790: the Games column that stood beside Shop is in Find). */
  t.USER(SAM_); t.findGroupOn('res', 'Tools'); t.go('booking', false, true); t.go('saved', false, true);
  await aheadQuiet_(t);
  const a = w.performance.now();
  t.repaint();
  await aheadQuiet_(t);
  const ids = t.TABS.map(x => x.id), ti = ids.indexOf('saved');
  if (Math.abs(ids.indexOf('res') - ti) !== 1) return ['Find 2 is not beside Saved: ' + ids.join(' ') + ' — NOT checked'];
  const log = t.aheadLog().filter(x => x.t >= a);
  const lastGames = log.map(x => x.key).lastIndexOf(log.filter(x => /^widget:res:/.test(x.key)).map(x => x.key).pop());
  if (lastGames < 0) return ['no widget on Find 2 was drawn by the builder after the repaint — NOT checked'];
  /* A FINDER'S SLOTS EXIST ONCE ITS PAINT OR A LATER FILL HAS MADE THEIR PAGES (790), so the race is counted from Find 2's last such job. */
  let from = 0; log.forEach((x, i) => { if (i < lastGames && /res/.test(x.key) && !/^widget:/.test(x.key)) from = i; });
  const far = log.findIndex((x, i) => i > from && /^paint:/.test(x.key) && Math.abs(ids.indexOf(x.key.slice(6)) - ti) >= 3);
  if (far >= 0 && far < lastGames) bad.push('the builder painted ' + log[far].key.slice(6) + ', three or more columns from Saved, before it had drawn every widget on Find 2 beside it (' + log[lastGames].key + ' came after)');
  t.USER(null);
  return bad;
});

check('a chosen book of the Bible is fetched by the builder before any card of it is drawn, on a Resources column nobody is looking at', async () => {
  /* REVIEW, 12 Oct: the builder's Bible job could be taken out with every check green. § */
  const admin = { name: 'Test Admin', personId: 'P001', person_id: 'P001', role: 'admin', roles: ['admin'], token: 't-adm' };
  const bibleDir = path.join(dir, '..', 'data', 'bible');
  const serve = url => {
    const m = /(?:^|\/)data\/bible\/([a-z0-9-]+\.json)(?:\?|$)/.exec(url);
    if (!m) return undefined;
    const p = path.join(bibleDir, m[1]);
    return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : null;
  };
  const { w } = await aheadBoot_({ serve, before: x => { try { x.localStorage.setItem('familyUser', JSON.stringify(admin)); } catch (e) {} } });
  const t = w.__t, bad = [];
  if (!t || typeof t.BIBLE !== 'function' || typeof w.bibleIndex_ !== 'function') return ['the Bible is not reachable — NOT checked'];
  t.go('feed', false, true);
  await aheadQuiet_(t);
  try { w.bibleIndex_(); } catch (e) {}
  for (let k = 0; k < 100 && !(t.BIBLE() && t.BIBLE().index); k++) await wait(50);
  if (!(t.BIBLE() && t.BIBLE().index)) return ['the Bible\'s index never landed — NOT checked'];
    t.RES().filters = [{ field: 'shelf', value: 'Writings' }, { field: 'wLanguage', value: 'English' }, { field: 'wText', value: 'King James Version (1611)' },
    { field: 'wCollection', value: 'Old Testament' }, { field: 'wSection', value: 'Torah' }, { field: 'wBook', value: 'Leviticus' }];
  t.PAGE().res = 0;
  /* WHO ASKED, at the moment of asking: `bibleLoad_` is where a book is asked for, and its fetch itself waits a
     microtask (`bibleGet_`), which runs after the slice has ended. */
  const net = [];
  const l0 = w.bibleLoad_;
  w.bibleLoad_ = function (n) { net.push({ n: Number(n), key: String(t.aheadRunning() || '') }); return l0.apply(this, arguments); };
  t.repaint();
  await aheadQuiet_(t);
  w.bibleLoad_ = l0;
  const lev = net.filter(x => x.n === 3);
  if (!t.aheadLog().some(x => x.key === 'paint:res')) bad.push('the builder never drew Resources, so this asked nothing');
  if (!lev.length) bad.push('Leviticus was never fetched after the builder drew Resources with it chosen');
  else if (!/^bible:/.test(lev[0].key)) bad.push('Leviticus was first asked for by ' + (lev[0].key || 'nothing in a slice') + ' — the builder\'s Bible job should ask before a card of it is drawn');
  return bad;
});

/* EVERY QUESTION CARRIES TWO VERIFIED TAGS, ORDINARY FUNNEL TAGS (388); the paper health score is gone. */
check('every question has an Accuracy and a Function tag on its card and as funnel answers; no health tile, no health facet (388)', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Past paper', key_stage: 'KS4', level: 'GCSE',
                 company: 'Edexcel', exam_board: 'Edexcel' };
  const R_ = o => Object.assign({}, base, o);
  const rows = [
    R_({ row_id: 'D-HX', paper_id: 'HX', kind: 'document', name: 'Paper 1 — June 2031', total_marks: '80' }),
    R_({ row_id: 'HX-1', paper_id: 'HX', kind: 'question', name: 'Paper 1 — June 2031', question: '1', marks: '4', html: '<p>Work out 3 + 4.</p>', answer: '7', accept: '7', answer_type: 'calculation', verified: 'True' }),
    R_({ row_id: 'HX-2', paper_id: 'HX', kind: 'question', name: 'Paper 1 — June 2031', question: '2', marks: '3', html: '<p>Work out 6 × 7.</p>', answer_type: 'calculation' }),
  ];
  /* A MEMBER: signed out, Find answers only Settings (C+, 1040). */
  const { w } = boot({ member: true, serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const need = ['verifyTags_', 'qtIncomplete_', 'qtMachine_', 'stuffQuestion', 'questionCard_', 'stuffItemsAll_', 'stuffFiltered', 'facetList']
    .filter(n => typeof w[n] !== 'function');
  if (need.length) return [need.join(', ') + ' not reachable — no tag was checked'];
  if (typeof w.paperHealth_ === 'function' || t.ACTIONS['paper-health']) bad.push('the paper health score or its tile handler is back');
  const host = d.createElement('div');
  d.body.appendChild(host);
  t.STUFF().filters = [];
    const all = w.stuffItemsAll_();
  const h1 = all.find(x => x.row && x.row.row_id === 'HX-1'), h2 = all.find(x => x.row && x.row.row_id === 'HX-2');
  if (!h1 || !h2) return ['the fixture paper did not come through the loader into Find'];
  const fnOf = x => (!w.qtIncomplete_(x.row).length && w.qtMachine_(x.row)) ? 'Function verified' : 'Function unverified';
  [[h1, 'Accuracy verified'], [h2, 'Accuracy unverified']].forEach(([x, acc]) => {
    host.innerHTML = w.questionCard_(x, 0);
    const said = (host.querySelector('.qcard-tags') || {}).textContent || '';
    if (said.indexOf(acc) === -1) bad.push(x.row.row_id + '\'s tag row lacks ' + acc + ': ' + JSON.stringify(said.replace(/\s+/g, ' ').trim()));
    if (said.indexOf(fnOf(x)) === -1) bad.push(x.row.row_id + '\'s tag row lacks ' + fnOf(x));
    if (/\b(Ready|Usable|Rough)\b/.test(said)) bad.push('a health band is in ' + x.row.row_id + '\'s tag row');
  });
  if (fnOf(h2) !== 'Function unverified') bad.push('HX-2 has no answer and still reads Function verified');
  const fields = w.facetList().map(f => f.field);
  ['accuracy', 'function'].forEach(f => { if (fields.indexOf(f) === -1) bad.push('the funnel has no ' + f + ' question'); });
  if (fields.indexOf('health') !== -1 || fields.indexOf('answerable') !== -1) bad.push('health is a finder question again');
  t.STUFF().filters = [{ field: 'accuracy', value: 'Accuracy verified' }];
  const hit = w.stuffFiltered().filter(x => x.kind === 'question').map(x => x.row.row_id);
  if (hit.join() !== 'HX-1') bad.push('picking Accuracy verified leaves ' + JSON.stringify(hit) + ', wanted HX-1');
  t.STUFF().filters = [{ field: 'paperId', value: 'HX' }];
  host.innerHTML = w.stuffQuestion();
  if (host.querySelector('[data-do="paper-health"]')) bad.push('a Health tile is under the chosen paper');
  /* AND THE TWO TAGS ARE ORDINARY ANSWERS INSIDE THE PAPER TOO (396): asked there by the one rule when they split it. */
  const accAt = [...host.querySelectorAll('[data-do="facet-pick"]')].map(b => b.dataset.field);
  const asks = w.facetList().filter(f => f.field === 'accuracy' && !w.facetWhy_(w.stuffFiltered(), f)).length;
  if (asks && accAt.indexOf('accuracy') < 0 && accAt.length === 0) bad.push('Accuracy splits the paper and nothing is asked');
  t.STUFF().filters = [];
  host.remove();
  return bad;
});

/* ---------- A TABLE'S BLANKS ARE CELLS, TYPED IN WHERE THEY STAND AND MARKED A CELL AT A TIME (docs/history/359) ---------- */
check('a fill-in table: its blanks are cells in the card, typing keeps them, Check marks each cell, and it is machine-marked', async () => {
  const base = { active: 'True', subject: 'Maths', document_type: 'Worksheet', key_stage: 'KS2', pages_checked: 'True' };
  const R_ = o => Object.assign({}, base, o);
  const rows = [
    R_({ row_id: 'D-CT', paper_id: 'CT', kind: 'document', name: 'Times grid' }),
    R_({ row_id: 'CT-1', paper_id: 'CT', kind: 'question', name: 'Times grid', question: '1', marks: '2', answer_type: 'annotate',
         html: '<p>Complete the table</p><table><tr><th></th><th>2</th><th>3</th></tr><tr><td>2</td><td>4</td><td></td></tr><tr><td>3</td><td></td><td>&nbsp;</td></tr></table>',
         answer: '6, 6, 9', cells: '- ; 6 ; 6 ; 9' }),
  ];
  const { w } = boot({ serve: url => (/data\/questions\.json/.test(url) ? rows : undefined) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (typeof w.questionCard_ !== 'function' || !A['qp-cells-check']) return ['questionCard_ or the qp-cells-check handler is not reachable — no cell was checked'];
  t.STUFF().filters = [];
  const x = w.stuffItemsAll_().find(i => i.row && i.row.row_id === 'CT-1');
  if (!x) return ['the fixture row did not reach Find'];
  const host = d.createElement('div');
  host.className = 'qcard-host';
  d.body.appendChild(host);
  host.innerHTML = w.questionCard_(x, 0);
  const cells = [...host.querySelectorAll('table[data-cells] .qp-cell')];
  if (cells.length !== 3) return ['the card\'s table holds ' + cells.length + ' cells, wanted 3 (the corner is not asked)'];
  if (host.querySelector('.qp-cells')) bad.push('the cells are drawn twice: in the table and in a row under it');
  const type = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('input', { bubbles: true })); };
  type(cells[0], '6'); type(cells[1], '7'); type(cells[2], '9');
  const go = host.querySelector('[data-do="qp-cells-check"]');
  if (!go) return bad.concat('no Check tile under the table');
  A['qp-cells-check'](go);
  const say = host.querySelector('.qp-cells-box .qp-verdict').textContent;
  if (say !== '2 of 3 cells right') bad.push('one wrong cell of three says ' + JSON.stringify(say));
  if (!cells[1].classList.contains('is-near') || !cells[0].classList.contains('is-right')) bad.push('the wrong cell and the right one are not told apart');
  host.innerHTML = w.questionCard_(x, 0);
  const back = [...host.querySelectorAll('.qp-cell')].map(c => c.value).join(',');
  if (back !== '6,7,9') bad.push('drawn again, the cells hold ' + JSON.stringify(back) + ' — what was typed is lost');
  const again = [...host.querySelectorAll('.qp-cell')];
  type(again[1], '6');
  A['qp-cells-check'](host.querySelector('[data-do="qp-cells-check"]'));
  if (host.querySelector('.qp-cells-box .qp-verdict').textContent !== 'Correct — every cell') bad.push('every cell right is not Correct');
  if (typeof w.qtMachine_ !== 'function' || !w.qtMachine_(x.row)) bad.push('a fill-in table with its cells is not machine-marked, so not Function verified');
  host.remove();
  return bad;
});

