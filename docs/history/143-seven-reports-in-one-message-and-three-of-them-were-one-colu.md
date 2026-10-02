## Seven reports in one message, and three of them were one column opening on the wrong page

**Asked for as *"add email field in account settings. add forgot pin option. it will send an email
to their email. why does george have a crossed out eye even if iclick it. then it says no such
person. have a message sent to everyone from halex saying Hi wlecome! fix how the reels appear at
the top of screen on my pc. im logged into halex, i dont see account settings."*** — plus, from the
message before it, a crop of the booking card with one word on it: *"remove this text"*.

### The column called You opened on somebody else

**`PAGE_HOME.account` WAS `USER ? 1 : 0` AND ITS OWN COMMENT SAID "past the name card".** That was
true when it was written: page 0 was a name, a role and a button. `meCard` draws your photograph,
your credits, your e-mail and every tile you own — **`Your settings`, `Add your child`, `Your
figure`, `Sign out`** — and this line skipped it, so the column opened on the first OTHER person in
the roster.

**THAT IS THREE OF THE SEVEN REPORTS AT ONCE.** *"I don't see account settings"* — the door to the
Settings column is the `Your settings` tile and the tile is on the page this skipped. *"Why does
George have a crossed-out eye"* — because George's card is what the column opened on, which is also
why he has been the subject of four reports in a row. And the previous entry in this file records
*"the account column OPENS on him (page 1)"* as though it were the feature working.

**THE SAME SHAPE AS `PAGE_HOME.dm`, FOUR LINES DOWN, WHICH WAS DELETED FOR IT** — a rule outliving
the thing it was written about. That one was caught when its head card was removed; this one was
not, because the page it skips never disappeared. **It simply became the page you want.**

### `setListed` looked the person up itself, and half the roster has no `full_name`

**REPORTED AS *"why does george have a crossed out eye even if i click it. then it says no such
person."*** The tile sent the DISPLAY name; the handler compared it against `full_name` **alone**.

**`personDisplayName` IS `full_name` OR `first + last`.** So a row with the two halves filled in and
the whole-name cell empty produces a name that lookup can never match — the switch refuses every
press, the tile flips back, and the app says the person does not exist **while their card is on the
screen above it**.

