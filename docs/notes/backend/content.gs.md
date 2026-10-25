# backend/content.gs

The full text of comments in `backend/content.gs` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — 40_content.gs (5 of 8) POSTS, RESOURCES, THE MAP, AND DRIVE.

top level, before `consentUrl_`

```
/* ==================================================================================================
   @family. — 40_content.gs   (5 of 8)

   POSTS, RESOURCES, THE MAP, AND DRIVE.

   Everything that reads a file, counts a page, or fetches geometry. All of it is either behind a
   URL somebody runs on purpose or behind a nightly trigger — none of it runs on a page load, which
   is what keeps the payload to sheet reads.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */
```

### WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens.

top level, before `consentUrl_`

```
/**
 * WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens.
 *
 * "Specified permissions are not sufficient to call DriveApp.Folder.createFile" is Google's
 * wording and it is accurate and useless: it names the missing scope and not one of the four
 * things that cause it. The one that catches everybody is that a DEPLOYED VERSION PINS ITS
 * MANIFEST — `/exec` runs the appsscript.json as of the version it was deployed at, so declaring
 * the scope and re-authorising in the editor fixes the editor and changes nothing about the
 * deployment until a new version is published.
 */
```

### THE CONSENT SCREEN, AS A LINK.

top level, before `consentUrl_`

```
/**
 * THE CONSENT SCREEN, AS A LINK.
 *
 * A deploy cannot grant a permission and neither can any amount of code: consent is a person
 * pressing Allow, which is the whole point of it. But Apps Script will HAND YOU THE URL of that
 * screen, and a link is something the site can show and a thumb can press.
 *
 * It is not guaranteed to be there. Apps Script offers it when it considers the script
 * unauthorised; a script that is authorised with a NARROWER set than it now needs may be
 * considered authorised, and then there is nothing to hand over and the editor is the only way.
 * Which of those it is, is worth knowing rather than guessing, so it says.
 */
```

### A postcode the service does not recognise comes back as a null result rather than an error, so it has to be tested for — otherwise a typo writes `undefined`

in `geocodeVenues`

```
/* A postcode the service does not recognise comes back as a null result rather than an
         error, so it has to be tested for — otherwise a typo writes `undefined` into the sheet and
         the venue lands off the coast of Africa at 0,0. */
```

### DOUGLAS–PEUCKER. Keep the point furthest from the straight line between the ends if it is further off than the tolerance, and recurse either side of it

top level, before `simplify_`

```
/**
 * DOUGLAS–PEUCKER. Keep the point furthest from the straight line between the ends if it is
 * further off than the tolerance, and recurse either side of it; otherwise the whole stretch is a
 * straight line and everything between the ends goes.
 *
 * It keeps CORNERS and throws away wobble, which is exactly the right thing to lose: a road's
 * shape is its turns.
 */
```

### THE RAILWAY IS NOT ASKED FOR ANY MORE.

in `q`

```
/* THE RAILWAY IS NOT ASKED FOR ANY MORE. It was drawn dashed so it would not read as a road —
         which worked, and left the map covered in dotted lines that answer no question anybody has
         on a screen about tutoring. A tram line is not a place you can be taught. */
```

### BUILDINGS: THE TALL ONES, AND ONLY THE TALL ONES.

in `q`

```
/* BUILDINGS: THE TALL ONES, AND ONLY THE TALL ONES.
         This asked for every building with a NAME, on the reasoning that a named building is
         somebody. True, and it is also every corner shop, every pub and every church — hundreds of
         grey rectangles at a size where none of them is legible.
         Five storeys is the line. Above it a building stands over the roofs and is a landmark you
         navigate by; below it, it is texture.
         ASKED FOR TWICE, because OSM records how tall a building is either as `building:levels` or
         as `height` in metres depending entirely on who mapped it — and asking for one of them
         finds about half of them. Twenty metres is five storeys said the other way. */
```

### ---------- THERE IS MORE THAN ONE OVERPASS, AND ONE OF THEM WILL ANSWER

in `fetchMap`

```
/* ---------- THERE IS MORE THAN ONE OVERPASS, AND ONE OF THEM WILL ANSWER -------------------
         THIS ASKED overpass-api.de AND NOTHING ELSE, and it came back "Address unavailable" — which
         is Apps Script saying it could not reach the host at all. Not a rate limit, not a bad query:
         the main instance would not talk to Google's servers.

         Overpass is run by volunteers as several independent mirrors. They take the same query and
         return the same thing; they differ only in who runs them, where, and how busy they are. So
         depending on one is depending on one volunteer's afternoon.

         Tried in turn, first to answer wins, and what each one said is reported if none does — the
         difference between "they are busy" and "this server cannot reach any of them" needs two
         completely different things done about it, and one sentence covering both tells you neither.

         kumi is second because it is fast and rarely refuses; private.coffee is third because it is
         a different country on a different network, which is what makes it worth having rather than
         a third copy of the first two. */
```

### `UrlFetchApp` THROWS rather than returning a code when it cannot reach a host at all — which is the case that produced "Address unavailable" and the case

in `fetchMap`

```
/* `UrlFetchApp` THROWS rather than returning a code when it cannot reach a host at all —
             which is the case that produced "Address unavailable" and the case `muteHttpExceptions`
             does nothing about, because there was no HTTP response to mute. */
```

### NEWEST ROW FIRST, WHICH `delRow` ALSO NEEDS.

in `fetchMap`

