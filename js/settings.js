/* ==================================================================================================
   @family. — settings.js

   THE SETTINGS SPREADSHEET, READ OFF THE REPOSITORY INSTEAD OF OFF A SHEET.

   WHY IT MOVED, in the words of the three-question test in CLAUDE.md. It is not secret — every row
   of `brand`, `facets`, `kinds`, `laws`, `facts`, `splashes`, `links` and the campaign copy already
   goes out in a payload any anonymous visitor can ask for. Nothing writes to it — eleven admin
   handlers exist in `dopost.gs` and **not one of them has a caller anywhere in `js/`**, which is
   `orderPrints` eleven times over and is measured in `data/settings/README.md`. And nobody
   hand-edits it faster than a push: the slogan changes twice a year.

   WHAT IS DELIBERATELY NOT HERE, because the first question that answers wins:

     `config`, `pricing`, `venues`   THE MONEY. `quotePerHour` reads all three SERVER-SIDE, and this
                                    repository's own sentence is that a total posted by a browser is
                                    a total the client chose. They belong in `Ledger` — one line
                                    each in `WHERE` — not in a file a phone could serve itself.
     `holidays`, `landmarks`        the backend does ARITHMETIC with them rather than forwarding
                                    them: `festiveOffers()` against today's date, `landmarks()`
                                    metres to degrees. Moving those means porting the transform,
                                    which is work rather than a copy.
     `options`, `shop`, `terms`     `allOptions()`, `avatarCatalogue()` and `termsFor()` each shape
                                    them into something else. Same answer, smaller sums.

   ---------- THE FILE WINS WHEN IT HAS ROWS, AND THAT IS WHAT MAKES THIS SAFE TO SHIP ALONE -------

   `libraryExtras_` already states the rule and this is it, pointed the same way: **a file with no
   rows leaves the payload's key alone.** Here it matters more than it did there, because the front
   end reaches Pages in a minute and the backend reaches Apps Script when somebody remembers to run
   the sync — so for some window the two disagree, and every way round has to work:

     old backend, files present      the files win. Identical, because they ARE its rows
     new backend, files present      the files are the only source
     SHEET DELETED, old backend      `read()` finds nothing, the payload sends `[]`, the files win

   That third row is the one worth having. It means the spreadsheet can be deleted as soon as this
   deploys, without waiting on the Apps Script sync — which is the route CLAUDE.md records as
   blocked on a Cloud-project switch nobody can make casually.

   ---------- EVERY SHAPE BELOW IS `doget.gs`'s, COPIED RATHER THAN REWRITTEN ----------------------

   The three-state nulls, the `ON_` guards, the sort orders, `'is-' + norm(id)`, the commas in a
   `kinds` group cell: all of it is the backend's, line for line. `find.js` and `shell.js` were
   written against those exact keys, and a mapping that is NEARLY the same is worse than one that is
   obviously the same — the sentence `libraryExtras_` already carries about `heightMm` sitting over
   a column called `height_mm`.
================================================================================================== */

/* THE TABS THIS FILE OWNS. Named as paths under `data/`, because `libraryExtraRows_` fetches
   `data/<name>.json` and `settings/brand` is `data/settings/brand.json` — one fetch machine rather
   than a second one beside it, which is the `documents_()` / `factsNow_` argument again. */
const SETTINGS_TABS = ['settings/brand', 'settings/facets', 'settings/kinds', 'settings/laws',
                       'settings/facts', 'settings/splashes', 'settings/links',
                       'settings/campaigns', 'settings/copy', 'settings/columns'];

/* `norm` on the backend. Kept private rather than borrowed, because `settings.js` loads before
   `find.js` and a mapping that works only once the funnel has loaded is a mapping that breaks on
   the first screen somebody opens — the `profList_` lesson in `cards.js`. */
const setNorm_ = v => libS(v).toLowerCase().trim();

/* A ROW NUMBER THE SHEET WOULD HAVE GIVEN. `doGet` sends `r._row` as a link's id and as a fact's
   tie-break, and a file has no such thing — so it is the line the row is on, which is what the
   sheet's own number was. Stable across loads, which is all either caller needs it for. */
const setRow_ = i => i + 2;

