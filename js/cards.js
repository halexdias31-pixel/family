/* ==================================================================================================
   @family. — cards.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   cards.js is number 6 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* The app STARTS at the very bottom of this file, not here.

   It used to start here, and here is above every `screen(...)` registration — so `go()` ran with
   an empty SCREENS table and `paint()` fell through to its own "Nothing here yet", on every tab,
   until the first fetch came back and repainted. The skeleton was never reached once, on any
   device: the thing it was covering had already been replaced by a sentence saying there was
   nothing to cover.

   Nothing marks the boundary in a file that is read top to bottom, which is exactly why the
   start belongs at the end — where everything it needs is behind it by construction rather than
   by somebody remembering. */

/* ================================================================================================
   THE FIRST SCREEN — Who.

   Tutors and venues, which is the simplest real screen: two lists of things the backend already
   sends. It is here to prove the shell rather than to be finished, and to be the shape every
   other screen copies:

     · a screen is ONE function returning markup
     · it never touches the tab bar, the header or another screen
     · anything needing the whole display opens a sheet
     · anything pressable carries `data-do`, so the markup can be thrown away and redrawn
================================================================================================ */

/* ---------- WHAT A PERSON, A PLACE AND A SUBJECT LOOK LIKE ---------------------------------------
   The Find SCREEN is gone — it and Stuff were two tabs asking the same question, and the funnel
   can hold both lists now that it skips whatever a kind cannot answer. What survives is the three
   card shapes, because a tutor still has to look like a tutor.

   `findItems`, `findPageHtml`, `findBrowse`, `findPageCount` and the `find-kind` handler went with
   the screen. Every one of them was a smaller, worse copy of something the funnel already does:
   a browse page with three counts, a pager, and a filter that could only ever ask one question.
--------------------------------------------------------------------------------------------- */
/** One card. The three shapes, each carrying the class that colours its name. */
/* ---------- YOU, AS A CARD -------------------------------------------------------------------------
   THE ACCOUNT WAS A LIST OF ROWS ON `You` — name, role, credits, ticks, email, where — with the
   things you can do about it as three separate tap-cards further down the column. Everybody else in
   this app is a card: a tutor is a pass, a friend is a card, a venue is a card. You were a settings
   screen.

   ONE CARD, AND THE ACTIONS ARE ON IT, which is the rule every other card in the app already
   follows. Editing your details, adding your child and opening your wardrobe were three cards you
   scrolled past; they are marks in the row under your own face now.

   IT IS ONLY EVER YOU. There is no people directory on the device and there should not be one from
   here: the `people` tab carries PINs, bank details, addresses and dates of birth, and the backend
   deliberately sends only `tutors` — filtered to public facts — and `students`. Everything on this
   card is already on this device because it is yours. */
/* NO `cardTiles_` CALL HERE. `stuffCard` in find.js appends the action row to every card it draws,
   and this card is drawn through it — the `me` kind is registered in `KINDS` like any other. This
   builder kept the call it had from before the actions were centralised, so the row came out twice:
   two stars, two pencils, two bins, two admin rows, all live and all doing the same thing. */
/* ---------- ONE PERSON, ONE CARD -------------------------------------------------------------------
   YOU WERE ON THE SCREEN TWICE. A staff pass with your photograph, your subjects, your rate and your
   DBS stamp — and then, a swipe later, a second card with your photograph, your name and your role
   again above your credits. Same person, same face, two cards, because one was built for `tutor` and
   the other for `me` and nothing ever asked whether they could be the same row.

   THE PASS IS THE PUBLIC HALF AND IT WINS. It is what everybody else sees of you, it is the shape
   this app already uses for a person, and it says more: what you teach, what you cost, whether you
   are cleared. Drawing a plainer version of the same person underneath it says nothing the pass did
   not already say better.

   SO THE PRIVATE HALF HANGS OFF IT. Credits, ticks, email, where — the facts only you see — are rows
   under your own pass rather than a card of their own, and the way out is the last of them.

   AND IT IS NOT ABOUT TUTORS. A child with a row, an admin, anybody: `passFor_` finds whatever
   public record exists for the person and the private rows go under it. Somebody with no such record
   gets the rows on their own, which is what everybody used to get. */
function passFor_(name) {
  const n = norm(name);
  if (!n) return null;
  return (DATA.tutors || []).find(t => norm(t.title) === n) || null;
}

/* ---------- ONE ROW FOR ONE PERSON, PASSED IN RATHER THAN LOOKED UP A SECOND TIME -----------------
   `passFor_(USER.name)` MATCHES ON THE DISPLAY NAME ALONE, and CLAUDE.md is emphatic about what
   that costs: `findPerson` on the backend falls back to matching a name, which is right for a row
   typed into a sheet before anybody has an id and silently wrong the day two tutors share one.
   `accountPages_` already does this properly — `mineIs_` tries `personId`, then `handle`, then the
   name, in the order the backend uses — and it has the answer in its hand when it calls this.

   SO THE ROW IS AN ARGUMENT. Passing it is what makes the two agree by construction; `passFor_`
   stays as the fallback for a caller that has no row, which today is `KINDS.tutor.card` — the
   funnel's renderer, currently unreached because Booking has left the funnel, and still correct if
   the `kinds` tab ever puts a tutor back in it. */
