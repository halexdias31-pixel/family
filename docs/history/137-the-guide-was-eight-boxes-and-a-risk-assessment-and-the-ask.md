## The guide was eight boxes and a risk assessment, and the ask was five things

**Asked for as "Should be name diagram, ingredients with their quantity, steps. And then worksheet
bit which records iv DV cv. Just that for now for each."** Measured across all 77 live practicals,
opened through the app's own sheet at 320px:

| | before | after |
|---|---|---|
| answer boxes | **8** | **3** |
| headings | 11 or 12 | **5** |
| the median guide | **2,402px** | **954px** |
| the shortest / the tallest | 1,867 / 2,944 | 715 / **1,298** |
| what `#sheet-body` shows at once | 697px | 697px |

**So a median guide was three and a half screens of scrolling and is one and a half.** `risk`,
`pred`, `res`, `conc` and `eval` went; `iv`, `dv` and `cv` stayed.

**THE NAME IS THE SHEET'S OWN TITLE AND ALWAYS WAS.** `openSheet(x.name, …)` draws it above this
markup with the close control beside it, so the first of the five asked for needed nothing — and a
heading inside the guide would have been the practical's name twice on one screen, which is the
fault this file records where the roster's `name` printed an `<h3>` over every widget's own heading.

**`prac-tab` STAYS, INSIDE THE WORKSHEET, AND THAT IS THE ONE JUDGEMENT IN THE CUT.** The two lists
of candidates — things you could change, things you could measure — are not a sixth thing; they are
the scaffolding for the three questions under them. The round before this one filled `variables` and
`log` on all 77 rows *precisely because* a box asking a student to name an independent variable with
nothing on the card suggesting one is a worksheet with the scaffolding removed, and that entry is a
few headings up. Removing them to get to five would have undone it.

### What it costs, and the risk assessment is the half worth reading twice

**The risk assessment is gone from the guide**: its written hazards, the safety line, the
public-liability and parental-agreement line drawn from `venue === 'home'`, and the box asking what
else you can see in THIS room. That was an explicit earlier ask, and it is safety content for
experiments run in a client's front room with a child.

**What is NOT gone**: `risks` is still a column, `check-practicals.js` still FAILS a live row that
has no risk assessment, the card still prints the hazard level — `prac-haz`, in `--warn` at medium
and red at high — and the 250 written hazards across all 77 live practicals are still in
`data/practicals.json`. It is one `<section>` to put back.

**And nothing typed is thrown away.** `guideBox_` keys on `ansKey_(x) + '#' + slot`, so every answer
anybody has written into the five removed boxes is still in `localStorage` under its own key and
comes back filled the day the box does.

**`science`, `risks`, `safety`, `maths_link` and `notes` are now columns nothing draws.** That is
this repository's oldest shape — `figure`, `orderPrints`, `exam_date`, `wow`, the eleven dead
Settings writers — and **it is deliberate here rather than accidental, which is the whole
difference**. `check-practicals.js` says so where it counts them: *77 hold a "What is going on" the
guide does not draw at present*. A count that reads as a backlog for work nobody intends is the
mirror of a silence, and this file already records paying for that on twelve SATs rows.

**AND THEY ARE ALL STILL IN THE SEARCH BOX, which is the odd state this leaves and is worth knowing
before somebody reports it as a bug.** `practicalText_` builds its haystack from `science`, `safety`,
`risks`, `notes` and `mathsLink` along with everything else, and that is untouched — so typing a
word finds the practical it is in and then shows you a guide that does not contain it. Measured
over the 77 live rows — every word of five letters or more in `science`, `risks`, `safety`, `notes`
and `maths_link` that appears in none of the columns the card or the guide still draws — **994 of
them are searchable and drawn nowhere in the app.** (A first pass said 995; the method is written
out here so the number can be taken again rather than believed.) Nothing
is broken by it — the search returns the right practical and the practical is readable — but the
REASON it matched is invisible, and that is the strongest argument on the table for `science` coming
back first if any of this does.

### Five stylesheet rules went and every argument in them stayed

