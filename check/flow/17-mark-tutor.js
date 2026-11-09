/* ---------- BEFORE THE PAYLOAD SAYS WHETHER AI MARKING IS ON, MARK WITH AI WAITS — NEVER A PLAIN SEND AND "SWITCHED OFF" (review of 10 Oct) § */
check('submission: before the payload lands, an essay and a worded box draw Mark with AI waiting — no plain Send, no "switched off", nothing sent — and the payload decides the tile', async () => {
  const ESSAY = { kind: 'question', key: 'q:Q-AIW-E', name: 'Q5', marks: 40, subject: 'English Language', answerType: 'written',
    row: { row_id: 'Q-AIW-E', paper_id: 'P-AIW', subject: 'English Language', name: 'Paper 1' }, html: '<p>Write a story about a journey.</p>', answer: '<b>A compelling description</b> with a clear structure' };
  const WORDED = { kind: 'question', key: 'q:Q-AIW-W', name: 'Q9', marks: 3, subject: 'Science', answerType: 'explain',
    row: { row_id: 'Q-AIW-W', paper_id: 'P-AIW', subject: 'Science', name: 'Explain' }, html: '<p>Explain why.</p>', answer: '<b>Because</b> of the heat' };
  const bad = [];
  for (const on of [true, false]) {
    const tag = on ? 'AI marking on' : 'AI marking off';
    const pay = () => Object.assign(payload(), { features: SUB_FEATURES.concat(on ? ['aiMark', 'aiMarkWhole'] : []), aiMarking: on, submissions: { for: 'P7', mine: {} } });
    let release = null;
    const rows = [];
    const { w, sent } = boot({ payload: pay(), reply: ansBackend_({}, subBackend_(rows)),
      serve: u => (u.indexOf('script.google.com') === -1 ? undefined : new Promise(r => { release = () => r(pay()); })),
      before: win => { win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); win.localStorage.setItem('subMigrated:u:P7', '1'); } });
    await wait(300);
    if (!release || typeof w.awaiting_ !== 'function' || !w.awaiting_()) { bad.push(tag + ': the payload was not held — nothing was checked'); continue; }
    w.stuffItemsAll_ = () => [ESSAY, WORDED];
    const early = [];
    for (const X of [ESSAY, WORDED]) {
      const what = (X === ESSAY ? 'the essay' : 'the worded box') + ', ' + tag + ', the payload out';
      const card = subDraw_(w, X);
      early.push([X, card]);
      const mark = card.querySelector('.qp-compose');
      const ai = mark && mark.querySelector('.qp-ai-go');
      if (!ai) bad.push(what + ': no Mark with AI tile where it will stand');
      else if (!ai.disabled) bad.push(what + ': Mark with AI can be pressed before anybody knows AI marking is on');
      if (mark && mark.querySelector('[data-do="qp-send"]')) bad.push(what + ': drawn with the plain Send — pressed, it records an unmarked "Sent"');
      if (/switched on/.test(card.parentNode.textContent)) bad.push(what + ': says AI marking is not switched on, which nobody knows yet');
      ansType_(w, card.querySelector('.qp-ans-in'), 'He did not order them');
      /* THE ROUND TILE PRESSED, WHICHEVER IT IS — as the child presses it. */
      const go = ai || (mark && mark.querySelector('[data-do="qp-send"]'));
      if (go) go.click();
      if (typeof w.kpDone_ === 'function') { try { w.kpDone_(card.querySelector('.qp-ans-in')); } catch (e) {} }
    }
    await wait(80);
    /* NOTHING RECORDED: no press queued for the account (it would go up the moment the payload lets it), and
       nothing asked of the marker. */
    const queued = (() => { try { return JSON.parse(w.localStorage.getItem('subQ:u:P7') || '[]'); } catch (e) { return []; } })();
    if (rows.length || queued.length || sent.some(b => b.action === 'aiMark')) bad.push(tag + ', the payload out: a press was recorded — ' + JSON.stringify(queued.map(e => [e.key, e.verdict])) + ' queued, ' + rows.length + ' row(s), ' + sent.filter(b => b.action === 'aiMark').length + ' aiMark');
    release();
    for (let n = 0; n < 50 && w.awaiting_(); n++) await wait(100);
    await wait(100);
    /* THE CARDS DRAWN WHILE IT WAS OUT, NOT DRAWN AGAIN — as on a Find column held back from the repaint because a child is typing in it (`findKeep_`): § */
    if (on) early.forEach(([X, card]) => {
      const ai = card.parentNode.querySelector('.qp-ai-go');
      if (!ai || ai.disabled) bad.push((X === ESSAY ? 'the essay' : 'the worded box') + ', AI marking on, drawn before the payload and not drawn again: Mark with AI is ' + (ai ? 'still waiting (disabled) after the payload landed' : 'gone'));
    });
    for (const X of [ESSAY, WORDED]) {
      const what = (X === ESSAY ? 'the essay' : 'the worded box') + ', ' + tag + ', the payload landed';
      const card = subDraw_(w, X);
      const mark = card.querySelector('.qp-compose');
      const ai = mark && mark.querySelector('.qp-ai-go'), send = mark && mark.querySelector('[data-do="qp-send"]');
      if (on && (!ai || ai.disabled || send)) bad.push(what + ': wanted Mark with AI, pressable, and no plain Send');
      if (!on && (send || !ai || !ai.disabled)) bad.push(what + ': wanted the AI Check, unpressable, and no plain Send — a human never marks (round 3)');
      if (!on && X === ESSAY && !/switched on yet/.test(card.parentNode.textContent)) bad.push(what + ': the sheet does not say why nothing marks it');
    }
    w.__t.USER(null);
  }
  return bad;
});

/* ---------- EVERY SEND CARRIES THIS DEVICE'S CLOCK, SO THE SERVER CAN TAKE A SLOW ONE'S ERROR OUT (review of 10 Oct) § */
check('submission: every send carries this device’s clock as it sends, so the server can take a slow clock’s error out', async () => {
  const rows = [];
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: { for: 'P7', mine: {} } }), reply: ansBackend_({}, subBackend_(rows)), before: signedInAs_(ANS_ADA) });
  await wait(400);
  const bad = [];
  const card = subDraw_(w, SUB_SUM);
  ansType_(w, card.querySelector('.qp-ans-in'), '15');
  const t0 = Date.now();
  w.__t.ACTIONS['qp-check'](card.querySelector('.qp-check'));
  await wait(100);
  const two = Object.assign({}, SUB_SUM, { key: 'q:Q-SUB-2', row: Object.assign({}, SUB_SUM.row, { row_id: 'Q-SUB-2' }) });
  const c2 = subDraw_(w, two);
  ansType_(w, c2.querySelector('.qp-ans-in'), '14');
  w.__t.ACTIONS['qp-check'](c2.querySelector('.qp-check'));
  w.__t.ACTIONS['signout'](w.document.createElement('button'));
  await wait(200);
  const t1 = Date.now();
  const subs = sent.filter(b => b.action === 'submitAnswer');
  if (!subs.length) bad.push('nothing was sent — the clock was NOT checked');
  subs.forEach(b => { if (!(typeof b.sent === 'number' && b.sent >= t0 - 1000 && b.sent <= t1)) bad.push('a submitAnswer request carries sent=' + JSON.stringify(b.sent) + ' — wanted this device’s clock as it sent (' + t0 + '…' + t1 + ')'); });
  return bad;
});

/* ---------- "SENT", THEN A LETTER, AFTER AI MARKING WENT AWAY MID-VISIT (review of 9 Oct) ----------------------- */
check('submission: after AI marking switches off, the Check waits unpressable with no plain Send, and the line says why until the answer changes', async () => {
  const rows = [];
  const AIQ = { kind: 'question', key: 'q:Q-OFF-AI', name: 'Q9', marks: 3, subject: 'Science', sub: 'Explain', answerType: 'explain',
    row: { row_id: 'Q-OFF-AI', paper_id: 'P-OFF', subject: 'Science', name: 'Explain' }, html: '<p>Explain why.</p>', answer: '<b>Because</b> of the heat' };
  const { w, sent } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES.concat(['aiMark']), aiMarking: true }),
    reply: ansBackend_({}, subBackend_(rows, b => (b.action === 'aiMark' ? { success: false, why: 'ai-off', message: 'AI marking isn’t switched on' } : undefined))) });
  await wait(300);
  const bad = [], A = w.__t.ACTIONS;
  w.__t.USER(Object.assign({}, ANS_ADA));
  w.stuffItemsAll_ = () => [AIQ];
  const h = w.document.createElement('div');
  w.document.body.appendChild(h);
  h.innerHTML = w.questionCard_(AIQ, 0) + '<div class="tile-row">' + '' + '</div>';
  const inp = () => h.querySelector('.qp-ans-in');
  const out = () => (h.querySelector('.qp-verdict') || {}).textContent;
  const saved = () => savedWords_(h.querySelector('.qp-saved'));
  ansType_(w, inp(), 'because it is hot');
  A['qp-ai'](h.querySelector('.qp-ai-go'));
  await wait(80);
  /* ROUND 3: no plain Send takes the AI's place -- a human never marks -- and the Check stays, unpressable */
  if (h.querySelector('.qp-ai [data-do="qp-send"]')) bad.push('the server said ai-off and a plain Send took the AI Check\'s place');
  if (!h.querySelector('.qp-ai-go[disabled]')) bad.push('after ai-off the AI Check still presses');
  if (!/switched on/.test(out())) bad.push('the line does not say AI marking is off: ' + JSON.stringify(out()));
  /* TYPING WHILE THE LINE STILL SAYS IT KEEPS IT — it is the reason there is no mark. */
  ansType_(w, inp(), 'because it is hot.');
  if (!/switched on/.test(out())) bad.push('a letter typed under "AI marking isn’t switched on" took it off');
  if (rows.length) bad.push(rows.length + ' row(s) went up with nothing to mark them');
  if (saved() !== 'On this device until you send it') bad.push('the line under the box says ' + JSON.stringify(saved()));
  w.__t.USER(null);
  return bad;
});

