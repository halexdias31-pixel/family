## 403 — the icons on Find 2, and Speed read (2026-10-24)

**Asked for as** "just like the Bible verses thing, make one for icons so it displays icons", and a speed reader
"like the Spritz / one word at a time readers".

**Icons.** Every `TILE_ICONS` mark (tiles.js) is an item of kind `icon` — `iconItems_`, behind the Bible's gate
(`bibleFor_`, admin only), What for and What kind `Icons` — a group of its own, because fifty-odd marks
under Learning → Resources changed what Resources asked an admin (check-flow's two Bible journeys failed; that
funnel journey now also sets aside the admin's `Icons` answer at What kind, as it sets aside Books). Ordinary facets, no tag rule of its own (396): shelf `Icons` and `iconGroup` ("Group",
from the hand table `ICON_GROUPS`, `Other` for a mark nobody placed), a row in `data/settings/facets.json`
(sort 25.7) — **the facets tab in the sheet wants the same row**; without it the code places the facet by its position.
`placeChipDead_` treats a kept `Icons` / `iconGroup` chip as the Bible's are treated: dead for anyone not an admin.
A card draws the mark large in gold, the same mark as a real tile (a no-op `icon-none`), the `tile_({ icon })` it
is named by, and where it is used: `icon: 'name'` counted across the app's scripts, fetched once from the page's
own cache (`iconUses_`), the dots (`loading_`) until counted. A mark drawn by `tileIcon_(name)` directly is not
counted — the card says so rather than saying 0 uses.

**Speed read** (js/reader.js, a new file before boot.js). A `Speed read` tile (new mark `speed`: two guide ticks
and a line of words) on content cards, practicals, projects and Bible verses (`speedTile_`, in `tileRow_` beside
Read aloud). It opens the sheet: the word in a three-column grid so its recognition letter (about 35% into the
letters, punctuation aside — `speedOrp_`) sits on the centre guide in gold; Back (to the start of the sentence, or
the one before if already there), Play/Pause tiles; a 150–700 words-a-minute slider kept on the device
(`speedWpm`). A comma holds 2×, a full stop 3×, a word over 8 letters 1.3×, a paragraph's end 1.4×. Words come
from the card's own fields; while a card's words are still in the Ledger the sheet shows `libSay_` (dots, sign in,
or Try again) and fills when `libItems` lands; a verse waits on `bibleLoad_`. A Tools widget, `Speed reader`,
takes pasted text (a draft kept on the device, `speedDraft`).
