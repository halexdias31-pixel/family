## The remembered tab outlived the app being opened

**Reported as "the latest post isnt the defualt opening widget for some reason still. im opneing on
phone. after having added to homescreen".** `TAB_HOME = 'feed'` was already set AND already
deployed, which is what made this confusing. What beats it is the line under it, which remembered
whichever column you were last on — for ever.

**BOTH HALVES ARE REAL AND THEY ARE NOT THE SAME EVENT.** Opening the app is opening the app, and
landing on a funnel question nobody asked is the argument `TAB_HOME` records. A RELOAD is not that:
`reload-build` reloads the page under somebody the moment a new build lands, and losing the question
they were reading would be the fix costing more than the fault.

**So the id is stamped with the moment it was written and honoured only while that moment is
recent.** The number is `AWAY_AGAIN` — six minutes — which is not a new one: `checkBuild_` already
asks exactly this question about a resume, and its own note says six minutes is past any
notification and well short of "I opened this tomorrow morning". It moved up beside `TAB_HOME` so
there is one number rather than two, which is the `needs_print` / `print_required` lesson.

**NOT `sessionStorage`, and the reason is the home screen.** An installed app on iOS is SUSPENDED
rather than closed — the note over `watchBuild_` records that in full — so a window left open for
three days is still one session and a session flag would never expire. A stamp is a fact about time
and does not care how the window got here.
