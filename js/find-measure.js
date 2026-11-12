function docketSave(list) {
  if (!USER) return;
  USER.todo = docketText(list);
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
  paintDocket();

  /* Debounced, because ticking four things off in four seconds is one intention and four writes
     to a spreadsheet cell. The last one wins and the three before it were never worth sending. */
  clearTimeout(dockTimer);
  const said = $('dock-said');
  if (said) said.textContent = 'Saving…';
  /* AND BOOKED TO GO AS THE PAGE GOES (`keepDue_`, data.js; 317). */
  const sendTodo = keepalive => {
    clearTimeout(dockTimer);
    keepDue_('docket', null);
    if (!USER) return;
    return api({ action: 'saveTodo',
      name: USER.name, personId: USER.personId, todo: USER.todo }, keepalive ? { keepalive: true } : undefined)
      .then(d => {
        if (d && d.error) throw new Error(d.error);
        const el = $('dock-said');
        if (el) el.textContent = 'Saved';
      })
      .catch(err => {
        /* SAID, not swallowed. A list that looks saved and is not is worse than one that never
           pretended — you find out by opening it tomorrow to nothing. */
        const el = $('dock-said');
        if (el) el.textContent = why_(err);
      });
  };
  dockTimer = setTimeout(sendTodo, 900);
  keepDue_('docket', sendTodo);
}

function paintDocket() {
  const host = $('docket-body');
  if (!host) return;
  /* SIGNED OUT, NO ADD ROW (720): it took a line and did nothing with it, which reads as broken. */
  const row = host.parentElement && host.parentElement.querySelector('.dock-new');
  if (row) row.hidden = !USER;
  if (!USER) { host.innerHTML = empty_('Sign in to keep a docket.'); return; }
  /* Google Tasks lives with the tasks it copies, not in Student settings (491). */
  const gt = $('docket-gtasks');
  if (gt) gt.innerHTML = typeof gtasksCard_ === 'function' ? gtasksCard_() : '';

  const list = docketLines();
  if (!list.length) {
    host.innerHTML = empty_('Nothing on it yet.');
    return;
  }
  const left = list.filter(l => !l.done).length;

  /* ---------- A ROW IS IDENTIFIED BY ITS TEXT, NOT BY WHERE IT SITS § */
  host.innerHTML = list.map((l, i) => `
    <label class="dock-row${l.done ? ' done' : ''}">
      <input type="checkbox" data-do="dock-tick" data-i="${i}" data-t="${esc(l.text)}"
             ${l.done ? 'checked' : ''}>
      <span class="box"></span>
      <span class="dock-text">${mark(l.text)}</span>
      ${/* A BUTTON, NOT A SPAN. § */
            ''}
      ${tile_({ icon: 'close', label: 'Remove ' + l.text, act: 'dock-drop', data: { i: i, t: l.text }, cls: 'text-drop' })}
    </label>`).join('')
    + `<div class="row dock-foot">
        <span class="k">${left ? left + ' left' : 'All done'}</span>
        ${list.length > left
          ? '<span class="v">' + tile_({ form: true, label: 'Clear done', act: 'dock-clear', kind: 'quiet', cls: 'tiny' }) + '</span>'
          : ''}
      </div>`;
}

/* WHICH ROW THE TAP MEANT. See the note in `paintDocket`: the index is a hint, the text is the
   identity, because the list can be renumbered between the draw and the tap. */
function dockRow_(list, el) {
  const i = Number(el.dataset.i);
  const t = el.dataset.t;
  if (t === undefined) return list[i] ? i : -1;        // no text to match on: markup from before
  if (list[i] && list[i].text === t) return i;
  return list.findIndex(l => l.text === t);
}

on('dock-tick', el => {
  const list = docketLines();
  const i = dockRow_(list, el);
  /* REDRAWN IF THE ROW HAS GONE, so the box does not sit checked against a line that is not there
     — the checkbox has already moved itself by the time this runs. */
  if (i < 0) { paintDocket(); return; }
  list[i].done = !!el.checked;
  docketSave(list);
});

