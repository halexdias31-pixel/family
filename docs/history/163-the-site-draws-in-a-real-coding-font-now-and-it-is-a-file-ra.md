## The site draws in a real coding font now, and it is a file rather than a hope

**Reported as "I don't like the site font. I prefer that coding font. Like visual studios code font.
Idk what it's called. This is universal so I imagine you just have to change the font name in one
place."** The last sentence is right, and the first one needed measuring, because the site was
ALREADY a monospace stack: `ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace`.

**ON AN iPHONE THAT RESOLVES TO SF MONO**, which is a coding font and is also the one the phone
would have picked by itself — so the site read as a system default rather than as something with a
face of its own. **A stack can only ever ask; it cannot decide.** Every `font-family` in the
stylesheet is `var(--font)` or `var(--mono)`, so there was nothing overriding it and nothing broken
to find: the complaint was about which font, not about whether one applied.

**`fonts/family-code.woff2` IS CASCADIA MONO**, which is the typeface Visual Studio Code and Windows
Terminal ship with — and it is the MONO cut deliberately: Cascadia Code's programming ligatures
would turn `<=` or `->` inside a GCSE maths answer into a single glyph, which is the class of fault
this repository refuses everywhere else. One line in the stylesheet swaps to the ligature cut.

| | |
|---|---|
| **the variable font** | `wght` 200–700, so all six weights this stylesheet asks for come out of one file. Two static cuts would have been 306KB for two of those six |
| **subset** | 210,484 bytes → **53,836**, a quarter, with 699 glyphs and the axis intact |
| **what it keeps** | the 247 distinct characters the site renders were COUNTED — every file in `js/`, the stylesheet, `index.html` and every `data/` file the app fetches, of which 151 are not ASCII — then kept with whole blocks of headroom: Latin-1, Latin Extended-A, Greek, punctuation, super- and subscripts, currency, arrows, maths operators, technical and geometric shapes |

**RENAMED, AND THAT IS A LICENCE REQUIREMENT RATHER THAN A PREFERENCE.** The SIL Open Font License
reserves the name "Cascadia Code", and subsetting DELETES components, which makes this a Modified
Version under section 3 — so the family is renamed to `Family Code` in the font's own name table, as
that section requires. `fonts/OFL.txt` is the licence verbatim, which section 2 requires to travel
with it, and `fonts/README.md` records exactly what was done so it can be rebuilt.

**`swap`, NOT `block`.** The boot path is where this app once took itself down, and a face that
blocks paints nothing until the file lands. `swap` paints in SF Mono at once and changes when the
file arrives — **so the old stack behind it is not decoration**: it is what a reader sees for the
first few hundred milliseconds, and what they see for ever if the file 404s. A stack that degrades
to SF Mono degrades to the font this site had yesterday.

**NO `LOAD` STAMP ON THAT URL**, unlike every file in `window.FILES`: the stamp is written by
index.html, which cannot reach a URL inside a stylesheet. `sw.js` revalidates by `ETag` instead,
which is the same guarantee one step later — and a typeface is the one asset here that genuinely
never changes.

**Measured in a browser rather than assumed**: one request, `200 family-code.woff2`, registered as
`Family Code 200 700 loaded`, `document.fonts.check` true, and the same string rendering **606px
against the fallback's 622** — which is what says it is actually drawing in the new face rather than
falling through. Screenshotted, because whether a typeface reads right is not a thing a measurement
settles.
