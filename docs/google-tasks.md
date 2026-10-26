# Google Tasks sync

A signed-in person can copy their own upcoming sessions and exam dates into **their own Google Tasks**, in a
task list called `@family.`. It runs entirely in their browser (`js/gtasks.js`): Google's token client asks
them to allow the `https://www.googleapis.com/auth/tasks` scope, and the page calls the Tasks API with that
token. The token lives only for that browser tab (memory / sessionStorage) and is never sent to our backend.

An API key alone cannot do this: Google Tasks is private data, so each person must consent with their own
Google account. The site has **one** OAuth Client ID, which is public (not a secret).

## What syncs, and which way

- **Sessions:** every session of yours in the next four weeks (the same list as Booking, `myJobs_`), one task
  each: title "Subject · Level · time", due that day, notes "With <tutor>" and a link back to Booking.
- **Exam dates:** your small/big exam dates (About you) and the next big exam, if ahead.
- **One way, site → Google.** Each task carries a hidden marker `[family:<id>]` in its notes, so Sync now
  updates the same task instead of making another. A task you tick off in Google stays ticked (the sync never
  resets it) and the card counts it ("1 ticked off in Google"), but nothing on the site changes, because the
  site has no "done" for a session. Tasks for sessions that are later cancelled are not deleted.

## Owner: one-time setup

1. Go to https://console.cloud.google.com/ and choose the project that already holds the Google sign-in
   client, or create one.
2. **APIs & Services → Library** → search **Google Tasks API** → **Enable**.
3. **APIs & Services → OAuth consent screen** (Google Auth Platform → Branding / Audience / Data access):
   user type **External**; app name, support email, home page `https://atfamily.co.uk`; under **Data access /
   Scopes** add `https://www.googleapis.com/auth/tasks`. Then either **Publish app** (In production), or
   leave it in Testing and add each person's Gmail address under **Test users**.
4. **APIs & Services → Credentials → Create credentials → OAuth client ID**, type **Web application**.
   Authorized JavaScript origins: `https://atfamily.co.uk` and, for testing, `http://localhost` (and
   `http://localhost:8080` or whatever port you use). No redirect URI is needed.
   If you already made a Web client for Google sign-in, just add the origins to that one.
5. Copy the **Client ID** (`…apps.googleusercontent.com`) into the sheet: the **brand** tab, key
   `google_client_id` (the config tab's `google_client_id`, used by Google sign-in, works too and wins).
   It takes effect on the next load.

Plainly:

- Until Google verifies the app, people see **"Google hasn't verified this app"**. They press **Advanced →
  Go to atfamily.co.uk (unsafe)** to continue. The tasks scope is a sensitive scope, so verification asks for
  a privacy policy and a short review.
- While unverified, at most **100 people** can ever grant it (in Testing, only the listed test users can, and
  their grants expire after 7 days).

## A person: how to use it

1. Sign in, open **Student settings** (the Account column) → **Google Tasks**.
2. Tap **Connect** → choose your Google account → **Allow** (past the unverified warning, if shown).
3. It syncs straight away; tap **Sync now** whenever your sessions change. The line under the title says
   when it last synced and how many tasks.
4. Open Google Tasks (in Gmail, Calendar or the Tasks app) and pick the **@family.** list.
5. **Disconnect** revokes the permission and forgets the token on this device. Reloading the tab also forgets
   it; tap Connect again (Google remembers your Allow, so it is one tap).

If no Client ID is set, the card says the admin hasn't switched it on yet; an admin sees which key to fill.
