#!/usr/bin/env node
/* @family. — tools/coverage.js: the published spec's numbered points are what must exist (docs/history/1213).
   node tools/coverage.js [-v] [--subject Physics]: lessons, practice and figures per point, into data/coverage-health.json. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const jr = f => { try { return JSON.parse(fs.readFileSync(path.join(ROOT, f), 'utf8')); } catch (e) { return null; } };

/* WORDS THAT NAME NOTHING: a point's title is matched on what is left. */
const STOP = new Set('the and of in a an to for its their with from as on by or is are be using use uses used how what which between its into other some different'.split(' '));
const stem = w => w.toLowerCase().replace(/[’']s$/, '').replace(/(?:ies)$/, 'y').replace(/(?:es|s)$/, '').replace(/(?:ing|ed)$/, '');
const words = s => String(s || '').toLowerCase().replace(/<[^>]+>/g, ' ').replace(/[^a-z0-9\s-]/g, ' ').split(/[\s-]+/).filter(Boolean);
const keysOf = p => (p.keys && p.keys.length ? p.keys.map(k => words(k).map(stem)) : [words(p.title).filter(w => w.length > 2 && !STOP.has(w) && !/^\d+$/.test(w)).map(stem)]);
/* A TEXT MEETS A POINT when every word of one of its keys is in it — the title's own words when no key is written; a long
   title (four words or more) needs three in five, since a question rarely restates a heading whole. */
function meets(p, bag) {
  return keysOf(p).some(k => { if (!k.length) return false; const got = k.filter(w => bag.has(w)).length;
    return p.keys && p.keys.length ? got === k.length : got >= (k.length >= 4 ? Math.ceil(k.length * 0.6) : k.length); });
}
const bagOf = s => new Set(words(s).map(stem));
const listOf = v => String(v || '').split(/\s*[,|]\s*/).map(s => s.trim()).filter(Boolean);

/* THE LESSON SHAPE: a definition as the card's key word, then these four lines in this order on its worked page. */
const SHAPE = ['Explanation', 'Worked example', 'Common mistake', 'Check'];
const shapeOk = p => { const ls = String(p.points || '').split('|').map(l => l.trim().replace(/^\[H\]\s*/, '').split(' — ')[0]);
  return !!String(p.words || '').trim() && ls.length === SHAPE.length && SHAPE.every((h, i) => ls[i] === h); };

function specs() {
  const dir = path.join(ROOT, 'data/specs');
  return (fs.existsSync(dir) ? fs.readdirSync(dir) : []).filter(f => /\.json$/.test(f)).sort().map(f => Object.assign(jr('data/specs/' + f), { file: 'data/specs/' + f }));
}

/* WHICH SUBJECT'S QUESTIONS COUNT: its own, and Combined Science's on the same topic (the topic names are shared) or untagged. */
const qSubjects = S => S.subject === 'Maths' ? ['Maths'] : [S.subject, 'Combined Science'];

function coverage() {
  const Q = jr('data/questions.json') || [], T = jr('data/textbooks.json') || [];
  const PQ = jr('data-private/questions.json'), PT = jr('data-private/textbooks.json') || {};
  /* A CHAPTER'S BLANK CELL IS ITS COVER ROW'S (chapter 0), as the site reads it. */
  const cover = {}; T.filter(r => String(r.chapter) === '0').forEach(r => { cover[r.book_id] = r; });
  const own = r => { const c = cover[r.book_id] || {}, o = Object.assign({}, r); ['subject', 'level', 'board', 'topics'].forEach(k => { if (!o[k]) o[k] = c[k] || ''; }); return o; };
  const animAt = new Set(T.filter(r => r.anim).map(r => r.book_id + '#' + r.chapter));
  const out = { v: 1, privateText: !!PQ, subjects: {}, work: [] };
  specs().forEach(S => {
    const pts = (S.points || []).filter(p => !p.retired), secTopic = id => (S.topics || {})['4.' + id.split('.')[1]] || p0(id);
    function p0(id) { return (S.topics || {})[id[0]] || ''; }
    const topicOf = p => p.topics && p.topics.length ? p.topics : [secTopic(p.id)].filter(Boolean);
    /* LESSONS: a content card naming the point in `spec_ref`, or wearing one of the point's own fine topics (maths). */
    const cards = T.filter(r => !r.anim && r.chapter).map(own).filter(r => r.subject === S.subject && r.level === S.level);
    const lessonOf = {}, figOf = {};
    cards.forEach(r => {
      const named = listOf(r.spec_ref), tops = listOf(r.topics), key = r.book_id + '#' + r.chapter;
      /* A FIGURE: the card's own drawing, or a teaching animation filed under the same chapter. */
      const has = /\bdiagram\b/.test(r.lib_has || '') || !!(PT[key] && PT[key].diagram) || !!r.diagram || animAt.has(key);
      /* ONE LESSON SHAPE (owner, 12 Nov): a card made for spec points counts once its worked page runs in the five steps. */
      if (named.length && PT[key] && !shapeOk(PT[key])) { out.work.push({ kind: 'spec-lesson', where: `${S.subject} ${key}`, say: 'not in the lesson shape: ' + SHAPE.join(' → ') }); return; }
      pts.forEach(p => {
        const fine = p.topics && p.topics.length;
        if (named.indexOf(p.id) !== -1 || (fine && p.topics.some(t => tops.indexOf(t) !== -1))) {
          (lessonOf[p.id] = lessonOf[p.id] || []).push(key); if (has) figOf[p.id] = true; }
      });
    });
    /* QUESTIONS: named by `spec_ref`, else on the point's topic (or untagged) with the point's words in the question. */
    const subs = qSubjects(S), qs = Q.filter(r => subs.indexOf(r.subject) !== -1 && /GCSE/.test(r.level || '') && r.active !== 'False');
    const pracOf = {};
    qs.forEach(r => {
      const named = listOf(r.spec_ref), tops = listOf(r.topics), text = (PQ && PQ[r.row_id] && PQ[r.row_id].html) || '';
      let bag = null;
      pts.forEach(p => {
        let hit = named.indexOf(p.id) !== -1;
        if (!hit && !named.length) {
          const pt = topicOf(p), onTopic = tops.some(t => pt.indexOf(t) !== -1);
          if (p.topics && p.topics.length) hit = onTopic;
          else if (text && (onTopic || (!tops.length && r.subject === S.subject) || (!tops.length && r.subject === 'Combined Science'))) { bag = bag || bagOf(text); hit = meets(p, bag); }
        }
        if (hit) pracOf[p.id] = (pracOf[p.id] || 0) + 1;
      });
    });
    const figPts = pts.filter(p => p.figure && p.figure.length && lessonOf[p.id]);
    const sub = out.subjects[S.subject] = { spec: S.title, file: S.file, points: pts.length,
      lesson: pts.filter(p => lessonOf[p.id]).length, practice: pts.filter(p => pracOf[p.id]).length,
      figureNeed: figPts.length, figureHave: figPts.filter(p => figOf[p.id]).length,
      each: pts.map(p => ({ id: p.id, title: p.title, lessons: lessonOf[p.id] || [], questions: pracOf[p.id] || 0, figure: (p.figure || []).join(' '), drawn: !!figOf[p.id] })) };
    const at = p => `${S.subject} ${p.id} ${p.title}`;
    pts.forEach(p => {
      if (!lessonOf[p.id]) out.work.push({ kind: 'spec-lesson', where: at(p), say: 'no lesson' + (p.figure ? ' (needs a figure: ' + p.figure.join(', ') + ')' : '') });
      if (!pracOf[p.id] && PQ) out.work.push({ kind: 'spec-practice', where: at(p), say: 'no practice question' });
      if (lessonOf[p.id] && p.figure && !figOf[p.id]) out.work.push({ kind: 'spec-figure', where: at(p), say: `lesson ${lessonOf[p.id][0]} has no figure (the spec says ${p.figure.join(', ')})` });
    });
    sub.lessonPct = Math.round(sub.lesson / sub.points * 100);
  });
  /* THREE RULES, summed over every subject: each point taught, each point practised, each picture-point drawn. */
  const sum = k => Object.values(out.subjects).reduce((a, s) => a + s[k], 0);
  const rule = (id, label, ok, of, unit) => ({ id, group: 'content', label, ok, of, kinds: [id], unit });
  out.rules = [rule('spec-lesson', 'Spec points with a lesson', sum('lesson'), sum('points'), 'spec points'),
    rule('spec-figure', 'Lessons with a figure where the spec point is a diagram, graph, apparatus or structure', sum('figureHave'), sum('figureNeed'), 'lessons')]
    .concat(PQ ? [rule('spec-practice', 'Spec points with practice questions', sum('practice'), sum('points'), 'spec points')] : []);
  return out;
}
module.exports = { coverage };

if (require.main === module) {
  const C = coverage(), arg = k => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : ''; }, only = arg('--subject');
  Object.keys(C.subjects).forEach(k => { const s = C.subjects[k];
    console.log(`${k} (${s.spec}): lessons ${s.lesson}/${s.points}, practice ${C.privateText ? s.practice + '/' + s.points : 'not measured (no data-private)'}, figures ${s.figureHave}/${s.figureNeed}`); });
  if (!C.privateText) console.log('data-private/questions.json is absent: practice was not measured, and the last measure is kept.');
  const keep = C.privateText ? C : Object.assign(C, { rules: C.rules.concat(((jr('data/coverage-health.json') || {}).rules || []).filter(r => r.id === 'spec-practice')) });
  const slim = Object.assign({}, keep, { subjects: Object.fromEntries(Object.entries(keep.subjects).map(([k, s]) => [k, Object.assign({}, s, { each: undefined })])) });
  fs.writeFileSync(path.join(ROOT, 'data/coverage-health.json'), JSON.stringify(slim, null, 1) + '\n');
  if (process.argv.indexOf('-v') > 0) C.work.filter(w => !only || w.where.indexOf(only + ' ') === 0).forEach(w => console.log(`  ${w.kind}  ${w.where}: ${w.say}`));
}
