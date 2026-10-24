/* @family. — 40_content.gs (5 of 8) POSTS, RESOURCES, THE MAP, AND DRIVE. § */


/* WHAT A DRIVE FAILURE ACTUALLY MEANS, said in the place it happens. § */
/* THE CONSENT SCREEN, AS A LINK. § */
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
      /* A postcode the service does not recognise comes back as a null result rather than an error, so it has to be tested for — otherwise a typo writes `undefined` § */
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

/* DOUGLAS–PEUCKER. Keep the point furthest from the straight line between the ends if it is further off than the tolerance, and recurse either side of it § */
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
      /* THE RAILWAY IS NOT ASKED FOR ANY MORE. § */
      /* BUILDINGS: THE TALL ONES, AND ONLY THE TALL ONES. § */
      + 'way["building:levels"~"^([5-9]|[1-9][0-9])$"](' + box + ');'
      + 'way["building"]["height"~"^([2-9][0-9]|[1-9][0-9][0-9])"](' + box + ');'
      + ');out geom;';

    let data;
    try {
      /* ---------- THERE IS MORE THAN ONE OVERPASS, AND ONE OF THEM WILL ANSWER § */
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
          /* `UrlFetchApp` THROWS rather than returning a code when it cannot reach a host at all — which is the case that produced "Address unavailable" and the case § */
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
      /* NEWEST ROW FIRST, WHICH `delRow` ALSO NEEDS. § */
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

      /* HOW TALL, AND WHAT IT IS. § */
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

/* THE HAND-MEASURED BUILDINGS, ready to draw. § */
/* ---------- AN OUTLINE TRACED BY HAND, TIDIED § */
function tidyRing_(text) {
  const pts = S(text).split(/[,\n]/).map(q => q.trim()).filter(Boolean)
    .map(q => q.split(/\s+/).map(Number))
    .filter(q => q.length === 2 && q[0] && q[1]);
  if (pts.length < 3) return pts;

  /* ---------- THE THRESHOLD HAS TO SUIT THE THING BEING TIDIED § */
  const mPerLat = 111320;
  const mPerLng = 111320 * Math.cos(pts[0][0] * Math.PI / 180);
  const apart = (a, b) => Math.sqrt(
    Math.pow((a[1] - b[1]) * mPerLng, 2) + Math.pow((a[0] - b[0]) * mPerLat, 2));

  const xs = pts.map(q => q[1] * mPerLng), zs = pts.map(q => q[0] * mPerLat);
  const small = Math.min(
    Math.max.apply(null, xs) - Math.min.apply(null, xs),
    Math.max.apply(null, zs) - Math.min.apply(null, zs));
  const MERGE_M = Math.min(10, Math.max(0.5, small / 4));

  /* AND NEVER BELOW THREE, whatever the threshold says. § */
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

    /* ---------- POINTS ARE POINTS, WHATEVER THE SHAPE CELL SAYS § */
    if (S(r.points)) {
      /* Walked round by hand — used as given. */
      outline = S(r.points).split(/[,\n]/).map(p => p.trim()).filter(Boolean)
        .map(p => p.split(/\s+/).map(Number))
        .filter(p => p.length === 2 && p[0] && p[1]);
    } else {
      const w = N(r.w), d = N(r.d);
      if (w && d) {
        /* A ROTATED RECTANGLE, from the centre outwards. § */
        /* `u` runs along the FRONT and `v` runs BACK from it. § */
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
      /* ---------- TWO DIFFERENT DEPTHS, AND THEY WERE THE SAME KEY § */
      widthM: N(r.w), depthM: N(r.d),
      colour: S(r.wall_colour), note: S(r.note),
      /* THE FOUR COLUMNS THE TAB HAS AND THE PAYLOAD WAS NOT SENDING. § */
      label: S(r.label) || S(r.name),
      icon: S(r.icon), role: S(r.role), roof: S(r.roof_colour),
      /* THE SHAPE OF IT. See the note in the schema: silhouette, roofline, one feature, and how
         many plots wide it sits. All optional — a row with none draws as a plain slab. */
      form: norm(r.form), roofShape: norm(r.roof_shape), feature: norm(r.feature),
      plots: N(r.plots) || 0, depth: N(r.plot_depth) || 0,
      /* THE PIECES IT IS MADE OF, gathered here rather than sent as a second list — the board wants a landmark and everything on it together, and joining two arrays on § */
      parts: parts.filter(x => key(x.landmark_id) === key(r.id) && ON_(x.active))
        .map(x => ({
          name: S(x.name), kind: norm(x.kind) || 'building',
          x: N(x.x), z: N(x.z), w: Math.max(1, N(x.w) || 1), d: Math.max(1, N(x.d) || 1),
          /* THE REAL CORNERS, parsed the same way the landmark's own outline is — one parser, one
             format, and a part is no different from a landmark in this respect. */
          /* CORNERS THAT ARE MEANT TO BE ONE CORNER, MERGED. § */
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

/* ---------- WHETHER GOOGLE REFUSED A DRIVE CALL FOR WANT OF PERMISSION § */
function driveDenied_(raw) {
  return /permission|authoriz|authoris|scope/i.test(S(raw));
}

/* ---------- WHICH SCOPES THE TOKEN IN THIS DEPLOYMENT'S HAND ACTUALLY HOLDS § */
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

/* ---------- ONE SCOPE BY ITS WHOLE NAME, NEVER BY ITS FIRST LETTERS § */
function holdsScope_(held, name) {
  return (held || []).some(x => S(x).split('/auth/')[1] === name);
}

/* ---------- WHAT AN ADMIN DOES ABOUT A DRIVE REFUSAL, AS ONE SENTENCE § */
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

/* ---------- A DRIVE FAILURE, SAID TO WHOEVER MET IT § */
function driveTrouble_(err, admin) {
  const raw = String((err && err.message) || err || '');
  if (!driveDenied_(raw)) return raw;
  if (!admin) {
    return 'The site is not allowed to save files to Google Drive at the moment — that is on our '
      + 'side, not yours, and the admin can see how to fix it.';
  }

  /* THE DIAGNOSIS COMES WITH THE FAILURE. § */
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
    /* ---------- THE MANIFEST WAS THE WHOLE CAUSE, AND THIS NOTE USED TO SAY IT COULD NOT BE § */
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

/* WHEN A POST HAPPENED. § */
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

/* EVERY PICTURE AND CLIP ON A POST ROW, IN ORDER, `image` FIRST — one list for the phone to read, so the order is decided here and nowhere else. § */
function postMediaOut_(r) {
  const out = [];
  [S(r.image)].concat(S(r.media).split('|')).forEach(x => {
    const v = S(x).trim();
    if (v && out.indexOf(v) < 0) out.push(v);
  });
  return out;
}

/* A file's name without its extension. § */
function captionFromName_(n) {
  return S(n).replace(/\.[^./]+$/, '').trim();
}

/* `fillPostNames_` WAS HERE, and it is gone with the Drive call it made. § */


/** The set on offer, most specific first: this post's own, then the brand tab, then the code. */
function reactionSet(postRow) {
  const own = S(postRow && postRow.reactions).split(/\s+/).filter(Boolean);
  if (own.length) return own;
  /* THE BRAND TAB WAS THE MIDDLE RUNG AND IT IS IN THE REPOSITORY NOW — `data/settings/brand.json`, read by `settingsInto_` on the phone. § */
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

/* ---------- A PICTURE, A CLIP OR A FILE IN A MESSAGE § */
function getMessageFolder_() {
  /* ---------- A FOLDER THAT COULD NOT BE MADE IS NOT A FOLDER THAT IS NOT THERE § */
  const posts = getPostFolder();
  if (!posts) return { none: true };
  try {
    const it = posts.getFoldersByName('Messages');
    return { folder: it.hasNext() ? it.next() : posts.createFolder('Messages') };
  } catch (err) { return { err: err }; }
}

/* ---------- ONE PICTURE, KEPT IN DRIVE AND SHARED BY LINK § */
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

/* ---------- WHAT A POST MAY PUT IN DRIVE § */
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

/* ---------- HOW MANY POSTS ONE PERSON MAY HAVE WAITING § */
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

/* ---------- WHERE PROFILE PICTURES GO § */
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

/* The caps, in DECODED bytes, and the phone enforces the same numbers first (`MSG_CAP_` in me.js) so a person is told before a minute of upload rather than after § */
const MSG_FILE_MAX  = 20 * 1024 * 1024;
const MSG_FILES_MAX = 32 * 1024 * 1024;
const MSG_FILES_COUNT = 6;

/* ONE CELL, `url#type#name` items joined by ` | `. § */
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

/* ---------- A FILE WITH NO TYPE IS TYPED BY ITS NAME § */
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

/* ---------- WHERE `?setup=1` IS, FOR THE ADMIN'S SENTENCE § */
function setupUrl_() {
  try {
    const u = S(ScriptApp.getService().getUrl());
    return u ? u + '?setup=1' : '';
  } catch (err) { return ''; }
}

/* ---------- WHAT A MESSAGE WITH FILES SAYS WHEN THE FILES CANNOT GO § */
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

/* `{ error, why }` or `{ list }`. § */
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

/* ---------- CHECK UPLOADS: CAN A PHOTOGRAPH IN A MESSAGE BE KEPT, ASKED OF WHAT IS SERVING § */
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
      /* GOOGLE'S SENTENCE ONLY WHEN IT IS NOT THE SCOPE. § */
      const raw = S((err && err.message) || err);
      wroteSaid = driveDenied_(raw) ? 'No — Drive refused it for want of permission.' : 'No — ' + raw;
    }
    if (probe) {
      try { probe.setTrashed(true); }
      catch (err) { wroteSaid += ' It could not be binned: delete family-upload-check.txt by hand.'; }
    }
  }

  /* THE SCOPE IS READ OFF THE TOKEN, AND THE WRITE IS THE EVIDENCE. § */
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

/* ---------- `pdfPageCount` AND `refreshPageCounts` WERE HERE § */

/* ---------- GALLERY ------------------------------------------------------------------------- */

/** A bare folder id, or the id pulled out of a full Drive URL. */
function folderIdFrom(raw) {
  const s = S(raw);
  if (!s) return '';
  const m = s.match(/folders\/([\w-]+)/) || s.match(/[?&]id=([\w-]+)/);
  return m ? m[1] : s;
}

/* The showcase images. § */
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

/* THE FILMS ARE WHATEVER IS IN THE NOTFLIX FOLDER § */

/** The clock the budget is measured against. A function, so `check-films.js` can run the walk on a
    clock of its own and prove that it stops and resumes without waiting twenty real seconds. */
function filmsClock_() { return Date.now(); }

/** Where the last run got to. `{ at, pass, after, root, folder, how, found }` — see `filmsSync_`. */
function filmsState_() {
  try {
    const raw = PropertiesService.getScriptProperties().getProperty(FILMS_SYNC_PROP);
    const st = raw ? JSON.parse(raw) : {};
    return (st && typeof st === 'object') ? st : {};
  } catch (err) { return {}; }
}
function filmsStateSave_(st) {
  try { PropertiesService.getScriptProperties().setProperty(FILMS_SYNC_PROP, JSON.stringify(st || {})); }
  catch (err) {}
}

/* ---------- WHICH FOLDER § */
function filmsRoot_() {
  const cfg = config();
  const raw = S(cfg[FILMS_FOLDER_KEY]);
  if (raw) {
    let f = null;
    try { f = DriveApp.getFolderById(folderIdFrom(raw)); } catch (err) { f = null; }
    if (!f) return { error: 'The films_folder cell in the config tab does not open a folder this script can see. '
                            + 'Check it, or blank it to use the folder named Notflix.' };
    return { folder: f, name: S(f.getName()), how: 'config' };
  }
  const was = S(filmsState_().root);
  if (was) {
    let f = null;
    try { f = DriveApp.getFolderById(was); if (f && f.isTrashed && f.isTrashed()) f = null; } catch (err) { f = null; }
    if (f) return { folder: f, name: S(f.getName()), how: 'remembered' };
  }
  const found = [];
  try {
    const it = DriveApp.searchFolders("title contains '" + FILMS_FOLDER_NAME + "' and trashed = false");
    while (it.hasNext()) {
      const f = it.next();
      if (norm(f.getName()) === FILMS_FOLDER_NAME) found.push(f);
    }
  } catch (err) {
    return { error: 'Drive could not be searched — ' + S(err && err.message || err)
                    + '. Run authoriseDrive once from the Apps Script editor.' };
  }
  if (!found.length) return { error: 'No folder named Notflix is visible to this script. Put its id in '
                                      + 'films_folder on the config tab.' };
  if (found.length === 1) return { folder: found[0], name: S(found[0].getName()), how: 'name' };
  const me = filmsMe_();
  const mine = me ? found.filter(f => filmsOwner_(f) === me) : [];
  if (mine.length === 1) return { folder: mine[0], name: S(mine[0].getName()), how: 'name' };
  return { error: found.length + ' folders are named Notflix and nothing says which is the films. Put the right '
                  + 'one’s id (or its address) in films_folder on the config tab — nothing was synced.' };
}
/** This account's own address, as Drive knows it — the owner of its My Drive. '' when Drive will not say. */
function filmsMe_() {
  try { const o = DriveApp.getRootFolder().getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}
/** A folder's owner's address, or '' (a shared drive's folder has no owner). */
function filmsOwner_(f) {
  try { const o = f.getOwner(); return o ? norm(o.getEmail()) : ''; } catch (err) { return ''; }
}

/* ---------- A NAME, READ § */
function filmsTitle_(name) {
  let s = S(name).replace(/\s+/g, ' ');
  s = s.replace(FILMS_RE_VIDEO_EXT, '').trim();
  if (!/\s/.test(s) && /\.(?:19|20)\d{2}(?:\.|$)/.test(s)) {
    const m = s.match(/^(.*?)\.((?:19|20)\d{2})(?:\.|$)/);
    if (m && m[1]) return { title: m[1].replace(/[._]+/g, ' ').trim(), year: m[2], note: '' };
  }
  let m = s.match(/^(.*?)\s*\(((?:19|20)\d{2})\)\s*(.*)$/);
  if (m && S(m[1])) return { title: S(m[1]), year: m[2], note: S(m[3]) };
  m = s.match(/^(.*\S)\s+-\s+([A-Z0-9]{2,6})$/);
  if (m && /\d/.test(m[2])) return { title: S(m[1]), year: '', note: m[2] };
  return { title: s, year: '', note: '' };
}

/* AN EPISODE'S SEASON AND NUMBER from its name: `S.E.mkv`, a bare `S.E`, `S.E <a note>.mkv`, and the
   release style `Show.S01E10.720p...mkv` that four files in one season use. Null for anything else. */
function filmsEpisode_(name) {
  const s = S(name);
  let m = s.match(/(?:^|[^A-Za-z0-9])[Ss](\d{1,2})[ ._-]?[Ee](\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  m = s.match(/^(\d{1,2})\.(\d{1,3})(?!\d)/);
  if (m) return { season: Number(m[1]), episode: Number(m[2]) };
  return null;
}

/** A video by its type, or by its name when Drive did not know the type. */
function filmsIsVideo_(f) {
  return /^video\//i.test(S(f.getMimeType())) || FILMS_RE_VIDEO_EXT.test(S(f.getName()));
}

function filmsEach_(it, fn) { while (it.hasNext()) fn(it.next()); }

/** Gigabytes to two places, as Drive itself counts them (1024³). */
function filmsGb_(bytes) { return Math.round((Number(bytes) || 0) / 1073741824 * 100) / 100; }

/* ---------- THE THINGS IN THE FOLDER, LISTED BUT NOT YET WALKED § */
function filmsList_(root) {
  const out = { things: [], skipped: 0, unknown: 0 };
  const seen = {};
  const push = (x, kind, audience, fileKind, placeholder) => {
    const id = S(x.getId());
    if (!id || seen[id]) return;
    seen[id] = true;
    out.things.push({ id: id, name: S(x.getName()), kind: kind, audience: audience,
                      fileKind: fileKind, ref: x, placeholder: !!placeholder });
  };
  const fileAs = (f, kind, audience) => {
    if (S(f.getMimeType()) === FILMS_MIME_DOC) return push(f, kind, audience, 'file', true);
    if (!filmsIsVideo_(f)) { out.skipped++; return; }
    push(f, kind, audience, 'file', false);
  };
  const folderAs = (d, kind, audience) => {
    if (FILMS_RE_EXTRA.test(S(d.getName()))) { out.skipped++; return; }
    push(d, kind, audience, 'folder', false);
  };
  filmsEach_(root.getFiles(), f => fileAs(f, 'film', ''));
  filmsEach_(root.getFolders(), top => {
    const topName = S(top.getName());
    if (FILMS_RE_DOCS.test(topName)) {
      filmsEach_(top.getFiles(), f => fileAs(f, 'documentary', ''));
      filmsEach_(top.getFolders(), d => folderAs(d, 'documentary', ''));
      return;
    }
    const audience = norm(topName).replace(/^notflix\b\s*/, '').trim();
    filmsEach_(top.getFiles(), f => fileAs(f, 'film', audience));
    filmsEach_(top.getFolders(), mid => {
      const n = S(mid.getName());
      if (FILMS_RE_FILMS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'film', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'film', audience));
      } else if (FILMS_RE_TV.test(n)) {
        filmsEach_(mid.getFolders(), d => folderAs(d, 'series', audience));
        /* AN EPISODE LOOSE IN `Tv shows` BELONGS TO NO SHOW, so it is counted and not guessed at. */
        filmsEach_(mid.getFiles(), () => { out.skipped++; });
      } else if (FILMS_RE_DOCS.test(n)) {
        filmsEach_(mid.getFiles(), f => fileAs(f, 'documentary', audience));
        filmsEach_(mid.getFolders(), d => folderAs(d, 'documentary', audience));
      } else {
        out.unknown++;
      }
    });
  });
  return out;
}

/* ---------- ONE THING, LOOKED AT § */
function filmsDescribe_(th, stopAt) {
  const d = { id: th.id, name: th.name, kind: th.kind, audience: th.audience, fileKind: th.fileKind,
              placeholder: th.placeholder, sizeGb: '', seasons: '', episodes: 0, empty: false };
  if (th.placeholder) return d;
  if (th.fileKind === 'file') {
    d.sizeGb = filmsGb_(th.ref.getSize());
    return d;
  }
  const acc = { bytes: 0, videos: 0, seasons: {}, cut: false };
  filmsWalk_(th.ref, 0, acc, 0, stopAt);
  if (acc.cut) return null;
  if (!acc.videos) { d.empty = true; return d; }
  d.sizeGb = filmsGb_(acc.bytes);
  d.episodes = acc.videos;
  if (th.kind === 'series') d.seasons = Object.keys(acc.seasons).length || 1;
  return d;
}
function filmsWalk_(folder, season, acc, depth, stopAt) {
  if (acc.cut) return;
  /* THE CLOCK IS ASKED AT EVERY EPISODE, not once a folder: a show kept flat is sixty episodes in one
     folder, and a check at the door would let it run a minute past the line. */
  const files = folder.getFiles();
  while (files.hasNext()) {
    if (filmsClock_() > stopAt) { acc.cut = true; return; }
    const f = files.next();
    if (!filmsIsVideo_(f)) continue;
    acc.videos++;
    acc.bytes += Number(f.getSize()) || 0;
    const ep = filmsEpisode_(f.getName());
    const s = season || (ep ? ep.season : 0);
    if (s) acc.seasons[s] = true;
  }
  if (depth >= 3) return;
  filmsEach_(folder.getFolders(), sub => {
    const n = S(sub.getName());
    if (FILMS_RE_EXTRA.test(n)) return;
    const m = n.match(FILMS_RE_SEASON);
    filmsWalk_(sub, m ? Number(m[1]) : season, acc, depth + 1, stopAt);
  });
}

/** The address a row opens: a file's viewer, or a series' folder — `file_kind` says which (note 068). */
function filmsUrl_(d) {
  return d.fileKind === 'folder' ? 'https://drive.google.com/drive/folders/' + d.id
                                 : 'https://drive.google.com/file/d/' + d.id + '/view';
}

/* ---------- ONE THING INTO THE TAB § */
function filmsUpsert_(t, d, ctx) {
  const tally = ctx.tally;
  let row = ctx.byId[d.id] || null;
  if (d.empty) {
    if (row && ON_(row.active)) { setCells(t, row, { active: false }); tally.off++; }
    tally.empty++;
    return;
  }
  const named = filmsTitle_(d.name);
  const machine = {
    kind: d.kind, audience: d.audience, drive_name: d.name,
    drive_url: d.placeholder ? '' : filmsUrl_(d),
    file_kind: d.placeholder ? '' : d.fileKind,
    size_gb: d.sizeGb, seasons: d.seasons,
  };
  if (!row) {
    const k = key(named.title);
    row = k ? (ctx.loose.find(r => !r._adopted && key(r.title) === k) || null) : null;
    if (row) { row._adopted = true; machine.drive_id = d.id; tally.adopted++; }
  }
  /* EVERY COLUMN BY NAME, not `Object.assign` over `machine`: `check-columns.js` reads the keys of an
     `addRow` literal, and a row assembled out of variables is a row whose columns no check can see. */
  if (!row) {
    const made = addRow(t, {
      film_id: 'FM' + String(ctx.next++).padStart(3, '0'),
      title: named.title, year: named.year, director: '', lead: '', notes: named.note,
      drive_id: d.id, drive_name: d.name, kind: machine.kind, audience: machine.audience, drive_url: machine.drive_url,
      file_kind: machine.file_kind, size_gb: machine.size_gb, seasons: machine.seasons,
      placeholder: !!d.placeholder, active: true,
    });
    if (made) { ctx.byId[d.id] = made; tally.added++; }
    return;
  }
  const want = Object.assign({}, machine);
  if (TRUE_(row.placeholder) !== !!d.placeholder) want.placeholder = !!d.placeholder;
  if (!TRUE_(row.active)) want.active = true;
  const was = filmsTitle_(row.drive_name);
  const ours = (have, said) => !S(have) || S(have) === S(said);
  if (named.title && ours(row.title, was.title)) want.title = named.title;
  if (ours(row.year, was.year)) want.year = named.year;
  if (ours(row.notes, was.note)) want.notes = named.note;
  if (!S(row.film_id)) want.film_id = 'FM' + String(ctx.next++).padStart(3, '0');
  if (setCells(t, row, want).length) tally.refreshed++;
  ctx.byId[d.id] = row;
}

/* ---------- THE SYNC § */
function filmsSync_(opts) {
  const t0 = filmsClock_();
  const budget = Math.max(1, Number(opts && opts.budgetMs) || FILMS_SYNC_BUDGET_MS);
  const ceiling = FILMS_SYNC_CEILING_MS;
  const root = filmsRoot_();
  if (root.error) return { error: root.error, why: 'folder' };
  const rootId = S(root.folder.getId());

  let list;
  try { list = filmsList_(root.folder); }
  catch (err) { return { error: 'The folder could not be read — ' + S(err && err.message || err), why: 'drive' }; }
  list.things.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));

  const st = filmsState_();
  const resuming = !!S(st.pass) && S(st.root) === rootId;
  const after = resuming ? S(st.after) : '';
  const todo = list.things.filter(x => x.id > after);

  /* ---------- LOOKED AT, UNLOCKED — see the note at the top of this section ---------- */
  const done = [];
  let more = false;
  for (let i = 0; i < todo.length; i++) {
    const now = filmsClock_();
    if (now - t0 > ceiling || (done.length && now - t0 > budget)) { more = true; break; }
    const d = filmsDescribe_(todo[i], t0 + (done.length ? budget : ceiling));
    if (!d) { more = true; break; }
    done.push(d);
  }

  const tally = { added: 0, refreshed: 0, adopted: 0, off: 0, empty: 0 };
  const wroteBefore = POST_WROTE;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — press Sync from Drive again in a minute.', why: 'busy' };
  try {
    /* FRESH ROWS UNDER THE LOCK, `submitAnswer`'s rule: a copy read before it was the copy another run was
       about to change. */
    clearCache();
    const t = read(TAB.films);
    if (!t.sheet) return { error: 'The Ledger has no films tab. Open the site once as an admin.', why: 'tab' };
    const byId = {}, loose = [];
    let top = 0;
    t.rows.forEach(r => {
      const id = S(r.drive_id);
      if (id) byId[id] = r; else loose.push(r);
      const m = S(r.film_id).match(/^FM(\d+)$/);
      if (m) top = Math.max(top, Number(m[1]));
    });
    const ctx = { byId: byId, loose: loose, next: top + 1, tally: tally };
    done.forEach(d => filmsUpsert_(t, d, ctx));

    /* ---------- A WHOLE PASS, AND ONLY A WHOLE PASS, SWITCHES OFF § */
    let warn = '';
    if (!more) {
      if (list.things.length) {
        const listed = {};
        list.things.forEach(x => { listed[x.id] = true; });
        t.rows.forEach(r => {
          const id = S(r.drive_id);
          if (id && !listed[id] && ON_(r.active)) { setCells(t, r, { active: false }); tally.off++; }
        });
      } else {
        warn = ' The folder held nothing a film could be made from, so nothing was switched off.';
      }
    }

    /* WHAT IS IN THE FOLDER, COUNTED FROM THE ROWS THE PASS LEFT ON — so an empty show, which is listed
       and makes no row, is not counted as a series, and a pass done over three runs counts all three. */
    const found = { films: 0, series: 0, documentaries: 0, placeholders: 0 };
    const inFolder = {};
    list.things.forEach(x => { inFolder[x.id] = true; });
    t.rows.forEach(r => {
      if (!inFolder[S(r.drive_id)] || !ON_(r.active)) return;
      if (TRUE_(r.placeholder)) found.placeholders++;
      else if (norm(r.kind) === 'series') found.series++;
      else if (norm(r.kind) === 'documentary') found.documentaries++;
      else found.films++;
    });
    const stamp = new Date(filmsClock_()).toISOString();
    const next = Object.assign({}, st, { root: rootId, folder: root.name, how: root.how });
    if (more) {
      next.pass = resuming ? S(st.pass) : stamp;
      next.after = done.length ? done[done.length - 1].id : after;
    } else {
      next.pass = '';
      next.after = '';
      next.at = stamp;
      next.found = found;
    }
    filmsStateSave_(next);

    const where = root.name + (root.how === 'config' ? ' (the films_folder in config)'
                               : root.how === 'remembered' ? ' (the folder synced before)' : ' (found by its name)');
    const at = list.things.length - todo.length + done.length;
    const message = more
      ? 'Part-way through ' + where + ': ' + at + ' of ' + list.things.length
        + ' looked at. The rest follow on the next run.'
      : 'Synced from ' + where + ': ' + found.films + ' film' + (found.films === 1 ? '' : 's') + ', '
        + found.series + ' series, ' + found.documentaries + ' documentar' + (found.documentaries === 1 ? 'y' : 'ies')
        + (found.placeholders ? ', ' + found.placeholders + ' not uploaded' : '') + '. '
        + tally.added + ' new, ' + tally.refreshed + ' updated, ' + tally.off + ' switched off.' + warn;
    return Object.assign({ done: !more, more: more, folder: root.name, how: root.how, found: found,
                           looked: at, of: list.things.length, skipped: list.skipped, unknown: list.unknown,
                           ms: filmsClock_() - t0, message: message }, tally);
  } finally {
    lock.releaseLock();
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/** Run from the editor's function dropdown (or `?run=syncFilms`): the editor's budget, the same sync. */
function syncFilms() {
  const out = filmsSync_({ budgetMs: FILMS_SYNC_EDITOR_MS });
  const said = out.error ? 'NOT SYNCED — ' + out.error : out.message;
  try { Logger.log(said); } catch (err) {}
  return said;
}


/* ======================== THE LIBRARY'S PRIVATE HALF, IN THE LEDGER (397) ========================
   The repo keeps card metadata; words, answers and figures are rows of four Ledger tabs (LIB_FILES), served a few at a time. */

/* EVERY TEXT CELL STARTS `~`, so the sheet never reads a JSON chunk, an id or a checksum as a number, date or formula. */
const LIB_MARK = '~';
const libCellOut_ = v => LIB_MARK + String(v);
const libCellIn_ = v => { const s = String(v == null ? '' : v); return s.charAt(0) === LIB_MARK ? s.slice(1) : s; };

/* WHICH FILE AN ID ON THE WIRE BELONGS TO: `q:` a question row, `ct:` a content card, `pr:` a practical, `pj:` a project. */
function libDefOf_(typed) {
  const m = /^([a-z]{1,3}):(.+)$/.exec(S(typed));
  if (!m) return null;
  const key = Object.keys(LIB_FILES).filter(k => LIB_FILES[k].prefix === m[1])[0];
  return key ? { key: key, def: LIB_FILES[key], id: m[2] } : null;
}
/* AN ITEM'S ID IN ITS FILE: the id columns joined by `#` (a content card is `TB-GCSE-STATS#3`). */
function libIdOf_(def, row) {
  const parts = def.id.map(c => S(row && row[c]));
  return parts.every(p => p !== '') ? parts.join('#') : '';
}
/* THE PRIVATE FIELDS A ROW HAS, in LIB_FILES order — an empty cell kept as one, so the copy is the row exactly. Null when it has none. */
function libPrivateOf_(def, row) {
  if (!row || (def.skip && S(row[def.skip]))) return null;
  const out = {};
  let any = false;
  def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(row, f)) { out[f] = row[f]; any = true; } });
  return any ? out : null;
}
/* SHA-256 OF THE JSON, base64 — written beside it, and asked again of what the cells give back. */
function libSum_(text) {
  return Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, String(text), Utilities.Charset.UTF_8));
}
function libCells_(json) {
  const parts = [];
  for (let i = 0; i < json.length; i += LIB_CELL) parts.push(json.slice(i, i + LIB_CELL));
  if (!parts.length) parts.push('');
  if (parts.length > LIB_PARTS) throw new Error('an item is ' + json.length + ' characters, more than ' + LIB_PARTS + ' cells hold');
  return parts;
}
/* ONE SHEET ROW FOR ONE ITEM, and back. */
function libRowOut_(item) {
  const parts = libCells_(item.json);
  const row = [libCellOut_(item.id), libCellOut_(item.sum), parts.length];
  for (let i = 0; i < LIB_PARTS; i++) row.push(i < parts.length ? libCellOut_(parts[i]) : '');
  return row;
}
function libRowIn_(cells) {
  const n = Math.max(1, Math.min(LIB_PARTS, Number(cells[2]) || 1));
  let json = '';
  for (let i = 0; i < n; i++) json += libCellIn_(cells[3 + i]);
  return { id: libCellIn_(cells[0]), sum: libCellIn_(cells[1]), json: json };
}
/* THE TAB, MADE WITH ITS HEADER IF IT IS NOT THERE YET — and as tall as `rows` needs, because a range past the grid throws. */
function libSheet_(def, rows) {
  const ss = SpreadsheetApp.openById(LEDGER_ID);
  let sh = ss.getSheetByName(def.tab);
  if (!sh) {
    sh = ss.insertSheet(def.tab);
    sh.appendRow(SCHEMA[def.tab]);
    sh.setFrozenRows(1);
  }
  const need = (rows || 0) + 1;
  if (sh.getMaxRows() < need && typeof sh.insertRowsAfter === 'function') sh.insertRowsAfter(sh.getMaxRows(), need - sh.getMaxRows());
  const wide = 3 + LIB_PARTS;
  if (sh.getMaxColumns() < wide) sh.insertColumnsAfter(sh.getMaxColumns(), wide - sh.getMaxColumns());
  return sh;
}

/* ---------- THE COPY: `library-to-ledger`, a trigger's few minutes at a time ---------- */
const LIB_MIG_KEY = 'LIB_MIGRATION';
/* THE TRIGGER'S HANDLER — public, so a trigger can call it; running it by hand does one more safe step. */
const LIB_STEP_FN = 'libraryCopyStep';
/* A STEP STOPS STARTING NEW WORK AFTER THIS LONG, inside Apps Script's six minutes. */
const LIB_STEP_MS = 4 * 60 * 1000;
const LIB_BATCH = 200;
/* A COPY THAT FAILS ITS CHECK THREE TIMES STOPS AND SAYS SO, rather than copying for ever. */
const LIB_TRIES = 3;

function libMigState_() {
  try { const st = JSON.parse(PropertiesService.getScriptProperties().getProperty(LIB_MIG_KEY) || 'null'); if (st && st.files) return st; } catch (err) {}
  return { files: {} };
}
function libMigSave_(st) { PropertiesService.getScriptProperties().setProperty(LIB_MIG_KEY, JSON.stringify(st)); }
/* READY TO SERVE: every file copied and checked. Until then `libItems` says the copy is still going. */
function libReady_() { return !!libMigState_().done; }
function libProgress_(st) {
  return Object.keys(LIB_FILES).map(k => {
    const f = st.files[k] || {};
    return k + ' ' + (f.verified ? 'checked (' + (f.rows || 0) + ')' : f.total ? (f.next || 0) + ' of ' + f.total + (f.next >= f.total ? ', checking' : '') : 'waiting');
  }).join('; ');
}
/* WHAT THE SETUP CARD SAYS WHILE IT RUNS — a job still copying is waiting, not failed (361's card). */
function libSetupSays_() {
  const st = libMigState_();
  if (st.done) return { working: false, said: 'copied from ' + S(st.commit).slice(0, 7) + ' and checked: ' + libProgress_(st) };
  if (st.stuck) return { working: false, said: 'STOPPED: ' + S(st.error) };
  return { working: true, said: 'copying in the background — ' + libProgress_(st) + (st.error ? ' (last: ' + S(st.error) + ')' : '') };
}

/* THE MIGRATIONS JOB. Cheap, on an admin's page load: it books the step and never copies itself, so nobody waits. Throws
   until the copy is checked, so the job stays pending and is asked again; returns once it is. */
function libMigrate_() {
  const st = libMigState_();
  if (st.done) return libSetupSays_().said;
  if (st.stuck) throw new Error(S(st.error) + ' — fix the cause, then ?run=rerun&arg=library-to-ledger');
  if (!st.beat || Date.now() - Number(st.beat) > 10 * 60 * 1000) libStepBook_();
  throw new Error('copying in the background — ' + libProgress_(st));
}
function libStepUnbook_() {
  try { ScriptApp.getProjectTriggers().forEach(t => { if (t.getHandlerFunction() === LIB_STEP_FN) ScriptApp.deleteTrigger(t); }); } catch (err) {}
}
function libStepBook_() {
  libStepUnbook_();
  ScriptApp.newTrigger(LIB_STEP_FN).timeBased().after(60 * 1000).create();
}

/* THE SOURCE: the file as it was at LIB_SOURCE_COMMIT — every row with a private field, as {id, json, sum}. */
function libSource_(def, fetchText) {
  let text = '';
  try {
    if (fetchText) text = fetchText(def.file);
    else {
      const res = UrlFetchApp.fetch(LIB_SOURCE_RAW + def.file, { muteHttpExceptions: true, followRedirects: true });
      if (res.getResponseCode() !== 200) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' answered ' + res.getResponseCode() };
      text = String(res.getContentText('UTF-8'));
    }
  } catch (err) { return { error: def.file + ' could not be fetched (' + S(err && err.message || err).slice(0, 160) + ')' }; }
  let rows;
  try { rows = JSON.parse(text); } catch (err) { return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' is not whole JSON' }; }
  if (!Array.isArray(rows) || !rows.length) return { error: def.file + ' at ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' has no rows' };
  const items = [], seen = {};
  for (let i = 0; i < rows.length; i++) {
    const content = libPrivateOf_(def, rows[i]);
    if (!content) continue;
    const id = libIdOf_(def, rows[i]);
    if (!id) return { error: def.file + ' row ' + (i + 1) + ' has private fields and no id' };
    if (seen[id]) return { error: def.file + ' has ' + id + ' twice' };
    seen[id] = 1;
    const json = JSON.stringify(content);
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  return { items: items };
}

/* ONE STEP. Writes from where the last step stopped (row 2 + n is item n, always, so writing a row twice writes it the
   same), then reads every row back and checks its id and checksum against the source before the file counts as done. */
function libraryCopyStep() { return libCopy_({}); }
function libCopy_(o) {
  o = o || {};
  const budget = o.budgetMs || LIB_STEP_MS;
  /* `o.clock`, `o.batch`, `o.fetchText`, `o.afterWrite`, `o.noBook`: a check's (check-library-ledger.js) — never a trigger's. */
  const clock = o.clock || (() => Date.now());
  const t0 = clock();
  const st = libMigState_();
  if (st.done) { libStepUnbook_(); return st; }
  /* ONE STEP AT A TIME — a heartbeat younger than a step is a step still running. */
  if (st.running && Date.now() - Number(st.running) < LIB_STEP_MS + 60 * 1000 && !o.force) return { skipped: 'a step is already running' };
  libStepUnbook_();
  st.running = Date.now(); st.beat = Date.now(); delete st.error;
  libMigSave_(st);
  const late = () => clock() - t0 > budget;
  try {
    const keys = Object.keys(LIB_FILES);
    for (let k = 0; k < keys.length && !late(); k++) {
      const key = keys[k], def = LIB_FILES[key];
      const f = st.files[key] || (st.files[key] = { next: 0, checked: 0 });
      if (f.verified) continue;
      const src = libSource_(def, o.fetchText);
      if (src.error) { st.error = src.error; break; }
      /* THE SOURCE CHANGED SHAPE SINCE THE LAST STEP (it cannot at a pinned commit, but a count is cheap to ask). */
      if (f.total && f.total !== src.items.length) { f.next = 0; f.checked = 0; }
      f.total = src.items.length;
      const sh = libSheet_(def, f.total);
      while (f.next < f.total && !late()) {
        const batch = src.items.slice(f.next, f.next + (o.batch || LIB_BATCH));
        sh.getRange(2 + f.next, 1, batch.length, 3 + LIB_PARTS).setValues(batch.map(libRowOut_));
        f.next += batch.length;
        st.beat = Date.now();
        libMigSave_(st);
      }
      if (f.next < f.total) break;
      if (o.afterWrite) o.afterWrite(key);
      /* ROWS UNDER THE COPY, from a longer attempt or a hand, are cleared — the tab is the source's rows and nothing else. */
      const last = sh.getLastRow();
      if (last > 1 + f.total) sh.getRange(2 + f.total, 1, last - 1 - f.total, 3 + LIB_PARTS).clearContent();
      /* THE CHECK, A BATCH AT A TIME AND RESUMABLE: every row's id, its checksum, and the checksum of what its cells hold. */
      let bad = '';
      while (f.checked < f.total && !late() && !bad) {
        const n = Math.min(500, f.total - f.checked);
        const got = sh.getRange(2 + f.checked, 1, n, 3 + LIB_PARTS).getValues();
        for (let i = 0; i < n && !bad; i++) {
          const want = src.items[f.checked + i], have = libRowIn_(got[i]);
          if (have.id !== want.id) bad = 'row ' + (2 + f.checked + i) + ' is ' + have.id + ', not ' + want.id;
          else if (have.sum !== want.sum) bad = want.id + ' has the wrong checksum';
          else if (libSum_(have.json) !== want.sum) bad = want.id + ' does not read back as it was written';
        }
        if (!bad) { f.checked += n; st.beat = Date.now(); libMigSave_(st); }
      }
      if (bad) {
        f.tries = (f.tries || 0) + 1;
        f.next = 0; f.checked = 0;
        st.error = key + ': ' + bad;
        if (f.tries >= LIB_TRIES) st.stuck = true;
        break;
      }
      if (f.checked < f.total) break;
      f.verified = new Date().toISOString();
      f.rows = f.total;
      delete f.tries;
      libMigSave_(st);
    }
    if (keys.every(key => st.files[key] && st.files[key].verified)) {
      st.done = new Date().toISOString();
      st.commit = LIB_SOURCE_COMMIT;
      delete st.error;
      libGenBump_();
      /* WHAT THE SETUP CARD SAYS UNDER THE JOB once it is done (`SAID_<id>`, 379's note). */
      try { PropertiesService.getScriptProperties().setProperty('SAID_library-to-ledger', JSON.stringify({ said: 'copied from ' + LIB_SOURCE_COMMIT.slice(0, 7) + ' and checked: ' + libProgress_(st) })); } catch (err) {}
    }
    return st;
  } finally {
    delete st.running;
    libMigSave_(st);
    if (!st.done && !st.stuck && !o.noBook) { try { libStepBook_(); } catch (err) { st.error = 'the next step could not be booked: ' + S(err && err.message || err); libMigSave_(st); } }
  }
}

/* ---------- SERVING: an item's private fields, by id, from the cache or the tab ---------- */
/* THE GENERATION: bumped when the copy finishes and on every import, so no cache outlives an edit. */
function libGen_() { return S(PropertiesService.getScriptProperties().getProperty('LIB_GEN')) || '0'; }
function libGenBump_() { PropertiesService.getScriptProperties().setProperty('LIB_GEN', String(Date.now())); }
/* A VALUE IS 100KB AT MOST, so anything longer is cut — 30,000 characters is under it even at three bytes a character. */
const LIB_CACHE_CHUNK = 30000;
const LIB_CACHE_S = 21600;
function libCachePut_(cache, key, text) {
  const o = {};
  const n = Math.max(1, Math.ceil(text.length / LIB_CACHE_CHUNK));
  o[key] = String(n);
  for (let i = 0; i < n; i++) o[key + '#' + i] = text.slice(i * LIB_CACHE_CHUNK, (i + 1) * LIB_CACHE_CHUNK);
  try { cache.putAll(o, LIB_CACHE_S); } catch (err) { /* a full cache costs speed, never an answer */ }
}
function libCacheGet_(cache, keys) {
  const out = {};
  let heads = {};
  try { heads = cache.getAll(keys) || {}; } catch (err) { heads = {}; }
  const parts = [];
  keys.forEach(k => { const n = Number(heads[k]) || 0; for (let i = 0; i < n; i++) parts.push(k + '#' + i); });
  let got = {};
  try { got = parts.length ? cache.getAll(parts) || {} : {}; } catch (err) { got = {}; }
  keys.forEach(k => {
    const n = Number(heads[k]) || 0;
    if (!n) return;
    let text = '';
    for (let i = 0; i < n; i++) { const p = got[k + '#' + i]; if (p == null) return; text += p; }
    out[k] = text;
  });
  return out;
}
/* WHERE EACH ID IS: column A read once, kept as {id: row}. */
function libIndex_(def, sh, gen, cache) {
  const key = 'lbi' + gen + ':' + def.tab;
  const had = cache ? libCacheGet_(cache, [key])[key] : null;
  if (had) { try { return JSON.parse(had); } catch (err) {} }
  const last = sh.getLastRow();
  const at = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 1).getValues().forEach((r, i) => { const id = libCellIn_(r[0]); if (id && !at[id]) at[id] = i + 2; });
  if (cache) libCachePut_(cache, key, JSON.stringify(at));
  return at;
}
/* `ids` ARE TYPED (`q:Q-1a`). Returns { items: {typed: content}, missing: [typed] } — missing is an id the tab has no row for. */
function libContent_(ids) {
  const gen = libGen_();
  const cache = CacheService.getScriptCache();
  const items = {}, missing = [];
  const keyOf = t => 'lb' + gen + ':' + t;
  const hit = libCacheGet_(cache, ids.map(keyOf));
  const need = {};
  ids.forEach(t => {
    const text = hit[keyOf(t)];
    if (text != null) { try { items[t] = JSON.parse(text); return; } catch (err) {} }
    const d = libDefOf_(t);
    if (!d) { missing.push(t); return; }
    (need[d.key] = need[d.key] || []).push(d);
  });
  Object.keys(need).forEach(key => {
    const def = LIB_FILES[key];
    const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
    if (!sh) { need[key].forEach(d => missing.push(d.def.prefix + ':' + d.id)); return; }
    const at = libIndex_(def, sh, gen, cache);
    const rows = [];
    need[key].forEach(d => { if (at[d.id]) rows.push({ row: at[d.id], d: d }); else missing.push(def.prefix + ':' + d.id); });
    rows.sort((a, b) => a.row - b.row);
    /* NEIGHBOURS IN ONE READ: a question's parts are rows side by side, so a run of rows is one range. */
    for (let i = 0; i < rows.length; ) {
      let j = i;
      while (j + 1 < rows.length && rows[j + 1].row - rows[j].row <= 3) j++;
      const lo = rows[i].row, hi = rows[j].row;
      const got = sh.getRange(lo, 1, hi - lo + 1, 3 + LIB_PARTS).getValues();
      for (let k = i; k <= j; k++) {
        const t = def.prefix + ':' + rows[k].d.id;
        const have = libRowIn_(got[rows[k].row - lo]);
        let content = null;
        try { content = have.id === rows[k].d.id ? JSON.parse(have.json) : null; } catch (err) { content = null; }
        if (!content) { missing.push(t); continue; }
        items[t] = content;
        libCachePut_(cache, keyOf(t), have.json);
      }
      i = j + 1;
    }
  });
  return { items: items, missing: missing };
}

/* ---------- THE DAY'S CAP: one `lib_log` row per person per London day, its ids so a second look is free ---------- */
const LIB_LOG_IDS_MAX = 45000;
function libCapOf_() {
  let cfg = {};
  try { cfg = config() || {}; } catch (err) { cfg = {}; }
  const cell = S(cfg.library_items_per_day);
  const n = cell === '' ? LIB_DAILY_CAP : Number(cell);
  return isFinite(n) && n >= 0 ? Math.floor(n) : LIB_DAILY_CAP;
}
/* UNDER THE LOCK: which of `ids` this person may have now. Already had today → free; new → counted until the cap. */
function libTally_(me, ids, cap) {
  const pid = S(me.person_id), day = reportDay_(new Date());
  const cache = CacheService.getScriptCache();
  const ckey = 'lbt:' + pid + ':' + day;
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { busy: true };
  const wroteBefore = POST_WROTE;
  try {
    clearCache();
    const t = read(TAB.libLog);
    const row = t.sheet ? t.rows.find(r => S(r.person_id) === pid && reportDay_(r.day) === day) : null;
    const had = row ? S(row.ids).split(',').filter(Boolean) : [];
    let cached = null;
    try { cached = JSON.parse(cache.get(ckey) || 'null'); } catch (err) { cached = null; }
    const seen = {};
    had.concat(cached && Array.isArray(cached.ids) ? cached.ids : []).forEach(id => { seen[id] = 1; });
    let count = Math.max(row ? Number(row.served) || 0 : 0, cached ? Number(cached.n) || 0 : 0, Object.keys(seen).length);
    const before = count;
    const allowed = [], refused = [];
    ids.forEach(id => {
      if (seen[id]) { allowed.push(id); return; }
      if (count >= cap) { refused.push(id); return; }
      seen[id] = 1; count++; allowed.push(id);
    });
    let list = Object.keys(seen).join(',');
    if (list.length > LIB_LOG_IDS_MAX) list = list.slice(0, LIB_LOG_IDS_MAX).replace(/,[^,]*$/, '');
    if (t.sheet && (count !== before || refused.length)) {
      const vals = { served: count, ids: list, refused: (row ? Number(row.refused) || 0 : 0) + refused.length, last_at: new Date() };
      if (row) setCells(t, row, vals);
      else addRow(t, Object.assign({ day: day, person_id: pid, handle: S(me.handle) }, vals));
    }
    try { cache.put(ckey, JSON.stringify({ n: count, ids: list.split(',') }), LIB_CACHE_S); } catch (err) {}
    return { allowed: allowed, refused: refused, left: Math.max(0, cap - count) };
  } finally {
    lock.releaseLock();
    /* NO PAYLOAD CARRIES THE LOG, so the stored payload stands. */
    if (POST_WROTE && !wroteBefore) POST_WROTE = false;
  }
}

/* ---------- THE TOOLS' COPY: out a page at a time, and back in (an admin's, from tools/lib-private.js) ---------- */
const LIB_EXPORT_MAX = 500;
const LIB_IMPORT_MAX = 300;
function libExport_(fileKey, from, count) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName(def.tab);
  if (!sh) return { error: 'There is no ' + def.tab + ' tab yet.' };
  const total = Math.max(0, sh.getLastRow() - 1);
  const a = Math.max(0, Math.floor(Number(from) || 0));
  const n = Math.max(0, Math.min(LIB_EXPORT_MAX, Math.floor(Number(count) || LIB_EXPORT_MAX), total - a));
  const rows = [];
  if (n) sh.getRange(2 + a, 1, n, 3 + LIB_PARTS).getValues().forEach(c => {
    const have = libRowIn_(c);
    if (!have.id) return;
    let content = null;
    try { content = JSON.parse(have.json); } catch (err) { content = null; }
    rows.push({ id: have.id, sum: have.sum, content: content });
  });
  return { success: true, file: S(fileKey), total: total, from: a, rows: rows };
}
/* AN IMPORT REPLACES THE ROW WITH THAT ID, or adds one at the foot. Only the file's private fields, only text and numbers. */
function libImport_(fileKey, rows) {
  const def = LIB_FILES[S(fileKey)];
  if (!def) return { error: 'Which file? One of ' + Object.keys(LIB_FILES).join(', ') + '.' };
  if (!Array.isArray(rows) || !rows.length) return { error: 'No rows sent.' };
  if (rows.length > LIB_IMPORT_MAX) return { error: 'At most ' + LIB_IMPORT_MAX + ' rows at a time.' };
  const items = [];
  for (let i = 0; i < rows.length; i++) {
    const one = rows[i] || {}, id = S(one.id), c = one.content;
    if (!id || id.length > 160) return { error: 'Row ' + (i + 1) + ' has no id.' };
    if (!c || typeof c !== 'object' || Array.isArray(c)) return { error: id + ' has no content object.' };
    const odd = Object.keys(c).filter(k => def.private.indexOf(k) === -1 || (c[k] !== null && typeof c[k] === 'object'));
    if (odd.length) return { error: id + ' carries ' + odd.join(', ') + ' — not a private field of ' + def.file + ', or not text.' };
    const content = {};
    def.private.forEach(f => { if (Object.prototype.hasOwnProperty.call(c, f)) content[f] = c[f]; });
    const json = JSON.stringify(content);
    try { libCells_(json); } catch (err) { return { error: id + ': ' + err.message }; }
    items.push({ id: id, json: json, sum: libSum_(json) });
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    const sh = libSheet_(def, 0);
    const at = libIndex_(def, sh, '', null);
    let foot = Math.max(1, sh.getLastRow());
    let added = 0, replaced = 0;
    items.forEach(it => {
      let row = at[it.id];
      if (row) replaced++;
      else { foot++; row = foot; at[it.id] = row; added++; libSheet_(def, row); }
      sh.getRange(row, 1, 1, 3 + LIB_PARTS).setValues([libRowOut_(it)]);
    });
    libGenBump_();
    return { success: true, file: S(fileKey), added: added, replaced: replaced };
  } finally {
    lock.releaseLock();
  }
}


/* ---------- REELS AND VIDEOS AN ADMIN ADDS FROM THE PHONE (404) ---------- */
const MEDIA_KINDS = ['reel', 'video'];
const MEDIA_YT_RE = /^[A-Za-z0-9_-]{11}$/;
const MEDIA_CAP = { title: 200, channel: 120, subject: 60, tags: 300, vkind: 20, age: 20, notes: 500, url: 300, thumb: 300 };

/* ---------- HOW OLD YOU HAVE TO BE TO WATCH IT (406) ----------
   A minimum age in whole years; blank, 0, U, PG or words = everyone. The cell may say "12+" — the number is what counts. */
const MEDIA_AGE_MAX = 21;
/* AN AGE NOBODY KNOWS: a signed-out visitor or a Student with no date of birth sees 12 and under (406). */
const MEDIA_AGE_UNKNOWN = 12;
function mediaAgeOf_(v) {
  const m = S(v).match(/\d+/);
  return m ? Math.min(MEDIA_AGE_MAX, Number(m[0])) : 0;
}
/* WHOLE YEARS SINCE A PERSON'S DATE OF BIRTH (or an `age` cell), or null when the row says neither. */
function personAge_(r) {
  if (!r) return null;
  const d = dobOut(r.date_of_birth), y = Number(d.dob_y), mo = Number(d.dob_m) || 1, dd = Number(d.dob_d) || 1;
  if (y > 1900) {
    const now = new Date();
    return now.getFullYear() - y - ((now.getMonth() + 1 < mo || (now.getMonth() + 1 === mo && now.getDate() < dd)) ? 1 : 0);
  }
  const a = S(r.age).match(/^\s*(\d{1,3})\s*$/);
  return a ? Number(a[1]) : null;
}
/* THE OLDEST RATING THIS VIEWER MAY SEE: an admin everything; a known age that age; unknown, 12 for nobody or a Student, else everything. */
function mediaAgeCap_(r) {
  if (r && hasRole(r, 'admin')) return Infinity;
  const age = personAge_(r);
  if (age !== null) return age;
  return !r || rankOf(r) === 'student' ? MEDIA_AGE_UNKNOWN : Infinity;
}
/* A ROW TOO OLD FOR THIS VIEWER STILL HIDES A REPOSITORY COPY of the same video, by this hash rather than the id
   (the id alone is the video). FNV-1a of `kind:id`; `mediaVeil_` in games.js is the same sum. */
function mediaVeil_(kind, id) {
  let h = 0x811c9dc5;
  const s = kind + ':' + id;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193) >>> 0; }
  return ('0000000' + h.toString(16)).slice(-8);
}

