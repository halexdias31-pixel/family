# 1100 — frozen code deleted (first cut: the OFF files)

The owner (docs/philosophy.md "How we work"): only Find, Library, Questions, Settings and Bookings
matter; unused code is deleted and git history is the attic. Restore anything below from **c9b8d2f**:
`git checkout c9b8d2f -- <path>`, then put the stem back in `index.html`'s FILES/LATER/OFF lists and in
`data/settings/tiers.json` (`files`, `widgetFiles`, `later`, `lazy`), and run `node tools/tiers.js`.

## Deleted files (restore from c9b8d2f)

- `js/board.js` — the whiteboard widget
- `js/ink.js` — the whiteboard's pen
- `js/flyer.js` — the admin's flyer maker
- `js/poster.js` — the poster planner
- `js/pixel.js` — the pixel editor
- `js/spotify.js` — the Spotify widget
- `js/rewrite.js` — the Rewrite coach
- `js/favlinks.js` — favourite links

These were every file in `window.OFF`: never fetched, their widgets already "Coming soon".

## Also removed (same commit, restore from c9b8d2f)

- Their CSS blocks in `style.css` (`.fm-`, `.fly-`, `.nb-`, `.pst-`, `.pxe-`, `.fav-` rules).
- Their journeys: the whiteboard checks in `check/flow/04-finger-whiteboard.js` and `22-signed-edges.js`,
  the flyer check in `07-column-keeps.js`, Spotify and the Rewrite coach in `27-layout-settings.js`,
  the poster/pixel check in `28-admin-widget.js`.
- Their entries in `js/check-drafts.js`, `js/check-strings.js`, `structure-budgets.json`, `one-place.json`.
- Guarded calls `boardHold_` (shell-boot.js), `boardWhoChanged_` (me-account.js), `flyBrand` (mat.js).

## Kept

- The widget rows in `js/map.js` (`flyers`, `whiteboard`, `spotify`, `rewrite`, `poster`, `pixel`,
  `favlinks`): `tiers.json` marks them off, so they draw as "Coming soon" from data; their `start`
  reaches `window.*` so nothing undeclared is named.
- The backend handlers `favLinksSave`, `rewriteIdeas`, `rewriteCheck`: a backend change needs a redeploy
  and version bump, so they stay with a reason in `js/check-actions.js` until the backend is next tidied.

## Not deleted yet, and why

The other frozen stems (games, racer, chess, mat, mechanics, chemistry, posts, overworld, arcade, the
library text readers…) are tangled with kept code: `games.js` holds the calculator (`initMiniCalc`,
`calcFit_`) and `SWIPE`; mechanics/chemistry feed Find's cards and bundles; `posts` is the home column.
Each needs its shared pieces moved out first — a later cut, one stem at a time.
