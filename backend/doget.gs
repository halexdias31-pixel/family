/* @family. — 60_doGet.gs (7 of 8) THE PAYLOAD. § */

/* ---------- THIS FILE'S OWN STAMP § */
const DOGET_VERSION = "2026-11-08-booking-tiles-1";


function doGet(e) {
  try {
    WRITE_MISSES = [];
    /* NOBODY YET — the last request's viewer is not this one's (`NET_VIEWER_`, constants.gs; 342). */
    NET_VIEWER_ = null;
    /* Read once, at the top, so every exit from this function is wrapped the same way — including the early returns and the error at the bottom. § */
    JSONP_CB = String(((e && e.parameter) || {}).callback || '');
    const t0 = Date.now(), timings = {};
    const mark = n => { timings[n] = Date.now() - t0; };
    const p = (e && e.parameter) || {};

    /* WHO IS LOOKING, AND IT IS THE SESSION TOKEN THAT SAYS SO THIS FUNCTION DECIDED WHO YOU ARE FROM `?name=`. § */
    let ASKED_BY = undefined;
    const askedBy_ = function () {
      if (ASKED_BY === undefined) ASKED_BY = authWhoIs_(p.token);
      return ASKED_BY;
    };

    /* ---------- THE SHEET CATCHES UP, BUT NEVER WHILE SOMEBODY IS WAITING § */
    const behind = (function () {
      try {
        return PropertiesService.getScriptProperties()
          .getProperty('SCHEMA_VERSION') !== BACKEND_VERSION;
      } catch (err) { return false; }
    })();
    /* A maintenance URL still brings it up to date first — a job that needs a column needs the
       column to exist, and nobody is watching a spinner on one of those. */
    const migrated = (p.run || p.setup) ? autoMigrate_() : null;
    /* AND ON AN ADMIN'S PAGE LOAD (361), so "open the site once" after a deploy is the whole of setup; a visitor never waits on it. */
    if (!p.run && !p.setup && p.token) {
      try { const a = askedBy_(); if (a && hasRole(a, 'admin')) setupOnAdminLoad_(); } catch (err) {}
    }

    /* ---------- AND THE SHEET SAYS SO ITSELF, ONCE § */
    if (behind && !p.run && !p.setup) {
      try {
        const gaps = schemaGaps();
        if (!Object.keys(gaps).length) {
          PropertiesService.getScriptProperties()
            .setProperty('SCHEMA_VERSION', BACKEND_VERSION);
        }
      } catch (err) { /* it stays behind and says so, which is the safe way round */ }
    }

    /* A maintenance job, before anything else — none of these want a payload built first, and
       `checkEverything` in particular is for the case where building one fails. */
    if (p.run) return getRun_(p, migrated);

    /* ?setup=1 brings the sheets' tabs and columns up to date in place, so a schema change never means re-uploading a file and repointing the ids in FILES. § */
    if (p.setup) return jsonOut({ version: BACKEND_VERSION, schema: ensureSchema_(),
      alsoAvailable: 'add ?run=<job>&name=…&pin=… for the rest: ' + Object.keys(RUNNABLE).join(', ') });

    /* `?pages=1` AND `?pages=all` WERE HERE. § */

    /* SOMEBODY'S OWN RECEIPTS. Their own only — a receipt names what a family paid, and the list of
       them is the shape of a household's year. */
    if (p.receipts) return getReceipts_(p, askedBy_);

    /* THE RACER'S MAP (426), on its own and never in the payload: half a megabyte nobody else needs. */
    if (p.race) return raceServe_();

    // ?triggers=1 installs the nightly jobs; ?triggers=list shows what's scheduled.
    if (p.triggers) return jsonOut({ version: BACKEND_VERSION,
      triggers: String(p.triggers).toLowerCase() === 'list' ? listTriggers() : installTriggers_() });

    // Confirm the tabs exist before building anything. Pointing at the wrong spreadsheet is the
    // single likeliest setup mistake, and read() returning empty rows makes it look like eleven
    // separate features broke rather than one line being wrong.
    /* Only the tabs the site genuinely can't run without. § */
    /* `resources` IS NO LONGER ON THIS LIST, because the tab is no longer in the spreadsheet. § */
    /* ---------- THE ANSWER FROM LAST TIME, IF THERE IS ONE § */
    /* THE TOKEN'S PERSON, NOT THE URL'S — see `payloadKey_`. Resolving it here costs one digest and
       one property read, before the cache is asked, which is the only order in which the answer can
       decide which copy comes back. */
    const cacheViewer = askedBy_();
    const cacheKey = payloadKey_(p, cacheViewer ? S(cacheViewer.person_id) : '');
    /* THE NET IS TOLD HERE TOO (342), because a hit returns from just below with a fresh half
       (`freshFor_`) the net has to say for this same person. */
    netViewerSet_(cacheViewer);
    /* ---------- `?warm=1` BUILDS AND STORES WITHOUT READING § */
    const warming = S(p.warm) === '1';
    if (cacheKey && !warming) {
      const kept = cacheGet_(cacheKey);
      /* ---------- A HIT SAYS SO § */
      /* AND THIS VIEWER'S SUBMISSIONS AND FILMS, FRESH — the stored body has neither (`payloadWithFresh_`). */
      if (kept) { mark('cache'); return jsonRaw_(payloadWithFresh_(kept, freshFor_(cacheViewer), true)); }
    }

    /* ---------- THE TABS WHOSE ABSENCE MEANS THE DATABASE IS NOT CONNECTED § */
    const REQUIRED_TABS = {
      people:  'nobody can sign in, and every person-keyed screen is empty for everybody',
      config:  'the switches and numbers the whole app reads through DATA.constants.vars',
      pricing: 'quotePerHour has nothing to quote from, so a booking is priced at nought',
      venues:  'the booking form has nowhere to offer, so nothing can be booked',
      jobs:    "a family's sessions come back as none, which reads as them being cancelled",
      events:  'the calendar is empty, which is not distinguishable from nothing being on',
      shop:    'every price and every wearable is gone, and the coins buy nothing',
      options: 'every dropdown on every admin form comes back blank'
    };
    const missingTabs = Object.keys(REQUIRED_TABS).filter(name => !read(name).sheet);
    if (missingTabs.length) return getMissingTabs_(REQUIRED_TABS, missingTabs);

    /* WHO IS LOOKING, asked ONCE. § */
    /* AND ASKED OF THE TOKEN rather than of `?name=`. § */
    const meAsked = askedBy_();
    const meAskedName = meAsked ? personDisplayName(meAsked) : '';
    /* `?person=` IS NO LONGER READ FOR IDENTITY ANYWHERE IN THIS FUNCTION. § */
    const meAskedId = meAsked ? S(meAsked.person_id) : '';
    const viewerIsAdmin = !!meAsked && hasRole(meAsked, 'admin');
    /* AND THE NET IS TOLD (342): § */
    netViewerSet_(meAsked);
    /* WHO THEY MAY SEE (386, `seesWhom_`): null for nobody, a tutor or an admin; else the ids a child or parent is shown. */
    const vis = seesWhom_(meAsked);

    const cfg = config(), opts = allOptions(), sur = surcharges();
    mark('config');

    /* ---------- THE FILMS, READ ONLY IF THE PERSON LOOKING MAY SEE THEM § */
    const filmsOut = filmsFor_(meAsked);
    /* `drive_id` IS DELIBERATELY NOT SENT. § */

    const people = read(TAB.people).rows;
    const venuesTab = read(TAB.venues).rows;
    const jobsTab = read(TAB.jobs).rows;
    mark('records');

    const payload = getPayloadInit_(behind, migrated, meAsked, cfg, opts, sur, filmsOut, venuesTab);
    mark('payloadInit');

    getPeople_(meAsked, viewerIsAdmin, vis, people, venuesTab, payload);

    getFamilyVenues_(p, meAsked, viewerIsAdmin, venuesTab, payload);

    getPosts_(meAsked, meAskedId, viewerIsAdmin, vis, opts, payload);

    getCalendar_(meAskedId, viewerIsAdmin, vis, payload);

    getViewerBits_(meAsked, viewerIsAdmin, payload);

    getTerms_(payload);

    getShop_(payload);

    getQuestions_(payload);
    mark('lists');

    getJobs_(meAskedName, viewerIsAdmin, vis, cfg, venuesTab, jobsTab, payload);
    mark('jobs');

    if (p.debugTiming) return jsonOut({ version: BACKEND_VERSION, timings,
      counts: { people: people.length, venues: venuesTab.length, jobs: jobsTab.length,
                options: read(TAB.options).rows.length } });

    /* `payload.timings` WAS HERE on every load, read by nothing; `?debugTiming=1` above is how the timings are asked for (433). */
    /* ---------- KEPT, AND THEN SENT § */
    /* ---------- WITHOUT `submissions` OR THE FILMS, WHICH GO ON FRESH EVERY TIME § */
    /* BY NAME IN A LIST, not `payload.films` here: `check-payload.js` counts every `payload.<key>` as a
       key sent, and a line that takes a key OUT would answer for one that was never put in. */
    if (cacheKey) {
      /* THROUGH THE NET BEFORE IT IS KEPT, because the kept body goes out by `jsonRaw_` and never meets
         `jsonOut` (`kidNamesOff_`, people.gs — no child's surname leaves). The fresh half meets it in
         `freshFor_`. */
      try { kidNamesOff_(payload); } catch (err) {}
      /* AND NO PRICE TO A CHILD (398) — kept per viewer, so a child's kept body is a child's. */
      try { kidPricesOff_(payload); } catch (err) {}
      const fresh = {};
      ['submissions', 'films', 'favLinks', 'messages', 'filmsSync', 'setup', 'claudeNotes'].forEach(k => { fresh[k] = payload[k]; delete payload[k]; });
      const body = JSON.stringify(payload);
      cachePut_(cacheKey, body);
      return jsonRaw_(payloadWithFresh_(body, fresh, false));
    }
    return jsonOut(payload);
  } catch (err) {
    return jsonOut({ error: err.toString() });
  }
}
/* ---------- `payload.family`, BUILT FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY § */
function familyOf_(me) {
  const out = { familyFor: '', family: [] };
  if (!me || !S(me.person_id)) return out;
  const famCard_ = (r, rel) => ({
    personId: S(r.person_id), title: nameFor_(r, true), relation: rel,
    handle: S(r.handle), image: S(r.photo) || '',
    /* THE FIGURE, ONLY WHEN IT IS THE FACE (`faceFig_`). § */
    avatar: faceFig_(r).avatar,
  });
  /* Once each, and never yourself — a row linked to itself by a slip in the sheet would
     otherwise draw your own card a second time under "Your child". */
  const meId = S(me.person_id), seen = {};
  /* WHOSE FAMILY THIS IS, said in the payload. § */
  out.familyFor = meId;
  const addAll = (rows, rel) => rows.forEach(r => {
    const id = S(r.person_id);
    if (!id || id === meId || seen[rel + id]) return;
    seen[rel + id] = true;
    out.family.push(famCard_(r, rel));
  });
  /* AND ONLY WHOM THEY MAY SEE (386): a child is sent no parent, a parent no co-parent. */
  const vis = seesWhom_(me);
  const add = (rows, rel) => addAll(rows.filter(r => !vis || vis[S(r.person_id)]), rel);
  add(acceptedParents(meId), 'parent');
  add(acceptedChildren(meId), 'child');
  /* ---------- AND YOUR BROTHERS AND SISTERS § */
  add(siblingsOf(meId), 'sibling');
  return out;
}