/* THE ID A PASTED LINK NAMES — watch, shorts, embed, live, youtu.be — or '' for anything else. */
function mediaYtId_(url) {
  const m = S(url).match(/^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?(?:[^#]*&)?v=|shorts\/|embed\/|live\/)|youtube-nocookie\.com\/embed\/|youtu\.be\/)([A-Za-z0-9_-]{11})(?![A-Za-z0-9_-])/i);
  return m ? m[1] : '';
}

function mediaRowOf_(t, kind, id) {
  return t.rows.find(function (r) { return S(r.kind) === kind && S(r.yt_id) === id; }) || null;
}

/* ONE WRITER FOR ALL THREE ACTIONS, under the script lock with the rows read fresh. Returns the reply object. */
function mediaWrite_(action, body) {
  const kind = S(body.kind);
  if (MEDIA_KINDS.indexOf(kind) === -1) return { error: 'Is it a reel or a video? Nothing was saved.' };
  const id = action === 'mediaSave' ? mediaYtId_(body.url) : S(body.id);
  if (!MEDIA_YT_RE.test(id)) return { error: 'That is not a YouTube link. Nothing was saved.' };
  const put = {};
  if (action === 'mediaSave') {
    const too = Object.keys(MEDIA_CAP).filter(function (k) { return S(body[k]).length > MEDIA_CAP[k]; });
    if (too.length) return { error: 'Too long: ' + too.join(', ') + '. Nothing was saved.' };
    if (!S(body.title)) return { error: 'It needs a title. Nothing was saved.' };
    const thumb = S(body.thumb);
    if (thumb && !/^https:\/\/i\.ytimg\.com\//.test(thumb)) return { error: 'The picture must be YouTube\'s own. Nothing was saved.' };
    Object.keys(MEDIA_CAP).forEach(function (k) { put[k] = S(body[k]); });
    /* WHOLE YEARS, OR BLANK FOR EVERYONE (406). */
    put.age = mediaAgeOf_(body.age) ? String(mediaAgeOf_(body.age)) : '';
    put.url = kind === 'reel' ? 'https://youtube.com/shorts/' + id : 'https://www.youtube.com/watch?v=' + id;
    put.hidden = 'FALSE';
  } else if (action === 'mediaHide') {
    put.hidden = body.hidden === false ? 'FALSE' : 'TRUE';
  }
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { error: 'Busy — try again in a moment.', why: 'busy' };
  try {
    clearCache();
    const t = read(TAB.media);
    if (!t.sheet) return { error: 'The media tab is not there yet — open the site once as an admin so setup makes it. Nothing was saved.' };
    const r = mediaRowOf_(t, kind, id);
    const by = S(body.personId), now = new Date();
    if (action === 'mediaDelete') {
      if (!r) return { error: 'Nothing to delete — that one came from the repository. Hide it instead.' };
      if (!delRow(t, r)) return { error: 'The media tab could not be changed — nothing was deleted.' };
    } else if (r) {
      put.updated_on = now;
      setCells(t, r, put);
    } else {
      if (action === 'mediaHide' && put.hidden === 'FALSE') return { error: 'Nothing to show again.' };
      if (!addRow(t, Object.assign({ media_id: kind + ':' + id, kind: kind, yt_id: id, added_by: by, added_on: now, updated_on: now }, put))) {
        return { error: 'The media tab could not be opened — nothing was saved.' };
      }
    }
    try { SpreadsheetApp.flush(); } catch (err) {}
  } finally {
    lock.releaseLock();
  }
  clearCache();
  return { success: true, kind: kind, id: id, media: mediaOut_(Infinity) };
}
