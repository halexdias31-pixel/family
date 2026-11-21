#!/usr/bin/env node
/* @family. — tools/email-ink.js THE EMAIL-INK CHECK (rule 1.75, 20 Nov): the Sunday email a parent opens is in the site's colours and
   says what the site says. Counted site-wide: every colour the email draws by (backend/cards-gen.gs DIGEST_INK, through digest.gs
   digestInk_) must equal its style.css `:root` token (tools/cards-gen.js DIGEST_INK_TOKENS; `--email-*` where the email needs its own),
   and no hand hex colour may stand in digest.gs's ink; every escape case must give the fixed markup through the email's `esc`
   (cards-gen.gs, copied from js/core.js) and come back whole through the card maker's `cardUnesc_` (js/cards-render.js).
   Fails the build on any difference. Run by tools/build.js after cards-gen. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const ROOT = path.join(__dirname, '..');
const read = f => fs.readFileSync(path.join(ROOT, f), 'utf8');
/* ONE TOP-LEVEL `const NAME = …;` (one line, or up to the next line ending `;`) out of a file. */
function grab(src, name, file) {
  const lines = src.split('\n'), at = lines.findIndex(l => l.startsWith('const ' + name + ' '));
  if (at < 0) throw new Error('email-ink: ' + file + ' has no `const ' + name + '`');
  const out = [];
  for (let i = at; i < lines.length; i++) { out.push(lines[i]); if (/;\s*$/.test(lines[i])) break; }
  return out.join('\n');
}
/* [plain text, the email's escaped markup]: the old digestEsc_'s output for each, kept as the fixed answer. */
const CASES = [
  ['', ''],
  ['Algebra 2', 'Algebra 2'],
  ['Tom & Jerry', 'Tom &amp; Jerry'],
  ['x < y > z', 'x &lt; y &gt; z'],
  ['she said "yes"', 'she said &quot;yes&quot;'],
  ["Sam's book", 'Sam&#39;s book'],
  ['&amp;', '&amp;amp;'],
  ['&amp;amp;', '&amp;amp;amp;'],
  ['<a href="x?a=1&b=2">it\'s</a>', '&lt;a href=&quot;x?a=1&amp;b=2&quot;&gt;it&#39;s&lt;/a&gt;'],
  ['£12 — 50%', '£12 — 50%'],
];
/* [markup, text]: the old me-shelves meUnesc_'s answers, which cardUnesc_ must give too. */
const UNESC = [
  ['&quot;a&quot;', '"a"'], ['&#39;b&#039;', "'b'"], ['&lt;i&gt;', '<i>'], ['&amp;', '&'], ['&amp;lt;', '&lt;'], ['&amp;amp;', '&amp;'],
  ['plain', 'plain'],
];
function run() {
  const bad = [];
  /* ---------- THE COLOURS */
  const gen = require('./cards-gen.js');
  const want = gen.inkOf();
  const gs = read('backend/cards-gen.gs');
  const ctx = vm.createContext({});
  vm.runInContext(grab(gs, 'DIGEST_INK', 'backend/cards-gen.gs') + '\nthis.DIGEST_INK = DIGEST_INK;', ctx);
  const have = ctx.DIGEST_INK || {};
  const names = Object.keys(gen.DIGEST_INK_TOKENS);
  for (const k of names) if (String(have[k] || '').toLowerCase() !== want[k])
    bad.push('ink ' + k + ': cards-gen.gs ' + have[k] + ', style.css --' + gen.DIGEST_INK_TOKENS[k] + ' ' + want[k] + ' (run tools/cards-gen.js)');
  for (const k of Object.keys(have)) if (!(k in want)) bad.push('ink ' + k + ': in cards-gen.gs but no style.css token');
  const dg = read('backend/digest.gs');
  const inkFn = (/function digestInk_\(\) \{[\s\S]*?\n\}/.exec(dg) || [''])[0];
  if (!/DIGEST_INK/.test(inkFn)) bad.push('digest.gs digestInk_ does not draw from DIGEST_INK');
  if (/#[0-9a-f]{3,8}\b/i.test(inkFn)) bad.push('digest.gs digestInk_ holds a hand hex colour');
  if (/function digestEsc_\b/.test(dg)) bad.push('digest.gs has its own digestEsc_ again; use the generated esc');
  /* ---------- THE ESCAPES */
  vm.runInContext(grab(gs, 'esc', 'backend/cards-gen.gs') + '\nthis.esc = esc;', ctx);
  const cr = read('js/cards-render.js');
  vm.runInContext(grab(cr, 'CARD_UNESC_', 'js/cards-render.js') + '\n' + grab(cr, 'cardUnesc_', 'js/cards-render.js') + '\nthis.cardUnesc_ = cardUnesc_;', ctx);
  const siteEsc = (() => { const c = vm.createContext({}); vm.runInContext(grab(read('js/core.js'), 'esc', 'js/core.js') + '\nthis.esc = esc;', c); return c.esc; })();
  for (const [t, h] of CASES) {
    if (ctx.esc(t) !== h) bad.push('esc(' + JSON.stringify(t) + ') gave ' + JSON.stringify(ctx.esc(t)) + ', want ' + JSON.stringify(h));
    if (siteEsc(t) !== ctx.esc(t)) bad.push('the email esc and js/core.js esc differ on ' + JSON.stringify(t));
    if (ctx.cardUnesc_(h) !== t) bad.push('cardUnesc_(' + JSON.stringify(h) + ') gave ' + JSON.stringify(ctx.cardUnesc_(h)) + ', want ' + JSON.stringify(t));
  }
  for (const [h, t] of UNESC) if (ctx.cardUnesc_(h) !== t) bad.push('cardUnesc_(' + JSON.stringify(h) + ') gave ' + JSON.stringify(ctx.cardUnesc_(h)) + ', want ' + JSON.stringify(t));
  if (/\bmeUnesc_\b/.test(read('js/me-shelves.js'))) bad.push('js/me-shelves.js has its own meUnesc_ again; use cardUnesc_');
  if (bad.length) {
    bad.forEach(b => console.log('  ' + b));
    throw new Error('email-ink: ' + bad.length + ' difference' + (bad.length === 1 ? '' : 's') + ' between the email and the site');
  }
  console.log('email-ink: ' + names.length + ' colours from tokens, escapes agree (' + (CASES.length + UNESC.length) + ' cases)');
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
