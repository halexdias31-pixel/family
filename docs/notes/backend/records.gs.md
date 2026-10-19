# backend/records.gs

The full text of comments in `backend/records.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### BUSINESS RECORDS — the business's own paperwork, for an admin and nobody else.

top level, before `RECORD_SLUG`

```
/* ==================================================================================================
   BUSINESS RECORDS — the business's own paperwork, for an admin and nobody else.

   Insurance, tax, registrations, policies and checks. The phone draws them as pages of the Settings
   column: a fixed list of items, each a caption and its boxes — see `js/records.js`. Each item's
   `record_id` is its slug (`pub_liability`), so a row is found by what it IS rather than by an id
   somebody has to remember, and a page's Save is one batch that fills or updates those rows.

   A POST AND NEVER THE PAYLOAD. `doGet` builds one payload per viewer and caches it for six hours;
   a policy number has no business in a cache, and a read that happens only when an admin opens the
   column is also a read nothing else pays for.

   `saveRecord` and `dropRecord` WENT WITH THE OLD REGISTER. It added rows under invented ids and
   removed them; a form of fixed items does neither, and a handler with no door is the `orderPrints`
   shape. A row they wrote is still in the tab and still listed — the phone just draws the items it
   knows, by slug.
================================================================================================== */
```

