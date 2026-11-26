#!/usr/bin/env node
/* @family. — tools/one-canvas.js THE ONE-CANVAS CHECK (rule 1.75, owner 23 Nov, queue item "ONE DRAWING CANVAS": "most stable and simple for
   kids, practical, uniform"). The eight draw setups (points, graph, line, numline, shape, shade, construct, hand) are one canvas:
   (a) ONE TYPE: data/settings/qengine.json has one type whose face is draw (`draw`), and the Point, Line, Curve, Shade, Compass and Undo
       tiles in its every-button list (shown on every part, greyed where they cannot be used: rule 1.83).
   (b) ONE STORED FORM, EVERY QUESTION FRAMED: every drawn answer's key (`draw_answer`, the words) is the one form (js/find-pen.js
       drawOne_): a frame (grid / line / angle) that resolves on its figure, and pieces that are each a point, a line, a curve or a region
       with a reader; no piece carries a tolerance of its own (the one rule: half a step of the frame); AI only for shape-only sketches.
   (c) TAPPED ON A PHONE AND AN iPAD: a sample of questions from each of the eight old setups, opened as a child sees them, its key drawn by
       a tap-script on the canvas's own tiles (Point taps, Line and Curve drags, Shade taps) and Checked, is marked Right; a wrong drawing
       (one point far from the key) is not.
   --prove breaks each (a second draw type, an old-form key, a piece's own tolerance, a marker that marks nothing right, one that marks
   everything right) and fails unless each break is caught. --shots <dir> saves a phone and an iPad screenshot of a drawn question.
   Fails the build. Run by tools/build.js after `bundle`. */
'use strict';
const fs = require('fs'), path = require('path');
const { ROOT, main } = require('./lib/gen.js');
const SB = require('./lib/site-browser.js');
const DK = require('./lib/draw-key.js');
const SD = require('./lib/site-data.js');

/* THE EIGHT OLD SETUPS, by the reader of a key's first piece: the sample takes questions from each */
const OLD = { points: ['pts'], graph: ['hist', 'box', 'pie', 'sketch', 'area', 'fit'], line: ['segs', 'line', 'pair', 'dir', 'radius', 'angle'],
  numline: ['interval'], shape: ['polygon', 'cuboid'], shade: ['cells', 'inside'], construct: ['curves'], hand: ['clock', 'dial', 'scale'] };
const PER = 2;
/* ONE PEN AND UNDO (owner, 24 Nov): Point, Line, Curve, Shade and Compass are the one Pen, its stroke read on lift */
const TILES = ['qt-pen/pen:pen:Pen', 'pad-undo:undo:Undo'];
const SIZES = { phone: { width: 390, height: 844 }, iPad: { width: 820, height: 1180 } };
const ONLY_SIZE = process.env.CANVAS_SIZE || '';
const AI_MAX = 0.08;

const words = () => SD.privateQuestions();
const qengine = () => SD.json('data/settings/qengine.json');
const status = () => (SD.json('data/question-status.json') || {}).status || {};

