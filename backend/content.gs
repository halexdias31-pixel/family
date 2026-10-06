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
      /* NEWEST ROW FIRST, WHICH `delRow` ALSO NEEDS. Deleting from the top shifts every row
         below it up by one, so a list walked forwards deletes the wrong rows after the first —
         `sort((a, b) => b._row - a._row)` above is what makes it safe, and `delRow` corrects the
         in-memory `_row`s the same way so the two cannot disagree. */
      .forEach(r => delRow(t, r));

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
    const height = N(r.height) || N(r.storeys) * 3.2 || 0;

    let outline = [];

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
      const w = N(r.w), d = N(r.d);
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
      id: S(r.id), name: S(r.name), world: S(r.world), kind: S(r.kind) || 'building',
      lat: lat, lng: lng, bearing: N(r.bearing),
      height: height, storeys: N(r.storeys),
      /* ---------- TWO DIFFERENT DEPTHS, AND THEY WERE THE SAME KEY --------------------------------
         `depth` WAS WRITTEN TWICE IN THIS OBJECT. Here from `depth_m` — the surveyed metres — and
         again forty lines down from `plot_depth`, the hand-set number of tiles. A repeated key in an
         object literal is not an error in JavaScript: the last one silently wins. So every landmark's
         real depth was thrown away before it left the server, and the board received a zero.
         NOTHING LOOKED WRONG, which is what makes it worth the words. Plots fell back to the hand-set
         `plots` column, which was filled in, so the board drew — just never from the measurement. */
      widthM: N(r.w), depthM: N(r.d),
      colour: S(r.wall_colour), note: S(r.note),
      /* THE FOUR COLUMNS THE TAB HAS AND THE PAYLOAD WAS NOT SENDING. `label`, `icon`, `role` and
         `roof` have been on the landmarks tab since it was made, and the board could not see any of
         them — which is why it carried its own copy of all thirteen buildings as a literal in the
         JavaScript. A column that exists and is not sent is a column that gets duplicated. */
      label: S(r.label) || S(r.name),
      icon: S(r.icon), role: S(r.role), roof: S(r.roof_colour),
      /* THE SHAPE OF IT. See the note in the schema: silhouette, roofline, one feature, and how
         many plots wide it sits. All optional — a row with none draws as a plain slab. */
      form: norm(r.form), roofShape: norm(r.roof_shape), feature: norm(r.feature),
      plots: N(r.plots) || 0, depth: N(r.plot_depth) || 0,
      /* THE PIECES IT IS MADE OF, gathered here rather than sent as a second list — the board wants
         a landmark and everything on it together, and joining two arrays on the phone would be the
         phone doing a database's job. An empty list is the ordinary case and draws exactly as
         before. */
      parts: parts.filter(x => key(x.landmark_id) === key(r.id) && ON_(x.active))
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

/* ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION ---------------------------
   One test, read by every caller that has to decide between "Drive said no" and "something else
   went wrong" — the first is the admin's to fix and the second is worth showing as it is. */
function driveDenied_(raw) {
  return /permission|authoriz|authoris|scope/i.test(S(raw));
}

/* ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS ----------------------
   `driveTrouble_` AND `checkScopes` EACH ASKED THIS IN THEIR OWN WORDS, and `uploadsCheck_` would
   have been the third. Google lists a token's scopes if it is asked, which turns "is the manifest
   in this deployment" from four steps retraced into a list read — so it is asked here, once.
   `error` is the reason it could not even ask (that needs `script.external_request`). */
function heldScopes_() {
  try {
    const res = UrlFetchApp.fetch(
      'https://oauth2.googleapis.com/tokeninfo?access_token='
        + encodeURIComponent(ScriptApp.getOAuthToken()),
      { muteHttpExceptions: true });
    const held = String((JSON.parse(res.getContentText() || '{}') || {}).scope || '')
      .split(/\s+/).filter(Boolean);
    return { held: held, error: '' };
  } catch (err) {
    return { held: [], error: String((err && err.message) || err) };
  }
}

/* ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS ------------------------------
   `checkScopes` TESTED `indexOf('/auth/drive')`, and `.../auth/drive.readonly` CONTAINS THAT. So the
   one report written to say whether this deployment may write to Drive said yes on a token that
   could only read — on exactly the deployment the photographs were failing on. */
