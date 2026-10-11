## Your card holds what is about you: everybody edits their own card, with their figure and their handle on it; the library cards are a tool; and one card manages your child

**The owner, 11 Oct:** *"move library card widget to the tools column. chagne the add/make you child widget into
one widget which is manage you child. also the random name generator should be one of the editable things in the
profile settings of the profile card. your figure should also be in your profile card editing."*

Four moves, one idea: **Settings holds only what is not about your card** — the role and field pages that are
not on it, Manage your child, Signing in (the PIN), your roles, Notifications and the admin's and tutor's own
cards — and **every card's own Edit holds what is about you.** Nothing on the server changed: no new action, no
new column, no new power, so no version stamps.

### 1. The library cards are a tool

**A WIDGET ON TOOLS, `libcards`** (`WIDGETS` in js/map.js, drawn by `initLibCards_` in js/me.js). It is the shelf
332 made — a bank card's face each, the fake barcode worked out from the number, the three boxes on the card,
`Add another`, `libFit_` giving the blank band back before the pane is drawn smaller — in a `.me-form`, with the
same tick (`me-save`), posting the same fifteen `libN_*` fields through the same `updateProfile`, written by the
same `writeOwnRows_` into the same tab. Still no drafts: `setDraftOk_` still refuses every `lib` box, because the
PIN is on the card.

- **Who sees it: everybody signed in, nobody signed out** — exactly who saw the Settings page, because every
  role's map carries `'Library cards': LIBRARY_FIELDS`. A third audience in `widgetFor_` beside `admin` and
  `tutor`: `signedIn`. Gated on being signed in, NOT on the group having arrived: a gate on the group would add
  the page when the payload lands and move every Tools page behind it under somebody already on the column.
  While the payload is coming the widget shows the one loader; a payload with no library group (an older server)
  says so in words.
- **Where: straight after the hours (`avail`).** These are the only two tools that edit your own record and save
  it with the same tick; and the end of the roster is fifteen swipes away. A parent finds it second, after the
  calculator; a tutor straight after their hours; an admin fourth (calculator, flyer, hours). The flyer stays page
  1 for an admin, so `check/swipe.js`'s page is unchanged.
- **Typing is held, because a library card has no draft to come back from.** `KEEP_FORMS_` marks the widget's form
  dirty on Tools and on Saved (a starred copy), `settingsKeep_` holds `tools` and `saved` while it is dirty or
  sending — the rule Settings has — and `startScreen_` does not restart a held widget column on a repaint (its
  markup was not replaced: the `reconnectKeep_` argument). An arrival still wakes the column as always, and
  `libCardsDraw_` never draws over a form with typing in it, so a widget started again cannot either.
- **`myProfile` landing redraws it** (`libCardsRedraw_`, every copy, skipping one with typing in it or the focus):
  the cards are drawn from `USER.profile`, and a copy drawn from the sign-in reply's must take the sheet's.
- **Settings takes the library fields off** (`notLibrary_`, which drops a retired `library_note` with them, so an
  older server cannot leave a page holding nothing but a box nobody draws).
- **The widget's body is narrower at the sides** (`.card.is-widget:has(.lib-shelf)`, `.45rem` where every widget
  has `.9rem`). On Settings a face had the pane's whole width; in a widget it sits in the widget's own body as
  well, and at 320 that left a face 214px wide — below about 223 a face's floor (two 44px boxes, the caption and
  the bars) beats `aspect-ratio`, and the card came out 214 by 138, 3% off the shape `check/states.js` holds it
  to (four and five cards at 320 were NOT measured until this went in). The one widget whose height follows its
  width; its star, title, faces and tick keep one left edge.
- **What it cost, measured** (the probe that turns to the widget with N invented cards, PIN 0000): the widget's
  star row and title are a row taller than the Settings page was, so —

  | page drawn at | 3 cards | 4 cards | 5 cards |
  |---|---|---|---|
  | 320x568 | 73% (was 83% on Settings) | 70%, the pane scrolls to the tick (was 70%, no scroll) | 70%, scrolls (as before) |
  | 390x844 | full size | 90% (was full size) | 81% (was 89%) |
  | 1280x800 | full size | 83% (was 92%) | 74% (was 82%) |

  Every face keeps its shape and gives up its blank band first; the tick is on the glass or one scroll away at
  every size, which is what the states ask. `check/ui.js` prints the rest as `CARD DRAWN SMALLER TO FIT (known)`.

### 2. One card: Manage your child

