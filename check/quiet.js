// A green check prints one line. Every check requires this first: it holds what the check writes and, at exit,
// prints only the summary on a pass, or everything but the passes on a failure. -v or VERBOSE=1 prints it all.
'use strict';
const fs = require('fs');

const argv = process.argv;
const VERBOSE = argv.includes('-v') || argv.includes('--verbose')
  || /^(1|true|yes)$/i.test(process.env.VERBOSE || '');
// -v is taken out so a check that reads a bare argument as a file or an id (check-library, check-health,
// check/anims.js) never sees it. --verbose stays: pen, press, reach and swipe read it themselves.
for (let i = argv.length - 1; i >= 2; i--) if (argv[i] === '-v') argv.splice(i, 1);
if (VERBOSE) process.env.VERBOSE = '1';

module.exports = { VERBOSE };

if (!VERBOSE && !global.__checkQuiet) {
  global.__checkQuiet = true;
  const held = [];   // [fd, text] in the order written, so a failure reads as it always did
  const hold = (fd, stream) => {
    stream.write = function (chunk, enc, cb) {
      if (typeof enc === 'function') { cb = enc; enc = undefined; }
      held.push([fd, typeof chunk === 'string' ? chunk : Buffer.from(chunk).toString('utf8')]);
      if (typeof cb === 'function') process.nextTick(cb);
      return true;
    };
  };
  hold(1, process.stdout);
  hold(2, process.stderr);

  // A pipe can be non-blocking: retry EAGAIN rather than lose the report at exit.
  const nap = new Int32Array(new SharedArrayBuffer(4));
  const put = (fd, text) => {
    let buf = Buffer.from(text, 'utf8');
    while (buf.length) {
      try { buf = buf.subarray(fs.writeSync(fd, buf)); }
      catch (e) { if (e.code !== 'EAGAIN') return; Atomics.wait(nap, 0, 0, 5); }
    }
  };
  // check-flow's and check-booking's "  ok    <name>", and an empty heading's "(0)" and "none".
  const PASS = /^\s*(ok|PASS)\s|^\s*none\s*$|\(0\)\s*$/;
  const SUMMARY = /^\s*(\S+:\s*)?(OK|PASS)\b/;

  let flushed = false;
  process.on('exit', code => {
    if (flushed) return;
    flushed = true;
    if (code === 0) {
      const lines = held.filter(h => h[0] === 1).map(h => h[1]).join('').split('\n');
      let at = -1;
      for (let i = lines.length - 1; i >= 0; i--) if (SUMMARY.test(lines[i])) { at = i; break; }
      let out;
      if (at >= 0) {
        // The summary paragraph, joined onto one line: from its OK to the next blank line.
        const para = [];
        for (let i = at; i < lines.length && lines[i].trim(); i++) para.push(lines[i].trim());
        out = para.join(' ');
      } else {
        out = (lines.filter(l => l.trim()).pop() || '').trim();
      }
      // A summary that runs to a paragraph is cut at the last sentence end inside 200 characters, or at a word.
      if (out.length > 200) {
        const end = out.slice(0, 200).search(/[.;](\s|$)(?![\s\S]*[.;](\s|$))/);
        out = end > 40 ? out.slice(0, end) + '.' : out.slice(0, 200).replace(/\s+\S*$/, '') + ' (-v for all)';
      }
      if (out) put(1, out + '\n');
      return;
    }
    // Failed: every line but the passes, each on the stream it was written to.
    for (const [fd, text] of held) {
      const kept = text.split('\n').filter(l => !PASS.test(l)).join('\n');
      if (kept) put(fd, kept);
    }
  });
  // Killed by a clock: say what was written before dying, then let the check's own handlers run first.
  for (const sig of ['SIGTERM', 'SIGINT']) {
    process.on(sig, () => setImmediate(() => process.exit(sig === 'SIGINT' ? 130 : 143)));
  }
}
