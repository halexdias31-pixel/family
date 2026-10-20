# 383 — No remembered names, no autofill anywhere, and health is not a tag

20 Oct 2026. The owner: "it displays recent usernames for login i dont like that. also every field is
trying to fill in suggested memory details. its annoying i dont want that on any part. also tags still
have many unique rules, such as the health checks appear from the start. very unusual same with the
answerable tags".

## Sign-in remembers nobody

The handle chips over the sign-in box (`familyHandles`, `handleChips_`, `handle-pick`/`handle-forget`,
`handleRemember_`, `handleRename_`) and the admin's grey hint (`familyAdminHint`, `signInHint_`) are gone.
`signInForgetOld_` (me.js) wipes both keys from a device that still has them. The `.hchip` styles went
with them. The box starts empty, always. This reverses the shared-iPad chips of 342 and the admin
placeholder that replaced the example.

## No field suggests

`quietField_`/`quietFields_` at the foot of js/shell.js are the one rule: a MutationObserver applies it to
every `<input>`/`<textarea>` any file draws (keypad boxes too). `autocomplete="off"` (`one-time-code` on a
PIN, since browsers ignore off on a password), `autocorrect`/`autocapitalize` off, `spellcheck=false` on
inputs (textareas are prose and keep it), `data-lpignore`, `data-1p-ignore`, `data-bwignore`,
`data-form-type="other"`, and any `list=` is dropped. In source: the `username`, `email`, `given-name`,
`family-name`, `tel-national`, `bday-*` and `*-password` tokens became off / one-time-code, and the three
datalists (promo codes, known places twice, `fieldHtml`'s `suggest`) were removed.
Check: the flow journey "every input and textarea on every screen asks the browser and password managers
not to suggest" (mutated: autocorrect 'on' fails it on every box).

## Health is on its tile, and nowhere else

Faithful and Answerable were `tag: true, tagOnly: true`: a band on every card's tag row, its own colour
(`TAG_OF` health/answerable, `[data-tag="health"]`), and — being tag-only — a tag door under the very
first question, before anything was asked. Tried first: plain facets (no tag, asked in their turn). That
made them the one question the funnel asked AFTER Paper (check-bundle: Bundles drew no last line), a
unique rule of its own. So both facets are gone and listed in `RETIRED_FACETS`: no card tag, no door, no
question, no colour. The score lives on the Health tile alone; its sheet heads the band in bold, not a pill.
The Sunday email's tag port (`DIGEST_TAG_FACETS`, backend/digest.gs) lost both and `digestTagHealth_`
with them; stamps bumped to `2026-10-20-g-quiet-tags`.

Audit of other tag rules: `tagRow_` has no per-facet branch (one walk, one dedupe). The remaining
tag-only facets (Required, What you need, Question, Part, Sub-part, Page, Pages, Marks) share one rule —
a door once their `FACET_NEEDS_FIRST` is met — and none is shown before its parent is chosen, so they
were left as they are. No facet is pinned first; `always` (What for, What kind, Shelf) is about splitting,
not order.

Checks: check-health fails if either comes back as a facet, wears a `TAG_OF` colour or leaves `RETIRED_FACETS`; the flow
health journey asserts no band in the card row and no health door; check-digest asserts no band in the email.
