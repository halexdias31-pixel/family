## The Sunday email goes at 9pm and shows each question as it is on the site: whole words, the shared stem once, the picture as a PNG twin in the body, then the child's mark

**The owner, 18 Oct** (07:34 UTC), the morning of the first Sunday it goes for real:

> *"Ok I want everything set up for parents to receive emails for what their kid has done this week. On
> Sunday @9pm. I will update [a parent]'s email address in ledger. So I hope she will see everything her
> boys have done this week. So each question As is on site."*

(The parent's name is left out here: this repository is public.)

An interrupted first version of the same message ended *"As is on site. No jpgs."* — so the pictures go in
the body of the email, never as attachments. Three things, a section each: the hour, the questions, the
pictures. Note 348 is the email itself — who gets it, the marks, the setup check, the dry run — and none of
that changed.

### 1. Sunday at 9pm

`weekly_digest_hour` is **21** in `CONFIG_DEFAULTS` (its note says *blank = 21 (9pm)*) and in `digestHour_`'s
fallback, where both were 18. Everything else already followed the number and was checked to: the run-up
pass is booked at **20:00** and works through to a quarter of an hour before, the email's own last pass
marks what came after it, the email says *"up to 9:02pm on Sunday"* (the run's own minute, note 348), and
the week is still Monday to Sunday — an answer sent at 21:30 is in nobody's email, which is the trade any
hour makes.

**A cell changed after booking moves nothing** — Apps Script cannot read the hour a trigger fires at. Since
13 Oct `installWeeklyDigest` has written the hour it booked to Script Properties (`DIGEST_BOOKED_HOUR`). Now
`checkSundayEmail` gives it a line of its own, **THE HOUR BOOKED**, and warns in words when the config cell
says something else:

```
THE HOUR BOOKED: installWeeklyDigest booked the email for about 18:00 on Sundays, London time (recorded in
Script Properties as DIGEST_BOOKED_HOUR). WARNING: weekly_digest_hour on the config tab now says 21, but the
email still goes at about 18:00 — run installWeeklyDigest again to move it to 21:00.
```

And triggers booked by a backend from before the record (no hour written down) are said to be **NOT
recorded**, with the same instruction — before, the hour fell back to the cell's and the check said "about
21:00" over a trigger still firing at 18:00. **So today: deploy, set the cell to 21, run
`installWeeklyDigest`, then `checkSundayEmail`.**

### 2. Each question as it is on the site

It printed a cut-down line per question from the submission's own `words` cell (400 characters of the ask,
300 of the stem, then "…"), written by the phone, with "(picture on the site)" for a picture. Now a question
the library has is printed **from its row**, the way the question card draws it (js/find.js):

- the **paper heading** (the label the phone sent, as before);
- every **preamble** the part sits under, outermost first — paper, section, question, letter (`preamble_`)
  — printed **once in the paper** however many of its parts the child did (`questionStemCard_`), dimmed as
  the site dims a stem, a stand-in source in a dashed box, its picture after its words unless the row marks
  where it stands;
- each **part**: its number and its marks (`Q5a · 2 marks`, the card's tags), then its lead, its picture and
  its words in `partPlan_`'s order — at a `<!--fig-->` marker; after a lead; else in front of the words —
  **all of its words, never cut, never "…"**;
- then the **child's mark**: `Kit: ✓`, `Kit: ✗`, `Kit: 2 of 3 marks`, `Kit: not marked`, coloured as before.
  The lead says *"How each one went: …"* when the list has one of these (the mark is under the words now,
  not beside the number).

**Where the rows come from — the marking pass's own fetch.** `digestEmailLibrary_` takes every library key
with a press in the week and asks `digestLibrary_` / `digestLibraryFind_` (note 348: the site's
`data/questions.json`, one row a line, each row found by its `"row_id"` and parsed alone). Once per run, in
`digestRun_`, and the same in the admin's Preview and in `check/digest-dry.js`. **A fetch that fails stops
nothing**: the run's result says so, `weeklyDigestRun` logs it, and every question goes as its words cell.

**The markup goes through a strict allow-list** (`digestHtml_`): p, br, b, strong, i, em, sup, sub, ul, ol,
li, table, thead, tbody, tr, th, td, span, div — and **no attribute but colspan and rowspan**, so no class,
link, handler or style of the row's own reaches an inbox. What an email needs is a style written there,
inline: a table's rules, a paragraph's gap. The rest of the library's vocabulary is translated, not dropped
— a heading is a bold paragraph, a quotation an indented block, underline and strike-through a span saying
so, the site's stacked fraction (`span.frac`, 149 rows) `<sup>3</sup>/<sub>4</sub>` (it was "34" with the
classes gone), a recurring decimal's dot (`aria-hidden` &bull;) a combining dot over its digit, an overline
kept. `<script>`, `<style>`, `<svg>` and `<math>` go with their contents; every tag left open is closed;
"x < 7" stays maths. The plain body is the same in text (`digestText_`): `5/x`, `x^2`, a table's cells
apart with `|`.

**A key the library has not got** — a practical's worksheet box, a question it dropped or retired — goes as
its words line, exactly as before ("Q4 ✓: Work out 12 × 3."). So does a row whose words hold what
`DIGEST_WORDS_REFUSE` turns away (a link, an address, an account-shaped number) — measured: **none** of the
8,006 live questions or 1,126 preambles. The first run caught one of my own: the lead and the words run
together read "…of the source.Read again…", and "source.Read" is a domain to that rule; each piece is asked
on its own now, as the card draws each in its own block.

**Under Gmail's clip, every question kept.** Whole words for a week of whole papers can pass the ~102 KB of
HTML past which Gmail hides the rest — the footer that says how to stop with it. `digestRender_` renders,
and while the HTML is over `DIGEST_CLIP_BYTES` (95,000, a few KB short for what MailApp wraps round it) says
the longest **shared source texts** as *"(the source text is on the site)"*, then, only if that is not
enough, the longest parts' words as *"(the question's words are on the site)"* — a few at a time by what
they weigh, so it is a render or two. Every question keeps its number, its picture and its mark. Measured
on the 80 longest questions in the library: 94.3 KB, all 80 listed, 35 sources and 27 parts said as on the
site, 112 ms to render in Node.

