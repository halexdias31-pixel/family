## The heat map was half its own size up and to the left, and the levels stopped at A-level

**Reported from the phone with a screenshot**: *"heat map looks shit right now. level only has gcse
… add enhanced level to level so i can put enhanced dbs. remove note to self on library cards."*

**`calc(50% + d)` in a `background-position` does not mean the box's middle.** It lines up the
IMAGE's 50% point with the box's 50% point, so a 256px tile placed that way starts 128px left of
where `d` says. Every tile and every glow was offset up and to the left by half its own size. That
is why the bottom of the map was black and the glows sat off their venues. `pos()` now adds the
layer's own half-size back.

This container cannot load the tile host. So it was proved by serving stand-in tiles that print
their own `z/x/y`, with the five real venues: the box is filled edge to edge. The glows are 80px,
not 64 or 150. At 150 they fused into one ball; now each venue is a soft patch and neighbours
still add up. The map is 200px tall, and zoom goes down to 9, which is all of London in one view.
That is the scale at which "roughly south-west London" reads.

**Qualification levels and grades are code-side lists (`QUAL_LEVELS`, `QUAL_GRADES` in me.js)**,
like the subjects, and for the same reason. The sheet's `level` list is the booking list (GCSE, 11+,
AS, Alevel, B-TEC, SATs, three mocks), and its grades misspell Distinction. Levels now run from
Entry Level to Doctorate, then `Basic` / `Standard` / `Enhanced`. So a DBS check is subject **DBS**
at level **Enhanced**, and `Enhanced DBS` is off the subject list. A saved value not on a list is
kept as its chosen option.

**`library_note` is gone** from `SCHEMA.people`, all three form groups, the fixture and the lab
state. It held nothing on the live tab.
