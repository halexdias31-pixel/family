/* ---------- PAST ATTEMPTS SHOW (owner, 12 Nov: "their answers haven't saved") — the account's old presses, in the live backend's shape, reach the cards */
const PAST_KID_ = { name: 'Jo Pupil', personId: 'P010', role: 'student', roles: ['student'], rank: 'client', token: 't-kid', handle: 'jopupil' };
check('past attempts: a student\'s earlier submissions, sent by doGet (live and new shape), show Attempted and the last answer on a done paper', async () => {
  const bad = [];
  const Q = LIB_FULL.rows('questions').filter(r => r.paper_id === 'P-STA-KS2-2024-P1');
  if (!Q.length) return ['no KS2 Arithmetic May 2024 rows — NOT checked'];
  const k1 = 'q:' + Q[0].row_id, k2 = 'q:' + Q[1].row_id;
  const DAY = 864e5, old = Date.now() - 30 * DAY;
  const p = payload();
  /* WHAT submissionsBuild_ SENDS: pressed_at's ms, or 0 when a row has only a UK-written submitted_at the server could not parse */
  p.submissions = { for: 'P010', mine: {
    [k1]: { answer: '1234', verdict: 'right', at: old, id: '1760000000501-pa0001' },
    [k2]: { answer: '77', verdict: 'wrong', at: 0, id: '1760000000502-pa0002' } } };
  const { w } = boot({ payload: p, before: signedInAs_(PAST_KID_),
    serve: url => (/data\/questions\.json/.test(url) ? JSON.parse(JSON.stringify(Q)) : undefined) });
  for (let n = 0; n < 80 && !(w.__t && typeof w.stuffItemsAll_ === 'function' && w.stuffItemsAll_().some(x => x.key === k1)); n++) await wait(100);
  await wait(400);
  const t = w.__t;
  if (!t || !t.whoami() || t.whoami().personId !== 'P010') return ['the student is not signed in — NOT checked'];
  const f = t.facetBy('myResult');
  const items = w.stuffItemsAll_();
  [[k1, 'Attempted,Correct', '1234'], [k2, 'Attempted,Incorrect', '77']].forEach(([k, want, ans]) => {
    const x = items.find(i => i.key === k);
    if (!x) { bad.push(k + ' is not in Find'); return; }
    const said = [].concat((f && f.of(x)) || []).join(',');
    if (said !== want) bad.push(k + ' says ' + JSON.stringify(said) + ', wanted ' + want);
    const box = w.ansValue_(t.ansKey(x));
    if (String(box || '') !== ans) bad.push(k + '\'s box holds ' + JSON.stringify(box) + ', wanted the last answer ' + ans);
  });
  return bad;
});
