## Each person sees their own figure on a session, and its tiles are on the paper

**Asked for as "for tutor they shouldnt see grand total client pays, only grand total they earn.
admin should be able to see grand total client pays. total tutor earns, and how much admin earns",
"add how much each job earns tutor and admin and client" and "no floating tiles for already booked
sessions".**

**THE PAYLOAD DECIDES, THE PHONE DRAWS.** `doGet` sends each job `price` to everybody it went to
before EXCEPT a tutor on the job who is not also a client on it; `tutorPay` (the `tutor_pay` cell)
to the tutors on the job's own roster and an admin; `adminKeeps` (`admin_profit`) to an admin
alone. A blank cell stays `''`, never `N('')` = 0. `jobMoney_` in book.js turns what arrived into
the total rows: a client gets `Cost` (or the stage's wording), a tutor `You earn` in that row's
place, an admin `Client pays`, `Tutor earns`, `Admin earns`. An unrecorded figure is a dash.
A tutor counts as "on the job" by `j.tutor` OR by `tutorSlots`, because `tutor` is only the first
name on the roster and a second tutor who has applied would otherwise be handed the client's line.
On a waiting list an admin's first row reads `Each seat pays`, not `Client pays`: `price` there is
one seat (`doGet` says so beside it), not what the families are charged in all.

**`tutor_pay` WAS WRITTEN BLANK ON EVERY JOB.** `createJob` wrote `''` and the phone never sent it,
so a tutor's receipt had nothing to show. `receipt.js` sends `L.tutorPay` now and `createJob`
stores it — recorded as sent, like `admin_profit`; nobody is charged from it. Jobs made before
this deploy read as a dash for the tutor until the cell is typed in.

**`moneyBlock` IS GONE.** It floated `£X left over` under the paper for an admin, and on the form it
never drew at all: it read `L.profit` where `priceFrom` returns `profitTotal`. `receiptHtml` takes
`r.more` and draws each as another `.rc-total` row (`.rc-more`, no rule above it). `formMoney_`
gives an admin the same two rows on the form once it is priced; a waiting list (priced by
`waitPrice_`, which works out no split) gets none. Sharing hides `.rc-more` in print, because a
shared receipt goes to a family.

**A total's label spans `1 / -2`.** The label track is `minmax(6.2em, max-content)` and shared by
every row, so `CLIENT PAYS` in tracked capitals widened the question column and wrapped every answer
on the card (and `IT WOULD COME TO` had been doing the same on applications). `check/ui.js`'s
FIELD OUT OF ITS COLUMN exempts a total's label's RIGHT edge, as it does the week's.

**THE TILES ARE THE RECEIPT'S FOOT.** `jobPage_` builds one `.tile-row rc-tiles` from `jobTiles_`
and `jobAdminTiles_` and hands it to `jobReceipt(j, foot)`; `jobAdminTiles_` returns tiles rather
than a row of its own (it was a row inside a row). A session already paid offers no Pay, which is
`jobTiles_`'s own test.

**Checked**: `check-profile.js` §10 runs the real `doGet` for a client, the tutor and an admin on one
seeded job (proved by mutation three ways — price to the tutor, tutorPay to all, adminKeeps to
all). `check-flow.js` "each person sees their own figure on a session, and its tiles are on the
paper" (proved by mutation: the tutor shown the client total; the tiles back under the paper; a
tutor matched by `j.tutor` alone; an admin's waiting list labelled `Client pays`).
`check/states.js`'s session receipt asserts three total rows and no action outside `.rc`.

**Needs the backend pulled** for any of the payload half; until then an older `doGet` sends no
`tutorPay`/`adminKeeps` and still sends `price` to a tutor, so a tutor sees `You earn —` and an admin
two dashes.

**Left as they were, deliberately.** A tutor looking at an OPEN class they are not on is still sent
its seat price, because that row is the join offer and nobody but a family asks to join. The
booking FORM still shows its quote's rates to whoever fills it in, tutors included: it is the
family's quote, and tutors do not book. A tutor who shares their own receipt prints `You earn`,
because sharing prints what is on the screen; an admin's share keeps `Client pays` and drops the
two rows under it.
