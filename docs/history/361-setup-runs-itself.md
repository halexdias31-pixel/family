# 361 — Setup runs itself: pull, New version, open the site (19 Oct 2026)

## What the owner said (18 Oct, paraphrased)

Apps Script confuses them: they forget which functions they have run, may run things twice or not at
all, and old commands linger in the function list. They want a layman's flow — pull (GitHub Assistant
↓), Deploy → New version, open the site once — and everything else happening by itself.

## What was wrong

- `autoMigrate` (schema + `MIGRATIONS`) only ran on `?setup=1` or `?run=` — URLs the owner had to know.
- The Sunday email's trigger (`installWeeklyDigest`) was deliberately by hand only, and
  `check-digest` enforced "nothing may book it but the owner". Changing `weekly_digest_hour` needed
  another hand run; `checkSundayEmail` could only warn.
- The Run menu held installers and one-off jobs (`installWarmTrigger`, `installTriggers`,
  `renameHandles`, `migrateLikes`, `renameValue`, …) — some harmful when run by mistake.

## What changed

- **An admin's page load runs setup** (`setupOnAdminLoad_`, setup.gs, called from `doGet` when the
  token is an admin's). It calls `autoMigrate_` (cheap when nothing is pending) and, at most every ten
  minutes, `digestKeepBooked_` — which re-books the Sunday email only when there is not exactly one
  trigger, an old one lingers, or the booked hour differs from the config tab's. A visitor never waits.
- **`sunday-email`** is a run-once job in `MIGRATIONS` (retry: true), so the first admin page load after
  this deploy books it.
- **Failures keep their words**: `FAILED_<id>` and `SCHEMA_FAILED` in Script Properties, cleared on
  success; the job still retries after two minutes, as before.
- **The Setup card** on You (`setupCard_`, me.js), second after your own card, admin only:
  backend version and whether all four files agree, the site's load stamp, every job with ✓ and its
  date / ✗ failed / waiting, each trigger with when it runs, the Sunday email's mode and next send.
  No buttons — nothing to press twice. `payload.setup` (`setupStatus_`) is sent only to an admin's
  token, in the fresh half beside `filmsSync`, so a cached body never carries it.
- **Hidden from the Run menu** (trailing `_`): `installWeeklyDigest_`, `installTriggers_`,
  `installSheetWatch_`, `ensureSchema_`, `autoMigrate_`, `migrateLikes_`, `renameValue_`,
  `renameHandles_`, `seedConfig_`, `seedAvatarItems_`, `ensurePersonIds_`. `?run=<name>` keys are
  unchanged. `installWarmTrigger` is deleted (it ate the day's script time and nothing called it).
  Messages that said "Run ensureSchema()" now say "Open the site once as an admin".
- `check-digest`: the rule became "only `digestKeepBooked_` books the Sunday"; a new block proves
  running it twice leaves one trigger and a changed hour re-books. `check-flow` has a journey: the admin
  sees the Setup card with jobs, triggers and the Sunday line and nothing to press; a tutor sees no
  card and is sent no report.
- docs/deploying.md opens with the three steps.

Stamps: `2026-10-19-b-setup` (all four); css `2026-10-19-d-setup`.
