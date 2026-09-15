#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-replies.js

   A REFUSAL IS AN ANSWER, AND `api()` HANDS IT BACK AS A SUCCESS.

   THERE ARE TWO WAYS TO POST in this app and the difference is one line in shell.js:

     `api(body)`   resolves with whatever the server said, `{ error: '…' }` included.
     `send(body)`  the same request, and throws when the reply carries an `error`.

   BOTH ARE RIGHT FOR SOMETHING. A caller that wants to look at the reply itself — a read, a
   fire-and-forget, something that copes with either answer — wants `api`. A caller that is about to
   TELL SOMEBODY IT WORKED wants `send`, because on `api` the `.then` runs on "You cannot message
   them directly" exactly as it runs on success.

   THIS WAS WRITTEN AFTER MAKING THE MISTAKE. The Message control on a tutor's pass posted through
   `api`, and a stubbed refusal produced: the sheet closed, what somebody had typed was thrown away,
   and a toast said "Sent to Ada Tutor" about a message that was never written. Nothing in the app
   would have shown it — the backend's refusals are the one thing a happy path never reaches — and
   the four refusals `sendMessage` can give are all real: a role that may not write to that role, a
   message inside the five-minute gap, an empty body, and one over two thousand characters.

   SO THE RULE IS NARROW ENOUGH TO BE CERTAIN ABOUT, which is the whole difference between a check
   and a noise generator — see `check-rows.js`, where the first version had 95 findings and 2 real
   ones. It asks ONE question:

     does an `api()` call have a `.then` that announces success — `toast()` or `closeSheet()` —
     without the reply being examined for an error anywhere in that handler?

   Everything else is left alone. An `api()` whose `.then` reads `d.error` itself is a caller that
   has thought about it. An `api()` that quietly updates state is not making a claim to anybody. A
   `send()` already throws. Only the ones that say "done" out loud, having never asked, are named.

   PROVED IN BOTH DIRECTIONS on the bug that prompted it: with `api` it names `me.js:sendMessage`;
   with `send` it is silent across every file.

     node js/check-replies.js
================================================================================================== */
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

/* WHAT COUNTS AS SAYING IT WORKED. Both of these are addressed to a person: one puts words on the
   screen, the other takes away the form they were filling in. A handler that does either on an
   answer it has not read is making a claim it cannot support. */
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
  console.log('\nA REFUSAL WOULD BE REPORTED AS A SUCCESS:');
  bad.forEach(b => console.log('  ' + b));
  console.log('');
  process.exit(1);
}
console.log('\nOK — nothing tells somebody a write worked without having looked at the answer.');
process.exit(0);
