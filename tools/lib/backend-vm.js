/* @family. — tools/lib/backend-vm.js THE BACKEND IN A VM (UNIFY NEXT 1, 22 Nov): backend/*.gs run as Apps Script runs them, every file top to
   bottom in A–Z order, Google's services stubbed, for every check that asks the backend itself. A check may not load the .gs files its own way
   (tools/one-helper.js fails it): it takes load() here, an in-memory spreadsheet from book(), and a fixed clock from load({ at }). */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT } = require('./gen.js');

/* EVERY GOOGLE SERVICE A .gs FILE NAMES AT THE TOP LEVEL: a stub that answers anything with itself (and '' as a string). */
const GOOGLE = ['Logger', 'PropertiesService', 'SpreadsheetApp', 'DriveApp', 'ScriptApp', 'Utilities', 'ContentService', 'HtmlService', 'CacheService',
  'LockService', 'MailApp', 'GmailApp', 'UrlFetchApp', 'Session', 'CalendarApp', 'DocumentApp', 'FormApp', 'Drive'];
const stub = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => stub, construct: () => stub });
/* THE CHECKS' DAY: 20 Nov 2026, 10:00 UTC. */
const AT = Date.UTC(2026, 10, 20, 10, 0, 0);

const files = dir => fs.readdirSync(dir).filter(f => f.endsWith('.gs')).sort();

/* load(opts): the backend's global scope.
   dir      the .gs folder (backend/)
   google   services to stand in for stubbed ones ({ MailApp: {...} })
   console  the console the backend writes to (node's)
   at       a fixed clock (ms): new Date() and Date.now() say it; true means AT
   random   a fixed Math.random() value
   ctx.$(code) runs code in the backend's scope (its consts and lets included). */
function load(opts) {
  const o = opts || {}, dir = o.dir || path.join(ROOT, 'backend');
  const ctx = { console: o.console || console };
  GOOGLE.forEach(k => { ctx[k] = stub; });
  Object.assign(ctx, o.google || {});
  vm.createContext(ctx);
  const at = o.at === true ? AT : o.at;
  let pre = '';
  if (at != null) pre += 'const __D = Date; Date = class extends __D { constructor(...a) { if (a.length) super(...a); else super(' + at + '); } static now() { return ' + at + '; } };';
  if (o.random != null) pre += 'Math.random = () => ' + o.random + ';';
  if (pre) vm.runInContext(pre, ctx);
  vm.runInContext(files(dir).map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n'), ctx, { filename: 'backend' });
  ctx.$ = code => vm.runInContext(code, ctx);
  return ctx;
}

/* AN IN-MEMORY SPREADSHEET: just what the store and the migrations call (getSheetByName, insertSheet, getRange's values, deleteRows). */
function book() {
  const tabs = {};
  const ss = { getSheetByName: n => tabs[n] || null, insertSheet: n => (tabs[n] = sheet(n)) };
  function sheet(name, vals) {
    const v = vals || [];
    return {
      name, v,
      getParent: () => ss,
      getLastRow: () => v.length,
      getLastColumn: () => v.reduce((m, r) => Math.max(m, r.length), 0),
      getRange: (r, c, nr, nc) => ({
        getValues: () => Array.from({ length: nr }, (_, i) => Array.from({ length: nc }, (_, j) => ((v[r - 1 + i] || [])[c - 1 + j] ?? ''))),
        getValue: () => ((v[r - 1] || [])[c - 1] ?? ''),
        setValue: x => { while (v.length < r) v.push([]); v[r - 1][c - 1] = x; },
        setValues: rows => rows.forEach((row, i) => { const at = r - 1 + i; while (v.length <= at) v.push([]); row.forEach((x, j) => { v[at][c - 1 + j] = x; }); }),
      }),
      deleteRows: (r, n) => { v.splice(r - 1, n); },
      appendRow: row => { v.push(row.slice()); },
    };
  }
  return { tabs, ss, sheet };
}

module.exports = { load, book, files, GOOGLE, AT };
