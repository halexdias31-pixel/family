/* THE SCHOOL YEAR, CHECKED FOR EVERY YEAR (owner, 12 Nov): booking.gs `schoolYear` run for 2020-2040 against the shape rules and the published London dates it was fitted to. */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

const gs = fs.readFileSync(path.join(ROOT, 'backend/booking.gs'), 'utf8');
const a = gs.indexOf('function easter(y)'), b = gs.indexOf('/* ---------- WHICH TERM A WAITING LIST IS FOR');
const schoolYear = new Function(gs.slice(a, b) + '\nreturn schoolYear;')();

/* THE BROWSER'S COPY (arcade.js `tdYear_`, the Term dates card) must give the same days. */
const arc = fs.readFileSync(path.join(ROOT, 'js/arcade.js'), 'utf8');
const ta = arc.indexOf('function tdYear_(y)'), tb = arc.indexOf('/* MY SCHOOL (491)');
const tdYear = new Function(arc.slice(ta, tb) + '\nreturn tdYear_;')();

const iso = d => d.toISOString().slice(0, 10);
const loc = d => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
const fails = [];
const bad = (y, m) => fails.push(`${y}-${String(y + 1).slice(2)}: ${m}`);

/* WANDSWORTH COUNCIL'S PUBLISHED DATES (wandsworth.gov.uk/termdates, read 12 Nov 2026): term first and last days. */
const PUBLISHED = {
  2026: { 'Autumn 1': ['2026-09-02', '2026-10-23'], 'Autumn 2': ['2026-11-02', '2026-12-18'],
    'Spring 1': ['2027-01-04', '2027-02-12'], 'Spring 2': ['2027-02-22', '2027-03-25'],
    'Summer 1': ['2027-04-12', '2027-05-28'], 'Summer 2': ['2027-06-07', '2027-07-22'] },
  2027: { 'Autumn 1': ['2027-09-01', '2027-10-22'], 'Autumn 2': ['2027-11-01', '2027-12-17'],
    'Spring 1': ['2028-01-04', '2028-02-11'], 'Spring 2': ['2028-02-21', '2028-03-31'],
    'Summer 1': ['2028-04-18', '2028-05-26'], 'Summer 2': ['2028-06-05', '2028-07-21'] },
};

for (let y = 2020; y <= 2040; y++) {
  const rows = schoolYear(y);
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].start.getTime() !== rows[i - 1].end.getTime() + 864e5) bad(y, `${rows[i - 1].name} -> ${rows[i].name} is not contiguous`);
  }
  if (rows.some(r => r.end < r.start)) bad(y, 'an interval ends before it starts');
  const next = schoolYear(y + 1)[0];
  if (next.start.getTime() !== rows[rows.length - 1].end.getTime() + 864e5) bad(y, 'the next summer holiday does not follow on');
  let days = 0;
  rows.filter(r => r.kind === 'term').forEach(t => {
    if (t.start.getUTCDay() < 1 || t.start.getUTCDay() > 4) bad(y, `${t.name} starts on day ${t.start.getUTCDay()}`);
    if (t.end.getUTCDay() % 6 === 0) bad(y, `${t.name} ends at a weekend`);
    for (let d = t.start.getTime(); d <= t.end.getTime(); d += 864e5) if (new Date(d).getUTCDay() % 6) days++;
  });
  if (days < 190 || days > 200) bad(y, `${days} weekdays of term (38-40 weeks is 190-200)`);
  const xmas = rows.find(r => r.name === 'Autumn 2').end;
  if (xmas.getUTCMonth() !== 11 || xmas.getUTCDate() > 21) bad(y, `Christmas starts after ${iso(xmas)}`);
  const sum = rows.find(r => r.name === 'Summer 2').end;
  if (sum.getUTCMonth() !== 6 || sum.getUTCDate() < 18 || sum.getUTCDate() > 24) bad(y, `summer ends ${iso(sum)}`);
  const want = PUBLISHED[y] || {};
  Object.keys(want).forEach(n => {
    const t = rows.find(r => r.name === n), got = [iso(t.start), iso(t.end)];
    if (got.join() !== want[n].join()) bad(y, `${n} is ${got.join(' to ')}, published ${want[n].join(' to ')}`);
  });
  const td = tdYear(y);
  rows.slice(1).forEach((r, i) => {
    const c = td[i];
    if (!c || iso(loc(c.from)) !== iso(r.start) || iso(loc(c.to)) !== iso(r.end)) bad(y, `the browser's ${c ? c.name : r.name} disagrees with booking.gs`);
  });
}

if (fails.length) { console.log('check-terms: ' + fails.length + ' problem(s)'); fails.forEach(f => console.log('  ' + f)); process.exit(1); }
console.log('check-terms: 2020-2040 contiguous, Mon-Thu starts, 38-40 weeks, Christmas <= 21 Dec, summer 18-24 Jul, Wandsworth 2026-28 exact, browser agrees');
