/* @family. — tools/lib/ideas.js ONE CARD PER IDEA, MATHS PILOT (queue step 10, 22 Nov; pilot steps 1 and 2): which maths content cards
   (data/textbooks.json chapter rows, kind content) teach the same idea, and the three fields that say so. Only adds: nothing is merged or deleted.
     part_of   the data/topics.json node the card sits in (its most specific topic, the one its title names best)
     specs     the spec points it teaches, as <spec file id>:<point> (data/spec/<id>.json), space-separated: "aqa-8300:N7 edexcel-1ma1:N7"
     idea_id   a stable id, ma.<strand>.<node label>, one for every card of a group — NOT `idea`: that is already the card's private
               "the idea" sentence (library-schema.js textbooks.cols, lib_content), which the card draws.
   Cards are the same idea when (a) their titles are the same once the spec code is off, (b) they sit in the same node and their titles name it, or (c) each
   teaches exactly one GCSE spec point and it is the same point (AQA 8300 and Edexcel 1MA1 number the one DfE subject content alike).
   Run by `node tools/content.js ideas` (data/settings/content.json sources.ideas: measure → tag); checked by tools/one-idea.js. */
'use strict';
const SD = require('./site-data.js');
const fs = require('fs'), path = require('path');
const { ROOT, S } = require('./gen.js');

const SUBJECT = 'Maths';
/* THE BOOKS LEFT OUT, and why: the owner's call (report). */
const OUTSIDE = { 'TB-QAA-MSOR': 'university course outline (QAA MSOR): 8 of its 45 cards have no topic, and the topics.json tree is school maths' };
const STRAND = { number: 'num', algebra: 'alg', ratio: 'rat', geom: 'geo', prob: 'prob', stats: 'stat', alevel: 'pure', alstats: 'alstat', almech: 'mech' };
const ALEVEL_ROOTS = new Set(['alevel', 'alstats', 'almech']);
/* SPEC POINTS THAT ARE ONE NATIONAL POINT: both GCSE specs number the DfE content alike (N1…S6). */
const SAME_POINT = { 'aqa-8300': 'gcse', 'edexcel-1ma1': 'gcse' };

const slug = s => S(s).toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const CODE = /^\s*(?:[A-Z]{1,2}\d+[a-z]?|\d+(?:\.\d+)+|L\d)\s+/;
const STOP = new Set('the and of a an to in on for with by its from as or using use'.split(' '));
const stem = w => w.replace(/ies$/, 'y').replace(/([^s])s$/, '$1');
const wordsOf = s => S(s).toLowerCase().replace(/&/g, ' ').split(/[^a-z0-9]+/).filter(w => w && !STOP.has(w)).map(stem);
const normTitle = s => wordsOf(S(s).replace(CODE, '')).join(' ');

/* THE TREE: maths nodes of data/topics.json, by id and by spelling (label and aliases). */
function tree() {
  const t = SD.json('data/topics.json'), by = {};
  t.forEach(x => { by[x.topic_id] = x; });
  const rootOf = x => { let y = x; while (y && S(y.parent_id)) y = by[y.parent_id]; return y; };
  const nodes = t.filter(x => { const r = rootOf(x); return r && r.only_subject === SUBJECT; });
  const spell = {};
  nodes.forEach(x => [x.label].concat(S(x.aliases).split(/\s*[,|]\s*/)).filter(Boolean)
    .forEach(l => { const k = l.toLowerCase(); (spell[k] = spell[k] || []).push(x.topic_id); }));
  const depth = x => { let d = 0, y = x; while (S(y.parent_id)) { y = by[y.parent_id]; d++; } return d; };
  return { by, nodes, spell, rootOf, depth, ids: new Set(nodes.map(x => x.topic_id)) };
}

/* THE MATHS CARDS: chapter rows (not the cover, not an animation) whose subject, their own or the cover's, is Maths. */
function cardsOf(rows) {
  const cover = {};
  rows.forEach(r => { if (Number(r.chapter) === 0) cover[r.book_id] = r; });
  const pick = (r, k) => S(r[k]) || S((cover[r.book_id] || {})[k]);
  return rows.filter(r => Number(r.chapter) > 0 && !S(r.anim) && pick(r, 'subject') === SUBJECT)
    .map(r => ({ row: r, key: 'ct:' + r.book_id + '-' + r.chapter, book: r.book_id, level: pick(r, 'level'), board: pick(r, 'board'), spec: pick(r, 'spec'),
      outside: !!OUTSIDE[r.book_id] }));
}
const inScope = c => !c.outside;

