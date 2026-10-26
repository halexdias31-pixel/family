# 461 — Six columns: Parent, Tutor and Student settings, then Tutor, Student and Parent profiles

(Built as 453 on 25 Oct off an older base; renumbered 461 when merged up to date, since 453 was taken twice meanwhile.)

## The owner's approval (26 Oct), which set the final order

> "I want a column for parent account settings, a column for tutor account settings, a column for student account
> settings, then a column for tutor profiles, a column for student profiles, and a column for parent profiles.
> Remember everything has its home centralised in one place."

So `TAB_ORDER` ends `family · staff · account · tutors · students · parents · biz`, labelled **Parent settings,
Tutor settings, Student settings, Tutor profiles, Student profiles, Parent profiles**, then Business (admin only).
The ids are unchanged from the first round (every `go('account')` still lands on the sign-in card).

## Also in this round

- **No more making a child's account.** The owner, on the "Manage your child" card: *"making a child's account
  shouldn't be a thing. An account gets made independently and then gets claimed."* The make form (first name,
  surname, PIN, Make their account), `kidMakeSec_`, `KID_MADE` and the `kid-make` handler are gone; `makeChild`
  stays in `ACTION_ACCESS` only to refuse an old page in plain words ("A child makes their own account now…
  Nothing was made"), with a reason in check-actions. A child makes their own account (Make an account); a parent
  finds their handle on Student profiles, taps Add as my child, and the child says yes. The card keeps "No child is
  linked to you yet" and Add your child, which now says so. The parent sign-up line, the confirmation email and the
  "Email confirmed" toast point there too. Stamps bumped together (2026-10-26-a-no-child-making).
- **Verse screen to Tools.** The owner, on Business's Verse screen card: *"this can go in tools column"*. It is an
  admin-only Tools widget (`verse` in map.js, `admin: true`, drawn by `verseCard_`); Business ends at the records
  cards, then the build stamps.
- **Needs help** (455) tops Student profiles for Staff and up: `HELP_COL = 'students'`, one line in help.js.
- **Reading aloud** (the voice menu) is on Student settings with the other generic settings (PIN, roles,
  notifications, sign out): it is a setting of this device and every account, not of one face of a card.

- **Spotlight left of the posts.** The owner: *"spotlight should be to the left of the posts column"*. `TAB_ORDER`
  starts `spotlight · feed · reel · dm`; `feed` is still `TAB_HOME`, so the app opens on the posts with Spotlight one
  swipe to the left (columns.json and index.html follow).

- **Progress dissolved into Student settings.** The owner: *"the progress column content can all be moved to
  student column account settings actually. So that column can get dissolved."* Every progress widget (Countdowns,
  Questions, Recent activity, Work on next, Grade estimate, a card per series or Papers and worksheets, Sessions) is
  drawn once, after the settings cards on Student settings (`studentSetPages_`, marked `prog-w`); each empty one is its
  title alone. `progress` is gone from `TAB_ORDER`, `TABS`, index.html, columns.json, `PAGER` and `PAGE`;
  `TAB_GONE` (shell.js) sends an old `go('progress')` or a remembered `progress` to Student settings. Signed out,
  Student settings is the sign-in card, so the widgets are not drawn until you sign in.

## The first round (25 Oct), as built then

The order below was the first round's; the contents of each column carried over unchanged except as listed above.

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

| Widget / setting | 444 | Now (461) |
|---|---|---|
| The tutors' cards (directory), Message and Share on each | Student | Tutor profiles |
| Your tutor card and its Edit (headline, photos, words, at a glance, qualifications, venues, travel, class size) | Tutor | Tutor profiles (one form with your picture, figure, name, handle) |
| Share my profile | Tutor | Tutor profiles, under your card |
| Staff hub (terms, hours, pricing, statement) and the "not agreed" line | Tutor | Tutor settings |
| Tutor-only settings with no card to live on (rate group, qualifications, where you teach, …) | Tutor | Tutor settings |
| Apply to teach / where your application stands | Tutor (above rank) | Tutor settings (above rank) |
| Your own card: picture, figure, name, handle and Edit | Student | your home profiles column (Student / Parent / Tutor profiles by rank) |
| Your brothers', sisters' and children's cards | Student / Parent | Student profiles |
| Your parents' cards | Student | Parent profiles |
| A parent's claim ("X says they are your parent") | Student | Parent profiles |
| Find someone by handle (+ Find, Add as my child for Client+) | Student | Student profiles |
| Manage your child (make, list with New PIN, held for the link) | Parent | Student profiles |
| + Add a person | Business | Tutor / Student / Parent profiles, one "+" each with the role ticked |
| Everybody's cards with Edit / Delete / New PIN / Show PIN / Send last week (admin) | Business | Student profiles (students) and Parent profiles (clients); tutors on Tutor profiles |
| Sign out, Send the link again, "we will email you once you open the link" | Student (under your card) | Student settings (Signed in card) |
| Signing in (PIN) | Student | Student settings |
| Your roles | Student | Student settings |
| Notifications | Student | Student settings |
| A student's details (about you, contact, exam dates, date of birth) | Student | Student settings |
| A tutor's or admin's own non-teaching details (contact & address, date of birth) | Student | Student settings (generic) |
| A parent's or payer's details (`clientFields`: contact & address) | Student | Parent settings |
| Progress widgets (Countdowns, Questions, Recent activity, Work on next, Grade estimate, series, Sessions) | Progress | Student settings, after the settings (461) |
| Profit, Setup, Posts waiting, Applications, Staff, Reports, Library import, records, build stamps | Business | Business |
| Verse screen (e-paper install page) | Business | Tools, admin-only widget (461) |
| Needs help with Done (455) | Student | Student profiles, first page, Staff and up (461) |
| Reading aloud: the voice menu and Hear a sample | You | Student settings (461) |
| Show PIN / New PIN / Edit / Delete / Message under a person's card | Business | under that card on its profiles column |

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

- 461: the six journey asks the order and the six labels for every rank, Business last for an admin, Reading aloud
  on Student settings alone, Needs help first on Student profiles for Staff and up and nowhere for anyone else. The
  make-child journeys became "Manage your child lists the children and says how to add one"; check-signin and
  check-surnames ask that `makeChild` refuses everyone and writes nothing; the Business journey counts thirteen
  business pages and finds the Verse tile on Tools.

- New journey "Six columns (453, 461)" replaces 444's: the six in every rank's document, Business for an admin
  alone, Student settings with PIN, roles, notifications and Sign out and nothing else's, the above-rank
  cards, your own card first with its Edit on your home column, Find by handle on Students, Manage your child
  on a client's Students, Share my profile only for Staff and up, a "+" on every people column for an admin
  and none on Business, and every editor (each Edit opened in turn, the hub's Hours and Pricing) in one place.
- Journeys moved: the tutor-card ones work on Tutors and expect the four first; sign-out is pressed on Student
  settings; a parent's details on Parent settings; the children's on Students.
- `check/states.js`: the tutors' card states on Tutors, your own card's on your home column (`homeCol_`), the
  family states split over Students and Parents, Manage your child and an admin's child with no handle on Students.
