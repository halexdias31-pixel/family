#!/usr/bin/env node
/* ONE WAY TO THE SERVER (step 2, phase 1): data/settings/server-actions.json, every doPost action surveyed. */
/* The hand half of each row (fate, into, why) is kept; the read half (access, child, handler, file, callers, tabs, effects) is re-read off the code. */
/* `--write` refreshes the file; plain run or `--check` only compares. Tabs and effects are what the handler can reach, so they over-say, never under-say. */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const JSON_PATH = path.join(ROOT, 'data', 'settings', 'server-actions.json');
const pa = require('./post-actions.js');
const P = require('./permissions.js');
const strip = t => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:\\])\/\/.*$/gm, '$1');
const read = p => { try { return fs.readFileSync(path.join(ROOT, p), 'utf8'); } catch (e) { return ''; } };

/* EVERY TOP-LEVEL BACKEND FUNCTION, its body and its file. */
function backendFns() {
  const fns = Object.create(null);
  fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs')).sort().forEach(f => {
    const src = strip(read('backend/' + f));
    const re = /\nfunction (\w+)\s*\([^)]*\)\s*\{/g; let m; const at = [];
    while ((m = re.exec(src))) at.push({ name: m[1], i: m.index });
    at.forEach((a, k) => { fns[a.name] = { file: f, body: src.slice(a.i, k + 1 < at.length ? at[k + 1].i : src.length) }; });
  });
  return fns;
}

/* WHAT A HANDLER CAN REACH, following calls to other backend functions (not the shared plumbing every handler uses). */
const PLUMBING = new Set(['jsonOut', 'findPerson', 'S', 'N', 'key', 'norm', 'read', 'clearCache', 'hasRole', 'personDisplayName', 'authWhoIs_', 'netViewerIsChild_', 'postActions_']);
const WRITES = /\b(setCell|setCells|appendRow|appendRows|logEvent|deleteRow|deleteRows|writeRow_|setValues|setValue|setProperty|deleteProperty)\s*\(/;
const EFFECTS = {
  email: /\b(mailOut_|MailApp|GmailApp)\b/,
  money: /\b(stripe\w*|Stripe\w*|TAB\.receipts|TAB\.payments|refund\w*)\b/,
  ai: /\b(gemini\w*|Gemini\w*|aiCall\w*)\b/,
  drive: /\bDriveApp\b/,
  outside: /\bUrlFetchApp\b/,
  log: /\b(logEvent|TAB\.events|TAB\.errors|TAB\.libLog)\b/,
};
function reach(fns, start) {
  const seen = new Set(), todo = [start];
  while (todo.length) {
    const n = todo.pop();
    if (seen.has(n) || !fns[n] || PLUMBING.has(n)) continue;
    seen.add(n);
    for (const m of fns[n].body.matchAll(/\b(\w+)\s*\(/g)) if (fns[m[1]] && !seen.has(m[1])) todo.push(m[1]);
  }
  return [...seen];
}

/* THE CALLERS: a quoted name in the site or tools/, as check-actions counts them. */
function callersOf() {
  const site = fs.readdirSync(path.join(ROOT, 'js')).filter(f => f.endsWith('.js') && !/^check/.test(f) && f !== '_scope.js').map(f => 'js/' + f).concat(['index.html', 'sw.js']);
  const tools = fs.readdirSync(path.join(ROOT, 'tools')).filter(f => /\.(js|py|sh)$/.test(f) && f !== 'server-actions.js').map(f => 'tools/' + f);
  const c = {};
  site.concat(tools).forEach(p => { for (const m of strip(read(p)).matchAll(/['"`](\w+)['"`]/g)) (c[m[1]] = c[m[1]] || new Set()).add(p); });
  return c;
}

const FATES = ['general', 'special', 'dead'];
const VERBS = ['read', 'save', 'delete'];

function computed() {
  const fns = backendFns(), src = strip(pa.postSrc(ROOT)), table = pa.postTable(src);
  const { access, kid } = P.backendRules(), callers = callersOf();
  const out = {};
  table.forEach(({ action, fn }) => {
    const r = reach(fns, fn), tabs = new Set(), eff = new Set();
    let writes = false;
    r.forEach(n => {
      const b = fns[n].body;
      for (const m of b.matchAll(/\bTAB\.(\w+)/g)) tabs.add(m[1]);
      if (WRITES.test(b)) writes = true;
      Object.keys(EFFECTS).forEach(k => { if (EFFECTS[k].test(b)) eff.add(k); });
    });
    if (writes) eff.add('writes');
    out[action] = {
      access: access[action] || '', childRefused: kid.indexOf(action) !== -1,
      handler: fn, file: fns[fn] ? 'backend/' + fns[fn].file : '',
      callers: [...(callers[action] || [])].sort(),
      tabs: [...tabs].sort(), effects: [...eff].sort(),
    };
  });
  return out;
}

/* THE FILE AS IT SHOULD BE: the hand half from the file, the read half from the code, in action order. */
function fresh() {
  let cur = { say: '', actions: {} };
  try { cur = JSON.parse(fs.readFileSync(JSON_PATH, 'utf8')); } catch (e) { /* first run: no hand half yet */ }
  const c = computed(), actions = {};
  Object.keys(c).sort().forEach(a => {
    const h = (cur.actions || {})[a] || {};
    actions[a] = Object.assign({ fate: h.fate || '', into: h.into || '', why: h.why || '' }, c[a]);
  });
  return { say: cur.say || '', generalActions: cur.generalActions || {}, actions };
}
const text = j => JSON.stringify(j, null, 1) + '\n';

module.exports = { computed, fresh, JSON_PATH, FATES, VERBS };
if (require.main === module) {
  const want = text(fresh()), have = fs.existsSync(JSON_PATH) ? fs.readFileSync(JSON_PATH, 'utf8') : '';
  if (process.argv.includes('--write')) { fs.writeFileSync(JSON_PATH, want); console.log('wrote ' + Object.keys(fresh().actions).length + ' actions to data/settings/server-actions.json'); }
  else { console.log(want === have ? 'server-actions.json current' : 'server-actions.json STALE — node tools/server-actions.js --write'); process.exit(want === have ? 0 : 1); }
}
