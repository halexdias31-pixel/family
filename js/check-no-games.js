#!/usr/bin/env node
/* @family. — check-no-games.js (rule 6.2): no leaderboards, points, streaks or public scores in the code a visitor runs; the ones already there only go down. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), G = require('../data/settings/rule-guards.json');
const RE = /leaderboard|high ?scores?|brownie points|\bstreaks?\b|paintBoard_|ttHighscore/gi;
const ls = d => fs.readdirSync(path.join(root, d)).map(f => d + '/' + f);
const files = ls('js').filter(f => /\.js$/.test(f) && !/^js\/check/.test(f)).concat(['index.html', 'style.css'], ls('backend').filter(f => /\.gs$/.test(f)));
/* Comments may name the rule; only code and words on screen count. */
const code = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '').replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1');
const budget = G.games || {}, bad = [], now = {};
files.forEach(f => { const n = (code(fs.readFileSync(path.join(root, f), 'utf8')).match(RE) || []).length; if (n) now[f] = n;
  if (n > (budget[f] || 0)) bad.push(`${f}: ${n} leaderboard/points/streak word(s), budget ${budget[f] || 0} (rule 6.2)`); });
Object.keys(budget).forEach(f => { if ((now[f] || 0) < budget[f]) console.log(`note: ${f} is down to ${now[f] || 0}; lower its "games" budget in data/settings/rule-guards.json`); });
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b)); process.exit(1); }
console.log(`OK — no new leaderboard, points or streak (${Object.keys(now).length} file(s) still on the worklist)`);
