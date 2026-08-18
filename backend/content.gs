/* ==================================================================================================
   @family. — 40_content.gs   (5 of 8)

   POSTS, RESOURCES, THE MAP, AND DRIVE.

   Everything that reads a file, counts a page, or fetches geometry. All of it is either behind a
   URL somebody runs on purpose or behind a nightly trigger — none of it runs on a page load, which
   is what keeps the payload to sheet reads.

   ---------------------------------------------------------------------------------------------
   HERMES WAS ONE FILE OF SEVEN THOUSAND LINES. It is eight now. Nothing was renamed and no
   behaviour changed: Apps Script joins these back into one global scope before anything runs, so
   this is the same program with the newlines in different places.

   THE RULE THAT KEEPS IT SAFE: every top-level `const` and `let` lives in 00_constants.gs, and
   every other file holds function declarations only. Functions hoist across files whatever order
   Apps Script loads them in; top-level values do not. Follow that and the order can never matter.

   Adding a new value? It goes in 00_constants.gs. Adding a new function? Anywhere.
================================================================================================== */


/**
 * WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens.
 *
 * "Specified permissions are not sufficient to call DriveApp.Folder.createFile" is Google's
 * wording and it is accurate and useless: it names the missing scope and not one of the four
 * things that cause it. The one that catches everybody is that a DEPLOYED VERSION PINS ITS
 * MANIFEST — `/exec` runs the appsscript.json as of the version it was deployed at, so declaring
 * the scope and re-authorising in the editor fixes the editor and changes nothing about the
 * deployment until a new version is published.
 */
/**
 * THE CONSENT SCREEN, AS A LINK.
 *
 * A deploy cannot grant a permission and neither can any amount of code: consent is a person
 * pressing Allow, which is the whole point of it. But Apps Script will HAND YOU THE URL of that
 * screen, and a link is something the site can show and a thumb can press.
 *
 * It is not guaranteed to be there. Apps Script offers it when it considers the script
 * unauthorised; a script that is authorised with a NARROWER set than it now needs may be
 * considered authorised, and then there is nothing to hand over and the editor is the only way.
 * Which of those it is, is worth knowing rather than guessing, so it says.
 */
function consentUrl_() {
  try {
    const info = ScriptApp.getAuthorizationInfo(ScriptApp.AuthMode.FULL);
    const url = info && info.getAuthorizationUrl ? info.getAuthorizationUrl() : '';
    return url || '';
  } catch (err) { return ''; }
}

/** Fill in the postcodes we know, for venues that have none. Returns how many it wrote. */
function seedPostcodes() {
  const t = read(TAB.venues);
  if (!t.sheet || t.headers.indexOf('postcode') < 0) return 0;
  const by = {};
  Object.keys(KNOWN_POSTCODES).forEach(n => { by[key(n)] = KNOWN_POSTCODES[n]; });
  let wrote = 0;
  t.rows.forEach(r => {
    if (S(r.postcode)) return;                       // theirs wins, always
    const got = by[key(S(r.name))];
    if (!got) return;
    setCell(t, r, 'postcode', got);
    wrote++;
  });
  if (wrote) clearCache();
  return wrote;
}

function geocodeVenues(force) {
  const t = read(TAB.venues);
  if (!t.sheet) return { error: 'no venues tab' };
  if (t.headers.indexOf('postcode') < 0) {
    return { error: 'the venues tab has no postcode column — deploy this version first, '
                  + 'then load ?setup=1' };
  }

  const want = t.rows.filter(r => S(r.name) && S(r.postcode)
    && (force || !(N(r.lat) && N(r.lng))));
  const noPostcode = t.rows.filter(r => S(r.name) && !S(r.postcode)).map(r => S(r.name));
  if (!want.length) {
    return { placed: 0, alreadyPlaced: t.rows.filter(r => N(r.lat) && N(r.lng)).length,
             noPostcode: noPostcode,
             note: noPostcode.length ? 'Fill in a postcode for those and run it again.'
                                     : 'Every venue with a postcode already has coordinates.' };
  }

  let placed = 0;
  const failed = [];
  /* A hundred a request is the service's own limit. Chunked rather than assumed, so the day this
     runs against a longer list it still works instead of silently returning nothing. */
  for (let i = 0; i < want.length; i += 100) {
    const batch = want.slice(i, i + 100);
    let out;
    try {
      const res = UrlFetchApp.fetch('https://api.postcodes.io/postcodes', {
        method: 'post', contentType: 'application/json', muteHttpExceptions: true,
        payload: JSON.stringify({ postcodes: batch.map(r => S(r.postcode)) }),
      });
      out = JSON.parse(res.getContentText());
    } catch (err) {
      return { error: 'Could not reach postcodes.io: ' + err,
               placed: placed,
               note: 'Apps Script needs the external_request scope, which is inferred from '
                   + 'UrlFetchApp — if this is the first thing to use it, run any function from '
                   + 'the editor once and accept the prompt.' };
    }

    (out && out.result || []).forEach((entry, k) => {
      const row = batch[k];
      const got = entry && entry.result;
      /* A postcode the service does not recognise comes back as a null result rather than an
         error, so it has to be tested for — otherwise a typo writes `undefined` into the sheet and
         the venue lands off the coast of Africa at 0,0. */
      if (!got || !got.latitude || !got.longitude) { failed.push(S(row.name) + ' — ' + S(row.postcode)); return; }
      setCell(t, row, 'lat', got.latitude);
      setCell(t, row, 'lng', got.longitude);
      placed++;
    });
  }

  clearCache();
  const out2 = { placed: placed, couldNotPlace: failed, noPostcode: noPostcode };
  Logger.log(JSON.stringify(out2, null, 2));
  return out2;
}

