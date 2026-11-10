/* THE BUSINESS CHECKER'S TICKS (1050) — one row per checklist item the owner marked done, admin only. The items are data/settings/biz-checklist.json. */
const BIZCHECK_SLUG = /^[a-z][a-z0-9_]{1,39}$/;
/* A RENEWAL'S DOCUMENT goes to this private Drive folder (Script Property); the sheet keeps only its link. */
const BIZ_DOCS_PROP = 'BIZ_DOCS_FOLDER_ID';
const BIZ_DOC_MAX = 8 * 1024 * 1024;

function bizCheckOut_(r) {
  return { id: S(r.check_id), done_on: isoDate_(r.done_on), expires_on: isoDate_(r.expires_on), doc_link: S(r.doc_link),
           note: S(r.note), result: S(r.result), by: S(r.by), updated_at: fmtDateTime(r.updated_at) };
}

/* THE DOCUMENT, if one came: {name, type, data (base64)} → a private file's link, or {error}. */
function bizCheckDoc_(doc, id) {
  if (!doc || !doc.data) return {};
  try {
    /* NO SETUP FOR THE OWNER: the first document makes the private folder (never shared) and keeps its id. */
    const props = PropertiesService.getScriptProperties();
    let folderId = S(props.getProperty(BIZ_DOCS_PROP));
    if (!folderId) { folderId = DriveApp.createFolder('@family business documents (private)').getId(); props.setProperty(BIZ_DOCS_PROP, folderId); }
    const bytes = Utilities.base64Decode(String(doc.data).replace(/^data:[^,]*,/, ''));
    if (bytes.length > BIZ_DOC_MAX) return { error: 'Saved, but the document is over 8 MB.' };
    const type = /^(application\/pdf|image\/(png|jpeg|webp|heic))$/.test(S(doc.type)) ? S(doc.type) : 'application/pdf';
    const name = id + ' ' + Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd') + ' ' + S(doc.name).replace(/[^\w. -]/g, '').slice(0, 60);
    const f = DriveApp.getFolderById(folderId).createFile(Utilities.newBlob(bytes, type, name));
    return { link: f.getUrl() };
  } catch (err) { return { error: 'Saved, but the document could not be stored: ' + err }; }
}

function bizChecksAction_(action, body) {
  const t = read(TAB.biz_checks);
  if (!t.sheet) return { error: 'The sheet has no biz_checks tab. Open the site once as an admin to add it.' };
  if (action === 'listBizChecks') return { success: true, checks: t.rows.filter(r => S(r.check_id) && S(r.done_on)).map(bizCheckOut_) };

  /* saveBizCheck: a blank date unticks; everything is checked before a cell is touched. Renewed sends expires_on too. */
  const id = S(body.id), done = S(body.done_on), note = S(body.note).slice(0, 200), exp = S(body.expires_on), result = S(body.result).slice(0, 40);
  if (!BIZCHECK_SLUG.test(id)) return { error: 'That item has no name this sheet can file it under.' };
  if (done) { const no = isoRefusal_(done, 'date'); if (no) return { error: no }; }
  if (done && exp) { const no = isoRefusal_(exp, 'expiry date'); if (no) return { error: no }; if (exp < done) return { error: 'The new expiry is before the renewal date.' }; }
  const row = t.rows.find(r => S(r.check_id) === id);
  const doc = done ? bizCheckDoc_(body.doc, id) : {};
  const v = { done_on: done, note: done ? note : '', by: S(body.name), updated_at: new Date(), expires_on: done ? exp : '', result: done ? result : '',
              doc_link: done ? (doc.link || (row ? S(row.doc_link) : '')) : '' };
  if (row) setCells(t, row, v);
  else if (done) addRow(t, Object.assign({ check_id: id }, v));
  const out = { success: true, check: bizCheckOut_(Object.assign({}, row || {}, { check_id: id }, v)) };
  if (doc.error) out.docError = doc.error;
  return out;
}
