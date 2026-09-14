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
      /* `figure` SAYS WHICH KIND OF PICTURE; `diagram` IS THE PICTURE. `figure` has been on the
         payload since it was written and nothing has ever drawn it, because it was never a
         picture — it is 253 one-word labels (`venn`, `scatter`, `grid-blank`) left by whoever
         transcribed the paper. `diagram` is the column that holds one, as inline SVG rather than a
         URL: a link is a second thing that has to stay alive, and `style.css` has had
         `.qpaper figure svg` and the label classes waiting for it since before anything could
         produce one. Empty on all but two rows today. */
      figure: libS(r.figure), diagram: libS(r.diagram),
      lead: libS(r.lead), html: libS(r.html),
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
