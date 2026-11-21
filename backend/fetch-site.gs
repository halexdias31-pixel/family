/* @family. — fetch-site.gs THE SITE'S COPY FIRST, THEN RAW GITHUB: one fetch loop for a repository file (unify batch 7). */

/* FETCH A REPOSITORY FILE: the site's copy (the one the phones read) first, then raw.githubusercontent.com. `take(text, url)`
   returns the value, or null/undefined to try the next url (a throw does the same). Returns { got, url, said }: `got` is null
   when neither answered; `said` has one line per url that failed. */
function fetchSiteThenRaw_(path, take, site) {
  const urls = [S(site || SITE_URL).replace(/\/*$/, '/') + path];
  try { urls.push(RAW + path); } catch (err) { /* sync.gs is not in this scope */ }
  const said = [];
  for (let i = 0; i < urls.length; i++) {
    try {
      const res = UrlFetchApp.fetch(urls[i] + '?v=' + Date.now(), { muteHttpExceptions: true, followRedirects: true });
      const code = res.getResponseCode();
      if (code !== 200) { said.push(urls[i] + ' answered ' + code); continue; }
      const got = take(String(res.getContentText('UTF-8')), urls[i]);
      if (got !== null && got !== undefined) return { got: got, url: urls[i], said: said };
      said.push(urls[i] + ' answered 200 with something that is not ' + path);
    } catch (err) {
      said.push(urls[i] + ' could not be reached (' + S(err && err.message || err).slice(0, 120) + ')');
    }
  }
  return { got: null, url: '', said: said };
}
