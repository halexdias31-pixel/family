#!/usr/bin/env node
/* ==================================================================================================
   node js/check-attempts.js — THE DAY A QUESTION WAS DONE, ASKED OF THE REAL BACKEND

   ASKED FOR AS *"should be saved to a spreadsheet instead of"* being kept only on the phone. The
   phone half is `doneMark_` / `attemptsSync_` in js/find.js and `check-flow.js` presses it; this is
   the half that writes a learner's record and decides who may read it, and each rule below fails
   quietly if it fails at all:

     · ONE ROW PER PERSON PER QUESTION. `first_done` once, `last_done` each new day, `times` counting
       days — and a second send for a day already there writes NOTHING, so a retry cannot count twice.
     · THE PERSON IS THE TOKEN'S. A request claiming another student's `personId` dates the question
       for whoever sent it. No token, no row.
     · A DAY FROM THE FUTURE IS TODAY. The phone's day is believed, up to tomorrow.
     · ONLY TWO PAYLOADS ARE RETIRED — the student's own and the admin's — and the generation that
       would make every visitor rebuild is untouched.
     · WHO IS SENT WHAT: yourself, your own; an admin, everybody's summary; another learner and a
       stranger, nothing of anybody else's.
     · THE QUESTION'S WORDS (`words`, for the daily parent email) BY THE LABEL'S RULES: kept on a new
       row, filled into a blank cell even on a day already covered and nothing else moved, never
       rewritten, and on a live tab from before the column neither written nor an error. The text is
       `attemptWords_`'s — an inequality is not a tag, line breaks and the stem's `---` line survive,
       cut before any rule reads it and linear in what is left — and the reply and every load say
       `named` / `worded` exactly when the row has them, and `keepsWords` exactly when the tab can.

   THROUGH THE REAL `doPost` AND `doGet`, gate and all, over `check-gas-load.js`. The people are
   invented and their PINs are 0000.
================================================================================================== */
'use strict';
const { backend } = require('./check-gas-load.js');

const bad = [];
let asked = 0;

const iso = d => d.toISOString().slice(0, 10);
const TODAY = iso(new Date());
const D1 = '2026-09-01', D2 = '2026-09-08', D0 = '2026-08-20';

function world() {
  const b = backend();
  const base = { pin: '0000', verified: 'TRUE', city: 'London' };
  b.seed('people', [
    Object.assign({ person_id: 'P-S1', first_name: 'Ada', last_name: 'Pupil', handle: 'adapupil', email: 's1@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-S2', first_name: 'Ben', last_name: 'Pupil', handle: 'benpupil', email: 's2@example.org', role: 'student' }, base),
    Object.assign({ person_id: 'P-A1', first_name: 'Hal', last_name: 'Admin', handle: 'haladmin', email: 'a1@example.org', role: 'admin' }, base),
  ]);
  const tok = {};
  ['s1@example.org', 's2@example.org', 'a1@example.org'].forEach(e => {
    const d = b.post({ action: 'verifyLogin', email: e, pin: '0000' });
    if (!d.success) bad.push('could not sign in ' + e + ' — ' + d.error);
    tok[e] = d.token;
  });
  const done = (who, items, extra) => {
    asked++;
    return b.post(Object.assign({ action: 'markDone', token: tok[who] || '', items: items }, extra || {}));
  };
  /* THE TAB AS THE SHEET HOLDS IT, one object per row, dates read back as the sheet hands them. */
  const rows = () => {
    const g = b.tabs.attempts, h = g[0];
    return g.slice(1).map(r => {
      const o = {};
      h.forEach((c, i) => { const v = r[i]; o[c] = v instanceof Date ? iso(new Date(Date.UTC(v.getFullYear(), v.getMonth(), v.getDate()))) : v; });
      return o;
    });
  };
  return { b, tok, done, rows };
}

