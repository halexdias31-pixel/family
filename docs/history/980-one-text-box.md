# 980 — one text box

Owner: every typing box should look and behave the same — question answer boxes (a cream pill),
Settings fields and the search box all differed.

Decision: the one look is the global `input, select, textarea` rule in style.css (screen tokens):
min-height max(44px, 2.9rem), radius `--r-sm`, 16px/1.3 `--font`, padding .7rem .75rem, `--sunk` on
`--line`, a gold edge on focus. The answer bar sits on the screen, not on paper, so its cream pill
(`--paper`, 26px radius, 52px, gold box-shadow ring) became that field: `.qp-bar > .qp-ans`,
`.qp-multi > .qp-ans`, `.gd-box .kp-field` take the same values, and `.kp-show` (the drawn answer) takes
16px/1.3 and the screen ink inside the bar. `.search` lost its own mono font, 999px radius and `#0a0a0a`
focus literal; `.search-pill` its 999px radius. The verdict rings (right/near) stay — a state, not a look.
Kept apart on purpose: the essay sheet's writing (`.qp-sheet .kp-essay`), whose line height is the
paper's ruling. The maker stays `fieldHtml` (me.js); a `field_` beside `tile_` was not needed for this.

Checks: tools/health.js variety family `textbox` (rules on a text box that set radius, background,
border or font to other values than the global rule; tickboxes drawn with `appearance: none` and
invisible inputs excluded) — 2 today (budget 2, ideal 1). tools/ux-health.js `boxLooks` measures the
drawn Find search, a question's answer box and a Settings field (height, radius, font, padding,
background, border); each mismatch is a `ux` finding. Measured after: all three 44px, 2px, 16px
Family Code, 11px padding, rgb(5,5,5) on rgb(35,35,35).
