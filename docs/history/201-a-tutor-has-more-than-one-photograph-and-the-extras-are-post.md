## A tutor has more than one photograph, and the extras are `posts.media`'s shape on `people`

**Asked for as *"theres only 1 photo link slot it seems like. tutors should be able to add more
pics."*** `photo` STAYS THE FACE and is not turned into a list: the tutor payload, the class picture,
the roster and three other readers take it as one address, and a separator inside it would be every
one of them breaking at once. **`photos` is the rest**, links joined by ` | `, which is exactly what
`posts.media` is beside `posts.image`.

**EIGHT BOXES OVER ONE CELL, the library shelf a third time** — `PHOTO_MAX` in constants.gs,
`photosIn` / `photosOut` in core.gs, kept out of `wanted` and header-checked in `updateProfile`,
expanded in `profileOf_`. Two differences, both because a gallery is a LIST rather than a set of
slots: a gap closes up, and the same link twice is one photograph. A pipe inside a link is escaped
to `%7C` rather than stripped, so the address still works and still reads back as one.

**A PHOTOGRAPH THAT IS NOT A LINK IS REFUSED BY NUMBER** (`photosRefusal_`), not kept and not
dropped — kept, it draws as a broken picture on a public card; dropped, it is something typed and
gone under a toast saying Saved.

**A TUTOR'S `Photos` PAGE IS THIRD**, after Contact: the profile photo and the video moved there off
About you, then the shelf. Each filled link has a 44px thumbnail beside it, drawn through the same
`pic()` the card uses, so an unshared Drive file is a broken square on the form rather than on the
card. Parents and students keep `photo` on About you.

**ON THE CARD, FOUR SQUARES TO A ROW, and a tap opens one across the row in place** — not a sheet
and not a new tab. `photosList_` sends the extras without the face, so the card does not draw one
photograph twice; an older backend sends no key and the card draws nothing.

**Proved**: `check-people.js` round-trips the cell (a gap, a duplicate, a pipe, a sentence refused,
the face left out), `check-profile.js` saves `photos_1` and reads it back after signing in again,
and two states — the settings shelf and an opened square — each named at all four widths when broken.

**Needs `?setup=1` once the backend is deployed**, which is what creates `people.photos`. Until it
exists the Photos page refuses its save by name rather than losing the links.
