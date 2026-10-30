# 526 — The owner's notes of 29 October: Suggest on every page, no blank working paper, verified tags asked, four emails, photos to the AI, a Bible by its source text

Six notes left with Suggest a change, five of them on Edexcel A-level Maths 2021 in Find 2
(Questions › Maths › Past paper › A-Level › Edexcel › 2021). Each is fixed as a rule with a check proven by mutation.

## 1. "I don't see suggest changes button on these questions here" (N-1793308849754-97324)

A question's part page had the tile (`cardTiles_` → `suggestTileFor_`), but a stem's own page and a long part's first
pages (`questionStemCard_`, `questionPreCard_`) carried only `qPageTools_` — Magnifier, padlock, Read aloud. Most
A-level questions open on a stem, so the owner saw no Suggest at all. `qPageTools_` now ends with `suggestTileFor_(x)`,
so every page of a question has it. check-flow "Find 2 › Questions › Maths … (owner, 29 Oct)" walks the owner's path and
fails any question page without `rep-box`; proven by taking the tile back out of `qPageTools_`.

## 2. "why is there a button which opens the working paper … remove that" (N-1793308592815-70566)

The button was the Pen. On a part with no figure, no stem figure and no surface of its own, its first tap laid a
blank grid (`padSource_`'s last line, `surface || 'grid'`) — a sheet of working paper. Ruler, Protractor and Compass
open the pen where there is no figure, so they did the same. The rule now: `padHasArt_(x)` — a drawn answer, a surface
the row names, the part's own figure or its one stem's — decides both whether `qtRow_` draws the four drawing tools
(`QT_DRAWING`) and whether `padSource_` gives anything. Photo of working, Magnifier, Read aloud, Lock and Check stay
on every part; Photo of working is the camera, not a paper, and note 5 is about it being used. check-answerable's
`tools` and `surface` invariants and check-flow's tool-row journey hold it (named grid: nine tiles and a grid; no figure:
five tiles); proven by putting the blank grid back.

## 3. "why are there no tag options for accuracy verified or function verified?" (N-1793308524869-34322)

Both are ordinary facets (388), but the facets tab sorted them at 152 and 154, after Paper (140), Question, Part,
Page and Marks — by then one question is left and nothing splits it, so neither was ever asked. They are now 136
and 137, after Year and Month and before Paper. On the owner's path: all 116 parts are Accuracy verified, so Accuracy has
one answer and the one rule (396) does not ask it (the tag is on every card); Function is 114 to 2, under the 2%
minority bar for the whole year, so Paper is asked first — and after Paper 2 or Paper 32 (each holding one part that is
not machine-marked) Function is the next question. check-qtypes fails if either is sorted after any of the
question-picking facets; the flow journey asks the funnel after Paper 2. The 2% bar was not lowered: it is every
facet's, and lowering it would ask near-unanimous questions everywhere.

## 4. "the gmail viewer should just display your last 4 emails" (N-1793222690431-89812)

`inbox.js` drew a search pill, Inbox/Unread/label chips and More. It now asks `inboxList` for `in:inbox` once and
draws the newest four (`INBOX_SHOWN`); a row still opens the message in place, with Back, Open in Gmail and Show
images. No backend change: the backend still returns its page and the site keeps four. check-inbox's screen sends eight
threads and fails on anything but the newest four, or on a search pill, chip or More; proven with `INBOX_SHOWN = 20`.

## 5. "a student did a 'show that' algebraic proof question, took a picture … It was marked with key words. Is there a way to read the image and mark without AI?" (N-1793308930663-34949)

A part marked by `mark_words` (507 proof parts are) had its Check run the key words on the typed box, whatever photos
sat in the strip under it; "Mark my working" was a second button beside it. Now Check on a part holding photos hands
them to `markWorking` (the AI marker that reads photos, 501) with whatever was typed, and says so; with no photo the
key words mark the typed box as before. check-flow "a part with photos of its working …"; proven by removing the hand-over.

Without AI: no. Reading handwritten algebra from a phone photo needs handwriting recognition of maths (a vision model);
the site has no such reader of its own, and a key-word or pattern rule cannot see a photo at all. The honest choices
are the AI marker on the photo, or the student typing the working so the rules can read it.

## 6. The Bible by its source text (Find › Library › Religious Studies)

The owner: "pick Bible, then original text like LXX or MT, then translation". `WRITING_KEYS` gains `source`, and the
facet `wSource` ("Source text", sort 24.07) is asked after Work and before `wText` (now labelled "Translation", 24.1),
then Collection, Section, Book, Chapter, Unit. The Source is never set by a loader: `writingSourceOf_(text, collection)`
reads the Text's `base` in `WRITING_TEXTS` — KJV and WEB by testament (Old Testament → Hebrew Masoretic Text, New
Testament → Greek New Testament, the Deuterocanon → Greek Septuagint), HBO the Masoretic, LXX and Brenton the
Septuagint, GNT the Greek New Testament, the Quran's Arabic and Pickthall both Arabic (one answer, so the funnel goes
straight to the translation), the Talmud's one text the Babylonian Talmud (Bavli) — a Yerushalmi would be a Text with its
own base. Writings with no base (hadith, the church texts, literature) have no Source and the one rule does not ask it.
check-writings holds every Bible book, Quran and Talmud card to its base, fails a loader that sets its own Source, and
fails the facets tab if Work, Source text, Translation, Book, Chapter, Unit are not in that order; check-bible's list
of writing questions and the John 3:16 walk follow it. Proven by dropping the derivation, by giving Brenton the
Masoretic as its base, and by sorting Source after Translation.
