# js/find-facets.js

The full text of comments in `js/find-facets.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### ONE WAY TO SAY A VALUE, FOR EVERY FACET (396):

top level, before `SAY_AS_IS`

```
/* ONE WAY TO SAY A VALUE, FOR EVERY FACET (396): its first letter capitalised, unless it is a single lower-case letter or a
   roman numeral — a part `a` and a sub-part `ii` as the paper prints them. */
```

### A SHOW FITS A TAG (kcTidy_'s KC_TAG_MAX, 30), or the card moves it to an open-only line:

top level, before `SHOW_MAX`

```
/* A SHOW FITS A TAG (kcTidy_'s KC_TAG_MAX, 30), or the card moves it to an open-only line: the owner's short label (labels.json, */
```

### facet-show:<field>, in facetSay_), else the first of its reference ("II-II.122.3"), its name before a

top level, before `SHOW_MAX`

```
/* facet-show:<field>, in facetSay_), else the first of its reference ("II-II.122.3"), its name before a bracket, its first words, its ends. */
```

### ONE ORDER FOR EVERY FACET'S ANSWERS, BY WHAT THEY ARE (396):

top level, before `ROMAN_SAY`

```
/* ONE ORDER FOR EVERY FACET'S ANSWERS, BY WHAT THEY ARE (396): years and dates newest first, numbers by size, months
   by the calendar, roman numerals by value, kinds by the kinds tab, the rest A–Z with numbers as numbers. */
```

### LISTS WHOSE OWN ORDER IS THE ORDER (473):

top level, before `FRONT_ORDER`

```
/* LISTS WHOSE OWN ORDER IS THE ORDER (473): a file pushes one, and answers all in it sort by it — the Talmud's orders and tractates. */
```

### TWO ANSWERS THAT WOULD BE DRAWN THE SAME SAY WHAT TELLS THEM APART (396):

top level, before `tellApart_`

```
/* TWO ANSWERS THAT WOULD BE DRAWN THE SAME SAY WHAT TELLS THEM APART (396): the other facets, in the tab's order, added
   until each reads differently — `Paper 1 · Higher` beside `Paper 1 · Foundation`. */
```

### STILL TWIN, NO FACET SPLITS THEM:

in `tellApart_`

```
/* STILL TWIN, NO FACET SPLITS THEM: each says its own whole name (owner, 10 Nov: two "Paper 3" buttons), never two alike. */
```

### ITS OWN NAME (`nameOf`, a paper's title) where the facet has one, else what it is called:

in `tellApart_`

```
/* ITS OWN NAME (`nameOf`, a paper's title) where the facet has one, else what it is called: the first that tells them apart. */
```

### ONE READ PER ITEM (930):

in `facetTally_`

```
/* ONE READ PER ITEM (930): the weighed split below once read every item's values again, half of Find's wait on a phone. */
```

### `value` IS WHAT IS MATCHED, `text` WHAT IT IS CALLED, `show` WHAT IS DRAWN — the shortest unique form

in `facetTally_`

```
/* `value` IS WHAT IS MATCHED, `text` WHAT IT IS CALLED, `show` WHAT IS DRAWN — the shortest unique form (`shortLabels_`). */
```

### NAMED AND SORTED ONLY WHEN READ:

in `facetTally_`

```
/* NAMED AND SORTED ONLY WHEN READ: a question turned away for its count alone (`facetWhy_`) never pays for its words. */
```

### THE SPLIT IS MEASURED IN THINGS, NOT CARDS (517):

in `facetTally_`

```
/* THE SPLIT IS MEASURED IN THINGS, NOT CARDS (517): a writing (`libBook`) weighs one however many verses it is, so the
     Bible's 31,000 cards cannot make Subject look lopsided. Every facet, one rule. */
