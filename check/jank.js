#!/usr/bin/env node
/* @family. — check/jank.js NO LONG TASK WHILE SOMEBODY WAITS (531): long tasks and event timings, observed while each scenario in check/jank/ runs. */
/* Visitors out/student/admin at 320, 390 and 1280, at 1x CPU. --only=<scenario> --width=<px> --as=<visitor> -v. Port: JANK_PORT. */
'use strict';
require('./quiet');
const glass = require('./glass.js');

/* THE INSTRUMENT, in the page before the app: every task over 50 ms with what it was attributed to, and every input's delay to its paint. */
function instrument() {
  const J = window.__jank = { tasks: [], events: [] };
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => {
      J.tasks.push({ t: e.startTime, d: e.duration, by: (e.attribution || []).map(a => a.containerSrc || a.name).join(' ') });
    })).observe({ type: 'longtask', buffered: true });
  } catch (e) { J.broken = 'no longtask observer'; }
  try {
    new PerformanceObserver(l => l.getEntries().forEach(e => {
      J.events.push({ t: e.startTime, d: e.duration, name: e.name, wait: e.processingStart - e.startTime });
    })).observe({ type: 'event', buffered: true, durationThreshold: 16 });
  } catch (e) { J.broken = (J.broken ? J.broken + ', ' : '') + 'no event-timing observer'; }
  J.mark = () => performance.now();
  J.tasksSince = t => J.tasks.filter(x => x.t >= t);
  J.eventsSince = t => J.events.filter(x => x.t >= t);
  J.longest = t => J.tasksSince(t).reduce((m, x) => (x.d > m.d ? x : m), { d: 0, by: '' });
}

glass.run({ tag: 'jank', dir: 'jank', portVar: 'JANK_PORT', init: instrument, settle: 3000,
            green: 'no task over its budget' })
  .catch(e => { console.error('jank: ' + e.stack); process.exit(2); });