/**
 * DOUGLAS–PEUCKER. Keep the point furthest from the straight line between the ends if it is
 * further off than the tolerance, and recurse either side of it; otherwise the whole stretch is a
 * straight line and everything between the ends goes.
 *
 * It keeps CORNERS and throws away wobble, which is exactly the right thing to lose: a road's
 * shape is its turns.
 */
function simplify_(pts, tol) {
  if (pts.length < 3) return pts;
  const [ax, ay] = [pts[0][1], pts[0][0]];
  const [bx, by] = [pts[pts.length - 1][1], pts[pts.length - 1][0]];
  let worst = 0, at = 0;
  for (let i = 1; i < pts.length - 1; i++) {
    const px = pts[i][1], py = pts[i][0];
    /* Distance from the point to the line AB. The degenerate case — A and B the same point, which
       happens on a closed way — falls back to the distance from A, or the whole ring would
       collapse to two points. */
    const dx = bx - ax, dy = by - ay;
    const len = dx * dx + dy * dy;
    const d = len
      ? Math.abs(dy * px - dx * py + bx * ay - by * ax) / Math.sqrt(len)
      : Math.hypot(px - ax, py - ay);
    if (d > worst) { worst = d; at = i; }
  }
  if (worst <= tol) return [pts[0], pts[pts.length - 1]];
  return simplify_(pts.slice(0, at + 1), tol).slice(0, -1)
    .concat(simplify_(pts.slice(at), tol));
}

/**
 * FETCH ONE WORLD, or every world that has none yet.
 *
 * `arg` names a world to refetch; without one it does the worlds that are empty, which makes it
 * safe to run whenever and free when there is nothing to do.
 */
