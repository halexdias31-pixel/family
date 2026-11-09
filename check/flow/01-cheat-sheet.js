
check('the app loads and draws without throwing', async () => {
  const { w, errs } = boot();
  await wait(300);
  const bad = [];
  if (errs.length) bad.push('errors at load: ' + errs.join(' | '));
  if (!w.__t) return ['nothing was exported — the app did not finish loading' + (errs.length ? ': ' + errs.join(' | ') : '')];
  if (typeof w.__t.go !== 'function') bad.push('go() is not a function');
  return bad;
});

/* ---------- THE REELS' SOUND IS A TILE, READ THE THREE WAYS IT SAYS ITS STATE § */
const SVG_NS_ = 'http://www.w3.org/2000/svg';
/* EVERY SHAPE IN A MARK AS ONE LINE — its tag and its attributes, sorted — and the lines sorted, so
   two drawings are the same picture exactly when the two lists are equal, whatever order a hand wrote
   the attributes in. */
const markShapes_ = node => [...node.querySelectorAll('*')].map(n => n.localName + ' ' + [...n.attributes]
  .map(a => a.name + '="' + String(a.value).replace(/\s+/g, ' ').trim() + '"').sort().join(' ')).sort();
const iconShapes_ = (doc, name) => {
  const icons = ((doc.defaultView || {}).__t || {}).ICONS;
  if (!icons || typeof icons[name] !== 'string') return null;
  const s = doc.createElementNS(SVG_NS_, 'svg');
  s.innerHTML = icons[name];
  return markShapes_(s);
};
/* ONCE PER WINDOW: a pair drawn wrong is one fault, not one per press. */
const PAIR_ASKED_ = new WeakSet();
const soundPairSays_ = doc => {
  if (PAIR_ASKED_.has(doc)) return [];
  PAIR_ASKED_.add(doc);
  const on = iconShapes_(doc, 'sound'), off = iconShapes_(doc, 'mute');
  if (!on || !off) return ['TILE_ICONS has no ' + [!on && 'sound', !off && 'mute'].filter(Boolean).join(' and no ')
                           + ' — a sound switch needs both marks (or `__t.ICONS` is not handed over)'];
  const only = (a, b) => a.filter(x => b.indexOf(x) === -1);
  const bad = [];
  if (!only(off, on).length) bad.push('TILE_ICONS.mute draws nothing TILE_ICONS.sound does not — '
    + (only(on, off).length ? 'the waves taken away and no slash put in' : 'the muted mark is the same picture as the playing one')
    + ', so a silent clip and one playing aloud look alike');
  if (!only(on, off).length) bad.push('TILE_ICONS.sound draws nothing TILE_ICONS.mute does not — the playing mark has no waves of its own');
  if (!on.some(x => off.indexOf(x) !== -1)) bad.push('TILE_ICONS.sound and .mute share no shape — not one cone with what leaves it changed, two unrelated pictures to learn');
  return bad;
};
const switchTileSays_ = (el, on, where, o) => {
  if (!el) return ['there is no ' + o.what + ' control on ' + where];
  const bad = [];
  const want = on ? o.names[1] : o.names[0];
  const name = on ? 'sound' : 'mute';
  const mark = 'tile-i-' + name;
  if (el.tagName !== 'BUTTON' || !o.cls.every(c => el.classList.contains(c)))
    bad.push(`the ${o.what} control on ${where} is not ${o.kind} — <${el.tagName.toLowerCase()} class="${el.className}">`);
  if (el.dataset.do !== o.act) bad.push(`the ${o.what} tile on ${where} carries data-do="${el.dataset.do}", not its own ${o.act}`);
  if (el.getAttribute('aria-label') !== want || el.getAttribute('title') !== want)
    bad.push(`the ${o.what} tile on ${where} is named "${el.getAttribute('aria-label')}" / "${el.getAttribute('title')}", wanted "${want}"`);
  if (el.getAttribute('aria-pressed') !== String(on))
    bad.push(`the ${o.what} tile on ${where} says aria-pressed="${el.getAttribute('aria-pressed')}", wanted "${on}"`);
  if (o.lit && el.classList.contains('on') !== on)
    bad.push(`the ${o.what} tile on ${where} is ${el.classList.contains('on') ? '' : 'not '}lit (\`.on\`) while ${on ? 'on' : 'off'}`);
  const marks = [...el.querySelectorAll('svg.tile-i')];
  if (marks.length !== 1 || !marks[0].classList.contains(mark) || !marks[0].querySelector('path'))
    bad.push(`the ${o.what} tile on ${where} draws ${marks.map(m => m.getAttribute('class')).join(' + ') || 'no mark'}`
             + `, wanted the one ${mark} (TILE_ICONS needs both sound and mute)`);
  else {
    const doc = el.ownerDocument;
    soundPairSays_(doc).forEach(x => bad.push(x));
    const want_ = iconShapes_(doc, name), drawn = markShapes_(marks[0]);
    if (want_ && drawn.join('\n') !== want_.join('\n'))
      bad.push(`the ${o.what} tile on ${where} is classed ${mark} but draws another picture: [${drawn.join('; ')}], `
               + `where TILE_ICONS.${name} is [${want_.join('; ')}]`);
  }
  if (el.textContent.trim()) bad.push(`the ${o.what} tile on ${where} has words drawn on it: "${el.textContent.trim()}"`);
  return bad;
};
const soundTileSays_ = (el, on, where) => switchTileSays_(el, on, where, {
  what: 'Sound', kind: 'the over-picture tile', act: 'reel-sound', names: ['Sound off', 'Sound on'],
  cls: ['tile', 'is-over', 'reel-sound'] });
/* IMPOSTER'S READ ALOUD, THE SAME PAIR ON A CARD rather than a picture: the plate lit (`.on`) while it
   reads aloud, the switch-tile's way, and `.imp-aloud`, the name `check/states.js` finds it by. */
const readAloudSays_ = (el, on, where) => switchTileSays_(el, on, where, {
  what: 'Read aloud', kind: 'a tile', act: 'imp-aloud', names: ['Read aloud off', 'Read aloud on'],
  cls: ['tile', 'imp-aloud'], lit: true });

