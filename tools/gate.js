#!/usr/bin/env node
/* @family. — tools/gate.js THE ONE GATE (owner, 12 Nov): everything that must pass before a merge to main; never merge red. */
/* node tools/gate.js [--jobs=N] [--only=a,b] [--skip=a,b] [--ci] [--base=origin/main]. --ci is the part a free runner can do. */
'use strict';
const { spawn, execFileSync } = require('child_process');
const fs = require('fs'), path = require('path'), os = require('os');
const ROOT = path.resolve(__dirname, '..');
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=').slice(1).join('=');
const CI = process.argv.includes('--ci');
const BASE = arg('base') || 'origin/main';
/* EACH flow part takes up to 3 GB, so parts run two at a time unless told; the read-only checks are light. */
const JOBS = Number(arg('jobs')) || Math.max(1, Math.min(2, Math.floor(os.freemem() / 3e9)) || 1);
const NODE = process.execPath, HEAVY = ['--max-old-space-size=3000'];
const has = f => fs.existsSync(path.join(ROOT, f));

/* THE PARTS: name, what it proves in plain words, the command, and whether it is fit for a free runner (`ci`). */
const PARTS = [
  { id: 'names',     say: 'every name used is declared (js/check.js)', cmd: [NODE, 'js/check.js'], ci: true },
  { id: 'stamp',     say: 'the build stamp is current', cmd: [NODE, 'tools/build-stamp.js', '--check'], ci: true },
  { id: 'bundle',    say: 'the generated bundles are current', cmd: [NODE, 'tools/bundle.js', '--check'], ci: true },
  { id: 'rules',     say: 'every rule has a check and every check a rule', cmd: [NODE, 'tools/rules.js'], ci: true },
  { id: 'fast-core', say: 'check-all --fast, core checks', cmd: [NODE, 'js/check-all.js', '--fast'], ci: true },
  { id: 'fast-secondary', say: 'check-all --fast, secondary checks (must pass here too)', cmd: [NODE, 'js/check-all.js', '--fast', '--tier=secondary', '--strict'], ci: true },
  ...[1, 2, 3, 4, 5, 6, 7, 8].map(k => ({ id: 'flow-' + k, say: `journeys, part ${k} of 8`, cmd: [NODE, ...HEAVY, 'js/check-flow.js'], env: { FLOW_PART: k + '/8' }, ci: true, heavy: true })),
  { id: 'gallery',   say: `every changed screenshot against ${BASE}'s set was looked at and approved`, fn: gallery, ci: false, heavy: true },
];

/* RUN ONE COMMAND, its output held so parallel parts never interleave; the tail is printed if it fails. */
function run(cmd, env) {
  return new Promise(ok => {
    const p = spawn(cmd[0], cmd.slice(1), { cwd: ROOT, env: Object.assign({}, process.env, { FORCE_COLOR: '0' }, env || {}) });
    let out = '';
    /* DECODED AS A STREAM, so a character split across two chunks is not mangled. */
    p.stdout.setEncoding('utf8'); p.stderr.setEncoding('utf8');
    p.stdout.on('data', d => { out += d; }); p.stderr.on('data', d => { out += d; });
    p.on('close', code => ok({ code, out })); p.on('error', e => ok({ code: 1, out: String(e) }));
  });
}

/* THE SCREENSHOT GATE: the base branch's shots are the approved set; this branch's changed shots must be signed. */
async function gallery() {
  const dir = path.join(os.tmpdir(), 'family-gate-gallery'), okDir = path.join(dir, 'approved'), mark = path.join(okDir, '.base');
  let sha; try { sha = execFileSync('git', ['rev-parse', BASE], { cwd: ROOT, encoding: 'utf8' }).trim(); } catch (e) { return { code: 1, out: 'cannot resolve ' + BASE }; }
  const cur = (() => { try { return fs.readFileSync(mark, 'utf8').trim(); } catch (e) { return ''; } })();
  let log = '';
  if (cur !== sha) {
    /* THE BASE SET, photographed once per base commit from a throwaway checkout of it. */
    const wt = path.join(os.tmpdir(), 'family-gate-base');
    try { execFileSync('git', ['worktree', 'remove', '--force', wt], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { /* none yet */ }
    fs.rmSync(wt, { recursive: true, force: true }); fs.rmSync(okDir, { recursive: true, force: true });
    execFileSync('git', ['worktree', 'add', '--detach', wt, sha], { cwd: ROOT, stdio: 'ignore' });
    ['node_modules', 'data-private'].forEach(d => { if (has(d)) try { fs.symlinkSync(fs.realpathSync(path.join(ROOT, d)), path.join(wt, d)); } catch (e) { /* there */ } });
    const b = await run([NODE, path.join(wt, 'tools/gallery.js'), '--dir=' + dir, '--approve'], { GALLERY_PORT: '8762' });
    try { execFileSync('git', ['worktree', 'remove', '--force', wt], { cwd: ROOT, stdio: 'ignore' }); } catch (e) { /* left for next time */ }
    if (b.code) return { code: 1, out: 'could not photograph ' + BASE + ':\n' + b.out };
    fs.writeFileSync(mark, sha + '\n'); log = `photographed ${BASE} (${sha.slice(0, 7)}) as the approved set\n`;
  }
  const r = await run([NODE, 'tools/gallery.js', '--dir=' + dir, '--gate'], { GALLERY_PORT: '8763' });
  return { code: r.code, out: log + r.out };
}

(async () => {
  const only = arg('only') ? arg('only').split(',') : null, skip = arg('skip') ? arg('skip').split(',') : [];
  const todo = PARTS.filter(p => (!only || only.indexOf(p.id) >= 0) && skip.indexOf(p.id) < 0 && (!CI || p.ci));
  console.log(`gate: ${todo.length} part(s), ${JOBS} heavy at a time${CI ? ' (CI set)' : ''}`);
  const t0 = Date.now(), res = [];
  /* LIGHT PARTS all start at once; HEAVY ones (journeys, browser) queue for JOBS slots so the machine is not swamped. */
  const one = async p => { const t = Date.now(), r = p.fn ? await p.fn() : await run(p.cmd, p.env);
    const s = ((Date.now() - t) / 1000).toFixed(0);
    console.log(`  ${r.code ? 'FAIL' : 'ok  '}  ${p.id.padEnd(15)} ${s.padStart(5)}s  ${p.say}`);
    res.push(Object.assign({ p, s }, r)); };
  const heavy = todo.filter(p => p.heavy), light = todo.filter(p => !p.heavy);
  const lane = async () => { while (heavy.length) await one(heavy.shift()); };
  await Promise.all(light.map(one).concat(Array.from({ length: JOBS }, lane)));
  const bad = res.filter(r => r.code);
  bad.forEach(r => { console.log(`\n--- ${r.p.id}: ${r.p.say} — what it said (last lines) ---`);
    console.log(r.out.trim().split('\n').filter(l => !/^\s*ok\b|^\s+PASS\b/.test(l)).slice(-40).join('\n')); });
  const secs = ((Date.now() - t0) / 1000).toFixed(0);
  console.log('\n' + (bad.length
    ? `GATE RED — ${bad.length} of ${res.length} part(s) failed in ${secs}s: ${bad.map(r => r.p.id).join(', ')}. Do not merge; fix these first.`
    : `GATE GREEN — all ${res.length} part(s) passed in ${secs}s. Safe to merge.`));
  process.exit(bad.length ? 1 : 0);
})();
