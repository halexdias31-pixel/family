# 473 — The Talmud, laid out as the Vilna page

Owner, 26 Oct 2026: "add the text for maybe the original Talmud to the Finder in database. And I want it
to be laid out how the original one was laid out too… preserved like an original Talmud, complete,
definitively, a definitive copy. But obviously, it's my own code."

## What "the original" is

The Babylonian Talmud as the Widow and Brothers Romm printed it in Vilna, 1880–86: the edition every
later printing copies page for page, and the one whose page shape (*tzurat ha-daf*) people mean by "a
page of Talmud". All 37 tractates that have Gemara, from 2a to the end (Tamid is 25b–33b), with the
Mishnah inside the Gemara where the printers put it, Rashi and Tosafot around it.

## The text, and its licences

Source: the Sefaria export (github.com/Sefaria/Sefaria-Export is now only an index, `books.json`; the
files are in the public bucket storage.googleapis.com/sefaria-export). Downloaded as data, read with
`python3 -I`, none of their scripts run. Each version's own `license` field decided:

- **Gemara + Mishnah: "Wikisource Talmud Bavli", CC BY-SA.** There is NO public-domain Gemara in the
  export: the other complete versions are the William Davidson / Koren-Steinsaltz Aramaic (CC BY-NC) and
  a "merged" mix of the two. The 1880s print is public domain; this transcription is not. The owner's
  side chose (option A) to publish it under CC BY-SA 3.0 with attribution: `data/talmud/LICENSE`, and
  one faint line under each page's header. The share-alike covers the text, not the site's code.
- **Rashi and Tosafot: "Vilna Edition", public domain** (from the National Library of Israel's scans),
  36 tractates (Tamid has none in the Vilna print). Two exceptions, both kept honest in `index.json`:
  Rashi on Rosh Hashanah's Vilna version carries no licence at all, so the "WikiSource Rashi" version
  (public domain) stands in; Rashi and Tosafot on Sanhedrin are marked CC BY-SA and are under it.
- **Left out:** every CC BY-NC text (Steinsaltz/Koren, the Davidson English), every version with an
  unknown licence (the korenpub/"temp"/hebrewbooks ones), and every English or other translation —
  none is marked public domain for the whole Bavli.

## Storage

`data/talmud/index.json` (34 KB: tractates, their orders, chapters with the side each begins on, the
licences) and `data/talmud/<tractate>/<n>.json`, ten dafim a file (295 files, the largest under
1.5 MB, 58 MB in all). Never in the boot payload: the index is fetched the first time a finder is
painted (`paintStuff`) — not when a widget draws the list ahead, which `check-widgets` caught — and a
file of ten dafim only when one of its pages is opened. Rebuilt by `tools/talmud_build.py`, which
asserts the version and licence of every input. Chapters are read from the text itself: each ends at
its *hadran* line ("הדרן עלך …"), whose words name it; a last chapter with no hadran is named by its
first bold word. One side, Nazir 33b, has no Gemara in Wikisource and is listed in `empty`.

## In Find

One item a daf (2,684), kind `talmud`, Content, shelf `Talmud` (`brand('talmud_shelf')`), asked by four
ordinary facets — Order (`talSeder`), Tractate, Chapter, Daf — each a row of the facets tab, a reader
in `FACETS`, a colour in `TAG_OF`. No per-facet flag. The orders and tractates sort in printed order
through a general rule, `ANSWER_ORDERS` in `answerCmp_` (a file pushes a list; answers all in it sort
by it), as the eras do. A daf's card has a tile per side (2a, 2b).

## The page

A tile opens the side in the sheet under it (nothing opens over the app, `check-surfaces`). Paper
palette. The header as printed: chapter name, פרק and number, the tractate centred, the daf in Hebrew
numerals with `.` for a and `:` for b. The Gemara in square letters (Noto Serif Hebrew), Rashi and
Tosafot in Rashi script (Noto Rashi Hebrew), both OFL and self-hosted in `fonts/`; each comment's
opening words bold, as the dibbur ha-matchil is. Rashi on the inner side (right on an a side, left
on a b side), Tosafot on the outer. `talLayout_` measures the three texts at their column widths and
picks the printer's two shapes: commentaries longer than the Gemara run under it across half the page
each; a Gemara longer than a commentary widens under it. Absolutely placed layers with float spacers;
re-laid on resize and when the fonts arrive. The font size follows the page's width, so 390px shows
the whole page small and complete. Previous/next side, Side a/b, a daf list to jump; ← is next.

## Checks

`js/check-talmud.js`: 37 tractates; every daf and side in the index loads from its file and has Gemara
(or is declared empty, and no daf is empty on both sides); only CC-BY-SA or public-domain licences; no
markup but big/strong/br; files under 5 MB; LICENSE present; Find, tiles and index.html wired.
`check-flow`: Berakhot 2 found by Learning → Content → Talmud → Zeraim → Berakhot → Chapter 1 → 2,
its 2a tile opens the page from the real files with Gemara, Rashi, Tosafot, header and credit, and Next
is 2b. css 2026-10-26-talmud-vilna-page.

The admin-and-parent funnel journey now paints Find before it compares, so both have the Talmud shelf
(the index comes on a paint; without one the parent never had it and the two walks differed by timing).
