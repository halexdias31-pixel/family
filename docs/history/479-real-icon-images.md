# 479 — The e-ink icons are the real icons

The owner, after 470's drawings: "when i said make the drawings, i was imagining they would look exactly
like the icons. like exactly like them. not some abstract recreation. i thought you would have the pixel data."

## What changed

- Each icon's actual artwork was found on Wikimedia Commons (API search, then a pick of the canonical
  version: the Sinai Pantocrator, Rublev's Trinity, the Vladimir Theotokos, Feofan's Don icon, the Ustyug
  Annunciation, the Sinai Ladder ...). Only files Commons marks **Public domain** were used (one CC0 museum
  photo: Joy of All Who Sorrow). Each row of `data/icons.json` records `image_source` {file, licence, url};
  `data/icons-LICENSE.md` lists them all.
- Each was made e-ink: grayscale, auto-contrast (1% cut), a mild gamma lift (0.8) so faces do not drown,
  fitted to 640x504 (the widget's icon area on the 800x600 panel), light unsharp, Floyd–Steinberg to 1 bit.
  Stored as `data/icons/<id>.png` (1-bit PNG; 72 files, about 1.8 MB).
- `make-icons.js` builds `pictures.h` (the firmware's 120x160) from the same PNGs: scaled in Chromium, then
  dithered again to 1 bit. Rows without a PNG still raster their drawing.
- The widget draws `<img class="eink-pic">`. On a phone the 640-px image is shown smaller than its pixels, so
  the browser's smooth scaling is kept there (nearest-neighbour turned the dither into noise); at 1100px and
  up it is `image-rendering: pixelated`.
- The drawing (`svg`) stays only for icons with no public-domain copy, listed in
  `tools/epaper-verse/fallbacks.json`: elaiovrytissa, vimatarissa, fovera_prostasia, evangelistria_tinos,
  soumela, myrtidiotissa, chozoviotissa, ekatontapyliani, malevi (Commons has only CC BY-SA photos of these).
- `check-eink`: every icon has a 1-bit PNG (decoded: grey at 1 bit, no transparency, fits the area) with a
  public-domain source recorded, or is a listed fallback; nothing has both.

## Notes

- Commons rate-limits upload.wikimedia.org hard from shared IPs (429, retry-after 600). `commons.wikimedia.org/w/thumb.php?f=…&w=600`
  served the same thumbnails without the limit.
- St Nektarios is a photograph (he died 1920) and St Silouan a small icon file; both are PD on Commons.
