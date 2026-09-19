# roles

| id | area | kind | rule | because | source | active |
|---|---|---|---|---|---|---|
| RO-01 | Roles | rule | Four: admin, tutor, client, student. Signed out is a fifth state, not a role. |  | people tab | TRUE |
| RO-02 | Roles | rule | ADMIN sees everything and can write everything. isAdmin() is the gate, used 18 times. | One person runs the business. There is no partial admin. | find.js isAdmin | TRUE |
| RO-03 | Roles | rule | TUTOR sees their own sessions and the resources. Not other tutors' money. |  | book.js | TRUE |
| RO-04 | Roles | rule | CLIENT sees their own bookings, their children and their receipts. |  | book.js | TRUE |
| RO-05 | Roles | rule | STUDENT is a person a session is for. They have no PIN and do not sign in. | Children do not need accounts to be tutored, and an account for a child is a safeguarding surface with no purpose. | people tab | TRUE |
| RO-06 | Ownership | rule | OWNER means this row is about you — matched on personId. | Eighteen raw personId comparisons scattered about. It should be one function the way isAdmin() is; it is not, and that is the weakest gate in the app. | observed | TRUE |
| RO-07 | Visibility | rule | Every component declares visible and writable separately. | Posts are visible to all and writable by admin. DMs are visible to owner and admin, writable by owner. One field could not carry that. | components tab | TRUE |
| RO-08 | Safeguarding | rule | An admin can read anything between a tutor and a family. | It is a business with children in it. Not being able to see what is said is not an option. | decided | TRUE |
