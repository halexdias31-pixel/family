# 554 — The Rewrite coach grades rarity from a word-frequency list

The substance scanner (519) had two grades for a word that is not a stopword: one of ~1,500 common words
(`RW_COMMON_WORDS`, 0.5) or substance (2). "Process" and "chlorophyll" weighed the same. It needed a
word-frequency list to tell a word of substance from a truly rare one.

## The list

- `data/word-freq.json`: `{ about, source, licence, words }`, the 20,000 commonest words, commonest first
  (a word seen fewer than 3 times is left out).
- **Source:** counted by this repo's own `tools/word-freq.js` over the cards of the 88 public-domain texts in
  `data/pdtexts` (Gutenberg etexts, each listed with its source in `data/pdtexts/LICENSE`, 514).
- **Licence:** public domain. The texts are public domain and the counts are original; no published or
  copyrighted frequency list (BNC, COCA, SUBTLEX, Google n-grams) was used.
- Regenerate after the texts change: `node tools/word-freq.js` (`--check` exits 1 when the file is stale).
- The corpus is 19th-century and older, so "thou" ranks high and "oxygen" not at all. That suits the use:
  only *absence* from the list is read, and a modern technical word is exactly what should be rarest.

## What the coach does with it

- Fetched lazily by `rwRanksLoad_` the first time `rwDraw_` runs (admin opens Tools), never in `index.html`;
  on arrival the coach redraws unless a box has focus.
- `rwWeigh_`: a word of substance whose stem no ranked word shares weighs **2.5** instead of 2, so it counts
  more in a fact's cover score, sorts first among missing chips and protected terms, and stays bold.
  Common words, stopwords, names and numbers are unchanged; thresholds `>= 2` still hold.
- Fallback: no fetch, a 404 or bad JSON leaves `RW_RANKED` null and every weight is as in 519.

## Check

`js/check-rewrite.js` adds: the file is current (`tools/word-freq.js --check`), names its public-domain source
and licence, has no repeats, is not in `index.html`, `rwDraw_` asks for it; without ranks a substance word
weighs 2, with them "chlorophyll" weighs 2.5 and a ranked word 2. Mutation: 2.5 → 2 turns it red.
