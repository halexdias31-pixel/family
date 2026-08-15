#!/usr/bin/env node
/* ==================================================================================================
   check-scope.js — A NAME DECLARED INSIDE A BLOCK AND USED OUTSIDE IT.

   TWICE TONIGHT, IN TWO FILES, AND ALL EIGHT CHECKERS PASSED BOTH TIMES:

     `day`   declared inside `festiveOffers`, used by `add` at the top level — every term date threw
     `tooth` moved inside `if (skin.torn)`, used below it to place the content — every share threw

   `check.js` reads TOP-LEVEL names and cannot see inside a function. `check-dead` looks for things
   nothing calls. Neither has any idea about blocks, and this is the one fault that survives both:
   the code parses, the name exists somewhere, and it is simply not in scope where it is read.

   WHAT THIS DOES: walks every `const`/`let` declared inside a `{}` block, then looks for that name
   being used after the block closes, in the same function. Crude — it does not build a real scope
   tree — but it catches exactly the shape that got through twice, and it is quiet on names that are
   redeclared later or shadow an outer one.
================================================================================================== */
const fs = require('fs'), path = require('path');
const files = [];
for (const dir of ['.', '..']) {
  for (const f of fs.readdirSync(dir)) {
    if (!/\.(js|gs)$/.test(f) || /^check-|^node_modules/.test(f)) continue;
    files.push(path.join(dir, f));
  }
}

const bad = [];
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  /* strip comments and strings so a word in prose is not read as code */
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/\/\/[^\n]*/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/`(?:[^`\\]|\\.)*`/g, m => m.replace(/[^\n]/g, ' '))
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    .replace(/"(?:[^"\\]|\\.)*"/g, '""');

  const lines = code.split('\n');
  /* find each block-scoped declaration, then the line its block closes on */
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s+)(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/.exec(lines[i]);
    if (!m) continue;
    const indent = m[1].length, name = m[2];
    if (indent < 4) continue;                    /* top of a function is not a block */
    /* SINGLE LETTERS ARE SKIPPED. `v`, `x`, `t` are what everybody calls a callback argument, and
       the same letter in two adjacent callbacks is not a scope fault — it is the most ordinary
       thing in the file. Both real faults tonight had descriptive names, because a name worth
       declaring in a block is a name somebody bothered to spell. */
    if (name.length < 3) continue;

    /* WALK OUT BY INDENTATION, NOT BY BRACES. Counting braces sounded right and reported seventy-six
       faults, nearly all of them nonsense: a brace inside a template or a regex throws the count
       off and the block appears to close in the middle of a comment. Indentation is cruder and, in
       a file that is consistently indented, far more reliable — the block ends at the first line
       indented LESS than the declaration. A checker that cries wolf seventy-six times is one nobody
       reads, which is worse than not having it. */
    let close = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].trim()) continue;
      const ind = lines[j].search(/\S/);
      if (ind < indent) { close = j; break; }
    }
    if (close < 0) continue;

    /* ---------- WHERE TO STOP LOOKING ------------------------------------------------------------
       THIS WALKED TO THE NEXT LINE AT COLUMN ZERO, which is right for the frontend — many small
       top-level functions — and useless for `doPost.gs`, which is ONE function holding seventy
       `if (action === …)` blocks all indented the same. There is no column-zero line until the end
       of the file, so it searched four hundred lines into unrelated handlers and reported forty-six
       faults, every one of them false. Including one on the frontend from an object key.

       A SIBLING BLOCK AT THE SAME INDENT ENDS THE SEARCH. Two `if` blocks side by side are separate
       scopes, whatever encloses them — which is the whole shape it was getting wrong. */
    let fnEnd = lines.length;
    for (let j = close; j < lines.length; j++) {
      if (!lines[j].trim()) continue;
      const ind = lines[j].search(/\S/);
      if (ind === 0 && !/^[})\]]/.test(lines[j])) { fnEnd = j; break; }
      /* a new block starting at the declaration's own indent, or shallower */
      if (ind <= indent - 2 && /^\s*(?:if|for|while|switch|function|\}\s*else)\b/.test(lines[j])) {
        fnEnd = j; break;
      }
    }

    const re = new RegExp('(?<![\\w$.])' + name.replace(/\$/g, '\\$') + '(?![\\w$])');
    for (let j = close + 1; j < fnEnd; j++) {
      if (!re.test(lines[j])) continue;
      /* REDECLARED, OR A FRESH PARAMETER — either way it is a different name and fine.
         SIXTY-SEVEN REPORTS WERE THIS. `const v = ...` inside one callback and `map(v => ...)`
         below it are two unrelated `v`s, and flagging them buries the one report that matters.
         A checker is only worth having if its output is short enough to read every time. */
      if (new RegExp('(?:const|let|var|function)\\s+' + name + '\\b').test(lines[j])) break;
      if (new RegExp('[(,]\\s*' + name + '\\s*(?:[,)]|=>)').test(lines[j])) break;
      /* and a name used only as an object key or a property is not this fault */
      if (new RegExp('[\\w$]\\s*\\.\\s*' + name + '\\b').test(lines[j])) break;
      /* A KEY IN AN OBJECT LITERAL IS NOT A USE EITHER. `term: 'interval'` is the word `term`
         naming a field, and this read it as reading the variable — the one frontend report this
         checker produced, and it was wrong. A property access was already excluded; the key half
         of the same idea was not. */
      if (new RegExp('(?:^|[{,(])\\s*' + name + '\\s*:').test(lines[j])) break;
      bad.push({ file, name, at: i + 1, used: j + 1,
                 line: src.split('\n')[j].trim().slice(0, 70) });
      break;
    }
  }
}

console.log('');
console.log('DECLARED IN A BLOCK, USED OUTSIDE IT  (' + bad.length + ')');
if (!bad.length) console.log('  none');
for (const b of bad)
  console.log('  ' + path.basename(b.file) + ': `' + b.name + '` declared line ' + b.at
    + ', used line ' + b.used + '\n      ' + b.line);
console.log('');
console.log(bad.length
  ? 'FAILED — each of these throws the moment that line runs.'
  : 'OK — every name is in scope where it is used.');
process.exit(bad.length ? 1 : 0);
