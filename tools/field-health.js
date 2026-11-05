#!/usr/bin/env node
/* @family. — tools/field-health.js HOW THE SITE FEELS ON REAL PHONES (920): the Ledger's health_log tab, summed into data/field-health.json. */
/* --sheets s.json is the same export check/live.js reads ({ book: { tab: grid } }). None given: a skip is written, with its count. */
/* Only figures leave: p75 of each timing, by device class. The tab holds no name or id, and neither does the file. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'data', 'field-health.json');
const at = process.argv.indexOf('--sheets'), SHEETS = at >= 0 ? process.argv[at + 1] : '';
const write = o => { fs.writeFileSync(OUT, JSON.stringify(o, null, 1) + '\n'); };
if (!SHEETS) { write({ skipped: true, why: 'no --sheets export given', visits: 0 }); console.log('field-health: skipped — no --sheets export given (0 visits read)'); process.exit(0); }
let grid = null;
try { const book = JSON.parse(fs.readFileSync(SHEETS, 'utf8')); Object.keys(book).some(k => (grid = (book[k] || {}).health_log) && grid.length); }
catch (e) { console.error('field-health: cannot read ' + SHEETS + ' — ' + e.message); process.exit(2); }
if (!grid || grid.length < 2) { write({ skipped: true, why: 'the export has no health_log rows yet', visits: 0 }); console.log('field-health: skipped — no health_log rows yet'); process.exit(0); }
const h = grid[0], rows = grid.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
const p75 = xs => { const v = xs.map(Number).filter(n => isFinite(n) && n > 0).sort((a, b) => a - b); return v.length ? v[Math.min(v.length - 1, Math.floor(v.length * 0.75))] : null; };
const sum = rs => ({ visits: rs.length, loadMs: p75(rs.map(r => r.load_ms)), findMs: p75(rs.map(r => r.find_ms)), longMs: p75(rs.map(r => r.long_ms)),
  heapMB: p75(rs.map(r => r.heap_mb)), errorVisits: rs.filter(r => Number(r.errors) > 0).length });
const by = {};
rows.forEach(r => { const d = String(r.device || 'unknown').split('-')[0]; (by[d] = by[d] || []).push(r); });
const out = Object.assign({ skipped: false }, sum(rows), { byDevice: Object.fromEntries(Object.keys(by).map(k => [k, sum(by[k])])) });
write(out);
console.log(`field-health: ${out.visits} visits — p75 load ${out.loadMs} ms, Find ${out.findMs} ms, long tasks ${out.longMs} ms, heap ${out.heapMB} MB`);
