/* @family. — library.js THE QUESTIONS COME FROM THIS REPOSITORY, NOT FROM THE SPREADSHEET. § */

/* THE ROWS AS THEY SIT IN THE FILE — every column of the tab except the three that were private.
   Held raw so `libraryInto_` can be run again against a payload without re-fetching. */
let LIBRARY_ROWS = null;

/* ---------- THE HELPERS THE TWO BLOCKS NEED § */
const libS = v => (v === undefined || v === null ? '' : String(v));
/* ---------- A FINGERPRINT OF AN ANIMATION, SO A CHANGED ONE REPLACES THE COPY A DEVICE KEPT § */
function animHash_(s) {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}
const libN = v => { const n = Number(String(v).replace(/[^0-9.-]/g, '')); return isFinite(n) ? n : 0; };
/* ---------- `libN` BUT ABSENT STAYS ABSENT § */
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

/* ---------- A KIT LIST, SPLIT INTO WHAT THE THING IS AND HOW MUCH OF IT § */
function kitParse_(cell) {
  return libS(cell).split('|').map(s => s.trim()).filter(Boolean).map(item => {
    const at = item.lastIndexOf('\u00d7');
    if (at <= 0) return { name: item, qty: '' };
    const name = item.slice(0, at).trim();
    const qty = item.slice(at + 1).trim();
    return name ? { name: name, qty: qty } : { name: item, qty: '' };
  });
}

/* `libPrintPrice_` AND `libCanPrint_` WERE HERE — what a printed copy costs, computed while the checklists were built so a document arrived with its price on it. § */