```
/* NEWEST ROW FIRST, WHICH `delRow` ALSO NEEDS. Deleting from the top shifts every row
         below it up by one, so a list walked forwards deletes the wrong rows after the first —
         `sort((a, b) => b._row - a._row)` above is what makes it safe, and `delRow` corrects the
         in-memory `_row`s the same way so the two cannot disagree. */
```

### HOW TALL, AND WHAT IT IS.

in `fetchMap`

```
/* HOW TALL, AND WHAT IT IS. `height` in metres wins where somebody has surveyed it; storeys
         otherwise, at about three metres each, which is the usual conversion and near enough for
         something drawn a few pixels wide. Zero means nobody has said, and the drawing can decide
         what to do about that rather than being handed a made-up number. */
```

### THE HAND-MEASURED BUILDINGS, ready to draw.

top level, before `tidyRing_`

```
/**
 * THE HAND-MEASURED BUILDINGS, ready to draw.
 *
 * The tab stores what a ruler on a satellite photograph gives you — a length, a width and a
 * compass bearing. What a map needs is a CORNER LIST. Turning one into the other is trigonometry
 * and belongs here rather than in the phone: it is the same four corners for every reader, and a
 * second implementation of it is a second chance to get the rotation backwards.
 *
 * Small enough to ride in the main payload — a name and six numbers each, so a hundred of them is
 * a few kilobytes. The fetched OSM geometry is megabytes and stays behind `?map=`.
 */
```

### ---------- AN OUTLINE TRACED BY HAND, TIDIED

top level, before `tidyRing_`

```
/* ---------- AN OUTLINE TRACED BY HAND, TIDIED --------------------------------------------------
 * NOBODY CLICKS THE SAME PIXEL TWICE. A corner walked round on a satellite photograph comes back as
 * two points a few metres apart — the rec ground has an exact repeat, and Sainsbury's has a pair
 * 9.2 metres apart that is plainly one corner of the building. Both are the same mistake at
 * different precision, and neither is worth asking somebody to go back and fix.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS. A nine-metre stub between two hundred-metre walls is not a
 * wall, but it IS an edge, and the board squares a site to the grid by finding its longest edge and
 * turning the whole thing until that edge lines up. A stub is never the longest, so that is safe —
 * but a stub is enough to put a notch in the tiles, and at tile resolution a notch is a missing
 * corner of a building.
 *
 * TEN METRES, AND THE NUMBER COMES FROM THE DATA RATHER THAN FROM TASTE. Sorting every edge of
 * every outline on the tab gives a clear gap:
 *
 *      9.2m   Sainsbury's — two clicks on one corner
 *     12.9m   Britannia Point's northern block — a real end wall
 *     13.8m   Priory — a real return
 *
 * So ten sits in the gap: above every wobble seen so far and below every genuine feature. If a
 * future site has a real eleven-metre wall this will eat it, and the fix then is to widen the gap
 * by measuring again rather than by nudging the number until something looks right.
 */
```

### ---------- THE THRESHOLD HAS TO SUIT THE THING BEING TIDIED

in `tidyRing_`

```
/* ---------- THE THRESHOLD HAS TO SUIT THE THING BEING TIDIED ---------------------------------
     TEN METRES IS RIGHT FOR A SUPERMARKET AND WRONG FOR A BRIDGE. The footbridge over the Wandle is
     eight metres by twenty, and its two end edges are 5.5m and 4.4m — both under ten. Tidying it at
     a fixed ten metres left TWO points, and two points is not a shape: it drew nothing at all,
     silently, which is the worst way for this to fail.

     SO IT IS A FRACTION OF THE SHAPE'S OWN SIZE, capped at ten. A quarter of the shortest side of
     the bounding box: on Sainsbury's 168-metre frontage that is well past ten and the cap holds it
     there; on an eight-metre bridge it is two metres, which is smaller than either end wall and
     leaves the bridge a bridge.

     THE PRINCIPLE IS THE ONE THIS FILE KEEPS RE-LEARNING: a number that is right for the biggest
     thing on the tab is wrong for the smallest, and the fix is to measure the thing rather than to
     pick a better constant. */
```

### AND NEVER BELOW THREE, whatever the threshold says.

in `tidyRing_`

```
/* AND NEVER BELOW THREE, whatever the threshold says. A ring of two points is a line and a line
     draws nothing — so a shape that would be tidied out of existence keeps what it has instead.
     Better a slightly untidy bridge than no bridge. */
```

### ---------- POINTS ARE POINTS, WHATEVER THE SHAPE CELL SAYS

in `landmarks`

```
/* ---------- POINTS ARE POINTS, WHATEVER THE SHAPE CELL SAYS -------------------------------
       THIS REQUIRED `shape` TO BE EXACTLY 'polygon' and the landmarks tab has no `shape` column
       filled in on any row — so eleven buildings with surveyed outlines, some of them thirty-eight
       vertices long, all fell through to the rectangle branch below and were drawn as boxes. The
       measuring was done and thrown away at the last step.

       A CELL WITH COORDINATES IN IT IS AN OUTLINE. There is no other thing `points` could mean, so
       having it is the condition — and `shape` goes back to being what it was for: saying that a
       row WITHOUT points should still be drawn as a rectangle from its width and depth. */
```

### A ROTATED RECTANGLE, from the centre outwards.

in `landmarks`

```
/* A ROTATED RECTANGLE, from the centre outwards. `bearing` is the compass direction the
           front faces — 0 north, 90 east — so it is measured CLOCKWISE FROM NORTH, which is the
           opposite direction to the mathematical convention and the thing that would silently
           mirror every building if it were assumed rather than converted. */
```

### `u` runs along the FRONT and `v` runs BACK from it.

in `landmarks`

