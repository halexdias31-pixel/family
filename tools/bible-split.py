"""
CUT THE KING JAMES BIBLE INTO ONE FILE PER BOOK, SO A PHONE ASKS FOR GENESIS AND NOT FOR THE BIBLE.

ASKED FOR AS "i want to add the bible to resources as a book. but only admin can see the bible." and,
when a fresh copy was about to be fetched, "i already have a bible text in repo": it is
`data/archive/bible.json`, the `Library` spreadsheet's `bible` tab exported row for row -- 31,102
verses, the canonical count, ten columns each, ten megabytes.

TEN MEGABYTES IS THE WHOLE REASON THIS SCRIPT EXISTS. The text is 4.2 MB of it; the rest is the same
nine cells said again on every verse (`"translation": "KJV"`, `"active": "True"`, a `verse_id` and a
`ref` that are the book, chapter and verse a third and fourth time). And nobody reads the Bible as
one download: you open a book. So a book is a file, its chapters are lists, a verse is its own words
and nothing else, and the address of every verse is where it sits -- `chapters[0][0]` IS Genesis 1:1.
Measured after: Genesis is 204 KB where it was 494 KB of rows, and Psalms, the biggest, is 235 KB
where it was 699 -- 60 KB and 76 KB on the wire, which is what GitHub Pages actually sends.

THE ARCHIVE STAYS WHERE IT IS AND STAYS THE SOURCE. `data/archive/README.md` draws one line --
"read by the app" against "kept so it is not lost" -- and says not to wire anything to a file in that
folder. Nothing is: the app reads `data/bible/`, which this writes, and this is re-run from the
archive whenever the archive changes. Deterministic -- same input, byte-identical output -- so a
re-run that changes nothing changes no file, and `git status` after it is the proof.

THE TEXT IS COPIED, NEVER CLEANED. Two marks in it are the 1611 printers', not noise:
  * `[was]` -- the KJV's ITALIC words, the ones the translators supplied for sense with no Hebrew or
    Greek under them. 21,476 pairs. The reader draws them in italics without the brackets.
  * a leading `# ` -- the pilcrow, where the 1611 edition starts a paragraph. 2,936 of them, and none
    after Acts 20, because the 1611 printers stopped there too. The reader starts a paragraph on one.
Stripping either here would make the split lossy and leave the reader nothing to draw them from.

LOSSLESS IS CHECKED, NOT CLAIMED. `js/check-bible.js` reads the archive and these files back and
fails on a verse missing, moved, added or changed by one character, and on a file here that this
script would not have written.

    python3 tools/bible-split.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(HERE, 'data', 'archive', 'bible.json')
OUT = os.path.join(HERE, 'data', 'bible')


def slug(name):
    """`1 Samuel` -> `1-samuel`, `Song of Solomon` -> `song-of-solomon`. A filename a URL does not
    have to escape, which is the whole requirement."""
    return re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')


def dump_book(book):
    """ONE CHAPTER PER LINE. The same rule `questions.json` keeps for the same reason: a diff that
    says "Genesis 3 changed" is a line, not a 200 KB single-line file that changed somewhere. Still
    one JSON value -- `JSON.parse` neither knows nor cares where the newlines are."""
    head = json.dumps({'book': book['book'], 'testament': book['testament']}, ensure_ascii=False)
    lines = [json.dumps(ch, ensure_ascii=False) for ch in book['chapters']]
    return head[:-1] + ', "chapters": [\n' + ',\n'.join(lines) + '\n]}\n'


def main():
    with open(SRC, encoding='utf-8') as f:
        rows = json.load(f)

    # ---------- THE ARCHIVE IS HELD TO ITS OWN SHAPE BEFORE ANYTHING IS WRITTEN ---------------------
    # Every verse in book, chapter, verse order with no gaps, because the files below throw the
    # numbers away and keep only the order -- so an archive out of order would be written as a Bible
    # with its verses moved, silently. Refused instead. Measured on the archive as committed: 66
    # books, 1,189 chapters, 31,102 verses, all in order, every chapter numbered 1..N.
    books = []
    for r in rows:
        assert r.get('translation') == 'KJV', 'not KJV: %r' % r.get('verse_id')
        assert str(r.get('active')) == 'True', 'an inactive verse: %r' % r.get('verse_id')
        n, c, v = int(r['book_no']), int(r['chapter']), int(r['verse'])
        if not books or books[-1]['n'] != n:
            assert n == len(books) + 1, 'book %d after book %d' % (n, len(books))
            assert r['testament'] in ('OT', 'NT'), 'testament %r' % r['testament']
            books.append({'n': n, 'book': r['book'], 'testament': r['testament'], 'chapters': []})
        b = books[-1]
        assert r['book'] == b['book'] and r['testament'] == b['testament'], r['verse_id']
        if c != len(b['chapters']):
            assert c == len(b['chapters']) + 1, '%s %d after %d' % (b['book'], c, len(b['chapters']))
            b['chapters'].append([])
        assert v == len(b['chapters'][-1]) + 1, '%s %d:%d out of order' % (b['book'], c, v)
        assert isinstance(r['text'], str) and r['text'] == r['text'].strip() and r['text'], r['verse_id']
        b['chapters'][-1].append(r['text'])

    assert len(books) == 66, '%d books' % len(books)
    assert sum(len(ch) for b in books for ch in b['chapters']) == len(rows)

    os.makedirs(OUT, exist_ok=True)
    wrote = set()
    index = []
    for b in books:
        name = '%02d-%s.json' % (b['n'], slug(b['book']))
        body = dump_book(b)
        path = os.path.join(OUT, name)
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
        if old != body:
            with open(path, 'w', encoding='utf-8', newline='\n') as f:
                f.write(body)
        wrote.add(name)
        index.append({'n': b['n'], 'book': b['book'], 'testament': b['testament'], 'file': name,
                      'chapters': len(b['chapters']),
                      'verses': sum(len(ch) for ch in b['chapters'])})

    # ---------- THE INDEX IS WHAT THE CONTENTS PAGES ARE DRAWN FROM ---------------------------------
    # Small enough to ask for whole (7 KB): the book's name, its testament, where its file is
    # and how many chapters it has, which is everything the contents and the chapter grid need
    # before a single verse has been fetched. One book per line, for the diff.
    totals = {'books': len(index), 'chapters': sum(i['chapters'] for i in index),
              'verses': sum(i['verses'] for i in index)}
    head = {'translation': 'KJV', 'name': 'The Bible (King James Version)',
            'source': 'data/archive/bible.json', 'totals': totals}
    body = json.dumps(head, ensure_ascii=False)[:-1] + ', "books": [\n' \
        + ',\n'.join(json.dumps(i, ensure_ascii=False) for i in index) + '\n]}\n'
    path = os.path.join(OUT, 'index.json')
    old = open(path, encoding='utf-8').read() if os.path.exists(path) else None
    if old != body:
        with open(path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(body)
    wrote.add('index.json')

    # A FILE HERE THAT THIS RUN DID NOT WRITE IS A BOOK THAT IS NOT IN THE ARCHIVE -- a renamed slug
    # leaving its old file behind, most likely. Removed rather than left for a phone to fetch.
    for name in sorted(os.listdir(OUT)):
        if name not in wrote:
            os.remove(os.path.join(OUT, name))
            print('removed', name)

    print('%d books, %d chapters, %d verses -> %s' % (totals['books'], totals['chapters'],
                                                      totals['verses'], os.path.relpath(OUT, HERE)))


if __name__ == '__main__':
    main()
