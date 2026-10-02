## Library card numbers and PINs are three columns on `people`

**Asked for as "a place to make notes for library card numbers and library card pins"**, and the
three-question test at the top of this file answers where it goes before anything is designed.

**IS IT SECRET? YES — so a sheet, and never `data/`.** This repository is public and its history is
permanent. A card number and its four digits are exactly the shape this file already keeps out of
git alongside PINs, e-mail addresses and dates of birth.

**DOES THE APP WRITE TO IT? YES**, through `updateProfile` from the Settings column — which is what
makes it a sheet column rather than something kept on the phone. A note in `localStorage` is a note
you lose when you change phone, and the point of writing a library card number down is that it is
there in a year when you cannot find the card.

**`library_note` IS THE THIRD COLUMN AND IT IS DELIBERATE.** Somebody with cards for two boroughs,
or a card in a child's name, has a fact the other two have nowhere to put — and the alternative to
one free line is `library_card_2`, the numbered-column fault this file already records under
`images`, under `needs` and under the practicals' `equipment_1 … equipment_10`.

**WHO SEES IT: nobody by default.** `doGet` sends no profile column to anybody — `profileFields` is
the SHAPE of the form, not its values — so these three never reach the public payload. They reach
the person themselves in their own signed-in reply, and an **admin** through `getProfile`, which is
how every other column on this tab has behaved since it was written. Said rather than buried,
because it is a PIN and the owner is the admin.

**One entry in each of `PROFILE_GROUPS`, `CLIENT_GROUPS` and `STUDENT_GROUPS`** — a tutor, a parent
and a student each have one card and one set of digits they cannot remember — and `PROFILE_EDITABLE`
is derived from those three, so there is no second list to add it to.

### Every box on that form opened empty, and the first Save wrote the blanks back

**Found while wiring the new group up, and it is the older and worse fault.** `settingsPages_` fills
its fields from `USER.profile`, and **nothing has ever sent one to the person themselves**:
`getProfile` builds one for an ADMIN looking at somebody else, and `loginReplyFor_` — the reply a
person gets about their own row — did not. So every group on that column drew a card of blank boxes
on a fresh sign-in, whatever was in the sheet.

**AND A BLANK BOX IS NOT THE ABSENCE OF AN ANSWER TO `me-save`.** It gathers every `[data-me]` in
the card, empty ones included, and `updateProfile` writes what it is given. So opening Settings,
pressing Save on *About you* and changing nothing wrote `''` over the headline, the photograph, the
years of experience and all three adjectives. **The one screen for editing your own details was the
one screen that could erase them**, on the first press, with a toast saying *Saved*.

**`profileOf_` is the one builder and both callers use it.** It is `getProfile`'s own block lifted
out: an admin's view of somebody and that somebody's view of themselves are the same object, and
writing it twice is the second reader this file records under `documents_()`, `factsNow_` and
`childrenOf`. It is not a disclosure — the reply is answered only after `authCheckPin_` has passed,
and it carries the row of the person who just proved they are it.

### And the column moved next to You, because it was eleventh of eleven

**Reported as "The account setting should be in new coloumn I don't see it".** It was there and it
worked — `screen('settings')`, five pages, the `Your settings` tile on your own account card opens
it — and it was **four swipes past You** with no tab bar to jump with. `sort_order` 8 in
`data/settings/columns.json`, which is one cell and no deploy: the one column you reach for from
your own card is now the one beside it. Saved takes the end.

### "your own booking" was the row read back to you

**Reported as "There seems to be writing under one of the fields at the top. It's redundant or
unnecessary."** Measured rather than guessed at: the booking card draws its notes as `.bk-say`
under the row they belong to, and the first one on the card, under the first field, was

| under | | |
|---|---|---|
| **`For`** | *your own booking* | over a row already reading `For — <your own name>` |
| `Kind` | *It happens. Yours from the moment you pay…* | says what the dropdown label cannot |

**One fact drawn twice**, which is the fault this file already records where the roster's `name` put
an `<h3>` above every widget's own heading: both were correct and both were on the screen at once.
Thirteen pixels, on the first field of the app's most crowded card.

**The other branch of the same note stays, and the line between them is worth stating.** `Nobody yet
— just open it` is what you PICKED; *"the list opens empty, and families join it"* is what happens
NEXT, and nothing else on the card says it. A note that repeats the row is a caption; a note that
says what the row cannot is why the mechanism exists.