/* ---------- ONE FETCH, STARTED EARLY § */
async function libraryRows_() {
  if (LIBRARY_ROWS) return LIBRARY_ROWS;
  let rows = null;
  /* ---------- A FILE THAT DID NOT ARRIVE IS NOT AN EMPTY LIBRARY § */
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

/* THE OTHER THREE TABS OF `Library`, AND BOTH STEPS ARE TAKEN. § */
/* ---------- `topics` WAS THE FOURTH, AND IT IS NOT FETCHED ANY MORE § */
/* `practicals` JOINED THIS LIST LAST and is the first entry that is not a boxing row or a lookup table: § */
/* `projects` IS THE SIXTH, and the practicals' sibling rather than a kind of practical. § */
/* `textbooks` IS THE SEVENTH — "the @family textbook should be bare bones for now and the textbooks will be in the resources tag in the finder." § */
/* `inserts` IS THE EIGHTH: the sheets a candidate is handed in the exam (455), public whole — facts, not library words. */
const LIB_EXTRA = ['boxers', 'fights', 'cheatsheet', 'practicals', 'projects', 'textbooks', 'inserts'];
let LIBRARY_EXTRA = null;

/* One fetch per tab, all started before this file parsed — see `index.html`. § */
async function libraryExtraRows_() {
  if (LIBRARY_EXTRA) return LIBRARY_EXTRA;
  const out = {};
  /* ---------- AND THE SETTINGS TABS, THROUGH THE SAME MACHINE § */
  const names = LIB_EXTRA.concat(typeof SETTINGS_TABS === 'undefined' ? [] : SETTINGS_TABS);
  await Promise.all(names.map(async name => {
    let rows = null;
    try {
      const early = (window.BOOT_LIB_EXTRA || {})[name] || null;
      if (window.BOOT_LIB_EXTRA) window.BOOT_LIB_EXTRA[name] = null;
      /* ---------- WITH THE DEPLOY'S STAMP, AS THE BOXERS ALREADY WERE § */
      const stamp = window.LOAD ? '?t=' + window.LOAD : '';
      const res = early ? await early : await fetch('data/' + name + '.json' + stamp, { cache: 'default' });
      if (res && res.ok) rows = await res.json();
    } catch (e) { rows = null; }
    out[name] = Array.isArray(rows) ? rows : [];
  }));
  LIBRARY_EXTRA = out;
  return LIBRARY_EXTRA;
}

/* ONE PRACTICAL, AS THE CARD READS IT — a function so a row whose words arrive later (397) is mapped again in place. */
function libPractical_(r) {
  const id = libS(r.practical_id).trim();
  return {
    id: id, name: libS(r.name), subject: libS(r.subject), level: libS(r.level),
    board: libS(r.exam_board), specRef: libS(r.spec_ref),
    compliance: libS(r.compliance),
    /* AN EXACT MATCH, NOT A SUBSTRING, AND THE DIFFERENCE IS FIVE PRACTICALS. § */
    required: libS(r.compliance) === 'AQA required practical',
    /* ---------- AN EXPERIMENT OR A THING YOU MAKE § */
    practicalType: libS(r.practical_type),
    topics: libS(r.topics), aim: libS(r.aim), outcome: libS(r.outcome),
    venue: libS(r.venue), feasible: libS(r.feasible),
    groupSize: libN(r.group_size), minutes: libN(r.minutes),
    safety: libS(r.safety), mathsLink: libS(r.maths_link),
    /* ---------- THE KIT, AS A NAME AND A QUANTITY § */
    equipment: kitParse_(libS(r.equipment)),
    steps: libS(r.steps).split('|').map(s => s.trim()).filter(Boolean),
    /* THE SHOP JOIN, BY ID, AND NOTHING READS IT YET. § */
    itemIds: libS(r.item_ids),
    notes: libS(r.notes),
    order: libS(r.sort_order) === '' ? null : libN(r.sort_order),

    /* ---------- THE TEN COLUMNS THE HOME EXPERIMENTS BROUGHT WITH THEM § */
    ageMin: libNum(r.age_min), hazard: libS(r.hazard), wow: libS(r.wow),
    science: libS(r.science),
    log: libS(r.log).split('|').map(t => t.trim()).filter(Boolean),
    variables: libS(r.variables).split('|').map(t => t.trim()).filter(Boolean),
    /* ---------- THE APPARATUS, AS INLINE SVG § */
    diagram: libS(r.diagram),
    /* ---------- THE RISK ASSESSMENT, ONE SENTENCE PER HAZARD § */
    risks: libS(r.risks).split('|').map(t => t.trim()).filter(Boolean),
    /* ---------- A COST OF NOTHING IS NOT THE SAME FACT AS NO COST § */
    costPerRun: libNum(r.cost_per_run_gbp), setupCost: libNum(r.setup_cost_gbp),
    /* AND WHY IT IS NOT DONE, WHERE IT IS NOT DONE. § */
    excluded: libS(r.excluded_reason),
    reconsiderAt: libNum(r.reconsider_at_age),
    /* WHICH PRIVATE FIELDS THE LEDGER HOLDS FOR IT (397) — blank once they are here, or when the file held them all along. */
    libHas: libS(r.lib_has).trim(),
  };
}

/* ONE PROJECT, THE SAME WAY. */
function libProject_(r) {
  const id = libS(r.project_id).trim();
  return {
    id: id, name: libS(r.name), summary: libS(r.summary),
    subject: libS(r.subject), level: libS(r.level),
    ageMin: libNum(r.age_min), ageMax: libNum(r.age_max), sessions: libNum(r.sessions),
    makes: libS(r.makes), topics: libS(r.topics),
    materials: kitParse_(libS(r.materials)),
    steps: libS(r.steps).split('|').map(s => s.trim()).filter(Boolean),
    safety: libS(r.safety), share: libS(r.share),
    order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
    /* ---------- A PROJECT OR A COURSEWORK, ONE COLUMN § */
    projectType: libS(r.project_type).trim().toLowerCase() || 'project',
    board: libS(r.exam_board).trim(), specRef: libS(r.spec_ref).trim(),
    libHas: libS(r.lib_has).trim(),
  };
}

/* A CHAPTER'S THREE LISTS — `name — text`, `[H]` marking a higher-tier line — and which of them the Ledger still holds (397). */
function libTbItem_(s) {
  const t = libS(s).trim(), higher = /^\[H\]\s*/.test(t), body = t.replace(/^\[H\]\s*/, '');
  const at = body.indexOf(' — ');
  return at < 0 ? { name: '', text: body, higher: higher }
                : { name: body.slice(0, at).trim(), text: body.slice(at + 3).trim(), higher: higher };
}
function libChapterBody_(r) {
  const list = v => libS(v).split('|').map(s => s.trim()).filter(Boolean).map(libTbItem_);
  return { words: list(r.words), formulas: list(r.formulas),
           points: list(r.points).map(p => ({ text: (p.name ? p.name + ' — ' : '') + p.text, higher: p.higher })),
           libHas: libS(r.lib_has).trim() };
}

/* ---------- THE THREE BLOCKS, MOVED OUT OF `doget.gs` § */
function libraryExtras_(d, extra) {
  if (!d || !extra) return d;

  /* the cheat sheet's components ------------------------------------------------------------ BLANK IS NOT ZERO and three states are not two. § */
  if (extra.cheatsheet && extra.cheatsheet.length) {
    const out = [];
    extra.cheatsheet.forEach(r => {
      const id = libS(r.part_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push({
        id: id, name: libS(r.name), levels: libS(r.levels), tier: libS(r.tier),
        /* WHICH SUBJECT, for the cheat sheet's subject select — a column of the file like `levels`, and it wins the way `levels` does. § */
        subject: libS(r.subject),
        heightMm: libS(r.height_mm) === '' ? null : libN(r.height_mm),
        half: libS(r.half_width) === '' ? null : libOn(r.half_width),
        startOn: libOn(r.start_on),
        inExam: libS(r.in_exam) === '' ? null : libOn(r.in_exam),
        order: libS(r.sort_order) === '' ? null : libN(r.sort_order),
      });
    });
    d.cheatsheet = out;
  }

  /* --- the topic tree WAS PASSED THROUGH HERE as `d.topicTree`, for `topicAreaOf_`; both went
     with the `Topic area` question. See `topics` WAS THE FOURTH above. */

  /* the practicals -------------------------------------------------------------------------- TWO COLUMNS ARE PIPE-SEPARATED AND THAT IS MEASURED, NOT PREFERRED. § */
  if (extra.practicals && extra.practicals.length) {
    const out = [];
    extra.practicals.forEach(r => {
      const id = libS(r.practical_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push(libPractical_(r));
    });
    d.practicals = out;
  }

  /* the projects ----------------------------------------------------------------------------- THE PRACTICALS' MAPPING, CUT TO WHAT A PROJECT HAS. § */
  if (extra.projects && extra.projects.length) {
    const out = [];
    extra.projects.forEach(r => {
      const id = libS(r.project_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push(libProject_(r));
    });
    d.projects = out;
  }
  /* the textbooks --------------------------------------------------------------------------- ONE ROW PER CHAPTER, GROUPED HERE INTO ONE OBJECT PER BOOK, because a § */
  /* ---------- AND THE CHAPTER'S ANIMATIONS, WHICH ARE ROWS OF THEIR OWN § */
  if (extra.textbooks && extra.textbooks.length) {
    const books = {}, order = [], anims = [];
    extra.textbooks.forEach(r => {
      const id = libS(r.book_id).trim();
      if (!id || !libOn(r.active)) return;
      /* AN ANIMATION IS SET ASIDE until every chapter is read, then hung on its own. */
      if (libS(r.anim).trim()) { anims.push(r); return; }
      if (!books[id]) { books[id] = { id: id, chapters: [] }; order.push(id); }
      const b = books[id], n = libN(r.chapter);
      /* ---------- THE COVER IS THE CHAPTERS' DEFAULTS, AND NOT A CARD ANY MORE § */
      const own = { subject: libS(r.subject).trim(), level: libS(r.level).trim(),
                    keystage: libS(r.keystage).trim(), board: libS(r.board).trim(), spec: libS(r.spec).trim() };
      if (n === 0) {
        Object.assign(b, own, { name: libS(r.title), summary: libS(r.summary) });
        return;
      }
      b.chapters.push(Object.assign({ n: n, title: libS(r.title), higher: /^higher$/i.test(libS(r.tier).trim()), own: own,
                                      topics: libS(r.topics), pending: /^true$/i.test(libS(r.lib_pending).trim()) },
                                    libChapterBody_(r), { animations: [] }));
    });
    /* IN FILE ORDER, which is page order: § */
    anims.forEach(r => {
      const b = books[libS(r.book_id).trim()];
      const c = b && b.chapters.find(ch => ch.n === libN(r.chapter));
      if (!c) return;
      const html = libS(r.html), css = libS(r.css);
      c.animations.push({ id: libS(r.anim).trim(), title: libS(r.title),
                          about: libS(r.about).split('|').map(t => t.trim()).filter(Boolean),
                          html: html, css: css, h: animHash_(html + '\u0000' + css) });
    });
    /* A BOOK WITH NO TITLE PAGE IS NOT A BOOK: it has no name to be found by, so it is left out
       rather than drawn as a blank card. The check refuses the file first. */
    d.textbooks = order.map(id => books[id]).filter(b => b.name)
      .map(b => Object.assign(b, { chapters: b.chapters.sort((p, q) => p.n - q.n).map(c => {
        /* A CHAPTER'S OWN CELL WINS, a blank one takes the cover's. `own` goes once it is read. */
        ['subject', 'level', 'keystage', 'board', 'spec'].forEach(k => { c[k] = c.own[k] || b[k] || ''; });
        c.bookId = b.id;
        delete c.own;
        return c;
      }) }));
  }

  /* the inserts ---------------------------------------------------------------------------- ONE ROW EACH, read whole (455). */
  if (extra.inserts && extra.inserts.length) {
    const list = v => libS(v).split(',').map(t => t.trim()).filter(Boolean);
    d.inserts = extra.inserts.filter(r => r && libS(r.insert_id).trim() && libOn(r.active)).map(r => ({
      id: libS(r.insert_id).trim(), name: libS(r.name), summary: libS(r.summary),
      subject: libS(r.subject).trim(), levels: list(r.level), keystage: libS(r.keystage).trim(),
      boards: list(r.board), tiers: list(r.tier),
      forSubjects: list(r.for_subjects), forLevels: list(r.for_levels), forTiers: list(r.for_tiers),
      verified: libOn(r.verified), verifiedNote: libS(r.verified_note),
      official: Array.isArray(r.official) ? r.official.filter(o => o && o.url) : [],
      sections: Array.isArray(r.sections) ? r.sections : [],
      table: libS(r.table).trim(), elements: Array.isArray(r.elements) ? r.elements : [],
    }));
  }

  /* the boxers ------------------------------------------------------------------------------ ---------- THE RECORD IS `libNum`, NOT `libN`, AND FOURTEEN FIGHTERS § */
  const libLook = v => libS(v).trim().toLowerCase();
  if (extra.boxers && extra.boxers.length) {
    const out = [];
    extra.boxers.forEach(r => {
      if (!libS(r.name) || !libOn(r.active)) return;
      out.push({
        id: libS(r.boxer_id), name: libS(r.name), nickname: libS(r.nickname),
        sex: libS(r.sex), country: libS(r.country), bornIn: libS(r.born_in),
        stance: libS(r.stance), dob: libS(r.dob), dod: libS(r.dod),
        heightCm: libNum(r.height_cm), reachCm: libNum(r.reach_cm),
        divisions: libS(r.divisions), bestDivision: libS(r.best_division),
        activeFrom: libS(r.active_from), activeTo: libS(r.active_to), status: libS(r.status),
        wins: libNum(r.wins), winsKo: libNum(r.wins_ko),
        losses: libNum(r.losses), lossesKo: libNum(r.losses_ko),
        draws: libNum(r.draws), noContests: libNum(r.no_contests), recordAsOf: libS(r.record_as_of),
        worldTitles: libS(r.world_titles), lineal: libTrue(r.lineal),
        hallOfFame: libTrue(r.hall_of_fame), ringRank: libS(r.ring_rank),
        promoter: libS(r.promoter), trainer: libS(r.trainer),
        notableWins: libS(r.notable_wins), notableLosses: libS(r.notable_losses),
        image: libS(r.image).trim(), imageCredit: libS(r.image_credit).trim(), notes: libS(r.notes),
        look: { skin: libLook(r.look_skin), hair: libLook(r.look_hair),
                hairColour: libLook(r.look_hair_colour), facial: libLook(r.look_facial) },
        trunks: libLook(r.trunks_usual),
      });
    });
    d.boxers = out;
  }

  /* the bouts ------------------------------------------------------------------------------- SORTED OLDEST FIRST, because a rivalry only reads correctly in order § */
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
        /* CUT TO THE DAY HERE, ONCE. § */
        date: libS(r.date).slice(0, 10),
        venue: libS(r.venue), city: libS(r.city), country: libS(r.country),
        division: libS(r.division), titles: libS(r.titles), rounds: libN(r.scheduled_rounds),
        result: libS(r.result), winnerId: libS(r.winner_id), winner: libS(r.winner),
        method: libS(r.method), endRound: libN(r.end_round),
        scorecards: libS(r.scorecards), attendance: libS(r.attendance), notes: libS(r.notes),
        video: libS(r.video_url) || libS(r.video_search_url),
        verified: libOn(r.verified),
        /* THE TRUNKS EACH CORNER WORE THAT NIGHT, where a source names them — the fight card dresses each fighter in these and in nothing else (`boxerPic_`). § */
        trunksA: libLook(r.trunks_a), trunksB: libLook(r.trunks_b),
      });
    });
    out.sort((p, q) => libS(p.date).localeCompare(libS(q.date)));
    d.fights = out;
  }

  return d;
}

