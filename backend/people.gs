/* ==================================================================================================
   @family. — 20_people.gs   (3 of 8)

   WHO SOMEBODY IS, and what follows from that: roles, family links, avatars, and
   who may write to whom.

   `findPerson` is the important one. Identity used to be a name, and a name is an editable cell —
   so anything that wrote to the wrong row silently merged two accounts. It matches on `person_id`
   first, and a name only as a fallback.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */


/* A person may hold SEVERAL roles — a parent who also tutors, an admin who teaches. The cell holds
   a comma list, and one role is not more real than another: every check below asks "does this
   person hold X", never "is this person an X", which is the difference that makes the second role
   work everywhere rather than only where somebody remembered it. */
function rolesOf(row) {
  const list = S(row && row.role).split(/[,\n]/).map(x => norm(x)).filter(Boolean);
  return list.length ? list : ['client'];
}
function hasRole(row, want) { return rolesOf(row).indexOf(norm(want)) !== -1; }
/* Which role the site should treat as their MAIN one when it has to pick just one — the most
   privileged they hold, so an admin who is also a parent gets the admin view. */
function mainRole(row) {
  const r = rolesOf(row);
  return ['admin', 'tutor', 'client', 'student'].find(x => r.indexOf(x) !== -1) || 'client';
}

/* The other half of that cell: the values that are TITLES rather than roles. `mainRole` picks from
   a declared list and cannot return one of these, and `hasRole` is only ever asked about a role
   somebody named — so without this they reach no screen at all, which is a fact typed into the
   sheet that nothing draws. Read off `ROLE_TITLES` rather than "anything mainRole did not pick",
   because that second rule would print a typo in the role cell as somebody's job title. */
function titlesOf(row) {
  return rolesOf(row).map(x => ROLE_TITLES[x]).filter(Boolean);
}

/* ---------- THE THREE SELF-CHOSEN ROLES, AS THE WIDGET SEES THEM -----------------------------------
   Read through `SELF_ROLE_ALIASES`, so `parent` is Client. In `SELF_ROLES`' order, which is the
   order the card draws them and the order `setMyRoles` writes them. An empty cell is `['client']`
   because `rolesOf` says so — the default the whole site already treats an empty cell as. */
function selfRolesOf_(row) {
  const held = rolesOf(row).map(x => SELF_ROLE_ALIASES[x] || x);
  return SELF_ROLES.filter(x => held.indexOf(x) !== -1);
}

/* A TUTOR WHO TICKED THE BOX AND HAS NOT BEEN SAID YES TO — see `LISTED_PENDING`. An admin is never
   pending: they are the person who says yes, so their own tick is its own approval. */
function tutorPending_(row) {
  return !!row && hasRole(row, 'tutor') && !hasRole(row, 'admin')
    && norm(row.listed) === norm(LISTED_PENDING);
}

/* ---------- WHAT A PERSON IS ALLOWED TO ACT AS, WHICH IS NOT ALWAYS WHAT THE CELL SAYS -------------
   `mainRole` picks the most privileged role in the cell, and the cell now takes a tick. So a pending
   tutor's `tutor` is set aside here, and what is left decides. NOTHING LEFT IS `student`, not
   `client`: `rolesOf`'s empty-cell default is right for a row nobody has filled in, and wrong for a
   person whose only claim is one nobody has checked — the least that somebody can do is the right
   answer while the business decides, and a student may reach the admin, which is who they need.
   MESSAGING READS THIS, both ways round — the one gate a tick would otherwise have opened on the
   spot (`tutor → client` is allowed and `student → tutor` is not). */
function actingRole_(row) {
  const r = rolesOf(row).filter(x => !(x === 'tutor' && tutorPending_(row)));
  if (!r.length) return 'student';
  return ['admin', 'tutor', 'client', 'student'].find(x => r.indexOf(x) !== -1) || 'client';
}

/* ---------- THE SESSIONS SOMEBODY IS STILL SITTING IN AS A TUTOR, OR AS A CLIENT -------------------
   WHY UNTICKING HAS TO ASK. Who is in a session is folded from the events (`participantsOf`), not
   from the `role` cell, so dropping Tutor would not take anybody off a roster — it would leave a
   tutor teaching on Tuesday whose own app has stopped calling them one: no staff view, no tutor
   pages, and a family whose tutor reads as nobody. So `setMyRoles` refuses to drop a role while
   this finds a live seat held in it, and says how many.

   LIVE MEANS: a seat that is not Withdrawn, in a job that is not cancelled by its roster, not
   `ended` by `closeFinishedJobs`, and whose last date is not already behind us. Matched by display
   name because that is what an event's `actor` is (see `participantsOf`). */
function liveSeatsAs_(row, role) {
  const name = key(personDisplayName(row));
  if (!name) return [];
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const out = [];
  read(TAB.jobs).rows.forEach(j => {
    const id = S(j.job_id) || String(j._row);
    if (!id || norm(j.status) === 'ended') return;
    const dates = sessionDatesOf(j).map(parseDate).filter(Boolean).sort((a, b) => a - b);
    if (dates.length && dates[dates.length - 1] < today) return;
    if (jobStatusOf(id) === 'cancelled') return;
    const seat = participantsOf(id).find(p => key(p.name) === name && p.role === role
                                            && p.status !== 'Withdrawn');
    if (seat) out.push(id);
  });
  return out;
}

/**
 * Find a person by ID FIRST, then by name.
 *
 * Identity used to be the name, and a name is an editable field — so anything that wrote to the
 * wrong row, or renamed somebody, silently merged two accounts and there was nothing underneath
 * to tell them apart. `person_id` never changes and is never shown, so it can't be edited into a
 * collision. Names remain how people log in; they're just no longer what the site trusts.
 *
 * TWO ARGUMENTS, because eleven handlers already call it with two: `findPerson(body.name,
 * body.personId)`. It took one, so the id was accepted and thrown away — every one of those calls
 * has been matching on the name alone, which is precisely the identity this function exists to
 * stop relying on. The id is tried first when it is given.
 */
function findPerson(nameOrId, altId) {
  const rows = read(TAB.people).rows;
  /* The id, if one was passed and it is an id rather than something else handed in by mistake —
     `myReferral` passes the whole tab object as the second argument, which must not be stringified
     into a search term. */
  const alt = (altId && typeof altId !== 'object') ? key(altId) : '';
  if (alt) {
    const byAlt = rows.find(r => key(r.person_id) === alt);
    if (byAlt) return byAlt;
  }
  const want = key(nameOrId);
  if (!want) return null;
  // An exact id match wins outright.
  const byId = rows.find(r => key(r.person_id) === want);
  if (byId) return byId;
  /* ---------- AND AN E-MAIL ADDRESS, MATCHED AS AN ADDRESS RATHER THAN AS A NAME ------------------
     ASKED FOR AS *"i want people to be able to sign in with email as well."* (`verifyLogin` has
     since stopped calling this at all — it reads the `email` column alone; see there. The rung
     stays, because every other caller of this function may be handed an address.) `verifyLogin` resolved
     through this function and nothing else, so one rung here was the whole of it — and it is the
     last rung, after every name, so nothing that used to resolve can start resolving to somebody
     different.

     `norm` RATHER THAN `key`, AND THAT IS NOT TIDINESS. `key` strips everything that is not a letter
     or a digit, so `alex@dias.com` reduces to `alexdiascom` — and so does a person whose full name
     is "Alex Dias Com". Two different people, one key, and `changePin` then checks the PIN somebody
     typed against the other one's row: the denial this file already records happening once, for
     real, to one person. An address is a machine identifier rather than a name typed with variable
     spacing, so it is compared whole, case-folded and trimmed, and the `@` it must contain is what
     makes that collision impossible rather than merely unlikely.

     A BLANK CELL IS NOT A MATCH. Most rows on this tab have no e-mail; without the guard the first
     of them would answer to an empty search term, which `want` above already refuses — but `norm`
     is a different fold and would not. */
  const mail = norm(nameOrId);
  return rows.find(r =>
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want ||
    (mail.indexOf('@') !== -1 && norm(r.email) === mail)) || null;
}

