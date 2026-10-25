# 448 — Chess on a laptop

The owner (25 Oct): "chess looks bad on my laptop" — a screenshot at about a 420px card: pieces of both
sides mid-grey, white ones lost on light squares, a glossy pool over the board, the status line floating.

- **Pieces:** the squares inherited the site's monospace, so the glyphs came from a fallback face (some drew
  hollow). The board now names a symbol face (`DejaVu Sans`, `Segoe UI Symbol`, …) with
  `font-variant-emoji: text`, and each side is a fill plus `-webkit-text-stroke` in the other side's colour
  (`paint-order: stroke fill`): near-white with a dark edge, near-black with a light edge.
- **Squares:** flat, from the board's own tokens, a muted classic pair (`--chess-light #d9c9a3`,
  `--chess-dark #8a6c48`). The radial "light" layer (429) is gone at rest; `::after` stays for the ending.
- **Size:** `width: min(100%, 70vh)` with `aspect-ratio: 1`, card and full screen. Full screen at 1280x800 had
  been 1248px square, taller than the window. Now 560 (1280x800), 630 (1440x900), 358 (390x844); 8 equal cells.
- **Status and tiles:** status in `var(--font)`, gold; the tile row centred under the board. The tiles are
  `tile_` as before (icon, the word in title/aria-label). The star in the screenshot's top strip is card
  furniture around a widget, not chess's markup, and was left alone.
