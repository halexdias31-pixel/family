## Messages poll, and the Refresh card was a page with no message on it

**Reported as "when you do recieve a message you shouldnt have a refresh messages widget. it should
already be contantly up to date. synced or whatever".** The button was worse than redundant: it was
a PAGE. `dmPages_` opened with a card holding a heading and one control, so the first thing on the
Messages column was a card with nothing on it — which is why `PAGE_HOME.dm` existed at all, an entry
whose only job was hiding something nobody wanted. Both are gone in the same commit, because an
entry left behind would open the column on the SECOND conversation for ever.

**WHAT "SYNCED" CAN HONESTLY MEAN HERE IS POLLING.** The backend is Apps Script behind a `doPost`;
there is no socket and no push channel, and a badge that updated without asking would be a sentence
this app cannot keep. So it asks — **every twenty seconds while the column is on the screen**,
started from `startScreen_` and stopped in `paint` beside the camera, the widgets and the reels,
which is the list that exists for exactly this. `messages` is one tab read rather than the whole
payload, so this is nothing like `installWarmTrigger`.

**And it will not repaint under a reply somebody is typing.** `paint('dm')` rebuilds the markup and
the composer is in it. The data is updated either way; only the redraw waits, and it happens on the
tick after the box is empty. Asked of the DOM rather than remembered in a flag, which is what
`msg-send` and `me-save` already do.

**A FINGERPRINT RATHER THAN A COUNT decides whether to redraw.** A message being marked read changes
no count and changes every badge on the column, so the test is id-plus-read-state per message —
which is exactly what the cards are built from.

### And an empty inbox finally says which empty it is

**`loadMessages` leaves `MESSAGES` alone on a failure** — deliberately, so a blip does not read as
everything having been deleted — so a first fetch that never arrived drew *"Nothing yet."* over an
inbox nobody managed to read. **This repository's oldest fault, on the one screen whose whole job is
telling you somebody wrote to you.** `MSG_FAILED` is the fact `MESSAGES` cannot carry, and it is why
the retry button now sits on the failure and nowhere else: a genuinely empty inbox is being re-asked
every twenty seconds and needs no button.
