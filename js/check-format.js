#!/usr/bin/env node
/* @family. — check-format.js ONE FORMATTER EACH (owner, 8 Nov): money_ £12.00, date_ 08/11/26, time_ 16:00, day_ Mon.
   A value formatted by hand in a served file fails here; the helpers live in core.js. */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const RULES = [
  { re: /['"]£['"]\s*\+|\+\s*['"]£['"]|£\$\{/, say: 'money by hand — use fmtMoney_()' },
  { re: /\.toFixed\(2\)\.replace\(/, say: 'pence trimmed by hand — use fmtMoney_()' },
  { re: /toLocaleDateString\(|toLocaleTimeString\(|month:\s*'(short|long|numeric|2-digit)'/, say: 'a date by hand — use fmtDate_()' },
  { re: /['"](am|pm)['"]|%\s*12\s*\|\|\s*12|hour12/, say: 'a 12-hour time — use fmtDate_(t, "time")' },
  { re: /\.toTimeString\(\)\.slice/, say: 'a time by hand — use fmtDate_(t, "time")' },
  { re: /\['Sunday',|'Sunday', 'Monday'|\['Sun', 'Mon'/, say: 'a weekday list — use fmtDate_(d, "day") and DAYS_SHORT' },
];
/* Where the helpers are written. */
const ALLOW = [/^const (fmtTime_|fmtDmy_|fmtDay_|fmtHours_) =/, /^const v = Number\(n\) \|\| 0, m = /];

const files = ['index.html'].concat(fs.readdirSync(path.join(ROOT, 'js'))
  .filter(f => /\.js$/.test(f) && !/^check|^_/.test(f)).map(f => 'js/' + f));
const bad = [];
files.forEach(f => {
  let src;
  try { src = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return; }
  src.split('\n').forEach((line, i) => {
    const code = line.replace(/\/\*.*?\*\//g, '').replace(/^\s*(\/\/|\*|\/\*).*$/, '');
    if (ALLOW.some(a => a.test(code.trim()))) return;
    RULES.forEach(r => { if (r.re.test(code)) bad.push(f + ':' + (i + 1) + '  ' + r.say + '\n      ' + line.trim().slice(0, 160)); });
  });
});

if (bad.length) {
  console.log('\nHAND-FORMATTED VALUES  (' + bad.length + ')');
  bad.forEach(b => console.log('  ' + b));
  console.log('FAILED — money, dates, times and days go through fmtMoney_, fmtDate_ and fmtName_ (core.js, data.js).');
  process.exitCode = 1;
} else if (process.env.VERBOSE) {
  console.log('OK — every value shown goes through its one formatter.');
}

/* ONE WORDS FILE (foundation 3): data/settings/words.json, its copy in core.js, and every text_('key') named in it. */
{
  const r = require('child_process').spawnSync(process.execPath, [path.join(ROOT, 'tools/words.js')], { encoding: 'utf8' });
  if (r.status) { process.stdout.write(r.stdout || r.stderr); process.exitCode = 1; }
}
