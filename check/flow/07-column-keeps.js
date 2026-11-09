check('racer (464, 500): before the backend has built a map the shipped Colliers Wood plays for everyone with the OSM line, parks and landmarks, and an admin\'s visit does not build over it', async () => {
  const bad = [];
  for (const who of ['visitor', 'admin']) {
    const { w, sent, gets } = boot({ before: who === 'admin' ? signedInAs_(RACE_ADMIN_) : undefined,
      serve: raceServeFix_({ version: 'test', built: false, race: null }, RACE_SHIPPED_()),
      reply: b => (b.action === 'raceBuild' ? { error: 'No Overpass server answered.' } : undefined) });
    await wait(300);
    const said = await raceOpen_(w, 'world');
    if (said) return [who + ': ' + said];
    if (gets.filter(u => /[?&]race=1/.test(u)).length !== 1) bad.push(who + ': ?race=1 asked ' + gets.filter(u => /[?&]race=1/.test(u)).length + ' times for one visit');
    if (!gets.some(u => /data\/race-map\.json/.test(u))) bad.push(who + ': the shipped map was never asked for');
    const card = w.document.querySelector('#s-stuff #race-box');
    if (!card) { bad.push(who + ': no #race-box on Games'); continue; }
    const h3 = card.closest('.card').querySelector('h3');
    if (!h3 || h3.textContent !== 'Console') bad.push(who + ': the racer is not inside the Console card (441)');
    if (!card.querySelector('canvas.race-gl')) bad.push(who + ': no map built, and the card has no road to drive: ' + card.innerHTML.slice(0, 120));
    if (!card.querySelector('[data-do="race-go"].tile')) bad.push(who + ': no Drive tile on the shipped map');
    const attr = (card.querySelector('.race-attr') || {}).textContent || '';
    if (/Practice streets/.test(attr) || !/OpenStreetMap contributors/.test(attr)) bad.push(who + ': the shipped Colliers Wood does not credit OSM: ' + attr);
    const W = w.racer_().world;
    if (!W || !W.areas.length || !W.marks.some(m => m.kind === 'tube')) bad.push(who + ': the shipped map has no parks or no station: ' + (W ? W.areas.length + ' areas, ' + W.marks.length + ' marks' : 'no world'));
    const tile = card.querySelector('[data-do="race-build"]');
    const builds = sent.filter(b => b.action === 'raceBuild').length;
    if (who === 'visitor' && (tile || builds)) bad.push('a visitor is offered Build the map, or built one');
    if (who === 'admin') {
      if (!tile) bad.push('an admin has no Build the map tile');
      if (builds !== 0) bad.push('an admin\'s visit built by itself over the shipped Colliers Wood (' + builds + ' raceBuild), which a backend map without parks would replace');
    }
  }
  return bad;
});

check('racer (464): with neither a built map nor the shipped file the card still says why, never an empty box', async () => {
  const { w } = boot({ serve: raceServeFix_({ version: 'test', built: false, race: null, error: 'The map file could not be opened: gone' }, null) });
  await wait(300);
  const said = await raceOpen_(w, 'idle');
  if (said) return [said];
  const card = w.document.querySelector('#s-stuff #race-box');
  const words = card ? card.textContent.trim() : '';
  return /could not be opened/.test(words) ? [] : ['no map anywhere drew ' + JSON.stringify(words.slice(0, 120))];
});

check('racer (464): an admin\'s build replaces the practice streets with the built map, paused, with the OSM line and the heights\' source', async () => {
  const FIX = RACE_FIX_();
  let built = false;
  const { w, sent } = boot({ before: signedInAs_(RACE_ADMIN_),
    serve: u => (u.indexOf('race=1') !== -1 ? (built ? { version: 'test', built: true, race: FIX } : { version: 'test', built: false, race: null })
      : /data\/race-map\.json/.test(u) ? RACE_PRACTICE_() : undefined),
    reply: b => (b.action === 'raceBuild' ? (built = true, { success: true, built: true, roads: 6, bld: 62, lowest: 12, highest: 21 }) : undefined) });
  try { w.localStorage.setItem('race-autobuild', String(Date.now())); } catch (e) {}
  await wait(300);
  const said = await raceOpen_(w, 'world');
  if (said) return [said];
  const bad = [], R = w.racer_();
  if (!R.map.practice) bad.push('the first map was not the practice streets');
  if (sent.some(b => b.action === 'raceBuild')) bad.push('built by itself although the device built today');
  w.raceGo_();
  if (!R.running) bad.push('Drive did not start the practice streets');
  w.document.querySelector('#s-stuff #race-box [data-do="race-build"]').click();
  for (let k = 0; k < 40 && (R.building || !R.world || R.map.practice); k++) await wait(100);
  if (!sent.some(b => b.action === 'raceBuild')) bad.push('Build the map posted nothing');
  if (!R.world || R.map.practice || R.map.built !== FIX.built) bad.push('after the build the card is not on the built map');
  if (R.running) bad.push('the lap carried on into the new map');
  const attr = (w.document.querySelector('#s-stuff #race-box .race-attr') || {}).textContent || '';
  if (!/OpenStreetMap contributors/.test(attr) || !attr.includes(FIX.dem)) bad.push('the built map\'s attribution is not on the card: ' + attr);
  if (!/Map built: 6 roads, 62 buildings, 12–21 m/.test((w.document.getElementById('toast') || {}).textContent || '')) bad.push('no toast saying what was built');
  return bad;
});

