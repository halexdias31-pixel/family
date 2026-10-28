#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* check-scope.js — A NAME DECLARED INSIDE A BLOCK AND USED OUTSIDE IT. § */
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
  /* ONE PASS, LEFT TO RIGHT (517): a `//` inside a string is not a comment, so comments and strings are read in the order they come. */
  const blank = m => m.replace(/[^\n]/g, ' ');
  const code = src.replace(/\/\*[\s\S]*?\*\/|\/\/[^\n]*|`(?:[^`\\]|\\.)*`|'(?:[^'\\\n]|\\.)*'|"(?:[^"\\\n]|\\.)*"/g,
    m => m[0] === '/' || m[0] === '`' ? blank(m) : m[0] + m[0]);

  const lines = code.split('\n');
  /* find each block-scoped declaration, then the line its block closes on */
  for (let i = 0; i < lines.length; i++) {
    const m = /^(\s+)(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=/.exec(lines[i]);
    if (!m) continue;
    const indent = m[1].length, name = m[2];
    if (indent < 4) continue;                    /* top of a function is not a block */
    /* SINGLE LETTERS ARE SKIPPED. § */
    if (name.length < 3) continue;

    /* WALK OUT BY INDENTATION, NOT BY BRACES. § */
    let close = -1;
    for (let j = i + 1; j < lines.length; j++) {
      if (!lines[j].trim()) continue;
      const ind = lines[j].search(/\S/);
      if (ind < indent) { close = j; break; }
    }
    if (close < 0) continue;

    /* ---------- WHERE TO STOP LOOKING § */
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
      /* REDECLARED, OR A FRESH PARAMETER — either way it is a different name and fine. § */
      if (new RegExp('(?:const|let|var|function)\\s+' + name + '\\b').test(lines[j])) break;
      if (new RegExp('[(,]\\s*' + name + '\\s*(?:[,)]|=>)').test(lines[j])) break;
      /* and a name used only as an object key or a property is not this fault */
      if (new RegExp('[\\w$]\\s*\\.\\s*' + name + '\\b').test(lines[j])) break;
      /* A KEY IN AN OBJECT LITERAL IS NOT A USE EITHER. § */
      if (new RegExp('(?:^|[{,(])\\s*' + name + '\\s*:').test(lines[j])) break;
      /* NOR A METHOD'S NAME IN ONE (517): `join(it, ink, F) {`. */
      if (new RegExp('^\\s*(?:async\\s+)?' + name + '\\s*\\([^)]*\\)\\s*\\{').test(lines[j])) break;
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
