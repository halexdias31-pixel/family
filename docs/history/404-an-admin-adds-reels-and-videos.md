# 404 — an admin adds reels and videos from the phone

The owner, 24 Oct: "I want to use Claude less for adding stuff — e.g. add videos to the database, add a
reel. Best way: a plus widget on Reels like you did for People." 373's "+" (`addCard_`), adopted by two
more lists.

**Where.** For an admin only:
- **Reels** opens on a page of its own before the first reel: "+ Add a reel", and under it every YouTube
  reel there is — the repository's (`FEED_FACTS` / `settings/facts`) and the sheet's, hidden ones too —
  each with tiles Edit, Hide/Show, and Delete for a row the sheet holds. Because that page leads the
  column, `REEL_LEAD` (posts.js) is 1 for an admin and 0 for everybody else, and a reel's `data-reel` is
  its page (`REEL_SHOWN + REEL_LEAD`); the top-up arithmetic (`reelTurn_`, `reelAhead_`, `reelJobs_`,
  `reelPages_`) subtracts it.
- **The Videos card** has "+ Add a video" at its top once a search is typed (the idle card stays the bar alone, as Sync from Drive does; `.vid-add`, painted by `vidPaint_` through `vidSet_`),
  with the sheet's videos listed under it the same way.

**The form** (`mediaFormHtml_`, games.js) opens in the "+" card's place. Paste a link — a Short, a watch
link, youtu.be, embed or live — and `vidYouTubeId_` takes the id; the browser asks YouTube's oEmbed
(`youtube.com/oembed?format=json`, no key) for the title, channel and picture. A failed lookup leaves the
title to type. A reel asks its subject (the word on the slide); a video its tags, kind (`VID_KINDS`), age
and notes — the columns `data/videos.json` rows already carry. Save / Cancel (a form has buttons). The boxes
are kept in `MEDIA_FORM` as they are typed, so a repaint draws what was typed; check-drafts exempts them.

**Storage: one Ledger tab, `media`** (`TAB`, `SCHEMA`, `WHERE`), one row per (kind, YouTube id) with
`kind` reel or video. Setup makes it on the first admin load after deploy (361). Three admin-only actions in
`ACTION_ACCESS`, one writer `mediaWrite_` (content.gs) under the script lock with rows read fresh:
- `mediaSave {kind, url, title, …}` — upsert by (kind, id). Refused: not reel/video, a link with no 11-char
  YouTube id, no title, any field over its cap (`MEDIA_CAP`: title 200, tags 300, notes 500…), a picture not
  on `i.ytimg.com`. The stored url is rebuilt from the id.
- `mediaHide {kind, id, hidden}` — sets `hidden`; a repository item with no row gets a row, which is how a
  repository reel is hidden.
- `mediaDelete {kind, id}` — the row goes; a repository copy shows again.
Each reply carries the whole list, so the phone redraws at once, then `load()`.

**The merge.** `payload.media` (`mediaOut_`, doget.gs) is every row, the same for everybody; a hidden row is
`{kind, id, hidden}` alone. The repository lists are files the phone fetches, so the merge is on the phone:
`mediaReelsOver_` (in `clipsNow_`) and `mediaVideosOver_` (in `videosAll_`) put the sheet's rows over the
repository's — a row of the same id, shown or hidden, replaces the repository item. Non-admins see nothing
new but the items.

**Checked.** check-media.js through the real doPost/doGet: a student and nobody refused with nothing
written; a non-YouTube link, a bad id, a wrong kind, a long title and a foreign picture refused; added,
edited in place (no second row), hidden (a repository id too), shown, deleted; the payload carries it.
check-flow: a student's Reels has no "+" and the doors post nothing; an admin's opens on the "+", a pasted
Short is looked up (oEmbed stubbed), Save posts `mediaSave`, and the reel is in the column with an Edit tile
before the payload comes back. Mutations: `mediaSave` gate opened to `self`, and `mediaMay_` returning true,
each turned a check red.

Deploy: backend changed — all four stamps `2026-10-24-a-media-admin`; CSS `2026-10-24-b-media-admin`.
