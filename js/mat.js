/* @family. — js/mat.js (19 of 20) THE CHEAT SHEET MAKER — one sheet of A4, built from components you tick, printed from the app. § */

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. Measured on the real sheet, not
   derived from 297 minus some margins — the header and foot are content and their height is
   whatever the font makes it. */
const MAT_ROOM = 262;

/* ---------- HOW MANY NARROW BLOCKS GO ACROSS § */
/* ---------- EVERY COMPONENT HAS A FACE § */
/* ---------- EVERY COMPONENT HAS A FIXED AREA § */
const MAT_TRACKS = 6;
/* THE GUTTER, ONCE — the gap between two tracks. The CSS spends it (`.mat-cols` column-gap) and the
   pricing has to know it, so the stylesheet reads it through `--mat-gut` set from here. */
const MAT_GUT = 6;
/* THE ROW UNIT. Slots are whole numbers of these tall, so a slot's height is exact rather than a
   fractional track the browser rounds differently on each sheet. */
const MAT_ROW = 2;
/* THE TEXT BLOCK IS 184mm AND STAYS 184mm. § */
const MAT_TEXT_W = 184;
/* ONE TRACK, AND A SPAN OF N OF THEM — the same two constants the stylesheet is given, so the price in the picker and the width on the paper cannot disagree § */
const matTrackW = () => (MAT_TEXT_W - MAT_GUT * (MAT_TRACKS - 1)) / MAT_TRACKS;
const matSpanW = n => n * matTrackW() + (n - 1) * MAT_GUT;
/* A NARROW BLOCK IS A THIRD, a `pair` block (the hundred square and the times table) two thirds. */
const matColW = () => matSpanW(2);
const matPairW = () => matSpanW(4);
/* HOW MANY TRACKS A COMPONENT TAKES, from what it is rather than from what is beside it. */
const matSpan = c => c.pair ? 4 : (c.half ? 2 : MAT_TRACKS);

/* ---------- THE SECOND FILTER, AND WHY LEVEL ALONE WAS NOT ENOUGH § */
const MAT_TIERED = ['Y9 Mocks', 'GCSE'];

/* WHICH TIER WAS LAST CHOSEN, and separately WHICH TIER IS BEING DRAWN (`MAT_SHOW`). § */
let MAT_TIER = 'H';
/* ---------- GIVEN IN THE EXAM, AS A FILTER § */
let MAT_EXAM = 'all';
let MAT_SHOW = 'H';

/* Does this row survive the tier being drawn? A flag of 'H' means Higher only; anything else — and
   that is most rows — means it is on both papers. */
const matKeep = flag => flag !== 'H' || MAT_SHOW === 'H';

