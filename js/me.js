/* ==================================================================================================
   @family. — me.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   me.js is number 7 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */



/* ================================================================================================
   THE SCREENS.

   One function each, returning markup. None of them touches the tab bar, hides another screen, or
   has an opinion about the sheet — that is the shell's job, and keeping it that way is why adding
   the eighth screen will be as easy as the second.

   Everything pressable carries `data-do`, so markup can be thrown away and redrawn without
   anything needing to be rewired.
================================================================================================ */

/* ---------- YOU --------------------------------------------------------------------------------
   Everything about the person using the app, and nothing about the app. Signed out it is one
   button; signed in it is who you are, what you have, and the ways out.
--------------------------------------------------------------------------------------------- */
/* One card ends where the next begins — the one place they are unambiguously separated, and the
   reason these screens are written as one template and split rather than assembled from a list:
   the template is how they read. */
const split_ = html => String(html).split(/(?=<div class="card|<h2)/).map(x => x.trim()).filter(Boolean);

/** Every card on the You screen, in order. */
function meBlocks() {
  if (!USER) {
    return split_(`<div class="card">
        <h3>Sign in</h3>
        <p class="sub">You need an account to book, to keep a checklist, or to spend credits.</p>
        <label class="field"><span>your name</span>
          <input id="in-name" autocomplete="username" placeholder="e.g. Halex Dias"></label>
        <label class="field"><span>PIN</span>
          <input id="in-pin" type="password" inputmode="numeric" autocomplete="current-password"></label>
        <button class="btn" data-do="do-signin">Sign in</button>
        <p class="faint" id="in-said" style="margin:.6rem 0 0"></p>
      </div>
      <div class="card tap" data-do="register">
        <h3>No account yet?</h3>
        <p class="sub">Making one takes a name, an email and a PIN.</p>
      </div>`);
  }

  const ticks = typeof tickCount === 'function' ? tickCount() : 0;
  const rows = [
    ['Name', USER.name],
    ['Role', roleOf(USER.role || '')],
    ['Credits', String(USER.credits || 0)],
    ['Ticks', String(ticks)],
    /* FROM THE PROFILE, which is where the login reply puts them. `verifyLogin` returns an
       `email` and a `city` inside `profile` and nothing at the top level, so both of these rows
       have been undefined for everybody — and the filter below drops an empty row silently, so
       the card simply had two fewer lines and nothing said why. The same fault the photograph
       had, two lines down, fixed the same way. */
    /* AND THE DEAD HALF OF EACH IS GONE. `USER.email`, `USER.city` and `USER.borough` were the
          first thing each of these tried, and the login reply has never sent any of them at the top
          level — so all three were undefined every single time and the profile behind them did all
          the work. A branch that never runs reads as the one that does, and the next person to
          wonder where these come from would have looked at the wrong half. */
    ['Email', (USER.profile || {}).email],
    ['Where', (USER.profile || {}).city || (USER.profile || {}).borough],
  ].filter(([, v]) => v);

  /* THE PHOTOGRAPH, not the figure. `USER.avatar` is the WEARABLE string — "hair:crop|legs:jeans"
     — and putting that in a src gives a broken image every time. The picture is `photo`, it is a
     Drive link, and it goes through `pic()` like every other one.
     It was also never sent: verifyLogin's reply carried neither field, so this has been falling
     back to a letter for everybody since the rewrite. */
  /* A PHOTOGRAPH IF THERE IS ONE, otherwise the figure. The letter in a circle is the last
     resort now rather than the second — it says nothing about anybody, and every account has a
     figure whether or not anybody has chosen one, because the starting look is seeded from the
     handle. */
  const face = pic(USER.photo || (USER.profile || {}).photo || '');
  return split_(`<div class="card">
      <div class="thing">
        ${face
          ? `<img class="thing-pic" src="${esc(face)}" alt="">`
          : `<span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>`}
        <div class="thing-body">
          <h3>${esc(USER.name)}</h3>
          <p class="sub">${esc(roleOf(USER.role || 'student'))}</p>
        </div>
      </div>
    </div>

    <div class="card">
      ${/* Same fault as the tutor sheet had: the label was inside quotes inside an
            interpolation, so every row on this card was labelled `${esc(k)}`. */''}
      ${rows.map(([k, v]) => row(k, v)).join('')}
    </div>

    <div class="card tap" data-do="wardrobe">
      <div class="thing">
        <span class="thing-pic art">${avatarFor(USER.handle || USER.name, 52, USER.avatar)}</span>
        <div class="thing-body">
          <h3>Your figure</h3>
          <p class="sub">${(() => {
            /* WHAT THEY ARE WEARING, in words. A row of item names is what somebody would say out
               loud, and it tells you the wardrobe holds something before you open it. */
            const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
            const on = AV_SLOTS.map(([slot]) => cfg[slot])
              .filter(id => id && id !== 'none' && id !== 'crop' && id !== 'plain');
            return on.length ? esc(on.join(', ')) : 'Nothing on yet — pick something';
          })()}</p>
        </div>
      </div>
    </div>

    ${/* ---------- END OF THE PROFILE CARD ------------------------------------------------------
          Everything above is WHO YOU ARE: your name and face, the facts about your account, and
          your figure. Everything below is what you DO with the account — change your details, see
          what needs fixing, hand out your link, sign out.
          Two different questions, so two panes. `ME_SPLIT` is the mark between them; `mePages`
          cuts on it. A marker rather than counting cards, because the admin card in the second
          group only exists for an admin — so any count would be right for you and wrong for
          everybody else. */''}
    ${ME_SPLIT}
    <div class="card tap" data-do="edit-me"><h3>Edit your details</h3>
      <p class="sub">Name, email, address, availability.</p></div>

    ${/* WHAT IS WRONG WITH THE DATA, said where somebody will see it.
          `dataProblems()` is the largest diagnostic in the backend — a term that ends before it
          starts, a tutor with no hours, an admin row with no PIN, a law set to a colour nobody
          defined — and it has been computed, put in the payload under `health`, and read by
          nothing. Every item in it is something that used to have to be noticed by a person
          staring at a spreadsheet, and the system already knew all of it.
          Admin only, because it is a list of what needs fixing rather than anything a client
          would act on. */
      isAdmin() ? `<div class="card tap" data-do="health"><h3>What needs fixing</h3>
        <p class="sub">Terms, tutors, prices, permissions — everything the sheet already knows is
          wrong.</p></div>` : ''}

    ${/* MESSAGES AND CHANGE-YOUR-PIN BOTH LEFT THIS SCREEN.
          Messages is a thing you READ, which is what the widgets are — it sits in Find with the
          calculator and the calendar, and gets a whole pane instead of a card that says how many
          are unread.
          Changing a PIN is part of your details, and was a second card asking for a second sheet to
          do a thing the first sheet is already for. */''}
    <div class="card tap" data-do="my-referral"><h3>Tell someone</h3>
      <p class="sub">A link only you have. We will know it came from you.</p></div>

    <button class="btn quiet" data-do="signout" style="margin-top:.4rem">Sign out</button>
    ${/* BOTH VERSIONS, at the bottom where a version number belongs. It is the answer to the
          question that has cost more rounds than any bug: is what I am looking at the thing I
          just changed? Two strings, and either one being stale is visible without opening
          anything. */''}
    ${/* ALL THREE, because any one of them being stale looks exactly like a bug in the other
          two. This line is the first thing to read when something has been changed and has not
          changed — and the CSS was the one that could not be asked. */''}
    <p class="faint" style="text-align:center">@family. · Merton &amp; Wandsworth<br>
      site ${esc(SITE_VERSION)} · css ${esc(cssVersion())}<br>
      backend ${esc(DATA.version || '—')}</p>`);}

/* THE YOU SCREEN IS ONE PAGE.
   It was chunked four cards at a time, which put Messages, Change your PIN, Tell someone and Sign
   out on a second page — and a pager on a SETTINGS screen is the wrong instrument entirely. Paging
   is for a list you are working THROUGH: posts, search results, sessions. This is a list you are
   looking IN, and the thing somebody wants is never on the page they are on, because they do not
   know which page it is on. Signing out should not require finding it first.
   One page, scrolled. Longer, and everything is where it looks like it is. */
/* MESSAGES, ON A PANE OF ITS OWN.

   `mePages` was `[meBlocks().join('')]` — every block split apart by `split_` and then immediately
   joined back into one page. So the whole of You was a single pane with everything stacked down it
   as rows, and nothing on that screen could be its own card however it was styled. That is why
   Messages kept coming out as another row: there was no second pane for it to be.

   Two pages now. Your details, credits and the rest stay together as one list, because that is
   what they are. A thread is not a fact about you — it is somebody trying to reach you — so it
   gets the pane, the same way a session gets one on the Book screen.

   ONE FUNCTION FOR THE CARD, called from here, so the markup and the page cannot come apart. */
function meMessagesCard() {
  return `<div class="card">
    <h3>Messages</h3>
    <p class="sub">Anyone who has written to you.</p>
    <div id="msg-body" class="msg-body"></div>
  </div>`;
}

/* THE MARK BETWEEN THE TWO HALVES of the You screen. A comment in the markup: it survives being
   built into a string, it cannot be mistaken for content, and it renders as nothing if it ever
   escapes. */
const ME_SPLIT = '<!--me-split-->';

const mePages = () => {
  const all = meBlocks().join('');
  /* PROFILE, then ACCOUNT, then MESSAGES. Split on the marker rather than on a card count, so the
     admin-only card in the second half cannot move the boundary for an admin and not for anybody
     else. No marker — the signed-out screen — is one page, which is right: there is nothing to
     settle and nobody to have written to you. */
  const cut = all.indexOf(ME_SPLIT);
  const pages = cut < 0
    ? [all]
    : [all.slice(0, cut), all.slice(cut + ME_SPLIT.length)];
  if (USER) pages.push(meMessagesCard());
  return pages;
};

/* Drawn, then filled. `fillMessages` looks for `#msg-body` by id, so it can only run once this
   screen's markup is in the document — the same reason a widget's `start` runs after its page is
   filled rather than while it is being built. A frame later is enough, and it costs nothing on a
   screen nobody is looking at because there is no `#msg-body` to find. */
screen('me', () => {
  const html = pages('me', mePages());
  if (USER) requestAnimationFrame(() => { if ($('msg-body')) fillMessages(); });
  return html;
});

/**
 * THE HEALTH REPORT.
 *
 * ASKED FOR, not carried. The check walks the terms, the people, the venues, the resources and
 * the landmarks, and it probes Drive and asks Google what this deployment is allowed to do — a
 * second or two of work that has no business happening on a page load somebody is waiting for.
 * `?health=1` is the backend's own switch for exactly this.
 *
 * Grouped by `level`, which is the backend's word for what it costs you — things that stop money
 * first, then things that stop contact, then things that are merely untidy. The order it sends
 * them in is already that order, so grouping preserves it rather than imposing one.
 */
on('health', () => {
  if (!isAdmin()) { toast('Admins only'); return; }
  openSheet('What needs fixing', '<p class="empty faint">Checking…</p>');

  const url = API + '?health=1&name=' + encodeURIComponent(USER.name)
            + (USER.personId ? '&person=' + encodeURIComponent(USER.personId) : '')
            + '&_=' + Date.now();
  fetch(url, { cache: 'no-store' })
    .then(r => r.json())
    .then(d => {
      const body = $('sheet-body');
      if (!body || ($('sheet-title') || {}).textContent !== 'What needs fixing') return;
      if (d && d.error) { body.innerHTML = `<p class="empty">${esc(d.error)}</p>`; return; }

      const problems = ((d || {}).health || {}).problems || [];
      if (!problems.length) {
        body.innerHTML = `<p class="empty">Nothing to fix.<br><span class="faint">Every check the
          backend runs came back clean.</span></p>`;
        return;
      }

      /* One card per level, in the order the backend listed them. A flat list of thirty items
         sorted by nothing is a list nobody works through. */
      const order = [];
      const byLevel = {};
      problems.forEach(p => {
        const k = String(p.level || 'other');
        if (!byLevel[k]) { byLevel[k] = []; order.push(k); }
        byLevel[k].push(p);
      });

      body.innerHTML = order.map(level => `<div class="card">
        <h3>${esc(level)}</h3>
        ${byLevel[level].map(p => `<div class="row" style="display:block">
          <p class="v" style="margin:.2rem 0">${esc(p.what || '')}</p>
          ${p.fix ? `<p class="faint" style="margin:0 0 .4rem">${esc(p.fix)}</p>` : ''}
        </div>`).join('')}
      </div>`).join('')
        + `<p class="faint" style="text-align:center">backend ${esc((d && d.version) || '—')}</p>`;
    })
    .catch(err => {
      const body = $('sheet-body');
      if (body) body.innerHTML = `<p class="empty">Could not run the check.<br>
        <span class="faint">${esc(String(err && err.message || err))}</span></p>`;
    });
});
on('do-signin', () => {
  const name = ($('in-name') || {}).value || '';
  const pin = ($('in-pin') || {}).value || '';
  const said = $('in-said');
  if (!name || !pin) { if (said) said.textContent = 'Both, please.'; return; }
  if (said) said.textContent = 'Checking…';
  /* Through `send_`, so a phone with no signal says so rather than doing nothing at all. Signing
     in was one of the five round trips with no failure path: the button simply did not respond. */
  send_({ action: 'verifyLogin', name, pin }, { where: 'in-said' })
    .then(d => {
      if (!d.success) { if (said) said.textContent = d.error || 'That did not work.'; return; }
      /* THE REPLY, PLUS WHAT WE ALREADY KNEW. This was `USER = d` — the reply wholesale — so any
         field the backend did not send simply did not exist on the person afterwards. Not
         hypothetical: `todo` was missing from this reply for weeks and every docket vanished at
         sign-in because of it.
         The name matters most, because it is what every request identifies the person by. A reply
         without one signs somebody in as nobody, and the failure that follows is a booking refused
         for not being signed in, to somebody who plainly is. */
      USER = Object.assign({ name: name }, d);
      if (!USER.name) USER.name = name;
      try { localStorage.setItem('familyUser', JSON.stringify(d)); } catch {}
      toast('Signed in');
      load();
    })
    .catch(() => { if (said) said.textContent = 'Could not reach the server.'; });
});

on('signout', () => {
  USER = null;
  try { localStorage.removeItem('familyUser'); } catch {}
  toast('Signed out');
  repaint();
});

/* ---------- THE WARDROBE -------------------------------------------------------------------------
   Every slot, every item, with the locked ones showing what they would take. A catalogue you can
   SEE is what makes levelling up mean anything — a list of only what you already own tells you
   nothing about what is next, which is the whole reason to have a level at all.

   The colours are free and come first, because they are what most people change and because
   nobody should have to earn the right to have brown hair. */
on('wardrobe', () => {
  if (!USER) { toast('Sign in first'); return; }
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  const items = wardrobe();
  const level = levelFromXp(USER.xp);

  const swatches = (field, colours) => `<div class="av-swatches">
    ${colours.map((col, i) => `<span class="av-sw${cfg[field] === i ? ' on' : ''}"
      style="background:${col}" data-do="av-colour" data-field="${field}" data-value="${i}"
      title="${esc(col)}"></span>`).join('')}
  </div>`;

  const slotRow = ([slot, label]) => {
    const mine = items.filter(x => x.slot === slot);
    if (!mine.length) return '';
    return `<div class="av-slot">
      <div class="av-slot-name">${esc(label)}</div>
      <div class="av-opts">${mine.map(it => {
        const on = cfg[slot] === it.id;
        /* WHY it is not yours, on the item itself. "Locked" is a state; "Level 8" is a thing you
           can count towards, and the difference is whether the wardrobe is a shop window or a
           list of doors. */
        const why = it.unlocked ? '' : (it.cost ? it.cost + ' cr' : 'Lv ' + it.level);
        return `<button class="av-opt${on ? ' on' : ''}${it.unlocked ? '' : ' locked'}"
          data-do="av-pick" data-slot="${esc(slot)}" data-id="${esc(it.id)}"
          title="${esc(it.name + (why ? ' — ' + why : ''))}">
          ${itemArt(slot, it.id, 34) || '<span class="av-none">—</span>'}
          <span class="av-name">${esc(it.name)}</span>
          ${why ? `<span class="av-why">${esc(why)}</span>` : ''}
        </button>`;
      }).join('')}</div>
    </div>`;
  };

  openSheet('Your figure', `
    <div class="av-wrap av-big" id="av-figure">${avatarFor(USER.handle || USER.name, 120, USER.avatar)}</div>
    ${row('Level', level)}
    ${row('Credits', USER.credits || 0, 'mono gold')}

    <h2>Colours</h2>
    <p class="faint" style="margin:0 0 .4rem">Free, all of them. Nobody earns their own hair.</p>
    <div class="av-slot"><div class="av-slot-name">Skin</div>${swatches('skin', AV_SKIN)}</div>
    <div class="av-slot"><div class="av-slot-name">Hair</div>${swatches('hairColour', AV_HAIR)}</div>
    <div class="av-slot"><div class="av-slot-name">Shirt</div>${swatches('shirt', AV_SHIRT)}</div>

    <h2>Things</h2>
    ${AV_SLOTS.map(slotRow).join('')}
    <p class="faint" id="av-said"></p>`);
});

/* A colour and an item go through the SAME request, because to the server they are the same
   thing: a whole look, re-checked piece by piece. Nothing here decides what anybody may wear. */
function avatarSave(change) {
  const cfg = avatarConfig(USER.avatar, USER.handle || USER.name);
  Object.assign(cfg, change);
  const said = $('av-said');
  if (said) said.textContent = 'Saving…';

  /* The figure redraws IMMEDIATELY, before the server answers — picking a colour and waiting a
     second to see it is the difference between a wardrobe and a form. Put back if refused. */
  const before = USER.avatar;
  USER.avatar = Object.keys(cfg).map(k => k + ':' + cfg[k]).join('|');
  const fig = $('av-figure');
  if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);

  api({ action: 'saveAvatar',
    name: USER.name, personId: USER.personId, avatar: cfg })
    .then(d => {
      if (!d || d.error) throw new Error((d && d.error) || 'Could not save that');
      USER.avatar = d.avatar;
      if (typeof d.credits === 'number') USER.credits = d.credits;
      if (d.owned) USER.avatarItems = d.owned;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      const el = $('av-said');
      if (el) el.textContent = (d.bought || []).length ? 'Bought ' + d.bought.join(', ') : 'Saved';
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
    })
    .catch(err => {
      USER.avatar = before;
      if (fig) fig.innerHTML = avatarFor(USER.handle || USER.name, 120, USER.avatar);
      const el = $('av-said');
      if (el) el.textContent = String(err.message || err);
    });
}

on('av-colour', el => avatarSave({ [el.dataset.field]: Number(el.dataset.value) }));
on('av-pick', el => avatarSave({ [el.dataset.slot]: el.dataset.id }));

on('register',    () => toast('Registration is the next thing to wire'));

/* ---------- FRIENDS ------------------------------------------------------------------------------
   A comma list of handles on the person's own row. Kept as one cell for the same reason the docket
   is: a friendship has no life of its own, nothing links to it, and a tab would mean a row id and
   a deletion policy for something that is a name in a list.
--------------------------------------------------------------------------------------------- */
const friendHandles = () =>
  String((USER && USER.friends) || '').split(',').map(x => x.trim()).filter(Boolean);

/* ADDING ONE. The LIST is on Find with everything else; this is only the asking — a short question
   with an end, which is what a sheet is for. It used to show the list here too, which made friends
   the one set of people on the site reachable from two places. */
function friendsSheet() {
  openSheet('Add a friend', `
    <label class="field"><span>their handle</span>
      <input id="fr-add" placeholder="e.g. LuccaD" autocomplete="off"></label>
    <button class="btn" data-do="friend-add">Add</button>
    <p class="faint" id="fr-said" style="margin:.6rem 0 0">
      Exactly as they have it. A search that guesses adds the wrong person, and the wrong person is
      harder to notice than nobody — they simply appear on a list you scroll past.</p>`);
}
on('friends', () => { if (!USER) { toast('Sign in first'); return; } friendsSheet(); });

on('friend-add', () => {
  const box = $('fr-add'), said = $('fr-said');
  const want = ((box && box.value) || '').trim();
  if (!want) { box && box.focus(); return; }
  /* EXACT, and it has to be. A search that guesses adds the wrong person, and the wrong person is
     harder to notice than nobody — they simply appear on a list somebody scrolls past. */
  const found = (DATA.students || []).find(s2 => norm(s2.handle) === norm(want));
  if (!found) { if (said) said.textContent = 'Nobody has the handle "' + want + '".'; return; }
  if (norm(found.handle) === norm(USER.handle)) {
    if (said) said.textContent = 'That is you.'; return;
  }
  const list = friendHandles();
  if (list.some(h => norm(h) === norm(found.handle))) {
    if (said) said.textContent = found.handle + ' is already on your list.'; return;
  }
  friendsSave(list.concat([found.handle]), said);
  closeSheet();
  toast('Added ' + found.handle);
});

on('friend-drop', el => friendsSave(
  friendHandles().filter(h => norm(h) !== norm(el.dataset.handle)), $('fr-said')));

/* Adding one from the Find browse page, where the list is. */
on('friend-add-open', () => friendsSheet());

/* Written on the phone first, then sent — and the sheet redrawn either way, so removing somebody
   is visible before the round trip and put back if it fails. */
function friendsSave(list, said) {
  const before = USER.friends;
  USER.friends = list.join(', ');
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
  /* The list lives on Find now, so that is what has to be redrawn — and the memo has to be told,
     or it serves the list from before the change. */
  FIND_MEMO.key = null;
  if (AT === 'stuff') paintStuff();
  api({ action: 'saveFriends', name: USER.name, personId: USER.personId, friends: USER.friends })
    .then(d => { if (d && d.error) throw new Error(d.error); })
    .catch(err => {
      USER.friends = before;
      FIND_MEMO.key = null;
      if (AT === 'stuff') paintStuff();
      const el = $('fr-said');
      if (el) el.textContent = String(err.message || 'Not saved — no connection.');
    });
}

/* ---------- MESSAGES -----------------------------------------------------------------------------
   Read-only for now on the sending side of a thread nobody has started: the backend has
   `sendMessage` and this can post to it, but there is no picker for WHO — that belongs with the
   roster, where the people you are talking to are already on screen.
--------------------------------------------------------------------------------------------- */
/* THE LIST, drawn into the widget's own space. The same markup the sheet used, so a message looks
   the same whichever way somebody reached it. */
/* WHERE MESSAGES COME FROM.
   `DATA.messages` — which both readers below used to take — is not a key the payload has ever
   held. Messages are a POST action (`messages`), because a conversation is private and the GET
   payload goes out whole to whoever asks for it. So the widget and the sheet both read undefined,
   fell to `|| []`, and said "Nothing yet." to everybody for ever — the exact shape of the
   `liveJobs` fault, and just as quiet.

   Held here between openings so re-opening the widget does not re-ask, and refreshed on every
   open so it is never more than one tap stale. */
let MESSAGES = null;

function loadMessages() {
  if (!USER) return Promise.resolve([]);
  return api({ action: 'messages', name: USER.name, personId: USER.personId })
    .then(d => (MESSAGES = (d && d.messages) || []))
    /* A failure leaves whatever was already there rather than emptying the list — an unreachable
       backend is not the same fact as an empty inbox, and showing the second for the first is how
       a network blip reads as everything having been deleted. */
    .catch(() => MESSAGES || []);
}

const emptyMessages_ = `<p class="empty">Nothing yet.<br><span class="faint">Messages about a
     session appear here.</span></p>`;

function fillMessages() {
  const host = $('msg-body');
  if (!host) return;
  if (!USER) { host.innerHTML = '<p class="empty">Sign in to see your messages.</p>'; return; }
  /* Something on screen while the request is out. A pane that is blank for a second and then
     fills is indistinguishable from a pane that is empty, which is the wrong first impression to
     give of the one screen whose whole job is to say whether anybody has written to you. */
  if (MESSAGES === null) host.innerHTML = '<p class="empty faint">Looking…</p>';
  loadMessages().then(ms => {
    const el = $('msg-body');
    if (!el) return;                                    // the widget was closed while we waited
    el.innerHTML = ms.length ? messagesHtml_(ms) : emptyMessages_;
  });
}

/* One renderer, used by the widget and by anything else that wants to show a thread. */
const messagesHtml_ = ms => ms.map(m =>
  `<div class="msg${m.mine ? ' mine' : ''}${!m.mine && !m.read ? ' unread' : ''}">
    <p class="msg-body-text">${mark(m.body)}</p>
    <p class="faint msg-when">${esc(m.mine ? 'you' : (m.fromName || 'them'))} · ${esc(m.at || '')}</p>
  </div>`).join('');

/* `on('messages')` was here — a second way to see the same thread, opened in a sheet. Messages
   are a WIDGET, reached from Tools, and that route calls `fillMessages` directly; nothing has ever
   carried `data-do="messages"`, so this copy has never opened. `messagesHtml_` above is the shared
   renderer and stays — the widget uses it. */


/* ---------- YOUR OWN DETAILS ---------------------------------------------------------------------
   Built from the backend's own field list, exactly as the resource editor is — `profileFields` IS
   the allow-list the server checks writes against, so a form built from it cannot offer a field
   the server will refuse or miss one it would accept.
--------------------------------------------------------------------------------------------- */
on('edit-me', () => {
  if (!USER) { toast('Sign in first'); return; }
  const role = roleOf(USER.role || '');
  const groups = (role === 'client' && DATA.clientFields && Object.keys(DATA.clientFields).length)
      ? DATA.clientFields
    : (role === 'student' && DATA.studentFields && Object.keys(DATA.studentFields).length)
      ? DATA.studentFields
    : (DATA.profileFields && Object.keys(DATA.profileFields).length)
      ? DATA.profileFields
    /* A backend too old to send it. The form still opens with what this file knows about — an
       admin who can edit nothing is worse than one who can edit a few things. */
    : { 'About you': ['first_name', 'last_name', 'photo'],
        'Where': ['borough', 'city'], 'Contact': ['email', 'phone'] };

  const p = USER.profile || {};
  const readonly = DATA.profileReadonly || [];

  openSheet('Your details',
    fieldsHtml(groups, {
      attr: 'data-me',
      value: f => p[f] ?? '',
      raw: p,
      readonly: readonly,
      /* The backend says which fields have a fixed set of answers. */
      options: f => (DATA.validations || {})[f],
    })
    + `<button class="btn" data-do="me-save">Save</button>
       <p class="faint" id="me-said" style="margin:.6rem 0 0"></p>

       ${/* THE PIN, at the bottom of your own details — which is what it is. It had a card of its
             own on the You screen opening a sheet of its own, to change one of the things this
             sheet already exists to change.
             SAVED SEPARATELY, and that is not an inconsistency: a PIN needs the current one to
             change it, and folding it into `Save` would mean every change of an address asking for
             a password. */''}
       <h2><span>Your PIN</span></h2>
       <label class="field"><span>current PIN</span>
         <input id="pin-now" type="password" inputmode="numeric" autocomplete="current-password"></label>
       <label class="field"><span>new PIN</span>
         <input id="pin-new" type="password" inputmode="numeric" autocomplete="new-password"></label>
       <label class="field"><span>and again</span>
         <input id="pin-again" type="password" inputmode="numeric" autocomplete="new-password"></label>
       <button class="btn quiet" data-do="pin-save">Change my PIN</button>
       <p class="faint" id="pin-said" style="margin:.6rem 0 0">4 to 8 numbers, and not 1234.</p>`);
});

/**
 * THE HOURS SOMEBODY IS FREE, as a week you tick.
 *
 * The same grid the booker uses — because it is the same question, asked of a tutor instead of a
 * client, and answering it in two different shapes would be two things to learn.
 *
 * Each box carries its own hidden checkbox, so `me-save` gathers it exactly like every other field
 * and nothing about saving had to change. The box is the label; the checkbox is what the form
 * reads.
 */
function availGrid_(codes, p, readonly) {
  const on = f => TRUEish_(p[f]);
  const ro = f => readonly.indexOf(f) !== -1;

  /* Grouped back into days, from the flat list the backend sends. The prefix IS the day and the
     digits ARE the hour, so nothing else has to be looked up. */
  const days = [['m', 'Mon'], ['tu', 'Tue'], ['w', 'Wed'], ['th', 'Thu'],
                ['f', 'Fri'], ['sa', 'Sat'], ['su', 'Sun']];
  const rows = days.map(([prefix, label]) => {
    const mine = codes.filter(c => c.replace(/\d+$/, '') === prefix)
                      .sort((a, b) => Number(a.slice(prefix.length)) - Number(b.slice(prefix.length)));
    if (!mine.length) return '';
    return `<div class="slot-row">
      <span class="slot-day">${esc(label)}</span>
      <div class="slot-hours">
        ${mine.map(c => `<label class="hr${on(c) ? ' on' : ''}${ro(c) ? ' shut' : ''}">
          <input type="checkbox" data-me="${esc(c)}" ${on(c) ? 'checked' : ''}
                 ${ro(c) ? 'disabled' : ''}>
          ${Number(c.slice(prefix.length))}
        </label>`).join('')}
      </div>
    </div>`;
  }).join('');

  return `<p class="faint" style="margin:.2rem 0 .4rem">Tap the hours you can teach.</p>
    <div class="slot-grid">${rows}</div>`;
}

/**
 * A ROUND TRIP THAT CANNOT FAIL SILENTLY.
 *
 * Twenty-one places send something to the backend, and five of them had no `.catch` — including
 * `verifyLogin` and `createJob`, which are signing in and asking for a session. With no connection
 * those produced an unhandled rejection and nothing on the screen: the button did nothing, twice,
 * and then somebody gave up.
 *
 * The three things every one of them wants are the same three: stop the button being pressed
 * again, say what went wrong where the person is looking, and let the button go afterwards.
 * `where` is whichever the form has — an element id for a form with a line for messages, and a
 * toast for anything without one.
 */
function send_(body, o) {
  o = o || {};
  const btn = o.button;
  const say = msg => {
    const el = o.where && $(o.where);
    if (el) el.textContent = msg; else toast(msg);
  };

  if (btn) { btn.disabled = true; if (o.busy) { btn.dataset.was = btn.textContent; btn.textContent = o.busy; } }
  if (o.saying) say(o.saying);

  const done = () => {
    if (!btn) return;
    btn.disabled = false;
    if (btn.dataset.was) { btn.textContent = btn.dataset.was; delete btn.dataset.was; }
  };

  return api(body)
    .then(d => {
      /* A REPLY CARRYING AN ERROR IS A FAILURE, and was being treated as success by anything that
         only checked whether the request went through. */
      if (!d || d.error) throw new Error((d && d.error) || 'That did not work.');
      done();
      return d;
    })
    .catch(err => {
      done();
      /* THE MESSAGE, NOT THE STACK. And a network failure has none worth reading — `Failed to
         fetch` tells somebody on a train nothing they can act on. */
      const msg = String(err && err.message || err);
      say(/fetch|network|load failed/i.test(msg)
        ? 'No connection — that has not been sent.'
        : msg);
      /* Rethrown so a caller can still react, and marked so a caller that does not care can tell
         a handled failure from a bug. */
      err.handled = true;
      throw err;
    });
}

/* ================================================================================================
   ONE FIELD RENDERER.

   There were two, and they had different powers. The profile editor could draw a SELECT from the
   backend's validations and could disable a field somebody is not allowed to change. The resource
   editor could offer a DATALIST of what other rows already say. Neither could do the other's job —
   so which editor you happened to be in decided what a field was capable of, and adding a third
   editor meant writing a third renderer and choosing which half of the features to reimplement.

   This is the union. Every editor gets selects, suggestions, checkboxes, read-only and the right
   keyboard, and a new editor gets all of it by passing a list of names.

   WHAT DECIDES A FIELD'S SHAPE is the field itself, not the form it is on:

     a fixed list of answers  → a select        (validations, from the backend)
     a list of what others say → a datalist      (suggestions, from the rows)
     a name that reads true/false → a checkbox
     anything else            → a text box, with the keyboard its name implies

   `attr` is which data-attribute the form reads on save — `data-me` for a profile, `data-ed` for a
   resource. That is the only thing the two editors genuinely differ by, so it is the only thing
   passed in.
================================================================================================ */

/* Names that hold a yes or a no. Matched rather than listed, because the sheet grows columns and a
   list has to be remembered — `dbs_checked` and `is_listed` are booleans by their names. */
const FIELD_IS_BOOL = /^(dbs|active|listed|is_|has_|allow|paid|trackable|stealable)/;

/* Names whose keyboard should be a number pad, and which kind. */
const FIELD_IS_DECIMAL = /rate|price|cost|hours|km|fraction/;
const FIELD_IS_NUMERIC = /pages|year|students|days|weeks|count|level_required/;

/**
 * ONE FIELD, drawn from what is known about it.
 *
 * @param name      the column
 * @param value     what it holds now
 * @param o.attr    the data-attribute the save reads   (default `data-me`)
 * @param o.options a fixed list — draws a select
 * @param o.suggest what other rows say — draws a datalist
 * @param o.readonly whether it may be changed
 * @param o.label   an override for the label
 */
function fieldHtml(name, value, o) {
  o = o || {};
  const attr = o.attr || 'data-me';
  const label = o.label || fieldLabel(name);
  const ro = !!o.readonly;
  const v = value ?? '';

  if (FIELD_IS_BOOL.test(name)) {
    return `<label class="check">
      <input type="checkbox" ${attr}="${esc(name)}" ${TRUEish_(v) ? 'checked' : ''}
             ${ro ? 'disabled' : ''}>
      <span class="box"></span><span>${esc(label)}</span></label>`;
  }

  /* A FIXED LIST IS A SELECT. Somebody choosing an exam board should not be able to invent one —
     that is how a sheet ends up with four spellings of Edexcel. */
  const opts = o.options || [];
  if (opts.length) {
    return `<label class="field"><span>${esc(label)}</span>
      <select ${attr}="${esc(name)}" ${ro ? 'disabled' : ''}>
        <option value="">${NONE_LABEL}</option>
        ${opts.map(x => `<option value="${esc(x)}"${
          String(v) === String(x) ? ' selected' : ''}>${esc(x)}</option>`).join('')}
      </select></label>`;
  }

  /* WHAT OTHERS SAY IS A SUGGESTION, not a rule — a datalist offers them and still lets somebody
     type a new one, which is right where the list is descriptive rather than decided. */
  const seen = (o.suggest || []).filter(Boolean);
  const listId = seen.length > 1 ? 'fl-' + attr.replace(/\W/g, '') + '-' + name : '';
  const pad = FIELD_IS_DECIMAL.test(name) ? 'decimal'
            : FIELD_IS_NUMERIC.test(name) ? 'numeric' : '';

  return `<label class="field"><span>${esc(label)}</span>
    <input ${attr}="${esc(name)}" value="${esc(String(v))}" ${ro ? 'disabled' : ''}
           ${listId ? `list="${listId}"` : ''} ${pad ? `inputmode="${pad}"` : ''}>
    ${listId ? `<datalist id="${listId}">${
      seen.map(x => `<option value="${esc(x)}">`).join('')}</datalist>` : ''}</label>`;
}

/**
 * A WHOLE FORM, from a group table.
 *
 * The backend sends `{ 'About you': ['first_name', …], … }` for every editable thing, and every
 * editor walked it the same way with its own field renderer at the bottom. One walk now, so a group
 * of hour codes becomes a timetable everywhere rather than only where somebody remembered.
 */
function fieldsHtml(groups, o) {
  o = o || {};
  const value = o.value || (() => '');
  return Object.keys(groups).map(g => {
    const list = groups[g] || [];
    /* A GROUP OF HOUR CODES IS A TIMETABLE. Recognised by the shape of the names rather than by the
       group's title, so renaming it in the backend does not turn it back into a column of boxes. */
    const timetable = list.length > 12
      && list.every(f => /^(m|tu|w|th|f|sa|su)\d\d$/.test(f));
    const body = timetable
      ? availGrid_(list, o.raw || {}, o.readonly || [])
      : list.map(f => fieldHtml(f, value(f), {
          attr: o.attr,
          options: o.options ? o.options(f) : null,
          suggest: o.suggest ? o.suggest(f) : null,
          readonly: (o.readonly || []).indexOf(f) !== -1,
        })).join('');
    return `<h2><span>${esc(g)}</span></h2>` + body;
  }).join('');
}

/* The sheet writes TRUE/FALSE as text and the payload sends real booleans; rows written by older
   versions send neither consistently. One reader for all three. */
const TRUEish_ = v => v === true || /^(true|yes|1|✓)$/i.test(String(v ?? '').trim());

on('me-save', el => {
  const said = $('me-said');
  const fields = {};
  document.querySelectorAll('#sheet-body [data-me]').forEach(box => {
    if (box.disabled) return;
    fields[box.dataset.me] = box.type === 'checkbox' ? (box.checked ? 'TRUE' : 'FALSE')
                                                     : String(box.value || '').trim();
  });
  el.disabled = true;
  if (said) said.textContent = 'Saving…';

  api({ action: 'updateProfile', name: USER.name,
    target: USER.name, targetId: USER.personId || '', fields })
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      /* Kept on the phone as well, so the You screen shows the new values before the next load. */
      USER.profile = Object.assign({}, USER.profile || {}, fields);
      if (d && d.name) USER.name = d.name;
      try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch {}
      closeSheet(); toast('Saved'); load();
    })
    .catch(err => {
      el.disabled = false;
      if (said) said.textContent = String(err.message || 'Could not save that');
    });
});
/* `change-pin` opened a sheet of its own. It is three fields at the bottom of `edit-me` now — the
   sheet that already exists for changing your details, which a PIN is one of. */
