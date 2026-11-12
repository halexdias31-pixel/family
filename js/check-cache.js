#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-cache.js EVERY FILE OF OUR OWN IS ASKED FOR WITH THE DEPLOY'S STAMP (546). No flags, no port. */
/* GitHub Pages lets a browser keep a file for 10 minutes; only a changed URL is asked for again. */
/* So a fetch of the site's own files ('data/…', 'tools/…', 'js/…') must carry `deployStamp_()` (core.js), or a deploy never reaches it. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..');

const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
if (!m) { console.error('check-cache: cannot read window.FILES out of index.html — nothing to read'); process.exit(2); }
const files = [...m[1].matchAll(/'([^']+)'/g)].map(x => 'js/' + x[1] + '.js');
const OWN = /^['"`](?:\.\/)?(?:data|tools|js|bundle)\//;
const bad = [];
let read = 0, own = 0;

/* THE NETWORK FIRST (98; offline, 11 Nov): sw.js may answer a fetch only by asking the network, its store only when that fails. */
const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
const swFetch = /async function offFetch_\(req\) \{\s*try \{\s*const res = await fetch\(req\);/.test(sw) && !/caches\.match[^]*?await fetch\(req\)/.test(sw.slice(sw.indexOf('offFetch_')));
if (/addEventListener\(\s*['"]fetch['"]/.test(sw) && !swFetch) bad.push('sw.js answers fetches from its store before the network — the site loads fresh files each visit (owner, 9 Nov, 98)');
if (/serviceWorker\.register\(/.test(html)) bad.push('index.html registers a service worker on every visit — only turning on notifications or making a paper offline may (98)');
const src = {};
files.forEach(f => { try { src[f] = fs.readFileSync(path.join(root, f), 'utf8'); } catch (e) { bad.push(f + ': listed in index.html and not readable'); } });
/* A NAME THAT HOLDS ONE OF OUR PATHS (`const RACE_SHIPPED = 'data/race-map.json'`) counts as the path. */
const named = {};
Object.values(src).forEach(t => { for (const d of t.matchAll(/\bconst ([A-Z_][A-Z0-9_]*) = (['"`][^'"`]*['"`]);/g)) if (OWN.test(d[2])) named[d[1]] = d[2]; });

/* THE FIRST ARGUMENT OF EVERY fetch(…), up to its own comma or bracket. */
function firstArg(t, at) {
  let depth = 0, i = at, q = null;
  for (; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '\\') i++; else if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === '`') { q = c; continue; }
    if (c === '(' || c === '[' || c === '{') depth++;
    else if (c === ')' || c === ']' || c === '}') { if (!depth) break; depth--; }
    else if (c === ',' && !depth) break;
  }
  return t.slice(at, i).trim();
}
Object.keys(src).forEach(f => {
  const t = src[f];
  /* A `stamp` IS THE DEPLOY'S: every one is made by deployStamp_(). */
  for (const s of t.matchAll(/\bconst stamp = ([^;]+);/g)) if (s[1].trim() !== 'deployStamp_()') bad.push(f + ': `const stamp = ' + s[1].trim() + '` — a stamp is deployStamp_()');
  for (const c of t.matchAll(/\bfetch\(/g)) {
    read++;
    const arg = firstArg(t, c.index + 6);
    const head = arg.split(/\s*\+\s*/)[0];
    if (!(OWN.test(head) || named[head])) continue;
    own++;
    if (!/deployStamp_\(\)|\bstamp\b/.test(arg)) {
      const line = t.slice(0, c.index).split('\n').length;
      bad.push(f + ':' + line + ': fetch(' + arg.slice(0, 90) + ') asks for one of our files without the deploy\'s stamp — the service worker would hand back the first copy it ever kept');
    }
  }
});
if (!own) bad.push('no fetch of one of our own files was found among ' + read + ' — this check read nothing it could judge');
if (bad.length) {
  console.log('A FILE OF OUR OWN IS FETCHED WITHOUT THE DEPLOY\'S STAMP:\n' + bad.map(b => '   ' + b).join('\n'));
  process.exit(1);
}
console.log('OK — every fetch of the site\'s own files carries the deploy\'s stamp (' + own + ' of ' + read + ' fetches are ours)');