/* ---------- `payload.favourites`, FOR ONE VIEWER — AND FOR THE SIGN-IN REPLY ------------------------------
   The bare item keys this person has starred, theirs only. A function for `familyOf_`'s reason. */
function favouritesOf_(me) {
  if (!me || !S(me.person_id)) return [];
  return read(TAB.favourites).rows
    .filter(r => key(r.person_id) === key(me.person_id))
    .map(r => S(r.item_id));
}

/* ---------- THE STORED BODY, WITH THIS VIEWER'S SUBMISSIONS (AND AN ADMIN'S FILMS) LAID ON § */
function submissionsNow_(viewer) {
  try { return submissionsFor_(viewer, !!viewer && hasRole(viewer, 'admin')); }
  catch (err) { return { for: '', mine: {} }; }
}
function freshFor_(viewer) {
  const admin = !!viewer && hasRole(viewer, 'admin');
  const out = { submissions: submissionsNow_(viewer), films: [] };
  /* EVERY VIEWER'S OWN FILMS, fresh each load: who may see one is Drive's sharing, not the kept body (450). */
  try { out.films = filmsFor_(viewer); } catch (err) { out.films = []; }
  /* AND THE VIEWER'S OWN FAVOURITE LINKS (509), fresh each load and never in the kept body, which is shared by a role. */
  try { out.favLinks = favLinksOf_(viewer); } catch (err) { out.favLinks = []; }
  try { out.messages = viewer ? messagesOf_(viewer) : []; } catch (err) { out.messages = []; }
  if (admin) {
    try { out.filmsSync = filmsSyncSays_(); } catch (err) { out.filmsSync = { at: '', more: false }; }
    try { out.setup = setupStatus_(); } catch (err) { out.setup = { error: String(err && err.message || err) }; }
    try { out.claudeNotes = claudeNotesOpen_(); } catch (err) { out.claudeNotes = []; }
  }
  /* THE NET, for the half laid on a kept body — which goes out through `jsonRaw_`, not `jsonOut`. */
  try { kidNamesOff_(out); } catch (err) {}
  return out;
}
function payloadWithFresh_(body, fresh, cached) {
  const f = fresh || {};
  return String(body).slice(0, -1)
    + ',"submissions":' + JSON.stringify(f.submissions || { for: '', mine: {} })
    + ',"films":' + JSON.stringify(Array.isArray(f.films) ? f.films : [])
    + ',"favLinks":' + JSON.stringify(Array.isArray(f.favLinks) ? f.favLinks : [])
    + ',"messages":' + JSON.stringify(Array.isArray(f.messages) ? f.messages : [])
    + (f.filmsSync ? ',"filmsSync":' + JSON.stringify(f.filmsSync) : '')
    + (f.setup ? ',"setup":' + JSON.stringify(f.setup) : '')
    + (f.claudeNotes ? ',"claudeNotes":' + JSON.stringify(f.claudeNotes) : '')
    + (cached ? ',"cached":true' : '') + '}';
}

