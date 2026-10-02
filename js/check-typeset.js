#!/usr/bin/env node
/* ==================================================================================================
   @family. — check-typeset.js

   DOES THE MATHS ON A QUESTION CARD LOOK THE WAY THE PAPER PRINTS IT.

   ASKED FOR AS "no x2 or x^2, it should look how its supposed to look ... it shouldnt be 4/5 it
   should be 4 over the five". Two things answer that and this checks both:

     `typeset_` in find.js     stacks every fraction the library stores as one, and raises every
                               `x^2`, when a card is drawn
     the library itself        holds no fraction, power or times sign written as plain text that
                               `typeset_` cannot know is maths -- `5/8`, `11 m2`, `6x2+3x4`

   IT RUNS THE REAL FUNCTION, CUT OUT OF find.js BY NAME, the way `check-marking.js` runs the real
   marker: a copy here would be a second opinion about what a fraction is, and the day the two
   drifted this would pass while the cards broke. The cutter is `check-marks-load.js`'s, so there
   is one extractor in the repository and not two.

   AND IT ASKS ABOUT WHAT IS DRAWN, NOT WHAT IS STORED. Every rule below runs on `typeset_`'s
   OUTPUT, so a stored `<sup>4</sup>&frasl;<sub>5</sub>` is fine (it is drawn stacked), a stored
   `x^2` is fine (it is drawn raised), and a stored `4/5` fails -- because nothing turns that into
   a fraction, and a check of the store alone would have to keep its own list of which stored
   shapes are fine. One list, in one function, is the point.

   WHAT FAILS:
     1  a fraction slash `typeset_` could not read both sides of, outside a superscript
     2  a whole number over a whole number in plain text, anywhere in the library -- unless
        tools/data/typeset-keep.json names it as something else (41/42 meaning "41 or 42")
     3  a caret left in the text
     4  in a MATHS row: an algebraic slash (`t/2`, `(x + 2) / (2x + 1)`, `?/24`), a letter with a
        digit run onto it (`2x2`, `y5`) or a unit with its power run onto it (`cm3`, `m2`)
     5  a `.frac` that was never given its two halves -- the June 2023 papers drew `A ÷ B` in one
     6  a line on typeset-keep.json that no longer matches anything -- a reason nobody needs

   WHAT IT LEAVES, AND COUNTS, because a silence is not a count:
     * a decimal either side of a slash (`12/17.2`) -- a division in working, as a mark scheme
       writes one; and a slash in a unit (`m/s`, `g/cm³`)
     * a slash inside a superscript -- a fractional index, which the paper sets inline too
     * 1ST CLASS MATHS' LOST POWERS. 1,358 of its rows are raw PDF text and the powers did not
       survive extraction (`Simplify fully 2x2 – 2xy`). They are not plain-text maths somebody
       typed; they are a transcription that has to be redone from the PDFs by position, sheet by
       sheet -- audit maths-1 step 4 -- and until then they are a named backlog, printed with its
       size, rather than either a permanent red or a silence.

     node js/check-typeset.js
================================================================================================== */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const { cutFrom } = require('./check-marks-load.js');

const src = fs.readFileSync(path.join(__dirname, 'find.js'), 'utf8');
const body = cutFrom(src, 'typeset_');
if (!body) {
  /* A CHECK THAT CANNOT FIND ITS SUBJECT MUST EXIT NON-ZERO -- "I did not check" is not "I checked
     and it was fine". */
  console.log('check-typeset: cannot find typeset_ in find.js — renamed?');
  process.exit(1);
}
const typeset_ = eval('(' + body + ')');

const fail = [];

/* ---------- THE FUNCTION, ON THE CASES THAT MATTER -------------------------------------------------
   Every case is a row of the library or a fault that nearly shipped. `F(a, b)` is the stacked form,
   written out once here so a change to the markup is a change in one place. */
const F = (n, d) => '<span class="frac"><span class="frac-n">' + n + '</span><span class="frac-s">/</span>'
  + '<span class="frac-d">' + d + '</span></span>';
