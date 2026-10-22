## 394 — Read aloud on every primary question (2026-10-22)

**Asked for as** "There should be a tile for all questions KS1, KS2, SATs level, whatever, where it reads
out the questions to you."

**What it is.** A **Read aloud** tile (the speaker mark, `speak`) in the tile row under every question
whose level is primary, and under a content card of that level. Tap it and the browser's own voice
(`speechSynthesis`) reads the question; tap again and it stops. While it reads the tile is on
(`.on`, `aria-pressed="true"`, "Stop reading"). It is not drawn at all where the browser has no
`speechSynthesis`.

**Which questions.** `readAloudFor_(x)` in `js/find.js`: the SATs level by `levelOf_` (so `KS1`, `KS2`,
`KS1 SATs`, `KS2 SATs`, and a row with no level whose key stage is KS1/KS2 through `ksFallback_`), or a
school year 1 to 6 whatever the level cell says. The second clause catches 20 Corbettmaths year 5/6 rows
whose level cell says GCSE. On today's library that is **1,765 questions**: 357 STA SATs parts (KS1 67,
KS2 290), 1,358 Corbettmaths primary parts and 50 older KS2 rows with no publisher. Of the content cards,
the KS2 Maths chapters get it. No 1st Class Maths row is primary: their 1–5 bands are GCSE grades.

**What it says** (`readAloudLines_`), in the card's own order (`partChunks_`): a stem carried onto the
card, the lead, the part's words, then "Look at the picture." where a figure stands (or once, if the
figure is behind the Figure tile). After that the options as "A: …", "B: …" (with "Choose 2." first when
two are wanted), the cards of an ordering unless the words already list them, and "Give 2 answers." for a
multi-box answer. It never reads the answer, the mark scheme, the marks or the dotted answer line. A
content card reads its title, then its key words, formulas and points.

**Maths into words** (`speakLines_`, `sayLine_`): a set fraction `<sup>3</sup>⁄<sub>4</sub>` is "three
quarters" up to twelfths (and hundredths and thousandths), anything else is "17 over 40", and a mixed
number is "2 and three eighths". A box in a fraction is "how many twelfths". Then × ÷ + − = < > ≤ ≥ are
said as words, a sum ending "=" is "equals what?", a box is "box", ² ³ are "squared" and "cubed" (or
"square" and "cubic" before a unit), √ is "the square root of", £1.50 is "1 pound 50" and £0.70 "70 pence",
% is "percent", 0.7 is "0 point 7", 10:15 is "10 15" and 3:00 "3 o'clock", am/pm are "a.m."/"p.m.", a
ratio 2:3 is "2 to 3", °C is "degrees Celsius", and cm, mm, km, g, kg, ml, l after a number are said in
full. Examples from the real rows:

- Q-STA-KS2-2024-P1-28: "2 and three eighths minus five eighths equals what?"
- Q-STA-KS2-2024-P3-16: "Three fifths is less than how many hundredths is less than 0 point 7."
- Q-STA-KS2-2024-P2-2: "… He pays with a 2 pounds coin. He gets 1 pound 50 change." / "Choose 2." / "A: Banana." …
- Q-STA-KS2-2024-P3-2: "The temperature in a freezer is minus 40 degrees Celsius. …"

**The voice is shared.** `canSay_`, `hush_` and `say_` in `js/shell.js` are what Imposter's Listen
already did (en-GB `lang` as well as an en-GB `voice`, because Chrome hands back no voices until its list
has loaded). `impSay_` now calls `say_` at volume 0.6; the question reads at rate 0.85, a little slower for
children.

**iPhone Safari and Chrome.** Every line is queued inside the tap's own handler, because Safari speaks
only from a user gesture. Each line is its own utterance, because Chrome cuts a long utterance off after
about fifteen seconds.

**When it stops.** On a second tap; when another question's tile is tapped (the first is hushed); and
when the page or the column changes. `placeCells` calls `readAloudStray_`, which compares `AT` and
`PAGE[AT]` with where the tap was. Highlighting the sentence being read was left out. The spoken text is
rewritten (fractions, signs), so it no longer lines up with the drawn markup, and the payoff was small.

**Checked by** the check-flow journey "read aloud: a KS2 question has the tile and a GCSE one does not…".
It stubs `speechSynthesis` and checks: the tile on Q-STA-KS2-2024-P1-28 and on the KS2 content card; no
tile on a GCSE question or a GCSE content card; the exact text and the British voice at a rate below 1;
the playing state; a second tap that only cancels; the shop question's table, money and options with no
marks; a stop on going to another column; seven real KS2 rows' first lines word for word; and no tile
with no `speechSynthesis`. A mutation that makes every question primary, or one that takes the hook out of
`placeCells`, fails it.
