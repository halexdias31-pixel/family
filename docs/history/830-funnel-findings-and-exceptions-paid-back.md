# 830 — check-funnel's two red findings fixed at the rule; exceptions paid back

Both findings were red before 805. (805's note isn't at the pushed head 2bfe5ed: the roll-back and its revert left it out.)

## An answer spelt like a chosen chip is never offered

The walk found `topic` offering "Statistics" after Library › Statistics. 680 dealt with the chips' side: a second chip
with the same words is left out. This note deals with the answers' side. `facetValues` (find.js) is what every
question's buttons and `facetWhy_` read, and it now drops any answer whose value or shown words are spelt like a chip
already chosen on another field (`spellKey_`, the bound finder's `STUFF.filters`). The tally stays cached per list; the
filter runs after the cache, so the counts on the other answers don't change. If what's left is a single answer, the
question isn't asked, because there is nothing to decide.

## One labeller for a paper, on the card and in the Sunday email

76 questions wore different paper tags in the email. There were two causes:

1. **The email had no 770 rule.** A paper sat in sections (`P-9MA0-2406-31`) is "Paper 3, Section A" on the card and
   was "Paper 31" in the email, which also had no `paperSection` tag. backend/digest.gs now ports `paperLabel_` and
   `paperSectionOf_` as `digestPaperLabel_` and `digestPaperSection_`, and the paper's name goes through them.
   `paperSection` is in `DIGEST_TAG_FACETS` (kind `other`).
2. **The card named a paper by a question's own answers.** Q-1MA1-SAM-2F-1 is the only unverified question in its
   paper. `cardList_` narrowed by every facet before Paper, including Accuracy, so the card counted only the unverified
   papers as siblings and said "Paper 2". The email compared it with Specimen set 2's Paper 2 and said "Paper 2 —
   Sample assessment". The rule now: an answer that differs among the cards wearing a value never changes what that
   value is called (`cardThingOwn_`). A paper is named among papers that share its paper's answers, which is what the
   email always did.

`FUNNEL_ONLY=email` runs that comparison alone.

## Exceptions paid back

Measured with tools/stability.js on the tree before 790 (f127556^) and after it: 790 added 3 written exceptions net
(payload `widgetsInFind`; widgets `notepad` and `console` in ACCEPTED_IMPURE). Paid back:

- **check-payload ACCEPTED `widgetsInFind`, `columns`, `spotlightFile`.** None of them was a dead key. A committed
  settings file sends each one through `settingsInto_`. The check now reads settings.js: a `d.key =` under
  `extra['settings/<name>']` counts as sent when data/settings/<name>.json is in the repo. It prints what it counted.
  Mutation: with widgets-in-find.json moved away, the check fails, and it is green again once the file is back.
- **check-widgets ACCEPTED_IMPURE `notepad`.** Its html is a fixed string. The account's notes are put in by `start`
  (`initPad`), not by the drawing, so it is `pure: true` (map.js), as the speed reader is.
- **Not paid: `console`.** `nesPaint_` reads `USER`, so a carried drawing could be stale. The exception stays until
  somebody reads the games list.
- **Dead code (check-dead):** `seriesCmp_` (find.js), `blockHours_` (book.js), `collPages_` with `COLL_PER`
  (collections.js), `scrAt_` (games.js) and `layoutColOf_` (layout.js) are deleted. Nothing called them. The other
  names check-dead lists are still read by a check, or are instruments (`whyThisQuestion`).

The feed-as-one-unit job was dropped on the owner's word ("only Find really matters").
