/* ==================================================================================================
   @family. — library.js

   THE QUESTIONS COME FROM THIS REPOSITORY, NOT FROM THE SPREADSHEET.

   WHY. `questions` is the one tab nobody hand-edits — it is written in bulk, and every edit to it
   this week has gone: export the sheet, build a CSV, download it, File → Import, twice, and hope.
   A tab that only ever arrives in bulk belongs where bulk edits are cheap and reviewable, and that
   is git. `Settings` and `Ledger` stay in Sheets for the two reasons that decide it: a person edits
   Settings by hand and should not need a deploy to do it, and Ledger holds PINs, e-mail addresses
   and dates of birth, which cannot go in a public repository at any price.

   WHAT WAS LEFT BEHIND, and this is the whole of it: `ticks_1`, `ticks_2` and `ticks_3`. 529 cells
   holding the handles of real people — `MabelW`, `HectorL`, `DanileC`, most of them children. They
   are stripped from `data/questions.json` and they are the reason this file says so twice. A tick
   is a fact about a PERSON and a document; it was never library data, and if it comes back it comes
   back in `Ledger`.

   ---------------------------------------------------------------------------------------------
   THIS IS NOT A SECOND IMPLEMENTATION OF `doGet`. It is a MOVED one. The two blocks below are the
   `payload.questions` push and the `dropdowns.checklists` build, lifted out of `doget.gs` because
   the rows they read no longer reach the backend at all. There is one copy, and it is this one.

   THE SHAPES ARE THEREFORE EXACT, down to the key names, because everything downstream — `allTopics`,
   `paperBody_`, `paperText_`, the funnel's facets — was written against them and none of it is
   being touched. A key renamed here is a feature that silently does nothing, which is this app's
   signature fault and the reason `check-payload.js` exists.

   FETCHED ALONGSIDE THE PAYLOAD, NOT AFTER IT. `index.html` starts both requests while it is still
   parsing; this one is 2.4 MB and the backend's is not, so starting it second would add its whole
   time to the boot. Merged in `load()` when both have landed.

   AND IT IS CACHEABLE, which the payload never was. The same origin as the site, a normal static
   file, so the second visit pays for none of it.

   IF IT FAILS, THE LIBRARY IS EMPTY and the rest of the app is untouched — the same outcome as an
   empty tab, which is what every other section of this payload does with a section it cannot read.
   It is not allowed to take the app down: a paper nobody can see is a bad day, a blank screen is a
   dead business.
================================================================================================== */

/* THE ROWS AS THEY SIT IN THE FILE — every column of the tab except the three that were private.
   Held raw so `libraryInto_` can be run again against a payload without re-fetching. */
let LIBRARY_ROWS = null;

/* ---------- THE HELPERS THE TWO BLOCKS NEED --------------------------------------------------------
   `S`, `N`, `ON_` and `TRUE_` are `doget.gs`'s, and they are here under `lib` names rather than
   added to the global scope: `core.js` already has `norm`, and four more one-letter globals in a
   file that shares one scope with thirty-nine others is how a name gets taken twice. */
const libS = v => (v === undefined || v === null ? '' : String(v));
const libN = v => { const n = Number(String(v).replace(/[^0-9.-]/g, '')); return isFinite(n) ? n : 0; };
/* ---------- `libN` BUT ABSENT STAYS ABSENT -------------------------------------------------------
   `libN('')` IS 0, deliberately: a blank count is none of something, and every caller it was
   written for wants that. It is exactly wrong for a PRICE and for an AGE, where nought and
   unanswered are different facts — the `cost: 0` shape CLAUDE.md records four times, most recently
   on the shop mapper where a blank cell read as "free" under a comment defending the zero.
   Two functions rather than a flag, so a caller picks by saying which question it is asking. */
const libNum = v => {
  if (v === undefined || v === null || String(v).trim() === '') return null;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isFinite(n) ? n : null;
};
const libOn = v => {
  const s = String(v === undefined || v === null ? '' : v).toLowerCase().trim();
  /* BLANK IS ON. `active` empty means nobody has switched it off, which is not the same as off —
     and reading it as off hides every row somebody has not thought about yet. */
  return s === '' || s === 'true' || s === 'yes' || s === '1' || s === 'y' || s === 'on';
};
const libTrue = v => {
  const s = String(v === undefined || v === null ? '' : v).toLowerCase().trim();
  return s === 'true' || s === 'yes' || s === '1' || s === 'y' || s === 'on';
};

