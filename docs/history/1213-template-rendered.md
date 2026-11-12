# 1213 — the one template, measured as rendered (12 Nov)

Owner: "I still see cards quite often that don't follow the same rules as other cards with the template. Optimise the optimizer to catch ANY irregular rules."

`one-template` counted builder calls in source (168/168) and so could not see what the page draws. `tools/template-health.js` drives the app in Chromium as admin, tutor, parent, pupil and signed-out at 390 and 820, visits every screen (up to six pages each), every Find door and every card kind behind it (3 sampled per kind and part), an empty result and the loading and error states. `check/template-measure.js` reads each card's computed shape: parts in order, real picture, pill tags, no title line, one row of round tiles last and centred, no stray buttons, width, tokens for font/colour/radius/spacing, inline styles; plus `tpl-same` (one tag font, tile size and padding per width) and the variety rules. Anything that stands in a Find pane as a card without being one is measured too — that is how the questions, the practical/lesson parts and the history fact pages showed up off the template.

Found first: 1191 cards, 451 findings. Fixed in one place each:
- parts (practical, project, lesson, history facts) go through `card_` (`partCard_`, find-boxers.js);
- a card's row keeps its four tiles; groups joined after them (your own, the admin's Start here) go behind ⋯ (`tileRowsJoin_`);
- the dots between a profile's words use `--ink`, not a mixed colour.
After: 1180 cards, 127 findings. Remaining by kind in data/template-health.json (`byKind`); screenshots in check/shots/template/ (git-ignored).

Exceptions need an owner decision: data/settings/template-exceptions.json (the reel player; a widget's own controls).
