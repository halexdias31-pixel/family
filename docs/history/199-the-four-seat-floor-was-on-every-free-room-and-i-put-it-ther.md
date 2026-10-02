## The four-seat floor was on every free room, and I put it there

**`seatLimits` asked `isHome(loc)`**, and `isHome` answers "does anybody pay for this room", so it
is true of `Online` and of every free library. A one-to-one video call needed four chairs. The floor
is for the client's own house, so `atClientHome_` reads the NAME and nothing else: the literal
`At home` and a venue whose title says house. `isHome` is unchanged and is still what decides
`hosting`, which is the question it answers. `check-flow.js` asks both directions, and the old rule
put back names `Online` and `Sutton Library`.