/* THE VERDICT, HEARD (docs/history/340). § */
/* A RECORDING AUDIOCONTEXT WITH AN IPAD'S RULES. § */
const earFake_ = (w, rec) => {
  Object.assign(rec, { made: [], resumed: [], suspended: [], oscs: [], outs: [], acs: [], inPress: false, slow: 0, frozen: null });
  const param = v => {
    const p = { value: v, ev: [] };
    const put = kind => (x, t) => { p.ev.push([kind, x, t]); if (kind === 'set') p.value = x; return p; };
    p.setValueAtTime = put('set'); p.linearRampToValueAtTime = put('lin'); p.exponentialRampToValueAtTime = put('exp');
    p.setTargetAtTime = put('target'); p.cancelScheduledValues = t => { p.ev.push(['cancel', null, t]); return p; };
    return p;
  };
  function AC() {
    this.state = 'suspended';
    this.born = Date.now();
    this.destination = { kind: 'destination', to: [] };
    rec.made.push({ inPress: rec.inPress });
    rec.acs.push(this);
  }
  /* `rec.frozen` STOPS THE CLOCK, for a step that asks whether a sound still playing was cut: on a loaded
     machine the 30ms between two presses can be half a second, and a sound that has ended is not cut. */
  Object.defineProperty(AC.prototype, 'currentTime', { get() { return this.state !== 'running' ? 0 : rec.frozen !== null ? rec.frozen : (Date.now() - this.born) / 1000; } });
  /* `rec.slow` IS A WAKE THAT TAKES THAT MANY MILLISECONDS -- an iPad's first `resume()` after a while can
     take a beat, and a sound that starts too long after its press is about nothing (`MARK_LATE_MS`). */
  AC.prototype.resume = function () {
    rec.resumed.push({ inPress: rec.inPress, was: this.state });
    if (!rec.inPress) return Promise.reject(new Error('not inside a tap'));
    const ms = rec.slow;
    return (ms ? new Promise(r => setTimeout(r, ms)) : Promise.resolve()).then(() => { this.state = 'running'; });
  };
  /* EVERY `suspend()` WRITTEN DOWN, so a journey can ask that the context rests when nothing is playing. */
  AC.prototype.suspend = function () { rec.suspended.push({ at: Date.now(), was: this.state }); this.state = 'suspended'; return Promise.resolve(); };
  const node = (ac, kind) => ({ kind, to: [],
    connect(n) { this.to.push(n); if (n === ac.destination) rec.outs.push(this); return n; },
    disconnect() { this.cut = true; } });
  AC.prototype.createGain = function () { const n = node(this, 'gain'); n.gain = param(1); return n; };
  AC.prototype.createBiquadFilter = function () { const n = node(this, 'filter'); n.type = 'lowpass'; n.frequency = param(350); n.Q = param(1); return n; };
  AC.prototype.createOscillator = function () {
    const n = node(this, 'osc');
    n.type = 'sine'; n.frequency = param(447);
    n.start = t => { n.at = t; rec.oscs.push(n); };
    n.stop = t => { n.end = t; };
    return n;
  };
  w.AudioContext = AC;
};
/* WHAT WAS HEARD, IN ORDER: § */
const earHeard_ = rec => rec.outs.map(out => {
  const reach = n => n === out || (n.to || []).some(reach);
  const oscs = rec.oscs.filter(reach);
  const hz = oscs.map(o => { const s = o.frequency.ev.find(e => e[0] === 'set'); return s ? s[1] : o.frequency.value; });
  if (!oscs.length) return 'silence';
  if (oscs.every(o => o.type === 'sine') && hz.every(f => f >= 500)) return 'chime';
  if (oscs.some(o => /^(sawtooth|square)$/.test(o.type)) && hz.every(f => f < 300)) return 'buzzer';
  return oscs.map((o, i) => o.type + '@' + hz[i]).join('+');
});
/* A PRESS, AS A FINGER MAKES ONE: through the real dispatcher (`click()`), inside a tap. */
/* THESE JOURNEYS ARE ABOUT SOUND, pressed at machine speed: the dispatcher's 350 ms memory (534) is forgotten first, as a person's seconds between presses would. check/press-twice.js owns the timing. */
const earTap_ = (rec, el) => { try { el.ownerDocument.defaultView.__t.pressForget(); } catch (e) {} rec.inPress = true; try { el.click(); } finally { rec.inPress = false; } };
const earIn_ = (rec, fn) => { rec.inPress = true; try { fn(); } finally { rec.inPress = false; } };
/* AT REST: every context the app made is suspended -- asked again every 100ms for up to `ms`, because a
   timer only ever fires late on a loaded machine, never early. */
const earRests_ = async (rec, ms) => {
  for (let t = 0; t <= ms; t += 100) { if (rec.acs.length && rec.acs.every(a => a.state === 'suspended')) return true; await wait(100); }
  return false;
};
/* OUT OF SIGHT, AND BACK: `visibilityState` as the browser reports it, with or without the event. */
const earHide_ = (w, hidden, tell) => {
  if (hidden) Object.defineProperty(w.document, 'visibilityState', { value: 'hidden', configurable: true });
  else delete w.document.visibilityState;
  if (tell) w.document.dispatchEvent(new w.Event('visibilitychange'));
};
/* THE SOUND SWITCH, said the way the reels' Sound and Read aloud are said. */
const EAR_BASE_ = { kind: 'question', marks: 1, subject: 'Maths', sub: 'Sounds', row: { paper_id: 'P-EAR', subject: 'Maths', name: 'Sounds' } };
const earQ_ = (id, more) => Object.assign({}, EAR_BASE_, { key: 'q:' + id, name: 'Q' + id.slice(-1), row: Object.assign({}, EAR_BASE_.row, { row_id: id }) }, more);

