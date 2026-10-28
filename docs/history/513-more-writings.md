# 513 — More writings: the Apocrypha, Enoch, Jubilees, Josephus, the Mishnah, the Fathers, Gilgamesh

Owner, 28 Oct 2026, asking for more texts on the scripture shelf, built as the Bible, Quran and First Clement are (499, 504):
> Apocrypha / Deuterocanon … 1 Enoch … Jubilees … Josephus … Mishnah … Early Christian writings … Epic of Gilgamesh … Tafsir
> — "PUBLIC-DOMAIN / openly licensed texts only, no taking risks"; if a text's status is uncertain, leave it out and say so.

## What was built

`js/texts.js`, `data/texts/`, `tools/writings-more.py`. The same pattern as `js/works.js` (499) in folders of their own, so it
merges beside the Writings work of 504 without touching its files:

- **The unit rule:** one card a verse where the text has verses; a numbered section or mishnah where that is how it is cited
  (Josephus by Whiston's book.chapter.section, the Mishnah by tractate chapter:mishnah); else a chapter (Justin, the
  Confessions, a Gilgamesh column). **One text a card** (504): Lake's Greek and Lightfoot's English are separate cards.
- **Tags:** Which writing (`libBook`: Apocrypha, 1 Enoch, Jubilees, Josephus, Mishnah, Apostolic Fathers, Justin Martyr,
  Confessions, Gilgamesh, Zohar), Text (`wtLanguage`: KJV, Charles, Whiston, Hebrew, De Sola and Raphall, Greek, Lightfoot, ANF,
  Pusey, Jastrow and Clay, Aramaic), Work (`wtWork`: Tobit, Antiquities of the Jews, Berakhot, Didache …), Chapter (`wtChapter`), and
  one new facet, **Passage** (`wtVerse`, 37.99: "Verse 3", "Section 2", "Mishnah 4"). Subject Religious Studies
  (`SCRIPTURE_SUBJECT`), shelf `BIBLE_SHELF` — so the shelf follows 504's rename to Writings when the two merge.
- **Age:** a scripture-like text (`scripture: true` in the index: all but Josephus, Justin and the Confessions) is offered
  only to a viewer of `scriptureMinAge_()` and carries it as `min_age`; Gilgamesh is held there too (adult passages).
- **Loading:** `data/texts/index.json` (86 KB) when a finder paints (`textsIndex_` from `paintStuff`), a work's file only
  when one of its cards is drawn; nothing in the boot payload. Files are under 2 MB (Antiquities and the War a file a book).
- **Check:** `js/check-texts.js` — every text loads, units agree with the index, script is right (Hebrew, Greek), a licence
  per text and LICENSE names every folder, items built by js/texts.js itself with unique keys and the age rule, and Find wired.
  Mutations proved: a wrong count, a text with no scripture flag, `textsIndex_` unhooked from `paintStuff`.

## Texts, sources, licences, size

| Text | Source | Licence | Cards | Bytes |
|---|---|---|---|---|
| Apocrypha (KJV) | eBible.org eng-kjv_vpl | Public domain (UK Crown patent governs printing, as for data/bible) | 5,720 | 767,739 |
| 1 Enoch (Charles 1917) | Project Gutenberg #77935 | Public domain (Charles d. 1931) | 1,062 | 198,315 |
| Jubilees (Charles 1917) | Sefaria export | Public domain | 1,758 | 270,341 |
| Josephus (Whiston) | Sefaria export (Ant., War, Apion); Gutenberg #2846 (Life) | PD translation; Ant. and Apion transcriptions CC BY-SA | 2,313 | 4,154,646 |
| Mishnah, Hebrew (Vilna 1913) | Sefaria export, 63 tractates | Public domain | 4,187 | 1,812,113 |
| Mishnah, English (de Sola and Raphall 1843) | Sefaria export | Public domain | 569 | 353,326 |
| Apostolic Fathers, Greek (Lake) | First1KGreek | Text PD; transcription CC BY-SA 4.0 | 1,086 | 501,605 |
| Apostolic Fathers, English (Lightfoot) | CCEL fathers.xml | Public domain | 1,019 | 314,659 |
| Justin Martyr (ANF I) | CCEL anf01.xml | Public domain | 225 | 500,912 |
| Justin, First Apology Greek (Rauschen 1911) | First1KGreek | Text PD; CC BY-SA 4.0 | 68 | 188,259 |
| Confessions (Pusey) | CCEL confess.xml | Public domain | 273 | 595,315 |
| Zohar Chadash and Tikkunei Zohar, Aramaic | Sefaria export (Torat Emet editions) | Public domain | 7,754 | 5,722,243 |
| Gilgamesh, Old Babylonian (Jastrow and Clay 1920) | Project Gutenberg #11000 | Public domain | 12 | 37,536 |

26,046 cards, 15.4 MB in all. The Apostolic Fathers are the Didache, Ignatius's seven letters, Polycarp to the Philippians,
the Martyrdom of Polycarp and the Shepherd of Hermas. Lightfoot's paragraphs are his verses where they agree with Lake's in
number; where they do not (a few chapters) the English chapter is one card.

## Left out, and why

- **The Zohar itself (Aramaic):** asked for by the coordinator as Writing=Zohar, Text=Aramaic. Every Aramaic version of the
  Zohar in the Sefaria export (Sulam Edition 1945, Vocalized Zohar 2013, and the Hebrew translation) is licence "unknown",
  so it is out; Zohar Chadash and Tikkunei Zohar, marked Public Domain, are in under Which writing = Zohar. Tikkunei
  Zohar "Constantinople, 1740" is CC BY-NC (out). No English: Soncino (1931–34) and Pritzker are in copyright.

- **Septuagint Greek of the Apocrypha:** 504's Swete files are not merged yet; reuse them after the merge.
- **Tafsir Ibn Kathir (Arabic):** the only reachable digital text (spa5k/tafsir_api, from quran.com) is the Dar Taybah
  edition with its editor's variant notes inside the text, and no licence for the content (the MIT licence is the repo's
  code). Uncertain, so out.
- **Aquinas, Summa Theologica (English Dominicans, 1920):** public domain in the US; in the UK it turns on who translated
  (Laurence Shapcote, d. 1947, did most, others uncredited). Uncertain, so out — and about 3,000 articles of size.
- **Gilgamesh in R. Campbell Thompson's 1928 translation:** public domain, but the only reachable copy is an uncorrected
  OCR (archive.org; sacred-texts answered 403). Jastrow and Clay's proofread Old Babylonian tablets are here instead;
  Muss-Arnolt (1901) was not found.
- **Charles Taylor's Pirqe Aboth (1897):** Sefaria marks it licence "unknown" — out, as the Talmud left such versions out (473).
- **Lake's Latin-only passages** (Polycarp 10–12, the end of Hermas): the transcription spells the Latin in Greek letters.
- **Justin's Second Apology and Dialogue in Greek:** not in First1KGreek.
