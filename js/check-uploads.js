#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-uploads.js

   A PHOTOGRAPH OR A CLIP SENT IN A MESSAGE IS KEPT, OR THE PERSON IS TOLD WHY — AND THE OWNER HOW.

   ASKED FOR AS *"i cant send images, or videos in the chat to people. i think you need to add
   something to ledger for that."* Two things were in the way and NO CHECK COULD SEE EITHER:

     · `backend/appsscript.json` listed `drive.readonly`. A written-out `oauthScopes` list is the
       whole list — Apps Script stops inferring scopes from the code — so `createFile`, `createFolder`
       and `setSharing` could never be authorised, however many times Allow was pressed. Every
       harness here stubbed `DriveApp` as a thing that simply works, so the manifest was never read.
     · the Ledger's `messages` tab had no `attachments` column, which `ensureSchema` adds — and a
       refusal that told a parent to "run ?setup=1".

   SO THE DRIVE HERE ASKS FOR THE SCOPE GOOGLE ASKS FOR. `driveFor` refuses a write unless the token
   holds `.../auth/drive` and a read unless it holds that or `drive.readonly`, with Google's own
   sentence — and the token, by default, holds EXACTLY WHAT THE MANIFEST LISTS. A manifest that
   cannot write is a red here before it is a parent's photograph that did not arrive.

   THROUGH THE REAL BACKEND (`check-gas-load.js`) AND, FOR WHAT IS DRAWN, THE REAL APP: a jsdom
   window whose every POST is answered by that same backend, so the bubble that says "Not sent" is
   reading the sentence `sendMessage` actually wrote, and the `<img>` and `<video>` in the thread are
   drawn from the cell `msgAttachIn_` actually stored. Two windows on one Ledger, so the clip is
   asked for on BOTH sides of the conversation.

   WHAT IT ASKS, IN ORDER:
     1. the manifest holds `drive` while the backend calls Drive's write methods; the tab, its
        columns and its file are all named (TAB, SCHEMA with `attachments`, WHERE)
     2. no column: files refused in a sentence a parent can read, the owner told the address; a
        message of plain words still goes (it used to come back "Not sent" having been sent)
     3. a token that can only read: nothing sent, nothing left in Drive, the parent told it is the
        site's side, the admin told the fix — and never "No posts folder"
     4. the manifest's own token: three files kept and shared, the cell `url#type#name | …`, a file
        with no type typed by its name, and both sides drawing an `<img>` and a playable `<video>`
     5. one file of three refused half way: the two already made are binned, nothing is sent
     6. the phone: a refusal about the files offers Words only, which sends the words and puts the
        files back in the box; an unreadable file is never dropped in silence; a photograph the
        browser cannot redraw goes as it is
     7. Check uploads: admin only, four answers, one test file binned, no folder left behind, and
        the fix in order when something is missing — pressed from the Tools column

     node js/check-uploads.js
================================================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');
const { backend } = require('./check-gas-load.js');

const ROOT = path.join(__dirname, '..');
const AUTH = 'https://www.googleapis.com/auth/';
const bad = [];
const said = [];
const fail = (rule, msg) => bad.push(rule + ' — ' + msg);
const tick = ms => new Promise(ok => setTimeout(ok, ms));
async function until(fn, ms) {
  const end = Date.now() + (ms || 4000);
  while (Date.now() < end) { try { if (fn()) return true; } catch (e) { /* not yet */ } await tick(25); }
  return false;
}

let MANIFEST;
try { MANIFEST = JSON.parse(fs.readFileSync(path.join(ROOT, 'backend', 'appsscript.json'), 'utf8')); }
catch (e) {
  console.log('FAILED — backend/appsscript.json could not be read (' + e.message + '), so NOTHING was checked.');
  process.exit(1);
}
const SCOPES = (MANIFEST.oauthScopes || []).slice();
/* THE OLD DEPLOYMENT, for the journeys about what a read-only token does: the manifest's list with
   `drive` read back down to `drive.readonly` — what every Allow ever pressed had granted. */
const READONLY = SCOPES.map(s => (s === AUTH + 'drive' ? AUTH + 'drive.readonly' : s))
  .concat(SCOPES.some(s => /\/auth\/drive/.test(s)) ? [] : [AUTH + 'drive.readonly']);

/* ---------- A DRIVE THAT ASKS FOR THE SCOPE GOOGLE ASKS FOR ------------------------------------------
   Reads need `drive.readonly` or `drive`; `createFile`, `createFolder`, `setSharing` and `setTrashed`
   need `drive`. The sentences are Google's, because the backend decides what a failure MEANS by
   reading them (`driveDenied_`). `world.failOn` makes the n-th `createFile` throw an outage instead,
   for the journey where one file of three does not go. */
