## The home-screen app loads itself now, and three separate guards stop it looping

**Asked for as "can you make it so added to homescreen version will always be up to date?"** The
banner was the whole answer while the only safe thing to do was ASK — and in an installed app that
is a sentence somebody has to notice and tap on a screen they opened to do something else.

**The reason it only asked is four lines below the function, and it is not a small one.** `purge()`
called `location.reload()` and became an infinite loop the day the site installed a worker of its
own: register, purge, reload, register — for every visitor, with the app never finishing opening.

**So the three things that make that impossible here, each doing a different job:**

1. **It cannot loop**, because the reload is remembered against the TAG it was for. `purge`'s loop
   was unconditional; this one has a fact to compare against, so a build that reloads and still
   reports a different tag reloads **once** and then asks. `sessionStorage` rather than
   `localStorage`, so it survives the reload and dies with the window.
2. **Only on a resume, not an app-switch.** Six minutes away is somebody opening the app again;
   twenty seconds is somebody answering a message, and reloading under them is taking the screen
   away from somebody using it.
3. **It never throws anything away.** An answer box persists on every keystroke and the notepad
   saves as you type, so both are safe to reload over. A message being composed, a comment being
   written, a profile being edited are not — anything typed and unsaved holds the reload and gets
   the banner instead.

**Measured in five states**, against a server whose ETag I could change by hand: no deploy and long
away → nothing; a deploy 20 seconds away → the banner, no reload; a deploy 15 minutes away → it
reloads onto the new build; **a deploy 15 minutes away with something typed → it holds and shows the
banner**; and a reload followed by two more resumes that still report a different tag → **zero extra
reloads**. The fourth of those was wrong the first time I measured it and the probe was at fault
rather than the app — the only textarea on that fixture is the notepad, which is exempt, so the
guard was never exercised until I typed into something that is not.
