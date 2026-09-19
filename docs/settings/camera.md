# camera

*Making a post.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| CM-01 | Access |  |  | rule | Signed in only. | A post has an author. Anonymous posting on a noticeboard for a tutoring business is not a feature. | posts.js | TRUE |
| CM-02 | Flow |  |  | rule | Pick a picture from Drive, write a caption, optionally add a poll, send. |  | posts.js new-post, post-pick, post-send | TRUE |
| CM-03 | Flow |  |  | rule | A preview is shown before sending. | The picture comes from Drive by id and the only way to know it is the right one is to see it. | posts.js showPostPreview | TRUE |
| CM-04 | Flow |  |  | rule | A client's post arrives waiting. An admin's does not. |  | posts.js | TRUE |
| CM-05 | Screen |  |  | rule | The composer is the only thing on this screen. | It is the one column reachable by accident, so what it shows when you land on it wrongly has to be harmless and obvious. An empty box is both. | decided | TRUE |
