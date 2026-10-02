## "I still don't see george" for the third time, and he was on the screen

**Reported three times.** The chain this file already records held exactly: George is `role: tutor`,
`listed: FALSE` in the sheet; `doGet`'s gate is `(listed || viewerIsAdmin)`, so he is sent to an
admin and to nobody else; and both front-end `listed` filters came off `js/find.js` on 2026-09-13,
twelve days and many successful Pages builds ago.

**MEASURED IN A BROWSER AS THE ADMIN: the account column OPENS on him.** `PAGE_HOME.account` is page
1, that page is the unlisted tutor, and the card draws dimmed with `· not listed` beside the role, a
red `NO DBS ON FILE` stamp and a `set-listed` tile under it. Three signals, all correct.

**AND EVERY ONE OF THEM SAYS A STATE. NONE OF THEM SAYS WHAT TO DO.** `tile_` puts a tile's label in
`title` and `aria-label` only — a recorded decision, *"THE MARK IS THE WHOLE BUTTON NOW, AND THE WORD
IS GONE"*, and not one to undo from here — so on a phone the way back is an unlabelled crossed-out
eye in a row of icons. One sentence under the mark, admin-only, saying the consequence rather than
the cell: *"Clients cannot see them. The crossed-out eye below puts them back on the site."* The
house style already says this shape — *"put ONE paragraph under the row rather than one per
button"*.

### And the booking dropdown was a second copy of a policy the server had already decided

**`js/book.js` FILTERED `t.listed !== false` WITH NO WRITTEN REASON**, and there was nothing for that
clause to remove: a client is never SENT an unlisted tutor, so it could only ever hide them from the
one person the server had deliberately shown them to. Measured as the admin against one payload: the
roster drew three tutors and the dropdown offered two. **`js/find.js` had its own copy of the same
clause removed months earlier and this one was never found** — which is the `MESSAGING` fault, and
the reason is the one this file writes every time: a rule written twice is two rules to keep in step,
and the copy is the one that goes stale.

**MARKED RATHER THAN SILENT**, because an admin offering a switched-off tutor to a family needs to
know that is what they are doing. `label_` changes the option's TEXT and not its VALUE, which is what
keeps `priceFrom`'s `norm(t.title) === norm(tutor)` working — a decorated value would price the
booking at the open rate with nothing on screen saying so. Two assertions in `check-flow.js` for
exactly those two halves, **proved by mutation**: the old clause back and it names the list it was
offered.

### What is still true and is not a bug

**No tutor at all is on the Find screen**, George included: `kindOf_('tutor').group` is `Booking` and
`FUNNEL_NOT_FOR` is `Booking`. That is the decision written up under *"Booking is out of the
funnel"*, and searching a tutor's name there returns nothing by design. If that is where the looking
has been happening, this is the answer and no amount of tapping changes it.

**And `role` must keep its comma.** `head of boxing` appears nowhere in the Ledger — the title
lives in code, not in that cell — but the rule the titles entry states is load-bearing and worth
repeating: a cell holding only titles has no real role left, `mainRole` falls back to `client`, and
the tutor drops off the site entirely.
