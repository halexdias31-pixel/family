# tools/diagram_png.js

The full text of comments in `tools/diagram_png.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — tools/diagram_png.js THE PNG TWIN OF EVERY DRAWING IN THE LIBRARY, FOR THE SUNDAY EMAIL

top level, before `fs`

```
/* ==================================================================================================
   @family. — tools/diagram_png.js   THE PNG TWIN OF EVERY DRAWING IN THE LIBRARY, FOR THE SUNDAY EMAIL

   THE OWNER, 18 OCT: *"So each question As is on site."* — and, of the version before it, *"No jpgs."*:
   the pictures in the body of the email, never attached. A question's picture is an inline SVG in the
   library's `diagram` cell (data/questions.json), drawn by the tools here and inked by the site's CSS in
   `currentColor` — and Gmail and Yahoo Mail show no SVG at all. So every drawing has a PNG twin in the
   repository, which the email links to on the site (`digestDiagram_`, backend/digest.gs):

     data/diagrams/<the first 12 hex digits of the SHA-256 of the drawing's text>.png

   NAMED BY WHAT IT DRAWS. A drawing that changes is a new file, so an email already in an inbox keeps the
   picture it was sent with; the same drawing under two questions is one file. The backend works the same
   name out with `Utilities.computeDigest` over the same text, so nothing maps one to the other.

   DRAWN AS THE SITE DRAWS IT, ON PAPER. Chromium (Playwright) with the site's own style.css, the drawing in
   the card's own wrapper (`.qcard.qfig > .qsheet > figure`, so the figure-ink rules — `.lbl`, `.num`,
   `.axis`, `.grid`… — are the ones deciding), and `currentColor` set to the PAPER palette: `--paper-ink` on
   `--paper`, warm ink on cream, as everything standing in for paper is (CLAUDE.md, "two palettes"). There
   is no question print sheet any more to copy (style.css, "THE PAPER PAGE WAS HERE"); the paper tokens are
   what a printed figure would be. At the drawing's own width (its viewBox's), at 2x for a sharp picture on
   a phone, which is the width the email states, so the image is never scaled up.

     node tools/diagram_png.js              every drawing that has no twin yet; twins of no drawing removed
     node tools/diagram_png.js --force      every drawing drawn again
     node tools/diagram_png.js --scale=1    at 1x (the size check below said 2x was too heavy)

   RUN IT AFTER ANY CHANGE TO A `diagram` CELL — `node js/check-diagram-png.js` fails on a drawing with no
   twin and on a twin with no drawing, so a forgotten run is red, not a broken picture in somebody's inbox.
================================================================================================== */
```

