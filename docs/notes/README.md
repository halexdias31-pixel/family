# docs/notes

The full text of every source comment that `tools/comments.js` shortened. In the code such a comment is
one line, its headline, ending in ` §`; here it is word for word, in `docs/notes/<source path>.md`
(e.g. `docs/notes/js/find.js.md`), under a `### <headline>` heading with the function, rule or name it
sat in. Find one with `grep -rn '<headline>' docs/notes`.

The files are append-only: a later run adds entries at the end and never rewrites earlier ones. New
stories belong in `docs/history/`, not here. See docs/history/358.
