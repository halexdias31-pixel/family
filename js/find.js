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
  tutor:   { group: 'Booking', label: 'Tutors',   card: x => findCard({ kind: x.kind, row: x.row }) },
  venue:   { group: 'Booking', label: 'Venues',   card: x => findCard({ kind: x.kind, row: x.row }) },
  subject: { group: 'Booking', label: 'Subjects', card: x => findCard({ kind: x.kind, row: x.row }) },
  /* A LEVEL IS THE FOURTH THING A BOOKING IS ASSEMBLED FROM — who, where, what, and how far on —
     and it was the one you could not look at. Same group as the other three because it is the same
     errand: this is a thing you book with, not a thing you learn from. */
  level:   { group: 'Booking', label: 'Levels',   card: x => findCard({ kind: x.kind, row: x.row }) },

  /* A FRIEND. Their figure, their level, and a way to stop being one. */
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
        <span class="text-drop" data-do="friend-drop" data-handle="${esc(f.handle)}">✕</span>
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
  tool: { group: 'Tools', label: 'Tools', card: x => widgetCard_(x) },
  game: { group: 'Games', label: 'Games', card: x => widgetCard_(x) },

  link: { group: 'Learning', label: 'Links', card: x => {
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
    const goes = !!hostOf_(l.url);
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
  topic: { group: 'Learning', label: 'Resources', card: (x, c) => thingCard_(x, c) },
  /* ---------- A QUESTION IS NOT A DIFFERENT KIND OF THING FROM ITS PAPER ------------------------
     I GAVE IT ITS OWN LABEL — "Questions" beside "Resources" — and that is two cupboards where
     there is one thing. Somebody after question 5b would have had to know which to open, and
     narrowing to Past paper would have hidden every question in it.

     SAME GROUP AND SAME LABEL AS A RESOURCE, so "Learning → Resources → Past paper" holds the
     paper AND its parts, and the Question and Part facets narrow from there. One funnel, which is
     the argument I made for the two extra rungs and then failed to build. Only the CARD differs,
     because a part is drawn differently from a paper. */
  question: { group: 'Learning', label: 'Resources', card: x => questionCard_(x) },
  shop:  { group: 'Shop',     label: 'Things',    card: (x, c) => thingCard_(x, c) },
};

function widgetCard_(x) {
  /* NO LONGER A TAP TARGET. The sheet it opened was not a description of the tool, it WAS the tool —
     so there is nothing to summarise here and nothing a panel added except a lid. `widgetTiles_`
     opens it inside this card instead, and closes it with the same row. */
  return `<div class="card">
    <h3>${esc(x.name)}</h3>
    ${cardTiles_(x)}
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
    /* ---------- A PAST PAPER IS THE COVER OF A PAST PAPER ---------------------------------------
       Not a card describing one. The board, the tier, the paper, the year and the wave are all on
       the row already, and arranged the way an exam paper arranges them they stop being fields and
       become the thing itself — which every student in the country reads in a quarter of a second
       without being told what it is.

       ONLY WHEN IT ACTUALLY IS ONE. A worksheet with no board and no tier drawn as an exam cover is
       a card wearing a costume, and the costume would then mean nothing on the ones that earn it.
       So: it needs a board or a tier or a paper number. Everything else stays an ordinary card. */
    if (x.kind === 'topic' && !x.wearable && paperish_(x)) return paperCard(x);

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
          <p class="sub">${mark(x.sub || x.subject || '')}${yearOf(x)
            ? ` <span class="mono faint">· ${esc(yearOf(x))}</span>` : ''}${x.wearable && x.slot
            /* WHERE IT GOES. Until there are drawings, the slot is the only thing on the card that
               says what the object actually is — "Cape · shoulders" is a garment and "Cape" on its
               own is a word. */
            ? ` <span class="faint">· ${esc(x.slot)}</span>` : ''}</p>
          ${price}
        </div>
      </div>
      ${cardTiles_(x)}
    </div>`;
  }
}


