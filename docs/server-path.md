# One way to the server

Today the site talks to the server through **129 separate doors** ("actions"): one for saving a notepad, one for reading answers, one for each admin list, and so on. Each door has its own code for "who is allowed in" and "what do they get back". Step 2 replaces most of them with **three general doors**, plus a short list of doors that must stay special, all checked against **one permission table**.

The full list, door by door, is `data/settings/server-actions.json` (refreshed by `node tools/server-actions.js --write`). The table is the `item` rows of `data/settings/permissions.json`. Both are held by `node js/check-server-path.js`.

## The three general doors

| Door | What it does | Status |
|---|---|---|
| `readItems` | Read items of one kind (questions, a person, messages …) | **Built (slice 1)**, for the library: questions, textbook content, practicals, projects |
| `saveItem` | Save one item | Planned |
| `deleteItem` | Delete one item | Planned |

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

On top of the table, every reply to a child still has prices stripped by the server (`kidPricesOff_`), as before.

## Safety

`check-server-path` fails if:
1. any door is missing from the survey, has no fate or reason, or the survey is out of date;
2. **any role could do anything through a general door that its old door refused** (worked out from `ACTION_ACCESS`), or the general read stops using the library's own cap;
3. the number of old doors the site still calls goes **up** (it may only go down: `check/server-path-ratchet.json`).

## Slice 1 (now)

`readItems` exists in the backend **beside** `libItems`, not instead of it. It asks the table, then reads through the very same steps as `libItems` (same sign-in, same daily cap, same count), so nobody gets more than before. The site does not call it yet, so **nothing visible changes and no redeploy is needed**; the next backend redeploy simply carries it along.

## Next slices
1. Point the library reader (`js/find-parts.js`) at `readItems`; remove `libItems` at the following redeploy.
2. Add person, answer and message reads to `readItems` (self-only rows), retiring myProfile, myAnswers, personGet, getProfile, lensOpen.
3. Build `saveItem` with per-field write rows, starting with the notepad, to-do and email choices.
4. `deleteItem` for posts and people.
5. Remove the dead doors at a redeploy.
