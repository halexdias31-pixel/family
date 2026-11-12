/* @family. — library-drive.gs THE LIBRARY IMPORT FROM DRIVE: lib-import files and zips found, parsed, applied and logged */

/* EVERY lib-import FILE AND ZIP in the folder and its subfolders, any depth, but never `imported`; this account's own, as {f, parent, name, top}. */
function libDriveWalk_(folder) {
  const out = { json: [], zip: [], capped: '' }, queue = [folder];
  let folders = 0, files = 0;
  while (queue.length && !out.capped) {
    const d = queue.shift();
    if (++folders > LIB_DRIVE_WALK_FOLDERS) { out.capped = 'more than ' + LIB_DRIVE_WALK_FOLDERS + ' folders'; break; }
    const it = d.getFiles();
    while (it.hasNext()) {
      if (++files > LIB_DRIVE_WALK_FILES) { out.capped = 'more than ' + LIB_DRIVE_WALK_FILES + ' files'; break; }
      const f = it.next(), name = S(f.getName());
      const kind = LIB_DRIVE_NAME.test(name) ? 'json' : LIB_DRIVE_ZIP.test(name) ? 'zip' : '';
      if (kind && libDriveMine_(f)) out[kind].push({ f: f, parent: d, name: name, top: d === folder });
    }
    const sub = typeof d.getFolders === 'function' ? d.getFolders() : null;
    while (sub && sub.hasNext()) { const x = sub.next(); if (S(x.getName()) !== LIB_DRIVE_DONE && libDriveMine_(x)) queue.push(x); }
  }
  if (out.capped) Logger.log('library import: the walk stopped at ' + out.capped + '; the rest waits for a later run');
  return out;
}
/* THE NAMES ALREADY IN A FOLDER (`imported`), so a subfolder's copy of a done file is not imported twice. */
function libDriveNames_(d) {
  const have = {};
  if (!d) return have;
  const it = d.getFiles();
  while (it.hasNext()) have[S(it.next().getName())] = 1;
  return have;
}
/* WHAT WAITS, ONE OF EACH NAME, oldest name first: the folder's own before a subfolder's, and a subfolder's file already in `imported` is left where it is. */
function libDrivePick_(entries, done) {
  const seen = {}, list = [];
  let skipped = 0;
  entries.slice().sort((a, b) => (b.top - a.top)).forEach(e => {
    if (seen[e.name] || (!e.top && done[e.name])) { skipped++; return; }
    seen[e.name] = 1;
    list.push(e);
  });
  list.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { list: list, skipped: skipped };
}
/* THE FILES AND ZIPS WAITING, the walk picked; `have` is every lib-import name already in Drive, for the unzip to skip. */
function libDriveWaiting_(folder, done) {
  const w = libDriveWalk_(folder), names = libDriveNames_(done);
  const zips = libDrivePick_(w.zip, names), files = libDrivePick_(w.json, names);
  const have = Object.assign({}, names);
  w.json.forEach(e => { have[e.name] = 1; });
  return { zips: zips.list, files: files.list, skipped: zips.skipped + files.skipped, capped: w.capped, have: have };
}
/* A ZIP'S lib-import-*.json FILES as {name, text}: only the name after the last slash, nothing else in it read, nothing run. {error} when too big or too many. */
function libDriveZipRead_(z) {
  const size = Number(z.getSize && z.getSize()) || 0, mb = n => (n / 1048576).toFixed(1) + ' MB';
  if (size > LIB_DRIVE_ZIP_BYTES) return { error: 'it is ' + mb(size) + ' — a zip may be at most ' + mb(LIB_DRIVE_ZIP_BYTES) + ' (Apps Script cannot unpack more); split it' };
  const blob = z.getBlob();
  try { if (typeof blob.setContentType === 'function') blob.setContentType('application/zip'); } catch (err) {}
  let inner;
  try { inner = Utilities.unzip(blob) || []; } catch (err) { return { error: 'it could not be unzipped — ' + S(err && err.message || err).slice(0, 120) }; }
  if (inner.length > LIB_DRIVE_ZIP_FILES) return { error: 'it holds ' + inner.length + ' files — at most ' + LIB_DRIVE_ZIP_FILES + ' a zip' };
  const parts = [];
  let total = 0;
  for (let i = 0; i < inner.length; i++) {
    const name = S(inner[i].getName()).split(/[\\/]/).pop();
    if (!LIB_DRIVE_NAME.test(name)) continue;
    const text = String(inner[i].getDataAsString('UTF-8'));
    total += text.length;
    if (total > LIB_DRIVE_ZIP_BYTES) return { error: 'its files come to more than ' + mb(LIB_DRIVE_ZIP_BYTES) + ' unpacked; split it' };
    parts.push({ name: name, text: text });
  }
  return { parts: parts };
}
/* EVERY WAITING ZIP UNPACKED into the folder: a name already in Drive (`have`) is skipped, the zip then moves to `imported`. A refused zip stays, said in the log. */
function libDriveUnzip_(folder, done, zips, have) {
  return zips.map(e => {
    const z = e.f, name = e.name;
    try {
      const r = libDriveZipRead_(z);
      if (r.error) { Logger.log('library import: ' + name + ' refused — ' + r.error); return { name: name, error: r.error }; }
      let made = 0, skipped = 0;
      r.parts.forEach(p => {
        if (have[p.name]) { skipped++; return; }
        folder.createFile(p.name, p.text, 'application/json');
        have[p.name] = 1;
        made++;
      });
      libDriveMove_(z, e.parent, done);
      return { name: name, unzipped: made, skipped: skipped };
    } catch (err) {
      const why = S(err && err.message || err).slice(0, 160);
      Logger.log('library import: ' + name + ' failed — ' + why);
      return { name: name, error: why };
    }
  });
}
/* A FILE'S TEXT. Drive may have made a Google Doc of an upload; that is exported as plain text rather than refused. */
function libDriveText_(f) {
  const mime = S(f.getMimeType && f.getMimeType());
  if (mime === 'application/vnd.google-apps.document') {
    const res = UrlFetchApp.fetch('https://www.googleapis.com/drive/v3/files/' + encodeURIComponent(f.getId()) + '/export?mimeType=text%2Fplain',
      { headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() }, muteHttpExceptions: true });
    if (res.getResponseCode() !== 200) throw new Error('Drive would not export it as text (' + res.getResponseCode() + ')');
    return String(res.getContentText('UTF-8')).replace(/^﻿/, '');
  }
  return String(f.getBlob().getDataAsString('UTF-8')).replace(/^﻿/, '');
}
function libDriveMove_(f, folder, to) {
  if (typeof f.moveTo === 'function') { f.moveTo(to); return; }
  to.addFile(f); folder.removeFile(f);
}