function meCard(given) {
  if (!USER) return '';
  const face = pic(USER.photo || (USER.profile || {}).photo || '');
  /* ---------- CREDITS, E-MAIL AND WHERE MOVED TO THE SETTINGS COLUMN ----------------------------
     They were a second card under this one headed "Only you see this". Asked for as *"credits can
     stay in the column to the right along with email and where bit"* and *"remove the only you can
     see this bit"*: the e-mail and the place are boxes on that column already, so printing them here
     too was one fact in two places, and the credits sit on the figure's card there because credits
     are what buy a wearable. What is left here is who you are — the photograph, the name, the role
     and the handle — which is the one thing this column is for. The fallback card below prints
     the role in its subtitle, so a `Role` row under it would say it twice. */

  const mine = given || passFor_(USER.name);
  if (mine) {
    /* ---------- TWO WIDGETS, NOT A CARD INSIDE A CARD ---------------------------------------------
       THIS WRAPPED `findCard` IN `<div class="card">` and appended the private rows inside it. That
       was right while a tutor was a `.pass` — a bare object with no container of its own. It is a
       `.card.is-widget` now, so a wrapper would be a card in a card, which is the nesting
       `accountPages_` has just stopped doing. And with the private rows gone to Settings there is
       no second card either: your own card is the card everybody else sees of you. */
    return findCard({ kind: 'tutor', row: mine });
  }

  return `<div class="card is-widget">
    <div class="thing">
      ${face
        ? `<img class="thing-pic" src="${esc(face)}" alt="">`
        : `<span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>`}
      <div class="thing-body">
        <h3>${esc(USER.name)}</h3>
        <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
        ${USER.handle ? `<p class="prof-handle">@${esc(USER.handle)}</p>` : ''}
      </div>
    </div>
    ${/* THE `Sign out` BUTTON WAS HERE, briefly. It moved to `#stuff-controls` — the question at the
          top of the funnel, which is the one thing on screen that is never scrolled past, never
          filtered out and never not drawn. A card can be all three, and a way out that is only
          there when you have already found yourself is not one. See `screen('stuff')`. */''}
  </div>`;
}

/* ---------- A FIELD THAT MIGHT BE A LIST, AND MIGHT BE A STRING, AND MIGHT BE NEITHER -------------
   THE FIRST VERSION OF THIS CARD DID `(t.focus || []).join(' · ')` AND IT THREW. `doget.gs` sends
   `focus` as an array and the fixture holds the string `"Maths"`, and a string has no `.join` — so
   `paint` caught the TypeError, drew its "This screen did not draw" card, and `check/ui.js`
   measured that card across eight combinations and reported nothing to report.

   THE SHAPE IS NOT SOMETHING THIS CARD GETS TO ASSUME. Four of the thirteen fields it reads are
   list-shaped, they arrive from a spreadsheet through a mapper, and this file has already paid for
   the opposite belief twice — `r.link` against `source_url` cost seven silent reads, and
   `extraQuals` is sent as a STRING while the fixture holds an empty ARRAY, which is truthy, so the
   naive test printed an `Also` row with nothing after it.

   SO IT READS ALL THREE FORMS, exactly as `asList_` in find.js does for the funnel: an array, a
   comma-separated cell, or a single value. Declared here rather than borrowed because `cards.js`
   loads before `find.js` — see `window.FILES` — and a card that works only once the funnel has
   loaded is a card that breaks on the first screen somebody opens. */
function profList_(v) {
  return (Array.isArray(v) ? v : String(v == null ? '' : v).split(','))
    .map(x => String(x == null ? '' : x).trim()).filter(Boolean);
}

/* ---------- "1 to 4 students", NOT `minStudents` AND `maxStudents` --------------------------------
   THE SHEET STORES A FLOOR AND A CEILING and a reader wants a range, so the joining happens once
   here rather than on every card that shows one. Three cases and they read differently:
     · both, and equal   → "1 student"        — a tutor who only takes one is stating a policy
     · both, and apart   → "1–4 students"
     · a floor only      → "1+ student" — `maxStudents` of 0 is "no limit set", which
                            `doget.gs` says outright, so it must not be printed as a ceiling of nought
   NOTHING AT ALL when there is no floor either: an unanswered question is not a range, and a row
   reading "0 students" is the `cost: 0` shape one more time. */
function profRange_(lo, hi, one, many) {
  const a = Number(lo) || 0, b = Number(hi) || 0;
  if (!a && !b) return '';
  const word = n => n === 1 ? one : many;
  /* `1–4 students` and `1+ hour`, ASKED FOR BY NAME over "1 to 4" and "1 hour or more": a range
     is scanned rather than read, and the short form is what every timetable prints. En dash, the
     character this app already writes a range with (`1–10`, `Grades 4–6`). */
  if (a && b && a !== b) return a + '–' + b + ' ' + word(b);
  if (a && b) return a + ' ' + word(a);
  if (a) return a + '+ ' + word(a);
  return 'up to ' + b + ' ' + word(b);
}

/* THE THREE FACT CHIPS, in the order a parent asks: how experienced, how many at once, how long.
   `yrsExp` is a number when the sheet holds one and whatever was typed otherwise. */
function profFacts_(t) {
  const y = String(t.yrsExp == null ? '' : t.yrsExp).trim();
  const exp = !y || y === '0' ? '' : /^\d+$/.test(y) ? (y === '1' ? '1 year' : y + ' years') : y;
  return [exp ? exp + ' experience' : '',
          profRange_(t.minStudents, t.maxStudents, 'student', 'students'),
          profRange_(t.minHours, t.maxHours, 'hour', 'hours')].filter(Boolean);
}

/* ---------- WHERE THEY TUTOR, AS A HEAT MAP RATHER THAN A LIST OF NAMES -------------------------
   ASKED FOR AS *"instead of the tutors at showing names of all places, just let it be a heat map of
   the areas. like that way people will generally see that i tutor roughly south west london by
   seeing my heat map."* A list of eleven library names says nothing to a parent who does not know
   them; a warm patch over the south west of a map of London says it at a glance.

   THE POINTS ARE THE VENUES' OWN COORDINATES, which the payload already carries (`lat`/`lng` on
   `DATA.venues`, filled by `?run=geocode`), matched by name to the ticked list. A venue with no
   coordinates is left off rather than guessed at, and `Online` has none, so it is a chip under the
   map when it is ticked — it is not a place.

   THE MAP IS REAL STREET TILES, NOT A DRAWING, because "roughly south west London" is only readable
   against London: a glow on a blank box is a glow. OpenStreetMap's own tiles, which need no key,
   darkened in CSS so the map sits in a black-and-gold card rather than being a white hole in it, with
   the credit OpenStreetMap asks for. Tiles are another origin, so `sw.js` never caches them, and one that fails to
   load leaves the card's own grey under the glow — the heat still reads, the streets do not.

   CENTRED ON THE POINTS, AT THE CLOSEST ZOOM THAT HOLDS THEM ALL, capped both ways: never closer than
   a borough (a street-level map would be a tutor's front door, which is not what this is for) and
   never further out than all of London. Positions are Web Mercator pixels relative to the centre,
   written as `calc(50% + …px)`, so the map is right at every card width without being measured. */
const HEAT_W = 300, HEAT_H = 200;
const heatPx_ = (lat, lng, z) => {
  const n = 256 * Math.pow(2, z), r = lat * Math.PI / 180;
  return [(lng + 180) / 360 * n, (1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * n];
};
function profHeat_(names) {
  if (!names || !names.length) return '';
  const byName = {};
  ((typeof DATA !== 'undefined' && DATA && DATA.venues) || []).forEach(v => {
    if (v && v.title) byName[norm(v.title)] = v; });
  const pts = names.map(n => byName[norm(n)])
    .filter(v => v && Number(v.lat) && Number(v.lng)).map(v => [Number(v.lat), Number(v.lng), v.borough || '']);
  const online = names.some(n => /^online$/i.test(String(n).trim()));
  const tail = online ? `<div class="prof-tags prof-teach"><span class="prof-tag">Online</span></div>` : '';
  if (!pts.length) return online ? `<div class="prof-cap">Tutors at</div>${tail}` : '';
  let z = 12;
  for (; z > 9; z--) {
    const px = pts.map(p => heatPx_(p[0], p[1], z));
    const xs = px.map(p => p[0]), ys = px.map(p => p[1]);
    if (Math.max(...xs) - Math.min(...xs) <= HEAT_W * .6 && Math.max(...ys) - Math.min(...ys) <= HEAT_H * .6) break;
  }
  const px = pts.map(p => heatPx_(p[0], p[1], z));
  const cx = (Math.min(...px.map(p => p[0])) + Math.max(...px.map(p => p[0]))) / 2;
  const cy = (Math.min(...px.map(p => p[1])) + Math.max(...px.map(p => p[1]))) / 2;
  /* BACKGROUND LAYERS, NOT ELEMENTS. The tiles run wider than any card so no width leaves a bare
     edge, and as absolutely placed `<img>`s that made the box scroll sideways by 120-150px —
     `overflow: hidden` clips a scroller, it does not stop it being one, and `check/ui.js` named it on
     the first run. A background is painted inside its own box and has no extent to scroll to, so the
     map is clipped by construction. The glows are radial gradients in the same list, on top. */
  /* `50%` IN A BACKGROUND POSITION IS NOT THE BOX'S MIDDLE. It lines the IMAGE's 50% up with the
     BOX's 50%, so a 256px tile placed at `calc(50% + d)` starts 128px left of where `d` says — and
     the first version shipped that way: every tile and every glow was half its own size up and to
     the left, the bottom of the map was black, and the glows sat off their venues. The owner's
     screenshot is what showed it (this container cannot load the tiles). `w` and `h` put it back:
     the image's own half is added so its top-left corner lands at `50% + d`. */
  const pos = (x, y, w, h) => `calc(50% + ${Math.round(x - cx + w / 2)}px) calc(50% + ${Math.round(y - cy + h / 2)}px)`;
  const layers = [], tiles = [];
  /* A SOFT, WIDE GLOW PER VENUE, TRANSLUCENT, so the streets read through it and venues close
     together add up into a warmer patch rather than each being a hard orange ball. */
  const G = 80;
  px.forEach(p => layers.push({ img: 'radial-gradient(circle closest-side, rgba(255,190,90,.6) 0, rgba(255,150,60,.3) 45%, rgba(255,120,40,0) 100%)',
    pos: pos(p[0] - G / 2, p[1] - G / 2, G, G), size: G + 'px ' + G + 'px' }));
  const t0x = Math.floor((cx - 220) / 256), t1x = Math.floor((cx + 220) / 256);
  const t0y = Math.floor((cy - 130) / 256), t1y = Math.floor((cy + 130) / 256);
  for (let tx = t0x; tx <= t1x; tx++) for (let ty = t0y; ty <= t1y; ty++) {
    /* OPENSTREETMAP'S OWN TILES, WHICH NEED NO KEY. The first version used CARTO's dark tiles,
       and CARTO now draws "API key required" over every tile for a site with no account -- the
       owner's report was "the map is asking me for an api key". OSM's standard tiles are free with
       the credit printed on the map; they are light, so `.heat-tiles` darkens them in CSS rather
       than this paying for a dark style. */
    tiles.push({ img: `url("https://tile.openstreetmap.org/${z}/${tx}/${ty}.png")`,
      pos: pos(tx * 256, ty * 256, 256, 256), size: '256px 256px' });
  }
  const bg = list => `background-image:${list.map(l => l.img).join(',')};`
    + `background-position:${list.map(l => l.pos).join(',')};`
    + `background-size:${list.map(l => l.size).join(',')};background-repeat:no-repeat`;
  const areas = [...new Set(pts.map(p => p[2]).filter(Boolean))];
  return `<div class="prof-cap">Tutors at</div>
    <div class="prof-heat" role="img" data-dots="${px.length}"
      aria-label="${esc('A map of where they tutor' + (areas.length ? ': around ' + areas.join(', ') : ''))}">
      <span class="heat-tiles" style="${esc(bg(tiles))}"></span>
      <span class="heat-glow" style="${esc(bg(layers))}"></span>
      <span class="heat-credit">© OpenStreetMap contributors</span>
    </div>${tail}`;
}

/* WHAT ONE EXTRA SEAT ADDS TO THE HOURLY RATE — ASKED FOR AS *"a smaller rate to the side so
   clients can know extra cost for the extra seat"*. `seatShare_` is the reader `priceFrom` uses,
   so the card and the booking agree: a seat is `(cUsed + bUsed)` of the rate. Nought draws nothing. */
function profSeat_(t) {
  if (!(Number(t.rate) > 0) || typeof seatShare_ !== 'function') return 0;
  const s = seatShare_(t);
  return Math.round(Number(t.rate) * (s.cUsed + s.bUsed) * 100) / 100;
}

function findCard(x) {
  const t = x.row;
  /* ---------- A PERSON IS A WIDGET, AND THE LANYARD HAS GONE ------------------------------------
     REPORTED AS "get rid of that lanyard looking thing mate. just a normal widget." — the second
     complaint about this card in two days, and the first one ("I want them standardised like the
     other widgets") was answered by putting the pass INSIDE a widget, which is not what was asked
     and left a lanyard in a box.

     WHAT THE PASS WAS FOR, so the argument is not lost with the markup. It carried a photograph, a
     name, what the person does and whether they had been CLEARED, and the defence of it was that
     the SHAPE did the explaining: a rectangle with a hole punched in the top reads as something
     worn round a neck, and once it reads as that the DBS stamp reads as clearance without anybody
     saying so. That was true and it is not the point. A pass is an object you are handed at a
     reception desk; this app is a column of widgets you scroll, and one object among nine widgets
     reads as a thing that has not been finished rather than as a thing with a shape of its own.

     AND IT COULD NOT HOLD WHAT IS ACTUALLY IN THE SHEET. That is the half that matters more than
     the taste. `doget.gs` has sent thirteen public facts about a tutor since it was written and the
     pass drew four of them: a photograph, a name, three subjects and a rate. The headline they
     wrote about themselves, the three adjectives, the years they have been doing it, their
     qualifications and grades, the group sizes and session lengths they accept, what they focus on,
     and when they last confirmed any of it were all on every phone, on every load, drawn nowhere.
     THIRTEEN COLUMNS WRITTEN AND NEVER READ is this repository's oldest shape — `figure`,
     `orderPrints`, the four message actions, `exam_date` — and a pass is 3.4rem of card wide, so
     there was nowhere to put them even once somebody noticed.

     SO IT IS `.card.is-widget`, the same container the calculator and the notepad sit in, with the
     role as its label and rows underneath. Asked for twice; the rows are what makes it worth it.

     THE DBS STAMP SURVIVES THE MOVE, because the one thing on here a parent is actually scanning
     for should not become a row of text among twelve others. It is a marked chip beside the name,
     green or red, and the `undefined` rule below is unchanged and still the sharp edge. */
  if (x.kind === 'tutor') return `
    <div class="card is-widget is-prof${t.listed === false ? ' is-off' : ''}">
      ${/* ---------- A TITLE SITS BESIDE THE ROLE, IN THE ROLE'S OWN LABEL ---------------------
             `doGet` SENDS `titles` — the values in the role cell that are titles rather than
             roles, `Head of Boxing` among them — and this heading is the one place on the card
             that already says what somebody IS. A row of its own would be a twelfth label/value
             line for a fact three words long; a longer `role` string would put a title through the
             funnel, which reads that field as a kind. `profList_` because the shape is not
             something this card gets to assume — see its note. */''}
      <h3>${esc([t.role || 'Tutor'].concat(profList_(t.titles)).join(' · '))}${
        t.listed === false ? ' <span class="prof-off">· not listed</span>' : ''}</h3>
      ${/* ---------- AND WHAT `· not listed` MEANS, SAID ONCE, WHERE THE MARK IS ------------------
            REPORTED THREE TIMES AS *"i still dont see george"*, AND HE WAS ON THE SCREEN. Measured:
            an admin's account column opens ON the unlisted tutor — `PAGE_HOME.account` is page 1
            — dimmed, with `· not listed` beside the role and a `set-listed` tile under the card.
            What was missing is that every one of those signals says a STATE and none of them says
            what to do about it: `tile_` puts a tile's label in `title` and `aria-label` only, which
            is a recorded decision and not one to undo here, so on a phone the only way back is an
            unlabelled crossed-out eye in a row of icons.

            ONE LINE UNDER THE ROW RATHER THAN A WORD ON THE BUTTON is what the house style says for
            exactly this — see `jobAdminTiles_` — and here it is at the TOP of the card because
            that is where the mark it explains is. It says the consequence rather than the cell:
            "clients cannot see them" is what `listed` means, and the tile is what changes it.

            ADMIN ONLY, because nobody else is ever sent an unlisted tutor: `doGet`'s gate is
            `(listed || viewerIsAdmin)`, so a client's payload has no such row and repeating the
            rule here would be the second copy this repository keeps paying for. */''}
      ${t.listed === false && isAdmin()
        ? `<p class="prof-say prof-hid">Clients cannot see them. The crossed-out eye below puts
             them back on the site.</p>` : ''}
      <div class="prof-top">
        ${t.image
          ? `<img class="prof-pic" src="${esc(pic(t.image))}" alt="" loading="lazy">`
          : `<span class="prof-pic prof-none">${esc((t.title || '?').slice(0, 1).toUpperCase())}</span>`}
        <div class="prof-who">
          <span class="prof-name">${esc(t.title)}</span>
          ${/* ---------- AND THE HANDLE, WITH THE `@` THAT IS NOT IN THE CELL ---------------------
                ASKED FOR AS *"each person should have … handle llik \"@_____\""*, and the visible
                half of that was missing: `doGet` has sent `handle` on every tutor since it was
                written, and measured across `js/`, the only place the `@` appeared was a toast in
                `changeHandle`. So a handle was a thing you signed in with and never saw.

                THE `@` IS DRAWN AND NOT STORED. The cell holds `halex_bright42`; `findPerson`
                resolves through `key()`, which strips the `@` anyway, so a stored one would be a
                character that means nothing to every reader and has to be remembered by every
                writer. Same separation as `spellShow_`: what is matched and what is shown.

                WHATEVER THE SERVER RESOLVED, which is worth knowing before anybody reads one.
                `doget.gs` sends `handle || username || first_name`, so a row with neither column
                filled in shows an `@` in front of a FIRST NAME — true of every account made before
                `register` started generating one, and what `?run=fillHandles` is for. */''}
          ${t.handle ? `<span class="prof-handle">@${esc(t.handle)}</span>` : ''}
          ${/* ---------- THE RATE, UP HERE AND BIGGER ------------------------------------------------
                ASKED FOR AS *"rate should appear near profile at the top and bigger."* It was the
                eleventh label/value row, under the qualifications — and it is the one number a
                parent opens this card to find. One place: the `Rate` row it replaces is gone, so the
                card cannot print two rates that disagree. */''}
          ${t.rate ? `<span class="prof-price"><span class="prof-rate">${esc(money(t.rate))}<small>/h</small></span>${
              profSeat_(t) ? `<span class="prof-seat">+${esc(money(profSeat_(t)))}/h a seat</span>` : ''}</span>` : ''}
          ${/* ---------- NO CITY AND NO DBS STAMP UP HERE --------------------------------------------
                ASKED FOR AS *"remove the city which appears under the rate"* and *"enhanced dbs check
                shouldnt appear up there. treat it like an extra qualification thing. thats how they
                activate it."* `Enhanced DBS` is on the extra-qualifications list, so a tutor who holds
                one ticks it and it is drawn as a dashed chip under Qualifications with everything else
                they typed. The `dbs_checked` stamp went, which means the card no longer says a DBS is
                MISSING — absence is now silence, like every other qualification. Checking the
                certificate is the business's job and belongs with the records, not on the card. */''}
        </div>
      </div>
      ${/* WHAT THEY WROTE ABOUT THEMSELVES. `doget.gs` already wraps it in quotation marks, so it
            is printed as said rather than as a field with a label — which is the difference between
            a profile and a form. */''}
      ${t.description ? `<p class="prof-say">${esc(t.description)}</p>` : ''}
      ${/* ---------- THEIR OTHER PHOTOGRAPHS, AS SMALL SQUARES --------------------------------------
            ASKED FOR AS *"tutors should be able to add more pics."* `doGet` sends `photos`, the links
            after the face (`photosList_`), and an older backend sends no key at all — which draws
            nothing, rather than a grid of nothing.
            FOUR TO A ROW, because this card is somebody's CV rather than their feed: eight photographs
            are two rows of thumbnails a parent can take in at once, where the post grid's two-wide
            squares would be four rows — most of a phone — under a profile.
            A TAP OPENS ONE IN PLACE, across the whole row, and a second tap puts it back. Not a sheet
            and not a new tab, both of which the owner refuses; the picture grows where it is. */''}
      ${Array.isArray(t.photos) && t.photos.length
        ? `<div class="prof-photos">${t.photos.slice(0, 8).map(u =>
             `<button type="button" class="prof-shot" data-do="prof-shot" aria-label="Photo — tap to see it bigger"
                aria-pressed="false"><img src="${esc(pic(u))}" alt="" loading="lazy"></button>`).join('')}</div>`
        : ''}
      ${/* THE THREE ADJECTIVES OFF THE SHEET, AS BOLD WORDS AND NOT CHIPS. Asked for as "the
            adjectives for tutors shouldnt be like google chips. they should be like just bold words to
            catch attention." A chip is a fact somebody scans for — a subject, a group size — and the
            rows below are chips for that reason. These are the tutor describing themselves, which is
            read rather than scanned, so they are one line of words with a gold dot between them.
            Capped at three because the tab has exactly three columns. */''}
      ${profList_(t.tags).length
        ? `<p class="prof-words">${profList_(t.tags).slice(0, 3)
             .map(v => `<b>${esc(v)}</b>`).join('<i aria-hidden="true">·</i>')}</p>` : ''}
      ${/* ---------- EXPERIENCE, GROUP SIZE AND SESSION LENGTH, AS CHIPS --------------------------
            ASKED FOR AS *"the years experience should also be a google chip type thing … sesson
            lenth should also be a google chip. same with student number size."* They were three
            label/value rows; each is one short fact a parent scans for, which is what a chip is.
            Captioned so a chip reading `1–4 students` does not have to explain itself. The extra
            seat is not a chip: it is beside the rate, which is where a price is looked for. */''}
      ${profFacts_(t).length
        ? `<div class="prof-cap">At a glance</div><div class="prof-tags prof-teach prof-facts">${profFacts_(t)
             .map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''}
      ${/* ---------- THE ROWS, AND EVERY ONE OF THEM IS DROPPED WHEN IT IS EMPTY -------------------
            `.filter(Boolean)` AT THE END IS THE WHOLE RULE. A tutor with no qualifications typed in
            should show a shorter card, not a card with `Qualifications —` on it: a labelled blank
            is a claim that somebody looked and there was nothing, which is the sentence this
            repository has written down five times. `row` prints a dash for an empty value, so the
            emptiness has to be decided here, before it is asked for. */''}
      ${/* ---------- WHAT THEY TEACH, AS THE SAME CHIPS THE ADJECTIVES ARE ------------------------
            ASKED FOR AS *"can you see how adjectives look like google chips? i want the same for
            the subjects in tutors profile cards. to look like this ( Maths (GCSE) )"*. It was a
            `Teaches` row, a comma list — and each subject is a separate claim a parent is looking
            for, which is the argument the adjectives' own note makes for being chips.
            THE SPECIALISMS ARE MARKED, and `teachesSpec` says which they are rather than position:
            a tutor with no specialism and two other subjects must not have the first drawn as one.
            `mark` still runs inside each chip, so a search for "GCSE" lights the chip it matched.
            NOT UPPER-CASED, unlike the adjectives: "MATHS (GCSE)" is a subject shouted, and the
            owner's own example is written in the case the sheet holds. */''}
      ${/* ---------- FIVE CAPTIONS, IN THIS ORDER, AND NO OTHERS ----------------------------------
            ASKED FOR AS *"there should be x number of titles. at a glance, teaches, can also teach,
            qualifications, tutors at."* So `Teaches` is every level a tutor ticked `Teach` on (see
            `qualLevel_` in me.js) — and everything
            else they ticked `Can teach` on is its own caption, where it used to share a row with the
            specialism and be told apart only by a gold edge. The `Focus` row went: it was a sixth
            title nobody asked for. `teachesSpec` is still said by the server rather than read off
            position, so a tutor with no specialism gets no `Teaches` row rather than their first
            "also" subject promoted into it. */''}
      ${/* SEVERAL TEACHES. *"when i tick teach for different levels of same subject it unticks the
            other one. i dont want that"* — so `teachesSpec` is a list, every one a gold chip under
            `Teaches`, and `Can also teach` is the rest. An older backend sends one string as
            `teachesMain`, which `profList_` reads as a list of one. */''}
      ${(() => {
        const main = profList_(t.teachesSpec || t.teachesMain), also = profList_(t.teaches).filter(v => !main.includes(v));
        return (main.length ? `<div class="prof-cap">Teaches</div><div class="prof-tags prof-teach">${
                  main.map(v => `<span class="prof-tag is-main">${mark(v)}</span>`).join('')}</div>` : '')
             + (also.length ? `<div class="prof-cap">Can also teach</div><div class="prof-tags prof-teach">${
                  also.map(v => `<span class="prof-tag">${mark(v)}</span>`).join('')}</div>` : '');
      })()}
      ${/* ---------- QUALIFICATIONS, AS THE SAME CHIPS ---------------------------------------------
            ASKED FOR AS *"qualifications should also look like google chips."* Each entry of `quals`
            is already one sentence built by `doget.gs` ("Maths A-Level (Edexcel) grade B"), so a
            chip is one claim and nothing is re-joined here. A PGCE or a DBS is one of those entries now —
            the separate "more qualifications" field is gone and `qualsList_` folds it in. */''}
      ${profList_(t.quals).length
        ? `<div class="prof-cap">Qualifications</div><div class="prof-tags prof-teach prof-quals">${profList_(t.quals)
             .map(v => `<span class="prof-tag">${esc(v)}</span>`).join('')}</div>` : ''}
      ${/* WHERE THEY WILL TEACH, off the venues tab's own `tutors_happy_here` column, which a tutor
            ticks on their Contact & address page. An older backend sends no key: nothing drawn. */''}
      ${profHeat_(profList_(t.venues))}
    </div>`;

  /* ---------- A VENUE IS AN ORDINARY CARD ------------------------------------------------------
     IT WAS THE SLIP ON THE DOOR — cream paper, a torn perforation and a stub, drawn to read as a
     booking form you tear off. Asked to go: "venues have unique css. i dont want that anymore."
     So it is `.card` with an `h3` and `row`s, which is exactly what a level and a subject are, and
     nothing it said is lost — the place, the line under it, one row per room with how many fit and
     what an hour costs, and the notice it needs. ONE LINE PER ROOM stays, for the reason it was
     written: Richmond is three rooms at three prices, and a single "from" figure was the cheapest
     of them dressed as the answer. */
  if (x.kind === 'venue') {
    const say = (max, rate) => [max ? 'up to ' + max : '', rate ? money(rate) + '/h' : 'free']
      .filter(Boolean).join(' · ');
    return `
    <div class="card">
      <h3>${esc(t.title)}</h3>
      ${t.subtitle ? `<p class="sub">${mark(t.subtitle)}</p>` : ''}
      ${(t.rooms || []).length
        ? (t.rooms || []).slice(0, 4).map(r => row(r.name || 'Room', say(r.max, r.rate))).join('')
        : row('The room', say(t.maxCapacity, t.bestRate))}
      ${row('Notice', t.minNoticeDays ? t.minNoticeDays + ' days' : 'Book any time')}
    </div>`;
  }

  /* ---------- A LEVEL IS THE OTHER HALF OF A SUBJECT CARD ----------------------------------------
     GCSE was never a thing you could look at. It was a word inside a tutor's `teaches` string, a
     key in the pricing tab and an option on the booking form, and none of those three knew about
     the others — see `levelRows` for what that costs. This is those three facts on one card.

     NO NEW COLOUR. Green is a subject, purple a venue, red a tutor, and style.css says plainly
     that a fourth would turn a vocabulary into a legend. A level is not a fourth thing to scan a
     list for — it is a property of the three — so its name is set in the ordinary colour and the
     SUBJECTS on it are green, which is the same green they are everywhere else.

     THE TWO GAPS ARE PRINTED, not hidden behind a blank. A level with no multiplier says so
     instead of quietly reading "no surcharge"; a level the booking form has never heard of says
     so instead of looking exactly like one you can book. Both are admin-facing faults sitting in
     a client-facing list, and the only way either was ever going to be noticed is if something
     drew it. */
  if (x.kind === 'level') return `
    <div class="card is-level">
      <h3>${esc(t.name)}</h3>
      ${t.priced
        ? row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
              t.mult === 1 ? '—'
            : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')
        : row('Surcharge', 'Not priced yet', 'bad')}
      ${/* THE SUBJECTS THAT RUN AT IT — green, because a subject is green wherever it appears, and
            this is the fact somebody who has chosen a level is actually asking for. */''}
      ${t.subjects && t.subjects.length
        ? rowHtml('Subjects', t.subjects.map(s => `<span class="subject">${esc(s)}</span>`).join(', '))
        : row('Subjects', 'None yet', 'bad')}
      ${row('Tutors', t.tutors && t.tutors.length ? String(t.tutors.length) : 'None yet',
            t.tutors && t.tutors.length ? '' : 'bad')}
      ${t.listed ? '' : row('Booking form', 'Not offered', 'bad')}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches at this level yet</p>'}
    </div>`;

  return `
    <div class="card is-subject">
      <h3>${esc(t.name)}</h3>
      ${row(t.mult === 1 ? 'No surcharge' : 'Surcharge',
            t.mult === 1 ? '—'
          : (t.mult > 1 ? '+' : '−') + Math.abs(Math.round((t.mult - 1) * 100)) + '%')}
      ${/* THE LEVELS, which only the sheet had. One line, and it is the fact that decides whether
            this subject is the one somebody wants at all. */''}
      ${t.levels && t.levels.filter(Boolean).length
        ? row('Levels', t.levels.filter(Boolean).join(', ')) : ''}
      ${t.tutors && t.tutors.length
        ? `<p class="faint" style="margin:.3rem 0 0">${esc(t.tutors.map(y => y.title).join(', '))}</p>`
        : '<p class="faint" style="margin:.3rem 0 0">Nobody teaches this yet</p>'}
    </div>`;
}

