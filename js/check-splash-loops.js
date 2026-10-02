#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-splash-loops.js

   THE LOADING SPLASHES THAT WERE REBUILT AS ONE SEAMLESS LOOP, READ OFF THE FILES.

   ASKED FOR AS "refine the pythagoras animation", "refine the pi circle animation. make it better."
   and "refine indicies loading animation". All three had the same three faults, measured on the
   real page before anything was changed:

     A WIPE ON THE SUBJECT   Pythagoras ran a dash 12 long round a triangle 12 long, so once every
                             2.6s the triangle the proof is about vanished.
     A SNAP AT THE SEAM      the indices' second group jumped 22px and the × popped back in one
                             frame at 100% → 0%, because two keyframes had no return leg.
     TWO CLOCKS              the indices counted the tiles on one timeline and joined them on
                             another, so the last two lit up after the groups had parted again.

   And a fourth that only the circle had: a cross-fade, so nothing ever MOVED from the circle into
   the strip, which is the whole argument.

   `npm run splash` cannot catch any of these. It asks whether the picture changes between frames,
   and a wipe, a snap and a cross-fade all change the picture. They are properties of the
   keyframes, so this reads the keyframes:

     · every animation in the splash is infinite and has the splash's one duration — ONE timeline,
       so nothing can drift out of step and index.html's replay loop never restarts half of it;
     · every keyframe it uses ends where it began (the 0% and 100% stops say the same thing, or
       neither is written), so the loop has no seam;
     · only `transform` and `opacity` move — the compositor's two, which keep moving while the
       main thread parses the app;
     · nothing in it draws with a dash, which is how the triangle was wiped;
     · reduced motion turns every one of those animations off;
     · the drawing is centred in its viewBox and inside it, so it sits over its caption and nothing
       is clipped at 320 wide.

   Then each splash has its own sentence, below, for the one thing that makes it that proof.

     node js/check-splash-loops.js
================================================================================================== */
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');

/* ---------- WHICH SPLASHES, AND WHAT EACH ONE PROMISES -------------------------------------------
   A LIST, BECAUSE THESE ARE THE ONES BUILT TO THIS STANDARD. The other splashes in the pool were
   written before it and several deliberately hold or fade; holding them to a seam they never
   promised would fill this report with red nobody asked for, and a red nobody reads is how a new
   one gets in. A splash joins the list when it is rebuilt to the standard. */
const LOOPS = [
  { id: 'pyth', prefix: 'py-', centreOn: ['py-edge'],
    own: pythOwn_ },
  { id: 'area', prefix: 'ar-', centreOn: ['ar-ring', 'ar-slot'],
    own: areaOwn_ },
];

let faults = [], said = [];
const fault = (id, s) => faults.push('#splash-' + id + '  ' + s);

let html, css;
try {
  html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
} catch (e) {
  /* A CHECK THAT CANNOT REACH ITS SUBJECT SAYS SO AND EXITS NON-ZERO. */
  console.log('COULD NOT RUN — index.html or style.css is missing: ' + e.message);
  process.exit(1);
}

/* ---------- THE STYLESHEET, READ AS BLOCKS --------------------------------------------------------
   A small brace walker rather than a regex: a regex that stops at the first `}` reads the first
   STOP of a keyframes block as the whole block, which is the fault check-css.js records twice.
   Comments are blanked first, keeping their newlines, so a brace in prose is not a brace. */
const bare = css.replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '));
const rules = [];          // { sel, decls: {prop: val}, media }
const frames = {};         // name -> [{ keys: [0..100], decls }]
(function walk(src, media) {
  let i = 0;
  while (i < src.length) {
    const open = src.indexOf('{', i);
    if (open < 0) break;
    const head = src.slice(i, open).trim().replace(/\s+/g, ' ');
    let depth = 1, j = open + 1;
    while (j < src.length && depth) { if (src[j] === '{') depth++; else if (src[j] === '}') depth--; j++; }
    const body = src.slice(open + 1, j - 1);
    const decls_ = b => {
      const out = {};
      b.split(';').forEach(d => { const k = d.indexOf(':'); if (k > 0) out[d.slice(0, k).trim()] = d.slice(k + 1).trim().replace(/\s+/g, ' '); });
      return out;
    };
    if (/^@keyframes\s/.test(head)) {
      const name = head.split(/\s+/)[1];
      const stops = [];
      const re = /([^{}]+)\{([^{}]*)\}/g; let m;
      while ((m = re.exec(body))) {
        const keys = m[1].split(',').map(k => k.trim()).map(k => k === 'from' ? 0 : k === 'to' ? 100 : parseFloat(k));
        stops.push({ keys, decls: decls_(m[2]) });
      }
      frames[name] = stops;
    } else if (/^@(media|supports)/.test(head)) {
      walk(body, head);
    } else if (!head.startsWith('@')) {
      rules.push({ sel: head, decls: decls_(body), media });
    }
    i = j;
  }
})(bare, '');