function holdsScope_(held, name) {
  return (held || []).some(x => S(x).split('/auth/')[1] === name);
}

/* ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE -----------------------------
   THE SAME TWO STEPS EVERY TIME, in the order they work: the person who deployed the site presses
   Allow, and a NEW VERSION is deployed — a deployed version pins the manifest it was made from, so
   an Allow pressed afterwards changes the editor and nothing that is serving the site. The consent
   screen as a link when Apps Script will hand one over (`consentUrl_`), the editor when it will not.
   `consent` is that link or ''.

   AND THE NEW VERSION WAITS FOR `authoriseDrive` TO SAY READY. This said "press Allow; then Deploy",
   and the consent screen ticks per permission now: an Allow with one box unticked, followed by a
   new version, answers every visitor "Authorization is required" — a refusal about one photograph
   turned into the whole site down. `authoriseDrive`'s last line is the only thing that can tell
   the two apart before the deploy, so every route to "New version" goes through it. */
function driveFix_() {
  const consent = consentUrl_();
  return {
    consent: consent,
    say: (consent
      ? 'Open the consent link and press Allow, ticking every box; then run authoriseDrive in the '
        + 'Apps Script editor'
      : 'In the Apps Script editor run authoriseDrive and press Allow, ticking every box')
      + '. Only when its last line says READY: Deploy → Manage deployments → edit → Version: New '
      + 'version → Deploy. Tools → Check uploads says when it has worked.',
  };
}

/* ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT -----------------------------------------------
   TWO AUDIENCES AND THIS USED TO SPEAK TO ONE OF THEM. The diagnosis below — the scopes the token
   holds, the consent link, the editor steps — is right and is the whole of what the admin needs. It
   went to EVERYBODY: a parent sending a photograph of their child's homework was shown fifteen lines
   of `https://www.googleapis.com/auth/...` they could do nothing about. `admin` decides which. Anybody
   else is told it is the site's side and not theirs, in one sentence.

   A FAILURE THAT IS NOT A PERMISSION goes back as Google said it, to both: "Service error: Drive"
   is somebody else's outage and a Retry is the right answer to it. */
