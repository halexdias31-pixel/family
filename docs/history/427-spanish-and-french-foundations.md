# 427 — GCSE Spanish and French foundations: two content books, five drawings, Hear it

**Asked for as** GCSE Spanish and GCSE French foundations. That meant chapters on pronunciation, the present tense
(regular and irregular), the past tenses (preterite or passé composé, and the imperfect), the future and conditional,
gender and agreement, and opinions and justifications. Then the vocabulary of the key themes (identity and culture,
local area, school, future plans, global issues), translation tips and writing frameworks. Five teaching animations went
with them: a conjugation table filling, gender agreement, a timeline of tenses, a sentence builder, and avoir or être
with the DR MRS VANDERTRAMP house for French. A "Hear it" tile was optional, if it was trivial.

### Two new books, not more chapters on the old ones

`TB-GCSE-SPANISH` and `TB-GCSE-FRENCH` already exist: fourteen chapters each in the order of the old AQA specification
(8692 and 8652), and three of those chapters are grammar. Fifteen foundations chapters added to them would have doubled
the present, past and future chapters inside one book. So each is a book of its own, filed straight after its language:

- `TB-GCSE-SPANISH-FOUND` **GCSE Spanish foundations** and `TB-GCSE-FRENCH-FOUND` **GCSE French foundations**, with
  subject Spanish or French, level GCSE and key stage KS4 on the cover. Board and spec are blank: these foundations
  serve every board.
- Fifteen chapters each, the same titles in the same order. Only chapter 4 differs: *The preterite* in Spanish,
  *The passé composé* in French. The order is Pronunciation and sounds; Present tense: regular verbs; Present tense:
  irregular verbs; the past tense; The imperfect; Future and conditional; Gender and agreement; Opinions and
  justifications; Identity and culture; Local area; School; Future plans; Global issues; Translation tips; Writing
  frameworks.
- Each chapter has five to seven key words, written as the word and then its meaning, and five worked lines. **Every
  worked line is `<Spanish or French> — <English>`**, the shape the existing language books already use. Hear it relies
  on that (below). Higher-only lines carry `[H]`: si with the imperfect subjunctive or the imperfect, cuando with the
  subjunctive, and bien que.
- No topics. The question library has no Spanish or French topic to join to, and only a maths card needs one
  (`check-textbooks.js`).

### `lib_pending`: new cards whose words reach the Ledger by import

Since 397 a chapter's words live in the Ledger. A fresh clone rebuilds `data-private/` from the pinned commit, so it
cannot have them, and `check/lib-full.js` would call each new row lost. The 32 rows therefore carry
`lib_pending: "True"` on the card, and three places honour it: `check/lib-full.js`, `check-textbooks.js`, and the
site's "Coming soon." (`libSay_`). `docs/library.md` has the details. The code is the philosophy branch's, hunk for hunk, so the
content branches merge cleanly.

The words went out to the Ledger in an import file written by `node tools/lib-private.js drive-pack --ids …`
(`{version: 1, files: {textbooks: [32 items]}, cards: {textbooks: [...]}}`). Its `cards` list also carries the five
animation rows, because drive-pack matches them by book and chapter. They are public whole and change nothing. The owner
uploads the file to `family-library-imports` and taps Import library updates. Until then a signed-in reader who opens a
chapter sees its title and tags with "Coming soon.".

### The five drawings (each written by its script, `tools/la_<name>.py`)

| id | script | book, chapter | about | what it shows |
|---|---|---|---|---|
| `laconj` | `la_conj.py` | Spanish 2 | Stem, Endings | *hablar* drops its *-ar*, then o, as, a, amos, áis, an slide onto *habl-* in turn, each with its English |
| `lagend` | `la_gend.py` | Spanish 7 | Agreement, -o adjectives, -e and consonant adjectives | *el chico alto* through the four forms, with the article and both endings changing in one beat; underneath, *grande(s)* only adds s |
| `labuild` | `la_build.py` | Spanish 8 | Time phrase, Connective, Opinion phrase, Justification | tiles drop into four labelled slots (time phrase, verb, connective, opinion), then a past-tense sentence is built in the same frame |
| `latime` | `la_time.py` | French 6 | Time frame, Near future | a marker walks *hier → aujourd'hui → demain*, and *manger* appears in each time frame's tense |
| `laetre` | `la_etre.py` | French 4 | DR MRS VANDERTRAMP, Être agreement | a house; the mnemonic's letters light one by one and stay lit; each verb appears as *je suis …(e)* with its English while a figure stands where the verb puts it (stairs, window, door, path); it ends on the reflexive rule |

They are written the way `tools/anim_row.py`'s `whole=` route writes A-level drawings. That route came across in the
same shared hunk: the script owns its whole row, creates it under its chapter on the first run, and on a re-run leaves
it byte for byte the same (`check-anims.js` section 6). Every part's keyframes are cut from one loop clock (`kf`,
`fade`) instead of staggered `animation-delay`s, so a table empties before it refills. The `laetre` captions cross-fade
in 0.2 s instead of `captions()`'s 0.35 s out and 0.35 s in. At 1.4 s a verb, the slower fade left each verb fully up
for about half a second, which a screenshot showed. Five splash rows were added to `data/settings/splashes.json`, kind
`proof`.

**Sized by the stage, not the viewport.** The first version used `min(88vw, 21rem)`, as older drawings do.
`check/anims.js` measured every one 11–41 px past a 300 px card at 390, because the stage is a grid whose auto track
grows to fit its content. `.tb-an-stage` is an inline-size container, so the roots are `min(100cqi, …rem)`. On the
splash there is no container, and `cqi` falls back to the viewport. One more failure was the conjugation endings: a
grid item stretches to its 1fr column, so translating it carried the column's whole width past the edge. They are
`justify-self: start`.

**`SPLASH_CACHE_MAX` 200 000 → 400 000.** The books' drawings came to 191 730 characters before this change. The five
add about 33 000, which is past the device copy's cap, so the last drawings would never reach the splash. 400 000 is the
value the GCSE and KS2 animation branches chose. `check-anims.js` reads the constant and measures the full-device case
against it.

### Hear it

`say_` (shell.js) takes `o.lang`, an `xx-YY` code that defaults to `en-GB`. It sets `u.lang` and picks a voice whose
lang begins with that code. A content card whose subject is Spanish, French or German gets a **Hear it** tile
(`hearItTile_`, find.js, drawn by `cardTiles_` next to Read aloud). It reads the part of each worked line before " — "
in es-ES, fr-FR or de-DE at rate 0.85, every line queued inside the tap as iPhone Safari needs. A second tap starts it
again from the top. It hushes Read aloud first. The English stays on the card, unread. The tile is not drawn until the
chapter's worked lines have arrived, which for a `lib_pending` card means after the owner's import. It covers the old
language books too, whose worked lines already have this shape.

### Checked

The 394 read-aloud journey in `check-flow.js` now also covers Hear it. It finds a French content card, checks that its
Hear it tile exists, and taps it: the French halves must be spoken in order, each in fr-FR. A Maths card must have no
Hear it. A mutation that drops `lang` from the call fails the journey ("spoke in en-GB …"), and the real files pass
again.

`node js/check.js`, `node js/check-all.js --fast`, the four `FLOW_PART=k/4 node js/check-flow.js`, `check/anims.js` on
the five drawings at 320 and 390 with the reduced-motion stills looked at, and frames from each drawing's loop at 390
looked at. `check-textbooks.js` and `check-anims.js` also ran with `data-private/` moved away, which is the fresh-clone
path: the 32 pending rows were read as cards and nothing was lost.