/* Dropping one is immediate and has no undo, which is right for a line somebody wrote thirty
   seconds ago — a confirmation on a scrap of paper is a confirmation nobody reads. */
on('dock-drop', (el, e) => {
  /* It sits inside the label, so without this a tap would toggle the tick on its way past. § */
  e?.preventDefault?.();
  e?.stopPropagation?.();
  if (!sure_(el, 'Remove?')) return;
  const list = docketLines();
  const i = dockRow_(list, el);
  if (i < 0) { paintDocket(); return; }               // already gone: redraw, delete nothing
  list.splice(i, 1);
  docketSave(list);
});

on('dock-clear', () => docketSave(docketLines().filter(l => !l.done)));

on('dock-add', () => {
  const box = $('dock-add');
  const text = (box && box.value || '').trim();
  if (!text) { box?.focus(); return; }
  const list = docketLines();
  /* NEW LINES GO AT THE BOTTOM. A list that grows from the top moves everything you were reading
     every time you add to it, which on a phone means losing your place to your own typing. */
  list.push({ done: false, text });
  if (box) { box.value = ''; box.focus(); }
  docketSave(list);
});

/* Enter adds it. A phone keyboard shows "return" over that field and pressing it doing nothing is
   the smallest possible way to make a form feel broken. */
document.addEventListener('keydown', e => {
  if (e.target && e.target.id === 'dock-add' && e.key === 'Enter') {
    e.preventDefault();
    ACTIONS['dock-add']?.();
  }
});

/* ---------- THE NOTEPAD § */
/* WHETHER THIS BOX MAY KEEP A SWIPE IS A FACT ABOUT WHAT IS IN IT, AND ONLY THE APP CAN ASK. § */
function padReach_(pad) {
  if (!pad) return;
  try {
    pad.style.touchAction = pad.scrollHeight > pad.clientHeight + 6 ? 'pan-y' : 'none';
  } catch (e) { /* an old browser keeps its default scrolling */ }
}

function initPad() {
  const pad = $('notepad');
  if (!pad) return;
  pad.value = (USER && USER.notepad) || '';
  pad.disabled = !USER;
  padReach_(pad);
  const said = $('pad-said');
  if (said) said.textContent = USER ? 'Saves as you type.' : 'Sign in to keep notes.';
}

/* THE NOTEPAD'S SAFE PRESS (owner, 12 Nov): copies the notes and says so; nothing is changed or lost. */
on('pad-copy', () => {
  const pad = $('notepad'), said = $('pad-said');
  const say = t => { if (said) said.textContent = t; };
  Promise.resolve().then(() => navigator.clipboard.writeText(pad ? pad.value : '')).then(() => say('Copied.'), () => say('Copy is blocked here.'));
});
let padTimer = null;
document.addEventListener('input', e => {
  if (e.target.id !== 'notepad' || !USER) return;
  padReach_(e.target);
  USER.notepad = e.target.value;
  try { localStorage.setItem('familyUser', JSON.stringify(USER)); } catch { /* storage blocked: the sign-in still holds for this visit */ }
  clearTimeout(padTimer);
  const said = $('pad-said');
  if (said) said.textContent = 'Saving…';
  /* Longer than the docket's, because this is typed continuously rather than tapped. § */
  padTimer = setTimeout(padSend_, 1400);
  keepDue_('notepad', padSend_);
});
function padSend_(keepalive) {
  clearTimeout(padTimer);
  keepDue_('notepad', null);
  if (!USER) return;
  return api({ action: 'saveNotepad',
    name: USER.name, personId: USER.personId, notepad: USER.notepad }, keepalive ? { keepalive: true } : undefined)
    .then(d => {
      if (d && d.error) throw new Error(d.error);
      const el = $('pad-said');
      if (el) el.textContent = 'Saved';
    })
    .catch(err => {
      const el = $('pad-said');
      if (el) el.textContent = why_(err);
    });
}
/* ---------- MEASURING ON THE FIGURE (385): "There needs to be a protocol for this type of question. Like protractor tool." */
/* Ruler and Protractor are in every part's tool row (qtools.js); on a figure with no pen open they lie on it here. */
/* THE TOOL ON THE GLASS: which card, which tool, its centre (protractor) or zero (ruler) in the figure's own units, its turn in degrees */
let MEAS = null;
const MEAS_SNAP_PX = 14;    // nearer than this to a corner, the tool's centre or zero sits on it
const MEAS_TURN_DEG = 8;    // nearer than this to an arm's direction, the baseline lies along it

