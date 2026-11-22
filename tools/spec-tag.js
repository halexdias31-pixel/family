#!/usr/bin/env node
/* @family. — tools/spec-tag.js THE SPEC TAGGER (docs/library-structure.md §3, 18 Nov): gives each Access Tuition worksheet part
   (paper_id W-AT-B/C/P-*) its `spec_ref`, the AQA spec point it tests (`aqa-8461:4.1.1.2`; several are space-separated, the first the main one).
   Not part of the build: run once, then by hand. tools/spec-links.js turns the tags into the spec points' `q:` links.
     node tools/spec-tag.js measure   the tagger's guesses against the hand-tagged sheets (HAND below) and the old hand-kept links
     node tools/spec-tag.js write [--all] [--words f]   tags every W-AT part with no spec_ref yet (--all: every W-AT part)
     node tools/spec-tag.js set <paper_id> <point>   the hand check, by sheet: the sheet's parts that took the sheet's guess take <point>
   With --words <file> (or SPEC_WORDS; the parts' own words, private, never in the repo) each part is then scored on its own words
   against every point of its spec (points outside the sheet's section count half): a stem takes the point its words say clearly, its
   parts inherit it, and a part moves only when its own words beat the point it would keep; when unsure it keeps the sheet's main point.
   Measured 18 Nov (exact point, part level): 22% -> 78% (old links 17 -> 66/81; 3 sheets hand-tagged by part 20 -> 69/91).
   Sheet-level guess, with public words only: 1. the sheet's `topics` is an AQA section's `topic`
   (data/spec/aqa-846x.json) — exact, so 8 to 25 candidate points; 2. the sheet's title scored against each leaf point's text, its parent's,
   its `keys[]` and its point-by-point card's title and words; 3. a part an old hand-kept `q:` link named keeps that point, and the other
   parts of its question inherit it (they share a stem); the rest of the sheet takes the sheet's best point.
   The check list: sheets whose best point scored low, or barely beat the next. */
