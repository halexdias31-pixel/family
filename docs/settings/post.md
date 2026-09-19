# post

*One post in the feed.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| PT-01 | Source |  |  | rule | Read from the posts tab. Pinned first, then newest. | A noticeboard has one thing that must stay at the top and everything else in the order it happened. | posts.js feedPosts | TRUE |
| PT-02 | Source |  |  | rule | active FALSE hides a post. Nothing is deleted. | Undoing a mistake is changing a cell back, not restoring a row. | posts.js | TRUE |
| PT-03 | Source |  |  | rule | No follow graph. Everyone sees the same posts. | Instagram needs follows because it has millions of publishers. There is one here. Follows are where the scope explodes. | decided | TRUE |
| PT-04 | Picture |  |  | rule | A Drive share link is a page, not a picture. The file id is rebuilt as a thumbnail address. | Pasting a share link into an img gives a broken image. Most common mistake with a sheet of Drive links. | posts.js pic | TRUE |
| PT-05 | Picture |  |  | display | Never cropped to a square. | Cropping a phone photograph takes the top and bottom, which is where the child is. | style.css .post-pic | TRUE |
| PT-06 | Picture |  |  | display | Reaches both edges. Everything else has a margin. | The photograph is the post. The caption and the name are annotation, and annotation is what margins are for. | style.css | TRUE |
| PT-07 | Approval |  |  | rule | A post can be waiting or refused. An admin decides on the post itself, not on a separate list. | You are already looking at the thing you are judging. | posts.js post-approve | TRUE |
| PT-08 | Reactions |  |  | rule | One row per person per post, not a count on the post. | A count cannot say who, and cannot be undone by the person who did it. | post_reactions tab | TRUE |