/* ONE QUESTION ROW, AS THE APP READS IT — a function so a row whose words arrive later (397) is mapped again in place. */
function libQuestion_(r) {
  /* ---------- A DOCUMENT IS NOT A QUESTION, AND IT COMES THROUGH ANYWAY § */
  const docRow = norm(r.kind) === 'document';
  return {
    id: libS(r.row_id), paper: libS(r.paper_id),
    sourceId: libS(r.source_id),
    q: libS(r.question), part: libS(r.part), kind: norm(r.kind) || 'question',
    section: libS(r.section), marks: libN(r.marks),
    /* A ROW STANDING IN FOR SOMETHING NOT YET TYPED — see `placeholder` in check-library.js and
       `.qsheet-stem.is-standin` in the stylesheet. A boolean the card reads, not prose it has to
       match against. */
    placeholder: String(r.placeholder) === 'True',
    /* `figure` SAYS WHICH KIND OF PICTURE; `diagram` IS THE PICTURE. § */
    figure: libS(r.figure), diagram: libS(r.diagram),
    /* WHAT YOU HAVE TO HAVE IN FRONT OF YOU — a comma-list, the way `topics` and `keystage` are. § */
    needs: libS(r.needs),
    isDoc: docRow,
    /* ---------- PICTURES THAT ARE PHOTOGRAPHS OR SCANS, NOT DRAWINGS § */
    images: libS(r.images),
    /* `diagramBy` WAS HERE, read for the credit line under a redrawn picture. The line went on 18 Oct
       (docs/history/355); `diagram_by` stays on the row as provenance and nothing on screen reads it. */
    lead: libS(r.lead), html: libS(r.html),
    /* ---------- AN INSERT IS SEVERAL THINGS, AND IT USED TO BE ONE § */
    lines: libS(r.lines), order: libN(r.sort_order),
    company: libS(r.company),
    answer: libS(r.answer), answerType: norm(r.answer_type),
    /* ---------- WHAT A MARK IS MADE ON, WHEN THE ANSWER IS A MARK § */
    surface: norm(r.surface),
    /* WHICH EARLIER PART'S DRAWING THIS ONE NEEDS IN FRONT OF IT -- `b` on "Use your graph to find estimates" after (b) drew the graph. § */
    uses: libS(r.uses),
    /* WHAT A STUDENT COULD TYPE AND BE RIGHT. § */
    accept: libS(r.accept),
    /* THE BLANKS OF A GRID OR TABLE, `;` between cells, `|` between ways, `-` a blank not asked (find.js, `cellsOf_`). */
    cells: libS(r.cells),
    /* KEY WORDS THAT MARK A SHORT WORDED ANSWER WITHOUT AI (find.js, `markWords_`). */
    markWords: libS(r.mark_words),
    /* THE EXPECTED DRAWING AS GEOMETRY (find.js, `drawMarker_`, 366). */
    drawAnswer: libS(r.draw_answer),
    /* A CLOSED LIST OF OPTIONS, TAPPED RATHER THAN TYPED. § */
    choices: libS(r.choices).split('|').map(t => t.trim()).filter(Boolean),
    /* ---------- AN ORDERING IS THE SAME TWO COLUMNS AND ONE MORE § */
    choiceRight: libS(r.choice_right).split('|')[0].split(',').map(t => parseInt(t, 10)).filter(n => n > 0),
    choiceWays: libS(r.choice_right).split('|')
      .map(w => w.split(',').map(t => parseInt(t, 10)).filter(n => n > 0)).filter(w => w.length),
    orderEnds: libS(r.order_ends).split('|').map(t => t.trim()).filter(Boolean),
    /* TWO COLUMNS, ONE FACT, AND THEY ARE DISJOINT. § */
    needsPrint: libTrue(r.needs_print) || libTrue(r.print_required),
    examinerNote: libS(r.examiner_note), examinerReport: libS(r.examiner_report),
    guide: libS(r.guide),
    name: libS(r.name), subject: libS(r.subject),
    documentType: libS(r.document_type), keystage: libS(r.key_stage),
    bandType: libS(r.band_type), bandValue: libS(r.band_value),
    tier: libS(r.tier), examBoard: libS(r.exam_board),
    examWave: libS(r.exam_wave), year: libS(r.year),
    /* ---------- AND THE ROW ITSELF, WHICH COSTS A POINTER § */
    row: r,
    /* WHICH PRIVATE FIELDS THE LEDGER STILL HOLDS FOR THIS ROW (397): blank once they are here, or when the file held them. */
    libHas: libS(r.lib_has).trim(),
  };
}

