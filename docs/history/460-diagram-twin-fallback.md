# 460 — A question with no inline drawing shows its PNG twin

Import files of the library's words carried every drawing as inline SVG, which made them large (one KS2 file was 77 KB
for a single item). Every drawing already has a public PNG twin in `data/diagrams/` (351), so the words need not carry it.

- **The card points at its twin.** `tools/diagram_png.js` now writes `diagram_twin` (12 hex of the SVG's SHA-256, the
  twin's name) and `diagram_twin_wh` ("WxH" in CSS px, from the PNG at its scale) onto every row of
  `data/questions.json` whose drawing it can see; a row with no words in this clone keeps what it has. 1558 cards point
  at their twin. The twins are public already, so nothing private is added (check-secrets stays green).
- **The site falls back to it.** `libQuestion_` (library.js) takes `libTwinSvg_(r)` when the row has no inline
  `diagram` and none is on its way (`libHasField_`): an `<svg class="qtwin">` holding one `<image href="data/diagrams/<twin>.png">`
  at the drawing's own size, `role="img"`. Wrapping it in an svg rather than a bare `<img>` keeps every path that
  handles a figure — the figure box, tap to zoom, the pen surface laid over it, the measuring tools — working unchanged.
  The alt is "Figure": the drawing's aria-label lives in the private SVG, so it is not copied into the public card.
- **qtypes** counts a twin as the part's own figure (`qtFigureOf_`); check-answerable does not skip a pending row with one.
- **The backend needed no change.** The Drive import (`libDriveApply_`) merges per field: a field absent from an item
  keeps the Ledger's value, and only `null` deletes it. So a text-only import never blanks a drawing already in the Ledger.
  (`libImport_`, the token route `lib-private push` uses, sends whole rows from data-private and stays whole-row.)
- Journey: "a twin only" in js/check-flow.js strips a typed and a drawn part's drawing and asks for the twin in the
  figure, the zoom sheet and under the pen.

The KS2 SATs files 06–12 were rewritten text-only: 238 items, 43 drawings dropped (every one had its twin), none kept,
re-chunked to four files under 26 KB.
