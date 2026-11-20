#!/usr/bin/env node
/* @family. — tools/digest-clip.js THE DIGEST-CLIP CHECK (rule 1.75, owner 20 Nov: "every question in the digest always shows its words"):
   the Sunday email a parent opens is never clipped by Gmail and never lists a question without its words.
   Pure node, no network. Loads backend/*.gs into a vm (each top-level name the first time something calls it) and renders the digest
   (`digestRender_`, the one the Sunday run sends) for large weeks built from data/questions.json — whole papers, as the library
   (`digestLibraryFind_`) hands them over, with their words from data-private/questions.json when this machine has it, else long made-up
   words of the same shape — plus a week with no library at all (the words cell only). Counted site-wide: every question of every week.
   Fails the build when any part of any email is over DIGEST_CLIP_BYTES, lacks the footer that says how to stop, says a question is
   "on the site" instead of its words, or leaves a listed question without words. Run by tools/build.js. `--sizes` prints each week's bytes. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };
const S = v => String(v == null ? '' : v).trim();

/* ---------- THE BACKEND'S OWN CODE, a name at a time (as tools/validate-questions.js loads the app's) */
function backend() {
  const acorn = require(path.join(ROOT, 'node_modules', 'acorn'));
  const decl = {};
  fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs')).sort().forEach(f => {
    const src = fs.readFileSync(path.join(ROOT, 'backend', f), 'utf8');
    const ast = acorn.parse(src, { ecmaVersion: 2022 });
    for (const n of ast.body) {
      if (n.type === 'FunctionDeclaration') decl[n.id.name] = src.slice(n.start, n.end);
      else if (n.type === 'VariableDeclaration') n.declarations.forEach(d => { if (d.id.type === 'Identifier' && !(d.id.name in decl)) decl[d.id.name] = 'var ' + src.slice(d.start, d.end) + ';'; });
    }
  });
  const ctx = vm.createContext({ console: { log() {}, warn() {}, error() {} }, Logger: { log() {} } });
  const loaded = new Set();
  const retry = run => {
    for (let i = 0; i < 600; i++) {
      try { return run(); } catch (e) {
        const m = /^(\w+) is not defined/.exec(e && e.message);
        if (!m) throw e;
        if (!need(m[1])) vm.runInContext('var ' + m[1] + ' = undefined', ctx);
      }
    }
    throw new Error('digest-clip: too many missing names');
  };
  function need(name) {
    if (loaded.has(name) || !decl[name]) return false;
    loaded.add(name);
    retry(() => vm.runInContext(decl[name], ctx));
    return true;
  }
  return { ctx, call: (expr, args) => { ctx.__a = args; return retry(() => vm.runInContext(expr, ctx)); } };
}

/* ---------- THE WEEKS: whole papers, the longest first */
const FILLER = 'A tank holds water. Water flows out of the tank at a constant rate of 4 litres per minute, and after 12 minutes the depth has fallen by a third. '
  + 'The diagram shows the tank, which is a cuboid with a square base. Work out how long it takes for the tank to empty, giving your answer in minutes and seconds. '
  + 'You must show all your working, and state any assumption you make about the rate of flow. ';
function weeks() {
  const pub = read('data/questions.json') || [], priv = read('data-private/questions.json') || {};
  const real = Object.keys(priv).length > 0;
  /* NO PRIVATE WORDS HERE: each row gets long made-up ones, so the check still measures the worst a week can weigh. */
  const fake = (r, n) => '<p>' + FILLER.repeat(n).slice(0, 220 * n) + ' (' + r.row_id + ')</p>';
  const rows = pub.map(r => Object.assign({}, r, priv[r.row_id] || (r.kind === 'document' ? {} : { html: fake(r, r.kind === 'preamble' ? 8 : 2) })));
  const text = '[\n' + rows.map(r => JSON.stringify(r)).join(',\n') + '\n]';
  const byPaper = {};
  rows.forEach(r => { if (r.kind === 'question' && /^true$/i.test(S(r.active)) && (S(r.html) || S(r.lead))) (byPaper[r.paper_id] = byPaper[r.paper_id] || []).push(r); });
  const weight = list => list.reduce((n, r) => n + S(r.html).length + S(r.lead).length, 0);
  const papers = Object.keys(byPaper).sort((a, b) => weight(byPaper[b]) - weight(byPaper[a]));
  const item = (r, i) => ({ key: 'q:' + r.row_id, label: 'Maths · Paper ' + r.paper_id + ' · Q' + S(r.question) + S(r.part).replace(/[()]/g, ''),
    words: S(r.html).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(), verdict: ['right', 'wrong', 'ai:2/4', ''][i % 4], answer: 'x = ' + (i + 3), last: '2026-11-1' + (i % 7) });
  const out = [];
  /* THE THREE HEAVIEST PAPERS, EACH A WEEK; THEN THE SIX HEAVIEST AS ONE WEEK — a child who did a whole mock series. */
  papers.slice(0, 3).forEach(p => out.push({ name: 'paper ' + p, rows: byPaper[p] }));
  out.push({ name: 'six heaviest papers', rows: [].concat(...papers.slice(0, 6).map(p => byPaper[p])) });
  return { real, text, weeks: out.map(w => ({ name: w.name, items: w.rows.map(item), ids: w.rows.map(r => r.row_id) })) };
}

