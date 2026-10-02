## A bundle of papers in Find, and the basket sends the order to the owner

**Asked as "what happened to collection/bundle in the finder. like what if someone wants a bundle of
2017 past papers for maths edexcell to add to cart and have me send it to them?"** The collection
line was deleted for being a pivot table stacked on the funnel, and nothing replaced the one job it
did that the funnel cannot: a set of whole papers as ONE thing to order.

**A bundle is what the results add up to, not a new question.** `bundleOf_` in find.js looks at the
list on screen and offers a bundle only when it is WHOLE PAPERS: between 2 and 24 of them, with at
most a tenth of the results from papers outside the set. It is a leading page after the question,
counted by `PAGER.stuff`. So nothing is offered at the top of the funnel, a topic is never a bundle,
and the owner's own example reads **Maths · Past paper · GCSE · Edexcel · Sitting `2017 & 2018`**,
which is 13 papers grouped a line per sitting. A search over questions from everywhere offers none.

**It goes into the basket as one print line per paper, under the bundle's title.** A bundle is not a
product: each sheet keeps its own `+ laminate` switch and its own page count, and a paper already in
the basket is not added twice. A paper nobody has counted the pages of is `? pp` and `tbc`, and the
total says how many are priced when sent rather than adding them in as nought.

**`Send order` POSTS THE BASKET TO AN ADMIN THROUGH `sendMessage`**, the one messaging route that
already exists, and it empties the basket **only on a yes**. There is still no checkout: money
changes hands when the paper does, and the owner answers in Messages. Before this the button was
`toast('Checkout is the next thing to build')`, the `orderPrints` shape.

**And a fault the bundle found in the funnel.** An answer given INSIDE a bucket was ORed beside it:
`2017 & 2018` then `Summer 2017` still kept all four sittings, because two chips on one field are
"either / both". `stuffNarrow_` lets a bucket stand down when a later chip answers the same field,
so the chip that says Summer 2017 is the list that says Summer 2017. Nothing could see it:
`check-funnel.js` presses each answer on its own.

**`node js/check-bundle.js`** runs the real library, works the right papers out from the file on its
own, and asks that each bundle names exactly those, that a paper goes in once, and that an order
empties the basket only on a yes. `check/states.js` seeds the bundle card and a basket holding one.
This work was finished and merged by hand after the worker building it stalled.
