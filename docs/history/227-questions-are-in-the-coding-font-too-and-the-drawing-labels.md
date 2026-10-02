## Questions are in the coding font too, and the drawing labels deliberately are not

**Reported as "The text for questions is still that qwirky text. Should be the coding font
universally for whole site."** `.qsheet`, `.qans-body` (the mark scheme) and `.qp-ans-in` (the answer
box) set Georgia themselves, which beat `--font`. All three are `var(--font)` now, and so is the
printed quiz, whose three text sizes went down a point because monospace is about a quarter wider and
at the old sizes one quiz spilled onto a second sheet.

**The labels inside a drawing stay serif**, and the note above `.qsheet .lbl` in style.css is why:
every drawing was laid out against serif metrics, and in the coding font 183 labels are cut off at
the edge of their own picture. Measured again on this change before it was kept. The flyer's
"Elegant" style and the cheat sheet keep their own faces: they are printed designs with fixed slots.