/* (a) and (b): the type list and the words */
function dataBad(Q, W) {
  const bad = [], F = DK.form();
  const draw = Object.keys(Q.types).filter(t => Q.types[t].face === 'draw');
  if (draw.join() !== 'draw') bad.push('qengine.json: draw types are ' + JSON.stringify(draw) + ', not one (draw)');
  TILES.forEach(t => { if ((Q.buttons || []).indexOf(t) < 0) bad.push('qengine.json buttons: no ' + t.split(':').pop() + ' tile (' + t + ')'); });
  let n = 0, ai = 0, pieces = 0;
  const frames = {};
  Object.keys(W).forEach(id => {
    const raw = W[id] && W[id].draw_answer;
    if (!raw) return;
    n++;
    if (!DK.isOne(raw)) { bad.push(id + ': draw_answer is not in the one form (node tools/content.js drawkeys --apply)'); return; }
    const d = JSON.parse(raw);
    if (!d.frame || F.DRAW_FRAMES.indexOf(d.frame.is) < 0) { bad.push(id + ': no frame (grid, line or angle)'); return; }
    frames[d.frame.is] = (frames[d.frame.is] || 0) + 1;
    const walk = p => {
      pieces++;
      if (F.DRAW_IS.indexOf(p.is) < 0) bad.push(id + ': a piece is ' + JSON.stringify(p.is) + ', not a point, line, curve or region');
      else if (!F.drawItemOf_(p)) bad.push(id + ': a ' + p.is + ' piece read as ' + JSON.stringify(p.as) + ' has no reader');
      if (p.tol != null) bad.push(id + ': a piece has its own tolerance (' + p.tol + '); the one rule is half a step of the frame');
      if (p.ai) ai++;
      if (p.ai && p.as !== 'sketch') bad.push(id + ': AI asked for a piece that is not a shape-only sketch');
      (p.any || []).forEach(walk); if (p.or) walk(p.or);
    };
    (d.pieces || []).forEach(walk);
    if (!(d.pieces || []).length) bad.push(id + ': a key with no pieces');
  });
  if (n && ai / n > AI_MAX) bad.push(ai + ' of ' + n + ' drawn keys ask for AI, over ' + AI_MAX * 100 + '%');
  return { bad, n, ai, pieces, frames };
}

/* THE SAMPLE: for each old setup, the first PER markable active questions whose first piece it read */
function sampleOf(W, st) {
  const F = DK.form(), out = [];
  Object.keys(OLD).forEach(setup => {
    const ids = Object.keys(W).filter(id => W[id].draw_answer && st[id] === 'ok' && DK.isOne(W[id].draw_answer) && (() => {
      const p = JSON.parse(W[id].draw_answer).pieces[0], it = p && F.drawItemOf_(p.any ? p.any[0] : p);
      return !!it && OLD[setup].indexOf(it.k) >= 0;
    })()).sort();
    /* spread over the list: the first and one from the middle, so one paper does not stand for a setup */
    const pick = ids.length <= PER ? ids : [ids[0], ids[Math.floor(ids.length / 2)]];
    pick.forEach(id => out.push({ setup, id }));
  });
  return out;
}