function fetchMap(arg) {
  const t = read(TAB.map);
  if (!t.sheet) return { error: 'no map tab — deploy this version, then load ?setup=1' };

  const only = S(arg);
  const done = {};
  t.rows.forEach(r => { done[S(r.world)] = true; });
  const wanted = Object.keys(MAP_BOXES)
    .filter(w => only ? key(w) === key(only) : !done[w]);

  if (!wanted.length) {
    return { fetched: [], note: only ? 'No world called "' + only + '".'
      : 'Every world already has its ground. Name one to fetch it again: ?run=fetchMap&arg=Merton' };
  }

  const out = [];
  wanted.forEach(world => {
    const [s1, w1, n1, e1] = MAP_BOXES[world];
    const box = [s1, w1, n1, e1].join(',');
    /* WHAT TO ASK FOR. Only things that show at this size: the green, the water, and roads down to
       tertiary. Everything else — every residential street, every footpath — is detail a phone
       cannot draw and nobody can read. */
    const q = '[out:json][timeout:90];('
      + 'way["leisure"~"^(park|common|garden|recreation_ground|nature_reserve)$"](' + box + ');'
      + 'way["landuse"~"^(forest|meadow|grass|cemetery|allotments)$"](' + box + ');'
      + 'way["natural"="water"](' + box + ');'
      + 'way["waterway"="river"](' + box + ');'
      + 'way["highway"~"^(motorway|trunk|primary|secondary|tertiary)$"](' + box + ');'
      /* THE RAILWAY IS NOT ASKED FOR ANY MORE. It was drawn dashed so it would not read as a road —
         which worked, and left the map covered in dotted lines that answer no question anybody has
         on a screen about tutoring. A tram line is not a place you can be taught. */
      /* BUILDINGS: THE TALL ONES, AND ONLY THE TALL ONES.
         This asked for every building with a NAME, on the reasoning that a named building is
         somebody. True, and it is also every corner shop, every pub and every church — hundreds of
         grey rectangles at a size where none of them is legible.
         Five storeys is the line. Above it a building stands over the roofs and is a landmark you
         navigate by; below it, it is texture.
         ASKED FOR TWICE, because OSM records how tall a building is either as `building:levels` or
         as `height` in metres depending entirely on who mapped it — and asking for one of them
         finds about half of them. Twenty metres is five storeys said the other way. */
      + 'way["building:levels"~"^([5-9]|[1-9][0-9])$"](' + box + ');'
      + 'way["building"]["height"~"^([2-9][0-9]|[1-9][0-9][0-9])"](' + box + ');'
      + ');out geom;';

    let data;
    try {
      /* ---------- THERE IS MORE THAN ONE OVERPASS, AND ONE OF THEM WILL ANSWER -------------------
         THIS ASKED overpass-api.de AND NOTHING ELSE, and it came back "Address unavailable" — which
         is Apps Script saying it could not reach the host at all. Not a rate limit, not a bad query:
         the main instance would not talk to Google's servers.

         Overpass is run by volunteers as several independent mirrors. They take the same query and
         return the same thing; they differ only in who runs them, where, and how busy they are. So
         depending on one is depending on one volunteer's afternoon.

         Tried in turn, first to answer wins, and what each one said is reported if none does — the
         difference between "they are busy" and "this server cannot reach any of them" needs two
         completely different things done about it, and one sentence covering both tells you neither.

         kumi is second because it is fast and rarely refuses; private.coffee is third because it is
         a different country on a different network, which is what makes it worth having rather than
         a third copy of the first two. */
      const MIRRORS = [
        'https://overpass-api.de/api/interpreter',
        'https://overpass.kumi.systems/api/interpreter',
        'https://overpass.private.coffee/api/interpreter',
      ];
      const tried = [];
      let text = '';
      for (let mi = 0; mi < MIRRORS.length; mi++) {
        const where = MIRRORS[mi].replace(/^https:\/\//, '').replace(/\/.*$/, '');
        try {
          const res = UrlFetchApp.fetch(MIRRORS[mi], {
            method: 'post', payload: { data: q }, muteHttpExceptions: true,
          });
          const code = res.getResponseCode();
          if (code === 200) { text = res.getContentText(); break; }
          /* BUSY IS NOT BROKEN. 429 is the rate limit and 504 is a queue that gave up — both are
             about this mirror right now rather than about the query, so the next one is tried. */
          tried.push(where + ' answered ' + code);
        } catch (err) {
          /* `UrlFetchApp` THROWS rather than returning a code when it cannot reach a host at all —
             which is the case that produced "Address unavailable" and the case `muteHttpExceptions`
             does nothing about, because there was no HTTP response to mute. */
          tried.push(where + ' — ' + String((err && err.message) || err).replace(/\n[\s\S]*$/, ''));
        }
      }
      if (!text) {
        out.push({ world, error: 'No Overpass server answered.',
                   tried: tried,
                   note: 'If every one says "Address unavailable", this deployment cannot reach the '
                       + 'internet at all — run any function once from the editor and accept the '
                       + 'prompt, which is what grants script.external_request.' });
        return;
      }
      data = JSON.parse(text);
    } catch (err) {
      out.push({ world, error: String(err && err.message || err) });
      return;
    }

    /* Anything already stored for this world goes first, so a refetch replaces rather than
       doubles. Bottom up, because deleting a row moves every row below it. */
    t.rows.filter(r => key(S(r.world)) === key(world))
      .sort((a, b) => b._row - a._row)
      .forEach(r => t.sheet.deleteRow(r._row));

    const rows = [];
    (data.elements || []).forEach(el => {
      if (!el.geometry || el.geometry.length < 2) return;
      const tags = el.tags || {};
      const kind = tags.waterway === 'river' || tags.natural === 'water' ? 'water'
        : tags.railway === 'rail' ? 'rail'
        : tags.highway ? 'road:' + tags.highway
        : tags.building ? 'building'
        : 'green';

      /* HOW TALL, AND WHAT IT IS. `height` in metres wins where somebody has surveyed it; storeys
         otherwise, at about three metres each, which is the usual conversion and near enough for
         something drawn a few pixels wide. Zero means nobody has said, and the drawing can decide
         what to do about that rather than being handed a made-up number. */
      const levels = N(tags['building:levels']);
      const metres = N(String(tags.height || '').replace(/[^\d.]/g, ''));
      const meta = kind === 'building'
        ? JSON.stringify({ h: Math.round(metres || levels * 3) || 0,
                           use: S(tags.building) === 'yes' ? '' : S(tags.building) })
        : '';
      /* Fifteen metres, near enough — about 0.00015 degrees. Roads keep a little more detail than
         parks because a bend in a road is information and a wobble in a hedge is not. */
      const tol = kind.indexOf('road') === 0 ? 0.00012 : 0.00020;
      const pts = simplify_(el.geometry.map(g => [g.lat, g.lon]), tol);
      if (pts.length < 2) return;
      rows.push([world, kind, S(tags.name),
        /* Five decimal places is about a metre. More is storing noise. */
        pts.map(q2 => q2[0].toFixed(5) + ' ' + q2[1].toFixed(5)).join(','),
        meta]);
    });

    if (rows.length) t.sheet.getRange(t.sheet.getLastRow() + 1, 1, rows.length, 5).setValues(rows);
    out.push({ world, shapes: rows.length,
      points: rows.reduce((n, r) => n + r[3].split(',').length, 0) });
  });

  clearCache();
  Logger.log(JSON.stringify(out, null, 2));
  return { fetched: out,
    attribution: 'Map data © OpenStreetMap contributors, ODbL' };
}

/**
 * THE HAND-MEASURED BUILDINGS, ready to draw.
 *
 * The tab stores what a ruler on a satellite photograph gives you — a length, a width and a
 * compass bearing. What a map needs is a CORNER LIST. Turning one into the other is trigonometry
 * and belongs here rather than in the phone: it is the same four corners for every reader, and a
 * second implementation of it is a second chance to get the rotation backwards.
 *
 * Small enough to ride in the main payload — a name and six numbers each, so a hundred of them is
 * a few kilobytes. The fetched OSM geometry is megabytes and stays behind `?map=`.
 */
/* ---------- AN OUTLINE TRACED BY HAND, TIDIED --------------------------------------------------
 * NOBODY CLICKS THE SAME PIXEL TWICE. A corner walked round on a satellite photograph comes back as
 * two points a few metres apart — the rec ground has an exact repeat, and Sainsbury's has a pair
 * 9.2 metres apart that is plainly one corner of the building. Both are the same mistake at
 * different precision, and neither is worth asking somebody to go back and fix.
 *
 * WHY IT MATTERS MORE THAN IT LOOKS. A nine-metre stub between two hundred-metre walls is not a
 * wall, but it IS an edge, and the board squares a site to the grid by finding its longest edge and
 * turning the whole thing until that edge lines up. A stub is never the longest, so that is safe —
 * but a stub is enough to put a notch in the tiles, and at tile resolution a notch is a missing
 * corner of a building.
 *
 * TEN METRES, AND THE NUMBER COMES FROM THE DATA RATHER THAN FROM TASTE. Sorting every edge of
 * every outline on the tab gives a clear gap:
 *
 *      9.2m   Sainsbury's — two clicks on one corner
 *     12.9m   Britannia Point's northern block — a real end wall
 *     13.8m   Priory — a real return
 *
 * So ten sits in the gap: above every wobble seen so far and below every genuine feature. If a
 * future site has a real eleven-metre wall this will eat it, and the fix then is to widen the gap
 * by measuring again rather than by nudging the number until something looks right.
 */
function tidyRing_(text) {
  const pts = S(text).split(/[,\n]/).map(q => q.trim()).filter(Boolean)
    .map(q => q.split(/\s+/).map(Number))
    .filter(q => q.length === 2 && q[0] && q[1]);
  if (pts.length < 3) return pts;

  /* ---------- THE THRESHOLD HAS TO SUIT THE THING BEING TIDIED ---------------------------------
     TEN METRES IS RIGHT FOR A SUPERMARKET AND WRONG FOR A BRIDGE. The footbridge over the Wandle is
     eight metres by twenty, and its two end edges are 5.5m and 4.4m — both under ten. Tidying it at
     a fixed ten metres left TWO points, and two points is not a shape: it drew nothing at all,
     silently, which is the worst way for this to fail.

     SO IT IS A FRACTION OF THE SHAPE'S OWN SIZE, capped at ten. A quarter of the shortest side of
     the bounding box: on Sainsbury's 168-metre frontage that is well past ten and the cap holds it
     there; on an eight-metre bridge it is two metres, which is smaller than either end wall and
     leaves the bridge a bridge.

     THE PRINCIPLE IS THE ONE THIS FILE KEEPS RE-LEARNING: a number that is right for the biggest
     thing on the tab is wrong for the smallest, and the fix is to measure the thing rather than to
     pick a better constant. */
  const mPerLat = 111320;
  const mPerLng = 111320 * Math.cos(pts[0][0] * Math.PI / 180);
  const apart = (a, b) => Math.sqrt(
    Math.pow((a[1] - b[1]) * mPerLng, 2) + Math.pow((a[0] - b[0]) * mPerLat, 2));

  const xs = pts.map(q => q[1] * mPerLng), zs = pts.map(q => q[0] * mPerLat);
  const small = Math.min(
    Math.max.apply(null, xs) - Math.min.apply(null, xs),
    Math.max.apply(null, zs) - Math.min.apply(null, zs));
  const MERGE_M = Math.min(10, Math.max(0.5, small / 4));

  /* AND NEVER BELOW THREE, whatever the threshold says. A ring of two points is a line and a line
     draws nothing — so a shape that would be tidied out of existence keeps what it has instead.
     Better a slightly untidy bridge than no bridge. */
  const out = [];
  pts.forEach(q => {
    if (!out.length || apart(q, out[out.length - 1]) > MERGE_M) out.push(q);
  });
  if (out.length < 3) return pts;
  /* AND THE JOIN AT THE END, which is the one people miss: the last point and the first are
     neighbours too, and a ring that starts and ends at nearly the same place has the same stub. */
  while (out.length > 3 && apart(out[0], out[out.length - 1]) <= MERGE_M) out.pop();
  return out;
}

function landmarks() {
  /* READ ONCE, not once per landmark. Thirteen landmarks each reading the parts tab is thirteen
     reads of the same sheet — the mistake this codebase has made before and the reason the payload
     used to take seconds. */
  const parts = read(TAB.landmarkParts).rows || [];
  const t = read(TAB.landmarks);
  if (!t.sheet) return [];

  /* Metres to degrees. A degree of latitude is about 111,320m everywhere; a degree of longitude is
     that times the cosine of the latitude, because the meridians converge. */
  const M_PER_LAT = 111320;

  return t.rows.filter(r => S(r.name) && N(r.lat) && N(r.lng)).map(r => {
    const lat = N(r.lat), lng = N(r.lng);
    const mPerLng = M_PER_LAT * Math.cos(lat * Math.PI / 180);

    /* MEASURED METRES WIN OVER COUNTED STOREYS. Somebody stood there with a ruler for the first
       one; the second is an estimate off a photograph at about 3.2m a floor. */
    const height = N(r.height_m) || N(r.storeys) * 3.2 || 0;

    let outline = [];
    const shape = S(r.shape).toLowerCase();

    /* ---------- POINTS ARE POINTS, WHATEVER THE SHAPE CELL SAYS -------------------------------
       THIS REQUIRED `shape` TO BE EXACTLY 'polygon' and the landmarks tab has no `shape` column
       filled in on any row — so eleven buildings with surveyed outlines, some of them thirty-eight
       vertices long, all fell through to the rectangle branch below and were drawn as boxes. The
       measuring was done and thrown away at the last step.

       A CELL WITH COORDINATES IN IT IS AN OUTLINE. There is no other thing `points` could mean, so
       having it is the condition — and `shape` goes back to being what it was for: saying that a
       row WITHOUT points should still be drawn as a rectangle from its width and depth. */
    if (S(r.points)) {
      /* Walked round by hand — used as given. */
      outline = S(r.points).split(/[,\n]/).map(p => p.trim()).filter(Boolean)
        .map(p => p.split(/\s+/).map(Number))
        .filter(p => p.length === 2 && p[0] && p[1]);
    } else {
      const w = N(r.width_m), d = N(r.depth_m);
      if (w && d) {
        /* A ROTATED RECTANGLE, from the centre outwards. `bearing` is the compass direction the
           front faces — 0 north, 90 east — so it is measured CLOCKWISE FROM NORTH, which is the
           opposite direction to the mathematical convention and the thing that would silently
           mirror every building if it were assumed rather than converted. */
        /* `u` runs along the FRONT and `v` runs BACK from it. At bearing 0 the front faces north,
           so the front lies east-west and the depth runs north-south.
           `bearing` is clockwise from north; the rotation below is written in that same sense, so
           there is no conversion to get backwards. Getting it wrong mirrors every building on the
           map, and a mirrored rectangle looks exactly like a correct one until it is compared to
           the street it sits on — which is what the test does. */
        const th = N(r.bearing) * Math.PI / 180;
        const cos = Math.cos(th), sin = Math.sin(th);
        [[-w / 2, -d / 2], [w / 2, -d / 2], [w / 2, d / 2], [-w / 2, d / 2]].forEach(([u, v]) => {
          /* Rotating clockwise by the bearing: east gains from `u` across the front and from `v`
             back from it, in the proportions the bearing sets. */
          const ex = u * cos + v * sin;      // metres east
          const ny = -u * sin + v * cos;     // metres north
          outline.push([lat + ny / M_PER_LAT, lng + ex / mPerLng]);
        });
      }
    }

    return {
      id: S(r.landmark_id), name: S(r.name), world: S(r.world), kind: S(r.kind) || 'building',
      lat: lat, lng: lng, bearing: N(r.bearing),
      height: height, storeys: N(r.storeys),
      /* ---------- TWO DIFFERENT DEPTHS, AND THEY WERE THE SAME KEY --------------------------------
         `depth` WAS WRITTEN TWICE IN THIS OBJECT. Here from `depth_m` — the surveyed metres — and
         again forty lines down from `plot_depth`, the hand-set number of tiles. A repeated key in an
         object literal is not an error in JavaScript: the last one silently wins. So every landmark's
         real depth was thrown away before it left the server, and the board received a zero.
         NOTHING LOOKED WRONG, which is what makes it worth the words. Plots fell back to the hand-set
         `plots` column, which was filled in, so the board drew — just never from the measurement. */
      widthM: N(r.width_m), depthM: N(r.depth_m),
      colour: S(r.colour), note: S(r.note),
      /* THE FOUR COLUMNS THE TAB HAS AND THE PAYLOAD WAS NOT SENDING. `label`, `icon`, `role` and
         `roof` have been on the landmarks tab since it was made, and the board could not see any of
         them — which is why it carried its own copy of all thirteen buildings as a literal in the
         JavaScript. A column that exists and is not sent is a column that gets duplicated. */
      label: S(r.label) || S(r.name),
      icon: S(r.icon), role: S(r.role), roof: S(r.roof),
      /* THE SHAPE OF IT. See the note in the schema: silhouette, roofline, one feature, and how
         many plots wide it sits. All optional — a row with none draws as a plain slab. */
      form: norm(r.form), roofShape: norm(r.roof_shape), feature: norm(r.feature),
      plots: N(r.plots) || 0, depth: N(r.plot_depth) || 0,
      /* THE PIECES IT IS MADE OF, gathered here rather than sent as a second list — the board wants
         a landmark and everything on it together, and joining two arrays on the phone would be the
         phone doing a database's job. An empty list is the ordinary case and draws exactly as
         before. */
      parts: parts.filter(x => key(x.landmark_id) === key(r.landmark_id) && ON_(x.active))
        .map(x => ({
          name: S(x.name), kind: norm(x.kind) || 'building',
          x: N(x.x), z: N(x.z), w: Math.max(1, N(x.w) || 1), d: Math.max(1, N(x.d) || 1),
          /* THE REAL CORNERS, parsed the same way the landmark's own outline is — one parser, one
             format, and a part is no different from a landmark in this respect. */
          /* CORNERS THAT ARE MEANT TO BE ONE CORNER, MERGED. See `tidyRing_`: an outline traced by
             hand over a photograph has a wobble in it, and two points a few metres apart on what is
             really one corner make a tiny edge that the squaring reads as a wall. */
          outline: tidyRing_(S(x.points)),
          height: N(x.height),
          form: norm(x.form), roofShape: norm(x.roof_shape),
          wall: S(x.wall_colour), roof: S(x.roof_colour), feature: norm(x.feature),
        })),
      marker: S(r.marker), address: S(r.address),
      /* The corners, ready to project. Empty means somebody has given a position and no size — the
         map can still put a marker there and the health report says which rows need measuring. */
      outline: outline,
    };
  });
}

function driveTrouble_(err) {
  const raw = String((err && err.message) || err || '');
  if (!/permission|authoriz|authoris|scope/i.test(raw)) return raw;

  /* THE DIAGNOSIS COMES WITH THE FAILURE.
     This used to end with "run checkScopes and see" — which is a fifth step, at the end of four,
     given to somebody who has just failed to post a photograph. The four steps have been right
     every time and have not helped, because they do not say WHICH of the four is the one still
     undone. The token itself does say, and asking it costs one request.

     So it asks, here, and puts the answer in the message. */
  let held = [];
  let askFailed = '';
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token='
        + encodeURIComponent(ScriptApp.getOAuthToken()),
      { muteHttpExceptions: true });
    held = String((JSON.parse(res.getContentText() || '{}') || {}).scope || '')
      .split(/\s+/).filter(Boolean);
  } catch (e2) { askFailed = String((e2 && e2.message) || e2); }

  const hasDrive = held.some(x => /\/auth\/drive$/.test(x));
  const out = [raw, ''];

  if (askFailed) {
    /* It could not even ask. That needs script.external_request, so the manifest has not reached
       this deployment at all — which is a different answer from "the Drive scope is missing", and
       it points at a different step. */
    out.push('This deployment could not ask Google what it is allowed to do: ' + askFailed);
    out.push('That check needs script.external_request, which appsscript.json also lists — so the');
    out.push('manifest has not reached THIS deployment. Paste appsscript.json, save, then deploy a');
    out.push('NEW VERSION: a deployed version pins its manifest, and authorising does not change it.');
    return out.join('\n');
  }

  out.push('What this deployment is actually allowed to do:');
  held.forEach(x => out.push('  ' + x));
  out.push('');

  if (!hasDrive) {
    /* ONE INSTRUCTION. This used to be four, and it was four every time, and it did not work five
       times running — which is evidence that the list was the problem rather than that it needed
       repeating.
       It also claimed the manifest had arrived, on the grounds that `script.external_request` was
       granted. That was a bad inference: external_request is AUTO-INFERRED from UrlFetchApp, the
       same way `drive.readonly` above is auto-inferred from reading Drive. The tell is the
       readonly itself — appsscript.json asks for `drive`, so if it were in this deployment the
       grant would say `drive` or nothing, never `drive.readonly`.
       And that in turn means the manifest is beside the point: Apps Script works the scopes out
       from the code, `authoriseDrive` calls createFile, so RUNNING IT is what raises the prompt. */
    const readonly = held.some(x => /drive\.readonly$/.test(x));
    out.push('It has ' + (readonly ? 'drive.readonly — read but not write.' : 'no Drive access.'));
    out.push('');
    const url = consentUrl_();
    if (url) {
      out.push('GRANT IT HERE:');
      out.push('  ' + url);
      out.push('');
      out.push('That is the consent screen itself. Open it, press Allow, come back and try again.');
    } else {
      out.push('ONE THING FIXES THIS, and it has to happen in the Apps Script editor:');
      out.push('  function dropdown → authoriseDrive → Run → accept the prompt.');
      out.push('');
      out.push('Apps Script would normally hand over a link to the consent screen and it has not,');
      out.push('which means it considers this script already authorised — with a narrower set than');
      out.push('it now needs. Only a run from the editor re-asks.');
    }
    out.push('');
    out.push('MEANWHILE YOU CAN STILL POST: put photographs in the folder from the Drive app and');
    out.push('choose them with the ＋ button. Reading the folder is what drive.readonly is for.');
  } else {
    /* The scope is held and the call still failed. That is a different problem entirely, and
       sending somebody back round the authorisation loop would waste their afternoon. */
    out.push('.../auth/drive IS among them, so this is not the scope after all. Most likely the');
    out.push('folder in `posts_folder` belongs to another account, or has been moved to a shared');
    out.push('drive. Check /exec?run=checkPostsFolder&name=…&pin=…');
  }
  return out.join('\n');
}

