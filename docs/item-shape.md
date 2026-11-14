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

A kind needs only a **mapping** (in `ITEM_MAPS`, `js/cards-parts.js`): which columns are its tags, which are its links, its card's look and picture. The same few options serve every kind: where its id and name come from, which card draws it (a figure and a boxer share the person card), what its body says and whether the card shows it (`lines`), whether its card leads with its name, and whether it is greyed out (`off`). A card that is a tool (a question) also names its class, data attributes, the sheet drawn in place of its body, and its tiles. A kind made live from the payload (a subject, a level, a venue) also names its **computed fields** (`live`: a subject's tutors, a room's seats and rate), worked out as the item loads; `liveTags` puts some of them on the card, and `childHides` takes fields out for a child — so a child sees a room's seats but not its price, decided in one place for every kind; `adminOnly` does the same for anyone who is not an admin. A card whose tag line is not its name and facets (a tutor's pills) names it with `pills`, and rows under it with `tagRows`; `facets: false` leaves Find's facets off (a post). `facts: true` lays a card out as Find lays out a facts card (tidied tags, "Nothing here yet" when it has no lines); `tool` hands over the drawing of a shared tool the card holds (the booking paper), laid out the one way; `from` may be a function (a shop thing's Find entry is its row). Two shared functions do the rest:

- `item_(row, kind)` turns any stored row into the shape.
- `cardOfItem_(item)` turns the shape into a card for the one card template.

## Where we are

- Moved: **manuscripts, writings, timeline events** (the history database); then **exam inserts, specifications, chemistry, mechanics, historical figures, boxers and fights**; then **practicals, projects, textbook chapters, subjects, levels and venues**; then **questions** (a question part's map draws its sheet, picture and tool row through the same pieces as before, so answering and marking are untouched); then **tutors, people and posts** (a tutor's map draws its pills, subject rows and lines through the same pieces as before; who sees what is the map's: `childHides` keeps a tutor's rate from a child, `adminOnly` keeps the note on why a tutor is unlisted to an admin, and a person's tiles are still the permissions table's); then, last, **shop things and bookings**. A shop thing's map draws its photo, name, facets and price tag (its Buy tile and the basket are unchanged). A booking's map draws its tags (what, who, when, rate, paid) and its one summary line; the **receipt paper itself stays a tool** — it is the same paper the booking form fills in (`bookingDoc_`), with the booking's actions on its foot — so the map's `tool` option hands it over drawn by its own maker and lays it out the one way (open as a form where it holds one, else as lines). Booking maths, payments and every figure on the paper are untouched; the one change is that a child's receipt card no longer shows the hourly rate or the total (`childHides`), which the paper already kept from them. Two general options came with them: `facts` (a card laid out as Find lays out a facts card) and `tool`. Their cards look exactly as before (a car part's card and a question part's card are now labelled for screen readers by their name, "Q5b", not by their first tag).
- Still to move: nothing — `check/item-shape-ratchet.json` is empty. The check (`node js/check-item-shape.js`) fails if that list ever grows, or if a moved kind gets its own builder back.
