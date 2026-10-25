# 424 — GCSE Computer Science, upgraded: twelve animations, two new chapters, and `lib_pending`

**Asked for as** an upgrade of the GCSE Computer Science content (OCR/AQA style): searching and sorting, programming
fundamentals, data representation, Boolean logic, computer systems, networks, cyber security, ethics and law — with
script-written animations for bubble, merge and insertion sort, binary against linear search, binary place values,
hex nibbles, logic gates, the fetch-decode-execute cycle, packet switching, pixels and colour depth, run-length
encoding, and stacks and queues.

### What was there

`TB-GCSE-CS` had twelve chapters (Systems architecture … Languages and IDEs), each with 6–7 key words and five worked
lines, and two hand-made drawings: `bin` (eight lamps counting, chapter 3) and `sort` (bars settling into order, chapter 8).
The chapters already covered every area asked for; they were thin on the terms an exam asks by name (PC, MAR, MDR, ACC,
packet switching, the TCP/IP layers, the protocols, the kinds of malware, XOR, casting, local and global variables …).

### What changed

- **Key words added** to chapters 1, 2, 3, 4, 5, 7, 8, 9 and 11 (67 in all). The worked lines are untouched: they were
  good and `check-textbooks` holds a chapter to five. The words went into `data-private/textbooks.json` and the import
  file, never into git (397).
- **Two new chapters, 13 Data structures and 14 Compression and coding** (records, arrays, 2D arrays, stacks and
  queues; lossless and lossy, RLE, Huffman coding with MISSISSIPPI worked to 21 bits). Their cards carry
  **`lib_pending: "True"`** (below). The book's summary says fourteen chapters.
- **Twelve animations**, each written by `tools/cs_<id>.py` through `anim_row.write_anim`: `bubble`, `insert`, `merge`,
  `search` (chapter 8), `bin`, `hex`, `pixel`, `rle` (chapter 3), `fde` (chapter 1), `packet` (chapter 4), `gates`
  (chapter 11), `stack` (chapter 9). Each script runs the algorithm it draws (the sort, the search, the two
  instructions through PC, MAR, MDR, CIR and ACC, the truth table, the runs) and turns the steps into keyframes, so a
  changed list changes every move. `bin` keeps its id and splash row and is now the script's: bits flip to 5, 77, 200,
  255 with the place values that add up. **`sort` is gone** (its splash row too): three real sorts replace a picture of
  "sorting". A script's first run takes `--init` to make the row under its chapter; after that it writes through
  `write_anim` like every other, and `check-anims` re-runs each on a copy of the books.
- Each drawing's `about` names a key word or worked line that was already in the chapter at the pinned commit, so a
  fresh clone (words from `LIB_SOURCE_COMMIT`) still passes `check-textbooks`. That is why `stack` hangs on chapter 9's
  *Array* and not on the new chapter 13, and why no drawing hangs on a pending chapter.
- **`SPLASH_CACHE_MAX` 200 000 → 250 000.** The 39 drawings come to about 242 000 characters (the fetch-decode-execute
  one is the largest of the twelve, 7 700). The cap was raised in the open, as its note asks: the copy is still well
  under a twentieth of the 5 MB store, and it still gives way whole to a child's answer (`splashGiveWay_`, `check-anims`
  section 3, measured on the real rows).

### `lib_pending` — a new chapter whose words are on their way

A session cannot push to the Ledger (407), so a new chapter's words reach it only when the owner taps Import. Until
then the card is public and its words are not in the Ledger, and on any other machine not in `data-private/` either.
The shared convention for new chapters:

- The card row in `data/textbooks.json` carries `lib_pending: "True"` (with `lib_has` as `split` computes it).
- **On the phone** a pending content card is drawn as a waiting card that says *Coming soon.* — its title and tags,
  no request to `libItems`, signed in or not (`libChapterBody_` reads `libPending`; `libIdsFor_` asks for nothing;
  `libSay_` says it).
- **`check/lib-full.js`** does not count a pending row as "words in the Ledger and none here", and **`check-textbooks`**
  skips the word and worked-line minimums for a pending chapter with no words on this machine; with its words present
  it is held to every rule.
- Once the import is in, a later commit drops `lib_pending` from the two rows and the cards open normally.

### The import file

`node tools/lib-private.js drive-pack <out>.json --note …` wrote it: 11 items under `files.textbooks` (the nine
upgraded chapters whole, and 13 and 14 new, whose public cards ride in `cards.textbooks`). Upload it to the Drive folder
`family-library-imports` as `lib-import-<time>.json`; the owner taps *Import library updates* on Business.

### Checks

`check-anims` (39 rows, 26 scripts, each re-run byte for byte), `check/anims.js` for the twelve (inside the card at
320 and 390 px, still under reduced motion), `check-textbooks` with and without `data-private/`, `check-secrets`.
Screenshots of the frames at 390 px were looked at for every drawing.
