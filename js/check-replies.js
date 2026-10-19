#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-replies.js A REFUSAL IS AN ANSWER, AND `api()` HANDS IT BACK AS A SUCCESS. § */
const fs = require('fs');
const path = require('path');
const acorn = require('acorn');

const DIR = __dirname;
const files = fs.readdirSync(DIR)
  .filter(f => f.endsWith('.js') && !f.startsWith('check') && f !== '_scope.js');

if (!files.length) {
  console.error('no app files found beside this one — this check cannot see its subject, '
              + 'which is not the same answer as a pass');
  process.exit(1);
}

/* WHAT COUNTS AS SAYING IT WORKED. § */
const SAYS_DONE = /\btoast\s*\(|\bcloseSheet\s*\(/;
/* AND WHAT COUNTS AS HAVING ASKED. Deliberately generous — any mention of `error` in the handler is
   taken as the caller having considered it. A check that argues about HOW somebody checked would be
   a check about style. */
const LOOKED = /\berror\b/;

const bad = [];
let calls = 0;

for (const f of files) {
  const src = fs.readFileSync(path.join(DIR, f), 'utf8');
  let ast;
  try {
    ast = acorn.parse(src, { ecmaVersion: 2022 });
  } catch (e) {
    console.error(`${f} does not parse: ${e.message}`);
    process.exit(1);
  }
  const text = n => src.slice(n.start, n.end);

  (function walk(node) {
    if (!node || typeof node.type !== 'string') return;
    /* ---------- AND THE SECOND QUESTION: HOW MANY ARGUMENTS DID `send` GET? § */
    if (node.type === 'CallExpression'
        && node.callee && node.callee.type === 'Identifier'
        && node.callee.name === 'send'
        && node.arguments.length > 1) {
      const line = src.slice(0, node.start).split('\n').length;
      const first = node.arguments[0];
      const act = (first && first.type === 'Literal') ? String(first.value) : 'that action';
      bad.push(`${f}:${line} — \`send\` takes ONE argument and this passes ${node.arguments.length}. `
        + `The body becomes the string "${act}", api() spreads it into indexed keys, and the `
        + `backend sees no action at all. Write send({ action: '${act}', … }).`);
    }

    if (node.type === 'CallExpression'
        && node.callee && node.callee.type === 'MemberExpression'
        && node.callee.property && node.callee.property.name === 'then') {
      const on = node.callee.object;
      /* `api(...).then(...)` DIRECTLY, and nothing further down a chain. A `.then` two links along
         has had a chance to throw in between, and guessing about that is where the false findings
         would start. */
      if (on && on.type === 'CallExpression' && on.callee && on.callee.name === 'api') {
        calls++;
        const handler = node.arguments[0] ? text(node.arguments[0]) : '';
        if (SAYS_DONE.test(handler) && !LOOKED.test(handler)) {
          const line = src.slice(0, node.start).split('\n').length;
          const act = (text(on).match(/action:\s*'([^']+)'/) || [])[1] || 'an action';
          bad.push(`${f}:${line} — \`${act}\` is posted with api() and its .then tells somebody it `
            + `worked. api() resolves on { error: … }, so that runs on a refusal too. Use send(), `
            + `which throws, or read d.error here.`);
        }
      }
    }
    for (const k in node) {
      const v = node[k];
      if (Array.isArray(v)) v.forEach(walk);
      else if (v && typeof v === 'object' && typeof v.type === 'string') walk(v);
    }
  })(ast);
}

console.log(`\nfiles read: ${files.length}   api().then(…) call sites: ${calls}`);
if (bad.length) {
  console.log('\nA REFUSAL WOULD BE REPORTED AS A SUCCESS, OR NEVER MADE AT ALL:');
  bad.forEach(b => console.log('  ' + b));
  console.log('');
  process.exit(1);
}
console.log('\nOK — nothing tells somebody a write worked without having looked at the answer.');
process.exit(0);
