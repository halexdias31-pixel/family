#!/usr/bin/env node
require('./quiet');   // one line when green; -v or VERBOSE=1 for the whole report
/* @family. — check/cards.js EVERY QUESTION IN THE LIBRARY, LAID OUT AT PHONE WIDTH, MEASURED. § */
const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const WIDTH = 320;
const PHONE_H = 568;
const PORT = Number(process.env.CARDS_PORT || 8129);  /* overridable: parallel runs in worktrees share one machine */
const SHOTS = process.argv.includes('--shots');
const ALL = process.argv.includes('--all');
/* ---------- THE CARD'S OWN TYPESETTER, NOT A COPY OF IT § */
const typeset_ = (() => {
  const { cutFrom } = require(path.join(ROOT, 'js', 'check-marks-load.js'));
  const body = cutFrom(fs.readFileSync(path.join(ROOT, 'js', 'find.js'), 'utf8'), 'typeset_');
  if (!body) { console.log('check/cards.js: cannot find typeset_ in find.js — renamed?'); process.exit(1); }
  return eval('(' + body + ')');
})();

/* ---------- THE TAG ROW IS THE APP'S OWN, NOT A COPY OF IT (docs/history/355) § */
let TAGROWS = {};

/* ---------- WHAT COUNTS AS A FAILURE, AND IT IS DELIBERATELY ONE THING § */
const SLACK = 1;

function serve() {
  return new Promise(done => {
    const srv = http.createServer((rq, rs) => {
      const f = path.join(ROOT, decodeURI(rq.url.split('?')[0]));
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) {
        rs.writeHead(404); return rs.end();
      }
      const type = { '.css': 'text/css', '.js': 'text/javascript',
                     '.json': 'application/json', '.html': 'text/html' }[path.extname(f)]
                 || 'text/plain';
      rs.writeHead(200, { 'content-type': type });
      rs.end(fs.readFileSync(f));
    });
    srv.listen(PORT, () => done(srv));
  });
}

/* THE CARD, BUILT THE WAY `questionCard_` BUILDS IT — the same classes in the same nesting, because the stylesheet is the thing under test and a different § */
function cardHtml(r, stems) {
  const fig = d => (d ? `<figure>${d}</figure>` : '');
  /* ---------- EVERY PREAMBLE THIS PART SITS UNDER, OUTERMOST FIRST § */
  const at = (scope, key) => (stems[scope] || {})[key];
  const pre = [at('paper', r.paper_id),
               r.section ? at('section', r.paper_id + '|' + r.section) : null,
               (r.question !== undefined && r.question !== null && r.question !== '')
                 ? at('question', r.paper_id + '|' + r.question) : null].filter(Boolean);
  /* ---------- AND THE FIGURE IN ITS CARD (docs/history/356) § */
  const pics = v => (Array.isArray(v) ? v : String(v || '').split(',').map(x => x.trim()).filter(Boolean))
    .map(src => `<figure class="qpic"><img src="${src}" alt=""></figure>`).join('');
  /* AND IN THE PAPER'S ORDER -- each stem its own card with its figure, then the part with its own. */
  const figs = fig(r.diagram) + pics(r.images);
  /* ---------- THE ROW, FROM THE APP: `tagRow_`'s own markup for this row (see `TAGROWS`). ---------- */
  const head = which => (TAGROWS[r.row_id] || {})[which] || '<div class="qtags qcard-tags"></div>';
  const stemCards = pre.map(p => (p.html ? `<div class="qcard qstem" data-row="${p.row_id}#stem">
    ${head('other')}
    <div class="qsheet"><div class="qsheet-stem${String(p.placeholder) === 'True' ? ' is-standin' : ''}"
        >${typeset_(p.html)}${fig(p.diagram) + pics(p.images)}</div></div>
  </div>` : '')).join('');
  return `${stemCards}<div class="qcard" data-row="${r.row_id}">
    ${head('card')}
    <div class="qsheet">
      ${r.lead ? `<div class="qsheet-lead">${typeset_(r.lead)}</div>` : ''}
      <div class="qsheet-part"><div class="qsheet-pb">${figs}${typeset_(r.html)}</div></div>
    </div>
  </div>`;
}