/**
 * WHEN A POST HAPPENED.
 *
 * Whichever of the three date columns the sheet actually has, in the order that answers the
 * question the feed is asking — when was this, not when did it arrive. A post with no date sorts
 * last rather than to 1970, which is what an empty cell read as a number would do.
 */
function postWhen_(r) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    const d = sheetDate(r[cols[i]]);
    if (d) return d;
  }
  return null;
}

/** Which date column this sheet writes to. The first one it actually has, same order. */
function dateCol_(t) {
  const cols = ['creation_date', 'posted_on', 'uploaded_date'];
  for (let i = 0; i < cols.length; i++) {
    if (t.headers.indexOf(cols[i]) >= 0) return cols[i];
  }
  return 'posted_on';
}

/** A file's name without its extension. Only the extension: everything else is somebody's own
    words about their own photograph, and deciding which parts of a filename are meaningful would
    be guessing about the one thing we were told directly. */
function captionFromName_(n) {
  return S(n).replace(/\.[^./]+$/, '').trim();
}

/* `fillPostNames_` WAS HERE, and it is gone with the Drive call it made.

   It looked up the name of the file behind a post, so a post with no caption could show that
   instead. Reasonable — and it ran inside `doGet`, six lookups at a time, on every page load: the
   only request to another Google service in the whole payload, for a fallback caption.

   Posts are read from the sheet now and nothing else. The scan still records `file_name` when it
   runs, and the payload still prefers a typed caption and falls back to that recorded name, so
   nothing on screen has changed except that the page no longer waits on Drive to draw.

   Deleted rather than left unused. A function nothing calls is a function somebody reads and
   assumes is doing something — which has cost this project more than one afternoon. */


