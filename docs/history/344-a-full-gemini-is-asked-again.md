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
| asked again | `aiAgain_`: 429, any 5xx, and a fetch that threw *(after review: was 429, 500, 503)* |
| then | the fallback model, **at once** — its capacity is its own — with the same three asks |
| a 429 whose RetryInfo is later than the next ask | not asked again; the fallback at once *(after review)* |
| 404 | not asked again (a retired or misspelt name will not come back), but the fallback at once |
| 400, 403, anything else | stop: the key, the request or the account. Not asked again, not asked of the fallback |
| budget | no ask, first or again, is started once `AI_BUDGET_MS` = 20 s has gone since the first |
| handoff | the first model is not asked AGAIN once `AI_HANDOFF_MS` = 10 s has gone, so the fallback can still start *(after review)* |

**Worst case:** six asks, four waits, **at most 7.28 s of waiting** (1.04 + 2.6, twice). A 503 comes
back in well under a second, so a full storm on both models ends in about 8–12 s, and that is the case
that happened. The clocks bound when an ask **starts**, not how long it runs: an ask already started
runs as long as Gemini takes, as it always did (an essay is marked in seconds to tens of seconds), and
`UrlFetchApp` has no timeout to set — it gives up by itself at about a minute, which Google does not
document. **So a press ends within 20 s plus its last ask's own length: about 80 s at the very worst**
(an ask started at 19.9 s that hangs until UrlFetchApp gives up), against about 60 s when there was one
ask. *The first version of this note said "a failure answers inside about 21 s"; that counted the starts
and not the last ask, and was wrong (the review of 11 Oct).* A slow success is a slow mark, not a
failure. The phone's request has no timeout of its own (`api` in shell.js) and draws the three dots
meanwhile.

**The models, both pinned stable names:**

| | default | released | shutdown |
|---|---|---|---|
| `gemini_model` → `AI_MODEL` | **`gemini-3.8-flash`** | GA 2 Sep 2026 | none announced |
| `gemini_model_fallback` → `AI_MODEL_FALLBACK` | **`gemini-3.5-flash-lite`** | GA 21 Jul 2026 | none announced on the Gemini API; Google Cloud lists 21 Jul 2027 or later |

