# 1202 — the LEGO piece check (12 Nov 2026)

Owner, 12 Nov: *"add a tool in settings for the Lego trading thing — make sure all the pieces of a set are there. Don't make
it perfect, just something there."* It follows note 255's trade-in placeholder (switched off in 431), and is a settings
card rather than a Tools widget, as asked.

**Where:** Find › Settings, staff column, after the Flyer maker: `staff:lego` in `data/settings/setting-for.json`, see rows
for tutor and admin in `permissions.json`, `lego` secondary in `tiers.json`, drawn by `legoCards_` in `js/lego.js`.

**The flow, one card:**
1. Pick a set (tiles from `data/lego-sets.json`, fetched as a static file) or type its number, paste its parts list
   ("part, colour, qty" a line), Start. No part inventory exists in the repo, so the list is pasted; without one the
   batches are still counted, and Finished only gives the total.
2. Batch N: Photo 1, shake, Photo 2, shake, Photo 3 (a camera input with `capture=environment`, shrunk by `workShrink_`
   as a working photo is), then Next batch or Finished.
3. Each batch is ONE `legoCount` request with all its photos (`postLegoCount_` in backend/post-learning.gs). It asks the
   marking model through `aiGemini_` (same key, models, thinking level and daily cap as `aiMark`) for each piece's
   highest count in any one shot, never the sum, and believes only part, colour, count. The phone adds each batch's
   counts to a tally keyed by part and colour.
4. The state (set, list, batch number, tally) lives in the kept store (`kept:<person>:lego`, data-text.js), so a refresh
   keeps every counted batch; photos of a half-shot batch are not kept and are retaken.

Finished shows "Found X of Y" and a Missing list (each piece short, with how many of how many).

**Limits:** counting loose bricks from three phone photos is rough; similar parts and colours will be confused, and the
model's names must match the pasted part numbers to count against them. It is a first pass to improve.

**Automatic inventories later:** the Rebrickable API (`/api/v3/lego/sets/<set>-1/parts/`) returns any set's parts with
colours and quantities, but needs a free API key. That would go in Script Properties (e.g. `REBRICKABLE_API_KEY`) and a
backend fetch; nothing is added until the owner sets the key.

Checked by `js/check-lego.js` (staff only, three shots a batch, stubbed replies tallied, kept over a refresh, the missing
list). New action `legoCount` (`self`, staff checked in the handler); version stamps `2026-11-12-lego-check-1`: the
owner redeploys the Apps Script.