on('pin-save', () => {
  const v = id => ($(id) || {}).value || '';
  const said = $('pin-said');
  /* Typed twice, checked here before the server sees it — a PIN you cannot see and typed once is
     a PIN you get locked out by. */
  if (v('pin-new') !== v('pin-again')) { if (said) said.textContent = 'The two new PINs do not match.'; return; }
  api({ action: 'changePin', name: USER.name,
    currentPin: v('pin-now'), newPin: v('pin-new') })
    .then(d => {
      if (d && d.error) { if (said) said.textContent = d.error; return; }
      toast('PIN changed'); closeSheet();
    })
    .catch(() => { if (said) said.textContent = 'Could not reach the server.'; });
});

on('my-referral', () => {
  send_({ action: 'myReferral', name: USER.name })
    .then(d => {
      const link = location.origin + location.pathname + '?ref=' + encodeURIComponent(d.code);
      openSheet('Tell someone', `
        <p class="note" style="margin-top:0">Send this to a family it would suit. We will know it
          came from you.</p>
        ${row('Your code', d.code)}
        <input class="mono" readonly value="${esc(link)}" style="margin:.6rem 0">
        <button class="btn" data-do="ref-send" data-link="${esc(link)}">Send it</button>
        <div class="row" style="margin-top:.8rem"><span class="k">Joined through you</span>
          <span class="v mono">${(d.sent || []).length}</span></div>
        ${(d.sent || []).length
          ? (d.sent || []).map(x => `${row('·', x.name)}`).join('')
          : '<p class="faint">Nobody yet. It only takes one.</p>'}`);
    })
    .catch(() => toast('Could not reach the server.'));
});