```

### AN ANSWER SPELT LIKE A CHOSEN CHIP IS NEVER OFFERED (830), under any question:

top level, before `facetValues`

```
/* AN ANSWER SPELT LIKE A CHOSEN CHIP IS NEVER OFFERED (830), under any question: the chip already says it (680 is the chips' side). */
```

### HOW MANY OF THESE COULD EVEN ANSWER IT.

top level, before `facetCoverage`

```
/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
```

### KINDS UNDER KINDS (546, 610):

top level, before `KIND_UNDER`

```
/* KINDS UNDER KINDS (546, 610): questions, answers and practicals under Practice; timelines, and projects (owner, 7 Nov), under Library. */
```

### A TUTOR ANSWERS TWO FRONT DOORS (owner, 8 Nov):

in `KIND_UNDER`

```
/* A TUTOR ANSWERS TWO FRONT DOORS (owner, 8 Nov): one card, tagged Booking and Profiles, like a setting's several types. */
```

### ITS TAG SAYS ONE DOOR:

top level, before `kindTopTag_`

```
/* ITS TAG SAYS ONE DOOR: a kind under two (a tutor: Booking and Profiles) is the door picked, else its own group in FIND_KINDS — never the other. */
```

### ONE RULE FOR A VALUE UNDER ANOTHER (660):

top level, before `underTop_`

```
/* ONE RULE FOR A VALUE UNDER ANOTHER (660): the first question answers the one above, the second the value itself — only in a family that has one. */
```

### 680: the second offers only what is BELOW the one above, never the parent's own name again; Doesn't

top level, before `underOwn_`

```
/* 680: the second offers only what is BELOW the one above, never the parent's own name again; Doesn't matter covers the rest. */
```

### THE ONE RULE EVERY FACET IS ASKED BY (396), as a reason it is NOT asked, or '' when it may be:

top level, before `FACET_MAX_GRID`

```
/* THE ONE RULE EVERY FACET IS ASKED BY (396), as a reason it is NOT asked, or '' when it may be: two answers at least,
   half the list able to answer, a split worth making. `over` lets a question past FACET_MAX_ANSWERS through. */
```

### A NUMBERED RUN IS DRAWN AS A GRID (396):

top level, before `FACET_MAX_GRID`

```
/* A NUMBERED RUN IS DRAWN AS A GRID (396): bare numbers, or one word and a number (`Chapter 7`, drawn as 7). Up to FACET_MAX_GRID it is a question, not a list (600). */
```

### COUNTED BEFORE NAMED:

in `facetWhy_`

```
/* COUNTED BEFORE NAMED: past every grid and every answer the chips or DOC_TYPE_UNDER could take away, it is a list whatever its words. */
```

### 680: answers that are all BELOW an answer already chosen are asked even alone — Doesn't matter is the

in `facetWhy_`

```
/* 680: answers that are all BELOW an answer already chosen are asked even alone — Doesn't matter is the parent's own. */
```

### A QUESTION WHOSE EVERY ANSWER IS A KIND'S NAME (the kinds tab) chooses what a card IS, not how many (660):

top level, before `kindNamed_`

```
/* A QUESTION WHOSE EVERY ANSWER IS A KIND'S NAME (the kinds tab) chooses what a card IS, not how many (660): two answers make it
   worth asking, however lopsided. Decided by the values, never by the field. */
```

### A QUESTION THAT RE-ASKS ONE ANSWERED ANY (499, 660):

top level, before `facetEcho_`

```
/* A QUESTION THAT RE-ASKS ONE ANSWERED ANY (499, 660): every answer sits inside one answer of it — Shelf after Any subject is Subject
   again; Which or Shelf after Any kind is What kind asked finer. Every facet, by its items. */
```

### FINER BY WHAT IT IS, NOT BY THIS LIST (8 Nov):

in `facetEcho_`

```
/* FINER BY WHAT IT IS, NOT BY THIS LIST (8 Nov): read over everything, so Year under Any verified, inside it only by chance
       in one subject's list, is still asked; Shelf sits inside Subject everywhere and stays an echo. */
```

### A skipped question the list answers one way was never a choice, so nothing re-asks it

in `facetEcho_`

```
/* A skipped question the list answers one way was never a choice, so nothing re-asks it (a list of projects alone, 660). */
```

### Each F answer's one G answer over a list, or null when one F answer spans two G answers or a card holds

top level, before `echoTo_`

```
/* Each F answer's one G answer over a list, or null when one F answer spans two G answers or a card holds no single G. */
```

### A COUNT WITHIN EACH ANSWER OF ANOTHER QUESTION (Question within Paper):

top level, before `runsInside_`

```
/* A COUNT WITHIN EACH ANSWER OF ANOTHER QUESTION (Question within Paper): each G answer with two F answers holds a run of the
   same names, one run inside the next, so Q1 under two papers is two things. Held until one G answer is left. */
