# js/check-answerable.js

The full text of comments in `js/check-answerable.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-answerable.js EVERY QUESTION PART IN THE LIBRARY CAN BE ANSWERED (457).

top level, before `fs`

```
/* @family. — check-answerable.js EVERY QUESTION PART IN THE LIBRARY CAN BE ANSWERED (457).
   The whole library (check/lib-full.js), each part drawn by the app's own builders in a real DOM, and asked:
     words     the page says something: words, a figure or a table, never "words are missing"
     figures   every drawing has a size (a viewBox or width and height), every picture a source
     zoom      the card's row has Zoom and the padlock; every figure off the pen is a tap to zoom; every stem page has Zoom
     control   an answer control that fits the part's type (qtypes.js): a box, options, items, cells, a sheet, or the pen
     self      the marker gives the row's own answer full marks, and an obviously wrong one none
     pen       a drawn part has the pen with its Ruler and Compass
     parts     every part's `uses` names a part of the same question; every page of every part draws without throwing
     insert    a paper part whose words send you to an insert or a formulae sheet has an Insert tile
   Overflow at 320px is check/cards.js's (a browser's layout, not jsdom's). A pending row with no words here is skipped (411).
   Flags: --id=<row_id> one part, with its card printed. Prints counts; a failure lists each with its row id. */
```