**`findPerson` RESOLVES person_id, full_name, first + last, handle and username**, which is exactly
the list `personDisplayName` draws from, and it is what every other handler in that file already
uses. A second lookup written out inline is the second reader this repository records under
`documents_()`, `factsNow_` and `childrenOf`, and this is what it cost. **The phone sends the id
now as well** (`pid` off the item's own row), so the name is the fallback rather than the only
route — and the success path updates the row by id too, because it was matching on the same name.

### The email field was there, thirteen swipes down

**REPORTED AS *"add email field in account settings"*, and `Contact: ['email','phone',
'date_of_birth']` has been in `PROFILE_GROUPS` for as long as that object has existed.** What is
also true is where: `settingsPages_` maps those keys straight onto pages in order, and `Contact` was
**the thirteenth of twenty-three**, under About you, Where, Group size, Your rate, Where you are,
Yours, What you teach, three qualifications, More qualifications and a week of seventy-seven hour
boxes.

**A FIELD NOBODY CAN FIND IS A FIELD THAT IS NOT THERE** — the sentence this file already writes
about the calculator, about `topics`, about `company` and about the practical guides. It is second
now, after About you, which is where `CLIENT_GROUPS` and `STUDENT_GROUPS` have always had it; this
was the one map of the three that disagreed.

### A forgotten PIN, and the only security it has is that it says nothing

**ASKED FOR AS *"add forgot pin option. it will send an email to their email."*** One button under
`Sign in`, taking the name already typed into the box above it — `forgotPin` accepts a name, a
username **or an email address**, because "forgot" is the state in which you are not sure which one
you signed up with.

**IT SAYS THE SAME SENTENCE WHATEVER HAPPENS.** A reply that said *no such person* would turn the
sign-in card into a machine for confirming who holds an account here, and half the people on that
tab are children. So every branch returns one success and the difference between them is only
whether an email leaves.

**IT SETS A NEW PIN RATHER THAN SENDING A LINK.** A reset link needs a token column, an expiry, a
second screen and a route that works when nobody is signed in; a temporary PIN needs none of that
and lands where this app already trusts — `authSetPin_` writes the hash and clears the plaintext,
exactly as a change from the settings column does. Six digits, re-drawn until they pass the same
test `changePin` applies, because a reset that handed somebody `111111` would be the site issuing
the PIN it tells people not to pick.

**SESSIONS ARE NOT ENDED, AND THAT IS THE OPPOSITE OF `changePin`.** There the person asking has
proved who they are, so ending every other session removes an intruder. **Here anybody may ask** —
so ending sessions would let a stranger sign the owner out of their own phone by typing their name.

**And it does not go through `notify`**, which looks the person up again by name: the row is already
in hand, and a second lookup on a name that may have matched by EMAIL is a second chance to send
somebody else's PIN to somebody else's inbox.

### One message to everybody, which is `sendMessage` without the picker and without the gap

**ASKED FOR AS *"have a message sent to everyone from halex saying Hi wlecome!"*** — and nothing
here can press it, because every host but GitHub is blocked from this environment. So what is built
is the control; the sending is one tap on the last page of the Messages column.

**THE SAME TAB, THE SAME ROW SHAPE AND `mayMessage` ASKED PER RECIPIENT**, so a broadcast cannot put
a note in front of somebody the rules say the sender may not reach — a policy written twice is the
fault `MESSAGING` records. **The five-minute gap is skipped and only here**: it exists to stop one
person writing to many people quickly, which is precisely what this is for, and is why it is
admin-only instead.

**`'M' + Date.now()` WOULD HAVE GIVEN EVERY ROW OF ONE BROADCAST THE SAME ID.** One loop is one
millisecond, so forty recipients would share one `message_id` — and `readMessage` finds a message by
that id. The index is on the end of it.

**THE EMAIL IS OFF UNLESS ASKED FOR, and the tick says why.** `MailApp` has a daily quota and a
roster can spend the whole of it in one press, which would take down the booking confirmations
everything else depends on. The message is in the app either way.

**A PAGE RATHER THAN A SHEET**, which is the wardrobe's decision one column along, and **appended
rather than prepended**: `dmPages_` used to open with a head card carrying one control and
`PAGE_HOME.dm` existed purely to swipe past it. Putting an admin card at the front would be that
fault again, on the same column, three commits later.

### The reel was a small box pinned to the top of a laptop screen

**REPORTED AS *"fix how the reels appear at the top of screen on my pc."*** Measured at 1440x900,
signed in: the card ran **y39 to y555 — 502px of card and 345px of nothing under it.**

**THE PLACEMENT IS CORRECT AND THE CARD WAS SHORT.** Every column starts on that same line, which is
what `COLUMNS OUT OF LINE` exists to keep true. What decided the height is `min(62svh, 30rem)` — and
**30rem is 480px wherever the root is 16px, which is every screen wider than about 420**, so the rem
cap rather than the viewport term decided it on every laptop.

| measured, signed in | 320x568 | 390x844 | 1440x900 |
|---|---|---|---|
| the card, before | — | 480 | **502** |
| the card, after | 475 | **628** | **657** |
| the pane it sits in, against its own cap | 502 of 534 | 658 of 807 | **688 of 861** |

Nothing is hidden below a pane's fold at any of the three, which is the number that must not be
crossed — see OUT OF REACH.

**IT IS NOT TALLER STILL, AND THE CLIPS ARE WHY.** `.feed-vid` is `object-fit: cover` and both clips
in the column are **576x576 — square**. A 9:16 box is the right shape for a reel shot as one and
would crop half the picture off these.

### And the sentence under the subjects row came off

**The note above it is the argument for it and is still true of a dropdown nobody has opened** — a
closed multi-select showing a dash is one you pick a single thing from, everywhere else anybody has
used one. It was also printed under the first field of the most crowded card in the app, and the
owner has now read it, so it has done the one job it had. **`multi: true` is untouched**: choosing
again still adds one and a ticked one still comes back off.