Why these: Google's release notes of 18 Sep 2026 name exactly these two for new projects ("3.5
Flash-Lite or 3.8 Flash") and limit the 2.5 models to keys that used them before — so 2.5 Flash-Lite, the
obvious older fallback, may not be served to this key at all. 3.5 Flash-Lite is the newest text Flash-Lite
(3.8 Flash-Lite exists only as a speech model) and is positioned as the replacement for
`gemini-3.1-flash-lite` (shutdown 7 May 2027) — by Google's July product notes; the deprecations table
leaves that row's replacement column empty. Pinned names are retired too — the notes of 8 Oct 2026 deprecate `gemini-3.7-flash`
(and `gemini-3.5-flash`) and route them to newer ones — and a retired name answers 404, which is why a
404 from the first model is handed to the fallback. **That 404 rule is one step past the brief** (which
said fallback after 503/500/429 only), taken because pinning the first model is what makes a 404 likely,
and without it a retired pin would stop all marking where the alias never did. **Which model the alias
serves today is unconfirmed**: Google's last named target for `gemini-flash-latest` is `gemini-3.5-flash`
(19 May 2026), which since 8 Oct is routed to `gemini-3.6-flash`; no later mapping was found. So the pin
may move the live site to a newer model — with its own quota, and on a paid key its own price (3.8
Flash's introductory rate is reported by third parties to double on 1 Jan 2027). It fixes the model at
3.8 Flash and stops the alias moving to the next preview. *The first version of this note said a
third-party report had the alias serving 3.8 Flash; the review found no such report.*

**How sure:** the IDs were checked by web search against Google's own pages on 11 Oct 2026 — the models
page, the release notes, the deprecations table and each model's page — through search extracts, several
independent queries agreeing; the fetch tool could not resolve `ai.google.dev` from the machine this was
built on, so no page was read whole. High confidence both names exist and are stable on the Gemini API;
medium that neither has gained a shutdown date since. A 200 shows only that a name was accepted — Google
now retires a name by routing it to a newer model — so the reply's `model` is the response's own
`modelVersion`, and a name answered by another model is logged with both (`aiServed_`, after review).
Every refused ask is in the log with its code and model.

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

**What the pupil reads — never a number** *(after review; the first build kept "(Gemini said 400)")*:
`AI_BUSY`, *"Marking is busy right now — try again in a minute."*, when anything asked was merely busy —
including a busy first model and a broken fallback, because the first will be back; *"Could not reach
Gemini just now — try again in a moment."* when nothing answered at all; and *"AI marking is not working
right now."* — the sentence it always had, without its number — when every model asked refused for a
reason that is the owner's to mend (400, 403, a 404 from both). Google's own words and the number go to
the log only: every refused ask is logged as `aiMark: Gemini answered 503 for model gemini-3.8-flash (try 1
of 3): …`; a model that cannot be used as `aiMark: MODEL … IS NOT SERVED (Gemini said 404) -- … put a
current name in gemini_model_fallback on the config tab` or `aiMark: … REFUSED THE REQUEST (Gemini said
400) -- the key in Script Properties, the request, or the account`; and the end as `aiMark: gave up -- …`.

### How it was checked

`js/check-aimark.js`, through the real `doPost`, with `UrlFetchApp` answering a queue of replies,
`Utilities.sleep` recorded rather than slept, the script lock counted, and the backend's log captured:

- 503 then 200 → a mark, one count, one wait inside 0.8 s ± 30%;
- 503 ×3 then the fallback's 200 → a mark whose `model` is the fallback, waits ~0.8 s and ~2 s, none
  before the fallback;
- everything 503 → `AI_BUSY` exactly, no digit in it, three asks of each model, ≤ 7.28 s waited, the log
  naming each model and try — and the count given back (the cap case at the end counts exactly the marks
  given);
- 500 and 429 → asked again (and since review 502 and 504); a thrown fetch → asked again; all thrown →
  "Could not reach Gemini";
- 400 and 403 → one ask, no wait, the old sentence (since review without its number), Google's words not in the reply but in
  the log with the code and model, and no mark spent;
- 404 → the fallback at once; 404 from both → "AI marking is not working right now." (since review), no mark spent;
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

### After review (11 Oct)

Two reviewers ran the first build (909b40c) through probes of the real `doPost` with a moving clock and
every pair of answers from the two models. Every finding below was reproduced as a case in
`js/check-aimark.js` first — red against 909b40c — and is green now.

1. **A slow first model never reached the fallback (must-fix).** The budget line `return`ed: when the
   next retry's wait would cross 20 s the press gave up, though the fallback's first ask has no wait.
   With Gemini taking 9 s to say 503: first, first, and "busy" at 18.7 s, the fallback never asked. Even
   as a `break`, three 7 s refusals used the whole 20 s. **Now** the clock ends the model's turn, not the
   press (`break`), and the first model is not asked again once `AI_HANDOFF_MS` (10 s) has gone. 9 s an
   ask: first @0, first @9.8, fallback @18.8 → marked by the fallback. 7 s: first @0, first @7.8,
   fallback @14.8 → marked.
2. **"Inside about 21 s" was wrong** — corrected above: the bound is 20 s plus the last ask, about 80 s
   if that ask hangs until UrlFetchApp gives up (about 60 s before this change). No setting cuts one
   UrlFetchApp call short. A case now holds the stated bound: a refusal at 18.5 s and a fallback that hangs
   60 s ends inside 80 s, every ask started inside 20 s, and the pupil is told "busy".
3. **502 and 504 were the owner's fault**: asked once, no fallback, "Gemini said 504" to the pupil.
   Google's troubleshooting page lists 504 as its own deadline — the faster fallback may meet it — and a
   502 is a gateway passing. **Now** any 5xx, and 429, is asked again (`aiAgain_`; the `AI_AGAIN` list
   is gone).
4. **Status codes still reached the pupil** — for 400, 403, a 404 from both, and a busy first model whose
   fallback answered 400/403/404 ("Gemini said 404" about a model the pupil never asked for). The brief
   said "keep the existing messages for a bad key/model (but say it to the admin in the log with the code
   and model, never to the child)" under "one plain sentence with no code numbers"; read here as: the
   sentence stays, its number moves to the log. **Now** no failure puts a digit in the pupil's message,
   the message is chosen from how *every* model asked ended rather than the last, and a model that cannot
   be used is logged in capitals with the config cell to change. *Vetoable: if the owner wants the number
   back on the phone, it is one line in `aiGaveUp_` and two assertions.*
5. **The config tab no longer said which model marks** (nit). `seedConfig` never rewrites a value, so
   the live row still read `gemini-flash-latest` / "Blank = gemini-flash-latest" while `aiModels_` used
   3.8 Flash. **Now** `CONFIG_RESEEDED` (constants.gs) names that old seed, and `seedConfig` gives a row
   whose value **and** note are both still exactly the old seed's the current default and note; a row
   with either cell changed is the owner's and is left. Until `ensureSchema` next runs (`?setup=1`),
   `aiModels_` still reads the old seed as the default, so the pin is live from the first request. Typed
   on purpose, the alias is still read as the default — Google keeps it for prototypes, and the note says so.
6. **`left` could be one low** when the same person's concurrent press failed and gave its count back
   after this one's was taken (nit). Nothing on the phone reads `left`; a comment at the reply now says to
   read it as "at least". No code change.