check('mark sound: a right answer chimes once and a wrong one buzzes once, for every kind a press marks — and nothing that only draws a verdict makes a sound', async () => {
  const rec = {}, rows = [], server = {};
  const TYPED = earQ_('Q-EAR-1', { html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>', accept: '15' });
  const PICK = earQ_('Q-EAR-2', { html: '<p>Which is 4?</p>', choices: ['3', '4', '5'], choiceRight: [2], answer: '<b>4</b>' });
  const PICK2 = earQ_('Q-EAR-3', { html: '<p>Which is 4?</p>', choices: ['3', '4', '5'], choiceRight: [2], answer: '<b>4</b>' });
  const TWO = earQ_('Q-EAR-4', { html: '<p>Choose the two evens.</p>', choices: ['2', '3', '4'], choiceRight: [1, 3], answer: '<b>2 and 4</b>' });
  const OPEN = earQ_('Q-EAR-5', { html: '<p>Pick one.</p>', choices: ['a', 'b'], answer: 'either' });
  const ORD = earQ_('Q-EAR-6', { answerType: 'order', html: '<p>Smallest first.</p>', choices: ['3', '1', '2'], choiceRight: [2, 3, 1],
    choiceWays: [[2, 3, 1]], orderEnds: ['smallest', 'largest'], answer: '<b>1, 2, 3</b>' });
  const FREE = earQ_('Q-EAR-7', { answerType: 'calculation', accept: '', html: '<p>Work out the area.</p>', answer: '<b>42</b>' });
  const KEYS = earQ_('Q-EAR-8', { html: '<p>Work out 2 &times; 6.</p>', answer: '<b>12</b>', accept: '12' });
  const LAID = earQ_('Q-EAR-16', { html: '<p>Which is 4?</p>', choices: ['3', '4', '5'], choiceRight: [2], answer: '<b>4</b>' });
  const ALL = [TYPED, PICK, PICK2, TWO, OPEN, ORD, FREE, KEYS, LAID];
  const { w, errs } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }),
    reply: ansBackend_(server, subBackend_(rows)), before: win => earFake_(win, rec) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (typeof w.markPlay_ !== 'function' || typeof w.subRecord_ !== 'function') return ['markPlay_ or subRecord_ is not reachable — renamed? Nothing was listened to'];
  /* NEVER ON PAGE LOAD: no context made, nothing heard, before anybody has pressed anything. */
  if (rec.made.length || rec.outs.length) bad.push('the app made ' + rec.made.length + ' AudioContext(s) and ' + rec.outs.length + ' sound(s) at load, before any press');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => (held() || []).concat(ALL);
  const heard = () => earHeard_(rec);
  let was = 0;
  /* WHAT THE LAST STEP ADDED, and asked of it: exactly `want` (a list), or nothing. */
  const expect = (want, what) => {
    const now = heard().slice(was);
    was = heard().length;
    if (now.join(',') !== want.join(',')) bad.push(what + ' was heard as [' + now.join(', ') + '], wanted [' + want.join(', ') + ']');
  };
  const type = (card, v) => ansType_(w, card.querySelector('.qp-ans-in'), v);

  /* ---- SIGNED OUT: marked, and heard (a signed-out child is marked too). ---- */
  w.__t.USER(null);
  const anon = subDraw_(w, TYPED);
  earTap_(rec, anon.querySelector('.qp-check'));
  await wait(30);
  expect([], 'signed out, Check on an empty box ("Write something first")');
  type(anon, '16'); earTap_(rec, anon.querySelector('.qp-check')); await wait(30);
  expect(['buzzer'], 'signed out, a wrong Check');
  type(anon, '15'); earTap_(rec, anon.querySelector('.qp-check')); await wait(30);
  expect(['chime'], 'signed out, a right Check');
  if (!rec.made.length || !rec.made.every(m => m.inPress)) bad.push('the AudioContext was made ' + (rec.made.length ? 'outside a tap' : 'never') + ' — an iPad keeps one made outside a tap silent');
  if (!rec.resumed.some(r => r.inPress)) bad.push('the AudioContext was never resumed inside a tap — an iPad\'s starts suspended');

  /* ---- SIGNED IN, and a second copy of the card on the page (Saved beside Find). ---- */
  w.__t.USER(Object.assign({}, ANS_ADA));
  const card = subDraw_(w, TYPED), copy = subDraw_(w, TYPED);
  type(card, '16'); earTap_(rec, card.querySelector('.qp-check')); await wait(30);
  expect(['buzzer'], 'signed in, a wrong Check with a second copy of the card on the page');
  type(card, '15'); earTap_(rec, card.querySelector('.qp-check')); await wait(30);
  expect(['chime'], 'signed in, a right Check with a second copy of the card on the page');
  if (subSlotOf_(copy).textContent !== 'Correct') bad.push('the second copy\'s slot says ' + JSON.stringify(subSlotOf_(copy).textContent) + ' — it was not a copy of the card pressed, so "one per copy" was not asked');

  /* THE SESSION GONE WITH THE CARD STILL IN FRONT: § */
  w.__t.USER(null);
  const subsBefore = JSON.stringify(w.subAll_('u:P7'));
  type(card, '15'); earTap_(rec, card.querySelector('.qp-check')); await wait(30);
  expect(['chime'], 'Check on a card still keyed to a person whose session has ended, drawn "Correct"');
  if ((card.querySelector('.qp-verdict') || {}).textContent !== 'Correct') bad.push('the held card said ' + JSON.stringify((card.querySelector('.qp-verdict') || {}).textContent) + ' — not the "Correct" the sound was meant to agree with');
  if (JSON.stringify(w.subAll_('u:P7')) !== subsBefore) bad.push('a press on a card keyed to a person who is not signed in was recorded for them');
  w.__t.USER(Object.assign({}, ANS_ADA));

  /* ---- TWO PRESSES AT ONCE: two sounds, and the first is cut, never under the second. ---- */
  type(card, '16'); earTap_(rec, card.querySelector('.qp-check'));
  type(card, '15'); earTap_(rec, card.querySelector('.qp-check'));
  await wait(120);
  expect(['buzzer', 'chime'], 'a wrong Check and a right one straight after');
  const first = rec.outs[rec.outs.length - 2];
  const cut = first && first.gain.ev.findIndex(e => e[0] === 'cancel');
  if (!first || cut < 0 || !first.gain.ev.slice(cut).some(e => e[0] === 'lin' && e[1] === 0) || !first.cut) {
    bad.push('the second press did not cut the first sound (its gain cancelled and ramped to 0, then disconnected): ' + JSON.stringify(first && first.gain.ev));
  }

  /* ---- OPTIONS AND AN ORDERING ARE TYPED (owner, 9 Nov): Check on the letters is the press, heard like any other. ---- */
  const tc = (card, x, v) => earIn_(rec, () => typeChoice_(w, card, x, v));
  const pick = subDraw_(w, PICK);
  tc(pick, PICK, 'A'); await wait(30);
  expect(['buzzer'], 'a wrong letter');
  tc(pick, PICK, 'B'); await wait(30);
  expect(['chime'], 'a second, right letter after a wrong one');
  const two = subDraw_(w, TWO);
  tc(two, TWO, 'A, C'); await wait(30);
  expect(['chime'], 'the two letters of a right "choose two"');
  const open = subDraw_(w, OPEN);
  if (!open.querySelector('[data-do="qp-noscheme"]')) bad.push('options with no key do not say so on their Check');
  const ord = subDraw_(w, ORD);
  tc(ord, ORD, 'B, C, A'); await wait(30);
  expect(['chime'], 'Check on the right order');
  tc(ord, ORD, 'C, B, A'); await wait(30);
  expect(['buzzer'], 'Check on a wrong order');

  /* ---- A BOX NO RULE MARKS (round 3: its Check is the AI's, never a plain Send): no verdict here, so silent. ---- */
  const free = subDraw_(w, FREE);
  type(free, '42'); earTap_(rec, free.querySelector('.qt-row .is-submit')); await wait(30);
  expect([], 'the AI\'s Check on a box with no scheme, with no mark back');

  /* ---- THE KEYPAD'S ✓ AND A LAPTOP'S ENTER: the box's own Check, called with no click. ---- */
  const keys = subDraw_(w, KEYS);
  const ki = keys.querySelector('.kp-in');
  const pad = () => d.getElementById('kp');
  const key = v => { const b = pad() && pad().querySelector('.kp-key[data-v="' + v + '"]'); if (b) earIn_(rec, () => A['kp-key'](b)); else bad.push('no key ' + v + ' on the pad'); };
  if (!ki) bad.push('the keypad card drew no pad box — ✓ was NOT pressed');
  else {
    ki.focus(); key('1'); key('3'); key('!done'); await wait(30);
    expect(['buzzer'], '✓ on the keypad with a wrong answer');
    ki.focus();
    earIn_(rec, () => { ki.value = '12'; ki.dispatchEvent(new w.Event('input', { bubbles: true })); });
    earIn_(rec, () => ki.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })));
    await wait(30);
    expect(['chime'], 'Enter on a laptop with the right answer');
  }

  /* ---- NOTHING THAT ONLY DRAWS A VERDICT. ---- */
  /* WITH THE CONTEXT AWAKE before each of these, as it is in the second after a press: § */
  const awake = () => { if (typeof w.markRest_ === 'function') w.markRest_(-1); rec.acs.forEach(a => { a.state = 'running'; }); };
  awake();
  was = heard().length;
  const k = w.__t.ansKey(TYPED);
  w.subPaintAll_(); w.subBoxPaint_(k); w.subPaint_(k);
  if (typeof w.ansRefresh_ === 'function') w.ansRefresh_([k, w.__t.ansKey(PICK), w.__t.ansKey(ORD)]);
  await wait(30);
  expect([], 'the slots and the boxes painted again (subPaintAll_, subBoxPaint_, ansRefresh_)');
  awake();
  type(card, '17'); type(card, '15'); await wait(30);
  expect([], 'a box typed away from its answer and back, so "Correct" is drawn again');
  if ((card.querySelector('.qp-verdict') || {}).textContent !== 'Correct') bad.push('typed back to its answer, the box says ' + JSON.stringify((card.querySelector('.qp-verdict') || {}).textContent) + ' — the verdict was not drawn again, so its silence proves nothing');
  awake();
  w.__t.repaint(); await wait(60);
  expect([], 'the column repainted');
  /* THE ACCOUNT'S COPY: a press from another device, newer, laid on by the payload and by the pull. */
  rows.push({ pid: 'P7', id: '1760000000201-ear001', key: 'q:Q-EAR-1', answer: '15', verdict: 'right', at: Date.now() + 5000 });
  rows.push({ pid: 'P7', id: '1760000000202-ear002', key: 'q:Q-EAR-3', answer: '1', verdict: 'wrong', at: Date.now() + 5000 });
  w.__t.DATA().submissions = subMine_(rows, 'P7');
  awake();
  w.adoptMarks_(); await wait(60);
  expect([], 'a payload landing with the account\'s presses (adoptMarks_)');
  /* THE PULL, LAYING A PICK ON: § */
  const laid = subDraw_(w, LAID);
  awake();
  const lk = w.__t.ansKey(LAID), feats = w.__t.DATA().features;
  const laidWas = laid.parentNode.innerHTML;
  w.__t.DATA().features = feats.filter(f => f !== 'submitAnswer');
  server['ans:q:Q-EAR-16'] = { v: '2', at: Date.now() + 9000 };
  if (typeof w.answersPull_ === 'function') { await w.answersPull_(true); await wait(60); }
  else bad.push('answersPull_ is not reachable — the account pull was NOT listened to');
  w.__t.DATA().features = feats;
  expect([], 'the account pulled (answersPull_), laying a right pick on a card');
  if (w.ansRead_(lk) !== '2' || laid.parentNode.innerHTML === laidWas) bad.push('the pull laid nothing on (the box reads ' + JSON.stringify(w.ansRead_(lk)) + (laid.parentNode.innerHTML === laidWas ? ', the card unchanged' : '') + ') — so its silence proves nothing');
  awake();
  w.dispatchEvent(new w.StorageEvent('storage', { key: k, newValue: '16' }));
  w.dispatchEvent(new w.StorageEvent('storage', { key: k, newValue: '15' }));
  await wait(30);
  expect([], 'another tab writing the answer');
  /* SHOW THE ANSWER: a reveal, not a verdict. */
  awake();
  const ah = d.createElement('div');
  d.body.appendChild(ah);
  ah.innerHTML = w.questionAnsCard_(TYPED);
  const show = ah.querySelector('[data-do="qa-show"]');
  if (!show) bad.push('the answer page has no Show — the reveal was NOT listened to');
  else { earTap_(rec, show); await wait(30); expect([], 'Show the answer'); }
  w.stuffItemsAll_ = held;
  w.__t.USER(null);

  /* ---- AND A RELOAD: the same account, a fresh window, every verdict drawn — and nothing heard. ---- */
  const rec2 = {};
  const b2 = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES, submissions: subMine_(rows, 'P7') }),
    reply: ansBackend_(server, subBackend_(rows)),
    before: win => { earFake_(win, rec2); win.localStorage.setItem('familyUser', JSON.stringify(ANS_ADA)); } });
  await wait(500);
  b2.w.stuffItemsAll_ = () => ALL;
  const again = subDraw_(b2.w, TYPED);
  subDraw_(b2.w, PICK2);
  await wait(60);
  if (subSlotOf_(again).textContent !== 'Correct') bad.push('reloaded, the card says ' + JSON.stringify(subSlotOf_(again).textContent) + ' — its verdict was not drawn, so its silence proves nothing');
  if (rec2.made.length || rec2.outs.length) bad.push('a reload drawing the account\'s verdicts made ' + rec2.made.length + ' AudioContext(s) and was heard as [' + earHeard_(rec2).join(', ') + '] — never on page load');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

