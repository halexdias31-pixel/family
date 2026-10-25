## 438 — thirty-three new content books, carded `lib_pending` (2026-10-25)

**What changed.** Thirty-three new books went into `data/textbooks.json`: 568 card rows (33 title pages, 535 content
cards), every one `lib_pending: "True"`, so a fresh clone treats them as cards and the site says "Coming soon." until the
Ledger has the words (docs/library.md). Their words (`words`, `points`, `formulas`) are not in git; they went to
`data-private/textbooks.json` on the working machine and into one Drive import file for the owner to import in Business.

| Book id | Title | Subject | Level | Content cards |
|---|---|---|---|---|
| `TB-L2-FURTHER-MATHS` | Level 2 Further Maths | Further Maths | GCSE | 16 |
| `TB-GCSE-WRITING` | GCSE Creative and Transactional Writing | English Language | GCSE | 14 |
| `TB-GCSE-PRACTICALS` | GCSE Science required practicals | Science | GCSE | 22 |
| `TB-GCSE-ASTRO` | GCSE Astronomy | Astronomy | GCSE | 14 |
| `TB-GCSE-LATIN` | GCSE Latin | Latin | GCSE | 14 |
| `TB-GCSE-CLASSCIV` | GCSE Classical Civilisation | Classical Civilisation | GCSE | 10 |
| `TB-GCSE-CITIZEN` | GCSE Citizenship | Citizenship | GCSE | 10 |
| `TB-KS1-MATHS` | KS1 Maths | Maths | KS1 | 14 |
| `TB-KS1-PHONICS` | KS1 Phonics | Phonics | KS1 | 12 |
| `TB-KS2-ENGLISH` | KS2 English | English Language | KS2 | 24 |
| `TB-KS2-READING` | KS2 Reading: passages and questions | English Language | KS2 | 16 |
| `TB-KS2-SCI` | KS2 Science | Science | KS2 | 16 |
| `TB-11PLUS-VR` | 11+ Verbal Reasoning | Verbal Reasoning | 11+ | 21 |
| `TB-11PLUS-NVR` | 11+ Non-verbal Reasoning | Non-verbal Reasoning | 11+ | 14 |
| `TB-KS3-MATHS` | KS3 Maths | Maths | KS3 | 21 |
| `TB-KS3-SCI` | KS3 Science | Science | KS3 | 24 |
| `TB-ALEVEL-MATHS-AS` | A-level Maths: Statistics and Mechanics | Maths | Alevel | 14 |
| `TB-ALEVEL-FMATHS` | A-level Further Maths | Further Maths | Alevel | 18 |
| `TB-ALEVEL-PHYS` | A-level Physics | Physics | Alevel | 17 |
| `TB-ALEVEL-CHEM` | A-level Chemistry | Chemistry | Alevel | 19 |
| `TB-ALEVEL-BIO` | A-level Biology | Biology | Alevel | 20 |
| `TB-ALEVEL-ENGLIT` | A-level English Literature | English Literature | Alevel | 15 |
| `TB-ALEVEL-HIST` | A-level History | History | Alevel | 16 |
| `TB-ALEVEL-GEOG` | A-level Geography | Geography | Alevel | 16 |
| `TB-ALEVEL-PSYCH` | A-level Psychology | Psychology | Alevel | 17 |
| `TB-ALEVEL-SOC` | A-level Sociology | Sociology | Alevel | 15 |
| `TB-ALEVEL-ECON` | A-level Economics | Economics | Alevel | 18 |
| `TB-ALEVEL-BUS` | A-level Business | Business | Alevel | 16 |
| `TB-ALEVEL-POL` | A-level Politics | Politics | Alevel | 16 |
| `TB-ALEVEL-CS` | A-level Computer Science | Computer Science | Alevel | 18 |
| `TB-ALEVEL-SPANISH` | A-level Spanish | Spanish | Alevel | 12 |
| `TB-ALEVEL-FRENCH` | A-level French | French | Alevel | 12 |
| `TB-STUDY-SKILLS` | Study Skills | Study Skills | All (KS3, KS4, KS5) | 14 |

**Where they sit.** Each book next to its neighbours, file order being page order: GCSE books after the GCSE book of the
same subject (Further Maths after Maths, Writing after English Literature, Practicals and Astronomy after Physics, Latin
and Classical Civilisation after German, Citizenship after Sociology), KS1 before KS2 Maths, the other KS2, 11+ and KS3
books after KS2 SPaG, the A-level books after A-level Maths, Study Skills last.

**Normalised on the way in.** The helpers' files were written in two shapes (a bare array, or the import file's
`{version, files: {textbooks}}`), so both were unwrapped. Level is `Alevel` as every existing A-level row and
`data/questions.json` spell it (some files said `A-level`); a chapter row's subject, level and key stage are blank so it
inherits the title page's, as on every other book; columns in the file's order with `lib_pending` before `lib_has`;
`lib_has` is the non-empty ones of the three Ledger fields, and blank on a title page. KS2 Reading's subject is `English
Language`, as KS2 English and KS2 SPaG. Study Skills' key stage is `KS3, KS4, KS5`, since it is for any secondary
student; its level stays `All`. Three summaries said "short chapters" and now say "short parts" (nothing a person sees
says book, chapter or textbook).

**Prose is not a Ledger field.** Every helper also wrote a `prose` paragraph per card for a later "read more". `LIB_FILES`
has only `words`, `points` and `formulas` for content, and `libDriveParse_` refuses an import item carrying any other
field, so prose went into neither `data-private/` nor the import file; it is kept outside the repository for when that
feature exists. A title page that held only prose has no private item at all.

**One import file for everything waiting.** `drive-pack --ids` (535 items) was merged with the eleven import files of the
subject branches already merged in 436 and 415 (English, History, Philosophy, Geography, Computing, Economics,
Psychology, Languages, KS2 Maths, A-level Maths, the Foundation past papers): 718 content items and 353 question items,
1 071 in all, under the 3 000 a file. Before merging, every item of those eleven was compared with `data-private/` (all
identical), every id was checked to be a card in `data/` now, and no id was in two files. The combined file was run
through the backend's own `libDriveParse_`, cut out of `backend/content.gs` and run in node, with the apply step's two
per-item checks (a card for every new id, the JSON fits six cells).

**Two journeys the new books broke.** Study Skills' chapter "Worked examples" had the same title as the card's own Worked
examples page ("one widget per thing"), so it is now "Learning from worked examples". And the owner's test (Maths · GCSE ·
Topic Pythagoras' Theorem holds the card) took every Maths card on the topic as GCSE; KS3 Maths' "Pythagoras' theorem" and
"Powers, roots and standard form" and A-level Statistics' "Data presentation and interpretation" are rightly outside Maths ·
GCSE, so the test now picks the GCSE cards by `levelOf_`.

**Checks.** `check-textbooks` passes reading the words (6 177 key words over 64 books), and passes with `data-private/`
moved aside, as a fresh clone (668 pending cards skipped, the count printed). Every topic tag on a new card is spelled as
the question library or `data/topics.json` spells it; 415 tags, none rewritten. A screenshot at 390×844 shows an A-level
Physics card drawn whole when `libItems` answers with its words and a KS1 Phonics card saying "Coming soon." when it
answers missing.
