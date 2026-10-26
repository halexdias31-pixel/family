# 458 — Reading inserts in the Ledger, and a Protractor on the pen

25 Oct 2026. Two answers from the owner to the open questions 457 left:

- On the English Language papers whose source is a printed insert: *"Can we add the insert text to gsheet, then have
  it display on site."*
- On a protractor for drawing an angle: *"Protractor while drawing: sure."*

## A. A paper's reading insert is a private library half

The extracts on an AQA GCSE English Language insert are copyrighted, and the repository is public. So an insert is
two halves exactly as a question is (397, docs/library.md):

- **The card**, a row of `data/inserts.json`: `insert_id` (`INS-AQA-8700-<paper id>`), name, a one-line summary (the
  works' titles and authors), the facets, `for_papers` (the paper ids it belongs to; such an insert matches its paper
  and nothing else, `insertsFor_`), `sources` (A, B or both, the sources this copy holds), `line_numbers`, and
  `lib_has: "source_text"`, `lib_pending: "True"`.
- **The words**, `source_text`, in the Ledger tab `lib_inserts` — a new `LIB_FILES` entry, `inserts`, prefix `in:`,
  with `TAB.libInserts`, `SCHEMA.lib_inserts` and the routing line in `WHERE`. On a working machine they are in
  `data-private/inserts.json`; `check-secrets` refuses them in `data/`.

The entry is marked `newer`: no row of it was at `LIB_SOURCE_COMMIT`, so `libSource_` copies nothing for it (a fresh
migration would otherwise stop on a 404) and `check/lib-full.js` seeds it empty. Its words reach the Ledger by an import
file (`drive-pack --ids`), as every `lib_pending` row's do.

`source_text` is plain text, because the Drive import takes text fields only: paragraphs with a blank line between,
`# Source A` a heading, `> ` the paper's own note above an extract, and `[n]` where the paper prints line number n. The
site draws each `[n]` in the margin at the line it stands on (`.ins-ln`, absolutely placed with no `top`, so it keeps
the line's own height). Where the Drive copy lost the margin numbers (a block of them on one line), only the ones whose
place is certain were kept, and the text says so.

**On the site** the question's Insert tile opens the sheet in place (the 453 sheet, under the question's own row), and a
reading insert's sheet asks `libItems` for `in:<id>` when opened (`insWant_`): the dots while it comes, "Sign in to read
the source" signed out, "Coming soon." if the Ledger has not had it imported, and the extract when it lands
(`insLanded_`, from `libLanded_`). Signed out again, `libForget_` takes the words off.

**Found in Drive** (folder "aqa past paper insert"), and typed in: Paper 1 June 2017, June 2018, November 2018,
November 2020, November 2021 (the file named so is the November 2019 insert, which the November 2021 paper's questions
match), June 2022, June 2023, June 2024; Paper 2 June 2022, November 2022, June 2023, June 2024 whole, and November 2021
and November 2023 with Source B only (Drive's copies print "cannot be reproduced" for Source A).

**Not in Drive, for the owner to drop in** (then typed into `data-private/inserts.json` and imported):

| Paper | Series | What is missing |
|---|---|---|
| R0396 | Paper 1, November 2017 | the full insert (Drive has the redacted `-CR` copy) |
| R0388 | Paper 1, November 2022 | the insert |
| R0376 | Paper 1, November 2023 | the full insert (redacted copy only) |
| P-AQA-8700-2506-1 | Paper 1, June 2025 | the insert |
| R0395, R0394 | Paper 2, June 2017 and June 2018 | the inserts |
| R0393, R0379, R0377 | Paper 2, November 2017, 2018, 2020 | the inserts |
| R0390, R0375 | Paper 2, November 2021 and November 2023 | Source A |

`js/check-answerable.js` holds the rule: an English Language paper's part that reads from "Source A", "the source" or
"both sources" needs a reading insert for its paper holding each source it names, with its words in the private half;
on a fresh clone (no private half) a pending insert is a card, counted and not failed. The papers above wait in its
`ACCEPTED` list, one reason each.

## B. The Protractor, laid on the pen's page

Every question pen has a fourth instrument from `qToolkit_` (one place): Pen, Ruler, Compass, **Protractor**. The
protractor is not a drawing tool: its tile puts it down on the picture or picks it up, and the tool in hand stays in hand,
so you draw a 50° angle with the Ruler while it lies there. Its body drags it, its knob turns it about the centre of its
base line (whole degrees, settling within 2° of level or upright), and the rest of its box lets a finger through to the
ink. Where it lies is kept per pad for the visit (`PAD_PROT`), so a repaint keeps it. Its drag runs ahead of the pen's
(capture phase) and never draws or swipes. A protractor held as if it drew (a stale `PAD_TOOL`) draws as the pen.

check-flow's ruler-and-compass journey now puts it down, drags it 10%, turns it to 50° and to 90°, draws through it,
repaints and picks it up; check-answerable asks every pen for all three instruments.
