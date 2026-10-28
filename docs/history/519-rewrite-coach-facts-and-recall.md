# 519 — The Rewrite coach keeps the facts: a mechanical scanner, recall, and a narrow AI

The owner's goal: "the user retains the top-notch substantive content of the text; only the articulation
changes". Then, mid-build: "rely on AI as little as possible; make the substance check mechanical where it can
be, and where AI is used, narrow its scope so a weaker model (Gemini) errs less."

The 509 coach asked Gemini for 3–7 loose "key ideas" and checked each box separately: nothing proved every fact
survived, everything stopped with the AI off, and a student who kept "oxidative phosphorylation" verbatim was told
they had copied.

## What the phone does on its own (`js/rewrite.js`, no AI)

- **The substance scanner.** Every word of the source is weighed by rarity: stopwords drop out; the ~1,500
  commonest English words (`RW_COMMON_WORDS`, plus the everyday words of school writing) weigh 0.5; anything else
  is substance at 2; numbers, dates and capitalised names (not at a sentence start) at 3. Light stemming
  (`rwStem_`: plural, -ing, -ed, -tion, -ment, -ly…) is the same on both sides. A fact's score is the weighted share
  of its substance stems present in the student's answer (`rwCover_`); the missing words are shown as chips,
  rare ones bold, live as they type (the line under the box is redrawn, not the box).
- **Protected terms come from the scanner** (`rwTermsOf_`): each run of rare words, numbers or names in the source
  ("carbon dioxide", "1779"), kept verbatim, ordered by weight.
- **The facts are split mechanically** (`rwSplitFacts_`): sentences, then long sentences at a clause (", which",
  ", and", ", because"…), merged back to at most 12.
- **One cue per fact**: "What did the text say about <its rarest term>?", one box under each — narrowing what the
  student writes and what the AI must judge.
- **Recall by default**: after studying the text and checklist, *Write from memory* hides both; **Peek** is a tile
  and is counted ("2 so far"). While hidden, the chips are only a count, since the words would be the answer.
- **The copying check ignores protected terms**: their words are skipped in both texts before four-word runs are
  found, and are not counted as the student's words. Skipped, not separators — the source's own words around a
  term are still caught across it.
- **Score line**: "Facts kept X/N · Own wording Y%". A fact is kept by the AI's verdict where it gave one, else by
  the scanner (≥ 80% kept, ≥ 40% changed, less missing — shown as "(by the words)"). **Try again** shows only the
  boxes of the facts still out, from memory, and asks only those.

## Where the AI is still used, and how narrowly (`backend/dopost.gs`)

- `rewriteIdeas` is optional (**Tidy the facts with AI**): it gets the phone's split and may only merge, split and
  clean it (`facts: [string]`), plus `vocab` and 2–3 articulation `tips`. Terms, cues and scores stay the phone's.
- `rewriteCheck` gets `items: [{fact, mine}]` — one fact and the answer to that fact alone, per item — and returns
  per item a `verdict` (enum yes/partly/no) and `quote`, the student's exact words carrying it, plus a short
  articulation `note`. A verdict stands only with a quote that really occurs in that item's answer: the server
  drops it to "no" otherwise, and the phone checks again (`rwVerdict_`).

Unchanged: admin only (twice), the daily cap (`rewrite_coach_per_day`, given back on failure), nothing stored or
logged, the key in Script Properties, tiles not pop-ups, never a rewrite. Every reply is picked field by field; a
reply that is not a JSON object is a plain failure. Fixed on the way: both askers returned an undeclared `r` on a
Gemini error (a ReferenceError, so the message was lost).

Checks: `js/check-rewrite.js` proves the backend shapes and the scanner on fixed examples (a paraphrase keeping
the terms scores ≥ 80% and is not copying; dropping "glucose" shows it missing first; a copied clause is
flagged; a quote not in the answer loses its verdict; turning off rarity weights or term skipping turns it red).
A journey in `check-flow.js` drives the widget: AI off end to end, then with the AI stubbed.

Stamps: `2026-10-28-zz4-rewrite-facts` (all four), css the same.