/* THE FIGURE'S CORNERS AND ARMS, read from its lines, polygons and paths: { pts: [[x, y]], segs: [[x1, y1, x2, y2]] } */
function measGeom_(svg) {
  const segs = [], num = s => String(s || '').trim().split(/[\s,]+/).map(Number).filter(n => !isNaN(n));
  svg.querySelectorAll('line').forEach(l => segs.push(['x1', 'y1', 'x2', 'y2'].map(a => +l.getAttribute(a) || 0)));
  svg.querySelectorAll('polygon, polyline').forEach(p => {
    const v = num(p.getAttribute('points')), P = [];
    for (let i = 0; i + 1 < v.length; i += 2) P.push([v[i], v[i + 1]]);
    if (p.tagName.toLowerCase() === 'polygon' && P.length > 2) P.push(P[0]);
    for (let i = 1; i < P.length; i++) segs.push([P[i - 1][0], P[i - 1][1], P[i][0], P[i][1]]);
  });
  svg.querySelectorAll('path').forEach(p => {
    const d = p.getAttribute('d') || '';
    if (/[aAcCqQsStT]/.test(d)) return;
    let at = null;
    (d.match(/[MLml][^MLmlZz]*/g) || []).forEach(c => {
      const v = num(c.slice(1));
      for (let i = 0; i + 1 < v.length; i += 2) {
        const q = /[ml]/.test(c[0]) && at ? [at[0] + v[i], at[1] + v[i + 1]] : [v[i], v[i + 1]];
        if (at && !(/[Mm]/.test(c[0]) && i === 0)) segs.push([at[0], at[1], q[0], q[1]]);
        at = q;
      }
    });
  });
  const pts = [];
  segs.forEach(s => [[s[0], s[1]], [s[2], s[3]]].forEach(p => { if (!pts.some(q => Math.hypot(q[0] - p[0], q[1] - p[1]) < 1)) pts.push(p); }));
  return { pts, segs };
}
/* THE OVERLAY, in the figure's own units over its picture -- so a reading on it is a reading on the paper's drawing */
function measDraw_(fig) {
  fig.querySelectorAll('.meas').forEach(o => o.remove());
  if (!MEAS) return;
  const svg = [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (!svg) return;
  const vb = (svg.getAttribute('viewBox') || '0 0 340 340').split(/[\s,]+/).map(Number);
  const r = svg.getBoundingClientRect(), u = r.width ? vb[2] / r.width : 1;   // figure units per screen px
  const g = MEAS, R = g.R, T = 'translate(' + g.c[0].toFixed(2) + ' ' + g.c[1].toFixed(2) + ') rotate(' + g.rot.toFixed(2) + ')';
  let body = '';
  if (g.tool === 'protractor') {
    body += `<path class="meas-body" d="M ${-R} 0 A ${R} ${R} 0 0 1 ${R} 0 Z"/>`;
    for (let a = 0; a <= 180; a += 5) {
      const t = a * Math.PI / 180, c = Math.cos(t), s = -Math.sin(t), L = a % 10 ? 0.05 : a % 30 ? 0.08 : 0.12;
      body += `<path class="meas-tick" d="M ${(R * c).toFixed(2)} ${(R * s).toFixed(2)} L ${(R * (1 - L) * c).toFixed(2)} ${(R * (1 - L) * s).toFixed(2)}"/>`;
      if (!(a % 30)) {
        const o = R * 0.8, i = R * 0.64;
        body += `<text class="meas-num" x="${(o * c).toFixed(2)}" y="${(o * s).toFixed(2)}" font-size="${(R * 0.08).toFixed(2)}">${a}</text>`
          + `<text class="meas-num meas-in" x="${(i * c).toFixed(2)}" y="${(i * s).toFixed(2)}" font-size="${(R * 0.07).toFixed(2)}">${180 - a}</text>`;
      }
    }
    body += `<path class="meas-tick" d="M ${-R} 0 L ${R} 0 M 0 ${-R * 0.06} L 0 ${R * 0.06} M ${-R * 0.06} 0 L ${R * 0.06} 0"/>`;
  } else {
    const W = g.L, H = Math.max(8, 30 * u), cm = g.cm;
    body += `<rect class="meas-body" x="0" y="0" width="${W.toFixed(2)}" height="${H.toFixed(2)}"/>`;
    for (let mm = 0, x = 0; x <= W + 1e-6; mm++, x = mm * cm / 10) {
      const L = mm % 10 ? (mm % 5 ? 0.25 : 0.4) : 0.55;
      body += `<path class="meas-tick" d="M ${x.toFixed(2)} 0 L ${x.toFixed(2)} ${(H * L).toFixed(2)}"/>`;
      if (!(mm % 10)) body += `<text class="meas-num" x="${x.toFixed(2)}" y="${(H * 0.85).toFixed(2)}" font-size="${(H * 0.32).toFixed(2)}">${mm / 10}</text>`;
    }
  }
  /* THE TURNING HANDLE, a fingertip wide wherever the figure is drawn small, at whichever end of the tool is on the glass */
  const reach = 30 * u, m = svg.getScreenCTM();
  /* ONLY WHERE THE FIGURE IS: a handle past the picture's edge cannot be pressed; failing all, it sits on the tool itself */
  const spots = g.tool === 'protractor' ? [[-R - reach, 0], [R + reach, 0], [0, -R - reach], [-R * 0.45, -R * 0.3], [R * 0.45, -R * 0.3]]
    : [[g.L + reach, 0], [-reach, 0], [g.L / 2, -reach], [g.L * 0.75, 20 * u]];
  const box = r;
  const onGlass = p => {
    if (!m) return true;
    const t = g.rot * Math.PI / 180, q = svg.createSVGPoint();
    q.x = g.c[0] + p[0] * Math.cos(t) - p[1] * Math.sin(t); q.y = g.c[1] + p[0] * Math.sin(t) + p[1] * Math.cos(t);
    const z = q.matrixTransform(m);
    return z.x > Math.max(26, box.left + 24) && z.x < Math.min(innerWidth - 26, box.right - 24) && z.y > Math.max(26, box.top + 24) && z.y < Math.min(innerHeight - 26, box.bottom - 24);
  };
  if (!g.hold) g.h = spots.find(onGlass) || spots[spots.length - 1];
  const hx = g.h[0], hy = g.h[1];
  body += `<circle class="meas-turn" cx="${hx.toFixed(2)}" cy="${hy.toFixed(2)}" r="${(24 * u).toFixed(2)}"/>`
    + `<path class="meas-turn-i" d="M ${(hx - 8 * u).toFixed(2)} ${hy.toFixed(2)} A ${(8 * u).toFixed(2)} ${(8 * u).toFixed(2)} 0 1 1 ${hx.toFixed(2)} ${(hy + 8 * u).toFixed(2)}"/>`;
  const o = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  o.setAttribute('class', 'meas');
  o.setAttribute('viewBox', vb.join(' '));
  o.setAttribute('data-noswipe', '');
  o.setAttribute('data-tool', g.tool);
  o.setAttribute('data-c', g.c.map(v => v.toFixed(2)).join(','));
  o.setAttribute('data-rot', g.rot.toFixed(2));
  o.setAttribute('aria-label', g.tool === 'protractor' ? 'Protractor: drag it, turn it with 2 fingers or the round handle' : 'Ruler: drag it, turn it with 2 fingers or the round handle');
  o.innerHTML = `<g transform="${T}">${body}</g>`;
  fig.classList.add('meas-host');
  /* EXACTLY OVER THE PICTURE, not the figure's whole box: the same viewBox on the same rectangle is the same units */
  const hr = fig.getBoundingClientRect();
  o.style.left = (r.left - hr.left) + 'px'; o.style.top = (r.top - hr.top) + 'px';
  o.style.width = r.width + 'px'; o.style.height = r.height + 'px';
  o.setAttribute('preserveAspectRatio', svg.getAttribute('preserveAspectRatio') || 'xMidYMid meet');
  fig.appendChild(o);
}
function measFig_(k) {
  const card = [...document.querySelectorAll('#screen .page.on .qcard, .qcard')].find(c => c.querySelector(`[data-k="${CSS.escape(k)}"]`) || c.querySelector(`.q-meast[data-key="${CSS.escape(k)}"]`));
  /* THE FIGURE, else the pen's page (a made-up surface has no <figure>): the Ruler measures on either. */
  const pick = c => c && ([...c.querySelectorAll('figure svg')].find(s => !s.classList.contains('meas') && !s.closest('svg.meas') && s.parentNode.closest('figure'))
    || c.querySelector('.qpad-art > svg:first-child'));
  let svg = pick(card);
  /* A PART WHOSE WORDS RAN ON TO A SECOND PAGE has its figure on the page before: the tool goes there */
  if (!svg && card) {
    const page = card.closest('.page'), prev = page && page.previousElementSibling;
    if (prev && prev.classList.contains('page') && /continued on the next page/i.test(prev.textContent)) svg = pick(prev);
  }
  return svg ? svg.parentNode : null;
}
/* THE TOOL LAID ON THE FIGURE, from the Ruler or Protractor tile of the part's tool row (`qt-inst`, qtools.js) */
function measOpen_(el) {
  const k = el.getAttribute('data-key') || '', tool = el.getAttribute('data-tool');
  const again = MEAS && MEAS.k === k && MEAS.tool === tool;
  const was = MEAS && measFig_(MEAS.k);
  MEAS = null;
  if (was) measDraw_(was);
  qtLight_(document);
  if (again) return;
  const fig = measFig_(k), svg = fig && fig.querySelector('svg');
  if (!svg) return;
  /* ON ANOTHER PAGE: turned to it, so the tool is where the child can see it */
  const pg = fig.closest('.page'), here = el.closest('.page');
  if (pg && here && pg !== here && typeof goPage === 'function') { const all = [...pg.parentNode.children].filter(c => c.classList.contains('page')); goPage('stuff', all.indexOf(pg), true); }
  const vb = (svg.getAttribute('viewBox') || '0 0 340 340').split(/[\s,]+/).map(Number);
  const G = measGeom_(svg);
  let x = null;
  try { x = stuffItemsAll_().find(i => i && i.key === k) || null; } catch (e) { x = null; }
  /* THE RULER READS TRUE TO THE PAPER: the longest line is as long as the scheme says it is (the middle of its band), else 1 cm is a tenth of the figure */
  let cm = vb[2] / 10;
  const band = /(\d+(?:\.\d+)?)\s*(?:to|-|–)\s*(\d+(?:\.\d+)?)\s*(cm|mm)/i.exec(String(x && (x.accept || (x.row || {}).accept) || ''));
  if (band && G.segs.length) {
    const len = Math.max(...G.segs.map(s => Math.hypot(s[2] - s[0], s[3] - s[1])));
    const want = (+band[1] + +band[2]) / 2 / (band[3].toLowerCase() === 'mm' ? 10 : 1);
    if (len > 0 && want > 0) cm = len / want;
  }
  MEAS = { k, tool, rot: 0, R: Math.min(vb[2], vb[3] * 2) * 0.36, cm, L: Math.min(vb[2] * 0.9, cm * Math.max(5, Math.floor(vb[2] * 0.9 / cm))),
           c: tool === 'protractor' ? [vb[0] + vb[2] / 2, vb[1] + vb[3] * 0.7] : [vb[0] + vb[2] * 0.05, vb[1] + vb[3] * 0.75], geom: G, vb };
  qtLight_(document);
  measDraw_(fig);
}
/* THE SNAP: the centre (or zero) onto a corner when near it; then the baseline (or edge) along an arm from that corner when near its direction */
function measSnap_(svg) {
  const g = MEAS, r = svg.getBoundingClientRect(), u = r.width ? g.vb[2] / r.width : 1;
  const near = g.geom.pts.map(p => ({ p, d: Math.hypot(p[0] - g.c[0], p[1] - g.c[1]) })).sort((a, b) => a.d - b.d)[0];
  if (!near || near.d > MEAS_SNAP_PX * u) return;
  g.c = near.p.slice();
  const dirs = [];
  g.geom.segs.forEach(s => {
    if (Math.hypot(s[0] - g.c[0], s[1] - g.c[1]) < 1) dirs.push(Math.atan2(s[3] - s[1], s[2] - s[0]) * 180 / Math.PI);
    if (Math.hypot(s[2] - g.c[0], s[3] - g.c[1]) < 1) dirs.push(Math.atan2(s[1] - s[3], s[0] - s[2]) * 180 / Math.PI);
  });
  const diff = (a, b) => { let d = ((a - b) % 360 + 540) % 360 - 180; return d; };
  /* A PROTRACTOR'S BASELINE IS A LINE BOTH WAYS from its centre; a ruler's edge runs one way from its zero */
  let best = null;
  dirs.forEach(a => [0, 180].forEach(f => {
    if (g.tool === 'ruler' && f) return;
    const d = Math.abs(diff(g.rot, a + f));
    if (d <= MEAS_TURN_DEG && (!best || d < best.d)) best = { d, a: a + f };
  }));
  if (best) g.rot = ((best.a % 360) + 360) % 360;
}
/* THE GESTURES (502): the tool is a rigid thing under the fingers -- each finger keeps the spot of the tool it first touched, by pointerId, so two fingers move and turn it exactly and may cross. */
/* One finger on the body drags; one on a ruler's end turns it about the other end; one on the round handle turns it about its centre; the wheel turns it 1° (Shift 0.2°). */
const MEAS_PT = new Map();   // pointerId -> { p: where it is now, l: the tool's own spot under it } in figure units
let MEAS_GO = null;          // { o: the overlay, mode: 'drag' | 'turn' | 'end' | 'two', piv: the tool's own spot that stays put }
const MEAS_GRID_DEG = 15, MEAS_GRID_NEAR = 2;   // within 2° of a multiple of 15° it settles there (0, 15, 30, 45, 90 ...)
const measAt_ = (svg, e) => { const m = svg.getScreenCTM(); if (!m) return [0, 0]; const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; const p = q.matrixTransform(m.inverse()); return [p.x, p.y]; };
const measRad_ = () => MEAS.rot * Math.PI / 180;
/* A FIGURE POINT TO THE TOOL'S OWN, AND BACK */
const measLocal_ = p => { const t = measRad_(), dx = p[0] - MEAS.c[0], dy = p[1] - MEAS.c[1]; return [dx * Math.cos(t) + dy * Math.sin(t), -dx * Math.sin(t) + dy * Math.cos(t)]; };
const measWorld_ = l => { const t = measRad_(); return [MEAS.c[0] + l[0] * Math.cos(t) - l[1] * Math.sin(t), MEAS.c[1] + l[0] * Math.sin(t) + l[1] * Math.cos(t)]; };
const measGridSnap_ = a => { const n = Math.round(a / MEAS_GRID_DEG) * MEAS_GRID_DEG; return Math.abs(a - n) <= MEAS_GRID_NEAR ? n : a; };
/* TURNED TO `rot` WITH THE TOOL'S OWN SPOT `l` LYING ON THE FIGURE POINT `p` */
function measPin_(rot, l, p) { MEAS.rot = rot; const w = measWorld_(l); MEAS.c = [MEAS.c[0] + p[0] - w[0], MEAS.c[1] + p[1] - w[1]]; }
/* ONLY THE POSE CHANGES WHILE A FINGER IS DOWN: the overlay is never rebuilt under it (that dropped the captured finger and moved the handle, 502) */
function measPose_(o) {
  const g = o && o.querySelector(':scope > g');
  if (!g || !MEAS) return;
  g.setAttribute('transform', 'translate(' + MEAS.c[0].toFixed(2) + ' ' + MEAS.c[1].toFixed(2) + ') rotate(' + MEAS.rot.toFixed(2) + ')');
  o.setAttribute('data-c', MEAS.c.map(v => v.toFixed(2)).join(','));
  o.setAttribute('data-rot', MEAS.rot.toFixed(2));
}
/* EVERY FINGER STILL DOWN TAKES THE SPOT IT IS ON NOW, so a finger added or lifted never makes the tool jump */
function measAnchor_() { MEAS_PT.forEach(v => { v.l = measLocal_(v.p); }); }
function measMode_(o, target) {
  const n = MEAS_PT.size;
  if (n >= 2) return { o, mode: 'two' };
  if (target && target.closest('.meas-turn, .meas-turn-i')) return { o, mode: 'turn', piv: [0, 0] };
  const f = [...MEAS_PT.values()][0];
  if (MEAS.tool === 'ruler' && f) {
    /* AN END is its last eighth, or a fingertip, whichever is shorter: turned about the other end */
    const r = o.getBoundingClientRect(), u = r.width ? MEAS.vb[2] / r.width : 1, E = Math.min(MEAS.L * 0.125, 40 * u);
    if (f.l[0] <= E) return { o, mode: 'end', piv: [MEAS.L, 0] };
    if (f.l[0] >= MEAS.L - E) return { o, mode: 'end', piv: [0, 0] };
  }
  return { o, mode: 'drag' };
}
document.addEventListener('pointerdown', e => {
  const o = e.target && e.target.closest && e.target.closest('svg.meas');
  const host = !o && MEAS_PT.size && e.target && e.target.closest && e.target.closest('.meas-host');
  if ((!o && !host) || !MEAS) return;
  const onTool = o && e.target.closest('.meas-body, .meas-tick, .meas-num, .meas-turn, .meas-turn-i');
  /* A SECOND FINGER MAY LAND ANYWHERE ON THE FIGURE, beside the tool, and turns it */
  if (!onTool && !MEAS_PT.size) return;
  const ov = o || host.querySelector('svg.meas');
  if (!ov) return;
  e.preventDefault();
  e.stopPropagation();
  try { ov.setPointerCapture(e.pointerId); } catch (err) { /* focus and scrolling are niceties */ }
  const p = measAt_(ov, e);
  MEAS_PT.set(e.pointerId, { p, l: measLocal_(p) });
  measAnchor_();
  MEAS.hold = true;
  MEAS_GO = measMode_(ov, e.target);
}, true);
document.addEventListener('pointermove', e => {
  const G = MEAS_GO;
  if (!G || !MEAS || !MEAS_PT.has(e.pointerId)) return;
  if (e.cancelable) e.preventDefault();
  const me = MEAS_PT.get(e.pointerId);
  me.p = measAt_(G.o, e);
  if (G.mode === 'two') {
    const [a, b] = [...MEAS_PT.values()];
    const want = Math.atan2(b.p[1] - a.p[1], b.p[0] - a.p[0]) - Math.atan2(b.l[1] - a.l[1], b.l[0] - a.l[0]);
    /* THE MIDPOINT OF THE TWO FINGERS STAYS UNDER THEM, whatever the snap took off the turn */
    const mid = [(a.p[0] + b.p[0]) / 2, (a.p[1] + b.p[1]) / 2], lmid = [(a.l[0] + b.l[0]) / 2, (a.l[1] + b.l[1]) / 2];
    measPin_(measGridSnap_(want * 180 / Math.PI), lmid, mid);
  } else if (G.mode === 'drag') {
    measPin_(MEAS.rot, me.l, me.p);
  } else {
    const pw = measWorld_(G.piv);
    const want = Math.atan2(me.p[1] - pw[1], me.p[0] - pw[0]) - Math.atan2(me.l[1] - G.piv[1], me.l[0] - G.piv[0]);
    measPin_(measGridSnap_(want * 180 / Math.PI), G.piv, pw);
  }
  measPose_(G.o);
}, { capture: true, passive: false });
const measUp_ = e => {
  if (!MEAS_PT.has(e.pointerId)) return;
  MEAS_PT.delete(e.pointerId);
  const G = MEAS_GO;
  if (!G || !MEAS) { MEAS_GO = null; MEAS_PT.clear(); return; }
  if (MEAS_PT.size) {
    /* THE FINGER LEFT ON IT CARRIES ON from where it is now, dragging */
    measAnchor_();
    MEAS_GO = { o: G.o, mode: MEAS_PT.size >= 2 ? 'two' : 'drag' };
    return;
  }
  MEAS.hold = false;
  MEAS_GO = null;
  const fig = G.o.parentNode, svg = fig && [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (svg) measSnap_(svg);
  if (fig) measDraw_(fig);
};
['pointerup', 'pointercancel'].forEach(ev => document.addEventListener(ev, measUp_, true));
/* NO PINCH-ZOOM, SCROLL OR COLUMN SLIDE while a finger holds the tool */
['touchstart', 'touchmove'].forEach(ev => document.addEventListener(ev, e => {
  if (!MEAS) return;
  const t = e.target, on = t && t.closest && (t.closest('svg.meas .meas-body, svg.meas .meas-tick, svg.meas .meas-num, svg.meas .meas-turn, svg.meas .meas-turn-i') || (MEAS_PT.size && t.closest('.meas-host')));
  if ((on || MEAS_PT.size) && e.cancelable) e.preventDefault();
}, { capture: true, passive: false }));
document.addEventListener('wheel', e => {
  const o = e.target && e.target.closest && e.target.closest('svg.meas');
  if (!o || !MEAS) return;
  e.preventDefault();
  MEAS.rot += (e.deltaY > 0 ? 1 : -1) * (e.shiftKey ? 0.2 : 1);
  const fig = o.parentNode, svg = [...fig.children].find(c => c.tagName.toLowerCase() === 'svg' && !c.classList.contains('meas'));
  if (svg) measSnap_(svg);
  measDraw_(fig);
}, { passive: false });
/* A REPAINT REBUILDS THE CARD: the tool is drawn again on the new figure */
function measRepaint_() { if (MEAS) { const f = measFig_(MEAS.k); if (f) measDraw_(f); } }
/* A TURNED PHONE OR A RESIZED WINDOW moves the picture: the tool is laid over it again */
if (typeof addEventListener === 'function') addEventListener('resize', () => { if (MEAS) setTimeout(measRepaint_, 120); });