/* `payload.media` (404): every row, a hidden one as its id alone — it is there to hide a repository item with that id. */
/* `cap` IS THE OLDEST RATING THE VIEWER MAY SEE (`mediaAgeCap_`, 406): a row rated above it goes as its veil alone. */
function mediaOut_(cap) {
  const out = [];
  const most = typeof cap === 'number' ? cap : MEDIA_AGE_UNKNOWN;
  try {
    read(TAB.media).rows.forEach(function (r) {
      const kind = S(r.kind), id = S(r.yt_id);
      if (MEDIA_KINDS.indexOf(kind) === -1 || !mediaIdOk_(id)) return;
      if (TRUE_(r.hidden)) { out.push({ kind: kind, id: id, hidden: true }); return; }
      const age = mediaAgeOf_(r.age);
      if (age > most) { out.push({ kind: kind, veil: mediaVeil_(kind, id), hidden: true }); return; }
      out.push({ kind: kind, id: id, url: S(r.url), title: S(r.title), channel: S(r.channel),
        thumb: S(r.thumb), subject: S(r.subject), tags: S(r.tags), vkind: S(r.vkind),
        age: age ? String(age) : '', notes: S(r.notes) });
    });
  } catch (err) {}
  return out;
}

/* ---------- `payload.films`: AN ADMIN ALL, EVERYBODY ELSE WHAT THE DRIVE FILE IS SHARED WITH THEM (450) ----------
   Only a share naming the viewer's own email counts; signed out, no email or Drive unreadable = nothing. */
