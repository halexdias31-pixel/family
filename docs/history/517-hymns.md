# 517 — The hymns shelf

The owner: "I would also like to database church hymns. The definitive audio can be there, linked to Spotify version."

- **Where:** Library, Religious Studies, topic Christianity, shelf `Hymns`, kind `hymn` (js/hymns.js). The same lazy pattern
  as js/works.js (499): `data/hymns/index.json` is fetched when a finder paints, the words come in chunks of 50
  (`data/hymns/w-NN.json`) when a card is drawn. Nothing is in the boot payload.
- **Texts:** public domain only, parsed by `tools/hymns-text.py` from four Project Gutenberg transcriptions — The Otterbein
  Hymnal (1890: Protestant, Methodist and Anglican authors, with tune names and meters), The St. Gregory Hymnal (1920:
  Catholic), and John Brownlie's Hymns of the Greek Church (1900) and Hymns from the East (1907: Orthodox troparia,
  kontakia and stichera in English). Never typed by hand; change the script and re-run it. Sources in `data/hymns/LICENSE`.
- **Facets:** Tradition, Feast or season, Hymnal section, Words by, Tune, Language — ordinary tags (396).
- **Audio:** never hosted. Each card has one tile, "Listen on Spotify", a search for title and author
  (`open.spotify.com/search/…`); no specific track was verified, so none is linked.
- **Check:** `js/check-hymns.js` — every listed hymn has verses, a pre-1929 source and a public-domain licence line;
  no audio file; Find, index.html and the tile are wired; the backend does not send it.
- **Known rough edges:** tradition is the author's church by surname (anyone unlisted is Protestant); St. Gregory credits
  are read heuristically, so a few say Anonymous; Brownlie seasons are guessed from the words.
