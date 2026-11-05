# 940 — one rule for an answer's words

`tools/facet-data.js` found 361 answers that read one way in the menu, another on the chip after picking it and a third on
the card's tag line: the menu used `facetTally_`'s `show` (shortest unique form plus `tellApart_`'s " · Corbettmaths"), the chip
and the tag used `facetShort_`, which skipped any name with one form (so the tellApart tail never reached them) and shortened
against a different list each time (`cardList_`, the chips before it).

Now `answerSay_(facet, v)` in js/find.js decides, for all three: the answer as its menu over the finder's whole list draws it,
memoised per list. Words that are unique over the whole list are unique in any narrower one, so no context is needed.
`facetShort_`, `cardList_`, `cardThingOwn_`, `CARD_LISTS` and `CHIP_SHOW` went. facet-data now reads the drawn menu button, the
chip and a real card's `tagRow_`.

Spellings fixed in `tools/hymns-text.py` (`SAME_AS`, re-run): Fanny J. Crosby, Joseph Hart. _D._ / Joseph Hart, d, and
Antiphônon Ia'. `W-CBM-timetables` (reading timetables) and `W-CBM-times-tables` are two different worksheets, left as they are.
`kindOwn` "Answers" is tagged on the answer page (`tagRow_(x, 'ans')`), so facet-data reads both pages of a card.
