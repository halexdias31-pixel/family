# 1050 — The business checker

The owner (6 Nov): "a fully autonomous business with easy fluid workflow for all people while having all
t's crossed and i's dotted. Should tell me what I need to get sorted out ... tell me what I need in order
and once it senses I have it, tick the box. Help me eventually earn £100k a year."

Facts confirmed: UK (London) sole trader; tutors self-employed; learners under-18s, under-8s and adults;
online plus home visits; no venue yet.

## What was built

- **The list is data**: `data/settings/biz-checklist.json` — 45 items in eleven groups, most urgent first
  (start legally, money and tax, insurance, data, safeguarding, tutors, families, then the "later" groups:
  venue, employing, becoming a company). Each item: why, how, an official link (gov.uk incl. hse.gov.uk and
  thepensionsregulator.gov.uk, ico.org.uk, nspcc.org.uk only), `sense`, `renew` months, `when` facts.
  `facts` holds the defaults; config `biz_venue`, `biz_employees`, `biz_under8` … override them, so the
  venue and employer items appear when config says so, without a deploy.
- **The card**: `js/biz-check.js`, first card of the Business settings column after Profit (`bizPages_`),
  and a Settings card in Find for an admin (`bizcheck`, beside Site health; `healthCardOf_`). Top: "N of M
  sorted", the money line, then the next three; each item one tile line; tapping opens why/how/link and a
  date + note form (Mark done / Untick).
- **Auto rules** (`BC_RULES`): `records:<id>` ticks from the Business records already filled in (and
  un-ticks when its date has passed); `tutor-terms` from the Staff list; `dbs-tutors` from each listed
  tutor's DBS tick (the payload has no DBS date — the rule says to add one); `income-goal` (bookings from
  6 April, price share per session date, vs config `income_goal`, fallback £100,000: so far, weekly needed,
  sessions/week at the average price); `vat-watch` (run-rate vs config `vat_threshold`, fallback £90,000
  with "check gov.uk"; warns at 80%); `staff-count` (listed tutors vs the sessions the goal needs at config
  `sessions_per_tutor`, fallback 15).
- **Ticks**: `biz_checks` tab (TAB, SCHEMA, WHERE; `backend/bizchecks.gs`; `listBizChecks`/`saveBizCheck`
  admin in ACTION_ACCESS). A tick with `renew` comes back as "renew now" when it lapses, and glows the
  Business dot (`bizNeed_('bizcheck')`) when due within 30 days.
- **Check**: `js/check-biz.js` (kind `biz-checker`, run by `tools/health.js` in the score and `--changed`).

Guidance, not legal or financial advice — said on the card.

Owner to do: push the backend (`bizchecks.gs` is new) and deploy a new Apps Script version; open the site
once as an admin so the `biz_checks` tab is made.