/* ---------- THE UPSERT ------------------------------------------------------------------------- */
{
  const { b, done, rows } = world();
  if (!b.tabs.attempts) bad.push('there is no `attempts` tab in TAB/SCHEMA, so nothing below can be asked');
  else {
    /* CLAIMING TO BE BEN: the gate overwrites it, and the row is Ada's. */
    const a = done('s1@example.org', [{ key: 'q-alg-1', day: D1 }], { personId: 'P-S2', name: 'Ben Pupil' });
    if (!a.success) bad.push('a first done question was refused — ' + JSON.stringify(a));
    let r = rows();
    if (r.length !== 1) bad.push('one done question made ' + r.length + ' rows');
    else {
      if (r[0].person_id !== 'P-S1') bad.push('the row is for ' + r[0].person_id + ' — the request claimed P-S2 and the TOKEN was P-S1’s; the person must come from the token');
      if (r[0].question_key !== 'q-alg-1') bad.push('question_key is ' + r[0].question_key);
      if (r[0].first_done !== D1 || r[0].last_done !== D1 || Number(r[0].times) !== 1) bad.push('a first attempt wrote ' + JSON.stringify(r[0]) + ' — wanted first = last = ' + D1 + ', times 1');
    }
    if (!a.attempts || !a.attempts['q-alg-1'] || a.attempts['q-alg-1'].last !== D1) bad.push('the reply does not carry the row back: ' + JSON.stringify(a.attempts));

    /* THE SAME DAY AGAIN: nothing written, nothing counted. */
    const again = done('s1@example.org', [{ key: 'q-alg-1', day: D1 }]);
    if (!again.success) bad.push('a second send for the same day was refused — ' + JSON.stringify(again));
    if (again.writes !== 0) bad.push('a second send for a day already on the sheet wrote ' + again.writes + ' cell(s) — a retry must write nothing');
    r = rows();
    if (r.length !== 1 || Number(r[0].times) !== 1) bad.push('the same day sent twice left ' + JSON.stringify(r) + ' — wanted one row, times 1');

    /* A LATER DAY: last moves, first stays, times counts. */
    done('s1@example.org', [{ key: 'q-alg-1', day: D2 }]);
    r = rows();
    if (r.length !== 1) bad.push('a second day made a second row: ' + r.length);
    else if (r[0].first_done !== D1 || r[0].last_done !== D2 || Number(r[0].times) !== 2) bad.push('a later day left ' + JSON.stringify(r[0]) + ' — wanted first ' + D1 + ', last ' + D2 + ', times 2');

    /* AN OLDER DAY, as an offline phone's backlog sends it: first moves back, last stays. */
    done('s1@example.org', [{ key: 'q-alg-1', day: D0 }]);
    r = rows();
    if (r[0] && (r[0].first_done !== D0 || r[0].last_done !== D2 || Number(r[0].times) !== 3)) bad.push('an older day left ' + JSON.stringify(r[0]) + ' — wanted first ' + D0 + ', last ' + D2 + ', times 3');

    /* A DAY FROM THE FUTURE IS TODAY. */
    done('s1@example.org', [{ key: 'q-future', day: '2099-01-01' }]);
    const fut = rows().find(x => x.question_key === 'q-future');
    if (!fut || fut.last_done !== TODAY) bad.push('a day in 2099 was written as ' + (fut && fut.last_done) + ' — wanted today, ' + TODAY);

    /* A BATCH, as the backlog arrives, capped. */
    const many = Array.from({ length: 60 }, (_, i) => ({ key: 'q-batch-' + i, day: D1 }));
    done('s2@example.org', many);
    const ben = rows().filter(x => x.person_id === 'P-S2');
    if (ben.length !== 50) bad.push('a batch of 60 wrote ' + ben.length + ' rows — wanted the cap of 50');

    /* ---------- A NAME FILLS A BLANK ROW ON A DAY ALREADY COVERED, AND NOTHING ELSE MOVES ---------
       The first learner the after-session email met had three rows sent up as bare keys (the backlog
       carried no names), and that email prints no raw key — so a row with no name must take one when
       it next arrives, even for a day the sheet has. Only the name: no day moves, nothing is counted,
       and a row that already has a name is never renamed by another phone. */
    done('s1@example.org', [{ key: 'q-unnamed', day: D1 }]);
    const t0 = rows().find(x => x.question_key === 'q-unnamed');
    const nm = done('s1@example.org', [{ key: 'q-unnamed', day: D1, label: 'Maths · Money · Q1' }]);
    const t1 = rows().find(x => x.question_key === 'q-unnamed');
    if (!t1 || t1.label !== 'Maths · Money · Q1') bad.push('a name sent for a day already covered was not written into the blank cell: ' + JSON.stringify(t1) + ' — the after-session email would list nothing');
    else if (t1.first_done !== t0.first_done || t1.last_done !== t0.last_done || Number(t1.times) !== Number(t0.times)) bad.push('naming a row on a covered day also moved it: ' + JSON.stringify(t0) + ' -> ' + JSON.stringify(t1) + ' — only the name may be written');
    if (nm.writes !== 1) bad.push('naming a blank row wrote ' + nm.writes + ' cell(s) — wanted exactly the one name');
    const rn = done('s1@example.org', [{ key: 'q-unnamed', day: D1, label: 'Something else' }]);
    const t2 = rows().find(x => x.question_key === 'q-unnamed');
    if (!t2 || t2.label !== 'Maths · Money · Q1') bad.push('a named row was renamed by a later send: ' + JSON.stringify(t2));
    if (rn.writes !== 0) bad.push('a send for a named row on a covered day wrote ' + rn.writes + ' cell(s) — wanted none');

    /* NO TOKEN: refused at the gate, nothing written. */
    const before = rows().length;
    const anon = done('nobody', [{ key: 'q-anon', day: D1 }], { personId: 'P-S1' });
    if (!anon.error || !/sign in/i.test(anon.error)) bad.push('markDone with no token answered ' + JSON.stringify(anon) + ' — the gate should refuse it');
    if (rows().length !== before) bad.push('a request with no token wrote a row');
  }
}

