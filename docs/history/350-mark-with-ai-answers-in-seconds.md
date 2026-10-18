## Mark with AI answers in seconds: each model told how hard to think, a spent quota remembered, and one timing line per press

**The owner, 12 Oct** (13:39 UTC), the day after the backend carrying note 344's 503 fix went live:
*"ok the ai marking works but it takes so long. like 30 seconds or whatever"*. The presses were on GCSE
maths questions (short answers) and an English essay.

### Where the thirty seconds went

Nobody here can ask Gemini: the key is in Script Properties and nowhere else, and it is not asked for.
**Nothing logged a press that worked**, so the live presses could not be timed either. What follows
is therefore split into what was **measured** (in Node, through the real `doPost`, with `UrlFetchApp`
and `Utilities.sleep` really blocking) and what is **inferred** (from the code, or from Google's pages).

| Step | Where | Cost |
|---|---|---|
| The tap: guards, `markWait_`, the question and scheme to plain text, the tile's ring, then `api()` | js/keypad.js `on('qp-ai')` | under 0.05 s. **Read from the code**: nothing awaited, queued, debounced or retried before the fetch |
| The network: POST to script.google.com, the 302, the GET from script.googleusercontent.com | the phone | 0.3–1.3 s on 4G, **inferred** |
| Apps Script's start: a fresh runtime compiling the 1.38 MB backend | backend/*.gs | 109 ms to compile in Node, **measured**; 0.3–1.5 s in all on Apps Script, **inferred** |
| The gate (`authWhoIs_`: a property and the whole people tab), the key, `config()`, the take under the script lock | dopost.gs | the JS **measured** at 15–44 ms (100–600 people); 9 Sheets calls, 4 property calls and the lock **inferred** at 1–3 s |
| The take, when another request holds the script lock | `aiMarkTally_`, `tryLock(5000)` | up to 5 s, **inferred**: the `submitAnswer` the previous mark sends holds it for an estimated 1–3 s |
| **Gemini** | `aiGemini_` | **not measurable here**. 3.8 Flash was sent no thinking level, so it thought at its own default, MEDIUM, on every press — a one-mark maths answer included — and the call is not streamed, so nothing comes back until the whole think and the whole answer are done. Third-party figures put about 8 s to the first answer token at medium. **Inferred: the remainder of the thirty seconds, most of all for the essay** |
| The reply's privacy pass (`kidNamesOff_`) and `jsonOut` | core.gs, people.gs | 35–86 ms in Node, **measured** |
| The server's own JS, the whole `doPost` with Gemini answering at once | `js/check-gas-load.js` harness | 14.5 / 52.6 / 158.8 ms at 60 / 300 / 600 people, **measured**. With Gemini set to 2,000 ms: 2,143 ms in all; at 8,000 ms: 8,088 ms |

**A free-tier key's 429s do not explain thirty seconds** (measured with real waits): a day's quota
spent costs one refused ask (+0.41 s) and then 3.5 Flash-Lite, which thinks at MINIMAL and is faster. It
costs +3.5 s when the 429 carries no RetryInfo or a short one, and 7.3 s when both models refuse. **But
nothing remembered it**: every press after the key's twentieth asked the spent 3.8 Flash first again.

So the owner's slow presses were very probably on the *good* path: among the key's first requests of the
day, right after the deploy, marked by 3.8 Flash at MEDIUM. **That is an inference, not a measurement**,
and the timing line below exists so that the next slow press can be read rather than guessed at.

### What it does now

**1. Each model is told how hard to think** — `generationConfig.thinkingConfig.thinkingLevel`, as
Google's REST examples send it, chosen per model and per kind of answer (`aiThinking_` in dopost.gs; the
table and defaults in constants.gs over `AI_THINKING_LEVELS`):

| | gemini-3.8-flash (offers low, medium, high; default medium) | gemini-3.5-flash-lite (offers minimal, low, medium, high; default minimal) |
|---|---|---|
| a short answer | **low** — its lowest; `minimal` is refused with an error | **minimal** — its lowest, and its own default, so nothing changes there |
| an essay | **low** — one step under its own medium | **low** — one step over its own minimal |
| any other model | no level at all, the request as it always was | |

**Why an essay is LOW and not one step up on 3.8 Flash.** The brief said "one step up, unless the
research says otherwise", and the research did: low on both, so the two models read an essay to the same
depth and an essay the fallback marks is no longer the lighter read note 344's tenth finding recorded.
Google calls low "minimizes latency and cost" and medium "best quality for most tasks", so **this is a
trade of some depth for speed on a forty-mark essay** — and it is the one choice here the owner may want
back. `medium` in `ai_thinking_essay` is how essays were marked before today, with no deploy.