check('mark sound: Mark with AI wakes the sound at the press, and its marks are heard when they land — full a chime, none the buzzer, a part mark and a child who has moved on nothing', async () => {
  const rec = {}, rows = [];
  let land = null;
  const AIQ = earQ_('Q-EAR-9', { marks: 3, subject: 'Science', answerType: 'explain', accept: '',
    html: '<p>Explain why the rate increases.</p>', answer: 'Particles move faster &mdash; more frequent collisions.' });
  /* ANOTHER QUESTION: what takes the AI card's page when the list under it changes, and a Check pressed
     beside it while it marks. */
  const NEXT = earQ_('Q-EAR-10', { html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>', accept: '15' });
  const { w, sent, errs } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES.concat(['aiMark']), aiMarking: true }),
    reply: ansBackend_({}, subBackend_(rows, b => (b.action === 'aiMark' ? new Promise(r => { land = r; }) : undefined))),
    before: win => earFake_(win, rec) });
  await wait(300);
  const d = w.document, bad = [];
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => (held() || []).concat([AIQ, NEXT]);
  w.__t.USER(Object.assign({}, ANS_ADA));
  /* THE CARD IN FRONT, IN A COLUMN WITH PAGES TO TURN -- Tools' pages, holding the card as Find and Saved do. § */
  const COL = 'shop';   /* Tools went into Find (790); the shop is a column of pages too */
  w.__t.go(COL, false, true);
  await wait(60);
  const pageAt = n => d.querySelectorAll('#s-' + COL + ' > .page')[n];
  const front = () => [...d.querySelectorAll('#s-' + COL + ' > .page')].findIndex(p => p.classList.contains('on'));
  /* A PAGE'S CARDS, DRAWN AFRESH -- new markup, as the funnel's redraws make it. */
  const put = (n, xs) => {
    const pg = pageAt(n), pane = pg.querySelector(':scope > .pane') || pg;
    pane.innerHTML = xs.map(x => '<div>' + w.questionCard_(x, 0) + '<div class="tile-row">' + '' + '</div></div>').join('');
    return [...pane.querySelectorAll('.qcard')];
  };
  let [card] = put(0, [AIQ]);
  if (front() !== 0) bad.push('setup: page ' + front() + ' of ' + COL + ' is in front, not the first');
  const go = c => c.querySelector('.qp-ai-go[data-do="qp-ai"]');
  const slot = c => (subSlotOf_(c) || {}).textContent;
  if (!go(card)) return ['the worded card drew no Mark with AI — nothing was pressed'];
  if (card.parentNode.querySelector('.mark-sound, [data-do="mark-sound"]')) bad.push('a card Mark with AI can mark still has a sound switch (374: there is none)');
  let asked = 0;
  /* ONE PRESS AND ITS LANDING. `move` runs while it marks and may hand back the copy of the card that is
     drawn now; what was heard from the press to the landing is returned with it. */
  const ask = async (c, text, marks, move) => {
    ansType_(w, c.querySelector('.qp-ans-in'), text);
    land = null;
    /* ASLEEP BEFORE EVERY PRESS, as an iPad leaves it after a phone call or the app going away: so each
       press must wake it inside the tap, or the marks that land after the network are silent. */
    rec.acs.forEach(a => { a.state = 'suspended'; });
    const n = rec.outs.length;
    earTap_(rec, go(c));
    await wait(30);
    if (!land) { bad.push('"' + text + '": the press sent no aiMark'); return { heard: [], c }; }
    asked++;
    if (rec.outs.length !== n) bad.push('"' + text + '": a sound was heard before the marks arrived');
    const now = move ? await move() : null;
    land({ success: true, awarded: marks[0], available: marks[1], feedback: 'A sentence about it.' });
    await wait(80);
    return { heard: earHeard_(rec).slice(n), c: now || c };
  };
  let r = await ask(card, 'The particles move faster so they collide more often with enough energy.', [3, 3]);
  if (r.heard.join(',') !== 'chime') bad.push('3 of 3 marks from the AI was heard as [' + r.heard.join(', ') + '], wanted [chime]');
  r = await ask(card, 'Because.', [0, 3]);
  if (r.heard.join(',') !== 'buzzer') bad.push('0 of 3 marks from the AI was heard as [' + r.heard.join(', ') + '], wanted [buzzer]');
  r = await ask(card, 'The particles move faster.', [2, 3]);
  if (r.heard.length) bad.push('2 of 3 marks — a part mark, neither right nor wrong — was heard as [' + r.heard.join(', ') + ']');
  if (slot(card) !== '2/3') bad.push('the part mark was not drawn in the slot: ' + JSON.stringify(slot(card)));

  /* ---- MOVED ON WHILE IT MARKED: drawn in the slot, not heard over whatever is in front now. ---- */
  const away = (w.__t.TABS.find(t => t.id !== COL) || {}).id;
  r = await ask(card, 'The particles move faster and collide more often.', [3, 3], async () => { w.__t.go(away, false, true); await wait(30); });
  if (r.heard.length) bad.push('marks that landed after the child had gone to another column were heard as [' + r.heard.join(', ') + ']');
  if (slot(card) !== '3/3') bad.push('marks that landed after the child had gone were not drawn in the slot for when they come back: ' + JSON.stringify(slot(card)));
  w.__t.go(COL, false, true);
  await wait(60);
  /* THE NEXT PAGE OF THE SAME COLUMN -- the commonest way on: one swipe, the next question. */
  r = await ask(card, 'Particles collide more often.', [0, 3], async () => {
    w.__t.goPage(COL, 1, true); await wait(30);
    if (front() !== 1) bad.push('setup: a swipe to the next page left page ' + front() + ' in front');
  });
  if (r.heard.length) bad.push('marks that landed after the child had swiped to the next page of the same column were heard as [' + r.heard.join(', ') + '] — a buzzer over the next question');
  w.__t.goPage(COL, 0, true);
  await wait(30);
  /* ANOTHER CARD ON THE SAME PAGE NUMBER -- the list under the page changed while it marked (a star taken off on Saved, one more row in front on Find): § */
  r = await ask(card, 'Faster particles, more collisions.', [0, 3], async () => { put(0, [NEXT]); await wait(10); });
  if (r.heard.length) bad.push('marks that landed with a different question now on the same page number were heard as [' + r.heard.join(', ') + '] — over a question nobody asked it about');
  /* AND THE SAME CARD ON A NEW PAGE NUMBER -- the app followed it there (`stuffBackTo_`): the child never
     left it, so it is heard. */
  [card] = put(0, [AIQ]);
  r = await ask(card, 'The particles gain energy and collide more often.', [3, 3], async () => {
    put(0, [NEXT]);
    const [moved] = put(1, [AIQ]);
    w.__t.goPage(COL, 1, true); await wait(30);
    return moved;
  });
  if (r.heard.join(',') !== 'chime') bad.push('marks that landed on the same card, followed to a new page number while it marked, were heard as [' + r.heard.join(', ') + '], wanted [chime] — the child never left it');
  if (slot(r.c) !== '3/3') bad.push('the card followed to a new page did not draw its 3/3: ' + JSON.stringify(slot(r.c)));
  card = r.c;
  /* OUT OF SIGHT AS IT LANDS -- asked of `visibilityState` alone, with no event, so the suspend the event
     makes cannot be what silences it. */
  r = await ask(card, 'More energy, more collisions.', [0, 3], async () => { earHide_(w, true, false); });
  earHide_(w, false, false);
  if (r.heard.length) bad.push('marks that landed while the app was out of sight were heard as [' + r.heard.join(', ') + ']');

  /* ---- A CHECK BESIDE IT WHILE IT MARKS, and longer than the context's rest before the marks land: the
     context is held awake for the marks, because one asleep when they land wakes only from a tap. ---- */
  const [aiC, chk] = put(1, [AIQ, NEXT]);
  r = await ask(aiC, 'The particles move faster so they collide more often.', [3, 3], async () => {
    ansType_(w, chk.querySelector('.qp-ans-in'), '16');
    earTap_(rec, chk.querySelector('.qp-check'));
    await wait(2500);
    if (rec.acs.some(a => a.state !== 'running')) bad.push('the context went to rest while Mark with AI was still marking — its marks land on a context only a tap can wake');
  });
  if (r.heard.join(',') !== 'buzzer,chime') bad.push('a wrong Check while Mark with AI marked, and then 3 of 3, were heard as [' + r.heard.join(', ') + '], wanted [buzzer, chime]');
  /* AND AT REST AFTERWARDS: nothing playing, nothing waiting. */
  if (!(await earRests_(rec, 4000))) bad.push('four seconds after the last sound, with nothing waiting, the context is ' + rec.acs.map(a => a.state).join(', ') + ' — left running it holds a phone\'s audio awake');
  card = aiC;

  if (rec.made.some(m => !m.inPress)) bad.push('an AudioContext was made outside a tap');
  if (rec.made.length > 1) bad.push(rec.made.length + ' AudioContexts were made — one for the visit, woken each press');
  const ai = sent.filter(b => b.action === 'aiMark').length;
  if (ai !== asked) bad.push(ai + ' aiMark requests went, wanted ' + asked + ' — the journey did not press what it says');
  w.stuffItemsAll_ = held;
  w.__t.USER(null);

  /* ---- A DEVICE LEFT OFF BY THE OLD SWITCH (before 374): forgotten, so Mark with AI landing none is heard. ---- */
  const rec2 = {};
  let land2 = null;
  const b2 = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES.concat(['aiMark']), aiMarking: true }),
    reply: ansBackend_({}, subBackend_([], b => (b.action === 'aiMark' ? new Promise(res => { land2 = res; }) : undefined))),
    before: win => { earFake_(win, rec2); win.localStorage.setItem('mark-sound', '0'); } });
  await wait(300);
  b2.w.__t.USER(Object.assign({}, ANS_ADA));
  b2.w.stuffItemsAll_ = () => [AIQ];
  const off = subDraw_(b2.w, AIQ);
  ansType_(b2.w, off.querySelector('.qp-ans-in'), 'The particles move faster so they collide more often.');
  earTap_(rec2, go(off));
  await wait(30);
  if (!land2) bad.push('a device left off: the press sent no aiMark — nothing was asked');
  else {
    land2({ success: true, awarded: 0, available: 3, feedback: 'x' });
    await wait(80);
    if (rec2.made.length !== 1) bad.push('a device the old switch left off pressed Mark with AI: ' + rec2.made.length + ' AudioContext(s) woken at the press, wanted 1 — there is no switch now');
    let kept2 = 'unread'; try { kept2 = b2.w.localStorage.getItem('mark-sound'); } catch (e) {}
    if (kept2 !== null) bad.push('the old switch\'s setting is still on the device: mark-sound is ' + JSON.stringify(kept2));
  }
  b2.w.__t.USER(null);
  if (errs.length || b2.errs.length) bad.push('errors: ' + errs.concat(b2.errs).join(' | '));
  return bad;
});

