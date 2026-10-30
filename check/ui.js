#!/usr/bin/env node
/* @family. — check/ui.js WHAT A PAIR OF EYES WAS FOR, DONE AS MEASUREMENTS. § */
'use strict';
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report

const { chromium } = require('playwright');
const http = require('http');
const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..');
/* ITS OWN PORT, AND IT DID NOT HAVE ONE. § */
/* `let`, BECAUSE A SECOND `--part` CANNOT HAVE THE SAME PORT: § */
let PORT      = Number(process.env.UI_PORT || 8732);

const arg   = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];

/* ---------- THE FIXTURE, OR THE REAL PAYLOAD § */
/* ---------- `questions` AND `checklists` ARE NOT IN THE FIXTURE ANY MORE § */
const PAYLOAD_AT = arg('payload');
const FIXTURE = PAYLOAD_AT
  ? fs.readFileSync(PAYLOAD_AT, 'utf8')
  : fs.readFileSync(path.join(__dirname, 'fixture.json'), 'utf8');
/* ---------- AND A STRANGER IS SENT WHAT `doGet` SENDS A STRANGER § */
const FIXTURE_ANON = (() => {
  try { const o = JSON.parse(FIXTURE); o.films = []; delete o.filmsSync; return JSON.stringify(o); }
  catch (e) { return FIXTURE; }
})();
if (PAYLOAD_AT) {
  console.log('payload: ' + PAYLOAD_AT + '  (the real one — findings here are about the DATA as');
  console.log('         much as the code, and the numbers move when a cell does)\n');
}
const SHOTS = process.argv.includes('--shots');
const ONLY  = arg('screen');
/* `--part=1/3` MEASURES A THIRD OF THE SCREENS. § */
const PART  = (/^(\d+)\/(\d+)$/.exec(arg('part') || '') || []).slice(1).map(Number);
/* DEALT BY WEIGHT, NOT BY TURN. § */
function dealt_(list, n) {
  const parts = Array.from({ length: n }, () => ({ w: 0, ids: [] }));
  list.map((id, i) => ({ id, i, w: 1 + statesOf(id).length }))
    .sort((a, b) => b.w - a.w || a.i - b.i)
    .forEach(x => { const p = parts.reduce((m, q) => (q.w < m.w ? q : m)); p.w += x.w; p.ids.push(x.id); });
  return parts.map(p => list.filter(id => p.ids.indexOf(id) !== -1));
}

/* ---------- THE SCREENS, READ OFF THE APP RATHER THAN WRITTEN OUT HERE § */
const SCREENS_FALLBACK = ['stuff', 'account', 'feed', 'booking', 'shop', 'tools', 'games', 'reel', 'dm'];

/* THE SIZES THAT EXIST, AND THE HEIGHT IS HALF OF EACH ONE. § */
/* AND 1920x1080, ADDED 6 OCTOBER WITH THE WIDE WINDOW (THE GRID SHOWS MORE OF ITSELF, shell.js). § */
const WIDTH_ONLY = Number(arg('width') || 0);
const SIZES = [[320, 568], [390, 844], [768, 1024], [1280, 800], [1920, 1080]]
  .filter(s => !WIDTH_ONLY || s[0] === WIDTH_ONLY);

/* THE STATES A SCREEN CAN BE IN — see check/states.js, which `check/press.js` reads as well. § */
const { STATES, statesOf } = require('./states.js');


/* ---------- AND THE VISITOR, WHICH THIS FILE HAD NEVER THOUGHT ABOUT § */
const VISITORS = [
  { as: 'out', user: null },
  /* ---------- AND A `profile`, BECAUSE AN EMPTY BOX IS NOT THE BOX PEOPLE HAVE § */
  { as: 'in',  user: { name: 'Test Admin', personId: 'P001', person_id: 'P001',
                       role: 'admin', roles: ['admin'], handle: 'testadmin',
                       profile: { first_name: 'Test', last_name: 'Admin',
                                  borough: 'Sutton', city: 'London',
                                  /* ---------- THREE LIBRARIES, BECAUSE THE SHELF DRAWS THREE § */
                                  lib1_name: 'Merton', lib1_no: '2000000000000', lib1_pin: '0000',
                                  lib2_name: 'Sutton', lib2_no: '2000000000001', lib2_pin: '0000',
                                  lib3_name: 'Wandsworth Town and Putney',
                                  lib3_no: '2000000000002', lib3_pin: '0000' } } },
];

/* THE ZOOM LADDER, as the owner agreed it (533, D3) -- written here and not read from the app, so the app cannot move it and pass. */
const ZOOM_LADDER = [1, 0.875, 0.75];

/* 44 CSS PIXELS is Apple's published minimum for something a finger has to hit, and Google says 48.
   The smaller number is used so this reports what is indefensible rather than what is imperfect. */
const MIN_TAP = 44;

/* ---------- KNOWN, WITH A WRITTEN REASON EACH, AND STILL PRINTED § */
const ACCEPTED_TAP = [
  { cls: /^kp-key\.(kp-ch|kp-shift)\b/, why:
    'THE PAD\'S LETTERS ARE NARROWER THAN A FINGER, AND A LETTER KEYBOARD CANNOT BE ANYTHING ELSE. The owner, 8 Oct: '
  + '*"Make the keypad never need to use their own keyboard … I just want self contained system really"* -- so a worded '
  + 'answer is typed on the pad\'s own letters (keypad.js, `KP_ABC`) and not the phone\'s. Ten keys across need 440px and '
  + 'a phone has 288 inside its 16px gutters: a letter is 28.8px wide at 320 and 35.8 at 390, ⇧ and the apostrophe 43.2 '
  + 'at 320. The iPhone\'s own keyboard puts the same ten letters on about 32pt cells, which is the precedent. What was '
  + 'done instead of the width: every key is 44px or more TALL, in px; each key\'s box is its whole cell, the gap '
  + 'between faces inside it (a transparent border), so no pixel of a row is dead; a tap in the pad\'s gutters or '
  + 'between rows goes to the nearest key in that row (`kpNear_`), which makes the edge keys reach the edge of the '
  + 'glass -- `q` is 44.8px wide in effect at 320; and the pressed letter is shown above the finger. From 640px wide the '
  + 'letters pad widens and its keys are 60px, so a tablet is not on this list. A wrong letter costs one ⌫.' },
  { cls: /^mc-btn\b/, run: 36, why:
    'THE CALCULATOR IS DRAWN AT FULL SIZE AND ITS KEY ROWS GIVE WAY INSTEAD (533). The owner said yes to *"Make the '
  + 'calculator fit its space at full size rather than being shrunk on every phone"* (D4). A ClassWiz has nine rows of '
  + 'keys under its display, and nine 44px rows with the display are taller than the pane on a laptop and on a small '
  + 'phone, where `paneReach_` used to draw the whole device at .7-.8: 31px keys at 320. Now `calcFit_` (games.js) gives '
  + 'each row what the pane has left, between 36px (a tile\'s floor, `PANE_FLOOR_TILE`) and 56px: about 41px at 390x844 '
  + 'and 36px at 1280x800 and 320x568, where the pane scrolls the rest. Each key is its whole cell, the column wide, so '
  + 'it is 44px or more across; the run down its middle is held to 36 here.' },
  { cls: /^(counted\.row|chip\.sm)\b/, run: 36, why:
    'A FUNNEL ANSWER, AND THE CHIP IT BECOMES, IS 32px BY THE OWNER\'S CHOICE -- *"Make the tags smaller because this will '
  + 'help to make sure more fit in even when there\'s lots of names for the user to parse through."* '
  + 'The funnel stopped cutting long lists into letter ranges on the same day, so a question can draw '
  + 'thirty answers, and at 44px a third of them sat below the card. What was done instead of the '
  + 'full height: each chip carries a 6px reach above and below (a `::before`, as `.qw` does); `min-width: 44px` keeps the narrowest answer a '
  + 'fingertip wide. A wrong tap is cheap: the answer comes back off with its chip\'s cross.\n'
  + '        THIS ENTRY SAID THE REACH MADE A 44px HIT AREA, AND IT DOES NOT (533): lines of chips sit .4rem apart, so '
  + 'one chip\'s reach is under the next line\'s, and `elementFromPoint` down a chip\'s middle gives it 36-38px (43 on a '
  + 'lone line). A 12px line gap would make it 44 and push a long answer list a line further down the card; the owner\'s '
  + 'density is kept, and the run is held to 36, a tile\'s floor.' },
  { cls: /^qw\b/, run: 32, why:
    'A WORD IN A PASSAGE IS THE SIZE OF A WORD, and on a "circle the three adjectives" question the '
  + 'words ARE the controls -- *"some questions require answers on diagram"*, and for KS2 grammar the '
  + 'passage is the diagram. A 44px word would be a passage with one word a line. What was done '
  + 'instead: the passage opens to 2.4 line height and each word carries a 9px reach above and '
  + 'below (a `::before`, so the ring still hugs the word), which grows the hit area without moving a line -- '
  + '32-33px tall at 320 as `elementFromPoint` measures it down a word\'s middle (533; it said "about 35"), held to 32 here. '
  + "The width is the word's own and cannot honestly be anything else. What makes it liveable is what makes an hour "
  + 'cell liveable: a wrong tap costs nothing -- the same tap takes the ring straight back off, and '
  + 'nothing is sent anywhere.' },
  { cls: /^hr\b/, why:
    'THE HOUR GRID IS THE CONTROL, and it cannot be made of 44px parts. Ten 44px cells need 440px, '
  + 'which is wider than any phone made. Shrinking to fewer hours loses the mornings, and stacking '
  + 'them loses the week-at-a-glance reading that is the whole reason the grid beat a pair of time '
  + 'dropdowns.\n'
  + '        AND IT IS 4.7px WIDE AT 320, WHICH IS THE LARGEST COMPROMISE ON THIS LIST BY A LONG '
  + 'WAY. The card is one grid \u2014 *"each field in its correct column"* \u2014 so the answer '
  + 'column is 56.3 / 75.3 / 80.9px at 320 / 390 / 768, and ten hours with their 1px gutters in '
  + 'that is a **4.7 / 6.6 / 7.2px** cell. A fingertip covers about six columns at 320. THAT IS '
  + 'PAST WHERE A WRONG TAP IS RARE and the entry says so rather than dressing it up: what makes '
  + 'it liveable is that a wrong tap costs nothing \u2014 a lit hour comes straight back off with '
  + 'another tap and nothing is sent until Send.\n'
  + '        IT SPANNED THE MULTIPLIER COLUMN AS WELL UNTIL A DAY ROW HAD A MULTIPLIER. `2 / 4` '
  + 'was worth 8.97 / 11.69 / 12.48px a cell on the argument that a day could never fill that '
  + 'column, and *"there should be a 3 hour multiplier in the multiplication column, but i can '
  + 'also see theres no space for that. so make the time grid thinner by scale facter 0.5"* is '
  + 'both halves of why it no longer can. 0.53\u00d7 at every width, and *"i dont care if its '
  + 'really thin now"* is the authority. The three shapes that give half the width for free were '
  + 'offered with their own numbers and refused: two rows of five hours a day (18.6 / 23.2 / 24.5, '
  + 'twice the height), turned on its side as seven day-columns (13 / 16.3 / 17.2, ten rows), and '
  + 'a shorter span. One declaration reverses it \u2014 `grid-column: 2 / 4` \u2014 and it takes '
  + 'the multiplier with it.\n'
  + '        AND 14px IS UNDER `.hr`\u2019s OWN 20px FLOOR, on purpose and on the fourth asking: '
  + '*"make the grid squares and grid thinner"*. What stops it at 14 is that the day name takes '
  + 'over as the row\u2019s floor below it \u2014 12px buys two pixels at 390 and costs a sixth of '
  + 'the target. The arithmetic is beside `.bk-row.bk-wk` in style.css.\n'
  + '        THE OLD REASON ENDED "a finger picking a range on a grid is a DRAG, and the drag is '
  + 'what `slot-row` handles." IT DOES NOT. Measured: no pointer handler anywhere names '
  + '`slot-row` or `slot-hours`, every cell is an ordinary tap, and `slot-row` is not even the '
  + 'element any more \u2014 a day is a row of the card. A sentence that outlived what it '
  + 'described, which is the shape this repository records under `.favwrap.is-fav`.' },
  /* `onCardEdit`: ACCEPTED ONLY INSIDE A CARD'S EDITOR (`.card-ed`), the one place the wardrobe is drawn since docs/history/339 — the review of it found this entry § */
  { cls: /^av-(sw|opt)\b/, onCardEdit: true, why:
    'THE WARDROBE IS ONE SECTION OF YOUR OWN CARD\'S EDIT (docs/history/339), AND IT IS STILL THE ONE BLOCK THE OWNER '
  + 'ASKED FOR. *"the avatar bit is split into like 4 widgets. should just be 1. make things smaller to fit on a screen '
  + 'if need be."* It was four pages — Colours, then the six slots two at a time — because at 44px every swatch and '
  + 'every drawing-with-its-name the whole wardrobe was 1517px against a 534px pane at 320x568: three screens. One '
  + 'block fits on a screen only if the controls come down: 21px colour circles eight to a row, and 29px squares '
  + 'holding the drawing alone, six to a row, which is the strip a 320px card has beside its label column.\n'
  + '        THE FORM IT IS IN SCROLLS NOW (the card editor is never drawn smaller, `paneReach_`), so the pane is no '
  + 'longer what it must fit — the SCREEN still is, which is what the owner said: measured in the review of 339, '
  + 'the figure section is 458px tall at 320x568, the whole wardrobe on the glass at once in a pane of 532; at '
  + '44px it would be three screens of one section to scroll through to dress one figure. Asked again by that '
  + 'review, and kept, for the owner\'s reason.\n'
  + '        WHAT MAKES IT LIVEABLE is what makes an hour cell liveable: a wrong tap costs nothing you '
  + 'cannot undo with the next one. Picking the wrong brown is fixed by picking the right one, and a '
  + 'hat you did not mean is taken off by pressing the one you did. The ONE press that is not free '
  + 'is a priced item, and that one says its price on its own face before it is pressed.\n'
  + '        THE OLD ENTRY REFUSED THIS for the colours alone, on the grounds that splitting them '
  + 'across three pages to get the 44px would make changing a look three swipes — which is the '
  + 'same argument, now answered the other way round because the owner asked for the one card.' },
  /* A LINE OF THE CARD'S EDIT — its label, its box, a fold's summary: 32px, on the owner's asking (docs/history/425). */
  { cls: /^(|field|ce-line)$/, onCardEdit: true, why:
    'YOUR CARD\'S EDIT IS ONE PHONE SCREEN, AND A 44px LINE CANNOT MAKE IT ONE. The owner, 24 Oct, pasting the whole '
  + 'editor: *"please try your best to condense this so it can all apear on a phone screen"*. It was 2856px at 390x844. '
  + 'Sixteen lines and the week at 44px are 900px before a caption, against a pane of about 730 above Save; at 32px the '
  + 'form is about 710 (the state "your own card, being edited" holds it to 760). What was done instead of the height: '
  + 'each line is the whole width — label and box are one target 32px tall and the full card wide — and every fold '
  + 'opens on a tap anywhere on its line. A wrong tap costs nothing: a box gains focus, a fold opens and shuts again.' },
  { cls: /^scr-sq\b/, why:
    'A SCRABBLE BOARD IS FIFTEEN SQUARES ACROSS AND THAT IS THE GAME, not a layout choice. Fifteen '
  + '44px cells need 660px, which is wider than any phone made; at 320px they are 13px each and at '
  + '390px they are 18px. The alternatives were both worse: a board scrolled sideways inside its '
  + 'own container hides most of the position, and seeing the whole board is what Scrabble IS, and '
  + 'a smaller board is a different game. The same argument the stylesheet already records for '
  + '`.c4` and `.oth`, whose cells are 40px and 35px for the same reason and only look acceptable '
  + 'because those boards are seven and eight across. What makes it liveable here is that a tap on '
  + 'the wrong square costs nothing: a tile you have just put down comes straight back off with '
  + 'another tap, and nothing is committed until Play.' },
  { cls: /^cal-d\b/, why:
    'A MONTH IS SEVEN COLUMNS AND EVERY DAY OF IT CAN BE TAPPED NOW. Seven 44px days need 308px of a '
  + 'card whose inside is about 210px at 320; measured, a day is 29x31 at 320, 37x34 at 390 and 39x36 '
  + 'at 768. Before the calendar learned sessions, terms, bank holidays and events, a day was '
  + 'pressable only when an exam or a birthday fell on it, and the fixture had neither, so nothing '
  + 'measured these. The alternatives were worse: a week at a time loses the month a family plans '
  + 'by, and a list of dates is what the calendar was asked to replace. What makes it liveable is '
  + 'that a tap on the wrong day costs nothing: it opens a sheet that says what is on that day and '
  + 'is closed again with nothing changed.' },
  { cls: /^ws-c\b/, why:
    'A WORD SEARCH IS A GRID OF LETTERS AND EVERY LETTER IS A PLACE A WORD CAN START OR END. Ten 44px '
  + 'cells need 440px and the narrowest phone here is 320; eight need 352. Measured at 320x568 a ten-letter row '
  + 'is 20px a cell and an eight-letter one 25px; at 390 they are 25px and 32px. The two ways out were both worse: a '
  + 'drag across the grid would fight the pager for the one gesture this app navigates by (the maze '
  + 'already refuses it for that reason, and the pen pad pays for it with a padlock), and a grid '
  + 'scrolled sideways hides the words it is asking you to find. What makes it liveable is that a '
  + 'wrong tap costs nothing: a first tap on the wrong letter is replaced by tapping the right one, '
  + 'and a second tap that is not in a line with the first simply becomes the new start.' },
  { cls: /^react(\.|$)/, why:
    'SIX FACES ACROSS A CARD AT 320 ARE 41.3px EACH, AND SIX IS THE HOUSE SET. The owner, 9 Oct: *"refine how the post '
  + 'reactions look. Looks abit scuffed"* -- the scuffed row wrapped, orphaning a face and the total, so the six now sit '
  + 'in one line of equal cells. Six 44px cells need 264px; the card has 247.8 inside its padding at 320, and from about '
  + '345px wide every cell is 44 or more. What was done instead of the width: every cell is 44px TALL, in px; the cell '
  + 'is the whole button and the 32px pill only its drawing (`::before`), so no pixel of the row is dead; under 320 the '
  + 'row falls back to 44px columns that wrap. A wrong face costs one tap: the same tap takes it back, another moves it.' },
  { cls: /^bk-(sel|in|v|k)\b/, why:
    'THE BOOKING ROW IS ONE LINE AND ITS UNDERLINE IS THE CELL\'S BOTTOM BORDER. Tried twice and '
  + 'photographed both times: `min-height: 44px` on the control grows the grid cell to 44px and '
  + 'leaves the dashed underline sitting 24px below the label it belongs to, with `align-items: '
  + 'center` no better than `baseline`. The card goes 754px to 1016px and reads as a list of '
  + 'detached rules. It is fixable — the underline has to move off the cell and onto the control — '
  + 'but that is a redesign of the row, not a number, and it is the app\'s main form.\n'
  + '        AND IT IS THE ONE SELECT NOT DRAWN AS THE FIELD. On 9 October every dropdown went back to '
  + 'the platform\'s own and every other select took the field\'s 44px box (note 315); this row kept '
  + 'its receipt clothes for exactly the reason above, and carries the same arrow, smaller.\n'
  + '        AND THE ROW\'S WORD IS ITS LABEL. `Kind` is a `<label for>` the row\'s select (`bk-k`, receiptRow in '
  + 'book.js), so a tap on the word reaches the select too — the row\'s reach is the word and the answer, not the '
  + '15px box alone (review, 9 October). It is one line of the same receipt, for the same reason.' },
];