/* WHAT THE CARD ASKS: how many files wait, and what the last press did. Admin only, at the gate. */
function libImportList_() {
  let folder;
  try { folder = libDriveFolder_(); } catch (err) { return { error: 'Drive could not be read — ' + S(err && err.message || err).slice(0, 160) + '. Run authoriseDrive once from the Apps Script editor.' }; }
  const wait = libDriveWaiting_(folder, libDriveFind_(folder.getFoldersByName(LIB_DRIVE_DONE)));
  const where = e => e.top ? {} : { folder: S(e.parent.getName()) };
  /* A ZIP IS ONE LINE: how many lib-import files it holds, or why it will be refused. */
  const zips = wait.zips.map(e => {
    const z = e.f;
    let r;
    try { r = libDriveZipRead_(z); } catch (err) { r = { error: S(err && err.message || err).slice(0, 160) }; }
    const n = r.error ? 0 : r.parts.length;
    return Object.assign({ name: e.name, size: Number(z.getSize && z.getSize()) || 0, zip: true, files: n,
             said: r.error ? 'zip refused — ' + r.error : 'zip waiting (' + n + (n === 1 ? ' file)' : ' files)'), error: r.error || undefined }, where(e));
  });
  const pending = zips.concat(wait.files.map(e => Object.assign({ name: e.name, size: Number(e.f.getSize && e.f.getSize()) || 0 }, where(e))));
  let last = null, auto = null;
  try { last = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_DRIVE_LAST) || 'null'); } catch (err) { last = null; }
  try { auto = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_DRIVE_AUTO) || 'null'); } catch (err) { auto = null; }
  return { success: true, folder: LIB_DRIVE_FOLDER, pending: pending, last: last, auto: auto, skipped: wait.skipped, capped: wait.capped || undefined };
}

