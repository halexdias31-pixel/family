#!/usr/bin/env node
/* @family. — tools/one-form.js THE ONE-FORM CHECK (rule 1.75, unify job G): every form an applicant or parent fills is described once,
   in data/settings (forms.json's kinds/rules/cards, kinds.json's `forms`), drawn by js/form.js `formOf_` and refused by the backend on the same `gaps`.
   Fails the build when: js/form.js's FORMS block is not forms.json's; a form is named that the source has not; a second FORM_SPECS / FORM_GAPS /
   formGaps_ is written by hand; backend/cards-gen.gs's gaps or gap tests differ from the site's; the phone and the backend say different things
   for the same body; or a file draws more raw input/select/textarea than forms.json `leftovers` allows. Prints the count of forms. */
'use strict';
const path = require('path'), vm = require('vm');
const { text, srcFiles, report, main } = require('./lib/gen.js');
const jsFiles = () => srcFiles('js', /\.js$/), gsFiles = () => srcFiles('backend', /\.gs$/);

function run() {
  const bad = [], gen = require('./cards-gen.js');
  const FJ = JSON.parse(text('data/settings/forms.json')), KJ = JSON.parse(text('data/settings/kinds.json'));
  const forms = {};
  Object.values(KJ.kinds).forEach(k => Object.entries(k.forms || {}).forEach(([id, f]) => {
    if (forms[id]) bad.push('form "' + id + '" is described twice in kinds.json'); forms[id] = f;
  }));
  /* 1. THE FRONT END'S SPECS ARE forms.json's, as written. */
  const formJs = text('js/form.js'), block = (formJs.match(gen.FORMS_RE) || [])[0];
  if (block !== gen.formsBlock()) bad.push('js/form.js FORMS block is not data/settings/forms.json (run tools/cards-gen.js)');
  /* 2. NO FORM DESCRIBED OUTSIDE THE SOURCE: one FORM_SPECS, FORM_TESTS, formGaps_, FORM_GAPS each; every form named is in the source. */
  const defs = [[/^const FORM_SPECS\b/m, 'js/form.js'], [/^const FORM_TESTS\b/m, 'js/form.js'], [/^function formGaps_\b/m, 'js/form.js']];
  jsFiles().forEach(f => {
    const s = text(f);
    defs.forEach(([re, home]) => { if (f !== home && re.test(s)) bad.push(f + ' defines ' + re.source.replace(/\^|\\b/g, '') + ' outside ' + home); });
    if (/^const FORM_GAPS\b/m.test(s)) bad.push(f + ' defines FORM_GAPS by hand');
    for (const m of s.matchAll(/\bformOf_\(\s*'([^']+)'/g)) if (!forms[m[1]] && !FJ.cards[m[1]]) bad.push(f + ' draws form "' + m[1] + '", not in kinds.json forms');
    for (const m of s.matchAll(/FORM_SPECS\.forms\[\s*'([^']+)'\s*\]/g)) if (!forms[m[1]]) bad.push(f + ' reads form "' + m[1] + '", not in kinds.json forms');
  });
  gsFiles().forEach(f => {
    if (f === 'backend/cards-gen.gs') return;
    const s = text(f);
    if (/^(const|let|var) (FORM_GAPS|FORM_TESTS|FORM_SPECS)\b|^function formGaps_\b/m.test(s)) bad.push(f + ' writes a form engine piece by hand (cards-gen.gs carries it)');
    for (const m of s.matchAll(/FORM_GAPS\[\s*'([^']+)'\s*\]/g)) if (!(forms[m[1]] || {}).gaps) bad.push(f + ' checks form "' + m[1] + '", which has no gaps in kinds.json');
    /* A HAND LIST OF WHAT A FORM LACKS ("your full name", …) is the drift this replaced. */
    if (/missing\.push\(\s*'your /.test(s)) bad.push(f + ' lists a form\'s gaps by hand: put them in kinds.json `gaps`');
  });
  /* 3. THE BACKEND'S COPY IS THE SITE'S: the same gaps, the same tests, the same words for the same body. */
  const gs = text('backend/cards-gen.gs'), want = {};
  Object.entries(forms).forEach(([id, f]) => { if (f.gaps) want[id] = f.gaps; });
  const grab = (src, start) => { const i = src.indexOf(start); if (i < 0) return null; const e = src.indexOf('\n}', i); return src.slice(i, e + 2); };
  ['const FORM_TESTS = {', 'function formGaps_('].forEach(h => {
    const a = grab(formJs, h), b = grab(gs, h);
    if (!a || a !== b) bad.push('backend/cards-gen.gs ' + h.replace(/ = \{|\($/, '') + ' is not js/form.js\'s (run tools/cards-gen.js)');
  });
  const gm = gs.match(/^const FORM_GAPS = (.*);$/m);
  if (!gm || gm[1] !== JSON.stringify(want)) bad.push('backend/cards-gen.gs FORM_GAPS is not kinds.json\'s forms gaps (run tools/cards-gen.js)');
  const engine = src => { const c = {}; vm.createContext(c); vm.runInContext(grab(src, 'const FORM_TESTS = {') + '\n' + grab(src, 'function formGaps_(') + '\nthis.g = formGaps_;', c); return c.g; };
  let say = 0;
  try {
    const site = engine(formJs), back = engine(gs);
    Object.entries(want).forEach(([id, gaps]) => {
      const fields = (forms[id].fields || []).map(x => x.f).filter(Boolean);
      const known = new Set(fields.concat(['qualDocs']));
      gaps.forEach(g => [].concat(g.all || [], ...(g.any || [])).forEach(t => {
        const [f, test] = t.split(':');
        if (!known.has(f)) bad.push(id + ' gap "' + g.say + '" tests "' + f + '", not one of its fields');
        if (!/^(filled|email|postcode|isodate|image|pics|yes|yesno|rate)$/.test(test)) bad.push(id + ' gap "' + g.say + '" has unknown test "' + test + '"');
      }));
      const empty = {}, full = {};
      const fill = { filled: 'x', email: 'a@b.co', postcode: 'SW1A 1AA', isodate: '2000-01-01', image: 'data:image/png;base64,x', pics: ['data:image/png;base64,x'], yes: 'TRUE', yesno: 'yes', rate: '30' };
      gaps.forEach(g => [].concat(g.all || [], ...(g.any || [])).forEach(t => { const [f, test] = t.split(':'); full[f] = fill[test]; }));
      [empty, full].forEach(body => {
        const a = JSON.stringify(site(gaps, body)), b = JSON.stringify(back(gaps, body)); say++;
        if (a !== b) bad.push(id + ': the phone says ' + a + ' but the backend ' + b);
      });
      if (site(gaps, empty).length !== gaps.length) bad.push(id + ': an empty form is not missing every gap');
      if (site(gaps, full).length) bad.push(id + ': a full form still lacks ' + site(gaps, full).join(', '));
    });
  } catch (e) { bad.push('form engine would not run: ' + e.message); }
  /* 4. RAW CONTROLS OUTSIDE THE MAKER: no more than forms.json `leftovers` allows, per file. */
  const left = FJ.leftovers || {};
  jsFiles().forEach(f => {
    const n = (text(f).match(/<(input|select|textarea)\b/g) || []).length, cap = (left[path.basename(f)] || {}).n || 0;
    if (f !== 'js/form.js' && n > cap) bad.push(f + ' draws ' + n + ' raw input/select/textarea, forms.json leftovers allows ' + cap);
  });
  console.log('one-form: ' + Object.keys(forms).length + ' forms from kinds.json, ' + Object.keys(want).length + ' with gaps, ' + say + ' bodies asked both sides; ' + bad.length + ' wrong');
  report('one-form', bad, 'form(s) outside the one source');
}
module.exports = { run };
main(module, run);
