# 449 — The Assistant in Messages, five questions a day

The owner: "say a client just joined up and they have an AI assistant in the messages bit… they can ask them
questions… cap it to 5 questions max per day so it's not going to use up all the AI tokens."

## What it is

- **Page 0 of Messages (`dm`)** for every signed-in account: a card titled Assistant above (before) every
  conversation, drawn by `asstPage_`/`asstHtml_` in `js/posts.js`. The thread indices moved by one:
  `dmSync_` reads `PAGE.dm - 1`, `dmRedraw_` (me.js) goes to `at + 1`.
- **Its own class names** (`.asst`, `.asst-text`, `.asst-bub`), never `.msg*`: many checks ask for the first
  `#s-dm .msg-text` or `.msg-bub` and mean a person's conversation.
- **Kept on the device**: `localStorage['asst:<personId>']` holds the last 40 lines and the day's `left`. The
  box is a draft (`draftAttr_('asst', '')`, dropped when answered), so check-drafts is satisfied.
- **One quiet line**: "N of 5 questions left today"; at 0 the box and Ask are disabled and the line reads
  "No questions left today — they come back tomorrow." No pop-up, no toast.

## The backend

- `askAssistant` in `dopost.gs`, `ACTION_ACCESS` `self`, so the person is the token's. It calls the same
  `aiGemini_` as Mark with AI (models from `gemini_model`/`gemini_model_fallback`, key `GEMINI_API_KEY` in
  Script Properties only), through `assistAsk_`.
- **The cap**: `assistant_questions_per_day` on the config tab (blank = `ASSIST_PER_DAY` 5, 0 = off), counted in
  Script Property `AI_ASSIST` per person per London day under the script lock — `aiMarkTally_` gained a third
  argument, the property name, so both counts share one locked read-modify-write. No sheet tab, so nothing new
  in TAB/SCHEMA/WHERE. A question Gemini does not answer gives its count back.
- **What it knows about the business**: the phone sends `facts` (the brand tab's words, hours per session, the
  seat cap, the screen names — all already public in the payload), clamped to 4 000 characters and fenced as
  data in the prompt. Someone editing their own request can only mislead their own answer.

## Children

Decision: children get it (they are the learners it most helps with study), with a child-safe system prompt:
`netViewerIsChild_()` adds "the person asking is a child…", keeps answers suitable, and sends money, bookings
and personal worries to a parent or tutor.

## Checks

`js/check-assistant.js` (signed in only, the token's person, the cap from config with 5 when blank and 0 off,
a refused Gemini call gives the count back, the child's rules); flow journey "assistant: pinned first in
Messages…" with a stubbed reply. Versions `2026-10-25-a-assistant`, css `2026-10-25-b-assistant`.
