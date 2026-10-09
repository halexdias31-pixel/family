#!/usr/bin/env node
/* ==================================================================================================
   @family. — check/diagrams.js

   EVERY LABEL IN EVERY DRAWING, AGAINST EVERY LINE AND EVERY OTHER LABEL IN IT.

   REPORTED BY THE OWNER, TUTORING FROM IT: *"the Venn diagram was a bit off. Like P and Q was
   clashing with lines."* June 2024 Foundation Paper 1, Q23. The set letters sat at (97.2, 47.2) and
   (240.5, 46.7) — on the rims of two circles of radius 64.3 — so each letter had a circle running
   through it. A printed exam paper puts a Venn's letters OUTSIDE their circles, by the upper-left
   and upper-right, and nothing in this repository could tell the difference.

   NOTHING COULD, AND EACH CHECK WAS RIGHT ABOUT WHAT IT ASKS. `check/cards.js` measures whether a
   card fits its column and whether a label is painted outside its own `<svg>` — a letter on a rim
   is inside the column and inside the box. `check/ui.js` measures screens. A drawing's labels
   against its own lines is a third question and it had no instrument, so every one of the 334
   drawings in the data files was laid out by a person looking at it, once, at whatever width
   they happened to look at.

   SO THIS ASKS THREE THINGS OF EVERY `<text>` IN EVERY INLINE DRAWING IN `data/*.json`:

     1. does any inked stroke run through its glyphs
     2. do its glyphs overlap another label's
     3. are its glyphs inside the drawing's own viewBox

   THE GLYPHS, NOT THE TEXT BOX. `getBBox()` on a `<text>` is the font's whole line — ascent to
   descent, advance to advance — so a capital P carries an empty descender under it and a number set
   just above a line "touches" it with nothing but air. Every character is measured on its own, with
   the canvas `measureText` of the font that character is actually drawn in, which gives the INK box
   (`actualBoundingBox*`) — and placed at the browser's own position for that character
   (`getStartPositionOfChar`), so `text-anchor`, `dy` on a `<tspan>` and a `transform="rotate(...)"`
   on an axis caption all land where they are drawn. Everything is compared in SCREEN pixels, through
   each element's own CTM, at the width a phone shows — so the tolerance below is a number on a
   phone and not a number in a viewBox somebody would have to scale in their head.

   EVERY DATA FILE, NOT ONE. It reads every `data/*.json` and takes any string cell carrying an
   `<svg`, so the next file to grow drawings is measured the day it does rather than the day
   somebody remembers this list. Today that is `questions.json` and `practicals.json`.

     node check/diagrams.js                    every drawing, at 320 and 390px, 3x
     node check/diagrams.js --width=360        one width alone
     node check/diagrams.js --dpr=2            …or another pixel density (3 by default)
     node check/diagrams.js --face="DejaVu Serif"   …or another serif, standing in for Android's
     node check/diagrams.js --shots=DIR        a PNG of every drawing with a finding, into DIR
     node check/diagrams.js --shots=DIR --rows=A,B   …or of these rows, finding or not
================================================================================================== */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const arg = (name, or) => {
  const a = process.argv.find(x => x.startsWith('--' + name + '='));
  return a ? a.slice(name.length + 3) : or;
};
/* ---------- 320 AND 390, AND THE SECOND ONE IS NOT FOR SHOW -------------------------------------
   320 because it is the narrowest phone still in use, and the width `check/cards.js` and
   `check/ui.js` both open on. The drawing is `min(100%, 20rem)` wide, so at 320 it is about 270px
   across a 340-unit viewBox and a 13px label is drawn at about 10px — the size a person reads it.

   390 because a drawing's geometry scales but its type does not quite: the glyphs are hinted at
   whatever size they land, so a label clear by a fraction of a pixel at one width can touch at
   another. MEASURED THE DAY THIS WAS WRITTEN — with every finding at 320 fixed, 390 still named
   one label, 360 another and 414 a third, each at exactly the half-pixel line. Two widths is not a
   proof for every phone; it is the narrowest one and the commonest one, and a label has to clear
   both. `--width=` measures one width alone. */
const WIDTHS = arg('width', '') ? [Number(arg('width', ''))] : [320, 390];
/* ---------- THE PORT IS OPTIONAL, AND ZERO WHEN NOBODY NAMES ONE ---------------------------------
   Every browser check here takes its own port from the environment because several worktrees run
   the suite on one machine at once, and two checks on one port is one of them dying on EADDRINUSE.
   This one goes a step further: unset, it asks the OS for a free port (`listen(0)`), so a worker who
   has never heard of `DIAGRAMS_PORT` cannot collide with anyone. Set it to pin one. */
