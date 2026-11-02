# 610 — Practice holds its kinds; a Timeline is in Library › History; the site updates itself without asking

**Reported** through Suggest a change on Find, 2 Nov.

## 1. Practice (N-1793618837917-90552)

*"timeline should be in library under history. questions and answers should be under practice. it seems practice has
decentralised where to find questions and answers.... bad. practicals should also be under practice. projects too."*

546 made Practice an answer *beside* Questions, Answers and Practicals, so Find's first menu read
`Practice · Questions · Answers · Practicals · Projects · Library · Timeline` — two doors to the same cards.

The rule stays one table, `KIND_UNDER` (find.js), now `question answer practical project → Practice` and
`timeline → Library`. What it does changed:

- **What kind** (`kindLabel`) answers only the kind above, when there is one. The first menu is `Practice · Library`.
- **Which** (`kindOwn`, facets tab sort_order 20.5) is a facet like any other: a kind under another answers its own
  kind there (a question with an answer, `Questions` and `Answers`); every other card answers nothing, so the one rule
  asks it only where it splits. Practice › Which: Questions, Answers, Practicals, Projects.
- A timeline answers Library, and its Subject is History, so it is found at Library › History; Which says Timeline.
- A card's tags: What kind says Practice (or Library), Which its own kind (the answer page: Answers).

No per-kind flag: a new kind under another is a row of `KIND_UNDER`. `check-funnel` (`FUNNEL_ONLY=under`) reads every
question, practical, project and timeline for both facets; the journeys and `check/states.js` reach Questions as
`kindLabel=Practice, kindOwn=Questions`. `js/finder-tags.js` re-counted.

## 2. The site updates itself (N-1793618906325-8272)

*"no longer have this just let site update to new"* — the picture (Drive, no OCR text came back) is the banner
`A newer version of the app is ready. Tap to load it.`, drawn by `checkBuild_`/`bootStale_` (shell.js) whenever a newer
`index.html` was seen but the page could not reload safely at that moment.

Now nothing is drawn: the build waits in `BUILD_WAITING`, and `buildQuietly_` loads it at the next safe moment — the
next screen change (`go`) or the page being hidden — unless a box holds typed words, a box has focus, or the store holds
work only this page has (`keepAtRisk_`). Still once per build (`buildMark_`). The `reload-build` action and `banner`'s
`tap` argument are gone. The two journeys that wanted the tap now fail if the banner says "newer version".