check('racer (426): the map loads from the fixture, the road mesh stands at the map\'s heights (flat heights make it flat), keys move the car without turning the column, a hill slows it, and leaving pauses it', async () => {
  const FIX = RACE_FIX_();
  const { w, errs } = boot({ serve: u => (u.indexOf('race=1') !== -1 ? { version: 'test', built: true, race: FIX } : undefined) });
  await wait(300);
  const said = await raceOpen_(w, 'world');
  if (said) return [said];
  const bad = [], t = w.__t, d = w.document, R = w.racer_();
  const box = d.querySelector('#s-stuff #race-box');
  if (!box.querySelector('canvas.race-gl')) bad.push('no 3D canvas drawn');
  if (!/OpenStreetMap contributors/.test(box.textContent) || !box.textContent.includes(FIX.dem)) bad.push('the attribution or the DEM source is not on the card: ' + (box.querySelector('.race-attr') || {}).textContent);
  if (!box.querySelector('[data-do="race-go"].tile')) bad.push('no Drive tile');
  if (box.querySelectorAll('.race-pad').length !== 4) bad.push(box.querySelectorAll('.race-pad').length + ' pedals, wanted 4');
  if (!/Space brake/.test((box.querySelector('.race-keys') || {}).textContent || '')) bad.push('no key legend');
  if (R.world.gates.length < 4) bad.push('only ' + R.world.gates.length + ' checkpoints round the loop');

  /* 1. THE ROAD MESH AT THE MAP'S HEIGHTS: top vertices near the hill's top and its foot sit at those heights. */
  const roadY = W => {
    const [s, n] = W.mesh.ranges.road, D = W.mesh.data, out = [];
    for (let i = s; i < s + n; i++) out.push([D[i * 6], D[i * 6 + 1], -D[i * 6 + 2]]);
    return out;
  };
  const verts = roadY(R.world);
  const P = FIX.pts, np = P.length / 3;
  let hi = 0, lo = 0;
  for (let i = 1; i < np; i++) { if (P[3 * i + 2] > P[3 * hi + 2]) hi = i; if (P[3 * i + 2] < P[3 * lo + 2]) lo = i; }
  [hi, lo].forEach(i => {
    const x = P[3 * i] / 10, y = P[3 * i + 1] / 10, h = P[3 * i + 2] / 10;
    const near = verts.filter(v => Math.hypot(v[0] - x, v[2] - y) < 5.5).map(v => v[1]);
    const top = near.length ? Math.max(...near) : NaN;
    if (!(Math.abs(top - (h + 0.06)) < 0.6)) bad.push('the road at (' + x + ', ' + y + ') is drawn at ' + top.toFixed(2) + ' m; the map says ' + h + ' m');
  });
  const span = vs => { const ys = vs.map(v => v[1]); return Math.max(...ys) - Math.min(...ys); };
  const flat = JSON.parse(JSON.stringify(FIX));
  for (let i = 0; i < flat.pts.length; i += 3) flat.pts[i + 2] = 120;
  const flatSpan = span(roadY(w.raceWorld_(flat)).filter(v => v[1] > 11)), realSpan = span(verts.filter(v => v[1] > 11));
  if (!(realSpan > 7)) bad.push('the road mesh rises ' + realSpan.toFixed(1) + ' m over a map with a 9 m hill');
  if (!(flatSpan < 0.2)) bad.push('with every height 12 m the road mesh still rises ' + flatSpan.toFixed(2) + ' m — it is not drawn from the heights');

  /* 2. KEYS: Drive, then ↑ moves the car forward, ← turns it, Space slows it — and the column stays where it is. */
  const c = R.car, at0 = t.AT(), page0 = t.PAGE().stuff;
  box.querySelector('[data-do="race-go"].tile').click();
  await wait(50);
  if (!R.running) bad.push('Drive did not start the car');
  const key = (type, k) => d.dispatchEvent(new w.KeyboardEvent(type, { key: k, bubbles: true, cancelable: true }));
  const x0 = c.x, y0 = c.y, th0 = c.th;
  key('keydown', 'ArrowUp');
  /* POLLED, NOT TIMED: frames come when a loaded machine gives them, and the step is capped per frame. */
  const ahead = () => (c.x - x0) * Math.sin(th0) + (c.y - y0) * Math.cos(th0);
  for (let k = 0; k < 40 && ahead() <= 3; k++) await wait(100);
  const moved = ahead();
  if (!(moved > 3)) bad.push('holding ↑ for 4 s moved the car ' + moved.toFixed(2) + ' m forward');
  key('keydown', 'ArrowLeft');
  for (let k = 0; k < 30 && c.th >= th0 - 0.05; k++) await wait(100);
  key('keyup', 'ArrowLeft');
  if (!(c.th < th0 - 0.02)) bad.push('← did not turn the car left: heading ' + th0.toFixed(3) + ' → ' + c.th.toFixed(3));
  key('keyup', 'ArrowUp');
  const v1 = c.v;
  key('keydown', ' ');
  for (let k = 0; k < 30 && Math.abs(c.v) >= Math.abs(v1) - 1.5; k++) await wait(100);
  key('keyup', ' ');
  if (!(Math.abs(c.v) < Math.abs(v1) - 1)) bad.push('Space did not brake: ' + v1.toFixed(2) + ' → ' + c.v.toFixed(2) + ' m/s');
  if (t.AT() !== at0 || t.PAGE().stuff !== page0) bad.push('driving turned the app: ' + at0 + '/' + page0 + ' → ' + t.AT() + '/' + t.PAGE().stuff);
  if (!/mph/.test((box.querySelector('[data-hud="mph"]') || {}).textContent || '')) bad.push('the speed is not on the HUD');

  /* 3. THE HILL, one step at a time: the same throttle for five seconds is slower up Christchurch Road than along flat Merantun Way, and a car let go on the slope rolls back. */
  w.racePause_();
  const run = (x, y, th, keys, n) => { Object.assign(c, { x, y, th, v: 0, steer: 0 }); R.keys = keys; R.touch = {}; for (let i = 0; i < n; i++) w.raceStep_(1 / 60); return c.v; };
  const up = run(-40, 140, -Math.PI / 2, { up: true }, 300), level = run(-200, -150, Math.PI / 2, { up: true }, 300);
  if (!(up < level - 1)) bad.push('uphill ' + up.toFixed(2) + ' m/s against ' + level.toFixed(2) + ' m/s on the level after 5 s — the slope is not felt');
  const roll = run(-90, 140, -Math.PI / 2, {}, 120);
  if (!(roll < -0.3)) bad.push('let go facing up the hill the car moved at ' + roll.toFixed(2) + ' m/s, not backwards');
  R.keys = {};

  /* 4. LEAVING PAUSES IT, and then the arrows are the app's again. */
  box.querySelector('[data-do="race-go"].tile').click();
  await wait(50);
  t.go('feed', false, true);
  await wait(LEAVE_MS); await woken_();
  if (R.running || R.raf) bad.push('the loop still runs with Games gone');
  if (errs.length) bad.push('errors: ' + errs.slice(0, 3).join(' | '));
  return bad;
});

