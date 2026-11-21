#!/usr/bin/env node
/* @family. — tools/one-lock.js THE ONE-LOCK CHECK (rule 1.75, unify batch 7 lane B).
   A family would notice two presses saving twice, or a "Busy" that read differently on one screen, so the backend's write lock lives once,
   in backend/write-lock.gs (`withWriteLock_`), with the refusal ending (`nothingSaved_`) and a Drive file's link (`driveFileUrl_`).
   A `releaseLock` anywhere else in backend/, a hand-typed ". Nothing was saved." or a hand-built drive.google.com/file/d/ link fails the build.
   OWED lists the files another lane still has to move; each is printed, and dropping off the list is the goal. tools/build.js runs it. */
'use strict';
const { text, srcFiles, report, main } = require('./lib/gen.js');
const HOME = 'backend/write-lock.gs';
/* digest.gs is another lane's; setup.gs and content.gs are lane-locked (unify batch 7). */
const OWED = { lock: ['backend/digest.gs', 'backend/setup.gs'], url: ['backend/content.gs'] };
const RULES = [
  ['lock', /\.releaseLock\s*\(/, 'releases the script lock by hand (take withWriteLock_ from ' + HOME + ')'],
  ['saved', /[.!?]\s*Nothing was saved\.['"`]/, 'types " Nothing was saved." by hand (take nothingSaved_ from ' + HOME + ')'],
  ['url', /drive\.google\.com\/file\/d\//, 'builds a Drive file link by hand (take driveFileUrl_ from ' + HOME + ')'],
];

function run() {
  const bad = [], files = srcFiles('backend', /\.gs$/).filter(f => f !== HOME && !/-gen\.gs$/.test(f));
  files.forEach(f => {
    const src = text(f);
    RULES.forEach(([kind, re, say]) => { if (re.test(src) && (OWED[kind] || []).indexOf(f) === -1) bad.push(f + ' ' + say); });
  });
  console.log('one-lock: ' + files.length + ' backend files; one write lock, one "Nothing was saved.", one Drive link in ' + HOME
    + '; owed: ' + OWED.lock.concat(OWED.url).join(', '));
  report('one-lock', bad);
}
module.exports = { run };
main(module, run);