/* ---------- A <VIDEO> REEL'S SOUND, PRESSED WHERE A FINGER PRESSES IT § */
check('the reels\' Sound is a tile: one per reel, drawn muted, a press on its mark turns a <video> aloud and back through the dispatcher, the name, mark and aria-pressed follow, and it never pauses the clip', async () => {
  const { w } = boot();
  for (let k = 0; k < 80 && !w.__t; k++) await wait(100);
  const t = w.__t;
  if (!t) return ['the app did not finish loading'];
  const d = w.document;
  const bad = [];
  const at = () => ((typeof t.PAGE === 'function' ? t.PAGE() : t.PAGE) || {}).reel || 0;
  const turn = async n => { t.goPage('reel', n, true); await wait(LEAVE_MS); await woken_(); };
  t.go('reel', false, true);
  await wait(LEAVE_MS); await woken_();
  const host = d.querySelector('#s-reel');
  if (!host) return ['the Reels column did not draw'];
  const reels = [...host.querySelectorAll('.reel')];
  if (!reels.length) return ['the Reels column drew no reel to press'];
  reels.forEach(r => {
    const s = r.querySelectorAll('[data-do="reel-sound"]');
    if (s.length !== 1) bad.push('reel ' + r.dataset.reel + ' carries ' + s.length + ' Sound controls, not one');
    else soundTileSays_(s[0], false, 'reel ' + r.dataset.reel + ' as drawn').forEach(x => bad.push(x));
  });
  const btns = host.querySelectorAll('.reel .btn');
  if (btns.length) bad.push(btns.length + ' `.btn` still drawn on the reels: ' + btns[0].outerHTML.slice(0, 100));

  /* THE <VIDEO> REEL IN FRONT — turned to if the page in front is the Short. */
  let reel = reels.find(r => r.querySelector('video.feed-vid') && Number(r.dataset.reel) === at());
  if (!reel) {
    const next = reels.find(r => r.querySelector('video.feed-vid'));
    if (!next) return bad.concat(['no reel in the column is a <video> — this journey pressed nothing']);
    await turn(Number(next.dataset.reel));
    reel = host.querySelector('.reel[data-reel="' + next.dataset.reel + '"]');
  }
  const v = reel && reel.querySelector('video.feed-vid');
  if (!v) return bad.concat(['the <video> reel was not on its page after turning to it']);
  let paused = false, plays = 0;
  v.play = () => { plays++; paused = false; return Promise.resolve(); };
  v.pause = () => { paused = true; };
  Object.defineProperty(v, 'paused', { configurable: true, get: () => paused });
  v.muted = true;
  const snd = () => reel.querySelector('[data-do="reel-sound"]');
  /* A TAP ON THE MARK, which bubbles to the button and then to the slide's own `reel-tap` — the real
     dispatcher decides which of the two it is. */
  const press = () => {
    const el = snd();
    const target = (el && el.querySelector('svg')) || el;
    if (target) target.dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
  };

  /* AND THE PICTURE ITSELF CHANGES WITH EACH PRESS — the markup inside the mark, not its class name;
     review drew `mute` as `sound` and every class-name check passed (`soundTileSays_`). */
  const drawn = () => ((snd() && snd().querySelector('svg.tile-i')) || {}).innerHTML;
  const looked = [drawn()];
  plays = 0;
  press();
  looked.push(drawn());
  if (v.muted) bad.push('a press on the Sound tile\'s mark left the <video> muted');
  if (!plays) bad.push('turned aloud, the <video> was not asked to play — a clip refused a start would stay silent and still');
  if (paused || reel.classList.contains('is-held'))
    bad.push('a press on the Sound tile paused the clip — the tap reached reel-tap, not the tile\'s own reel-sound');
  soundTileSays_(snd(), true, 'a <video> reel turned aloud').forEach(x => bad.push(x));

  /* A PERSON'S SECOND PRESS, not a double tap's second half, which the dispatcher drops (534). */
  await wait(360);
  press();
  looked.push(drawn());
  if (looked[1] === looked[0]) bad.push('turning the <video> aloud left the same picture on the Sound tile');
  if (looked[2] === looked[1]) bad.push('turning the <video> back to silent left the same picture on the Sound tile');
  if (looked[2] !== looked[0]) bad.push('silent again, the Sound tile does not draw the picture it was drawn with');
  if (!v.muted) bad.push('a second press on the Sound tile left the <video> playing aloud');
  if (paused || reel.classList.contains('is-held'))
    bad.push('turning the sound off paused the clip — the tap reached reel-tap, not the tile\'s own reel-sound');
  soundTileSays_(snd(), false, 'a <video> reel turned back to silent').forEach(x => bad.push(x));

  /* AND THE SLIDE ITSELF IS STILL THE PAUSE — a tap beside the tile holds the clip, which is what makes
     the two presses above a test of which handler was nearest rather than of a slide that does nothing. */
  reel.querySelector('.feed-art').dispatchEvent(new w.MouseEvent('click', { bubbles: true, cancelable: true, detail: 1 }));
  if (!paused || !reel.classList.contains('is-held')) bad.push('a tap on the picture beside the Sound tile did not hold the clip');
  return bad;
});

/* ---------- THE UPGRADE HAS TO BE IN THE PRICE, AND HAS TO COME BACK OUT § */
check('laminating a basket line adds its price, and unlaminating takes it off', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.cartMoney || !t.setCart || !t.lamPrice) return ['the basket is not exported — cannot check it'];
  const bad = [];
  const line = { key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 };

  const lam = t.lamPrice(8);
  if (lam === null) {
    /* The fixture this runs against may not price laminating; that is a valid state and the one
       thing to check about it is that nothing is charged for it. */
    line.laminate = true;
    if (t.cartMoney(line) !== 0.16) {
      bad.push('with no rate in the sheet a laminated line costs ' + t.cartMoney(line)
             + ' instead of the plain 0.16 — an unpriced upgrade must be free of charge, '
             + 'not charged as NaN or zeroed over the print price');
    }
    return bad;
  }

  const plain = t.cartMoney(line);
  if (plain !== 0.16) bad.push('a plain line costs ' + plain + ', not its own 0.16');

  line.laminate = true;
  const on = t.cartMoney(line);
  if (on !== Math.round((0.16 + lam) * 100) / 100) {
    bad.push('laminated it costs ' + on + ' but print 0.16 + laminate ' + lam
           + ' is ' + (0.16 + lam) + ' — the upgrade is not reaching the line total');
  }

  line.laminate = false;
  const off = t.cartMoney(line);
  if (off !== plain) {
    bad.push('taking the laminate off leaves it at ' + off + ' rather than back at ' + plain
           + ' — the upgrade was added to the stored price instead of derived from the flag');
  }
  return bad;
});

check('the basket draws a laminate control on a paper and on nothing else', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.basket || !t.setCart || !t.lamPrice) return ['the basket is not exported — cannot check it'];
  if (t.lamPrice(8) === null) return [];        // not priced in this fixture; nothing to draw
  /* THE SHOP LINE CARRIES A PAGE COUNT ON PURPOSE, and that is the whole point of this journey. § */
  t.setCart([
    { key: 'T1', name: 'Quadratics', kind: 'print', cost: 0, money: 0.16, pages: 8 },
    { key: 'S1', name: 'Revision workbook', kind: 'shop', cost: 3, money: 0, pages: 64 },
  ]);
  const html = String(t.basket() || '');
  const bad = [];
  const n = (html.match(/data-do="cart-laminate"/g) || []).length;
  if (n !== 1) {
    bad.push('the basket drew ' + n + ' laminate controls for one paper and one shop item — '
           + 'a shop item is stock, not something printed here, and must not be offered one');
  }
  /* THE PRICE ON THE CONTROL, not just the word. "+ laminate" is a question somebody has to press
     to find the answer to. */
  if (!/cart-laminate[\s\S]{0,240}?[£\d]/.test(html)) {
    bad.push('the laminate control does not name its price, so pressing it is the only way to '
           + 'find out what it costs');
  }
  t.setCart([]);
  return bad;
});