function driveFor(scopes, world) {
  const has = s => scopes.indexOf(AUTH + s) >= 0;
  const read = m => {
    if (!(has('drive') || has('drive.readonly'))) {
      throw new Error('Specified permissions are not sufficient to call ' + m + '. Required permissions: ('
        + AUTH + 'drive.readonly || ' + AUTH + 'drive)');
    }
  };
  const write = m => {
    if (!has('drive')) throw new Error('Specified permissions are not sufficient to call ' + m + '. Required permissions: ' + AUTH + 'drive');
  };
  const iter = list => { let i = 0; return { hasNext: () => i < list.length, next: () => list[i++] }; };
  const fileOf = (name, blob) => {
    const f = { id: 'F' + world.made.length + 'xAbCdEfGhIjKlMnOpQrStUv', name, blob, shared: '', trashed: false,
      getId: () => f.id, getName: () => f.name,
      setSharing: (a, p) => { write('DriveApp.File.setSharing'); f.shared = a + '/' + p; return f; },
      setTrashed: t => { write('DriveApp.File.setTrashed'); f.trashed = !!t; return f; } };
    return f;
  };
  const folderOf = node => ({
    getName: () => { read('DriveApp.Folder.getName'); return node.name; },
    getId: () => node.id,
    getUrl: () => 'https://drive.google.com/drive/folders/' + node.id,
    getFiles: () => { read('DriveApp.Folder.getFiles'); return iter(node.files); },
    getFolders: () => { read('DriveApp.Folder.getFolders'); return iter(node.kids.map(folderOf)); },
    getFoldersByName: n => { read('DriveApp.Folder.getFoldersByName'); return iter(node.kids.filter(k => k.name === n).map(folderOf)); },
    createFolder: n => {
      write('DriveApp.Folder.createFolder');
      const k = { id: 'SUB-' + n, name: n, files: [], kids: [] };
      node.kids.push(k); world.folders[k.id] = k; return folderOf(k);
    },
    createFile: (a, b) => {
      write('DriveApp.Folder.createFile');
      world.creates++;
      if (world.failOn && world.creates === world.failOn) throw new Error('Service error: Drive');
      const f = typeof a === 'string' ? fileOf(a, { name: a, type: 'text/plain', size: String(b || '').length })
                                      : fileOf(a.name, a);
      node.files.push(f); world.made.push(f); return f;
    },
  });
  return {
    Access: { ANYONE_WITH_LINK: 'ANYONE_WITH_LINK' }, Permission: { VIEW: 'VIEW' },
    getFolderById: id => {
      read('DriveApp.getFolderById');
      const node = world.folders[id];
      if (!node) throw new Error('No item with the given ID could be found.');
      return folderOf(node);
    },
    getFileById: () => { read('DriveApp.getFileById'); throw new Error('No item with the given ID could be found.'); },
  };
}

/* INVENTED PEOPLE — this repository is public. One of each role the message policy cares about. */
const PEOPLE = [
  { person_id: 'P-A1', first_name: 'Hal', last_name: 'Owner', handle: 'halowner', email: 'owner@example.org', role: 'admin' },
  { person_id: 'P-T1', first_name: 'Ada', last_name: 'Tutor', handle: 'adatutor', email: 'tutor@example.org', role: 'tutor', listed: 'TRUE' },
  { person_id: 'P-C1', first_name: 'Pat', last_name: 'Parent', handle: 'patparent', email: 'parent@example.org', role: 'client' },
].map(p => Object.assign({ pin: '0000', verified: 'TRUE', city: 'London' }, p));
const NAME = { 'P-A1': 'Hal Owner', 'P-T1': 'Ada Tutor', 'P-C1': 'Pat Parent' };

/* ---------- ONE LEDGER, ONE DRIVE, ONE DEPLOYMENT ---------------------------------------------------
   opts: scopes (default: the manifest's), noColumn, consent (a URL `consentUrl_` may hand over),
   failOn (the n-th createFile has an outage). */
