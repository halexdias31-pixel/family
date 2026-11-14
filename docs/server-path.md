# One way to the server

Today the site talks to the server through **129 separate doors** ("actions"): one for saving a notepad, one for reading answers, one for each admin list, and so on. Each door has its own code for "who is allowed in" and "what do they get back". Step 2 replaces most of them with **three general doors**, plus a short list of doors that must stay special, all checked against **one permission table**.

The full list, door by door, is `data/settings/server-actions.json` (refreshed by `node tools/server-actions.js --write`). The table is the `item` rows of `data/settings/permissions.json`. Both are held by `node js/check-server-path.js`.

## The three general doors

| Door | What it does | Status |
|---|---|---|
| `readItems` | Read items of one kind (questions, a person, messages …) | **Built (slices 1–2)**: the library (questions, textbook content, practicals, projects); your own profile, answers and messages; an admin's lens, person form and card |
| `saveItem` | Save one item | **Built (slice 3)**: your settings, notepad, to-do, email choices, answers, stars, a message read, your post; an admin's layout, words, listing, people, spotlight and owner answers |
| `deleteItem` | Delete one item | **Built (slice 3)**: your post; an admin's person |

Each asks the same question of the table: *may this role do this verb to this kind, and which fields must be left out?*

## Every door's fate

**General — folds into a general door (25).**
- Into `readItems` (9): libItems, myProfile, myAnswers, messages, getProfile, personGet, lensOpen, listOwnerAnswers (and readItems itself).
- Into `saveItem` (14): updateProfile, saveNotepad, saveTodo, setNotify, saveAnswers, favourite, readMessage, editPost, layoutSave, wordsSave, setListed, personSave, spotlight, saveOwnerAnswer.
- Into `deleteItem` (2): deletePost, personDelete.

**Special — stays its own door (50), and why.**
- *Signing in and PINs* (register, verifyEmail, verifyLogin, googleLogin, forgotPin, pinLink, signOut, changePin, resetPin, resendLink, pinShow): somebody who is not signed in yet has no role to look up, and the PIN rules (lockout, emailed PIN, hashing) live in the door itself. **Unchanged.**
- *Money and bookings* (createCheckout, finalizePayment, createJob, move, answerRequest, joinWaitlist, openWaitlist, deleteJob, setRoom, raiseHand, hands): prices are worked out on the server, a child is refused, and the steps must run in order. **Unchanged.**
- *Marking and AI* (aiMark, askAssistant, markWorking, submitAnswer): every press costs a request against a per-person cap; the server marks, never the phone.
- *Email and messages to somebody else* (sendMessage, suggest, applyTeach, digestSendNow): who may write to whom is its own rule.
- *Family links* (claimChild, answerClaim, findChild, linkChild, adminUnlinkFamily, setMyRoles): both sides must agree.
- *Uploads and work files* (photoFile, videoPart, savePhoto, suggestUpload, workFileSave/Open/Delete, workFilesOf, workingOf): files in Drive, and the door decides whose.
- *Open logs* (clientError, healthLog): a phone can break before sign-in; throttled per device.
- *Admin tools* (checkUploads, libExport, libImport).

**Dead — nothing calls them today (54).** Their screens were switched off (posts, staff hub, games, push, records …). They are never folded in; they go when the backend is next redeployed without them. If one comes back, its row says what it would become.

## The permission table

One row per **role × kind × verb**. Roles: *anyone* (signed out), *member* (signed in), *child*, *admin*. Verbs: read, save, delete. Each row also names `via`, the old door it copies, and `hide`, the fields that role is not sent.

