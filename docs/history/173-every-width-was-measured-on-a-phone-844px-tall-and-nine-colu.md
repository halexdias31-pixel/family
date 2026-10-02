## Every width was measured on a phone 844px tall, and nine columns were clipped on the one that is 568

**`check/ui.js` GAVE EVERY WIDTH ONE HEIGHT** — `newPage({ viewport: { width, height: 844 } })`,
written out once and used for all four — so its "320px phone" was a **320x844 device that has never
been made**, and the pane it measured was 807px against a real iPhone SE's 534. `.pane` caps at
`100dvh` minus the chrome, so the pane's height IS the viewport's: a fake height is a fake pane, and
every rule in that file that asks whether content fits a box was asking it of a box a third taller
than the one the app is in on the phone the complaints come from.

| | |
|---|---|
| before | 4 widths x 844 |
| after | **320x568, 390x844, 768x1024, 1280x800** — the SE and the 5, the iPhone 12 to 15, the iPad upright, an ordinary laptop |
| OUT OF REACH, real heights, nothing else changed | **21 panes across nine columns** |
| after the two app fixes below | **0 failures, 3 printed inside the app's own floor** |

**THE HEIGHT IS A REAL DEVICE'S OR IT IS THE SAME FAULT AGAIN**, and 800 is the SHORTEST of the
laptop heights rather than the tallest, because the question this file asks is whether a thing FITS.

### `paneReach_` was on the funnel and nowhere else, on the strength of a sentence this instrument disproved

**The note over `PANE_REACH` said it outright**: *"ON THE FUNNEL'S PANES AND NOWHERE ELSE. Every one
of the 431 is a question card, and `check/ui.js`'s OUT OF REACH rule reports nothing on the other
nine columns — so this is as narrow as the fault."* **It reports plenty.** The camera after a
photograph 191px, the Scrabble board 161px, the high-score board 113px, a waiting list 105px, your
own account 95px, the Saved column 73px, Spotlight 86px — every one of them content that can be
neither scrolled to nor paged to, on a 320x568 phone.

**So the narrowness that comment claimed was an artefact of the instrument**, which is this
repository's oldest shape pointed at a rule rather than at a screen: a confident sentence resting on
a measurement that could not see its subject. `paneWatch_` is called for the screen you are on from
`placeNow_`, and **nothing new had to be built** — `scrollHost_` walks up from the finger and takes
any ancestor whose `overflow-y` is `auto`, so a pane on any column scrolls from the app's own drag
and hands back to the grid at its end, exactly as a question card has since that was written.

### Once per placement is not enough, and one hook per grower is what keeps being forgotten

**Thirteen of the twenty-one went with that one line and eight did not**, because a card that grows
AFTER the placement that measured it keeps the clipping of the card that fitted:

| | |
|---|---|
| Scrabble, the high-score board | drawn into the card by a widget `startScreen_` starts after the paint |
| the camera | 167px of controls the moment a photograph is taken |
| `drawBooker()`, `paint('spotlight')`, `paint('dm')` | **REPLACE the card**, which throws away the inline `overflow-y` with the element that carried it |

**THE APP'S ANSWER SO FAR HAS BEEN ONE HOOK PER GROWER** — the camera calls `placeCells` at each of
the four places its card changes height — and the trouble with that is that it has to be remembered
by whoever writes the next card that grows. `paneWatch_` is the same fact declared once: a
`ResizeObserver` over the cards, so a card whose height changes re-asks the question about the pane
it is in. **On the card and not the pane**, because a pane is `max-height`-capped and stops growing
at the cap — an observer on the pane would go quiet at the moment it became worth hearing from.

**AND `disconnect()` WOULD HAVE BEEN WRONG**, which is the one thing here that had to be got right:
`paintNeighbours` paints every other column, so a global disconnect would drop the watch on the one
you are looking at. Each host remembers what was observed on its behalf and only that is let go.

