/* @family. — media.gs REELS, VIDEOS AND CONSOLE SAVES an admin or a player sends from the phone */

/* ---------- REELS AND VIDEOS AN ADMIN ADDS FROM THE PHONE (404) ---------- */
const MEDIA_KINDS = ['reel', 'video'];
const MEDIA_YT_RE = /^[A-Za-z0-9_-]{11}$/;
/* A REEL UPLOADED AS A FILE (474): "add a reel should also give me option to upload a file instead" — `f` and the upload's milliseconds. */
const MEDIA_FILE_RE = /^f\d{10,16}$/;
const mediaIdOk_ = id => MEDIA_YT_RE.test(id) || MEDIA_FILE_RE.test(id);
const MEDIA_CAP = { title: 200, channel: 120, subject: 60, tags: 300, vkind: 20, age: 20, notes: 500, url: 300, thumb: 300 };

/* ---------- HOW OLD YOU HAVE TO BE TO WATCH IT (406) ----------
   A minimum age in whole years; blank, 0, U, PG or words = everyone. The cell may say "12+" — the number is what counts. */
const MEDIA_AGE_MAX = 21;
/* AN AGE NOBODY KNOWS IS UNDERAGE (450): signed out or no date of birth sees only what has no minimum age. */
const MEDIA_AGE_UNKNOWN = 0;
function mediaAgeOf_(v) {
  const m = S(v).match(/\d+/);
  return m ? Math.min(MEDIA_AGE_MAX, Number(m[0])) : 0;
}
/* WHOLE YEARS SINCE A PERSON'S DATE OF BIRTH (or an `age` cell), or null when the row says neither. */
function personAge_(r) {
  if (!r) return null;
  const d = dobOut(r.date_of_birth), y = Number(d.dob_y), mo = Number(d.dob_m) || 1, dd = Number(d.dob_d) || 1;
  if (y > 1900) {
    const now = new Date();
    return now.getFullYear() - y - ((now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < dd)) ? 1 : 0);
  }
  const a = S(r.age).match(/^\s*(\d{1,3})\s*$/);
  return a ? Number(a[1]) : null;
}
/* THE OLDEST RATING THIS VIEWER MAY SEE: an admin everything; a known age that age; no date of birth, whatever the rank, underage (450). */
function mediaAgeCap_(r) {
  if (r && hasRole(r, 'admin')) return Infinity;
  const age = personAge_(r);
  return age !== null ? age : MEDIA_AGE_UNKNOWN;
}
/* A ROW TOO OLD FOR THIS VIEWER STILL HIDES A REPOSITORY COPY of the same video, by this hash rather than the id
   (the id alone is the video). FNV-1a of `kind:id`; `mediaVeil_` in games.js is the same sum. */
function mediaVeil_(kind, id) {
  let h = 0x811c9dc5;
  const s = kind + ':' + id;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* THE ID A PASTED LINK NAMES — watch, shorts, embed, live, youtu.be — or '' for anything else. */
function mediaYtId_(url) {
  const m = S(url).match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i);
  return m ? m[1] : '';
}

function mediaRowOf_(t, kind, id) {
  return t.rows.find(function (r) { return S(r.kind) === kind && S(r.yt_id) === id; }) || null;
}