/* IN THE PAGE: the card drawn as Find draws it, its pen opened by its Curve tile */
async function openCard(pg, id) {
  return pg.evaluate(id => {
    const x = stuffItemsAll_().filter(isQ_).find(x => String((x.row && x.row.row_id) || '') === id);
    if (!x) return { none: 'not in the page' };
    let host = document.getElementById('canvas-check');
    if (!host) { host = document.createElement('div'); host.id = 'canvas-check'; (document.querySelector('#s-' + AT + ' .page.on') || document.querySelector('#s-' + AT) || document.body).prepend(host); }
    host.innerHTML = findCard(x);
    return { key: x.key };
  }, id);
}
/* ONE PEN (owner, 24 Nov): every act is drawn with it, its stroke's shape read on lift (find-pad.js `padRead1_`) */
const tileSel = () => '#canvas-check [data-do="qt-pen"][data-tool="pen"]';
/* THE TAP-SCRIPT: the key's own drawing (DRAW_MARK.example), a piece at a time, as the tiles a child would use for it */
async function scriptOf(pg) {
  return pg.evaluate(() => {
    const pad = document.querySelector('#canvas-check .qpad'), row = pad && (pad.closest('[data-draw]') || document.querySelector('#canvas-check [data-draw]'));
    if (!pad || !row) return { none: 'no canvas on the card' };
    const art = pad.querySelector('.qpad-art > svg:first-child'), fig = drawFig_(art ? (art.__src || art.outerHTML) : '');
    const one = drawOne_(row.getAttribute('data-draw'));
    if (!one) return { none: 'the key is unreadable' };
    const F = DRAW_MARK.frameOf(drawFrameSpec_(one), fig), vb = F.vb, u = p => [(p[0] - vb[0]) / vb[2] * 340, (p[1] - vb[1]) / vb[3] * 340];
    const acts = [];
    /* a stroke of a few straight sides is drawn side by side with Line, as a child rules a shape; a curve with Curve */
    /* a stroke the key draws past the picture's edge is drawn just inside it, where a finger can reach */
    const inside = P => { const sh = [0, 1].map(k => { const lo = Math.min.apply(null, P.map(p => p[k])), hi = Math.max.apply(null, P.map(p => p[k]));
      return lo < 4 ? 4 - lo : hi > 336 ? 336 - hi : 0; }); return P.map(p => [p[0] + sh[0], p[1] + sh[1]]); };
    const strokes = st => st.forEach(s => { let P = []; for (let i = 0; i + 1 < s.length; i += 2) P.push([s[i], s[i + 1]]); P = inside(P);
      if (P.length === 1) acts.push({ tool: 'point', pts: P });
      else if (P.length <= 6) P.slice(1).forEach((q, i) => { if (Math.hypot(q[0] - P[i][0], q[1] - P[i][1]) >= 6) acts.push({ tool: 'line', pts: [P[i], q] }); });
      else acts.push({ tool: 'pen', pts: P }); });
    if (one.eg) strokes(DRAW_MARK.example(one, fig));
    else one.pieces.forEach(p0 => {
      const p = p0.any ? p0.any[0] : p0;
      if (p.is === 'point' && !p.as && Array.isArray(p.at)) { p.at.forEach(q => acts.push({ tool: 'point', pts: [u(F.v(q))] })); return; }
      const st = DRAW_MARK.example(Object.assign({}, one, { pieces: [p] }), fig);
      /* a region of squares is shaded square by square: one Shade tap in each */
      if (p.as === 'cells' && padLattice_(pad, pad.querySelector('.qpad-ink').getBoundingClientRect())) {
        const seen = {};
        const lat = padLattice_(pad, pad.querySelector('.qpad-ink').getBoundingClientRect());
        /* a square shaded with the one pen: a zig-zag across it, as Shade stored it, drawn as one stroke */
        const zig = (x, y) => { const z = padShadeOf_(lat, x, y), out = []; for (let i = 0; i + 3 < z.length; i += 2) for (let t = 0; t < 4; t++) out.push([z[i] + (z[i + 2] - z[i]) * t / 4, z[i + 1] + (z[i + 3] - z[i + 1]) * t / 4]);
          out.push([z[z.length - 2], z[z.length - 1]]); return out; };
        st.forEach(s => { let x = 0, y = 0; const n = s.length / 2; for (let i = 0; i < s.length; i += 2) { x += s[i] / n; y += s[i + 1] / n; }
          const k = Math.round(x / 4) + ',' + Math.round(y / 4); if (!seen[k]) { seen[k] = 1; acts.push({ tool: 'pen', pts: zig(x, y) }); } });
        return;
      }
      strokes(st);
    });
    return { acts, art: !!art, dbg: JSON.stringify({ vb: fig.vb, labels: fig.labels.length, grid: !!fig.grid, F: [F.o, F.u, F.sq], texts: (String(art && (art.__src || art.outerHTML)).match(/<text[^>]*>[^<]*/g) || []).slice(0, 4), arts: pad.querySelectorAll(".qpad-art > svg").length }) };
  });
}
/* A FINGER'S WORTH: the tile tapped, then the ink touched where the script says, in the pad's own 340 units */
/* `tool`: the tile already in hand (tapping it again would put the pen down) */
async function play(pg, acts, held) {
  let tool = held || '';
  for (const a of acts) {
    /* THE ONE PEN, already in hand: every act is a stroke of it */
    const ink = pg.locator('#canvas-check .qpad-ink').first();
    await ink.scrollIntoViewIfNeeded().catch(() => {});
    const r = await ink.boundingBox();
    if (!r) throw new Error('the canvas is not on the screen');
    const at = p => [r.x + p[0] / 340 * r.width, r.y + p[1] / 340 * r.height];
    const P = a.pts.map(at);
    if (P.length === 1) { await pg.mouse.click(P[0][0], P[0][1]); }
    else {
      await pg.mouse.move(P[0][0], P[0][1]); await pg.mouse.down();
      for (let i = 1; i < P.length; i++) await pg.mouse.move(P[i][0], P[i][1], { steps: a.tool === 'line' ? 8 : 2 });
      await pg.mouse.up();
    }
    await pg.waitForTimeout(40);
  }
  return tool;
}
async function verdict(pg) {
  await pg.locator('#canvas-check [data-do="pad-check"]').first().click({ timeout: 5000 });
  await pg.waitForTimeout(250);
  return pg.evaluate(() => { const r = document.querySelector('#canvas-check .is-right, #canvas-check .is-near'), v = document.querySelector('#canvas-check .qp-verdict');
    return { right: !!document.querySelector('#canvas-check .is-right'), said: v ? v.textContent.trim().slice(0, 80) : '', marked: !!r }; });
}
async function clear(pg) {
  /* NO CLEAR TILE ON A QUESTION (owner, 24 Nov): each pad emptied by the pad's own Clear, as the whiteboard's bar still has it */
  await pg.evaluate(() => document.querySelectorAll('#canvas-check .qpad').forEach(p => { const b = document.createElement('i'); b.setAttribute('data-k', p.getAttribute('data-k'));
    p.appendChild(b); try { ACTIONS['pad-clear'](b); } catch (e) { /* an empty pad */ } b.remove(); }));
  await pg.waitForTimeout(100);
}
/* ONE QUESTION: the key drawn is Right, one point far from it is not */
async function tapOne(pg, s, shot) {
  const o = await openCard(pg, s.id);
  if (o.none) return { s, bad: o.none };
  await pg.locator(tileSel('pen')).first().click({ timeout: 5000 }).catch(() => {});
  await pg.waitForTimeout(150);
  const sc = await scriptOf(pg);
  if (sc.none) return { s, bad: sc.none };
  const inHand = await play(pg, sc.acts, 'pen');
  if (process.env.CANVAS_DEBUG) console.log(s.id, sc.dbg, JSON.stringify(sc.acts).slice(0, 300), '\n  stored', await pg.evaluate(() => { const p = document.querySelector('#canvas-check .qpad'); return JSON.stringify(p ? padRead_(p.getAttribute('data-k')) : null).slice(0, 600); }));
  const ok = await verdict(pg);
  if (shot) await pg.locator('#canvas-check').first().screenshot({ path: shot }).catch(() => {});
  await clear(pg);
  /* WRONG: one point at the corner of the canvas furthest from every point of the key */
  const all = [].concat.apply([], sc.acts.map(a => a.pts)), far = [[18, 18], [322, 18], [18, 322], [322, 322]]
    .map(c => ({ c, d: Math.min.apply(null, all.map(p => Math.hypot(p[0] - c[0], p[1] - c[1]))) })).sort((a, b) => b.d - a.d)[0].c;
  await play(pg, [{ tool: 'point', pts: [far] }], inHand);
  const no = await verdict(pg);
  const why = [];
  if (!ok.right) why.push('its key drawn was not marked Right (' + (ok.said || 'no verdict') + '; ' + sc.acts.length + ' taps/drags)');
  if (no.right) why.push('a wrong drawing (one point) was marked Right');
  return { s, bad: why.join('; '), acts: sc.acts.length };
}
async function onSize(size, sample, opts) {
  const pg = await SB.open({ as: 'child', show: 'all', ready: () => typeof stuffItemsAll_ === 'function' && stuffItemsAll_().some(isQ_) });
  try {
    await pg.setViewportSize(SIZES[size]);
    /* the made-up backend's "cannot post" banner is the fixture's, not the child's: it would lie over the canvas */
    await pg.addStyleTag({ content: '#banner{display:none!important}' });
    if (opts.break) await pg.evaluate(b => {
      if (b === 'none') { const m = DRAW_MARK.mark; DRAW_MARK.mark = (s, k, f, n) => { const r = m(s, k, f, n); return r && Object.assign({}, r, { got: 0 }); }; }
      if (b === 'all') { const m = DRAW_MARK.mark; DRAW_MARK.mark = (s, k, f, n) => { const r = m(s, k, f, n); return r && Object.assign({}, r, { got: r.of }); }; }
    }, opts.break);
    const out = [];
    for (const s of sample) {
      const shot = opts.shots && s === sample[0] ? path.join(opts.shots, 'one-canvas-' + size + '.png') : '';
      try { out.push(await tapOne(pg, s, shot)); } catch (e) { out.push({ s, bad: 'could not be tapped (' + String(e.message).split('\n')[0] + ')' }); }
    }
    return { size, out };
  } finally { await pg.close(); }
}
async function tapped(sample, opts) {
  const res = await SB.pool(opts.sizes || (ONLY_SIZE ? [ONLY_SIZE] : Object.keys(SIZES)), 2, size => onSize(size, sample, opts || {}));
  const bad = [];
  res.forEach(r => r.out.filter(o => o.bad).forEach(o => bad.push(r.size + ', ' + o.s.setup + ' ' + o.s.id + ': ' + o.bad)));
  return { bad, res };
}