```
/* `u` runs along the FRONT and `v` runs BACK from it. At bearing 0 the front faces north,
           so the front lies east-west and the depth runs north-south.
           `bearing` is clockwise from north; the rotation below is written in that same sense, so
           there is no conversion to get backwards. Getting it wrong mirrors every building on the
           map, and a mirrored rectangle looks exactly like a correct one until it is compared to
           the street it sits on — which is what the test does. */
```

### ---------- TWO DIFFERENT DEPTHS, AND THEY WERE THE SAME KEY

in `landmarks`

```
/* ---------- TWO DIFFERENT DEPTHS, AND THEY WERE THE SAME KEY --------------------------------
         `depth` WAS WRITTEN TWICE IN THIS OBJECT. Here from `depth_m` — the surveyed metres — and
         again forty lines down from `plot_depth`, the hand-set number of tiles. A repeated key in an
         object literal is not an error in JavaScript: the last one silently wins. So every landmark's
         real depth was thrown away before it left the server, and the board received a zero.
         NOTHING LOOKED WRONG, which is what makes it worth the words. Plots fell back to the hand-set
         `plots` column, which was filled in, so the board drew — just never from the measurement. */
```

### THE FOUR COLUMNS THE TAB HAS AND THE PAYLOAD WAS NOT SENDING.

in `landmarks`

```
/* THE FOUR COLUMNS THE TAB HAS AND THE PAYLOAD WAS NOT SENDING. `label`, `icon`, `role` and
         `roof` have been on the landmarks tab since it was made, and the board could not see any of
         them — which is why it carried its own copy of all thirteen buildings as a literal in the
         JavaScript. A column that exists and is not sent is a column that gets duplicated. */
```

### THE PIECES IT IS MADE OF, gathered here rather than sent as a second list — the board wants a landmark and everything on it together, and joining two arrays on

in `landmarks`

```
/* THE PIECES IT IS MADE OF, gathered here rather than sent as a second list — the board wants
         a landmark and everything on it together, and joining two arrays on the phone would be the
         phone doing a database's job. An empty list is the ordinary case and draws exactly as
         before. */
```

### CORNERS THAT ARE MEANT TO BE ONE CORNER, MERGED.

in `parts`

```
/* CORNERS THAT ARE MEANT TO BE ONE CORNER, MERGED. See `tidyRing_`: an outline traced by
             hand over a photograph has a wobble in it, and two points a few metres apart on what is
             really one corner make a tiny edge that the squaring reads as a wall. */
```

### ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION

top level, before `driveDenied_`

```
/* ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION ---------------------------
   One test, read by every caller that has to decide between "Drive said no" and "something else
   went wrong" — the first is the admin's to fix and the second is worth showing as it is. */
```

### ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS

top level, before `heldScopes_`

```
/* ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS ----------------------
   `driveTrouble_` AND `checkScopes` EACH ASKED THIS IN THEIR OWN WORDS, and `uploadsCheck_` would
   have been the third. Google lists a token's scopes if it is asked, which turns "is the manifest
   in this deployment" from four steps retraced into a list read — so it is asked here, once.
   `error` is the reason it could not even ask (that needs `script.external_request`). */
```

### ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS

top level, before `holdsScope_`

```
/* ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS ------------------------------
   `checkScopes` TESTED `indexOf('/auth/drive')`, and `.../auth/drive.readonly` CONTAINS THAT. So the
   one report written to say whether this deployment may write to Drive said yes on a token that
   could only read — on exactly the deployment the photographs were failing on. */
```

### ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE

top level, before `driveFix_`

```
/* ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE -----------------------------
   THE SAME TWO STEPS EVERY TIME, in the order they work: the person who deployed the site presses
   Allow, and a NEW VERSION is deployed — a deployed version pins the manifest it was made from, so
   an Allow pressed afterwards changes the editor and nothing that is serving the site. The consent
   screen as a link when Apps Script will hand one over (`consentUrl_`), the editor when it will not.
   `consent` is that link or ''.

   AND THE NEW VERSION WAITS FOR `authoriseDrive` TO SAY READY. This said "press Allow; then Deploy",
   and the consent screen ticks per permission now: an Allow with one box unticked, followed by a
   new version, answers every visitor "Authorization is required" — a refusal about one photograph
   turned into the whole site down. `authoriseDrive`'s last line is the only thing that can tell
   the two apart before the deploy, so every route to "New version" goes through it. */
```

### ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT

top level, before `driveTrouble_`

```
/* ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT -----------------------------------------------
   TWO AUDIENCES AND THIS USED TO SPEAK TO ONE OF THEM. The diagnosis below — the scopes the token
   holds, the consent link, the editor steps — is right and is the whole of what the admin needs. It
   went to EVERYBODY: a parent sending a photograph of their child's homework was shown fifteen lines
   of `https://www.googleapis.com/auth/...` they could do nothing about. `admin` decides which. Anybody
   else is told it is the site's side and not theirs, in one sentence.

   A FAILURE THAT IS NOT A PERMISSION goes back as Google said it, to both: "Service error: Drive"
   is somebody else's outage and a Retry is the right answer to it. */
```

### THE DIAGNOSIS COMES WITH THE FAILURE.

in `driveTrouble_`

```
/* THE DIAGNOSIS COMES WITH THE FAILURE. This used to end with "run checkScopes and see" — a fifth
     step, at the end of four, given to somebody who had just failed to post a photograph. The token
     itself says which step is still undone, and asking it costs one request.

     ONE LINE A PARAGRAPH, AND GOOGLE'S OWN SENTENCE ONLY WHERE IT IS THE NEWS. These used to be
     hard-wrapped at the editor's width, which in a bubble 78% of a 320px phone wide came out as a
     ragged column of half-lines, and Google's "Specified permissions are not sufficient …" went
     first even when the token had already been asked and had answered more plainly. When the scope
     is the cause, the scope is what is said. */