const M = (w, n, d) => '<span class="frac-mixed">' + w + F(n, d) + '</span>';
const CASES = [
  ['<sup>4</sup>&frasl;<sub>5</sub>', F(4, 5), 'the stored shape, 442 rows of it'],
  ['5\u20449 and 5&#8260;9', F(5, 9) + ' and ' + F(5, 9), 'the same slash written two other ways'],
  ['Work out 3<sup>4</sup>&frasl;<sub>5</sub> &minus; 1<sup>2</sup>&frasl;<sub>3</sub>',
   'Work out ' + M(3, 4, 5) + ' &minus; ' + M(1, 2, 3), 'Q2(a), June 2024 Higher 1: two mixed numbers'],
  ['<b>2<sup>2</sup>&frasl;<sub>15</sub></b>', '<b>' + M(2, 2, 15) + '</b>',
   'the whole number inside the bold is still the whole number'],
  ['3<i>x</i><sup>2</sup>&frasl;<sub>(<i>x</i> + 2)</sub>', F('3<i>x</i><sup>2</sup>', '<i>x</i> + 2'),
   'a superscript after a LETTER is a power: the numerator is 3x², not 2 -- Q12(a), June 2020 3H'],
  ['<sup>(<i>n</i> &minus; 1)</sup>&frasl;<sub>(<i>n</i> + 1)</sub>', F('<i>n</i> &minus; 1', '<i>n</i> + 1'),
   'one pair of brackets round a whole half goes: the rule is the bracket'],
  ['<sup>3<i>x</i></sup>&frasl;<sub>(<i>x</i> + 2)(<i>x</i> &minus; 4)</sub>',
   F('3<i>x</i>', '(<i>x</i> + 2)(<i>x</i> &minus; 4)'), 'and two pairs stay'],
  ['sin <i>B</i> &frasl; 6.5', F('sin <i>B</i>', '6.5'), 'a function name goes with its argument'],
  ['(<i>x</i> + 1)&frasl;<sub>3</sub>', F('<i>x</i> + 1', 3), 'a bracketed numerator with no <sup>'],
  ['1.3<sup>1&frasl;6</sup>', '1.3<sup>1&frasl;6</sup>', 'a fractional index stays on its line'],
  ['6x^3 - 23x^2', '6x<sup>3</sup> - 23x<sup>2</sup>', 'Q14, June 2024 Higher 1, as the answer column has it'],
  ['e^(4x^2) - 1', 'e<sup>4x<sup>2</sup></sup> - 1', 'a power with a power in it'],
  ['4^-2', '4<sup>&minus;2</sup>', 'a hyphen in an index is a minus sign'],
  ['<a title="x^2">x</a>', '<a title="x^2">x</a>', 'never inside a tag'],
  ['Prose with no maths in it.', 'Prose with no maths in it.', 'and nothing at all happens to prose'],
];
let caseFails = 0;
CASES.forEach(([inp, want, why]) => {
  let got;
  try { got = typeset_(inp); } catch (e) { got = 'THREW ' + e.message; }
  if (got !== want) {
    caseFails++;
    fail.push('typeset_ — ' + why + '\n      in:   ' + inp + '\n      want: ' + want + '\n      got:  ' + got);
  }
});

/* ---------- THE LIBRARY, AS DRAWN --------------------------------------------------------------- */
const rows = fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8').split('\n')
  .filter(l => l.startsWith('{')).map(l => JSON.parse(l.replace(/,\s*$/, '')));
const KEEP = JSON.parse(fs.readFileSync(path.join(ROOT, 'tools', 'data', 'typeset-keep.json'), 'utf8'));
delete KEEP._;
const keepUsed = new Set();
const kept = (rid, text) => {
  const k = KEEP[rid] && Object.prototype.hasOwnProperty.call(KEEP[rid], text);
  if (k) keepUsed.add(rid + '\u0000' + text);
  return k;
};

/* WHAT A READER SEES AS TEXT: no superscripts or subscripts (those are drawn raised or lowered, and
   that is the point of them), the hidden slash gone, every tag a space so two halves of a stacked
   fraction cannot run together into one number, and every entity a space.

   A SCRIPT LEAVES A MARK RATHER THAN A SPACE. The first version blanked it to a space, and
   `305<sup>2</sup>/76<sup>2</sup>` came out as `305 /76` -- a whole number over a whole number that
   nobody wrote, failed three A-level physics answers whose working divides two squares. `§` is
   neither a digit nor a space, so nothing either side of a power can join up across it. */
