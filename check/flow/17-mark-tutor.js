
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

  /* ---- A BOX NO RULE MARKS (owner, 16 Nov: its tile is Save, never a Mark): no verdict, so silent. ---- */
  const free = subDraw_(w, FREE);
  type(free, '42'); earTap_(rec, free.querySelector('.qt-row .is-submit')); await wait(30);
  expect([], 'Save on a box with no exact key');

  /* ---- THE KEYPAD'S ✓ AND A LAPTOP'S ENTER: the box's own Check, called with no click. ---- */
  const keys = subDraw_(w, KEYS);
  const ki = keys.querySelector('.kp-in');
  const pad = () => d.getElementById('kp');
  const key = v => { const b = pad() && pad().querySelector('.kp-key[data-v="' + v + '"]'); if (b) earIn_(rec, () => A['kp-key'](b)); else bad.push('no key ' + v + ' on the pad'); };
  if (!ki) bad.push('the keypad card drew no pad box — ✓ was NOT pressed');
  else {
    ki.focus(); key('1'); key('3'); key('!done'); earIn_(rec, () => sendRow_(w, ki)); await wait(30);
    expect(['buzzer'], 'Check on a wrong answer typed on the keypad');
    ki.focus();
    earIn_(rec, () => { ki.value = '12'; ki.dispatchEvent(new w.Event('input', { bubbles: true })); });
    earIn_(rec, () => sendRow_(w, ki));
    await wait(30);
    expect(['chime'], 'Check on the right answer');
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

