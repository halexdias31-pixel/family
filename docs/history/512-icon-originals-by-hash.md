# 512 — The icons' originals, pinned by hash

> "can't you just track the actual code information"

499 kept a 600px greyscale master of each of the 72 icons, but not the full-quality original it came from. The
owner wanted the true maximum-quality source preserved. The originals are 189 MB (two over 20 MB), far too big for a
public repo, so the repo keeps their *identity* instead: each row of `data/icons.json` carries

    original: {url, revision_url, timestamp, sha1, bytes, width, height, mime}

straight from the Commons API (`prop=imageinfo`, one batched query, no tracking query string). `sha1` is Commons' own
hash of the exact file, so the bytes can be fetched again at any time and proved bit for bit. `revision_url` is the
`archive/<h>/<hh>/<YYYYMMDDHHMMSS>!<name>` address MediaWiki moves this exact revision to if the file is ever
overwritten; until then `url` serves it.

`tools/epaper-verse/icon-originals.js`:
- `record` — ask the API again and rewrite `original` (one request at a time, back-off on 429).
- `verify [--out DIR]` — fetch every original, check sha1 and size; a change upstream is reported with the recorded
  revision's archive URL; `--out` keeps the files (a backup copy; not committed).
- `masters --from DIR` — remake `data/icons/master/<id>.jpg` from verified originals (ImageMagick: greyscale, 600px,
  best JPEG quality under 80 KB).

check-eink (no network): every row has an `original` with a 40-hex sha1, https url and revision_url, bytes, width and
timestamp. The full files were downloaded and verified once for an off-repo backup (the owner's Google Drive).