/* ==================================================================================================
   AN E-MAIL ADDRESS THAT ALREADY ANSWERS TO SOMEBODY ELSE.

   THE MOMENT AN ADDRESS CAN SIGN YOU IN, IT IS A CREDENTIAL, and two rows holding one is the
   `findPerson` denial with a new column in front of it: the first row wins, so the second person
   types their own address and their own PIN and is told the PIN is wrong — confidently, about the
   one thing they are certain of, with no way to argue. That happened once already, by accident,
   because a call forgot to send an id.

   BESIDE `handleRefusal` AND `pricingRefusal_` SO THAT SOMETHING CAN RUN IT. Written inline in
   `updateProfile` it is four lines nothing here can reach, and a rule with no check is the shape
   this repository records every time an instrument could not see its subject. Same three arguments,
   same sentence-not-a-boolean, same reason: "that is taken" is the only useful part.

   NOT A FORMAT CHECK. The box already refuses a shape the browser will not accept, and a stricter
   rule here would refuse real addresses — which is the failure this repository calls the worse of
   the two everywhere it marks an answer. This asks one question: does anybody else already answer
   to it. */
function emailRefusal_(want, me) {
  const mail = norm(want);
  if (!mail) return '';                       // clearing your address is not taking anybody's
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;      // your own row is not a clash
    return !!norm(r.email) && norm(r.email) === mail;
  });
  return clash ? 'That e-mail address is already on another account.' : '';
}

/* ==================================================================================================
   ONE FUNCTION THAT SAYS WHY A HANDLE IS REFUSED, OR NOTHING AT ALL.

   IT RETURNS A SENTENCE, NOT A BOOLEAN, and that is the whole shape. A handler that gets `false`
   back has to invent a reason, and the reason is the only useful part: "that is taken" and "you
   changed it a fortnight ago" and "no, not that word" are three completely different things to be
   told, and a person given the wrong one argues with the wrong thing.

   NOBODY TYPES A HANDLE ANY MORE, AND THE GATE STAYS. *"handles should be their name and a virtuous
   describing word. they can randomise it but it will follow that general name."* — so the box went
   and `handleMake_` is the only thing that asks. What it asks is unchanged: the shape, the reserved
   names, the blocklist (a first name can still carry a word, and the underscore is dropped before
   the fold, so a name and a virtue can meet across it) and the clash. The sentences are read by
   `check-handles.js` now rather than by a person, and they stay sentences for its reason: a case
   that fails should say WHICH rule refused, not that something did.
================================================================================================== */

/* WHAT A HANDLE MEANS RATHER THAN HOW IT IS SPELLED. Case, separators and the digits people
   substitute for letters all come out, so `F_4_G` and `fag` are one string before anything is
   compared. Leaving `0`→`o` and the rest in place would make the blocklist a list of spellings
   rather than a list of words, and a spelling is trivially worked around. */
function handleFold_(v) {
  return String(v == null ? '' : v).toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e').replace(/4/g, 'a')
    .replace(/5/g, 's').replace(/7/g, 't').replace(/8/g, 'b').replace(/9/g, 'g');
}

/**
 * Why `want` may not be this person's handle — '' when it may.
 * `me` is their row, so their own cells are not counted as a clash.
 */
function handleTrouble_(want, me) {
  /* ---------- TWO FORMS, AND WHICH ONE EACH LINE BELOW USES IS THE WHOLE OF IT -------------------
     `shown` IS WHAT WAS ASKED ABOUT and is the only thing quoted back; `raw` is it folded, and every
     comparison in this function uses that. The generator only ever asks in lower case, but a row
     typed into the sheet by hand may say `HaLeX` — and because nothing here compares on the case,
     `halex` is still refused while `HaLeX` exists, which is the guard that stops two accounts
     rendering identically on a site children use. */
  const shown = String(want == null ? '' : want).trim();
  const raw = shown.toLowerCase();
  if (!raw) return 'Type the name you want.';
  if (!HANDLE_SHAPE.test(raw)) {
    return 'A handle is 3 to 20 characters, starts with a letter, and holds only letters, '
         + 'numbers and underscores.';
  }

  const folded = handleFold_(raw);

  if (HANDLE_RESERVED.indexOf(raw) !== -1 || HANDLE_RESERVED.indexOf(folded) !== -1) {
    return '"' + shown + '" is kept for the school\'s own accounts.';
  }

  /* THE ALLOW LIST IS CHECKED FIRST, or `analysis` never gets the chance. A handle that IS one of
     these words, or is one of them with digits or underscores around it, is past the blocklist —
     but `analfun` is not, because it is not that word with decoration, it is a different word. */
  /* ---------- AND THE FIRST VERSION OF THIS LINE LET EVERY BANNED WORD THROUGH -------------------
     IT TESTED THE END WITH `folded.lastIndexOf(w) === folded.length - w.length`, and `lastIndexOf`
     answers -1 when the word is not there. So any handle exactly one character SHORTER than some
     allowed word made -1 === -1 and was waved past: `fuckface` is eight characters, `therapist` is
     nine, and that is the whole of it. Thirteen of the checked cases failed at once — `n1gg3r`
     included — on a rule that reads perfectly and is wrong by an off-by-one in a sentinel value.

     `check-handles.js` FOUND IT ON ITS FIRST RUN, which is the entire argument for writing the
     check before trusting the filter. Nothing about the behaviour was visible from reading it. */
  const innocent = Object.keys(HANDLE_ALLOWED).some(w =>
    folded === w || folded.startsWith(w) || folded.endsWith(w));
  if (!innocent) {
    for (let i = 0; i < HANDLE_BLOCKED.length; i++) {
      if (folded.indexOf(HANDLE_BLOCKED[i]) !== -1) {
        /* THE WORD IS NOT QUOTED BACK. Naming it is repeating it, on a site children read, and the
           person typing it already knows which one it was. */
        return 'That handle has a word in it we do not allow. Pick another.';
      }
    }
  }

  /* ---------- TAKEN, AND AGAINST ALL THREE COLUMNS -----------------------------------------------
     `findPerson` matches `first + last` and `handle`, first row wins — so
     checking `handle` alone would let somebody take a name that already resolves to another person,
     and `changePin` would then check their PIN against that person's row. Everything `findPerson`
     can answer to, this refuses. */
  const mine = me ? key(me.person_id) : '';
  const clash = read(TAB.people).rows.some(r => {
    if (mine && key(r.person_id) === mine) return false;       // your own row is not a clash
    return key(r.handle) === key(raw)
        || key(S(r.first_name) + ' ' + S(r.last_name)) === key(raw);
  });
  if (clash) return '"' + shown + '" is taken.';

  /* ---------- AND NO MONTH, WHICH THERE USED TO BE ----------------------------------------------
     A thirty-day cooldown stood here, and its reason was the typed box: a blocklist is a floor
     rather than a ceiling, so somebody free to rename sits trying variations until a rude one gets
     past it, and a month per attempt is what made that a game nobody wins. With no box there is
     nothing to try variations OF — every handle is a first name and a word off a list somebody
     chose — so the brake has nothing left to brake, and a child who presses Randomise twice is
     simply looking for a word they like. `handle_was` still traces every change. */
  return '';
}

