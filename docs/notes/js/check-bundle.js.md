# js/check-bundle.js

The full text of comments in `js/check-bundle.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-bundle.js A BUNDLE NAMES EXACTLY THE PAPERS THE LIST IS, AND THE ORDER REACHES THE OWNER.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-bundle.js

   A BUNDLE NAMES EXACTLY THE PAPERS THE LIST IS, AND THE ORDER REACHES THE OWNER.

   ASKED FOR AS *"what happened to collection/bundle in the finder. like what if someone wants a
   bundle of 2017 past papers for maths edexcell to add to cart and have me send it to them?"* Three
   halves — the card, the basket, the message — and each of them can be wrong in a way that draws
   perfectly and is noticed by nobody until an order arrives with the wrong papers on it:

     · a bundle that names a paper the list does not hold, or leaves out one it does
     · a trolley that puts a paper in twice, or an old basket that stops drawing
     · a Send that empties the basket when the server said no, or writes to the wrong person

   `check-flow.js` CANNOT ASK ANY OF IT. Its fake backend answers every GET — `data/questions.json`
   included — with the payload, so its funnel has no library in it and no bundle can ever form. This
   boots the real app over the REAL files, the way `check-funnel.js` does, and a fixture only for
   what is not a file.

   THE EXPECTED PAPERS ARE WORKED OUT FROM THE FILE, NOT FROM THE APP. `bundleBuild_` groups the
   funnel's own list; the rule below reads `data/questions.json` row by row — subject, type, tier,
   year, month — and asks which papers have a question in that sitting. The two methods share
   nothing, so they cannot agree by sharing a mistake.

     node js/check-bundle.js
================================================================================================== */
```

### ---------- THE BACKEND, STOOD IN FOR — WITH SOMEBODY TO SEND AN ORDER TO

top level, before `OWNER`

```
/* ---------- THE BACKEND, STOOD IN FOR — WITH SOMEBODY TO SEND AN ORDER TO -------------------------
   THE FIXTURE HAS ONE TUTOR AND NO ADMIN, so an order from it has nowhere to go and the Send path
   would take its "nobody to send this to" branch and report nothing wrong. `doGet` sends admins
   among the tutors with their `personId`, so one is added in that shape. INVENTED, like every row in
   that file — this repository is public. */
```

### SIGNED IN THE WAY THE APP SIGNS ITSELF IN — `data.js` reads this key as it loads, so this is a returning visitor rather than a hand on `USER` after the fact.

in `boot`

```
/* SIGNED IN THE WAY THE APP SIGNS ITSELF IN — `data.js` reads this key as it loads, so this is a
     returning visitor rather than a hand on `USER` after the fact. `cart-add` and `cart-send` both
     refuse a stranger, and a check run as one would be measuring the refusal. */
```

### ---------- THE PAPERS A SITTING HOLDS, READ STRAIGHT OFF THE FILE

top level, before `ON`

```
/* ---------- THE PAPERS A SITTING HOLDS, READ STRAIGHT OFF THE FILE --------------------------------
   A question row whose own columns say it is that subject, that type, that tier and that sitting,
   and whose paper is printable — the only paper-level fact that can keep a whole paper out of an
   order, and the one the bundle card names rather than drops. */
```

### THE DOCUMENT ROW SAYS NO — the paper-level cell, never the question row's own.

top level, before `OFF`

```
/* THE DOCUMENT ROW SAYS NO — the paper-level cell, never the question row's own. 229 past-paper and
   28 specimen question rows have no `printable` cell while their paper's row says FALSE, and reading
   the question row is how `Bundles` came to offer Religious Studies (review of PR #130, finding 6). */
```

### ---------- 1. NOTHING BEFORE ANYTHING IS ASKED

top level, before `field`

```
/* ---------- 1. NOTHING BEFORE ANYTHING IS ASKED --------------------------------------------------
     The funnel's first state is the whole library — 266 papers — and a card offering it is a card
     between somebody and the question they came to answer. Asked on the first door too, because
     `Learning` is still the whole library.

     TWO GUARDS ANSWER THIS TODAY AND ONLY ONE OF THEM IS VISIBLE HERE. `bundleOf_` refuses before
     anything is asked, AND the whole library is 266 papers, past `BUNDLE_MAX`. Taking the first
     guard out was tried and this stays green, because the second still says no — said rather than
     implied, so nobody reads this assertion as having proved the first one. It is here for the day
     the library is small enough that only the first guard is left standing. */
```

