/* ==================================================================================================
   @family. — map.js
   ONE FILE, SPLIT. Every file here shares a single global scope, exactly as before: index.html
   loads them in order and the browser concatenates them. Nothing was renamed, nothing was moved
   between files, and no import/export exists — which is why this split cannot have changed
   behaviour. The only thing that changed is where the newlines are.

   THE ONE RULE, and the only way to break it: a file must not be REORDERED against the others.
   map.js is number 13 of 18. index.html lists them; the list is the order.

   WHAT REPLACES THE COMPILER. Nothing here fails at load if a name is missing — that is the cost
   of plain scripts over modules, and it is paid by check.js, which reads every file and reports
   any name used but never declared. Run it after every change; it is two seconds and it is the
   whole safety net.
================================================================================================== */


/* ---------- WORLDS ---------------------------------------------------------------------------------
   A borough is a world. Not a metaphor stretched to fit — a borough is exactly what an overworld
   world is: a handful of places close enough to walk between, with a name everybody already knows,
   and a boundary somebody else drew.

   ORDERED BY HOW MANY PLACES ARE IN THEM, so the borough you work in most is World 1. Merton has
   the most venues, so Merton is where the map opens — and that stays true on its own as the estate
   changes, rather than because a number was typed somewhere.
--------------------------------------------------------------------------------------------- */
let MAP_WORLD = 0;

function mapWorlds() {
  const by = {};
  mapPlaces().forEach(v => {
    /* A venue with no borough still belongs somewhere. "Elsewhere" rather than a world of its own,
       because one venue is not a world and a map of six one-node worlds is a menu. */
    const w = String(v.borough || v.city || '').trim() || 'Elsewhere';
    (by[w] = by[w] || []).push(v);
  });
  return Object.keys(by).map(name => ({ name, venues: by[name] }))
    .sort((a, b) => b.venues.length - a.venues.length || cmpText(a.name, b.name));
}

/** The world being looked at, clamped — the count changes when a venue is added or moved. */
function mapWorld() {
  const all = mapWorlds();
  if (!all.length) return { name: '', venues: [] };
  /* `|| 0` before the clamp, because NaN passes through Math.min and Math.max unchanged — clamping
     it does nothing at all, and the list is then indexed with it. A guard that cannot fail is
     better here than one that depends on nobody upstream producing a NaN. */
  MAP_WORLD = Math.max(0, Math.min(all.length - 1, Number(MAP_WORLD) || 0));
  return all[MAP_WORLD] || { name: '', venues: [] };
}

/* The places in the world you are looking at. Everything downstream — the projection, the road,
   the terrain — is scoped to one world, so a map of Merton is scaled to Merton rather than to
   every borough at once. */
const mapNodes = () => mapWorld().venues;

/**
 * WHERE EACH NODE SITS, in a 0-100 box.
 *
 * Coordinates are projected against the SPREAD of the venues rather than against London — eleven
 * places inside six miles would otherwise be a cluster of dots in the middle of an empty square.
 * The map is of your estate, so it is scaled to your estate.
 *
 * Latitude is flipped because north is up and y counts down, which is the one arithmetic mistake
 * that makes a map look plausible and be upside down.
 */
function mapLayout() {
  const nodes = mapNodes();
  const placed = nodes.filter(v => Number(v.lat) && Number(v.lng));

  /* NOTHING INVENTED. There used to be a winding fallback path for venues with no coordinates —
     places drawn somewhere they are not, on a map whose entire value is being right about where
     things are. A venue without a postcode is simply not on the map, and the map says how many
     are missing. */

  /* ONE PROJECTION, shared with everything else drawn on this map. Two copies of this arithmetic
     that drifted apart would put the venues in the river. */
  const p = mapProject();
  return nodes.map((v, i) => {
    const la = Number(v.lat), ln = Number(v.lng);
    if (!la || !ln || !p) return { v, real: false };
    return { v, real: true, x: p.x(ln), y: p.y(la) };
  }).filter(n => n.real);
}

/**
 * WHERE A COORDINATE LANDS IN THE BOX, and the only place that decides it.
 *
 * Scaled to the SPREAD of the venues rather than to London — eleven places inside six miles would
 * otherwise be a cluster of dots in an empty square. The map is of your estate, so it is scaled to
 * your estate; the river and everything else is projected through this same function so it cannot
 * disagree with where the nodes are.
 */
function mapProject() {
  const placed = mapNodes().filter(v => Number(v.lat) && Number(v.lng));
  /* ONE VENUE IS STILL A WORLD. This refused anything under two, on the reasoning that a single
     point has no spread to scale by — true, and the wrong conclusion: Richmond and Sutton have one
     venue each, so both came out with no ground at all, no roads and no parks, which reads as a
     borough nobody has mapped rather than as a borough with one library in it.
     A single point has no spread but it does have a PLACE, and the minimum reach below supplies
     the rest. */
  if (!placed.length) return null;
  const lats = placed.map(v => Number(v.lat)), lngs = placed.map(v => Number(v.lng));
  const lo = { la: Math.min(...lats), ln: Math.min(...lngs) };
  const hi = { la: Math.max(...lats), ln: Math.max(...lngs) };
  /* A SPREAD OF ZERO IS ZERO. It used to fall back to 1 — a guard against dividing by nothing,
     from when the two axes were scaled independently and a zero would have. One degree is a
     hundred kilometres, so a world with a single venue in it came out scaled to most of southern
     England and drew every park in the file.
     Nothing divides by this any more, and the floor under `reach` below is what stops a zero
     spread collapsing the map. A guard that is no longer guarding anything is just a wrong
     number. */
  const span = { la: hi.la - lo.la, ln: hi.ln - lo.ln };
  /* ONE SCALE FOR BOTH AXES. They were stretched independently to fill the box, which is why
     Richmond Park came out as a long thin slab and the roads met at angles they do not meet at:
     the map was being squeezed differently across than down. A map with two scales is not a map.

     And PADDED, generously. The venues used to touch the edges, so half the terrain around them
     was clipped off and the nodes had nothing to sit among. A world wants room around it. */
  const mid = { la: (lo.la + hi.la) / 2, ln: (lo.ln + hi.ln) / 2 };
  /* Longitude compresses with latitude — a degree east is about 0.62 of a degree north up here —
     so the two have to be brought to the same units before one scale can serve both. */
  const K = Math.cos(mid.la * Math.PI / 180);
  /* HOW MUCH WORLD AROUND THE VENUES. 1.9 was too tight — the three Merton libraries are all in
     the east of the borough, so a map scaled to them stopped short of Wimbledon Common, which is
     the most recognisable thing in Merton. An overworld is mostly scenery with a path through it;
     the path should not fill the frame. */
  /* AND A FLOOR UNDER IT. Two venues a few streets apart — York Gardens and Battersea Reach are
     barely a mile — would otherwise scale the map to a mile across, so the world is two dots and
     the corner of one park. About three miles is the least that shows a borough: near enough to
     recognise the streets, far enough to hold the commons.
     0.045 degrees of latitude is roughly five kilometres. */
  /* AND A FLOOR UNDER IT — applied AFTER the multiplier, not before. Before it, the minimum was
     multiplied too and every world came out thirteen kilometres across, which is most of south
     London: Richmond's map showed Sutton's parks and Merton's showed everybody's.
     0.040 degrees of latitude is about four and a half kilometres, which is the least that reads
     as a borough — near enough to recognise the streets, wide enough to hold the commons. */
  const reach = Math.max(Math.max(span.la, span.ln * K) * 2.6, 0.040);
  const scale = 100 / reach;
  return {
    x: ln => 50 + (ln - mid.ln) * K * scale,
    /* Flipped: north is up, y counts down. */
    y: la => 50 - (la - mid.la) * scale,
  };
}

/* ---------- THE GROUND ----------------------------------------------------------------------------
   Rivers, roads and greenery — and only one of the three is real.

   NO TABLE, and that is the decision worth explaining. A terrain tab means somebody typing a grid
   of tiles into a spreadsheet: hours of work for something nobody examines closely, wrong the day a
   venue moves, and a second description of a place the venues already describe. Real map data —
   OpenStreetMap — gives proper parks and streets at the cost of a large fetch, an attribution, and
   a map that is ACCURATE rather than LEGIBLE. An overworld is not trying to be right about London.
   It is trying to be readable at a glance.

   So the ground is ROLLED FROM A SEED, the same trick as the sticky notes and the reel
   backgrounds: same venues, same world, for ever. Nobody maintains it and it cannot go stale.

   THE RIVER IS THE EXCEPTION, because it is the one feature that makes a map of London
   recognisable, and because York Gardens sits on it. Approximate — eleven points rather than a
   survey — which is the right amount of truth for a map whose venues are drawn as circles.
--------------------------------------------------------------------------------------------- */

