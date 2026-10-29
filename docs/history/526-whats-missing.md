# 526 — What's missing: the papers the library should have

**Asked for as** "add a widget above Finder which tells me what stuff is missing to add. Like maybe I'm missing paper 1
2022 maths, or all of geography AQA past papers for example."

## What was made

- `js/missing.js`: an admin's card, drawn as the page directly above Find's question (`FINDERS.stuff.lead`, find.js).
  Find 2 has none, and Find still opens on its question: `finderLeadShift_` moves the page you were on when the pages
  above the question come or go (an admin signing in), and `paintStuff` keeps them (`is-lead`) while it redraws what is
  below. Back to top is the question, not the card. It is an item (`item:stuff:missing-papers`, 487): Delete and Note
  for an admin, no move or door (the `items-no-move` rule now names it), and Suggest a change in the same row (486).
- `data/settings/expected-papers.json`: the owner's list, one qualification a line, editable on GitHub; fetched when
  the card is first drawn, never in the boot payload. Absent, empty or broken: "Nothing listed to expect yet".
- The comparison is with the past-paper covers in `data/questions.json` as check/schema.js spells them. Paper 31/32 are
  filed as paper 3 and named "Paper 31", so a cover's name fills or sharpens a cell; a blank level is read off the key
  stage (AQA RS 7062's older covers have only `KS5`). The how-to is docs/library.md.
- `js/check-missing.js`: a fixture list and covers give exactly the gaps written out; no real cover is ever listed; the
  list is spelled as the library spells it, with an unknown key failing; three misspellings must be refused. Flow
  journey "What's missing (525)": an admin sees it above the question, a student and a client neither see nor fetch it.

## Left out

AQA GCSE Combined Science (8464): Biology, Chemistry and Physics papers all number 1 and 2, so a paper number cannot
say which is missing. The covers with no board (the older Edexcel GCSE Maths rows R0157–R0200) cannot be counted.
