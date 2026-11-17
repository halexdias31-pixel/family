#!/usr/bin/env node
/* @family. — tools/build-stamp.js THE DEPLOY'S STAMP IS WHAT THE FILES SAY (750). tools/build.js runs it last. */
/* Hashes every file the site asks for with `?t=` (js/, style.css, fonts/, data/) and writes the first 12 hex */
/* into index.html's `BUILD_STAMP`, so `LOAD` moves when a deploy changes a file and at no other time. The bundles are written before it (build.js), so it hashes what is served. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'index.html');
/* WHAT `?t=` IS PUT ON: index.html's scripts and stylesheet, and every `deployStamp_()` fetch (check-cache holds those to data/, tools/, js/). */
const SERVED = ['js/', 'bundle/', 'style.css', 'style.min.css', 'fonts/', 'data/'];
/* THE CHECKS ARE NEVER SERVED TO A PHONE, so editing one must not make every phone download the app again. */
const NOT = f => /^js\/check[-.]/.test(f);

function files() {
  let out;
  try {
    out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...SERVED], { cwd: ROOT, maxBuffer: 1 << 28 }).toString();
  } catch (e) { throw new Error('build-stamp: git ls-files failed — cannot list the served files: ' + e.message); }
  return [...new Set(out.split('\0').filter(Boolean))].filter(f => !NOT(f) && fs.existsSync(path.join(ROOT, f))).sort();
}

function stamp() {
  const h = crypto.createHash('sha256');
  const list = files();
  for (const f of list) { h.update(f + '\0'); h.update(fs.readFileSync(path.join(ROOT, f))); h.update('\0'); }
  return { stamp: h.digest('hex').slice(0, 12), n: list.length };
}

const RE = /var BUILD_STAMP = '([0-9a-f]*)';/;
function run() {
  const html = fs.readFileSync(HTML, 'utf8');
  const m = RE.exec(html);
  if (!m) throw new Error("build-stamp: index.html has no `var BUILD_STAMP = '…';` line — nothing to stamp");
  const { stamp: now, n } = stamp();
  fs.writeFileSync(path.join(path.dirname(HTML), 'stamp.txt'), now + '\n');
  if (m[1] === now) console.log(`build-stamp: ${now} already (${n} files)`);
  else { fs.writeFileSync(HTML, html.replace(RE, `var BUILD_STAMP = '${now}';`)); console.log(`build-stamp: ${m[1] || '(empty)'} -> ${now} (${n} files)`); }
}
module.exports = { run };
if (require.main === module) run();
