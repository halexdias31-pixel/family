/* ==================================================================================================
   @family. — js/mat.js   (19 of 20)

   THE MATHS MAT — one sheet of A4, built from components you tick, printed from the app.

   IT WAS A SEPARATE FILE and the reason to bring it in is the same as the flyers: a second file is
   a second thing to deploy, and its list of levels was a copy of the one already in the sheet.
   `DATA.dropdowns` carries the real ones — SATs, 11+, GCSE and the rest — so the mat can offer
   exactly the levels the rest of the site knows about, and a level added there arrives here.

   THE THING THAT MAKES IT WORK IS THE GAUGE. A4 has 262mm of usable column and the components add
   to far more, so a picker with only tickboxes would let somebody build a mat that runs off the
   bottom of the page — and they would find out at the printer, with the last thing they ticked
   silently cut off. The gauge MEASURES the rendered column rather than adding up a table of
   numbers, because two half-width blocks side by side cost the taller of them and no table can
   know which pairs got ticked.
================================================================================================== */

/* HOW MUCH COLUMN THERE IS, after the heading and the footer. Measured on the real sheet, not
   derived from 297 minus some margins — the header and foot are content and their height is
   whatever the font makes it. */
const MAT_ROOM = 262;

/* Each component: what it is called, which levels it suits, what it costs in millimetres, and
   whether it sits half-width so it can pair with the next one.
   THE HEIGHTS ARE MEASURED. The first set were estimates and the gauge was wrong by 300mm — a
   gauge that lies is worse than none, since it is the only thing between a tickbox and a wasted
   sheet. Each was rendered alone and measured. */
const MAT_PARTS = [
  { id: 'M02', name: 'Number square',       lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],            h: 94,  half: true },
  { id: 'M03', name: 'Times tables',        lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],            h: 100, half: true },
  { id: 'M04', name: 'Number line',         lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],            h: 20,  half: false },
  { id: 'M05', name: 'Place value',         lv: ['SATs','11+','Y1 Mocks','Y2 Mocks'],            h: 15,  half: true },
  { id: 'M06', name: 'Measures',            lv: ['SATs','11+','Y9 Mocks','GCSE'],                h: 39,  half: true },
  { id: 'M07', name: 'Angles named',        lv: ['SATs','11+','Y9 Mocks','GCSE'],                h: 28,  half: true },
  { id: 'M08', name: 'Protractor',          lv: ['SATs','11+','Y9 Mocks','GCSE'],                h: 54,  half: true },
  { id: 'M09', name: '2D shapes',           lv: ['SATs','11+','Y2 Mocks'],                       h: 35,  half: false },
  { id: 'M10', name: 'Roman numerals',      lv: ['SATs','11+'],                                  h: 13,  half: true },
  { id: 'M11', name: 'Fraction = decimal',  lv: ['SATs','11+','Y9 Mocks','GCSE'],                h: 15,  half: true },
  { id: 'M12', name: 'Formulae not given',  lv: ['GCSE','AS','Alevel'],                          h: 49,  half: true },
  { id: 'M13', name: 'Exact trig values',   lv: ['GCSE','AS','Alevel'],                          h: 33,  half: true },
  { id: 'M14', name: 'The trig trick',      lv: ['GCSE','AS','Alevel'],                          h: 33,  half: true },
  { id: 'M15', name: 'Index laws',          lv: ['GCSE','AS','Alevel','B-TEC'],                  h: 21,  half: true },
  { id: 'M16', name: 'Graph shapes',        lv: ['GCSE','AS','Alevel'],                          h: 40,  half: false },
  { id: 'M17', name: 'Straight line',       lv: ['Y9 Mocks','GCSE','AS'],                        h: 29,  half: true },
  { id: 'M18', name: 'Averages',            lv: ['SATs','11+','Y9 Mocks','GCSE','B-TEC'],        h: 24,  half: true },
];

