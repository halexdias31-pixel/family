/* icon-originals.js - each icon's original Commons file pinned by sha1 in data/icons.json `original` (512). node tools/epaper-verse/icon-originals.js record | verify [--out DIR] | masters --from DIR */
/* One request at a time with a pause and a long back-off on 429: Wikimedia rate-limits. */
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
if (process.env.HTTPS_PROXY && !process.env.NODE_USE_ENV_PROXY) {   // node's fetch ignores the proxy unless asked; re-run self with it
  const r = require('child_process').spawnSync(process.execPath, process.argv.slice(1), { stdio: 'inherit', env: { ...process.env, NODE_USE_ENV_PROXY: '1', NODE_NO_WARNINGS: '1' } });
  process.exit(r.status == null ? 1 : r.status);
}
const ROOT = path.join(__dirname, '..', '..'), FILE = path.join(ROOT, 'data', 'icons.json');
const UA = 'family-icon-originals/1.0 (small tutoring site; keeps public-domain icon sources pinned by sha1; one request at a time)';
const arg = (k) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : null; };
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function get_(url, asBuf) {
  for (let t = 0; t < 8; t++) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (r.status === 429 || r.status >= 500) { const w = (Number(r.headers.get('retry-after')) || 30 * (t + 1)) * 1000; console.error('  ' + r.status + ', waiting ' + w / 1000 + 's'); await sleep(w); continue; }
    if (!r.ok) throw new Error(r.status + ' ' + url);
    if (asBuf) return Buffer.from(await r.arrayBuffer());
    const s = await r.text();
    if (/too many requests/i.test(s) && !s.startsWith('{')) { console.error('  rate-limited, waiting ' + 30 * (t + 1) + 's'); await sleep(30000 * (t + 1)); continue; }
    return JSON.parse(s);
  }
  throw new Error('gave up after 8 tries: ' + url);
}

/* The archive URL is where MediaWiki moves this exact revision once the file is overwritten: archive/<h>/<hh>/<YYYYMMDDHHMMSS>!<name>. */
function revisionUrl_(url, ts) {
  const m = url.match(/^(https:\/\/upload\.wikimedia\.org\/wikipedia\/commons)\/(\w)\/(\w\w)\/(.+)$/);
  return m ? `${m[1]}/archive/${m[2]}/${m[3]}/${ts.replace(/\D/g, '')}!${m[4]}` : '';
}

async function record_(rows) {
  const want = rows.map(r => r.image_source.file);
  const info = {};
  for (let i = 0; i < want.length; i += 40) {
    const q = 'https://commons.wikimedia.org/w/api.php?action=query&format=json&formatversion=2&redirects=1&prop=imageinfo&iiprop=url|sha1|size|mime|timestamp&titles=' + encodeURIComponent(want.slice(i, i + 40).join('|'));
    const j = await get_(q);
    const alias = {}; for (const n of [...(j.query.normalized || []), ...(j.query.redirects || [])]) alias[n.from] = n.to;
    for (const p of j.query.pages) if (p.imageinfo) info[p.title] = p.imageinfo[0];
    for (const w of want.slice(i, i + 40)) { let t = w; while (alias[t]) t = alias[t]; if (info[t]) info[w] = info[t]; }
    await sleep(3000);
  }
  let n = 0;
  for (const r of rows) {
    const ii = info[r.image_source.file];
    if (!ii) { console.error('NOT FOUND: ' + r.id + ' ' + r.image_source.file); continue; }
    const url = ii.url.split('?')[0];   // drop the API's utm tracking query
    r.original = { url, revision_url: revisionUrl_(url, ii.timestamp), timestamp: ii.timestamp, sha1: ii.sha1, bytes: ii.size, width: ii.width, height: ii.height, mime: ii.mime };
    n++;
  }
  const row = (r) => '{' + Object.entries(r).map(([k, x]) => JSON.stringify(k) + ': ' + JSON.stringify(x)).join(', ') + '}';   // the file's own one-row-a-line shape
  fs.writeFileSync(FILE, '[\n' + rows.map(row).join(',\n') + '\n]\n');
  console.log('recorded ' + n + '/' + rows.length + ' originals, ' + rows.reduce((s, r) => s + (r.original ? r.original.bytes : 0), 0) + ' bytes in all');
}

async function verify_(rows, out) {
  if (out) fs.mkdirSync(out, { recursive: true });
  let ok = 0, total = 0; const bad = [];
  for (const r of rows) {
    const o = r.original; if (!o) { bad.push(r.id + ': no original recorded'); continue; }
    const f = out && path.join(out, r.id + path.extname(new URL(o.url).pathname).toLowerCase());
    let buf = f && fs.existsSync(f) ? fs.readFileSync(f) : null;
    if (!buf || crypto.createHash('sha1').update(buf).digest('hex') !== o.sha1) { buf = await get_(o.url, true); await sleep(2000); }
    const h = crypto.createHash('sha1').update(buf).digest('hex');
    if (h !== o.sha1 || buf.length !== o.bytes) { bad.push(r.id + ': sha1 ' + h + ' (' + buf.length + ' B), recorded ' + o.sha1 + ' (' + o.bytes + ' B) — changed upstream; the recorded revision is at ' + o.revision_url); continue; }
    if (f) fs.writeFileSync(f, buf);
    ok++; total += buf.length;
  }
  console.log(ok + '/' + rows.length + ' originals verified by sha1, ' + total + ' bytes' + (out ? ' in ' + out : ''));
  bad.forEach(b => console.log('  ' + b));
  if (bad.length) process.exit(1);
}

/* The master (499): greyscale, 600px on the long side, JPEG at the best quality under 80 KB (check-eink's limit). */
function masters_(rows, from) {
  for (const r of rows) {
    const src = fs.readdirSync(from).find(f => f.replace(/\.\w+$/, '') === r.id);
    if (!src) throw new Error(r.id + ': no original in ' + from + ' — run verify --out ' + from + ' first');
    const buf = fs.readFileSync(path.join(from, src));
    if (crypto.createHash('sha1').update(buf).digest('hex') !== r.original.sha1) throw new Error(r.id + ': ' + src + ' is not the recorded original');
    const dst = path.join(ROOT, 'data', 'icons', 'master', r.id + '.jpg');
    for (let q = 92; q >= 40; q -= 4) {
      execFileSync('convert', [path.join(from, src) + '[0]', '-auto-orient', '-colorspace', 'Gray', '-resize', '600x600', '-strip', '-quality', String(q), dst]);
      if (fs.statSync(dst).size <= 80000) break;
    }
  }
  console.log('remade ' + rows.length + ' masters from their originals');
}

(async () => {
  const rows = JSON.parse(fs.readFileSync(FILE, 'utf8')), cmd = process.argv[2];
  if (cmd === 'record') await record_(rows);
  else if (cmd === 'verify') await verify_(rows, arg('--out'));
  else if (cmd === 'masters') masters_(rows, arg('--from') || (console.error('masters needs --from DIR'), process.exit(2)));
  else { console.error('usage: icon-originals.js record | verify [--out DIR] | masters --from DIR'); process.exit(2); }
})().catch(e => { console.error('icon-originals: ' + e.message); process.exit(1); });
