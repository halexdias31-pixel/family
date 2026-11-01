#!/usr/bin/env node
/* @family. — check-all.js ONE COMMAND, ONE VERDICT. § */
const { execFileSync, execFile } = require('child_process');
const path = require('path');
const fs = require('fs');

const dir = __dirname;
// A green run is one line; -v (or VERBOSE=1) adds a line per check. The checks themselves stay quiet either way.
const VERBOSE = process.argv.includes('-v') || process.argv.includes('--verbose')
  || /^(1|true|yes)$/i.test(process.env.VERBOSE || '');
const childEnv = Object.assign({}, process.env, { VERBOSE: '' });

/* `soft` — reports rather than fails. See above: these two name things to look at, and treating a
   list to look at as a broken build is how a team learns to ignore the build. */
const SUITE = [
  { file: 'check.js',         what: 'names and load order' },
  { file: 'check-strings.js', what: 'templates that do not interpolate' },
  { file: 'check-css.js',     what: 'the stylesheet' },
  /* ---------- ONE LOADER, AND NOTHING ELSE DRAWS A WAIT § */
  { file: 'check-loading.js', what: 'every wait is the one loader, and nothing else draws one' },
  /* THE REBUILT SPLASHES, AS KEYFRAMES. `npm run splash` asks whether the picture changes and a
     wipe, a snap and a cross-fade all change it — so it passed the three faults this reads for. */
  { file: 'check-splash-loops.js', what: 'the rebuilt splashes: one seamless loop each, centred' },
  /* ---------- IT EXISTED AND NEVER RAN § */
  { file: 'check-scope.js',   what: 'names declared in a block, used outside it' },
  /* ---------- AND A CONSTANT BEING ASSIGNED TO, WHICH THROWS AND IS OFTEN SILENT § */
  { file: 'check-const.js',   what: 'nothing declared const is assigned to' },
  /* A comment says WHY in a line or two; the story is in docs/history, a § comment's full text in docs/notes. */
  { file: 'check-comments.js', what: 'no comment over 240 characters' },
  /* backend/files.json must name every backend file — sync.gs pulls by that list, and a name
     missing from it is a file DELETED from the live project on the next pull. */
  { file: 'check-manifest.js', what: 'the backend file list sync.gs pulls by' },
  /* THE BACKEND'S OWN `check.js`. § */
  { file: 'check-backend.js', what: 'one scope, one declaration per name' },
  /* ---------- BEFORE THE COLUMNS, BECAUSE A TAB NOBODY CAN OPEN HAS NO COLUMNS § */
  { file: 'check-tabs.js',    what: 'every tab routed to a file that can hold it' },
  { file: 'check-columns.js', what: 'every column the backend touches' },
  /* THE RULES (496): a special case without a rule on the Rules card fails the build. */
  { file: 'check-rules.js', what: 'every exception is a registered rule, and every rule is asked' },
  /* ---------- THE SAME QUESTION, ASKED OF ONE TAB AT A TIME § */
  { file: 'check-rows.js',    what: 'each column read, against the tab the row came from' },
  /* ---------- THE FAULT CLAUDE.md CALLS THE WORST ONE HERE § */
  { file: 'check-payload.js', what: 'DATA keys read vs DATA keys sent' },
  /* THE RUNTIME SAFETY NET (R6): one sink, malformed rows, and empty catches only falling. */
  { file: 'check-errors.js',    what: 'a throw in a draw, an act, a timer and a promise: one report each, a fallback, the rest works' },
  { file: 'check-malformed.js', what: 'a null and a string in every DATA list: every column still draws' },
  { file: 'check-catches.js',   what: 'empty catch blocks may only get fewer' },
  { file: 'check-errlog.js',    what: 'the error log: one counted row per distinct error, one note each, throttled, admin-only' },
  /* ---------- I DELETED THREE GAMES AND EVERY CHECK STAYED GREEN § */
  { file: 'check-widgets.js', what: 'the widget contract, and the roster' },
  { file: 'check-access.js', what: 'every action past the permissions gate' },
  /* AND WHETHER ANYTHING ASKS FOR IT (433): a handler nothing calls is a door onto nothing from the other side. */
  { file: 'check-actions.js', what: 'every doPost action has a caller or a written reason' },
  /* AND WHO THE ACTION IS ABOUT. `check-access` asks whether an action may be performed; this asks
     whether the person it names can be found again tomorrow. */
  /* ---------- AND WHETHER A REFUSAL IS REPORTED AS ONE § */
  { file: 'check-replies.js', what: 'a refusal reported as a refusal' },
  /* ---------- AND WHETHER WHAT WAS TYPED SURVIVES A RELOAD § */
  { file: 'check-drafts.js', what: 'every box a person types into survives a reload, or says why not' },
  /* THE @family KEYPAD EVERYWHERE (528): every box the source can draw and every box on every column, bound to the pad and tapped. */
  { file: 'check-keyboard.js', what: 'every box a person types into types on the @family keypad, never the phone\'s keyboard' },
  { file: 'check-post.js', what: 'an action that names a person by a cell they can edit' },
  { file: 'check-doors.js',   what: 'buttons and handlers', soft: true },
  { file: 'check-dead.js',    what: 'code nothing calls', soft: true },
  { file: 'check-booking.js', what: 'the booking machine, run not read' },
  /* ---------- THREE CHECKS EXISTED AND NONE OF THEM RAN § */
  { file: 'check-lifecycle.js', what: 'every booking path ends where it should' },
  { file: 'check-spine.js',     what: 'one row order, both documents' },
  { file: 'check-surfaces.js',  what: 'nothing opens over the app' },
  /* ---------- AND NOTHING STANDS IN FRONT OF A DROPDOWN § */
  { file: 'check-dropdowns.js', what: 'every dropdown the platform\'s own, nothing in front of one' },
  /* ---------- AND THE DATA ITSELF, WHICH NOTHING HAD EVER READ § */
  /* PUBLIC-DOMAIN TEXTS (514): the index, every file, sources and licences, nothing over 2 MB. */
  { file: 'check-pdtexts.js', what: 'the public-domain texts: loaded, counted, sourced' },
  { file: 'check-library.js', what: 'the library: ids, marks, and the closed facet vocabulary' },
  /* THE ONE SCHEMA (R4, R5): every card file's rows against check/schema.js, counts pinned until P4; both row-writers refuse a bad row. */
  { file: 'check-schema.js', what: 'the whole library against its one schema, and the importers\' gate' },
  /* ---------- AND HOW READY EACH PAPER IS, AS A REPORT § */
  { file: 'check-qtypes.js', what: 'every question part one interaction type, every type a protocol — gaps a report' },
  /* ---------- THE ONE PIECE OF THIS APP THAT TELLS A CHILD THEY ARE WRONG § */
  { file: 'check-marking.js', what: 'a right answer marked right, a wrong one wrong' },
  { file: 'check-marking-norm.js', what: 'every spelling of one value marked alike, its near misses wrong' },
  /* ---------- AND WHETHER THE MATHS ON A CARD LOOKS LIKE MATHS § */
  { file: 'check-typeset.js', what: 'fractions stacked, powers raised, no plain-text maths' },
  /* ---------- AND WHETHER THE ANSWER YOU SEE IS SHORT, AND ALL THERE IS § */
  { file: 'check-answers.js', what: 'every answer drawn is a short result, and nothing but the result' },
  { file: 'check-calc.js',  what: 'the calculator engine: exact fractions, roots, powers, degrees, DEL as a unit' },
  { file: 'check-typeable.js', what: 'every stored answer can be typed on the pad: its three faces reach each other and type every accept (round 4)' },
  { file: 'check-chess.js',  what: 'the chess move generator, counted by perft' },
  /* ---------- AND EVERY TIMESTAMP ANYBODY SEES § */
  { file: 'check-dates.js', what: 'a written date read as the date it says' },
  /* ---------- THE PRACTICALS, AND WHETHER THEIR TOPICS NAME ANYTHING REAL § */
  { file: 'check-practicals.js', what: 'the practicals, and the topics they join to' },
  /* ---------- AND THEIR SIBLING, WHICH IS NOT ONE OF THEM § */
  { file: 'check-projects.js', what: 'the projects: topics, the funnel, nothing sent online' },
  /* ---------- AND THE @family. TEXTBOOKS, WHICH ARE RESOURCES § */
  { file: 'check-textbooks.js', what: 'the textbooks: chapter order, the bones, the join, the Shelf door' },
  /* THE HISTORY DATABASE (459): manuscripts, figures, writings, linked both ways. */
  { file: 'check-history-db.js', what: 'the history database: schema, ids, links both ways, years, sources' },
  /* ---------- AND THE ANIMATIONS IN THEM, WHICH THE LOADING SCREEN DRAWS FROM A COPY § */
  { file: 'check-anims.js', what: 'the books\' animations: one source, kept and drawn as their rows' },
  /* ---------- AND THE BIBLE BESIDE THEM, WHICH ONLY AN ADMIN IS SHOWN § */
  { file: 'check-talmud.js', what: 'the Talmud (473): every tractate and daf in the index loads with Gemara; licences CC BY-SA or public domain' },
  { file: 'check-writings.js', what: 'one model for every written work (520): one shape, one shelf, one facet set, tradition topics, one age, nothing twice, facets.json = FACETS' },
  { file: 'check-texts.js', what: 'more writings (513): every text loads, a unit a card, each with its source and licence; scripture-like texts held to the age rule' },
  { file: 'check-hymns.js', what: 'the hymns shelf (517): every hymn in the index has words, a pre-1929 public-domain source and a licence; audio only a Spotify link' },
  { file: 'check-bible.js', what: 'the Bible: a lossless split, the ten groups and the verse counts, italics for [words], the verse list, admin only' },
  /* ---------- AND WHETHER A REEL IS A FILE THAT IS THERE § */
  { file: 'check-reels.js', what: 'every clip a file a phone can fetch and start' },
  /* ---------- AND WHAT A PERSON MAY CALL THEMSELVES § */
  { file: 'check-handles.js', what: 'who a name resolves to, and what a person may change' },
  /* ---------- AND THE CELLS ON THAT SAME TAB THAT HOLD MORE THAN ONE FACT § */
  { file: 'check-people.js', what: 'the packed cells on the people tab, round-tripped' },
  /* THE SETTINGS COLUMN THROUGH THE REAL BACKEND. § */
  { file: 'check-profile.js', what: 'your settings, saved and read back through the real backend' },
  /* "admin should be able to see each person's pin" (452). */
  { file: 'check-layout.js', what: 'Edit layout: layoutSave is admin only, checked, size-capped; doGet sends it once' },
  { file: 'check-pin-show.js', what: 'Show PIN: an admin gets the named person\'s PIN or "No PIN"; nobody else gets any' },
  /* EVERY WAY A CHILD GETS IN, FROM THE CHILD'S SIDE. § */
  { file: 'check-signin.js', what: 'a child with no email: made, registered, signed in by handle, a new PIN' },
  /* "also side note dont show children's last name."* — the owner, 10 Oct. § */
  { file: 'check-surnames.js', what: 'a child is her first name: no surname in any payload, reply or email, for anybody' },
  /* WHO SEES WHOM (386): a child siblings and friends, a parent her children — nobody else in the payload. */
  { file: 'check-visibility.js', what: 'a child sees siblings and friends, never a parent; a parent her children, never a co-parent' },
  { file: 'check-kid-prices.js', what: 'a child is sent no rate, price or £, and her money actions ask a parent (398)' },
  { file: 'check-pay-return.js', what: 'a card payment coming back from Stripe books once, and a refresh, a typed ref or a child does not (430)' },
  /* "MARK WITH AI", THROUGH THE SAME BACKEND. The one action that holds a key and spends money per
     press: no key is a sentence, the key goes in a header, the mark is clamped, the cap holds. */
  { file: 'check-aimark.js', what: 'AI marking: the key, the clamp, the daily cap, and a full Gemini asked again then the fallback, through the real doPost' },
  { file: 'check-aiimage.js', what: 'the pen\'s drawing and the photos reach aiMark and Gemini as images; bad ones refused whole; an old backend sent words only' },
  { file: 'check-working.js', what: 'a photo of the working (501): marked by the AI only, sent as images, kept with its mark, read back only by those who may' },
  /* A FACE AND A POLL VOTE ARE SET, NOT TOGGLED. § */
  { file: 'check-choice.js', what: 'a reaction and a vote set to what the phone asked, once, under the lock' },
  /* EVERY ANSWER SENT IS AN EVENT. § */
  { file: 'check-submissions.js', what: 'submissions: a row per press, the token’s person, the latest per question, whose' },
  /* ONE RANK PER ACCOUNT, STAFF ONLY BY APPLICATION (400): ranks from old cells, sign-up, the application flow, a child's PIN to the owner. */
  { file: 'check-accounts.js', what: 'ranks, sign-up as Student or Client, Staff only by an approved application, a child\'s PIN to the owner' },
  { file: 'check-staff.js', what: 'the Staff hub: tutor terms by version, pricing refusals, a statement only for its own tutor (any for an admin)' },
  { file: 'check-posts.js', what: 'posts wait for approval (author and admin only), final once up, no links, a child uploads nothing, message faces' },
  { file: 'check-suggest.js', what: 'Suggest a change: an admin’s straight to Notes for Claude, anybody else’s waits for Confirm; the old reports moved once; one tile everywhere' },
  /* THE LIBRARY'S WORDS IN THE LEDGER (397): the copy checked row by row, libItems signed-in and capped, the tools' copy the admin's. */
  { file: 'check-library-ledger.js', what: 'the library in the Ledger: copied and checked a step at a time, served signed-in with a day\'s cap' },
  /* THE FILMS ARE WHAT IS IN THE NOTFLIX FOLDER. § */
  { file: 'check-films.js', what: 'the films from the Notflix folder: the upsert, admin only, no id sent, the clock' },
  /* THE COLLIERS WOOD RACER'S MAP (426), built over a fake Overpass, DEM and Drive. */
  /* THE CONSOLE'S SAVES ON THE ACCOUNT (446), over a fake Drive. */
  { file: 'check-console-saves.js', what: 'a console game\'s save on the account: signed in, owner only, a child may, latest only, 2 MB cap, save data only' },
  { file: 'check-hands.js', what: 'a hand up from a question: signed in, own hand only, staff list oldest first and Done, 30-minute TTL' },
  { file: 'check-race.js', what: 'the racer\'s map: crossings shared, roads every 15 m, the box, DEM fallbacks and cache, ?race=1, an admin builds' },
  /* THE SHIPPED COLLIERS WOOD'S GEOMETRY (511): one road surface, nothing overlapping, no gaps, OSM's buildings. */
  { file: 'check/race-geometry.js', what: 'the racer map\'s geometry: one road surface, no overlaps or gaps, junctions covered, OSM\'s buildings with roofs' },
  /* AN ADMIN'S REELS AND VIDEOS (404), through the real doPost and doGet. */
  { file: 'check-media.js', what: 'an admin adds, edits, hides and deletes a reel or video; others and bad links refused; the payload carries it' },
  { file: 'check-media-age.js', what: 'a reel or video rated above a viewer\'s age (from their date of birth; no date of birth or signed out = underage, 450) is not sent; the admin gets all' },
  /* A FILM IS SEEN BY WHOM ITS DRIVE FILE IS SHARED WITH (450), over a fake Drive. */
  { file: 'check-film-shares.js', what: 'a film reaches only the people its Drive file is shared with, a revoked share goes within ten minutes, the admin sees who' },
  /* WHAT A CHILD WROTE, ON THEIR ACCOUNT. § */
  { file: 'check-favlinks.js', what: 'Favourite links (509): signed in only, ten at most, http(s) only, own links alone in the payload' },
  { file: 'check-missing.js', what: 'What\'s missing (526): the gaps between data/settings/expected-papers.json and the covers, a present paper never listed, the list spelled as the library' },
  { file: 'check-rewrite.js', what: 'the Rewrite coach (509, 519): admin only, its own cap, the text fenced as data, the AI narrowed to one fact per answer with a real quote, never a rewrite; the phone\'s substance scanner and copying check' },
  { file: 'check-assistant.js', what: 'the Assistant in Messages (449): signed in only, the token’s person, five a day from config, a failure given back' },
  { file: 'check-push.js', what: 'phone notifications (492): no keys a quiet no-op, recipient-only, per-kind off, UNREGISTERED dropped, no token in doGet' },
  { file: 'check-saved-answers.js', what: 'answers on the account: the token’s person, the later edit wins, text in and text out' },
  /* THE WEEKLY PARENT EMAIL, BUILT AND SWITCHED OFF. § */
  { file: 'check-digest.js', what: 'the weekly parent email: a London week, accepted parents only, off/preview/send, sent once' },
  /* AND THE PICTURES IN IT (18 Oct): § */
  { file: 'check-diagram-png.js', what: 'every drawing in the library has its PNG twin for the email, named as the backend names it, none orphaned' },
  /* WHAT EVERYBODY HAS CHOSEN TO BE EMAILED. § */
  { file: 'check-voice.js', what: 'read aloud: the device’s own voices only, the calmest natural British one first (no choice kept), maths as words, a sentence at a time' },
  { file: 'check-prefs.js', what: 'notification choices: every sender asks, off is held and logged, essentials always go, the token decides whose' },
  /* A PHOTOGRAPH OR A CLIP IN A MESSAGE, THROUGH THE SAME BACKEND AND THE REAL APP. § */
  { file: 'check-uploads.js', what: 'chat files: the manifest’s scope, the column, the refusals, both sides drawn' },
  { file: 'check-inbox.js', what: 'the Email widget (493): admin only, read-only, the mail kept nowhere' },
  /* THE ROOMS INSIDE A VENUE, THROUGH THE SAME BACKEND. § */
  { file: 'check-rooms.js', what: 'rooms: a blank cell is the venue’s, an explicit 0 stays 0, the caps, the floor, a booking, the waiting list' },
  /* ---------- AND WHETHER A CREDENTIAL IS SITTING IN THE SOURCE § */
  { file: 'check-eink.js', what: 'every icon in data/icons.json drawn in black and white only, the e-ink files current, no link away to the install page (470)' },
  { file: 'check-secrets.js', what: 'no PIN in the source, and no word of the library in data/' },
  { file: 'check-markers.js', what: 'no merge-conflict line left in any tracked file' },
  /* ---------- AND WHETHER THE QUESTIONS IT ASKS ARE WORTH ASKING § */
  /* ---------- AND THE NINE TABS THAT BECAME FILES § */
  { file: 'check-settings.js', what: 'the settings files, against what the app reads off them' },
  /* R1 (522): a finder's chips and words are written by `finderSet_` alone — read, not run, so it stays in --fast. */
  { file: 'check-finder.js', what: 'a finder\'s chips and words set only through finderSet_' },
  /* 546: the finder's first answers are counted at build time; a library change without a re-run of the tool is red here. */
  { file: 'tools/finder-tags.js --check', what: 'js/finder-tags.js is what the library asks first, not stale' },
  { file: 'check-cache.js', what: 'every fetch of our own files carries the deploy\'s stamp' },
  { file: 'check/firstpaint.js', what: 'the finder\'s first answers are drawn once and never change on a cold phone load (546)', slow: true },
  /* SLOW, LIKE THE BROWSERS, AND FOR THE SAME REASON. § */
  { file: 'check-funnel.js', what: 'every question the funnel asks can narrow something', slow: true },
  /* ---------- AND THE ONE THING THE FUNNEL CAN NOW BE ORDERED AS § */
  { file: 'check-bundle.js', what: 'a bundle names its papers, and an order reaches the owner' },
  { file: 'check-flow.js',    what: 'the app, actually running', slow: true },
  /* ---------- AND THE LIBRARY ITSELF, LAID OUT § */
  { file: 'check/cards.js',   what: 'every question in the library, laid out at phone width', slow: true },
  /* AND EVERY PART OF IT ANSWERABLE (457): words, sized figures, Zoom and the padlock, a control for its type, its own answer marked right, the pen's instruments */
  { file: 'check-answerable.js', what: 'every question part in the library can be answered', slow: true },
  /* ---------- AND EVERY LABEL IN EVERY DRAWING, AGAINST ITS OWN LINES § */
  { file: 'check/diagrams.js', what: 'every label in every drawing, clear of its lines', slow: true },
  /* ---------- AND WHETHER A PUSH ACTUALLY ARRIVES § */
  { file: 'check/deploy.js',  what: 'a deploy reaching a browser that already has the site', slow: true },
  /* ---------- EVERY TEXTBOOK ANIMATION IN ITS CHAPTER, AND STILL WHEN ASKED § */
  { file: 'check/anims.js',   what: 'every textbook animation inside its card, and still when asked', slow: true },
  /* ---------- AND WHETHER PRESSING ANYTHING DOES ANYTHING § */
  { file: 'check/press.js',   what: 'press every control and see whether anything happens', slow: true },
  /* ---------- AND WHAT A THUMB DOES THAT A PRESS DOES NOT § */
  { file: 'check/tiles.js',   what: 'every tile is tile_(), 44px with an 18px mark, no overlap, spill or orphan at four widths', slow: true },
  { file: 'check/bootslow.js', what: 'no lazy library data on a cold load; a hung or 404 data file never holds the boot; the slow box only while code or payload is missing (503)', slow: true },
  { file: 'check/talpage.js', what: 'a Talmud page stays a balanced rectangle: what runs long continues full-width (494)', slow: true },
  { file: 'check/calc-steady.js', what: 'pressing keys never changes the calculator\'s size or shape, nor any key\'s (472)', slow: true },
  { file: 'check/centred.js', what: 'Find and Find 2 float back to the middle when words or chips are cleared (508)', slow: true },
  { file: 'check/swipe.js',   what: 'a swipe lands one card away or back, centred, the rest out of focus', slow: true },
  { file: 'check/slide.js',   what: 'the slide between columns as iOS does it: landings, a spring, the rubber band, a held row (527)', slow: true },
  /* ---------- AND A FINGER ON THE PEN § */
  { file: 'check/pen.js',     what: 'a finger on the pen: two fingers, a palm or a thumb leave nothing, and the column holds', slow: true },
  /* ---------- AND EVERY INTERACTION TYPE ANSWERED WRONG, CHANGED, AND RIGHT (385) ---------- */
  { file: 'check/ruler.js',   what: 'two touch points move, turn and cross over the ruler and protractor exactly; every figure question has both (502)', slow: true },
  { file: 'check/types.js',   what: 'every interaction type answered wrong, changed and right by touch and mouse; boxes edit like iOS', slow: true },
  /* ---------- AND THE WHITEBOARD, A MATHS NOTEBOOK (377) ---------- */
  { file: 'check/whiteboard.js', what: 'the whiteboard notebook: written big it lands small, the pad moves on, gestures undo, rub out, straighten and move', slow: true },
  /* ---------- AND WHAT A RUN OF FAST FLICKS REACHES IS ALREADY DRAWN WHEN IT GETS THERE § */
  { file: 'check/reach.js',   what: 'what a run of fast flicks reaches is drawn before it gets there, at 4x CPU', slow: true },
  /* ---------- AND THE VIDEOS CARD UNDER A FINGER, A KEYBOARD AND A PHONE TURNED SIDEWAYS § */
  { file: 'check/videos.js',  what: 'the videos card: the bar held as you type, Search lets go, one player, full screen either way up', slow: true },
  /* ---------- AND THE MARKING SOUNDS, HEARD IN A BROWSER § */
  { file: 'check/sounds.js',  what: 'the chime and the buzzer: short, quiet, as loud as each other to an ear, no click, one real tap one sound, at rest when nothing plays', slow: true },
  /* ---------- AND THE INSTRUMENT THAT WAS NEVER ON THIS LIST § */
  /* THE NUMBER IS NOT IN THIS LINE, AND IT USED TO BE. § */
  /* ---------- IN TWO HALVES, BECAUSE THE NOTE BELOW SAID SO § */
  /* ---------- AND NOW IN THIRDS § */
  { file: 'check/ui.js --part=1/3', what: 'every screen, state, width and visitor, measured (a third)', slow: true },
  { file: 'check/ui.js --part=2/3', what: 'every screen, state, width and visitor, measured (a third)', slow: true },
  { file: 'check/ui.js --part=3/3', what: 'every screen, state, width and visitor, measured (a third)', slow: true },
  /* ---------- AND WHICH CSS RULE ACTUALLY WINS § */
  { file: 'check/cascade.js', what: 'which CSS rule wins, and whether order alone decided it', slow: true },
  /* ---------- AND WHETHER THE PICTURE A FAMILY IS SENT IS THE BOOKING THEY SAW § */
  { file: 'check/share.js',   what: 'the shared picture of a booking, against the booking on the screen', slow: true },
];

