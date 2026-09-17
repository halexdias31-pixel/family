/* ==================================================================================================
   @family. — find.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   find.js is number 10 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- SHOP & RESOURCES --------------------------------------------------------------------
   Two lists that belong together because both are things you GET — one for credits, one for free,
   which is a smaller difference than either has with anything else in the app.

   With four hundred resources this is the one screen that genuinely needs finding tools. Four of
   them, and they do different jobs — which is why all four are here rather than one clever one:

     SEARCH   I know what it is called
     FILTER   show me only this kind
     GROUP    lay it out by subject, or by grade
     SORT     put the ones I want first

   THE CONTROLS ARE NOT REDRAWN WHEN THE LIST IS. Only `#stuff-list` is rewritten, so an open
   dropdown is never destroyed mid-choice and the search box never loses focus or caret — which is
   what the refocus hack under the old input handler existed to paper over.
--------------------------------------------------------------------------------------------- */
/* FILTERS YOU ADD, not a mode you pick.

   One dropdown could only ever ask one question: shop only, OR Maths, OR things you can afford —
   never Maths AND Grade 9 AND resources, which is the question somebody actually has. So a filter
   is a thing you add to a list, and the list is what narrows the results.

   TWO RULES, and they are the ones every filter list uses because they are the ones people mean:
     · SAME field  → either. Adding Physics after Maths shows both, because nobody adds a second
                     subject in order to see fewer things.
     · OTHER field → both. Maths and Grade 9 is Maths at Grade 9.

   Each one is a chip you can take off, so nothing can be narrowing the list without saying so —
   which is the failure of a dropdown you set three screens ago and forgot about. */
/* `sort` was here and is gone with the control that set it — see `stuffFiltered`. What is left is
   the two things this screen actually holds: what you typed, and what you have narrowed to. */
/* `groupBy` WAS HERE — the field the list was currently collected by. THE COLLECTION WENT: a line
   above the funnel reading "or the 227 papers these are in" was a second way of narrowing sitting
   above the first, and a screen with two of those is a pivot table. A paper is now an ANSWER to an
   ordinary question — see `paperId` in FACETS — which is what it should always have been. */
const STUFF = { q: '', filters: [] };

/* The fields a filter can be ON, what each is called, and where its values come from. One table,
   so adding a way to filter is a row here and nothing else — the picker, the matching and the
   chip label all read it. */
/* ---------- ONE QUESTION AT A TIME ----------------------------------------------------------------
   Eleven filters as eleven controls is a form, and a form is the opposite of finding something.

   They are not eleven independent questions. Key stage decides band value. Tier only exists for
   some subjects at some levels. Exam wave contains the year. Board and company are near enough the
   same fact that one sheet row says Edexcel and Pearson. Asked all at once they are a wall; asked
   in order they collapse into two or three.

   SO: ONE RULE, AND EVERYTHING FOLLOWS FROM IT — only ever offer a filter that would change what
   you see. If everything left is Edexcel, do not ask about the board. If nothing left has a tier,
   do not ask about tier. That is not a guess about what people want; it is a fact about the
   remaining set, worked out again after every tap.

   Finding a past paper becomes: Maths → KS4 → Edexcel → Past paper. Four taps, one short list at a
   time, each shorter than the last because the one before it narrowed things.

   THE ORDER IS FIXED, and deliberately so. It mirrors how somebody actually asks — what sort of
   thing, what subject, what level, whose paper, what kind of paper — and a page that reorders
   itself is a page you have to read every time instead of reaching for.
--------------------------------------------------------------------------------------------- */
/* ================================================================================================
   WHAT KINDS OF THING CAN BE FOUND.

   One entry per kind, and every question the app asks about a kind is answered here. Adding a new
   findable thing was four scattered edits — a branch in the group ternary, a branch in the label
   ternary, a branch in `stuffCard`, and a case in `stuffItems` — and getting three of the four right
   produced something that appears in a list, cannot be narrowed down, and renders as a blank card.

   `group` is the first question the funnel asks and `label` the second. Ordering the table puts
   things in the order they are offered, which is one more thing that used to live somewhere else.
================================================================================================ */
const KINDS = {
  /* A person, a place and a subject already have a card each — written for the Find screen and
     carrying the class that colours the name. Reused rather than reimplemented: two cards for one
     tutor is two things to keep looking the same. */
  /* ---------- A TUTOR IS TWO THINGS AND THE GROUP HAD ROOM FOR ONE --------------------------------
     BOOKING IS WHAT A TUTOR IS FOR; PEOPLE IS WHAT A TUTOR IS. Somebody arranging a session and
     somebody looking up who teaches their child are on different errands, and the first question
     asks which errand you are on — so filing a tutor under one of them meant the other had to
     answer wrongly to get there.

     A LIST RATHER THAN A SECOND KIND. Two kinds for one row is two cards to keep looking the same,
     which is the mistake the note above already refuses. `group` may be an array now; everything
     that reads it — the coverage rule, the value counts, the filter test and the group order —
     takes one or many. See `asList_` below. */
  /* ---------- `People` IS GONE AND A TUTOR IS JUST A BOOKING THING AGAIN --------------------------
     IT WAS TWO GROUPS BECAUSE A TUTOR IS TWO THINGS — what they are FOR and what they ARE — and
     `People` was the second half. That half now has a column of its own, so answering it here was a
     second route to a screen you can reach by swiping, and a second route is a second thing to keep
     right. The array stays supported everywhere that reads it (`asList_`); nothing in this build
     uses two groups any more. */
  tutor:   { group: 'Booking', label: 'Tutors',
             /* ---------- YOUR OWN PASS IS YOUR OWN CARD ------------------------------------------
                THE MERGE HAPPENS HERE, ON THE TUTOR ROW, and the first attempt had it backwards: I
                dropped you from the tutor list so the account card could hold the pass, which took
                you out of Booking · Tutors — where you are a tutor, and where you should be listed
                among them.

                SO THE ROW STAYS AND THE CARD CHANGES. Everybody's pass draws as a pass; yours draws
                as your pass with your credits, your details and the way out beneath it. One row, one
                card, in every list a tutor belongs in. `meCard` calls `findCard` directly for the
                pass itself, so this cannot come back round on itself. */
             card: x => (USER && typeof meCard === 'function'
                         && norm((x.row || {}).title) === norm(USER.name))
                        ? meCard()
                        : findCard({ kind: x.kind, row: x.row }) },
  venue:   { group: 'Booking', label: 'Venues',   card: x => findCard({ kind: x.kind, row: x.row }) },
  subject: { group: 'Booking', label: 'Subjects', card: x => findCard({ kind: x.kind, row: x.row }) },
  /* A LEVEL IS THE FOURTH THING A BOOKING IS ASSEMBLED FROM — who, where, what, and how far on —
     and it was the one you could not look at. Same group as the other three because it is the same
     errand: this is a thing you book with, not a thing you learn from. */
  level:   { group: 'Booking', label: 'Levels',   card: x => findCard({ kind: x.kind, row: x.row }) },

  /* ---------- YOUR OWN SESSIONS ARE ANSWERS UNDER BOOKING ---------------------------------------
     THEY WERE KINDS, THEN THEY WERE NOT, AND NOW THEY ARE AGAIN — and the reason changed rather
     than the mind. Taken out, they had nowhere else to be but a column of their own, and the
     argument was that you do not SEARCH for your own bookings, you check them. That is still true.
     What is different is that Booking is now an answer in this funnel rather than a tab: choosing
     it is checking, and "Classes, Waitlists, Receipts" beside "Tutors, Venues, Subjects, Levels" is
     the whole of booking in one list — the four things a session is made FROM and the three things
     a session IS.

     THREE KINDS AND NOT ONE, because they are three different questions. What is running, what I am
     waiting for, and what has finished. A single `Sessions` answer would need a second question to
     separate them, and the second question is this one.

     THE SAME `jobCard` STUB IN ALL THREE. A session looks the same wherever it is seen — the stub
     already colours itself by `jobStage_`, so a waitlist reads as a waitlist without this having to
     know how one looks. */
  /* ---------- THE WHOLE RECEIPT, NOT A STUB THAT OPENS ONE ----------------------------------------
     `jobCard` IS A FOLD — a few lines with the subject and the day, made for a LIST, and tapping it
     opened the document in a sheet over the top of everything. A sheet is a screen you have to
     close, and the funnel has already done the narrowing that a list needs: by the time you are
     looking at `Booking · Classes` there is nothing on the page but your sessions, one to a page,
     which is the shape this app uses for a document everywhere else.

     SO THE PAGE IS THE DOCUMENT. `jobReceipt` is the paper opened out — the same fourteen rows the
     booking form drew — with the way in and the way to pay under it, which is where somebody
     deciding either would look for them. Nothing to open and nothing to close.

     `jobCard` STAYS FOR THE WIDGET, where a list is genuinely what is wanted: `Your sessions` in
     the tools drawer is a glance at several, not a read of one. */
  /* ---------- ONE ANSWER, NOT THREE ---------------------------------------------------------------
     `Classes`, `Waitlists` AND `Receipts` WERE THREE KINDS AND THAT WAS THE WRONG CUT. They are one
     kind of thing at four points in its life, and splitting them by state meant the same session
     moved between answers as it aged: you looked under Classes for the thing you booked in
     September and by December it had become a Receipt without telling you.

     AN ANSWER SHOULD NAME WHAT A THING IS, NOT WHAT STAGE IT IS AT. A session is a receipt from the
     moment it is asked for — that is what the card has always drawn, torn at both ends — and its
     stage is a line ON the receipt, which is where somebody reads it. That way the list is stable,
     the count means "sessions", and nothing has to be looked for in two places. */
  receipt:  { group: 'Booking', label: 'Receipts',  card: x => jobPage_(x.row) },

  /* `coupon` WAS A KIND HERE — the classes with seats going.
     Both have gone, and for opposite reasons.

     YOUR SESSIONS ARE PANES ON `You`: you do not search for your own bookings, you check them.

     THE OPEN CLASSES ARE A DROPDOWN ON THE BOOKING FORM. A findable kind for a handful of rows meant
     somebody wanting a class had to know to go looking for one, and somebody filling in the form was
     never told they existed — two ways to make a booking that did not look like each other. Now
     "Waiting list class" is answered on the paper and the row below asks which list. See `joining`
     in book.js. */

  /* A FRIEND. Their figure, their level, and a way to stop being one. */
  /* ---------- YOU ARE FINDABLE, AND YOU ARE THE ONLY PERSON WHO IS -------------------------------
     `People` HAS ONE ENTRY AND THAT IS THE POINT. Tutors are already a kind, filtered to public
     facts by the backend; friends are already a kind, name and handle and score. What was missing
     was you — your own account lived as a settings list on `You` while everybody else in the app
     was a card.

     NOTHING ELSE GOES IN THIS GROUP without a backend change. The `people` tab holds PINs, bank
     details, addresses and dates of birth, and `doget.gs` deliberately never sends it — a directory
     built from here would put all of that on every phone, and the leak would be invisible because
     the data would already have arrived. */
  /* ---------- BACK UNDER `People`, AND THERE IS NO `You` ANSWER ---------------------------------
     IT WAS BRIEFLY ITS OWN ANSWER, on the argument that with the columns gone `forLabel` is the
     whole navigation and one of its answers had to be you. That was wrong for a simple reason: the
     card IS the answer. `meCard` carries your photograph, your name, your role, your credits and now
     the way out — so an answer called `You` led to one card, which is a question whose only purpose
     was to be answered.

     UNDER `People`, where a person goes, found the way every other person in this app is found. */
  /* `me` WAS HERE — you, under `People`, found the way every other person is found. Removed with
     the group: your own card is the whole of the account column, one swipe right, and a funnel
     answer that leads to exactly one card you can already see is a question with nothing to decide.
     `meCard` itself stays and is still what a tutor row draws when the tutor is you. */

  /* ---------- THE PAPERWORK, AND IT IS A DEPARTMENT ------------------------------------------------
     ITS OWN GROUP, NOT UNDER `Learning`. The first question asks which errand you are on, and
     somebody looking for the cancellation policy is not revising — filing a policy under Learning
     would be answering that question wrongly in order to reach it, which is the fault the note above
     `link` already refuses.

     `kindLabel` COMES OFF THE ITEM, so the second question splits the library into `For tutors` and
     `For families` without a facet, a column or a line in FACETS — see `docItems_` in terms.js. And
     because a policy has no board, tier or key stage, the coverage rule stops every other question
     being asked at all. The whole department costs one entry here and one line in `stuffItems`. */
  doc: { group: 'Paperwork', label: 'Documents', card: x => docCard_(x) },

  /* ---------- POSTS ARE A THING YOU LOOK FOR ---------------------------------------------------
     THE FEED IS FOR SCROLLING, NOT FOR FINDING. It is sorted by pinned and then by when, which is
     right for a feed and useless the moment somebody wants the picture from the trip in March — the
     only way to it was to scroll past everything newer, on the one screen where scrolling past
     something is how you never see it again.

     ITS OWN GROUP, NOT UNDER `Learning` OR `Booking`. A post is the business talking: an
     announcement, a photograph, a poll. It is not something you book with and not something you
     revise from, and filing it under either would be answering the first question wrongly to get
     to it — the same fault the note above `link` describes.

     THE CARD IS THE FEED'S OWN. `postCard_` in posts.js is the article the feed draws, lifted out
     of the `map` it was buried in — so a post found here is the same object with the same
     reactions, the same share button and the same admin controls, rather than a summary of one
     that then needs somewhere to open. */
  /* `post` WAS HERE — the real post card, reactions and all, answering under `Posts`. Removed:
     the feed is a column, and the same post reachable two ways is two places for it to look
     different. `postCard_` stays; the feed is what draws it. */

  friend: { group: 'Friends', label: 'Friends', card: x => {
    const f = x.row;
    const xp = Number(f.xp) || 0;
    return `<div class="card">
      <div class="thing">
        <span class="thing-pic art">${avatarFor(f.handle, 44, f.avatar)}</span>
        <div class="thing-body">
          <h3>${esc(x.name)}</h3>
          <p class="sub">${esc(f.handle)}${f.name ? ' · level ' + levelFromXp(xp) : ''}</p>
        </div>
        ${/* A BUTTON, NOT A SPAN — the fourth one of these. A span with a `data-do` cannot be
              reached by a keyboard, is not announced as a control, and `check/ui.js` never measures
              it because that pass looks at buttons, links and inputs. `.text-drop` looks the same
              either way; see the rule beside it in style.css. */''}
        <button class="text-drop" data-do="friend-drop" title="Remove"
          data-handle="${esc(f.handle)}">✕</button>
      </div>
    </div>`;

  } },

  /* A widget's card is its name and nothing else — the thing itself is the page it opens. */
  /* ---------- BOXING IS A SUBJECT, NOT A DEPARTMENT ------------------------------------------------
     THIS HAD ITS OWN GROUP, on the argument below — that a boxer is not something you book, learn
     from or buy. That argument was wrong, and the first question showed why: Booking, Boxing,
     Learning, Shop, Tools & games. Four of those are things you might want to DO with the app and
     one is a topic, sitting at the same level, as though boxing were a department.

     A BOXER IS SOMETHING YOU LEARN ABOUT, exactly as a past paper is. So the group is Learning and
     the SUBJECT is Boxing — which puts it in the list beside Maths and English, where anybody
     looking for it would look, and where it can be narrowed by division the way a paper is
     narrowed by exam board.

     The old reasoning is kept below because it is the reasoning that has to be answered, not
     deleted: what it got right is that a boxer is not a resource. What it missed is that the first
     question is not asking what KIND of record a thing is — it is asking what you came here to do.
  ------------------------------------------------------------------------------------------------
     ITS OWN GROUP. A boxer is not something you book, learn from or buy — and folding him into
     Learning would put a dead heavyweight in the same list as a past paper. */
  /* LABELLED `Resources`, LIKE A TOPIC AND A PAST PAPER, because that is what the second question
     is asking: what KIND of thing, not which table it came out of. `Boxers` and `Fights` as their
     own kinds put the storage shape on the screen — the user does not have a boxers tab, they have
     a subject they want to read about. Two kinds sharing a label is already how `topic` and
     `question` work, and it is the reason Boxing can then turn up under Subject beside Maths and
     English rather than as a department of its own. */
  boxer: { group: 'Learning', label: 'Resources', card: x => boxerCard_(x) },
  /* THE BOUTS. `boxers` is who; this is what happened. 157 of them sat in the sheet unread,
     because nothing in the app had ever been told the tab existed. */
  fight: { group: 'Learning', label: 'Resources', card: x => fightCard_(x) },

  /* ---------- TWO GROUPS, NOT ONE GROUP AND THEN THE SAME QUESTION AGAIN ---------------------------
     `Tools & games` WAS ONE ANSWER THAT IMMEDIATELY ASKED ITSELF. Choosing it led to a second
     question whose two answers were the two halves of the name you had just read — so the name
     posed the choice and the tap did not make it. Two taps to say a thing you had already decided
     before the first one.

     AND THEY ARE NOT ONE ERRAND. A protractor and Flabby Pird are not near neighbours: somebody
     reaching for a timer in the middle of a session and somebody killing ten minutes want opposite
     things, and grouping them says they are variations of each other.

     SEPARATE, EACH GROUP HOLDS ONE KIND, so the second question is skipped by the one-answer rule
     and Games goes straight to the games. Same number of taps to reach a game, one fewer to reach
     a tool, and the first question now reads as five errands rather than four and a category. */
  /* ---------- THESE TWO STAY IN THE TABLE AND NO LONGER ANSWER THE FIRST QUESTION -----------------
     TOOLS AND GAMES ARE COLUMNS NOW, so the funnel stops OFFERING them — but deleting these two
     entries would be the wrong way to do it, and quietly so. A widget may file itself under another
     group: `book.js` builds one per live session with `kind: 'tool'` and `groups: 'Booking'`, so it
     answers under Booking beside the receipts, which is where somebody looks for a class.

     `kindOf_` FALLS BACK TO `{ group: 'Shop', label: 'Things' }` FOR A KIND IT DOES NOT KNOW. Take
     `tool` out of here and those session widgets do not disappear — they turn into Shop · Things,
     which is a wrong answer rather than a missing one, and the kind of wrong answer nobody reports
     because it looks like a category somebody chose.

     SO THE ITEMS ARE FILTERED INSTEAD, where they are built: a widget reaches the funnel only if it
     says which group it belongs to. See `allWidgets()` in the item list below. The plain tools and
     games say nothing, so they are not offered — and `Tools` and `Games` stop being answers because
     NOTHING ANSWERS THEM, which is how `facetValues` decides what to show. */
  tool: { group: 'Tools', label: 'Tools', card: x => widgetCard_(x) },
  game: { group: 'Games', label: 'Games', card: x => widgetCard_(x) },

  /* ---------- LINKS ARE NOT LEARNING ---------------------------------------------------------------
     THEY WERE FILED UNDER IT and most of them are not: the categories on that tab run Apple, Google,
     Money, Admin, Tools, Social, download, videos. A bookmark to a bank is not a resource for a
     lesson, and burying the lot behind "What for · Learning" meant somebody looking for one had to
     answer a question wrongly to get there. */
  link: { group: 'Links', label: 'Links', card: x => {
    const l = x.row;

    /* The colour went with the shape it filled. A link's `colour` column is still read by the
       editor, and nothing draws with it any more — the site's own logo decides what a link looks
       like, which is the whole point of using it. */
    const initials = String(l.title || '').replace(/[^A-Za-z0-9 ]/g, '')
      .split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';
    const icon = faviconFor(l.url);
    const alt = faviconAlt(l.url);

    /* IS THERE ACTUALLY AN ADDRESS. `hostOf_` already answers this for the favicon and the answer
       was thrown away for the href — so a row whose `url` cell holds "corbetmaths" rather than an
       address became `<a href="corbetmaths">`, which a browser reads as RELATIVE: it resolves
       against this site and opens a 404 on our own domain. A tile that looks exactly like the
       eighty that work, and fails in a way that blames us.
       A row with no address is not a link yet, so it is not drawn as one — it is a card that says
       what is missing. */
    /* ONLY AN ABSOLUTE ADDRESS LEAVES. `hostOf_` said there was a host; this also says the scheme is
       http or https — see the `surfaces` tab. An external site is the one exception to nothing
       opening over this app, and `l.url` comes out of the links tab, so it is whatever somebody
       typed. Anything else is this app opening itself in a tab, and it falls through to a card that
       does not leave. */
    const goes = !!hostOf_(l.url) && /^https?:\/\//i.test(String(l.url || ''));
    const open = goes ? `<a class="card tap" href="${esc(l.url)}" target="_blank" rel="noopener">`
                      : `<div class="card">`;
    const shut = goes ? '</a>' : '</div>';
    return `${open}
      <div class="thing">
        <span class="thing-pic art">
          ${/* THE SITE'S OWN LOGO, AND NOTHING ELSE. The coloured shape with initials used to sit
                underneath as a fallback — and a fallback that is always drawn is not a fallback, it
                is the thing you see whenever the logo is slow, and a "W" in a brown square is the
                app inventing a mark for a site that already has one.
                Two services, tried in order: DuckDuckGo keeps nothing and is asked first; Google's
                has seen everything and returns a globe rather than a 404, which is what makes it
                the right last resort. `onerror` is cleared before the retry, or a second failure
                loops on the same handler. */''}
          ${icon ? `<img class="fav" src="${esc(icon)}" alt="" loading="lazy"
                        onerror="this.onerror=null;${alt ? `this.src='${esc(alt)}'`
                                                         : 'this.remove()'}">`
                 : `<span class="fav-none">${esc(initials)}</span>`}
        </span>
        <div class="thing-body">
          <h3>${esc(l.title)}</h3>
          <p class="sub">${mark(l.category || 'Link')} <span class="faint">· ${goes
            ? 'opens elsewhere'
            : 'no address yet'}</span></p>
        </div>
      </div>
    ${shut}`;

  } },

  /* A resource and a shop row share a card: to somebody looking for one they are the same kind of
     thing — a picture, a name, what it belongs to, and what it costs if it costs anything. */
  /* `topic` WAS HERE — the documents, labelled `Resources`. The funnel lists the questions inside
     them now and not the boxes; see the note above `questionItems`. */
  question: { group: 'Learning', label: 'Questions', card: (x, c) => thingCard_(x, c) },
  /* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER ------------------------
     I GAVE IT ITS OWN LABEL — "Questions" beside "Resources" — and that is two cupboards where
     there is one thing. Somebody after question 5b would have had to know which to open, and
     narrowing to Past paper would have hidden every question in it.

     SAME GROUP AND SAME LABEL AS A RESOURCE, so "Learning → Resources → Past paper" holds the
     paper AND its parts, and the Question and Part facets narrow from there. One funnel, which is
     the argument I made for the two extra rungs and then failed to build. Only the CARD differs,
     because a part is drawn differently from a paper. */
  /* ---------- `question` WAS A KIND AND IS NOT ANY MORE ------------------------------------------
     A PAST PAPER WAS DRAWN TWICE OVER. `paperCard` rendered the cover AND printed every question
     underneath it (`paperInline_`, since removed for a second reason — see the note where it used
     to be) — and each of those questions was ALSO its own card
     in the same list. Choosing Learning · Maths · Past paper gave you the paper, then the paper
     again one question at a time, and the answer to "which question" was a column of numbers 1 to
     23 drawn from all six papers of a sitting at once.

     THE FACETS BELOW WERE BUILT TO SURVIVE THAT. `paperName` says outright that it exists because
     "there was no which-paper", and `qNumber` and `qPart` narrow a list that should not have been
     long. Removing the second rendering removes the reason for all three.

     NOTHING IS LOST AND THE SEARCH STILL WORKS. The questions are one tap away on the card that
     names them, with their answers under them — `paperBody_` calls the same `answerBlock_`. And
     `paperText_(id)` already folds every question's words into the
     paper's own haystack, which is why searching `surds` finds the paper rather than nothing. */
  shop:  { group: 'Shop',     label: 'Things',    card: (x, c) => thingCard_(x, c) },
};

function widgetCard_(x) {
  /* NO LONGER A TAP TARGET. The sheet it opened was not a description of the tool, it WAS the tool —
     so there is nothing to summarise here and nothing a panel added except a lid. `widgetTiles_`
     opens it inside this card instead, and closes it with the same row. */
  return `<div class="card">
    <h3>${esc(x.name)}</h3>
  </div>`;
}

/* The card a resource and a shop row share. Named rather than written twice, because the two
   entries above genuinely want the same thing and a copy each is a copy to keep in step. */
function thingCard_(x, credits) {
  /* One card shape for both, because they are the same kind of thing to a person looking for one:
     a picture, a name, what it belongs to, and — if it costs anything — what.

     A RESOURCE SHOWS NO PRICE AT ALL. It used to say "0 credits — free", on the argument that a
     blank where a price should be reads as the app having forgotten. That argument holds for one
     card among priced ones and collapses when four hundred of the four hundred and ten say it:
     repeated on every row it stops being information and becomes a line you read past, and the
     one card that DOES cost something loses the contrast that made its price visible.

     A shop item priced at zero still says free, because there it means something — free among
     things that cost. A resource is free because it is a resource. */
  {
    const free = x.cost === 0;
    const afford = x.kind === 'shop' && !free && credits >= x.cost;
    /* WHAT IT TAKES TO HAVE IT. Three answers, and the card used to give one:
         a level    — earned, not bought. Gold once you are there, faint until then, and it says
                      WHICH level rather than "locked", because a number you can count towards is
                      a different thing from a door.
         credits    — bought. Gold when you can afford it.
         nothing    — genuinely free, which for a wearable means everybody starts with it. */
    const myLevel = Math.floor((Number(USER && USER.xp) || 0) / 10);
    /* ---------- AND A FOURTH ANSWER: NOBODY HAS PRICED IT --------------------------------------
         not priced — the cell is empty. Said out loud, faintly, rather than folded into `free`.
       THE LIST ABOVE SAID THREE AND THE CODE GAVE THREE, and the fourth state existed the whole
       time: `Number('') || 0` made a blank price a price of nought, so every wearable
       `seedAvatarItems` wrote — seven of them, at 15 to 40 coins in `AVATAR_ITEMS` — was drawn as
       FREE on every phone. `priced_` on the mapper is what tells the two apart now, and this is the
       half that has to say so, because `undefined` printed straight into the old branch reads
       `undefined credits`.

       FAINT AND NOT ALARMING. An unpriced row is an admin's unfinished cell, not a fault a visitor
       can do anything about — and calling it "free" is the one thing it must not do, because
       somebody presses that. Same argument as the DBS stamp: absent is not a negative, it is a
       blank, and the two are different sentences. */
    const price = x.kind !== 'shop' ? ''
      : x.level > 0
        ? `<span class="price ${myLevel >= x.level ? 'can' : ''}">${
            myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level}</span>`
      : x.cost === undefined
        ? `<span class="price is-unpriced">not priced yet</span>`
      : `<span class="price ${free ? 'free' : afford ? 'can' : ''}">${
          free ? 'free' : x.cost + ' credits'}</span>`;
    /* A wearable is a THIRD kind of thing on this list, beside a resource and a bought object —
       so it is marked as one and coloured as one, the same way a subject and a venue are. */
    /* ---------- A QUESTION IS A QUESTION. THERE ARE NO DOCUMENTS ON THIS SCREEN. ------------------
       `paperCard` WAS HERE, drawing a past paper as the cover of one — board across the top, tier
       in the corner, a ruled box for a candidate's name. It was a good card and it is gone with the
       thing it drew: the funnel lists QUESTIONS now, and a collection is not a result.

       WHY. A document is a box with questions in it, and this screen is for finding a question.
       Putting the box in the list meant every search returned two kinds of thing that answer the
       same facets — choose Edexcel · 2022 · Higher and you got the paper AND its parts — and every
       attempt to make that read properly made it worse: the paper drawn twice, then the whole paper
       printed onto its own card, then a card that was a cover you had to open. Three goes. The
       collection was the problem, not how it was drawn. */
    if (x.kind === 'question') return questionCard_(x);

    /* THE CARD IS NO LONGER A BUTTON. Its surface opened a sheet that repeated the card and then
       offered four controls; the controls are ON the card now, so the surface has nothing left to
       do — and leaving it tappable means every tap that misses a tick by two pixels opens a panel.
       A WEARABLE IS THE ONE EXCEPTION and keeps its sheet: buying one and putting it on are a
       single act with no basket in it, which is a different gesture from anything in a tile row. */
    /* NOTHING ON THIS LIST IS A TAP TARGET ANY MORE. The wearable was the last exception — it kept
       its sheet because buying and wearing are one act — and that act is now the row underneath,
       which says which of the three it is rather than making you open a panel to find out. */
    return `<div class="card${x.wearable ? ' is-wear'
             : x.kind === 'topic' ? ' is-subject' : ''}${x.off ? ' is-off' : ''}">
      <div class="thing">
        ${/* A WEARABLE DRAWS ITSELF. It has no photograph and never will — the drawing is the
              object, and a card selling a cape with nothing on it was selling a word.
              Cropped to the item rather than shown on a figure: a card-sized person wearing a
              scarf makes the scarf the smallest thing on the card. */''}
        ${x.wearable && x.artId && itemArt(x.slot, x.artId)
          ? `<span class="thing-pic art">${itemArt(x.slot, x.artId, 44)}</span>`
          : x.image ? `<img class="thing-pic" src="${esc(pic(x.image))}" alt="" loading="lazy">` : ''}
        <div class="thing-body">
          ${/* ---------- A RESULT IS READ LIKE A SEARCH RESULT -------------------------------------
                WHERE IT IS FROM GOES ABOVE THE NAME, not under it. That is the one structural thing
                Google's results do and almost nothing else does, and the reason is scanning: down a
                list of twenty, the eye lands on the same spot on every row, and the FIRST thing it
                should meet is what kind of thing this is — 1stclassmaths · KS2 · Year 4 — so that a
                row can be dismissed without reading its title at all.

                Under the title it would be a footnote, read only by somebody already interested,
                which is backwards. Half of searching is ruling things out.

                IT IS A BREADCRUMB, so the separators are middots and the whole line is small, quiet
                and monospaced. It is a path, not a sentence. */''}
          <p class="crumb">${[x.company, x.keystage,
              x.bandType === 'year' ? (x.bandValue && 'Year ' + x.bandValue)
            : x.bandType === 'grade' ? (x.bandValue && 'Grade ' + x.bandValue)
            : x.bandValue, x.tier, yearOf(x)]
            .filter(Boolean).map(v => esc(String(v))).join(' <span class="faint">·</span> ')}</p>
          <h3>${esc(x.name)}${x.off ? ' <span class="faint">— deleted</span>' : ''}</h3>
          ${/* Its own second line: a resource says its subject, a shop item its description. This
                fell back to the GROUP name when both were empty — which was the card repeating the
                heading above it, and is now a fallback to nothing, which is honest. */''}
          ${/* THE YEAR, ON THE CARD. For a past paper it is most of the identity — "Paper 1" is
                four papers and "Paper 1 · 2024" is one — and it was in the payload, filterable and
                sortable, and shown nowhere. A thing you can sort by and cannot see is a sort you
                have to take on trust.
                Read off the wave when the year itself is blank: "June 2024" carries it, and
                nobody should have to type the same fact into two columns. */''}
          ${/* WHO IT IS FROM, FIRST. The line said "Maths · 2025" on four hundred cards — and on a
                screen already filtered to maths the subject is the one word every card shares, which
                makes it the one word none of them needed. The company varies: 1stclassmaths at KS4,
                Corbettmaths at KS2. That is the fact that tells two cards apart.
                NOT ON A PAPER. `paperCard` has already drawn the board across the top of the cover,
                and printing "AQA" twice on one card reads as a mistake rather than emphasis. */''}
          <p class="sub">${x.company
            ? `${mark(x.company)}${x.sub || x.subject ? ' <span class="faint">· </span>' : ''}` : ''}${
            mark(x.sub || x.subject || '')}${yearOf(x)
            ? ` <span class="mono faint">· ${esc(yearOf(x))}</span>` : ''}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>
          ${price}
        </div>
      </div>
      </div>`;
  }
}


/* A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop
   holds both, and which it is depends on whether the row names a slot to wear it in. That is a
   genuine exception and is written out here rather than being a tenth entry that `kind` can never
   select. */
/* ==================================================================================================
   THE FUNNEL'S ANSWERS, AS THE SHEET WANTS THEM.

   `facets` MOVED THE QUESTIONS OUT OF CODE AND LEFT THE ANSWERS BEHIND. Which group a kind belongs
   to, what that group is called, what the kind is called, and what order the groups are offered in
   are four editorial decisions, and all four were literals — while the LABEL on the question asking
   them had a spreadsheet column. The same kind of decision on both sides of one screen, half of it
   a cell and half of it a deploy.

   WHAT `card` AND `wearable` STAY FOR. How to DRAW a kind is code, exactly as `of` is on a facet —
   a function cannot live in a cell without inventing a formula language. Only the naming and the
   grouping move.

   A KIND WITH NO ROW IS UNCHANGED, so the tab can be empty. A ROW FOR A KIND NOTHING PRODUCES is
   ignored, because there would be nothing to group.

   AND `GROUP_ORDER` IS DERIVED FROM IT NOW rather than being a second hand-written list that could
   disagree with the first. It could, and silently: a group named in `KINDS` and missing from the
   order sorted to the end alphabetically with nothing said.
================================================================================================== */
let KIND_LIVE = null, KIND_FROM = null;

function kindMap_() {
  const src = DATA.kinds || null;
  if (KIND_LIVE && KIND_FROM === src) return KIND_LIVE;
  KIND_FROM = src;
  const said = {};
  (src || []).forEach(k => { if (k && k.kind) said[k.kind] = k; });

  /* ---------- A KIND THE SHEET INVENTED ---------------------------------------------------------
     THE SAME GAP THE `facets` TAB HAD, and the same fix — see `facetFromSheet_`. This walked
     `Object.keys(KINDS)` and overlaid the sheet onto each, so a `kinds` row for a kind the code
     does not declare was read and thrown away. The backend already sends those rows through; its
     comment where it builds `payload.kinds` says so in as many words.

     AND THE CARD ALREADY FELL BACK, which is what makes this three lines rather than a project.
     `(kindOf_(x).card || thingCard_)(x, credits)` has always been the call — a kind with no card
     draws as an ordinary thing: name, subtitle, picture, price. So a new kind needs no card
     function, no `KINDS` entry and no facet. It needs a row here and a source of items.

     WHAT THAT LEAVES AS THE LAST HAND-WRITTEN BIT is `stuffItems` — where the items come from at
     all. That is one mapper per domain and it is the honest floor: something has to say "boxers
     live on `DATA.boxers` and a boxer is called `name`". Everything after it is now editorial.

     THE OLD FALLBACK WAS WRONG AND SILENT. `kindOf_` answers `{ group: 'Shop', label: 'Things' }`
     for a kind it does not know, so an unrouted kind did not vanish — it appeared under Shop,
     labelled Things, which is worse than vanishing because it looks deliberate. A sheet row is now
     the way to say where it really belongs. */
  const out = {};
  const order = Object.keys(KINDS)
    .concat(Object.keys(said).filter(k => !KINDS[k]));
  order.forEach((k, i) => {
    const base = KINDS[k] || {}, s = said[k];
    if (s && s.active === false) return;
    /* A SHEET-ONLY KIND WITH NO GROUP WOULD LAND IN `undefined`, which `groupOrder_` would then
       offer as an answer to the first question. `Learning` is the default because it is where
       content goes and the only alternative is refusing the row silently. */
    if (!KINDS[k] && !asList_(s && s.group).length) base.group = 'Learning';
    if (!KINDS[k]) base.fromSheet = true;
    out[k] = Object.assign({}, base, {
      /* THE SHEET WINS WHEN IT HAS SAID ANYTHING. `asList_` is what decides whether it has — an
         empty cell arrives as an empty array, which is falsy nowhere useful, so testing the length
         is the only test that means "the cell was blank". */
      group: asList_(s && s.group).length ? s.group : base.group,
      /* A KIND THE SHEET INVENTED AND DID NOT NAME falls back to the kind itself rather than to
         `undefined`, which would print as an empty answer in the second question. */
      label: (s && s.label) || base.label || k,
      at:    facetNum_(s && s.order, (i + 1) * 10),
    });
  });
  return (KIND_LIVE = out);
}

/* THE GROUPS IN THE ORDER THEY ARE OFFERED, lowest `sort_order` of any kind in the group first —
   so a group moves by moving any one of its kinds, and there is no second list to keep in step. */
function groupOrder_() {
  const seen = {};
  const m = kindMap_();
  Object.keys(m).forEach(k => {
    /* EVERY GROUP THE KIND IS IN, so a kind belonging to two puts its number against both — and a
       group still moves by moving any one of its kinds. */
    asList_(m[k].group).forEach(g => {
      if (seen[g] === undefined || m[k].at < seen[g]) seen[g] = m[k].at;
    });
  });
  return Object.keys(seen).sort((a, b) => seen[a] - seen[b] || cmpText(a, b));
}

/* ONE VALUE OR SEVERAL, ALWAYS READ AS SEVERAL. A facet's `of` may return a string, a list, or
   nothing; every caller wants the same thing out of it, which is the values that are actually
   there. Blank strings are dropped here rather than in four places — `facetCoverage` counts what
   is left, and a row with nothing to say about a question should not be counted as having said
   something empty. */
const asList_ = v => (Array.isArray(v) ? v : [v])
  .map(x => String(x == null ? '' : x).trim()).filter(Boolean);

function kindOf_(x) {
  if (x && x.wearable) return { group: 'Shop', label: 'Wearables' };
  return (x && kindMap_()[x.kind]) || { group: 'Shop', label: 'Things' };
}

/* ---------- A PRICE THAT NOBODY HAS TYPED IS NOT A PRICE OF ZERO --------------------------------
   `Number(t.rate) || 0` WAS THE PATTERN and it folds three different things into one number: a
   rate of 0, a blank cell, and a cell holding "ask me". All three came out 0, and 0 means FREE to
   the Price facet — so a tutor whose rate nobody has filled in was advertised as free.

   `undefined` IS THE ANSWER FOR ALL THREE. It is what "I have no price" looks like everywhere else
   in this file: `asList_` drops it, the facet skips it, and the card draws nothing. A real 0 still
   gets through, because `Number('0')` is 0 and `isFinite(0)` is true. */
function priced_(v) {
  if (v === null || v === undefined || String(v).trim() === '') return undefined;
  const n = Number(String(v).replace(/[^0-9.-]/g, ''));
  return isFinite(n) ? n : undefined;
}

const FACETS = [
  /* What sort of thing, first. It is the one question that changes which of the others make any
     sense at all — a wearable has a slot and no exam board, a paper the reverse. */
  /* WHAT FOR, before what kind.
     A tutor, a venue and a subject are three answers to one question — who, where and what — and
     nobody assembling a session thinks of them as three different sorts of thing. They are the
     things you BOOK. Grouping them says so, and it takes the first question from nine answers to
     four, which is the difference between a menu and a choice.
     Derived, not stored: what a thing is for follows from what it IS, so there is no column for
     this and nothing to keep in step. And `kindLabel` below still asks which one — except where
     the group holds only one kind, in which case the one-answer rule skips it and choosing
     Learning takes you straight to the resources. */
  /* ---------- AN ITEM MAY OVERRIDE THE GROUP ITS KIND PUTS IT IN ----------------------------------
     `kinds` DECIDES THE GROUP FOR A WHOLE KIND, which is right for the kinds — a tutor is Booking
     and People, every tutor, always. It is wrong for one item inside a kind: `Your sessions` is a
     widget, so its kind says Tools, and Tools is where somebody looks for a timer rather than for
     what they have booked.
     `groups` ON THE ITEM WINS WHEN IT IS THERE. Same list-or-string shape `asList_` already reads,
     so nothing else had to learn a new form. Nothing sets it but the widgets, and only the one. */
  /* ---------- A DOOR IS NOT A FILTER, AND THE BALANCE RULE HAD TO BE TOLD -----------------------
     `FACET_MIN_MINORITY` SKIPS A QUESTION NOBODY ANSWERS DIFFERENTLY, and on this library that is
     very nearly this one: 3,753 of 3,770 items are questions, so `Learning` holds 99.5% and the
     rule would drop the app's first question on the floor.

     IT WOULD BE RIGHT ABOUT THE ARITHMETIC AND WRONG ABOUT THE JOB. Every other facet NARROWS a
     list of like things — which subject, which tier, which board — and there the rule is exactly
     correct: an answer nobody gives is a button that does nothing. These two NAVIGATE. `What for`
     and `What kind` are how somebody gets from the whole app to a department, and the person who
     came to book a tutor needs that door whether it leads to one tutor or to a thousand. Hiding it
     because the library is large would mean the funnel got harder to use the more content you
     added, which is precisely backwards.

     SO `always` MARKS THE TWO THAT ARE DOORS, and nothing else may carry it. It exempts a facet
     from the balance rule ONLY — the coverage rule, the answer-count cap and "everything agrees"
     all still apply, so a group question with one answer left still goes away. */
  { field: 'forLabel',  label: 'What for',    always: true,
    of: x => x.groups || kindOf_(x).group },
  /* `kindLabel` ON THE ITEM WINS, the same way `groups` does on the line above — so a thing placed
     under a group its kind does not belong to can also say what it is called there. */
  { field: 'kindLabel', label: 'What kind',   always: true,
    of: x => x.kindLabel || kindOf_(x).label },
  /* Only venues have one, so it is only ever asked once you are looking at venues — which is the
     coverage rule doing the work that a per-kind filter list would otherwise have to. */
  { field: 'borough',   label: 'Where',       of: x => x.borough || '' },
  /* Only links have one, so it is only ever asked once you are looking at links — the coverage
     rule again, doing what a per-kind filter list would otherwise need code for. */
  { field: 'category',  label: 'Category',    of: x => x.category || '' },
  { field: 'subject',   label: 'Subject',     of: x => x.subject },
  /* ---------- THE QUESTION THE FUNNEL HAD NEVER ASKED --------------------------------------------
     STRAIGHT AFTER `Subject`, because "Maths, and it is about fractions" is how somebody says what
     they are looking for — and because `nextFacet` walks this list IN ORDER, so anything below the
     provenance questions is a question you only reach after answering five that are not it.

     IT STAYS SILENT UNTIL IT IS USEFUL, WITHOUT BEING TOLD TO. There are 389 distinct topics across
     the library, which is past `FACET_MAX_ANSWERS`, so it is not offered at the top — and 91.5% of
     the question rows carry one but almost nothing else in the app does, so its coverage is low
     until the list IS questions. Both rules that keep it out of the way are the ones already here,
     doing the job they were written for; there is no number in this entry.

     SO IT ARRIVES WHERE IT IS ANSWERABLE. Learning · Maths · Worksheet · KS2 leaves 54 topics —
     still a list, so the funnel keeps narrowing — and by the point it used to say "nothing left"
     it is eleven. See `topicOf_` for the reader and for why the spelling is voted on rather than
     listed.

     AND IT IS A COLLECTION AS WELL AS A QUESTION, for free: 389 groups is past the same constant
     `collectionAxes_` reads, so "or the 352 topics these are in" becomes available wherever
     grouping by topic would collapse the list harder than grouping by paper. Neither of those
     behaviours is written here. */
  /* ---------- THE BRANCH BEFORE THE TOPIC --------------------------------------------------------
     ASKED FIRST BECAUSE IT IS THE QUESTION SOMEBODY HAS FIRST, the same judgement `boxKind` and
     `Decade` below already record: "is this algebra or geometry" comes before "is it simultaneous
     equations". It is also the only version of this question that fits on the card -- see
     `topicAreaOf_` for the tree it reads and the 96.6% it resolves.
     NOTHING NEW DECIDES WHEN IT IS ASKED. Ten answers is under the cap and almost nothing outside
     the library carries a topic, so the coverage rule keeps it out of the way until the list is
     questions -- both rules were already there. */
  { field: 'topicArea', label: 'Topic area',
    of: x => x.topicArea || topicAreaOf_(x) },
  { field: 'topic',     label: 'Topic',
    of: x => x.topic || topicOf_(x) },
  /* Only boxers and bouts carry one, so the coverage rule keeps it out of the way of everything
     else — the same rule that hides `borough` unless you are looking at venues. */
  /* BEFORE THE WEIGHT, because "a boxer or a bout" is the question somebody has first and there
     are two answers to it, not twenty. */
  { field: 'boxKind',   label: 'Boxers or fights', of: x => x.boxKind || '' },
  /* ---------- THE DECADE COMES BEFORE THE WEIGHT -------------------------------------------------
     REPORTED AS "boxers and fights shouldn't be organised by weight category before the decade/s
     involved of fighter or boxer", and it is the same judgement `boxKind` above already records
     one rung up: the question somebody has FIRST is the one that should be asked first, and
     `nextFacet` walks this list in order.

     WHICH IS RIGHT, AND NOT BECAUSE OF THE ARITHMETIC. A division narrows harder — twenty answers
     against six or seven — so every rule in this file would pick it, and every rule in this file is
     about how much a question narrows rather than about what somebody came for. A person who wants
     to look at boxing wants an ERA: the heavyweights of the seventies are a subject, and
     "heavyweight" across a century is a list of strangers. The weight is the second question, and
     it is a good one once the era is chosen.

     A DECADE, NOT A YEAR. `year` further down would give forty answers, past `FACET_MAX_ANSWERS`,
     so the question would be refused outright and the funnel would go straight to the weight — the
     exact complaint. Ten years is the unit boxing is actually discussed in.

     AND A FIGHTER IS IN AS MANY AS HE FOUGHT IN, which is what "decade/s" means. A career from
     1975 to 1992 answers the 1970s, the 1980s and the 1990s, so narrowing to the eighties finds him
     — a fighter filed under his last year alone disappears from the decade he was famous in. That
     is the same fault `keystage` had, where a primary worksheet forced into one key stage vanished
     from the other, and the machinery is the same: `asList_` reads a list, so a facet returning
     several answers already filters and counts against all of them. */
  { field: 'decade',    label: 'Decade',      of: x => decadesOf_(x) },
  { field: 'division',  label: 'Division',    of: x => x.division || '' },
  /* THIRD, and it was seventh. An exercise and a past paper are different ERRANDS — somebody
     revising and somebody sitting a mock are not looking for the same thing — so it is the
     question that most changes what should come next. 412 of 417 rows can answer it, which is
     the other half of what makes a good early question. */
  { field: 'documentType', label: 'Type',     of: x => x.documentType },
  /* ---------- A RESOURCE CAN BELONG TO MORE THAN ONE KEY STAGE -------------------------------------
     PRIMARY WORKSHEETS DO NOT RESPECT THE BOUNDARY. Column addition, times tables, telling the time,
     naming 2-D shapes — Year 2 meets all of them and Year 6 is still practising them. Forcing one
     answer meant choosing which half of the audience to hide the sheet from, and KS2 won every
     time, so a KS1 tutor filtering by key stage saw nothing at all.

     THE MACHINERY WAS ALREADY THERE, HALF OF IT. `asList_` reads an array or a single value and
     every facet goes through it — matching at `matches_` and counting in `facetValues` — so a facet
     returning two key stages already filters and counts correctly against both. What it did NOT
     read was a comma inside a cell, which is how a spreadsheet holds a list: `KS1, KS2` arrived as
     one answer spelled "KS1, KS2", sitting in the list beside the real ones.

     SO THE SPLIT HAPPENS HERE, not in the sheet and not in the backend, and the column stays
     something a person can type into. */
  { field: 'keystage',  label: 'Key stage',
    of: x => String(x.keystage || '').split(',').map(s => s.trim()).filter(Boolean) },
  /* ---------- THREE BANDS, THREE QUESTIONS, BECAUSE THEY ARE NOT THE SAME QUESTION ----------------
     `band_value` HOLDS A NUMBER AND `band_type` SAYS WHAT KIND OF NUMBER IT IS. A GCSE grade 4 and
     a Year 4 sheet both hold `4`, and asking one question called "Grade" over both would put a
     nine-year-old's worksheet under Grade 4 next to a foundation exam topic. Each type gets its own
     facet, gated on `bandType`, so the three can never be mixed and the wrong one is never asked.

     `stage` AND `grade` WERE HERE ALREADY; `year` IS THE ONE THAT WAS MISSING — which is why the
     Corbettmaths primary sheets could not be reached from the funnel at all. They are banded by
     school year, no facet asked about school years, and the Grade question they could not answer
     was the only one on offer.

     THE COVERAGE RULE THEN DOES THE REST. `Grade` is only offered when enough of what is on screen
     can answer it, so choosing Learning · Maths · Worksheet with primary sheets showing offers
     `Year`, and with GCSE sheets showing offers `Grade` — without either list naming the other. */
  { field: 'bandValue', label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade'
                                                    ? 'Grade ' + x.bandValue : '' },
  /* `School year`, NOT `Year`. There are two facets here that were both called Year — this one, the
     year group a child is in, and `year` below, the year a paper was sat. They never collided while
     no maths resource carried a year group; the primary worksheets now do, and two questions
     labelled the same thing on one screen, one meaning 4 and the other 2024, is the sort of fault
     that reads as a bug in the data rather than in the label. */
  { field: 'yearGroup', label: 'School year',        of: x => x.bandValue && x.bandType === 'year'
                                                    ? 'Year ' + x.bandValue : '' },
  /* ---------- ONE LADDER, NOT TWO, AND THE SPELLING IS PART OF THE FAULT ------------------------
     THIS WAS `stage`, READING ONLY `band_value` WHERE `band_type` IS `stage`. The `level` column
     says the same thing on a different set of rows, and because the code had no `level` facet the
     `facets` tab invented one — exactly as `facetFromSheet_` is designed to. So the funnel asked
     the same question twice, off two columns, and the two disagreed:

         level = Alevel   ->  135 items          stage = A-Level  ->  263 items
         level = GCSE     -> 2092 items          stage = GCSE     ->  345 items

     MEASURED, AND THE OVERLAP IS THE POINT: 128 A-level items carry a stage and no level, 135
     carry both. Which result set you got depended on which of the two questions the funnel
     happened to offer you first — the same word, twice, meaning different things. That is the
     "it feels arbitrary" complaint in its most literal form.

     NAMED `level` SO THE SHEET'S ROW BECOMES AN OVERRIDE. `facetList` treats a `facets` row whose
     field is already declared in code as a relabel/reorder of that facet, and one whose field is
     unknown as a new question. Renaming this from `stage` to `level` moves the sheet's row from
     the second pile to the first, so there is one question again and the sheet still owns its
     label, its order and whether it is asked at all.

     THE BAND WINS WHERE IT EXISTS, because `band_type: stage` is a deliberate statement about a
     row; the `level` column is the bulk-import's version of the same fact and is the fallback.

     AND `Alevel` IS A MISSPELLING OF A PROPER NOUN. Three spellings were on screen at once —
     `Alevel`, `A-Level`, `A-Level` — reading as three different things. Normalised here rather
     than in the data because the data is bulk-imported and will keep arriving both ways. */
  { field: 'level',     label: 'Level',       of: x => levelOf_(x) },
  { field: 'examBoard', label: 'Exam board',  of: x => x.examBoard },
  { field: 'tier',      label: 'Tier',        of: x => x.tier },
  /* Through `waveOf`, for the same reason `year` goes through `yearOf` one line below: the cell
     may hold a DATE rather than a wave, and a filter button sixty characters wide reading
     "Fri Jun 01 2024 08:00:00 GMT+0100 (British Summer Time)" is what that looks like untouched. */
  /* `Sitting`, NOT `Exam wave`. "Wave" is the column's name and nobody outside this repo says it;
     the answers under it are now "June 2018" and "November 2018", which is what a student calls
     the thing. The `facets` tab can still relabel it. */
  { field: 'examWave',  label: 'Sitting',     of: x => waveOf(x) },
  /* Through `yearOf`, so a paper whose year lives only inside "June 2024" is filterable by year
     without anybody having to type it into a second column to make the filter work. */
  { field: 'year',      label: 'Year',        of: x => yearOf(x) },
  { field: 'company',   label: 'Company',     of: x => x.company },
  /* ---------- WHAT YOU NEED IN FRONT OF YOU ------------------------------------------------------
     A LIST, so a question needing compasses AND the printed sheet answers both — `asList_` and the
     comma are doing here exactly what they do for `keystage` two screens up. The values come from a
     closed vocabulary in `check-library.js`, so a fifth spelling of "calculator" fails the build
     rather than becoming a fifth button.

     ITS COVERAGE IS LOW ON PURPOSE AND NOTHING NEW DECIDES WHEN IT IS ASKED. 1,013 of 4,005
     questions inherit a calculator answer from their paper's front page and the rest say nothing
     yet, so `FACET_COVERAGE` keeps the question quiet until the list on screen is mostly papers
     that declare it — which is the same self-correcting rule that keeps `Topic` out of the way
     until the list IS questions. */
  { field: 'needs',     label: 'What you need', of: x => asList_(x.needs) },
  /* ---------- `paper` — "PRINTED?" — WAS HERE, AND IT WAS NOT A QUESTION ------------------------
     IT READ `x.paper`, AND `questionItems` SET THAT TO `true` ON EVERY QUESTION. So the only
     reader of the field was this facet, and the only writer was a literal. Measured: 3,753 items
     answered `Printed` and 17 answered `Digital` — and those 17 were the widgets, which have no
     such field at all. It passed every test `nextFacet` had (two answers, 100% coverage) and
     narrowed nothing, on every search, for everybody.

     THIS IS THE `cost: 0` FAULT AGAIN. CLAUDE.md records it: "3,262 of 3,265 items answered Free,
     which made that bucket mean everything." That one was fixed in the data and the RULE that
     would have caught the next one was never written, so the next one arrived here. It is written
     now — see `FACET_MAX_SHARE` — and this facet is gone rather than repaired, because there is
     nothing left for it to ask: the print line was deleted with the paper card (CLAUDE.md, "What
     IS lost, and it is the print line"), so nothing in the app sells a printed anything.

     THE THREE COLUMNS IT MIGHT HAVE READ disagree anyway — `printable` is True on 882 rows,
     `needs_print` on 248, `print_required` on 100 — so an honest version of this question would
     have had to pick one and say why. When something sells paper again, that is the moment to. */
  /* ---------- `paperName` — "WHICH PAPER" — WAS HERE ------------------------------------------
     IT EXISTED BECAUSE THE PAPER WAS A RESULT. Its own note said so: the facet kept a paper's card
     in the list beside its questions rather than filtering it out. There are no paper cards; the
     list is questions, and `Year` + `Exam wave` + `Tier` already say which paper a question is
     from, off the same three columns copied onto every question row. A fourth facet spelling out
     "Paper 31: Statistics — June 2022" was the collection asserting itself one more time. */
  /* ---------- TWO MORE RUNGS ON THE SAME LADDER ------------------------------------------------
     A QUESTION IS NOT A NEW KIND OF SEARCH, it is level → year → paper carried two steps further.
     These sit after the paper facets so the funnel narrows in the order somebody thinks in: which
     paper, then which question, then which part.
     Blank on everything that is not a question, so they only appear once the list is questions —
     which is what every other facet here already does. */
  /* ---------- ONLY WHERE A QUESTION NUMBER MEANS SOMETHING -----------------------------------
     ON A PAST PAPER IT IS A REAL QUESTION: "question 5" is a specific problem people talk about,
     look up and revise. ON A WORKSHEET IT IS A ROW INDEX. Twenty-five primary topics with ten
     questions each produced "1 (25), 2 (25), 3 (25) … 10 (25)" — ten identical answers that carry
     no fact about anything, offered as the next step after Key stage.

     THE DIFFERENCE IS THE DOCUMENT, so the document decides. A paper's numbering is part of how it
     is referred to; a worksheet's is the order it happens to be typed in. Blank on a worksheet, so
     the coverage rule never offers it there — and unchanged on the papers, where it was right. */
  /* `qNumber` AND `qPart` WERE HERE. Nothing sets either field now — they were written by
     `questionItems`, which drew the duplicate cards these two existed to narrow. */
  /* ---------- THE FACET THAT IS ALWAYS TOO BIG TO ASK, DELIBERATELY ---------------------------
     202 ANSWERS. It will never be offered as a question — `FACET_MAX_ANSWERS` is 40 — and that is
     not a flaw in it, it is what makes it a COLLECTION. `collectionAxes_` picks up exactly the
     facets that fail that test, so declaring this is how a paper becomes a thing you can group by
     without a `kind: 'paper'` row existing anywhere.

     `paper_id` OFF THE ROW, NOT `name` OFF THE ITEM. A question item's `name` is `Q2a` — the
     reference — and the paper's name is its `sub`. The id is the honest join and `groupItems_`
     names the group from what its members agree on, which for these is that `sub`.

     ANY DOMAIN CAN DO THE SAME with a row in the `facets` tab: name a column that many rows share
     and the funnel decides, by counting, whether it is a question or a collection. */
  /* ---------- A PAPER IS AN ANSWER, NOT A SECOND WAY OF ASKING ----------------------------------
     THIS CARRIED `collect: true` AND WAS DRAWN AS A LINE ABOVE THE FUNNEL — "or the 227 papers
     these are in" — because 227 answers is past `FACET_MAX_ANSWERS` and a question cannot offer
     them. The flag, `collectionAxes_`, `groupItems_` and both handlers are gone: two ways of
     narrowing one list, stacked on one screen, is a pivot table, and this is a search.

     THE ORDINARY RULES ALREADY DO THE JOB and do it better. 227 answers keeps this silent at the
     top exactly as the cap intends; narrow to one board, tier and sitting and it is twelve, under
     the cap, and the funnel asks "which paper" as the plain question it is — with the same chip,
     the same ✕ and the same counts as every other answer. Nothing special, nothing to explain, and
     one screen with one question on it.

     THE NAME, NOT THE ID. `paper_id` is `P-1MA1-2306-1H` and a button has to be readable; every
     question of one paper carries that paper's name as its `sub`, so the id decides WHO answers
     and the name is what is shown. An item with no `paper_id` does not answer at all, which is
     what keeps the question away from tutors, venues and widgets. */
  { field: 'paperId',   label: 'Paper',
    of: x => (x.row && x.row.paper_id) ? (x.sub || x.row.paper_id) : '' },
  { field: 'slot',      label: 'Goes on',     of: x => x.slot },
  /* ---------- "FREE" AND "NOT PRICED" ARE DIFFERENT ANSWERS, AND THIS SAID FREE TO BOTH -------
     MEASURED: 3,262 OF 3,265 ITEMS ANSWERED `Free`. Every mapper in `stuffItems` used to write
     `cost: 0` whether or not the thing had a price at all — a subject, a level, a link, a friend,
     a timer, a question — because it was part of a block of blanks everybody copied. This facet
     tests `x.cost === 0`, strictly, so all of them came back Free and the `Free` bucket meant
     "everything in the app".

     THE BLANKS WERE CEREMONY AND THIS ONE WAS NOT, which is the trap: fifteen fields in that block
     behave identically whether you write them or not — `asList_` cannot tell `''` from `undefined`
     — and the sixteenth silently decided a filter. One load-bearing line hidden among fifteen
     decorative ones is exactly the kind of thing that makes a funnel feel arbitrary.

     SO: NO `cost` MEANS NO ANSWER, and the thing drops out of this question rather than claiming to
     be free. `cost: 0` still means free, because a shop item priced at nought IS free. `priced_`
     below is what tells an unset rate from a rate of zero. */
  { field: 'afford',    label: 'Price',
    of: x => x.cost == null ? ''
           : x.cost === 0 ? 'Free'
           : x.cost <= (USER ? USER.credits || 0 : 0) ? 'Can afford' : '' },
];

/* ==================================================================================================
   THE FUNNEL'S QUESTIONS, AS THE SHEET WANTS THEM.

   `FACETS` above is the half that has to be code: how to READ a value off a thing. "The band, but
   only when it is a grade rather than a stage" is logic, and logic in a spreadsheet cell is a
   formula language nobody asked for.

   Everything else about a question — what it is called, when it is asked, whether it is asked at
   all — is editorial, and it was in code for no better reason than that it was written there. So
   the `facets` tab overlays this list: same fields, new labels, new order, and an off switch.

   A FIELD WITH NO ROW IS UNCHANGED, so the tab can be empty and the funnel behaves exactly as it
   does today. A ROW FOR A FIELD THAT DOES NOT EXIST IS IGNORED — the sheet cannot invent a
   question, because there would be nothing to read for it.
================================================================================================== */
/* ---------- KEYED ON THE PAYLOAD, THE WAY `allTopics` DOES IT --------------------------------------
   THIS WAS `if (FACET_LIVE) return FACET_LIVE` AND NOTHING EVER CLEARED IT. Whichever call came
   first won for the rest of the session — and the first one is very often before the payload has
   landed. The app draws the screen you were last on before `load()` finishes, so reopening it on
   Find builds this list against `DATA.facets` being undefined, caches the code defaults, and then
   ignores the `facets` tab entirely no matter what arrives afterwards. Every label, every order and
   every off switch on that tab silently does nothing, for that whole session, at random. Retry has
   the same effect: `load()` replaces `DATA` wholesale and this went on answering from the payload
   before it.

   `allTopics` two hundred lines down already solves this properly — it keys its memo on the object
   IDENTITY of the payload branch it reads, so a new payload is a new list by construction. Same
   trick here. One comparison, no coupling to `load()`, and it cannot be forgotten from the other
   end because there is no other end. */
let FACET_LIVE = null, FACET_FROM = null;

/* ---------- A QUESTION THE SHEET INVENTED -------------------------------------------------------
   THE FUNNEL COULD BE EDITED FROM A SPREADSHEET AND NOT EXTENDED, and that is the whole reason
   adding a domain felt like ducktape. Boxing needed a mapper, a `boxKind` field, a `division` facet,
   `divisionOf_`, a card and a `KINDS` entry — six code changes to ask one new question.

   A FACET IS TWO THINGS AND ONLY ONE OF THEM IS LOGIC. "What is this called, when is it asked, is
   it asked at all" is editorial and has been in the sheet for a while. "How to READ the value off a
   thing" is `of:`, a function — and for TEN of the twenty-one facets that function is literally
   `x => x.subject`. Reading a named field is not logic. It is a field name.

   SO A ROW NAMING A FIELD THE CODE DOES NOT KNOW BECOMES A QUESTION, with the reader derived:

     LOOK ON THE ITEM FIRST, then on `row` — the original spreadsheet row every item carries. That
     second half is what makes this worth doing: a column somebody adds to `venues` is filterable
     the same afternoon, with no mapper edit, because the row is already on the item.

     A COMMA IS A LIST. A spreadsheet cell holding several values holds them comma-separated — that
     is what `keystage` already does in code, and doing it here means the next such column needs no
     code at all. The cost is a value that legitimately contains a comma, which for the categories a
     facet asks about is rarer than the list.

   THE BACKEND ALREADY PASSES THESE ROWS THROUGH. `doget.gs` says so where it builds `payload.facets`
   — "a row for a field the code does not know is passed through rather than dropped" — so this is
   a phone change only, no deploy.

   A TYPO IS NOT SILENT, and that is the part that took thinking about. `field: subjekt` matches
   nothing, so coverage is 0 and the question is never offered — invisible, which is this app's
   signature fault. `whyThisQuestion()` is the answer: it lists every facet including this one, with
   `nobody can answer it` beside it and 0%. The instrument existed before the hazard did. */
const facetFromSheet_ = f => ({
  field: f.field,
  label: f.label || String(f.field).replace(/_/g, ' '),
  fromSheet: true,
  of: x => {
    const v = (x && x[f.field] !== undefined && x[f.field] !== null && x[f.field] !== '')
      ? x[f.field]
      : (x && x.row ? x.row[f.field] : undefined);
    if (Array.isArray(v)) return v;
    return String(v === undefined || v === null ? '' : v)
      .split(',').map(t => t.trim()).filter(Boolean);
  },
});

/**
 * FIELDS WHOSE CODE FACET WAS DELETED ON PURPOSE, AND WHICH THE SHEET MAY NOT RESURRECT.
 *
 * REPORTED FROM A SCREENSHOT OF THE LIVE FUNNEL: a chip reading **`PRINTED OR DIGITAL  1`**.
 *
 * WHAT HAPPENED IS THE SHARPEST EDGE ON `facetFromSheet_` AND IT HAD NEVER FIRED BEFORE.
 * `facetList` sorts a `facets` row into one of two piles: a field the code declares is a RELABEL
 * of that facet, and a field the code has never heard of is a NEW question read straight off the
 * column. Deleting the `paper` facet from `FACETS` moved the sheet's row from the first pile to
 * the second — silently, in a commit that was about something else entirely.
 *
 * AND `paper` IS A COLUMN THAT MEANS SOMETHING ELSE. CLAUDE.md records the collision under its own
 * heading: `kind: 'paper'` was the document and `paper: '1'` is WHICH PAPER OF THE SET. The deleted
 * facet read `x.paper`, a literal `true` on every question; the column holds `1`, `2` and `3` on
 * 1,158 rows. So the funnel offered a question labelled "Printed or digital" whose answers were the
 * numbers 1, 2 and 3 — and a person who pressed one had quietly filtered the whole library to
 * Paper 1s while believing they had asked about printing.
 *
 * NEITHER RULE COULD SEE IT. It is not lopsided (three answers, a real split), it is not a literal
 * (the answers move), and no check compares a LABEL against what a column holds — nothing can.
 *
 * SO A DELETION IS REMEMBERED. The list is the `ACCEPTED` / `VOCAB` / `ACCEPTED_TAP` pattern for a
 * fourth time: one entry, one written reason, and the sheet cannot undo a decision the code made on
 * purpose. The label still has to be fixed in the `facets` tab — this only stops it drawing.
 *
 * IT DOES NOT BAR THE COLUMN FOR EVER. If "which paper of the set" is wanted as a question, it is
 * one entry in `FACETS` with a label somebody has read — which is the point: a label is exactly the
 * thing a spreadsheet cell cannot get reviewed.
 */
const RETIRED_FACETS = {
  paper: 'the "Printed?" facet was deleted for reading a literal — and the `paper` COLUMN it would '
       + 'now read means which paper of the set (1, 2, 3), so the sheet\'s old label sits over '
       + 'completely different data. Use `Paper`, which asks the same thing by name.',
};

function facetList() {
  const src = DATA.facets || null;
  if (FACET_LIVE && FACET_FROM === src) return FACET_LIVE;
  FACET_FROM = src;
  const said = {};
  (src || []).forEach(f => { if (f && f.field) said[f.field] = f; });
  const known = {};
  FACETS.forEach(f => { known[f.field] = true; });

  FACET_LIVE = FACETS
    .map((f, i) => {
      const s = said[f.field];
      if (!s) return Object.assign({}, f, { at: (i + 1) * 10, min: FACET_COVERAGE });
      if (s.active === false) return null;
      return Object.assign({}, f, {
        label: s.label || f.label,
        at:    facetNum_(s.order, (i + 1) * 10),
        /* A THRESHOLD OF ZERO IS A REAL ANSWER — "ask this however few can answer it" — so it
           cannot be treated as absent the way an empty cell is. `null` means the cell was blank;
           0 means somebody typed it. */
        min:   facetMin_(s.minCoverage),
      });
    })
    /* ---------- AND THE ONES THE CODE HAS NEVER HEARD OF -----------------------------------------
       AFTER the code's own, and LAST by default. A question somebody added in a spreadsheet has not
       been placed in the funnel's order by anybody — the code facets run 10 to 210 — so 1000 puts
       it behind all of them until a `sort_order` says otherwise. Sorting it in front of `What for`
       by accident would rearrange the first question every search passes through. */
    .concat((src || [])
      .filter(f => f && f.field && !known[f.field] && f.active !== false && !RETIRED_FACETS[f.field])
      .map((f, i) => Object.assign(facetFromSheet_(f), {
        at:  facetNum_(f.order, 1000 + i),
        min: facetMin_(f.minCoverage),
      })))
    .filter(Boolean)
    /* ---------- A DOOR IS ASKED BEFORE A FILTER, AND THE SHEET CANNOT REORDER THAT ---------------
       THE SHEET PUT `subject` AT ORDER 1 AND TUTORS BECAME UNREACHABLE. That is not a hypothetical:
       measured on the real `facets` rows, the first question the funnel asked was Subject, and
       there is no answer to Subject that keeps a tutor — a tutor has none, `filterHit` finds no
       value, and every tutor, venue and friend is dropped by the first tap. The Message control on
       a tutor's pass was reported missing; it was on the card, and the card could not be got to.

       WHY THE COVERAGE RULE DID NOT CATCH IT. `FACET_COVERAGE` refuses a question fewer than half
       the list can answer — and `subject` has 100% coverage, because 4,005 of the 4,007 items are
       questions. The library is now so much larger than everything else that ANY library facet
       looks universal. The rule is still right; it is measuring a list in which the minority is
       three items.

       SO `always` MEANS WHAT ITS NOTE SAYS IT MEANS. `What for` and `What kind` are DOORS — they
       take somebody from the whole app to a department — and a door that is asked third is a door
       behind two filters. The sheet still owns the order of the doors among themselves, and the
       order of everything else, and whether any of them is asked at all. What it cannot do is put a
       filter in front of a door, because that is not an ordering preference: it is a dead end for
       everything the filter cannot describe.

       NOT A THIRD SETTING. It is the flag that already exists, doing the other half of the job it
       was declared for. */
    .sort((a, b) => (b.always ? 1 : 0) - (a.always ? 1 : 0) || a.at - b.at);
  return FACET_LIVE;
}


/* ---------- WHAT A SPREADSHEET CELL IS ALLOWED TO DO TO THE FUNNEL --------------------------------
   A NUMBER FROM A SHEET IS WHATEVER SOMEBODY TYPED, and `Number('first')` is `NaN`, which is the
   most dangerous value either of these columns can hold — because `NaN` passes every check that
   was guarding them.

   `typeof NaN === 'number'` IS TRUE, so a mistyped `min_coverage` sailed through `nextFacet`'s
   `typeof facet.min === 'number'` test, and then `coverage < NaN` is FALSE, so the question was
   offered at ANY coverage. That is not a broken threshold, it is the coverage rule switched off —
   the trapdoor the long comment below `FACET_COVERAGE` exists to describe, reopened by a typo, on
   whichever question was mistyped, with nothing anywhere saying so.

   `a.at - b.at` WITH `NaN` RETURNS `NaN`, which a sort comparator reads as "equal", so a mistyped
   `sort_order` does not put the question last — it makes the order of the whole funnel depend on
   the engine's sort implementation.

   AND A HUMAN WILL TYPE 50 FOR A HALF. The column is a share from 0 to 1 and nothing said so at
   the point of typing; `50` means the question can never be asked, since no coverage exceeds 50.
   Read as a percentage instead, because that is unambiguously what was meant — nobody wants a
   question asked only when five thousand per cent of the rows can answer it. */
const facetNum_ = (v, fallback) => {
  const n = Number(v);
  return v === null || v === undefined || v === '' || !isFinite(n) ? fallback : n;
};

const facetMin_ = v => {
  const n = facetNum_(v, FACET_COVERAGE);
  if (n > 1) return Math.min(n / 100, 1);   /* typed as a percentage */
  return n < 0 ? 0 : n;
};

const facetBy = f => facetList().find(x => x.field === f) || FACETS.find(x => x.field === f);

/** Does one item satisfy one chosen filter? One comparison, because a facet says how to read
    itself — the old version had a switch with a case per field, which is a place to forget one. */
function filterHit(x, f) {
  const facet = facetBy(f.field);
  if (!facet) return true;
  /* ANY OF THEM COUNTS. A tutor is in Booking and in People, and choosing either has to keep them —
     an `===` against a joined string would have matched neither.
     ON THE IDENTITY, NOT THE TEXT. The chip holds the spelling that was DRAWN and the item holds
     whatever the sheet says, and after the folding above those are often not the same characters:
     a chip reading `1st Class Maths` has to find a row that says `1stclassmaths`. `norm` only
     lowercases and trims, so it would have found neither — see `spellKey_`. */
  /* ---------- A BAND MATCHES BY MEMBERSHIP, NOT BY LETTERS -------------------------------------
     `bandNumbers_` REPLACES `1`…`13` WITH `1\u201310` AND `11\u201320`, so the chip holds a range and the
     row holds a number and no amount of spelling reduction will ever make those equal. Tested
     through `bandOf_`, the same function that drew the label, so the drawer and the filter cannot
     disagree about where a band's edges are — which is the `documents_()` argument: a second
     reader of one thing is a second chance to disagree about it. */
  const band = /^(\d+)\u2013(\d+)$/.exec(String(f.value || ''));
  if (band) {
    return asList_(facet.of(x)).some(v => intAnswer_(v)
      && Number(v) >= Number(band[1]) && Number(v) <= Number(band[2]));
  }
  return asList_(facet.of(x)).some(v => spellKey_(v) === spellKey_(f.value));
}

/**
 * THE SHORTEST FORM OF A NAME THAT IS STILL UNIQUE AMONG THE NAMES BESIDE IT.
 *
 * REPORTED AS "it should say paper 1 paper 2 paper 3". What it said, six chips deep on Maths ·
 * GCSE · Higher · Summer 2017, was:
 *
 *     Paper 1 (Non-Calculator) — May 2017
 *     Paper 2 (Calculator) — June 2017
 *     Paper 3 (Calculator) — June 2017
 *
 * EVERY WORD AFTER THE NUMBER IS SOMETHING THE PERSON HAS ALREADY ANSWERED. They chose the sitting
 * one question ago, so "— May 2017" is the funnel reading their own chip back to them, three times,
 * in three different spellings — and it is the spelling that caused the complaint before this one,
 * because the sitting chip says `Summer 2017` and the answers underneath it say May and June.
 *
 * THE NAME IS A COMPOSITE AND ITS SEPARATORS SAY WHERE TO CUT. `Paper 1 (Non-Calculator) — May
 * 2017` is a number, a qualifier and a date, in that order, and the same shape holds for
 * `Paper 2A: Study of religion (Christianity) — June 2017` and for a venue called
 * `St Mary's Hall (Room 2)`. So the forms are the whole name cut at each separator, and the ladder
 * is tried shortest-first.
 *
 * UNIQUENESS IS THE ONLY THING THAT STOPS IT, and it is measured over the answers on screen rather
 * than declared. Narrowed to maths the three answers are `Paper 1`, `Paper 2`, `Paper 3`. Widen to
 * the whole of Summer 2017 and the RS papers join them, so `Paper 1` would be two different papers
 * on one button — the "one answer wearing two coats" fault `check-funnel.js` fails the build on —
 * and the rule falls back a rung to `Paper 1 (Non-Calculator)` / `Paper 1: Philosophy of religion
 * and ethics`. Measured both ways.
 *
 * IT NEVER INVENTS A WORD. Every form is a prefix of a name somebody typed, which is the same
 * argument as the spelling vote above: `Hcf And Lcm` is what happens when code writes the label.
 *
 * `value` IS UNTOUCHED, and that is the half that makes it safe. `filterHit` matches the chip
 * against `facet.of(x)` through `spellKey_`, so a chip holding a SHORTENED name would find nothing
 * — narrowing by paper would silently return an empty list. The row carries the full name in
 * `data-value` and the short one in its text, which is exactly how `spellShow_` already separates
 * the two.
 *
 * ON EVERY FACET, NOT ON THE ONE THAT PROMPTED IT — the `cost: 0` / `paper: true` lesson, twice
 * recorded. A name with no separator in it has one form and comes back unchanged, so every
 * one-word answer in the app (`Maths`, `Higher`, `Summer 2017`) is untouched by construction.
 */
function nameForms_(s) {
  const full = String(s == null ? '' : s).trim();
  const out = [];
  const cut = re => {
    const m = re.exec(full);
    if (!m || !m.index) return;
    const v = full.slice(0, m.index).trim();
    if (v && v !== full && out.indexOf(v) === -1) out.push(v);
  };
  /* AN EM DASH WITH SPACES ROUND IT, and an en dash for the same reason. NOT a plain hyphen: this
     library writes `A-Level` and `Capture-recapture`, and cutting at those would offer `A` as an
     answer. A dash that is a separator is spaced and long; a dash inside a word is neither. */
  cut(/\s[—–]\s/);
  cut(/\s*[:(]/);
  out.sort((a, b) => a.length - b.length);
  out.push(full);
  return out;
}

/* Sets `show` on each value in place. Ascending rungs, first one where every label is distinct —
   and the last rung is always the full name, which is distinct by construction because these are
   the keys of a tally. */
function shortLabels_(values) {
  const forms = values.map(v => nameForms_(v.value));
  let deepest = 0;
  forms.forEach(f => { if (f.length > deepest) deepest = f.length; });
  for (let rung = 0; rung < deepest; rung++) {
    const at = forms.map(f => f[Math.min(rung, f.length - 1)]);
    if (new Set(at).size === at.length) {
      values.forEach((v, i) => { v.show = at[i]; });
      return values;
    }
  }
  values.forEach(v => { v.show = v.value; });
  return values;
}

/**
 * A LONG LIST OF PLAIN NUMBERS IS ASKED IN TENS.
 *
 * REPORTED WITH A SCREENSHOT: "look what happens when the options are too long. there should be a
 * filter to fix this. e.g. q1-10, q11-20." — thirteen rows reading `1`, `2`, `3` … down past the
 * bottom of the phone, each one a tap target the height of a button and none of them any easier to
 * choose between than the number beside it.
 *
 * THE CAP DID NOT CATCH IT AND SHOULD NOT HAVE. `FACET_MAX_ANSWERS = 40` is about a list nobody can
 * READ — 212 paper names — and thirteen numbers are perfectly readable. They are just not worth
 * thirteen rows, because **a run of consecutive integers is the one answer set where the reader
 * already knows what is in the gaps.** Nobody scans 1…13 to find out whether 7 is there.
 *
 * SO IT IS NOT A NEW CAP, IT IS A DIFFERENT SHAPE FOR ONE KIND OF ANSWER. Every value has to be a
 * plain non-negative integer — `1`, not `1a`, not `Grade 4`, not `Paper 1` — and there have to be
 * more than `FACET_BAND_AT` of them. Anything else falls straight through, so subjects, topics,
 * papers and sittings are untouched by construction. Measured before writing it: of the twenty-odd
 * facets, only the sheet-invented `question` column is all-integer.
 *
 * TENS, AND NOT A COMPUTED BUCKET SIZE. An exam paper is numbered 1 to about 25 and a person asks
 * for "the first ten" or "the twenties" — those are the words, and a band of 7 chosen to make the
 * columns even would be arithmetic nobody asked for. Bands are aligned to the ten, so the first is
 * `1–10` rather than `1–10` sliding with wherever the data starts, and an empty band is never
 * drawn because it is built from the values that exist.
 *
 * AND THE BAND IS A REAL ANSWER, NOT A VIEW. It becomes a chip with the same ✕, and `filterHit`
 * tests membership rather than equality — see the note there. Answering `11–20` and then being
 * asked again, now with ten ordinary numbers, is the funnel doing what it always does: ask the
 * question the list in front of it deserves.
 */
const FACET_BAND_AT = 12;
const FACET_BAND_BY = 10;

/* A plain non-negative integer and nothing else. `+v` alone would accept ` 4 `, `4.0` and `1e3`,
   and `parseInt` would accept `4a` — which is a real value in this library, because an exam
   question is numbered `4a`. The test has to be on the characters. */
const intAnswer_ = v => /^\d+$/.test(String(v == null ? '' : v).trim());

/* THE BAND A NUMBER FALLS IN, as a label. One function so the drawer and `filterHit` cannot
   disagree about where the edges are — the fault this file records under `documents_()`. */
function bandOf_(n) {
  const lo = Math.floor((n - 1) / FACET_BAND_BY) * FACET_BAND_BY + 1;
  return lo + '\u2013' + (lo + FACET_BAND_BY - 1);
}

function bandNumbers_(values) {
  if (values.length <= FACET_BAND_AT) return values;
  if (!values.every(v => intAnswer_(v.value))) return values;
  const by = {};
  values.forEach(v => {
    const k = bandOf_(Number(v.value));
    if (!by[k]) by[k] = { value: k, n: 0, band: true, lo: Number(v.value) };
    by[k].n += v.n;
    by[k].lo = Math.min(by[k].lo, Number(v.value));
  });
  return Object.keys(by).map(k => by[k]).sort((a, b) => a.lo - b.lo)
    .map(b => ({ value: b.value, show: b.value, n: b.n }));
}

/** The distinct values of one facet across a set, with how many each would leave. */
/* ---------- THE FIRST QUESTION IS NOT ALPHABETICAL ------------------------------------------------
   EVERY FACET SORTS ITS ANSWERS BY NAME, which is right for subjects, venues, exam boards and
   everything else: there is no reason to prefer one of forty tutors, and alphabetical is the order
   somebody can predict.

   "WHAT FOR" IS THE EXCEPTION. Its answers are the app's departments, and they have an order that
   is about what people come here to do rather than about their initials — Booking first because it
   is the errand that costs money, Links high because it is a shortcut somebody wants in one tap.
   Alphabetically it ran Booking, Friends, Games, Learning, Links, People, Shop, Tools, which put
   two of the least-used first.

   ANYTHING NOT LISTED FALLS TO THE END, alphabetically among itself, so a group added tomorrow
   appears without needing a line here. */

/* ==================================================================================================
   ONE ANSWER, ONE BUTTON, WHATEVER IT IS SPELLED LIKE.

   THIS FAULT HAS NOW ARRIVED IN FOUR COLUMNS AND BEEN REPAIRED BY HAND IN THREE:

     `level`     `Alevel`, `A-level`, `A-Level` — three answers on one screen, fixed in `levelOf_`
     `exam_wave` `June 2018` against `First wave` — fixed in `waveOf`
     `topics`    46 of 389 values differ from another only by case — fixed by a vote in `topicOf_`
     `company`   `1stclassmaths` on 1,372 rows and `1st class maths` on 109 — invisible only
                 because the funnel lists questions and every question row used the first

   EACH FIX WAS TO THE INSTANCE AND NONE WAS TO THE RULE, which is the exact sentence this file
   already carries about `cost: 0` and `paper: true`. The fourth one was waiting in a column nobody
   had looked at, and the fifth will be in a column added next month.

   SO IT IS A RULE NOW, AND IT IS TWO LINES. An answer's IDENTITY is its letters and digits; its
   SPELLING is whichever of the variants is most worth showing. `facetTally_` folds the variants
   together when it counts, and `filterHit` matches on the identity rather than the text — so a chip
   saved as `A-Level` still finds an item that says `Alevel`, and there is no migration, no
   vocabulary list and nothing to keep in step with the next bulk import.

   WHICH SPELLING WINS, in order, and every rule in it is about not inventing a word:

     THE ONE A PERSON WOULD WRITE.  `1st Class Maths` over `1stclassmaths`, `A-Level` over `Alevel`.
     Counted as separators — spaces and hyphens — because a squashed spelling is a machine's (a
     slug, an id, a filename) and a spaced one was typed by somebody. This is the half a plain vote
     gets wrong: `1stclassmaths` outnumbers `1st class maths` by twelve to one and is still not the
     publisher's name.

     THEN THE COMMONEST, then the alphabet — so the answer never depends on the order the file
     happens to be in, which is the sort of dependency that changes a button's label on an unrelated
     commit.

     AND THE FIRST LETTER IS RAISED, which is the one thing neither test should decide. `estimation`
     outnumbers `Estimation` in the library, and a lower-case button in a column of capitalised ones
     reads as a fault in the data. Only the first letter, never the interior words: `HCF and LCM`
     stays as somebody typed it, which is the whole reason Title Case was rejected for this job —
     `Hcf And Lcm` is a spelling nobody has ever written.

   IT FOLDS WITHIN THE LIST ON SCREEN, not against the whole library, and that is deliberate rather
   than a shortcut: `facetTally_` is already walking exactly the items whose answers are about to be
   drawn, so the spelling shown is one that is actually in front of you. Narrowing cannot change
   which ITEMS an answer holds — the identity does that — only which of its spellings is on the
   button, and after the first-letter rule the variants differ by so little that it is not visible.

   `check-funnel.js` TEST 2 CANNOT FIRE AGAIN, and that is the point rather than a loss. It looks
   for two values in one facet that reduce to the same key; `spellKey_` is that same reduction, so
   the fault is now impossible instead of detected. A check that cannot fail is not a check — this
   one is kept because it also guards the facets a spreadsheet invents at runtime, where the wrapper
   below is the only thing standing between the sheet and the screen.
================================================================================================== */
const spellKey_ = v => String(v == null ? '' : v).toLowerCase().replace(/[^a-z0-9]/g, '');

/* HOW MANY PIECES THE WRITER BROKE IT INTO. Not a score out of ten — just "did a person put gaps in
   this", which is what tells a name from a slug. */
const spellGaps_ = v => (String(v).match(/[\s\-_/&.,()]/g) || []).length;

function spellBetter_(a, b) {
  if (!a) return b;
  if (!b) return a;
  const ga = spellGaps_(a.value), gb = spellGaps_(b.value);
  if (ga !== gb) return ga > gb ? a : b;
  if (a.n !== b.n) return a.n > b.n ? a : b;
  return cmpText(a.value, b.value) <= 0 ? a : b;
}

const spellShow_ = v => String(v).charAt(0).toUpperCase() + String(v).slice(1);

/* ==================================================================================================
   `facetTally_` — ONE WALK OF THE LIST PER QUESTION, NOT THREE.

   THE FUNNEL ASKS THREE THINGS OF EVERY FACET and each used to walk the whole list on its own:
   `facetValues` (what are the answers), `facetCoverage` (how many can answer at all) and
   `facetSplit_` (how lopsided is it — which then called `facetValues` a fourth time). `nextFacet`
   runs all three per candidate, so drawing one screen walked 4,045 items twenty-one times over,
   three times each. MEASURED: 93 ms to draw the question, and the whole of it was this.

   ALL THREE COME OUT OF ONE TALLY, because they are three readings of the same count: the keys are
   the answers, the number of items that contributed at least one key is the coverage, and the share
   outside the biggest key is the split. Nothing is approximated — the three functions below return
   exactly what they returned before and every caller is untouched, including `check-funnel.js`.

   HELD BY THE ARRAY'S OWN IDENTITY. `stuffFiltered` hands the same array to everything that draws
   one screen, so a `WeakMap` on it is a cache with no key to get wrong and no lifetime to manage: a
   new list is a new array and the old tallies are collected with it. That is the same test
   `stuffFiltered` already makes against `DATA`, one level down.
================================================================================================== */
const FACET_TALLY = new WeakMap();

function facetTally_(items, facet) {
  let perList = FACET_TALLY.get(items);
  if (!perList) { perList = {}; FACET_TALLY.set(items, perList); }
  const had = perList[facet.field];
  /* KEYED ON THE FACET OBJECT AS WELL AS ITS NAME. `facetList()` rebuilds when the `facets` tab
     changes, and a relabelled facet with a new `of` under an old name would otherwise read a stale
     tally — the same identity test, one level further in. */
  if (had && had.facet === facet) return had;

  const by = {};
  let answered = 0;
  items.forEach(x => {
    /* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. A tutor answers `What for` with both Booking and
       People, so it is a tally mark against each — which is what makes the count behind an answer
       true: choosing People really would leave that tutor in it. `Set` because a row that somehow
       lists the same group twice must not count twice. */
    const vals = asList_(facet.of(x));
    if (!vals.length) return;
    answered++;
    new Set(vals).forEach(v => { by[v] = (by[v] || 0) + 1; });
  });

  const rank = v => {
    const ord = groupOrder_();
    const i = ord.indexOf(v);
    return i === -1 ? ord.length : i;
  };
  /* ---------- AND AN ANSWER THAT IS A DATE SORTS AS A DATE ---------------------------------------
     THE SITTINGS CAME OUT ALPHABETICALLY AND IT READ AS BROKEN. June 2017, June 2018, June 2019,
     June 2020, June 2023, June 2024, November 2017, November 2018, November 2019 — every June
     stacked before any November, 2024 sitting above 2017, and each academic year split in half
     down a list nobody could scan.

     `cmpText` IS RIGHT ABOUT EVERYTHING ELSE and the note above says why: there is no reason to
     prefer one of forty tutors, and alphabetical is the order somebody can predict. A date is the
     exception because it HAS an order, and it is not the one its letters give.

     THE TEST IS ON THE ANSWERS, NOT ON THE FACET. Nothing here knows that `examWave` is a sitting —
     it asks whether every answer in front of it parses as `<Month> <year>`, and sorts by the date
     if they all do. So a `facets` row inventing a question over any dated column gets the same
     treatment with nothing added, and a facet with one date and nine words falls straight through
     to the alphabet rather than sorting nine things by a rule that fits one.

     NEWEST FIRST, and that is the half that is a judgement rather than arithmetic. Chronological
     either way fixes the June/November split; which end leads is a choice, and the newest paper is
     the one closest to the specification somebody is actually sitting — which is why every
     past-paper site on earth lists them that way. One `-` on the line below flips it. */
  const dateKey_ = v => {
    const m = /^([A-Za-z]+)\s+((?:19|20)\d{2})$/.exec(String(v));
    if (!m) return null;
    /* A SEASON IS A POSITION IN THE YEAR TOO. `seriesOf_` names most sittings "Summer 2017" and
       "Autumn 2017" rather than by a month, and a rule that only knows the twelve months would
       have read those as words, found `allDates` false, and put the whole list back in the
       alphabet — undoing this sort silently the moment the series were renamed. */
    const i = SERIES_AT[m[1]] !== undefined ? SERIES_AT[m[1]] - 1 : MONTH_NAMES.indexOf(m[1]);
    return i === -1 ? null : Number(m[2]) * 12 + i;
  };
  const answers = Object.keys(by);
  const allDates = answers.length > 1 && answers.every(v => dateKey_(v) !== null);

  const order = facet.field === 'forLabel'
    ? (a, b) => (rank(a) - rank(b)) || cmpText(a, b)
    : allDates
    ? (a, b) => dateKey_(b) - dateKey_(a)
    : cmpText;
  /* ---------- THE VARIANTS ARE FOLDED HERE, BEFORE ANYTHING COUNTS THEM ---------------------------
     BEFORE, NOT AFTER, because every number below is read off this list: the answers the funnel
     draws, the coverage, and the split that decides whether the question is asked at all. Two
     spellings of one answer counted apart make a question look more balanced than it is — which is
     the same arithmetic fault as `paper: true`, reached from the other direction. See the block
     above for which spelling wins. */
  const folded = {};
  Object.keys(by).forEach(v => {
    const k = spellKey_(v);
    if (!k) return;
    const seen = folded[k];
    const best = spellBetter_(seen && seen.best, { value: v, n: by[v] });
    folded[k] = { best: best, n: (seen ? seen.n : 0) + by[v] };
  });
  let values = Object.keys(folded)
    .map(k => ({ value: spellShow_(folded[k].best.value), n: folded[k].n }))
    .sort((a, b) => order(a.value, b.value));
  /* ---------- AND THE LABEL IS THE SHORTEST FORM THAT IS STILL UNIQUE ---------------------------
     `show` IS WHAT IS DRAWN; `value` GOES ON STILL BEING WHAT IS MATCHED. See `shortLabels_`. */
  shortLabels_(values);
  /* ---------- AND A LONG LIST OF PLAIN NUMBERS IS ASKED IN TENS ---------------------------------
     See `bandNumbers_`. Applied AFTER the labels, because a band replaces the answers rather than
     relabelling them, and BEFORE the counts below, because the split and the coverage that decide
     whether the question is asked at all are read off this list. */
  values = bandNumbers_(values);

  let top = 0;
  values.forEach(v => { if (v.n > top) top = v.n; });

  const out = {
    facet: facet,
    values: values,
    coverage: items.length ? answered / items.length : 0,
    /* ---------- HOW MUCH OF THE LIST THE COMMONEST ANSWER DOES *NOT* KEEP ------------------------
       THIS WAS `(total - top) / total` — the share of the TALLY outside the biggest answer — and
       that denominator is wrong the moment a facet can return more than one value.

       MEASURED, ON A REAL STATE OF THE REAL FUNNEL. Learning · Questions · Maths · GCSE · Worksheet
       leaves 1,331 items, and `Key stage` there scored 35.4% — five times the floor, comfortably
       "worth asking". Then picking its commonest answer left 1,314 of the 1,331. A tap that removes
       seventeen things out of thirteen hundred, offered as the next question, looking healthy to
       the one rule written to stop exactly that.

       THE CAUSE IS THE TALLY COUNTING AN ITEM ONCE PER ANSWER, which is right and is what makes the
       counts beside the answers true — a worksheet tagged `KS3, KS4` really is in both. But it
       means `total` is bigger than the list, so a facet where nearly everything answers the
       commonest AND something else scores well on a share of a number that is not the list.

       SO THE QUESTION IS ASKED OF THE LIST, WHICH IS WHAT IT WAS ALWAYS ABOUT: press the biggest
       answer — what is left? For a single-valued facet with full coverage this is arithmetically
       the same number as before, which is why nothing that was working changes. It differs exactly
       where the old one was lying.

       THIS IS THE THIRD TIME THIS SHAPE HAS BEEN WRITTEN DOWN — `cost: 0`, then `paper: true`, and
       both were fixed in the data while the rule stayed as it was. The rule is the fix. */
    split: values.length < 2 || !items.length ? 0 : (items.length - top) / items.length,
  };
  perList[facet.field] = out;
  return out;
}

/** The distinct values of one facet across a set, with how many each would leave. */
function facetValues(items, facet) {
  return facetTally_(items, facet).values;
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
function facetCoverage(items, facet) {
  return facetTally_(items, facet).coverage;
}

/* HOW MUCH OF THE SET A QUESTION HAS TO COVER BEFORE IT IS WORTH ASKING. */
const FACET_COVERAGE = 0.5;

/* ---------- A QUESTION WITH FORTY ANSWERS IS NOT A QUESTION, IT IS THE LIST -----------------------
   THERE HAS NEVER BEEN AN UPPER BOUND on how many answers a facet may offer, and until now there
   did not need to be: every facet was written in code by somebody looking at the data. The sheet
   can invent one now — see `facetFromSheet_` — and `field: name` reads the name off every item,
   which is 3,265 distinct answers presented as a multiple-choice question.

   THE RULE IS THE SAME FOR THE CODE'S OWN FACETS, deliberately. A question that has grown past
   forty answers has stopped narrowing anything, whoever wrote it; `Subject` is about twenty and
   `Division` seventeen, so nothing real is near this. A list of forty is what the search box is for.

   NOT CONFIGURABLE. A second number in the sheet is a second thing to get wrong, and the honest
   answer to "my question is not showing" is `whyThisQuestion()`, which names this by name. */
const FACET_MAX_ANSWERS = 40;
/* ---------- HOW MANY ANSWERS ARE DRAWN, WHICH IS NOT HOW MANY MAKE A QUESTION ASKABLE ------------
   REPORTED AS "when there are more than 7ish it gets clipped by the widget container". Measured
   against the real library: `Sitting` offers 16 answers, `Year` 9 and `Grade` 8 at the top, and
   `Topic` (343) and `Paper` (242) both fall under FACET_MAX_ANSWERS as the list narrows and are
   then drawn whole. Every one of those runs past the bottom of the card.

   TWO DIFFERENT NUMBERS FOR TWO DIFFERENT JOBS, and conflating them is what made this a bug.
   FACET_MAX_ANSWERS asks "is this a question at all" -- 212 paper names is not multiple choice --
   and it belongs where it is. This asks "how many fit on the card", which is a fact about the
   card, and it is the same trim `overFacet_` was already doing for the oversized ones. Applying it
   to every facet is the `cost: 0` lesson one more time: a rule written for the case that annoyed
   somebody comes back wearing the next facet's name.

   THE REST ARE NOT HIDDEN. The line below the rows names how many are left and points at the
   search box, which is on the same page and filters the same items -- that machinery already
   existed for the oversized case and needed nothing added. */
const FACET_MAX_SHOWN = 7;

/* ---------- AND A QUESTION EVERYBODY ANSWERS THE SAME WAY IS NOT A QUESTION EITHER ----------------
   THE COUNT RULE ABOVE CATCHES A QUESTION WITH TOO MANY ANSWERS. Nothing caught the opposite: a
   question with two answers where one of them holds the entire list. `nextFacet` asked whether two
   different answers EXIST and whether half the items can answer — never whether answering it
   actually splits anything.

   THIS HAS NOW HAPPENED TWICE, WITH THE SAME SHAPE BOTH TIMES.

     `cost: 0`      3,262 of 3,265 items answered `Free`, so the Free bucket meant "everything".
                    CLAUDE.md records it. Fixed in the DATA, via `priced_`.
     `paper`        3,753 of 3,770 items answered `Printed`, because `questionItems` wrote
                    `paper: true` on every one of them. Fixed by deleting the facet.

   BOTH FIXES WERE TO THE INSTANCE AND NEITHER WAS TO THE RULE, which is why the second one was
   able to sit in the funnel being asked of everybody, on every search, narrowing nothing, while
   twenty-two checks stayed green. A rule that is only ever applied by hand is not a rule.

   MEASURED AGAINST THE REAL LIBRARY, so the number is not a guess. The share of the biggest answer
   among the items that can answer at all:

     paper      99.5%   <- a literal, not a fact about anything
     level      93.9%   GCSE dwarfs A-Level, and the question is still worth asking
     subject    91.3%   Maths dwarfs the rest, and the question is still worth asking

   SO THE CAP IS NOT ABOUT THE BIGGEST ANSWER, IT IS ABOUT THE REST. `Subject` earns its place
   because the 8.7% who want Physics get a real narrowing from it; `Printed?` does not, because
   everything outside its biggest answer is 0.45% of the list and those 17 are widgets. The test is
   therefore on the MINORITY: unless at least one in fifty of the items that can answer land
   somewhere other than the biggest bucket, the question cannot narrow and is skipped.

   A SHARE, NOT A COUNT, BECAUSE THE LIST SHRINKS. Once the funnel has narrowed to twenty items a
   two-way split of nineteen-to-one is still a real distinction between real things; the same split
   across four thousand is a rounding error with a button on it.

   SELF-CORRECTING, LIKE THE COVERAGE RULE ABOVE IT. A question that cannot narrow the whole library
   starts being offered the moment the list is small enough for its answers to matter — so this
   never permanently hides anything, it only declines to ask it too early. */
const FACET_MIN_MINORITY = 0.02;

/* Does answering this actually split the list? The share of answerable items that do NOT give the
   commonest answer. Counted over values, not items, so a thing answering `Booking` and `People`
   is a mark against each — the same tally `facetValues` builds the counts beside the buttons from,
   so the number a person sees and the number this decides on are the same number. */
function facetSplit_(items, facet) {
  return facetTally_(items, facet).split;
}

/**
 * THE NEXT QUESTION WORTH ASKING, or nothing.
 *
 * Three reasons to skip one, and the third is the one that matters:
 *
 * ALREADY ANSWERED. Obvious.
 *
 * EVERYTHING AGREES. A list with one entry is a tap that changes nothing, and three of those in a
 * row is what makes a filter feel like paperwork.
 *
 * MOST OF THEM CANNOT ANSWER IT. This is not about usefulness — it is about damage. Choosing a
 * value excludes every item with NO value for that field, and it does so silently: they do not
 * fail to match, they were never asked. On this library `exam_board` is filled on 26% of rows and
 * on 3% of past papers, so offering it and having somebody tap "Edexcel" takes them from four
 * hundred resources to a hundred and seven, with three hundred and eight vanishing for a reason no
 * screen mentions. That is not a filter, it is a trapdoor.
 *
 * Half is the line. Below it, a question is doing more harm by being asked than good by being
 * answered — and the rule is SELF-CORRECTING, which is what makes it better than reordering: once
 * you have narrowed to the rows that do carry a board, its coverage rises and it starts being
 * offered. The sparse questions arrive exactly when they stop being sparse.
 */
/**
 * A QUESTION WHOSE ANSWERS ARE ONLY UNIQUE INSIDE ANOTHER QUESTION'S ANSWER.
 *
 * REPORTED AS "it seems there are two question 1s for summer? maybe it hasn't distinguished the 3
 * papers?" — and the library had distinguished them perfectly. Measured at that exact state
 * (Learning · Questions · Maths · KS4 · Higher · Summer 2017, 88 questions), `Question number = 1`
 * matches **seven rows across three different papers**: Paper 1's Q1a–d, Paper 2's Q1, and Paper
 * 3's Q1a–b. Nothing is duplicated. "Question 1" is simply not a thing until you have said which
 * paper, and the funnel was offering it as though it were.
 *
 * THIS IS NOT AN ORDERING PREFERENCE, WHICH IS WHY IT IS IN CODE. The `facets` sheet owns `at` and
 * should: which question somebody wants asked first is a judgement. **Whether an answer means one
 * thing is not** — it is the same distinction `always` draws for doors, one level down. A sheet
 * can put `question` at order 1 and the funnel will still not ask it until `paperId` is answered,
 * because before that the answer `1` names seven questions and the person pressing it cannot know.
 *
 * AND THE FACET IS THE SHEET'S, NOT THE CODE'S — measured, `facetList()` has no `qNumber`, so the
 * chip in the screenshot is `facetFromSheet_` reading the `question` column. Both spellings are
 * named here because the sheet may use either, and a rule that only covers the code's own facets
 * would not have covered the one that actually caused this.
 *
 * `part` NEEDS BOTH. Part `a` means nothing without a question number, which means nothing without
 * a paper — so it names the rung below it and the chain resolves itself.
 */
const FACET_NEEDS_FIRST = {
  question: 'paperId',
  qNumber:  'paperId',
  part:     'question',
  qPart:    'qNumber',
};

function nextFacet(items) {
  const asked = STUFF.filters.map(f => f.field);
  /* ---------- A BAND IS HALF AN ANSWER, SO THE QUESTION IS ASKED AGAIN -------------------------
     `11\u201320` narrows to ten questions and does not say which. Treating it as answered would make
     the band a dead end — the list is small enough to name a question and the funnel would refuse
     to, which is the "Nothing left to narrow" complaint `overFacet_` was written for. So a facet is
     "asked" only when its answer is a single value; a band leaves it open and the next draw offers
     the ten numbers inside it, which are now under `FACET_BAND_AT` and drawn plainly. */
  const settled = STUFF.filters
    .filter(f => !/^\d+\u2013\d+$/.test(String(f.value || '')))
    .map(f => f.field);

  for (const facet of facetList()) {
    if (settled.indexOf(facet.field) !== -1) continue;
    /* ---------- NOT UNTIL THE QUESTION IT HANGS OFF HAS BEEN ANSWERED ---------------------------
       See `FACET_NEEDS_FIRST`. Skipped rather than reordered: reordering would ask it later and
       still ask it of a list holding three papers, which is the same wrong answer further down. */
    const first = FACET_NEEDS_FIRST[facet.field];
    if (first && asked.indexOf(first) === -1) continue;
    const vals = facetValues(items, facet).length;
    if (vals < 2 || vals > FACET_MAX_ANSWERS) continue;
    /* THE THRESHOLD IS THE FACET'S OWN, falling back to the one below. A question the sheet has
       given a lower bar to is one somebody decided is worth asking early even though it is thin. */
    const min = isFinite(facet.min) ? facet.min : FACET_COVERAGE;
    if (facetCoverage(items, facet) < min) continue;
    /* AND IT HAS TO SPLIT SOMETHING. See `FACET_MIN_MINORITY` — two answers where one of them is
       the whole list is a tap that changes nothing, which is the same complaint the "everything
       agrees" rule above makes about one answer, one step less obvious. */
    if (!facet.always && facetSplit_(items, facet) < FACET_MIN_MINORITY) continue;
    return facet;
  }
  return null;
}

/* ==================================================================================================
   AND WHEN NOTHING QUALIFIES, THE CLOSEST THING TO A QUESTION RATHER THAN A DEAD END.

   MEASURED, AND IT IS THE STATE THE WHOLE OF THIS STARTED FROM. Learning · Questions · Maths ·
   Worksheet · KS2, with School year skipped: 1,070 questions left, `Topic` holding 48 answers, and
   the screen saying "Nothing left to narrow." Every other facet is exhausted and the one that is
   not is barred by `FACET_MAX_ANSWERS` — a question about the only thing left, refused for being
   eight answers too long.

   THE CAP IS RIGHT AND IT IS ABOUT READING, NOT ABOUT NARROWING. `field: name` is 212 paper names
   and nobody can choose from 212 buttons; that is why the cap exists and it has not changed. What
   was wrong was treating "too long to read all at once" as "not a question", when the two are
   different problems with different answers — the first is solved by showing fewer, and the funnel
   was solving it by showing none.

   THIS USED TO HAVE A DOOR AND IT WAS THE WRONG SHAPE. A line above the funnel offered "or the 48
   topics these are in", which is the same information as a sentence you had to decode, sitting
   above the question rather than being one. It is gone — see the note where `collectionAxes_` was —
   and this is what replaces it: the funnel simply asks, and draws as many answers as anybody can
   read.

   FEWEST ANSWERS WINS, because it is the one closest to being an ordinary question. Everything else
   a facet has to pass is unchanged: not asked, enough coverage, and it must still narrow.
================================================================================================== */
function overFacet_(items) {
  const asked = STUFF.filters.map(f => f.field);
  let best = null;
  for (const facet of facetList()) {
    if (asked.indexOf(facet.field) !== -1) continue;
    const vals = facetValues(items, facet).length;
    if (vals <= FACET_MAX_ANSWERS) continue;
    const min = isFinite(facet.min) ? facet.min : FACET_COVERAGE;
    if (facetCoverage(items, facet) < min) continue;
    if (!facet.always && facetSplit_(items, facet) < FACET_MIN_MINORITY) continue;
    if (!best || vals < best.n) best = { facet: facet, n: vals };
  }
  return best ? best.facet : null;
}

/* ==================================================================================================
   `whyThisQuestion()` — THE FUNNEL, SHOWING ITS WORKING.

   WHY THIS EXISTS. The funnel picks the next question with `nextFacet` above, and the rule is not
   a rule about MEANING — it is arithmetic over whatever happens to be in the list right now:

     ask it only if two or more different answers exist, and
     ask it only if at least half the current results can answer it at all.

   THAT IS A GOOD RULE AND IT FEELS RANDOM FROM OUTSIDE, because the same data reached two ways asks
   two different questions. Narrow to Maths and `Exam board` appears; narrow to Maths and Boxing
   together and it does not, because half the list has no board. Nothing on screen says so, so it
   reads as the app changing its mind.

   EVERY LAYOUT FAULT IN THIS APP WAS FIXED BY ASKING THE BROWSER RATHER THAN READING THE CODE —
   `layout()` exists for exactly that, and CLAUDE.md says so at length. This is the same instrument
   pointed at the funnel: it prints, for the list you are looking at, every question in order and
   the number that decided it. No guessing about why `Tier` did not come up.

     whyThisQuestion()          the list you are actually looking at
     whyThisQuestion(true)      the whole pile, ignoring what you have already answered

   READ THE `why` COLUMN. `asked` means you already answered it. `1 answer` means everything left
   agrees, so the question has nothing to decide. `thin` means it is below its coverage bar — the
   number beside it is how many of the current results could answer, and the bar it missed.
================================================================================================== */
function whyThisQuestion(all) {
  const items = all ? stuffItems() : stuffFiltered();
  const asked = STUFF.filters.map(f => f.field);
  /* BUILT AS STRINGS, NOT WITH `%s`. `console.log`'s format substitution is the browser's, and
     anything else reading this output — a test harness capturing console, a copy-paste into a
     message — gets the literal `%-14s` instead. This is meant to be pasted. */
  const pad = (v, n) => (String(v) + '                  ').slice(0, n);
  const num = (v, n) => ('        ' + String(v)).slice(-n);
  console.log('');
  console.log(items.length + ' result(s) in hand'
              + (asked.length ? '   answered: ' + asked.join(', ') : '   nothing answered yet'));
  console.log('');
  console.log('  ' + pad('field', 14) + pad('label', 18)
              + num('answers', 8) + num('cover', 7) + '  why');
  let chosen = null;
  facetList().forEach(f => {
    const vals = facetValues(items, f);
    const cov = facetCoverage(items, f);
    const min = isFinite(f.min) ? f.min : FACET_COVERAGE;
    let why;
    if (asked.indexOf(f.field) !== -1) why = 'asked already';
    else if (vals.length < 2) why = (vals.length ? 'one answer' : 'nobody can answer it')
                                    + ' — nothing to decide';
    else if (vals.length > FACET_MAX_ANSWERS)
      why = 'too many answers — that is a list, not a question (max ' + FACET_MAX_ANSWERS + ')';
    else if (cov < min) why = 'thin — needs ' + Math.round(min * 100) + '%';
    /* THE NEW RULE HAS TO BE VISIBLE HERE OR IT IS THE OLD FAULT WEARING A HAT. A question that
       vanishes for a reason nothing prints is exactly what `whyThisQuestion` was written for. */
    else if (!f.always && facetSplit_(items, f) < FACET_MIN_MINORITY)
      why = 'lopsided — pressing its commonest answer would leave '
            + Math.round(facetSplit_(items, f) * 1000) / 10 + '% of the list, needs '
            + Math.round(FACET_MIN_MINORITY * 100) + '%';
    else if (!chosen) { why = '← THIS ONE'; chosen = f.field; }
    else why = 'would do, but comes after ' + chosen;
    console.log('  ' + pad(f.field + (f.fromSheet ? ' *' : ''), 14) + pad(f.label, 18)
                + num(vals.length, 8) + num(Math.round(cov * 100) + '%', 7) + '  ' + why);
  });
  if (!chosen) console.log('\n  nothing left to ask — the list is the answer');
  if (facetList().some(f => f.fromSheet)) {
    console.log('  * invented in the `facets` tab rather than written in code — see facetFromSheet_');
  }
  console.log('');
  /* THE VALUES TOO, for the one it chose, because "seven answers" and WHICH seven are different
     facts and the second is the one you act on. */
  if (chosen) {
    const f = facetList().find(x => x.field === chosen);
    console.log('  ' + f.label + ': ' + facetValues(items, f)
      .map(v => v.value + ' (' + v.n + ')').join(', '));
    console.log('');
  }
  return chosen;
}


/* THE RESOURCES, flattened out of where the payload actually puts them.

   `DATA.resources` does not exist — I had been reading a key nothing sends, which is why the
   section was empty. They live nested in `dropdowns.checklists`, keyed by subject and then by
   band, because that is the shape the checklist needs them in.

   Flattened here rather than changed at the source: the checklist wants them nested and this wants
   them flat, and a payload that carries the same four hundred rows twice to satisfy both would be
   a waste of every phone's morning. */
/* WALKED ONCE PER PAYLOAD, not once per caller.
   Four hundred resources live three levels deep in `dropdowns.checklists`, and eight different
   things ask for them flat — the shop list, the wardrobe, the checklist, `topicBy` twice in one
   lookup. Each call rebuilt all four hundred objects. Cached against the payload itself, so it is
   rebuilt exactly when the data changes and never otherwise. */
let TOPICS_MEMO = { from: null, list: null };

/* ---------- QUESTIONS AS SEARCHABLE PARTS --------------------------------------------------------
   ONE ITEM PER PART, never per stem. A stem is the context a part needs, not a thing anybody looks
   for — searching "1825 employees" should land on question 5's parts, not on a stem card that asks
   nothing.

   THE PAPER'S FIELDS ARE COPIED ONTO EVERY PART, so a question answers the same facets its paper
   does. Filtering to A-Level, Edexcel, 2022 narrows questions exactly as it narrows papers, and
   nothing downstream has to know which it is holding — which is the same reason `allTopics` copies
   them onto a resource.

   THE STEM IS FOUND ONCE PER PART and carried along. Looking it up when the card is drawn would be
   a scan of every question row per card, which on a list of ninety is ninety scans. */
/* ---------- THE CLASSES THAT LIVE IN THE SHEET ---------------------------------------------------
   `check-css` REPORTS A RULE IT CANNOT FIND A USE FOR, and question HTML is stored in the sheet
   where it cannot look. `ol.roman` and the SVG label classes appear only there, so the check saw
   rules styling nothing and said so — correctly, given what it can see.
   Naming them here is not a trick to quiet it: it is the only place in the source that records
   which classes a question's HTML is allowed to use, which is what makes them safe to style and
   unsafe to rename. Any question using a class not on this list will be unstyled.

   used by stored question HTML: roman  lbl  num  ax  axis  grid  pt  stat  marks  parts */
const QUESTION_CLASSES = ['roman', 'lbl', 'num', 'ax', 'axis', 'grid', 'pt',
                          'stat', 'marks', 'parts'];

/* THE CARD. Small — a reference, the marks, and the first line of the question, because a list of
   ninety parts is scanned rather than read. The whole thing opens on a tap. */
/* THE RECORD IS THE FACE OF IT. W-L-D first, KOs under it, and the date the count was taken —
   because a record with no date is the one number on the card that can quietly go wrong. */
/* ---------- ONE BOUT ------------------------------------------------------------------------------
   THE RESULT SENTENCE IS NOT USED, and that is deliberate. `result` reads "Jack Johnson def. James
   J. Jeffries" — the two names again, which the card has already printed larger, plus a word. The
   facts worth the space are the ones the names do not carry: how it ended, in which round, and
   whether anybody has checked.

   THE WINNER IS MARKED RATHER THAN STATED. A name in bold and the other not is read instantly and
   costs no line; "Winner: Jack Johnson" is a whole row saying what a weight already said. A draw
   or a no-contest marks neither, which is exactly right — nothing to emphasise, and the method
   underneath says what happened.

   `verified` IS SHOWN WHEN IT IS FALSE, not when it is true. Almost every row will be checked
   eventually, so a tick on all of them is decoration; a mark on the few that are not is a to-do
   list somebody can actually work through. */
function fightCard_(x) {
  const f = x.row;
  /* ---------- WHO WON, BY ID WHERE THERE IS ONE ---------------------------------------------------
     THIS COMPARED `f.winner` AGAINST `f.a` BY NAME ALONE, and the sheet sends `winner_id`,
     `boxer_a_id` and `boxer_b_id` beside them — three columns shipped to every phone and read by
     nothing. CLAUDE.md's rule is the one this repository has already paid for twice: an id beats a
     name, because a name is a cell somebody can edit. `changePin` checking a PIN against the wrong
     person is the sharp version; this is the quiet one — `winner` typed as "Ali" against
     `boxer_a` "Muhammad Ali" highlights neither corner and looks exactly like a draw.

     THE NAME IS STILL THE FALLBACK, and that is not a hedge: it is what reads a row typed into the
     sheet before anybody has assigned ids, which is how this tab is filled in. Same order
     `findPerson` uses on the backend, for the same reason. */
  const byId = f.winnerId && (f.aId || f.bId);
  const wonA = byId ? String(f.winnerId) === String(f.aId)
                    : !!(f.winner && norm(f.winner) === norm(f.a));
  const wonB = byId ? String(f.winnerId) === String(f.bId)
                    : !!(f.winner && norm(f.winner) === norm(f.b));
  const corner = (name, won) => `<span class="fight-who${won ? ' won' : ''}">${esc(name)}</span>`;

  /* HOW IT ENDED, AS A PHRASE. "KO" and "round 2" are two facts and one sentence; a card that
     printed them as two rows would be a form rather than a result. */
  const how = [f.method, f.endRound ? 'round ' + f.endRound : '',
               (!f.endRound && f.rounds) ? f.rounds + ' rounds' : '']
    .filter(Boolean).join(' · ');

  const where = [f.venue, f.city].filter(Boolean).join(', ');
  const bout = f.boutTotal > 1 ? `Bout ${f.boutNo} of ${f.boutTotal}` : '';

  return `<div class="card fight">
    <p class="fight-line">${corner(f.a, wonA)}<em>v</em>${corner(f.b, wonB)}</p>
    <p class="sub">${esc([f.date, f.division, bout].filter(Boolean).join(' · '))}</p>
    ${how ? `<p class="fight-how">${esc(how)}</p>` : ''}
    ${f.titles ? `<p class="note">${esc(f.titles)}</p>` : ''}
    ${where ? `<p class="note">${esc(where)}${
      f.attendance ? ' · ' + esc(f.attendance) + ' there' : ''}</p>` : ''}
    ${f.notes ? `<p class="fight-note">${esc(f.notes)}</p>` : ''}
    ${/* THE WATCH LINK MOVED into `fightTiles_`, so it sits in the tile row with every other action
          on every other card rather than as a lone button halfway up this one. */''}
    ${f.verified ? '' : '<p class="note faint">Not checked yet</p>'}
  </div>`;
}

/* ---------- ONE DIVISION, HOWEVER IT WAS TYPED ----------------------------------------------------
   THE FUNNEL LISTED "Light heavyweight" (6) AND "Light Heavyweight" (5) as two different divisions,
   and did the same to Super bantamweight, Super middleweight, Light welterweight and Light
   middleweight. They are one division each, typed by hand on different days.

   A FILTER GROUPS BY THE EXACT STRING, so two spellings are two buttons — and worse than untidy,
   each one hides half the fighters from somebody who picked the other. Folded to one shape here:
   first letter up, the rest down, so whatever is in the cell arrives as one answer. */
function divisionOf_(v) {
  const s = String(v || '').trim();
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

/* ---------- EVERY DECADE A CAREER TOUCHED ---------------------------------------------------------
   A BOUT HAS A DATE AND A FIGHTER HAS A SPAN, and the two want the same answer in the end: which
   ten-year block. So one reader, off the row, rather than a field written by each mapper — the
   boxer mapper already wrote `year: b.activeTo`, which is his LAST year and nothing else, and a
   facet built on it would file Ali under the 1980s alone.

   READ OFF THE ROW, NOT OFF THE ITEM, so a column added to the boxers tab is filterable without a
   mapper edit — the same reason `facetFromSheet_` falls back to `x.row`. `activeFrom` / `activeTo`
   for a fighter, `date` for a bout.

   A FIGHTER STILL FIGHTING has no `activeTo`. That is not a career of length nought: it is a career
   with no end yet, and the honest ceiling is the newest decade anything in the library reaches —
   but nothing here knows the library, so it stops at the decade the sheet's own `record_as_of`
   names, and failing that at `activeFrom`'s own decade. A single decade for somebody mid-career is
   incomplete; inventing "to the present day" from a clock this function cannot see would be wrong
   in a way nobody could spot, which is the rule this file keeps under `figure` and under
   `exam_date`.

   A SPAN THAT RUNS BACKWARDS, or one longer than a human career, gives just its own two ends
   rather than a hundred buttons. A typo in a cell must not be able to fill the funnel. */
const DECADE_MAX = 9;

function decadeOf_(v) {
  const m = /\b(1[89]\d{2}|20\d{2})\b/.exec(String(v == null ? '' : v));
  return m ? (Math.floor(Number(m[1]) / 10) * 10) : 0;
}

function decadesOf_(x) {
  const r = (x && x.row) || {};
  if (!r || (x && x.kind !== 'boxer' && x.kind !== 'fight')) return [];
  const one = d => d ? String(d) + 's' : '';
  /* A BOUT IS ONE DAY. `date` is the fight; everything else on the row is about the fighters. */
  if (x.kind === 'fight') return [one(decadeOf_(r.date))].filter(Boolean);
  const from = decadeOf_(r.activeFrom);
  const to = decadeOf_(r.activeTo) || decadeOf_(r.recordAsOf) || from;
  if (!from && !to) return [];
  if (!from || !to || to < from) return [...new Set([one(from), one(to)])].filter(Boolean);
  const out = [];
  for (let d = from; d <= to && out.length <= DECADE_MAX; d += 10) out.push(one(d));
  return out;
}

function boxerCard_(x) {
  const b = x.row;
  const rec = [b.wins, b.losses, b.draws].join('-') + (b.noContests ? ' (' + b.noContests + ' NC)' : '');
  const years = [b.activeFrom, b.activeTo].filter(Boolean).join('–');
  return `<div class="card">
    <div class="thing">
      <div class="thing-body">
        <h3>${esc(x.name)}${b.nickname ? ' <span class="boxer-nick">“' + esc(b.nickname) + '”</span>' : ''}</h3>
        <p class="sub">${esc([b.bestDivision, b.country, years].filter(Boolean).join(' · '))}</p>
      </div>
      <span class="boxer-rec">
        <b>${esc(rec)}</b>
        <span>${esc(b.winsKo)} KO</span>
      </span>
    </div>
  </div>`;
}


/* ---------- THE ANSWER, SHOWN ------------------------------------------------------------------
   IT WAS BEHIND A `<details>` AND IT IS NOT ANY MORE, at the owner's decision. The argument for
   hiding it is written out below because it is a real argument and somebody will make it again:
   a revision screen that shows the answer under the question has not asked you anything, and the
   value of a past paper is the gap between reading it and knowing it.

   THE ANSWER TO IT is that this is not only a revision screen. It is the surface a tutor reads
   FROM, in front of somebody, and a disclosure widget between the question and its mark scheme is
   a tap in the middle of a sentence being spoken. Whoever wants the gap can stop reading; nobody
   who wants the mark scheme can avoid the tap.

   WHAT WENT WITH IT: `<details>` was the only one in this app, and it was chosen because open and
   shut is the entire state and the browser keeps it for free — no flag, no key, and nothing to
   survive a repaint. A static block needs even less, so nothing is lost. `.qans-open` in
   `style.css` styled the summary and has no element left to style.

   THE ANSWER GOES IN RAW AND THE NOTE IS ESCAPED, which is not an oversight. `html` and `lead` two
   lines above are inserted raw because a question is typeset — fractions, indices, tables — and an
   answer is the same material: `S(r.answer)` on the backend keeps whatever was written. An
   examiner's note is a paragraph of prose, so it is escaped like every other sentence on this card.
   Both come from the owner's own spreadsheet, which is the same trust as the question itself.

   NOTHING AT ALL WHEN THERE IS NO ANSWER. A summary reading "Answer" that opens on emptiness is
   worse than no summary: it says one exists. */
/* ---------- AND WHEN IT IS NOT SHOWN, WHICH IS A SECOND READER RATHER THAN A CHANGED MIND ------
   THE ARGUMENT ABOVE IS ABOUT THE TUTOR AND IT STILL STANDS. A disclosure widget between a
   question and its mark scheme is a tap in the middle of a sentence being spoken, and that is
   exactly what this screen is for when somebody is reading FROM it.

   WHAT CHANGED IS THAT THERE IS NOW A SECOND READER: a student working through the paper on the
   tutor's phone while the tutor is with somebody else, typing into the answer box and pressing
   Check. For that reader the open mark scheme is not a convenience, it is the answer printed
   under the question -- and marking your own work against an answer you have already read is not
   marking.

   SO IT TURNS ON WHO IS WORKING, WHICH IS A FACT THE APP ALREADY HAS. No student named -- the
   tutor's own default -- and nothing about this card has changed. A student named, and the answer
   waits behind one tap that says what is behind it, and opens itself the moment they get it right.
   Neither reader is asked to put up with the other's screen. */
function answerBlock_(x) {
  if (!x || !String(x.answer || '').trim()) return '';
  const hide = !!whoIs_();
  /* WHAT KIND OF ANSWER IT IS, beside the word, when the sheet says. A one-mark recall and a
     25-mark essay want different things of you before you open it. */
  const kind = String(x.answerType || '').trim();
  return `<div class="qans${hide ? ' is-shut' : ''}">
    ${hide ? `<button type="button" class="qp-reveal" data-do="qp-reveal">Show the answer</button>` : ''}
    <div class="qans-head">
      <span>Answer</span>${kind ? `<em>${esc(kind)}</em>` : ''}
    </div>
    <div class="qans-body">${x.answer}</div>
    ${x.examinerNote ? `<p class="qans-note">${esc(x.examinerNote)}</p>` : ''}
  </div>`;
}

/* OPENING ONE SHOWS THE STEM, THE LEAD AND THE PART — in that order, because that is the order it
   is printed and because a part without them cannot be answered. This is the whole reason the stem
   is a row of its own rather than a copy on each part. */
/* ---------- `on('question')` WAS HERE ------------------------------------------------------------
   It opened the stem, the lead and the part over the top of a card showing the first 96
   characters of the part. All three are on the card now. See `questionCard_` above.
--------------------------------------------------------------------------------------------- */

/* ---------- WHAT A PART IS CALLED ------------------------------------------------------------
   THREE HABITS, ONE COLUMN. Edexcel letters its parts (5b) and nests roman numerals inside them
   (5a i); AQA numbers them (01.1). All of it arrives in `part` as the bare token — b, ai, 1 —
   because the sheet stores what the paper says and not how to print it.

   SO THE JOINING IS DONE HERE, and it cannot be a concatenation: "Q5" + "ai" is Q5ai, which reads
   as one word and is what no paper calls it, and "Q1" + "1" is Q11, which is a different question
   altogether.

   A LONE i, v OR x IS A NUMERAL, NOT A LETTER. Both are possible and only one has ever happened —
   lettering reaches i at the ninth part and no paper here has more than six. */
/* WHOLE NUMERAL FIRST, so "iv" is four and not letter i followed by v. Trying letter-then-numeral
   first would match that greedily and be wrong on exactly the parts nobody checks. */
const ROMAN_ONLY = /^(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;
const LETTER_ROMAN = /^([a-z])(i{1,3}|iv|vi{0,3}|ix|xi{0,3})$/i;

function qPartBits_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return null;
  if (ROMAN_ONLY.test(s)) return { letter: '', roman: s };
  const m = s.match(LETTER_ROMAN);
  return m ? { letter: m[1], roman: m[2] } : null;
}

/* The name on a card: Q1.1 · Q5b · Q5a(i) */
function qPartName_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return '';
  if (/^\d+$/.test(s)) return '.' + s;
  const b = qPartBits_(s);
  return b ? b.letter + '(' + b.roman + ')' : s;
}

/* `qPartShow_` WAS HERE — the marker down the left of an open question, "1) · b) · a(i)". It was
   declared, never called, and differed from `qPartName_` twelve lines above only in a trailing
   bracket. Two functions one letter apart doing almost the same thing is the `childrenOf` /
   `childNamesOf` trap CLAUDE.md records, and this one had no callers to be wrong about yet. */

/* ---------- ONE READER FOR THE PAPER'S ID ---------------------------------------------------------
   THREE NAMES WERE IN USE for one column — `paper`, `paperId`, `paper_id` — and the backend sends
   the third spelling of the three: `paper: S(r.paper_id)`. `questionItems` read all three and was
   fine. `allTopics` read only two, so `id` came out empty on every row, every row was skipped, and
   THE PAPER LIST WAS ALWAYS EMPTY.

   WHAT THAT COST is not a missing paper list — it is that every question then looked up its paper
   in an empty object and got `{}` back, so all 181 of them carried no subject, no name, no board,
   no tier and no year. The funnel could not ask "which subject" of a question because no question
   had one, and with boxers the only things left under Learning that could answer it, the one-answer
   rule skipped the question entirely and dropped you straight on Boxers or Fights.

   So it is one function now, read in all three places. This is the same fault `pid` was written to
   fix, left half-fixed: a second reader of the same column is a second chance to spell it wrong. */
function paperIdOf_(r) {
  return (r && (r.paperId || r.paper_id || r.paper)) || '';
}

/* ---------- WHAT A QUESTION IS ABOUT, AS WORDS -----------------------------------------------------
   THE SEARCH BOX COULD NOT SEE INSIDE A QUESTION. `hay` was name, sub, subject, slot and grade —
   and a question's name is `Q5b`. So of three thousand rows, not one was findable by what it is
   actually about: `momentum`, `surds`, `refraction`, `half-life` all returned nothing while the
   questions sat there. Somebody revising thinks in topics, not in paper numbers, and the funnel is
   a taxonomy — you have to already know where a thing lives to reach it.

   BUILT ONCE, NOT PER KEYSTROKE. The obvious version strips the HTML inside the filter, which runs
   for every item on every letter typed — three thousand regexes a keystroke. This runs when items
   are built and hangs the result on the item, so typing only compares strings.

   TAGS OUT, ENTITIES BACK. `&amp;` in a haystack means searching for `&` finds nothing and
   searching for `amp` finds everything. */
/* THE PUBLISHER'S NAME IN BOTH SPELLINGS, because the file holds one and people type the other.
   `company` was normalised to `1st Class Maths` on all 1,481 rows — see the spelling-vote note —
   and the squashed form `1stclassmaths` is what that publisher writes on its own sheets and what
   somebody copying a filename types. A substring search cannot see through a space, so one of the
   two would find 1,370 and the other 325 coincidental hits, which reads as the search half-working.

   `spellKey_` IS ALREADY THE REDUCTION, so this is that function and not a second opinion about
   what a spelling is. Two tokens per item, built once when the item is. */
function companyAtoms_(v) {
  const said = String(v || '').trim();
  if (!said) return '';
  const key = spellKey_(said);
  return key && key !== said.toLowerCase() ? said + ' ' + key : said;
}

function searchText_(r) {
  return String((r && (r.html || '')) + ' ' + (r && (r.lead || '')))
    .replace(/<[^>]*>/g, ' ')
    .replace(/&(nbsp|amp|lt|gt|minus|frasl|deg|pi|times|divide|radic|rsquo|ldquo|rdquo|mdash);/g, ' ')
    .replace(/&[a-z]+;|&#\d+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/* `paperText_` AND ITS MEMO WERE HERE. It folded every question's words into its PAPER's search
   haystack, so typing `surds` found the paper rather than nothing — which was necessary exactly
   because the thing in the list was a document with none of its own words on it. The list is the
   questions now and `searchText_` matches each one's own text, plus its stem's. See
   `questionItems`. */




/* ---------- EVERY PAPER, DERIVED FROM ITS OWN QUESTIONS -------------------------------------------
   THERE IS NO `resources` TAB ANY MORE. It has moved to another spreadsheet and the backend does not
   read it, so the checklists branch that used to build this list has nothing behind it.

   A PAPER IS NOW A GROUP OF QUESTIONS THAT SHARE A `paperId`, and its paper-level facts — the name,
   the subject, the board, the wave — ride on every part. That is a denormalisation and it is worth
   naming as one: the same ten fields are repeated on all eight or nine rows of a paper, and nothing
   stops row four disagreeing with row three.

   SO THE FIRST PART WINS, and disagreement is reported rather than resolved. `paperMismatches()`
   typed into the console names any paper whose parts do not agree, which is the only defence a
   repeated fact has. Picking silently would make a typo on one row invisible for ever.

   IT COSTS ONE PASS over the questions rather than a lookup per card — four hundred cards each
   scanning two hundred rows is eighty thousand comparisons to draw one screen. */
/* ==================================================================================================
   `allTopics()`, `topicBy`, `paperText_`, `paperPages_` AND `paperMismatches()` WERE ALL HERE.

   THEY WERE THE COLLECTION. `allTopics` built one object per DOCUMENT — 642 of them — out of
   `dropdowns.checklists` unioned with a derivation off the question rows, and everything else here
   hung off that: `topicBy` looked one up by id, `paperText_` folded every question's words into its
   paper's haystack so searching `surds` found the paper, `paperPages_` guessed a page count from a
   mark total, `paperMismatches` reported parts of one paper disagreeing about a paper-level fact.

   THE COLLECTION IS GONE AND THIS IS THE THIRD ATTEMPT AT IT, WHICH IS THE POINT. A document and
   the questions inside it answer the SAME facets — the paper's board, tier, year and wave are
   copied onto every question row, deliberately, and CLAUDE.md explains why. So choosing
   Edexcel · 2022 · Higher returned the paper AND its parts, two kinds of thing in one list, and
   each fix made it worse in a new way:

     the paper drawn once as a cover and again once per question;
     then the cover with the WHOLE paper printed under it, on every card in the results list;
     then a cover you had to open, which is a search result you cannot read without a tap.

   None of those was the drawing. A screen for finding a question should list questions.

   NOTHING IS LOST THAT WAS BEING USED. The facets that narrow to a paper — subject, key stage,
   tier, exam board, year, exam wave — are on the question rows themselves, so the funnel reaches
   the same place and then keeps going. `searchText_` still matches the question's own words, which
   is what `paperText_` was faking at the document level.
================================================================================================== */

/* ---------- ONE ITEM PER PART ---------------------------------------------------------------------
   A STEM IS NOT AN ITEM. It is the shared wording above several parts — "George throws a ball at a
   target 15 times" — and nobody searches for one; it is looked up when a part is drawn and never
   listed in its own right. That is the whole reason it is a row of its own rather than a copy on
   each part.

   AND NEITHER IS A `kind: 'paper'` ROW. Those are the 642 document rows, which is what this screen
   has just stopped listing. `libraryInto_` already drops them from `DATA.questions`; the test is
   here too because a row arriving with the wrong `kind` should fall out rather than draw as a
   question with no text, no marks and no answer.

   EVERY PAPER-LEVEL FIELD IS ALREADY ON THE ROW. Board, tier, key stage, year, wave, company,
   subject — copied down onto every question when the two tables were folded together, which is the
   fact that makes this function short and makes the document unnecessary. */
/* ==================================================================================================
   A PREAMBLE IS ONE IDEA AT THREE SCOPES, NOT THREE FEATURES.

   A QUESTION IS RARELY JUST ITS INSTRUCTION. "Work out the size of angle x" is unanswerable on its
   own; what makes it a question is the paragraph above it, and that paragraph belongs at whichever
   level it was printed at:

     THE PAPER      "Answer all questions in the spaces provided." Rare, and real.
     THE SECTION    AQA's English Language papers put an unseen EXTRACT in front of Section A and
                    every question in that section refers to it. It is not question 3's text, it is
                    the section's, and questions 1 to 4 all need it.
     THE QUESTION   "ABCDE is a pentagon." Shared by parts (a), (b) and (c) — one paragraph the
                    three of them hang from, which is why it cannot live on any one of them.
     THE PART       `lead` — "George now throws the ball 250 times." This part's own, never shared.

   THE MODEL WAS HALF BUILT AND HALF NAMED. A question-scope preamble was a `kind: 'stem'` ROW; a
   part-scope one was a `lead` COLUMN; and there was no way at all to say "this belongs to the
   section", which is precisely what the next set of papers going in needs. Two mechanisms for one
   idea is the fault this repository has recorded three times under other names — `kinds` and
   `widgets` in two files, `link` against `source_url`, `childrenOf` declared twice.

   SO THE SCOPE IS READ OFF THE ROW rather than declared in a column, which means no migration and
   no default to get wrong: a stem row that names a question belongs to that question, one that
   names only a section belongs to the section, and one that names neither belongs to the paper.
   Every one of those columns is already on every row.

   `lead` STAYS A COLUMN, and that is not an inconsistency. Everything above is SHARED, so it has to
   live in one place that several parts point at or the copies can disagree. A lead is one part's
   own, always, so a row of its own would be a join with exactly one member on each side.

   MEASURED BEFORE BUILDING: 9 stem rows, 29 parts reached by one, 341 parts with a lead, and 368
   question numbers carrying more than one part. So the shape is real and thinly populated — filling
   it in is transcription work on rows that exist, not a change here.
================================================================================================== */
/* ---------- A SCOPE HOLDS SEVERAL PREAMBLES, AND IT USED TO HOLD EXACTLY ONE ----------------------
   EVERY LINE HERE WAS `at.section[key] = r` AND THE SECOND ROW WON. Measured before changing it,
   by putting three insert rows into one section scope and asking the real app what reached the
   cards: three went in, ONE came out, and it was the last one. Parts 1 and 2 were discarded with
   nothing logged, nothing thrown and nothing on screen -- so an insert split in the spreadsheet
   lost two thirds of itself and looked like it had worked. That is this repository's oldest shape
   one more time, and the reason it had never been noticed is that nobody had yet had a reason to
   write a second row in one scope.

   AN AQA ENGLISH INSERT IS THE REASON TO. The paper prints one line-numbered source and its four
   reading questions each name a different span of it, so the insert is a LIST of parts and always
   was -- it was being flattened into one cell because one cell was all there was room for.

   THE ORDER IS DECLARED, NOT INFERRED. `sort_order` on the row, and a stable sort so rows that do
   not carry one keep the order the file has them in. Inferring it from `lines` would read the
   first number of a span, which is right for "1-6" before "10-19" and silently wrong for a Source
   A / Source B insert where neither part is numbered at all. */
function stemIndex_(all) {
  const at = { paper: {}, section: {}, question: {} };
  const put = (bag, key, r) => { (bag[key] || (bag[key] = [])).push(r); };
  all.forEach(r => {
    if (!r || r.kind !== 'preamble') return;
    const pid = paperIdOf_(r);
    if (!pid) return;
    if (r.q !== undefined && r.q !== null && r.q !== '') put(at.question, pid + '|' + r.q, r);
    else if (r.section) put(at.section, pid + '|' + r.section, r);
    else put(at.paper, pid, r);
  });
  /* Stable, because `sort` is stable in every engine this runs on and a preamble with no
     `sort_order` must not be reordered against its neighbours by the sort that exists for the
     ones that do. */
  [at.paper, at.section, at.question].forEach(bag => {
    Object.keys(bag).forEach(k => { bag[k].sort((a, b) => (a.order || 0) - (b.order || 0)); });
  });
  return at;
}

/* OUTERMOST FIRST, because that is the order the paper prints them in and the order they have to be
   read in: the extract, then the scene, then the instruction. A part with none of them gets an empty
   list, which every caller already handles — `stems: []` draws nothing and adds nothing to the
   search haystack. */
function preamble_(r, at) {
  const pid = paperIdOf_(r);
  const out = [];
  /* EACH SCOPE IS A LIST NOW — see `stemIndex_` above for what a single row cost. `|| []` rather
     than a guard, because a scope nothing wrote has no key at all and every caller below already
     handles an empty list. */
  const add = xs => (xs || []).forEach(x => { if (x && (x.html || x.diagram)) out.push(x); });
  add(at.paper[pid]);
  if (r.section) add(at.section[pid + '|' + r.section]);
  if (r.q !== undefined && r.q !== null && r.q !== '') add(at.question[pid + '|' + r.q]);
  return out;
}

/**
 * WHAT YOU HAVE TO HAVE IN FRONT OF YOU, FROM THE PAPER AND FROM THE QUESTION.
 *
 * ASKED FOR AS THREE THINGS — calculator or not, a print, a compass — AND IT IS ONE COLUMN. The
 * `images` note in CLAUDE.md is the argument and it was paid for once already: three booleans is
 * three schema changes, three mappings, three renderers and three checks, and the day somebody
 * needs a fourth (a protractor, tracing paper, squared paper) it is all four again. `needs` is a
 * comma-list, read by `asList_`, exactly as `topics` and `keystage` already are.
 *
 * THE TWO SCOPES ARE NOT THE SAME AND THAT IS THE WHOLE OF THIS FUNCTION. "You must not use a
 * calculator" is printed on the front cover and is true of all 31 questions inside, so it lives
 * ONCE on the `kind: 'document'` row — 103 cells covering 1,013 questions. Writing it onto every
 * question row instead would be a thousand chances for row 4 to disagree with row 3, which is the
 * denormalisation hazard `paperMismatches` exists for. A COMPASS is the other way round: one
 * question asks you to construct a bisector and the other thirty do not.
 *
 * SO IT IS A UNION, OUTERMOST FIRST, which is the same shape and the same order as `preamble_`
 * directly above — the paper's fact, then the question's own. Deduplicated on the way, because a
 * question that names a ruler inside a paper that already asks for one should not say it twice.
 */
function needsIndex_(all) {
  const at = {};
  all.forEach(r => {
    if (!r || !r.isDoc) return;
    const pid = paperIdOf_(r);
    if (pid) at[pid] = asList_(String(r.needs || '').split(','));
  });
  return at;
}

function needsOf_(r, at) {
  const out = [];
  const add = v => { if (v && out.indexOf(v) === -1) out.push(v); };
  ((at && at[paperIdOf_(r)]) || []).forEach(add);
  asList_(String((r && r.needs) || '').split(',')).forEach(add);
  /* ---------- AND THE PRINTED SHEET, WHICH IS READ RATHER THAN RE-TYPED ------------------------
     "WHETHER A PRINT IS REQUIRED" WAS ASKED FOR AND THE LIBRARY ALREADY HELD IT TWICE. Measured:
     `needs_print` True on 252 rows, `print_required` True on 104, and **zero rows True in both** —
     two imports over two disjoint subsets. `libraryInto_` unions them onto `needsPrint`; this puts
     the answer in the same list as everything else so the card and the facet have one reader.

     A THIRD COLUMN WOULD HAVE BEEN THE FOURTH SPELLING OF ONE ANSWER, which is the fault this file
     fixed as a RULE in `spellKey_` rather than by hand a fourth time. The first version of
     tools/set-needs.py derived it from `figure` and would have written exactly that. */
  if (r && r.needsPrint) add('Printed sheet');
  return out;
}

function questionItems() {
  const all = DATA.questions || [];
  if (!all.length) return [];

  const stems = stemIndex_(all);
  /* BUILT ONCE PER DRAW, not looked up per question — `all` is 4,682 rows and this walks it once.
     Same reason `stemIndex_` is a map rather than a filter inside the loop. */
  const kit = needsIndex_(all);

  return all.filter(r => r.kind !== 'preamble' && r.kind !== 'document').map(r => {
    const lead = preamble_(r, stems);
    return {
      kind: 'question',
      /* "Q5b" IS THE NAME AND THE PAPER IS THE SUBTITLE. A list of parts all called
         "Paper 31: Statistics — June 2022" is a list nobody can read down. */
      name: 'Q' + r.q + qPartName_(r.part),
      key: 'q:' + r.id,
      sub: r.name || '',
      subject: r.subject || '',
      /* THE SAME DERIVATION `allTopics` DID, and the only one it did: a grade is a band value when
         the band is a grade, and blank when it is a stage. Two ladders, one column. */
      grade: r.bandType === 'grade' ? (r.bandValue || '') : '',
      bandType: r.bandType || '', bandValue: r.bandValue || '',
      keystage: r.keystage || '', tier: r.tier || '',
      examBoard: r.examBoard || '', company: r.company || '',
      documentType: r.documentType || '', examWave: r.examWave || '',
      year: r.year || '',
      /* `paper: true` WAS HERE and it was write-only — see the deleted `Printed?` facet above,
         which was its one reader. It also clobbered something: `library.js` puts the paper's ID
         in `paper` (`paper: libS(r.paper_id)`), which is the third of the three spellings
         `paperIdOf_` exists to read. Nothing called `paperIdOf_` on an item, so it never fired —
         but a field that holds an id everywhere except here is the exact trap that note describes. */
      /* ---------- WHERE THIS QUESTION SITS IN ITS PAPER ---------------------------------------------
         THE SORT KEY IS BUILT FROM THESE, so they are stated rather than left to be inferred from
         the number inside the name. Nothing has written them since the paper card was deleted and
         nothing was visibly wrong — see the note above the sort, which is about why that is not the
         same as nothing being wrong. */
      qNumber: r.q, qPart: r.part || '',
      /* THE TOPICS, RESOLVED ONCE. `topicOf_` splits the cell and puts every spelling of a topic on
         one button, and doing that inside the facet meant doing it per item per question asked:
         MEASURED at 38 ms to interrogate this one facet across the library. It is a fact about the
         row, so it is computed where the row is read. */
      topic: topicOf_({ row: r.row || r }),
      marks: r.marks, section: r.section,
      lead: r.lead, html: r.html, diagram: r.diagram || '',
      /* THE SAME SPLIT `topics` AND `keystage` GET — one helper, because a comma is a comma. */
      images: topicAtoms_(r.images || (r.row && r.row.images)),
      /* WHO DREW IT. See `figCredit_` — a picture this site made to replace one that did not come
         across is not the same object as a picture off the paper, and the card says which. */
      diagramBy: r.diagramBy || (r.row && r.row.diagram_by) || '',
      /* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. `answer`, `answerType` and
         `examinerNote` have been in the payload since the tab was cut, and the first version of
         this function dropped all three — the other direction of the fault `check-payload.js`
         exists for: sent, and never read. Only 91 of 3,271 rows carry one today. */
      answer: r.answer || '', answerType: r.answerType || '',
      accept: r.accept || '',
      examinerNote: r.examinerNote || '',
      /* EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST — see `preamble_`. It was one stem or
         none; a list is what makes an AQA source text and a question's own scene-setting the same
         thing at two scopes rather than two features. */
      stems: lead,
      /* THE STEM'S WORDS TOO. A part reading "work out the value of x" says nothing on its own and
         everything alongside the paragraph it hangs from — see `searchText_`.

         THE ANSWER IS DELIBERATELY NOT IN HERE. This is what the search box matches, and including
         it means typing a value finds the question it answers, which is the one search a revision
         screen must not do. */
      /* AND THE TOPICS, WHICH THE SEARCH BOX COULD NOT SEE EITHER. `searchText_` reads the
         question's own words, so `fractions` found a question only if the word `fractions` was
         printed in it — and on a worksheet whose every question is a fraction, the one place that
         says so is the `topics` cell. Typed here rather than matched in the filter for the reason
         `searchText_` gives: this runs once per item, and the filter runs per keystroke. */
      /* ---------- AND WHO PUBLISHED IT, WHICH WAS NEITHER ASKABLE NOR SEARCHABLE ---------------
         REPORTED AS "how would I get to 1st Class Maths worksheets?" and the honest answer was
         that you could not. Measured both ways:

           the FUNNEL never asks. `Company` qualifies everywhere — 5 answers, 99% coverage, a
           65.8% split on the whole library, comfortably the best narrowing available — and it
           sits near the END of `FACETS`, so Subject, Level, Type, Grade, Topic and Paper are all
           asked first. By the time its turn comes the list is Maths · KS4 · Worksheet and every
           one of those 1,370 rows IS 1st Class Maths, so the facet has one answer and is
           correctly skipped. A question that can only be asked once its answer is already
           decided is a question that is never asked.

           the SEARCH BOX did not find it either. Typing `corbettmaths` returned 0 of 1,020.
           `1st class maths` returned 325, which reads like it works and does not — those are
           coincidental hits on other fields, against 1,370 rows that carry the name in a cell.

         THIS IS THE `topics` FIX, ONE COLUMN ALONG, and the sentence above it is the same one: a
         publisher's name is printed nowhere in the question, so the one place that says
         Corbettmaths is the `company` cell. Typed onto the item here rather than matched in the
         filter, for the reason that note gives — this runs once per item, the filter runs per
         keystroke.

         THE FUNNEL'S ORDER IS NOT CHANGED HERE, deliberately. `at` is editorial and the `facets`
         sheet owns it: putting `company` at a low `order` asks it early, with no deploy. That is
         a judgement about what somebody wants asked first, and it is not mine to make. */
      text: searchText_(r) + lead.map(p => ' ' + searchText_(p)).join('')
            + ' ' + topicAtoms_(r.row ? r.row.topics : r.topics).join(' ')
            + ' ' + companyAtoms_(r.row ? r.row.company : r.company),
      /* THE RAW FILE ROW WHERE THERE IS ONE, not the payload object built from it — see the note on
         `row:` in js/library.js. It is what a sheet-invented facet reads through, so every column of
         `data/questions.json` is filterable and not just the 29 that got enumerated. */
      /* THE PAPER'S REQUIREMENT AND THE QUESTION'S OWN, already unioned — see `needsOf_`. A list,
         so the facet is multi-valued the way `keystage` is, and so a question can need two things. */
      needs: needsOf_(r, kit),
      row: r.row || r,
    };
  });
}

/* ---------- THE WHOLE QUESTION, NOT A PEEK --------------------------------------------------------
   THE FIRST VERSION SHOWED 96 CHARACTERS and a panel showed the rest. That split only made sense
   while the rest lived somewhere else, and it never did — the stem, the lead and the part are three
   fields on the row this card is already drawn from.

   A QUESTION IS SHORT. That is what a question IS; if it were a page it would be a paper. So the
   truncation bought nothing and cost a tap on every single one.

   THE STEM, THEN THE LEAD, THEN THE PART, in printed order, because a part without them cannot be
   answered. The mark scheme goes last, shut, under `answerBlock_` — an answer you can see before
   you have written one is not a question. */
/* ---------- SOMEWHERE TO WRITE THE ANSWER --------------------------------------------------------
   A BOX PER QUESTION, because that is what the paper has. One box at the bottom of a list is a page
   of prose nobody can mark against a mark scheme written per part.

   IT IS KEPT IN `localStorage`, AND THAT IS NOT A SHORTCUT. These cards are rebuilt on every
   repaint — a filter changing, the payload landing, signing in — and a `<textarea>` rebuilt is a
   `<textarea>` emptied. Somebody four questions in losing the lot because a chip moved is the kind
   of fault that stops people trusting an app at all. The browser remembers instead, so a redraw, a
   swipe away or a reload all come back to what was typed.

   THE KEY IS THE ROW ID. It was paper + question + part, which was right when the box lived on a
   paper page; `row_id` is unique across the whole library and does not move when a paper is
   relabelled. Anything typed under the old key is orphaned — the paper page existed for about a
   day, so that is nobody.

   AND THE KEY IS WHY 3,271 BOXES COST NOTHING. `fillStuffPages` fills the pages you are near and
   empties the ones you are not, so about five of these exist at any moment. I removed this function
   on the assumption that a textarea per question meant 3,271 textareas — measured, the whole strip
   holds 134 nodes. Wrong for the reason this file keeps repeating: I reasoned about the DOM instead
   of asking it.

   NOT SENT ANYWHERE, and the label says "Your answer" rather than anything promising otherwise.
   There is no endpoint that takes one and no tab to hold it, so this is a workbook and not a
   submission.

   EVERY READ AND WRITE IS WRAPPED. Private mode THROWS on `localStorage` rather than returning
   null, and a thrown getter here would take the whole results list down with it. */
/* ---------- WHOSE ANSWER IT IS -------------------------------------------------------------------
   TWO BOYS ON ONE PHONE WAS THE CASE THAT ASKED FOR THIS. The key was `ans:<row_id>` and nothing
   else, so a second person working through the same paper on the same device typed over the
   first one's answers with no warning and no way back. On a tutor's phone, passed between two
   students in one session, that is not an edge case -- it is the ordinary way it gets used.

   THE SIGNED-IN PERSON WHERE THERE IS ONE, otherwise whoever the Working-as control names. Signing
   in needs a row in the Ledger and a PIN, which is not something a tutor can do at the kitchen
   table for a boy who turned up today; a name typed into the app is. It is not a login and does
   not pretend to be one -- nothing is protected by it and nothing is sent anywhere. It is a label
   on a drawer.

   THE OLD UNPREFIXED KEY IS STILL READ, once, for whoever had answers before this existed. */
function whoIs_() {
  try {
    if (typeof USER !== 'undefined' && USER && (USER.personId || USER.name)) {
      return 'u:' + (USER.personId || USER.name);
    }
    return localStorage.getItem('workingAs') || '';
  } catch (e) { return ''; }
}

const ansKey_ = x => 'ans:' + (whoIs_() ? whoIs_() + ':' : '') + ((x && (x.key || x.name)) || '?');

function ansRead_(k) {
  try {
    const v = localStorage.getItem(k);
    if (v !== null) return v;
    /* BEFORE THERE WAS A WHO, every answer lived under the bare key. Read it once so nobody's
       working vanishes the day the name box appears; it is copied forward on the next keystroke. */
    const bare = k.replace(/^ans:[^:]*:/, 'ans:');
    return (bare !== k && localStorage.getItem(bare)) || '';
  } catch (e) { return ''; }
}

/* ---------- MARKING IT -----------------------------------------------------------------------
   THE ONE FAILURE THAT MATTERS IS MARKING A RIGHT ANSWER WRONG. A student has nobody to appeal
   to: told they are wrong when they are right, they either lose the thread or stop believing the
   tick, and the second is worse because it takes the correct marks with it. So every rule here
   is deliberately generous, and where it cannot be generous enough to be safe it declines to
   mark at all -- `accept` is simply absent on 427 questions and those offer the answer instead
   of a verdict. See tools/set-accept.py.

   WHAT IS FORGIVEN, each because a child writing it has not made a mistake:
     case, spaces, a trailing full stop        "Banana And Pear."
     the thousands comma                        1000 for 1,000
     a unit or a currency sign the answer names £4,655 for 4,655, "1000 envelopes" for 1000
     a minus sign in any of its three spellings -5, &minus;5, en dash
     a trailing zero on a decimal               8.50 for 8.5
     a list in a different order                10, 5, 2, 1 for 1, 2, 5, 10
     "and" or "&" between parts of an answer    "4000 and 820000"

   WHAT IS NOT FORGIVEN is a different number. Everything above is notation; the value is the
   answer. */
function markNorm_(s) {
  return String(s == null ? '' : s)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .toLowerCase()
    .replace(/[−–—]/g, '-')          /* minus, en dash, em dash */
    .replace(/[£$€]/g, '')
    /* A THOUSANDS SEPARATOR IS A COMMA, A SPACE, OR A THIN SPACE, and which one you get depends
       on who printed the paper. Edexcel writes 18 000; the KS2 papers write 1,000; a child types
       18000. All three are the same number and only the last one is what anybody actually types
       into a box. Caught by a real row: the very first question of the June 2024 Foundation
       paper, whose scheme answer is "18 000", marked "18000" wrong. */
    .replace(/(\d)[,\u2009\u00a0 ](?=\d\d\d\b)/g, '$1')
    /* A FRACTION HAS FOUR SPELLINGS AND A CHILD TYPES ONE OF THEM. The library writes the answer
       to Q23(b) of the June 2024 Foundation paper as `5&frasl;9`, which strips to `5\u20449` with the
       FRACTION SLASH; a phone keyboard has no such key and what gets typed is `5/9`. Before this
       line those were different strings, so the one answer a student is most likely to write was
       marked wrong -- on a live paper, to a child sitting beside you, with no appeal. The vulgar
       characters are the same fault a third way (`3\u2153` is the sign on the Corbettmaths signpost),
       and they need the space `3 1/3` or the mixed number folds into the improper 31/3.

       THE SPACE IS REMOVED ONLY WHERE IT TOUCHES THE SLASH. Stripping every space instead would
       fold `1 1/6` onto `11/6` -- 1.17 and 1.83, two different numbers -- so a wrong answer would
       be marked right, which is the one thing worse than the fault being fixed. */
    .replace(/[\u2044\u2215]/g, '/')
    .replace(/[\u00bc\u00bd\u00be\u2150-\u215e]/g, c => ' ' + {
      '\u00bc': '1/4', '\u00bd': '1/2', '\u00be': '3/4', '\u2150': '1/7', '\u2151': '1/9',
      '\u2152': '1/10', '\u2153': '1/3', '\u2154': '2/3', '\u2155': '1/5', '\u2156': '2/5',
      '\u2157': '3/5', '\u2158': '4/5', '\u2159': '1/6', '\u215a': '5/6', '\u215b': '1/8',
      '\u215c': '3/8', '\u215d': '5/8', '\u215e': '7/8' }[c] + ' ')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\band\b|&/g, ',')
    .replace(/[.\s]+$/, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* A LIST IS A SET. "1, 2, 5, 10" and "10, 5, 2, 1" are the same answer to "list the factors",
   and a child who works outwards from the middle writes the second. Compared as sorted parts,
   so order is free and a missing or extra factor is still wrong. */
function markParts_(s) {
  return markNorm_(s).split(/\s*,\s*/).map(p => markNum_(p.trim())).filter(Boolean).sort();
}

/* A NUMBER IS COMPARED AS A NUMBER, so 8.50 is 8.5 and 07 is 7. Anything that is not a bare
   number is left as text -- "banana" has no numeric value and must not become NaN. */
function markNum_(p) {
  const m = /^-?\d+(\.\d+)?$/.exec(p);
  if (!m) return p;
  const n = Number(p);
  return isFinite(n) ? String(n) : p;
}

/* THE UNIT IS PART OF THE ANSWER'S SENTENCE AND NOT PART OF THE ANSWER. The library writes
   "1,000 envelopes" and "70.5 kg" because that is what a person says; a student writing 1000 is
   right. So a trailing word is dropped from the EXPECTED side only -- never from what was typed,
   or "1000 cats" would pass. */
const markBare_ = s => markNorm_(s).replace(/^([-\d.,\s]+)\s*[a-z°%]+.*$/, '$1').trim();

function markAnswer_(typed, accept) {
  const t = markNorm_(typed);
  if (!t) return null;                              /* nothing typed is not a wrong answer */
  const ways = String(accept || '').split('|').map(w => w.trim()).filter(Boolean);
  for (let i = 0; i < ways.length; i++) {
    const w = ways[i];
    if (t === markNorm_(w)) return true;
    if (markNum_(t) === markNum_(markNorm_(w))) return true;
    if (t === markBare_(w) || markNum_(t) === markNum_(markBare_(w))) return true;
    const a = markParts_(t), b = markParts_(w);
    if (a.length && a.length === b.length && a.join('|') === b.join('|')) return true;
  }
  return false;
}

function ansBox_(x) {
  const k = ansKey_(x);
  /* MARKABLE ONLY WHERE `accept` SAYS SO. A question with no machine-checkable answer gets the
     box it always had and no button, rather than a Check that shrugs -- a control that sometimes
     does nothing is worse than one that is not there. */
  const can = String(x && x.accept || '').trim();
  const who = whoIs_().replace(/^u:/, '');
  return `<label class="qp-ans">
    <span class="qp-ans-k">${who ? esc(who) + '&rsquo;s answer' : 'Your answer'}<button
      type="button" class="qp-who" data-do="qp-who">${who ? 'not ' + esc(who) + '?' : 'who is this?'
      }</button></span>
    <textarea class="qp-ans-in" data-do="qp-ans" data-k="${esc(k)}"
      rows="2" spellcheck="false" autocomplete="off">${esc(ansRead_(k))}</textarea>
  </label>${can ? `<div class="qp-mark" data-accept="${esc(can)}">
    <button type="button" class="qp-check" data-do="qp-check">Check</button>
    <span class="qp-verdict" role="status" aria-live="polite"></span>
  </div>` : ''}`;
}

/* ---------- THE VERDICT ------------------------------------------------------------------------
   IT SAYS "NOT YET" AND NOT "WRONG", and that is not softness. These are practice sheets a child
   works through alone while a tutor is with somebody else; the whole value of marking your own
   work is that you get another go at it, and a verdict that reads as final is one that ends the
   attempt. The mark scheme is one tap below either way.

   NOTHING TYPED IS NOT A WRONG ANSWER. Pressing Check on an empty box asks for the answer, it
   does not award a cross. */
on('qp-check', (el) => {
  const box = el.closest('.qp-mark');
  const card = el.closest('.qcard');
  const inp = card && card.querySelector('.qp-ans-in');
  const out = box && box.querySelector('.qp-verdict');
  if (!box || !inp || !out) return;
  const verdict = markAnswer_(inp.value, box.getAttribute('data-accept'));
  box.classList.remove('is-right', 'is-near');
  if (verdict === null) {
    out.textContent = 'Write something first';
    return;
  }
  box.classList.add(verdict ? 'is-right' : 'is-near');
  out.textContent = verdict ? 'Correct' : 'Not yet — have another go';
  /* THE ANSWER OPENS ITSELF ONCE IT HAS BEEN EARNED. Getting it right and then having to hunt
     for the method is backwards: the working is the thing worth reading at the moment you know
     you were right. A wrong one is left shut, because the next thing to do is try again. */
  /* THE ANSWER OPENS ITSELF ONCE IT HAS BEEN EARNED. Having to hunt for the method at the
     moment you have just been told you were right is backwards -- that is when the working is
     worth reading. A wrong one is left shut, because the next thing to do is try again. */
  const ans = card.querySelector('.qans');
  if (verdict && ans) ans.classList.remove('is-shut');
});

on('qp-reveal', (el) => {
  const ans = el.closest('.qans');
  if (ans) ans.classList.remove('is-shut');
});

/* ---------- WHO IS WORKING ---------------------------------------------------------------------
   NOT A LOGIN AND IT DOES NOT PRETEND TO BE ONE. Signing in needs a row in the Ledger and a PIN,
   which is a spreadsheet edit -- not something a tutor can do at a kitchen table for a boy who
   turned up today. This is a name in `localStorage`, it protects nothing and is sent nowhere, and
   it does exactly two jobs: it keeps two students' answers in separate drawers on one phone, and
   it tells the card that somebody is being ASKED the question rather than reading from it.

   CLEARING IT IS THE TUTOR'S OWN VIEW, which is why the empty answer is not a refusal. Leaving
   the box blank puts the screen back the way it is for whoever is reading from it: every mark
   scheme open, no Check button in the way.

   `prompt` RATHER THAN A SHEET, deliberately. openSheet is the app's own dialog and is the right
   thing for a form; this is one word, typed once a lesson, and a sheet that has to be built,
   opened, read and closed for one word is slower to use and far more to go wrong in the middle
   of a lesson. */
on('qp-who', () => {
  let name;
  try {
    name = window.prompt('Who is working? Leave it empty for the tutor\u2019s own view.',
                         whoIs_().replace(/^u:/, ''));
  } catch (e) { return; }
  if (name === null) return;
  name = String(name).trim().slice(0, 24);
  try {
    if (name) localStorage.setItem('workingAs', name);
    else localStorage.removeItem('workingAs');
  } catch (e) {}
  toast(name ? 'Working as ' + name : 'Back to the tutor\u2019s view');
  repaint();
});

/* SAVED AS IT IS TYPED, through a delegated listener rather than a handler per box — there are
   thousands of these and only one of them is ever being typed into. No Save button, because there
   is nothing to save it TO and a button that only wrote to the same browser would be a promise the
   app cannot keep. */
document.addEventListener('input', e => {
  const el = e.target && e.target.closest && e.target.closest('[data-do="qp-ans"]');
  if (!el) return;
  try { localStorage.setItem(el.getAttribute('data-k') || '', el.value || ''); } catch (err) {}
});


/* ==================================================================================================
   SOME ANSWERS ARE A MARK ON THE PICTURE, AND A TEXTAREA CANNOT HOLD ONE.

   REPORTED AS "what about questions which have diagrams and you are meant to draw on them? the
   answer box bit will need a rework right." Right. "Draw a box plot for this information",
   "enlarge shape P by scale factor -1/2", "mark with a cross the probability that…", "draw a line
   of best fit" — the paper's answer space IS the diagram, and `ansBox_` above offers a box for
   words. Somebody working through November 2017 Paper 1 could write "the median is at 165" and
   could not do what the question asked, which is worth three marks.

   SO THE DIAGRAM ITSELF TAKES THE PEN. `padWrap_` lays a transparent SVG over the question's own
   picture, at the picture's own coordinates, and a finger draws on it. That is what a printed paper
   is: the figure and the answer space are one object.

   ONLY WHERE THERE IS A REAL PICTURE TO DRAW ON, and that restraint is the whole design. 130
   questions in the library say "draw" or "annotate" and 128 of them have no figure transcribed
   yet. Generating a blank grid for those would be worse than leaving them: "on the grid, enlarge
   triangle T by scale factor -2 with centre (-2, -2)" over squared paper with no axes and no
   triangle T is a question you cannot answer wearing the clothes of one you can — the same fault
   as the renderer that printed "not drawn yet" off the `figure` column and was wrong on ~120
   questions. `check-library.js` prints how many are waiting, so it is a backlog and not a silence.

   THE PEN IS OFF UNTIL YOU ASK FOR IT. A surface that takes the finger has `touch-action: none`,
   and a `touch-action: none` region taller than the phone is a region you cannot scroll past —
   the page would trap you on a diagram. Off, the pad is an ordinary picture and the screen behaves
   exactly as it did. One tap on a 44px control turns it on, and the pad says so with a gold frame,
   because a mode you cannot see is a mode that surprises you.

   MARKS ARE STORED IN THE PICTURE'S OWN COORDINATES, not in pixels. Every diagram here lays out
   inside `viewBox="0 0 340 H"` (see the note about `W` in CLAUDE.md), so a stroke recorded there is
   the same stroke on a 320px phone and a 1280px laptop. Pixels would put yesterday's answer half an
   inch off the axis the moment you turned the phone.

   SAME STORAGE AND SAME REASON AS `ansBox_`: these cards are rebuilt on every repaint, and a
   rebuilt SVG is an emptied one. `pad:<row_id>` sits beside `ans:<row_id>`, every read and write
   wrapped, because private mode THROWS on `localStorage` rather than answering null.

   GOLD, BECAUSE THE PAPER'S INK IS `currentColor`. Your marks have to be visibly yours — that is
   what a pen on a printed paper does, and it is what lets you tell your line of best fit from the
   axis it was drawn against.
--------------------------------------------------------------------------------------------- */
const padKey_ = x => 'pad:' + ((x && (x.key || x.name)) || '?');

/* WHICH QUESTIONS GET ONE. The sheet says what kind of answer it wants, and two of its words mean
   "make a mark": `drawing` (produce a figure) and `annotate` (add to one). Both need a surface and
   neither has anywhere else to go. Everything else — a calculation, an explanation, a proof — is
   words, and words already have a box. */
const PAD_TYPES = { drawing: 1, annotate: 1 };
const padWanted_ = x => !!PAD_TYPES[String((x && x.answerType) || '').trim().toLowerCase()];

/* THE PICTURE IT DRAWS ON, WHICH IS NOT ALWAYS THE QUESTION'S OWN. November 2017 Q12(a) is "draw a
   box plot for this information" and the empty grid is on the question's PREAMBLE, because parts
   (a) and (b) share it — exactly what a preamble is for. So this reads the same list `preamble_`
   built, innermost last, and takes the last picture on the card: the one nearest the part being
   asked is the one the part is about.

   IT RETURNS THE MARKUP, NOT A FLAG, so `questionCard_` can draw the picture in the pad INSTEAD of
   in its usual figure. Drawing it in both is the fault where every widget printed its name twice. */
function padSource_(x) {
  if (!x || !padWanted_(x)) return null;
  if (x.diagram) return { svg: x.diagram, from: 'part' };
  const stems = (x.stems || []).filter(p => p && p.diagram);
  if (stems.length === 1) return { svg: stems[0].diagram, from: stems[0] };
  return null;
}

function padRead_(k) {
  try {
    const v = JSON.parse(localStorage.getItem(k) || '[]');
    return Array.isArray(v) ? v : [];
  } catch (e) { return []; }
}

/* A STROKE IS A POLYLINE AND THAT IS THE WHOLE FORMAT. `[[x,y,x,y,…], …]` — one flat list of
   rounded coordinates per stroke, because a list of {x,y} objects is three times the characters for
   the same marks and `localStorage` is a few megabytes shared with everything else this app keeps.
   Rounded to whole units of a 340-wide picture, which is finer than a finger. */
const padPath_ = st => {
  let d = '';
  for (let i = 0; i + 1 < st.length; i += 2) d += (i ? 'L' : 'M') + st[i] + ' ' + st[i + 1];
  /* A SINGLE TAP IS A DOT, and a dot is a real answer — "mark with a cross" starts as one, and a
     `<path>` with one point paints nothing at all. Repeating the point gives it length, and
     `stroke-linecap: round` makes that length a disc. */
  return st.length === 2 ? `M${st[0]} ${st[1]}L${st[0]} ${st[1]}` : d;
};

function padWrap_(x, svg, credit) {
  const k = padKey_(x);
  const marks = padRead_(k);
  /* THE OVERLAY TAKES ITS BOX FROM THE PICTURE UNDER IT, by stretching to the same box, rather
     than by parsing a viewBox out of the drawing's markup. `preserveAspectRatio="none"` is what
     makes that exact: 340 units of user space map to the box's width and 340 to its HEIGHT
     whatever shape the box is, which is the same arithmetic `padAt_` does on a pointer. Reading
     the drawing's own viewBox instead would mean trusting a string, and a diagram that ever
     omitted one would silently put every mark in the wrong place.

     WHAT `none` COSTS IS STROKE WIDTH — a vertical line and a horizontal one would come out
     different thicknesses on any box that is not square. `vector-effect="non-scaling-stroke"` is
     the answer to exactly that: the width is measured on the screen rather than in the stretched
     user space, so the pen is one pen. */
  return `<div class="qpad" data-k="${esc(k)}">
    <div class="qpad-art">${svg}
      <svg class="qpad-ink" viewBox="0 0 340 340" preserveAspectRatio="none" aria-hidden="true">
        <g class="qpad-g" vector-effect="non-scaling-stroke">${marks.map(st =>
          `<path vector-effect="non-scaling-stroke" d="${padPath_(st)}"/>`).join('')}</g>
      </svg>
    </div>${credit || ''}
    <div class="qpad-bar">
      <button type="button" class="qpad-btn" data-do="pad-draw" aria-pressed="false">Draw on it</button>
      <button type="button" class="qpad-btn" data-do="pad-undo">Undo</button>
      <button type="button" class="qpad-btn" data-do="pad-clear">Clear</button>
    </div>
    <p class="qpad-note">Kept on this phone only, like the answer box.</p>
  </div>`;
}

/* ---------- THE PEN ------------------------------------------------------------------------------
   ONE SET OF LISTENERS FOR THE WHOLE APP, delegated, for the reason the answer box gives: about
   five question cards exist at any moment and only one of them is ever being drawn on.

   POINTER EVENTS, NOT TOUCH EVENTS, so a mouse, a finger and a stylus are one code path. The
   capture is what makes a stroke survive the finger leaving the picture — without it, drawing off
   the edge of a diagram ends the line there and the next move starts a new one somewhere else.

   THE STROKE IS BUILT IN THE PICTURE'S COORDINATES AS IT IS DRAWN, and written to storage once, at
   the end. Writing per move would be a `localStorage` write every few milliseconds, which is
   synchronous and on the main thread. */
let PAD_ON = '';                  // the key of the pad currently taking the pen, '' for none
let PAD_ST = null;                // the stroke being drawn

function padAt_(ink, e) {
  const r = ink.getBoundingClientRect();
  if (!r.width || !r.height) return null;
  return [Math.round((e.clientX - r.left) / r.width * 340),
          Math.round((e.clientY - r.top) / r.height * 340)];
}

document.addEventListener('pointerdown', e => {
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  if (!ink) return;
  const pad = ink.closest('.qpad');
  if (!pad || pad.getAttribute('data-k') !== PAD_ON) return;
  const at = padAt_(ink, e);
  if (!at) return;
  e.preventDefault();
  PAD_ST = at.slice();
  const g = ink.querySelector('.qpad-g');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', padPath_(PAD_ST));
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  path.setAttribute('data-live', '1');
  if (g) g.appendChild(path);
  try { ink.setPointerCapture(e.pointerId); } catch (err) {}
});

document.addEventListener('pointermove', e => {
  if (!PAD_ST) return;
  const ink = e.target && e.target.closest && e.target.closest('.qpad-ink');
  if (!ink) return;
  const at = padAt_(ink, e);
  if (!at) return;
  /* ONE POINT PER PIXEL OF THE PICTURE, not one per event. A pointer fires far faster than a
     finger moves anything visible, and every duplicated point is two more characters in storage
     for a mark nobody can see. */
  if (PAD_ST[PAD_ST.length - 2] === at[0] && PAD_ST[PAD_ST.length - 1] === at[1]) return;
  PAD_ST.push(at[0], at[1]);
  const live = ink.querySelector('[data-live]');
  if (live) live.setAttribute('d', padPath_(PAD_ST));
});

function padEnd_(e) {
  if (!PAD_ST) return;
  const st = PAD_ST; PAD_ST = null;
  const ink = document.querySelector('.qpad-ink [data-live]');
  const pad = ink && ink.closest('.qpad');
  if (ink) ink.removeAttribute('data-live');
  if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  const all = padRead_(k); all.push(st);
  try { localStorage.setItem(k, JSON.stringify(all)); } catch (err) {}
}
document.addEventListener('pointerup', padEnd_);
document.addEventListener('pointercancel', padEnd_);

/* THE THREE CONTROLS. `Draw on it` is a MODE and not an action, so it says which it is with
   `aria-pressed` and a class — see the note at the top of this block about why the pen cannot
   simply always be on. Only one pad takes the pen at a time: turning one on turns the last one
   off, because two live `touch-action: none` regions on one scroller is the trap twice. */
on('pad-draw', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  const want = PAD_ON !== k;
  [].slice.call(document.querySelectorAll('.qpad.is-drawing'))
    .forEach(p => p.classList.remove('is-drawing'));
  [].slice.call(document.querySelectorAll('[data-do="pad-draw"]')).forEach(b => {
    b.setAttribute('aria-pressed', 'false'); b.textContent = 'Draw on it';
  });
  PAD_ON = want ? k : '';
  if (want) {
    pad.classList.add('is-drawing');
    el.setAttribute('aria-pressed', 'true');
    el.textContent = 'Done drawing';
  }
});

on('pad-undo', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  const all = padRead_(k);
  if (!all.length) { toast('Nothing to undo'); return; }
  all.pop();
  try { localStorage.setItem(k, JSON.stringify(all)); } catch (err) {}
  padRepaint_(pad, all);
});

on('pad-clear', (el) => {
  const pad = el.closest('.qpad'); if (!pad) return;
  const k = pad.getAttribute('data-k') || '';
  if (!padRead_(k).length) return;
  try { localStorage.removeItem(k); } catch (err) {}
  padRepaint_(pad, []);
  toast('Cleared');
});

/* REPAINTED FROM THE STORED MARKS RATHER THAN BY REMOVING A NODE, so that what is on the screen is
   always exactly what would come back on a reload. An undo that deleted the last `<path>` and an
   undo that rewrote the list from storage look identical until the two disagree, and then the one
   that disagrees is the one you find out about a week later. */
function padRepaint_(pad, all) {
  const g = pad.querySelector('.qpad-g');
  if (g) g.innerHTML = (all || [])
    .map(st => `<path vector-effect="non-scaling-stroke" d="${padPath_(st)}"/>`).join('');
}

/* ==================================================================================================
   A PICTURE THIS SITE DREW IS LABELLED AS ONE.

   SIX QUESTIONS IN THE CORBETTMATHS MONEY SHEET COULD NOT BE ANSWERED AT ALL. "Natalie has these
   coins. How much money does Natalie have?" — and there were no coins: the whole of the data was in
   an image, and the transcription is a text layer. They sat in the library looking complete, which
   is worse than being absent, because a child is served a question with no answer in it and assumes
   the fault is theirs.

   THE ORIGINALS CANNOT BE RECOVERED. corbettmaths.com is blocked from the agent's environment by
   the same network policy that blocks every Google host, so the coins Natalie actually had are not
   knowable from here. The choice was to leave six broken questions or to draw a set.

   SO THE SET IS DRAWN AND THE CARD SAYS SO. Choosing the coins CHOOSES THE ANSWER — this is no
   longer Corbettmaths' question, it is one of ours wearing their words, and passing it off as
   theirs would be the same class of mistake as a transcription that swallowed a coefficient: it
   still reads sensibly and it is a different question. One line under the figure is the whole cost
   of being honest about it.

   `diagram_by` IS THE COLUMN, and it has exactly two meanings: absent means the picture came off
   the paper, `family` means this site drew it. Anything that ever lists a question's provenance
   reads that one field rather than guessing from the SVG. */
/* ---------- A PICTURE THE QUESTION CAME WITH -----------------------------------------------------
   `loading="lazy"` BECAUSE A RESULT PAGE HOLDS SEVERAL AND YOU ARE LOOKING AT ONE. `fillStuffPages`
   already only builds the pages you are near, and this is the same argument one level down.

   NO ALT TEXT INVENTED. A photograph used as a writing prompt is the subject of the question — a
   description of it written here would be a different prompt, and a wrong one. The figure is
   labelled as the question's picture and the question's own words say what to do with it, which is
   what a printed paper does too. */
const pics_ = list => (list || []).map(src =>
  `<figure class="qpic"><img src="${esc(src)}" alt="Picture printed with this question"
     loading="lazy" decoding="async"></figure>`).join('');

/* TWO WAYS THIS SITE CAN HAVE DRAWN ONE, AND THE CARD HAS TO SAY WHICH. See the note on
   `DIAGRAM_BY` in check-library.js: `family` is a picture REDRAWN from what the paper prints, where
   the question, the figures and the answer are all still the board's; `family-set` is one whose
   CONTENT we chose, because the original was lost and the question could not be answered without
   one — and choosing the coins chose the answer.

   ONE SENTENCE FOR BOTH WAS A REAL FAULT AND A SCREENSHOT CAUGHT IT. This said "these are our coins
   and our answer" on every credited row, so an Edexcel probability scale, redrawn line for line off
   the paper, carried a line telling the student the figures had been made up. Nothing could have
   flagged it: the markup was valid, the card fitted, and the sentence had been true of every row
   that existed on the day it was written. */
const FIG_BY = {
  'family': `drawn for @family. from the paper's own figures — the original is the board's and is
             not reproduced here`,
  'family-set': `drawn for @family. — the original worksheet's picture did not come across in the
                 text, so these are our coins and our answer`,
};
/* THE ELEMENT IS AN ARGUMENT BECAUSE THE CREDIT SITS IN TWO DIFFERENT PLACES. Inside a `<figure>`
   the right element is `<figcaption>`; a drawing pad is not a figure — it is a picture, an ink
   layer, three controls and a line of prose — and a `<figcaption>` outside a `<figure>` is markup
   no parser is obliged to keep. One sentence, two containers, and the class does the styling. */
const figCredit_ = (x, tag) => (FIG_BY[x.diagramBy]
  ? `<${tag || 'figcaption'} class="fig-by">${FIG_BY[x.diagramBy]}</${tag || 'figcaption'}>` : '');

/**
 * THE DAY A PAPER WAS SAT, WHEN THE ROW SAYS — "Thursday 25 May 2017".
 *
 * WRITTEN BECAUSE A SERIES IS NOT A DATE AND SOMEBODY ASKED FOR THE DATE. `seriesOf_` names the
 * button "Summer 2017", which is true of every paper in the series and is what a filter needs; the
 * note above it records the day that stopped being enough. What a tutor sitting down with a student
 * says is "the Thursday 25 May 2017 paper", and until now that sentence existed nowhere in the app:
 * `exam_date` went into the file, passed `check-library.js`, and NOTHING READ IT. A column written
 * and never read is this repository's oldest fault, and it is on the second page of CLAUDE.md under
 * `figure`, under `ticks_*` and under `orderPrints`.
 *
 * READ BY PATTERN AND BUILT IN UTC, never `new Date('2017-05-25')` against the machine's clock — a
 * paper that is Thursday in London and Wednesday in New York is the `waveOf` timezone fault in a
 * second column, and that one cost seven buttons.
 *
 * ABSENT ON ALMOST EVERY ROW, AND THAT IS THE DESIGN. One paper carries a date so far, because a
 * date is a fact somebody has to know rather than derive: Edexcel took the exam date off the front
 * page in 2021 and the © line narrows it to a year. So this draws nothing rather than guessing, and
 * the paper's own name — which always carries its month — goes on being the subtitle either way.
 */
function satOn_(x) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String((x && x.row && x.row.exam_date) || ''));
  if (!m) return '';
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  if (!isFinite(d.getTime()) || d.getUTCMonth() !== Number(m[2]) - 1) return '';
  /* `WEEKDAYS` RUNS MONDAY-FIRST — it is the booking grid's list, and a week that starts on Monday
     is what every UK timetable in this app already assumes. `getUTCDay()` counts from Sunday. */
  return `${WEEKDAYS[(d.getUTCDay() + 6) % 7]} ${d.getUTCDate()} `
       + `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

function questionCard_(x) {
  const fig = d => (d ? `<figure>${d}</figure>` : '');
  const sat = satOn_(x);
  const needs = asList_(x.needs);
  /* THE PICTURE THAT TAKES THE PEN, IF THERE IS ONE — see `padSource_` above. It is drawn INSIDE
     the pad and therefore not in its usual place: a diagram rendered twice on one card is the
     fault every widget had when the roster's name sat above its own heading, and here the second
     copy would be the one you cannot write on. */
  const pad = padSource_(x);
  return `<div class="qcard">
    <div class="qcard-top">
      <b>${esc(x.name)}</b>
      ${/* NOTHING RATHER THAN "0 marks". A Corbettmaths worksheet prints no mark allocation --
            it is practice, not an exam -- and a row with no `marks` cell was reading "0 marks",
            which says the question is worth nothing rather than that nobody has said. Same
            distinction as a blank price reading "free": absent is not zero. */''}${
        Number(x.marks) > 0
          ? `<span>${esc(x.marks)} mark${Number(x.marks) === 1 ? '' : 's'}</span>` : ''}
    </div>
    <p class="qcard-sub">${esc(x.sub)}${
      sat ? `<span class="qcard-sat">sat ${esc(sat)}</span>` : ''}${
      /* WHAT TO BRING, WHERE IT IS READ RATHER THAN FILTERED FOR. The funnel can narrow by it, but
         the person who needs this most is the one who has already chosen the question and is about
         to walk into a lesson — so it belongs on the card, not only on a chip. Drawn only when the
         row says something; a blank one prints nothing rather than "nothing needed", because those
         are different claims and only one of them has been checked. */''}${
      needs.length ? `<span class="qcard-needs">${esc(needs.join(' · '))}</span>` : ''}</p>
    <div class="qsheet">
      ${/* `is-standin` MARKS A PREAMBLE THAT IS A DESCRIPTION OF THE REAL THING RATHER THAN IT.
            An AQA English insert is a separate booklet of third-party copyright, so the source is
            not in the paper and cannot be here either — what is in the row is enough to teach
            around. A student reading an exam question has to be able to tell at a glance which of
            the two they are looking at; the same argument as `figCredit_` one screen down. */''}
      ${(x.stems || []).map(p =>
        `<div class="qsheet-stem${p.placeholder ? ' is-standin' : ''}">${
          /* WHICH PART OF THE SOURCE THIS IS, when the insert has been split into several. Every
             AQA reading question names a span -- "lines 1 to 6", "from line 20 to the end" -- so
             a part with no label leaves the student holding four blocks of prose and the same
             problem the split was supposed to solve. Drawn only when the row says one: a paper
             whose insert is a single part prints no heading, which is why this needed no
             migration. */''}${
          p.lines ? `<p class="qsheet-lines">${esc(p.lines)}</p>` : ''}${p.html || ''}${
          /* THE PICTURE SWAPPED FOR THE PAD, AND NOTHING ELSE. The first version returned the pad
             INSTEAD of this whole block, which threw the preamble's PROSE away with it: November
             2017 Q12(a) is "draw a box plot for this information" and the information is the table
             in that prose, so the card offered an empty grid and no figures to put on it. A
             question made unanswerable by the feature meant to make it answerable, and no check
             could see it — the markup was valid, the card fitted, nothing threw. A screenshot
             caught it, which is the third time this file records that sentence. */''}${
          pad && pad.from === p ? padWrap_(x, p.diagram) : fig(p.diagram)}${
          pics_(p.images)}</div>`).join('')}
      ${x.lead ? `<div class="qsheet-lead">${x.lead}</div>` : ''}
      <div class="qsheet-part">
        <div class="qsheet-pb">${x.html || ''}${
          /* THE DIAGRAM, AFTER THE PROSE, where a printed paper puts it. See the `diagram`
             column in js/library.js, and `figCredit_` above for the ones we drew. */''}${
          pad && pad.from === 'part' ? padWrap_(x, x.diagram, figCredit_(x, 'p'))
            : x.diagram ? `<figure>${x.diagram}${figCredit_(x)}</figure>` : ''}${
          pics_(x.images)}</div>
      </div>
    </div>
    ${/* YOUR BOX FIRST, THE MARK SCHEME UNDER IT, and the order is the whole point: an answer you
          can see before you have written one is not a question. */''}
    ${ansBox_(x)}
    ${answerBlock_(x)}
  </div>`;
}


/* `topicBy` WAS HERE — a document by id, falling back to its name. Nothing has a document to look
   up any more; see the note above `questionItems`. */

/* `printPrice` WAS HERE, AND I SAID ONE COMMIT AGO THAT `cartMoney_` STILL READ IT. It does not —
   `cartMoney_` reads `laminatePrice`, which is a different function with the same shape, and I
   checked the shape rather than the caller. `check-dead.js` named it on the next run, which is what
   that check is for.

   WHAT A PRINT COSTS is `laminatePrice` below plus nothing, until something lists whole papers
   again. See the note above `topicTiles_` in tiles.js for why nothing does. */



/* ---------- AND WHAT LAMINATING ONE COSTS ---------------------------------------------------------
   THE SAME SHAPE AS `printPrice` AND FOR THE SAME REASONS, which is the point of writing it here
   rather than three lines of arithmetic wherever the basket happens to need it.

   NO RATE IN THE SHEET MEANS LAMINATING IS OFF, NOT FREE. `printPrice` already makes that argument
   and it is sharper here: a laminating pouch and the machine's time are a real cost, so a site that
   offered it at £0.00 because nobody had filled in a cell would be selling something at a loss, on
   every order, silently. `null` is the answer to "we do not do this", and the basket draws nothing
   rather than drawing a free upgrade.

   PER PAGE, because that is what it is — every sheet goes through the machine separately — with a
   minimum for the same reason printing has one: the first sheet costs more than the second in
   everything except paper. */
function laminatePrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0) return null;
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.laminate_rate_per_page);
  if (isNaN(rate) || rate <= 0) return null;      // rate not set: laminating is off, not free
  const min = num(v.laminate_minimum) || 0;
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

/* WHAT A BASKET LINE ACTUALLY COSTS, in one place. `cart-add` writes `money` for a paper and the
   laminate upgrade is a flag on the line rather than a second number — so the price is DERIVED
   every time it is asked for, and a line laminated last week is repriced if the sheet's rate
   changes before anybody pays. Storing the sum instead would have frozen a price nobody agreed to,
   and would need the subtraction to be got right in the one place that takes the upgrade off. */
const cartMoney_ = c => (Number(c && c.money) || 0)
  + (c && c.laminate ? (laminatePrice(c.pages) || 0) : 0);

/* `canPrint` WAS HERE — whether a printed copy is offered at all, an explicit FALSE in the sheet
   beating any page count. Its two callers were `topicTiles_`'s Paper tile and `cart-add`'s `print`
   branch, both gone with the documents. `printPrice` above stays: `cartMoney_` and `laminatePrice`
   still read it for a basket line saved before this change. */



/* ---------- THE THREE PASSES WERE HERE, AND THEY ARE NOT COMING BACK IN THIS SHAPE ---------------
   `myTicks`, `tickRow`, `on('ticks')` AND `on('tick')` drew three checkboxes under every trackable
   document and posted `toggleTopicTick`. A tick was stored as a NAME in a list, three lists per
   document — which is what made "who has done this" answerable as well as "have I" — and the lists
   lived in `ticks_1..3` on the document's row.

   THEY HELD THE HANDLES OF REAL CHILDREN. 529 cells of them. When the questions tab moved into this
   repository those three columns were stripped at source, because this repository is public and a
   child's handle beside a date is not library data. The tab itself is `data/questions.json` now, the
   backend handler is gone with it, and there is nothing left for a box to write to.

   THE RIGHT HOME FOR THEM IS `Ledger`, one row per person per document, which is what a tick always
   was: a fact about a PERSON and a document, filed under neither. Written that way it would not
   have moved with the library at all. Three boxes that accept a tap and lose it are worse than no
   boxes, so there are none.
--------------------------------------------------------------------------------------------- */

/* The rate as a number of pence, for the line that spells the sum out. */
const printRatePence = () => {
  const r = num(((DATA.constants || {}).vars || {}).print_rate_per_page);
  return isNaN(r) ? 0 : Math.round(r * 100);
};

/* One list, so the four controls act on everything rather than on one half — a filter that
   silently ignores the shop is a filter nobody trusts twice.

   The RAW fields are kept on each item rather than a pre-computed group label. Grouping is a
   question asked at draw time; baking the answer in meant changing the dropdown could not change
   the shop items, because their label had already been decided. */
/* ---------- THE SAME LIST, NOT THE SAME LIST REBUILT --------------------------------------------
   EVERY MAPPER BELOW RUNS ON EVERY CALL, and `questionItems` alone is 4,000 rows of HTML stripped
   for the search haystack: MEASURED at 31 ms, inside 33 for the whole build. `stuffFiltered` asks
   for this whenever its own memo misses — which is every filter change and every keystroke — and
   the answer is identical every time, because NOTHING here reads a filter. It reads `DATA`, whether
   you are an admin, and which person you are.

   SO IT IS KEYED ON EXACTLY THOSE THREE. `DATA` by identity, the way `stuffFiltered` already tests
   it one level up — a new payload is a new object and a reload rebuilds. The other two because two
   mappers are gated on them: widgets marked `admin`, and the live sessions `liveWidgets_` builds
   from the jobs you are in.

   AND HOLDING THE ITEMS IS WHAT MAKES THE SORT KEYS FREE. `sortKey_` caches on the item; rebuilding
   the items every call threw that cache away at the same rate it was filled. */
let ITEM_MEMO = { key: null, from: null, items: null };
/* ---------- AND THE SAME MEMO AGAIN FOR THE UNFILTERED LIST ---------------------------------------
   TWO LISTS, TWO MEMOS, ONE BUILD. `stuffItemsAll_` is what `stuffItemsBuild_` filters and what the
   saved things are looked up in, and both are asked for on every repaint — so caching only the
   filtered one would rebuild four thousand items every time anything wanted the other.

   A SEPARATE ARRAY EACH, deliberately, not one array read two ways. `facetTally_` holds its counts
   in a `WeakMap` keyed on the items array itself and `FIND_MEMO` tests `DATA` by identity; handing
   the same array to both lists would make a tally of the funnel answer for the saved list too.
   Same key on both, so they are filled and dropped together. */
let ALL_MEMO = { key: null, from: null, items: null };

const itemMemoKey_ = () =>
  (isAdmin() ? 'a' : '-') + '|' + (USER ? (USER.personId || USER.name || 'u') : '-');

/* ---------- EVERY ITEM THE APP HAS, INCLUDING THE ONES THE FUNNEL DOES NOT OFFER ------------------
   THE FUNNEL'S EDITORIAL DECISIONS ARE ABOUT WHAT TO OFFER, NOT ABOUT WHAT EXISTS. Booking is not a
   question this screen asks any more, and tools and games have not been for longer — but a thing
   somebody STARRED is theirs, and a list they kept should not empty itself because a question
   stopped being asked.

   FOUND BY AUDITING FAVOURITES, and it was a fault I had just made: `collItems_` filters
   `stuffItems()`, so the moment Booking left the funnel every starred tutor, venue and session
   vanished from Saved — silently, on a list whose whole job is to not lose things. `savedPages_`
   reads this instead. The star still works, the row is still in the sheet, and the card comes back.

   TOOLS AND GAMES ARE NOT IN EITHER LIST, and that is untouched: they were removed from the build
   itself rather than filtered out of it, so nothing here can bring them back. Worth knowing the
   two decisions are made in different places, because only one of them is reversible from here. */
function stuffItemsAll_() {
  const key = itemMemoKey_();
  if (ALL_MEMO.from === DATA && ALL_MEMO.key === key) return ALL_MEMO.items;
  const built = stuffItemsRaw_();
  ALL_MEMO = { key: key, from: DATA, items: built };
  return built;
}

function stuffItems() {
  const key = itemMemoKey_();
  if (ITEM_MEMO.from === DATA && ITEM_MEMO.key === key) return ITEM_MEMO.items;
  const built = stuffItemsBuild_();
  ITEM_MEMO = { key: key, from: DATA, items: built };
  return built;
}

/* ---------- BOOKING IS NOT IN THE FUNNEL, AND THIS IS THE TOOLS AND GAMES DECISION AGAIN -------
   REPORTED AS "remove booking from the finder", and the argument is the one already written a few
   hundred lines below about the widgets: a booking is not a thing you FIND, it is a thing you DO,
   and it has a column of its own where the form, the basket and your sessions all are. Answering
   `What for · Booking` on the Find screen put that same twelve-question form in front of somebody
   who had come to look for a past paper, and then offered Tutors, Venues, Subjects, Levels and
   Receipts underneath it — five answers that are one swipe away on a screen built for them.

   IT IS THE GROUP, NOT A LIST OF KINDS. `kindOf_(x).group` is what the `forLabel` facet reads, so
   a kind added to Booking tomorrow leaves the funnel with nothing added here — and a rule naming
   `tutor, venue, subject, level, receipt` is a rule that goes stale on the sixth. `kindMap_`
   overlays the `kinds` tab, so moving a kind out of Booking in the spreadsheet puts it back in the
   funnel: that is the escape hatch and it is deliberate.

   NOTHING WENT DARK, AND THAT IS THE WHOLE CARE IN THIS CHANGE. Each of the five had to have
   somewhere else to be BEFORE the answer was removed, because a thing that is only reachable
   through a door you have just bricked up is a deletion wearing a tidy-up's clothes:
     · TUTORS      — the account column, one page each, with the Message tile. See `accountPages_`.
     · RECEIPTS    — the Booking column. `bookBlocks` draws one page per session again; the note
                     there says they were taken out precisely BECAUSE they were results here, so
                     this change had to undo that half in the same commit.
     · VENUES      — the booking form's venue dropdown, which is the only thing anybody did with
                     one. The slip card is not drawn anywhere now, and that is the real cost.
     · SUBJECTS
       AND LEVELS  — the same: dropdowns on the form. `subjectRows` and `levelRows` still build,
                     because the booking form and the pricing read them.

   WHAT IT COSTS, WRITTEN WHERE THE CODE WAS so it is not rediscovered as a bug: typing `richmond`
   into Find returns nothing, deliberately, and so does a tutor's name. The fix is this filter, not
   another mapper. */
const FUNNEL_NOT_FOR = 'Booking';

function stuffItemsBuild_() {
  return stuffItemsAll_().filter(x => {
    /* READ EXACTLY AS THE `forLabel` FACET READS IT — `x.groups || kindOf_(x).group`, through
       `asList_` — so what leaves the funnel is what would have answered `Booking` and nothing
       else. A thing in Booking AND another group still answers the other door, so it stays: the
       array form has been supported since a tutor was two things, and a filter that ignored it
       would silently drop a kind from a group it belongs in. */
    const g = asList_(x.groups || kindOf_(x).group);
    return !(g.length === 1 && g[0] === FUNNEL_NOT_FOR);
  });
}

function stuffItemsRaw_() {
  return [
    /* ---------- PEOPLE, PLACES AND SUBJECTS -----------------------------------------------------
       Find and Stuff were two tabs asking the same question — where is the thing I want — split by
       a distinction nobody makes while looking: people and places on one, objects on the other.
       Somebody who wants Maths does not know whether they need a tutor, a venue, a subject page or
       a past paper, and being made to guess which tab holds it is the whole problem.

       They can be one list now because the funnel skips a question most of the set cannot answer.
       That was the objection to merging and it is answered: choose Tutors and you will never be
       asked about exam boards, because a tutor has none and the coverage rule sees it. */
    /* THE DOCUMENTS THE BUSINESS PUBLISHES. Built in terms.js from the `terms` tab, so a clause
       changes in a spreadsheet rather than in a file — and an empty tab is an empty list rather
       than a group with nothing in it. */
    ...(typeof docItems_ === 'function' ? docItems_() : []),
    ...(DATA.tutors || []).filter(t => t.title).map(t => ({
      kind: 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
      cost: priced_(t.rate), off: t.listed === false, row: t,
    })),
    ...(DATA.venues || []).filter(v => v.title).map(v => ({
      kind: 'venue', name: v.title, key: v.title, sub: v.subtitle || '', image: v.image,
      cost: priced_(v.bestRate), row: v, borough: v.borough || v.city || '',
    })),
    /* A LINK IS A THING YOU ARE LOOKING FOR TOO. It lives on its own tab as a wall of tiles —
       which is the right way to SCAN ninety of them — and it was reachable no other way, so
       somebody who half-remembers "that BBC one" had to know which tab to go to before they could
       search for it. Here it is searchable and filterable like everything else. */
    /* The widgets, findable like everything else. Searching "timer" now finds the timer, which on
       a tab it never could.

       ---------- AND SOME ARE NOT FOR EVERYBODY ---------------------------------------------------
       THE WIDGETS TAB HAS A `roles` COLUMN and nothing has ever read it — every widget has been
       shown to every person since the tab was made. That did not matter while they were all games
       and a calculator; it matters the moment one of them prints your flyers.
       `admin` on a widget means admins only. Anything without it is for everybody, which is what
       the other nine are. */
    /* ---------- THE WIDGETS ARE NOT IN THE FUNNEL, AND THIS IS THE SECOND DECISION ON IT ---------
       THEY WERE PUT BACK HERE ON A MEASUREMENT AND TAKEN OUT AGAIN ON A JUDGEMENT, so both halves
       are worth keeping. The measurement was real: `.filter(wgt => … && wgt.groups)` had a second
       test that was ALWAYS FALSE — 16 widgets declared, 0 carrying `groups` — so `stuffItems()`
       returned zero items of kind `tool` or `game` and typing `calculator` into the search box
       found nothing. That was a filter emptying a list while looking like a design.

       THE JUDGEMENT IS THE OWNER'S AND IT OVERRULES IT. A tool is not a thing you FIND, it is a
       thing you OPEN, and it has a column of its own where all sixteen are laid out as tiles — two
       swipes, no question to answer first. Putting them in the funnel made the app's search return
       a calculator beside a past paper, and `What kind` grew two answers that are two other
       screens. The Find screen is for the library and the people; Tools and Games are where tools
       and games are.

       WHAT THAT COSTS, SO IT IS NOT REDISCOVERED AS A BUG: typing `calculator` here finds nothing
       again, deliberately. If it should, this is the four lines that were here — the fix is these,
       not another `wgt.groups`. */
    /* FRIENDS. People are found on the Find tab like everything else — they were a card on You,
       which made them a setting about yourself rather than a set of people you can look through.
       Only somebody who has a checklist and a score has any: a parent has no scoreboard to compare
       and no reason to collect handles. */
    ...(canTrack() ? friendHandles().map(h => {
      const s2 = (DATA.students || []).find(x => norm(x.handle) === norm(h)) || {};
      return {
        kind: 'friend', name: s2.name || h, key: 'friend:' + h, sub: h, image: '',
        row: Object.assign({ handle: h }, s2),
      };
    }) : []),
    /* ---------- THE POSTS -------------------------------------------------------------------
       READ OFF `DATA.posts` AND FILTERED THE SAME WAY THE FEED FILTERS. `feedPosts` cannot be
       reused here — it returns finished cards, not rows — so the one rule that matters is repeated
       rather than the whole function: a deleted post is gone for everybody, including the admin who
       deleted it. Anything else the feed does to the list is ordering, and ordering is the funnel's
       job here, not the feed's.

       WHAT IS SEARCHED IS THE CAPTION. `name` is what the text box matches against, and the caption
       is what somebody remembers about a post — "the one about the trip" — while the author is
       almost always the same handful of names. So the caption leads and the author is the subtitle,
       which is also the order they read in on the card itself. */
    /* THE POSTS WERE BUILT HERE and are not any more: the feed is a column. A post reachable two
       ways is two places for it to look different, and the funnel's copy was the real card — same
       reactions, same share, same admin controls — so the two could drift without either looking
       wrong on its own. `DATA.posts` is still read by the feed, which is the one place that draws
       them now. */
    ...(DATA.links || []).filter(l => l.title).map(l => ({
      kind: 'link', name: l.title, key: 'link:' + l.title, sub: '', image: '',
      row: l, category: l.category || '',
    })),
    ...(typeof subjectRows === 'function' ? subjectRows() : []).map(x => ({
      kind: 'subject', name: x.name, key: x.name, sub: '', image: '',
      subject: x.name, row: x,
    })),
    /* ---------- LEVELS -------------------------------------------------------------------------
       `subject` IS BLANK, and it is the one field somebody would be tempted to fill. A level runs
       across several subjects — that is the whole point of the card — so putting one of them in
       would make GCSE turn up when you filter to Maths and vanish when you filter to English,
       which is worse than it not answering the question at all. Blank is what keeps it out, the
       same way blank keeps a shop item out of the exam-board question.

       `keystage` IS ALSO BLANK. A key stage and a level are two different ladders — KS4 and GCSE
       describe the same year and are not the same fact — and folding one into the other would put
       two vocabularies in one dropdown, which is the mistake the boxer comment above already had
       to be talked out of once. */
    /* ---------- YOU, ONE ROW, ONLY WHEN SIGNED IN --------------------------------------------
       Everything on it is already on this device because it is yours — see the note on the `me`
       kind above for why nobody else joins it. */
    /* ---------- WHAT YOU ARE IN, WHAT YOU ARE WAITING FOR, AND WHAT IS DONE -------------------
       OFF `myJobs_`, WHICH IS THE ONE PLACE THAT KNOWS WHOSE SESSIONS ARE WHOSE — and off
       `jobIsPast_` and `isWaitJob_`, which are the two tests `pastCard_` and the sessions widget
       already use. Three lists from one source, so a session cannot be in two of them or none.

       SEARCHED BY SUBJECT AND LEVEL, which is what somebody types when looking for one — "maths
       gcse" rather than a job id. The tutor and the venue go in the subtitle, so the text box
       matches those too. */
    ...(typeof myJobs_ === 'function' ? myJobs_() : []).map(j => ({
      /* ONE KIND FOR ALL OF THEM — see the note on `receipt` above. `jobIsPast_` and `isWaitJob_`
         still decide how a card DRAWS and how the widgets split their lists; they no longer decide
         which answer a session lives under. */
      kind: 'receipt',
      name: [j.subject || 'Session', j.level].filter(Boolean).join(' · '),
      key: 'job:' + (j.id || j.jobId || ''),
      sub: [j.tutor, j.venue, j.weekday].filter(Boolean).join(' · '),
      cost: priced_(j.price), subject: j.subject || '', row: j,
      bandValue: j.level || '',
    })),
    /* YOU WERE AN ITEM HERE, under `People`, when you had no tutor row of your own. Removed with
       that group — the account column is your card, in full, one swipe right. The merge it guarded
       against is still guarded: a tutor row that is you draws `meCard`, which is where that note
       now lives, on the `tutor` entry in KINDS. */
    ...(typeof levelRows === 'function' ? levelRows() : []).map(x => ({
      kind: 'level', name: x.name, key: 'lvl:' + x.name,
      /* The subjects, under the name, so the list is readable before anything is opened. */
      sub: (x.subjects || []).join(' · '), image: '',
      row: x,
    })),
    /* `name` and `price`, which is what the payload actually calls them. I had written `title`
       and `cost` — so every shop item drew with no name and a price of zero. */
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      /* A SHOP ROW IS THE ONE PLACE `0` GENUINELY MEANS FREE — it is priced, and the price is
         nought. Everything else that used to write `cost: 0` was saying "I have no price", which
         is a different answer; see `priced_`. */
      /* ---------- AND A BLANK PRICE CELL IS NOT A PRICE OF NOUGHT, ON THIS MAPPER TOO ------------
         `Number(x.price) || 0` WAS HERE, under a comment defending the zero: "a shop row is the one
         place `0` genuinely means free — it is priced, and the price is nought." That is true of a
         cell holding `0` and false of a cell holding nothing, and `Number('') || 0` cannot tell
         them apart. This is the `cost: 0` fault on the one mapper that was exempted from the fix,
         because the exemption was written about the value and the bug is about the blank.

         AND THE BLANK IS NOT HYPOTHETICAL. `seedAvatarItems` wrote `price` and `currency` into a
         tab whose columns are `price_pence`, `price_ticks`, `price_coins` and `acquire`, so every
         wearable it seeded has an empty price and an empty `acquire` — and `doGet` reads `acquire`
         to decide which column to look in. Seven paid wearables, priced at nothing, drawn as FREE.
         `repairShopPrices` in setup.gs fixes the sheet; this stops the app claiming a price nobody
         has typed, which is a different job and the one that survives the next blank cell. */
      cost: priced_(x.price), slot: x.slot || '',
      /* THE EXAM FIELDS ARE NOT WRITTEN BLANK ANY MORE. `asList_` cannot tell `''` from `undefined`
         — both come out as no answer — so the ten blanks per row were ceremony. Leaving them off
         is the same behaviour and says the true thing: a beanie has no exam board. */
      /* WHETHER IT IS A WEARABLE, AND WHAT IT COSTS TO REACH.
         A wearable is priced in one of two currencies and the card only ever read one of them: a
         level-gated item has a price of zero, which was being drawn as "free" — an item saying
         free that cannot be taken is worse than one saying nothing, because somebody presses it. */
      wearable: isWearable(x),
      level: Number(x.level) || 0,
      artId: x.artId || '',
    })),
    /* A resource costs nothing, and the zero is written here rather than left undefined — so
       every sort, filter and label downstream sees a number and not a hole. */
    /* ---------- QUESTIONS, AS PARTS ----------------------------------------------------------
       ONE ITEM PER PART. The stem rows are not items — a stem is not something anybody searches
       for, it is the context a part needs — so they are looked up when a part is drawn and never
       listed in their own right.

       EVERY PAPER FIELD IS COPIED ONTO THE PART from its resource row, so a question answers the
       same facets its paper does: filtering to A-Level, Edexcel, 2022 narrows questions exactly
       as it narrows papers, and the funnel does not have to know it is looking at either. */

    /* A FIGHTER ANSWERS THE FUNNEL'S QUESTIONS IN HIS OWN WORDS. Division goes in `subject`, the
       one column every facet already knows how to group by, so Boxers narrows by division without
       a facet of its own. The exam fields stay blank, and blank is what keeps a boxer out of a
       list of past papers. */
    ...(DATA.boxers || []).filter(b => b.name).map(b => ({
      kind: 'boxer', name: b.name, key: 'bx:' + (b.id || b.name),
      sub: [b.bestDivision, b.country].filter(Boolean).join(' · '), image: b.image,
      /* ---------- A DIVISION IS NOT A SUBJECT -----------------------------------------------
         `subject` HELD THE DIVISION, written that way for a good-sounding reason: it is the column
         every facet already knows how to group by, so Boxers narrowed by division for free. What
         it cost was the Subject question, which then offered Maths, English, Heavyweight and
         Welterweight in one list — two vocabularies pretending to be one, with "Boxing" itself
         nowhere in it, which is the thing anybody would look for first.
         SO THE SUBJECT IS BOXING and the division is its own field. */
      /* WHICH OF THE TWO, asked before the weight. Boxers and fights are both resources about
         boxing — that is why they share a label — but they are not interchangeable, and a funnel
         that goes from Boxing straight to twenty weight classes has skipped the question anybody
         actually has first. */
      boxKind: 'Boxers',
      subject: 'Boxing', division: divisionOf_(b.bestDivision), row: b,
      /* ---------- `year: b.activeTo` WAS HERE, AND IT WAS HIS LAST YEAR DRAWN AS "Year" ----------
         FOUND BY THE AUDIT THAT ADDED `Decade` and only visible once that question existed: the
         funnel went Boxers → Decade → **Year** → Division, and the answers to Year were `1981` and
         `2005`. Those are the years Ali and Tyson STOPPED, which is not a fact anybody narrows a
         list of fighters by, and it sat between the decade and the weight saying it.

         A CAREER IS NOT A YEAR, and writing one into a field called `year` is the shape this file
         records under `cost: 0` and under `paper: true` — a column filled in with something nearly
         right, then read by a question that means something else. `Decade` asks the real version
         off `activeFrom` and `activeTo` together.

         A BOUT KEEPS ITS `year`, on the mapper below, because a fight really did happen in one. */
    })),

    /* A BOUT ANSWERS THE FUNNEL LIKE A BOXER DOES: Boxing as the subject, the weight as the
       division. Everything school-shaped stays blank, and blank is what keeps a fight out of a
       list of past papers. */
    ...(DATA.fights || []).map(f => ({
      kind: 'fight', name: f.a + ' v ' + f.b,
      key: 'ft:' + (f.id || f.a + f.b + f.date),
      sub: [(f.date || '').slice(0, 4), f.division, f.venue].filter(Boolean).join(' · '),
      image: '',
      boxKind: 'Fights',
      subject: 'Boxing', division: divisionOf_(f.division), row: f,
      year: (f.date || '').slice(0, 4),
    })),

    /* ---------- THE QUESTIONS, AND NOT THE DOCUMENTS THEY CAME OUT OF ---------------------------
       `...allTopics()` WAS HERE — 642 documents, one item each, drawn as covers. It is questions
       now, one item per part, and the documents are not in this list at all. The long note above
       `questionItems` says why; the short version is that a document and its questions answer the
       same facets, so listing both meant every search returned two kinds of thing. */
    ...questionItems(),
  ];
}

/**
 * THE YEAR OF A THING, from the column or from the wave.
 *
 * `year` is its own column because a filter wants the year on its own — "June 2024" and
 * "November 2024" are two waves and one year, and bucketing by wave gives a facet with an entry
 * per sitting. But a wave already contains the year, and asking somebody to type 2024 into a
 * second cell to make the filter work is asking them to keep two facts in step by hand.
 *
 * So: the column when it is filled, and the four digits out of the wave when it is not.
 */
/* ==================================================================================================
   `topicOf_` — WHAT THE QUESTION IS ABOUT, WHICH THE FUNNEL HAD NEVER ASKED.

   SIX CHIPS DEEP IT SAID "NOTHING LEFT TO NARROW" OVER 193 QUESTIONS. Learning, Questions, Maths,
   Worksheet, KS2, Year 4 — six taps — and the 193 left were about eleven different things:
   fractions, area, roman numerals, telling the time. Every question the funnel asked on the way
   down was about where the question CAME FROM — subject, level, type, key stage, school year,
   board, tier, publisher — and not one about what it is OF.

   THAT IS THE WHOLE OF "I CLICK THE FILTERS AND IT JUST FEELS LIKE IT SHOWS ALL OF THEM". The
   filters were narrowing provenance while the person was looking for a topic, so every tap took a
   real bite out of the list and none of them took the bite that was wanted.

   THE COLUMN WAS ALREADY THERE, AND NOTHING READ IT. `topics` is on 91.5% of the question rows and
   has reached the browser on `row` since `libraryInto_` stopped enumerating columns — see the note
   on `row:` in js/library.js, which was written about exactly this: an enumeration goes stale and a
   reference does not. So this is a reader over data that already exists, which is the only kind of
   facet that scales — a worksheet transcribed tomorrow is filterable the moment its `topics` cell
   is filled in, with nothing here to edit and no deploy.

   A CELL HOLDS A LIST. `Fractions, Ordering` is two topics the same way `KS1, KS2` is two key
   stages; see `keystage` in FACETS for the same split and the same reason.

   ---------- AND THE SPELLING IS SETTLED BY A VOTE, NOT BY A LIST KEPT HERE ------------------------

   46 OF THE 389 DISTINCT TOPIC VALUES DIFFER FROM ANOTHER ONLY BY CASE. `Linear Equations` (81
   rows) beside `linear equations` (4); `Histograms` (20) beside `histograms` (13); `Expanding
   Brackets` (37) beside `expanding brackets` (9). Two buttons for one topic is the `Alevel` /
   `A-Level` fault in a new column, and `check-funnel.js` fails the build on it by design.

   TITLE CASE WOULD HAVE BEEN THE OBVIOUS FIX AND IT WOULD HAVE BEEN WRONG. `HCF and LCM`
   title-cased is `Hcf And Lcm` — a spelling nobody ever typed, invented by code, printed on a
   button. So instead THE LIBRARY VOTES: every spelling of a topic is counted and the commonest one
   is used for all of them. That can only ever pick a word somebody actually wrote, it needs no
   vocabulary list to keep in step with the transcriptions, and a new spelling arriving in a bulk
   import is absorbed rather than split off into a chip of its own.

   NORMALISED HERE RATHER THAN IN THE DATA, for the reason `levelOf_` gives one screen down: the
   rows are bulk-imported and will keep arriving in both cases, so a migration is something the next
   import undoes. 4,000 committed content rows edited to make a filter work is also a diff nobody
   can review.
================================================================================================== */
/* A COMMA IS A LIST SEPARATOR AND NOTHING ELSE IS. Same shape as `keystage`'s split, kept as a
   helper because two places need it and the second is the search haystack. */
const topicAtoms_ = v => String(v == null ? '' : v).split(',').map(s => s.trim()).filter(Boolean);

/* ---------- THE VOTE MOVED, AND IT NOW APPLIES TO EVERY QUESTION ---------------------------------
   `TOPIC_SAID`, `topicSaid_` AND `topicKey_` WERE HERE — a tally of every spelling of every topic,
   picking the commonest for all of them, so `Linear Equations` and `linear equations` were one
   button. It was right and it was written one column too low: the same fault is in `company`
   (`1stclassmaths` against `1st class maths`, 1,372 rows against 109) and was in `level`
   (`Alevel` / `A-Level`), and each was being repaired by hand, in its own reader, after somebody
   noticed. A rule applied by hand is not a rule — this file says so twice already.

   SO IT IS `spellOne_` AND `spellKey_` IN THE FUNNEL ENGINE, applied to the answers of every facet
   including the ones a spreadsheet invents. See them above `facetTally_`. */
function topicOf_(x) {
  return topicAtoms_(x && ((x.row && x.row.topics) || x.topics));
}

/* ---------- WHICH BRANCH OF THE SUBJECT A TOPIC IS ON --------------------------------------------
   `Topic` HAS 343 ANSWERS AND A CARD HOLDS SEVEN. Trimming it to seven is honest but nearly
   useless: seven topics out of three hundred is not a question, it is a sample. What was missing
   is the LEVEL ABOVE — the handful of branches every one of those topics hangs off — and it turns
   out somebody had already written it down. `data/topics.json` is 269 labels under ten roots with
   an `aliases` column, and it sat unread in the archive.

   MEASURED BEFORE BUILDING, because a tree that does not match the library is decoration: it
   resolves 4,112 of the library's 4,257 topic cells, 96.6%, into TEN areas — and a maths question
   only ever sees seven of them (Number, Algebra, Ratio & Proportion, Geometry & Measures,
   Probability, Statistics, A-Level Pure Maths). English sees the other three. That is the seven
   the card has room for, arrived at from the data rather than by picking a number.

   THREE PASSES, EACH NARROWER THAN THE LAST, and the third is the one that needs the care:
     1. the label, an alias, or the id read as words
     2. the same again with a plural folded to its singular -- "box plots" against "Box Plots"
     3. CONTAINMENT, and only when every candidate agrees on the same root. "scatter graphs" is
        inside "Scatter Graphs & Correlation" and nothing else, so it resolves; "area" is inside
        both "Area of 2-D Shapes" (Geometry) and "Area Under a Curve" (A-Level), so it resolves to
        NOTHING rather than to a coin toss. Six cells lost against a wrong branch on a card that
        looks authoritative — the trade this repository makes everywhere else.

   NOT WRITTEN INTO THE ROWS. The library's `topics` cells keep arriving free-text from bulk
   imports, so a migration is something the next import undoes -- the argument `levelOf_` and the
   spelling vote both already make. */
let TOPIC_AREA = null;
const topicKey_ = s => String(s == null ? '' : s).toLowerCase().replace(/[^a-z0-9]/g, '');
const topicOne_ = k => k.endsWith('ies') && k.length > 5 ? k.slice(0, -3) + 'y'
                     : k.endsWith('ses') && k.length > 5 ? k.slice(0, -2)
                     : k.endsWith('s')   && k.length > 3 ? k.slice(0, -1) : k;
function topicIndex_() {
  if (TOPIC_AREA) return TOPIC_AREA;
  const tree = (DATA && DATA.topicTree) || [];
  const byId = {}, exact = {}, roots = [];
  tree.forEach(r => { if (r && r.topic_id) byId[r.topic_id] = r; });
  const rootOf = (r, n) => {
    const p = String((r && r.parent_id) || '').trim();
    return (!p || !byId[p] || (n || 0) > 8) ? r : rootOf(byId[p], (n || 0) + 1);
  };
  tree.forEach(r => {
    if (!r || !r.label) return;
    const area = (rootOf(r) || r).label;
    const names = [r.label, String(r.topic_id || '').replace(/-/g, ' ')]
      .concat(String(r.aliases || '').split(',').filter(a => a.trim()));
    /* A ROOT ANSWERS TO ITS OWN HALVES. "Ratio & Proportion" is one branch and the library writes
       `ratio` and `proportion` as separate cells, so both have to reach it. */
    if (!String(r.parent_id || '').trim()) names.push.apply(names, r.label.split(/[&/,]/));
    names.forEach(nm => {
      [topicKey_(nm), topicOne_(topicKey_(nm))].forEach(k => {
        if (k && exact[k] === undefined) exact[k] = area;
      });
    });
    roots.push([topicOne_(topicKey_(r.label)), area]);
  });
  return (TOPIC_AREA = { exact: exact, roots: roots });
}
function topicAreaOf_(x) {
  const at = topicIndex_();
  const out = [];
  asList_(topicOf_(x)).forEach(t => {
    const k = topicKey_(t), k1 = topicOne_(k);
    let area = at.exact[k] !== undefined ? at.exact[k]
             : at.exact[k1] !== undefined ? at.exact[k1] : null;
    if (area === null && k1.length >= 4) {
      let only = null, many = false;
      at.roots.forEach(pair => {
        if (pair[0].indexOf(k1) < 0) return;
        if (only === null) only = pair[1]; else if (only !== pair[1]) many = true;
      });
      if (only !== null && !many) area = only;
    }
    if (area && out.indexOf(area) < 0) out.push(area);
  });
  return out;
}

/**
 * WHAT LEVEL A THING IS TAUGHT AT, FROM WHICHEVER OF THE TWO COLUMNS HAS IT.
 *
 * Two columns hold this fact and neither holds all of it: `band_value` with `band_type: stage` is
 * the deliberate per-row statement, and `level` is what the bulk imports wrote. 128 A-level items
 * carry only the second, 135 carry both. Reading one column meant a question that was right about
 * a third of the library and silently wrong about the rest.
 *
 * THE SPELLINGS ARE NORMALISED, not the data. `Alevel`, `A-level` and `A-Level` were three answers
 * on one screen; the data is bulk-imported and will keep arriving in all three, so the repair
 * belongs here where every reader gets it, rather than in a migration that the next import undoes.
 */
function levelOf_(x) {
  const band = (x && x.bandType === 'stage' && x.bandValue) ? String(x.bandValue) : '';
  const own  = band || String((x && x.level) || (x && x.row && x.row.level) || '').trim();
  if (!own) return '';
  /* ---------- ONLY THE ONE THE GENERAL RULE CANNOT DO -------------------------------------------
     `A LEVEL`, `A-LEVEL`, `ALEVEL` AND `gcse` ARE HANDLED UPSTREAM NOW. `spellKey_` reduces an
     answer to its letters, so all three spellings of A-level are one identity and the folding in
     `facetTally_` picks the one a person would write — which is the same repair this function was
     doing by hand for one column. The three branches that did it are gone.

     `AS level` IS NOT THAT. It reduces to `aslevel` and `AS` reduces to `as`: two different
     identities, so no general rule can join them, and joining them is a fact about English exams
     rather than about spelling. That is exactly the line — the engine folds SPELLINGS and a reader
     like this one resolves MEANINGS. `waveOf` sits on the same side of it. */
  if (/^as(\s*-?\s*level)?$/i.test(own)) return 'AS';
  return own;
}

function yearOf(x) {
  const own = String((x && x.year) || '').trim();

  /* ---------- THE COLUMN HOLDS DATES, NOT YEARS ------------------------------------------------
     THE YEAR FILTER READ AS SEVEN LINES OF NONSENSE and this is why. A cell typed as 01/06/2018 is
     a DATE to the sheet, so what arrives here is not "2018" but the whole of

         Fri Jun 01 2018 08:00:00 GMT+0100 (British Summer Time)

     — and this returned it untouched. Every symptom followed from that one line. The funnel groups
     by whatever comes back, so seven sittings became seven separate chips instead of seven years;
     each chip was sixty characters of clock and timezone; and picking one filtered to that exact
     instant rather than to a year. The filter was not broken so much as filtering by the wrong
     thing entirely, and doing it in a way nobody could read.

     THE FOUR DIGITS ARE TAKEN OUT OF WHATEVER IT IS, which is the same thing already done to the
     wave on the line below — the rule was right, it was only being applied to one of the two
     places a year can hide. It costs nothing when the cell holds a plain 2018, since a plain 2018
     matches itself.

     WORTH FIXING IN THE SHEET AS WELL. This makes the app read the column correctly; it does not
     make the column right. A year stored as a date is a year that will keep arriving as a
     timestamp, and any other thing that ever reads it will need this same repair. Formatting that
     column as plain text is the actual cure. */
  const inOwn = own.match(/\b(19|20)\d{2}\b/);
  if (inOwn) return inOwn[0];

  /* A short label that is not a date and not a year — "Spec", "Sample" — is somebody being
     deliberate, so it is kept. Anything long enough to be a sentence is not a year, and passing it
     through is what produced the mess above. */
  if (own && own.length <= 9 && !/\s/.test(own)) return own;

  const m = String((x && x.examWave) || '').match(/\b(19|20)\d{2}\b/);
  return m ? m[0] : '';
}

/**
 * THE NAME OF AN EXAM SERIES, FROM THE MONTH IT SAT IN.
 *
 * A BOARD RUNS TWO SERIES A YEAR AND SPREADS EACH OVER SEVERAL WEEKS. Edexcel's 2018 summer papers
 * sat on 24 May, 7 June and 12 June; its autumn papers on 6, 8 and 12 November. Naming a sitting by
 * its own month splits one series into `May 2018` and `June 2018` — two buttons for three papers
 * every student thinks of as one thing, and the question "which paper" cannot be asked underneath
 * a split like that. So the summer months are one answer and the autumn months another.
 *
 * THE SEASON IS THE NAME, AND IT USED TO BE THE MONTH. It was "June 2018" and "November 2018",
 * because that is what the boards and every past-paper site print — and it was reported as a bug
 * the day the first May paper went in: **the card said "Paper 1 (Non-Calculator) — May 2017" and
 * the filter offering it said "June 2017"**, so the paper looked absent from the one list somebody
 * was scanning for it. Every Paper 1 of every summer series sits in May and Papers 2 and 3 sit in
 * June, so that is not one odd row — it is a third of the library disagreeing with its own filter.
 *
 * "SUMMER 2017" IS TRUE OF A PAPER SAT IN MAY AND OF ONE SAT IN JUNE, which "June 2017" is not,
 * and it is the word the boards themselves use for the series when they are not naming a month
 * (JCQ publishes the summer and autumn series). Nothing is invented and nothing goes stale: a
 * paper arriving in a month nobody expected still lands on the season its month belongs to.
 *
 * SEARCH IS THE OTHER HALF AND IT WAS ALREADY RIGHT. A paper's own name carries its own month, so
 * typing "may 2017" or "june 2017" finds the questions either way — the season is the name of the
 * BUTTON, not a replacement for the date on the paper.
 *
 * ANYTHING ELSE KEEPS ITS OWN MONTH. January sittings were a real thing until 2013 and a March or
 * an August is somebody being deliberate; collapsing those into a season invents a fact. The rule
 * only merges where two months are certainly one series.
 */
function seriesOf_(m) {
  /* `MONTH_NAMES` FROM data.js — this file had TWO private copies of the twelve months and games.js
     had a third until somebody deleted it with a note saying why. One list, one place. */
  const MONTH = MONTH_NAMES;
  const n = Number(m);
  if (!isFinite(n) || n < 1 || n > 12) return '';
  if (n >= 5 && n <= 7) return SERIES_SUMMER;
  if (n >= 10 && n <= 12) return SERIES_AUTUMN;
  return MONTH[n - 1];
}

/* THE TWO SEASON WORDS ARE CONSTANTS BECAUSE TWO OTHER PLACES HAVE TO AGREE WITH THEM, and a word
   spelled out in three files is the fault this whole file is about. `waveOf` falls back to them
   when a phase word arrives with no month on the row, and `dateKey_` has to know where in the year
   each one sits or the sittings sort alphabetically again — which is the exact complaint ("Here
   look! Jarring") that put the date sort in. `SERIES_AT` is the month each season is centred on. */
const SERIES_SUMMER = 'Summer';
const SERIES_AUTUMN = 'Autumn';
const SERIES_AT = { Summer: 6, Autumn: 11 };

/**
 * THE WAVE OF A THING, AS A HUMAN WOULD SAY IT.
 *
 * `exam_wave` is meant to hold "June 2024" — a sitting, which is a month and a year. What is
 * actually in the sheet on most rows is a DATE: 2024-06-01, typed into a cell Google then treats
 * as a date, so what reaches this file is the whole of
 *
 *     Fri Jun 01 2024 08:00:00 GMT+0100 (British Summer Time)
 *
 * and the funnel drew that, verbatim, as a button. Seven of them, one per sitting, each sixty
 * characters of clock and timezone — which is the fault you can see, but not the worst of it: two
 * ways of writing the same sitting are two DIFFERENT buttons, so "June 2018" typed by hand and
 * 2018-06-01 read from a date cell split one wave into two.
 *
 * A DATE IS NOT WRONG IN THE SHEET, it is just not what a person calls a sitting. So it is read
 * rather than rejected: month and year out of whatever shape arrived, in the words somebody would
 * use. The row that already says "June 2018" is returned untouched and lands on the same button as
 * the date that means the same thing — which is the part that actually fixes the filter.
 */
function waveOf(x) {
  const raw = String((x && x.examWave) || '').trim();
  if (!raw) return '';

  const MONTH = MONTH_NAMES;

  /* ---------- A PHASE WORD IS A THIRD SPELLING OF THE SAME THING -------------------------------
     THE COMMENT ABOVE ALREADY NAMES THIS FAULT — "two ways of writing the same sitting are two
     DIFFERENT buttons" — and then a third way arrived: `First wave` and `Second wave`, written
     onto 850 rows by the transcriptions. They carry no month and no year, so they fell through
     every branch below and came back verbatim, as their own buttons, beside the dates.

     MEASURED, AND IT BROKE THE FILTER IN BOTH DIRECTIONS. For 2018 the funnel offered `June 2018`
     (16 questions, from the old import) AND `First wave`/`Second wave` (151 questions, from the
     transcriptions) as separate answers to one question. Picking either hid the other, and nothing
     on screen said a second 2018 existed.

     A WAVE IS A SEASON, so it is resolved through the row's own month and year rather than by
     trusting the phrase. `First wave` means the summer series and `Second wave` the autumn one —
     which is what a month of 5, 6 or 7 and a month of 10, 11 or 12 already say on the same row. */
  const phase = raw.match(/^(first|second|third)\s+wave$/i);
  if (phase) {
    const mth = Number((x && x.month) || (x && x.row && x.row.month) || 0);
    const yr  = yearOf(x);
    const series = seriesOf_(mth) || (/^first$/i.test(phase[1]) ? SERIES_SUMMER : SERIES_AUTUMN);
    return yr ? series + ' ' + yr : raw;
  }

  /* ALREADY A SITTING. "June 2024", "Nov 2023" — somebody typed what they meant. */
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) {
    const i = MONTH.findIndex(m => m.toLowerCase().startsWith(said[1].toLowerCase().slice(0, 3)));
    return i < 0 ? raw : seriesOf_(i + 1) + ' ' + said[2];
  }

  /* A DATE THAT CAME THROUGH AS TEXT. Read by pattern rather than by `new Date`, which reads the
     same characters differently depending on the machine's timezone — and a wave that is June on
     one phone and May on another is a filter that splits in half for no reason anybody can see. */
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) {
    const i = MONTH.findIndex(m => m.slice(0, 3) === long[1]);
    return i < 0 ? long[2] : seriesOf_(i + 1) + ' ' + long[2];
  }

  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) {
    return seriesOf_(parseInt(iso[2], 10)) + ' ' + iso[1];
  }

  /* Nothing recognisable but a year in it somewhere — better than the whole string. */
  const bare = raw.match(/\b(19|20)\d{2}\b/);
  return bare ? bare[0] : raw;
}

/* Numeric-aware, so Grade 2 comes before Grade 10. Plain alphabetical put Grade 10 first, and that
   reads as the list being unsorted rather than sorted by a rule nobody wanted. */
const cmpText = (a, b) =>
  String(a).localeCompare(String(b), 'en', { sensitivity: 'base', numeric: true });

/* `sortsWorthOffering` was here — which orders were worth putting in the dropdown, given what was
   actually on screen. The dropdown is gone, so the question is gone with it. */


/* NO HEADINGS AT ALL, and no grouping behind them.

   It went in stages, and each stage removed a reason for the next. The dropdown went because the
   funnel asked the same question better. Then the headings followed the funnel automatically —
   which was neat, and still bought nothing: by the time you have answered two questions there are
   a handful of cards on a page, and a heading over four things names what all four already say on
   their own second line.

   What is left is a list. The funnel says what you asked for, the count says how many, and the
   cards say what they are. Three things, none of them repeating another.
--------------------------------------------------------------------------------------------- */

/* Every word must appear SOMEWHERE — so "maths 7" finds a Grade 7 Maths topic without the two
   words having to sit next to each other. Searching only the name and the group label missed a
   shop item by its description, which is the thing that actually says what it is. */
function stuffFind(items, credits) {
  let out = items;

  /* THE TWO RULES, in four lines. Filters are grouped by field, and an item must satisfy at least
     one from EVERY group — `some` within a field, `every` across them, which is exactly what
     "either / both" means written out. */
  const byField = {};
  /* ---------- A SKIPPED QUESTION IS ASKED AND ANSWERED "ANY" -------------------------------------
     `{ any: true }` IS A FILTER THAT FILTERS NOTHING, and that is the entire mechanism. It sits in
     `STUFF.filters` so `nextFacet` — which reads that list to know what has been asked — moves on
     to the next question, and it is skipped here so it removes nothing from the list. One entry,
     two behaviours, and no second piece of state to keep in step with the first.

     WHY IT EXISTS: "sometimes i just know its roughly ks2". `School year` is a real question and it
     was the ONLY thing on the screen after Key stage — so somebody who does not care which year
     had a choice between answering it wrongly and going no further. Picking Year 4 took 1,093
     questions to 193 and silently threw away nine hundred KS2 questions that were just as
     relevant. */
  STUFF.filters.forEach(f => {
    if (f.any) return;
    (byField[f.field] = byField[f.field] || []).push(f);
  });
  Object.keys(byField).forEach(field => {
    out = out.filter(x => byField[field].some(f => filterHit(x, f, credits)));
  });

  const words = norm(STUFF.q).split(/\s+/).filter(Boolean);
  if (words.length) out = out.filter(x => {
    /* `x.text` IS THE QUESTION ITSELF — built once when the item was made, never here. See
       `searchText_`. It is last so that a match on a name still costs the same as it always did. */
    const hay = norm([x.name, x.sub, x.subject, x.slot,
                      x.grade && 'grade ' + x.grade, x.text].filter(Boolean).join(' '));
    return words.every(w => hay.includes(w));
  });

  /* ONE KEY, then the name to settle ties. There was an outer sort by group — and with the
     groups gone there is nothing above the sort, which is most of why this is now four lines.
     The name is always the tiebreak, so two papers priced the same come out in the order anybody
     would look for them rather than in the order the sheet happens to hold them. */
  /* BY NAME, AND ONLY BY NAME. There were three orders here and a dropdown to choose between them;
     the dropdown is gone, so `STUFF.sort` could only ever hold its starting value and the other two
     branches were unreachable. A setting nothing can set is a setting that reads as a choice
     somebody made.
     A–Z is what a list of names should be anyway. If prices ever matter enough to sort by, that
     belongs beside the prices rather than above the search. */
  /* ---------- QUESTIONS SORT WITH THEIR PAPER, AND NUMERICALLY --------------------------------------
     BY NAME ALONE, A QUESTION'S NAME IS `Q5b`. Two things followed, both visible in the list:

     EVERY PAPER'S Q1 CLUMPED TOGETHER. `cmpText` on the name put Corbett's Q1 beside A-level
     Statistics Q1 beside Physics Q1 — three unrelated problems adjacent because they share a
     position in different documents. The card said which paper underneath, so the information was
     there; the ORDER was meaningless, which is worse than unsorted because it looks deliberate.

     AND Q1, Q10, Q11, Q12 CAME BEFORE Q2. Text order on a number is alphabetical, so a paper read
     down the screen in the wrong sequence — the one list in the app where the sequence is the whole
     point, because it is the order the exam asks them in.

     SO: THE PAPER FIRST, THEN THE NUMBER AS A NUMBER, then the part. Everything that is not a
     question is unaffected — `sub` is empty and `qNumber` is zero, so it falls straight through to
     the name comparison it always used. */
  /* ---------- ONE STRING PER ITEM, BUILT ONCE, COMPARED WITH `<` ---------------------------------
     THE COMPARATOR WAS FOUR `cmpText` CALLS AND `cmpText` IS `localeCompare` WITH OPTIONS, which is
     the most expensive string comparison the language offers. Sorting 4,045 items is about 48,000
     comparisons, so it ran up to two hundred thousand times to draw one screen: MEASURED at 88 ms
     of the 110 it took to produce the list, on every filter change and every search.

     SO THE ORDER IS BAKED INTO A KEY and the sort is a plain string compare. `sortKey_` reproduces
     what the comparator said — case-insensitive, and numbers compared as numbers — by lowercasing
     and zero-padding every run of digits, which is what `numeric: true` does. Held on the item, so
     the second sort of the same items costs nothing at all.

     THE SECOND AND THIRD TERMS WERE DEAD AND NOTHING WAS WRONG, which is worth writing down because
     the obvious conclusion is the opposite one. `qNumber` and `qPart` have not been set by anything
     since `questionItems` was rewritten — the facet list even records them as "written by
     `questionItems`, which drew the duplicate cards these existed to narrow" — so two of the four
     terms compared `0` with `0` and `''` with `''` on every question in the library.

     I READ THAT AS Q1, Q10, Q11, Q12, Q2 DOWN EVERY PAPER AND WENT TO MEASURE IT. It is not:
     `cmpText` carries `numeric: true`, so the LAST term, on the name, already put Q2 before Q10.
     A dead reader standing over a live one — the same shape as `d = libraryInto_(…)`, where the
     broken line came after the useful work and the correct fallback hid it. Checked on the current
     file and on the one before this change: identical order, 32 parts, both ways.

     THEY ARE WRITTEN AGAIN ANYWAY, because the key below needs them stated rather than implied: it
     is built from the fields, and a key that leans on a number happening to be inside a name is a
     key that breaks the day a name changes. This is an intent made explicit, not a bug fixed. */
  return out.sort((a, b) => {
    const ka = a._sk || (a._sk = sortKey_(a)), kb = b._sk || (b._sk = sortKey_(b));
    return ka < kb ? -1 : ka > kb ? 1 : 0;
  });
}

/* PADDED SO THE ALPHABET AGREES WITH ARITHMETIC. "Paper 10" sorts before "Paper 2" on letters and
   after it on numbers, and the second is what a person means; `localeCompare`'s `numeric: true`
   knows that and a plain `<` does not, so every run of digits is widened to a fixed width and the
   two orders become the same order. Eight digits is wider than any number this app holds.
   `\u0000` BETWEEN THE PARTS, because it sorts below every printable character — so a short field
   always loses to a longer one that starts the same way, which is what a tie-break means. */
const sortKey_ = x => [
  padNums_(String(x.sub || x.name || '').toLowerCase()),
  padNums_(String(x.qNumber == null ? '' : x.qNumber)),
  String(x.qPart || '').toLowerCase(),
  padNums_(String(x.name || '').toLowerCase()),
].join('\u0000');

const padNums_ = s => s.replace(/\d+/g, d => ('00000000' + d).slice(-8));

/* How many cards to a page. Eight fills a phone without quite filling it — a page that ends
   exactly at the fold gives no sign there is anything below, and one that overflows makes you
   scroll before you can swipe. If a chunk does overflow, the page scrolls and the pager waits,
   which is the same rule every other widget follows. */
/* `STUFF_PER_PAGE` was 8 — how many cards went on a page. There is one thing to a page now, so
   there is no number to hold. See `stuffPerPage`. */

/* THE FILTERED LIST, held between calls.
   Searching, grouping, sorting and paging all want the same array, and each was recomputing it —
   `stuffItems` flattens four hundred topics and twenty shop rows, `stuffFind` filters and sorts
   them, and that ran four times to draw one screen and again on every page turn.
   Keyed on everything that can change the answer. */
let FIND_MEMO = { key: null, from: null, items: null, total: 0 };

function stuffFiltered() {
  /* KEYED ON THE PAYLOAD ITSELF, by object identity, not on `DATA.version`.
     `version` is the BACKEND's version string — it changes when you deploy, and not when anybody
     edits a row. So a reload that brought back four hundred changed resources produced the same
     key as the reload before it, and this handed back the list it built last time. Editing a
     resource and refreshing showed the old one, for as long as the tab stayed open, and nothing
     anywhere said so.
     A new payload is a new object. That is the whole test, it costs one comparison, and it is the
     same one `allTopics` already uses one level down — which is why THAT was correct and this was
     not. */
  const key = JSON.stringify([STUFF.q, STUFF.filters,
                              USER ? USER.credits : -1, isAdmin()]);
  if (FIND_MEMO.key === key && FIND_MEMO.from === DATA) return FIND_MEMO.items;
  const all = stuffItems();
  const items = stuffFind(all, USER ? (USER.credits || 0) : 0);
  FIND_MEMO = { key: key, from: DATA, items: items, total: all.length };
  return items;
}

/* ---------- THE COLLECTION WENT, AND WHAT IT KNEW IS IN THE FACET LIST ---------------------------
   `collectionAxes_`, `groupItems_`, `one_` and `plural_` WERE HERE, with `collect: true` on the
   facet they served. Together they drew a line above the funnel — "or the 227 papers these are in"
   — that turned the results into one card per paper until you pressed it again.

   THE ARITHMETIC IN IT WAS RIGHT AND IS WORTH KEEPING IN PROSE: a field with one distinct value
   per row identifies a row, a field with ~16 rows each is a collection, a field with 654 rows each
   is a category, and the boundary between the last two is `FACET_MAX_ANSWERS`. That is still true
   and it is still what decides whether `Paper` is asked.

   WHAT WAS WRONG WAS THE SCREEN. Two ways of narrowing one list, stacked, one of them a sentence
   in the corner — you had to know what "or the 227 papers these are in" meant before you could use
   it, and it named a thing the funnel could simply ASK about once the list was small enough. It
   does: see `paperId` in FACETS. One question, one chip, one ✕, and nothing to explain.

   `kind: 'group'` WENT WITH IT, and the `group-open` tile in tiles.js. */


/**
 * ARE WE LOOKING AT WIDGETS AND NOTHING ELSE?
 *
 * If so they stop being cards and become the pages themselves — one to a screen, swipe between
 * them, already running. A game you have to open is not a game, and a calculator behind a tap is a
 * calculator you use the phone's own one instead.
 *
 * ALL of them, not some. A search matching a tool and three resources cannot give one thing a
 * whole screen and eight things another, so a mixed result stays a list of cards and the widget
 * card opens in the sheet as before. The whole-screen version is for when you have said Tools or
 * Games and there is nothing else in the way.
 */
const showingWidgets = () => {
  const items = stuffFiltered();
  return items.length > 0 && items.every(x => x.kind === 'tool' || x.kind === 'game');
};

/**
 * ONE THING TO A PAGE, ALWAYS.
 *
 * IT WAS EIGHT, and a widget was the exception at one. So a swipe down on this screen jumped past
 * eight results at a time while the same swipe on the Book screen moved to the next receipt — two
 * screens made of the same grid, answering the same gesture with different amounts of movement, and
 * nothing about either of them says which you are on.
 *
 * A PAGE IS ONE THING. That is what the pager is for and it is what makes the whole app read as a
 * deck rather than a list: you swipe to the next thing, not to the next screenful of things. Eight
 * to a page made this screen a scrolling list wearing a pager, which is the one thing the layout
 * was rebuilt to stop being.
 *
 * IT COSTS NOTHING TO BUILD. Pages are filled two either side of where you are and emptied behind
 * you — so five exist at any moment whether the library is forty items or four hundred. The count
 * changes; the work does not.
 */
const stuffPerPage = () => 1;

/**
 * HOW MANY PAGES, WITHOUT BUILDING ANY OF THEM.
 *
 * This used to render every page's markup and return the length of the array — half a megabyte of
 * HTML to produce the number 59, and it ran on every single page turn because the pager asks for
 * the page names each time it moves. Drawing the screen took a fifth of a second with a library
 * this size and would take longer with every resource added.
 *
 * A page holds a fixed number of cards, so the count is a division.
 */
/** HAS ANYBODY ASKED FOR ANYTHING YET? A search typed, or a filter pressed. Until one of those,
    this screen is a question and not a list. */
function stuffAsked() {
  return !!(S_(STUFF.q).trim() || STUFF.filters.length);
}
const S_ = v => String(v == null ? '' : v);

/* ---------- WHERE THE RESULTS START ----------------------------------------------------------------
   THE QUESTION USED TO BE PAGE ZERO and three separate pieces of code knew it: the fill loop began
   at 1, every result read `items[i - 1]`, and `paintStuff` kept "the first page" and rebuilt the
   rest. With the saved pages in front of it none of those is true any more, and the failure would
   not have been an error — it would have been results drawn one page out, silently, only for people
   who had starred something.

   SO IT IS ASKED RATHER THAN ASSUMED, once, off the id on the question page itself. Nothing counts
   saved things to work it out, which matters because the count can change between a render and a
   fill and the two would disagree exactly when somebody had just pressed a star.

   ONE BEFORE ANYTHING IS DRAWN. `paintStuff` inserts the pages around a question page that already
   exists, so there is always one to find by the time this is asked in anger. */
/* ---------- IS THE FUNNEL ASKING ABOUT BOOKING? ----------------------------------------------------
   `forLabel` IS THE FIRST QUESTION — the one whose answer is Booking, Learning, Shop, Games or
   Friends. A filter on it is what says which errand somebody is on, and it is the only signal here:
   nothing counts kinds or reads the results, so this stays true however the funnel is answered
   afterwards.

   NOT SIGNED IN, NOTHING TO DRAW. The booker needs somebody to book for, and the sessions are
   somebody's own — `bookBlocks` already returns the offers alone in that case, which is right. */
/* ONE SESSION, OPENED OUT. The receipt, then the way in for somebody not in it yet, then the way
   to pay once it has been accepted — the same three the sheet used to stack, in the same order,
   on the page itself. Each guards itself: `joinBlock` draws nothing for a session you are already
   in. */
/* ---------- "THE PAPER, AND NOTHING ELSE" WAS TRUE WHILE SOMETHING ELSE ADDED THE TILES ----------
   THE NOTE THAT STOOD HERE said paying and withdrawing are marks in the tile row *under the card*,
   `jobTiles_` in tiles.js, "which is where every other kind keeps its actions". That was exactly
   right and it depended on a caller that no longer exists: `stuffCard` appends `cardTiles_` to
   every card it draws, and a receipt was a card it drew. Booking left the funnel, `bookBlocks`
   draws these pages instead, and **the tile row did not come with them** — so on the Booking column
   a client had no way to pay for an accepted session and an admin had no Accept or Decline.

   THAT IS A REGRESSION THIS SESSION MADE, and it is the `meCard` fault twice in one week: a builder
   that was only ever complete because of what wrapped it, moved somewhere nothing wraps it. Both
   were found by asking what a function is FOR rather than by anything running, which is the honest
   answer about what the checks can and cannot see.

   SO THE PAGE IS THE WHOLE DOCUMENT NOW, and there is one of it. `on('job')` used to stack the same
   pieces by hand into a sheet — receipt, join block, then an admin's tiles and the paragraph under
   them — which is two renderers for one session, in two files, differing by a `moneyBlock`. This is
   that stack, once, and the sheet is gone.

   THE ADMIN PARAGRAPH TRAVELS WITH THE TILES. `jobAdminTiles_`'s own note says why it cannot live
   on the tiles themselves — "a tile has room for a few words" and "everyone is withdrawn" is the
   whole reason an admin pauses — so it is one paragraph under the row, which is the shape CLAUDE.md
   records under "A THING has tiles; a FORM has buttons". */
function jobPage_(j) {
  const stage = typeof jobStage_ === 'function' ? jobStage_(j) : '';
  const yes = typeof jobAccepted_ === 'function' ? jobAccepted_(j) : false;
  const admin = typeof isAdmin === 'function' && isAdmin();
  return (typeof jobReceipt === 'function' ? jobReceipt(j) : '')
    + (typeof moneyBlock === 'function' ? moneyBlock(j) : '')
    /* NOT AN ACTION ON YOUR OWN SESSION: the offer made to somebody who is not in it yet, carrying
       the seats left and the price. Facts rather than buttons, so it is not a tile. */
    + (typeof joinBlock === 'function' ? joinBlock(j) : '')
    + `<div class="tile-row">${
        (typeof jobTiles_ === 'function' ? jobTiles_({ row: j }) : '')
      + (admin && typeof jobAdminTiles_ === 'function' ? jobAdminTiles_(j, stage, yes) : '')
      }</div>`
    + (admin
      ? `<p class="faint" style="margin:.6rem 0 0">Accepting settles the terms for everybody in it
           and lets the family pay; declining turns the whole booking down and tells them.${
           stage === 'application' && yes
             ? ' Marking it paid is for cash, a transfer, or anything that did not go through the'
               + ' card page \u2014 it is recorded as marked by you, never as though Stripe had'
               + ' confirmed it.'
             : ''} Deleting withdraws everyone and removes it from the list; nothing is erased, so
           every event stays on the events tab and what happened is still on the record.</p>`
      : '');
}

const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === 'forLabel' && norm(f.value) === want);

/* ---------- `goFor_` WAS HERE, AND IT WAS NAVIGATING TO ANSWERS THAT NO LONGER EXIST --------------
   IT REPLACED `go('me')` AND `go('posts')` when the columns became answers, and its note gave the
   right reason: `go` falls back to `TABS[0]` for an id it does not know, so a person told to sign in
   was silently dropped on the search box with no sign-in card in sight — *"a fallback that lands
   somewhere plausible is worse than one that lands nowhere, because nobody reports it."*

   THEN THE ANSWERS WERE DELETED AND THE CALLS WERE NOT. `You` and `People` went with the `me` kind
   and the `People` group; `Posts` went when the feed stopped being built here. Nothing declares any
   of the three, so `goFor_('You')` set a filter that matches nothing at all — and that is worse than
   the fallback it was written to avoid, because it does not merely fail to navigate:

     · it CLEARS `STUFF.q`, so whatever was typed in the search box is thrown away
     · it REPLACES `STUFF.filters`, so every chip somebody had narrowed with is gone
     · it leaves ONE dead chip reading `You`, which no item can answer, over zero results
     · and `paintStuff` deliberately never rewrites `#stuff-q`, so the box still shows the old text
       while the results ignore it

   MEASURED: signed out, pressing a reaction on the feed toasted "Sign in to react", offered no way
   to sign in, and left the Find screen holding 0 of 4,110 behind a chip nobody set. Three callers
   did it — the reaction, and both `resource.js` sign-in guards — and two more called
   `goFor_('Posts')` with `PAGE.feed` set on the line beside them, which says plainly that the
   intent was the feed COLUMN.

   SO THE COLUMNS ARE THE NAVIGATION AGAIN, and the note's original objection no longer applies:
   `account` and `feed` are real ids in `TABS`, so `go` does not fall back, and `accountPages_`
   returns `signInCard_()` for a visitor who is not signed in — which is the thing all three sites
   were trying to reach. One call each, and nothing to keep in step with a list of group names.

   `forIs_` STAYS. `bookingPages_` and `feedPages_` still read it, and a `kinds` row can still put a
   kind into either group and make the answer real — see `FUNNEL_NOT_FOR`. What has gone is the app
   setting that filter on somebody's behalf. */

function bookingPages_(o) {
  /* ---------- THE COLUMN ASKS FOR IT DIRECTLY ------------------------------------------------------
     `forIs_` READS THE FUNNEL'S STATE, and the booking column has none — nobody answered `What for`
     to get there, they swiped. Without this the column would build nothing and show a blank screen,
     which is the same shape of fault as a tab with no section.

     THE REST OF THE FUNCTION IS UNTOUCHED, deliberately: the form the column shows and the form the
     funnel shows are the same one, and a second copy for the column is a second thing to keep in
     step. */
  if (!(o && o.column) && !forIs_('booking')) return [];
  /* ---------- THE FORM IS THE ANSWER TO `Booking`, NOT TO EVERYTHING UNDER IT --------------------
     IT FOLLOWED YOU DOWN. `forLabel · Booking` stays set for the whole branch, so narrowing to
     Classes, or Tutors, or Venues left the form sitting in front of the thing you had just asked
     for — a twelve-question document to swipe past on the way to a list of three tutors.

     ONE MORE ANSWER MEANS YOU ARE BROWSING. Booking on its own is somebody arranging a session and
     the form is what they came for. `Booking · Tutors` is somebody looking through tutors, and
     `Booking · Classes` is somebody checking what they are already in — neither is a person filling
     a form in, and the form has a page of its own to go back to the moment they clear that answer.

     THE SECOND QUESTION, NOT A LIST OF ITS ANSWERS. Written as "has `kindLabel` been answered at
     all", so a kind added later — a coupon, a pass, whatever comes next — needs nothing added
     here. A rule naming the answers it applies to is a rule that goes stale on the next one. */
  const narrowed = (STUFF.filters || []).some(f => f.field === 'kindLabel');
  if (narrowed) return [];
  const form = (typeof bookBlocks === 'function' ? bookBlocks() : []).filter(Boolean);
  /* ---------- THE BASKET BELONGS TO BOOKING, AND WAS FILED UNDER THE FUNNEL ----------------------
     IT SAT ON THE `stuff` COLUMN, between the saved things and the first result. The layout sheet
     puts it under Booking — second row of that column — and the sheet is right: a basket is the
     end of arranging a session, not a thing you search for. Moved.

     COLUMN MODE ONLY, and that is the whole care in this change. `bookingPages_()` with no argument
     is what `frontPages_()` calls to put the form on the FUNNEL — so adding the basket to the plain
     return would have moved it out of one place on `stuff` and straight back into another.

     AND THREE COUNTERS HAD TO MOVE WITH IT. `stuffFirstResult_`, `paintStuff` and `screen('stuff')`
     each added `basketPages().length` to work out where the results start; a page list and a page
     count that disagree is exactly the fault that put a blank card under the question for every
     starred thing. All three are updated, and `check-flow` walks the funnel to prove it. */
  return o && o.column && typeof basketPages === 'function'
    ? form.concat(basketPages())
    : form;
}

/* ---------- THE FEED, BEHIND ITS OWN ANSWER -------------------------------------------------------
   POSTS WAS THE LEFT-HAND COLUMN AND IS AN ANSWER TO `What for` NOW. Every other column had already
   gone this way — Spotlight, Book, Basket — and the argument for keeping this one was that it is
   the screen somebody opens with no errand. That is a real argument and it loses to a simpler one:
   the app is a funnel, and a second way in is a second thing to maintain and a second place for a
   card to be forgotten.

   THE WHOLE FEED, NOT THE SEARCH RESULTS. The `post` kind above makes a post findable BY CAPTION,
   which is a different job — and results come back sorted by name, which for a feed would mean
   photographs in alphabetical order by caption. So this returns what the Posts screen returned:
   spotlight, the festive cards, the ＋, and the posts in the order the feed sorts them. Pinned
   first, then newest, exactly as before.

   AND SIGNING IN COMES WITH IT. It sat at the top of this feed because the feed was the screen
   nobody arrived at with an errand; the feed is still the least errand-like thing in the app, and
   the card travels with the thing it was placed above rather than being moved a third time. */
function feedPages_() {
  if (!forIs_('posts')) return [];
  return (typeof postsBlocks === 'function' ? postsBlocks() : []).filter(Boolean);
}

/* ---------- `youPages_` WAS HERE AND LASTED ONE VERSION -------------------------------------------
   IT PUT THE OLD `You` COLUMN BEHIND AN ANSWER — the install prompt, the claims, the tiles, the
   version footer, then the card. What that showed on a real account was a page of build numbers
   between the question and the one card anybody wanted, which is the column's own emptiness made
   visible: there was never enough left on it to be worth a question.

   `meCard` IS THE WHOLE OF IT NOW and it is a result, not a page. The claims and the messages are
   still built by `meBlocks` and still reachable from the tiles on that card. */

/* ---------- SIGNING IN AND OUT, ON A PAGE OF ITS OWN ----------------------------------------------
   IT HAS MOVED FIVE TIMES: the far end of You, the top of the feed, both at once, the last row of
   your own pass, and the question card. Every one of those was an answer to "which card does it go
   on" — and the reason it kept moving is that it is not a card's business. It is the state the whole
   app is in.

   SO IT IS A PAGE, ON THE SAME SIDE AS THE OTHER THINGS THAT ARE YOURS. Saved and basket sit after
   the question because they are answers rather than questions; this is the same kind of thing and
   the same swipe. Nothing filters it, nothing scrolls past it, and it does not have to be squeezed
   onto a card that was drawn for another reason.

   A COLUMN, NOT A PAGE. It was briefly a page after the question, which put it at a position in a
   list — and that position moves with whatever you have narrowed, so the one control that must
   always be in the same place was the one thing that kept shifting. One swipe right, from anywhere,
   whatever is on screen. */
function accountPages_() {
  if (!USER) {
    /* THE GOOGLE BUTTON IS MOUNTED A FRAME LATE — Google renders into an element that has to exist
       first, and the element is in the card this returns. */
    if (typeof mountGoogleWhenDrawn === 'function') mountGoogleWhenDrawn();
    return (typeof signInCard_ === 'function' ? [signInCard_()] : []).filter(Boolean);
  }
  /* ---------- YOU FIRST, THEN EVERYBODY ELSE -----------------------------------------------------
     `People` LEFT THE FUNNEL AND TOOK THE ONLY WAY TO LOOK SOMEBODY UP WITH IT. Tutors used to
     answer under People there; with that group gone the app had no roster at all, and this column
     already had exactly one person on it — you.

     SO THE PEOPLE GO UNDERNEATH, one to a page, in the order the sheet gives them. Your own card
     stays first because this is your column and because a list you are not at the top of is a
     directory rather than an account.

     `findCard` DRAWS THEM, WHICH IS THE POINT. It is the same function the funnel used for a tutor,
     so a person looks identical wherever they are seen — two renderers for one person is two things
     to keep in step, and the last time this app had that it had two of the same post.

     ONLY WHAT THE BACKEND ALREADY SENDS. `DATA.tutors` is the public list and always has been;
     `doget.gs` deliberately never sends the `people` tab, which holds PINs, bank details, addresses
     and dates of birth. Reading from anything else here would put all of that on every phone, and
     the leak would be invisible because the data would already have arrived. */
  /* ---------- AND YOU WERE THE ONE PERSON `findCard` DID NOT DRAW ------------------------------
     REPORTED AS "why can't I see my own info like theirs?" — and the paragraph directly above this
     one is the answer, stating the rule that the code underneath it then broke: *"a person looks
     identical wherever they are seen — two renderers for one person is two things to keep in
     step."* Everybody else got a staff pass with a photograph, what they teach, a rate and a DBS
     stamp. You got a hand-rolled `<div class="card">` holding a name, a role and a button.

     SO YOUR ROW GOES THROUGH THE SAME FUNCTION. Found by `personId` first — CLAUDE.md is emphatic
     that an id beats a name, and `changePin` is the entry where matching a person by their display
     name was a real denial — then by handle, then by name, which is the same order `findPerson`
     uses on the backend and for the same reason.

     AND IF YOU ARE NOT STAFF THERE IS NO ROW, so one is built from what signing in already
     returned. That is not a second renderer: it is a second SOURCE for the same renderer, which is
     the distinction the note above is about. */
  const mineIs_ = t => !!t && (
    (USER.personId && t.personId && String(t.personId) === String(USER.personId)) ||
    (USER.handle && t.handle && norm(t.handle) === norm(USER.handle)) ||
    (USER.name && t.title && norm(t.title) === norm(USER.name)));

  const myRow = (DATA.tutors || []).filter(mineIs_)[0] || {
    title: USER.name || 'Signed in',
    role:  roleOf(USER.role || 'student'),
    handle: USER.handle,
    image: USER.image || USER.photo || '',
    rate:  USER.rate,
    teaches: [],
    personId: USER.personId,
    /* ---------- `dbs` IS DELIBERATELY ABSENT HERE, AND ABSENT IS NOT `false` --------------------
       THE STAMP IS A REAL CLAIM. A tutor row's `dbs` comes from `TRUE_(r.dbs_checked)`, so it is
       always answered — true or false — and the note on the pass defends the negative outright:
       "a pass without one is visibly a pass without one, which is exactly the right amount of
       alarming". That is right for somebody a parent is checking.

       IT IS NOT A CLAIM ANYBODY HAS MADE ABOUT A ROW BUILT HERE. A parent looking at their own
       account has no `dbs_checked` cell anywhere, and printing NO DBS ON FILE across it would be
       the `cost: 0` shape one more time: a missing fact rendered as a negative one. Omitting the
       key is what tells the two apart — see `findCard`. */
  };

  /* ---------- AN ITEM, NOT A ROW, AND THAT IS WHY THE MESSAGE TILE WAS MISSING -------------------
     REPORTED FOR THE SECOND TIME: "I don't see a message tile on tutors." The first time the tile
     was real and the CARD could not be reached — the `facets` sheet had put a filter in front of
     the doors. This time the card is right here on the account column and the tile is genuinely
     not drawn, for a different reason.

     `cardTiles_` IS APPENDED BY `stuffCard`, NOT BY `findCard`. Its own note says why — "one place
     instead of nine... a kind added tomorrow gets its actions without anybody doing anything" —
     and that is right, except this column calls `findCard` directly and so gets the card without
     the row of actions under it. A person seen on the Find screen has a Message tile; the same
     person seen here had none.

     AND A ROW IS NOT AN ITEM. `cardTiles_` reads `x.name`, `x.key` and `x.row.personId`; passing
     `{ kind, row }` gives it a card and an empty tile row, which is worse than no tiles because it
     draws a Message button addressed to nobody. So the shape is built the way `stuffItems` builds
     it, in one helper used for you and for everybody else — the same argument as `mineIs_` above:
     two places constructing one thing is two chances to construct it differently. */
  const asItem_ = t => ({
    kind: 'tutor', name: t.title, key: t.title, sub: t.subtitle || '', image: t.image,
    cost: priced_(t.rate), off: t.listed === false, row: t,
  });

  const withTiles_ = t => (typeof findCard === 'function' ? findCard({ kind: 'tutor', row: t }) : '')
    + (typeof cardTiles_ === 'function' ? cardTiles_(asItem_(t)) : '');

  /* ---------- AND THE PRIVATE HALF WENT DARK WHEN BOOKING LEFT THE FUNNEL -----------------------
     `meCard` HOLDS THE FACTS ONLY YOU SEE — your credits, your e-mail, where you are — and the one
     thing that reached it was `KINDS.tutor.card`, which is the funnel's renderer for a tutor. The
     funnel does not list tutors any more (see `FUNNEL_NOT_FOR`), so the whole of your private half
     became unreachable in the same commit that removed the answer, silently, on a column whose
     entire job is to show you your own account.

     CAUGHT BY ASKING WHAT `meCard` IS FOR rather than by anything running. That is the shape this
     file records under `d = libraryInto_(…)` and under `resource_type` in `VOCAB`: a correct
     function left standing with nothing calling it, doing nothing, looking fine.

     SO THIS COLUMN CALLS IT, which is where it always belonged — `meCard`'s own note says the
     private rows hang off the public card, and this is the one screen that is yours. It is given
     the row `mineIs_` found rather than looking a second time: two lookups for one person is two
     answers to "which row are you", which is the fault `mineIs_` exists to prevent. */
  const me = [
    typeof meCard === 'function' ? meCard(myRow) : withTiles_(myRow),
    typeof cardTiles_ === 'function' ? cardTiles_(asItem_(myRow)) : '',
    `<button class="btn quiet" data-do="signout" style="margin-top:.7rem">Sign out</button>`,
  ].join('');

  const others = (DATA.tutors || [])
    .filter(t => t && t.title && t.listed !== false)
    /* NOT YOU, TWICE. With a tutor row of your own you would otherwise appear at the top as your
       account and again below as a tutor — the same duplication the `me` kind was merged away to
       avoid. Matched by `mineIs_`, the same test that FOUND the row above, so the two can never
       disagree about which person you are. */
    .filter(t => !mineIs_(t))
    .map(withTiles_);

  /* ---------- THE WRAPPER WENT WHEN THE PASS DID, AND LEAVING IT WOULD HAVE NESTED TWO CARDS -----
     THIS RETURNED `<div class="card is-widget">${html}</div>` AROUND EVERY PAGE. It was the answer
     to "I want them standardised like the other widgets" when a person was a `.pass` — a bare
     object with none of a card's rules, drawn straight onto the pane while page one was an ordinary
     card. Putting the pass in a box made the column consistent without changing the pass.

     ASKED AGAIN, AND THE SECOND ANSWER IS THE REAL ONE: the pass is gone and `findCard` returns
     `.card.is-widget` itself. Keeping this line would put a widget card inside a widget card —
     two borders, two backgrounds, two lots of padding — which is visibly worse than what was
     reported in the first place and is exactly what "just a normal widget" rules out. */
  return [me].concat(others);
}

/* THE COLUMN ITSELF. One page when signed out — the sign-in card — and one when signed in. Kept
   here beside `accountPages_` rather than in me.js, because the thing it draws is built here and a
   screen registered away from what it draws is a screen somebody has to go looking for. */
/* ANYTHING UNSIGNED RIDES WITH THE ACCOUNT. The library is in the funnel, which is where somebody
   goes to CHECK a document; this is where somebody is TOLD about one. See the long note at the top
   of terms.js on why both exist. */
screen('account', () => pages('account',
  accountPages_().concat(typeof termsPages_ === 'function' ? termsPages_() : [])));

/** Everything spliced between the question and the results, whichever answer is showing. */
function frontPages_() {
  return [].concat(bookingPages_(), feedPages_());
}

/* WHICH PAGE THE QUESTION IS ON. Saved things sit in front of it and their number changes with a
   star, so this is asked rather than assumed — off the id on the page itself. */
function stuffQuestionPage_() {
  const el = $('stuff-controls');
  const page = el && el.closest('.page');
  if (!page || !page.parentNode) return 0;
  return [].indexOf.call(page.parentNode.children, page);
}

function stuffFirstResult_() {
  /* PAST THE BOOKING PAGES TOO. They sit between the question and the results, so a result's index
     is its position minus the question, minus however many of those there are. Counted from the
     same function that draws them, so the two cannot disagree about how many there were. */
  /* THE BASKET IS NOT COUNTED ANY MORE — it moved to the Booking column. See `bookingPages_`. */
  return stuffQuestionPage_() + 1 + frontPages_().length
       + savedPages_().length;
}

function stuffPageCount() {
  /* ---------- NOTHING IS LISTED UNTIL SOMEBODY NARROWS -------------------------------------
     This screen used to open with all five hundred and sixty-six resources paged out behind the
     question — seventy-one pages of things nobody had asked to see, built as you approached them,
     for a library nobody browses from the top.

     The funnel is the whole point of the screen: it asks what you are after and the answer is the
     list. Offering the entire library first is answering before the question, and it is what makes
     the first swipe on this column land in a wall of resources.

     One page — the question — until a filter is pressed or something is typed. */
  /* ZERO, NOT ONE. This is how many pages of RESULTS there are, and it is added to the question
     page rather than including it — `stuffPages` is `[the question].concat(this many blanks)`. So
     returning 1 for "nobody has asked yet" made one page of results anyway, and `fillStuffPages`
     filled it with the first page of the whole unfiltered library. The gate was right and it was
     counting the wrong thing.

     Nought results is a real answer and the ordinary one on arrival: the screen is a question until
     somebody answers it. */
  if (!stuffAsked()) return 0;
  const n = stuffFiltered().length;
  /* AND ZERO AGAIN WHEN A SEARCH FINDS NOTHING. This returned 1, which is a blank page you can
     swipe to — the funnel already says "0 of 565" above, and a page of nothing underneath it is
     the same news told twice, the second time as an empty screen. */
  return n ? Math.ceil(n / stuffPerPage()) : 0;
}

/**
 * ONE PAGE'S MARKUP, built when it is needed and not before.
 *
 * A GROUP HEADING IS REPEATED at the top of a page that continues one. Four hundred resources
 * eight to a screen means most groups span several, and a page opening with eight subject names
 * and no subject is a page you would have to swipe back to understand.
 */
function stuffPageHtml(n) {
  const items = stuffFiltered();
  const credits = USER ? (USER.credits || 0) : 0;

  if (!items.length) {
    const why = STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
              : STUFF.q                          ? 'Try fewer words.'
              : STUFF.filters.length             ? 'Nothing matches all of those together.'
              : '';
    return (!FIND_MEMO.total)
      ? nothingHere('Nothing in the shop or the library yet.')
      : `<p class="empty">Nothing matches.${
          why ? `<br><span class="faint">${esc(why)}</span>` : ''}</p>`;
  }

  /* Cards, in order, and nothing between them. The continuation-heading logic went with the
     headings — repeating a group name at the top of a page that carries on from the last one was
     the fiddliest part of this function and existed only to make grouping survive being paged. */
  /* A WHOLE SCREEN EACH. The widget's own markup rather than a card standing in for it — the
     card was only ever a door, and there is nothing behind that door which could not be here. */
  if (showingWidgets()) {
    const wgt = items[n] && items[n].row;
    /* A SOLID WIDGET SAYS SO ON THE PAGE, so the stylesheet can turn the glass off underneath it
       without knowing which widget it is. */
    return wgt ? `<div class="widget-full${wgt.solid ? ' solid' : ''}">${wgt.html}</div>` : '';
  }

  const per = stuffPerPage();
  return items.slice(n * per, (n + 1) * per)
    .map(x => stuffCard(x, credits)).join('');
}

/* One card. Lifted out of the list so the pager and anything else can build one without rebuilding
   all four hundred around it. */
/**
 * THE CARD FOR A THING, whatever kind it is.
 *
 * This was a hundred and thirty lines of `if (x.kind === …)` — the same table the funnel already
 * needed for its groups and labels, written a second time, in a second shape, in a second place.
 * Adding a kind meant finding both and getting both right; getting one right produced something
 * that could be narrowed down and drew as a blank card, or the reverse.
 *
 * One line now. Everything a kind IS lives in `KINDS`.
 */
/* ==================================================================================================
   FAVOURITES.

   ONE STAR FOR EVERY KIND, and that is only possible because every item in this list already
   carries a `key` — a tutor is `t.title`, a widget is `w:timer`, a link is `link:…`. Nothing had to
   be added to eight card builders; the star wraps the card they all come out of.

   KEPT ON THE PERSON, NOT IN THE BROWSER. A favourite is a small statement about what somebody is
   looking for, and it should survive a new phone — `saveProfile` already carries arbitrary profile
   fields, so this rides on the one that exists rather than inventing a tab for a comma-separated
   list. `localStorage` holds the last known set so the star is right on the first frame, before any
   payload has arrived, the same trick the splash picker uses.
================================================================================================== */
let FAVS = (() => {
  try { return new Set(JSON.parse(localStorage.getItem('favs') || '[]')); }
  catch (e) { return new Set(); }
})();

/* AND WHAT THE SHEET SAYS, once a payload has arrived. `localStorage` is right for the first frame
   and wrong on a new phone — it is a cache of this device, not a record of the person. The sheet
   wins when it answers, which is what makes a star survive changing phone: the thing that was
   broken here for as long as favourites have existed. */
function adoptFavourites_() {
  if (!DATA || !DATA.favourites) return;
  FAVS = new Set(DATA.favourites.map(String));
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
}

const isFav = k => FAVS.has(String(k));

function toggleFav(k, kind) {
  const key = String(k);
  if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
  try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
  /* SAVED QUIETLY. A star is not worth a toast or a spinner — and if the save fails the star is
     still right on this device, which is the part that matters in the moment. */
  if (USER) {
    /* ---------- `saveProfile` DOES NOT EXIST, AND NEVER HAS ---------------------------------------
       EVERY STAR ON THIS SITE HAS BEEN DEVICE-ONLY. The action is `updateProfile`; this called
       `saveProfile`, the backend refused it, and `.catch(() => {})` threw the complaint away — so
       favourites worked perfectly until somebody changed phone, and then quietly did not. Nothing
       could have reported it: the star was already right on screen, and the only evidence was an
       error nobody was catching.

       AND IT SENDS ONE FAVOURITE, NOT THE WHOLE LIST. Writing "a,b,c" back to a profile field is
       the read-modify-write that loses one of two taps made at once, and this was doing it across
       two tabs of the same account. `favourite` appends or deletes a single row instead — nothing
       is read first, so nothing can be overwritten. */
    /* THE KEY IS NOT SPLITTABLE, so it is not split. Some are a bare title — `key: t.title` for a
       tutor — and some are prefixed, `w:123` for a widget. Splitting on the colon would turn
       "Colliers Wood Library" into kind "Colliers Wood Library" and lose the rest, and would give
       a tutor called "Smith: Maths" a kind of "Smith". The kind is passed separately by the caller,
       which knows it for certain, and the key goes across whole. */
    /* ---------- AND IT WAS STILL CALLING `send` WITH TWO ARGUMENTS ----------------------------
       `function send(body)` TAKES ONE. Written as `send('favourite', { … })` the body is the STRING
       `'favourite'`, which `api` then runs through `Object.assign({}, body)` — so what left the
       phone was `{"0":"f","1":"a","2":"v","3":"o","4":"u","5":"r","6":"i","7":"t","8":"e"}` and a
       token. Measured on the wire, not read: no `action`, no `itemId`, no `personId`. `doPost`
       reads `S(body.action)` as `''`, `accessDenied` refuses it before the handler is reached, and
       `.catch(() => {})` threw the refusal away.

       SO NO FAVOURITE HAS EVER BEEN WRITTEN, and the note above this one — which says every star
       "has been device-only" because it called a `saveProfile` that does not exist — describes the
       line under it accurately except for the action's name. The action was corrected and the
       shape of the call was not.

       IT IS WORSE THAN DEVICE-ONLY, and this is the half that makes it a live bug rather than a
       missing feature. `DATA.favourites` therefore always comes back empty, and `adoptFavourites_`
       replaces `FAVS` with it AND overwrites `localStorage` — so a star survives until the next
       payload lands and is then wiped from the device too. One page view.

       `collections.js` HAS THE WHOLE ARGUMENT WRITTEN OUT, twenty lines of it, because `toggleSpot`
       was this exact bug and was fixed. The star it was copied from was not. **This is why a fix
       to an instance is not a fix**, which is the sentence this repository keeps writing about
       `cost: 0` — and the reason `check-replies.js` now refuses a two-argument `send` outright. */
    send({
      action: 'favourite',
      name: USER.name, personId: (USER && USER.personId) || '',
      kind: kind || 'item', itemId: key,
      on: FAVS.has(key) ? 'TRUE' : '',
    }).catch(err => {
      /* PUT THE STAR BACK. `.catch(() => {})` was the other half of the disguise: the set is
         changed three lines up, so the star fills the moment it is pressed and the failure is
         discarded without a word. Somebody stars six things, sees six stars, reloads and has none.
         `toggleSpot` already does exactly this and its note says why. */
      if (FAVS.has(key)) FAVS.delete(key); else FAVS.add(key);
      try { localStorage.setItem('favs', JSON.stringify([...FAVS])); } catch (e) {}
      if (typeof repaint === 'function') { try { repaint(); } catch (e) {} }
      toast(String((err && err.message) || 'That did not save'));
    });
  }
}

on('fav', el => {
  toggleFav(el.getAttribute('data-key'), el.getAttribute('data-kind'));
  /* THE ONE CARD, not the whole list. Redrawing the page would lose the scroll position, and
     somebody starring their way down a list of ninety would be thrown back to the top each time. */
  /* THE WRAPPER, WHICH IS WHAT THE STYLE READS. This toggled `is-fav` on the CARD — `.thing`,
     `.card`, `.paper` — while the rule that colours a starred star is `.favwrap.is-fav .star`. So
     the class landed on an element no rule was watching and the star never lit. The wrapper is also
     the only element guaranteed to exist here; the card is whichever of four builders drew it. */
  const on = isFav(el.getAttribute('data-key'));
  const wrap = el.closest('.favwrap');
  if (wrap) wrap.classList.toggle('is-fav', on);
  /* THE TILE'S OWN LABEL, not a glyph — the same correction `on('spot')` needed when it was still
     writing ✦ over a control that had become two spans. */
  tileSet_(el, { label: on ? 'Saved' : 'Save', on: on });

  /* ---------- AND THE PAGES IN FRONT OF THE QUESTION ---------------------------------------------
     A saved thing is a PAGE now, so starring one does not change what is on a page — it changes how
     many pages there are. Nothing can be repainted in place for that; the strip has to be rebuilt.

     `paintStuff` IS EXACTLY THAT REBUILD and already keeps what must not be rebuilt: the question
     page is updated in place, so the search box does not lose the word you are typing. It lands you
     on the question afterwards, which is the right place to be left after adding something to the
     pages in front of it. */
  /* STAY ON THE CARD YOU STARRED. A star adds or removes a page in front of the question, so the
     index shifts — `paintStuff` moves it by exactly that much rather than sending you to the top. */
  if ($('s-stuff')) paintStuff(true);
});

function stuffCard(x, credits) {
  /* `credits` is passed IN rather than read from `USER` here, because the page works it out once
     and hands it to every card — reading it per card would be the same lookup eight times a page.
     Dropping it while moving these was the one thing the branches needed from their old home, and
     nothing said so until a shop card asked what it could afford. */
  /* A kind with no card of its own falls back to the shared one — a new row type appears on the
     screen as SOMETHING rather than as nothing, which is the failure that is easy to miss. */
  const html = (kindOf_(x).card || thingCard_)(x, credits);
  if (!x.key) return html;
  /* THE STAR IS NOT HERE ANY MORE — it is the first tile in the action row, drawn by `favTile_`
     inside `cardTiles_`, which every card builder already calls. A floating button in the corner
     was the one control that was not where the others were, and it was the one people went looking
     for among them.

     THE WRAPPER STAYS. `.favwrap.is-fav` is what marks a kept card as kept at a glance on a list,
     and that is a fact about the CARD rather than about the button that set it.

     ---------------------------------------------------------------------------------------------
     AND THE ACTIONS ARE OUTSIDE THE CARD NOW, added here rather than by each builder.

     EVERY BUILDER USED TO END WITH `${cardTiles_(x)}` INSIDE ITS OWN MARKUP, which put the controls
     on the thing rather than under it — and on a past paper that is literal: `.paper` is a sheet of
     off-white exam paper, and the buttons were printed on it, below "ANSWER ALL QUESTIONS". A
     control belongs to the app, not to the document it acts on.

     ONE PLACE INSTEAD OF NINE. Nine builders each remembering to call it was nine chances to
     forget, and a card with no star was indistinguishable from a card nobody could keep. Now a
     kind added tomorrow gets its actions without anybody doing anything — the same reasoning that
     made the star a wrapper in the first place. */
  return `<div class="favwrap${isFav(x.key) ? ' is-fav' : ''}">${html}</div>${cardTiles_(x)}`;
}

/* The chips, and the + that adds one. Drawn with the list rather than with the two selects above
   it, because this row grows and shrinks and a fixed control does not. */
function filterChips() {
  return `<div class="chips">
    ${STUFF.filters.map((f, i) => `
      <button class="chip" data-do="filter-drop" data-i="${i}">
        <span class="chip-k">${esc((facetBy(f.field) || {}).label || f.field)}</span>
        ${/* A SKIP IS A CHIP LIKE ANY OTHER, with the same ✕, because it is a decision somebody
             made and has to be able to unmake. A question silently dropped with nothing on screen
             saying so is the funnel "changing its mind" again — the complaint `whyThisQuestion()`
             was written for. */''}
        ${f.any ? 'any' : esc(f.value)}<span class="chip-x">✕</span>
      </button>`).join('')}
    ${/* `clear` WAS GREY TEXT ON NOTHING — no border, no fill, the faint colour — sitting at the end
          of a row of bordered chips. It read as a caption rather than a control, which is the one
          thing a control must never do. It is a chip like the others now, with the same ✕ the chips
          carry, so the row is a row of things you can press. */''}
    ${STUFF.filters.length > 1
      ? '<button class="chip is-clear" data-do="filter-clear">'
        + '<span class="chip-k">clear</span><span class="chip-x">✕</span></button>' : ''}
  </div>`;
}

/* THE PICKER SHEET IS GONE. It asked which FIELD, then which VALUE — two taps and a panel over
   the screen before anything narrowed, and a list of every field whether or not it would change
   what you could see. The funnel asks the same questions in place, one at a time, already knowing
   which are worth asking.

   `filter-add` went with it. There is nothing to add: the next question is already on the page. */

/* `on('noop')` was here: a handler that did nothing, for markup that wanted to swallow a tap.
   Nothing carries `data-do="noop"`, so it swallowed nothing. */
/* ANSWERING THE QUESTION ON THE PAGE. One tap: it becomes a chip, and the next question — if
   there is one worth asking — takes its place. */
/* `on('book-jump')` WAS HERE, with the line that used it. */

/* `on('group-by')` AND `on('group-open')` WERE HERE — press to see the papers, press one to open
   it. Both set exactly the filter `facet-pick` sets, which is the whole argument for deleting
   them: the funnel now ASKS which paper once there are few enough to list, so opening one is
   answering a question, through the one handler that has always done that. */
on('facet-pick', el => {
  STUFF.filters.push({ field: el.dataset.field, value: el.dataset.value });
  paintStuff();
});
/* ---------- AND NOT ANSWERING IT IS ALSO AN ANSWER ----------------------------------------------
   Same push, same repaint, no value. See the `any` note in `stuffFind` for what that entry does and
   does not do. */
on('facet-skip', el => {
  STUFF.filters.push({ field: el.dataset.field, any: true });
  paintStuff();
});
on('filter-drop', el => { STUFF.filters.splice(Number(el.dataset.i), 1); paintStuff(); });
on('filter-clear', () => { STUFF.filters = []; paintStuff(); });

/**
 * REDRAW THE RESULTS AND NOTHING ELSE.
 *
 * The controls are page one and are never rebuilt — that is the whole reason they are a page of
 * their own. A search box redrawn on the keystroke loses its focus and its caret, and every
 * version of this screen so far has had a workaround for that somewhere.
 *
 * So the first `.page` is left exactly as it is and the rest are replaced. The chips live on that
 * first page too and DO get rewritten, because adding a filter is a press rather than a keystroke
 * and there is nothing to lose focus from.
 */
/* `keepPage` — STAY WHERE YOU ARE ---------------------------------------------------------------
   THIS ALWAYS JUMPED YOU BACK TO THE QUESTION, and for a filter change that is right: a filter is a
   new question and the answer to it starts at the beginning.

   IT IS WRONG FOR EVERY OTHER CALLER. Choosing a subject from a dropdown on the booking form calls
   this — the form is a page on this screen — and being thrown from the form back to the search box
   after every single answer is the "it scrolls up" nobody could work around. Same for starring a
   thing on a result page, and for the ✕ on a basket line.

   THE PAGE COUNT CAN STILL CHANGE UNDER IT — starring adds a saved page in front — so the index is
   nudged by however much the front of the list grew or shrank, rather than trusted blindly. Without
   that, a star on page twelve leaves you on page eleven's card. */
function paintStuff(keepPage) {
  const chips = $('stuff-chips');
  if (chips) chips.innerHTML = filterChips();
  const groups = $('stuff-groups');
  if (groups) groups.innerHTML = stuffQuestion();

  const host = $('s-stuff');
  if (!host) return;
  /* THE QUESTION PAGE, BY ITS ID. `:scope > .page` was "the first one", which is a saved thing now
     — so this kept a favourite and deleted the search box. */
  const ctrl = $('stuff-controls');
  const first = ctrl && ctrl.closest('.page');
  if (!first) return;
  /* WHERE WE WERE, AND WHERE THE QUESTION WAS, both read before anything is rebuilt — the second is
     what says how much the pages in front moved by. */
  const was = PAGE.stuff || 0;
  const wasQ = stuffQuestionPage_();

  /* ---------- THE QUESTION PAGE IS NOT REDRAWN, AND THAT IS THE WHOLE POINT ---------------------
     This was `host.innerHTML = first.outerHTML + …`, which rebuilds the first page from its own
     serialised markup. `outerHTML` writes an input's ATTRIBUTE, and the text somebody has typed
     lives in the PROPERTY — so a hundred and eighty milliseconds after every keystroke the search
     box was replaced by a copy of itself holding the value it had when the screen was last built.
     Focus gone, caret gone, and the letters you had just typed gone with them.

     The comment above the search handler says the box is no longer part of what gets redrawn. It
     was written when that was true and this line made it false again.

     So only the RESULT pages are replaced. The question page — the search box, the chips, the
     counts, the facet list — is updated in place by the three lines at the top of this function,
     which is what they were for. */
  [].slice.call(host.querySelectorAll(':scope > .page')).forEach(el => {
    if (el !== first) el.remove();
  });

  /* ---------- ONE INSERT, IN THE ORDER `screen('stuff')` BUILDS -----------------------------------
     THIS PUT THE SAVED AND BASKET PAGES BEFORE THE QUESTION. `screen('stuff')` puts them after it —
     `[controls], frontPages_(), savedPages_(), basketPages(), blanks` — and the note that used to
     be here claimed the two agreed. They did not, and the note four lines above it had already
     named the risk: "Two ways of ordering the same page list, twenty lines apart, is a good way to
     get one of them the wrong way round."

     WHAT THAT DID. `stuffFirstResult_` counts the first result as
     `question + 1 + front + saved + basket`, which is right for the order the screen is BUILT in.
     Move saved and basket in front of the question and `stuffQuestionPage_()` already includes
     them — so they were counted twice, the first result was placed one page too far down for every
     saved thing, and the gap was a page with a pane and nothing in it. Star one thing and a blank
     card appears under the question; star two and there are two.

     It only happened after a repaint, which is why the screen looked right until you pressed a star.

     ONE INSERT AND ONE ORDER. The string's own order is the order, so there is nothing to reason
     about — `afterend` with four separate calls is what made the old code need a paragraph
     explaining that the last one lands nearest. */
  const after = frontPages_().concat(savedPages_())
    .map(c => `<section class="page"><div class="pane">${c}</div></section>`)
    .join('')
    + Array.from({ length: stuffPageCount() },
        /* WITH A PANE IN IT. These were bare `<section class="page">`, and a page with no pane is a
           page with no glass — so every result was drawn straight onto the black while the question
           above it sat on a card. `pages()` builds every other page in the app this way. */
        () => '<section class="page"><div class="pane"></div></section>').join('');
  if (after) first.insertAdjacentHTML('afterend', after);

  /* AND BACK TO THE TOP OF THE RESULTS. A filter is a new question, and the answer to it starts at
     the beginning — `paintPager` only CLAMPS, so changing a filter while on page twenty of the old
     results landed you on the last page of the new ones, which reads as the app having lost its
     place. */
  /* ON THE QUESTION, NOT ONE BEFORE THE RESULTS. Those were the same page until the booking pages
     went between them; `stuffFirstResult_() - 1` is now the last of those, so answering "what for"
     would have dropped you at the foot of the booking form rather than on the question you just
     answered. Zero is no good either — that is a saved thing. */
  PAGE.stuff = keepPage
    ? Math.max(0, Math.min(was + (stuffQuestionPage_() - wasQ), host.children.length - 1))
    : stuffQuestionPage_();

  fillStuffPages();
  paintPager('stuff', true);
}

/**
 * THE PAGES YOU CAN SEE, AND ONE EITHER SIDE.
 *
 * A page two turns away is off-screen and behind two others; its markup is a cost with no reader.
 * So a page is filled when it comes within reach and emptied when it leaves, which keeps the
 * document the size of five screens however long the library grows.
 *
 * Filled INDIVIDUALLY rather than by rewriting the strip, because rewriting it mid-turn destroys
 * the elements the transition is animating and the dial jumps instead of turning.
 */
/* ---------- THE ONE RULE THIS SCREEN KEPT BREAKING -----------------------------------------------
   WHERE A CARD SITS DEPENDS ON HOW TALL THE CARDS ABOVE IT ARE. So anything that changes what is on
   a card has changed the layout, and has to say so.

   This function is the only place in the app that writes into a pane after the grid has been
   placed — it fills the pages you are near and empties the ones you are not — and it never said a
   word. Worse since the fill was moved to AFTER the slide: every position was then worked out
   against panes that were still empty, so a 400px docket was placed as though it were nothing and
   landed on top of the game below it.

   No observer, and deliberately not. Watching every pane for a size change was what used to make
   this screen stutter, and it answered a question nobody needed asked continuously. Content changes
   here, in one function, on purpose — so the telling belongs here too, once, at the end. */
/* ==================================================================================================
   THE LAYOUT DOCTOR — `layout()` in the console, or tap the version line on the You screen.

   WHY THIS EXISTS. Every layout fault on this app has been fixed by somebody reading code and
   reasoning about what the boxes must be doing, and the boxes have disagreed roughly half the time.
   Reading cannot tell you that a pane measured 0 because it had not been filled, or that a rule
   thirty lines further down clipped the column. Only the browser knows, and it will say if asked.

   So this asks. It prints, for the screen you are on, every page's REAL top, height and gap, and
   the two facts that have actually gone wrong over and over:

     OVERLAP    two cards occupying the same pixels — the fault you can see
     UNFILLED   a page with nothing in it, which is what makes a card land on another

   Paste what it prints. It is the difference between a fix and a guess.
================================================================================================== */
function layout(which) {
  const id = which || AT;
  const host = $('s-' + id);
  if (!host) { console.log('no screen called ' + id); return; }
  const pages = [].slice.call(host.querySelectorAll(':scope > .page'));
  const cs = getComputedStyle(host);
  const rows = [];
  let overlaps = 0, unfilled = 0;

  const box = el => { const r = el.getBoundingClientRect(); return { top: r.top, bot: r.bottom, h: r.height }; };

  pages.forEach((el, i) => {
    const pane = el.querySelector(':scope > .pane');
    const b = box(el);
    const prev = i ? box(pages[i - 1]) : null;
    const gap = prev ? +(b.top - prev.bot).toFixed(1) : null;
    if (gap !== null && gap < -0.5) overlaps++;
    const filled = el.dataset.filled === '1' || i === 0;
    if (!filled) unfilled++;
    rows.push({
      page: i,
      at: i === (PAGE[id] || 0) ? '<<' : '',
      filled: filled ? 'yes' : 'NO',
      top: +b.top.toFixed(1),
      height: +b.h.toFixed(1),
      pane: pane ? +pane.getBoundingClientRect().height.toFixed(1) : 'none',
      gapAbove: gap === null ? '' : gap,
      overlap: gap !== null && gap < -0.5 ? 'YES' : '',
    });
  });

  /* ---------- ACROSS, BEFORE ANYTHING ELSE -----------------------------------------------------
     The vertical report below has been useful and it says nothing about the thing most often
     wrong: how far apart the COLUMNS are and how much of the next one you can see. Three rounds
     have gone on that with me reasoning from code and you telling me it is still wrong, which is
     exactly the loop this function exists to end.

     It prints what the browser actually did — the real width of a card, the real distance to the
     next column, the real number of pixels of it inside the screen, and whether it is being drawn
     faintly enough to be invisible on a black background. */
  {
    const rows = TABS.map(t => {
      const el = $('s-' + t.id);
      if (!el) return { tab: t.id, drawn: 'NO SCREEN' };
      const cs = getComputedStyle(el);
      const page = el.querySelector(':scope > .page');
      const r = page ? page.getBoundingClientRect() : null;
      return {
        tab: t.id,
        cardLeft: r ? +r.left.toFixed(0) : '—',
        cardWidth: r ? +r.width.toFixed(0) : '—',
        widthPct: r ? +(100 * r.width / innerWidth).toFixed(1) : '—',
        onScreen: r ? +(Math.max(0, Math.min(innerWidth, r.right) - Math.max(0, r.left))).toFixed(0) : '—',
        opacity: +cs.opacity,
        visibility: cs.visibility,
      };
    });
    console.log('ACROSS — screen is ' + innerWidth + 'px wide');
    console.table(rows);
    const near = rows.filter(x => x.onScreen > 0 && x.opacity > 0);
    console.log(near.length > 1
      ? 'you should see ' + (near.length - 1) + ' neighbour(s); the widest sliver is '
        + Math.max.apply(null, near.map(x => x.onScreen).filter(n => n < innerWidth)) + 'px'
      : '*** NO NEIGHBOUR IS BOTH ON SCREEN AND VISIBLE — that is why you cannot see one');
    console.log('');
  }

  console.log('screen        : ' + id + '   pages ' + pages.length + '   at ' + (PAGE[id] || 0));
  console.log('screen display: ' + cs.display + '  gap ' + cs.gap + '  contain ' + cs.contain
    + '  overflow ' + cs.overflow);
  console.log('screen height : ' + host.clientHeight + '   transform ' + cs.transform);
  console.table(rows);
  console.log(overlaps ? '*** ' + overlaps + ' OVERLAPPING PAIR(S) — cards are on top of each other'
                       : 'no overlaps');
  console.log(unfilled ? unfilled + ' page(s) have nothing in them' : 'every page is filled');
  return { screen: id, overlaps, unfilled, rows };
}

/* HOW MANY PAGES EITHER SIDE OF THE ONE YOU ARE ON GET BUILT AHEAD. Raise it if a fast flick still
   lands on a blank page; lower it if holding the markup ever starts to cost something. */
const STUFF_NEAR = 5;

function fillStuffPages() {
  const host = $('s-stuff');
  if (!host) return;
  let changed = false;
  const pages = host.querySelectorAll(':scope > .page');
  const at = PAGE.stuff || 0;
  const items = stuffFiltered();
  const first = stuffFirstResult_();
  for (let i = first; i < pages.length; i++) {
    const el = pages[i];
    /* INTO THE PANE, not over it. Writing to the page itself replaces the glass wrapper with bare
       content — which is exactly what happened, for as long as these pages were built without a
       pane to write into: the results were drawn onto the black while the question above them sat
       on a card.
       `paneOf_` used to hand back the page when there was no pane, so this could not tell the two
       apart. It returns nothing now, and a page with nowhere to put its contents is skipped and
       said out loud rather than filled wrongly. */
    /* `paneOf_` makes one if the page has not got one, so there is nothing to check here. */
    const pane = paneOf_(el);
    /* FIVE EITHER SIDE. This was one, then two, and each widening was bought for the same reason:
       a page built at the moment you turn to it is a page that stutters as you turn to it, and the
       only screen filled lazily was the only screen whose swipe was not smooth.

       TWO COVERED A SINGLE GESTURE and nothing more. A flick that carries three or four pages —
       which is most of how anybody moves through a list of this length — outruns it and lands on
       an empty page while the fill catches up.

       WHAT IT COSTS IS MARKUP HELD, eleven pages instead of five, and nothing else: the widgets are
       not started on the pages either side, only on the one being looked at, so nothing is running
       out of sight. Pictures on those pages are `loading="lazy"` and the browser decides for itself
       whether to fetch them.

       ONE PLACE TO CHANGE IT, because the number appears in the test above and in the clearing
       below, and two comparisons that are supposed to be the same number are two comparisons that
       will eventually disagree. */
    const near = Math.abs(i - at) <= STUFF_NEAR;
    if (near && el.dataset.filled !== '1') {
      pane.innerHTML = stuffPageHtml(i - first);
      el.dataset.filled = '1';
      changed = true;
      /* AND DRAWN WHILE IT IS BUILT, if it is one of the ten that do not loop. This is the whole of
         the fix for widgets popping open: the markup and its contents now arrive together, five
         pages before anybody sees either. It happens before `settle_` below, so the grid measures
         panes that are already their final height rather than measuring them and being wrong. */
      const w = showingWidgets() && items[i - first] && items[i - first].row;
      if (w && !w.stop) drawWidget_(w);
    } else if (!near && el.dataset.filled === '1') {
      pane.innerHTML = '';
      delete el.dataset.filled;
      changed = true;
    }
  }

  /* AND START THE ONE YOU ARE LOOKING AT — if it is one that runs.
     THE CANVAS IS WHY THIS STAYS LATE FOR THOSE TWO. A canvas measures itself from its box, and the
     bird drawn while its page is off to the side takes whatever size it happens to have there. The
     ten that draw with markup have no such problem, which is the other half of why they are safe to
     build ahead.
     Started again on every fill rather than once. They are idempotent — a board redraws from the
     position it already holds, a clock from the time it already has — and remembering which have
     been started is a second thing to keep true. */
  if (!showingWidgets()) { stopWidget_(); settle_(changed); return; }
  const wgt = items[at - first] && items[at - first].row;
  if (!wgt) { stopWidget_(); settle_(changed); return; }
  if (!wgt.stop) {
    /* Already drawn with its page. Landing on a still widget still has to stop whatever was running
       on the page you came from, or Flabby Pird goes on drawing behind the calendar. */
    stopWidget_();
    settle_(changed);
    return;
  }
  startWidget_(wgt);
  /* A widget that has just started may have sized itself — a canvas takes its box — so the telling
     comes after that too, not before. */
  settle_(true);
}

/** The grid measures the panes again and puts everything where it now belongs. Instant: the cards
    have not moved as far as anybody is concerned, and animating them to where they already look
    like they are is a second movement nobody asked for. */
function settle_(changed) {
  if (changed) placeCells('y', true, 0, 'stuff');
}

/**
 * BRING ONE WIDGET TO LIFE, and say so in its own space if it does not.
 *
 * The same three steps `on('widget')` does — start it, look where it should have drawn, write the
 * reason there if nothing did. Shared rather than repeated, because a widget opened from a card
 * and a widget filling a page are the same widget and must fail the same way.
 */
/* ---------- A WIDGET THAT IS NOT BEING LOOKED AT MUST NOT BE RUNNING ------------------------------
   Nothing has ever stopped one. `startWidget_` starts whatever page you land on and there is no
   other half to it — so play Flabby Pird once and its animation loop goes on drawing sixty frames
   a second, into a canvas that is off the side of the screen, until the tab is closed. Start the
   sprint or the timer and their clocks go on ticking the same way.

   Every one of those competes for the same frames a swipe needs, which is why the column with the
   games on it was the one that never felt right, and why it got worse the more of them you had
   opened. Nothing about that is visible: an invisible canvas being drawn looks exactly like
   nothing at all.

   So exactly one widget runs at a time. Landing on a new one stops the last, and leaving the
   screen stops it too. A widget with no `stop` needs none — a calculator sitting still costs
   nothing — so this is only ever asked of the ones that loop. */
let WIDGET_ON = null;

function stopWidget_() {
  if (!WIDGET_ON) return;
  const was = WIDGET_ON;
  WIDGET_ON = null;
  try { if (was.stop) was.stop(); } catch (e) { console.warn('[widget stop]', was.id, e); }
}

/* ---------- DRAWING ONE IS NOT THE SAME AS RUNNING ONE -------------------------------------------
   THIS USED TO BE ONE FUNCTION AND THAT IS WHY WIDGETS POPPED OPEN. Because only one widget may be
   RUNNING at a time, only one was ever DRAWN — so a page you had already swiped past built its own
   contents at the moment you arrived, and you watched the calendar appear in a card that was
   already on the screen.

   ONLY TWO OF THE TWELVE ACTUALLY RUN. `tables` holds an interval and `flabby` holds an animation
   frame, and those two declare a `stop`. The other ten — the calendar, the calculator, the docket,
   the notepad, the chess board, the cheat sheet maker — draw once and then sit there. Nothing was
   ever bought by drawing those late.

   SO A `stop` IS THE TEST. A widget that declares one is held to the old rule: started on arrival,
   stopped on leaving, one at a time. A widget without one is drawn as its page is built, five
   pages ahead of being looked at, and is simply there when you get to it. No new flag, no list to
   keep in step — the thing that says a widget loops is the thing that stops it looping. */
function drawWidget_(wgt) {
  let err = null;
  try { wgt.start(); } catch (e) { err = e; console.warn('[widget]', wgt.id, e); }

  const into = $(wgt.into);
  if (!into) { console.warn('[widget]', wgt.id, 'has nowhere to draw: #' + wgt.into); return; }
  /* A canvas and a textarea draw into themselves, so their emptiness says nothing about them. */
  if (wgt.into === 'flappy-canvas' || wgt.into === 'notepad') return;
  if (String(into.innerHTML || '').trim()) return;
  into.innerHTML = `<p class="note" style="padding:1rem;text-align:center">
    ${esc(wgt.what)} did not start.<br>
    <span class="faint">${esc(err ? String(err.message || err) : 'It drew nothing.')}</span></p>`;
}

/* ---------- EVERY WIDGET, FIXED AND MADE -----------------------------------------------------------
   `WIDGETS` IS A CONST ARRAY of the things this app can open — chess, the calendar, the notepad. It
   was the whole list, and the whole list was known before the payload arrived.

   MESSAGE THREADS ARE NOT KNOWN IN ADVANCE. There is one per person who has written to you, so they
   are built from `MESSAGES` — see `msgWidgets_` in me.js. Anything that looks a widget up has to
   look here rather than at the const, or a thread would appear in the list and refuse to open. */
function allWidgets() {
  /* THE STATIC ONES, THEN THE TWO SETS THAT ARE MADE FROM DATA — a widget per conversation and a
     widget per session you are in. Both are the same idea: a thing you can name is worth being its
     own entry rather than a row inside a container somebody has to open first. */
  return WIDGETS
    .concat(typeof msgWidgets_ === 'function' ? msgWidgets_() : [])
    .concat(typeof liveWidgets_ === 'function' ? liveWidgets_() : []);
}

function startWidget_(wgt) {
  /* The same one again is already running — restarting would throw away a game in progress and a
     clock somebody is watching. */
  if (WIDGET_ON && WIDGET_ON.id === wgt.id) return;
  stopWidget_();
  WIDGET_ON = wgt;
  drawWidget_(wgt);
}

/**
 * THE QUESTION, ON THE PAGE.
 *
 * What was here showed the groups the results would be put in — useful, and only ever one facet:
 * whatever `group` happened to be set to. This asks the next question that would actually narrow
 * things, whichever facet that turns out to be, and stops asking when there is nothing left worth
 * asking.
 *
 * WHAT IT LOOKS LIKE, in order down the page:
 *   the chips     what you have already said, each one removable
 *   the count     how many that leaves, and how many pages
 *   the question  one heading and a short list with counts
 *
 * And when the questions run out it says so, rather than showing an empty heading — which is the
 * moment somebody needs telling that swiping up is the next move.
 */
/* NAMED FOR WHAT IT WAS, not what it is. This drew the group list once; it draws the funnel's
   next question now, and the grouping it was named after no longer exists. Renamed so the one
   thing left on the browse page is called what it does. */
function stuffQuestion() {
  const items = stuffFiltered();
  /* NOBODY YET, and a way to fix that. An empty Friends list is the one empty result on this
     screen that is not a dead end — every other kind is empty because the sheet is, and this one
     is empty because you have not added anybody. */
  if (STUFF.filters.some(f => f.value === 'Friends') && !items.length) {
    return `<p class="empty">No friends yet.<br>
      <span class="text-action" data-do="friend-add-open">Add someone by their handle</span></p>`;
  }
  /* ---------- AN EMPTY FUNNEL SAID NOTHING AT ALL, WHICH IS THE WORST OF THE THREE ANSWERS -------
     `return ''` WAS HERE, AND IT DREW A SEARCH BOX OVER A BLANK SCREEN. No question, no sentence,
     no reason — because `stuffPageCount` returns 0 until somebody has answered something, so the
     `nothingHere` branch in `stuffPageHtml` is not reached on arrival and this was the only thing
     with a chance to speak.

     FOUND BY THE `every tab draws something` JOURNEY the moment Booking left the funnel: with the
     check's payload holding two tutors, two venues and no library, `stuff` drew 0 characters of
     text. The journey was right, the fixture was not the fault, and the app has been one empty
     payload away from a blank front door for as long as this line has been here.

     FIFTH OCCURRENCE OF THIS REPOSITORY'S OLDEST SHAPE, and CLAUDE.md lists the other four —
     `loadMessages` showing an empty inbox for an unreachable backend, `check-booking.js` printing
     "nothing to check" and exiting 0, Reels drawing "Nothing here yet" for a column that worked,
     and `libraryRows_` reporting a dropped 3.4 MB file as an empty library. Every one is the same
     sentence: I did not manage to look, reported as I looked and there was nothing there. This one
     does not even get that far — it reports nothing whatsoever.

     `nothingHere` IS THE SENTENCE, because it is the one place that can tell an empty database from
     a request that failed: a dropped payload and a dropped library both land here, and both deserve
     a reason and a `Try again` rather than an invitation to go and fill in a spreadsheet.

     AND THE TWO EMPTIES ARE NOT THE SAME EMPTY. Nothing anywhere is the app having no content;
     nothing LEFT is a filter that has excluded everything, and the way out of the second is to take
     a chip off — which is on this page, one row up. `stuffPageHtml` already draws exactly that
     distinction for the results; this is the same two sentences at the point they are first true. */
  if (!items.length) {
    return FIND_MEMO.total
      ? `<p class="empty">Nothing matches.<br><span class="faint">${
           STUFF.q && STUFF.filters.length ? 'Try fewer words, or take a filter off.'
         : STUFF.q                          ? 'Try fewer words.'
         :                                    'Nothing matches all of those together.'}</span></p>`
      : nothingHere('Nothing in the shop or the library yet.');
  }

  /* THE ORDINARY QUESTION FIRST, and only if there is none, the one that is too long to draw whole.
     `over` is what says which of the two this is, so the row list below can trim itself without
     having to work out why it is being drawn. */
  const facet = nextFacet(items) || overFacet_(items);
  const over = facet && facetValues(items, facet).length > FACET_MAX_ANSWERS;
  const adding = STUFF.filters.some(f => f.value === 'Friends')
    ? `<p style="margin:.6rem 0 0"><span class="text-action" data-do="friend-add-open"
        >Add someone by their handle</span></p>` : '';
  if (!facet) {
    /* ---------- "NOTHING LEFT TO NARROW" WAS NOT TRUE, AND IT WAS THE LAST THING ON THE SCREEN ----
       IT SAID IT OVER 1,093 QUESTIONS WITH 48 TOPICS IN THEM, one line under a control offering
       exactly those 48 topics. The funnel had run out of QUESTIONS — no facet left with between
       two and forty answers — and the sentence reported that as having run out of ways to narrow,
       which is a different claim and a false one. Somebody reading it stops, which is what the
       screenshot was of.
       SO IT SAYS WHICH OF THE TWO IT MEANS. With a collection on offer the way on is the line
       above, and the sentence points at it instead of contradicting it. */
    const n = items.length === 1 ? 'one' : items.length;
    return `<p class="faint" style="margin:.6rem 0 0">Nothing left to narrow.
      Swipe up for the ${n}.</p>` + adding;
  }

  /* THE FRONT DOOR TO THE BOOKING FORM WAS HERE — a line above the funnel's answers, on the first
     question only, that filtered to Booking and turned to the form. It was clutter above the one
     question this screen exists to ask, and the form is not hard to reach: "What for · Booking" is
     the first answer in the list, and the Book buttons on tutor and venue cards go straight to it. */

  /* ---------- AS MANY ANSWERS AS ANYBODY READS, BIGGEST FIRST, THEN BACK INTO ORDER --------------
     BIGGEST FIRST TO CHOOSE THEM, ALPHABETICAL TO SHOW THEM. Which forty are worth drawing is a
     question about size; the order they are drawn in is a question about finding one, and those
     want opposite sorts. Taking the top forty and then putting them back into the order every other
     question uses is both.
     AND THE REST ARE NOT HIDDEN, they are one line below, pointing at the search box — which is
     already on this page, already filters these same items, and is the only control that can reach
     one specific answer out of three hundred. */
  const all = facetValues(items, facet);
  /* ONE TRIM, NOT TWO. This used to trim only the oversized facet and draw every other one whole,
     which is how a 16-answer `Sitting` ran off the bottom of the card. `FACET_MAX_SHOWN` is about
     the card and applies to all of them. */
  const values = all.length > FACET_MAX_SHOWN
    ? all.slice().sort((a, b) => b.n - a.n).slice(0, FACET_MAX_SHOWN)
         .sort((a, b) => all.indexOf(a) - all.indexOf(b))
    : all;
  const more = all.length - values.length;
  /* THE HEADING IS GONE — it read `> WHAT FOR   5` above five rows that were about to say the same
     thing. The label named a question whose answers were already on the screen, and the number
     counted rows you could see: a caption on a photograph of itself.
     THE COUNT BESIDE EACH VALUE STAYS, and is the one that was doing work. It is not how many
     choices there are, it is how many THINGS are behind each one — a value leaving three and a
     value leaving three hundred look identical without it, and the difference is whether the next
     tap is worth making. */
  /* `counted` TAKES THE CHEVRON OFF. See the stylesheet: a chevron is pinned to the right edge, and
     so is the count — so on a one-digit number it appeared beside the digit and on a four-digit one
     it disappeared behind them. Five rows, chevrons on two of them, and the two were whichever
     happened to have small numbers. It marked nothing and read as litter. */
  /* ---------- "DOESN'T MATTER", UNDER EVERY QUESTION -----------------------------------------------
     ON EVERY FACET, NOT ON THE ONE THAT PROMPTED IT. `School year` is where this was noticed —
     somebody who knows a sheet is "roughly KS2" was being asked to name a year and had no way past
     it — but the fault is the funnel's shape rather than that question's: EVERY question here is
     compulsory, and a person narrowing a list knows some things and not others. Writing a rule for
     the facet that annoyed somebody is how the `cost: 0` fault came back as `paper: true`.

     NO COUNT ON IT, deliberately. The number beside an answer says how many things are behind it,
     and the number behind "doesn't matter" is the count already printed above this list — a second
     copy of it here reads as a sixth answer that happens to be the biggest, which is exactly the
     shape of a button that does nothing.

     IT IS LAST because it is the way out of the question, not one of its answers. */
  /* `counted` WITHOUT A COUNT, which is not a contradiction: that class is what makes an answer a
     44px surface with a press animation instead of a 33px fact row with a hairline under it — see
     the block it names in style.css. A bare `.row.tap` here would have been the third conviction of
     the tap-target rule this repo already records twice. `is-skip` takes the fill back off, so it
     reads as the quiet way out of the question rather than a sixth answer. */
  const skip = `<div class="row tap counted is-skip" data-do="facet-skip"
        data-field="${esc(facet.field)}">
        <span class="k">Doesn't matter</span>
      </div>`;
  /* ---------- THE COUNT BESIDE EACH ANSWER IS GONE -------------------------------------------------
     IT WAS DEFENDED HERE AS THE THING DOING THE WORK — "a value leaving three and a value leaving
     three hundred look identical without it". That is true of a list you are deciding between and
     false of the one this is: the numbers are four digits wide on the first question, they change
     on every tap, and none of them is the answer to "which of these do I want". You choose a topic
     because it is the topic, not because it has 34 questions in it.

     IT IS STILL COMPUTED, and has to be — `facetSplit_` is a share of those counts and it is what
     keeps a question that cannot narrow off the screen. What changed is that it is arithmetic now
     rather than furniture. */
  const rest = more
    ? `<p class="faint" style="margin:.5rem 0 0;font-size:.78rem">and ${more} more
        ${esc(String(facet.label).toLowerCase())} answers — type one into the search box above.</p>`
    : '';
  /* `data-value` IS THE FULL NAME AND THE TEXT IS THE SHORT ONE — see `shortLabels_`. The chip this
     row creates has to find the rows it names, and `filterHit` matches on what is in `data-value`. */
  return values.map(v => `<div class="row tap counted" data-do="facet-pick"
        data-field="${esc(facet.field)}" data-value="${esc(v.value)}">
        <span class="k">${mark(v.show || v.value)}</span>
      </div>`).join('') + skip + rest;
}

/* `stuff-jump` went with the group list. It added a filter and turned to the results in one tap,
   which is exactly what `facet-pick` does — except that it only ever knew about the one grouping,
   so it could jump you to a subject and never to a key stage. */

/* `paperish_` WAS HERE — "is this row actually an exam paper", by its `resource_type` or a paper
   number in its name. It chose between the exam cover and an ordinary card, and both callers went
   with the cover. */



/* ---------- `paperCard`, `openPaper_` AND `on('paper-read')` WERE ALL HERE ------------------------
   `paperCard` DREW A PAST PAPER AS THE COVER OF ONE — the board across the top, the tier in its
   box, the subject, the paper number, a ruled line for a candidate's name, and the year with the
   page count and "Answer all questions" along the foot. Nothing on it was invented; every line was
   a column, arranged the way an exam paper arranges them, and it was the best-looking card here.

   IT IS GONE BECAUSE THE THING IT DREW IS NOT A RESULT. See the long note above `questionItems`:
   this screen finds questions, and a document is the box they came in. Three drawings of that card
   were tried and the third was still wrong, which is what finally said the card was not the fault.

   `openPaper_` LASTED ONE COMMIT. It opened the whole paper in a sheet off a `Read` tile, which was
   the right fix for the version before it — but a sheet full of questions is the collection again
   with a lid on.

   WHAT COULD STILL OPEN A REAL PAPER: `source_url` on the question rows, which is the PDF on the
   exam board's own site. 2,073 rows carry one. If a way back to the original is ever wanted, that
   link is what it should open — a real paper rather than a rebuilt one.
--------------------------------------------------------------------------------------------- */

/* `stuffCount` was here. Removed with the line it fed — a function whose only caller has gone is
   the thing `check-dead.js` would name next time anyway. */


screen('stuff', () => {
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. Without this the box snapped back to its first option
     every time the screen was redrawn, so the list and the dropdown above it disagreed — and the
     one you believe is the one you can see. */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  /* `#stuff-controls` MARKS THIS PAGE so the rest of the screen can find it. It used to be page
     zero and everything else indexed off "the first page" — with saved pages in front of it that
     is no longer true, and a hard-coded 1 would have `paintStuff` keeping a saved page and
     deleting the question. One id, and nothing has to count. */
  /* THE CREDITS STAY ON THE QUESTION and the way in and out does not — see `accountPages_`. A number
     is a fact about you and belongs beside the thing it is spent on; a button is a control and has
     earned a page of its own. */
  /* ---------- YOUR CREDITS WERE HERE, AND A BALANCE IS NOT A SEARCH CONTROL -----------------------
     THE NOTE ABOVE ARGUED "a number is a fact about you and belongs beside the thing it is spent
     on". Nothing on this screen is spent: the library is free, the basket has no checkout, and the
     one surface that takes credits is the booking form. So it was a card of your own above the
     question, on the app's front door, every single load — the same fault as the count line and
     the sort dropdown that were removed from this exact page for the same reason. It is on the You
     screen, which is where a balance goes. */
  const controls = `<div id="stuff-controls">`
    + `<input class="search" id="stuff-q" placeholder="Search…" value="${esc(STUFF.q)}">
    ${/* THE SORT WAS HERE — a dropdown offering A–Z and, when anything had a price, cheapest first.

          Gone with the grouping dropdown that went before it, and for the same reason: this screen
          is a QUESTION, and every control above the question is something to get past before you
          can ask it. A–Z is what a list of names should be anyway, and it stays — as the order the
          list is in, not as a thing to choose.

          The one real use was price, on a library where four hundred of four hundred are free. If
          things are ever priced enough for the order to matter, sorting belongs beside the prices
          rather than above the search. */''}
    <div id="stuff-chips">${filterChips()}</div>
    ${/* THE COUNT LINE WAS HERE — "565 of 565 · 27 pages". It said nothing anybody needed: before
          you narrow anything it is the size of the library, which is not a fact about your search,
          and after you narrow it the results are right there to be looked at. */''}
    <div id="stuff-groups">${stuffQuestion()}</div>
    ${/* SAVED IS NOT ON THIS PAGE AT ALL. It is the pages BEFORE this one — see `savedPages_`. */''}
  </div>`;

  /* THE CONTROLS ARE A PAGE, and the results are the pages after it. Four hundred cards under a
     search box is a column nobody reaches the end of; eight to a screen is a thing you turn.

     It also solves what every version of this screen has worked around: the controls are drawn
     once and never rebuilt, so typing in the search box cannot lose its own focus. */
  /* Empty pages. `fillStuffPages` puts markup in the ones you can reach, after the screen exists
     — a page cannot be measured or moved until it is in the document. */
  /* ---------- BOOKING IS A THING YOU FIND ----------------------------------------------------------
     THE BOOK COLUMN IS GONE and its contents are here, behind the question the funnel already asks.
     "What for · Booking" then offered Levels, Subjects, Tutors and Venues — the four things a
     booking is assembled FROM — and had nothing to say about assembling one. The form that does
     that was a column away.

     ONLY WHEN THE FUNNEL IS ON BOOKING, which is what makes this an answer rather than a seventh
     tab wearing a different hat. Ask a different question and none of it is drawn.

     AFTER THE QUESTION, NOT BEFORE IT. They went in front of the controls page first, beside the
     saved things — which put the form BEHIND you: you answer "what for · booking", the funnel keeps
     you on the question page, and the thing you asked for is a page back the way you came with
     nothing saying so. Saved things belong in front because they are what you already had; a form
     you just asked for belongs in the direction you are travelling.

     WHAT YOU KEPT, THEN THE QUESTION, THEN THE BOOKING, THEN THE ANSWER. */
  /* WHAT YOU ARE PAYING FOR, THEN WHAT YOU KEPT, THEN THE QUESTION. The basket first because it is
     the one with a deadline on it — a thing you meant to buy and forgot is a worse outcome than a
     thing you meant to look at again. */
  /* ---------- WHAT IS PUT IN FRONT OF YOU, THE QUESTION, THEN WHAT YOU KEPT -----------------------
     SPOTLIGHT FIRST. It was the top of the Posts feed, which meant it only existed once you had
     answered a question to get there — and the whole point of it is that it is what the business
     wants seen by somebody who has not asked for anything. In front of the question is the only
     place that is true of. It is also the only thing here that is not yours, which is the right
     order: theirs, then the question, then yours.

     SAVED AND BASKET AFTER. They were in front, on the argument that they are what you already had
     — and that put two pages of your own things between opening the app and being able to ask it
     anything, every time, whether or not there was anything in them. They are the answer to "what
     did I keep", and an answer goes where answers go.

     WHICH IS ALSO WHY THE BOOKING AND FEED PAGES SIT WITH THEM. Everything after the question is
     something you asked for; everything before it is the one thing you did not. */
  return pages('stuff', spotPages().concat(
    [controls],
    frontPages_(),
    savedPages_(),
    Array.from({ length: stuffPageCount() }, () => '')));
}, () => '');
/* THE `basket ‧ 2` LINK WENT WITH THE SHEET IT OPENED. The basket is the page in front of this one
   — one swipe, and the pager names it — so a control that jumps there is a shortcut to somewhere
   already visible. */

/* Typed into rather than pressed, so it cannot go through the click handler. Debounced, because
   redrawing four hundred cards on every keystroke is how a search box feels broken. Nothing needs
   putting back afterwards now — the box itself is no longer part of what gets redrawn. */
let stuffTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'stuff-q') return;
  STUFF.q = e.target.value;
  clearTimeout(stuffTimer);
  stuffTimer = setTimeout(paintStuff, 180);
});

/* `on('stuff-set')` WAS HERE, and the dropdown that sent it went when the funnel replaced the
   filter row. A handler with no door reads as a working feature to anybody looking at the source —
   which is the whole reason `check-doors` exists. */

/* ---------- THE DOCKET --------------------------------------------------------------------------
   A list of things to do, ticked off. It lives in ONE CELL on the person's row — `todo`, which has
   been in the schema since the beginning, has a live `saveTodo` handler behind it, and has never
   once been written to by anything.

   ONE CELL, NOT A TAB. A docket line has no life of its own: nothing links to it, nothing counts
   it, nobody else reads it, and it exists for about a day. A tab would mean a row id, a person id,
   an order column and a deletion policy for something that is a scrap of paper.

   PLAIN TEXT, so it stays editable in the spreadsheet. `x ` in front of a line means done, which
   is the notation anybody would use if handed the cell and no instructions — the format has to
   survive being typed at by a person, because sooner or later it will be.
--------------------------------------------------------------------------------------------- */
/* ---------- `x ` AS THE DONE MARKER CORRUPTED ANY LINE STARTING WITH AN X -----------------------
   TYPE "x ray results" AND THE DOCKET STORED A COMPLETED TASK CALLED "ray results". The marker for
   done was a bare `x ` or a tick at the front of the line, and nothing separated "this line is
   ticked" from "this line begins with the letter x". So the state was wrong AND the text was eaten
   — the two halves of the one thing a to-do list must not get wrong. "X marks the spot" went the
   same way. Demonstrated before changing anything, not reasoned about.

   THE MARKER IS NOW A MARKDOWN CHECKBOX, `- [x] ` and `- [ ] `. It cannot collide with ordinary
   prose the way a bare letter can; it is a convention anybody reading the sheet recognises on
   sight — and the sheet IS the database, so a person reads this column; and every line this app
   writes carries a box, so a line without one is legacy by definition.

   LEGACY LINES STILL READ CORRECTLY. Anything already in somebody's `todo` uses the old bare form,
   so it is still accepted on the way IN and never written on the way OUT — a docket converts itself
   the first time anything on it is touched. */
const DOCK_DONE = /^-\s*\[\s*x\s*\]\s+/i;
const DOCK_OPEN = /^-\s*\[\s*\]\s+/;
const DOCK_OLD  = /^(x|\u2713)\s+/i;

function docketLines() {
  return String((USER && USER.todo) || '').split(/\r?\n/)
    .map(t => t.trim()).filter(Boolean)
    .map(t => {
      if (DOCK_DONE.test(t)) return { done: true,  text: t.replace(DOCK_DONE, '') };
      if (DOCK_OPEN.test(t)) return { done: false, text: t.replace(DOCK_OPEN, '') };
      /* THE OLD FORM, READ ONLY — tried last, so a new-style line can never reach it. */
      if (DOCK_OLD.test(t))  return { done: true,  text: t.replace(DOCK_OLD, '') };
      return { done: false, text: t };
    })
    /* A LINE THAT WAS NOTHING BUT A MARKER leaves an empty text, and an empty row is a row you
       cannot tick, delete or read. Dropped here rather than drawn. */
    .filter(l => l.text);
}

/* WRITTEN WITH THE BOX EVERY TIME, done or not. An undone line with no marker would read back
   correctly today, and then two forms would be in circulation and the next person would have to
   know that. One form out. */
const docketText = list =>
  list.map(l => (l.done ? '- [x] ' : '- [ ] ') + l.text).join('\n');

/* Kept in step on the phone first, then sent. A tick that waits for a round trip before moving is
   a tick that feels broken on a train — and this is a scrap of paper, not a payment. */
let dockTimer = null;
function docketSave(list) {
  if (!USER) return;
  USER.todo = docketText(list);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  paintDocket();

  /* Debounced, because ticking four things off in four seconds is one intention and four writes
     to a spreadsheet cell. The last one wins and the three before it were never worth sending. */
  clearTimeout(dockTimer);
  const said = $('dock-said');
  if (said) said.textContent = 'Saving…';
  dockTimer = setTimeout(() => {
    api({ action: 'saveTodo',
      name: USER.name, personId: USER.personId, todo: USER.todo })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('dock-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        /* SAID, not swallowed. A list that looks saved and is not is worse than one that never
           pretended — you find out by opening it tomorrow to nothing. */
        const el = $('dock-said');
        if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      });
  }, 900);
}

function paintDocket() {
  const host = $('docket-body');
  if (!host) return;
  if (!USER) { host.innerHTML = '<p class="empty">Sign in to keep a docket.</p>'; return; }

  const list = docketLines();
  if (!list.length) {
    host.innerHTML = '<p class="faint" style="padding:.4rem 0">Nothing on it.</p>';
    return;
  }
  const left = list.filter(l => !l.done).length;

  /* ---------- A ROW IS IDENTIFIED BY ITS TEXT, NOT BY WHERE IT SITS -----------------------------
     `data-i` ALONE WAS THE WHOLE IDENTITY, and the handlers re-read the list from `USER.todo` at
     the moment of the tap. Those are two different snapshots: a save landing, a payload arriving or
     a repaint between the draw and the tap renumbers everything, and index 3 is then somebody
     else's line. The resources schema states the rule this breaks — "reading the wrong one is
     invisible; deleting the wrong one is not."

     SO THE TEXT TRAVELS WITH THE TAP and the index comes along as a hint. If the row at that index
     still has that text, nothing moved. If it does not, the text is looked up instead. Only if both
     fail does the tap do nothing, which is the right answer for a row that is no longer there. */
  host.innerHTML = list.map((l, i) => `
    <label class="dock-row${l.done ? ' done' : ''}">
      <input type="checkbox" data-do="dock-tick" data-i="${i}" data-t="${esc(l.text)}"
             ${l.done ? 'checked' : ''}>
      <span class="box"></span>
      <span class="dock-text">${mark(l.text)}</span>
      ${/* A BUTTON, NOT A SPAN. A span with a `data-do` cannot be reached from a keyboard, has no
            role, and is invisible to the tap-target pass in check/ui.js — so the one control on
            this row that destroys something was the one nothing measured. */''}
      <button type="button" class="text-drop" data-do="dock-drop" data-i="${i}"
              data-t="${esc(l.text)}" aria-label="Remove ${esc(l.text)}">\u2715</button>
    </label>`).join('')
    + `<div class="row" style="border:0;padding:.4rem 0 0">
        <span class="k">${left ? left + ' left' : 'All done'}</span>
        ${list.length > left
          ? '<span class="v"><button class="btn quiet tiny" data-do="dock-clear">Clear done</button></span>'
          : ''}
      </div>`;
}

/* WHICH ROW THE TAP MEANT. See the note in `paintDocket`: the index is a hint, the text is the
   identity, because the list can be renumbered between the draw and the tap. */
function dockRow_(list, el) {
  const i = Number(el.dataset.i);
  const t = el.dataset.t;
  if (t === undefined) return list[i] ? i : -1;        // no text to match on: markup from before
  if (list[i] && list[i].text === t) return i;
  return list.findIndex(l => l.text === t);
}

on('dock-tick', el => {
  const list = docketLines();
  const i = dockRow_(list, el);
  /* REDRAWN IF THE ROW HAS GONE, so the box does not sit checked against a line that is not there
     — the checkbox has already moved itself by the time this runs. */
  if (i < 0) { paintDocket(); return; }
  list[i].done = !!el.checked;
  docketSave(list);
});

/* Dropping one is immediate and has no undo, which is right for a line somebody wrote thirty
   seconds ago — a confirmation on a scrap of paper is a confirmation nobody reads. */
on('dock-drop', (el, e) => {
  /* It sits inside the label, so without this a tap would toggle the tick on its way past.
     Optional, because an action can be called without an event — `dock-add` is, from the Enter
     key — and a handler that assumes one is a handler that throws the first time it is reused. */
  e?.preventDefault?.();
  e?.stopPropagation?.();
  const list = docketLines();
  const i = dockRow_(list, el);
  if (i < 0) { paintDocket(); return; }               // already gone: redraw, delete nothing
  list.splice(i, 1);
  docketSave(list);
});

on('dock-clear', () => docketSave(docketLines().filter(l => !l.done)));

on('dock-add', () => {
  const box = $('dock-add');
  const text = (box && box.value || '').trim();
  if (!text) { box?.focus(); return; }
  const list = docketLines();
  /* NEW LINES GO AT THE BOTTOM. A list that grows from the top moves everything you were reading
     every time you add to it, which on a phone means losing your place to your own typing. */
  list.push({ done: false, text });
  if (box) { box.value = ''; box.focus(); }
  docketSave(list);
});

/* Enter adds it. A phone keyboard shows "return" over that field and pressing it doing nothing is
   the smallest possible way to make a form feel broken. */
document.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'dock-add' && e.key === 'Enter') {
    e.preventDefault();
    ACTIONS['dock-add']?.();
  }
});

/* ---------- THE NOTEPAD -------------------------------------------------------------------------
   It says "Saves as you type" under it and never has. `saveNotepad` has been live on the backend
   the whole time and nothing on this side has ever called it — so the caption was a promise the
   app could not keep, which is worse than no caption.
--------------------------------------------------------------------------------------------- */
function initPad() {
  const pad = $('notepad');
  if (!pad) return;
  pad.value = (USER && USER.notepad) || '';
  pad.disabled = !USER;
  const said = $('pad-said');
  if (said) said.textContent = USER ? 'Saves as you type.' : 'Sign in to keep notes.';
}

let padTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'notepad' || !USER) return;
  USER.notepad = e.target.value;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  clearTimeout(padTimer);
  const said = $('pad-said');
  if (said) said.textContent = 'Saving…';
  /* Longer than the docket's, because this is typed continuously rather than tapped. Nine hundred
     milliseconds into a sentence is a write per word. */
  padTimer = setTimeout(() => {
    api({ action: 'saveNotepad',
      name: USER.name, personId: USER.personId, notepad: USER.notepad })
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('pad-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        const el = $('pad-said');
        if (el) el.textContent = String(err.message || 'Not saved — no connection.');
      });
  }, 1400);
});