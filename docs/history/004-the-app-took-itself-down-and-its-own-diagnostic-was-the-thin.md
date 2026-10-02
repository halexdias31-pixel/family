## The app took itself down, and its own diagnostic was the thing that did it

**"The app did not load. None of its code arrived."** Reported from the live site, and it was not
true: the code arrived. The message is the app's own boot check, and what it used to do was wait one
second after parsing, and if `go` was not defined, run `document.body.innerHTML = …`.

**That destroys the markup.** Every screen, every pane, every element the deferred scripts are about
to paint into. So the app cannot come up underneath and replace anything — the note above it claimed
"a false alarm you can watch disappear costs nothing", and the false alarm is the page killing
itself half a second before its own code arrives.

**Reproduced, because a bug this expensive should not be argued about.** Served locally with a delay
added to each file in `js/`: at 900ms the app comes up fine; at **1400ms `go` IS a function, nothing
404s, and the body is wiped with nine screens destroyed.** A working app reporting itself as broken,
permanently, on any connection slow enough.

**The report itself named the cause.** The message lists missing files when it knows of any, under
"None of these arrived" — and that line was absent, so no file 404'd. Nothing missing, `go` not yet
defined: a race, not a fault.

**One second was always a guess, and the app outgrew it.** Twenty-five files, 492 KB of JavaScript
gzipped, 152 KB of stylesheet, and a 342 KB library fetched alongside. The number was chosen when
there were eighteen smaller ones.

### So it asks at the moment the answer exists

`window.load` **fires when every deferred script and subresource has finished.** If `go` is missing
then, the scripts really did finish and really did not define it — a fact rather than a race, true on
the fastest connection and the slowest alike. No number to tune, and nothing to get wrong when the
app grows another file.

- **The backstop is for the one case `load` cannot cover**: a request that never returns, so the
  event never fires. That gets "The app is still loading", which is the honest description of that
  state, and it keeps looking.
- **It never destroys anything.** The message is an overlay laid *over* the app rather than instead
  of it, and it is removed if the code turns up late — which is the exact case that caused this.
- **The count is read off `window.FILES`.** It said "one of the eighteen names" for as long as there
  were eighteen and went on saying it at twenty-five, which is the same fault this file records about
  the session hook's "all 18 checks pass".

**Proved in all four directions**: nothing broken → silence; one file 404s → the banner names it;
every file 404s → the overlay, over an intact page; a slow link at 0/900/1400/2500ms → the app comes
up every time.

### `.nojekyll`, one empty file, closing a trap nobody had hit yet

GitHub Pages runs Jekyll by default, and **Jekyll silently drops any file or folder beginning with an
underscore**. `js/_scope.js` exists. It is not in `window.FILES`, so nothing is broken today — but a
file starting with `_` that ever joined that list would 404 in production and work perfectly
everywhere else, which is the worst shape a bug can have. One empty file at the repo root turns
Jekyll off entirely.