/* ---------- EVERY COMPONENT IS PRICED AT THE SLOT IT IS DRAWN IN § */
check('the cheat sheet prices every component at the fixed slot it is drawn in', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matParts || !t.matColW || !t.matPairW || !t.matSpan || !t.matSpanW) {
    return ['the cheat sheet is not exported'];
  }
  const bad = [];
  const parts = t.matParts();
  /* NAMED, NOT COUNTED — these two were asked for by name, twice now. */
  ['M02', 'M03'].forEach(id => {
    const c = parts.find(x => x.id === id);
    if (!c) return;                 /* the sheet can hide a component; that is not this check's business */
    if (t.matSpan(c) !== 4) {
      bad.push(id + ' (' + c.name + ') is ' + t.matSpan(c) + ' tracks wide — it was made two thirds '
             + 'of the page (4 of 6) because it was asked for bigger');
    }
  });
  if (!parts.some(c => c.id === 'M50')) bad.push('the periodic table (M50) is not in the list');
  if (!parts.some(c => c.id === 'M51')) bad.push('the pH scale (M51) is not in the list');
  parts.filter(c => !c.edge).forEach(c => {
    const span = t.matSpan(c);
    if ([2, 4, 6].indexOf(span) === -1) bad.push(c.id + ' spans ' + span + ' tracks, not 2, 4 or 6');
    if (!(c.h > 0) || Math.abs(c.h / 2 - Math.round(c.h / 2)) > 1e-9) {
      bad.push(c.id + ' is ' + c.h + 'mm tall, which is not a whole number of 2mm rows');
    }
  });
  /* THE ARITHMETIC, not a remembered number: 184mm of text, six tracks, five 6mm gutters. */
  const track = (184 - 6 * 5) / 6;
  const want3 = 2 * track + 6, want23 = 4 * track + 18;
  if (Math.abs(t.matColW() - want3) > 0.01) {
    bad.push('a narrow block is priced at ' + t.matColW() + 'mm; two tracks and a gutter is ' + want3);
  }
  if (Math.abs(t.matPairW() - want23) > 0.01) {
    bad.push('a two-thirds block is priced at ' + t.matPairW() + 'mm; four tracks and three gutters is '
           + want23);
  }
  if (Math.abs(t.matSpanW(6) - 184) > 0.01) {
    bad.push('six tracks come to ' + t.matSpanW(6) + 'mm, not the 184mm text block');
  }
  return bad;
});

/* ---------- THE NEGATIVE NUMBER LINE, AND A PICKER LIST THAT IS NOT A SCROLLER § */
check('the cheat sheet has a negative number line, and its piece list does not scroll in the card', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matParts || !t.matDraw || !t.matSet || !t.matShown) return ['the cheat sheet is not exported'];
  const bad = [];
  const c = t.matParts().find(x => x.id === 'M52');
  if (!c) return ['there is no negative number line (M52) in the cheat sheet list'];
  if (t.matSpan(c) !== 6) bad.push('the negative number line is ' + t.matSpan(c) + ' tracks wide; a line is the full width');
  const d = w.document.createElement('div');
  d.innerHTML = t.matDraw(c);
  const labels = [...d.querySelectorAll('.mat-neg b')].map(b => b.textContent);
  const want = [];
  for (let n = -10; n <= 10; n++) want.push(n < 0 ? '−' + (-n) : String(n));
  if (labels.join(' ') !== want.join(' ')) bad.push('the line reads "' + labels.join(' ') + '", wanted −10 to 10 with a real minus');
  const zeros = [...d.querySelectorAll('.mat-neg b.z')].map(b => b.textContent);
  if (zeros.join() !== '0') bad.push('the line picks out ' + JSON.stringify(zeros) + ' where it should pick out 0 alone');
  if (d.querySelectorAll('.mat-neg i.z').length !== 1) bad.push('zero has no longer tick of its own');
  if (d.querySelectorAll('.mat-neg em.l, .mat-neg em.r').length !== 2) bad.push('the line has no arrow at each end');
  [['SATs'], ['11+'], ['Y9 Mocks'], ['GCSE', 'F'], ['GCSE', 'H']].forEach(([lv, tier]) => {
    t.matSet('Maths', lv, tier);
    if (!t.matShown(c)) bad.push('the negative number line is not offered on ' + lv + (tier ? ' ' + tier : ''));
  });
  t.matSet('Maths', 'Alevel');
  if (t.matShown(c)) bad.push('the negative number line is offered at A-level, which does not ask for it');
  t.matSet('Maths', 'all');

  try { t.findGroup('Tools'); } catch (e) { return bad.concat('go("tools") threw: ' + e.message); }
  const doc = w.document;
  for (let n = 0; n < 20 && !doc.getElementById('mat-list'); n++) await wait(50);
  const list = doc.getElementById('mat-list');
  if (!list) return bad.concat('the cheat sheet maker did not draw on the Tools column');
  const box = list.closest('#mat-box') || list.parentElement;
  if (list.classList.contains('widget-squeeze') || box.querySelector('.widget-squeeze')) {
    bad.push('the cheat sheet\'s piece list is a `.widget-squeeze` again, which makes it scroll inside the card');
  }
  return bad;
});

/* ---------- THE SUBJECT FILTER NARROWS THE LIST AND THE PAPER TO ONE SUBJECT § */
check('the cheat sheet offers only the pieces of the subject chosen', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matShown || !t.matSubjects || !t.matSubjectOf || !t.matLevelChoices || !t.matSet) {
    return ['the cheat sheet subject filter is not exported'];
  }
  const bad = [];
  const parts = t.matParts();
  const subs = t.matSubjects(parts);
  ['Maths', 'English', 'Science'].forEach(s => {
    if (subs.indexOf(s) === -1) bad.push('the subject select does not offer ' + s + ' — it offers ' + subs.join(', '));
  });
  if (subs[0] !== 'Maths') bad.push('Maths has the most pieces and is not first: ' + subs.join(', '));
  subs.forEach(s => {
    t.matSet(s, 'all');
    const shown = parts.filter(c => t.matShown(c));
    const stray = shown.filter(c => !c.edge && t.matSubjectOf(c) !== s);
    if (stray.length) {
      bad.push(s + ' shows ' + stray.length + ' piece(s) of another subject — '
             + stray.slice(0, 3).map(c => c.id + ' (' + t.matSubjectOf(c) + ')').join(', '));
    }
    if (!shown.some(c => !c.edge)) bad.push(s + ' is offered in the select and shows no piece at all');
    if (parts.some(c => c.edge) && !shown.some(c => c.edge)) {
      bad.push('the ruler is not offered under ' + s + ', and it goes down the edge of any sheet');
    }
  });
  t.matSet('all', 'all');
  const every = parts.filter(c => !c.edge && t.matShown(c)).map(c => t.matSubjectOf(c));
  subs.forEach(s => { if (every.indexOf(s) === -1) bad.push('"Every subject" leaves out ' + s); });

  t.matSet('English', 'all');
  const en = t.matLevelChoices(parts).map(o => o.v);
  if (en.some(v => v.indexOf('|') !== -1)) {
    bad.push('English offers a Foundation/Higher split and no English piece changes with the tier: '
           + en.join(', '));
  }
  t.matSet('Maths', 'all');
  const ma = t.matLevelChoices(parts).map(o => o.v);
  if (ma.indexOf('GCSE|F') === -1 || ma.indexOf('GCSE|H') === -1) {
    bad.push('Maths GCSE is not offered as Foundation and Higher: ' + ma.join(', '));
  }
  t.matSet('English', 'GCSE');
  parts.filter(c => !c.edge && t.matShown(c)).forEach(c => {
    if (c.lv.indexOf('GCSE') === -1) bad.push(c.id + ' is on an English GCSE sheet and is not a GCSE piece');
  });
  /* A PIECE OFFERED IS A PIECE THAT CAN BE DRAWN. § */
  parts.filter(c => !c.edge).forEach(c => {
    if (/mat-gone/.test(String(t.matDraw(c)))) bad.push(c.id + ' (' + c.name + ') has nothing to draw it');
  });
  t.matSet('Maths', 'all');
  return bad;
});