const isStill = r => /prefers-reduced-motion:\s*reduce/.test(r.media);
const parts = sel => sel.split(',').map(s => s.trim());

/* ---------- THE MARKUP OF ONE SPLASH -------------------------------------------------------------
   From its opening tag to the `</div>` at the splash's own indent — the same boundary the
   generators in tools/ replace, so this reads exactly what they write. */
function markup_(id) {
  const a = html.indexOf('<div id="splash-' + id + '"');
  if (a < 0) return null;
  const b = html.indexOf('\n  </div>', a);
  return b < 0 ? null : html.slice(a, b);
}

/* ---------- THE CORNERS OF A PATH ----------------------------------------------------------------
   Absolute M, L, H, V and the endpoints of A — what the generators write. An arc's bulge is not
   counted, so a box built from these can only be smaller than the drawing, never larger: the
   centring test asks about the frame the generator drew to centre on, which is straight-sided. */
function pathPoints_(d) {
  const pts = [];
  const tok = d.match(/[MLHVAZmlhvaz]|-?\d*\.?\d+(?:e-?\d+)?/g) || [];
  let cmd = '', x = 0, y = 0, k = 0;
  while (k < tok.length) {
    const t = tok[k];
    if (/[A-Za-z]/.test(t)) { cmd = t; k++; if (/[Zz]/.test(cmd)) continue; }
    const n = () => parseFloat(tok[k++]);
    if (cmd === 'M' || cmd === 'L') { x = n(); y = n(); }
    else if (cmd === 'H') x = n();
    else if (cmd === 'V') y = n();
    else if (cmd === 'A') { n(); n(); n(); n(); n(); x = n(); y = n(); }
    else { k++; continue; }                      // a relative command: not written here, skipped
    pts.push([x, y]);
  }
  return pts;
}