function filmsFor_(viewer) {
  const out = [];
  if (!viewer || typeof viewer !== 'object') return out;
  const admin = hasRole(viewer, 'admin');
  const me = S(viewer.email).trim().toLowerCase();
  if (!admin && me.indexOf('@') < 1) return out;
  const rows = read(TAB.films).rows.filter(function (r) { return ON_(r.active); });
  const shares = filmShares_(rows.filter(function (r) { return !TRUE_(r.placeholder) && S(r.drive_id); }));
  rows.forEach(function (r) {
    const who = shares[S(r.drive_id)] || null;
    if (!admin && !(who && who.indexOf(me) !== -1)) return;
    const f = {
      id: S(r.film_id), title: S(r.title), year: S(r.year), kind: S(r.kind),
      audience: S(r.audience), director: S(r.director), lead: S(r.lead),
      seasons: S(r.seasons), url: S(r.drive_url), fileKind: S(r.file_kind),
      sizeGb: S(r.size_gb), placeholder: TRUE_(r.placeholder), notes: S(r.notes)
    };
    /* THE ADMIN'S CHECK: who Drive says may open it, one line. */
    if (admin) f.sharedWith = who ? who.join(', ') : TRUE_(r.placeholder) ? '' : 'unknown: Drive could not be read';
    out.push(f);
  });
  return out;
}