/* ---------- THE PIECES A TOPIC AT A TIME, AND NO VIEW LONGER THAN EIGHT ROWS § */
check('the cheat sheet lists a topic at a time, eight rows at most, and keeps ticks across topics', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matGroupOf || !t.matGroupChoices || !t.matInGroup || !t.matGroup) return ['the cheat sheet topic groups are not exported'];
  const bad = [];
  const parts = t.matParts();
  parts.filter(c => !c.edge && t.matGroupOf(c) === 'Other')
    .forEach(c => bad.push(c.id + ' (' + c.name + ') is in no topic group — add it to MAT_GROUPS'));
  const subs = t.matSubjects(parts).concat('all');
  let views = 0;
  subs.forEach(s => {
    t.matSet(s, 'all');
    t.matLevelChoices(parts).forEach(o => {
      const [l, tier] = o.v.split('|');
      t.matSet(s, l, tier);
      t.matGroupChoices(parts).forEach(g => {
        t.matGroup(g);
        views++;
        const rows = parts.filter(c => t.matShown(c) && t.matInGroup(c)).length;
        if (rows > 8) bad.push(s + ' · ' + o.say + ' · ' + g + ' lists ' + rows + ' rows; eight is what fits a 320x568 phone at 0.85');
        if (!parts.some(c => !c.edge && t.matShown(c) && t.matInGroup(c))) bad.push(s + ' · ' + o.say + ' offers ' + g + ' and lists nothing in it');
      });
    });
  });
  if (views < 50) bad.push('only ' + views + ' views were walked — the subject or level lists came back short');
  t.matSet('Maths', 'all');

  try { t.findGroup('Tools'); } catch (e) { return bad.concat('go("tools") threw: ' + e.message); }
  const doc = w.document;
  for (let n = 0; n < 20 && !doc.getElementById('mat-group'); n++) await wait(50);
  const grp = doc.getElementById('mat-group');
  if (!grp) return bad.concat('the cheat sheet maker draws no topic select');
  const pick = g => { grp.value = g; t.ACTIONS['mat-group'](grp); };
  const tickFirst = () => {
    const box = doc.querySelector('#mat-list label:not(.off):not([data-id="M01"]) input:not(:checked)');
    if (!box) return '';
    box.checked = true; t.ACTIONS['mat-tick'](box);
    return box.getAttribute('data-id');
  };
  t.matOn([]); t.matPaint();
  pick('Number');
  const a = tickFirst();
  pick('Algebra');
  const b = tickFirst();
  if (!a || !b) return bad.concat('could not tick a piece in Number and one in Algebra');
  const on = t.matOn();
  if (on.indexOf(a) === -1 || on.indexOf(b) === -1) bad.push('changing topic dropped a tick: ' + JSON.stringify(on) + ', wanted ' + a + ' and ' + b);
  const label = [...grp.options].find(o => o.value === 'Number');
  if (!label || !/1✓/.test(label.textContent)) bad.push('the Number option reads "' + (label && label.textContent) + '" — it should say 1✓ while Algebra is showing');
  if (doc.querySelector('#mat-list label[data-id="' + a + '"]:not(.off)')) bad.push(a + ' is still listed under Algebra');
  const said = String((doc.getElementById('mat-said') || {}).textContent || '');
  if (!/2 pieces/.test(said)) bad.push('the gauge says "' + said + '" — both ticks are on the paper whichever topic is showing');
  t.matOn([]); t.matPaint();
  return bad;
});

/* ---------- A STUDENT OPENS ON THEIR OWN LEVEL § */
check('the cheat sheet opens on the signed-in student\'s own level, and on every level for a stranger', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.matNow) return ['the cheat sheet opening state is not exported'];
  const bad = [];
  const open = async () => {
    t.matFresh();
    /* `repaint`, NOT `paint`: `go` starts a column's widgets after its 300ms slide and `repaint`
       starts them at once, and `initMat` — where the opening view is decided — is a widget start. */
    try { t.findGroup('Tools', 'mat'); t.repaint(); } catch (e) { bad.push('drawing tools threw: ' + e.message); }
    await wait(100);
    return t.matNow();
  };
  t.USER(null);
  let now = await open();
  if (now.level !== 'all') bad.push('a stranger opens on ' + now.level + ' — nobody is known, so it should be Every level');
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  now = await open();
  if (now.level !== 'GCSE' || now.subject !== 'Maths') {
    bad.push('Pat is booked into GCSE Maths and the cheat sheet opened on ' + now.subject + ' · ' + now.level);
  }
  t.USER(null);
  t.matFresh();
  return bad;
});

