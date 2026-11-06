/* THE BUSINESS CHECKER'S TICKS (1050) — one row per checklist item the owner marked done, admin only. The items are data/settings/biz-checklist.json. */
const BIZCHECK_SLUG = /^[a-z][a-z0-9_]{1,39}$/;

function bizCheckOut_(r) {
  return { id: S(r.check_id), done_on: isoDate_(r.done_on), note: S(r.note), by: S(r.by), updated_at: fmtDateTime(r.updated_at) };
}

function bizChecksAction_(action, body) {
  const t = read(TAB.biz_checks);
  if (!t.sheet) return { error: 'The sheet has no biz_checks tab. Open the site once as an admin to add it.' };
  if (action === 'listBizChecks') return { success: true, checks: t.rows.filter(r => S(r.check_id) && S(r.done_on)).map(bizCheckOut_) };

  /* saveBizCheck: a blank date unticks; everything is checked before a cell is touched. */
  const id = S(body.id), done = S(body.done_on), note = S(body.note).slice(0, 200);
  if (!BIZCHECK_SLUG.test(id)) return { error: 'That item has no name this sheet can file it under.' };
  if (done) { const no = isoRefusal_(done, 'date'); if (no) return { error: no }; }
  const v = { done_on: done, note: done ? note : '', by: S(body.name), updated_at: new Date() };
  const row = t.rows.find(r => S(r.check_id) === id);
  if (row) setCells(t, row, v);
  else if (done) addRow(t, Object.assign({ check_id: id }, v));
  return { success: true, check: bizCheckOut_(Object.assign({}, row || {}, { check_id: id }, v)) };
}
