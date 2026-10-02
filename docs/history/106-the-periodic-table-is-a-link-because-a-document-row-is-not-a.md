## The periodic table is a link, because a document row is not an item

**Asked for as "add the periodic table to resouces".** It is AQA's own insert — *Insert (Foundation;
Higher): periodic table, November 2020*, read off the file rather than the filename — and the same
table AQA prints for Combined Science Trilogy and for Chemistry 8462.

**THE OBVIOUS HOME IS THE WRONG ONE, and it is worth knowing why before somebody tries it.** A
`kind: 'document'` row in `data/questions.json` looks right — it is a paper-level thing with a
`source_url`. It would be **invisible**: `questionItems` filters `kind !== 'document'`, so a
document row is where a paper-level FACT lives and is never an item in the funnel. A periodic table
filed that way is a row nobody can reach.

**So it is a link**, which is already a kind the funnel carries — 126 of them, in 25 categories,
each with a name, a category, a URL and a description. One row in `data/settings/links.json`, no
deploy needed for the next one.

**And the sharing was checked before the row was written**, because a link a student cannot open is
worse than no link: `{"role":"reader","type":"anyone"}`. CLAUDE.md already records the 1,508 Drive
links being sampled for exactly this.

### 115 of the 127 links carried a description nothing could search

**Measured while adding the row.** The haystack in `stuffFind` is
`name + sub + subject + slot + grade + text`, and a link had no `text` at all — so it was findable
by its title and by nothing else.

| typing | before | after |
|---|---|---|
| `atomic mass` | **0** | 1 |
| `past papers` | **0** | 3 |
| `chemistry` | **0** | 1 |
| `revision` | 1 | **7** |
| `science` | 3 | **5** |

**`past papers` returning nothing is the tell** — that list holds four sites that are nothing but
past papers, and not one of them has the words in its name. **Fourth occurrence of this exact
sentence in this file**, after `topics`, after `company` and after the practical guides: the words
are in the row, the search box cannot see them, and a screen whose whole job is finding things
returns nothing for the thing it holds.

**The category is in the haystack too**, because `science` and `revision` are what somebody types
when they cannot remember what a site is called, and the category is the only place either word
appears. Built onto the item rather than matched per keystroke, which is what those three notes
also say: `stuffItems` is memoised and runs once, `stuffFind` runs on every letter.