/* ---------- THE QUESTION'S WORDS, AS markDone KEEPS THEM ------------------------------------------
   *"emails all parents on work their child has done with the exact questions for each"* — and the
   backend cannot look a key up, so the phone sends what it drew (`doneWords_` in js/find.js) and
   `attemptsUpsert_` keeps it, by the label's rules. Each of these fails quietly: words lost on a new
   row are an email with numbers in it; words written over are one phone changing what another
   family is told; a refusal to fill a blank cell on a covered day leaves every row from before the
   deploy without words for good, because that is the only day the phone will ever send for it.

   AND THE FLAGS. The phone resends whatever the reply and the load say a row lacks (`attemptsSync_`),
   so a `worded` missing from a row that has words is the same fifty rows sent on every visit, and a
   `worded` on a row that has none is a row never given its words. */
{
  const { b, tok, done, rows } = world();
  const row = q => rows().find(x => x.question_key === q) || null;
  const flags = (d, q) => { const a = ((d && d.attempts) || {})[q] || {}; return (a.named ? 'named' : '-') + ' ' + (a.worded ? 'worded' : '-'); };
  const ADA = 's1@example.org';
  const W1 = 'A bag holds 3 red and 5 blue counters.\n---\nWork out the probability of red.';

  /* A NEW ROW KEEPS ITS WORDS, and the reply says it has them. */
  asked++;
  const n1 = done(ADA, [{ key: 'q-w-new', day: D1, label: 'Maths · Probability · Q4a', words: W1 }]);
  if (!n1.success) bad.push('a done question with words was refused — ' + JSON.stringify(n1).slice(0, 200));
  if (!row('q-w-new') || row('q-w-new').words !== W1) bad.push('a new row kept its words as ' + JSON.stringify(row('q-w-new') && row('q-w-new').words) + ' — wanted ' + JSON.stringify(W1) + ', stem, `---` line and ask, as sent');
  if (flags(n1, 'q-w-new') !== 'named worded') bad.push('a new row with a name and words came back "' + flags(n1, 'q-w-new') + '" — wanted "named worded"');

  /* ONLY WHAT IT HAS: words and no name, a name and no words, neither. */
  asked++;
  const n2 = done(ADA, [{ key: 'q-w-only', day: D1, words: 'Expand 2(x + 3).' },
                        { key: 'q-w-label', day: D1, label: 'Maths · Algebra · Q2' },
                        { key: 'q-w-none', day: D1 }, { key: 'q-w-bare', day: D1 }]);
  [['q-w-only', '- worded'], ['q-w-label', 'named -'], ['q-w-none', '- -']].forEach(([q, want]) => {
    if (flags(n2, q) !== want) bad.push('the reply for ' + q + ' says "' + flags(n2, q) + '", wanted "' + want + '" — a flag must say what the row has, no more');
  });
  if (row('q-w-label') && row('q-w-label').words !== '') bad.push('a row sent no words was written ' + JSON.stringify(row('q-w-label').words));

  /* AN EXISTING ROW'S REPLY SAYS WHAT THE ROW HAS, not what this request brought: a bare resend of a
     named, worded row is still named and worded — and on a covered day it writes nothing. */
  asked++;
  const n3 = done(ADA, [{ key: 'q-w-new', day: D1 }]);
  if (n3.writes !== 0) bad.push('a bare resend of a covered day wrote ' + n3.writes + ' cell(s)');
  if (flags(n3, 'q-w-new') !== 'named worded') bad.push('a bare resend of a named, worded row came back "' + flags(n3, 'q-w-new') + '" — the phone would take it as unnamed and unworded and send them again');

  /* A BLANK CELL IS FILLED ON A DAY ALREADY COVERED, AND NOTHING ELSE MOVES. */
  asked++;
  const c0 = row('q-w-none');
  const f1 = done(ADA, [{ key: 'q-w-none', day: D1, words: 'Solve x > 3 and x < 7' }]);
  const c1 = row('q-w-none');
  if (!c1 || c1.words !== 'Solve x > 3 and x < 7') bad.push('words sent for a day already covered were not written into the blank cell: ' + JSON.stringify(c1) + ' — every row from before the deploy would stay without them');
  else if (c1.first_done !== c0.first_done || c1.last_done !== c0.last_done || Number(c1.times) !== Number(c0.times)) bad.push('wording a row on a covered day also moved it: ' + JSON.stringify(c0) + ' -> ' + JSON.stringify(c1) + ' — only the words may be written');
  if (f1.writes !== 1) bad.push('wording a blank row on a covered day wrote ' + f1.writes + ' cell(s) — wanted exactly the one');
  if (flags(f1, 'q-w-none') !== '- worded') bad.push('the reply after filling the words says "' + flags(f1, 'q-w-none') + '", wanted "- worded"');

  /* NEVER REWRITTEN — not on the covered day (which writes nothing), and not on a new day, where the
     day moves, the count goes up and the words stay. */
  asked++;
  const f2 = done(ADA, [{ key: 'q-w-none', day: D1, words: 'Something else entirely' }]);
  if (f2.writes !== 0) bad.push('different words for a worded row on a covered day wrote ' + f2.writes + ' cell(s) — wanted none');
  done(ADA, [{ key: 'q-w-none', day: D2, words: 'Something else again' }]);
  const c2 = row('q-w-none');
  if (!c2 || c2.words !== 'Solve x > 3 and x < 7') bad.push('a row’s words were rewritten by a later send: ' + JSON.stringify(c2 && c2.words) + ' — one phone must not change what another family’s email says');
  else if (c2.last_done !== D2 || Number(c2.times) !== 2) bad.push('a later day with words did not move the day: ' + JSON.stringify(c2));

  /* AND A BLANK CELL ON A LATER DAY: the day moves and the words fill, and the name stays. */
  asked++;
  done(ADA, [{ key: 'q-w-label', day: D2, label: 'Another name', words: 'Factorise x² + 5x + 6' }]);
  const c3 = row('q-w-label');
  if (!c3 || c3.words !== 'Factorise x² + 5x + 6' || c3.last_done !== D2 || Number(c3.times) !== 2 || c3.label !== 'Maths · Algebra · Q2') bad.push('a later day for a named, unworded row left ' + JSON.stringify(c3) + ' — wanted words filled, last ' + D2 + ', times 2, the name unchanged');

  /* THE TEXT, AS THE CELL KEEPS IT — `attemptWords_`, through the real `markDone`. */
  const MAX = b.ev('typeof ATTEMPT_WORDS_MAX === "number" ? ATTEMPT_WORDS_MAX : 0');
  if (!(MAX >= 200)) bad.push('ATTEMPT_WORDS_MAX is ' + MAX + ' — the cap was NOT checked');
  const text = [
    /* `attemptLabel_`'s `<[^>]*>?` read this as a tag and kept "Solve x 3 and x". */
    ['an inequality', 'Solve x > 3 and x < 7', 'Solve x > 3 and x < 7'],
    ['a less-than with nothing after it', 'Is 3 < 5?', 'Is 3 < 5?'],
    /* A `<` THEN A `>` IS STILL NOT A TAG — "< 3 or x >" is one to any rule that only wants the pair. */
    ['a less-than before a greater-than', 'Show that x < 3 or x > 5', 'Show that x < 3 or x > 5'],
    ['a stem, its --- line and the ask', 'Here are two lines.\nThe second line.\n---\n(a) Find x.', 'Here are two lines.\nThe second line.\n---\n(a) Find x.'],
    ['Windows line ends', 'Stem\r\n---\r\nAsk', 'Stem\n---\nAsk'],
    ['spaces round a line break, and a run of spaces', 'Work  out   3 × 5  \n  ---  \n  Show   working', 'Work out 3 × 5\n---\nShow working'],
    ['real tags, whose text stays', '<b>Work out</b> 3 × 5 <script>alert(1)</script>', 'Work out 3 × 5 alert(1)'],
    ['a closing tag and attributes', '<p class="q">Find <i>y</i></p>', 'Find y'],
    ['the cap', 'x'.repeat(MAX + 500), 'x'.repeat(MAX)],
  ];
  text.forEach(([what, sent, want], i) => {
    asked++;
    const q = 'q-text-' + i;
    const d = done(ADA, [{ key: q, day: D1, words: sent }]);
    const got = row(q) && row(q).words;
    if (!d.success || got !== want) bad.push('words with ' + what + ' were kept as ' + JSON.stringify(String(got).slice(0, 80)) + (String(got).length > 80 ? '… (' + String(got).length + ')' : '') + ' — wanted ' + JSON.stringify(want.slice(0, 80)) + (want.length > 80 ? '… (' + want.length + ')' : ''));
  });

  /* AND WHAT IT COSTS, UNDER THE SCRIPT LOCK EVERY OTHER `markDone` WAITS ON. `<[^>]*>` after `<a` scanned
     the rest of the string for a `>` for every `<a` that had none: 18 s for 160 KB of them. Now a tag has
     no `<` inside it, and the text is cut to what the cell could ever keep BEFORE any rule reads it — so
     words past that are never seen, however the rules are written, and a flood costs the cut and no more. */
  asked++;
  const t0 = Date.now();
  const flood = b.ev('attemptWords_("<a".repeat(100000))');
  const ms = Date.now() - t0;
  if (ms > 500 || typeof flood !== 'string') bad.push('attemptWords_ took ' + ms + ' ms over 200 KB of "<a" — wanted well under a second; it runs under the script lock');
  asked++;
  const past = b.ev('attemptWords_("<b>".repeat(70000) + "Find x.")');
  if (past !== '') bad.push('words after 210 KB of tags came back as ' + JSON.stringify(String(past).slice(0, 80)) + ' — the text is not cut before its rules read it, so they read all of it');

  /* EVERY LOAD SAYS `worded` EXACTLY WHEN THE ROW HAS WORDS (`attemptsFor_`) — a flag, never the text,
     which the phone already has and the payload would carry on every visit. And the backend says it
     keeps them (`attemptWords` in features), which is the only thing that lets the phone backfill. */
  asked++;
  b.cache.clear();
  const g = b.get({ token: tok[ADA] });
  const mine = (g.attempts && g.attempts.mine) || {};
  ['q-w-new', 'q-w-only', 'q-w-none', 'q-w-label'].forEach(q => {
    if (!mine[q] || mine[q].worded !== 1) bad.push('the load says ' + q + ' is ' + JSON.stringify(mine[q]) + ' — it has words, and without `worded` the phone sends them again every visit');
  });
  if (!mine['q-w-bare'] || mine['q-w-bare'].worded) bad.push('the load says q-w-bare, a row with no words, is ' + JSON.stringify(mine['q-w-bare']) + ' — `worded` on it and it is never given any');
  if (/probability of red|Factorise/.test(JSON.stringify(g.attempts || {}))) bad.push('the load carries a row’s words, not a flag — every visit pays for text the phone already has');
  if (!(g.features || []).includes('attemptWords')) bad.push('`attemptWords` is not in doGet’s features, so no phone will ever backfill a row’s words');
  /* AND THAT THE LIVE TAB CAN HOLD THEM: `features` says the code keeps words, `keepsWords` that the tab
     has the column. The phone sends words only when both say so (`attemptWordsOn_`). */
  asked++;
  if (!g.attempts || g.attempts.keepsWords !== 1) bad.push('with a words column the load says keepsWords ' + JSON.stringify(g.attempts && g.attempts.keepsWords) + ' — wanted 1, or no phone sends a question’s words at all');
}