on('ref-send', el => {
  const link = el.dataset.link;
  if (navigator.share) { navigator.share({ title: '@family.', url: link }).catch(() => {}); return; }
  navigator.clipboard?.writeText(link).then(() => toast('Link copied')).catch(() => toast(link));
});

/* `LOADED` and `LOAD_FAILED` were declared here and are now in data.js, with the rest of the state.

   THEY WERE IN THE WRONG FILE. Both are read by posts.js and written by shell.js, and neither has
   anything to do with the You screen — they lived here because the skeleton below happened to be
   the first thing that wanted them. That worked only because me.js is loaded before posts.js, which
   is a fact about a list in index.html rather than anything either file states.

   The moment that order changed, or me.js failed to arrive, `posts.js` threw `LOADED is not
   defined` while drawing the first screen — and the app stopped with a message naming a variable
   rather than the file that was missing.

   Shared state goes in data.js. That file loads fourth, before everything that reads it, and it is
   the one place somebody looks for "where does this value live". */

/**
 * A SHAPE OF THE THING THAT IS COMING, not a spinner.
 *
 * A spinner says "wait". This says "a face, a photograph and two lines are about to be here" — so
 * nothing jumps when they arrive, and the wait reads as loading rather than as nothing happening.
 *
 * IT HAS TO MATCH. It used to draw two stacked articles because the feed was a column; the feed is
 * one post per screen now, so it draws ONE, inside the same pager, with the picture taking the
 * same room the real one will. A skeleton in the wrong shape is worse than no skeleton at all —
 * the page still jumps, and it jumps at the exact moment somebody has started reading it.
 *
 * The bars are staggered a little. In lockstep they pulse as one block, which reads as a single
 * animated rectangle; slightly apart they read as separate things arriving.
 */
function skeleton() {
  const bar = (w, h, delay, extra) =>
    `<span class="sk-box" style="width:${w};height:${h};animation-delay:${delay}s${
      extra ? ';' + extra : ''}"></span>`;
  return pages('posts', [`
    <article class="post sk">
      <header class="post-by">
        ${bar('1.9rem', '1.9rem', 0, 'border-radius:50%;flex:none')}
        ${bar('6rem', '.7rem', .08)}
      </header>
      <span class="sk-box sk-pic" style="animation-delay:.16s"></span>
      <div class="post-acts">${bar('9rem', '2.3rem', .24)}</div>
      ${bar('80%', '.7rem', .32, 'margin-top:.5rem')}
      ${bar('45%', '.7rem', .4, 'margin-top:.35rem')}
    </article>`]);
}