async function run() {
  const argv = process.argv.slice(2), Q = qengine(), W = words();
  const shotsAt = argv.indexOf('--shots'), shots = shotsAt >= 0 ? argv[shotsAt + 1] : '';
  const d = dataBad(Q, W), sample = sampleOf(W, status()).filter(s => !process.env.CANVAS_ONLY || process.env.CANVAS_ONLY.split(',').includes(s.id));
  const bad = d.bad.slice(0, 40);
  const setups = new Set(sample.map(s => s.setup));
  Object.keys(OLD).forEach(k => { if (!setups.has(k)) bad.push('no markable question from the old ' + k + ' setup to tap'); });
  const t = await tapped(sample, { shots });
  t.bad.forEach(b => bad.push(b));
  if (argv.includes('--prove')) {
    const caught = [];
    const Q2 = JSON.parse(JSON.stringify(Q)); Q2.types.shade2 = Object.assign({}, Q2.types.draw);
    caught.push(['a second draw type', dataBad(Q2, {}).bad.length > 0]);
    const id = Object.keys(W).find(k => W[k].draw_answer), one = JSON.parse(W[id].draw_answer);
    const W2 = { [id]: { draw_answer: JSON.stringify({ items: [{ k: 'pts', at: [[1, 1]] }] }) } };
    caught.push(['an old-form key', dataBad(Q, W2).bad.length > 0]);
    const W3 = { [id]: { draw_answer: JSON.stringify(Object.assign({}, one, { pieces: one.pieces.map(p => Object.assign({}, p, { tol: 0.3 })) })) } };
    caught.push(['a piece with its own tolerance', dataBad(Q, W3).bad.length > 0]);
    const W4 = { [id]: { draw_answer: JSON.stringify(Object.assign({}, one, { frame: {} })) } };
    caught.push(['a key with no frame', dataBad(Q, W4).bad.length > 0]);
    const few = sample.filter((s, i) => i % 4 === 0).slice(0, 4);
    caught.push(['a marker that marks nothing right', (await tapped(few, { sizes: ['phone'], break: 'none' })).bad.length > 0]);
    caught.push(['a marker that marks everything right', (await tapped(few, { sizes: ['iPad'], break: 'all' })).bad.length > 0]);
    caught.forEach(c => console.log('  --prove ' + (c[1] ? 'caught: ' : 'MISSED: ') + c[0]));
    caught.filter(c => !c[1]).forEach(c => bad.push('--prove: ' + c[0] + ' was not caught'));
  }
  const right = t.res.reduce((s, r) => s + r.out.filter(o => !o.bad).length, 0), all = t.res.reduce((s, r) => s + r.out.length, 0);
  console.log('one-canvas: 1 draw type; ' + d.n + ' drawn keys in the one form, every one framed (' + Object.keys(d.frames).map(k => d.frames[k] + ' ' + k).join(', ')
    + '), ' + d.pieces + ' pieces, ' + d.ai + ' AI (shape-only sketches); ' + right + ' of ' + all + ' tap-scripts (' + sample.length + ' questions from '
    + setups.size + ' old setups, on ' + Object.keys(SIZES).join(' and ') + ') Right, and a wrong drawing not');
  bad.forEach(b => console.log('  ' + b));
  await SB.done();
  if (bad.length) throw new Error('one-canvas: ' + bad.length + ' problem(s)');
}
module.exports = { run, dataBad, sampleOf };
main(module, run);
