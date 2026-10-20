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
