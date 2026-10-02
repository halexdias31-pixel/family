## A question answers Topic only if it is a 1st Class Maths worksheet

**Asked for as "each question has an assigned topic. I hate that. I only liked it with the first
class maths stuff because the topic names were the names of the pdf itself."** A 1st Class Maths
sheet IS one topic, graded 1 to 9, so its tag is its own title. On a past paper or a 5-a-day the
same cell is a label assigned to one question of thirty. `topicShown_` in find.js makes the `topic`
and `topicArea` facets answer nothing for any other QUESTION; practicals and quizzes are about their
topic by construction and keep it. The `topics` cells stay in the file: the search box still reads
them and practicals and quizzes still join on them, so this is one test to take back out.
`check-bundle.js`'s wholeness case narrows a sitting by question number now instead of by topic area.
