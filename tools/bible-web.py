#!/usr/bin/env python3
"""The World English Bible beside the King James (499): data/bible/web/NN-book.json, one chapter per line,
held to the KJV index's verse counts so verse N of a card is verse N in both.

Source: ebible.org/Scriptures/engwebp_vpl.zip (World English Bible, Protestant canon, verse-per-line).
Licence: public domain (ebible.org: "The World English Bible is in the Public Domain"); "World English Bible"
is eBible.org's trademark, used only for the text copied verbatim, as asked.

    python3 -I tools/bible-web.py path/to/engwebp_vpl.txt
A verse the WEB numbers past the KJV's last in a chapter is joined onto that last verse; a KJV verse the WEB
does not have is '' (the card then shows the KJV alone). Both counts are printed.
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CODES = ('GEN EXO LEV NUM DEU JOS JDG RUT 1SA 2SA 1KI 2KI 1CH 2CH EZR NEH EST JOB PSA PRO ECC SOL ISA JER LAM EZE DAN '
         'HOS JOE AMO OBA JON MIC NAH HAB ZEP HAG ZEC MAL MAT MAR LUK JOH ACT ROM 1CO 2CO GAL EPH PHI COL 1TH 2TH 1TI 2TI '
         'TIT PHM HEB JAM 1PE 2PE 1JO 2JO 3JO JUD REV').split()


def main(src):
    index = json.load(open(os.path.join(ROOT, 'data/bible/index.json'), encoding='utf-8'))
    got = {}
    for line in open(src, encoding='utf-8-sig'):
        m = re.match(r'^(\w+) (\d+):(\d+) ?(.*)$', line.rstrip('\n'))
        if not m:
            continue
        got.setdefault(m.group(1), {}).setdefault(int(m.group(2)), {})[int(m.group(3))] = m.group(4).strip()
    out = os.path.join(ROOT, 'data/bible/web')
    os.makedirs(out, exist_ok=True)
    joined = blank = 0
    for b, code in zip(index['books'], CODES):
        chs = []
        for ci, count in enumerate(b['chapterVerses']):
            have = got.get(code, {}).get(ci + 1, {})
            vs = [have.get(v, '') for v in range(1, count + 1)]
            extra = [have[v] for v in sorted(have) if v > count]
            if extra:
                joined += len(extra)
                vs[-1] = ' '.join([vs[-1]] + extra).strip()
            blank += sum(1 for v in vs if not v)
            chs.append(vs)
        # A WEB CHAPTER THE KJV DOES NOT HAVE would be lost silently; there are none, and this says so if one comes.
        for c in got.get(code, {}):
            if c > b['chapters']:
                print('WARNING: WEB has', code, c, 'beyond the KJV chapters', file=sys.stderr)
        head = json.dumps({'book': b['book'], 'translation': 'WEB'}, ensure_ascii=False)
        body = head[:-1] + ', "chapters": [\n' + ',\n'.join(json.dumps(c, ensure_ascii=False) for c in chs) + '\n]}\n'
        with open(os.path.join(out, b['file']), 'w', encoding='utf-8') as f:
            f.write(body)
    print('66 books written;', joined, 'WEB verses joined onto a KJV last verse;', blank, 'KJV verses with no WEB text')


if __name__ == '__main__':
    main(sys.argv[1])