/* THE PUBLIC CARDS' IDS FOR A FILE, from the site (or GitHub) — asked only for an id the tab has no row for. */
function libPublicIds_(def, memo) {
  if (memo[def.file]) return memo[def.file];
  const urls = [S(SITE_URL).replace(/\/*$/, '/') + def.file];
  try { urls.push(RAW + def.file); } catch (err) { /* sync.gs is not in this scope */ }
  let got = null;
  for (let i = 0; i < urls.length && !got; i++) {
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) continue;
      const rows = JSON.parse(String(res.getContentText('UTF-8')));
      if (!Array.isArray(rows)) continue;
      got = {};
      rows.forEach(r => { const id = libIdOf_(def, r); if (id) got[id] = 1; });
    } catch (err) { got = null; }
  }
  memo[def.file] = got || {};
  return memo[def.file];
}

/* ONE FILE'S WORDS, CHECKED BEFORE A CELL IS TOUCHED: its shape, every field private, every value text, a number or null. */
function libDriveParse_(text) {
  let d;
  try { d = JSON.parse(text); } catch (err) { return { error: 'it is not whole JSON' }; }
  if (!d || typeof d !== 'object' || Number(d.version) !== 1) return { error: 'it is not version 1 (`{version: 1, files: {...}}`)' };
  if (!d.files || typeof d.files !== 'object' || Array.isArray(d.files)) return { error: 'it has no `files` object' };
  const plan = {};
  let n = 0;
  const keys = Object.keys(d.files);
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k], def = LIB_FILES[key], list = d.files[key];
    if (!def) return { error: '`' + key + '` is not a library file — one of ' + Object.keys(LIB_FILES).join(', ') };
    if (!Array.isArray(list)) return { error: '`files.' + key + '` is not a list' };
    const seen = {};
    plan[key] = [];
    for (let i = 0; i < list.length; i++) {
      const one = list[i];
      if (!one || typeof one !== 'object' || Array.isArray(one)) return { error: key + ' item ' + (i + 1) + ' is not an object' };
      const id = S(one.id);
      if (!id || id.length > 160) return { error: key + ' item ' + (i + 1) + ' has no id' };
      if (seen[id]) return { error: key + ' has ' + id + ' twice' };
      seen[id] = 1;
      const fields = Object.keys(one).filter(f => f !== 'id');
      const odd = fields.filter(f => def.private.indexOf(f) === -1 || (one[f] !== null && typeof one[f] === 'object') || typeof one[f] === 'boolean');
      if (odd.length) return { error: id + ' carries ' + odd.join(', ') + ' — not a private field of ' + def.file + ', or not text' };
      const set = {};
      fields.forEach(f => { set[f] = one[f]; });
      plan[key].push({ id: id, set: set });
      n++;
    }
  }
  if (!n) return { error: 'it has no items' };
  if (n > LIB_DRIVE_MAX) return { error: 'it has ' + n + ' items — at most ' + LIB_DRIVE_MAX + ' a file' };
  /* NEW PUBLIC CARDS STILL COME BY GIT; `cards` only vouches that an id the site has not got yet is meant. */
  const cards = {};
  const c = d.cards && typeof d.cards === 'object' ? d.cards : {};
  Object.keys(c).forEach(key => {
    const def = LIB_FILES[key];
    if (!def || !Array.isArray(c[key])) return;
    cards[key] = {};
    c[key].forEach(r => { const id = (r && libIdOf_(def, r)) || S(r && r.id); if (id) cards[key][id] = 1; });
  });
  return { plan: plan, cards: cards, n: n, note: S(d.note).slice(0, 300) };
}