function world(opts) {
  opts = opts || {};
  const scopes = opts.scopes || SCOPES;
  const POSTS = '1piJQHYQ2h3I_f3ullEmDcNn_RGti4VVw';
  const w = { made: [], creates: 0, failOn: opts.failOn || 0,
              folders: { [POSTS]: { id: POSTS, name: 'posts', files: [], kids: [] } } };
  const b = backend({
    DriveApp: driveFor(scopes, w),
    UrlFetchApp: { fetch: url => {
      if (/oauth2\.googleapis\.com\/tokeninfo/.test(url)) {
        return { getContentText: () => JSON.stringify({ scope: scopes.join(' ') }), getResponseCode: () => 200 };
      }
      throw new Error('no network');
    } },
  });
  b.ev(`(function(){
    Utilities.newBlob = (bytes, type, name) => ({ type: type, name: name, size: (bytes || []).length });
    ScriptApp.getAuthorizationInfo = () => ({ getAuthorizationStatus: () => 'REQUIRED',
      getAuthorizationUrl: () => ${JSON.stringify(opts.consent || '')} });
  })()`);
  if (opts.noColumn) {
    const g = b.tabs.messages; const at = g[0].indexOf('attachments'); if (at >= 0) g[0].splice(at, 1);
  }
  b.seed('people', PEOPLE);
  const tok = {};
  PEOPLE.forEach(p => {
    const d = b.post({ action: 'verifyLogin', email: p.email, pin: '0000' });
    if (!d.success) throw new Error('could not sign ' + p.email + ' in: ' + JSON.stringify(d));
    tok[p.person_id] = d;
  });
  const as = (pid, body) => b.post(Object.assign({ token: tok[pid].token, name: tok[pid].name, personId: pid }, body));
  const msg = (from, to, body, files) => as(from, { action: 'sendMessage', to: NAME[to], toId: to, body: body || '', files: files || [] });
  const rows = () => {
    const g = b.tabs.messages; const h = g[0];
    return g.slice(1).map(r => { const o = {}; h.forEach((c, i) => { o[c] = r[i]; }); return o; });
  };
  return { b, w, tok, as, msg, rows, posts: w.folders[POSTS] };
}

const dataUrl = (type, n) => 'data:' + type + ';base64,' + Buffer.alloc(n, 7).toString('base64');
const IMG = { name: 'IMG_0001.jpg', type: 'image/jpeg', data: dataUrl('image/jpeg', 50000) };
const VID = { name: 'IMG_0002.MOV', type: 'video/quicktime', data: dataUrl('video/quicktime', 1048576) };
/* NO TYPE, the way a clip shared in from another app can arrive — the name is all it has. */
const BARE = { name: 'clip.mp4', type: '', data: dataUrl('application/octet-stream', 4000) };
const SCOPE_WORDS = /googleapis\.com|auth\/drive|Deploy|Apps Script/;

/* ================================================================================================
   1. THE MANIFEST, AND THE TAB
   ================================================================================================ */
{
  const strip = s => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:])\/\/[^\n]*/g, '$1');
  const gs = fs.readdirSync(path.join(ROOT, 'backend')).filter(f => f.endsWith('.gs'))
    .map(f => strip(fs.readFileSync(path.join(ROOT, 'backend', f), 'utf8'))).join('\n');
  const writes = [...new Set([...gs.matchAll(/\.(createFile|createFolder|setSharing|setTrashed|addFile|moveTo)\s*\(/g)].map(m => m[1]))];
  if (!writes.length) fail('the manifest', 'found no Drive write in backend/*.gs — the reader is broken, not the backend');
  else if (SCOPES.indexOf(AUTH + 'drive') < 0) {
    fail('the manifest', 'backend/*.gs calls ' + writes.join(', ') + ' and appsscript.json does not list '
      + AUTH + 'drive (it lists: ' + SCOPES.filter(s => /drive/.test(s)).join(', ') + ' ). A written-out '
      + 'oauthScopes list is the whole list: those calls can never be authorised.');
  } else said.push('manifest: ' + writes.length + ' Drive write method(s) in the backend, and .../auth/drive is listed');

  const b = backend({});
  const tab = b.ev('TAB.messages'), cols = b.ev('SCHEMA.messages') || [];
  const where = b.ev('WHERE.messages || WHERE[TAB.messages]');
  if (!tab) fail('the tab', 'TAB has no messages');
  if (cols.indexOf('attachments') < 0) fail('the tab', 'SCHEMA.messages has no `attachments` — ensureSchema would never add the column');
  if (!where || !where.file) fail('the tab', 'WHERE does not route messages to a file, so nothing can open it');
}