function driveTrouble_(err, admin) {
  const raw = String((err && err.message) || err || '');
  if (!driveDenied_(raw)) return raw;
  if (!admin) {
    return 'The site is not allowed to save files to Google Drive at the moment — that is on our '
      + 'side, not yours, and the admin can see how to fix it.';
  }

  /* THE DIAGNOSIS COMES WITH THE FAILURE. This used to end with "run checkScopes and see" — a fifth
     step, at the end of four, given to somebody who had just failed to post a photograph. The token
     itself says which step is still undone, and asking it costs one request.

     ONE LINE A PARAGRAPH, AND GOOGLE'S OWN SENTENCE ONLY WHERE IT IS THE NEWS. These used to be
     hard-wrapped at the editor's width, which in a bubble 78% of a 320px phone wide came out as a
     ragged column of half-lines, and Google's "Specified permissions are not sufficient …" went
     first even when the token had already been asked and had answered more plainly. When the scope
     is the cause, the scope is what is said. */
  const s = heldScopes_();
  if (s.error) {
    /* It could not even ask. That needs script.external_request, so the manifest has not reached
       this deployment at all — which is a different answer from "the Drive scope is missing", and
       it points at a different step. */
    return [raw, 'This deployment could not ask Google what it is allowed to do (' + s.error + '), so '
      + 'the manifest has not reached it. Sync backend/ — appsscript.json is one of its files — then '
      + 'deploy a NEW VERSION: a deployed version pins its manifest.'].join('\n');
  }

  if (!holdsScope_(s.held, 'drive')) {
    /* ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE ------
       IT SAID "appsscript.json asks for `drive`" AND "Apps Script works the scopes out from the
       code". Both were false. The manifest listed `drive.readonly`, and an `oauthScopes` list that
       is written out is the WHOLE list: Apps Script stops inferring scopes from the code the moment
       one is declared. So `createFile`, `createFolder` and `setSharing` could never be authorised,
       running `authoriseDrive` raised no prompt, and every Allow ever pressed granted read-only
       again. The manifest says `drive` now (docs/history, "pending-chatmedia"); what is left is
       somebody pressing Allow for it and a new version carrying it. */
    const fix = driveFix_();
    return ['Drive refused it: this deployment holds ' + (holdsScope_(s.held, 'drive.readonly')
      ? 'drive.readonly, so it can read the folder and cannot add to it.' : 'no Drive scope at all.'),
      'FIX: ' + fix.say]
      .concat(fix.consent ? ['Consent link: ' + fix.consent] : []).join('\n');
  }
  /* The scope is held and the call still failed. That is a different problem entirely, and
     sending somebody back round the authorisation loop would waste their afternoon. */
  return [raw, '.../auth/drive IS held, so this is not the scope. Most likely the folder in '
    + '`posts_folder` belongs to another account or is on a shared drive that refuses sharing by '
    + 'link. Tools → Check uploads names the folder and tries a test file.'].join('\n');
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

/* EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read,
   so the order is decided here and nowhere else. Repeats are dropped, because a row whose `image`
   was also typed into `media` would otherwise draw the same photograph twice. */
function postMediaOut_(r) {
  const out = [];
  [S(r.image)].concat(S(r.media).split('|')).forEach(x => {
    const v = S(x).trim();
    if (v && out.indexOf(v) < 0) out.push(v);
  });
  return out;
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
  /* THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`,
     read by `settingsInto_` on the phone. The backend cannot reach a file in git, so the two rungs
     left are the post's own set and the house list, which is what this fell back to anyway: no row
     of that tab has ever carried a `reactions` key. If a post ever needs a different set the place
     to say so is the post's own cell, which is the rung above. */
  return HOUSE_REACTIONS.slice();
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

/* ---------- A PICTURE, A CLIP OR A FILE IN A MESSAGE ----------------------------------------------
   THE POSTS FOLDER'S OWN CHILD, `Messages`, made the first time it is needed. A second config key
   would be a second thing somebody has to set before the feature works, and the one folder this
   deployment is already known to be able to write to is the posts folder — `addPost` proves it on
   every photograph. Null when there is no posts folder, and the caller says so.

   SHARED ANYONE-WITH-LINK, EXACTLY AS A POST'S PICTURE IS, and for its reason: a file only its owner
   can open is a broken image in the recipient's bubble, which reads as the app failing rather than
   as a permission. The id is unguessable and appears only in the two people's own `messages`
   reply, which is the same exposure every post's photograph already has. */
function getMessageFolder_() {
  /* ---------- A FOLDER THAT COULD NOT BE MADE IS NOT A FOLDER THAT IS NOT THERE ----------------
     THIS CAUGHT EVERYTHING AND RETURNED NULL, and the caller said "No posts folder … add a row to
     the config tab". On a deployment holding only `drive.readonly` the posts folder opened
     perfectly; what failed was `createFolder('Messages')`, refused for want of the scope. So the
     first photograph anybody sent in a message sent the owner to the Ledger to fix a row that was
     already right. Three answers now, and the caller words each: `{ folder }`, `{ none }` when there
     is no posts folder at all, and `{ err }` when Drive said no. */
  const posts = getPostFolder();
  if (!posts) return { none: true };
  try {
    const it = posts.getFoldersByName('Messages');
    return { folder: it.hasNext() ? it.next() : posts.createFolder('Messages') };
  } catch (err) { return { err: err }; }
}

/* ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK ----------------------------------------
   LIFTED OUT OF `addPost`, where it was a closure called `keep_`, because a profile picture is the
   same act: a `data:` URL off the phone becomes a file in a folder, readable by anyone with the
   link, and its address goes into a cell. A second copy would be a second place for the sharing line
   to be forgotten — and a picture only its owner can open is a broken square on every other phone,
   which reads as the site failing rather than as a permission.

   ANYTHING THAT IS NOT A `data:` URL IS HANDED BACK AS IT IS, which is what `addPost` relies on: a
   post may carry an address already in the folder alongside a fresh photograph. Blank is `''`.
   THROWS on a Drive failure, so each caller says it in its own words through `driveTrouble_`.
   `name` is the file name without its extension, which this works out from the type. */
function driveKeep_(folder, raw, name) {
  const v = S(raw).trim();
  if (!v) return '';
  if (!/^data:/i.test(v)) return v;
  const parts = v.split(',');
  const type = ((parts[0] || '').match(/data:([^;]+)/) || [])[1] || 'image/jpeg';
  const ext = ({ 'image/jpeg': 'jpg', 'video/quicktime': 'mov', 'video/x-m4v': 'm4v' })[type]
    || (type.split('/')[1] || 'jpg').replace(/[^a-z0-9]/gi, '');
  const blob = Utilities.newBlob(Utilities.base64Decode(parts[1] || ''), type, S(name) + '.' + ext);
  const file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  /* `#video` IS HOW THE PHONE KNOWS WHICH ELEMENT TO DRAW. A Drive address names no type. */
  return 'https://drive.google.com/file/d/' + file.getId() + '/view'
    + (/^video\//i.test(type) ? '#video' : '');
}

/* ---------- WHAT A POST MAY PUT IN DRIVE ---------------------------------------------------------
   NOTHING STOPPED IT, AND NOTHING HAD TO WHILE DRIVE COULD NOT BE WRITTEN. `addPost` is open to any
   signed-in account (`self` in ACTION_ACCESS), `driveKeep_` keeps any `data:` URL of any type at any
   size, and the file is shared by link before anybody has approved the post. Under `drive.readonly`
   every one of those uploads failed, so the gap could not be seen; the manifest asking for `drive`
   — which messages need — is what made it real. Any registered account could have put about fifty
   megabytes of anything into the business's Drive per request, as often as it liked, each with a
   public link. `savePhoto` was capped and `sendMessage` was capped; posts were the open door.

   THE PHONE'S OWN NUMBERS, so nothing the camera card lets through is refused here: a clip up to
   20MB (`CAM_VID_MAX` in posts.js; a photograph is redrawn at 1600px and is a few hundred KB), and
   45MB of base64 a post (`CAM_POST_MAX`), which is 33.75MB decoded. A PICTURE OR A CLIP AND NOTHING
   ELSE: the camera sends `image/jpeg` or the clip's own `video/*`, so a PDF or a zip came from
   somewhere other than this app. Not `image/svg+xml` — a drawing that can carry script, shared by
   link from the business's Drive, is not a photograph.

   MEASURED FROM THE BASE64, NOT BY DECODING IT. A refusal should cost nothing, and decoding 30MB to
   learn it is too big is the expensive half of keeping it. `savePhoto` measures the same way.
   `''` when the list may go; otherwise the sentence the poster reads. Addresses (a picture already
   in the folder) are not uploads and pass untouched — `driveKeep_` hands them back as they are. */
const POST_FILE_MAX  = 20 * 1048576;
const POST_FILES_MAX = Math.floor(45 * 1048576 * 3 / 4);

function postMediaRefusal_(list) {
  const ups = (list || []).map(x => S(x).trim()).filter(x => /^data:/i.test(x));
  let total = 0;
  for (let i = 0; i < ups.length; i++) {
    const head = (ups[i].match(/^data:([^;,]*);base64,/i) || [])[1] || '';
    if (!/^(image\/(jpeg|png|gif|webp|heic|heif)|video\/[\w.+-]+)$/i.test(head)) {
      return 'A post can hold photos and videos only' + (head ? ' — not ' + head : '') + '. Nothing was posted.';
    }
    const bytes = Math.floor((ups[i].length - ups[i].indexOf(',') - 1) * 3 / 4);
    if (bytes > POST_FILE_MAX) {
      return (/^video\//i.test(head) ? 'A clip' : 'A picture') + ' in this post is over 20MB — trim it '
        + 'to about twenty seconds and post again. Nothing was posted.';
    }
    total += bytes;
  }
  if (total > POST_FILES_MAX) {
    return 'That is too much to post at once (over 33MB). Post the clips separately. Nothing was posted.';
  }
  return '';
}

/* ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING ------------------------------------------
   THE RATE LIMIT, AND IT IS THE ADMIN. Everybody but an admin posts into a queue (`approved:
   PENDING`), and each of those posts holds files already in Drive and shared by link — that is how
   the admin sees what they are approving. So the number a person may have waiting is the number of
   uploads they can make without anybody looking: five posts, each within the caps above, and then
   nothing more until the admin has said yes or no to something. A clock would be a second thing to
   tune; the queue is already the thing that decides.

   ACTIVE ONLY. A waiting post the admin deleted rather than refused is `active: FALSE` and stays
   `PENDING` for ever — counting it would shut its author out with nothing on their screen saying
   why. Whose it is is asked the way `doGet` asks it when deciding who may see a waiting post. */
const POST_WAITING_MAX = 5;

function postsWaitingFor_(t, me) {
  const id = S(me && me.person_id);
  if (!id) return 0;
  return ((t && t.rows) || []).filter(r => {
    if (norm(r.approved) !== 'pending' || !ON_(r.active)) return false;
    const p = findPerson(S(r.posted_by) || S(r.author));
    return !!p && S(p.person_id) === id;
  }).length;
}

/* ---------- WHERE PROFILE PICTURES GO -----------------------------------------------------------
   `photos_folder` IN THE CONFIG TAB IF SOMEBODY HAS SET ONE, AND THE POSTS FOLDER IF NOT — the one
   folder this deployment is already known to be able to write to, because `addPost` proves it on
   every photograph. So the picker works on the day it is deployed with nothing new to configure, and
   somebody who would rather keep faces apart from the feed's pictures can say so with one row.
   A pasted folder URL works as well as a bare id, as it does for the posts folder. Null when neither
   can be opened, and the caller says which key to set. */
function getPhotoFolder_() {
  const cfg = config();
  let id = S(cfg.photos_folder || cfg.PHOTOS_FOLDER || cfg.photosFolder);
  const fromUrl = (id.match(/folders\/([\w-]{10,})/) || [])[1];
  if (fromUrl) id = fromUrl;
  if (id) {
    try { return DriveApp.getFolderById(id); } catch (e) { /* a wrong id falls back, below */ }
  }
  return getPostFolder();
}

/* The caps, in DECODED bytes, and the phone enforces the same numbers first (`MSG_CAP_` in me.js) so
   a person is told before a minute of upload rather than after it. 20MB a file is about TWENTY
   SECONDS of an iPhone's 1080p video (Apple quotes ~60MB a minute for 1080p30 HEVC), not the "about
   a minute" this used to say — which is why the phone's refusal says "trim it" rather than leaving
   somebody to guess. 32MB a message is what keeps the BASE64 body — four thirds of that — under the
   ~50MB an Apps Script web app takes in one POST. A cap at a raw 45MB would be a 60MB body, refused
   by Google with an HTML page rather than by this handler with a sentence. */
const MSG_FILE_MAX  = 20 * 1024 * 1024;
const MSG_FILES_MAX = 32 * 1024 * 1024;
const MSG_FILES_COUNT = 6;

/* ONE CELL, `url#type#name` items joined by ` | `. `#` and `|` are taken out of the name rather
   than escaped — left in, `holiday|photo.jpg` comes back as two attachments on the next read, which
   is `libCardsIn`'s argument for the same two characters. A Drive view URL never holds either. */
function msgAttachIn_(list) {
  return (list || []).map(a => [
    S(a.url), S(a.type).replace(/[#|]/g, ''),
    S(a.name).replace(/[#|\r\n]/g, ' ').trim().slice(0, 120),
  ].join('#')).join(' | ');
}

function msgAttachOut_(cell) {
  return S(cell).split('|').map(x => x.trim()).filter(Boolean).map(x => {
    const p = x.split('#');
    return { url: S(p[0]), type: S(p[1]), name: S(p.slice(2).join(' ')) };
  }).filter(a => /^https?:\/\//.test(a.url));
}

/* ---------- A FILE WITH NO TYPE IS TYPED BY ITS NAME ---------------------------------------------
   A PHONE DOES NOT ALWAYS SAY. A clip chosen through "Browse" on an iPhone, or a file shared in from
   another app, can arrive with an empty `type`, and `readAsDataURL` then labels it
   `application/octet-stream` — which `msgAttachHtml_` draws as a chip saying "MOV" rather than as a
   clip that plays. The extension is the one thing such a file still carries. Only when the type is
   missing or generic: a type the phone did name is believed. */
function msgTypeOf_(type, name) {
  const t = S(type).toLowerCase();
  if (t && t !== 'application/octet-stream') return t;
  const ext = (S(name).toLowerCase().match(/\.([a-z0-9]{2,5})$/) || [])[1] || '';
  return ({
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp',
    heic: 'image/heic', heif: 'image/heif',
    mov: 'video/quicktime', mp4: 'video/mp4', m4v: 'video/x-m4v', webm: 'video/webm', '3gp': 'video/3gpp',
    pdf: 'application/pdf',
  })[ext] || t || 'application/octet-stream';
}

/* ---------- WHERE `?setup=1` IS, FOR THE ADMIN'S SENTENCE ----------------------------------------
   The address of this web app, so a refusal can say exactly what to open rather than "run setup".
   `''` from the editor or anywhere `getService` has nothing to say, and the sentence still reads. */
function setupUrl_() {
  try {
    const u = S(ScriptApp.getService().getUrl());
    return u ? u + '?setup=1' : '';
  } catch (err) { return ''; }
}

/* ---------- WHAT A MESSAGE WITH FILES SAYS WHEN THE FILES CANNOT GO -----------------------------
   ONE SENTENCE FOR THE PERSON, AND THE FIX FOR AN ADMIN — `driveTrouble_`'s two audiences, for the
   refusal that comes before Drive is even asked: the `attachments` column the files' addresses go
   into. A parent cannot run `?setup=1` and should not be told to; the owner should be told the
   address. `why: 'files'` is what the phone reads to offer "Words only" beside Retry, so the reply
   is a shape rather than a sentence it has to recognise. */
function msgNoColumn_(admin) {
  const lead = 'Photos and videos cannot be sent yet, so nothing was sent. ';
  if (!admin) {
    return { why: 'files', error: lead + 'The site is missing a column it needs — the admin can see '
      + 'how to fix it.' };
  }
  const url = setupUrl_();
  return { why: 'files', error: lead + 'The messages tab in the Ledger has no `attachments` column. '
    + 'Open ' + (url || 'the site\'s /exec address with ?setup=1') + ' once — it adds missing columns and '
    + 'changes nothing else — then Tools → Check uploads.', setup: true };
}

/* `{ error, why }` or `{ list }`. Every file is decoded and measured BEFORE any is written, so a
   message whose third file is too big leaves no orphans of the first two in Drive.

   NOTHING IS SENT UNLESS EVERY FILE IS KEPT. A message is what somebody chose to send together —
   "here is the homework" and the three pages of it — and arriving with two of the three pages is a
   message that says something its sender did not. So a file Drive refuses takes the whole message
   back, and the files already made are BINNED, because the phone keeps every file on the pending
   bubble for Retry and a Retry would otherwise leave the first photograph in Drive twice. The phone
   offers "Words only" beside Retry, so the words are never held hostage by a photograph. `admin`
   decides whether the refusal carries the fix — see `driveTrouble_`. */
function msgAttachSave_(files, admin) {
  const raw = (Array.isArray(files) ? files : []).filter(f => f && S(f.data));
  if (!raw.length) return { list: [] };
  if (raw.length > MSG_FILES_COUNT) {
    return { error: 'Up to ' + MSG_FILES_COUNT + ' files in one message.' };
  }
  const blobs = [];
  let total = 0;
  for (let i = 0; i < raw.length; i++) {
    const f = raw[i];
    const parts = S(f.data).split(',');
    const name = S(f.name).replace(/[\\/]/g, '-').slice(0, 120) || ('file-' + (i + 1));
    const type = msgTypeOf_((parts[0].match(/data:([^;]+)/) || [])[1] || S(f.type), name);
    let bytes;
    try { bytes = Utilities.base64Decode(parts[1] || ''); }
    catch (err) { return { error: 'Could not read ' + (S(f.name) || 'a file') + '.' }; }
    if (bytes.length > MSG_FILE_MAX) {
      return { error: (S(f.name) || 'A file') + ' is over 20MB — too big to send.' };
    }
    total += bytes.length;
    if (total > MSG_FILES_MAX) return { error: 'Those files add up to more than 32MB — send fewer at once.' };
    blobs.push({ blob: Utilities.newBlob(bytes, type, name), type: type, name: name });
  }
  const lead = (blobs.length === 1 ? 'The file' : 'The files') + ' could not be kept, so nothing was sent. ';
  const got = getMessageFolder_();
  if (got.none) {
    return { why: 'files', error: lead + (admin
      ? 'There is no posts folder for files to go in: add a row to the config tab, key `posts_folder`, '
        + 'value the id from the folder URL — then Tools → Check uploads.'
      : 'The site has nowhere to put them yet — the admin can see why.') };
  }
  if (got.err) return { why: 'files', error: lead + driveTrouble_(got.err, admin) };
  const out = [], made = [];
  let at = '';
  try {
    blobs.forEach(b => {
      at = b.name;
      const file = got.folder.createFile(b.blob);
      made.push(file);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      out.push({ url: 'https://drive.google.com/file/d/' + file.getId() + '/view',
                 type: b.type, name: b.name });
    });
  } catch (err) {
    made.forEach(f => { try { f.setTrashed(true); } catch (e) { /* the bin is a courtesy */ } });
    /* WHICH ONE, when it was not the first — a refusal about "the files" when two went and the
       third did not sends somebody looking at the wrong photograph. */
    const which = made.length && at ? at + ' could not be kept, so nothing was sent. ' : lead;
    return { why: 'files', error: which + driveTrouble_(err, admin) };
  }
  return { list: out };
}

/* ---------- CHECK UPLOADS: CAN A PHOTOGRAPH IN A MESSAGE BE KEPT, ASKED OF WHAT IS SERVING ----------
   ASKED FOR AS *"i cant send images, or videos in the chat to people. i think you need to add
   something to ledger for that."* Half right, and the half that was not is why this exists: the
   Ledger needed a column, and the deployment needed a Drive scope its manifest had never asked for —
   and the only way anybody found that out was by sending a photograph and reading the refusal.

   THE DEPLOYMENT'S OWN ANSWER, NOT THE EDITOR'S. `authoriseDrive` and `checkPostsFolder` run in the
   editor, which holds whatever the last Allow granted; `/exec` runs the version that was deployed,
   with the manifest it was deployed with. A check run from the editor passes on exactly the day the
   site still fails. This is a POST to the site, so it is asked of the thing a family's phone reaches.

   FOUR QUESTIONS, IN THE ORDER A FILE MEETS THEM: is there a column for its address, does the token
   hold `drive`, does the folder open, and can a file actually be made there and shared by link.

   IT WRITES NOTHING THAT STAYS. One tiny text file is made, shared and BINNED — the three calls a real
   photograph makes, because a check that only reads passes on precisely the deployment that cannot
   write (`authoriseDrive`'s own lesson). It does not make the `Messages` folder: that is the first
   real send's job, and a check that leaves a folder behind has changed what it was measuring.

   `steps` IS THE FIX, IN ORDER, only for what failed — the owner reads a list of what to do next
   rather than four ticks and a cross to interpret. */
function uploadsCheck_() {
  const checks = [];
  const add = (id, ok, label, said) => checks.push({ id: id, ok: !!ok, label: label, said: S(said) });

  let hasColumn = false;
  try { hasColumn = read(TAB.messages).headers.indexOf('attachments') >= 0; } catch (err) { /* no tab: no */ }
  add('column', hasColumn, 'The messages tab has an attachments column',
    hasColumn ? 'Yes — a file’s address has somewhere to go.'
              : 'No. ?setup=1 adds it, and changes nothing else.');

  const cfg = config();
  const from = S(cfg.posts_folder || cfg.POSTS_FOLDER || cfg.postsFolder) ? 'posts_folder in the config tab'
    : (POSTS_FOLDER ? 'POSTS_FOLDER in constants.gs' : 'the POSTS_FOLDER_ID script property');
  const posts = getPostFolder();
  let name = '', messages = null;
  if (posts) {
    try { name = S(posts.getName()); } catch (err) { /* opened and nameless is still opened */ }
    try { const it = posts.getFoldersByName('Messages'); if (it.hasNext()) messages = it.next(); }
    catch (err) { /* asked again, properly, by the write below */ }
  }

  let wrote = false;
  let wroteSaid = 'Not tried — there is no folder to try it in.';
  if (posts) {
    let probe = null;
    try {
      probe = (messages || posts).createFile('family-upload-check.txt',
        'Made by Check uploads on the Tools column and binned straight away. Safe to delete.');
      probe.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      wrote = true;
      wroteSaid = 'Yes — a test file was made, shared by link and binned.';
    } catch (err) {
      /* GOOGLE'S SENTENCE ONLY WHEN IT IS NOT THE SCOPE. The scope has its own row above, and
         "Specified permissions are not sufficient to call …" under it said the same thing again at
         four lines long on a 320px card. Anything else — an outage, a shared drive's policy — is
         news, and goes as Google said it. */
      const raw = S((err && err.message) || err);
      wroteSaid = driveDenied_(raw) ? 'No — Drive refused it for want of permission.' : 'No — ' + raw;
    }
    if (probe) {
      try { probe.setTrashed(true); }
      catch (err) { wroteSaid += ' It could not be binned: delete family-upload-check.txt by hand.'; }
    }
  }

  /* THE SCOPE IS READ OFF THE TOKEN, AND THE WRITE IS THE EVIDENCE. If Google could not be asked
     (that needs `script.external_request`) but the write worked, the scope is plainly held — a cross
     there would be a red that contradicts the green under it. */
  const s = heldScopes_();
  const drive = holdsScope_(s.held, 'drive');
  add('scope', drive || wrote, 'This deployment may write to Drive',
    drive ? 'It holds .../auth/drive.'
    : s.error ? 'Google could not be asked (' + s.error + ')' + (wrote ? ', but the test write worked.' : '.')
    : holdsScope_(s.held, 'drive.readonly') ? 'It holds drive.readonly — it can read and cannot write.'
    : 'It holds no Drive scope at all.');
  add('folder', !!posts, 'The posts folder opens',
    posts ? '“' + (name || 'untitled') + '”, from ' + from + (messages
      ? ', with its Messages folder.' : '.')
    : 'No — ' + from + ' does not open a folder this account can reach.');
  add('write', wrote, 'A file can be made there and shared by link', wroteSaid);

  const steps = [];
  const fix = driveFix_();
  if (!wrote && !drive && !s.error) {
    steps.push({ text: 'Sync backend/ from GitHub, so appsscript.json in the editor lists '
      + '.../auth/drive and not drive.readonly.' });
    /* THE THIRD STEP IS GATED — `driveFix_` says why. */
    steps.push({ text: fix.consent ? 'Open the consent link and press Allow, ticking every box.'
      : 'In the editor run authoriseDrive and press Allow, ticking every box.', href: fix.consent });
    steps.push({ text: (fix.consent ? 'Run authoriseDrive in the editor. ' : '')
      + 'Only when its last line says READY: Deploy → Manage deployments → edit → Version: New '
      + 'version → Deploy.' });
  } else if (!wrote && !posts) {
    steps.push({ text: 'Add a row to the config tab: key posts_folder, value the id from the '
      + 'folder’s URL.' });
  } else if (!wrote) {
    steps.push({ text: 'The scope is not the problem. The folder may belong to another account or '
      + 'sit on a shared drive that refuses sharing by link — try a folder in My Drive.' });
  }
  if (!hasColumn) steps.push({ text: 'Open ?setup=1 once to add the column.', href: setupUrl_(), setup: true });

  return {
    success: true, ok: hasColumn && wrote, version: BACKEND_VERSION,
    checks: checks, scopes: s.held, steps: steps,
  };
}

/* ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE -------------------------------------
   A PAGE COUNT IS WHAT PRICES A PRINT, and it was read by pulling the PDF's bytes out of Drive and
   counting `/Count` and `/Type /Page` in them — then written back into the document row's `pages`
   cell, a few hundred a night on a trigger, skipping anything counted in the last thirty days.

   THERE IS NO CELL TO WRITE IT TO. The counts that were already gathered came across in
   `data/questions.json` — 155 papers carry a real one — and they are committed data now, so they
   are as stable as anything else in this repository and nothing has to re-read them on a schedule.

   WHAT IS ACTUALLY LOST: a NEW paper added to the library arrives with no count and cannot be
   priced for printing until somebody types one in. That was already the outcome for a compressed
   PDF, which no script can count — see the `couldNotRead` list this used to return. `installTriggers`
   no longer books the nightly sweep, and `driveIdFrom` — which pulled the file id out of a
   document's `source_url` so the PDF could be fetched — went with them. The posts folder uses
   `folderIdFrom` below, which is a different function and stays.

   ALSO GONE WITH IT: `?pages=1` and `?pages=all` on doGet, and `?run=refreshPageCounts`. */

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