const unscript = (h, mark) => {
  let s = h, was;
  do { was = s; s = s.replace(/<(sup|sub)\b[^>]*>(?:(?!<\/?(?:sup|sub)\b)[\s\S])*<\/\1>/g, mark || ' '); } while (s !== was);
  return s;
};
const asText = h => unscript(h.replace(/<span class="frac-s">\/<\/span>/g, ' '), '\u00a7')
  .replace(/<[^>]*>/g, ' ').replace(/&#?\w+;/g, ' ');

/* THE SAME TWO SHAPES tools/typeset-plain-maths.py rewrites -- `4/5`, and `4 / 5` with a space each
   side -- and the same idea of a whole number: not touching a digit, a slash, a letter, a decimal
   point or a Greek letter (`3600 / 2π` is a chain of working, not 3600 over 2). */
const BEFORE = '(?<![\\d/\\w?])(?<!\\d[.,])';
const AFTER = '(?![\\d/\\w\\u0370-\\u03ff]|[.,]\\d)';
const WHOLE = new RegExp(BEFORE + '(?:\\d+/\\d+|\\d+ / \\d+)' + AFTER, 'g');
/* A UNIT IS NOT A FRACTION, and these are every unit the library divides: speed, density, pressure,
   a rate. Taken out of the text before the algebra is looked for, and counted. */
const UNITS = /\b(?:k?m|cm|mm|k?g|N|newtons?|J|W|V|mol|counts?|m\u00a7|cm\u00a7)\s?\/\s?(?:s|h|hour|minute|second|year|k?m|cm|mm|m\u00a7|cm\u00a7)(?![A-Za-z])/g;
const DECIMAL = /(?<![\d/\w])\d+(?:\.\d+)?\s?\/\s?\d+(?:\.\d+)?(?![\d/\w])/g;
/* AN ALGEBRAIC SLASH: a digit, a single letter, a bracket or a `?` on at least one side and not a
   unit on both. `m/s`, `km/h`, `g/cm`, `newtons/m` and `Yes / No` are words either side. */
const ALGEBRA = /(?:\?|\b[A-Za-z]\b|[\d)\u00b2\u00b3])\s?\/\s?(?:\?|\b[A-Za-z]\b|[\d(])|\)\s?\/|\/\s?\(/g;
const LOST_VAR = /(?<![A-Za-z0-9])\d*[a-z]{1,2}\d(?![\d.,]|[A-Za-z])/g;
const LOST_UNIT = /(?<![A-Za-z])(?:cm|mm|km|m)[23](?![\d.,A-Za-z])/g;
const BACKLOG = /^Q-1CM-/;

const n = { fields: 0, stacked: 0, mixed: 0, raised: 0, decimal: 0, index: 0, keep: 0, units: 0,
            backlogRows: new Set(), backlogHits: 0 };
const say = (r, f, what, ctx) => fail.push(r.row_id + ' ' + f + ': ' + what + (ctx ? ' — "' + ctx + '"' : ''));
const near = (t, i, len) => t.slice(Math.max(0, i - 30), i + len + 20).replace(/\s+/g, ' ').trim();

rows.forEach(r => {
  if (!r || r.active !== 'True') return;
  const maths = r.subject === 'Maths';
  ['html', 'lead', 'answer', 'choices'].forEach(f => {
    const v = String(r[f] || '');
    if (!v) return;
    (f === 'choices' ? v.split('|') : [v]).forEach(part => {
      n.fields++;
      const out = typeset_(part);
      n.stacked += (out.match(/class="frac"/g) || []).length;
      n.mixed += (out.match(/class="frac-mixed"/g) || []).length;
      n.raised += (part.match(/\^/g) || []).length;
      n.index += (part.match(/<sup>[^<]*(?:\/|&frasl;)[^<]*<\/sup>/g) || []).length;
      /* 1 */
      if (/&frasl;|\u2044|&#8260;/.test(unscript(out))) say(r, f, 'a fraction slash typeset_ could not read both sides of');
      /* 5 */
      /* A `.frac` WHOSE FIRST CHILD IS NOT ONE OF ITS HALVES. A column vector is two `.frac-d`s with
         no rule between them (Q20(b), June 2017 3H) and is right; `A &divide; B` straight inside is
         the June 2023 shape and is not. */
      if (/class=['"]frac['"]>(?!<span class=['"]frac-[nd]['"])/.test(out)) say(r, f, 'a .frac with no top and bottom');
      const t = asText(out);
      /* 3 */
      if (t.indexOf('^') !== -1) say(r, f, 'a caret left in the text', near(t, t.indexOf('^'), 4));
      /* 2 */
      t.replace(DECIMAL, m => { if (m.indexOf('.') !== -1) n.decimal++; return m; });
      for (const m of t.matchAll(WHOLE)) {
        if (kept(r.row_id, m[0])) { n.keep++; continue; }
        say(r, f, 'a whole number over a whole number in plain text', near(t, m.index, m[0].length));
      }
      if (!maths) return;
      /* 4 */
      const u = t.replace(UNITS, m => { n.units++; return ' '; });
      for (const m of u.matchAll(ALGEBRA)) {
        if (/\d\.\d|\d\s?\/\s?\d+\.\d|\d\.\d+\s?\/\s?/.test(near(u, m.index, m[0].length)) && /\d/.test(m[0])) continue;
        if (WHOLE.test(m[0])) { WHOLE.lastIndex = 0; continue; }
        WHOLE.lastIndex = 0;
        if (kept(r.row_id, m[0].trim())) { n.keep++; continue; }
        say(r, f, 'an algebraic slash in plain text', near(u, m.index, m[0].length));
      }
      /* A UNIT IS SAID ONCE, as a unit: `cm3` matches both patterns and printed twice per row. */
      const lost = [...t.matchAll(LOST_VAR)].filter(m => !/^\d*(?:cm|mm|km|m)[23]$/.test(m[0]))
        .map(m => [m, 'a letter with a digit run onto it — a power that did not survive'])
        .concat([...t.matchAll(LOST_UNIT)].map(m => [m, 'a unit with its power run onto it']));
      lost.forEach(([m, what]) => {
        if (kept(r.row_id, m[0])) { n.keep++; return; }
        if (BACKLOG.test(r.row_id)) { n.backlogRows.add(r.row_id); n.backlogHits++; return; }
        say(r, f, what, near(t, m.index, m[0].length));
      });
    });
  });
});

/* 6 */
Object.keys(KEEP).forEach(rid => Object.keys(KEEP[rid]).forEach(text => {
  if (!keepUsed.has(rid + '\u0000' + text)) {
    fail.push('tools/data/typeset-keep.json: ' + rid + ' "' + text + '" matches nothing any more — a reason nobody needs; delete the line');
  }
}));

/* ---------- SAY IT ------------------------------------------------------------------------------ */
console.log('typeset_: ' + (CASES.length - caseFails) + ' of ' + CASES.length + ' cases right');
console.log('the library as drawn: ' + n.fields + ' fields read, ' + n.stacked + ' fractions stacked ('
  + n.mixed + ' of them mixed numbers), ' + n.raised + ' carets raised');
console.log('left as written, on purpose:');
console.log('  ' + String(n.decimal).padStart(5) + '  a decimal either side of a slash — a division in working');
console.log('  ' + String(n.index).padStart(5) + '  a slash inside a superscript — a fractional index');
console.log('  ' + String(n.units).padStart(5) + '  a slash in a unit in a maths row — m/s, g/cm³, km/h');
console.log('  ' + String(n.keep).padStart(5) + '  named on tools/data/typeset-keep.json, one reason each');
console.log('  ' + String(n.backlogHits).padStart(5) + '  lost powers in ' + n.backlogRows.size
  + ' 1st Class Maths rows — raw PDF text, to be re-typed from the PDFs (audit maths-1 step 4)');
if (fail.length) {
  console.log('\nFAILED — ' + fail.length + ':');
  fail.slice(0, 60).forEach(x => console.log('  ' + x));
  if (fail.length > 60) console.log('  … and ' + (fail.length - 60) + ' more');
  process.exit(1);
}
console.log('\nOK — every fraction is drawn stacked, every power raised, and no row writes maths as plain text\n'
  + '     that the card cannot know is maths.');