/* ---------- A LIVE TAB FROM BEFORE THE `words` COLUMN ----------------------------------------------
   Synced, the version stamps not yet seen by `autoMigrate`: the column is not there. `addRow` reports
   every key with no column and `jsonOut` makes that an error, so a `words` written regardless made
   EVERY `markDone` from a new phone answer "Nothing was saved" — over a row that was in fact written.
   The words are the email's; the day is the record. It must save, say so, and write no words. */
{
  const { b, tok, done, rows } = world();
  b.tabs.attempts[0] = b.tabs.attempts[0].filter(c => c !== 'words');
  const width = b.tabs.attempts[0].length;
  const ADA = 's1@example.org';
  const ask = (items, what) => {
    asked++;
    const d = done(ADA, items);
    if (!d.success || d.error) bad.push('with no words column, markDone ' + what + ' answered ' + JSON.stringify(d).slice(0, 200) + ' — the day was written and must be reported saved');
    return d;
  };
  const a = ask([{ key: 'q-old-1', day: D1, label: 'Maths · Q1', words: 'Work out 3 × 5' }], 'a new row with words');
  const r = rows().find(x => x.question_key === 'q-old-1');
  if (!r || r.last_done !== D1 || r.label !== 'Maths · Q1') bad.push('with no words column, the new row is ' + JSON.stringify(r) + ' — wanted the day and the name written');
  if (a.attempts && a.attempts['q-old-1'] && a.attempts['q-old-1'].worded) bad.push('with no words column, the reply says the row is worded — nothing could hold them');
  const c = ask([{ key: 'q-old-1', day: D1, words: 'Work out 3 × 5' }], 'words for a covered day');
  if (c.writes !== 0) bad.push('with no words column, words for a covered day wrote ' + c.writes + ' cell(s)');
  ask([{ key: 'q-old-1', day: D2, words: 'Work out 3 × 5' }], 'words on a later day');
  const r2 = rows().find(x => x.question_key === 'q-old-1');
  if (!r2 || r2.last_done !== D2 || Number(r2.times) !== 2) bad.push('with no words column, a later day left ' + JSON.stringify(r2));
  if (b.tabs.attempts[0].indexOf('words') !== -1 || b.tabs.attempts.some(x => x.length > width)) bad.push('with no words column, something was written past the last column');
  /* AND THE LOAD SAYS THE TAB CANNOT KEEP THEM. `attemptWords` is in `features` either way — that is the
     code — so without `keepsWords` the phone would send every row's words, fifty a request, every
     visit, each holding the lock to write nothing. */
  asked++;
  b.cache.clear();
  const g = b.get({ token: tok[ADA] });
  if (!g.attempts || g.attempts.for !== 'P-S1' || 'keepsWords' in g.attempts) bad.push('with no words column the load says keepsWords ' + JSON.stringify(g.attempts && g.attempts.keepsWords) + ' — the phone would resend every row’s words on every visit for a column that is not there');
}

