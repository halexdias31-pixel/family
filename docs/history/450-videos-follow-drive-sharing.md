# 450 — Videos follow Drive sharing; no date of birth is underage

The owner: "if a child doesn't have a date of birth on the site, they should just be considered underage, and
wouldn't see age-required videos… there are some videos that even if they are of age I don't want them to see…
I want it in sync with my Drive permission. When I share files on Google Drive, e.g. I share Toy Story 3 with
George, when he logs in he can see it; if I remove his access on Drive then he can't see it either."

## No date of birth is underage — one rule

- `MEDIA_AGE_UNKNOWN` is 0 in both content.gs and games.js (was 12): a viewer whose age is unknown sees only
  reels and videos with no minimum age. `mediaAgeCap_` / `viewerAgeCap_` no longer split by rank — a Client or
  Staff account with no date of birth was treated as an adult; now everyone but the admin needs a date of birth.
- The other age gate, applying to teach (400), followed the opposite rule ("no date of birth is no age data,
  so anybody"). `adultOk_` (people.gs) now reads `personAge_`, the same reader as the media cap, and no date of
  birth refuses with `why: 'dob'` and asks for it; the You card says "add your date of birth on this screen first".
- Before this, `adultOk_` parsed with `parseDate` and the media cap with `dobOut`: two readers of one cell.

## Films: Drive's sharing is the list

- `payload.films` was admin-only. `filmsFor_(viewer)` (doget.gs) now sends an admin every film, and anyone else
  only the films whose Drive file (or series folder) lists their own email among its viewers or editors
  (`getViewers()`/`getEditors()`). Signed out, no email, or Drive unreadable: nothing. Anyone-with-link is not a
  share of a person, so it does not count. Filtered on the server: an unshared film's title and address never
  leave it.
- `filmShares_` keeps each file's list in the script cache `FILMS_SHARE_TTL_S` (600 s, key `fshare:<id>`); an
  unreadable file is kept as `null` so it is not asked again every load. A removed share is gone within ten minutes.
- The films ride the fresh half of the payload (`freshFor_`), never the kept body, so a share change is not
  frozen in the per-viewer payload cache.
- The admin's row says `Shared with a@…, b@…` / `Shared with nobody` (`sharedWith`, `.vid-shared`), one line.
- `fromFilms` still alone lets a row ask Drive for a thumbnail or player; Drive's player itself requires the
  viewer's browser to be signed in to the Google account that was shared.

## YouTube reels and videos (the `media` tab and data/videos.json)

Left public, age-gated as before (406) and hideable by the admin. They are the teaching clips the Reels
column is made of; hiding them all unless marked public would empty that column for every student, and the
owner's words were about the Drive films. If a YouTube item should be for nobody, Hide it.

## Checks

- `check-film-shares.js` (new): fake Drive — shared → sent, editor in other letter case → sent, unshared →
  not even its address, signed out → none, revoked → still kept inside ten minutes with no new Drive call,
  then gone; admin sees all four with who; no date of birth → cap 0.
- `check-media-age.js`, `check-accounts.js`, `check-films.js` (a signed-out load still never opens the tab;
  a student's now may, to ask Drive) and three flow journeys updated; a new flow journey for the student's
  shared film and the admin's sharing line.

## Deploying

Backend: merge, pull in Apps Script, Deploy → New version. The project already holds `.../auth/drive` for
the Notflix sync; `getViewers`/`getEditors` need no new scope. If a deployment holds only `drive.readonly`
it still reads shares. Run `authoriseDrive` once if the You screen says Drive is not authorised.
