## The A ∩ B splash is three regions of a GCSE Venn diagram, shaded in turn

**Asked for as "refine the A n B animation".** It was two tinted circles sliding together while a
flat cream patch lit in the middle, under an "A ∩ B" that never changed — one fact, drawn once.
`tools/venn.py` now writes both the `<div id="splash-venn">` and its rules, from one table of
geometry and one timeline; edit the table and re-run it, as with `galton.py`.

**What it draws, in a 10s loop**: ξ, the universal set, is always there. A slides in from the left
and B from the right. Then A ∩ B, A ∪ B and A′ are shaded in turn, each with its notation
underneath, and the circles slide back out. The loop starts and ends on the same empty ξ, so there
is no seam.

**Shaded with a hatch**, because that is how a region is shaded by hand. The hatch drifts sideways
by exactly one line spacing per turn of its own 1.6s loop, so a held region still moves: `npm run
splash -- is-venn` reports 46 of 46 frames moving over a full loop and its boundary. Only `transform`
and `opacity` move. Each region is a `clipPath` over one shared hatch `<path>` (`<use>`), and the
three paths are worked out from the circles: the lens, the union, and ξ with A cut out (`evenodd`).

**Two things a screenshot changed.**
- **Staggered fades blanked the lens.** Fading A ∩ B out before A ∪ B came in left the lens nearly
  unshaded between them, and the lens is the one area both shade. Each pair of regions now
  crossfades over the same half second.
- **Two captions overlapped.** With the crossfade, "A ∩ B" and "A ∪ B" printed through each other
  in one cell. A caption now stops at the middle of the crossfade and the next starts there; the
  script asserts no two captions overlap.

The circles are outlines only. Tinted circles gave the lens a third colour where they crossed, so
under A′ (which leaves the lens unshaded) it looked shaded in something else. ξ and the letters have
a stroke of the page's black painted under them (`paint-order: stroke`), so a hatch line does not
run through a glyph.

**Reduced motion** is the base styles with every animation off: circles in place, A ∩ B shaded and
named. `.vn-r:not(.vn-r-and)` says that in one rule, so it is not two rules at one specificity
settled by file order. The `.vn-a, .vn-b, .vn-both` entries left the shared reduced-motion list.

**A review found three more, all on screenshots, and fixed them in `tools/venn.py`.**
- **The hatch poked out past ξ's corners.** The box had `rx="4"` and A′'s clip is a plain
  rectangle, so under A′ the hatch filled four square corners outside a rounded border. ξ is a plain
  rectangle now, which is also how a GCSE paper draws it.
- **ξ's own border was hatched over.** The box was drawn under the regions, so under A′ its edge
  read gold rather than as the edge of everything. It is drawn over the shading now, like the
  circles' outlines.
- **The notation was smaller than the letters on the circles.** At `1rem` the caption was 13.5px on
  a 320px phone under circle labels drawn at about 18. It is `1.3rem`.

What it costs on a fast load is the first second: the loop opens on an empty ξ with the circles
sliding in, and A ∩ B is first shaded and named at about 1.3s. That order is what was asked for.
