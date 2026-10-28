# 504 — One verse, one text; the Writings shelf; the Hadith; the dots that never ended

## What the owner said

Looking at Find → Library → Religious Studies → Books, which offered Quran, Talmud and Doesn't matter, with three
dots under them that never finished, and no Bible:

> "this leaves me to believe quran and talmud is in github code. bible should also be in there as it's open source so I
> don't care about it being public. also the bible shouldn't show multiple translations per card…? same with quran… I
> don't know why you did that. 1 widget is one verse. simple. the translation is a tag."

Then: "writings and books clash; remove the word Books and replace with Writings as it encompasses more", "add open
source original hadith to the collection of writings", the Bible's original-language texts as more cards, and on
granularity: "each verse or chapter is a widget."

## What was wrong

- **Two translations on one card.** 499 drew the WEB under the KJV on each Bible verse card, and 490 drew Pickthall's
  English under the Arabic on each Quran card.
- **The Bible was admin-only** by the `kjv-admin` rule (496), whose Exception — admins only — was the default.
- **The dots.** Under every facet the funnel draws `loading_()` while `awaiting_()` — the boot payload not yet in, or
  a reconnect. The scripture shelf's answers do not come from the payload at all (each book's small index is fetched
  when a finder paints), so the dots said "more coming" that never would; and on a slow or stalled payload they stood
  there for good. Worse, a Quran or Talmud index that failed set `failed` and repainted nothing, and a fetch that hung
  never ended either.

## What changed

- **One card, one text.** The Bible builds one card per verse per text: KJV (`bible:kjv:…`, keys unchanged, so stars
  stay), WEB (`bible:web:…`), Masoretic (Hebrew), Septuagint (Greek), Brenton (English Septuagint), Greek New
  Testament. The facet `bibleTranslation` is labelled **Text** (the Masoretic and the Greek are not translations).
  The Quran is two cards a verse: Arabic (Tanzil) keeps the old key `qr:s:a`, so an old star is the Arabic card;
  English (Pickthall) is `qr:en:s:a`. New facet `quranTranslation`, "Translation", asked first among the Quran's.
- **Versification.** Each original text keeps its own numbering (the Septuagint's Psalms and Jeremiah differ from
  the KJV's): its own book list with chapters and verse counts sits in `data/bible/index.json`'s `also`, and a card
  cites the text's native reference. Book is the same answer in every text. A lettered verse (3:5a) is joined onto
  its numbered one; a number the text skips is '' and the card says "This text has no verse with this number" (about
  330 in the Septuagint). Greek Esther and Greek Daniel are Esther and Daniel; the books only the Septuagint has
  (Tobit, Judith, Wisdom, Sirach, Baruch, Letter of Jeremiah, Susanna, Bel, 1–4 Maccabees, 1 Esdras, Prayer of
  Manasseh) are books 67 on, group Deuterocanon, with cards of their own. `tools/bible-texts.py`.
- **Sources** (all ebible.org VPL, each marked public domain there): Masoretic = `hbo` ("Hebrew Masoretic OT",
  following the Masoretic Text; eBible does not name the WLC on the page); Septuagint = `grcbrent`, Brenton's Greek
  (1844) — Swete's edition was not reachable as a digital text, and Rahlfs is copyrighted, so not used; Brenton
  English = `eng-Brenton` (1851); Greek NT = `grctcgnt`, the Text-Critical Greek NT on Robinson–Pierpont's
  Byzantine Textform 2018 (released to the public domain by its editors). SBLGNT not used (eBible marks it ©).
- **Fonts.** Hebrew in the self-hosted Noto Serif Hebrew (473), right to left; polytonic Greek in Noto Serif's
  Greek and Greek Extended subsets, now self-hosted (OFL, fonts/README.md).
- **The Bible is public.** `kjv-admin` is a `flip` rule: Universal (anyone of age) by default, the stored mark now
  meaning Exception, so the backend needs no change; still on the Rules card to switch back. Still 18+ by
  `scripture-age`. check-bible holds both.
- **Writings, not Books.** The shelf is `Writings`, and "Which book" is "Which writing". First Clement (works.js)
  moved onto it (Religious Studies › Writings, still a history-database Text). A kept Find place on `Books` comes
  back on `Writings` (`MOVED_ANSWERS`).
- **The Hadith.** The six books (Kutub al-Sittah) in the original Arabic, one card a hadith, 34,000-odd: data/hadith/,
  split per collection per book by `tools/hadith-split.py` from fawazahmed0/hadith-api's `ara-*` editions (The
  Unlicense; the texts themselves are classical and public domain). Tags Translation (Arabic), Collection, Book,
  Hadith. No English: the usual modern translations are copyrighted. Lazy like the Quran, 18+.
- **One unit rule.** `WRITING_UNIT` (find.js): a verse where a writing has verses (Bible, Quran, each hadith), a
  chapter where it does not (First Clement), the Talmud a page (a daf side). Not registered as an exception.
- **The dots end.** Under a question whose cards are all scripture, `scriptureWait_` draws the dots only while one of
  the indexes is still being asked for, and a failed index says so in words. Every scripture fetch goes through
  `scriptureFetch_`, which gives up after 20 seconds, and a failed Quran, Talmud or Hadith index repaints.

## The Letter of Aristeas, Ptolemy II, Philo, and the references

The owner: "use whatever we can, no taking risks."

- **The Letter of Aristeas** (WR-0002) is on the Writings shelf, one card a numbered section (§1–§322, the unit a
  verse is elsewhere): H. T. Andrews' translation (Charles, 1913; Andrews d. 1928, public domain) as CCEL prints it,
  split on CCEL's own section numbers by `tools/aristeas-text.py`. Tags Writing, Section, Text ("English (Andrews)");
  Religious Studies, 18+ like the rest of the shelf; its history-database row says the Septuagint story is a tradition.
  **Left out:** Thackeray's English (1904) and any Greek (Thackeray's in Swete, or Wendland) — archive.org has the
  scans, but only as unproofed OCR whose section numbers are lost or misread.
- **Philo, On the Life of Moses, in Yonge's 1854–55 translation: left out.** Yonge's original is divided into three
  books of Roman-numbered chapters; the "II.37" section numbers belong to the modern (Loeb/1993 Hendrickson)
  numbering, which must not be used. The only reachable copy of the original (archive.org, Bohn 1855) is unproofed
  OCR that drops some chapter heads. Its reference is still listed where it is relevant.
- **Ptolemy II Philadelphus** (FIG-0010), a history-database figure: dates, parents, his marriage to Arsinoe II, the
  Library and Mouseion, the Pharos; the Septuagint commission said as tradition. No picture (none checked as public
  domain). Linked to the Letter by name in both rows: the schema only links a figure to a writing it authored, and an
  event needs a dated timeline with its own animation.
- **Sources** lines, the owner's bibliography word for word without page numbers, only where relevant
  (`WRITING_REFS_ON`): the Septuagint and Brenton cards (Jobes and Silva, Aristeas, Philo, Dines, Law), the Masoretic
  (Tov), the Letter of Aristeas, and Ptolemy II (Aristeas, Philo, Dines).