/* ---------- THE TWO BLOCKS, MOVED OUT OF `doget.gs` § */
function libraryInto_(d, rows) {
  if (!d || !Array.isArray(rows)) return d;
  const cfg = (d.constants && d.constants.vars) || {};
  /* `const admin = isAdmin()` WAS HERE, declared and never read. § */

  /* --- the questions ------------------------------------------------------------------------- */
  const qs = [];
  rows.forEach(r => {
    if (!libS(r.row_id) || !libOn(r.active)) return;
    qs.push(libQuestion_(r));
  });
  d.questions = qs;

  /* ---------- THE CHECKLISTS WERE BUILT HERE AND ARE NOT ANY MORE § */

  return d;
}

/* `paperHealth_` WAS HERE: the paper health score went in 388; a question carries Accuracy and Function tags (find.js `verifyTags_`). */

/* ================= THE LIBRARY'S PRIVATE HALF, ASKED FOR AS IT IS OPENED (397) =================
   `lib_has` names a row's fields the Ledger holds; they arrive onto the row, kept for the visit, gone at sign-out. */
const LIB = { pending: new Set(), flying: new Set(), gone: new Set(), refused: new Set(), failed: '',
              timer: 0, filled: new Set(), gen: 0, ahead: 0, disk: null, diskP: null, ledger: '' };
