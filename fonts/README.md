This directory holds one web font and the licence it is distributed under.

family-code.woff2
    Cascadia Mono, by Microsoft — the typeface Visual Studio Code and Windows Terminal ship with.
    The MONO cut, which is Cascadia Code without the programming ligatures: on this site a
    ligature would silently turn "<=" or "->" inside a GCSE maths answer into one glyph, which is
    the class of fault this repository refuses everywhere else.

    MODIFIED, and the modification is why it is not called Cascadia. It is the VARIABLE font
    (weight 200-700, so every weight this stylesheet asks for comes out of one file) subset to the
    characters this site actually renders plus whole blocks of headroom — Latin-1, Latin Extended-A,
    Greek, punctuation, super- and subscripts, currency, arrows, maths operators and geometric
    shapes. 210,484 bytes to 53,836, with 699 glyphs and the weight axis intact.

    The SIL Open Font License reserves the name "Cascadia Code", and subsetting deletes components,
    which makes this a Modified Version under section 3. So the family is renamed to "Family Code"
    in the font's own name table, as that section requires. Nothing about the letterforms changed.

    Rebuilt by: take woff2/CascadiaMono.woff2 out of the microsoft/cascadia-code release, run
    pyftsubset over it with the ranges above, then rewrite name IDs 1, 3, 4, 6, 16 and 21.

OFL.txt
    The licence, verbatim, as section 2 of it requires to travel with the font.

