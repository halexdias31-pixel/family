## The basket has lived in four places, and a tool is the shape that fits it

**Asked for as "you remember the cart? i want the cart to be a tool in the tool column. forget its
old css of green computer screen. it should just be consistent like everything else. should like
slightly like booking widgets. but not fully as its only recording items and sheets and wether to
upgrade a specific sheet to lamininated."**

**A COLUMN, A SHEET, A PAGE OF FIND, A PAGE OF BOOKING.** Every one of those had the same trouble and
it is not a styling one: **a basket is empty most of the time**, so wherever it lives it is either a
swipe that usually leads to nothing or a page that appears and disappears under somebody's thumb.
The last of those was reported in its own right — a star inserting a page in front of the results is
the fault `paintStuff` records — and the basket page did exactly that at the other end of the column.

**A TOOL DOES NOT HAVE THAT PROBLEM, and `widgetsOf_`'s own note is the argument**: *"a column is the
place you go to see all of them; hiding half of it because the calendar is empty this week is the
column failing to be a place."* It does not read `solid`, so the basket is always on the Tools column
and says which state it is in.

**SO THE EMPTY STATE CAME BACK.** It was deleted on the argument that *"an empty basket should be no
basket"* — right for a page in front of a search box, wrong for a widget: a tool that draws nothing
is a tool that reads as broken, which is this repository's oldest shape. And it says where things
come FROM, because the one thing nobody can work out from an empty basket is how to fill it.

**"SLIGHTLY LIKE BOOKING WIDGETS" IS `receiptHtml`, AND IT ALREADY WAS.** The basket and the booking
are the same document — a list of things you are about to pay for, a total, and the button printed on
the paper rather than floating under it. **The green terminal the complaint names went several
commits ago**, with the other three skins `receiptHtml` used to carry; what is left is the paper, and
this change moves where it hangs rather than what it looks like.

**NO `.card` OF ITS OWN, which is the one thing different about this entry in the roster.**
`widgetOnColumn_` already wraps every widget in `.card.is-widget`, and what `cartCard_` returns is an
`.rc` — a receipt, which has its own edges and its own colour. `bookerCard`'s note settles it one
screen along: a `.card` holding an `.rc` is *"a glass panel with a paper receipt inside it — two
containers for one object"*.

### `cartPaint_` writes by class, because the Saved column draws the same markup

**Every screen in this app is in the document at once**, and a starred basket puts a SECOND
`#cart-box` on the page — so `$()` would hand every caller the first of them, which is the
`$('msg-text')` fault that once posted a reply to the wrong person. The id stays, because `into` and
`startWidget_` look a widget's parts up by it; the writing is done by class.

**AND THE TWO HANDLERS STOPPED REPAINTING A SCREEN.** `cart-drop` and `cart-laminate` called
`paintStuff(true)` or `repaint()` — a whole column rebuilt so that one line could go or one total
could move. There is nothing to rebuild: the basket is a box, `CART` is in `localStorage` rather than
on a wire, and the press IS the change. Same argument `cart-add` already makes for using `tileSet_`.

**The declared state moved with it** and is seeded exactly as before — `CART` cannot be reached by
any fixture, so this file has only ever seen the basket empty whichever surface it was on. The
thousand-pound price in it is deliberate: the figure column is sized in `ch` of a proportional font
and drawn in mono, and `£2050.00` is one character wider than `£270.00`, which is the difference
between a finding and a pass.

### Standing next to the calendar found three faults nobody had measured

**The basket is the tenth of eleven tools, so the state that reaches it is the first thing this lab
has ever stood within three pages of the end of that column.** `.far` hides a page more than three
away and every other tools state sits at the top, so `week` and `calendar` had never been laid out
at any width by any visitor. All three findings are pre-existing, none is in this change's diff, and
all three are real:

| | |
|---|---|
| `.cal-arrow` | **31x36 at 320.** Its padding is in `rem`, which is this stylesheet's seventh conviction of that rule after `.btn.tiny`, `.post-act`, `.fm-adds label`, the chips, `.qp-check` and the reel's sound button |
| `.rost-slot:not(.on)` | **`background: transparent`, measured at 1.31:1** — `--paper-ink` on `--bg`. The roster was written for a cream receipt and its one live caller draws it into the `week` widget on the app's own black card, where three of the four seats are usually open. The fill stays; `opacity` is what keeps it pale, which is what the rule's own note asks for |
| `.rost-role` | `--paper-faint` on the seat's `#eeeadd` fill is **3.19:1**. Which seat somebody is in is not small print — it is the label the name above it answers |

**AND THE FOURTH WAS THE CHECK.** `span.rost-name overflows by 15px` is a four-column roster on a
320px phone with `text-overflow: ellipsis` doing exactly its job. **`ellipsis` is the second way of
being told**, alongside the `<input>` exemption one line above it: it declares that the text is
expected to be longer than the box and draws a mark saying so, which is the opposite of a box
scrolling sideways when nobody asked. Narrow — both properties and no element children, because
`overflow: hidden` alone is how a layout fault gets clipped rather than scrolled and that must go on
being caught. **Measured: it removes three findings across the whole app and they are one element.**