check('the maze draws its own walls, keeps a walk through a repaint, and has the arrow keys only in front', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.maze || !t.widgetsOf) return ['the maze is not exported'];
  const d = w.document;
  const N = 11;
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  /* THE MAZE IS A GAME INSIDE BOARD GAMES (461), reached through its picker; no card of its own. */
  if (t.allWidgets().some(x => String(x.id) === 'maze')) return ['the maze is still a widget of its own'];
  const at = t.widgetsOf('game').findIndex(x => String(x.id) === 'boardgames');
  if (at < 0) return ['there is no Board games widget on the Games column'];
  t.findPage(at, true);
  const grid = () => d.querySelector('#s-stuff #maze-grid');
  /* The board waited for, not guessed at — the same race as Connect 4's above. */
  await woken_();
  { const pick = d.querySelector('#s-stuff #bg-pick');
    if (!pick) return ['the Board games widget has no picker'];
    pick.value = 'maze'; t.ACTIONS['bg-pick'](pick); }
  for (let k = 0; k < 30 && !(grid() && grid().children.length === N * N); k++) await wait(100);
  if (!grid() || grid().children.length !== N * N) return ['the maze did not draw ' + (N * N) + ' squares'];
  const bad = [];

  /* 1. NO RULE BUT THE MAZE'S REACHES A MAZE SQUARE. § */
  {
    const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, ' ');
    const cells = [...grid().children];
    const theirs = new Set();
    cells.forEach(c => c.classList.forEach(k => theirs.add(k)));
    const foreign = new Set();
    for (const m of css.matchAll(/([^{}@;]+)\{/g)) {
      m[1].split(',').map(x => x.trim()).filter(Boolean).forEach(sel => {
        if (/^(from|to|\d+%)$/.test(sel) || /::/.test(sel)) return;
        const subject = sel.split(/[\s>+~]+/).pop();
        const named = (subject.match(/\.[\w-]+/g) || []).map(x => x.slice(1));
        if (!named.some(k => theirs.has(k))) return;
        if (/\.mz\b|\.mz-/.test(sel)) return;
        let hit = false;
        try { hit = cells.some(c => c.matches(sel)); } catch (e) { return; }
        if (hit) foreign.add(sel);
      });
    }
    if (foreign.size) bad.push('a rule that is not the maze\'s reaches a maze square: ' + [...foreign].join(' | '));
  }

  /* THE WALLS AS DRAWN, read back off the squares' classes, and both sides of every wall agreeing. */
  const walls = () => {
    const out = [];
    [...grid().children].forEach((c, i) => {
      let v = 0;
      if (c.classList.contains('mz-n')) v |= 1;
      if (c.classList.contains('mz-e')) v |= 2;
      if (c.classList.contains('mz-s')) v |= 4;
      if (c.classList.contains('mz-w')) v |= 8;
      out[i] = v;
    });
    return out;
  };
  const STEP = { n: [0, -1, 1, 4], e: [1, 0, 2, 8], s: [0, 1, 4, 1], w: [-1, 0, 8, 2] };
  const route = (cells, from) => {
    const prev = new Array(N * N).fill(null);
    prev[from] = '';
    const q = [from];
    for (let i = 0; i < q.length; i++) {
      const a = q[i], x = a % N, y = (a / N) | 0;
      Object.keys(STEP).forEach(k => {
        const [dx, dy, bit] = STEP[k];
        const nx = x + dx, ny = y + dy, b = ny * N + nx;
        if (cells[a] & bit || nx < 0 || ny < 0 || nx >= N || ny >= N || prev[b] !== null) return;
        prev[b] = k; q.push(b);
      });
    }
    if (prev[N * N - 1] === null) return null;
    const steps = [];
    for (let b = N * N - 1; b !== from;) {
      const k = prev[b]; steps.unshift(k);
      b -= STEP[k][1] * N + STEP[k][0];
    }
    return steps;
  };
  {
    const c = walls();
    const oneSided = [];
    for (let i = 0; i < N * N; i++) {
      const x = i % N, y = (i / N) | 0;
      if (x < N - 1 && !!(c[i] & 2) !== !!(c[i + 1] & 8)) oneSided.push((x + 1) + ',' + (y + 1) + ' east');
      if (y < N - 1 && !!(c[i] & 4) !== !!(c[i + N] & 1)) oneSided.push((x + 1) + ',' + (y + 1) + ' south');
    }
    if (oneSided.length) bad.push('walls drawn on one side of a doorway only: ' + oneSided.slice(0, 5).join(', '));
    if (c.filter(v => v & 4).length === 0) bad.push('no square carries a south wall, so the wall classes were not read');
  }

  /* 2. THE KEYS, ON THE MAZE'S PAGE AND OFF IT. ArrowUp from the top left is always a wall: the
     maze must not move, and the press must not reach the pager either. */
  const key = k => d.body.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  /* THE MAZE'S PAGE ON FIND (790), read as the index it was on the Games column. */
  const page0 = t.PAGE().stuff, page = () => (t.PAGE().stuff === page0 ? at : t.PAGE().stuff);
  const m0 = t.maze();
  key('ArrowUp');
  if (t.maze().moves !== 0) bad.push('ArrowUp into the outer wall counted a move');
  if (page() !== at) bad.push('ArrowUp on the maze page turned the column from the maze to page ' + page());
  t.findPage(at, true);
  const open0 = walls()[0] & 2 ? 'ArrowDown' : 'ArrowRight';
  key(open0);
  if (t.maze().moves !== 1) bad.push(open0 + ' on the maze page did not move the walker');
  if (page() !== at) bad.push(open0 + ' on the maze page also turned the column, to page ' + page());
  t.findPage(at, true);
  /* OFF IT: on the Find column the Games column is drawn as a neighbour, grid and all. */
  t.go('booking', false, true);
  await wait(LEAVE_MS); await woken_();
  const was = t.maze().moves;
  ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].forEach(key);
  if (t.maze().moves !== was) bad.push('arrow keys on another column walked the maze from ' + was + ' to ' + t.maze().moves + ' moves');
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  t.findPage(at, true);
  await wait(50);

  /* 3. A REPAINT KEEPS THE WALK. */
  if (t.maze() !== m0) bad.push('coming back to the column dealt a new maze');
  const drawn = walls().join(',');
  t.repaint(true);
  await wait(50);
  if (t.maze() !== m0 || t.maze().moves !== 1) bad.push('a repaint threw the walk away: moves ' + (t.maze() || {}).moves);
  if (walls().join(',') !== drawn) bad.push('a repaint drew different walls');

  /* 4. NEW MAZE STARTS AGAIN, and the shortest route read off the drawn walls finishes it. */
  const press = dd => { const el = d.createElement('button'); el.setAttribute('data-d', dd); t.ACTIONS['maze-go'](el); };
  t.ACTIONS['maze-again'](d.createElement('button'));
  const m1 = t.maze();
  if (m1 === m0 || m1.moves !== 0 || m1.x !== 0 || m1.y !== 0) bad.push('New maze did not start a fresh one at the top left');
  const way = route(walls(), 0);
  if (!way) return bad.concat(['the drawn walls have no way from the top left to the bottom right']);
  if (way.length !== m1.best) bad.push('the shortest way through the drawn walls is ' + way.length + ' and the maze says ' + m1.best);
  const half = way.length >> 1;
  way.slice(0, half).forEach(press);
  t.repaint(true);
  await wait(50);
  if (t.maze() !== m1 || t.maze().moves !== half) bad.push('a repaint halfway threw the walk away');
  way.slice(half).forEach(press);
  const said = String((d.querySelector('#s-stuff #maze-said') || {}).textContent || '');
  if (!t.maze().over || t.maze().moves !== m1.best) bad.push('the shortest route did not finish the maze in ' + m1.best);
  if (!/the shortest way there is/.test(said)) bad.push('finishing in the fewest moves says "' + said + '"');

  /* 5. A FINISHED MAZE GIVES THE KEYS BACK, and the next start deals another. */
  key('ArrowUp');
  if (page() === at) bad.push('ArrowUp on a finished maze still did not reach the pager');
  t.findPage(at, true);
  t.repaint(true);
  await wait(50);
  if (t.maze() === m1 || t.maze().over) bad.push('a finished maze was not replaced at the next start');
  return bad;
});

/* ---------- THE FOUR CLASSROOM GAMES: A ROUND SURVIVES A REPAINT, AND WAITS WHILE YOU ARE AWAY § */
/* A COLUMN'S WIDGETS ARE STARTED AND STOPPED FROM `afterSlide_`, about 300ms after the move, so a
   journey asking what leaving did has to wait that long first. */
