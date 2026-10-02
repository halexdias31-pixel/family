## Chat was in Tools because the note deleting it only took the static half

**Reported as "i dont want chat in tools. what the fuck"**, with a screenshot of two message threads
sitting under the calendar on the Tools column.

**`map.js` ALREADY CARRIES THE ARGUMENT AGAINST IT, in full, where the messages widget was deleted
from `WIDGETS`**: *"a calculator, a board and a timer are instruments: you go looking for one
because you want to do something with it. A message is somebody trying to reach YOU."* That removal
took the FIXED entry out. **`msgWidgets_()` in `me.js` went on generating one per conversation with
`kind: 'tool'`**, and `allWidgets()` concatenated them — so the decision was undone by a function
nobody connected to it, in a file the note does not mention.

**And the `dm` column exists now**, one conversation per page with the composer at the foot of each,
built long after that note. So Tools was the **third** home for a conversation and the only one
nobody asked for — the reel scroller's shape exactly: a surface that predates a better one and was
never removed with it. `msgWidgets_` and `fillThread_` are gone; measured first, the string `msg:`
appears nowhere else, so the roster was the only reader.
