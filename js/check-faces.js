#!/usr/bin/env node
/* node js/check-faces.js — THE ANSWER BOX'S FACES (owner, 16 Nov): camera and graph swap into the box's slot through the one
   `ansFace_`, and no tool opens a sheet of its own over the page (rule: nothing opens over the app). */
'use strict';
require('../check/quiet');
const fs = require('fs'), path = require('path');
const REPO = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(REPO, f), 'utf8');
const bad = [];
const face = read('js/answer-face.js'), work = read('js/working.js'), tools = read('js/qtools.js'), css = read('style.css');
const handler = (src, act) => (new RegExp("on\\('" + act + "',[\\s\\S]*?\\n\\}\\);").exec(src) || [''])[0];

/* ONE MECHANISM: the camera and the graph tiles both reach `ansFace_`, and nothing else makes a face */
if (!/function ansFace_\(box, face, k\)/.test(face)) bad.push('answer-face.js has no `ansFace_(box, face, k)` — the one swap is missing');
if (!/ansFace_\(box, 'camera'/.test(face)) bad.push('the camera does not open through `ansFace_`');
if (!/ansFace_\(box, 'graph'/.test(face)) bad.push('the graph does not open through `ansFace_`');
if (!/camOpen_\(el, k\)/.test(handler(work, 'qp-work'))) bad.push('the camera tile (`qp-work`) does not open the camera face');
const made = (face.match(/className = 'qp-face /g) || []).length;
if (made !== 1) bad.push('a face is made in ' + made + ' places in answer-face.js — only `ansFace_` makes one');
[['js/answer-face.js', face], ['js/working.js', work], ['js/qtools.js', tools]].forEach(([n, t]) => {
  if (/qp-face/.test(t) && n !== 'js/answer-face.js' && /className = 'qp-face/.test(t)) bad.push(n + ' makes a face of its own');
});

/* NOTHING OVER THE PAGE: no dialog, no modal, no fixed or absolute sheet, nothing hung on <body> but the hidden file picker */
const OVER = /showModal\(|<dialog|createElement\('dialog'\)|position\s*[:=]\s*['"]?(fixed|absolute)|style\.position|requestFullscreen\(/;
[['js/answer-face.js', face], ['js/working.js', work]].forEach(([n, t]) => {
  const m = OVER.exec(t);
  if (m) bad.push(n + ' opens something over the page ("' + m[0] + '")');
  const body = (t.match(/document\.body\.appendChild\((\w+)\)/g) || []).filter(s => !/appendChild\(inp\)/.test(s));
  if (body.length) bad.push(n + ' hangs ' + body.join(', ') + ' on the page body — a face goes in its box');
});
const rules = [...css.matchAll(/([^{}]*\.qp-(?:face|cam|graph)[^{}]*)\{([^}]*)\}/g)];
if (!rules.length) bad.push('style.css has no `.qp-face` rules to check');
rules.forEach(r => { if (/position\s*:\s*(fixed|absolute|sticky)/.test(r[2]) || /z-index/.test(r[2])) bad.push('style.css lifts a face over the page: ' + r[1].trim()); });

/* THE STREAM STOPS: back, the last page, leaving the card, the page hidden; and it is never stored */
['visibilitychange', 'pagehide', 'isConnected', 'getTracks'].forEach(w => { if (face.indexOf(w) === -1) bad.push('answer-face.js never uses ' + w + ' — the camera may keep running'); });
if (/localStorage[\s\S]{0,80}(stream|srcObject)|(stream|srcObject)[\s\S]{0,80}localStorage/.test(face)) bad.push('answer-face.js stores the camera stream');
if (!/workAdd_\(k, \[b\]\)/.test(face)) bad.push('a shot does not go through `workAdd_` → `workShrink_` → WORK_PICS');
if (!/workPick_\(k\)/.test(face) || !/tell_\(null, 'info'/.test(face)) bad.push('no live camera: the picker fallback or its reason (`tell_`) is missing');

/* THE GRAPH: in the row and in qengine.json's row; marked by rule only, saved in the part's one record */
const row = (/const QT_ROW = \[([^\]]*)\]/.exec(tools) || [])[1] || '';
if (!/'graph'/.test(row)) bad.push('QT_ROW has no graph tile');
const qe = JSON.parse(read('data/settings/qengine.json')).row || [];
if (qe.join(' ') !== [...row.matchAll(/'([^']+)'/g)].map(m => m[1]).join(' ')) bad.push('data/settings/qengine.json `row` is not QT_ROW');
if (/aiMark|qp-ai-go|api\(/.test((/function graphMark_[\s\S]*?\n\}/.exec(face) || [''])[0])) bad.push('the graph is marked by AI — it is marked by rule only');
if (!/partRecPutAt_\(graphRecKey_\(k\), 'graph'/.test(face)) bad.push('the graph is not saved in the part\'s one record');
/* NO AI FALLBACK (owner, 16 Nov): with the graph face showing, the Check never reaches the act it wraps */
{ const gc = (/function graphCheck_[\s\S]*?\n\}/.exec(face) || [''])[0];
  if (!/if \(!m\) \{[^}]*return true; \}/.test(gc)) bad.push('a graph with no rule to mark it falls through to another marker — it should only save'); }
/* PHOTOS PERSIST (owner, 16 Nov): in the part's one record and on the account */
if (!/partRecPutAt_\(workRecKey_\(k\), 'photos'/.test(work)) bad.push('the photos are not kept in the part\'s one record');
if (!/action: 'workFileSave'/.test(work) || !/action: 'workFileOpen'/.test(work)) bad.push('the photos are not saved to or read back from the account');
if (!/workLoad_\(k\)/.test(work)) bad.push('the photos are not brought back when the question is drawn again');

/* THE RULE MARK ITSELF, in a sandbox */
{
  const vm = require('vm');
  const ctx = { ACTIONS: {}, on: () => {}, document: { addEventListener() {} }, window: { addEventListener() {} }, navigator: {} };
  vm.createContext(ctx);
  try {
    vm.runInContext(face + '\n;this.__m = graphMark_; this.__k = graphKeyOf_;', ctx);
    const x = { marks: 3, graphAnswer: 'points: (1,2) (3,-4); lines: (1,2)-(3,-4); shade: (0,0)' };
    const g = { pts: [[3, -4], [1, 2]], lines: [[[3, -4], [1, 2]]], shade: [[0, 0]] };
    const m = ctx.__m(x, g);
    if (!m || m.got !== 3 || !m.right) bad.push('a right graph is not given full marks (' + JSON.stringify(m) + ')');
    const w = ctx.__m(x, { pts: [[1, 2]], lines: [], shade: [[5, 5]] });
    if (!w || w.right || w.got !== 0) bad.push('a wrong graph is not marked down (' + JSON.stringify(w) + ')');
    if (ctx.__m({ answer: '(1,2)' }, g) !== null) bad.push('a part with no graph key is marked by the graph rule — it should only save');
  } catch (e) { bad.push('answer-face.js could not be run in a sandbox: ' + e.message); }
}

if (bad.length) { console.log('FAILED — check-faces:\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('OK — the camera and graph are faces of the one answer box, swapped by ansFace_, nothing over the page; the graph is marked by rule');
