/* ---------- WORK ON FILE (owner, 11 Nov): a student's scanned pages, kept in their own private Drive folder; the sheet keeps ids only. */
/* THE PARENT FOLDER'S ID is a Script Property, made on the first upload; each student gets a subfolder named by their person_id. */
const WORK_FILE_PROP = 'WORK_FILES_FOLDER_ID';
const WORK_FILE_PAGES_MAX = 6, WORK_FILE_ROWS_MAX = 40;

/* WHO MAY SEE A STUDENT'S FILE: themselves, a parent they accepted, a tutor booked with them, and the admin. */
function workFileMaySee_(me, of) {
  if (!me || !S(of)) return false;
  if (key(me.person_id) === key(of)) return true;
  if (rankAtLeast_(me, 'admin')) return true;
  let parent = false;
  try { parent = acceptedParents(of).some(p => key(p.person_id) === key(me.person_id)); } catch (err) { parent = false; }
  if (parent) return true;
  try {
    return bookedCircles_().some(r => r.teach.some(t => key(t.person_id) === key(me.person_id)) && r.learn.some(s => key(s.person_id) === key(of)));
  } catch (err) { return false; }
}
/* ONLY THE STUDENT AND THE ADMIN DELETE (owner): a parent or tutor may add a page but never take one away. */
const workFileMayDelete_ = (me, of) => !!me && (key(me.person_id) === key(of) || rankAtLeast_(me, 'admin'));

function workFileFolder_(of) {
  const props = PropertiesService.getScriptProperties();
  let id = S(props.getProperty(WORK_FILE_PROP));
  let top = null;
  if (id) { try { top = DriveApp.getFolderById(id); } catch (err) { top = null; } }
  if (!top) { top = DriveApp.createFolder('@family work on file (private)'); props.setProperty(WORK_FILE_PROP, top.getId()); }
  const it = top.getFoldersByName(S(of));
  return it.hasNext() ? it.next() : top.createFolder(S(of));
}
const workFileMs_ = v => { const d = v instanceof Date ? v : new Date(S(v)); return isNaN(d) ? 0 : d.getTime(); };
function workFileRows_(of) {
  const t = read(TAB.work_files);
  return t.rows.filter(r => key(r.person_id) === key(of) && !S(r.deleted_at) && S(r.work_id))
    .sort((a, b) => workFileMs_(b.uploaded_at) - workFileMs_(a.uploaded_at));
}
function workFileData_(id, thumb) {
  try {
    const f = DriveApp.getFileById(S(id));
    const blob = thumb && f.getThumbnail ? (f.getThumbnail() || f.getBlob()) : f.getBlob();
    return 'data:' + (blob.getContentType ? blob.getContentType() || 'image/jpeg' : 'image/jpeg') + ';base64,' + Utilities.base64Encode(blob.getBytes());
  } catch (err) { return ''; }
}
/* THE STUDENTS A TUTOR TEACHES (booked), so their own card can open each one's file; nobody else gets a list here. */
function workFileOthers_(me) {
  if (!me || rankOf(me) !== 'staff') return [];
  const seen = {}, out = [];
  try {
    bookedCircles_().filter(r => r.teach.some(t => key(t.person_id) === key(me.person_id))).forEach(r => r.learn.forEach(s => {
      const id = S(s.person_id);
      if (!id || seen[id] || id === S(me.person_id)) return;
      seen[id] = true;
      out.push({ id: id, name: S(s.first_name) || S(s.handle) || 'Student' });
    }));
  } catch (err) { return []; }
  return out;
}
function workFileWho_(me, id) {
  if (key(me.person_id) === key(id)) return 'you';
  const p = findPerson(S(id));
  return p ? (S(p.first_name) || S(p.handle) || 'someone') : 'someone';
}