check('mark sound: there is no switch (374) — no sound tile on any card, signed in or out, and a device the old switch left off hears a right Check chime and a wrong one buzz', async () => {
  const rec = {};
  const TYPED = earQ_('Q-EAR-11', { html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>', accept: '15' });
  const PICK = earQ_('Q-EAR-12', { html: '<p>Which is 4?</p>', choices: ['3', '4', '5'], choiceRight: [2], answer: '<b>4</b>' });
  const ORD = earQ_('Q-EAR-13', { answerType: 'order', html: '<p>Smallest first.</p>', choices: ['3', '1', '2'], choiceRight: [2, 3, 1],
    choiceWays: [[2, 3, 1]], orderEnds: ['smallest', 'largest'], answer: '<b>1, 2, 3</b>' });
  const FREE = earQ_('Q-EAR-14', { answerType: 'calculation', accept: '', html: '<p>Work out the area.</p>', answer: '<b>42</b>' });
  const ALL = [TYPED, PICK, ORD, FREE];
  const { w, errs } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), before: win => { earFake_(win, rec); win.localStorage.setItem('mark-sound', '0'); } });
  await wait(300);
  const bad = [];
  w.stuffItemsAll_ = () => ALL;
  const sw = c => c.parentNode.querySelector('.mark-sound, [data-do="mark-sound"]');
  if (typeof w.markSoundTile_ === 'function') bad.push('markSoundTile_ still exists');
  for (const who of [Object.assign({}, ANS_ADA), null]) {
    w.__t.USER(who);
    ALL.forEach(x => { const c = subDraw_(w, x); if (sw(c)) bad.push(x.row.row_id + (who ? ' signed in' : ' signed out') + ' still draws a sound switch'); c.parentNode.remove(); });
  }
  let kept = 'unread'; try { kept = w.localStorage.getItem('mark-sound'); } catch (e) {}
  if (kept !== null) bad.push('the old switch\'s setting is still on the device: mark-sound is ' + JSON.stringify(kept));
  w.__t.USER(Object.assign({}, ANS_ADA));
  const c = subDraw_(w, TYPED);
  ansType_(w, c.querySelector('.qp-ans-in'), '15'); earTap_(rec, c.querySelector('.qp-check'));
  await wait(40);
  ansType_(w, c.querySelector('.qp-ans-in'), '16'); earTap_(rec, c.querySelector('.qp-check'));
  await wait(40);
  if (earHeard_(rec).join(',') !== 'chime,buzzer') bad.push('a device the old switch left off: a right then a wrong Check were heard as [' + earHeard_(rec).join(', ') + '], wanted [chime, buzzer]');
  w.__t.USER(null);
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

check('mark sound: the context rests when nothing is playing — a second after a sound ends and when the app goes out of sight — the next press wakes it, and a sound that cannot start in time is dropped', async () => {
  const rec = {};
  const TYPED = earQ_('Q-EAR-17', { html: '<p>Work out 3 &times; 5.</p>', answer: '<b>15</b>', accept: '15' });
  const { w, errs } = boot({ payload: Object.assign(payload(), { features: SUB_FEATURES }), before: win => earFake_(win, rec) });
  await wait(300);
  const bad = [];
  w.stuffItemsAll_ = () => [TYPED];
  const c = subDraw_(w, TYPED);
  const press = async v => { ansType_(w, c.querySelector('.qp-ans-in'), v); earTap_(rec, c.querySelector('.qp-check')); await wait(40); };
  const pressedAt = Date.now();
  await press('16');
  if (earHeard_(rec).join(',') !== 'buzzer') return ['setup: a wrong Check was heard as [' + earHeard_(rec).join(', ') + '], wanted [buzzer] — nothing else was asked'];
  /* NOT WHILE IT PLAYS, nor the moment it ends: § */
  await wait(560);
  const early = rec.suspended.filter(x => x.at - pressedAt < 1000);
  if (early.length) bad.push('the context was put to rest ' + (early[0].at - pressedAt) + 'ms after the press — while the buzzer was still sounding, or straight after it');
  /* AND A SECOND AFTER IT ENDS: a running context with nothing to play holds a phone's audio output awake. */
  if (!(await earRests_(rec, 4000))) bad.push('four seconds after the buzzer ended the context is still ' + rec.acs.map(a => a.state).join(', ') + ' — left running with nothing to play');
  /* THE NEXT PRESS WAKES IT INSIDE ITS TAP, and is heard. */
  const r0 = rec.resumed.length;
  await press('15');
  if (earHeard_(rec).join(',') !== 'buzzer,chime') bad.push('the press after the context rested was heard as [' + earHeard_(rec).slice(1).join(', ') + '], wanted [chime]');
  if (!rec.resumed.slice(r0).some(x => x.inPress)) bad.push('the press after the context rested did not wake it inside its tap');
  /* OUT OF SIGHT: suspended at once, with or without a sound playing. */
  const s0 = rec.suspended.length;
  earHide_(w, true, true);
  await wait(30);
  if (rec.suspended.length === s0 || rec.acs.some(a => a.state !== 'suspended')) bad.push('the app went out of sight and the context was left ' + rec.acs.map(a => a.state).join(', '));
  earHide_(w, false, true);
  await wait(30);
  /* A WAKE SLOWER THAN `MARK_LATE_MS`: the moment has gone, and a buzzer most of a second after the press
     would be about nothing on the screen. The next press, woken quickly, is heard. */
  w.markRest_(-1);
  rec.acs.forEach(a => { a.state = 'suspended'; });
  rec.slow = 800;
  await press('16');
  await wait(900);
  rec.slow = 0;
  /* PAST SUB_TWICE_MS (508): the same answer again inside a second is a double tap, recorded once and heard once. */
  await wait(200);
  const slowHeard = earHeard_(rec).slice(2);
  if (slowHeard.length) bad.push('a context that took 800ms to wake still played [' + slowHeard.join(', ') + '] — over half a second after the press');
  await press('16');
  if (earHeard_(rec).slice(2).join(',') !== 'buzzer') bad.push('the press after the slow wake was heard as [' + earHeard_(rec).slice(2).join(', ') + '], wanted [buzzer]');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- A TUTOR'S HOURS ON THEIR CARD § */
check('a tutor\'s ticked hours are on their card as lines (467), taught ones said apart, and none says they cannot be booked', async () => {
  const { w } = boot();
  const d = w.document;
  await wait(300);
  if (typeof w.findCard !== 'function') return ['findCard is not reachable, so the card\'s week was NOT checked — not a pass'];
  const avail = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) avail[p + String(h).padStart(2, '0')] = ''; });
  ['m16', 'm17', 'sa10', 'su18'].forEach(c => { avail[c] = 'TRUE'; });
  const t = { title: 'Ada Tutor', handle: 'ada', rate: 30, teaches: [], listed: true, personId: 'P-x',
              avail, busy: { m17: 'Maths' } };
  const box = d.createElement('div');
  box.innerHTML = String(w.findCard({ kind: 'tutor', row: t }) || '');
  const bad = [];
  const caps = [...box.querySelectorAll('.prof-cap')].map(c => c.textContent.trim());
  if (!caps.includes('Available')) bad.push('a tutor with hours ticked has no "Available" caption on their card');
  /* LINES, NOT A GRID (467): each day its hours merged, the taught ones said after. */
  const line = ((box.querySelector('.prof-week .prof-hour-line') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  if (line !== 'Mon 16:00–17:00, Sat 10:00–11:00, Sun 18:00–19:00') bad.push('the card\'s hours read "' + line + '", wanted "Mon 16:00–17:00, Sat 10:00–11:00, Sun 18:00–19:00"');
  const key = ((box.querySelector('.prof-week .prof-key') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  if (key !== 'Already teaching Mon 17:00–18:00') bad.push('the taught hour reads "' + key + '", wanted "Already teaching Mon 17:00–18:00"');
  if (box.querySelector('.prof-week .hr, .prof-week .slot-row')) bad.push('the card still draws a grid of hours');
  if (box.querySelector('.prof-week button, .prof-week input, .prof-week label')) bad.push('the card\'s hours hold a control, so they can be pressed and are counted as a tap target');
  if (!/Monday 16:00/.test(((box.querySelector('.prof-week') || {}).getAttribute || (() => ''))
      .call(box.querySelector('.prof-week'), 'aria-label') || '')) bad.push('the card\'s week does not say its hours to a screen reader');
  const none = d.createElement('div');
  none.innerHTML = String(w.findCard({ kind: 'tutor', row: Object.assign({}, t, { avail: Object.assign({}, avail, { m16: '', m17: '', sa10: '', su18: '' }) }) }) || '');
  if (none.querySelector('.prof-week')) bad.push('a tutor with no hours ticked is drawn with a week anyway');
  /* AND SAYS WHY THEY CANNOT BE BOOKED BY NAME — *"tutor with no hours wont be bookable"*. It drew
     nothing at all, which left the greyed name in the booking form unexplained. */
  if (!/hasn.t set usual hours yet/i.test((none.querySelector('.prof-nohours') || {}).textContent || '')) {
    bad.push('a tutor with no hours ticked does not say "hasn\'t set usual hours yet" on their card');
  }
  return bad;
});

/* ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THEIR CARD § */
check('a tutor\'s card draws only the days they work, and ticks outside the span say no free hours', async () => {
  const { w } = boot();
  const d = w.document;
  await wait(300);
  if (typeof w.findCard !== 'function') return ['findCard is not reachable, so the card\'s days were NOT checked — not a pass'];
  const blank = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) blank[p + String(h).padStart(2, '0')] = ''; });
  const card = (avail, busy) => {
    const box = d.createElement('div');
    box.innerHTML = String(w.findCard({ kind: 'tutor', row: { title: 'Tia Tutor', handle: 'tia', rate: 30, teaches: [],
      listed: true, personId: 'P-t', avail: Object.assign({}, blank, avail), busy: busy || {} } }) || '');
    return box;
  };
  const days = box => [...box.querySelectorAll('.prof-week .prof-day')].map(r => r.textContent.trim().split(' ')[0]).join(' ');
  const bad = [];
  const two = card({ tu10: 'TRUE', tu11: 'TRUE', th16: 'TRUE' });
  if (days(two) !== 'Tue Thu') bad.push('a tutor with Tuesday and Thursday hours draws [' + days(two) + '], wanted exactly [Tue Thu]');
  if (!/^Available Tuesday 10:00, 11:00; Thursday 16:00$/.test((two.querySelector('.prof-week') || { getAttribute: () => '' }).getAttribute('aria-label') || '')) {
    bad.push('the card\'s week reads "' + ((two.querySelector('.prof-week') || { getAttribute: () => '' }).getAttribute('aria-label')) + '" to a screen reader');
  }
  /* A DAY WHOSE ONLY TICKED HOUR IS ALREADY TAUGHT IS STILL A DAY THEY WORK — greyed, not gone. */
  const taught = card({ tu10: 'TRUE', th16: 'TRUE' }, { th16: 'Maths' });
  if (days(taught) !== 'Tue Thu') bad.push('a Thursday whose ticked hour is already taught is drawn as [' + days(taught) + '], wanted [Tue Thu]');
  if (((two.querySelector('.prof-hour-line') || {}).textContent || '').trim() !== 'Tue 10:00–12:00, Thu 16:00–17:00') bad.push('two hours in a row are not merged: "' + ((two.querySelector('.prof-hour-line') || {}).textContent || '').trim() + '"');
  const key = taught.querySelector('.prof-week .prof-key');
  if (!key || key.textContent.replace(/\s+/g, ' ').trim() !== 'Already teaching Thu 16:00–17:00') bad.push('a week with a taught hour does not say it: ' + (key ? '"' + key.textContent.trim() + '"' : 'no line'));
  if (two.querySelector('.prof-key')) bad.push('a week with nothing taught still draws the "already teaching" key');
  const taughtSaid = (taught.querySelector('.prof-week') || { getAttribute: () => '' }).getAttribute('aria-label') || '';
  if (!/^Available Tuesday 10:00\. Already teaching Thursday 16:00$/.test(taughtSaid)) {
    bad.push('a week with Thursday 16:00 taught reads "' + taughtSaid + '" to a screen reader — the day drawn for that hour is silent');
  }
  /* TICKED, BUT ONLY AT 19:00 — a tick from when the Settings grid ran to seven. */
  const late = card({ tu19: 'TRUE' });
  if (late.querySelector('.prof-week')) bad.push('a tutor ticked only at 19:00, outside the bookable span, is drawn with a week (' + days(late) + ')');
  if (!/No free hours/.test((late.querySelector('.prof-nofree') || {}).textContent || '')) bad.push('a tutor ticked only at 19:00 does not say "No free hours" on their card');
  if (late.querySelector('.prof-nohours')) bad.push('a tutor ticked only at 19:00 is told they "haven\'t set their hours", which is untrue');
  return bad;
});

/* ---------- A TUTOR'S WEEK IS THE DAYS THEY WORK — ON THE BOOKING FORM § */
check('488: the booking week shows all seven days whoever is named; a tutor\'s hours are a guide, unsaid, and only a venue shuts a day', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.paper || typeof w.slotGrid !== 'function') return ['the paper / slotGrid are not reachable, so the booking week was NOT checked — not a pass'];
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const D = t.DATA();
  const blank = {};
  ['m', 'tu', 'w', 'th', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) blank[p + String(h).padStart(2, '0')] = ''; });
  const tia = { title: 'Tia Tutor', rate: 14, teaches: ['Maths (GCSE)'], listed: true,
                avail: Object.assign({}, blank, { tu10: 'TRUE', tu11: 'TRUE', th16: 'TRUE' }), busy: { th16: 'Maths' } };
  D.tutors = [tia];
  const B = t.BOOKING;
  Object.keys(B).forEach(k => { if (Array.isArray(B[k])) B[k] = []; else B[k] = ''; });
  B.how = ((t.STEPS.find(s => s.id === 'how') || { options: () => [] }).options().find(k => !/wait/i.test(k))) || '';
  const doc = () => new w.DOMParser().parseFromString('<div>' + String(t.paper() || '') + '</div>', 'text/html');
  const week = () => [...doc().querySelectorAll('.bk-row.bk-wk')].map(r => ({
    day: ((r.querySelector('.bk-k') || {}).textContent || '').trim(), shut: r.classList.contains('is-shut'), row: r }));
  const named = () => week().map(x => x.day).join(' ');
  const bad = [];
  const seven = t.days().join(' ');
  if (named() !== seven) bad.push('with no tutor chosen the week draws [' + named() + '], wanted all seven');
  B.tutor = 'Tia Tutor';
  if (named() !== seven) bad.push('with Tia chosen the week draws [' + named() + '], wanted all seven — any day can be asked');
  if (week().some(x => x.shut)) bad.push('a day is drawn shut with Tia named and no venue — her week must not lock a day');
  const g = w.slotGrid();
  if (!g.rows.every(r => r.hours.every(h => h.open))) bad.push('an hour outside Tia\'s week, or one she already teaches, is shut');
  /* NO GUIDE SENTENCE (owner, 8 Nov): the grey cells say it. */
  const said = [...doc().querySelectorAll('.bk-say')].map(p => p.textContent).join(' ');
  if (/usually free|accept or decline/.test(said)) bad.push('a guide sentence is drawn under an open week: "' + said + '"');
  /* A VENUE STILL SHUTS A DAY: that is the room, not the tutor. */
  const hall = { title: 'Thursday Shut Hall', bestRate: 12, minCapacity: 1, maxCapacity: 8, minHours: 1, maxHours: 4,
                 avail: Object.assign({}, blank) };
  ['m', 'tu', 'w', 'f', 'sa', 'su'].forEach(p => { for (let h = 9; h <= 18; h++) hall.avail[p + String(h).padStart(2, '0')] = 'TRUE'; });
  const venuesWas = D.venues;
  D.venues = (venuesWas || []).concat([hall]);
  B.loc = hall.title;
  const thV = week().find(x => x.day === 'Thursday'), tuV = week().find(x => x.day === 'Tuesday');
  if (!thV || !thV.shut) bad.push('Thursday at a hall shut on Thursdays is not drawn shut');
  if (!tuV || tuV.shut) bad.push('Tuesday at a hall open on Tuesdays is shut');
  B.loc = '';
  D.venues = venuesWas;
  return bad;
});

