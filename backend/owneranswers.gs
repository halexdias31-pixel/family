/* THE OWNER'S INBOX (1060) — one row per answer given in Find › Settings › Business › Checks; each sweep reads them (docs/philosophy.md). */
const OWNER_Q_SLUG = /^[a-z][a-z0-9-]{1,59}$/;

function ownerAnswerOut_(r) {
  return { id: S(r.question_id), choice: S(r.choice), note: S(r.note), by: S(r.by), answered_at: fmtDateTime(r.answered_at) };
}

function ownerAnswersAction_(action, body) {
  const t = read(TAB.owner_answers);
  if (!t.sheet) return { error: 'The sheet has no owner_answers tab. Open the site once as an admin to add it.' };
  if (action === 'listOwnerAnswers') return { success: true, answers: t.rows.filter(r => S(r.question_id)).map(ownerAnswerOut_) };

  /* saveOwnerAnswer: a choice (a, b, c or note) and an optional note; a later answer to the same question replaces the row. */
  const id = S(body.id), choice = S(body.choice), note = S(body.note).slice(0, 500);
  if (!OWNER_Q_SLUG.test(id)) return { error: 'That question has no name this sheet can file it under.' };
  if (!/^(a|b|c|note)$/.test(choice)) return { error: 'Pick an answer or write a note.' };
  if (choice === 'note' && !note) return { error: 'Write the note first.' };
  const v = { choice, note, by: S(body.name), answered_at: new Date() };
  const row = t.rows.find(r => S(r.question_id) === id);
  if (row) setCells(t, row, v); else addRow(t, Object.assign({ question_id: id }, v));
  return { success: true, answer: ownerAnswerOut_(Object.assign({}, row || {}, { question_id: id }, v)) };
}
