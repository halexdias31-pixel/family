# js/cards-render.js

The full text of comments in `js/cards-render.js` that `tools/comments.js` shortened to a headline ending in " §".
Append-only, in the order they were shortened; each entry names what the comment sat in.

### A MENU'S CHOICES (owner, 14 Nov: one template for everything):

top level, before `cardChoice_`

```
/* A MENU'S CHOICES (owner, 14 Nov: one template for everything): a Find menu is a card whose tags are the path chosen and whose body is this.
   `{ type: 'choices', id?, ask?, rows: [{ look?, id?, options: [opt] }], wait?, after? }`; an opt is `{ text, marked?, act, data?, look?, label?, pressed?, disabled? }`
   or the blank tag typed on, `{ box: { id?, cls, value, label, inputmode?, enterkeyhint? } }`. Every tag is shown; nothing hides behind ⋯.
   `after` is markup another maker made (a card, the none line) that follows the menu; `wait` is the loader. */
```

