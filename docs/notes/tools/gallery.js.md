# tools/gallery.js

The full text of comments in `tools/gallery.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — tools/gallery.js ONE OF EVERY CARD AND SCREEN, PHOTOGRAPHED, AND COMPARED WITH THE LAST APPROVED SET.

top level, before `chromium`

```
/* @family. — tools/gallery.js ONE OF EVERY CARD AND SCREEN, PHOTOGRAPHED, AND COMPARED WITH THE LAST APPROVED SET.
   A pupil, a parent, a tutor and an admin, at 390 and 820: every column screen, one card of each kind on it, every Find kind
   and question type, the empty, locked and oops cards. Each shot is compared pixel by pixel with the approved one; a changed
   card gets a side-by-side (approved | now | difference) and a line in report.md.

   node tools/gallery.js                    # shoot into <dir>/now, compare with <dir>/approved, write <dir>/report.md
   node tools/gallery.js --approve          # the shots just taken become the approved set
   node tools/gallery.js --dir=/some/where  # default: $GALLERY_DIR, else <os tmp>/family-gallery (never the repository)
   node tools/gallery.js --who=admin,tutor --width=390 --only=stuff   # a part of it
   Port: GALLERY_PORT (8761). Payload: check/fixture.json, the library with its words (check/lib-full.js). */
```

