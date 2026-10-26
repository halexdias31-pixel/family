# 471 — Content cards: one topic each, and two cards never read as one page

## What the owner said (26 Oct)

"look at CGP textbooks. Each page has a title at the top, and then all the information is jam-packed into that page."
The rule is in docs/library.md, "How a content card is written": one content card is one topic; a topic too big for
one card is split, and each part says in its title and first line what makes it distinct from its neighbour.

## The audit

All 1005 content cards (rows of `data/textbooks.json` without `anim`; the 173 animation rows were left alone) were read
per subject and level, titles and topics from the card, words from `data-private/` where this machine had them (298
cards; the other ~700 are `lib_pending` and were judged by title and topics only).

Most books were already one topic per card. The trouble was books added later beside an older one of the same subject
and level, so two cards covered the same ground under different names:

- **GCSE English Language**: the paper chapters and the toolkit/overview cards. The paper chapters' first key word
  already names the question, so the titles now lead with it ("Paper 1 Q2: analysing language"); the two
  "question by question" cards became "Paper 1/2 at a glance".
- **GCSE English Literature**: Macbeth, Jekyll and Hyde, A Christmas Carol and An Inspector Calls each had an overview
  card beside a characters and a themes card — the overview is now "<text>: the play/novella at a glance" with a first
  line pointing at its siblings. Unseen poetry and the glossary likewise against the poem-method and metre cards.
- **GCSE History**: the question-types card against History skills; medicine as Health and the people I, II, III.
- **GCSE Business**: the nine deeper cards are "… in depth"; each Edexcel chapter's first line says it is the topic in
  brief and names the in-depth card.
- **GCSE Geography, Computer Science, Media**: one overview card each given a first line naming its sibling; the
  three media-forms cards numbered I–III.
- **GCSE French/Spanish foundations**: "Future and conditional" was word for word a GCSE chapter's title.
- **KS2 English Language**: the SPaG cards are "…: test summary" against the KS2 English lessons; the reading
  passages are "… practice" against the reading-skill lessons.
- **A-level Maths**: the Statistics and Mechanics book repeats the A-level book's applied chapters; its cards say
  ", with worked examples" (its summary's promise) against the A-level overview.

The distinguishing first line is a first key word, `On this card — …` (key words are what a card draws first, and
`check-textbooks` wants `name — text`). It went only on cards whose words are on this machine; a pending card was
retitled only. Nothing was merged or split: every overlapping pair had one half whose words are only in the Ledger,
and a merge or split written blind would lose words. Topics, ids and animations are unchanged.

## Left for a session that has the words (`pull`)

GCSE English Language toolkit and story-structure cards against the Creative Writing book (AFOREST twice); the French
and Spanish foundations theme cards against the GCSE theme cards; KS2 SPaG against KS2 English beyond the titles; GCSE
Maths chapters that hold a whole section; A-level CS "Ethics, law and the NEA project".
