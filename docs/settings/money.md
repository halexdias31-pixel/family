# money

| rule_id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| MN-001 | Credits | (global) |  | rule | Credits are a balance on a person, spent on things and sessions. |  | me.js, shop | TRUE |
| MN-002 | Credits | (global) |  | rule | A price shown to somebody signed out is the list price. Their own price appears once they sign in. | A price that changes after signing in reads as a trick unless the first one was clearly generic. | find.js | TRUE |
| MN-010 | Receipt | (global) |  | rule | One spine, two documents: the same rows build the form and the receipt, in the same order. | Moving a question moves it on both, so the two cannot disagree about what was asked. | receipt.js, check-spine.js | TRUE |
| MN-011 | Receipt | (global) |  | rule | A row nothing fills prints a dash on both documents rather than being omitted. | An absent row and an empty row look the same on a receipt, and only one of them means the question was asked. | check-spine.js | TRUE |
| MN-012 | Receipt | (global) |  | rule | A receipt is generated from the job, never stored as text. | A stored receipt is a second copy of the truth, and it is the copy that goes stale. | receipt.js | TRUE |
| MN-020 | XP | (global) |  | rule | XP is earned and never spent. Credits are spent and never earned by playing. | Two currencies that do the same job is one currency with a confusing name. | me.js | TRUE |