/* THE SPEC FILES of the subject, and every ct: link their points hold. */
function specFiles() {
  const dir = path.join(ROOT, 'data', 'spec');
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).map(f => SD.json('data/spec/' + f)).filter(s => s && s.subject === SUBJECT);
}

function specsOf(c, files) {
  const out = new Set(), r = c.row;
  const own = files.find(s => s.board === c.board && S(s.code) === c.spec);
  if (own) {
    const pts = new Set(own.points.map(p => p.id));
    S(r.spec_ref).split(/\s+/).filter(Boolean).forEach(p => { if (pts.has(p)) out.add(own.id + ':' + p); });
    const m = /^\s*([A-Z]{1,2}\d+[a-z]?|\d+(?:\.\d+)+)\s/.exec(S(r.title));
    if (m && pts.has(m[1])) out.add(own.id + ':' + m[1]);
  }
  files.forEach(s => s.points.forEach(p => { if ((p.links || []).includes(c.key)) out.add(s.id + ':' + p.id); }));
  return [...out].sort();
}

/* THE NODE A CARD SITS IN: of its topics, the one its title names best; a tie goes to the deeper node, then the first listed. `named`: the title names it. */
function nodeOf(c, T) {
  const alevel = /A-Level|AS/.test(c.level);
  const cands = [];
  S(c.row.topics).split(/\s*,\s*/).filter(Boolean).forEach((t, i) => {
    /* A TOPIC SPELT AS ANOTHER SUBJECT SPELLS IT ("Forces", Physics): the maths node whose label starts with it. */
    let ids = T.spell[t.toLowerCase()] || T.nodes.filter(x => x.label.toLowerCase().startsWith(t.toLowerCase() + ' ')).map(x => x.topic_id);
    if (ids.length > 1) ids = ids.filter(id => ALEVEL_ROOTS.has(T.rootOf(T.by[id]).topic_id) === alevel).concat(ids).slice(0, 1);
    if (ids[0]) cands.push({ id: ids[0], i });
  });
  if (!cands.length) {
    const tw = new Set(wordsOf(S(c.row.title).replace(CODE, '')));
    T.nodes.forEach((x, i) => { const n = wordsOf(x.label).filter(w => tw.has(w)).length; if (n) cands.push({ id: x.topic_id, i: 1000 + i, guess: n }); });
  }
  if (!cands.length) return null;
  const tw = new Set(wordsOf(S(c.row.title).replace(CODE, '')));
  const score = x => wordsOf(T.by[x.id].label).filter(w => tw.has(w)).length;
  cands.sort((a, b) => score(b) - score(a) || T.depth(T.by[b.id]) - T.depth(T.by[a.id]) || a.i - b.i);
  return { id: cands[0].id, named: score(cands[0]) > 0 };
}