const PORT_WANTED = Number(process.env.DIAGRAMS_PORT || 0);
const DPR = Number(arg('dpr', 3));
const FACE = arg('face', '');
const SHOTS = arg('shots', '');
const ROWS = arg('rows', '').split(',').map(s => s.trim()).filter(Boolean);

/* ---------- THE TOLERANCE IS HALF A PIXEL, ON THE PHONE, AND HERE IS WHY ---------------------------
   A collision is ink of a stroke reaching INTO the ink box of a glyph by more than this. Three
   things make the true answer fuzzy and all three are under a pixel:
     - anti-aliasing: a stroke's edge is a half-covered pixel either side of its geometric edge;
     - the box is a rectangle and a glyph is not — P's lower right, 7's lower left, an italic's
       slant all leave corners of the box empty, so a box overlap of a fraction of a pixel is very
       often no overlap of ink at all;
     - sub-pixel placement: the same label lands a fraction of a pixel differently at 320 and 390,
       and a rule that flips on that is measuring the rounding rather than the drawing.
   Half a pixel is below anything a person can see as touching, and above the rounding. The same
   number serves the label-against-label and inside-the-box questions, for the same reasons.

   AND THE FONT IS NAMED, BECAUSE IT DECIDES THE ANSWER. Chromium here resolves `serif` to Liberation
   Serif, which has Times New Roman's metrics — what an iPhone draws these labels in, and what every
   drawing in the library was laid out against (see the note over `.qsheet .lbl` in style.css).
   Android's `serif` is Noto Serif, which is wider. `--face="DejaVu Serif"` measures a face of about
   that width: on 5 October 2026 it found 381 collisions in 136 drawings where Times found 124 in
   55, and after those 124 were cleared it still finds 304, 116 of them a word running out of its
   own box — the 183 the stylesheet note records for a monospace face, smaller.
   That is a decision about the drawings' font, not about where a label sits, so it is printed by
   that flag and not failed by this run. */
const TOL = 0.5;
/* ---------- A STROKE IS INK WHEN AT LEAST HALF OF IT IS PAINTED ----------------------------------
   THE GRAPH PAPER IS NOT A LINE A LABEL CAN CLASH WITH. `.grid` is `stroke-width: .4; opacity: .3`
   — the printed squares of the paper — and an exam paper writes on squared paper all the time: a
   point's letter, a line's equation, a region's R. What the reader sees is faint ruling under the
   word, the same as on paper. So a stroke counts by how much of it is PAINTED — opacity down the
   ancestor chain × `stroke-opacity` × the colour's own alpha — and anything under one half is
   paper rather than drawing. That is a rule about what is on the screen, not a list of classes, so
   a faint construction line drawn without `.grid` is judged the same way and a `.grid` someone
   darkens to 0.8 starts being checked. */
const INK = 0.5;
/* AN OPAQUE FILL HIDES WHAT IS UNDER IT, and this repository already uses that on purpose: a tick
   number on a graph sits on a small `fill: var(--raised)` rectangle painted after the grid and
   before the number, so the line is knocked out under the digits (`Q-1MA1-1706-3H-13` is the
   first). That is the convention for a label that must sit ON a line, and it is honoured by asking
   what is painted rather than by naming rows: a stroke sample is dropped when a later element's
   fill covers that point with at least this much alpha. */
const OPAQUE = 0.9;

/* ---------- ACCEPTED — labels that do touch a line, each with one written reason -----------------
   SHORT, AND IT SHOULD STAY THAT WAY: the convention above (a knockout under the label) is the way
   to put a label on a line, and moving the label is the way to take one off it. An entry is
   `'ROW|label text|the line, as the report names it': 'reason'` — the LINE as well, so forgiving
   one ruling does not forgive the same label landing on a curve next week. It is still printed on
   every run, so a forgiven collision is never a silent one. A key that matches nothing is reported
   as stale, because a reason for a fault that no longer exists is a sentence somebody will trust
   about the wrong drawing.

   THE ONE KIND HERE IS A LABEL THAT NO POSITION CAN CLEAR. The AQA 7408/3A key reads "experiment
   1" and "experiment 2" beside two sample lines, and each label is about 63 units long on graph
   paper whose major squares are 45.7 — so wherever it sits it crosses a major ruling, and it cannot
   leave the square it is in because the sample line it names is part of the drawing. The printed
   paper puts its key on a white box, which is the knockout convention, and adding one is a change
   to the drawing rather than to where a label sits. Left for the owner, named here so it is not
   forgotten: one `fill: var(--raised)` rect behind the key in each of the two rows clears all four. */
