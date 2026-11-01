# 547 — The owner's notes of 30 Oct (sweep C): the email as is, a static inbox, Daive as a guide, two bare-bones tools, any file, the profile picture is the card

**Reported** through Suggest a change, 30 Oct; handled 1 Nov.

1. **The weekly email, as is** (N-1793375745107-51992) — *"show how the emails will look AS IS. PERFECTLY SYNCED. and
   i want the emails THEMSELVES to be perfectly synced to questions the children did AS IS"*. One renderer: the Site
   card's Weekly email no longer draws a look-alike on the phone (`digestPreviewHtml_` and its `.dp-*` styles are
   gone). `digestPreview` (dopost.gs) answers `shown` — this week's first email byte for byte from `digestPlanNow_`,
   or, with no family this week, a made-up child (`DIGEST_SAMPLE_CHILD`) through the same `digestRender_` — and the
   card puts that HTML in a fully sandboxed `<iframe srcdoc>` (`digestShownHtml_`, records.js). Typing in the words card
   asks again after a pause with the unsaved words (`body.words`, held to `digestWordsSave`'s rules by
   `digestWordsOver_`; nothing is written). Each question block in the email now follows the site card's order:
   tags, words, THEIR ANSWER in the answer box, the verdict under it as Check says it, then ANSWER.
   Checks: check-digest (the shown email is the one `run` sends, byte for byte; typed words render and are not
   written; the sample is `digestRender_`'s own) and check-flow "the Weekly email card (547)…" (the frame holds the
   backend's HTML, sandboxed, no imitation; a typed subject is asked of the backend).
2. **The Email widget is a static overview** (N-1793375444988-96261, N-1793375430792-28133) — *"shouldnt be able to open
   each email just static overview"*. The last four as rows (sender, subject, time, snippet), plain `div`s with no
   control; `inbox-open`/`-back`/`-images` and the phone's sanitiser are gone, and so is the backend's `inboxRead` (no
   action hands a message body to anybody). check-inbox: no control in the widget, no `inbox-*` action registered, no
   body served, `backend/inbox.gs` never asks for `format=full`.
3. **Daive is a guide to the site** (N-1793377312882-20703) — *"dont give much info on business yet. just leave this
   here as a helper to navigate this site"*. Its facts are a map (each column this viewer has, `ASST_NAV`, and the
   Tools widgets' names) with nothing from the brand tab or config; its rules say it only helps find things in the
   app and points elsewhere for the business or homework. check-assistant reads the rules sent to Gemini; check-flow's
   Daive journey fails if any brand value or business number reaches the facts.
4. **A bare-bones Poster planner and Pixel editor in Tools** (N-1793383398101-67134, N-1793383423723-63818) — *"a bare
   bones poster planner so that i can plan my poster for uni… just make the layout, then give to claude"* and *"when i
   asked for you to make a pixel editer i meant i also wanted it bare bones"*. `poster.js`: page A0–A3, portrait or
   landscape, drag out a box of a kind (Title, Text, Image, Chart), drag to move, its corner to resize, a label row;
   Export JSON (millimetres and fractions, a note for Claude) and Export PNG. `pixel.js`: 8/16/32 grid, a colour row,
   Pen and Eraser, Clear, Export PNG. Both are tiles and one-line rows, kept only in this device's `localStorage`
   (`posterPlan`, `pixelArt`), never sent; `saveBlob_` is their one way to hand a file over. check-flow "the poster
   planner and the pixel editor (547)…"; check-drafts lists their two kept boxes.
5. **Any kind of file** (same note) — *"also allow me to add other file types like python"*. Suggest a change's Add
   files has no `accept` list (`REP_FILE_ACCEPT` gone); only the size limit stays. check-flow's upload journey sends a
   `.py` with its own type and fails on any `accept`.
6. **A shared profile is the card itself** (N-1793311389215-83215, second half) — *"make sure that when i share a staff
   profile it shares exactly as is. so the share is synced to profile look on site"*. This reverses 412's choice of a
   separately drawn canvas: `tutorPng_` now draws the card with `findCard` (the renderer the Tutors column uses) off the
   screen and photographs it with the receipt's `rcPng_`; photos go in as data (`tpngInline_`), one that will not come
   is left out. `tpngDraw_`, its helpers and the QR encoder (used by nothing else) are gone; the link still goes with
   the picture. check-flow's 412 journey compares the picture's words with the card on the site, word for word.

## Asked, not done

- **The tutor's displayed price** (N-1793311389215-83215 first half, N-1793312162669-96959): a range from one seat to
  the most seats they take (e.g. £12–24/h), or a predicted rate? It is money shown to clients, so it waits for the
  owner's choice of formula.
- **A car parts database** (N-1793377470898-24451) and **an elements and substances database** for a future lab
  simulator (N-1793377528740-58210): new content areas; which sources, and where in Find?
