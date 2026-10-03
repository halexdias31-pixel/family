## The chat was refined, and most of what read unfinished only showed in states nobody had drawn

**Asked for as "also refine the chat widgetts. looks fine but refine please."** Polish, not a
redesign: the column is still one conversation per page, gold for yours, runs worked out in
`messagesHtml_`, the composer at the foot, the server's own sentence on a refusal. Every state was
shot at 320 and 390 first (signed out, an empty inbox, a failed load, an inbox, a long thread with
day lines, a photo, a file, a clip, a long URL, a long word, a refused send, a send in flight, a
reply being written with two files queued, and the sheet on a tutor's card), and the list below is
what those pictures showed.

| | before | after |
|---|---|---|
| composer at 320 | `Send` wrapped onto its own line under the `+`: three flex bases came to 220px in a 218px row | the box's basis is 0, so it takes what the buttons leave and the row cannot wrap |
| composer shapes | a square `+`, a pill box and a square gold slab | a 44px circle, a pill box and a pill `Send`, all 44px tall and bottom-aligned |
| empty composer | "Message Ada Tutor…" wrapped, so the EMPTY box was two lines (`field-sizing` sizes to the placeholder) | "Message…"; the name moved to `aria-label` |
| text in the box | sat 8px from the top of a 44px box | centred: `11px` padding, px because the 44 it centres in is px |
| runs | three round pills hugging at 2px | the corners where a run's bubbles meet are tightened on the speaker's side, so a run is one shape |
| a photo on its own | sat in a thick gold mount on your side, a dark one on theirs | no fill, no padding: the photograph is the bubble, clipped to its corners and tail |
| a file | three lines of underlined gold (`.msg-body a` won) | an ink chip, the extension on a small plate, the name held to two lines; the tray uses the same plate |
| a clip that will not play | the fallback link kept `.msg-vid` and was a black slab with a link at its top edge | drawn as a chip |
| a refusal | full width, left-aligned under a right-hand bubble, Retry and Remove on a line of their own | held to the bubble's 78% on its side, right-aligned, the two controls straight under it, Retry gold and Remove quiet, both 44×44 |
| unread | "2 new" in small gold text, and **no message was ever outlined**: `dmPages_` marks read before it renders | a gold badge, and the messages that arrived unread are outlined (`m.fresh`, set by `markRead_`) until the server's next answer replaces them |
| thread height | 22rem, a number from the You screen: half a 390×844 phone was empty glass under the composer | the card is capped at the pane's own cap and the thread takes what is left; a growing composer takes its lines from the thread, not from below the pane |
| empty inbox | "Messages about a session appear here." | "To write to a tutor, open their card and press Message." — the column has no new-message door, so it names the one that exists |

**Two instruments taught on the way.** `check/states.js` draws three new `dm` states: a long thread
(asks that the composer's foot is inside the pane, the thread is taller than 22rem, and the card is
NOT zoomed — `paneReach_` in find.js shrinks a card taller than its pane, so a cap that is too
generous never clips the composer, it quietly makes every target in it 37px; the first version of
the `expect` passed that mutation), a refused send, and a reply being written (asks that `Send` is
beside the box, not under it). `check-flow` has a chat journey: the two unread messages are the ones
outlined, a second paint keeps the outline, the server's next answer drops it, the hint and the
`aria-label`, the refusal's sentence as its own element, and the empty inbox's door. Each proved by
mutation.

**Kept deliberately**: the name in the time line under a run (053: "the name confirms rather than
tells"), Retry and Remove as buttons rather than tiles (they belong to the composer's send, a FORM),
and the square `.btn` everywhere else — only the composer's two buttons are round, because the box
between them already was.
