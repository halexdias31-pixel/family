# 640 — A video goes with its frames

Owner, 2 November: attach screen recordings from an iPhone (.mov/.mp4) to Suggest a change, so Claude can see problems that
happen over time.

## What already worked

Files for Claude (515, 547) takes any type: each file goes in 8 MiB parts (about 11 MB base64, under Apps Script's 50 MB a
request) to a Drive resumable session opened by `inboxPart_` (content.gs), up to 500 MB (`REP_FILE_MAX`, `INBOX_FILE_MAX`).
A video already went end to end; it was only reachable from Add files, which on iPhone opens Files, not the camera roll.

## What changed (submit.js only, so no backend stamps)

- The admin's picture picker is `accept="image/*,video/*"` and its tile is "Add a picture or video". A video chosen there joins
  the admin's file list (`repFilesAdd_`) instead of becoming the note's picture. A non-admin's picker stays `image/*`: there is
  no Drive route for them.
- **Claude cannot watch video**: the Drive connector gives OCR text or whole-file base64, and a 50 MB file does not fit. So when
  a video is added, the phone makes frames at once (`repVideoFrames_`): a `<video>` seeked every 0.5 s, or spread over the
  whole length past 12 s, at most 24 frames; 12 to a sheet, 4 across, 1280 px wide, each stamped `m:ss.d`; each sheet a JPEG
  under 150 KB (`repJpeg_` lowers quality, then size), plus a 640 px `.small.jpg` of the first frame, as pictures get (600).
- After the video is sent, `repFramesSend_` uploads `<name>.frames-1.jpg`, `-2`… and `<name>.small.jpg` beside it, each one part.
- The box shows one tile row per video: "video attached · making its frames" with `loading_()` dots, then "N frames on M
  sheets", or "no frames: <why>. The video still goes." A failure never stops the video.

## Where they land

Drive › Claude inbox › `Files YYYY-MM-DD HHMM` (the batch) › `IMG_0001.MOV`, `IMG_0001.frames-1.jpg`, `IMG_0001.frames-2.jpg`,
`IMG_0001.small.jpg`. The note in Notes for Claude names the batch folder and the video. A session reads the `.frames-N.jpg`.

## Caveat

Desktop Chromium cannot decode most iPhone HEVC `.mov` files; Safari on the iPhone can, which is where the owner records. Where
the browser cannot play it, the box says so and the video still goes.

Check: check-flow "Suggest a change takes a video from the camera roll…" — jsdom with a stubbed `<video>` and canvas (jsdom
plays no video).