/* ---------- WHO IS SENT WHAT -------------------------------------------------------------------- */
{
  const { b, tok, done } = world();
  done('s1@example.org', [{ key: 'q-alg-1', day: D1 }, { key: 'q-alg-2', day: D2, label: 'Maths · Algebra · Q2' }]);
  done('s2@example.org', [{ key: 'q-ben-1', day: D1 }]);
  b.cache.clear();
  const ada = b.get({ token: tok['s1@example.org'] }).attempts || {};
  const ben = b.get({ token: tok['s2@example.org'] }).attempts || {};
  const hal = b.get({ token: tok['a1@example.org'] }).attempts || {};
  const anon = b.get({}).attempts;
  const spoof = b.get({ person: 'P-S1', name: 'Ada Pupil' }).attempts;
  /* WHICH ROWS HAVE A NAME, so the phone knows which to send one for (`attemptsSync_`). */
  if (ada.mine && ada.mine['q-alg-1'] && ada.mine['q-alg-1'].named) bad.push('a row with no name was sent as named: ' + JSON.stringify(ada.mine['q-alg-1']));
  if (!(ada.mine && ada.mine['q-alg-2'] && ada.mine['q-alg-2'].named)) bad.push('a named row was not sent as named: ' + JSON.stringify(ada.mine && ada.mine['q-alg-2']) + ' — the phone would send its name again on every visit');

  if (ada.for !== 'P-S1') bad.push('Ada’s attempts are stamped for "' + ada.for + '" — the phone checks this before drawing them');
  if (!ada.mine || !ada.mine['q-alg-1'] || ada.mine['q-alg-1'].last !== D1 || !ada.mine['q-alg-2'] || ada.mine['q-alg-2'].last !== D2) bad.push('Ada is not sent her own attempts: ' + JSON.stringify(ada.mine));
  if (ada.mine && ada.mine['q-ben-1']) bad.push('ONE LEARNER WAS SENT ANOTHER’S ATTEMPTS — Ada’s payload has Ben’s q-ben-1');
  if (ada.people) bad.push('a learner was sent `people`, which is every learner’s summary');
  if (!ben.mine || Object.keys(ben.mine).join() !== 'q-ben-1') bad.push('Ben was sent ' + JSON.stringify(ben.mine) + ' — wanted his own q-ben-1 alone');
  if (!hal.people || !hal.people['P-S1'] || hal.people['P-S1'].n !== 2 || hal.people['P-S1'].last !== D2) bad.push('the admin’s summary for Ada is ' + JSON.stringify(hal.people && hal.people['P-S1']) + ' — wanted n 2, last ' + D2);
  if (!hal.people || !hal.people['P-S2'] || hal.people['P-S2'].n !== 1) bad.push('the admin is not sent Ben’s summary: ' + JSON.stringify(hal.people));
  [['a visitor with no token', anon], ['a visitor NAMING Ada in the URL', spoof]].forEach(([who, a]) => {
    if (!a || a.for !== '' || Object.keys(a.mine || {}).length || a.people) bad.push(who + ' was sent attempts: ' + JSON.stringify(a));
  });
}