```

### Not when G's answers also run, unevenly, inside F's:

top level, before `runsInside_`

```
/* Not when G's answers also run, unevenly, inside F's: that is a grid (Question by Part), and neither is the other's count. */
```

### A count lives only inside its parent:

in `runsInside_`

```
/* A count lives only inside its parent: a card with F and no single G (a key stage with no Accuracy) makes F G's equal. */
```

### A count runs longer than its parents are many:

in `runsInside_`

```
/* A count runs longer than its parents are many: Required (two answers) under each practical type is a side, not a count. */
```

### A G ALREADY ASKED NEVER HOLDS F (8 Nov):

in `facetLocal_`

```
/* A G ALREADY ASKED NEVER HOLDS F (8 Nov): answered Any, "one G left" never comes, and the funnel ended with thousands left. */
```

### ONLY A COARSER G, one the tab puts before F (8 Nov):

in `facetLocal_`

```
/* ONLY A COARSER G, one the tab puts before F (8 Nov): Marks after Paper never holds Paper as its count, by chance or otherwise. */
```

### A G NEVER ASKED HERE NEVER HOLDS F (1180):

in `facetLocal_`

```
/* A G NEVER ASKED HERE NEVER HOLDS F (1180): Paper waited on a lopsided Function, and A-Level papers had no Paper question. */
```

### HOW WELL A QUESTION SPLITS THE LIST, in bits, the score the menu-rule check measures (920).

top level, before `FACET_BITS_ENOUGH`

```
/* HOW WELL A QUESTION SPLITS THE LIST, in bits, the score the menu-rule check measures (920). Past FACET_BITS_ENOUGH a split is
   good enough and the tab's order decides, so Part (twenty-odd answers) never jumps in front of Subject. */
```

### THE NEXT QUESTION WORTH ASKING, or nothing (rule 7, owner 6 Nov):

top level, before `nextFacet`

```
/* THE NEXT QUESTION WORTH ASKING, or nothing (rule 7, owner 6 Nov): of those the one rule lets through, the best split;
   the tab's sort_order only breaks ties. A kind question still comes first (660, front 4 Nov). */
```

### What a card IS is asked first (660), the front's answers are FRONT_ORDER's (4 Nov), and a choose question

in `nextFacet`

```
/* What a card IS is asked first (660), the front's answers are FRONT_ORDER's (4 Nov), and a choose question (mScope, owner 6 Nov) leads its list. */
```

### THE COARSEST HOLDING IT, BY THE TAB (1180):

in `nextFacet`

```
/* THE COARSEST HOLDING IT, BY THE TAB (1180): Month jumped Level and Board where each board sat in one month, so SATs met neither. */
```

### A CARD MAY HOLD TWO OF G (the Masoretic Text is Christianity and Judaism, 660):

in `facetInside_`

```
/* A CARD MAY HOLD TWO OF G (the Masoretic Text is Christianity and Judaism, 660): each F answer keeps the G answers all its cards share. */
```

### G's two answers are the list's, not only F's cards':

in `facetInside_`

```
/* G's two answers are the list's, not only F's cards': Religion sits inside Subject though every religious card is Religious Studies. */
```

### AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END:

top level, before `overFacet_`

```
/* AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END: of those held back only for having
   too many answers, the one with fewest. § */
```

### THE CARD. Small — a reference, the marks, and the first line of the question, because a list of ninety

top level, before `fightCard_`

```
/* THE CARD. Small — a reference, the marks, and the first line of the question, because a list of
   ninety parts is scanned rather than read. The whole thing opens on a tap. */
```

### THE RECORD IS THE FACE OF IT.

top level, before `fightCard_`

```
/* THE RECORD IS THE FACE OF IT. W-L-D first, KOs under it, and the date the count was taken —
   because a record with no date is the one number on the card that can quietly go wrong. */
```

### ---------- ONE BOUT (batch D): the two fighters' portraits facing each other under the tags, and nothing else

top level, before `fightCard_`

```
/* ---------- ONE BOUT (batch D): the two fighters' portraits facing each other under the tags, and nothing else ---------- */
```

### THE `required` FACET'S THREE ANSWERS, IN THE ORDER A TUTOR READS THEM:

top level, before `PRAC_NEED`

```
/* THE `required` FACET'S THREE ANSWERS, IN THE ORDER A TUTOR READS THEM: what a board demands, what is
   worth doing anyway, and what was turned down. The words the card's pill said, unchanged. */
