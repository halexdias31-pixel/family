# 546 — The finder's first paint is its last; Practice; one kind of answer a facet; the email's tags in the card's order

The owner's notes of 26–31 Oct, handled in one sweep (branch `sweep-a-finder`).

## 1. The first paint is the last (N-1793392876336-99753, N-1793374853812-40203)

*"when I load into site it looks like this. very un-uniform … decreases stability"* and *"when I first open site it loads a
bunch of tags … can't you have the tags preloaded like in git code … keep site tags synced in a smart scalable way"*.

**What a phone saw** (measured at 390px, 4x CPU, a phone's network, Find the column opened on): the first question was drawn
seven times in four seconds — empty, then the Mishnah's orders (the Talmud's index came first), then Quran | Talmud, then
Hadith, then fifteen works, then the Translations, then three subjects, and only when the 22 MB question file landed the real
question, *What kind*. Each writings index (`writingCame_`) and the library repainted the funnel over whatever had arrived.

**The rule now:** the finder's first questions are counted at build time. `tools/finder-tags.js` runs the real app in jsdom
(`check/jsdom-app.js`, which now exposes `__ev` into the app's own scope) over every file the finder reads, and writes
`js/finder-tags.js` — for each view of the library (`bible@18`, `@14`, `@0`: the Bible or not, and each age line any item
draws), the question asked at the start and after each first answer, with its answers in order. It loads with the other scripts,
so it is there at the first paint. `finderTagsAt_` (find.js) paints that question whole while `finderSettled_()` is false (the
payload, the library and its extras, or any writings index still on its way — `writingAsking_`, writings.js); after that the
live count takes over, and it is the same list. An answer pressed over the build's list admits every source (`STUFF.admit = '*'`),
since that list was counted over all of them.

**Kept in step:** `check-all` runs `node tools/finder-tags.js --check` (fast, about 30 s), red while the file is stale; any
change to the library, a writings index, the facets or the kinds needs `node tools/finder-tags.js` re-run. `check/firstpaint.js`
(slow) loads the real site cold as an admin and as a ten-year-old, on Find and Find 2, and fails if the first question's answers
ever change after they first appear, or end different from the live count. Proved by mutation: with `finderTagsAt_` returning
null it reports the seven paints again.

## 2. Caching (N-1793377260122-18034, N-1793377257797-87984 second half)

The service worker (016, 503) already keeps every file and revalidates a changed URL. Its premise is that every file of our own is
asked for with the deploy's stamp — an unstamped URL is an exact hit **for ever**. Five were not: the question file's fallback
fetch (a retry after a failed boot got the first copy ever kept), the e-ink verse/icon/font sets, the e-paper firmware and its MD5
(a stale binary against a fresh checksum), and the race map. One helper now, `deployStamp_()` (core.js), replaces nine copies of
`window.LOAD ? '?t=' + window.LOAD : ''`; `js/check-cache.js` fails on any fetch of `data/`, `tools/` or `js/` without it, and on
a change to the worker's exact-hit line that would make the rule moot.

## 3. Practice (N-1793374963790-42847)

*"questions and answers should both go into a new practice tag. practicals should also go into practice tag"* — `KIND_UNDER`
(find.js), the kinds' twin of `DOC_TYPE_UNDER` (545): a question, an answer page and a practical answer What kind with `Practice`
as well as their own kind, on every page (`tagOf`, so a Practice chip keeps answer pages). `kindRank_` puts Practice just before
its first kind. `check-funnel.js` (`FUNNEL_ONLY=under`) reads every question and practical.

## 4. One kind of answer a facet; Religion asked (N-1793358795257-52516, N-1793358711436-35101, N-1793358910318-93024)

*"why are there languages in same menu as books in same menu as original manuscripts in same menu as portions of bible"*,
*"Greek should be a tag not merged with the version"*, *"why is religion not coming up"*.

- **Language** (`wLanguage`) and **Translation** (`wText`) are two readers of one built label (`writingLanguageOf_`,
  `writingVersionOf_`): "English, King James Version (1611)" answers English and King James Version (1611). An original (the
  Septuagint, the Masoretic text) has a language and no translation. A manuscript's language (the history database's own
  Language facet, `histLanguage`, retired) is the same question.
- **Source text** never a bare language: the Quran's original is `Arabic Quran`, as the Bible's is the Masoretic Text.
- **Religion** (`wReligion`) is a writing's registry topic, asked before Work. Library › Religious Studies now asks Religion first
  (Ancient Egyptian religion, Christianity, Islam, Judaism, Mesopotamian religion). Topic still holds hundreds of answers, which is
  why it never came up.
- `check-writings.js`: Language holds only languages (`WRITING_LANGUAGES`), Translation and Source text never a language or a
  language glued to a name; every religious writing answers Religion with its topic; the facets tab asks Religion before Work; and
  the real funnel (through `js/finder-tags.js`, kept current by its `--check`) asks Religion first in Library › Religious Studies
  for every view that holds the writings.

## 5. The email's tags in the card's order (N-1793358484043-19878)

529 moved Accuracy before Paper on the card; the Sunday email kept its own copy of the order (`DIGEST_TAG_FACETS`) and put it last
— check-funnel had been reporting 23,842 questions with differing tags. The email now orders its tags by `data/settings/facets.json`,
fetched like the library (`digestFacetOrder_`, site first, then raw.githubusercontent.com) — the file the phone orders the card by.
The list's own order is only the fallback, and `check-digest.js` holds it to the file. Backend change: the four version stamps are
bumped. The Edexcel A-level 2024 questions carry **Accuracy unverified**: none of their answers is marked checked against the
official scheme in the library (`verified`), so the tag says so — question for the owner whether they have been checked.

## 6. Ancient Egypt and more papyri (N-1793383977902-90104, N-1793211836078-8569)

Public domain only. Budge, *Legends of the Gods: The Egyptian Texts* (1912; Budge died 1934) — his translations, a card a legend
(Horus of Behutet and the Winged Disk, the Origin of Horus, the Death and Resurrection of Horus from the Metternich Stela, Ra and
Isis, the Destruction of Mankind, …), his introductions and footnotes left out — and Plutarch's *Isis and Osiris* as printed in the
same book: `TX-0085`, `TX-0086` in `data/pdtexts`, Religion *Ancient Egyptian religion* (the registry, `pdtexts:TX-…`, and a topic
`rs-egyptian`). `tools/pd-texts.py --add egypt` appends a part to the index without rewriting the rest. Mercer's Pyramid Texts
(1952) are not public domain and are not used. Seven papyri join the history database (`MS-0005`–`MS-0011`): Papyri 66, 75, 46
and 45, the Nash Papyrus, the Papyrus of Ani and the Egyptian Papyrus Chester Beatty I (the Contendings of Horus and Seth) — facts
only, each with its source.

## 7. "Can't find variable writingAdmit_ / seenOk_ / wordsIn_" (26 Oct)

A stale deploy: all three are declared (writings.js, words.js) and `node js/check.js` finds nothing read before it exists.
