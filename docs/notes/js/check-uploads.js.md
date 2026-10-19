# js/check-uploads.js

The full text of comments in `js/check-uploads.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-uploads.js A PHOTOGRAPH OR A CLIP SENT IN A MESSAGE IS KEPT, OR THE PERSON IS TOLD WHY — AND THE OWNER HOW.

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-uploads.js

   A PHOTOGRAPH OR A CLIP SENT IN A MESSAGE IS KEPT, OR THE PERSON IS TOLD WHY — AND THE OWNER HOW.

   ASKED FOR AS *"i cant send images, or videos in the chat to people. i think you need to add
   something to ledger for that."* Two things were in the way and NO CHECK COULD SEE EITHER:

     · `backend/appsscript.json` listed `drive.readonly`. A written-out `oauthScopes` list is the
       whole list — Apps Script stops inferring scopes from the code — so `createFile`, `createFolder`
       and `setSharing` could never be authorised, however many times Allow was pressed. Every
       harness here stubbed `DriveApp` as a thing that simply works, so the manifest was never read.
     · the Ledger's `messages` tab had no `attachments` column, which `ensureSchema` adds — and a
       refusal that told a parent to "run ?setup=1".

   SO THE DRIVE HERE ASKS FOR THE SCOPE GOOGLE ASKS FOR. `driveFor` refuses a write unless the token
   holds `.../auth/drive` and a read unless it holds that or `drive.readonly`, with Google's own
   sentence — and the token, by default, holds EXACTLY WHAT THE MANIFEST LISTS. A manifest that
   cannot write is a red here before it is a parent's photograph that did not arrive.

   THROUGH THE REAL BACKEND (`check-gas-load.js`) AND, FOR WHAT IS DRAWN, THE REAL APP: a jsdom
   window whose every POST is answered by that same backend, so the bubble that says "Not sent" is
   reading the sentence `sendMessage` actually wrote, and the `<img>` and `<video>` in the thread are
   drawn from the cell `msgAttachIn_` actually stored. Two windows on one Ledger, so the clip is
   asked for on BOTH sides of the conversation.

   WHAT IT ASKS, IN ORDER:
     1. the manifest holds `drive` while the backend calls Drive's write methods; the tab, its
        columns and its file are all named (TAB, SCHEMA with `attachments`, WHERE)
     2. no column: files refused in a sentence a parent can read, the owner told the address; a
        message of plain words still goes (it used to come back "Not sent" having been sent)
     3. a token that can only read: nothing sent, nothing left in Drive, the parent told it is the
        site's side, the admin told the fix — and never "No posts folder"
     4. the manifest's own token: three files kept and shared, the cell `url#type#name | …`, a file
        with no type typed by its name, and both sides drawing an `<img>` and a playable `<video>`
     5. one file of three refused half way: the two already made are binned, nothing is sent
     6. the phone: a refusal about the files offers Words only, which sends the words and puts the
        files back in the box; an unreadable file is never dropped in silence; a photograph the
        browser cannot redraw goes as it is
     7. Check uploads: admin only, four answers, one test file binned, no folder left behind, and
        the fix in order when something is missing — pressed from the Tools column
     8. posts, which the same scope opened: the phone's own caps, photos and videos only, five
        waiting a person, and every refusal made before a byte reaches Drive
     9. `authoriseDrive`'s last line: READY only when the whole manifest is allowed and a file was
        made and shared, DO NOT DEPLOY otherwise — the one safety net before a new version

     node js/check-uploads.js
================================================================================================== */
```

### ---------- A DRIVE THAT ASKS FOR THE SCOPE GOOGLE ASKS FOR

top level, before `driveFor`

```
/* ---------- A DRIVE THAT ASKS FOR THE SCOPE GOOGLE ASKS FOR ------------------------------------------
   Reads need `drive.readonly` or `drive`; `createFile`, `createFolder`, `setSharing` and `setTrashed`
   need `drive`. The sentences are Google's, because the backend decides what a failure MEANS by
   reading them (`driveDenied_`). `world.failOn` makes the n-th `createFile` throw an outage instead,
   for the journey where one file of three does not go. */
