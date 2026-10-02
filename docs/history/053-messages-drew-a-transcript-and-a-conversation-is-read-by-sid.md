## Messages drew a transcript, and a conversation is read by side before it is read by name

**Asked for as "messages should look like IG DMs".** What was there was full-width rows separated by
hairlines with `text-align: right` standing in for *this one is mine* — which is a log. You know who
said a thing from WHERE IT SITS; the name under it confirms rather than tells.

**Runs are the half that makes it a chat, and they are worked out in `messagesHtml_` rather than in
the stylesheet.** Four messages in a row from one person is one turn, not four — so only the LAST of
a run carries the squared tail corner and the "you · time" line, and the ones above it hug at 2px.
Without that, six bubbles read as six exchanges and the card is no calmer than the hairlines were.
Measured on a stubbed thread: 7 messages, **4 runs, 4 timestamps**.

**Gold for yours, because gold is already what this app means by yours** — the one action, the
ticked hour, the starred thing — with black text on it, which is what `.hr.on` already does for the
same fill. And the bubble is 78% of the card rather than the whole of it: a bubble that reaches both
edges has no side to be on, which is the entire mechanism.

**`.msg.unread` had to change shape with it.** A gold rule down the LEFT is right for a full-width
row and cannot survive a bubble that has a side — on `.mine` it drew a gold bar on the wrong edge of
a gold fill. The bubble's own outline says it instead, which is the argument the old rule made and
the shape it could not keep.

### You could read a conversation and not answer it

**The only composer in the app was in a sheet on a person's pass.** So replying to something on the
Messages column meant leaving it, finding that person on another column and opening their card. The
box is at the foot of the thread now, which is where every messaging app anybody has used puts it —
and `msgForm_` is ONE builder, used by the thread and by the sheet, because the sheet having its own
textarea, its own button and its own note is a second composer to keep in step with the first.

**`$('msg-text')` WAS THE BUG WAITING TO HAPPEN.** It was right while there could only ever be one
composer on the page; the Messages column draws one per conversation, so three on a screen would be
three elements carrying one id and the browser hands every `Send` button the first of them — **a
reply typed to your tutor posted to somebody else.** `on('msg-send')` walks up to the nearest
`.msg-form` instead, which is a fact the DOM can answer and an id cannot. **Proved with two threads
on screen**: typing into the second posts `to: Office, toId: P001b`, which is the second thread's
own id rather than the first's name.

**And `closeSheet()` could not stay unconditional.** The thread's composer is on the page, not in
the sheet, so what it needs is its box emptied — closing the sheet from there would dismiss whatever
else somebody had open. Asked of the DOM (`form.closest('#sheet')`) rather than remembered in a
flag.

**A conversation opens at its newest message.** A scroller's natural state is the top, which on a
thread is last month. `dmFoot_` is booked from `startScreen_` with everything else a screen has
running — the note there records what happens to a job booked anywhere else.

**Two things fixed on the way past.** `Refresh` was a full-width gold slab over a column of
conversations: `.btn` is the one action on a card and fetching a list again is not it, which is the
same correction `.reel-sound` already records. And **an empty inbox had no Refresh on it at all** —
`loadMessages` deliberately leaves `MESSAGES` alone on a failure, so a first fetch that never
arrived drew "Nothing yet." with no way back. This repository's oldest fault with the door removed.

### `check/ui.js` had only ever seen this column empty

**Messages are a POST action, not a payload key** — deliberately, because a conversation is private
and the GET payload goes out whole to whoever asks for it. So `check/fixture.json` cannot carry one,
and `dm: nothing to report` has meant the "Nothing yet." card and nothing else, at four widths, on
every run since that file existed. **The same sentence this file already carries about the booking
screen signed out.**

**So the thread is a declared STATE.** `MESSAGES` is what `messageThreads_` reads and `loadMessages`
writes, so setting it is the state the app is in a moment after a successful fetch — the app's own
door, exactly as the signed-in visitor is seeded through `localStorage` rather than by poking `USER`.
Two people, a run of three, and one deliberately long sentence, because the widest thing a bubble
ever holds is something somebody typed.

**`{ name: '' }` HAD TO STAY ON THE LIST.** Declaring states REPLACES the unnamed one every screen
has by default, so naming only the seeded thread would have stopped this file ever measuring the
empty card again — a state gained and a state lost, silently. Caught by the combination count going
8 → 4 instead of 8 → 12.

**Proved by mutation**: an `expect` of 99 bubbles names the state at all four widths and exits 1;
the real file exits 0. 104 combinations, nothing to report.
