#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-errors.js A THROW IN A DRAW, AN ACT, A TIMER AND A PROMISE: each one clientError POST, a friendly fallback, and the rest still works (R6, O5). */
const fs = require('fs'), path = require('path');
const { app, tick, undrawn, ROOT } = require('../check/jsdom-app');
const bad = [];
process.on('uncaughtException', e => { if (!/E-timer/.test(e && e.message)) bad.push('uncaught: ' + (e && e.message)); });
(async () => {
  let FIX;
  try { FIX = JSON.parse(fs.readFileSync(path.join(ROOT, 'check/fixture.json'), 'utf8')); }
  catch (e) { console.error('cannot read check/fixture.json'); process.exit(2); }
  const a = await app(FIX);
  const { w, h } = a;
  const reports = re => a.posts.filter(p => p.action === 'clientError' && re.test(p.message || ''));
  const toast = () => (w.document.body.textContent || '');
  const one = (label, re) => {
    const r = reports(re);
    if (r.length !== 1) bad.push(label + ': ' + r.length + ' clientError POSTs, want exactly 1');
    r.forEach(p => {
      const extra = Object.keys(p).filter(k => ['action', 'message', 'where', 'version', 'screen', 'device'].indexOf(k) === -1);
      if (extra.length) bad.push(label + ': the report carries ' + extra.join(', ') + ' — only message, where, version, screen and device may go');
    });
  };
  const before = a.posts.filter(p => p.action === 'clientError').map(p => p.where + ' ' + p.message);
  if (before.length) bad.push('the fixture already reports: ' + before.join('; '));

  /* 1. A DRAW: the screen says so, the next one still draws. */
  const tools = h.SCREENS.tools;
  if (!tools) { console.error('no tools screen to break'); process.exit(2); }
  const keep = tools.draw;
  tools.draw = () => { throw new Error('E-draw at "Ada Pupil"'); };   // a parse error quotes what it choked on
  h.paint('tools', true); h.paint('tools', true);
  tools.draw = keep;
  await tick(50);
  one('draw', /E-draw/);
  if (undrawn(w, 'tools') !== 'did not draw') bad.push('draw: the tools column shows no fallback');
  if (/Ada Pupil/.test((w.document.getElementById('s-tools') || {}).textContent || '')) bad.push('draw: the fallback shows the raw message');
  if (reports(/Ada Pupil/).length) bad.push('draw: quoted text left the client in a report');

  /* 2. AN ACT: a tap that throws says so in a toast. */
  h.on('check-boom', () => { throw new Error('E-act'); });
  const b = w.document.createElement('button');
  b.setAttribute('data-do', 'check-boom');
  w.document.getElementById('s-feed').appendChild(b);
  b.click(); b.click();
  await tick(50);
  one('act', /E-act/);
  if (!/did not work/.test(toast())) bad.push('act: no friendly toast');
  if (/reported/i.test(toast())) bad.push('act: the toast says the error was reported');

  /* 3. A TIMER and 4. A PROMISE: caught by the window, reported once. */
  w.setTimeout(() => { throw new Error('E-timer'); }, 0);
  w.setTimeout(() => { throw new Error('E-timer'); }, 0);
  w.eval("Promise.reject(new Error('E-promise')); Promise.reject(new Error('E-promise'));");
  await tick(300);
  one('timer', /E-timer/);
  one('promise', /E-promise/);
  if (!/went wrong there/.test(toast())) bad.push('timer/promise: no friendly toast');
  /* A REPORT CAN BE DROPPED (deduped, capped, no fetch), so no toast may promise one was made. */
  if (/reported/i.test(toast())) bad.push('timer/promise: the toast says the error was reported');

  /* AND THE REST STILL WORKS: every other column draws after all of that. */
  for (const t of h.TABS) {
    if (t.id === 'tools') continue;
    try { h.go(t.id, false, true); h.paint(t.id, true); } catch (e) { bad.push(t.id + ' threw ' + e.message); }
    const u = undrawn(w, t.id);
    if (u) bad.push('afterwards ' + t.id + ': ' + u);
  }
  h.paint('tools', true);
  if (undrawn(w, 'tools')) bad.push('tools did not draw again once fixed');
  await tick(200);
  const stray = a.posts.filter(p => p.action === 'clientError' && !/E-(draw|act|timer|promise)/.test(p.message || ''));
  stray.forEach(p => bad.push('an unexpected report: ' + p.where + ' — ' + p.message));
  a.close();
  if (bad.length) { console.error('check-errors: ' + bad.length + ' failure(s)\n  ' + bad.join('\n  ')); process.exit(1); }
  console.log('check-errors: draw, act, timer and promise each reported once with a fallback; ' + h.TABS.length + ' columns still draw');
  process.exit(0);
})().catch(e => { console.error('check-errors could not run: ' + (e && e.stack || e)); process.exit(2); });