/* ==================================================================================================
   AND A HANDLE IS GENERATED RATHER THAN DERIVED FROM A CHILD'S NAME.

   ASKED FOR AS *"each person should have randomly generated username, handle llik \"@_____\",
   email, first name, last name and username."*

   MEASURED FIRST, AND TWO THINGS WERE WRONG. `register` wrote
   `username: S(first + last).replace(/[^A-Za-z0-9]/g, '')` and **no `handle` at all** — so every
   account made through the form has a blank handle to this day, and `doGet`'s
   `handle || username || first_name` has been showing the squashed name instead.

   AND THAT USERNAME COLLIDES, WHICH IS NOT A TIDINESS FAULT. Two people called John Smith both get
   `JohnSmith`. `findPerson` matches `username` and returns the FIRST row, so the second person
   signs in as the first — and `changePin` then checks the PIN they typed against the other one's
   row and tells them their own PIN is wrong. This file records that denial happening for real, to
   one person, by accident. Nothing guarded it: `handleTrouble_` guarded the rename box of the day
   and was never reached by registration.

   WORDS RATHER THAN THE NAME, AND THAT IS THE SAFEGUARDING HALF. Most of the people on this tab are
   children. A handle built from a real child's full name publishes that name wherever the handle is
   shown — which is exactly what made `ticks_1/2/3` a leak rather than untidiness, and CLAUDE.md
   carries that entry in full. `BrightOtter42` is memorable, sayable down a phone, and says nothing
   about whose it is.

   NAME-PLUS-A-RANDOM-TAIL WAS THE OTHER CANDIDATE AND IT LOSES ON THAT ONE POINT ALONE. It is
   friendlier (`halexdias_4b` is guessable by its owner) and it still prints the child's name. The
   ask said randomly generated; the privacy argument says the same thing, so there is nothing to
   trade.

   `handleTrouble_` IS THE ONE GATE AND THIS GOES THROUGH IT. Shape, the reserved list, the
   blocklist and the clash against every column `findPerson` answers to — a generator with its own
   copy of any of that is the second reader this repository keeps finding.

   ONE COLUMN. `username` was `handle` written a second time and the people tab's redesign dropped
   it, so there is nothing to keep in step: `handle` is the only name a person has here besides
   their own, and the e-mail address is what they sign in with.
================================================================================================ */

/* ---------- A HANDLE IS THEIR FIRST NAME, A VIRTUE AND A NUMBER, IN ANY ORDER ---------------------
   ASKED FOR AS *"nobosy can actually change their handle specifically, they can just hit randomise.
   but it will always be like their first name, a virtuous adjective and random numbers and maybe an
   underscore. but all random order."* So a handle is three parts — the first name, one word off a
   list of virtues, and a two-digit number drawn fresh every time — laid out in one of
   `HANDLE_ORDERS`, with an underscore at one of the two joins about half the time: `halex_kind42`,
   `kindhalex42`, `halex42_kind`, `kind42halex`. All lower case.

   THIS REVERSES 1 OCTOBER, AND SAYS SO. The rule before this one was `<first>_<virtue>` with NO
   number, because `sam_kind10` beside `sam_kind` is one keystroke apart and reads as the same person
   (docs/history 222). The owner has now asked for the number on every handle, and the clash check
   is what still stands between two people who look alike: `handleTrouble_` compares by `key()`,
   which drops the underscore, so `halexkind42` is refused while `halex_kind42` exists. What it does
   NOT refuse is `kindhalex42` beside `halex_kind42` — the same three parts in another order. That
   takes a second Halex who drew the same word AND the same number, and it is the owner's call.

   THE DIGITS ARE NEVER FIRST, which is `HANDLE_SHAPE`'s rule rather than taste: a handle starts with
   a letter. So of the six orders of three parts only the four in `HANDLE_ORDERS` are drawn.

   ONE UNDERSCORE AT MOST, AND THAT IS ARITHMETIC. `HANDLE_SHAPE` allows twenty characters: the
   longest word (8), the number (2) and one underscore leave `HANDLE_FIRST_MAX` = 9 for the name. A
   second underscore would cut every name a letter shorter for a separator nobody asked for — "maybe
   an underscore". Nine keeps `Alexander`, `Charlotte`, `Elizabeth` and `Sebastian` whole, and every
   letter a word gains is a letter cut off a child's name, which is why `thoughtful`, `courageous`
   and `considerate` are not on the list. The first name must START with a letter, so leading digits
   come off; a name with no ASCII letters left (another script) falls back to `HANDLE_FALLBACK`.

   EXISTING HANDLES ARE NOT REGENERATED. A `halex_kind` made on 1 October is still the shape — see
   `handleParts_`, which reads every arrangement and the old two-part one — so `?run=renameHandles`
   leaves it alone, and nobody's sign-in name moves until they press Randomise themselves. That
   matters because a child with no e-mail signs in WITH the handle.

   THE FIRST NAME REVERSES A SAFEGUARDING ARGUMENT THIS FILE USED TO MAKE, AND SAYS SO. The older
   generator used words rather than the name because a handle built from a child's FULL name
   publishes it wherever the handle is shown. A FIRST name is what the owner asked for, three times
   now, and is much less than a full name, and cards already draw it — but it is not nothing, and it
   is the owner's call rather than this file's.

   EVERY WORD IS A VIRTUE A PARENT WOULD BE HAPPY TO SEE BESIDE THEIR CHILD'S NAME, and nothing else
   is: no colour, no mood, no luck. That is a judgement and it is written here because no check can
   make it. What a check CAN make is the rest — `check-handles.js` puts every word, in every order
   and with every number, through `handleTrouble_` beside a spread of first names, because the
   blocklist folds digits onto letters and drops the underscore, so a name, a number and a word can
   meet across the joins. Those are refused and the generator draws again, which is why it walks
   rather than draws once.

   THE FALLBACK IS ALSO WHERE A FIRST NAME THE BLOCKLIST REFUSES GOES. Every candidate built on it
   carries the refused word, so every draw fails; the same walk is then made on the fallback, which
   keeps the shape asked for with a neutral word where the name would be. */
