#!/usr/bin/env node
/* @family. — tools/one-request.js THE ONE-REQUEST CHECK (rule 1.75, unify H, 21 Nov): every ask of the backend goes one way, so a child's
   or parent's save, report or load is timed and told the same. Fails the build on: a second `fetch` to the backend in js/ (the one is
   `backendFetch_`, js/shell-click.js; index.html's head pre-asks the payload before any script runs, the one other, and must name the
   same URL as js/data.js's API); an action the front end posts that data/settings/actions.json does not list; and a backend whose
   dispatch is not the one generated table (one `doPost`, `postActions_` naming exactly actions.json's rows). Run by tools/build.js. */
'use strict';
const { text, srcFiles, report, main, bare } = require('./lib/gen.js');

function run() {
  const bad = [];
  const rows = JSON.parse(text('data/settings/actions.json')).actions;
  /* A ROW IS A POST (`postActions_`) OR A `?run=` JOB (`RUNNABLE`), as tools/permissions.js writes them; a phone may name either. */
  const names = new Set(rows.map(a => a.name)), posted = new Set(rows.filter(a => !a.run).map(a => a.name)), runs = new Set(rows.filter(a => a.run).map(a => a.name));
  const js = srcFiles('js', /\.js$/).map(p => p.slice(3));
  const api = (text('js/data.js').match(/const API = '([^']+)'/) || [])[1];
  if (!api) bad.push('js/data.js: no `const API = \'...\'`');
  let fetches = 0, acts = 0;
  for (const f of js) {
    const src = text('js/' + f);
    src.split('\n').forEach((l, i) => {
      const at = 'js/' + f + ':' + (i + 1);
      if (/\bfetch\(\s*API\b/.test(l)) {
        fetches++;
        if (f !== 'shell-click.js' || !/fetch\(API \+ \(o\.query \|\| ''\), opt\)/.test(l)) bad.push(at + ': a fetch to the backend outside backendFetch_');
      }
      if (/script\.google\.com\/macros/.test(l) && !(f === 'data.js' && /const API = /.test(l))) bad.push(at + ': the backend URL written out again; use API through backendFetch_');
    });
    for (const m of src.matchAll(/\baction:\s*'(\w+)'/g)) {
      acts++;
      if (!names.has(m[1])) bad.push('js/' + f + ': action \'' + m[1] + '\' is not in data/settings/actions.json');
    }
  }
  if (fetches !== 1) bad.push('js/: ' + fetches + ' fetches to API, not the one in backendFetch_');
  const html = text('index.html');
  const urls = html.match(/https:\/\/script\.google\.com\/macros\/[^'"\s]+/g) || [];
  if (urls.length > 1) bad.push('index.html: the backend URL written ' + urls.length + ' times');
  if (urls.length && urls[0] !== api) bad.push('index.html: the head asks a different backend from js/data.js\'s API');
  /* THE BACKEND: one doPost, one table, and the table is actions.json's. */
  const gs = srcFiles('backend', /\.gs$/).map(p => p.slice(8));
  let posts = 0, tables = 0;
  for (const f of gs) {
    const src = text('backend/' + f);
    posts += (src.match(/^function doPost\(/mg) || []).length;
    tables += (src.match(/=\s*postActions_\(\)/g) || []).length;
    if (f === 'dopost.gs') {
      const body = (src.match(/function postActions_\(\) \{\s*return \{([\s\S]*?)\};/) || [])[1] || '';
      const keys = new Set([...body.matchAll(/^\s*(\w+):/mg)].map(m => m[1]));
      for (const n of posted) if (!keys.has(n)) bad.push('backend/dopost.gs: postActions_ has no \'' + n + '\'');
      for (const k of keys) if (!posted.has(k)) bad.push('backend/dopost.gs: postActions_ has \'' + k + '\', which actions.json does not list');
    }
  }
  const job = (text('backend/access.gs').match(/const RUNNABLE = \{([\s\S]*?)\};/) || [])[1] || '';
  const jobs = new Set([...job.matchAll(/^\s*(\w+):/mg)].map(m => m[1]));
  for (const n of runs) if (!jobs.has(n)) bad.push('backend/access.gs: RUNNABLE has no \'' + n + '\'');
  for (const k of jobs) if (!runs.has(k)) bad.push('backend/access.gs: RUNNABLE has \'' + k + '\', which actions.json does not list');
  if (posts !== 1) bad.push('backend/: ' + posts + ' doPost functions, not one');
  if (tables !== 1) bad.push('backend/: postActions_() dispatched from ' + tables + ' places, not one');
  /* ONE PERMISSION TABLE (unify 4): PERMISSIONS only, the gate's level computed by levelOf_ (booking.gs), the same as tools/permissions.js `levelOf` for every action. */
  const allGs = srcFiles('backend', /\.gs$/).map(f => text(f)).join("\n");
  if (/\bACTION_ACCESS\b/.test(bare(allGs, { comments: true }))) bad.push('backend/: ACTION_ACCESS is back; the one table is PERMISSIONS');
  const lv = allGs.match(/function levelOf_\(roles\) \{[\s\S]*?\n\}/), pm = allGs.match(/const PERMISSIONS = (\{[\s\S]*?\n\});/);
  let levels = 0;
  if (!lv || !pm) bad.push('backend/: no levelOf_ or no PERMISSIONS');
  else {
    const levelOf_ = new Function(lv[0] + '; return levelOf_;')(), P = new Function('return ' + pm[1])(), want = require('./permissions.js').levelOf;
    rows.filter(a => !a.run).forEach(a => { levels++; if (!P[a.name]) bad.push('PERMISSIONS: no row for ' + a.name); else if (levelOf_(P[a.name]) !== want(a.roles)) bad.push('levelOf_(' + a.name + ') = ' + levelOf_(P[a.name]) + ', not ' + want(a.roles)); });
  }
  console.log('one-request: ' + levels + ' action levels by levelOf_ agree');
  console.log('one-request: ' + fetches + ' fetch to the backend, ' + acts + ' posted action names against ' + names.size + ' listed, ' + posts + ' dispatcher');
  report('one-request', bad, 'second path(s)', console.error);
}
module.exports = { run };
main(module, run);