/* ---------- THE REAL GROUND ---------------------------------------------------------------------
   Approximate, and deliberately so. Every figure below is the rough centre or corridor of a thing
   that is genuinely there — not a survey. On a map whose venues are drawn as circles a few hundred
   metres of error is invisible, and the alternative was a seeded texture that looked like terrain
   and meant nothing.

   BIG THINGS ONLY. The streets of south London are thousands of lines and would read as grey
   noise; its parks include every square and green. What is here is what somebody would name if you
   asked them what is around Merton: the commons, the royal parks, and the four roads everything
   else hangs off.
--------------------------------------------------------------------------------------------- */

/* THE WANDLE. It matters more than the Thames in World 1 — it runs the length of Merton, through
   Morden Hall Park and right past Colliers Wood, and it is why the borough is where it is. */
const WANDLE = [
  /* IT RISES IN SUTTON. The line used to start at Beddington, which is a mile north-east of where
     the river actually begins — so a map of Sutton had no water on it at all, in the borough the
     Wandle comes from. Carshalton Ponds and the Croydon arm are where it starts. */
  [51.3665, -0.1665], [51.3702, -0.1560], [51.3742, -0.1480],
  [51.3780, -0.1440], [51.3900, -0.1560], [51.3990, -0.1680], [51.4040, -0.1740],
  [51.4120, -0.1770], [51.4185, -0.1795], [51.4270, -0.1840], [51.4400, -0.1900],
  [51.4530, -0.1930], [51.4620, -0.1930], [51.4690, -0.1920],
];

/* THE BEVERLEY BROOK, down the west side of Wimbledon Common and Richmond Park to the Thames at
   Barnes — the boundary between two worlds and the reason the common ends where it does. */
const BEVERLEY = [
  [51.4180, -0.2560], [51.4270, -0.2500], [51.4360, -0.2470], [51.4450, -0.2450],
  [51.4560, -0.2440], [51.4660, -0.2430], [51.4720, -0.2450],
];

/* THE CRANE, through Twickenham to the Thames at Isleworth. */
const CRANE = [
  [51.4380, -0.3700], [51.4420, -0.3600], [51.4470, -0.3480], [51.4530, -0.3380],
  [51.4600, -0.3320], [51.4680, -0.3280],
];

/* The Thames, west to east: Richmond, Kew, Barnes, Putney, Wandsworth, Battersea, Vauxhall. */
const THAMES = [
  [51.4520, -0.3160], [51.4660, -0.2880], [51.4810, -0.2870], [51.4880, -0.2600],
  [51.4750, -0.2400], [51.4670, -0.2160], [51.4690, -0.1920], [51.4810, -0.1740],
  [51.4840, -0.1550], [51.4870, -0.1250], [51.5080, -0.1180],
];

