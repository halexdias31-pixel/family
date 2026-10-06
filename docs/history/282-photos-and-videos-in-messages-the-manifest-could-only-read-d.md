## Photos and videos in messages: the manifest could only read Drive, and the Ledger needed a column

The owner, 5 October: *"i cant send images, or videos in the chat to people. i think you need to add
something to ledger for that."*

Half right, and the half that was not is the one that mattered. Two things stood between a phone
and a sent photograph, and only the first was in the Ledger:

**The Ledger: no `attachments` column on `messages`.** Both Ledgers the owner uploaded (29 Sep and
1 Oct) stop at `flag_reason`. `SCHEMA.messages` has named `attachments` since files were added to
chat, `TAB` and `WHERE` route the tab to the Ledger, so `ensureSchema` adds it — it had simply never
been run against code that knew the column. Until it is, a message with a file is refused before
anything is uploaded.

**The deployment: `backend/appsscript.json` listed `drive.readonly`.** A written-out `oauthScopes`
list is the WHOLE list — Apps Script stops inferring scopes from the code the moment one is
declared. So `createFile`, `createFolder` and `setSharing` could never be authorised: every Allow
ever pressed granted read-only again, `authoriseDrive` raised no prompt, and the note in
`driveTrouble_` that said "appsscript.json asks for `drive`" and "Apps Script works the scopes out
from the code" was false on both counts. Posts with a photograph (`addPost`) and profile pictures
(`savePhoto`) go through the same Drive calls and were broken the same way; only the read-only
picker for photos already in the folder worked. The manifest now lists
`https://www.googleapis.com/auth/drive` in place of `drive.readonly` — `drive` covers everything the
read-only scope did, and listing both would put two Drive lines on the consent screen for one
permission. Not `drive.file`: it cannot open a folder the app did not create, so
`getFolderById(POSTS_FOLDER)` would fail.

Confirmed by running the real `doPost` (`check-gas-load.js`) over a Drive that enforces scopes the
way Google does. `script.google.com` is not reachable from here, so the live deployment itself was
not inspected.

### The smaller faults found on the way

- **A message of plain words, on a Ledger without the column, said "Not sent" after it was sent.**
  `attachments: ''` was written on every row, `addRow` counts a field with no column as a miss
  whatever its value, and `jsonOut` turned that into an error — after the row and the e-mail. Retry
  then hit the five-minute gap. The cell is written only when there are files.
- **A refused `createFolder('Messages')` was reported as "No posts folder"**, sending the owner to the
  config tab to fix a row that was right. `getMessageFolder_` now says which of three it was.
- **`checkScopes` counted `drive.readonly` as `drive`** (`indexOf('/auth/drive')`). One reader of the
  token now (`heldScopes_`), and a scope matched by its whole name (`holdsScope_`).
- **A parent was shown fifteen lines of `googleapis.com/auth/...`.** `driveTrouble_(err, admin)`: the
  admin gets the diagnosis and the fix (the consent link when Apps Script hands one over, otherwise
  the editor's Run → Allow, then a new version); everybody else one sentence saying it is the site's
  side. Same for posts and profile pictures. The admin's version is one line a paragraph now, and
  leads with what the token holds rather than Google's "Specified permissions are not sufficient";
  on the phone the consent address or `?setup=1` is a 44px control beside Retry (`Allow it`,
  `Open ?setup=1`) instead of a 14px link inside the red sentence.
- **A photo over 2MB that the browser cannot redraw — a HEIC in Chrome — was dropped in silence**, and
  any file that could not be read was too. The first is now sent as it is; the second goes back in
  the box with its name said while the rest are sent.
- **A clip with no type** (shared in from another app) was drawn as a "MOV" chip. Typed by its name,
  on the server before it is stored (`msgTypeOf_`) and on the phone for a pending bubble (`msgKind_`).
- **The caps comment said 20MB is "about a minute" of phone video.** It is about twenty seconds of
  1080p from an iPhone — most of "can't send videos" once the scope is fixed. The caps stay
  (20MB a file, 32MB a message, 6 files: the base64 body has to fit under the ~50MB Apps Script
  takes in one POST); the refusal for a clip now says to trim it to about twenty seconds.

### Decisions the owner may want to change

- **A message goes whole or not at all.** If any file cannot be kept, nothing is sent and the files
  already made are binned, so a Retry does not keep the first photograph twice. The refused bubble
  offers Retry, **Words only** (when something was typed) and Remove. Words only sends the words and
  puts the files back in the box — never dropped.
- **Check uploads is an admin-only widget on the Tools column**, the flyer maker's lock, appended last
  so nobody's remembered page moves. It asks the deployment that is serving the site (not the
  editor) four questions — the column, the scope, the folder, and whether a test file can be made,
  shared by link and binned — and lists the fix in order when one fails, with the consent screen and
  `?setup=1` as tiles. It leaves nothing behind: one binned text file, and it does not make the
  `Messages` folder (the first real send does). Its answer grows the card, so it places the column
  again — `check/ui.js` found the pane 2,386px off the glass at 768 before it did.