```

### ---------- ONE LEDGER, ONE DRIVE, ONE DEPLOYMENT

top level, before `world`

```
/* ---------- ONE LEDGER, ONE DRIVE, ONE DEPLOYMENT ---------------------------------------------------
   opts: scopes (default: the manifest's), noColumn, consent (a URL `consentUrl_` may hand over),
   failOn (the n-th createFile has an outage). */
```

### `NOT_REQUIRED` ONLY WHEN THE TOKEN HOLDS EVERY SCOPE THE MANIFEST LISTS, which is what Apps Script answers — a grant with one box unticked is still `REQUIRED`.

in `world`

```
/* `NOT_REQUIRED` ONLY WHEN THE TOKEN HOLDS EVERY SCOPE THE MANIFEST LISTS, which is what Apps
     Script answers — a grant with one box unticked is still `REQUIRED`. `authoriseDrive`'s verdict
     reads this, so a world that said NOT_REQUIRED regardless could never catch a partial Allow. */
```

### 4. THE MANIFEST'S OWN TOKEN — AND 5.

top level, before `WORKS`

```
/* ================================================================================================
   4. THE MANIFEST'S OWN TOKEN — AND 5. ONE OF THREE REFUSED HALF WAY
   ================================================================================================ */
```

### 7. CHECK UPLOADS, THROUGH THE BACKEND

top level, before `W`

```
/* ================================================================================================
   7. CHECK UPLOADS, THROUGH THE BACKEND
   ================================================================================================ */
```

### 8. POSTS, NOW THAT DRIVE CAN BE WRITTEN `addPost` is open to any signed-in account and used to keep any `data:` URL at any size, uploaded before it even asked

top level, before `cam`

```
/* ================================================================================================
   8. POSTS, NOW THAT DRIVE CAN BE WRITTEN
   `addPost` is open to any signed-in account and used to keep any `data:` URL at any size, uploaded
   before it even asked who was posting. Under `drive.readonly` every such upload failed; under the
   manifest's `drive` it would have been anybody's file host. The caps are the PHONE'S OWN NUMBERS,
   read out of posts.js, so the first half asks that nothing the camera card lets through is
   refused, and the second that what it would not let through is.
   ================================================================================================ */
```

### 9. AUTHORISEDRIVE: ITS LAST LINE IS THE GATE FOR DEPLOYING A new version whose manifest lists a permission the deployer has not allowed answers every visitor

top level, before `last`

```
/* ================================================================================================
   9. AUTHORISEDRIVE: ITS LAST LINE IS THE GATE FOR DEPLOYING
   A new version whose manifest lists a permission the deployer has not allowed answers every
   visitor "Authorization is required", and Check uploads runs on that same deployment so cannot
   say so. The editor's log is the only safety net — so its last line must be a verdict, and READY
   only when the WHOLE manifest is allowed, not just Drive (the consent screen ticks per permission).
   ================================================================================================ */
```

### 6 AND 7 ON THE SCREEN — THE REAL APP, EVERY POST ANSWERED BY THE REAL BACKEND

top level, before `loadOrder_`

```
/* ================================================================================================
   6 AND 7 ON THE SCREEN — THE REAL APP, EVERY POST ANSWERED BY THE REAL BACKEND
   ================================================================================================ */
```

### ---------- AN UNREADABLE FILE, AND A PHOTOGRAPH THE BROWSER CANNOT REDRAW

in `screens`

```
/* ---------- AN UNREADABLE FILE, AND A PHOTOGRAPH THE BROWSER CANNOT REDRAW ---------------------
     The tutor writes back. `camItemOf_` answers null, as it does for a HEIC in Chrome; one queued
     item is not a file at all, so FileReader throws on it. */
```

### FORTY-FIVE SECONDS, AS THE LOAD ABOVE:

in `screens`

```
/* FORTY-FIVE SECONDS, AS THE LOAD ABOVE: Check uploads is the thirteenth widget on an admin's Tools, and the
     queue starts them one per task behind the slide (`widgetsLater_`). On a machine shared with other
     builders that took 4–13s in jsdom on 12 Oct, base and branch alike, and a cap of fifteen failed a
     drawn tile as a missing one (docs/history/341). It is a wait, not a measurement. */
```

