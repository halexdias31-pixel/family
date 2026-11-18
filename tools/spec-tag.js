#!/usr/bin/env node
/* @family. — tools/spec-tag.js THE SPEC TAGGER (docs/library-structure.md §3, 18 Nov): gives each Access Tuition worksheet part
   (paper_id W-AT-B/C/P-*) its `spec_ref`, the AQA spec point it tests (`aqa-8461:4.1.1.2`; several are space-separated, the first the main one).
   Not part of the build: run once, then by hand. tools/spec-links.js turns the tags into the spec points' `q:` links.
     node tools/spec-tag.js measure   the tagger's guesses against the hand-tagged sheets (HAND below) and the old hand-kept links
     node tools/spec-tag.js write     tags every W-AT part that has no spec_ref yet, in data/questions.json; prints the check list
     node tools/spec-tag.js set <paper_id> <point>   the hand check, by sheet: the sheet's parts that took the sheet's guess take <point>
   How it guesses, with public words only (a part's own wording is private): 1. the sheet's `topics` is an AQA section's `topic`
   (data/spec/aqa-846x.json) — exact, so 8 to 25 candidate points; 2. the sheet's title scored against each leaf point's text, its parent's,
   its `keys[]` and its point-by-point card's title and words; 3. a part an old hand-kept `q:` link named keeps that point, and the other
   parts of its question inherit it (they share a stem); the rest of the sheet takes the sheet's best point.
   The check list: sheets whose best point scored low, or barely beat the next. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SUBJ = { B: '8461', C: '8462', P: '8463' };
const STOP = new Set('the and of in a an to for with its from by on at as or be is are their them this that how what using use uses'.split(' '));
const stem = w => w.replace(/&rsquo;s$|'s$/, '').replace(/(ies)$/, 'y').replace(/([^s])s$/, '$1').replace(/ing$/, '');
const words = s => String(s || '').toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/<[^>]*>/g, ' ').split(/[^a-z0-9]+/)
  .filter(w => (w.length > 1 || /\d/.test(w)) && !STOP.has(w)).map(stem);

/* THREE SHEETS TAGGED BY HAND (one per science), from the AQA spec and each sheet's title and questions' order: the point a teacher would
   file the sheet under (`main`), and every point its questions may fairly test (`fair`). Part-level wording is private, so the hand tag is per sheet. */
const HAND = {
  'W-AT-B-cell-structure': { main: '4.1.1.2', fair: ['4.1.1.1', '4.1.1.2', '4.1.1.3', '4.1.1.4', '4.1.1.5'] },
  'W-AT-C-atomic-structure': { main: '4.1.1.4', fair: ['4.1.1.1', '4.1.1.2', '4.1.1.3', '4.1.1.4', '4.1.1.5', '4.1.1.6', '4.1.1.7'] },
  'W-AT-P-momentum': { main: '4.5.7.1', fair: ['4.5.7.1', '4.5.7.2', '4.5.7.3'] },
};

