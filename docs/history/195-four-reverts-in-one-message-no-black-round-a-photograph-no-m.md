## Four reverts in one message: no black round a photograph, no "Message everyone", a speech bubble, and the kit a list again

**Asked for as "please dont add the ugly black boarder to posts. remove the note to everyone button. change message tile to look like a speach bubble. the google chip idea didnt work how i wanted to so revert back."**

**THE BORDER WAS THE FIXED 4:5 BOX.** A single post photograph sat in a 4:5 frame with `object-fit: contain` on `--sunk`, so at 390x844 a 16:9 landscape had 112px of black above and below it and a 9:16 portrait 48px down each side. `.page .post-pic` and a single clip are `aspect-ratio: auto 4 / 5` now, with no background: 4:5 is held only while the file is on its way, and once it lands the photo takes its own shape. `.post-pic` gained `height: auto`, because a `height="1000"` attribute IS a height and stretched every photo in the composer preview.

**The stability the fixed box bought is kept without black.** `postsAhead_` asks for pictures a page behind and two ahead. `holdColumn_` in shell.js is called from inside `paneWatch_`'s ResizeObserver delivery, which runs before paint, and it puts the page in front back on its line when a picture ABOVE it changes height. A 16:9 landscape reserved at 4:5 is 224px taller at 390 than it becomes, and the differences add up down the column. Measured with the pictures of three posts above arriving 3s late: the post in front stays on its line; with `holdColumn_` stubbed out it ends 529px up and stays there. What is left is the post you are reading on a cold open, whose own picture can move its caption once.

**Two knock-ons.**
- `paneWatch_` measures a frame later instead of zooming inside its own callback. Zooming there raised "ResizeObserver loop" and the gold "Something went wrong" banner once a portrait pushed a post past its pane.
- `paneReach_` keeps a shrunk card on its own centre: the left margin is worked out and divided by the zoom, instead of `margin-inline: auto`, which left a post that bleeds to the pane edge hanging off the right. Ordinary shrunk cards on six columns measured identical before and after. A 9:16 portrait post is drawn at about 95% at 390 and 72% at 320 signed in (the comment box is on the card); signed out it fits whole at 390 and is 77% at 320.

**Messages.** The admin "Message everyone" page is gone, along with `cast-send`, the backend `broadcast` action and its `ACTION_ACCESS` entry, because a handler with no door is the `orderPrints` shape. No version stamps were bumped. `dopost.gs` keeps the one idea worth copying if it is ever rebuilt: every row of one send needs its own `message_id`.

**The tile.** `TILE_ICONS.chat` is an outline speech bubble with its tail cut into the bottom edge, one path at stroke 1.4. The envelope (`mail`) had one caller and went with it.

**The kit.** `kitList_` in find.js draws the bulleted list from before the chips (the parent of 6e3d52b, rules restored as they were). The data stays `Name × qty` and the quantity is printed after a colon, as in `Water: 100 ml`, because ten of the 640 names already carry an em dash of their own and none a colon.

**Three sentences in this file are now false, and this heading corrects them**: the batch table's "A single photo sits in a fixed 4:5 box"; the zoom section's "`width` + `margin-inline: auto`"; and the kit-chips section, including "`.kit-chip` is its own component". The "One message to everybody" section describes a feature that no longer exists.

**The review found one thing.** The builder wrote three different figures for one effect: 82px in posts.js and style.css, 447px in shell.js, and 223px in the commit message. All three are true of different shapes above the reader. posts.js and style.css now give the arithmetic and point at `holdColumn_`'s own note, so the measurements are in one place.

**And the lab still cannot see this.** `check/fixture.json` has no single-photo post (PO1 is a grid), so no check here draws the box this section is about.