/* ---------- ONE SET OF RULES, ASKED OF TWO SETS OF CARDS § */
function measure(arg) {
    const out = [];
    document.querySelectorAll(arg.sel).forEach(card => {
      /* THE CARD ITSELF, AND THEN WHAT IS INSIDE IT. § */
      const over = el => el.scrollWidth - el.clientWidth;
      /* ---------- A BOX THAT WAS TOLD IT COULD SCROLL IS NOT A FAULT § */
      const told = el => {
        const o = getComputedStyle(el).overflowX;
        return o === 'auto' || o === 'scroll';
      };
      /* ---------- NOTHING INSIDE A DRAWING CAN PUSH THE PAGE SIDEWAYS § */
      const inSvg = el => el.ownerSVGElement != null;
      let worst = { px: 0, sel: '' };
      [card, ...card.querySelectorAll('*')].forEach(el => {
        if (!el.clientWidth || told(el) || inSvg(el)) return;
        const px = over(el);
        /* `className` ON AN SVG ELEMENT IS AN `SVGAnimatedString`, NOT A STRING, so every finding inside a drawing printed as `[object Object]` — one grouping key for § */
        const sel = (typeof el.className === 'string' && el.className)
                  || el.getAttribute('class') || el.tagName.toLowerCase();
        if (px > worst.px) worst = { px, sel };
      });
      if (worst.px > arg.slack) out.push({ row: card.dataset.row, px: worst.px, sel: worst.sel });
    });
    return out;
}

/* ---------- A LABEL PAINTED OUTSIDE ITS OWN DRAWING § */
function outside(svg, row) {
  const box = svg.getBoundingClientRect();
  const out = [];
  svg.querySelectorAll('text').forEach(t => {
    const r = t.getBoundingClientRect();
    if (!r.width && !r.height) return;
    const px = Math.round(Math.max(box.left - r.left, r.right - box.right,
                                   box.top - r.top, r.bottom - box.bottom));
    if (px > 1) out.push({ row: row, px: px, sel: (t.textContent || '').trim().slice(0, 34) });
  });
  return out;
}

