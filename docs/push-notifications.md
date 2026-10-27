# Phone notifications — the owner's one-time setup

Free lock-screen notifications, like texts: a new message, a booking request (to the tutor), a request
accepted or declined (to the family), and a reply to your post. Tapping one opens that thing on the
site. It uses Google's Firebase Cloud Messaging, which costs nothing. About ten minutes, once.

Until both halves below are filled in, nothing is sent and the Notifications card in Student settings
says "Not switched on yet" (an admin also sees which pieces are missing).

## Part 1 — Firebase (the website half, public)

1. Go to <https://console.firebase.google.com> and sign in with the business Google account.
2. **Add project**. If the Apps Script's Google Cloud project is offered in the list, pick it;
   otherwise type a name (e.g. `family-push`). Google Analytics: off is fine. **Create project**.
3. On the project's home page click the **Web** icon (`</>`) — "Add an app to get started".
   Nickname: `@family. site`. Leave "Firebase Hosting" unticked. **Register app**.
4. It shows a block of code with `const firebaseConfig = { apiKey: …, projectId: …, … }`.
   Copy the five values `apiKey`, `projectId`, `messagingSenderId`, `appId` (and keep the page open).
5. Left menu: ⚙ **Project settings** → **Cloud Messaging** tab → scroll to **Web configuration** →
   **Web Push certificates** → **Generate key pair**. Copy the long key it shows (starts with `B`).
6. On GitHub open `data/settings/brand.json`, find the row `"key": "fcm_web_config"` and put this,
   with your values, as its `value` — one line, the quotes inside written as `\"`:

   ```
   {"apiKey":"AIza…","projectId":"family-push","messagingSenderId":"1234…","appId":"1:1234…:web:…","vapidKey":"B…"}
   ```

   Commit. These values are meant to be public; they only let a browser ask to be notified.

## Part 2 — the service account (the sending half, secret)

7. Still in ⚙ **Project settings**, open the **Service accounts** tab → **Generate new private key**
   → **Generate key**. A `.json` file downloads. **Keep it private; never put it on GitHub.**
8. Open the file in a text editor. You need three values from it: `project_id`, `client_email`,
   `private_key` (the long one starting `-----BEGIN PRIVATE KEY-----`).
9. Open the Apps Script project → ⚙ **Project Settings** (left bar) → **Script Properties** →
   **Add script property**, three times:

   | Property | Value |
   |---|---|
   | `FCM_PROJECT_ID` | the `project_id` |
   | `FCM_CLIENT_EMAIL` | the `client_email` |
   | `FCM_PRIVATE_KEY` | the whole `private_key`, exactly as in the file, `\n`s and all |

   **Save script properties**.
10. **Deploy → New version** (as for any backend change), then open the site once as an admin so the
    `push_tokens` tab is made. Delete the downloaded `.json` file.

The card in Student settings now shows **Turn on**.

## What each person does (once per phone or computer)

**Android phone, or any computer (Chrome, Edge, Firefox, Safari on a Mac):**
open the site → **Student settings** → **Notifications** → **Turn on** → **Allow**.

**iPhone or iPad (iOS 16.4 or later):** Apple only lets a site send notifications once it is on the
home screen.
1. Open the site in **Safari** → tap **Share** (the square with an arrow) → **Add to Home Screen** → **Add**.
2. Open **@family.** from the new home-screen icon (not from Safari).
3. **Student settings** → **Notifications** → **Turn on** → **Allow**.

Each person can then untick what they don't want (Messages; Booking requests and answers; Replies to
your posts), and **Turn off** stops them on that device. A phone that is reset or has the app removed
is forgotten automatically the next time something is sent to it.

## For the code

`js/push.js` (the card, loading Firebase only when Turn on is tapped, the `?push=` landing),
`sw.js` (`push` and `notificationclick`), `manifest.webmanifest`, `backend/push.gs` (`pushTo_`, the
four `push*` actions, the OAuth token cached 50 minutes). Checks: `js/check-push.js`, and the
"phone notifications (492)" journey in `js/check-flow.js`. History: `docs/history/492-phone-notifications.md`.
