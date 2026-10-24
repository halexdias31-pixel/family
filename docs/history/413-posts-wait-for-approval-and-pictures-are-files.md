# 413 — posts wait for approval in the feed, pictures are files, a post shares as a PNG

Asked for, 24 Oct, in seven parts: approval on the feed itself, no image links (uploads to the owner's Drive, the
same for messages), no uploads for children, no edits once a post is up, Share as a picture of the whole post,
"Post as" for an admin, and every message head drawn with the account's chosen picture.

Much of the machinery was already there and is reused rather than rebuilt: the waiting queue
(`approved` = `PENDING`/`REFUSED`, `POST_WAITING_MAX`, docs/history/282), the camera card's uploads through
`driveKeep_` into the `posts_folder` (shared by link, `#video` for clips), `camItemOf_`'s 1600px JPEG redraw, and
messages' attachments with an inline `<img>` (`msgAttachHtml_`, check-uploads.js).

## 1. Approval, on the post in the feed

- **Who is sent a waiting post** did not change: its author and an admin (`doGet`). What changed is whose it is:
  `mine` now asks who pressed Post (`posted_by`, then `author`) through one helper, `postIsBy_` (content.gs). An admin's
  business post carries the brand's name in `author`, so the old author-only test called it nobody's. The payload sends
  `mine` per post so the phone can offer Edit and Delete; the server checks again.
- **The card** (`postCard_`): class `is-pending` — a 2px dotted gold outline, inset (`outline-offset: -2px`) so a
  picture bleeding to the card's edge cannot cover it — and a first line **Waiting for approval**, with "· only you
  and the admin can see it" for the author. The old "· waiting" in the header and the "Waiting to be checked" line
  under the tiles are gone: one statement, at the top.
- **Tiles** (`postTiles_`, tiles.js): Share always. Waiting, for an admin: **Approve** (tick, `buy`) and **Decline**
  (close). Declined, for an admin: Approve only (declining again does nothing). Waiting and yours: **Edit**. Up, for an
  admin: **Pin or date**. Yours, or an admin: **Delete**. An admin's own posts never wait (`addPost`, unchanged).
- **Business glows** while any post waits: a **Posts waiting** card first after Setup (`postsWaitCard_`, records.js),
  counted from the payload (an admin is sent every waiting post, so it needs no request), each with Open (on the feed),
  Approve and Decline; `bizNeed_('posts', n, …)` feeds the red glow and the dot.
- **Open on the feed** (`postGo_`, posts.js) found a bug in `openSharedPost`: it set `PAGE.feed` to the post's index in
  `feedPosts()`, but the feed's pages are the festive cards, then the camera, then the posts (`feedColumn_`). A shared
  link opened short by one page or more. `feedPageOf_` counts them; both now use it.

## 2. Pictures are files