/* ---------- YOUR PICTURE, CHOSEN ON YOUR OWN CARD'S EDIT § */
check('a picture chosen on your Picture card posts savePhoto and the preview shows it, and Settings draws no picker', async () => {
  const URL_ = 'https://drive.google.com/file/d/FILEabcdefghijklmnopqrstuv/view';
  const { w, sent } = boot({ reply: b => b.action === 'savePhoto'
    ? { success: true, photo: b.remove ? '' : URL_ } : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '', phone_cc: '+44' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  if (d.querySelector('#s-account [data-me="photo"]')) bad.push('Settings still draws a box for a photo link');
  if ([...d.querySelectorAll('#s-account .pfp')].some(x => !x.closest('.card-ed'))) bad.push('Settings still draws the picture picker, which is on your own card\'s Edit now');
  try { t.go('staff', false, true); w.paint('staff'); } catch (e) { return bad.concat(['drawing Tutors threw: ' + e.message]); }
  await wait(200);
  /* 468: NO EDIT TO PRESS — the Picture card is always open on Tutor settings. */
  if (d.querySelector('[data-do="card-edit"]')) bad.push('an Edit tile is still drawn');
  const box = () => d.querySelector('#s-account .card-ed[data-sec="picture"] .pfp');
  if (!box()) return bad.concat(['your own card\'s Edit has no picture picker']);
  if (d.querySelector('#s-staff .card-ed [data-me="photo"]')) bad.push('the card\'s Edit draws a box for a photo link beside the picker');
  const inp = box().querySelector('input.pfp-in[type="file"]');
  if (!inp || !/image\/\*/.test(inp.getAttribute('accept') || '')) bad.push('the picker has no hidden file input taking images');
  if (!box().querySelector('[data-do="pfp-pick"]')) bad.push('the picker has no Choose photo tile');
  const rm = box().querySelector('[data-do="pfp-remove"]');
  if (!rm || !rm.disabled) bad.push('Remove is pressable with no picture to remove');
  if (!/^T$/.test(String((box().querySelector('.pfp-none') || {}).textContent || '').trim())) bad.push('with no picture the preview is not the initial');
  if (!inp) return bad;
  w.pfpPrepare_ = () => Promise.resolve('data:image/jpeg;base64,' + Buffer.from('square').toString('base64'));
  Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'me.png', { type: 'image/png' })], configurable: true });
  sent.length = 0;
  inp.dispatchEvent(new w.Event('change', { bubbles: true }));
  await wait(300);
  const post = sent.find(b => b.action === 'savePhoto');
  if (!post) bad.push('choosing a file posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto');
  else {
    if (!/^data:image\/jpeg;base64,/.test(String(post.data || ''))) bad.push('savePhoto carried "' + String(post.data).slice(0, 30) + '", not a JPEG data: URL');
    if (post.personId !== 'P001') bad.push('savePhoto did not name the signed-in person by id');
  }
  const img = box() && box().querySelector('.pfp-face img');
  if (!img || !/lh3\.googleusercontent\.com\/d\/FILEabcdefghijklmnopqrstuv/.test(img.getAttribute('src') || '')) {
    bad.push('after the save the preview shows ' + (img ? img.getAttribute('src') : 'no picture') + ', not the kept file');
  }
  if ((t.whoami().profile || {}).photo !== URL_) bad.push('USER.profile.photo was not given the kept address, so the next Settings draw shows the old face');
  const rm2 = box() && box().querySelector('[data-do="pfp-remove"]');
  if (!rm2 || rm2.disabled) bad.push('with a picture saved, Remove cannot be pressed');
  else {
    sent.length = 0;
    t.ACTIONS['pfp-remove'](rm2);
    await wait(300);
    if (!sent.some(b => b.action === 'savePhoto' && b.remove === true)) bad.push('Remove posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto remove');
    if (!box() || box().querySelector('.pfp-face img') || (t.whoami().profile || {}).photo !== '') bad.push('after Remove the picture is still drawn or still on USER.profile');
  }
  return bad;
});

