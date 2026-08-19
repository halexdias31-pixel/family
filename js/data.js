/* ==================================================================================================
   @family. — data.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   data.js is number 4 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ================================================================================================
   @family. — the shell.

   Not the whole app: the RUNTIME the screens are built on. Tabs, screen switching, the sheet, the
   toast, and the one place a screen is registered.

   The point of doing this first is that every screen after it is small. A screen becomes a
   function that returns markup and says what its header should read — it never touches the tab
   bar, never hides another screen, and never has an opinion about the sheet.
================================================================================================ */

/* ---------- WHERE THE DATA COMES FROM -----------------------------------------------------------
   THE ONE LINE THAT DECIDES WHETHER ANY OF THIS WORKS, and the one that went wrong for a week.

   Apps Script has two ways to publish. "Manage deployments → pencil → New version" updates the
   deployment already here. "New deployment" makes a SECOND one with a DIFFERENT id — and then
   every version you push lands on a URL nothing is calling, while this line goes on asking the
   old one. From the outside that is indistinguishable from the code not working: the editor says
   deployed, the sheet is right, and the site answers as it did yesterday.

   IT MUST BE THE ONE UNDER "ACTIVE" IN MANAGE DEPLOYMENTS. There is exactly one, and everything
   else in that list is Archived — an archived deployment is not served at all, so a URL pointing
   at one fails before it reaches any code. That is what "Failed to fetch" was: not a wrong
   character, not an access setting, a dead address.

   The two mistakes that produced it, so neither is repeated:
     · "New deployment" makes a SECOND URL rather than updating this one. Every version pushed
       that way lands somewhere the site is not calling. Use the PENCIL on the Active row and
       choose Version: New version.
     · An id that used to work is not evidence it still exists. The Active list is the evidence.

   To change it: Manage deployments → Active → the Copy button under the Web app URL. COPY IT,
   NEVER TYPE IT, and never read it off a screen. Seventy-two characters, and the one that went
   wrong here was position 22: a lowercase L read as a capital I. In this font they are the same
   vertical stroke, the URL is valid, the request goes out, and what comes back is "Failed to
   fetch" — which is also what a dead deployment and a private one look like. Three faults, one
   symptom, and no way to tell them apart from inside the app.
--------------------------------------------------------------------------------------------- */
const API = 'https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec';

/* WHICH VERSION OF THE SITE THIS IS.
   The backend has had one since the beginning and the site has not, which is why "the backend is
   older than the site" could be diagnosed in ten seconds and "the site is older than the site"
   could not. GitHub Pages takes a minute to publish and a browser caches script.js for far longer,
   so a fix can be committed, pushed and live while the phone in your hand is still running last
   week's. Nothing said so, and there was no way to ask.

   Bumped whenever this file changes. Shown on the You screen and in every failure banner. */
/* THIS SAID `2026-08-08-wiring` FOR A WEEK OF CHANGES. `index.html` has a `LOAD` string that I have
   been bumping all along, and it is a cache-buster, not a version — so the You screen went on
   reporting a build from six days ago while everything under it changed. Which makes the one place
   you look to answer "is my frontend current" answer it wrongly, and that is worse than not
   showing it at all: twice today we chased a fault that was a file not yet pasted in. */
const SITE_VERSION = '2026-08-19a';

/**
 * WHICH STYLESHEET IS RUNNING.
 *
 * Read from a custom property `style.css` sets on :root. Without it the site could report its own
 * script version and its backend version and say nothing at all about its CSS — so a rule that had
 * been changed and a rule that had not arrived looked identical, and the only way to tell was to
 * ask somebody to hard refresh and try again.
 *
 * An empty answer means the stylesheet predates this, which is itself the answer.
 */