/* `libPrintPrice_` AND `libCanPrint_` WERE HERE — what a printed copy costs, computed while the
   checklists were built so a document arrived with its price on it. The checklists are not built
   any more (see below), so both went with the block that called them. Orphaned by the same change
   that orphaned `printPrice` in find.js, and found the same way, by `check-dead.js`. */

/* ---------- ONE FETCH, STARTED EARLY ---------------------------------------------------------------
   `window.BOOT_LIB` is set by `index.html` before any of this has parsed, for the same reason
   `BOOT_GET` is: the network is the slow part and the parser is not. Null whenever that could not
   happen — no `fetch`, opened from a file, or it simply failed — and then this asks for it itself. */
async function libraryRows_() {
  if (LIBRARY_ROWS) return LIBRARY_ROWS;
  let rows = null;
  /* ---------- A FILE THAT DID NOT ARRIVE IS NOT AN EMPTY LIBRARY -------------------------------
     THIS CAUGHT AND SAID NOTHING, and `[]` is what came out either way. Downstream, `stuffPageHtml`
     then drew "Nothing in the shop or the library yet." — a confident sentence about the library
     being empty, printed for a library that is 4,682 rows and simply had not come.

     IT IS THE FAULT THIS REPOSITORY HAS NOW RECORDED FOUR TIMES. `loadMessages` showed an empty
     inbox for an unreachable backend and its own comment named it: "a network blip reads as
     everything having been deleted". `check-booking.js` printed "nothing to check" and exited 0.
     Reels drew "Nothing here yet" for a column that worked. Every one is the same sentence — I did
     not manage to look, reported as I looked and there was nothing there.

     AND IT MATTERS MOST ON THE PHONE THAT CANNOT DO IT. This file is 346 KB compressed and 3.4 MB
     parsed, which is the one request in the app big enough to fail on a weak signal or an old
     handset — so the person who sees this message is exactly the person whose library did NOT load,
     and the message told them it was empty. `nothingHere` has drawn a reason and a `Try again` for
     the backend since it was written; the library just was never wired into it. */
  try {
    const early = window.BOOT_LIB || null;
    window.BOOT_LIB = null;
    const res = early ? await early : await fetch('data/questions.json', { cache: 'default' });
    if (!res) LIBRARY_FAILED = 'the question file did not come back';
    else if (!res.ok) LIBRARY_FAILED = 'the question file answered ' + res.status;
    else rows = await res.json();          /* a truncated body throws here, and that is the point */
  } catch (e) {
    LIBRARY_FAILED = String((e && e.message) || 'the question file did not arrive');
  }
  /* AN EMPTY ARRAY IS A REAL ANSWER and is left alone — the file legitimately parses to `[]` on a
     fresh clone. Only a throw or a refusal sets the flag, so "empty" and "absent" stay different. */
  LIBRARY_ROWS = Array.isArray(rows) ? rows : [];
  if (Array.isArray(rows)) LIBRARY_FAILED = '';
  return LIBRARY_ROWS;
}

