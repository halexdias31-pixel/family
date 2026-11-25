#!/usr/bin/env node
/* @family. — tools/docket-fresh.js THE DOCKET IS THE SERVER'S (rule 1.75; owner 25 Nov: a backend job rewrote the owner's `todo` cell into two lists,
   the phone kept its cached eleven, and its first tick would have saved them back). Run as served: backend/post-account.gs postSaveTodo_ refuses a save
   whose `base` is not todoBase_ of the cell now, leaving the cell unchanged, and takes one that is; postDocketImport_ `read` answers the cell and its base;
   js/map.js, with a stale USER.todo cached, draws none of the cached lists and then the server's, and sends no save until it has read fresh;
   todoBase_ is the same text in both. Each break below is proved caught (mutations). Run by tools/build.js. */
'use strict';
const { text, report, main } = require('./lib/gen.js');
const fnOf = (src, name, file) => { const m = new RegExp('\\nfunction ' + name + '\\([^)]*\\) \\{[\\s\\S]*?\\n\\}\\n').exec(src);
  if (!m) throw new Error('docket-fresh: no ' + name + ' in ' + file); return m[0]; };
const OLD = JSON.stringify({ v: 1, lists: 'ABCDEFGHIJK'.split('').map(c => ({ name: 'Old ' + c, items: [{ title: 'Old ' + c }] })) });
const NEW = JSON.stringify({ v: 1, lists: [{ name: 'Docket', items: [{ title: 'meds' }, { title: 'tax' }] }] });