/* ---------- A CHEAT SHEET INTO THE BASKET, LAMINATED, AND THE ORDER NAMES ITS PIECES § */
check('a cheat sheet goes into the basket, laminates, and the order names its pieces', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.orderText || !t.CART || !t.cartMoney) return ['the cheat sheet basket door is not exported'];
  const bad = [];
  const doc = w.document;
  t.setCart([]);
  t.matFresh();
  try { t.findGroup('Tools'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 20 && !doc.querySelector('[data-do="mat-cart"]'); n++) await wait(50);
  const trolley = doc.querySelector('#mat-box [data-do="mat-cart"]');
  if (!trolley) return ['there is no basket tile beside Print the sheet'];
  t.matSet('Maths', 'GCSE', 'H');
  t.matOn(['M01', 'M17', 'M26']);
  t.matPaint();

  t.USER(null);
  t.ACTIONS['mat-cart'](trolley);
  if (t.CART().length) bad.push('signed out, the sheet still went into the basket');
  const toastEl = doc.getElementById('toast');
  if (!/sign in/i.test(String(toastEl ? toastEl.textContent : ''))) bad.push('signed out, the toast does not say to sign in');

  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.ACTIONS['mat-cart'](trolley);
  t.ACTIONS['mat-cart'](trolley);
  const cart = t.CART();
  if (cart.length !== 1) return bad.concat('two presses made ' + cart.length + ' basket lines, not one');
  const line = cart[0];
  if (line.kind !== 'print' || line.pages !== 1) bad.push('the sheet went in as ' + line.kind + ' with ' + line.pages + ' pages — it is one printed page');
  if (!/Maths/.test(line.name) || !/GCSE Higher/.test(line.name) || !/2 pieces/.test(line.name)) {
    bad.push('the line is called "' + line.name + '" — it should say Maths, GCSE Higher and 2 pieces');
  }
  ['Ruler down the edge', 'Straight line', 'Quadratics'].forEach(p => {
    if ((line.parts || []).indexOf(p) === -1) bad.push('the line does not carry "' + p + '" in its pieces: ' + JSON.stringify(line.parts));
  });

  /* THE SWITCH IS THE BASKET'S OWN, drawn on the Tools column's basket card. */
  for (let n = 0; n < 10 && !doc.querySelector('.cart-box [data-do="cart-laminate"]'); n++) await wait(50);
  const lam = doc.querySelector('.cart-box [data-do="cart-laminate"]');
  if (!lam) return bad.concat('the cheat sheet line in the basket has no laminate switch');
  const plain = t.cartMoney(line);
  t.ACTIONS['cart-laminate'](lam);
  if (!t.CART()[0].laminate) bad.push('pressing + laminate did not laminate the sheet');
  const want = Math.round((plain + t.lamPrice(1)) * 100) / 100;
  if (Math.round(t.cartMoney(t.CART()[0]) * 100) / 100 !== want) {
    bad.push('laminated, the sheet costs ' + t.cartMoney(t.CART()[0]) + ' and print ' + plain + ' + laminate ' + t.lamPrice(1) + ' is ' + want);
  }
  const text = String(t.orderText() || '');
  ['Ruler down the edge', 'Straight line', 'Quadratics'].forEach(p => {
    if (text.indexOf(p) === -1) bad.push('the order message does not name "' + p + '" — the owner cannot rebuild the sheet');
  });
  if (!/laminated/.test(text)) bad.push('the order message does not say the sheet is laminated');
  if (/1 pages/.test(text)) bad.push('the order message says "1 pages"');
  t.setCart([]);
  t.USER(null);
  t.matFresh();
  return bad;
});

