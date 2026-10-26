## World War 2: a timeline in the history database, and an animation (2026-10-26)

**Asked for as** "make an animation which goes through the timeline of WW2, in history, somewhere appropriate. Also I
want to add a history timeline for World War 2."

### The animation, `hww2`

`tools/h_ww2.py`, on `anim_row.write_anim(..., whole=True, place=dict(...))`, prefix `hww` (no other drawing uses it),
a splashes row, and its id added to anim_row.py's WRITTEN BY A SCRIPT list. A year axis 1939–1945 drawn to scale, a gold
marker that glides to each of sixteen events in turn, and for each: the date, two lines of what happened, and a theatre
tag (Europe, Pacific, Africa, Home front). Each event leaves its dot; an event that lasted (Dunkirk, the Battle of
Britain, the Blitz, Stalingrad, El Alamein) leaves a bar its length. 30.8 s loop; reduced motion shows the whole axis
and the last card (VJ Day, signed 2 September).

**Where it hangs: GCSE History chapter 6, The road to war** (`about: 1 September 1939`). No History chapter is about the
war itself: GCSE has the causes (6) and then the Cold War (13); A-level chapter 6 (Germany 1918–1945) covers it only as
part of the Nazi state and is `lib_pending`. Chapter 6's last worked line is "1 September 1939: Germany invaded Poland;
on 3 September Britain and France declared war" and its drawing `hexp` ends on Poland invaded, so the timeline carries
the chapter's own story on. It is a second drawing about a different thing, so one drawing per thing holds.

### The timeline, `data/timeline.json`

A fourth public table (EV- ids), 26 events from the Munich Agreement (30 September 1938) to the surrender signed on 2
September 1945, each with whole years (the house convention, so eras work), `date_iso`/`date_iso_to` for the exact
days and the order, a `date_text`, places, theatre (Europe, Pacific, Africa, Atlantic, Home front, Diplomacy), `era`
"World War 2", a short summary in our own words, linked figures and sources. Six new figures, FIG-0004 to FIG-0009
(Hitler, Roosevelt, Stalin, Truman, Eisenhower, Montgomery); figures and writings gained an `events` column so every
link is written on both sides.

- **Named `timeline.json`, not `events.json`:** `events` is already the calendar's sheet tab (REQUIRED_TABS in
  doGet), and `DATA.events` would have meant two things.
- **In Find** it is a fourth answer to *Manuscripts, figures, writings or events*, plus a Theatre facet (one reader,
  `histCol_`, facets row 37.95, TAG_OF). `histTimelines_` makes one card per `era`: "World War 2 timeline", a line per
  event (first day, name, a tile to its card, opened in place by `find-open`) and an Animation tile to the chapter whose
  drawing is titled with the era. Event cards are the ordinary label/value card; their Figure tiles and the figures'
  Event tiles walk both ways.
- **Sources** are Wikipedia and Britannica article URLs. They could not be fetched from the session (no route out), so
  they were written from known article titles and are worth one click each by the owner.

### Checks

`check-history-db.js` covers the new table: exact columns, EV ids, event ⇄ figure/writing both ways, real ISO days
inside their years, ends not before starts, the file in date order, https sources, and exactly one animation per
timeline era. Mutation: an event struck from Hitler's `events` → red, put back → green. Flow journey "the history
timeline: …": events and the timeline found by Learning, Content, History, Events and by the funnel's walk; tiles are
every event in date order then the Animation tile; timeline → D-Day-style tile → event → Figure → Event, staying in
Find; the Animation tile lands on GCSE History chapter 6 carrying `hww2` (mutation: the tile removed → red).
Backend stamps and css 2026-10-26-ww2-events.