**`childManageCard_`** (js/me.js), titled **Manage your child**, on Settings, for the same people as before
(`mayAddChild_`: a client, a parent or an admin; a student has nobody to add). It was two pages — "Make your
child's account" and "Add your child" — and, while the parent's own address waited, one held card instead. Now
one card, in three sections, a hairline between them as the card editor draws its sections:

1. **The children already linked to you**, a line each: the face (`personFace_`), the first name the server calls
   a child by (333), the handle, and **New PIN** at the end of the line. The list is `DATA.family`'s `child`
   rows, held to the `familyFor` stamp the You column's family cards use, so a list left over from the last person
   on the phone is never drawn as yours. "No child is linked to you yet" when the payload has none; the one loader
   while it is coming.
2. **Make your child's account** — the form, unchanged (`kid-make` → `makeChild`, the slip).
3. **Add your child** — the form, unchanged (`add-child-go` → `claimChild`); its foot line went into its sub-line.

**WHAT MANAGING A CHILD ALREADY WAS, AND NOTHING MORE.** New PIN (`kid-pin` → `resetPin`, asked first in its sheet)
is the one power a parent holds over a linked child's account; it is on the child's own card on the You column
too, and here it is beside their name, where a parent who came to manage them looks. No new server power.

**THE CAPTIONS KEEP THEIR WORDS** because the server says them: the parent's confirmation email names Settings →
"Make your child's account", and `makeChild`'s refusal tells a parent to use "Add your child". The two handlers read
and lock **their own section** (`.kid-sec`), not the whole card, so asking does not freeze making.

**THE PENDING ADDRESS IS THE SAME CARD SAYING SO**: the held sentence and "Send the link again" in place of both
forms, and the children listed **without** New PIN, because `resetPin` refuses a pending parent (`confirmFirst_`)
and a tile the server will refuse is a door painted on a wall. One page in every state — so the held↔forms index
shift that note 309's card cost (one page where there were two) is gone.

### 3. The handle's Randomise is on your own card

The "random name generator" is the handle's **Randomise** (`handle-shuffle`), which was on Settings' Signing in
card. It is the **`handle`** section of your own card's Edit now (`cardHandleHtml_`), under your name, where the
card prints it: the handle shown, one Randomise tile, nothing to type, and the line under it (`HANDLE_SAID`).

**DECIDED: RANDOMISE STILL SAVES ITSELF, AND CANCEL DOES NOT TAKE IT BACK.** `randomiseHandle` writes the row as it
answers; the server has no way to offer a handle without writing it, and no way to put an old one back (`handle`
is not in `PROFILE_EDITABLE`, and must not be — nobody types a handle). Folding it into the one Save would need a
new power on the server, which the brief rules out; keeping it as the picture is kept — saved the moment it is
chosen — needs none. So **Cancel leaves the handle as it is**, which, there being no unsaved handle, is "as it was
if it was not saved". The line under the tile says so before the first press: *"Randomise saves a new one at
once, and Cancel does not put the old one back — if you sign in with your handle, that is your new sign-in name."*
Your rows in the payload take the new handle at once (the tutor row the card is drawn from, a family row), so the
card the form closes back into does not print the old one until the payload lands.

**THE PIN STAYS ON SETTINGS' SIGNING IN CARD** — a secret is a form with its own button and rules, not a thing
printed on a card. That card is the PIN and the admin's build stamps now.

### 4. Your figure is on your own card

The wardrobe (`wardrobeCard_`, "Your figure", the last page of Settings) is the **`figure`** section of your own
card's Edit now, **straight under the picture** — because the figure is what the picture's "your figure" option
draws (324), and the two are edited side by side. `wardrobeBody_` is the one renderer; the section's inside is an
`.av-card`, which `avatarSave` rebuilds on every pick. The Settings page went. There is no "Your figure" tile — the
owner removed it earlier; Edit is the door.

- **The picker follows the wardrobe.** A pick redraws the picker's "your figure" option and, when your picture IS
  your figure, its preview — on one form, two drawings of one figure must never disagree. Choose "your figure" as
  the picture and the card's face, once the form is shut, is that figure in those clothes.
- **Decided: Cancel puts the look back**, as it puts the picture back — the Cancel tile's note is "put it back".
  The look the card was opened with (`fig0`, remembered beside the picture in `familyCardEdit`, so a reload keeps
  it) is sent again through `saveAvatar`, the one door a look has; the server re-checks it as it checks every look,
  and it is a look this person was wearing. **Nothing bought is undone**: credits spent stay spent and the piece
  stays yours (`avatarItems`); the toast says so when credits went. A tap still on the wire is overtaken (`AV_SEQ`).