/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, AND SQUARED § */
check('the cheat sheet maker draws a handwriting sheet, lined and squared paper, and prints them', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.matFresh || !t.matBlank || !t.matSheet || !t.CART) return ['the practice paper is not exported'];
  const bad = [];
  const doc = w.document;
  t.setCart([]);
  t.matFresh();
  try { t.findGroup('Tools'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 20 && !doc.getElementById('mat-subject'); n++) await wait(50);
  /* THE KINDS ARE A "Practice paper" GROUP IN THE SUBJECT SELECT — a select of their own was the 44px
     the card did not have at 320x568 (see `initMat`). */
  const kind = doc.getElementById('mat-subject');
  if (!kind) return ['the cheat sheet maker has no subject select'];
  const kinds = [...kind.querySelectorAll('optgroup option')].map(o => o.value).join(',');
  if (kinds !== 'paper:hand,paper:lined,paper:grid') bad.push('the subject select offers the paper kinds ' + kinds + ', not handwriting, lined and squared');
  if (kind.closest('[hidden]')) bad.push('the subject select is hidden, so the paper kinds cannot be reached');

  const press = (el, v) => { el.value = v; el.dispatchEvent(new w.Event('change', { bubbles: true })); };
  const svgOf = () => { const d = doc.createElement('div'); d.innerHTML = t.matSheet(); return d; };
  /* THE SEGMENTS OF ONE PATH, as [x0, y0, x1, y1] — `M x y H x` and `M x y V y` are all it writes. */
  const segs = (d, cls) => {
    const p = d.querySelector('path.' + cls);
    if (!p) return [];
    return [...p.getAttribute('d').matchAll(/M(-?[\d.]+) (-?[\d.]+)([HV])(-?[\d.]+)/g)].map(m =>
      m[3] === 'H' ? [+m[1], +m[2], +m[4], +m[2]] : [+m[1], +m[2], +m[1], +m[4]]);
  };
  const inside = (d, name) => {
    const vb = (d.querySelector('svg.mat-ruling') || { getAttribute: () => '' }).getAttribute('viewBox') || '';
    const [, , W, H] = vb.split(/\s+/).map(Number);
    if (!W || !H) { bad.push(name + ': the ruling has no viewBox in millimetres'); return; }
    /* 260mm IS THE ROOM MEASURED IN CHROME between the name row and the footer (see `MAT_BLANK_H`);
       a taller drawing pushes the footer off the bottom of the A4 page. */
    if (H > 260 || W > 184) bad.push(name + ': the ruling is ' + W + ' x ' + H + 'mm — more than the 184 x 260mm the page has room for');
    d.querySelectorAll('svg.mat-ruling path').forEach(p => {
      const nums = (p.getAttribute('d').match(/-?[\d.]+/g) || []).map(Number);
      if (nums.some(v => v < -0.01) || nums.some(v => v > Math.max(W, H) + 0.01)) bad.push(name + ': a line is drawn outside the page');
    });
    const ys = [];
    d.querySelectorAll('svg.mat-ruling path').forEach(p => [...p.getAttribute('d').matchAll(/M[\d.]+ ([\d.]+)H/g)].forEach(m => ys.push(+m[1])));
    if (ys.some(y => y > H + 0.01)) bad.push(name + ': a line sits ' + Math.max(...ys) + 'mm down a ' + H + 'mm drawing — under the footer');
    if (/(fill|stroke)="#|style="[^"]*#[0-9a-f]{3}/i.test(d.innerHTML)) bad.push(name + ': a colour is written on the paper as a literal');
  };

  /* ---- HANDWRITING ---- */
  press(kind, 'paper:hand');
  if (t.matBlank().kind !== 'hand') return bad.concat('choosing Handwriting did not change the sheet');
  if (!doc.getElementById('mat-cheat').hidden) bad.push('the cheat sheet\'s pieces are still showing under Handwriting');
  if (!doc.getElementById('mat-level').closest('[hidden]')) bad.push('the level select is still showing under Handwriting');
  if (doc.getElementById('mat-blank').hidden) bad.push('the handwriting questions are hidden under Handwriting');
  const shown = [...doc.querySelectorAll('#mat-blank [data-for]')].filter(e => !e.hidden).map(e => e.getAttribute('data-for'));
  if (shown.some(f => f !== 'hand') || !shown.length) bad.push('under Handwriting the card shows the questions for ' + JSON.stringify(shown));
  const box = doc.getElementById('mat-text');
  const words = 'Sam can hop and skip to the big red bus stop';
  box.value = words;
  box.dispatchEvent(new w.Event('input', { bubbles: true }));
  await wait(320);
  let d = svgOf();
  if (!d.querySelector('.mat-sheet.is-hand')) return bad.concat('the printed sheet is not the handwriting sheet');
  const top = segs(d, 'mat-ln'), mid = segs(d, 'mat-ln-mid'), base = segs(d, 'mat-ln-base');
  const rows = base.length;
  if (!rows) return bad.concat('the handwriting sheet has no baselines');
  if (mid.length !== rows || top.length !== 2 * rows) {
    bad.push('the ruling is ' + top.length + ' faint, ' + mid.length + ' dashed and ' + rows + ' baselines — four lines a row is 2:1:1');
  }
  const b = +t.matBlank().size;
  base.forEach((s, i) => {
    if (Math.abs(s[1] - mid[i][1] - b) > 0.01) bad.push('row ' + (i + 1) + ': the x-height band is ' + (s[1] - mid[i][1]) + 'mm, not ' + b);
  });
  inside(d, 'handwriting');
  const traced = [...d.querySelectorAll('text.mat-trace')];
  const onPage = traced.map(x => x.textContent).join(' ');
  words.split(' ').forEach(x => { if (onPage.split(' ').indexOf(x) === -1) bad.push('"' + x + '" was typed and is not on the sheet'); });
  /* ONE PRACTICE ROW EACH: the trace rows are every other ruling, starting with the first. */
  const baseYs = base.map(s => s[1]);
  traced.forEach(x => {
    const r = baseYs.findIndex(y => Math.abs(y - +x.getAttribute('y')) < 0.01);
    if (r === -1) bad.push('the words "' + x.textContent + '" do not sit on a baseline');
    else if (r % 2) bad.push('the words "' + x.textContent + '" are on ruling ' + (r + 1) + ', a practice row');
  });
  if (traced.length !== Math.ceil(rows / 2)) bad.push(traced.length + ' trace rows on ' + rows + ' rulings with one practice row each — the words should come round again');
  const gap = doc.querySelector('#mat-blank select[data-k="gap"]');
  press(gap, '2');
  if (svgOf().querySelectorAll('text.mat-trace').length !== Math.ceil(rows / 3)) bad.push('two practice rows each did not leave two empty rulings after each traced one');
  press(gap, '1');
  /* A SIZE THE SELECT DOES NOT OFFER IS REFUSED — the one door every setting comes in by. */
  const size = doc.querySelector('#mat-blank select[data-k="size"]');
  const fake = doc.createElement('select');
  fake.setAttribute('data-k', 'size'); fake.innerHTML = '<option value="7">7</option>'; fake.value = '7';
  t.ACTIONS['mat-blank'](fake);
  if (t.matBlank().size === '7') bad.push('a 7mm writing size went in although nothing offers it');
  press(size, '4');
  if (segs(svgOf(), 'mat-ln-base').length <= rows) bad.push('Small writing did not fit more rulings than Large');

  /* ---- BASKET AND PRINT ---- */
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const trolley = doc.querySelector('#mat-box [data-do="mat-cart"]');
  if (!trolley) bad.push('there is no basket tile for the handwriting sheet');
  else {
    t.ACTIONS['mat-cart'](trolley);
    const line = t.CART()[0];
    if (!line) bad.push('the handwriting sheet did not go into the basket');
    else {
      if (line.kind !== 'print' || line.pages !== 1) bad.push('the handwriting sheet went in as ' + line.kind + ' with ' + line.pages + ' pages');
      if (!/Handwriting/.test(line.name)) bad.push('the basket line is called "' + line.name + '" — it does not say handwriting');
      if (!(line.parts || []).some(p => p.indexOf(words) !== -1)) bad.push('the basket line does not carry the words, so the owner cannot print the same sheet');
      for (let n = 0; n < 10 && !doc.querySelector('.cart-box [data-do="cart-laminate"]'); n++) await wait(50);
      if (!doc.querySelector('.cart-box [data-do="cart-laminate"]')) bad.push('the handwriting sheet in the basket has no laminate switch');
    }
  }
  t.setCart([]);
  t.USER(null);
  w.print = () => {};
  t.ACTIONS['mat-print']();
  if (!doc.querySelector('.mat-paper .mat-sheet.is-hand')) bad.push('Print did not put the handwriting sheet on the paper');
  doc.querySelectorAll('.mat-paper').forEach(p => p.remove());
  doc.body.classList.remove('printing-mat');

  /* ---- LINED ---- */
  press(kind, 'paper:lined');
  press(doc.querySelector('#mat-blank select[data-k="line"]'), '10');
  d = svgOf();
  const lines = segs(d, 'mat-ln').filter(s => s[1] === s[3]);
  const steps = new Set(lines.slice(1).map((s, i) => +(s[1] - lines[i][1]).toFixed(2)));
  if (!lines.length || steps.size !== 1 || !steps.has(10)) bad.push('10mm lined paper is spaced ' + JSON.stringify([...steps]));
  if (!d.querySelector('path.mat-ln-margin')) bad.push('lined paper has no margin');
  inside(d, 'lined');

  /* ---- SQUARED ---- */
  press(kind, 'paper:grid');
  press(doc.querySelector('#mat-blank select[data-k="grid"]'), '10');
  d = svgOf();
  const g = segs(d, 'mat-ln-grid');
  const vx = g.filter(s => s[0] === s[2]).map(s => s[0]), hy = g.filter(s => s[1] === s[3]).map(s => s[1]);
  const even = xs => new Set(xs.slice(1).map((x, i) => +(x - xs[i]).toFixed(2)));
  if (!vx.length || !hy.length) bad.push('squared paper has no lines');
  else {
    if ([...even(vx)].join() !== '10' || [...even(hy)].join() !== '10') bad.push('1cm squared paper is spaced ' + JSON.stringify([...even(vx), ...even(hy)]));
    const left = vx[0], right = 184 - vx[vx.length - 1];
    if (Math.abs(left - right) > 0.01) bad.push('the grid is ' + left + 'mm from the left and ' + right + 'mm from the right — not centred');
  }
  inside(d, 'squared');

  /* ---- A SUBJECT TAKES IT BACK TO THE CHEAT SHEET ---- */
  press(kind, 'Maths');
  if (t.matBlank().kind !== 'cheat' || doc.getElementById('mat-cheat').hidden) bad.push('choosing Maths after squared paper did not bring the cheat sheet back');
  press(kind, 'paper:grid');

  /* ---- REMEMBERED, AND A KIND FROM SOMEWHERE ELSE IS THE CHEAT SHEET ---- */
  const kept = JSON.parse(w.localStorage.getItem('matChoice') || '{}');
  if (kept.k !== 'grid' || !kept.p || kept.p.grid !== '10') bad.push('the paper choice is not remembered on this device: ' + JSON.stringify({ k: kept.k, p: kept.p }));
  w.localStorage.setItem('matChoice', JSON.stringify(Object.assign(kept, { k: 'origami', p: { grid: '3', line: 'x' } })));
  t.matFresh();
  w.localStorage.setItem('matChoice', JSON.stringify(Object.assign(kept, { k: 'origami', p: { grid: '3', line: 'x' } })));
  t.matRecall();
  if (t.matBlank().kind !== 'cheat') bad.push('a stored sheet type nobody offers opened as "' + t.matBlank().kind + '", not the cheat sheet');
  if (t.matBlank().grid !== '5') bad.push('a stored 3mm square went in although nothing offers it');

  /* ---- AND THE PAPER'S RULES SAY THEIR COLOURS AS TOKENS ---- */
  const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');
  const mine = [...css.matchAll(/(\.mat-(?:ln[\w-]*|trace|name[\w ]*|ruling)[^{]*)\{([^}]*)\}/g)];
  if (!mine.length) bad.push('style.css has no rules for the rulings');
  mine.forEach(m => { if (/#[0-9a-f]{3,8}\b|rgb\(/i.test(m[2])) bad.push(m[1].trim() + ' writes a colour as a literal'); });
  t.matFresh();
  return bad;
});

/* ---------- A SHOP ITEM'S THEME IS A TAG (740): the fixture's themed items answer Theme; an empty theme is no tag ---------- */
check('shop themes (740): a shop item with a theme carries a Theme tag and is found by it; one with an empty theme carries none', async () => {
  const p = payload();
  /* THE FIXTURE'S SHOP (check/fixture.json), which tags four items and leaves the rest blank. */
  try { p.shop = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'check', 'fixture.json'), 'utf8')).shop; } catch (e) { return ['check/fixture.json did not load — NOT checked']; }
  const { w } = boot({ payload: p });
  await wait(300);
  const all = typeof w.stuffItemsAll_ === 'function' ? (w.stuffItemsAll_() || []).filter(x => x.kind === 'shop') : [];
  if (!all.length) return ['no shop items reached the finder — NOT checked'];
  const bad = [], f = w.facetList().find(x => x.field === 'shopTheme');
  if (!f) return ['there is no Theme facet on shop items'];
  const themed = all.filter(x => x.shopTheme), plain = all.filter(x => !x.shopTheme);
  if (themed.length < 2) bad.push('only ' + themed.length + ' fixture shop items carry a theme');
  if (!plain.length) bad.push('no fixture shop item has an empty theme, so the fallback is untested');
  const vals = w.facetValues(all, f).map(v => v.value).sort().join();
  if (vals !== 'History,Maths') bad.push('Theme offers ' + vals + ', wanted History,Maths');
  const rul = themed.find(x => x.key === 'Ruler (30cm)');
  if (!rul || !/data-tag="kind"[^>]*>[^<]*Maths/.test(String(w.thingCard_(rul, 0)))) bad.push('the themed ruler\'s card does not show its Maths tag');
  const pen = plain[0] && String(w.thingCard_(plain[0], 0));
  if (pen && /Theme/.test(pen)) bad.push('an unthemed item says Theme');
  return bad;
});

/* ---------- A PENCE PRICE IS MONEY, AND A SHOP LINE IS ONE LINE § */
check('a pence-priced shop item goes in the basket as money, on one line', async () => {
  const p = payload();
  p.shop = [{ name: 'Pencil', price: '30', unit: 'p', acquire: 'buy', audience: 'all', inStock: true },
            { name: 'Sticker sheet', price: '3', unit: '✓ ', acquire: 'ticks', audience: 'all', inStock: true }];
  const { w } = boot({ payload: p });
  await wait(300);
  const t = w.__t;
  if (!t.CART || !t.setCart || !t.basket || !t.cartMoney) return ['the basket is not exported'];
  const bad = [];
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.setCart([]);
  const add = key => {
    const el = w.document.createElement('button');
    el.dataset.key = key; el.dataset.kind = 'shop';
    t.ACTIONS['cart-add'](el);
  };
  add('Pencil'); add('Sticker sheet');
  /* AND ITS CARD SAYS £0.30, NOT "30 credits" (463: a trip is a pence-priced item). */
  const pcard = typeof w.thingCard_ === 'function' && typeof w.stuffItemsAll_ === 'function'
    ? String(w.thingCard_((w.stuffItemsAll_() || []).find(x => x.kind === 'shop' && x.key === 'Pencil') || {}, 0)) : null;
  if (pcard === null) bad.push('thingCard_ or stuffItemsAll_ is not reachable, so the pencil\'s card was not checked');
  else if (!/£0\.30/.test(pcard) || /30 credits/.test(pcard)) bad.push('the pencil\'s card does not say £0.30: ' + pcard.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 160));
  const pencil = t.CART().find(c => c.key === 'Pencil');
  if (!pencil) return ['the pencil did not go into the basket'];
  if (pencil.cost !== 0 || pencil.money !== 0.3) bad.push('a 30p pencil went in as cost ' + pencil.cost + ', money ' + pencil.money + ' — it is £0.30, not 30 credits');
  const stick = t.CART().find(c => c.key === 'Sticker sheet');
  if (!stick || stick.cost !== 3) bad.push('a 3-tick sticker sheet lost its price: ' + JSON.stringify(stick));
  /* A LINE SAVED BEFORE THIS — `cost: 30` for the pencil — comes back as money when drawn. */
  t.setCart([{ key: 'Pencil', name: 'Pencil', kind: 'shop', cost: 30, money: 0 }]);
  const html = String(t.basket() || '');
  if (t.CART()[0].money !== 0.3 || t.CART()[0].cost !== 0) bad.push('a pencil saved as 30 credits is still ' + JSON.stringify(t.CART()[0]) + ' after the basket was drawn');
  if (/30 cr/.test(html)) bad.push('the basket still draws the pencil as "30 cr"');
  if (!/£0\.30/.test(html)) bad.push('the basket does not draw the pencil at £0.30');
  const d = w.document.createElement('div');
  d.innerHTML = html;
  const row = [...d.querySelectorAll('.bk-row.is-wide')].find(r => /Pencil/.test(r.textContent));
  if (!row) return bad.concat('no basket row for the pencil');
  if (!row.querySelector('.cart-ln [data-do="cart-drop"]')) bad.push('the pencil\'s ✕ is not on its name line');
  if (row.querySelector('.cart-ctl')) bad.push('the pencil draws a control strip with nothing to hold but its ✕');
  if (!row.querySelector('.cart-lead')) bad.push('the pencil has no leader to its price');
  t.setCart([{ key: 'Sticker sheet', name: 'Sticker sheet', kind: 'shop', cost: 3, money: 0 },
             { key: 'P-X', kind: 'print', name: 'Paper', pages: 0, cost: 0 }]);
  const head = (() => { const e = w.document.createElement('div'); e.innerHTML = String(t.basket() || '');
    const h = e.querySelector('.rc-head p'); return h ? h.textContent.trim() : ''; })();
  if (head.length > 30) bad.push('the basket head reads "' + head + '" — ' + head.length + ' characters, which wraps at 390');
  t.setCart([]);
  return bad;
});

