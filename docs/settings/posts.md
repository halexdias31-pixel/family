# posts

| rule_id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| PO-001 | Feed | (global) |  | rule | Posts are read from the posts tab, pinned first, then newest. | A noticeboard has one thing that must stay at the top and everything else in the order it happened. | posts.js feedPosts | TRUE |
| PO-002 | Feed | (global) |  | rule | A post with active FALSE is hidden. Nothing is ever deleted. | Undoing a mistake is changing a cell back, not restoring a row. | posts.js | TRUE |
| PO-003 | Feed | (global) |  | rule | There is no follow graph. Everyone sees the same posts. | Instagram needs follows because it has millions of publishers. There is one here. Follows are where the scope explodes: fan-out, privacy, blocking, mutuals. | decided | TRUE |
| PO-004 | Feed | (global) |  | rule | A Drive share link is a page, not a picture. The file id is pulled out and rebuilt as a thumbnail address. | Pasting a share link into an img gives a broken image, and it is the most common thing to get wrong with a sheet full of Drive links. | posts.js pic | TRUE |
| PO-005 | Feed | (global) |  | display | A post photograph is never cropped to a square. | Cropping a phone photograph takes the top and bottom, which is where the child is. A gap under the picture is better than the work cut off. | style.css .post-pic | TRUE |
| PO-006 | Feed | (global) |  | display | The photograph reaches both edges. Everything else has a margin. | The photograph is the post; the caption and the name are annotation, and annotation is what margins are for. | style.css | TRUE |
| PO-010 | Posting | (global) |  | rule | A post can be waiting or refused, and an admin decides on the post itself rather than on a separate list. | You are already looking at the thing you are judging. | posts.js post-approve | TRUE |
| PO-011 | Posting | (global) |  | rule | Reactions are one row per person per post, not a count on the post. | A count cannot say who, and cannot be undone by the person who did it. | post_reactions tab | TRUE |
| PO-012 | Posting | (global) |  | rule | A poll lives on the post and its votes are their own rows. | Same reason as reactions. | posts.js poll, post_votes tab | TRUE |