/* ---------- WHAT IT COSTS EVERYBODY ELSE ----------------------------------------------------------
   A done question is in two payloads. Ada's own goes, the admin's goes, Ben's stays, and the
   generation every key starts with is the same number after as before. */
{
  const { b, tok, done } = world();
  b.get({ token: tok['s1@example.org'] });
  b.get({ token: tok['s2@example.org'] });
  b.get({ token: tok['a1@example.org'] });
  const gen = b.props.PAYLOAD_GEN;
  const idx = pid => [...b.cache.keys()].some(k => /^pay:[^:]*$/.test(k) && k.endsWith('|' + pid));
  if (!idx('P-S1') || !idx('P-S2') || !idx('P-A1')) bad.push('the three payloads were not cached to begin with, so retirement was NOT checked: ' + [...b.cache.keys()].filter(k => /^pay:[^:]*$/.test(k)).join(', '));
  else {
    done('s1@example.org', [{ key: 'q-cost', day: D1 }]);
    if (b.props.PAYLOAD_GEN !== gen) bad.push('a done question bumped PAYLOAD_GEN (' + gen + ' → ' + b.props.PAYLOAD_GEN + ') — every visitor rebuilds thirty tabs because a child typed an answer');
    if (idx('P-S1')) bad.push('Ada’s own payload was not retired, so her other phone keeps the old date for six hours');
    if (idx('P-A1')) bad.push('the admin’s payload was not retired, so the people column keeps the old count');
    if (!idx('P-S2')) bad.push('Ben’s payload was retired for Ada’s question — it has nothing of hers in it');
    const fresh = b.get({ token: tok['s1@example.org'] }).attempts || {};
    if (!fresh.mine || !fresh.mine['q-cost']) bad.push('Ada’s next load does not have the question she just did');
  }
}

console.log('');
console.log('THE DAY A QUESTION WAS DONE, THROUGH THE REAL doPost AND doGet  (' + bad.length + ')');
bad.forEach(x => console.log('  ' + x));
console.log('\nrequests made: ' + asked);
if (bad.length) {
  console.log('FAILED — a learner’s record is written wrongly, or sent to somebody it does not belong to.');
  process.exit(1);
}
console.log('OK — one row per person per question, the person from the token, each sees only their own and an admin everybody’s.');