/* ==================================================================================================
   THE OTHER THREE TABS OF `Library`, AND BOTH STEPS ARE TAKEN. THIS IS THE ONLY IMPLEMENTATION.

   `questions` LEFT THE SPREADSHEET AND THE ARGUMENT APPLIES UNCHANGED to `boxers`, `fights` and
   `cheatsheet`. CLAUDE.md sets the test in three questions, first one to answer wins:

     Is it secret?            No. Boxers and bouts are public record; the cheat sheet is a list of
                              which components a revision card may carry. Nothing here is a PIN, an
                              e-mail address or a date of birth, which is what keeps `Ledger` in a
                              sheet and out of this public repository.
     Does the app write to it? No — and this is the one that decides it. Measured: `read(TAB.boxers)`,
                              `read(TAB.fights)` and `read(TAB.cheatsheet)` appear exactly once each,
                              all three in `doget.gs`, and no `setCell` or `append` anywhere names
                              them. Code cannot be written to at runtime, so a tab the app writes to
                              can never move here; these three it only ever reads.
     Who edits it?            You, in bulk. Which is the same answer `questions` gave.

   IT WAS BUILT AS A FALLBACK AND IT RAN AS ONE FOR A FORTNIGHT, which is the part worth keeping.
   When `questions` moved, the rows were in hand and `doGet` stopped building them in the same
   commit. These three could not be done that way: the rows were in a spreadsheet the agent
   environment cannot open — every Google host is blocked by network policy — so it went in two
   steps, and only the first could be taken from here:

     1. the machinery, with the FILE WINNING and the payload still answering while the file is empty
     2. paste the rows in, confirm, then delete the three blocks from `doget.gs`

   CUTTING THE BACKEND FIRST WOULD HAVE TAKEN THE FEATURES DARK for however long step 2 took, over a
   migration nobody was waiting on. Step 2 is done — the rows came out through the Drive connector,
   337 of them, and were compared cell by cell against what `doGet` was building from the same tabs:
   **337 rows, 0 cells differ**, so the cutover changed nothing anybody could see. `doget.gs` no
   longer reads those tabs, `SCHEMA`, `TAB` and `WHERE` no longer name them, and `LIBRARY_ID` is
   gone from `FILES`, so nothing in this project opens that spreadsheet at all.

   THE `[]` FALLBACK BELOW STAYS AND IS NOW LOAD-BEARING IN ONE DIRECTION ONLY. There is no payload
   copy left to fall back TO — `doGet` sends `boxers: []`, `fights: []` and `cheatsheet: []` and
   nothing fills them — so a file that 404s is three dark screens rather than a quiet reversion.
   That is worse than what it replaces and it is still the right shape: the alternative is a throw
   on a file that has not been deployed yet, which takes the whole of `load()` with it. What it
   costs is written down here so it is not rediscovered as a bug.

   THE FILES HOLD THE SHEET'S OWN COLUMN NAMES — `boxer_id`, `height_cm`, `part_id` — not the
   camelCase the phone reads. That is deliberate and it is what `questions.json` does too: the file
   is a faithful export of the tab, so a person can paste a row in without translating it, and the
   one place that renames a column is the mapping below. Two spellings in two places is how
   `r.link` and `source_url` cost seven silent reads, recorded in CLAUDE.md.
================================================================================================== */
/* ---------- `topics` IS THE FOURTH, AND IT IS A TREE RATHER THAN A TABLE -------------------------
   269 LABELS UNDER 10 ROOTS, with an `aliases` column. It sat unread in `data/archive/` until the
   funnel needed it: the `Topic` facet reads a free-text cell with 389 distinct values in it, folded
   by a spelling vote at runtime, and 343 of them can be on one card. This is the curated version of
   that question -- somebody wrote the tree down, so the app stops guessing. */
/* `practicals` JOINED THIS LIST LAST and is the first entry that is not a boxing row or a
   lookup table: 41 experiments, each naming the library's own topics, so a practical and a
   past-paper question about the same thing answer the same question in the funnel. */
const LIB_EXTRA = ['boxers', 'fights', 'cheatsheet', 'topics', 'practicals'];
let LIBRARY_EXTRA = null;

/* One fetch per tab, all started before this file parsed — see `index.html`. A file that 404s or
   fails answers `[]`, and `libraryExtras_` reads that as "leave the payload's key alone" — which
   since the cut means leaving an empty array alone. See the note above for why that is still the
   right shape now that there is nothing behind it. */
