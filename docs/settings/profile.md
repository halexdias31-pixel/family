# profile

*Your account.*

| id | area | step | step_label | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| PR-01 | Access |  |  | rule | Visible to the owner only. Signed out, it shows the sign-in form instead. |  | me.js | TRUE |
| PR-02 | Sign in |  |  | rule | Name and PIN, checked by verifyLogin. |  | me.js do-signin | TRUE |
| PR-03 | Sign in |  |  | rule | The button is disabled and relabelled until the request finishes, and restored either way. | Several seconds against Apps Script. A button still reading Sign in and still pressable reads as frozen, and a second press is a second verifyLogin. | me.js | TRUE |
| PR-04 | Sign in |  |  | rule | On success the screen redraws immediately, then the payload refreshes behind it. | Waiting for the refetch means you are signed in, the toast says so, and the form still asks for your name until something else repaints. | me.js | TRUE |
| PR-05 | Sign in |  |  | rule | Enter submits, by pressing the button rather than repeating what it does. | The inputs are not in a form, so the phone keyboard's Go key had no default to trigger. Going through the button means the disabling cannot be bypassed. | me.js | TRUE |
| PR-06 | Sign out |  |  | rule | Local only. No round trip. | Forgetting something this device knows should not need permission from a server. | me.js | TRUE |
| PR-07 | Shows |  |  | display | Face, name, role, credits, XP. |  | me.js meCard | TRUE |