for (const L of LOOPS) {
  const m = markup_(L.id);
  if (!m) { fault(L.id, 'is not in index.html — the check cannot reach it'); continue; }

  const mine = rules.filter(r => parts(r.sel).some(p => p.includes('#splash-' + L.id) || p.includes('.' + L.prefix)));
  if (!mine.length) { fault(L.id, 'has no rules in style.css with .' + L.prefix + ' — nothing to read'); continue; }

  /* ---- A DASH IS A WIPE. Pythagoras's triangle was erased by one. ---- */
  mine.filter(r => !isStill(r)).forEach(r => Object.keys(r.decls).forEach(p => {
    if (/^stroke-dash/.test(p)) fault(L.id, r.sel + ' sets ' + p + ' — a dash moving round an outline is a wipe that erases it');
  }));

  /* ---- ONE TIMELINE, AND IT NEVER ENDS ---- */
  const durations = new Set(), animated = [];
  mine.filter(r => !isStill(r)).forEach(r => {
    const a = r.decls.animation || r.decls['animation-name'];
    if (!a || a === 'none') return;
    animated.push(r);
    /* SPLIT AT THE TOP-LEVEL COMMAS ONLY: `cubic-bezier(.55, 0, .3, 1)` has three of its own, and
       splitting there read one animation as four, three of them nameless. */
    a.split(/,(?![^(]*\))/).forEach(one => {
      const words = one.trim().split(/\s+/);
      const name = words.find(w => frames[w]);
      if (!name) { fault(L.id, r.sel + ' names an animation with no @keyframes: ' + one.trim()); return; }
      const infinite = words.includes('infinite') || r.decls['animation-iteration-count'] === 'infinite';
      if (!infinite) fault(L.id, r.sel + ' runs ' + name + ' a finite number of times — a piece that stops is a piece out of step, and the replay loop never restarts a splash with anything endless in it');
      const dur = words.find(w => /^\d*\.?\d+m?s$/.test(w)) || r.decls['animation-duration'];
      durations.add(dur);
      const stops = frames[name];
      /* ---- TRANSFORM AND OPACITY ONLY ---- */
      stops.forEach(s => Object.keys(s.decls).forEach(p => {
        if (!['transform', 'opacity', 'animation-timing-function'].includes(p))
          fault(L.id, '@keyframes ' + name + ' animates ' + p + ' — only transform and opacity keep moving while the main thread parses the app');
      }));
      /* ---- THE SEAM: 100% SAYS WHAT 0% SAID ---- */
      const at = key => { const o = {}; stops.filter(s => s.keys.includes(key)).forEach(s => Object.assign(o, s.decls)); delete o['animation-timing-function']; return o; };
      const a0 = at(0), a1 = at(100);
      const props = new Set([...Object.keys(a0), ...Object.keys(a1)]);
      props.forEach(p => {
        if (a0[p] !== a1[p]) fault(L.id, '@keyframes ' + name + ' ends with ' + p + ': ' + (a1[p] || '(the base value)')
          + ' but starts with ' + (a0[p] || '(the base value)') + ' — the loop snaps at 100% → 0%');
      });
    });
  });
  if (!animated.length) fault(L.id, 'animates nothing — a loading screen that holds still reads as an app that has died');
  if (durations.size > 1) fault(L.id, 'runs on ' + durations.size + ' clocks (' + [...durations].join(', ')
    + ') — two durations drift apart over a long load, which is how the indices counted after they had parted');

  /* ---- REDUCED MOTION IS THE FINISHED STILL ---- */
  const off = new Set();
  mine.filter(isStill).forEach(r => { if (/^none\b/.test(r.decls.animation || '')) parts(r.sel).forEach(p => off.add(p)); });
  animated.forEach(r => parts(r.sel).forEach(p => {
    if (!off.has(p)) fault(L.id, p + ' still moves under prefers-reduced-motion — the reduced rule must name it with animation: none');
  }));

  /* ---- CENTRED, AND INSIDE ITS BOX ---- */
  const vb = (m.match(/viewBox="([^"]+)"/) || [])[1];
  if (vb && L.centreOn) {
    const [vx, vy, vw, vh] = vb.split(/[\s,]+/).map(Number);
    const pts = [];
    const re = /<(path|line|circle|rect)\b([^>]*)>/g; let e;
    while ((e = re.exec(m))) {
      const cls = (e[2].match(/class="([^"]+)"/) || [])[1] || '';
      if (!L.centreOn.some(c => cls.split(/\s+/).includes(c))) continue;
      const at = n => { const q = e[2].match(new RegExp('\\s' + n + '="([^"]+)"')); return q ? parseFloat(q[1]) : 0; };
      if (e[1] === 'path') pts.push(...pathPoints_((e[2].match(/\sd="([^"]+)"/) || [])[1] || ''));
      if (e[1] === 'line') pts.push([at('x1'), at('y1')], [at('x2'), at('y2')]);
      if (e[1] === 'circle') { const r = at('r'); pts.push([at('cx') - r, at('cy') - r], [at('cx') + r, at('cy') + r]); }
      if (e[1] === 'rect') pts.push([at('x'), at('y')], [at('x') + at('width'), at('y') + at('height')]);
    }
    if (!pts.length) fault(L.id, 'has nothing with class ' + L.centreOn.join(' or ') + ' to centre on — the check cannot measure it');
    else {
      const xs = pts.map(p => p[0]), ys = pts.map(p => p[1]);
      const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
      const off_ = ((x0 + x1) / 2 - (vx + vw / 2)) / vw;
      /* ONE PER CENT OF THE WIDTH is about 2.4px on a 320 phone — under what anybody sees, and well
         under the 9px Pythagoras sat off its caption and the 44px the circle did. */
      if (Math.abs(off_) > .01) fault(L.id, 'is drawn ' + (off_ * 100).toFixed(1) + '% of its width off the centre of its viewBox — it will sit to one side of its caption');
      if (x0 < vx || x1 > vx + vw || y0 < vy || y1 > vy + vh) fault(L.id, 'reaches outside its viewBox (' + [x0, y0, x1, y1].map(v => +v.toFixed(2)).join(' ') + ' against ' + vb + ') — clipped');
    }
  }

  if (L.own) L.own(L, m, mine);
  said.push('#splash-' + L.id + ': ' + animated.length + ' animated rules, ' + [...durations].join('/') + ' timeline');
}

/* ---------- PYTHAGORAS: THE CELLS ARE COUNTED ------------------------------------------------------
   9 cells from the square on the short leg and 16 from the long one, and between them they land on
   25 DIFFERENT places — so the big square is filled exactly, with no slot covered twice and none
   left empty. If two cells shared a --to, the picture would show 25 in the sum over a square with a
   hole in it, and only somebody counting would notice. */
function pythOwn_(L, m) {
  const cells = [...m.matchAll(/<rect class="py-cell (py-[ab])"[^>]*--from: ([^;]+); --to: ([^;]+);/g)];
  const a = cells.filter(c => c[1] === 'py-a').length, b = cells.filter(c => c[1] === 'py-b').length;
  if (a !== 9 || b !== 16) fault(L.id, 'has ' + a + ' + ' + b + ' cells; 3² + 4² is 9 + 16');
  const to = new Set(cells.map(c => c[3])), from = new Set(cells.map(c => c[2]));
  if (to.size !== 25) fault(L.id, 'its cells land on ' + to.size + ' different places, not 25 — the big square would have a hole');
  if (from.size !== 25) fault(L.id, 'its cells start from ' + from.size + ' different places, not 25');
  if (/class="py-tri"[^>]*style=/.test(m) || rules.some(r => parts(r.sel).includes('.py-tri') && r.decls.animation))
    fault(L.id, 'animates the triangle — the triangle is the subject, and the last thing that moved it erased it');
}

/* ---------- THE CIRCLE: THE SLICES TRAVEL, AND THE HALVES ARE THE EDGES ---------------------------
   THE OLD ONE CROSS-FADED, so the first sentence is that every slice has somewhere different to be
   at the end from where it was at the start, and the slices' keyframes move them rather than fade
   them. The second is the colour coding the proof rests on: every gold slice lands arc-up (no
   turn) and every teal one arc-down (half a turn), the same number of each — so the strip's top
   edge is the gold half of the circle and nothing else, which is what makes "πr" true of it. */
function areaOwn_(L, m) {
  const sl = [...m.matchAll(/<path class="ar-sl (ar-top|ar-bot)"[^>]*--from: ([^;]+); --to: ([^;]+);/g)];
  if (!sl.length) { fault(L.id, 'has no .ar-sl slices with a --from and a --to — nothing travels'); return; }
  sl.forEach((s, k) => { if (s[2] === s[3]) fault(L.id, 'slice ' + k + ' ends where it starts — it does not travel'); });
  const top = sl.filter(s => s[1] === 'ar-top'), bot = sl.filter(s => s[1] === 'ar-bot');
  if (top.length !== bot.length) fault(L.id, top.length + ' gold slices and ' + bot.length + ' teal — the halves must match');
  top.forEach(s => { if (!/rotate\(0deg\)$/.test(s[3])) fault(L.id, 'a gold slice lands turned (' + s[3] + ') — the gold arcs must be the top edge'); });
  bot.forEach(s => { if (!/rotate\(180deg\)$/.test(s[3])) fault(L.id, 'a teal slice lands as ' + s[3] + ' — the teal arcs must be the bottom edge'); });
  if (new Set(sl.map(s => s[3])).size !== sl.length) fault(L.id, 'two slices land in the same place');
  const fly = rules.find(r => r.sel === '.ar-sl' && !isStill(r));
  const name = fly && (fly.decls.animation || '').split(/\s+/).find(w => frames[w]);
  if (!name) fault(L.id, '.ar-sl has no animation — the slices do not move');
  else if (frames[name].some(st => 'opacity' in st.decls)) fault(L.id, '@keyframes ' + name + ' fades the slices — a cross-fade is the fault this replaced');
}

console.log('\nTHE SPLASHES THAT ARE ONE SEAMLESS LOOP  (' + LOOPS.length + ')');
said.forEach(s => console.log('  ' + s));
if (faults.length) {
  console.log('\nFAULTS  (' + faults.length + ')');
  faults.forEach(f => console.log('  ' + f));
  process.exit(1);
}
console.log('\nOK — every one loops without a seam, on one clock, moving only transform and opacity, centred.');
