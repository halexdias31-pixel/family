/* ==================================================================================================
   @family. — boot.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   boot.js is number 18 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ================================================================================================
   AND GO.

   THE LAST LINES IN THE FILE, deliberately. `go()` draws a screen, and a screen only exists once
   its `screen(...)` call has run — so starting anywhere above them means drawing a table that has
   not been filled in yet. It did, for weeks: every tab said "Nothing here yet" until the first
   fetch returned, which looked like an empty database rather than an app that had not started.

   Everything below a boot line is a thing the boot cannot see. So there is nothing below it.
================================================================================================ */
try {

  go(AT, false);
} catch (err) {
  /* Drawing failed. There is no point asking the backend for data to put in a screen that could
     not be built, so `load` is not called — the message stays on screen instead of being replaced
     by a network error a moment later. */
  bootFailed(err, 'drawing the first screen');
  throw err;
}

load();