/* MEASURE: every in-scope maths card's node and specs, and the groups (union of title, node and one-point spec). */
function measure(rows) {
  const T = tree(), files = specFiles(), all = cardsOf(rows), cards = all.filter(inScope);
  cards.forEach(c => { const n = nodeOf(c, T); c.node = n && n.id; c.named = !!(n && n.named); c.specs = specsOf(c, files); });
  const up = cards.map((c, i) => i), find = i => (up[i] === i ? i : (up[i] = find(up[i])));
  const why = cards.map(() => new Set());
  const join = (key, tag) => {
    const seen = {};
    cards.forEach((c, i) => { const k = key(c); if (!k) return; if (seen[k] == null) { seen[k] = i; return; } if (find(i) !== find(seen[k])) up[find(i)] = find(seen[k]); why[i].add(tag); why[seen[k]].add(tag); });
  };
  join(c => normTitle(c.row.title), 'title');
  /* A NODE JOINS ONLY CARDS WHOSE TITLE NAMES IT: a card that sits there by its first topic alone keeps an idea of its own. */
  join(c => (c.named ? c.node : ''), 'topic');
  join(c => (c.specs.length === 1 && SAME_POINT[c.specs[0].split(':')[0]] ? SAME_POINT[c.specs[0].split(':')[0]] + ':' + c.specs[0].split(':')[1] : ''), 'spec');
  const groups = {};
  cards.forEach((c, i) => { (groups[find(i)] = groups[find(i)] || []).push(i); });
  const out = [], used = {};
  Object.values(groups).sort((a, b) => b.length - a.length || a[0] - b[0]).forEach(ix => {
    const cs = ix.map(i => cards[i]);
    /* THE GROUP'S NODE: the one most of its cards sit in, then the deeper, then the earlier in the tree. */
    const tally = {};
    cs.forEach(c => { if (c.node) tally[c.node] = (tally[c.node] || 0) + 1; });
    const order = T.nodes.map(x => x.topic_id);
    const node = Object.keys(tally).sort((a, b) => tally[b] - tally[a] || T.depth(T.by[b]) - T.depth(T.by[a]) || order.indexOf(a) - order.indexOf(b))[0] || null;
    let id = node ? 'ma.' + (STRAND[T.rootOf(T.by[node]).topic_id] || 'x') + '.' + slug(T.by[node].label) : null;
    if (id && used[id]) id += '-' + slug(normTitle(cs[0].row.title)).split('-').slice(0, 4).join('-');
    if (id) used[id] = 1;
    cs.forEach(c => { c.idea = id; });
    out.push({ idea_id: id, part_of: node, label: node ? T.by[node].label : '', cards: cs.map(c => c.key),
      titles: cs.map(c => c.row.title), levels: [...new Set(cs.map(c => c.level))], specs: [...new Set([].concat(...cs.map(c => c.specs)))].sort(),
      by: [...new Set([].concat(...ix.map(i => [...why[i]])))].sort() });
  });
  out.sort((a, b) => b.cards.length - a.cards.length || S(a.idea_id).localeCompare(S(b.idea_id)));
  return { all, cards, groups: out, tree: T };
}

/* THE REPORT, for data/settings/taxonomy.json Maths.ideas: the duplicate groups (two cards or more) and the counts. */
function report(m) {
  const dup = m.groups.filter(g => g.cards.length > 1);
  const books = {};
  m.cards.forEach(c => { books[c.book] = (books[c.book] || 0) + 1; });
  return {
    about: 'ONE CARD PER IDEA, maths pilot (queue step 10, 22 Nov): written by `node tools/content.js ideas` (tools/lib/ideas.js), checked by tools/one-idea.js. '
      + 'A group is the cards that teach one idea — same title once the spec code is off, the same topics.json node (part_of), or the one same GCSE spec point. Nothing is merged yet.',
    fields: { part_of: 'a data/topics.json node id', specs: '<data/spec id>:<point>, space-separated', idea_id: 'ma.<strand>.<node>, one per group' },
    books, outside: OUTSIDE,
    counts: { cards: m.cards.length, ideas: m.groups.length, groups: dup.length, cards_in_groups: [].concat(...dup.map(g => g.cards)).length },
    groups: dup.map(g => ({ idea_id: g.idea_id, part_of: g.part_of, cards: g.cards, titles: g.titles, levels: g.levels, specs: g.specs, by: g.by })),
  };
}

/* TAG: the three fields onto each in-scope maths card, in place; every other row is untouched. */
function tag(rows, m) {
  const of = {};
  m.cards.forEach(c => { of[c.key] = c; });
  let n = 0;
  rows.forEach(r => {
    const c = of['ct:' + r.book_id + '-' + r.chapter];
    if (!c || S(r.anim) || Number(r.chapter) === 0) return;
    const want = { part_of: c.node || '', specs: c.specs.join(' '), idea_id: c.idea || '' };
    Object.keys(want).forEach(k => { if (r[k] !== want[k]) { r[k] = want[k]; n++; } });
  });
  return n;
}

/* MERGE (queue step 3, 22 Nov): ONE CARD PER IDEA ACROSS LEVELS. Each group of `measure` becomes one card, the levels it was taught at as tags
   (its `level` and `keystage` are lists: js/find-levels.js reads a comma as a list); the others go, and nothing they said goes with them:
     the card kept   the one with words here: a board-free GCSE chapter first, then a point-by-point AQA card, then the rest (PREFER)
     its words       every key word, point and formula of every card of the group, each once; another card's "the idea" sentence becomes a point
     a broad card    one teaching GCSE points that other ideas' one-point cards teach is split by point: each of its items goes to the idea whose
                     card it reads most like (title, node, idea sentence, key-word names; rarer words count more: a score of 1 or more, and twice its own idea's); the rest stays
     animations      follow the key word they are `about`, else the card kept
     what went       Maths.ideas.merged: old key -> {to, title, level}; spec links (data/spec/) point on (relink)
   `words` is the private map (data-private/textbooks.json, "<book>#<chapter>"). On a library already merged it changes nothing. */
