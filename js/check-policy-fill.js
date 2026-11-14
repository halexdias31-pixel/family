#!/usr/bin/env node
/* @family. — check-policy-fill.js: every policy opened with a made-up `DATA.policy` keeps no placeholder, renders headings, and no made-up value is in any committed file. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm'), { execFileSync } = require('child_process');
const root = path.join(__dirname, '..');
const src = fs.readFileSync(path.join(root, 'js/find-history.js'), 'utf8');
const a = src.indexOf('const POLICY_FILL'), b = src.indexOf('function policyView_');
if (a < 0 || b < a) { console.log('FAIL — the policy renderer is not in js/find-history.js'); process.exit(1); }
/* Made up at run time, so not even this file holds them. */
const tag = () => 'Zq' + Math.random().toString(36).slice(2, 10);
const fake = { dsl: tag(), deputy: tag(), email: tag() + '@example.invalid', phone: '0' + String(Math.random()).slice(2, 12),
  address: tag() + ' Road', ico: 'ZA' + String(Math.random()).slice(2, 9), insurer: tag() + ' Mutual' };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const ctx = { DATA: { policy: fake }, esc, policyHref_: d => 'docs/policies/' + d };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'js/cards-render.js'), 'utf8'), ctx);
vm.runInContext(src.slice(a, b) + ';this.policyMd_=policyMd_;this.policyFill_=policyFill_;this.policyName_=policyName_;', ctx);
const bad = [], dir = path.join(root, 'docs/policies');
const docs = fs.readdirSync(dir).filter(f => f.endsWith('.md') && f !== 'README.md');
const PH = /\[(DSL name|deputy DSL name|email|phone|address|ICO registration number|insurer)\](?!\()/;
let filled = 0;
docs.forEach(f => {
  const md = fs.readFileSync(path.join(dir, f), 'utf8'), html = ctx.policyMd_(ctx.policyFill_(md));
  if (ctx.policyName_('https://x.invalid/docs/policies/' + f) !== f.replace(/\.md$/, '')) bad.push(f + ': not recognised as a policy url');
  if (PH.test(html)) bad.push(f + ': a placeholder remains — ' + PH.exec(html)[0]);
  if (!/policy-h2"><h4/.test(html)) bad.push(f + ': no heading rendered');
  if (/<script|onerror=/i.test(html)) bad.push(f + ': raw html came through');
  if (/(^|\n)#{1,4} |\*\*/.test(html)) bad.push(f + ': markdown left unrendered');
  filled += Object.values(fake).filter(v => html.includes(esc(v))).length;
});
const none = vm.runInContext('DATA.policy = {}; policyFill_("[DSL name], [insurer]")', ctx);
if (none !== '[to follow], [to follow]') bad.push('a missing value shows ' + JSON.stringify(none) + ', not "[to follow]"');
if (!filled) bad.push('no fake value reached any policy');
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root }).toString().split('\0').filter(Boolean);
files.forEach(f => {
  let t; try { t = fs.readFileSync(path.join(root, f), 'utf8'); } catch (e) { return; }
  Object.values(fake).forEach(v => { if (t.includes(v)) bad.push(f + ': holds a made-up value'); });
});
if (bad.length) { console.log('FAIL — ' + bad.length + '\n  ' + bad.join('\n  ')); process.exit(1); }
console.log(`OK — ${docs.length} policies: placeholders filled (${filled} values), headings rendered, a missing value reads "[to follow]", no made-up value committed.`);