function backend(be) {
  return new Function('cell', 'const S = v => (v == null ? "" : String(v)).trim(), row = { person_id: "p1", todo: cell }, sets = [];'
    + 'const findPerson = (n, id) => (id === "p1" ? row : null), read = () => ({ headers: ["person_id", "todo"] }), setCell = (t, r, f, v) => { sets.push(f); r[f] = v; return true; };'
    + 'const TAB = { people: "people" }, jsonOut = o => o, refuse_ = (k, c) => ({ error: k, code: c }), todoTidy_ = s => s, isOwner_ = () => true, docketTidy_ = l => l, DOCKET_CELL_MAX = 1e6;'
    + fnOf(be, 'todoBase_', 'post-account.gs') + fnOf(be, 'postSaveTodo_', 'post-account.gs') + fnOf(be, 'postDocketImport_', 'post-account.gs')
    + 'return { row, sets, todoBase_, save: postSaveTodo_, imp: postDocketImport_ };');
}
function client(js, server) {
  const pick = re => { const m = re.exec(js); if (!m) throw new Error('docket-fresh: js/map.js has no ' + re); return m[0]; };
  return new Function('server', 'const USER = { personId: "p1", todo: ' + JSON.stringify(OLD) + ' }, sent = [], box = { innerHTML: "" };'
    + 'const $ = id => (id === "dk-box" ? box : null), saveUser_ = () => {}, text_ = k => k, dkDay_ = () => "2026-11-25";'
    + 'const api = b => { sent.push(b); return Promise.resolve(b.action === "docketImport" ? server.imp(b) : server.save(b)); };'
    + 'const dkCard_ = () => dkLoad_().map(i => i.title).join("|"), may_ = () => true, cardBlocks_ = b => JSON.stringify(b);'
    + pick(/\nconst DK = .*\n/) + pick(/\nconst dkRep_ = .*\n/) + pick(/\nconst dkGone_ = .*\n/) + pick(/\nconst dkTidy_ = .*\n/)
    + ['dkLoad_', 'dkItems_', 'todoBase_', 'dkTake_', 'dkFetch_', 'dkSave_', 'dkPaint_'].map(n => fnOf(js, n, 'js/map.js')).join('')
    + 'return { DK, USER, sent, box, dkLoad_, dkSave_, dkPaint_, dkItems_ };')(server);
}
const settle = async c => { for (let i = 0; i < 5; i++) { await new Promise(u => setTimeout(u, 0)); await c.DK.asking; await c.DK.q; } };
async function check(be, js) {
  const bad = [];
  /* THE SERVER: a stale base is refused and the cell unchanged; the cell's own base is taken. */
  const s = backend(be)(NEW);
  if (s.todoBase_(OLD) === s.todoBase_(NEW)) bad.push('todoBase_ gives two different cells one base');
  const r1 = s.save({ personId: 'p1', todo: OLD, base: s.todoBase_(OLD) });
  if (!r1.stale || s.row.todo !== NEW || s.sets.length) bad.push('a save based on a stale cell was not refused, or changed the cell');
  if (r1.todo !== NEW || r1.base !== s.todoBase_(NEW)) bad.push('a stale refusal does not carry the cell as it is now');
  const r1b = s.save({ personId: 'p1', todo: OLD });
  if (!r1b.stale || s.row.todo !== NEW) bad.push('a save with no base was not refused');
  const r2 = s.save({ personId: 'p1', todo: OLD.replace('Old A', 'Kept'), base: s.todoBase_(NEW) });
  if (!r2.success || !/Kept/.test(s.row.todo) || r2.base !== s.todoBase_(s.row.todo)) bad.push('a save on the current cell was refused, or answered the wrong base');
  const rd = s.imp({ personId: 'p1', read: true });
  if (rd.todo !== s.row.todo || rd.base !== s.todoBase_(s.row.todo)) bad.push('docketImport read does not answer the cell and its base');
  /* THE PAGE: a stale cache is never drawn nor saved; the server's lists are drawn once read. */
  const srv = backend(be)(NEW), c = client(js, srv);
  c.dkPaint_();
  if (!/Fetching your Docket/.test(c.box.innerHTML)) bad.push('opening the Docket drew before the server answered');
  if (c.dkItems_().length) bad.push('Find offers a Docket card made from the cached (stale) cell');
  c.dkSave_();
  await settle(c);
  if (c.sent.some(b => b.action === 'item') || srv.row.todo !== NEW) bad.push('a save was sent before the Docket was read fresh');
  const names = c.dkLoad_().map(i => i.title).join('|');
  if (names !== 'meds|tax' || !/tax/.test((c.dkItems_()[0] || {}).text || '') || /Old [A-K]/.test((c.dkItems_()[0] || {}).text || '')) bad.push('opening the Docket with a stale cache shows ' + names + ', not the server\'s lists');
  /* a tick after reading saves on the right base; a second save waits for the first's base */
  c.dkLoad_()[0].done = true; c.dkSave_(); c.dkLoad_()[1].done = true; c.dkSave_(); await settle(c);
  if (!/"done":true[\s\S]*"done":true/.test(srv.row.todo) || /Docket changed/.test(c.DK.say)) bad.push('two ticks in a row after a fresh read were not both saved');
  /* changed elsewhere: the page's next save is refused, it says so and draws the server's lists */
  srv.row.todo = JSON.stringify({ v: 1, lists: [{ name: 'Docket', items: [{ title: 'Elsewhere' }] }] });
  c.dkLoad_()[0].title = 'Mine'; c.dkSave_(); await settle(c);
  if (!/Elsewhere/.test(srv.row.todo) || /Mine/.test(srv.row.todo)) bad.push('a save over a Docket changed elsewhere overwrote it');
  if (c.DK.say !== 'Your Docket changed elsewhere — reloaded' || c.dkLoad_().map(i => i.title).join() !== 'Elsewhere') bad.push('a refused save did not say so and reload the server\'s lists');
  if (fnOf(be, 'todoBase_', 'post-account.gs') !== fnOf(js, 'todoBase_', 'js/map.js')) bad.push('todoBase_ differs between backend/post-account.gs and js/map.js');
  return bad;
}
async function run() {
  const be = text('backend/post-account.gs'), js = text('js/map.js'), bad = await check(be, js);
  /* MUTATIONS: each break must be caught. */
  const muts = [
    ['backend takes any base', be.replace('if (S(body.base) !== todoBase_(now))', 'if (false)'), js],
    ['page draws the cached copy', be, js.replace('if (!DK.fresh) { if (!DK.asking', 'if (false) { if (!DK.asking')],
    ['page saves before reading', be, js.replace('if (!DK.fresh) { DK.items = null; dkFetch_(); return; }', '')],
    ['page sends no base', be, js.replace('todo, base: DK.base }', 'todo }')],
    ['Find draws the cached cell', be, js.replace("|| !may_('owner') || !DK.fresh) return [];", "|| !may_('owner')) return [];")],
    ['refusal not reloaded', be, js.replace('if (d && d.stale) { dkTake_(d.todo, d.base);', 'if (d && d.stale) {')]];
  for (const [what, b, j] of muts) {
    if (b === be && j === js) { bad.push('mutation "' + what + '" no longer applies — update tools/docket-fresh.js'); continue; }
    let got = []; try { got = await check(b, j); } catch (e) { got = [String(e)]; }
    if (!got.length) bad.push('mutation "' + what + '" was not caught');
  }
  console.log('docket-fresh: stale save, fresh read, ' + muts.length + ' mutations; ' + bad.length + ' wrong');
  report('docket-fresh', bad, 'the Docket can draw or save a stale cell');
  return { n: 8 + muts.length, bad: bad.length };
}
module.exports = { run };
main(module, run);
