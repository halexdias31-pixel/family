# 493 — An Email widget (the owner's Gmail, read-only)

**Asked:** the owner: **"can you just have a widget which syncs to my gmail emails so I can see them?"**

**Built:**
- A Tools widget **Email** (`inbox` in `WIDGETS`, `admin: true`), drawn by `js/inbox.js`: a search pill
  (`searchPill_`, 487) whose words are a Gmail search, chips Inbox / Unread / each user label, then one line
  per conversation (sender, subject, snippet, date, an accent dot when unread), newest first, 20 a page with
  **More**. A tap reads the message in place with tiles Back, **Open in Gmail** and, when it has remote
  images, **Show images**.
- The message's HTML is parsed (`DOMParser`) and cleaned on the phone (`inboxClean_`): scripts, styles,
  frames, forms and media go; every `on*`, `style`, `class`, `id` attribute goes; `javascript:` links go;
  links open in a new tab with `rel="noopener noreferrer"`; remote images are held back until Show images,
  because an image fetch tells the sender the mail was opened. The server strips the obvious first (`inboxStrip_`).
- `backend/inbox.gs`: `inboxList {q, page}` (`page` is Gmail's page token) and `inboxRead {id}`, both
  `admin` in `ACTION_ACCESS` and asked `rankAtLeast_(me, 'admin')` again in the handler. Nothing is put in
  `doGet`, the stored payload, any sheet or the log.
- **Read-only by construction.** `GmailApp` needs the full `https://mail.google.com/` scope (it can send and
  delete), so the backend calls the Gmail REST API with the script's own token (`ScriptApp.getOAuthToken`,
  `UrlFetchApp.fetchAll`) on **`gmail.readonly`** alone. `format=full` does not mark a message read.
- `authoriseGmail()` (inbox.gs), run once from the editor, asks Gmail for the profile and logs READY.

**Switching it on — the order matters.** A new version whose manifest has a scope the owner has not allowed
answers every visitor "Authorization is required": the whole site breaks, not just Email.
1. Merge to `main`; in Apps Script press ↓ (GitHub Assistant) to sync.
2. In the editor pick `authoriseGmail`, press Run, and Allow — "Advanced → Go to …" if Google warns, and
   **tick every box** (Select all). The log must say `READY`.
3. Only then Deploy → Manage deployments → edit → **New version** → Deploy. Open the site as an admin.

**Checks:** `js/check-inbox.js` (in `check-all`): a mock Gmail with made-up example.org mail; the admin lists,
pages, searches and reads a sanitised message; a client and a tutor are refused before Gmail is asked;
nothing reaches doGet or a sheet; the manifest lists `gmail.readonly` and nothing wider. On the screen the
admin's widget draws, blocks images, offers Show images and Open in Gmail, and search and chips reach `q`;
a client has no widget and sends nothing. Backend 2026-10-27-zf-inbox, css 2026-10-27-zf-inbox.

**Moved (500):** the owner, on the Site column: "I would actually like to add the gmail widget to this". It was reverted
with b56391c and came back as a card on Site (`inboxCard_`, `site:inbox` in layout.js), admin only, no longer a Tools widget.
