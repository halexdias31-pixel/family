# sync.js

The full text of comments in `sync.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### @family. — sync.js YOUR FOLDER IS THE TRUTH.

top level, before `execFileSync`

```
/* ==================================================================================================
   @family. — sync.js

   YOUR FOLDER IS THE TRUTH. GITHUB IS A COPY OF IT.

   Put this file next to index.html, run it, and leave it running. Every time you save anything,
   it goes up to GitHub within a few seconds. You never open GitHub. You never paste anything.

     node sync.js            leave it running, syncs every time you save
     node sync.js --once     one sync now, then stop
     node sync.js --force    push even if the checks complain

   ------------------------------------------------------------------------------------------------
   THE FIRST RUN CONNECTS THE FOLDER, AND CANNOT DAMAGE IT.

   If this folder has never been joined to GitHub, this joins it. The old version of this file told
   you to run a command that REPLACES your files with GitHub's — which was exactly backwards, since
   your folder is three days ahead. This does the opposite and never overwrites a local file: it
   only tells git where GitHub is, and then pushes what you already have.

   THE FIRST PUSH CANNOT DELETE ANYTHING FROM GITHUB EITHER. On the very first sync, a file that is
   on GitHub and not in your folder is left alone rather than removed, because the most likely
   reason for it to be missing is that you ran this in the wrong folder. After that first push the
   two are known to match, so a file you delete locally is deleted on GitHub too — which is what you
   want, and what happened to the weave splash.

   ------------------------------------------------------------------------------------------------
   THE BACKEND FOLDER NOW BELONGS TO THIS, AND THAT IS A REVERSAL.

   IT USED TO BELONG TO APPS SCRIPT. The .gs files arrived on GitHub as a dump FROM the editor, so
   this refused to stage anything under backend/ — two writers on one folder is one writer too many,
   and whichever ran last would have flattened the other.

   THE ARROW TURNED ROUND. `.github/workflows/apps-script.yml` now runs `clasp push` whenever
   anything under backend/ reaches main, so GitHub is the writer and the Apps Script project is the
   copy. The old exclusion would have made that workflow unreachable: you would edit a .gs here, save,
   watch this say "nothing changed", and never find out why nothing deployed.

   SO THE EDITOR IS NO LONGER WHERE YOU CHANGE THE BACKEND. `clasp push --force` replaces the
   project's files wholesale, so anything typed into Apps Script and not committed here is gone at
   the next push. Edit the .gs files in this folder, save, and they go up and out like everything
   else. That is the trade for never pasting six files into a browser tab again.

   ------------------------------------------------------------------------------------------------
   IT CHECKS BEFORE IT PUSHES. `check.js` reads the app's own files and reports a name used and
   never declared. A watcher that pushed whatever it found would publish a half-typed file the
   moment the editor autosaved, so a change to anything in js/ runs the check first and a failing
   check stops the push and says why. Nothing is committed. The next save tries again.

   IT STOPS IF A SYNC WOULD DELETE A LOT AT ONCE. Six or more files disappearing in one save is not
   editing, it is a folder that got moved, a sync client that misfired, or this script started
   somewhere it should not have been. It says so and touches nothing.
================================================================================================== */
```

### EVERYTHING, backend/ INCLUDED.

top level, before `MINE`

```
/* EVERYTHING, backend/ INCLUDED. Passed to every `git add`.
   `:(exclude)backend` was here and is deliberately gone — see the header. The workflow deploys that
   folder from main, so a .gs change that never leaves this machine is a deploy that never happens. */
```

### stdio: stderr is CAPTURED, not passed through.

top level, before `git`

```
/* stdio: stderr is CAPTURED, not passed through. Node forwards a child's stderr to the terminal by
   default, so every harmless probe below — "is there a remote called origin?" — printed git's
   "error: No such remote" straight at you while the script was working perfectly. A script that
   prints errors during a successful run is a script whose real errors nobody believes. */
```

### ---------- LOGGING IN

top level, before `loginHelp`

```
/* ---------- LOGGING IN --------------------------------------------------------------------------
   The one failure this cannot fix by itself, so it explains it rather than printing git's version,
   which is four paragraphs about credential helpers. */
```

### ---------- JOIN THIS FOLDER TO GITHUB

top level, before `connect`

```
/* ---------- JOIN THIS FOLDER TO GITHUB ----------------------------------------------------------
   Reads GitHub, writes nothing over the top of you. `git reset` here is the plain kind — it points
   the folder at GitHub's history and rebuilds git's internal list of what it thinks is there. It
   does not touch a single file on disk. That is the whole trick, and it is why the old --track
   instruction was dangerous and this is not. */
```

### WHO IS COMMITTING. git refuses to record a commit from a nameless author, and its own advice is three commands and two paragraphs.

in `connect`

```
/* WHO IS COMMITTING. git refuses to record a commit from a nameless author, and its own advice
     is three commands and two paragraphs. This sets a name for THIS FOLDER ONLY and moves on. The
     noreply address is GitHub's own — it identifies the account without publishing a real inbox in
     a public commit log. */
```

### STAGE FIRST, THEN ASK WHAT IS STAGED.

in `sync`

```
/* STAGE FIRST, THEN ASK WHAT IS STAGED. Reading the file list out of `status --porcelain` was
       wrong twice over, and both were silent: the leading space of the first line got trimmed away
       and ate a letter off the first filename, and an untracked FOLDER is reported as one entry
       rather than as the files inside it. `diff --cached --name-only` has neither problem. */
```

### PULL BEFORE PUSH. Anything that lands on main while this is running — a merged pull request, a commit from another machine — is enough to make the two

in `sync`

```
/* PULL BEFORE PUSH. Anything that lands on main while this is running — a merged pull request,
       a commit from another machine — is enough to make the two histories diverge, and a plain push
       then fails with four paragraphs about fast-forwards. Rebase puts your commit on top and
       carries on.
       THE OLD REASON FOR THIS WAS APPS SCRIPT PUSHING backend/ ITSELF. It no longer does; the arrow
       runs the other way now. The line stays because the general case it also covers is the one that
       actually bites: this folder being behind main and not knowing it. */
```