/* AT MOST THIS MANY IN ONE ASK — the backend's `LIB_PER_CALL`. */
const LIB_PER_ASK = 60;
/* WORDS AHEAD OF THE READER (447): when fewer than LIB_AHEAD cards past the one in front are whole or on their way,
   the next LIB_AHEAD_BATCH are asked for in one call — a few calls a list, each landing well before its cards. */
const LIB_AHEAD = 10;
const LIB_AHEAD_BATCH = 24;
/* THE DEVICE'S COPY (447): this many items at most, in IndexedDB, for the signed-in person and one Ledger generation. */
const LIB_DISK_MAX = 800;
const LIB_DISK_DB = 'family-lib';

/* STILL WAITING: a file row (`lib_has`) or a mapped object (`libHas`) whose private fields have not arrived. */
const libWaits_ = o => !!o && libS(o.lib_has !== undefined ? o.lib_has : o.libHas).trim() !== '';
/* WHETHER A FIELD IS THERE OR ON ITS WAY — the test a card's shape is decided by before its words come. */
function libHasField_(o, f) {
  if (!o) return false;
  if (libS(o[f]).trim()) return true;
  return (' ' + libS(o.lib_has !== undefined ? o.lib_has : o.libHas) + ' ').indexOf(' ' + f + ' ') !== -1;
}
/* A ROW'S ID ON THE WIRE (backend LIB_FILES): `q:` a question row, `ct:` a content card, `pr:` a practical, `pj:` a project. */
const libWireQ_ = r => 'q:' + libS(r && (r.row_id || r.id)).trim();