/** The set on offer, most specific first: this post's own, then the brand tab, then the code. */
function reactionSet(postRow) {
  const own = S(postRow && postRow.reactions).split(/\s+/).filter(Boolean);
  if (own.length) return own;
  const row = read(TAB.brand).rows.find(r => S(r.key) === 'reactions');
  const brandSet = S(row && row.value).split(/\s+/).filter(Boolean);
  return brandSet.length ? brandSet : HOUSE_REACTIONS.slice();
}

function getPostFolder() {
  const cfg = config();
  let id = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) || POSTS_FOLDER;

  /* A pasted URL works as well as a bare id. Somebody copying a folder link and pasting the whole
     thing is the obvious mistake, and refusing it would be pedantry — the id is right there. */
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;

  if (!id) id = PropertiesService.getScriptProperties().getProperty('POSTS_FOLDER_ID') || '';
  if (!id) return null;

  try {
    return DriveApp.getFolderById(id);
  } catch (e) {
    /* Wrong id, or a folder this script cannot reach. Returning null rather than throwing, so the
       caller can say something useful instead of the request dying. */
    return null;
  }
}

/** File id from a bare id or any Drive URL shape. */
function driveIdFrom(raw) {
  const v = S(raw);
  if (!v) return '';
  const m = v.match(/\/d\/([\w-]+)/) || v.match(/[?&]id=([\w-]+)/) || v.match(/^([\w-]{20,})$/);
  return m ? m[1] : '';
}