async function libraryExtraRows_() {
  if (LIBRARY_EXTRA) return LIBRARY_EXTRA;
  const out = {};
  /* ---------- AND THE SETTINGS TABS, THROUGH THE SAME MACHINE -----------------------------------
     `SETTINGS_TABS` names them as paths — `settings/brand` is `data/settings/brand.json` — so this
     loop is unchanged and there is one implementation of "fetch a tab, answer [] if it did not
     come". A second copy beside it is the second reader this repository keeps recording, under
     `documents_()`, under `paperIdOf_` and under `factsNow_`.

     READ AT CALL TIME, NOT AT PARSE TIME. `settings.js` loads after this file, so naming
     `SETTINGS_TABS` in the `LIB_EXTRA` literal above would be a temporal-dead-zone throw on every
     load — the shape `d = libraryInto_(…)` already cost this project, where a broken line sat
     inside a `try` and nothing after it in the block could run. */
  const names = LIB_EXTRA.concat(typeof SETTINGS_TABS === 'undefined' ? [] : SETTINGS_TABS);
  await Promise.all(names.map(async name => {
    let rows = null;
    try {
      const early = (window.BOOT_LIB_EXTRA || {})[name] || null;
      if (window.BOOT_LIB_EXTRA) window.BOOT_LIB_EXTRA[name] = null;
      const res = early ? await early : await fetch('data/' + name + '.json', { cache: 'default' });
      if (res && res.ok) rows = await res.json();
    } catch (e) { rows = null; }
    out[name] = Array.isArray(rows) ? rows : [];
  }));
  LIBRARY_EXTRA = out;
  return LIBRARY_EXTRA;
}

/* ---------- THE THREE BLOCKS, MOVED OUT OF `doget.gs` ---------------------------------------------
   Every field name, every guard and every three-state null below WAS the backend's, copied line for
   line rather than rewritten: `mat.js` and the boxing screens were written against those exact keys,
   and a mapping that is nearly the same is worse than one that is obviously the same. That was
   written while both existed and the two had to agree exactly. They no longer both exist — the
   blocks are gone from `doget.gs` and this is the only implementation, so the sentence is now
   history rather than a rule. It is kept because it says why the key names are what they are, which
   is the question the next reader asks about `heightMm` sitting over a column called `height_mm`. */