const PREFER = ['TB-GCSE-MATHS', 'TB-AQA-8300', 'TB-GCSE-MATHS-1MA1'];
const FIELDS = ['words', 'points', 'formulas'];
const PRIV = ['idea', 'words', 'points', 'formulas', 'diagram'];
const items = v => S(v).split('|').map(x => x.trim()).filter(Boolean);
const listJoin = (a, b) => [...new Set(S(a).split(/\s*,\s*/).concat(S(b).split(/\s*,\s*/)).filter(Boolean))].join(', ');
const nameOf = item => S(item).split(/\s+—\s+/)[0].trim().toLowerCase();
function merge(rows, words, m) {
  const wk = c => c.book + '#' + c.row.chapter, W = c => words[wk(c)] || {};
  const has = c => FIELDS.some(f => S(W(c)[f]));
  const byIdea = {};
  m.cards.forEach(c => { (byIdea[c.idea] = byIdea[c.idea] || []).push(c); });
  const rank = c => (has(c) ? 0 : 10) + (PREFER.indexOf(c.book) === -1 ? 5 : PREFER.indexOf(c.book));
  const canon = {};
  Object.keys(byIdea).forEach(id => { canon[id] = byIdea[id].slice().sort((a, b) => rank(a) - rank(b))[0]; });
  /* EACH GCSE POINT'S IDEA: the idea of a card that teaches that one point alone. */
  const gp = ref => { const [f, p] = ref.split(':'); return SAME_POINT[f] ? SAME_POINT[f] + ':' + p : ''; };
  const pointIdea = {};
  m.cards.forEach(c => { if (c.specs.length === 1 && gp(c.specs[0]) && !pointIdea[gp(c.specs[0])]) pointIdea[gp(c.specs[0])] = c.idea; });
  const label = id => (m.groups.find(x => x.idea_id === id) || {}).label || '';
  const prof = {};
  /* AN IDEA READS AS its card's title, its node, its "the idea" sentence and its key words' names; a word many ideas share counts little. */
  Object.keys(canon).forEach(id => { const k = canon[id];
    prof[id] = new Set(wordsOf([S(k.row.title).replace(CODE, ''), label(id), W(k).idea].concat(items(W(k).words).map(nameOf)).join(' '))); });
  const df = {};
  Object.values(prof).forEach(p => p.forEach(w => { df[w] = (df[w] || 0) + 1; }));
  const acc = {}, anchor = {};
  Object.keys(canon).forEach(id => { acc[id] = { words: [], points: [], formulas: [] }; });
  const put = (id, f, item) => { if (!acc[id][f].includes(item)) acc[id][f].push(item); };
  let moved = 0;
  /* THE CARDS KEPT FIRST, so their own items lead; then the others, in the order the library holds them. */
  const order = Object.keys(canon).map(id => canon[id]).concat(m.cards.filter(c => canon[c.idea] !== c));
  order.forEach(c => {
    const cands = [...new Set([c.idea].concat(c.specs.map(r => pointIdea[gp(r)]).filter(Boolean)))];
    FIELDS.forEach(f => items(W(c)[f]).forEach(item => {
      let to = c.idea;
      if (cands.length > 1) {
        const iw = [...new Set(wordsOf(item))], sc = id => iw.reduce((t, w) => t + (prof[id].has(w) ? 1 / df[w] : 0), 0);
        const best = cands.slice(1).sort((a, b) => sc(b) - sc(a))[0];
        if (sc(best) >= 1 && sc(best) > 2 * sc(c.idea)) { to = best; moved++; }
      }
      put(to, f, item);
      if (f === 'words') anchor[wk(c) + '|' + nameOf(item)] = to;
    }));
    const own = S(W(c).idea);
    if (canon[c.idea] !== c && own && own !== S(W(canon[c.idea]).idea)) put(c.idea, 'points', own);
  });
  /* THE ROWS: the card kept takes the group's levels, key stages, topics and own spec points, and the idea's name; the others go. */
  const keyOf = c => 'ct:' + c.book + '-' + c.row.chapter, merged = {}, gone = new Set(), place = {};
  const cover = b => rows.find(x => x.book_id === b && Number(x.chapter) === 0) || {};
  Object.keys(canon).forEach(id => {
    const k = canon[id], g = byIdea[id], r = k.row;
    if (g.length > 1) {
      r.level = [...new Set(g.map(c => c.level).filter(Boolean))].join(', ');
      r.keystage = S(r.keystage) || S(cover(k.book).keystage);
      g.forEach(c => { if (c !== k) { r.keystage = listJoin(r.keystage, S(c.row.keystage) || S(cover(c.book).keystage)); r.topics = listJoin(r.topics, c.row.topics); } });
      const own = g.filter(c => c.board === k.board && c.spec === k.spec)
        .map(c => S(c.row.spec_ref) || (/^\s*([A-Z]{1,2}\d+[a-z]?)\s/.exec(S(c.row.title)) || [])[1]).filter(Boolean);
      if (own.length) r.spec_ref = [...new Set(S(r.spec_ref).split(/\s+/).filter(Boolean).concat(own))].join(' ');
      if (label(id)) r.title = label(id);
      g.forEach(c => { if (c !== k) { merged[keyOf(c)] = { to: keyOf(k), title: c.row.title, level: c.level }; gone.add(c.row); } });
    }
    place[id] = { book_id: r.book_id, chapter: r.chapter };
    const w = Object.assign({}, W(k));
    let any = false;
    FIELDS.forEach(f => { const v = acc[id][f].join('|'); if (v !== S(w[f])) any = true; if (v) w[f] = v; else delete w[f]; });
    if (!S(w.idea)) { const o = g.map(c => S(W(c).idea)).find(Boolean); if (o) { w.idea = o; any = true; } }
    if ((any || g.length > 1) && PRIV.some(f => S(w[f]))) { words[wk(k)] = w; r.lib_has = PRIV.filter(f => S(w[f])).join(' '); r.lib_pending = 'True'; }
  });
  m.cards.forEach(c => { if (gone.has(c.row)) delete words[wk(c)]; });
  /* THE ANIMATIONS follow their key word, else the card kept. */
  const cardAt = {};
  m.cards.forEach(c => { cardAt[c.book + '#' + c.row.chapter] = c; });
  const out = rows.filter(r => !gone.has(r)), anims = [];
  for (let i = out.length - 1; i >= 0; i--) {
    const r = out[i], c = S(r.anim) && cardAt[r.book_id + '#' + r.chapter];
    if (!c) continue;
    const p = place[anchor[wk(c) + '|' + S(r.about).toLowerCase()] || c.idea];
    if (p && (p.book_id !== r.book_id || Number(p.chapter) !== Number(r.chapter))) { r.book_id = p.book_id; r.chapter = p.chapter; out.splice(i, 1); anims.unshift(r); }
  }
  anims.forEach(a => { let j = out.length; out.forEach((x, i) => { if (x.book_id === a.book_id && Number(x.chapter) === Number(a.chapter)) j = i + 1; }); out.splice(j, 0, a); });
  rows.length = 0;
  out.forEach(r => rows.push(r));
  return { merged, moved, gone: gone.size, anims: anims.length };
}

/* SPEC LINKS POINT ON: a link to a card that went names the card kept (data/spec/*.json, in place). */
function relink(merged) {
  let n = 0;
  const dir = path.join(ROOT, 'data', 'spec');
  fs.readdirSync(dir).filter(f => f.endsWith('.json')).forEach(f => {
    const file = path.join(dir, f), raw = fs.readFileSync(file, 'utf8');
    if (!Object.keys(merged).some(k => raw.includes('"' + k + '"'))) return;
    const s = JSON.parse(raw);
    s.points.forEach(p => { if (!p.links) return; const l = [...new Set(p.links.map(x => (merged[x] ? merged[x].to : x)))];
      if (l.join() !== p.links.join()) { p.links = l; n++; } });
    fs.writeFileSync(file, raw.startsWith('{\n') ? JSON.stringify(s, null, 1) + '\n' : JSON.stringify(s));
  });
  return n;
}

module.exports = { SUBJECT, OUTSIDE, cardsOf, inScope, measure, report, tag, tree, normTitle, merge, relink };
