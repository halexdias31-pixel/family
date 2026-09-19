# style

| id | area | token | value | kind | rule | because | source | active |
|---|---|---|---|---|---|---|---|---|
| SY-01 | Layout | --app | 26.5rem | token | The app is a fixed column, centred, and never wider than this however wide the window is. | It is a phone app that also opens on a laptop. A funnel stretched across a monitor is a line of text three feet long. | style.css | TRUE |
| SY-02 | Layout | CARD_W | 0.80 | token | A card is 80% of the app's width. Every card, always the same. | Nothing has to be measured sideways and nothing can be a different width from anything else. | shell.js | TRUE |
| SY-03 | Layout | EDGE_SHOWING | 0.08 | token | 8% of the neighbouring card shows on each side. | It is what says there is more to swipe to. Without it the screen looks like the only screen. | shell.js | TRUE |
| SY-04 | Layout | (derived) | gap = 0.5 − CARD_W/2 − EDGE_SHOWING | rule | The gap between cards is NOT a third setting. Across the screen sits: edge, gap, card, gap, edge, and they add to 1. | Set all three by hand and they stop adding up, so the cards drift off centre a little more with every change. | shell.js | TRUE |
| SY-05 | Layout | --pad | 1rem | token | The side margin inside a pane. |  | style.css | TRUE |
| SY-06 | Layout | --gap | 0.62rem | token | The space between stacked things. |  | style.css | TRUE |
| SY-10 | Pane | width | 100% | token | A pane fills its page. The page is what is 80% wide. | One thing decides the width, and it is not the pane. | style.css .pane | TRUE |
| SY-11 | Pane | padding | 1rem 1rem 1.25rem | token | Slightly more at the bottom than the top. | The last card's hairline would otherwise sit on the pane's edge. | style.css .pane | TRUE |
| SY-12 | Pane | border-radius | 14px | token | Not --r. A pane is a big surface and 3px on something this size reads as a mistake. |  | style.css .pane | TRUE |
| SY-13 | Pane | background | linear-gradient(160deg, #fff 5%, #fff 1.5%) over #101010 | token | A REAL fill in the app's own dark, with a gradient over it. Not a translucent wash. | A 7% white wash over black with no blur behind it is not a faint surface — it is nothing. The fill has to stand on its own so that removing the blur changes how it looks, not whether it is there. | style.css .pane | TRUE |
| SY-14 | Pane | border | 1px solid rgb(255 255 255 / .16) | token | A bright top edge and a border are what say a pane is there at all. | They carry the separation now that the blur is only on the pane in front. | style.css .pane | TRUE |
| SY-15 | Pane | box-shadow | inset 0 1px 0 rgb(255 255 255 / .2), 0 10px 30px rgb(0 0 0 / .5) | token | An inset highlight along the top, and a drop shadow underneath. | The inset is the lit edge; the drop is what lifts it off the background. | style.css .pane | TRUE |
| SY-16 | Pane | backdrop-filter | blur(16px) saturate(1.5) | token | The glass. Applied ONLY to the pane in front, not to the neighbours. | It is the most expensive thing on the screen and blurring three panes during a swipe is three times the cost for two nobody is reading. | style.css .screen.on .pane | TRUE |
| SY-17 | Pane | (fallback) | background: var(--raised) | rule | A browser without backdrop-filter gets a solid pane instead. | An unsupported blur is not a faint pane, it is an invisible one. | style.css @supports | TRUE |
| SY-18 | Pane | opacity | 1 in front, .92 either side, 0 beyond | token | A neighbour is barely dimmed. | This was .55. What you see of a neighbour is a sliver — its bright top edge and border — and at .55 over black that edge renders at 30/255. Drawn, and invisible. | shell.js | TRUE |
| SY-20 | Card | background | none | token | A card draws no surface of its own. | The glass was never on the cards. It is on the pane behind them. | style.css .card | TRUE |
| SY-21 | Card | border | 0, with a 1px bottom hairline in --line-soft | token | A card is separated from the next one by a line, and by nothing else. |  | style.css .card | TRUE |
| SY-22 | Card | border-radius | 0 | token | A rounded corner is the corner of something. | There is nothing to round: the pane is the thing with edges. | style.css .card | TRUE |
| SY-23 | Card | padding | .85rem 0 | token | Vertical only. The side margin belongs to the pane. | Padding on both means two things deciding the same measurement. | style.css .card | TRUE |
| SY-24 | Card | h3 | .95rem, 600 | token | The name. |  | style.css | TRUE |
| SY-25 | Card | .sub | .82rem, --dim, margin-top -.25rem | token | The second line under the name. | Pulled up, because the h3's own margin would otherwise put a gap between a thing and its own subtitle. | style.css | TRUE |
| SY-30 | Colour | --bg | #000000 | token | The app's background. True black. | An OLED phone draws no light for it, and the whole palette was picked against it. | style.css | TRUE |
| SY-31 | Colour | --raised | #0b0b0b | token | A surface sitting above the background. |  | style.css | TRUE |
| SY-32 | Colour | --sunk | #050505 | token | A surface sitting below it — an input, a well. |  | style.css | TRUE |
| SY-33 | Colour | --line | #232323 | token | A visible edge. |  | style.css | TRUE |
| SY-34 | Colour | --line-soft | #171717 | token | A hairline between rows in a list. | Two, because the edge of a thing and a divider inside a list are different jobs. | style.css | TRUE |
| SY-35 | Colour | --ink | #e6e6e6 | token | Foreground text. Not pure white. | Pure white on true black is harsh and, on OLED, smears when it moves. | style.css | TRUE |
| SY-36 | Colour | --dim | #9a9a9a | token | Secondary text. |  | style.css | TRUE |
| SY-37 | Colour | --faint | #5e5e5e | token | Text that is barely there — a hint, a placeholder. |  | style.css | TRUE |
| SY-38 | Colour | --gold | #ffb454 | token | THE ONE ACTION. Buy, confirm, the primary button. | One accent used rarely is what makes it mean anything. Two accents is none. | style.css | TRUE |
| SY-39 | Colour | --admin | #f2d24b | token | Only-you-can-see-this. Admin marks and nothing else. | Deliberately NOT --gold: the trolley and the bin sit on the same row, and one colour for buy and delete is the confusion the two-row layout existed to prevent. | style.css | TRUE |
| SY-40 | Colour | --green | #3ddc84 | token | A subject. Reserved — nothing else uses it. |  | style.css | TRUE |
| SY-41 | Colour | --purple | #b98cff | token | A venue. |  | style.css | TRUE |
| SY-42 | Colour | --pink | #ff8fc4 | token | A wearable. |  | style.css | TRUE |
| SY-43 | Colour | --good | #3ddc84 | token | Yes, done, paid. |  | style.css | TRUE |
| SY-44 | Colour | --warn | #ffb454 | token | Careful. Same value as --gold. | They are the same colour doing two jobs, which is worth knowing before changing either. | style.css | TRUE |
| SY-45 | Colour | --bad | #ff5f56 | token | No, failed, overdue. |  | style.css | TRUE |
| SY-46 | Colour | (rule) |  | rule | Every hue names what a thing IS — green a subject, purple a venue, pink a wearable. | It is why admin was silver for a long time: admin is not that kind of fact. Making it yellow was a deliberate exception. | style.css | TRUE |
| SY-50 | Type | --font | ui-monospace, SF Mono, Cascadia Mono, Menlo, Consolas, monospace | token | One monospace family throughout. --mono is an alias of it. | It is the app's voice. Swapping it for a system font was most of what made the Instagram prototype feel like a different app. | style.css | TRUE |
| SY-51 | Type | body | 1rem / 1.55 | token | Base size and line height. |  | style.css | TRUE |
| SY-52 | Type | (weights) | 400, 600, 700 | token | Three weights. Nothing else. |  | style.css | TRUE |
| SY-60 | Shape | --r | 3px | token | The radius on small things. Deliberately tight. | A monospace app with soft corners reads as neither one thing nor the other. | style.css | TRUE |
| SY-61 | Shape | --r-sm | 2px | token | Tighter still, for chips and tags. |  | style.css | TRUE |
| SY-62 | Shape | tile | 44px square | token | Every mark on a card. | 44 is the smallest reliable thumb target. | style.css .tile | TRUE |
| SY-63 | Motion | --quick | .13s | token | How long anything takes to respond to a touch. | One duration. Slower feels laggy, faster is not seen. | style.css | TRUE |
| SY-64 | Motion | (rule) |  | rule | Hover effects sit behind @media (hover: hover). | Mobile Safari applies :hover on tap and leaves it applied, so the last thing pressed keeps a highlight that means nothing. | style.css | TRUE |
| SY-65 | Safe area | --safe-top / --safe-bottom | env(safe-area-inset-*) | token | The notch and the home bar are read from the device, never guessed. |  | style.css | TRUE |
| SY-70 | Images | (rule) |  | rule | A photograph of a person is never cropped to a square. | Cropping a phone photograph takes the top and bottom, which is where the child is. | style.css .post-pic | TRUE |
| SY-71 | Images | (rule) |  | rule | A full-bleed picture cancels exactly var(--pad), never a hardcoded number. | A hardcoded .9rem left the photograph 1.6px narrow on one edge — a misalignment that reads as a rendering fault rather than a rule. | style.css | TRUE |
| SY-80 | Check | check-css.js |  | rule | Every rule here is checked: duplicate properties, a selector in two places disagreeing, a rule overridden by a later copy of itself, classes styled but never produced. | Appending an override instead of editing the original is the easiest mistake to make in a 7,000-line stylesheet, and it caught me doing exactly that. | js/check-css.js | TRUE |