- **`addPost` takes no links.** `postMediaRefusal_` refuses any entry that is not a `data:` URL ("A post takes pictures
  chosen from your phone, not links"), and `addPost` no longer falls back to `body.image`. A picture over 8MB
  (`POST_PIC_MAX`) is refused; the phone redraws one at 1600px, well under a megabyte. The 20MB clip and 45MB-of-base64
  post caps stay (the camera card's own numbers, read by check-uploads.js).
- **The composer** ("Write a post"): the link box and the "In the folder — tap one" picker are gone. **Choose pictures**
  is a label for `<input type="file" accept="image/*" multiple>`, which a phone offers as the camera or the library.
  Each picture goes through `camItemOf_` (1600px JPEG, 0.85), is previewed with the card's own `postMediaHtml_`, and a
  tap on a thumbnail takes it out. Up to six; the whole post must fit `CAM_POST_MAX`. It posts with `send_`.
- **The camera card** already uploaded; it keeps clips, as the owner asked for in 282 ("and also videos"). The composer
  takes images only, as asked here.
- **Messages:** every JPEG/PNG/WebP/HEIC photo is now redrawn at 1600px before it goes (it was only those over 2MB). A
  GIF goes as it is, so it still moves. `camItemOf_` no longer throws where `URL.createObjectURL` is missing, and
  `msgRead_` sends the file as it is if the redraw fails — check-uploads' jsdom has no object URLs and caught it.
  The inline picture and the chip preview in the box were already there.

## 3. A child uploads nothing

Rank Student (`rankAtLeast_(me, 'client')` false) is refused at every door that keeps a picture, before anything is
made: `addPost` (`why: 'child'`), `sendMessage` with files (`why: 'files'`, so the bubble offers Words only) and
`savePhoto` with `data` (one of the ten pictures, or the figure, still saves). One sentence, `CHILD_NO_UPLOAD`. The phone
draws no picker: the feed's camera page is a card saying a grown-up puts pictures up (`feedCamCard_`), Write a post
toasts the same, the message box has no ＋ (`msgForm_`), the picture card has no Choose photo (`photoPicker_`).

## 4. Up is final

`editPost` and `deletePost` are `self` now (were `admin`); each handler decides. **Waiting:** its author may change
caption, body, location and the poll. **Up:** nobody changes the words — not an admin either; an admin may still pin it
and fix its date (the feed is ordered by it). **Declined:** nothing. A field outside what this person may change on
this post refuses the whole save ("A post cannot be changed once it is up. Delete it and post again."). **Delete:** its
author or an admin; putting one back (`on: true`) stays the admin's. The edit sheet shows only what can be changed:
"Edit post" for the author's words, "Pin or date" for an admin.

`sure_` (receipt.js), the two-press confirm, restored a tile as the word "Confirm" — it saved `textContent`, and a
tile's face is an SVG. It now keeps the markup (`sureBack_`), and arms a tile with its words in the tile's own
`tile-k`. That fixes Decline here and the session's Decline in receipt.js.

## 5. Share as a PNG

Share on a post draws the whole post on a canvas (`postPng_`, posts.js): the stylesheet's own black and gold tokens, a
gold frame, the author's face through the card's rule (photo, one of the ten, the figure, else the brand's mark, else the
initial), name and place, the first picture in its own shape between 16:9 and 4:5 ("+N more" for the rest), the caption
with the name in bold, the body, the reactions counted, and a foot with the brand's mark, name and the post's link.
A picture is loaded with CORS; if that fails or taints the canvas it goes through the backend's existing `imageData`
proxy; failing both it is left out. No canvas at all: the old link share.

The hand-over is `shareCanvasPng_(canvas, filename, text)` in shell.js: the share sheet with the file when
`navigator.canShare({ files })` says yes; otherwise a download and the link copied. **To dedupe at the merge:**
fix-profile-png (412) writes `tutorPngHand_` in posts.js for the same job, and receipt.js has `rcHand_`; keep
`shareCanvasPng_` and have the other two call it. The drawing helpers are prefixed `ppng` so they cannot collide with
412's `tpng` ones; `ppngWrap_`/`tpngWrap_` and `ppngImg_`/`tpngImg_` are the obvious pairs to fold.

## 6. Post as

The "posting as" row was drawn for everybody, and anybody but an admin was silently posted as themselves. It is drawn
for an admin only now: **Post as: @family. (business) / me (personal)**, on the composer and the camera card
(`postAsRow_`, `postAsOf_`). Anybody else sends `me`; a stale phone sending `brand` is still posted under its own name
(not refused — that would break a phone from before this for a minute). A business post's author is `brandName()`, so
`doGet` draws the brand's logo and name.

## 7. Faces in messages

`messages` sends `withFace` on each message (`msgFace_`, core.gs): the account's `photo` cell — the same source as their
card — and, when they chose nothing, their figure (`pfp:avatar` with their `avatar`) if they have dressed one, else
nothing (the initial). A child's own photograph is replaced by her figure when she has one, the post face's rule
(`kidHid` in doGet). `dmFace_` reads it first, so a parent's or a child's head is their picture; before, only people in
`DATA.tutors` (and the family or an admin's everyone) had one.

## 8. A message can be reported

Added at the coordinator's request the same day. `flagMessage` (sets `flagged`, `flag_reason`, emails the admin as
`reported`, refuses a message not sent to you) had no front end. Now every **received** message in Messages has a quiet
**Report** tile (flag) beside its bubble (`.msg-line`, me.js) — not your own, not a pending one. It opens the question
Report's sheet (395, `rep-why` reused): five reasons a message has — Unkind or bullying; It makes me feel unsafe; Rude,
or a picture that should not be there; Spam, or I don't know them; Something else — and an optional note (a draft,
`msg-rep`). Send posts `flagMessage` with the reason and note as one sentence; "Thanks — sent". A child can use it:
`flagMessage` is `self`, and the only messages a child receives are an admin's.

**Business → Reports** now lists reported messages first (`flaggedMessages_`, content.gs, on `listReports`): from whom,
to whom (a child by first name), why, the words and how many attachments; their count joins the open reports in
`bizNeed_('reports', …)`. **Dealt with** is `setReportStatus` with `kind: 'message'`, which sets `flagged` to `CLEARED`
on the row — no new column, the message kept for the record, never deleted.

## Decisions the owner may want to change

- **The folder picker is gone from Write a post.** It turned a Drive file into a link. Photos dropped into the posts
  folder by hand still become posts through the admin's folder scan (`scanPosts`). `folderFiles` stays on the server.
- **An admin cannot rewrite a waiting post**; Approve or Decline, and the author edits. Easy to open if wanted
  (`editPost`'s `may`).
- **Clips stay on the camera card.** Only "Write a post" is pictures-only.
- **No new column.** Approval uses `approved`, `approved_by`, `approved_on`, all already in `SCHEMA.posts`.

## Checks

- `js/check-posts.js` (new, in the suite), 44 rules through the real `doPost` and `doGet`: a staff member's post waits
  and is sent to its author (marked `mine`) and an admin, not a parent, child or stranger; the author edits it while it
  waits, nobody else (not the admin), never the author cell; a tutor cannot approve; Approve puts it up for a stranger;
  then no caption edit by anybody, an admin's pin works; delete by its author or an admin, a parent refused, only an
  admin restores; Decline hides it from all but the admin and locks it; links refused (alone or in `media`), a picture
  over 8MB refused; an admin's business post is signed by the brand with the admin in `posted_by`, `me` signs it by the
  admin, a tutor asking for `brand` is posted as herself; a child refused for a post, a message's file (`why: 'files'`)
  and a profile photo with nothing made in Drive, and still allowed one of the ten; a parent's message picture kept and
  sent to the tutor as an image; `withFace` the chosen picture, the figure when none, a child's photo hidden behind her
  figure. Five mutations (child gate, the waiting filter in doGet, the edit rule, the link rule, `withFace`) each red.
- Updated: check-uploads (a link is now refused, a photograph not; over 8MB refused), check-prefs (the approvals email
  is driven by an uploaded picture, not a link), check-surnames (the pin sends the pin alone; a caption sent at a post
  that is up is refused and the cell keeps her whole name; the "an edit keeps the names it did not touch" rule moved to
  her own waiting post, edited by her).
- check-flow, three journeys (four with section 8's) through the real backend: the waiting post as Ada (dotted, the line, Edit/Delete, no
  Approve), a parent (not drawn), the admin (Approve and Decline, Business glowing, the dot), Approve, then everyone and
  Ada's tiles; a child with no picker anywhere and a parent with all three, the "Post as" row for the admin only; Share
  handing a `.png` File with the post's link to the share sheet, the caption and the brand drawn, and a download when
  files cannot be shared. Four mutations each red.
- Screenshots at 390x844 (Chromium): the waiting post as the admin and as its author, a message with a picture and the
  correspondent's fox, the composer, the edit sheet, Business, and the share PNG itself.

- Reporting a message: five more rules in check-posts.js (a parent cannot report a message not sent to her; a child can
  report one sent to her; the admin's Reports list it with who, to whom and why; a tutor is not shown reports; Dealt with
  clears it) and a check-flow journey (the tile on the received message only, five reasons, no Send without one,
  `flagMessage` carrying the reason and note, "Thanks — sent", the flag on the sheet; the admin's Reports card showing it
  and glowing; Dealt with clearing it). The count left out of the glow is red.

Stamps `2026-10-24-p-posts-approval`, all four and `--css-version`.

## Deploy

`backend/` changed: merge to `main`, in Apps Script press ↓ (GitHub Assistant), Deploy → New version, then open the
site once as an admin. No new columns and no new scope (`drive` was granted in 282).
