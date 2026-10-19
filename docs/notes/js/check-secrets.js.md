# js/check-secrets.js

The full text of comments in `js/check-secrets.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### A PIN WRITTEN INTO THE SOURCE IS PUBLISHED, AND IT STAYS PUBLISHED.

top level, before `fs`

```
/* ==================================================================================================
   A PIN WRITTEN INTO THE SOURCE IS PUBLISHED, AND IT STAYS PUBLISHED.

   `backend/constants.gs` carried two usage lines for months, in the comment block explaining how to
   run a job from a URL — `/exec?run=checkEverything&name=...&pin=...`, with a real admin's real
   name and real four digits filled in where the placeholders belong.

   THEY ARE NOT REPRODUCED HERE, and that is this check catching its own author: the first version
   of this header pasted both lines out of `constants.gs` to show what the fault looked like, and
   the first run named `check-secrets.js:7` and `:8`. A check that quotes the credential it found is
   the credential in one more file. This repository is PUBLIC and git history
   is permanent, so the PIN was published the moment it was committed and is still published now
   that the line has been changed — removing it stops the next reader finding it and un-publishes
   nothing. The only repair that repairs anything is changing the PIN.

   FOUND WHILE ANSWERING "why can't I sign in", WHICH IS THE ONLY REASON IT IS NOT STILL THERE. No
   check read it, nothing rendered it, and it sat in prose under a heading about deployment — the
   shape CLAUDE.md records every time: a fault nobody was looking for, in a file nobody re-reads.

   AND THE RULE RATHER THAN THE INSTANCE, which is this file's whole reason to exist. CLAUDE.md
   writes that sentence about `cost: 0`, about `paper: true`, about the spelling fold and about
   `delRow` — each repaired where it was found, each back a month later in a new column. A comment
   saying "use a placeholder" is a thing somebody has to remember.

   ONE QUESTION, AND IT HAS EXACTLY ONE RIGHT ANSWER: a PIN literal in this repository must be
   `0000`. Not "must look like a placeholder", which is a judgement — a single reserved value, so
   there is nothing to argue about and nothing to tune. Measured across every source file here:
   three occurrences, all of them `0000`, all of them in a usage line telling somebody to substitute
   their own. Anything else is either a credential or an example that should have been that one.

   IT IS DELIBERATELY NOT A SEARCH FOR SECRETS IN GENERAL. An API key, a token, a password: each
   would need a rule that decides what a high-entropy string is, and CLAUDE.md already records what
   a check with ninety-five findings and two real ones is worth. Four digits beside the word `pin`
   is the one shape this app actually has, because four digits beside the word `pin` is what this
   app's credential IS.
================================================================================================== */
```

### WHAT IS READ. Source and prose — the two places a person types an example.

top level, before `EXT`

```
/* WHAT IS READ. Source and prose — the two places a person types an example. `data/` is excluded
   because it is exports and transcriptions rather than anything anybody writes a usage line in, and
   `node_modules/` because it is not ours. `worktrees` (under `.claude/`) because each one is another
   branch checked out beside this one, gitignored: reading them failed this branch for a test PIN
   a worker had not committed anywhere, and walked 17,628 files to do it. Each branch is judged when
   its own checks run. */
```

### `pin` then four or more digits, with up to six characters of punctuation between them — which covers `pin=0000`, `pin: '0000'`, `"pin": "0000"` and

top level, before `RE`

```
/* `pin` then four or more digits, with up to six characters of punctuation between them — which
   covers `pin=0000`, `pin: '0000'`, `"pin": "0000"` and `pin -> 0000` alike. The word boundary is
   what keeps `spin`, `pinned` and `pinch` out of it. */
```

### ---------- AND A GOOGLE API KEY, WHICH THIS APP HOLDS NOW

top level, before `GOOGLE_KEY`

```
/* ---------- AND A GOOGLE API KEY, WHICH THIS APP HOLDS NOW ----------------------------------------
   "MARK WITH AI" CALLS GEMINI, and the key for it is `GEMINI_API_KEY` in Script Properties — never a
   config cell, never a constant, never a comment showing what one looks like. The paragraph above
   refuses a general secrets search and that still stands: this is not a judgement about entropy but
   ONE EXACT SHAPE, the one Google issues — `AIza` and thirty-five more characters — so there is
   nothing to tune and no example of it that is not a key. It is not quoted here either. */
```

### THE DIGITS ARE NOT PRINTED.

in `run`

```
/* THE DIGITS ARE NOT PRINTED. A check that names the credential it found is the credential in one
     more place — the same argument `check-handles.js` makes about never quoting a refused word
     back. The line is what somebody needs; they can open it. */
```