```

### ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE

in `driveTrouble_`

```
/* ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE ------
       IT SAID "appsscript.json asks for `drive`" AND "Apps Script works the scopes out from the
       code". Both were false. The manifest listed `drive.readonly`, and an `oauthScopes` list that
       is written out is the WHOLE list: Apps Script stops inferring scopes from the code the moment
       one is declared. So `createFile`, `createFolder` and `setSharing` could never be authorised,
       running `authoriseDrive` raised no prompt, and every Allow ever pressed granted read-only
       again. The manifest says `drive` now (docs/history, "pending-chatmedia"); what is left is
       somebody pressing Allow for it and a new version carrying it. */
```

### WHEN A POST HAPPENED.

top level, before `postWhen_`

```
/**
 * WHEN A POST HAPPENED.
 *
 * Whichever of the three date columns the sheet actually has, in the order that answers the
 * question the feed is asking — when was this, not when did it arrive. A post with no date sorts
 * last rather than to 1970, which is what an empty cell read as a number would do.
 */
```

### EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read, so the order is decided here and nowhere else.

top level, before `postMediaOut_`

```
/* EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read,
   so the order is decided here and nowhere else. Repeats are dropped, because a row whose `image`
   was also typed into `media` would otherwise draw the same photograph twice. */
```

### A file's name without its extension.

top level, before `captionFromName_`

```
/** A file's name without its extension. Only the extension: everything else is somebody's own
    words about their own photograph, and deciding which parts of a filename are meaningful would
    be guessing about the one thing we were told directly. */
```

### `fillPostNames_` WAS HERE, and it is gone with the Drive call it made.

top level, before `reactionSet`

```
/* `fillPostNames_` WAS HERE, and it is gone with the Drive call it made.

   It looked up the name of the file behind a post, so a post with no caption could show that
   instead. Reasonable — and it ran inside `doGet`, six lookups at a time, on every page load: the
   only request to another Google service in the whole payload, for a fallback caption.

   Posts are read from the sheet now and nothing else. The scan still records `file_name` when it
   runs, and the payload still prefers a typed caption and falls back to that recorded name, so
   nothing on screen has changed except that the page no longer waits on Drive to draw.

   Deleted rather than left unused. A function nothing calls is a function somebody reads and
   assumes is doing something — which has cost this project more than one afternoon. */
```

### THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`, read by `settingsInto_` on the phone.

in `reactionSet`

```
/* THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`,
     read by `settingsInto_` on the phone. The backend cannot reach a file in git, so the two rungs
     left are the post's own set and the house list, which is what this fell back to anyway: no row
     of that tab has ever carried a `reactions` key. If a post ever needs a different set the place
     to say so is the post's own cell, which is the rung above. */
```

### ---------- A PICTURE, A CLIP OR A FILE IN A MESSAGE

top level, before `getMessageFolder_`

```
/* ---------- A PICTURE, A CLIP OR A FILE IN A MESSAGE ----------------------------------------------
   THE POSTS FOLDER'S OWN CHILD, `Messages`, made the first time it is needed. A second config key
   would be a second thing somebody has to set before the feature works, and the one folder this
   deployment is already known to be able to write to is the posts folder — `addPost` proves it on
   every photograph. Null when there is no posts folder, and the caller says so.

   SHARED ANYONE-WITH-LINK, EXACTLY AS A POST'S PICTURE IS, and for its reason: a file only its owner
   can open is a broken image in the recipient's bubble, which reads as the app failing rather than
   as a permission. The id is unguessable and appears only in the two people's own `messages`
   reply, which is the same exposure every post's photograph already has. */
```

### ---------- A FOLDER THAT COULD NOT BE MADE IS NOT A FOLDER THAT IS NOT THERE

in `getMessageFolder_`

```
/* ---------- A FOLDER THAT COULD NOT BE MADE IS NOT A FOLDER THAT IS NOT THERE ----------------
     THIS CAUGHT EVERYTHING AND RETURNED NULL, and the caller said "No posts folder … add a row to
     the config tab". On a deployment holding only `drive.readonly` the posts folder opened
     perfectly; what failed was `createFolder('Messages')`, refused for want of the scope. So the
     first photograph anybody sent in a message sent the owner to the Ledger to fix a row that was
     already right. Three answers now, and the caller words each: `{ folder }`, `{ none }` when there
     is no posts folder at all, and `{ err }` when Drive said no. */
```

### ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK

top level, before `driveKeep_`

```
/* ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK ----------------------------------------
   LIFTED OUT OF `addPost`, where it was a closure called `keep_`, because a profile picture is the
   same act: a `data:` URL off the phone becomes a file in a folder, readable by anyone with the
   link, and its address goes into a cell. A second copy would be a second place for the sharing line
   to be forgotten — and a picture only its owner can open is a broken square on every other phone,
   which reads as the site failing rather than as a permission.

   ANYTHING THAT IS NOT A `data:` URL IS HANDED BACK AS IT IS, which is what `addPost` relies on: a
   post may carry an address already in the folder alongside a fresh photograph. Blank is `''`.
   THROWS on a Drive failure, so each caller says it in its own words through `driveTrouble_`.
   `name` is the file name without its extension, which this works out from the type. */
