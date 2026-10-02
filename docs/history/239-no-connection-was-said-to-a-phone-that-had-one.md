## "No connection" was said to a phone that had one

**Reported with a screenshot of the Photos page** after pressing Save. It said *"No connection — the
server could not be reached at all"*. The thumbnails beside it had just loaded from Google, so the
phone was online.

**`fetch` gives the same bare TypeError for two different failures.** It is "Load failed" on an
iPhone, both when the phone is offline and when the server answers with something the browser will
not pass on. The second case covers Apps Script's own error page (the script cannot run, a quota is
used up) and a request it gave up on. `doPost` catches its own exceptions and returns JSON, so the
second case means Apps Script itself failed rather than a handler. `why_` now asks
`navigator.onLine`. False is reliable and says the phone is offline. True gets *"The server did not
answer, so nothing was saved. Try again in a minute."*

**The cause on the server could not be checked from here**, because every Google host is blocked.
If it happens again, opening the `/exec` address with `?health=1` in Safari shows whether the script
runs at all.