/* workFileSave · workFilesOf · workFileOpen · workFileDelete: one handler, the viewer from the token's person, never the body's say-so. */
function postWorkFile_(body, action) {
  const me = findPerson('', S(body.personId));
  if (!me || !S(me.person_id)) return jsonOut({ success: false, message: 'Sign in first.' });
  const t = read(TAB.work_files);
  if (!t.sheet) return jsonOut({ success: false, message: 'Work on file is not set up yet — the admin opens the site with ?setup=1.' });
  if (action === 'workFileOpen' || action === 'workFileDelete') {
    const row = t.rows.find(r => S(r.work_id) === S(body.id) && !S(r.deleted_at));
    if (!row || !workFileMaySee_(me, S(row.person_id))) return jsonOut({ success: false, message: 'Not yours to see.' });
    const ids = S(row.pages).split(' ').filter(Boolean);
    if (action === 'workFileOpen') return jsonOut({ success: true, id: S(row.work_id), title: S(row.title), pages: ids.map(i => workFileData_(i, false)).filter(Boolean) });
    if (!workFileMayDelete_(me, S(row.person_id))) return jsonOut({ success: false, message: 'Only the student or the admin can delete this.' });
    setCells(t, row, { deleted_at: new Date() });
    /* A PAGE ALREADY GONE FROM DRIVE is counted, not fatal: the row is deleted either way. */
    const lost = ids.filter(i => { try { DriveApp.getFileById(i).setTrashed(true); return false; } catch (err) { return true; } }).length;
    return jsonOut({ success: true, id: S(row.work_id), lost: lost });
  }
  const of = S(body.of) || S(me.person_id);
  if (!workFileMaySee_(me, of)) return jsonOut({ success: false, message: 'Not yours to see.' });
  if (action === 'workFilesOf') {
    const rows = workFileRows_(of).slice(0, WORK_FILE_ROWS_MAX);
    return jsonOut({ success: true, of: of, mayDelete: workFileMayDelete_(me, of),
      others: key(of) === key(me.person_id) ? workFileOthers_(me) : [], work: rows.map(r => {
      const ids = S(r.pages).split(' ').filter(Boolean);
      return { id: S(r.work_id), at: workFileMs_(r.uploaded_at), title: S(r.title), subject: S(r.subject), by: workFileWho_(me, S(r.uploaded_by)),
               pages: ids.length, thumb: ids.length ? workFileData_(ids[0], true) : '' };
    }) });
  }
  /* workFileSave: JPEGs only, shrunk on the phone; refused whole, never cut. */
  const pics = Array.isArray(body.pages) ? body.pages : [];
  if (!pics.length || pics.length > WORK_FILE_PAGES_MAX || pics.some(x => !/^data:image\/jpeg;base64,[A-Za-z0-9+\/=]+$/.test(S(x)) || S(x).length > WORKING_PHOTO_CHARS))
    return jsonOut({ success: false, message: 'Those pages could not be saved — up to ' + WORK_FILE_PAGES_MAX + ' photos, each under half a megabyte.' });
  const id = 'WF-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8).replace(/[^a-z0-9]/g, 'x').padEnd(4, 'x');
  let folder;
  try { folder = workFileFolder_(of); } catch (err) { return jsonOut({ success: false, message: 'Drive would not take the pages right now — try again later.' }); }
  const ids = [];
  try {
    pics.forEach((x, i) => ids.push(folder.createFile(Utilities.newBlob(Utilities.base64Decode(S(x).split(',')[1] || ''), 'image/jpeg', id + '-' + (i + 1) + '.jpg')).getId()));
  } catch (err) { return jsonOut({ success: false, message: 'Drive would not take the pages right now — try again later.' }); }
  addRow(t, { work_id: id, person_id: of, uploaded_by: S(me.person_id), uploaded_at: new Date(),
              title: S(body.title).trim().slice(0, 80), subject: S(body.subject).trim().slice(0, 40), pages: ids.join(' '), deleted_at: '' });
  return jsonOut({ success: true, id: id, pages: ids.length });
}
