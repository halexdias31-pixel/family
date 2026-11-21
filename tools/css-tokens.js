#!/usr/bin/env node
/* @family. — tools/css-tokens.js THE CSS-TOKENS CHECK (rule 1.75, unify batch 2, 21 Nov): one rule, counted site-wide.
   A colour a child sees is named once, in a style.css `:root` block, and every rule draws it by its token. A raw colour anywhere
   else (a hex, rgb()/hsl(), or a colour keyword) is a second copy that drifts. Comments and quoted strings are skipped; ALLOW holds
   the few keywords that are not a colour of ours. Fails the build on any raw colour outside `:root`. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
/* NOT A COLOUR OF OURS: these name no hue, so they may stand anywhere. */
const ALLOW = new Set(['transparent', 'currentcolor', 'inherit', 'initial', 'unset', 'none']);
const NAMED = ['black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple', 'pink', 'gray', 'grey', 'silver', 'gold',
  'navy', 'teal', 'aqua', 'cyan', 'magenta', 'fuchsia', 'lime', 'maroon', 'olive', 'brown', 'coral', 'salmon', 'tomato', 'crimson',
  'indigo', 'violet', 'khaki', 'beige', 'ivory', 'tan', 'plum', 'orchid', 'turquoise', 'chocolate', 'darkgray', 'lightgray', 'whitesmoke'];
const RAW = new RegExp('#[0-9a-fA-F]{3,8}\\b|\\b(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch)\\(|(?<![-\\w.#$@])(?:' + NAMED.join('|') + ')(?![-\\w(])', 'gi');

function run() {
  const css = fs.readFileSync(path.join(ROOT, 'style.css'), 'utf8');
  /* BLANK comments and strings, keeping every newline so line numbers hold. */
  const bare = css.replace(/\/\*[\s\S]*?\*\/|"(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'/g, m => m.replace(/[^\n]/g, ' '));
  const bad = []; const stack = []; let sel = '', line = 1, decl = '';
  for (let i = 0; i < bare.length; i++) {
    const c = bare[i];
    if (c === '\n') line++;
    if (c === '{') { stack.push(sel.trim()); sel = ''; decl = ''; continue; }
    if (c === '}' || c === ';') { test(decl, line); decl = ''; if (c === '}') stack.pop(); sel = ''; continue; }
    sel += c; decl += c;
  }
  function test(text, at) {
    if (stack.some(s => /^:root$/.test(s)) || !stack.length) return;
    const val = text.slice(text.indexOf(':') + 1);
    if (text.indexOf(':') < 0) return;
    for (const m of val.matchAll(RAW)) if (!ALLOW.has(m[0].toLowerCase())) bad.push(at + ': ' + m[0] + '  in ' + text.trim().replace(/\s+/g, ' ').slice(0, 80));
  }
  console.log('css-tokens: ' + bad.length + ' raw colour(s) outside :root');
  bad.forEach(b => console.log('  style.css:' + b));
  if (bad.length) throw new Error('css-tokens: ' + bad.length + ' raw colour(s) outside :root — name each as a token in :root and draw it by var()');
  return bad.length;
}
module.exports = { run };
if (require.main === module) { try { run(); } catch (e) { console.error(e.message); process.exit(1); } }