```

### WHAT KIND OF AFTERNOON THIS IS AND WHETHER A BOARD DEMANDS IT -- `Build · Extra` -- were two pills of the

in `practicalCard_`

```
/* WHAT KIND OF AFTERNOON THIS IS AND WHETHER A BOARD DEMANDS IT -- `Build · Extra` -- were two pills of the head's own § */
```

### THE BOARD AND THE SPEC ON THE SUBJECT'S LINE -- `AQA 8552` is which qualification the work counts

in `projectCard_`

```
/* THE BOARD AND THE SPEC ON THE SUBJECT'S LINE -- `AQA 8552` is which qualification the work counts towards, and a project has neither, so its line is unchanged. § */
```

### THE PRACTICAL'S PAGE HEADING, for its reason:

in `projectPart_`

```
/* THE PRACTICAL'S PAGE HEADING, for its reason: a page you land on from a flick four results
     away has to say whose page it is. */
```

### THE SAFETY LINE IS UNDER THE STEPS, ONE PARAGRAPH, which is `jobAdminOpts_`'s rule.

in `projectPart_`

```
/* THE SAFETY LINE IS UNDER THE STEPS, ONE PARAGRAPH, which is `jobAdminOpts_`'s rule. On a
       project it is mostly about who is in the shot and what stays offline, which is a thing to
       read before filming rather than after. */
```

### A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development, models

in `projectPart_`

```
/* A COURSEWORK'S STEPS ARE ITS STAGES -- brief, research, specification, ideas, development, models, making, evaluation -- and that is the word a GCSE pupil and § */
```

### A THING HAS TILES: the one action on this page is going to Messages, so it is a tile in a `.tile-row`

in `projectPart_`

```
/* A THING HAS TILES: the one action on this page is going to Messages, so it is a tile in a
       `.tile-row`, not a button — `check-doors` pairs `proj-share` with its handler below. */
```

### TO MESSAGES, AND NOTHING ELSE.

top level, before `tbMath_`

```
/* TO MESSAGES, AND NOTHING ELSE. Who to write to is the Messages screen's question — it already
   knows who a student may reach (`MESSAGING` in constants.gs) — so this does not open a composer
   of its own with a guessed recipient. */
```

### THE MARK ITSELF. A letter rather than a colour, because the tier is a fact somebody has to read in a

top level, before `tbHigher_`

```
/* THE MARK ITSELF. A letter rather than a colour, because the tier is a fact somebody has to read
   in a photocopy too; `title` says it in full for anybody who does not know the convention. */
```

### ONE WIDGET PER THING (408):

top level, before `contentCard_`

```
/* ONE WIDGET PER THING (408): the card is its title, its tags and its key words; formulas, worked lines and each drawing are
   pages of their own, each titled (`contentPart_`). */
```

### A CONTENT CARD'S OTHER PAGES AND THEIR TITLES, ONE PLACE (408):

top level, before `CONTENT_PAGE`

```
/* A CONTENT CARD'S OTHER PAGES AND THEIR TITLES, ONE PLACE (408): `check-flow`'s one-widget journey reads the same table. */
```

### `opt.only` draws one section ('words' | 'formulas' | 'points'); `opt.bare` drops its heading, as the

top level, before `tbSections_`

```
/* `opt.only` draws one section ('words' | 'formulas' | 'points'); `opt.bare` drops its heading, as the page's own title says it (408). */
```

### A WORKED LINE IS NAMED BY HOW IT OPENS — "Exact values: sin 30° …" is about Exact values — and the next

in `tbSections_`

```
/* A WORKED LINE IS NAMED BY HOW IT OPENS — "Exact values: sin 30° …" is about Exact values — and the
     next character must not carry the word on: "Mean" is not the opening of "Meanwhile". */
```

### THE MARK ON THE FORMULA'S NAME, not after the formula:

in `tbSections_`

```
/* THE MARK ON THE FORMULA'S NAME, not after the formula: a stacked fraction is two lines tall
         and an `H` trailing it sat alone on a third, measured at 320px. */
```