| Kind | Read | Save | Delete |
|---|---|---|---|
| question, content, practical, project | member, child, admin (via libItems: signed in, a day's cap) | admin (via libImport) | nobody |
| venue | everybody; **a child without the price** (rate, concession, cost per hour) | not in the table yet | not in the table yet |
| profile | your own: member, child (via myProfile); somebody else's: **admin only** (via lensOpen), logged by id in lens_log | member, child, admin (via updateProfile: your own; somebody else's an admin's, as updateProfile decides) | — |
| answer | your own only: member, child, admin (via myAnswers) | your own only (via saveAnswers) | — |
| message | your own only: member, child, admin (via messages) | marking your own read (via readMessage) | — |
| person (admin's edit form) | admin only (via personGet) | **admin only** (via personSave) | **admin only** (via personDelete) |
| card (admin's card editor) | admin only (via getProfile) | — | — |
| notepad, todo, notify, favourite | — | member, child, admin, your own (via saveNotepad, saveTodo, setNotify, favourite) | — |
| post | — | member, child, admin (via editPost) | member, child, admin (via deletePost) |
| layout, words, listed, spotlight, ownerAnswer | — | **admin only** (via layoutSave, wordsSave, setListed, spotlight, saveOwnerAnswer) | — |

On top of the table, every reply to a child still has prices stripped by the server (`kidPricesOff_`), as before.

## Safety

`check-server-path` fails if:
1. any door is missing from the survey, has no fate or reason, or the survey is out of date;
2. **any role could do anything through a general door that its old door refused** (worked out from `ACTION_ACCESS`), or the general read stops using the library's own cap;
3. `saveItem`/`deleteItem` (`itemsWrite_`) stop asking the old door's own gate (`accessDenied(old, b)`), the table (`itemMay_`) or the child money rule, answer by anything but the old door's own handler under its own name, or change who is asking (personId, name, token) before it runs; or a kind's map entry and its table rows name different doors; or an old door the survey folds in has no kind;
4. the number of old doors the site still calls goes **up** (it may only go down: `check/server-path-ratchet.json`).

## Slice 1 (now)

`readItems` exists in the backend **beside** `libItems`, not instead of it. It asks the table, then reads through the very same steps as `libItems` (same sign-in, same daily cap, same count), so nobody gets more than before. The site does not call it yet, so **nothing visible changes and no redeploy is needed**; the next backend redeploy simply carries it along.

## Slice 2 (now)

`readItems` also reads `profile`, `answer`, `message`, `person` and `card`. Each is answered **by the old door's own handler** (`readItemsOld_` in post-learning.gs), so the fields, the refusals and the child price strip are that door's. Your own goes through myProfile, myAnswers or messages; anybody else's is an admin's alone (lensOpen, personGet, getProfile), one id a call, and an admin's lens leaves a lens_log row of ids.

The site now asks `readItems` for the library, your settings, answers and messages, the lens, the people form and the card editor. Each request names its old door as `old:` (`apiItems_`, js/shell-click.js): **a backend not yet redeployed** answers "unknown action" (or "cannot be read here yet"), and the same request goes through the old door instead. So the site works before and after the redeploy. The survey lists such names as `fallbacks`, not callers; check-server-path allows a fallback only to a door that folds into a general door.

The old doors stay in the backend until a later redeploy removes them (old phones).

## Slice 3 (now)

`saveItem` and `deleteItem` exist. The request names the kind in `item` (not `kind`: setNotify, favourite and spotlight already use `kind` for their own field) and is otherwise **the old door's own request, unchanged**. The backend (`itemsWrite_`, post-learning.gs):
1. finds the kind's old door (`saveItemsOld_` / `deleteItemsOld_`) — a kind not listed is refused (`why: 'kind'`);
2. asks **that door's own gate again, by its name** (`accessDenied(old, …)`): signed in, and an admin's door an admin's alone, although `saveItem` itself is `self` at the gate;
3. asks the table (`itemMay_(item, verb, role)`) and the child money rule of the old door;
4. runs the old door's own handler with the same request and the old door's name, so fields, validation, refusals, logging (lens_log) and the rows written are that door's. A learner's answers go through `saveAnswers` itself: the same rows, byte for byte.

Folded in: updateProfile, saveNotepad, saveTodo, setNotify, saveAnswers, favourite, readMessage, editPost, layoutSave, wordsSave, setListed, personSave, spotlight, saveOwnerAnswer; deletePost, personDelete. Nothing about signing in, PINs, money or marking moves.

The site sends `saveItem`/`deleteItem` with `old:` beside it, as the reads do (`apiItems_`): an old backend answers "unknown action" and the same request goes to the old door. A **keepalive** flush (answers sent as the page closes) is one request only: the old door, until the payload's `features` lists `saveItem`. editPost and deletePost have no caller (their screens are off), so nothing switched there.

check-lens runs both doors on the real .gs, side by side on two backends seeded alike: every kind's tabs and reply match the old door's; signed out, a parent or a child on an admin's kind, a child or parent on somebody else's profile, email choice, message or answers — refused and nothing written.

**Redeploy needed** for the new doors to answer; until then every write falls back to its old door, so nothing breaks.

## Next slices
1. Once the backend is redeployed and old phones have gone, remove libItems, myProfile, myAnswers, messages, getProfile, personGet, lensOpen and the 16 write doors above, and the `old:` fallbacks.
2. Per-field write rows in the table, so a kind's fields are the table's and not only the old handler's.
3. Remove the dead doors at a redeploy.
