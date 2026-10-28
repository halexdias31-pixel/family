#!/usr/bin/env python3
"""A history-database writing's own words (499): data/works/<WR-id>.json, one entry a chapter, and data/works/index.json.

The owner: "this should be the work itself, in my database, each page can be a widget, treat it how you treat the Talmud".
So far one work, First Clement (WR-0001):
  Greek   First1KGreek tlg1271.tlg001.1st1K-grc1 (Kirsopp Lake's text, The Apostolic Fathers I, 1912 — public domain;
          the TEI transcription is Open Greek and Latin's, CC BY-SA 4.0, credited on every card and in data/works/LICENSE)
          https://raw.githubusercontent.com/OpenGreekAndLatin/First1KGreek/master/data/tlg1271/tlg001/tlg1271.tlg001.1st1K-grc1.xml
  English J. B. Lightfoot's translation (The Apostolic Fathers, 1891; Lightfoot died 1889 — public domain), as CCEL prints it
          https://www.ccel.org/ccel/lightfoot/fathers.ii.i.html

    python3 -I tools/works-text.py first-clement path/to/grc1.xml path/to/fathers.ii.i.html
Lake's apparatus notes (<note>) and Lightfoot's footnote markers are left out; the words are otherwise as printed.
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'works')
GRC_URL = 'https://raw.githubusercontent.com/OpenGreekAndLatin/First1KGreek/master/data/tlg1271/tlg001/tlg1271.tlg001.1st1K-grc1.xml'
EN_URL = 'https://www.ccel.org/ccel/lightfoot/fathers.ii.i.html'


def flat(s):
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()


def greek(path):
    t = open(path, encoding='utf-8').read()
    t = re.sub(r'<note\b[^>]*>.*?</note>', ' ', t, flags=re.S)
    body = t[t.index('<body'):]
    parts = re.split(r'<div type="textpart" subtype="chapter" n="([^"]+)">', body)[1:]
    out = []
    for n, chunk in zip(parts[0::2], parts[1::2]):
        out.append((0 if n == 'preface' else int(n), re.sub(r'\s+([,.;·])', r'\1', flat(chunk))))
    return out


def english(path):
    t = open(path, encoding='utf-8', errors='replace').read()
    t = re.sub(r'<script.*?</script>|<style.*?</style>', '', t, flags=re.S)
    # A FOOTNOTE MARKER is a link to a note; its number would read as part of the sentence.
    t = re.sub(r'<a [^>]*class="[^"]*(?:Note|note)[^"]*"[^>]*>.*?</a>', '', t, flags=re.S)
    t = re.sub(r'<sup\b[^>]*>.*?</sup>', '', t, flags=re.S)
    heads = list(re.finditer(r'<h2[^>]*>\s*1 Clem\. (Prologue|\d+)\s*</h2>', t))
    out = []
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else t.find('« Prev', h.end())
        if end < 0:
            end = len(t)
        seg = t[h.end():end]
        seg = re.split(r'<div class="[^"]*(?:footnote|Notes)[^"]*"', seg)[0]
        txt = flat(seg)
        out.append((0 if h.group(1) == 'Prologue' else int(h.group(1)), txt))
    return out


def main(slug, grc, en):
    assert slug == 'first-clement'
    g, e = dict(greek(grc)), dict(english(en))
    assert sorted(g) == list(range(66)) and sorted(e) == list(range(66)), (sorted(g)[:3], sorted(e)[-3:])
    chapters = [{'n': n, 'say': 'Prologue' if n == 0 else 'Chapter ' + str(n), 'grc': g[n], 'en': e[n]} for n in range(66)]
    work = {'id': 'WR-0001', 'title': 'First Clement', 'languages': ['Greek', 'English'],
            'sources': [{'language': 'Greek', 'text': "Kirsopp Lake's Greek text (The Apostolic Fathers I, 1912)",
                         'via': 'First1KGreek, Open Greek and Latin', 'url': GRC_URL,
                         'licence': 'Text public domain; transcription CC BY-SA 4.0'},
                        {'language': 'English', 'text': "J. B. Lightfoot's translation (The Apostolic Fathers, 1891)",
                         'via': 'CCEL', 'url': EN_URL, 'licence': 'Public domain'}],
            'chapters': chapters}
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'WR-0001.json'), 'w', encoding='utf-8') as f:
        f.write(json.dumps({k: v for k, v in work.items() if k != 'chapters'}, ensure_ascii=False)[:-1]
                + ', "chapters": [\n' + ',\n'.join(json.dumps(c, ensure_ascii=False) for c in chapters) + '\n]}\n')
    index = {'works': [{'id': 'WR-0001', 'title': 'First Clement', 'file': 'WR-0001.json', 'languages': ['Greek', 'English'],
                        'chapters': [c['say'] for c in chapters]}]}
    with open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8') as f:
        f.write(json.dumps(index, ensure_ascii=False) + '\n')
    print('First Clement:', len(chapters), 'chapters,', sum(len(c['grc']) for c in chapters), 'Greek chars,',
          sum(len(c['en']) for c in chapters), 'English chars')


if __name__ == '__main__':
    main(*sys.argv[1:4])