const KEY_ON_PAPER = 'a 63-unit key label on 45.7-unit major squares crosses a ruling wherever it sits, '
  + 'and its sample line is drawing so it cannot leave the square: needs a knockout box behind the key';
const ACCEPTED = {
  'Q-AQA-7408-2306-3A-034|experiment 1|line (280.3,14)-(280.3,224)': KEY_ON_PAPER,
  'Q-AQA-7408-2306-3A-034|experiment 2|line (280.3,14)-(280.3,224)': KEY_ON_PAPER,
  'Q-AQA-7408-2306-3A-035|experiment 1|line (280.3,14)-(280.3,224)': KEY_ON_PAPER,
  'Q-AQA-7408-2306-3A-035|experiment 2|line (280.3,14)-(280.3,224)': KEY_ON_PAPER,
};

function diagrams() {
  const out = [];
  const files = {};
  fs.readdirSync(path.join(ROOT, 'data')).filter(f => f.endsWith('.json')).sort().forEach(f => {
    let rows;
    try { rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8')); } catch (e) {
      console.log('check/diagrams.js: data/' + f + ' does not parse — ' + e.message);
      process.exit(1);
    }
    if (!Array.isArray(rows)) return;
    rows.forEach((r, i) => {
      if (!r || typeof r !== 'object') return;
      /* A TEXTBOOK ANIMATION IS NOT A FIGURE OF THIS KIND, and measured as one it is wrong by
         hundreds of pixels. Since 9 Oct the teaching animations are rows of data/textbooks.json
         (`anim`), and each carries its own `css` — the font size of its labels in its own viewBox
         units among it. Drawn here inside `.qsheet` without that stylesheet, the Bayes tree's
         "have it, test +" came out at the card's text size in a 100-unit box: "242.4px past the
         viewBox", on a drawing that is whole on the screen. `check/anims.js` draws every one with its
         own CSS, inside its card, at several moments and as its reduced-motion still — that is the
         instrument for these. */
      if (f === 'textbooks.json' && r.anim) return;
      Object.keys(r).forEach(k => {
        const v = r[k];
        if (typeof v !== 'string' || v.indexOf('<svg') === -1) return;
        /* A ROW'S OWN NAME, whichever column carries it, and `#stem` on a preamble so it reads the
           way `check/cards.js` names the same figure. */
        const id = r.row_id || r.practical_id || r.id || (f + ':' + i);
        const key = id + (r.kind === 'preamble' ? '#stem' : '') + (k === 'diagram' ? '' : '.' + k);
        /* THE WRAPPER THE APP DRAWS IT IN — `.gd` round a practical's figure (`practicalPart_` in
           find.js), `.qsheet` round a question's (`questionFigCard_`). The label rules are written
           once for both selectors, but a drawing measured in the wrong wrapper is measured against a
           stylesheet that could one day differ. */
        const wrap = f === 'practicals.json' ? 'gd' : 'qsheet';
        out.push({ file: f, key, field: k, svg: v, wrap });
        files[f] = (files[f] || 0) + 1;
      });
    });
  });
  return { list: out, files };
}

function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const f = path.join(ROOT, decodeURI(rq.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rs.writeHead(404); return rs.end();
      }
      const type = { '.css': 'text/css', '.js': 'text/javascript',
                     '.json': 'application/json', '.html': 'text/html' }[path.extname(f)]
                 || 'text/plain';
      rs.writeHead(200, { 'content-type': type });
      rs.end(fs.readFileSync(f));
    });
    srv.listen(PORT_WANTED, () => done(srv));
  });
}

/* `--face` OVER THE STYLESHEET'S SERIF, for the one question it answers: what a wider face does. */
const faceCss = () => (FACE ? '<style>figure svg text, figure svg tspan { font-family: '
  + JSON.stringify(FACE) + ' !important; }</style>' : '');
/* THE CARD A FIGURE IS DRAWN ON, with the classes the app gives it, so the stylesheet under test is
   the one deciding how wide the drawing is and what size its labels are. */
function cardHtml(d, i) {
  return d.wrap === 'gd'
    ? `<div class="card fc prac prac-part is-fig" data-i="${i}"><div class="gd"><figure>${d.svg}</figure></div></div>`
    : `<div class="qcard qfig" data-i="${i}"><div class="qsheet"><figure>${d.svg}</figure></div></div>`;
}