/* A THING'S ENTRY. Wearables are the one kind decided by a FIELD rather than by `kind` — the shop
   holds both, and which it is depends on whether the row names a slot to wear it in. That is a
   genuine exception and is written out here rather than being a tenth entry that `kind` can never
   select. */
function kindOf_(x) {
  if (x && x.wearable) return { group: 'Shop', label: 'Wearables' };
  return (x && KINDS[x.kind]) || { group: 'Shop', label: 'Things' };
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
  { field: 'forLabel',  label: 'What for',    of: x => kindOf_(x).group },
  { field: 'kindLabel', label: 'What kind',   of: x => kindOf_(x).label },
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
  { field: 'keystage',  label: 'Key stage',   of: x => x.keystage },
  { field: 'bandValue', label: 'Grade',       of: x => x.bandValue && x.bandType === 'grade'
                                                    ? 'Grade ' + x.bandValue : '' },
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
  /* ---------- TWO MORE RUNGS ON THE SAME LADDER ------------------------------------------------
     A QUESTION IS NOT A NEW KIND OF SEARCH, it is level → year → paper carried two steps further.
     These sit after the paper facets so the funnel narrows in the order somebody thinks in: which
     paper, then which question, then which part.
     Blank on everything that is not a question, so they only appear once the list is questions —
     which is what every other facet here already does. */
  { field: 'qNumber',   label: 'Question',    of: x => x.qNumber || '' },
  { field: 'qPart',     label: 'Part',        of: x => x.qPart || '' },
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
let FACET_LIVE = null;

function facetList() {
  if (FACET_LIVE) return FACET_LIVE;
  const said = {};
  (DATA.facets || []).forEach(f => { if (f && f.field) said[f.field] = f; });

  FACET_LIVE = FACETS
    .map((f, i) => {
      const s = said[f.field];
      if (!s) return Object.assign({}, f, { at: (i + 1) * 10, min: FACET_COVERAGE });
      if (s.active === false) return null;
      return Object.assign({}, f, {
        label: s.label || f.label,
        at:    s.order === null || s.order === undefined ? (i + 1) * 10 : s.order,
        /* A THRESHOLD OF ZERO IS A REAL ANSWER — "ask this however few can answer it" — so it
           cannot be treated as absent the way an empty cell is. `null` means the cell was blank;
           0 means somebody typed it. */
        min:   s.minCoverage === null || s.minCoverage === undefined
                 ? FACET_COVERAGE : s.minCoverage,
      });
    })
    .filter(Boolean)
    /* SORTED BY THE SHEET'S NUMBER, ties broken by the order they are written in code — so a
       column of blank cells leaves the funnel exactly as it asks today. */
    .sort((a, b) => a.at - b.at);
  return FACET_LIVE;
}

const facetBy = f => facetList().find(x => x.field === f) || FACETS.find(x => x.field === f);

/** Does one item satisfy one chosen filter? One comparison, because a facet says how to read
    itself — the old version had a switch with a case per field, which is a place to forget one. */
function filterHit(x, f) {
  const facet = facetBy(f.field);
  if (!facet) return true;
  return norm(facet.of(x)) === norm(f.value);
}

/** The distinct values of one facet across a set, with how many each would leave. */
function facetValues(items, facet) {
  const by = {};
  items.forEach(x => {
    const v = String(facet.of(x) ?? '').trim();
    if (!v) return;                       // blank is not an answer, so it is never offered
    by[v] = (by[v] || 0) + 1;
  });
  return Object.keys(by).sort(cmpText).map(v => ({ value: v, n: by[v] }));
}

/* HOW MANY OF THESE COULD EVEN ANSWER IT. Not how many distinct answers there are — how many
   items have one at all. */
function facetCoverage(items, facet) {
  if (!items.length) return 0;
  let n = 0;
  items.forEach(x => { if (String(facet.of(x) ?? '').trim()) n++; });
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
    const min = typeof facet.min === 'number' ? facet.min : FACET_COVERAGE;
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
    ${f.video ? `<p><a class="btn quiet" href="${esc(f.video)}" target="_blank"
       rel="noopener">Watch it</a></p>` : ''}
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

function questionCard_(x) {
  /* ---------- THE WHOLE QUESTION, NOT A PEEK ------------------------------------------------------
     THE CARD SHOWED 96 CHARACTERS and a panel showed the rest. That split only made sense while the
     rest lived somewhere else — and it never did: the stem, the lead and the part are three fields
     on the row this card is already drawn from.

     A QUESTION IS SHORT. That is what a question IS; if it were a page it would be a paper. So the
     truncation was buying nothing and costing a tap on every single one.

     THE STEM AND THE LEAD COME FIRST, in printed order, because a part without them cannot be
     answered — which is the whole reason the stem is a row of its own rather than a copy on each
     part. */
  return `<div class="qcard">
    <div class="qcard-top">
      <b>${esc(x.name)}</b>
      <span>${esc(x.marks)} mark${Number(x.marks) === 1 ? '' : 's'}</span>
    </div>
    <p class="qcard-sub">${esc(x.sub)}</p>
    <div class="qsheet">
      ${x.stemHtml ? `<div class="qsheet-stem">${x.stemHtml}</div>` : ''}
      ${x.lead ? `<div class="qsheet-lead">${x.lead}</div>` : ''}
      <div class="qsheet-part">
        <div class="qsheet-pb">${x.html || ''}</div>
      </div>
    </div>
    ${cardTiles_(x)}
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

function questionItems() {
  const all = DATA.questions || [];
  if (!all.length) return [];

  /* THE PAPER EACH QUESTION BELONGS TO, indexed once rather than searched per part. */
  const papers = {};
  (allTopics() || []).forEach(t => { if (t.id) papers[t.id] = t; });

  const pid = paperIdOf_;

  const stems = {};
  all.forEach(r => { if (r.kind === 'stem') stems[pid(r) + '|' + r.q] = r; });

  /* NO `kind: paper` ROWS LEFT TO EXCLUDE. A paper is a group of these now, not a row beside them. */
  return all.filter(r => r.kind !== 'stem').map(r => {
    const p = papers[pid(r)] || {};
    const stem = stems[pid(r) + '|' + r.q] || null;
    return {
      kind: 'question',
      /* "Q5b" IS THE NAME, and the paper is the subtitle. A list of parts all called
         "Paper 31: Statistics" would be a list nobody can read down. */
      name: 'Q' + r.q + qPartName_(r.part),
      key: 'q:' + r.id,
      sub: p.name || '',
      image: '', cost: 0, slot: '', off: false,
      subject: p.subject || '', grade: p.grade || '',
      /* the paper's own facets, so a question filters like its paper */
      bandType: p.bandType || '', bandValue: p.bandValue || '',
      keystage: p.keystage || '', tier: p.tier || '',
      examBoard: p.examBoard || '', company: p.company || '',
      /* THE PAPER'S OWN TYPE, so filtering to "Past paper" keeps its questions rather than
         dropping them — a part of a past paper IS a past paper. */
      resourceType: p.resourceType || '', examWave: p.examWave || '',
      /* `paper: p.paper` WAS THE RESOURCE ROW'S BOOLEAN and there are no resource rows.
         Every question here is part of a paper by definition, so it is simply true. */
      year: p.year || '', paper: true,
      /* and its own two */
      qNumber: r.q, qPart: r.part || '',
      marks: r.marks, section: r.section,
      lead: r.lead, html: r.html,
      stemHtml: stem ? stem.html : '',
      row: r,
    };
  });
}

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
function allTopics() {
  const qs = DATA.questions || [];
  /* Keyed on the object IDENTITY of the payload's own branch, so a new payload is a new list and
     this cannot go stale — one comparison rather than hashing two hundred rows. */
  if (TOPICS_MEMO.fromQ === qs) return TOPICS_MEMO.list;

  const seen = {};
  const out = [];
  qs.forEach(r => {
    const id = paperIdOf_(r);
    if (!id || seen[id]) return;
    seen[id] = true;
    out.push({
      id,
      name: r.name || id,
      subject: r.subject || '',
      grade: r.bandType === 'grade' ? r.bandValue : '',
      /* NO LINK AND NO PAGES. There is no PDF behind any of these — which is the whole point — so
         the print price never offers itself and the funnel files them as digital. If printing from
         HTML ever happens, `pages` is what it has to start producing. */
      link: '', image: '', company: '',
      type: r.resourceType || '', board: r.examBoard || '',
      bandType: r.bandType || '', bandValue: r.bandValue || '',
      keystage: r.keyStage || r.keystage || '', tier: r.tier || '',
      examBoard: r.examBoard || '', resourceType: r.resourceType || '',
      examWave: r.examWave || '', year: r.year || '',
      paper: false, pages: 0, printable: false,
      active: r.active !== false,
      /* ---------- THE PASSES HAVE NOWHERE TO LIVE ---------------------------------------------
         `ticks` WERE THREE COLUMNS ON THE `resources` TAB and that tab is gone, so there is nothing
         to read and nothing to write to. Every card therefore draws none, and `tickRow` returns
         empty for an untrackable topic — which is the honest state rather than three boxes that
         accept a tap and lose it.
         518 of them exist in the other spreadsheet. Until passes have a home of their own — a
         `ticks` tab of person, paper and which pass — this stays false. */
      trackable: false,
      rowIndex: 0,
      ticks: ['', '', ''],
    });
  });

  TOPICS_MEMO = { from: null, fromQ: qs, list: out };
  return out;
}

/* WHERE THE PARTS OF ONE PAPER DISAGREE about a fact that belongs to the paper. Nothing calls this;
   it is for typing into the console after a batch of questions has been written, which is exactly
   when a repeated field gets one row wrong. */
function paperMismatches() {
  /* `keystage`, NOT `keyStage`. The backend sends the lower-case spelling, so the capital one
     compared undefined against undefined on every paper and could never report a mismatch in the
     one field most likely to have one. */
  const F = ['name', 'subject', 'resourceType', 'keystage', 'bandType', 'bandValue',
             'tier', 'examBoard', 'examWave', 'year'];
  const by = {};
  (DATA.questions || []).forEach(r => {
    const id = paperIdOf_(r);
    if (!id) return;
    (by[id] = by[id] || []).push(r);
  });
  const bad = [];
  Object.keys(by).forEach(id => {
    F.forEach(f => {
      const vals = [...new Set(by[id].map(r => String(r[f] == null ? '' : r[f])))];
      if (vals.length > 1) bad.push({ paper: id, field: f, values: vals.join(' | ') });
    });
  });
  if (!bad.length) { console.log('every paper agrees with itself'); return bad; }
  console.table(bad);
  return bad;
}

/* By id, always. The name lookup is what remains for a row written before ids existed, and it is
   the one that picks the wrong "Quadratics" — so it is the fallback and not the rule. */
const topicBy = key => {
  const list = allTopics();
  return list.find(x => x.id && x.id === key)
      || list.find(x => norm(x.name) === norm(key)) || null;
};

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

/* Whether a printed copy is offered at all. An explicit FALSE in the sheet wins over any page
   count — countable and worth printing are different questions, and a 400-page textbook answers
   the first one yes. */
function canPrint(t) {
  const flag = String(t.printable ?? '').trim().toLowerCase();
  if (flag === 'false' || flag === 'no') return false;
  return printPrice(t.pages) !== null;
}

/* ---------- THREE PASSES ------------------------------------------------------------------------
   A tick is stored as a NAME in a list rather than as a number, which is what makes it possible to
   ask "who has done this" as well as "have I" — and what stops one person counting twice.

   Three of them, because doing something once and doing it three times spaced out are different
   facts and a single checkbox can only record the first. They are INDEPENDENT: ticking the third
   does not fill the first two, which would be the app deciding you had done two passes you never
   told it about, and would send three writes for one tap.
--------------------------------------------------------------------------------------------- */
function myTicks(t) {
  const me = norm(USER && (USER.handle || USER.name));
  if (!me) return [false, false, false];
  return (t.ticks || ['', '', '']).map(list =>
    String(list).split(',').map(x => norm(x)).some(h => h && h === me));
}

/* Nothing is drawn for a resource marked untrackable, or for somebody signed out. A row of dead
   boxes on four hundred cards is four hundred things to read past, and a control that cannot be
   pressed teaches nobody that signing in would make it work. */
function tickRow(t) {
  if (!USER || !t.trackable) return '';
  const mine = myTicks(t);
  const done = mine.filter(Boolean).length;
  return `<div class="ticks" data-do="ticks">
    <span class="faint tick-said">${
      done === 0 ? '' : done === 1 ? 'once' : done === 2 ? 'twice' : 'all three'}</span>
    ${/* PLAIN BOXES. They were numbered 1, 2, 3 — the pass each one recorded — and a number
          inside a checkbox reads as a quantity or a rank rather than as a thing you tick. The
          count in words at the other end of the row already says how many, which is the only part
          anybody needed the numbers for.
          Still INDEPENDENT underneath: ticking the third does not fill the first two. Three empty
          boxes invite being filled left to right and that is fine — it is what most people will
          do — but the app must not decide it on their behalf. */''}
    ${[0, 1, 2].map(i => `
      <label class="tick${mine[i] ? ' on' : ''}"
             title="pass ${i + 1}" aria-label="pass ${i + 1}">
        <input type="checkbox" data-do="tick"
               data-key="${esc(t.id || t.name)}" data-n="${i + 1}"
               ${mine[i] ? 'checked' : ''}>
        <span class="tick-box"></span>
      </label>`).join('')}
  </div>`;
}

/* A tap on the tick ROW that is not on a box. The row sits inside a card whose whole surface opens
   a sheet, so without this half the taps aimed at a checkbox would walk up to the card and open a
   panel instead. Registered to do nothing, which is exactly right. */
on('ticks', () => {});

on('tick', el => {
  if (!USER) { toast('Sign in to keep a checklist'); go('me'); return; }
  const t = topicBy(el.dataset.key);
  if (!t) return;
  const n = Number(el.dataset.n);
  const checked = !!el.checked;
  const me = USER.handle || USER.name;

  /* Edited in place, so a second tap reads the new state rather than the loaded one — the same
     read-after-write problem the backend's setCell exists to solve, one layer up. */
  const before = (t.ticks || []).slice();
  const list = String(t.ticks[n - 1] || '').split(',').map(x => x.trim()).filter(Boolean);
  const has = list.some(h => norm(h) === norm(me));
  if (checked && !has) list.push(me);
  if (!checked && has) list.splice(list.findIndex(h => norm(h) === norm(me)), 1);
  t.ticks[n - 1] = list.join(', ');
  el.closest('.tick')?.classList.toggle('on', checked);

  api({ action: 'toggleTopicTick',
    name: USER.name, handle: me, id: t.id, rowIndex: t.rowIndex, tick: n, checked })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      /* XP AND CREDITS MOVE WITH IT — a tick is worth one of each, which is what the wardrobe is
         priced against. Taken from the server rather than guessed: two devices ticking at once
         would each add one to their own stale copy and both be wrong. */
      if (typeof d.xp === 'number') USER.xp = d.xp;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      paintStuff();
    })
    .catch(err => {
      t.ticks = before;
      el.checked = !checked;
      el.closest('.tick')?.classList.toggle('on', !checked);
      toast(String(err.message || 'Could not save that tick'));
    });
});

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
    ...WIDGETS.filter(wgt => !wgt.admin || isAdmin()).map(wgt => ({
      kind: wgt.kind, name: wgt.name, key: 'w:' + wgt.id, sub: '', image: '',
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
    ...questionItems(),

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

    ...allTopics()
      /* A deleted resource is still on the screen for an admin, greyed. It has to be: something
         invisible cannot be put back, which is the whole reason the tutor switch works this way. */
      .filter(x => x.active || isAdmin())
      .map(x => ({
        kind: 'topic', name: x.name, key: x.id || x.name, sub: x.subject || '', image: x.image,
        cost: 0, slot: '', subject: x.subject || '', grade: x.grade || '', off: !x.active,
        /* Straight through onto the flat item, so one funnel can ask one question of a past paper
           and a beanie without knowing which it has. */
        bandType: x.bandType, bandValue: x.bandValue, keystage: x.keystage, tier: x.tier,
        examBoard: x.examBoard, company: x.company, resourceType: x.resourceType,
        examWave: x.examWave, year: x.year, paper: x.paper,
        /* The topic itself rides along, so the card can draw its ticks without looking it up
           again — a lookup per card is four hundred scans of four hundred rows to draw a list. */
        topic: x,
      })),
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
    const hay = norm([x.name, x.sub, x.subject, x.slot,
                      x.grade && 'grade ' + x.grade].filter(Boolean).join(' '));
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
  return out.sort((a, b) => cmpText(a.name, b.name));
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
  const wrap = el.closest('.favwrap');
  if (wrap) wrap.classList.toggle('is-fav', isFav(el.getAttribute('data-key')));
  el.textContent = isFav(el.getAttribute('data-key')) ? '★' : '☆';

  /* ---------- AND THE ONE LIST THAT IS ABOUT THE STARS THEMSELVES --------------------------------
     `Saved` lives on the controls page, and the controls page is drawn ONCE and deliberately never
     rebuilt — that is what stops the search box losing focus mid-word. Which meant starring a thing
     updated the star, updated the sheet, and left the list of starred things showing what it showed
     when the screen opened. It only caught up if you left Find and came back, which reads exactly
     like favourites being broken.

     SO THE STRIP REPAINTS ITSELF, and nothing else does. Same move as the star above and the tile
     in `on('spot')`: find the one node whose contents are now wrong and refill it, rather than
     redrawing a screen and throwing away the scroll position of somebody working down a list. */
  const strip = document.getElementById('stuff-saved');
  if (strip) strip.innerHTML = savedStrip_();
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
  /* THE STAR SITS ON TOP OF WHATEVER THE CARD IS. Wrapping rather than editing eight builders means
     a kind added later gets a star without anybody remembering to add one — the same reason
     `stuffCard` has a fallback card at all. */
  return `<div class="favwrap${isFav(x.key) ? ' is-fav' : ''}">${html}
    ${/* `star`, NOT `fav`. `.fav` was already the FAVICON on a link card — absolutely positioned at
          inset 10%, eighty per cent wide and tall, with a solid background — so every star button
          became a black rectangle covering the card it was supposed to sit on. Two features, three
          letters apart, and the older one silently swallowed the newer.
          Named for the shape rather than the meaning, because "fav" was ambiguous the moment a
          second thing wanted it. */''}
    <button class="star" data-do="fav" data-key="${esc(x.key)}" data-kind="${esc(x.kind || 'item')}"
      aria-label="Favourite">${isFav(x.key) ? '★' : '☆'}</button>
  </div>`;
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
    ${STUFF.filters.length > 1
      ? '<button class="chip clear" data-do="filter-clear">clear</button>' : ''}
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
function paintStuff() {
  const chips = $('stuff-chips');
  if (chips) chips.innerHTML = filterChips();
  const groups = $('stuff-groups');
  if (groups) groups.innerHTML = stuffQuestion();

  const host = $('s-stuff');
  if (!host) return;
  const first = host.querySelector(':scope > .page');
  if (!first) return;

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
  [].slice.call(host.querySelectorAll(':scope > .page')).slice(1).forEach(el => el.remove());
  const blanks = Array.from({ length: stuffPageCount() },
    /* WITH A PANE IN IT. These were bare `<section class="page">`, and a page with no pane is a page
       with no glass — so every result on this screen was drawn straight onto the black while the
       question above it sat on a card. `pages()` builds every other page in the app this way; these
       were the one place that built its own and forgot the wrapper. */
    () => '<section class="page"><div class="pane"></div></section>').join('');
  if (blanks) first.insertAdjacentHTML('afterend', blanks);

  /* AND BACK TO THE TOP OF THE RESULTS. A filter is a new question, and the answer to it starts at
     the beginning — `paintPager` only CLAMPS, so changing a filter while on page twenty of the old
     results landed you on the last page of the new ones, which reads as the app having lost its
     place. */
  PAGE.stuff = 0;

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
  for (let i = 1; i < pages.length; i++) {
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
      pane.innerHTML = stuffPageHtml(i - 1);
      el.dataset.filled = '1';
      changed = true;
      /* AND DRAWN WHILE IT IS BUILT, if it is one of the ten that do not loop. This is the whole of
         the fix for widgets popping open: the markup and its contents now arrive together, five
         pages before anybody sees either. It happens before `settle_` below, so the grid measures
         panes that are already their final height rather than measuring them and being wrong. */
      const w = showingWidgets() && items[i - 1] && items[i - 1].row;
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
  const wgt = items[at - 1] && items[at - 1].row;
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

/** IS THIS ACTUALLY AN EXAM PAPER? An exam board, a tier, or a name that says which paper it is.
    Anything else — a worksheet, a video, a topic list — is an ordinary card, because a costume that
    everything wears is not a costume. */
function paperish_(x) {
  /* AN EXAM BOARD IS NOT ENOUGH, and that was the mistake. Half the library carries a board —
     a revision sheet written to the Edexcel syllabus is an Edexcel resource and is not an exam
     paper — so "3D Trig and Pythagoras Edexcel" was being drawn as the cover of one. A costume
     everything wears is not a costume, and the ones that earn it stop meaning anything.

     TWO WAYS IN, and both of them say PAPER rather than merely implying it:

       THE TYPE SAYS SO. `resource_type` is the column where somebody has already answered this
       question — "Past paper", "Paper 2" — and an answer somebody gave beats anything inferred
       from the other fields.

       OR THE NAME NAMES ONE. "Paper 1", "Paper 2 (Calculator)" — a numbered paper is a paper, and
       the number is the thing that makes it one rather than a worksheet about the same topic.

     Everything else is an ordinary card, including a worksheet with a board and a tier on it. */
  const type = S_(x.resourceType);
  return /past\s*paper|^paper\b|\bpaper\s*\d/i.test(type)
      || /\bpaper\s*\d/i.test(S_(x.name));
}

/**
 * THE COVER, laid out the way the real one is: board top-left, subject and paper under it, the
 * tier and the sitting on the right, a ruled box for a candidate's name, and the instructions
 * along the bottom.
 *
 * NOTHING HERE IS INVENTED. Every line is a column on the resources tab — and where a column is
 * blank the line is simply absent, which is what a real cover does too: a paper with no tier does
 * not print an empty tier.
 */
function paperCard(x) {
  const board = S_(x.examBoard);
  const paper = (S_(x.name).match(/paper\s*\d+[a-z]?/i) || [''])[0];
  const when = yearOf(x) || waveOf(x);
  return `<div class="paper${x.off ? ' is-off' : ''}">
    <div class="paper-top">
      <span class="paper-board">${esc(board || '@family.')}</span>
      ${x.tier ? `<span class="paper-tier">${esc(x.tier)} Tier</span>` : ''}
    </div>

    <div class="paper-mid">
      <span class="paper-subject">${mark(S_(x.subject) || S_(x.sub) || '')}</span>
      <span class="paper-name">${esc(paper ? paper.replace(/^\w/, c => c.toUpperCase())
                                           : S_(x.name))}</span>
      ${paper && S_(x.name) !== paper
        ? `<span class="paper-of">${esc(S_(x.name).replace(paper, '').replace(/^[\s·—-]+/, ''))}</span>`
        : ''}
    </div>

    ${/* THE BOX FOR A CANDIDATE'S NAME. Empty, ruled, and the single detail that makes the whole
          thing land — every one of these you have ever been handed had this, and you wrote in it. */''}
    <div class="paper-box">
      <span class="paper-box-k">Candidate name</span>
      <span class="paper-box-line"></span>
    </div>

    <div class="paper-foot">
      <span>${esc(when || '')}</span>
      <span>${x.pages ? esc(x.pages) + ' pages' : ''}</span>
      ${/* `x.printPrice` WAS NEVER SET BY ANYTHING. Nothing in `stuffItems` writes that field, so
            this read `undefined` on every past paper ever drawn and every cover in the app said
            "Answer all questions" whether or not it was priced. Worked out from the pages here,
            which is where the other two facts on this line come from. */''}
      <span>${printPrice(x.topic && x.topic.pages) != null
        ? esc(money(printPrice(x.topic.pages))) + ' printed' : 'Answer all questions'}</span>
    </div>
    ${cardTiles_(x)}
  </div>`;
}

/* `stuffCount` was here. Removed with the line it fed — a function whose only caller has gone is
   the thing `check-dead.js` would name next time anyway. */


screen('stuff', () => {
  const credits = USER ? (USER.credits || 0) : 0;
  /* The control must SAY what it is doing. Without this the box snapped back to its first option
     every time the screen was redrawn, so the list and the dropdown above it disagreed — and the
     one you believe is the one you can see. */
  const sel = (what, v) => STUFF[what] === v ? ' selected' : '';

  const controls = `<div id="stuff-saved">${savedStrip_()}</div>`
    + `<div class="savebox searchbox">`
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
    ${/* SAVED IS NOT DOWN HERE ANY MORE — it is above, outside this box. See `savedStrip_`. */''}
  </div>`;

  /* THE CONTROLS ARE A PAGE, and the results are the pages after it. Four hundred cards under a
     search box is a column nobody reaches the end of; eight to a screen is a thing you turn.

     It also solves what every version of this screen has worked around: the controls are drawn
     once and never rebuilt, so typing in the search box cannot lose its own focus. */
  /* Empty pages. `fillStuffPages` puts markup in the ones you can reach, after the screen exists
     — a page cannot be measured or moved until it is in the document. */
  return pages('stuff', [controls].concat(
    Array.from({ length: stuffPageCount() }, () => '')));
}, () => CART.length
  ? `<span class="act" data-do="open-cart">basket ‧ ${CART.length}</span>`
  : '');

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
function docketLines() {
  return String((USER && USER.todo) || '').split(/\r?\n/)
    .map(t => t.trim()).filter(Boolean)
    .map(t => {
      const done = /^(x|✓)\s+/i.test(t);
      return { done, text: t.replace(/^(x|✓)\s+/i, '') };
    });
}

const docketText = list =>
  list.map(l => (l.done ? 'x ' : '') + l.text).join('\n');

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

  host.innerHTML = list.map((l, i) => `
    <label class="dock-row${l.done ? ' done' : ''}">
      <input type="checkbox" data-do="dock-tick" data-i="${i}" ${l.done ? 'checked' : ''}>
      <span class="box"></span>
      <span class="dock-text">${mark(l.text)}</span>
      <span class="text-drop" data-do="dock-drop" data-i="${i}">✕</span>
    </label>`).join('')
    + `<div class="row" style="border:0;padding:.4rem 0 0">
        <span class="k">${left ? left + ' left' : 'All done'}</span>
        ${list.length > left
          ? '<span class="v"><button class="btn quiet tiny" data-do="dock-clear">Clear done</button></span>'
          : ''}
      </div>`;
}

on('dock-tick', el => {
  const list = docketLines();
  const i = Number(el.dataset.i);
  if (!list[i]) return;
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
  list.splice(Number(el.dataset.i), 1);
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