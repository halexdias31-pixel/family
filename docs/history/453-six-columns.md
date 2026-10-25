# 453 — Six columns: Tutors, Students, Parents, and each account type's settings

## What the owner asked (25 Oct, a hand-drawn page)

The latest revision, at the bottom of the page under "New":

> Columns: **Tutors** (tutor 1, tutor 2, tutor 3 …), **Students** (a card per student), **Parents** (a card per
> parent / client), then **Tutor account settings**, **Student account settings**, **Parent account settings**.
>
> "A user in theory could appear in each of these 3 categories."
>
> "Also each user can edit their student people in student column, tutor account in widget in tutor column."

From the earlier sketch on the same page: "maybe people settings can be with these" (people management goes
inside the people columns) and "split account settings into 3".

This replaces 444's Student · Tutor · Parent columns, where people and settings shared a column per rank.

## What changed

- `TAB_ORDER` ends `tutors · students · parents · staff · account · family · biz`. The three people columns
  are new (`tutors`, `students`, `parents`); the three settings columns kept the ids 444 gave them, so every
  `go('account')` to sign in still lands where the sign-in card is: `staff` is **Tutor settings**, `account`
  **Student settings**, `family` **Parent settings**. Business is unchanged, last and admin-only, except that
  + Add a person and everybody's cards moved out of it onto the people columns.
- **People columns** (`accountPages_(col)`, find.js; `peoplePages_`, me.js) draw only people the viewer is
  already sent — nobody's visibility widened: the tutors' directory (`DATA.tutors`) on Tutors; your own family
  (`DATA.family`) split by relation — a child or a brother or sister on Students, a parent on Parents; and for
  an admin `DATA.everyone` by main role (Student → Students, anything else → Parents; `doGet` sends no tutor
  or admin there, they are in `DATA.tutors`). A family member who also teaches is on Tutors as well.
- **Your own card is first in every people column you belong to** (`peopleBelong_`): your rank's column
  (`homeCol_`: Staff and Admin → Tutors, Client → Parents, Student → Students), Tutors if you have a public
  tutor card, Parents if you have a child linked, Students if a parent is linked to you. Its Edit there edits
  that face (`ownCardSections_(col)`): the picture, figure, name and handle on your home column; what you
  teach on Tutors when you have a tutor card. So a tutor's whole card is one form on Tutors; a parent's
  four are on Parents; a student's on Students. A column whose face has nothing of its own to edit shows your
  card with no Edit (`cardEditTile_`). One place per field still holds.
- **People management is on the people columns.** Each has a "+" for an admin — Add a tutor, Add a student,
  Add a parent — opening the one person form with that role ticked, drawn where it was opened
  (`PEOPLE_ADD_`, `PEOPLE_FORM_.col`); Edit, Delete, Show PIN, New PIN, Message and Send last week stay
  under each card. Find someone by handle (with Find and Add as my child for Client and up) and Manage your
  child are on **Students** — the owner's "each user can edit their student people in student column".
- **Sign out** and "Send the link again" are on Student settings, on a Signed in card at the top, with the
  line saying mail waits for the link — they are settings of every account, not of one face of a card.
- **The Staff hub tile and the terms line are on Tutor settings** (hours, pricing, terms and the statement
  are a tutor's settings). Share my profile is under your own card on Tutors.
- An empty people column draws its title and "Nobody to show here yet." Signed out, every people and
  settings column says "Sign in on Student settings first", and Student settings is the sign-in card.

## Inventory — every widget and setting, one column each

| Widget / setting | 444 | Now |
|---|---|---|
| The tutors' cards (directory), Message and Share on each | Student | Tutors |
| Your tutor card and its Edit (headline, photos, words, at a glance, qualifications, venues, travel, class size) | Tutor | Tutors (one form with your picture, figure, name, handle) |
| Share my profile | Tutor | Tutors, under your card |
| Staff hub (terms, hours, pricing, statement) and the "not agreed" line | Tutor | Tutor settings |
| Tutor-only settings with no card to live on (rate group, qualifications, where you teach, …) | Tutor | Tutor settings |
| Apply to teach / where your application stands | Tutor (above rank) | Tutor settings (above rank) |
| Your own card: picture, figure, name, handle and Edit | Student | your home people column (Students / Parents / Tutors by rank) |
| Your brothers', sisters' and children's cards | Student / Parent | Students |
| Your parents' cards | Student | Parents |
| A parent's claim ("X says they are your parent") | Student | Parents |
| Find someone by handle (+ Find, Add as my child for Client+) | Student | Students |
| Manage your child (make, list with New PIN, held for the link) | Parent | Students |
| + Add a person | Business | Tutors / Students / Parents, one "+" each with the role ticked |
| Everybody's cards with Edit / Delete / New PIN / Show PIN / Send last week (admin) | Business | Students (students) and Parents (clients); tutors on Tutors |
| Sign out, Send the link again, "we will email you once you open the link" | Student (under your card) | Student settings (Signed in card) |
| Signing in (PIN) | Student | Student settings |
| Your roles | Student | Student settings |
| Notifications | Student | Student settings |
| A student's details (about you, contact, exam dates, date of birth) | Student | Student settings |
| A tutor's or admin's own non-teaching details (contact & address, date of birth) | Student | Student settings (generic) |
| A parent's or payer's details (`clientFields`: contact & address) | Student | Parent settings |
| Profit, Setup, Posts waiting, Applications, Staff, Reports, Library import, records, Verse, build stamps | Business | Business |

Generic settings (PIN, notifications, roles, sign out, a tutor's own contact details) went to Student settings,
the lowest rank's column, which every account has.

## Decisions

- **Ids kept for the settings columns** — `account`, `staff`, `family` — rather than six new ids: dozens of
  `go('account')` calls send a visitor to sign in, and the backend and the checks name them.
- **Manage your child on Students, not Parents**: the owner wrote that a user edits "their student people in
  student column". The children are students; the parent's own card is on Parents.
- **Your card's base four are edited on your rank's column alone**, not once per column you appear in: three
  editors of one name would break 444's one-place rule. A tutor who is also a parent has one card form, on Tutors.
- Above-rank empty states are unchanged: Tutor settings below Staff says "This column is for a tutor's account,
  not yours" and offers Apply to teach (a child gets the sentence alone); Parent settings below Client says the
  same for a parent and "A parent links you from theirs."

## Checks

- New journey "Six columns (453)" replaces 444's: the six in every rank's document, Business for an admin
  alone, Student settings with PIN, roles, notifications and Sign out and nothing else's, the above-rank
  cards, your own card first with its Edit on your home column, Find by handle on Students, Manage your child
  on a client's Students, Share my profile only for Staff and up, a "+" on every people column for an admin
  and none on Business, and every editor (each Edit opened in turn, the hub's Hours and Pricing) in one place.
- Journeys moved: the tutor-card ones work on Tutors and expect the four first; sign-out is pressed on Student
  settings; a parent's details on Parent settings; the children's on Students.
- `check/states.js`: the tutors' card states on Tutors, your own card's on your home column (`homeCol_`), the
  family states split over Students and Parents, Manage your child and an admin's child with no handle on Students.