**Never `thinkingBudget`**: Google calls it legacy on 3.x and deprecated on 3.8 Flash, a budget beside a
level is a documented 400, and 3.5 Flash-Lite was seen (third-party) answering 400 to a budget of 0.
`maxOutputTokens` stays unset: Google's own advice is to lower the level rather than cap the output,
because the cap includes the thinking and a low one ends the reply mid-JSON.

**2. A level refused does not stop marking.** That was the reason note 344 set no level: a 400 is neither
asked again nor handed to the fallback, and `minimal` on 3.8 Flash is exactly such a 400. **Now a 400 to a
request that carried a level is asked once more, at once, of the same model without it** — its own
default, the request that always worked. When that marks, the log says
`aiMark: gemini-3.8-flash REFUSED THINKING LEVEL low (Gemini said 400) and marked without one -- put a
level it offers, or none, in ai_thinking on the config tab`. A second 400 is the key or the request and
stops as it always did. The re-ask is not one of `AI_TRIES`, waits for nothing, and starts only inside
both clocks: past `AI_HANDOFF_MS` the first model is not asked again and the fallback is asked instead.

*One step past the brief:* the brief said to re-ask when Google's message names the thinking field. This
re-asks on **any 400 to a request that carried a level**, as the research advised: Google documents no
code or message for a refused level (third parties saw HTTP 400 INVALID_ARGUMENT, "Thinking level MINIMAL
is not supported for this model. Please retry with other thinking level."), so a refusal worded any other
way would stop all marking. The cost is that a bad key, also a 400, is refused twice, quickly, before the
same sentence as before — and the "REFUSED THINKING LEVEL" line is written only when the re-ask without
the level marks, so a bad key is never blamed on the level.

**3. A day's quota spent is remembered.** A 429 whose `google.rpc.QuotaFailure` names a quota id with
`PerDay` or `Daily` in it (`GenerateRequestsPerDayPerProjectPerModel-FreeTier` on a free key — the test
Google's own gemini-cli makes) **is not asked again this press, whatever its RetryInfo says** (third
parties have seen "1s" on a day's quota, which 344's rule would have asked twice more, with waits). It is
**kept in the script cache until midnight in America/Los_Angeles**, when Google resets a day's requests —
not London's midnight — or six hours, the cache's own ceiling, whichever comes first. A 429 whose RetryInfo
says later than the next ask (a minute's quota, "39s") is kept for as long as it says. While it is kept:

- a model with another behind it is **not asked at all**, and the next model is asked at once;
- the **last** model is always asked — passing it over would be giving up without asking anybody;
- a model passed over counts as the 429 it was, so a fallback that then fails is "busy", as 344 has it.

Forgetting costs one refused ask, about half a second: that is all a dropped cache entry, or the six-hour
ceiling, can do. On the two days a year the clocks change, midnight is an hour out either way.

**4. One timing line per press**, marked or not, thrown or not, from the take onwards (a press refused
before it — no key, too long, no scheme — spends nothing worth timing):

    aiMark: timing -- short answer, 4120 ms in all; 690 ms before the first ask (the take 15 ms);
      gemini-3.8-flash not asked (a 429 said it is out of quota until 2026-10-13 07:00 UTC),
      gemini-3.5-flash-lite at minimal 200 in 2210 ms; marked by gemini-3.5-flash-lite

(one line in the log; broken here to fit). "In all" runs from the start of `doPost` to the end of the
asking and any give-back; Apps Script's own start and the phone's network are outside it, and the
Executions page's own duration is the request's whole. **No learner data**: no answer, question, scheme,
feedback, name, id or key — the kind, the models, levels, codes, waits and times, and for a press with
no mark, which of the pupil's fixed sentences it ended on (or "the script lock was busy", "at the cap",
"it threw").

**5. Nothing on the phone changed.** It waits for nothing before the request, retries nothing, and the
service worker ignores POSTs; the wait is still the tile's ring and "Marking…", the press-already-sent
line `check-loading.js` allows, with no new sentence. **The script lock was not touched either**: a press
straight after a mark can wait at the take for the previous mark's `submitAnswer`, and the cap's proof
(note 344, round 2) rests on that lock; the timing line's "the take N ms" now shows when it happens.

### Which of note 344's rules changed

| | until today | now |
|---|---|---|
| 400 | stop: not asked again, not the fallback | the same — **except** a 400 to a request that carried a thinking level, asked once more at once without it |
| a 429 whose quota is a day's | believed by its RetryInfo, so "1s" was asked twice more | not asked again this press; remembered until midnight Pacific |
| a 429 that says "later" | the fallback at once, this press only | the same, **and remembered**: the next press passes that model over while another is behind it |
| asks per model | at most 3 | at most 3, plus one quick re-ask without a refused level |

Everything else holds as 344 wrote it, and `js/check-aimark.js` still asks it: three asks of each model
on 429, 5xx or a throw, waits of about 0.8 s and 2 s each ±30%, 404 to the fallback at once, 403 stops, no
ask started past 20 s, the first model not asked again past 10 s, one plain sentence with no digit, the
day's mark taken under the lock and given back when no mark came.

### What the owner can change on the config tab

`ensureSchema` (`?setup=1`) adds two rows, **seeded blank**; blank is the code's default, so the site
behaves the same with or without them:

| key | blank means | can be |
|---|---|---|
| `ai_thinking` | a short answer at the lowest level each model offers: low on 3.8 Flash, minimal on 3.5 Flash-Lite | `minimal`, `low`, `medium`, `high` (each slower and deeper than the last), or `none` for each model's own default (the request before today). A level a model does not offer becomes the next one up it does: `minimal` is `low` on 3.8 Flash |
| `ai_thinking_essay` | an essay at low on both models | the same words; `medium` is how 3.8 Flash marked essays before today |

A word that is not one of these is read as blank and logged. A level typed for a model this file does not
know is sent as typed; if that model refuses it, the press still marks (above) and the log says so.

**To see where a press's time went:** Apps Script editor → Executions → the `doPost` run → its log, the
line beginning `aiMark: timing`. A slow line with a long `at low 200 in N ms` is Gemini thinking; a long
"before the first ask" with a long "the take" is the script lock; repeated 503s with waits are Google full.

### Expected time per press, before and after — inferred, not measured

Google publishes no latency figures for either model, and none could be taken here, so these are
estimates from the map above and Google's descriptions of the levels. The timing line is how to replace
them with numbers.

| | before | after |
|---|---|---|
| short answer, 3.8 Flash with quota | Gemini at MEDIUM, about 5–15 s, plus 1–3 s of Apps Script | Gemini at LOW, plausibly 2–6 s, plus the same 1–3 s |
| essay, 3.8 Flash with quota | about 15–40 s at MEDIUM — the thirty seconds | at LOW, plausibly 8–20 s; `medium` in `ai_thinking_essay` puts it back |
| any press, 3.8 Flash's day spent (free key) | one refused ask (~0.4 s; up to ~3.5 s more without a long RetryInfo) then Flash-Lite at minimal | Flash-Lite at once; the spent model is not asked until midnight Pacific |
| essay on the fallback | Flash-Lite at minimal | Flash-Lite at low: a little slower, a deeper read |

### How it was checked

`js/check-aimark.js`, through the real `doPost` with Gemini as a stub, gained four groups of cases:

- **the levels**: 14 combinations of the two cells, both kinds and four model names, each read off the
  request each model was actually sent (the first model a 404, so the fallback's is seen too); the request
  with a level is the request without one plus `thinkingConfig` and nothing else; `ensureSchema` seeds both
  rows blank with a note saying what blank is; and **every request in the whole file** is asked for
  `thinkingBudget` and for a `thinkingConfig` that is anything but one `thinkingLevel` from the vocabulary;
- **a level refused**: a 400 then a 200 is marked by the same model, the second ask without a level, no
  wait, the cell named in the log, one mark spent; an essay names `ai_thinking_essay`; a refused level and
  two 503s still leaves the third try; a refusal after a 503 is re-asked without a second wait; the
  fallback's level refused; a refusal past the handoff goes to the fallback; a 400 from both asks is not
  blamed on the level; a 403 is asked once; a model sent no level is asked once;
- **the remembered 429**, on a clock set to the owner's own message (13:39:04 UTC, 06:39:04 in Los
  Angeles): a day's quota with RetryInfo "0.4s" is asked once, the fallback at once, kept until 07:00 UTC
  on the 13th for at most 21,600 s; the next press goes straight to the fallback and its timing line says
  why; a second before 07:00 still passed over, a second after asked again; a minute's quota kept 39 s; a
  429 with no RetryInfo not kept; a spent first model and a full fallback is busy, and so is a retired
  fallback; a cache that throws still marks; one model alone is always asked;
- **the timing line**: exactly one per press — a mark, an all-503 essay, a lock refused at the take, a
  throw, an essay marked, a short answer, the cap — the first checked to the character on a clock (2 s an
  ask: `... 503 in 2000 ms, wait N ms, ... 200 in 2000 ms; marked by gemini-3.8-flash`), and none of the
  seven holding the answer, the essay, the question, the scheme, Gemini's feedback, the key, the person's
  id, name or address.

Note 344's own cases needed three changes, each a rule that moved: a 400 to the first model is now two
asks (level, then none), never the fallback; the "429 saying 0.2s is asked again" case now names a
minute's quota, because a day's is not; and the cache is emptied between that block's cases.

**Mutated 37 ways, each red, the real files green after** (each on the real file, with its original bytes
put back and checked by hash): the level not sent; an essay sent the short level; a level a model does
not offer sent as typed; a model not in the table sent a default; `none` ignored; a typo sent as typed;
`thinkingBudget` beside the level; the level put outside `generationConfig`; a refused level not asked
again; the re-ask counted as a try; the re-ask waiting; the re-ask ignoring the handoff; a 403 re-asked;
the refusal not logged; the refusal blamed at the 400 before the re-ask proves it; the wrong cell named;
a day's quota believed by its RetryInfo; a 429 not remembered; remembered for ever; remembered past the
cache's ceiling; the day ending at London's midnight; a 429 with no RetryInfo remembered; the last model
passed over too; a passed-over model not counted as busy; the memory not read; no timing line on a
failure; none on a busy lock; Gemini's feedback in the line; the waits missing from it; its clock not
starting at `doPost` — and note 344's own again: no retry, no fallback, a failed press keeping its mark,
no budget, no handoff, a 400 handed to the fallback, a 503 not asked again. Two survived the first round
(a typo is equivalent to blank on a model the table knows; a passed-over model's 429 only shows when the
fallback is *broken* rather than full) and each now has a case that is red without it.

The four version stamps move together to `2026-10-12-u-aispeed`.

### Sources

Google's own pages were read through search extracts: ai.google.dev and docs.cloud.google.com cannot be
fetched from the machine this was built on (as note 344 found). Google's GitHub repositories were read whole.

- Gemini API, Thinking (levels per model, defaults, `minimal` not off, lower the level rather than cap the output): https://ai.google.dev/gemini-api/docs/thinking and https://ai.google.dev/gemini-api/docs/generate-content/thinking
- Gemini API, Gemini 3 developer guide (what low and high are for; a level and a budget together is a 400): https://ai.google.dev/gemini-api/docs/gemini-3
- Gemini API, What's new in Gemini 3.8 Flash (`minimal` refused; low, medium (default), high; replace the budget with the level): https://ai.google.dev/gemini-api/docs/latest-model
- Gemini API, Gemini 3.8 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Gemini API, What's new in Gemini 3.6 Flash and 3.5 Flash-Lite (Flash-Lite's default is minimal): https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6
- Google Cloud, Developer's guide to Gemini 3.8 Flash (MINIMAL is a validation error; lower levels for latency): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/guides/gemini-3-8-flash
- Google Cloud, Gemini 3.5 Flash-Lite (minimal for latency-sensitive classification): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite
- Google Cloud, consumption options (latency is proportional to tokens generated): https://docs.cloud.google.com/vertex-ai/generative-ai/docs/deploy/consumption-options
- Gemini API, Rate limits (per project, not per key; a day's requests reset at midnight Pacific): https://ai.google.dev/gemini-api/docs/rate-limits
- Gemini API, Troubleshooting (retry 429 and 503 with backoff; do not retry 400): https://ai.google.dev/gemini-api/docs/troubleshooting
- Gemini API cookbook, thinking over REST (`"thinkingConfig": {"thinkingLevel": "low"}`): https://github.com/google-gemini/cookbook/blob/main/quickstarts/Get_started_thinking_REST.ipynb
- python-genai, `ThinkingLevel` and `ThinkingConfig`: https://github.com/googleapis/python-genai/blob/main/google/genai/types.py
- gemini-cli, a day's quota is terminal (`PerDay` / `Daily` in the QuotaFailure's quota id): https://github.com/google-gemini/gemini-cli/blob/main/packages/core/src/utils/googleQuotaErrors.ts
- Third-party, not Google: the refused level's 400 and its words (https://github.com/earendil-works/pi/issues/9455); 3.5 Flash-Lite's 400 to a budget of 0 (https://github.com/NousResearch/hermes-agent/issues/136456); a free tier measured at about 20 requests a day (a dev.to measurement, Sep 2026, as note 344 cites it); a short RetryInfo on a day's quota (https://github.com/UKGovernmentBEIS/inspect_ai/issues/5526, https://discuss.ai.google.dev/t/429-errors-despite-waiting-after-retrydelay/96899).

### After the review: a blank cell never asks a model to think more than it would unasked

The review of 12 Oct found that an essay marked by the fallback, 3.5 Flash-Lite, was now asked at `low` where
before it had thought at its own default, `minimal` — so the path a free key takes most often for an essay
became slower, which is the one thing this change exists not to do. `AI_THINKING_DEFAULT` names each pinned
model's own default (3.8 Flash `medium`, 3.5 Flash-Lite `minimal`), and a level chosen by a blank cell is
held at or under it. A level typed on the config tab is not held: that is the owner choosing. And the
`ai_thinking` row's note no longer reads `AI_THINKING_LEVELS[m][0]` bare, so a pinned name renamed to a model
the table does not list cannot make constants.gs throw as the script loads.
