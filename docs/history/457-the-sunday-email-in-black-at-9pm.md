# 457 — The Sunday email in black, at 9pm

Sunday 25 Oct 2026. The owner sent a phone screenshot of the day's parent email — light grey, dark text, a
black diagram strip on a light card, their answer in a dark pill — and wrote:

> "This looks like shit. Why isn't it in black. Also why was it done at 6pm instead of 9pm."

## Why it went at 6pm

Not the clocks going back that morning: the trigger is `atHour(h).inTimezone('Europe/London')`, and 18:00
is three hours out, not one. The hour was **18 on the sheet**. `weekly_digest_hour` was first seeded as 18
(280); 351 changed the code's default to 21, but `seedConfig_` never overwrites a row, so the config tab
still said 18 with the old seed's note, and `digestKeepBooked_` faithfully kept the trigger at 18 on every
admin page load.

Fix: `CONFIG_RESEEDED` (constants.gs) names the old seed — value `18` and its exact note — so a row nobody
touched becomes 21 on the next schema run (this backend's version bump makes it run), and the same admin
page load re-books the trigger at 21. An 18 the owner typed (note changed) is left alone.

Found on the way: `digestSendAt_` (the setup card's "next send") counted minutes from now, so across a clock
change it said 20:00 or 22:00 GMT for 21:00 London. It now corrects by London's wall clock at the result.

check-digest (d): an untouched old seed re-booked at 21, a typed 18 kept, the week sent at 21:00 GMT on
25 Oct, the next send 21:00 London from either side of both 2026 clock changes, and the reserve holding
then sending on that Sunday.

## Why it was light

The email was already black (380). The Gmail app's dark mode **inverts the whole email** — a dark email
comes out light — but not its pictures, so the black PNG twins stayed black on a now-light card. 380 had
removed the gradient defence because the words went dark on black.

Fix, in `digestDarkDoc_`/`digestRender_`: the outer frame keeps its black with a gradient (Gmail leaves
gradients alone); the body sits in `.gs` (screen) and `.gd` (difference) layers, Gmail-only via
`u+.body`, which turn the inverted words back; `.gi` on a picture or a coloured word turns it back once
more. In every other client the layers are no-ops. No paper anywhere: their answer is a #1a1a1a box with
the pane's rim; the model answer is body-size, not 18px bold; the font is the site's monospace stack.
Shots (light, dark, and an emulated Gmail inversion) were taken at 390 px; in the emulation the tag
colours come out darker than the site's — the inversion's, not the email's.
