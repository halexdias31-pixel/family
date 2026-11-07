# 1120 — Library: Writings, Primary/Secondary, Projects, Car or Car part, Statistics, PE, manuscripts

The owner (7 Nov, P7): Works is renamed Writings everywhere; every writing carries a Primary or
Secondary source tag; Projects move from Practice into Library; Mechanics asks Car or Car part
first; Statistics means the GCSE Statistics subject (Edexcel); Physical Education is Boxing only;
manuscript cards go minimal, pixel pictures allowed, no grey text.

- **Writings.** The history database's `histKind` answer for a writing is `Writings`, not `Works`
  (find-history.js, find-finder.js, the facet label). check-writings R2 used to forbid a shelf word
  there; it now forbids only `Texts`, since the owner's word for both is the same.
- **Primary or secondary source** (`wPrimacy`, a writing key read by `writingAt_`). Every work is
  Primary but those `WRITING_SECONDARY` names: Schaff's four-volume *History of the Christian
  Church* (a 19th-century study). Ancient histories (Eusebius, Socrates, Sozomen, Theodoret,
  Herodotus, Thucydides …), theology (Aquinas, Calvin), canons, hymns and the GCSE anthologies are
  original texts, so Primary. *Modern Texts (GCSE)* is a list of in-copyright set texts kept by name
  only, neither the text nor a study of it, so it carries no tag (`WRITING_UNCLEAR`) until the owner
  decides.
- **Projects** are under Library (`KIND_UNDER.project`), asked as a kind under it like Timeline.
- **Mechanics** asks `Car or car part?` first (`mScope`: Car, Car part). A part still answers the
  cars it fits afterwards, so a car's Parts tile is Car part + its make, model and engine.
- **Statistics** in the Library was already only the GCSE Statistics book (TB-GCSE-STATS, written to
  the Edexcel specification); no GCSE Maths question sits there. The book now says so: board
  Edexcel, spec 1ST0. Practice › Statistics holds the AQA 8382 GCSE Statistics papers, untouched.
- **Physical Education**: a boxer is on the Boxing shelf alone; the History shelf (and its Decade
  menu) is gone from PE.
- **Manuscripts**: every manuscript card is its drawing (where one exists) then its tags. The facts
  line is gone: Found (`histFound`, provenance's first line) and Dated (`histDated`) are tags beside
  Held at; the caption under a drawing is no longer grey. The other columns are the card's pages.
