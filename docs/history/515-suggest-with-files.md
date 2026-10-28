# 515 — Suggest a change takes files and folders

Owner: "allow me to add folders and PDFs to Suggest a change so I can submit entire past paper collections to be
stored, and you can begin incorporating them when I ask you to."

## What was built

- The Suggest a change box (js/submit.js `reportBoxHtml_`) gains **Add files** (`input type=file multiple`, PDFs,
  pictures, docx, zip) and **Add a folder** (`webkitdirectory`) — for an **admin only**. A student keeps Add a picture.
- Where a folder cannot be chosen (iPhone and iPad Safari open the folder input as plain files; also jsdom) the folder
  tile is not drawn and the box says: "On iPhone, Safari cannot choose a folder: use Add files and pick several at once."
- Send first uploads every file in order (`repFilesSend_`), each in 8 MiB parts (about 11 MB of base64, well under
  Apps Script's ~50 MB request body), with a line per file (percent, sent, failed) and a total ("2 of 42 files sent ·
  31 MB of 180 MB"). A failed file is started again up to three times; if it still fails, Send again sends only the
  files not yet sent, into the same batch folder.
- Backend `suggestUpload` (admin, at the gate; `inboxPart_` in content.gs): part 0 opens a Drive **resumable upload**
  session (URL kept in the script cache six hours), each part is PUT with its `Content-Range`, the last part makes the
  file. No blob is ever whole in Apps Script and nothing goes in the sheet. Files are private — not shared by link.
- Folder: `family-library-imports/Claude inbox/<batch>/<subfolders>/file`. The batch is the chosen folder's name, or
  "Files YYYY-MM-DD HHMM" for loose files. `.`/`..` and odd characters are dropped from every step.
- Then the ordinary `suggest` carries `files: {batch, count, names}`; `inboxLine_` writes
  `Files: Claude inbox/Edexcel 2023 (42 PDFs) — <folder link>` and the first 20 names onto the claude_notes row,
  so it reaches the Notes for Claude file too. An admin may send files with no words.

## Limits

- 500 MB a file (`INBOX_FILE_MAX`/`REP_FILE_MAX`); bigger ones are left out and named.
- Each part is one request of a few seconds; a 42-paper folder is about 42–60 requests.
- iPhone: no folder picking; several files at once works.

## Checks

check-flow: "Suggest a change takes files and a folder from an admin and not a student…" — the student sees no file
tiles; without `webkitdirectory` the box says so; a three-file folder goes a.pdf, b.pdf (failed once, retried),
big.pdf in two parts; paths keep `June/`, `Nov/`; the note names all three. Stamps 2026-10-28-zu-sugg-files.