/* --fast: the session-start hook has 180s, and the browser checks take far longer. */
if (process.argv.includes('--fast')) for (let i = SUITE.length - 1; i >= 0; i--) if (SUITE[i].slow) SUITE.splice(i, 1);
let failed = 0, noted = 0;
const notes = [];

/* ---------- THE ONES THAT DRIVE A BROWSER START AT THE TOP, A FEW AT A TIME § */
/* AND NOT ALL AT ONCE. § */
const POOL = Math.max(2, require('os').cpus().length - 1);
const queue = [];
let live = 0;
const pump = () => { while (live < POOL && queue.length) { live++; queue.shift()(); } };
const running = new Map();
for (const c of SUITE.filter(x => x.slow).sort((x, y) => (/ui\.js/.test(y.file) ? 1 : 0) - (/ui\.js/.test(x.file) ? 1 : 0))) {
  const [file, ...args] = c.file.split(' ');
  const p = file.includes('/') ? path.join(dir, '..', file) : path.join(dir, file);
  if (!fs.existsSync(p)) continue;
  running.set(c.file, new Promise(fin => queue.push(() => {
    const t0 = Date.now();
    const done = r => { live--; fin(r); pump(); };
    /* TEN MINUTES, NOT FIVE. § */
    execFile(process.execPath, [p].concat(args), { cwd: dir, encoding: 'utf8', timeout: 900000, env: childEnv,
                                      maxBuffer: 32 * 1024 * 1024 },
      (err, stdout, stderr) => done({ ok: !err, out: String(stdout || '') + String(stderr || ''),
                                      secs: ((Date.now() - t0) / 1000).toFixed(1) }));
  })));
}
pump();

