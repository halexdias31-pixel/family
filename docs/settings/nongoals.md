# nongoals

| id | area | kind | rule | because | source | active |
|---|---|---|---|---|---|---|
| NG-01 | Feed | nongoal | No follow graph. Everyone sees the same posts. | Instagram needs follows because it has millions of publishers. There is one here. Follows bring fan-out, privacy, blocking and mutuals with them. | decided | TRUE |
| NG-02 | Finder | nongoal | The funnel's question order is not computed from how much each narrows the set. | Built and measured. It picked Question (50 answers) before Subject, three times under three different constraints. Information gain always prefers many small piles. | measured, reverted | TRUE |
| NG-03 | Shop | nongoal | No cart. Buying a thing makes a receipt. | One thing at a time is how it has always worked. A cart is holding items before paying, which is a real feature and not a small one. | decided | TRUE |
| NG-04 | Learning | nongoal | Answers are not stored. The answer column is 2% filled on purpose. | Extraction was for questions. An answer nobody checked is worse than none. | questions.answer | TRUE |
| NG-05 | Learning | nongoal | Topics are tagged and no facet reads them. | On worksheets a topic tag mostly repeats the sheet's own name — 55% of rows. On past papers it would be transformative, and that is when to add it. | FN-110 | TRUE |
| NG-06 | App | nongoal | No tab bar. The grid is the navigation. | Four buttons naming four screens, eating 3.6rem of a phone, duplicating what the grid already shows. | shell.js | TRUE |
| NG-07 | App | nongoal | No offline mode and no service worker. | One fetch, then nothing. A cache that can be wrong is worse than a load that is slow. | shell.js | TRUE |
| NG-08 | App | nongoal | Files are never cached. Every visit downloads the app. | The cost used to fall on whoever was publishing, never sure whether the screen showed what they had just pushed. A stale file and a broken feature look identical. | index.html | TRUE |
| NG-09 | App | nongoal | No pop-ups, no new tabs, no browser dialogs. | See the `surfaces` tab for the whole rule and what replaces each one. | decided | TRUE |