### 3. The pictures, as on the site — a PNG twin of every drawing

A question's picture is an inline SVG in the library's `diagram` cell (1,507 cells, **1,362 distinct
drawings**), inked in `currentColor` by the site's CSS. **Gmail and Yahoo Mail show no SVG at all.** So
`tools/diagram_png.js` draws each one once — Playwright, Chromium, the site's own style.css, the drawing in
the card's own wrapper (`.qcard.qfig > .qsheet > figure`, so `.lbl`, `.num`, `.axis`, `.grid` decide) — on the
**paper palette**: `--paper-ink` on `--paper`, warm ink on cream, as everything standing in for paper is.
(There is no question print sheet any more to copy — style.css, "THE PAPER PAGE WAS HERE"; the paper tokens
are what a printed figure would be.) At the drawing's own width, at **2x**, to

```
data/diagrams/<first 12 hex digits of the SHA-256 of the drawing's text>.png
```

so a changed drawing is a new file and an email already in an inbox keeps its picture. **1,362 PNGs, 24.0
MB** — under the 30 MB past which this would have been drawn at 1x. 37 seconds for all of them.

The email shows `<img src="<site_url>data/diagrams/<hash>.png" width="<the drawing's width>"
alt="<its aria-label>" style="max-width:100%;height:auto">` in the body (`digestDiagram_`, which works the
same name out with `Utilities.computeDigest` over the same text); the plain body says `[Picture: <the
alt>]`. A link, never an attachment, so it weighs nothing against the clip. One cell holds two drawings
(Figures 4 and 5 of one AQA chemistry question): one twin, both drawn, both descriptions in the alt.

**What `figure` is** — the question asked first. Not a picture: **the transcriber's label for what kind of
picture** a part has — 104 values on 1,260 rows (`diagram` 391, `graph` 200, `grid-blank` 45, `triangle`
44, `coordinate-grid` 36…), 606 of them on rows with no drawing at all. `library.js` says it in as many
words (*"`figure` says which kind of picture; `diagram` is the picture"*), and the one thing that acts on it
is `padSurface_` (js/find.js): for a question answered with the pen, a label naming a coordinate grid
gives axes, one naming a grid gives squared paper, anything else a blank space to draw in. It is the
surface for the ANSWER, drawn by the app's JS, so it is not part of the question's picture and the email
does not draw it.

