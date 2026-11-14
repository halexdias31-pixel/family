# One item shape

Everything the site shows — a question, a person, a booking, a subject, a venue, a manuscript, a product — is an **item**. Today each kind is stored, loaded and drawn its own way, so search, tags, sharing, saving and permissions get written again for every kind. Step 1 makes every item the same shape, so each of those is written once.

## The shape (six fields)

| Field | What it is | Example |
|---|---|---|
| `id` | The item's own label, never reused | `MS-0001` |
| `kind` | What sort of thing it is | `manuscript` |
| `name` | What it is called; the first tag on its card | `Papyrus 52` |
| `tags` | Its own words, for search and topic pages | `Greek`, `papyrus` |
| `body` | What it says, as card blocks (can be empty) | Repository, Date, Contents |
| `links` | Ids of other items it points at | `WR-0004` |

The schema itself is `data/settings/item-shape.json`, which also lists every kind, where its data lives and how it is drawn today.

## How a kind joins

A kind needs only a **mapping** (in `ITEM_MAPS`, `js/cards-parts.js`): which columns are its tags, which are its links, its card's look and picture. The same few options serve every kind: where its id and name come from, which card draws it (a figure and a boxer share the person card), what its body says and whether the card shows it (`lines`), and whether its card leads with its name. Two shared functions do the rest:

- `item_(row, kind)` turns any stored row into the shape.
- `cardOfItem_(item)` turns the shape into a card for the one card template.

## Where we are

- Moved: **manuscripts, writings, timeline events** (the history database); then **exam inserts, specifications, chemistry, mechanics, historical figures, boxers and fights**. Their cards look exactly as before (a car part's card is now labelled for screen readers by its name, not by its first tag).
- Still to move: the list in `check/item-shape-ratchet.json`. The check (`node js/check-item-shape.js`) fails if that list ever grows, or if a moved kind gets its own builder back.
