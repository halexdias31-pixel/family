#!/usr/bin/env node
/* node js/check-keepwarm.js — THE KEEP-AWAKE (core.gs `keepWarm`): `?ping=1` answers before any sheet, cache or
   property is touched, and the admin-load setup books exactly one five-minute trigger however often it runs. */
'use strict';
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
const { backend } = require('./check-gas-load.js');

const bad = [];
const b = backend();

/* ---------- 1. THE PING READS NOTHING: every sheet, cache and property door counts as it opens ---------- */
b.ev(`(function () {
  globalThis.__touched = [];
  const wrap = (o, name) => Object.keys(o).forEach(k => { const f = o[k]; if (typeof f === 'function') o[k] = function () { __touched.push(name + '.' + k); return f.apply(this, arguments); }; });
  wrap(SpreadsheetApp, 'SpreadsheetApp'); wrap(CacheService, 'CacheService'); wrap(PropertiesService, 'PropertiesService');
})(); 0`);
let pong = null;
try { pong = b.get({ ping: '1' }); } catch (err) { bad.push('?ping=1 threw: ' + err.message); }
if (!pong || pong.ok !== true || pong.ping !== 1) bad.push('?ping=1 did not answer {ok, ping}: ' + JSON.stringify(pong));
const touched = JSON.parse(b.ev('JSON.stringify(__touched)'));
if (touched.length) bad.push('?ping=1 touched ' + touched.join(', ') + ' — the ping must answer before any sheet work');

/* ---------- 2. THE INSTALLER IS IDEMPOTENT: one trigger after many runs, and two found become one ---------- */
b.ev(`(function () {
  const ts = [];
  globalThis.__trig = ts;
  ScriptApp.getProjectTriggers = () => ts.slice();
  ScriptApp.deleteTrigger = t => { const i = ts.indexOf(t); if (i !== -1) ts.splice(i, 1); };
  ScriptApp.newTrigger = fn => ({ timeBased: () => ({
    everyMinutes: n => ({ create: () => { const t = { getHandlerFunction: () => fn, every: n }; ts.push(t); return t; } }),
    everyHours: () => ({ create: () => { const t = { getHandlerFunction: () => fn }; ts.push(t); return t; } }),
    after: () => ({ create: () => {} }),
    everyDays: () => ({ atHour: () => ({ create: () => {} }) }),
    onWeekDay: () => ({ atHour: () => ({ nearMinute: () => ({ inTimezone: () => ({ create: () => {} }) }) }) }),
  }), forSpreadsheet: () => ({ onChange: () => ({ create: () => {} }) }) });
})(); 0`);
const mine = () => JSON.parse(b.ev('JSON.stringify(__trig.filter(t => t.getHandlerFunction() === KEEP_WARM_FN).map(t => t.every))'));
for (let i = 0; i < 3; i++) b.ev('try { PropertiesService.getScriptProperties().deleteProperty("SETUP_CHECKED_AT"); setupOnAdminLoad_(); } catch (e) {} 0');
if (JSON.stringify(mine()) !== '[5]') bad.push('three admin-load setups should leave exactly one five-minute keepWarm trigger, left ' + JSON.stringify(mine()));
if (b.ev('JSON.stringify(keepWarmKeepBooked_())') !== 'null') bad.push('keepWarmKeepBooked_ with one trigger booked should do nothing');
b.ev('ScriptApp.newTrigger(KEEP_WARM_FN).timeBased().everyMinutes(5).create(); keepWarmKeepBooked_(); 0');
if (mine().length !== 1) bad.push('two keepWarm triggers found should become one, left ' + mine().length);

/* ---------- 3. THE PING ITSELF NEVER THROWS: no URL, and a network that fails ---------- */
const r1 = b.ev('keepWarm()');
if (typeof r1 !== 'string') bad.push('keepWarm() with no URL should return words, not throw');
b.ev('ScriptApp.getService = () => ({ getUrl: () => "https://example.invalid/exec" }); UrlFetchApp.fetch = () => { throw new Error("down"); }; 0');
const r2 = b.ev('keepWarm()');
if (!/failed/.test(String(r2))) bad.push('keepWarm() on a failed fetch should say so, got ' + r2);

if (bad.length) { console.log('check-keepwarm: ' + bad.length + ' problem(s)\n  ' + bad.join('\n  ')); process.exit(1); }
console.log('check-keepwarm: the ping reads nothing, one five-minute trigger, never throws');