/* 4.5:1 is WCAG AA for body text. Large text is allowed 3:1, which is why size is checked too —
   holding 18pt-and-up to the body standard would report every heading on a dark site. */
const MIN_CONTRAST      = 4.5;
const MIN_CONTRAST_BIG  = 3.0;

/* ---------- A BOARD IS SQUARES OF ONE SIZE § */
const BOARDS = '.chess, .c4, .oth, .mz, .ws, .scr';
const BOARD_TOL = 0.5;

/* ---------- A WAIT IS THE ONE LOADER, THE SAME EVERYWHERE, AND IT HOLDS ITS ROOM § */
const LOADER_TOL = 1.5;     // px — sub-pixel layout and nothing else, as `ragged`'s 2px
function loadersOn(sid) {
  const host = document.getElementById('s-' + sid);
  const out = [];
  if (!host) return out;
  let at = 0;
  try { at = domIndex_(sid, PAGE[sid] || 0); } catch (e) { at = 0; }
  const pages = host.querySelectorAll(':scope > .page');
  const front = pages.length ? pages[Math.max(0, Math.min(pages.length - 1, at))] : host;
  const sheet = document.querySelector('#sheet:not(.hidden) #sheet-body');
  const roots = [front].concat(sheet ? [sheet] : []);
  /* THE ONE LOADER AS `loading_()` DRAWS IT, on the page and outside every card, for the size to hold
     the rest to. */
  let ref = null;
  try {
    const box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:0;top:0;width:200px;visibility:hidden;pointer-events:none';
    box.innerHTML = loading_();
    document.body.appendChild(box);
    const d = box.querySelectorAll('.loading > span');
    const c0 = d[0].getBoundingClientRect(), c1 = d[1].getBoundingClientRect();
    ref = { dot: d[0].offsetWidth + 'x' + d[0].offsetHeight,
            gap: +((c1.left + c1.width / 2) - (c0.left + c0.width / 2)).toFixed(2) };
    box.remove();
  } catch (e) { ref = null; }
  roots.forEach(root => root.querySelectorAll('.loading').forEach(l => {
    const r = l.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(l).visibility === 'hidden') return;
    const dots = [...l.children];
    const card = l.closest('.pane') || l.closest('#sheet-body') || l.parentElement;
    const c = card.getBoundingClientRect();
    const rs = dots.map(d => d.getBoundingClientRect());
    const mid = a => a.length ? (Math.min(...a.map(x => x.left)) + Math.max(...a.map(x => x.right))) / 2 : 0;
    const vmid = a => a.length ? (Math.min(...a.map(x => x.top)) + Math.max(...a.map(x => x.bottom))) / 2 : 0;
    const where = (l.parentElement && (l.parentElement.id ? '#' + l.parentElement.id
      : '.' + String(l.parentElement.className || l.parentElement.tagName.toLowerCase()).split(/\s+/)[0])) || '?';
    out.push({
      where,
      role: l.getAttribute('role'), label: l.getAttribute('aria-label'), n: dots.length,
      dot: dots.map(d => d.offsetWidth + 'x' + d.offsetHeight),
      /* CENTRE TO CENTRE, which is the dot and the gap together: § */
      /* AND UNZOOMED: `paneReach_` draws a card too tall for its pane smaller with CSS `zoom`, which `offsetWidth` does not see and a rectangle does — so the pitch is § */
      gap: rs.length > 1 ? +(((rs[1].left + rs[1].width / 2) - (rs[0].left + rs[0].width / 2))
                             / (l.currentCSSZoom || 1)).toFixed(2) : 0,
      inX: +(mid(rs) - (r.left + r.width / 2)).toFixed(1),
      inY: +(vmid(rs) - (r.top + r.height / 2)).toFixed(1),
      onCard: +((r.left + r.width / 2) - (c.left + c.width / 2)).toFixed(1),
      cardH: +c.height.toFixed(1),
      ref,
    });
  }));
  return out;
}