const LEAVE_MS = 700;
/* AND ARRIVING NO LONGER STARTS THEM ALL IN THAT ONE TASK (5 Oct, `widgetsWake_` in arcade.js): § */
const woken_ = async () => {
  for (let k = 0; k < 80; k++) {
    let quiet = true;
    try { quiet = !LAST_W || !LAST_W.__t || !LAST_W.__t.quiet || LAST_W.__t.quiet(); } catch (e) { quiet = true; }
    if (quiet) return;
    await wait(100);
  }
};
/* `k` IS WHICH WORD GAME THE WIDGET OPENS ON. § */
/* AND THE GAME'S OWN CARD IS WAITED FOR, NOT GUESSED AT. § */
const partyBoot_ = async (k) => {
  const { w } = boot({ member: true });   /* Find is for members (400), and the games are on Find since 790 */
  for (let n = 0; n < 80 && !w.__t; n++) await wait(100);
  const t = w.__t;
  if (k) { try { w.localStorage.setItem('wg-game', k); } catch (e) {} }
  t.findGroup('Games', 'wordgames');
  await wait(LEAVE_MS); await woken_();
  const d = w.document;
  for (let n = 0; n < 80; n++) {
    let ready = false;
    try { ready = (!k || !!d.getElementById(k + '-card')) && !!t.PARTY(); } catch (e) { ready = false; }
    if (ready) break;
    await wait(100);
  }
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    t.ACTIONS[act](el);
  };
  const text = k => String((d.getElementById(k + '-card') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  const acts = k => String((d.getElementById(k + '-acts') || {}).textContent || '').replace(/\s+/g, ' ').trim();
  return { w, t, d, press, text, acts, P: () => t.PARTY() };
};

check('just a minute keeps its round through a repaint and pauses when the column is left', async () => {
  const { t, d, press, text, acts, P } = await partyBoot_('jam');
  if (!d.getElementById('jam-card')) return ['Just a Minute did not draw on the Games column'];
  if (!P()) return ['the PARTY state is not reachable, so nothing about the round can be asked'];
  const bad = [];
  press('jam-start');
  const s = P().jam;
  if (!s || !s.topic || !s.ends) return ['Start did not deal a topic and start the clock'];
  if (text('jam').indexOf(s.topic) === -1) bad.push('the topic is not on the card: "' + text('jam') + '"');
  press('jam-call', { 'data-c': 'r' });
  press('jam-call', { 'data-c': 'r' });
  press('jam-call', { 'data-c': 'h' });
  if (!/Repetition\s*2/.test(acts('jam')) || !/Hesitation\s*1/.test(acts('jam'))) {
    bad.push('two repetitions and a hesitation read "' + acts('jam') + '"');
  }
  const topic = s.topic;
  t.repaint(true);
  await wait(50);
  const r = P().jam;
  if (!r || r.topic !== topic || r.tally.r !== 2) bad.push('a repaint threw the round away');
  if (!r || !r.ends) bad.push('a repaint left the clock stopped with the Games column still in front');
  if (text('jam').indexOf(topic) === -1) bad.push('after a repaint the card reads "' + text('jam') + '"');
  /* AWAY: the clock holds, and stays held on the way back. */
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  const held = P().jam;
  if (held.ends || held.run) bad.push('leaving the column left the clock running');
  const left = held.left;
  await wait(1200);
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  if (P().jam.ends) bad.push('coming back started the clock without anybody pressing Resume');
  if (P().jam.left !== left) bad.push('the minute went on running while the column was away: ' + left + ' became ' + P().jam.left);
  if (!/Resume/.test(text('jam'))) bad.push('a paused round has no Resume: "' + text('jam') + '"');
  press('party-resume', { 'data-g': 'jam' });
  if (!P().jam.ends) bad.push('Resume did not start the clock again');
  /* AND THE END: a round whose minute is up says so and keeps its tally. */
  P().jam.ends = Date.now() + 100;
  await wait(600);
  if (P().jam.phase !== 'done' || !/Time/.test(text('jam')) || !/Repetition 2/.test(text('jam'))) {
    bad.push('a finished minute reads "' + text('jam') + '"');
  }
  return bad;
});

check('taboo shows a word with four or five forbidden words, and Correct and Pass deal the next', async () => {
  const { t, d, press, text, P } = await partyBoot_('tab');
  if (!d.getElementById('tab-card')) return ['Taboo did not draw on the Games column'];
  const bad = [];
  press('tab-start');
  const s = P().tab;
  if (!s || !s.ends) return ['Start did not begin a round'];
  const ban = d.querySelectorAll('#tab-card .tab-ban li').length;
  if (ban < 4 || ban > 5) bad.push(ban + ' forbidden words on the card');
  if (text('tab').indexOf(s.card[0]) === -1) bad.push('the word is not on the card');
  const first = s.card[0];
  press('tab-next', { 'data-got': '1' });
  press('tab-next', { 'data-got': '0' });
  if (s.score !== 1 || s.passed !== 1) bad.push('a Correct and a Pass counted ' + s.score + ' and ' + s.passed);
  if (s.card[0] === first) bad.push('Correct and Pass did not deal another word');
  t.repaint(true);
  await wait(50);
  if (P().tab !== s || !P().tab.ends) bad.push('a repaint stopped or replaced the round');
  /* PAUSED, THE WORD IS NOT ON THE CARD — whoever picks the phone up next may be on the other side. */
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  if (text('tab').indexOf(s.card[0]) !== -1) bad.push('a paused card still shows the word');
  return bad;
});

/* AND THE SAVED COLUMN IS NOT "HERE" FOR A GAME NOBODY STARRED. § */
check('a round left for the Saved column, where it is not starred, pauses like any other leave', async () => {
  const { t, d, press, P } = await partyBoot_('tab');
  if (!d.getElementById('tab-card')) return ['Taboo did not draw on the Games column'];
  const bad = [];
  press('tab-start');
  if (!P().tab || !P().tab.ends) return ['Start did not begin a round'];
  if (d.querySelector('#s-saved #tab-card')) return ['Taboo is already on the Saved column, so this asks nothing'];
  t.go('saved', false, true);
  await wait(LEAVE_MS); await woken_();
  const s = P().tab;
  if (s.ends || s.run) bad.push('the clock went on running behind the Saved column, where the card is not');
  const left = s.left;
  await wait(800);
  if (P().tab.left !== left) bad.push('the minute ran down while the round was on no screen');
  return bad;
});

check('hot seat shows its word only once the phone faces the class, and hides it when the column goes', async () => {
  const { t, d, press, text, P } = await partyBoot_('hot');
  if (!d.getElementById('hot-card')) return ['Hot Seat did not draw on the Games column'];
  const bad = [];
  press('hot-start');
  const s = P().hot;
  if (!s) return ['Start did not begin a round'];
  if (s.ends) bad.push('the clock started before the word was shown');
  if (text('hot').indexOf(s.word) !== -1) bad.push('the word is on the screen before the phone is turned to the class');
  press('party-resume', { 'data-g': 'hot' });
  if (!s.ends || text('hot').indexOf(s.word) === -1) bad.push('Show the word did not show it and start the clock');
  press('hot-next', { 'data-got': '1' });
  if (s.score !== 1) bad.push('Got it did not count');
  const word = s.word;
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  if (text('hot').indexOf(word) !== -1) bad.push('the word is still up after leaving the column and coming back');
  if (P().hot.ends) bad.push('coming back started the clock by itself');
  return bad;
});

check('20 questions keeps the secret from the room and counts to twenty', async () => {
  const { t, d, press, text, P } = await partyBoot_('twq');
  if (!d.getElementById('twq-card')) return ['20 Questions did not draw on the Games column'];
  const bad = [];
  press('twq-start');
  const s = P().twq;
  if (!s || !s.word) return ['Start did not choose a secret'];
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is on the screen before anybody pressed Show me');
  press('twq-show');
  if (text('twq').indexOf(s.word) === -1) bad.push('Show me did not show the secret');
  /* LEAVING WITH THE SECRET UP HIDES IT. */
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is still up after leaving the column');
  press('twq-show');
  press('twq-hide');
  if (text('twq').indexOf(s.word) !== -1) bad.push('the secret is on the screen while the class asks');
  for (let i = 0; i < 5; i++) press('twq-ask');
  t.repaint(true);
  for (let n = 0; n < 60 && !text('twq'); n++) await wait(50);   /* Find fills its page after the paint (790) */
  if (P().twq.asked !== 5 || !/5 of 20/.test(text('twq'))) bad.push('five questions and a repaint read "' + text('twq') + '"');
  for (let i = 0; i < 20; i++) press('twq-ask');
  if (P().twq.asked !== 20 || P().twq.phase !== 'done') bad.push('the count went past twenty or did not end: ' + P().twq.asked);
  if (text('twq').indexOf(s.word) === -1 || !/Out of questions/.test(text('twq'))) bad.push('the end does not reveal the secret: "' + text('twq') + '"');
  return bad;
});

/* ---------- TOOLS AND GAMES ARE FIND CARDS (790) ---------- */
check('790: Find › Games is an answer and a game on it opens and plays; Find › Tools › Calculator adds up; no Tools or Games column', async () => {
  const { w } = boot({ member: true });
  await wait(300);
  const t = w.__t, d = w.document, bad = [];
  const ids = t.TABS.map(x => x.id);
  if (ids.indexOf('tools') !== -1 || ids.indexOf('games') !== -1) bad.push('the columns still include ' + ids.filter(x => x === 'tools' || x === 'games').join(', '));
  if (d.getElementById('s-tools') || d.getElementById('s-games')) bad.push('index.html still has a Tools or Games section');
  /* THE FIRST QUESTION OFFERS BOTH, as ordinary answers. */
  t.go('stuff', false, true);
  await wait(LEAVE_MS);
  const first = [...d.querySelectorAll('#s-stuff [data-do="facet-pick"], #s-stuff .fc-ans, #s-stuff button')].map(b => b.textContent.trim());
  ['Tools', 'Games'].forEach(g => { if (!first.some(s => s.indexOf(g) === 0)) bad.push('Find\'s first question does not offer ' + g); });
  /* A GAME: Word games, Herd Mentality, Next question deals another. */
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  const games = t.widgetsOf('game').map(x => String(x.id));
  const n = games.indexOf('wordgames');
  if (n < 0) return bad.concat(['Word games is not a Find card: ' + games.join(', ')]);
  t.findPage(n, true);
  await wait(LEAVE_MS); await woken_();
  for (let i = 0; i < 40 && !d.querySelector('#s-stuff #wg-pick'); i++) await wait(50);
  const sel = d.querySelector('#s-stuff #wg-pick');
  if (!sel) return bad.concat(['Find › Games › Word games did not start: no game dropdown in its card']);
  if (!d.querySelector('#s-stuff #wgt-wordgames').closest('.card').querySelector('[data-do="rep-box"]')) bad.push('the Word games card has no Suggest tile');
  sel.value = 'herd'; t.ACTIONS['wg-pick'](sel);
  const q1 = String((d.getElementById('herd-q') || {}).textContent || '').trim();
  const next = d.querySelector('#s-stuff [data-do="herd-next"]');
  if (!q1 || !next) bad.push('Herd Mentality dealt nothing on Find');
  else {
    t.ACTIONS['herd-next'](next);
    const q2 = String((d.getElementById('herd-q') || {}).textContent || '').trim();
    if (!q2 || q2 === q1) bad.push('Next question did not deal another on Find: "' + q1 + '" then "' + q2 + '"');
  }
  /* A TOOL: the calculator, started by Find as Tools started it, works its keys. */
  t.findGroup('Tools');
  await wait(LEAVE_MS); await woken_();
  const tools = t.widgetsOf('tool').map(x => String(x.id));
  const c = tools.indexOf('calculator');
  if (c < 0) return bad.concat(['the Calculator is not a Find card under Tools']);
  t.findPage(c, true);
  await wait(LEAVE_MS); await woken_();
  for (let i = 0; i < 40 && !d.querySelector('#s-stuff #wgt-calculator #mc-display .mc-out'); i++) await wait(50);
  if (!t.running().some(r => r.id === 'calculator' && r.col === 'stuff')) bad.push('the calculator is not running on Find: ' + JSON.stringify(t.running()));
  const key = k => { const b = d.querySelector('#s-stuff #wgt-calculator [data-mc="' + k + '"]'); if (b) b.dispatchEvent(new w.MouseEvent('click', { bubbles: true })); return !!b; };
  if (!['7', '+', '8', '='].every(key)) return bad.concat(['the calculator card on Find has no keys']);
  const out = String((d.querySelector('#s-stuff #wgt-calculator .mc-out') || {}).textContent || '');
  if (out.trim() !== '15') bad.push('7 + 8 = on Find › Tools › Calculator reads "' + out + '"');
  /* LEAVING FIND STOPS IT, as leaving Tools did. */
  t.go('booking', false, true);
  await wait(LEAVE_MS); await woken_();
  if (t.running().some(r => r.col === 'stuff')) bad.push('leaving Find left ' + t.running().filter(r => r.col === 'stuff').map(r => r.id).join(', ') + ' running');
  return bad;
});

/* ---------- THE WORD GAMES ARE ONE WIDGET, AND SWITCHING GAME IS A LEAVE § */
check('the word games are one widget, and switching game pauses the one left', async () => {
  const { t, d, press, text, P } = await partyBoot_('tab');
  const bad = [];
  const ids = t.allWidgets().map(x => x.id);
  ['articulate', 'charades', 'taboo', 'hotseat', 'justaminute', 'twentyq', 'imposter', 'herd', 'tables'].forEach(id => {
    if (ids.indexOf(id) !== -1) bad.push(id + ' is still a widget of its own beside Word games');
  });
  if (ids.indexOf('wordgames') === -1) return bad.concat(['there is no Word games widget']);
  const sel = d.getElementById('wg-pick');
  if (!sel) return bad.concat(['the Word games widget has no game dropdown']);
  const offered = [...sel.options].map(o => o.value);
  if (offered.length !== 11) bad.push('the dropdown offers ' + offered.length + ' games, wanted 11 (Word Search and Sentence Scramble since 441, the sprint since 461)');
  /* HERD MENTALITY IS THE EIGHTH — "heard mentality is a word game so should go there." Asked by
     name, because a count of eight is also seven games and a stray. */
  if (offered.indexOf('herd') === -1) bad.push('Herd Mentality is not in the dropdown');
  for (const k of offered) {
    sel.value = k;
    t.ACTIONS['wg-pick'](sel);
    if (!d.getElementById({ ws: 'ws-grid', ss: 'ss-box', tt: 'tt-idle' }[k] || k + '-card')) bad.push('choosing ' + k + ' did not draw its card');
    const others = offered.filter(o => o !== k && d.getElementById(o + '-card'));
    if (others.length) bad.push('choosing ' + k + ' left ' + others.join(', ') + ' in the slot too');
  }
  /* AND IT DEALS IN THE SLOT, IN ITS OWN LARGE TYPE. § */
  sel.value = 'herd'; t.ACTIONS['wg-pick'](sel);
  const hq = d.querySelector('#wg-slot .herd-card #herd-q');
  if (!hq) bad.push('Herd Mentality drew without the .herd-card wrapper its question type hangs off');
  else {
    const q1 = hq.textContent.trim();
    if (!q1) bad.push('choosing Herd Mentality dealt no question');
    press('herd-next');
    const q2 = String((d.getElementById('herd-q') || {}).textContent || '').trim();
    if (!q2 || q2 === q1) bad.push('Next question did not deal another: "' + q1 + '" then "' + q2 + '"');
  }
  sel.value = 'tab'; t.ACTIONS['wg-pick'](sel);
  press('tab-start');
  const s = P().tab;
  if (!s || !s.ends) return bad.concat(['Start did not begin a Taboo round']);
  const word = s.card[0];
  sel.value = 'art'; t.ACTIONS['wg-pick'](sel);
  if (P().tab.ends || P().tab.run) bad.push('a Taboo round went on running after switching to Articulate');
  sel.value = 'tab'; t.ACTIONS['wg-pick'](sel);
  if (!d.getElementById('tab-card')) bad.push('switching back did not bring Taboo back');
  else if (text('tab').indexOf(word) !== -1) bad.push('the paused Taboo card shows its word');
  if (P().tab !== s) bad.push('switching away and back threw the Taboo round away');
  if (t.wgChosen() !== 'tab') bad.push('the chosen game is not remembered on the device');
  return bad;
});

/* ---------- ALIBI IS DELETED, AND NOTHING OF IT IS LEFT TO PRESS § */
check('alibi is gone from the Games column, its handlers and its round state', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t || !t.allWidgets) return ['the widget roster is not exported'];
  const bad = [];
  if (t.allWidgets().some(x => String(x.id) === 'alibi')) bad.push('alibi is still a widget');
  ['alb-start', 'alb-next'].forEach(a => { if (t.ACTIONS[a]) bad.push(a + ' still has a handler'); });
  const P = t.PARTY();
  if (P && 'alb' in P) bad.push('PARTY still keeps a slot for an alibi round');
  t.findGroup('Games');
  await wait(LEAVE_MS); await woken_();
  if (w.document.getElementById('alb-card')) bad.push('an alibi card is still drawn on the Games column');
  return bad;
});

