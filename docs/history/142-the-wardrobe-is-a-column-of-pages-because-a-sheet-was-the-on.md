## The wardrobe is a column of pages, because a sheet was the only shape it could not be

**Asked for as *"editing clothing for avatar character shouldnt be a new menu pop up i dont like
menu pop ups."*** Three alternatives, and two of them are ruled out by arithmetic rather than
preference — measured with the app's own `wardrobe()`, `avatarConfig()` and `itemArt()`, laid into a
real pane:

| as one card | |
|---|---|
| 320x568 | **1517.1px in a 534.25px pane — 1010px hidden** |
| 390x844 | 1365.8px in 806.95 — 588px hidden |

**AN INLINE CARD ON YOUR OWN ACCOUNT PAGE AND A WIDGET ON TOOLS ARE THE SAME NUMBERS**, because a
widget is one `.card.is-widget` in the same capped pane. That is the `OUT OF REACH` fault this lab
has a rule for, and the same sum that sent the practical guide and the quiz into a sheet in the
first place. **A new tab is refused outright by `check-surfaces.js`**, which would fail the build.

**SO IT IS PAGED, AND THE CHEAPEST COLUMN IS THE ONE THAT ALREADY EXISTS.** `settingsPages_` returns
an array and `PAGER.settings` counts that same array — so this touches **none** of the five places a
new screen id needs: no `TABS`, no `TAB_ORDER`, no `PAGER`, no `PAGE`, no `<section>`, and no row in
`columns.json`.

**ONE SLOT PER PAGE, WHICH IS `settingsPages_`'s OWN RULE AND ALSO THE MEASUREMENT.** Split in two,
Things is 948.1px; in three, all three are over; in four there are 34.1px spare and the "Saving…"
line takes it 18px over the moment it appears. One slot per page measures **454.9 / 265.2 / 204px**
at 320x568 in a 480px pane, `over: 0` at all four widths and on all thirteen pages.

**APPENDED, NOT PREPENDED.** `PAGE.settings` remembers where somebody was, so inserting at the front
moves every existing index and a returning visitor lands on a different page. The tile jumps
straight there, found by asking the DOM for the page holding `av-colour` rather than a remembered
index — `settingsPages_`'s length varies with what the backend sends, so a literal would drift.

### The figure was an id on seven pages, which is the fault this file records in full

**`id="av-figure"` ON EVERY WARDROBE PAGE IS SEVEN ELEMENTS WITH ONE ID**, and `$()` hands
`avatarSave` the first — so picking a hairstyle on page eight redrew the figure on page seven and the
one under your thumb did not move. The `$('msg-text')` fault, on the surface whose whole point is
that you SEE the change. A class, and all of them.

**`#av-said` WENT WITH THE SHEET AND WAS THE SECOND DUPLICATE ID.** What it said on the happy path
was "Saved" over a figure that had already changed, which `avatarSave`'s own comment calls the
difference between a wardrobe and a form. Only BUYING is worth a word now, because that one spends
credits — and a refusal is a toast, which this app decided once already.

**AND `Credits` CAME OFF THE PAGE.** `cards.js` already draws the balance on this same column, so it
was one fact in two places, and dropping it is what buys the Colours page its room. `Level` stays: it
has one home and the locked items say `Lv 8`, so this is the page that makes the number mean
something.

### `settings · a slot page` — and the assertion had to be read in the same tick

**A DECLARED STATE THAT TURNS TO A SLOT PAGE, PRESSES A PICK AND ASKS THAT PAGE'S FIGURE.** Nothing
else could: `check/press.js` presses `av-pick` and correctly reports that SOMETHING changed, which is
true of the wrong figure as well. **Proved by mutation** — `draw()` reduced to the first `.av-figure`
names the state at all four widths and exits 1.

**IT GOT TWO THINGS WRONG FIRST AND BOTH ARE WORTH KEEPING.** `.page.on` is set by `paintPager` and
reading it in the same tick as `goPage` finds the page the column was on BEFORE the turn, so the
first version pressed nothing and failed about the app rather than about itself. And the redraw has
to be read AT THE PRESS: `check/fixture.json` is one payload served to every request, so the stubbed
reply carries no `avatar` key, `USER.avatar` becomes undefined a moment later and the figure returns
to the default. Asserting on that would report the app broken for the fixture's shape.

### `data-do` is what a control is in this app, and the tap rule asked about tag names

**TWENTY-ONE COLOUR SWATCHES ARE `<span data-do="av-colour">`**, 30x30, and the tap-target rule could
not see one of them: it tested `BUTTON|A|SELECT|INPUT|TEXTAREA|LABEL|SUMMARY`, a `role`, or an
`onclick`. **The whole dispatch is one delegated listener on `data-do`** and `check/press.js` presses
exactly those, so an element carrying one is a control by construction whatever tag it happens to be.
Added, and across the whole app it surfaces **four findings and they are all the swatches** —
everything else that carries a `data-do` is already 44px or already accepted.

**AND 44px WAS WRITTEN, RENDERED AND READ BACK RATHER THAN ARGUED.** At 44 the Colours page goes from
454.9px to **574.9px in a 532px pane at 320x568** — 68px unreachable, which is worse than a mis-tap.
`ACCEPTED_TAP`, with the arithmetic and with what was tried: splitting the colours onto three pages
gives the 44px and costs three swipes to change a look, which is a worse wardrobe than a slightly
small circle. A wrong tap here is undone by the next one.

### And `SCREENS` came back as objects, which is how a derived list measures nothing

**`TABS` IS A LIST OF OBJECTS AND THE FIRST VERSION OF THE DERIVED LIST DID NOT MAP `t.id`** — so
`go()` was handed an object and every column was skipped. It came back as **88 combinations where the
run before it was 132**, and that drop is the only reason it was caught: a derived list that silently
measures nothing looks exactly like a short one. 216 now, against the 132 of the hand-kept nine.