/* THE FILE'S ROWS AND THE MAPPED OBJECTS, BY ID — built once per list, because a merge looks up a few dozen of ten thousand. */
const LIB_INDEX = new WeakMap();
function libIndexOf_(list, idOf) {
  if (!Array.isArray(list)) return new Map();
  let m = LIB_INDEX.get(list);
  if (!m) { m = new Map(); list.forEach(o => { const k = idOf(o); if (k && !m.has(k)) m.set(k, o); }); LIB_INDEX.set(list, m); }
  return m;
}

/* ASK FOR THESE (typed ids), a moment from now, with whatever else is asked in the same turn. Nobody signed in: nothing. */
function libAsk_(ids) {
  if (typeof USER === 'undefined' || !USER || !USER.token) return;
  (ids || []).forEach(t => { if (t && !LIB.flying.has(t) && !LIB.gone.has(t) && !LIB.refused.has(t)) LIB.pending.add(t); });
  if (!LIB.pending.size || LIB.timer || LIB.failed) return;
  LIB.timer = setTimeout(libPump_, 0);
}
function libPump_() {
  LIB.timer = 0;
  if (typeof USER === 'undefined' || !USER || !USER.token || !LIB.pending.size) return;
  /* THE DEVICE'S COPY FIRST — read once a visit; whatever it holds for this Ledger is merged now and never asked for. */
  if (!LIB.disk) {
    if (!LIB.diskP) LIB.diskP = libDiskLoad_().then(() => { if (!LIB.timer) LIB.timer = setTimeout(libPump_, 0); });
    return;
  }
  libFromDisk_();
  if (!LIB.pending.size) return;
  const ids = [...LIB.pending].slice(0, LIB_PER_ASK);
  ids.forEach(t => { LIB.pending.delete(t); LIB.flying.add(t); });
  const who = USER.token;
  send({ action: 'libItems', personId: USER.personId || '', ids: ids })
    .then(d => {
      if (!USER || USER.token !== who) return;
      libMerge_((d && d.items) || {});
      libDiskPut_((d && d.items) || {}, d && d.gen);
      ((d && d.missing) || []).forEach(t => LIB.gone.add(t));
      ((d && d.refused) || []).forEach(t => LIB.refused.add(t));
      if (d && d.refused && d.refused.length) LIB.failed = 'That is today’s ' + (d.cap || 'share') + ' — the rest open tomorrow.';
    })
    .catch(err => {
      if (!USER || USER.token !== who) return;
      LIB.failed = libWhyNot_(err);
      if (err && err.reply && err.reply.why === 'lib-cap') ids.forEach(t => LIB.refused.add(t));
      else ids.forEach(t => LIB.pending.add(t));
    })
    .then(() => {
      ids.forEach(t => LIB.flying.delete(t));
      libLanded_();
      if (LIB.pending.size && !LIB.failed) LIB.timer = setTimeout(libPump_, 0);
    });
}

/* ---------- THE DEVICE'S COPY OF THE WORDS (447) ----------
   { id, gen, who, at, item } per wire id, read only for this person and the Ledger's `libGen`, so an import never shows old words. */