/* ONE FILE INTO THE LEDGER: merge per id, write, read every row back; any row that does not read back puts every row of the file back as it was. */
function libDriveApply_(parsed, memo) {
  const counts = {}, writes = [], flagged = [];
  const keys = Object.keys(parsed.plan);
  /* PLAN EVERYTHING FIRST, so a refusal leaves the Ledger untouched. */
  for (let k = 0; k < keys.length; k++) {
    const key = keys[k], def = LIB_FILES[key];
    const sh = libSheet_(def, 0);
    const at = libIndex_(def, sh, '', null);
    let foot = Math.max(1, sh.getLastRow());
    const c = counts[key] = { added: 0, replaced: 0, same: 0, deleted: 0 };
    for (let i = 0; i < parsed.plan[key].length; i++) {
      const one = parsed.plan[key][i];
      let row = at[one.id], prevCells = null, prev = {};
      if (row) {
        prevCells = sh.getRange(row, 1, 1, 3 + LIB_PARTS).getValues()[0];
        const have = libRowIn_(prevCells);
        try { prev = JSON.parse(have.json) || {}; } catch (err) { return { error: key + ' ' + one.id + ': the row in ' + def.tab + ' is not readable JSON — nothing was written' }; }
      } else if (!(parsed.cards[key] && parsed.cards[key][one.id]) && !libPublicIds_(def, memo)[one.id]) {
        return { error: one.id + ' is not a card in ' + def.file + ' (nor in this file\'s `cards`) — nothing was written' };
      }
      const next = {};
      def.private.forEach(f => {
        if (Object.prototype.hasOwnProperty.call(one.set, f)) { if (one.set[f] === null) { if (f in prev) c.deleted++; } else next[f] = one.set[f]; }
        else if (Object.prototype.hasOwnProperty.call(prev, f)) next[f] = prev[f];
      });
      const json = JSON.stringify(next);
      try { libCells_(json); } catch (err) { return { error: one.id + ': ' + err.message + ' — nothing was written' }; }
      const self = libSelfTest_(key, next);
      if (self && self.refuse) return { error: one.id + ': ' + self.refuse + ' — nothing was written' };
      if (self && self.flag) flagged.push(one.id + ': ' + self.flag);
      if (row && libRowIn_(prevCells).json === json) { c.same++; continue; }
      if (row) c.replaced++;
      else { foot++; row = foot; at[one.id] = row; c.added++; }
      writes.push({ key: key, sh: sh, row: row, prevCells: prevCells, item: { id: one.id, json: json, sum: libSum_(json) } });
    }
  }
  /* WRITE, THEN READ BACK — the copy's own check (libCopy_): the id, the stored checksum, the checksum of what the cells hold. */
  let bad = '';
  try {
    writes.forEach(w => { libSheet_(LIB_FILES[w.key], w.row); w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).setValues([libRowOut_(w.item)]); });
    try { SpreadsheetApp.flush(); } catch (err) {}
    for (let i = 0; i < writes.length && !bad; i++) {
      const w = writes[i], have = libRowIn_(w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).getValues()[0]);
      if (have.id !== w.item.id) bad = 'row ' + w.row + ' of ' + LIB_FILES[w.key].tab + ' is ' + have.id + ', not ' + w.item.id;
      else if (have.sum !== w.item.sum) bad = w.item.id + ' has the wrong checksum';
      else if (libSum_(have.json) !== w.item.sum) bad = w.item.id + ' does not read back as it was written';
    }
  } catch (err) { bad = 'writing failed (' + S(err && err.message || err).slice(0, 160) + ')'; }
  if (bad) {
    const blank = new Array(3 + LIB_PARTS).fill('');
    let restored = true;
    writes.forEach(w => {
      try { w.sh.getRange(w.row, 1, 1, 3 + LIB_PARTS).setValues([w.prevCells || blank]); } catch (err) { restored = false; }
    });
    return { error: bad + (restored ? ' — every row of this file was put back as it was' : ' — AND PUTTING THE ROWS BACK FAILED: check the lib_ tabs') };
  }
  return { counts: counts, written: writes.length, flagged: flagged };
}