const HANDLE_ADJ = ['kind', 'brave', 'honest', 'patient', 'gentle', 'loyal', 'humble', 'wise',
                    'fair', 'caring', 'cheerful', 'hopeful', 'generous', 'grateful', 'faithful',
                    'joyful', 'calm', 'steady', 'true', 'careful', 'polite', 'helpful', 'bold',
                    'sincere', 'modest', 'noble', 'diligent', 'earnest', 'upright', 'valiant'];
const HANDLE_FIRST_MAX = 9;
const HANDLE_FALLBACK = 'friend';
/* THE NUMBER: ten to ninety-nine, so it is always two digits. A single digit would make `kind7` and
   `kind70` two handles one keystroke apart, and a fixed width is what lets `handleParts_` find
   where a name that ends in a digit stops. */
const HANDLE_TAIL_MIN = 10, HANDLE_TAIL_MAX = 99;
/* THE ORDERS A HANDLE IS DRAWN IN — every arrangement of the three parts that does not start with
   the number. Named once, because the generator draws from it and `handleParts_` reads by it, and
   two lists of one rule are two rules the day one of them changes. */
const HANDLE_ORDERS = [['first', 'virtue', 'nn'], ['virtue', 'first', 'nn'],
                       ['first', 'nn', 'virtue'], ['virtue', 'nn', 'first']];
/* HOW OFTEN THERE IS AN UNDERSCORE — "maybe an underscore". Half the draws have none; the other
   half have one, at either join with the same chance. */
const HANDLE_UNDERSCORE_ODDS = 0.5;
/* HOW MANY CANDIDATES A HEAD GETS before the walk moves to the fallback: every word on the list
   twice, each with its own number, order and underscore. With 4 orders × 90 numbers × 3 joins per
   word nothing on an ordinary tab is close to running out — the bound is there so a gate that has
   started refusing everything is reported rather than spun on. */
const HANDLE_TRIES = 2 * HANDLE_ADJ.length;
/* HOW MANY EARLIER HANDLES `handle_was` KEEPS. There is no cooldown now, so somebody can press
   Randomise all afternoon — the cell keeps the newest ten rather than growing for ever, which is
   enough to answer "who was @foo last week" about anybody who has not pressed it eleven times since,
   and every one of the eleven was a first name, a word off this list and a number. */
const HANDLE_WAS_KEEP = 10;

/** The first-name part of a handle: lower-case ASCII letters and digits, starting with a letter,
    at most `HANDLE_FIRST_MAX` long. '' when nothing usable is left. */
function handleFirst_(first) {
  return String(first == null ? '' : first).toLowerCase()
    .replace(/[^a-z0-9]/g, '').replace(/^[0-9]+/, '').slice(0, HANDLE_FIRST_MAX);
}

/** The pieces of a handle in the generated shape — `{ head, word, tail, order }` — or null.
    Any order in `HANDLE_ORDERS`, AND the two-part `<first>_<virtue>` of 1 October with or without
    its old tail, which is what keeps every handle made before this reading as the shape. One
    underscore at most, at a join; the fallback where the name would be.

    ONE READER, because `handleIsShaped_` and `renameHandles` both need it and two regexes for one
    shape are two shapes the day one of them changes. BUILT FROM THE LISTS rather than written as a
    pattern of letters: `kindhalex42` has no separator to split on, so the only way to find where the
    virtue ends is to know the virtues — and a regex of alternatives backtracks, so a first name that
    is itself on the list (somebody called True) is still read the right way round. */
function handleParts_(h, first) {
  const s = String(h == null ? '' : h);
  if (!s || (s.match(/_/g) || []).length > 1) return null;
  const heads = [handleFirst_(first), HANDLE_FALLBACK].filter(Boolean);
  const part = { first: '(' + heads.join('|') + ')', virtue: '(' + HANDLE_ADJ.join('|') + ')',
                 nn: '(\\d{2})' };
  const orders = HANDLE_ORDERS.concat([['first', 'virtue']]);
  for (let i = 0; i < orders.length; i++) {
    const m = s.match(new RegExp('^' + orders[i].map(p => part[p]).join('_?') + '$'));
    if (!m) continue;
    const got = { head: '', word: '', tail: '', order: orders[i].join('-') };
    orders[i].forEach((p, j) => {
      if (p === 'first') got.head = m[j + 1];
      else if (p === 'virtue') got.word = m[j + 1];
      else got.tail = m[j + 1];
    });
    if (got.tail && (+got.tail < HANDLE_TAIL_MIN || +got.tail > HANDLE_TAIL_MAX)) continue;
    return got;
  }
  return null;
}

/** Does `h` already have the generated shape for somebody called `first`? Every arrangement, and
    the 1 October `<first>_<virtue>` — `?run=renameHandles` leaves all of them alone. */
function handleIsShaped_(h, first) {
  return !!handleParts_(h, first);
}

/* ---------- THE ROWS A TYPED HANDLE IS, FOR SIGNING IN AND FOR A FORGOTTEN PIN ----------------------
   ONE READER FOR THE TWO DOORS THAT TAKE A HANDLE, because `verifyLogin` and `forgotPin` each had the
   line and a fix made in one would not be in the other. `key` folds case and drops `_` and `@`, so
   `@Halex_Kind42` and `halexkind42` are one handle.

   AND A LONG FIRST NAME SPELLED OUT. `handleFirst_` keeps nine letters, so Christopher is
   `uprightchristoph_71` — and a child types their own name the way they spell it, and
   `uprightchristopher_71` was "Sign in with the email on your account — or your handle". The same
   handle with the whole first name where the nine letters are answers too. It is the same person's
   name, so it opens nobody else's row; and it is asked only of a row whose handle IS in the shape,
   so a handle somebody typed by hand is compared as it stands. */
function handleRows_(rows, typed) {
  const want = key(typed);
  if (!want) return [];
  return (rows || []).filter(r => {
    const have = key(r.handle);
    if (!have) return false;
    if (have === want) return true;
    const cut = handleFirst_(r.first_name);
    const whole = String(r.first_name == null ? '' : r.first_name).toLowerCase()
      .replace(/[^a-z0-9]/g, '').replace(/^[0-9]+/, '');
    if (!cut || whole.length <= cut.length || !handleParts_(r.handle, r.first_name)) return false;
    return have.replace(cut, whole) === want;
  });
}

/** The list in a random order. Fisher–Yates, because `sort(() => Math.random() - 0.5)` is the
    famous wrong one: it does not give every order the same chance. */
function handleShuffle_(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const x = a[i]; a[i] = a[j]; a[j] = x;
  }
  return a;
}

/** One candidate: `head` and `word`, a fresh number, a random order from `HANDLE_ORDERS` and maybe
    one underscore. Nothing is asked of the gate here — `handleMake_` does that. */
function handleDraw_(head, word) {
  const pick = n => Math.floor(Math.random() * n);
  const nn = String(HANDLE_TAIL_MIN + pick(HANDLE_TAIL_MAX - HANDLE_TAIL_MIN + 1));
  const order = HANDLE_ORDERS[pick(HANDLE_ORDERS.length)];
  const parts = order.map(p => (p === 'first' ? head : p === 'virtue' ? word : nn));
  const join = Math.random() < HANDLE_UNDERSCORE_ODDS ? pick(parts.length - 1) : -1;
  return parts.map((p, i) => (i && i - 1 === join ? '_' : '') + p).join('');
}