/* ---------- THE GROUND ----------------------------------------------------------------------------
   Green and roads, and nothing else. No trees, no landmarks, no buildings but the venues — those
   were detail piled on a floor that was not right yet, and detail on a wrong floor is what made the
   board unreadable.

   OUTLINES, PROPERLY. Every green below is a real boundary walked round in eight to fourteen
   points, not a rectangle standing in for one: Wimbledon Common has its long west edge on Beverley
   Brook and its straight east side on Parkside, Morden Hall Park is the thin strip the Wandle runs
   down, Mitcham Common is the wedge the tram cuts through. Those shapes are what make a place
   recognisable from above — a box says only that something is there.

   ROADS ARE CARRIAGEWAYS, not hairlines. Drawn the way every road map draws them: a dark casing
   with a lighter fill on top, so a road has EDGES. A one-pixel stroke is a wire diagram.

   Accurate to a hundred metres or so, which is the limit of what can be written down without a
   survey and more than enough at this size.
--------------------------------------------------------------------------------------------- */
const PARKS = [
  /* Wimbledon Common with Putney Heath: the great block west of Parkside, bounded north by Roehampton,
     west by Beverley Brook, south by Camp Road and the Village. */
  ['Wimbledon Common', [
    [51.4472, -0.2402], [51.4468, -0.2268], [51.4430, -0.2222], [51.4372, -0.2210],
    [51.4318, -0.2232], [51.4288, -0.2280], [51.4262, -0.2340], [51.4266, -0.2430],
    [51.4310, -0.2478], [51.4382, -0.2492], [51.4440, -0.2458]]],

  /* Wimbledon Park: the lake and golf course between the railway and Arthur Road. */
  ['Wimbledon Park', [
    [51.4418, -0.2118], [51.4412, -0.2022], [51.4372, -0.1988], [51.4330, -0.2004],
    [51.4326, -0.2078], [51.4358, -0.2124]]],

  /* Morden Hall Park: the strip the Wandle runs down, between Morden Road and the tram. */
  ['Morden Hall Park', [
    [51.4072, -0.1802], [51.4064, -0.1710], [51.4030, -0.1668], [51.3994, -0.1676],
    [51.3986, -0.1746], [51.4012, -0.1800], [51.4044, -0.1818]]],

  /* Mitcham Common: the wedge east of the town, cut through by the tram and the A236. */
  ['Mitcham Common', [
    [51.4018, -0.1596], [51.4004, -0.1452], [51.3960, -0.1362], [51.3898, -0.1348],
    [51.3862, -0.1428], [51.3872, -0.1538], [51.3928, -0.1604], [51.3980, -0.1622]]],

  /* Cannon Hill Common, south-west Merton. */
  ['Cannon Hill Common', [
    [51.3986, -0.2160], [51.3980, -0.2072], [51.3936, -0.2058], [51.3928, -0.2140],
    [51.3954, -0.2178]]],

  /* Figge's Marsh, on the London Road between Mitcham and Tooting. */
  ["Figge's Marsh", [
    [51.4106, -0.1668], [51.4100, -0.1594], [51.4062, -0.1588], [51.4058, -0.1662]]],

  /* Ravensbury Park, further down the Wandle. */
  ['Ravensbury Park', [
    [51.3978, -0.1836], [51.3972, -0.1758], [51.3944, -0.1752], [51.3940, -0.1832]]],

  /* Cricket Green, the middle of old Mitcham. */
  ['Cricket Green', [
    [51.4010, -0.1740], [51.4006, -0.1678], [51.3980, -0.1674], [51.3978, -0.1738]]],

  /* Dundonald Recreation Ground, between Wimbledon and Merton Park. */
  ['Dundonald Rec', [
    [51.4198, -0.2116], [51.4194, -0.2058], [51.4166, -0.2054], [51.4164, -0.2114]]],

  /* Joseph Hood Recreation Ground, Raynes Park. */
  ['Joseph Hood Rec', [
    [51.4076, -0.2280], [51.4070, -0.2196], [51.4038, -0.2192], [51.4034, -0.2276]]],

  /* King George's Park, along the Wandle in Wandsworth. */
  ["King George's Park", [
    [51.4498, -0.1930], [51.4490, -0.1868], [51.4404, -0.1856], [51.4396, -0.1924]]],

  /* Garratt Park, Earlsfield. */
  ['Garratt Park', [
    [51.4336, -0.1876], [51.4330, -0.1810], [51.4300, -0.1806], [51.4296, -0.1874]]],

  /* Tooting Bec and Tooting Graveney Commons, the pair either side of Dr Johnson Avenue. */
  ['Tooting Common', [
    [51.4378, -0.1610], [51.4370, -0.1440], [51.4300, -0.1408], [51.4248, -0.1450],
    [51.4256, -0.1580], [51.4318, -0.1626]]],

  /* Wandsworth Common. */
  ['Wandsworth Common', [
    [51.4526, -0.1786], [51.4518, -0.1638], [51.4448, -0.1600], [51.4400, -0.1648],
    [51.4406, -0.1758], [51.4470, -0.1804]]],

  /* ---- WANDSWORTH ------------------------------------------------------------------------- */

  /* Clapham Common: the triangle between the three roads that bound it. */
  ['Clapham Common', [
    [51.4672, -0.1552], [51.4666, -0.1392], [51.4602, -0.1362], [51.4562, -0.1444],
    [51.4586, -0.1544], [51.4638, -0.1580]]],

  /* Battersea Park, along the river between the two bridges. */
  ['Battersea Park', [
    [51.4838, -0.1636], [51.4830, -0.1486], [51.4772, -0.1478], [51.4762, -0.1620],
    [51.4796, -0.1652]]],

  /* Wandsworth Park, the riverside strip below the Putney bridge road. */
  ['Wandsworth Park', [
    [51.4692, -0.2126], [51.4686, -0.2036], [51.4660, -0.2030], [51.4664, -0.2124]]],

  /* Putney Heath, the northern half of the common, above the Tibbet's Corner road. */
  ['Putney Heath', [
    [51.4552, -0.2360], [51.4548, -0.2216], [51.4482, -0.2196], [51.4446, -0.2268],
    [51.4478, -0.2372]]],

  /* Fishponds Fields and Springfield, either side of the Wandle at Garratt Lane. */
  ['Fishponds Fields', [
    [51.4386, -0.1948], [51.4380, -0.1876], [51.4344, -0.1872], [51.4340, -0.1944]]],

  /* Furzedown and Streatham Vale playing fields, the far side of Tooting. */
  ['Furzedown Rec', [
    [51.4278, -0.1428], [51.4272, -0.1352], [51.4240, -0.1348], [51.4236, -0.1424]]],

  /* Battersea Fields and Christchurch Gardens, behind the park. */
  ['Christchurch Gardens', [
    [51.4744, -0.1690], [51.4740, -0.1624], [51.4714, -0.1620], [51.4710, -0.1686]]],

  /* Falcon Park and Latchmere Recreation Ground, Clapham Junction. */
  ['Latchmere Rec', [
    [51.4688, -0.1712], [51.4684, -0.1650], [51.4658, -0.1646], [51.4654, -0.1708]]],

  /* Heathbrook Park, off the Wandsworth Road. */
  ['Heathbrook Park', [
    [51.4708, -0.1416], [51.4704, -0.1358], [51.4682, -0.1354], [51.4678, -0.1412]]],

  /* Roehampton and Dover House, west of the heath. */
  ['Dover House Park', [
    [51.4562, -0.2492], [51.4556, -0.2412], [51.4520, -0.2408], [51.4516, -0.2488]]],

  /* Barnes Common, over the river on the Wandsworth side of the bend. */
  ['Barnes Common', [
    [51.4728, -0.2462], [51.4720, -0.2334], [51.4664, -0.2318], [51.4652, -0.2440],
    [51.4690, -0.2482]]],

  /* ---- RICHMOND -------------------------------------------------------------------------- */

  /* Richmond Park: the biggest thing for miles, and the shape of a Richmond world. */
  ['Richmond Park', [
    [51.4586, -0.2926], [51.4570, -0.2740], [51.4506, -0.2566], [51.4414, -0.2506],
    [51.4322, -0.2540], [51.4262, -0.2668], [51.4276, -0.2846], [51.4362, -0.2966],
    [51.4478, -0.3006], [51.4548, -0.2988]]],

  /* Kew Gardens, between the river and Kew Road. */
  ['Kew Gardens', [
    [51.4856, -0.3018], [51.4842, -0.2872], [51.4772, -0.2856], [51.4738, -0.2934],
    [51.4772, -0.3030], [51.4826, -0.3054]]],

  /* Old Deer Park and the Royal Mid-Surrey, north of Richmond town. */
  ['Old Deer Park', [
    [51.4762, -0.3106], [51.4752, -0.3010], [51.4692, -0.3006], [51.4686, -0.3110]]],

  /* Richmond Green, the square in the middle of the town. */
  ['Richmond Green', [
    [51.4622, -0.3084], [51.4620, -0.3026], [51.4594, -0.3024], [51.4592, -0.3082]]],

  /* Marble Hill Park, over the river at Twickenham. */
  ['Marble Hill Park', [
    [51.4490, -0.3244], [51.4484, -0.3160], [51.4452, -0.3156], [51.4448, -0.3242]]],

  /* Ham Common and Ham Lands, south of the town. */
  ['Ham Common', [
    [51.4436, -0.3078], [51.4428, -0.2972], [51.4374, -0.2964], [51.4368, -0.3072]]],

  /* Bushy Park, the other royal park, across the Thames at Hampton. */
  ['Bushy Park', [
    [51.4188, -0.3452], [51.4176, -0.3272], [51.4084, -0.3238], [51.4026, -0.3330],
    [51.4062, -0.3466], [51.4136, -0.3496]]],

  /* East Sheen Common and Palewell, on the Richmond Park boundary. */
  ['East Sheen Common', [
    [51.4636, -0.2618], [51.4630, -0.2528], [51.4592, -0.2522], [51.4586, -0.2612]]],

  /* Terrace Gardens and Petersham Meadows, the slope down to the river. */
  ['Terrace Gardens', [
    [51.4560, -0.3040], [51.4556, -0.2966], [51.4526, -0.2962], [51.4522, -0.3036]]],

  /* Twickenham Green, over the bridge. */
  ['Twickenham Green', [
    [51.4472, -0.3396], [51.4468, -0.3330], [51.4442, -0.3326], [51.4438, -0.3392]]],

  /* Crane Park, along the river Crane towards Hanworth. */
  ['Crane Park', [
    [51.4414, -0.3690], [51.4408, -0.3556], [51.4374, -0.3550], [51.4368, -0.3684]]],

  /* Ham Lands, the meadows south of the town on the river bend. */
  ['Ham Lands', [
    [51.4442, -0.3168], [51.4436, -0.3094], [51.4380, -0.3088], [51.4374, -0.3162]]],

  /* Kew Green, between the bridge and the gardens. */
  ['Kew Green', [
    [51.4874, -0.2892], [51.4870, -0.2834], [51.4848, -0.2830], [51.4844, -0.2888]]],

  /* ---- SUTTON ---------------------------------------------------------------------------- */

  /* Nonsuch Park, on the Sutton and Epsom boundary. */
  ['Nonsuch Park', [
    [51.3676, -0.2438], [51.3668, -0.2276], [51.3600, -0.2258], [51.3566, -0.2350],
    [51.3606, -0.2452], [51.3652, -0.2470]]],

  /* Cheam Park, west of the town. */
  ['Cheam Park', [
    [51.3620, -0.2214], [51.3614, -0.2126], [51.3576, -0.2120], [51.3572, -0.2210]]],

  /* Sutton Green, the top of the High Street. */
  ['Sutton Green', [
    [51.3702, -0.1972], [51.3700, -0.1912], [51.3676, -0.1910], [51.3674, -0.1970]]],

  /* Rosehill Park, on the A217 between Morden and Sutton. */
  ['Rosehill Park', [
    [51.3878, -0.1930], [51.3872, -0.1846], [51.3830, -0.1840], [51.3826, -0.1926]]],

  /* Carshalton Park and the ponds. */
  ['Carshalton Park', [
    [51.3654, -0.1662], [51.3648, -0.1580], [51.3608, -0.1576], [51.3604, -0.1658]]],

  /* Beddington Park, along the Wandle towards Croydon. */
  ['Beddington Park', [
    [51.3760, -0.1420], [51.3752, -0.1290], [51.3702, -0.1284], [51.3698, -0.1414]]],

  /* The Oaks, on the downs at the southern edge. */
  ['Oaks Park', [
    [51.3392, -0.1966], [51.3384, -0.1866], [51.3336, -0.1860], [51.3330, -0.1960]]],

  /* Manor Park, behind the High Street. */
  ['Manor Park', [
    [51.3644, -0.1908], [51.3640, -0.1848], [51.3616, -0.1844], [51.3612, -0.1904]]],

  /* Overton Park and Sutton Common, north of the town. */
  ['Sutton Common', [
    [51.3812, -0.2018], [51.3806, -0.1930], [51.3768, -0.1924], [51.3762, -0.2012]]],

  /* The Grove, Carshalton, and the ponds at the top of the Wandle. */
  ['The Grove', [
    [51.3684, -0.1690], [51.3680, -0.1626], [51.3656, -0.1622], [51.3652, -0.1686]]],

  /* Cuddington Recreation Ground, Worcester Park end. */
  ['Cuddington Rec', [
    [51.3762, -0.2258], [51.3756, -0.2184], [51.3726, -0.2180], [51.3720, -0.2254]]],

  /* Roundshaw Downs, on the old aerodrome towards Croydon. */
  ['Roundshaw Downs', [
    [51.3548, -0.1352], [51.3542, -0.1240], [51.3496, -0.1234], [51.3490, -0.1346]]],

  /* Wandle Park and Butter Hill, where the river starts. */
  ['Wandle Park', [
    [51.3730, -0.1614], [51.3726, -0.1548], [51.3702, -0.1544], [51.3698, -0.1610]]],

  /* Belmont and Banstead Downs, the chalk at the very bottom. */
  ['Banstead Downs', [
    [51.3452, -0.2088], [51.3446, -0.1946], [51.3382, -0.1938], [51.3376, -0.2080]]],
];

