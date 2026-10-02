## Signed out, the booking column is one sentence like the others

**Asked for as "sign in to book shouldnt have a sign in button it should be like the other stuff."**
The signed-out booking card had a gold `Sign in` button, and `on('signin')` behind it only toasted
*"Sign-in screen next"* — a control that did nothing. The Camera and Messages cards already handle
this with a heading and one line saying where your account is, and nothing to press. The booking
card is the same shape now (`Booking` / *"Sign in to book — your account is a few screens to the
right"*). The handler went too, so `check-doors.js` is 155 handlers and 154 doors with no orphans.