/** Pages in a Drive PDF, or 0 if it can't be determined. Never throws. */
function pdfPageCount(fileId) {
  try {
    const file = DriveApp.getFileById(fileId);
    if ((file.getMimeType() || '').toLowerCase().indexOf('pdf') === -1) return 0;
    if (file.getSize() > PAGES_MAX_BYTES) return 0;
    // latin1 keeps every byte as one character, so offsets in the structure survive intact.
    const raw = file.getBlob().getDataAsString('latin1');

    // Preferred: the page tree's own total. Several /Count values can appear (one per tree node),
    // and the root holds the largest, so the maximum is the document total.
    let best = 0;
    const counts = raw.match(/\/Count\s+(\d+)/g) || [];
    counts.forEach(c => { const n = parseInt(c.replace(/\D+/g, ''), 10); if (n > best) best = n; });

    // Fallback: count the page objects themselves. `[^s]` keeps /Pages nodes out of the tally.
    const objs = (raw.match(/\/Type\s*\/Page[^s]/g) || []).length;

    // Trust the larger, but only when they're in the same ballpark — a wildly bigger /Count
    // usually means it was matched inside an unrelated object.
    if (best && objs && best > objs * 4) return objs;
    return Math.max(best, objs);
  } catch (err) {
    return 0;
  }
}

