#!/usr/bin/env python3
"""The Letter of Aristeas (504): data/works/WR-0002.json, one entry a numbered section (1-322), and its row in data/works/index.json.

English: H. T. Andrews' translation, in R. H. Charles (ed.), The Apocrypha and Pseudepigrapha of the Old Testament in English
(Oxford, 1913), as CCEL prints it (http://www.ccel.org/c/charles/otpseudepig/aristeas.htm). Andrews died 1928: public domain.
Thackeray's English and any Greek were left out: the only reachable copies are unproofed scans whose section numbers the OCR loses.

    python3 -I tools/aristeas-text.py path/to/aristeas.htm
CCEL prints each section number in the running text; the split walks 2, 3 … 322 in order, so a number inside a sentence that is
not the next section is left alone. Section 1 is everything before "2".
"""
import html, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data', 'works')
URL = 'http://www.ccel.org/c/charles/otpseudepig/aristeas.htm'


def main(src):
    s = open(src, encoding='latin-1').read()
    s = re.sub(r'(?s)<(style|script|xml)[^>]*>.*?</\1>', '', s)
    s = re.sub(r'(?s)<!--.*?-->', '', s)
    t = re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', s))).strip()
    start = t.index('Since I have collected')
    end = t.index('Scanned and Edited')
    t = t[start:end].strip()
    cuts, at = [0], 0
    for n in range(2, 323):
        m = re.compile(r'(?<![\d\w])' + str(n) + r'(?![\d\w])').search(t, at)
        if not m:
            sys.exit('section %d not found' % n)
        cuts.append(m.start()); at = m.end()
    cuts.append(len(t))
    secs = []
    for i in range(322):
        a, b = cuts[i], cuts[i + 1]
        txt = t[a:b].strip()
        if i:
            txt = re.sub(r'^\d+\s*', '', txt)
        secs.append({'n': i + 1, 'say': '§' + str(i + 1), 'en': txt})
    work = {'id': 'WR-0002', 'title': 'Letter of Aristeas', 'languages': ['English'], 'says': {'English': 'English (Andrews)'}, 'unit': 'section',
            'sources': [{'language': 'English', 'text': "H. T. Andrews' translation (in R. H. Charles, Apocrypha and Pseudepigrapha of the OT, 1913)",
                         'via': 'CCEL', 'url': URL, 'licence': 'Public domain'}],
            'chapters': secs}
    json.dump(work, open(os.path.join(OUT, 'WR-0002.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    ixp = os.path.join(OUT, 'index.json')
    ix = json.load(open(ixp, encoding='utf-8'))
    ix['works'] = [w for w in ix['works'] if w['id'] != 'WR-0002'] + [{
        'id': 'WR-0002', 'title': 'Letter of Aristeas', 'file': 'WR-0002.json', 'languages': ['English'], 'says': {'English': 'English (Andrews)'}, 'unit': 'section',
        'chapters': [c['say'] for c in secs]}]
    json.dump(ix, open(ixp, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('322 sections; shortest', min(len(c['en']) for c in secs), 'longest', max(len(c['en']) for c in secs))


if __name__ == '__main__':
    main(sys.argv[1])