/* IT OPENS ON A MAT THAT FITS. Ticking everything by default opened it far over with the print
   button already dead — a tool whose first impression is a red bar before anybody has done anything
   wrong. A default has to be a working example. */
const MAT_START = ['M02', 'M03', 'M04', 'M05', 'M08', 'M09'];

let MAT_LEVEL = 'SATs';
let MAT_ON = MAT_START.slice();

/* THE LEVELS THE REST OF THE SITE USES. `primary` and `secondary` were a vocabulary I invented, and
   the options tab already lists the real ones — so a level added there arrives here without anybody
   remembering this file exists. The fallback is only for a payload that has not loaded. */
function matLevels() {
  /* `levels`, AND IT IS A PLAIN ARRAY OF STRINGS — `book.js` hands it straight to a question as
     options, which is the proof. I had written `x.value || x.name || x` in case they were objects;
     guessing at two shapes when one file already answers it is how a wrong guess ships. */
  const got = ((DATA.dropdowns || {}).levels || []).filter(Boolean);
  return got.length ? got
    : ['SATs', '11+', 'Y1 Mocks', 'Y2 Mocks', 'Y9 Mocks', 'GCSE', 'AS', 'Alevel', 'B-TEC'];
}

/* ---------- THE BLOCKS ---------------------------------------------------------------------------
   Each returns the HTML for one component. They are here rather than generated, because the mat is
   drawn from the same data the app already holds and a template that has to be regenerated is a
   second build step for a print sheet. */
