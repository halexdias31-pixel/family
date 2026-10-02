## Five captions, a heat map instead of place names, a spelt-right subject list

**Asked for in one message**: *"reevaluate the subjects list. you included uni name in the subject.
there should be x number of titles. at a glance, teaches, can also teach, qualifications, tutors at.
why is sign out tile under the favourite tile? … instead of the tutors at showing names of all
places, just let it be a heat map of the areas."*

- **The captions are exactly those five, in that order.** `Teaches` is the specialism alone (the
  level ticked `Teach`); `Can also teach` is the rest of `teaches`. They used to share one row, told
  apart only by a gold edge. The `Focus` row went. The account state asserts no sixth caption.
- **`Tutors at` is a heat map** (`profHeat_` in cards.js). It is the ticked venues' own `lat`/`lng`,
  already on `DATA.venues`, drawn as glows over CARTO dark tiles of OpenStreetMap, centred on the
  venues at the closest zoom from 12 to 10 that holds them. The attribution is on the map. A venue
  with no coordinates is left off, `Online` is a chip under the map, and no venue is named anywhere
  on the card. **The tiles and glows are BACKGROUND LAYERS, not elements.** Absolutely placed
  `<img>`s made the box scroll sideways by 120–150px (`overflow: hidden` clips a scroller, it does
  not stop it being one), and `check/ui.js` named it on the first run. **This container cannot
  reach the tile host**, so every screenshot here shows the glow over the plain grey fallback; the
  streets are the owner's to see on a phone.
- **The university was in the subject** because the studying migration in `qualsList_` wrote
  `Bible and Theology — University of…` into it, from when the board slot was a closed list of exam
  boards. It now writes the place into the board slot, which is "School, college or uni". An entry
  already saved that way is split back on read, but only when the board is empty.
- **Qualifications have their own subject list** (`QUAL_SUBJECTS` in me.js). They used to be
  offered the booking list from the sheet: thirteen entries including "Englisht Literiture" and
  "Physical Educations", and nothing a degree is in. A saved value that is not on the list is kept,
  and `Something else…` still types one in.
- **Sign out is in the same row as the star**, as the one action of `cardActions_`'s `me` branch,
  instead of a second row of one tile.
