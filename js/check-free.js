#!/usr/bin/env node
/* @family. — check-free.js (rule 10.2): every host the site or backend calls, and every package it ships, is on the owner's list; a new one may cost money, so it is an owner decision. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), G = require('../data/settings/rule-guards.json');
const ls = d => fs.readdirSync(path.join(root, d)).map(f => d + '/' + f);
const files = ls('js').filter(f => /\.js$/.test(f) && !/^js\/check/.test(f)).concat(['index.html'], ls('backend').filter(f => /\.gs$/.test(f)));
const ok = new Set(G.hosts || []), bad = [], seen = new Set();
/* A CALL: a line that fetches, or a script/link tag that loads, with a literal https host on it. */
const CALL = /fetch\(|<script[^>]+src=|<link[^>]+href=|importScripts\(/;
files.forEach(f => fs.readFileSync(path.join(root, f), 'utf8').split('\n').forEach((l, i) => { if (!CALL.test(l)) return;
  (l.match(/https?:\/\/[a-z0-9.-]+/gi) || []).forEach(u => { const h = u.replace(/^https?:\/\//i, '').toLowerCase(); seen.add(h);
    if (!ok.has(h)) bad.push(`${f}:${i + 1}: calls ${h}, not in data/settings/rule-guards.json "hosts"`); }); }));
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
Object.keys(pkg.dependencies || {}).forEach(d => { if (!(G.packages || []).includes(d)) bad.push(`package.json: shipped dependency ${d} is not in "packages"`); });
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b + ' (rule 10.2: free unless the owner decides)')); process.exit(1); }
console.log(`OK — ${seen.size} called host(s), all on the owner's list`);
