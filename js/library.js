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
const LIB_EXTRA = ['boxers', 'fights', 'cheatsheet', 'practicals', 'projects', 'textbooks'];
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
      out.push({
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
      });
    });
    d.practicals = out;
  }

  /* the projects ----------------------------------------------------------------------------- THE PRACTICALS' MAPPING, CUT TO WHAT A PROJECT HAS. § */
  if (extra.projects && extra.projects.length) {
    const out = [];
    extra.projects.forEach(r => {
      const id = libS(r.project_id).trim();
      if (!id || !libOn(r.active)) return;
      out.push({
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
      });
    });
    d.projects = out;
  }

  /* the textbooks --------------------------------------------------------------------------- ONE ROW PER CHAPTER, GROUPED HERE INTO ONE OBJECT PER BOOK, because a § */
  /* ---------- AND THE CHAPTER'S ANIMATIONS, WHICH ARE ROWS OF THEIR OWN § */
  if (extra.textbooks && extra.textbooks.length) {
    const books = {}, order = [], anims = [];
    const item = s => {
      const t = libS(s).trim(), higher = /^\[H\]\s*/.test(t), body = t.replace(/^\[H\]\s*/, '');
      const at = body.indexOf(' — ');
      return at < 0 ? { name: '', text: body, higher: higher }
                    : { name: body.slice(0, at).trim(), text: body.slice(at + 3).trim(), higher: higher };
    };
    const list = v => libS(v).split('|').map(s => s.trim()).filter(Boolean).map(item);
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
      b.chapters.push({ n: n, title: libS(r.title), higher: /^higher$/i.test(libS(r.tier).trim()), own: own,
                        topics: libS(r.topics), words: list(r.words), formulas: list(r.formulas),
                        points: list(r.points).map(p => ({ text: (p.name ? p.name + ' — ' : '') + p.text,
                                                           higher: p.higher })),
                        animations: [] });
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

/* ---------- THE TWO BLOCKS, MOVED OUT OF `doget.gs` § */
function libraryInto_(d, rows) {
  if (!d || !Array.isArray(rows)) return d;
  const cfg = (d.constants && d.constants.vars) || {};
  /* `const admin = isAdmin()` WAS HERE, declared and never read. § */

  /* --- the questions ------------------------------------------------------------------------- */
  const qs = [];
  rows.forEach(r => {
    if (!libS(r.row_id) || !libOn(r.active)) return;
    /* ---------- A DOCUMENT IS NOT A QUESTION, AND IT COMES THROUGH ANYWAY § */
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
    });
  });
  d.questions = qs;

  /* ---------- THE CHECKLISTS WERE BUILT HERE AND ARE NOT ANY MORE § */

  return d;
}

/* `paperHealth_` WAS HERE: the paper health score went in 388; a question carries Accuracy and Function tags (find.js `verifyTags_`). */
