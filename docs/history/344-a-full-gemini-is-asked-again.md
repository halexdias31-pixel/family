## A full Gemini is asked again, then another model, and a press that ends without a mark costs no mark

**The owner, 11 Oct**, about a pupil's press of Mark with AI on a 2024 June Foundation maths question:
*"Ai marking is not working right now Gemini said 503."*

### What was wrong

- **One ask.** `aiMarkAsk_` called `UrlFetchApp.fetch` once, and any code but 200 was the answer. A 503
  is UNAVAILABLE — *"The model is overloaded. Please try again later."* — Google's capacity for that one
  model, not the key and not the quota, and often gone in seconds. Google's own troubleshooting page
  gives the two answers: retry with a growing wait, or move to another model. The pupil got neither.
- **The press cost a mark.** `aiMarkCount_` spent one of the day's twenty before Gemini was asked, so a
  503 was a mark gone and nothing marked. A pupil pressing again through a busy minute spent the day.
- **A number was the pupil's sentence.** "AI marking is not working right now (Gemini said 503)" reads
  as broken, not busy; the number is for the owner, who has the log.
- **The model was an alias.** `gemini_model` was seeded `gemini-flash-latest`. Google's models page keeps
  `-latest` for "exploratory testing apps and prototypes" because it "might be a preview version" — and on
  21 Jan 2026 that alias did point at `gemini-3-flash-preview`, the kind of build that is full first.

### What it does now

**`aiGemini_` in dopost.gs asks; the numbers are constants in constants.gs** (above `CONFIG_DEFAULTS`,
because two of its rows name them and a `const` read above its own line throws as the script loads):

| | |
|---|---|
| asks per model | `AI_TRIES` = 3 |
| waits between them | `AI_WAITS` = about 0.8 s, then about 2 s, each ± `AI_JITTER` (30%) |
| asked again | `AI_AGAIN` = 429, 500, 503, and a fetch that threw |
| then | the fallback model, **at once** — its capacity is its own — with the same three asks |
| 404 | not asked again (a retired or misspelt name will not come back), but the fallback at once |
| 400, 403, anything else | stop: the key, the request or the account. Not asked again, not asked of the fallback |
| budget | no ask, first or again, is started once `AI_BUDGET_MS` = 20 s has gone since the first |

**Worst case:** six asks, four waits, **at most 7.28 s of waiting** (1.04 + 2.6, twice). A 503 comes
back in well under a second, so a full storm on both models ends in about 8–12 s; nothing new starts
after 20 s; an ask already started runs as long as Gemini takes, as it always did (an essay is marked
in seconds to tens of seconds, and `UrlFetchApp` gives up at about a minute on its own). So a failure
answers inside about 21 s, and a slow success is a slow mark, not a failure. The phone's request has no
timeout of its own (`api` in shell.js) and draws the three dots meanwhile.

**The models, both pinned stable names:**

| | default | released | shutdown |
|---|---|---|---|
| `gemini_model` → `AI_MODEL` | **`gemini-3.8-flash`** | GA 2 Sep 2026 | none announced |
| `gemini_model_fallback` → `AI_MODEL_FALLBACK` | **`gemini-3.5-flash-lite`** | GA 21 Jul 2026 | none announced on the Gemini API; Google Cloud lists 21 Jul 2027 or later |

Why these: Google's release notes of 18 Sep 2026 name exactly these two for new projects ("3.5
Flash-Lite or 3.8 Flash") and limit the 2.5 models to keys that used them before — so 2.5 Flash-Lite, the
obvious older fallback, may not be served to this key at all. 3.5 Flash-Lite is the newest text Flash-Lite
(3.8 Flash-Lite exists only as a speech model) and is the named successor of `gemini-3.1-flash-lite`
(shutdown 7 May 2027). Pinned names are retired too — the notes of 8 Oct 2026 deprecate `gemini-3.7-flash`
(and `gemini-3.5-flash`) and route them to newer ones — and a retired name answers 404, which is why a
404 from the first model is handed to the fallback. **That 404 rule is one step past the brief** (which
said fallback after 503/500/429 only), taken because pinning the first model is what makes a 404 likely,
and without it a retired pin would stop all marking where the alias never did. A third-party report has
the alias serving `gemini-3.8-flash` today, so the pin changes nothing now; it stops the alias moving to
the next preview.

**How sure:** the IDs were checked by web search against Google's own pages on 11 Oct 2026 — the models
page, the release notes, the deprecations table and each model's page — through search extracts, several
independent queries agreeing; the fetch tool could not resolve `ai.google.dev` from the machine this was
built on, so no page was read whole. High confidence both names exist and are stable on the Gemini API;
medium that neither has gained a shutdown date since. The first live mark settles it: the reply's `model`
is the model that marked it, and every refused ask is in the log with its code and model.