/* Tapping one opens a sheet rather than expanding the card. An expanding card pushes everything
   below it down, which on a phone means the thing you were looking at moves the moment you touch
   it — a sheet leaves the list exactly where it was. */
/* ---------- `on('who')` WAS HERE ----------------------------------------------------------------
   It opened a panel over a pass or a slip that already said everything in it. Every fact it
   added is on the card now and the one button is a row underneath. See `tutorTiles_` and
   `venueTiles_` in tiles.js.
--------------------------------------------------------------------------------------------- */

/* The switch. Admin only — a tutor who could list themselves could put themselves in front of
   clients before you had agreed to it. */
on('set-listed', el => {
  /* ---------- `el.checked` WAS READ HERE, AND THIS IS NO LONGER A CHECKBOX -----------------------
     It became a tile when the tutor sheet went, and `.checked` on a button is `undefined` — so this
     sent `on: undefined` on every press and put `!undefined`, which is `true`, back on failure. The
     switch was broken in both directions and looked like a backend problem.

     THE FILL IS THE STATE NOW, the same way it is on a star: `.on` is what the tile is showing, so
     `.on` is what it currently means, and the new value is the opposite of that. */
  const on = !el.classList.contains('on');

  /* SAID BEFORE IT IS TRUE. It almost always becomes true, and the round trip is the only part
     anybody would notice. */
  tileSet_(el, { label: on ? 'Listed' : 'Not listed', on,
                 note: on ? 'clients can see them' : 'clients cannot see them' });

  api({ action: 'setListed',
    adminName: USER.name, name: USER.name,
    who: el.dataset.who, whoId: el.dataset.pid || '', on })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      toast(on ? 'Listed' : 'Hidden from clients');
      /* `load()` WAS HERE — the whole payload fetched again to change one word. Nothing else on the
         screen depends on whether one tutor is listed, so nothing else needs redrawing. The row's
         own `listed` is updated so a later repaint from anything else agrees with the tile. */
      /* BY ID WHERE THERE IS ONE, for the reason the handler on the other end now records: a
         display name is derived from up to two cells and matching it is the fallback, not the
         route. */
      const id = el.dataset.pid || '';
      const t = (DATA.tutors || []).find(x => (id && String(x.personId) === id)
                                           || norm(x.title) === norm(el.dataset.who));
      if (t) t.listed = on;
    })
    .catch(err => {
      /* PUT IT BACK. A switch that has not actually flipped must not keep saying it has — this is
         the one case where showing it early has a cost, and it is paid here. */
      tileSet_(el, { label: !on ? 'Listed' : 'Not listed', on: !on,
                     note: !on ? 'clients can see them' : 'clients cannot see them' });
      toast(String((err && err.message) || 'Could not reach the server.'));
    });
});