/* ---------- BUILDINGS ------------------------------------------------------------------------------
   The ones you would use to say where you are, and nothing else.

   NOT EVERY BUILDING. A borough is tens of thousands of footprints; drawn at this size they are
   grey noise, and fetching them would be megabytes for a texture. What is here is what somebody
   would name — the tower, the station, the shopping centre, the hospital, the stadium — which is
   what a landmark IS: a building whose name locates you.

   `size` is roughly how big it is on the ground, in metres, so the Power Station is not the same
   square as a station entrance. Positions are to about fifty metres.
--------------------------------------------------------------------------------------------- */
const BUILDINGS = [
  /* ---- MERTON ---------------------------------------------------------------------------- */
  ['Colliers Wood Tower',   51.4185, -0.1772, 'tower',   40],
  ['Tandem Centre',         51.4145, -0.1810, 'retail', 140],
  ['Merton Abbey Mills',    51.4166, -0.1795, 'civic',    70],
  ['Colliers Wood Stn',     51.4180, -0.1780, 'station',  40],
  ['Centre Court',          51.4222, -0.2070, 'retail',  110],
  ['Wimbledon Station',     51.4214, -0.2064, 'station',  90],
  ['Wimbledon Theatre',     51.4196, -0.2044, 'civic',    60],
  ['All England Club',      51.4340, -0.2140, 'sport',   240],
  ['Plough Lane',           51.4318, -0.1885, 'sport',   120],
  ['Morden Station',        51.4022, -0.1948, 'station',  60],
  ['Merton Civic Centre',   51.4014, -0.1944, 'civic',    90],
  ['Mitcham Junction',      51.3960, -0.1590, 'station',  50],
  ['Deen City Farm',        51.4108, -0.1846, 'civic',    70],

  /* ---- WANDSWORTH ------------------------------------------------------------------------ */
  ['Battersea Power Stn',   51.4816, -0.1440, 'civic',   250],
  ['Clapham Junction',      51.4646, -0.1706, 'station', 140],
  ['Southside Centre',      51.4570, -0.1918, 'retail',  150],
  ['Wandsworth Town Hall',  51.4570, -0.1888, 'civic',    80],
  ['Wandsworth Prison',     51.4514, -0.1770, 'civic',   180],
  ["St George's Hospital",  51.4266, -0.1740, 'civic',   220],
  ['Battersea Arts Centre', 51.4640, -0.1662, 'civic',    70],
  ['Wandsworth Town Stn',   51.4610, -0.1880, 'station',  60],
  ['Putney Station',        51.4610, -0.2166, 'station',  60],
  ['Balham Station',        51.4432, -0.1524, 'station',  50],

  /* ---- RICHMOND -------------------------------------------------------------------------- */
  ['Richmond Station',      51.4632, -0.3016, 'station',  90],
  ['Richmond Theatre',      51.4620, -0.3034, 'civic',    60],
  ['Richmond Riverside',    51.4590, -0.3062, 'civic',    90],
  ['Twickenham Stadium',    51.4560, -0.3416, 'sport',   250],
  ['Kew Palace',            51.4842, -0.2952, 'civic',    60],
  ['Ham House',             51.4468, -0.3106, 'civic',    70],
  ['Marble Hill House',     51.4470, -0.3200, 'civic',    50],
  ['Twickenham Station',    51.4498, -0.3352, 'station',  60],
  ['Kew Bridge',            51.4884, -0.2878, 'station',  50],

  /* ---- SUTTON ---------------------------------------------------------------------------- */
  ['Sutton Station',        51.3600, -0.1918, 'station',  80],
  ['St Nicholas Centre',    51.3628, -0.1936, 'retail',  120],
  ['Sutton Civic Offices',  51.3618, -0.1948, 'civic',    80],
  ['Royal Marsden',         51.3542, -0.1968, 'civic',   180],
  ['Honeywood Museum',      51.3666, -0.1672, 'civic',    40],
  ['Carshalton Station',    51.3684, -0.1660, 'station',  50],
  ['Nonsuch Mansion',       51.3616, -0.2346, 'civic',    60],
  ['Whitehall Cheam',       51.3596, -0.2192, 'civic',    40],
  ['Wallington Station',    51.3602, -0.1462, 'station',  50],
];

/* THE MAIN ROADS, each walked through the places it actually goes. `w` is how wide it is drawn —
   an A-road is not a residential street and a tram is neither. */