function libLedgerGen_() {
  return String(LIB.ledger || (typeof DATA !== 'undefined' && DATA && DATA.libGen) || '');
}
/* THE STORE: IndexedDB here; anything with the same three promises stands in for it in a check. Null when there is none. */
function libDisk_() {
  try {
    if (typeof indexedDB === 'undefined' || !indexedDB) return null;
    const open = () => new Promise((ok, no) => {
      const rq = indexedDB.open(LIB_DISK_DB, 1);
      rq.onupgradeneeded = () => { try { rq.result.createObjectStore('items', { keyPath: 'id' }); } catch (e) {} };
      rq.onsuccess = () => ok(rq.result);
      rq.onerror = () => no(rq.error);
    });
    const tx = (mode, fn) => open().then(db => new Promise((ok, no) => {
      const t = db.transaction('items', mode), st = t.objectStore('items');
      const out = fn(st);
      t.oncomplete = () => { ok(out && out.result); db.close(); };
      t.onerror = t.onabort = () => { no(t.error); db.close(); };
    }));
    return {
      all: () => tx('readonly', st => st.getAll()),
      put: recs => tx('readwrite', st => { recs.forEach(r => st.put(r)); }),
      drop: ids => tx('readwrite', st => { ids.forEach(id => st.delete(id)); }),
      clear: () => tx('readwrite', st => { st.clear(); }),
    };
  } catch (e) { return null; }
}
/* READ ONCE A VISIT into `LIB.disk`; records for another person or another generation are dropped from the device. */
function libDiskLoad_() {
  const disk = libDisk_();
  if (!disk) { LIB.disk = new Map(); return Promise.resolve(); }
  return Promise.resolve().then(() => disk.all()).then(recs => {
    const m = new Map(), stale = [], who = (USER && USER.personId) || '', gen = libLedgerGen_();
    (recs || []).forEach(r => { if (r && r.id && r.who === who && (!gen || r.gen === gen)) m.set(r.id, r); else if (r && r.id) stale.push(r.id); });
    LIB.disk = m;
    if (stale.length) try { disk.drop(stale).catch(() => {}); } catch (e) {}
  }).catch(() => { LIB.disk = new Map(); });
}
/* WHAT THE DEVICE ALREADY HOLDS, off the pending list and onto the rows — only for the generation known now. */
function libFromDisk_() {
  const gen = libLedgerGen_(), who = (USER && USER.personId) || '';
  if (!gen || !LIB.disk || !LIB.disk.size) return;
  const hit = {};
  [...LIB.pending].forEach(t => { const r = LIB.disk.get(t); if (r && r.gen === gen && r.who === who && r.item) { hit[t] = r.item; LIB.pending.delete(t); } });
  if (!Object.keys(hit).length) return;
  libMerge_(hit);
  if (typeof libLanded_ === 'function') libLanded_();
}
/* WHAT CAME BACK, KEPT. A reply from a newer generation is the Ledger's word: everything older leaves the device. */
function libDiskPut_(items, gen) {
  try {
    const g = String(gen || libLedgerGen_() || '');
    if (!g || !LIB.disk) return;
    const disk = libDisk_();
    if (g !== libLedgerGen_() || [...LIB.disk.values()].some(r => r.gen !== g)) {
      const old = [...LIB.disk.values()].filter(r => r.gen !== g).map(r => r.id);
      old.forEach(id => LIB.disk.delete(id));
      if (disk && old.length) disk.drop(old).catch(() => {});
    }
    LIB.ledger = g;
    const who = (USER && USER.personId) || '', now = Date.now();
    const recs = Object.keys(items || {}).map(id => ({ id: id, gen: g, who: who, at: now, item: items[id] }));
    if (!recs.length) return;
    recs.forEach(r => LIB.disk.set(r.id, r));
    let drop = [];
    if (LIB.disk.size > LIB_DISK_MAX) {
      drop = [...LIB.disk.values()].sort((a, b) => a.at - b.at).slice(0, LIB.disk.size - LIB_DISK_MAX).map(r => r.id);
      drop.forEach(id => LIB.disk.delete(id));
    }
    if (disk) { disk.put(recs).catch(() => {}); if (drop.length) disk.drop(drop).catch(() => {}); }
  } catch (e) {}
}
/* SIGNED OUT: the device forgets every word too. */
function libDiskClear_() {
  LIB.disk = null; LIB.diskP = null; LIB.ledger = '';
  try { const disk = libDisk_(); if (disk) disk.clear().catch(() => {}); } catch (e) {}
}

