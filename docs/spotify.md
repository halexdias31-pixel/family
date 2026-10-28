# Spotify — each person's own account, in their own browser

The Tools column has a **Spotify** widget (`js/spotify.js`). Each student, parent or tutor connects **their own**
Spotify account. Nothing goes through our backend: the browser talks to Spotify directly using the
Authorization Code flow with PKCE, which needs no client secret. The access token lives in the tab
(sessionStorage); the refresh token is kept on that device (localStorage) so a phone stays connected until
**Disconnect**, which forgets both.

What it does: now playing (cover, title, artist); Previous / Play-Pause / Next (**Spotify Premium only** —
a free account is told so); the person's playlists, one line each with *Open in Spotify*; a search pill for a
song or playlist that opens in Spotify; a starred **Study focus** list (on that device). No audio is played by
the site — only Spotify's own open links.

## Owner: one-time setup

1. Go to **developer.spotify.com → Dashboard → Create app**.
2. Name and description: anything (e.g. "@family. Tools").
3. **Redirect URI**, exactly: `https://atfamily.co.uk/?spotify=cb`
   (the site origin from `CNAME`, path `/`, query `?spotify=cb`; Spotify compares it character for character).
4. Under "Which API/SDKs are you planning to use?" tick **Web API**. Save.
5. Open the app's **Settings**, copy the **Client ID** (not the secret — the secret is never needed and must
   never be put anywhere).
6. In the spreadsheet's **brand** tab add key `spotify_client_id` with the Client ID as its value.
   Until then the widget says "Not switched on yet"; an admin sees what to fill in.

## The limit — say it plainly

A new Spotify app is in **Development mode**. In Development mode **only up to 25 named Spotify users can
connect**, and each must be added by hand under the app's **User Management** (their name and the email of
their Spotify account). Anybody else who tries gets an error from Spotify, not from us.

Going past 25 needs Spotify's **extended quota** approval. Spotify currently grants that mainly to established
businesses with a large active user base and a reviewed app; for a small tutoring site it is **unlikely to be
approved**. Plan on this being a feature for up to 25 people you add yourself.

## A person's steps

1. Ask the owner to add your Spotify account's email under User Management (the 25-user list).
2. Tools → Spotify → **Connect**. Spotify asks you to agree; you come back to the site connected.
3. Have Spotify open on some device to use Play / Pause / Next (Premium only). Star playlists for Study focus.
4. **Disconnect** forgets the connection on this device. To cut it off everywhere, remove the app at
   spotify.com → Account → Apps.

## Scopes asked

`user-read-currently-playing user-read-playback-state user-modify-playback-state playlist-read-private` — nothing else.
The journey `Spotify (510)` in `js/check-flow.js` checks the address, the code swap and Disconnect.
