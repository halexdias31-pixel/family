# js/check-reels.js

The full text of comments in `js/check-reels.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — check-reels.js THE README IN `data/reels/` ASKED FOR THIS FILE AND SAID WHEN TO WRITE IT:

top level, before `fs`

```
/* ==================================================================================================
   @family. — check-reels.js

   THE README IN `data/reels/` ASKED FOR THIS FILE AND SAID WHEN TO WRITE IT: "A missing file is a
   dark reel. The path is not checked by anything yet, because there is nothing here to check — the
   first clip that lands is when that check is worth writing." Two have landed.

   A DARK REEL IS THE WORST SHAPE THIS COLUMN HAS. `reelPlay_` sets the `src`, the browser reports an
   error, and the slide stays its own gradient — so a clip whose path is one character wrong does not
   read as a broken link. It reads as a feature that half-works rather than a file that is not there.
   Nothing in the app can tell the two apart, because from a phone they are the same event.

   AND A FIFTH: A CLIP THAT CAN ONLY BE EMBEDDED IS REFUSED. Drive ids and Instagram posts used to
   end in somebody else's player in an iframe — no autoplay, no mute, no pause — and that route was
   removed on "remove the embedded reels. they suck." `clipPlayable_` in games.js drops such a row
   from the column; this refuses one in `FEED_FACTS`, so the code's own list cannot grow one again.
   A Drive ADDRESS is refused as well as a bare id: Drive never hands a `<video>` the bytes.

   AND A YOUTUBE ADDRESS IS ACCEPTED, AS THE ONE EMBED THE COLUMN CAN DRIVE (note 319). Its player
   takes play, pause, mute and unmute by message, which is what the other two never did. It is not a
   file, so none of the four questions below is asked of it — no path, no codec, no `moov`, no
   `x.jpg` (its poster is YouTube's own thumbnail). Two things are asked instead: that the address
   names ONE video (a channel or a playlist is refused), and that it carries no `si=` — the share
   link's tag for who shared it, which in a public repository is a person's trail left in the code.

   AND THIS FILE'S COPY OF THE TEST IS HELD AGAINST THE APP'S. The copy exists so a wrong `games.js`
   cannot vouch for itself; it is only worth that while the two agree. So the real `clipPlayable_`,
   `clipSrc_` and `vidYouTubeId_` are cut out of games.js by name and asked the same addresses —
   every shape a YouTube link is copied in, Drive both ways, Instagram, a channel, a playlist — and a
   disagreement is a failure rather than a drift nobody sees.

   FOUR QUESTIONS, AND EVERY ONE OF THEM IS A FAULT THAT HAPPENED OR NEARLY DID:

     the file is there        a path typed by hand against a name nobody re-reads
     the spelling is exact    GitHub Pages is CASE-SENSITIVE and a laptop is not. Both clips arrived
                              as `.MP4`; a row saying `.mp4` would have worked on every machine it
                              was written on and 404'd in production — the `_scope.js` shape that
                              `.nojekyll` closed, in a second column
     a browser can play it    `avc1` is the one video codec every phone decodes. This check reads
                              the container rather than trusting the extension, because a `.mp4`
                              holding HEVC plays on an iPhone and not on an Android
     `moov` BEFORE `mdat`     the one that is invisible without opening the file. An MP4 whose index
                              sits at the END cannot start until the WHOLE file has arrived, so an
                              eight-megabyte clip is eight megabytes before the first frame rather
                              than a few hundred kilobytes. Every tool writes it either way and
                              nothing about the file says which

   WHAT IT CANNOT ANSWER, said here rather than implied. Whether the picture DECODES is settled by a
   phone: the Chromium in this container is built without the proprietary codecs, so `canPlayType`
   on H.264 comes back empty and a real `<video>` here always errors. Reading the container is the
   half a checker can do; the other half is one open of the live site. Same sentence this repository
   already writes about which Drive address wins.

   RUN IT:  node js/check-reels.js
================================================================================================== */
```

### THE SAME TEST `clipPlayable_` MAKES, written twice on purpose:

top level, before `EMBED_ONLY`

```
/* THE SAME TEST `clipPlayable_` MAKES, written twice on purpose: this file must be able to say a row
   is wrong even when `js/games.js` is the thing that is wrong. It is about the DATA, so it carries
   its own copy, and a drift between them shows up as a row this names and the app draws, or the
   reverse. */
```

### ---------- WHAT COUNTS AS A PATH INTO THIS REPOSITORY

top level, before `isRepoPath`

```
/* ---------- WHAT COUNTS AS A PATH INTO THIS REPOSITORY --------------------------------------------
   A whole `http(s)` address is somebody else's server and only its shape can be checked from here.
   What IS this check's business is an address with no scheme, which is a file that has to be in the
   tree beside this one. */