/**
 * Fill in page counts. Run from the editor, on a daily trigger, or via ?pages=1.
 * Only touches rows with a Drive link and no count yet — so it's cheap to re-run and won't
 * overwrite a number you've corrected by hand. ?pages=all re-reads everything.
 */
function refreshPageCounts(force) {
  const t = read(TAB.resources);
  if (!t.sheet) return { error: 'no resources tab' };
  // Anything checked longer ago than this is re-read, so a count doesn't just get filled once and
  // then drift if the file is replaced. Tunable in config; 30 days is plenty for past papers.
  const staleDays = N(config().pages_recheck_days) || 30;
  const cutoff = Date.now() - staleDays * 864e5;

  const startedAt = Date.now();
  let done = 0, skipped = 0, remaining = 0, fresh = 0;
  const failed = [];
  for (let i = 0; i < t.rows.length; i++) {
    const r = t.rows[i];
    const id = driveIdFrom(r.link);
    if (!id) { skipped++; continue; }
    if (!force) {
      const when = parseDate(r.pages_checked);
      // Counted recently AND has a number: nothing to do.
      if (N(r.pages) > 0 && when && when.getTime() > cutoff) { fresh++; continue; }
      // Checked recently and came back blank: it's a Google Doc or an oversized file, so don't
      // spend the next run's budget re-discovering that.
      if (!N(r.pages) && when && when.getTime() > cutoff) { fresh++; continue; }
    }
    /* OUT OF TIME, OR OUT OF CEILING. Either way the rest are counted as remaining rather than
       attempted — the next run picks them up, because `pages_checked` is only written for the ones
       actually read. */
    if (done >= PAGES_PER_RUN || Date.now() - startedAt > PAGES_TIME_BUDGET) {
      remaining++; continue;
    }
    const n = pdfPageCount(id);
    setCell(t, r, 'pages', n || '');
    setCell(t, r, 'pages_checked', new Date());
    done++;
    /* The ROWS that came back with nothing, not just how many. "88 failed" is a number you can do
       nothing with; eighty-eight names is a list you can work through, and every one of them is a
       resource that cannot be sold on paper until somebody types a number in. */
    if (!n) failed.push(S(r.name) || ('row ' + r._row));
  }
  const out = { counted: done, upToDate: fresh, noDriveLink: skipped, stillToDo: remaining,
                seconds: Math.round((Date.now() - startedAt) / 100) / 10,
                couldNotRead: failed.slice(0, 40) };

  /* NO SELF-BOOKING CHAIN. There was one: a run with work left booked the next a minute later,
     so the whole library filled in three minutes rather than a night or two.

     It is gone because it answered a question nobody asked. "Eventually" was the requirement, and
     the nightly sweep already meets it — a hundred and fifty files in one or two nights, and then
     for ever, catching anything replaced. The chain bought minutes-instead-of-nights for a
     ONE-TIME backfill, and charged sixty lines, a trigger slot out of twenty, and three ways to go
     wrong: a chain that never terminates, one that leaves dead triggers behind, and one nobody can
     stop because a booked trigger is invisible from the app. Each needed its own guard, and each
     guard needed its own test.

     What is left is the part that was always doing the work: a sweep that fills what it can in the
     time it has, writes down what it checked, and picks up where it left off next time. It needs
     no ceiling, no off switch and no counter, because it books nothing. */

  Logger.log(JSON.stringify(out, null, 2));
  return out;
}