const ROADS = [
  /* A24 — Tooting Broadway, Colliers Wood, South Wimbledon, Morden, and on towards Sutton. The
     spine of the borough: three of the venues sit on it. */
  ['A24 London Road', 'a', 3.2, [
    [51.4432, -0.1520], [51.4340, -0.1600], [51.4272, -0.1676], [51.4224, -0.1738],
    [51.4180, -0.1782], [51.4152, -0.1888], [51.4120, -0.1922], [51.4022, -0.1948],
    [51.3930, -0.1936], [51.3860, -0.1930]]],

  /* A219 — Parkside down Wimbledon Hill into the town, then Merton Road to meet the A24. */
  ['A219 Wimbledon Hill', 'a', 2.6, [
    [51.4462, -0.2276], [51.4380, -0.2268], [51.4330, -0.2258], [51.4288, -0.2172],
    [51.4244, -0.2100], [51.4214, -0.2064], [51.4188, -0.2010], [51.4160, -0.1948],
    [51.4152, -0.1888]]],

  /* A238 — Kingston Road, Wimbledon out through Raynes Park. */
  ['A238 Kingston Road', 'a', 2.2, [
    [51.4196, -0.2072], [51.4158, -0.2154], [51.4118, -0.2244], [51.4076, -0.2334],
    [51.4040, -0.2426]]],

  /* A236 — Christchurch Road and Church Road, Colliers Wood down to Mitcham and on to Croydon. */
  ['A236 Church Road', 'a', 2.4, [
    [51.4180, -0.1782], [51.4120, -0.1728], [51.4062, -0.1690], [51.4014, -0.1668],
    [51.3962, -0.1592], [51.3922, -0.1500]]],

  /* A217 — Morden down through Rose Hill to Sutton. */
  ['A217 Rose Hill', 'a', 2.2, [
    [51.4022, -0.1948], [51.3946, -0.1938], [51.3862, -0.1930], [51.3780, -0.1938]]],

  /* A297 — Bishopsford Road, Mitcham across to St Helier. */
  ['A297 Bishopsford Road', 'a', 1.8, [
    [51.4014, -0.1668], [51.3960, -0.1742], [51.3918, -0.1816], [51.3888, -0.1892]]],

  /* A3 — the trunk road along the north-west edge, Wandsworth out to Kingston. */
  ['A3 Kingston Bypass', 'a', 3.2, [
    [51.4602, -0.1930], [51.4536, -0.2118], [51.4462, -0.2276], [51.4372, -0.2400],
    [51.4262, -0.2528], [51.4150, -0.2668]]],

  /* A205 — the South Circular, across the top. */
  ['A205 South Circular', 'a', 2.8, [
    [51.4652, -0.2668], [51.4618, -0.2270], [51.4570, -0.1972], [51.4536, -0.1730],
    [51.4520, -0.1490]]],

  /* THE NORTHERN LINE, which is how most people arrive: Tooting Broadway, Colliers Wood,
     South Wimbledon, Morden. */
  ['Northern line', 'rail', 1.4, [
    [51.4272, -0.1676], [51.4180, -0.1782], [51.4152, -0.1920], [51.4022, -0.1948]]],

  /* TRAMLINK, Wimbledon out across Mitcham Common towards Croydon. */
  ['Tramlink', 'tram', 1.2, [
    [51.4214, -0.2064], [51.4160, -0.1990], [51.4092, -0.1900], [51.4022, -0.1802],
    [51.3980, -0.1700], [51.3958, -0.1592], [51.3920, -0.1462]]],

  /* ---- WANDSWORTH ------------------------------------------------------------------------- */

  /* A214 Trinity Road, straight up the side of Wandsworth Common to Tooting. */
  ['A214 Trinity Road', 'a', 2.4, [
    [51.4570, -0.1706], [51.4506, -0.1682], [51.4436, -0.1652], [51.4368, -0.1620],
    [51.4300, -0.1636]]],

  /* A3205 York Road and Battersea Park Road, the whole river frontage. */
  ['A3205 York Road', 'a', 2.6, [
    [51.4644, -0.2038], [51.4650, -0.1866], [51.4700, -0.1760], [51.4744, -0.1608],
    [51.4762, -0.1470], [51.4790, -0.1338]]],

  /* A3220 Latchmere Road, up over Battersea Bridge. */
  ['A3220 Latchmere Road', 'a', 2.2, [
    [51.4844, -0.1682], [51.4762, -0.1650], [51.4690, -0.1622], [51.4622, -0.1602]]],

  /* A3036 Wandsworth Road, Vauxhall out to the one-way system. */
  ['A3036 Wandsworth Road', 'a', 2.4, [
    [51.4856, -0.1244], [51.4738, -0.1436], [51.4652, -0.1610], [51.4598, -0.1786],
    [51.4586, -0.1930]]],

  /* A217 Wandsworth Bridge Road, over the river to Fulham. */
  ['A217 Wandsworth Bridge Road', 'a', 2.2, [
    [51.4726, -0.1878], [51.4676, -0.1888], [51.4622, -0.1902], [51.4570, -0.1918]]],

  /* A306 Roehampton Lane, the heath down to the Upper Richmond Road. */
  ['A306 Roehampton Lane', 'a', 2.2, [
    [51.4716, -0.2382], [51.4640, -0.2406], [51.4558, -0.2430], [51.4482, -0.2444]]],

  /* A24 Balham High Road, Clapham South down to Tooting. */
  ['A24 Balham High Road', 'a', 2.6, [
    [51.4526, -0.1478], [51.4444, -0.1524], [51.4370, -0.1580], [51.4300, -0.1638]]],

  /* B237 Garratt Lane, the whole Wandle valley from Wandsworth to Tooting. */
  ['B237 Garratt Lane', 'b', 1.6, [
    [51.4574, -0.1900], [51.4478, -0.1866], [51.4380, -0.1836], [51.4292, -0.1780],
    [51.4258, -0.1728]]],

  /* THE DISTRICT LINE, Putney Bridge across to Wimbledon. */
  ['District line', 'rail', 1.4, [
    [51.4682, -0.2088], [51.4610, -0.2160], [51.4520, -0.2210], [51.4420, -0.2200],
    [51.4318, -0.2130], [51.4214, -0.2064]]],

  /* ---- RICHMOND -------------------------------------------------------------------------- */

  /* A316 Chertsey Road, the trunk road out over Twickenham Bridge. */
  ['A316 Chertsey Road', 'a', 3.0, [
    [51.4726, -0.2680], [51.4692, -0.2872], [51.4646, -0.3062], [51.4570, -0.3244],
    [51.4506, -0.3396]]],

  /* A307 Kew Road and Richmond Road, Kew Bridge down through the town to Petersham. */
  ['A307 Kew Road', 'a', 2.4, [
    [51.4890, -0.2870], [51.4802, -0.2934], [51.4712, -0.2996], [51.4614, -0.3046],
    [51.4522, -0.3086], [51.4438, -0.3062]]],

  /* A305 Twickenham Road, over the river and on to Hounslow. */
  ['A305 Twickenham Road', 'a', 2.0, [
    [51.4614, -0.3046], [51.4592, -0.3196], [51.4560, -0.3336], [51.4530, -0.3470]]],

  /* A310 Twickenham Road down to Hampton, past the green. */
  ['A310 Hampton Road', 'a', 1.8, [
    [51.4506, -0.3350], [51.4436, -0.3402], [51.4344, -0.3466], [51.4248, -0.3524]]],

  /* A3003 Sandycombe Road and Kew Road, Richmond up to Kew Bridge. */
  ['A3003 Sandycombe Road', 'a', 1.8, [
    [51.4640, -0.3010], [51.4712, -0.2926], [51.4788, -0.2874], [51.4856, -0.2856]]],

  /* A308 Kingston Road, out along the river to Teddington. */
  ['A308 Kingston Road', 'a', 1.8, [
    [51.4530, -0.3054], [51.4462, -0.3110], [51.4386, -0.3164], [51.4300, -0.3208]]],

  /* B353 Sheen Lane and Mortlake, up to the South Circular. */
  ['B353 Sheen Lane', 'b', 1.4, [
    [51.4664, -0.2712], [51.4700, -0.2688], [51.4744, -0.2666], [51.4784, -0.2650]]],

  /* THE DISTRICT LINE to Richmond, and the South Western beside it. */
  ['District line', 'rail', 1.4, [
    [51.4784, -0.2650], [51.4712, -0.2782], [51.4650, -0.2900], [51.4630, -0.3010]]],

  /* ---- SUTTON ---------------------------------------------------------------------------- */

  /* A232 Cheam Road and Carshalton Road, the east–west road through the whole borough. */
  ['A232 Cheam Road', 'a', 2.6, [
    [51.3596, -0.2402], [51.3612, -0.2166], [51.3634, -0.1972], [51.3648, -0.1750],
    [51.3672, -0.1546], [51.3714, -0.1338]]],

  /* A2043 Sutton High Street and Malden Road, north out towards Worcester Park. */
  ['A2043 Sutton High Street', 'a', 2.0, [
    [51.3618, -0.1938], [51.3690, -0.1946], [51.3772, -0.1976], [51.3856, -0.2044],
    [51.3928, -0.2136]]],

  /* A237 Wallington and Hackbridge, along the Wandle valley. */
  ['A237 Hackbridge', 'a', 1.8, [
    [51.3668, -0.1490], [51.3752, -0.1542], [51.3828, -0.1622], [51.3894, -0.1706]]],

  /* B278 Sutton Common Road and Green Wrythe Lane, across the north of the borough. */
  ['B278 Sutton Common Road', 'b', 1.5, [
    [51.3746, -0.2032], [51.3768, -0.1922], [51.3790, -0.1806], [51.3806, -0.1690]]],

  /* B2230 Brighton Road, the High Street carrying on south towards Belmont. */
  ['B2230 Brighton Road', 'b', 1.6, [
    [51.3618, -0.1938], [51.3546, -0.1958], [51.3466, -0.1988], [51.3392, -0.2014]]],

  /* A2022 Woodmansterne Road, Carshalton Beeches across to Wallington. */
  ['A2022 Woodmansterne Road', 'a', 1.8, [
    [51.3510, -0.1802], [51.3538, -0.1660], [51.3568, -0.1512], [51.3596, -0.1376]]],

  /* THE SUTTON LINE, the railway everything down here hangs off. */
  ['Sutton line', 'rail', 1.4, [
    [51.4022, -0.1948], [51.3906, -0.1970], [51.3792, -0.1962], [51.3684, -0.1930],
    [51.3618, -0.1912]]],

  /* THE EPSOM LINE through Cheam and Ewell, west out of Sutton. */
  ['Epsom line', 'rail', 1.4, [
    [51.3618, -0.1912], [51.3606, -0.2074], [51.3592, -0.2216], [51.3576, -0.2372]]],
];

/**
 * THE GROUND, projected.
 *
 * Nothing here is generated any more. It was — a seed rolled blobs and curves that looked like
 * terrain and described nowhere — and the argument for it was that hand-drawing terrain is a lot
 * of typing. Which is true of a TILE GRID and false of this: the big things are a dozen lines,
 * they are facts rather than decoration, and a park in the right place is worth more than nine in
 * plausible ones.
 *
 * NOTHING WITHOUT COORDINATES. Real parks around invented venue positions would be a map that is
 * half true, which is worse than one that is honestly not — the same rule the river follows.
 */
