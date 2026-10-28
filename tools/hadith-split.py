#!/usr/bin/env python3
"""Hadith (504): splits fawazahmed0/hadith-api's Arabic editions (Unlicense) into data/hadith/<collection>/<book>.json and one index.json.

Usage: python3 tools/hadith-split.py <dir holding ara-<collection>.json, as downloaded from
https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-<collection>.min.json>
"""
import json, os, sys

COLLECTIONS = [  # the six books, in their customary order
    ('bukhari', 'Sahih al-Bukhari', 'صحيح البخاري'),
    ('muslim', 'Sahih Muslim', 'صحيح مسلم'),
    ('abudawud', 'Sunan Abi Dawud', 'سنن أبي داود'),
    ('tirmidhi', "Jami' at-Tirmidhi", 'جامع الترمذي'),
    ('nasai', "Sunan an-Nasa'i", 'سنن النسائي'),
    ('ibnmajah', 'Sunan Ibn Majah', 'سنن ابن ماجه'),
]

def num(n):
    return str(int(n)) if n == int(n) else str(n)

def runs(ns):
    """Integer runs as [first, last]; anything else (3.1) as a string."""
    out = []
    for s in ns:
        if s.isdigit() and out and isinstance(out[-1], list) and int(s) == out[-1][1] + 1:
            out[-1][1] = int(s)
        elif s.isdigit():
            out.append([int(s), int(s)])
        else:
            out.append(s)
    return out

def main(src):
    root = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'hadith')
    index = {'name': 'Hadith', 'language': 'Arabic', 'collections': []}
    for cid, en, ar in COLLECTIONS:
        d = json.load(open(os.path.join(src, 'ara-' + cid + '.json'), encoding='utf-8'))
        secs = d['metadata']['sections']
        books = {}
        for h in d['hadiths']:
            t = (h.get('text') or '').strip()
            if not t:
                continue
            b = int(h['reference']['book'])
            books.setdefault(b, []).append([num(h['hadithnumber']), t])
        os.makedirs(os.path.join(root, cid), exist_ok=True)
        out = []
        for b in sorted(books):
            hs = books[b]
            name = (secs.get(str(b)) or '').strip() or 'Introduction'
            f = cid + '/' + str(b).zfill(3) + '.json'
            json.dump({'c': cid, 'b': b, 'h': hs}, open(os.path.join(root, f), 'w', encoding='utf-8'),
                      ensure_ascii=False, separators=(',', ':'))
            out.append({'n': b, 'name': name, 'file': f, 'count': len(hs), 'nums': runs([x[0] for x in hs])})
        index['collections'].append({'id': cid, 'name': en, 'ar': ar, 'books': out})
    json.dump(index, open(os.path.join(root, 'index.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

if __name__ == '__main__':
    main(sys.argv[1])
