# js/check-manifest.js

The full text of comments in `js/check-manifest.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-manifest.js backend/files.json HAS TO NAME EVERY FILE IN backend/, AND NOTHING ELSE.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-manifest.js

   backend/files.json HAS TO NAME EVERY FILE IN backend/, AND NOTHING ELSE.

   WHY IT EXISTS. `sync.gs` pulls the backend into Apps Script from raw.githubusercontent.com, and a
   CDN cannot list a directory — it can only hand over a file you name. So the repo carries the list
   itself, in `backend/files.json`.

   A LIST KEPT BY HAND IS A LIST THAT GOES STALE, and this one goes stale silently in the direction
   that matters most: add a .gs, forget the manifest, and the next pull writes a project WITHOUT it.
   The Apps Script API replaces every file at once, so a name missing from the manifest is not a file
   left alone — it is a file deleted from the live backend. That is how this list, left unchecked,
   takes the site down.

   THE OTHER DIRECTION IS LOUD AND HARMLESS. A name in the manifest with no file behind it fails the
   download, `fetchBackend_` throws, and nothing is sent. Reported here anyway, because a check that
   only catches the dangerous half teaches you it catches everything.

   `files.json` IS NOT IN ITS OWN LIST. It is repo metadata telling `sync.gs` what to fetch, not a
   file the Apps Script project should contain — pushing it would put a stray `files` JSON into the
   editor next to the code.

     node js/check-manifest.js
================================================================================================== */
```

