## A comma in a topic name is two topics, and eleven AQA units joined nothing

**Found by auditing the four science papers I had just transcribed**, which is the only reason it is
not a fault somebody reports in a month as "the filter has a topic called Bonding in it".

**`Bonding, Structure and the Properties of Matter` is AQA's own heading for unit 4.2 and it cannot
go in this column.** `topics` is a comma-list read by `asList_` — the same shape as `keystage` and
`needs` — so that one name arrived as **two** topics, `Bonding` and `Structure and the Properties of
Matter`, and neither joins `data/topics.json`. **Same lesson as the practicals' pipe separator**,
where 14 of 410 equipment cells carried a comma inside one item and no comma rule could tell them
apart. There the fix was a different separator; here the column is already committed with commas
meaning "next topic", so the fix is that a topic name may not contain one. `Bonding & Structure`.

**And `The Rate and Extent of Chemical Change` was a second home for a branch that already existed.**
`data/topics.json` has carried `Rate of Reaction` with its aliases since before these papers. Adding
the spec's longer heading beside it is the `Density` decision again — *"a second home is two branches
for one word"* — so the rows say `Rate of Reaction` and the tree is untouched.

**Eleven AQA units had no branch at all**, so 80 questions resolved to no `topicArea`: Atomic
Structure (chemistry's and physics's are different units and both are there now), Bonding &
Structure, Quantitative Chemistry, Organic Chemistry, Chemistry of the Atmosphere, Using Resources,
Magnetism & Electromagnetism, Electromagnetic Waves, Space Physics, and Inheritance & Evolution for
the Biology Paper 2 still to come. Each is a child of its subject root, with the short forms people
type as aliases — **and no commas in a label or an alias either**, because both are comma-lists too.

**Diffed over the whole library before it was kept**, exactly as the last three roots were:
**80 questions gained an area, 0 lost one, and 0 moved from one area to another.** That third number
is the one worth taking: `topicAreaOf_`'s containment pass resolves a name only when every candidate
agrees, so a new branch can quietly take a maths topic away from maths — `Energy`, `Forces`, `Waves`
and `Rates` are ordinary English and have done it before.
