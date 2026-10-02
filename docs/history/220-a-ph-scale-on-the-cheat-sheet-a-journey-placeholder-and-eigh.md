## A pH scale on the cheat sheet, a Journey placeholder, and eight Fibonacci squares

**"add ph indicator to cheat sheet"**: `M51` in js/mat.js, a Science piece two thirds wide. It is the
universal-indicator colours 0–14 with the number in each cell, acid / neutral / alkali under them,
strong and weak bands with the 10× rule for H⁺, and litmus, methyl orange and phenolphthalein in acid
and in alkali. The fills print because `.mat-ph` carries `print-color-adjust: exact`. It is named
"Acids, alkalis & indicators" because a piece's heading is set in capitals and "PH" is wrong. Its
slot is 42mm, and the overflow alarm stayed silent on the measured sheet.

**"make a journey widget to go in account settings… as a place holder"**: `journeyCard_` in me.js,
appended to the Settings column for a student and an admin. Nothing on it pretends to work. The one
live line counts the days to the exam dates the student already keeps on that column.

**"make fibonacci sequence animation smaller so can fit more of it in"**: `tools/fib.py` writes the
splash's squares and spiral from `F = [1,1,2,3,5,8,13,21]`. Eight squares at two units replace five
at eight. It tries each starting turn and corner, and keeps the first landscape layout whose arcs
meet end to end and are tangent at every joint. The ratio is 1.619, and the strokes are thinner in
proportion.