/* THE PRESS (and `?run=libImportDrive`): every waiting file, oldest first, each whole or not at all; a done file moves to `imported`. */
/* `auto` (the hourly run, 443): the same press, but it makes no folder, and an empty folder or a busy lock leaves no trace. */
function libImportDrive_(by, auto) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(auto ? 5000 : 30000)) return { error: 'Busy — another import or write is running. Try again in a moment.', why: 'busy' };
  const wroteBefore = POST_WROTE;
  const t0 = Date.now();
  const report = { success: true, at: new Date().toISOString(), files: [], imported: 0, failed: 0, left: 0 };
  if (auto) report.auto = true;
  try {
    let folder, done, files;
    try {
      folder = auto ? libDriveFind_(DriveApp.getFoldersByName(LIB_DRIVE_FOLDER)) : libDriveFolder_();
      /* ZIPS FIRST, so the files they hold are imported by this same run; then the walk again, for the files they made. */
      let wait = folder ? libDriveWaiting_(folder, libDriveFind_(folder.getFoldersByName(LIB_DRIVE_DONE))) : null;
      if (wait && wait.zips.length) {
        done = libDriveDone_(folder);
        report.zips = libDriveUnzip_(folder, done, wait.zips, wait.have);
        wait = libDriveWaiting_(folder, done);
      }
      files = wait ? wait.files : [];
      if (wait && wait.skipped) report.skipped = wait.skipped;
      if (wait && wait.capped) report.capped = wait.capped;
      const unzipped = (report.zips || []).some(z => !z.error);
      if (auto && !files.length && !unzipped) return { success: true, auto: true, at: report.at, files: [], imported: 0, failed: 0, left: 0, nothing: true, zips: report.zips };
      done = done || libDriveDone_(folder);
    }
    catch (err) { return { error: 'Drive could not be read — ' + S(err && err.message || err).slice(0, 160) + '. Run authoriseDrive once from the Apps Script editor.' }; }
    const memo = {};
    let any = false;
    for (let i = 0; i < files.length; i++) {
      const f = files[i].f, name = files[i].name;
      if (Date.now() - t0 > LIB_DRIVE_MS) { report.left = files.length - i; break; }
      let one;
      try {
        const parsed = libDriveParse_(libDriveText_(f));
        one = parsed.error ? { error: parsed.error + ' — nothing was written' } : libDriveApply_(parsed, memo);
        if (!one.error) one.note = parsed.note;
      } catch (err) { one = { error: S(err && err.message || err).slice(0, 200) }; }
      if (one.error) { report.failed++; report.files.push({ name: name, error: one.error }); continue; }
      if (one.written) any = true;
      let moved = true;
      try { libDriveMove_(f, files[i].parent, done); } catch (err) { moved = false; }
      report.imported++;
      report.files.push({ name: name, counts: one.counts, written: one.written, note: one.note, moved: moved, flagged: (one.flagged || []).slice(0, 40) });
      libDriveLog_(by, name, one);
    }
    /* EVERY CACHED ITEM AND INDEX IS KEYED BY THE GENERATION: a new one and nobody is served the old words. */
    if (any) libGenBump_();
    if (report.failed) report.success = report.imported > 0;
    if (report.failed && !report.imported) report.error = report.files.filter(x => x.error).map(x => x.name + ': ' + x.error).join('; ');
    try { PropertiesService.getScriptProperties().setProperty(LIB_DRIVE_LAST, JSON.stringify(report).slice(0, 8000)); } catch (err) {}
    if (auto) try { PropertiesService.getScriptProperties().setProperty(LIB_DRIVE_AUTO, JSON.stringify(report).slice(0, 8000)); } catch (err) {}
    return report;
  } finally {
    lock.releaseLock();
    /* NO PAYLOAD CARRIES THE LIBRARY'S WORDS OR THE LOG, so the stored payload stands. */
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}
/* THE HOURLY TRIGGER'S HANDLER (443): no person, so the log's handle says `hourly`. Public — a trigger cannot call a name ending _. */
function libImportHourly() {
  const res = libImportDrive_({ handle: 'hourly' }, true);
  if (res && res.error && res.why !== 'busy') Logger.log('libImportHourly: ' + res.error);
  return res;
}
/* KEPT BOOKED BY THE ADMIN-LOAD SETUP (361): exactly one hourly trigger; null when it already is. */
function libImportKeepBooked_() {
  const mine = ScriptApp.getProjectTriggers().filter(t => t.getHandlerFunction() === LIB_DRIVE_HOURLY);
  if (mine.length === 1) return null;
  mine.forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger(LIB_DRIVE_HOURLY).timeBased().everyHours(1).create();
  return { installed: LIB_DRIVE_HOURLY, removed: mine.length };
}
/* A LINE IN `lib_log` PER FILE IMPORTED — `person_id` is `library-import`, never a person, so the day's cap never reads it as anybody's tally. */
function libDriveLog_(by, name, one) {
  try {
    const t = read(TAB.libLog);
    if (!t.sheet) return;
    const said = Object.keys(one.counts).map(k => { const c = one.counts[k]; return k + ' +' + c.added + ' ~' + c.replaced + ' =' + c.same + (c.deleted ? ' -' + c.deleted + ' field(s)' : ''); }).join('; ');
    addRow(t, { day: reportDay_(new Date()), person_id: 'library-import', handle: S(by && by.handle), served: one.written,
                ids: (name + ': ' + said + (one.note ? ' — ' + one.note : '')).slice(0, 2000), refused: 0, last_at: new Date() });
  } catch (err) { /* the log costs a line, never the import */ }
}