/* ================================================================================================
   2. NO COLUMN
   ================================================================================================ */
{
  const W = world({ noColumn: true });
  const parent = W.msg('P-C1', 'P-T1', 'the homework', [IMG]);
  if (parent.success) fail('no column', 'a photograph was accepted with nowhere to keep its address');
  else {
    if (!/^Photos and videos cannot be sent yet, so nothing was sent/.test(parent.error)) fail('no column', 'the parent was told "' + parent.error + '"');
    if (/\?setup=1|ensureSchema/.test(parent.error)) fail('no column', 'a parent was told to run setup: "' + parent.error + '"');
    if (parent.why !== 'files') fail('no column', 'the refusal does not say it was the files (why: "' + parent.why + '"), so the phone cannot offer Words only');
  }
  const owner = W.msg('P-A1', 'P-T1', '', [VID]);
  if (owner.success || !/\?setup=1/.test(owner.error || '') || !/attachments/.test(owner.error || '')) {
    fail('no column', 'the admin was not told which column and where to add it: ' + JSON.stringify(owner));
  }
  if (W.w.made.length) fail('no column', W.w.made.length + ' file(s) were put in Drive for a message that was refused');
  if (W.rows().length) fail('no column', 'a refused message wrote a row');
  /* THE BUG THAT MADE "SEND" LOOK BROKEN WHEN IT WAS NOT: words only, no column, used to come back
     "Nothing was saved for: messages.attachments" — after the row was written and the e-mail sent. */
  const W2 = world({ noColumn: true });
  const words = W2.msg('P-T1', 'P-C1', 'See you Tuesday', []);
  if (!words.success) fail('no column', 'a message of plain words was refused: "' + words.error + '"');
  if (W2.rows().length !== 1) fail('no column', 'a message of plain words wrote ' + W2.rows().length + ' rows');
  else said.push('no column: files refused in a sentence, the admin told ?setup=1, plain words still sent');
}

/* ================================================================================================
   3. A TOKEN THAT CAN ONLY READ
   ================================================================================================ */
{
  const W = world({ scopes: READONLY });
  const parent = W.msg('P-C1', 'P-T1', 'the homework', [IMG, VID]);
  if (parent.success) fail('read-only', 'a read-only deployment reported the files kept');
  else {
    if (!/could not be kept, so nothing was sent/.test(parent.error)) fail('read-only', 'the parent was not told the files were not kept: "' + parent.error + '"');
    if (SCOPE_WORDS.test(parent.error)) fail('read-only', 'a parent was shown the admin\'s diagnosis: "' + parent.error.slice(0, 160) + '…"');
    if (/No posts folder/i.test(parent.error)) fail('read-only', 'a refused createFolder was reported as a missing posts folder');
    if (parent.why !== 'files') fail('read-only', 'why is "' + parent.why + '", not "files"');
  }
  if (W.w.made.length || W.rows().length) fail('read-only', 'a refusal left ' + W.w.made.length + ' file(s) and ' + W.rows().length + ' row(s)');
  /* THE ADMIN, with and without a consent link to hand over. */
  const owner = W.msg('P-A1', 'P-T1', '', [IMG]);
  if (!/FIX:/.test(owner.error || '') || !/New version/.test(owner.error || '') || !/drive\.readonly/.test(owner.error || '')) {
    fail('read-only', 'the admin was not told the fix: "' + String(owner.error).slice(0, 300) + '"');
  } else if (!/press Run, then Allow/.test(owner.error)) {
    fail('read-only', 'with no consent link the admin was not sent to the editor: "' + owner.error.slice(0, 300) + '"');
  }
  const W2 = world({ scopes: READONLY, consent: 'https://accounts.google.com/o/oauth2/consent-for-check' });
  const linked = W2.msg('P-A1', 'P-T1', '', [IMG]);
  if (!/https:\/\/accounts\.google\.com\/o\/oauth2\/consent-for-check/.test(linked.error || '')) {
    fail('read-only', 'the consent link Apps Script handed over was not in the admin\'s refusal');
  }
  if (!bad.some(x => /^read-only/.test(x))) said.push('read-only token: nothing kept or written, the parent told it is our side, the admin told the fix and the link');
}

/* ================================================================================================
   4. THE MANIFEST'S OWN TOKEN — AND 5. ONE OF THREE REFUSED HALF WAY
   ================================================================================================ */
