/* ==================================================================================================
   @family. — js/mat.js   (19 of 20)

   THE CHEAT SHEET MAKER — one sheet of A4, built from components you tick, printed from the app.

   IT IS STILL `mat.js`, AND THE IDS ARE STILL `mat-`. The name on the screen changed; the filename
   is listed in `index.html` and in six checkers, and the ids are matched by `check-css` and
   `check-scope`, so renaming the file to match the label would be a rename in nine places to fix
   nothing a person can see. What the tool is called and what the file is called are allowed to be
   different things.

   IT WAS A SEPARATE FILE and the reason to bring it in is the same as the flyers: a second file is
   a second thing to deploy, and its list of levels was a copy of the one already in the sheet.
   `DATA.dropdowns` carries the real ones — SATs, 11+, GCSE and the rest — so the mat can offer
   exactly the levels the rest of the site knows about, and a level added there arrives here.

   THE THING THAT MAKES IT WORK IS THE GAUGE. A4 has 262mm of usable column and the components add
   to far more, so a picker with only tickboxes would let somebody build a mat that runs off the
   bottom of the page — and they would find out at the printer, with the last thing they ticked
   silently cut off. The gauge MEASURES the rendered column rather than adding up a table of
   numbers, because two half-width blocks side by side cost the taller of them and no table can
   know which pairs got ticked.
================================================================================================== */

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. Measured on the real sheet, not
   derived from 297 minus some margins — the header and foot are content and their height is
   whatever the font makes it. */
const MAT_ROOM = 262;

/* ---------- THE SECOND FILTER, AND WHY LEVEL ALONE WAS NOT ENOUGH -------------------------------
   HALF THE GCSE COMPONENTS ARE HIGHER-ONLY. Exact trig values, negative and fractional indices,
   sphere and cone, perpendicular gradients, cubic and reciprocal graphs — a Foundation student
   handed a sheet carrying those gets a page of things that cannot come up, at the cost of the room
   the things that can would have taken. Tagging them 'GCSE' and stopping was the whole problem:
   the level says which exam, and nothing said which paper.

   ONLY SOME LEVELS ARE TIERED, which is why this is a list and not a flag on every level. A tier
   picker showing on SATs is a question with no answer, so it appears for these and nowhere else.

   AND HIGHER CONTAINS FOUNDATION. That is what makes two buttons enough rather than three: Higher
   is already the everything view, so 'H' is the default and the opening sheet is what it always
   was. Foundation is the one that takes things away. */
const MAT_TIERED = ['Y9 Mocks', 'GCSE'];

/* WHICH BUTTON IS PRESSED, and separately WHICH TIER IS BEING DRAWN. They are not the same: on an
   untiered level nothing should be filtered, so the drawn tier is 'H' whatever the button says —
   and the button has to keep saying what it said, or choosing Foundation, looking at A-level and
   coming back would silently promote the sheet. */
let MAT_TIER = 'H';
let MAT_SHOW = 'H';

/* Does this row survive the tier being drawn? A flag of 'H' means Higher only; anything else — and
   that is most rows — means it is on both papers. */
const matKeep = flag => flag !== 'H' || MAT_SHOW === 'H';

/* Each component: what it is called, which levels it suits, what it costs in millimetres, and
   whether it sits half-width so it can pair with the next one.
   THE HEIGHTS ARE MEASURED. The first set were estimates and the gauge was wrong by 300mm — a
   gauge that lies is worse than none, since it is the only thing between a tickbox and a wasted
   sheet. Each was rendered alone and measured. */
/* WHAT PUTS A COMPONENT UNDER A LEVEL, since the first set were tagged by which exam the topic
   belongs to and that is the wrong question. The right one: would somebody sitting THAT exam still
   be getting this wrong? A level therefore inherits what it has not yet stopped forgetting, and
   drops what it has — which is why exact trig values reach A-level and times tables do not.

   AND THE TAGS HAVE TO MATCH THE SHEET'S WORDS EXACTLY. `matLevels()` reads the option list from
   the sheet and these are compared with `indexOf`, so a level written "A-Level" there and 'Alevel'
   here is not a mismatch anybody sees — it is a picker that comes up empty, which reads as a level
   nothing was ever built for.

   THIS IS NOW THE FALLBACK, NOT THE SOURCE. The `cheatsheet` tab owns the name, the levels, the
   tier, the height, the pairing and the order; `matParts()` merges its rows over this list. What is
   written here is what a component looks like to somebody who has never opened the sheet — which is
   also what it looks like before `?setup=1` has been run, so it has to be right rather than blank.
   THE DRAWINGS STAY IN CODE, in `MAT_HTML` below, keyed by these ids. An id is the join between a
   row and a function, which is why they are dull: M02 names a function, not a hundred-square. */
