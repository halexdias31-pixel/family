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
  side. Same for posts and profile pictures.
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
  shared by link and binned — and lists the fix in order when one fails. It leaves nothing behind:
  one binned text file, and it does not make the `Messages` folder (the first real send does).

### Checks

`js/check-uploads.js`, on the roster: its Drive refuses a write without `.../auth/drive`, and its
token holds exactly what the manifest lists — so the manifest going back to `drive.readonly` is red
(proved). Through the real backend and, for what is drawn, jsdom windows whose every POST that same
backend answers: no column, a read-only token, the manifest's own token, one of three failing half
way, Check uploads admin-only, both sides of the thread drawing an `<img>` and a
`<video controls playsinline preload="metadata">`, Words only, an unreadable file kept, a HEIC sent.
Twelve mutations, each red for its own reason. Two `check/states.js` states: the admin's refusal
with its consent link and three controls (dm), and Check uploads answered with two crosses and four
steps (tools).

### OWNER STEPS, in this order

1. **Sync `backend/`** into Apps Script once this is on `main` (the GitHub Assistant's ↓ in the editor
   toolbar). Then Project Settings → tick *Show "appsscript.json" manifest file in editor*, open it,
   and check it lists `https://www.googleapis.com/auth/drive` — not `drive.readonly`.
2. **Run `ensureSchema`** from the editor's function dropdown (or, once step 4 is done, open the site's
   `/exec?setup=1` — that runs the DEPLOYED code, so before step 4 it may not know the column). It adds
   `attachments` to the `messages` tab in the Ledger and changes nothing else.
3. **In the editor, run any function and press Allow.** If step 2 already asked, that was this step.
   `authoriseDrive` is the useful one to run: its log should end "Can write: yes". The prompt should
   now say the script can *see, edit, create and delete* Drive files. Do this BEFORE step 4: a new
   version whose scopes nobody has allowed answers every visitor with "Authorization is required".
4. **Deploy → Manage deployments → the pencil on the active deployment → Version: New version →
   Deploy.** Editing the existing deployment keeps the `/exec` address the site calls.
5. **On the site, signed in as admin: Tools → Check uploads → press it.** Four ticks and "Ready" means
   photos and videos can be sent in messages; anything else is listed with the step still to do.
