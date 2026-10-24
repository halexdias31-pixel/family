# 406 — how old you have to be to watch a reel or a video

The owner, 24 Oct: *"add age restriction for videos and reels — how old they have to be to watch it."* Builds on 404 (the
admin's "+", the `media` Ledger tab), 398 (who counts as a child; the kept payload is per viewer) and 400 (ranks).

## The rule

- Every reel and video has a **minimum age in whole years**. Blank, 0, "U", "PG" or words mean everyone; a cell that says
  "12+" means 12 (`mediaAgeOf_`, the same in content.gs and games.js; capped at 21).
- A viewer sees an item only when its minimum age ≤ their age. Their age is whole years since `date_of_birth` (the
  profile's `dob_d/m/y` on the phone, `personAge_` on the server), or an `age` cell if a row ever carries one.
- **Unknown age**: a signed-out visitor and a Student with no date of birth see 12 and under (`MEDIA_AGE_UNKNOWN`);
  a Client, Staff or Admin with none is taken for an adult. **An admin always sees everything**, whatever their own date
  of birth says, with the age on the admin lists ("· 15+", or "· all ages").

## Setting it

The 404 form (`mediaFormHtml_`) now asks the age for a reel as well as a video: quick picks U/PG (0), 7, 12, 15, 18 —
buttons, it is a form — and a number box (`mediaAgeBoxHtml_`, `media-age`). The old free-text "Age (e.g. kids)" box is
gone. `mediaSave` stores whole years or blank, whatever was typed.

Repository items: `data/videos.json` already had an `age` column (all blank today; the placeholder row now says what it
is). A built-in reel in `FEED_FACTS` (chess.js) takes an optional sixth field, and `settings/facts` an `age` column
(settings.js). See data/reels/README.md.

## Enforced twice

- **The server**, for the sheet's rows: `payload.media` is built per viewer (`mediaOut_(mediaAgeCap_(meAsked))`). A row
  rated above the viewer goes as `{kind, veil, hidden}` — no id, no title. The veil is FNV-1a of `kind:id`
  (`mediaVeil_`, both ends), so a rated row still hides the repository copy of the same video (an admin who rates a
  repository Short makes a sheet row for it) without telling a child the YouTube id, which would be the video itself.
  The kept doGet body is keyed by viewer (`payloadKey_`, 398), so a child is never handed an adult's kept copy; the
  admin's own `mediaSave` reply is unfiltered. A birthday is picked up when the cache next turns over.
- **The phone**, for the repository's items: `clipsNow_` and `videosAll_` drop what `mediaAgeOk_` refuses. These are
  static files on GitHub Pages: **a determined viewer can read them** (and every item in `data/videos.json`), so for
  repository items the age hides them from the app, not from the internet. Something that must not reach a child goes
  in the sheet, where the server leaves it out.

A small badge says the age on a reel (top left) and on a video's picture when it is above 0 (`.media-age-badge`).

## Checked

- `js/check-media-age.js` (check-all), the real doPost/doGet: "12+" and "PG" saved as 12 and blank; a ten-year-old
  student sees only the unrated reel and gets the rest as veils (957cb7b5 for the rated repository Short); a student with
  no date of birth and a signed-out visitor see 12 and under; a sixteen-year-old not the 18 video; a client with no date
  of birth and the admin (date of birth nine) see all, the admin with ages; each viewer asked twice, the second from the
  kept body. Mutations: the `age > most` test removed, and unknown age taken as adult, each turned it red.
- check-flow: *a ten-year-old student sees no 12+ reel or video, an unknown-age student or nobody sees 12 and under, an
  adult and the admin see all with an age badge* — the Reels column as drawn and `videosAll_`, a veil hiding the
  repository Short, the 15+ badge, the admin's list saying 15+. Mutations: `mediaAgeOk_` always true, and unknown age
  as adult, each turned it red.

Deploy: backend changed — all four stamps `2026-10-24-d-media-age`; CSS `2026-10-24-f-media-age`.