/**
 * A handle nobody has, or '' if one could not be found.
 *
 * `me` is the row it is FOR, so that row's own cells are not counted as a clash — pass null for a
 * row that does not exist yet. `first` is the first name to build it from; left out, it is read off
 * `me`. `avoid` is a handle it must not hand back — the one somebody pressing Randomise already
 * has, which the clash check cannot refuse because it is their own. Nothing is written here: the
 * caller decides, because `register` writes it into a row it is building and the others into one
 * that exists.
 *
 * A FRESH DRAW EVERY TIME, NOT THE SMALLEST FREE NUMBER. The walk is the words in a random order,
 * round twice (`HANDLE_TRIES`), each candidate with its own number, order and underscore — for the
 * name and then the fallback. It gives up rather than looping: a gate that has started refusing
 * everything is a fault to report, not to spin on.
 */
function handleMake_(me, first, avoid) {
  const name = handleFirst_(first !== undefined ? first : (me && me.first_name));
  const heads = name ? [name, HANDLE_FALLBACK] : [HANDLE_FALLBACK];
  const skip = key(avoid);
  const free = want => key(want) !== skip && !handleTrouble_(want, me || null);
  for (let h = 0; h < heads.length; h++) {
    const words = handleShuffle_(HANDLE_ADJ);
    for (let i = 0; i < HANDLE_TRIES; i++) {
      const want = handleDraw_(heads[h], words[i % words.length]);
      if (free(want)) return want;
    }
  }
  return '';
}

/* `handleBareFree_` WAS HERE. It asked whether a handle WITHOUT a number was free, because on
   1 October a number was only right when every bare word was taken and `renameHandles` stripped
   one that was no longer needed. A number is on every handle now, so that question would strip the
   number off every handle Randomise makes — it went rather than stay as a rule nothing should ask. */

/** `handle_was` with `was` added at the front: newest first, comma-separated, the last
    `HANDLE_WAS_KEEP`. Nothing is de-duplicated — a history that says somebody went back to an
    earlier handle is a true history. */
function handleWasWith_(cell, was) {
  const list = String(cell == null ? '' : cell).split(',').map(x => x.trim()).filter(Boolean);
  if (String(was == null ? '' : was).trim()) list.unshift(String(was).trim());
  return list.slice(0, HANDLE_WAS_KEEP).join(', ');
}

/* ==================================================================================================
   AND WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER.

   ASKED FOR AS *"only let tutors change thier rate, min number of kids and max number of kids willing
   to work with and fraction extra rate all together. and they can only change once a month."* None of
   the four is a preference: `priceFrom` builds the price from `rate_per_hour` and `extra_seat_rate`,
   `seatLimits` offers the seat count from `max_students` and `min_students`, and every booking already
   taken was priced and seated against whatever they said on the day.

   ONE CLOCK FOR THE FOUR, WHICH IS WHAT *"ALL TOGETHER"* MEANS. A stamp each would be four clocks and
   a tutor could walk round them a week at a time — raise the rate on Monday, the extra-seat fraction
   next Monday — which is the arms race the handle cooldown was written against while a handle could
   be typed (it went with the box; see `handleTrouble_`, and these four ARE typed). `PRICING_FIELDS`
   in `constants.gs` is that list, and `PROFILE_GROUPS` builds the one page from the same constant, so
   the page and this rule cannot disagree about which fields are the quote.

   A FUNCTION BESIDE `handleRefusal` RATHER THAN SIX LINES INSIDE `updateProfile`, and that is about
   what can be CHECKED. `check-handles.js` cuts functions out of these files by name and runs them;
   a rule written inside a request handler is a rule nothing here can reach, and this repository's
   own sentence is that a check which cannot reach its subject is not a check. Same file as the
   handle rule and the same shape — the row and what is wanted, plus here whether the asker is an
   admin, which the handle rule stopped needing when its cooldown went — so the two read alike.

   IT TAKES THE WHOLE `fields` OBJECT WHERE THE HANDLE RULE TAKES ONE VALUE, because the question is
   *has any of the four moved* and only the posted object can answer it.

   AND IT ANSWERS '' FOR A CHANGE THAT IS NOT ONE. That page posts all four every time it is saved,
   whether or not any was touched, so a rule firing on a field being PRESENT would refuse a save of
   the boxes beside it for a month over a number nobody edited. That is the fault this handler already
   paid for once, where a blank box was written back over every profile field on the first press of
   Save — and it is why `pricingMoved_` compares values rather than counting keys.
================================================================================================== */
function pricingMoved_(me, fields) {
  if (!me || !fields) return [];
  /* `N` ON BOTH SIDES, so `'4'` off a form and `4` off a sheet are the same answer. All four of these
     are numbers — two counts and two money figures — and a string compare would refuse every save. */
  return PRICING_FIELDS.filter(f => Object.prototype.hasOwnProperty.call(fields, f)
                                 && N(fields[f]) !== N(me[f]));
}

function pricingRefusal_(me, fields, isAdmin) {
  if (!me) return '';
  if (!pricingMoved_(me, fields).length) return '';   // nothing moved: not a change at all
  /* TWO SHAPES THE PRICE CANNOT USE, refused for an admin too. `seatShare_` reads the extra-seat
     figure as a SHARE of the rate and treats anything outside 0–2 as nothing, so `15` typed as
     pounds saved without complaint and charged nothing per seat. And a minimum above the maximum is
     a class nobody can book. Only when something moved, like the rule below. */
  const got = f => Object.prototype.hasOwnProperty.call(fields, f) ? fields[f] : me[f];
  const seat = S(got('extra_seat_rate'));
  if (seat !== '' && !(N(seat) >= 0 && N(seat) <= 2 && !isNaN(Number(seat)))) {
    return 'The extra-seat rate is a share of your hourly rate, from 0 to 2 — 0.5 means half your rate '
         + 'for each extra student. Nothing was saved.';
  }
  const lo = S(got('min_students')), hi = S(got('max_students'));
  if (lo !== '' && hi !== '' && N(lo) > N(hi)) {
    return 'The fewest students (' + lo + ') is more than the most (' + hi + '). Nothing was saved.';
  }
  /* AN ADMIN FIXING A TUTOR'S RATE OR CAP IS THE REMEDY RATHER THAN THE THING BEING BRAKED — the
     same exemption, for the same reason, the handle cooldown had while there was one. */
  if (isAdmin) return '';
  /* ONE DATE AND NO COUNTER: the rule is "has a month passed", and a row that has never changed has
     no cell and is free. */
  const last = sheetDate(me.pricing_changed_at);
  if (!last) return '';
  const next = new Date(last.getTime() + PRICING_COOLDOWN_DAYS * 864e5);
  if (next <= new Date()) return '';
  /* WHAT IT SAYS IS THE GROUP, NOT THE FIELD THAT HAPPENED TO MOVE. Naming one of the four would
     read as an invitation to change the other three, which is exactly what one clock refuses. */
  return 'You changed what you charge and the class sizes you take on ' + fmtDate(last)
       + '. You can change them again on ' + fmtDate(next) + '. Nothing was saved.';
}