/* ---------- THE TIMETABLE KEEPS A WEEK, PER PERSON, ONE COLOUR A SUBJECT § */
check('the timetable keeps a week per person, one colour a subject, through a repaint', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  if (typeof w.initTimetable !== 'function' || typeof t.tmtKey !== 'function') {
    return ['the timetable widget is not in the app'];
  }
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  const kit = { name: 'Kit Other', personId: 'P8', role: 'student', roles: ['student'] };
  t.USER(sam);
  try { t.findGroup('Tools', 'timetable'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  for (let n = 0; n < 60 && !d.querySelector('#s-stuff #wgt-timetable'); n++) await wait(50);
  w.localStorage.removeItem(t.tmtKey());
  w.initTimetable();
  const box = () => d.querySelector('.tmt-box');
  if (!box()) return ['the timetable did not draw on the Tools column'];
  const press = (act, attrs) => {
    const el = d.createElement('button');
    Object.keys(attrs || {}).forEach(k => el.setAttribute(k, attrs[k]));
    if (attrs && attrs.checked) el.checked = true;
    t.ACTIONS[act](el);
  };
  const type = (f, v) => {
    const el = box().querySelector('.tmt-in[data-f="' + f + '"]');
    if (!el) return false;
    el.value = v;
    el.dispatchEvent(new w.Event('input', { bubbles: true }));
    return true;
  };
  const rows = () => [...box().querySelectorAll('.tmt-row')].map(r => ({
    at: r.querySelector('.tmt-at').textContent.trim(),
    sub: r.querySelector('.tmt-sub').textContent.trim(),
    c: r.style.getPropertyValue('--tmt-c') }));
  const bad = [];
  press('tmt-day', { 'data-day': '0' });
  for (const [sub, note] of [['Chemistry', 'Room 4'], ['History', ''], ['Maths', '']]) {
    press('tmt-add');
    if (!type('subject', sub)) { bad.push('adding a lesson does not open it with a subject box'); break; }
    if (note) type('note', note);
    const id = box().querySelector('.tmt-in').dataset.id;
    press('tmt-open', { 'data-id': id });
  }
  let r = rows();
  if (r.map(x => x.at + ' ' + x.sub).join(', ') !== '09:00 Chemistry, 10:00 History, 11:00 Maths') {
    bad.push('three lessons added read back as "' + r.map(x => x.at + ' ' + x.sub).join(', ') + '"');
  }
  if (new Set(r.map(x => x.c)).size !== 3 || r.some(x => !x.c)) {
    bad.push('three subjects are not in three colours: ' + r.map(x => x.sub + '=' + x.c).join(', '));
  }
  if (!/Room 4/.test(box().textContent)) bad.push('the note typed into the open lesson is not on its line');
  const maths = (rows().find(x => x.sub === 'Maths') || {}).c;

  /* A REPAINT REBUILDS THE MARKUP, and a timetable held only in it would be gone. § */
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  for (let n = 0; n < 60 && !box(); n++) await wait(50);   /* Find fills its page after the paint (790) */
  if (rows().length !== 3) bad.push('after a repaint the timetable holds ' + rows().length + ' lessons, not 3');

  /* SOMEBODY ELSE ON THE SAME PHONE GETS THEIR OWN — again through the repaint a sign-in does. */
  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 60 && !box(); n++) await wait(50);
  if (rows().length) bad.push('a second person signed in on the phone sees the first one\'s timetable');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
  for (let n = 0; n < 60 && !box(); n++) await wait(50);
  if (rows().length !== 3) bad.push('signing back in does not bring the timetable back');

  /* A LESSON ADDED AND SHUT WITH NOTHING IN IT GOES, rather than leaving an `Untitled` line that only
     Remove can take off. Shut three ways: Done, another day, and Add again. */
  press('tmt-add');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if (rows().length !== 3) bad.push('Add then Done with nothing typed leaves ' + rows().length + ' lessons, not 3');
  press('tmt-add');
  press('tmt-day', { 'data-day': '0' });
  press('tmt-add');
  press('tmt-add');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if (rows().length !== 3) bad.push('a blank lesson shut by another day or another Add is still on the day: ' + rows().length + ' lessons');

  /* A SUBJECT IN ANOTHER ALPHABET HAS A COLOUR. `[a-z0-9]` reduced `Ελληνικά` to nothing. And the time
     arrives on `change` as well as `input`, which is what an older phone's wheel sends. */
  press('tmt-add');
  type('subject', 'Ελληνικά');
  const at = box().querySelector('.tmt-in[data-f="at"]');
  if (at) { at.value = '15:20'; at.dispatchEvent(new w.Event('change', { bubbles: true })); }
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  const gk = rows().find(x => x.sub === 'Ελληνικά');
  if (!gk) bad.push('a Greek subject typed into a lesson is not on the day');
  else {
    if (!gk.c) bad.push('a subject written in Greek letters is drawn with no colour');
    if (gk.at !== '15:20') bad.push('a time sent only as `change` is not kept: the line reads ' + gk.at);
  }
  const g = [...box().querySelectorAll('.tmt-row')].find(x => /Ελληνικά/.test(x.textContent));
  if (g) press('tmt-drop', { 'data-id': g.dataset.id });

  /* A COLOUR DOES NOT MOVE WHEN ANOTHER SUBJECT ARRIVES EARLIER IN THE WEEK. */
  press('tmt-add');
  type('subject', 'Art');
  type('at', '08:00');
  press('tmt-open', { 'data-id': box().querySelector('.tmt-in').dataset.id });
  if ((rows().find(x => x.sub === 'Maths') || {}).c !== maths) bad.push('adding Art at 08:00 changed Maths\'s colour');
  if ((rows()[0] || {}).sub !== 'Art') bad.push('a lesson at 08:00 is not first on the day');

  press('tmt-weekend', { checked: true });
  if (box().querySelectorAll('.tmt-day').length !== 7) bad.push('ticking Weekend does not show seven days');
  press('tmt-weekend');
  if (box().querySelectorAll('.tmt-day').length !== 5) bad.push('unticking Weekend does not go back to five days');

  const hid = [...box().querySelectorAll('.tmt-row')].find(x => /History/.test(x.textContent));
  if (hid) press('tmt-drop', { 'data-id': hid.dataset.id });
  if (rows().some(x => x.sub === 'History') || rows().length !== 3) bad.push('Remove does not take the lesson off');
  w.localStorage.removeItem(t.tmtKey());
  return bad;
});