const WORKS = world({});
{
  const W = WORKS;
  const d = W.msg('P-A1', 'P-T1', 'Here are the pages', [IMG, VID, BARE]);
  if (!d.success) fail('kept', 'a photo and two clips were refused under the manifest\'s own scopes: "' + d.error + '"');
  else {
    const cell = String(W.rows()[0].attachments || '');
    const want = /^https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view#image\/jpeg#IMG_0001\.jpg \| https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view#video\/quicktime#IMG_0002\.MOV \| https:\/\/drive\.google\.com\/file\/d\/[\w-]+\/view#video\/mp4#clip\.mp4$/;
    if (!want.test(cell)) fail('kept', 'the attachments cell is not url#type#name × 3 (a typeless .mp4 typed video/mp4): ' + JSON.stringify(cell));
    const unshared = W.w.made.filter(f => f.shared !== 'ANYONE_WITH_LINK/VIEW');
    if (W.w.made.length !== 3 || unshared.length) fail('kept', W.w.made.length + ' file(s) made, ' + unshared.length + ' not shared by link — a file only its owner can open is a broken square in the other bubble');
    const sub = W.posts.kids.filter(k => k.name === 'Messages');
    if (sub.length !== 1 || sub[0].files.length !== 3) fail('kept', 'the files are not in one Messages folder inside the posts folder');
    ['P-A1', 'P-T1'].forEach(pid => {
      const r = W.as(pid, { action: 'messages' });
      const a = ((r.messages || [])[0] || {}).attachments || [];
      if (a.map(x => x.type).join(',') !== 'image/jpeg,video/quicktime,video/mp4') {
        fail('kept', NAME[pid] + '\'s `messages` reply carries ' + JSON.stringify(a));
      }
    });
    if (!bad.some(x => /^kept/.test(x))) said.push('kept: three files made, shared by link, stored as url#type#name, and read back by both people');
  }

  const H = world({ failOn: 2 });
  const half = H.msg('P-A1', 'P-T1', 'three pages', [IMG, VID, BARE]);
  if (half.success) fail('half way', 'a message whose second file failed was sent');
  else {
    if (!/^IMG_0002\.MOV could not be kept, so nothing was sent/.test(half.error)) fail('half way', 'the refusal does not name the file that failed: "' + half.error + '"');
    const left = H.w.made.filter(f => !f.trashed);
    if (left.length) fail('half way', left.length + ' file(s) left in Drive from a message that was not sent — a Retry would keep them twice');
    if (H.rows().length) fail('half way', 'a row was written');
    if (!bad.some(x => /^half way/.test(x))) said.push('half way: the file that failed is named, the one already made is binned, no row');
  }
}

/* ================================================================================================
   7. CHECK UPLOADS, THROUGH THE BACKEND
   ================================================================================================ */
{
  const W = world({});
  const no = W.as('P-C1', { action: 'checkUploads' });
  if (no.success || no.ok) fail('check uploads', 'a parent could run it: ' + JSON.stringify(no).slice(0, 200));
  const tutor = W.as('P-T1', { action: 'checkUploads' });
  if (tutor.success) fail('check uploads', 'a tutor could run it');
  const yes = W.as('P-A1', { action: 'checkUploads' });
  const ids = (yes.checks || []).map(c => c.id + ':' + c.ok).join(' ');
  if (!yes.success || !yes.ok || ids !== 'column:true scope:true folder:true write:true') {
    fail('check uploads', 'on a working deployment it said ok=' + yes.ok + ' [' + ids + '] ' + (yes.error || ''));
  }
  if (W.w.made.length !== 1 || !W.w.made[0].trashed || W.w.made[0].shared !== 'ANYONE_WITH_LINK/VIEW') {
    fail('check uploads', 'it should make ONE test file, share it and bin it — made ' + W.w.made.length
      + (W.w.made[0] ? ', trashed ' + W.w.made[0].trashed + ', shared ' + W.w.made[0].shared : ''));
  }
  if (W.posts.kids.length) fail('check uploads', 'it left a folder behind: ' + W.posts.kids.map(k => k.name).join(', '));
  if ((yes.steps || []).length) fail('check uploads', 'a working deployment was given steps: ' + JSON.stringify(yes.steps));

  const R = world({ scopes: READONLY, noColumn: true });
  const ro = R.as('P-A1', { action: 'checkUploads' });
  const byId = {}; (ro.checks || []).forEach(c => { byId[c.id] = c; });
  const steps = (ro.steps || []).map(s => s.text).join(' | ');
  if (ro.ok || !byId.scope || byId.scope.ok || byId.write.ok || byId.column.ok || !byId.folder.ok) {
    fail('check uploads', 'a read-only deployment without the column was reported as ' + JSON.stringify(ro.checks));
  }
  if (!/Allow/.test(steps) || !/New version/.test(steps) || !(ro.steps || []).some(s => s.setup)) {
    fail('check uploads', 'the steps do not say Allow, a new version and ?setup=1: ' + steps);
  }
  if (R.w.made.length) fail('check uploads', 'a read-only check somehow made a file');
  if (!bad.some(x => /^check uploads/.test(x))) said.push('check uploads: admin only, four answers, one test file binned, the fix in order when it fails');
}

/* ================================================================================================
   6 AND 7 ON THE SCREEN — THE REAL APP, EVERY POST ANSWERED BY THE REAL BACKEND
   ================================================================================================ */