/* ==================================================================================================
   THE AGES A TUTOR TEACHES — ONE READER, AND A REFUSAL ASKED BEFORE ANYTHING IS WRITTEN.

   `ageRank_` TURNS A CELL INTO SOMETHING THAT CAN BE COMPARED: a whole number, `Infinity` for an adult
   learner, `null` for an end nobody has answered, and `NaN` for a cell holding something else. The
   word is read loosely — `adults`, `Adult` and `18+` all mean the same thing when typed into the sheet
   by hand — because a reader that only knew the form's own spelling would print a hand-typed row as
   nothing. NOUGHT IS UNANSWERED, NOT AN AGE: a blank numeric cell reads as 0 in more than one place in
   this project, and "age 0" on a public card is the `cost: 0` shape again.

   `ageOut_` IS WHAT THE PAYLOAD SENDS: the number, `Adults`, or '' — so the phone's card never has to
   know there was ever a second spelling.

   `ageRefusal_` IS ASKED ONLY WHEN AN END MOVED, which is `pricingMoved_`'s rule and for its reason:
   About you posts both ends on every save, and the select keeps a hand-typed value that is not on the
   list as its own first option. A rule firing on a value being PRESENT would refuse a headline because
   somebody once typed "3" into the sheet. What moved must be on `AGE_OPTIONS` — the form cannot
   produce anything else, which is not a reason to trust it, since `doPost` is reachable by anybody
   with the URL — and the youngest may not be older than the oldest. An admin is not exempt: neither
   rule is a brake on a person, both are about whether the range means anything.

   BESIDE `pricingRefusal_` RATHER THAN INSIDE `updateProfile`, so `check-profile.js` reaches it
   through the real `doPost` and something can say it works.
================================================================================================== */
function ageRank_(v) {
  const s = S(v);
  if (!s) return null;
  if (/^adults?$/i.test(s) || /^18\s*\+$/.test(s)) return Infinity;
  if (!/^\d{1,3}$/.test(s)) return NaN;
  return Number(s) || null;
}

function ageOut_(v) {
  const n = ageRank_(v);
  return n === Infinity ? 'Adults' : (n == null || isNaN(n)) ? '' : n;
}

function ageRefusal_(me, asked) {
  if (!me || !asked) return '';
  const has = f => Object.prototype.hasOwnProperty.call(asked, f);
  const moved = AGE_FIELDS.filter(f => has(f) && S(asked[f]) !== S(me[f]));
  if (!moved.length) return '';
  const end = f => f === 'age_min' ? 'youngest' : 'oldest';
  const off = moved.find(f => S(asked[f]) !== '' && !AGE_OPTIONS.some(o => norm(o) === norm(asked[f])));
  if (off) {
    return 'The ' + end(off) + ' age has to be one from the list — ' + AGE_OPTIONS[0] + ' to '
         + AGE_OPTIONS[AGE_OPTIONS.length - 2] + ', or ' + AGE_OPTIONS[AGE_OPTIONS.length - 1]
         + '. Nothing was saved.';
  }
  const got = f => has(f) ? asked[f] : me[f];
  const lo = ageRank_(got('age_min')), hi = ageRank_(got('age_max'));
  if (lo != null && hi != null && !isNaN(lo) && !isNaN(hi) && lo > hi) {
    return 'The youngest age you teach (' + ageOut_(got('age_min')) + ') is older than the oldest ('
         + ageOut_(got('age_max')) + '). Nothing was saved.';
  }
  return '';
}


/** Every row that answers to this name — so a collision can be SEEN rather than silently resolved. */
function peopleNamed(name) {
  const want = key(name);
  if (!want) return [];
  return read(TAB.people).rows.filter(r =>
    key(r.person_id) === want ||
    key(S(r.first_name) + ' ' + S(r.last_name)) === want ||
    key(r.handle) === want);
}

/** Give every row a permanent id. Rows that predate this have none, which is how they were
    identified by name in the first place. Idempotent; never changes an id that exists. */
function ensurePersonIds() {
  const t = read(TAB.people);
  const c = t.headers.indexOf('person_id');
  if (c < 0) return 0;
  const last = t.sheet ? t.sheet.getLastRow() : 0;
  if (last < 2) return 0;

  /* Batched for the same reason the resources are. Fifteen people is not four hundred rows, but a
     write per row is a round trip per row whatever the count, and this runs on the first request
     after every deploy now. */
  const ids = t.sheet.getRange(2, c + 1, last - 1, 1).getValues();
  const stamp = Date.now();
  let added = 0;
  for (let i = 0; i < ids.length; i++) {
    if (String(ids[i][0]).trim()) continue;
    ids[i][0] = 'P' + stamp + '-' + i;
    added++;
  }
  if (added) t.sheet.getRange(2, c + 1, last - 1, 1).setValues(ids);
  clearCache();
  return added;
}

function isAdminPerson(name) {
  const p = findPerson(name);
  return !!p && hasRole(p, 'admin');
}

/* `childrenOf` read the `children` cell and nothing else. It is above, reading the family tab
   first — see the note there on why two sources became one. */

/* ---------- `countTicks` WAS HERE ----------------------------------------------------------------
   IT COUNTED A PERSON'S HANDLE across `ticks_1..3` on every document row, and it was right to: the
   version before it counted the same three column names on the PERSON'S row, which nothing has ever
   written to, so a student could work through the whole library and the total stayed 0 for ever.

   BOTH TABS ARE NOW WRONG PLACES TO LOOK. The document rows left the spreadsheet with the rest of
   `questions`, and the three tick columns were stripped out of `data/questions.json` before it was
   committed — they held the handles of real children and this repository is public. So there is
   nothing to count, and the two callers (`redeem`, and `ticks:` on the login reply) are gone rather
   than being handed a permanent zero. See dopost.gs for both. */

/**
 * WHAT THE BUSINESS IS CALLED.
 *
 * From the brand tab, with the obvious fallback — so the name on a post follows the one place it
 * is written down, and changing it is a cell rather than a search through the source.
 */
function brandName() {
  /* THE NAME CAME OFF THE `brand` TAB AND THAT TAB IS `data/settings/brand.json` NOW. The phone
     reads it; this cannot, because Apps Script has no way into a file in git. `BRAND_NAME` is the
     same string the fallback always was, in one place, so an e-mail and a post signature cannot
     disagree — and changing it is the one line in constants.gs rather than a cell. */
  return BRAND_NAME;
}

/** May this person write to that one? Roles in the SHEET's words. */
function mayMessage(fromRole, toRole) {
  const f = norm(fromRole), t = norm(toRole);
  return !!(MESSAGING[f] && MESSAGING[f][t]);
}

/** What the app calls this role. */
function toAppRole(sheetRole) {
  const r = norm(sheetRole);
  return ROLE_TO_APP[r] || r;
}

/* `toSheetRole` was here — the way back from the app's words to the sheet's, `parent` to `client`.
   Written as the pair of `toAppRole` for symmetry and never needed: values travel sheet-to-app and
   are written back by name, never translated in reverse. `ROLE_FROM_APP` stays in the constants,
   which is where the mapping belongs if it is ever wanted. */


