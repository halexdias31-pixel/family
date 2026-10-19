# js/check-health.js

The full text of comments in `js/check-health.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### check-health.js — EVERY PAPER'S HEALTH SCORE, WORST FIRST.

top level, before `fs`

```
/* ==================================================================================================
   check-health.js — EVERY PAPER'S HEALTH SCORE, WORST FIRST. A REPORT FOR THE OWNER.

   *"Can you add a health check to worksheets or past papers so we can know when we are doing something
   whether it's low accuracy or buggy or missing shit or anything. Like 99% would be it's practically
   perfect and ready to do."* — the owner, 18 Oct. The finder wears the score on every card of a paper
   (`Ready · 99%`) and lists what is wrong behind the paper's Health tile; this prints the same numbers
   for the whole library at once, so the fixing can be planned rather than stumbled on.

   THE SAME FUNCTION, NOT A COPY. `paperHealth_` is read out of js/library.js in a `vm`, exactly as the
   browser runs it — a second implementation here would be a second chance for the card and the report
   to disagree, which is the fault this repository keeps paying for under `needs_print`/`print_required`.

   IT NEVER FAILS THE BUILD OVER THE LIBRARY. A Rough paper is backlog, written down — the argument
   check-library.js makes about 485 missing figures. It FAILS ONLY WHEN ITS OWN INSTRUMENT IS BROKEN:
   library.js does not yield `paperHealth_`, the function throws, the library scores no papers at all,
   or the fixture paper below — one missing answer, one missing drawing, a marks total four short —
   does not score below Ready with exactly those three faults listed. A report that cannot see is the
   silence CLAUDE.md warns about, printed as a clean bill of health.

   Run:   node js/check-health.js            every paper, worst first, then the totals
          node js/check-health.js --all      (the default prints the worst 40 and counts the rest)
          node js/check-health.js <file>     another questions file — used only to prove it can fail
================================================================================================== */
```

### ---------- THE FIXTURE: ONE PAPER WITH THREE KNOWN FAULTS, AND ONE WITH NONE

top level, before `FIX_BASE`

```
/* ---------- THE FIXTURE: ONE PAPER WITH THREE KNOWN FAULTS, AND ONE WITH NONE ------------------------
   Written here rather than borrowed from the library, because the library changes under it: a real
   paper fixed tomorrow would turn this into a test of nothing. Q2 has no answer, Q3 says "the triangle
   shown" over no drawing, and the marks add to 76 of the 80 the paper states. The clean paper is the
   other half of the proof: a function that failed everything would pass the first half. */
```