function loadOrder_() {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(html);
  if (!m) { console.log('FAILED — cannot read window.FILES out of index.html, so the screen was NOT checked.'); process.exit(1); }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
}
const FIXTURE = JSON.parse(fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8'));
const SRC = loadOrder_().map(n => fs.readFileSync(path.join(ROOT, 'js', n + '.js'), 'utf8')).join('\n');
const opened = [];

function app(W, pid) {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8').replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/' });
  const w = dom.window;
  opened.push(w);
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {};
  w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLMediaElement.prototype.pause = () => {};
  w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  w.HTMLMediaElement.prototype.load = () => {};
  w.requestAnimationFrame = cb => setTimeout(() => cb(Date.now()), 0);
  w.cancelAnimationFrame = id => clearTimeout(id);
  const t = W.tok[pid];
  w.localStorage.setItem('familyUser', JSON.stringify(Object.assign({}, t, {
    name: t.name || NAME[pid], personId: pid, role: PEOPLE.find(p => p.person_id === pid).role })));
  const posted = [];
  w.fetch = (url, o) => {
    const reply = x => Promise.resolve({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(x)), json: () => Promise.resolve(x) });
    if (o && o.body) {
      let b = {}; try { b = JSON.parse(o.body); } catch (e) {}
      posted.push(b.action);
      let d;
      try { d = W.b.post(b); } catch (e) { d = { error: 'backend threw: ' + e.message }; }
      return reply(d);
    }
    posted.push('GET ' + String(url).slice(0, 60));
    const f = /(data\/[a-z0-9_\-\/]+\.json)/.exec(String(url));
    if (f) { try { return reply(JSON.parse(fs.readFileSync(path.join(ROOT, f[1]), 'utf8'))); } catch (e) {} }
    return reply(FIXTURE);
  };
  const errs = [];
  w.onerror = m => errs.push(String(m));
  w.addEventListener('unhandledrejection', e => errs.push('rejected: ' + ((e.reason && e.reason.message) || e.reason)));
  const toasts = [];
  try {
    w.eval(SRC + '\n;window.__u = { go, paint, ACTIONS, messageSheet, MSG_QUEUE, allWidgets, widgetsOf_,' +
      ' MSGS: () => MESSAGES, PENDING: () => MSG_PENDING, LOADED: () => LOADED,' +
      ' setToast: f => { toast = f; }, setCam: f => { camItemOf_ = f; } };');
  } catch (e) { return { err: 'the app did not load: ' + e.message }; }
  w.__u.setToast(m => toasts.push(String(m)));
  return { w, d: w.document, u: w.__u, posted, toasts, errs };
}

/* A FILE ON THE PHONE, as the composer holds it after the picker — `url` stands in for the
   `blob:` address jsdom cannot make. */
const fileOn = (w, name, type, n) => {
  const f = new w.File([Buffer.alloc(n, 9)], name, { type: type });
  return { file: f, name: name, type: type, size: f.size, url: 'blob:' + name };
};

/* WRITE TO SOMEBODY THE WAY A PERSON DOES: their card's Message, the sheet, the box, Send. */
async function sendFrom(A, to, words, queue) {
  A.u.messageSheet(NAME[to], to);
  A.u.MSG_QUEUE[to] = queue;
  const form = A.d.querySelector('#sheet .msg-form');
  if (!form) return 'the message sheet drew no form';
  form.querySelector('.msg-text').value = words;
  A.u.ACTIONS['msg-send'](form.querySelector('.msg-go'));
  return '';
}

