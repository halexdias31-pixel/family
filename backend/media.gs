/* @family. — media.gs REELS AND VIDEOS an admin sends from the phone */

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
  if (r && whoMay_(r, 'admin')) return Infinity;
  const age = personAge_(r);
  return age !== null ? age : MEDIA_AGE_UNKNOWN;
}
/* A ROW TOO OLD FOR THIS VIEWER STILL HIDES A REPOSITORY COPY of the same video, by this hash rather than the id
   (the id alone is the video). FNV-1a of `kind:id`. */
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

/* AN ADMIN'S REELS AND VIDEOS (404): media:save, media:delete, mediaUpload and mediaHide, under the script lock with the rows read fresh. The gate already refused anybody not an admin. */
function mediaWrite_(body, action) {
  const kind = S(body.kind);
  if (MEDIA_KINDS.indexOf(kind) === -1) return { error: nothingSaved_('Is it a reel or a video?') };
  /* AN EDIT OF AN UPLOADED REEL NAMES ITS ID; a new upload makes one, after the file is in Drive. */
  const fileId = MEDIA_FILE_RE.test(S(body.id)) ? S(body.id) : '';
  let id = action === 'mediaUpload' ? 'f' + new Date().getTime()
    : action === 'media:save' ? (mediaYtId_(body.url) || fileId) : S(body.id);
  if (!mediaIdOk_(id)) return { error: nothingSaved_('That is not a YouTube link.') };
  const put = {};
  if (action === 'mediaUpload') {
    if (kind !== 'reel') return { error: nothingSaved_('Only a reel can be uploaded as a file.') };
    const data = S(body.data);
    if (!/^data:video\//i.test(data)) return { error: nothingSaved_('That file is not a video.') };
    /* THE CAMERA'S LIMIT (`CAM_VID_MAX`, posts.js): twenty megabytes a clip, base64 being a third bigger. */
    if ((data.length - data.indexOf(',') - 1) * 3 / 4 > POST_FILE_MAX) return { error: nothingSaved_('That video is over 20 MB.') };
    if (!S(body.title)) return errOf_('err-needs-title', 'no-title');
    const folder = getPostFolder();
    if (!folder) return { error: 'No posts folder. Add a row to the config tab: key `posts_folder`, value the id from the folder URL.' };
    let url = '';
    try { url = driveKeep_(folder, data, 'reel-' + id); }
    catch (err) { return { error: 'Could not save the video. ' + S(err && err.message || err) }; }
    ['title', 'subject'].forEach(function (k) { put[k] = S(body[k]).slice(0, MEDIA_CAP[k]); });
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    put.url = url;
    put.hidden = 'FALSE';
  } else if (action === 'media:save') {
    const too = Object.keys(MEDIA_CAP).filter(function (k) { return S(body[k]).length > MEDIA_CAP[k]; });
    if (too.length) return { error: nothingSaved_('Too long: ' + too.join(', ') + '.') };
    if (!S(body.title)) return errOf_('err-needs-title', 'no-title');
    const thumb = S(body.thumb);
    if (thumb && !/^https:\/\/i\.ytimg\.com\//.test(thumb)) return { error: nothingSaved_('The picture must be YouTube\'s own.') };
    Object.keys(MEDIA_CAP).forEach(function (k) { put[k] = S(body[k]); });
    /* WHOLE YEARS, OR BLANK FOR EVERYONE (406). */
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    if (MEDIA_FILE_RE.test(id)) { delete put.url; delete put.thumb; }
    else put.url = kind === 'reel' ? 'https://youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id;
    put.hidden = 'FALSE';
  } else if (action === 'mediaHide') {
    put.hidden = body.hidden === false ? 'FALSE' : 'TRUE';
  }
  const early = withWriteLock_(() => {
    clearCache();
    const t = read(TAB.media);
    if (!t.sheet) return { error: nothingSaved_('The media tab is not there yet — open the site once as an admin so setup makes it.') };
    const r = mediaRowOf_(t, kind, id);
    const by = S(body.personId), now = new Date();
    if (action === 'media:delete') {
      if (!r) return { error: 'Nothing to delete — that one came from the repository. Hide it instead.' };
      if (!delRow(t, r)) return { error: 'The media tab could not be changed — nothing was deleted.' };
    } else if (r) {
      put.updated_on = now;
      setCells(t, r, put);
    } else {
      if (action === 'mediaHide' && put.hidden === 'FALSE') return { error: 'Nothing to show again.' };
      if (action === 'media:save' && MEDIA_FILE_RE.test(id)) return { error: nothingSaved_('That uploaded reel is not there any more.') };
      if (!addRow(t, Object.assign({ media_id: kind + ':' + id, kind: kind, yt_id: id, added_by: by, added_on: now, updated_on: now }, put))) {
        return { error: 'The media tab could not be opened — nothing was saved.' };
      }
    }
    try { SpreadsheetApp.flush(); } catch (err) { /* flush is an early write; Apps Script writes at the end anyway */ }
  }, { busy: () => errOf_('err-busy', 'busy') });
  if (early) return early;
  clearCache();
  return { success: true, kind: kind, id: id, media: mediaOut_(Infinity) };
}