/* ---------- A CUSTOM PROPERTY NOTHING ANYWHERE SETS § */
function deadVars() {
  const read = f => (fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '');
  const css  = read(path.join(ROOT, 'style.css')).replace(/\/\*[\s\S]*?\*\//g, '');
  const html = read(path.join(ROOT, 'index.html'));
  const js   = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js'))
                 .map(f => read(path.join(ROOT, 'js', f))).join('\n');

  /* EVERY WRITER, of any kind. `--name:` covers a stylesheet rule, an inline style attribute, and
     a template string building one; setProperty covers the scripted form. */
  const writers = new Set();
  for (const src of [css, html, js]) {
    for (const m of src.matchAll(/(--[\w-]+)\s*:/g)) writers.add(m[1]);
    for (const m of src.matchAll(/setProperty\(\s*['"](--[\w-]+)/g)) writers.add(m[1]);
  }

  const dead = new Set();
  for (const src of [css, html]) {
    for (const m of src.matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      if (!writers.has(m[1])) dead.add(m[1]);
    }
  }
  return [...dead].sort();
}

/* ---------- SERVING THE REAL FILES § */
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
               '.ico': 'image/x-icon' };

function serve() {
  return new Promise(ok => {
    const s = http.createServer((req, res) => {
      const rel = decodeURIComponent(req.url.split('?')[0]);
      const p = path.join(ROOT, rel === '/' ? 'index.html' : rel);
      /* THE LIBRARY WITH ITS WORDS (397): the repository's copy is card metadata, check/lib-full.js puts them back. */
      const libBody = require('./lib-full.js').serve(p);
      if (libBody !== null) { res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' }); return res.end(libBody); }
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) {
        res.writeHead(404); return res.end('not here');
      }
      res.writeHead(200, { 'Content-Type': MIME[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(res);
    });
    const own = PART.length === 2 && PART[0] > 1;
    s.listen(own ? 0 : PORT, () => { if (own) PORT = s.address().port; ok(s); });
  });
}

/* ---------- THE MEASUREMENTS, RUN INSIDE THE PAGE § */
/* ---------- NOTHING IS MEASURED WHILE A COLUMN IS STILL SLIDING § */
async function settled(page) {
  try {
    await page.evaluate(async () => {
      const t0 = performance.now();
      for (;;) {
        const moving = [...document.querySelectorAll('#screen > .screen, .screen')].some(c =>
          typeof c.getAnimations === 'function' && c.getAnimations().some(a => a.playState === 'running'));
        /* AND THE BUILDER DONE (`aheadBusy_`, docs/history/341): a column or a widget slot it is still drawing
           in the quiet is a screen still changing under the measurement. Bounded by the same four seconds. */
        const booked = (typeof PLACE_FRAME !== 'undefined' && !!PLACE_FRAME)
          || (typeof aheadBusy_ === 'function' && aheadBusy_());
        if ((!moving && !booked) || performance.now() - t0 > 4000) break;
        await new Promise(r => setTimeout(r, 50));
      }
      await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
    });
  } catch (e) { /* a page that cannot answer is measured as it stands */ }
}

/* ---------- A DRAWN PICTURE IS ROUND, AND ITS OWN BOX MUST NOT CUT IT § */
const FACE_SEL = 'svg.pfp-art, svg.avatar.is-bust';
function drawnFaces(arg) {
  const host = document.getElementById('s-' + arg.sid);
  if (!host) return [];
  const vw = document.documentElement.clientWidth, vh = document.documentElement.clientHeight;
  return [...host.querySelectorAll(arg.sel)].map(s => {
    const r = s.getBoundingClientRect();
    const frame = s.closest('.pfp-opt, .face-pic, .pfp-face') || s.parentElement;
    const name = frame && frame.dataset && frame.dataset.pic ? 'the ' + frame.dataset.pic
      : (s.classList.contains('is-bust') ? 'a figure' : 'a picture');
    const where = frame ? String(frame.className).split(/\s+/)[0] : '';
    return { x: r.left, y: r.top, w: r.width, h: r.height, name, where };
  }).filter(f => f.w >= 8 && f.h >= 8 && f.x >= 0 && f.y >= 0 && f.x + f.w <= vw && f.y + f.h <= vh);
}
function facesCut(arg) {
  const load = u => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = u; });
  return Promise.all(arg.shots.map(s => load('data:image/png;base64,' + s))).then(imgs => {
    const px = img => { const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, c.width, c.height).data; };
    const [a, lifted, again] = imgs.map(px);
    const W = imgs[0].naturalWidth, H = imgs[0].naturalHeight;
    const dpr = W / document.documentElement.clientWidth;
    const off = (p, q, i) => Math.max(Math.abs(p[i] - q[i]), Math.abs(p[i + 1] - q[i + 1]), Math.abs(p[i + 2] - q[i + 2]));
    return arg.faces.map(f => {
      let cut = 0;
      const x0 = Math.max(0, Math.floor((f.x - 2) * dpr)), y0 = Math.max(0, Math.floor((f.y - 2) * dpr));
      const x1 = Math.min(W, Math.ceil((f.x + f.w + 2) * dpr)), y1 = Math.min(H, Math.ceil((f.y + f.h + 2) * dpr));
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
        const i = (y * W + x) * 4;
        if (off(a, again, i) <= 8 && off(a, lifted, i) > 40) cut++;
      }
      return Object.assign({ cut }, f);
    }).filter(f => f.cut > 2);
  });
}

/* ---------- A WIDGET ON THE GLASS IS DRAWN, NOT WAITING TO BE STARTED § */
async function veiledOnGlass(page) {
  try {
    return await page.evaluate(async () => {
      /* HOW MUCH OF A SLOT IS ON THE GLASS, across and down — nought for one in a column or a page that is
         not drawn, or in no column at all. */
      const shows = (sl, box) => {
        const col = sl && sl.isConnected && sl.closest('.screen'), pg = col && sl.closest('.page');
        if (!col) return { w: 0, h: 0, col: null };
        const cs = getComputedStyle(col);
        if (+cs.opacity === 0 || cs.visibility === 'hidden' || cs.display === 'none') return { w: 0, h: 0, col };
        if (pg) { const ps = getComputedStyle(pg); if (+ps.opacity === 0 || ps.visibility === 'hidden') return { w: 0, h: 0, col }; }
        const r = sl.getBoundingClientRect();
        return { w: Math.min(r.right, box.right) - Math.max(r.left, box.left),
                 h: Math.min(r.bottom, box.bottom) - Math.max(r.top, box.top), col };
      };
      const look = () => {
        const sc = document.getElementById('screen');
        if (!sc) return { n: 0, left: [], beside: 0, off: [] };
        const box = sc.getBoundingClientRect();
        let n = 0;
        const left = [];
        document.querySelectorAll('#screen .widget-slot').forEach(sl => {
          const { w, h, col } = shows(sl, box);
          if (!col || w <= 24 || h <= 24) return;
          n++;
          if (sl.getAttribute('aria-busy') === 'true' && sl.querySelector(':scope > .loading')) {
            left.push(col.id.slice(2) + ' #' + sl.id + ' (' + Math.round(w) + 'x' + Math.round(h) + 'px of it on the glass)');
          }
        });
        /* `TOOLS_ON` and `AT` are `let`s of the app's own scripts, which an evaluation shares. */
        let beside = 0;
        const off = [];
        try {
          TOOLS_ON.forEach(e => {
            if (!e || e.col === AT) return;
            beside++;
            const { w, h, col } = shows(e.slot, box);
            if (col && w > 24 && h > 24) return;
            off.push(e.col + ' #wgt-' + String(e.w && e.w.id) + (!col ? ' (its slot is in no column)'
              : ' (' + Math.max(0, Math.round(w)) + 'x' + Math.max(0, Math.round(h)) + 'px of its slot on the glass)'));
          });
        } catch (err) { /* an app with no widgets running has nothing to say here */ }
        return { n, left, beside, off };
      };
      const t0 = performance.now();
      let r = look();
      while ((r.left.length || r.off.length) && performance.now() - t0 < 3000) {
        await new Promise(res => setTimeout(res, 100));
        r = look();
      }
      return r;
    });
  } catch (e) { return { n: 0, left: [], beside: 0, off: [] }; }
}

function inspect(opts) {
  const { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG } = opts;
  const found = { overflow: [], hidden: [], offscreen: [], lifted: [], strays: [], shrunk: [], offLadder: [],
                 tinyTargets: [], lowContrast: [], noName: [] };

  /* ---------- THE SCREEN WE ASKED FOR, BY NAME § */
  const vw = document.documentElement.clientWidth;
  const vh = document.documentElement.clientHeight;
  let live = document.getElementById('s-' + opts.screenId);
  let guessed = false;

  if (!live) {
    guessed = true;
    const panes = [...document.querySelectorAll('section, .pane, .screen, .page')];
    live = document.body;
    let best = 0;
    for (const p of panes) {
      const r = p.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0))
                 * Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
      if (area > best) { best = area; live = p; }
    }
  }

  const vis = el => {
    const s = getComputedStyle(el);
    if (s.display === 'none' || s.visibility === 'hidden' || s.opacity === '0') return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  /* ---------- AND THE SHEET, WHEN ONE IS OPEN § */
  const sheet = document.getElementById('sheet');
  const onSheet = sheet && !sheet.classList.contains('hidden') && vis(sheet)
    ? [sheet, ...sheet.querySelectorAll('*')] : [];
  /* `#drop` WAS MEASURED HERE, for the sheet's reason: § */
  /* ---------- AND THE MATHS KEYPAD, FOR THE SAME REASON AGAIN § */
  const kp = document.getElementById('kp');
  const onPad = kp && !kp.hidden && vis(kp) ? [kp, ...kp.querySelectorAll('*')] : [];
  const inside = [...live.querySelectorAll('*'), ...onSheet, ...onPad].filter(vis);

  /* ---------- 1. SIDEWAYS SCROLL THAT NOBODY ASKED FOR § */
  const roots = [document.scrollingElement, live, ...inside];
  for (const el of roots) {
    if (!el) continue;
    const s = getComputedStyle(el);
    if (/(auto|scroll)/.test(s.overflowX)) continue;
    /* ---------- A ONE-LINE TEXT FIELD IS A BOX THAT WAS TOLD IT COULD § */
    if (el.tagName === 'INPUT') continue;
    /* ---------- AND NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS § */
    if (el.ownerSVGElement) continue;
    /* ---------- AND AN ELLIPSIS IS THE OTHER WAY OF BEING TOLD § */
    if (!el.children.length && /ellipsis/.test(s.textOverflow || '')
        && /hidden|clip/.test(s.overflowX)) continue;
    /* ---------- AND TEXT KEPT FOR A SCREEN READER IS THE THIRD WAY OF BEING TOLD § */
    if (/inset\(50%\)/.test(s.clipPath || '') && el.getBoundingClientRect().width <= 1.5) continue;
    /* ---------- AND A PLAYER CROPPED TO COVER ITS FRAME IS THE FOURTH § */
    if (/hidden|clip/.test(s.overflowX) && el.children.length) {
      const b0 = el.getBoundingClientRect();
      const kids = [...el.children].map(k => ({ k, r: k.getBoundingClientRect() }))
        .filter(x => x.r.width > 0 && (x.r.right - b0.right > 2 || b0.left - x.r.left > 2));
      if (kids.length && kids.every(x => x.k.tagName === 'IFRAME'
          && Math.abs((x.r.right - b0.right) - (b0.left - x.r.left)) <= 2)) continue;
    }
    const over = el.scrollWidth - el.clientWidth;
    if (over > 1 && el.clientWidth > 0) {
      const box = el.getBoundingClientRect();
      /* THE FURTHEST ANY CHILD IS ACTUALLY PAINTED. § */
      let paintedRight = null;
      for (const kid of el.children) {
        const k = kid.getBoundingClientRect();
        if (k.width > 0 && (paintedRight === null || k.right > paintedRight)) paintedRight = k.right;
      }
      /* 2px of slack, which is the rounding a fractional scale leaves behind — `0.3533` on 794px
         does not land on a whole pixel and neither does the box. */
      if (paintedRight !== null && paintedRight - box.right <= 2) continue;
      found.overflow.push({ tag: el.tagName.toLowerCase(),
        cls: String(el.className || '').slice(0, 40),
        by: over, width: el.clientWidth });
    }
  }

  /* ---------- AND THE OTHER AXIS, WHICH IS THE ONE THE APP IS NAVIGATED ON § */
  /* AND THE FLOOR IS THE APP'S OWN NUMBER, NOT ONE OF THIS FILE'S. § */
  const paneFloor = typeof PANE_REACH === 'number' ? PANE_REACH : 2;
  const panes = live && live.querySelectorAll ? [...live.querySelectorAll('.pane')] : [];
  for (const el of panes) {
    const zk = el.firstElementChild && parseFloat(el.firstElementChild.style.zoom);
    /* ---------- A BIBLE PAGE IS A CARD LIKE ANY OTHER NOW § */
    if (zk > 0 && zk < 1) {
      const card = el.firstElementChild;
      found.shrunk.push({ cls: String(card.className || '').split(/\s+/)[0], z: zk });
    }
    /* EVERY ZOOM IN THE PANE, a card's and its words' (`cardFigFit_`), for the ladder (533). */
    [...el.children, ...el.querySelectorAll('[data-face-zoom]')].forEach(k => {
      const z = parseFloat(k.style && k.style.zoom);
      if (z > 0 && !opts.LADDER.some(s => Math.abs(s - z) < 1e-6)) {
        found.offLadder.push({ cls: String(k.className || k.tagName).split(/\s+/)[0], z });
      }
    });
    const s2 = getComputedStyle(el);
    if (/(auto|scroll)/.test(s2.overflowY)) continue;
    const under = el.scrollHeight - el.clientHeight;
    if (under <= 2 || el.clientHeight <= 0) continue;
    const box = el.getBoundingClientRect();
    let paintedBottom = null;
    for (const kid of el.children) {
      const k = kid.getBoundingClientRect();
      if (k.height > 0 && (paintedBottom === null || k.bottom > paintedBottom)) paintedBottom = k.bottom;
    }
    if (paintedBottom !== null && paintedBottom - box.bottom <= 2) continue;
    found.hidden.push({ tag: el.tagName.toLowerCase(),
      cls: String((el.firstElementChild && el.firstElementChild.className) || el.className || '')
             .slice(0, 40),
      by: under, height: el.clientHeight, tol: under <= paneFloor, floor: paneFloor });
  }

  /* ---------- AND THE PANE ITSELF CAN BE OFF THE SCREEN, WHICH THE RULE ABOVE CANNOT SEE § */
  /* ---------- EXCEPT A PANE THE KEYPAD LIFTED, WHOSE BOX IS WHOLE ON THE GLASS ABOVE IT § */
  const onPage = live && live.querySelector ? live.querySelector(':scope > .page.on > .pane') : null;
  if (onPage) {
    const r = onPage.getBoundingClientRect();
    const past = Math.round(Math.max(r.bottom - innerHeight, -r.top));
    if (past > 2 && r.height > 0) {
      let lifted = false;
      try {
        const pad = document.getElementById('kp');
        const f = document.activeElement;
        /* THE APP'S OWN `let` AND `const`, read by an indirect eval in the page's global scope -- the way
           check/states.js reads `KP_AT` -- because a function handed over by the harness may not see them. */
        const app = (0, eval)('({ lift: typeof KP_LIFT !== "undefined" && KP_LIFT ? KP_LIFT.lift : 0,'
          + ' box: typeof kpBox_ === "function" ? kpBox_ : null })');
        if (document.documentElement.classList.contains('kp-up') && pad && !pad.hidden && f && onPage.contains(f)
            && f.classList.contains('kp-in') && app.lift > 0 && app.box && r.bottom <= innerHeight + 2) {
          const top = pad.getBoundingClientRect().top;
          const field = (f.closest('.qp-ans') || f).getBoundingClientRect(), kept = app.box(f).getBoundingClientRect();
          lifted = field.top >= -2 && kept.bottom <= top + 2 && field.bottom <= top + 2;
        }
      } catch (e) { lifted = false; }
      (lifted ? found.lifted : found.offscreen).push({ tag: 'pane',
        cls: String((onPage.firstElementChild && onPage.firstElementChild.className) || '').slice(0, 40),
        by: past, height: Math.round(r.height) });
    }
  }

  /* ---------- AND A FIELD CAN BE IN THE WRONG COLUMN, WHICH NOTHING HERE COULD ASK § */
  for (const card of (live ? live.querySelectorAll('.bk') : [])) {
    const rows = [...card.children].filter(el => el.classList.contains('bk-row'));
    if (rows.length < 2) continue;
    for (const col of ['bk-k', 'bk-v', 'bk-m', 'bk-r', 'bk-t']) {
      for (const edge of ['left', 'right']) {
        const seen = [];
        for (const row of rows) {
          const el = row.querySelector(':scope > .' + col);
          if (!el) continue;
          const b = el.getBoundingClientRect();
          if (!b.width && !b.height) continue;            // display:none has no box to be wrong
          /* THE WEEK'S RIGHT EDGE, EXEMPT WITH ITS REASON ABOVE. */
          if (edge === 'right' && col === 'bk-v' && row.classList.contains('bk-wk')) continue;
          /* ---------- AND A WAITING LIST'S TALLY, ON THE SAME EDGE FOR THE WEEK'S REASON § */
          if (edge === 'right' && col === 'bk-v' && row.classList.contains('bk-tally')) continue;
          /* AND A TOTAL'S LABEL, ON THE SAME EDGE AND FOR THE SAME KIND OF REASON. § */
          if (edge === 'right' && col === 'bk-k' && row.classList.contains('rc-total')) continue;
          seen.push({ at: Math.round(b[edge] * 10) / 10,
                      k: (row.querySelector(':scope > .bk-k') || {}).textContent || row.className });
        }
        if (seen.length < 2) continue;
        const lo = seen.reduce((a, b) => b.at < a.at ? b : a);
        const hi = seen.reduce((a, b) => b.at > a.at ? b : a);
        if (hi.at - lo.at > 1.5) found.strays.push({ col, edge, by: Math.round((hi.at - lo.at) * 10) / 10,
                                                     lo: lo.k.trim().slice(0, 18), hi: hi.k.trim().slice(0, 18) });
      }
    }
  }

  /* ---------- A "TEXT CLIPPED RATHER THAN WRAPPED" RULE WAS HERE, AND IT WAS INERT § */

  /* ---------- 2. THINGS A FINGER CANNOT HIT ------------------------------------------------------ */
  for (const el of inside) {
    const tag = el.tagName;
    const role = el.getAttribute('role');
    /* SUMMARY IS A TAP TARGET AND WAS NOT ON THIS LIST. § */
    /* ---------- AND `data-do` IS WHAT A CONTROL IS IN THIS APP § */
    const tappable = /^(BUTTON|A|SELECT|INPUT|TEXTAREA|LABEL|SUMMARY)$/.test(tag)
      || role === 'button' || el.hasAttribute('onclick') || el.hasAttribute('data-do');
    if (!tappable) continue;
    if (el.closest('[hidden]')) continue;

    /* ---------- A CONTROL INSIDE A LABEL IS NOT THE TARGET; THE LABEL IS § */
    /* ---------- A SQUARE ON A GAME BOARD IS NOT AN ISOLATED CONTROL § */
    /* CHESS JOINED THIS LIST when its board became a control — sixty-four squares that had been spans with no action, so the board could not be played at all. § */
    if (/\b(c4-cell|oth-cell|chess-sq)\b/.test(String(el.className || ''))) continue;

    if (/^(INPUT|SELECT|TEXTAREA)$/.test(tag)) {
      const lab = el.closest('label');
      if (lab) {
        /* AT ITS OWN SIZE, for the reason given below where the control itself is measured: a label
           on a card `paneReach_` has drawn smaller is 44px times the zoom on the glass. */
        let lz = 1;
        for (let e = lab; e; e = e.parentElement) {
          const zv = parseFloat(e.style && e.style.zoom);
          if (zv > 0 && zv < 1) lz *= zv;
        }
        const lr = lab.getBoundingClientRect();
        if (lr.height / lz >= MIN_TAP - 0.5 && lr.width / lz >= MIN_TAP - 0.5) continue;
      }
    }

    /* ---------- AND WHETHER A SCREEN READER CAN SAY WHAT IT IS § */
    if (/^(BUTTON|A|INPUT|SELECT|TEXTAREA)$/.test(tag)
        && el.type !== 'hidden' && !el.disabled) {
      /* ---------- EACH CANDIDATE TRIMMED BEFORE THE `||`, NOT THE WHOLE CHAIN AFTER IT § */
      const lab2 = el.closest('label');
      const by = el.getAttribute('aria-labelledby');
      const t_ = v => String(v || '').trim();
      const name = t_(el.getAttribute('aria-label'))
        || t_(el.getAttribute('title'))
        || (by ? t_((document.getElementById(by) || {}).textContent) : '')
        || (el.id ? t_((document.querySelector('label[for="' + CSS.escape(el.id) + '"]') || {}).textContent) : '')
        || (lab2 ? t_(lab2.textContent) : '')
        || t_(el.textContent)
        || t_(el.getAttribute('placeholder'))
        /* A VALUE IS THE NAME OF A SUBMIT BUTTON AND OF NOTHING ELSE. § */
        || (/^(submit|button|reset|image)$/.test(el.type || '') ? t_(el.value) : '');
      if (!name) found.noName.push({ tag: tag.toLowerCase(),
        cls: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
        act: el.dataset ? (el.dataset.do || '') : '' });
    }

    /* ---------- HALF A PIXEL, BECAUSE THE RECT IS A SUM AND NOT A SIZE § */
    /* ---------- AT ITS OWN SIZE, NOT THE SIZE A SHRUNK CARD DRAWS IT § */
    let ez = 1;
    for (let e = el; e; e = e.parentElement) {
      const zv = parseFloat(e.style && e.style.zoom);
      if (zv > 0 && zv < 1) ez *= zv;
    }
    const r0 = el.getBoundingClientRect();
    const r = { width: r0.width / ez, height: r0.height / ez };
    if (r.height < MIN_TAP - 0.5 || r.width < MIN_TAP - 0.5) {
      /* THE RUN A FINGER REALLY HAS (533): down the control's middle, how many pixels `elementFromPoint` gives to it -- its reach included, a neighbour's overlap and any zoom taken off. */
      let run = null;
      const cls0 = String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.');
      const cx = r0.left + r0.width / 2;
      /* ONLY WHERE A FINGER CAN REACH IT: on the page in front, and whole inside its pane (a pane that scrolls clips the rest). */
      const pn = el.closest('.pane'), pr = pn && pn.getBoundingClientRect();
      const reachable = !el.closest('.page') || (el.closest('.page.on') && (!pr || (r0.top - 16 >= pr.top && r0.bottom + 16 <= pr.bottom)));
      if (reachable && (opts.RUN_CLS || []).some(src => new RegExp(src).test(cls0)) && cx > 0 && cx < vw && r0.top - 16 >= 0 && r0.bottom + 16 <= vh) {
        let best = 0, cur = 0;
        for (let y = Math.floor(r0.top - 16); y <= r0.bottom + 16; y++) {
          const hit = document.elementFromPoint(cx, y);
          if (hit && (hit === el || el.contains(hit))) { cur++; if (cur > best) best = cur; } else cur = 0;
        }
        run = best;
      }
      /* THE CLASS COMES BACK WITH IT, because a finding has to be identifiable to be accepted. § */
      found.tinyTargets.push({ tag: tag.toLowerCase(),
        cls: String(el.className || '').split(/\s+/).filter(Boolean).slice(0, 2).join('.'),
        text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 28),
        w: Math.round(r.width), h: Math.round(r.height), run,
        /* WHETHER IT IS IN A CARD'S EDITOR — an `ACCEPTED_TAP` entry may be accepted there and nowhere else. */
        onCardEdit: !!(el.closest && el.closest('.card-ed')) });
    }
  }

  /* ---------- 3. TEXT YOU CANNOT READ § */
  /* `color(srgb r g b / a)` IS HOW CHROME COMPUTES A `color-mix()`, and its channels run 0 to 1, not 0 to 255. § */
  const parse = c => {
    const n = (c.match(/[\d.]+/g) || []).map(Number);
    if (!n.length) return null;
    const k = /^color\(srgb\s/.test(c) ? 255 : 1;
    return { r: n[0] * k, g: n[1] * k, b: n[2] * k, a: n.length > 3 ? n[3] : 1 };
  };
  const over = (fg, bg) => ({            // fg painted on top of bg
    r: fg.r * fg.a + bg.r * (1 - fg.a),
    g: fg.g * fg.a + bg.g * (1 - fg.a),
    b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });
  const lum = c => {
    const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };

  /* ---------- AND A GRADIENT IS READ WHERE THE TEXT IS § */
  const stopsOf = img => {
    const out = [];
    const re = /((?:rgba?|color)\([^()]*\))(?:\s+(-?[\d.]+)%)?/g;
    let m;
    while ((m = re.exec(img))) {
      const c = parse(m[1]);
      if (c) out.push({ c: c, at: m[2] === undefined ? null : Number(m[2]) / 100 });
    }
    if (!out.length) return out;
    if (out[0].at === null) out[0].at = 0;
    if (out[out.length - 1].at === null) out[out.length - 1].at = 1;
    for (let i = 1; i < out.length - 1; i++) {
      if (out[i].at !== null) continue;
      let j = i; while (out[j].at === null) j++;
      const lo = out[i - 1].at, hi = out[j].at;
      for (let k = i; k < j; k++) out[k].at = lo + (hi - lo) * (k - i + 1) / (j - i + 1);
    }
    return out;
  };
  const colourAt = (stops, t) => {
    if (t <= stops[0].at) return stops[0].c;
    for (let i = 1; i < stops.length; i++) {
      if (t <= stops[i].at) {
        const a = stops[i - 1], b = stops[i];
        const f = b.at > a.at ? (t - a.at) / (b.at - a.at) : 1;
        const mix = k => a.c[k] + (b.c[k] - a.c[k]) * f;
        return { r: mix('r'), g: mix('g'), b: mix('b'), a: mix('a') };
      }
    }
    return stops[stops.length - 1].c;
  };
  const grounds = el => {
    let accs = [{ r: 0, g: 0, b: 0, a: 1 }];       // the page itself, assumed opaque
    const box = el.getBoundingClientRect();
    const px = box.left + box.width / 2, py = box.top + box.height / 2;
    const chain = [];
    for (let n = el; n; n = n.parentElement) chain.push(n);
    for (const n of chain.reverse()) {
      const cs = getComputedStyle(n);
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0) accs = accs.map(a => over(c, a));
      const img = String(cs.backgroundImage || '');
      if (!/gradient\(/.test(img)) continue;
      /* EACH LAYER, TOP LAYER LAST: CSS paints the first one listed on top. */
      const listed = img.split(/,\s*(?=(?:repeating-)?(?:linear|radial|conic)-gradient\(|url\()/);
      /* ---------- A TILE IS READ ONLY WHERE IT IS PAINTED § */
      const split = v => String(v || '').split(/,\s*(?![^()]*\))/);
      const sizes = split(cs.backgroundSize), reps = split(cs.backgroundRepeat);
      const posX = split(cs.backgroundPositionX), posY = split(cs.backgroundPositionY);
      const off = (v, room) => {
        const m = /^calc\(\s*(-?[\d.]+)%\s*([+-])\s*([\d.]+)px\s*\)$/.exec(String(v).trim());
        if (m) return room * Number(m[1]) / 100 + (m[2] === '-' ? -1 : 1) * Number(m[3]);
        const pc = /^(-?[\d.]+)%$/.exec(String(v).trim());
        if (pc) return room * Number(pc[1]) / 100;
        const pxv = /^(-?[\d.]+)px$/.exec(String(v).trim());
        return pxv ? Number(pxv[1]) : null;
      };
      const under = i => {
        const size = (sizes[i % sizes.length] || '').trim(), rep = (reps[i % reps.length] || '').trim();
        const wh = /^([\d.]+)px\s+([\d.]+)px$/.exec(size);
        if (rep !== 'no-repeat' || !wh) return true;
        const r = n.getBoundingClientRect();
        const bl = parseFloat(cs.borderLeftWidth) || 0, bt = parseFloat(cs.borderTopWidth) || 0;
        const W = r.width - bl - (parseFloat(cs.borderRightWidth) || 0);
        const H = r.height - bt - (parseFloat(cs.borderBottomWidth) || 0);
        const tw = Number(wh[1]), th = Number(wh[2]);
        const x = off(posX[i % posX.length], W - tw), y = off(posY[i % posY.length], H - th);
        if (x === null || y === null) return true;
        const left = r.left + bl + x, top = r.top + bt + y;
        return px >= left && px <= left + tw && py >= top && py <= top + th;
      };
      const layers = listed.map((layer, i) => ({ layer, i })).reverse()
        .filter(o => under(o.i)).map(o => o.layer);
      layers.forEach(layer => {
        const stops = stopsOf(layer);
        if (!stops.length) return;
        const ang = /^linear-gradient\(\s*(-?[\d.]+)deg/.exec(layer);
        const plain = /^linear-gradient\(\s*(?:rgba?|color)\(/.test(layer);   // no angle: 180deg
        if (ang || plain) {
          const r = n.getBoundingClientRect();
          const th = (ang ? Number(ang[1]) : 180) * Math.PI / 180;
          const dx = Math.sin(th), dy = -Math.cos(th);
          const len = Math.abs(r.width * dx) + Math.abs(r.height * dy) || 1;
          const t = ((px - (r.left + r.width / 2)) * dx + (py - (r.top + r.height / 2)) * dy) / len + 0.5;
          const s = colourAt(stops, Math.max(0, Math.min(1, t)));
          if (s.a > 0) accs = accs.map(a => over(s, a));
          return;
        }
        const all = [];
        accs.forEach(a => stops.forEach(s => { if (s.c.a > 0) all.push(over(s.c, a)); }));
        if (!all.length) return;
        all.sort((p, q) => lum(p) - lum(q));
        accs = all.length > 1 ? [all[0], all[all.length - 1]] : all;
      });
    }
    return accs;
  };
  const groundOf = el => grounds(el)[0];

  for (const el of inside) {
    const own = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim().length > 1);
    if (!own) continue;
    const s = getComputedStyle(el);
    const fg = parse(s.color);
    if (!fg) continue;
    let bg = null, ratio = Infinity;
    grounds(el).forEach(g => {
      const solidFg = fg.a < 1 ? over(fg, g) : fg;
      const a = lum(solidFg), b = lum(g);
      const r = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      if (r < ratio) { ratio = r; bg = g; }
    });

    const px = parseFloat(s.fontSize) || 16;
    const bold = (parseInt(s.fontWeight, 10) || 400) >= 700;
    const big = px >= 24 || (bold && px >= 18.66);
    const need = big ? MIN_CONTRAST_BIG : MIN_CONTRAST;

    if (ratio < need) {
      found.lowContrast.push({ text: el.textContent.trim().slice(0, 30),
        ratio: +ratio.toFixed(2), need, px: Math.round(px),
        fg: s.color, bg: `rgb(${[bg.r, bg.g, bg.b].map(Math.round).join(' ')})` });
    }
  }

  /* ---------- 4. AN EDGE YOU CANNOT SEE (WCAG 1.4.11, 3:1) § */
  /* AND AN ESSAY'S SHEET (9 Oct, `ansEssay_`), the same paper field at a page's size: the box a child
     writes forty marks in is the box that has to be findable in the sun. */
  const EDGE_OF = ['.kp-key', '.qp-bar > .qp-ans', '.qp-essay > .qp-sheet'];
  const edgeN = {};
  EDGE_OF.forEach(sel => { edgeN[sel] = 0; });
  found.edges = [];
  const contrast = (p, q) => { const a = lum(p), b = lum(q); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
  for (const el of inside) {
    const sel = EDGE_OF.find(x => el.matches(x));
    if (!sel || el.disabled || !el.parentElement) continue;
    edgeN[sel]++;
    const s = getComputedStyle(el);
    const face = parse(s.backgroundColor);
    const line = (parseFloat(s.borderTopWidth) || 0) >= 1 ? parse(s.borderTopColor) : null;
    let worst = Infinity, at = null;
    grounds(el.parentElement).forEach(g => {
      const f = face && face.a > 0 ? contrast(over(face, g), g) : 1;
      const b = line && line.a > 0 ? contrast(over(line, g), g) : 1;
      const r = Math.max(f, b);
      if (r < worst) { worst = r; at = g; }
    });
    if (worst < 3) {
      found.edges.push({ sel, ratio: +worst.toFixed(2), face: s.backgroundColor, line: line ? s.borderTopColor : 'none',
        bg: `rgb(${[at.r, at.g, at.b].map(Math.round).join(' ')})`,
        name: (el.getAttribute('aria-label') || el.textContent || '').trim().slice(0, 20) });
    }
  }

  /* `found.orphans` WAS HERE -- a tile alone on a line (414, 420). Tiles flow left like words now (487), so a last line of one is right. */

  /* ---------- NOTHING FLOATS (420): "remove all pop up menus I DONT LIKE POP UP MENUS". A visible fixed or
     top-layer box holding a control is a pop-up, unless it is one of the few things that are not menus. */
  found.floating = [];
  const NOT_MENUS = '#kp, #banner, #toast, #reconnect, #boot-slow, .biz-dot, .vid-watch.is-fs, .kp-loupe, .pad-loupe, .pad-sizes';
  [...document.querySelectorAll('body *')].forEach(el => {
    const s = getComputedStyle(el);
    let top = false;
    try { top = el.matches(':popover-open') || el.matches('dialog[open]') || el.matches(':modal'); } catch (e) {}
    if (s.position !== 'fixed' && !top) return;
    if (el.closest(NOT_MENUS) || !vis(el)) return;
    if (!el.matches('[data-do], button, a, input, select, textarea') && !el.querySelector('[data-do], button, a, input, select, textarea')) return;
    found.floating.push((el.id ? '#' + el.id : el.tagName.toLowerCase()) + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).join('.') : '')
      + ' (' + (top ? 'top layer' : 'position: fixed') + ')');
  });
  const sh = document.getElementById('sheet');
  if (sh && getComputedStyle(sh).position !== 'static') found.floating.push('#sheet is position: ' + getComputedStyle(sh).position + ' — the sheet is a page in the flow (420)');

  return { found, guessed, edgeN,
           pane: live === document.body ? 'body' : (live.id || live.className || live.tagName),
           counted: inside.length };
}

/* ---------- GO ---------------------------------------------------------------------------------- */
(async () => {
  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome']
              .find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});

  let failures = 0;
  /* HOW MANY BOARDS THE RULE ABOVE `BOARDS` ACTUALLY MEASURED, printed with the summary — a count
     rather than a silence, because "no board was a mess" and "no board was found" both print no
     finding. */
  let boardsMeasured = 0;
  /* ACCEPTED_TAP RUNS HELD TO THEIR NUMBER (533): none measured on a whole run is a rule that reached nothing. */
  let runsMeasured = 0;
  /* AND HOW MANY DRAWN PICTURES WERE PHOTOGRAPHED FOR A CUT EDGE (`FACE_SEL`), for the same reason. */
  let facesMeasured = 0;
  /* LOADERS, COUNTED LIKE BOARDS — a run that measured none and a run where every one passed print the same nothing. § */
  let loadersMeasured = 0, heldReleased = 0;
  const loaderSizes = {};
  /* AND THE WIDGET SLOTS ON THE GLASS THE "NOT STARTED" RULE LOOKED AT, per width — see `veiledOnGlass`.
     A count, so a run whose selector stopped matching says 0 rather than nothing. */
  const slotsOnGlass = {};
  /* AND THE WIDGETS RUNNING BESIDE THE COLUMN IN FRONT THE "STARTED OFF THE GLASS" RULE LOOKED AT, per
     width, for the same reason. */
  const runningBeside = {};
  /* AND HOW MANY CONTROLS THE EDGE RULE (4, in `inspect`) MEASURED, per subject, for the same reason: a
     keypad that never came up and a keypad whose every key passed print the same nothing. */
  const edgesMeasured = {};
  /* AND THE REELS' SOUND TILES, counted for the same reason — see the measurement over `sound`. */
  let soundMeasured = 0, soundHit = 0;
  const rows = [];

  /* ---------- ASK THE APP WHICH COLUMNS IT HAS, ONCE, BEFORE MEASURING ANY OF THEM § */
  const found = await (async () => {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    try {
      const who = VISITORS.find(v => v.user);
      if (who) await page.addInitScript(u => {
        try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
      }, who.user);
      await page.route('**://script.google.com/**', r =>
        r.fulfill({ status: 200, contentType: 'application/json', body: FIXTURE }));
      await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(1800);
      return await page.evaluate(() => {
        /* `TABS` IS A LIST OF OBJECTS, NOT OF IDS — `check/press.js` maps `t.id` and the first version here did not, which handed `go()` an object and skipped every § */
        try { return (typeof TABS !== 'undefined' ? TABS : []).map(t => (t && t.id) || t)
                .filter(x => typeof x === 'string'); } catch (e) { return []; }
      });
    } catch (e) { return []; } finally { await page.close(); }
  })();
  if (!found.length) {
    console.warn('  ! the app did not report its columns, so this run measures the nine written '
               + 'into SCREENS_FALLBACK. A column added since is NOT being measured.');
    failures++;
  }
  const SCREENS = found.length ? found : SCREENS_FALLBACK;
  const screens = ONLY ? [ONLY]
    : PART.length === 2 ? dealt_(SCREENS, PART[1])[PART[0] - 1] || [] : SCREENS;

  if (SHOTS) fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });

  /* ---------- A WHOLE PAGE WAITING ON THE PAYLOAD, AND WHAT IT BECOMES § */
  const HELD_COLUMNS = ['feed', 'saved', 'spotlight', 'booking'];
  let wholePagesHeld = 0;
  const heldWho = VISITORS.find(v => v.user);
  if (heldWho && (ONLY ? HELD_COLUMNS.indexOf(ONLY) !== -1 : (!PART.length || PART[0] === 1))) {
    for (const [width, height] of SIZES.filter(s => s[0] <= 390)) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      const errs = [];
      page.on('pageerror', e => errs.push(String(e.message).slice(0, 120)));
      await page.addInitScript(u => { try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {} }, heldWho.user);
      const held = [];
      const body = (heldWho.user.roles || []).indexOf('admin') !== -1 ? FIXTURE : FIXTURE_ANON;
      await page.route('**://script.google.com/**', r => { held.push(r); });
      const cols = ONLY ? [ONLY] : HELD_COLUMNS;
      const label = c => `${c} · the payload held`;
      try {
        await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
        await page.waitForFunction(() => typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null
          && typeof go === 'function', null, { timeout: 30000 }).catch(() => {});
        /* ONE FUNCTION FOR BOTH MEASUREMENTS, so "the pane" is found by one rule before and after. */
        const measure = sid => page.evaluate(async sid => {
          try { go(sid, false, true); } catch (e) { return { err: String(e.message || e) }; }
          const t0 = performance.now();
          for (;;) {
            const moving = [...document.querySelectorAll('.screen')].some(c =>
              typeof c.getAnimations === 'function' && c.getAnimations().some(a => a.playState === 'running'));
            const booked = typeof PLACE_FRAME !== 'undefined' && !!PLACE_FRAME;
            if ((!moving && !booked) || performance.now() - t0 > 4000) break;
            await new Promise(r => setTimeout(r, 50));
          }
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          const host = document.getElementById('s-' + sid);
          let at = 0;
          try { at = domIndex_(sid, PAGE[sid] || 0); } catch (e) { at = 0; }
          const pages = host ? host.querySelectorAll(':scope > .page') : [];
          const front = pages.length ? pages[Math.max(0, Math.min(pages.length - 1, at))] : null;
          const pane = front && front.querySelector(':scope > .pane');
          if (!pane) return { none: true };
          const r = pane.getBoundingClientRect(), s = getComputedStyle(pane);
          const alpha = c => { const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return c && c !== 'none' ? 1 : 0;
                               const p = m[1].split(/[\s,/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
          const l = [...pane.querySelectorAll('.loading')].filter(x => x.getClientRects().length);
          const dots = l[0] ? [...l[0].children].map(d => d.getBoundingClientRect()) : [];
          return {
            only: l.length === 1 && pane.children.length === 1 && pane.firstElementChild === l[0],
            loaders: l.length,
            mid: +(r.top + r.height / 2).toFixed(1), h: +r.height.toFixed(1),
            dotMid: dots.length ? +((Math.min(...dots.map(d => d.top)) + Math.max(...dots.map(d => d.bottom))) / 2).toFixed(1) : null,
            fill: alpha(s.backgroundColor) > 0 || (s.backgroundImage && s.backgroundImage !== 'none'),
            edge: (parseFloat(s.borderTopWidth) || 0) > 0 && alpha(s.borderTopColor) > 0,
            shadow: !!s.boxShadow && s.boxShadow !== 'none',
          };
        }, sid);
        const before = {};
        for (const c of cols) {
          before[c] = await measure(c);
          if (SHOTS) await page.screenshot({ path: path.join(__dirname, 'shots', `${c}-payload-held-${width}-in.png`) });
        }
        held.splice(0).forEach(r => r.fulfill({ status: 200, contentType: 'application/json', body }).catch(() => {}));
        await page.unroute('**://script.google.com/**');
        await page.route('**://script.google.com/**', r => r.fulfill({ status: 200, contentType: 'application/json', body }));
        await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED, null, { timeout: 30000 }).catch(() => {});
        for (const c of cols) {
          const b = before[c], a = await measure(c);
          const f = [];
          if (b.err || b.none) f.push(`with the payload held the column drew no pane to measure${b.err ? ' — ' + b.err : ''}`);
          else if (!b.only) f.push(`with the payload held the pane holds ${b.loaders} loader(s) and is not the loader alone — `
                                 + 'the column is not waiting the way every column waits');
          else {
            const frame = ['fill', 'edge', 'shadow'].filter(k => b[k]);
            if (frame.length) f.push(`the pane waiting on the payload draws a frame (${frame.join(', ')}) — an empty card `
                                   + `${b.h}px tall whose edges jump when the content lands`);
          }
          if (a.none || a.err) f.push('once the payload landed the column drew no pane to measure');
          else if (a.loaders) f.push(`the payload landed and ${a.loaders} loader(s) are still on the column`);
          else if (b.dotMid !== null && Math.abs(a.mid - b.dotMid) > 4) {
            f.push(`the dots waited at ${b.dotMid}px down and the card that landed is centred at ${a.mid}px — `
                 + `it arrived ${(a.mid - b.dotMid).toFixed(1)}px from where the wait was drawn`);
          }
          wholePagesHeld++;
          if (f.length) rows.push({ width, id: label(c), as: 'in', loaders: f });
          if (SHOTS) {
            await page.evaluate(s => { try { go(s, false, true); } catch (e) {} }, c);
            await page.waitForTimeout(500);
            await page.screenshot({ path: path.join(__dirname, 'shots', `${c}-payload-landed-${width}-in.png`) });
          }
        }
        if (errs.length) rows.push({ width, id: 'the payload held', as: 'in', jsErrors: errs });
      } catch (e) {
        rows.push({ width, id: 'the payload held', as: 'in', loaders: [`the held-payload pass could not run: ${String(e.message || e).slice(0, 120)}`] });
      } finally { await page.close(); }
    }
  }

  for (const [width, height] of SIZES) {
  for (const who of VISITORS) {
    const page = await browser.newPage({ viewport: { width, height },
                                         deviceScaleFactor: 1 });
    const jsErrors = [];
    page.on('pageerror', e => jsErrors.push(String(e.message).slice(0, 120)));

    /* WHO IS LOOKING, SET BEFORE THE PAGE EXISTS. § */
    if (who.user) await page.addInitScript(u => {
      try { localStorage.setItem('familyUser', JSON.stringify(u)); } catch (e) {}
    }, who.user);

    /* THE BACKEND, STOOD IN FOR. Matched on the host so it catches the JSONP route too. */
    await page.route('**://script.google.com/**', r =>
      r.fulfill({ status: 200, contentType: 'application/json',
                  body: who.user && (who.user.roles || []).indexOf('admin') !== -1 ? FIXTURE : FIXTURE_ANON }));

    await page.goto(`http://localhost:${PORT}/index.html`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1800);                      // the boot fetch and first paint
    /* ---------- AND THE PAYLOAD AND THE LIBRARY ACTUALLY IN, NOT A GUESS AT WHEN THEY WILL BE § */
    await page.waitForFunction(() => typeof LOADED !== 'undefined' && LOADED
      && typeof LIBRARY_ROWS !== 'undefined' && LIBRARY_ROWS !== null, null, { timeout: 30000 }).catch(() => {});

    /* SIGNING IN MUST ACTUALLY HAVE HAPPENED. § */
    if (who.user) {
      const signedIn = await page.evaluate(() => {
        try { return !!(typeof USER !== 'undefined' && USER); } catch (e) { return false; }
      });
      if (!signedIn) {
        console.warn(`  ! seeded a user and the app is still signed out at ${width}px — `
                    + `the signed-in half of the app was NOT measured.`);
        failures++;
      }
    }

    for (const id of screens) {
      /* DRIVEN THROUGH THE APP'S OWN FRONT DOOR. § */
      /* ---------- A COLUMN THIS VISITOR IS NOT GIVEN IS NOT MEASURED IN THEIR NAME § */
      const went = await page.evaluate(sid => {
        try {
          if (typeof columnsFor_ === 'function') columnsFor_();
          if (typeof TABS !== 'undefined' && !TABS.some(t => t.id === sid)) return 'absent';
          if (typeof go === 'function') { go(sid, false, true); return true; }
        } catch (e) {}
        return false;
      }, id);
      if (went === 'absent') { rows.push({ width, id, as: who.as, skipped: 'not a column this visitor is given' }); continue; }
      if (!went) { rows.push({ width, id, as: who.as, skipped: 'no go()' }); continue; }
      await page.waitForTimeout(450);

      /* ONE PASS PER DECLARED STATE — see `STATES`. A screen with none listed has exactly one, with
         no `enter`, which is precisely what every screen had before this existed. */
      for (const state of statesOf(id)) {
        const label = state.name ? `${id} · ${state.name}` : id;
        /* PUT BACK ON EVERY WAY OUT, not only after measuring: "the library still coming" empties the library, and a miss that skipped
           its leave left every later Find state with no questions ("Q0664 is not in the library", Review B) */
        const putBack = async () => {
          if (!state.leave) return;
          await page.evaluate(src => { try { (0, eval)('(' + src + ')')(); } catch (e) {} }, String(state.leave));
          await page.waitForTimeout(250);
        };
        /* WHOSE STATE IS THIS. A widget marked `admin` is not in a stranger's roster, so asking a
           stranger to reach it would report a fault about the check rather than about the app. */
        if (state.only) {
          const mine = await page.evaluate(src => {
            try { return !!(0, eval)('(' + src + ')')(); } catch (e) { return false; }
          }, String(state.only));
          if (!mine) { rows.push({ width, id: label, as: who.as, skipped: 'not this visitor' }); continue; }
        }
        if (state.enter) {
          const entered = await page.evaluate(src => {
            try { (0, eval)('(' + src + ')')(); return true; } catch (e) { return String(e.message); }
          }, String(state.enter));
          if (entered !== true) {
            console.warn(`  ! could not reach "${label}" at ${width}px: ${entered}`);
            failures++;
            await putBack();
            continue;
          }
          await page.waitForTimeout(500);
        }

        /* AND IT HAS TO HAVE ARRIVED. A state that silently did not happen leaves this measuring
           the previous one twice and reporting it as coverage — which is the whole fault this file
           exists to stop repeating. */
        /* ASKED AGAIN FOR UP TO 2.5s, NOT ONCE. § */
        if (state.expect) {
          const got = await page.evaluate(async src => {
            const t0 = performance.now();
            for (;;) {
              let ok = 0;
              try { ok = (0, eval)('(' + src + ')')(); } catch (e) {}
              if (ok || performance.now() - t0 > 2500) return ok;
              await new Promise(r => setTimeout(r, 100));
            }
          }, String(state.expect));
          if (!got) {
            /* AND WHY, WHEN THE STATE CAN SAY. § */
            const why = state.why ? await page.evaluate(src => {
              try { return String((0, eval)('(' + src + ')')() || ''); } catch (e) { return ''; }
            }, String(state.why)) : '';
            console.warn(`  ! "${label}" at ${width}px was entered and shows no ${state.wants} — `
                       + `that state was NOT measured.` + (why ? `\n      ${why}` : ''));
            failures++;
            await putBack();
            continue;
          }
        }

        /* ---------- A SCREEN THAT THREW WAS BEING MEASURED AND REPORTED CLEAN § */
        const threw = await page.evaluate(sid => {
          const el = document.getElementById('s-' + sid);
          if (!el) return '';
          const h = [...el.querySelectorAll('h3')]
            .find(x => x.textContent.trim() === 'This screen did not draw');
          return h ? ((h.parentElement.querySelector('.sub') || {}).textContent || '').trim() : '';
        }, id);
        if (threw) {
          /* REPORTED THROUGH `rows` LIKE EVERY OTHER FINDING, not counted here. § */
          rows.push({ width, id: label, as: who.as, drawFailed: threw });
          await putBack();
          continue;
        }

        await settled(page);
        /* WHATEVER COLUMN IT IS IN — see `veiledOnGlass`. Before the rest, so what they measure is the
           glass with its widgets drawn. */
        const veil = await veiledOnGlass(page);
        slotsOnGlass[width] = (slotsOnGlass[width] || 0) + veil.n;
        runningBeside[width] = (runningBeside[width] || 0) + (veil.beside || 0);
        if (veil.left.length) rows.push({ width, id: label, as: who.as, unstarted: veil.left });
        if ((veil.off || []).length) rows.push({ width, id: label, as: who.as, offGlass: veil.off });
        const { found, counted, guessed, edgeN } = await page.evaluate(inspect,
          { MIN_TAP, MIN_CONTRAST, MIN_CONTRAST_BIG, screenId: id,
            RUN_CLS: ACCEPTED_TAP.filter(a => a.run).map(a => a.cls.source), LADDER: ZOOM_LADDER });
        if (guessed) console.warn(`  ! #s-${id} not found at ${width}px — fell back to guessing `
                                + `which pane is in front, so this row may be measuring the wrong thing.`);

        /* COUNTED IN THE REPORT, NOT HERE. § */
        rows.push({ width, id: label, as: who.as, counted, guessed, ...found });

        /* ---------- THE PICTURES ARE DRAWN AS THEY WERE TAKEN § */
        const tinted = await page.evaluate(sid => {
          const host = document.getElementById('s-' + sid);
          if (!host) return [];
          const pics = [...host.querySelectorAll('.post img, .post video, .post-preview img, '
                                                + '.post-preview video, .reel video')]
            .filter(el => /\bpost-(pic|cell)\b/.test(el.className) || el.classList.contains('feed-vid'));
          const out = [];
          pics.forEach(el => {
            const st = getComputedStyle(el);
            const mask = st.maskImage || st.webkitMaskImage || 'none';
            if (st.filter !== 'none' || mask !== 'none') {
              out.push(`${el.tagName.toLowerCase()}.${el.className.split(/\s+/)[0]} is drawn through `
                       + (st.filter !== 'none' ? `filter ${st.filter.slice(0, 60)}` : `a mask`)
                       + ` rather than as it was taken`);
            }
          });
          if (sid === 'feed' && !pics.length) out.push('the feed drew no post picture to measure');
          if (sid === 'reel' && !pics.length) out.push('the reel column drew no clip to measure');
          return out;
        }, id);
        if (tinted.length) rows.push({ width, id: label, as: who.as, tinted });

        /* ---------- THE REELS' SOUND TILE, MEASURED ON THE PICTURE IT SITS ON § */
        const sound = await page.evaluate(({ sid, minTap }) => {
          const host = document.getElementById('s-' + sid);
          const out = [];
          let n = 0, hitN = 0;
          if (!host || sid !== 'reel') return { out, n, hitN };
          const rgba = s => {
            const m = /rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)(?:\s*[\/,]\s*([\d.]+))?/.exec(s || '');
            return m ? { r: +m[1], g: +m[2], b: +m[3], a: m[4] == null ? 1 : +m[4] } : null;
          };
          const over = (f, g) => ({ r: f.r * f.a + g.r * (1 - f.a), g: f.g * f.a + g.g * (1 - f.a),
                                    b: f.b * f.a + g.b * (1 - f.a), a: 1 });
          const lum = c => {
            const ch = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
            return 0.2126 * ch(c.r) + 0.7152 * ch(c.g) + 0.0722 * ch(c.b);
          };
          const ratio = (p, q) => { const a = lum(p), b = lum(q); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
          const hit = (a, b) => a.left < b.right - 0.5 && b.left < a.right - 0.5 && a.top < b.bottom - 0.5 && b.top < a.bottom - 0.5;
          host.querySelectorAll('.reel').forEach(reel => {
            const art = reel.querySelector('.feed-art');
            const ar = (art || reel).getBoundingClientRect();
            if (!ar.width || !ar.height) return;
            const at = 'reel ' + reel.dataset.reel;
            /* A SLIDE WHOSE WHOLE PAGE IS UNDRAWN IS NOT ASKED. § */
            const slidePage = reel.closest('.page');
            if (slidePage && getComputedStyle(slidePage).visibility === 'hidden') return;
            const el = reel.querySelector('[data-do="reel-sound"]');
            const dead = !!(art && art.classList.contains('is-dead'));
            if (!el) { out.push(`${at} has no Sound control`); return; }
            const st = getComputedStyle(el);
            if (st.display === 'none' || st.visibility === 'hidden') {
              if (!dead) out.push(`${at}: the Sound tile is not drawn on a clip that can play`);
              return;
            }
            n++;
            if (!el.classList.contains('tile') || el.querySelectorAll('svg.tile-i').length !== 1 || el.textContent.trim())
              out.push(`${at}: the Sound control is not a tile with one mark — <${el.tagName.toLowerCase()} class="${el.className}"> "${el.textContent.trim()}"`);
            const r = el.getBoundingClientRect();
            if (r.width < minTap || r.height < minTap) out.push(`${at}: the Sound tile is ${r.width.toFixed(1)}x${r.height.toFixed(1)}, under ${minTap}px`);
            if (r.left < ar.left - 0.5 || r.right > ar.right + 0.5 || r.top < ar.top - 0.5 || r.bottom > ar.bottom + 0.5)
              out.push(`${at}: the Sound tile spills out of its slide — ${[r.left, r.top, r.right, r.bottom].map(Math.round).join(',')} in ${[ar.left, ar.top, ar.right, ar.bottom].map(Math.round).join(',')}`);
            /* ON TOP: what is painted at the tile's centre, asked only where it can be painted at all. */
            let seen = { left: 0, top: 0, right: innerWidth, bottom: innerHeight };
            for (let up = el.parentElement; up && up !== document.documentElement; up = up.parentElement) {
              const us = getComputedStyle(up);
              if (us.overflowX === 'visible' && us.overflowY === 'visible') continue;
              const ur = up.getBoundingClientRect();
              seen = { left: Math.max(seen.left, ur.left), top: Math.max(seen.top, ur.top),
                       right: Math.min(seen.right, ur.right), bottom: Math.min(seen.bottom, ur.bottom) };
            }
            const mx = r.left + r.width / 2, my = r.top + r.height / 2;
            const pg = el.closest('.page');
            const front = !pg || pg.style.pointerEvents !== 'none';
            if (front && mx > seen.left && mx < seen.right && my > seen.top && my < seen.bottom) {
              hitN++;
              const h = document.elementFromPoint(mx, my);
              if (!h || !el.contains(h)) {
                const nm = h ? '<' + h.tagName.toLowerCase() + (h.className && typeof h.className === 'string'
                  ? ' class="' + h.className.trim().split(/\s+/).slice(0, 2).join(' ') + '"' : '') + '>' : 'nothing';
                out.push(`${at}: the Sound tile is not the top thing at its own centre — ${nm} is, so a finger lands there and not on the tile `
                         + (st.pointerEvents === 'none' ? '(the tile refuses presses: pointer-events none)' : '(the tile is drawn under it)'));
              }
            }
            const plate = rgba(st.backgroundColor) || { r: 0, g: 0, b: 0, a: 0 };
            const ink = rgba(st.color);
            [['a white frame', { r: 255, g: 255, b: 255, a: 1 }], ['a black frame', { r: 0, g: 0, b: 0, a: 1 }]].forEach(([nm, g]) => {
              const ground = over(plate, g);
              const k = ink ? ratio(over(ink, ground), ground) : 0;
              if (k < 3) out.push(`${at}: the Sound tile's mark is ${k.toFixed(2)}:1 on ${nm} (needs 3) — ink ${st.color} on plate ${st.backgroundColor}`);
            });
            /* THE ▶ OF A HELD REEL: held for one read, and let go before anything can paint. */
            const was = reel.classList.contains('is-held');
            if (!was) reel.classList.add('is-held');
            const ps = getComputedStyle(reel, '::after');
            const rr = reel.getBoundingClientRect();
            const pw = parseFloat(ps.width) || 0, ph = parseFloat(ps.height) || 0;
            if (!was) reel.classList.remove('is-held');
            const cx = rr.left + rr.width / 2, cy = rr.top + rr.height / 2;
            if (pw && hit(r, { left: cx - pw / 2, right: cx + pw / 2, top: cy - ph / 2, bottom: cy + ph / 2 }))
              out.push(`${at}: the Sound tile overlaps the ▶ a held reel draws`);
            reel.querySelectorAll('.feed-text, .feed-credit, .feed-yt-out').forEach(o => {
              const os = getComputedStyle(o);
              const orc = o.getBoundingClientRect();
              if (os.display === 'none' || !orc.width || !orc.height || !o.textContent.trim()) return;
              if (hit(r, orc)) out.push(`${at}: the Sound tile overlaps .${o.className.split(/\s+/)[0]} "${o.textContent.trim().slice(0, 24)}"`);
            });
          });
          if (!n) out.push('the reel column drew no Sound tile to measure');
          /* NOT WHEN A WIDGET LEADING THE COLUMN IS IN FRONT (414): Videos and One more thing are pages before the first reel. */
          else if (!hitN && !(typeof REEL_LEAD === 'number' && (PAGE.reel || 0) < REEL_LEAD)) out.push('no Sound tile on the reel column was in view to hit-test — the reel in front always has one');
          return { out, n, hitN };
        }, { sid: id, minTap: MIN_TAP });
        soundMeasured += sound.n;
        soundHit += sound.hitN || 0;
        if (sound.out.length) rows.push({ width, id: label, as: who.as, sound: sound.out });

        /* EVERY SQUARE OF EVERY BOARD ONE SIZE — see `BOARDS`. § */
        const boards = await page.evaluate(({ sid, sel, tol }) => {
          const host = document.getElementById('s-' + sid);
          const out = [];
          let n = 0;
          if (!host) return { out, n };
          host.querySelectorAll(sel).forEach(b => {
            const kids = [...b.children];
            if (kids.length < 4) return;
            const sz = kids.map(k => k.getBoundingClientRect());
            if (!sz.some(r => r.width > 0)) return;
            n++;
            const ws = sz.map(r => r.width), hs = sz.map(r => r.height);
            const spread = a => Math.max(...a) - Math.min(...a);
            if (spread(ws) > tol || spread(hs) > tol) {
              const name = b.id ? '#' + b.id : '.' + String(b.className).split(/\s+/)[0];
              const odd = sz.filter(r => Math.abs(r.height - Math.max(...hs)) > tol
                                      || Math.abs(r.width - Math.max(...ws)) > tol).length;
              out.push(`${name}: ${odd} of ${kids.length} squares are not the board's size — `
                + `${Math.min(...ws).toFixed(1)}-${Math.max(...ws).toFixed(1)}px wide, `
                + `${Math.min(...hs).toFixed(1)}-${Math.max(...hs).toFixed(1)}px tall`);
            }
          });
          if (sid === 'games' && !n) out.push('the Games column drew no board to measure');
          return { out, n };
        }, { sid: id, sel: BOARDS, tol: BOARD_TOL });
        boardsMeasured += boards.n;
        Object.keys(edgeN || {}).forEach(k => { edgesMeasured[k] = (edgesMeasured[k] || 0) + edgeN[k]; });
        if (boards.out.length) rows.push({ width, id: label, as: who.as, boards: boards.out });

        /* EVERY DRAWN PICTURE ROUND — see `FACE_SEL`. § */
        const faces = await page.evaluate(drawnFaces, { sid: id, sel: FACE_SEL });
        if (faces.length) {
          const shot = async () => (await page.screenshot()).toString('base64');
          const asIs = await shot();
          await page.evaluate(sel => {
            const st = document.createElement('style'); st.id = 'ui-own-clip-lifted';
            st.textContent = sel + ' { overflow: visible !important; }';
            document.head.appendChild(st);
            return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          }, FACE_SEL);
          const lifted = await shot();
          await page.evaluate(() => {
            const st = document.getElementById('ui-own-clip-lifted'); if (st) st.remove();
            return new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          });
          const again = await shot();
          const cut = await page.evaluate(facesCut, { shots: [asIs, lifted, again], faces });
          facesMeasured += faces.length;
          if (cut.length) rows.push({ width, id: label, as: who.as, faceCut: cut.map(f =>
            `${f.name} (${f.where}, ${f.w.toFixed(1)}px) loses ${f.cut} pixels of its circle to its own box`) });
        } else if (/^your picture/.test(state.name || '')) {
          rows.push({ width, id: label, as: who.as, faceCut: ['the picker drew no picture fully on the glass to measure'] });
        }

        /* EVERY LOADER ON THE PAGE IN FRONT — see `loadersOn`. A state that holds a request and
           shows NO loader is a selector or a state that stopped reaching its subject, and says so. */
        const loaders = await page.evaluate(loadersOn, id);
        const lFound = [];
        loaders.forEach(l => {
          if (l.role !== 'status' || l.label !== 'Loading' || l.n !== 3) {
            lFound.push(`the loader on ${l.where} is not the one loader — role ${l.role}, label ${l.label}, ${l.n} dots`);
          }
          if (new Set(l.dot).size > 1) lFound.push(`the loader on ${l.where} has dots of ${[...new Set(l.dot)].join(' and ')}`);
          if (!l.ref) lFound.push('`loading_()` could not be drawn on the page to measure the loader against');
          else if (l.dot[0] !== l.ref.dot || Math.abs(l.gap - l.ref.gap) > 0.5) {
            lFound.push(`the loader on ${l.where} has dots of ${l.dot[0]} ${l.gap}px centre to centre, where \`loading_()\` `
                      + `draws ${l.ref.dot} ${l.ref.gap}px — a loader dressed for one card`);
          }
          if (Math.abs(l.inX) > LOADER_TOL || Math.abs(l.inY) > LOADER_TOL) {
            lFound.push(`the dots on ${l.where} are ${l.inX}px across and ${l.inY}px down from the middle of their box`);
          }
          if (Math.abs(l.onCard) > LOADER_TOL) lFound.push(`the loader on ${l.where} is ${l.onCard}px off the middle of its card`);
          (loaderSizes[width] = loaderSizes[width] || []).push({ at: label, dot: l.dot[0], gap: l.gap });
        });
        if (state.release && !loaders.length) lFound.push('the state holds its request and no loader is on the page in front');
        loadersMeasured += loaders.length;
        if (lFound.length) rows.push({ width, id: label, as: who.as, loaders: lFound });

        if (SHOTS) await page.screenshot({
          path: path.join(__dirname, 'shots',
            `${id}${state.name ? '-' + state.name.replace(/\s+/g, '-') : ''}`
            + `-${width}${who.as === 'in' ? '-in' : ''}.png`) });

        /* ---------- AND WHEN WHAT IT WAITED FOR LANDS, THE CARD DOES NOT MOVE § */
        if (state.release && loaders.length) {
          const before = loaders[0].cardH;
          await page.evaluate(src => { try { (0, eval)('(' + src + ')')(); } catch (e) {} }, String(state.release));
          const after = await page.evaluate(async ({ sid, landed }) => {
            const t0 = performance.now();
            let ok = false;
            for (;;) {
              try { ok = !!(0, eval)('(' + landed + ')')(); } catch (e) { ok = false; }
              if (ok || performance.now() - t0 > 3000) break;
              await new Promise(r => setTimeout(r, 100));
            }
            await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
            const host = document.getElementById('s-' + sid);
            let at = 0;
            try { at = domIndex_(sid, PAGE[sid] || 0); } catch (e) { at = 0; }
            const pages = host ? host.querySelectorAll(':scope > .page') : [];
            const front = pages.length ? pages[Math.max(0, Math.min(pages.length - 1, at))] : host;
            const card = front && (front.querySelector(':scope > .pane') || front);
            /* A LOADER STILL DRAWN, not one still in the markup: the camera's panel is `hidden` with its
               loader inside it once the picture is up, which is a loader nobody can see. */
            return { ok, h: card ? +card.getBoundingClientRect().height.toFixed(1) : 0,
                     left: front ? [...front.querySelectorAll('.loading')].filter(l => l.getClientRects().length
                                     && getComputedStyle(l).visibility !== 'hidden').length : 0 };
          }, { sid: id, landed: String(state.landed || (() => true)) });
          const lAfter = [];
          if (!after.ok) lAfter.push('what the state held was let go and never landed — `landed` did not come true in 3s');
          if (after.left) lAfter.push(`the content landed and ${after.left} loader(s) are still on the card`);
          /* A STATE THAT SAYS IT `grows` IS A LIST WHOSE LENGTH IS NOT KNOWN UNTIL IT LANDS (the Videos card): § */
          if (after.ok && state.grows && after.h < before - 2) {
            lAfter.push(`the card was ${before}px with the loader on it and ${after.h}px once its list landed — `
                      + `it shrank ${(before - after.h).toFixed(1)}px, so the loader was holding room nothing filled`);
          } else if (after.ok && !state.grows && Math.abs(after.h - before) > 2) {
            lAfter.push(`the card was ${before}px with the loader on it and ${after.h}px once its content landed — `
                      + `it moved ${(after.h - before).toFixed(1)}px when nothing should have`);
          }
          heldReleased++;
          if (lAfter.length) rows.push({ width, id: label, as: who.as, loaders: lAfter });
        }

        /* ---------- PUT IT BACK, BECAUSE THE NEXT STATE IS THE SAME PAGE § */
        await putBack();
      }
    }

    /* ---------- EVERY COLUMN'S CARD STARTS ON THE SAME LINE § */
    await settled(page);
    const ragged = await page.evaluate(() => {
      const offs = [];
      const sc = document.getElementById('screen');
      if (!sc) return null;
      const box = sc.getBoundingClientRect(), mid = box.top + box.height / 2;
      document.querySelectorAll('.screen').forEach(s => {
        const id = s.id.slice(2);
        const pages = s.querySelectorAll(':scope > .page');
        if (!pages.length) return;
        let at = 0;
        try { at = domIndex_(id, PAGE[id] || 0); } catch (e) { at = 0; }
        const cur = pages[Math.max(0, Math.min(pages.length - 1, at))];
        if (!cur) return;
        const r = cur.getBoundingClientRect();
        if (r.height >= box.height) return;
        offs.push({ id, off: +(r.top + r.height / 2 - mid).toFixed(1) });
      });
      if (!offs.length) return null;
      const worst = offs.reduce((a, b) => Math.abs(a.off) >= Math.abs(b.off) ? a : b);
      return { by: Math.abs(worst.off), worst, n: offs.length };
    });
    if (ragged && ragged.by > 2) rows.push({ width, id: '—', as: who.as, ragged });

    /* ---------- THE DOCUMENT MUST NOT SCROLL § */
    const docScroll = await page.evaluate(() => {
      const se = document.scrollingElement || document.documentElement;
      const over = se.scrollHeight - se.clientHeight;
      if (over <= 0) return null;
      /* WHAT STICKS OUT, because a number with nothing to look at is a fault nobody can act on. § */
      const past = [];
      document.querySelectorAll('body > *').forEach(el => {
        const st = getComputedStyle(el);
        if (st.display === 'none' || st.position === 'fixed') return;
        const r = el.getBoundingClientRect();
        past.push({ what: el.tagName.toLowerCase() + (el.id ? '#' + el.id : ''),
                    h: Math.round(r.height) });
      });
      const bs = getComputedStyle(document.body);
      return { over: Math.round(over), h: se.scrollHeight, vh: se.clientHeight,
               pad: bs.paddingTop + ' / ' + bs.paddingBottom,
               kids: past.map(k => k.what + ' ' + k.h + 'px').join(', ') };
    });
    if (docScroll) rows.push({ width, id: '—', as: who.as, docScroll });

    if (jsErrors.length) {
      failures += jsErrors.length;
      rows.push({ width, id: '—', as: who.as, jsErrors });
    }
    await page.close();
  }
  }

  await browser.close();
  server.close();

  /* ---------- THE REPORT § */
  const bucket = {};
  const add = (kind, key, where, why) => {
    const k = kind + '\u0000' + key;
    (bucket[k] = bucket[k] || { kind, key, where: [], why }).where.push(where);
  };
  /* A KIND ENDING IN "(known)" IS IN ONE OF THE ACCEPTED LISTS: printed in full, with its reason,
     and not counted against the run. Everything else fails. */
  const isKnown = kind => / \(known\)$/.test(kind);

  for (const name of deadVars()) {
    failures++;
    add('DEAD CSS VAR', name + ' is used in a bare var() and nothing anywhere sets it', 'source');
  }

  /* WHERE A FAULT WAS SEEN NOW SAYS WHO WAS LOOKING. § */
  for (const r of rows) {
    if (r.skipped) continue;
    const at = `${r.id}@${r.width}${r.as === 'in' ? ' signed in' : ''}`;
    (r.jsErrors || []).forEach(e => add('JS ERROR', e,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`));
    /* NOT GROUPED UNDER A SCREEN NAME, because it is not about one: the place is the width and the
       visitor, and the finding names the two columns furthest apart so there is something to look
       at rather than a number. */
    /* LIKE THE ONE BELOW IT, NOT GROUPED UNDER A SCREEN: the document belongs to no column. */
    if (r.docScroll) add('THE DOCUMENT SCROLLS',
      `the page is ${r.docScroll.h}px tall inside a ${r.docScroll.vh}px viewport, so the whole app `
      + `can be scrolled by ${r.docScroll.over}px — body padding ${r.docScroll.pad}, `
      + `children ${r.docScroll.kids}`,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`);
    if (r.ragged) add('COLUMNS OUT OF LINE',
      `the current card is not on the middle of the screen across ${r.ragged.n} columns — `
      + `${r.ragged.worst.id}'s centre is ${r.ragged.worst.off}px from it`,
      `${r.width}px${r.as === 'in' ? ' signed in' : ''}`);
    /* THE SCREEN NEVER DREW. Grouped like the rest so one broken card across four widths and two
       visitors is one line to fix rather than eight, and so it is counted exactly once. */
    if (r.drawFailed) add('SCREEN DID NOT DRAW', r.drawFailed, at);
    (r.tinted || []).forEach(f => add('PICTURE NOT AS TAKEN', f, at));
    (r.boards || []).forEach(f => add('BOARD SQUARES OF MORE THAN ONE SIZE', f, at));
    (r.faceCut || []).forEach(f => add('A DRAWN PICTURE CUT BY ITS OWN BOX', f, at));
    (r.loaders || []).forEach(f => add('A WAIT THAT IS NOT THE ONE LOADER, OR MOVES ITS CARD', f, at));
    (r.sound || []).forEach(f => add('THE REELS\' SOUND TILE ON ITS PICTURE', f, at));
    (r.unstarted || []).forEach(f => add('A WIDGET ON THE GLASS NEVER STARTED',
      `${f} still holds the loader that stands for "not started", 3s after the screen settled`, at));
    (r.offGlass || []).forEach(f => add('A WIDGET OFF THE GLASS STARTED',
      `${f} is running beside the column in front, 3s after the screen settled`, at));
    (r.floating || []).forEach(f => add('A POP-UP: SOMETHING FLOATS OVER THE APP (420)', f, at));
    (r.overflow || []).forEach(o => add('SIDEWAYS SCROLL',
      `${o.tag}.${o.cls.split(/\s+/)[0] || ''} overflows by ${o.by}px`, at));
    (r.hidden || []).forEach(o => add(o.tol ? 'OUT OF REACH, INSIDE THE APP\'S OWN FLOOR (known)'
                                             : 'OUT OF REACH',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} hides ${o.by}px below its own fold`, at,
      o.tol ? `A PANE THIS CLOSE TO FITTING IS LEFT CLIPPED ON PURPOSE, and the number is `
            + `\`PANE_REACH\` in find.js — ${o.floor}px, read out of the page rather than written `
            + `here, so the app and this rule cannot drift apart about one question. Below it the `
            + `competing gesture is the app's whole navigation: \`scrollHost_\` would take a swipe `
            + `to move the card by a few pixels and the page would not turn, which reads as a swipe `
            + `that did nothing. THE CONTENT REALLY IS UNREACHABLE and that is why this prints `
            + `rather than staying silent — under a line of text on a card whose own design is the `
            + `only thing that can win it back.`
            : undefined));
    /* A SEPARATE HEADING FROM THE ONE ABOVE, DELIBERATELY. § */
    /* A SEPARATE HEADING AGAIN, AND FOR THE SAME REASON: this is not a box that is too big or in
       the wrong place, it is a box in the wrong COLUMN, and the repair is always the card's grid
       rather than the element. */
    (r.strays || []).forEach(o => add('FIELD OUT OF ITS COLUMN',
      `.${o.col} ${o.edge} edge varies by ${o.by}px down one card — "${o.hi}" against "${o.lo}"`, at));
    (r.offscreen || []).forEach(o => add('PANE OFF THE SCREEN',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} (${o.height}px) sits ${o.by}px outside the viewport`, at));
    (r.lifted || []).forEach(o => add('PANE LIFTED OVER THE PAD (known)',
      `.pane holding ${o.cls.split(/\s+/)[0] || o.tag} (${o.height}px) has its top ${o.by}px above the glass`, at,
      `THE KEYPAD'S LIFT (\`kpLift_\`, keypad.js): with the pad up the column goes up by what the box being `
      + `typed in is short of, as a phone's own keyboard pushes a page; an essay's sheet is tall, so the `
      + `question goes above the glass while the sheet, its tiles and the line being typed are above the pad `
      + `(docs/history/312). Counted only when that box is whole on the glass; the pad put away puts it back.`));
    (r.shrunk || []).forEach(o => add('CARD DRAWN SMALLER TO FIT (known)',
      `.${o.cls || 'card'} at ${Math.round(o.z * 100)}%`, at,
      `ASKED FOR: "I don't like scrolling. If you need to leave things more compact or smaller font. `
      + `This goes for all widgets so they all fit on screen." \`paneReach_\` in find.js draws a card `
      + `taller than its pane at .875 or .75 (533, D3), never with its words under 11px or a tile under 36px, `
      + `and scrolls past that. Its controls are judged above at their own size, and this line is how many `
      + `cards pay it and by how much.`));
    /* THE LADDER (533, D3): a card is drawn at full size, .875 or .75 and nothing between. */
    (r.offLadder || []).forEach(o => add('A ZOOM OFF THE LADDER',
      `.${o.cls} is drawn at ${o.z}, not one of ${ZOOM_LADDER.join(', ')}`, at));
    /* THE TOOLS ARE DRAWN AT FULL SIZE where the pane can hold them (533, D4): the calculator's rows are sized from the pane instead. */
    if (/^tools\b/.test(r.id) && (r.width === 390 || r.width === 1280)) (r.shrunk || []).forEach(o => add('A TOOL DRAWN SMALLER',
      `.${o.cls} at ${o.z} on Tools — at ${r.width}px a tool fits its pane at full size`, at));
    (r.tinyTargets || []).forEach(t => {
      const ok = ACCEPTED_TAP.find(a => a.cls.test(t.cls || '') && (!a.onCardEdit || t.onCardEdit));
      /* A REASON THAT NAMES A RUN IS HELD TO IT (533): `run` is the pixels down the middle a finger really has, measured by `elementFromPoint`. */
      if (ok && ok.run && t.run != null) {
        runsMeasured++;
        if (t.run < ok.run - 0.5) add('TAP TARGET SHORTER THAN ITS REASON SAYS',
          `<${t.tag}>.${t.cls} ${JSON.stringify(t.text)} has a ${t.run}px run down its middle; its ACCEPTED_TAP reason says ${ok.run}`, at);
      }
      add(ok ? 'TAP TARGET (known)' : 'TAP TARGET',
        `<${t.tag}>${t.cls ? '.' + t.cls : ''} ${JSON.stringify(t.text)} is ${t.w}x${t.h}`, at,
        ok && ok.why);
    });
    (r.edges || []).forEach(e => add('EDGE',
      `${e.sel} ${JSON.stringify(e.name)} ${e.ratio}:1 against what is behind it (needs 3) — face ${e.face}, `
      + `edge ${e.line}, on ${e.bg}`, at));
    (r.lowContrast || []).forEach(c => add('CONTRAST',
      `${JSON.stringify(c.text)} ${c.ratio}:1 (needs ${c.need}) ${c.fg} on ${c.bg}`, at));
    (r.noName || []).forEach(n => add('NO NAME',
      `<${n.tag}>${n.cls ? '.' + n.cls : ''}${n.act ? ` [${n.act}]` : ''} has no text, label, `
      + `aria-label, title or placeholder — a screen reader has nothing to say about it`, at));
  }

  const checked = rows.filter(r => !r.skipped && r.id !== '—').length;
  console.log(`\nchecked ${checked} screen/width/visitor combinations `
            + `(${screens.reduce((n, id) => n + statesOf(id).length, 0)} screen states x `
            + `${SIZES.length} sizes (${SIZES.map(([w, h]) => w + 'x' + h).join(', ')}) x `
            + `${VISITORS.length} visitors: ${VISITORS.map(v => v.as === 'in' ? 'signed in'
                                                                : 'signed out').join(' and ')})\n`);
  console.log(`boards measured square by square: ${boardsMeasured}\n`);
  console.log(`accepted small targets whose run down the middle was measured against their reason: ${runsMeasured}\n`);
  if (!runsMeasured && !ONLY && !PART.length) add('TAP TARGET SHORTER THAN ITS REASON SAYS',
    'no accepted target that names a run was ever measured, so no reason was held to its number', 'the whole run');
  console.log(`reel Sound tiles measured on their picture (a tile, ${MIN_TAP}px, inside the slide, 3:1 on white and on black, clear of the ▶): ${soundMeasured}, `
              + `${soundHit} of them in view and hit-tested at their centre (the top thing there is the tile)\n`);
  console.log(`drawn pictures photographed for a cut edge: ${facesMeasured}\n`);
  /* ONE DOT SIZE AND ONE GAP PER WIDTH, across every loader the run met. */
  Object.keys(loaderSizes).forEach(wd => {
    const kinds = [...new Set(loaderSizes[wd].map(x => x.dot + ' gap ' + x.gap))];
    if (kinds.length > 1) {
      add('A WAIT THAT IS NOT THE ONE LOADER, OR MOVES ITS CARD',
        `${loaderSizes[wd].length} loaders at ${wd}px come in ${kinds.length} sizes: `
        + kinds.map(k => k + ' (' + loaderSizes[wd].filter(x => x.dot + ' gap ' + x.gap === k).map(x => x.at)[0] + ')').join(', '),
        `${wd}px`);
    }
  });
  console.log(`loaders measured: ${loadersMeasured}, ${heldReleased} of them held on a request, let go, and the card `
            + `measured again · whole pages waiting on a held payload, measured and let go: ${wholePagesHeld} · `
            + `sizes per width: ${Object.keys(loaderSizes).map(wd => wd + ' '
              + [...new Set(loaderSizes[wd].map(x => x.dot + '/' + x.gap))].join(',')).join(' · ') || 'none'}\n`);
  console.log(`widget slots on the glass asked whether they had started: `
            + (Object.keys(slotsOnGlass).map(wd => `${wd} ${slotsOnGlass[wd]}`).join(', ') || 'none') + '\n');
  console.log(`widgets running beside the column in front asked whether their slot was on the glass: `
            + (Object.keys(runningBeside).map(wd => `${wd} ${runningBeside[wd]}`).join(', ') || 'none') + '\n');
  console.log(`edges measured against what is behind them (WCAG 1.4.11, 3:1): `
            + Object.keys(edgesMeasured).map(k => `${k} ${edgesMeasured[k]}`).join(', ') + '\n');
  /* A SUBJECT THE RULE NEVER REACHED IS NOT A PASS. § */
  if (screens.indexOf('stuff') >= 0) {
    Object.keys(edgesMeasured).filter(k => !edgesMeasured[k]).forEach(k =>
      add('EDGE', `${k} was never on the screen — the rule was NOT asked of it`, 'stuff'));
  }

  /* EVERY FINDING THAT IS NOT KNOWN IS A FAILURE, counted once per distinct fault rather than once per place it was seen — the same 38px button on nine screens is § */
  failures += Object.values(bucket).filter(b => !isKnown(b.kind)).length;

  const kinds = [...new Set(Object.values(bucket).map(b => b.kind))].filter(k => !isKnown(k));
  const known = [...new Set(Object.values(bucket).map(b => b.kind))].filter(isKnown);

  const printKind = kind => {
    const items = Object.values(bucket).filter(b => b.kind === kind);
    console.log(`${kind}  (${items.length})`);
    for (const it of items.slice(0, 60)) {
      const w = it.where;
      const at = w.length > 4 ? `${w.slice(0, 3).join(', ')} +${w.length - 3} more` : w.join(', ');
      console.log(`   ${it.key}\n      at ${at}`);
    }
    if (items.length > 60) console.log(`   …and ${items.length - 60} more`);
    console.log('');
  };

  /* THE SUMMARY MUST NOT OVERSTATE ITSELF — the same rule `check-payload.js` learned when it printed "everything the site reads, the backend sends" three lines § */
  if (!kinds.length) {
    console.log(known.length
      ? '  nothing NEW to report. The known ones are below, each with its reason.\n'
      : '  nothing to report.\n');
  } else {
    for (const kind of kinds) printKind(kind);
  }

  /* THE KNOWN ONES, AFTER the ones that fail, so the list that needs doing is at the top — and in full rather than as a count, with the reason printed once under § */
  for (const kind of known) {
    printKind(kind);
    const why = [...new Set(Object.values(bucket).filter(b => b.kind === kind)
                                                 .map(b => b.why).filter(Boolean))];
    why.forEach(w => console.log('   why: ' + w.replace(/(.{92}) /g, '$1\n        ') + '\n'));
  }

  const skipped = rows.filter(r => r.skipped);
  if (skipped.length) {
    console.log(`not reachable: ${[...new Set(skipped.map(s => s.id))].join(', ')}\n`);
  }

  if (!failures) console.log('OK — ' + (known.length ? 'nothing NEW to report' : 'nothing to report')
    + (skipped.length ? '; ' + new Set(skipped.map(s => s.id)).size + ' state(s) not reachable (-v names them)' : '') + '.');
  process.exit(failures ? 1 : 0);
})().catch(err => { console.error('check/ui.js fell over:', err); process.exit(2); });