**`js/check-diagram-png.js`** (in check-all, a third of a second, no browser): every drawing has its twin,
a real PNG as wide as the drawing at 1x or 2x; no file in the folder is a twin of no drawing (the tool
removes those); and the backend's own `digestDiagram_`, run over all 1,362, names each one exactly as the
tool does — src, width and alt. **Four mutations, each red, the real files green after:** a twin deleted; an
orphan added; the backend naming with 11 hex digits (all 1,362 red); a twin of the wrong drawing's width.

### Checked

`js/check-digest.js`, 150 → **165** rules. The hour: 21 the default, the config row and its note, the
recorded hour after `installWeeklyDigest`, the run-up at 20:00; the run-up burst moved onto the 9pm
timeline (19:50 to 20:43) and the email's own run saying "up to 9:02pm"; `checkSundayEmail`'s THE HOUR
BOOKED line, its WARNING with the cell moved from 18 to 21, no warning once booked again, and NOT recorded
for an old booking. As on the site, through the real send with the library stubbed: the stem and the ask
past the old cuts printed whole with no "…" and nothing of the words cell; the shared stem once with its
picture, `Q3a · 2 marks`, its words and `Kit: ✓`, Q3b's picture at its marker after its lead; each picture's
`<img>` by hash with width and alt, no SVG, nothing attached; the allow-list against a row carrying class,
style, onclick, scope, target, an `<a href>`, an `<img onerror>` and a `<script>`; Q4 not in the library and a
practical's box as their words lines; no address in the email but its pictures'; a real question
(Q-9MA031-2206-5c) found by the run's line scan in data/questions.json with its words, alt text and an
`<img>` of a PNG that is in data/diagrams/; and 80 whole papers under the clip both ways. Rules already there
moved with it: the fallback 18 → 21, the run-up 17:00 → 20:00, the setup check's hours, and Pat's email and
the dry run's in the new shape. The check's own worlds keep the run's log lines rather than printing them.

**Twelve mutations, each red for its own reason, the real files green after:** the words cut in the HTML;
the picture named with 10 hex digits; no alt text in the plain body; the fallback dropping its words (16
red, old rules with it); the default back at 18; the run-up two hours early; no warning when the cell
moved; no booked-hour line; the row's attributes kept; no clip; the stem printed for every part; the config
row back at 18.

Also green: check, check-const, check-backend, check-prefs, check-aimark, check-manifest, check-payload,
check-tabs, check-columns (red once on my own `x.bytes` — check-columns reads `x.` as a sheet row; renamed),
check-rows, check-post, check-mail-load, check-library. `check/digest-dry.js` now plans with the library as
the run does; on an invented week over real library keys (a paper with a shared stem and three pictures,
the Venn, a table, a stacked fraction, an English source text, a key not in the library, a practical box)
its email was opened in Chromium at 390 px and 1200 px: the pictures load from data/diagrams/ at 340 px, no
sideways scroll, the marks read under each part.

The four version stamps move together to `2026-10-18-w-asonsite`.

### For the owner to do — before 9pm today

1. **Deploy the backend** (CLAUDE.md's route 1, the GitHub Assistant extension: `main`, ↓), then **Deploy →
   Manage deployments → New version**. And the site (`git push` — GitHub Pages) **before 9pm**, because the
   pictures are served from `data/diagrams/` there.
2. On the config tab set **`weekly_digest_hour`** to **21** (and `weekly_digest` is `send`).
3. Run **`installWeeklyDigest`** — it books the email for about 21:00 and the run-up for about 20:00, and
   records the hour.
4. Run **`checkSundayEmail`**: *THE HOUR BOOKED … 21:00 … The config tab says the same.* No WARNING.
5. The parent's address goes on the people tab (the owner is adding it): the setup check's NOT REACHED
   lines say whose is still missing.

## The twins go dark (20 Oct, 380)

Every twin is redrawn in the screen's look — light lines on the card's #0b0b0b, opaque — by default
(`node tools/diagram_png.js --force`); `--palette=paper` for the old cream. The name rule and the folder are unchanged,
so check-diagram-png and `digestDiagram_` still agree. 1,362 twins, 23.1 MB.