/* THE OTHER HALF OF THE CLICK HANDLER.
   A checkbox is not clicked in the way a button is — the change event is what tells you it
   actually flipped, and reading .checked in a click handler can catch it mid-flight. A select is
   the same problem said louder: its value only means anything after `change`.
   So both come through here, and the click handler above refuses them. */
document.addEventListener('change', e => {
  const el = e.target.closest('[data-do]');
  if (!el || !ACTIONS[el.dataset.do]) return;
  if (el.tagName !== 'SELECT' && el.type !== 'checkbox') return;
  /* The same reason as the click handler: an error that gets out of here loses its message. */
  try {
    ACTIONS[el.dataset.do](el, e);
  } catch (err) {
    console.error('[' + el.dataset.do + ']', err);
    toast(el.dataset.do + ' — ' + String((err && err.message) || err));
  }
});

/* Tapping a SUBJECT. It has emitted `data-do="subject"` since the screen was written and no
   handler was ever registered, so the third of the three lists on this tab was the one that did
   nothing when you pressed it. */
/* ---------- `on('subject')` WAS HERE -------------------------------------------------------------
   The surcharge and the tutor names were already on the card; the levels have joined them, and
   `Book this` is a row underneath. The one thing genuinely lost is the list of tutors AS CARDS
   inside it — which was a list of passes reachable only by opening a subject, when the same
   passes are one filter away on the same screen.
--------------------------------------------------------------------------------------------- */

