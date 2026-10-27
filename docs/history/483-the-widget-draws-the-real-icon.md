# 483 — The widget draws the real icon, bit for bit what the screen gets; the drawings are gone

Two branches changed the e-ink widget at once: 482 made it the screen's real 200x200 1-bit panel (`einkPage_`, verse.cpp's
layout and fonts), and 479 replaced the drawn icons with their public-domain artwork, dithered to 1 bit, for the old
800x600 layout. Merged: 482's square panel wins on layout; 479's images win on what an icon is.

## One bitmap, two readers

`make-icons.js` reduces each icon to 120x160 at 1 bit for `pictures.h`, and now writes that same bitmap as
`data/icons/120/<id>.png` (1-bit grey). The widget draws that PNG pixel for pixel at (40, 4) — no scaling, threshold at
mid-grey — so the widget is the device. A contact sheet of every icon found 0 pixels different from the PNGs.

The 640x504 PNGs from 479 are gone (1,775,932 bytes); the 72 small ones are 159,147 bytes. A 120x160 1-bit PNG reads back
exactly, so once made it is the icon's source: re-running `make-icons.js` without the originals writes the same
`pictures.h` byte for byte. To redo a reduction, put the original back at `data/icons/<id>.png` and re-run.

## No drawings

The owner, on the nine fallback line drawings: "Don't use those abstract recreations, delete them." `icon-svgs.js` and
`fallbacks.json` are deleted; the nine icons with no public-domain copy (elaiovrytissa, vimatarissa, fovera_prostasia,
evangelistria_tinos, soumela, myrtidiotissa, chozoviotissa, ekatontapyliani, malevi) left `data/icons.json` and
`pictures.h`: 72 icons. One comes back only with a real image. verse.cpp's verse list into `data/eink-verses.json`, which
icon-svgs.js also did, is now `tools/epaper-verse/verses.js`.

## The check

`check-eink` decodes every `data/icons/120/<id>.png` and every `PIC_k` of `pictures.h` and requires them equal, in
`data/icons.json` order; every icon needs its Commons public-domain source, and no row carries an `svg`. The firmware was
rebuilt with the new `pictures.h` (build.sh; `PIO_JOBS` may limit its parallel jobs — an unlimited build was killed for memory).
