# js/check-diagram-png.js

The full text of comments in `js/check-diagram-png.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### node js/check-diagram-png.js — EVERY DRAWING IN THE LIBRARY HAS ITS PNG TWIN, AND EVERY TWIN A DRAWING

top level, before `fs`

```
/* ==================================================================================================
   node js/check-diagram-png.js — EVERY DRAWING IN THE LIBRARY HAS ITS PNG TWIN, AND EVERY TWIN A DRAWING

   THE OWNER, 18 OCT: *"So each question As is on site."* — *"No jpgs."* The Sunday email prints a question's
   picture as an <img> of `data/diagrams/<hash>.png` on the site (`digestDiagram_`, backend/digest.gs),
   because Gmail and Yahoo Mail show no SVG. The PNGs are written by `tools/diagram_png.js`, which is run by
   hand — so a drawing added or changed without running it is an email with a broken picture in it, found
   by a parent on a Sunday night. This finds it first, in a second, without a browser:

     1. EVERY `diagram` in data/questions.json has `data/diagrams/<first 12 hex of its SHA-256>.png`, a real
        PNG as wide as the drawing at 1x or 2x (a file that is not one, or is some other drawing's size, is
        a picture that will not show or will show wrong);
     2. NO PNG THERE IS ORPHANED — a twin of no drawing is weight on every clone and on the site for nobody
        (the tool removes them; this is red until it has);
     3. THE BACKEND NAMES A DRAWING AS THE TOOL DOES — `digestDiagram_` run over every drawing through the
        real backend, its `src` the site's address, the hashed name, the drawing's width and its
        `aria-label` as the alt text. Two spellings of one name is the drift CLAUDE.md keeps writing about.

   Exits non-zero on any of them, and when it cannot read what it checks.
================================================================================================== */
```

