#!/usr/bin/env node
/* @family. — check-how-we-work.js (rule 1.6): CI never idles (every job has a timeout), a pull request runs the checks that say "safe to merge", and a session starts by hearing what is broken. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), wf = path.join(root, '.github/workflows'), bad = [];
const read = f => (fs.existsSync(path.join(root, f)) ? fs.readFileSync(path.join(root, f), 'utf8') : '');
fs.readdirSync(wf).filter(f => /\.ya?ml$/.test(f)).forEach(f => {
  const jobs = read('.github/workflows/' + f).split(/^jobs:\s*$/m)[1] || '';
  jobs.split(/^ {2}(?=[A-Za-z_-]+:\s*$)/m).slice(1).forEach(j => { const name = j.split(':')[0];
    if (!/^ {4}timeout-minutes:\s*\d+/m.test(j)) bad.push(`${f}: job ${name} has no timeout-minutes, so a hang idles CI for six hours`); });
});
const ci = read('.github/workflows/checks.yml');
if (!/^\s+pull_request:/m.test(ci) || !/check-all\.js/.test(ci)) bad.push('checks.yml: a pull request must run js/check-all.js (the "safe to merge" answer)');
if (!/check-all\.js --fast/.test(read('.claude/session-start.sh'))) bad.push('.claude/session-start.sh: a session must start with check-all --fast, so bugs come before anything new');
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b + ' (rule 1.6)')); process.exit(1); }
console.log('OK — every CI job has a timeout, pull requests run the checks, sessions start with them');
