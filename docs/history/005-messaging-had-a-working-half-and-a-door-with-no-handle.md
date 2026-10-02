## Messaging had a working half and a door with no handle

**Measured across the app**: of the four message actions, `messages` (the read) had one caller and
`sendMessage`, `readMessage` and `flagMessage` had none. The backend has had the whole thing since
messages were built — a role policy, a five-minute gap, a 2,000-character cap and an email to the
recipient — and no version of the app had ever posted to it. **This is `orderPrints` again**:
access-listed, published in the feature list, never called.

**The note in `me.js` said where the missing half belonged and it was right**: *"there is no picker
for WHO — that belongs with the roster, where the people you are talking to are already on screen."*
A tutor's pass IS the picker. The `Message` tile is on it; the sheet names the person, takes the
text and posts. Nothing is typed, searched for or guessed.

**By id, not by name**, and the backend had to change for it: `doGet` sent a tutor's display name
and an array position and no `person_id`. `findPerson` falls back to matching the name — right for a
row typed into the sheet before anybody has an id, and silently wrong the day two tutors share one.
**On a private message that is not a denial, it is a disclosure.** Publishing the id costs nothing:
every action checks the signed-in user, `mayMessage` checks the roles, and `handle` has been public
in that payload since it was written.

**`readMessage` is called now too.** `messageThreads_` counts a message unread when it has no
`read_at`, and only the server writes that cell — so the badge beside a conversation could only ever
have gone up. A count that never falls is decoration within a day.

**The role policy is not repeated on the phone.** `MESSAGING` in `constants.gs` is the rule — a
student may reach an admin and nobody else, parents cannot write to each other — and copying it into
the app is two rules to keep in step, which is the fault recorded here under `kinds`, under
`link`/`source_url` and under `childrenOf`. The sheet shows the server's own sentence, which already
says what to do instead.

### `node js/check-replies.js` — a refusal reported as a refusal

**I posted it through `api()` and it told somebody it had worked when it had not.** There are two
ways to post: `api()` resolves with whatever the server said, `{ error: … }` included; `send()` is
the same request and throws on an error. Both are right for something — a read, or a
fire-and-forget, wants `api`. **A caller that is about to say "Sent" wants `send`.**

Stubbing a refusal showed it: the sheet closed, what had been typed was thrown away, and a toast
said *"Sent to Ada Tutor"* about a message that was never written. **Nothing in the app would have
shown it** — the backend's refusals are the one thing a happy path never reaches, and all four that
`sendMessage` can give are real.

**`loadMessages` had the same fault and its own comment described it**: *"an unreachable backend is
not the same fact as an empty inbox, and showing the second for the first is how a network blip
reads as everything having been deleted."* Through `api()` a refusal resolved with no `messages`
key, `|| []` made it an empty list, and it reached that guard as a success.

**So the rule is narrow enough to be certain about** — the `check-rows.js` lesson, where the first
version had 95 findings and 2 real ones. One question: does an `api()` call have a `.then` that says
success (`toast()`, `closeSheet()`) without the reply being examined for an error anywhere in that
handler? Everything else is left alone. **Proved both ways on the bug that prompted it**, and it
finds nothing else across the app — which is the answer, not an empty check: 23 `api()` callers, and
the one that made a claim was mine.
