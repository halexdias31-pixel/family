# 387 — No tag doors: every facet is a funnel question or a card tag

**20 Oct 2026.** Two iPad photos of Find from the owner:

1. After Questions · Maths · Past paper · GCSE · Foundation · 2024 · Any month · Paper 1, the finder
   showed the paper heading and then a block of rows all at once — "Question" Q1…Q28, "Part" A B C,
   "Sub-part" I Ii, "Page" 1 2, "Marks" 1–5 marks (and "What you need").
2. On the very first screen, under What kind, a "Required" row (Required practical / Extra / Not for
   now) before anything was chosen.

> "I don't like how it does this extra stuff. It should all work like the above tags. Same with the
> required tags."

## What changed

- **`tagDoors_` is gone** (js/find.js), with its three callers and the `.tag-door` CSS. The doors came in
  355 and 383 tightened them to "after the parent facet"; the owner wants none. A facet is either asked by
  the funnel — one question at a time, chosen chip in the chip row with × — or it is only a card tag.
- **After a paper is chosen** the page is the cover line, "That is the paper, in order. Swipe up for its
  28 questions." and the Health tile. Question, Part, Sub-part, Page, Pages, Marks and What you need stay
  `tagOnly`: card tags, never asked, never offered as rows.
- **Required** lost `tagOnly`, so it is an ordinary funnel question. Its `of` is empty for anything that
  is not a practical, so its coverage keeps it off the first screen; once Practicals is chosen it is asked
  in the funnel's order (after Subject/Topic etc. are answered or skipped).
- **Capitals:** `facetTally_` capitalised every answer's first letter (`spellShow_`), which turned the
  sub-part `ii` into "Ii" and part `a` into "A". `qPart`/`qSub` now carry `asIs: true` and keep the
  paper's spelling — the same word the card tag shows. Card tags and the email's tag port were already
  lower-case, so the backend is unchanged and no stamps were bumped.

## Checks

check-flow: the 355 door journey is replaced by "no tag-door rows anywhere" (no `tagDoors_`, no
`.tag-door` on the first screen, a chosen paper or a 5-a-day day, never two facets offered at once,
part/sub-part answers lower-case) and "Required is never on the first screen, and is asked after
Practicals". Mutation: putting `tagOnly` back on `required` and `spellShow_` back on parts fails both;
restored, green.
