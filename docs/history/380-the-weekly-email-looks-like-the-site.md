# 380 — the weekly email looks like the site: a summary first, then each question as a card with their answer and the right one

The owner, 20 Oct, after a real test of the weekly email (backend/digest.gs):

> *"i really dont like how this email is laid out and i dont like how it doesnt give the answer either. it
> looks very shoddy. i thought it would look more like it does on my website. is it not possible? maybe
> because its email? also put a summary above the questions so clients can see the summary if they cant be
> bothered to see each individual question. i like how it shows if he got it right or wrong but does not
> show the answer. it should."*

Kept from 351/372/378: no branding, `Hi <first name>,`, one email per parent per child, the drawings as PNG
twins in the body, no attachments, the plain body beside the HTML, the 80-question cap, and staying under Gmail's clip.

## What the email is now, top to bottom

1. `Hi Pat,` and the lead: *"Here's what Kit worked on this week: 11 questions (12 Oct – 18 Oct, up to 9pm on Sunday)."*
2. **The week in short** (`digestSummary_`): a paper-coloured box with a gold top edge, holding:
   - one plain sentence: *"4 right first time, 2 right after another go, 1 with part marks, 2 still to get right and 2 not marked yet."*;
   - the same as figures, three to a row (so six fit a 390 px phone): the total, then each way that happened at all;
   - **Topics**: the library's own `topics` tags of the week's questions (comma-separated in the row), commonest first, six and "N more";
   - **Days**: the weekdays the child sent answers, `Mon · Tue · Thu · Sat`.
3. The questions, grouped under each paper or worksheet's name (bold, a gold rule under it), **each one a card**
   drawn like the site's question card on the paper palette: cream (`--paper`), a 3 px gold left edge, the
   tags line (`Q5a` in dark gold, `· 2 marks`), the shared stem dimmed above a dashed rule (once per paper, as
   before), the words and picture in `partPlan_`'s order, and then a darker strip (`--paper-strip`) with:
   - the verdict in words and colour — **✓ Right first time** / **✓ Right after another go** (green),
     **✗ Not yet right** (red), **2 of 3 marks** (dark gold), **Not marked yet** (grey);
   - **Their answer:** what the child last sent that week;
   - **Answer:** the right answer from the library, in bold.
4. "…and N more." past the cap, then *"Don't want these any more? Just reply and say so."*

The plain body says the same: the lead and its key, the summary sentence, `Topics:` and `Days:` lines, and
under each question `Kit: ✓`, `Their answer: …`, `Answer: …`.

## How each question went (`digestHow_`)

`digestPlan_` now keeps, per question, the **first press ever** (before the week too, and work carried over
from before the switch) and the week's **last answer** box by box (a worksheet's `#iv`, `#dv`… joined with ` ; `).
Right is `right` or full marks (`ai:3/3`, `rule:2/2`). Right now and right at the first press ever is
**first time**; right now otherwise is **after another go**; some marks is **part marks**; `wrong` or no marks is **still
to get right**; `sent` is **not marked yet**. Every question of the week counts, the unnamed ones included.

## Their answer (`digestTheirAnswer_`)

From the submission row's `answer`: tapped options (`1,4`) as the options' words joined by "and"; an
ordering (`3,4,5,2,1`) as the options in that order; cells (`a ; b`) as `label = value; …` by the row's
`cells` labels (a numbered cell just its value); a drawing (`drawing · 6 marks · #…`, `padSay_`) as *"a
drawing (it is on the site)"* — rendering the strokes server-side was not attempted; anything else as typed, cut at
400 characters on a word with "…". The child's own typing that is a link, an address or a phone number is
`(it is on the site)` — the same refusal the question's words get.

## The right answer (`digestRightAnswer_`)