const MAT_PARTS = [
  /* ---------- THE RULER IS A COMPONENT LIKE ANY OTHER ----------------------------------------------
     IT WAS ALWAYS THERE, drawn straight into the sheet and impossible to switch off, which made it
     the one thing on a cheat sheet nobody could choose. Fine for a maths mat; wrong the moment the
     sheet stopped being only that — a revision sheet of formulae does not want a centimetre scale
     down its edge, and a flyer never did.

     `edge: true` MEANS IT LIVES IN THE MARGIN, NOT THE COLUMN. Every other component takes height
     from the 262mm the gauge is counting; this one takes width from the left margin instead. So it
     costs 0 against the budget, which is not a fiddle — it genuinely uses none of the space the
     other pieces are competing for. */
  { id: 'M01', name: 'Ruler down the edge', lv: [], h: 0, half: false, edge: true },
  { id: 'M02', name: 'Number square',      lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 94,  half: true },
  { id: 'M03', name: 'Times tables',       lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 100, half: true },
  { id: 'M04', name: 'Number line',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 20,  half: false },
  { id: 'M05', name: 'Place value',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 15,  half: true },
  /* MEASURES AND FRACTION=DECIMAL REACH B-TEC. Unit conversion and percentages are most of what an
     applied course asks arithmetically, and it was tagged as though B-TEC were a level above them
     rather than the one course that uses them every week. */
  { id: 'M06', name: 'Measures',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 39,  half: true },
  { id: 'M07', name: 'Angles named',       lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 28,  half: true },
  { id: 'M08', name: 'Protractor',         lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 54,  half: true },
  { id: 'M09', name: '2D shapes',          lv: ['SATs','11+','Y2 Mocks'],                    h: 35,  half: false },
  { id: 'M10', name: 'Roman numerals',     lv: ['SATs','11+'],                               h: 13,  half: true },
  { id: 'M11', name: 'Fraction = decimal', lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 15,  half: true },
  /* NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS. "Formulae not given" names a GCSE exam
     convention, and every line in it — circle, sphere, cone, prism, compound measures, percentage
     change, compound interest — is GCSE content that Y9 mocks and B-TEC both examine. An A-level
     student has a different booklet and does not consult this one. */
  { id: 'M12', name: 'Formulae not given', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 49,  half: true },
  { id: 'M13', name: 'Exact trig values',  lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H' },
  { id: 'M14', name: 'The trig trick',     lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H' },
  /* INDEX LAWS AND GRAPH SHAPES START AT Y9. Both are Y8/Y9 teaching, and both were tagged from
     GCSE up while the straight line beside them started at Y9 — the same year, three rows apart,
     disagreeing about when algebra begins. */
  { id: 'M15', name: 'Index laws',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 21,  half: true },
  { id: 'M16', name: 'Graph shapes',       lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 40,  half: false },
  /* AS BUT NOT ALEVEL was the clearest error in the table: A-level contains everything AS does, so
     a component offered to the first year and withheld from the second cannot be right either way
     round. B-TEC too — gradient is how every rate-of-change task on an applied course is read. */
  { id: 'M17', name: 'Straight line',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 29,  half: true },
  { id: 'M18', name: 'Averages',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 24,  half: true },
  /* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file.
     A wrap model calibrated on the four hand-measured pair blocks still came out between 15% and
     70% low, because how far a row wraps depends on the exact string. They are scaled up from it
     and should be read as indicative — the gauge measures the real column, so a sheet cannot
     overrun on the strength of a wrong label, but a label can still tell you 28mm and cost 40. */
  { id: 'M19', name: 'Pythagoras & trig',  lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true },
  { id: 'M20', name: 'Angle rules',        lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 35,  half: true },
  { id: 'M21', name: 'Area & perimeter',   lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true },
  { id: 'M22', name: 'Percentages',        lv: ['11+','Y9 Mocks','GCSE','B-TEC'],            h: 23,  half: true },
  { id: 'M23', name: 'Rounding & bounds',  lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true },
  { id: 'M24', name: 'Standard form',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 35,  half: true },
  { id: 'M25', name: 'Sequences',          lv: ['11+','Y9 Mocks','GCSE'],                    h: 41,  half: true },
  { id: 'M26', name: 'Quadratics',         lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 23,  half: false },
  { id: 'M27', name: 'Probability',        lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true },
  { id: 'M28', name: 'Primes, HCF & LCM',  lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 23,  half: false },
  /* HIGHER, AND WHOLLY SO — both of these are Higher-only content top to bottom, which is what makes
     them component-wide tiers rather than the row-level ones inside M22, M23, M25 and M26. */
  { id: 'M29', name: 'Sine & cosine rule', lv: ['GCSE','AS','Alevel'],                       h: 18,  half: false, tier: 'H' },
  { id: 'M30', name: 'Circle theorems',    lv: ['GCSE'],                                     h: 28,  half: false, tier: 'H' },
  { id: 'M31', name: 'Fractions',          lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true },
  /* YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE. The pair of them is the only place in
     this table where one level contains another, which is why it is the only place a component is
     deliberately withheld from the lower of the two rather than shared upward. */
  { id: 'M32', name: 'Differentiation',    lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M33', name: 'Differentiation rules', lv: ['Alevel'],                                h: 29,  half: true },
  { id: 'M34', name: 'Integration',        lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M35', name: 'Integration methods', lv: ['Alevel'],                                  h: 35,  half: true },
  { id: 'M36', name: 'Logs & exponentials', lv: ['AS','Alevel'],                             h: 23,  half: true },
  { id: 'M37', name: 'Binomial expansion', lv: ['AS','Alevel'],                              h: 17,  half: true },
  { id: 'M38', name: 'Trig identities',    lv: ['AS','Alevel'],                              h: 23,  half: true },
  { id: 'M39', name: 'Double & addition',  lv: ['Alevel'],                                   h: 23,  half: false },
  { id: 'M40', name: 'Radians',            lv: ['Alevel'],                                   h: 23,  half: true },
  { id: 'M41', name: 'Series',             lv: ['Alevel'],                                   h: 23,  half: false },
  { id: 'M42', name: 'Circles & points',   lv: ['AS','Alevel'],                              h: 23,  half: false },
  { id: 'M43', name: 'Vectors',            lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M44', name: 'SUVAT & forces',     lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M45', name: 'Binomial distribution', lv: ['AS','Alevel'],                           h: 35,  half: true },
  { id: 'M46', name: 'Normal distribution', lv: ['Alevel'],                                  h: 29,  half: true },
  { id: 'M47', name: 'Hypothesis testing', lv: ['AS','Alevel'],                              h: 23,  half: true },
  { id: 'M48', name: 'Numerical methods',  lv: ['Alevel'],                                   h: 23,  half: false },
];


/* WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says. `start_on` on the cheatsheet
   tab decides it; the list above is what happens when no row does, which is also what happens
   before the payload lands. Falling back to a working example rather than to nothing is the whole
   reason that list exists — see the note above it. */
function matStart() {
  /* ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO ------------------------------------------
     THERE WAS A LIST OF SEVEN HERE and it was reached whenever the sheet had nothing to say — an
     empty tab, a backend not yet redeployed, a payload still in flight. Every one of those is a
     REASON TO KNOW NOTHING, and the code answered all three with a confident seven ticks that
     nobody had asked for and unticking could not remove.

     A DEFAULT THAT SURVIVES BEING OVERRULED IS NOT A DEFAULT. `start_on` is the only thing that
     ticks a box now; no rows means no ticks, which is also the honest picture of knowing nothing. */
  return (DATA.cheatsheet || []).filter(r => r && r.startOn).map(r => r.id);
}
/* ---------- NOTHING IS CHOSEN FOR YOU --------------------------------------------------------------
   THIS OPENED ON 'SATs', which is one of nine levels and was picked by being first to mind when the
   line was typed. For anybody teaching GCSE it is simply the wrong sheet, silently — the list is
   already filtered before they have touched anything, and there is no sign that a filter is on.
   `all` IS THE ONLY NON-ANSWER. It shows every component and privileges no level, so the first
   choice on the screen is still the user's to make. */
let MAT_LEVEL = 'all';
let MAT_ON = [];   /* filled from the sheet by matStart() when the tool opens */
/* WHETHER ANYBODY HAS CHOSEN ANYTHING YET. Without this, opening the tool a second time would
   silently undo the sheet somebody had just built. */
let MAT_TOUCHED = false;

/* THE LEVELS THE REST OF THE SITE USES. `primary` and `secondary` were a vocabulary I invented, and
   the options tab already lists the real ones — so a level added there arrives here without anybody
   remembering this file exists. The fallback is only for a payload that has not loaded. */
function matLevels() {
  /* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as
     options, which is the proof. I had written `x.value || x.name || x` in case they were objects;
     guessing at two shapes when one file already answers it is how a wrong guess ships. */
  const got = ((DATA.dropdowns || {}).levels || []).filter(Boolean);
  return got.length ? got
    : ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel', 'B-TEC'];
}

/* THE BRAND, READ THE WAY THE FLYER READS IT. Not a second copy of the fallbacks — a cheat sheet
   and a flyer printed the same afternoon carrying two different site addresses is exactly the drift
   that brought the flyer in from its own file. `brand()` alone was not enough: it falls back to
   whatever the caller passes, and this file passed '' for the site, so the footer printed a blank
   where the address goes on every sheet where the brand tab has no `site` row.
   The guard is for the case where flyer.js is not loaded; the fallbacks below are the same ones. */
const matBrand = () => (typeof flyBrand === 'function' ? flyBrand() : {
  name:  brand('name', '@family.'),
  area:  brand('area', 'Merton & Wandsworth'),
  site:  brand('site', 'halexdias31-pixel.github.io/family/'),
  phone: brand('phone', ''),
});

/* ---------- WHERE THE COMPONENTS COME FROM ------------------------------------------------------
   THE DRAWINGS ARE IN CODE AND THE TAGS ARE IN THE SHEET, which is the only split that works: a
   protractor's 181 ticks and a set of plotted curves are not things a spreadsheet can hold, and the
   levels a component suits are edited far more often than the way it looks.

   THE SHEET OVERRIDES; IT DOES NOT REPLACE. Every component below still exists with its own tags if
   the `cheatsheet` tab is missing, empty, or has no row for it — so this works before `?setup=1` has
   ever been run, and a component added in code works on the day it ships rather than on the day
   somebody remembers to type a row.

   AN EMPTY CELL MEANS "NO OPINION", which is why the backend sends blanks as `null` rather than as
   '' or 0 or FALSE: a blank `half_width` read as FALSE would turn every paired block full-width, and
   a blank `sort_order` read as 0 would move it to the top. Those are the two cells most likely to be
   left alone, so getting this wrong would break the ordinary case rather than an edge one. */
/* THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'. The full word is what the resources tab already
   stores against all 78 past papers, so that is the word to type; this is the one place the two
   vocabularies meet, rather than every row of every table having to pick one. */
const matTierFlag = v => /^h/i.test(String(v || '').trim()) ? 'H'
                       : (/^f/i.test(String(v || '').trim()) ? 'F' : '');

function matParts() {
  const rows = DATA.cheatsheet || [];
  const by = {};
  rows.forEach(r => { if (r && r.id) by[String(r.id).toUpperCase()] = r; });

  const all = MAT_PARTS;

  const out = all.map((c, i) => {
    const r = by[c.id];
    /* IN THE CODE AND NOT IN THE SHEET is not the same as switched off. The backend only sends rows
       whose `active` is on, so a component with no row here is one the sheet has never been told
       about — and it keeps everything the code says about it. */
    if (!r) return Object.assign({}, c, { at: c.at0 || (i + 1) * 10 });
    const levels = String(r.levels || '').split(/[,\n|]/).map(s => s.trim()).filter(Boolean);
    return Object.assign({}, c, {
      name:  r.name || c.name,
      lv:    levels.length ? levels : c.lv,
      /* THE SHEET CAN ADD A TIER AND IT CAN TAKE ONE AWAY. `'-'` is how you say "both papers" about
         a component the code calls Higher-only, since an empty cell already means "no opinion" and
         one value cannot mean both. */
      tier:  r.tier === '-' ? '' : (matTierFlag(r.tier) || c.tier),
      h:     r.heightMm === null || r.heightMm === undefined ? c.h : r.heightMm,
      half:  r.half === null || r.half === undefined ? c.half : r.half,
      at:    r.order === null || r.order === undefined ? (c.at0 || (i + 1) * 10) : r.order,
    });
  });

  /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a column
     of blank `sort_order` cells leaves the sheet exactly as it prints today, and filling in one cell
     moves one component. */
  return out.sort((a, b) => a.at - b.at);
}

/* ---------- THE BLOCKS ---------------------------------------------------------------------------
   Each returns the HTML for one component. They are here rather than generated, because the mat is
   drawn from the same data the app already holds and a template that has to be regenerated is a
   second build step for a print sheet. */
const MAT_HTML = {
  M02: () => matGrid('mat-hun', 100, n => {
    const c = n % 10 === 0 ? ' ten' : (n % 5 === 0 ? ' five' : '');
    return `<i class="${c.trim()}">${n}</i>`;
  }),
  M03: () => {
    let h = '<i class="h"></i>';
    for (let x = 1; x <= 12; x++) h += `<i class="h">${x}</i>`;
    for (let y = 1; y <= 12; y++) {
      h += `<i class="h">${y}</i>`;
      for (let x = 1; x <= 12; x++) h += `<i class="${x === y ? 'sq' : ''}">${x * y}</i>`;
    }
    return `<div class="mat-tt">${h}</div>`;
  },
  M04: () => {
    const W = 100;
    const fr = [[0,1,'0'],[1,4,'¼'],[1,3,'⅓'],[1,2,'½'],[2,3,'⅔'],[3,4,'¾'],[1,1,'1']];
    let h = fr.map(([n, d, l]) =>
      `<i style="left:${W*n/d}%"></i><b style="left:${W*n/d}%">${l}</b>`).join('');
    for (let k = 0; k <= 10; k++) {
      h += `<u style="left:${k*10}%"></u>`;
      /* THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT. 0, 0.5 and 1.0 sat directly under 0, the
         half and 1 — the same three places on the line labelled twice, which is what made the strip
         look crowded and, worse, made the two systems look like different scales rather than one.
         Four labels where there were six, and every one of them says something the row above does
         not. */
      if ([2,4,6,8].indexOf(k) !== -1) h += `<s style="left:${k*10}%">${(k/10).toFixed(1)}</s>`;
    }
    return `<div class="mat-nl">${h}</div>`;
  },
  M05: () => `<div class="mat-pv">${
    [['Th','1000'],['H','100'],['T','10'],['U','1'],['•',''],['t','0.1'],['h','0.01']]
      .map(([c, v]) => `<i class="${c === '•' ? 'dot' : ''}"><b>${c}</b><em>${v}</em></i>`).join('')}</div>`,
  M06: () => `<div class="mat-meas">${
    [['Length', ['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km']],
     ['Mass', ['1000 g = 1 kg','1000 kg = 1 tonne']],
     ['Capacity', ['1000 ml = 1 litre','100 cl = 1 litre']],
     ['Time', ['60 sec = 1 min','60 min = 1 hr','24 hr = 1 day']]]
      .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  M07: () => matAngles(),
  M08: () => matProtractor(),
  M09: () => `<div class="mat-shapes">${
    [['triangle',3],['square',4],['pentagon',5],['hexagon',6],
     ['heptagon',7],['octagon',8],['nonagon',9],['decagon',10]]
      .map(([n, k]) => `<div>${matPoly(k)}<span>${n}</span><em>${k} sides</em></div>`).join('')}</div>`,
  M10: () => `<div class="mat-rom">${
    [['I',1],['V',5],['X',10],['L',50],['C',100],['D',500],['M',1000]]
      .map(([a, b]) => `<i><b>${a}</b>${b}</i>`).join('')}
    <i class="wide">4 = IV · 9 = IX · 40 = XL · 90 = XC · 2026 = MMXXVI</i></div>`,
  M11: () => `<div class="mat-fdp">${
    [[fr('1','2'),'0.5','50%'], [fr('1','4'),'0.25','25%'], [fr('3','4'),'0.75','75%'],
     [fr('1','3'),'0.33','33⅓%'], [fr('1','5'),'0.2','20%'], [fr('1','10'),'0.1','10%'],
     [fr('1','8'),'0.125','12.5%'], ['1','1.0','100%']]
      .map(([f, d, p]) => `<i><b>${f}</b><em>${d}</em><em>${p}</em></i>`).join('')}</div>`,
  /* THE THIRD ENTRY IS THE TIER. Sphere and cone are Higher-only content; the rest of this block is
     on both papers, so tagging the whole component 'H' would have taken the circle away from a
     Foundation student to keep a sphere they will never be asked for. */
  M12: () => matPairs([
    ['Circle','A = πr² · C = 2πr'], ['Arc, sector', fr('θ','360') + ' × 2πr · × πr²'],
    ['Sphere', 'V = ' + fr('4','3') + 'πr³ · A = 4πr²', 'H'], ['Cone', 'V = ' + fr('1','3') + 'πr²h · πrl', 'H'],
    ['Prism','V = cross-section × length'], ['Compound','speed = d/t · density = m/v'],
    ['% change', fr('new − old','old') + ' × 100'], ['Interest','P(1 + r)ⁿ']]),
  /* EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY. The table used to read 0, ½, √2/2,
     √3/2, 1 — five values with nothing in common, which is five things to memorise and no way to
     rebuild any of them once one has gone. Written unsimplified they are one thing: n counts 0 1 2
     3 4 across for sine and back down for cosine, and a student who has the counting has the row.
     THE NUMBERS ARE COUNTED, NOT TYPED, so the pattern is in the code as well as on the paper and
     the two cannot disagree.
     TAN IS NOT OF THAT FORM and is left as it is. It is a table of exact values and dropping the
     row to keep the pattern tidy would be losing the third of them people look up most. */
  M13: () => {
    const surd = n => fr('√' + n, '2');
    const rows = [['sin', [0, 1, 2, 3, 4].map(surd)],
                  ['cos', [4, 3, 2, 1, 0].map(surd)],
                  ['tan', ['0', '√3/3', '1', '√3', '—']]];
    let h = ['', '0°', '30°', '45°', '60°', '90°'].map(x => `<i class="h">${x}</i>`).join('');
    rows.forEach(([name, vs]) => {
      h += `<i class="h">${name}</i>` + vs.map(v => `<i>${v}</i>`).join('');
    });
    return `<div class="mat-trig">${h}</div>`;
  },
  M14: () => matTrick(),
  /* POSITIVE POWERS AND THE ZERO INDEX ARE ON BOTH PAPERS. Negative and fractional indices are
     Higher, and they are the two rows a Foundation student would spend the longest reading. */
  M15: () => matPairs([['aᵐ × aⁿ','aᵐ⁺ⁿ'],['aᵐ ÷ aⁿ','aᵐ⁻ⁿ'],['(aᵐ)ⁿ','aᵐⁿ'],
                       ['a⁰','1'],['a⁻ⁿ', fr('1','aⁿ'), 'H'],['a^½','√a','H']]),
  M16: () => matGraphs(),
  /* PARALLEL IS ON BOTH PAPERS AND PERPENDICULAR IS NOT — the one distinction in this block, and
     the reason it could not be tiered as a whole. */
  M17: () => matPairs([['y = mx + c','m is the gradient, c the crossing'],
                       ['gradient', fr('y₂ − y₁','x₂ − x₁')],
                       ['parallel','same m'], ['perpendicular','m₁ × m₂ = −1', 'H']]),
  M18: () => matPairs([['mean','add up, divide by how many'], ['median','in order, take the middle'],
                       ['mode','the one that appears most'], ['range','biggest minus smallest']]),

  /* ---------- THE SECONDARY SET -------------------------------------------------------------------
     WHAT A Y7-TO-11 STUDENT ACTUALLY FORGETS. The first eighteen were built outward from primary and
     stopped at whatever the tutor had to hand, which left the middle of the school with a protractor,
     a times table and five GCSE fragments. Nothing here is new maths — it is the set of things that
     get looked up in the back of a book mid-question, which is the only test of what belongs on a
     sheet you are allowed to take in.

     THE TEXT IS KEPT SHORT ON PURPOSE. `.mat-two` is a two-column grid inside a block that is often
     half the sheet wide, so a value much past twenty characters wraps — and a wrapped row costs
     three times its height. That is the whole difference between M15's six rows at 21mm and M12's
     eight at 49mm. Where the wording genuinely cannot be short, the block is full width instead. */
  M19: () => matPairs([['a² + b² = c²','c is the longest side'], ['a shorter side','c² − a²'],
                       ['sin', fr('opp','hyp')], ['cos', fr('adj','hyp')], ['tan', fr('opp','adj')],
                       ['an angle','sin⁻¹ cos⁻¹ tan⁻¹']]),

  M20: () => matPairs([['straight line','180°'], ['at a point','360°'], ['triangle','180°'],
                       ['quadrilateral','360°'], ['vertically opposite','equal'],
                       ['alternate (Z)','equal'], ['corresponding (F)','equal'],
                       ['co-interior (C)','180°'], ['exterior sum','360°'],
                       ['interior sum','(n − 2) × 180°']]),

  M21: () => matPairs([['rectangle','bh'], ['triangle','½bh'], ['parallelogram','bh'],
                       ['trapezium','½(a + b)h'], ['circle','πr²'], ['compound','split it, add up']]),

  /* REVERSE PERCENTAGE IS THE HIGHER LINE. Finding the original amount is the one thing in this
     block a Foundation paper does not ask for, and it is also the one people get wrong by doing the
     obvious thing instead. */
  M22: () => matPairs([['15% of 40','0.15 × 40'], ['up 15%','× 1.15'], ['down 15%','× 0.85'],
                       ['reverse','÷ the multiplier','H'], ['change', fr('new − old','old')],
                       ['compound','P(1 + r)ⁿ']]),

  M23: () => matPairs([['3 s.f.','from the first non-zero'], ['2 d.p.','after the point'],
                       ['5 or more','rounds up'], ['estimating','1 s.f. each first'],
                       ['error interval','± half the unit','H'], ['bounds of a sum','max + max','H']]),

  M24: () => matPairs([['a × 10ⁿ','1 ≤ a < 10'], ['big','n positive'], ['small','n negative'],
                       ['×','× the a, add the n'], ['÷','÷ the a, take the n']]),

  M25: () => matPairs([['linear nth term','difference × n, adjust'],
                       ['term-to-term','what gets the next one'],
                       ['quadratic','2nd difference ÷ 2','H'], ['geometric','× a common ratio'],
                       ['triangular','1 3 6 10 15 21'], ['Fibonacci','add the two before']]),

  /* FULL WIDTH, because two of these values are twenty-four characters of algebra that cannot be
     said any shorter and would wrap to three lines in a half-width column. */
  M26: () => matPairs([['factorising','× to c, + to b'], ['two squares','x² − a² = (x + a)(x − a)'],
                       ['the formula', fr('−b ± √(b² − 4ac)','2a'), 'H'],
                       ['completing the square','(x + b/2)² − (b/2)² + c','H'],
                       ['discriminant','b² − 4ac','H']]),

  M27: () => matPairs([['all outcomes','add to 1'], ['not A','1 − P(A)'],
                       ['A and B','× along branches'], ['A or B','+ the branches'],
                       ['expected number','P × trials'], ['relative frequency', fr('successes','trials')]]),

  M28: () => matPairs([['prime','exactly two factors'], ['primes to 30','2 3 5 7 11 13 17 19 23 29'],
                       ['product of primes','divide by the smallest'], ['HCF','the shared primes'],
                       ['LCM','every prime, shared once'], ['BIDMAS','brackets, indices, ÷×, +−']]),

  M29: () => matPairs([['sine rule', fr('a','sin A') + ' = ' + fr('b','sin B')],
                       ['cosine rule','a² = b² + c² − 2bc cos A'], ['area','½ab sin C'],
                       ['which one','angle between → cosine']]),

  M30: () => matPairs([['semicircle','angle is 90°'], ['at the centre','twice the edge'],
                       ['same segment','equal angles'], ['cyclic quad','opposite add to 180°'],
                       ['tangent & radius','90°'], ['two tangents','equal length'],
                       ['alternate segment','equal to the other'], ['centre to chord','bisects it']]),

  M31: () => matPairs([['adding','same denominator first'], ['multiplying','tops × tops'],
                       ['dividing','flip and multiply'], ['of','× the fraction'],
                       ['mixed → improper','whole × bottom, + top'], ['simplifying','÷ both by the HCF']]),

  /* ---------- A-LEVEL ------------------------------------------------------------------------------
     AS MEANS YEAR ONE AND `Alevel` MEANS YEAR TWO AS WELL. Every other level in this file is a
     different exam; these two are the same course a year apart, so the split is by WHEN A THING IS
     TAUGHT rather than by what it belongs to. Differentiating xⁿ is Year 1 and the chain rule is
     Year 2, so they are two blocks — an AS student offered the product rule in January is being
     offered clutter, and one denied it in Year 2 is being denied the thing they came for.

     THE IDS STAY IN THE M SERIES. They are the join to a drawing and nothing else — an `A` prefix
     would look like it meant A-level, and then M13 appearing at A-level would be the exception that
     makes the naming a lie. A dull id cannot mislead.

     NOTHING HERE IS TIERED, since tiers are a GCSE idea; `MAT_TIERED` lists Y9 and GCSE only, so the
     picker never asks the question on these. */
  M32: () => matPairs([['xⁿ','nxⁿ⁻¹'], ['gradient there','put x into f′(x)'],
                       ['tangent','y − y₁ = m(x − x₁)'], ['normal', 'gradient −' + fr('1','m')],
                       ['stationary','f′(x) = 0'], ['max or min','f″(x) < 0 is a max']]),

  M33: () => matPairs([['chain','f′(g) × g′'], ['product','u′v + uv′'],
                       ['quotient', fr('u′v − uv′','v²')], ['sin x','cos x'], ['cos x','−sin x'],
                       ['eˣ','eˣ'], ['ln x', fr('1','x')], ['dy/dx', fr('1','dx/dy')]]),

  M34: () => matPairs([['xⁿ', fr('xⁿ⁺¹','n + 1') + ' + c'], ['the + c','indefinite only'],
                       ['definite','F(b) − F(a)'], ['area under a curve','∫ between the limits'],
                       ['below the axis','comes out negative']]),

  M35: () => matPairs([['by parts','∫u dv = uv − ∫v du'], ['substitution','change the limits too'],
                       [fr('1','x'), 'ln |x| + c'], ['eˣ','eˣ + c'], ['sin x','−cos x + c'],
                       ['cos x','sin x + c'], [fr('f′(x)','f(x)'), 'ln |f(x)| + c']]),

  M36: () => matPairs([['log a + log b','log ab'], ['log a − log b', 'log ' + fr('a','b')],
                       ['n log a','log aⁿ'], ['log 1','0'], ['aˣ = b', 'x = ' + fr('log b','log a')],
                       ['ln and eˣ','undo each other']]),

  M37: () => matPairs([['(a + b)ⁿ','ⁿCr aⁿ⁻ʳ bʳ'], ['ⁿCr', fr('n!','r!(n − r)!')],
                       ['the terms','r counts from 0'], ['(1 + x)ⁿ, any n','|x| < 1']]),

  M38: () => matPairs([['sin² + cos²','1'], ['tan', fr('sin','cos')], ['1 + tan²','sec²'],
                       ['1 + cot²','cosec²'], ['sin(−x)','−sin x'], ['cos(−x)','cos x']]),

  /* FULL WIDTH — these are the longest values in the file and there is no shorter way to write an
     addition formula that is still the formula. */
  M39: () => matPairs([['sin(A ± B)','sinA cosB ± cosA sinB'],
                       ['cos(A ± B)','cosA cosB ∓ sinA sinB'], ['sin 2A','2 sinA cosA'],
                       ['cos 2A','1 − 2sin²A'], ['tan 2A', fr('2 tanA','1 − tan²A')],
                       ['a sinx + b cosx','R sin(x + α)']]),

  M40: () => matPairs([['180°','π radians'], ['arc','rθ'], ['sector','½r²θ'],
                       ['sin θ ≈','θ'], ['tan θ ≈','θ'], ['cos θ ≈', '1 − ' + fr('θ²','2')]]),

  M41: () => matPairs([['arithmetic nth','a + (n − 1)d'],
                       ['arithmetic sum','½n(2a + (n − 1)d)'], ['geometric nth','arⁿ⁻¹'],
                       ['geometric sum', fr('a(1 − rⁿ)','1 − r')], ['to infinity', fr('a','1 − r')],
                       ['it converges when','|r| < 1']]),

  M42: () => matPairs([['circle','(x − a)² + (y − b)² = r²'], ['centre','(a, b)'],
                       ['tangent','perpendicular to the radius'], ['semicircle','angle is 90°'],
                       ['midpoint','average the ends'], ['distance','√((x₂−x₁)² + (y₂−y₁)²)']]),

  M43: () => matPairs([['magnitude','√(x² + y²)'], ['unit vector','÷ its magnitude'],
                       ['i and j','across and up'], ['parallel','one is a multiple'],
                       ['position vector','from the origin']]),

  M44: () => matPairs([['v','u + at'], ['s','ut + ½at²'], ['v²','u² + 2as'],
                       ['s (average)','½(u + v)t'], ['F','ma'], ['weight','mg'],
                       ['friction','F ≤ μR'], ['g','9.8 m s⁻²']]),

  M45: () => matPairs([['when','fixed n, two outcomes'], ['X ~','B(n, p)'],
                       ['P(X = r)','ⁿCr pʳ (1 − p)ⁿ⁻ʳ'], ['mean','np'],
                       ['P(X ≤ r)','tables or calculator']]),

  M46: () => matPairs([['X ~','N(μ, σ²)'], ['standardise', 'Z = ' + fr('x − μ','σ')], ['Z ~','N(0, 1)'],
                       ['within 1σ','about 68%'], ['within 2σ','about 95%'],
                       ['inverse normal','from a probability']]),

  M47: () => matPairs([['H₀','the assumption'], ['H₁','what you suspect'],
                       ['one tail','5% at one end'], ['two tail','2.5% each end'],
                       ['reject H₀','p < the level'], ['then say it','in context']]),

  M48: () => matPairs([['sign change','a root lies between'],
                       ['Newton–Raphson', 'x − ' + fr('f(x)','f′(x)')],
                       ['trapezium','½h[(y₀ + yₙ) + 2(rest)]'], ['h', fr('b − a','n')],
                       ['iteration','xₙ₊₁ = g(xₙ)']]),
};

const matGrid = (cls, n, cell) => {
  let h = '';
  for (let k = 1; k <= n; k++) h += cell(k);
  return `<div class="${cls}">${h}</div>`;
};
/* EVERY PAIRS BLOCK IS TIER-FILTERED HERE, once, rather than in each of the four that use it — so a
   row tagged 'H' anywhere disappears on Foundation without its block having to know about tiers. */
/* ---------- A FRACTION, DRAWN AS ONE -------------------------------------------------------------
   `(−b ± √(b² − 4ac)) ÷ 2a` IS THE QUADRATIC FORMULA TYPED SIDEWAYS. It is correct, and it is not
   what anybody has ever seen on a board or in a book — so the eye has to parse the brackets to work
   out what is over what, which is exactly the work a cheat sheet exists to save. Every ÷ standing
   between two whole expressions is a fraction that was flattened to fit in a string.

   SPANS, NOT `<b>` AND `<i>`. Both of those are already claimed inside these blocks — `.mat-two i`
   is a grid item and `.mat-two i b` is the label — so a fraction built from them would be restyled
   and, in the `i` case, unwrapped by `display: contents` and lose its bar.

   THE BAR IS `currentColor`, so a fraction inside a grey label is grey and inside black text is
   black, without this needing to know which it is in. */
const fr = (top, bottom) =>
  `<span class="mat-fr"><span>${top}</span><span>${bottom}</span></span>`;

const matPairs = rows => `<div class="mat-two">${
  rows.filter(r => matKeep(r[2])).map(([a, b]) => `<i><b>${a}</b><em>${b}</em></i>`).join('')}</div>`;

/* ---------- THE DRAWN PIECES ---------------------------------------------------------------------
   A regular polygon from its own definition rather than eight hand-typed paths that disagree with
   their labels — which is exactly what happened the first time: a positional list drew "rectangle"
   as a pentagon, because a fifth entry met a five-sided drawing.
   THE SQUARE IS TURNED HALF A STEP. Every polygon starting with a vertex at the top gives a
   triangle pointing up, which is right, and a square on its corner, which reads as a diamond. */
/* ---------- EVERY SHAPE THE SAME SIZE ON THE PAGE -------------------------------------------------
   ALL EIGHT WERE DRAWN ON A CIRCLE OF RADIUS 17, which is the obvious way and makes the triangle
   look half the size of the decagon. It is not an illusion: a triangle inscribed in a circle covers
   about 41% of it and a decagon covers 94%, so drawing them on the same circle really does put less
   than half as much ink on the page for the first one.

   THE EFFECT IS TO TEACH THE WRONG THING. A row comparing shapes should differ in the number of
   sides and in nothing else; if the triangle is also the smallest, size reads as part of what a
   triangle IS.

   SO EACH IS SCALED TO FILL THE SAME BOX. Points are generated on a unit circle, measured, and
   stretched to a fixed width — which makes them equal on the page rather than equal in the
   construction, and the page is where they are looked at. */
function matPoly(n) {
  const off = n === 4 ? Math.PI / n : 0;
  const raw = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + off + 2 * Math.PI * k / n;
    raw.push([Math.cos(a), Math.sin(a)]);
  }
  const xs = raw.map(p => p[0]), ys = raw.map(p => p[1]);
  const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
  /* THE LARGER DIMENSION DECIDES, so a tall shape and a wide one both fit and neither is cropped. */
  const k = 32 / Math.max(w, h);
  const midX = (Math.max(...xs) + Math.min(...xs)) / 2;
  const midY = (Math.max(...ys) + Math.min(...ys)) / 2;
  const pts = raw.map(([x, y]) =>
    (20 + (x - midX) * k).toFixed(1) + ',' + (20 + (y - midY) * k).toFixed(1));
  return `<svg viewBox="0 0 40 40"><polygon points="${pts.join(' ')}" fill="none"
    stroke="currentColor" stroke-width="1.4"/></svg>`;
}

/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. A screen does
   not know how big it is and would need calibrating against a bank card; a printed millimetre is a
   millimetre. Both scales, inner and outer, running opposite ways, because that is what a plastic
   protractor does and the thing every child gets wrong. */
function matProtractor() {
  /* ==================================================================================================
     A PROTRACTOR YOU CAN ACTUALLY READ AT THE ENDS.

     THE NUMBERS WERE PRINTED UPRIGHT, all of them, which is fine at the top of the arc and falls
     apart at the ends: at 0 and 180 the outer and inner labels are a few millimetres apart on the
     same horizontal line, so `0 180` and `170 10` ran into each other and the last four readings
     were a smudge. Every real protractor rotates its numbers, and this is why — not decoration, but
     the only way two scales fit in the same place.

     SO EACH LABEL TURNS WITH ITS OWN RADIUS. Upright at 90, lying on their sides at the ends, and
     the two scales stay legibly apart the whole way round because they are never parallel to each
     other along the same line.

     THE TICKS ARE THREE WEIGHTS, not two. Degrees, fives and tens were drawn at two thicknesses, so
     counting in fives meant counting single degrees and hoping. A five now sits between the two,
     which is what the eye uses to land on 35 without counting from 30.

     AND THE COLOURS ARE THE SHEET'S. #111 and #333 were near-black on a page whose grids had just
     been lightened to grey; the protractor was left as the heaviest thing on it. */
  const R = 41, cx = R + 4, cy = R + 4;
  const INK = '#14140f', MID = '#8d8878', FAINT = '#b4ae9c', RED = '#9b2d22';
  const at = (r, t) => [(cx + r * Math.cos(t)).toFixed(2), (cy - r * Math.sin(t)).toFixed(2)];

  let p = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="none"
    stroke="${MID}" stroke-width=".4"/>`;

  for (let a = 0; a <= 180; a++) {
    const t = Math.PI * (180 - a) / 180;
    const ten = a % 10 === 0, five = a % 5 === 0;
    const [x1, y1] = at(ten ? R - 6.5 : (five ? R - 4.5 : R - 2.4), t);
    const [x2, y2] = at(R, t);
    p += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${ten ? INK : (five ? MID : FAINT)}" stroke-width="${ten ? .45 : (five ? .3 : .18)}"/>`;

    if (!ten) continue;
    /* ROTATED WITH THE RADIUS. `a - 90` is upright at the top and a quarter turn at either end,
       which is exactly how the two scales stop overlapping down there. */
    const turn = a - 90;
    const [ox, oy] = at(R - 10.5, t);
    const [ix, iy] = at(R - 16, t);
    p += `<text x="${ox}" y="${oy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" fill="${INK}" transform="rotate(${turn} ${ox} ${oy})">${a}</text>`;
    p += `<text x="${ix}" y="${iy}" text-anchor="middle" dominant-baseline="middle"
      font-size="2.9" fill="${RED}" transform="rotate(${turn} ${ix} ${iy})">${180 - a}</text>`;
  }

  /* THE BASELINE, AND THE CROSS YOU LINE UP WITH THE VERTEX. The cross is the one part of a
     protractor that is used rather than read, so it stays the strongest mark on it. */
  p += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="${INK}" stroke-width=".5"/>
    <line x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="${RED}" stroke-width=".6"/>
    <line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}" stroke="${RED}" stroke-width=".6"/>
    <circle cx="${cx}" cy="${cy}" r="1.1" fill="none" stroke="${RED}" stroke-width=".4"/>`;

  return `<div class="mat-prot"><svg viewBox="0 0 ${2 * (R + 4)} ${R + 8}">${p}</svg></div>`;
}

function matAngles() {
  const kinds = [['acute', 45, 'less than 90'], ['right', 90, 'exactly 90'],
                 ['obtuse', 130, '90 to 180'], ['straight', 180, 'exactly 180'],
                 ['reflex', 250, 'more than 180']];
  return `<div class="mat-ang">${kinds.map(([name, deg, note]) => {
    const t = Math.PI * deg / 180;
    const x = 20 + 15 * Math.cos(t), y = 22 - 15 * Math.sin(t);
    const arc = deg === 180 ? '' :
      `<path d="M 27 22 A 7 7 0 ${deg > 180 ? 1 : 0} 0
        ${(20 + 7 * Math.cos(t)).toFixed(1)} ${(22 - 7 * Math.sin(t)).toFixed(1)}"
        fill="none" stroke="#9b2d22" stroke-width=".7"/>`;
    return `<div><svg viewBox="0 0 40 30">
      <line x1="20" y1="22" x2="36" y2="22" stroke="currentColor" stroke-width="1.4"/>
      <line x1="20" y1="22" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
        stroke="currentColor" stroke-width="1.4"/>${arc}</svg>
      <span>${name}</span><em>${note}</em></div>`;
  }).join('')}</div>`;
}

/* ---------- THE TRICK, WHICH BEATS THE TABLE -----------------------------------------------------
   EVERY EXACT VALUE IS √n OVER 2, and n counts 0 1 2 3 4 across for sine and backwards for cosine.
   One pattern replacing ten values — and it survives an exam in a way a memorised table does not,
   because a pattern can be rebuilt from nothing on the back of the paper.

   THE ROOT IS DRAWN, NOT TYPED. A √ character sits beside the numbers at whatever size the font
   makes it and its bar covers only the first one, so it reads as the root of that number rather
   than of the row — which is the one thing the trick depends on saying. */
function matTrick() {
  const angs = ['0°','30°','45°','60°','90°'];
  const row = (label, ns, simp) =>
    `<div class="mat-tk-row"><b>${label}</b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
       <div class="mat-tk-nums">${ns.map(n => `<i>${n}</i>`).join('')}</div></div></div>
     <div class="mat-tk-simp"><b></b><div class="mat-tk-nums">${
       simp.map(v => `<u>${v}</u>`).join('')}</div></div>`;
  return `<div class="mat-tk">
    <div class="mat-tk-row"><b></b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
      <div class="mat-tk-nums">${angs.map(a => `<em>${a}</em>`).join('')}</div></div></div>
    ${row('sin', ['0','1','2','3','4'], ['0','½','√2/2','√3/2','1'])}
    ${row('cos', ['4','3','2','1','0'], ['1','√3/2','√2/2','½','0'])}
    <p class="mat-tk-say">Every one is <b>√n over 2</b>. Count up for sine, down for cosine.
      tan = sin ÷ cos.</p></div>`;
}

/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the
   half of it nobody can use.
   EACH SVG NEEDS A WIDTH. Without one they filled the column and the block came out 744mm tall,
   nearly three sheets from one component: an SVG with no width is not a small picture, it is as
   large as you let it be. The grid gives them their width. */
function matGraphs() {
  const W = 44, H = 34;
  const curve = f => {
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const x = -1.6 + 3.2 * k / 40;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 3) continue;
      pts.push((W / 2 + x * W / 3.6).toFixed(1) + ',' + (H / 2 - y * H / 7).toFixed(1));
    }
    return pts.join(' ');
  };
  /* FOUNDATION RECOGNISES LINEAR AND QUADRATIC. Cubic, reciprocal and exponential are Higher, and
     the tier is the fourth entry rather than the third because the third is the function. */
  const kinds = [['linear','y = x', x => x], ['quadratic','y = x²', x => x * x],
                 ['cubic','y = x³', x => x ** 3, 'H'],
                 ['reciprocal','y = 1/x', x => Math.abs(x) > .28 ? 1 / x : 9, 'H'],
                 ['exponential','y = 2ˣ', x => Math.pow(2, x) - 1, 'H']];
  return `<div class="mat-graphs">${kinds.filter(k => matKeep(k[3])).map(([n, eq, f]) =>
    `<div><svg viewBox="0 0 ${W} ${H}">
      ${/* AXES IN THE SHEET'S GREY. They were a shade of their own — one more colour in a document
            that had just been reduced to three. An axis is scaffolding: it has to be there and it
            must not compete with the curve, which is the thing being looked at. */''}
      <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="#b4ae9c" stroke-width=".4"/>
      <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" stroke="#b4ae9c" stroke-width=".4"/>
      <polyline points="${curve(f)}" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </svg><span>${n}</span><em>${eq}</em></div>`).join('')}</div>`;
}

/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. At the edge because
   that is where a ruler is used — you lay the paper against the thing you are measuring, and one in
   the middle of a sheet cannot reach anything. */
function matRuler(mmHigh) {
  let h = '';
  for (let mm = 0; mm <= mmHigh; mm++) {
    /* THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE. Written inline, the three tick widths could
       not be adjusted from the stylesheet — an inline style beats every rule in the file, so the
       ruler was the one component whose weight could only be changed in JavaScript. A centimetre,
       a half, and a millimetre are three kinds of mark; naming them is what lets the sheet decide
       how loud each one is. */
    const long = mm % 10 === 0, mid = mm % 5 === 0;
    h += `<i class="${long ? 'cm' : (mid ? 'mid' : '')}" style="top:${mm}mm"></i>`;
    if (long && mm > 0) h += `<b style="top:${mm}mm">${mm / 10}</b>`;
  }
  return h;
}

/* ---------- THE PICKER AND THE SHEET -------------------------------------------------------------
   Rendered into the widget's own box, so this behaves like every other tool: a card with a start
   function, listed and searchable with the rest. */
function initMat() {
  const box = $('mat-box');
  if (!box) return;
  /* SET FROM THE SHEET EACH TIME THE TOOL OPENS, not once at load: the payload may not have landed
     when this file did, and a default read too early is the hard-coded one for the rest of the
     session. Only when nothing has been ticked yet, so reopening the tool does not throw away what
     somebody was in the middle of choosing. */
  if (!MAT_TOUCHED) MAT_ON = matStart();
  box.innerHTML = `
    <div class="mat-lev" id="mat-lev"></div>
    ${/* THE SAME CLASS AS THE LEVEL ROW, deliberately. Two rows of pills that are the same kind of
          choice should look the same, and reusing the class is what guarantees they cannot drift
          apart in the stylesheet. It is hidden on an untiered level rather than emptied — an empty
          row still holds its gap and reads as something that failed to load. */''}
    <div class="mat-lev" id="mat-tier"></div>
    <div class="mat-list" id="mat-list"></div>
    <div class="mat-gauge" id="mat-gauge"><i></i></div>
    <p class="mat-said" id="mat-said"></p>
    <button class="btn" data-do="mat-print" id="mat-go">Print the sheet</button>
    <div class="mat-out" id="mat-out"></div>`;

  const levels = matLevels();
  if (levels.indexOf(MAT_LEVEL) === -1) MAT_LEVEL = levels[0];
  $('mat-lev').innerHTML = levels.map(l =>
    `<button data-do="mat-level" data-l="${esc(l)}">${esc(l)}</button>`).join('')
    + '<button data-do="mat-level" data-l="all">Everything</button>';
  $('mat-tier').innerHTML = [['F', 'Foundation'], ['H', 'Higher']].map(([t, label]) =>
    `<button data-do="mat-tier" data-t="${t}">${label}</button>`).join('');
  /* THE TIER IS ON THE COMPONENT ROW TOO, so switching tier hides the same way switching level
     does and neither has to know what the other did. */
  /* ONE KIND OF THING, SO NO HEADINGS. The list was split into "Components" and "Flyers" while a
     flyer could be ticked onto the sheet; with the flyer maker its own tool again there is one
     library here, and a heading over a list of one kind is a word doing no work. */
  $('mat-list').innerHTML = matParts().map(c => {
    return `<label data-id="${c.id}" data-l="${esc(c.lv.join('|'))}" data-t="${c.tier || ''}"><input
       type="checkbox" data-do="mat-tick"
       data-id="${c.id}"${MAT_ON.indexOf(c.id) !== -1 ? ' checked' : ''}>
     ${esc(c.name)}<u>${c.h}mm</u></label>`;
  }).join('');
  matPaint();
}

/* SWITCHING LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. Somebody who set up a SATs mat,
   looked at GCSE and came back should find their mat as they left it. */
on('mat-level', el => { MAT_LEVEL = el.getAttribute('data-l'); matPaint(); });
on('mat-tier', el => { MAT_TIER = el.getAttribute('data-t'); matPaint(); });
on('mat-tick', el => {
  MAT_TOUCHED = true;
  const id = el.getAttribute('data-id');
  const at = MAT_ON.indexOf(id);
  if (el.checked && at === -1) MAT_ON.push(id);
  if (!el.checked && at !== -1) MAT_ON.splice(at, 1);
  matPaint();
});

/* WHAT DRAWS A PIECE. Two libraries, one lookup: a component is a function in `MAT_HTML` keyed by
   its id, and a flyer is `flyOne` handed the campaign row it names. Every caller asks this rather
   than reaching into `MAT_HTML` itself, so a third kind of piece — a coupon, a booking slip — is a
   line here and a row in the list, and nothing else in the file has to learn about it.
   A PIECE WHOSE DRAWING IS MISSING SAYS SO on the paper. Silence would print a gap, and a gap on a
   sheet you are about to photocopy thirty times is worth a sentence. */
function matDraw(c) {
  return MAT_HTML[c.id] ? MAT_HTML[c.id]()
    : `<p class="mat-gone">${esc(c.name)} has nothing to draw it.</p>`;
}

function matPaint() {
  const lev = $('mat-lev'), tierBar = $('mat-tier'), list = $('mat-list'), out = $('mat-out');
  if (!out) return;
  if (lev) lev.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.getAttribute('data-l') === MAT_LEVEL));

  /* WHETHER THIS LEVEL HAS TIERS AT ALL, and therefore whether the row is offered. `all` is not a
     level anybody sits, so it shows everything: filtering the Everything view by tier would make
     "Everything" mean less than it says.
     MAT_SHOW IS SET BEFORE ANYTHING IS DRAWN, because every block reads it through `matKeep` while
     rendering — setting it afterwards would tier the sheet one repaint late. */
  const tiered = MAT_TIERED.indexOf(MAT_LEVEL) !== -1;
  MAT_SHOW = tiered ? MAT_TIER : 'H';
  if (tierBar) {
    tierBar.style.display = tiered ? '' : 'none';
    tierBar.querySelectorAll('button').forEach(b =>
      b.classList.toggle('on', b.getAttribute('data-t') === MAT_TIER));
  }

  /* SHOWN WHEN THE COMPONENT LISTS THIS LEVEL — a component belongs to several, so this is a
     membership test rather than an equality one. A Higher-only component is hidden on Foundation
     the same way, and hidden rather than unticked: coming back to Higher should find the sheet as
     it was left. */
  if (list) list.querySelectorAll('label').forEach(el => {
    const lv = el.getAttribute('data-l');
    const has = !lv || lv.split('|').indexOf(MAT_LEVEL) !== -1;
    const fits = matKeep(el.getAttribute('data-t'));
    el.classList.toggle('off', (MAT_LEVEL !== 'all' && !has) || !fits);
  });


  const on_ = matParts().filter(c => MAT_ON.indexOf(c.id) !== -1
    /* NO LEVEL MEANS EVERY LEVEL. A flyer is not GCSE or SATs, and reading an empty list as
       "belongs to nothing" would have hidden every flyer at every level — which looks exactly like
       a feature that failed to load. */
    && (MAT_LEVEL === 'all' || !c.lv.length || c.lv.indexOf(MAT_LEVEL) !== -1)
    && matKeep(c.tier));

  /* AN EDGE PIECE IS NOT IN THE COLUMN. The ruler lives in the margin, so it must not be laid out
     with the others or it would take a row of its own and push everything down a sheet. */
  const pieces = on_.filter(c => !c.edge);

  /* HALF-WIDTH BLOCKS PAIR UP, full ones take a row. Walked in list order rather than sorted, so
     moving something on the mat is moving one line here. */
  let h = '', hold = null;
  /* ONE FUNCTION, CALLED ONCE PER BLOCK. The first version had a ternary that invoked `MAT_HTML`
     twice for the same component — drawing a protractor's 181 ticks and throwing one copy away. */
  /* A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE. A flyer carries its own
     name, its own colour and its own edge — putting "FLYER — BACK TO SCHOOL" in small capitals above
     it would be labelling a poster with the word poster. `bare` says so, and the stylesheet takes
     the heading, the hairline and the padding off. */
  const cell = c => c.bare
    ? `<div class="mat-box bare">${matDraw(c)}</div>`
    : `<div class="mat-box"><h4>${esc(c.name)}</h4>${matDraw(c)}</div>`;
  const pair = (a, b) => `<div class="mat-two-up">${cell(a)}${b ? cell(b) : '<div></div>'}</div>`;
  pieces.forEach(c => {
    if (!c.half) {
      if (hold) { h += pair(hold); hold = null; }
      h += cell(c);
    } else if (hold) { h += pair(hold, c); hold = null; }
    else hold = c;
  });
  if (hold) h += pair(hold);

  /* THE LEVEL IS ON THE PAPER. Six sheets in a folder all headed "Cheat sheet" are six sheets you
     have to read to tell apart, and the one thing that distinguishes them is already known here.
     `all` is not a level anybody is at, so it prints as the plain title. */
  const B = matBrand();
  const tierWord = MAT_TIERED.indexOf(MAT_LEVEL) !== -1
    ? (MAT_TIER === 'F' ? ' Foundation' : ' Higher') : '';
  const title = MAT_LEVEL === 'all' ? 'Cheat sheet' : 'Cheat sheet — ' + MAT_LEVEL + tierWord;
  /* PHONE ONLY IF THE TAB HAS ONE — a separator with nothing after it reads as something missing
     rather than something not offered. */
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  /* THE MARGIN BELONGS TO THE RULER, so it goes when the ruler does. Left reserved, an untick
     would take the scale away and leave a 20mm strip of nothing down the page — which reads as a
     printing fault rather than as a choice. */
  const ruled = MAT_ON.indexOf('M01') !== -1;
  out.innerHTML = `<div class="mat-sheet${ruled ? ' ruled' : ''}">${
    ruled ? `<div class="mat-rule">${matRuler(285)}</div>` : ''}
    <div class="mat-head"><h3>${esc(title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-cols">${h}</div>
    <div class="mat-foot"><span>${esc(foot)}</span>
      <b>${esc(B.site)}</b></div></div>`;

  /* MEASURED, NOT ADDED UP. The heights in the list are what each costs ALONE; two halves in a row
     cost the taller of them, and no table of numbers can know which pairs got ticked. Reading the
     rendered column is the only figure that is always right. */
  const cols = out.querySelector('.mat-cols');
  const used = cols ? Math.round(cols.getBoundingClientRect().height / matPx()) : 0;
  const over = used > MAT_ROOM;
  $('mat-gauge').classList.toggle('over', over);
  $('mat-gauge').firstElementChild.style.width = Math.min(100, used / MAT_ROOM * 100) + '%';
  $('mat-said').className = 'mat-said' + (over ? ' over' : '');
  $('mat-said').innerHTML = over
    ? `<b>${used - MAT_ROOM}mm too much</b> — untick something, or the bottom is cut off.`
    : `<b>${MAT_ROOM - used}mm</b> of paper left.`;
  $('mat-go').disabled = over || !pieces.length;
  matFit();
  matWatch();
}

/* THE SHEET IS SCALED TO THE SCREEN and back to 1 for printing, where 210mm really is 210mm. The
   factor is measured rather than assumed, because the box width changes with the screen and a
   hard-coded one would be right on a single device. */
function matPx() {
  const p = document.createElement('div');
  p.style.cssText = 'width:100mm;position:absolute;visibility:hidden';
  document.body.appendChild(p);
  const k = p.getBoundingClientRect().width / 100;
  p.remove();
  return k || 3.7795;
}
/* ---------- MEASURE, OR WAIT ---------------------------------------------------------------------
   `out.clientWidth || 320` was the phone bug. A hidden element measures 0, and this is usually
   painted before its screen is on camera — so the sheet was scaled to a GUESS at a phone width.
   Desktop paints visible, measures fine, never hits the fallback: same code, two pages. And 320 is
   plausible enough that the result looked like a fit, so nothing ever looked wrong.
   No width now means not laid out yet; the observer calls back when it is. */
function matFit() {
  const out = $('mat-out'), sheet = out && out.querySelector('.mat-sheet');
  if (!sheet) return;
  const room = out.getBoundingClientRect().width;
  if (!room) return;                     /* not on screen yet; the observer will call again */
  const px = matPx();
  const k = Math.min(1, room / (210 * px));
  sheet.style.transform = 'scale(' + k.toFixed(4) + ')';
  /* THE SPACE IT LEAVES BEHIND. A scaled element still occupies its full unscaled height, so
     without this the sheet sits in a column of white taller than the phone. */
  out.style.height = (297 * px * k) + 'px';
}

/* WATCHES THE BOX, NOT THE WINDOW. `resize` does not fire when a hidden panel becomes visible, when
   a column changes width because something else on the screen collapsed, or when the sheet is
   painted before layout — which are the three ways this went wrong. A ResizeObserver fires for all
   of them, and for the window too. */
let MAT_WATCH = null;
function matWatch() {
  const out = $('mat-out');
  if (!out || MAT_WATCH || typeof ResizeObserver !== 'function') return;
  MAT_WATCH = new ResizeObserver(() => matFit());
  MAT_WATCH.observe(out);
}

/* PRINTING FROM INSIDE THE APP. A browser prints the whole document, so the class hides everything
   else and lifts the sheet out at full size — set only while printing, so a print started anywhere
   else is untouched. The timer is there because some browsers never fire `afterprint` on a
   cancelled dialogue, and the app would be left with everything hidden: a blank screen that looks
   exactly like a crash. */
on('mat-print', () => {
  const sheet = document.querySelector('.mat-out .mat-sheet');
  if (!sheet) return;
  /* A COPY, PRINTED FROM THE END OF THE BODY, rather than the sheet where it sits.
     Undoing the scale was never the whole job. `body` is a centred 26.5rem column — 115mm — with
     `overflow-x: clip` and `position: relative`, so a 210mm sheet positioned `absolute; left: 0`
     inside it starts where the COLUMN starts, not where the paper does, and everything past 115mm
     is clipped off the page. What came out was a sheet shifted right by half the margin with its
     right-hand half missing, a ruler that stopped at 12cm and a trig table with no 90° column.
     THE CLONE IS WHY THIS IS A COPY AND NOT A MOVE. Moving the real sheet out and back leaves the
     tool broken if the print throws between the two; a copy that is deleted afterwards cannot. */
  const paper = document.createElement('div');
  paper.className = 'mat-paper';
  paper.appendChild(sheet.cloneNode(true));
  document.body.appendChild(paper);
  document.body.classList.add('printing-mat');
  const done = () => {
    document.body.classList.remove('printing-mat');
    paper.remove();
    matFit();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  /* `window.print()`, NOT `print()`. Bare it works — it is a global — and it reads as a function
     this file forgot to declare, which is exactly what `check.js` said. A name that has to be
     recognised as a browser built-in rather than as a mistake costs a reader a lookup. */
  window.print();
});

window.addEventListener('resize', () => { if ($('mat-out')) matFit(); });