/* Each component: what it is called, which levels it suits, what it costs in millimetres, and whether it sits half-width so it can pair with the next one. § */
/* WHAT PUTS A COMPONENT UNDER A LEVEL, since the first set were tagged by which exam the topic belongs to and that is the wrong question. § */
/* GIVEN IN THE EXAM, OR NOT — `inExam` ON EACH COMPONENT § */
const MAT_PARTS = [
  /* ---------- THE RULER IS A COMPONENT LIKE ANY OTHER § */
  /* `h` IS ITS REAL HEIGHT, THE WHOLE PAGE. § */
  { id: 'M01', name: 'Ruler down the edge', face: '|·| ruler', lv: [], h: 262, half: false, edge: true,
    note: 'prints at true size' },
  /* ---------- THE TWO GRIDS ARE TWO THIRDS OF THE PAGE WIDE § */
  { id: 'M02', name: 'Number square', face: '100 square',      lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 94,  half: true, pair: true },
  { id: 'M03', name: 'Times tables', face: '12×12 tables',       lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 100, half: true, pair: true },
  /* ---------- THE FOUR THAT KEEP THE FULL WIDTH § */
  { id: 'M04', name: 'Number line', face: '0 ½ 1 line',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 20,  half: false },
  { id: 'M05', name: 'Place value', face: 'Th H T U',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 15,  half: true },
  /* MEASURES AND FRACTION=DECIMAL REACH B-TEC. § */
  { id: 'M06', name: 'Measures', face: 'km→m units',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 39,  half: true, inExam: false },
  { id: 'M07', name: 'Angles named', face: '∠ named',       lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 28,  half: true },
  { id: 'M08', name: 'Protractor', face: '◡ protractor',         lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 54,  half: true,
    note: 'prints at true size' },
  /* Y1 AS WELL AS Y2. Naming a triangle and a square is the first year's work, and the block was
     offered to the second year and withheld from the one that starts it. */
  { id: 'M09', name: '2D shapes', face: '△ ▢ ⬠ shapes',          lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],         h: 35,  half: false },
  { id: 'M10', name: 'Roman numerals', face: 'XIV numerals',     lv: ['SATs','11+'],                               h: 13,  half: true },
  { id: 'M11', name: 'Fraction = decimal', face: '½ = 0.5', lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 15,  half: true, inExam: false },
  /* NOT AN A-LEVEL BLOCK, WHICH IS WHAT ITS NAME SAYS. § */
  /* ---------- EIGHT FORMULAE, EIGHT TICKBOXES § */
  { id: 'M12A', name: 'Circle', face: 'πr² circle',            lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12B', name: 'Arc & sector', face: 'θ/360 arc',      lv: ['Y9 Mocks','GCSE'],                          h: 10, half: true, inExam: false },
  { id: 'M12C', name: 'Sphere', face: '⁴⁄₃πr³ sphere',            lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12D', name: 'Cone', face: '⅓πr²h cone',              lv: ['GCSE'],                                     h: 10, half: true, tier: 'H', inExam: true },
  { id: 'M12E', name: 'Prism', face: 'A × l prism',             lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12F', name: 'Compound measures', face: 'd/t speed', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12G', name: 'Percentage change', face: '%Δ change', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: false },
  { id: 'M12H', name: 'Compound interest', face: 'P(1+r)ⁿ interest', lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 10, half: true, inExam: true },
  { id: 'M13', name: 'Exact trig values', face: 'sin30 exact',  lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  { id: 'M14', name: 'The trig trick', face: '√n⁄2 trick',     lv: ['GCSE','AS','Alevel'],                       h: 33,  half: true, tier: 'H', inExam: false },
  /* INDEX LAWS AND GRAPH SHAPES START AT Y9. Both are Y8/Y9 teaching, and both were tagged from
     GCSE up while the straight line beside them started at Y9 — the same year, three rows apart,
     disagreeing about when algebra begins. */
  { id: 'M15', name: 'Index laws', face: 'aᵐaⁿ index',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 24,  half: true, inExam: false },
  { id: 'M16', name: 'Graph shapes', face: 'y=x² graphs',       lv: ['Y9 Mocks','GCSE','AS','Alevel'],            h: 40,  half: false, inExam: false },
  /* AS BUT NOT ALEVEL was the clearest error in the table: § */
  { id: 'M17', name: 'Straight line', face: 'y = mx + c',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 29,  half: true, inExam: false },
  { id: 'M18', name: 'Averages', face: 'x̄ averages',           lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 24,  half: true, inExam: false },
  /* THE HEIGHTS BELOW ARE MODELLED, NOT MEASURED, and they are the weakest numbers in this file. § */
  { id: 'M19', name: 'Pythagoras & trig', face: 'a²+b²=c²',  lv: ['Y9 Mocks','GCSE','B-TEC'],                  h: 28,  half: true, inExam: true },
  { id: 'M20', name: 'Angle rules', face: '180° rules',        lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 35,  half: true, inExam: false },
  { id: 'M21', name: 'Area & perimeter', face: '½bh area',   lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  /* SATs. Percentages of an amount is Y6, and fractions, rounding, area and averages all carry
     SATs on the rows around this one — four neighbours teaching the same year, and this the only
     one saying otherwise. */
  { id: 'M22', name: 'Percentages', face: '15% of 40',        lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 23,  half: true, inExam: false },
  { id: 'M23', name: 'Rounding & bounds', face: '≈ bounds',  lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  { id: 'M24', name: 'Standard form', face: 'a × 10ⁿ',      lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 35,  half: true, inExam: false },
  /* SATs, for the same reason: continuing a number sequence is Y6, and the nth term on top of it
     is what the later levels add rather than what makes the block start. */
  { id: 'M25', name: 'Sequences', face: 'nth term',          lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 41,  half: true, inExam: false },
  /* B-TEC, LIKE THE ALGEBRA EITHER SIDE OF IT. § */
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M26', name: 'Quadratics', face: 'ax²+bx+c',         lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 23,  half: true, inExam: true },
  /* 11+, WHERE IT IS ASKED. Simple probability is on entrance papers, and this was the only block
     on a common 11+ topic that an 11+ student could not see. */
  { id: 'M27', name: 'Probability', face: 'P(A) chance',        lv: ['11+','Y9 Mocks','GCSE','B-TEC'],            h: 28,  half: true, inExam: false },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M28', name: 'Primes, HCF & LCM', face: 'HCF · LCM',  lv: ['SATs','11+','Y9 Mocks','GCSE'],             h: 23,  half: true, inExam: false },
  /* SET NOTATION SITS BESIDE PROBABILITY because that is where the sheet already talks about A and B — 'A and B' and 'A or B' are M27's words for what this block § */
  { id: 'M49', name: 'Set notation', face: 'A ∩ B sets',        lv: ['GCSE'],                                     h: 47,  half: true, tier: 'H', inExam: false },
  /* HIGHER, AND WHOLLY SO — both of these are Higher-only content top to bottom, which is what makes
     them component-wide tiers rather than the row-level ones inside M22, M23, M25 and M26. */
  { id: 'M29', name: 'Sine & cosine rule', face: 'a⁄sin A rule', lv: ['GCSE','AS','Alevel'],                       h: 18,  half: false, tier: 'H', inExam: true },
  { id: 'M30', name: 'Circle theorems', face: '◯ theorems',    lv: ['GCSE'],                                     h: 28,  half: false, tier: 'H', inExam: false },
  { id: 'M31', name: 'Fractions', face: 'a⁄b + c⁄d',          lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],     h: 35,  half: true, inExam: false },
  /* YEAR ONE IS 'AS','Alevel' AND YEAR TWO IS 'Alevel' ALONE. § */
  { id: 'M32', name: 'Differentiation', face: 'dy/dx differ.',    lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M33', name: 'Differentiation rules', face: 'uv′ rules', lv: ['Alevel'],                                h: 29,  half: true },
  { id: 'M34', name: 'Integration', face: '∫ integrate',        lv: ['AS','Alevel'],                              h: 40,  half: true },
  { id: 'M35', name: 'Integration methods', face: '∫u dv by parts', lv: ['Alevel'],                                  h: 35,  half: true },
  { id: 'M36', name: 'Logs & exponentials', face: 'ln x logs', lv: ['AS','Alevel'],                             h: 23,  half: true },
  { id: 'M37', name: 'Binomial expansion', face: 'ⁿCᵣ binomial', lv: ['AS','Alevel'],                              h: 17,  half: true },
  { id: 'M38', name: 'Trig identities', face: 'sin²+cos²',    lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M39', name: 'Double & addition', face: 'sin 2A double',  lv: ['Alevel'],                                   h: 23,  half: true },
  { id: 'M40', name: 'Radians', face: 'π = 180° rad',            lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M41', name: 'Series', face: 'Σ series',             lv: ['Alevel'],                                   h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M42', name: 'Circles & points', face: '(x−a)² eqn',   lv: ['AS','Alevel'],                              h: 23,  half: true },
  { id: 'M43', name: 'Vectors', face: '⟶ vectors',            lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M44', name: 'SUVAT & forces', face: 'F = ma forces',     lv: ['AS','Alevel'],                              h: 29,  half: true },
  { id: 'M45', name: 'Binomial distribution', face: 'B(n,p) binomial', lv: ['AS','Alevel'],                           h: 35,  half: true },
  { id: 'M46', name: 'Normal distribution', face: 'N(μ,σ²) normal', lv: ['Alevel'],                                  h: 29,  half: true },
  { id: 'M47', name: 'Hypothesis testing', face: 'H₀ testing', lv: ['AS','Alevel'],                              h: 23,  half: true },
  /* NARROW NOW. This was full width because the sheet had two widths and this did not fit the other one — at 99mm it is a comfortable two-up table, and the § */
  { id: 'M48', name: 'Numerical methods', face: 'xₙ₊₁ iter',  lv: ['Alevel'],                                   h: 23,  half: true },
  /* ---------- THE PERIODIC TABLE § */
  { id: 'M50', subject: 'Science', name: 'Periodic table', face: 'H He table',  lv: ['Y9 Mocks','GCSE','AS','Alevel','B-TEC'],    h: 96,  half: false, inExam: true },
  /* ---------- THE pH SCALE AND THE INDICATORS § */
  { id: 'M51', subject: 'Science', name: 'Acids, alkalis & indicators', face: 'pH 0–14', lv: ['Y9 Mocks','GCSE','B-TEC'], h: 34, half: true, pair: true, inExam: false },
  /* ---------- THE NUMBER LINE WITH NEGATIVES § */
  { id: 'M52', name: 'Negative number line', face: '−10 0 10 line', lv: ['SATs','11+','Y9 Mocks','GCSE'], h: 15, half: false, inExam: false, at0: 35 },
];

/* ---------- EACH COMPONENT'S HEIGHT, IN MILLIMETRES OF PAPER § */
const MAT_SLOT = {
  M02: 112, M03: 112, M04: 28, M05: 20, M06: 42, M07: 30, M08: 60, M09: 40, M10: 18, M11: 24,
  M12A: 14, M12B: 18, M12C: 18, M12D: 18, M12E: 14, M12F: 14, M12G: 18, M12H: 14,
  M13: 36, M14: 44, M15: 54, M16: 46, M17: 38, M18: 32, M19: 54, M20: 72, M21: 42, M22: 46,
  M23: 46, M24: 38, M25: 42, M26: 44, M27: 50, M28: 46, M29: 24, M30: 36, M31: 46, M32: 46,
  M33: 66, M34: 44, M35: 56, M36: 50, M37: 36, M38: 46, M39: 46, M40: 46, M41: 54, M42: 42,
  M43: 38, M44: 54, M45: 38, M46: 46, M47: 42, M48: 44, M49: 60, M50: 98, M51: 42, M52: 22,
  /* M52 MEASURED ON THE PRINTED SHEET: 18.8mm under a block, with its rule and the 3mm beneath it —
     given a millimetre for another browser's mono and rounded up to the row, 22. */
  /* THE ENGLISH PIECES (see `MAT_PARTS_EN`), measured the same way — each alone at its own slot width, its scroll height read off the page — and given a millimetre § */
  E02: 22, E03: 54, E04: 34, E05: 66, E06: 42, E07: 58, E08: 58, E09: 42, E10: 34, E11: 48,
  E12: 26, E13: 36, E14: 36, E15: 66, E16: 50, E17: 42, E18: 32, E19: 56, E20: 52, E21: 30,
  E22: 44,
};
const matSlot = c => {
  const mm = MAT_SLOT[c.id] || (Number(c.h) || 20) + 8;
  return Math.ceil(mm / MAT_ROW) * MAT_ROW;
};


/* WHAT IS TICKED WHEN IT OPENS, from the sheet when the sheet says. § */
function matStart() {
  /* ---------- NOTHING IS TICKED UNLESS THE SHEET SAYS SO § */
  return (DATA.cheatsheet || []).filter(r => r && r.startOn).map(r => r.id);
}
/* ---------- NOTHING IS CHOSEN FOR YOU § */
let MAT_LEVEL = 'all';
let MAT_ON = [];   /* filled from the sheet by matStart() when the tool opens */
/* WHETHER ANYBODY HAS CHOSEN ANYTHING YET. Without this, opening the tool a second time would
   silently undo the sheet somebody had just built. */
let MAT_TOUCHED = false;

/* THE LEVELS THE REST OF THE SITE USES. § */
function matLevels() {
  /* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as options, which is the proof. § */
  const got = ((DATA.dropdowns || {}).levels || []).filter(Boolean);
  return got.length ? got
    : ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel', 'B-TEC'];
}

/* THE BRAND, READ THE WAY THE FLYER READS IT. § */
const matBrand = () => (typeof flyBrand === 'function' ? flyBrand() : {
  name:  brand('name', '@family.'),
  area:  brand('area', 'Merton & Wandsworth'),
  site:  brand('site', 'halexdias31-pixel.github.io/family/'),
  phone: brand('phone', ''),
});

/* ---------- WHERE THE COMPONENTS COME FROM § */
/* THE SHEET SAYS `Higher` AND THE CODE SAYS 'H'. § */
const matTierFlag = v => /^h/i.test(String(v || '').trim()) ? 'H'
                       : (/^f/i.test(String(v || '').trim()) ? 'F' : '');

function matParts() {
  const rows = DATA.cheatsheet || [];
  const by = {};
  rows.forEach(r => { if (r && r.id) by[String(r.id).toUpperCase()] = r; });

  /* THE MATHS AND THE ENGLISH, one list — see `MAT_PARTS_EN`. Concatenated here rather than
     written into `MAT_PARTS`, so the English is one block that can be read, and moved, whole. */
  const all = MAT_PARTS.concat(MAT_PARTS_EN);

  const out = all.map((c, i) => {
    const r = by[c.id];
    /* IN THE CODE AND NOT IN THE SHEET is not the same as switched off. § */
    if (!r) return Object.assign({}, c, { h: c.edge ? MAT_ROOM : matSlot(c), at: c.at0 || (i + 1) * 10 });
    const levels = String(r.levels || '').split(/[,\n|]/).map(s => s.trim()).filter(Boolean);
    return Object.assign({}, c, {
      name:  r.name || c.name,
      /* A SUBJECT THE SHEET CAN SET, and an empty cell leaves the code's — see `matSubjectOf`. */
      subject: r.subject || c.subject,
      lv:    levels.length ? levels : c.lv,
      /* THE SHEET CAN ADD A TIER AND IT CAN TAKE ONE AWAY. `'-'` is how you say "both papers" about
         a component the code calls Higher-only, since an empty cell already means "no opinion" and
         one value cannot mean both. */
      tier:  r.tier === '-' ? '' : (matTierFlag(r.tier) || c.tier),
      /* ---------- AN EDGE PIECE'S HEIGHT IS NOT A SETTING § */
      /* ---------- AND THE SLOT IS NOT A SETTING EITHER § */
      h:     c.edge ? MAT_ROOM : matSlot(c),
      /* WHETHER THE EXAM GIVES YOU THIS. Only the sheet knows — nothing in the code has an opinion,
         and null stays null so "nobody has checked" survives all the way to the screen. */
      /* THE SHEET WINS, THE CODE ANSWERS WHEN IT IS SILENT. `null` from the tab means the cell was
         empty, which is "nobody has checked" — and that is not the same as the code not knowing. */
      inExam: (r.inExam === undefined || r.inExam === null)
                ? (c.inExam === undefined ? null : c.inExam) : r.inExam,
      at:    r.order === null || r.order === undefined ? (c.at0 || (i + 1) * 10) : r.order,
    });
  });

  /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a column
     of blank `sort_order` cells leaves the sheet exactly as it prints today, and filling in one cell
     moves one component. */
  /* ONE SUBJECT AFTER ANOTHER, THEN THE SHEET'S ORDER WITHIN IT. § */
  const order = matSubjectOrder(out);
  const rank = c => { const s = matSubjectOf(c); return s ? order.indexOf(s) + 1 : 0; };
  return out.sort((a, b) => rank(a) - rank(b) || a.at - b.at);
}

/* ---------- THE BLOCKS § */
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
      /* THE DECIMALS ONLY WHERE THE FRACTIONS ARE SILENT. § */
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
     [fr('1','8'),'0.125','12.5%'], [fr('1','1'),'1.0','100%']]
      .map(([f, d, p]) => `<i><b>${f}</b><em>${d}</em><em>${p}</em></i>`).join('')}</div>`,
  /* THE THIRD ENTRY IS THE TIER. § */
  M12A: () => matPairs([['Circle','A = πr² · C = 2πr']]),
  M12B: () => matPairs([['Arc, sector', fr('θ','360') + ' × 2πr · × πr²']]),
  M12C: () => matPairs([['Sphere', 'V = ' + fr('4','3') + 'πr³ · A = 4πr²']]),
  M12D: () => matPairs([['Cone', 'V = ' + fr('1','3') + 'πr²h · πrl']]),
  M12E: () => matPairs([['Prism','V = cross-section × length']]),
  M12F: () => matPairs([['Compound','speed = d/t · density = m/v']]),
  M12G: () => matPairs([['% change', fr('new − old','old') + ' × 100']]),
  M12H: () => matPairs([['Interest','P(1 + r)ⁿ']]),
  /* EVERY VALUE AS √n ÷ 2, INCLUDING THE ONES THAT SIMPLIFY. § */
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
                       ['a⁰','1'],['a⁻ⁿ', fr('1','aⁿ'), 'H'],
                       /* SUPERSCRIPT, LIKE THE FIVE ABOVE IT. § */
                       ['a<sup>1/n</sup>','ⁿ√a','H'],
                       ['a<sup>1/2</sup>','√a','H']]),
  M16: () => matGraphs(),
  /* PARALLEL IS ON BOTH PAPERS AND PERPENDICULAR IS NOT — the one distinction in this block, and
     the reason it could not be tiered as a whole. */
  M17: () => matPairs([['y = mx + c','m is the gradient, c the crossing'],
                       ['gradient', fr('y₂ − y₁','x₂ − x₁')],
                       ['parallel','same m'], ['perpendicular','m₁ × m₂ = −1', 'H']]),
  M18: () => matPairs([['mean','add up, divide by how many'], ['median','in order, take the middle'],
                       ['mode','the one that appears most'], ['range','biggest minus smallest']]),

  /* ---------- THE SECONDARY SET § */
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

  M30: () => `<div class="mat-circ">${[
  /* THE DIAMETER IS DASHED, because it is construction rather than part of the theorem — the
     theorem is the two lines to the edge and the right angle they make. */
  matCirc('<path d="M20,52 L100,52" class="dash"/>' +
          '<path d="M20,52 L60,12 L100,52" class="ln"/>' +
          '<path d="M60,12 L54.3,17.7 L60,23.4 L65.7,17.7 Z" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'semicircle &rarr; 90&deg;'),

  matCirc('<path d="M25.4,72 L60,52 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L60,12 L94.6,72" class="ln"/>' +
          '<text x="60" y="70" class="lb" text-anchor="middle">2x</text>' +
          '<text x="60" y="34" class="lb" text-anchor="middle">x</text>',
          'centre &rarr; twice the edge'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ch"/>' +
          '<path d="M25.4,72 L40,17.4 L94.6,72" class="ln"/>' +
          '<path d="M25.4,72 L80,17.4 L94.6,72" class="ln"/>' +
          '<text x="34" y="33" class="lb">x</text><text x="79" y="33" class="lb">x</text>',
          'same segment &rarr; equal'),

  matCirc('<polygon points="31.7,23.7 88.3,23.7 94.6,72 25.4,72" class="ln"/>' +
          '<text x="36" y="37" class="lb">x</text><text x="82" y="66" class="lb">y</text>',
          'cyclic quad &rarr; 180&deg;'),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,52 L60,92" class="ln"/>' +
          '<path d="M60,84 L68,84 L68,92" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'tangent &amp; radius &rarr; 90&deg;'),

  /* THIS ONE IS DRAWN ON ITS OWN CIRCLE — the external point has to sit inside the box, so the circle moves up and shrinks rather than the point falling off the § */
  matCirc('<circle cx="60" cy="45" r="34" class="rim"/>' +
          '<path d="M60,100 L27.7,58.9 M60,100 L92.3,58.9" class="ln"/>' +
          '<path d="M44,80 L50,76 M76,80 L70,76" class="mk"/>' +
          '<circle cx="60" cy="100" r="1.8" class="dot"/>',
          'two tangents &rarr; equal', true),

  matCirc('<path d="M14,92 L106,92" class="ln"/><path d="M60,92 L94.6,32" class="ln"/>' +
          '<path d="M25.4,32 L60,92 M25.4,32 L94.6,32" class="ln"/>' +
          '<text x="67" y="87" class="lb">x</text><text x="30" y="46" class="lb">x</text>',
          'alternate segment &rarr; same'),

  matCirc('<path d="M25.4,72 L94.6,72" class="ln"/><path d="M60,52 L60,72" class="ln"/>' +
          '<path d="M60,64 L68,64 L68,72" class="mk"/>' +
          '<path d="M42.7,68 L42.7,76 M77.3,68 L77.3,76" class="mk"/>' +
          '<circle cx="60" cy="52" r="1.8" class="dot"/>',
          'centre to chord &rarr; bisects')
].join('')}</div>`,

  M49: () => `<div class="mat-venn">${[
    matVenn(VS_LENS, 'A &#8745; B', 'in both'),
    matVenn('<circle class="vs-on" cx="38" cy="28" r="22"/><circle class="vs-on" cx="58" cy="28" r="22"/>',
            'A &#8746; B', 'in either'),
    /* NOT-A IS THE BOX WITH ONE HOLE IN IT, and the hole is A alone. § */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>' +
            '<circle class="vs-out" cx="38" cy="28" r="22"/>',
            'A&#8242;', 'not in A'),
    /* AND &#958; IS EVERYTHING, circles included — shading the box but leaving the two circles white
       says "everything except A and B", which is the one thing &#958; is not. */
    matVenn('<rect class="vs-on" x="3" y="3" width="90" height="50"/>',
            '&#958;', 'everything'),
  ].join('')}</div>`,

  M31: () => matPairs([['adding','same denominator first'], ['multiplying','tops × tops'],
                       ['dividing','flip and multiply'], ['of','× the fraction'],
                       ['mixed → improper','whole × bottom, + top'], ['simplifying','÷ both by the HCF']]),

  /* ---------- A-LEVEL § */
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

  M50: () => matPeriodic(),

  M51: () => matPh(),
  /* −10 TO 10, ONE TICK A WHOLE NUMBER, PLACED BY PERCENTAGE like M04 so the line is the same at any slot width. § */
  M52: () => {
    let h = '<em class="l"></em><em class="r"></em>';
    for (let n = -10; n <= 10; n++) {
      const at = (n + 10) * 5;
      const z = n === 0 ? ' class="z"' : '';
      h += `<i${z} style="left:${at}%"></i><b${z} style="left:${at}%">${n < 0 ? '−' + (-n) : n}</b>`;
    }
    return `<div class="mat-neg">${h}</div>`;
  },
};

/* ---------- THE pH SCALE § */
const MAT_PH = ['#d7191c', '#e8402b', '#f0672d', '#f68f2f', '#fbb72f', '#f7dc33', '#c9d936', '#5fb846',
                '#2f9e6b', '#1f8aa0', '#2168b0', '#2f4ea3', '#4a3a96', '#5e2c86', '#6d1f75'];
function matPh() {
  if (MAT_PH.length !== 15) return '<p class="mat-gone">The pH scale has a colour missing.</p>';
  const cells = MAT_PH.map((c, n) =>
    `<i style="background:${c};color:${n >= 3 && n <= 7 ? '#111' : '#fff'}">${n}</i>`).join('');
  /* THE THREE INDICATORS, as the words a mark scheme accepts. § */
  const ind = [['litmus', 'red', 'blue'], ['methyl orange', 'red', 'yellow'],
               ['phenolphthalein', 'colourless', 'pink']]
    .map(([n, a, b]) => `<i><b>${n}</b><em>${a}</em><em>${b}</em></i>`).join('');
  return `<div class="mat-ph">
    <div class="mat-ph-bar">${cells}</div>
    <div class="mat-ph-say"><span>&larr; acid</span><span>neutral 7</span><span>alkali &rarr;</span></div>
    <p class="mat-ph-note">strong acid 0&ndash;2 &middot; weak acid 3&ndash;6 &middot; weak alkali 8&ndash;11 &middot; strong alkali 12&ndash;14. One pH lower is 10&times; more H&#8314; ions.</p>
    <div class="mat-ph-ind"><i><b></b><em>in acid</em><em>in alkali</em></i>${ind}</div>
  </div>`;
}

/* ---------- THE PERIODIC TABLE, 118 OF THEM § */
const MAT_ELEMENTS = ('H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu '
  + 'Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm '
  + 'Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np '
  + 'Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og').split(' ');

/* WHERE ELEMENT Z SITS: § */
function matPtAt(z) {
  if (z === 1) return [1, 1];
  if (z === 2) return [1, 18];
  const small = (start, row) => {           /* periods 2 and 3: two s-block, then six p-block */
    const k = z - start;
    return [row, k < 2 ? k + 1 : k + 11];
  };
  if (z <= 10) return small(3, 2);
  if (z <= 18) return small(11, 3);
  if (z <= 36) return [4, z - 18];
  if (z <= 54) return [5, z - 36];
  const heavy = (start, row, fRow, fFrom) => {  /* periods 6 and 7, with their f-block pulled out */
    if (z < start + 2) return [row, z - start + 1];
    if (z <= fFrom + 14) return [fRow, z - fFrom + 3];
    return [row, z - fFrom - 11];
  };
  if (z <= 86) return heavy(55, 6, 9, 57);
  return heavy(87, 7, 10, 89);
}

/* THE CELL IS A NUMBER AND A SYMBOL, which is what the question asked for and what fits: § */
function matPeriodic() {
  if (MAT_ELEMENTS.length !== 118) return '<p class="mat-gone">The periodic table has a symbol missing.</p>';
  let h = '';
  [[1, '1'], [2, '2'], [13, '3'], [14, '4'], [15, '5'], [16, '6'], [17, '7'], [18, '0']]
    .forEach(([col, g]) => { h += `<s style="grid-area:1/${col}">${g}</s>`; });
  MAT_ELEMENTS.forEach((sym, n) => {
    const z = n + 1, [row, col] = matPtAt(z);
    h += `<i style="grid-area:${row + 1}/${col}"><em>${z}</em><b>${sym}</b></i>`;
  });
  /* WHERE THE f-BLOCK WAS TAKEN FROM, so the gap under barium reads as a reference rather than as a
     missing element. */
  h += '<u style="grid-area:7/3">57–71</u><u style="grid-area:8/3">89–103</u>';
  return `<div class="mat-pt">${h}</div>`;
}

const matGrid = (cls, n, cell) => {
  let h = '';
  for (let k = 1; k <= n; k++) h += cell(k);
  return `<div class="${cls}">${h}</div>`;
};
/* EVERY PAIRS BLOCK IS TIER-FILTERED HERE, once, rather than in each of the four that use it — so a
   row tagged 'H' anywhere disappears on Foundation without its block having to know about tiers. */
/* ---------- A FRACTION, DRAWN AS ONE § */
const fr = (top, bottom) =>
  `<span class="mat-fr"><span>${top}</span><span>${bottom}</span></span>`;


/* ---------- FOUR VENNS, ONE PICTURE EACH § */
const matVenn = (fill, sym, say) =>
  `<i><svg viewBox="0 0 96 56" xmlns="http://www.w3.org/2000/svg">
      <rect class="vs-box" x="3" y="3" width="90" height="50"/>
      ${fill}
      <circle class="vs-c" cx="38" cy="28" r="22"/>
      <circle class="vs-c" cx="58" cy="28" r="22"/>
      <text class="vs-l" x="20" y="14">A</text><text class="vs-l" x="72" y="14">B</text>
      <text class="vs-x" x="7" y="50">&#958;</text>
    </svg><b>${sym}</b><em>${say}</em></i>`;

/* THE LENS. Both arcs bulge the same way, so the path traces one circle down and the other back up
   — the two crossing points are where x = 48 and y = 28 &plusmn; &radic;(22&sup2; &minus; 10&sup2;). */
const VS_LENS = '<path class="vs-on" d="M48 8.4 A22 22 0 0 0 48 47.6 A22 22 0 0 0 48 8.4 Z"/>';

/* `own` IS FOR THE ONE FIGURE THAT NEEDS A DIFFERENT CIRCLE. § */
const matCirc = (inner, cap, own) =>
  `<i><svg viewBox="0 0 120 104" xmlns="http://www.w3.org/2000/svg">${
     own ? '' : '<circle cx="60" cy="52" r="40" class="rim"/>'}${inner}</svg><em>${cap}</em></i>`;

const matPairs = rows => `<div class="mat-two">${
  rows.filter(r => matKeep(r[2])).map(([a, b]) => `<i><b>${a}</b><em>${b}</em></i>`).join('')}</div>`;

/* ---------- THE DRAWN PIECES § */
/* ---------- EVERY SHAPE THE SAME SIZE ON THE PAGE § */
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

/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. § */
function matProtractor() {
  /* A PROTRACTOR YOU CAN ACTUALLY READ AT THE ENDS. § */
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

/* ---------- THE TRICK, WHICH BEATS THE TABLE § */
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

/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the half of it nobody can use. § */
function matGraphs() {
  const W = 44, H = 34;
  /* ---------- A BREAK IN A CURVE IS PART OF THE CURVE § */
  const curve = f => {
    const runs = [];
    let run = [];
    for (let k = 0; k <= 40; k++) {
      const x = -1.6 + 3.2 * k / 40;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 3) {
        if (run.length > 1) runs.push(run);
        run = [];
        continue;
      }
      run.push((W / 2 + x * W / 3.6).toFixed(1) + ',' + (H / 2 - y * H / 7).toFixed(1));
    }
    if (run.length > 1) runs.push(run);
    return runs;
  };
  /* FOUNDATION RECOGNISES LINEAR AND QUADRATIC. Cubic, reciprocal and exponential are Higher, and
     the tier is the fourth entry rather than the third because the third is the function. */
  const kinds = [['linear','y = x', x => x], ['quadratic','y = x²', x => x * x],
                 ['cubic','y = x³', x => x ** 3, 'H'],
                 /* NO CLAMP. Returning 9 near zero was a way of forcing a skip under the old
                    single-line drawing; now the skip is real, `1/x` can be handed over as itself
                    and the |y| > 3 test does the cutting. */
                 ['reciprocal','y = 1/x', x => 1 / x, 'H'],
                 ['exponential','y = 2ˣ', x => Math.pow(2, x) - 1, 'H']];
  return `<div class="mat-graphs">${kinds.filter(k => matKeep(k[3])).map(([n, eq, f]) =>
    `<div><svg viewBox="0 0 ${W} ${H}">
      ${/* AXES IN THE SHEET'S GREY. § */
            ''}
      <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="#b4ae9c" stroke-width=".4"/>
      <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" stroke="#b4ae9c" stroke-width=".4"/>
      ${curve(f).map(pts =>
        `<polyline points="${pts.join(' ')}" fill="none" stroke="currentColor" stroke-width="1.2"/>`
      ).join('')}
    </svg><span>${n}</span><em>${eq}</em></div>`).join('')}</div>`;
}

/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. § */
function matRuler(mmHigh) {
  let h = '';
  for (let mm = 0; mm <= mmHigh; mm++) {
    /* THE LENGTH IS A CLASS, NOT A NUMBER TYPED HERE. § */
    const long = mm % 10 === 0, mid = mm % 5 === 0;
    h += `<i class="${long ? 'cm' : (mid ? 'mid' : '')}" style="top:${mm}mm"></i>`;
    if (long && mm > 0) h += `<b style="top:${mm}mm">${mm / 10}</b>`;
  }
  /* ---------- THE SHEET SAYS WHAT TO DO WHEN IT COMES OUT WRONG § */
  h += '<s class="mat-rule-say">100% scale<br>no fit to page</s>';
  return h;
}

/* A SUBJECT, AND THE ENGLISH PIECES IT OPENS § */
const MAT_PARTS_EN = [
  { id: 'E02', subject: 'English', name: 'Alphabet — print and cursive', face: 'Aa Bb alphabet',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 22, half: false, inExam: false },
  { id: 'E03', subject: 'English', name: 'Word classes', face: 'noun · verb',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E04', subject: 'English', name: 'Sentence types', face: 'sentences',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E05', subject: 'English', name: 'Punctuation and what it does', face: '. , ; : marks',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 52, half: true, inExam: false },
  { id: 'E06', subject: 'English', name: 'Apostrophes', face: '’s apostrophes',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 30, half: true, inExam: false },
  { id: 'E07', subject: 'English', name: 'Homophones', face: 'their · there',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 40, half: true, inExam: false },
  { id: 'E08', subject: 'English', name: 'Spelling rules', face: 'i before e',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E09', subject: 'English', name: 'PEE / PETAL paragraph', face: 'PEE · PETAL',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 48, half: true, inExam: false },
  { id: 'E10', subject: 'English', name: 'What to say about a quotation', face: '“…” quotes',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 46, half: true, inExam: false },
  { id: 'E11', subject: 'English', name: 'AFOREST', face: 'AFOREST',
    lv: ['11+', 'Y9 Mocks', 'GCSE'], h: 46, half: true, inExam: false },
  { id: 'E12', subject: 'English', name: 'Ethos, pathos, logos', face: 'ethos · pathos',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 26, half: true, inExam: false },
  { id: 'E13', subject: 'English', name: 'Connectives by job', face: 'however · so',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 44, half: true, inExam: false },
  { id: 'E14', subject: 'English', name: 'Sentence openers', face: 'openers',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 32, half: true, inExam: false },
  { id: 'E15', subject: 'English', name: 'Devices worth naming', face: 'simile · etc.',
    lv: ['11+', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 56, half: true, inExam: false },
  { id: 'E16', subject: 'English', name: 'Structure methods', face: '↻ structure',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E17', subject: 'English', name: "Instead of 'said', 'good', 'bad'", face: 'said → muttered',
    lv: ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks'], h: 34, half: true, inExam: false },
  { id: 'E18', subject: 'English', name: 'Letter, article, speech', face: 'Dear… forms',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 42, half: true, inExam: false },
  { id: 'E19', subject: 'English', name: 'Reading question stems', face: '“How does…”',
    lv: ['Y9 Mocks', 'GCSE', 'B-TEC'], h: 36, half: true, inExam: false },
  { id: 'E20', subject: 'English', name: 'Poetry: form and sound', face: 'enjambment',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 40, half: true, inExam: false },
  { id: 'E21', subject: 'English', name: 'Tiers of vocabulary', face: 'tier 1 2 3 words',
    lv: ['Y9 Mocks', 'GCSE', 'AS', 'Alevel'], h: 28, half: true, inExam: false },
  { id: 'E22', subject: 'English', name: 'Proofreading checklist', face: '✓ proofread',
    lv: ['SATs', '11+', 'Y9 Mocks', 'GCSE'], h: 26, half: true, inExam: false },
];

/* ---------- THE ENGLISH DRAWINGS § */
const MAT_ABC = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const MAT_HTML_EN = {
  /* PRINT OVER JOINED, LETTER BY LETTER. § */
  E02: () => `<div class="mat-abc">${MAT_ABC.map(l =>
    `<i><b>${l}${l.toLowerCase()}</b><em>${l}${l.toLowerCase()}</em></i>`).join('')}</div>`,
  E03: () => matPairs([['noun', 'dog, London, joy'], ['verb', 'run, is, think'],
                       ['adjective', 'tall, red'], ['adverb', 'quickly, soon'],
                       ['pronoun', 'she, it, they'], ['preposition', 'under, after'],
                       ['conjunction', 'and, because'], ['determiner', 'the, a, some']]),
  E04: () => matPairs([['simple', 'one main clause'],
                       ['compound', 'two main clauses: and, but, or, so'],
                       ['complex', 'main + subordinate: because, although, when, if'],
                       ['minor', 'not a full sentence: “Nice one.”']]),
  E05: () => matPairs([['.', 'ends a sentence'], [',', 'splits a list or a clause'],
                       ['?', 'ends a question'], ['!', 'surprise or force'],
                       ['’', 'a missing letter, or belonging'], ['“ ”', 'the words spoken'],
                       [':', 'brings in a list or a reason'], [';', 'joins two linked sentences'],
                       ['( )', 'extra information'], ['–', 'a pause, or an aside']]),
  /* ITS AND IT'S GET A ROW EACH, because that is the line the sheet's note says catches everybody —
     and it catches them precisely because every other belonging word takes the apostrophe. */
  E06: () => matPairs([['missing letters', 'do not → don’t'], ['one owner', 'the dog’s bone'],
                       ['more than one', 'the dogs’ bones'], ['no s plural', 'the children’s'],
                       ['its', 'belonging: its tail'], ['it’s', 'it is, or it has']]),
  E07: () => matPairs([['their', 'belongs to them'], ['there', 'a place'], ['they’re', 'they are'],
                       ['your', 'belongs to you'], ['you’re', 'you are'],
                       ['to · too · two', 'towards · also · 2'], ['of · off', 'belonging · not on'],
                       ['were · we’re · where', 'was, plural · we are · a place']]),
  E08: () => matPairs([['most plurals', '+ s: cats'], ['s x ch sh', '+ es: boxes'],
                       ['consonant + y', 'y → ies: babies'], ['f, fe', 'often ves: leaves'],
                       ['short vowel', 'double it: hop → hopping'],
                       ['silent e', 'drop it: make → making'],
                       ['i before e', 'except after c: receive'],
                       ['and where it fails', 'weird, seize, science']]),
  /* THE STEMS ARE THE POINT, which is what the note asks for: § */
  E09: () => matPairs([['Point', 'The writer presents…'], ['Evidence', 'This is shown when “…”'],
                       ['Technique', 'The writer uses…'], ['Analysis', 'The word “…” suggests…'],
                       ['Link', 'This links to… / So…'],
                       ['PEE', 'Point, Evidence, Explain = T + A']]),
  E10: () => matPairs([['zoom in', 'The word “…” suggests…'], ['name it', 'a metaphor, a verb…'],
                       ['the effect', 'It makes the reader feel…'],
                       ['link it out', 'This fits the wider idea that…']]),
  E11: () => matPairs([['A', 'alliteration'], ['F', 'facts'], ['O', 'opinions'],
                       ['R', 'rhetorical questions'], ['E', 'emotive language'],
                       ['S', 'statistics'], ['T', 'triples — the rule of three']]),
  /* THE TEST IS A QUESTION TO ASK OF THE TEXT, which is what the note means by a one-line test: the
     names are easy to learn and hard to spot, and each of these is the thing to ask to spot one. */
  E12: () => matPairs([['ethos', 'trust: why believe the speaker?'],
                       ['pathos', 'feeling: does it move you?'],
                       ['logos', 'logic: reasons and evidence?']]),
  E13: () => matPairs([['adding', 'and, also, furthermore'], ['contrasting', 'but, however, whereas'],
                       ['causing', 'because, so, therefore'], ['sequencing', 'first, then, finally'],
                       ['concluding', 'overall, in conclusion']]),
  E14: () => matPairs([['adverb', 'Slowly, …'], ['-ing', 'Running to the door, …'],
                       ['simile', 'Like a ghost, …'], ['preposition', 'Under the bridge, …'],
                       ['subordinate', 'Although it was late, …']]),
  E15: () => matPairs([['simile', 'like or as'], ['metaphor', 'says it IS something else'],
                       ['personification', 'a thing acting human'], ['alliteration', 'same first sound'],
                       ['onomatopoeia', 'sounds like it means: buzz'], ['hyperbole', 'deliberate exaggeration'],
                       ['imagery', 'a picture in words'], ['juxtaposition', 'opposites side by side'],
                       ['pathetic fallacy', 'weather matches mood'], ['semantic field', 'a group of linked words']]),
  E16: () => matPairs([['opening', 'how it hooks you'], ['shift', 'focus moves: out → in, past → now'],
                       ['cyclical', 'ends where it began'], ['foreshadowing', 'a hint of what comes'],
                       ['zoom', 'narrows to a detail, or widens'], ['flashback', 'a jump back in time']]),
  /* THREE SHORT COLUMNS, as the note says — which is the measures block's shape with a third column,
     so it borrows `.mat-meas` rather than starting a fourth kind of list. */
  E17: () => `<div class="mat-meas mat-three">${[
      ['said', ['whispered', 'shouted', 'muttered', 'replied', 'gasped', 'insisted']],
      ['good', ['brilliant', 'kind', 'excellent', 'skilful', 'delightful', 'generous']],
      ['bad', ['awful', 'cruel', 'dreadful', 'harmful', 'rotten', 'terrible']]]
    .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  E18: () => matPairs([['letter', 'Dear… → Yours sincerely (a name), faithfully (Sir, Madam)'],
                       ['article', 'headline, strapline, subheadings'],
                       ['speech', 'greet them, say “you”, end with what to do']]),
  E19: () => matPairs([['list four', 'short facts, from the lines given'],
                       ['how… language', 'words, methods, effect'],
                       ['how… structured', 'start, shifts, ending'],
                       ['to what extent', 'judge it, with quotations'],
                       ['summarise', 'the differences, inferred'],
                       ['compare', 'both texts, views and methods']]),
  E20: () => matPairs([['stanza', 'a verse: a group of lines'], ['metre', 'the beat: iambic is da-DUM'],
                       ['rhyme scheme', 'ABAB, AABB…'], ['enjambment', 'a sentence runs over the line'],
                       ['caesura', 'a pause inside a line'], ['volta', 'the turn in the thought'],
                       ['writing it', 'name it, quote it, say what it does']]),
  E21: () => matPairs([['tier 1', 'everyday: happy, walk — talk'],
                       ['tier 2', 'academic: analyse, significant — any essay'],
                       ['tier 3', 'subject: metaphor, sonnet — naming it']]),
  E22: () => matPairs([['1', 'capitals and full stops'], ['2', 'spellings from the question'],
                       ['3', 'a new paragraph for each new point, time or speaker'],
                       ['4', 'its / it’s, their / there'],
                       ['5', 'read it back: does each sentence make sense?']]),
};
Object.assign(MAT_HTML, MAT_HTML_EN);

/* ---------- WHICH SUBJECT A PIECE IS § */
const matSubjectOf = c => (!c || c.edge) ? '' : String(c.subject || 'Maths');

/* WHAT IS CHOSEN. Maths until somebody says otherwise, because the maths is most of the library and
   what this tool was built as; `all` is "every subject" and mixes them on one sheet. */
let MAT_SUBJECT = 'Maths';

/* THE SUBJECTS THAT HAVE PIECES, and no others — a subject with nothing under it is an option that empties the list, which is a dead control wearing a name. § */
function matSubjectOrder(list) {
  const n = {};
  (list || []).forEach(c => { const s = matSubjectOf(c); if (s) n[s] = (n[s] || 0) + 1; });
  return Object.keys(n).sort((a, b) => n[b] - n[a] || a.localeCompare(b));
}
const matSubjects = parts => matSubjectOrder(parts || matParts());

/* ---------- THE PIECES A GROUP AT A TIME § */
const MAT_GROUPS = [
  ['Number',               ['M02', 'M03', 'M04', 'M05', 'M10', 'M52', 'M28']],
  ['Fractions & %',        ['M11', 'M31', 'M22', 'M12G', 'M12H', 'M23', 'M24']],
  ['Algebra',              ['M25', 'M26', 'M15', 'M37', 'M41', 'M36']],
  ['Graphs & rates',       ['M17', 'M16', 'M42', 'M12F']],
  ['Geometry',             ['M07', 'M08', 'M09', 'M20', 'M30']],
  ['Area & volume',        ['M21', 'M06', 'M12A', 'M12B', 'M12C', 'M12D', 'M12E']],
  ['Trigonometry',         ['M19', 'M13', 'M14', 'M29', 'M38', 'M39', 'M40']],
  ['Data & chance',        ['M18', 'M27', 'M49', 'M45', 'M46', 'M47']],
  ['Calculus',             ['M32', 'M33', 'M34', 'M35', 'M48', 'M43', 'M44']],
  ['Spelling',             ['E02', 'E07', 'E08', 'E21']],
  ['Grammar',              ['E03', 'E04', 'E05', 'E06']],
  ['Writing',              ['E11', 'E12', 'E13', 'E14', 'E17', 'E18', 'E22']],
  ['Reading',              ['E09', 'E10', 'E15', 'E16', 'E19', 'E20']],
  ['Chemistry',            ['M50', 'M51']],
];
const MAT_GROUP_OTHER = 'Other';
const MAT_GROUP_BY = {};
MAT_GROUPS.forEach(([g, ids]) => ids.forEach(id => { MAT_GROUP_BY[id] = g; }));
/* THE RULER IS IN EVERY GROUP, for the reason it is in every subject: it goes down the edge of any
   sheet, so it is offered wherever you are rather than filed under one topic you might never open. */
const matGroupOf = c => (!c || c.edge) ? '' : (MAT_GROUP_BY[c.id] || MAT_GROUP_OTHER);
/* WHICH GROUP IS ON THE SCREEN. Empty until settled, and `matSettle` puts it on the first group the
   subject and level have pieces in — a group that has emptied (Calculus at SATs) is not left showing. */
let MAT_GROUP = '';
const matInGroup = c => { const g = matGroupOf(c); return !g || g === MAT_GROUP; };
/* THE GROUPS THIS SUBJECT AND LEVEL HAVE PIECES IN, in the table's order — asked of `matShown`, so a
   group appears exactly when the paper could carry something from it. */
function matGroupChoices(parts) {
  const has = {};
  (parts || matParts()).forEach(c => { const g = matGroupOf(c); if (g && matShown(c)) has[g] = true; });
  return MAT_GROUPS.map(x => x[0]).concat(MAT_GROUP_OTHER).filter(g => has[g]);
}

/* ---------- AND WHERE IT OPENS FOR A STUDENT § */
function matOwnLevel_(parts) {
  if (typeof USER === 'undefined' || !USER) return null;
  const known = matLevelChoices(parts).map(o => o.v.split('|')[0]);
  const fit = l => known.find(k => norm(k) === norm(l)) || '';
  const own = fit(USER.level || (USER.profile || {}).level || '');
  if (own) return { level: own, subject: '' };
  let jobs = [];
  try { jobs = (DATA.liveJobs || DATA.jobs || []).filter(j => j && norm(j.client) === norm(USER.name)); }
  catch (e) { jobs = []; }
  jobs.sort((a, b) => String(b.startDate || '').localeCompare(String(a.startDate || '')));
  const subs = matSubjects(parts);
  for (const j of jobs) {
    const level = fit(j.level);
    if (!level) continue;
    /* "English Language", "(Single) Chemistry" — the bookable names — carry this tool's subject as a
       word inside them, or carry nothing it knows. */
    const subject = subs.find(s => norm(j.subject).indexOf(norm(s)) !== -1) || '';
    return { level, subject };
  }
  return null;
}

/* ---------- ONE LIST OF LEVELS, AND THE TIER INSIDE IT § */
const MAT_TIERED_SUBJECTS = ['Maths'];
const matTierSplits = l => MAT_TIERED.indexOf(l) !== -1
  && (MAT_SUBJECT === 'all' || MAT_TIERED_SUBJECTS.indexOf(MAT_SUBJECT) !== -1);
const matLevelValue = () => MAT_LEVEL === 'all' ? 'all'
  : (matTierSplits(MAT_LEVEL) ? MAT_LEVEL + '|' + MAT_TIER : MAT_LEVEL);

function matLevelChoices(parts) {
  const used = {};
  (parts || matParts()).forEach(c => {
    if (c.edge) return;
    if (MAT_SUBJECT !== 'all' && matSubjectOf(c) !== MAT_SUBJECT) return;
    c.lv.forEach(l => { used[l] = true; });
  });
  const known = matLevels();
  const levels = known.filter(l => used[l])
    .concat(Object.keys(used).filter(l => known.indexOf(l) === -1));
  const out = [{ v: 'all', say: 'Every level' }];
  levels.forEach(l => {
    if (matTierSplits(l)) out.push({ v: l + '|F', say: l + ' Foundation' }, { v: l + '|H', say: l + ' Higher' });
    else out.push({ v: l, say: l });
  });
  return out;
}

/* ---------- WHAT IS ON THE SHEET IS WHAT IS SHOWN, TICKED § */
function matShown(c, ignoreExam) {
  if (!c) return false;
  const s = matSubjectOf(c);
  if (s && MAT_SUBJECT !== 'all' && s !== MAT_SUBJECT) return false;
  /* NO LEVEL MEANS EVERY LEVEL — the ruler's `lv` is empty, and reading that as "belongs to nothing"
     would hide it at every level. */
  if (MAT_LEVEL !== 'all' && c.lv.length && c.lv.indexOf(MAT_LEVEL) === -1) return false;
  if (!matKeep(c.tier)) return false;
  if (!ignoreExam && MAT_EXAM === 'not' && c.inExam === true) return false;
  return true;
}

/* THE CHOICES, PUT RIGHT BEFORE ANYTHING IS DRAWN. § */
function matSettle(parts) {
  const subs = matSubjects(parts);
  if (MAT_SUBJECT !== 'all' && subs.indexOf(MAT_SUBJECT) === -1) MAT_SUBJECT = subs[0] || 'all';
  if (matLevelChoices(parts).map(o => o.v).indexOf(matLevelValue()) === -1) MAT_LEVEL = 'all';
  MAT_SHOW = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL)) ? MAT_TIER : 'H';
  /* THE GROUP LAST, because which groups have pieces is a question about the subject, the level
     and the tier just settled — and it reads `matShown`, which reads `MAT_SHOW`. */
  const groups = matGroupChoices(parts);
  if (groups.indexOf(MAT_GROUP) === -1) MAT_GROUP = groups[0] || '';
}

/* THE OPTIONS ARE WRITTEN ONLY WHEN THEY CHANGE. § */
/* A WeakMap rather than an attribute, so the markup does not carry a copy of itself, and so a select
   `initMat` has just rebuilt starts with nothing remembered and is always written. */
const MAT_OPTS = new WeakMap();
const matOptions_ = (sel, html) => {
  if (MAT_OPTS.get(sel) === html) return;
  sel.innerHTML = html;
  MAT_OPTS.set(sel, html);
};
/* THE TWO SELECTS AND THE ONE BOX, drawn from the same state every time rather than patched by the handler that changed them — a control that says one thing § */
function matChoices(parts) {
  const sub = $('mat-subject'), lev = $('mat-level'), given = $('mat-given');
  const subs = matSubjects(parts);
  if (sub) {
    matOptions_(sub, subs.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')
      + '<option value="all">Every subject</option>' + matPaperOptions_());
    sub.value = MAT_SUBJECT;
    /* ONE SUBJECT WAS NO CHOICE and the select was hidden — but the practice paper kinds are in it
       now (`matPaperOptions_`), so there is always a choice and it is always drawn. */
  }
  if (lev) {
    matOptions_(lev, matLevelChoices(parts)
      .map(o => `<option value="${esc(o.v)}">${esc(o.say)}</option>`).join(''));
    lev.value = matLevelValue();
  }
  /* THE GROUP, WITH WHAT IS TICKED IN EACH ON ITS OWN OPTION. § */
  const grp = $('mat-group');
  if (grp) {
    const groups = matGroupChoices(parts);
    const ticked = g => parts.filter(c => !c.edge && matGroupOf(c) === g && matShown(c)
      && MAT_ON.indexOf(c.id) !== -1).length;
    matOptions_(grp, groups.map(g => {
      const n = ticked(g);
      return `<option value="${esc(g)}">${esc(g + (n ? ' · ' + n + '✓' : ''))}</option>`;
    }).join(''));
    grp.value = MAT_GROUP;
    /* ONE GROUP IS NO CHOICE — the subject select's own rule. Science is two pieces in one group. */
    (grp.closest('.mat-sel') || grp).hidden = groups.length < 2;
  }
  /* "GIVEN IN THE EXAM" ONLY WHERE SOMETHING IS. § */
  if (given) {
    given.hidden = !parts.some(c => c.inExam === true && matShown(c, true));
    const box = given.querySelector('input');
    if (box) box.checked = MAT_EXAM === 'not';
  }
}

/* ---------- PRACTICE PAPER: A HANDWRITING SHEET, LINED, OR SQUARED § */
const MAT_KINDS = [
  { v: 'cheat', say: 'Cheat sheet' },
  { v: 'hand',  say: 'Handwriting' },
  { v: 'lined', say: 'Lined paper' },
  { v: 'grid',  say: 'Squared paper' },
];
const MAT_KIND_WORD = { cheat: 'Cheat sheet', hand: 'Handwriting worksheet', lined: 'Lined paper',
                        grid: 'Squared paper' };
let MAT_KIND = 'cheat';

/* `for` IS WHICH KIND OF PAPER ASKS THE QUESTION. § */
const MAT_BLANK_OPTS = {
  size:  { for: 'hand',  say: 'Writing size', opts: [['8', 'Large · 8mm'], ['6', 'Medium · 6mm'], ['4', 'Small · 4mm']] },
  gap:   { for: 'hand',  say: 'Practice rows', opts: [['1', '1 practice row'], ['2', '2 practice rows']] },
  line:  { for: 'lined', say: 'Line spacing', opts: [['8', '8mm · standard'], ['6', '6mm · narrow'],
                                                     ['10', '10mm · wide'], ['12', '12mm · early years']] },
  grid:  { for: 'grid',  say: 'Square size', opts: [['5', '5mm squares'], ['7', '7mm squares'], ['10', '1cm squares']] },
};
const MAT_TEXT_MAX = 120;
const MAT_TEXT_FIRST = 'The quick brown fox jumps over the lazy dog.';
const matBlankFresh_ = () => ({ text: MAT_TEXT_FIRST, size: '8', gap: '1', line: '8', grid: '5' });
let MAT_BLANK = matBlankFresh_();

/* THE ONE DOOR EVERY SETTING COMES IN BY — the select, the text box and `matRecall` all call it — so
   the closed list is enforced in one place. Answers whether it took the value. */
function matBlankSet_(k, v) {
  if (k === 'text') {
    /* CONTROL CHARACTERS OUT, runs of space to one: the words are drawn on one line each, and a
       pasted tab or newline would be a gap nobody typed. */
    MAT_BLANK.text = String(v == null ? '' : v).replace(/[\u0000-\u001f\u007f]+/g, ' ')
      .replace(/\s+/g, ' ').trim().slice(0, MAT_TEXT_MAX);
    return true;
  }
  const o = MAT_BLANK_OPTS[k];
  if (!o || !o.opts.some(p => p[0] === String(v))) return false;
  MAT_BLANK[k] = String(v);
  return true;
}

/* THE CONTROLS, ALL OF THEM, each wrapped with the kind it belongs to. Built once by `initMat`;
   `matBlankPaint_` shows the ones for the kind chosen and sets each value from `MAT_BLANK`. */
function matBlankControls_() {
  const sel = k => {
    const o = MAT_BLANK_OPTS[k];
    return `<label class="mat-sel" data-for="${o.for}"><select data-do="mat-blank" data-k="${k}"
      aria-label="${esc(o.say)}">${o.opts.map(p =>
        `<option value="${esc(p[0])}">${esc(p[1])}</option>`).join('')}</select></label>`;
  };
  /* A TEXT BOX AT 16px, the global rule's size, because anything smaller makes iOS zoom the page on focus. § */
  return `<input type="text" id="mat-text" class="mat-text" data-for="hand" maxlength="${MAT_TEXT_MAX}"
      autocomplete="off" aria-label="Words to trace" placeholder="Words to trace — or leave blank">
    ${Object.keys(MAT_BLANK_OPTS).map(sel).join('')}`;
}

/* ---------- THE RULINGS, AS SVG STROKES § */
const MAT_BLANK_H = 260;
const matN = v => +(+v).toFixed(2);

/* THE FOUR-LINE RULING. § */
function matHandRows_() {
  /* A SKIP BETWEEN RULINGS, a band and a half. § */
  const b = +MAT_BLANK.size, skip = 1.5 * b, pitch = 3 * b + skip;
  const rows = Math.max(1, Math.floor((MAT_BLANK_H - b + skip) / pitch));
  /* THE RULINGS ARE CENTRED IN THE DRAWING, so the white left over above and below is shared rather
     than all left under the last one. */
  const y0 = (MAT_BLANK_H - (rows * pitch - skip)) / 2;
  /* WRAPPED BY ESTIMATE, at 0.55em a character — a lower-case alphabet in these faces averages about 0.5em, and an estimate erring wide only ends a row a word § */
  const fs = b / matXRatio_();
  const per = Math.max(4, Math.floor((MAT_TEXT_W - 6) / (0.55 * fs)));
  const words = [];
  MAT_BLANK.text.split(' ').filter(Boolean).forEach(w => {
    /* A WORD LONGER THAN A ROW is cut at the row, not left to run off it. */
    while (w.length > per) { words.push(w.slice(0, per)); w = w.slice(per); }
    if (w) words.push(w);
  });
  const wrap = n => words.reduce((out, w) => {
    const last = out[out.length - 1];
    if (last !== undefined && last.length + 1 + w.length <= n) out[out.length - 1] = last + ' ' + w;
    else out.push(w);
    return out;
  }, []);
  /* BALANCED, NOT GREEDY. § */
  let lines = wrap(per);
  for (let n = Math.ceil(words.join(' ').length / Math.max(1, lines.length)); n < per; n++) {
    const tryIt = wrap(n);
    if (tryIt.length <= lines.length) { lines = tryIt; break; }
  }
  /* THE TRACE ROWS AND THE PRACTICE ROWS, IN TURN, AND THE WORDS COME ROUND AGAIN until the page is full — a sheet that traced its sentence once and then had § */
  const plan = [];
  const each = 1 + +MAT_BLANK.gap;
  for (let r = 0; r < rows; r++) {
    const k = r % each;
    plan.push(lines.length && k === 0 ? lines[Math.floor(r / each) % lines.length] : '');
  }
  return { b, pitch, plan, fs, y0 };
}

/* ---------- THE x-HEIGHT, MEASURED IN THE FACE THAT WILL PRINT § */
const MAT_TRACE_FONT = '"Comic Sans MS", "Comic Neue", "Andika", "Century Gothic", "Trebuchet MS", sans-serif';
let MAT_XR = 0;
function matXRatio_() {
  if (MAT_XR) return MAT_XR;
  try {
    const i = document.createElement('i');
    i.style.cssText = 'position:absolute;left:-1000px;top:0;visibility:hidden;display:block;'
                    + 'font-size:100px;height:1ex;width:1px;font-family:' + MAT_TRACE_FONT;
    document.body.appendChild(i);
    const h = i.getBoundingClientRect().height;
    i.remove();
    /* A FACE WITH AN x-HEIGHT OUTSIDE A THIRD TO TWO THIRDS OF ITS SIZE is a measurement gone wrong,
       not a face — kept out rather than drawing letters twice the ruling. */
    if (h > 33 && h < 67) MAT_XR = h / 100;
  } catch (e) { /* no layout: the fallback below */ }
  return MAT_XR || .52;
}

function matBlankSvg_() {
  const W = MAT_TEXT_W, H = MAT_BLANK_H;
  const svg = inner => `<svg class="mat-ruling" viewBox="0 0 ${W} ${H}" width="${W}mm" height="${H}mm"
    style="width:${W}mm;height:${H}mm" aria-hidden="true">${inner}</svg>`;
  const path = (cls, d) => d ? `<path class="${cls}" d="${d}"/>` : '';
  if (MAT_KIND === 'hand') {
    const { b, pitch, plan, fs, y0 } = matHandRows_();
    let top = '', mid = '', base = '', foot = '', words = '';
    plan.forEach((t, r) => {
      const y = y0 + r * pitch;
      top += `M0 ${matN(y)}H${W}`;
      mid += `M0 ${matN(y + b)}H${W}`;
      base += `M0 ${matN(y + 2 * b)}H${W}`;
      foot += `M0 ${matN(y + 3 * b)}H${W}`;
      if (t) words += `<text class="mat-trace" x="3" y="${matN(y + 2 * b)}" font-size="${matN(fs)}"
        font-family='${MAT_TRACE_FONT}'>${esc(t)}</text>`;
    });
    return svg(path('mat-ln', top + foot) + path('mat-ln-mid', mid) + path('mat-ln-base', base) + words);
  }
  if (MAT_KIND === 'lined') {
    /* EXERCISE-BOOK RULING: § */
    const s = +MAT_BLANK.line;
    let d = '';
    for (let y = s; y <= H + 0.01; y += s) d += `M0 ${matN(y)}H${W}`;
    return svg(path('mat-ln', d) + path('mat-ln-margin', `M25 0V${H}`));
  }
  /* SQUARED: WHOLE SQUARES ONLY, centred in the drawing. A part-square down one edge is a square a
     child counts and gets wrong, and a grid hard against the left with 3mm spare on the right reads
     as printed crooked. */
  const s = +MAT_BLANK.grid;
  const nx = Math.floor(W / s), ny = Math.floor(H / s);
  const x0 = (W - nx * s) / 2, y0 = (H - ny * s) / 2;
  let d = '';
  for (let i = 0; i <= nx; i++) d += `M${matN(x0 + i * s)} ${matN(y0)}V${matN(y0 + ny * s)}`;
  for (let j = 0; j <= ny; j++) d += `M${matN(x0)} ${matN(y0 + j * s)}H${matN(x0 + nx * s)}`;
  return svg(path('mat-ln mat-ln-grid', d));
}

/* WHAT THE PAPER SAYS ABOUT ITSELF, for the head, the order and the line under the card. § */
function matBlankSay_() {
  const opt = k => (MAT_BLANK_OPTS[k].opts.find(p => p[0] === MAT_BLANK[k]) || ['', ''])[1];
  if (MAT_KIND === 'hand') return { title: 'Handwriting practice', size: opt('size'),
    parts: [MAT_BLANK.text ? 'Words: ' + MAT_BLANK.text : 'No words — ruling only', opt('size'), opt('gap')] };
  if (MAT_KIND === 'lined') return { title: 'Lined paper · ' + MAT_BLANK.line + 'mm', size: opt('line'), parts: [opt('line')] };
  return { title: 'Squared paper · ' + (MAT_BLANK.grid === '10' ? '1cm' : MAT_BLANK.grid + 'mm'), size: opt('grid'),
    parts: [opt('grid')] };
}

/* THE PAINT FOR PAPER, called by `matPaint` in place of everything after the choices. § */
function matBlankPaint_(list) {
  const pick = $('mat-blank');
  if (pick) {
    pick.querySelectorAll('[data-for]').forEach(el => { el.hidden = el.getAttribute('data-for') !== MAT_KIND; });
    pick.querySelectorAll('select[data-k]').forEach(s => { s.value = MAT_BLANK[s.getAttribute('data-k')]; });
    /* NOT WHILE SOMEBODY IS TYPING IN IT — setting a focused box's value moves the caret to the end. */
    const t = $('mat-text');
    if (t && document.activeElement !== t) t.value = MAT_BLANK.text;
  }
  const B = matBrand();
  const say = matBlankSay_();
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  MAT_SHEET = `<div class="mat-sheet is-blank is-${MAT_KIND}">
    <div class="mat-head"><h3>${esc(say.title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-name"><span>Name</span><i></i><span>Date</span><i></i></div>
    ${matBlankSvg_()}
    <div class="mat-foot"><span>${esc(foot)}</span><b>${esc(B.site)}</b></div></div>`;
  const rows = MAT_KIND === 'hand' ? matHandRows_().plan.length : 0;
  $('mat-said').className = 'mat-said';
  /* A COUNT, NOT THE SETTING AGAIN — the select right above already says "8mm". How many lines or
     squares the page holds is the thing the select cannot say. */
  const sq = +MAT_BLANK.grid;
  $('mat-said').innerHTML = `<b>One A4 page</b> · ${esc(MAT_KIND === 'hand'
    ? rows + ' rulings' + (MAT_BLANK.text ? '' : ', no words to trace')
    : MAT_KIND === 'lined' ? Math.floor(MAT_BLANK_H / +MAT_BLANK.line) + ' lines'
    : Math.floor(MAT_TEXT_W / sq) + ' × ' + Math.floor(MAT_BLANK_H / sq) + ' squares')}`;
  $('mat-go').disabled = false;
  /* THE BASKET LINE: the same `print` line as a cheat sheet, so the laminate switch comes with it and nothing in the basket learns a new kind. § */
  MAT_ORDER = {
    ok: true,
    key: 'paper:' + MAT_KIND + '|' + (MAT_KIND === 'hand' ? MAT_BLANK.size + '|' + MAT_BLANK.gap + '|' + MAT_BLANK.text
      : MAT_KIND === 'lined' ? MAT_BLANK.line : MAT_BLANK.grid),
    name: MAT_KIND_WORD[MAT_KIND] + ' — ' + (MAT_KIND === 'hand'
      ? (MAT_BLANK.text ? '“' + (MAT_BLANK.text.length > 28 ? MAT_BLANK.text.slice(0, 27) + '…' : MAT_BLANK.text) + '”, ' : '')
        + say.size.split(' · ')[0].toLowerCase()
      : say.size.split(' · ')[0]),
    parts: say.parts,
  };
  const trolley = list && list.closest('#mat-box') && list.closest('#mat-box').querySelector('[data-do="mat-cart"]');
  if (trolley) {
    const inCart = typeof CART !== 'undefined' && CART.some(c => c.kind === 'print' && c.key === MAT_ORDER.key);
    tileSet_(trolley, inCart ? { label: 'In your basket', note: '', on: true, off: false }
                             : { label: 'Have it printed', note: 'into your basket', on: false, off: false });
  }
}

/* THE PAPER KINDS AS OPTIONS OF THE SUBJECT SELECT — see the note in `initMat`. Prefixed, so no
   subject the sheet could ever name is mistaken for one. */
const MAT_PAPER_AT = 'paper:';
const matPaperOptions_ = () => '<optgroup label="Practice paper">' + MAT_KINDS.filter(k => k.v !== 'cheat')
  .map(k => `<option value="${MAT_PAPER_AT}${k.v}">${esc(k.say)}</option>`).join('') + '</optgroup>';
on('mat-blank', el => {
  MAT_TOUCHED = true;
  matBlankSet_(el.getAttribute('data-k'), el.value);
  matPaint();
  matRemember();
});
/* TYPED INTO, SO NOT THROUGH THE CLICK OR CHANGE DISPATCHER — the search box's own pattern in find.js.
   Debounced: the sheet is rebuilt on each paint, and a rebuild per keystroke is a box that lags. */
let matTextTimer = null;
document.addEventListener('input', e => {
  if (!e.target || e.target.id !== 'mat-text') return;
  MAT_TOUCHED = true;
  matBlankSet_('text', e.target.value);
  clearTimeout(matTextTimer);
  matTextTimer = setTimeout(() => { keepDue_('mat', null); matPaint(); matRemember(); }, 200);
  /* KEPT AS THE PAGE GOES even inside the 0.2 s (`keepDue_`, data.js; docs/history/317). */
  keepDue_('mat', () => { clearTimeout(matTextTimer); matRemember(); });
});

/* ---------- WHERE YOU LEFT IT § */
const MAT_KEEP_AT = 'matChoice';
function matRemember() {
  try {
    localStorage.setItem(MAT_KEEP_AT, JSON.stringify({
      s: MAT_SUBJECT, l: MAT_LEVEL, t: MAT_TIER, x: MAT_EXAM, g: MAT_GROUP, on: MAT_ON,
      k: MAT_KIND, p: MAT_BLANK }));
  } catch (e) { /* a phone that will not store it simply opens fresh next time */ }
}
function matRecall() {
  try {
    const v = JSON.parse(localStorage.getItem(MAT_KEEP_AT) || 'null');
    if (!v || typeof v !== 'object') return false;
    if (typeof v.s === 'string') MAT_SUBJECT = v.s;
    if (typeof v.l === 'string') MAT_LEVEL = v.l;
    if (v.t === 'F' || v.t === 'H') MAT_TIER = v.t;
    MAT_EXAM = v.x === 'not' ? 'not' : 'all';
    /* A GROUP FROM BEFORE GROUPS EXISTED IS NO GROUP, and `matSettle` picks the first. */
    if (typeof v.g === 'string') MAT_GROUP = v.g;
    if (Array.isArray(v.on)) MAT_ON = v.on.map(String);
    /* A KIND THIS VERSION DOES NOT KNOW IS THE CHEAT SHEET, and the paper's settings are each put back through `matBlankSet_`, which refuses a value it does not § */
    MAT_KIND = MAT_KINDS.some(k => k.v === v.k) ? v.k : 'cheat';
    if (v.p && typeof v.p === 'object') Object.keys(v.p).forEach(k => matBlankSet_(k, v.p[k]));
    return true;
  } catch (e) { return false; }
}

/* ---------- THERE IS NO FILL AND NO CLEAR § */

/* ---------- THE PICKER AND THE SHEET § */
function initMat() {
  const box = $('mat-box');
  if (!box) return;
  /* SET EACH TIME THE TOOL OPENS, not once at load: § */
  if (!MAT_TOUCHED) {
    if (matRecall()) MAT_TOUCHED = true;
    else {
      MAT_ON = matStart();
      /* A STUDENT'S OWN LEVEL, when their sessions say it — see `matOwnLevel_`. Not marked as a
         choice: nobody chose it, so a later visit with a new booking may answer differently. */
      const own = matOwnLevel_(matParts());
      if (own) { MAT_LEVEL = own.level; if (own.subject) MAT_SUBJECT = own.subject; }
    }
  }
  box.innerHTML = `
    <div class="mat-pick">
      ${/* SELECTS, IN THE ORDER THE QUESTION IS ASKED: § */
            ''}
      <label class="mat-sel"><select id="mat-subject" data-do="mat-subject"
        aria-label="Subject"></select></label>
      <label class="mat-sel" data-cheat><select id="mat-level" data-do="mat-level"
        aria-label="Level"></select></label>
      ${/* THE THIRD QUESTION, WHICH TOPIC — see `MAT_GROUPS`. It is what keeps the list under the
            fold of a 320x568 phone, and it says on each option how much of the sheet is in it. */''}
      <label class="mat-sel" data-cheat><select id="mat-group" data-do="mat-group"
        aria-label="Topic"></select></label>
    </div>
    ${/* ---------- PRACTICE PAPER IS ASKED FOR IN THE SUBJECT SELECT, NOT A SELECT OF ITS OWN § */
          ''}
    <div id="mat-blank" class="mat-blank-pick" hidden>${matBlankControls_()}</div>
    <div id="mat-cheat">
    <label class="check mat-given" id="mat-given" hidden><input type="checkbox" data-do="mat-exam">
      <span class="box"></span><span>Skip what the exam gives you</span></label>
    ${/* ---------- THE LIST IS THE WHOLE LIST, AND THE PANE DECIDES WHAT FITS § */
          ''}
    <div class="mat-list" id="mat-list"></div>
    <div class="mat-gauge" id="mat-gauge"><i></i></div>
    </div>
    <p class="mat-said" id="mat-said"></p>
    ${/* ---------- PRINT IT YOURSELF, OR HAVE IT PRINTED § */
          ''}
    <div class="mat-do">
      <button class="btn" data-do="mat-print" id="mat-go">Print the sheet</button>
      ${tile_({ icon: 'cart', label: 'Have it printed', note: 'into your basket', act: 'mat-cart' })}
    </div>`;

  /* ONE LIBRARY, SO NO HEADINGS. § */
  $('mat-list').innerHTML = matParts().map(c => {
    /* GIVEN IN THE EXAM IS SAID ON THE ROW, IN WORDS, and only on the few it is true of. § */
    const notes = [c.note, c.inExam === true ? 'given in the exam' : '']
      .filter(Boolean).map(n => `<em class="mat-note">${esc(n)}</em>`).join('');
    return `<label title="${esc(c.name)}" aria-label="${esc(c.name)}" data-id="${esc(c.id)}"${
      c.inExam === true ? ' class="given"' : ''}><input
       type="checkbox" data-do="mat-tick"
       data-id="${esc(c.id)}"${MAT_ON.indexOf(c.id) !== -1 ? ' checked' : ''}>
     <span class="mat-txt"><b class="mat-face">${esc(c.face || c.name)}</b>${
       /* A NOTE BELONGS TO THE COMPONENT, NOT TO THE TOOL. § */
       notes}</span></label>`;
  }).join('');
  matPaint();
}

/* SWITCHING SUBJECT OR LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. § */
on('mat-subject', el => {
  MAT_TOUCHED = true;
  /* A PAPER KIND IS NOT A SUBJECT, and choosing one leaves the subject where it was — so coming back
     from lined paper finds the cheat sheet as it was left. */
  const v = String(el.value || 'all');
  if (v.indexOf(MAT_PAPER_AT) === 0) {
    const k = v.slice(MAT_PAPER_AT.length);
    MAT_KIND = MAT_KINDS.some(x => x.v === k && k !== 'cheat') ? k : 'cheat';
    matPaint(); matRemember(); return;
  }
  MAT_KIND = 'cheat';
  MAT_SUBJECT = v;
  matPaint();
  matRemember();
});
on('mat-level', el => {
  MAT_TOUCHED = true;
  const [l, t] = String(el.value || 'all').split('|');
  MAT_LEVEL = l || 'all';
  if (t === 'F' || t === 'H') MAT_TIER = t;
  matPaint();
  matRemember();
});
/* A GROUP CHANGES WHAT IS LISTED AND NOTHING ELSE — the paper is every tick at this subject and
   level, whichever group is showing, so the gauge does not move when this does. */
on('mat-group', el => {
  MAT_TOUCHED = true;
  MAT_GROUP = String(el.value || '');
  matPaint();
  matRemember();
});
on('mat-exam', el => {
  MAT_TOUCHED = true;
  MAT_EXAM = el.checked ? 'not' : 'all';
  matPaint();
  matRemember();
});
on('mat-tick', el => {
  MAT_TOUCHED = true;
  const id = el.getAttribute('data-id');
  const at = MAT_ON.indexOf(id);
  if (el.checked && at === -1) MAT_ON.push(id);
  if (!el.checked && at !== -1) MAT_ON.splice(at, 1);
  matPaint();
  matRemember();
});

/* WHAT DRAWS A PIECE. One lookup: § */
function matDraw(c) {
  return MAT_HTML[c.id] ? MAT_HTML[c.id]()
    : `<p class="mat-gone">${esc(c.name)} has nothing to draw it.</p>`;
}

function matPaint() {
  const list = $('mat-list');
  /* THE PICKER IS WHAT MUST BE THERE — there is no sheet on the card to look for any more. */
  if (!list || !$('mat-said')) return;
  /* ONE READ OF THE PARTS FOR THE WHOLE PAINT — the choices, the list and the sheet are all asked
     about the same list, so they cannot be answering about two. */
  const parts = matParts();

  /* THE CHOICES FIRST, BECAUSE EVERYTHING BELOW READS THEM. § */
  matSettle(parts);
  matChoices(parts);

  /* ---------- PRACTICE PAPER TAKES THE PAINT FROM HERE § */
  const sub = $('mat-subject');
  if (sub && MAT_KIND !== 'cheat') sub.value = MAT_PAPER_AT + MAT_KIND;
  const box_ = list.closest('#mat-box');
  if (box_) box_.querySelectorAll('.mat-pick [data-cheat]').forEach(el => {
    /* THE TOPIC'S OWN "one group is no choice" WAS DECIDED BY `matChoices` above; only hide here. */
    if (MAT_KIND !== 'cheat') el.hidden = true;
    else if (el.querySelector('#mat-level')) el.hidden = false;
  });
  const cheatBox = $('mat-cheat'), blankBox = $('mat-blank');
  if (cheatBox) cheatBox.hidden = MAT_KIND !== 'cheat';
  if (blankBox) blankBox.hidden = MAT_KIND === 'cheat';
  if (MAT_KIND !== 'cheat') { matBlankPaint_(list); return; }

  /* THE LIST AND THE PAPER ASK ONE QUESTION — `matShown` — and the tick on each row is drawn from `MAT_ON` rather than left to the box, so a remembered sheet § */
  const byId = {};
  parts.forEach(c => { byId[c.id] = c; });
  let listed = 0;
  if (list) list.querySelectorAll('label').forEach(el => {
    const id = el.getAttribute('data-id');
    const show = matShown(byId[id]);
    /* LISTED IS SHOWN AND IN THE GROUP; PRINTED IS SHOWN. § */
    el.classList.toggle('off', !(show && matInGroup(byId[id])));
    const tick = el.querySelector('input');
    if (tick) tick.checked = MAT_ON.indexOf(id) !== -1;
    /* PIECES, NOT THE RULER. § */
    if (show && byId[id] && !byId[id].edge) listed++;
  });

  const on_ = parts.filter(c => MAT_ON.indexOf(c.id) !== -1 && matShown(c));

  /* AN EDGE PIECE IS NOT IN THE COLUMN. The ruler lives in the margin, so it must not be laid out
     with the others or it would take a row of its own and push everything down a sheet. */
  const pieces = on_.filter(c => !c.edge);

  /* ONE FUNCTION, CALLED ONCE PER BLOCK. The first version had a ternary that invoked `MAT_HTML`
     twice for the same component — drawing a protractor's 181 ticks and throwing one copy away. */
  /* A PIECE THAT IS ALREADY A FINISHED THING GETS NO HEADING AND NO RULE. § */
  /* ---------- ONE GRID, AND EVERY BLOCK TAKES ITS OWN SLOT IN IT § */
  let cellN = 0;
  /* `is-wide` / `is-narrow` BECAUSE A LABEL/VALUE BLOCK LAYS ITSELF OUT DIFFERENTLY at a third of
     the page (two columns) and across the whole of it (four) — the stylesheet reads the class
     rather than working the width out again. */
  const cell = c => `<div class="mat-box${c.bare ? ' bare' : ''}${
    matSpan(c) === MAT_TRACKS ? ' is-wide' : ' is-narrow'}" data-i="${cellN++}" data-id="${
    esc(c.id)}" style="grid-column:span ${matSpan(c)};grid-row:span ${Math.round(c.h / MAT_ROW)}">${
    c.bare ? '' : `<h4>${esc(c.name)}</h4>`}${matDraw(c)}</div>`;
  const h = pieces.map(cell).join('');

  /* THE SUBJECT AND THE LEVEL ARE ON THE PAPER. § */
  const B = matBrand();
  const tierWord = (MAT_LEVEL !== 'all' && matTierSplits(MAT_LEVEL))
    ? (MAT_TIER === 'F' ? ' Foundation' : ' Higher') : '';
  const title = (MAT_SUBJECT === 'all' ? 'Cheat sheet' : MAT_SUBJECT + ' cheat sheet')
    + (MAT_LEVEL === 'all' ? '' : ' — ' + MAT_LEVEL + tierWord);
  /* PHONE ONLY IF THE TAB HAS ONE — a separator with nothing after it reads as something missing
     rather than something not offered. */
  const foot = [B.area, B.phone].filter(Boolean).join('  ·  ');
  /* THE MARGIN BELONGS TO THE RULER, so it goes when the ruler does. Left reserved, an untick
     would take the scale away and leave a 20mm strip of nothing down the page — which reads as a
     printing fault rather than as a choice. */
  const ruled = MAT_ON.indexOf('M01') !== -1;
  /* THE GRID'S THREE NUMBERS ARE HANDED TO THE STYLESHEET FROM HERE, so the tracks the paper is laid out on and the widths the picker prices from are the same § */
  const grid = `--mat-tracks:${MAT_TRACKS};--mat-gut:${MAT_GUT}mm;--mat-row:${MAT_ROW}mm;`
             + `width:${MAT_TEXT_W}mm`;
  const probe = matProbe(`<div class="mat-sheet${ruled ? ' ruled' : ''}">${
    ruled ? `<div class="mat-rule">${matRuler(285)}</div>` : ''}
    <div class="mat-head"><h3>${esc(title)}</h3><span>${esc(B.name)}</span></div>
    <div class="mat-cols" style="${grid}">${h}</div>
    <div class="mat-foot"><span>${esc(foot)}</span>
      <b>${esc(B.site)}</b></div></div>`);

  /* ---------- A SLOT IS NEVER ALLOWED TO CUT A FORMULA OFF § */
  const px = matPx();
  const cols = probe.querySelector('.mat-cols');
  if (cols) cols.querySelectorAll('.mat-box').forEach(b => {
    if (b.scrollHeight <= b.clientHeight + 1) return;
    const rows = Math.ceil(b.scrollHeight / px / MAT_ROW);
    b.style.gridRow = 'span ' + rows;
    if (typeof console !== 'undefined') {
      console.warn('[mat] ' + b.getAttribute('data-id') + ' needs ' + rows * MAT_ROW
                 + 'mm and its slot is smaller — update MAT_SLOT');
    }
  });
  /* THE TOP ROW TAKES NO HAIRLINE. § */
  if (cols) {
    const top = cols.getBoundingClientRect().top;
    cols.querySelectorAll('.mat-box').forEach(b =>
      b.classList.toggle('is-top', b.getBoundingClientRect().top - top < 1));
  }

  /* MEASURED, NOT ADDED UP. The slots are fixed, but which of them the grid packs side by side is
     not something a table of numbers can know. Reading the rendered column is the figure that is
     always right. */
  /* ---------- THE PAGE IS AN AREA, NOT A HEIGHT § */
  const PAGE_H = MAT_ROOM;                       /* usable height, inside the margins */
  const ruleW = ruled ? 20 : 0;
  /* THE WIDTH IS MEASURED TOO. § */
  const box = cols ? cols.getBoundingClientRect() : null;
  const colW = box ? box.width / matPx() : 0;
  const colH = box ? box.height / matPx() : 0;
  const room = Math.round(ruleW * PAGE_H + colW * PAGE_H);
  const used = Math.round(ruleW * PAGE_H + colW * colH);
  const over = used > room;

  /* IN CENTIMETRES SQUARED, and the percentage first. 41,382mm2 is a number nobody can picture;
     414cm2 is a postcard, and "38% used" is what actually gets read. */
  const pct = Math.min(100, Math.round(used / room * 100));
  const left = Math.max(0, Math.round((room - used) / 100));
  $('mat-gauge').classList.toggle('over', over);
  $('mat-gauge').firstElementChild.style.width = pct + '%';
  $('mat-said').className = 'mat-said' + (over ? ' over' : '');
  /* A PERCENTAGE OF ONE PAGE AND A COUNT, which are the two things somebody holding a phone can picture. § */
  const n = pieces.length;
  $('mat-said').innerHTML = over
    /* NOT "OR THE BOTTOM IS CUT OFF", which it said — and could not happen, because Print is disabled while the gauge is over (below). § */
    ? `<b>${Math.round(used / room * 100)}% of one page</b> — untick something`
    : `<b>${pct}% of the page</b> · ${
        n ? `${n} piece${n === 1 ? '' : 's'}${left ? '' : ' · full'}`
        : !listed ? (MAT_EXAM === 'not' && parts.some(c => !c.edge && matShown(c, true))
            ? 'all given in the exam' : 'nothing here for this level yet')
        : 'tick pieces'}`;
  $('mat-go').disabled = over || !n;
  /* ---------- AND WHAT THE BASKET WOULD BE GIVEN § */
  const say = [MAT_SUBJECT === 'all' ? 'every subject' : MAT_SUBJECT,
               MAT_LEVEL === 'all' ? 'every level' : MAT_LEVEL + tierWord].join(' · ');
  MAT_ORDER = {
    ok: !over && n > 0,
    key: 'mat:' + MAT_SUBJECT + '|' + matLevelValue() + '|' + on_.map(c => c.id).sort().join(','),
    name: 'Cheat sheet — ' + say + ' (' + n + ' piece' + (n === 1 ? '' : 's') + ')',
    parts: on_.map(c => c.name),
  };
  /* THE TROLLEY FILLS WHEN THIS EXACT SHEET IS IN THE BASKET, and empties the moment a tick makes it
     a different sheet — the bundle's trolley rule (`cartPaint_`), for one line rather than several. */
  const trolley = list.closest('#mat-box') && list.closest('#mat-box').querySelector('[data-do="mat-cart"]');
  if (trolley) {
    const inCart = typeof CART !== 'undefined' && CART.some(c => c.kind === 'print' && c.key === MAT_ORDER.key);
    tileSet_(trolley, inCart ? { label: 'In your basket', note: '', on: true, off: false }
                             : { label: 'Have it printed', note: 'into your basket', on: false,
                                 off: !MAT_ORDER.ok });
  }
  /* WHAT GOES TO THE PRINTER is the sheet exactly as it was measured — slots grown, top row marked —
     kept as markup so `mat-print` prints the page the gauge was talking about rather than a second
     rendering of it. */
  MAT_SHEET = probe.innerHTML;
  probe.remove();
}

/* THE SHEET AS A BASKET LINE — see the note where `matPaint` fills it. Empty until the first paint. */
let MAT_ORDER = { ok: false, key: '', name: '', parts: [] };

/* ---------- INTO THE BASKET, AS A PRINTED PAGE § */
on('mat-cart', el => {
  if (!USER) { toast('Sign in first'); go('account'); return; }
  const o = MAT_ORDER;
  if (!o.ok) { toast('Tick some pieces that fit on one page first'); return; }
  if (CART.some(c => c.kind === 'print' && c.key === o.key)) { toast('Already in your basket'); return; }
  CART.push({ key: o.key, kind: 'print', name: o.name, pages: 1, cost: 0, parts: o.parts.slice() });
  cartSave();
  if (typeof cartPaint_ === 'function') cartPaint_();
  tileSet_(el, { label: 'In your basket', note: '', on: true });
  /* THE UPGRADE IS NAMED ONLY WHEN IT IS OFFERED — a rate of 0 in the Ledger means no laminating. */
  toast((MAT_KIND_WORD[MAT_KIND] || 'Cheat sheet') + ' in your basket' + (typeof laminateOffered_ === 'function' && laminateOffered_()
    ? ' — laminate it there' : ''));
});

/* ---------- THERE IS NO PREVIEW § */
let MAT_SHEET = '';
function matProbe(html) {
  const p = document.createElement('div');
  p.className = 'mat-probe';
  p.style.cssText = 'position:absolute;left:-10000px;top:0;width:210mm;visibility:hidden;'
                  + 'pointer-events:none';
  p.setAttribute('aria-hidden', 'true');
  p.innerHTML = html;
  document.body.appendChild(p);
  return p;
}

/* HOW MANY PIXELS A MILLIMETRE IS, measured rather than assumed — 3.7795 is what a browser SHOULD make of one, and under a page zoom it is not. § */
function matPx() {
  const p = document.createElement('div');
  p.style.cssText = 'width:100mm;position:absolute;visibility:hidden';
  document.body.appendChild(p);
  const k = p.getBoundingClientRect().width / 100;
  p.remove();
  return k || 3.7795;
}
/* PRINTING FROM INSIDE THE APP. § */
on('mat-print', () => {
  if (!MAT_SHEET) return;
  /* BUILT AT THE END OF THE BODY, from the sheet the gauge measured. § */
  const paper = document.createElement('div');
  paper.className = 'mat-paper';
  paper.innerHTML = MAT_SHEET;
  document.body.appendChild(paper);
  document.body.classList.add('printing-mat');
  const done = () => {
    document.body.classList.remove('printing-mat');
    paper.remove();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  /* AND A TIMER, because some browsers never fire `afterprint` on a cancelled dialogue, and the app
     would be left with everything hidden: a blank screen that looks exactly like a crash. */
  setTimeout(done, 4000);
  /* `window.print()`, NOT `print()`. Bare it works — it is a global — and it reads as a function
     this file forgot to declare, which is exactly what `check.js` said. */
  window.print();
});
