/* @family. — 40_content.gs (5 of 8) POSTS, RESOURCES, THE MAP, AND DRIVE. § */


/* WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens. § */
/* THE CONSENT SCREEN, AS A LINK. § */
function consentUrl_() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const url = info && info.getAuthorizationUrl ? info.getAuthorizationUrl() : '';
    return url || '';
  } catch (err) { return ''; }
}

/** Fill in the postcodes we know, for venues that have none. Returns how many it wrote. */
function seedPostcodes() {
  const t = read(TAB.venues);
  if (!t.sheet || t.headers.indexOf('postcode') < 0) return 0;
  const by = {};
  Object.keys(KNOWN_POSTCODES).forEach(n => { by[key(n)] = KNOWN_POSTCODES[n]; });
  let wrote = 0;
  t.rows.forEach(r => {
    if (S(r.postcode)) return;                       // theirs wins, always
    const got = by[key(S(r.name))];
    if (!got) return;
    setCell(t, r, 'postcode', got);
    wrote++;
  });
  if (wrote) clearCache();
  return wrote;
}

function geocodeVenues(force) {
  const t = read(TAB.venues);
  if (!t.sheet) return { error: 'no venues tab' };
  if (t.headers.indexOf('postcode') < 0) {
    return { error: 'the venues tab has no postcode column — deploy this version first, '
                  + 'then load ?setup=1' };
  }

  const want = t.rows.filter(r => S(r.name) && S(r.postcode)
    && (force || !(N(r.lat) && N(r.lng))));
  const noPostcode = t.rows.filter(r => S(r.name) && !S(r.postcode)).map(r => S(r.name));
  if (!want.length) {
    return { placed: 0, alreadyPlaced: t.rows.filter(r => N(r.lat) && N(r.lng)).length,
             noPostcode: noPostcode,
             note: noPostcode.length ? 'Fill in a postcode for those and run it again.'
                                     : 'Every venue with a postcode already has coordinates.' };
  }

  let placed = 0;
  const failed = [];
  /* A hundred a request is the service's own limit. Chunked rather than assumed, so the day this
     runs against a longer list it still works instead of silently returning nothing. */
  for (let i = 0; i < want.length; i += 100) {
    const batch = want.slice(i, i + 100);
    let out;
    try {
      const res = UrlFetchApp.fetch('https://api.postcodes.io/postcodes', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ postcodes: batch.map(r => S(r.postcode)) }),
      });
      out = JSON.parse(res.getContentText());
    } catch (err) {
      return { error: 'Could not reach postcodes.io: ' + err,
               placed: placed,
               note: 'Apps Script needs the external_request scope, which is inferred from '
                   + 'UrlFetchApp — if this is the first thing to use it, run any function from '
                   + 'the editor once and accept the prompt.' };
    }

    (out && out.result || []).forEach((entry, k) => {
      const row = batch[k];
      const got = entry && entry.result;
      /* A postcode the service does not recognise comes back as a null result rather than an error, so it has to be tested for — otherwise a typo writes `undefined` § */
      if (!got || !got.latitude || !got.longitude) { failed.push(S(row.name) + ' — ' + S(row.postcode)); return; }
      setCell(t, row, 'lat', got.latitude);
      setCell(t, row, 'lng', got.longitude);
      placed++;
    });
  }

  clearCache();
  const out2 = { placed: placed, couldNotPlace: failed, noPostcode: noPostcode };
  Logger.log(JSON.stringify(out2, null, 2));
  return out2;
}

/* ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION § */
function driveDenied_(raw) {
  return /permission|authoriz|authoris|scope/i.test(S(raw));
}

/* ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS § */
function heldScopes_() {
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token='
        + encodeURIComponent(ScriptApp.getOAuthToken()),
      { muteHttpExceptions: true });
    const held = String((JSON.parse(res.getContentText() || '{}') || {}).scope || '')
      .split(/\s+/).filter(Boolean);
    return { held: held, error: '' };
  } catch (err) {
    return { held: [], error: String((err && err.message) || err) };
  }
}

/* ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS § */
function holdsScope_(held, name) {
  return (held || []).some(x => S(x).split('/auth/')[1] === name);
}

/* ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE § */
function driveFix_() {
  const consent = consentUrl_();
  return {
    consent: consent,
    say: (consent
      ? 'Open the consent link and press Allow, ticking every box; then run authoriseDrive in the '
        + 'Apps Script editor'
      : 'In the Apps Script editor run authoriseDrive and press Allow, ticking every box')
      + '. Only when its last line says READY: Deploy → Manage deployments → edit → Version: New '
      + 'version → Deploy. the authoriseDrive log says READY when it has worked.',
  };
}

/* ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT § */
function driveTrouble_(err, admin) {
  const raw = String((err && err.message) || err || '');
  if (!driveDenied_(raw)) return raw;
  if (!admin) {
    return 'The site is not allowed to save files to Google Drive at the moment — that is on our '
      + 'side, not yours, and the admin can see how to fix it.';
  }

  /* THE DIAGNOSIS COMES WITH THE FAILURE. § */
  const s = heldScopes_();
  if (s.error) {
    /* It could not even ask. That needs script.external_request, so the manifest has not reached
       this deployment at all — which is a different answer from "the Drive scope is missing", and
       it points at a different step. */
    return [raw, 'This deployment could not ask Google what it is allowed to do (' + s.error + '), so '
      + 'the manifest has not reached it. Sync backend/ — appsscript.json is one of its files — then '
      + 'deploy a NEW VERSION: a deployed version pins its manifest.'].join('\n');
  }

  if (!holdsScope_(s.held, 'drive')) {
    /* ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE § */
    const fix = driveFix_();
    return ['Drive refused it: this deployment holds ' + (holdsScope_(s.held, 'drive.readonly')
      ? 'drive.readonly, so it can read the folder and cannot add to it.' : 'no Drive scope at all.'),
      'FIX: ' + fix.say]
      .concat(fix.consent ? ['Consent link: ' + fix.consent] : []).join('\n');
  }
  /* The scope is held and the call still failed. That is a different problem entirely, and
     sending somebody back round the authorisation loop would waste their afternoon. */
  return [raw, '.../auth/drive IS held, so this is not the scope. Most likely the folder in '
    + '`posts_folder` belongs to another account or is on a shared drive that refuses sharing by '
    + 'link. authoriseDrive names the folder and tries a test file.'].join('\n');
}

/* WHEN A POST HAPPENED. § */
function postWhen_(r) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    const d = sheetDate(r[cols[i]]);
    if (d) return d;
  }
  return null;
}

/** Which date column this sheet writes to. The first one it actually has, same order. */
function dateCol_(t) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    if (t.headers.indexOf(cols[i]) >= 0) return cols[i];
  }
  return 'posted_on';
}

/* EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read, so the order is decided here and nowhere else. § */
function postMediaOut_(r) {
  const out = [];
  [S(r.image)].concat(S(r.media).split('|')).forEach(x => {
    const v = S(x).trim();
    if (v && out.indexOf(v) < 0) out.push(v);
  });
  return out;
}

/* A file's name without its extension. § */
function captionFromName_(n) {
  return S(n).replace(/\.[^./]+$/, '').trim();
}

/* `fillPostNames_` WAS HERE, and it is gone with the Drive call it made. § */


/** The set on offer, most specific first: this post's own, then the brand tab, then the code. */
function reactionSet(postRow) {
  const own = S(postRow && postRow.reactions).split(/\s+/).filter(Boolean);
  if (own.length) return own;
  /* THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`, read by `settingsInto_` on the phone. § */
  return HOUSE_REACTIONS.slice();
}

function getPostFolder() {
  const cfg = config();
  let id = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) || POSTS_FOLDER;

  /* A pasted URL works as well as a bare id. Somebody copying a folder link and pasting the whole
     thing is the obvious mistake, and refusing it would be pedantry — the id is right there. */
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;

  if (!id) id = PropertiesService.getScriptProperties().getProperty('POSTS_FOLDER_ID') || '';
  if (!id) return null;

  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    /* Wrong id, or a folder this script cannot reach. Returning null rather than throwing, so the
       caller can say something useful instead of the request dying. */
    return null;
  }
}

/* ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK § */
function driveKeep_(folder, raw, name) {
  const v = S(raw).trim();
  if (!v) return '';
  if (!/^data:/i.test(v)) return v;
  const parts = v.split(',');
  const type = ((parts[0] || '').match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const ext = ({ 'image/jpeg': 'jpg', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v' })[type]
    || (type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
  const blob = Utilities.newBlob(Utilities.base64Decode(parts[1] || ''), type, S(name) + '.' + ext);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  /* `#video` IS HOW THE PHONE KNOWS WHICH ELEMENT TO DRAW. A Drive address names no type. */
  return driveFileUrl_(file.getId())
    + (/^video\//i.test(type) ? '#video' : '');
}

/* ---------- WHAT A POST MAY PUT IN DRIVE § */
const POST_FILE_MAX  = 20 * 1048576;
const POST_FILES_MAX = Math.floor(45 * 1048576 * 3 / 4);
const POST_PIC_MAX   = 8 * 1048576;

function postMediaRefusal_(list) {
  const all = (list || []).map(x => S(x).trim()).filter(Boolean);
  /* NO LINKS (413): a post's pictures are files the author chose, uploaded here — never an address typed or pasted. */
  if (all.some(x => !/^data:/i.test(x))) {
    return 'A post takes pictures chosen from your phone, not links. Nothing was posted.';
  }
  const ups = all;
  let total = 0;
  for (let i = 0; i < ups.length; i++) {
    const head = (ups[i].match(/^data:([^;,]*);base64,/i) || [])[1] || '';
    if (!/^(image\/(jpeg|png|gif|webp|heic|heif)|video\/[\w.+-]+)$/i.test(head)) {
      return 'A post can hold photos and videos only' + (head ? ' — not ' + head : '') + '. Nothing was posted.';
    }
    const bytes = Math.floor((ups[i].length - ups[i].indexOf(',') - 1) * 3 / 4);
    /* A PICTURE IS REDRAWN AT 1600px ON THE PHONE (`camItemOf_`), well under a megabyte; one this big was never redrawn. */
    if (/^image\//i.test(head) && bytes > POST_PIC_MAX) {
      return 'A picture in this post is over ' + (POST_PIC_MAX / 1048576) + 'MB — choose a smaller one. Nothing was posted.';
    }
    if (bytes > POST_FILE_MAX) {
      return (/^video\//i.test(head) ? 'A clip' : 'A picture') + ' in this post is over 20MB — trim it '
        + 'to about twenty seconds and post again. Nothing was posted.';
    }
    total += bytes;
  }
  if (total > POST_FILES_MAX) {
    return 'That is too much to post at once (over 33MB). Post the clips separately. Nothing was posted.';
  }
  return '';
}

/* ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING § */
const POST_WAITING_MAX = 5;

/* IS THIS POST THEIRS — who pressed Post (`posted_by`), or the name on it for a row typed before that column. */
function postIsBy_(r, me) {
  const id = S(me && me.person_id);
  const p = id ? findPerson(S(r && r.posted_by) || S(r && r.author)) : null;
  return !!p && S(p.person_id) === id;
}
/* WAITING, UP OR TURNED DOWN — one reading of the `approved` cell (blank is up: an admin's own, or a row typed in). */
function postState_(r) {
  const s = norm(r && r.approved);
  return s === 'pending' ? 'pending' : s === 'refused' ? 'refused' : 'up';
}

/* ---------- ONE REPORT RULE (486): a row's kind, item, state and weight, old rows included ---------- */
/* OLD SHAPES ARE FILLED HERE ONLY UNTIL `migrateOldRows_` HAS WRITTEN THEM (`reportTidy_`). */
function reportRow_(r) {
  const x = oldRowsTidied_() ? r : Object.assign({}, r, reportTidy_(r));
  return { kind: norm(x.kind), item_id: S(x.item_id), status: norm(x.status) };
}
/* WHAT IS MARKED (494): every item with an open note for Claude, as `kind|id` — sent to everybody as `reportedItems`, no names in it. */
function reportedItems_() {
  const out = [];
  claudeNotesOpen_().forEach(n => { if (/\|/.test(n.itemId) && out.indexOf(n.itemId) === -1) out.push(n.itemId); });
  return out;
}
/* A FLAG (owner, 16 Nov: "no more typing… they click the flag and it toggles on"): a row in `claude_notes` whose note is FLAG_NOTE.
   A person's own flags still waiting, as `kind|id`, are what their flag tiles show on. */
const FLAG_NOTE = 'Flagged';
const flagRow_ = r => S(r.note).split('\n')[0] === FLAG_NOTE && (!norm(r.status) || norm(r.status) === 'open' || norm(r.status) === 'pending');
function myFlags_(pid) {
  const t = read(TAB.claude_notes);
  if (!t.sheet || !S(pid)) return [];
  const out = [];
  t.rows.forEach(r => { if (S(r.made_by) === S(pid) && flagRow_(r) && out.indexOf(S(r.item_id)) === -1) out.push(S(r.item_id)); });
  return out;
}
/* ---------- SUGGEST A CHANGE (494): one row in `claude_notes` — an admin's `open` at once, anybody else's `pending` until an admin confirms ---------- */
function suggestRow_(t, me, kind, item, label, note, status, at) {
  const row = { note_id: 'N-' + Date.now() + '-' + Math.floor(Math.random() * 100000), made_at: at || new Date(), made_by: S(me),
                column: S(kind).slice(0, 40), item_id: (S(kind) + '|' + S(item)).slice(0, 120), item_label: S(label).slice(0, 200),
                note: S(note).slice(0, CLAUDE_NOTE_MAX + 600), status: status, done_at: '' };
  addRow(t, row);
  return row;
}
/* THE SUGGESTIONS WAITING FOR THE ADMIN, newest first, each with the handle and rank of who sent it. */
function claudeNotesPending_() {
  const t = read(TAB.claude_notes);
  if (!t.sheet) return [];
  const at = v => v instanceof Date ? v.getTime() : (Date.parse(S(v)) || 0);
  return t.rows.filter(r => S(r.note_id) && norm(r.status) === 'pending').map(r => {
    const p = findPerson('', S(r.made_by)), item = S(r.item_id), kind = S(r.column) || item.split('|')[0];
    const o = { id: S(r.note_id), at: at(r.made_at), kind: kind, itemId: item.slice(kind.length + 1), label: S(r.item_label), note: S(r.note),
                handle: p ? S(p.handle) : '', rank: p ? rankOf(p) : '' };
    return o;
  }).sort((a, b) => b.at - a.at);
}
/* THE OLD REPORTS, READ ONCE (494): every row not closed becomes a note for Claude, as its reporter on its own date, and is marked `migrated`; the tab is history after. */
function reportsMigrate_() {
  const tr = read(TAB.reports), tn = read(TAB.claude_notes);
  if (!tr.sheet) return 'no reports tab';
  if (!tn.sheet) throw new Error('no claude_notes tab yet');
  let moved = 0;
  tr.rows.forEach(r => {
    const x = reportRow_(r);
    if (x.status !== 'open' && x.status !== 'confirmed') return;
    const note = '[old report] ' + S(r.reason) + (S(r.note) ? ' — ' + S(r.note) : '');
    suggestRow_(tn, S(r.person_id), x.kind, x.item_id, S(r.label), note, 'open', r.at instanceof Date ? r.at : (sheetDate(r.at) || new Date()));
    setCells(tr, r, { status: 'migrated', status_at: new Date() });
    moved++;
  });
  clearCache();
  try { claudeNotesWrite_(claudeNotesOpen_()); } catch (err) { /* the notes sheet is optional; the edit itself already landed */ }
  return moved + ' old ' + plural_(moved, 'report') + ' moved to Notes for Claude';
}

/* A CHILD UPLOADS NO PICTURE (413): rank Student, refused at every door that would keep one. */
const CHILD_NO_UPLOAD = 'Pictures are put up by a grown-up — ask your parent or tutor. Nothing was sent.';

function postsWaitingFor_(t, me) {
  const id = S(me && me.person_id);
  if (!id) return 0;
  return ((t && t.rows) || []).filter(r => postState_(r) === 'pending' && ON_(r.active) && postIsBy_(r, me)).length;
}

/* ---------- WHERE PROFILE PICTURES GO § */
function getPhotoFolder_() {
  const cfg = config();
  let id = S(cfg.photos_folder || cfg.PHOTOS_FOLDER || cfg.photosFolder);
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* a wrong id falls back, below */ }
  }
  return getPostFolder();
}

/* ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE § */

/* ---------- GALLERY ------------------------------------------------------------------------- */

/** A bare folder id, or the id pulled out of a full Drive URL. */
function folderIdFrom(raw) {
  const s = S(raw);
  if (!s) return '';
  const m = s.match(/folders\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : s;
}

/* ---------- NOTES FOR CLAUDE (484): every open row of `claude_notes`, newest first, and the plain-text file a session reads ---------- */
function claudeNotesOpen_() {
  const t = read(TAB.claude_notes);
  if (!t.sheet) return [];
  const at = v => v instanceof Date ? v.getTime() : (Date.parse(S(v)) || 0);
  /* OPEN IS BLANK OR `open`: not done, dismissed or still waiting for the admin (`pending`, 494). */
  return t.rows.filter(r => S(r.note_id) && (!norm(r.status) || norm(r.status) === 'open'))
    .map((r, i) => ({ id: S(r.note_id), at: at(r.made_at), by: S(r.made_by), column: S(r.column), itemId: S(r.item_id),
                      itemLabel: S(r.item_label), note: S(r.note), _i: i }))
    .sort((a, b) => (b.at - a.at) || (b._i - a._i)).map(r => { delete r._i; return r; });
}
/* THE WORDS OF THE FILE: one block per open note, so a session reads them all at once. */
function claudeNotesText_(notes) {
  const day = ms => ms ? todayIso_(ms) : '';
  const head = CLAUDE_NOTES_FILE + ' — the open notes from the site\'s Suggest a change tiles (Ledger tab claude_notes). Rewritten on every add and done.\n\n';
  if (!notes.length) return head + 'No open notes.\n';
  return head + notes.map(n => '[' + n.id + '] ' + (n.column || '?') + ' › ' + (n.itemLabel || n.itemId) + ' (' + n.itemId + ') — ' + day(n.at) + '\n' + n.note).join('\n\n') + '\n';
}
/* ONE FILE, BY EXACT TITLE, in the library imports folder a session already reaches (407); made if missing, else its words replaced. */
function claudeNotesWrite_(notes) {
  const folder = libDriveFolder_(), text = claudeNotesText_(notes || claudeNotesOpen_());
  const f = libDriveFind_(folder.getFilesByName(CLAUDE_NOTES_FILE));
  if (f) { f.setContent(text); return f.getId(); }
  return folder.createFile(CLAUDE_NOTES_FILE, text, MimeType.PLAIN_TEXT).getId();
}
/* ---------- FILES FOR CLAUDE (515): an admin's files and folders, private, in Drive "Claude inbox" beside Notes for Claude; incorporated only when the owner asks ---------- */
const CLAUDE_INBOX = 'Claude inbox';
/* ONE REQUEST'S PART, as base64 characters (8 MiB of file), and the largest file; Drive's resumable upload joins the parts, so no blob is ever whole here. */
const INBOX_PART_MAX = 11300000;
const INBOX_FILE_MAX = 500 * 1048576;
const inboxName_ = v => S(v).replace(/[\u0000-\u001f\\:*?"<>|]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 120);
function inboxRoot_() {
  const lib = libDriveFolder_();
  return libDriveFind_(lib.getFoldersByName(CLAUDE_INBOX)) || lib.createFolder(CLAUDE_INBOX);
}
/* A FOLDER BY ITS PATH under the inbox, each step made if missing; `.` and `..` are dropped so a path cannot climb out. */
function inboxFolderAt_(parts, make) {
  let f = inboxRoot_();
  for (let i = 0; i < parts.length; i++) {
    const n = inboxName_(parts[i]);
    if (!n || n === '.' || n === '..') continue;
    const it = f.getFoldersByName(n);
    if (it.hasNext()) f = it.next();
    else if (make) f = f.createFolder(n);
    else return null;
  }
  return f;
}
/* ONE PART OF ONE FILE. `start` 0 opens a Drive resumable session (kept six hours in the cache); the last part closes it and the file exists. */
function inboxPart_(b) {
  const batch = inboxName_(b.batch);
  const rel = S(b.rel).split('/').map(inboxName_).filter(x => x && x !== '.' && x !== '..');
  if (!batch || !rel.length) throw new Error('Which file? Nothing was sent.');
  const name = rel.pop();
  const size = Math.floor(Number(b.size)), start = Math.floor(Number(b.start)) || 0;
  if (!(size > 0) || size > INBOX_FILE_MAX) throw new Error(name + ' is larger than ' + Math.round(INBOX_FILE_MAX / 1048576) + ' MB.');
  const data = S(b.data);
  if (!data || data.length > INBOX_PART_MAX) throw new Error('That part was too large.');
  const bytes = Utilities.base64Decode(data);
  if (start < 0 || start + bytes.length > size) throw new Error('That part does not fit the file.');
  const mime = /^[\w.+-]+\/[\w.+-]+$/.test(S(b.mime)) ? S(b.mime) : 'application/octet-stream';
  const cache = CacheService.getScriptCache();
  const key = 'inbox:' + Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, batch + '|' + S(b.rel) + '|' + S(b.upload))).slice(0, 40);
  const auth = { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() };
  let url = start ? cache.get(key) : '';
  if (!start) {
    const folder = inboxFolderAt_([batch].concat(rel), true);
    const res = UrlFetchApp.fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id', {
      method: 'post', contentType: 'application/json; charset=UTF-8', muteHttpExceptions: true,
      headers: Object.assign({ 'X-Upload-Content-Type': mime, 'X-Upload-Content-Length': String(size) }, auth),
      payload: JSON.stringify({ name: name, parents: [folder.getId()], mimeType: mime }) });
    const h = res.getHeaders();
    url = h.Location || h.location || '';
    if (res.getResponseCode() !== 200 || !url) throw new Error('Drive would not start the upload (' + res.getResponseCode() + ').');
    cache.put(key, url, 21600);
  }
  if (!url) throw new Error('The upload was lost — send that file again.');
  const end = start + bytes.length - 1;
  const put = UrlFetchApp.fetch(url, { method: 'put', contentType: mime, muteHttpExceptions: true, payload: bytes,
    headers: Object.assign({ 'Content-Range': 'bytes ' + start + '-' + end + '/' + size }, auth) });
  const code = put.getResponseCode();
  if (code === 308) return { success: true, next: end + 1 };
  if (code === 200 || code === 201) { cache.remove(key); return { success: true, done: true, id: S((JSON.parse(put.getContentText()) || {}).id) }; }
  throw new Error('Drive refused that part (' + code + ').');
}
/* THE ADDRESSED IDS (498): data/notes-done.json from the site, then GitHub; null when neither answers, so nothing is guessed. */
function claudeNotesDoneIds_() {
  return fetchSiteThenRaw_(CLAUDE_NOTES_DONE_FILE, text => {
    const ids = JSON.parse(text);
    return Array.isArray(ids) ? ids.map(S).filter(Boolean) : null;
  }).got;
}
/* MARKED DONE ON AN ADMIN'S OPEN (498): each listed id still open becomes done, and the Drive file is rewritten once. Twice does what once did. */
function claudeNotesDoneSync_(ids) {
  ids = ids || claudeNotesDoneIds_();
  if (!ids || !ids.length) return 0;
  const t = read(TAB.claude_notes);
  if (!t.sheet) return 0;
  const want = {};
  ids.forEach(id => { want[id] = 1; });
  let n = 0;
  t.rows.forEach(r => {
    if (!want[S(r.note_id)] || norm(r.status) === 'done' || norm(r.status) === 'dismissed') return;
    setCells(t, r, { status: 'done', done_at: new Date() });
    n++;
  });
  if (n) { clearCache(); try { claudeNotesWrite_(); } catch (err) { Logger.log('notes file: ' + err); } }
  return n;
}
/* ONE DAY'S DONE UNDONE (498): the owner ticked an old note by mistake; any done that day and not addressed by a session is open again. */
function claudeNotesReopen_(day) {
  const ids = claudeNotesDoneIds_();
  if (ids === null) throw new Error('data/notes-done.json could not be read; trying again later');
  const t = read(TAB.claude_notes);
  if (!t.sheet) return 'no claude_notes tab';
  const addressed = {};
  ids.forEach(id => { addressed[id] = 1; });
  let n = 0;
  t.rows.forEach(r => {
    if (norm(r.status) !== 'done' || addressed[S(r.note_id)]) return;
    const v = r.done_at, d = v instanceof Date ? todayIso_(v) : S(v).slice(0, 10);
    if (d !== day) return;
    setCells(t, r, { status: 'open', done_at: '' });
    n++;
  });
  if (n) { clearCache(); try { claudeNotesWrite_(); } catch (err) { Logger.log('notes file: ' + err); } }
  return n + ' ' + plural_(n, 'note') + ' open again';
}