/* ---------- YOUR PICTURE, ONE OF ELEVEN — FOR EVERY ROLE, SEEN BY YOU AND BY SOMEBODY ELSE § */
const PFP_ROLES = {
  student: { name: 'Sam Pupil', personId: 'P-S9', role: 'kid', roles: ['student'], handle: 'sam_glad09',
             avatar: 'skin:3|shirt:5|hair:curls', basic: 'fox', other: 'family' },
  parent:  { name: 'Pat Mum', personId: 'P-C9', role: 'parent', roles: ['parent'], handle: 'pat_kind09',
             avatar: 'skin:1|shirt:6|hair:long', basic: 'cat', other: 'dm' },
  tutor:   { name: 'Tia Tutor', personId: 'P-T9', role: 'tutor', roles: ['tutor'], handle: 'tia_calm09',
             avatar: 'skin:4|shirt:3|hair:crop', basic: 'robot', other: 'people' },
  admin:   { name: 'Ari Admin', personId: 'P-A9', role: 'admin', roles: ['admin'], handle: 'ari_wise09',
             avatar: 'skin:0|shirt:7|hair:fringe', basic: 'rocket', other: 'feed' },
};
const AV_SKIN_T = ['#f3c9a0', '#e0a878', '#c58a5b', '#8d5a3b', '#5f3a25', '#ffd9b3'];
const AV_SHIRT_T = ['#f4f4f2', '#2f6b3f', '#1f5f8a', '#8a3a3a', '#6b4d8a', '#c07a1f', '#3d4b57', '#2f6b6b'];
async function pfpRoleJourney(key) {
  const P = PFP_ROLES[key];
  const URL_ = 'https://drive.google.com/file/d/FILEpfp' + key + 'abcdefghijklmnopq/view';
  const staff = key === 'tutor' || key === 'admin';
  const mineRow = () => ({ title: P.name, handle: P.handle, personId: P.personId, role: key === 'admin' ? 'Admin' : 'Tutor',
                           rate: 20, teaches: [], dbs: true, listed: true, avail: {}, image: '' });
  const data = payload();
  if (staff) data.tutors = data.tutors.concat([mineRow()]);
  const { w, sent } = boot({ payload: data, reply: b => b.action === 'savePhoto'
    ? (b.remove ? { success: true, photo: '' }
      : b.choice ? Object.assign({ success: true, photo: b.choice }, b.choice === 'pfp:avatar' ? { avatar: P.avatar } : {})
      : { success: true, photo: URL_ })
    : b.action === 'saveAvatar' ? { success: true, avatar: Object.keys(b.avatar || {}).map(k => k + ':' + b.avatar[k]).join('|') }
    : { success: true } });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  await wait(200);
  const t = w.__t, d = w.document;
  if (!t) return ['the app did not finish loading'];
  const first = P.name.split(' ')[0];
  t.USER({ name: P.name, personId: P.personId, role: P.role, roles: P.roles, token: 'tk', handle: P.handle,
           avatar: P.avatar, photo: '', profile: { first_name: first, last_name: P.name.split(' ')[1], photo: '', phone_cc: '+44' } });
  /* YOUR OWN CARD IS ON YOUR RANK'S PEOPLE COLUMN (453). */
  const HC = 'account', H = '#s-' + HC;  /* 469: everybody's picture is edited on Student settings */
  try { t.go(HC, false, true); w.paint(HC); w.paint('account'); } catch (e) { return ['drawing ' + HC + ' threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  /* EDIT ON YOUR OWN CARD, AND THE FORM IT TURNS INTO. */
  const editing = () => d.querySelector(H + ' .card-ed[data-pid="' + P.personId + '"] .me-form');
  const openEdit = async () => {
    if (editing()) return true;
    /* DRAWN AGAIN AS YOU FIRST — `asOther` below draws the column as somebody else and puts you back without
       a paint, so the column on the page can be theirs. */
    try { w.paint(HC); } catch (e) {}
    for (let k = 0; k < 20 && !editing(); k++) await wait(50);
    return !!editing();
  };
  /* SAVE ON THE PICTURE'S CARD (468): it saved itself, so this says so and the profile column is drawn again. */
  const shut = async () => {
    const save = d.querySelector(H + ' .card-ed[data-sec="picture"][data-pid="' + P.personId + '"]');
    if (save) t.ACTIONS['card-save'](save);
    await wait(300);
    try { w.paint(t.homeCol()); } catch (e) {}
  };
  if (!(await openEdit())) return ['a ' + key + '\'s settings column draws no editing cards'];
  if ([...d.querySelectorAll('#s-account .pfp, ' + H + ' .pfp')].some(x => !x.closest('.card-ed'))) bad.push('a ' + key + '\'s Settings still draws a picture picker');
  const box = () => d.querySelector(H + ' .card-ed .pfp');
  if (!box()) return ['a ' + key + '\'s own card\'s Edit has no picture picker'];
  const opts = () => [...box().querySelectorAll('.pfp-grid button.pfp-opt[data-do="pfp-choose"]')];
  const names = opts().map(b => b.dataset.pic);
  const ten = t.pfpNames();
  if (JSON.stringify(names) !== JSON.stringify(['avatar'].concat(ten)) || ten.length !== 10) {
    bad.push('the grid offers ' + JSON.stringify(names) + ' — wanted your figure, then the ten pictures');
  }
  if (opts().some(b => b.classList.contains('on'))) bad.push('a ring is on a picture before any is yours');
  const fig0 = opts()[0] && opts()[0].querySelector('svg.avatar.is-bust');
  if (!fig0 || fig0.outerHTML.indexOf(AV_SHIRT_T[Number(/shirt:(\d)/.exec(P.avatar)[1])]) === -1) bad.push('the first choice is not your own figure in your own shirt');
  /* A CHILD UPLOADS NO PHOTO (413): the grid and Remove, and no Choose photo or file input. */
  const kid = key === 'student';
  if ((!kid && !box().querySelector('[data-do="pfp-pick"]')) || !box().querySelector('[data-do="pfp-remove"]')) bad.push('Choose photo or Remove has gone from the card');
  if (kid && box().querySelector('[data-do="pfp-pick"], input.pfp-in')) bad.push('a child is offered Choose photo, a file upload');
  const ground = n => (/<circle cx="24" cy="24" r="24" fill="(#[0-9a-f]{6})"/.exec(w.pfpArt_(n, 40)) || [])[1];
  /* WHAT A FACE IS, ASKED OF THE ELEMENT THE SURFACE DREW. */
  const faceIs = (el, want) => {
    if (!el) return 'no face at all';
    const html = el.outerHTML;
    if (want.kind === 'avatar') {
      const svg = el.querySelector('svg.avatar.is-bust');
      if (!svg) return 'not a figure: ' + html.slice(0, 90);
      const skin = AV_SKIN_T[Number(/skin:(\d)/.exec(want.fig)[1])], shirt = AV_SHIRT_T[Number(/shirt:(\d)/.exec(want.fig)[1])];
      return html.indexOf(skin) !== -1 && html.indexOf(shirt) !== -1 ? '' : 'a figure, but not this person\'s (' + skin + ', ' + shirt + ')';
    }
    if (want.kind === 'basic') return el.querySelector('svg.pfp-art') && html.indexOf('fill="' + ground(want.name) + '"') !== -1 ? '' : 'not the ' + want.name + ': ' + html.slice(0, 90);
    if (want.kind === 'photo') return el.tagName === 'IMG' && /lh3\.googleusercontent\.com\/d\/FILEpfp/.test(el.getAttribute('src') || '') ? '' : 'not the photograph: ' + html.slice(0, 90);
    return !el.querySelector('svg, img') && el.tagName !== 'IMG' && el.textContent.trim() === want.letter ? '' : 'not the initial ' + want.letter + ': ' + html.slice(0, 90);
  };
  /* YOUR OWN CARD, AS THE APP REPAINTED YOUR PROFILE COLUMN AFTER THE SAVE — the one place it is drawn (468). */
  const myCard = () => [...d.querySelectorAll('#s-' + t.homeCol() + ' .card.is-prof')]
    .find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
  /* AND AS SOMEBODY ELSE, FROM WHAT `doGet` SENDS THEM. Drawn, then put back. */
  const asOther = (stored, figure) => {
    const me = t.whoami(), D = t.DATA();
    const keep = { tutors: D.tutors, family: D.family, familyFor: D.familyFor, posts: D.posts };
    const face = Object.assign({ image: stored }, picFig(stored, figure));
    let el = null;
    try {
      if (P.other === 'family') {            // the student's parent, on their own column
        t.USER({ name: 'Mo Parent', personId: 'P-M9', role: 'parent', roles: ['parent'], token: 'tk2', profile: {} });
        D.family = [Object.assign({ personId: P.personId, title: P.name, relation: 'child', handle: P.handle }, face)];
        D.familyFor = 'P-M9';
        /* A PARENT'S CHILDREN ARE ON STUDENTS (453). */
        w.paint('students');
        el = [...d.querySelectorAll('#s-students .card.is-prof')].find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
        el = el && el.querySelector('.prof-pic');
      } else if (P.other === 'dm') {         // the parent's child, at the head of their conversation
        t.USER({ name: 'Kit Child', personId: 'P-K9', role: 'kid', roles: ['student'], token: 'tk2', profile: {} });
        D.family = [Object.assign({ personId: P.personId, title: P.name, relation: 'parent', handle: P.handle }, face)];
        D.familyFor = 'P-K9';
        const host = d.createElement('div');
        host.innerHTML = w.dmFace_({ name: P.name, id: P.personId });
        el = host.querySelector('.dm-av');
        el = el && (el.querySelector('img, .face-pic') || el);
      } else if (P.other === 'people') {     // a visitor's people column
        t.USER({ name: 'Vi Visitor', personId: 'P-V9', role: 'parent', roles: ['parent'], token: 'tk2', profile: {} });
        D.tutors = keep.tutors.filter(r => r.personId !== P.personId).concat([Object.assign(mineRow(), face)]);
        w.paint('tutors');
        el = [...d.querySelectorAll('#s-tutors .card.is-prof')].find(c => (c.querySelector('.prof-name') || {}).textContent === P.name);
        el = el && el.querySelector('.prof-pic');
      } else {                               // the feed, which every visitor is sent
        t.USER(null);
        D.posts = [{ id: 'PO-PFP', author: P.name, handle: P.handle, avatar: stored, figure: picFig(stored, figure).avatar,
                     image: 'data/reels/archetest.jpg', media: ['data/reels/archetest.jpg'], caption: 'A trip', body: '',
                     location: '', when: '', at: 0, pinned: false, active: true, waiting: false, refused: false,
                     approvedBy: '', poll: null, reactions: { emoji: ['👍'], counts: [0], total: 0, yours: '', by: [] },
                     comments: { total: 0, list: [] }, rowIndex: 2 }];
        w.paint('feed');
        el = d.querySelector('#s-feed article[data-post="PO-PFP"] .post-face');
      }
    } catch (e) { el = null; bad.push('drawing ' + key + ' as somebody else sees them threw: ' + e.message); }
    const out = el ? el.cloneNode(true) : null;
    t.USER(me); Object.assign(D, keep);
    return out;
  };
  /* THE ROW `doGet` SENDS: the figure only when the face is the figure (`faceFig_`, core.gs). */
  const picFig = (stored, figure) => stored === 'pfp:avatar' ? { avatar: figure } : {};
  const step = async (label, press, wantSent, want) => {
    if (!(await openEdit())) { bad.push(label + ': the editing cards are gone'); return; }
    sent.length = 0;
    await press();
    await wait(300);
    const post = sent.find(b => b.action === 'savePhoto');
    if (!post) { bad.push(label + ': posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no savePhoto'); return; }
    if (post.personId !== P.personId) bad.push(label + ': savePhoto did not name ' + P.personId);
    const miss = Object.keys(wantSent).filter(k => post[k] !== wantSent[k]);
    if (miss.length) bad.push(label + ': savePhoto carried ' + JSON.stringify(miss.map(k => [k, post[k]])) + ', wanted ' + JSON.stringify(wantSent));
    const stored = String((t.whoami().profile || {}).photo);
    if (stored !== want.stored) bad.push(label + ': USER.profile.photo is "' + stored + '", wanted "' + want.stored + '"');
    const ring = opts().filter(b => b.classList.contains('on')).map(b => b.dataset.pic);
    const ringWant = want.kind === 'avatar' ? ['avatar'] : want.kind === 'basic' ? [want.name] : [];
    if (JSON.stringify(ring) !== JSON.stringify(ringWant)) bad.push(label + ': the gold ring is on ' + JSON.stringify(ring) + ', wanted ' + JSON.stringify(ringWant));
    if (opts().some(b => (b.getAttribute('aria-pressed') === 'true') !== b.classList.contains('on'))) bad.push(label + ': aria-pressed does not follow the ring');
    const said = (box().querySelector('.pfp-said') || {}).textContent || '';
    if (!want.said.test(said)) bad.push(label + ': the line under the grid says "' + said + '"');
    const prev = faceIs(box().querySelector('.pfp-face > *'), Object.assign({ letter: first[0] }, want));
    if (prev) bad.push(label + ': the preview is ' + prev);
    /* SAVE — the picture saved itself, so Save sends nothing more — and the card read on your profile column. */
    await shut();
    const mine = myCard();
    if (!mine) bad.push(label + ': your own card is not on your profile column');
    else { const why = faceIs(mine.querySelector('.prof-pic'), Object.assign({ letter: P.name[0] }, want)); if (why) bad.push(label + ': your own card shows ' + why); }
    const other = faceIs(asOther(want.stored, P.avatar), Object.assign({ letter: P.name[0] }, want));
    if (other) bad.push(label + ': as somebody else sees you (' + P.other + '), your face is ' + other);
  };
  const choose = n => () => { const b = opts().find(x => x.dataset.pic === n); if (!b) throw new Error('no ' + n + ' in the grid'); t.ACTIONS['pfp-choose'](b); };
  try {
    await step('your figure', choose('avatar'), { choice: 'pfp:avatar' },
      { kind: 'avatar', fig: P.avatar, stored: 'pfp:avatar', said: /Saved\. Your figure is your picture/ });
    /* LIVE, AND DRESSED ON THE SAME FORM: § */
    const dress = async n => {
      await openEdit();
      const sw = d.querySelector(H + ' .card-ed .av-card [data-do="av-colour"][data-field="shirt"][data-value="' + n + '"]');
      if (!sw) { bad.push('your own card\'s Edit has no wardrobe with shirt ' + n + ' in it'); return false; }
      sent.length = 0;
      t.ACTIONS['av-colour'](sw);
      await wait(250);
      if (!sent.some(b => b.action === 'saveAvatar' && b.avatar && Number(b.avatar.shirt) === n)) bad.push('picking shirt ' + n + ' on your card posted ' + JSON.stringify(sent.map(b => b.action)) + ', not saveAvatar with that shirt');
      return true;
    };
    const was = t.whoami().avatar;
    if (await dress(2)) {
      const opt = box() && box().querySelector('.pfp-opt[data-pic="avatar"]');
      const inPicker = faceIs(opt, { kind: 'avatar', fig: t.whoami().avatar });
      if (!/shirt:2/.test(t.whoami().avatar)) bad.push('after shirt 2 was picked your look is ' + JSON.stringify(t.whoami().avatar));
      if (inPicker) bad.push('the picker\'s "your figure" is not the figure the wardrobe just dressed: ' + inPicker);
      const pv = faceIs(box() && box().querySelector('.pfp-face > *'), { kind: 'avatar', fig: t.whoami().avatar });
      if (pv) bad.push('with your figure as your picture, the preview is not the figure the wardrobe just dressed: ' + pv);
      await shut();
      const live = faceIs(myCard() && myCard().querySelector('.prof-pic'), { kind: 'avatar', fig: t.whoami().avatar });
      if (live) bad.push('your figure is not live on your own card after a change of shirt: ' + live);
      await dress(Number(/shirt:(\d)/.exec(was)[1]));
    }
    /* A TAP ON THE ONE ALREADY IN USE SENDS NOTHING. */
    await openEdit();
    sent.length = 0;
    choose('avatar')();
    await wait(100);
    if (sent.some(b => b.action === 'savePhoto')) bad.push('a tap on the figure already in use posted savePhoto again');
    await step('the ' + P.basic, choose(P.basic), { choice: 'pfp:' + P.basic },
      { kind: 'basic', name: P.basic, stored: 'pfp:' + P.basic, said: new RegExp('Saved\\. The ' + P.basic + ' is your picture') });
    if (!kid) await step('a photograph', async () => {
      w.pfpPrepare_ = () => Promise.resolve('data:image/jpeg;base64,' + Buffer.from('square').toString('base64'));
      const inp = box().querySelector('input.pfp-in[type="file"]');
      Object.defineProperty(inp, 'files', { value: [new w.File(['x'], 'me.png', { type: 'image/png' })], configurable: true });
      inp.dispatchEvent(new w.Event('change', { bubbles: true }));
    }, {}, { kind: 'photo', stored: URL_, said: /Saved\. Your photo is your picture/ });
    if (!kid && !(sent.find(b => b.action === 'savePhoto') || {}).data) bad.push('the photograph was not posted as data');
    await step('Remove', () => { t.ACTIONS['pfp-remove'](box().querySelector('[data-do="pfp-remove"]')); }, { remove: true },
      { kind: 'none', stored: '', said: /Removed\. No picture yet/ });
  } catch (e) { bad.push('the journey threw: ' + e.message); }
  return bad;
}
check('a student chooses their figure, the fox and Remove, and is offered no photo upload (413) — each saved, on their card and on their parent\'s', () => pfpRoleJourney('student'));
check('a parent chooses their figure, the cat, a photo and Remove — each saved, on their card and in their child\'s messages', () => pfpRoleJourney('parent'));
check('a tutor chooses their figure, the robot, a photo and Remove — each saved, on their card and on a visitor\'s people column', () => pfpRoleJourney('tutor'));
check('an admin chooses their figure, the rocket, a photo and Remove — each saved, on their card and on the feed', () => pfpRoleJourney('admin'));

/* ---------- AND UNTIL THE BACKEND IS PULLED, A TAP FAILS OUT LOUD § */
check('before the backend is pulled, tapping a picture says the server\'s refusal and keeps the old picture', async () => {
  const URL_ = 'https://drive.google.com/file/d/FILEoldabcdefghijklmnopqrs/view';
  const data = Object.assign(payload(), { version: '2026-10-10-g-schema-grid' });
  const { w, sent } = boot({ payload: data, reply: b => b.action === 'savePhoto'
    ? (b.data || b.remove ? { success: true, photo: '' } : { error: 'That is not a picture. Choose a photo from your phone.' })
    : { success: true } });
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  await wait(200);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Pat Mum', personId: 'P-C9', role: 'parent', roles: ['parent'], token: 'tk', handle: 'pat_kind09',
           avatar: '', photo: URL_, profile: { first_name: 'Pat', last_name: 'Mum', photo: URL_, phone_cc: '+44' } });
  /* ON PAT'S OWN CARD'S EDIT, where the picker is since docs/history/339 — on Parents, a parent's column (453). */
  t.go('account', false, true); w.paint('account');
  await wait(200);
  await wait(300);
  const bad = [];
  const box = () => d.querySelector('#s-account .card-ed .pfp');
  if (!box()) return ['no picture picker on Pat\'s own card\'s Edit'];
  const fox = box().querySelector('.pfp-opt[data-pic="fox"]');
  sent.length = 0;
  t.ACTIONS['pfp-choose'](fox);
  await wait(300);
  const post = sent.find(b => b.action === 'savePhoto');
  if (!post || post.choice !== 'pfp:fox') bad.push('the tap posted ' + JSON.stringify(post) + ', wanted savePhoto choice pfp:fox');
  const said = (box().querySelector('.pfp-said') || {}).textContent || '';
  if (!/That is not a picture/.test(said)) bad.push('the line does not say the server\'s refusal: "' + said + '"');
  if (!/Your picture is unchanged/.test(said)) bad.push('the line does not say the picture is unchanged: "' + said + '"');
  if (!/server has not been updated for the pictures/.test(said)) bad.push('the line does not say the server is older than the pictures: "' + said + '"');
  if ((t.whoami().profile || {}).photo !== URL_) bad.push('USER.profile.photo became "' + (t.whoami().profile || {}).photo + '" after a refusal');
  const img = box().querySelector('.pfp-face img');
  if (!img || !/FILEold/.test(img.getAttribute('src') || '')) bad.push('the old photograph is not back in the preview');
  if (box().querySelector('.pfp-opt.on')) bad.push('a ring was left on ' + box().querySelector('.pfp-opt.on').dataset.pic + ' after the refusal');
  if (box().querySelector('.pfp-opt:disabled')) bad.push('the grid is still locked after the refusal');
  return bad;
});