/* ---------- SETTINGS SAVE AGAINST A SERVER OLDER THAN THE SITE § */
check('a settings save still works against a server older than the site', async () => {
  const { w, sent } = boot({ reply: b => b.action === 'myProfile'
    ? { error: 'That action is not recognised.' } : { success: true, changed: 1 } });
  await wait(300);
  const t = w.__t;
  t.USER({ name: 'Test Admin', personId: 'P001', role: 'admin', roles: ['admin'], token: 'tk',
           profile: { first_name: 'Test', last_name: 'Admin', photo: '', phone: '07700900000' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const d = w.document;
  const cardWith = f => [...d.querySelectorAll('#s-account .me-form')]
    .find(form => form.querySelector('[data-me="' + f + '"]'));
  /* A CARD OF PLAIN FIELDS THAT IS STILL ON SETTINGS — the name went to your own card's Edit (docs/history/339),
     so the old server's About you is gone from here, and Where (the borough and the city) is the plain one. */
  const plain = cardWith('borough') || cardWith('headline'), packed = cardWith('phone_no') || cardWith('dob_d');
  if (!plain || !packed) return ['the settings column has no card of plain fields or no Contact card to press'];
  const bad = [];
  const press = form => t.ACTIONS['me-save'](form);
  sent.length = 0;
  press(plain);
  await wait(300);
  if (!sent.some(b => b.action === 'updateProfile')) {
    bad.push('the card of plain fields posted ' + JSON.stringify(sent.map(b => b.action))
             + ' and no updateProfile — an older server stops every save');
  }
  sent.length = 0;
  press(packed);
  await wait(300);
  if (sent.some(b => b.action === 'updateProfile')) {
    bad.push('the Contact card posted its empty packed boxes to an older server, which would write blanks over the sheet');
  }
  const said = String((packed.querySelector('.me-said') || {}).textContent || '');
  if (!/older than this site/i.test(said)) bad.push('the Contact card says "' + said + '" rather than that the backend needs updating');
  const toastEl = d.getElementById('toast');
  if (/not recognised/i.test(String(toastEl ? toastEl.textContent : ''))) bad.push('the raw "not recognised" sentence is still toasted');
  return bad;
});

/* ---------- A SEVERAL-OF-A-LIST FIELD OPENS INTO TICKS IN ITS CARD, AND SAVE POSTS THE LIST § */
check('a several-of-a-list field opens into ticks under it, marks its card, and Save posts the list', async () => {
  const { w, sent } = boot({ payload: Object.assign(payload(), { profileFields: { 'Contact & address': ['email', 'venues_ok'] } }),
    reply: b => b.action === 'myProfile' ? { error: 'That action is not recognised.' } : { success: true, changed: 1 } });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  t.USER({ name: 'Ada Tutor', personId: 'P9', role: 'tutor', roles: ['tutor'], token: 'tk',
           profile: { first_name: 'Ada', last_name: 'Tutor', email: 'ada@example.org', venues_ok: 'Mitcham library' } });
  try { t.go('account', false, true); w.paint('account'); } catch (e) { return ['drawing settings threw: ' + e.message]; }
  await wait(300);
  const box = () => d.querySelector('#s-account input[type="hidden"][data-me="venues_ok"]');
  if (!box()) return ['there is no venues_ok field on Settings — the several-of-a-list field was NOT checked'];
  const field = box().closest('.many');
  const det = field && field.querySelector('details');
  const sum = det && det.querySelector(':scope > summary');
  if (!det || !sum) return ['the venues field is not a <details> with a summary — drew ' + JSON.stringify(String(field && field.innerHTML).slice(0, 120))];
  if (field.closest('#drop') || d.getElementById('drop')) bad.push('the field\'s list is in a panel outside the card');
  if (det.open) bad.push('the list is open before anybody pressed it');
  if (!/Mitcham library/.test(sum.textContent)) bad.push('the closed field does not say what is ticked: ' + JSON.stringify(sum.textContent));
  const ticks = () => [...field.querySelectorAll('input[type="checkbox"][data-many-of="venues_ok"]')];
  if (ticks().length !== 2) bad.push('the list draws ' + ticks().length + ' boxes for two venues');
  if (ticks().some(c => c.hasAttribute('data-me'))) bad.push('a tick carries data-me, so me-save would post it as TRUE/FALSE over the list');
  if (!ticks().every(c => c.closest('label.check'))) bad.push('a tick is not the app\'s own `.check` row');
  det.open = true;
  const form = field.closest('.me-form');
  if (form) delete form.dataset.dirty;
  const cw = ticks().find(c => c.value === 'Colliers Wood Library');
  if (!cw) bad.push('no box for Colliers Wood Library');
  else {
    cw.checked = true;
    cw.dispatchEvent(new w.Event('change', { bubbles: true }));
  }
  if (box().value !== 'Colliers Wood Library, Mitcham library') bad.push('a tick wrote ' + JSON.stringify(box().value) + ', not the two venues in the list\'s order');
  if (!/Colliers Wood Library, Mitcham library/.test(sum.textContent)) bad.push('the summary did not follow the tick: ' + JSON.stringify(sum.textContent));
  if (!form || !form.dataset.dirty) bad.push('a tick did not mark the card dirty, so a repaint before Save puts it back');
  if (!det.open) bad.push('ticking a box shut the list');
  /* AND A RELOAD BEFORE SAVE KEEPS THE TICK — 315 met 317. § */
  {
    const two = boot({ before: fromStore_(keptStore_(w)), payload: Object.assign(payload(), { profileFields: { 'Contact & address': ['email', 'venues_ok'] } }),
      reply: b => b.action === 'myProfile' ? { error: 'That action is not recognised.' } : { success: true, changed: 1 } });
    await wait(300);
    two.w.__t.USER({ name: 'Ada Tutor', personId: 'P9', role: 'tutor', roles: ['tutor'], token: 'tk',
                     profile: { first_name: 'Ada', last_name: 'Tutor', email: 'ada@example.org', venues_ok: 'Mitcham library' } });
    try { two.w.__t.go('account', false, true); two.w.paint('account'); } catch (e) { bad.push('drawing settings again threw: ' + e.message); }
    await wait(300);
    const b2 = two.w.document.querySelector('#s-account input[type="hidden"][data-me="venues_ok"]');
    if (!b2) bad.push('after a reload there is no venues_ok field — the kept tick was NOT checked');
    else {
      if (b2.value !== 'Colliers Wood Library, Mitcham library') bad.push('a reload before Save put the ticks back: the field holds ' + JSON.stringify(b2.value));
      const t2 = [...b2.closest('.many').querySelectorAll('input[type="checkbox"][data-many-of="venues_ok"]')].find(c => c.value === 'Colliers Wood Library');
      if (!t2 || !t2.checked) bad.push('after a reload Colliers Wood Library is not ticked');
    }
  }
  /* A SWIPE THAT STARTS ON THE FIELD OPENS NOTHING. § */
  if (typeof t.pressMoved !== 'function') bad.push('pressMoved is not exported — the summary\'s swipe guard was NOT checked');
  else {
    const click = () => { const ev = new w.MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }); sum.dispatchEvent(ev); return ev; };
    t.pressMoved(true);
    const swiped = click();
    t.pressMoved(false);
    if (!swiped.defaultPrevented) bad.push('a swipe\'s click on the field\'s summary was not cancelled — the list opens under a lifting thumb');
    const tapped = click();
    if (tapped.defaultPrevented) bad.push('a tap on the field\'s summary was cancelled — it cannot open');
    det.open = true;
  }
  sent.length = 0;
  try { t.ACTIONS['me-save'](form); } catch (e) { bad.push('Save threw: ' + e.message); }
  await wait(400);
  const post = sent.find(b => b.action === 'updateProfile');
  if (!post) bad.push('Save posted ' + JSON.stringify(sent.map(b => b.action)) + ' and no updateProfile');
  else if ((post.fields || {}).venues_ok !== 'Colliers Wood Library, Mitcham library') {
    bad.push('Save posted venues_ok as ' + JSON.stringify((post.fields || {}).venues_ok));
  }
  return bad;
});