/* WHO EACH FILE OR FOLDER IS SHARED WITH, by person: { drive_id: [emails] }, an unreadable one left out.
   Kept FILMS_SHARE_TTL_S so a revoked share is gone within minutes; anyone-with-link is not a person. */
function filmShares_(rows) {
  const out = {};
  if (!rows.length) return out;
  let cache = null, kept = {};
  try { cache = CacheService.getScriptCache(); kept = cache.getAll(rows.map(function (r) { return FILMS_SHARE_PREFIX + S(r.drive_id); })) || {}; }
  catch (err) { cache = null; kept = {}; }
  const put = {};
  rows.forEach(function (r) {
    const id = S(r.drive_id), k = FILMS_SHARE_PREFIX + id;
    if (kept[k] != null) { try { const v = JSON.parse(kept[k]); if (v) out[id] = v; return; } catch (err) {} }
    try {
      const x = S(r.file_kind) === 'folder' ? DriveApp.getFolderById(id) : DriveApp.getFileById(id);
      if (!x) return;
      const seen = {};
      (x.getViewers() || []).concat(x.getEditors() || []).forEach(function (u) {
        const e = S(u && u.getEmail ? u.getEmail() : '').trim().toLowerCase();
        if (e.indexOf('@') > 0) seen[e] = true;
      });
      out[id] = Object.keys(seen).sort();
      put[k] = JSON.stringify(out[id]);
    } catch (err) { put[k] = 'null'; /* NOT READABLE IS NOT SHARED, and kept so: hidden from all but the admin. */ }
  });
  try { if (cache && Object.keys(put).length) cache.putAll(put, FILMS_SHARE_TTL_S); } catch (err) {}
  return out;
}

