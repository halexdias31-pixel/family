# 456 — Mark with AI: faster when Google is busy, and it says where it is

25 Oct 2026. The owner: *"AI marking is taking so long. It takes so long and just says marking. Would be
nice if there was more feedback so we didn't feel blind."*

## What is sent (measured, not guessed)

Mark with AI sends **text only**: the question (≤ 8 000 characters), the scheme (≤ 8 000) and the answer
(≤ 20 000). No page images go to Gemini, so there was nothing to downscale or compress. The prompt is a
few hundred words of rules; the input is read in well under a second by any Flash model, so trimming it
would save nothing a pupil could feel. Thinking is already at its lowest (`minimal` for a short answer,
`low` for an essay, 350).

## Where the time went

`aiMarkTimed_` logs one line per press. Ordinary press, real figures to expect:

| step | time |
|---|---|
| phone → Apps Script `doPost` (and its cold start) | 1–3 s |
| config read, the day's count under the script lock | 0.1–0.5 s (up to 5 s if a `submitAnswer` holds the lock) |
| Gemini Flash, short answer at `minimal` | 1.5–4 s |
| Gemini Flash, essay at `low` | 5–15 s |

The long presses were Google being busy. Before this change a 429, 5xx or a fetch that threw on the first
model was asked **again** (wait 0.8 s, ask, wait 2 s, ask) for up to `AI_HANDOFF_MS` (10 s) before the
fallback was tried: a busy first model at ~4 s an ask cost about 4 + 0.8 + 4 + 2 + 4 ≈ 15 s before the
fallback's ask started, and up to ~20 s plus that ask in the worst case.

## The change (backend)

- `AI_TRIES_BEFORE_HANDOFF = 1` (constants.gs): a model with another behind it is asked **once**; its
  first 429, 5xx or throw hands to the fallback at once, with no wait. Only the last model is asked again
  (`AI_TRIES`, `AI_WAITS`). A refused thinking level still re-asks the same model at once, not counted.
- Same busy-first-model case now: 4 s + the fallback's ask ≈ 6–8 s (was ≈ 15–20 s). Storm waits are bounded
  at 3.64 s (two, on the fallback), not 7.28 s.
- The faster model was **not** swapped to first: the Flash-Lite fallback is quicker but a weaker examiner,
  and an ordinary press already answers in one ask. The owner can swap the two cells on the config tab.
- UrlFetchApp has no per-request timeout, so "a sensible timeout" is the existing `AI_BUDGET_MS` (no ask
  starts past 20 s) plus the handoff above.
- A two-step call (upload, then mark) was not built: each extra `doPost` costs a second or more of Apps
  Script overhead, which is the opposite of the request.

## The change (front end)

`aiStageStart_` / `aiStageSay_` / `aiStageEnd_` (keypad.js) put one quiet line under the tile row: the
gold dots from `loading_()`, then

- **Sending your work…** for the first 1.5 s (`AI_STAGE_SENT_MS`): a few KB of text has left by then on
  any connection that will answer at all. A true upload % is not possible: an upload progress listener
  makes the request non-simple, the browser sends a CORS preflight, and Apps Script cannot answer one.
- **Marking against the scheme…** after that, with the seconds (`· 7 s`). Gemini reads and marks in one
  call, so there is no separate "reading" stage claimed.
- **Still working — this one is taking longer than usual** past 20 s (`AI_STAGE_SLOW_MS`).
- On a failure the verdict line keeps its plain reason and the stage line becomes a **Try again** tile
  (`qp-ai-again`), which presses Mark with AI again. Not for "switched off" or "today's marks used".

This is the one wait with words beside the dots: check-loading.js fails those stage words anywhere but
keypad.js, and its `PHRASE_OK` entry carries the owner's words (306 stays the rule everywhere else).

## Checks

check-aimark: the first model is asked once and the fallback the moment it says busy (a 9 s / 7 s busy
first model: fallback asked at exactly 9 s / 7 s, the press two asks long). Journey "Mark with AI shows its
stages…": a slow stub at 0, 7 and 23 s, the mark, a failure with its reason and Try again re-sending.

Versions: backend `2026-10-25-r-ai-mark-speed` (all four), css `2026-10-25-u-ai-mark-stages`.