function load() {
  const qs = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/questions.json'), 'utf8'));
  const tb = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/textbooks.json'), 'utf8'));
  const specs = {};
  Object.values(SUBJ).forEach(c => { specs[c] = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/spec/aqa-' + c + '.json'), 'utf8')); });
  const card = {};
  tb.forEach(r => { if (/^TB-AQA-846[123]$/.test(r.book_id)) card['ct:' + r.book_id + '-' + r.chapter] = r; });
  return { qs, specs, card };
}

/* EACH LEAF POINT AS BAGS OF WORDS, by how strongly each says what the point is. */
function pointDocs(sp, card) {
  const kids = new Set(sp.points.map(p => p.parent));
  const byId = new Map(sp.points.map(p => [p.id, p]));
  return sp.points.filter(p => !kids.has(p.id)).map((p, order) => {
    const par = byId.get(p.parent), ct = (p.links || []).find(l => /^ct:/.test(l)), c = ct && card[ct];
    const aria = c ? (String(c.html || '').match(/aria-label="([^"]*)"/) || [])[1] : '';
    return { id: p.id, order, sec: p.id.split('.').slice(0, 2).join('.'),
      bags: [[3, new Set(words(p.text.replace(/\((HT|physics|chemistry|biology) only\)/g, '')))], [2, new Set([].concat(...(p.keys || []).map(words)))],
        [1.5, new Set(words(par && par.text))], [1, new Set(words([c && c.title, c && c.about].join(' ')))], [0.5, new Set(words(aria))]] };
  });
}

function scoreSheet(doc, docs) {
  const t = new Set(words(doc.name).concat(words(doc.paper_id.replace(/^W-AT-[BCP]-/, ''))));
  const df = w => docs.filter(d => d.bags.some(([, b]) => b.has(w))).length || 1;
  return docs.map(d => {
    let s = 0;
    t.forEach(w => { const best = Math.max(0, ...d.bags.map(([k, b]) => (b.has(w) ? k : 0))); if (best) s += best / Math.sqrt(df(w)); });
    return { id: d.id, s, order: d.order };
  }).sort((a, b) => b.s - a.s || a.order - b.order);
}

/* THE OLD HAND-KEPT LINKS: part row_id -> the points that named it. */
function oldLinks(specs) {
  const m = new Map();
  Object.entries(specs).forEach(([c, sp]) => sp.points.forEach(p => (p.links || []).forEach(l => {
    const r = /^q:(Q-W-AT-.+)$/.exec(l); if (r) { if (!m.has(r[1])) m.set(r[1], []); m.get(r[1]).push('aqa-' + c + ':' + p.id); }
  })));
  return m;
}

function tag(opt) {
  const { qs, specs, card } = load();
  const old = opt.noOld ? new Map() : oldLinks(specs);
  const docsOf = {}; Object.entries(specs).forEach(([c, sp]) => { docsOf[c] = pointDocs(sp, card); });
  const sheets = qs.filter(r => r.kind === 'document' && /^W-AT-[BCP]-/.test(r.paper_id));
  const out = new Map(), check = [], sheetPick = {};
  sheets.forEach(doc => {
    const code = SUBJ[doc.paper_id.charAt(5)], sp = specs[code];
    const parts = qs.filter(r => r.kind === 'question' && r.paper_id === doc.paper_id);
    const topic = (parts.find(r => r.topics) || {}).topics;
    const sec = sp.sections.find(s => s.topic === topic);
    const docs = docsOf[code].filter(d => sec && d.sec === sec.id);
    const sc = scoreSheet(doc, docs), best = sc[0], next = sc[1] || { s: 0 };
    sheetPick[doc.paper_id] = { code, best: best && best.id, score: best ? best.s : 0, next: next.id, nextScore: next.s, n: parts.length, sec: sec && sec.id };
    if (!best || best.s < 1.5 || next.s >= best.s * 0.85) check.push(doc.paper_id);
    const byQ = {};
    parts.forEach(r => { const o = old.get(r.row_id); if (o) (byQ[r.question] = byQ[r.question] || new Set()), o.forEach(k => byQ[r.question].add(k)); });
    parts.forEach(r => {
      const own = old.get(r.row_id) || (byQ[r.question] ? [...byQ[r.question]] : null);
      out.set(r.row_id, own ? [...new Set(own)] : best ? ['aqa-' + code + ':' + best.id] : []);
    });
  });
  return { qs, out, check, sheetPick, specs };
}

function measure() {
  const { specs } = load();
  const blind = tag({ noOld: true }), old = oldLinks(specs);
  console.log('HAND-TAGGED SHEETS (tagger blind to old links):');
  let pn = 0, pmain = 0, pfair = 0;
  Object.entries(HAND).forEach(([pid, h]) => {
    const p = blind.sheetPick[pid], n = p.n, main = p.best === h.main, fair = h.fair.includes(p.best);
    pn += n; pmain += main ? n : 0; pfair += fair ? n : 0;
    console.log('  ' + pid + ': ' + n + ' parts, guess ' + p.best + ' (' + p.score.toFixed(2) + '), hand main ' + h.main + ' — main ' + (main ? 'yes' : 'no') + ', fair ' + (fair ? 'yes' : 'no'));
  });
  console.log('  parts: ' + pn + '; first guess = hand main point ' + pmain + '/' + pn + ' (' + (100 * pmain / pn).toFixed(0) + '%); a point the sheet fairly tests ' + pfair + '/' + pn + ' (' + (100 * pfair / pn).toFixed(0) + '%)');
  let n = 0, hit = 0, sect = 0;
  old.forEach((keys, rid) => { const g = (blind.out.get(rid) || [])[0]; if (!g) return; n++; if (keys.includes(g)) hit++; if (keys.some(k => k.split('.').slice(0, 2).join('.') === g.split('.').slice(0, 2).join('.'))) sect++; });
  console.log('OLD HAND-KEPT LINKS (part level): ' + n + ' parts; section right ' + sect + '/' + n + ' (' + (100 * sect / n).toFixed(0) + '%); point right at first guess ' + hit + '/' + n + ' (' + (100 * hit / n).toFixed(0) + '%)');
  console.log('check list (blind): ' + blind.check.length + ' sheets');
}

/* THE HAND CHECK, BY SHEET (§3.4): a part that kept an old hand-kept link keeps it; every other part of the sheet takes the point given. */
function setSheet(pid, point) {
  const { qs, specs } = load(), old = oldLinks(specs), code = SUBJ[pid.charAt(5)];
  if (!specs[code] || !specs[code].points.some(p => p.id === point)) throw new Error('no point ' + point + ' in aqa-' + code);
  const byQ = new Set(qs.filter(r => r.paper_id === pid && old.has(r.row_id)).map(r => r.question));
  let n = 0;
  qs.forEach(r => { if (r.kind === 'question' && r.paper_id === pid && !byQ.has(r.question)) { r.spec_ref = 'aqa-' + code + ':' + point; n++; } });
  save(qs);
  console.log('spec-tag: ' + pid + ' -> aqa-' + code + ':' + point + ' on ' + n + ' parts');
}
const save = qs => fs.writeFileSync(path.join(ROOT, 'data/questions.json'), '[\n' + qs.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');

function write() {
  const { qs, out, check, sheetPick } = tag({});
  let n = 0;
  qs.forEach(r => { if (r.kind === 'question' && out.has(r.row_id) && !r.spec_ref && out.get(r.row_id).length) { r.spec_ref = out.get(r.row_id).join(' '); n++; } });
  save(qs);
  console.log('spec-tag: ' + n + ' parts tagged; ' + out.size + ' W-AT parts in all');
  console.log('check list (' + check.length + ' sheets):');
  check.forEach(pid => { const p = sheetPick[pid]; console.log('  ' + pid + ' -> ' + p.best + ' (' + p.score.toFixed(2) + ') vs ' + p.next + ' (' + p.nextScore.toFixed(2) + ')'); });
}

if (require.main === module) {
  const cmd = process.argv[2];
  if (cmd === 'measure') measure(); else if (cmd === 'write') write(); else if (cmd === 'set') setSheet(process.argv[3], process.argv[4]);
  else if (cmd === 'show') { const { sheetPick } = tag({}); Object.entries(sheetPick).forEach(([k, p]) => console.log(k, p.sec, p.best, p.score.toFixed(2), p.next, p.nextScore.toFixed(2))); }
  else console.log('usage: node tools/spec-tag.js measure | write | show');
}
module.exports = { tag };
