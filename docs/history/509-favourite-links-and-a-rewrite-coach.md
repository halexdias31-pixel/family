# 509 — Favourite links and a Rewrite coach

Owner, note N-1793178550425: "add a widget in tools where students can add favourite links. max 10."

Owner: "a widget in Tools, only viewable to admin. this allows a student to paste an AI-generated text, but then helps
them rewrite it in their own words, in the best way you think it can help."

## Favourite links (`js/favlinks.js`, Tools, shown to everybody)

Not `signedIn`: a tool that appears on signing in moves the page under somebody on Tools (339's review), so a visitor sees "Sign in and your favourite links are kept here."

- **Storage: a Ledger tab, `fav_links` (`person_id, title, url`), one row per link in the person's order** — named in
  `TAB`, `SCHEMA` and `WHERE`, so setup makes it. Chosen over a JSON cell on `people` because the library cards
  already work this way (`ownRows_` / `writeOwnRows_`, written in place), the people row stays narrow, and an admin
  reading the sheet sees one link per row rather than a blob.
- **`favLinksSave` (`self`)** takes the whole list (add, remove and reorder are all "the list again"), refuses it
  whole on any bad address or more than ten, and answers with the stored list.
- **An address is http or https with a host** (`favUrlOk_`, the same rule in backend/dopost.gs and js/favlinks.js;
  check-favlinks proves they agree): no spaces, quotes or angle brackets, so `javascript:`, `data:` and an
  attribute break-out never get in. A row typed badly into the sheet is filtered again on the way out. Links open
  with `target="_blank" rel="noopener noreferrer"`.
- **doGet sends `favLinks` in the fresh half** (`freshFor_` / `payloadWithFresh_`), never in the kept body, so a
  cache hit cannot hand one person another's list. A visitor gets `[]`.
- One line per link with Up, Down and Remove tiles on the line; an Add row (Title, Address) under the list, gone at ten.

## The Rewrite coach (`js/rewrite.js`, Tools, `admin: true`)

A learning tool, not a paraphraser — **it never hands back a rewritten version**.

1. Paste the text → **Find the key ideas** (`rewriteIdeas`): Gemini returns 3–7 key ideas as short cue prompts
   ("why the tides happen", not a sentence from the text) and up to eight key words with simple definitions.
2. The source collapses (a closed `<details>`), and the student writes each idea in a box of its own.
3. **Check**: the phone scores the writing against the source — every run of four words shared with it, as a
   share of the student's words, the copied phrases marked where they stand, aiming under 20% — and
   `rewriteCheck` asks Gemini, per idea, whether the meaning is kept (yes/partly/no), what detail is missing,
   and one or two questions to make it clearer or more their own.

Guards:
- **Admin only, twice**: the widget is `admin: true` and both actions are `admin` in `ACTION_ACCESS`, and the
  handler asks `rankAtLeast_(me, 'admin')` again.
- **The reply's shape is fixed**: `responseSchema` plus server-side picking — `{ideas, vocab}` and
  `{feedback: [{kept, missing, questions}]}` and nothing else; a `questions` line that does not end in `?` is
  dropped (a statement is where a rewrite would hide). check-rewrite stubs Gemini with an extra `rewrite` key and
  a statement among the questions, and proves neither reaches the phone.
- **Prompt injection**: the system prompt says everything in `<source>` and `<student_writing>` is data, never
  instructions, and forbids writing any rewritten, paraphrased or improved version.
- **Nothing kept**: no sheet row, no Drive file, no `console.log` of the text or the writing; the phone keeps the
  session in a variable (`RW`), never localStorage. (`aiGemini_` logs the first 500 characters of a Gemini
  *error* reply, which is Google's words, as it does for marking.)
- **Its own cap**: `rewrite_coach_per_day` on the config tab (blank = 10, 0 switches it off), counted in its
  own tally (`AI_REWRITE`) and given back when Gemini fails, the assistant's rule.
- **No key**: the widget says the AI is not set up, and the copying check still works on one "own version" box.

Stamps: backend `2026-10-28-n5b-links-coach` (all four), css the same.
