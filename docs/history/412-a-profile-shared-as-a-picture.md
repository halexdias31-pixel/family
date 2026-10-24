# 412 — a tutor's profile, shared as a picture

The owner, after 400 gave every listed tutor a `?tutor=<handle>` link: *"When I asked to make profiles shareable I meant
it would share a PNG or something"* — to answer a parent on WhatsApp with a picture of the tutor, not a bare link.

## What Share does now

**Share** on a listed tutor's card and **Share my profile** on your own card on You (both `tutor-share`, posts.js) draw
the profile as a **1080×1350 PNG** (portrait, the size messaging and social apps show whole) and hand it over:

- `navigator.share({ files: [png], text: link })` when `navigator.canShare({ files })` says yes (iOS, Android);
- otherwise the PNG is downloaded and the link copied, and the toast says "Image saved · link copied" (or the link itself
  when the clipboard refuses);
- a browser with no canvas at all gets the old behaviour — the link alone (`tutorLinkOnly_`).

A press while a picture is being made is ignored (`TUTOR_PNG_BUSY`), and the toast says one is being made, as the
receipt's Share does.

## The picture

Drawn straight onto a `<canvas>` (`tutorPng_` → `tpngDraw_`) — no library and no HTML snapshot, unlike the receipt's
`rcPng_` (which clones live markup into an SVG foreignObject): a fixed card has nothing on the screen to copy, and the
same drawing works on a phone that never opened the card.

- **The palette is the stylesheet's.** `tpngTokens_` reads `--bg`, `--raised`, `--line`, `--ink`, `--dim`, `--gold`,
  `--paper`, `--paper-ink` and `--font` off `:root` with `getComputedStyle`, so a change of token changes the picture. The
  QR code sits on a `--paper` square in `--paper-ink`: it stands in for a printed sticker, and a camera wants dark on light.
- **The brand** — `brand('name')`, and `brand('logo_square')` / `logo_circle` in a circle when it loads.
- **The face** follows `personFace_`'s order: their photo (`pic()`, loaded with `crossOrigin = 'anonymous'` and tried on
  a 1px canvas first, so it can never taint the real one), else their figure or one of the ten as an SVG image (the page's
  `#av-clip` is stripped and the canvas does the circle), else their initial on `--raised`. If the finished canvas still
  will not export, it is drawn again with the initial and no logo.
- **The name is the server's public `title`** — the same string the card shows; nothing here builds a name. Under it the
  handle, the role and titles.
- **Pills**: the rate, the DBS check (`dbs`, already sent and until now read by nothing), and the first fact chip
  (experience). **A child's phone draws no rate** (398): `tpngRate_` asks `childView_()` exactly as the card's `prof-rate`
  does.
- **Their own line** (`description`), at most two lines; then **Teaches**, **Tutors at** and **Qualifications** — the card's
  own readers (`teachGroups_`, `profList_`, `qualsParts`), as many lines as fit above the footer. A long name goes onto two
  lines; a list breaks between items and cuts an item with "…"; nothing is drawn under the footer rule.
- **The footer**: the link printed (broken after `/ ? = &`) and a **QR code** of it.

## The QR encoder

`qr_(text)` (posts.js, ~90 lines): byte mode, error-correction level M, versions 1–10 (up to 213 bytes — a profile link is
about 50), all eight masks scored by the standard's four penalty rules. Checked while it was written against the Python
`qrcode` package (bit-for-bit the same matrix for the same version and mask, versions 1–10) and decoded by OpenCV, both
from the matrix and off the finished PNGs. A link too long for version 10 gets no QR; the printed link stays.

## Checks

- check-flow, new journey "Share on a tutor card (412)…": a recording canvas stands in for jsdom's missing one. A visitor
  on `?tutor=adatutor` → one `image/png` `File` and Ada's link to `navigator.share`, a 1080×1350 canvas, her name, handle,
  `£20/h` and TEACHES among the words drawn, her photo asked for with `crossOrigin`; no file sharing → a `.png` download,
  the link copied, "Image saved"; Sam (a Student) → the picture drawn with no `£` or `/h` anywhere, and a photo that will
  not load drawn as the initial.
- The 400 journey's "Share my profile" now asserts the admin's own link arrives with a picture, not in a toast.
- Screenshots of three real PNGs from Chromium (visitor with a figure; a long name, long bio, a photo and eight subjects;
  a child) were looked at and the layout fixed from them: the second teaches line ran under the footer rule (the room
  sum was wrong), a long name was cut with "…" (now two lines), the bio took the room the qualifications needed (now two
  lines), "Tutors at" moved above Qualifications.

No CSS changed; no backend change, so no stamps.
