#!/usr/bin/env node
/* @family. — tools/backend-health.js THE BACKEND'S HEALTH AND THE SITE ON NOTHING (920), data/backend-health.json. Occasional, ~20 s. */
/* doGet timed over the in-memory ledger (js/check-gas-load.js), cold and warm; the healthLog route posted once; check-payload's  */
/* read-and-never-sent and sent-and-never-read; the four version stamps; and the app booted in jsdom on an empty {} payload.     */
'use strict';
const fs = require('fs'), path = require('path'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'backend-health.json');
const t0 = Date.now(), out = { problems: [] };
const read = f => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };

/* THE STAMPS, compared whole (CLAUDE.md): one behind and the You screen says Not deployed. */
const st = {};
[['BACKEND_VERSION', 'backend/constants.gs'], ['DOGET_VERSION', 'backend/doget.gs'], ['DOPOST_VERSION', 'backend/dopost.gs'], ['BOOKING_VERSION', 'backend/booking.gs']]
  .forEach(([k, f]) => { const m = new RegExp('const ' + k + ' = "([^"]+)"').exec(read(f)); st[k] = m ? m[1] : ''; });
out.stamps = st;
if (new Set(Object.values(st)).size !== 1) out.problems.push({ kind: 'backend', where: 'backend/*.gs', say: 'the four version stamps differ: ' + JSON.stringify(st) });

(async () => {
  try {
    const { backend } = require('../js/check-gas-load.js');
    const b = backend();
    let a = Date.now(); const p = b.get({}); out.doGetColdMs = Date.now() - a;
    a = Date.now(); b.get({}); out.doGetWarmMs = Date.now() - a;
    out.payloadKB = Math.round(JSON.stringify(p).length / 1024);
    const h = b.post({ action: 'healthLog', device: 'phone-4gb-8c', rows: [{ rank: 'student', load_ms: 1200, find_ms: 3000, long_tasks: 4, long_ms: 400, heap_mb: 80, errors: 0 }] });
    out.healthLog = h.success ? 'ok' : (h.error || 'refused');
    if (!h.success) out.problems.push({ kind: 'backend', where: 'backend/dopost.gs healthLog_', say: 'the healthLog route refused a good batch: ' + out.healthLog });
  } catch (e) { out.problems.push({ kind: 'backend', where: 'js/check-gas-load.js', say: 'the backend would not run here: ' + String(e.message).slice(0, 120) }); }

  /* WHAT THE SITE READS AND THE BACKEND SENDS, as check-payload counts it. */
  let txt = '';
  try { txt = execFileSync(process.execPath, ['js/check-payload.js', '-v'], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); }
  catch (e) { txt = String(e.stdout || ''); out.problems.push({ kind: 'backend', where: 'js/check-payload.js', say: 'a key the site reads is never sent' }); }
  const m = /keys read: (\d+)\s+keys sent: (\d+)/.exec(txt);
  out.keysRead = m ? Number(m[1]) : null; out.keysSent = m ? Number(m[2]) : null;
  const unread = /SENT AND (?:NEVER )?READ BY NO SCREEN(?!, KEPT)[^\n]*\n([\s\S]*?)\n\n/.exec(txt);
  out.sentUnread = unread ? unread[1].split(/[,\n]/).map(s => s.trim()).filter(s => /^\w+$/.test(s)) : [];
  out.sentUnread.forEach(k => out.problems.push({ kind: 'backend', where: 'payload key ' + k, say: 'sent by doGet and read by no screen — weight to delete' }));

  /* THE SITE ON AN EMPTY PAYLOAD: it must still boot and draw, every fallback taken. */
  try {
    const { app, tick } = require('../check/jsdom-app.js');
    const A = await app({});
    const t1 = Date.now();
    while (!A.w.__ev('typeof LOADED !== "undefined" && LOADED') && Date.now() - t1 < 30000) await tick(200);
    const drawn = A.w.__ev('(document.getElementById("screen") || document.body).textContent.trim().length');
    const errs = Number(A.w.__ev("typeof OOPS !== \"undefined\" ? OOPS.n : 0")) || 0;
    out.emptyPayload = { loaded: !!A.w.__ev('LOADED'), drawnChars: drawn, errors: errs, which: JSON.parse(A.w.__ev('JSON.stringify(typeof OOPS !== "undefined" ? [...OOPS.sent].slice(0, 5) : [])')) };
    if (!out.emptyPayload.loaded || drawn < 50) out.problems.push({ kind: 'resilience', where: 'payload {}', say: 'the site did not boot and draw on an empty payload' });
    if (errs) out.problems.push({ kind: 'resilience', where: 'payload {}', say: errs + ' error(s) thrown booting on an empty payload: ' + out.emptyPayload.which.join(' / ').slice(0, 160) });
    A.close();
  } catch (e) { out.problems.push({ kind: 'resilience', where: 'check/jsdom-app.js', say: 'could not boot the app on {}: ' + String(e.message).slice(0, 100) }); }
  out.ms = Date.now() - t0;
  fs.writeFileSync(OUT, JSON.stringify(out, null, 1) + '\n');
  console.log(`backend-health: doGet ${out.doGetColdMs} ms cold / ${out.doGetWarmMs} ms warm, ${out.keysRead} keys read / ${out.keysSent} sent, ${out.problems.length} problem(s) (${out.ms} ms)`);
  process.exit(0);
})().catch(e => { console.error('backend-health: ' + (e && e.stack || e)); process.exit(2); });
