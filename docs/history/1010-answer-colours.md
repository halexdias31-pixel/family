# 1010 — every answer in a menu wears its own colour

Owner screenshot: under Maths, "Past paper" and "Worksheet" were both lime. `TAG_OF` gave each FACET one
colour, so every answer of a menu matched (health's `tag-colour` found 82 such menus).

Decision: one data-free rule. `tagOf_(field, value)` = `h` + (the answer's place in that facet's full,
`answerCmp_`-sorted answer list) mod `TAG_HUES` (12). The same call colours menu answers, picked chips and
card tag words, so a chip keeps its answer's colour. The palette is `--hue-0..11` on `:root`; health's
`tag-colour` also checks each against `--bg` (≥ 3:1). "Doesn't matter" and "Any …" chips stay neutral.
`TAG_OF` and the `--tag-*` kind rules went; check-css/bible/projects/funnel now check the hue rule.
Known limit: a facet with more than 12 answers wraps, so answers 12 apart share a hue.
