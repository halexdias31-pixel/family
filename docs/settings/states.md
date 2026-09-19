# states

| id | area | kind | rule | because | source | active |
|---|---|---|---|---|---|---|
| ST-01 | Loading | rule | LOADED is the difference between 'nothing yet' and 'nothing at all'. | Telling somebody there are no posts while the request is in flight is a lie the app corrects a second later. | shell.js | TRUE |
| ST-02 | Loading | display | A skeleton shows the SHAPE of what is coming, not a spinner. | A spinner says wait. A shape says this is what is coming, and nothing jumps when it arrives. | posts.js skeleton | TRUE |
| ST-03 | Empty | rule | An empty list says what would fill it, in words. | 'Nothing posted yet' is a state. A blank screen is indistinguishable from a broken one. | posts.js nothingHere | TRUE |
| ST-04 | Empty | rule | An empty state names the tab to add a row to, when the reader could act on it. | Most empties in this app are a sheet nobody has filled in yet. | posts.js | TRUE |
| ST-05 | Error | rule | A failed load says so and offers a retry. It never shows an empty app. | An empty app and a broken app look identical, and only one of them is worth waiting for. | shell.js banner, retry | TRUE |
| ST-06 | Error | rule | A server error is surfaced in the server's own words where it has any. | Apps Script answers an exception with an HTML page saying exactly what went wrong. Calling .json() on it throws 'Unexpected token <' and bins that page unread. | shell.js | TRUE |
| ST-07 | Error | rule | A reply carrying an error field is a failure even though the request succeeded. | Anything that only checks whether the request went through treats a refused sign-in as a signed-in state. | shell.js | TRUE |
| ST-08 | Busy | rule | A control that starts a write is disabled and relabelled until it finishes, and restored either way. | Several seconds against Apps Script. A button that still reads Sign in and can still be pressed reads as frozen, and a second press is a second write. | shell.js send_ | TRUE |
| ST-09 | Busy | rule | After a write that changes the screen, redraw immediately and refresh the payload behind it. | Waiting for the refetch means it worked, the toast said so, and the form in front of you still asks the same question until something else repaints. | me.js | TRUE |
| ST-10 | Signed out | rule | A control that needs an account is not shown, rather than shown and refused. | A button that refuses is worse than one that was never offered. | posts.js | TRUE |
| ST-11 | Signed out | rule | Everything that can be read without an account, is. | A parent deciding whether to get in touch should not have to sign up first. | find.js | TRUE |
