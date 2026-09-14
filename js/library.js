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

/* WHAT A PRINTED COPY COSTS — `printPrice` and `canPrint` from `content.gs`, reading the same two
   config values, which are on the payload as `constants.vars`. A rate of zero means printing is
   OFF rather than free, which is why this returns null and not 0. */
function libPrintPrice_(pages, cfg) {
  const n = libN(pages);
  if (n <= 0) return null;
  const rate = libN(cfg.print_rate_per_page);
  if (rate <= 0) return null;
  const min = libN(cfg.print_minimum);
  return Math.max(min, Math.round(n * rate * 100) / 100);
}
function libCanPrint_(r, cfg) {
  const p = String(r.printable === undefined ? '' : r.printable).toLowerCase().trim();
  if (p === 'false' || p === 'no') return false;
  return libPrintPrice_(r.pages, cfg) !== null;
}

/* ---------- ONE FETCH, STARTED EARLY ---------------------------------------------------------------
   `window.BOOT_LIB` is set by `index.html` before any of this has parsed, for the same reason
   `BOOT_GET` is: the network is the slow part and the parser is not. Null whenever that could not
   happen — no `fetch`, opened from a file, or it simply failed — and then this asks for it itself. */
async function libraryRows_() {
  if (LIBRARY_ROWS) return LIBRARY_ROWS;
  let rows = null;
  try {
    const early = window.BOOT_LIB || null;
    window.BOOT_LIB = null;
    const res = early ? await early : await fetch('data/questions.json', { cache: 'default' });
    if (res && res.ok) rows = await res.json();
  } catch (e) { rows = null; }
  LIBRARY_ROWS = Array.isArray(rows) ? rows : [];
  return LIBRARY_ROWS;
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
    /* A DOCUMENT IS NOT A QUESTION. `kind: 'paper'` is the document itself and belongs in the
       checklists below; without this line all 642 arrive on the Find screen as questions with no
       text, no marks and no answer. */
    if (String(r.kind || '').toLowerCase() === 'paper') return;
    qs.push({
      id: libS(r.row_id), paper: libS(r.paper_id),
      resourceId: libS(r.resource_id),
      q: libS(r.question), part: libS(r.part), kind: norm(r.kind) || 'part',
      section: libS(r.section), marks: libN(r.marks),
      figure: libS(r.figure), lead: libS(r.lead), html: libS(r.html),
      company: libS(r.company),
      answer: libS(r.answer), answerType: norm(r.answer_type),
      needsPrint: libTrue(r.needs_print),
      examinerNote: libS(r.examiner_note), examinerReport: libS(r.examiner_report),
      guide: libS(r.guide),
      name: libS(r.name), subject: libS(r.subject),
      resourceType: libS(r.resource_type), keystage: libS(r.key_stage),
      bandType: libS(r.band_type), bandValue: libS(r.band_value),
      tier: libS(r.tier), examBoard: libS(r.exam_board),
      examWave: libS(r.exam_wave), year: libS(r.year),
    });
  });
  d.questions = qs;

  /* --- the documents, as the checklists ------------------------------------------------------- */
  d.dropdowns = d.dropdowns || {};
  d.dropdowns.topics = d.dropdowns.topics || [];
  const cl = (d.dropdowns.checklists = {});
  const topics = d.dropdowns.topics;

  rows.forEach(r => {
    if (String(r.kind || '').toLowerCase() !== 'paper') return;
    const name = libS(r.name);
    if (!name) return;
    /* A RETIRED DOCUMENT STILL REACHES AN ADMIN, marked, for the same reason a deleted post does:
       it is the only way to switch one back on. 538 of the 642 carry FALSE today, so this line is
       the difference between a student seeing about a hundred and an admin seeing all of them. */
    const live = libOn(r.active);
    if (!live && !admin) return;
    const subject = libS(r.subject) || 'Other';
    const band = libS(r.band_value);
    if (topics.indexOf(name) === -1) topics.push(name);
    cl[subject] = cl[subject] || {};
    cl[subject][band] = cl[subject][band] || { bandField: libS(r.band_type), topics: [] };
    cl[subject][band].topics.push({
      /* THE PAPER'S ID, NOT THE RESOURCE'S — see the note in `doget.gs` where this used to live.
         A question carries only `paper_id`, and 80 documents have no `resource_id` at all. */
      id: libS(r.paper_id) || libS(r.resource_id),
      resourceId: libS(r.resource_id),
      name, rowIndex: 0, link: libS(r.source_url),
      trackable: libTrue(r.trackable),
      resourceType: libS(r.resource_type),
      bandType: libS(r.band_type), bandValue: band,
      day: libS(r.day), month: libS(r.month), year: libS(r.year),
      price: libN(r.price) || 0,
      currency: libS(r.currency) || 'credits',
      level: libN(r.level_required) || 0,
      kind: 'resource',
      grade: libS(r.band_type) === 'grade' ? band : '',
      stage: libS(r.band_type) === 'stage' ? band : '',
      keystage: libS(r.key_stage), examBoard: libS(r.exam_board), company: libS(r.company),
      tier: libS(r.tier),
      paper: libTrue(r.print_required),
      printout: libTrue(r.print_required) ? 'Print out' : '',
      examWave: libS(r.exam_wave),
      pages: libN(r.pages),
      printable: libCanPrint_(r, cfg),
      printPrice: libPrintPrice_(r.pages, cfg),
      active: live,
      /* ---------- THE PASSES ARE NOT IN THIS FILE AND WILL NOT BE ---------------------------------
         `ticks_1..3` HELD THE HANDLES OF REAL CHILDREN and this repository is public. They are
         stripped from `data/questions.json` at source, so these are empty here and `trackable`
         above is whatever the sheet said rather than whatever a tick implies. A tick is a fact
         about a person and a document; it belongs with the people, in `Ledger`. */
      tick1: '', tick2: '', tick3: '',
    });
  });
  return d;
}
