#!/usr/bin/env node
require('../check/quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check-server-path.js ONE WAY TO THE SERVER (step 2): every action surveyed, the general path never wider than the old doors, and the old doors in use only fewer. */
'use strict';
const fs = require('fs'), path = require('path');
const O = path.join(__dirname, '..');
const SA = require('../tools/server-actions.js'), P = require('../tools/permissions.js');
const RATCHET = path.join(O, 'check', 'server-path-ratchet.json');
const bad = [];
let FALLS = Promise.resolve();
let j = null, rows = [];
try { j = JSON.parse(fs.readFileSync(SA.JSON_PATH, 'utf8')); rows = JSON.parse(fs.readFileSync(path.join(O, 'data/settings/permissions.json'), 'utf8')); } catch (e) {
  console.log('check-server-path: server-actions.json or permissions.json not read (' + e.message + ') — nothing was checked'); process.exit(1);
}

/* 1. EVERY ACTION IS IN server-actions.json, WITH A FATE AND A REASON, AND ITS READ HALF IS THE CODE'S. */
const fresh = SA.fresh(), acts = j.actions || {};
Object.keys(fresh.actions).forEach(a => {
  const h = acts[a];
  if (!h) { bad.push(a + ': not in server-actions.json — node tools/server-actions.js --write, then give it a fate'); return; }
  if (SA.FATES.indexOf(h.fate) === -1) bad.push(a + ': fate "' + h.fate + '", not general, special or dead');
  if (!String(h.why || '').trim()) bad.push(a + ': no `why`');
  if (h.fate === 'general' && !(h.into in (j.generalActions || {}))) bad.push(a + ': general into "' + h.into + '", not one of generalActions');
});
Object.keys(acts).filter(a => !(a in fresh.actions)).forEach(a => bad.push(a + ': in server-actions.json, no handler'));
if (JSON.stringify(fresh) !== JSON.stringify(j)) bad.push('server-actions.json is stale against the code (callers, tabs or effects) — node tools/server-actions.js --write');
Object.keys(j.generalActions || {}).forEach(g => { if (/^live/.test(j.generalActions[g].status) && !(g in fresh.actions)) bad.push('generalActions.' + g + ' says live, and there is no handler'); });

/* 2. NOBODY GAINS: each role's kind × verb through the general path is a subset of what the old door (`via`) gave it, read off ACTION_ACCESS. */
const { access, kid } = P.backendRules();
const may = (action, role) => action in access && P.allowOf(access[action], role, kid.indexOf(action) !== -1);
const GEN = { read: 'readItems', save: 'saveItem', delete: 'deleteItem' };
let items = 0;
rows.filter(r => r && r.kind === 'item').forEach(r => {
  items++;
  const m = /^(\w+):(read|save|delete)$/.exec(r.action || '');
  if (!m || P.ROLES.indexOf(r.role) === -1 || typeof r.allow !== 'boolean') { bad.push('a malformed item row: ' + JSON.stringify(r)); return; }
  if (!r.allow) return;
  const via = String(r.via || '');
  /* doGet is open to all; a read it carries is a read anybody's payload had (a child's with the hidden fields taken out). */
  const before = via === 'doGet' ? m[2] === 'read' : may(via, r.role);
  if (!before) bad.push(r.role + ' may ' + r.action + ' in the table, and the old door `' + via + '` never let ' + r.role + ' do that');
  if (r.role === 'child' && m[2] !== 'read' && kid.length && kid.indexOf(via) !== -1) bad.push('child may ' + r.action + ' through a money door');
});
/* AND THE GENERAL DOOR ITSELF IS NO WIDER: readItems is `self` like libItems, and a role it lets through still needs an item row. */
Object.keys(GEN).forEach(v => {
  const g = GEN[v];
  if (!(g in access)) return;
  P.ROLES.forEach(role => {
    if (!may(g, role)) return;
    const viaOk = rows.filter(r => r && r.kind === 'item' && r.allow && r.role === role && r.action.endsWith(':' + v));
    viaOk.forEach(r => { if (r.via !== 'doGet' && !may(r.via, role)) bad.push(g + ' lets ' + role + ' ' + r.action + ' that ' + r.via + ' refused'); });
  });
});
/* THE BACKEND READS THE GENERATED TABLE AND SERVES ONLY THROUGH libItems' OWN STEPS. */
const gsAll = fs.readdirSync(path.join(O, 'backend')).filter(f => f.endsWith('.gs')).map(f => fs.readFileSync(path.join(O, 'backend', f), 'utf8')).join('\n');
const h = (/function postReadItems_\(body, action, began\) \{[\s\S]*?\n\}\n/.exec(gsAll) || [''])[0];
if ('readItems' in access) {
  if (!h) bad.push('readItems is in ACTION_ACCESS and postReadItems_ is not found');
  if (!/itemMay_\(kind, 'read', /.test(h)) bad.push('postReadItems_ does not ask ITEM_PERMISSIONS (itemMay_) before reading');
  if (!/libItemsReply_\(/.test(h)) bad.push('postReadItems_ does not read through libItemsReply_ — the cap and tally must be libItems\' own');
  if (!/function postLibItems_\(body, action, began\) \{ return jsonOut\(libItemsReply_\(body\)\); \}/.test(gsAll)) bad.push('libItems no longer answers through libItemsReply_, so the two could drift');
  const served = (/const READ_ITEMS_LIB = \{([^}]*)\}/.exec(gsAll) || ['', ''])[1];
  [...served.matchAll(/(\w+):/g)].map(x => x[1]).forEach(k => P.ROLES.forEach(role => {
    const row = rows.find(r => r && r.kind === 'item' && r.role === role && r.action === k + ':read');
    if (!row) bad.push('readItems serves ' + k + ' and the table has no ' + role + ' row for it');
    else if (row.allow && row.via !== 'libItems') bad.push('readItems serves ' + k + ' through libItems, and the table says ' + role + '\'s door was ' + row.via);
  }));
  /* SLICE 2: PEOPLE, ANSWERS, MESSAGES — each kind answered by its old door's own handler; a non-admin only through the `self` one, somebody else's only an admin's. */
  const own = (/function readItemsOld_\(\) \{([\s\S]*?)\n\}\n/.exec(gsAll) || ['', ''])[1];
  const byFn = {}; Object.keys(acts).forEach(a => { byFn[acts[a].handler] = a; });
  const ow = (/function readItemsOwn_\(kind, how, body, began\) \{[\s\S]*?\n\}\n/.exec(gsAll) || [''])[0];
  if (own && !/if \(!h\.other|if \(!how\.other \|\| role !== 'admin' \|\| !hasRole\(me, 'admin'\)\)/.test(ow)) bad.push('readItemsOwn_ no longer refuses somebody else\'s item to all but an admin');
  if (own && !/itemMay_\(kind, 'read', role\)/.test(ow)) bad.push('readItemsOwn_ does not ask ITEM_PERMISSIONS (itemMay_)');
  if (own && !/how\.self && \(!want \|\| want === self\)/.test(ow)) bad.push('readItemsOwn_ reaches a `self` door for somebody else\'s id');
  [...own.matchAll(/(\w+): \{([^}]*)\}/g)].forEach(m => {
    const k = m[1], self = (/self: (\w+)/.exec(m[2]) || [])[1], other = (/other: (\w+)/.exec(m[2]) || [])[1];
    const sa = self && byFn[self], oa = other && byFn[other];
    if (self && !sa) bad.push('readItems ' + k + ': self handler ' + self + ' is no action\'s');
    if (other && !oa) bad.push('readItems ' + k + ': other handler ' + other + ' is no action\'s');
    if (oa && P.ROLES.some(r => r !== 'admin' && may(oa, r))) bad.push('readItems ' + k + ': somebody else\'s goes through ' + oa + ', which is not an admin\'s alone');
    if (oa === 'lensOpen' && !/logged: true/.test(m[2])) bad.push('readItems ' + k + ': the lens view through readItems is not logged');
    if (oa === 'lensOpen' && !/how\.logged && want !== self\)[\s\S]*?lensLog_\(me, r,/.test(ow)) bad.push('readItemsOwn_ no longer writes the lens_log row');
    P.ROLES.forEach(role => {
      const row = rows.find(r => r && r.kind === 'item' && r.role === role && r.action === k + ':read');
      if (!row) { bad.push('readItems serves ' + k + ' and the table has no ' + role + ' row for it'); return; }
      if (!row.allow) return;
      const ok = role === 'admin' ? [sa, oa] : [sa];
      if (ok.indexOf(row.via) === -1) bad.push('readItems ' + k + ': ' + role + '\'s row says via ' + row.via + ', and its doors are ' + ok.filter(Boolean).join(', '));
      if (!(sa ? may(sa, role) : false) && !(role === 'admin' && oa && may(oa, role))) bad.push('readItems lets ' + role + ' read ' + k + ' that no old door gave it');
    });
  });
}
/* THE GENERAL SAVE AND DELETE (slice 3): each kind is its old door, behind that door's own gate and an item row, and no row reaches past the door. */
{
  const wr = (/function itemsWrite_\(verb, body, began\) \{[\s\S]*?\n\}\n/.exec(gsAll) || [''])[0];
  const mapOf = fn => { const m = new RegExp('function ' + fn + '\\(\\) \\{\\s*return \\{([\\s\\S]*?)\\};\\s*\\}').exec(gsAll); const o = {};
    if (m) for (const x of m[1].matchAll(/(\w+):\s*'(\w+)'/g)) o[x[1]] = x[2]; return m ? o : null; };
  [['save', 'saveItem', 'saveItemsOld_', 'postSaveItem_'], ['delete', 'deleteItem', 'deleteItemsOld_', 'postDeleteItem_']].forEach(([verb, g, fn, post]) => {
    if (!(g in access)) return;
    if (!new RegExp('function ' + post + "\\(body, action, began\\) \\{ return itemsWrite_\\('" + verb + "', body, began\\); \\}").test(gsAll)) bad.push(post + ' does not go through itemsWrite_(\'' + verb + '\')');
    const map = mapOf(fn);
    if (!map) { bad.push(fn + ' is not found — which old door each ' + verb + ' kind is'); return; }
    /* EVERY OLD DOOR THE SURVEY FOLDS INTO THIS ONE IS IN THE MAP, AND NOTHING ELSE IS. */
    Object.keys(acts).filter(a => acts[a].fate === 'general' && acts[a].into === g && a !== g).forEach(a => { if (Object.values(map).indexOf(a) === -1) bad.push(g + ': ' + a + ' folds into it and ' + fn + ' has no kind for it'); });
    Object.keys(map).forEach(k => {
      const old = map[k];
      if (!acts[old] || acts[old].fate !== 'general' || acts[old].into !== g) bad.push(g + ' ' + k + ' goes through ' + old + ', which the survey does not fold into ' + g);
      P.ROLES.forEach(role => {
        const row = rows.find(r => r && r.kind === 'item' && r.action === k + ':' + verb && r.role === role);
        if (!row) { bad.push(g + ' serves ' + k + ' and the table has no ' + role + ' row for ' + k + ':' + verb); return; }
        if (row.allow && row.via !== old) bad.push(g + ' ' + k + ': ' + role + '\'s row says via ' + row.via + ', and the code goes through ' + old);
        if (row.allow && !may(old, role)) bad.push(g + ' lets ' + role + ' ' + verb + ' ' + k + ' that ' + old + ' never let it');
      });
    });
  });
  /* THE OLD DOOR'S OWN GATE, AGAIN, BY ITS NAME — without it an admin's door is a member's (saveItem is `self` at the gate). */
  if ('saveItem' in access || 'deleteItem' in access) {
    if (!wr) bad.push('itemsWrite_ is not found');
    else {
      if (!/const denied = accessDenied\(old, b\);\s*\n\s*if \(denied\) return/.test(wr)) bad.push('itemsWrite_ does not ask the old door\'s own gate (accessDenied(old, b)) — an admin\'s door would open to anybody signed in');
      if (!/itemMay_\(item, verb, role\)/.test(wr)) bad.push('itemsWrite_ does not ask ITEM_PERMISSIONS (itemMay_)');
      if (!/permChildDenied_\(old\)/.test(wr)) bad.push('itemsWrite_ does not ask the child money rule of the old door');
      if (!/return postActions_\(\)\[old\]\(b, old, began\);/.test(wr)) bad.push('itemsWrite_ does not answer by the old door\'s own handler, under the old door\'s name');
      /* WHO IS ASKING IS THE GATE'S (the token's person), never a field of the request: a write as somebody else is a child saving another's row. */
      if (/\b(b|body)\.(personId|name|token|adminName)\s*=[^=]|b\[['"](personId|name|token)/.test(wr)) bad.push('itemsWrite_ changes who is asking (personId, name or token) before the old door runs');
      if (!/hasOwnProperty\.call\(map, item\)/.test(wr)) bad.push('itemsWrite_ reaches a handler for a kind not in its map');
    }
  }
}
/* A FALLBACK (`old:` in the site) IS ONLY TO A DOOR A GENERAL ONE REPLACES — the bridge until the backend is redeployed. */
Object.keys(acts).forEach(a => { if ((acts[a].fallbacks || []).length && !(acts[a].fate === 'general' && Object.values(GEN).indexOf(acts[a].into) !== -1 && a !== acts[a].into)) bad.push(a + ': the site falls back to it, and it does not fold into a general door'); });
/* AND THE SITE'S FALLBACK WORKS: readItems first; the old door, with the same request, only when the live backend does not know readItems or the kind. */
{
  const sc = fs.readFileSync(path.join(O, 'js', 'shell-click.js'), 'utf8'), at = sc.indexOf('const itemsOld_'), end = sc.indexOf('\nfunction api(');
  if (at < 0 || end < at) bad.push('js/shell-click.js has no itemsOld_/apiItems_ before api() — the readItems fallback is gone');
  else {
    const run = reply => { const sent = [];
      const ctx = { Object, String, Promise, api: b => { sent.push(b); return Promise.resolve(b.action === 'readItems' ? reply : { success: true, from: b.action }); } };
      require('vm').runInNewContext(sc.slice(at, end) + '\nthis.apiItems_ = apiItems_;', ctx);
      return ctx.apiItems_({ action: 'readItems', kind: 'profile', ids: ['P-1'], old: 'lensOpen', targetId: 'P-1' }).then(d => ({ d, sent })); };
    /* A SAVE: `item` goes, and the old door's own `kind` (setNotify's, favourite's) stays. A keepalive flush on a backend without saveItem is ONE request, to the old door. */
    const runS = (reply, opts, feats) => { const sent = [];
      const ctx = { Object, String, Promise, Array, DATA: feats ? { features: feats } : undefined, api: b => { sent.push(b); return Promise.resolve(b.action === 'saveItem' ? reply : { success: true, from: b.action }); } };
      require('vm').runInNewContext(sc.slice(at, end) + '\nthis.apiItems_ = apiItems_;', ctx);
      return ctx.apiItems_({ action: 'saveItem', item: 'notify', old: 'setNotify', kind: 'weekly', on: true }, opts).then(d => ({ d, sent })); };
    const sCases = [[{ error: 'Unknown action: saveItem' }, null, null, ['saveItem', 'setNotify']], [{ error: 'That kind cannot be saved here yet.', why: 'kind' }, null, null, ['saveItem', 'setNotify']],
      [{ success: true }, null, null, ['saveItem']], [{ error: 'Not authorised.', why: 'refused' }, null, null, ['saveItem']],
      [{ success: true }, { keepalive: true }, ['saveTodo'], ['setNotify']], [{ success: true }, { keepalive: true }, ['saveItem'], ['saveItem']]];
    const SF = Promise.all(sCases.map(([reply, opts, feats, want]) => runS(reply, opts, feats).then(({ sent }) => {
      if (sent.map(b => b.action).join() !== want.join()) bad.push('apiItems_ saveItem on ' + JSON.stringify(reply) + (opts ? ' (keepalive)' : '') + ' sent ' + sent.map(b => b.action).join(', ') + ', not ' + want.join(', '));
      sent.forEach(b => { if ('old' in b) bad.push('apiItems_ sent `old` to the server'); if (b.action === 'setNotify' && ('item' in b || b.kind !== 'weekly')) bad.push('apiItems_ changed the old door\'s request: ' + JSON.stringify(b)); });
    })));
    const cases = [
      [{ error: 'Unknown action: readItems' }, 'lensOpen'], [{ error: 'That action is not recognised.' }, 'lensOpen'],
      [{ error: 'That kind cannot be read here yet.', why: 'kind' }, 'lensOpen'], [{ success: true }, null],
      [{ error: 'Not authorised.', why: 'refused' }, null], [{ error: 'Only your own.', why: 'refused' }, null]];
    FALLS = Promise.all([SF].concat(cases.map(([reply, want]) => run(reply).then(({ d, sent }) => {
      if ('old' in sent[0]) bad.push('apiItems_ sent `old` to the server');
      const fell = sent.length > 1 ? sent[1].action : null;
      if (fell !== want) bad.push('apiItems_ on ' + JSON.stringify(reply) + ' fell back to ' + fell + ', not ' + want);
      if (fell && (sent[1].targetId !== 'P-1' || 'kind' in sent[1])) bad.push('apiItems_ changed the old door\'s request: ' + JSON.stringify(sent[1]));
    }))));
  }
}

/* 3. THE OLD DOORS STILL CALLED ONLY GET FEWER. */
const inUse = Object.keys(acts).filter(a => !(a in (j.generalActions || {})) && (acts[a].callers || []).length).sort();
let rat = null;
try { rat = JSON.parse(fs.readFileSync(RATCHET, 'utf8')); } catch (e) { bad.push('check/server-path-ratchet.json not read: ' + e.message); }
if (rat) {
  if (inUse.length > rat.oldInUse) bad.push(inUse.length + ' old actions are called, more than the ratchet\'s ' + rat.oldInUse + ' — a new caller goes through the general path');
  else if (inUse.length < rat.oldInUse) bad.push(inUse.length + ' old actions are called, fewer than ' + rat.oldInUse + ': lower oldInUse in check/server-path-ratchet.json to ' + inUse.length);
}

FALLS.then(() => {
const n = {}; Object.keys(acts).forEach(a => { n[acts[a].fate] = (n[acts[a].fate] || 0) + 1; });
if (bad.length) { console.log(bad.map(b => '  ' + b).join('\n')); console.log('FAILED — ' + bad.length + ' problem(s) on the one way to the server.'); process.exit(1); }
console.log('OK — ' + Object.keys(acts).length + ' actions surveyed (' + (n.general || 0) + ' general, ' + (n.special || 0) + ' special, ' + (n.dead || 0) + ' dead); '
  + items + ' item rows, none wider than the old doors; ' + inUse.length + ' old actions still called (ratchet).');
});