- **Five posts waiting per person, and the camera's caps on every post.** Five is a guess at "more
  than a trip's worth, less than a file host". It is `POST_WAITING_MAX` in content.gs. An admin is
  never queued.
- **A waiting post's pictures are still shared by link.** The admin approves a post by looking at it
  on their phone, and the picture comes from `lh3.googleusercontent.com`. That only works with link
  sharing, unless that phone's browser happens to be signed in as the Drive's owner. A waiting post
  is sent only to the admin and its author (`doGet`), so its address reaches nobody else. **A refused
  post's files stay in Drive, still shared.** Binning them on refusal would close the last gap. It is
  not done here: `deletePost` keeps pictures on purpose, and a post can carry a picture that was
  already in the folder before anybody posted it.

### Checks

`js/check-uploads.js`, on the roster: its Drive refuses a write without `.../auth/drive`, and its
token holds exactly what the manifest lists — so the manifest going back to `drive.readonly` is red
(proved). Through the real backend and, for what is drawn, jsdom windows whose every POST that same
backend answers: no column, a read-only token, the manifest's own token, one of three failing half
way, Check uploads admin-only, both sides of the thread drawing an `<img>` and a
`<video controls playsinline preload="metadata">`, Words only, an unreadable file kept, a HEIC sent.
Twelve mutations, each red for its own reason. Two `check/states.js` states: the admin's refusal
with Retry, Words only, Remove and Allow it, the address not also printed (dm), and Check uploads
answered with two crosses, three steps and an Allow tile (tools).

After the review, two more sections:

- **Posts (8).** The caps are compared with the camera card's own numbers, read out of posts.js, in
  both directions. A PDF, SVG, HTML or untyped file is refused, and so is a clip over 20MB, with
  nothing made in Drive. Five waiting posts are allowed and the sixth is refused with nothing made.
  A deleted waiting post does not count. An admin is not queued.
- **`authoriseDrive` (9).** READY with every scope allowed, and the test file shared and binned. DO
  NOT DEPLOY on a read-only grant, and on a partial one (Drive ticked, e-mail not). With a showcase
  folder set, the verdict is still the last line.

- **The site's own instructions (3, 7).** Every "press Allow, then New version" now waits for
  `authoriseDrive` to say READY: the admin's refusal in a message, Check uploads' third step,
  `checkEverything`, and the boot page's "Authorization is required" advice. The same order on the
  owner's steps would take the site down if it were said on the site, so the check asks for it in
  both the editor wording and the consent-link wording. The two states seed the new sentences. At
  320 and 390 the steps still fit the Tools card, and at 320 the thread scrolls to the controls, as
  it did before.

Eleven more mutations, each red for its own reason: no caps, any type, a total cap tighter than the
phone's, no queue limit, deleted posts counted, caps checked after the upload, the verdict ignoring
`getAuthorizationStatus`, no verdict line, a test file that is not shared, the admin's fix sentence
ungated, and Check uploads' step ungated.

### After the review: posts, the gate, the triggers and the stamp

A review of the branch found four things the first pass missed. Each is fixed here or handed to the
merge, and all four come from the same change: the manifest asking for `drive`.

- **The wider scope opened post uploads, and they had no limits.** `addPost` is open to any
  signed-in account. `driveKeep_` kept any `data:` URL of any type at any size, uploaded *before* it
  asked who was posting, and shared it by link while the post was still waiting for approval. Under
  `drive.readonly` every one of those uploads failed. Under `drive`, any registered account could
  have put about 50MB of anything into the business's Drive per request, with no limit on how often.
  Now, before a byte is uploaded: the poster is worked out first; a post holds photos (`jpeg`, `png`,
  `gif`, `webp`, `heic`) and videos only, and never SVG; a clip may be up to 20MB and a post up to
  45MB of base64. Those are the camera card's own numbers (`CAM_VID_MAX`, `CAM_POST_MAX`), and the
  check reads them out of posts.js, so nothing the phone sends is refused. The rate limit is the
  approval queue: anyone who is not an admin can have **five posts waiting**, and the sixth is
  refused until the admin has looked at one. A waiting post the admin deleted does not count.
