# 448 — Write a post opens in place; Photos and Write are round; the poll is one box per option

## The owner's words

"I scroll up and the photos is like a square button… I would rather it be a circular button, like the
taking a picture and recording a video. And the same thing of writing a post… circular button too. And
when I click write a post, it becomes a pop-up menu… do not use pop-up menus on my site. Maybe make the
widget change… The poll thing: you shouldn't have to separate it with commas… add another text box to add
another option. Also if you click write a post then it shouldn't have an option to choose pictures."

## What changed

- **Round buttons.** `Photos` (the file-picker label) and `Write a post` are `.cam-round` discs in the
  camera bar, 52px like the record disc, outlined white on `--raised` so the white shutter and red record
  stay the loudest; the word sits under each disc. The old `Write a post` text button under the card went.
- **No sheet.** `new-post` no longer calls `openSheet`. It sets `POST_COMPOSING`, parks the camera
  (`camStop_(true, true)`) and redraws the camera card as the composer (`cameraCard` → `postComposeHtml_`),
  so the viewfinder and the composer are never on screen together. `Back` (`post-cancel`) or a successful
  post (`postComposeClose_`) redraws the camera and `feedCamWatch_` starts it again. `feedCamHere_` is false
  while composing, so nothing wakes the camera under the composer. A redraw of the feed (a `load()`) keeps the
  composer open because `cameraCard` reads the flag.
- **Words only.** The composer has no picture picker; pictures go up from the camera card's Photos/shutter.
  `addPost` (dopost.gs) now takes a post with no picture when it has a caption, body or poll, and asks for the
  posts folder only when pictures came (`hasPics`). A text post already drew (no media → reactions under the words).
- **The poll.** One text box per option (`pollBox_`), two to start, `Add option` adds one, six at most
  (`POLL_MIN`, `POLL_MAX`); one filled option is refused ("A poll needs at least two options"). The sheet still
  keeps one comma-joined cell (doget splits on commas), so a comma typed inside an option is taken out
  (`pollOptsOf_`). Each box is its own draft (`poll0`…`poll5` in `POST_DRAFT_FIELDS`).
- No other overlay composer for posts existed: the reactions list and post editing still use the sheet,
  which are not composers and were not asked about.

## Checks

New journey "Write a post (448) turns the camera card into the composer in place…": both round buttons in the
bar; pressing Write opens no sheet (`#sheet` hidden, no `sheet-open`, no dialog), the composer is inside
`#s-feed .cam-card`, not `position: fixed/absolute`, no file input in it, no viewfinder beside it; 2 boxes,
Add option stops at 6 and hides; one option refused; the sent `addPost` carries `poll: "Saturday, Sunday after
lunch"` and no pictures; the composer closes after posting; Back brings the viewfinder back. The child journey
now asserts no composer at all. css 2026-10-25-b-feed-compose; all four version stamps bumped (dopost changed).