async function run() {
  const B = backend(), W = weeks();
  const limit = B.call('DIGEST_CLIP_BYTES');
  const week = { start: '2026-11-09', end: '2026-11-15' };
  const bytes = s => Buffer.byteLength(s, 'utf8');
  const bad = [], sizes = [];
  let questions = 0, emails = 0;
  const one = (name, items, lib) => {
    const L = { first: 'Sam', days: ['2026-11-10', '2026-11-12'], fresh: items, again: [] };
    const look = { lib: lib, site: 'https://example.org/', hour: 18 };
    const m = B.call('digestRender_(__a[0], __a[1], __a[2], __a[3])', [L, { first: 'Alex' }, week, look]);
    const parts = m.parts || [m];
    const foot = B.call('text_("digest_footer")');
    const all = parts.map(p => p.text).join('\n');
    sizes.push({ name, parts: parts.map(p => bytes(p.html)), slim: m.slim });
    parts.forEach((p, i) => {
      emails++;
      if (bytes(p.html) > limit) bad.push(name + ' part ' + (i + 1) + ': ' + bytes(p.html) + ' bytes, over ' + limit);
      if (/words are on the site|source text is on the site/.test(p.text + p.html)) bad.push(name + ' part ' + (i + 1) + ': says something is "on the site" instead of its words');
      const stop = S(foot).split(/[.{]/)[0].slice(0, 30);
      if (stop && p.text.indexOf(stop) === -1) bad.push(name + ' part ' + (i + 1) + ': no footer that says how to stop');
    });
    /* EVERY QUESTION LISTED WITH WORDS: its number, and the start of its own words, somewhere in the email's parts. */
    const flat = all.replace(/\s+/g, ' ');
    items.forEach(q => {
      questions++;
      const num = q.label.split(' · ').pop();
      if (flat.indexOf(num) === -1) { bad.push(name + ': ' + q.key + ' is not listed'); return; }
      const row = lib && lib.rows[q.key.slice(2)];
      const own = row ? B.call('digestText_(__a)', S(row.lead) + ' ' + S(row.html)) : q.words;
      const start = S(own).replace(/\s+/g, ' ').slice(0, 24).replace(/\s+\S*$/, '');
      if (start.length >= 8 && flat.indexOf(start) === -1) bad.push(name + ': ' + q.key + ' is listed without its words ("' + start + '…")');
    });
  };
  W.weeks.forEach(w => {
    const lib = B.call('digestLibraryFind_(__a[0], __a[1])', [W.text, w.ids]);
    one(w.name, w.items, lib);
  });
  /* AND THE SAME HEAVIEST WEEK WITH NO LIBRARY — a run that could not fetch it: every question by its words cell. */
  one('six heaviest papers, no library', W.weeks[W.weeks.length - 1].items, null);
  /* AND WHAT A LINE ECHOES (owner, 20 Nov, 4e): only what was typed, never an old many-box string's empty slots, and the tries counted. */
  const hist = [
    { name: 'empty boxes', presses: [', , , , , , T'], answer: 'T', tries: 1 },
    { name: 'only separators', presses: [', , ;'], answer: '', tries: 1 },
    { name: 'two tries', presses: ['4', 'x = 5'], answer: 'x = 5', tries: 2 },
    { name: 'a vector', presses: ['\u27ee5,\u27ef'], answer: '\u27ee5,\u27ef', tries: 1 },
  ];
  /* Apps Script's date formatter, as the backend calls it: the day in UTC is enough here. */
  B.ctx.Utilities = { formatDate: d => new Date(d).toISOString().slice(0, 10) };
  hist.forEach(h => {
    questions++;
    const rows = h.presses.map((a, i) => ({ person_id: 'p1', key: 'q:R1', answer: a, verdict: 'wrong', event_id: 'e' + i,
      submitted_at: '2026-11-10T10:0' + i + ':00Z', pressed_at: '2026-11-10T10:0' + i + ':00Z' }));
    const L = B.call('digestLearners_(__a[0], __a[1])', [week, rows]).p1;
    const q = L && L.fresh[0];
    if (!q || q.answer !== h.answer || q.tries !== h.tries) bad.push('history "' + h.name + '": shows ' + JSON.stringify(q && q.answer) + ' in ' + (q && q.tries) + ' tries, not ' + JSON.stringify(h.answer) + ' in ' + h.tries);
  });
  const big = sizes.reduce((a, b) => (Math.max(...b.parts) > Math.max(...a.parts) ? b : a));
  console.log('digest-clip: ' + (questions - bad.filter(b => / is (not listed|listed without)/.test(b)).length) + '/' + questions + ' questions with their words, '
    + emails + ' email part(s) at most ' + Math.max(...[].concat(...sizes.map(s => s.parts))) + ' of ' + limit + ' bytes'
    + (W.real ? '' : ' (made-up words: no data-private here)'));
  if (process.argv.includes('--sizes') || bad.length) sizes.forEach(s => console.log('  ' + s.name + ': ' + s.parts.join(' + ') + ' bytes' + (s.slim ? ' (whole, unslimmed: ' + s.slim + ')' : '')));
  bad.slice(0, 30).forEach(b => console.log('  ' + b));
  if (bad.length) throw new Error('digest-clip: ' + bad.length + ' problem(s) in the Sunday email (biggest week: ' + big.name + ')');
}
module.exports = { run };
if (require.main === module) run().catch(e => { console.error(e && e.stack || e); process.exit(1); });