/* ---------- YOUR ROLE, ONE RANK (432): A CLIENT CHOOSES CLIENT OR STUDENT; NOBODY ELSE IS OFFERED A CHOICE ---------- */
check('the roles card offers a Client one choice, Client or Student, and posts setMyRoles; a student, a tutor and an admin get no picker; a waiting Tutor keeps its tutor (432)', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'setMyRoles'
    ? { success: true, role: 'kid', roles: ['kid'], rank: 'student', tutorPending: false, changed: true }
    : { success: true } });
  await wait(300);
  const t = w.__t, d = w.document;
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'parent', roles: ['parent'], token: 'tk', tutorPending: false,
           profile: { first_name: 'Pat', last_name: 'Parent' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const bad = [];
  const card = () => d.querySelector('#s-account .roles-card');
  if (!card()) return ['Settings has no Your role card'];
  const pick = r => card().querySelector(`[data-role-pick="${r}"]`);
  const picks = () => [...card().querySelectorAll('[data-role-pick]')].map(b => b.dataset.rolePick).join(',');
  if (picks() !== 'client,student') return ['a parent is offered "' + picks() + '", wanted Client and Student alone'];
  if ([...card().querySelectorAll('[data-role-pick]')].some(b => b.tagName !== 'OPTION' || !b.closest('select'))) bad.push('the choice is not the phone\'s own picker — a box or button stands in for a select');
  if (/Tick every one|more than one/.test(card().textContent)) bad.push('the card still says to tick every one that is you');
  if (!pick('client').selected || pick('student').selected) bad.push('a parent does not see Client chosen');
  if (card().querySelector('.role-admin')) bad.push('a parent is told they are Admin');
  const save = () => card().querySelector('[data-do="roles-save"]');
  if (!save()) return bad.concat(['the roles card has no Save tile']);
  pick('student').selected = true;
  sent.length = 0;
  t.ACTIONS['roles-save'](save());
  await wait(400);
  const post = sent.find(b => b.action === 'setMyRoles');
  if (!post) bad.push('Save posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no setMyRoles');
  else {
    if (JSON.stringify(post.roles) !== '["student"]') bad.push('setMyRoles carried ' + JSON.stringify(post.roles) + ', wanted ["student"]');
    if (post.personId !== 'P-C1') bad.push('setMyRoles did not name the signed-in person by id');
  }
  if (t.whoami().rank !== 'student') bad.push('USER was not given the server\'s rank — ' + JSON.stringify(t.whoami().rank));
  /* NOW A STUDENT: no picker, and the one line about a parent. */
  if (!card() || card().querySelector('[data-role-pick], [data-do="roles-save"]')) bad.push('a student is offered a role picker — the server refuses a student making itself a client');
  else if (!/parent links you/i.test(card().textContent)) bad.push('a student\'s card does not say a parent links them: "' + card().textContent.trim().slice(0, 120) + '"');
  /* A TUTOR STILL WAITING FROM BEFORE (an old row): a Client's choice, the waiting line, and the tutor kept in the post. */
  t.USER({ name: 'Pat Parent', personId: 'P-C1', role: 'tutor', roles: ['tutor', 'parent'], token: 'tk', tutorPending: true, profile: {} });
  try { w.paint('account'); } catch (e) { return bad.concat(['drawing settings for a waiting tutor threw: ' + e.message]); }
  if (t.isTutorRole()) bad.push('a Tutor tick the server says is waiting already passes the staff test');
  if (!card() || pick('tutor')) bad.push('a waiting tutor is offered Tutor as a choice — teaching starts with "Apply to teach"');
  if (!card() || !/waiting for @family/.test((card().querySelector('.roles-said') || {}).textContent || '')) bad.push('the card does not say the Tutor is waiting for approval');
  sent.length = 0;
  if (card() && save()) { t.ACTIONS['roles-save'](save()); await wait(400); }
  const kept = sent.find(b => b.action === 'setMyRoles');
  if (!kept || JSON.stringify(kept.roles) !== '["client","tutor"]') bad.push('a waiting tutor\'s Save posted ' + JSON.stringify(kept && kept.roles) + ', wanted ["client","tutor"] — the waiting tutor dropped');
  if (d.querySelector('#s-account .agree')) bad.push('Settings still carries the old tutor agreement — the terms are in the Staff hub (405)');
  /* AN APPROVED TUTOR: no picker; told where the hours are. */
  t.USER({ name: 'Ada Tutor', personId: 'P-T1', role: 'tutor', roles: ['tutor'], rank: 'staff', token: 'tk', profile: {} });
  try { w.paint('account'); } catch (e) { return bad.concat(['drawing settings for a tutor threw: ' + e.message]); }
  if (!card() || card().querySelector('[data-role-pick]')) bad.push('an approved tutor is offered a role picker');
  /* AND THE ADMIN: told, not offered. */
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin', 'tutor'], token: 'tk', profile: {} });
  try { w.paint('account'); } catch (e) { return bad.concat(['drawing settings for the admin threw: ' + e.message]); }
  if (!card() || !card().querySelector('.role-admin')) bad.push('an admin is not told Admin is given and kept');
  else if (card().querySelector('[data-role-pick]')) bad.push('an admin is offered a role picker');
  return bad;
});

