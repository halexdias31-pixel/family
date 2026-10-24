# 430 — the way back from Stripe

Found by a structural review: `createCheckout` (backend/dopost.gs) sends a card payment back to
`SITE_URL?paid=1&ref=PAY-…`, and nothing in `js/` read `paid` or `ref`, so nothing ever called `finalizePayment`.
A family could press Pay, pay Stripe, land back on the site — and stay on an accepted application for ever. The only
thing that moved a booking to Booked was an admin's `markPaid`. The backend half had been there since payment was
built (see the note "THE STEP THAT WAS NOT THERE AT ALL" in docs/notes/js/book.js.md, which put the Pay tile on the
receipt); the return leg on the phone never was.

## What the phone does now

`paidFromLink_()` (js/me.js, beside `verifyFromLink_` and `pinFromLink_`), called from boot.js after them:

- **Reads `paid` and `ref`, and takes them out of the address** with `history.replaceState`, keeping the rest of the
  query and the hash — so a refresh does not ask again.
- `?paid=0` (Stripe's cancel URL) says *"Payment cancelled — nothing was charged. Your booking is still waiting."* and
  posts nothing.
- `?paid=1&ref=…` keeps the ref in `sessionStorage` (`familyPaid`) until the server has answered, then posts
  `finalizePayment` with the signed-in token (`api` adds it).
- **Not signed in yet:** *"Sign in to finish your booking — your payment is safe."* and the account column. The gate
  refuses `finalizePayment` without a token, so it is not sent; `afterSignIn_` — every door in — finishes it.
- **Answered yes:** *"Payment received — you're booked"* (or *"Payment already received — you're booked"* for a ref the
  server had already confirmed), then `load()` and the receipt it paid for opens (`openJob_`, receipt.js, which the
  `job` tap now calls too); if the list has not caught up it opens the booking column.
- **Answered no:** *"Payment not confirmed — <the server's sentence> Nothing was booked."*, and the kept ref goes.
- **Signed out by the server, busy, or no answer:** the ref is kept, so the next sign-in or visit asks again.
- A ref already in the air is not asked twice (`PAID_ASKING_`), so boot and a sign-in landing together send one request.

## Children (398)

A child never reaches Pay, and `finalizePayment` is in `KID_MONEY_ACTIONS`, so the backend refuses it with the
parent sentence. The phone does not ask on a child's account at all: it says a parent paid and signs in to finish, and
keeps the ref for that sign-in.

## The backend's guard

`finalizePayment` was idempotent only by deleting the ref's Script Property after writing Confirm. Two returns racing
(a refresh during the first, the first load and a sign-in) each read the property before either deleted it and wrote
two Confirm events and two "you are booked in" mails; a delete lost after the Confirm (a timeout) did the same on the
next visit. And a ref nobody issued answered `success`, which the phone would now have said as "you're booked".

Now, under the script lock:

1. **The Confirm event the ref wrote is the guard** — an event with `request_id` = the ref and action `Confirm`. If it
   exists the answer is `{ success, alreadyDone, jobId }` and any leftover property is cleared; Stripe is not asked and
   nobody is mailed again. (Every Confirm `finalizePayment` ever wrote carries its ref as `request_id`, so older
   payments answer the same way.)
2. No Confirm and no property: `{ error: 'We have no payment with that reference…', why: 'unknown-ref' }`.
3. Otherwise as before — ask Stripe, write Confirm, set the job's status, delete the property, mail payer and tutor —
   and the reply carries `jobId`, so the phone can open the receipt.

Stamps bumped together to `2026-10-24-i-stripe-return`. Deploy the backend for the guard and `jobId`; until then the
phone still finalizes (the old backend answers `success` with no `jobId`, and the booking column opens).

## Checks

- `js/check-pay-return.js` (in the suite): through the real `createCheckout` and `doPost` over a fake Stripe — an
  unpaid return refused and the ref kept; paid, one Confirm, Booked, `jobId` back, the ref spent; the same return again
  `alreadyDone` with no second Confirm, mail or Stripe call; the property put back after its Confirm still books once;
  an invented ref refused; a child refused with the parent sentence; signed out refused. Against the old handler five
  rules fail.
- Two check-flow journeys: a fake `?paid=1&ref=…` boot signed in posts once with the token, strips the address, says
  "Payment received — you're booked" and opens J-PAID; a later sign-in does not ask again; `?paid=0` posts nothing and
  says cancelled; an ordinary start posts nothing. Signed out it waits and finishes on sign-in; a refused payment says
  the server's words and "nothing was booked" and opens nothing; a child's phone never posts. With the boot call
  removed both fail.