### ---------- 2. THE OWNER'S OWN EXAMPLE, NAMED PAPER FOR PAPER

top level, before `DOORS`

```
/* ---------- 2. THE OWNER'S OWN EXAMPLE, NAMED PAPER FOR PAPER -----------------------------------
     Edexcel maths past papers from 2017, narrowed the way the funnel narrows — the chips a thumb
     would set, in order. It was `Summer 2017` until the owner asked for months rather than seasons:
     the funnel asks Year and then Month now, so the papers a thumb can reach as one set are the
     ones in one MONTH folder, and the title says `June 2017` the way the folder does. */
```

### BOTH TIERS, WHERE TWO PAPERS SHARE A NAME.

in `cases`

```
/* BOTH TIERS, WHERE TWO PAPERS SHARE A NAME. `Paper 1 (Non-Calculator)` and `Paper 1
       (Non-calculator)` are one letter's case apart, so the card has to say which is which. May, because
       that is the month both tiers sat Paper 1 in -- the June folder here holds Higher papers only. */
```

### `2017 & 2018` WAS HERE — the Year question's bucket.

in `cases`

```
/* `2017 & 2018` WAS HERE — the Year question's bucket. The owner took the buckets out (6 Oct:
       *"No more of these artificial categories"*), so that filter matches nothing now; the overlap
       it stood for below is the whole-year folder, which holds the June papers and more. */
```

### EVERY LABEL UNIQUE INSIDE THE BUNDLE, where it is read — `short` is the name the basket and the order message put under the bundle's title, so two papers

top level, before `shorts`

```
/* EVERY LABEL UNIQUE INSIDE THE BUNDLE, where it is read — `short` is the name the basket and
       the order message put under the bundle's title, so two papers sharing one is an order the
       owner cannot fill. Compared as a reader would, case and punctuation folded. */
```

### ---------- THE CARD IS WHERE THE PAGER SAYS IT IS

top level, before `host`

```
/* ---------- THE CARD IS WHERE THE PAGER SAYS IT IS ----------------------------------------
       ONE PAGE BETWEEN THE QUESTION AND THE FIRST RESULT, counted by the same function that draws
       it. Asked of the DOM against the count, because the fault that could come of this is the
       pager and the strip disagreeing about how many pages lead: every result would then be drawn
       one page off from the one it is counted as. */
```

### ---------- 3. A LIST THAT IS NOT WHOLE PAPERS IS NOT A BUNDLE

top level, before `name`

```
/* ---------- 3. A LIST THAT IS NOT WHOLE PAPERS IS NOT A BUNDLE ---------------------------------
     GCSE maths narrowed by TOPIC is questions from dozens of papers, not one of them whole. A card
     offering "the papers these are in" would be describing a different thing from the list under
     it — hundreds of printed pages for a few hundred questions. */
```

### TWICE, AND THE SECOND IS THE ONE THAT CAN FAIL.

top level, before `name`

```
/* TWICE, AND THE SECOND IS THE ONE THAT CAN FAIL. The whole of GCSE algebra is thirty-odd papers,
     past `BUNDLE_MAX`, so it would offer nothing even if wholeness were never asked — a case the
     bounds answer is not a case about wholeness. One sitting's algebra is three papers, inside
     every bound, and only the wholeness test keeps it out. */
```

### BY THE SEARCH BOX, NOT BY QUESTION NUMBER AND NOT BY TOPIC.

top level, before `name`

```
/* BY THE SEARCH BOX, NOT BY QUESTION NUMBER AND NOT BY TOPIC. A past paper answers no topic
      question any more (see `topicShown_`), and this case was `Q1–10` until the owner retired the
      question number (*"no more asking for questions 1-10 or question part 1 or b."*) — a `qNumber`
      chip now matches nothing, so `filterHit` lets everything through and the list WAS whole papers.
      Typing `work out` over the same sitting is the same shape a person can still reach: measured,
      17 questions from both papers (10 of 29, 7 of 28), inside every bound, neither whole. */
```

### ---------- 4. THE TROLLEY PUTS EACH PAPER IN ONCE

top level, before `first`

