# 510 — Spotify, each person's own account

The owner: "can you make it so students can sync to their own Spotify account? if so add that as a tool widget."

Yes, within Spotify's limits. A Tools widget (`js/spotify.js`, `WIDGETS` entry `spotify` in map.js) runs the
Authorization Code flow with PKCE in the browser: no client secret, no Apps Script, no token ever posted to us
(the flow journey asserts nothing sent to the backend carries one). The client id is public, from
`brand('spotify_client_id','')`; empty → "Not switched on yet", and an admin sees the key and the redirect URI.

Decisions:
- **Redirect URI** is the page plus `?spotify=cb` (`https://atfamily.co.uk/?spotify=cb`). The callback is read
  as spotify.js loads, the address cleaned with `replaceState` at once, and the code swapped in the background;
  boot never waits. The PKCE verifier, state and client id are held in sessionStorage across the round trip, so
  the swap does not need the payload.
- **Stays signed in**: the refresh token is kept per device in localStorage (wrapped in try/catch); the access
  token in sessionStorage. A phone app that forgot Spotify every tab would be a nuisance; Disconnect forgets both.
- **Premium**: a 403 with reason `PREMIUM_REQUIRED` is remembered and said once under the controls.
- **Limit**: Development mode allows 25 named users (User Management); more needs extended quota, unlikely for a
  small site. Written plainly in docs/spotify.md.
