# js/_scope.js

The full text of comments in `js/_scope.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### FREE NAMES THAT ACTUALLY EVALUATE NOW — the same walk, except it does not go inside a function or an arrow body.

top level, before `eagerFree`

```
/* FREE NAMES THAT ACTUALLY EVALUATE NOW — the same walk, except it does not go inside a function
   or an arrow body. A name mentioned inside `const f = () => USER.name` is not read until f is
   called; a name in `const n = USER.name` is read this instant. Only the second can be in a
   temporal dead zone, and treating them alike reported twelve faults that were not there. */
```