const MAT_HTML = {
  M02: () => matGrid('mat-hun', 100, n => {
    const c = n % 10 === 0 ? ' ten' : (n % 5 === 0 ? ' five' : '');
    return `<i class="${c.trim()}">${n}</i>`;
  }),
  M03: () => {
    let h = '<i class="h"></i>';
    for (let x = 1; x <= 12; x++) h += `<i class="h">${x}</i>`;
    for (let y = 1; y <= 12; y++) {
      h += `<i class="h">${y}</i>`;
      for (let x = 1; x <= 12; x++) h += `<i class="${x === y ? 'sq' : ''}">${x * y}</i>`;
    }
    return `<div class="mat-tt">${h}</div>`;
  },
  M04: () => {
    const W = 100;
    const fr = [[0,1,'0'],[1,4,'¼'],[1,3,'⅓'],[1,2,'½'],[2,3,'⅔'],[3,4,'¾'],[1,1,'1']];
    let h = fr.map(([n, d, l]) =>
      `<i style="left:${W*n/d}%"></i><b style="left:${W*n/d}%">${l}</b>`).join('');
    for (let k = 0; k <= 10; k++) {
      h += `<u style="left:${k*10}%"></u>`;
      if (k % 5 === 0 || [2,4,6,8].indexOf(k) !== -1) h += `<s style="left:${k*10}%">${(k/10).toFixed(1)}</s>`;
    }
    return `<div class="mat-nl">${h}</div>`;
  },
  M05: () => `<div class="mat-pv">${
    [['Th','1000'],['H','100'],['T','10'],['U','1'],['•',''],['t','0.1'],['h','0.01']]
      .map(([c, v]) => `<i class="${c === '•' ? 'dot' : ''}"><b>${c}</b><em>${v}</em></i>`).join('')}</div>`,
  M06: () => `<div class="mat-meas">${
    [['Length', ['10 mm = 1 cm','100 cm = 1 m','1000 m = 1 km']],
     ['Mass', ['1000 g = 1 kg','1000 kg = 1 tonne']],
     ['Capacity', ['1000 ml = 1 litre','100 cl = 1 litre']],
     ['Time', ['60 sec = 1 min','60 min = 1 hr','24 hr = 1 day']]]
      .map(([k, vs]) => `<div><em>${k}</em>${vs.map(v => `<i>${v}</i>`).join('')}</div>`).join('')}</div>`,
  M07: () => matAngles(),
  M08: () => matProtractor(),
  M09: () => `<div class="mat-shapes">${
    [['triangle',3],['square',4],['pentagon',5],['hexagon',6],
     ['heptagon',7],['octagon',8],['nonagon',9],['decagon',10]]
      .map(([n, k]) => `<div>${matPoly(k)}<span>${n}</span><em>${k} sides</em></div>`).join('')}</div>`,
  M10: () => `<div class="mat-rom">${
    [['I',1],['V',5],['X',10],['L',50],['C',100],['D',500],['M',1000]]
      .map(([a, b]) => `<i><b>${a}</b>${b}</i>`).join('')}
    <i class="wide">4 = IV · 9 = IX · 40 = XL · 90 = XC · 2026 = MMXXVI</i></div>`,
  M11: () => `<div class="mat-fdp">${
    [['½','0.5','50%'],['¼','0.25','25%'],['¾','0.75','75%'],['⅓','0.33','33⅓%'],
     ['⅕','0.2','20%'],['⅒','0.1','10%'],['⅛','0.125','12.5%'],['1','1.0','100%']]
      .map(([f, d, p]) => `<i><b>${f}</b><em>${d}</em><em>${p}</em></i>`).join('')}</div>`,
  M12: () => matPairs([
    ['Circle','A = πr² · C = 2πr'], ['Arc, sector','(θ/360) × 2πr · × πr²'],
    ['Sphere','V = 4/3 πr³ · A = 4πr²'], ['Cone','V = 1/3 πr²h · πrl'],
    ['Prism','V = cross-section × length'], ['Compound','speed = d/t · density = m/v'],
    ['% change','(new − old) ÷ old × 100'], ['Interest','P(1 + r)ⁿ']]),
  M13: () => {
    const rows = [['sin','0','½','√2/2','√3/2','1'], ['cos','1','√3/2','√2/2','½','0'],
                  ['tan','0','√3/3','1','√3','—']];
    let h = ['', '0°','30°','45°','60°','90°'].map(x => `<i class="h">${x}</i>`).join('');
    rows.forEach(r => { h += `<i class="h">${r[0]}</i>` + r.slice(1).map(v => `<i>${v}</i>`).join(''); });
    return `<div class="mat-trig">${h}</div>`;
  },
  M14: () => matTrick(),
  M15: () => matPairs([['aᵐ × aⁿ','aᵐ⁺ⁿ'],['aᵐ ÷ aⁿ','aᵐ⁻ⁿ'],['(aᵐ)ⁿ','aᵐⁿ'],
                       ['a⁰','1'],['a⁻ⁿ','1/aⁿ'],['a^½','√a']]),
  M16: () => matGraphs(),
  M17: () => matPairs([['y = mx + c','m is the gradient, c the crossing'],
                       ['gradient','(y₂ − y₁) ÷ (x₂ − x₁)'],
                       ['parallel','same m'], ['perpendicular','m₁ × m₂ = −1']]),
  M18: () => matPairs([['mean','add up, divide by how many'], ['median','in order, take the middle'],
                       ['mode','the one that appears most'], ['range','biggest minus smallest']]),
};

const matGrid = (cls, n, cell) => {
  let h = '';
  for (let k = 1; k <= n; k++) h += cell(k);
  return `<div class="${cls}">${h}</div>`;
};
const matPairs = rows => `<div class="mat-two">${
  rows.map(([a, b]) => `<i><b>${a}</b><em>${b}</em></i>`).join('')}</div>`;

/* ---------- THE DRAWN PIECES ---------------------------------------------------------------------
   A regular polygon from its own definition rather than eight hand-typed paths that disagree with
   their labels — which is exactly what happened the first time: a positional list drew "rectangle"
   as a pentagon, because a fifth entry met a five-sided drawing.
   THE SQUARE IS TURNED HALF A STEP. Every polygon starting with a vertex at the top gives a
   triangle pointing up, which is right, and a square on its corner, which reads as a diamond. */