```
/* ---------- 4. THE TROLLEY PUTS EACH PAPER IN ONCE ----------------------------------------------
     PRESSED, through the app's own delegated click, twice. The second press must add nothing — an
     order with a paper on it twice is the owner printing it twice. */
```

### AND AN OVERLAPPING BUNDLE, which is where "not twice" is actually decided.

top level, before `had`

```
/* AND AN OVERLAPPING BUNDLE, which is where "not twice" is actually decided. Pressing the same
     bundle again is stopped before the handler by the tile itself — it is drawn filled and off once
     every paper is in — so that press proves the tile, not the rule. `2017, Higher` holds the two
     June 2017 papers already in the basket and the rest of that year; its trolley is live, and
     pressing it must add the rest and only the rest. Found by name rather than by position, so a
     case added above it cannot quietly make this press a different bundle. */
```

### ---------- 4b. `Bundles` IS A KIND, AND ITS RESULTS ARE BUNDLES

top level, before `kind`

```
/* ---------- 4b. `Bundles` IS A KIND, AND ITS RESULTS ARE BUNDLES ---------------------------------
     The owner, 6 Oct: *"bundle is a tag option too"*. Chosen under `What kind`, the list is every
     question on a printable paper, the funnel narrows it as usual, and what is drawn is one bundle per
     sitting — no question pages, and each bundle exactly that sitting's papers. */
```

### ---------- 4c. ONE PAPER IS A SITTING TOO, AND IT GETS ITS CARD

top level, before `BUNDLES`

```
/* ---------- 4c. ONE PAPER IS A SITTING TOO, AND IT GETS ITS CARD ---------------------------------
     THE REVIEW OF PR #130, FINDING 5. `bundlesBySitting_` asks `bundleBuild_` with `min` 1, and the
     first gate obeyed it while the second — how many papers are PRINTABLE — still asked for
     `BUNDLE_MIN`. So every one-paper sitting came back null: Maths · GCSE · 2019 drew June and
     November and left May out, and pressing `May` under Month drew "No whole sitting left on this
     list to bundle" over the one whole paper it is. Every journey that answered `Paper` — which the
     funnel always asks — ended on the same card. 4b only ever looked at sittings of several papers.

     THE MONTHS ARE READ OFF THE FILE, and the bundles' months off their papers' document rows, so a
     year's view is asked to draw a card for every month the file says that year was sat in. */
```

### ---------- 4d. A PAPER THAT CANNOT BE PRINTED IS NOT A BUNDLE'S QUESTION

top level, before `field`

```
/* ---------- 4d. A PAPER THAT CANNOT BE PRINTED IS NOT A BUNDLE'S QUESTION ---------------------------
     THE REVIEW OF PR #130, FINDING 6. `bundleable_` — which questions answer `What kind · Bundles` —
     read `printable` off the QUESTION row while `bundleBuild_` read it off the PAPER's, through
     `canPrint_`. Every AQA Religious Studies paper and both Greek ones say FALSE on the paper and
     nothing on the question, so Bundles offered `Religious Studies 152` and `Greek 78` under Subject
     and both led only to the "No whole sitting" card — blaming a topic or a paper nobody had chosen.

     ASKED AT THE ROOT FIRST: every question `Bundles` holds sits on a paper the file says can be
     printed. Then the symptom the owner would see: no subject whose every paper says FALSE is an
     answer — and Religious Studies and Greek must be among those, or the case measures nothing. */
```

### ---------- 4e. THE LAST LINE UNDER THE FUNNEL SAYS BUNDLES WHEN BUNDLES ARE WHAT IS BELOW

top level, before `BUNDLES`

```
/* ---------- 4e. THE LAST LINE UNDER THE FUNNEL SAYS BUNDLES WHEN BUNDLES ARE WHAT IS BELOW ---------
     THE REVIEW OF PR #130, FINDING 7. `stuffPages_` draws no question pages under `Bundles`, and the
     funnel's last line still said "That is the paper, in order. Swipe up for its 20 questions." — and,
     with `Doesn't matter` pressed on Paper, "Nothing left to narrow. Swipe up for the 60." over one
     bundle card. Read off the DOM, because the line is what somebody reads. */
