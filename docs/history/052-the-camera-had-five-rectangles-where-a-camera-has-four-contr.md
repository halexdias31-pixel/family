## The camera had five rectangles where a camera has four controls

**Asked for on a whiteboard, by shape and by colour**: *"Camera, should be 4 buttons: white circle
for take pic, Red for record, and switch camera, and photos."* What was there was five `.btn quiet`
rectangles under the viewfinder — `Photo`, `Video`, `Again`, `Save it`, `Photos` — which is a
FORM'S buttons on a card whose whole content is a live picture. The house style already draws that
line one way (*"a THING has tiles; a FORM has buttons"*) and a camera is neither: a shutter is its
own vocabulary, and everybody already knows it.

**The white and the red are declared on the component, not at `:root`.** This is the chessboard
case the house style settles: a colour belonging to ONE component — that board's cream and
charcoal, this control's white and red — is named on the component so it is available without being
offered to a black-and-gold stylesheet. Nothing else in this app may reach for a white disc.

**Recording changes the SHAPE.** The disc has no room for the word `Stop`, and the old rectangle
rewrote its own label to say it. A red disc is record and a red rounded square is stop, which is
what every camera does — and `aria-label` moves with the shape in `camRecMark_`, or a screen reader
is told the opposite of what is true. A control that looks the same while it is running is the mode
you cannot see, which is the fault this file already records for a reel paused with nothing on it
saying so.

**`Again` and `Save it` left the row.** They belong to a picture you are holding, not to a camera
you are pointing, so they are the row underneath — which is 0px tall until there is something to
save. Measured in seven states.

### The record button had never appeared on the path anybody takes

**Found by reading the two branches side by side while rebuilding the row.** `camStart_` reveals the
controls in two places: the re-attach branch, which runs when a `repaint` has replaced the markup
under a live stream, did `$('cam-video').hidden = !canRecord_()`. **The success path — the one every
first start takes — did not.** So the button added because *"there was no way to record at all"*
could only be reached by triggering a repaint, and leaving the column hid it again.

`camLive_(on)` is the one function both call now, which is the `factsNow_` / `documents_()` argument
one screen along: two readers of one fact are two chances to disagree about it.

**And the shutters are DISABLED rather than hidden while the camera starts.** A control that appears
when the first frame arrives grows the card under the thumb reaching for it — the same complaint the
booking grid's own note makes about folding.

### `Switch` is the one control that is not drawn until the browser says it can work

**`enumerateDevices` answers before permission and answers wrongly.** Without a granted stream a
browser may report one anonymous `videoinput`, or none, so that the device list is not a
fingerprint — so asking at boot would hide the flip control on every phone that has two cameras. It
is asked a frame after the prompt is granted, in `camWays_`, where the list is the real one. Fewer
than two and the button is not there: a flip control that swaps the picture for the same picture is
the `orderPrints` shape.

**A track's `facingMode` is fixed when it is opened**, so the other camera is a new stream —
`camStop_(true)` then `camStart_()`, where `true` is the flag that releases the hardware and leaves
the card alone, so the buttons do not flicker back to their starting state for the third of a second
the swap takes.

**NOT WHILE IT IS RECORDING**, and that refusal is the interesting one: stopping the stream is what
assembles and downloads the file — see the ordering note in `camStop_` — so a flip mid-record would
save a half-length video and read as the button having eaten it. It says *"Stop the recording
first."* rather than refusing silently.

**Proved in eight states** with a stubbed two-camera device: live, after a shot, after `Again`,
recording, a flip refused mid-record, stopped and saved, flipped (`environment` → `user`), and the
column left — where the stream is released, the shutters grey and `Switch` goes. `check/ui.js`
reports nothing at all across the eight `make` combinations.