/* ---------- GALLERY ------------------------------------------------------------------------- */

/** A bare folder id, or the id pulled out of a full Drive URL. */
function folderIdFrom(raw) {
  const s = S(raw);
  if (!s) return '';
  const m = s.match(/folders\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : s;
}

/**
 * The showcase images.
 * Returns { files, error } rather than just a list, because the previous version caught every
 * failure and returned [] — so "no images in the folder", "wrong folder id" and "Drive access was
 * never authorised" all looked identical, and the section just said "No showcases active".
 * The commonest cause by far is the last one: a freshly deployed script has no Drive permission
 * until someone runs a function from the editor once and accepts the prompt.
 */
function gallery() {
  // No cache. It held new uploads back for an hour, and the honest cost is one Drive call on a
  // page that already reads eleven tabs — caching it was never what made the site fast.
  const id = folderIdFrom(config().showcase_folder_id);
  if (!id) {
    return { files: [], error: 'No showcase_folder_id in the config tab.' };
  }

  let out;
  try {
    const files = DriveApp.getFolderById(id).getFiles();
    const list = [];
    const SKIP = /(folder|document|spreadsheet|presentation|pdf|video|audio|zip|json|text\/)/i;
    while (files.hasNext()) {
      const f = files.next();
      if (SKIP.test(f.getMimeType() || '')) continue;
      list.push({ id: f.getId(), name: f.getName(), date: f.getDateCreated().toISOString() });
    }
    out = { files: list, error: list.length ? '' : 'The folder opened but holds no images.' };
  } catch (err) {
    // Named, not swallowed. Almost always the authorisation prompt not yet accepted.
    out = { files: [], error: 'Could not open Drive folder ' + id + ' — ' + err +
      '. If this mentions permission or authorisation, open the Apps Script editor, run ' +
      'authoriseDrive once and accept the prompt.' };
  }
  return out;
}