/* ---------- BOOKING FROM A CARD --------------------------------------------------------------------
   IT WENT TO A COLUMN THAT NO LONGER EXISTS, and said "not built yet" on arrival — which was true
   when it was written and has not been for a while.

   IT ASKS THE FUNNEL INSTEAD. "What for · Booking" is the filter the booker lives behind, so
   pressing Book on a tutor or a venue is answering that question on your behalf and landing you on
   the form. The name on the button is not carried through yet: `data-name` is read by nothing, and
   pre-filling the tutor from here is a change to `BOOKING`, not to navigation. */
on('book-with', () => {
  closeSheet();
  STUFF.filters = [{ field: 'forLabel', value: 'Booking' }];
  go('stuff');
  paintStuff();
});

/* ONE PHOTOGRAPH BIGGER, IN ITS OWN ROW, and the others back to squares — two open at once would be
   two full-width pictures and the grid gone. `aria-pressed` says which, because the only other sign
   is the size. The card grows, and `paneWatch_` hears it and shrinks or scrolls the pane. */
on('prof-shot', el => {
  const grid = el.closest('.prof-photos');
  const open = !el.classList.contains('is-big');
  if (grid) grid.querySelectorAll('.prof-shot.is-big').forEach(b => {
    b.classList.remove('is-big'); b.setAttribute('aria-pressed', 'false');
  });
  el.classList.toggle('is-big', open);
  el.setAttribute('aria-pressed', open ? 'true' : 'false');
});
