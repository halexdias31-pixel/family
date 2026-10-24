# Accounts: one rank each, family links beside it (400)

## The four ranks

Every account has exactly one rank, the highest it holds, and each rank includes everything below it:

| Rank | Who | May |
|---|---|---|
| **Student** | a learner, usually a child | the Finder (Find, Find 2), answering, their own progress, friends, games. No prices, no booking or paying (398) |
| **Client** | a parent, guardian or adult who pays | + prices, booking and paying, linked children's progress, the Sunday report |
| **Staff** | an approved tutor | + tutor tools, listed as a tutor, sees the work of students in their sessions |
| **Admin** | the business | everything, the Business column included |

Signed out is no rank: the public pages, the tutor list and a tutor's own link, but not the Finder.

## Where it is stored

Nothing new on the sheet. The rank is read from the `people.role` cell and `listed`, so every old row keeps its meaning:

- `admin` anywhere in the cell → **Admin**
- `tutor` (or `teacher`) and `listed` not `PENDING` → **Staff**
- `client` / `parent` / `guardian` → **Client**
- `student` / `kid` / `pupil` / `child` only → **Student**
- an empty or title-only cell → **Client** (what `rolesOf` always assumed)

A tutor still `PENDING` (from before 400) keeps the rank of whatever else they hold until approved.

Code: `rankOf(row)` and `rankAtLeast_(row, rank)` in `backend/people.gs`; the phone's `rank_()` and `rankAtLeast_(rank)`
in `js/core.js` (the sign-in reply and `myProfile` carry `rank`; an old kept copy works it out from the roles).
`isChild_` is rank Student; `childView_()` is `rank_() === 'student'`; `isTutorRole()` is `rankAtLeast_('staff')`;
`seesWhom_` lets Staff and Admin see everybody.

## How each rank is reached

- **Student or Client:** anybody makes an account and chooses one at sign-up ("Client — I book and pay" / "Student — I'm
  learning"). Both are free. Settings → Your roles still moves between them (a Student account cannot make itself a Client).
- **Staff:** only by **Apply to teach** on You (a signed-in adult; with no date of birth on the row, anybody signed in).
  The application goes to the Ledger tab `applications`; the admin sees it in the Business column and presses Approve,
  Interview or Decline. Approve adds `tutor` to the role cell and sets `listed` TRUE. The Tutor tick in Settings is refused
  for anybody but an admin.
- **Admin:** only given by an admin (the people form, 373).

## Family links are not rank

Who is whose child lives on the `family` tab, unchanged. A Client sees only their linked children. Linking works from
either side already: a parent claims a child (`claimChild`, the child says yes), a parent makes a child (`makeChild`), a
child registering gives a grown-up's address (`register`'s `parent_email`, confirmed by the link), and an admin links
anybody (`personSave`'s parents, `linkChild`).

## Emails

- A new application → the owner (`owner_email` on the config tab; blank = the first admin with a proved address).
- A decision → the applicant, if their address is proved.
- A **child's** forgotten PIN (an account with no email of its own) → the owner, never a parent. An adult's goes to their own inbox.

## Hooks for the Staff hub

The Staff hub (pricing setup, T&Cs, payslips) is to come. It gates on `rankAtLeast_('staff')` on the phone and
`rankAtLeast_(row, 'staff')` on the server, and can sit beside "Share my profile" on a staff member's own card.
