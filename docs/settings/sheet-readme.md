# README

| Settings |   |   |
|---|---|---|
| Everything you type that the app then reads. No code change to edit any of it. |  |  |
| Tab colour | What it means | What you should do |
| Green | The app WRITES these rows itself (doPost). | Read them. Do not hand-edit: the app may overwrite you. |
| Gold | The app READS this. You write it. | Edit freely. Keep the header row exactly as it is. |
| Grey | Nothing in the app reads this tab. | Notes, specs and databases kept for reference. Safe to edit. |
| Rule |  | Why |
| Never rename a tab or a header cell. |  | backend/constants.gs looks them up by exact name. A rename returns an empty list, which looks exactly like an empty database. |
| An empty tab is fine. |  | Every read has a fallback. A MISSING tab is what fails silently. |
