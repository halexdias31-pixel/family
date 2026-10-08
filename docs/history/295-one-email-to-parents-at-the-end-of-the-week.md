## One email to parents, at the end of the week, with every question's own words

The owner, on 8 Oct, shown the daily email (294): *"should be at the end of the week that it send to
parents all they done that week..."* — and then, of everything built for the daily one: *"delete daily
email stuff. idk what thats about."*

So there is one parent email again, the weekly one (280), and it now says what the daily one said: every
question the child worked on that week, each with its own words. The email after each session (291) and
its widening into every day of work (294) are gone — code, tab, switch, card, opt-out column and check.
What that work had that parents should get, the weekly email kept.

### What the weekly email says now

```
Hello Pat,

This week (28 Sep – 4 Oct, up to 6pm on Sunday) Ada worked on 4 questions — 3 new and 1 gone back to.

Maths · Paper 1 (Calculator) — June 2024
Q1, Q7 (again)

Maths · Paper 3 (Calculator) — November 2023 (Higher)
Here is some information about the 120 students in Year 11 at a school, who were each asked …
Q14a: A student is chosen at random from the 120. Work out the probability that …
Q14b: Two students are chosen at random without replacement. … (picture on the site)

…and 1 more.

Ada can see them on the site: https://halexdias31-pixel.github.io/family/

You get this because you are Ada’s parent on @family. To stop these emails, reply to this one and say so.
```

| Before | Now |
|---|---|
| "New this week" / "Gone back to", then `- Maths · Paper 1 (Calculator) — June 2024 · Q3`, one line per question. | **Grouped by paper**: the paper's name once, then each question as `Q14a: <what it asked>`, the stem its parts share printed **once** above them, cut to what reads on a phone (`DIGEST_STEM_SHOWN` 300, `DIGEST_WORDS_SHOWN` 400). A question first done before the week says `(again)`. A paper with no words yet is its line of numbers, `Q1, Q7 (again)`. |
| A question with no name was printed by its key, `q:Q-9MA031-2206-1`. | **Never a raw key.** A question with no printable name (no label, an unsafe one, or one that is only its key) is counted and not listed — it is in "…and N more". |
| At most 30, then "…and N more". | At most **`DIGEST_WEEK_LIST_MAX` = 80**, then "…and N more." |

The list is **`digestQuestions_`** in `backend/digest.gs`: the daily email's own renderer, lifted out of
`recapRender_` before that file was deleted. It was proved byte-identical to the original over 400
varied renders (stems, cuts, hidden items, keys, the cap, escaping) before the daily email went.

**Why 80, and Gmail's clip.** Gmail clips a message whose HTML is over about 102 KB: the rest hides
behind "[Message clipped] View entire message", footer and all. Measured with the real render on 8 Oct:

| 80 questions… | HTML |
|---|---|
| each at its longest — its own 110-character paper, its own stem past 300, its own ask past 400 | **66 KB** |
| the library's 80 longest asks under its 80 longest stems, as the phone sends them | **67 KB** |
| a heavy week shaped like a real one — six papers, three parts to a stem | **36 KB** |

So 80 keeps a third in hand; about 120 would reach the clip. `check-digest.js` renders the first row
every run and is red at 102 KB, so raising the cap or either cut past it fails. (A question made of
nothing but `&` and `"` would grow fivefold when escaped; nothing in the library does — its longest
escaped ask is 401 characters for 400.)

**The Preview says whether the deployed version prints words.** The admin's Preview is answered by the
deployed web-app *version*; the Sunday trigger runs the code as *saved*. After a pull with no new
version the card would show last week's list of names over a run that sends the new email. So
`digestPreview` now answers `words: true`, and a reply without it is told first, in bold: *"The live web
app lists questions by name only, without their words — sync backend/ into Apps Script and make a new
version."*

The card says: *"On Sundays, each parent who has accepted a link to a child gets every question that
child worked on that week, each with its own words."*

### What was removed

| | |
|---|---|
| `backend/recap.gs` | the whole file, and its line in `backend/files.json` |
| `recap_log` | out of `TAB`, `WHERE` and `SCHEMA` |
| `people.session_email` | the daily email's opt-out column, out of `SCHEMA.people` |
| config rows | `session_recap`, `session_recap_delay`, `session_recap_morning` out of `CONFIG_DEFAULTS` |
| constants | `RECAP_RUN`, `RECAP_LATE_HOURS`, `RECAP_PREVIEW_DAYS`, `RECAP_UNNAMED`; `DIGEST_LIST_MAX` (30, the daily cap); `RECAP_WORDS_SHOWN` / `RECAP_STEM_SHOWN` renamed `DIGEST_WORDS_SHOWN` / `DIGEST_STEM_SHOWN` |
| `recapPreview` | out of `doPost`, `ACTION_ACCESS` and `doGet`'s `features` |
| `installSessionRecap`, `removeSessionRecap`, `sessionRecapRun` | with the file |
| `jobs.slot_codes` | only the daily email read it. Its `SCHEMA` column, `createJob`'s write and `slotCell_` (dopost.gs), and the Edit path's rewrite of it are gone, so a booking writes exactly the row it wrote before the column. `slotCodes_` (booking.gs) stays: it is the strict reading of a request's ticked hours, which `bookingCodes_` uses for the tutor's-week refusal, and has nothing to do with the email |
| `digestPlan_`'s `o` | the `render` and `optOut` arguments the daily email handed in, and the `keys` each planned email carried for its next-morning follow-up |
| the front end | the "Daily email to parents" card in `js/digest.js` and everything only it used (`recapCard_`, `recapSheet_`, `RECAP_SAY`, `recapMorningNow_`, `recapClockSay_`, …), the `.recap-sheet` rules in style.css (`--css-version` bumped) |
| the checks | `js/check-recap.js` and its line in `check-all.js`; `recap` in the file lists of `check-columns.js`, `check-rows.js` and `check-gas-load.js`; the daily card's journey in `check-flow.js`; its two states in `check/states.js` |

