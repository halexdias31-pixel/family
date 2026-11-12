#!/usr/bin/env node
/* @family. — check-no-new-screen.js (rule 11.1): a new feature is a card, a tool or a setting, never a new kind of screen; TAB_ORDER and columns.json never grow past the budget. */
'use strict';
const fs = require('fs'), path = require('path');
const root = path.join(__dirname, '..'), G = require('../data/settings/rule-guards.json');
const src = fs.readFileSync(path.join(root, 'js/shell-boot.js'), 'utf8'), m = /const TAB_ORDER = \[([\s\S]*?)\];/.exec(src);
if (!m) { console.log('FAIL — TAB_ORDER is not in js/shell-boot.js'); process.exit(1); }
const tabs = [...m[1].replace(/\/\*[\s\S]*?\*\//g, '').matchAll(/'([a-z0-9-]+)'/g)].length;
const cols = require('../data/settings/columns.json').length, max = G.screens, bad = [];
if (tabs > max) bad.push(`TAB_ORDER has ${tabs} screens, budget ${max}`);
if (cols > max) bad.push(`data/settings/columns.json lists ${cols} screens, budget ${max}`);
if (bad.length) { bad.forEach(b => console.log('FAIL — ' + b + ' (rule 11.1: build it as a card, tool or setting)')); process.exit(1); }
if (Math.max(tabs, cols) < max) console.log(`note: down to ${Math.max(tabs, cols)} screens; lower "screens" in data/settings/rule-guards.json`);
console.log(`OK — ${tabs} screens, none new`);