/* ---------- WHO IS RELATED TO WHOM -------------------------------------------------------------
   Read from the `family` tab, and ONLY where the child accepted. A row that was asked and never
   answered is a request, not a relationship — treating the two the same is how a claim becomes a
   fact without anybody agreeing to it.

   ONE siblingsOf, taking a person_id. There were two: an older one reading the parent's `children`
   cell and taking a ROW, and this one taking an ID. The second overwrote the first, and the two
   callers still passing a row were handing an object to `S()` — which stringifies it to
   "[object Object]", matches nobody, and returns an empty list. Every student on the site has had
   no siblings since, silently.
--------------------------------------------------------------------------------------------- */
function acceptedLinks() {
  return read(TAB.family).rows.filter(r => norm(r.state) === 'accepted');
}

/**
 * WRITE THE FAMILIES WE ALREADY KNOW INTO THE FAMILY TAB.
 *
 * Idempotent, and careful about the one case that matters: a link that ALREADY EXISTS is left
 * exactly as it is, whatever it says. A child who refused stays refused — this is a seeder filling
 * in what nobody has answered, not a thing that overrules an answer.
 *
 * Reports what it could not match rather than skipping quietly. A name in `KNOWN_FAMILIES` that
 * matches nobody is a typo in a list I wrote by hand, and a seeder that silently does nothing is
 * the fault this whole file keeps producing.
 */
function seedFamilies() {
  const t = read(TAB.family);
  if (!t.sheet) return { error: 'no family tab — run ensureSchema()' };

  const made = [], had = [], missing = [];
  Object.keys(KNOWN_FAMILIES).forEach(parentName => {
    const parent = findPerson(parentName);
    if (!parent) { missing.push('no parent called ' + parentName); return; }

    KNOWN_FAMILIES[parentName].forEach(childName => {
      const child = findPerson(childName);
      if (!child) { missing.push('no child called ' + childName); return; }

      const already = t.rows.find(r => S(r.parent_id) === S(parent.person_id)
                                    && S(r.child_id) === S(child.person_id));
      if (already) { had.push(childName + ' → ' + parentName + ' (' + S(already.state) + ')'); return; }

      addRow(t, {
        link_id: 'F' + Date.now() + '-' + made.length,
        parent_id: S(parent.person_id),
        child_id: S(child.person_id),
        child_typed: personDisplayName(child),
        state: 'accepted',
        asked_on: new Date(),
        answered_on: new Date(),
      });
      made.push(childName + ' → ' + parentName);
    });
  });

  clearCache();
  const out = { linked: made, alreadyThere: had, couldNotFind: missing };
  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/**
 * A PARENT'S CHILDREN, FROM THE ONE PLACE THAT HOLDS THEM.
 *
 * This read the `children` CELL on the parent's row — a comma list of names typed by hand — while
 * `acceptedChildren` read the family tab. Two answers to one question, and they could disagree
 * without either being obviously wrong: a link accepted on the tab and a stale name in the cell,
 * or the reverse.
 *
 * The family tab wins and the cell is a FALLBACK, for a sheet that has names typed in and no links
 * made yet. Once `seedFamilies` has run there is nothing in the cell that is not on the tab, and
 * the fallback stops mattering — which is the right way for two sources to become one: the weaker
 * one goes quiet rather than being deleted out from under somebody.
 */
/* ---------- RENAMED, BECAUSE THERE WERE TWO `childrenOf` AND THIS ONE NEVER RAN -------------------
   `people.gs` DECLARED `childrenOf` TWICE — this one at line 248 taking a person ROW and returning
   NAMES, and another 34 lines below taking a parent ID and returning ROWS. Apps Script has one
   global scope, so the second silently replaced the first, and CLAUDE.md has carried "not yet
   fixed; be careful around it" ever since.

   THE TWO CALLERS WANTED DIFFERENT THINGS, which is what made it more than untidy:

     doget.gs:544    childrenOf(S(r.person_id)).map(personDisplayName)   wants the ID version
     dopost.gs:3018  out.kids = childrenOf(r)                            wants THIS one

   The second was handed a row where the survivor expects an id, so `S(parentId)` on an object
   matched nothing and `out.kids` has been an empty list for every parent signing in, for as long as
   both have existed. Nothing failed and nothing said so — the same shape as a key the backend never
   sends, which `|| []` turns into an empty database.

   NAMED FOR WHAT IT RETURNS. `childrenOf` returns people; `childNamesOf` returns names. Two
   functions one letter apart would be the same trap with a longer fuse, and the thing that
   distinguishes them is not the argument but the answer. */
function childNamesOf(personRow) {
  const linked = acceptedChildren(S(personRow && personRow.person_id)).map(personDisplayName);
  if (linked.length) return linked;
  return S(personRow && personRow.children).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
}

/** The children who accepted this parent. */
function acceptedChildren(personId) {
  const ids = acceptedLinks().filter(r => S(r.parent_id) === S(personId)).map(r => S(r.child_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** The parents this child accepted. */
function acceptedParents(personId) {
  const ids = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/** Everyone who shares a parent with this child — themselves excluded. */
function siblingsOf(personId) {
  const parents = acceptedLinks().filter(r => S(r.child_id) === S(personId)).map(r => S(r.parent_id));
  const ids = [...new Set(acceptedLinks()
    .filter(r => parents.indexOf(S(r.parent_id)) !== -1 && S(r.child_id) !== S(personId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/* THE CHILDREN ON SOMEBODY'S ACCOUNT. The mirror of `siblingsOf`, walking the same accepted links
   the other way — parent to child rather than child to sibling.

   WRITTEN BECAUSE THE BOOKING FORM COULD ONLY EVER ASK ABOUT THE SIGNED-IN PERSON'S CHILDREN. An
   admin booking on behalf of a family was offered their OWN children, or told there were none, and
   no amount of choosing a client changed it — the question read `USER.children` and a client is not
   the user. */
function childrenOf(parentId) {
  const ids = [...new Set(acceptedLinks()
    .filter(r => S(r.parent_id) === S(parentId))
    .map(r => S(r.child_id)))];
  return ids.map(id => findPerson(id)).filter(Boolean);
}

/* FIRST AND LAST, AND NOTHING ELSE. `full_name` was the same fact typed a third time and the people
   tab's redesign dropped it — see `SCHEMA.people`. */
function personDisplayName(r) {
  return (S(r.first_name) + ' ' + S(r.last_name)).trim();
}

/**
 * WHOEVER IS ACTUALLY REACHABLE as an admin.
 *
 * ADMIN_NAME first, because it names the account these messages are addressed to. But a name is
 * an editable cell: rename the row, drop the admin role from it, or leave its email blank, and
 * every notification about a print order or a reported message goes nowhere and says nothing.
 * So if that row cannot be reached, ANY admin with an address will do — a message delivered to
 * the wrong admin is recoverable, and one delivered to nobody is not.
 */
function adminName_() {
  const named = findPerson(ADMIN_NAME);
  if (named && S(named.email) && hasRole(named, 'admin')) return personDisplayName(named);
  const other = read(TAB.people).rows.find(r => hasRole(r, 'admin') && S(r.email));
  return other ? personDisplayName(other) : ADMIN_NAME;
}

/* ---------- AN ADDRESS NOBODY HAS PROVED REACHES THIS PERSON ------------------------------------------
   `verified=PENDING` is a sign-up whose address nobody has proved yet — not by its link, not by Google,
   not by typing back the emailed PIN. A typo'd address, as often as not, which is a stranger's inbox,
   or somebody else's address typed by whoever wanted the account. Blank is a row from before
   confirmation existed, and is not pending.

   ONE READER, because the rule was kept in one place only. The digest skipped a PENDING address
   (280); `notify`, the make-child email and the too-many-guesses warning did not — and once the owner
   asked that *"dont make them have to need to verify their email to login"* (6 Oct), an account on a
   mistyped address could sign in, book and make a child, and every booking notice, the child's handle
   and "PIN changed" went to the stranger (PR #130 review). Every mail to a person's own address asks
   this now, except the two that exist to reach an unproved one: the confirmation link (`register`,
   `resendLink`) and "Forgotten your PIN?", which is how the address's owner proves it and takes the
   account.

   ---------- AND NO CHILD IS TIED TO AN ACCOUNT EXCEPT THROUGH A CONFIRMED ADDRESS ------------------
   Holding the mail back was round one, and the review of it found the typo still worked: the parent
   on jsmith1@ made a child, the stranger who owns jsmith1@ pressed "Forgotten your PIN?" — which must
   go to a PENDING address, or the real owner of a squatted one could never take it back — signed in
   as the parent and reset the child's PIN. Neither half can give way, so the CHILD is what waits:
   `makeChild`, `claimChild`, a child's yes in `answerClaim`, a grown-up's link in `verifyEmail`, a
   parent's `resetPin` and an admin's `linkChild` all ask this of the parent's row and refuse while it
   is PENDING (`confirmFirst_`). An account on an unproved address signs in and books — it holds no child, so
   whoever proves that address owns nothing of anybody else's. */
function addressPending_(r) { return S(r && r.verified).toUpperCase() === 'PENDING'; }

/* THE ADDRESS THE PHONE IS TOLD IS WAITING, or blank (`pendingEmail` on the sign-in reply and on
   `myProfile`). Only the row's OWN address: a no-email child's PENDING is about the grown-up's address,
   which is not theirs to be sent a link to, and no mail of theirs is held because they have none. */
function pendingEmailOf_(r) { return addressPending_(r) ? S(r && r.email) : ''; }

/* ---------- "OPEN THE LINK FIRST": THE ONE ANSWER TO A CHILD-BINDING ACTION FROM AN UNPROVED ADDRESS ------
   One sentence for every refusal above, so a parent hears the same next step whichever door they
   tried, with the address IN it — the address is the whole of what is wrong when it is a typo, and
   "check your inbox" said to somebody whose inbox it is not is a sentence they cannot act on.
   `why` and `pendingEmail` are for the phone: it draws the held card from them (me.js). */
function confirmFirst_(r, then) {
  const at = S(r && r.email);
  return { error: 'Open the link we emailed to ' + (at || 'your address') + ' first — then ' + then
                  + '. "Send the link again" is on your card if it never came.',
           why: 'unconfirmed', pendingEmail: at };
}

/** Send an email. Skips silently when there's no address — a missing email must not break a move. */
function notify(name, subject, body) {
  try {
    const p = findPerson(name);
    const to = p ? S(p.email) : '';
    if (!to) return false;
    /* NOT TO AN ADDRESS NOBODY CONFIRMED — see `addressPending_`. False, as for no address: the caller
       carries on either way, and a booking notice in a stranger's inbox is the worse of the two. */
    if (addressPending_(p)) return false;
    MailApp.sendEmail({ to, subject, body, name: '@family.' });
    return true;
  } catch (err) {
    return false;
  }
}

/* The catalogue as the SHEET has it, falling back to the code list until the tab is seeded.
   `art_id` is what the drawing table is keyed on, so renaming an item in the sheet changes what
   it's called without changing what it looks like — the two are different questions. */
function avatarCatalogue() {
  const rows = read(TAB.shop).rows.filter(r => norm(r.kind) === 'avatar' && S(r.art_id) && S(r.slot));
  const fromShop = rows.map(r => ({
    id: S(r.art_id), slot: norm(r.slot), name: S(r.name) || S(r.art_id),
    /* ---------- `r.price` IS NOT A COLUMN OF THIS TAB --------------------------------------------
       THE SHOP TAB PRICES IN THREE CURRENCIES — `price_pence`, `price_ticks`, `price_coins` — and
       has never had a bare `price`. So `N(r.price)` was `N(undefined)`, which is 0, on every row:
       every avatar item arrived costing nothing AND flagged `free`, including the seven that carry
       a `price_coins` of 15, 20 or 30. Paid items, given away, silently.

       `price_coins` is the one, because this is the wardrobe and `find.js` renders `x.cost` as
       "credits" — the same column the shop's own price line reads first in `doget.gs`.

       `check-columns.js` COULD NOT SEE THIS: it asks whether a name is a column of ANY tab, and
       `price` is one — on `resources`, where it means something else entirely. `check-rows.js`
       asks it of the tab the row actually came from, and this was the first thing it found. */
    level: N(r.level_required) || 0, cost: N(r.price_coins) || 0,
    free: !N(r.level_required) && !N(r.price_coins), _row: r._row
  }));

  /* THE FREE ITEMS ARE ALWAYS IN, whether or not the shop knows about them.

     `seedAvatarItems` deliberately writes only the ones that cost something — a shop row for
     "Nothing" at £0 would be a shop selling the absence of a hat. Perfectly reasonable, and it
     meant that the moment the shop was seeded this function stopped returning `none`, `crop` and
     `plain` at all. Those are the DEFAULTS every figure starts in, so `saveAvatar` then refused
     every single save with "No such item: hair/crop", including from somebody changing nothing but
     their skin colour. The wardrobe worked right up until the shop existed.

     Merged rather than either-or: the shop is the authority on anything it lists, and the code
     list supplies whatever it does not. */
  const have = {};
  fromShop.forEach(x => { have[x.slot + ':' + x.id] = true; });
  const missing = AVATAR_ITEMS.filter(it => !have[norm(it.slot) + ':' + it.id])
    .map(it => ({ id: it.id, slot: norm(it.slot), name: it.name,
                  level: it.level || 0, cost: it.cost || 0,
                  free: !!it.free || (!it.level && !it.cost), _row: 0 }));

  return fromShop.concat(missing);
}

/** Everything this person may wear right now, and why. */
function avatarUnlocks(row) {
  const level = levelFromXp(N(row.xp));
  const owned = S(row.avatar_owned).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
  return avatarCatalogue().map(it => ({
    id: it.id, slot: it.slot, name: it.name,
    level: it.level || 0, cost: it.cost || 0,
    unlocked: !!it.free || (it.level && level >= it.level) || owned.indexOf(it.slot + ':' + it.id) !== -1,
    row: it._row || 0
  }));
}

/** Ten ticked topics is one level. Whole levels only — the same rule the card shows. */
function levelFromXp(xp) { return Math.floor((N(xp) || 0) / 10); }