```

### ---------- WHAT A POST MAY PUT IN DRIVE

top level, before `POST_FILE_MAX`

```
/* ---------- WHAT A POST MAY PUT IN DRIVE ---------------------------------------------------------
   NOTHING STOPPED IT, AND NOTHING HAD TO WHILE DRIVE COULD NOT BE WRITTEN. `addPost` is open to any
   signed-in account (`self` in ACTION_ACCESS), `driveKeep_` keeps any `data:` URL of any type at any
   size, and the file is shared by link before anybody has approved the post. Under `drive.readonly`
   every one of those uploads failed, so the gap could not be seen; the manifest asking for `drive`
   — which messages need — is what made it real. Any registered account could have put about fifty
   megabytes of anything into the business's Drive per request, as often as it liked, each with a
   public link. `savePhoto` was capped and `sendMessage` was capped; posts were the open door.

   THE PHONE'S OWN NUMBERS, so nothing the camera card lets through is refused here: a clip up to
   20MB (`CAM_VID_MAX` in posts.js; a photograph is redrawn at 1600px and is a few hundred KB), and
   45MB of base64 a post (`CAM_POST_MAX`), which is 33.75MB decoded. A PICTURE OR A CLIP AND NOTHING
   ELSE: the camera sends `image/jpeg` or the clip's own `video/*`, so a PDF or a zip came from
   somewhere other than this app. Not `image/svg+xml` — a drawing that can carry script, shared by
   link from the business's Drive, is not a photograph.

   MEASURED FROM THE BASE64, NOT BY DECODING IT. A refusal should cost nothing, and decoding 30MB to
   learn it is too big is the expensive half of keeping it. `savePhoto` measures the same way.
   `''` when the list may go; otherwise the sentence the poster reads. Addresses (a picture already
   in the folder) are not uploads and pass untouched — `driveKeep_` hands them back as they are. */
```

### ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING

top level, before `POST_WAITING_MAX`

```
/* ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING ------------------------------------------
   THE RATE LIMIT, AND IT IS THE ADMIN. Everybody but an admin posts into a queue (`approved:
   PENDING`), and each of those posts holds files already in Drive and shared by link — that is how
   the admin sees what they are approving. So the number a person may have waiting is the number of
   uploads they can make without anybody looking: five posts, each within the caps above, and then
   nothing more until the admin has said yes or no to something. A clock would be a second thing to
   tune; the queue is already the thing that decides.

   ACTIVE ONLY. A waiting post the admin deleted rather than refused is `active: FALSE` and stays
   `PENDING` for ever — counting it would shut its author out with nothing on their screen saying
   why. Whose it is is asked the way `doGet` asks it when deciding who may see a waiting post. */
```

### ---------- WHERE PROFILE PICTURES GO

top level, before `getPhotoFolder_`

```
/* ---------- WHERE PROFILE PICTURES GO -----------------------------------------------------------
   `photos_folder` IN THE CONFIG TAB IF SOMEBODY HAS SET ONE, AND THE POSTS FOLDER IF NOT — the one
   folder this deployment is already known to be able to write to, because `addPost` proves it on
   every photograph. So the picker works on the day it is deployed with nothing new to configure, and
   somebody who would rather keep faces apart from the feed's pictures can say so with one row.
   A pasted folder URL works as well as a bare id, as it does for the posts folder. Null when neither
   can be opened, and the caller says which key to set. */
```

### The caps, in DECODED bytes, and the phone enforces the same numbers first (`MSG_CAP_` in me.js) so a person is told before a minute of upload rather than after

top level, before `MSG_FILE_MAX`

```
/* The caps, in DECODED bytes, and the phone enforces the same numbers first (`MSG_CAP_` in me.js) so
   a person is told before a minute of upload rather than after it. 20MB a file is about TWENTY
   SECONDS of an iPhone's 1080p video (Apple quotes ~60MB a minute for 1080p30 HEVC), not the "about
   a minute" this used to say — which is why the phone's refusal says "trim it" rather than leaving
   somebody to guess. 32MB a message is what keeps the BASE64 body — four thirds of that — under the
   ~50MB an Apps Script web app takes in one POST. A cap at a raw 45MB would be a 60MB body, refused
   by Google with an HTML page rather than by this handler with a sentence. */
```

### ONE CELL, `url#type#name` items joined by ` | `.

top level, before `msgAttachIn_`

```
/* ONE CELL, `url#type#name` items joined by ` | `. `#` and `|` are taken out of the name rather
   than escaped — left in, `holiday|photo.jpg` comes back as two attachments on the next read, which
   is `libCardsIn`'s argument for the same two characters. A Drive view URL never holds either. */
```

### ---------- A FILE WITH NO TYPE IS TYPED BY ITS NAME

top level, before `msgTypeOf_`

```
/* ---------- A FILE WITH NO TYPE IS TYPED BY ITS NAME ---------------------------------------------
   A PHONE DOES NOT ALWAYS SAY. A clip chosen through "Browse" on an iPhone, or a file shared in from
   another app, can arrive with an empty `type`, and `readAsDataURL` then labels it
   `application/octet-stream` — which `msgAttachHtml_` draws as a chip saying "MOV" rather than as a
   clip that plays. The extension is the one thing such a file still carries. Only when the type is
   missing or generic: a type the phone did name is believed. */
```

### ---------- WHERE `?setup=1` IS, FOR THE ADMIN'S SENTENCE

top level, before `setupUrl_`

```
/* ---------- WHERE `?setup=1` IS, FOR THE ADMIN'S SENTENCE ----------------------------------------
   The address of this web app, so a refusal can say exactly what to open rather than "run setup".
   `''` from the editor or anywhere `getService` has nothing to say, and the sentence still reads. */
