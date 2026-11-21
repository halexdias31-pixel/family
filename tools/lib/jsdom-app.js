/* @family. — tools/lib/jsdom-app.js: the real app in jsdom as an Admin, every POST recorded. Read by the build tools that walk the app (finder-tags, facet-data, facet-hues). */
const { JSDOM, VirtualConsole } = require('jsdom');
const { ROOT, text } = require('./gen.js');
const order = () => {
  const m = /window\.FILES\s*=\s*\[([\s\S]*?)\]/.exec(text('index.html'));
  if (!m) { console.error('cannot read window.FILES out of index.html'); process.exit(2); }
  return [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
};
const tick = ms => new Promise(o => setTimeout(o, ms));
/* `payload` is what doGet sends; `rows(name, json)` may rewrite a data/*.json reply. */
async function app(payload, rows) {
  const html = text('index.html').replace(/<script[\s\S]*?<\/script>/g, '');
  const dom = new JSDOM(html, { runScripts: 'outside-only', pretendToBeVisual: true, url: 'https://example.org/', virtualConsole: new VirtualConsole() });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false, addEventListener() {}, removeEventListener() {} });
  w.scrollTo = () => {}; w.HTMLElement.prototype.scrollIntoView = () => {};
  w.HTMLMediaElement.prototype.pause = () => {}; w.HTMLMediaElement.prototype.play = () => Promise.resolve();
  let closed = false;
  /* NODE'S OWN TIMER, so it outlives w.close(): a closed app never paints again (build.js walks two apps in one process). */
  w.requestAnimationFrame = cb => setTimeout(() => { if (!closed) cb(Date.now()); }, 0); w.cancelAnimationFrame = id => clearTimeout(id);
  w.localStorage.setItem('familyUser', JSON.stringify({ name: 'T', personId: 'P-A', role: 'Admin', roles: ['admin'] }));
  const reply = t => ({ ok: true, status: 200, text: () => Promise.resolve(JSON.stringify(t)), json: () => Promise.resolve(t) });
  const posts = [];
  w.fetch = (u, o) => {
    if (o && o.body) {
      let b = {};
      try { b = JSON.parse(o.body); } catch (e) { b = { unreadable: true }; }
      posts.push(b);
      return Promise.resolve(reply({ success: true }));
    }
    const f = /(data\/[a-z0-9_\-\/]+\.json)/.exec(String(u));
    if (f) {
      let j = null;
      try { j = JSON.parse(text(f[1])); } catch (e) { j = null; }
      if (j !== null) return Promise.resolve(reply(rows ? rows(f[1], j) : j));
    }
    return Promise.resolve(reply(payload));
  };
  w.console.warn = () => {}; w.console.log = () => {}; w.console.error = () => {};
  /* A BROWSER FIRES `unhandledrejection` ON THE WINDOW; jsdom leaves it to node, so it is handed back here. */
  const rej = r => { const ev = new w.Event('unhandledrejection'); ev.reason = r; w.dispatchEvent(ev); };
  process.on('unhandledRejection', rej);
  const src = order().map(n => text('js/' + n + '.js')).join('\n');
  /* `__ev` READS THE APP'S OWN SCOPE: its `let`s and `const`s live inside this one eval, out of reach of another. */
  w.eval(src + '\n;window.__h={TABS,paint,go,SCREENS,on};window.__ev=function(s){return eval(s);};');
  await tick(1500);
  return { w, h: w.__h, posts, close: () => { closed = true; process.off('unhandledRejection', rej); w.close(); } };
}
const undrawn = (w, id) => {
  const el = w.document.getElementById('s-' + id);
  return !el ? 'no section' : /did not draw/.test(el.innerHTML) ? 'did not draw' : !el.innerHTML.trim() ? 'empty' : '';
};
module.exports = { app, tick, undrawn, ROOT };
