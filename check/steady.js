#!/usr/bin/env node
/* @family. — check/steady.js NOTHING MOVES THAT WAS NOT ASKED TO (531): layout shifts, frames and scroll offsets, measured while each scenario in check/steady/ runs. */
/* Visitors out/student/admin at 320, 390 and 1280. --only=<scenario> --width=<px> --as=<visitor> -v. Port: STEADY_PORT. */
'use strict';
require('./quiet');
const glass = require('./glass.js');

/* THE INSTRUMENT, in the page before the app: every layout shift a finger did not cause, a frame clock, and the scroll offset of every box. */
function instrument() {
  const S = window.__steady = { shifts: [] };
  const name = n => {
    if (!n || n.nodeType !== 1) return '?';
    return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (n.classList.length ? '.' + [...n.classList].slice(0, 2).join('.') : '');
  };
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => {
      if (!e.hadRecentInput) S.shifts.push({ v: e.value, t: e.startTime, src: (e.sources || []).map(s => name(s.node)).slice(0, 3) });
    })).observe({ type: 'layout-shift', buffered: true });
  } catch (e) { S.broken = 'no layout-shift observer'; }
  /* A MARK, and the shifts since it: a scenario measures its own window and not the boot's. */
  S.mark = () => performance.now();
  S.since = t => S.shifts.filter(x => x.t >= t);
  S.score = t => S.since(t).reduce((a, x) => a + x.v, 0);
  /* THE FRAMES for `ms`: each gap between two paints, so a stall shows as one long gap. */
  S.frames = ms => new Promise(ok => {
    const gaps = []; let last = 0; const end = performance.now() + ms;
    const tick = t => { if (last) gaps.push(t - last); last = t; if (t < end) requestAnimationFrame(tick); else ok(gaps); };
    requestAnimationFrame(tick);
  });
  /* EVERY BOX THAT IS SCROLLED, by a path that survives a repaint only if the box does — which is the point. */
  S.scrolls = () => {
    const out = {};
    document.querySelectorAll('*').forEach(el => {
      if (el.scrollTop || el.scrollLeft) {
        let p = name(el), up = el.parentElement;
        for (let i = 0; up && i < 3; i++, up = up.parentElement) p = name(up) + '>' + p;
        out[p] = [Math.round(el.scrollTop), Math.round(el.scrollLeft)];
      }
    });
    return out;
  };
}

glass.run({ tag: 'steady', dir: 'steady', portVar: 'STEADY_PORT', init: instrument, settle: 3000,
            green: 'nothing moved that was not asked to' })
  .catch(e => { console.error('steady: ' + e.stack); process.exit(2); });
