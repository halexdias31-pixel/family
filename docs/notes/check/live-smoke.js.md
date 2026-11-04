# check/live-smoke.js

The full text of comments in `check/live-smoke.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check/live-smoke.js THE LIVE SITE, SIGNED OUT, AT A PHONE AND A DESK (780).

top level, before `fs`

```
/* @family. — check/live-smoke.js THE LIVE SITE, SIGNED OUT, AT A PHONE AND A DESK (780).
   Loads LIVE_URL (default https://atfamily.co.uk/) at 390 and 1440 px, waits for the payload, goes to every column in
   TABS (admin ones are not there signed out), and fails on any console error, page error or failed same-origin request.
   EXPECT_CSS="…" also fails when the live --css-version is not that one (a deploy that did not land). --shots=DIR writes PNGs.
   Read-only: it signs nobody in and posts nothing. Used by .github/workflows/live.yml. */
```

