# 491 — The owner's notes, round two: the shop, the settings and Business columns, and the tools widgets

27 Oct 2026. Nine Ledger notes (`claude_notes`), worked in one branch. Backend `2026-10-27-zc-n2c`, css `2026-10-27-zc-n2c`.

## Shop — "add an emoji or svg for each item in the shop ... and I want to add a search bar widget to this column"
- Every item wears an original line drawing (`SHOP_ICONS`, collections.js) in the tiles' 18x17 frame and weight: the first word of
  its name that names a thing (pencil, ruler, calculator, sticker, 3D print, wheel, toner, bike, book, papers, game, kit, bag), else
  its group's (`SHOP_ICON_OF_GROUP`). Put in front of `stuffCard`'s body (`shopWithIcon_`), so find.js keeps the one drawing of a thing.
- A search card after the basket: the shared `searchPill_` (487). Typing lists what matches (name, words, group) under it, one line
  each with its icon; a tap goes to that item's page. The column is not redrawn under the typing, so the pages never reflow.

## Google Tasks — "this should be in the docket tasks widget, not here"
- The Connect / Sync now / Disconnect block is drawn by `paintDocket` into `#docket-gtasks`, under the Docket's list. The
  `acct:gtasks` card is gone from Student settings and from `CARD_REG`. One home.

## Where you teach — "this doesn't need the map ... this column is just configuration"
- No venue map on Tutor settings; the ticks and the travel distance only, the fold's line counting the venues. The map stays on the profile.

## Three words — "re-evaluate all the widgets in this column and the column to the right ... does it need a title at the top? I don't think so"
- Tutor settings' own-card sections whose first line already names them carry no `<h3>` (`OWN_SEC_UNTITLED_`, me.js): Headline,
  Photographs, Three words, At a glance, Qualifications, Where you teach (and Figure and Handle on Student settings). The card keeps
  its name as `aria-label` for a screen reader. Rate and class size and Available keep their titles: their first lines are numbers and a grid.
- Tutor profiles: the cards are the profile itself (the nice display); left as they are.

## Business — "add a widget ... the exemplar for how an email looks that gets sent to parents ... also could this column be split into 2 columns"
- **Split.** `biz` (Business) keeps the money and the paperwork: Profit, Applications to teach, Staff, and the five record cards
  (Insurance, Tax, Legal and data, Safeguarding, Money and company). The new admin-only `site` (Site), last in `TAB_ORDER` and
  `data/settings/columns.json`, has Setup, Posts waiting, Reports, Library import, the weekly email, and Build. Cards may move
  between the two (`ADMIN_COLS_`, layout.js) and nothing else may move onto either.
- **The weekly email.** Two Site cards: *Weekly email* is `digestRender_`'s frame drawn with a made-up child (Sam, parent Alex, two
  questions) in the email's own colours; *Weekly email's words* edits its four lines — Subject, Greeting, First line, Last line — and
  the look follows each keystroke. They are config rows `digest_subject`, `digest_greeting`, `digest_intro`, `digest_footer`
  (`DIGEST_WORDS`, constants.gs; blank is the old wording, so a sheet without them sends exactly what it sent), written by the new
  admin action `digestWordsSave`. `{child}`, `{parent}`, `{count}` and `{span}` are filled in by `digestFill_`; a parent with no
  printable name still gets "Hi,".

## Calculator — "when I click FORMAT it does nothing. this calculator needs to be as stable and accurate as a real-life Casio"
- FORMAT was S⇔D, which does nothing to a whole number or a decimal. It is now the fx-991CW's list for the answer on the glass:
  Standard, Decimal, Fraction, Mixed fraction, Prime factor, Engineering, Sexagesimal — only those that apply. FORMAT again or ▼▲ to
  move, OK/EXE or the item's digit to choose, AC to leave; a new sum is Standard again.
- Audit against the ClassWiz, each now a case in `js/check-calc.js` (103 cases): Standard shows a surd or π when the answer is one
  (√2, 3√2, 2√2 for √8, √2/2 for 1÷√2, π, 2π, π/3) and a float within rounding of a small fraction as that fraction; an implied
  multiplication binds tighter than × and ÷ (1÷2π is 1/(2π), 6÷2(1+2) is 1); a fraction too long for the glass falls to a decimal.
  Still not here: SHIFT ■/□ types an ordinary fraction (no mixed-number template), angles are degrees only, and a sum of a rational
  and a surd (1+√2) shows as a decimal. `check/calc-steady.js` green.

## Whiteboard — "remove the buttons for square root and everything. kind of not needed"
- The Fraction, Power, Root and Integral tiles are gone; the bar is Picture and Clear. A board that already holds a shape still draws
  it and is still written into (`nbShape_` kept; check/whiteboard.js puts one down directly).

## Term dates — "it isn't including holidays ... some schools finish a week early or later ... is it referring to the last Sunday of the interval or the actual hard end?"
- The widget draws the year as intervals: the current one ("Now:") and the next three, terms *and* half-terms *and* holidays. A term
  says its first day and "last day of term" (a Friday); a break says "from" (its Saturday) and the "first day back" (a Monday). The
  dates are the backend's `schoolYear` rules in the browser (`tdYear_`), weekday-exact, not the booking's operating window.
- A note says schools vary by a few days, and *My school starts / ends* move every term by up to five school days either way, kept on
  this phone per person (`familyTermShift:<personId>`); the holiday beside a moved day moves with it.

## E-ink — "wouldn't the picture look better if the name wasn't involved, or was small and vertical to the side?"
- Icon mode: the picture fills the panel's height, its 120x160 drawn at 5/4 (150x200, nearest pixel — the 1-bit PNG is the only
  source, so a bigger bitmap would be the same pixels), and the title small, italic, vertical in the right margin reading bottom to
  top. A *Title* tile turns it off (`SHOW BARE n`), the picture then centred. Same numbers in `einkPage_` and verse.cpp's
  `drawPicture(k, titled)` (check-eink holds both). Rebuilt: `READY epaper-verse 491`, sha256 and MD5 in the README.
