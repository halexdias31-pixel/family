## Philosophy and Religious Studies: GCSE Theme C, an A-level foundations book, seven teaching animations

**The ask**: GCSE RS plus the foundations A-level Philosophy and RS share: logic, the arguments for God and their
critics, evil, ethics, knowledge, mind, free will. Fair, balanced, accurate. Quotations only from public-domain sources.

### What was there

`TB-GCSE-RS`, eleven chapters (AQA 8062): the question types, Christian beliefs, Christian worship and festivals,
the Church in the world, three on Islam, and Themes A, B, D and E. **Christian beliefs and practices were already
covered** (chapters 2 to 4: Trinity, incarnation, atonement, sacraments, both baptisms, Eucharist, pilgrimage,
festivals, mission), so nothing was added on top of them. Theme C, the existence of God and revelation, was missing,
and nothing at A-level. No question in the library has a philosophy topic, and none of the RS chapters has topics, so
the new ones have none either.

### What went in

- `TB-GCSE-RS` chapter 12, **The existence of God and revelation** (Theme C). The cover's summary says twelve
  chapters, Themes A to E, and that Theme C comes last (renumbering would have changed every later chapter's id).
- **`TB-ALEVEL-PHIL`**, "A-level Philosophy and Religious Studies", level `Alevel`, KS5, subject `Religious Studies`
  so it sits beside the GCSE book under one subject; no board, since it serves AQA Philosophy and the RS boards alike:

| | chapter | animations |
|---|---|---|
| 1 | Logic and argument | `psyll` Syllogisms in circles, `pfall` A gallery of fallacies |
| 2 | Arguments for the existence of God | `pcause` A chain of causes, `pwatch` Paley's watch |
| 3 | The problem of evil and theodicies | |
| 4 | Ethics: consequences and duty | `ptrolley` The trolley problem |
| 5 | Ethics: virtue, natural law and situation ethics | |
| 6 | Knowledge: reason and experience | `pcave` Plato's cave, `pdoubt` Doubting down to the cogito |
| 7 | Mind and body | |
| 8 | Free will and determinism | |

Ethics is two chapters because five theories do not go into five worked lines.

**Balance.** Every argument has its critic in the same chapter: Hume on the first cause and on design, Gaunilo and
Kant on Anselm, Schleiermacher and evolution against Augustine, the scale of suffering against Irenaeus, critics of
each ethical theory, Lichtenberg on the cogito, Elisabeth and Ryle against dualism, the knowledge argument and the
physicalist reply, Libet and his critics. The drawings do the same: `pcause` ends on Hume's question, `pwatch` on
Hume's plant and Darwin's tree, `ptrolley` gives both verdicts side by side and nobody is shown hit.

**Quotations** are only from public-domain texts and translations: Hume's *Dialogues* (1779) for Epicurus' questions,
Bentham (1789), Mill (1863), Kant in Abbott's translation (the universal law) and "being is not a real predicate",
Anselm's formula, Keats' "vale of soul-making" (1819), Paley (1802), Descartes' cogito, Hume's "determinations of the
will". Twentieth-century writers (Fletcher, Hick, Ryle, Jackson, Libet) are paraphrased, never quoted. No scripture is
quoted, so no translation's copyright arises.

### Words: private, pending, imported

The cards are public (`data/textbooks.json`); words, worked lines and the logic chapter's three argument forms are
private, written through `join`/`split` into `data-private/`. Each new chapter carries **`lib_pending: "True"`**, the
convention shared with the other content branches (docs/library.md): `check/lib-full.js` treats a pending row with no
words here as a card rather than lost, `check-textbooks` skips the word minimums and the animation `about` rule for it
and prints the count, and the site says "Coming soon." while the Ledger answers `missing`. This base lacked it, so the
same minimal support was added here, identical to the A-level maths branch's (411).

Proved both ways: with `data-private/` moved away (a fresh clone's seed), `check-textbooks` is green and notes
"9 pending card(s) and 7 animation(s) on them were NOT checked for words", and `check-anims` is green; with the words
back, everything is checked and green.

The words go to the Ledger by an import file made with `drive-pack --ids` outside the repository: nine items under
`files.textbooks`, and under `cards.textbooks` the nine public cards plus the new book's cover (anim rows dropped).
`cards` is an object keyed by file, as `drive-pack` writes and `libImportDrive` reads.

### The animations

Seven scripts, `tools/p_<name>.py`, each writing the row `p<name>` through `anim_row.write_anim(…, whole=…)` (also
added here, identical to 411's), on the `WRITTEN BY A SCRIPT` line and in CLAUDE.md. Each has a reduced-motion block,
every animated selector is one class, and the base style is the lesson's last frame: the invalid syllogism beside the
valid one, the false-dilemma card, Hume's question over the first cause, the eye and the tree, both trolley verdicts,
the freed prisoner in the sun, the cogito lit inside three struck-out layers.

Seen at 390 px at four to six moments each and as the still. That fixed: the dogs label covering cats as the circles
overlapped (slide shortened, labels moved off centre); the cave's shadows invisible on a dark wall (wall lit, shapes
larger) and the sun's rays cut off at the edge; the watch labels sitting on the ground line; the trolley's ghost
floating above the branch (it now follows the Bézier through four stops, from its bottom centre); a dot left by a
round cap on each zero-length strike line in `pdoubt` (caps are butt). `check/anims.js` is green for all seven at
320 and 390.

`SPLASH_CACHE_MAX` goes from 200 000 to 500 000, as in 411: the books' drawings came to about 239 000 characters.
