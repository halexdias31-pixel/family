## The history database: manuscripts, figures and writings in Find, linked both ways

**Asked for as three linked public databases in Find, data public, no private half.** Three files, flat rows,
edited by hand (how: `docs/history-db.md`):

| file | ids | seeded with |
|---|---|---|
| `data/manuscripts.json` | MS- | Papyrus 52 (P. Ryl. Gr. 457), Codex Alexandrinus (Royal MS 1 D V–VIII) |
| `data/figures.json` | FIG- | Winston Churchill, Julius Caesar, Clement of Rome |
| `data/writings.json` | WR- | First Clement (author FIG-0003, in MS-0002 and Codex Hierosolymitanus) |

**Why public files, not library cards.** Nothing in a row is private (dates, holdings, public-domain titles), so the
two-halves rule (397) does not apply: the rows are public whole like `inserts` (455), on `LIB_EXTRA` through one
`HIST_DB` table in library.js, and `doGet` declares `manuscripts`, `figures`, `writings` as `[]` for check-payload
(backend 2026-10-25-z-history-db, all four stamps).

**Where they sit.** Content, on the History shelf, as boxers sit on Boxing's (445): KINDS `manuscript`, `figure`,
`writing` with label Content, `shelf: 'History'`, `subject: 'History'`, and `histKind` (Manuscripts / Historical
figures / Writings) as the question that tells them apart. Every other fact is an ordinary tag through one reader,
`histCol_(x, column)` — language, material, format, genre, role, theme, held at — and Era, which `histEras_` works out
from the years (Ancient to 500, Medieval to 1500, Early modern to 1800, Modern); `answerCmp_` sorts eras in time order.
No per-facet flag (396); each new facet has its facets-tab row (37.1–37.9) and a TAG_OF colour.

**The card** is label/value lines, one thing each (421), list cells one entry per line, then tiles: a tile per linked
row (Manuscript, Writing, Author, or a relation's type) using the existing `find-open`, which walks the same finder to
that row's card in place; and a Source tile per https URL. `histLinks_` reads links from both sides, so a row typed on
one side still shows a tile on the other — but `js/check-history-db.js` fails a one-sided link so the files stay true.

**Checks.** `check-history-db.js` (in check-all): schema columns exact, ids unique and prefixed, every id-looking entry
resolves to the right table, writing ⇄ manuscript and writing ⇄ author answered both ways, whole years with from ≤ to,
https sources. Flow journey "the history database: …": each kind found by Learning, Content, History, its kind and
by the funnel's own walk; the card's head, lines and era tag; histEras_ boundaries; Writing → Manuscript → Writing →
Author → Writing by tiles, staying in Find. css 2026-10-25-z-history-db (the boxer tape's line style shared by `.hdb-lines`).