7. **`temperature: 0` was sent** and would one day stop marking. Google stopped honouring temperature,
   topP and topK with 3.6 Flash and 3.5 Flash-Lite (changelog, 21 Jul 2026) — both pins ignore it today —
   and says later models will answer 400 to them; a 400 is neither asked again nor handed to the
   fallback. **Now** deleted, as Google advises; the schema and the system instruction keep a mark steady.
   The check fails on any of temperature, topP, topK in `generationConfig`.
8. **A 429 was asked twice more though it cannot clear in 2.8 s.** On the Gemini API a 429 is that
   model's quota, a minute's or a day's, and it carries `google.rpc.RetryInfo` with a `retryDelay` such as
   "39s". The brief asked for 429 to be retried, so it still is when Google says nothing or says sooner
   than the next ask (some 429s, from a spike in shared capacity, carry no RetryInfo); **when it says
   later, that model is not asked again and the fallback is asked at once** (`aiRetryDelay_`). **On a
   free-tier key this matters every day:** Google no longer publishes free-tier limits; third-party
   measurements put 3.5-and-newer Flash, 3.8 included, at about 20 requests a day for the whole key and
   about 5 a minute, and 3.5 Flash-Lite at about 500 a day and 15 a minute. The cap is 20 marks per
   pupil, so one pupil can spend the first model's day and the rest of the day's marks come from
   Flash-Lite. The real numbers are on AI Studio's rate-limit page; billing on the key lifts them.
9. **The reply's `model` was the name asked for** (nit). Google now retires names by routing them (8 Oct:
   3.7 Flash → 3.8 Flash, 3.5 Flash → 3.6 Flash), answering 200. **Now** `model` is the response's
   `modelVersion` (`aiServed_`), and a name answered by a different model is logged with both; a version
   of the same name (`…-001`) is not.
10. **The fallback thinks less** (nit), now said here and over `AI_MODEL`: 3.5 Flash-Lite defaults to
    Google's minimal thinking level, recommended for classification and extraction; 3.8 Flash thinks more
    by default (medium, per the review — not re-found in this round's searches). An essay the fallback
    marks is a lighter read. No `thinkingConfig` is set, deliberately: a level a model refuses is a 400,
    and a 400 does not fall back. If the owner wants essays held to one depth, set it for the fallback
    only, after testing that name.
11. **Three claims in this note were corrected** (above): the alias's current target is unconfirmed, not
    "3.8 Flash per a third-party report"; 3.5 Flash-Lite is *positioned as* the replacement for 3.1
    Flash-Lite rather than named in the deprecations table; and the Firebase advice against `-latest` is
    added to the sources as the reviewer found it (this round's searches did not surface the sentence
    itself).

**Mutated after review, each red, the real files green after:** the clock `return`ing again (1); no
handoff (1); `aiAgain_` back to 429/500/503 (3); the code number back in the pupil's sentence (4); the
last model alone deciding the sentence (4); no reseed (5); `temperature: 0` back (7); RetryInfo ignored
(8); the asked name as `model` (9) — and the brief's own five again: no retry, retry on 400, no fallback,
the count not given back, a code number in the child's message.

### Sources

- Gemini API, Models (naming patterns, the `-latest` alias): https://ai.google.dev/gemini-api/docs/models
- Gemini API, Release notes (21 Jan, 21 Jul, 2 Sep, 18 Sep, 8 Oct 2026): https://ai.google.dev/gemini-api/docs/changelog
- Gemini API, Deprecations (release and shutdown dates): https://ai.google.dev/gemini-api/docs/deprecations
- Gemini 3.8 Flash: https://ai.google.dev/gemini-api/docs/models/gemini-3.8-flash
- Gemini 3.5 Flash-Lite: https://ai.google.dev/gemini-api/docs/models/gemini-3.5-flash-lite
- Gemini API, Troubleshooting (503: retry with backoff, or switch model): https://ai.google.dev/gemini-api/docs/troubleshooting
- Google Cloud, Gemini 3.5 Flash-Lite (retirement on Google Cloud; default thinking level): https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/gemini/3-5-flash-lite
- Firebase AI Logic, models (advises against the `-latest` aliases, per the review): https://firebase.google.com/docs/ai-logic/models
- What's new in Gemini 3.6 Flash and 3.5 Flash-Lite (sampling settings ignored; minimal thinking by default): https://ai.google.dev/gemini-api/docs/whats-new-gemini-3.6
- Gemini API, Rate limits (429 is per model; where the key's real limits are shown): https://ai.google.dev/gemini-api/docs/rate-limits
- Google AI forum, a 429 with `RetryInfo` / `retryDelay`: https://discuss.ai.google.dev/t/429-errors-despite-waiting-after-retrydelay/96899