**Kept, because the weekly email needs it:** `attempts.words`, `ATTEMPT_WORDS_MAX`, `attemptWords_`,
`DIGEST_WORDS_REFUSE`, `digestWordsSafe_`, `DIGEST_KEY_SHAPE` (now only deciding whose words may be
printed — the email prints no key), `keepsWords` / `worded`, the `attemptWords` feature, and the phone's
`doneWords_` / `doneWordsPlain_` / `attemptWordsOn_`. `digestMail_` (the claim, the send, the receipt)
stays as the Sunday run's engine; `check-mail-load.js` stays as check-digest's world.

**On the live sheet nothing is deleted.** `ensureSchema` only adds. The `recap_log` tab, the
`session_email` column on `people`, the `slot_codes` column on `jobs` and the three `session_recap*`
config rows stay where they are, read by nothing. They can be deleted by hand, or left.

### The hourly trigger the daily email may have left

If `installSessionRecap` was ever run, an hourly trigger on `sessionRecapRun` is booked — and once the
pull removes that function it fails every hour, and Google emails the owner each failure.
**`installWeeklyDigest` now deletes every project trigger whose handler is `sessionRecapRun`**
(`DIGEST_RETIRED_RUNS` in constants.gs, the one place the old name is still written — a trigger is found
by that string and nothing else), touches no other trigger, and its log line says
*"removed the old after-session email’s hourly check (1 trigger)"* or *"no old after-session email check
was booked"*. The owner runs it anyway to book Sundays.

### Checked

`check-digest.js`, 68 → 80 rules. Rewritten to the new email without weakening what they protected:
Pat's email is grouped by paper with "…and 1 more." and no raw key (it asked for `q:ADA-AGAIN`, "New this
week" and "Gone back to"); the plan carries a nameless row as key + empty label + hidden (it asked for the
key as the label); Bo's email counts the three phone-text questions in "…and 3 more." and prints no key
(it asked for `- q:BEN-2`); and the ask that Sunday's email was **byte-identical with and without words**
— true while it listed names — is now "words change nothing but the words": the same subject, lead,
papers and numbers, each paper back to its line of numbers with the column blank. Added: words under
their paper as `Q4a: …` with the stem above, in text and HTML; refused words not printed and the question
still listed by number; a nameless question's words not printed and counted; the shared stem once; `(again)`;
words escaped in the HTML; `DIGEST_WEEK_LIST_MAX` is 80 and 87 questions list Q1–Q80 then "…and 7 more."
(five past the cap, two with no name); 80 of the longest under 102 KB and over 40; no other child, tutor
or price; `installWeeklyDigest` takes the old hourly check, by its exact name, and nothing else, and says
so; the Preview answers `words: true`. The removed "two emails, two stops" ask went with `session_email`.

`check-flow.js`: the weekly card journey now asks that the card says *each with its own words*, that no
daily card is drawn, that the preview body (in the new format) is printed as text, and that a reply with
`words` is not warned while one without is warned first, in bold, to make a new version.

Every new or rewritten ask was broken on purpose and seen red for its own reason, and the file restored
to the byte and seen green: 17 mutations in check-digest, 5 in check-flow.

### For the owner to do — one Apps Script sitting, after this is merged

1. **GitHub Assistant ↓** to pull `main` into the project. If `recap.gs` is still in the editor's file
   list afterwards, delete it there (⋮ → Delete): GitHub no longer has it, and a pull that only writes
   files leaves it behind.
2. Run **`ensureSchema`** from the function list. Nothing new is needed by this change; it makes sure
   `attempts.words` and `digest_log` are there if the earlier steps (280, 294) were never run.
3. Run **`installWeeklyDigest`** once. It books Sunday at `weekly_digest_hour` (18:00, London) and removes
   the old hourly check if one was booked; the execution log says which.
4. **Deploy → Manage deployments → pencil → New version → Deploy**, so the Preview is the new email.
5. In the Ledger's `config` tab set **`weekly_digest`** to **`preview`**. On the phone, Settings → the
   "Weekly parent email" card → **Preview**: each email should list papers with each question's words.
   After a Sunday, read `digest_log`, then set it to **`send`**.

The daily email's switch, `session_recap`, no longer exists; a row of that name on the config tab does
nothing. The child still has to be signed in as themselves on the device they work on — a question
marked while the tutor is signed in goes on the tutor's row (291).