/* WHY THE WORDS DID NOT COME, said plainly (432): a live backend older than `libItems` is a deploy for an admin, a wait for anyone else. */
function libWhyNot_(err) {
  const why = String((err && err.message) || err || '');
  if (/does not have `libItems`|unknown action/i.test(why)) {
    return (typeof rankAtLeast_ === 'function' && rankAtLeast_('admin'))
      ? 'The library needs the latest backend — deploy it.' : 'The library is being updated — try again later.';
  }
  return why || 'the library did not answer';
}
/* ONE ROW'S FIELDS, BACK ON THE FILE'S ROW — remembered, so a sign-out can take them off again. */
function libFill_(r, c) {
  if (!r || !c) return;
  const keys = Object.keys(c);
  keys.forEach(k => { r[k] = c[k]; });
  if (!LIB.filled.has(r)) { r.__libHas = r.lib_has; r.__libKeys = keys; }
  else r.__libKeys = [...new Set((r.__libKeys || []).concat(keys))];
  delete r.lib_has;
  LIB.filled.add(r);
}
/* WHAT ARRIVED, ON THE ROWS AND ON EVERY OBJECT MADE FROM THEM — in place, so every list and memo holding them sees it. */
function libMerge_(items) {
  const ids = Object.keys(items || {});
  if (!ids.length) return;
  const ex = (typeof LIBRARY_EXTRA !== 'undefined' && LIBRARY_EXTRA) || {};
  const D = (typeof DATA !== 'undefined' && DATA) || {};
  ids.forEach(t => {
    const c = items[t], m = /^(q|ct|pr|pj):(.+)$/.exec(t);
    if (!m || !c || typeof c !== 'object') return;
    const id = m[2];
    if (m[1] === 'q') {
      const r = libIndexOf_(LIBRARY_ROWS, o => libS(o.row_id)).get(id);
      if (!r) return;
      libFill_(r, c);
      const q = libIndexOf_(D.questions, o => libS(o.id)).get(id);
      if (q) Object.assign(q, libQuestion_(r));
      if (typeof questionContent_ === 'function' && typeof libItemByKey_ === 'function') {
        const it = libItemByKey_('q:' + id);
        if (it && q) Object.assign(it, questionContent_(q));
      }
    } else if (m[1] === 'pr' || m[1] === 'pj') {
      const col = m[1] === 'pr' ? 'practical_id' : 'project_id';
      const r = libIndexOf_(ex[m[1] === 'pr' ? 'practicals' : 'projects'], o => libS(o[col]).trim()).get(id);
      if (!r) return;
      libFill_(r, c);
      const p = libIndexOf_(D[m[1] === 'pr' ? 'practicals' : 'projects'], o => libS(o.id)).get(id);
      if (p) Object.assign(p, m[1] === 'pr' ? libPractical_(r) : libProject_(r));
    } else {
      const r = libIndexOf_(ex.textbooks, o => (libS(o.anim).trim() ? '' : libS(o.book_id).trim() + '#' + libS(o.chapter).trim())).get(id);
      if (!r) return;
      libFill_(r, c);
      const at = id.lastIndexOf('#');
      const b = (D.textbooks || []).find(x => x.id === id.slice(0, at));
      const ch = b && (b.chapters || []).find(x => String(x.n) === String(libN(id.slice(at + 1))));
      if (ch) Object.assign(ch, libChapterBody_(r));
    }
  });
  LIB.gen++;
}

/* ---------- SIGNED OUT: THE WORDS GO WITH THE PERSON ---------- */
function libForget_() {
  const D = (typeof DATA !== 'undefined' && DATA) || {};
  LIB.filled.forEach(r => {
    (r.__libKeys || []).forEach(k => { delete r[k]; });
    r.lib_has = r.__libHas;
    delete r.__libHas; delete r.__libKeys;
    try {
      if (r.row_id !== undefined) {
        const q = libIndexOf_(D.questions, o => libS(o.id)).get(libS(r.row_id));
        if (q) Object.assign(q, libQuestion_(r));
      } else if (r.practical_id !== undefined) {
        const p = libIndexOf_(D.practicals, o => libS(o.id)).get(libS(r.practical_id).trim());
        if (p) Object.assign(p, libPractical_(r));
      } else if (r.project_id !== undefined) {
        const p = libIndexOf_(D.projects, o => libS(o.id)).get(libS(r.project_id).trim());
        if (p) Object.assign(p, libProject_(r));
      } else if (r.book_id !== undefined) {
        const b = (D.textbooks || []).find(x => x.id === libS(r.book_id).trim());
        const ch = b && (b.chapters || []).find(x => x.n === libN(r.chapter));
        if (ch) Object.assign(ch, libChapterBody_(r));
      }
    } catch (e) {}
  });
  LIB.filled.clear(); LIB.pending.clear(); LIB.flying.clear(); LIB.gone.clear(); LIB.refused.clear();
  LIB.failed = '';
  libDiskClear_();
  clearTimeout(LIB.timer); LIB.timer = 0;
  LIB.gen++;
}

/* TRY AGAIN: whatever failed is asked for again, and the cards waiting say so. Online again is a Try again by itself. */
function libRetry_() {
  LIB.failed = '';
  LIB.refused.clear();
  if (typeof libLanded_ === 'function') libLanded_();
  if (LIB.pending.size && !LIB.timer) LIB.timer = setTimeout(libPump_, 0);
}
try { window.addEventListener('online', () => { if (LIB.failed) libRetry_(); }); } catch (e) {}
