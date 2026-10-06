## Two ways of saying who you are, and the app already had one

**Reported as "remove this feature of whos writing. its confusing. just have it be that they sign in
then can see answers."** The `workingAs` control — a `who is this?` button beside every answer box
that opened a `window.prompt` and filed the answer key under whatever was typed.

**It was a SECOND IDENTITY the app did not otherwise have**, and that is the whole fault: not a
login, nothing protected by it, nothing sent anywhere — its own note called it *"a label on a
drawer"*. Two ways of saying who you are is two things to keep in step, which is this repository's
sentence about `handle`/`username`, about `MESSAGING` and about `childrenOf`. `whoIs_` is the
signed-in person and nothing else now.

**What it cost, said rather than buried.** A boy who turns up today with no row in the Ledger works
under the signed-out key, the same as the tutor, where before a tutor could type his name at the
kitchen table. That is the ordinary behaviour of every other surface here, and the remedy is a
roster row and a PIN rather than a parallel mechanism.

### The box said "P001's answer", which is its own part of "its confusing"

**`whoIs_` answers `u:<person_id>` because an id is stable where a display name is a cell somebody
can edit** — exactly right for a KEY and unreadable as a LABEL. The old name box printed that id
back at whoever was working: an answer box captioned with an account number. `signedName_` is the
first name off `USER.name`, so the caption is `Ada's answer` and the key is still
`ans:u:P777:q:Q0664`. **Measured in all three states**, and the name is kept rather than reduced to
"Your answer" because on a phone passed between two students it says at a glance whose drawer the
box is writing into — which is the one thing the deleted button was genuinely good for.

### And the mark scheme was shut for the one person who reads from it

**`hide = !!whoIs_()` was the test, and with the typed name gone that means "is anybody signed
in".** So a tutor signed in as themselves got their own mark schemes behind a tap — on the surface
they read FROM. `answerBlock_`'s own paragraph says who the open answer is for and it is not
"somebody signed out", it is the tutor.

**`isTutorRole()` is the app's own staff test** — tutor or admin, already used by the widget roster
for the same kind of question — so staff get the paper as printed and everybody else gets the
reveal, which opens itself the moment Check says they have it. Measured through the real app:

| | mark scheme | answer key | caption |
|---|---|---|---|
| signed out | one tap | `ans:q:Q0664` | Your answer |
| a student signed in | one tap | `ans:u:P777:q:Q0664` | Ada's answer |
| **the tutor signed in** | **open** | `ans:u:P001:q:Q0664` | Alex's answer |

**The signed-out row is the one behaviour change beyond what was asked**: it was open and is now one
tap. A student who cannot sign in yet is the case the reveal exists for, and with the name box gone
that was the only route to it; an answer behind a tap is never harmful where an answer printed under
the question can be. One rule, and "not signed in" behaves like "not staff" as it does everywhere
else in this app.
