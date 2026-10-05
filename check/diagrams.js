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

     node check/diagrams.js                    every drawing, at 320px
     node check/diagrams.js --width=390        the same at another width
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
/* 320 because it is the narrowest phone still in use, and the width `check/cards.js` and
   `check/ui.js` both open on. The drawing is `min(100%, 20rem)` wide, so at 320 it is about 270px
   across a 340-unit viewBox and a 13px label is drawn at about 10px — the size a person reads it. */
const WIDTH = Number(arg('width', 320));
/* ---------- THE PORT IS OPTIONAL, AND ZERO WHEN NOBODY NAMES ONE ---------------------------------
   Every browser check here takes its own port from the environment because several worktrees run
   the suite on one machine at once, and two checks on one port is one of them dying on EADDRINUSE.
   This one goes a step further: unset, it asks the OS for a free port (`listen(0)`), so a worker who
   has never heard of `DIAGRAMS_PORT` cannot collide with anyone. Set it to pin one. */
const PORT_WANTED = Number(process.env.DIAGRAMS_PORT || 0);
const SHOTS = arg('shots', '');
const ROWS = arg('rows', '').split(',').map(s => s.trim()).filter(Boolean);

/* ---------- THE TOLERANCE IS HALF A PIXEL, ON THE PHONE, AND HERE IS WHY ---------------------------
   A collision is ink of a stroke reaching INTO the ink box of a glyph by more than this. Three
   things make the true answer fuzzy and all three are under a pixel:
     - anti-aliasing: a stroke's edge is a half-covered pixel either side of its geometric edge;
     - the box is a rectangle and a glyph is not — P's lower right, 7's lower left, an italic's
       slant all leave corners of the box empty, so a box overlap of a fraction of a pixel is very
       often no overlap of ink at all;
     - the font: this machine's `serif` is DejaVu Serif, which is WIDER and TALLER than the Times
       (iOS) or Noto Serif (Android) a phone draws these labels in, so every box here is already an
       envelope of the one on a phone. That makes this check strict in the right direction: a label
       that clears a line here clears it there.
   Half a pixel is below anything a person can see as touching, and above the rounding. The same
   number serves the label-against-label and inside-the-box questions, for the same reasons. */
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
   EMPTY, AND IT SHOULD STAY THAT WAY: the convention above (a knockout under the label) is the way
   to put a label on a line, and moving the label is the way to take one off it. An entry is
   `'ROW|label text': 'reason'`; it is still printed on every run, so a forgiven collision is never
   a silent one. A key that matches nothing is reported as stale, because a reason for a fault that
   no longer exists is a sentence somebody will trust about the wrong drawing. */
const ACCEPTED = {
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
      svg.querySelectorAll('text').forEach(t => {
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
        texts.push({ t, order: order.get(t), boxes, screen, env, inv: m.inverse(), s: scale(m),
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
        if (!w || pen > w.px) worst.set(k, { kind: 'stroke', label: tx.label, other: say(sh.el), px: pen, box: tx.env });
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
          if (px > o.tol) res.found.push({ kind: 'label', label: A.label, other: '"' + C.label + '"', px, box: A.env });
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
        if (px > o.tol) res.found.push({ kind: 'viewbox', label: tx.label, other: 'the viewBox', px, box: tx.env });
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
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });

  /* IN BATCHES, so one page is an ordinary page and a drawing's gradient ids meet few neighbours. */
  const BATCH = 60;
  const results = [];
  for (let i = 0; i < list.length; i += BATCH) {
    const chunk = list.slice(i, i + BATCH);
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div style="width:${WIDTH}px">${chunk.map((d, k) => cardHtml(d, i + k)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    results.push(...await page.evaluate(inspect, { tol: TOL, ink: INK, opaque: OPAQUE }));
  }

  /* ---------- THE NUMBERS FIRST, so a run that measured nothing cannot read as a clean one -------- */
  const svgs = results.length;
  const texts = results.reduce((a, r) => a + r.texts, 0);
  const chars = results.reduce((a, r) => a + r.chars, 0);
  const guessed = results.reduce((a, r) => a + r.guessed, 0);
  const samples = results.reduce((a, r) => a + r.samples, 0);
  console.log('');
  console.log(`${list.length} drawing cell(s) read — ` + Object.keys(files).map(f => `${files[f]} in data/${f}`).join(', ')
            + ` — holding ${svgs} <svg>, laid out at ${WIDTH}px`);
  console.log(`${texts} label(s), ${chars} glyph box(es), ${samples} stroke sample(s) near a label`
            + (guessed ? `; ${guessed} glyph(s) measured by their advance box because their characters could not be matched` : ''));
  if (!svgs || !texts) {
    console.log('\nnot one label was measured — this check cannot see its subject, which is not a pass');
    process.exit(1);
  }

  const found = [];
  results.forEach(r => r.found.forEach(f => found.push(Object.assign({ key: list[r.i].key + (r.n ? ' (svg ' + (r.n + 1) + ')' : ''),
                                                                         row: list[r.i].key, file: list[r.i].file }, f))));
  const used = new Set();
  const fresh = found.filter(f => {
    const k = f.row + '|' + f.label;
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
      + `${f.px.toFixed(1)}px${k === 'viewbox' ? ' past the viewBox' : ''}`));
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
    for (const d of want) {
      await page.setContent(
        `<!doctype html><meta charset="utf-8">
         <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
         <body style="margin:0;background:#0b0b0b">
           <div style="width:${WIDTH}px">${cardHtml(d, 0)}</div>
         </body>`, { waitUntil: 'load' });
      await page.evaluate(() => document.fonts.ready);
      /* EACH FINDING RINGED IN RED on the picture, so a person looking at it sees what was
         measured rather than hunting for it. A drawing with nothing found is drawn untouched. */
      const marks = (await page.evaluate(inspect, { tol: TOL, ink: INK, opaque: OPAQUE }))
        .reduce((a, r) => a.concat(r.found), []);
      await page.evaluate(ms => ms.forEach(m => {
        const d = document.createElement('div');
        d.style.cssText = 'position:absolute;pointer-events:none;outline:1px solid #f33;'
          + `left:${m.box.x0 + scrollX - 1}px;top:${m.box.y0 + scrollY - 1}px;`
          + `width:${m.box.x1 - m.box.x0 + 2}px;height:${m.box.y1 - m.box.y0 + 2}px`;
        document.body.appendChild(d);
      }), marks);
      const fig = await page.$('figure');
      const name = d.key.replace(/[^A-Za-z0-9_-]+/g, '_') + '-' + WIDTH + '.png';
      await fig.screenshot({ path: path.join(SHOTS, name) });
    }
    console.log(`\n${want.length} picture(s) written to ${SHOTS}`);
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
