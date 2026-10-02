## Business records are admin pages of the Settings column, not a Tools widget

**Asked for as "the business stuff should not be on tools it should be on the account settings
column. only admin sees. also it should be like everything else, like e.g. public liability
insurance:________".** The `records` widget is gone from `WIDGETS`. `bizPages_` in js/records.js
appends one card per category (Insurance, Tax, Legal, Safeguarding…) to `settingsPages_`, for an
admin only, each item a caption with its boxes and a date, and one Save per page through `send_`.
`listRecords` is asked once when the column is first reached (`bizStart_` from `startScreen_`), and
Save refuses until it has answered. The backend's `saveRecord`/`dropRecord` became one
`saveRecordsPage`, `admin` in `ACTION_ACCESS`. `check-profile.js` saves and reads a page back;
`check/states.js` has `the business records (insurance)`. Stamps are `2026-09-30-d-bizpages`.