/* ---------- TOUCH TYPING: KEYS MOVE THE LINE, A WRONG ONE COUNTS, THE LADDER IS KEPT PER PERSON § */
check('touch typing moves on a right key, counts a wrong one, keeps the ladder per person', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  const d = w.document;
  if (typeof w.initTyping !== 'function' || typeof w.ktKey_ !== 'function' || typeof w.ktNow_ !== 'function') {
    return ['the touch-typing widget is not in the app'];
  }
  const sam = { name: 'Sam Student', personId: 'P9', role: 'student', roles: ['student'] };
  const kit = { name: 'Kit Other', personId: 'P8', role: 'student', roles: ['student'] };
  t.USER(kit); w.localStorage.removeItem(w.ktKey_());
  t.USER(sam); w.localStorage.removeItem(w.ktKey_());
  try { t.findGroup('Tools'); } catch (e) { return ['go("tools") threw: ' + e.message]; }
  await wait(300);
  /* TO ITS OWN PAGE, the way a swipe arrives: the Tools column keeps only the pages near the one
     being looked at in the document, and this card is tenth. */
  const n = w.widgetsOf_('tool').findIndex(x => String(x.id) === 'typing');
  if (n < 0) return ['there is no typing widget in the Tools roster'];
  try { t.findPage(n, true); } catch (e) { return ['goPage("tools", ' + n + ') threw: ' + e.message]; }
  const box = () => d.querySelector('.kt-box');
  /* WAITED FOR, NOT SLEPT FOR. § */
  for (let i = 0; i < 40 && !(box() && box().querySelector('.kt-in')); i++) await wait(50);
  if (!box() || !box().querySelector('.kt-in')) return ['the touch-typing card did not draw on the Tools column with its box'];
  const bad = [];

  /* THROUGH `ktLesson_`, NOT `KT_LESSONS`: § */
  const lessons = typeof w.ktLessonCount_ === 'function'
    ? Array.from({ length: w.ktLessonCount_() }, (_, i) => w.ktLesson_(i)) : [];
  if (lessons.length !== 5) bad.push('the ladder has ' + lessons.length + ' lessons, not 5');
  lessons.forEach((L, n) => {
    for (let i = 0; i < 50; i++) {
      const line = w.ktLine_(n);
      const stray = [...line].filter(c => /[a-z]/i.test(c) && !L.keys.includes(c.toLowerCase()));
      const caps = /[A-Z]/.test(line), marks = /[,.;:?']/.test(line.replace(/\.$/, ''));
      if (stray.length) { bad.push(L.name + ' drew a line with keys it has not taught: "' + line + '"'); break; }
      if (!L.caps && caps) { bad.push(L.name + ' drew a capital: "' + line + '"'); break; }
      if (!L.marks && marks) { bad.push(L.name + ' drew a mark: "' + line + '"'); break; }
      /* "alas alas" was the first screenshot's home row: one word practised twice, not the row. */
      const ws = line.toLowerCase().replace(/[^a-z' ]/g, '').split(' ');
      if (ws.some((x, j) => j && x === ws[j - 1])) { bad.push(L.name + ' drew a word twice running: "' + line + '"'); break; }
    }
  });

  let heard = 0;
  const ear = e => { if (e.key && e.key.length === 1) heard++; };
  w.addEventListener('keydown', ear);
  const key = k => {
    const el = box().querySelector('.kt-in');
    el.dispatchEvent(new w.KeyboardEvent('keydown', { key: k, bubbles: true, cancelable: true }));
  };
  const done = () => (box().querySelector('.kt-done') || {}).textContent || '';
  t.ACTIONS['kt-focus'](box().querySelector('.kt-line'));
  if (!box().classList.contains('typing')) bad.push('tapping the line does not put the card into typing');

  const line = w.ktNow_().line;
  for (const c of line.slice(0, 5)) key(c);
  if (done() !== line.slice(0, 5)) bad.push('five right keys leave "' + done() + '" done, not "' + line.slice(0, 5) + '"');
  if (heard) bad.push(heard + ' typed keys reached a listener on the window — the space bar is Flabby Pird\'s again');

  const want = line[5];
  const next = box().querySelector('.kt-k.next');
  if (!next || next.textContent.trim() !== (want === ' ' ? 'space' : want.toLowerCase())) {
    bad.push('the key lit is "' + (next ? next.textContent.trim() : 'none') + '" and the next letter is "' + want + '"');
  }
  key(want === 'q' ? 'z' : 'q');
  if (done() !== line.slice(0, 5)) bad.push('a wrong key moved the line on');
  if (w.ktNow_().wrong !== 1) bad.push('a wrong key was counted ' + w.ktNow_().wrong + ' times, not once');
  if (!box().querySelector('.kt-k.miss')) bad.push('a wrong key is not shown on the keyboard');
  if ((box().querySelector('.kt-acc') || {}).textContent === '100%') bad.push('accuracy still reads 100% after a wrong key');

  /* THE PHONE'S DOOR: the character lands in the box, and the box is emptied so the next lands alone. */
  const inp = box().querySelector('.kt-in');
  inp.value = want;
  inp.dispatchEvent(new w.Event('input', { bubbles: true }));
  if (done() !== line.slice(0, 6)) bad.push('a key that arrives as `input`, as a phone sends it, does not move the line');
  if (box().querySelector('.kt-in').value) bad.push('the hidden box is not emptied after a phone key');
  if (d.activeElement !== box().querySelector('.kt-in')) bad.push('the hidden box lost the focus while typing');

  /* THREE CLEAN LINES OPEN THE NEXT RUNG. */
  for (const c of line.slice(6)) key(c);
  for (let i = 0; i < 2; i++) for (const c of w.ktNow_().line) key(c);
  const rung2 = () => box().querySelector('.kt-rung[data-n="1"]');
  if (!rung2() || rung2().disabled) bad.push('three lines at 90% or better did not open the Top row');
  let kept = {};
  try { kept = JSON.parse(w.localStorage.getItem(w.ktKey_()) || '{}'); } catch (e) {}
  if (kept.open !== 1) bad.push('the ladder on the device says open ' + kept.open + ', not 1');

  /* THROUGH `repaint` AND NOTHING ELSE, the timetable journey's lesson: a half-typed line and the
     open rung both survive the app's own redraw. */
  const half = w.ktNow_().line.slice(0, 3);
  for (const c of half) key(c);
  try { t.repaint(); } catch (e) { bad.push('repaint threw: ' + e.message); }
  if (!rung2() || rung2().disabled) bad.push('after a repaint the Top row is shut again');
  if (done() !== half) bad.push('after a repaint the line in hand reads "' + done() + '" done, not "' + half + '"');

  t.USER(kit);
  try { t.repaint(); } catch (e) {}
  if (!rung2() || !rung2().disabled) bad.push('a second person on the machine finds the first one\'s Top row open');
  if (done()) bad.push('a second person on the machine gets the first one\'s half-typed line');
  t.USER(sam);
  try { t.repaint(); } catch (e) {}
  if (!rung2() || rung2().disabled) bad.push('signing back in does not bring the ladder back');

  w.removeEventListener('keydown', ear);
  w.localStorage.removeItem(w.ktKey_());
  return bad;
});

/* ---------- VENUES ARE OFF FIND, AND A STARRED VENUE IS STILL ON SAVED § */
check('venues are off Find, and a starred venue is still on Saved', async () => {
  const { w } = boot();
  await wait(300);
  const t = w.__t;
  if (!t.funnelItems || !t.allItems || !t.savedPages || !t.doors || !t.star) {
    return ['the funnel\'s two lists and the Saved column are not exported'];
  }
  const bad = [];
  const all = t.allItems().filter(x => x.kind === 'venue');
  if (!all.length) return ['the payload\'s two venues are not items at all, so nothing here measures anything'];
  const found = t.funnelItems().filter(x => x.kind === 'venue');
  if (found.length) {
    bad.push(found.length + ' venue(s) are still in the list Find draws (' + found.map(x => x.name).join(', ')
             + ') — the owner asked for booking places to be taken off it. See `venue` in KINDS.');
  }
  const doors = t.doors();
  const fused = doors.filter(d => /,/.test(d));
  if (fused.length) bad.push('Find\'s first question offers ' + fused.map(d => '"' + d + '"').join(', ')
                             + ' — two groups drawn as one door');
  if (doors.some(d => /^(Places|Booking)$/i.test(d))) {
    bad.push('Find\'s first question still offers ' + doors.join(' | '));
  }
  t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  t.star(all[0].key);
  const saved = t.savedPages().join('');
  if (saved.indexOf(all[0].name) === -1) {
    bad.push('"' + all[0].name + '" was starred and is not on the Saved column — taking a kind off Find '
             + 'must not take it off the list of things somebody kept. See `collItems_`.');
  }
  return bad;
});

/* THE IPAD DOUBLE TAP (466) — the owner: "With iPad when I double tap on the screen, it breaks — the widget list shifts up." */
check('a double tap neither zooms nor moves the column: touch-action manipulation on the page, and dblclick is refused', async () => {
  const css = fs.readFileSync(path.join(dir, '..', 'style.css'), 'utf8');
  const bad = [];
  const html = /\nhtml \{[^}]*touch-action:\s*manipulation/.test(css);
  if (!html) bad.push('style.css: `html` has no `touch-action: manipulation` — iPad Safari double-tap-zooms whatever the viewport says');
  const { w } = boot();
  await wait(200);
  const ev = new w.MouseEvent('dblclick', { bubbles: true, cancelable: true });
  w.document.getElementById('screen').dispatchEvent(ev);
  if (!ev.defaultPrevented) bad.push('a dblclick on the app was not refused — Safari would zoom on it');
  return bad;
});

/* NO SPLASH (466) — the owner: "I want to click on the app and it opens straight away." The first screen is drawn before the payload, and the load still says when it finished. */
check('the app opens straight onto its first screen, and the load says when it finished', async () => {
  const { w } = boot();
  const bad = [];
  if (w.document.getElementById('splash')) bad.push('there is a #splash again — nothing may cover the app while it loads');
  const first = w.document.getElementById('s-' + w.__t.AT());
  /* DRAWN, not necessarily full: the feed's posts come with the payload, so before it the feed is loading_()'s dots in place, under nothing. */
  if (!first || !(first.textContent.trim() || first.querySelector('.loading[role="status"]'))) bad.push('the first screen is empty straight after boot — it must draw (its own dots if it waits) before the payload');
  await wait(400);
  if (!w.document.documentElement.classList.contains('is-loaded')) bad.push('`html.is-loaded` never came — load() did not finish, and nothing would say why');
  return bad;
});

check('every tab draws something', async () => {
  const { w, errs } = boot();
  await wait(300);
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const bad = [];
  /* THE SCREENS THAT EXIST, read off `TABS` rather than written out. § */
  (w.__t.TABS || []).map(t => t.id).forEach(id => {
    try { w.__t.go(id, false, true); } catch (e) { bad.push(id + ' threw: ' + e.message); return; }
    const el = w.document.getElementById('s-' + id);
    if (!el) { bad.push(id + ': no screen element'); return; }
    /* THE ONE LOADER IS SOMETHING DRAWN ON MESSAGES ALONE, and only while its ask is out: § */
    if (!el.textContent.trim() && !(id === 'dm' && el.querySelector('.loading'))) bad.push(id + ': drew nothing at all');
  });
  /* AND MESSAGES ONCE ITS ASK HAS ANSWERED: words, not the loader for ever. */
  await wait(300);
  const dm = w.document.getElementById('s-dm');
  if (dm && !dm.textContent.trim()) bad.push('dm: still drew nothing but the loader after its ask answered');
  if (errs.length) bad.push('errors: ' + errs.join(' | '));
  return bad;
});

check('a booking is drawn as the right kind of document', async () => {
  const { w } = boot();
  await wait(300);
  if (!w.__t.stage) return ['jobStage_ does not exist — the four widget states are not built'];
  const bad = [];
  const want = { 'J-ASK': 'application', 'J-OK': 'application', 'J-PAID': 'receipt',
                 'W-LIST': 'waitlist' };
  (w.__t.whoami() || {});
  const jobs = payload().jobs;
  jobs.forEach(j => {
    const got = w.__t.stage(j);
    if (got !== want[j.id]) bad.push(j.id + ' drew as ' + got + ', expected ' + want[j.id]);
  });
  /* AND THE ONE THAT MATTERS MOST: accepted-but-unpaid is still an application. It was drawn as a
     receipt once, which told a family they had bought something they had not. */
  if (w.__t.accepted) {
    const ok = jobs.find(j => j.id === 'J-OK');
    if (!w.__t.accepted(ok)) bad.push('J-OK is agreed on both sides and does not read as accepted');
    const ask = jobs.find(j => j.id === 'J-ASK');
    if (w.__t.accepted(ask)) bad.push('J-ASK is still waiting and reads as accepted');
  }
  return bad;
});

check('every question the form asks has a row on the paper', async () => {
  /* ---------- THE CARD USED TO DELETE ITS OWN UNANSWERED QUESTIONS § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  B.how = 'Instant class';
  B.loc = 'Colliers Wood Library';
  /* ENOUGH TO BE COSTABLE, which is the state the fault needed — an unpriced booking always drew
     the full list and looked fine. */
  B.subjects = ['Maths'];
  B.level = '11+';

  const html = w.__t.paper ? w.__t.paper() : '';
  if (!html) return ['bookBreakdown is not exported — cannot check the paper'];
  const bad = [];
  /* ---------- A WEEK STEP IS SEVEN ROWS AND ITS `short` NAMES NONE OF THEM § */
  const days = w.__t.days ? w.__t.days() : [];
  w.__t.STEPS
    .filter(s => { try { return s.options().filter(Boolean).length > 0; } catch (e) { return false; } })
    .forEach(s => {
      const want = s.week ? days.map(d => String(d).slice(0, 3)) : [s.short || s.id];
      if (s.week && !days.length) { bad.push('SLOT_DAYS is not exported — cannot check a week step'); return; }
      want.forEach(k => {
        if (!html.includes('>' + k + '<')) {
          bad.push('"' + s.label + '" is asked but has no ' + (s.week ? k + ' ' : '') + 'row on the paper');
        }
      });
    });
  return bad;
});

check('the paper keeps the same rows whatever is answered', async () => {
  /* ---------- ROWS USED TO COME AND GO § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;

  /* THE QUESTIONS ONLY, which is what has to hold still. § */
  const asked = w.__t.STEPS.map(s => s.short || s.id);
  const shape = skip => (w.__t.paper().match(/class="bk-k">[^<]*/g) || [])
    .map(x => x.split('>')[1])
    .filter(k => asked.indexOf(k) !== -1 && (!skip || skip.indexOf(k) === -1))
    .join('|');

  /* ---------- AND ONE QUESTION MAY BELONG TO ONE BRANCH, IF IT SAYS SO § */
  /* ---------- A WEEK STEP'S ROWS ARE SHARED BY BOTH BRANCHES ON PURPOSE § */
  const BRANCHED = w.__t.STEPS.filter(s => s.only && !s.week).map(s => s.short || s.id);
  const has = k => shape().split('|').indexOf(k) !== -1;

  B.how = 'Instant class'; B.loc = 'Colliers Wood Library';
  B.subjects = []; B.level = ''; B.joining = '';
  const blank = shape();
  const blankShared = shape(BRANCHED);
  const bookOnly = w.__t.STEPS.filter(s => s.only && !s.week).map(s => [s.short || s.id, s.only, has(s.short || s.id)]);

  B.subjects = ['Maths']; B.level = '11+';
  const priced = shape();

  B.how = 'Waiting list class';
  const klass = shape();
  const klassShared = shape(BRANCHED);
  const waitOnly = w.__t.STEPS.filter(s => s.only && !s.week).map(s => [s.short || s.id, s.only, has(s.short || s.id)]);

  const bad = [];
  if (!blank) bad.push('the paper drew no rows at all');
  if (priced !== blank) {
    bad.push('answering changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + priced);
  }
  if (klassShared !== blankShared) {
    bad.push('choosing a waiting list changed which rows exist:\n            was  ' + blank
      + '\n            now  ' + klass);
  }
  /* `only:` IS A LIST OF WORDS NOW (docs/history/353): § */
  const SAYS = { book: ['book', 'tutoring'], wait: ['wait'] };
  const owed = (only, on) => String(only).split(',').map(x => x.trim()).some(x => SAYS[on].indexOf(x) !== -1);
  [['book', bookOnly], ['wait', waitOnly]].forEach(([on, list]) => {
    list.forEach(([k, only, there]) => {
      if (owed(only, on) && !there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is not on that branch\'s paper');
      if (!owed(only, on) && there) bad.push('"' + k + '" is declared only: ' + only
        + ' and is drawn on the ' + on + ' branch as well, so the flag does nothing');
    });
  });
  return bad;
});

check('a price lands on the question that caused it', async () => {
  /* ---------- THE FIGURES WERE STRANDED FROM THEIR ANSWERS § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.paper) return ['bookBreakdown is not exported — cannot check the paper'];
  w.__t.USER({ name: 'Pat Parent', personId: 'P1', role: 'parent', roles: ['parent'] });
  Object.assign(w.__t.BOOKING, { how: 'Instant class', loc: 'Colliers Wood Library',
    level: '11+', n: '2', subjects: ['Maths', 'English'] });

  const html = w.__t.paper();
  const rows = html.match(/<div class="bk-row[\s\S]*?<span class="bk-t">[^<]*<\/span>/g) || [];
  const cell = (r, c) => ((r.match(new RegExp('class="' + c + '">([^<]*)')) || [])[1] || '').trim();
  const find = k => rows.find(r => cell(r, 'bk-k') === k);

  const bad = [];
  const venue = find('Venue');
  if (!venue) bad.push('there is no Venue row at all');
  else if (!cell(venue, 'bk-t')) {
    bad.push('the Venue row carries no running total — its price did not find its question');
  }
  /* ---------- AND THE BASE LINE IS STILL THERE, WHEREVER IT NOW LIVES § */
  const tutor = find('Tutor');
  if (!tutor) bad.push('there is no Tutor row, so the base charge has nowhere to be');
  else if (!cell(tutor, 'bk-t')) {
    bad.push('the base charge has vanished — the Tutor row carries no running total');
  }
  return bad;
});

check('an instant class with room can be joined, not only a waiting list', async () => {
  /* ---------- HALF THE JOINABLE THINGS WERE INVISIBLE § */
  const { w } = boot();
  await wait(300);
  if (!w.__t.STEPS) return ['BOOK_STEPS is not exported — cannot check the form'];
  w.__t.USER({ name: 'Somebody Else', personId: 'P9', role: 'parent', roles: ['parent'] });
  const B = w.__t.BOOKING;
  const step = w.__t.STEPS.find(s => s.id === 'joining');
  if (!step) return ['there is no joining step'];

  const bad = [];
  B.how = '';
  if (step.options().filter(Boolean).length) {
    bad.push('classes are offered before the kind has been chosen');
  }
  B.how = 'Instant class';
  if (step.options().filter(Boolean).length < 1) {
    bad.push('an instant booking is offered nothing at all, not even "start a new one"');
  }
  B.how = 'Waiting list class';
  const lists = step.options().filter(Boolean);
  if (!lists.length) bad.push('a waiting list booking is offered nothing');
  return bad;
});

