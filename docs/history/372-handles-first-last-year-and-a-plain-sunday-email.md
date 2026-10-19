# 372 — a handle is first and last letter and the year joined; the Sunday email is plain and personal

The owner, 19 Oct: "i want to change the username to be combination of first letter of first name, last
letter of first name and year they joined with me ... my final goal is to have automatic emails be set up
for [two parents of a child]. but i dont want branding on email. i want emails to only address first name
of parent. be mostly casual, contain questions their child has done."

## Handles (replaces 367's initial + year)

- **Handle = first letter + last letter of the first name + four-digit year joined**, lowercase: a fictional
  Theo who joined in 2026 is `to2026`. A one-letter name doubles (`aa2026`); no letters at all is `xx`.
- **Clashes**: the next letters of the first name from the start go in before the last letter (`tho2026`,
  then `theo2026`), then a counter after the whole name (`theo20262`). `handleStems_` (people.gs) lists the
  stems; `handleCandidates_` adds the year; `handleInShape_` accepts any stem (any year), so a handle once
  in shape is never moved again.
- Everything else is 367's machinery unchanged: year from `joined_on`, else first activity, else now;
  earliest joiner first; old handles stay sign-in aliases in `handle_was`; friends lists move; a blank look
  keeps its old face. A 367-shaped handle (`t2025`) is not in the new shape, so it moves once.
- New migration id **`handles-first-last-year`**, so the move runs once on the first admin load after deploy.
  Stamps `2026-10-19-i-handles-email`.

## The Sunday email

- **No branding**: no business name in the footer, no sender display name (`mailOut_` gets no `name`, so
  Gmail shows the owner's own account name), no link to the site. The diagram pictures stay — they are the
  questions as the site draws them.
- **Each parent by first name**: `Hi Pat,` style (a fictional parent), one email per parent (as before); a first name that is not
  safe to print is just `Hi,`.
- **Casual and short**: "Here's what {child} worked on this week: N questions (span, up to 9pm on Sunday)."
  then the questions with their recorded verdicts as before, then one line: "Don't want these any more?
  Just reply and say so."

## The ledger

The owner's ledger was updated outside the repo (private): every `joined_on` set to a 2026 date (an existing
2026 date kept, otherwise 1 Jan 2026), handles moved by the real `renameHandles_`, two parent rows (role
`client`, `weekly_email` TRUE, email blank for the owner to type) linked to their child on the `family` tab
(`accepted`), and `weekly_digest_hour` set to 21, which 351 asked for and the sheet still said 18.

## Checks

check-handles (stems, clash order, counter, join order, second run moves nobody), check-signin (the new
migration on an admin load), check-surnames and check-profile, check-flow (the card's sentence),
check-digest (`Hi Pat,`, the new lead and footer, no `@`, no business name, no sender name, no surname).
