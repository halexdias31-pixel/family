/* ---------- A REDRAW WITH THE KEYPAD UP KEEPS TYPING INTO THE SAME QUESTION § */
check('a redraw with the keypad up keeps typing into the same question', async () => {
  const { w, errs } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — keypad.js did not load'];
  const x = { kind: 'question', key: 'q-kp-redraw', name: 'Q6', marks: 1, answerType: 'calculation', accept: '75',
    row: { row_id: 'Q-KP-REDRAW', paper_id: 'P-KP', subject: 'Maths', name: 'Keypad' },
    html: '<p>Work out 3 &times; 25.</p>', answer: '<b>75</b>' };
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const host = d.createElement('div');
  host.innerHTML = w.findCard(x);
  d.body.appendChild(host);
  const first = host.querySelector('.kp-in');
  if (!first) return ['the card drew no maths box'];
  first.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return ['focusing the maths box did not open the keypad'];
  const press = v => { const b = pad.querySelector('.kp-key[data-v="' + v + '"]'); if (b) A['kp-key'](b); else bad.push('no key ' + v); };
  press('7');
  if (first.value !== '7') bad.push('7 typed "' + first.value + '" before the redraw');
  /* THE REDRAW: the card's markup replaced, as `repaint` and `paintStuff(true)` do. */
  host.innerHTML = w.findCard(x);
  const now = host.querySelector('.kp-in');
  if (!now || now === first) return bad.concat(['the redraw did not replace the box, so nothing was asked']);
  press('5');
  let kept = null;
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (now.value !== '75') bad.push('after the redraw the box on the page holds "' + now.value + '" -- the 5 went to the box that was taken away (' + JSON.stringify(first.value) + ')');
  if (d.activeElement !== now) bad.push('after the redraw the focus is on ' + (d.activeElement ? d.activeElement.tagName.toLowerCase() + '.' + d.activeElement.className : 'nothing') + ', not on the box that replaced the one being typed in');
  if (kept !== '75') bad.push('the answer saved is ' + JSON.stringify(kept) + ', wanted "75"');
  if (pad.hidden) bad.push('the redraw put the keypad away');
  /* AND THE CARET STAYS WHERE IT WAS, inside a structure, not thrown to the end. */
  press('!frac');
  host.innerHTML = w.findCard(x);
  const third = host.querySelector('.kp-in');
  press('4');
  if (!third || third.value !== '75/(4)') bad.push('a fraction begun before a redraw and finished after it reads "' + (third && third.value) + '", wanted "75/(4)" -- the caret lost its place in the slot');
  /* AND A REDRAW FOR SOMEBODY ELSE, whose box has another key, closes the pad rather than typing into it. */
  host.innerHTML = w.findCard(Object.assign({}, x, { key: 'q-kp-redraw-other', row: Object.assign({}, x.row, { row_id: 'Q-KP-OTHER' }) }));
  press('9');
  if (!pad.hidden) bad.push('with the question gone from the page, a key still left the pad up');
  if (host.querySelector('.kp-in').value) bad.push('a key typed into a different question\'s box after a redraw');
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- NO ANSWER BOX CAN BRING UP THE PHONE'S KEYBOARD, ON ANY ROUTE § */
check('no answer box on a question\'s pages can bring up the phone\'s keyboard — maths, words, worksheet, pen — on any route', async () => {
  /* A REAL PRACTICAL, through the real mapper, as the sameness journey brings one: the fixture has none. */
  const one = boot();
  await wait(300);
  if (typeof one.w.libraryExtras_ !== 'function') return ['libraryExtras_ is not reachable, so no practical could be drawn — nothing was checked'];
  const made = JSON.parse(JSON.stringify(one.w.libraryExtras_({},
    { practicals: LIB_FULL.rows('practicals') })));
  const { w, errs } = boot({ payload: Object.assign(payload(), { practicals: made.practicals || [] }) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const need = ['kpField_', 'findCard', 'stuffPart_', 'stuffItems'].filter(n => typeof w[n] !== 'function');
  if (!A['kp-key'] || need.length) return ['the keypad or the cards are not reachable (' + need.join(', ') + ') — nothing was checked'];
  /* EVERY attribute change to `readonly` or `inputmode` anywhere, from here to the end. */
  const touched = [];
  const mo = new w.MutationObserver(list => list.forEach(m => {
    if (m.target.classList && m.target.classList.contains('kp-in')) touched.push(m.attributeName + ' on ' + m.target.getAttribute('data-k') + ' (was ' + JSON.stringify(m.oldValue) + ')');
  }));
  mo.observe(d.body, { subtree: true, attributes: true, attributeOldValue: true, attributeFilter: ['readonly', 'inputmode'] });
  const host = html => { const h = d.createElement('div'); h.innerHTML = html; d.body.appendChild(h); return h; };
  const row = (id, extra) => Object.assign({ row_id: id, paper_id: 'P-OWN', subject: 'Maths', name: 'Own keyboard' }, extra || {});
  const q = (key, extra, rowExtra) => Object.assign({ kind: 'question', name: 'Q1', qNumber: '1', marks: 2, key: key, stems: [],
    html: '<p>Answer it.</p>', answer: '<b>it</b>', row: row('Q-OWN-' + key, rowExtra) }, extra || {});
  const maths = q('q-own-m', { answerType: 'calculation', accept: '12' });
  const words = q('q-own-w', { answerType: 'explain', accept: '' });
  const shortW = q('q-own-s', { answerType: 'short', accept: 'egestion' });
  const pen = q('q:Q-OWN-P', { answerType: 'drawing' }, { figure: 'grid-blank' });
  /* AND ONE DRAWN ON THE PAPER'S OWN FIGURE, drawn under the pen in its card (356). */
  const paperPen = q('q:Q-OWN-F', { answerType: 'annotate', diagram: '<svg viewBox="0 0 340 120"><line class="axis" x1="10" y1="60" x2="330" y2="60"/></svg>' });
  const passage = q('q:Q-OWN-T', { answerType: 'annotate', surface: 'text', html: '<p>Circle the adjective.</p><p>The tall tree swayed.</p>' });
  /* FROM THE WHOLE LIBRARY: signed out, Find holds Settings alone (owner, 7 Nov) */
  const prac = (typeof w.stuffItemsAll_ === 'function' ? w.stuffItemsAll_() : w.stuffItems()).find(x => x.kind === 'practical');
  [maths, words, shortW, pen, paperPen, passage].forEach(x => { try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {} });
  const drawn = {
    'a maths answer': host(w.findCard(maths)), 'an explain answer': host(w.findCard(words)),
    'a short worded answer': host(w.findCard(shortW)),
    /* A QUESTION ANSWERED BY DRAWING IS DRAWN, and has the one answer box every part has (round 3) */
    'a drawing question\'s card': host(w.findCard(pen)),
    'a paper figure question\'s card': host(w.findCard(paperPen)),
    'a passage to ring words in': host(w.findCard(passage)),
    'a practical\'s worksheet': prac ? host(w.stuffPart_(prac, 'work')) : null,
  };
  if (!prac) bad.push('no practical in the fixture — its worksheet boxes were NOT checked');
  const locked = b => b.matches('.kp-field > .kp-in.qp-ans-in[readonly][inputmode="none"][data-kp]') && b.readOnly
    && !!b.closest('label.qp-ans');
  const WANT = { 'a maths answer': 1, 'an explain answer': 1, 'a short worded answer': 1, 'a drawing question\'s card': 1,
    'a paper figure question\'s card': 1,
    'a passage to ring words in': 1, 'a practical\'s worksheet': 3 };
  let boxes = 0;
  Object.keys(drawn).forEach(name => {
    const h = drawn[name];
    if (!h) return;
    const fields = [...h.querySelectorAll('input, textarea, select, [contenteditable]')];
    const open = fields.filter(f => !locked(f));
    if (open.length) bad.push(name + ' draws a field the phone could type into: ' + open.map(f => f.outerHTML.slice(0, 140)).join(' | '));
    if (fields.length !== WANT[name]) bad.push(name + ' draws ' + fields.length + ' text field(s), wanted ' + WANT[name]);
    boxes += fields.length;
  });
  /* NONE TO TYPE IN IS ONLY A PASS WHERE THE PEN IS ACTUALLY THERE. */
  if (!drawn['a drawing question\'s card'].querySelector('.qp-area .qpad')) bad.push('the drawing question drew no pen on its surface, so "no field" proved nothing');
  if (!drawn['a paper figure question\'s card'].querySelector('.qsheet .qpad .qpad-art > svg line.axis')) bad.push('the paper figure question drew no pen over its figure in its card, so "no field" proved nothing');
  const pad = () => d.getElementById('kp');
  const key = v => pad() && pad().querySelector('.kp-key[data-v="' + v + '"]');
  const press = v => { const b = key(v); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the ' + (pad() && pad().getAttribute('data-layer')) + ' face'); };
  const live = () => d.activeElement;
  const still = (where) => {
    const b = live();
    if (!b || !b.classList.contains('kp-in')) return bad.push(where + ': the focus is on ' + (b ? b.tagName + '.' + b.className : 'nothing') + ', not an answer box');
    if (!locked(b)) bad.push(where + ': the focused box is not locked: ' + b.outerHTML.slice(0, 140));
  };
  /* THE ROUTES, ON THE MATHS BOX: focused, `abc`, a letter, `123`, a redraw under the pad on the letters,
     a key after it, Enter. */
  const mHost = drawn['a maths answer'];
  mHost.querySelector('.kp-in').focus();
  if (!pad() || pad().hidden) bad.push('focusing the maths box did not open the pad');
  still('the maths box focused');
  press('!abc');
  if (pad().getAttribute('data-layer') !== 'abc' || !key('q')) bad.push('`abc` did not turn the pad to its letters');
  still('after `abc`');
  press('n');
  press('!123');
  if (pad().getAttribute('data-layer') !== 'maths' || !key('7')) bad.push('`123` did not turn the pad back to the maths keys');
  still('after `123`');
  press('!abc');
  mHost.innerHTML = w.findCard(maths);
  press('m');
  const mNow = mHost.querySelector('.kp-in');
  if (!mNow || mNow.value !== 'nm') bad.push('a letter after a redraw on the letters face typed into ' + (mNow ? JSON.stringify(mNow.value) : 'nothing') + ', wanted "nm" in the box that replaced it');
  if (pad().getAttribute('data-layer') !== 'abc') bad.push('a redraw under the pad turned it back from the letters -- the child was on ' + 'abc');
  still('after a redraw under the pad (`kpLive_`)');
  mNow.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
  if (!pad().hidden) bad.push('Enter on the maths box left the pad up');
  if (mNow.matches('[readonly][inputmode="none"]') === false) bad.push('after Enter the maths box is not locked');
  /* AND THE WORDED BOX: focused, it opens on the letters; `123`, `abc`, ✓. */
  const ta = drawn['an explain answer'].querySelector('.kp-in');
  ta.focus();
  if (pad().hidden || pad().getAttribute('data-layer') !== 'abc') bad.push('focusing a worded box did not open the pad on its letters');
  still('the worded box focused');
  press('!123'); press('!abc'); press('!done');
  if (!pad().hidden) bad.push('✓ on a worded box left the pad up');
  /* AND EACH WORKSHEET BOX, one after another. */
  if (drawn['a practical\'s worksheet']) {
    [...drawn['a practical\'s worksheet'].querySelectorAll('.kp-in')].forEach((b, i) => {
      b.focus();
      if (pad().hidden || pad().getAttribute('data-layer') !== 'abc') bad.push('worksheet box ' + (i + 1) + ' did not open the pad on its letters');
      still('worksheet box ' + (i + 1) + ' focused');
    });
    if (live() && live().blur) live().blur();
  }
  await wait(20);
  mo.disconnect();
  if (touched.length) bad.push('a script changed a box\'s lock on the way: ' + touched.join(' | ') + ' -- the lock is written in the markup and nowhere else');
  /* AND THE SOURCE: nothing that ships writes `inputmode`, `readonly` or `contenteditable` by script. § */
  const Q = '[\'"`]';
  const SRC = new RegExp([
    '(?:set|remove|toggle)Attribute\\(\\s*' + Q + '(?:inputmode|readonly|contenteditable)' + Q,
    '(?:set|remove)AttributeNS\\([^,()]*,\\s*' + Q + '(?:inputmode|readonly|contenteditable)' + Q,
    'removeNamedItem(?:NS)?\\([^)]*' + Q + '(?:inputmode|readonly|contenteditable)' + Q,
    '\\.(?:readOnly|inputMode|contentEditable)\\s*=(?!=)',
    '\\[\\s*' + Q + '(?:readOnly|inputMode|contentEditable)' + Q + '\\s*\\]\\s*=(?!=)',
  ].join('|'), 'i');
  /* AND ONLY `kpField_` DRAWS AN ANSWER BOX. § */
  const BOX = new RegExp([
    '(?<!\\[)data-do=\\\\?' + Q + 'qp-ans\\\\?' + Q,
    'setAttribute\\(\\s*' + Q + 'data-do' + Q + '\\s*,\\s*' + Q + 'qp-ans' + Q,
    'dataset\\.do\\s*=(?!=)\\s*' + Q + 'qp-ans' + Q,
    'class(?:Name)?\\s*=\\s*\\\\?' + Q + '[^\'"`]*\\bqp-ans-in\\b',
    'classList\\.(?:add|toggle|replace)\\([^)]*' + Q + 'qp-ans-in' + Q,
    /* and as the one maker's data: `'data-do': 'qp-ans'`, `class: 'qp-ans-in …'` in a spec's attributes */
    Q + 'data-do' + Q + '\\s*:[^,}\\n]*' + Q + 'qp-ans' + Q,
    '\\bclass' + Q + '?\\s*:\\s*' + Q + '[^\'"`]*\\bqp-ans-in\\b',
  ].join('|'));
  const jsDir = path.join(dir);
  let field = '';
  /* THE ONE EXCEPTION (528): `kpBind_` shuts the phone's keyboard out of every other box on the site, and may write `inputmode` as "none" and nothing else, never `readonly` */
  let bind = '';
  fs.readdirSync(jsDir).filter(f => /\.js$/.test(f) && !/^check/.test(f)).forEach(f => {
    let src = fs.readFileSync(path.join(jsDir, f), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
    if (/^keypad[-.]/.test(f)) {
      const cut = src.match(/function kpBind_\([\s\S]*?\n\}\n/);
      if (cut) bind = cut[0];
      if (cut) src = src.replace(cut[0], cut[0].replace("el.setAttribute('inputmode', 'none');", ''));
    }
    const m = src.match(SRC);
    if (m) bad.push('js/' + f + ' writes a box\'s lock by script: `' + m[0] + '` -- a box unlocked by script is the phone\'s keyboard let back in');
    if (/^keypad[-.]/.test(f)) {
      const cut = src.match(/function kpField_\([\s\S]*?\n\}\n/);
      if (cut) field = cut[0];
      if (cut) src = src.replace(cut[0], '');
    }
    const b = src.match(BOX);
    if (b) bad.push('js/' + f + ' draws an answer box outside kpField_: `' + b[0] + '` -- a box not drawn by kpField_ is a box nobody locked');
  });
  if (!bind || (bind.match(/inputmode/gi) || []).length !== 1 || !/el\.setAttribute\('inputmode', 'none'\);/.test(bind) || /readonly|readOnly/.test(bind)) {
    bad.push('kpBind_ in js/keypad.js is missing, or writes something other than inputmode="none" once -- the one script allowed to touch a box\'s keyboard');
  }
  if (!field || !/'data-do': [^\n]*'qp-ans'/.test(field) || !/qp-ans-in/.test(field)) bad.push('kpField_ was not found in js/keypad.js drawing `data-do="qp-ans"` and `.qp-ans-in` -- the rule that only it draws a box asked about nothing');
  if (boxes < 7) bad.push('only ' + boxes + ' boxes were drawn to ask about — the rule was not asked of them all');
  [maths, words, shortW, pen, passage].forEach(x => { try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {} });
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- THE PAD IS THE KEYBOARD FOR EVERY BOX ON THE SITE (528) ---------- */
/* A finger on a box: the press the app hears first, then the focus it gives. `kpTap_` is how a person arrives; a screen's own focus does not bring the pad up. */
const kpTap_ = (w, el) => { el.dispatchEvent(new w.Event('pointerdown', { bubbles: true })); el.focus(); };
const kpPadOf_ = w => w.document.getElementById('kp');
/* EACH CHARACTER ON WHICHEVER FACE HAS IT, turning the pad over as a person would; a character no face has is said */
function kpTypeOn_(w, s, bad) {
  const A = w.__t.ACTIONS;
  const key = v => kpPadOf_(w) && [...kpPadOf_(w).querySelectorAll('.kp-key')].find(b => b.getAttribute('data-v') === v);
  for (const ch of s) {
    const v = ch === '\n' ? '!nl' : ch.toLowerCase();
    let b = key(v);
    for (const face of ['!abc', '!123', '!sym']) { if (b) break; const f = key(face); if (f) { A['kp-key'](f); b = key(v); } }
    if (!b) { bad.push('no key for ' + JSON.stringify(ch) + ' on any face of the pad'); return; }
    if (ch !== v && ch === ch.toUpperCase()) { const sh = key('!shift'); if (sh) A['kp-key'](sh); }
    A['kp-key'](b);
  }
}
/* THE BOX IS A REAL FIELD THE PAD IS BOUND TO: `inputmode="none"` and its face, never `readonly` (a reader still hears a field), and the pad up on the face wanted */
function kpBoundSays_(w, el, face, name) {
  const out = [];
  if (!el) return [name + ' was not drawn'];
  if (el.getAttribute('inputmode') !== 'none') out.push(name + ' has inputmode=' + JSON.stringify(el.getAttribute('inputmode')) + ' — the phone\'s keyboard comes up on it');
  if (el.getAttribute('data-kpb') !== face) out.push(name + ' is bound to the ' + JSON.stringify(el.getAttribute('data-kpb')) + ' face, wanted ' + JSON.stringify(face));
  if (el.readOnly || el.hasAttribute('readonly')) out.push(name + ' is readonly — the readonly lock is the answer box\'s, and a box elsewhere is a field a screen reader can edit');
  return out;
}
check('a message and a settings box type on the @family keypad: tapped, the pad comes up on the right face, its keys type, a laptop and a paste still type, and the phone\'s keyboard has no way in (528)', async () => {
  const { w, sent } = boot({ reply: b => (b.action === 'myProfile' ? { error: 'That action is not recognised.' } : { success: true, changed: 1 }) });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  if (!A['kp-key'] || typeof w.msgForm_ !== 'function' || typeof w.draftRead_ !== 'function') return ['the keypad, the composer or the drafts are not reachable — nothing was checked'];
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '', phone: '07700900000', borough: 'Merton' } });
  const pad = () => kpPadOf_(w);
  const up = () => !!pad() && !pad().hidden;

  /* 1. A MESSAGE: a box of lines, so return types a new line and `done` only puts the pad away; the Send tile sends */
  const host = d.createElement('div');
  d.body.appendChild(host);
  host.innerHTML = w.msgForm_('Tom Tutor', 'P-TOM');
  await wait(0);
  const msg = host.querySelector('.msg-text');
  bad.push(...kpBoundSays_(w, msg, 'abc', 'the message box'));
  if (msg) {
    msg.focus();
    if (up()) bad.push('the message box focused by a screen, with no finger, brought the pad up — a phone\'s keyboard does not');
    msg.blur();
    await wait(5);
    kpTap_(w, msg);
    if (!up()) bad.push('a tap on the message box did not bring the pad up');
    else {
      if (pad().getAttribute('data-layer') !== 'abc') bad.push('the message box opened the pad on ' + pad().getAttribute('data-layer') + ', wanted the letters');
      if (!pad().querySelector('.kp-key[data-v="!nl"]')) bad.push('the message box\'s pad has no return key — a message of lines cannot be typed');
      if (!pad().querySelector('.kp-key.kp-done-k')) bad.push('the message box\'s ✓ is not `done` — it would look like Send and only put the pad away');
      if (pad().querySelector('.kp-q')) bad.push('the question strip rides on the pad over a message box');
      kpTypeOn_(w, 'see you at 4\nthanks', bad);
      if (msg.value !== 'see you at 4\nthanks') bad.push('the pad typed ' + JSON.stringify(msg.value) + ' into the message box, wanted "see you at 4\\nthanks"');
      if (d.activeElement !== msg) bad.push('typing on the pad took the focus off the message box');
      const kept = w.draftRead_('msg', 'P-TOM');
      if (!kept || String(kept).indexOf('thanks') === -1) bad.push('what the pad typed was not kept as the composer\'s draft (' + JSON.stringify(kept) + ') — the pad did not send the input event a keyboard sends');
      /* A LAPTOP'S KEY AND A PASTE are the field's own: nothing cancels them */
      const kd = new w.KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
      msg.dispatchEvent(kd);
      if (kd.defaultPrevented) bad.push('a laptop\'s key in the message box was cancelled — a physical keyboard must type as it always has');
      const ps = new w.Event('paste', { bubbles: true, cancelable: true });
      msg.dispatchEvent(ps);
      if (ps.defaultPrevented) bad.push('a paste into the message box was cancelled');
      const before = sent.length;
      A['kp-key'](pad().querySelector('.kp-key.kp-done-k'));
      if (up()) bad.push('`done` on the message box left the pad up');
      if (sent.slice(before).some(b => /message|send/i.test(String(b.action || '')))) bad.push('`done` on the message box sent the message — only the Send tile sends');
      if (msg.value !== 'see you at 4\nthanks') bad.push('`done` changed the message to ' + JSON.stringify(msg.value));
      /* THE COMPOSER DRAWN AGAIN WITH THE PAD ON IT (a message sent) takes the pad with it: a pad over no box types nowhere. Safari sends no focusout for a box taken away, and nor does jsdom */
      await wait(5);
      kpTap_(w, msg);
      if (!up()) bad.push('a second tap on the message box did not bring the pad back');
      host.innerHTML = w.msgForm_('Tom Tutor', 'P-TOM');
      await wait(5);
      if (up()) bad.push('the message box was drawn again under the pad and the pad stayed up over a box that is gone');
    }
  }
  /* A ONE-LINE BOX IN A FORM (receipt.js's "why"): ✓ is its Enter, so the form is sent as Enter sends it, once */
  host.innerHTML = '<form class="kp-test-form"><input type="text" name="why"></form>';
  await wait(0);
  const fm = host.querySelector('form'), why = fm && fm.querySelector('input');
  let sentForm = 0;
  if (fm) fm.addEventListener('submit', e => { e.preventDefault(); sentForm++; });
  if (why) {
    kpTap_(w, why);
    if (!up()) bad.push('a tap on a box in a form did not bring the pad up');
    else {
      kpTypeOn_(w, 'late', bad);
      A['kp-key'](pad().querySelector('.kp-key.kp-done'));
      if (sentForm !== 1) bad.push('✓ on a one-line box in a form sent it ' + sentForm + ' times — it is the box\'s Enter, which sends its form once');
      if (up()) bad.push('✓ on a box in a form left the pad up');
    }
  }
  host.remove();

  /* 2. A SETTINGS BOX: its words typed and kept; the phone number opens on the digits */
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return bad.concat(['drawing settings threw: ' + e.message]); }
  await wait(300);
  const head = d.querySelector('#s-account input[data-me="borough"]') || d.querySelector('#s-account input[data-me="city"]');
  const name = head ? head.getAttribute('data-me') : '';
  bad.push(...kpBoundSays_(w, head, 'abc', 'the settings box'));
  if (head) {
    kpTap_(w, head);
    if (!up() || pad().getAttribute('data-layer') !== 'abc') bad.push('a tap on the settings box did not bring the pad up on its letters');
    const was = head.value;
    try { head.setSelectionRange(was.length, was.length); } catch (e) { /* a box with no caret types at its end */ }
    kpTypeOn_(w, ' and physics', bad);
    if (head.value !== was + ' and physics') bad.push('the pad typed ' + JSON.stringify(head.value) + ' into the settings box, wanted ' + JSON.stringify(was + ' and physics'));
    const kept = w.draftRead_('set', name);
    if (!kept || String(kept).indexOf('physics') === -1) bad.push('the settings box\'s edit was not kept as its draft (' + JSON.stringify(kept) + ')');
    head.blur();
    await wait(5);
    if (up()) bad.push('the pad stayed up after the settings box lost the focus');
  }
  const tel = d.querySelector('#s-account [data-me="phone_no"]');
  bad.push(...kpBoundSays_(w, tel, 'num', 'the phone number box'));
  if (tel) {
    kpTap_(w, tel);
    if (!up() || pad().getAttribute('data-layer') !== 'maths' || !pad().querySelector('.kp-key[data-v="7"]')) bad.push('the phone number box did not open the pad on its digits');
    if (pad().querySelector('.kp-key[data-v="!frac"], .kp-key[data-v="!vec"]')) bad.push('the digits face on a box elsewhere still has the answer box\'s fraction or vector key');
    tel.blur();
  }
  return bad;
});

check('signing in on Find types on the @family keypad: the name tag on the letters with @ and . on top, and the PIN is four digit tags, never a box the pad reads out (528)', async () => {
  const reply = b => (b.action === 'verifyLogin' ? Object.assign({ success: true }, ANS_ADA) : { success: true, messages: [] });
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER(null);
  const no = await findSign_(w, null);
  if (no) return [no];
  const nm = d.getElementById('in-name');
  /* THE PIN IS NO BOX (owner, 13 Nov): nothing for a pad, a password manager or the iPad to keep. */
  if (d.getElementById('in-pin')) bad.push('a PIN box is still drawn — the PIN is four digit tags on Find');
  /* ONE SCROLLING PAGE (900): the name tag keeps the phone's own keyboard — never bound to the pad. */
  if (d.documentElement.classList.contains('flow')) {
    if (!nm) bad.push('Find drew no name tag');
    else if (nm.hasAttribute('data-kpb') || nm.getAttribute('inputmode') === 'none') bad.push('the name tag was bound to the pad');
  } else {
    bad.push(...kpBoundSays_(w, nm, 'mail', 'the name tag'));
    if (!nm) return bad;
    kpTap_(w, nm);
    const pad = kpPadOf_(w);
    if (!pad || pad.hidden || pad.getAttribute('data-layer') !== 'abc' || !pad.querySelector('.kp-key[data-v="@"]')) bad.push('the name tag did not open the pad on its letters with @ on top');
    kpTypeOn_(w, 'ada_kind7', bad);
    if (nm.value !== 'ada_kind7') bad.push('the pad typed ' + JSON.stringify(nm.value) + ' as the name');
  }
  /* THE FOURTH DIGIT TAG SIGNS IN, and no digit is read out. */
  sent.length = 0;
  const P4 = ['4', '8', '2', '6'].join('');
  const no2 = await findSign_(w, 'ada_kind7', P4);
  if (no2) return bad.concat([no2]);
  await wait(700);
  if (new RegExp(P4).test(String((d.getElementById('kp-say') || {}).textContent || ''))) bad.push('the PIN was read out by the pad\'s screen-reader line');
  if (!sent.some(b => b.action === 'verifyLogin' && b.pin === P4)) bad.push('the fourth digit tag did not sign in');
  return bad;
});

/* ---------- THE LETTERS ARE TYPED, SAVED AND MARKED; 123 IS THE MATHS KEYS; A LAPTOP STILL TYPES § */
/* EVERY STORED ANSWER CAN BE TYPED (round 4): the symbols face, beside 123 on the letters, types ≈ → … ∛ and the Greek, and a ≈ answer typed there is marked */
check('the pad\'s symbols face types ≈ → … ∛ and Greek letters into the box, and an answer with ≈ typed on it is marked right', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — nothing was checked'];
  const h = d.createElement('div');
  const x = { kind: 'question', key: 'q-sym-1', name: 'Q5c', marks: 1, html: '<p>Estimate the roots.</p>', answer: '<b>x &asymp; 2.6</b>',
    answerType: 'calculation', accept: 'x ≈ 2.6', row: { row_id: 'Q-SYM-1', paper_id: 'P-SYM', subject: 'Maths', name: 'Symbols' } };
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  h.innerHTML = w.findCard(x, 0);
  d.body.appendChild(h);
  const inp = h.querySelector('.kp-in');
  if (!inp) return ['the part drew no keypad box'];
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return ['focusing the box did not open the pad'];
  const key = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
  const press = v => { const b = key(v); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the ' + pad.getAttribute('data-layer') + ' face'); };
  press('x'); press(' '); press('!abc'); press('!sym');
  if (pad.getAttribute('data-layer') !== 'sym' || !pad.classList.contains('is-sym')) bad.push('αβ on the letters did not turn the pad to its symbols: ' + pad.getAttribute('data-layer'));
  ['≈', '→', '…', '∛', 'θ', 'μ', '≠', '∞', '{', '[', '∈'].forEach(c => { if (!key(c)) bad.push('the symbols face has no ' + c + ' key'); });
  const bottom = [...pad.querySelectorAll('.kp-key')].slice(-7).map(b => b.getAttribute('data-v'));
  if (bottom.slice(-6).join('|') !== '!123|!abc|!mic| |!back|!done') bad.push('the symbols\' bottom row is ' + bottom.join(' ') + ', wanted 123 abc mic space ⌫ ✓ (562)');
  press('≈'); press(' '); press('!123'); ['2', '.', '6'].forEach(press);
  if (inp.value !== 'x ≈ 2.6') bad.push('x, a space, ≈ from the symbols, a space, 2.6 gave ' + JSON.stringify(inp.value));
  press('!done'); sendRow_(w, inp);
  const mark = h.querySelector('.qp-mark');
  if (!mark || !mark.classList.contains('is-right')) bad.push('"x ≈ 2.6" typed on the pad was not marked right against "x ≈ 2.6": ' + (mark ? mark.textContent.trim().slice(0, 120) : 'no mark'));
  h.remove();
  return bad;
});

/* A POWER TYPED ON THE PAD (the owner, on an A-level question: "there's no to the power of button on keypad"): in sight on 123 and on the letters, ^() with the caret inside, marked as x^2 and x^(n+1) are stored */
check('the power key is on the maths face and the letters, types x^(n+1) with its caret raised, and a power typed on it is marked right against x^2 and x^(n+1)', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — nothing was checked'];
  const run = async (key, accept, keys, want) => {
    const h = d.createElement('div');
    const x = { kind: 'question', key: key, name: 'Q2', marks: 1, html: '<p>Differentiate.</p>', answer: '<b>' + accept + '</b>',
      answerType: 'calculation', accept: accept, row: { row_id: key.toUpperCase(), paper_id: 'P-POW', subject: 'Maths', name: 'Powers', level: 'A-level' } };
    try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
    h.innerHTML = w.findCard(x, 0);
    d.body.appendChild(h);
    const inp = h.querySelector('.kp-in');
    if (!inp) { h.remove(); return bad.push('the part drew no keypad box'); }
    inp.focus();
    const pad = d.getElementById('kp');
    if (!pad || pad.hidden) { h.remove(); return bad.push('focusing the box did not open the pad'); }
    const key_ = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
    if (!key_('!pow')) bad.push('the ' + pad.getAttribute('data-layer') + ' face has no power key in sight');
    else if (!/power/.test(key_('!pow').getAttribute('aria-label') || '')) bad.push('the power key is not named a power');
    A['kp-key'](key_('!abc'));
    if (!key_('!pow')) bad.push('the letters face has no power key — a power is a face away');
    A['kp-key'](key_('!123'));
    keys.forEach(v => { const b = key_(v); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the ' + pad.getAttribute('data-layer') + ' face'); });
    if (inp.value !== want) bad.push('typing ' + keys.join(' ') + ' gave ' + JSON.stringify(inp.value) + ', wanted ' + JSON.stringify(want));
    A['kp-key'](key_('!done')); sendRow_(w, inp);
    const mark = h.querySelector('.qp-mark');
    if (!mark || !mark.classList.contains('is-right')) bad.push(JSON.stringify(inp.value) + ' typed with the power key was not marked right against ' + JSON.stringify(accept) + ': ' + (mark ? mark.textContent.trim().slice(0, 120) : 'no mark'));
    h.remove();
  };
  await run('q-pow-1', '3x^2', ['3', 'x', '!pow', '2'], '3x^(2)');
  await run('q-pow-2', 'x^(n+1)', ['x', '!pow', '(', '!abc', 'n', '!123', '+', '1', ')'], 'x^(n+1)');
  return bad;
});

/* NO QUESTION STRIP ON THE PAD (owner, 9 Nov, B): the question stays where it is and the pad never repeats it. */
check('the pad never repeats the question above its keys, on any face', async () => {
  const { w } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key']) return ['the keypad has no handler — nothing was checked'];
  const h = d.createElement('div');
  const x = { kind: 'question', key: 'q-strip-1', name: 'Q4', marks: 1, html: '<p>Work out the area of the triangle.</p>',
    answer: '<b>24</b>', answerType: 'calculation', accept: '24', row: { row_id: 'Q-STRIP-1', paper_id: 'P-STRIP', subject: 'Maths', name: 'Strip' } };
  h.innerHTML = w.findCard(x, 0);
  d.body.appendChild(h);
  const inp = h.querySelector('.kp-in');
  if (!inp) return ['the part drew no keypad box'];
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return ['focusing the box did not open the pad'];
  ['maths', '!abc', '!sym', '!123'].forEach(v => {
    if (v !== 'maths') { const b = pad.querySelector('.kp-key[data-v="' + v + '"]'); if (b) A['kp-key'](b); else bad.push('no ' + v + ' key'); }
    if (pad.querySelector('.kp-q')) bad.push('the ' + pad.getAttribute('data-layer') + ' face repeats the question');
  });
  h.remove();
  return bad;
});

check('the pad\'s letters type, save and mark a worded answer; 123 is the maths keys; ⇧, a laptop\'s keys and a paste all type', async () => {
  const { w, errs } = boot();
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  if (!A['kp-key'] || !A['qp-check']) return ['the keypad or Check has no handler — nothing was checked'];
  const draw = x => { const h = d.createElement('div'); h.innerHTML = w.findCard(x, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const base = { kind: 'question', name: 'Q3', marks: 1, html: '<p>Name the process.</p>', answer: '<b>egestion</b>',
    row: { row_id: 'Q-ABC-1', paper_id: 'P-ABC', subject: 'Biology', name: 'Letters' } };
  const x = Object.assign({}, base, { key: 'q-abc-short', answerType: 'short', accept: 'egestion' });
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const card = draw(x);
  const inp = card.querySelector('.kp-in');
  if (!inp || inp.getAttribute('data-kp') !== 'words') return ['a short answer whose scheme is a word did not get the pad\'s words box: ' + (inp ? inp.outerHTML.slice(0, 120) : '(none)')];
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden) return ['focusing the worded box did not open the pad'];
  const key = v => pad.querySelector('.kp-key[data-v="' + v + '"]');
  const press = v => { const b = key(v); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the ' + pad.getAttribute('data-layer') + ' face'); };
  /* THE LETTERS FACE: every letter, the punctuation, and the maths pad's bottom row in its places. */
  const letters = 'qwertyuiopasdfghjklzxcvbnm'.split('').filter(c => !key(c));
  if (letters.length) bad.push('the letters face has no key for ' + letters.join(' '));
  ["'", '.', ' ', '!shift', '!mic'].forEach(v => { if (!key(v)) bad.push('the letters face has no ' + JSON.stringify(v) + ' key'); });
  /* AS AN iPHONE'S (562): ⌫ ends the z row, and the last row is 123 αβ mic space ' . ✓. */
  const bottom = [...pad.querySelectorAll('.kp-key')].slice(-8).map(b => b.getAttribute('data-v'));
  if (bottom.join('|') !== '!back|!123|!sym|!mic| |\'|.|!done') bad.push('the letters\' last keys are ' + bottom.join(' ') + ', wanted ⌫ then 123 αβ mic space \' . ✓');
  if (key('!back') && !key('!back').classList.contains('kp-del')) bad.push('⌫ on the letters is not the red key');
  'egestion'.split('').forEach(press);
  if (inp.value !== 'Egestion') bad.push('typing e-g-e-s-t-i-o-n on the letters gave ' + JSON.stringify(inp.value) + ', wanted "Egestion" -- the first letter a capital by itself');
  let kept = null;
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (kept !== inp.value) bad.push('the letters\' answer was not saved under ansKey_ (got ' + JSON.stringify(kept) + ')');
  if (!/Egestion/.test(card.querySelector('.kp-show').textContent)) bad.push('the drawing does not show the letters typed: ' + card.querySelector('.kp-show').innerHTML.slice(0, 120));
  press('!done');
  if (!pad.hidden) bad.push('done left the pad up');
  sendRow_(w, inp);
  const mark = card.querySelector('.qp-mark');
  if (!mark || !mark.classList.contains('is-right')) bad.push('Check on "Egestion" against egestion was not marked right: ' + (mark ? mark.className + ' / ' + mark.textContent.trim() : 'no mark row'));
  /* `123` AND BACK, ⇧ AND CAPS LOCK, ⌫ IN PROSE. */
  inp.focus();
  press('!123');
  if (pad.getAttribute('data-layer') !== 'maths' || pad.querySelectorAll('.kp-key').length !== 42 || !key('7') || !key('!abc')) bad.push('`123` did not show the maths pad\'s 42 keys with `abc` on it');
  press('5');
  press('!abc');
  if (pad.getAttribute('data-layer') !== 'abc') bad.push('`abc` did not turn the pad back to its letters');
  press(' ');
  press('!shift'); press('a'); press('b');
  if (!/5 Ab$/.test(inp.value)) bad.push('5 from the maths face, a space, ⇧ a b gave ' + JSON.stringify(inp.value) + ', wanted it to end "5 Ab" -- one capital, then lower case');
  press('!shift'); press('!shift'); press('c'); press('d');
  if (!/CD$/.test(inp.value) || !key('!shift').classList.contains('is-lock')) bad.push('⇧ twice did not lock capitals: ' + JSON.stringify(inp.value));
  press('!shift');
  if (key('!shift').classList.contains('is-on')) bad.push('⇧ pressed while locked did not turn capitals off');
  inp.value = inp.value + '(e)';
  inp.setSelectionRange(inp.value.length, inp.value.length);
  press('!back');
  if (!/\(e$/.test(inp.value)) bad.push('⌫ after a bracket in a worded box gave ' + JSON.stringify(inp.value) + ' -- in prose a bracket is deleted like any letter');
  /* A LAPTOP'S KEYS, INTO THE READONLY BOX THROUGH THE PAD'S EDIT. */
  const kd = (k, o) => { const e = new w.KeyboardEvent('keydown', Object.assign({ key: k, bubbles: true, cancelable: true }, o || {})); inp.dispatchEvent(e); return e.defaultPrevented; };
  inp.value = ''; inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  inp.setSelectionRange(0, 0);
  const took = ['R', 'a', 't', 'e', ' ', 'u', 'p'].map(k => kd(k));
  kd('Backspace'); kd('ArrowLeft'); kd('Enter', { shiftKey: true });
  if (inp.value !== 'Rate \nu') bad.push('a laptop typing "Rate up", Backspace, ←, Shift+Enter gave ' + JSON.stringify(inp.value) + ', wanted "Rate \\nu"');
  if (took.some(t => !t)) bad.push('a laptop\'s key was left to the browser as well as typed by the pad');
  /* THE START OF THE ANSWER IS CTRL+HOME SINCE 9 OCT: § */
  kd('Home');
  if (inp.selectionStart !== 6) bad.push('Home on the second line put the caret at ' + inp.selectionStart + ', wanted 6, the start of that line');
  kd('Home', { ctrlKey: true });
  const paste = new w.Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(paste, 'clipboardData', { value: { getData: () => 'It ' } });
  inp.dispatchEvent(paste);
  if (inp.value !== 'It Rate \nu' || !paste.defaultPrevented) bad.push('a paste at the start gave ' + JSON.stringify(inp.value) + ', wanted "It Rate \\nu" typed through the pad');
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (kept !== 'It Rate \nu') bad.push('the laptop\'s answer was not saved under ansKey_ (got ' + JSON.stringify(kept) + ')');
  /* AND WHAT `readonly` TOOK FROM A LAPTOP, PUT BACK -- the review of 8 Oct measured each one gone: § */
  const L = inp.value.length;
  kd('End', { ctrlKey: true }); kd('ArrowLeft', { shiftKey: true }); kd('ArrowLeft', { shiftKey: true });
  if (inp.selectionStart !== L - 2 || inp.selectionEnd !== L || inp.selectionDirection !== 'backward') bad.push('⇧← twice from the end selected ' + inp.selectionStart + '-' + inp.selectionEnd + ' ' + inp.selectionDirection + ', wanted ' + (L - 2) + '-' + L + ' backward -- the selection grows from where it began');
  if (!card.querySelector('.kp-show mark.kp-sel')) bad.push('a selection made with ⇧← is not drawn');
  kd('ArrowRight', { shiftKey: true });
  if (inp.selectionStart !== L - 1 || inp.selectionEnd !== L) bad.push('⇧→ after ⇧←⇧← left ' + inp.selectionStart + '-' + inp.selectionEnd + ', wanted ' + (L - 1) + '-' + L + ' -- the moving end comes back, the anchor stays');
  kd('Home', { shiftKey: true, ctrlKey: true });
  if (inp.selectionStart !== 0 || inp.selectionEnd !== L) bad.push('⇧Ctrl+Home from the end selected ' + inp.selectionStart + '-' + inp.selectionEnd + ', wanted 0-' + L);
  /* Ctrl+A (all selected) and a letter, then Ctrl+Z: the paragraph back, selected as it was; ⇧Ctrl+Z, Ctrl+Y forward. */
  const para = inp.value;
  kd('Z');
  if (inp.value !== 'Z') bad.push('a letter over everything selected gave ' + JSON.stringify(inp.value) + ', wanted "Z"');
  const undid = kd('z', { ctrlKey: true });
  if (inp.value !== para || inp.selectionStart !== 0 || inp.selectionEnd !== L) bad.push('Ctrl+Z after a letter over the whole answer gave ' + JSON.stringify(inp.value) + ' ' + inp.selectionStart + '-' + inp.selectionEnd + ', wanted the paragraph back, all selected');
  if (!undid) bad.push('Ctrl+Z was left to the browser as well -- its own undo is another field\'s');
  try { kept = w.localStorage.getItem(w.__t.ansKey(x)); } catch (e) {}
  if (kept !== para) bad.push('an undo was not saved under ansKey_ (got ' + JSON.stringify(kept) + ')');
  kd('z', { ctrlKey: true, shiftKey: true });
  if (inp.value !== 'Z') bad.push('⇧Ctrl+Z after an undo gave ' + JSON.stringify(inp.value) + ', wanted "Z" again');
  kd('z', { metaKey: true });
  kd('y', { ctrlKey: true });
  if (inp.value !== 'Z') bad.push('⌘Z then Ctrl+Y gave ' + JSON.stringify(inp.value) + ', wanted "Z" -- undone and redone');
  kd('z', { ctrlKey: true });
  /* A RUN OF LETTERS IS ONE STEP, A WORD AT A TIME. */
  kd('End', { ctrlKey: true }); [' ', 'o', 'k'].forEach(c => kd(c));
  kd('z', { ctrlKey: true });
  if (inp.value !== para + ' ') bad.push('Ctrl+Z after typing " ok" gave ' + JSON.stringify(inp.value) + ', wanted the word "ok" gone and the space kept');
  kd('z', { ctrlKey: true });
  if (inp.value !== para) bad.push('a second Ctrl+Z gave ' + JSON.stringify(inp.value) + ', wanted ' + JSON.stringify(para));
  /* ALTGR: Ctrl+Alt with a one-character key is a character. */
  kd('End', { ctrlKey: true }); kd('€', { ctrlKey: true, altKey: true });
  if (inp.value !== para + '€') bad.push('AltGr+E (€, Ctrl+Alt on Windows) gave ' + JSON.stringify(inp.value) + ' -- dropped as a shortcut');
  /* A CUT: the selection to the clipboard and out of the box, and Ctrl+Z puts it back. */
  inp.setSelectionRange(0, 3);
  let clip = null;
  const cut = new w.Event('cut', { bubbles: true, cancelable: true });
  Object.defineProperty(cut, 'clipboardData', { value: { setData: (t, v) => { clip = v; } } });
  inp.dispatchEvent(cut);
  if (clip !== 'It ' || inp.value !== para.slice(3) + '€' || !cut.defaultPrevented) bad.push('a cut of "It " put ' + JSON.stringify(clip) + ' on the clipboard and left ' + JSON.stringify(inp.value));
  kd('z', { ctrlKey: true });
  if (inp.value !== para + '€') bad.push('Ctrl+Z after a cut gave ' + JSON.stringify(inp.value));
  inp.value = para; inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  kd('Enter');
  if (!pad.hidden) bad.push('Enter on the worded box left the pad up');
  /* A MATHS BOX TYPED ON A LAPTOP KEEPS ITS SLOTS: Backspace steps into a filled fraction, as ⌫ does. */
  const m = Object.assign({}, base, { key: 'q-abc-maths', answerType: 'calculation', accept: '0.75', row: Object.assign({}, base.row, { row_id: 'Q-ABC-2' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(m)); } catch (e) {}
  const mi = draw(m).querySelector('.kp-in');
  mi.focus();
  if (pad.getAttribute('data-layer') !== 'maths') bad.push('a maths box opened the pad on ' + pad.getAttribute('data-layer'));
  /* ONE PAD TYPES ANYTHING (round 3): the signs row is on every box, whatever its scheme */
  if (!key('<')) bad.push('a maths box whose scheme is 0.75 has no signs row -- the one pad types anything');
  ['3', '*', '4'].forEach(k => mi.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true })));
  if (mi.value !== '3×4') bad.push('a laptop typing 3*4 into a maths box gave ' + JSON.stringify(mi.value) + ', wanted "3×4"');
  mi.value = '(3)/(4)'; mi.setSelectionRange(7, 7);
  mi.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Backspace', bubbles: true, cancelable: true }));
  if (mi.value !== '(3)/(4)' || mi.selectionStart !== 6) bad.push('a laptop Backspace after a filled fraction gave ' + JSON.stringify(mi.value) + ' at ' + mi.selectionStart + ' -- wanted the caret stepped inside, as ⌫ does');
  /* ⇧Home IN A MATHS BOX SELECTS, AND THE SELECTION IS DRAWN: its two ends in the typeset answer, no caret. */
  mi.setSelectionRange(7, 7);
  mi.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Home', shiftKey: true, bubbles: true, cancelable: true }));
  const mShow = mi.parentNode.querySelector('.kp-show');
  if (mi.selectionStart !== 0 || mi.selectionEnd !== 7) bad.push('⇧Home in a maths box selected ' + mi.selectionStart + '-' + mi.selectionEnd + ', wanted 0-7');
  if (!mShow.querySelector('.kp-sel-a') || !mShow.querySelector('.kp-sel-b') || mShow.querySelector('.kp-caret')) bad.push('a maths selection is not drawn by its two ends: ' + mShow.innerHTML.slice(0, 160));
  mi.blur();
  await wait(10);
  /* THE SIGNS ROW WHERE THE SCHEME NEEDS IT: an inequality's box has < ≤ ≥ > : ± above the digits. */
  const ineq = Object.assign({}, base, { key: 'q-abc-ineq', answerType: 'calculation', accept: 'x<3', row: Object.assign({}, base.row, { row_id: 'Q-ABC-3' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(ineq)); } catch (e) {}
  const ii = draw(ineq).querySelector('.kp-in');
  ii.focus();
  ['<', '≤', '≥', '>', ':', '±'].forEach(v => { if (!key(v)) bad.push('an inequality\'s box has no ' + v + ' key'); });
  press('x'); press('<'); press('3'); press('!done'); sendRow_(w, ii);
  if (ii.value !== 'x<3' || !ii.closest('.qcard').querySelector('.qp-mark.is-right')) bad.push('x < 3 typed on the signs row gave ' + JSON.stringify(ii.value) + ' and was not marked right');
  /* AND ONLY THERE: with no scheme, the answer the worked answer LEADS with decides -- never its prose, which
     names wrong forms ("eg 5 : 9") and gave 411 more boxes a sixth row, one of them lifted off the screen. */
  const signed = (id, extra) => draw(Object.assign({}, base, { key: 'q-abc-' + id, answerType: 'calculation',
    row: Object.assign({}, base.row, { row_id: 'Q-ABC-' + id }) }, extra)).querySelector('.kp-in').hasAttribute('data-kp-signs');
  if (['prose', 'scheme'].some((id, n) => !signed(id, n ? { accept: '5/9 | 0.56', answer: '<b>5 : 9</b>' } : { accept: '', answer: '5/9' }))) bad.push('a box with no signs row -- every box has it on the one pad (round 3)');
  /* AND ON A WORDED BOX THAT NEEDS ONE. § */
  const wi = Object.assign({}, base, { key: 'q-abc-wineq', answerType: 'calculation', accept: 'x < 4 or x > 5 | x > 5 or x < 4',
    row: Object.assign({}, base.row, { row_id: 'Q-ABC-WINEQ' }) });
  try { w.localStorage.removeItem(w.__t.ansKey(wi)); } catch (e) {}
  const wb = draw(wi).querySelector('.kp-in');
  if (!wb.hasAttribute('data-kp-signs')) bad.push('a calculation whose scheme is "x < 4 or x > 5" has no signs row: ' + wb.outerHTML.slice(0, 160));
  wb.focus();
  /* ROUND 3: one pad types anything -- a calculation opens on its maths layer whatever words its scheme holds, the letters one key away */
  if (pad.getAttribute('data-layer') !== 'maths' || !key('!abc')) bad.push('a calculation whose scheme is "x < 4 or x > 5" did not open on the maths layer with abc on it');
  ['<', '≤', '≥', '>', ':', '±'].forEach(v => { if (!key(v)) bad.push('the maths layer of a box whose scheme is "x < 4 or x > 5" has no ' + v + ' key'); });
  ['x', '<', '4', ' '].forEach(press); press('!abc'); ['o', 'r', ' '].forEach(press); press('!123'); ['x', '>', '5'].forEach(press);
  press('!done'); sendRow_(w, wb);
  if (wb.value !== 'x<4 or x>5' || !wb.closest('.qcard').querySelector('.qp-mark.is-right')) bad.push('"x<4 or x>5" typed on the pad into a worded box gave ' + JSON.stringify(wb.value) + ' and was not marked right');
  try { w.localStorage.removeItem(w.__t.ansKey(wi)); } catch (e) {}
  /* A WORDED ANSWER FROM ANOTHER DEVICE IS DRAWN AS WORDS: `ansRefresh_` through the pad's own drawing. */
  if (typeof w.ansRefresh_ === 'function') {
    const k = w.__t.ansKey(x);
    try { w.localStorage.setItem(k, 'a well-known and/or 3/4 fact'); } catch (e) {}
    w.ansRefresh_([k]);
    const show = card.querySelector('.kp-show');
    if (inp.value !== 'a well-known and/or 3/4 fact' || show.textContent !== 'a well-known and/or 3/4 fact' || show.querySelector('.frac, sup, sub')) {
      bad.push('a worded answer filled from the account is drawn as ' + JSON.stringify(show.innerHTML.slice(0, 160)) + ' -- typeset, not the words it is');
    }
  } else bad.push('ansRefresh_ is not reachable — a worded box filled from the account was NOT checked');
  [x, m, ineq].forEach(it => { try { w.localStorage.removeItem(w.__t.ansKey(it)); } catch (e) {} });
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- NO EXACT KEY, NO MARK (owner, 16 Nov): the part's one tile is Save; typed words and photos of the working are kept, and nothing asks for an AI mark ---------- */
check('a part with no exact key has no Mark button: Save keeps the words as an unmarked submission, and the photos go with them to markWorking', async () => {
  const bad = [];
  const { w, sent, errs } = boot({ payload: payload(), reply: b => (b.action === 'markWorking' ? { success: true, saved: true, photos: 2 } : null) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS;
  if (!A['qp-work'] || !A['qp-send'] || !A['qp-work-x']) return ['the photo tiles or Save have no handlers'];
  if (A['qp-ai'] || A['qp-ai-again']) bad.push('an AI mark handler (qp-ai) is still there');
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const proof = { kind: 'question', key: 'q-wk-1', name: 'Q5', marks: 3, answerType: 'proof', accept: '',
    row: { row_id: 'Q-WK-1', paper_id: 'P-WK', subject: 'Maths', name: 'Algebra' },
    html: '<p>Show that (x + 1)<sup>2</sup> = x<sup>2</sup> + 2x + 1</p>', answer: 'Expands (1); collects (1); conclusion (1)' };
  const why = { kind: 'question', key: 'q-wk-3', name: 'Q6', marks: 2, answerType: 'explain', accept: '',
    row: { row_id: 'Q-WK-3', paper_id: 'P-WK', subject: 'Science', name: 'Rates' }, html: '<p>Explain why the rate increases.</p>', answer: 'Particles move faster.' };
  const plain = { kind: 'question', key: 'q-wk-2', name: 'Q1', marks: 1, answerType: 'number', accept: '7',
    row: { row_id: 'Q-WK-2', paper_id: 'P-WK', subject: 'Maths', name: 'Number' }, html: '<p>Work out 3 + 4</p>', answer: '7' };
  const draw = it => { const h = d.createElement('div'); h.innerHTML = w.findCard(it, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const card = draw(proof), worded = draw(why), other = draw(plain);
  [card, worded].forEach((c, i) => {
    const tiles = [...c.querySelectorAll('.qt-row .is-submit')];
    if (tiles.length !== 1 || tiles[0].getAttribute('data-do') !== 'qp-send' || tiles[0].getAttribute('aria-label') !== 'Save') bad.push((i ? 'the explain part' : 'the proof') + '\'s tile is ' + tiles.map(t => t.getAttribute('data-do') + '/' + t.getAttribute('aria-label')).join(', ') + ' — wanted one Save');
    if (c.querySelector('[data-do="qp-ai"], .qp-ai, .qp-ai-why, .qp-ai-note')) bad.push('a part with no key still draws an AI mark button or line');
  });
  if (!card.querySelector('.qt-row [data-do="qp-work"]')) bad.push('a part with no exact key drew no Photo of my working tile');
  if (other.querySelector('.qt-row [data-do="qp-work"]')) bad.push('a rule-marked part offers a photo');
  if (!other.querySelector('.qt-row [data-do="qp-check"]')) bad.push('a rule-marked part lost its Check');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [proof, why];
  try {
    /* WORDS ALONE: one `sent` submission, said Saved */
    const wi = worded.querySelector('.qp-ans-in');
    if (wi) wi.value = 'the particles move faster';
    A['qp-send'](worded.querySelector('.qt-row [data-do="qp-send"]')); await wait(30);
    const out = (worded.querySelector('.qp-verdict') || {}).textContent || '';
    if (!/^Saved/.test(out)) bad.push('Save on words said ' + JSON.stringify(out));
    let latest = null;
    try { latest = (JSON.parse(w.localStorage.getItem('subLast:u:P-S1') || '{}') || {})[why.key]; } catch (e) {}
    if (!latest || latest.v !== 'sent' || latest.a !== 'the particles move faster') bad.push('the words were not kept as an unmarked submission: ' + JSON.stringify(latest));
    /* PHOTOS: sent with the words to markWorking, and nothing marks them */
    const k = w.__t.ansKey(proof);
    w.workPics_(k).push({ url: 'data:image/jpeg;base64,AAAA' }, { url: 'data:image/jpeg;base64,BBBB' });
    w.workPaint_(k);
    const strip = card.querySelector('.qp-work');
    if (!strip || strip.hidden || strip.querySelectorAll('.qp-work-pic img').length !== 2) bad.push('two photos were not drawn as thumbnails under the box');
    const inp = card.querySelector('.qp-ans-in'); if (inp) inp.value = 'see working';
    A['qp-send'](card.querySelector('.qt-row [data-do="qp-send"]')); await wait(80);
    const s = sent.find(b => b.action === 'markWorking');
    if (!s) bad.push('Save with photos sent nothing to markWorking');
    else {
      if ((s.photos || []).length !== 2 || s.answer !== 'see working') bad.push('markWorking was sent ' + JSON.stringify({ photos: (s.photos || []).length, answer: s.answer }));
      if (s.question || s.scheme) bad.push('markWorking was sent the question or the scheme — nothing marks it, so nothing needs them');
    }
    if (!/Saved, with 2 photos/.test((card.querySelector('.qp-verdict') || {}).textContent || '')) bad.push('Save with photos said ' + JSON.stringify((card.querySelector('.qp-verdict') || {}).textContent));
  } finally { w.stuffItemsAll_ = held; }
  if (sent.some(b => b.action === 'aiMark')) bad.push('a part with no key asked for an AI mark');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- AN ESSAY IS WRITTEN ON A SHEET, IN PARAGRAPHS, AND MARKED WHOLE § */
check('an essay is a sheet: the pad\'s return and a laptop\'s Enter make paragraphs, the words are counted, and Save keeps all of it, unmarked', async () => {
  const ID = 'Q-R0398-5';
  const LIB = LIB_FULL.rows('questions');
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — no essay was written'];
  const paper = LIB.filter(r => r.paper_id === row.paper_id);
  const { w, sent, errs } = boot({ payload: payload(), serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const need = ['ansEssay_', 'findCard', 'stuffItemsAll_', 'kpWordCount_'].filter(n => typeof w[n] !== 'function');
  if (need.length || !A['kp-key'] || !A['qp-send']) return [need.join(', ') + ' or the keypad / Save not reachable — no essay was written'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  if (!x) return ['the real ' + ID + ' did not come through the loader into Find — no essay was written'];
  if (!w.ansEssay_(x)) bad.push(ID + ' (' + x.answerType + ', ' + x.marks + ' marks) is not an essay to `ansEssay_`');
  /* THE RULE'S EDGES: a one-mark `written` is a phrase, a three-mark `explain` a sentence or two. */
  const shortOf = (t, m) => ({ kind: 'question', answerType: t, marks: m, accept: '', choices: [] });
  if (w.ansEssay_(shortOf('written', 1)) || w.ansEssay_(shortOf('explain', 3)) || !w.ansEssay_(shortOf('explain', 8)) || w.ansEssay_(shortOf('calculation', 6))) {
    bad.push('`ansEssay_` does not draw its line at written/explain worth 6 or more');
  }
  /* AND NEVER MATHS: a six-mark "show that" is working, not writing on a sheet. */
  if (w.ansEssay_(Object.assign(shortOf('explain', 6), { subject: 'Maths' })) || w.ansEssay_(Object.assign(shortOf('explain', 7), { row: { subject: 'Maths' } }))
      || !w.ansEssay_(Object.assign(shortOf('explain', 6), { subject: 'Physics' }))) {
    bad.push('`ansEssay_` takes a six-mark Maths explain for an essay (or a Physics one for not) — its scheme is method steps, and the essay prompt marks writing on levels');
  }
  const k = w.__t.ansKey(x);
  try { w.localStorage.removeItem(k); } catch (e) {}
  const host = d.createElement('div');
  d.body.appendChild(host);
  const draw = it => { host.innerHTML = w.findCard(it, 0); return host.querySelector('.qcard'); };
  let card = draw(x);
  /* ---------- A SHEET, NOT A BAR ---------- */
  const inp = card.querySelector('.qp-ans-in');
  if (!inp || !inp.matches('.qp-essay > label.qp-ans.qp-sheet > .kp-field.kp-words.kp-essay > textarea.kp-in[data-kp="words"][data-kp-essay][readonly][inputmode="none"]')) {
    return bad.concat(['the essay\'s box is not the pad\'s locked textarea on a sheet: ' + (inp ? inp.outerHTML.slice(0, 200) : '(none)')]);
  }
  if (card.querySelector('.qp-bar')) bad.push('the essay card still draws a chat bar');
  /* The row's first four tiles sit in its `.kc-four` (decisions 10 Nov evening: four buttons, then ⋯), Check first among them. */
  const go = card.querySelector(':scope > .kc-act > .qt-row > .kc-four > .tile.qp-send[data-do="qp-send"]:first-child');
  if (!go) bad.push('Save is not the first tile in the row under the sheet');
  /* NO MARK BUTTON (owner, 16 Nov): an essay has no exact key, so its tile saves */
  if (card.querySelector('[data-do="qp-ai"], [data-do="qp-check"]')) bad.push('the essay still offers a Mark or Check button');
  if (go && go.getAttribute('aria-label') !== 'Save') bad.push('the essay\u2019s tile is ' + JSON.stringify(go.getAttribute('aria-label')) + ', not Save');
  const blank = () => !!card.querySelector('.qp-sheet > .kp-field.kp-essay.is-blank');
  if (!blank()) bad.push('an empty sheet is not marked is-blank, so it shows no "press return" hint');
  const words = () => (card.querySelector('.qp-essay .qp-words') || {}).textContent;
  if (words() !== '0 words') bad.push('an empty sheet\'s count says ' + JSON.stringify(words()) + ', wanted "0 words"');
  const mark = card.querySelector('.qp-mark.qp-keep.qp-essay');
  if (!mark || !mark.querySelector(':scope > .qp-verdict') || !mark.querySelector(':scope > .qp-saved')) {
    bad.push('the verdict line and the saved line are not in the essay\'s box');
  }
  /* ---------- THE PAD: ONE RETURN, AND IT SAYS SO ---------- */
  inp.focus();
  const pad = d.getElementById('kp');
  if (!pad || pad.hidden || pad.getAttribute('data-layer') !== 'abc') return bad.concat(['focusing the essay did not open the pad on its letters']);
  const keys = [...pad.querySelectorAll('.kp-key')];
  const nl = keys.filter(b => b.getAttribute('data-v') === '!nl');
  const ret = pad.querySelector('.kp-key.kp-ret[data-v="!nl"]');
  if (nl.length !== 1 || !ret) bad.push('the essay\'s letters have ' + nl.length + ' new-line keys and ' + (ret ? 'a' : 'no') + ' labelled return — wanted exactly one, the return');
  else {
    if (!ret.querySelector('.kp-ret-i')) bad.push('the return key has no ↵ mark: ' + ret.outerHTML.slice(0, 200));
    const space = pad.querySelector('.kp-key.kp-space');
    if (!space || !space.classList.contains('kp-s18')) bad.push('the essay\'s space bar is not 18 columns, the room left beside return and done (562)');
  }
  const bottom = keys.slice(-8).map(b => b.getAttribute('data-v'));
  if (bottom.join('|') !== '!123|!sym|!mic| |\'|.|!nl|!done') bad.push('the essay\'s bottom row is ' + JSON.stringify(bottom) + ', wanted 123 αβ mic space \' . return done (562)');
  const doneKey = keys[keys.length - 1];
  if (!doneKey || !doneKey.classList.contains('kp-done-k') || doneKey.textContent.trim() !== 'done' || doneKey.querySelector('svg')) bad.push('the essay\'s ✓ still wears Send\'s aeroplane — on an essay it only puts the pad away, so it says "done"');
  if (!blank()) bad.push('the sheet stopped being blank when it was focused, so the hint went before a letter was written');
  const press = v => { const b = pad.querySelector('.kp-key[data-v="' + v + '"]'); if (b) A['kp-key'](b); else bad.push('no key ' + JSON.stringify(v) + ' on the essay\'s pad'); };
  /* ---------- TWO PARAGRAPHS ON THE PAD'S KEYS ---------- */
  'the bus'.split('').forEach(press);
  if (blank()) bad.push('the sheet still says it is blank after "The bus"');
  press('!nl'); press('!nl');
  'it rained.'.split('').forEach(press);
  const TWO = 'The bus\n\nIt rained.';
  if (inp.value !== TWO) bad.push('the pad typed ' + JSON.stringify(inp.value) + ', wanted ' + JSON.stringify(TWO) + ' -- a capital by itself after the paragraph break');
  const show = () => card.querySelector('.qp-sheet .kp-show');
  if (show().textContent !== TWO || show().textContent.split(/\n\s*\n/).length !== 2) bad.push('the drawing does not keep the paragraph break: ' + JSON.stringify(show().textContent));
  if (words() !== '4 words') bad.push('"The bus / It rained." is counted as ' + JSON.stringify(words()));
  /* ---------- A THIRD ON A LAPTOP: ENTER IS A NEW LINE HERE ---------- */
  const kd = (key, o) => { const e = new w.KeyboardEvent('keydown', Object.assign({ key: key, bubbles: true, cancelable: true }, o || {})); inp.dispatchEvent(e); return e.defaultPrevented; };
  kd('Enter'); kd('Enter');
  if (pad.hidden) bad.push('Enter in an essay put the pad away — it is the new line there');
  'A third one.'.split('').forEach(c => kd(c));
  const THREE = TWO + '\n\nA third one.';
  if (inp.value !== THREE) bad.push('a laptop\'s Enter, Enter, "A third one." gave ' + JSON.stringify(inp.value) + ', wanted ' + JSON.stringify(THREE));
  if (show().textContent.split(/\n\s*\n/).length !== 3) bad.push('three paragraphs are not drawn as three');
  if (words() !== '7 words') bad.push('three paragraphs of 7 words are counted as ' + JSON.stringify(words()));
  kd('Enter', { shiftKey: true });
  if (inp.value !== THREE + '\n' || pad.hidden) bad.push('Shift+Enter in an essay was not a new line');
  kd('Backspace');
  /* ---------- HOME AND END ARE THE PARAGRAPH'S, CTRL WITH THEM THE ESSAY'S ---------- */
  const p3 = THREE.lastIndexOf('\n') + 1;
  inp.setSelectionRange(p3 + 4, p3 + 4);
  kd('Home');
  if (inp.selectionStart !== p3) bad.push('Home in the third paragraph put the caret at ' + inp.selectionStart + ', wanted ' + p3 + ', the paragraph\'s start');
  inp.setSelectionRange(TWO.indexOf('It') + 2, TWO.indexOf('It') + 2);
  kd('End');
  if (inp.selectionStart !== TWO.length) bad.push('End in the second paragraph put the caret at ' + inp.selectionStart + ', wanted ' + TWO.length + ', the paragraph\'s end');
  kd('Home', { shiftKey: true });
  if (inp.selectionStart !== TWO.indexOf('It') || inp.selectionEnd !== TWO.length) bad.push('Shift+Home selected ' + inp.selectionStart + '–' + inp.selectionEnd + ', wanted the second paragraph');
  kd('End', { ctrlKey: true });
  if (inp.selectionStart !== THREE.length || inp.selectionEnd !== THREE.length) bad.push('Ctrl+End did not go to the end of the essay');
  kd('Home', { ctrlKey: true });
  if (inp.selectionStart !== 0) bad.push('Ctrl+Home did not go to the start of the essay');
  if (inp.value !== THREE) bad.push('Home and End changed the essay: ' + JSON.stringify(inp.value));
  inp.setSelectionRange(THREE.length, THREE.length);
  let kept = null;
  try { kept = w.localStorage.getItem(k); } catch (e) {}
  if (kept !== THREE) bad.push('the essay was not saved under ansKey_ as it was typed (got ' + JSON.stringify(kept) + ')');
  kd('Enter', { ctrlKey: true });
  if (!pad.hidden) bad.push('Ctrl+Enter did not put the pad away');
  if (inp.value !== THREE) bad.push('Ctrl+Enter typed into the essay: ' + JSON.stringify(inp.value));
  /* ---------- SAVE KEEPS ALL OF IT, MARKED BY NOTHING ---------- */
  let big = '';
  for (let i = 1; big.length < 6000; i++) big += 'Paragraph ' + i + '. The rain drew long silver threads across the glass, and the town slid by.\n\n';
  big += 'THE LAST WORDS.';
  inp.focus();
  inp.setSelectionRange(0, inp.value.length);
  const paste = new w.Event('paste', { bubbles: true, cancelable: true });
  Object.defineProperty(paste, 'clipboardData', { value: { getData: () => big } });
  inp.dispatchEvent(paste);
  if (inp.value !== big) bad.push('a pasted 6,000-character essay is ' + inp.value.length + ' characters in the box');
  if (words() !== w.kpWordsSay_(big)) bad.push('the count after a paste says ' + JSON.stringify(words()));
  inp.blur();
  await wait(10);
  if (go) A['qp-send'](go);
  await wait(50);
  if (sent.some(b => b.action === 'aiMark')) bad.push('saving the essay asked for an AI mark');
  let latest = null;
  try { latest = (JSON.parse(w.localStorage.getItem('subLast:u:P-S1') || '{}') || {})[x.key]; } catch (e) {}
  if (!latest || latest.v !== 'sent' || latest.a !== big) bad.push('the essay’s Save was not recorded as an unmarked submission (sent, the whole essay): ' + JSON.stringify(latest && { v: latest.v, len: String(latest.a || '').length }));
  else if (latest.far || !latest.q) bad.push('the essay’s submission (' + big.length + ' characters) is kept as too long to send — the account takes 20,000 since note 312 (`SUB_ANSWER_MAX`)');
  if (!/Saved/.test((card.querySelector('.qp-essay .qp-verdict') || {}).textContent || '')) bad.push('the essay’s line does not say it was saved');
  /* ---------- A SHORT WORDED BOX IS STILL THE BAR, AND ENTER IS STILL ✓ ---------- */
  const sx = { kind: 'question', key: 'q-essay-short', name: 'Q2', marks: 3, answerType: 'explain', accept: '',
    row: { row_id: 'Q-ESSAY-SHORT', paper_id: 'P-ESSAY', subject: 'Chemistry', name: 'Rates' },
    html: '<p>Explain why the rate increases.</p>', answer: 'Particles move faster.' };
  try { w.localStorage.removeItem(w.__t.ansKey(sx)); } catch (e) {}
  card = draw(sx);
  const si = card.querySelector('.qp-ans-in');
  if (!si || !si.closest('.qp-bar') || si.hasAttribute('data-kp-essay') || card.querySelector('.qp-sheet, .qp-words')) bad.push('a three-mark explain box is not the chat bar any more');
  else {
    si.focus();
    if (pad.querySelector('.kp-ret') || [...pad.querySelectorAll('.kp-key')].slice(-7).map(b => b.getAttribute('data-v')).join('|') !== '!123|!sym|!mic| |\'|.|!done') bad.push('a short worded box has not the letters\' last row (123 αβ mic space \' . ✓, 562), or gained the essay\'s return');
    si.dispatchEvent(new w.KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true }));
    if (!pad.hidden || si.value) bad.push('Enter on a short worded box did not put the pad away as ✓ (value ' + JSON.stringify(si.value) + ')');
  }
  try { w.localStorage.removeItem(k); w.localStorage.removeItem(w.__t.ansKey(sx)); } catch (e) {}
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