In this order: the right options (`choices` and `choice_right`'s first way; an ordering joined by commas);
the cells' first written values; the mark scheme `answer` **up to its first dash** — the transcriber writes
the answer, then " — ", then the marking notes (B1 for…), so this gives "0.0197", "Angles at a point add
up to 360°", "Frequency densities 2, 3.5, 4.4, 2, 0.8" (a drawn answer's description) and never the B1/M1
jargon; measured over the library: 7,870 answers, none whose lead is over 300 characters, 693 with no dash
(taken whole, cut at 280); last, `accept`'s first form. Its own `<b>` is dropped because the card bolds the whole answer.

## Why paper and not black and gold

Both were considered. Gmail's iOS and Android apps invert a light email in dark mode and leave its images
alone; Apple Mail leaves an email with its own background as it is. A black email inverted by Gmail comes
out light grey and muddy, and the PNG twins are cream (paper palette, 351) so they would sit as cream
holes in a black card. A cream card with a gold edge reads as the site's paper in a light inbox and, inverted,
comes out as a near-black card with dark-gold edges round cream figures — close to the site itself. Every
colour is said (`digestInk_`), the page white included, so a client inverts all of it or none.

## Email-safe

Tables for the frame (`width="600"` for Outlook, `width:100%;max-width:600px` for everybody else),
`bgcolor` for every fill, inline styles only, `Menlo, Consolas, monospace` (the site is monospace). Two
things the screenshots caught at 390 px: an `<img max-width:100%>` inside an auto-width table pushes the
table wider, so a picture is now `width:100%;max-width:<its width>px` (fluid, never past its own size); and
a question's own four-column table (Lena and Pavel's hours) set at 14 px monospace was 369 px wide, so the
library's tables are 12 px.

**Under the clip.** A card's frame is about 0.6 KB, said up to 80 times. The frame was trimmed (fill by
`bgcolor`, font and ink inherited from the email's cell), and the words a submission carried (a question not
in the library) can now be said as "on the site" by the clip, as a library row's could. The check's
"80 parts under long sources" case is 200 characters a part instead of 600: at 600, 80 frames and 80
different papers do not fit under 95,000 bytes without cutting a part's words.

## Rendered

