# 416 — English: new content cards, eight animations, and cards on their way (`lib_pending`)

**Asked for as** better learning content for GCSE English Language and Literature (plus KS2 SPaG where useful):
language techniques (AO2), structure, persuasive writing, descriptive and narrative writing, punctuation and grammar,
the Language Paper 1 and 2 questions, a method for poetry, the four most-taught set texts and unseen poetry. Shakespeare,
Dickens and Stevenson may be quoted briefly (public domain); Priestley is in copyright, so *An Inspector Calls* is
paraphrased throughout, with no quotation.

### What was there

`TB-GCSE-ENGLANG` had 12 chapters (one per Paper question, then Spoken Language, sentences, punctuation, spelling) and
`TB-GCSE-ENGLIT` 11 (the exam, one chapter per set text, the two poetry clusters, unseen poetry, terms). Each had six or
seven key words and five worked lines. No English chapter had an animation, and there was no KS2 English book.

### What was added

- **24 new content cards**, every one `lib_pending` (below):
  - English Language 13–19: Language techniques toolkit; Structure toolkit; Paper 1, question by question; Paper 2,
    question by question; Persuasive devices: AFOREST; Story arcs and narrative structure; Writing an analytical paragraph.
  - English Literature 12–22: Macbeth (characters; themes and key quotations), A Christmas Carol (characters; themes and
    context), Jekyll and Hyde (characters; themes and context), An Inspector Calls (characters; themes and context — all
    paraphrase), Analysing a poem step by step, Metre rhythm and form, Writing a Literature essay.
  - A new book, `TB-KS2-SPAG` (KS2 Grammar, Punctuation and Spelling): word classes; clauses and sentences; apostrophes;
    commas, speech and parenthesis; verb forms and tenses; prefixes, suffixes and spelling. Each chapter is tagged with
    the topics the KS2 questions already use (`data/topics.json`), so Find reaches them by topic.
- **Key words added** to eight existing chapters (Language 4, 5, 8, 10, 11; Literature 2, 5, 11), none taken away, so
  every drawing's `about` names a word that is in both the pinned commit and the new words.
- **Eight animations**, each written by its script through `tools/anim_row.py`, each with a caption per step and a
  reduced-motion still that holds the most the picture has to say:
  `esent` (simple → compound → complex, clauses labelled; Language 10), `eapos` (omission, possession, its or it's;
  Language 11), `epeel` (PEEL built block by block, then turned over to What, How, Why; Language 4), `earc` (Freytag's
  pyramid drawn while a six-line story is told; Language 5), `eforest` (AFOREST, seven devices on one argument; Language 8),
  `ezoom` (a lens on three words of "Vaulting ambition"; Literature 2), `emetre` (Sonnet 18 beaten out in iambs, then the
  witches' trochees; Literature 11), `escrooge` (Scrooge's warmth across the five staves; Literature 5). Screenshotted at
  390 px wide, moving and still.

The words are not in git: they went into `data-private/` with `join` and `split`, and into an import file written by
`node tools/lib-private.js drive-pack --ids …` (407) for the owner to import.

### `place`: a new drawing's row

`write_anim` could only rewrite what a row already had — a deliberate rule (a renamed element is a change made on
purpose). A brand-new drawing had no row to start from, so `write_anim(…, place=(book_id, chapter, title, about))` makes
the row directly under that chapter (after its other drawings) with the script's CSS whole, the first time only; after
that the script rewrites its row as every other script does, and `check-anims` re-runs it on a copy byte for byte.

### `lib_pending`: a card on its way

A new card's public row reaches the site by git before its words reach the Ledger by import. Without a mark, a fresh
clone fails (`check/lib-full.js`: words in the Ledger and none here — "run pull"), `check-textbooks` fails (no key words),
and the site tells a signed-in reader "This one is not in the library yet". With `"lib_pending": "True"` the first two
let a row with no words on this machine through (where `data-private/` has the words, they are joined and checked as
usual), and the site says **Coming soon**. The same minimal support is being added on other content branches; see
docs/library.md.

### The splash ceiling

The 29 drawings came to 191 730 of `SPLASH_CACHE_MAX` 200 000; the eight new ones take the books to about 242 000.
The ceiling is now 300 000 characters — still a small share of a 5 MB store, and every write that is refused gives the
whole copy back (`splashGiveWay_`), so a child's answer always wins the room. Raised here in the open, as the note on
`splashSync_` asks.