```

### ---------- THE CLIPS, READ OUT OF THE ARRAY RATHER THAN OUT OF A COPY OF IT

top level, before `clips`

```
/* ---------- THE CLIPS, READ OUT OF THE ARRAY RATHER THAN OUT OF A COPY OF IT ----------------------
   `FEED_FACTS` is a literal in `chess.js` and the fifth field is the clip. Cut out by the same
   method `check-marking.js` uses on the marking functions: the alternative is a second list here,
   which is a second thing to keep in step — the fault recorded under `childrenOf`, under
   `link`/`source_url` and under `factsNow_`. */
```

### ---------- THE CONTAINER, AS TOP-LEVEL BOXES

top level, before `boxes`

```
/* ---------- THE CONTAINER, AS TOP-LEVEL BOXES -----------------------------------------------------
   An MP4 is a list of boxes, each a four-byte big-endian size and a four-byte name. Only the top
   level is walked for the order question, and `moov` is descended once for the codec: the sample
   description under each track names it, and that name is the thing a browser matches on. */
```

### THE APP'S OWN TEST, cut out of games.js by name with the repository's one cutter

top level, before `appClips_`

```
/* THE APP'S OWN TEST, cut out of games.js by name with the repository's one cutter (the marking
   checks' — brace-counted, so a regex's `{11}` cannot end a function early) and run here on its own.
   They touch nothing but each other, which is what makes that safe. `null` if any is missing, and the
   caller fails: a check that cannot reach its subject must not report that the subject is fine. */
```

### ---------- A YOUTUBE ROW: ONE VIDEO, AND NOBODY'S SHARE TAG ON IT

in `run`

```
/* ---------- A YOUTUBE ROW: ONE VIDEO, AND NOBODY'S SHARE TAG ON IT -----------------------------
       `?si=` IS WHAT THE SHARE BUTTON ADDS, and it is the sharer's, not the video's: the link works
       exactly the same without it. The owner's Short arrived with one. In a public file it is a
       thread from this repository back to whoever pressed Share, so it is refused here rather than
       trusted to be noticed in review. */
```

### THE SPELLING, NAMED SEPARATELY.

in `run`

```
/* THE SPELLING, NAMED SEPARATELY. A path that is right but for its case is the one that works
         on the machine it was typed on, and it is worth saying so rather than reporting a missing
         file somebody can see in the folder. */
```

### ---------- AND WHETHER IT HAS A FIRST FRAME TO SHOW WHILE IT DOWNLOADS

in `run`

```
/* ---------- AND WHETHER IT HAS A FIRST FRAME TO SHOW WHILE IT DOWNLOADS ----------------------
       `feedSlide` DERIVES THE POSTER FROM THE CLIP'S OWN PATH — `x.mp4` beside `x.jpg` — so there is
       no column to keep in step and nothing to spell wrongly. What there IS, is a file that can
       quietly not be there: a `poster` that 404s draws nothing and the slide goes back to being a
       gradient for the several seconds the clip takes, which is the complaint this was added for.
       Invisible from inside the app, which is why it is counted here.

       PRINTED RATHER THAN FAILED, for the reason the weight is: a clip with no poster works, it is
       simply slower to look like something. A number somebody can act on beats a rule that refuses
       a clip. */
```

### ---------- WEIGHT IS PRINTED AND NOT REFUSED

in `run`

```
/* ---------- WEIGHT IS PRINTED AND NOT REFUSED ---------------------------------------------------
     The README says under about ten megabytes each is comfortable, and that is a judgement about
     somebody's data allowance rather than a fault in the file. A number somebody can act on beats a
     threshold that stops a clip going up. */
```

### ---------- THE COPY ABOVE, HELD AGAINST THE APP'S OWN FUNCTIONS

in `run`

```
/* ---------- THE COPY ABOVE, HELD AGAINST THE APP'S OWN FUNCTIONS -------------------------------
     Every address is asked three times: what it SHOULD be (written here, by hand), what this file's
     copy says, and what the real `clipPlayable_` / `clipSrc_` / `vidYouTubeId_` in games.js say.
     Each row is a shape somebody will paste: the four ways a YouTube link is copied, the nocookie host
     the Videos card embeds, a mobile link with its id after another parameter — and the eight that
     must stay out, the mobile Instagram link among them (it passed while only `www.` was refused).
     A YouTube clip's `clipSrc_` must be '' — it is never a `<video>`'s source. */
```