**BOOKED FROM `paint` AS WELL, because a paint is not always followed by a placement.** `dmPoll_`
calls `paint('dm')` every twenty seconds and `dm-refresh` calls it on a tap — so a conversation that
gained a message would keep the clipping of the markup it replaced. Through `afterSlide_` rather
than run inline, for `paneReach_`'s own reason: reading `scrollHeight` a line after writing
`innerHTML` forces the layout synchronously, and on boot `paintNeighbours` comes through there once
per column.

### Two floors for one question, and the check reads the app's

**The last three findings were 11px, 20px and 21px — every one under `PANE_REACH`'s 24.** The app
deliberately leaves a pane that close to fitting clipped, because below that the competing gesture is
the whole navigation and handing it over to move a card a few pixels reads as a swipe that did
nothing. Asking with a floor of 2 while the app answers with a floor of 24 is **two numbers for one
question**, which is the shape this file records under `needs_print` / `print_required` and under
`AVAIL_HOURS` against `SLOT_HOURS`. The rule reads `PANE_REACH` out of the page.

**Printed rather than silent, and not as a failure.** The content really is unreachable — under a
line of text — and the only thing that can win it back is the card's own design, so it is the
`ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` pattern for a seventh time: in full, with one written reason,
not counted against the run.

### Proved in three directions on one column, because a fault the instrument cannot see is the whole entry

| `--screen=make` | |
|---|---|
| as it ships | nothing to report |
| real heights, the app fix reverted | **71px, 191px and 29px** |
| **one 844 height for every width, the app fix reverted** | **"nothing to report"** |

That third row is the instrument as it was, with the fault present and in front of it. And removing
`paint`'s booking names Spotlight's two at 42px and 86px.

### A fact about the longest word in the dictionary contains it

**`Pneumonoultramicroscopicsilicovolcanoconiosis` is 46 characters with nothing to break at**, so
`.feed-body` ran **79px past the card**. Found as a sideways scroll on the games column — and found
**one run in three**, because which of the 400 facts the widget deals varies, so it is also the shape
this file records where a check reports a real fault only when it happens to look at the right
screen. `overflow-wrap: anywhere`, which is the declaration the question cards already carry for the
51 dotted answer lines — the identical fault one column along — and on the heading as well, because a
long word in a heading runs off just as far.

### And the sweep that fixes an escape broke a regex, for the second time

**`\u2014` written through a Python heredoc is a real em dash**, which is right in prose and wrong in
`markRange_`: `/(?:to|\u2013|\u2014)/` needs the escapes, and a sweep that replaces them writes a
real dash into a regex that must match both. **CLAUDE.md already records this exact pair of faults**
— 23 comments holding a leaked escape, two of which were quoting one on purpose — and the tell this
time was `git diff` naming a line nobody had edited. Restored byte for byte.

**AND `check-marking.js` WOULD NOT HAVE CAUGHT IT.** All 46 of its cases pass with the em dash
broken, because not one of them writes an accepted band with a dash rather than the word `to` —
which is a gap in that check and is written down here rather than quietly filled.

### What this did NOT fix, and both are the owner's call rather than a repair

**A 4:5 PORTRAIT PHOTOGRAPH ON A POST IS STILL 582px INSIDE A 534px PANE at 320x568** — the fault
this file already records with no instrument — and the pane scrolls it now, which is a real
improvement and not the same thing as fitting. The fix that would make it fit is a height cap with
`object-fit: contain`, which makes a tall photograph **narrower than the card** (about 74% of the
width at 320, 83% at 375), and that is a visible change to how every photograph in the app is shown.
**`check/fixture.json`'s posts still carry `image: ""`**, so no run has drawn one at all.

**AND THE BOOKING CARD IS 11px TOO TALL FOR A 568px PHONE.** Inside the app's own floor, so it
prints; the only thing that wins those eleven pixels back is the card, which is the app's main form.