- **`authoriseDrive`'s log was the only safety net, and it was not a gate.** A new version whose
  manifest lists a permission the deployer has not allowed answers *every* visitor "Authorization is
  required". Check uploads cannot catch that, because it runs on that same broken deployment. The
  log was supposed to end "Can write: yes", but the showcase folder's line came after it, and Google's
  consent screen has a tick box per permission now. So an Allow with the e-mail box unticked wrote
  the test file fine and still left the script short. Its last line is now always **READY** or
  **DO NOT DEPLOY A NEW VERSION YET**. READY needs three things: Apps Script says nothing in the
  manifest is still to be allowed (`getAuthorizationStatus`), the token holds `drive` by its whole
  name, and a test file was made, shared by link and binned. The refusal says how to get past both
  of Google's screens.
- **The background triggers fail between the sync and the Allow.** Installed triggers run the
  editor's latest code under the editor's manifest, not the deployed version. That covers the sheet
  watch (`onSheetChange`, `warmAfterEdit`) and the nightly `closeFinishedJobs` and `geocodeVenues`.
  From the sync until Allow, the editor's manifest asks for `drive` and nobody has granted it, so
  every one of them fails with "Authorization is required". While that lasts, edits typed into the
  sheet stop reaching the site for up to six hours and failure e-mails arrive. Google also disables
  a trigger that keeps failing. Hence "one sitting" and step 5 below.
- **FOR THE MERGE: bump all four stamps together** (`BACKEND_VERSION`, `DOGET_VERSION`,
  `DOPOST_VERSION`, `BOOKING_VERSION`, e.g. `2026-10-05-f-chatmedia`). They are not bumped here
  because workers do not bump them. This merge cannot skip it, for two reasons:
  - The payload cache key is `payloadGen_()|BACKEND_VERSION|viewer` and lasts six hours, and
    `warmPayload` refreshes only the anonymous copy. With the old stamp, an admin can be served a
    payload built by the old deployment, whose `features` has no `checkUploads`. Step 6 would then
    say "no Check uploads yet" and send the owner round the loop again.
  - `autoMigrate` adds missing columns only when `BACKEND_VERSION` moves. With a new stamp, the
    first request after step 4 adds `attachments` even if step 3 is skipped.

### OWNER STEPS, in this order — STEPS 1 TO 5 IN ONE SITTING

Between step 1 and step 2, every background job is failing (see above). Make that gap minutes, not
an evening.

1. **Sync `backend/`** into Apps Script once this is on `main` (the GitHub Assistant's ↓ in the editor
   toolbar). Then Project Settings → tick *Show "appsscript.json" manifest file in editor*, open it,
   and check it lists `https://www.googleapis.com/auth/drive`, not `drive.readonly`.
2. **Choose `authoriseDrive` in the editor's function dropdown and press Run.**
   - Google says *"Google hasn't verified this app"*. Press **Advanced**, then **Go to … (unsafe)**.
     It is your own script.
   - On the next screen, **tick every box, or Select all**, then Continue. It should say the script
     can *see, edit, create and delete* your Drive files.
   - Then read the **last line** of the execution log. **Do not do step 4 unless it starts `READY`.**
     If it says `DO NOT DEPLOY A NEW VERSION YET`, it says why. Do what it says and run it again.
3. **Run `ensureSchema`** from the same dropdown. It adds `attachments` to the `messages` tab in the
   Ledger and changes nothing else. Once step 4 is done, the site's `/exec?setup=1` does the same
   thing. With the stamp bumped at merge, the first visit after step 4 does it too.
4. **Deploy → Manage deployments → the pencil on the active deployment → Version: New version →
   Deploy.** Editing the existing deployment keeps the `/exec` address the site calls.
5. **Triggers** (the clock icon in the editor's left bar). If any trigger shows errors since step 1,
   or is disabled, run **`installTriggers`** once from the dropdown. It clears and reinstalls the
   nightly jobs and the sheet watch, leaving one of each. It does **not** reinstall a five-minute
   `warmPayload`, on purpose: `installTriggers` explains that one would use up the day's script time
   and stop the nightly jobs. If a `warmPayload` trigger is listed, it was added by hand. Leave it
   disabled or delete it. Do not run `installWarmTrigger` to "repair" it. (The review suggested that,
   and this repo decided against it.)
6. **On the site, signed in as admin: Tools → Check uploads → press it.** Four ticks and "Ready" mean
   photos and videos can be sent in messages. Anything else is listed with the step still to do.
