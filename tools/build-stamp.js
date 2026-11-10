#!/usr/bin/env node
/* @family. — tools/build-stamp.js THE DEPLOY'S STAMP IS WHAT THE FILES SAY (750). --check: write nothing, exit 1 when stale. */
/* Hashes every file the site asks for with `?t=` (js/, style.css, fonts/, data/) and writes the first 12 hex */
/* into index.html's `BUILD_STAMP`, so `LOAD` moves when a deploy changes a file and at no other time. Run it last before a commit. */
'use strict';
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = path.resolve(__dirname, '..');
const HTML = path.join(ROOT, 'index.html');
const CHECK = process.argv.includes('--check');
/* WHAT `?t=` IS PUT ON: index.html's scripts and stylesheet, and every `deployStamp_()` fetch (check-cache holds those to data/, tools/, js/). */
const SERVED = ['js/', 'style.css', 'fonts/', 'data/'];
/* THE CHECKS ARE NEVER SERVED TO A PHONE, so editing one must not make every phone download the app again. */
const NOT = f => /^js\/check[-.]/.test(f);

function files() {
  let out;
  try {
    out = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', ...SERVED], { cwd: ROOT, maxBuffer: 1 << 28 }).toString();
  } catch (e) { console.error('build-stamp: git ls-files failed — cannot list the served files: ' + e.message); process.exit(2); }
  return [...new Set(out.split('\0').filter(Boolean))].filter(f => !NOT(f) && fs.existsSync(path.join(ROOT, f))).sort();
}

function stamp() {
  const h = crypto.createHash('sha256');
  const list = files();
  for (const f of list) { h.update(f + '\0'); h.update(fs.readFileSync(path.join(ROOT, f))); h.update('\0'); }
  return { stamp: h.digest('hex').slice(0, 12), n: list.length };
}

const RE = /var BUILD_STAMP = '([0-9a-f]*)';/;
const html = fs.readFileSync(HTML, 'utf8');
const m = RE.exec(html);
if (!m) { console.error("build-stamp: index.html has no `var BUILD_STAMP = '…';` line — nothing to stamp"); process.exit(2); }
const { stamp: now, n } = stamp();
if (CHECK) {
  if (m[1] !== now) {
    console.error(`FAIL — build-stamp: index.html says ${m[1] || '(empty)'}, the ${n} served files hash to ${now}. Run: node tools/build-stamp.js`);
    process.exit(1);
  }
  console.log(`OK — build-stamp: index.html's BUILD_STAMP ${now} is the hash of the ${n} served files`);
} else if (m[1] === now) console.log(`build-stamp: ${now} already (${n} files)`);
else { fs.writeFileSync(HTML, html.replace(RE, `var BUILD_STAMP = '${now}';`)); console.log(`build-stamp: ${m[1] || '(empty)'} -> ${now} (${n} files)`); }