function matPoly(n) {
  const off = n === 4 ? Math.PI / n : 0;
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = -Math.PI / 2 + off + 2 * Math.PI * k / n;
    pts.push((20 + 17 * Math.cos(a)).toFixed(1) + ',' + (20 + 17 * Math.sin(a)).toFixed(1));
  }
  return `<svg viewBox="0 0 40 40"><polygon points="${pts.join(' ')}" fill="none"
    stroke="currentColor" stroke-width="1.4"/></svg>`;
}

/* A HALF CIRCLE AT TRUE SIZE — which is the whole advantage of paper over a screen. A screen does
   not know how big it is and would need calibrating against a bank card; a printed millimetre is a
   millimetre. Both scales, inner and outer, running opposite ways, because that is what a plastic
   protractor does and the thing every child gets wrong. */
function matProtractor() {
  const R = 41, cx = R + 4, cy = R + 4;
  let p = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy} Z" fill="none"
    stroke="#333" stroke-width=".4"/>`;
  for (let a = 0; a <= 180; a++) {
    const t = Math.PI * (180 - a) / 180;
    const long = a % 10 === 0, mid = a % 5 === 0;
    const r1 = long ? R - 6 : (mid ? R - 4 : R - 2.4);
    p += `<line x1="${(cx + r1 * Math.cos(t)).toFixed(2)}" y1="${(cy - r1 * Math.sin(t)).toFixed(2)}"
      x2="${(cx + R * Math.cos(t)).toFixed(2)}" y2="${(cy - R * Math.sin(t)).toFixed(2)}"
      stroke="#111" stroke-width="${long ? .45 : .2}"/>`;
    if (long) {
      const ro = R - 9.5, ri = R - 15.5;
      p += `<text x="${(cx + ro * Math.cos(t)).toFixed(2)}" y="${(cy - ro * Math.sin(t) + 1.3).toFixed(2)}"
        text-anchor="middle" font-size="3.1" fill="#111">${a}</text>`;
      p += `<text x="${(cx + ri * Math.cos(t)).toFixed(2)}" y="${(cy - ri * Math.sin(t) + 1.3).toFixed(2)}"
        text-anchor="middle" font-size="3.1" fill="#9b2d22">${180 - a}</text>`;
    }
  }
  p += `<line x1="${cx - R}" y1="${cy}" x2="${cx + R}" y2="${cy}" stroke="#111" stroke-width=".5"/>
    <line x1="${cx - 5}" y1="${cy}" x2="${cx + 5}" y2="${cy}" stroke="#9b2d22" stroke-width=".6"/>
    <line x1="${cx}" y1="${cy - 5}" x2="${cx}" y2="${cy + 5}" stroke="#9b2d22" stroke-width=".6"/>`;
  return `<div class="mat-prot"><svg viewBox="0 0 ${2 * (R + 4)} ${R + 8}">${p}</svg></div>`;
}

function matAngles() {
  const kinds = [['acute', 45, 'less than 90'], ['right', 90, 'exactly 90'],
                 ['obtuse', 130, '90 to 180'], ['straight', 180, 'exactly 180'],
                 ['reflex', 250, 'more than 180']];
  return `<div class="mat-ang">${kinds.map(([name, deg, note]) => {
    const t = Math.PI * deg / 180;
    const x = 20 + 15 * Math.cos(t), y = 22 - 15 * Math.sin(t);
    const arc = deg === 180 ? '' :
      `<path d="M 27 22 A 7 7 0 ${deg > 180 ? 1 : 0} 0
        ${(20 + 7 * Math.cos(t)).toFixed(1)} ${(22 - 7 * Math.sin(t)).toFixed(1)}"
        fill="none" stroke="#9b2d22" stroke-width="1"/>`;
    return `<div><svg viewBox="0 0 40 30">
      <line x1="20" y1="22" x2="36" y2="22" stroke="currentColor" stroke-width="1.4"/>
      <line x1="20" y1="22" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}"
        stroke="currentColor" stroke-width="1.4"/>${arc}</svg>
      <span>${name}</span><em>${note}</em></div>`;
  }).join('')}</div>`;
}

/* ---------- THE TRICK, WHICH BEATS THE TABLE -----------------------------------------------------
   EVERY EXACT VALUE IS √n OVER 2, and n counts 0 1 2 3 4 across for sine and backwards for cosine.
   One pattern replacing ten values — and it survives an exam in a way a memorised table does not,
   because a pattern can be rebuilt from nothing on the back of the paper.

   THE ROOT IS DRAWN, NOT TYPED. A √ character sits beside the numbers at whatever size the font
   makes it and its bar covers only the first one, so it reads as the root of that number rather
   than of the row — which is the one thing the trick depends on saying. */
function matTrick() {
  const angs = ['0°','30°','45°','60°','90°'];
  const row = (label, ns, simp) =>
    `<div class="mat-tk-row"><b>${label}</b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
       <div class="mat-tk-nums">${ns.map(n => `<i>${n}</i>`).join('')}</div></div></div>
     <div class="mat-tk-simp"><b></b><div class="mat-tk-nums">${
       simp.map(v => `<u>${v}</u>`).join('')}</div></div>`;
  return `<div class="mat-tk">
    <div class="mat-tk-row"><b></b><div class="mat-tk-surd"><span class="mat-tk-rad"></span>
      <div class="mat-tk-nums">${angs.map(a => `<em>${a}</em>`).join('')}</div></div></div>
    ${row('sin', ['0','1','2','3','4'], ['0','½','√2/2','√3/2','1'])}
    ${row('cos', ['4','3','2','1','0'], ['1','√3/2','√2/2','½','0'])}
    <p class="mat-tk-say">Every one is <b>√n ÷ 2</b>. Count up for sine, down for cosine.
      tan = sin ÷ cos.</p></div>`;
}

/* FIVE CURVES, DRAWN — the shape is what is being recognised, and a name without a picture is the
   half of it nobody can use.
   EACH SVG NEEDS A WIDTH. Without one they filled the column and the block came out 744mm tall,
   nearly three sheets from one component: an SVG with no width is not a small picture, it is as
   large as you let it be. The grid gives them their width. */
function matGraphs() {
  const W = 44, H = 34;
  const curve = f => {
    const pts = [];
    for (let k = 0; k <= 40; k++) {
      const x = -1.6 + 3.2 * k / 40;
      const y = f(x);
      if (!isFinite(y) || Math.abs(y) > 3) continue;
      pts.push((W / 2 + x * W / 3.6).toFixed(1) + ',' + (H / 2 - y * H / 7).toFixed(1));
    }
    return pts.join(' ');
  };
  const kinds = [['linear','y = x', x => x], ['quadratic','y = x²', x => x * x],
                 ['cubic','y = x³', x => x ** 3],
                 ['reciprocal','y = 1/x', x => Math.abs(x) > .28 ? 1 / x : 9],
                 ['exponential','y = 2ˣ', x => Math.pow(2, x) - 1]];
  return `<div class="mat-graphs">${kinds.map(([n, eq, f]) =>
    `<div><svg viewBox="0 0 ${W} ${H}">
      <line x1="0" y1="${H/2}" x2="${W}" y2="${H/2}" stroke="#c9c3b2" stroke-width=".5"/>
      <line x1="${W/2}" y1="0" x2="${W/2}" y2="${H}" stroke="#c9c3b2" stroke-width=".5"/>
      <polyline points="${curve(f)}" fill="none" stroke="currentColor" stroke-width="1.2"/>
    </svg><span>${n}</span><em>${eq}</em></div>`).join('')}</div>`;
}

/* THE RULER DOWN THE LEFT EDGE, in real millimetres because this is printed. At the edge because
   that is where a ruler is used — you lay the paper against the thing you are measuring, and one in
   the middle of a sheet cannot reach anything. */
function matRuler(mmHigh) {
  let h = '';
  for (let mm = 0; mm <= mmHigh; mm++) {
    const long = mm % 10 === 0, mid = mm % 5 === 0;
    h += `<i style="top:${mm}mm;width:${long ? 7 : (mid ? 4.5 : 2.5)}mm"></i>`;
    if (long && mm > 0) h += `<b style="top:${mm}mm">${mm / 10}</b>`;
  }
  return h;
}

/* ---------- THE PICKER AND THE SHEET -------------------------------------------------------------
   Rendered into the widget's own box, so this behaves like every other tool: a card with a start
   function, listed and searchable with the rest. */
function initMat() {
  const box = $('mat-box');
  if (!box) return;
  box.innerHTML = `
    <div class="mat-lev" id="mat-lev"></div>
    <div class="mat-list" id="mat-list"></div>
    <div class="mat-gauge" id="mat-gauge"><i></i></div>
    <p class="mat-said" id="mat-said"></p>
    <button class="btn" data-do="mat-print" id="mat-go">Print the mat</button>
    <div class="mat-out" id="mat-out"></div>`;

  const levels = matLevels();
  if (levels.indexOf(MAT_LEVEL) === -1) MAT_LEVEL = levels[0];
  $('mat-lev').innerHTML = levels.map(l =>
    `<button data-do="mat-level" data-l="${esc(l)}">${esc(l)}</button>`).join('')
    + '<button data-do="mat-level" data-l="all">Everything</button>';
  $('mat-list').innerHTML = MAT_PARTS.map(c =>
    `<label data-l="${esc(c.lv.join('|'))}"><input type="checkbox" data-do="mat-tick"
       data-id="${c.id}"${MAT_ON.indexOf(c.id) !== -1 ? ' checked' : ''}>
     ${esc(c.name)}<u>${c.h}mm</u></label>`).join('');
  matPaint();
}

/* SWITCHING LEVEL HIDES WHAT DOES NOT APPLY; it does not untick it. Somebody who set up a SATs mat,
   looked at GCSE and came back should find their mat as they left it. */
on('mat-level', el => { MAT_LEVEL = el.getAttribute('data-l'); matPaint(); });
on('mat-tick', el => {
  const id = el.getAttribute('data-id');
  const at = MAT_ON.indexOf(id);
  if (el.checked && at === -1) MAT_ON.push(id);
  if (!el.checked && at !== -1) MAT_ON.splice(at, 1);
  matPaint();
});

function matPaint() {
  const lev = $('mat-lev'), list = $('mat-list'), out = $('mat-out');
  if (!out) return;
  if (lev) lev.querySelectorAll('button').forEach(b =>
    b.classList.toggle('on', b.getAttribute('data-l') === MAT_LEVEL));
  /* SHOWN WHEN THE COMPONENT LISTS THIS LEVEL — a component belongs to several, so this is a
     membership test rather than an equality one. */
  if (list) list.querySelectorAll('label').forEach(el => {
    const has = el.getAttribute('data-l').split('|').indexOf(MAT_LEVEL) !== -1;
    el.classList.toggle('off', MAT_LEVEL !== 'all' && !has);
  });

  const on_ = MAT_PARTS.filter(c => MAT_ON.indexOf(c.id) !== -1
    && (MAT_LEVEL === 'all' || c.lv.indexOf(MAT_LEVEL) !== -1));

  /* HALF-WIDTH BLOCKS PAIR UP, full ones take a row. Walked in list order rather than sorted, so
     moving something on the mat is moving one line here. */
  let h = '', hold = null;
  /* ONE FUNCTION, CALLED ONCE PER BLOCK. The first version had a ternary that invoked `MAT_HTML`
     twice for the same component — drawing a protractor's 181 ticks and throwing one copy away. */
  const cell = c => `<div class="mat-box"><h4>${esc(c.name)}</h4>${MAT_HTML[c.id]()}</div>`;
  const pair = (a, b) => `<div class="mat-two-up">${cell(a)}${b ? cell(b) : '<div></div>'}</div>`;
  on_.forEach(c => {
    if (!c.half) {
      if (hold) { h += pair(hold); hold = null; }
      h += cell(c);
    } else if (hold) { h += pair(hold, c); hold = null; }
    else hold = c;
  });
  if (hold) h += pair(hold);

  out.innerHTML = `<div class="mat-sheet"><div class="mat-rule">${matRuler(285)}</div>
    <div class="mat-head"><h3>Maths mat</h3><span>${esc(brand('name', '@family.'))}</span></div>
    <div class="mat-cols">${h}</div>
    <div class="mat-foot"><span>${esc(brand('area', 'Merton & Wandsworth'))}</span>
      <b>${esc(brand('site', ''))}</b></div></div>`;

  /* MEASURED, NOT ADDED UP. The heights in the list are what each costs ALONE; two halves in a row
     cost the taller of them, and no table of numbers can know which pairs got ticked. Reading the
     rendered column is the only figure that is always right. */
  const cols = out.querySelector('.mat-cols');
  const used = cols ? Math.round(cols.getBoundingClientRect().height / matPxPerMm()) : 0;
  const over = used > MAT_ROOM;
  $('mat-gauge').classList.toggle('over', over);
  $('mat-gauge').firstElementChild.style.width = Math.min(100, used / MAT_ROOM * 100) + '%';
  $('mat-said').className = 'mat-said' + (over ? ' over' : '');
  $('mat-said').innerHTML = over
    ? `<b>${used - MAT_ROOM}mm too much</b> — untick something, or the bottom is cut off.`
    : `<b>${MAT_ROOM - used}mm</b> of paper left.`;
  $('mat-go').disabled = over || !on_.length;
  matFit();
}

/* THE SHEET IS SCALED TO THE SCREEN and back to 1 for printing, where 210mm really is 210mm. The
   factor is measured rather than assumed, because the box width changes with the screen and a
   hard-coded one would be right on a single device. */
function matPxPerMm() {
  const p = document.createElement('div');
  p.style.cssText = 'width:100mm;position:absolute;visibility:hidden';
  document.body.appendChild(p);
  const k = p.getBoundingClientRect().width / 100;
  p.remove();
  return k || 3.7795;
}
function matFit() {
  const out = $('mat-out'), sheet = out && out.querySelector('.mat-sheet');
  if (!sheet) return;
  const k = Math.min(1, (out.clientWidth || 320) / (210 * matPxPerMm()));
  sheet.style.transform = 'scale(' + k.toFixed(4) + ')';
  out.style.height = (297 * matPxPerMm() * k) + 'px';
}

/* PRINTING FROM INSIDE THE APP. A browser prints the whole document, so the class hides everything
   else and lifts the sheet out at full size — set only while printing, so a print started anywhere
   else is untouched. The timer is there because some browsers never fire `afterprint` on a
   cancelled dialogue, and the app would be left with everything hidden: a blank screen that looks
   exactly like a crash. */
on('mat-print', () => {
  const sheet = document.querySelector('.mat-out .mat-sheet');
  if (sheet) sheet.style.transform = 'scale(1)';
  document.body.classList.add('printing-mat');
  const done = () => {
    document.body.classList.remove('printing-mat');
    matFit();
    window.removeEventListener('afterprint', done);
  };
  window.addEventListener('afterprint', done);
  setTimeout(done, 4000);
  /* `window.print()`, NOT `print()`. Bare it works — it is a global — and it reads as a function
     this file forgot to declare, which is exactly what `check.js` said. A name that has to be
     recognised as a browser built-in rather than as a mistake costs a reader a lookup. */
  window.print();
});

window.addEventListener('resize', () => { if ($('mat-out')) matFit(); });
