# shop

*Things bought with credits.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| SP-01 | Source |  |  | rule | From the items&shop tab. |  | find.js | TRUE |
| SP-02 | Price |  |  | rule | Signed out shows the list price. Your own price appears once you sign in. | A price that changes after signing in reads as a trick unless the first one was clearly generic. | find.js | TRUE |
| SP-03 | Buying |  |  | rule | Buying makes a receipt. There is no cart. | One thing at a time is how it has always worked. A cart is holding items before paying, which is a real feature and not a small one. | decided | TRUE |