/* ==================================================================================================
   THE MEASUREMENT. It runs inside the page, takes one plain argument and closes over nothing.
================================================================================================== */
function inspect(o) {
  const SKIP = { defs: 1, clipPath: 1, mask: 1, marker: 1, pattern: 1, symbol: 1,
                 linearGradient: 1, radialGradient: 1 };
  const SHAPES = 'line, polyline, polygon, path, circle, ellipse, rect';
  const canvas = document.createElement('canvas').getContext('2d');
  const alpha = c => {
    const m = /rgba?\(([^)]*)\)/.exec(c || '');
    if (!m) return 1;
    const p = m[1].split(/[\s,\/]+/).filter(Boolean);
    return p.length > 3 ? parseFloat(p[3]) : 1;
  };
  const rgb = c => { const m = /rgba?\(([^)]*)\)/.exec(c || ''); return m ? m[1].split(/[\s,\/]+/).slice(0, 3).join(',') : c; };
  const apply = (m, x, y) => ({ x: m.a * x + m.c * y + m.e, y: m.b * x + m.d * y + m.f });
  const scale = m => Math.sqrt(Math.abs(m.a * m.d - m.b * m.c));
  /* SIGNED DISTANCE FROM A POINT TO A BOX: positive outside, negative inside by the distance to the
     nearest edge — so a stroke through the middle of a glyph scores deeper than one grazing a
     corner, and the number printed is how far the ink reaches into the letter. */
  const sdist = (q, b) => {
    const dx = Math.max(b.x0 - q.x, q.x - b.x1), dy = Math.max(b.y0 - q.y, q.y - b.y1);
    if (dx <= 0 && dy <= 0) return Math.max(dx, dy);
    return Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  };
  const say = el => {
    const n = el.localName, g = a => el.getAttribute(a);
    if (n === 'line') return `line (${g('x1')},${g('y1')})-(${g('x2')},${g('y2')})`;
    if (n === 'circle') return `circle at (${g('cx')},${g('cy')}) r ${g('r')}`;
    if (n === 'ellipse') return `ellipse at (${g('cx')},${g('cy')})`;
    if (n === 'rect') return `rect at (${g('x')},${g('y')}) ${g('width')}x${g('height')}`;
    if (n === 'path') return 'path ' + String(g('d')).slice(0, 28);
    return n + ' ' + String(g('points')).trim().slice(0, 28);
  };

  const results = [];
  document.querySelectorAll('[data-i]').forEach(card => {
    const idx = Number(card.dataset.i);
    card.querySelectorAll('svg').forEach((svg, svgN) => {
      if (svg.ownerSVGElement) return;          /* the outermost one is the drawing */
      const res = { i: idx, n: svgN, texts: 0, chars: 0, guessed: 0, samples: 0, found: [] };
      results.push(res);
      const all = Array.from(svg.querySelectorAll('*'));
      const order = new Map(all.map((e, k) => [e, k]));
      const skipped = el => {
        for (let e = el; e && e !== svg; e = e.parentNode) if (SKIP[e.localName]) return true;
        return false;
      };
      const opacity = el => {
        let a = 1;
        for (let e = el; e && e.nodeType === 1; e = e.parentNode) {
          a *= parseFloat(getComputedStyle(e).opacity);
          if (e === svg) break;
        }
        return a;
      };

      /* ---------- THE LABELS: one ink box per character, in the text's own coordinates ---------- */
      const texts = [];
      svg.querySelectorAll('text').forEach((t, ti) => {
        if (skipped(t)) return;
        const cs = getComputedStyle(t);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const n = t.getNumberOfChars();
        if (!n) return;
        /* WHICH CHARACTER IS WHICH. The browser numbers the characters it lays out, after collapsing
           white space; walking the text nodes and collapsing the same way gives each number its
           character and the element (a `<tspan>`, maybe smaller, maybe italic) that draws it. When
           the two counts disagree the advance box from `getExtentOfChar` stands in — the font's
           whole height, so a stricter box — and the count of those is printed. */
        const chars = [];
        let prevSpace = true;
        const walk = node => {
          node.childNodes.forEach(c => {
            if (c.nodeType === 3) {
              for (const ch of c.data.replace(/[\t\r\n]/g, ' ')) {
                if (ch === ' ' && prevSpace) continue;
                prevSpace = ch === ' ';
                chars.push({ ch, el: node });
              }
            } else if (c.nodeType === 1) walk(c);
          });
        };
        walk(t);
        while (chars.length && chars[chars.length - 1].ch === ' ') chars.pop();
        const mapped = chars.length === n;
        const boxes = [];
        for (let k = 0; k < n; k++) {
          let b;
          if (mapped) {
            const c = chars[k];
            if (c.ch === ' ') continue;
            const fs = getComputedStyle(c.el);
            canvas.font = `${fs.fontStyle} ${fs.fontWeight} ${fs.fontSize} ${fs.fontFamily}`;
            const m = canvas.measureText(c.ch);
            const p = t.getStartPositionOfChar(k);
            b = { x0: p.x - m.actualBoundingBoxLeft, x1: p.x + m.actualBoundingBoxRight,
                  y0: p.y - m.actualBoundingBoxAscent, y1: p.y + m.actualBoundingBoxDescent };
          } else {
            const e = t.getExtentOfChar(k);
            b = { x0: e.x, x1: e.x + e.width, y0: e.y, y1: e.y + e.height };
            res.guessed++;
          }
          if (!(b.x1 > b.x0 && b.y1 > b.y0)) continue;
          boxes.push(b);
        }
        if (!boxes.length) return;
        const m = t.getScreenCTM();
        /* EACH BOX ON THE SCREEN, as the axis-aligned box round its four corners — exact for the
           unrotated labels and for the quarter-turned axis captions, which are the only two kinds. */
        const screen = boxes.map(b => {
          const ps = [apply(m, b.x0, b.y0), apply(m, b.x1, b.y0), apply(m, b.x0, b.y1), apply(m, b.x1, b.y1)];
          return { x0: Math.min(...ps.map(p => p.x)), x1: Math.max(...ps.map(p => p.x)),
                   y0: Math.min(...ps.map(p => p.y)), y1: Math.max(...ps.map(p => p.y)) };
        });
        const env = screen.reduce((a, b) => ({ x0: Math.min(a.x0, b.x0), x1: Math.max(a.x1, b.x1),
                                               y0: Math.min(a.y0, b.y0), y1: Math.max(a.y1, b.y1) }));
        texts.push({ t, ti, order: order.get(t), boxes, screen, env, inv: m.inverse(), s: scale(m),
                     label: (t.textContent || '').replace(/\s+/g, ' ').trim() });
        res.texts++;
        res.chars += boxes.length;
      });

      /* ---------- THE INK: every painted stroke and every inked fill ---------------------------- */
      const shapes = [];
      svg.querySelectorAll(SHAPES).forEach(el => {
        if (skipped(el)) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const op = opacity(el);
        const sw = cs.stroke !== 'none' ? parseFloat(cs.strokeWidth) || 0 : 0;
        const strokeInk = sw > 0 && op * parseFloat(cs.strokeOpacity) * alpha(cs.stroke) >= o.ink;
        const fillA = cs.fill === 'none' ? 0
          : op * parseFloat(cs.fillOpacity) * (/^url/.test(cs.fill) ? 1 : alpha(cs.fill));
        /* A FILL IS INK WHEN IT IS THE DRAWING'S OWN COLOUR — `currentColor`, the dot on a point,
           the head of an arrow — and painted at least half. Any other opaque fill is a surface
           (the knockout under a tick number, a sky, a sun) and only matters for what it hides. */
        const fillInk = fillA >= o.ink && !/^url/.test(cs.fill) && rgb(cs.fill) === rgb(cs.color);
        const m = el.getScreenCTM();
        const s = scale(m);
        shapes.push({ el, order: order.get(el), m, s, inv: m.inverse(), strokeInk, fillInk,
                      sw: strokeInk ? sw * s / 2 : 0, cover: fillA >= o.opaque,
                      bbox: (() => { const r = el.getBoundingClientRect(); return r; })() });
      });
      const covers = shapes.filter(s => s.cover);
      /* HIDDEN when an element painted LATER fills that point opaquely. Paint order in SVG is
         document order, so "later" is the whole of the rule. */
      const hidden = (sh, p) => covers.some(c => {
        if (c.order <= sh.order) return false;
        const b = c.bbox;
        if (p.x < b.left - 1 || p.x > b.right + 1 || p.y < b.top - 1 || p.y > b.bottom + 1) return false;
        const q = apply(c.inv, p.x, p.y);
        return c.el.isPointInFill(new DOMPoint(q.x, q.y));
      });

      /* ---------- EVERY STROKE AGAINST EVERY LABEL ---------------------------------------------- */
      const worst = new Map();
      const hit = (tx, sh, pen) => {
        const k = texts.indexOf(tx) + '|' + shapes.indexOf(sh);
        const w = worst.get(k);
        if (!w || pen > w.px) worst.set(k, { kind: 'stroke', label: tx.label, other: say(sh.el), px: pen, box: tx.env, ti: tx.ti });
      };
      shapes.forEach(sh => {
        if (!sh.strokeInk && !sh.fillInk) return;
        /* NEAR A LABEL AT ALL? The cheap test first: the shape's painted box against every label's. */
        const b = sh.bbox, pad = sh.sw + o.tol + 1;
        const near = texts.filter(tx => tx.order !== sh.order
          && b.left - pad <= tx.env.x1 && b.right + pad >= tx.env.x0
          && b.top - pad <= tx.env.y1 && b.bottom + pad >= tx.env.y0);
        if (!near.length) return;
        let len = 0;
        try { len = sh.el.getTotalLength(); } catch (e) { len = 0; }
        if (!(len > 0)) return;
        /* EVERY HALF SCREEN PIXEL ALONG IT, so a sample can miss the true nearest point by a quarter
           of a pixel at most — well inside the half-pixel tolerance. */
        const step = Math.max(0.05, 0.5 / sh.s);
        const steps = Math.ceil(len / step);
        for (let k = 0; k <= steps; k++) {
          const lp = sh.el.getPointAtLength(Math.min(len, k * step));
          const p = apply(sh.m, lp.x, lp.y);
          res.samples++;
          const cand = near.filter(tx => p.x >= tx.env.x0 - pad && p.x <= tx.env.x1 + pad
                                      && p.y >= tx.env.y0 - pad && p.y <= tx.env.y1 + pad);
          if (!cand.length) continue;
          if (hidden(sh, p)) continue;
          cand.forEach(tx => {
            const q = apply(tx.inv, p.x, p.y);
            let best = Infinity;
            tx.boxes.forEach(bx => { best = Math.min(best, sdist(q, bx)); });
            const pen = sh.sw - best * tx.s;
            if (pen > o.tol) hit(tx, sh, pen);
          });
        }
      });
      /* AND A LABEL SITTING WHOLLY INSIDE A BLOB OF INK, which no outline sample would reach. */
      texts.forEach(tx => {
        const c = { x: (tx.env.x0 + tx.env.x1) / 2, y: (tx.env.y0 + tx.env.y1) / 2 };
        shapes.forEach(sh => {
          if (!sh.fillInk || sh.order === tx.order) return;
          const q = apply(sh.inv, c.x, c.y);
          if (sh.el.isPointInFill(new DOMPoint(q.x, q.y)) && !hidden(sh, c)) {
            hit(tx, sh, (tx.env.y1 - tx.env.y0) / 2);
          }
        });
      });
      worst.forEach(w => res.found.push(w));

      /* ---------- EVERY LABEL AGAINST EVERY OTHER ----------------------------------------------- */
      for (let a = 0; a < texts.length; a++) {
        for (let c = a + 1; c < texts.length; c++) {
          const A = texts[a], C = texts[c];
          if (A.env.x1 < C.env.x0 || C.env.x1 < A.env.x0 || A.env.y1 < C.env.y0 || C.env.y1 < A.env.y0) continue;
          let px = 0;
          A.screen.forEach(p => C.screen.forEach(q => {
            const ox = Math.min(p.x1, q.x1) - Math.max(p.x0, q.x0);
            const oy = Math.min(p.y1, q.y1) - Math.max(p.y0, q.y0);
            px = Math.max(px, Math.min(ox, oy));
          }));
          if (px > o.tol) res.found.push({ kind: 'label', label: A.label, other: '"' + C.label + '"', px, box: A.env, ti: A.ti, tj: C.ti });
        }
      }

      /* ---------- AND EVERY LABEL INSIDE THE VIEWBOX -------------------------------------------- */
      const vb = svg.viewBox && svg.viewBox.baseVal;
      const sm = svg.getScreenCTM();
      let box;
      if (vb && vb.width) {
        const p0 = apply(sm, vb.x, vb.y), p1 = apply(sm, vb.x + vb.width, vb.y + vb.height);
        box = { x0: Math.min(p0.x, p1.x), x1: Math.max(p0.x, p1.x), y0: Math.min(p0.y, p1.y), y1: Math.max(p0.y, p1.y) };
      } else {
        const r = svg.getBoundingClientRect();
        box = { x0: r.left, x1: r.right, y0: r.top, y1: r.bottom };
      }
      texts.forEach(tx => {
        const px = Math.max(box.x0 - tx.env.x0, tx.env.x1 - box.x1, box.y0 - tx.env.y0, tx.env.y1 - box.y1);
        if (px > o.tol) res.found.push({ kind: 'viewbox', label: tx.label, other: 'the viewBox', px, box: tx.env, ti: tx.ti });
      });
    });
  });
  return results;
}