(async () => {
  const rows = JSON.parse(fs.readFileSync(path.join(ROOT, 'data', 'questions.json'), 'utf8'));
  const parts = rows.filter(r => r && r.kind === 'question');
  /* THE SAME INDEX `stemIndex_` BUILDS, by the same rule: a stem naming a question belongs to that
     question, one naming only a section to the section, one naming neither to the paper. */
  const stems = { paper: {}, section: {}, question: {} };
  rows.forEach(r => {
    if (!r || r.kind !== 'preamble' || !r.paper_id) return;
    if (r.question !== undefined && r.question !== null && r.question !== '') {
      stems.question[r.paper_id + '|' + r.question] = r;
    } else if (r.section) {
      stems.section[r.paper_id + '|' + r.section] = r;
    } else {
      stems.paper[r.paper_id] = r;
    }
  });

  if (!parts.length) {
    console.error('no question rows found — this check cannot see its subject, which is not a pass');
    process.exit(1);
  }

  const server = await serve();
  const exe = ['/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
               '/opt/pw-browsers/chromium/chrome-linux/chrome'].find(p => fs.existsSync(p));
  const browser = await chromium.launch(exe ? { executablePath: exe } : {});
  const page = await browser.newPage({ viewport: { width: WIDTH, height: 900 } });

  const pracPage = await browser.newPage({ viewport: { width: WIDTH, height: PHONE_H } });
  const fixture = fs.readFileSync(path.join(ROOT, 'check', 'fixture.json'), 'utf8');
  await pracPage.route('**://script.google.com/**', rq =>
    rq.fulfill({ status: 200, contentType: 'application/json', body: fixture }));
  await pracPage.goto('http://localhost:' + PORT + '/index.html', { waitUntil: 'domcontentloaded' });
  await pracPage.waitForTimeout(2600);
  /* THE ROWS, FROM THE APP: every question's card row and the row its other pages wear (`TAGROWS`). */
  TAGROWS = await pracPage.evaluate(() => {
    if (typeof stuffItems !== 'function' || typeof tagRow_ !== 'function') return null;
    const out = {};
    stuffItems().forEach(x => { if (x.kind === 'question' && x.row) out[x.row.row_id] = { card: tagRow_(x), other: tagRow_(x, 'stem0') }; });
    return out;
  });
  if (!TAGROWS || !Object.keys(TAGROWS).length) {
    console.error('check/cards.js: tagRow_ or stuffItems is not reachable in the app — the cards would be measured without their rows, which is not a pass');
    process.exit(1);
  }
  /* ---------- IN BATCHES, BECAUSE ONE DOCUMENT OF FOUR THOUSAND CARDS IS A DIFFERENT TEST § */
  const BATCH = 500;
  const bad = [];
  const outOfBox = [];
  let withDiag = 0;
  for (let i = 0; i < parts.length; i += BATCH) {
    const chunk = parts.slice(i, i + BATCH);
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div id="col" style="width:${WIDTH}px">${chunk.map(r => cardHtml(r, stems)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.waitForTimeout(120);
    const found = await page.evaluate(measure, { slack: SLACK, sel: '.qcard' });
    bad.push(...found);
    /* ---------- AND THE 68 DRAWINGS IN THE LIBRARY, WHICH NOTHING HAD EVER MEASURED § */
    const drawn = await page.evaluate(arg => {
      /* HANDED IN AS SOURCE rather than injected at navigation, because `setContent` replaces the document under this page on every batch and an init script's timing § */
      const outside = new Function('return ' + arg.src)();
      const out = []; let n = 0;
      document.querySelectorAll(arg.sel).forEach(card => {
        let any = false;
        card.querySelectorAll('svg').forEach(svg => {
          if (svg.ownerSVGElement) return;          /* the outermost one is the one that clips */
          any = true;
          out.push(...outside(svg, card.dataset.row || '?'));
        });
        if (any) n++;
      });
      return { out: out, n: n };
    }, { sel: '.qcard', src: outside.toString() });
    outOfBox.push(...drawn.out);
    withDiag += drawn.n;
  }

  /* ---------- AND EVERY PRACTICAL CARD, WHICH NOTHING HAD EVER LAID OUT § */
  /* ---------- A REAL PHONE'S HEIGHT, BECAUSE THE PANE'S CAP IS MEASURED IN `dvh` § */
  const practicals = await pracPage.evaluate(width => {
    if (typeof stuffItems !== 'function' || typeof practicalCard_ !== 'function') return -1;
    const items = stuffItems().filter(x => x.kind === 'practical');
    /* IN A `.pane` INSIDE A `.page`, because that is what the card sits in when the app draws it
       and half its width comes from those two. A card measured in a bare div is a card measured in
       a column it is never in. */
    const host = document.createElement('div');
    host.style.cssText = 'position:absolute;left:0;top:0;width:' + width + 'px';
    host.innerHTML = '<section class="page"><div class="pane"></div></section>';
    document.body.appendChild(host);
    /* EVERY PAGE OF EVERY PRACTICAL, not just its first card: § */
    host.querySelector('.pane').innerHTML = items.map(x =>
      pageParts_(x).map(part => (part ? practicalPart_(x, part) : practicalCard_(x))
        .replace('<div class="card prac', '<div data-row="' + x.key + (part ? '#' + part : '')
          + '" class="card prac')).join('')).join('');
    window.__pracHost = host;
    /* ---------- AND WHETHER THE CARD FITS THE PANE, WHICH IS THE OTHER AXIS § */
    const cap = parseFloat(getComputedStyle(host.querySelector('.pane')).maxHeight);
    const tall = [];
    host.querySelectorAll('.card.prac').forEach(el => {
      const h = el.getBoundingClientRect().height;
      if (h > cap) tall.push({ row: el.dataset.row, px: Math.round(h - cap) });
    });
    return { n: items.length, cap: Math.round(cap), tall };
  }, WIDTH);
  /* ---------- AND EVERY GUIDE, WHICH IS ON THE CARD § */
  /* ---------- AND EVERY QUESTION CARD, ON THE SAME AXIS § */
  /* ---------- EVERY PAGE OF EVERY QUESTION, AT TWO PHONES, IN THE STRIP'S OWN ORDER § */
  const qtallAt = async (w, h) => {
    await pracPage.setViewportSize({ width: w, height: h });
    await pracPage.waitForTimeout(150);
    return pracPage.evaluate(width => {
      if (typeof stuffItems !== 'function' || typeof questionCard_ !== 'function'
          || typeof stuffPart_ !== 'function' || typeof stuffCard !== 'function') return -1;
      const items = stuffItems().filter(x => x.kind === 'question');
      const host = document.createElement('div');
      host.style.cssText = 'position:absolute;left:0;top:0;width:' + width + 'px';
      host.innerHTML = '<section class="page"><div class="pane"></div></section>';
      document.body.appendChild(host);
      const cap = parseFloat(getComputedStyle(host.querySelector('.pane')).maxHeight);
      const tall = [], kinds = {};
      /* ---------- EVERY PICTURE IN ITS QUESTION'S CARD, AND NO FIGURE PAGE (docs/history/356) § */
      const inline = [];
      const pages = [];
      items.forEach((x, i) => {
        const q = questionCard_(x, 0);
        /* `qpad` THE PAD, NOT ANY CLASS THAT STARTS WITH IT: § */
        /* A TILE'S MARK IS NOT A PICTURE. § */
        const qPic = q.replace(/<svg class="tile-i[\s\S]*?<\/svg>/g, '');
        const own = x.diagram && !(typeof padSource_ === 'function' && padSource_(x) && padSource_(x).from === 'surface');
        if (own && !/<svg/.test(qPic) && !pageParts_(x, items[i - 1]).some(p => p && /<svg/.test(stuffPart_(x, p)))) inline.push(x.row.row_id + ' has a figure and none of its pages draws it');
        if (/on the next page/.test(q) && /Figure on the next page/.test(q)) inline.push(x.row.row_id + ' points at a figure on another page');
        if (/class="qsheet-stem/.test(q)) inline.push(x.row.row_id + ' prints its stem on the part\'s card');
        if (/class="qans|qans-body/.test(q)) inline.push(x.row.row_id + ' draws its answer on the question card');
        if (typeof questionHasAns_ === 'function' && questionHasAns_(x)
            && !/class="qcard qans-card/.test(questionAnsCard_(x))) {
          inline.push(x.row.row_id + ' has an answer and no answer page');
        }
        pageParts_(x, items[i - 1]).forEach(part => pages.push({ x: x, part: part }));
      });
      /* `stem3-2` and `stem0` are both a stem's page; `pre1` a long part's first pages. */
      const kindOf = p => (!p ? 'card' : p.replace(/\d+(-\d+)?$/, ''));
      for (let i = 0; i < pages.length; i += 200) {
        const batch = pages.slice(i, i + 200);
        host.innerHTML = batch.map(pg => {
          const html = pg.part ? stuffPart_(pg.x, pg.part) : stuffCard(pg.x, 0);
          /* THE FIGURE MARKER IS NEVER A PAGE'S -- `<!--fig-->` says where the figure stands and is taken out before anything is cut or drawn (`figBlocks_`). § */
          if (/<!--\s*fig\s*-->/i.test(html)) inline.push((pg.x.row && pg.x.row.row_id) + (pg.part ? '#' + pg.part : '') + ' draws the <!--fig--> marker');
          return '<section class="page"><div class="pane"><div data-row="' + (pg.x.row && pg.x.row.row_id)
            + (pg.part ? '#' + pg.part : '') + '" data-kind="' + kindOf(pg.part) + '" class="card is-widget">'
            + html + '</div></div></section>';
        }).join('');
        host.querySelectorAll('.card.is-widget').forEach(el => {
          const k = el.dataset.kind;
          kinds[k] = kinds[k] || { n: 0, tall: 0 };
          kinds[k].n++;
          if (/^(fig|sfig|use|nofig)$/.test(k)) inline.push(el.dataset.row + ' is a figure page -- a figure is in its card');
          const h = el.getBoundingClientRect().height;
          if (h > cap) { kinds[k].tall++; tall.push({ row: el.dataset.row, kind: k, px: Math.round(h - cap) }); }
        });
      }
      host.remove();
      return { n: items.length, pages: pages.length, cap: Math.round(cap), tall, inline, kinds };
    }, w);
  };
  const qtall = await qtallAt(WIDTH, PHONE_H);
  const qtallBig = await qtallAt(390, 844);
  await pracPage.setViewportSize({ width: WIDTH, height: PHONE_H });

  await pracPage.evaluate('window.__measure = ' + measure.toString());
  await pracPage.evaluate('window.__outside = ' + outside.toString());
  /* ---------- ON THE CARD, WHERE IT IS DRAWN, AND IT USED TO BE IN A SHEET § */
  const guides = await pracPage.evaluate(arg => {
    if (typeof practicalCard_ !== 'function') return -1;
    const items = stuffItems().filter(x => x.kind === 'practical');
    const wide = [], clipped = [], order = [];
    let drawings = 0, lines = 0, withQty = 0;
    const host = document.createElement('div');
    host.id = '__cardhost';
    host.innerHTML = '<section class="page"><div class="pane"></div></section>';
    document.body.appendChild(host);
    const pane = host.querySelector('.pane');
    items.forEach(x => {
      /* ALL OF A PRACTICAL'S PAGES AT ONCE, in the order the strip draws them — see `pageParts_`. § */
      const parts = pageParts_(x);
      pane.innerHTML = parts.map(part => part ? practicalPart_(x, part) : practicalCard_(x)).join('');
      const gd = parts.length > 1 ? pane.querySelector('.gd') : null;
      /* A REFUSED PRACTICAL DRAWS NO GUIDE, BY RULE — no kit, no method, no worksheet, because writing out a procedure for something nobody will run is inventing § */
      if (!gd) return;
      pane.querySelectorAll('.gd').forEach(g => { g.dataset.row = x.key; });
      window.__measure({ slack: arg.slack, sel: '#__cardhost .gd' })
        .forEach(f => wide.push(f));
      pane.querySelectorAll('figure svg').forEach(svg => {
        drawings++;
        clipped.push(...window.__outside(svg, x.key));
      });
      /* ---------- THE PICTURE, THEN THE THINGS NEEDED, AND EXACTLY ONE OF EACH § */
      /* SPLIT OVER FIVE CARDS NOW, so "first" is a CARD: § */
      const figs = pane.querySelectorAll('figure');
      const main = pane.querySelector('.card.prac:not(.prac-part)');
      const figPage = pane.querySelector('.prac-part.is-fig');
      const kit = pane.querySelector('.prac-part.is-kit .prac-kit');
      const work = pane.querySelector('.prac-part.is-work');
      if (x.row.diagram && !figs.length) {
        order.push(x.key + ' has an apparatus drawing and none of its cards draws it');
      } else if (figs.length > 1) {
        order.push(x.key + ' draws its apparatus drawing ' + figs.length + ' times across its cards');
      } else if (figs.length === 1 && !(figPage && figPage.contains(figs[0]))) {
        /* ITS OWN PAGE, STRAIGHT AFTER THE CARD — "across the board of all resources the diagrams
           should be its own widgets". It was on the practical's own card until then. */
        order.push(x.key + ' draws its apparatus drawing somewhere other than its own figure page');
      } else if (figPage && figPage.previousElementSibling !== main) {
        order.push(x.key + ' puts its figure page somewhere other than straight after its card');
      } else if (figs.length === 1 && kit
                 && !(figs[0].compareDocumentPosition(kit) & Node.DOCUMENT_POSITION_FOLLOWING)) {
        order.push(x.key + ' draws its apparatus drawing BELOW the kit list — the picture of the '
          + 'practical comes first, then the things it is made of');
      }
      if (main && main.querySelector('.prac-kit, .prac-steps, .gd-box')) {
        order.push(x.key + ' still draws its guide on the practical\'s own card — the kit, the '
          + 'method and the worksheet are pages of their own now');
      }
      if (!work || work.querySelectorAll('.gd-box').length !== 3) {
        order.push(x.key + ' has no worksheet page holding exactly the three boxes (iv, dv, cv)');
      }
      /* ---------- THE KIT IS A LIST AGAIN, AND IT DRAWS EVERY ITEM IT HOLDS § */
      const kitList = pane.querySelectorAll('.prac-part.is-kit .prac-kit ul > li');
      const want = ((x.row && x.row.equipment) || []).length;
      lines += kitList.length;
      withQty += ((x.row && x.row.equipment) || []).filter(e => e && e.qty).length;
      if (want && kitList.length !== want) {
        order.push(x.key + ' draws ' + kitList.length + ' kit line(s) for the ' + want
          + ' item(s) its row holds');
      }
      if (pane.querySelector('.kit-chip')) {
        order.push(x.key + ' draws its kit as chips — they were reverted to a plain list');
      }
    });
    host.remove();
    return { n: items.length, drawings, wide, clipped, order, lines, withQty };
  }, { slack: SLACK });

  /* A CHECK THAT CANNOT REACH ITS SUBJECT MUST SAY SO AND FAIL -- "I did not check" is not the same answer as "I checked and it was fine", which is the fault this § */
  if (guides === -1 || (guides !== -1 && !guides.n)) {
    console.error('\nthe app did not draw one practical card -- not a pass');
    process.exit(1);
  }
  if (practicals === -1) {
    console.error('\nthe app did not boot, so not one practical card was laid out -- not a pass');
    process.exit(1);
  }
  if (!practicals.n) {
    console.error('\nthe app has no practical items, so this check saw nothing -- not a pass');
    process.exit(1);
  }
  bad.push(...await pracPage.evaluate(measure, { slack: SLACK, sel: '.card.prac' }));

  await pracPage.close();

  if (SHOTS && bad.length) {
    fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
    const worst = bad.slice().sort((a, b) => b.px - a.px).slice(0, 8).map(b => b.row);
    const pick = parts.filter(r => worst.includes(r.row_id));
    await page.setContent(
      `<!doctype html><meta charset="utf-8">
       <link rel="stylesheet" href="http://localhost:${PORT}/style.css">
       <body style="margin:0;background:#0b0b0b">
         <div style="width:${WIDTH}px">${pick.map(r => cardHtml(r, stems)).join('')}</div>
       </body>`, { waitUntil: 'load' });
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(__dirname, 'shots', 'cards-overflow.png'),
                            fullPage: true });
  }

  await browser.close();
  server.close();

  const withPre = parts.filter(r => {
    const at = (scope, key) => (stems[scope] || {})[key];
    return at('paper', r.paper_id)
        || (r.section && at('section', r.paper_id + '|' + r.section))
        || (r.question !== '' && at('question', r.paper_id + '|' + r.question));
  }).length;
  console.log(`\n${parts.length} question rows laid out at ${WIDTH}px `
            + `(${withPre} of them under a preamble), and ${practicals.n} practical cards`);
  console.log(`the pane caps at ${practicals.cap}px on a ${WIDTH}x${PHONE_H} phone; `
            + `${practicals.tall.length} practical card(s) are taller than that`);
  console.log(`${guides.n} practical(s) laid out over their split cards, `
            + `carrying ${guides.drawings} apparatus drawing(s)`);
  console.log(`${guides.lines} kit line(s) drawn across those guides, `
            + `${guides.withQty} of them carrying a quantity`);

  const painted = outOfBox.concat(guides.clipped);
  console.log(`${withDiag} question card(s) carry a drawing, and every label in every drawing `
            + `was measured against its own box`);

  /* ---------- AND THE ORDER THE OWNER ASKED FOR § */
  if (guides.order.length) {
    console.log('\nTHE GUIDE IS IN THE WRONG ORDER OR SHAPE  (' + guides.order.length + ')');
    guides.order.forEach(o => console.log('  ' + o));
  }

  if (painted.length) {
    console.log('\nPAINTED OUTSIDE THE DRAWING  (' + painted.length + ')');
    painted.sort((x, y) => y.px - x.px).slice(0, 12).forEach(c =>
      console.log('  ' + c.row + ' — "' + c.sel + '" is ' + c.px + 'px past the svg\'s own box, '
        + 'so the reader never sees that part of it'));
  }

  /* EACH PHONE, EACH PAGE KIND: how many there are, how many are taller than the pane, and the worst
     three of each kind. `--all` prints every one, for somebody working through them. */
  [[qtall, WIDTH + 'x' + PHONE_H], [qtallBig, '390x844']].forEach(([t, phone]) => {
    if (t === -1) return;
    console.log('\nQUESTION PAGES TALLER THAN THE PANE ON A ' + phone + ' PHONE  ('
      + t.tall.length + ' of ' + t.pages + ' pages, from ' + t.n + ' questions; the pane is ' + t.cap
      + 'px) — reachable, not cut off: see the note above `qtallAt`');
    Object.keys(t.kinds).forEach(k => {
      const list = t.tall.filter(x => x.kind === k).sort((a, b) => b.px - a.px);
      console.log('  ' + k.padEnd(5) + ' ' + String(t.kinds[k].tall).padStart(5) + ' of '
        + String(t.kinds[k].n).padStart(5) + (list.length ? '   worst: ' + list.slice(0, ALL ? list.length : 3)
          .map(x => x.row + ' +' + x.px + 'px').join(', ') : ''));
    });
  });

  if (practicals.tall.length) {
    console.log('\nA PRACTICAL THAT HAS TO BE SCROLLED  (' + practicals.tall.length + ' of '
      + practicals.n + ') — reachable, not cut off: see the note above `tall`');
    practicals.tall.sort((a, b) => b.px - a.px).slice(0, 10)
      .forEach(t => console.log('  ' + t.row + ' — ' + t.px + 'px past the ' + practicals.cap
        + 'px pane, so the pane scrolls and the pager takes over at the end'));
    if (practicals.tall.length > 10) {
      console.log('  … and ' + (practicals.tall.length - 10) + ' more');
    }
  }

  bad.push(...guides.wide);
  /* `practicals.tall` IS OUT OF THIS TEST, with the rule it belongs to: it counts cards taller than
     the fold, and the pane scrolls them. The question count beside it was never in it. */
  const inline = (qtall === -1 ? ['questionCard_ could not be reached, so where the pictures are was NOT checked']
                               : qtall.inline);
  if (inline.length) {
    console.log('\nA PICTURE NOT IN ITS QUESTION\'S CARD, OR A FIGURE PAGE  (' + inline.length + ')');
    inline.slice(0, 10).forEach(l => console.log('  ' + l));
    if (inline.length > 10) console.log('  … and ' + (inline.length - 10) + ' more');
  }
  if (!bad.length && !painted.length && !guides.order.length && !inline.length) {
    /* IT SAID "EVERY QUESTION FITS THE NARROWEST PHONE" AND MEANT ITS WIDTH. § */
    console.log('\nOK — every question, every practical and every guide fits the WIDTH of the\n'
              + '     narrowest phone, and every label in every drawing is inside the drawing.'
              + '\n     The picture of a practical comes before the things it is made of, once each,'
              + '\n     and every question\'s picture is in one of its own cards, with no figure page.'
              + '\n     Every card is measured with the app\'s own tag row (tagRow_), on '
              + Object.keys(TAGROWS).length + ' questions.'
              /* IT SAID "every practical card fits the pane it is drawn in" AND 77 OF 82 DO NOT. § */
              + (qtall !== -1 && qtall.tall.length
                 ? '\n     ' + qtall.tall.length + ' of ' + qtall.pages + ' question pages are taller than a ' + WIDTH + 'x' + PHONE_H
                   + ' pane and scroll, ' + (qtallBig === -1 ? '?' : qtallBig.tall.length) + ' at 390x844 — printed above.' : '')
              + (practicals.tall.length
                 ? '\n     ' + practicals.tall.length + ' practical cards are too, for the same reason.' : ''));
    process.exit(0);
  }

  /* GROUPED BY WHAT IS OVERFLOWING, not by row, for the same reason `ui.js` groups by fault: fifty
     rows with one cause is one thing to fix and fifty lines is a wall nobody reads. */
  const by = {};
  bad.forEach(b => { (by[b.sel] = by[b.sel] || []).push(b); });
  if (bad.length) console.log('\nCARDS THAT DO NOT FIT:');
  Object.keys(by).sort((a, b) => by[b].length - by[a].length).forEach(sel => {
    const list = by[sel].sort((a, b) => b.px - a.px);
    console.log(`  ${sel} — ${list.length} row(s), up to ${list[0].px}px past the column`);
    list.slice(0, 4).forEach(b => console.log(`      ${b.row}  (+${b.px}px)`));
    if (list.length > 4) console.log(`      …and ${list.length - 4} more`);
  });
  console.log('');
  process.exit(1);
})();
