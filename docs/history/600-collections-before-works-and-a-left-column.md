# 600 — Collections before works, a numbered grid before its verses, a column on the left

Owner's notes of 1–2 November (Ledger `claude_notes`), after 594.

## Screenshots: what Claude could see

The Drive connector's `read_file_content` returns only Google's OCR text of an image, not the picture; `download_file_content`
returns the whole file as base64 (1.3–1.5 MB PNGs, which do not fit a session's context). So these were read as OCR only:

- IMG_2284 ("this is wrong?", Find › Library › History): History asked **Shelf: History / Writings**. The history database's
  own written works were on the History shelf while every other writing is on Writings, so the question split the written
  works in two. Fix at the rule: a history-database `writing` is on `WRITINGS_SHELF` like every other writing (`histItem_`).
- IMG_2280 / IMG_2281 ("look at these issues", person card) and the Calculator screenshot: the OCR text is too broken to say
  what is wrong (student cards with question counts; the calculator's keys). Not changed; they need the picture.

**Reading them in future.** Suggest a change has two routes: the picture tile (`reportPicShrink_`, already a ≤ 300 KB, 1280 px
JPEG, `suggest-<ms>.jpg`) and Files for Claude (515: the original bytes into Drive "Claude inbox"). The second now also sends
`<name>.small.jpg` (640 px, under 40 KB) beside each picture (`repSmallCopy_`, submit.js), through the same `suggestUpload`, so
no backend change. A session downloads the small copy.

## Judaism, and every religion: Collection is a group of works, asked before Work

- The registry (writings.js) gives each Jewish work a `collection`: **Rabbinic** (Mishnah, Talmud), **Second Temple**
  (1 Enoch, Jubilees, Josephus, Letter of Aristeas), **Kabbalah** (Zohar).
- `wCollection` moves before `wWork` (facets.json 24.045; FACETS in find.js). Christianity is unchanged at its first step (Work
  was lopsided there already, so Collection came first); Judaism now opens on Collection.
- The Hadith's six books were Collection answers *below* Work = Hadith, the one place a collection was finer than a work.
  Now each of the six is a Work in the **Hadith** collection, so Islam asks Work: Quran and the six books (Collection,
  with one answer, is not a question there).
- "Summa Theologiae" was a Collection (beside Scholastics) and each of its eleven files a Work. An orthodox index entry
  may now name `work` and `book`: Summa Theologiae and Calvin's Institutes are one Work each, their parts the Book
  (`orthoItems_`, `tools/orthodox-texts.py`, data/orthodox/index.json).

## Chapter before Unit

Under 1 Enoch, Chapter (108 answers) was held back by `FACET_MAX_ANSWERS` (40) and Unit (verse) asked first. A numbered run
is drawn as a grid (396), and a grid of numbers is a question, not a list: `facetWhy_` lets a numbered run of up to
`FACET_MAX_GRID` (200) answers through. A numbered run is bare numbers or one shared word and a number (`Chapter 7`, drawn
as 7 in the grid). One rule, `numberedRun_`, decides both the grid and the limit.

## A card further left

Note N-1793551282274-78297: "I want to move this to the left even more but won't let me." ◀ on the first card column
(Parent settings) was off. It now reads **Move to a new column on the left** and makes a custom column (`left: true`) just
before Parent settings — the mirror of ▶ past the last (466). Emptied, it goes like any custom column. The backend's layout
cleaner keeps `left` (core.gs), so the version stamps are bumped. Journey: `layout engine (466)` in check-flow.
