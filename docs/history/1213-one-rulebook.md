# 1213 — one rulebook (owner, 12 Nov 2026)

The owner asked to centralise the foundation: truth was spread over `docs/philosophy.md` (34 ranked rules and
meta-rules), `docs/decisions.md` (267 dated decisions, many superseded), `CLAUDE.md`, `docs/map-detail.md`,
`tools/health.js` and ~190 checks. Now `docs/rules.md` is the one rulebook: a core of two sentences, 12 principles and
their specific rules, each once, each naming its checks. `docs/philosophy.md` and `docs/decisions.md` are pointers.

Both old files, whole, are at commit `5bebdbc`: `git show 5bebdbc:docs/philosophy.md`, `git show 5bebdbc:docs/decisions.md`.
Mechanical one-liners (formats, sizes, tokens, ticks — the 8–9 Nov `check-look` letters) are not restated as rules:
the check that holds each is their home, and its comment names the decision.

`tools/philosophy.js` became `tools/rules.js`: it parses `docs/rules.md` and gives `tools/health.js` three rules —
`rule-checked` (rules naming an existing check ÷ rules), `check-tied` (scored checks, check files and journeys named by a
rule ÷ checks), `rule-once` (rules sharing no more than half their words with another ÷ rules). The old
`philosophy` rule (principles naming a check) is folded into `rule-checked`.

## Superseded, dropped (newest wins)
- 6 Nov "every feature stays on even half-working" → 9 Nov 88a/87a: removed features wait in attic/, half-working items hide.
- 6 Nov "first names only (full to admin)", 8 Nov 19b "admin sees full names" → 9 Nov: first name + initial for everyone.
- 6 Nov "one search bar; typing filters" → 8 Nov 31a: Find is chips only (asked again: see the owner list).
- 7 Nov six status ticks (… Started, Completed) → 8 Nov four ticks; the 12 Nov form keeps Requested, Applied for, Accepted, Paid.
- 7 Nov/8 Nov Mark paid, admin cash path → 9 Nov 96 Stripe only.
- 8 Nov discount out of @family's share, capped → 12 Nov: no maximum, teaching only, shared by tutor and margin.
- 8 Nov Split / `Sharing` on the booking form → 12 Nov: Split removed.
- 8 Nov h3 title on every Settings card → 12 Nov: the name is a tag.
- 8 Nov 30a three-dot wait, 11 Nov loading bar → 12 Nov: `loading_()`'s spinning ring everywhere.
- 8 Nov booking tile words under the mark → 8 Nov 4c: icon-only tiles, word on long press.
- 8 Nov 25a every card a picture (8-bit sign), 9 Nov default profile picture on every card → 10 Nov (late): a picture only when real.
- 8 Nov one fluid column `min(100%, 48rem)`, 9 Nov 59a, 10 Nov multi-column grid → 10 Nov (later): one column, full width.
- 8 Nov tutor card "name and rate on one line, fits one screen", 9 Nov evening four named buttons, 10 Nov ⋯ with words → 11 Nov one template, round icons only.
- 8 Nov tag pill size `.78rem` → 9 Nov 61a three text sizes (tags `--fs-small`).
- 8 Nov a new build waits for the page to be put away → 9 Nov 98 always load fresh (no held builds).
- 10 Nov who sees whom replaces 20 Oct; 10 Nov one admin check replaces 8 Nov `rankAtLeast_`.
- 12 Nov "Spotify, Newspaper, Basket undecided" → later 12 Nov: tools back (list in history 1211/1212), Basket stays off.
