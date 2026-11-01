# 542 — Chrome keeps clear of the phone's own bands, and the admin dot has a fingertip's reach (package K)

**Asked:** the polish pass (531; owner: *"feels so stable, like iOS made it"*), rule U19: *chrome obeys the same
rules* — fixed and sticky furniture offsets by `var(--safe-*)`, and a control outside `#screen` meets the tap
floor and the press rules like any control inside a column. The owner said yes to D1-D16 as proposed; none of
them is about this package, which changes no decision, only where two boxes sit.

## What was wrong

- **The Business dot** (`#biz-dot`, records.js `bizNeedsPaint_`, 400) was `position: fixed; top: 10px; right:
  10px`, 24 x 24. On an iPhone with a notch the top 47px belong to the status bar: a tap there is the phone's
  (scroll to top, the clock), not the app's, and the dot sat wholly inside it. Turned sideways, its right edge
  sat in the 47px beside the notch. And it was 24px across, under the 44px floor, but no check ever measured
  it: `check/ui.js` measured the column in front, the sheet and the keypad, and the dot lives on `<body>`.
- **`.pad-sizes`** (`?pen=sizes`, the debugging line of pen widths) sat at `left: 8px; bottom: 8px`, under the
  home bar. It takes no taps, so it only hid behind the bar, but it was the second fixed box with a bare edge.

Every other fixed box already offset by its edge's safe inset, or spans the axis (`#banner`, the full-screen
video), or is centred (`#toast`, `#reconnect`), or is the keypad (`#kp`, whose own padding adds the home bar).

## What changed

- `.biz-dot` — `top: calc(10px + var(--safe-top))`, `right: calc(10px + var(--safe-right))`; a
  `::before { inset: -10px }` grows the 24px dot to a 44px target without drawing a bigger dot, and its reach
  stops exactly at the safe edge. The press look stays package E's.
- `.pad-sizes` — `left`/`bottom` add `var(--safe-left)`/`var(--safe-bottom)`, and its width cap both sides.
- `--css-version` `2026-11-01-k-safe-chrome`.

## The checks

- **`js/check-surfaces.js`, static** — for every `FIXED_OK` selector that is `position: fixed`, every edge it
  sets by a length must contain `var(--safe-*)`. A `0` passes when the opposite edge is also `0` (it spans the
  axis) or its padding on that side carries the inset (`#kp`); `50%` and `auto` pass (centred). `.pad-loupe`
  is the one exemption, with its reason: its `top/left: 0` is the origin its transform moves to the finger.
  Values are split on spaces outside brackets, because `calc(8px + var(--safe-bottom))` is one value. It prints
  how many fixed boxes it asked, and fails if none. Proven: the base stylesheet gives four findings
  (`.biz-dot` top and right, `.pad-sizes` left and bottom), red; this one, green.
- **`check/ui.js`** —
  - *the chrome* — every body-level box outside `#screen`, `#sheet` and `#kp` is added to the measured list, so
    the dot, the banner, the toast and the reconnect line meet the tap, name, contrast and sideways rules.
  - *a control's reach* (`reach_`) — the tap size is the box grown by an empty, unpainted, absolutely placed
    `::before`/`::after` that takes pointer events: the way `.biz-dot` and `.kp-handle` reach 44px. The same
    reach is not sideways overflow (it is nobody's content and does not scroll).
  - *the bands* — on every screen state, for one layout, `--safe-*` is forced to an iPhone's insets (upright
    47 top / 34 bottom; on a landscape size 47 left / 47 right / 21 bottom), with transitions off so nothing
    glides; every control inside a fixed box must keep its reach out of every band. Laid out again with
    transitions still off before they come back, so the next measurement is not mid-glide. It prints how many
    fixed boxes it met.
  - Proven on `--screen=biz` with the base stylesheet: `A CONTROL IN THE PHONE'S OWN BAND (542)` five times
    (top band at 320/390/768, right band at 1280/1920) and `.biz-dot` 24x24 as a tap target; with this one,
    neither.
- **`check/states.js`** — `biz · the Business dot`: an admin with three things needing them
  (`bizNeed_('check-542', 3, …)`), so the dot is drawn whatever the fixture holds; put back on leave.

## Not done here

- Section 4 of the plan lists *content caps use svh, only #screen/body dvh, no plain vh* under this package's
  letter, but the package's own section does not; converting the `dvh` caps changes heights on every card and
  is left for whoever owns the pane cap.
- The 36px `.tile` targets `check/ui.js` reports are the zoom ladder's and tile floor's (package B, D3), red on
  the base before this package as after it.