/* A river's points in the box, or nothing at all if none of it comes near. Judged like a road —
   by whether ANY of it shows — rather than like a park, which is judged by its middle. */
function onFrame_(line, p, near) {
  const pts = line.map(([la, ln]) => ({ x: p.x(ln), y: p.y(la) }));
  return pts.some(q => near(q.x, q.y, 12)) ? pts : [];
}

function mapTerrain() {
  const p = mapProject();
  if (!p) return { green: [], roads: [], buildings: [], river: [], wandle: [], brooks: [] };

  /* WHAT IS ACTUALLY IN VIEW. Everything used to be drawn and clipped by the frame, so a map of
     Merton filled with the edges of things miles away. A map of a world shows that world.
     The radius-scaling that lived here went with the circles: a park is an outline now, and an
     outline is already in the right units. */
  const near = (x, y, pad) => x > -pad && x < 100 + pad && y > -pad && y < 100 + pad;

  return {
    green: PARKS.map(([name, outline]) => {
      const pts = outline.map(([la, ln]) => ({ x: p.x(ln), y: p.y(la) }));
      const cx = pts.reduce((n, q) => n + q.x, 0) / pts.length;
      const cy = pts.reduce((n, q) => n + q.y, 0) / pts.length;
      return { name, pts, cx, cy,
        /* Closed, so it is a shape rather than a line that happens to return to its start. */
        d: pts.map((q, i) => (i ? 'L' : 'M') + q.x.toFixed(1) + ' ' + q.y.toFixed(1)).join(' ') + ' Z' };
    /* Tight, now that a world has a floor under its size. At 15 a map of Merton reached Beddington
       Park, which is in Sutton and belongs to World 4. */
    }).filter(g => near(g.cx, g.cy, 10)),

    roads: ROADS.map(([name, kind, w, pts]) => ({
      name, kind, w,
      d: pts.map(([la, ln], i) => (i ? 'L' : 'M') + p.x(ln).toFixed(1) + ' ' + p.y(la).toFixed(1))
             .join(' '),
      /* A road is kept if ANY of it crosses the frame — unlike a park, which is judged by its
         middle. A road is long and mostly elsewhere by nature; the A3 belongs on a Merton map for
         the corner of it that clips the north-west, and dropping it for having its centre in
         Kingston would be dropping it for being a road. */
      near: pts.some(([la, ln]) => near(p.x(ln), p.y(la), 12)),
    })).filter(r => r.near),

    /* EVERY RIVER, CULLED LIKE A ROAD — kept if any part of it crosses the frame, because a river
       is long and mostly elsewhere by nature. This was the one layer nothing culled, so the Wandle
       was drawn on a map of Richmond and the Crane on a map of Sutton: a line ruled straight across
       a borough it is nowhere near, which is worse than a missing river because it looks like one.
       Named separately because the Thames is drawn wider than the rest — it is wider — and because
       a world usually has one that matters more: the Wandle in Merton, the Beverley Brook in
       Richmond. */
    /* THE BUILDINGS, as footprints. `size` is metres on the ground, and a metre is about
       0.000009 degrees of latitude — so a 250-metre power station comes out four times the width
       of a 60-metre theatre, which is the point of storing a size rather than drawing every
       building the same square. */
    buildings: BUILDINGS.map(([name, la, ln, kind, metres]) => {
      const x = p.x(ln), y = p.y(la);
      /* Scaled through the projection like everything else, so a building keeps its size relative
         to the ground when the world's frame changes. */
      const w = Math.max(1.1, Math.abs(p.y(la + metres * 0.000009) - y));
      return { name, kind, x, y, w };
    /* GENEROUS, because a building past the edge is clipped by the frame anyway and there are only
       forty of them — where being tight cost the two most recognisable buildings in two of the
       worlds: Twickenham Stadium sat eight units off the left of Richmond and Battersea Power
       Station six off the top of Wandsworth. */
    }).filter(b => near(b.x, b.y, 10)),

    river: onFrame_(THAMES, p, near),
    wandle: onFrame_(WANDLE, p, near),
    brooks: [BEVERLEY, CRANE].map(r => onFrame_(r, p, near)).filter(r => r.length),
  };
}

/* THE GAME LAYER IS GONE, for now.
   There was a path drawn between the venues in the order they came, a gold stretch showing how far
   ticked topics had carried you, a node lit as "here", and locking that could shut the ones ahead.
   None of it was true of anything: the path was not a route anybody walks, the order was the order
   the sheet happened to be in, and "here" was a division sum.
   What is left is a map of where the venues actually are, on ground that is actually there. The
   progression can come back once the ground is right, and it will be worth more sitting on
   something accurate than it was sitting on something invented.
--------------------------------------------------------------------------------------------- */

/* A NAME SHORT ENOUGH TO SIT UNDER A PIN. "Library" and "Centre" go because every one of them is a
   library or a centre — what tells them apart is the place, which is the part worth keeping.

   This was defined next to the projection maths and went out with it when the fake third dimension
   was removed. Nothing complained: it is only called inside a template string, so the file parsed,
   every check passed, and the map would have thrown the moment anybody opened it. That is the exact
   failure `stub-run` exists for, and the map is not in it — which is worth more than the fix. */
const shortName = t => String(t || '')
  .replace(/\b(library|centre|center|business|the)\b/gi, '')
  .replace(/\s+/g, ' ').trim().split(' ').slice(0, 2).join(' ') || String(t || '');

