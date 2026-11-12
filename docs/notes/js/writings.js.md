# js/writings.js

The full text of comments in `js/writings.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### "texts and writings?? what's the difference?"

top level, before `WRITING_DEUTERO`

```
/* "texts and writings?? what's the difference?" — none now: every loader (the Bible, talmud, quran, hadith, works, texts,
   pdtexts, orthodox, hymns) maps its index onto `writingUnit_`, one shape. */
```

### THE WORKS REGISTRY (520):

top level, before `WRITING_WORKS`

```
/* THE WORKS REGISTRY (520): each source's work, its tradition (a topic) and its subject; a source not here is literature or
   history and keeps its own subject. Keyed by loader, then by the index's own id. */
```

### THE SOURCE TEXT IS A TEXT'S BASE (529: "pick Bible, then original text like LXX or MT, then translation"):

top level, before `WRITING_MT`

```
/* THE SOURCE TEXT IS A TEXT'S BASE (529: "pick Bible, then original text like LXX or MT, then translation"): what it was made
   from, by Collection where its testaments came from different originals; an original is its own base. */
```

### A SOURCE TEXT TWO TRADITIONS HOLD (660):

top level, before `WRITING_HELD`

```
/* A SOURCE TEXT TWO TRADITIONS HOLD (660): "where's the bible here?" under Judaism — the Masoretic Text in its own Hebrew is the
   Old Testament's original and Judaism's Tanakh, so those cards answer both. */
```

### A COLLECTION IS NAMED BY THE RELIGION ASKED (770):

in `writingAt_`

```
/* A COLLECTION IS NAMED BY THE RELIGION ASKED (770): under Judaism the Masoretic books are the Tanakh and never the Old Testament;
     under Christianity the other way; with no religion chosen, both. */
```

### ---------- R4: THE SET A FUNNEL ANSWERS OVER IS FIXED WHEN IT STARTS (520). A source whose index comes later joins at the next

top level, before `WRITING_CAME`

```
/* ---------- R4: THE SET A FUNNEL ANSWERS OVER IS FIXED WHEN IT STARTS (520). A source whose index comes later joins at the next
   fresh start (no chip, no words), never under an answered question. */
```