/* ---------- WHAT THE LAST SYNC FROM DRIVE SAYS, FOR THE ADMIN'S CARD § */
function filmsSyncSays_() {
  const st = filmsState_();
  return { at: S(st.at), more: !!S(st.pass), folder: S(st.folder), found: st.found || null };
}

/* ---------- `payload.submissions`, BUILT FOR ONE VIEWER § */
function submissionsStamp_(who) {
  try { return PropertiesService.getScriptProperties().getProperty('SUBS_AT:' + S(who)) || '0'; }
  catch (err) { return '0'; }
}
function submissionsCacheKey_(who) {
  return 'subs|' + payloadGen_() + '|' + BACKEND_VERSION + '|' + S(who) + '|' + submissionsStamp_(who);
}
/* AFTER A PRESS IS ON THE SHEET: that person's copy and the admin's summary are both stale. */
function submissionsTouched_(pid) {
  try {
    const props = PropertiesService.getScriptProperties();
    const now = String(Date.now());
    props.setProperty('SUBS_AT:' + S(pid), now);
    props.setProperty('SUBS_AT:*people', now);
  } catch (err) {}
}
/* ONE READ OF THE TAB, SHAPED BOTH WAYS — this person's latest per key, and everybody's summary. § */
function submissionsBuild_(pid, people) {
  const mine = {}, sum = {};
  readCols_(TAB.submissions, ['person_id', 'key', 'answer', 'verdict', 'submitted_at', 'event_id', 'pressed_at']).rows.forEach(r => {
    const who = S(r.person_id), k = S(r.key);
    if (!who || !k) return;
    const came = answerAtMs_(r.submitted_at);
    if (people) {
      const p = sum[who] || (sum[who] = { qs: {}, at: 0 });
      p.qs[k.split('#')[0]] = 1;
      /* A ROW CARRIED OVER FROM BEFORE THE SWITCH ARRIVED THE DAY THE BACKEND LANDED and was done weeks before: § */
      const when = SUBMISSION_CARRIED.test(S(r.event_id)) ? (answerAtMs_(r.pressed_at) || came) : came;
      if (when >= p.at) p.at = when;
    }
    if (key(who) !== key(pid)) return;
    const at = answerAtMs_(r.pressed_at) || came;
    const was = mine[k];
    if (was && was.at > at) return;
    mine[k] = { answer: S(r.answer), verdict: S(r.verdict), at: at, id: S(r.event_id) };
  });
  const out = { mine: mine };
  if (people) {
    out.people = {};
    Object.keys(sum).forEach(who => {
      out.people[who] = { n: Object.keys(sum[who].qs).length,
                          last: sum[who].at ? Utilities.formatDate(new Date(sum[who].at), DIGEST_TZ, 'yyyy-MM-dd') : '' };
    });
  }
  return out;
}
function submissionsFor_(me, isAdmin) {
  const out = { for: '', mine: {} };
  if (!me || !S(me.person_id)) return out;
  const pid = S(me.person_id);
  out.for = pid;
  /* THE KEYS ONCE, BEFORE THE TAB IS READ — the stamp read after the read could be a press newer than what was read, and the copy would be filed under it. § */
  const keyMine = submissionsCacheKey_(pid), keyPeople = isAdmin ? submissionsCacheKey_('*people') : '';
  const kept = k => { try { const t = cacheGet_(k); return t ? JSON.parse(t) : null; } catch (err) { return null; } };
  let mine = kept(keyMine), people = isAdmin ? kept(keyPeople) : null;
  if (!mine || (isAdmin && !people)) {
    const built = submissionsBuild_(pid, isAdmin);
    mine = built.mine;
    try { cachePut_(keyMine, JSON.stringify(mine)); } catch (err) {}
    if (isAdmin) {
      people = built.people;
      try { cachePut_(keyPeople, JSON.stringify(people)); } catch (err) {}
    }
  }
  out.mine = mine || {};
  if (isAdmin) out.people = people || {};
  return out;
}
