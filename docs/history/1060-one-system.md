# 1060 — one system: philosophy, one checker, one place

Owner (6 Nov): "it gets rid of arbitrariness" — one system in three parts.

- **Philosophy** — `docs/philosophy.md`: thirteen numbered principles, each with a why and the check ids that enforce it.
  Principle 1 (owner): the site IS the business — everything runs from here, in one place. A "How the loop works"
  section says what each sweep does with it.
- **One checker** — `tools/health.js` now blends five parts: code 28, Find logic 25, UI 18, AI cost 17, **business 12**.
  Areas shown on their own: code, logic, ui, friction (inside UI), cost, speed (inside code), business.
  Business = how much of the business the site runs (`data/settings/one-place.json`: yes 1, partly ½) less 5 per
  `js/check-biz.js` finding; the Checks card swaps in the live share of checklist items sorted.
  `tools/philosophy.js`: coverage (every principle names ≥1 existing check, else a `philosophy` finding; checks tied
  to no principle are listed, report-only), the inbox file's shape (`owner-questions`), and the one-place report.
  Budgets and the `--changed` ratchet are unchanged. The file total rose from 36.8 to 42.1 by the new weighted part alone; live, with no ticks, the card shows less.
- **One place + inbox** — Find › Settings › Business › **Checks** (`js/one-place.js`, item `health:checks`) replaces the
  Site health and Business checker items: total, each area's score and next three, then Owner questions. The
  detail cards (Site health with What's missing, the business checker's ticks) follow it, nothing lost.
  Open questions moved from `docs/owner-questions.md` to `data/settings/owner-questions.json` (33, five of them
  philosophy questions). Answers are form buttons a/b/c plus a "Something else" note; they save with
  `saveOwnerAnswer` to the `owner_answers` tab (`backend/owneranswers.gs`, admin only); no tab → the questions
  show unanswered with the error in the line.
- First one-place report: homework no; tax figures and accounts (expenses) partly; the rest yes.
- Owner: Apps Script sync, Deploy → New version, open the site once as admin (adds the `owner_answers` tab).
- Budget raised by hand for the new card and checker alone: `searchBytes` 5,270,149 → 5,278,152 (js/one-place.js, tools/philosophy.js). Left for the sweep (on the branch before this change): shell-boot coupling 136/135, Find menu-rule and tag-asked "What for".