/* ONE WRITER FOR ALL THREE ACTIONS, under the script lock with the rows read fresh. Returns the reply object. */
function mediaWrite_(action, body) {
  const kind = S(body.kind);
  if (MEDIA_KINDS.indexOf(kind) === -1) return { error: 'Is it a reel or a video? Nothing was saved.' };
  /* AN EDIT OF AN UPLOADED REEL NAMES ITS ID; a new upload makes one, after the file is in Drive. */
  const fileId = MEDIA_FILE_RE.test(S(body.id)) ? S(body.id) : '';
  let id = action === 'mediaUpload' ? 'f' + new Date().getTime()
    : action === 'mediaSave' ? (mediaYtId_(body.url) || fileId) : S(body.id);
  if (!mediaIdOk_(id)) return { error: 'That is not a YouTube link. Nothing was saved.' };
  const put = {};
  if (action === 'mediaUpload') {
    if (kind !== 'reel') return { error: 'Only a reel can be uploaded as a file. Nothing was saved.' };
    const data = S(body.data);
    if (!/^data:video\//i.test(data)) return { error: 'That file is not a video. Nothing was saved.' };
    /* THE CAMERA'S LIMIT (`CAM_VID_MAX`, posts.js): twenty megabytes a clip, base64 being a third bigger. */
    if ((data.length - data.indexOf(',') - 1) * 3 / 4 > POST_FILE_MAX) return { error: 'That video is over 20 MB. Nothing was saved.' };
    if (!S(body.title)) return { error: 'It needs a title. Nothing was saved.' };
    const folder = getPostFolder();
    if (!folder) return { error: 'No posts folder. Add a row to the config tab: key `posts_folder`, value the id from the folder URL.' };
    let url = '';
    try { url = driveKeep_(folder, data, 'reel-' + id); }
    catch (err) { return { error: 'Could not save the video. ' + S(err && err.message || err) }; }
    ['title', 'subject'].forEach(function (k) { put[k] = S(body[k]).slice(0, MEDIA_CAP[k]); });
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    put.url = url;
    put.hidden = 'FALSE';
  } else if (action === 'mediaSave') {
    const too = Object.keys(MEDIA_CAP).filter(function (k) { return S(body[k]).length > MEDIA_CAP[k]; });
    if (too.length) return { error: 'Too long: ' + too.join(', ') + '. Nothing was saved.' };
    if (!S(body.title)) return { error: 'It needs a title. Nothing was saved.' };
    const thumb = S(body.thumb);
    if (thumb && !/^https:\/\/i\.ytimg\.com\//.test(thumb)) return { error: 'The picture must be YouTube\'s own. Nothing was saved.' };
    Object.keys(MEDIA_CAP).forEach(function (k) { put[k] = S(body[k]); });
    /* WHOLE YEARS, OR BLANK FOR EVERYONE (406). */
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    if (MEDIA_FILE_RE.test(id)) { delete put.url; delete put.thumb; }
    else put.url = kind === 'reel' ? 'https://youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id;
    put.hidden = 'FALSE';
  } else if (action === 'mediaHide') {
    put.hidden = body.hidden === false ? 'FALSE' : 'TRUE';
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    clearCache();
    const t = read(TAB.media);
    if (!t.sheet) return { error: 'The media tab is not there yet — open the site once as an admin so setup makes it. Nothing was saved.' };
    const r = mediaRowOf_(t, kind, id);
    const by = S(body.personId), now = new Date();
    if (action === 'mediaDelete') {
      if (!r) return { error: 'Nothing to delete — that one came from the repository. Hide it instead.' };
      if (!delRow(t, r)) return { error: 'The media tab could not be changed — nothing was deleted.' };
    } else if (r) {
      put.updated_on = now;
      setCells(t, r, put);
    } else {
      if (action === 'mediaHide' && put.hidden === 'FALSE') return { error: 'Nothing to show again.' };
      if (action === 'mediaSave' && MEDIA_FILE_RE.test(id)) return { error: 'That uploaded reel is not there any more. Nothing was saved.' };
      if (!addRow(t, Object.assign({ media_id: kind + ':' + id, kind: kind, yt_id: id, added_by: by, added_on: now, updated_on: now }, put))) {
        return { error: 'The media tab could not be opened — nothing was saved.' };
      }
    }
    try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ }
  } finally {
    lock.releaseLock();
  }
  clearCache();
  return { success: true, kind: kind, id: id, media: mediaOut_(Infinity) };
}

/* ---------- CONSOLE SAVES (446): "when a user plays a game and they're logged in, it will save their progress" — the Console's games too. */
/* One text file per person and game in the script account's own Drive folder, never the sheet. The ROM is never sent: only its hash and the save. */
const CONSOLE_SAVE_PROP = 'CONSOLE_SAVES_FOLDER';
const CONSOLE_SAVE_MAX = 2 * 1024 * 1024;   // packed bytes per game, battery save and state together
const CONSOLE_SAVE_SYS = ['nes', 'snes', 'gb', 'gbc', 'gba', 'n64', 'nds'];
const CONSOLE_SAVE_TOO_BIG = 'This game\'s save is bigger than an account keeps (2 MB), so it stays on this device only.';

function consoleSaveFolder_(make) {
  const props = PropertiesService.getScriptProperties();
  const id = S(props.getProperty(CONSOLE_SAVE_PROP));
  if (id) { try { const f = DriveApp.getFolderById(id); if (f && !(f.isTrashed && f.isTrashed())) return f; } catch (err) { /* a gone or unreachable folder means a new one is made */ } }
  if (!make) return null;
  const f = DriveApp.createFolder('family console saves');
  props.setProperty(CONSOLE_SAVE_PROP, f.getId());
  return f;
}
/* The person's id and the hash, both cut to safe letters, so a name can never point outside its own file. */
const consoleSaveName_ = (pid, hash) => 'cs-' + S(pid).replace(/[^\w-]/g, '') + '-' + hash + '.json';
const consoleSaveHash_ = h => (/^[0-9a-f]{16,64}$/.test(S(h)) ? S(h) : '');
function consoleSaveFile_(folder, name) {
  if (!folder) return null;
  const it = folder.getFilesByName(name);
  return it && it.hasNext() ? it.next() : null;
}

function consoleSave_(pid, body) {
  const hash = consoleSaveHash_(body.hash), sys = S(body.sys);
  if (!pid) return { error: 'Please sign in again.', why: 'signed-out' };
  if (!hash || CONSOLE_SAVE_SYS.indexOf(sys) < 0) return { error: 'That save did not say which game it was for. Nothing was kept.' };
  /* ONLY SAVE DATA: two base64 strings of the phone's packed bytes, nothing that could be a picture or a file of any other kind. */
  const sram = S(body.sram), state = S(body.state);
  if (!sram && !state) return { error: 'There was nothing in that save. Nothing was kept.' };
  if (!/^[A-Za-z0-9+/=]*$/.test(sram) || !/^[A-Za-z0-9+/=]*$/.test(state)) return { error: 'That save was not in the expected shape. Nothing was kept.' };
  if (Math.floor((sram.length + state.length) * 3 / 4) > CONSOLE_SAVE_MAX) return { error: CONSOLE_SAVE_TOO_BIG, why: 'too-big' };
  const at = Math.min(Date.now(), Number(body.at) || Date.now());
  const text = JSON.stringify({ v: 1, hash: hash, sys: sys, at: at, sram: sram, state: state });
  const folder = consoleSaveFolder_(true), name = consoleSaveName_(pid, hash);
  /* THE LATEST ONLY: the one file is overwritten, so an account holds one save per game. */
  const file = consoleSaveFile_(folder, name);
  if (file) file.setContent(text); else folder.createFile(name, text, 'application/json');
  return { success: true, at: at };
}

function consoleLoad_(pid, hash) {
  hash = consoleSaveHash_(hash);
  if (!pid) return { error: 'Please sign in again.', why: 'signed-out' };
  if (!hash) return { success: true, save: null };
  const file = consoleSaveFile_(consoleSaveFolder_(false), consoleSaveName_(pid, hash));
  if (!file) return { success: true, save: null };
  let got = null;
  try { got = JSON.parse(file.getBlob().getDataAsString()); } catch (err) { got = null; }
  if (!got || got.hash !== hash) return { success: true, save: null };
  return { success: true, save: { at: Number(got.at) || 0, sys: S(got.sys), sram: S(got.sram), state: S(got.state) } };
}
