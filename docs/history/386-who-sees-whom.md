## Who sees whom: a child sees siblings and friends, a parent her children

**The owner, 20 Oct:** *"kids should only be able to see their siblings and who they have friended.
They won't see parents. Also parents can only see their kids, they can't see their coparent."*

### The rule, in one place — `seesWhom_` / `seesPerson_` (people.gs)

- **A student** sees themselves, their siblings (`siblingsOf`: other children of any accepted parent) and
  the children whose handles are on their own `friends` cell. Friending is one-way, as the owner said it
  ("who they have friended"), and only a child's handle counts — a parent's handle on the list opens nobody.
- **A parent (client)** sees themselves and their accepted children (`childrenOf`). No co-parent, no other parent, no other child.
- **A tutor or admin** (by `actingRole_`, so an unapproved Tutor tick is not a door): `null`, no rule — unchanged.
- **Signed out:** `null` too, so the public listings are unchanged; but post commenters and reactors are
  named to a stranger only when they are staff (they used to be named to everybody).
- `seesPerson_` adds staff: a tutor or admin is the business, not a family, so their threads, comments and listings stay.

The payload simply does not carry the hidden people; nothing is hidden only in the UI.

### Every surface changed

- `doGet` `payload.students` (Find's people, the score board, friend rows): only `vis` ids for a child or parent.
- `familyOf_` (`payload.family` and the sign-in reply's `family`): no `parent` card for a child.
- `familyNamesOf_` (sign-in reply, `myProfile`): `parents` empty for a child. A pending claim still names who
  asked — without it the child cannot answer it (342).
- Exams and birthdays: a child's calendar no longer carries a parent's.
- Posts: `reactions.by` and comment names only for people the viewer may see (else left out / "Someone").
  The post's own author stays: a post is published by an admin's approval, and public.
- `messages`: a thread with somebody the viewer may no longer see is not sent (staff threads always are).
  `sendMessage` refuses a hidden recipient on top of `MESSAGING`.
- Bookings (`clientClasses`): a child or parent who is not the booker or the tutor sees their own seat's name
  only; other families on a shared class are seats; `client` and `forChildren` go to the booker, tutor, admin.
- `saveFriends`: since the phone no longer holds every child, a new friend's handle is checked on the server
  (must be a child's), and the cache cleared so the friend arrives on the next payload. `friend-add` (me.js)
  no longer refuses a handle its own `DATA.students` lacks.

Unchanged and already admin-only: `listPeople`, `getProfile`, `everyone`, `clients`.

### Checks

`js/check-visibility.js` (new, in check-all): two parents and two children, a friend, an unrelated child, an
unrelated parent, a tutor and an admin — exactly who each is sent in doGet, the sign-in reply, `myProfile`,
`messages`; the family cards; the threads; friending a child accepted, a parent refused; a DM to a co-parent refused.
check-surnames, check-profile, check-saved-answers and check-flow's surname walk asked for a parent's card or name sent to a child;
those now assert the opposite, and the board / "who reacted" are asked of the tutor and the admin.
