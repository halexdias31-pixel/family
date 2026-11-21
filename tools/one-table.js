#!/usr/bin/env node
/* @family. — tools/one-table.js THE ONE-TABLE CHECK (rule 1.75, unify batch 7 lane C).
   An owner would notice a setup card that hides a failed job, or a Sunday email whose skip reasons read two ways, so:
   - the keep-booked jobs live once, in backend/setup.gs `KEEP_BOOKED`; a FAILED_<job> or keep-booked call outside it fails;
   - the digest's skip reasons live once, in backend/digest.gs `DIGEST_SKIP`; a second map keyed on those reasons fails;
   - "the site's copy first, then raw GitHub" lives once, in backend/fetch-site.gs `fetchSiteThenRaw_`; a second loop fails.
   OWED lists the files another lane still has to move onto the helper; each is printed. tools/build.js runs it. */
'use strict';
const { text, srcFiles, report, main } = require('./lib/gen.js');
/* digest-tags.gs is lane-locked (unify batch 7): digestLibrary_ and digestFacetOrder_ keep their own loops until its owner moves them. */
const OWED = ['backend/digest-tags.gs'];
const HELPER = 'backend/fetch-site.gs';
const WHYS = ['email not confirmed', 'asked not to get it', 'same address as another parent'];

function keepBookedProblems() {
  const src = text('backend/setup.gs'), bad = [];
  const a = src.indexOf('const KEEP_BOOKED = ['), b = src.indexOf('\n];', a);
  if (a < 0 || b < 0) return ['backend/setup.gs has no KEEP_BOOKED table'];
  const table = src.slice(a, b), rest = src.slice(0, a) + src.slice(b);
  const ids = (table.match(/\bid:\s*'([^']+)'/g) || []).map(s => s.replace(/.*'([^']+)'/, '$1'));
  if (ids.length < 3) bad.push('backend/setup.gs KEEP_BOOKED lists ' + ids.length + ' job(s); keep-warm, library import and Sunday email belong there');
  (rest.match(/'FAILED_[a-z][\w-]*'/g) || []).forEach(m => bad.push('backend/setup.gs names ' + m + ' outside KEEP_BOOKED (loop over the table)'));
  (rest.match(/\b\w+KeepBooked_\(\)/g) || []).forEach(m => bad.push('backend/setup.gs calls ' + m + ' outside KEEP_BOOKED'));
  return bad;
}

function skipProblems() {
  const bad = [];
  srcFiles('backend', /\.gs$/).forEach(f => {
    const src = text(f);
    /* a map keyed on the why strings: `'email not confirmed':` as a key */
    const keyed = (src.match(/'(?:email not confirmed|asked not to get it|same address as another parent)'\s*:/g) || []).length;
    const home = f === 'backend/digest.gs' && /const DIGEST_SKIP = \{/.test(src);
    if (keyed > (home ? WHYS.length : 0)) bad.push(f + ' keys ' + (keyed - (home ? WHYS.length : 0)) + ' skip reason(s) outside DIGEST_SKIP');
  });
  if (!/const DIGEST_SKIP = \{/.test(text('backend/digest.gs'))) bad.push('backend/digest.gs has no DIGEST_SKIP map');
  return bad;
}

function fetchProblems() {
  const bad = [];
  srcFiles('backend', /\.gs$/).filter(f => f !== HELPER && OWED.indexOf(f) === -1).forEach(f => {
    const src = text(f);
    if (/\.replace\(\/\\\/\*\$\/, '\/'\)\s*\+[^\n]*\n[^\n]*RAW\s*\+/.test(src)) bad.push(f + ' has its own site-then-raw fetch loop (use fetchSiteThenRaw_ in ' + HELPER + ')');
  });
  if (!/function fetchSiteThenRaw_\(/.test(text(HELPER, ''))) bad.push(HELPER + ' has no fetchSiteThenRaw_');
  return bad;
}

function run() {
  const bad = keepBookedProblems().concat(skipProblems(), fetchProblems());
  console.log('one-table: keep-booked jobs in KEEP_BOOKED, skip reasons in DIGEST_SKIP, site-then-raw in fetchSiteThenRaw_; owed: ' + OWED.join(', '));
  report('one-table', bad);
}
module.exports = { run };
main(module, run);
