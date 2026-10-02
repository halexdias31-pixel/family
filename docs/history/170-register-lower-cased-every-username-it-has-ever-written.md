## `register` lower-cased every username it has ever written

**Asked for as "i would like peoples username logins to be case sensitive."** The literal reading is
declined and the line to change is named below; what the measurement found is a real fault under it.

**`register` WROTE `norm(first + last)`**, which lower-cases — so every account that has never been
renamed has been showing `halexdias` where the person wrote `HalexDias`. And `changeHandle` did the
same to anything anybody typed. The case somebody chose is a fact about them; **it is preserved
now**, in both writers.

**MATCHING IS STILL CASE-INSENSITIVE AND THAT IS DELIBERATE.** `key()` — lower-case, alphanumerics
only — is what `findPerson` compares with, in 147 places. Making the comparison case-sensitive means
somebody who typed their name with a capital on Tuesday cannot sign in on Wednesday, and the
sentence they get is *"Name or PIN not recognised"*, which is this file's own definition of the
worse of the two failures. **What was actually wrong was the DISPLAY**, and that is what is fixed.
One line in `key()` reverses it if the literal reading is wanted.

**AND THE UNIQUENESS TEST HAD TO STAY ON `key()` WHATEVER THE DISPLAY DOES.** `HalexDias` and
`halexdias` must not be two accounts: `findPerson` resolves both to the first row it finds, so the
second person would sign in as the first — which is not a denial, it is a disclosure, and this file
already records `changePin` doing exactly that by accident.

### An e-mail address is the sixth rung, and the `@` guard is what makes it safe

**Asked for as "i want people to be able to sign in with email as well."** `findPerson` resolved
person_id, full_name, first+last, handle and username; it resolves an e-mail address now, **last**,
and only when what was typed contains an `@`.

**THE GUARD IS LOAD-BEARING AND THE RUNG ORDER IS NOT.** `Array.find` returns the first ROW that
matches any rung, so a row whose `email` cell holds junk — a note, a dash, a second name — would be
matched by a plain name typed into the box if the rung were unguarded. Measured with such a row
placed **above** the real one, which is the only arrangement that can tell the two apart: without
the `@` test the wrong person is returned. **Proved by mutation**, because my first reading of this
was that the order protected it, and it does not.
