#!/usr/bin/env node
/* @family. — tools/cache.js IS CACHING USED TO THE MAX (920): § */
'use strict';
const H = require('./health.js');

function cache() {
  const W = [], ok = [], html = H.read('index.html'), sw = H.read('sw.js');
  const js = H.git(['ls-files', 'js/*.js']).split('\n').filter(f => f && !/^js\/(check|_)/.test(f)).map(f => [f, H.read(f)]);
  const lineOf = (s, i) => s.slice(0, i).split('\n').length;
  /* VERSIONED URLS: every script and the stylesheet asked for with the content hash, so a deploy is the only thing that busts them. */
  const stamp = /var BUILD_STAMP = '([0-9a-f]{6,})'/.exec(html);
  if (stamp) ok.push('scripts and stylesheet carry the content hash (BUILD_STAMP ' + stamp[1] + ')'); else W.push({ where: 'index.html', say: 'no BUILD_STAMP: file URLs are not versioned by content' });
  if (!/src="js\/' \+ f \+ '\.js\?t=' \+ LOAD/.test(html)) W.push({ where: 'index.html', say: 'the script tags do not carry ?t=LOAD' });
  /* ALWAYS FRESH (98, owner 9 Nov): no worker holds files; the content hash is the only cache-buster. */
  if (/serviceWorker\.register\(/.test(html) || /addEventListener\(\s*['"]fetch['"]/.test(sw)) W.push({ where: 'sw.js', say: 'a service worker serves app files again — every visit must load the current files (98)' });
  else ok.push('no service worker holds app files: each visit loads the current, hash-stamped files');
  /* THE BOOT PAYLOAD: a copy kept on the device, tied to the account and build, read before doGet answers (roadmap "Instant return visits"). */
  const keeps = js.filter(([, s]) => /(?:setItem|keepPut_|\.put)\(\s*['"`][^'"`]*(?:payload|boot|lastData)/i.test(s));
  if (!keeps.length) W.push({ where: 'js/shell.js load()', say: 'missing: the doGet payload is fetched fresh on every visit — no stale-while-revalidate copy (account + build keyed, cleared on sign-out). Roadmap "Instant return visits".' });
  else ok.push('a payload copy is kept in ' + keeps.map(k => k[0]).join(', '));
  /* SECRETS: nothing stored on the device may hold a PIN, password or secret; a session token is reported. */
  js.forEach(([f, s]) => { for (const m of s.matchAll(/(?:localStorage|sessionStorage)\.setItem\(([^;\n]{0,160})/g)) {
    if (/\b(?:pin|password|passcode|secret)\b/i.test(m[1])) W.push({ where: f + ':' + lineOf(s, m.index), say: 'stores what looks like a PIN or secret: ' + m[0].slice(0, 100) }); } });
  if (/USER\.token/.test(require('./piece-src.js').pieceSrc('shell')) && js.some(([, s]) => /setItem\('familyUser', JSON\.stringify\(USER\)\)/.test(s)))
    W.push({ where: 'js/find.js', say: 'familyUser (with its session token) is kept in localStorage whole — fine for a session, but never let a PIN join it' });
  /* THE WALK'S REPEAT VISIT. */
  let U = null; try { U = JSON.parse(H.read('data/ux-health.json')); } catch (e) { U = null; }
  const V = U && U.visits;
  if (!V || !V.repeat || V.repeat.error) W.push({ where: 'tools/ux-health.js', say: 'no repeat-visit measure yet: run node tools/ux-health.js' + (V && V.repeat && V.repeat.error ? ' (' + V.repeat.error + ')' : '') });
  else { ok.push(`repeat visit: ${V.repeat.netKB} KB from the network, ${V.repeat.cacheKB} KB from cache (${V.repeat.cacheN} of ${V.repeat.n} requests), first visit ${V.first ? V.first.netKB : '?'} KB, loaded in ${V.repeat.loadedMs} ms`);
    if (V.first && V.repeat.netKB > V.first.netKB * 0.2) W.push({ where: 'repeat visit', say: `${V.repeat.netKB} KB still came over the network (over a fifth of the first visit's ${V.first.netKB} KB)` }); }
  return { work: W.map(w => Object.assign({ kind: 'cache' }, w)), ok, achievable: 'GitHub Pages fixes max-age=600; a content-hashed URL means a deploy is picked up on the next visit, and a kept payload would make a return visit paint with no network at all.' };
}
module.exports = { cache };
if (require.main === module) { const C = cache(); C.ok.forEach(o => console.log('ok: ' + o)); C.work.forEach(w => console.log(`cache  ${w.where}  ${w.say}`)); console.log('achievable: ' + C.achievable); }
