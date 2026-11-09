/* OLD SHEET ROWS INTO TODAY'S SHAPE (owner, 8 Nov): one job, safe to repeat, from Business › "Tidy old rows".
   Until it runs the readers keep the old shapes; `oldRowsTidied_` is the guard, a Script Property set last. */
const OLD_ROWS_FLAG = 'OLD_ROWS_TIDIED';
let OLD_ROWS_SEEN_ = null;

/* WHETHER THE JOB HAS RUN; read once per request, and a property store that cannot be read counts as not yet. */
function oldRowsTidied_() {
  if (OLD_ROWS_SEEN_ !== null) return OLD_ROWS_SEEN_;
  try { OLD_ROWS_SEEN_ = !!PropertiesService.getScriptProperties().getProperty(OLD_ROWS_FLAG); }
  catch (err) { OLD_ROWS_SEEN_ = false; }
  return OLD_ROWS_SEEN_;
}

/* A ROLE WORD AS THE READERS TAKE IT: an old word (`parent`, `teacher`, `kid`…) is translated only until the job has rewritten the cells. */
function roleWord_(x) { return oldRowsTidied_() ? x : (SELF_ROLE_ALIASES[x] || x); }

/* WHAT ONE OLD REPORT ROW BECOMES: blank kind is a question, its item is `q:<id>`, blank status is open, `not a problem` is dismissed. */
function reportTidy_(r) {
  const out = {};
  const kind = norm(r.kind);
  if (!kind) out.kind = 'question';
  if (!S(r.item_id) && (kind || 'question') === 'question' && S(r.question_id)) out.item_id = 'q:' + S(r.question_id);
  const s = norm(r.status);
  if (!s) out.status = 'open';
  else if (s === 'not a problem') out.status = 'dismissed';
  return out;
}

/* THE JOB. Returns { changed, log } — one log line per row rewritten, by tab and row number, never a name. */
function migrateOldRows_() {
  const log = [];
  /* PEOPLE: old role words into today's four (the legacy-parent sign-in path read `parent` as `client`). */
  const pt = read(TAB.people);
  (pt.rows || []).forEach(r => {
    const list = S(r.role).split(/[,\n]/).map(x => norm(x)).filter(Boolean);
    if (!list.length) return;
    const now = list.map(x => SELF_ROLE_ALIASES[x] || x).filter((x, i, a) => a.indexOf(x) === i);
    if (now.join(',') === list.join(',')) return;
    if (setCell(pt, r, 'role', now.join(', '))) log.push('people row ' + r._row + ': role ' + list.join(', ') + ' -> ' + now.join(', '));
  });
  /* REPORTS: the three blanks `reportRow_` used to fill on every read. */
  const rt = read(TAB.reports);
  (rt.rows || []).forEach(r => {
    const out = reportTidy_(r);
    const keys = Object.keys(out);
    if (!keys.length) return;
    setCells(rt, r, out);
    log.push('reports row ' + r._row + ': ' + keys.map(k => k + ' = ' + out[k]).join(', '));
  });
  /* POSTS: a picture with no size gets the 4:5 box it was drawn in (800 x 1000, the phone's own fallback). */
  const po = read(TAB.posts);
  (po.rows || []).forEach(r => {
    if (!S(r.image) || (Number(r.image_w) > 0 && Number(r.image_h) > 0)) return;
    setCells(po, r, { image_w: 800, image_h: 1000 });
    log.push('posts row ' + r._row + ': image size set to 800 x 1000');
  });
  try { PropertiesService.getScriptProperties().setProperty(OLD_ROWS_FLAG, new Date().toISOString()); OLD_ROWS_SEEN_ = true; }
  catch (err) { log.push('the flag could not be set, so the old-shape readers stay on: ' + S(err && err.message || err)); }
  try { console.log('migrateOldRows_: ' + log.length + ' change(s)\n' + log.join('\n')); } catch (err) { /* a log is not the job */ }
  return { changed: log.length, log: log, tidied: oldRowsTidied_() };
}

/* THE ADMIN'S TILE (gated `admin` in ACTION_ACCESS). */
function postTidyOldRows_(body, action, began) {
  try { return jsonOut(Object.assign({ success: true }, migrateOldRows_())); }
  catch (err) { return jsonOut({ error: S(err && err.message || err) }); }
}