'use strict';
const SD = require('./lib/site-data.js');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const SUBJ = { B: '8461', C: '8462', P: '8463' };
const STOP = new Set('the and of in a an to for with its from by on at as or be is are their them this that how what using use uses'.split(' '));
const stem = w => w.replace(/&rsquo;s$|'s$/, '').replace(/(ies)$/, 'y').replace(/([^s])s$/, '$1').replace(/ing$/, '');
const words = s => String(s || '').toLowerCase().replace(/&[a-z]+;/g, ' ').replace(/<[^>]*>/g, ' ').split(/[^a-z0-9]+/)
  .filter(w => (w.length > 1 || /\d/.test(w)) && !STOP.has(w)).map(stem);

/* THREE SHEETS TAGGED BY HAND, PART BY PART (18 Nov, from each part's own words): the point each part tests. */
const HAND = {
  'W-AT-B-cell-structure': { code: '8461', parts: {
    '1a': '4.1.1.1', '1b': '4.1.1.1', '1c': '4.1.1.2', '1d': '4.1.1.5', '1e': '4.1.1.1', '1f': '4.1.1.6', '1g': '4.1.1.6', '1h': '4.1.1.6',
    '2a': '4.1.1.2', '2b': '4.1.1.2', '3a': '4.1.1.2', '3b': '4.1.2.2', '3ci': '4.1.2.3', '3cii': '4.1.2.3',
    '4a': '4.1.1.3', '4b': '4.1.1.5', '4c': '4.1.1.2', '4di': '4.1.1.2', '4dii': '4.1.1.5',
    '5a': '4.1.1.2', '5b': '4.1.2.2', '5c': '4.1.1.5', '5d': '4.1.1.5', '5e': '4.1.1.5', '5f': '4.1.1.5',
    '6a': '4.1.1.5', '6b': '4.1.1.5', '6c': '4.1.1.3', '6d': '4.2.3.2', '6e': '4.1.3.3' } },
  'W-AT-C-atomic-structure': { code: '8462', parts: {
    '1a': '4.1.1.4', '1b': '4.1.1.5', '1c': '4.1.1.5', '1d': '4.1.1.5', '1e': '4.1.1.3', '1f': '4.1.1.6', '1g': '4.1.1.5',
    '2a': '4.1.1.7', '2b': '4.1.2.6', '2c': '4.1.2.1', '2d': '4.1.2.4', '2e': '4.1.1.6',
    '3ai': '4.1.1.5', '3aii': '4.1.1.4', '3aiii': '4.1.1.4', '3b': '4.1.1.4', '3c': '4.1.1.7', '3di': '4.1.1.7', '3dii': '4.1.2.4',
    '4ai': '4.1.1.7', '4aii': '4.1.1.4', '4aiii': '4.1.1.4', '4b': '4.1.1.7',
    '5a': '4.4.1.3', '5b': '4.1.1.1', '5ci': '4.1.1.4', '5cii': '4.1.2.1', '5di': '4.1.1.1', '5dii': '4.10.2.2', '5e': '4.1.2.3',
    '6a': '4.1.1.5', '6b': '4.3.2.1', '6c': '4.1.1.5' } },
  'W-AT-P-momentum': { code: '8463', parts: {
    '1ai': '4.5.7.1', '1aii': '4.5.7.1', '1aiii': '4.5.7.2', '1b': '4.5.7.2', '2a': '4.5.7.1', '2b': '4.5.7.1', '2c': '4.5.7.2',
    '3a': '4.5.7.2', '3b': '4.5.7.2', '4ai': '4.5.7.2', '4aii': '4.5.7.2', '4bi': '4.5.7.1', '4bii': '4.5.7.2',
    '5a': '4.5.7.1', '5b': '4.5.7.3', '5c': '4.5.7.3', '6ai': '4.5.7.1', '6aii': '4.5.7.1', '6bi': '4.1.1.2', '6bii': '4.1.1.2', '6biii': '4.5.6.1.5',
    '7ai': '4.5.6.3.1', '7aii': '4.5.6.3.3', '7aiii': '4.5.6.3.4', '7b': '4.5.6.1.4', '7ci': '4.5.7.2', '7cii': '4.5.7.2', '7d': '4.5.7.3' } },
};
/* THE OLD HAND-KEPT LINKS (81 parts), as they stood before the tags replaced them: the second yardstick. */
const OLD_REV = 'a328d1e^';
/* EACH PART'S OWN WORDS (private: never in the repo): {row_id: {q, a}}, stems as S-<paper>-q<n>. Given by --words <file>. */
function partWords() {
  const i = process.argv.indexOf('--words'), f = i > 0 ? process.argv[i + 1] : process.env.SPEC_WORDS;
  return f && fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : null;
}

function load() {
  const qs = SD.questions();
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
    return { id: p.id, order, sec: p.id.split('.').slice(0, 2).join('.'), phrases: (p.keys || []).map(k => flat(k)).filter(k => k.trim().includes(' ')),
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

/* THE OLD HAND-KEPT LINKS: part row_id -> the points that named it, read from the spec files as they stood at OLD_REV. */
function oldLinks() {
  const m = new Map();
  Object.values(SUBJ).forEach(c => {
    let sp; try { sp = JSON.parse(require('child_process').execSync('git show ' + OLD_REV + ':data/spec/aqa-' + c + '.json', { cwd: ROOT, maxBuffer: 1 << 26 })); } catch (e) { return; }
    sp.points.forEach(p => (p.links || []).forEach(l => {
      const r = /^q:(Q-W-AT-.+)$/.exec(l); if (r) { if (!m.has(r[1])) m.set(r[1], []); m.get(r[1]).push('aqa-' + c + ':' + p.id); }
    }));
  });
  return m;
}

/* A PART'S WORDS SCORED AGAINST EACH POINT: each word counts its strongest bag, less for words many points share; a key phrase
   found whole adds 1.5; a point outside the sheet's section counts at OUT (a part may stray, e.g. a cells sheet's transpiration part). */
const OUT = 0.5, KEEP = 1.0, MIN = 1.5;
const flat = s => ' ' + words(s).join(' ') + ' ';
function scoreText(text, docs, secId) {
  const t = new Set(words(text)), ft = flat(text), df = {};
  t.forEach(w => { df[w] = docs.filter(d => d.bags.some(([, b]) => b.has(w))).length || 1; });
  return docs.map(d => {
    let s = 0;
    t.forEach(w => { const best = Math.max(0, ...d.bags.map(([k, b]) => (b.has(w) ? k : 0))); if (best) s += best / Math.sqrt(df[w]); });
    d.phrases.forEach(ph => { if (ft.includes(ph)) s += 1.5; });
    return { id: d.id, s: s * (d.sec === secId ? 1 : OUT), order: d.order };
  }).sort((a, b) => b.s - a.s || a.order - b.order);
}
/* The pick for some words: the best point, if it scored at least MIN and beat `base` (the point it would otherwise keep) by KEEP times. */
function pick(text, docs, secId, base) {
  if (!text) return null;
  const sc = scoreText(text, docs, secId), best = sc[0], b = sc.find(x => x.id === base);
  if (!best || best.s < MIN || best.id === base) return null;
  return best.s >= KEEP * (b ? b.s : 0) + 0.5 ? best.id : null;
}
const plain = r => (r ? [r.q, r.a].join(' ') : '').replace(/&[a-z#0-9]+;/gi, ' ');

function tag(opt) {
  const { qs, specs, card } = load();
  const old = opt.noOld ? new Map() : oldLinks(), pw = opt.words === undefined ? partWords() : opt.words;
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
    const main = best && best.id, all = docsOf[code], stemPick = {};
    parts.forEach(r => {
      const own = old.get(r.row_id) || (byQ[r.question] ? [...byQ[r.question]] : null);
      if (own) return out.set(r.row_id, [...new Set(own)]);
      if (!main) return out.set(r.row_id, []);
      let pt = main;
      if (pw) {
        const q = r.question, sid = 'S-' + doc.paper_id + '-q' + q;
        /* the stem's point, from its own words (else the sheet's); its parts take it unless their own words clearly say another */
        if (!(q in stemPick)) {
          stemPick[q] = pick(plain(pw[sid]), all, sec.id, main) || main;
        }
        const base = stemPick[q];
        pt = pick(plain(pw[r.row_id]), all, sec.id, base) || base;
      }
      out.set(r.row_id, ['aqa-' + code + ':' + pt]);
    });
  });
  return { qs, out, check, sheetPick, specs };
}

function measure() {
  const blind = tag({ noOld: true }), sheet = tag({ noOld: true, words: null }), old = oldLinks();
  const rate = (o, f) => { let n = 0, hit = 0; f((rid, keys) => { const g = (o.get(rid) || [])[0]; if (!g) return; n++; if (keys.includes(g)) hit++; }); return [hit, n]; };
  const pc = ([h, n]) => h + '/' + n + ' (' + (n ? (100 * h / n).toFixed(0) : 0) + '%)';
  const hand = f => Object.entries(HAND).forEach(([pid, h]) => Object.entries(h.parts).forEach(([pp, pt]) => {
    const m = /^(\d+)(.*)$/.exec(pp); f('Q-' + pid + '-' + m[1] + m[2], ['aqa-' + h.code + ':' + pt]); }));
  const oldF = f => old.forEach((keys, rid) => f(rid, keys));
  console.log('exact point, part level, tagger blind to the old links:');
  console.log('  old hand-kept links: sheet words only ' + pc(rate(sheet.out, oldF)) + '; with part words ' + pc(rate(blind.out, oldF)));
  console.log('  3 sheets hand-tagged by part: sheet words only ' + pc(rate(sheet.out, hand)) + '; with part words ' + pc(rate(blind.out, hand)));
  const a = rate(sheet.out, oldF), b = rate(sheet.out, hand), c = rate(blind.out, oldF), d = rate(blind.out, hand);
  console.log('  together: before ' + pc([a[0] + b[0], a[1] + b[1]]) + ', after ' + pc([c[0] + d[0], c[1] + d[1]]));
  if (process.argv.includes('--misses')) { const pr = (rid, keys) => { const g = (blind.out.get(rid) || [])[0]; if (g && !keys.includes(g)) console.log('   miss ' + rid + ' got ' + g + ' want ' + keys.join(',')); }; oldF(pr); hand(pr); }
}

/* THE HAND CHECK, BY SHEET (§3.4): a part that kept an old hand-kept link keeps it; every other part of the sheet takes the point given. */
function setSheet(pid, point) {
  const { qs, specs } = load(), old = oldLinks(), code = SUBJ[pid.charAt(5)];
  if (!specs[code] || !specs[code].points.some(p => p.id === point)) throw new Error('no point ' + point + ' in aqa-' + code);
  const byQ = new Set(qs.filter(r => r.paper_id === pid && old.has(r.row_id)).map(r => r.question));
  let n = 0;
  qs.forEach(r => { if (r.kind === 'question' && r.paper_id === pid && !byQ.has(r.question)) { r.spec_ref = 'aqa-' + code + ':' + point; n++; } });
  save(qs);
  console.log('spec-tag: ' + pid + ' -> aqa-' + code + ':' + point + ' on ' + n + ' parts');
}
const save = qs => fs.writeFileSync(path.join(ROOT, 'data/questions.json'), '[\n' + qs.map(r => JSON.stringify(r)).join(',\n') + '\n]\n');

const FORCE = process.argv.includes('--all');
function write() {
  const { qs, out, check, sheetPick } = tag({});
  let n = 0;
  qs.forEach(r => { if (r.kind === 'question' && out.has(r.row_id) && out.get(r.row_id).length && (FORCE || !r.spec_ref)) { r.spec_ref = out.get(r.row_id).join(' '); n++; } });
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