(async () => {
  const { list, files } = diagrams();
  if (!list.length) {
    console.log('check/diagrams.js: not one inline drawing in data/*.json — this check cannot see its subject, which is not a pass');
    process.exit(1);
  }

  const server = await serve();
  const PORT = server.address().port;
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  /* ---------- AT A PHONE'S PIXEL DENSITY, BECAUSE THE ANSWER MOVES WITH IT ----------------------
     MEASURED, NOT ASSUMED: the same label against the same line came out up to half a pixel apart
     at a device scale of 1 and of 3. Chromium lays SVG text out at the size it will RASTERISE it —
     font size × the drawing's scale × the device's pixel ratio — and hints the advances at that
     size, so where each glyph starts depends on how dense the screen is. A desktop at 1x is not
     what anybody reads these on; every phone in use is 2x or 3x, and 3 is the iPhone this site is
     tutored from. A half-pixel shift is exactly the size of the tolerance, so a check run at 1x
     would pass labels a phone draws touching. */
  /* IN BATCHES, so one page is an ordinary page and a drawing's gradient ids meet few neighbours. */
  const BATCH = 60;
  const results = [];
  for (const W of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: DPR });
    for (let i = 0; i < list.length; i += BATCH) {
      const chunk = list.slice(i, i + BATCH);
      await page.setContent(
        `<!doctype html><meta charset="utf-8">
         <link rel="stylesheet" href="http://localhost:${PORT}/style.css">${faceCss()}
         <body style="margin:0;background:#0b0b0b">
           <div style="width:${W}px">${chunk.map((d, k) => cardHtml(d, i + k)).join('')}</div>
         </body>`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      results.push(...(await page.evaluate(inspect, { tol: TOL, ink: INK, opaque: OPAQUE }))
        .map(r => Object.assign(r, { w: W })));
    }
    await page.close();
  }

  /* ---------- THE NUMBERS FIRST, so a run that measured nothing cannot read as a clean one -------- */
  const first = results.filter(r => r.w === WIDTHS[0]);
  const svgs = first.length;
  const texts = first.reduce((a, r) => a + r.texts, 0);
  const chars = first.reduce((a, r) => a + r.chars, 0);
  const guessed = first.reduce((a, r) => a + r.guessed, 0);
  const samples = results.reduce((a, r) => a + r.samples, 0);
  console.log('');
  console.log(`${list.length} drawing cell(s) read — ` + Object.keys(files).map(f => `${files[f]} in data/${f}`).join(', ')
            + ` — holding ${svgs} <svg>, laid out at ${WIDTHS.join(' and ')}px, ${DPR}x`);
  console.log(`${texts} label(s), ${chars} glyph box(es), ${samples} stroke sample(s) near a label`
            + (guessed ? `; ${guessed} glyph(s) measured by their advance box because their characters could not be matched` : ''));
  if (!svgs || !texts) {
    console.log('\nnot one label was measured — this check cannot see its subject, which is not a pass');
    process.exit(1);
  }

  /* ONE LINE PER COLLISION, NOT PER WIDTH: the same label on the same line at 320 and at 390 is one
     thing to move, printed at its worst and with the widths it was seen at. */
  const merged = new Map();
  results.forEach(r => r.found.forEach(f => {
    const k = [r.i, r.n, f.kind, f.ti, f.tj, f.other].join('|');
    const had = merged.get(k);
    if (had) { had.widths.push(r.w); if (f.px > had.px) had.px = f.px; return; }
    merged.set(k, Object.assign({ key: list[r.i].key + (r.n ? ' (svg ' + (r.n + 1) + ')' : ''),
                                  row: list[r.i].key, file: list[r.i].file, widths: [r.w] }, f));
  }));
  const found = Array.from(merged.values());
  const used = new Set();
  const fresh = found.filter(f => {
    const k = f.row + '|' + f.label + '|' + f.other;
    if (ACCEPTED[k]) { used.add(k); return false; }
    return true;
  });
  const stale = Object.keys(ACCEPTED).filter(k => !used.has(k));

  const KINDS = { stroke: 'A LINE RUNS THROUGH A LABEL', label: 'TWO LABELS OVERLAP',
                  viewbox: 'A LABEL IS PAINTED OUTSIDE ITS DRAWING' };
  const byKind = {};
  fresh.forEach(f => { (byKind[f.kind] = byKind[f.kind] || []).push(f); });
  const bad = new Set(fresh.map(f => f.row));
  console.log(`${fresh.length} collision(s) in ${bad.size} drawing(s)`
            + Object.keys(KINDS).map(k => ` · ${k} ${(byKind[k] || []).length}`).join(''));

  Object.keys(KINDS).forEach(k => {
    const l = (byKind[k] || []).sort((a, b) => b.px - a.px);
    if (!l.length) return;
    console.log('\n' + KINDS[k] + '  (' + l.length + ')');
    l.forEach(f => console.log(`  ${f.key} — "${f.label}" ${k === 'viewbox' ? 'is' : 'and ' + f.other + ' overlap by'} `
      + `${f.px.toFixed(1)}px${k === 'viewbox' ? ' past the viewBox' : ''}`
      + (WIDTHS.length > 1 ? ` (at ${f.widths.join(' and ')})` : '')));
  });
  if (Object.keys(ACCEPTED).length) {
    console.log('\nACCEPTED  (' + Object.keys(ACCEPTED).length + ') — still printed, one reason each');
    Object.keys(ACCEPTED).forEach(k => console.log(`  ${k} — ${ACCEPTED[k]}${used.has(k) ? '' : '  [STALE: matches nothing]'}`));
  }

  /* ---------- PICTURES FOR A PERSON, because a screenshot is the last word on anything drawn ------ */
  if (SHOTS) {
    fs.mkdirSync(SHOTS, { recursive: true });
    const want = ROWS.length ? list.filter(d => ROWS.includes(d.key) || ROWS.includes(d.key.replace(/#stem$/, '')))
                             : list.filter(d => bad.has(d.key));
    /* AT THE SAME DENSITY AS THE MEASUREMENT, so the picture is the layout that was measured — and a
       1x picture of a 10px letter is too coarse to tell a letter touching a line from one beside
       it, which is the only thing these pictures are for. */
    for (const W of WIDTHS) {
      const shot = await browser.newPage({ viewport: { width: W, height: 900 }, deviceScaleFactor: DPR });
      for (const d of want) {
        await shot.setContent(
          `<!doctype html><meta charset="utf-8">
           <link rel="stylesheet" href="http://localhost:${PORT}/style.css">${faceCss()}
           <body style="margin:0;background:#0b0b0b">
             <div style="width:${W}px">${cardHtml(d, 0)}</div>
           </body>`, { waitUntil: 'load' });
        await shot.evaluate(() => document.fonts.ready);
        /* EACH FINDING RINGED IN RED on the picture, so a person looking at it sees what was
           measured rather than hunting for it. A drawing with nothing found is drawn untouched. */
        /* AN ACCEPTED ONE IN AMBER, so the picture of a forgiven collision does not read as a new one. */
        const marks = (await shot.evaluate(inspect, { tol: TOL, ink: INK, opaque: OPAQUE }))
          .reduce((a, r) => a.concat(r.found), [])
          .map(m => Object.assign(m, { ok: !!ACCEPTED[d.key + '|' + m.label + '|' + m.other] }));
        await shot.evaluate(ms => ms.forEach(m => {
          const d = document.createElement('div');
          d.style.cssText = 'position:absolute;pointer-events:none;outline:1px solid ' + (m.ok ? '#fa0' : '#f33') + ';'
            + `left:${m.box.x0 + scrollX - 1}px;top:${m.box.y0 + scrollY - 1}px;`
            + `width:${m.box.x1 - m.box.x0 + 2}px;height:${m.box.y1 - m.box.y0 + 2}px`;
          document.body.appendChild(d);
        }), marks);
        const fig = await shot.$('figure');
        const name = d.key.replace(/[^A-Za-z0-9_-]+/g, '_') + '-' + W + '.png';
        await fig.screenshot({ path: path.join(SHOTS, name) });
      }
      await shot.close();
    }
    console.log(`\n${want.length * WIDTHS.length} picture(s) written to ${SHOTS}`);
  }

  await browser.close();
  server.close();

  if (stale.length) {
    console.log('\nSTALE ACCEPTED ENTRIES  (' + stale.length + ') — a reason for a fault that is not there');
    stale.forEach(k => console.log('  ' + k));
  }
  if (fresh.length || stale.length) {
    console.log('\nFAILED — move the label (its x, y or text-anchor), never the drawing.');
    process.exit(1);
  }
  console.log('\nOK — no label in any drawing touches a line, another label, or the edge of its box.');
  process.exit(0);
})();
