# components

| id | name | column | row | visible | writable | status | kind | src | fields | sort | where | limit | tap | empty | mock | spec | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| camera | Camera | 1 | c1 | signed-in | signed-in | partial | form | posts | image,caption,poll |  |  |  | post-send |  |  |  | exists in old repo: newPostCard, post-pick, post-send. approval flow exists too. |
| post | Post | 2 | c1..c3 | all | admin | live | item | posts | author,image,caption,location,creation_date | pinned desc, creation_date desc | active=TRUE | all | open | Nothing posted yet. |  |  | author blank on all 10 live rows |
| booking | Booking | 3 | c1 | signed-in | signed-in | live | form | jobs | how,joining,n,loc,hosting,slots,client,kids,subjects,tutor,interval |  |  |  | book-send |  |  | booking-rules | 46 rules in their own tab — the only component that needs one |
| cart | Cart | 3 | c2 | signed-in | owner | none | list | ? | ? |  | ? | all | open | ? |  |  | does not exist in the old app. buying a thing goes straight to a receipt. |
| reel | Reel | 4 | c1..c3 | all | admin | none | item | ? | ? | random |  | all | none | ? |  |  | 58 facts exist in the old repo as code, not data |
| dm | DM | 5 | c1..c3 | owner, admin | owner | none | list | messages | fromId,body,sentAt | sentAt desc | ? | all | open | No messages. |  |  | tab exists and is empty. no send, no read state. |
| search | Search | 6 | c1 | all | none | live | list | questions | name,company,key_stage,band_value | paper asc, question asc | active=TRUE | all | open | Nothing matches. |  | facets | 21 facets, currently declared in find.js not a tab |
| item | Result | 6 | c2..c4 | all | none | live | item | questions | name,company,count |  |  |  | open |  |  |  | worksheets collapse to one card; past-paper questions do not |
| profile | Profile | 7 | c1 | owner | owner | live | item | user | name,role,credits,xp |  | personId=me | 1 | none | Sign in |  |  |  |
| settings | Account settings | 7 | c2 | owner | owner | partial | form | user | ? |  | personId=me | 1 | save |  |  | terms | old app had profile fields, claims, terms, install prompt |
| calculator | Calculator | 8 | c1 | all | none | live | tool | code |  |  |  |  | open |  |  |  | WIDGETS in map.js |
| flappy | Flappy Pird | 9 | c1 | all | none | live | tool | code |  |  |  |  | open |  |  |  | WIDGETS in map.js |