```

### ---------- WHAT A MESSAGE WITH FILES SAYS WHEN THE FILES CANNOT GO

top level, before `msgNoColumn_`

```
/* ---------- WHAT A MESSAGE WITH FILES SAYS WHEN THE FILES CANNOT GO -----------------------------
   ONE SENTENCE FOR THE PERSON, AND THE FIX FOR AN ADMIN — `driveTrouble_`'s two audiences, for the
   refusal that comes before Drive is even asked: the `attachments` column the files' addresses go
   into. A parent cannot run `?setup=1` and should not be told to; the owner should be told the
   address. `why: 'files'` is what the phone reads to offer "Words only" beside Retry, so the reply
   is a shape rather than a sentence it has to recognise. */
```

### `{ error, why }` or `{ list }`.

top level, before `msgAttachSave_`

```
/* `{ error, why }` or `{ list }`. Every file is decoded and measured BEFORE any is written, so a
   message whose third file is too big leaves no orphans of the first two in Drive.

   NOTHING IS SENT UNLESS EVERY FILE IS KEPT. A message is what somebody chose to send together —
   "here is the homework" and the three pages of it — and arriving with two of the three pages is a
   message that says something its sender did not. So a file Drive refuses takes the whole message
   back, and the files already made are BINNED, because the phone keeps every file on the pending
   bubble for Retry and a Retry would otherwise leave the first photograph in Drive twice. The phone
   offers "Words only" beside Retry, so the words are never held hostage by a photograph. `admin`
   decides whether the refusal carries the fix — see `driveTrouble_`. */
```

### ---------- CHECK UPLOADS: CAN A PHOTOGRAPH IN A MESSAGE BE KEPT, ASKED OF WHAT IS SERVING

top level, before `uploadsCheck_`

```
/* ---------- CHECK UPLOADS: CAN A PHOTOGRAPH IN A MESSAGE BE KEPT, ASKED OF WHAT IS SERVING ----------
   ASKED FOR AS *"i cant send images, or videos in the chat to people. i think you need to add
   something to ledger for that."* Half right, and the half that was not is why this exists: the
   Ledger needed a column, and the deployment needed a Drive scope its manifest had never asked for —
   and the only way anybody found that out was by sending a photograph and reading the refusal.

   THE DEPLOYMENT'S OWN ANSWER, NOT THE EDITOR'S. `authoriseDrive` and `checkPostsFolder` run in the
   editor, which holds whatever the last Allow granted; `/exec` runs the version that was deployed,
   with the manifest it was deployed with. A check run from the editor passes on exactly the day the
   site still fails. This is a POST to the site, so it is asked of the thing a family's phone reaches.

   FOUR QUESTIONS, IN THE ORDER A FILE MEETS THEM: is there a column for its address, does the token
   hold `drive`, does the folder open, and can a file actually be made there and shared by link.

   IT WRITES NOTHING THAT STAYS. One tiny text file is made, shared and BINNED — the three calls a real
   photograph makes, because a check that only reads passes on precisely the deployment that cannot
   write (`authoriseDrive`'s own lesson). It does not make the `Messages` folder: that is the first
   real send's job, and a check that leaves a folder behind has changed what it was measuring.

   `steps` IS THE FIX, IN ORDER, only for what failed — the owner reads a list of what to do next
   rather than four ticks and a cross to interpret. */
```

### GOOGLE'S SENTENCE ONLY WHEN IT IS NOT THE SCOPE.

in `uploadsCheck_`

```
/* GOOGLE'S SENTENCE ONLY WHEN IT IS NOT THE SCOPE. The scope has its own row above, and
         "Specified permissions are not sufficient to call …" under it said the same thing again at
         four lines long on a 320px card. Anything else — an outage, a shared drive's policy — is
         news, and goes as Google said it. */
```

### THE SCOPE IS READ OFF THE TOKEN, AND THE WRITE IS THE EVIDENCE.

in `uploadsCheck_`

```
/* THE SCOPE IS READ OFF THE TOKEN, AND THE WRITE IS THE EVIDENCE. If Google could not be asked
     (that needs `script.external_request`) but the write worked, the scope is plainly held — a cross
     there would be a red that contradicts the green under it. */
```

### ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE

top level, before `folderIdFrom`

```
/* ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE -------------------------------------
   A PAGE COUNT IS WHAT PRICES A PRINT, and it was read by pulling the PDF's bytes out of Drive and
   counting `/Count` and `/Type /Page` in them — then written back into the document row's `pages`
   cell, a few hundred a night on a trigger, skipping anything counted in the last thirty days.

   THERE IS NO CELL TO WRITE IT TO. The counts that were already gathered came across in
   `data/questions.json` — 155 papers carry a real one — and they are committed data now, so they
   are as stable as anything else in this repository and nothing has to re-read them on a schedule.

   WHAT IS ACTUALLY LOST: a NEW paper added to the library arrives with no count and cannot be
   priced for printing until somebody types one in. That was already the outcome for a compressed
   PDF, which no script can count — see the `couldNotRead` list this used to return. `installTriggers`
   no longer books the nightly sweep, and `driveIdFrom` — which pulled the file id out of a
   document's `source_url` so the PDF could be fetched — went with them. The posts folder uses
   `folderIdFrom` below, which is a different function and stays.

   ALSO GONE WITH IT: `?pages=1` and `?pages=all` on doGet, and `?run=refreshPageCounts`. */