function settingsInto_(d, extra) {
  if (!d || !extra) return d;

  /* --- the branding, whole -------------------------------------------------------------------
     EVERY ROW, whether or not the code knows the key — the backend's own note, and the reason is
     that something added to the tab is available to whatever is written next with nothing here to
     change. An OBJECT rather than an array, so "has it any rows" is asked of the file. */
  const brand = extra['settings/brand'];
  if (brand && brand.length) {
    d.brand = d.brand || {};
    brand.forEach(r => {
      const k = libS(r.key).trim();
      if (k) d.brand[k] = libS(r.value);
    });
  }

  /* --- what the funnel asks -------------------------------------------------------------------
     `order` and `minCoverage` are THREE-STATE: a blank cell means "the code decides", a typed 0 is
     an answer. `=== ''` rather than a truthiness test, which is the backend's and is why. */
  const facets = extra['settings/facets'];
  if (facets && facets.length) {
    d.facets = facets.filter(r => libS(r.field).trim()).map(r => ({
      field: libS(r.field).trim(),
      label: libS(r.label),
      order: libS(r.sort_order) === '' ? null : Number(r.sort_order),
      minCoverage: libS(r.min_coverage) === '' ? null : Number(r.min_coverage),
      active: libOn(r.active),
    }));
  }

  /* --- what the funnel's first two questions answer --------------------------------------------
     A KIND MAY BE IN MORE THAN ONE GROUP and the cell says so with commas — `Booking, People`,
     which is what somebody would write if nobody had told them the format. Sent as a list either
     way, because a field whose type depends on its contents is a field every reader has to test. */
  const kinds = extra['settings/kinds'];
  if (kinds && kinds.length) {
    d.kinds = kinds.filter(r => libS(r.kind).trim()).map(r => ({
      kind: libS(r.kind).trim(),
      group: libS(r.group).split(',').map(x => x.trim()).filter(Boolean),
      label: libS(r.label),
      order: libS(r.sort_order) === '' ? null : Number(r.sort_order),
      active: libOn(r.active),
    }));
  }

  /* --- the laws that paint words ---------------------------------------------------------------
     Heaviest first, so a specific law beats a general one when both match the same word. */
  const laws = extra['settings/laws'];
  if (laws && laws.length) {
    d.laws = laws
      .filter(r => (libS(r.match) || setNorm_(r.kind) === 'list') && libOn(r.active))
      .map(r => ({
        kind: setNorm_(r.kind) || 'word',
        match: libS(r.match),
        colour: setNorm_(r.colour) || 'ink',
        weight: libN(r.weight) || 0,
      }))
      .sort((a, b) => b.weight - a.weight);
  }

  /* --- the reels and the "one more thing" widget ------------------------------------------------
     HEADING OR CLIP. A fact with no words is nothing; a VIDEO with no words is a video, and testing
     the heading alone would drop every clip row silently. The backend's test, kept.

     MEASURED BEFORE IT MOVED: the tab's 58 rows and `FEED_FACTS`'s 58 match on subject and heading
     with nothing left over either side, so `factsNow_` has been preferring the sheet and getting
     the code's own list back. Nothing about this column changes; it stops depending on a sheet. */
  const facts = extra['settings/facts'];
  if (facts && facts.length) {
    d.facts = facts
      .map((r, i) => ({ r: r, i: i }))
      .filter(x => (libS(x.r.heading) || libS(x.r.clip)) && libOn(x.r.active))
      .map(x => ({
        subject: libS(x.r.subject),
        heading: libS(x.r.heading),
        body: libS(x.r.body),
        pic: libS(x.r.pic),
        clip: libS(x.r.clip),
        order: libN(x.r.sort_order) || 0,
        row: setRow_(x.i),
      }))
      .sort((a, b) => (a.order - b.order) || (a.row - b.row));
  }

  /* --- which splashes are retired ---------------------------------------------------------------
     THE ONES THAT ARE OFF, not the ones that are on — so a splash written in `index.html` and never
     entered here still appears. A list of exceptions, not a whitelist somebody has to keep in step
     with the markup. That distinction is the backend's and it is the reason this key is shaped the
     way it is. */
  const splashes = extra['settings/splashes'];
  if (splashes && splashes.length) {
    d.splashOff = splashes
      .filter(r => libS(r.splash_id) && !libOn(r.active))
      .map(r => 'is-' + setNorm_(r.splash_id));
  }

  /* --- the link tiles ---------------------------------------------------------------------------
     `fields` IS NOT REBUILT and that is deliberate. The backend packs every editable column onto
     each link for an admin form that no version of this app has ever opened — `updateLink`,
     `addLink` and `deleteLink` have zero callers. `find.js` reads `title`, `category` and the whole
     `row`; nothing reads `fields`. Copying it across would be carrying the wreckage of a dead
     surface onto every phone. */
  const links = extra['settings/links'];
  if (links && links.length) {
    d.links = [];
    d.dropdowns = d.dropdowns || {};
    const cats = d.dropdowns.linkCategories = d.dropdowns.linkCategories || [];
    links.forEach((r, i) => {
      const title = libS(r.name);
      if (!title) return;
      const category = libS(r.category) || 'General';
      if (cats.indexOf(category) === -1) cats.push(category);
      d.links.push({
        id: setRow_(i), rowIndex: setRow_(i), title: title, category: category,
        url: libS(r.url), colour: libS(r.colour),
        description: libS(r.description), image: libS(r.photo),
      });
    });
  }

  /* --- the campaigns, and the words they say ----------------------------------------------------
     ONE PASS OVER `copy`, INDEXED BY CAMPAIGN, so the phone never joins two lists itself — and
     sorted by the variant NUMBER, or 10 lands beside 1 the moment somebody writes a tenth.

     THE BACKEND SENT THESE TO ADMINS ONLY and this does not, which is a real change and worth
     saying out loud. Its reason was weight — "no reason for a parent's phone to carry next term's
     advertising copy" — and the privacy half of that argument is void the moment the rows are in a
     public repository, which they now are. What is left is 7 KB, about 2 KB over the wire, against
     the cost of a second fetch path that only an admin takes. The flyer maker is still admin-only;
     only the copy behind it rides along. */
  const campaigns = extra['settings/campaigns'];
  if (campaigns && campaigns.length) {
    const words = {};
    (extra['settings/copy'] || []).forEach(r => {
      if (!libOn(r.active)) return;
      const cid = libS(r.campaign_id), slot = libS(r.slot).toLowerCase(), text = libS(r.text);
      if (!cid || !slot || !text) return;
      (words[cid] || (words[cid] = {}));
      (words[cid][slot] || (words[cid][slot] = []))
        .push({ variant: libS(r.variant) || '1', text: text, note: libS(r.note) });
    });
    Object.keys(words).forEach(cid => Object.keys(words[cid]).forEach(slot =>
      words[cid][slot].sort((a, b) => (Number(a.variant) || 0) - (Number(b.variant) || 0))));

    d.campaigns = campaigns.filter(r => libOn(r.active) && libS(r.campaign_id) && libS(r.name))
      .map(r => ({
        id: libS(r.campaign_id), name: libS(r.name), when: libS(r.when), note: libS(r.note),
        style: libS(r.style), ink: libS(r.ink), accent: libS(r.accent), ground: libS(r.ground),
        blocks: libS(r.blocks),
        copy: words[libS(r.campaign_id)] || {},
      }));
  }

  /* ---------- WHICH COLUMNS THE APP HAS, AND IN WHAT ORDER -----------------------------------------
     `applyColumns_` IN shell.js HAS BEEN WRITTEN AND UNREACHABLE SINCE IT WAS WRITTEN. It reads
     `DATA.columns`, applies the order, takes the label and the icon from each row, refuses to
     invent a column the build does not have, refuses to leave you with none, and moves `AT` if the
     screen somebody was on has just been switched off. Every one of those guards is there. **No
     backend has ever sent that key** — it is on `check-payload.js`'s accepted-dead list with the
     note "needs a `columns` tab", and the spreadsheet that tab would have lived in is being deleted.

     THAT IS `orderPrints` AGAIN: access-listed, argued for at length, and never once called. The
     nine tabs above are how it gets a source — one file, no deploy, and the same fall-through as
     everything else here.

     IT SHIPS WITH THE NINE THE CODE ALREADY HAS, in the order the code already puts them in, so
     nothing changes today. What it buys is that "the app should have four or five columns" is a
     cell rather than a commit.

     THE ORDER IS THE FILE'S, once it is sorted — `applyColumns_` uses the array order and does not
     look at `sort_order` itself, so the sort belongs here where the rows are read. */
  const columns = extra['settings/columns'];
  if (columns && columns.length) {
    const live = columns
      .map((r, i) => ({ r: r, i: i }))
      .filter(x => libS(x.r.screen) && libOn(x.r.active))
      .sort((a, b) => (libN(a.r.sort_order) - libN(b.r.sort_order)) || (a.i - b.i))
      .map(x => ({ screen: libS(x.r.screen), label: libS(x.r.label), icon: libS(x.r.icon) }));
    /* AND NOT AN EMPTY LIST. Every row switched off is the one thing `applyColumns_` refuses to act
       on — "a spreadsheet should not be able to make the app unusable by being blank" — so handing
       it `[]` would be relying on that guard rather than on this being right. */
    if (live.length) d.columns = live;
  }

  return d;
}