- **The picker on the form is not repainted by its own save** (`pfpTake_`): with the picker on your card's Edit
  your card IS the form, so a paint of the column rebuilt the form under the person and threw away the "Saved."
  line before it was read. Save and Cancel draw the column as they shut it.

### Editing your own card is for everybody

**`cardMayEdit_`: your own card, whoever you are**; somebody else's still needs a real tutor row and an admin, as
in 330. Your own card may have no tutor row — a parent's, a student's, an unlisted admin's are built from the
sign-in reply — so that builder is one function now (`myCardRow_`, find.js) and `card-edit` opens the very row the
card was drawn from. The Edit tile is your own gold one, not the admin's silver.

**The sections, decided from what Settings edited for each role and what the card prints** (`CARD_SECTIONS`,
`ownCardSections_` — your role's own map, through `myGroups_`, the role → map choice lifted out of
`settingsPages_` so the three things that ask it cannot answer differently):

| who | Edit on their own card | what Settings keeps |
|---|---|---|
| a tutor with a public card, a listed admin | picture, **figure**, name, **handle**, rate, headline, photographs, words, at a glance, qualifications, where, the week | Contact & address (without the venues and distance), Manage your child (admin), Signing in, roles, agreement, the admin's cut, journey, the weekly email, Notifications |
| an admin or tutor with no public card | picture, **figure**, name, **handle** | About you less the name, Contact & address, Photos less the picture, Qualifications, rate, the week, and the rest as above |
| a parent | picture, **figure**, name, **handle** | Contact & address, Manage your child, Signing in, Your roles, Notifications — About you held only the picture and the name, and went |
| a student | picture, **figure**, name, **handle** | About you (date of birth and the two exams), Contact & address, Signing in, Your roles, Your journey, Notifications |
| somebody else's card (an admin) | as in 330 — no figure and no handle, which would dress and rename the admin | — |
| signed out | no card, no Edit, no library cards | the sign-in pointer |

**Why only the picture and the name for a card with no public row:** editing in place means each section is edited
where it is read, and that card prints a face and a name. Their other fields stay on Settings, where they were. The
name and the picture leave Settings for everyone — two places to edit one field is the duplicate 330 took away for
tutors. The first Settings page says where everything went (`cardMovedSay_`, by role).

**PAGE.settings.** The wardrobe page, one of the two child pages and a parent's About you are gone, so the column
is up to three pages shorter and an index moves once, on the visit the new build arrives in; `paintPager` clamps
it, so a visitor who was on the old last page lands on the last page there is (a journey sets it to 16 and asks).
Every card after Your roles is still appended, for that reason.

### What checks it

- **`check-flow.js`**, rewritten where things moved and new where they did not exist:
  - rewritten: the five library journeys (on Tools now, `libOpen_`); the four picture-role journeys, the
    picture-in-Settings journey and the old-backend picture journey (on your own card's Edit — and the figure is
    dressed on the same form: shirt 2 picked, the picker's figure wears it, the card wears it); "Settings holds
    only what is not on your card" (every role); the admin-edits-another journey (no figure or handle on Ben's
    form; a tutor, a parent and a student have Edit on their own card alone); the Sign out journey (Pat's own
    Edit); the parent-makes-a-child, unconfirmed-parent and refused-make-child journeys (one Manage card); the
    old-server save (a plain card that is still on Settings);
  - new: **every role's own card has Edit** with the decided sections (the real backend: tutor, listed admin,
    parent, student; and the lab's admin with no public card), and a parent's first name saved from her card
    reaches her row; **Randomise on your card** (one `randomiseHandle`, the row and the phone hold it, "You were
    @…", Cancel sends nothing and leaves it, a tutor's payload row carries it before the payload lands);
    **your figure dressed on your card** is the picture's figure (`saveAvatar` written, the picker follows, the
    card's face wears it, Cancel puts the look back through `saveAvatar`); **Manage your child** (the children,
    New PIN from the card, linking one, none linked, the held state with no New PIN, a list stamped for somebody
    else drawn as nobody's, a student without the card); **the library cards on Tools** (a parent, a student, a
    tutor and an admin, straight after the hours, nobody signed out, not on Settings, typing held through a
    repaint and a restart, redrawn when `myProfile` lands); **Settings no longer draws what moved, and
    `PAGE.settings` lands on a real page**.