`.prac-why`, `.prac-safety`, `.prac-maths`, `.prac-home` and `.gd-none`, each replaced by a prose
note where the rule was — the house move, and it is worth more than usual here because three of
those notes hold findings that outlive the rule: that `--dim` in the guide means a fact from the
database and `--faint` means the guide talking (which `.quiz-why` cites, so its cross-reference had
to move with it); that `.gd-sec p` is (0,1,1) against `.prac-safety`'s (0,1,0) and would have
flattened a gold-ruled warning into body text; and that the guide's maths line and tutor notes once
drew at the browser's default 16px, found on a screenshot.

### A section head and its own column labels were byte-identical, and only a screenshot could say so

**`.prac-tab h4` and `.gd-sec h4` set the same font, size, weight, tracking, case and ink.** That was
invisible while six sections carried that style and the candidate table sat side by side at 30rem.
With the guide cut to three sections it is the only nesting left, and at 320px the table stacks — so
`WORKSHEET`, `THINGS YOU COULD CHANGE` and `THINGS YOU COULD MEASURE` came out as three identical
lines, and the section head read as a section with nothing in it. **Sixteenth time this file writes
that a screenshot is the last word on something drawn**: nothing overflows, nothing is clipped, both
rules are correct.

**WEIGHT RATHER THAN SIZE, because at this size there is nothing else to spend.** `.68rem` is 9.2px
on a 320px phone and `.62rem` is 8.4 — under a pixel, which nobody reads as a rank. 400 against 600
is a stroke a reader can see at any size.

**AND IT HAD TO OUT-SPECIFY RATHER THAN OUT-SIT.** Both rules match those two `<h4>`s and both are
(0,1,1), so while they said the same thing it did not matter which came later; the moment they
differ, file order alone decides. `.gd-sec .prac-tab h4` is (0,2,1). **Eleventh conviction of
`.price.faint`**, refused before a screenshot rather than after one.

### The first draft of this said eleven boxes, and it was eight

**Written from memory of the ELEVEN HEADINGS the old guide drew.** Counted instead —
`guideBox_(x, '…')` appears eight times in the committed function and three in this one — the
sentence is right. That is the fault this file opens its checking section with, "all 18 checks
pass", in the one place it is hardest to catch: prose about a change, written by whoever made it,
in the same commit.

**So `check/states.js` asserts `=== 3` rather than `>= 3`.** The loose test passes on a guide that
has quietly grown a fourth question nobody decided on, and this state is the only thing in the lab
that renders one at all.

**AND THE SAME FAULT WAS ALREADY IN THIS FILE TWICE, IN THE ONE TALLY IT KEEPS BY HAND.** Counting
the "screenshot is the last word" line before adding another: the AQA reaction profiles said
*Twelfth* under an entry that had already claimed it, and the receipt's five stage ticks said
*Fourteenth* under one that had. Both are now the ordinal they are, and this one is the sixteenth.
A tally nobody re-reads is exactly what this file warns about, and it had been wrong in its own
warning.

### And the control variable was missing from the file for an hour, which is what the mutation cost

**Proving `check/states.js`'s `=== 3` was worth writing meant deleting a box and watching it fire.**
It fired, at all four widths, naming the state. **The restore did not take** — a later edit to the
surrounding comment block went in over the unrestored version — so `practicalGuide_` sat at **two**
boxes, `iv` and `dv`, with `cv` gone. Caught by reading the diff before committing, one line after
the hunk that removed it.

**THE THIRD OF THE THREE THINGS THE OWNER NAMED BY NAME**, in a commit whose whole subject is doing
what they asked. Nothing in the app would have looked broken: two boxes under a Worksheet heading is
a guide, and it measures, presses and lays out perfectly.

**The suite would have caught it and I did not run one in between**, which is the actual lesson
rather than the near miss: `check/ui.js` renders that state and `expect` counts the boxes, so the
mutation that proved the assertion is the same assertion that refuses the botched restore. A
mutation is not finished when it fires — it is finished when the check is green again, and the only
thing that says so is a run.