function drawOverworld() {
  const host = $('map-board');
  if (!host) return;

  const world = mapWorld();
  const worlds = mapWorlds();
  const nodes = mapLayout();
  const unplaced = mapNodes().length - nodes.length;

  if (!nodes.length) {
    host.innerHTML = `<p class="note" style="padding:1rem;text-align:center">
      ${world.name ? esc(world.name) + ' has no venue with a postcode yet.'
                   : 'No venues yet.'}</p>`;
    return;
  }

  const ground = mapTerrain();
  const asPath = list => list.length
    ? list.map((r, i) => (i ? 'L' : 'M') + r.x.toFixed(1) + ' ' + r.y.toFixed(1)).join(' ') : '';

  host.innerHTML = `<svg viewBox="0 0 100 100" class="map-svg" aria-hidden="true">
    ${/* PAINTER'S ORDER: the ground, then the green on it, then the water, then the roads that
          bridge the water, then the venues — which are the only thing here that is not scenery and
          so must never be drawn over. */''}
    <rect x="0" y="0" width="100" height="100" class="map-land"/>

    ${ground.green.map(g => `<path d="${g.d}" class="map-green"
      ><title>${esc(g.name)}</title></path>`).join('')}

    ${(() => { const d = asPath(ground.wandle);
               return d ? `<path d="${d}" class="map-water map-wandle"/>` : ''; })()}
    ${(ground.brooks || []).map(b => { const d = asPath(b);
        return d ? `<path d="${d}" class="map-water map-brook"/>` : ''; }).join('')}
    ${(() => { const d = asPath(ground.river);
               return d ? `<path d="${d}" class="map-water"/>` : ''; })()}

    ${/* Every casing first, then every fill — not casing-then-fill road by road, which would let
          one road's dark edge cut across the road beside it at every junction. Two passes is how a
          road map is drawn and the only way junctions look joined. */''}
    ${ground.roads.map(r => `<path d="${r.d}" class="map-case"
      stroke-width="${(r.w + 1).toFixed(1)}"/>`).join('')}
    ${ground.roads.map(r => `<path d="${r.d}" stroke-width="${r.w.toFixed(1)}" class="map-street ${
      r.kind === 'tram' ? 'map-tram' : r.kind === 'rail' ? 'map-rail'
      : r.kind === 'b' ? 'map-road-b' : 'map-road-a'
      }"><title>${esc(r.name)}</title></path>`).join('')}

    ${/* BUILDINGS, on top of the roads because they front onto them. Top-down like everything
          else — a footprint, not a little house seen from the side. Squares mostly, because from
          above most buildings are, and a station is drawn longer than it is wide because a
          platform is. */''}
    ${ground.buildings.map(b => {
      const long = b.kind === 'station' || b.kind === 'retail';
      const w = b.w, h = long ? b.w * 0.45 : b.w * 0.8;
      return `<rect x="${(b.x - w / 2).toFixed(1)}" y="${(b.y - h / 2).toFixed(1)}"
        width="${w.toFixed(1)}" height="${h.toFixed(1)}" rx="0.3"
        ${/* WRITTEN OUT, not assembled. `map-bld-${kind}` produces the same markup and is invisible
              to the check that every styled class is actually emitted — which is the check that has
              now caught three rules outliving their purpose. A class built by concatenation is a
              class that check cannot see. */''}
        class="map-bld ${
          b.kind === 'tower' ? 'map-bld-tower' : b.kind === 'station' ? 'map-bld-station'
          : b.kind === 'retail' ? 'map-bld-retail' : b.kind === 'sport' ? 'map-bld-sport'
          : 'map-bld-civic'
        }"><title>${esc(b.name)}</title></rect>`;
    }).join('')}

    ${/* THE VENUES. No path between them: there was one, drawn in the order the sheet happened to
          hold them, and it was not a route anybody walks. A map says where things are. */''}
    ${/* A VENUE IS A BUILDING TOO, and the only one that is coloured — everything else on the map
          is where you are, this is where you are going. Drawn as a footprint like the rest so it
          sits in the same world rather than floating over it as a pin. */''}
    ${nodes.map((n, i) => `<g class="map-node" data-do="map-node" data-i="${i}"
         data-name="${esc(n.v.title)}"
         transform="translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})">
      <rect x="-2.2" y="-1.8" width="4.4" height="3.6" rx="0.4" class="map-venue"/>
      <text x="0" y="6" class="map-name">${esc(shortName(n.v.title))}</text>
    </g>`).join('')}
  </svg>

  <div class="map-world">
    ${worlds.length > 1 ? '<span class="map-arrow" data-do="map-world" data-by="-1">‹</span>' : ''}
    <span class="map-world-name">World ${MAP_WORLD + 1} · ${esc(world.name || 'Nowhere')}</span>
    ${worlds.length > 1 ? '<span class="map-arrow" data-do="map-world" data-by="1">›</span>' : ''}
  </div>
  <p class="map-where">${nodes.length} place${nodes.length === 1 ? '' : 's'}</p>
  ${unplaced ? `<p class="faint" style="text-align:center">${unplaced} more without a postcode.</p>`
             : ''}`;
}

on('map-world', el => {
  const all = mapWorlds();
  /* A DIRECTION, OR NOTHING HAPPENS. Without the guard a press carrying no `data-by` gives
     `Number(undefined)` — NaN — and NaN survives every clamp below it, so `MAP_WORLD` becomes NaN,
     `mapWorld()` indexes the list with it, and the map throws on `.venues` of undefined from then
     on. One malformed press and the screen is dead until a reload. */
  const by = Number(el && el.dataset && el.dataset.by);
  if (!by) return;
  MAP_WORLD = (MAP_WORLD + by + all.length) % Math.max(1, all.length);
  drawOverworld();
});

/* Tapping a venue opens it. Nothing to refuse — there is no locking any more, so there is no
   sentence explaining why you cannot. */
on('map-node', el => {
  const n = mapLayout()[Number(el.dataset.i)];
  if (n) ACTIONS.who({ dataset: { kind: 'venue', name: n.v.title } });
});

/* `initOverworld()` WAS HERE and did nothing but call `drawOverworld()`. Nothing called it: the
   widget points at `initOverworldBoard`, and the SVG map is drawn by `drawOverworld` directly.
   A function that only forwards is a name to maintain and a thing to read; the note below still
   says which of the two the widget uses, which is the part that was worth keeping. */

const WIDGETS = [
  { id: 'chess', kind: 'game', name: 'Chess', start: () => initChess?.(),
    into: 'chess-board', what: 'The board',
    /* THE BOARD, AND NOTHING ELSE.
       A title saying "Chess" above a chessboard, and a line explaining that chess has castling in
       it. Then three controls under it — New game, Take back, and a difficulty menu — which is
       three decisions to read past before the first move.
       A board is self-explanatory in a way almost nothing else in this app is. What is left is the
       board and one line telling you whose move it is, which is the only thing a board cannot say
       for itself. */
    html: `<div class="card">
    <div id="chess-board" class="chess"></div>
    <p class="note" id="chess-say" style="text-align:center;margin:.5rem 0 0">
      Your move — you are white.</p>
  </div>` },
  { id: 'tables', kind: 'game', name: 'Times Tables', start: () => initTables?.(),
    /* The sprint's clock is a setInterval. Left running it goes on counting a sixty-second round
       nobody is watching, and fires its finish into a screen that is no longer there. */
    stop: () => { if (typeof ttState !== 'undefined' && ttState) { clearInterval(ttState.timer); ttState = null; } },
    into: 'tt-idle', what: 'The sprint',
    html: `<div class="card">
    <h3>Times Tables Sprint</h3>
    <div id="tt-idle">
      <p class="sub">Sixty seconds. As many as you can.</p>
      <button class="btn" id="tt-play" data-do="tt-start">Start</button>
    </div>
    <div id="tt-question" class="hidden tt">
      <p class="mono" id="tt-q" style="font-size:2rem;text-align:center;margin:.6rem 0">—</p>
      <input id="tt-answer" inputmode="numeric" placeholder="answer" autocomplete="off">
      <p class="note" id="tt-feedback" style="text-align:center;min-height:1.2em"></p>
      ${rowLive('Time', '60', 'tt-time')}
      ${rowLive('Right', '0', 'tt-score')}
      <button class="btn quiet" data-do="tt-stop" style="margin-top:.5rem">Give up</button>
    </div>
    <div id="tt-over" class="hidden"></div>
  </div>` },
  { id: 'flabby', kind: 'game', name: 'Flabby Pird', start: () => initFlappy?.(),
    /* An animation loop, which is the expensive one: sixty frames a second drawn into a canvas
       off the side of the screen, for as long as the tab is open. */
    stop: () => { if (typeof flappyState !== 'undefined' && flappyState && flappyState.raf) {
      cancelAnimationFrame(flappyState.raf); flappyState.raf = null; } },
    into: 'flappy-canvas', what: 'The game',
    html: `<div class="card">
    <h3>Flabby Pird</h3>
    <p class="sub">Harder than it looks.</p>
    <canvas id="flappy-canvas" class="flappy"></canvas>
    <p class="note" id="flappy-msg" style="text-align:center;margin:.4rem 0 0">Tap to play</p>
    ${rowLive('Score', '0', 'flappy-score')}
    ${rowLive('Best', '0', 'flappy-best')}
  </div>` },
  /* THE BOARD, NOT THE DRAWING. `initOverworld` draws the flat SVG map of venues; the board that
     came out of overworld.html is the tiled one with the real Colliers Wood outlines on it, and it
     goes in the same card through the same id. The SVG one is still here and still works — see the
     note beside `drawOverworld` — so putting this back is changing one word. */
  /* THE BOARD, which is SVG now rather than three.js — so it draws immediately, needs no loader,
     and leaves nothing running when the widget closes. */
  { id: 'overworld', kind: 'game', name: 'The Overworld', start: () => initOverworldBoard?.(),
    into: 'map-board', what: 'The map',
    html: `<div class="card">
      <h3>The Overworld</h3>
      <p class="sub">Every place we teach, and how far along you have got.</p>
      <div id="map-board" class="map ow"></div>
    </div>` },

  { id: 'reels', kind: 'game', name: 'One more thing', start: () => initFeed?.(),
    into: 'feed-screen', what: 'This',
    html: `<div class="card">
    <h3>One more thing</h3>
    <p class="sub">Something worth knowing. Tap for another.</p>
    <div id="feed-screen" class="feed" data-do="feed-tap"></div>
  </div>` },
  /* `solid` — AN INSTRUMENT, NOT A CARD.
     The pane is frosted glass because most of what sits on it is CONTENT: a post, a receipt, a list
     of things to find, and glass says "this is a surface something is written on".
     A calculator is not written on the surface, it IS the object. Frosted glass with a keypad
     floating in it reads as a picture of a calculator; an opaque casing reads as one you can press.
     Declared here beside the widget's own markup rather than in the sheet: the sheet decides
     WHETHER and WHERE a widget appears, which can differ per deployment, and this cannot — a
     calculator is an instrument everywhere or the word means nothing. */
  /* MESSAGES, as a widget. It is a thing you read, which is what these are — and a whole pane
     shows a conversation where a card on the You screen could only ever say how many were unread.
     `solid` because it is a device you look INTO rather than a surface something is written on. */
  /* MESSAGES IS NOT A WIDGET ANY MORE. It lived here, in Find, alongside the calculator and the
     games — on the reasoning that it is a thing you READ, which is what the widgets are.
     It is not the same kind of thing. A calculator, a board and a timer are instruments: you go
     looking for one because you want to do something with it. A message is somebody trying to
     reach YOU, and it belongs where everything else about you is — beside your credits, your
     details and the way out. Nobody hunts through a list of tools to find out whether anybody has
     written to them.
     Moved to the You screen; see `meBlocks`. */

  { id: 'calculator', kind: 'tool', name: 'Calculator', solid: true, start: () => initMiniCalc?.(),
    into: 'mc-display', what: 'The calculator',
    html: `<div class="card">
    <h3>Calculator</h3>
    ${/* A DIV, not an input. A readonly input shows no caret on a phone, and one that is not
          readonly opens the keyboard over the keypad you are trying to press — so the caret is
          drawn, which is what makes the arrows mean anything. */''}
    <div id="mc-display" class="mc-display mono">0</div>
    <div class="mc-grid">
      ${CALC_KEYS.map(([v, label, cls]) =>
        `<button type="button" class="mc-btn ${cls}" data-mc="${esc(v)}">${esc(label)}</button>`
      ).join('')}
    </div>
  </div>` },
  /* THE FLYER MAKER IS THE CHEAT SHEET MAKER NOW. It was a widget of its own here — its own page,
     its own A4 sheet, its own print button — and the paper maker below already had every one of
     those. A flyer is a piece you tick, at whichever size, on the same sheet as everything else,
     so what is left of `flyer.js` is the flyer itself and the sum that prices a seat.
     `admin` MOVED WITH IT rather than being dropped: the controls price your classes and print
     your advertising, so they appear on the paper maker for an admin and for nobody else. */

  /* THE CHEAT SHEET MAKER. A tool rather than a game, and `solid` like the others in this section,
     so it is listed and searchable with everything else.
     IT WAS "Maths mat", which is what a tutor calls it and not what a student searching for one
     would type. The id stays `mat` — it is written into `mat-box`, into every `mat-` handler and
     into the checkers, and an id is a wire rather than a label.
     SEARCH MATCHES THE NAME AND NOTHING ELSE for a widget (`find.js` gives them an empty `sub`),
     so the old word has to be IN the name or it stops being findable — which is why this reads
     "maths mat" at the end rather than dropping it. */
  /* THE FLYER MAKER, WHICH IS A TOOL AND NOT A PIECE OF THE CHEAT SHEET. It was folded into the
     sheet and lost its own page doing it — see the note at the foot of flyer.js. This is that page
     back: its own paper, its own print, and `flyOne` still the only thing that draws a flyer. */
  { id: 'flyers', kind: 'tool', name: 'Make a flyer', solid: true, admin: true,
    start: () => initFlyer?.(),
    into: 'fm-wrap', what: 'The flyer',
    html: `<div class="card">
    <h3>Make a flyer</h3>
    <p class="sub">Campaign, style, colours and size. Two to a sheet, or nine stickers. Prices come
      from the venue you pick.</p>
    <div id="fm-wrap"></div>
  </div>` },

  { id: 'mat', kind: 'tool', name: 'Cheat sheet maker (maths mat)', solid: true,
    start: () => initMat?.(),
    into: 'mat-box', what: 'The cheat sheet',
    /* NO BLURB. It said "one sheet of A4, tick what goes on it" over a list of tickboxes on a page
       showing a sheet of A4 — three sentences describing what is already on the screen, read once
       and then skipped forever while still taking the top of every visit. The two facts worth
       keeping were that the ruler and protractor print at true size, and those belong on those two
       components rather than in a paragraph about the whole tool. */
    html: `<div class="card">
    <h3>Cheat sheet maker</h3>
    <div id="mat-box"></div>
  </div>` },
  { id: 'timer', kind: 'tool', name: 'Timer', solid: true, start: () => initTimer?.(),
    into: 'timer-display', what: 'The timer',
    html: `<div class="card">
    <h3>Timer</h3>
    <p class="mono" id="timer-display" style="font-size:2.1rem;text-align:center;margin:.4rem 0">25:00</p>
    <div class="btn-row">
      ${/* A `data-do`, not an id. The delegated click handler only ever looks for `data-do`, so a
            button carrying an id alone is a button nothing is listening to — which is why this
            has never started anything. */''}
      <button class="btn quiet" data-do="timer-toggle" id="timer-toggle">▶</button>
      <button class="btn quiet" data-do="timer-reset">Reset</button>
    </div>
    ${/* The lengths people actually use. A number field for a duration is a keyboard and four taps
          for a question whose answer is almost always one of four. */''}
    <div class="btn-row" style="margin-top:.4rem">
      ${[5, 15, 25, 45].map(m =>
        `<button class="btn quiet tiny" data-do="timer-set" data-min="${m}">${m}</button>`).join('')}
    </div>
  </div>` },
  { id: 'docket', kind: 'tool', name: 'Docket', solid: true, start: () => paintDocket?.(),
    into: 'docket-body', what: 'The docket',
    html: `<div class="card">
    <h3>Docket</h3>
    <p class="sub">What there is to do. Tick it off as you go.</p>
    <div id="docket-body"></div>
    <div class="dock-new">
      <input id="dock-add" placeholder="Add a line…" autocomplete="off">
      <button class="btn quiet tiny" data-do="dock-add">＋</button>
    </div>
    <p class="faint" id="dock-said" style="margin:.35rem 0 0"></p>
  </div>` },
  { id: 'notepad', kind: 'tool', name: 'Notepad', solid: true, start: () => initPad?.(),
    into: 'notepad', what: 'The notepad',
    html: `<div class="card">
    <h3>Notepad</h3>
    <textarea id="notepad" placeholder="Jot something down…"></textarea>
    <p class="faint" id="pad-said" style="margin:.35rem 0 0">Saves as you type.</p>
  </div>` },
  /* ---------- YOUR WEEK ---------------------------------------------------------------------------
     IT WAS A BLOCK IN THE `You` COLUMN, and for most people it said "Nothing in the diary yet" — a
     card whose whole content was the announcement that it had nothing to show, on a screen nobody
     opens to look at their timetable.

     IT IS A TOOL. A calendar is a tool here; a notepad is a tool; a week of your sessions is the
     same kind of thing — something you go and look at when you want to know when you are somewhere.
     So it is in the drawer with them, opened when wanted and costing nothing when not.

     `into` AND `start`, LIKE THE CALENDAR. The week is built from `liveJobs`, so it cannot be static
     `html` the way chess is — the markup is an empty container and `initWeek` fills it at the moment
     it is opened, which is also the moment its data is freshest. */
  /* ---------- THE `live` WIDGET WAS HERE ------------------------------------------------------------
   ONE WIDGET HOLDING EVERY SESSION. It is one widget PER session now, built from the data by
   `liveWidgets_` in book.js the way `msgWidgets_` builds one per conversation — so each is named
   for itself, counted on its own under Booking, and findable by typing its subject.
   Nothing static is left to declare: a session is not a fixture of the app, it is a row. */

  { id: 'week', kind: 'tool', name: 'Your week', start: () => initWeek?.(),
    into: 'week-body', what: 'Your week',
    html: `<div class="card">
    <h3>Your week</h3>
    <div id="week-body"></div>
  </div>` },

  { id: 'calendar', kind: 'tool', name: 'Calendar', start: () => initCalendar?.(),
    into: 'cal-body', what: 'The calendar',
    html: `<div class="card">
    <div class="cal-head">
      <span class="cal-arrow" data-do="cal-back">‹</span>
      <h3 id="cal-label" style="margin:0">Calendar</h3>
      <span class="cal-arrow" data-do="cal-fwd">›</span>
    </div>
    <div id="cal-body" class="cal"></div>
  </div>` },
];



/* The calculator keys go through the same delegated handler as everything else. The old app kept a
   `window._mcClick` and the carried-over function still sets it — so this hands the press to it
   rather than reimplementing arithmetic that already works. */
document.addEventListener('click', e => {
  const k = e.target.closest('[data-mc]');
  if (k) window._mcClick?.(k.dataset.mc);
});