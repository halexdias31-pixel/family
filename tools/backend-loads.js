#!/usr/bin/env node
/* @family. — tools/backend-loads.js THE BACKEND LOADS (22 Nov: the whole site was down — "Could not sign in"): Apps Script runs every
   .gs file top to bottom in A–Z order before any request, so a top-level line that reads a name a LATER file defines kills every
   request. This loads backend/*.gs in that order with Google's services stubbed, and fails on any error. Run by tools/build.js. */
'use strict';
const fs = require('fs'), path = require('path'), vm = require('vm');
const { ROOT, report, main } = require('./lib/gen.js');
function run() {
  const dir = path.join(ROOT, 'backend');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.gs')).sort();
  const stub = new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : stub), apply: () => stub, construct: () => stub });
  const ctx = { console };
  ['Logger', 'PropertiesService', 'SpreadsheetApp', 'DriveApp', 'ScriptApp', 'Utilities', 'ContentService', 'HtmlService', 'CacheService',
    'LockService', 'MailApp', 'GmailApp', 'UrlFetchApp', 'Session', 'CalendarApp', 'DocumentApp', 'FormApp', 'Drive'].forEach(k => { ctx[k] = stub; });
  vm.createContext(ctx);
  const bad = [];
  try { vm.runInContext(files.map(f => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n'), ctx, { filename: 'backend' }); }
  catch (e) { bad.push('the backend does not load in Apps Script order (A–Z): ' + e.message); }
  report('backend-loads', bad, 'load failure(s)');
  console.log('backend-loads: ' + files.length + ' files load in A–Z order');
}
module.exports = { run };
main(module, run);
