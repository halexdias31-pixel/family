## The PIN is the `pin` cell, and sessions and the throttle moved to Script Properties

**Asked for as *"i just deleted the pin hash bullshit. all the pin stuff except pin. rework it. just
simple. just pin and login no other username stuff."*** `pin_hash`, `pin_salt`, `session_hash`,
`session_until` and `tries` are gone from `people`, and the code no longer reads or writes them:
`authCheckPin_` compares the `pin` cell as typed, `authSetPin_` writes it, and sign-in is the e-mail
address and that PIN.

**WHAT IT COSTS, SAID PLAINLY**: anybody who can open the spreadsheet can read every PIN. That is the
owner's decision, and it is why a hash existed.

**A SESSION AND A THROTTLE STILL EXIST, OFF THE SHEET.** With the session columns deleted,
`authNewSession_` wrote to headers that were not there, so a sign-in "succeeded" and every action
after it was refused as signed out. Tokens are kept as `AUTH_S_<sha256>` → `{id, until}` in Script
Properties, and wrong answers as `AUTH_TRIES_<person_id>` → `{n, until}` — the same ten-free ladder,
nothing a person can see or delete by accident. Signing out or changing a PIN ends every session that
person holds. `SCHEMA` lost the five names, or `?setup=1` would put them straight back.
