# 484 — Notes for Claude: a tile on every widget and card, read by the next session

The owner: "add a tile on each widget I click then I write a prompt for what I want to edit. Then when I speak to
Claude I tell you to read my prompts."

## What an admin sees

Every widget's admin group (`layoutTiles_`) and every right-hand card's admin row (`cardAdminRow_`) ends with a
**Note for Claude** tile (pen; its note says how many are open). It opens a box IN PLACE under the tile row — no pop-up:
a textarea ("What should change here?"), Send and Cancel tiles, then this thing's open notes, newest first, a date and
first line each with a Done tile. The words are a draft (`cn:<item id>`), so Cancel or a reload keeps them.

Delete and the note tile sit in one `.tile-pair`, so the longer row never leaves the note alone under a full line
(check/tiles.js's orphan rule found it on the Games widgets, which have the padlock too).

## Where the notes live

- **Ledger tab `claude_notes`**: note_id, made_at, made_by (person id), column, item_id (layout id), item_label, note,
  status (open/done), done_at. In TAB, SCHEMA and WHERE; setup makes it.
- **Drive file "Notes for Claude"** (plain text, exact title) in the `family-library-imports` folder — the folder a
  session already reaches for library imports (407). Rewritten on every add and done with every OPEN note:
  `[note_id] column › item_label (item_id) — yyyy-mm-dd` then the note.
- doPost `claudeNoteAdd` / `claudeNoteDone`, admin-only (`rankAtLeast_(me, 'admin')` and the `admin` gate); doGet sends
  `claudeNotes` (open only) to an admin, in the fresh half laid on the kept body, so a new note shows at once.

When the owner says "read my notes": open the Drive file "Notes for Claude" (or the Ledger tab) and work through the
open ones; mark each done from its tile once shipped.

Backend 2026-10-27-z7-claude-notes; css 2026-10-27-z1-claude-notes. Journeys: "notes for Claude (484)" in check-flow.