**A cell still holding the old seed is the default.** `seedConfig` never rewrites a value, so every
sheet seeded before today holds `gemini-flash-latest` as though somebody chose it, and a moved default
would have moved nowhere. `aiModels_` reads that one string as blank; any other name is used as typed,
`models/` taken off. `gemini_model_fallback` is a new row `ensureSchema` adds; `none` there, or the
same name as the first, is one model.

### The cap: marks given, taken first and given back

**A press takes one of the day's marks under the script lock before Gemini is asked, and gives it back
under the lock if it ends without a mark** — a 503 storm, a 400 or 403, a double 404, a reply with no
mark in it, or a throw (`finally`, not a line after the call). Given back only into the London day it
was taken from: a press at 23:59:50 that fails at 00:00:05 was taken from a tally midnight emptied.

**Why not count after a mark arrives:** the check and the count would then sit either side of a call of
up to 20 s. Two presses at 19 both read "one left", both are marked, both count — 21. Closing that would
mean holding the script lock across the call, and the script lock is the one every saved answer on the
site waits on. Taken first, each lock covers one property read and one write; a press in flight holds its
place, so a concurrent press at the cap is refused; the only cost is that a press made while the last mark
is in flight is refused even if that mark is then given back. That errs toward the cap, never past it.

**What the pupil reads:** `AI_BUSY`, *"Marking is busy right now — try again in a minute."*, after 429,
500 or 503 run out; *"Could not reach Gemini just now — try again in a moment."* when the fetches threw;
and for a fault that is the owner's to mend — 400, 403, a 404 from both — the sentence it always had,
"AI marking is not working right now (Gemini said 400).", so the owner can be told the number. Google's own
words go to the log only, as before: every refused ask is logged as `aiMark: Gemini answered 503 for model
gemini-3.8-flash (try 1 of 3): …`, and the end as `aiMark: gave up on …`.

Not done: Google's 429 carries a `retryDelay` that is not read — a 429 for a per-minute quota is asked
again on this schedule and then goes to the fallback, whose quota is its own.

### How it was checked

`js/check-aimark.js`, through the real `doPost`, with `UrlFetchApp` answering a queue of replies,
`Utilities.sleep` recorded rather than slept, the script lock counted, and the backend's log captured:

- 503 then 200 → a mark, one count, one wait inside 0.8 s ± 30%;
- 503 ×3 then the fallback's 200 → a mark whose `model` is the fallback, waits ~0.8 s and ~2 s, none
  before the fallback;
- everything 503 → `AI_BUSY` exactly, no digit in it, three asks of each model, ≤ 7.28 s waited, the log
  naming each model and try — and the count given back (the cap case at the end counts exactly the marks
  given);
- 500 and 429 → asked again; a thrown fetch → asked again; all thrown → "Could not reach Gemini";
- 400 and 403 → one ask, no wait, the old sentence with its number, Google's words not in the reply but in
  the log with the code and model, and no mark spent;
- 404 → the fallback at once; 404 from both → "Gemini said 404", no mark spent;
- the old seed → `AI_MODEL`; `models/` stripped; `none` and a repeated name → one model; `ensureSchema`
  seeds `gemini_model_fallback`;
- 200 storms: every wait inside its ±30%, the waits spread, the worst 7.28 s or under; a Gemini taking 7 s
  an ask, with the clock moving: no ask started past 20 s;
- two presses at the cap, the second made from inside the first one's request to Gemini: the second is
  refused, two marks are paid for, and the lock was never held while Gemini was asked; and a failed press
  holding the last mark gives it back to the next one.

**Mutated nine ways, each red, the real files green after:** no retry (`AI_TRIES` 1); retry on 400/403;
no fallback; the count not given back; the old numbered sentence for a 503 storm; the count taken after
the mark instead of before (the press inside the first one's request is marked, three requests for a cap
of two); the script lock held across the call; no jitter (200 storms, one first wait); no budget (asks
started at 23.6 s, 31.6 s and 40.8 s).

The four version stamps move together to `2026-10-11-o-ai-retry`.

### Sources

- Gemini API, Models (naming patterns, the `-latest` alias): https://ai.google.dev/gemini-api/docs/models
- Gemini API, Release notes (21 Jan, 21 Jul, 2 Sep, 18 Sep, 8 Oct 2026): https://ai.google.dev/gemini-api/docs/changelog
- Gemini API, Deprecations (release and shutdown dates): https://ai.google.dev/gemini-api/docs/deprecations
- Gemini 3.8 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Gemini 3.5 Flash-Lite: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- Gemini API, Troubleshooting (503: retry with backoff, or switch model): https://ai.google.dev/gemini-api/docs/troubleshooting
- Google Cloud, Gemini 3.5 Flash-Lite (retirement on Google Cloud): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite
