/* ==================================================================================================
   @family. — 70_doPost.gs   (8 of 8)

   EVERY ACTION. One function and one gate: `ACTION_ACCESS` in 00_constants says who may
   do what, `accessDenied` in 30_booking enforces it once, and then the handlers run.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */

/* ---------- THIS FILE'S OWN STAMP ---------------------------------------------------------------
   ONE VERSION STRING IN `constants.gs` DESCRIBED SIX FILES, and Apps Script is pasted a file at
   a time — so pasting constants.gs alone moved the number the You screen shows while every
   handler stayed where it was. The screen said `2026-08-14-features` and the backend did not
   have `openWaitlist`, which is the version indicator actively lying: worse than none, because
   it is the thing you check to rule the deploy out.
   Each file that can go stale on its own now says so on its own. */
const DOPOST_VERSION = "2026-10-01-c-family";


function doPost(e) {
  try {
    /* Nothing carried over from whoever asked last. Apps Script reuses an instance between
       requests, so a miss left in the list would be reported against the next person. */
    WRITE_MISSES = [];
    /* NOT SET HERE. It used to be, on the grounds that a POST is a write — and `messages` is a POST
       that reads an inbox, which meant opening that widget threw the payload cache away. `setCell`
       and `addRow` set it now, so it says what it means: the sheet changed. See core.gs. */
    POST_WROTE = false;
    const body = JSON.parse(e.postData.contents);
    const action = S(body.action);

    /* ONE GATE, before anything runs. Thirteen handlers each carried their own admin check, which
       is thirteen chances to forget — and a forgotten check looks exactly like a working feature.
       The table above says who may do what; this enforces it once. */
    const denied = accessDenied(action, body);
    /* A DEAD SESSION SAYS SO IN A WORD THE PHONE CAN READ. The sentence is for a person; `why` is for
       `api()`, which would otherwise have to match English to know that the app it is running in is
       no longer signed in — and every later Save would say "Please sign in again." under a screen
       that still shows somebody signed in. */
    if (denied) return jsonOut(denied === 'Please sign in again.'
      ? { error: denied, why: 'signed-out' } : { error: denied });

    /* --- invitations --------------------------------------------------------------------------
       Sending: the split emails already on a booking become actual invitations.
       Opening: no account needed — the person being invited does not have one yet, which is the
       whole point. Opening is recorded, because an invitation nobody opens and one that is opened
       and refused are different problems.  --- */
    if (action === 'sendInvites') {
      /* ---------- SENDING MAIL IN SOMEBODY ELSE'S NAME ------------------------------------------
         This took a job id, a name and a list of addresses, and sent an email to each — signed as
         whoever the request said it was from, with no check that the sender is real, is in the
         booking, or is who they say. An endpoint that sends mail on an unverified name is the one
         thing on this site somebody outside it could actually misuse.

         THREE THINGS NOW: the asker exists, the invitation is FROM them, and they are actually in
         the booking they are inviting people to share. The third is the one that matters — an
         invitation to share a session is a claim about a session, and it should come from somebody
         who has one. */
      const asker = findPerson(S(body.name), S(body.personId));
      if (!asker) return jsonOut({ error: 'Not signed in.' });
      const jobId = S(body.jobId);
      const from = personDisplayName(asker);
      const inIt = participantsOf(jobId).some(x => key(x.name) === key(from));
      if (!inIt && !hasRole(asker, 'admin')) {
        return jsonOut({ error: 'You can only invite somebody to a session you are in.' });
      }
      /* A HANDFUL, not a mailing list. Splitting a booking is two or three families; anything
         beyond that is somebody using this to send post. */
      if ((body.emails || []).length > 6) {
        return jsonOut({ error: 'That is more people than a session can hold.' });
      }
      const sent = (body.emails || []).filter(Boolean).map(addr => ({
        to: addr, token: sendInvite(jobId, from, addr, ''),
      }));
      return jsonOut({ success: true, sent: sent.length });
    }

    if (action === 'openInvite' || action === 'acceptInvite') {
      const t = read(TAB.invites);
      const r = t.rows.find(x => S(x.token) === S(body.token));
      if (!r) return jsonOut({ error: 'That invitation has expired or was never sent.' });

      // First open only — the interesting number is whether it was ever seen, not how often.
      if (!S(r.opened_on)) setCell(t, r, 'opened_on', new Date());

      const job = read(TAB.jobs).rows.find(j => S(j.job_id) === S(r.job_id)) || {};
      if (action === 'openInvite') {
        return jsonOut({
          success: true,
          /* `job.tutor` is not a column — see `confirmedTutorOf_`. This has been sending an empty
             tutor to every invitation page since invitations were built. */
          from: S(r.from_person), subject: S(job.subject),
          tutor: confirmedTutorOf_(S(r.job_id)),
          venue: S(job.venue), day: S(job.weekday), time: fmtTime(job.start_time),
          weeks: sessionDatesOf(job).length, price: N(job.price_total),
        });
      }

      setCell(t, r, 'accepted_on', new Date());
      /* The invited family becomes a client, with WHERE THEY CAME FROM recorded — this is the one
         moment that fact is knowable, and it can never be recovered later. */
      const p = read(TAB.people);
      /* NOT WHEN THE ADDRESS ALREADY HAS AN ACCOUNT. Signing in is an address now, and two rows on
         one address is refused by `verifyLogin` — so a second row here would lock the existing
         account holder out of their own sign-in. They are already a person; the invite stands. */
      const mailTaken = !!norm(r.to_email)
        && p.rows.some(x => norm(x.email) === norm(r.to_email));
      if (!peopleNamed(S(body.newName)).length && !mailTaken) {
        addRow(p, {
          /* THE NAME IS SPLIT, because `full_name` is gone (see `SCHEMA.people`): the first word is
             the first name and the rest the last, which is how every row typed by hand reads. */
          person_id: 'P' + Date.now(),
          first_name: S(body.newName).split(/\s+/)[0] || '',
          last_name: S(body.newName).split(/\s+/).slice(1).join(' '),
          email: S(r.to_email),
          role: 'client', came_from: 'invited', invited_by: S(r.from_person),
          joined_on: new Date(), listed: 'FALSE',
        });
      }
      clearCache();
      return jsonOut({ success: true });
    }

    /* --- what's wrong with the people tab -----------------------------------------------------
       Read-only. Lists the things that make two accounts behave as one: rows sharing a name, rows
       with no id, rows with no PIN. Admin-only because it names people and their access. --- */
    if (action === 'diagnosePeople') {
      const rows = read(TAB.people).rows;
      const seen = {}, dupes = [];
      rows.forEach(r => {
        const k = key(personDisplayName(r));
        if (!k) return;
        if (seen[k]) dupes.push(personDisplayName(r)); else seen[k] = 1;
      });
      return jsonOut({ success: true,
        total: rows.length,
        duplicateNames: [...new Set(dupes)],
        noId:   rows.filter(r => !S(r.person_id)).map(personDisplayName),
        /* `hasPin_`, NOT `S(r.pin)`. The plaintext cell is EMPTY on every correctly hashed row —
           `authSetPin_` clears it — so this listed every properly secured person as having no PIN,
           on the one screen an admin opens to find out who cannot sign in. The third and fourth
           readers of that cell; see the note over `hasPin_` in booking.gs. */
        noPin:  rows.filter(r => !hasPin_(r)).map(personDisplayName),
        noName: rows.filter(r => !personDisplayName(r)).length,
        people: rows.map(r => ({ id: S(r.person_id), name: personDisplayName(r),
                                 roles: rolesOf(r), email: S(r.email), hasPin: hasPin_(r) }))
      });
    }

    /* --- register ------------------------------------------------------------------------------
       Anyone may create a CLIENT account. Not a tutor and not an admin: those carry access to other
       people's details and to money, so they stay something an admin grants rather than something
       a form hands out.
       The checks are for honest collisions rather than attacks — two families with the same name,
       or somebody registering twice because the first attempt seemed not to work. --- */
    if (action === 'register') {
      const first = S(body.first_name), last = S(body.last_name);
      const email = S(body.email), pin = S(body.pin);
      if (!first || !last) return jsonOut({ error: 'Please give a first and last name.' });
      if (!email || email.indexOf('@') < 0) return jsonOut({ error: 'Please give a real email address.' });
      if (!/^\d{4,8}$/.test(pin)) return jsonOut({ error: 'Choose a PIN of 4 to 8 digits.' });

      const full = (first + ' ' + last).trim();
      const t = read(TAB.people);
      if (findPerson(full)) {
        return jsonOut({ error: 'There is already an account in that name. Try logging in, or ask us to help.' });
      }
      if (t.rows.some(r => S(r.email) && norm(r.email) === norm(email))) {
        return jsonOut({ error: 'That email is already registered. Try logging in.' });
      }

      /* PENDING until they click the link. Deliberately a third state rather than a blank:
         accounts that predate this have no `verified` value at all, and treating blank as
         unverified would lock out every existing family the moment this deployed. */
      const token = 'V' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      /* WHO SENT THEM. The referral code was generated and never recorded against anybody, so
         the loop was open at the far end — codes went out and nothing came back. Now the code
         somebody arrived with is matched to the person who owns it, and both halves are written:
         `came_from` is the raw code (kept even if it matches nobody, because a code that matches
         nobody is itself worth seeing), `invited_by` is the person. */
      const arrivedWith = S(body.ref).toUpperCase().replace(/[^A-Z0-9]/g, '');
      let inviter = '';
      if (arrivedWith) {
        const owner = t.rows.find(x => S(x.referral_code).toUpperCase() === arrivedWith);
        if (owner) inviter = S(owner.person_id) || personDisplayName(owner);
      }

      /* BEFORE THE ROW EXISTS, so `handleMake_` is passed no row: there is nothing of this
         person's for a clash to exclude yet. */
      const regHandle = handleMake_(null, first);
      addRow(t, {
        // Students by default. A parent booking for a child is the account an admin sets up; a
        // person signing themselves up is almost always the one being taught.
        person_id: 'P' + Date.now(), role: 'student',
        first_name: first, last_name: last,
        /* ---------- THE HANDLE IS GENERATED — `<first>_<virtue>` — see `handleMake_` -----------------
           It goes through `handleTrouble_`, so the shape, the reserved list, the blocklist and the
           clash are checked exactly once. There is no `username` column any more: it was the handle
           written twice. `?run=fillHandles` fills any row a generator ever gave up on. */
        handle: regHandle || '',
        email, pin, credits: 0, xp: 0,
        came_from: arrivedWith,
        invited_by: inviter,
        joined_on: new Date(),
        verified: 'PENDING', verify_token: token
      });

      /* Tell the person who sent them. It is the only thanks the mechanism can give, it costs
         nothing, and somebody who hears that their introduction landed makes another. */
      if (inviter) {
        const owner = t.rows.find(x => S(x.person_id) === inviter || personDisplayName(x) === inviter);
        if (owner) {
          notify(personDisplayName(owner), 'Somebody joined through you',
            full + ' has just signed up using your code. Thank you — that is genuinely how this '
            + 'grows.');
        }
      }
      // Sent directly rather than through notify(): notify looks the address up on the row, and
      // the point here is to prove that THIS address reaches this person.
      try {
        MailApp.sendEmail({ to: email, name: '@family.',
          subject: 'Confirm your @family. account',
          body: 'Hello ' + first + ',\n\nConfirm your email address by opening this link:\n\n'
              + SITE_URL + '?verify=' + token
              + '\n\nThen sign in with this email address and the PIN you chose.\n\n— @family.' });
      } catch (err) {
        return jsonOut({ error: 'Account created, but the confirmation email could not be sent. Please get in touch.' });
      }
      return jsonOut({ success: true, name: full, pending: true });
    }

    /* --- confirming an email address ---------------------------------------------------------
       The token is the proof: it was sent to that address and nowhere else, so presenting it shows
       the address was reachable by the person holding it. Cleared on use, so a link works once. */
    if (action === 'verifyEmail') {
      const token = S(body.token);
      if (!token) return jsonOut({ error: 'No confirmation code.' });
      const t = read(TAB.people);
      const r = t.rows.find(x => S(x.verify_token) === token);
      if (!r) return jsonOut({ error: 'That confirmation link has already been used, or has expired.' });
      setCell(t, r, 'verified', 'TRUE');
      setCell(t, r, 'verify_token', '');
      return jsonOut({ success: true, name: personDisplayName(r) });
    }

    /* ================================================================================================
       SIGNING IN WITH GOOGLE
       ------------------------------------------------------------------------------------------------
       WHAT THE BROWSER SENDS IS A CLAIM, NOT A FACT. Google's button hands the page a signed token
       saying "this is who I am"; a page can hand this endpoint anything at all. So the token is not
       read here — it is sent back to Google, which is the only party that can say whether it signed
       it, and every answer below comes from Google's reply rather than from the request.

       THREE THINGS ARE CHECKED AND ALL THREE MATTER.
       `aud` must be OUR client id: a valid Google token issued to somebody else's site is still a
       valid Google token, and without this check anybody could take one from their own app and sign
       in here as its owner.
       `email_verified` must be true: Google will carry an unverified address, and an unverified
       address is somebody's claim about an inbox rather than proof of one.
       `exp` is enforced by tokeninfo, which refuses an expired token outright.

       AND NO ACCOUNT IS CREATED. Matching an address to a row is a different act from making one —
       an unknown address gets a sentence, not a new person. Registering stays where it was, where a
       name and a role and a PIN are set deliberately.
    ================================================================================================ */
    if (action === 'googleLogin') {
      const clientId = S(config().google_client_id);
      /* NOT CONFIGURED IS NOT OPEN. With no client id there is nothing to check `aud` against, and
         a check that cannot run must refuse rather than wave things through. */
      if (!clientId) return jsonOut({ success: false, error: 'Google sign-in is not set up yet.' });

      const cred = S(body.credential);
      if (!cred) return jsonOut({ success: false, error: 'No Google token in that request.' });

      let info = null;
      try {
        const res = UrlFetchApp.fetch(
          'https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(cred),
          { muteHttpExceptions: true });
        if (res.getResponseCode() === 200) info = JSON.parse(res.getContentText());
      } catch (err) {
        return jsonOut({ success: false, error: 'Could not reach Google to check that sign-in.' });
      }
      /* A REFUSAL FROM GOOGLE IS A REFUSAL HERE. Expired, tampered with, or never signed by them —
         tokeninfo answers with a non-200 and there is nothing further to consider. */
      if (!info || !S(info.sub)) return jsonOut({ success: false, error: 'That Google sign-in was not valid.' });
      if (S(info.aud) !== clientId) return jsonOut({ success: false, error: 'That Google sign-in was for a different site.' });
      if (String(info.email_verified) !== 'true') {
        return jsonOut({ success: false, error: 'That Google address is not verified.' });
      }

      const email = S(info.email).toLowerCase();
      if (!email) return jsonOut({ success: false, error: 'That Google account has no address on it.' });

      const t = read(TAB.people);
      /* MATCHED ON THE ADDRESS AND NOTHING ELSE. Not on the name Google carries: people change
         their display name, and a name match would let a stranger called Sasha Ivanov in. */
      /* THE SAME READING OF THE ADDRESS AS `verifyLogin`, and the same refusal of two rows on one:
         the first match would sign somebody in as whoever sits higher on the tab, and the two
         doors disagreeing about one address is a PIN refused while Google lets them in as the
         other account. */
      const googleHits = t.rows.filter(x => norm(x.email) === norm(email));
      if (googleHits.length > 1) {
        return jsonOut({ success: false,
          error: 'That email address is on more than one account — ask us to sort it out.' });
      }
      const r = googleHits[0] || null;
      if (!r) {
        return jsonOut({ success: false,
          error: 'No @family. account uses that Google address. Ask an admin to add it to your profile.' });
      }
      if (S(r.verified).toUpperCase() === 'PENDING') {
        /* SIGNING IN WITH GOOGLE IS THE CONFIRMATION. The pending state exists to prove somebody
           owns the inbox, and Google has just proved exactly that about the same address. */
        setCell(t, r, 'verified', 'TRUE');
        setCell(t, r, 'verify_token', '');
        clearCache();
      }
      logEvent({ jobId: '', actor: personDisplayName(r), role: toAppRole(mainRole(r)),
                 action: ACT.SAY, message: 'signed in with Google' });
      return loginReplyFor_(r, authNewSession_(t, r));
    }

    if (action === 'signOut') {
      /* THE GATE HAS ALREADY RESOLVED THE TOKEN, so this ends the session of whoever actually holds
         it — a request cannot sign anybody else out. */
      const t = read(TAB.people);
      const r = findPerson(body.name);
      if (r) { authEndSession_(t, r); clearCache(); }
      /* SUCCESS EITHER WAY. An expired token reaching here means the session is already over, and
         an error would say otherwise. */
      return jsonOut({ success: true });
    }

    if (action === 'verifyLogin') {
      const t0 = read(TAB.people);
      /* ---------- AN E-MAIL ADDRESS AND A PIN, AND NOTHING ELSE ------------------------------------
         ASKED FOR AS *"i want people to be able to sign in only with their email and their pin now.
         no case sensitive stuff."* This went through `findPerson`, which answers to six things — an
         id, a full name, first + last, a handle, a username and an address — so the box took all of
         them and the question of which one a person should type had six answers. One now.

         NOT `findPerson`, and the reason is the other half of the ask. `findPerson` returns the FIRST
         row that answers to ANY rung, so an address typed here could still be claimed by a name rung
         above it on somebody else's row. Asked of the `email` column alone, it cannot.

         `norm` IS THE WHOLE OF "NO CASE SENSITIVE STUFF": trimmed and lower-cased on both sides, so
         `Halex.Dias.31@Gmail.com ` is the same address as the one in the sheet. A PIN is digits and
         has no case to fold.

         `body.email` FIRST AND `body.name` AFTER, because the phone that asks for an address may be
         older than this backend or newer than it — see `do-signin`. An old phone sends whatever was
         typed as `name`, and that is still refused unless it is an address.

         TWO ROWS ON ONE ADDRESS IS REFUSED, NOT GUESSED. The first-match rule is what made
         `changePin` check one person's PIN against another's row; with the address as the ONLY
         key, the first match would be somebody signing in as whoever happens to sit higher on the
         tab. `emailRefusal_` stops a duplicate being SAVED from the app; a duplicate typed into the
         sheet by hand is what this answers, in a sentence that says who can fix it. */
      const mail = norm(body.email || body.name);
      if (mail.indexOf('@') === -1) {
        return jsonOut({ success: false, why: 'not-an-email',
          error: 'That is not an email address — sign in with the email on your account.' });
      }
      const hits = t0.rows.filter(x => norm(x.email) === mail);
      if (hits.length > 1) {
        return jsonOut({ success: false,
          error: 'That email address is on more than one account — ask us to sort it out.' });
      }
      const r = hits[0] || null;
      if (!r) return jsonOut({ success: false, why: 'no-such-email',
        error: 'No account has that email address.' });
      if (!hasPin_(r)) return jsonOut({ success: false, why: 'no-pin',
        error: 'That account has no PIN set yet — ask us to add one.' });
      /* LOCKED IS ANSWERED BEFORE THE PIN IS LOOKED AT, so guessing costs the same whether the
         guess was right or not — a lock that only applies to wrong answers tells a guesser when
         they have found the right one. */
      /* AND IT SAYS HOW LONG. "Try again in a few minutes" is a sentence you cannot act on: it is
         the same words whether the wait is one minute or an hour, so the only thing to do with it
         is keep pressing — which is what makes the wait longer. A number is a thing somebody can
         wait out. See `authWaitMins_`. */
      const wait = authWaitMins_(r);
      if (wait > 0) {
        return jsonOut({ success: false,
          error: wait === 1 ? 'Too many wrong PINs. Try again in a minute.'
                            : 'Too many wrong PINs. Try again in ' + wait + ' minutes.' });
      }
      /* HASHED, AND OLD ROWS MOVED ACROSS AS THEY ARRIVE — see `authCheckPin_`. */
      if (!authCheckPin_(t0, r, body.pin)) {
        authWrong_(t0, r);
        /* ---------- A WRONG ADDRESS AND A WRONG PIN SAY DIFFERENT THINGS NOW ---------------------
           ASKED FOR AS *"make the error codes more specific. if its username not recognised then say
           that. if pin wrong then say that."* It used to be one sentence for both, on purpose:
           telling somebody the address was right is telling a guesser half the answer, and it lets
           anybody find out whether an address has an account here. The owner has chosen being told
           which half was wrong over that. What still stands between a guesser and a PIN is the
           throttle above, which is untouched. */
        return jsonOut({ success: false, why: 'wrong-pin', error: 'Wrong PIN for that email address.' });
      }
      // Only accounts that WERE asked to confirm are held back. A blank means the account predates
      // this and was never sent a link, so it isn't unverified — it's just older.
      if (S(r.verified).toUpperCase() === 'PENDING') {
        return jsonOut({ success: false,
          error: 'Please confirm your email first — check your inbox for the link we sent.' });
      }
      /* ANYTHING ELSE IS SAID AS ITSELF, not folded into one of the sentences above — a sign-in
         that failed on our side must not read as a wrong PIN, or somebody retypes a right one until
         the throttle locks them out. */
      try { return loginReplyFor_(r, authNewSession_(t0, r)); }
      catch (err) {
        return jsonOut({ success: false, why: 'server',
          error: 'Your email and PIN are right, but signing in failed on our side: '
                 + String(err && err.message || err) });
      }
    }

    /* --- admin: read anyone's profile -------------------------------------------------------- */
    /* ---------- YOUR OWN SETTINGS, READ FRESH ------------------------------------------------------
       THE SETTINGS FORM DRAWS FROM `USER.profile`, AND THAT WAS WRITTEN ONCE — by the sign-in reply —
       and then kept in the phone's storage for the thirty days a session lasts. So a change made on
       another phone, by an admin, or typed into the sheet never reached the form, and the next Save
       posted the phone's old copy back over it. Worse, every phone signed in before the sign-in reply
       was repaired holds the broken shape, and would go on posting blanks.
       A POST AND NOT A KEY ON THE PAYLOAD, and that is not a preference: the payload is cached and
       served to whoever asks for the same key, and this carries a birthday, a phone number and the
       library-card PINs. `profileOf_` of the row the TOKEN resolved to, and of nobody else — the
       gate has already overwritten `body.personId` with it. */
    if (action === 'myProfile') {
      const me = findPerson('', S(body.personId));
      if (!me) return jsonOut({ error: 'We could not find your account.' });
      return jsonOut({ success: true, personId: S(me.person_id), profile: profileOf_(me),
                       agreementSignedAt: S(me.agreement_signed_at),
                       agreementVersion: S(me.agreement_version) });
    }

    if (action === 'getProfile') {
      const r = findPerson(body.target);
      if (!r) return jsonOut({ error: 'Person not found.' });
      const appRole = toAppRole(mainRole(r));
      const out = profileOf_(r);
      return jsonOut({ success: true, profile: out, role: appRole, name: personDisplayName(r),
                       personId: S(r.person_id),
                       // So the editor can draw the figure and say what it's wearing.
                       avatarItems: appRole === 'kid' ? avatarUnlocks(r) : [] });
    }

    /* --- admin: everyone ---------------------------------------------------------------------- */
    /* THE BUSINESS RECORDS — admin only by `ACTION_ACCESS`, and read by a POST rather than sent in
       the payload, because the payload is cached and goes to every visitor. See records.gs. */
    if (action === 'listRecords' || action === 'saveRecordsPage') {
      return jsonOut(recordsAction_(action, body));
    }

    if (action === 'listPeople') {
      const people = read(TAB.people).rows.map(r => ({
        name: personDisplayName(r),
        role: rolesOf(r).map(roleLabel_).join(', '),
        roles: rolesOf(r),
        handle: S(r.handle), email: S(r.email), phone: S(r.phone), dob: fmtDate(r.date_of_birth),
        photo: S(r.photo), description: S(r.headline), city: S(r.city),
        avatar: S(r.avatar),
        // Level and credits belong on a student's card too — they're what everything in the
        // wardrobe is priced against, so an admin looking at a student can see why an item is
        // still locked without opening anything.
        xp: N(r.xp), credits: N(r.credits),
        tags: [r.adjective_1, r.adjective_2, r.adjective_3].map(S).filter(Boolean),
        // A blank email means every notification to this person is silently dropped, which is
        // invisible until someone says they were never told.
        contactable: !!S(r.email)
      })).filter(p => p.name);
      people.sort((a, b) => a.role.localeCompare(b.role) || a.name.localeCompare(b.name));
      return jsonOut({ success: true, people });
    }

    /* --- profile writes ---------------------------------------------------------------------- */
    if (action === 'updateProfile') {
      const asker = S(body.name);
      /* The target must be stated. It used to fall back to the asker, which meant a request that
         had lost track of whose form it came from would write onto the ASKER's row instead of
         failing — one person's values, role included, landing on another's account. A write that
         doesn't know who it's for should not happen at all.
         Prefer the id. A name can be renamed, duplicated, or overwritten by a bad write — and
         when it is, a save addressed to a name lands on whichever row happens to answer to it. */
      const target = S(body.targetId) || S(body.target);
      if (!target) return jsonOut({ error: 'No profile named for that change.' });
      // If a NAME was used and more than one row answers to it, refuse rather than guess.
      if (!S(body.targetId) && peopleNamed(target).length > 1) {
        return jsonOut({ error: 'More than one account answers to "' + target +
          '". Nothing was changed — give them different names, or reload so the site can use ids.' });
      }
      const t = read(TAB.people);
      const r = findPerson(target);
      if (!r) return jsonOut({ error: 'Profile not found.' });
      /* ---------- WHO IS EDITING WHOM IS A QUESTION ABOUT TWO ROWS, ANSWERED BY THEIR IDS ----------
         IT WAS `key(target) !== key(asker)`, AND FOR EVERY ORDINARY SAVE THAT WAS AN ID AGAINST A
         NAME. The phone sends `targetId` — a person_id — and `accessDenied` overwrites `body.name`
         with the token's DISPLAY name, so it compared `p002` with `adatutor`: never equal. Every
         tutor, parent and student was therefore "an admin editing somebody else", and refused with
         "Not authorised to edit that profile." — measured, all three roles, nothing written. The
         admin passed the gate and was treated as editing SOMEBODY ELSE on their own row, which is
         why a renamed admin kept their old name on the phone (`name: ''` in the reply).
         `accessDenied` has already resolved the token to a row and put its id on `body.personId`,
         so the question is one comparison of two ids, and admin is asked of that same row rather
         than of a display name looked up a second time. */
      const me = findPerson('', S(body.personId));
      const iAmAdmin = !!me && hasRole(me, 'admin');
      const adminEditing = !me || S(r.person_id) !== S(me.person_id);
      if (adminEditing && !iAmAdmin) {
        return jsonOut({ error: 'Not authorised to edit that profile.' });
      }
      const fields = body.fields || {};
      // An admin may additionally set the admin-only flags — that's what makes them admin-only
      // rather than merely hidden.
      const allowed = adminEditing ? PROFILE_EDITABLE.concat(PROFILE_READONLY) : PROFILE_EDITABLE;
      const has = f => t.headers.indexOf(f) !== -1;
      const sent = re => Object.keys(fields).some(f => re.test(f));
      const HOUR = /^(m|tu|w|th|f|sa|su)\d\d$/;

      /* ================================================================================================
         1. EVERY REFUSAL, BEFORE A SINGLE CELL IS TOUCHED.

         THE PACKED CELLS USED TO BE WRITTEN AS THEY WERE MET, and the refusals under them fired
         afterwards. Measured: a Contact save carrying somebody else's e-mail answered "That e-mail
         address is already on another account" — having already written the phone and the birthday.
         A student's About-you save refused over a missing exam column had already written the
         birthday. And because `setCell` sets `POST_WROTE`, `jsonOut` retired every visitor's stored
         payload for a save that reported failure. A refusal is only a refusal if nothing has
         happened yet, so every one of them is asked here and section 2 does not start until all of
         them have said no.
         ================================================================================================ */
      /* THE FORM NAMES ARE NOT THE CELLS. Hour codes, the library boxes, the qualification shelf, the
         phone's two boxes and the birthday's three are packed into one cell each (`availGridIn`,
         `libCardsIn`, `qualsIn`, `phoneIn`, `dobIn`), so they are kept out of `wanted` below — and
         because they are out of it, the `noColumn` refusal cannot see their cell, so each cell's
         header is checked here. `setCell` writes to a missing header and loses the value with no
         error anywhere, which is the exact fault that refusal exists to prevent.
         EACH PACKER IS FED THE WHOLE FIELD MAP, so a form that sent two of three library cards writes
         the third as empty rather than leaving whatever was there. A page saves as a page. */
      const availSent = sent(HOUR);
      const libSent   = sent(LIBRARY_FIELD) && LIBRARY_FIELDS.some(f => allowed.indexOf(f) !== -1);
      const qualsSent = sent(QUAL_FIELD) && QUAL_FIELDS.some(f => allowed.indexOf(f) !== -1);
      const phoneSent = sent(PHONE_FIELD) && allowed.indexOf('phone') !== -1;
      const dobSent   = sent(DOB_FIELD) && allowed.indexOf('date_of_birth') !== -1;
      const photosSent = sent(PHOTO_FIELD) && PHOTO_FIELDS.some(f => allowed.indexOf(f) !== -1);
      /* THE VENUES ARE ON ANOTHER TAB — `venuesWrites_` in core.gs says why there is no column here. */
      const venuesSent = fields.venues_ok !== undefined && allowed.indexOf('venues_ok') !== -1;
      const venueTab = venuesSent ? read(TAB.venues) : null;
      if (venueTab && venueTab.headers.indexOf('tutors_happy_here') === -1) {
        return jsonOut({ error: 'The venues tab has no column for: tutors_happy_here. '
          + 'Run ensureSchema() to add it — nothing was saved.' });
      }
      const packedMissing = [availSent && 'availability', phoneSent && 'phone',
                             dobSent && 'date_of_birth', photosSent && 'photos']
        .filter(c => c && !has(c));
      if (packedMissing.length) {
        return jsonOut({ error: 'The sheet has no column for: ' + packedMissing.join(', ')
          + '. Run ensureSchema() to add it — nothing was saved.' });
      }
      /* QUALIFICATIONS AND LIBRARY CARDS ARE ROWS ON TABS OF THEIR OWN now (see `SCHEMA.people`), so
         the question is whether the TAB is there — a tab `ensureSchema` has not made yet would take a
         save of that page and write nothing, under a toast saying Saved. */
      const tabMissing = [qualsSent && !read(TAB.qualifications).sheet && 'qualifications',
                          libSent && !read(TAB.library_cards).sheet && 'library_cards'].filter(Boolean);
      if (tabMissing.length) {
        return jsonOut({ error: 'The spreadsheet has no tab called: ' + tabMissing.join(', ')
          + '. Run ensureSchema() to make it — nothing was saved.' });
      }
      /* A PARTIAL BIRTHDAY is `null` to `sheetDate`, so it would go off the calendar under a toast
         saying Saved. `dobRefusal_` is in `core.gs` beside `sheetDate` so something can run it. */
      if (dobSent) {
        const dobNo = dobRefusal_(fields);
        if (dobNo) return jsonOut({ error: dobNo });
      }
      /* A PHOTOGRAPH THAT IS NOT A LINK is refused rather than kept or dropped — `photosRefusal_`. */
      if (photosSent) {
        const photoNo = photosRefusal_(fields);
        if (photoNo) return jsonOut({ error: photoNo });
      }
      /* AN EXAM DATE IS A COLUMN, so `wanted` finds it; what a column check cannot say is whether the
         VALUE is a date. A date input cannot produce a bad one, which is not a reason to trust it:
         `doPost` is reachable by anybody with the URL. See `isoRefusal_`. */
      const badDate = DATE_COLS.map(f => fields[f] === undefined ? ''
                        : isoRefusal_(fields[f], f.replace(/_/g, ' '))).filter(Boolean)[0];
      if (badDate) return jsonOut({ error: badDate });
      const wanted = Object.keys(fields)
        .filter(f => !HOUR.test(f) && !LIBRARY_FIELD.test(f) && !QUAL_FIELD.test(f)
                  && !PHONE_FIELD.test(f) && !DOB_FIELD.test(f) && !PHOTO_FIELD.test(f)
                  && f !== 'venues_ok' && allowed.indexOf(f) !== -1);
      /* A field with no column vanishes silently: that is how an extra-seat fraction was entered
         four times and lost four times, with the site showing a stale default each time and nothing
         connecting the two. Refuse the save and name the column — the fix is one ensureSchema run,
         and nobody can act on an error they were never shown. */
      const noColumn = wanted.filter(f => !has(f));
      if (noColumn.length) {
        return jsonOut({ error: 'The sheet has no column for: ' + noColumn.join(', ')
          + '. Run ensureSchema() to add it — nothing was saved.' });
      }
      /* ---------- WHAT A TUTOR CHARGES MOVES ONCE A MONTH, ALL FOUR FIELDS TOGETHER ------------
         `PRICING_FIELDS` is the four and `pricingRefusal_` in people.gs is the rule. ONLY WHEN A
         VALUE ACTUALLY MOVES: that page posts all four on every save, touched or not, and a rule
         firing on a field being PRESENT would refuse the boxes beside it for a month over a number
         nobody edited. Compared against the row as it is — and nothing below has run yet, which is
         the only moment that comparison is honest: `setCell` updates the row in memory, so asking
         after the write compares the new values with themselves.
         THE WANTED LIST IS WHAT IS ASKED ABOUT, not `fields`: a field the allow-list dropped will
         not be written, so a cooldown started by one would be a month spent on nothing. */
      const priceAsked = {};
      wanted.forEach(f => { priceAsked[f] = fields[f]; });
      const priceMoved = pricingMoved_(r, priceAsked).length > 0;
      /* THE STAMP'S COLUMN IS CHECKED HERE NOW. This used to say a missing `pricing_changed_at` was
         "the safe direction to fail in — the rate is still saved". It was not safe: `jsonOut` turns
         any write that lands on a missing header into an error, so the rate WAS saved under a reply
         saying "Nothing was saved", and with no stamp the once-a-month rule was never enforced
         (measured: two rate changes on one day, both through). A refusal before anything moves is
         the only honest answer. */
      if (priceMoved && !has('pricing_changed_at')) {
        return jsonOut({ error: 'The sheet has no column for: pricing_changed_at. '
          + 'Run ensureSchema() to add it — nothing was saved.' });
      }
      const priceNo = pricingRefusal_(r, priceAsked, iAmAdmin);
      if (priceNo) return jsonOut({ error: priceNo });
      /* ---------- AND THE AGE RANGE, WHICH IS NOT THE QUOTE AND HAS NO CLOCK ----------------------
         Asked of the same wanted-only object for the same reason, and before any write for the
         reason this whole section exists. A youngest older than the oldest is a range nobody falls
         inside — see `ageRefusal_` in people.gs. */
      const ageNo = ageRefusal_(r, priceAsked);
      if (ageNo) return jsonOut({ error: ageNo });
      /* ---------- AN ADDRESS IS WHAT SIGNS IN TO THIS ACCOUNT ------------------------------------
         SO EMPTYING THE BOX IS A SIGN-OUT NOBODY CAN UNDO — `verifyLogin` and `forgotPin` both look
         the person up by it. And two rows on one address means `verifyLogin` refuses both, so a
         duplicate is `emailRefusal_`'s to refuse. Only when the form sent one: About you and every
         other page post no `email`, and a rule firing on absence would refuse them. An admin is NOT
         exempt: an admin putting a duplicate address on somebody's row is still the collision. */
      if (wanted.indexOf('email') !== -1 && fields.email !== undefined) {
        if (!norm(fields.email) && norm(r.email)) {
          return jsonOut({ error: 'Your email address is what you sign in with, so it cannot be left empty.' });
        }
        const mailNo = emailRefusal_(fields.email, r);
        if (mailNo) return jsonOut({ error: mailNo });
      }

      /* ================================================================================================
         2. EVERY WRITE, COLLECTED INTO ONE OBJECT, THEN ONE CALL.

         THE QUALIFICATIONS AND THE LIBRARY CARDS ARE WRITTEN AS ROWS, after the person's own row, by
         `writeOwnRows_` — see core.gs. What a tutor teaches is no longer written anywhere: it is
         DERIVED from the qualifications' two ticks every time it is read (`teachesOf_`), so there is
         no second copy for a Save to keep in step.
         ================================================================================================ */
      const put = {};
      if (availSent) put.availability = availGridIn(fields);
      if (photosSent) put.photos = photosIn(fields);
      if (phoneSent) put.phone = phoneIn(fields);
      if (dobSent) put.date_of_birth = dobIn(fields);
      wanted.forEach(f => { put[f] = fields[f]; });
      /* THE STAMP GOES ON WITH THE WRITE, NOT BEFORE IT: written earlier, a refusal would leave the
         clock started on a change that never happened. It is the same `pricingMoved_` the guard read,
         over the same object, so the two cannot disagree about whether anything moved. An admin's edit
         stamps it too — the cell records when the quote last moved, whoever moved it. */
      if (priceMoved) put.pricing_changed_at = new Date();
      const renamed = fields.first_name !== undefined || fields.last_name !== undefined;
      let full = '';
      if (renamed) {
        full = (S(fields.first_name !== undefined ? fields.first_name : r.first_name) + ' ' +
                S(fields.last_name  !== undefined ? fields.last_name  : r.last_name)).trim();
      }

      /* 3. ONE WRITE. `setCells` is `setCell` for a whole row: a cell already holding what is asked
         is left alone, so a Save that changes nothing writes nothing and does NOT retire every
         visitor's stored payload — which is what made the `load()` after an untouched Save a full
         cold rebuild. See the note over it in core.gs. */
      const wrote = setCells(t, r, put);
      let rowsMoved = 0;
      if (qualsSent) rowsMoved += writeOwnRows_(TAB.qualifications, S(r.person_id), qualsIn(fields), QUAL_COLS).changed;
      if (libSent) rowsMoved += writeOwnRows_(TAB.library_cards, S(r.person_id), libCardsIn(fields), LIB_COLS).changed;
      /* AND THE VENUES, AFTER THE ROW, so a refusal above has already stopped both. Only the venue
         cells that actually change are written. */
      if (venueTab) {
        venuesWrites_(r, fields.venues_ok, venueTab.rows).forEach(w => {
          wrote.push.apply(wrote, setCells(venueTab, w.row, { tutors_happy_here: w.cell }));
        });
      }
      /* ---------- AND THE FORM'S OWN VALUES COME BACK WITH THE ANSWER ------------------------------
         `profileOf_` of the row as it now stands — so the phone's copy is what the SERVER made of the
         boxes (the phone repacked, the specialism derived from the ticks, a birthday normalised)
         rather than what was typed, and the next Save starts from the sheet. Only for your own row:
         an admin editing somebody else is shown that person's form elsewhere. */
      /* `changed` IS HOW MANY CELLS MOVED, so the phone can skip fetching a payload nothing altered. */
      const out = { success: true, changed: wrote.length + rowsMoved, profile: adminEditing ? null : profileOf_(r) };
      // Only the person themselves needs their session renamed; an admin must not inherit it.
      if (renamed) out.name = adminEditing ? '' : full;
      return jsonOut(out);
    }

    if (action === 'updateVenue') {
      const t = read(TAB.venues);
      const r = t.rows.find(x => key(x.name) === key(body.venue));
      if (!r) return jsonOut({ error: 'Venue not found.' });
      const fields = body.fields || {};
      if (Object.keys(fields).some(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f))) {
        setCell(t, r, 'availability', availGridIn(fields));
      }
      Object.keys(fields).forEach(f => {
        if (/^(m|tu|w|th|f|sa|su)\d\d$/.test(f)) return;
        if (VENUE_EDITABLE.indexOf(f) === -1) return;
        setCell(t, r, f, fields[f]);
      });
      return jsonOut({ success: true });
    }

    /* --- admin edits a pricing variable ------------------------------------------------------
       Every number in the formula lives in `config`; this is how the site writes one back.
       Restricted to keys that already exist, so a typo can't invent a variable that looks like a
       setting and is read by nothing. --- */
    /* ---------- IT HAS A CALLER NOW: the admin's "your cut of an extra child" card ------------
       Dead for as long as it existed — see the note under `saveRoom` below. The Settings column's
       admin card posts `boss_rate` here, which is the `B` `priceFrom` reads as the business's
       share of each extra child. `setCell` and `addRow` both set `POST_WROTE`, so the six-hour
       payload is retired on the way out and the new figure is on the next load rather than
       tomorrow — which is the whole difference between a control and a suggestion.

       A KEY THAT IS NOT THERE MAY BE ADDED, BUT ONLY FROM A SHORT LIST. `priceFrom` reads `B`,
       `boss rate` or `boss_rate`, and a config tab that has never carried any of them prices every
       extra child with no cut at all; refusing to create the row would leave the card unable to set
       the one thing it exists for. A list rather than any key, because an admin's typo would
       otherwise become a config row nothing reads.

       A NUMBER STAYS A NUMBER. A fraction is what this key means (`asFraction` in core.js takes
       0 to 2 and ignores anything bigger as a leftover pound figure), so it is checked here too —
       the phone's check is a convenience and this is the rule. */
    if (action === 'updateConfig') {
      const CONFIG_ADDABLE = { boss_rate: "YOUR cut of each extra child, as a fraction of the tutor's hourly rate. 0.1 = 10%" };
      const FRACTION_KEYS = ['boss_rate', 'b', 'boss rate'];
      const want = S(body.key);
      if (FRACTION_KEYS.indexOf(norm(want)) >= 0) {
        const x = Number(body.value);
        if (S(body.value) === '' || isNaN(x) || x < 0 || x > 2)
          return jsonOut({ error: 'That share must be a number from 0 to 2 — 0.1 is 10%.' });
      }
      const t = read(TAB.config);
      /* EXACT CASE FIRST. `config()` keys its variables case-sensitively and the pricing reads `B`
         (your cut) and `b` (the bulk discount) as two different numbers — so a case-folded match let
         row order decide which of the two a Save on the cut card changed. */
      let r = t.rows.find(x => S(x.key) === want) || t.rows.find(x => norm(x.key) === norm(want));
      if (!r && CONFIG_ADDABLE[norm(want)]) {
        r = addRow(t, { key: norm(want), value: Number(body.value), what_it_does: CONFIG_ADDABLE[norm(want)] });
        if (!r) return jsonOut({ error: 'The config tab could not be opened.' });
        return jsonOut({ success: true, key: S(r.key), value: r.value, added: true });
      }
      if (!r) return jsonOut({ error: 'No config key called "' + want + '".' });
      const value = FRACTION_KEYS.indexOf(norm(want)) >= 0 ? Number(body.value) : body.value;
      if (!setCell(t, r, 'value', value)) return jsonOut({ error: 'The config tab has no value column.' });
      return jsonOut({ success: true, key: S(r.key), value: value });
    }

    /* --- admin edits a per-option surcharge ---------------------------------------------------
       The S, L, D and T terms aren't single numbers — each subject, level, day and time carries
       its own. Venues live on their own tab but behave the same way, so they're handled here too
       rather than making the card care which sheet a rate happens to sit on. --- */
    if (action === 'updatePricing') {
      const kind = norm(body.kind), label = S(body.label), value = N(body.value);

      if (kind === 'venue') {
        const vt = read(TAB.venues);
        const v = vt.rows.find(x => key(x.name) === key(label));
        if (!v) return jsonOut({ error: 'No venue called "' + label + '".' });
        setCell(vt, v, 'cost_per_hour', value);
        return jsonOut({ success: true });
      }

      const t = read(TAB.pricing);
      let r = t.rows.find(x => norm(x.kind) === kind && key(x.label) === key(label));
      /* Whether the row had to be MADE. It reported `!r._existing` on a variable nothing ever
         set, so every edit came back claiming to have added a row — including the ones that
         changed an existing figure. Read before the write, which is the only moment it is true. */
      const wasNew = !r;
      // A surcharge that has never been set has no row yet. Adding one is the same act as editing
      // it, so it's done here rather than making you go and create it first.
      if (!r) r = addRow(t, { kind, label, surcharge_per_hour: value,
                              note: 'added to the hourly rate when chosen' });
      else setCell(t, r, 'surcharge_per_hour', value);
      return jsonOut({ success: true, added: wasNew });
    }

    /* --- admin edits a shop item -------------------------------------------------------------- */
    if (action === 'updateShop') {
      const t = read(TAB.shop);
      const r = t.rows.find(x => x._row === Number(body.rowIndex));
      if (!r) return jsonOut({ error: 'Item not found.' });
      const fields = body.fields || {};
      Object.keys(fields).forEach(f => {
        if (SHOP_EDITABLE.indexOf(f) === -1) return;
        setCell(t, r, f, fields[f]);
      });
      return jsonOut({ success: true, name: S(r.name) });
    }

    if (action === 'deleteShopItem') {
      const t = read(TAB.shop);
      const r = t.rows.find(x => x._row === Number(body.rowIndex));
      if (!r) return jsonOut({ error: 'Item not found.' });
      delRow(t, r);
      clearCache();
      return jsonOut({ success: true });
    }

    /* ---------- THE LINK EDITOR IS GONE AND IT NEVER HAD A DOOR ----------------------------------
       `updateLink`, `addLink` and `deleteLink` wrote to the `links` tab. That tab is
       `data/settings/links.json` in the repository now — 126 rows in 25 categories, read by
       `settingsInto_` — so the handlers had nothing left to write to.

       THEY WERE ALREADY DEAD, which is why deleting them costs nothing and is worth recording.
       Measured across `js/` and `index.html`: not one of the three strings occurs. They were
       access-listed in `ACTION_ACCESS`, published, and never once called — `orderPrints` again, and
       eight more of the same shape are still here (`updateVenue`, `updateConfig`, `updatePricing`,
       `updateShop`, `deleteShopItem`, `saveRoom`, `updateTrip`, `addTrip`). Those eight write to
       tabs that still exist, so they still would work if anything ever called them; these three
       could not. A link is edited by editing the file and pushing, which is a deploy — the same
       trade `questions` made, for a tab nobody hand-edits twice a year. */

    /* --- a room, saved by venue and slot -------------------------------------------------------
       Upsert, not update: the six slots always exist on screen, so the first edit to an empty one
       has to create its row. Keyed on venue + name rather than a row number, because the form is
       drawn from a fixed list and doesn't know whether a row exists yet — and shouldn't have to. --- */
    if (action === 'saveRoom') {
      const venue = S(body.venue), name = S(body.name);
      if (!venue || !name) return jsonOut({ error: 'Which room?' });
      const t = read(TAB.rooms);
      let r = t.rows.find(x => key(x.venue) === key(venue) && key(x.name) === key(name));
      const fields = body.fields || {};

      // Everything blank means the room isn't offered. Clearing a slot removes it rather than
      // leaving a £0 room in every venue dropdown.
      const emptied = ROOM_EDITABLE.every(f => f === 'venue' || f === 'name' || f === 'active'
        || !S(fields[f])) && !S(body.availability);
      if (emptied) {
        if (r) { delRow(t, r); clearCache(); }
        return jsonOut({ success: true, removed: true });
      }

      if (!r) r = addRow(t, { room_id: 'R' + Date.now(), venue, name, active: 'TRUE' });
      Object.keys(fields).forEach(f => {
        if (ROOM_EDITABLE.indexOf(f) === -1) return;
        setCell(t, r, f, fields[f]);
      });
      if (body.availability !== undefined) setCell(t, r, 'availability', S(body.availability));
      return jsonOut({ success: true });
    }

    if (action === 'updateTrip') {
      const t = read(TAB.trips);
      const r = t.rows.find(x => x._row === Number(body.rowIndex));
      if (!r) return jsonOut({ error: 'Trip not found.' });
      Object.keys(body.fields || {}).forEach(f => {
        if (TRIP_EDITABLE.indexOf(f) === -1) return;
        setCell(t, r, f, body.fields[f]);
      });
      return jsonOut({ success: true, name: S(r.name) });
    }

    if (action === 'addTrip') {
      const t = read(TAB.trips);
      const row = addRow(t, { trip_id: 'T' + Date.now(), name: S(body.name) || 'New trip',
                              active: 'TRUE' });
      return jsonOut({ success: true, rowIndex: row ? row._row : 0 });
    }

    /* --- fetch an image so a canvas can use it ------------------------------------------------
       A browser cannot draw a Drive photo onto a canvas it intends to export. Ask for the bytes
       with crossOrigin and Drive refuses, so the image never loads; ask without it and the image
       loads but poisons the canvas, so the export throws. There is no third option from the page.

       Apps Script has no such restriction — it isn't a browser and CORS doesn't apply — so it
       fetches the bytes and hands back a data URI, which is same-origin by definition and can be
       drawn and exported freely. One round trip, and only when someone shares. --- */
    if (action === 'imageData') {
      const url = S(body.url);
      if (!/^https?:\/\//i.test(url)) return jsonOut({ error: 'Not a URL.' });
      try {
        const res = UrlFetchApp.fetch(url, { muteHttpExceptions: true, followRedirects: true });
        if (res.getResponseCode() !== 200) return jsonOut({ error: 'Image fetch returned ' + res.getResponseCode() });
        const blob = res.getBlob();
        // Guard the response size: a data URI is base64, so it's a third larger again, and a huge
        // one would blow the execution's memory for the sake of a picture in a shared note.
        if (blob.getBytes().length > 3 * 1024 * 1024) return jsonOut({ error: 'Image too large to share.' });
        return jsonOut({ success: true,
          dataUri: 'data:' + blob.getContentType() + ';base64,' + Utilities.base64Encode(blob.getBytes()) });
      } catch (err) {
        return jsonOut({ error: 'Could not fetch that image: ' + err });
      }
    }

    /* ---------- THREE RESOURCE HANDLERS WERE HERE -----------------------------------------------
       `updateResource` relabelled a document by row number, `editResource` did the same by id, and
       `deleteResource` set its `active` to FALSE. All three wrote cells on a `kind: 'paper'` row of
       the `questions` tab, and that tab is `data/questions.json` in this repository now: a relabel
       is a commit, not a cell.

       THE FORM WENT WITH THEM. It was built from `resourceFields` on the payload — the same object
       the server checked writes against — so there is no version of it left offering a field
       nothing will accept. See js/resource.js, where only the basket and the paper remain. */

    /* --- admin edits a post ------------------------------------------------------------------- */
    if (action === 'editPost') {
      const t = read(TAB.posts);
      const r = rowById_(t, 'post_id', body.id, body.rowIndex);
      if (!r) return jsonOut({ error: 'No post with that id — it may have been deleted.' });

      const fields = body.fields || {};

      /* THE POLL IS NOT FREELY EDITABLE.
         A vote is stored against the option's TEXT. Rename an option and every vote cast for it
         points at something that no longer exists — the count survives, its option does not, and
         the percentages quietly stop adding up. Nothing throws, which is the worst version of it.
         So the options may change only while nobody has voted. */
      if (fields.poll !== undefined) {
        const was = S(r.poll), now = S(fields.poll);
        if (was !== now) {
          const cast = read(TAB.post_votes).rows
            .filter(v => S(v.post_id) === S(r.post_id)).length;
          if (cast) {
            return jsonOut({ error: 'This poll has ' + cast + ' vote' + (cast === 1 ? '' : 's')
              + '. Changing the options would strand them — delete the post and repost, or leave '
              + 'the options as they are.' });
          }
        }
      }

      const wrote = [];
      Object.keys(fields).forEach(f => {
        if (POST_EDITABLE.indexOf(f) === -1) return;
        let v = fields[f];
        /* Written as the same WORDS the sheet already holds. TRUE_ reads 'TRUE', 'yes', '1' and
           a real boolean alike, so writing the word keeps every reader agreeing. */
        if (f === 'pinned' || f === 'active') v = TRUE_(v) ? 'TRUE' : 'FALSE';
        /* A date typed by hand. Parsed as DD/MM/YYYY and stored as a real Date, so the feed can
           sort on it — a string in that cell sorts as text, which puts 09/06 above 22/02 and
           below 1/12. Refused rather than stored wrong: a post that silently moves to the bottom
           of the feed is the kind of failure nobody connects to the edit that caused it. */
        /* The form calls it `posted_on` because that is what it has always been called on the
           phone. Where it LANDS is whichever column this sheet keeps. */
        /* THE NAME THE FORM USES IS NOT THE NAME OF THE COLUMN. The phone has always called this
           `posted_on`; this sheet keeps `creation_date`. Writing the form's name would have gone
           to a column that is not there — caught now rather than discarded silently, but caught is
           not the same as working. */
        let col = f;
        if (f === 'posted_on' || f === 'creation_date') {
          if (!S(v)) return;
          const when = sheetDate(v);
          if (!when) { wrote.push('!posted_on'); return; }
          v = when;
          col = dateCol_(t);
        }
        setCell(t, r, col, v);
        wrote.push(col);
      });

      if (wrote.indexOf('!posted_on') !== -1) {
        return jsonOut({ error: 'That date did not make sense — use DD/MM/YYYY. Everything else '
          + 'was saved.' });
      }
      clearCache();
      return jsonOut({ success: true, wrote });
    }

    /* --- LETTING A POST THROUGH, OR TURNING IT DOWN --------------------------------------------
       The other half of anybody being able to post. `on` is true to approve and false to refuse.

       REFUSING DOES NOT DELETE. The row stays, marked, because a post you turned down is exactly
       the one you might have to show somebody afterwards — a parent asking why, or a safeguarding
       question about what a child put up. Deleting it is the one thing that cannot be undone, and
       it would destroy the only record of a decision you made. --- */
    if (action === 'approvePost') {
      const t = read(TAB.posts);
      const r = rowById_(t, 'post_id', body.id, body.rowIndex);
      if (!r) return jsonOut({ error: 'No post with that id.' });
      if (t.headers.indexOf('approved') < 0) {
        return jsonOut({ error: 'The posts tab has no `approved` column. Run ensureSchema() — '
          + 'nothing was changed.' });
      }
      const yes = TRUE_(body.on);
      const by = S(body.adminName) || S(body.name);
      setCell(t, r, 'approved', yes ? '' : 'REFUSED');
      setCell(t, r, 'approved_by', by);
      setCell(t, r, 'approved_on', new Date());
      clearCache();

      /* TELL WHOEVER POSTED IT, either way. Somebody who put up a photograph and heard nothing
         assumes it was lost; somebody told it was turned down can ask why, which is a conversation
         and not a mystery. */
      const who = findPerson(S(r.author));
      if (who) notify(personDisplayName(who),
        yes ? 'Your post is up' : 'Your post was not put up',
        yes ? 'It is on the Posts screen now.\n\n— @family.'
            : 'It has not been put up. If you would like to know why, just reply.\n\n— @family.');

      return jsonOut({ success: true, approved: yes });
    }

    /* --- admin deletes a post — `active` FALSE, for the same reason a resource is ---------------
       Likes, votes and reactions are all rows elsewhere pointing at this post_id. Remove the row
       and every one of them points at nothing, which renders as a like count on a post that is
       not there. The picture stays in Drive; the likes stay counted. --- */
    if (action === 'deletePost') {
      const t = read(TAB.posts);
      const r = rowById_(t, 'post_id', body.id, body.rowIndex);
      if (!r) return jsonOut({ error: 'No post with that id.' });
      const on = TRUE_(body.on);
      setCell(t, r, 'active', on ? 'TRUE' : 'FALSE');
      clearCache();
      return jsonOut({ success: true, active: on });
    }

    /* ---------- `orderPrints` WAS HERE, AND NOTHING EVER KNOCKED ON IT ---------------------------
       It priced a basket of printed papers from the SHEET rather than from the request — the right
       decision, and the note above it made the argument at length: a total posted by a browser is a
       total the client chose. There is no sheet. Page counts and print prices are in
       `data/questions.json`, which the backend cannot read.

       AND THE FRONT END NEVER CALLED IT. `cart-send` in js/resource.js has always been
       `toast('Checkout is the next thing to build')`. So this was a priced, guarded, access-listed
       endpoint that no version of the app has ever posted to — which is why removing it costs the
       basket nothing: the basket is local, it still totals, and the button still says the same
       sentence. What is actually missing is a checkout, and it was missing before this. */

    /* --- small per-person saves -------------------------------------------------------------- */
    const savePerson = (field, value) => {
      const t = read(TAB.people);
      const r = findPerson(S(body.name), S(body.personId));
      if (!r) return jsonOut({ error: 'Person not found.' });
      if (t.headers.indexOf(field) < 0) {
        /* setCell returns false for a column that does not exist and says nothing. That is how
           four pricing fields were written and lost four times over. Said out loud here, because
           nobody can act on an error they were never shown. */
        return jsonOut({ error: 'The sheet has no `' + field + '` column. Run ensureSchema() — '
          + 'nothing was saved.' });
      }
      setCell(t, r, field, value);
      return jsonOut({ success: true });
    };
    if (action === 'saveNotepad') return savePerson('notepad', S(body.notepad));

    /* --- posting -------------------------------------------------------------------------------
       An admin picks a photograph on their phone and it lands in the Drive folder AND in the posts
       tab, in one go. Two places, one action — which is the only way they stay in step.

       The picture arrives as base64 because a phone cannot hand Apps Script a file any other way.
       It is resized on the phone first, so what arrives is a few hundred kilobytes rather than the
       five megabytes a modern camera produces. */
    if (action === 'addPost') {
      const folder = getPostFolder();
      if (!folder) {
        return jsonOut({ error: 'No posts folder. Add a row to the config tab: '
          + 'key `posts_folder`, value the id from the folder URL.' });
      }

      /* ---------- SEVERAL PICTURES AND CLIPS, AND THE FIRST IS STILL WHERE IT ALWAYS WAS ----------
         `data` / `image` ARE THE FIRST ITEM exactly as before, so a phone older than this deploy
         still posts; `media` is the list of the rest, each either a `data:` URL to upload or an
         address to keep. One helper for both halves, because the first picture and the fifth are
         the same act and two copies of "save a file to the posts folder" is two places for the
         sharing line to be forgotten. */
      const stamp = new Date().getTime();
      let n = 0;
      const keep_ = raw => {
        const v = S(raw).trim();
        if (!v) return '';
        if (!/^data:/i.test(v)) return v;
        const parts = v.split(',');
        const type = ((parts[0] || '').match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
        const ext = ({ 'image/jpeg': 'jpg', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v' })[type]
          || (type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
        const blob = Utilities.newBlob(Utilities.base64Decode(parts[1] || ''), type,
          'post-' + stamp + '-' + (n++) + '.' + ext);
        const file = folder.createFile(blob);
        /* Readable by anyone with the link — otherwise the picture is in the folder and shows as
           a broken image to every client, which is the failure that would look like a bug in the
           site rather than a permission. */
        file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
        /* `#video` IS HOW THE PHONE KNOWS WHICH ELEMENT TO DRAW. A Drive address names no type. */
        return 'https://drive.google.com/file/d/' + file.getId() + '/view'
          + (/^video\//i.test(type) ? '#video' : '');
      };
      const rest = (Array.isArray(body.media) ? body.media : []).filter(x => S(x).trim());
      /* A LIST WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED. Without the column
         `addRow` would drop the rest with a line in the log and the post would go up holding one of
         the five pictures somebody chose — a success message over a post that is not what they
         made. `?setup=1` creates it. */
      const tp = read(TAB.posts);
      if (rest.length && tp.headers.indexOf('media') < 0) {
        return jsonOut({ error: 'The posts tab has no media column yet, so only one picture could '
          + 'be kept. Run ?setup=1 once, then post again.' });
      }
      let url = '';
      const more = [];
      try {
        url = keep_(S(body.data)) || S(body.image).trim();
        rest.forEach(x => { const u = keep_(x); if (u) more.push(u); });
      } catch (err) {
        return jsonOut({ error: 'Could not save the picture. ' + driveTrouble_(err) });
      }
      /* THE FIRST MAY HAVE COME IN THE LIST, from a phone that sent nothing else. */
      if (!url && more.length) url = more.shift();
      if (!url) return jsonOut({ error: 'A post needs a picture.' });

      /* WHO IT IS FROM, which is not the same as who pressed the button.
         An admin posts as the business by default — the feed should read @family., not the name of
         whoever happened to have their phone out. Posting under your own name is a choice you
         make, not the default you fall into.
         The person who actually did it is still recorded, so nothing is lost. */
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      const iAmAdmin = hasRole(me, 'admin');
      /* POSTING AS THE BUSINESS IS AN ADMIN'S TO DO. Anybody else posts as themselves, whatever the
         request says — a client whose post went up signed "@family." would be the site putting your
         name to something you had not seen. */
      const asBrand = iAmAdmin && norm(body.postAs) !== 'me';
      const t = tp;
      addRow(t, {
        post_id: 'PO' + new Date().getTime(),
        author: asBrand ? brandName() : (personDisplayName(me) || S(body.name)),
        posted_by: personDisplayName(me) || S(body.name),
        image: url,
        media: more.join(' | '),
        caption: S(body.caption),
        body: S(body.body),
        location: S(body.location),
        poll: S(body.poll),
        /* The FILE's date, not the clock's. They are the same second for something uploaded now,
           and different for anything ever moved or re-uploaded — so reading it from the file is
           the version that stays true. */
        /* WHEN THE PHOTOGRAPH WAS MADE, from the file itself — not the moment somebody pressed
           Post. A picture chosen from the folder may have been taken in February, and dating it
           today puts it at the top of a feed above things that happened after it. */
        creation_date: (function () {
          try {
            const id = (url.match(/\/d\/([\w-]+)/) || [])[1];
            return id ? DriveApp.getFileById(id).getDateCreated() : new Date();
          } catch (err) { return new Date(); }
        })(),
        uploaded_date: new Date(),
        active: 'TRUE',
        /* YOURS GOES UP. EVERYBODY ELSE'S WAITS. Blank rather than TRUE for an admin, because blank
           already means "never needed approving" — every row that predates this column reads that
           way, and writing TRUE would make an admin's post a DIFFERENT kind of approved from a post
           made last year. One meaning per value. */
        approved: iAmAdmin ? '' : 'PENDING',
      });
      clearCache();

      /* SOMEBODY HAS TO KNOW IT IS WAITING, or it waits for ever. This is the whole mechanism: a
         post nobody is told about is a post nobody approves, and the person who made it is left
         wondering why the app ate their photograph. */
      if (!iAmAdmin) {
        notify(adminName_(), 'A post is waiting for you',
          personDisplayName(me) + ' has posted a photograph.\n\n'
          + (S(body.caption) ? '"' + S(body.caption) + '"\n\n' : '')
          + 'It is not visible to anybody until you let it through. Open @family. and press the '
          + 'post to approve or turn it down.');
      }

      return jsonOut({ success: true, image: url, media: [url].concat(more), pending: !iAmAdmin });
    }

    /* Anything in the folder that is not yet a row becomes one. This is the sync: drop files in
       from a computer, press this, and they appear — without which the folder and the tab drift
       apart the first time somebody uploads outside the app. */
    if (action === 'scanPosts') {
      /**
       * THE FILE'S NAME IS THE CAPTION.
       *
       * Every post the scan made arrived with an empty caption and the name thrown away, so the
       * only way to caption anything was to open each post and type in what was already written
       * on the file. Naming a photograph in Drive is the natural place to write a caption — you
       * are already there, on a phone, having just taken it.
       *
       * Only the EXTENSION is removed. Not the date, not the brackets, not a number in front:
       * those are somebody's own words about their own photograph, and a scan that decided which
       * parts of a filename were meaningful would be guessing about the one thing it was told
       * directly.
       */
      const folder = getPostFolder();
      if (!folder) return jsonOut({ error: 'No posts folder. Add `posts_folder` to the config tab.' });

      /* THE SCAN DOES NOT NEED TO WRITE, and a check I added here was refusing to run it unless it
         could. It writes only in order to SHARE each file — and a folder that is already shared
         with anyone who has the link shares its contents by inheritance, so on this folder that
         call has nothing to do.

         Which makes this the route that works while the upload does not: drop photographs into the
         folder from the Drive app or a computer, press ⟳, and they become posts. Reading a folder
         needs only read access, and that is what the deployment has.

         A file that genuinely cannot be shared is still added, and counted, and reported. A
         photograph that might not load is better than a photograph silently skipped. */
      const t = read(TAB.posts);
      /* Every row's file id, and the ROW itself — not just a flag. A row already known might still
         be missing its date, and the point of a sync is that the second run fixes what the first
         one could not know. */
      const known = {};
      t.rows.forEach(r => {
        const id = (S(r.image).match(/\/d\/([\w-]+)/) || [])[1];
        if (id) known[id] = r;
      });
      let dated = 0;

      let added = 0, unshared = 0, captioned = 0;
      /* WHAT WAS ACTUALLY SEEN. A scan that finds nothing and says "nothing found" gives you no
         way to tell a folder in the wrong place from a folder full of shortcuts — so it reports
         every file it looked at and why each one was skipped. */
      const seen = [];

      /* Subfolders too. `getFiles()` does not descend, and a folder of folders is the ordinary way
         somebody organises photographs — finding nothing in it and blaming the id would send you
         looking in exactly the wrong place. */
      const folders = [folder];
      const sub = folder.getFolders();
      while (sub.hasNext() && folders.length < 20) folders.push(sub.next());

      for (let fi = 0; fi < folders.length; fi++) {
        const files = folders[fi].getFiles();
        while (files.hasNext()) {
          const f = files.next();
          const mime = S(f.getMimeType());
          const name = S(f.getName());

          if (known[f.getId()]) {
            /* Already a post — but if it has no date, take the file's. This is how the ten rows
               pasted from a CSV get their real dates without anybody typing one, and how a row
               whose date was cleared gets it back. */
            const row = known[f.getId()];
            const note = [];

            if (!postWhen_(row)) {
              /* Into whichever column this sheet keeps, not into a fourth one of our own. */
              setCell(t, row, dateCol_(t), f.getDateCreated());
              dated++;
              note.push('date filled in');
            }

            /* RENAME THE FILE AND THE CAPTION FOLLOWS. That is the whole point of taking the name:
               if it only applied the first time, correcting a typo would mean correcting it twice,
               in two places, one of which nobody would remember.
               But only while the caption still MATCHES a filename — the moment somebody edits the
               caption in the app it is theirs, and a scan that overwrote it would be the app
               throwing away the more considered of the two. So: empty, or still equal to the name
               the file used to have. */
            /* JUST THE NAME. The scan does not touch `caption` at all any more — it records what
               the file is called and the payload decides what to show. A rename therefore follows
               automatically, and a caption somebody typed is safe without anything having to
               check whether it was safe. */
            if (S(row.file_name) !== name) {
              setCell(t, row, 'file_name', name);
              captioned++;
              note.push('name recorded');
            }

            seen.push(name + ' — already a post' + (note.length ? ', ' + note.join(', ') : ''));
            continue;
          }

          /* A picture by MIME TYPE or by the end of its name. A shortcut, a HEIC, or a file Drive
             has not finished processing all fail a mime test and are plainly still photographs. */
          const looksLikeAPicture = mime.indexOf('image/') === 0
            || /\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i.test(name);
          if (!looksLikeAPicture) { seen.push(name + ' — not a picture (' + mime + ')'); continue; }

          try {
            f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
          } catch (err) {
            /* Sharing can fail on a file somebody else owns, or because this deployment has read
               access and no more. Neither stops the post being made: if the FOLDER is shared with
               anyone who has the link, the file already is too, and the picture will load. */
            unshared++;
            seen.push(name + ' — added; sharing was not changed');
          }
          addRow(t, {
            post_id: 'PO' + new Date().getTime() + '-' + added,
            author: '',
            image: 'https://drive.google.com/file/d/' + f.getId() + '/view',
            /* Blank. Nobody has typed a caption for a photograph that has just appeared, and the
               payload will show the file's name until somebody does. */
            caption: '',
            file_name: name,
            location: '',
            /* The file's own date, not today's — a folder of a year's photographs added in one go
               would otherwise all claim to have happened this afternoon.
               Both, because they are different facts and the sheet has room for both: when the
               photograph was made, and when it arrived. */
            creation_date: f.getDateCreated(),
            uploaded_date: new Date(),
            active: 'TRUE',
          });
          added++;
          if (added >= 50) break;    // Apps Script has six minutes; fifty is a comfortable batch
        }
        if (added >= 50) break;
      }
      clearCache();
      return jsonOut({
        success: true, added: added, dated: dated,
        folder: folder.getName(),
        looked: folders.length,          // how many folders, so a subfolder problem is visible
        /* Only worth mentioning if it happened, and only as a note: on a folder shared with anyone
           who has the link these pictures load perfectly well. */
        sharingUnchanged: unshared || undefined,
        recaptioned: captioned || undefined,
        seen: seen.slice(0, 30),         // and what was skipped, and why
      });
    }

    /* --- listing a tutor -------------------------------------------------------------------------
       `listed` decides whether a tutor appears on the site at all. It has always worked; there was
       simply no way to change it without opening the spreadsheet, which makes it a column with a
       comment rather than a control.
       Admin only, and deliberately so: a tutor who could list themselves could put themselves in
       front of clients before you had agreed to it. */
    /* ---------- IT LOOKED THE PERSON UP ITSELF, AND HALF THE ROSTER HAS NO `full_name` ----------
       REPORTED AS *"why does george have a crossed out eye even if i click it. then it says no such
       person."* The tile sent the DISPLAY name and this compared it against `full_name` alone —
       but `personDisplayName`, which is what built that name, is `full_name` OR `first + last`.
       A row with the two halves filled in and the whole-name cell empty therefore produced a name
       this lookup could never match: the switch refused every press, put the tile back, and said
       the person did not exist while their card was on the screen above it.

       `findPerson` IS THE ONE READER and resolves person_id, full_name, first + last, handle and
       username in that order — which is exactly the list `personDisplayName` draws from. A second
       lookup written out here is the second reader this repository records under `documents_()`,
       `factsNow_` and `childrenOf`, and this is what it cost. The phone sends the id now as well,
       so the name is the fallback rather than the only route. */
    if (action === 'setListed') {
      const t = read(TAB.people);
      const who = findPerson(S(body.who), S(body.whoId));
      if (!who) return jsonOut({ error: 'No such person.' });
      /* Written as the word rather than as a blank when off — blank already MEANS listed, for
         every row that predates the column, so an empty cell cannot also mean hidden. */
      setCell(t, who, 'listed', TRUE_(body.on) ? 'TRUE' : 'FALSE');
      clearCache();
      return jsonOut({ success: true, listed: TRUE_(body.on) });
    }

    /* --- a forgotten PIN --------------------------------------------------------------------------
       ASKED FOR AS *"add forgot pin option. it will send an email to their email."*

       IT SAYS THE SAME SENTENCE WHATEVER HAPPENS, and that is the only security this has. A reply
       that said "no such person" would turn the sign-in card into a machine for confirming who
       holds an account here — and half the people on this tab are children. So every branch below
       returns one success, and the difference between them is only whether an email leaves.

       IT SETS A NEW PIN RATHER THAN SENDING A LINK. A reset link needs a token column, an expiry,
       a second screen and a route that works when nobody is signed in; a temporary PIN needs none
       of that and lands in the one place this app already trusts — `authSetPin_` writes the hash
       and clears the plaintext, exactly as a change from the settings column does.

       SESSIONS ARE NOT ENDED, and that is deliberate and is the opposite of `changePin`. There the
       person asking has proved who they are, so ending every other session removes an intruder.
       Here anybody may ask, so ending sessions would let a stranger sign the owner out of their own
       phone by typing their name. Whoever reads the email can sign in with what it says; whoever is
       already signed in stays signed in. */
    if (action === 'forgotPin') {
      const said = { success: true,
        message: 'If there is an account with that email, a new PIN is on its way. Check your '
               + 'inbox, then change it in your settings.' };

      const asked = norm(body.who);
      if (asked.indexOf('@') === -1) return jsonOut({ error: 'Type your email address first.' });

      const tPeople = read(TAB.people);
      /* ---------- BY THE ADDRESS AND NOTHING ELSE, THE SAME RULE AS SIGNING IN -------------------
         THIS WAS `findPerson(asked)` AND THEN THE ADDRESS, compared through `key` — which strips
         every dot and the `@`, so `halex.dias@x.com` and `halexdias@xcom` were one address. With the
         address now the only thing anybody signs in with (see `verifyLogin`), the box on the card
         is an address and this reads it exactly as that handler does: `norm` on both sides, whole.

         TWO ROWS ON ONE ADDRESS SENDS NOTHING. Which of the two accounts would get the new PIN is a
         guess, and the reply is the same sentence either way — so a stranger learns nothing and the
         owner fixes the sheet. */
      const hits = tPeople.rows.filter(x => norm(x.email) === asked);
      const r = hits.length === 1 ? hits[0] : null;
      if (!r) return jsonOut(said);

      const to = S(r.email);
      if (!to) return jsonOut(said);

      /* SIX DIGITS, AND NOT ONE OF THE ONES `changePin` REFUSES. Generated rather than chosen, and
         re-drawn until it passes the same test — a reset that handed somebody 111111 would be the
         site issuing the PIN it tells people not to pick. */
      let fresh = '';
      for (let tries = 0; tries < 20; tries++) {
        fresh = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
        if (!/^(\d)\1+$/.test(fresh) && fresh !== '123456' && fresh !== '123123') break;
      }

      const row = tPeople.rows.find(x => x._row === r._row);
      authSetPin_(tPeople, row, fresh);
      /* AND THE THROTTLE GOES WITH IT. Without this the reset is useless exactly when it is
         needed: somebody who has just been locked out asks for a new PIN, the e-mail arrives,
         and the site refuses the six digits it just sent for up to an hour because of wrong
         answers at a PIN that no longer exists. Whoever read that e-mail holds the mailbox,
         which is a stronger claim than the counter was ever measuring. See
         `authClearThrottle_`. */
      authClearThrottle_(tPeople, row);
      clearCache();

      /* NOT `notify`, which looks the person up again by name — the row is already in hand, and a
         second lookup on a name that may have matched by email is a second chance to send somebody
         else's PIN to somebody else's inbox. */
      try {
        MailApp.sendEmail({ to: to, name: BRAND_NAME,
          subject: 'Your new ' + BRAND_NAME + ' PIN',
          body: 'Somebody asked for a new PIN on your ' + BRAND_NAME + ' account.\n\n'
              + 'Your new PIN is ' + fresh + '\n\n'
              + 'Sign in with it, then change it under Settings → Your PIN.\n\n'
              + 'If this was not you, sign in and change it now — whoever asked cannot read '
              + 'this email, so they do not have it.' });
      } catch (err) { /* a mail quota is not a reason to tell a stranger the account exists */ }

      return jsonOut(said);
    }

    /* --- ONE MESSAGE TO EVERYBODY WAS HERE -------------------------------------------------------
       `broadcast` — `sendMessage` without the picker and without the five-minute gap, admin-only —
       and it went with its only door, the "Message everyone" card at the foot of the Messages
       column, on the report "remove the note to everyone button". A handler with no door is the
       `orderPrints` shape, and it would also have been a live admin action nothing could see or
       test. The one idea in it worth keeping if it is ever rebuilt: every row of one send needs its
       own `message_id`, because `'M' + Date.now()` is one millisecond for a whole loop and
       `readMessage` finds a message by that id. */

    /* --- reacting -------------------------------------------------------------------------------
       One per person per post, and it can be changed or taken back — the same shape as a vote,
       because it is the same kind of thing: a choice among a few, held by a person. */
    if (action === 'reactPost') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in to react.' });

      const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
      if (!post) return jsonOut({ error: 'That post is gone.' });

      /* The emoji must be one this post OFFERS. Without the check anybody could react with any
         character and it would appear beside the real ones as though it belonged.
         The same function the payload used to build the row, so the two cannot disagree — reading
         the set twice in two places is how a face gets drawn that the server then refuses. */
      const allowed = reactionSet(post);
      const emoji = S(body.emoji).trim();
      if (allowed.indexOf(emoji) === -1) return jsonOut({ error: 'That is not one of them.' });

      const t = read(TAB.post_reactions);
      const mine = t.rows.find(x => S(x.post_id) === S(body.postId)
                                 && S(x.person_id) === S(me.person_id));
      if (mine) {
        if (S(mine.emoji) === emoji) {          // the same one again takes it back
          delRow(t, mine);
          clearCache();
          return jsonOut({ success: true, emoji: '' });
        }
        setCell(t, mine, 'emoji', emoji);
        setCell(t, mine, 'reacted_on', new Date());
      } else {
        addRow(t, {
          reaction_id: 'RE' + new Date().getTime(),
          post_id: S(body.postId),
          person_id: S(me.person_id),
          emoji: emoji,
          reacted_on: new Date(),
        });
      }
      clearCache();
      return jsonOut({ success: true, emoji: emoji });
    }

    /* --- saying something under a post ------------------------------------------------------------
       THE SAME SHAPE AS A REACTION AND A VOTE, one column wider: a post_id, a person_id, what they
       said and when. Three tabs behaving the same way is three things a reader already understands.

       IT IS NOT ONE PER PERSON, which is the one place it differs and the reason it is an `addRow`
       with no lookup first. A reaction and a vote are a CHOICE — you have one, and pressing again
       changes or takes it back. A remark is not a choice; somebody who says two things has said two
       things.

       THE POST HAS TO BE ONE THEY CAN SEE. A post waiting for approval is sent to nobody but its
       author and an admin, so commenting on one is a request that could only have been made by
       guessing an id — and answering it would confirm the id exists. Refused in the same sentence
       as a post that is gone, because "no" and "not for you" are the same answer to somebody
       guessing.

       2,000 CHARACTERS, WHICH IS `sendMessage`'S CAP AND FOR ITS REASON: a cell has a limit, and a
       person who typed an essay should be told rather than have the sheet quietly keep half of it.
       Refused rather than truncated — a comment that posts as something other than what was typed
       is worse than one that does not post. */
    if (action === 'addComment') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in to comment.' });

      /* ---------- THE SAME THREE ANSWERS `doGet` GIVES, AND THEY ARE READ OFF THE SAME COLUMN ----
         `post.person_id` WAS THE FIRST VERSION OF THIS AND THE POSTS TAB HAS NO SUCH COLUMN.
         `check-rows.js` named it — the check that asks whether a name is a column of THIS tab
         rather than of any tab, which is the fault it was written for. Whose post it is lives in
         `author`, resolved through `findPerson` exactly as the payload resolves it; a second way of
         asking "is this yours" is a second answer to get wrong on the one question that decides
         who may write under somebody's photograph. */
      const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
      const state = post ? norm(post.approved) : '';
      const theirs = !!post && S(post.author) && findPerson(S(post.author))
        && S(findPerson(S(post.author)).person_id) === S(me.person_id);
      const seen = !!post && ON_(post.active) && state !== 'refused'
        && (state !== 'pending' || theirs || isAdminPerson(S(body.name)));
      if (!seen) return jsonOut({ error: 'That post is gone.' });

      const text = S(body.body).trim();
      if (!text) return jsonOut({ error: 'Nothing to say?' });
      if (text.length > 2000) {
        return jsonOut({ error: 'That is longer than 2,000 characters. Shorten it a little.' });
      }

      const t = read(TAB.post_comments);
      const id = 'CM' + new Date().getTime();
      addRow(t, {
        comment_id: id,
        post_id: S(body.postId),
        person_id: S(me.person_id),
        body: text,
        said_on: new Date(),
        active: 'TRUE',
      });
      clearCache();
      return jsonOut({ success: true, commentId: id });
    }

    /* --- taking one down ---------------------------------------------------------------------------
       A CELL, NOT A DELETED ROW, and the argument is the one `approved` already makes on a post: a
       comment you took down is the one you may need to show somebody afterwards, and deleting it is
       the single thing here that cannot be undone.

       THE AUTHOR OR AN ADMIN. The gate can only see that somebody is signed in — whose comment it
       is is a question only this can answer, which is why `deleteComment` is `self` in the access
       table and the real rule is the next two lines. It is also the ONLY place that rule is
       written: `doGet` sends `canRemove` per comment so the phone draws what the server decided
       rather than deciding again. */
    if (action === 'deleteComment') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in first.' });

      const t = read(TAB.post_comments);
      const row = t.rows.find(x => S(x.comment_id) === S(body.commentId));
      if (!row || !ON_(row.active)) return jsonOut({ error: 'That comment is gone.' });

      if (S(row.person_id) !== S(me.person_id) && !isAdminPerson(S(body.name))) {
        return jsonOut({ error: 'That is not yours to remove.' });
      }
      setCell(t, row, 'active', 'FALSE');
      clearCache();
      return jsonOut({ success: true });
    }

    /* --- voting in a poll -----------------------------------------------------------------------
       One vote per person per post, and it can be changed. Changed rather than added, because a
       person who taps twice has changed their mind, not voted twice — and the row is updated so
       there is never a second one to reconcile. */
    if (action === 'votePoll') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in to vote.' });

      const post = read(TAB.posts).rows.find(x => S(x.post_id) === S(body.postId));
      if (!post) return jsonOut({ error: 'That post is gone.' });

      const opts = S(post.poll).split(',').map(x => x.trim()).filter(Boolean);
      const choice = S(body.choice).trim();
      /* The choice must be one of the OPTIONS. Without this anybody could post any string and it
         would appear as an answer nobody was offered. */
      if (opts.indexOf(choice) === -1) return jsonOut({ error: 'That is not one of the answers.' });

      const t = read(TAB.post_votes);
      const mine = t.rows.find(x => S(x.post_id) === S(body.postId)
                                 && S(x.person_id) === S(me.person_id));
      if (mine) {
        /* Tapping the answer you already chose takes the vote back — the same gesture that cast
           it, which is how every poll a person has used already behaves. */
        if (S(mine.choice) === choice) {
          delRow(t, mine);
          clearCache();
          return jsonOut({ success: true, choice: '' });
        }
        setCell(t, mine, 'choice', choice);
        setCell(t, mine, 'voted_on', new Date());
      } else {
        addRow(t, {
          vote_id: 'V' + new Date().getTime(),
          post_id: S(body.postId),
          person_id: S(me.person_id),
          choice: choice,
          voted_on: new Date(),
        });
      }
      clearCache();
      return jsonOut({ success: true, choice: choice });
    }

    /* --- the photographs already in the folder, that are not posts yet ---------------------
       UPLOADING NEEDS WRITE ACCESS. Reading the folder does not, and this deployment plainly has
       read — the captions are coming off filenames, which is the same call.
       So there is a way to post that needs nothing granted: put the photograph in the folder from
       the Drive app, and choose it here. The picture already exists and is already shared; all
       that is missing is a row, and a row is a sheet write.
       This is not a workaround for a broken feature. For a photograph taken on a phone it is
       fewer steps than uploading: it is already in Drive.
    ------------------------------------------------------------------------------------------ */
    if (action === 'folderFiles') {
      const folder = getPostFolder();
      if (!folder) return jsonOut({ error: 'No posts folder. Add `posts_folder` to the config tab.' });

      /* Which are already posts, so the list only ever offers something new. */
      const taken = {};
      read(TAB.posts).rows.forEach(r => {
        const id = (S(r.image).match(/\/d\/([\w-]+)/) || [])[1];
        if (id) taken[id] = true;
      });

      const out = [];
      const folders = [folder];
      const sub2 = folder.getFolders();
      while (sub2.hasNext() && folders.length < 20) folders.push(sub2.next());

      for (let fi = 0; fi < folders.length && out.length < 60; fi++) {
        const files = folders[fi].getFiles();
        while (files.hasNext() && out.length < 60) {
          const f = files.next();
          if (taken[f.getId()]) continue;
          const name = S(f.getName());
          const mime = S(f.getMimeType());
          /* By mime OR by the end of the name — a HEIC, a shortcut, or a file Drive has not
             finished processing all fail a mime test and are plainly still photographs. */
          if (mime.indexOf('image/') !== 0
              && !/\.(jpe?g|png|gif|webp|heic|heif|bmp|tiff?)$/i.test(name)) continue;
          out.push({
            id: f.getId(),
            name: name,
            /* The caption it would get, worked out here so the picker can show it — choosing a
               photograph and being surprised by its caption is a bad way to find out that the
               filename is the caption. */
            caption: captionFromName_(name),
            at: f.getDateCreated().getTime(),
          });
        }
      }

      /* Newest first. A photograph taken five minutes ago is the one being posted. */
      out.sort((a, b) => b.at - a.at);
      return jsonOut({ success: true, files: out, folder: folder.getName() });
    }

    /* --- messages ------------------------------------------------------------------------------
       Send, read, and flag. Everything that can refuse says which rule refused it, because "not
       allowed" tells somebody nothing about what to do next. */
    if (action === 'sendMessage') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });

      const to = findPerson(S(body.to), S(body.toId));
      if (!to) return jsonOut({ error: 'We could not find who that was meant for.' });
      if (S(to.person_id) === S(me.person_id)) {
        return jsonOut({ error: 'That is you.' });
      }

      /* THE POLICY, asked once. Both directions are checked: a rule that lets somebody write but
         not be replied to is a rule that produces a one-sided conversation. */
      if (!mayMessage(mainRole(me), mainRole(to))) {
        return jsonOut({ error: 'You cannot message them directly. An admin can pass it on.' });
      }

      const text = S(body.body).trim();
      /* A MESSAGE MAY BE WORDS, FILES OR BOTH — a photograph with nothing said about it is still
         something sent. Only a message with neither is refused. */
      const files = (Array.isArray(body.files) ? body.files : []).filter(f => f && S(f.data));
      if (!text && !files.length) return jsonOut({ error: 'Nothing to send.' });
      if (text.length > 2000) {
        return jsonOut({ error: 'That is longer than a message should be — 2,000 characters.' });
      }

      /* One every five minutes. Measured from THIS sender's last message to anybody, so a burst
         cannot be spread across recipients to get round it. */
      const t = read(TAB.messages);
      /* A FILE WITH NOWHERE TO GO IS REFUSED BEFORE ANYTHING IS UPLOADED — `addRow` would drop the
         column with a line in the log and the message would arrive without the picture it was
         sent for. `addPost`'s `media` rule, one tab along. */
      if (files.length && t.headers.indexOf('attachments') < 0) {
        return jsonOut({ error: 'The messages tab has no attachments column yet, so files cannot be '
          + 'kept. An admin needs to run ?setup=1 once — the words can still be sent on their own.' });
      }
      const mine = t.rows.filter(r => S(r.from_id) === S(me.person_id));
      const last = mine.reduce((newest, r) => {
        const at = sheetDate(r.sent_at);
        return (at && (!newest || at > newest)) ? at : newest;
      }, null);
      if (last) {
        const waited = Date.now() - last.getTime();
        if (waited < MESSAGE_GAP_MS) {
          const left = Math.ceil((MESSAGE_GAP_MS - waited) / 60000);
          return jsonOut({ error: 'One message every five minutes — ' + left
            + ' minute' + (left === 1 ? '' : 's') + ' to go.' });
        }
      }

      /* Uploaded AFTER every refusal above, so a message turned away by the gap leaves nothing
         behind in Drive. */
      const saved = msgAttachSave_(files);
      if (saved.error) return jsonOut({ error: saved.error });

      const id = 'M' + Date.now();
      addRow(t, {
        message_id: id,
        from_id: S(me.person_id),
        to_id: S(to.person_id),
        sent_at: new Date(),
        body: text,
        attachments: msgAttachIn_(saved.list),
      });
      clearCache();

      // They find out by email, because nobody sits on a tutoring site waiting for a message.
      const extra = saved.list.length
        ? '\n\n(' + saved.list.length + ' attachment' + (saved.list.length === 1 ? '' : 's')
          + ' — open it on the site.)' : '';
      notify(personDisplayName(to), 'A message from ' + personDisplayName(me),
        (text || 'Sent you ' + (saved.list.length === 1 ? 'a file.' : 'some files.'))
        + extra + '\n\n— reply on the site.');

      return jsonOut({ success: true, id: id, attachments: saved.list });
    }

    /* Somebody's conversations. Only their own — an admin reading everything does it in the
       sheet, deliberately, rather than through an endpoint that could be pointed anywhere. */
    if (action === 'messages') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      const mine = S(me.person_id);

      const rows = read(TAB.messages).rows
        .filter(r => S(r.from_id) === mine || S(r.to_id) === mine)
        .map(r => {
          /* ---------- WHO THE OTHER PERSON IS ---------------------------------------------------
             `fromName` HAS BEEN READ BY THE PHONE AND NEVER SENT. `messagesHtml_` prints
             `m.fromName || 'them'`, so every message anybody has ever received has been labelled
             "them" — the field simply was not in this reply.

             AND THE COUNTERPART IS THE THREAD. A message is between two people; which of them is
             the OTHER one depends on who is asking, and the server is the only side that knows both
             the ids and the names. Sent once here rather than looked up per row on a device that
             does not have the people tab. */
          const other = S(r.from_id) === mine ? S(r.to_id) : S(r.from_id);
          const who = findPerson('', other);
          return {
            id: S(r.message_id),
            fromId: S(r.from_id), toId: S(r.to_id),
            mine: S(r.from_id) === mine,
            withId: other,
            withName: who ? personDisplayName(who) : '',
            fromName: S(r.from_id) === mine ? personDisplayName(me)
                                            : (who ? personDisplayName(who) : ''),
            at: fmtDateTime(r.sent_at),
            body: S(r.body),
            attachments: msgAttachOut_(r.attachments),
            read: !!sheetDate(r.read_at),
          };
        });
      return jsonOut({ success: true, messages: rows, gapMs: MESSAGE_GAP_MS });
    }

    /* Marking one read. Only the recipient can — a sender marking their own message read would
       make the tick mean nothing. */
    if (action === 'readMessage') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      const t = read(TAB.messages);
      const r = t.rows.find(x => S(x.message_id) === S(body.messageId));
      if (!r) return jsonOut({ error: 'Not found.' });
      if (S(r.to_id) !== S(me.person_id)) return jsonOut({ error: 'Not yours to open.' });
      if (!sheetDate(r.read_at)) { setCell(t, r, 'read_at', new Date()); clearCache(); }
      return jsonOut({ success: true });
    }

    /* Reporting one. It is NOT deleted — a message somebody reported is the one you will most
       want to be able to show afterwards, and a deleted message cannot be shown to anybody. */
    if (action === 'flagMessage') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      const t = read(TAB.messages);
      const r = t.rows.find(x => S(x.message_id) === S(body.messageId));
      if (!r) return jsonOut({ error: 'Not found.' });
      if (S(r.to_id) !== S(me.person_id) && !isAdminPerson(S(body.name))) {
        return jsonOut({ error: 'Not yours to report.' });
      }
      setCell(t, r, 'flagged', 'TRUE');
      setCell(t, r, 'flag_reason', S(body.reason));
      clearCache();
      notify(adminName_(), 'A message was reported',
        'Reported by ' + personDisplayName(me) + '\n\nReason: ' + (S(body.reason) || '(none given)')
        + '\n\nMessage id: ' + S(r.message_id) + '\n\nIt is still in the messages tab.');
      return jsonOut({ success: true });
    }

    /* --- claiming a child ------------------------------------------------------------------
       A parent types a first and last name. Nothing happens to the child's account until the
       child accepts — so a wrong name reaches nobody, and a right one reaches somebody who gets
       to say no. */
    if (action === 'claimChild') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      /* HELD, NOT MAIN. The card is drawn for anybody who HOLDS client or admin (`mayAddChild_` reads
         `heldRoles`), and this asked for the MAIN role — so a person who is both a tutor and a parent
         was shown the card and refused behind it. `hasRole` reads every role in the cell. */
      if (!hasRole(me, 'client') && !hasRole(me, 'admin')) {
        return jsonOut({ error: 'Only a parent can add a child.' });
      }

      const typed = (S(body.firstName) + ' ' + S(body.lastName)).trim();
      if (!S(body.firstName) || !S(body.lastName)) {
        return jsonOut({ error: 'Both a first name and a last name, please.' });
      }

      /* Matched on both names together. A first name alone matches half a family, and matching
         loosely is how a parent ends up claiming a child who is not theirs. */
      const people = read(TAB.people);
      const hits = people.rows.filter(r =>
        norm(mainRole(r)) === 'student' &&
        key(S(r.first_name) + ' ' + S(r.last_name)) === key(typed));

      if (!hits.length) {
        return jsonOut({ error: 'No student called "' + typed + '". Check the spelling — it has '
          + 'to match how they signed up.' });
      }
      if (hits.length > 1) {
        return jsonOut({ error: 'More than one student is called that. Ask us to link them.' });
      }
      const child = hits[0];

      const t = read(TAB.family);
      const already = t.rows.find(r => S(r.parent_id) === S(me.person_id)
                                    && S(r.child_id) === S(child.person_id));
      if (already) {
        const st = norm(already.state);
        return jsonOut({ error: st === 'accepted' ? 'They are already on your account.'
                              : st === 'refused'  ? 'They declined that request.'
                              : 'They have a request from you waiting.' });
      }

      /* `addRow` ANSWERS null WHEN THE TAB CANNOT BE OPENED, and this said success over nothing. */
      const linked = addRow(t, {
        link_id: 'F' + Date.now(),
        parent_id: S(me.person_id),
        child_id: S(child.person_id),
        child_typed: typed,
        state: 'asked',
        asked_on: new Date(),
      });
      if (!linked) return jsonOut({ error: 'The family tab could not be opened — nothing was saved.' });
      clearCache();

      notify(personDisplayName(child), 'Someone has added you to their account',
        personDisplayName(me) + ' says they are your parent or guardian.\n\n'
        + 'Open @family. and accept or decline it — nothing changes until you do.');

      return jsonOut({ success: true });
    }

    /* The child answering. Only the child named in the row, and only once. */
    if (action === 'answerClaim') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });

      const t = read(TAB.family);
      const r = t.rows.find(x => x._row === Number(body.rowIndex));
      if (!r) return jsonOut({ error: 'Not found.' });
      /* THE CHILD, and nobody else — not the parent who asked, not another student, not an admin.
         A consent somebody else can give on your behalf is not a consent. */
      if (S(r.child_id) !== S(me.person_id)) {
        return jsonOut({ error: 'That request is not yours to answer.' });
      }
      if (norm(r.state) !== 'asked') return jsonOut({ error: 'That was already answered.' });

      const yes = TRUE_(body.accept);
      setCell(t, r, 'state', yes ? 'accepted' : 'refused');
      setCell(t, r, 'answered_on', new Date());
      clearCache();

      const parent = findPerson(S(r.parent_id));
      if (parent) {
        notify(personDisplayName(parent),
          yes ? 'They accepted' : 'They declined',
          personDisplayName(me) + (yes ? ' is now on your account.' : ' declined the request.'));
      }
      return jsonOut({ success: true });
    }

    /* --- changing a PIN --------------------------------------------------------------------
       Deliberately NOT a profile field. Everything on that form autosaves as you type, and a PIN
       that autosaves is a PIN that changes when somebody leans on a keyboard — and locks the owner
       out of their own account.
       So it asks for the CURRENT one first. That is the whole protection: an unlocked laptop, a
       shared computer or a session left open cannot be used to take an account, because taking it
       needs something only the owner knows. */
    /* ---------- THE TUTOR AGREEMENT: A TICK THAT STAYS TICKED ------------------------------------
       ASKED FOR AS *"a draft widget for tutors, just do a draft small contract with tick to agree.
       cant untick after ticked."* The phone's box is disabled once ticked, and that is the
       convenience; THIS is the rule — a row already carrying a signature is refused rather than
       re-stamped, so the date it holds is the day they agreed and nothing can move or clear it.
       There is no `agree: false` path at all, which is the only way "cannot untick" is true of a
       server anybody can post to.

       TUTORS AND ADMINS, the same test the widget roster's `tutor: true` flag reads. A parent
       posting here gets a sentence rather than a signature on a contract they are not party to. */
    if (action === 'signAgreement') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'We could not find your account.' });
      if (!hasRole(me, 'tutor') && !hasRole(me, 'admin'))
        return jsonOut({ error: 'The tutor agreement is for tutors.' });
      /* ALREADY SIGNED IS AN ANSWER, NOT A FAILURE. It was an error, so a phone that had not seen the
         tick yet (signed in before it was made on another one) unticked the box, re-enabled it and
         toasted a refusal about an agreement that WAS signed. The reply carries the date either way,
         and the phone ticks and locks the box from it. */
      if (S(me.agreement_signed_at))
        return jsonOut({ success: true, already: true,
                         signedAt: S(me.agreement_signed_at), version: S(me.agreement_version) });
      const version = S(body.version).slice(0, 40);
      if (!version) return jsonOut({ error: 'Which version of the agreement was this?' });
      const t = read(TAB.people);
      /* BOTH COLUMNS BEFORE EITHER IS WRITTEN. It checked the first only, so with `agreement_version`
         missing the date landed and `jsonOut` then called the whole thing a failure — a signature on
         the sheet under a phone that unticked it. */
      const lacking = ['agreement_signed_at', 'agreement_version'].filter(c => t.headers.indexOf(c) === -1);
      if (lacking.length)
        return jsonOut({ error: 'The sheet has no column for: ' + lacking.join(', ') + '. Run ?setup=1 — nothing was saved.' });
      const row = t.rows.find(x => x._row === me._row) || me;
      const at = fmtDateTime(new Date());
      setCells(t, row, { agreement_signed_at: at, agreement_version: version });
      return jsonOut({ success: true, signedAt: at, version: version });
    }

    /* ---------- A NEW WORD FOR YOUR OWN HANDLE --------------------------------------------------
       ASKED FOR AS *"handles should be their name and a virtuous describing word. they can randomise
       it but it will follow that general name."* So there is no box to type a handle into any more:
       the Settings card shows the one you have and a Randomise button, and this is what it presses.
       It asks `handleMake_` for another `<first>_<virtue>`, never the one you already have, and
       writes it.

       THE ROW IS THE TOKEN'S. `accessDenied` writes `body.personId` from the session before this
       runs, so a request naming somebody else's id randomises the asker's own handle — there is no
       admin path and no target, because a handle is the one thing about a person nobody else
       should be choosing for them.

       NO COOLDOWN, AND THAT IS NOT AN OVERSIGHT. A month between changes existed because a typed box
       let somebody try variations until a rude one got past the blocklist. Every handle this can
       produce is a first name and a word somebody chose for the list, so pressing it again is a
       child looking for a word they like rather than an attempt at anything.

       ALL THREE COLUMNS BEFORE ANY IS WRITTEN. `setCells` loses a write to a header that is not
       there and `jsonOut` then calls the whole thing a failure — over a handle that HAD changed,
       with nothing in `handle_was` to say what it was. */
    if (action === 'randomiseHandle') {
      const t = read(TAB.people);
      const lacking = ['handle', 'handle_was', 'handle_changed_at']
        .filter(c => t.headers.indexOf(c) === -1);
      if (lacking.length)
        return jsonOut({ error: 'The sheet has no column for: ' + lacking.join(', ') + '. Run ?setup=1 — nothing was saved.' });
      const want = key(body.personId);
      const r = want ? t.rows.find(x => key(x.person_id) === want) : null;
      if (!r) return jsonOut({ error: 'We could not find your account.' });
      const was = S(r.handle);
      const made = handleMake_(r, r.first_name, was);
      if (!made) return jsonOut({ error: 'No free handle could be found just now. Nothing was changed '
                                       + '— try again.' });
      /* `handle_was` IS A HISTORY, newest first and capped — see `handleWasWith_`. It was one cell
         overwritten by each change, which answered "who was @foo" only about the most recent name. */
      setCells(t, r, { handle: made, handle_was: handleWasWith_(r.handle_was, was),
                       handle_changed_at: new Date() });
      clearCache();
      return jsonOut({ success: true, handle: made, was: was });
    }

    if (action === 'changePin') {
      const r = findPerson(S(body.name), S(body.personId));
      if (!r) return jsonOut({ error: 'Not signed in.' });

      const now = S(body.currentPin), next = S(body.newPin);

      /* An admin resetting somebody else's PIN skips the old one — they cannot know it, and a
         forgotten PIN is the commonest reason anyone asks. Their own still needs it. */
      const asker = S(body.adminName) || S(body.name);
      const resetting = key(asker) !== key(S(body.name)) && isAdminPerson(asker);

      const tPin = read(TAB.people);
      if (!resetting && !authCheckPin_(tPin, r, now)) {
        return jsonOut({ error: 'That is not your current PIN.' });
      }
      if (!/^[0-9]{4,8}$/.test(next)) {
        return jsonOut({ error: 'A PIN is 4 to 8 numbers.' });
      }
      if (next === now) {
        return jsonOut({ error: 'That is the PIN you already have.' });
      }
      /* The obvious ones, refused. Not security theatre: a PIN of 1234 on an account holding a
         child's address is worth one sentence of friction. */
      if (/^(\d)\1+$/.test(next) || next === '1234' || next === '0000' || next === '123456') {
        return jsonOut({ error: 'Pick something less guessable than that.' });
      }

      const t = read(TAB.people);
      const row = t.rows.find(x => x._row === r._row);
      authSetPin_(t, row, next);
      /* The guesses were at the OLD PIN, so they say nothing about this one — and an admin
         resetting a locked-out family's PIN would otherwise hand them a PIN they still
         cannot use. See `authClearThrottle_`. */
      authClearThrottle_(t, row);
      /* ---------- CHANGING A PIN ENDS EVERY OTHER SESSION -------------------------------------
         SOMEBODY CHANGING A PIN IS OFTEN SOMEBODY WHO THINKS SOMEONE ELSE HAS IT. Leaving old
         tokens working would mean the intruder stays signed in through the very act meant to
         remove them — the change would lock out only the person who made it. */
      authEndSession_(t, row);
      clearCache();

      /* Tell them it changed. If it was not them, this is how they find out — and an email nobody
         expected is the only warning an account theft ever gives. */
      notify(personDisplayName(r), 'Your PIN was changed',
        'The PIN on your @family. account was just changed'
        + (resetting ? ' by an administrator.' : '.')
        + '\n\nIf that was not you, reply to this message.');

      /* ---------- AND THE PHONE THAT MADE THE CHANGE IS GIVEN A NEW SESSION -------------------------
         `authEndSession_` ENDS EVERY SESSION THE PERSON HOLDS, THE CALLER'S INCLUDED — so the note
         above ("every OTHER session") was a promise the code did not keep. Measured: the reply was
         `{success}`, the phone kept its dead token, and every Save after it on every card answered
         "Please sign in again." under a screen that still said you were signed in. A fresh session
         for the caller, and only the caller: minting one for SOMEBODY ELSE and handing it to whoever
         asked would be handing over their account. */
      const fresh = S(row.person_id) === S(body.personId) ? authNewSession_(t, row) : '';
      return jsonOut({ success: true, token: fresh });
    }

    /* ---------- `redeem` WAS HERE — A PRINTED PAPER FOR A THOUSAND TICKS -------------------------
       IT CANNOT BE EARNED ANY MORE. The price was `countTicks(me)`, which counted a person's handle
       across `ticks_1..3` on every document row, and those three columns were the one thing
       deliberately left out of `data/questions.json`: they held the handles of real children and
       this repository is public. Nothing writes a tick now and nothing reads one.

       SO IT GOES RATHER THAN RETURNING 0 FOR EVER. A reward priced at a thousand of something
       nobody can accumulate is not a reward, it is a sentence the student cannot act on — and this
       app has already paid once for exactly that shape, when `countTicks` read the person's row
       while `toggleTopicTick` wrote the document's and the total sat at 0 for everybody.

       `orderPosted` BELOW STAYS. It marks an order posted and notifies whoever asked, and orders
       are still a tab — a thing arriving in the post does not care what paid for it. */

    /* Marking one posted. Admin only, and one direction only. */
    if (action === 'orderPosted') {
      const t = read(TAB.orders);
      const r = rowById_(t, 'order_id', body.id, body.rowIndex);
      if (!r) return jsonOut({ error: 'Not found.' });
      setCell(t, r, 'state', 'posted');
      setCell(t, r, 'posted_on', new Date());
      clearCache();
      /* Tell them. The whole reason an order has a state is that the person who asked cannot see
         your printer, and a thing that arrives with no warning is a thing they had given up on. */
      const who = findPerson(S(r.person_id));
      if (who) notify(personDisplayName(who),
        norm(r.delivery) === 'post' ? 'Your printing is in the post' : 'Your printing is ready',
        norm(r.delivery) === 'post'
          ? 'It went out today.\n\n  ' + S(r.resource) + '\n\n— @family.'
          : 'Ready to collect at your next session.\n\n  ' + S(r.resource) + '\n\n— @family.');
      return jsonOut({ success: true });
    }

    /* --- exams ------------------------------------------------------------------------------
       A student's own dates. `self`, so a student adds their own — and the handler checks the row
       belongs to the person asking, because an access level that nobody enforces is a comment. */
    if (action === 'saveExam' || action === 'deleteExam') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      const mine = S(me.person_id);
      const t = read(TAB.exams);

      if (action === 'deleteExam') {
        const r = t.rows.find(x => x._row === Number(body.rowIndex));
        if (!r) return jsonOut({ error: 'Not found.' });
        // Your own, or an admin's to remove. Anything else is somebody else's diary.
        if (S(r.person_id) !== mine && !isAdminPerson(S(body.name))) {
          return jsonOut({ error: 'Not yours to remove.' });
        }
        delRow(t, r);
        clearCache();
        return jsonOut({ success: true });
      }

      const when = sheetDate(body.date);
      if (!when) return jsonOut({ error: 'That date did not make sense.' });
      addRow(t, {
        exam_id: 'X' + Date.now(),
        person_id: mine,
        subject: S(body.subject),
        label: S(body.label),
        exam_date: when,
        kind: norm(body.kind) === 'mock' ? 'mock' : 'exam',
        board: S(body.board),
        active: 'TRUE',
      });
      clearCache();
      return jsonOut({ success: true });
    }

    if (action === 'saveTodo')    return savePerson('todo', S(body.todo));
    // A tutor saying "yes, this is all still true". Dated, so it can go stale on its own.
    if (action === 'confirmDetails') return savePerson('details_confirmed', new Date());

    /* A PERSON'S REFERRAL CODE, and who has arrived through it.
       The count is the point. A code nobody used is a question about the offer, not about the
       code — and without `invited_by` being recorded, that question cannot be asked at all. */
    if (action === 'myReferral') {
      const t = read(TAB.people);
      /* The second argument used to be the TAB OBJECT, handed to a function that expected an id.
         Harmless only because findPerson ignored it; now that it does not, it is the person's own
         id, which is what was meant all along. */
      const r = findPerson(S(body.name), S(body.personId));
      if (!r) return jsonOut({ error: 'No such person.' });
      let code = S(r.referral_code);
      if (!code) {
        const base = personDisplayName(r).replace(/[^A-Za-z]/g, '').toUpperCase().slice(0, 6) || 'FAMILY';
        code = base + String(Math.floor(Math.random() * 90) + 10);
        setCell(t, r, 'referral_code', code);
        clearCache();
      }
      const me = key(S(r.person_id)) || key(personDisplayName(r));
      const sent = t.rows
        .filter(x => key(S(x.invited_by)) === me && me)
        .map(x => ({ name: personDisplayName(x), joined: fmtDate(x.joined_on) }));
      return jsonOut({ success: true, code, sent });
    }

    /* --- a student changes their avatar -------------------------------------------------------
       Every equipped item is re-checked here. The site knows the catalogue because it has to draw
       the shapes, but knowing it is not the same as being trusted with it: an item you haven't
       earned is refused whatever the request says.
       Buying happens here too, in one step with the equipping — a credit is only spent when the
       item is actually put on, so a failed request can never leave someone poorer. --- */
    if (action === 'saveAvatar') {
      const t = read(TAB.people);
      const r = findPerson(S(body.name), S(body.personId));
      if (!r) return jsonOut({ error: 'Person not found.' });
      /* Both columns were missing from the schema, so both writes below returned false and every
         wardrobe change was discarded in silence. Said out loud rather than pretended. */
      if (t.headers.indexOf('avatar') < 0 || t.headers.indexOf('avatar_owned') < 0) {
        return jsonOut({ error: 'The people tab has no `avatar` or `avatar_owned` column. Run '
          + 'ensureSchema() — nothing was saved.' });
      }

      const wanted = body.avatar || {};
      const unlocks = avatarUnlocks(r);
      let credits = N(r.credits);
      const owned = S(r.avatar_owned).split(/[,\n]/).map(x => x.trim()).filter(Boolean);
      const bought = [];

      const SLOTS = ['hair', 'headwear', 'faceware', 'shoulders', 'handheld', 'legs'];
      const equipped = {};
      for (let i = 0; i < SLOTS.length; i++) {
        const DEFAULT = { legs: 'plain', hair: 'crop' };
        const slot = SLOTS[i], want = S(wanted[slot]) || DEFAULT[slot] || 'none';
        const item = unlocks.find(x => x.slot === slot && x.id === want);
        if (!item) return jsonOut({ error: 'No such item: ' + slot + '/' + want });
        if (!item.unlocked) {
          // Buyable and affordable? Then buying it IS equipping it.
          if (item.cost && credits >= item.cost) {
            credits -= item.cost;
            owned.push(slot + ':' + item.id);
            bought.push(item.name);
          } else if (item.cost) {
            return jsonOut({ error: item.name + ' costs ' + item.cost + ' credits and you have ' + credits + '.' });
          } else {
            return jsonOut({ error: item.name + ' unlocks at level ' + item.level + '.' });
          }
        }
        equipped[slot] = item.id;
      }

      // Colours are free: skin, hair colour, shirt colour. They're how you look rather than
      // something you own, and a shop full of colour swatches is a shop selling the same object
      // eight times.
      ['skin', 'hairColour', 'shirt'].forEach(f => {
        if (wanted[f] !== undefined) equipped[f] = String(wanted[f]).slice(0, 12);
      });

      const packed = Object.keys(equipped).map(k => k + ':' + equipped[k]).join('|');
      setCell(t, r, 'avatar', packed);
      if (bought.length) {
        setCell(t, r, 'avatar_owned', owned.join(', '));
        setCell(t, r, 'credits', credits);
      }
      // Send the refreshed unlock list back: the shop decides Buy vs Equip from it, and without
      // it a just-bought item would still offer to sell itself until the next page load.
      clearCache();
      const after = findPerson(S(body.name), S(body.personId));
      return jsonOut({ success: true, avatar: packed, credits, bought,
                       owned: after ? avatarUnlocks(after) : [] });
    }
    if (action === 'saveFriends') return savePerson('friends', S(body.friends));

    if (action === 'saveScore' || action === 'saveTtHighscore') {
      const field = action === 'saveScore' ? 'high_score_flappy' : 'high_score_tables';
      const t = read(TAB.people);
      const r = findPerson(S(body.name), S(body.personId));
      if (!r) return jsonOut({ error: 'Person not found.' });
      const best = N(r[field]), incoming = N(body.score);
      if (incoming > best) setCell(t, r, field, incoming);
      return jsonOut({ success: true, highscore: Math.max(best, incoming), best: Math.max(best, incoming),
                       beat: incoming > best });
    }

    /* `saveTopics` WAS HERE. It wrote `ticks_1…3` on a person's row and nothing on the phone has ever
       called it; the columns went with the people tab's redesign (see `SCHEMA.people`). */


    /* ---------- `toggleTopicTick` WAS HERE ------------------------------------------------------
       It put a person's handle into `ticks_1..3` on a document row and moved XP and credits by one.
       The columns are gone — stripped out of `data/questions.json` at source, because they held the
       handles of children and this repository is public — and the tab they were on is gone with
       them.

       IF TICKS COME BACK THEY COME BACK IN `Ledger`, one row per person per document, which is what
       they always were: a fact about a PERSON and a document, filed under neither. That is also the
       version that would have survived this move untouched. */

    /* ---------- `toggleVenueComfort` WAS HERE -----------------------------------------------------
       It wrote whatever `body.handle` it was handed into a venue's `tutors_happy_here`, so a signed-in
       tutor could put ANYBODY on a venue — and nothing in the app ever called it. The Settings page
       writes that cell now, through `updateProfile` and `venuesWrites_`, for the signed-in person only:
       one writer, keyed on the row the token resolved to rather than a name in the request. */

    /* --- PAYMENT ------------------------------------------------------------------------------
       Two halves, and they must stay apart.

       createCheckout   builds a Stripe session and hands back a URL. It records NOTHING about the
                        job — a client who opens the payment page and closes the tab has not paid,
                        and the sheet must not think otherwise.
       finalizePayment  runs when Stripe sends the client back with ?paid=1&ref=…, checks the
                        session was actually paid by asking Stripe, and only then writes the
                        Confirm event that turns Paying into Booked.

       So money is the ONE thing on this site the client's own browser cannot assert. Everything
       else it says is taken at face value; this is verified against Stripe before it counts. --- */
    if (action === 'createCheckout') {
      /* THE SAME GUARD `move` HAS, on the action that matters most.
         The site has always sent a requestId here; nothing read it. One id per user action, so a
         double tap, a retry or a flaky connection cannot open a second checkout for one booking. */
      if (body.requestId && seenRequest(body.requestId)) {
        return jsonOut({ error: 'That checkout was already started — check the tab it opened in.' });
      }

      const stripeKey = PropertiesService.getScriptProperties().getProperty('STRIPE_TEST_KEY');
      if (!stripeKey) return jsonOut({ error: 'Stripe key not set. Add STRIPE_TEST_KEY in Project Settings → Script Properties.' });

      const t = read(TAB.jobs);
      const j = t.rows.find(x => S(x.job_id) === S(body.jobId));
      if (!j) return jsonOut({ error: 'Job not found.' });
      const me = S(body.name);
      const mine = participantsOf(S(j.job_id)).find(p2 => key(p2.name) === key(me));
      if (!mine) return jsonOut({ error: "You're not part of this session." });
      if (mine.status !== BM.AGREED) {
        return jsonOut({ error: 'Nothing to pay for yet — the terms have to be agreed first.' });
      }

      // What the client owes. Read from the job, never from the request: a price posted by the
      // browser is a price the client chose.
      /* ---------- CHARGE WHAT THE RECEIPT SAYS, NOT WHAT THE JOB SAYS -------------------------
         These are two different numbers and only one of them is a promise.

         `price_total` on the job is a cell. It can be edited afterwards — by an admin fixing
         something, by `move` carrying new terms, by a hand in the spreadsheet — and none of that
         is wrong; a job is a live thing. The RECEIPT is not: it is what the client was shown and
         agreed to, stored as whole pence at the moment of asking precisely so it cannot move.

         Charging from the job meant a price edited between asking and paying was charged silently
         against a document that said something else. Which is the one kind of billing mistake
         nobody forgives, and it would have looked like nothing at all from either end.

         Falls back to the job where there is no receipt — an older booking made before receipts
         existed should still be payable. */
      const receipt = read(TAB.receipts).rows
        .filter(r => S(r.job_id) === S(j.job_id) && N(r.total_pence) > 0)
        .sort((a, b) => (sheetDate(b.issued_on) || 0) - (sheetDate(a.issued_on) || 0))[0];
      const pence = receipt ? Math.round(N(receipt.total_pence))
                            : Math.round(N(j.price_total) * 100);
      if (!pence) return jsonOut({ error: 'This session has no price set.' });

      const ref = 'PAY-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
      // The ref remembers WHO and WHICH job, so the return leg can't be pointed at someone else's
      // session by editing the URL.
      PropertiesService.getScriptProperties()
        .setProperty(ref, JSON.stringify({ jobId: S(j.job_id), payer: me }));

      const dates = sessionDatesOf(j);
      const params = {
        'mode': 'payment',
        'success_url': SITE_URL + '?paid=1&ref=' + ref,
        'cancel_url': SITE_URL + '?paid=0',
        'client_reference_id': ref,
        'line_items[0][price_data][currency]': 'gbp',
        'line_items[0][price_data][product_data][name]':
          (S(j.level) + ' ' + S(j.subject)).trim() + ' — ' + dates.length + ' sessions',
        'line_items[0][price_data][product_data][description]':
          S(j.weekday) + ' ' + fmtTime(j.start_time) + ' · ' + S(j.venue),
        'line_items[0][price_data][unit_amount]': String(pence),
        'line_items[0][quantity]': '1'
      };
      try {
        const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions', {
          method: 'post', headers: { Authorization: 'Bearer ' + stripeKey },
          payload: params, muteHttpExceptions: true
        });
        const d = JSON.parse(res.getContentText());
        if (!d.url) return jsonOut({ error: (d.error && d.error.message) || 'Stripe refused the request.' });
        PropertiesService.getScriptProperties()
          .setProperty(ref + '_session', S(d.id));
        /* Recorded so the guard above can recognise a repeat — it reads the events tab, and a
           checkout that leaves no trace is a checkout that can be started twice.
           On SUCCESS only: one that never reached Stripe should be retryable, and refusing a retry
           after a failure would strand a client who wants to pay you. */
        logEvent({ jobId: S(body.jobId), actor: S(body.name), action: 'checkout',
                   message: ref, requestId: S(body.requestId) });
        return jsonOut({ success: true, url: d.url });
      } catch (err) {
        return jsonOut({ error: 'Could not reach Stripe: ' + err });
      }
    }

    if (action === 'finalizePayment') {
      const props = PropertiesService.getScriptProperties();
      const ref = S(body.ref);
      const raw = props.getProperty(ref);
      // Already handled, or never issued. Either way there's nothing to do, and saying "success"
      // stops a refresh of the return page from looking like a failure.
      if (!raw) return jsonOut({ success: true, alreadyDone: true });
      const parsed = JSON.parse(raw);
      const jobId = parsed.jobId, payer = parsed.payer;
      const sessionId = props.getProperty(ref + '_session');
      const stripeKey = props.getProperty('STRIPE_TEST_KEY');

      // ASK STRIPE. Landing on the success URL proves only that a browser visited a URL; anyone
      // could type it. This is the check that makes the payment real.
      let paid = false;
      try {
        const res = UrlFetchApp.fetch('https://api.stripe.com/v1/checkout/sessions/' + sessionId, {
          method: 'get', headers: { Authorization: 'Bearer ' + stripeKey }, muteHttpExceptions: true
        });
        const d = JSON.parse(res.getContentText());
        paid = S(d.payment_status) === 'paid';
      } catch (err) {
        return jsonOut({ error: 'Could not confirm the payment with Stripe: ' + err });
      }
      if (!paid) return jsonOut({ error: 'Stripe says that session has not been paid.' });

      // Confirm is the only action that reaches Booked, and only this path writes it.
      logEvent({ jobId, actor: payer, role: 'client', action: 'Confirm',
                 message: 'payment confirmed by Stripe', requestId: ref });
      clearCache();
      const t = read(TAB.jobs);
      const j = t.rows.find(x => S(x.job_id) === S(jobId));
      if (j) setCell(t, j, 'status', jobStatusOf(jobId));
      props.deleteProperty(ref);
      props.deleteProperty(ref + '_session');

      notify(payer, 'Payment received — you are booked in',
        'Your place is confirmed. See you there.\n\n— @family.');
      const tutor = (tutorsIn(jobId).find(x => x.status === BM.AGREED || x.status === BM.BOOKED) || {}).name;
      if (tutor) notify(tutor, 'Paid: a place is confirmed',
        payer + ' has paid and is confirmed in the class.\n\n— @family.');
      return jsonOut({ success: true });
    }

    /* --- MARKING A SESSION PAID, BY HAND -------------------------------------------------------
       PEOPLE PAY IN CASH. They hand over notes at the library, or send a bank transfer, or settle
       three sessions at once in a way no card flow will ever see — and until now the only thing
       that could move a booking to Booked was Stripe's return leg. So a family who had actually
       paid stayed on an accepted application for ever, and the receipt that proves what they paid
       for could never be issued.

       IT IS RECORDED AS WHAT IT IS. `finalizePayment` writes "payment confirmed by Stripe" because
       Stripe was asked and answered. This writes who marked it, and how they say it was paid — the
       one thing that must never happen here is money arriving by hand and being written down as
       though a processor had verified it. A year later the difference between those two is the
       difference between evidence and somebody's word, and only one of them can be checked.

       THE SAME EVENT EITHER WAY. `Confirm` is what `participantsOf` folds into Booked and there is
       no second route to it — one word for one fact, whoever wrote it, so nothing downstream has to
       know which way a session was paid for.
    ------------------------------------------------------------------------------------------- */
    if (action === 'markPaid') {
      const t = read(TAB.jobs);
      const j = t.rows.find(x => S(x.job_id) === S(body.jobId)
                              || String(x._row) === S(body.jobId));
      if (!j) return jsonOut({ error: 'No session with that id.' });
      const jobId = S(j.job_id) || String(j._row);
      const by = S(body.adminName) || S(body.name);

      const before = participantsOf(jobId);
      const clients = before.filter(p2 => p2.role === 'client');
      if (!clients.length) return jsonOut({ error: 'Nobody is in that session.' });

      /* ONLY WHAT HAS BEEN AGREED. Marking an unagreed booking paid would skip the step where both
         sides settle the terms — so the family is Booked onto a session whose price, day or venue
         nobody has accepted. The lobby exists to stop exactly that, and a shortcut past it is the
         shortcut that produces a dispute. */
      const notReady = clients.filter(c => !/^(agreed|paying|booked)$/i.test(S(c.status)));
      if (notReady.length) {
        return jsonOut({ error: 'That has not been accepted yet — '
          + notReady.map(c => c.name + ' is ' + (S(c.status) || 'not in it')).join(', ')
          + '. Accept it first, then mark it paid.' });
      }

      /* ALREADY DONE. Said plainly rather than writing a second Confirm: two of them is two
         payments in the log for one payment in the world. */
      const already = clients.filter(c => /^booked$/i.test(S(c.status)));
      if (already.length === clients.length) {
        return jsonOut({ success: true, alreadyPaid: true });
      }

      /* HOW. Free text from the admin — "cash", "bank transfer", "paid for three at once". It is
         the only record of how the money actually arrived, and a blank one says so rather than
         pretending. */
      const how = S(body.how) || 'not said';

      const done = [];
      clients.forEach(c => {
        if (/^booked$/i.test(S(c.status))) return;         // already paid; leave their record alone
        logEvent({
          jobId, actor: c.name, role: 'client', action: 'Confirm',
          message: 'marked paid by ' + by + ' — ' + how,
          requestId: S(body.requestId) ? S(body.requestId) + '-' + key(c.name) : '',
        });
        done.push(c.name);
      });
      clearCache();

      setCell(t, j, 'status', jobStatusOf(jobId));
      clearCache();

      /* TELL THEM. A booking that becomes confirmed without a word is one somebody has to check by
         asking — and this is the moment their place is actually theirs. */
      done.forEach(n => notify(n, 'You are booked in: ' + S(j.subject),
        'Your payment has been recorded and your place is confirmed.\n\n'
        + S(j.subject) + (S(j.weekday) ? ' on ' + S(j.weekday) : '')
        + (fmtTime(j.start_time) ? ' at ' + fmtTime(j.start_time) : '')
        + (S(j.venue) ? '\n' + S(j.venue) : '')
        + '\n\nIf that is a surprise, reply to this message.\n\n— @family.'));

      return jsonOut({ success: true, paid: done, how: how });
    }

    /* --- THE booking move ------------------------------------------------------------------- */
    if (action === 'move') {
      const t = read(TAB.jobs);
      const j = t.rows.find(x => S(x.job_id) === S(body.jobId) || String(x._row) === S(body.jobId));
      if (!j) return jsonOut({ error: 'Job not found.' });
      const jobId = S(j.job_id) || String(j._row);
      if (body.requestId && seenRequest(body.requestId)) {
        return jsonOut({ success: true, duplicate: true });   // a double tap, already handled
      }

      const role = norm(body.role) === 'tutor' ? 'tutor' : 'client';
      const me = S(body.name), act = S(body.move), text = S(body.text);
      if (!me) return jsonOut({ error: 'No name given.' });

      const before = participantsOf(jobId);
      const mine = before.find(p2 => key(p2.name) === key(me));
      const others = before.filter(p2 => p2.role !== role);

      /* ---------- THE ADMIN MAY ANSWER ANY REQUEST ----------------------------------------------
         SOMEBODY HAS TO SAY YES. A client asks for a session and the machine had no way for the
         business to answer: `move` refused anybody who was not already a participant, and the only
         thing an admin could do to a booking was `deleteJob`, which ends it for everyone. So every
         request sat at Waiting until a TUTOR happened to accept it — and on a job with no tutor
         yet, nothing could ever move it at all.

         AS THE BUSINESS, NOT AS A PARTICIPANT. The admin is not taking a seat and not teaching it;
         they are answering on behalf of @family., which is what an Accept from this side means.
         So the event is logged in their own name with `role: admin` — the log has to say who
         actually decided, and a decision recorded as somebody else's is worse than none.

         WHY IT IS SAFE TO SKIP THE LOBBY RULES BELOW. Those exist to stop a stranger joining a
         session or a second tutor taking one that is taken — questions about who may occupy a
         seat. An admin is not occupying anything, so none of them applies. What follows this is
         checked exactly as before for everybody else. */
      const iAmAdmin = isAdminPerson(S(body.adminName) || me);
      const asAdmin = !mine && iAmAdmin && (act === ACT.ACCEPT || act === ACT.DECLINE);

      // Joining is a Request from someone not yet involved. Everything else needs you in already.
      if (!mine && !asAdmin && act !== ACT.REQUEST) {
        return jsonOut({ error: "You're not part of this session." });
      }
      if (!mine && !asAdmin) {
        if (role === 'client') {
          const caps = [capacityFor('venue', j.venue), N(j.max_students)].filter(x => x > 0);
          const cap = caps.length ? Math.min.apply(null, caps) : 4;
          if (before.filter(p2 => p2.role === 'client').length >= cap) {
            return jsonOut({ error: 'This session is full.' });
          }
          /* AND THE FAMILY WHOSE BOOKING IT IS HAS TO HAVE SAID YES.
             The seat count says there is ROOM; this says they are willing to share it with somebody
             they have not met. Those are different questions and only the second is consent.
             Checked here rather than only on the phone, because a button that is not drawn is not
             a rule — anybody can post this action, and the sheet is where the answer lives. */
          if (!TRUE_(j.open_to_others)) {
            return jsonOut({ error: 'That session is not open to other families.' });
          }
        } else {
          // "No preference" IS the client's consent to being matched with someone they didn't
          // pick. Without it, no.
          if (!TRUE_(j.stealable)) return jsonOut({ error: 'This job is not open to other tutors.' });
          if (tutorStatusOf(jobId) === 'Confirmed') return jsonOut({ error: 'This job already has its tutor.' });
        }
      }

      // Who this move is about. Named explicitly, or the only person on the other side.
      const wanted = S(body.counterpart);
      // Only an EXPLICIT counterpart names someone. Inferring "the only other person" broke the
      // lobby: a tutor pressing ✓ to mark themselves ready was recorded as "I accept Danile",
      // which readied her too — so one person could ready the whole room. Readying up is about
      // yourself; choosing someone is about them, and the difference is whether you said a name.
      const them = wanted ? others.find(p2 => key(p2.name) === key(wanted)) : null;
      // Declining still needs a target, and with exactly one candidate there's no ambiguity.
      /* AN ADMIN'S TARGET IS EVERYBODY WHO IS WAITING. They are answering the request rather than
         choosing between people, so with one client on the job that client is the target without
         anybody having to name them — and with several, the same rule as everyone else applies and
         a name is required. */
      const target = them || ((act === ACT.DECLINE && others.length === 1) ? others[0] : null)
        || (asAdmin && before.length === 1 ? before[0] : null);
      // Only moves ABOUT someone need one. Request opens a negotiation and Withdraw ends your own
      // part in it — a "No preference" job with no applicants must still be leaveable.
      if (!target && act === ACT.DECLINE) {
        return jsonOut({ error: others.length ? 'Say which person you mean.'
                                             : 'No one on the other side to respond to.' });
      }

      // Permission is judged against whoever is on the other side of the lobby, named or not —
      // that's what decides whether the client may pay. Only the WRITE is targeted.
      const facing = target || others[0] || before[0] || null;
      /* THE LOBBY RULES ARE ABOUT THE TWO SIDES, and an admin is not one of them.
         `bmApply` judges what a mover may do from their OWN status — and an admin answering a
         request has no status on this job, so every move would be refused as "admin cannot Accept
         from (–, Waiting)". That is the machine correctly describing a person who is not playing.
         Answering is not a move in the lobby; it is the business saying yes. */
      if (!asAdmin) {
        const res = bmApply(role, mine ? S(mine.status) : '', facing ? S(facing.status) : '', act);
        if (!res.ok) return jsonOut({ error: res.error });
      }

      // THE write. One append — no slot to find, no status cells to keep in step, nothing to
      // clear on the way out. The participant list is recomputed from this on the next read.
      /* WHO DECIDED, IN THEIR OWN NAME. An admin answering is logged as an admin — not as the
         tutor, not as the family. A year from now the only record of why a session went ahead is
         this line, and a decision recorded under somebody else's name is worse than no record. */
      /* AN ADMIN'S ACCEPT IS NOT LOGGED IN THEIR OWN NAME, and this is the one thing that has to be
         right about it. `participantsOf` adds ANYBODY who acts on a job to the roster — that is how
         a tutor applying becomes a participant — so an Accept written as `actor: Halex Dias` puts
         the admin in the room as a client, on every job they ever answer. Folded and checked:
         "Rasa=Agreed, GeorgePovey=Agreed, Halex Dias=Agreed", with the admin sitting in a seat on
         somebody's tutoring session.

         So the decision is recorded ON THE PARTICIPANTS' OWN EVENTS, in the `message` — "accepted
         by Halex Dias" — which is where a year-later reader is looking anyway, and it leaves the
         roster saying exactly who is in the session.

         A DECLINE IS DIFFERENT and may be logged as the admin: `participantsOf` returns early on a
         Decline and removes the target, so it never reaches the line that would add them. */
      if (!asAdmin) {
        logEvent({ jobId, actor: me, role, action: act, target: target ? target.name : '',
                   message: text, requestId: body.requestId });
      }

      /* AN ADMIN'S ACCEPT SETTLES THE WHOLE ROOM. `participantsOf` moves the ACTOR and whoever was
         targeted; an admin is not in the roster, so an Accept from them would otherwise move one
         person and leave the rest Waiting on a session that has been agreed.
         Written as an Accept per participant, each in their own name, so the fold produces exactly
         what it would have if they had each pressed it — and the log says who prompted it. */
      if (asAdmin && act === ACT.ACCEPT) {
        before.forEach(pp => logEvent({
          jobId, actor: pp.name, role: pp.role, action: ACT.ACCEPT,
          message: 'accepted by ' + me,
          requestId: S(body.requestId) ? S(body.requestId) + '-' + key(pp.name) : '',
        }));
      }
      /* AND A DECLINE CLEARS IT. One Decline names one person; the business turning a booking down
         is turning it down for everybody in it. */
      if (asAdmin && act === ACT.DECLINE) {
        before.forEach(pp => logEvent({
          jobId, actor: me, role: 'admin', action: ACT.DECLINE, target: pp.name,
          message: 'declined by ' + me,
          requestId: S(body.requestId) ? S(body.requestId) + '-d-' + key(pp.name) : '',
        }));
      }

      // Edit carries the new terms. They're job-level — one weekday, one venue, one price — so
      // they're the one thing still written to a cell rather than derived.
      if ((act === ACT.EDIT || act === ACT.REQUEST) && body.edits) {
        const MAP = { subject:'subject', level:'level', day:'weekday', time:'start_time',
                      venue:'venue', price:'price_total', students:'max_students' };
        Object.keys(body.edits).forEach(k => {
          const f = MAP[k], v = body.edits[k];
          if (f && v !== '' && v != null) setCell(t, j, f, k === 'time' ? fmtTime(v) : v);
        });
      }

      // Accepting a tutor settles who teaches: the rest are declined by the same act, because two
      // tutors can't both teach it and a second step would leave a window where one thinks they
      // have it and another thinks it's open.
      if (act === ACT.ACCEPT && role === 'client' && them) {
        setCell(t, j, 'stealable', 'FALSE');
        others.filter(p2 => key(p2.name) !== key(target.name)).forEach(o => {
          logEvent({ jobId, actor: me, role, action: ACT.DECLINE, target: o.name,
                     message: 'another tutor was chosen' });
          notify(o.name, 'Not taken forward: ' + S(j.subject),
            'The family chose another tutor this time.\n\n— @family.');
        });
        notify(target.name, "You're teaching " + S(j.subject),
          'You were picked for ' + S(j.subject) + '.\n\nLog in to @family. to agree the terms.\n\n— @family.');
      }

      // The job's status, from who is left. Written for readability in the sheet; nothing reads it.
      const status = jobStatusOf(jobId);
      setCell(t, j, 'status', status);
      if (status === 'cancelled') {
        setCell(t, j, 'stealable', 'FALSE');
        // Tell any tutor still attached: a cancelled job is invisible, so they'd otherwise hold a
        // place on something they can neither see nor act on.
        tutorsIn(jobId).forEach(tu => notify(tu.name, 'Cancelled: ' + S(j.subject),
          'The family has withdrawn, so ' + S(j.subject) + ' is not going ahead.\n\n— @family.'));
      }

      // Tell whoever didn't move. Keying this off "whose turn is next" is what previously meant
      // declines, withdrawals and payments notified nobody — those moves end the turn-taking.
      const HEAD = { Edit: me + ' changed the terms for ' + S(j.subject) +
                           ' — everyone needs to agree again',
                     Say:  me + ' left a note about ' + S(j.subject),
                     Request: me + ' sent terms for ' + S(j.subject),
                     Accept: 'Accepted: ' + S(j.subject),
                     Decline: 'Not going ahead: ' + S(j.subject),
                     Withdraw: me + ' withdrew from ' + S(j.subject),
                     Pay: 'Paid: ' + S(j.subject) };
      const tellThese = target ? [target.name] : others.map(p2 => p2.name);
      tellThese.forEach(n => notify(n, HEAD[act] || ('Update on ' + S(j.subject)),
        me + ' ' + act.toLowerCase() + 'ed on ' + S(j.subject) + '.' +
        (text ? '\n\nTheir message:\n"' + text + '"' : '') +
        '\n\nLog in to @family. to respond.\n\n— @family.'));

      const after = participantsOf(jobId);
      const mineAfter = after.find(p2 => key(p2.name) === key(me));
      return jsonOut({ success: true, jobStatus: status,
                       mine: mineAfter ? mineAfter.status : '',
                       participants: after });
    }

    /* --- tutor side: apply, or the family's verdict ------------------------------------------ */
    if (action === 'tutorMove') {
      // Applying IS a Request from the tutor's side, and choosing/declining a tutor IS the
      // family's Accept/Decline. One handler, so there's one set of rules rather than two.
      const map = { claim: ACT.REQUEST, apply: ACT.REQUEST, accept: ACT.ACCEPT,
                    decline: ACT.DECLINE, pass: ACT.REQUEST };
      const act = map[norm(body.move)];
      if (!act) return jsonOut({ error: 'Unknown tutor move.' });
      const asTutor = norm(body.move) === 'claim' || norm(body.move) === 'apply';
      return doPost({ postData: { contents: JSON.stringify({
        action: 'move', jobId: body.jobId,
        role: asTutor ? 'tutor' : 'client',
        name: body.sender, counterpart: asTutor ? '' : body.tutor,
        move: act, text: body.text, requestId: body.requestId
      }) } });
    }

    /* --- a new booking ----------------------------------------------------------------------- */
    if (action === 'createJob') {
      const cfg3 = config();
      const cap = N(cfg3.max_open_requests) || 2;
      /* Either name. The booking form sends `clientName`; everything else on the site sends
         `name`, and one handler using its own word for the same thing is how the gate above came
         to disagree with it. */
      const me = S(body.clientName) || S(body.name);
      const t = read(TAB.jobs);

      // Without a cap one family can paper every open slot and tie up every tutor's queue.
      // Only OPEN requests count; settled ones don't hold anything.
      if (me) {
        let live = 0;
        t.rows.forEach(j => clientsIn(S(j.job_id) || String(j._row)).forEach(c => {
          if (key(c.name) === key(me) && c.status && c.status !== BM.BOOKED) live++;
        }));
        if (live >= cap) return jsonOut({
          error: 'You already have ' + live + ' requests waiting. Please resolve one first.' });
      }

      /* THE ONE NUMBER THE PHONE MUST NOT CHOOSE, checked before anything is written.
         Not recomputed — see `priceLooksWrong` for why a second copy of the formula would be worse
         than the problem — but a total that cannot pay for the room and the teaching is refused
         outright, because there is no honest way to arrive at one. */
      /* ---------- IF THE CLIENT IS PAYING THE TRAVEL, IT IS ADDED HERE AND NOWHERE ELSE ----------
         The phone priced the session without knowing about travel, and it should not have to: the
         cost is per venue, it is yours to set, and a browser that computed it would be a second
         copy of a rule that lives on the sheet.

         SO THE SERVER ADDS IT, on the way in, before the price is written or the receipt drawn —
         which means the figure the client agrees to and the figure they are charged are the same
         number, and turning this on is one cell rather than a deploy. */
      /* ---------- HOW MANY TIMES SOMEBODY MAKES THE JOURNEY ---------------------------------------
         DECLARED HERE, BECAUSE THE LINE BELOW USES IT. It was thirteen lines further down — after
         the travel cost, after the sanity check — so `travelCost(…, sessionCount)` reached a `const`
         that had not been initialised yet and threw `Cannot access 'sessionCount' before
         initialization`. Not a hoisting nicety: `const` in the temporal dead zone throws outright,
         so EVERY booking failed at the first line that priced it.

         The same expression the sanity check below builds for `weeks`, which is what it is — one
         trip per session, and at least one, because a booking with no dates yet is still a
         booking. */
      const sessionCount = S(body.dates).split(',').filter(Boolean).length || 1;

      const travel = travelCost(S(body.location), sessionCount);
      const chargeTravel = N(cfg3.travel_on_client) > 0 && travel > 0;
      if (chargeTravel) body.price = N(body.price) + travel;

      const wrong = priceLooksWrong({
        price: body.price, venue: body.location, hours: body.hours,
        weeks: S(body.dates).split(',').filter(Boolean).length || 1,
        seats: body.n,
      });
      if (wrong) return jsonOut({ error: wrong });

      const jobId = S(body.forceItemId) || ('J-' + Date.now());
      const named = S(body.requestedTutor) && !/^(no preference|any)$/i.test(S(body.requestedTutor));
      addRow(t, {
        job_id: jobId, status: 'unconfirmed',
        subject: S(body.subject), level: S(body.level), service: S(body.service),
        weekday: S(body.day), start_time: fmtTime(body.time),
        // Per booking now, not one global figure — a client picking a three-hour slot has to have
        // that recorded, or the price and the grid disagree the next time the job is read.
        hours_per_session: N(body.hours) || N(cfg3.h) || 2,
        venue: S(body.location),
        client_hosts: body.hosting ? 'TRUE' : 'FALSE',
        term_name: S(body.interval), session_dates: S(body.dates),
        /* NUMBERS, not strings of numbers. `S()` stores "286" as text, and a spreadsheet holding
           text in a money column will not sum it, will not sort it, and shows it left-aligned —
           which is the only clue anybody gets. Everything that reads it already calls `N()`, so
           this changes no behaviour and makes the sheet itself correct. */
        /* ---------- WHAT IT EARNS, WHAT IT COSTS, AND WHAT IS LEFT --------------------------------
           `tutor_pay` was written as an empty string on every job ever created, so the books
           recorded what a session brought in and nothing about what it took to run — and
           `admin_profit` was a figure the browser sent rather than a subtraction, which makes it a
           number rather than a fact.

           THE TRAVEL IS READ FROM THE VENUE, never from the request. Per session, because a journey
           does not get longer when the lesson does; times the number of sessions, because each one
           is another trip. Online contributes nothing and needs no special case.

           AND IT IS STORED AS PAID, not as a rate. The figure on the venue can change next month;
           what this session actually cost cannot. */
        price_total: N(body.price),
        /* WHAT THE TUTOR EARNS, which `priceFrom` works out on the phone beside `profit` below and
           which was dropped here — `tutor_pay` was written as an empty string on every job, so the
           tutor's own receipt had nothing to show them. Recorded as SENT, like `admin_profit`: it
           is the business's note of the split, never what anybody is charged — `createCheckout`
           charges from the receipt. Blank when an older phone sends nothing, never a nought. */
        tutor_pay: S(body.tutorPay) !== '' ? Math.round(N(body.tutorPay) * 100) / 100 : '',
        travel_paid: travelCost(S(body.location), sessionCount),
        /* THE SUBTRACTION, rather than whatever the phone worked out. The travel comes off the
           margin unless `travel_on_client` says the client is paying it — in which case it was
           added to the price and taking it off again would charge it twice. */
        admin_profit: Math.round((N(body.profit)
          - (N(cfg3.travel_on_client) ? 0 : travelCost(S(body.location), sessionCount))) * 100) / 100,
        // Who else is splitting this booking. Stored on the job because it's a fact ABOUT the
        // booking — who was invited to share it — not about any one person's account.
        split_emails: S(body.splitEmails),
        /* AND WHICH CHILDREN IT IS FOR. Different from the split: those are other FAMILIES sharing
           the cost, these are the people in the chairs. A tutor needs the second one and has never
           been told it. */
        for_children: S(body.kids),
        /* TRUE only where they said so. `TRUE_` reads the word; anything else — blank, absent, an
           older booking — is a no. */
        open_to_others: TRUE_(body.openToOthers) ? 'TRUE' : 'FALSE',
        max_students: N(cfg3.max_students_per_job) || 4,
        // "No preference" IS the consent to being matched; naming a tutor withholds it.
        stealable: named ? 'FALSE' : 'TRUE',
        created_at: new Date(),
        /* AN ADMIN BOOKING FOR A FAMILY. `me` has always been the CLIENT — `S(body.clientName) ||
           S(body.name)` resolves that way — so a booking made on somebody's behalf already lands
           on their row and logs the opening Request in their name. What was missing was the other
           half: who was actually signed in when it happened.
           Compared with `key` like every other name in this file, so punctuation cannot turn one
           person into two and write a `booked_by` on a booking somebody made themselves. */
        booked_by: key(S(body.name)) === key(me) ? '' : S(body.name),
      });

      // Who is in it comes from here, not from cells on the row above.
      logEvent({ jobId, actor: me, role: 'client', action: ACT.REQUEST,
                 message: S(body.message), requestId: body.requestId });
      if (named) {
        /* ---------- NAMING A TUTOR CONFIRMS THE TUTOR, NOT THE BOOKING ---------------------------
           THIS MARKED THE FAMILY AS HAVING AGREED TO A SESSION NOBODY HAD ACCEPTED YET. The second
           line logged an Accept whose ACTOR was the client — and `participantsOf` sets the actor of
           an Accept to `Agreed`, then sets the target to `Agreed` as well because an agreement is
           mutual. So both seats came out agreed the instant the form was submitted, `jobAccepted_`
           found every client and every tutor settled, and the card that should have said "asking"
           opened stamped ACCEPTED — WAITING FOR PAYMENT, with a Pay button, on a request that had
           never been read by anybody at @family.

           A FAMILY ASKING IS NOT A FAMILY AGREEING. The point of the original line stands: choosing
           a tutor by name is choosing them, and they should not have to be approved separately. But
           that is a fact about the TUTOR. Logged as the tutor's own acceptance, with no target, so
           it settles their seat and touches nobody else's — the family stays at `Waiting`, which is
           what they are, until the business accepts.

           WHICH IS WHAT `jobAccepted_` THEN READS CORRECTLY: tutor confirmed, client waiting,
           nothing accepted, no Pay button offered on money nobody has agreed to take. */
        logEvent({ jobId, actor: S(body.requestedTutor), role: 'tutor', action: ACT.REQUEST,
                   message: 'requested directly by the family' });
        logEvent({ jobId, actor: S(body.requestedTutor), role: 'tutor', action: ACT.ACCEPT,
                   message: 'chosen by the family at booking' });
      }

      notify(me, 'Booking received 🎉',
        'Thanks for requesting ' + S(body.subject) + ' with @family.\n\n' +
        '• ' + S(body.subject) + ' (' + S(body.level) + ')\n' +
        '• ' + S(body.day) + ' at ' + fmtTime(body.time) + '\n' +
        '• ' + S(body.location) + '\n' +
        (S(body.dates) ? '• Dates: ' + S(body.dates) + '\n' : '') +
        '• Total: £' + S(body.price) + '\n\n— @family.');
      if (named) {
        notify(S(body.requestedTutor),
          'New request: ' + S(body.subject) + ' — ' + me,
          me + ' has requested you.\n\n' +
          '• ' + S(body.subject) + ' (' + S(body.level) + ')\n' +
          '• ' + S(body.day) + ' at ' + fmtTime(body.time) + '\n' +
          '• ' + S(body.location) + '\n' +
          (S(body.message) ? '\nTheir message:\n"' + S(body.message) + '"\n' : '') +
          '\nLog in to @family. to accept, decline, or ask for a change.\n\n— @family.');
      }
      /* THE RECEIPT, WRITTEN AT THE MOMENT OF ASKING. Not derived later from the job — a job can be
         edited, moved, repriced or cancelled, and the client's copy of what they asked for must
         survive all of that unchanged.
         `lines` is whatever the phone drew, stored verbatim, so reissuing is reading it back. */
      /* THE RECEIPT BELONGS TO THE FAMILY, NOT TO WHOEVER TYPED IT.
         `personName` was already `me` — the client — and `personId` was `body.personId`, which is
         the SIGNED-IN person's id. On a booking anybody makes for themselves those are the same
         row and nothing shows. On one an admin makes they are two different people, and the
         receipt would carry the client's NAME against the admin's ID.
         `?receipts=` matches on either, so that one document would appear in both households: the
         family finds it by name and the admin finds it by id. A receipt is a record of what one
         household agreed to, and it can belong to exactly one of them. */
      const forWhom = findPerson(me, S(body.clientId));
      const receipt = writeReceipt_({
        kind: 'session', jobId: jobId,
        personId: S(forWhom && forWhom.person_id) || S(body.personId), personName: me,
        total: N(body.price), currency: 'GBP',
        lines: (function () {
          let ls = [];
          try { ls = JSON.parse(S(body.lines) || '[]'); } catch (e) { ls = []; }
          /* ITS OWN LINE, or not at all. A travel fee folded into an hourly rate is the thing
             people find afterwards and mind about — and the receipt is the document that has to
             survive somebody reading it closely six months later. */
          if (chargeTravel) {
            ls = ls.concat([{ k: 'Travel to ' + S(body.location), v: travel }]);
          }
          return ls;
        })(),
        note: S(body.message),
      });

      /* A FAILED RECEIPT DOES NOT FAIL THE BOOKING. Somebody who has asked for a session and been
         told the request failed, because the paperwork failed, has been told a lie about the
         important half. It is reported alongside the success so it is visible rather than silent. */
      return jsonOut({ success: true, jobId,
        receiptId: receipt.receiptId || '', receiptError: receipt.error || '' });
    }

    /* --- JOINING A WAITLIST ---------------------------------------------------------------------
       A DIFFERENT PRODUCT IN THE SAME SHAPE. It is a job — so `participantsOf` folds the roster,
       `move` runs the lobby, `deleteJob` ends it and the payment path is untouched — and every
       difference is a RULE APPLIED HERE rather than a second table:

         · one seat each, so a family joins once and cannot bring a second child
         · no tutor chosen, so `stealable` stays TRUE and nobody is picked at booking
         · Maths and English, fixed, because that is what the session is
         · a fixed price, computed in `waitlistPrice` from the venue and the seat count

       THE FIRST TO JOIN CREATES IT. A waitlist nobody has joined is a row saying nothing, so there
       is no separate "open a waitlist" step — joining an empty room and starting one are the same
       act, and making them two would leave empty lists lying about on venues.

       AND ONE PER VENUE. Two lists on one room is two sets of families waiting for the same four
       seats. Checked on the SERVER, because a button that is not drawn is not a rule. --- */
    /* ---------- OPENING A WAITING LIST WITH NOBODY ON IT --------------------------------------------
       `joinWaitlist` ALWAYS SEATS THE PERSON WHO CALLS IT. That is right for a family — you do not
       start a list you are not on — and wrong for an admin advertising one. Running a Back to School
       campaign means the list has to be there BEFORE anybody has joined, so the first family who
       arrives finds something to join rather than something to start.

       IT IS THE SAME ROW, MINUS THE SEAT. No REQUEST event and no receipt, so `participantsOf` folds
       an empty roster, `seatsGoing` is the full count, and the visibility rule in doGet — open, with
       seats going — shows it to everybody. Nothing new had to be taught to the front of the app.

       ADMIN ONLY, because an open list with nobody on it is a promise the business is making. */
    /* ---------- STARRING SOMETHING, AND UNSTARRING IT ----------------------------------------------
       ONE ACTION FOR BOTH, because they are the same gesture and splitting them means a card has to
       know which state it is in before it can ask — which is exactly the thing that goes wrong when
       two tabs are open. The row exists or it does not; this makes it match `on`. */
    /* ---------- THE SHOP WINDOW, AND WHY A ROW IS SWITCHED OFF RATHER THAN DELETED --------------
       THIS HANDLER DID NOT EXIST. The tile was built, admin-gated twice, and posting since it was
       written — and `spotlight` was in no access list, so `accessDenied` refused it before any
       handler could be reached, and `doGet` sent no `DATA.spotlight` for `adoptSpotlight_` to read.
       Measured: zero occurrences of the word anywhere under `backend/`. Wired at both ends of the
       phone with nothing in the middle, which is `orderPrints` for the thirteenth time in this
       repository.

       ADMIN-GATED HERE AS WELL AS IN `ACTION_ACCESS`, the way `openWaitlist` is: the access list
       says who may reach the handler and this says what the handler will do, and a button is not a
       permission. The phone's own `if (!isAdmin()) return` in `toggleSpot` is a third, and it is
       the one that may be wrong — a phone can be lied to.

       SWITCHED OFF RATHER THAN DELETED, which is the opposite of `favourite` two blocks down.
       An unfavourite leaves nothing worth keeping. Taking something OUT of the shop window is a
       decision about what the business promotes, and `who` and `at` are who made it and when. It
       is also what makes the sheet the authority the moment it holds any row at all: with rows
       deleted, an admin who had cleared the window would fall through to the file's default list
       and the thing they removed would come straight back. See `spotNow_` in js/collections.js. */
    if (action === 'spotlight') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in first.' });
      if (!isAdminPerson(S(body.name))) return jsonOut({ error: 'Admins only.' });
      const kind = norm(body.kind), itemId = S(body.itemId);
      if (!kind || !itemId) return jsonOut({ error: 'Nothing to spotlight.' });

      const t = read(TAB.spotlight);
      const row = t.rows.find(r => norm(r.kind) === kind && key(r.item_id) === key(itemId));
      const on = TRUE_(body.on) ? 'TRUE' : '';
      if (row) {
        setCell(t, row, 'on', on);
        setCell(t, row, 'who', S(me.person_id));
        setCell(t, row, 'at', new Date());
      } else {
        addRow(t, {
          spot_id: 'S-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
          kind: kind, item_id: itemId, on: on, who: S(me.person_id), at: new Date(),
        });
      }
      clearCache();
      return jsonOut({ success: true, on: !!on });
    }

    if (action === 'favourite') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Sign in first.' });
      const kind = norm(body.kind), itemId = S(body.itemId);
      if (!kind || !itemId) return jsonOut({ error: 'Nothing to favourite.' });

      const t = read(TAB.favourites);
      const mine = t.rows.find(r => key(r.person_id) === key(me.person_id)
        && norm(r.kind) === kind && key(r.item_id) === key(itemId));

      if (TRUE_(body.on)) {
        /* ALREADY THERE IS A SUCCESS, not an error. Two taps on a slow connection, or the same
           thing starred on a phone and a laptop, must not produce a complaint about something the
           person plainly wanted. */
        if (!mine) {
          addRow(t, {
            fav_id: 'F-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
            person_id: S(me.person_id), kind: kind, item_id: itemId,
            at: new Date(),
          });
        }
      } else if (mine) {
        /* DELETED, NOT FLAGGED. An unfavourite leaves nothing worth keeping — there is no history
           anybody wants of things somebody stopped liking, and a tab full of dead rows makes the
           live ones slower to find. */
        delRow(t, mine);
      }
      clearCache();
      return jsonOut({ ok: true, on: TRUE_(body.on) });
    }

    if (action === 'openWaitlist') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });
      if (!isAdminPerson(personDisplayName(me))) {
        return jsonOut({ error: 'Only an admin can open a waiting list.' });
      }
      const venue = S(body.venue);
      if (!venue) return jsonOut({ error: 'Which venue?' });

      const t = read(TAB.jobs);
      /* ONE PER VENUE AND LEVEL. Two open lists for the same class split the families between them
         and neither ever fills — the whole mechanism depends on everybody landing in one place. */
      const already = t.rows.find(r => norm(r.kind) === 'waitlist'
        && TRUE_(r.open_to_others)
        && key(r.venue) === key(venue)
        && key(r.level) === key(S(body.level)));
      if (already) {
        return jsonOut({ error: 'A waiting list for ' + venue + ' is already open.' });
      }

      /* `waitlistPrice_` WAS A FUNCTION I INVENTED. The real one is `waitlistPrice(venue)` and it
         takes the venue alone — the level does not change what a seat costs on a shared class. */
      const price = waitlistPrice(venue);
      if (!price) {
        return jsonOut({ error: 'That venue has no price set for a shared session yet.' });
      }
      const jobId = 'W-' + Date.now();
      addRow(t, {
        job_id: jobId,
        status: 'unconfirmed',
        kind: 'waitlist',
        subject: 'Maths, English Language',
        level: S(body.level),
        service: 'Group',
        venue: venue,
        weekday: '', start_time: '',
        hours_per_session: price.hours,
        price_total: price.perSeatSession,
        max_students: price.seats,
        open_to_others: 'TRUE',
        /* ---------- THE COLUMN NAMES THE SHEET ACTUALLY USES -----------------------------------
           I WROTE `term`, `client` AND `note`, AND THE TAB HAS NONE OF THEM. It has `term_name` and
           `booked_by`, and no note column at all — so three values were dropped on every list
           opened, and `setup` said so in a warning nobody was reading at the time.

           `check-columns` reads what the backend WRITES against the schema and would have caught
           this — it did not, because `addRow` takes an object and the checker looks for literal
           column names near `setCell`. Worth knowing about that checker: it sees a field written
           one way and not the other. */
        term_name: termForNow(),
        booked_by: '',
      });
      /* AN EVENT SAYING IT WAS OPENED, and deliberately not a REQUEST — `participantsOf` folds
         REQUEST into a seat, so using it here would put the admin on the list, which is the whole
         thing this exists to avoid. */
      /* `ACT.SAY`, NOT A NAME I MADE UP. The verbs are a closed set and `ACT.NOTE` is not one of
         them — an unknown action falls through `BM_EFFECT` and changes nobody's status, which
         happens to be what is wanted here and only by luck. `SAY` is the verb that means exactly
         that on purpose: a note in the log that moves no one. */
      logEvent({ jobId, actor: personDisplayName(me), role: 'admin', action: ACT.SAY,
                 message: 'opened the waiting list', requestId: S(body.requestId) });
      clearCache();
      return jsonOut({ ok: true, jobId: jobId });
    }

    if (action === 'joinWaitlist') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });

      const venue = S(body.venue);
      if (!venue) return jsonOut({ error: 'Which venue?' });

      const price = waitlistPrice(venue);
      /* NOT PRICED IS NOT FREE. A venue with no rate, or an open tutor rate nobody has set, means
         the seat cannot be costed — and putting somebody on a list at £0.00 is a promise. */
      if (!price) {
        return jsonOut({ error: 'That venue has no price set for a shared session yet.' });
      }

      const t = read(TAB.jobs);
      let j = openWaitlistAt(venue);

      if (j) {
        const jobId = S(j.job_id) || String(j._row);
        const on = clientsIn(jobId);
        /* ALREADY ON IT. Said plainly rather than adding a second row for the same family, which
           would take two of the four seats and be invisible until somebody counted. */
        if (on.some(c => key(c.name) === key(personDisplayName(me)))) {
          return jsonOut({ error: 'You are already on that list.' });
        }
        /* ---------- FULL IS THE ROOM, AND SHUT IS THE CALENDAR --------------------------------
           A LIST THAT IS RUNNING IS NOT OFFERED HERE AT ALL — `openWaitlistAt` has already passed
           over it — so reaching this point with a full roster means four people are on it and none
           of them has been asked for money yet. */
        const st = waitStage_(j);
        if (st.left <= 0) {
          return jsonOut({ error: 'That list is full — it will run once three of them have paid.' });
        }
      } else {
        /* THE FIRST FAMILY, so the session comes into existence around them. */
        const jobId = 'W-' + Date.now();
        addRow(t, {
          job_id: jobId,
          status: 'unconfirmed',
          kind: 'waitlist',
          /* BOTH SUBJECTS, and they are not a choice. One tutor teaching Maths and English to four
             children is what this session IS, so it is written here rather than asked. */
          subject: 'Maths, English Language',
          level: S(body.level),
          service: 'Group',
          venue: venue,
          /* NO DAY AND NO TIME YET. They are settled when the list fills and you make it a session;
             a time written now would be a promise to four families about a room nobody has booked. */
          weekday: '', start_time: '',
          hours_per_session: price.hours,
          /* WHAT ONE SEAT COSTS, which is what every family on this list is charged. `price_total`
             holds the per-seat figure deliberately: `createCheckout` falls back to it PER PERSON
             when there is no receipt, and per-person is exactly right here — four families each
             buying one seat, not one family buying the room. */
          price_total: price.perSeatSession,
          max_students: price.seats,
          /* ONE CHILD EACH. The seats are the point of the price, and a family taking two would be
             buying half the session at a quarter of the cost. */
          for_children: '',
          /* OPEN BY DEFINITION. A waitlist is strangers agreeing to share, which is the whole
             product — there is nothing to ask. */
          open_to_others: 'TRUE',
          /* NOBODY IS PICKED. A tutor is assigned when it runs, and the rate it is priced at is the
             one for a tutor nobody chose. */
          stealable: 'TRUE',
          /* ---------- WHEN IT SHUTS, WORKED OUT RATHER THAN SENT --------------------------------
             THIS READ `body.closesOn` AND NOTHING HAS EVER SENT IT. The column has been on every
             waitlist row since the column existed, blank every time, with a comment above it in
             `constants.gs` saying nothing enforces it yet — so a list that never filled sat open
             for good and the families on it were waiting on an answer that was never coming.

             THREE WEEKS BEFORE THE NEXT TERM STARTS. Counted here, once, at the moment the list is
             made, so it is a date sitting in a cell that you can read and change rather than a rule
             running invisibly somewhere. */
          closes_on: waitShutsOn_() || '',
          created_at: new Date(),
        });
        j = t.rows[t.rows.length - 1];
      }

      const jobId = S(j.job_id) || String(j._row);
      /* WHEN THEY COULD COME, ON THEIR OWN JOINING EVENT.
         NOT A COLUMN ON THE JOB, and that is the whole point: four families share one waitlist row
         and each has a different answer, so a column could only ever hold the last one written. The
         event is already per-person — it is what `participantsOf` folds the roster out of — so this
         is theirs by construction and needs no schema change.

         AND IT IS WHERE SOMEBODY WILL LOOK. The day this class runs on is chosen by reading what
         the four of them said, and `eventsForJob` already sends every event to the phone. */
      const when = S(body.availability);
      logEvent({ jobId, actor: personDisplayName(me), role: 'client', action: ACT.REQUEST,
                 message: 'joined the waitlist' + (when ? ' — can come: ' + when : ''),
                 requestId: S(body.requestId) });
      clearCache();

      /* THEIR OWN RECEIPT, at their own seat price, written now for the same reason every other one
         is: it is what they were shown and agreed to, and `createCheckout` charges from it rather
         than from a job cell that can move afterwards. */
      const receipt = writeReceipt_({
        kind: 'waitlist', jobId: jobId,
        personId: S(me.person_id), personName: personDisplayName(me),
        total: price.perSeatSession, currency: 'GBP',
        lines: [
          { k: 'Venue', v: venue },
          { k: 'Subjects', v: 'Maths, English Language' },
          { k: 'Seat', v: '1 of ' + price.seats },
          { k: 'Per hour, whole session', v: price.hourlyWhole },
          { k: 'Per hour, your seat', v: price.perSeatHour },
        ],
        note: 'Waitlist seat — nothing is charged until the list is full.',
      });

      const now = clientsIn(jobId);
      return jsonOut({ success: true, jobId: jobId,
        /* WHERE IT HAS GOT TO, so the card can say "3 of 4" rather than "you are on a list". */
        joined: now.length, seats: price.seats,
        full: now.length >= price.seats,
        perSeat: price.perSeatSession,
        receiptId: receipt.receiptId || '', receiptError: receipt.error || '' });
    }

    /* --- JOINING A FESTIVE EVENT ----------------------------------------------------------------
       THE SAME SHAPE AS A WAITLIST, and for the same reason: it is a job, so the roster, the lobby,
       the payment path and the receipt all work untouched. What differs is where the price comes
       from — a waitlist seat is computed from the venue and the seat count, and this is a figure
       you typed on the holidays row, because a Christmas party is priced by judgement rather than
       by arithmetic.

       THE FIRST FAMILY CREATES IT. There is no separate "open the event" step: an event nobody has
       joined is a row saying nothing, and making them two acts leaves empty events lying about on
       every holiday you ever considered.

       `term_name` HOLDS THE HOLIDAY'S ID, which is the one borrowed column here. It is what joins a
       job back to the row that offered it, and `term_name` on a festive job would otherwise be
       empty — a term is a teaching block and this is an afternoon. Worth saying out loud because it
       is the kind of reuse that reads as a mistake later.
    ------------------------------------------------------------------------------------------- */
    if (action === 'joinFestive') {
      const me = findPerson(S(body.name), S(body.personId));
      if (!me) return jsonOut({ error: 'Not signed in.' });

      /* THE OFFER AS THE CALENDAR SEES IT TODAY, not as the phone described it. A price or a
         capacity posted by a browser is a price the browser chose, and this one is a card that may
         have been sitting open in a tab since last week. */
      const offer = festiveOffers().find(o => key(o.id) === key(S(body.holidayId)));
      if (!offer) {
        return jsonOut({ error: 'That is not on at the moment — it may have finished, or the '
          + 'details are not set yet.' });
      }

      const t = read(TAB.jobs);
      let j = t.rows.find(x => norm(x.kind) === 'festive'
        && key(x.term_name) === key(offer.id));

      if (j) {
        const jobId = S(j.job_id) || String(j._row);
        const on = clientsIn(jobId);
        if (on.some(c => key(c.name) === key(personDisplayName(me)))) {
          return jsonOut({ error: 'You are already coming to that.' });
        }
        if (on.length >= offer.seats) {
          return jsonOut({ error: 'That is full.' });
        }
      } else {
        const jobId = 'F-' + Date.now();
        addRow(t, {
          job_id: jobId,
          status: 'unconfirmed',
          kind: 'festive',
          subject: offer.name,
          level: '',
          service: 'Event',
          venue: offer.venue,
          weekday: '', start_time: '',
          hours_per_session: offer.hours,
          /* PER CHILD, like a waitlist seat — every family is buying the same thing, and
             `createCheckout` falls back to this per person, which is exactly right. */
          price_total: offer.price,
          max_students: offer.seats,
          session_dates: offer.date,
          term_name: offer.id,
          open_to_others: 'TRUE',
          stealable: 'TRUE',
          created_at: new Date(),
        });
        j = t.rows[t.rows.length - 1];
      }

      const jobId = S(j.job_id) || String(j._row);
      /* HOW MANY CHILDREN THEY ARE BRINGING, on their own joining event — the same place a
         waitlist keeps availability, and for the same reason: it is per family and the job is one
         row. A party needs a headcount and a family with three children is three chairs. */
      const kids = S(body.kids);
      logEvent({ jobId, actor: personDisplayName(me), role: 'client', action: ACT.REQUEST,
                 message: 'coming to ' + offer.name + (kids ? ' — bringing: ' + kids : ''),
                 requestId: S(body.requestId) });
      clearCache();

      const receipt = writeReceipt_({
        kind: 'festive', jobId: jobId,
        personId: S(me.person_id), personName: personDisplayName(me),
        total: offer.price, currency: 'GBP',
        lines: [
          { k: 'Event', v: offer.name },
          { k: 'Where', v: offer.venue },
          { k: 'When', v: offer.date },
          { k: 'Per child', v: offer.price },
        ],
        note: 'Festive event — ' + offer.holiday,
      });

      const now = clientsIn(jobId);
      notify(adminName_(), 'Somebody is coming to ' + offer.name,
        personDisplayName(me) + ' has joined ' + offer.name + ' on ' + offer.date
        + (kids ? '\nBringing: ' + kids : '')
        + '\n\n' + now.length + ' of ' + offer.seats + ' places taken.');

      return jsonOut({ success: true, jobId: jobId,
        joined: now.length, seats: offer.seats,
        full: now.length >= offer.seats,
        receiptId: receipt.receiptId || '', receiptError: receipt.error || '' });
    }

    /* --- AN ADMIN LINKS A CHILD TO A PARENT ----------------------------------------------------
       NOT `claimChild`, AND THE DIFFERENCE IS THE POINT.

       `claimChild` is a PARENT saying "this is mine", and it writes `asked` — nothing is true until
       the child answers. That is the whole reason the family tab has a state instead of a name in
       a cell: a claim nobody agreed to is a claim, and a parent who could link a child unilaterally
       could attach themselves to somebody else's.

       This is not a parent. It is the person who runs the business recording a family they know,
       and it writes `accepted` straight away. That is the same act as typing it into the
       spreadsheet, which is what it replaces — and the reason it is admin-only and says who did it
       in the log.

       By ID or by name, because an admin doing this is looking at a list of names. --- */
    if (action === 'linkChild' || action === 'unlinkChild') {
      const parent = findPerson(S(body.parent), S(body.parentId));
      const child  = findPerson(S(body.child),  S(body.childId));
      if (!parent) return jsonOut({ error: 'No parent by that name.' });
      if (!child)  return jsonOut({ error: 'No child by that name.' });
      if (S(parent.person_id) === S(child.person_id)) {
        return jsonOut({ error: 'That is the same person.' });
      }

      const t = read(TAB.family);
      const row = t.rows.find(r => S(r.parent_id) === S(parent.person_id)
                                && S(r.child_id) === S(child.person_id));

      if (action === 'unlinkChild') {
        if (!row) return jsonOut({ error: 'They are not linked.' });
        /* REMOVED, not marked refused. `refused` is the CHILD's answer and means they were asked
           and said no — putting an admin's correction under the same word would make the tab lie
           about who decided. A link made in error should leave no trace of having been made. */
        delRow(t, row);
        clearCache();
        return jsonOut({ success: true, unlinked: true });
      }

      if (row) {
        if (norm(row.state) === 'accepted') {
          return jsonOut({ success: true, alreadyLinked: true });
        }
        /* A row that was asked and never answered, or refused, becomes accepted — an admin saying
           so settles a question the child never got round to. */
        setCell(t, row, 'state', 'accepted');
        setCell(t, row, 'answered_on', new Date());
        clearCache();
        return jsonOut({ success: true, settled: true });
      }

      addRow(t, {
        link_id: 'F' + Date.now(),
        parent_id: S(parent.person_id),
        child_id: S(child.person_id),
        child_typed: personDisplayName(child),
        state: 'accepted',
        asked_on: new Date(),
        answered_on: new Date(),
      });
      clearCache();
      return jsonOut({ success: true,
                       parent: personDisplayName(parent), child: personDisplayName(child) });
    }

    /* --- AN ADMIN ENDS A SESSION ---------------------------------------------------------------
       DELETING A JOB IS WITHDRAWING EVERYONE FROM IT.

       That is not a trick to avoid writing a delete — it is what this system already means by a
       session being over. `participantsOf` folds the roster out of the events, `jobStatusOf` calls
       a job with no clients `cancelled`, and `doGet` does not send one. So a job everybody has left
       is already invisible everywhere, through the machinery that was built for it.

       Which means there is no `deleted` column to add. A second way for a job to be hidden is a
       second thing that can disagree with the first — a stale flag on a job with people still in
       it, or a job with nobody in it that a flag says is live. One rule, and it is the rule that
       was already there.

       THE ROW STAYS, AND SO DOES EVERY EVENT. What happened to a session — who asked, who agreed,
       who paid, who pulled out — is a thing you may be asked about months later, and it is exactly
       what a real delete would take away. The events tab is the record; this only ends the
       booking. --- */
    if (action === 'deleteJob') {
      const t = read(TAB.jobs);
      const j = t.rows.find(x => S(x.job_id) === S(body.jobId)
                              || String(x._row) === S(body.jobId));
      if (!j) return jsonOut({ error: 'No session with that id.' });
      const jobId = S(j.job_id) || String(j._row);
      const by = S(body.adminName) || S(body.name);

      const before = participantsOf(jobId);
      if (!before.length) {
        /* Already empty — the job is invisible and there is nobody to withdraw. Reported as done
           rather than as an error: pressing delete on something already deleted should not read as
           a failure. */
        setCell(t, j, 'status', 'cancelled');
        clearCache();
        return jsonOut({ success: true, alreadyEmpty: true });
      }

      /* ONE WITHDRAW EACH, in their own name, so the log says who left rather than that an admin
         did something unnamed to the roster. `message` is what makes it readable a year later. */
      before.forEach(pp => logEvent({
        jobId, actor: pp.name, role: pp.role, action: ACT.WITHDRAW,
        message: 'session ended by ' + by,
        requestId: S(body.requestId) ? S(body.requestId) + '-' + key(pp.name) : '',
      }));
      clearCache();

      setCell(t, j, 'status', jobStatusOf(jobId));
      /* Nobody may pick it up afterwards — an open job with no clients is a job a tutor could
         apply to and never hear about again. */
      setCell(t, j, 'stealable', 'FALSE');
      clearCache();

      /* TELL THEM. A session vanishing from somebody's screen with no word is the worst version of
         this: they turn up, or they do not turn up and never know why. */
      before.forEach(pp => notify(pp.name, 'Cancelled: ' + S(j.subject),
        S(j.subject) + (S(j.weekday) ? ' on ' + S(j.weekday) : '')
        + (fmtTime(j.start_time) ? ' at ' + fmtTime(j.start_time) : '')
        + ' is not going ahead.\n\nIf that is a surprise, reply to this message.\n\n— @family.'));

      return jsonOut({ success: true, ended: before.length,
                       who: before.map(x => x.name) });
    }

    /* --- diagnostics ------------------------------------------------------------------------- */
    if (action === 'debugTabs') {
      const out = {};
      Object.keys(TAB).forEach(k => {
        const t = read(TAB[k]);
        out[TAB[k]] = t.sheet ? { rows: t.rows.length, columns: t.headers.length } : 'MISSING TAB';
      });
      return jsonOut({ version: BACKEND_VERSION, tabs: out });
    }

    return jsonOut({ error: 'Unknown action: ' + action });
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}

/* ---------- THE REPLY A SIGNED-IN PERSON GETS ------------------------------------------------------
   ONE COPY, TWO DOORS. A PIN and a Google account are two ways of proving the same thing, and what
   comes back afterwards is not a property of how you knocked. Written out twice, the second copy
   would be missing a field within a month — this reply has lost `todo`, `photo`, `avatar` and
   `avatarItems` one at a time already, each for weeks, each because it was assembled somewhere
   that did not know about them. */
/* ==================================================================================================
   EVERY BOX ON THE SETTINGS FORM OPENED EMPTY, AND SAVING ONE EMPTIED THE SHEET TO MATCH.

   `settingsPages_` fills its fields from `USER.profile` and NOTHING HAS EVER SENT ONE to the person
   themselves. `getProfile` built one — for an ADMIN, looking at somebody else — and this reply, the
   one a person gets about their own row, did not. So every group on the Settings column drew a card
   of blank boxes on a fresh sign-in, whatever was actually in the sheet.

   AND A BLANK BOX IS NOT THE ABSENCE OF AN ANSWER TO `me-save`. It gathers every `[data-me]` in the
   card, empty ones included, and `updateProfile` writes what it is given — so opening Settings,
   pressing Save on "About you" and changing nothing wrote `''` over the headline, the photograph,
   the years of experience and all three adjectives. The one screen for editing your own details
   was the one screen that could erase them, on the first press, with a toast saying "Saved".

   `profileOf_` IS THE ONE BUILDER AND BOTH CALLERS USE IT. This was `getProfile`'s own block,
   lifted out — an admin's view of somebody and that somebody's view of themselves are the same
   object, and writing it twice is the second reader this repository records under `documents_()`,
   `factsNow_` and `childrenOf`. `availSet` is called once here rather than once per hour code,
   which it was.

   IT IS NOT A DISCLOSURE. This reply is answered only after `authCheckPin_` has passed, and it
   carries the row of the person who just proved they are it — which is strictly less than
   `getProfile` has handed an admin since it was written. */
function profileOf_(r) {
  const avail = availSet(r.availability);
  /* The library cards and the qualifications are rows on tabs of their own, read once each. */
  const cards = libCardsOut(r);
  const photos = photosOut(r.photos);
  const quals = qualsOut(r);
  /* ---------- AND THE DATE OF BIRTH, WHICH WAS BEING SENT AS A JAVASCRIPT DATE STRING ------------
     `S(r.date_of_birth)` IS `String(v).trim()`, AND SHEETS STORES A DATE AS A REAL DATE. So a
     birthday typed into the spreadsheet came back into the box as
     `Sun Sep 15 1985 00:00:00 GMT+0100 (British Summer Time)` — rendered and verified — on a field
     somebody is expected to read and edit. Every other date leaving this file goes through
     `fmtDate`; this one did not, which is the `S(c.said_on)` fault one tab along.
     Repaired by the three boxes rather than beside them: `dobOut` reads the cell through
     `sheetDate`, so a real Date and a `dd/mm/yyyy` string both come apart into three numbers. */
  const dob = dobOut(r.date_of_birth);
  const out = { avatar: S(r.avatar), role: S(r.role) };
  PROFILE_EDITABLE.concat(PROFILE_READONLY).forEach(f => {
    out[f] = f.match(/^(m|tu|w|th|f|sa|su)\d\d$/) ? (avail[f] ? 'TRUE' : '')
           : LIBRARY_FIELD.test(f) ? S(cards[f])
           : PHOTO_FIELD.test(f) ? S(photos[f])
           : QUAL_FIELD.test(f) ? S(quals[f])
           : f === 'venues_ok' ? venuesFor_(r, read(TAB.venues).rows).join(', ')
           : f === 'date_of_birth' ? S(dobIn(dob))
           /* ---------- AND AN EXAM DATE AS `yyyy-mm-dd`, WHICH IS WHAT THE PICKER CAN HOLD ------
              `S(r[f])` IS THE `S(r.date_of_birth)` FAULT ONE COLUMN ALONG, and worse: a birthday
              sent as `Sun Sep 15 1985 …` at least DREW, wrongly, in a text box. A date input
              silently rejects any value that is not ISO — so a real Date, or a `dd/mm/yyyy` string
              typed into the spreadsheet, would open an EMPTY picker over a cell that has a date in
              it, and the next save would write the empty over it. */
           : DATE_COLS.indexOf(f) !== -1 ? isoDate_(r[f])
           : S(r[f]);
  });
  /* THE THREE BOXES ARE SENT AS WELL AS THE CELL. They are not columns, so the loop above cannot
     produce them — and the form reads them by name. The cell itself stays because `fieldsHtml`
     dispatches on the group's field list, which still names `date_of_birth`. */
  DOB_FIELDS.forEach(f => { out[f] = S(dob[f]); });
  const ph = phoneOut(r.phone);
  PHONE_FIELDS.forEach(f => { out[f] = S(ph[f]); });
  return out;
}

function loginReplyFor_(r, token) {
// 'parent'/'kid' are what the frontend calls client/student.
  const appRole = toAppRole(mainRole(r));
  const appRoles = rolesOf(r).map(toAppRole);
  const out = { success: true, role: appRole, roles: appRoles, name: personDisplayName(r),
                /* THE SESSION. Sent once, at sign-in, and never again — the phone keeps it and
                   offers it on every request, and the sheet holds only its digest. */
                token: token || '',
                // The session's real identity from here on. Names are for logging in.
                personId: S(r.person_id),
                handle: S(r.handle),
                /* BOTH of them. `saveTodo` has been writing the docket to this column since it
                   was built and the login reply only ever sent the notepad back — so every
                   line anybody added was saved correctly, survived in the sheet, and was gone
                   from the app the next time they signed in. Written under one name and read
                   under another, which is the fault this whole file keeps producing; the only
                   reason it is here rather than in the list of seven is that nothing was
                   comparing the two sides until now. */
                notepad: S(r.notepad), todo: S(r.todo),
                /* THE PHOTOGRAPH. Neither field was in this reply, so the You screen has been
                   falling back to a letter in a circle for everybody since the rewrite — it
                   reads `USER.photo`, and nothing was sending one.
                   They are DIFFERENT THINGS and both are needed: `photo` is a picture of the
                   person, `avatar` is the wearable string — "hair:crop|legs:jeans" — which is
                   a figure to be drawn and is a broken image in any <img> that gets it. */
                photo: S(r.photo), avatar: S(r.avatar),
                /* AND WHAT THEY MAY WEAR. `getProfile` has always sent this and the login
                   reply never did — so the wardrobe on somebody's own screen had to guess
                   their unlocks from the shop rows, while an admin looking at them got the
                   real answer. One of those is authoritative and it was not the one the
                   person themselves was shown. */
                avatarItems: avatarUnlocks(r),
                xp: N(r.xp), credits: N(r.credits),
                /* `ticks:` WAS HERE, counted off the document rows. There are no document rows
                   and no tick columns — see `toggleTopicTick` below. The You screen no longer
                   draws the row, rather than drawing a 0 that would read as "you have done
                   nothing" instead of as "this is gone". */
                /* The address, because the basket has to know whether it can offer to post
                   anything. Without it the option is missing and the reason is invisible. */
                address: S(r.address), postcode: S(r.postcode),
                /* THE SETTINGS FORM'S OWN VALUES — see `profileOf_` above. Without it every box on
                   that column opens blank and the first Save writes the blanks back. */
                profile: profileOf_(r),
                /* THE TUTOR AGREEMENT — so the box draws ticked and locked on every phone the
                   person signs in on, not only the one they ticked it on. */
                agreementSignedAt: S(r.agreement_signed_at), agreementVersion: S(r.agreement_version),
                highscore: N(r.high_score_flappy), ttHighscore: N(r.high_score_tables),
                friends: S(r.friends) };
  /* `childNamesOf`, NOT `childrenOf` — see the note on it. This said `childrenOf(r)`, which after
     the duplicate declaration was resolved by the second one meant "find children whose parent_id
     equals this row object", so it has always been `[]`. The booking form reads
     `USER.children || USER.kids`, and `out.children` below is set correctly from the accepted
     links, which is why nothing looked broken: the fallback carried it and the primary was dead. */
  if (appRole === 'parent') out.kids = childNamesOf(r);

  /* Their family, as agreed by both sides, and anything still waiting on them. Sent with the
     person rather than fetched separately — it is three names, and a second round trip for
     three names costs more than carrying them. */
  const meId = S(r.person_id);
  out.parents  = acceptedParents(meId).map(personDisplayName);
  out.children = acceptedChildren(meId).map(personDisplayName);
  out.siblings = siblingsOf(meId).map(personDisplayName);
  out.claims = read(TAB.family).rows
    .filter(x => S(x.child_id) === meId && norm(x.state) === 'asked')
    .map(x => {
      const pr = findPerson(S(x.parent_id));
      return { rowIndex: x._row, from: pr ? personDisplayName(pr) : 'Someone' };
    });
  /* ---------- `out.profile = {}` WAS HERE, AND IT THREW AWAY `profileOf_` TEN LINES AFTER USING IT ---
     The object literal above sets `profile: profileOf_(r)` — every packed cell expanded into the
     boxes the form draws. This block, older than that line, then REPLACED it with `S(r[f])` for each
     name in the role's groups: so the qualification shelf past row three, every tick and received
     year, all nine library boxes, the phone's two boxes, the birthday's three and both exam pickers
     came back EMPTY or as a raw `Date` string on every sign-in. The form drew blanks over a sheet
     that had values, and the next Save on those pages wrote the blanks back — reported as "some
     things arent updating when i click save". `location` went with it: nothing on the phone reads
     `profile.location`. */
  return jsonOut(out);
}