function libraryExtras_(d, extra) {
  if (!d || !extra) return d;

  /* --- the cheat sheet's components ------------------------------------------------------------
     BLANK IS NOT ZERO and three states are not two. An empty height means "whatever the code says"
     and a typed 0 is a real answer; `in_exam` has to be able to say "nobody has checked" rather
     than saying "no". Both distinctions are the backend's and both are why this is `=== ''` rather
     than a truthiness test. */
  if (extra.cheatsheet && extra.cheatsheet.length) {
    const out = [];
    extra.cheatsheet.forEach(r => {
      const id = libS(r.part_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push({
        id: id, name: libS(r.name), levels: libS(r.levels), tier: libS(r.tier),
        heightMm: libS(r.height_mm) === '' ? null : libN(r.height_mm),
        half: libS(r.half_width) === '' ? null : libOn(r.half_width),
        startOn: libOn(r.start_on),
        inExam: libS(r.in_exam) === '' ? null : libOn(r.in_exam),
        order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
      });
    });
    d.cheatsheet = out;
  }

  /* --- the topic tree --------------------------------------------------------------------------
     PASSED THROUGH AS THE SHEET HAS IT. `topicAreaOf_` in find.js is the only reader and it wants
     the parent links intact, so there is nothing to rename here -- the one mapping this file exists
     to do is a mapping onto keys the phone already reads, and a tree has none. */
  if (extra.topics && extra.topics.length) d.topicTree = extra.topics;

  /* --- the practicals --------------------------------------------------------------------------
     TWO COLUMNS ARE PIPE-SEPARATED AND THAT IS MEASURED, NOT PREFERRED. `asList_` splits on commas
     and is right about `topics` and `keystage`, where no value has ever carried one. It is wrong
     here: 14 of the 410 equipment cells hold a comma INSIDE one item -- "Nichrome wire (about 1 m,
     taped to a metre rule)" is one thing and "Bunsen burner, tripod, gauze, heatproof mat" is four,
     and no comma rule can tell those apart. Nothing in either column holds a pipe.

     `required` IS DERIVED AND NOT STORED. The export carried the same fact twice -- a `category` of
     `required`/`fun` beside a `compliance` naming which of the three states a practical is in --
     and they agreed on all 41 rows, which is luck rather than a guarantee. One cell, read here.
     That is the `needs_print` / `print_required` lesson, which cost 356 rows of disagreement. */
  if (extra.practicals && extra.practicals.length) {
    const out = [];
    extra.practicals.forEach(r => {
      const id = libS(r.practical_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push({
        id: id, name: libS(r.name), subject: libS(r.subject), level: libS(r.level),
        board: libS(r.exam_board), specRef: libS(r.spec_ref),
        compliance: libS(r.compliance),
        /* AN EXACT MATCH, NOT A SUBSTRING, AND THE DIFFERENCE IS FIVE PRACTICALS. The first
           version tested /required practical/ — which is inside `AQA-aligned, NOT A REQUIRED
           PRACTICAL` as well, so the five that say they are not one were flagged as one. The
           check caught it by printing a count that disagreed with the data (33 against 28),
           which is the whole argument for printing counts: nothing threw and the card simply
           told a tutor the exam board demands an experiment it does not. */
        required: libS(r.compliance) === 'AQA required practical',
        topics: libS(r.topics), aim: libS(r.aim), outcome: libS(r.outcome),
        venue: libS(r.venue), feasible: libS(r.feasible),
        groupSize: libN(r.group_size), minutes: libN(r.minutes),
        safety: libS(r.safety), mathsLink: libS(r.maths_link),
        equipment: libS(r.equipment).split('|').map(s => s.trim()).filter(Boolean),
        steps: libS(r.steps).split('|').map(s => s.trim()).filter(Boolean),
        /* THE SHOP JOIN, BY ID, AND NOTHING READS IT YET. 20 of the 41 name the stock they need --
           `I023,I026,I045,I022` is the trundle wheel, the tape measure, the cones and the first aid
           kit. The shop rows live in the Settings spreadsheet, so this stays an id list until they
           are there: a name would be the `findPerson`-by-name fault, and inventing the rows here
           would be a second shop. */
        itemIds: libS(r.item_ids),
        notes: libS(r.notes),
        order: libS(r.sort_order) === '' ? null : libN(r.sort_order),

        /* ---------- THE TEN COLUMNS THE HOME EXPERIMENTS BROUGHT WITH THEM ---------------------
           BLANK ON THE 41 LAB PRACTICALS AND THAT IS NOT A GAP. Nobody has costed a school
           practical because the school owns the kit, and nobody has put a hazard word on one
           because a lab has a technician in it. Every reader below treats absent as absent. */
        ageMin: libNum(r.age_min), hazard: libS(r.hazard), wow: libS(r.wow),
        science: libS(r.science),
        log: libS(r.log).split('|').map(t => t.trim()).filter(Boolean),
        variables: libS(r.variables).split('|').map(t => t.trim()).filter(Boolean),
        /* ---------- A COST OF NOTHING IS NOT THE SAME FACT AS NO COST -------------------------
           `libN('')` IS 0, AND THAT IS THE `cost: 0` FAULT THIS REPOSITORY RECORDS FOUR TIMES —
           `Number(x.price) || 0` made a blank cell a price of nought, and 3,262 of 3,265 items
           answered "Free" on a question that then meant nothing. Measuring car speeds really
           does cost nothing to run; a lab practical has simply never been costed. `libNum`
           answers `null` for the second, and `priced_` upstream already tells a card how to draw
           the difference. */
        costPerRun: libNum(r.cost_per_run_gbp), setupCost: libNum(r.setup_cost_gbp),
        /* AND WHY IT IS NOT DONE, WHERE IT IS NOT DONE. See the note over these rows in
           `check-practicals.js`: an excluded practical is live and carries its reason, because
           `active` means deleted and a decision is not a deletion. */
        excluded: libS(r.excluded_reason),
        reconsiderAt: libNum(r.reconsider_at_age),
      });
    });
    d.practicals = out;
  }

  /* --- the boxers ------------------------------------------------------------------------------ */
  if (extra.boxers && extra.boxers.length) {
    const out = [];
    extra.boxers.forEach(r => {
      if (!libS(r.name) || !libOn(r.active)) return;
      out.push({
        id: libS(r.boxer_id), name: libS(r.name), nickname: libS(r.nickname),
        sex: libS(r.sex), country: libS(r.country), bornIn: libS(r.born_in),
        stance: libS(r.stance), dob: libS(r.dob), dod: libS(r.dod),
        heightCm: libN(r.height_cm), reachCm: libN(r.reach_cm),
        divisions: libS(r.divisions), bestDivision: libS(r.best_division),
        activeFrom: libS(r.active_from), activeTo: libS(r.active_to), status: libS(r.status),
        wins: libN(r.wins), winsKo: libN(r.wins_ko),
        losses: libN(r.losses), lossesKo: libN(r.losses_ko),
        draws: libN(r.draws), noContests: libN(r.no_contests), recordAsOf: libS(r.record_as_of),
        worldTitles: libS(r.world_titles), lineal: libOn(r.lineal),
        hallOfFame: libOn(r.hall_of_fame), ringRank: libS(r.ring_rank),
        promoter: libS(r.promoter), trainer: libS(r.trainer),
        notableWins: libS(r.notable_wins), notableLosses: libS(r.notable_losses),
        image: libS(r.image), notes: libS(r.notes),
      });
    });
    d.boxers = out;
  }

  /* --- the bouts -------------------------------------------------------------------------------
     SORTED OLDEST FIRST, because a rivalry only reads correctly in order — the second fight is an
     answer to the first. Sorted here rather than on each screen so they cannot disagree, which is
     the backend's reason and still the reason. */
  if (extra.fights && extra.fights.length) {
    const out = [];
    extra.fights.forEach(r => {
      if (!libOn(r.active)) return;
      const a = libS(r.boxer_a), b = libS(r.boxer_b);
      if (!a || !b) return;
      out.push({
        id: libS(r.fight_id), rivalryId: libS(r.rivalry_id),
        boutNo: libN(r.bout_no), boutTotal: libN(r.bout_total), series: libS(r.series),
        event: libS(r.event_name),
        aId: libS(r.boxer_a_id), a: a, bId: libS(r.boxer_b_id), b: b,
        /* CUT TO THE DAY HERE, ONCE. A date cell arrives as a timestamp, and the exam wave column
           taught this the hard way — a cell meaning "June 2018" reached the phone as sixty
           characters of clock and timezone and was drawn on a filter button exactly as it came. */
        date: libS(r.date).slice(0, 10),
        venue: libS(r.venue), city: libS(r.city), country: libS(r.country),
        division: libS(r.division), titles: libS(r.titles), rounds: libN(r.scheduled_rounds),
        result: libS(r.result), winnerId: libS(r.winner_id), winner: libS(r.winner),
        method: libS(r.method), endRound: libN(r.end_round),
        scorecards: libS(r.scorecards), attendance: libS(r.attendance), notes: libS(r.notes),
        video: libS(r.video_url) || libS(r.video_search_url),
        verified: libOn(r.verified),
      });
    });
    out.sort((p, q) => libS(p.date).localeCompare(libS(q.date)));
    d.fights = out;
  }

  return d;
}

/* ---------- THE TWO BLOCKS, MOVED OUT OF `doget.gs` ------------------------------------------------
   `d` is the payload as it arrived. Both keys are written onto it before it becomes `DATA`, so
   every reader downstream sees exactly what it saw when the backend built them. */
function libraryInto_(d, rows) {
  if (!d || !Array.isArray(rows)) return d;
  const cfg = (d.constants && d.constants.vars) || {};
  const admin = typeof isAdmin === 'function' && isAdmin();

  /* --- the questions ------------------------------------------------------------------------- */
  const qs = [];
  rows.forEach(r => {
    if (!libS(r.row_id) || !libOn(r.active)) return;
    /* ---------- A DOCUMENT IS NOT A QUESTION, AND IT COMES THROUGH ANYWAY -----------------------
       THIS LINE USED TO SKIP THEM AND IT HAD STOPPED. It tested `kind === 'paper'`, and the rename
       recorded in CLAUDE.md made that value `document` — so the guard has been permanently false
       since, and all 665 document rows have been arriving in `DATA.questions`. The funnel is not
       wrong, because `questionItems` filters `kind !== 'document'` itself; the guard was simply
       dead, wearing a comment describing what it no longer did. Same shape as `resource_type` in
       `VOCAB` and `isEdexcelGcseMaths`, which the same rename also broke in silence.

       SO IT IS DELIBERATE NOW RATHER THAN ACCIDENTAL, because the app needs those rows. A document
       row is where a PAPER-LEVEL fact lives — `needs` carries "No calculator" once per paper
       instead of once per question — and `needsIndex_` in find.js reads them straight out of this
       list. Restoring the skip would have taken that away; leaving a dead line would have left the
       next reader believing the opposite of what happens.

       WHAT STOPS THEM BEING DRAWN is `questionItems`, in one place, where the funnel's own filter
       already is. A document has no text, no marks and no answer, and one arriving as a question
       is the fault this comment was written about. */
    const docRow = norm(r.kind) === 'document';
    qs.push({
      id: libS(r.row_id), paper: libS(r.paper_id),
      sourceId: libS(r.source_id),
      q: libS(r.question), part: libS(r.part), kind: norm(r.kind) || 'question',
      section: libS(r.section), marks: libN(r.marks),
      /* A ROW STANDING IN FOR SOMETHING NOT YET TYPED — see `placeholder` in check-library.js and
         `.qsheet-stem.is-standin` in the stylesheet. A boolean the card reads, not prose it has to
         match against. */
      placeholder: String(r.placeholder) === 'True',
      /* `figure` SAYS WHICH KIND OF PICTURE; `diagram` IS THE PICTURE. `figure` has been on the
         payload since it was written and nothing has ever drawn it, because it was never a
         picture — it is 253 one-word labels (`venn`, `scatter`, `grid-blank`) left by whoever
         transcribed the paper. `diagram` is the column that holds one, as inline SVG rather than a
         URL: a link is a second thing that has to stay alive, and `style.css` has had
         `.qpaper figure svg` and the label classes waiting for it since before anything could
         produce one. Empty on all but two rows today. */
      figure: libS(r.figure), diagram: libS(r.diagram),
      /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — a comma-list, the way `topics` and `keystage` are.
         On a DOCUMENT row it is the paper's own front page ("You must not use a calculator") and
         covers every question inside; on a question row it is what that one question needs on top.
         `needsOf_` in find.js unions the two. See tools/set-needs.py for why it is one column and
         not three booleans. */
      needs: libS(r.needs),
      isDoc: docRow,
      /* ---------- PICTURES THAT ARE PHOTOGRAPHS OR SCANS, NOT DRAWINGS ------------------------
         `diagram` IS INLINE SVG DRAWN HERE and takes the page's own ink; `images` is a list of
         addresses. AQA's Paper 1 Question 5 is the case that asked for it — the writing task offers
         a photograph as one of its two prompts, and a question whose prompt is a picture is not a
         question without it.

         A COMMA-SEPARATED LIST, NOT `image_1`, `image_2`, `image_3`. Numbered columns were the
         obvious shape and they are the one that does not scale: three of them are empty on 4,005
         rows, and the day something needs a fourth is a schema change in the data, the mapping, the
         renderer and the check. `topics` and `keystage` are already comma-lists in this file for
         exactly this reason, and `asList_` has read them since before any of it. */
      images: libS(r.images),
      /* WHO DREW THE PICTURE — absent means it came off the paper, `family` means this site drew it
         because the original's did not survive the text layer. Named here as well as read off
         `row` so the fact travels with the payload object rather than only with the file row; see
         `figCredit_` in find.js for why a question has to say which. */
      diagramBy: libS(r.diagram_by),
      lead: libS(r.lead), html: libS(r.html),
      /* ---------- AN INSERT IS SEVERAL THINGS, AND IT USED TO BE ONE ---------------------------
         AN AQA ENGLISH INSERT IS NOT ONE BLOCK OF PROSE. The paper prints it line-numbered and
         every reading question names a span of it: "lines 1 to 6", "lines 10 to 19", "from line
         20 to the end". One preamble row per paper could hold the whole insert and could not say
         which part of it any question wanted, so a student on Q2 got the entire source and had to
         find lines 10-19 in a row that carries no line numbers at all.

         SO A PREAMBLE IS A LIST NOW, and these are the two columns that make one readable:
         `lines` is the span this part covers, printed as its heading, and `sort_order` is the
         order the paper prints them in. Both are empty on every row that is not an insert part,
         and a single-row preamble needs neither -- which is what keeps this a addition rather
         than a migration. */
      lines: libS(r.lines), order: libN(r.sort_order),
      company: libS(r.company),
      answer: libS(r.answer), answerType: norm(r.answer_type),
      /* WHAT A STUDENT COULD TYPE AND BE RIGHT. `answer` is prose for a tutor -- the value, an
         em dash, then the method -- and "16 &mdash; half it." does not equal "16". See
         tools/set-accept.py for why the two are separate columns rather than one parsed twice. */
      accept: libS(r.accept),
      /* TWO COLUMNS, ONE FACT, AND THEY ARE DISJOINT. `needs_print` is True on 252 rows and
         `print_required` on 104, and **not one row is True in both** — two imports over two
         subsets, neither ever given the other's rows. `find.js` noticed and said so where the
         deleted `Printed?` facet used to be. Unioned here rather than in 356 content rows: a union
         is safe precisely because they are disjoint, so nothing is adjudicated. `printable` is NOT
         folded in — True on 1,287 and a different question, whether a PDF exists to print at all. */
      needsPrint: libTrue(r.needs_print) || libTrue(r.print_required),
      examinerNote: libS(r.examiner_note), examinerReport: libS(r.examiner_report),
      guide: libS(r.guide),
      name: libS(r.name), subject: libS(r.subject),
      documentType: libS(r.document_type), keystage: libS(r.key_stage),
      bandType: libS(r.band_type), bandValue: libS(r.band_value),
      tier: libS(r.tier), examBoard: libS(r.exam_board),
      examWave: libS(r.exam_wave), year: libS(r.year),
      /* ---------- AND THE ROW ITSELF, WHICH COSTS A POINTER --------------------------------------
         THE LIST ABOVE IS AN ENUMERATION AND ENUMERATIONS GO STALE. It names 29 of the file's 44
         columns, so `topics` (2,918 rows), `description`, `level`, `pages`, `source_url` and nine
         others reach the browser inside `LIBRARY_ROWS` and then stop at this function.

         THAT MATTERED THE MOMENT THE `facets` TAB COULD INVENT A QUESTION. `facetFromSheet_` in
         find.js reads `x[field]` and falls back to `x.row[field]` — the original row — which is
         what lets a new column be filterable without a code change. Without this line that fallback
         reached this enumeration rather than the file, so `field: topics` silently found nothing:
         0% coverage, question never offered. Exactly the silent-nothing this app keeps paying for.

         IT IS A REFERENCE, NOT A COPY, and that is a fact about the language rather than something
         measured: `LIBRARY_ROWS` holds these rows for the life of the page anyway, so this stores
         3,265 pointers at the objects already there and duplicates no row data. */
      row: r,
    });
  });
  d.questions = qs;

  /* ---------- THE CHECKLISTS WERE BUILT HERE AND ARE NOT ANY MORE --------------------------------
     THIS PUT THE 642 `kind: 'paper'` ROWS INTO `d.dropdowns.checklists`, nested by subject and then
     by band, which is the shape `doGet` had always sent and `allTopics` in find.js read. `allTopics`
     is gone: the funnel lists questions, not the documents they came out of — see the note above
     `questionItems`.

     SO IT IS DELETED RATHER THAN LEFT BUILDING. A structure computed on every load for nobody is
     weight on every phone, and worse, it is a thing the next person reads and believes is wired up.
     `dropdowns.topics` stays an empty array and `checklists` an empty object, both set by `load()`
     in shell.js, because `check-payload.js` and the fixture still name them and an absent key reads
     differently from an empty one.

     THE ROWS THEMSELVES ARE NOT LOST. They are in `data/questions.json` with everything else, still
     `kind: 'paper'`, still carrying the link, the page count and the print flag. Nothing reads them
     today. Anything that lists documents again reads them from there. */

  return d;
}
