## The first screen is the latest post, and the splash bars are scaled rather than resized

**`TAB_HOME` was `stuff` and the owner overruled the argument for it.** That argument is still in
the file and is worth keeping: *"the feed is a noticeboard for a tutoring business; the funnel is
the product"* — true of what the app is FOR, and not the question a first screen answers. A funnel
opens on a question nobody asked yet; the newest post is the business saying something, which is
what a front door is. **`PAGE_HOME.feed` already landed on it** — page 0 is the spotlight when the
business has chosen one and the newest post otherwise — so this is one word, and only for a phone
that has never opened the app: the line below it still remembers wherever somebody was last.

### `height` is a layout property, and these two were changing colour in the same breath

**Reported as "the blue charts leave blue residue behind. same with the ordering animation bar
graph".** Both ran correctly in a desktop browser — measured across a full cycle, the colours cross
blue to green and back and every bar moves in every frame. So there was nothing to see here, and
the complaint was still right.

**Measured across the whole stylesheet: nine keyframes animate a layout property, and `mn-level`
and `so-swap` are the ONLY two that animate geometry and colour together.** That is the shape that
smears — the region to invalidate and the colour to paint are both moving, on the main thread,
during boot, which is exactly when that thread is busy parsing 566 KB of JavaScript.

**`transform: scaleY()` is the same picture without the layout.** The compositor owns it, the box
never changes size, there is no region to invalidate — and `index.html`'s own defence of the
splash, that it keeps moving while the thread is busy, becomes true of these two rather than merely
claimed. `--h` is a fraction of the row now rather than a length, because a transform takes a number.
Measured before and after at seven points in the cycle: **the bar heights are the same to the
pixel.**

**The other seven are left alone**, deliberately: none of them changes colour while it moves, and
changing seven animations on a report about two is the fix that costs more than the fault.
