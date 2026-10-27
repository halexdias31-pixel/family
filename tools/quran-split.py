#!/usr/bin/env python3
"""Writes data/quran/ (490): the Arabic (Tanzil Simple 1.1, CC BY 3.0, verbatim) and Pickthall's English (1930, public domain in
the UK since 2007) as one index and one file a surah, fetched by the site only when a Quran card is drawn.

  python3 -I tools/quran-split.py <tanzil quran-simple.txt (txt-2, "s|a|text")> <alquran.cloud en.pickthall.json> <alquran.cloud meta.json>
"""
import json, os, sys

ar_path, en_path, meta_path = sys.argv[1:4]
out = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data', 'quran')
os.makedirs(out, exist_ok=True)

ar, notice = {}, []
for line in open(ar_path, encoding='utf-8'):
    line = line.rstrip('\n')
    if line.startswith('#'):
        notice.append(line)
        continue
    if not line.strip():
        continue
    s, a, t = line.split('|', 2)
    ar.setdefault(int(s), {})[int(a)] = t
en_doc = json.load(open(en_path, encoding='utf-8'))['data']
meta = json.load(open(meta_path, encoding='utf-8'))['data']

surahs = []
for s in en_doc['surahs']:
    n = s['number']
    ayahs = s['ayahs']
    assert len(ayahs) == len(ar[n]), n
    juz = [x['juz'] for x in ayahs]
    with open(os.path.join(out, '%03d.json' % n), 'w', encoding='utf-8') as f:
        json.dump({'n': n, 'notice': 'Arabic: Tanzil Quran Text (Simple, Version 1.1), Copyright (C) 2007-2026 Tanzil Project, CC BY 3.0, verbatim; https://tanzil.net. English: Pickthall (1930), public domain. See data/quran/LICENSE.', 'ar': [ar[n][i + 1] for i in range(len(ayahs))], 'en': [x['text'] for x in ayahs]}, f, ensure_ascii=False, separators=(',', ':'))
    surahs.append({'n': n, 'name': s['englishName'], 'meaning': s['englishNameTranslation'], 'ar': s['name'],
                   'place': s['revelationType'], 'ayahs': len(ayahs),
                   # THE JUZ OF EVERY AYAH, as runs [juz, from-ayah]: the tags need it before the text is fetched.
                   'juz': [[j, i + 1] for i, j in enumerate(juz) if i == 0 or juz[i - 1] != j]})

sajda = [[x['surah'], x['ayah']] for x in meta['sajdas']['references']]
index = {
    'name': 'The Quran',
    'arabic': {'text': 'Tanzil Quran Text (Simple, Version 1.1)', 'licence': 'CC BY 3.0, verbatim copies only',
               'source': 'https://tanzil.net'},
    'english': {'text': 'The Meaning of the Glorious Koran, Marmaduke Pickthall (1930)',
                'licence': 'Public domain in the UK (the translator died in 1936)',
                'source': 'https://alquran.cloud (edition en.pickthall)'},
    'totals': {'surahs': len(surahs), 'ayahs': sum(x['ayahs'] for x in surahs)},
    'sajda': sajda,
    'surahs': surahs,
}
with open(os.path.join(out, 'index.json'), 'w', encoding='utf-8') as f:
    json.dump(index, f, ensure_ascii=False, separators=(',', ':'))
with open(os.path.join(out, 'LICENSE'), 'w', encoding='utf-8') as f:
    f.write('data/quran/NNN.json "ar": the Tanzil Quran Text, copied verbatim, one verse per array entry. Its notice:\n\n')
    f.write('\n'.join(notice).strip() + '\n\n')
    f.write('data/quran/NNN.json "en": Marmaduke Pickthall, The Meaning of the Glorious Koran (1930). Pickthall died in 1936,\n'
            'so the translation has been public domain in the UK since 1 January 2007 (life + 70 years). Text via alquran.cloud.\n')
print('wrote', len(surahs), 'surahs,', index['totals']['ayahs'], 'ayahs')
