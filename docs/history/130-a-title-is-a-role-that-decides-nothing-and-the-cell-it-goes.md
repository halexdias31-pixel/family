## A title is a role that decides nothing, and the cell it goes in was already built for it

**Asked for as "I want to add a role. For George he is the head of boxing. For now leave this as
just a title or something. In the future it will mean something. Just have it be in code somewhere
idk."** The first move was to read the role machinery rather than invent a column, and most of the
answer is that it was there already.

**`rolesOf` SPLITS THE `role` CELL ON COMMAS** — *"a person may hold SEVERAL roles… one role is not
more real than another"* — **and `mainRole` picks from a DECLARED list**, `['admin','tutor','client',
'student']`, so a value that is not on it can never win. Every gate in this project asks
`hasRole(row, 'tutor')` and nothing asks the other way round. So a title sitting beside a real role
grants precisely nothing today **by construction rather than by somebody remembering**, which is
what made this three fields rather than a schema change.

**IT IS DECLARED IN `ROLE_TITLES` RATHER THAN LEFT AS A STRAY CELL STRING.** `head of boxing` typed
into the sheet with nothing naming it prints in the roster in lower case, means nothing to a reader
of `constants.gs`, and the day somebody DOES want it to gate something there is no way to tell
whether it was deliberate or a typo. One entry, one written reason — the `ACCEPTED` / `VOCAB` /
`RETIRED_FACETS` / `HANDLE_ALLOWED` pattern for an eighth time — and the note says where to look
when it starts to mean something.

**THE COMMA IS LOAD-BEARING AND THAT IS THE ONE THING TO GET RIGHT IN THE SHEET.** The cell must
read `tutor, head of boxing`. A row holding only titles has no real role left, `mainRole` falls back
to `client`, and George drops off the tutor list and off the site — the control doing the opposite
of what it was asked for, silently.

**`titlesOf` READS OFF `ROLE_TITLES` RATHER THAN "whatever `mainRole` did not pick".** That second
rule is one line shorter and would print a typo in the role cell as somebody's job title, on a
public card, which is the fault `/required practical/` matching *"AQA-aligned, NOT a required
practical"* already cost five cards.

**`titles` IS A SEPARATE PAYLOAD FIELD, NOT A LONGER `role` STRING.** `role` is one word the card
sets in the pass's own label and the funnel reads as a kind; joining `Tutor · Head of Boxing` into
it would put a title through every reader of that field and there is no way back out of one string.
Drawn in the heading that already says what somebody IS — a row of its own would be a twelfth
label/value line for a fact three words long — and read through `profList_`, because the shape is
not something that card gets to assume.

**And `listPeople` and the card were two lookups for one label.** `ROLE_LABEL[x] || x` written out
in `dopost.gs` would have printed a title as the raw lower-case cell in the roster while the card
printed it properly. `roleLabel_` is the one reader, which is this file's sentence about
`documents_()`, `paperIdOf_`, `factsNow_` and `childrenOf`.

**And the fixture said `role: 'tutor'` where `doGet` sends `Tutor`.** Lower case beside a Title Case
title reads as broken, and it is the shape recorded here where the fixture stated `focus` as a
string `doGet` does not send. Measured in a browser after: the account column draws
`Tutor · Head of Boxing`, and every other heading is unchanged.
