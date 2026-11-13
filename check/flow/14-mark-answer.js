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
  if (!field || !/data-do="qp-ans"/.test(field) || !/qp-ans-in/.test(field)) bad.push('kpField_ was not found in js/keypad.js drawing `data-do="qp-ans"` and `.qp-ans-in` -- the rule that only it draws a box asked about nothing');
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

check('signing in types on the @family keypad: the handle on the letters with @ and . on top, the PIN on the digits and never read out, and ✓ signs in (528)', async () => {
  const reply = b => (b.action === 'verifyLogin' ? Object.assign({ success: true }, ANS_ADA) : { success: true, messages: [] });
  const { w, sent } = boot({ reply });
  await wait(300);
  const t = w.__t, d = w.document, A = t.ACTIONS, bad = [];
  t.USER(null); t.go('account', false, true); w.paint('account');
  await wait(20);
  const nm = d.getElementById('in-name'), pin = d.getElementById('in-pin');
  /* ONE SCROLLING PAGE (900): the sign-in boxes keep the phone's own keyboard — never bound to the pad. */
  if (d.documentElement.classList.contains('flow')) {
    [nm, pin].forEach(b => { if (!b) bad.push('the sign-in card drew no box'); else if (b.hasAttribute('data-kpb') || b.getAttribute('inputmode') === 'none') bad.push('#' + b.id + ' was bound to the pad'); });
    return bad;
  }
  bad.push(...kpBoundSays_(w, nm, 'mail', 'the handle box'), ...kpBoundSays_(w, pin, 'num', 'the PIN box'));
  if (!nm || !pin) return bad;
  if (pin.getAttribute('autocomplete') !== 'one-time-code') bad.push('the PIN box lost its autocomplete="one-time-code"');
  kpTap_(w, nm);
  const pad = kpPadOf_(w);
  if (!pad || pad.hidden || pad.getAttribute('data-layer') !== 'abc' || !pad.querySelector('.kp-key[data-v="@"]')) bad.push('the handle box did not open the pad on its letters with @ on top');
  kpTypeOn_(w, 'ada_kind7', bad);
  if (nm.value !== 'ada_kind7') bad.push('the pad typed ' + JSON.stringify(nm.value) + ' as the handle');
  kpTap_(w, pin);
  if (pad.hidden || pad.getAttribute('data-layer') !== 'maths') bad.push('the PIN box did not open the pad on its digits');
  kpTypeOn_(w, '482611119', bad);
  if (pin.value !== '48261111') bad.push('the PIN box holds ' + JSON.stringify(pin.value) + ' — the pad did not keep to its eight digits');
  await wait(700);
  if (/4826/.test(String((d.getElementById('kp-say') || {}).textContent || ''))) bad.push('the PIN was read out by the pad\'s screen-reader line');
  A['kp-key'](pad.querySelector('.kp-key.kp-done'));
  await wait(300);
  if (!sent.some(b => b.action === 'verifyLogin')) bad.push('✓ on the PIN box did not sign in — it is the field\'s Enter');
  if (!pad.hidden) bad.push('✓ on the PIN box left the pad up');
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
  press('!done');
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
    A['kp-key'](key_('!done'));
    const mark = h.querySelector('.qp-mark');
    if (!mark || !mark.classList.contains('is-right')) bad.push(JSON.stringify(inp.value) + ' typed with the power key was not marked right against ' + JSON.stringify(accept) + ': ' + (mark ? mark.textContent.trim().slice(0, 120) : 'no mark'));
    h.remove();
  };
  await run('q-pow-1', '3x^2', ['3', 'x', '!pow', '2'], '3x^(2)');
  await run('q-pow-2', 'x^(n+1)', ['x', '!pow', '!abc', 'n', '!123', '+', '1'], 'x^(n+1)');
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
  const mark = card.querySelector('.qp-mark');
  if (!mark || !mark.classList.contains('is-right')) bad.push('✓ on "Egestion" against egestion was not marked right: ' + (mark ? mark.className + ' / ' + mark.textContent.trim() : 'no mark row'));
  if (!pad.hidden) bad.push('✓ left the pad up');
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
  press('x'); press('<'); press('3'); press('!done');
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
  press('!done');
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

/* ---------- MARK WITH AI: OFFERED WHERE IT CAN BE RIGHT, AND QUIET WHERE IT CANNOT § */
check('Mark with AI sends a worded answer by person id, draws marks and a sentence, and greys when there is no key', async () => {
  const bad = [];
  const withAi = Object.assign(payload(), { features: ['aiMark'], aiMarking: true });
  let mode = 'mark';
  const { w, sent, errs } = boot({ payload: withAi, reply: b => {
    if (b.action !== 'aiMark') return null;
    return mode === 'off' ? { success: false, why: 'ai-off', message: 'AI marking isn’t switched on.' }
      : { success: true, awarded: 2, available: 3, feedback: 'You named faster particles but not the activation energy.', left: 19 };
  } });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS;
  if (!A['qp-ai']) return ['"Mark with AI" has no handler'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = { kind: 'question', key: 'q-ai-1', name: 'Q2', marks: 3, answerType: 'explain', accept: '',
    row: { row_id: 'Q-AI-2', paper_id: 'P-AI', subject: 'Chemistry', name: 'Rates' },
    html: '<p>Explain why the rate of reaction increases with temperature.</p>',
    answer: 'Particles move faster &mdash; more frequent collisions; more have the activation energy.' };
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const draw = it => { const h = d.createElement('div'); h.innerHTML = w.findCard(it, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const card = draw(x);
  const go = card.querySelector('.qp-ai-go[data-do="qp-ai"]');
  if (!go) return ['a worded question with a scheme and a deployment that has aiMark drew no "Mark with AI"'];
  /* IN THE CHAT BAR, WHERE SEND IS on a box with a scheme: the same gold tile beside the field, with its
     verdict line and its sentence under the bar (`ansBox_`, `aiOpts_`). */
  if (!go.matches('.qcard > .kc-act > .qt-row > .kc-four > .tile:not(.is-send)')) bad.push('"Mark with AI" is not an ordinary tile in the answer bar: ' + go.outerHTML.slice(0, 120));
  if (!card.querySelector('.qp-mark.qp-ai > .qp-verdict') || !(card.querySelector('.qp-mark.qp-ai').nextElementSibling || { classList: { contains: () => false } }).classList.contains('qp-ai-why')) bad.push('the AI\'s verdict line and sentence are not under the bar where the handler looks for them');
  const ta = card.querySelector('textarea.qp-ans-in');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [x];
  try {
    A['qp-ai'](go);
    if (!/Write something first/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('an empty box was sent to be marked');
    if (sent.some(s => s.action === 'aiMark')) bad.push('an empty box reached the server');
    ta.value = 'The particles have more energy so they collide more often.';
    ta.dispatchEvent(new w.Event('input', { bubbles: true }));
    A['qp-ai'](go);
    await wait(50);
  } finally { w.stuffItemsAll_ = held; }
  const s = sent.find(b => b.action === 'aiMark');
  if (!s) bad.push('pressing "Mark with AI" sent nothing');
  else {
    if (s.personId !== 'P-S1') bad.push('aiMark was sent personId ' + JSON.stringify(s.personId) + ' — a person is named by id, never by a cell they can edit');
    if (s.marks !== 3) bad.push('aiMark was sent marks ' + s.marks + ', wanted the question’s 3');
    if (!/rate of reaction/.test(s.question || '')) bad.push('the question’s words were not sent: ' + JSON.stringify(s.question));
    if (!/activation energy/.test(s.scheme || '') || /&mdash;|<b>/.test(s.scheme || '')) bad.push('the scheme was not sent as plain words: ' + JSON.stringify(s.scheme));
    if (s.answer !== ta.value) bad.push('the answer sent was not the one in the box');
  }
  const row = card.querySelector('.qp-ai');
  const verdict = row.querySelector('.qp-verdict').textContent;
  if (!/2 of 3 marks/.test(verdict) || !row.classList.contains('is-near')) bad.push('two of three marks was drawn as "' + verdict + '" / ' + row.className);
  const why = card.querySelector('.qp-ai-why');
  if (!why || !/activation energy/.test(why.textContent)) bad.push('the AI’s sentence was not drawn under the row');
  ta.value += ' Also more successful collisions.';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (row.querySelector('.qp-verdict').textContent || row.classList.contains('is-near') || (why && why.textContent)) bad.push('typing after an AI mark left the old verdict on a changed answer');
  /* NO KEY ON THE SERVER: § */
  mode = 'off';
  const other = draw(Object.assign({}, x, { key: 'q-ai-2', row: Object.assign({}, x.row, { row_id: 'Q-AI-3' }) }));
  w.stuffItemsAll_ = () => [x];
  try { A['qp-ai'](go); await wait(50); } finally { w.stuffItemsAll_ = held; }
  [card, other].forEach((c, i) => {
    const b = c.querySelector('.qp-ai-go');
    if ((b && !b.disabled) || !c.querySelector('.qp-ai.is-off')) bad.push('after "ai-off" the ' + (i ? 'other card’s' : 'pressed') + ' AI button still presses');
    if (c.querySelector('.qp-ai [data-do="qp-send"]')) bad.push('after "ai-off" the ' + (i ? 'other card’s' : 'pressed') + ' box put a Send in the AI tile’s place — a human never marks');
  });
  if (!/switched on/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('"ai-off" did not say AI marking isn’t switched on');
  /* ROUND 3: the AI is this part's marker, so its Check stays in the row, unpressable -- never gone, never a plain Send */
  const g4 = draw(Object.assign({}, x, { key: 'q-ai-4' })).querySelector('.qt-row .qp-ai-go');
  if (!g4 || !g4.disabled) bad.push('a card drawn after "ai-off" has no AI Check in its row, or one that still presses');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  /* AND UNPRESSABLE where the payload says there is no key, or the deployment has no action -- with no plain Send in its place (round 3). */
  for (const [why2, p] of [['aiMarking: false', { features: ['aiMark'], aiMarking: false }], ['no aiMark in features', { features: [] }]]) {
    const b2 = boot({ payload: Object.assign(payload(), p) });
    await wait(300);
    const h = b2.w.document.createElement('div');
    h.innerHTML = b2.w.findCard(Object.assign({}, x, { key: 'q-ai-5' }), 0);
    const g5 = h.querySelector('.qt-row .qp-ai-go');
    if (!g5 || !g5.disabled || h.querySelector('[data-do="qp-send"]')) bad.push('with ' + why2 + ' the card drew ' + (g5 ? 'a Check that presses' : 'no AI Check') + (h.querySelector('[data-do="qp-send"]') ? ' and a plain Send' : ''));
  }
  return bad;
});

/* ---------- A PHOTO OF THE WORKING (501): the tile only where working is asked, the photos sent with the question, and only the AI marks ---------- */
check('Photo of my working: shown only on working questions, sends its photos to markWorking, and a mark that cannot happen keeps them for later', async () => {
  const bad = [];
  let mode = 'mark';
  const { w, sent, errs } = boot({ payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }), reply: b => {
    if (b.action !== 'markWorking') return null;
    return mode === 'off' ? { success: false, why: 'ai-off', message: 'Marking isn’t available right now — your photos are still here, so tap Mark my working again later.' }
      : { success: true, ai: true, saved: true, awarded: 2, available: 3, feedback: 'The expansion is right; the conclusion line is missing.' };
  } });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS;
  if (!A['qp-work'] || !A['qp-work-send'] || !A['qp-work-x']) return ['the photo tiles have no handlers'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const proof = { kind: 'question', key: 'q-wk-1', name: 'Q5', marks: 3, answerType: 'proof', accept: '',
    row: { row_id: 'Q-WK-1', paper_id: 'P-WK', subject: 'Maths', name: 'Algebra' },
    html: '<p>Show that (x + 1)<sup>2</sup> = x<sup>2</sup> + 2x + 1</p>', answer: 'Expands (1); collects (1); conclusion (1)' };
  const plain = { kind: 'question', key: 'q-wk-2', name: 'Q1', marks: 1, answerType: 'number', accept: '7',
    row: { row_id: 'Q-WK-2', paper_id: 'P-WK', subject: 'Maths', name: 'Number' }, html: '<p>Work out 3 + 4</p>', answer: '7' };
  const draw = it => { const h = d.createElement('div'); h.innerHTML = w.findCard(it, 0); d.body.appendChild(h); return h.querySelector('.qcard'); };
  const card = draw(proof), other = draw(plain);
  const tile = card.querySelector('.tile[data-do="qp-work"]');
  if (!tile) bad.push('a "show that" proof drew no Photo of my working tile');
  else if (!tile.closest('.qt-row')) bad.push('the photo tile is not in the question’s tool row');
  if (!other.querySelector('.qt-row [data-do="qp-work"]')) bad.push('a plain sum has no photo of its working -- every part has every tool (round 3)');
  /* TWO PAGES ADDED (the phone's shrink is a canvas; here the pictures arrive already small) */
  const k = w.__t.ansKey(proof);
  w.workPics_(k).push({ url: 'data:image/jpeg;base64,AAAA' }, { url: 'data:image/jpeg;base64,BBBB' });
  w.workPaint_(k);
  const strip = card.querySelector('.qp-work');
  if (!strip || strip.hidden || strip.querySelectorAll('.qp-work-pic img').length !== 2) bad.push('two photos were not drawn as thumbnails under the box');
  const x1 = strip && strip.querySelector('[data-do="qp-work-x"]');
  if (x1) { w.workPics_(k).push({ url: 'data:image/jpeg;base64,CCCC' }); w.workPaint_(k); A['qp-work-x'](card.querySelector('[data-do="qp-work-x"]')); }
  if (w.workPics_(k).length !== 2) bad.push('remove did not take one page away');
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [proof];
  try { A['qp-work-send'](card.querySelector('[data-do="qp-work-send"]')); await wait(50); } finally { w.stuffItemsAll_ = held; }
  const s = sent.find(b => b.action === 'markWorking');
  if (!s) bad.push('Mark my working sent nothing');
  else {
    if (!Array.isArray(s.photos) || s.photos.length !== 2 || !/^data:image\/jpeg;base64,/.test(s.photos[0])) bad.push('the photos were not sent as JPEG data: ' + JSON.stringify(s.photos));
    if (!/Show that/.test(s.question || '') || !/conclusion/.test(s.scheme || '') || s.personId !== 'P-S1' || s.marks !== 3) bad.push('markWorking lacked the question, scheme, person or marks: ' + JSON.stringify(s).slice(0, 200));
  }
  if (!/2 of 3 marks/.test(card.querySelector('.qp-work-say').textContent)) bad.push('the AI’s mark was not drawn: ' + card.querySelector('.qp-work-say').textContent);
  /* NO AI: SAID PLAINLY, PHOTOS KEPT, NOTHING FOR A PERSON */
  mode = 'off';
  w.stuffItemsAll_ = () => [proof];
  try { A['qp-work-send'](card.querySelector('[data-do="qp-work-send"]')); await wait(50); } finally { w.stuffItemsAll_ = held; }
  const said = card.querySelector('.qp-work-say').textContent;
  if (!/isn’t available right now/.test(said)) bad.push('with no AI the student was not told marking is unavailable: ' + said);
  if (/tutor|by hand/i.test(card.querySelector('.qp-work').textContent)) bad.push('the photo strip speaks of a person marking: ' + card.querySelector('.qp-work').textContent.slice(0, 120));
  if (w.workPics_(k).length !== 2 || !card.querySelector('[data-do="qp-work-send"]')) bad.push('a mark that could not happen lost the photos or the way to try again');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- MARK WITH AI SAYS WHERE IT IS (456): "it just says marking ... we didn't feel blind" § */
check('Mark with AI shows one ring (the tile\'s), its stages and the seconds beside it, says when it is slow, and offers Try again on a failure', async () => {
  const bad = [];
  let release = null, mode = 'slow';
  const { w, sent, errs } = boot({ payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: true }), reply: b => {
    if (b.action !== 'aiMark') return null;
    if (mode === 'fail') return { success: false, message: 'Marking is busy right now — try again in a minute.' };
    return new Promise(ok => { release = () => ok({ success: true, awarded: 1, available: 2, feedback: 'Half there.', left: 9 }); });
  } });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS;
  if (!A['qp-ai'] || !A['qp-ai-again']) return ['Mark with AI or its Try again has no handler'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = { kind: 'question', key: 'q-ai-stage', name: 'Q1', marks: 2, answerType: 'explain', accept: '',
    row: { row_id: 'Q-AI-ST', paper_id: 'P-AI', subject: 'Chemistry', name: 'Rates' },
    html: '<p>Explain why a catalyst speeds up a reaction.</p>', answer: 'It lowers the activation energy.' };
  try { w.localStorage.removeItem(w.__t.ansKey(x)); } catch (e) {}
  const h = d.createElement('div'); h.innerHTML = w.findCard(x, 0); d.body.appendChild(h);
  const card = h.querySelector('.qcard'), go = card.querySelector('.qp-ai-go');
  const ta = card.querySelector('textarea.qp-ans-in');
  if (!go || !ta) return ['no Mark with AI tile or box was drawn'];
  ta.value = 'It gives another route with a lower activation energy.';
  ta.dispatchEvent(new w.Event('input', { bubbles: true }));
  const realNow = w.Date.now.bind(w.Date), base = realNow();
  let off = 0;
  w.Date.now = () => base + off;
  const say = () => { const s = card.querySelector('.qp-ai .qp-ai-stage-say'); return s ? s.textContent : ''; };
  const held = w.stuffItemsAll_;
  w.stuffItemsAll_ = () => [x];
  try {
    A['qp-ai'](go);
    const line = card.querySelector('.qp-ai > .qp-ai-stage');
    if (!line || !line.querySelector('.qp-ai-stage-say')) bad.push('the wait has no stage line with its words in it');
    /* ONE WAIT PER PRESS (owner, 12 Nov): the pressed tile's ring, and no second ring anywhere in the card. */
    const rings = card.querySelectorAll('.loading, .tile.is-busy, .tile[aria-busy="true"], .btn.is-busy').length;
    if (rings !== 1) bad.push('during the press the card shows ' + rings + ' rings — wanted the pressed tile\'s one');
    if (!go.classList.contains('is-busy')) bad.push('the pressed Mark with AI tile is not the one waiting');
    if (!/^Sending your work…$/.test(say())) bad.push('the first stage said "' + say() + '" — wanted "Sending your work…"');
    off = 7000; await wait(650);
    if (!/^Marking against the scheme… · 7 s$/.test(say())) bad.push('after 7 s the line said "' + say() + '" — wanted "Marking against the scheme… · 7 s"');
    off = 23000; await wait(650);
    if (!/^Still working — this one is taking longer than usual · 23 s$/.test(say())) bad.push('after 23 s the line said "' + say() + '" — wanted the slow sentence and 23 s');
    release(); await wait(50);
    if (card.querySelector('.qp-ai-stage')) bad.push('a mark that arrived left the stage line behind');
    if (!/1 of 2 marks/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('the mark after a slow wait was not drawn');
    /* A FAILURE: its reason on the verdict line and a Try again tile, which asks again. */
    mode = 'fail';
    A['qp-ai'](go); await wait(50);
    const again = card.querySelector('.qp-ai-stage [data-do="qp-ai-again"]');
    if (!/busy right now/.test(card.querySelector('.qp-ai .qp-verdict').textContent)) bad.push('a failed mark did not say why');
    if (!again || card.querySelector('.qp-ai-stage .loading')) bad.push('a failed mark has no Try again tile, or still shows the dots');
    const n = sent.filter(b => b.action === 'aiMark').length;
    mode = 'slow';
    if (again) A['qp-ai-again'](again);
    if (sent.filter(b => b.action === 'aiMark').length !== n + 1) bad.push('Try again did not send the answer again');
    if (!/^Sending your work…$/.test(say().replace(/ · \d+ s$/, ''))) bad.push('Try again did not show the stages again: "' + say() + '"');
    if (release) release(); await wait(50);
  } finally { w.stuffItemsAll_ = held; w.Date.now = realNow; }
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

/* ---------- AN ESSAY IS WRITTEN ON A SHEET, IN PARAGRAPHS, AND MARKED WHOLE § */
check('an essay is a sheet: the pad\'s return and a laptop\'s Enter make paragraphs, the words are counted, and Mark with AI sends all of it', async () => {
  const ID = 'Q-R0398-5';
  const LIB = LIB_FULL.rows('questions');
  const row = LIB.find(r => r.row_id === ID);
  if (!row) return [ID + ' is not in data/questions.json — no essay was written'];
  const paper = LIB.filter(r => r.paper_id === row.paper_id);
  const FEEDBACK = 'Content and organisation: 16 of 24 (Level 3) · Technical accuracy: 11 of 16 (Level 3)\n• Vary how your sentences open.\n• Use one semi-colon.';
  const withAi = Object.assign(payload(), { features: ['aiMark', 'aiMarkWhole'], aiMarking: true });
  const { w, sent, errs } = boot({ payload: withAi,
    reply: b => (b.action === 'aiMark' ? { success: true, awarded: 27, available: 40, feedback: FEEDBACK, left: 19 } : null),
    serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
  await wait(300);
  const d = w.document, A = w.__t.ACTIONS, bad = [];
  const need = ['ansEssay_', 'findCard', 'stuffItemsAll_', 'kpWordCount_'].filter(n => typeof w[n] !== 'function');
  if (need.length || !A['kp-key'] || !A['qp-ai']) return [need.join(', ') + ' or the keypad / Mark with AI not reachable — no essay was written'];
  w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
  const x = w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
  if (!x) return ['the real ' + ID + ' did not come through the loader into Find — no essay was written'];
  if (!w.ansEssay_(x)) bad.push(ID + ' (' + x.answerType + ', ' + x.marks + ' marks) is not an essay to `ansEssay_`');
  /* THE RULE'S EDGES: a one-mark `written` is a phrase, a three-mark `explain` a sentence or two. */
  const shortOf = (t, m) => ({ kind: 'question', answerType: t, marks: m, accept: '', choices: [] });
  if (w.ansEssay_(shortOf('written', 1)) || w.ansEssay_(shortOf('explain', 3)) || !w.ansEssay_(shortOf('explain', 8)) || w.ansEssay_(shortOf('calculation', 6))) {
    bad.push('`ansEssay_` does not draw its line at written/explain worth 6 or more');
  }
  /* AND NEVER MATHS: a six-mark "show that" is working, and `essay` is what asks Gemini to judge writing. */
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
  const go = card.querySelector(':scope > .kc-act > .qt-row > .kc-four > .tile.qp-ai-go[data-do="qp-ai"]:first-child');
  if (!go) bad.push('Mark with AI is not a tile in the row under the sheet');
  /* ONE CHECK (368): the AI's tile is the same Check as every other question's, with no caption of its own */
  if (card.querySelector('.qp-ai-say')) bad.push('the essay still captions its Check "Mark with AI"');
  if (go && go.getAttribute('aria-label') !== 'Check') bad.push('the essay\u2019s marking tile is ' + JSON.stringify(go.getAttribute('aria-label')) + ', not the Check every question has');
  const blank = () => !!card.querySelector('.qp-sheet > .kp-field.kp-essay.is-blank');
  if (!blank()) bad.push('an empty sheet is not marked is-blank, so it shows no "press return" hint');
  const words = () => (card.querySelector('.qp-essay .qp-words') || {}).textContent;
  if (words() !== '0 words') bad.push('an empty sheet\'s count says ' + JSON.stringify(words()) + ', wanted "0 words"');
  const mark = card.querySelector('.qp-mark.qp-ai.qp-essay');
  if (!mark || !mark.querySelector(':scope > .qp-verdict') || !mark.querySelector(':scope > .qp-saved')
      || !(mark.nextElementSibling && mark.nextElementSibling.classList.contains('qp-ai-why'))) {
    bad.push('the verdict line, the saved line and the AI\'s points are not where `qp-ai` looks for them');
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
    if (!space || !/span 18/.test(space.getAttribute('style') || '')) bad.push('the essay\'s space bar is not 18 columns, the room left beside return and done (562)');
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
  /* ---------- MARK WITH AI SENDS ALL OF IT ---------- */
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
  A['qp-ai'](card.querySelector('.qp-ai-go'));
  await wait(50);
  const s = sent.filter(b => b.action === 'aiMark').pop();
  if (!s) bad.push('Mark with AI sent nothing');
  else {
    if (s.answer !== big) bad.push('Mark with AI sent ' + String(s.answer || '').length + ' of the essay\'s ' + big.length + ' characters' + (/THE LAST WORDS/.test(s.answer || '') ? '' : ' — its last words never left the phone'));
    if (s.essay !== true) bad.push('the essay was not sent as an essay (essay: ' + JSON.stringify(s.essay) + '), so it is marked as a short answer');
    if (s.marks !== 40) bad.push('the essay was sent out of ' + s.marks + ', wanted 40');
    if (!/two people/i.test(s.question || '') || !/content and organisation/i.test(s.scheme || '')) bad.push('the question or the levelled scheme did not go with it');
  }
  const verdict = (card.querySelector('.qp-ai .qp-verdict') || {}).textContent || '';
  const why = card.querySelector('.qp-ai-why');
  if (!/27 of 40 marks/.test(verdict)) bad.push('27 of 40 was drawn as ' + JSON.stringify(verdict));
  if (!why || why.textContent !== FEEDBACK) bad.push('the AI\'s strands and points were not drawn as the lines they are: ' + JSON.stringify(why && why.textContent));
  /* ---------- AND THE MARK IS A SUBMISSION, like every Mark with AI (note 308) § */
  let latest = null;
  try { latest = (JSON.parse(w.localStorage.getItem('subLast:u:P-S1') || '{}') || {})[x.key]; } catch (e) {}
  if (!latest || latest.v !== 'ai:27/40' || latest.a !== big) bad.push('the essay’s Mark with AI was not recorded as a submission (ai:27/40, the whole essay): ' + JSON.stringify(latest && { v: latest.v, len: String(latest.a || '').length }));
  else if (latest.far || !latest.q) bad.push('the essay’s submission (' + big.length + ' characters) is kept as too long to send — the account takes 20,000 since note 312 (`SUB_ANSWER_MAX`)');
  /* ---------- A KEY TYPED AFTER THE MARK KEEPS IT, SAID TO BE STALE § */
  const aiBox = card.querySelector('.qp-ai.qp-essay');
  if (!aiBox || !aiBox.classList.contains('is-near')) bad.push('27 of 40 is not drawn as a near mark');
  inp.focus();
  inp.setSelectionRange(big.length, big.length);
  press('!nl');
  const v2 = (card.querySelector('.qp-ai .qp-verdict') || {}).textContent || '';
  if (v2 !== '27 of 40 marks \u00b7 AI \u00b7 before your changes' || !aiBox.classList.contains('is-stale') || aiBox.classList.contains('is-near')) bad.push('a return typed after the mark drew ' + JSON.stringify(v2) + ' (' + aiBox.className + ') — wanted the mark kept and said to be "before your changes", its colour off');
  if (!why || why.textContent !== FEEDBACK) bad.push('a return typed after the mark took the AI\'s points away: ' + JSON.stringify(why && why.textContent));
  press('!back');
  if ((card.querySelector('.qp-ai .qp-verdict') || {}).textContent !== '27 of 40 marks \u00b7 AI' || !aiBox.classList.contains('is-near') || aiBox.classList.contains('is-stale')) bad.push('back to the marked text, the mark is still said to be stale');
  press('!nl');
  inp.blur();
  await wait(10);
  /* ---------- AND IT IS DRAWN AGAIN: THE CARD REDRAWN, AND A WINDOW THAT NEVER SAW THE REPLY ---------- */
  card = draw(x);
  const redrawn = card.querySelector('.qp-ai.qp-essay');
  if (!redrawn || !redrawn.classList.contains('is-stale') || !/before your changes/.test((redrawn.querySelector('.qp-verdict') || {}).textContent || '')
      || (card.querySelector('.qp-ai-why') || {}).textContent !== FEEDBACK) bad.push('the card drawn again lost the kept mark: ' + JSON.stringify(redrawn && redrawn.outerHTML.slice(-300)));
  /* ---------- THE ACCOUNT'S COPY ARRIVING FROM ANOTHER DEVICE SAYS IT AGAIN, AND NEVER BLANKS IT § */
  if (redrawn && typeof w.ansRefresh_ === 'function') {
    const said = () => ({ v: (redrawn.querySelector('.qp-verdict') || {}).textContent || '', cls: ' ' + redrawn.className + ' ',
                          why: (card.querySelector('.qp-ai-why') || {}).textContent });
    try { w.localStorage.setItem(k, big); } catch (e) {}
    w.ansRefresh_([k]);
    let r = said();
    if (r.v !== '27 of 40 marks · AI' || r.cls.indexOf(' is-near ') < 0 || r.cls.indexOf(' is-stale ') >= 0 || r.why !== FEEDBACK) bad.push('the marked text arriving from the account drew ' + JSON.stringify(r) + ' — wanted the mark fresh again, its points kept');
    try { w.localStorage.setItem(k, big + ' And then the sea.'); } catch (e) {}
    w.ansRefresh_([k]);
    r = said();
    if (r.v !== '27 of 40 marks · AI · before your changes' || r.cls.indexOf(' is-stale ') < 0 || r.cls.indexOf(' is-near ') >= 0 || r.why !== FEEDBACK) bad.push('other text arriving from the account drew ' + JSON.stringify(r) + ' — wanted the mark kept and said to be "before your changes", its points under it');
  } else bad.push('ansRefresh_ is not reachable — the account\'s copy over a kept mark was NOT checked');
  /* KEPT IN THE PART'S ONE RECORD (round 3), field `ai`; the reload below starts from the OLD `aiMark:` key, so it proves the one-time move */
  const pk = k.replace(/^ans:/, 'part:');
  let keptRec = null;
  try { const r = JSON.parse(w.localStorage.getItem(pk) || 'null'); keptRec = r && r.ai ? JSON.stringify(r.ai) : null; } catch (e) {}
  if (!keptRec) bad.push('the essay\'s mark was not kept in the part\'s record (' + pk + ')');
  try { if (w.localStorage.getItem('aiMark:' + k) !== null) bad.push('a new mark was still written to the old aiMark: key beside the part\'s record'); } catch (e) {}
  if (keptRec) {
    const b3 = boot({ payload: Object.assign(payload(), { features: ['aiMark', 'aiMarkWhole'], aiMarking: true }),
      before: w3 => { try { w3.localStorage.setItem('aiMark:' + k, keptRec); w3.localStorage.setItem(k, big); } catch (e) {} },
      serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
    await wait(300);
    b3.w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
    const x3 = b3.w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
    const h3 = b3.w.document.createElement('div');
    b3.w.document.body.appendChild(h3);
    h3.innerHTML = x3 ? b3.w.findCard(x3, 0) : '';
    const fresh3 = h3.querySelector('.qp-ai.qp-essay');
    if (!fresh3 || (fresh3.querySelector('.qp-verdict') || {}).textContent !== '27 of 40 marks \u00b7 AI' || !fresh3.classList.contains('is-near')
        || (h3.querySelector('.qp-ai-why') || {}).textContent !== FEEDBACK) bad.push('after a reload the essay\'s mark and points are gone: ' + JSON.stringify(fresh3 && fresh3.outerHTML.slice(-300)));
    if (b3.sent.some(b => b.action === 'aiMark')) bad.push('a reload asked Gemini again to show a mark it already had');
    let moved = null, left = 'x';
    try { moved = JSON.parse(b3.w.localStorage.getItem(pk) || 'null'); left = b3.w.localStorage.getItem('aiMark:' + k); } catch (e) {}
    if (!moved || !moved.ai || moved.ai.v !== '27 of 40 marks \u00b7 AI' || left !== null) bad.push('the old aiMark: key was not moved into the part\'s record once: record ' + JSON.stringify(moved) + ', old key ' + JSON.stringify(left));
  }
  try { w.localStorage.removeItem('aiMark:' + k); w.localStorage.removeItem(pk); } catch (e) {}
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
  /* ---------- AI MARKING OFF: ONE LINE TO A PUPIL, NOTHING TO A STRANGER, THE CHECK UNPRESSABLE IN ITS PLACE (round 3) ---------- */
  for (const signedIn of [true, false]) {
    const b2 = boot({ payload: Object.assign(payload(), { features: ['aiMark'], aiMarking: false }),
      serve: url => (/data\/questions\.json/.test(url) ? paper : undefined) });
    await wait(300);
    if (signedIn) b2.w.__t.USER({ name: 'Sam Student', personId: 'P-S1', token: 'tok-1', role: 'student' });
    const x2 = b2.w.stuffItemsAll_().find(it => it.row && it.row.row_id === ID);
    if (!x2) { bad.push('the essay did not load with AI marking off'); continue; }
    const h2 = b2.w.document.createElement('div');
    h2.innerHTML = b2.w.findCard(x2, 0);
    const note = h2.querySelector('.qp-essay .qp-ai-note');
    const g2 = h2.querySelector('.qcard > .kc-act > .qt-row .qp-ai-go');
    if (!g2 || !g2.disabled || h2.querySelector('[data-do="qp-send"]')) bad.push('with AI marking off the essay\'s Check is missing, still presses, or became a plain Send');
    if (!h2.querySelector('.qp-sheet .kp-in') || !h2.querySelector('.qp-words')) bad.push('with AI marking off the essay lost its sheet or its count');
    if (signedIn && !(note && /isn.t switched on/.test(note.textContent))) bad.push('with AI marking off a signed-in pupil is told nothing about why the Check does not press');
    if (!signedIn && note) bad.push('a stranger browsing is told about AI marking: ' + note.textContent);
  }
  return bad;
});

