# 594 — What a writing is, before the language it is in

Owner's notes 130–132 (Ledger `claude_notes`), on Find › Library › Religious Studies:

- Christianity: "it has language then what it is? no menu for deuterocanon/apocrypha?" and "audit how tags are organised".
- Judaism: "maybe audit for a more sophisticated organisation".

## What the funnel asked (probe over check/fixture.json, admin, the real app in jsdom)

Before:

```
Christianity › Source text: Greek New Testament, Greek Septuagint, Hebrew Masoretic Text
  › Hebrew Masoretic Text › Language: English, Hebrew › (Hebrew) Section: History, Major Prophets, …
Judaism › Work: 1 Enoch, Josephus, Jubilees, Letter of Aristeas, Mishnah, Talmud, Zohar
Islam › Work: Hadith, Quran › Hadith › Collection: the six books
```

Work is lopsided for Christianity (the Bible is nearly all of it), so the one rule skipped it and asked Source text, then
Language. Collection sat after Language and Translation in the facets tab, so by the time it could be asked the Source text
had already split the testaments: Deuterocanon / Apocrypha / Anagignoskomena (`WRITING_DEUTERO`) existed as a tag but was
never a choice.

## The fix, at the rule (the tab's order), not per religion

- `wCollection` and `wSection` move up to straight after `wWork` (facets.json 24.055 and 24.06; FACETS in find.js in the
  same order; `check-bible`'s SIX follows). What it is is asked before how it is written: Collection, Section, then Source
  text, Language, Translation. Every religion and every writing shares the order — no facet carries a flag.
- The Psalter's twenty kathismata were Collection answers beside the testaments (twenty rows of noise on the first menu).
  A kathisma is a part of the Psalter, so `orthoKathisma_` (orthodox.js) makes it a Section answer beside Poetry & Wisdom.

After:

```
Christianity › Collection: Apostolic Fathers, Canon law, …, Deuterocanon / Apocrypha / Anagignoskomena, …, Hymns,
  Liturgical books, New Testament, Old Testament, Psalter, Reformation, Scholastics, Septuagint additions, Summa Theologiae
Judaism and Islam: unchanged at the first step (Work is a fair first question there); after Work, Collection/Section now
  come before Language.
```

## Left for later

- Judaism's works are one flat Work list; a grouping (rabbinic, Second Temple, kabbalah) would be a `collection` in each
  work's registry entry, which is editorial data, not code.
- Under 1 Enoch and Josephus, Unit (verse numbers, under 40 answers) is asked before Chapter (over 40, held back as a
  list). A finer question asked above its coarser one; the fix belongs in the one rule, not a flag.
- "Summa Theologiae" is both a Collection and a Work answer.