async function screens() {
  /* ---------- THE WORKING DEPLOYMENT, BOTH SIDES ------------------------------------------------- */
  const W = world({});
  const A = app(W, 'P-A1');
  if (A.err) return fail('the app', A.err);
  if (!(await until(() => A.u.LOADED(), 45000))) {
    return fail('the app', 'the admin\'s app never finished loading (posted: ' + A.posted.join(', ')
      + '; errors: ' + A.errs.slice(0, 3).join(' | ') + ')');
  }
  const sentErr = await sendFrom(A, 'P-T1', 'Here are the pages',
    [fileOn(A.w, 'page1.jpg', 'image/jpeg', 3000), fileOn(A.w, 'IMG_0002.MOV', 'video/quicktime', 9000)]);
  if (sentErr) return fail('the app', sentErr);
  if (!(await until(() => W.rows().length === 1 && !A.u.PENDING().length, 20000))) {
    const p = A.u.PENDING()[0];
    return fail('sending', 'a photo and a clip pressed through Send did not arrive: ' + (p ? p.state + ' — ' + p.err : W.rows().length + ' row(s)'));
  }
  const both = async (X, mine) => {
    X.u.go('dm');
    const ok = await until(() => X.d.querySelector('#s-dm .msg video.msg-vid'), 20000);
    const side = mine ? '.msg.mine' : '.msg:not(.mine)';
    const img = X.d.querySelector('#s-dm ' + side + ' .msg-pic img');
    const vid = X.d.querySelector('#s-dm ' + side + ' video.msg-vid');
    const who = mine ? 'the sender' : 'the recipient';
    if (!ok || !img || !vid) return fail('the thread', who + ' sees ' + (img ? '' : 'no <img> ') + (vid ? '' : 'no <video> ') + 'in the bubble');
    if (!/^https:\/\/lh3\.googleusercontent\.com\/d\/[\w-]+/.test(img.getAttribute('src') || '')) fail('the thread', who + '\'s <img> is ' + img.getAttribute('src'));
    if (!/drive\.google\.com\/file\/d\//.test((img.closest('a') || {}).href || '')) fail('the thread', who + '\'s picture does not open the full-size file when tapped');
    if (!vid.hasAttribute('controls') || !vid.hasAttribute('playsinline') || vid.getAttribute('preload') !== 'metadata') {
      fail('the thread', who + '\'s <video> is ' + vid.outerHTML.slice(0, 160));
    }
    if (!/^https:\/\//.test(vid.getAttribute('src') || '')) fail('the thread', who + '\'s clip has no address: ' + vid.getAttribute('src'));
  };
  await both(A, true);
  const T = app(W, 'P-T1');
  if (T.err) return fail('the app', T.err);
  await until(() => T.u.LOADED(), 45000);
  await both(T, false);

  /* ---------- AN UNREADABLE FILE, AND A PHOTOGRAPH THE BROWSER CANNOT REDRAW ---------------------
     The tutor writes back. `camItemOf_` answers null, as it does for a HEIC in Chrome; one queued
     item is not a file at all, so FileReader throws on it. */
  T.u.setCam(() => Promise.resolve(null));
  const heic = fileOn(T.w, 'IMG_0003.HEIC', 'image/heic', 2 * 1048576 + 10);
  const ghost = { file: {}, name: 'gone.jpg', type: 'image/jpeg', size: 10, url: 'blob:gone' };
  await sendFrom(T, 'P-A1', 'Thanks', [heic, ghost]);
  if (!(await until(() => W.rows().length === 2 && !T.u.PENDING().length, 20000))) {
    const p = T.u.PENDING()[0];
    fail('unreadable', 'the tutor\'s reply did not arrive: ' + (p ? p.state + ' — ' + p.err : W.rows().length + ' row(s)'));
  } else {
    const cell = String(W.rows()[1].attachments || '');
    if (!/#image\/heic#IMG_0003\.HEIC$/.test(cell)) fail('unreadable', 'a HEIC the browser could not redraw was not sent as it is: ' + JSON.stringify(cell));
    if (/gone\.jpg/.test(cell)) fail('unreadable', 'a file that could not be read reached the cell');
    const back = (T.u.MSG_QUEUE['P-A1'] || []).map(q => q.name);
    if (back.indexOf('gone.jpg') < 0) fail('unreadable', 'the file that could not be read was dropped rather than put back in the box (box: ' + JSON.stringify(back) + ')');
    if (!T.toasts.some(m => /gone\.jpg could not be read/.test(m))) fail('unreadable', 'nobody was told gone.jpg was left out — toasts: ' + JSON.stringify(T.toasts));
    if (!bad.some(x => /^unreadable/.test(x))) said.push('unreadable: the rest went, the one that could not be read is back in the box with its name said; a HEIC went as it is');
  }
  if (!bad.some(x => /^(the thread|sending)/.test(x))) said.push('the thread: an <img> that opens the file and a <video controls playsinline preload=metadata> on both sides');

  /* ---------- CHECK UPLOADS FROM THE TOOLS COLUMN --------------------------------------------------- */
  const tools = A.u.widgetsOf_('tool').map(x => x.id);
  if (tools.indexOf('uploads') < 0) fail('the tool', 'an admin\'s Tools column has no Check uploads');
  if (T.u.widgetsOf_('tool').some(x => x.id === 'uploads')) fail('the tool', 'a tutor\'s Tools column offers Check uploads');
  A.u.go('tools');
  await until(() => A.d.querySelector('#s-tools .up-box [data-do="uploads-check"]'), 15000);
  const tile = A.d.querySelector('#s-tools .up-box [data-do="uploads-check"]');
  if (!tile) fail('the tool', 'the Tools column drew no Check uploads tile for an admin');
  else {
    const made = W.w.made.length;
    A.u.ACTIONS['uploads-check'](tile);
    await until(() => A.d.querySelector('#s-tools .up-box .up-list'), 15000);
    const rows = A.d.querySelectorAll('#s-tools .up-box .up-row.is-ok');
    const verdict = (A.d.querySelector('#s-tools .up-box .up-said') || {}).textContent || '';
    if (rows.length !== 4 || !/^Ready/.test(verdict.trim())) fail('the tool', 'a working deployment drew ' + rows.length + ' ticks and "' + verdict.trim() + '"');
    if (W.w.made.length !== made + 1 || !W.w.made[W.w.made.length - 1].trashed) fail('the tool', 'pressing it did not make and bin exactly one test file');
  }

  /* ---------- A READ-ONLY DEPLOYMENT: THE REFUSAL ON THE SCREEN, AND WORDS ONLY ------------------- */
  const R = world({ scopes: READONLY });
  const P = app(R, 'P-C1');
  if (P.err) return fail('the app', P.err);
  await until(() => P.u.LOADED(), 45000);
  P.u.go('dm');
  await sendFrom(P, 'P-T1', 'Here is his homework', [fileOn(P.w, 'homework.jpg', 'image/jpeg', 3000)]);
  const failed = await until(() => P.u.PENDING()[0] && P.u.PENDING()[0].state === 'failed', 20000);
  if (!failed) return fail('words only', 'a refused photograph did not leave a failed bubble');
  P.u.paint('dm');
  await until(() => P.d.querySelector('#s-dm .msg.is-failed'), 15000);
  const why = (P.d.querySelector('#s-dm .msg-fail-why') || {}).textContent || '';
  if (!/could not be kept, so nothing was sent/.test(why)) fail('words only', 'the bubble says "' + why.trim() + '"');
  if (SCOPE_WORDS.test(why)) fail('words only', 'a parent\'s bubble carries the admin\'s diagnosis: "' + why.trim().slice(0, 160) + '"');
  const words = P.d.querySelector('#s-dm [data-do="msg-words"]');
  if (!words) fail('words only', 'a refusal about the files offers no Words only');
  else {
    P.u.ACTIONS['msg-words'](words);
    if (!(await until(() => R.rows().length === 1 && !P.u.PENDING().length, 20000))) {
      fail('words only', 'Words only did not send the words');
    } else {
      const row = R.rows()[0];
      if (row.body !== 'Here is his homework' || String(row.attachments || '')) fail('words only', 'the row is ' + JSON.stringify(row));
      const back = (P.u.MSG_QUEUE['P-T1'] || []).map(q => q.name);
      if (back.join() !== 'homework.jpg') fail('words only', 'the photograph did not go back in the box (box: ' + JSON.stringify(back) + ')');
    }
  }
  if (!bad.some(x => /^words only/.test(x))) said.push('words only: a parent sees "could not be kept, so nothing was sent" in plain words, and Words only sends them with the photo back in the box');

  /* AND CHECK UPLOADS ON THAT DEPLOYMENT, as its admin would see it. */
  const O = app(R, 'P-A1');
  await until(() => O.u.LOADED(), 45000);
  O.u.go('tools');
  await until(() => O.d.querySelector('#s-tools .up-box [data-do="uploads-check"]'), 15000);
  const t2 = O.d.querySelector('#s-tools .up-box [data-do="uploads-check"]');
  if (t2) {
    O.u.ACTIONS['uploads-check'](t2);
    await until(() => O.d.querySelector('#s-tools .up-box .up-steps'), 15000);
    const steps = (O.d.querySelector('#s-tools .up-box .up-steps') || {}).textContent || '';
    if (!/Allow/.test(steps) || !/New version/.test(steps)) fail('the tool', 'a read-only deployment\'s steps read "' + steps.replace(/\s+/g, ' ').trim() + '"');
    if (!O.d.querySelector('#s-tools .up-box .up-row.is-bad')) fail('the tool', 'a read-only deployment drew no ✗');
  }
  if (!bad.some(x => /^the tool/.test(x))) said.push('the tool: on an admin\'s Tools column only; pressed, it draws four ticks — or the crosses and the steps');

  [A, T, P, O].forEach(X => X && X.errs.length && fail('the app', 'script errors: ' + X.errs.slice(0, 3).join(' | ')));
}

screens().catch(e => fail('the app', 'threw: ' + (e && e.stack || e))).then(() => {
  opened.forEach(w => { try { w.close(); } catch (e) {} });
  said.forEach(s => console.log('  ' + s));
  if (bad.length) {
    console.log('\nFAILED — ' + bad.length + ':');
    bad.forEach(b => console.log('  ✗ ' + b));
    process.exit(1);
  }
  console.log('\nOK — a photo or a clip in a message is kept and drawn on both sides, or refused in words its reader can act on.');
  process.exit(0);
});