```

### The showcase images.

top level, before `gallery`

```
/**
 * The showcase images.
 * Returns { files, error } rather than just a list, because the previous version caught every
 * failure and returned [] — so "no images in the folder", "wrong folder id" and "Drive access was
 * never authorised" all looked identical, and the section just said "No showcases active".
 * The commonest cause by far is the last one: a freshly deployed script has no Drive permission
 * until someone runs a function from the editor once and accepts the prompt.
 */
```

### THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER

top level, before `filmsClock_`

```
/* ==================================================================================================
   THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER

   ASKED FOR AS *"Ensure the video searcher is hooked up. Let admin be able to search up films which
   are in the notflix folder on gdrive."* (9 Oct). The searcher WAS hooked up — the videos card reads
   `DATA.films`, and `doGet` sends them to an admin and to nobody else — and an admin still found
   nothing, because the films tab in the live Ledger had its headers and not one row. Note 068's rows
   were typed once by hand into a Ledger that was later replaced, and nothing in this project knew
   where the films actually were. An empty tab looks exactly like an empty database; no check could
   tell the two apart, and none did.

   SO THE FOLDER IS THE SOURCE AND THE TAB FOLLOWS IT. This walks the folder and upserts the tab by
   `drive_id` — what a person typed into a row survives, what the folder decides is refreshed — see
   SCHEMA.films for which columns are whose.

   ---------- THE SHAPE IT WALKS (levels only: no title from the folder is in this public file) --------
       Notflix/
         Notflix adults/   Films/  (one file a film)      Tv shows/  <one folder a show>/
         Notflix kids/     films/                         tv shows/  (empty today)
         documentaries/    (one file a documentary, directly inside)

     LEVEL 1 IS THE AUDIENCE: "Notflix " off the front, lower-cased — `adults`, `kids`. Next to them,
     `documentaries` is a KIND rather than an audience, has no prefix and holds its file directly, so
     it is read as a kind with no audience.
     LEVEL 2 IS FILM OR TV, and the case already differs between the two audiences (`Films` / `films`,
     `Tv shows` / `tv shows`) — so it is matched (`FILMS_RE_FILMS`, `FILMS_RE_TV`), never compared.
     A FILE IN A FILMS FOLDER IS ONE FILM. A FOLDER IN A TV FOLDER IS ONE SERIES — ONE ROW, its folder
     (note 068: an episode is not a thing anybody searches for) — and it is walked only to count its
     seasons and its size. Shows are stored both ways: every episode loose in the show's folder, or in
     `s1`..`sN` folders. So seasons are COUNTED FROM THE EPISODES THAT EXIST, by the season folder or
     the `S.E` in the name, and never from the folders: one show has five season folders and only three
     with anything in them.
     A GOOGLE DOC WHERE A FILM WOULD BE IS A PLACEHOLDER ROW — note 068's "Not in the drive yet". Not
     one is in the folder today; the row shape was built for one and is kept.
     ANYTHING ELSE IS SKIPPED AND COUNTED — subtitles, a picture, a shortcut, an `extras` folder — and
     an empty folder makes no row (an empty `tv shows` and two empty season folders are there today).

   ---------- WHAT A NAME SAYS (`filmsTitle_`) ------------------------------------------------------------
     Six patterns across fourteen files, and the parse is the patterns rather than a guess:
       `Title`, `Title (YYYY)`, `Title (YYYY) <a note>`, `Title.mkv`, `Title (YYYY).mp4`, `Title - XY9.mp4`.
     The extension comes off only when it IS a video extension. A year is only ever ` (YYYY)`. Text
     after the `)` is the owner's own flag on the file (a word saying the copy is not right) — it goes
     to `notes`, never into the title, where it would be a film nobody can find by its name.

   ---------- WHEN IT RUNS, AND HOW LONG IT MAY TAKE --------------------------------------------------
     THREE DOORS, ONE FUNCTION: the videos card asks for it for an admin once the last whole pass is a
     day old (`filmsSyncDue_` in js/games.js), the card's silver Sync from Drive tile asks for it by
     hand, and `syncFilms` is in the editor's function dropdown (and `?run=syncFilms`).
     THE DRIVE WALK HOLDS NO LOCK; THE WRITE DOES. Walking Drive is the slow half and touches nothing
     of ours, so it runs unlocked — the script lock is the one every booking, answer and done question
     waits on, and holding it for twenty seconds of Drive would refuse a child's Check for nothing. The
     sheet is read fresh and written under the lock at the end, which is the half two runs could race.
     Two runs at once are therefore slower, never wrong: the upsert is by `drive_id` and the second
     finds every row the first made.
     BOUNDED BY A CLOCK. The things are put in one fixed order (by id) and taken in turn until the
     budget is spent; what was done is written, `after` remembers the last one, and the next run
     carries on from there (`FILMS_SYNC` in Script Properties). Only a WHOLE pass switches anything
     off — a part-way pass has not looked at the rest, and "not seen yet" is not "gone".
================================================================================================== */
```

### ---------- WHICH FOLDER

top level, before `filmsRoot_`

```
/* ---------- WHICH FOLDER ---------------------------------------------------------------------------
   A SYNC OF THE WRONG FOLDER IS THE WORST THING THIS CAN DO: a whole pass of some other folder named
   Notflix switches off every film in the right one and fills the admin's card with links into
   somebody else's Drive. So, in this order:

     1. `films_folder` IN THE CONFIG TAB IF IT IS SET — an id or a pasted folder URL, `getPhotoFolder_`'s
        rule — and A WRONG ONE IS SAID, NOT FALLEN BACK FROM.
     2. THE FOLDER THE LAST RUN USED (`FILMS_SYNC.root`), by its id, while it opens and is not in the
        bin — whatever it is called now. Searching by name every run made the root whichever folder
        Drive listed first, and Drive lists in no fixed order.
     3. BY NAME, exactly `notflix` in any case: `title contains` is Drive's own case-blind match, and the
        exact test after it is what keeps `Notflix adults` and `Notflix kids` out.

   THE NAME SEARCH SEES FOLDERS SHARED WITH THE ACCOUNT, NOT ONLY ITS OWN — and the name is printed in
   this public repository. It TOOK `found[0]` (review of 9 Oct, reproduced in check-films: a second
   folder of that name listed first, and the next pass said "12 switched off"). So one folder this
   account OWNS wins over any shared with it; ONE folder found is used whoever owns it (the real one
   may well live in a family member's Drive); and TWO THAT CANNOT BE TOLD APART ARE REFUSED with a
   sentence naming the cell that settles it, before anything is listed or written. "Owns" is asked
   of Drive's own User (the owner of this account's My Drive), not `Session`, whose email needs a
   scope this project has not got — and adding one is a re-authorisation of the live web app. */