/* THE RUN ITSELF, IN AN ASYNC WRAPPER. § */
(async () => {
  if (VERBOSE) console.log('');
  let ran = 0;
  for (const c of SUITE) {
    /* A CHECK MAY LIVE OUTSIDE `js/`. § */
    /* AN ENTRY MAY CARRY ARGUMENTS after a space — `check/ui.js --part=1/2` — so the path is the
       first word and the rest go to the process. */
    const [file, ...args] = c.file.split(' ');
    const p = file.includes('/') ? path.join(dir, '..', file) : path.join(dir, file);
    if (!fs.existsSync(p)) {
      console.log('  ????  ' + c.file.padEnd(18) + 'not here');
      continue;
    }
    ran++;
    let out = '', ok = true, secs = '0.0';
    if (running.has(c.file)) {
      const r = await running.get(c.file);
      ok = r.ok; out = r.out; secs = r.secs;
    } else {
      const t0 = Date.now();
      try {
        /* FIVE MINUTES FOR A FILE CHECK, NOT THREE. § */
        out = execFileSync(process.execPath, [p].concat(args), { cwd: dir, encoding: 'utf8',
                                                    timeout: 300000, env: childEnv,
                                                    stdio: ['ignore', 'pipe', 'pipe'] });
      } catch (e) {
        ok = false;
        out = String((e.stdout || '') + (e.stderr || ''));
      }
      secs = ((Date.now() - t0) / 1000).toFixed(1);
    }

    if (ok) {
      if (VERBOSE) console.log('  PASS  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
    } else if (c.soft) {
      noted++;
      if (VERBOSE) console.log('  note  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
      /* THE INTERESTING LINES ONLY. These two print their whole report; what somebody wants here is
         the things they named, which are the indented ones under a heading. */
      notes.push({ file: c.file, what: c.what, lines: out.split('\n')
        .filter(l => /^ {2}\S/.test(l) && !/^ {2}none$/.test(l)) });
      // check-dead names things at the left margin: with nothing indented, its first lines are the finding.
      const last = notes[notes.length - 1];
      if (!last.lines.length) last.lines = out.split('\n').filter(l => l.trim() && !/^\s*none$/.test(l) && !/\(0\)\s*$/.test(l));
    } else {
      failed++;
      console.log('  FAIL  ' + c.file.padEnd(18) + c.what.padEnd(38) + secs + 's');
      /* ---------- AND IT SAYS WHEN THE TAIL IS NOT THE REPORT § */
      const lines = out.split('\n').filter(Boolean);
      /* AND A `FAIL` OR AN INDENTED `!` WITH THE TWO LINES UNDER IT. § */
      const marked = [];
      lines.forEach((l, i) => {
        if (/^!\s/.test(l)) marked.push(l);
        else if (/^\s+(FAIL|!)\s/.test(l)) marked.push.apply(marked, lines.slice(i, i + 3));
      });
      const tail = lines.slice(-14);
      marked.filter(l => tail.indexOf(l) === -1).slice(0, 12)
            .forEach(l => console.log('          ' + l));
      tail.forEach(l => console.log('          ' + l));
      if (lines.length > 14) console.log('          … ' + (lines.length - 14)
        + ' earlier line(s) not shown — `node '
        + (c.file.includes('/') ? c.file : 'js/' + c.file) + ' -v` for the whole report');
    }
  }

  if (notes.length) {
    console.log('');
    console.log('WORTH A LOOK — not failures, but things nothing can reach or nothing calls:');
    notes.forEach(n => {
      console.log('  ' + n.file + '  ' + n.what);
      const shown = VERBOSE ? n.lines : n.lines.slice(0, 5);
      shown.forEach(l => console.log('  ' + l));
      if (shown.length < n.lines.length) console.log('    … ' + (n.lines.length - shown.length) + ' more — `node '
        + (n.file.includes('/') ? n.file : 'js/' + n.file) + '`');
    });
  }

  // session-start.sh reads "OK — nothing is broken (N checks" for its count, so every green ending carries it.
  if (failed || notes.length || VERBOSE) console.log('');
  if (failed) {
    console.log('FAILED — ' + failed + ' of ' + ran + ' checks found something wrong.');
  } else if (noted) {
    console.log('OK — nothing is broken (' + ran + ' checks; ' + noted + ' with a note above).');
  } else {
    console.log('OK — nothing is broken (' + ran + ' checks).');
  }
  process.exit(failed ? 1 : 0);

})();
