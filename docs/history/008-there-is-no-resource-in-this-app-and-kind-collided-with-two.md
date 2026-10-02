## There is no "resource" in this app, and `kind` collided with two columns at once

**"I don't know the difference between questions and resource" is the correct reaction.** The word
is a leftover from the `resources` tab, which was folded into `questions` and then deleted — this
file records the whole of it. What survived the deletion is two column names, `resource_type` and
`resource_id`, naming a thing that no longer exists, sitting beside a file called `questions`.

**And `kind` collided with two columns.** Its values were `paper`, `stem` and `part` — and `paper` is
also a column (which paper of the set: 1, 2 or 3) and `part` is also a column (which part of the
question: a, b, c). So `kind: 'paper'` and `paper: '1'` were different facts one word apart, and so
were `kind: 'part'` and `part: 'a'`.

| was | is | what it means |
|---|---|---|
| `kind: 'paper'` | `kind: 'document'` | the row the whole paper gets — its link, its page count, its total |
| `kind: 'stem'` | `kind: 'preamble'` | a paragraph several questions hang from |
| `kind: 'part'` | `kind: 'question'` | one question |
| `resource_type` | `document_type` | Worksheet, Past paper, Exercise, Specimen paper |
| `resource_id` | `source_id` | the old join to the deleted tab |

**Renamed as explicit pairs rather than a blanket replace**, because `'part'` and `'paper'` appear
all over this repo as ordinary English and as CSS tokens — `--paper`, `.qsheet-part`, "the second
part of the source".

### The rename broke two checks silently, and the count I had just added is what caught it

**`papers checked against a total` went 34 → 2** and `check-library.js` still printed a pass.
`isEdexcelGcseMaths` tests `p.resource_type === 'Past paper'`, which after the rename is
permanently false — so thirty-two Edexcel maths papers dropped out of the only end-to-end check the
library has, and the 80-mark rule was enforcing itself on the two English papers alone. **The
printed count is the only reason that was visible**, and it had been there for one commit.

**And the closed vocabulary for `Type` stopped existing.** `VOCAB` still said `resource_type`, so
the loop found the column on zero rows, reported zero strays, and passed. That is `check-booking.js`
again — a check that cannot reach its subject reporting that the subject is fine. **A name in
`VOCAB` that no row carries is a failure now**: either the column was renamed and the list did not
follow, or the entry is for a column that never existed. Proved by putting the old name back.
