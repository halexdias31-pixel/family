## Make a flyer is an admin's at every door, and the cheat sheet maker has a subject

**Asked for as "make a flyer should only be visible to admin".** On the Tools column it already was (`admin: true`), but the rule was written out twice: once in `widgetsOf_` and again in `savedWidgets_`. Two more doors asked nothing at all: `widget-open` in tiles.js opened any widget by id, and `startWidget_` started whatever it was handed. **`widgetFor_(w)` in arcade.js is the one test now and all four doors ask it.** `initFlyer`, `fm-preset` and `fm-print` refuse anybody else as a second lock. A star is kept on the device, so without the Saved-column test a flyer starred by an admin came back for whoever signed in next. Measured as admin, tutor, parent, student and signed out, across all 11 screens with the flyer pre-starred.

**"Subject as a filter too" gave the cheat sheet maker a subject select, and a second subject for it to choose.** `data/cheatsheet.json` gains a `subject` column. The periodic table carries `Science` in code, and a code piece with none is Maths. The tab already held 21 English rows (E02–E22), and `matParts` had thrown them away since they were typed because nothing drew them. `MAT_PARTS_EN` draws them now. The ruler is in no subject and is offered under all of them. The card reads in the order the choices are made:
- subject
- one level select, which splits Foundation/Higher only for maths (`MAT_TIERED_SUBJECTS`)
- one "skip what the exam gives you" box, only where a listed piece is given
- Fill the page / Clear
- the list, the gauge and Print

The list and the paper ask one test, `matShown`. The subject, level and ticks are remembered on the device.

### A review found four faults in the rework, all invisible to every check

| | |
|---|---|
| **Fill** | it ranked "not given" first and folded "unknown" and "given" together, so the sphere, which the exam prints, beat the protractor, which nobody has checked. Three ranks now: known not given, then unknown, then known given |
| **Clear** | it was lit whenever anything was ticked. Ticks are kept across subjects, so with Maths on screen it would throw away an English sheet you could not see, with nothing on the screen changing. It is now lit only over a visible tick |
| **Print off its card at 320x568** | the two new picker rows plus the list's 8rem floor put Print 28px past its own card, and 13px even when filled. **The squeeze chain hid it from the pane**, because every box between them may shrink to nothing, so the overflow sat in the pane's padding and no zoom was ever asked for. The mat list's floor is 6rem (the 8 was measured against the A4 preview this card no longer draws), and the gauge's sentences fit on one line |
| **The ruler counted as a listed piece** | so "nothing here" was unreachable, and a Science sheet with the periodic table skipped said "or Fill the page" beside a greyed-out Fill |

The over-page warning also said "or the bottom is cut off", which cannot happen: Print is disabled while the page is over. `check-flow.js` asks the Fill order and the Clear rule, and proved it by mutation.

**A widget starred onto the Saved column is dead there, and has been since Saved held widgets.** Every widget finds its parts by id, and the Tools copy is earlier in the document. Measured at e3124ae: a starred cheat sheet maker draws an empty box on Saved, and the Saved calculator types into the Tools calculator. Not fixed here, because the repair is scoping every widget's start to its own box.

**Fixed since, in one place rather than in every widget.** `$` in `js/data.js` now prefers the copy of an id inside `#s-<AT>`, the screen in front, and falls back to the first copy. A widget is started while its own column is `AT`, so each copy binds to its own parts. Measured in a browser with the calculator starred: pressing 7 on Saved lights the Saved display and leaves the Tools one at 0; with the old `$` it was the other way round.
