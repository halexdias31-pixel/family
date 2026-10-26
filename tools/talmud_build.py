"""Builds data/talmud/ from the Sefaria export (docs/history/473). Data only: reads JSON, runs nothing from it.
Usage: python3 -I tools/talmud_build.py <export dir with g/ r/ t/ and sx/books.json> <repo>"""
import json, os, re, sys

SRC, REPO = sys.argv[1], sys.argv[2]
OUT = os.path.join(REPO, 'data', 'talmud')
CHUNK = 10  # dafim per file
SEDARIM = ['Seder Zeraim', 'Seder Moed', 'Seder Nashim', 'Seder Nezikin', 'Seder Kodashim', 'Seder Tahorot']
ORDER = ['Berakhot', 'Shabbat', 'Eruvin', 'Pesachim', 'Rosh Hashanah', 'Yoma', 'Sukkah', 'Beitzah', 'Taanit', 'Megillah',
         'Moed Katan', 'Chagigah', 'Yevamot', 'Ketubot', 'Nedarim', 'Nazir', 'Sotah', 'Gittin', 'Kiddushin', 'Bava Kamma',
         'Bava Metzia', 'Bava Batra', 'Sanhedrin', 'Makkot', 'Shevuot', 'Avodah Zarah', 'Horayot', 'Zevachim', 'Menachot',
         'Chullin', 'Bekhorot', 'Arakhin', 'Temurah', 'Keritot', 'Meilah', 'Tamid', 'Niddah']
# ONLY THESE VERSIONS AND LICENCES (473): never CC-BY-NC (Koren/Steinsaltz), never an unknown licence, no English.
WANT = {'g': ({'Wikisource Talmud Bavli'}, {'CC-BY-SA'}),
        'r': ({'Vilna Edition', 'WikiSource Rashi'}, {'Public Domain', 'CC-BY-SA'}),
        't': ({'Vilna Edition'}, {'Public Domain', 'CC-BY-SA'})}
LIC = {}
TAG = re.compile(r'<(/?)([a-z]+)[^>]*>')

def clean(s):
    s = str(s or '')
    s = TAG.sub(lambda m: m.group(0) if m.group(2) in ('big', 'strong', 'br') and len(m.group(0)) <= 9 else '', s)
    return s.replace('‏', '').strip()

def plain(s):
    return re.sub(r'\s+', ' ', TAG.sub('', s)).strip()

def load(k, name):
    p = os.path.join(SRC, k, name + '.json')
    if not os.path.exists(p):
        return None
    d = json.load(open(p, encoding='utf-8'))
    v, lic = WANT[k]
    assert d['versionTitle'] in v and d.get('license') in lic, (k, name, d['versionTitle'], d.get('license'))
    LIC[(k, name)] = {'version': d['versionTitle'], 'license': d['license'], 'source': d.get('versionSource', '')}
    return d

def bold_(segs):
    for s in segs:
        for m in re.finditer(r'<strong>([^<]+)</strong>', s):
            w = plain(m.group(1))
            if w and not re.match(r'^(מתני|גמ|הדרן)', w):
                return w
    return ''

books = json.load(open(os.path.join(SRC, 'sx', 'books.json'), encoding='utf-8'))['books']
seder = {b['title']: b['categories'][2] for b in books if b['categories'][:2] == ['Talmud', 'Bavli'] and len(b['categories']) == 3}
os.makedirs(OUT, exist_ok=True)
index = []
for name in ORDER:
    g, r, t = load('g', name), load('r', name), load('t', name)
    G = g['text']
    R = r['text'] if r else []
    T = t['text'] if t else []
    have = [i for i, a in enumerate(G) if any(plain(s) for s in a)]
    first, last = have[0], have[-1]
    chapters, start = [], first
    for i in range(first, last + 1):
        segs = G[i] if i < len(G) else []
        for j, s in enumerate(segs):
            m = re.search(r'הדרן עלך\s*([^<]+)', s)
            if m:
                rest = any(plain(x) for x in segs[j + 1:])
                nm = re.sub(r'\s*וסליק.*$', '', plain(m.group(1))).rstrip(':.')
                nm = re.sub(r'^פרק\s+', '', nm)
                if nm.startswith('מסכת'):
                    nm = ''
                chapters.append({'he': nm or bold_(G[start]), 'from': start})
                start = i if rest else i + 1
    if start <= last:
        # THE LAST CHAPTER WHEN NO HADRAN CLOSES IT: named by its first bold words, as chapters are.
        chapters.append({'he': bold_(G[start]) or '—', 'from': start})
    slug = name.lower().replace(' ', '-')
    os.makedirs(os.path.join(OUT, slug), exist_ok=True)
    for f in os.listdir(os.path.join(OUT, slug)):
        os.remove(os.path.join(OUT, slug, f))
    files = {}
    empty = []
    for i in range(first, last + 1):
        g_ = [clean(s) for s in (G[i] if i < len(G) else [])]
        g_ = [s for s in g_ if s]
        if not g_:
            empty.append(i)
        rr = [[clean(c) for c in (line or []) if clean(c)] for line in (R[i] if i < len(R) else [])]
        tt = [[clean(c) for c in (line or []) if clean(c)] for line in (T[i] if i < len(T) else [])]
        rr = [c for line in rr for c in line]
        tt = [c for line in tt for c in line]
        k = (i // 2 + 1) // CHUNK
        files.setdefault(k, {})[str(i)] = {'g': g_, 'r': rr, 't': tt}
    for k, amudim in files.items():
        with open(os.path.join(OUT, slug, '%d.json' % k), 'w', encoding='utf-8') as fh:
            json.dump({'tractate': name, 'amudim': amudim}, fh, ensure_ascii=False, separators=(',', ':'))
    index.append({'slug': slug, 'en': name, 'he': g['heTitle'], 'seder': seder[name].replace('Seder ', ''),
                  'first': first, 'last': last, 'empty': empty, 'rashi': bool(r), 'tosafot': bool(t),
                  'licences': {k: LIC[(k, name)] for k in 'grt' if (k, name) in LIC},
                  'chapters': chapters})
json.dump({'edition': 'Vilna (Romm), 1880-1886', 'chunk': CHUNK, 'sedarim': [s.replace('Seder ', '') for s in SEDARIM],
           'tractates': index}, open(os.path.join(OUT, 'index.json'), 'w', encoding='utf-8'),
          ensure_ascii=False, separators=(',', ':'))
print('tractates', len(index), 'amudim', sum(t['last'] - t['first'] + 1 for t in index),
      'chapters', sum(len(t['chapters']) for t in index), 'empty', sum(len(t['empty']) for t in index))