- **`check-profile.js` §18**, against the real `PROFILE_GROUPS`, `CLIENT_GROUPS` and `STUDENT_GROUPS`: for a tutor
  with and without a public card, a parent and a student, every field is on exactly one of their card's Edit,
  Settings and Tools; the library fields are exactly `LIBRARY_FIELDS` on Tools and none on Settings; the card offers
  only writable fields, the figure after the picture and the handle after the name, and only those four for a
  card with no public row; somebody else's card offers neither. 20 card rules became 44.
- **`check-drafts.js`**: the make form's PIN exemption names `kidMakeSec_`.
- **`check/states.js`**: on the You column, *your own card, being edited, with no public card*, *a parent's own
  card, being edited*, *a student's own card, being edited*, *your handle, on your own card*, *the wardrobe, on
  your own card*, *a pick redraws the figure, and the picture's "your figure" with it*, and the three *your
  picture* states (moved from Settings); *your own card, being edited* wants the figure and the handle in its
  order; on Tools the *three/four/five library cards* (moved from Settings); on Settings *Manage your child, three
  children linked* and *…none linked*, and the made and held states ask for the one card. *The photographs* no
  longer wants a picker there.
- **`check/press.js`**: the select-under-a-sheet's-backdrop press looks on the next Settings page with a select when
  every select on the first is under the sheet's body — with the name gone, About you came up two rows shorter and
  all three of its selects sat under the centred sheet at 390x844, so the question was not reached.

**Proved by mutation, each red on its own, the real files green after each** (`git checkout` of the file, the
journeys run again):

- **Edit only for tutors again** (`cardMayEdit_` wanting a tutor row on your own card) — three journeys: a parent
  and a student offered no Edit, Pat signed in on Ada's phone offered none.
- **Randomise left on Settings** (the handle section drawn on Signing in as well) — "Settings holds only…" for all
  four roles and the PAGE.settings journey; and `check/ui.js --screen=account --width=390`: *your handle, on your
  own card* NOT measured.
- **The wardrobe page left in Settings** — "Settings holds only…" (a parent's pages gain "Your figure") and the
  PAGE.settings journey.
- **The library cards still in Settings** (no `notLibrary_`) — four journeys: every role's Settings, the note box,
  the Tools journey and the PAGE.settings journey.
- **The two child cards back** — the make-a-child journey, Manage your child, the PAGE.settings journey.
- **The library widget shown to everybody** (no `signedIn`) — the Tools journey: a visitor signed out is shown it.
- And two more: **no hold on Tools** (`settingsKeep_` not answering for `tools`) — the Tools journey, typing thrown
  away by a repaint and by a restart; **`notLibrary_` keeping the library fields** — `check-profile.js`, every role's
  library cards drawn in two places.

**Run, on the final tree:** `check.js`, `check-const`, `check-css`, `check-doors`, `check-loading`, `check-drafts`,
`check-profile` (44 card rules), `check-signin`, `check-handles`, `check-payload`, `check-post`, `check-library`,
`check-settings`, `check-widgets`, `check-strings` — green; `check-dead` reports the same eight front-end and five
backend names it did on the base commit and nothing new; `check-scope` is red on the base commit and here alike, on
`states.real.js`, a file this change does not touch. **All 328 `check-flow` journeys** in four `FLOW_PART`s.
`check/ui.js --screen=account`, `--screen=settings` and `--screen=tools`: nothing new (the library cards' and Manage
your child's zoom at 320 print as known). `check/press.js --screen=account`, `settings` and `tools`: green — the
first tools run failed four swipes on stuff, games and biz and one venues tap at a load average of 9, which passed
run again alone; and before the press fix above, all three failed only on the backdrop select. `check/cascade.js`
and `check/swipe.js`: green.

**Looked at**, at 320x568, 390x844 and 1280x800: each role's own card at rest and in Edit (the figure and the
handle sections scrolled to; every section of a tutor's at 390), the library cards on Tools for each role, Manage
your child with two children, with none and held, and every role's Settings.

### Not done, and worth knowing

- **The hours widget on Tools** has the same exposure the library cards had (a repaint restarts it over typing);
  it is not a `.me-form`, so the new hold does not cover it. Unchanged here.
- **Credits are not refunded by Cancel** — decided, and said in the toast; a piece bought stays owned.
- **A parent's own surname is in a box on her card's Edit**, as it was in her Settings box — behind her own Edit,
  on her own phone. A child's own surname likewise (333 kept "herself in her own boxes").
- **The confirmation email still says Settings → "Make your child's account"**: the caption is on the card under
  "Manage your child", so the words are findable; rewording the email is a backend change and four stamps, not
  done here.
- **README conflict at merge**: 337 and 338 are on parallel branches; this note is 339 and its README line goes
  after 336 here.
