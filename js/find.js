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
    const price = x.kind !== 'shop' ? ''
      : x.level > 0
        ? `<span class="price ${myLevel >= x.level ? 'can' : ''}">${
            myLevel >= x.level ? 'Level ' + x.level + ' — yours' : 'Level ' + x.level}</span>`
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

  const out = {};
  Object.keys(KINDS).forEach((k, i) => {
    const base = KINDS[k], s = said[k];
    if (s && s.active === false) return;
    out[k] = Object.assign({}, base, {
      /* THE SHEET WINS WHEN IT HAS SAID ANYTHING. `asList_` is what decides whether it has — an
         empty cell arrives as an empty array, which is falsy nowhere useful, so testing the length
         is the only test that means "the cell was blank". */
      group: asList_(s && s.group).length ? s.group : base.group,
      label: (s && s.label) || base.label,
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
  { field: 'forLabel',  label: 'What for',    of: x => x.groups || kindOf_(x).group },
  /* `kindLabel` ON THE ITEM WINS, the same way `groups` does on the line above — so a thing placed
     under a group its kind does not belong to can also say what it is called there. */
  { field: 'kindLabel', label: 'What kind',   of: x => x.kindLabel || kindOf_(x).label },
  /* Only venues have one, so it is only ever asked once you are looking at venues — which is the
     coverage rule doing the work that a per-kind filter list would otherwise have to. */
  { field: 'borough',   label: 'Where',       of: x => x.borough || '' },
  /* Only links have one, so it is only ever asked once you are looking at links — the coverage
     rule again, doing what a per-kind filter list would otherwise need code for. */
  { field: 'category',  label: 'Category',    of: x => x.category || '' },
  { field: 'subject',   label: 'Subject',     of: x => x.subject },
  /* Only boxers and bouts carry one, so the coverage rule keeps it out of the way of everything
     else — the same rule that hides `borough` unless you are looking at venues. */
  /* BEFORE THE WEIGHT, because "a boxer or a bout" is the question somebody has first and there
     are two answers to it, not twenty. */
  { field: 'boxKind',   label: 'Boxers or fights', of: x => x.boxKind || '' },
  { field: 'division',  label: 'Division',    of: x => x.division || '' },
  /* THIRD, and it was seventh. An exercise and a past paper are different ERRANDS — somebody
     revising and somebody sitting a mock are not looking for the same thing — so it is the
     question that most changes what should come next. 412 of 417 rows can answer it, which is
     the other half of what makes a good early question. */
  { field: 'resourceType', label: 'Type',     of: x => x.resourceType },
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
  { field: 'stage',     label: 'Stage',       of: x => x.bandValue && x.bandType === 'stage'
                                                    ? x.bandValue : '' },
  { field: 'examBoard', label: 'Exam board',  of: x => x.examBoard },
  { field: 'tier',      label: 'Tier',        of: x => x.tier },
  /* Through `waveOf`, for the same reason `year` goes through `yearOf` one line below: the cell
     may hold a DATE rather than a wave, and a filter button sixty characters wide reading
     "Fri Jun 01 2024 08:00:00 GMT+0100 (British Summer Time)" is what that looks like untouched. */
  { field: 'examWave',  label: 'Exam wave',   of: x => waveOf(x) },
  /* Through `yearOf`, so a paper whose year lives only inside "June 2024" is filterable by year
     without anybody having to type it into a second column to make the filter work. */
  { field: 'year',      label: 'Year',        of: x => yearOf(x) },
  { field: 'company',   label: 'Company',     of: x => x.company },
  /* A yes-or-no, phrased as the two answers rather than as the question. "Printed / Digital" is a
     choice; "Print required: true" is a database column somebody left showing. */
  { field: 'paper',     label: 'Printed?',    of: x => x.paper ? 'Printed' : 'Digital' },
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
  { field: 'slot',      label: 'Goes on',     of: x => x.slot },
  /* Last, because it is the one somebody asks when they already know what they want. */
  { field: 'afford',    label: 'Price',       of: x => x.cost === 0 ? 'Free'
                                                    : x.cost <= (USER ? USER.credits || 0 : 0)
                                                      ? 'Can afford' : '' },
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

function facetList() {
  const src = DATA.facets || null;
  if (FACET_LIVE && FACET_FROM === src) return FACET_LIVE;
  FACET_FROM = src;
  const said = {};
  (src || []).forEach(f => { if (f && f.field) said[f.field] = f; });

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
    .filter(Boolean)
    /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a
       column of blank cells leaves the funnel exactly as it asks today. */
    .sort((a, b) => a.at - b.at);
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
     an `===` against a joined string would have matched neither. */
  return asList_(facet.of(x)).some(v => norm(v) === norm(f.value));
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

function facetValues(items, facet) {
  const by = {};
  items.forEach(x => {
    /* COUNTED ONCE PER VALUE, NOT ONCE PER ITEM. A tutor answers `What for` with both Booking and
       People, so it is a tally mark against each — which is what makes the count beside an answer
       true: choosing People really would leave that tutor in it. `Set` because a row that somehow
       lists the same group twice must not count twice. */
    new Set(asList_(facet.of(x))).forEach(v => { by[v] = (by[v] || 0) + 1; });
  });
  const rank = v => {
    const ord = groupOrder_();
    const i = ord.indexOf(v);
    return i === -1 ? ord.length : i;
  };
  const order = facet.field === 'forLabel'
    ? (a, b) => (rank(a) - rank(b)) || cmpText(a, b)
    : cmpText;
  return Object.keys(by).sort(order).map(v => ({ value: v, n: by[v] }));
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
function facetCoverage(items, facet) {
  if (!items.length) return 0;
  let n = 0;
  items.forEach(x => { if (asList_(facet.of(x)).length) n++; });
  return n / items.length;
}

/* HOW MUCH OF THE SET A QUESTION HAS TO COVER BEFORE IT IS WORTH ASKING. */
const FACET_COVERAGE = 0.5;

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
function nextFacet(items) {
  const asked = STUFF.filters.map(f => f.field);
  for (const facet of facetList()) {
    if (asked.indexOf(facet.field) !== -1) continue;
    if (facetValues(items, facet).length < 2) continue;
    /* THE THRESHOLD IS THE FACET'S OWN, falling back to the one below. A question the sheet has
       given a lower bar to is one somebody decided is worth asking early even though it is thin. */
    const min = isFinite(facet.min) ? facet.min : FACET_COVERAGE;
    if (facetCoverage(items, facet) < min) continue;
    return facet;
  }
  return null;
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
  const wonA = f.winner && norm(f.winner) === norm(f.a);
  const wonB = f.winner && norm(f.winner) === norm(f.b);
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
function answerBlock_(x) {
  if (!x || !String(x.answer || '').trim()) return '';
  /* WHAT KIND OF ANSWER IT IS, beside the word, when the sheet says. A one-mark recall and a
     25-mark essay want different things of you before you open it. */
  const kind = String(x.answerType || '').trim();
  return `<div class="qans">
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

/* The marker down the left of an open question, where the paper's own bracket belongs:
   1) · b) · a(i) */
function qPartShow_(part) {
  const s = String(part == null ? '' : part).trim();
  if (!s) return '';
  const b = qPartBits_(s);
  return b ? b.letter + '(' + b.roman + ')' : s + ')';
}

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
function questionItems() {
  const all = DATA.questions || [];
  if (!all.length) return [];

  const stems = {};
  all.forEach(r => {
    if (r.kind === 'stem') stems[paperIdOf_(r) + '|' + r.q] = r;
  });

  return all.filter(r => r.kind !== 'stem' && r.kind !== 'paper').map(r => {
    const stem = stems[paperIdOf_(r) + '|' + r.q] || null;
    return {
      kind: 'question',
      /* "Q5b" IS THE NAME AND THE PAPER IS THE SUBTITLE. A list of parts all called
         "Paper 31: Statistics — June 2022" is a list nobody can read down. */
      name: 'Q' + r.q + qPartName_(r.part),
      key: 'q:' + r.id,
      sub: r.name || '',
      image: '', cost: 0, slot: '', off: false,
      subject: r.subject || '',
      /* THE SAME DERIVATION `allTopics` DID, and the only one it did: a grade is a band value when
         the band is a grade, and blank when it is a stage. Two ladders, one column. */
      grade: r.bandType === 'grade' ? (r.bandValue || '') : '',
      bandType: r.bandType || '', bandValue: r.bandValue || '',
      keystage: r.keystage || '', tier: r.tier || '',
      examBoard: r.examBoard || '', company: r.company || '',
      resourceType: r.resourceType || '', examWave: r.examWave || '',
      year: r.year || '', paper: true,
      marks: r.marks, section: r.section,
      lead: r.lead, html: r.html, diagram: r.diagram || '',
      /* THE MARK SCHEME, WHICH THE BACKEND SENT TO NOBODY FOR MONTHS. `answer`, `answerType` and
         `examinerNote` have been in the payload since the tab was cut, and the first version of
         this function dropped all three — the other direction of the fault `check-payload.js`
         exists for: sent, and never read. Only 91 of 3,271 rows carry one today. */
      answer: r.answer || '', answerType: r.answerType || '',
      examinerNote: r.examinerNote || '',
      stemHtml: stem ? stem.html : '',
      stemDiagram: stem ? (stem.diagram || '') : '',
      /* THE STEM'S WORDS TOO. A part reading "work out the value of x" says nothing on its own and
         everything alongside the paragraph it hangs from — see `searchText_`.

         THE ANSWER IS DELIBERATELY NOT IN HERE. This is what the search box matches, and including
         it means typing a value finds the question it answers, which is the one search a revision
         screen must not do. */
      text: searchText_(r) + (stem ? ' ' + searchText_(stem) : ''),
      row: r,
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
function questionCard_(x) {
  const fig = d => (d ? `<figure>${d}</figure>` : '');
  return `<div class="qcard">
    <div class="qcard-top">
      <b>${esc(x.name)}</b>
      <span>${esc(x.marks)} mark${Number(x.marks) === 1 ? '' : 's'}</span>
    </div>
    <p class="qcard-sub">${esc(x.sub)}</p>
    <div class="qsheet">
      ${x.stemHtml ? `<div class="qsheet-stem">${x.stemHtml}${fig(x.stemDiagram)}</div>` : ''}
      ${x.lead ? `<div class="qsheet-lead">${x.lead}</div>` : ''}
      <div class="qsheet-part">
        <div class="qsheet-pb">${x.html || ''}${
          /* THE DIAGRAM, AFTER THE PROSE, where a printed paper puts it. Empty on all but two rows
             so far — see the `diagram` column in js/library.js. */''}${fig(x.diagram)}</div>
      </div>
    </div>
    ${answerBlock_(x)}
  </div>`;
}


/* `topicBy` WAS HERE — a document by id, falling back to its name. Nothing has a document to look
   up any more; see the note above `questionItems`. */

/* WHAT A PRINTED COPY COSTS. Paper and toner, at the rate in the sheet — no multipliers, no
   discounts. This is the one price in the app that is not tuition and does not behave like it.

   NO PAGE COUNT, NO PRICE. Zero pages means nobody has counted this one yet, and pricing it at
   £0.00 would be the site answering a question it has not asked anybody. It returns null, and null
   is rendered as a sentence rather than as a number. */
function printPrice(pages) {
  const n = Number(pages) || 0;
  if (n <= 0) return null;
  const v = (DATA.constants || {}).vars || {};
  const rate = num(v.print_rate_per_page);
  if (isNaN(rate) || rate <= 0) return null;      // rate not set: printing is off, not free
  const min = num(v.print_minimum) || 0;
  return Math.max(min, Math.round(n * rate * 100) / 100);
}

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
function stuffItems() {
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
      cost: Number(t.rate) || 0, slot: '', subject: '', grade: '', off: t.listed === false,
      row: t,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    ...(DATA.venues || []).filter(v => v.title).map(v => ({
      kind: 'venue', name: v.title, key: v.title, sub: v.subtitle || '', image: v.image,
      cost: Number(v.bestRate) || 0, slot: '', subject: '', grade: '', off: false,
      row: v, borough: v.borough || v.city || '',
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
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
    /* ---------- ONLY THE WIDGETS THAT SAY WHERE THEY BELONG ------------------------------------
       TOOLS AND GAMES HAVE COLUMNS, so the funnel stops carrying the plain ones — `Tools` and
       `Games` disappear as answers because nothing answers them, which is how `facetValues` builds
       the list: from the items that exist, not from the kinds table.

       `wgt.groups` IS THE TEST AND IT IS NOT A PROXY FOR ONE. A widget that names a group has been
       deliberately filed somewhere else — `book.js` gives every live session `groups: 'Booking'` so
       it answers beside the receipts — and those are exactly the ones that have nowhere else to be
       reached from. Filtering on `kind` instead would have taken them with it, because a session
       widget's kind is `tool` too. */
    ...allWidgets().filter(wgt => (!wgt.admin || isAdmin()) && wgt.groups).map(wgt => ({
      kind: wgt.kind, name: wgt.name, key: 'w:' + wgt.id, sub: '', image: '',
      /* WHERE THIS ONE ANSWERS FROM, if it says. See the note on `forLabel`. */
      groups: wgt.groups || null,
      /* AND WHAT THE SECOND QUESTION CALLS IT. A widget filed under Booking would otherwise offer
         `Tools` as its kind — the word it was moved away from. Blank for the ordinary tools. */
      kindLabel: wgt.label || '',
      cost: 0, slot: '', subject: '', grade: '', off: false, row: wgt,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* FRIENDS. People are found on the Find tab like everything else — they were a card on You,
       which made them a setting about yourself rather than a set of people you can look through.
       Only somebody who has a checklist and a score has any: a parent has no scoreboard to compare
       and no reason to collect handles. */
    ...(canTrack() ? friendHandles().map(h => {
      const s2 = (DATA.students || []).find(x => norm(x.handle) === norm(h)) || {};
      return {
        kind: 'friend', name: s2.name || h, key: 'friend:' + h, sub: h, image: '',
        cost: 0, slot: '', subject: '', grade: '', off: false, row: Object.assign({ handle: h }, s2),
        bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
        resourceType: '', examWave: '', year: '', paper: false,
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
      cost: 0, slot: '', subject: '', grade: '', off: false, row: l,
      category: l.category || '',
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    ...(typeof subjectRows === 'function' ? subjectRows() : []).map(x => ({
      kind: 'subject', name: x.name, key: x.name, sub: '', image: '',
      cost: 0, slot: '', subject: x.name, grade: '', off: false, row: x,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
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
      image: '', cost: Number(j.price) || 0, slot: '',
      subject: j.subject || '', grade: '', off: false, row: j,
      bandType: '', bandValue: j.level || '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* YOU WERE AN ITEM HERE, under `People`, when you had no tutor row of your own. Removed with
       that group — the account column is your card, in full, one swipe right. The merge it guarded
       against is still guarded: a tutor row that is you draws `meCard`, which is where that note
       now lives, on the `tutor` entry in KINDS. */
    ...(typeof levelRows === 'function' ? levelRows() : []).map(x => ({
      kind: 'level', name: x.name, key: 'lvl:' + x.name,
      /* The subjects, under the name, so the list is readable before anything is opened. */
      sub: (x.subjects || []).join(' · '), image: '',
      cost: 0, slot: '', subject: '', grade: '', off: false, row: x,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
    })),
    /* `name` and `price`, which is what the payload actually calls them. I had written `title`
       and `cost` — so every shop item drew with no name and a price of zero. */
    ...(DATA.shop || []).map(x => ({
      kind: 'shop', name: x.name, key: x.name, sub: x.description || '', image: x.image,
      cost: Number(x.price) || 0, slot: x.slot || '', subject: '', grade: '', off: false,
      /* Blank on a shop row, and blank is what makes the funnel skip them: a facet whose values
         are all empty is never offered, so choosing Wearables never shows an exam board. */
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: '', paper: false,
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
      cost: 0, slot: '', subject: 'Boxing', division: divisionOf_(b.bestDivision), grade: '',
      off: false, row: b,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: b.activeTo || '', paper: false,
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
      cost: 0, slot: '', subject: 'Boxing', division: divisionOf_(f.division), grade: '',
      off: false, row: f,
      bandType: '', bandValue: '', keystage: '', tier: '', examBoard: '', company: '',
      resourceType: '', examWave: '', year: (f.date || '').slice(0, 4), paper: false,
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

  const MONTH = ['January', 'February', 'March', 'April', 'May', 'June',
                 'July', 'August', 'September', 'October', 'November', 'December'];

  /* ALREADY A SITTING. "June 2024", "Nov 2023" — somebody typed what they meant. */
  const said = raw.match(/^([A-Za-z]{3,9})\s+((?:19|20)\d{2})$/);
  if (said) {
    const i = MONTH.findIndex(m => m.toLowerCase().startsWith(said[1].toLowerCase().slice(0, 3)));
    return i < 0 ? raw : MONTH[i] + ' ' + said[2];
  }

  /* A DATE THAT CAME THROUGH AS TEXT. Read by pattern rather than by `new Date`, which reads the
     same characters differently depending on the machine's timezone — and a wave that is June on
     one phone and May on another is a filter that splits in half for no reason anybody can see. */
  const long = raw.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\b[^]*?\b((?:19|20)\d{2})\b/);
  if (long) {
    const i = MONTH.findIndex(m => m.slice(0, 3) === long[1]);
    return i < 0 ? long[2] : MONTH[i] + ' ' + long[2];
  }

  const iso = raw.match(/\b((?:19|20)\d{2})-(\d{2})-\d{2}\b/);
  if (iso) {
    const i = parseInt(iso[2], 10) - 1;
    return (MONTH[i] ? MONTH[i] + ' ' : '') + iso[1];
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
  STUFF.filters.forEach(f => { (byField[f.field] = byField[f.field] || []).push(f); });
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
  return out.sort((a, b) =>
    cmpText(a.sub || a.name, b.sub || b.name)
    || (Number(a.qNumber) || 0) - (Number(b.qNumber) || 0)
    || cmpText(a.qPart || '', b.qPart || '')
    || cmpText(a.name, b.name));
}

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
/* THE PAPER, AND NOTHING ELSE. Paying and withdrawing are marks in the tile row under the card —
   `jobTiles_` in tiles.js — which is where every other kind keeps its actions. `joinBlock` stays
   because it is not an action on your own session: it is the offer made to somebody who is not in
   it yet, and it carries the seats left and the price, which are facts rather than buttons. */
const jobPage_ = j => (typeof jobReceipt === 'function' ? jobReceipt(j) : '')
  + (typeof moneyBlock === 'function' ? moneyBlock(j) : '')
  + (typeof joinBlock === 'function' ? joinBlock(j) : '');

const forIs_ = want => (STUFF.filters || [])
  .some(f => f.field === 'forLabel' && norm(f.value) === want);

/* ---------- THE WAY BACK TO WHAT USED TO BE A TAB -------------------------------------------------
   `go('me')` AND `go('posts')` WERE SCATTERED AROUND — "sign in first", then jump to the You column.
   With the columns gone those calls do not fail: `go` falls back to `TABS[0]`, which is Find, so a
   person told to sign in was silently dropped on the search box with no sign-in card in sight. A
   fallback that lands somewhere plausible is worse than one that lands nowhere, because nobody
   reports it.

   ANSWERING THE QUESTION IS THE NAVIGATION NOW. This clears whatever was filtered and sets the one
   answer, which is exactly what tapping it would have done — so `goFor_('People')` puts somebody on
   the account pages, the same place `go('me')` used to. */
function goFor_(label) {
  STUFF.filters = [{ field: 'forLabel', value: label }];
  STUFF.q = '';
  if (typeof paintStuff === 'function') paintStuff();
}

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
  const me = `<div class="card">
    <h3>${esc(USER.name || 'Signed in')}</h3>
    <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
    <button class="btn quiet" data-do="signout" style="margin-top:.6rem">Sign out</button>
  </div>`;

  const others = (DATA.tutors || [])
    .filter(t => t && t.title && t.listed !== false)
    /* NOT YOU, TWICE. With a tutor row of your own you would otherwise appear at the top as your
       account and again below as a tutor — the same duplication the `me` kind was merged away to
       avoid. Matched on the normalised name, which is what every other lookup here uses. */
    .filter(t => !(USER.name && norm(t.title) === norm(USER.name)))
    .map(t => (typeof findCard === 'function'
      ? findCard({ kind: 'tutor', row: t })
      : `<div class="card"><h3>${esc(t.title)}</h3></div>`));

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
    send('favourite', {
      name: USER.name, personId: (USER && USER.personId) || '',
      kind: kind || 'item', itemId: key,
      on: FAVS.has(key) ? 'TRUE' : '',
    }).catch(() => {});
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
        ${esc(f.value)}<span class="chip-x">✕</span>
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

on('facet-pick', el => {
  STUFF.filters.push({ field: el.dataset.field, value: el.dataset.value });
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
  if (!items.length) return '';

  const facet = nextFacet(items);
  const adding = STUFF.filters.some(f => f.value === 'Friends')
    ? `<p style="margin:.6rem 0 0"><span class="text-action" data-do="friend-add-open"
        >Add someone by their handle</span></p>` : '';
  if (!facet) {
    return `<p class="faint" style="margin:.6rem 0 0">Nothing left to narrow.
      Swipe up for the ${items.length === 1 ? 'one' : items.length}.</p>` + adding;
  }

  /* THE FRONT DOOR TO THE BOOKING FORM WAS HERE — a line above the funnel's answers, on the first
     question only, that filtered to Booking and turned to the form. It was clutter above the one
     question this screen exists to ask, and the form is not hard to reach: "What for · Booking" is
     the first answer in the list, and the Book buttons on tutor and venue cards go straight to it. */

  const values = facetValues(items, facet);
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
  return values.map(v => `<div class="row tap counted" data-do="facet-pick"
        data-field="${esc(facet.field)}" data-value="${esc(v.value)}">
        <span class="k">${mark(v.value)}</span>
        <span class="v mono">${v.n}</span>
      </div>`).join('');
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
  const controls = `<div id="stuff-controls">`
    + (USER ? `<div class="card"><div class="row" style="border:0;padding:0">
        <span class="k">Your credits</span><span class="v big gold mono">${credits}</span>
      </div></div>` : '')
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