A fictional week (Kit and Pat, eleven real library questions of every kind) through `check/digest-dry.js`,
opened in Chromium at 390 and 800 wide: light, a dark page round it (Apple Mail), and inverted with the
images left alone (Gmail's apps). No horizontal scroll at 390.

## Checks

check-digest: section 2b/2d/10/13's markup expectations read what the HTML says (`said`: tags gone) rather
than its old `<p><b>` shape; the summary is above the questions with the right sentence, figures and days (2d,
10); each of the four in Pat's email has "Their answer" and, from the library, "Answer" (10); section 15 asks
both functions for every kind — typed, mark-scheme lead, accept only, choices, order, cells, drawing, a long
essay — and that a typed link or address is not printed, and `digestHow_` the five ways. The no-branding,
no-@, no-surname, no-link checks are unchanged and pass. Mutations: the "Their answer:" label renamed, and
the summary emptied, each turned check-digest red.

Deploy: backend changed — all four stamps `2026-10-20-c-email`.

## Right or not, and always the topics (20 Oct, later)

The owner, after the real email for a child who did 32 Corbettmaths primary questions (Perimeter,
Rounding, Square Numbers): *"it doesnt seem to have a summary at the top. like at least the topics he
worked on in this case. also it doesnt need to say how many turns it took for him to get it right just
whether he got it right or not"*.

The summary was there, but small-headed ("THE WEEK IN SHORT" at 11 px) and with no Topics line: every
Corbettmaths worksheet row has an empty `topics` (1,576 of them; 5-a-day 1,794), and the line came only
from `topics`. Gmail also threaded the email under an earlier test with the same subject, so it was easy to miss.

- **Verdicts:** Right, Not right, part marks (x of y), Not marked yet — in the figures and on every card.
  "Right first time" / "right after another go" are one "✓ Right"; `digestHow_` takes the week's last
  verdict only, and the first-press plumbing (`firstAt`, `first`) is gone. The plain body's key says "✗ not right".
- **Topics (`digestTopicOf_`):** the library's `topics`; else the topic worksheet's own name (a
  Worksheet/Exercise row's `name`, or with no library row the label's segment before "Q3"; a content card's
  title); never a paper's name — `DIGEST_NOT_TOPIC` refuses "Paper", mock, specimen, 5-a-day, a year, a month
  and a board, and a Past paper / Specimen paper / 5-a-day row is never named — so an untagged paper is its
  subject ("Maths"), shown only when nothing in the week has a topic of its own. Measured on the library:
  no Worksheet/Exercise name is refused and every paper name is. A week nothing names says "Topics: not recorded."
  An earlier draft took the label's middle segment for everything and printed "Topics: Paper 7".
- **The box:** "Summary of the week" at 19 px bold, the sentence, then Topics in 15 px before the figures.

A Corbettmaths week now reads: *Summary of the week — 5 right and 2 not right. Topics: Perimeter,
Rounding and Square Numbers.* check-digest asks it from labels alone and from untagged library rows,
asks that three untagged papers (Paper X, a June 2024 paper, a 5-a-day) give "Topics: Maths" and no
paper/month/year, a mixed week, and a week with nothing named. Mutations (no worksheet fallback, no
paper filter, no "not recorded", marks-right not right) each turned it red. Stamps `2026-10-20-e-email-simple`.

## Each question as the child sees it, with all the tags (20 Oct, later still)

The owner: *"make the questions look like they do when the child is answering them. with the tags. honestly
it would be best if it looked most like how it looks when kids answer with all the tags."*

Looked at first: the real app at 390 wide, Find opened on Edexcel GCSE June 2024 Paper 1F Q7 and Corbettmaths
Perimeter Q1. The card is `.qcard` (#0b0b0b, 1px #232323, 3px corners) inside `.pane` (#101010, a faint rim,
14px corners) on the black page; the row is `tagRow_` — outline pills, 9px radius, each its facet's colour
(`TAG_OF` → `--tag-*`); the words at ~15px in `--ink`; a drawing white on black; the answer box a cream pill
ringed green when right, gold when not; the Answers page an `ANSWER` label (faint, spaced capitals) over the result in bold.

- **The paper palette is gone; the email is the black screen.** `digestInk_` is the site's `:root`: page #000,
  pane #101010, card #0b0b0b, ink #e6e6e6, gold, `--good` green for right, `--bad` red for not right, gold for
  part marks. Every fill is said (`bgcolor`) so Gmail's apps have nothing half-dark to guess at; inverted they
  come out as a light copy of the site, still readable (email-390-v3-invert.png). The PNG twins stay cream
  (351): the one visible difference from the site, where a drawing is white lines on black.
- **The card:** one table whose 10px #101010 border is the pane round the #0b0b0b card (one box where the site
  has two — the clip, below), then the tag row, the stem and words and picture as before (`partPlan_`'s order),
  then the verdict in words and colour, **THEIR ANSWER** in the site's cream answer box ringed in the verdict's
  colour, and **ANSWER** in bold as the Answers page sets it. No heading over a paper: the site has none, and the
  tags say the paper. The summary is a `.pane` with a gold title. The library's tables are 11px with dark rules
  so Q7's four-day table fits a 390 phone inside the card.

**The tags are the card's.** `tagRow_` lives in js/find.js and leans on the whole booted app, so the backend has a
port of what it does for a question row: `digestCardTags_(row, T)` over `digestTagIndex_(libraryText, paperIds)` —
one pass over data/questions.json collecting every document row, the first live question of each paper (which
papers share a folder, for `paperTag_`'s `Paper 1`), and all rows of the week's papers (the part split, what to
bring, the health score — `paperHealth_` ported whole). `DIGEST_TAG_FACETS` is `facetList()`'s order for a
question with each facet's colour kind; the dedupe is `tagRow_`'s (a name once, the first facet wins, an id
once, a bare number never a name). Left off on purpose: the page tags `[1] [of 2]` — they count the site's
reading pages, and the email draws the part whole. `digestLibraryFind_` hands each row's tags to the render;
a question the library has not got wears what its label says (subject, sheet, number).

**Held to the app:** check-funnel boots the real app over the real library and asks, for **every** question
(8,006), that `digestCardTags_` says what `tagRow_` draws, word for word and kind for kind (page tags aside).
0 differ. Mutation: Ready at 99 instead of 98 → 499 differ.

**Under the clip.** A pill inline is ~85 bytes and a GCSE card wears 15, so the clip has a new move, made after a
long source and before any question's own words (`DIGEST_CUT_FIRST`): a card may wear only the tags the card
above it did not (`[Q8] [ii] [1 mark]`). The fixture weeks are 34 KB (11 mixed questions) and 17 KB (7
Corbettmaths); check-digest's 80-part weeks stay under 95,000 bytes with every question's words.

Rendered: email-390-v3.png / -invert.png (the fixture week), email-390-v3-cbm(-invert).png, site-card-390.png
and site-card-390-cbm.png from the real app, and compare-390-q7.png / compare-390-cbm.png side by side.

Checks: check-digest reads the new card (tags, then words, verdict, THEIR ANSWER, ANSWER) and gains 11b — two
real questions' tags from the real library, Q7 a red pill, the sitting purple, marks the plain outline, two
#0b0b0b cards, no paper heading, the page #000 and the answer box ringed green; mutations (tags off the card,
the white page back) turned it red. Stamps `2026-10-20-f-email-cards`.

## Dark everywhere, pictures included (20 Oct, `2026-10-20-i-email-dark`)

The owner: "the email is not dark theme. i want it dark mode like it is on my website. regardless. with black
background and white diagram lines".

- **The pictures are the site's now.** `tools/diagram_png.js` draws every twin on the card's #0b0b0b with the
  screen's ink, so `currentColor` lines are light, as the site draws a figure; opaque RGB, no alpha, so no client
  shows a box. Same names (the SHA-256 rule), files replaced, not doubled — only the email uses them.
  `--palette=paper` draws the cream ones back.
- **The email is a whole document** (`digestDarkDoc_`): `<meta name="color-scheme" content="dark">` and
  `supported-color-schemes`, `:root{color-scheme:dark}`, `bgcolor="#000"` on body and every frame table and cell,
  classes `kb`/`kp`/`kc` (page, pane, card) held by Outlook's `[data-ogsb]` / `[data-ogsc]` rules.
  check/digest-dry.js writes the document as-is (viewport added).
- **Tried and dropped: Gmail's app gradient.** `u + .body .x{background-image:linear-gradient(#000,#000)}` keeps
  the black under Gmail iOS's inversion but not the words, which it still turns dark: dark on black. The
  `mix-blend-mode` screen/difference wrapper that fixes the words also re-inverts the pictures and pills when
  it wraps a whole card. In an emulation (colours and fills flipped, images kept) both were worse than none.
- **What is left to the client:** Apple Mail, iOS Mail, Gmail web, Outlook web/new Outlook show it as sent.
  Gmail's iOS/Android apps in dark mode may still invert a dark email into a light copy (readable; the
  pictures stay black boxes, email-390-v4-invert.png); classic Outlook on Windows ignores the head styles but
  keeps every `bgcolor`. Gmail's image proxy may hold a cream twin for a while, the URL being unchanged.

Rendered: email-390-v4.png, email-390-v4-invert.png, email-390-v4-cbm(-invert).png. check-digest 11b now asks for
the doctype, both metas, the body and frame `bgcolor="#000"`, the `[data-ogsb]` rule and no gradient or blend.
