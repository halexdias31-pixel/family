# 516 — Orthodox texts and church history, Pentecost to 2026

The owner, who is Eastern Orthodox: "to learn all about church history, how we got from 0 to 2026". Rule throughout: **no
risks on copyright** — public domain or openly licensed only, source and licence recorded for every text
(`data/orthodox/LICENSE`, and on each card's credit line). Anything uncertain was left out and is listed below.

## What was built

- **`data/orthodox/`** (`tools/orthodox-texts.py`, reading CCEL's ThML and one Internet Archive text from a downloads
  folder with `python3 -I`): 32 work files `OR-NNNN.json` plus `index.json`, each under 1.9 MB, 6,551 cards, about
  17.1 MB in all. The works.js pattern with its own folder and module, **`js/orthodox.js`** (loaded after `works`): one
  item a unit a language (`kind: 'orthotext'`), on the Bible's shelf under Religious Studies (`BIBLE_SHELF`: Books on this base, **Writings** once 504 is merged; a shelf of its own failed the "shelf echoes subject" journey), for a viewer of
  scripture age (`viewerOfAge_(scriptureMinAge_())`, as works.js). The unit is a canon where there are canons, the
  text's own numbered section where it numbers them (Eusebius, Calvin, the Life of Antony, Basil, Chrysostom, Cyprian),
  else a chapter; Hapgood, which numbers nothing, in parts of about 2,500 characters within each service.
- **Four facets** (find.js `FACET_KEYS`, `TAG_OF`): Tradition (Orthodox, Catholic, Reformed, Protestant), Church era,
  Kind of writing (Dogmatic, Mystical, Ascetic, Ecclesiastical, Homily, Liturgical), Collection (Ecumenical Councils,
  Canon law, Church Fathers, Cappadocians, Desert Fathers, Church history, Liturgical books, Reformation). Each work's
  index row also carries a one-line `about` (in our own words), shown as the card's `sub`.
- **The Bible's own verses tagged, not copied** (`orthoBibleTags_`): Collection = Anagignoskomena on Tobit, Judith,
  Wisdom, Sirach, Baruch, the Letter of Jeremiah, Susanna, Bel, 1–4 Maccabees, 1 Esdras, the Prayer of Manasseh and
  Psalm 151; Psalter and Kathisma 1–20 on the Septuagint and Brenton Psalms (Septuagint numbering: 1–8, 9–16, 17–23,
  24–31, 32–36, 37–45, 46–54, 55–63, 64–69, 70–76, 77–84, 85–90, 91–100, 101–104, 105–108, 109–117, 118, 119–133,
  134–142, 143–150); "Septuagint additions" on Greek Esther and Daniel 3. The Greek (Brenton's Septuagint) and English
  (Brenton 1844) verse cards are fix-onetrans's (504, `data/bible/lxx`, `data/bible/brenton`); this branch adds no
  second copy, so the tags light up when 504 is merged. Nothing to dedupe later.
- **The Church History timeline**: 83 events in `data/timeline.json` (era `Church History`, EV-0027 on, interleaved in
  date order with World War 2's), from Pentecost to the 1700th anniversary of Nicaea (2025), in our own words with
  sources (Wikipedia and Britannica). Where the churches tell it differently the summary says so ("Orthodox view: …";
  Chalcedon, Photius, 1054, 1204, Florence, Brest, the OCA, Ukraine). 35 figures (FIG-0011 on): the fathers and
  saints, the historians, the reformers, Hapgood, Tikhon, Silouan, Sophrony, Athenagoras, Bartholomew; links both ways.
  `tools/church-history.py` writes both and owns only its own rows. Its drawing is `hchurch` (`tools/h_church.py`,
  prefix `hch`), "Church History, 30–2026" on GCSE Religious Studies chapter 4, sixteen events on an AD 0–2030 axis.

## Coverage, item by item

| Asked | Done | Source, licence |
|---|---|---|
| Anagignoskomena, Greek + English | tagged on 504's verse cards (no copy) | Brenton's Greek Septuagint and English (1844), eBible.org, PD. Swete's edition has no openly licensed digital text found; Brenton's Greek stands in |
| Hapgood Service Book | partial: OCR, not proofread | Hapgood 1906, archive.org (Cornell copy), PD |
| Greek Liturgies, Menaion, Octoechos, Triodion, Pentecostarion | not added | no openly licensed digital Greek text reachable (Wikisource refused the requests); modern English translations copyrighted |
| Psalter with kathismata | tag on the Septuagint/Brenton Psalms | as above |
| Chrysostom's Paschal Homily | not added | Greek: no open digital source reached; every English version found is modern |
| Chrysostom in NPNF | On the Priesthood, Instructions to Catechumens, Homilies on the Statues (complete) | NPNF 1st series vol. 9, PD |
| Aquinas, Summa | not added | corpusthomisticum.org says "Iura omnia asservantur" (all rights reserved); the English Dominican translation (1920; Shapcote d. 1947) is PD in the UK and US but is 18 MB and is left to fix-texts-rel, which owns Aquinas |
| Calvin, Institutes | complete, per book.chapter.section | Beveridge 1845, CCEL, PD |
| Pedalion | not added | the 1800 Greek has no openly licensed digital text; the 1957 English (Cummings) is copyrighted |
| Canons of the councils | complete as NPNF prints them: Nicaea I (Creed + 20), Constantinople I (7), Ephesus (12 anathematisms + 8), Chalcedon (definition + 30), Constantinople II (14 anathemas + 15 against Origen; no canons), Constantinople III (definition; no canons), Trullo (102), Nicaea II (decree + 22), the local synods, the Apostolic Canons and the canonical letters | Percival, NPNF 2nd series vol. 14 (1900), PD |
| Catechism of the Catholic Church | not added | © Libreria Editrice Vaticana; no references model on this branch to hold a pointer |
| Eusebius, Socrates, Sozomen, Theodoret | complete | NPNF 2nd series vols. 1–3, PD |
| Schaff, History of the Christian Church | vols. 1–4 (AD 1–1073) | CCEL, PD; vols. 5–8 left out for size |
| Philokalia, Ladder, Triads, Symeon's Discourses | not added | no openly licensed Greek found; the English translations are modern |
| John of Damascus, Exact Exposition | English complete (100 chapters) | Salmond, NPNF 2nd series vol. 9, PD; the Greek (PG 94) has no open digital text found |
| John of Damascus, On the Divine Images | not added | Allies's 1898 translation is PD but no clean digital text was found (CCEL has none) |
| Athanasius, Life of Antony | English complete (by section) | Ellershaw, NPNF 2nd series vol. 4, PD |
| Basil, On the Holy Spirit | English complete | Jackson, NPNF 2nd series vol. 8, PD |
| Dionysius, The Mystical Theology | English complete (5 chapters) | Rolt 1920, CCEL, PD |
| Cyprian, On the Unity of the Church | English complete | Wallis, ANF vol. 5, PD; no openly licensed Latin found |
| Silouan, Sophrony | figures and timeline only, no text | their writings are 20th-century and copyrighted |

No Greek or Latin original went in: First1KGreek and Perseus (CC BY-SA) hold none of these works, and the other
digital editions found carry no open licence.

## Checks

`node js/check.js`, `node js/check-all.js --fast`, `node js/check-history-db.js` (the timeline in date order across both
eras, one drawing per era), and the eight flow parts one at a time.