```

### ---------- AND ALL THREE OF ITS BRANCHES, NOT ONLY THE ONE THAT HAS ONE BUNDLE

top level, before `BUNDLES`

```
/* ---------- AND ALL THREE OF ITS BRANCHES, NOT ONLY THE ONE THAT HAS ONE BUNDLE -------------------
     THE ROUND-1 REVIEW OF THIS CASE FOUND IT ASKED ONLY STATES WITH EXACTLY ONE BUNDLE. `bundlesEnd_`
     has three sentences — none, one, several — and the paper-or-not half in front of them, and three
     mutations of the other branches stayed green: the zero-bundle line falling back to "Nothing left
     to narrow. Swipe up for the 1." (finding 7's own fault, on the branch nobody asked), the plural
     saying "the 3 questions", and "That is the paper." said after `Doesn't matter` on Paper. All
     three branches are reachable — 368 journeys end on none and 432 on several — so all three are
     asked, and the paper half is held to whether a paper was actually chosen.

     THE COUNT IS MATCHED AS A WHOLE NUMBER. `includes('1')` would fail any line holding a 1 anywhere,
     so the list's length is looked for between word boundaries, and only where it differs from the
     bundle count — a line that says "the 3 bundles" over 3 items is not repeating the list. */
```

### THE NONE CASE, FOUND BY A SEARCH.

top level, before `askedNeeds`

```
/* THE NONE CASE, FOUND BY A SEARCH. It was found through `What you need`, pressed answer by answer
       until one left no whole paper -- and since 18 Oct that question is never asked: `needs` is a door
       on a chosen paper's page (`tagOnly`, docs/history/355), and the Bundles end draws no doors,
       because every answer inside a paper can only break the papers a bundle is made of. So the
       none case is the one a person can still reach: a typed search that keeps parts of papers.
       And the old door is held shut -- a `needs` answer offered here is a question back in the
       Bundles funnel that the rule took out. */
```

### NONE IS NOT A COUNT.

top level, before `dead`

```
/* NONE IS NOT A COUNT. The round-2 review deleted the zero branch and the line fell through to
         "Nothing left to narrow. Swipe up for the 0 bundles." — which held every rule above: no
         `question`, a `bundle`, and the list's 1 item never repeated. Over no bundle the line must
         say there is none, and promise no number of anything to swipe to. */
```

### ---------- THE DEAD END SAYS WHICH ANSWER TOOK THE PAPERS APART

top level, before `dead`

```
/* ---------- THE DEAD END SAYS WHICH ANSWER TOOK THE PAPERS APART ---------------------------------
       ROUND-1 REVIEW OF PR #130: the card read "a search or a topic narrows it past whole papers" over
       a list nobody had searched and that offers no topic — every one of the 368 dead ends passes
       through `What you need`. It names what was chosen now (`bundleCutBy_`): a typed search that
       breaks the papers must name the search and nothing else. (`What you need` was the other way in,
       and is not asked in Bundles since 18 Oct -- see the none case above.) The card is read
       off the DOM, because the sentence is what somebody reads. */
```

### AND ONLY WHAT WAS CHOSEN.

top level, before `dead`

```
/* AND ONLY WHAT WAS CHOSEN. The sentence bolds each question it blames, the way the chip above
       names it, so the names are read off those and compared as a list: a card that blamed every
       answer on the row — `Subject`, `Year`, `Month` and all — would still contain the right one,
       and "contains" is the test that let "a search or a topic" through over a list with neither. */
```

### ---------- 5. A BASKET SAVED BEFORE BUNDLES STILL DRAWS, AND AN UNCOUNTED PAPER IS NOT FREE

top level, before `was`

```
/* ---------- 5. A BASKET SAVED BEFORE BUNDLES STILL DRAWS, AND AN UNCOUNTED PAPER IS NOT FREE ----
     `localStorage` outlives a deploy. A print line with its own `money` from the days of the paper
     card, and a shop item, must draw exactly as they did; a paper nobody has counted the pages of
     must say `tbc` rather than `free` — the `cost: 0` fault on the one column that is a price. */
```

### ---------- 6. SEND: THE RIGHT PERSON, EVERY LINE, AND THE BASKET GOES ONLY ON A YES

top level, before `0.laminate`

```
/* ---------- 6. SEND: THE RIGHT PERSON, EVERY LINE, AND THE BASKET GOES ONLY ON A YES -----------
     One line laminated, so the message has to carry the upgrade and the total has to include it.
     The total is worked out here from the fixture's own rates and the file's own page counts —
     not by asking `cartMoney_`, which is the thing being checked. */
```