function cssVersion() {
  try {
    const v = getComputedStyle(document.documentElement)
      .getPropertyValue('--css-version').trim().replace(/^["']|["']$/g, '');
    return v || '(older than versioning)';
  } catch { return '(unknown)'; }
}

let DATA = {};

/* ---------- ASKING BY SCRIPT TAG, FOR A PAGE THAT HAS NO ORIGIN ------------------------------------
   A PAGE OPENED FROM A FILE CANNOT FETCH. Double-click index.html and the browser gives it the
   origin `null`, and any request to another address is refused before a single byte leaves —
   instantly, with "Failed to fetch" and no network involved at all. Nothing at the far end is asked,
   so nothing at the far end can be wrong, and every symptom looks like a dead backend.

   A <script> TAG IS NOT SUBJECT TO THAT. It has been allowed to load from anywhere since the web
   began, which is what this is: the same reply, wrapped in a call to the function named here,
   delivered as a script rather than as data. Ancient, and the one thing that works from a file.

   THE NAME IS UNIQUE PER CALL, so two requests in flight cannot land in one another's handler, and
   it is removed the moment it fires — a global left behind is a global something else will find.

   WHAT IT CANNOT DO: a script tag is a GET. Every action — booking, saving, posting — is a POST, and
   no trick makes a POST leave a file:// page. So this restores READING from a file, and writing
   still needs the page served. Worth knowing before somebody tries to book something. */
function jsonp(url) {
  return new Promise((ok, no) => {
    const name = '__fam' + Date.now() + Math.floor(Math.random() * 1000);
    const tag = document.createElement('script');
    const done = () => { delete window[name]; tag.remove(); };
    window[name] = d => { done(); ok({ __jsonp: d }); };
    /* A script that 404s fires `onerror`, which is the one thing this route can report: it cannot
       see a status code, so "the address did not load" is all there is to say. */
    tag.onerror = () => { done(); no(new Error('the backend did not load as a script')); };
    tag.src = url + (url.indexOf('?') === -1 ? '?' : '&') + 'callback=' + name;
    document.head.appendChild(tag);
  });
}

/* THE KEYS THE SITE ASKS FOR AND THE BACKEND DOES NOT SEND.
   Filled by the wrapper around DATA in `load`. Every silent fault this app has had has been one of
   these: a name written on one side and read on the other, with nothing in between able to tell.
   Tap through every screen once and then type `missingKeys()` into the console — it lists all of
   them at once, and there is no test to write and no list to keep in step. */
let MISSING_KEYS = {};
function missingKeys() {
  const ks = Object.keys(MISSING_KEYS);
  if (!ks.length) { console.log('Nothing has been asked for that the backend did not send.'); return {}; }
  console.table(MISSING_KEYS);
  return MISSING_KEYS;
}
let USER = null;

/* HAS THE FIRST LOAD COME BACK? Separate from "are there any posts" — a skeleton and an empty state
   answer different questions, and showing the wrong one makes the app look broken in the first
   second anybody sees it.
   HERE, WITH THE REST OF THE STATE, and not in me.js where it used to be: posts.js reads it and
   shell.js writes it, and neither has anything to do with the You screen. It worked only because
   me.js happens to be listed before posts.js in index.html — a fact about a list, not about either
   file — and the day that was not true, the app stopped on `LOADED is not defined`. */
let LOADED = false;

/* AND WHY there is nothing to show. `LOADED` says the attempt finished; this says whether it
   worked. Without it a failed fetch and an empty spreadsheet produce the same screen — and the
   words on that screen were "add a row to the posts tab", which is advice for a problem the person
   does not have and no mention of the one they do. */
let LOAD_FAILED = '';

/* WHETHER THE 30-SECOND WATCHDOG IN index.html HAS SPOKEN.
   It writes straight to the banner element, and until now nothing ever took that message down — so
   a load that was merely SLOW finished with "Still loading… Data: not yet" sitting above a screen
   full of posts. The app contradicting itself, in the one place somebody looks when they think it
   is broken, and it has sent us after the wrong thing more than once.
   Set there, read in `load`, so a payload that arrives late can clear that message AND ONLY THAT
   ONE. A banner written by anything else is a real warning and has to survive. */
let LOAD_SLOW = false;
try { USER = JSON.parse(localStorage.getItem('familyUser') || 'null'); } catch {}

/* ---------- THE SMALLEST HELPERS ---------------------------------------------------------------- */
const $ = id => document.getElementById(id);

/* The letter to put in a circle when there is no picture. The first LETTER, not the first
   character — punctuation is not an initial, and "@family." was giving "@", which sat next to the
   name and read as @@family. */
const initial = s => (String(s ?? '').match(/[A-Za-z0-9]/) || ['?'])[0].toUpperCase();

/* Anything from the branding tab, by name, with a fallback. Never throws on a key that has not
   been filled in — the whole point of that tab is that most of it is empty most of the time. */
const brand = (k, or) => ((DATA.brand || {})[k] || or || '');

/**
 * IS THIS SOMETHING YOU WEAR?
 *
 * The backend used to call it `avatar` — the sheet's own word — and now says `wearable`, which is
 * what it is to a person looking at one. Both are accepted, and that is not tidiness: these two
 * files travel separately and are pasted one per message, so for at least one deploy the payload
 * and the code that reads it will disagree about the word. Accepting either means the order they
 * arrive in does not matter, which is the same reason the screen describes its own layout rather
 * than trusting the stylesheet.
 *
 * Asked in one place, so the day the old word can be dropped is a one-line day.
 */
const isWearable = x => {
  const k = norm(x && (x.kind || x.kindRaw));
  return k === 'wearable' || k === 'avatar';
};

/* Whether the person signed in is an admin. Asked through roleOf, so it is true whichever of the
   four spellings the sheet happens to use — the old app had this and the new shell never did,
   which would have thrown the moment an admin opened a tutor, silently, inside a template. */
const isAdmin = () => !!USER && roleOf(USER.role || '') === 'admin';

/* ---------- THE LAWS ----------------------------------------------------------------------------
   How words are coloured, wherever they appear. Subjects green, #tags blue, @names softer blue,
   client names red — and the list lives in the database, so a new law is a row rather than a
   deploy.

   TWO THINGS MAKE THIS SAFE, and neither is optional:

   1. THE TEXT IS ESCAPED FIRST. Captions come from a spreadsheet anybody with an account can type
      into. Colour the words first and a caption reading `<img onerror=…>` is a script running on
      every phone that opens the app. Escape, then wrap — there is exactly one correct order.

   2. A MATCH IS NEVER FOUND INSIDE A SPAN ALREADY MADE. Each match is swapped for a placeholder
      that later laws cannot see, and the placeholders are put back at the end. Without it a
      subject called "Art" would colour the letters inside `<span class="part">`.
--------------------------------------------------------------------------------------------- */

/* One place a colour name becomes a class. A law says "green"; the stylesheet decides what green
   is — so the palette stays where a designer would look for it. */
const LAW_CLASS = {
  green: 'w-green', blue: 'w-blue', 'blue-soft': 'w-blue-soft',
  /* PURPLE IS A VENUE, the way green is a subject. The second colour to be given a meaning, and
     the restraint is the same: nothing else may use it, or it stops meaning anything.
     It needs a row in the `laws` tab to take effect — kind `list`, match `venues`, colour
     `purple` — because the list of venues is data and this is only the palette. */
  purple: 'w-purple',
  /* PINK IS SOMETHING YOU WEAR. A cape and a subject are not the same kind of noun, and the whole
     value of colouring a word is that you know what kind of thing it is before you have read it.
     It needs a row in the `laws` tab like the others — kind `list`, match `wearables`, colour
     `pink`. This is the palette; the list of wearables is data. */
  pink: 'w-pink',
  red: 'w-red', amber: 'w-amber', dim: 'w-dim', ink: '',
};

/** The lists a `kind: list` law can name. Each is read fresh, so adding a subject colours it. */
function lawList(name) {
  const d = DATA || {};
  switch (norm(name)) {
    case 'subjects': return ((d.dropdowns || {}).subjects || []);
    case 'tutors':   return (d.tutors || []).map(t => t.title);
    case 'venues':   return (d.venues || []).map(v => v.title);
    /* THE FAMILIES IN THE SESSIONS THIS PHONE CAN SEE. It read `d.clients || d.people`, and the
       payload has never held either — deliberately, since a list of every client is not something
       to send to every phone. So the law that colours a client's name has matched nothing since it
       was written, and a law that matches nothing is indistinguishable from a law nobody added.
       A session's participants are already here and are exactly the names worth colouring: the
       people you are in something WITH. Nothing private is added — it is on the screen already. */
    case 'clients':  return [...new Set((d.liveJobs || d.jobs || [])
                       .flatMap(j => (j.slots || []).map(s => s && s.client))
                       .filter(Boolean))];
    /* Everything in the shop that is worn rather than posted. Read from the shop rather than kept
       as a second list, so an item added to the sheet is coloured without anything else changing —
       which is the point of a law naming a list instead of naming words. */
    case 'wearables':
    case 'wearable': return (d.shop || []).filter(isWearable).map(x => x.name);
    default:         return [];
  }
}

const rxSafe = s => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * ESCAPE, then colour. The only function that should ever put user text on screen.
 *
 * Returns HTML — so whatever uses it must NOT escape the result again, and must not pass it
 * anywhere that expects plain text.
 */
function mark(text) {
  let out = esc(text ?? '');
  const laws = (DATA.laws || []);
  if (!laws.length || !out) return out;

  /* Matches are parked as placeholders so later laws cannot see inside them. `\u0000` cannot occur
     in escaped text, which is what makes it a safe marker rather than a hopeful one. */
  const parked = [];
  const park = html => '\u0000' + (parked.push(html) - 1) + '\u0000';

  laws.forEach(law => {
    const cls = LAW_CLASS[norm(law.colour)];
    if (cls === undefined) return;                 // a colour nobody has defined: left alone
    const wrap = m => park(`<span class="${cls}">${m}</span>`);

    if (law.kind === 'prefix') {
      const p = rxSafe(law.match);
      /* The symbol and the word after it, and only when the symbol starts a word — so an email
         address is not read as four @names. */
      out = out.replace(new RegExp('(^|[\\s(])(' + p + '[\\w-]+)', 'g'),
                        (all, before, hit) => before + wrap(hit));

    } else if (law.kind === 'list') {
      /* Longest first, so "Further Maths" wins over "Maths" — otherwise the longer name is
         coloured in two halves with a gap in the middle. */
      lawList(law.match)
        .filter(Boolean).map(String)
        .sort((a, b) => b.length - a.length)
        .forEach(word => {
          out = out.replace(new RegExp('\\b' + rxSafe(esc(word)) + '\\b', 'gi'), wrap);
        });

    } else if (law.kind === 'word') {
      out = out.replace(new RegExp('\\b' + rxSafe(esc(law.match)) + '\\b', 'gi'), wrap);

    } else if (law.kind === 'regex') {
      /* A bad pattern in a spreadsheet cell must not take the screen down with it. */
      try { out = out.replace(new RegExp(law.match, 'g'), wrap); } catch (e) { /* ignore */ }
    }
  });

  return out.replace(/\u0000(\d+)\u0000/g, (all, i) => parked[i]);
}
const money = n => '£' + (Number(n) || 0).toFixed(2);

/* ---------- WHEN SOMETHING HAPPENED --------------------------------------------------------------
   HOW LONG AGO, until that stops being the useful answer, and then the date.

   "3 hours ago" is something you feel; "16 August 2026" is something you look up. Everything
   recent enough to still be in somebody's head gets the first; past two months the gap has
   stopped meaning anything and the date is what you would actually want to know.
--------------------------------------------------------------------------------------------- */
const MONTH_NAMES = ['January','February','March','April','May','June',
                     'July','August','September','October','November','December'];

/**
 * A timestamp WITH its time. `parseDMY` deliberately drops it — a session date is a date — and
 * here the time is the whole point: something posted forty minutes ago and something posted this
 * morning are both "today", and only one of them is news.
 *
 * DD/MM/YYYY, read explicitly. `new Date('12/06/2026')` is December the 6th in a browser, which
 * is the same misreading that would put half the feed in the wrong order.
 */
function parseWhen(v) {
  if (typeof v === 'number' && v > 0) return new Date(v);      // the payload's `at`, in ms
  const t = String(v ?? '').trim();
  if (!t) return null;
  const m = t.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})(?:[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (m) {
    const y = m[3].length === 2 ? 2000 + (+m[3]) : +m[3];
    const d = new Date(y, +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
    return isNaN(d) ? null : d;
  }
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

/** 16 August 2026. No leading zero, the month written out, the year in full. */
const fullDate = d => `${d.getDate()} ${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;

/**
 * The ladder. Singulars are words rather than numbers — "a minute ago", not "1 minute ago",
 * because nobody counts to one — and "yesterday" for the same reason.
 *
 * A date in the FUTURE is not a negative age. Clock skew and a hand-typed timestamp both produce
 * one, and "-3 hours ago" is the app admitting it cannot subtract, so anything ahead of now shows
 * its date instead.
 */
function ago(value) {
  const d = parseWhen(value);
  if (!d) return String(value ?? '');        // unparseable: show it as written, not as nothing

  const secs = (Date.now() - d.getTime()) / 1000;
  if (secs < 0) return fullDate(d);
  if (secs < 45) return 'just now';

  const mins = Math.floor(secs / 60);
  if (mins < 60) return mins <= 1 ? 'a minute ago' : mins + ' minutes ago';

  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours === 1 ? 'an hour ago' : hours + ' hours ago';

  const days = Math.floor(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7)  return days + ' days ago';
  if (days < 14) return 'a week ago';
  if (days < 28) return Math.floor(days / 7) + ' weeks ago';
  if (days < 60) return 'a month ago';

  /* Past two months, "nine weeks ago" is arithmetic and "16 August 2026" is an answer. */
  return fullDate(d);
}