```

### ---------- A NAME, READ

top level, before `filmsTitle_`

```
/* ---------- A NAME, READ ------------------------------------------------------------------------------
   `{ title, year, note }`. Scene style (`A.Film.2008.1080p...`) is read too, though no film in the folder
   is named that way today: its dots are spaces and everything after the year is the release, not a
   note. A trailing ` - XY9` (two to six capitals and digits, at least one digit) is a tag and goes to
   the note, so a Roman `- II` stays in the title. */
```

### ---------- THE THINGS IN THE FOLDER, LISTED BUT NOT YET WALKED

top level, before `filmsList_`

```
/* ---------- THE THINGS IN THE FOLDER, LISTED BUT NOT YET WALKED -------------------------------------
   One entry per film, series, documentary or placeholder, in the folder's own order; `filmsSync_`
   sorts them. Listing is cheap — one page of names per folder — and a series is not opened here,
   because opening it is what costs. */
```

### ---------- ONE THING, LOOKED AT

top level, before `filmsDescribe_`

```
/* ---------- ONE THING, LOOKED AT -----------------------------------------------------------------------
   A file is its size. A folder is walked — three levels at most, extras skipped — for its videos, their
   size and the seasons that actually hold one. Null when the clock ran out part-way through a folder:
   that thing is the first of the next run, rather than a row with half a size. `empty` is a folder with
   no video in it, which makes no row. */
```

### ---------- ONE THING INTO THE TAB

top level, before `filmsUpsert_`

```
/* ---------- ONE THING INTO THE TAB ------------------------------------------------------------------------
   BY `drive_id`. A thing with no row ADOPTS a row a person typed with no id and the same title (case and
   spacing aside) — a film asked for by name before its file arrived, which is note 068's placeholder —
   and only failing that is a row made. The machine's columns go through `setCells`, which writes only a
   cell that differs: a second pass over an unchanged folder writes nothing.

   A PERSON'S COLUMNS — `title`, `year`, `notes` — ARE THE MACHINE'S UNTIL SOMEBODY TYPES OVER THEM. They
   were written once and after that only into a blank cell, so A FILE RENAMED IN DRIVE NEVER CHANGED ITS
   ROW: a typo fixed in the name, a year added, the owner's own flag on a file taken off once it was
   mended — the row went on saying what the folder used to hold, and a search for the new name found
   nothing (review of 9 Oct). So `drive_name` keeps the name each cell was read from, and a cell that
   still says what THAT name said (or is blank) is the machine's and follows the new name; a cell that
   says anything else was typed by a person and is never written over. A row with no `drive_name` — made
   before the column, or typed and then adopted — has only its blanks filled, as before. `director` and
   `lead` are never in a name, so the machine never writes them at all. */
```

### ---------- THE SYNC

top level, before `filmsSync_`

```
/* ---------- THE SYNC ---------------------------------------------------------------------------------------
   `opts.budgetMs` — how long this run may spend looking at things (the phone's is short, the editor's
   long); `FILMS_SYNC_CEILING_MS` is the line no run crosses. Returns the reply `filmsSync` sends, less
   the films themselves: counts, the folder's NAME and how it was found, and `more` when the pass is not
   finished. Never a title, an id or a file name — this reply is what `?run=syncFilms` prints in a tab.

   IT RETIRES NO PAYLOAD. The films are laid on every admin's load fresh (`payloadWithFresh_`) and no
   stored body carries them, so the flag the writes raise is put back — `submitAnswer`'s move (and
   `markDone`'s before it). */
```

### ---------- A WHOLE PASS, AND ONLY A WHOLE PASS, SWITCHES OFF

in `filmsSync_`

```
/* ---------- A WHOLE PASS, AND ONLY A WHOLE PASS, SWITCHES OFF ----------------------------------------
       A row whose file is no longer anywhere in the folder: `active` FALSE, the row kept — the owner's
       director, lead and notes on it are the work worth keeping if the file comes back. A listing of
       NOTHING switches nothing off: an empty folder is far likelier to be the wrong folder, or Drive
       answering badly, than the owner deleting a hundred gigabytes. */
```

### AN ITEM'S OWN ANSWER AGAINST ITS OWN SHAPE (457):

top level, before `libSelfTest_`

```
/* AN ITEM'S OWN ANSWER AGAINST ITS OWN SHAPE (457): `refuse` when it can never be marked right, `flag` when it waits for a scheme.
   The site's marker runs the full test over the whole library (js/check-answerable.js); this is the part a sheet can ask. */
```

