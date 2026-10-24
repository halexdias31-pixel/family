# 400 — one rank per account, Staff by application, the Finder for members

The owner, 24 Oct, decisions in full: ranks Student < Client < Staff < Admin, each including everything below, one per
account; anybody may sign up as Student or Client; Staff only by an application an admin approves; Admin only given by an
admin; the Finder for members; tutor profiles with their own link; Setup into the Business column; a child's forgotten
PIN to the business owner, not to parents. Then: *"for admin it would be nice to know what I need to do — maybe the
business widgets glow red"*; and, from a client who asked if they were free: the owner could not just send a link to his
own or a tutor's profile.

The model is written up in `docs/accounts.md`.

## Ranks

`rankOf(row)` (people.gs) reads the old `role` cell and `listed` — no migration, no new column. `isChild_`,
`seesWhom_`/`seesPerson_` and the phone's `childView_`, `isTutorRole` now ask the rank. The sign-in reply and
`myProfile` carry `rank`; `rank_()` (core.js) works it out from the roles for a copy kept before.

Not done: replacing every `hasRole('admin')`/`isAdmin()` — they already mean exactly rank Admin, and changing them would
be churn without a behaviour.

## Sign-up

`register` already asked who the account is for; the buttons now say **Client — I book and pay** and **Student — I'm
learning**, both free, and the caption says teaching starts with Apply to teach.

## Staff by application

`setMyRoles` refuses a new Tutor tick for anybody but an admin (`why: 'apply'`), and the roles card draws no Tutor tick for
somebody who does not hold it. Rows already `PENDING` keep working (they are seeded that way in the checks that asked about
a waiting tutor).

**Apply to teach** (`applyCard_`, me.js) is a card on You for a signed-in adult who is not Staff — "adult" read from the
date of birth when there is one, anybody signed in otherwise. Its form (`applyFormHtml_`): subjects and levels on three
rows of the qualification picker's own selects (`qualPick_`, `QUAL_SUBJECTS`, `QUAL_LEVELS`), qualifications, DBS
number and issue date or "I need one", right to work in the UK, experience, the availability week grid
(`availGrid_`), area and venues, two references, a statement, a CV **link** (https only — there is no Drive upload
mechanism for files a person picks; chat uploads are pictures), consent. A form, so buttons.

doPost `applyTeach` (self) writes one row to the new Ledger tab `applications` (TAB, SCHEMA, WHERE; made by setup on an
admin's page load, 361) under the token's person; refuses missing fields, a non-https CV link, a second application while
one is new or interview, Staff, and an under-18 by date of birth; mails the owner (no references or DBS number in the mail).
`listApplications` and `decideApplication` are admin at the gate. Approve adds `tutor` to the role cell (keeping the rest,
admin first) and sets `listed` TRUE — Staff and on the public tutor list. Interview and Decline only set the status. The
applicant is mailed the decision. The applicant's own status rides on the sign-in reply and `myProfile` as `application`,
and You says it.

The owner's address is a new config row `owner_email` (seeded blank, in `CONFIG_PRIVATE` so no phone is sent it); blank
falls back to the first admin with a proved address (`ownerEmail_`).

## The Finder for members

Signed out, Find and Find 2 are one card (`finderMembersCard_`, find.js): **Members only**, tiles Sign in (to You) and
Join (the sign-up sheet). Find keeps its booking and feed front pages — they are not results; the bundle is made of
results, so it goes. `libItems` was already signed-in only (397).

check-flow's finder journeys now browse as a signed-in client (`member: true` on `boot`, the default in `resBoot_` and
`aheadBoot_`). The journey "signing in from signed out keeps Find's chips" asked about a state that no longer exists and
is replaced by the members-card journey; "Find 2 across a sign-in" now starts from the members card.

## A tutor's own link

`?tutor=<handle>` opens that listed tutor's card in the sheet on the first payload that has them (`openSharedTutor`,
posts.js, beside `openSharedPost`), signed out or in. Prices follow 398: a visitor sees them, a child's phone has none.
Every listed tutor card with a handle has a **Share** tile (`tutor-share`: the share sheet, else copy, else the link in a
toast). Staff and an admin who teaches have **Share my profile** on their own card on You.

## Setup into Business, and what needs you

`setupCard_` moved from You to the top of the Business column. Then one helper, `bizNeed_(key, n, say)` (records.js):
each Business card registers how many things want the admin and carries `data-need="<key>"`; `bizNeedsPaint_` gives a
card with a count the `needs-you` glow (`--alert`, a new `:root` token) and a red count line, and draws a fixed dot
(`#biz-dot`, the total; pressing it opens Business) — the app has no tab bar for a dot to sit on. Registered so far:
Setup (failed jobs, files not deployed, no report), Applications (new ones), Reports (open ones), and each records page
(due soon or overdue). Unpaid bookings are not counted: they are not in the Business column and not cheap to count there.

## A child's forgotten PIN

`forgotPin` for an account with no email of its own now mails the new PIN to the owner (`ownerEmail_`), never to a parent
or a typed grown-up address, and says so: "on its way to @family., who will pass it on to you". No owner address and no
admin with one: "We have no email to send a new PIN to. Ask your tutor". An adult's own reset is unchanged.

## Checks

- `js/check-accounts.js` (new, in check-all): rankOf on old cells, the sign-in reply's rank, sign-up as Student/Client,
  the Tutor tick refused, the application refused/accepted/duplicate/under-18/staff, admin-only list and decide, Interview,
  Approve → Staff + listed + public tutor list + mails, the child's PIN to `owner_email` alone, `owner_email` never sent,
  libItems refused signed out.
- check-signin, check-profile, check-surnames, check-prefs, check-drafts updated for the new rules.
- check-flow: the members card (Sign in, Join with Student and Client, finder after signing in); apply → admin's card
  glows "1 to approve" with the dot → Approve → listed → glow and dot gone; `?tutor=` opens the card with a price and
  Share, and the admin's Share my profile gives their link; Setup in Business, glowing with a failed job and not without.

Stamps `2026-10-24-a-ranks`, all four; css `2026-10-24-b-ranks`.

## Deploying

Push for the site. Merge, then Apps Script ↓, Deploy → New version, and open the site once as an admin: setup makes the
`applications` tab and seeds the `owner_email` config row. Fill `owner_email` if the owner's address is not the first
admin's.
