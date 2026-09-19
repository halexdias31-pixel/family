# gestures

| id | area | kind | rule | because | source | active |
|---|---|---|---|---|---|---|
| GS-01 | Axes | rule | Two axes. X moves between columns, Y between the widgets on one column. Both are drags, not taps. | There is no tab bar and no back button, so the two gestures are the whole of the navigation. | shell.js AXES | TRUE |
| GS-02 | Axes | rule | A drag commits when it has crossed a share of the APP's width, not the window's. | On a window wider than the app column, a swipe had to travel further than the app is wide to turn a page — so it took a longer drag than the page itself occupies. | shell.js span, appWidth_ | TRUE |
| GS-03 | Axes | rule | One axis wins per gesture and it is decided early. A drag does not switch axis halfway. | A diagonal that keeps changing its mind moves both and commits to neither. | shell.js | TRUE |
| GS-04 | Scroll | rule | A pane sets touch-action: none so the grid owns the vertical drag. | Otherwise the browser scrolls and the grid pages at the same time, on the same finger. | style.css .pane | TRUE |
| GS-05 | Scroll | rule | A screen that is NOT paged has no Y axis, and a vertical drag there falls through to ordinary scrolling. | It is what makes a scrolling screen possible without a special case: one page means nothing to page to. | shell.js | TRUE |
| GS-06 | Feel | rule | Only the screen in front takes presses. A sliver of the next one showing at the edge is not tappable. | It is something to look at, not something to hit. | shell.js pointerEvents | TRUE |
| GS-07 | Feel | display | A neighbour is dimmed to .92, not to .55. | What you see of a neighbour is a sliver: its bright top edge and its border. At .55 over a black app that edge renders at 30/255 and is drawn but invisible — the one thing making it visible was the thing being dimmed away. | shell.js opacity | TRUE |
| GS-08 | Feel | rule | Two cells either side are painted, not one. | With four columns the far one was blank until the swipe reached it, so a quick flick across two showed nothing in between. | shell.js | TRUE |
| GS-09 | Feel | rule | The transition comes off whatever is being dragged and goes back on when it is released. | A transition during a drag makes the screen lag the finger. | shell.js | TRUE |
| GS-10 | Ends | limit | Travel clamps at both ends. There is no wrap-around. | Swiping past the last column onto the first reads as the app having jumped rather than moved. | shell.js | TRUE |
