# Every person's 8-bit portrait, written into data/portraits.json (batch D, owner 6 Nov).
#
# "One people kind for everyone ... an 8-bit pixel portrait, tags on top, nothing else." Boxers and historical
# figures are drawn by the same drawer from simple cues (skin, hair, facial hair, hat, outfit); a fight's corner
# with no boxer row (a name only) gets a portrait too, keyed `name:<name>`. Stylised, never a photo.
#
# THE SCRIPT IS THE SOURCE, THE FILE ITS OUTPUT: change a cue here and re-run (`python3 tools/people_pix.py`),
# never edit data/portraits.json by hand. Each row: id, name, px (16 strings of 16 palette letters, '.' is empty).
# The letters' colours are tokens in style.css (`.pp-<letter>`); js/find-boxers.js `personPic_` draws them.
import json, os, sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
N = 16
SKIN = {'s1': '1', 's2': '2', 's3': '3', 's4': '4', 's5': '5', 's6': '6'}
HAIR_C = {'black': 'B', 'dark-brown': 'D', 'brown': 'N', 'light-brown': 'L', 'blond': 'Y', 'red': 'R', 'grey': 'G', 'white': 'W'}
KIT_C = {'black': 'b', 'white': 'w', 'red': 'r', 'maroon': 'm', 'blue': 'u', 'navy': 'n', 'sky': 'c', 'green': 'g', 'gold': 'y',
         'yellow': 'y', 'orange': 'a', 'purple': 'p', 'pink': 'f', 'silver': 's', 'grey': 's', 'tan': 'e', 'leopard': 'y'}

def runs(spec):
    """'3:5-10,12 4:6' -> [(x, y)]: the same row-run notation as the ring figure in js/find-boxers.js."""
    out = []
    for row in spec.split():
        y, xs = row.split(':')
        for r in xs.split(','):
            a, _, b = r.partition('-')
            out += [(x, int(y)) for x in range(int(a), int(b or a) + 1)]
    return out

HEAD = '3:6-9 4:5-10 5:5-10 6:5-11 7:5-10 8:5-10 9:6-9 10:7-8'
EYE = '5:9'
TORSO = '11:3-12 12:2-13 13:1-14 14:1-14 15:1-14'
HAIR = {
    'bald': '5:5 6:5', 'shaved': '', 'none': '',
    'short': '2:6-9 3:5-10 4:5-6 5:5', 'crop-top': '2:6-9 3:5-10 4:5-6 5:5',
    'slicked': '2:6-10 3:5-10 4:5-6 5:5 6:5',
    'parting': '2:6-10 3:5-10 4:5-6,8-10 5:5,10',
    'wavy': '1:7-9 2:5-10 3:4-10 4:4-6 5:4-5 6:4-5', 'curly': '1:6-9 2:5-10 3:4-10 4:4-6 5:4-5 6:4-5',
    'long': '2:6-9 3:5-10 4:4-6 5:4-5 6:4-5 7:4-5 8:4-5 9:4-5 10:4-5',
    'afro': '0:6-9 1:5-10 2:4-11 3:4-11 4:4-6 5:4-5 6:4-5 7:4-5',
    'ponytail': '2:6-9 3:5-10 4:3-6 5:3,5 6:3 7:3',
    'dreads': '2:6-9 3:4-10 4:4,6 5:4,6 6:4 7:4 8:4', 'cornrows': '2:6-9 3:5,7,9 4:5 5:5',
    'bun': '1:4-5 2:4-9 3:5-10 4:5-6 5:5 6:5',
}
FACE = {
    'none': '', '': '', 'moustache': '7:9-10', 'toothbrush': '7:10', 'walrus': '7:8-11',
    'goatee': '7:9-10 8:9-10 9:9', 'beard': '6:6 7:6-10 8:6-10 9:6-9', 'stubble': '7:6,8,10 8:7,9 9:6,8',
    'sideburns': '5:6 6:6', 'long-beard': '6:6 7:6-10 8:6-10 9:6-10 10:6-10 11:7-9 12:8',
}
HATS = {  # (letter, spec); drawn after the hair
    'laurel': ('g', '2:5-6,9-10 3:5,10'), 'crown': ('y', '1:6,8,10 2:5-10 3:5-10'),
    'mitre': ('y', '0:7-8 1:6-9 2:5-10 3:5-10'), 'kamilavka': ('b', '0:5-10 1:5-10 2:5-10 3:5-10 4:4 5:4 6:4 7:4 8:4 9:4 10:4'),
    'klobuk': ('w', '0:5-10 1:5-10 2:5-10 3:5-10 4:4 5:4 6:4 7:4 8:4 9:4 10:3-4'), 'skufia': ('b', '2:6-9 3:5-10'),
    'beret': ('b', '1:6-10 2:5-11 3:5-9'), 'cap': ('b', '2:5-10 3:4-11'), 'turban': ('w', '1:6-9 2:5-10 3:5-10 4:5-6'),
    'hood': (None, '1:6-9 2:5-10 3:4-10 4:4-5 5:4-5 6:4-5 7:4-5 8:4-5 9:4-5 10:3-5'),
}
HAT_MARK = {'mitre': ('r', '1:7 2:7'), 'klobuk': ('y', '1:7'), 'beret': ('y', '2:9')}

def outfit(g, kind, c, c2, skin):
    for x, y in runs(TORSO):
        g[y][x] = skin if kind == 'boxer' else c
    if kind == 'suit':
        for x, y in runs('11:6-9'): g[y][x] = 'w'
        for x, y in runs('12:7-8 13:7-8 14:7-8'): g[y][x] = c2 or 'r'
    elif kind == 'bowtie':
        for x, y in runs('12:7-8 13:7-8 14:7-8'): g[y][x] = 'w'
        for x, y in runs('11:6,9'): g[y][x] = c2 or 'b'
    elif kind == 'uniform':
        for x, y in runs('13:3 13:4 14:3'): g[y][x] = 'r'
        for x, y in runs('14:4 12:8 14:8'): g[y][x] = 'y'
    elif kind == 'vestments':
        for x, y in runs('12:2-13 13:2-5,10-13 14:3-5,10-12'): g[y][x] = 'w'
        for x, y in runs('12:4,11 13:3-5,10-12 14:4,11'): g[y][x] = 'k'
    elif kind == 'toga':
        for x, y in runs('11:10-11 12:9-10 13:7-8 14:5-6 15:3-4'): g[y][x] = c2 or 'p'
    elif kind == 'cloak':
        for x, y in runs('12:7-8 13:7-8 14:7-8 15:7-8'): g[y][x] = 'w'
        g[11][9] = 'y'
    elif kind == 'gown':
        for x, y in runs('11:7-8 12:7-8'): g[y][x] = 'w'
    elif kind == 'dress':
        for x, y in runs('11:5-10'): g[y][x] = 'w'
        g[12][8] = 'y'
    elif kind == 'boxer':
        for x, y in runs('10:11-13 11:10-14 12:10-14 13:11-13 13:2-4 14:1-5 15:1-5'): g[y][x] = c or 'r'

def draw(look):
    g = [['.'] * N for _ in range(N)]
    skin = SKIN.get(look.get('skin', ''), '2')
    hc = HAIR_C.get(look.get('hair_colour', ''), 'D')
    fc = HAIR_C.get(look.get('facial_colour', ''), hc)
    outfit(g, look.get('outfit', 'suit'), look.get('colour', 'n'), look.get('colour2', ''), skin)
    for x, y in runs(HEAD): g[y][x] = skin
    for x, y in runs(HAIR.get(look.get('hair', 'short'), HAIR['short'])): g[y][x] = hc
    for x, y in runs(FACE.get(look.get('facial', ''), '')): g[y][x] = fc
    for x, y in runs(EYE): g[y][x] = 'k'
    if look.get('glasses'):
        for x, y in runs('5:8-11'): g[y][x] = 'k'
    if look.get('cigar'):
        for x, y in runs('8:10-12'): g[y][x] = 't'
        g[8][13] = 'a'
    hat = look.get('hat')
    if hat in HATS:
        c, spec = HATS[hat]
        for x, y in runs(spec): g[y][x] = c or look.get('colour', 'b')
        if hat in HAT_MARK:
            m, s = HAT_MARK[hat]
            for x, y in runs(s): g[y][x] = m
    return [''.join(r) for r in g]

# THE FIGURES' CUES: what a picture of each is known by — hair, beard, hat, dress. Facts only, no likeness traced.
BISHOP = dict(outfit='vestments', colour='y', hair='bald', facial='long-beard', hair_colour='grey')
MONK = dict(outfit='robe', colour='b', hat='hood', facial='long-beard', hair_colour='grey')
FIG = {
    'Winston Churchill': dict(skin='s1', hair='bald', hair_colour='light-brown', outfit='bowtie', colour='b', colour2='u', cigar=1),
    'Julius Caesar': dict(skin='s2', hair='short', hair_colour='brown', hat='laurel', outfit='toga', colour='w', colour2='p'),
    'Clement of Rome': dict(BISHOP, hair_colour='white'),
    'Adolf Hitler': dict(skin='s1', hair='parting', hair_colour='dark-brown', facial='toothbrush', outfit='uniform', colour='t'),
    'Franklin D. Roosevelt': dict(skin='s1', hair='slicked', hair_colour='grey', glasses=1, outfit='suit', colour='n', colour2='u'),
    'Joseph Stalin': dict(skin='s2', hair='slicked', hair_colour='black', facial='walrus', outfit='uniform', colour='o'),
    'Harry S. Truman': dict(skin='s1', hair='short', hair_colour='grey', glasses=1, outfit='suit', colour='s', colour2='n'),
    'Dwight D. Eisenhower': dict(skin='s1', hair='bald', hair_colour='light-brown', outfit='uniform', colour='o'),
    'Bernard Montgomery': dict(skin='s1', hair='short', hair_colour='grey', facial='moustache', hat='beret', outfit='uniform', colour='e'),
    'Ptolemy II Philadelphus': dict(skin='s3', hair='curly', hair_colour='black', hat='crown', outfit='toga', colour='w', colour2='u'),
    'Antony the Great': dict(MONK, colour='t', facial_colour='white'),
    'Cyprian of Carthage': dict(BISHOP, colour='r', hair='short', hair_colour='black', facial='beard'),
    'Eusebius of Caesarea': dict(BISHOP, hat='mitre'),
    'Constantine the Great': dict(skin='s2', hair='short', hair_colour='brown', hat='crown', outfit='cloak', colour='p'),
    'Athanasius of Alexandria': dict(BISHOP, colour='w', facial='beard', hair_colour='white'),
    'Basil the Great': dict(BISHOP, hair='short', hair_colour='black'),
    'Gregory the Theologian': dict(BISHOP, hair_colour='white'),
    'Gregory of Nyssa': dict(BISHOP, colour='r'),
    'John Chrysostom': dict(BISHOP, hair_colour='brown', facial='beard'),
    'Socrates Scholasticus': dict(skin='s2', hair='short', hair_colour='brown', facial='beard', outfit='robe', colour='c'),
    'Sozomen': dict(skin='s3', hair='short', hair_colour='black', facial='beard', outfit='robe', colour='g'),
    'Theodoret of Cyrrhus': dict(BISHOP, hair='short', hair_colour='black', facial='beard', colour='r'),
    'Cyril of Alexandria': dict(BISHOP, hat='hood', colour='w'),
    'Pseudo-Dionysius the Areopagite': dict(BISHOP, colour='w', hair_colour='white'),
    'John Climacus': dict(MONK, colour='t'),
    'Maximus the Confessor': dict(MONK, colour='t', facial_colour='white'),
    'John of Damascus': dict(skin='s3', hat='turban', facial='long-beard', hair_colour='grey', outfit='robe', colour='t'),
    'Photius the Great': dict(BISHOP, hat='mitre', hair_colour='dark-brown'),
    'Cyril, Apostle to the Slavs': dict(MONK, facial='beard', hair_colour='dark-brown'),
    'Methodius, Apostle to the Slavs': dict(BISHOP, hat='mitre'),
    'Vladimir the Great': dict(skin='s1', hair='long', hair_colour='brown', facial='beard', hat='crown', outfit='cloak', colour='r'),
    'Symeon the New Theologian': dict(MONK, facial='beard', hair_colour='dark-brown'),
    'Gregory Palamas': dict(BISHOP, hair='short', hair_colour='black', facial='beard'),
    'Mark of Ephesus': dict(BISHOP, hat='kamilavka', colour='b'),
    'Martin Luther': dict(skin='s1', hair='short', hair_colour='dark-brown', hat='cap', outfit='gown', colour='b'),
    'John Calvin': dict(skin='s1', hair='short', hair_colour='brown', facial='long-beard', hat='cap', outfit='gown', colour='b'),
    'Job of Moscow': dict(BISHOP, hat='klobuk', colour='b'),
    'Nikodemos the Hagiorite': dict(MONK, hat='skufia', hair_colour='dark-brown'),
    'Philip Schaff': dict(skin='s1', hair='short', hair_colour='white', facial='beard', outfit='suit', colour='b', colour2='b'),
    'Isabel Florence Hapgood': dict(skin='s1', hair='bun', hair_colour='brown', outfit='dress', colour='n'),
    'Tikhon of Moscow': dict(BISHOP, hat='klobuk', colour='b'),
    'Silouan the Athonite': dict(MONK, hat='skufia'),
    'Sophrony of Essex': dict(MONK, hat='skufia', facial_colour='white'),
    'Athenagoras I of Constantinople': dict(BISHOP, hat='kamilavka', colour='b', hair_colour='white'),
    'Bartholomew I of Constantinople': dict(BISHOP, hat='kamilavka', colour='b', facial='beard'),
    'Nero': dict(skin='s2', hair='curly', hair_colour='red', facial='sideburns', hat='laurel', outfit='toga', colour='w', colour2='p'),
    'Ignatius of Antioch': dict(BISHOP, colour='r', hair_colour='grey'),
    'Polycarp of Smyrna': dict(BISHOP, colour='w', hair_colour='white'),
    'Diocletian': dict(skin='s2', hair='short', hair_colour='grey', facial='beard', hat='laurel', outfit='cloak', colour='p'),
    'Charlemagne': dict(skin='s1', hair='long', hair_colour='white', facial='long-beard', hat='crown', outfit='cloak', colour='u'),
    'Peter the Great': dict(skin='s1', hair='long', hair_colour='dark-brown', facial='moustache', outfit='uniform', colour='g'),
    'Benito Mussolini': dict(skin='s2', hair='bald', hair_colour='black', outfit='uniform', colour='b'),
    'Hirohito': dict(skin='s2', hair='short', hair_colour='black', facial='moustache', glasses=1, outfit='uniform', colour='o'),
}

def main():
    rd = lambda n: json.load(open(os.path.join(ROOT, 'data', n + '.json'), encoding='utf-8'))
    out, missing, seen = [], [], set()
    for b in rd('boxers'):
        trunks = (b.get('trunks_usual') or '').split('/')[0]
        look = dict(skin=b.get('look_skin'), hair=b.get('look_hair') or 'short', hair_colour=b.get('look_hair_colour'),
                    facial=b.get('look_facial'), outfit='boxer', colour=KIT_C.get(trunks, 'r'))
        if (b.get('sex') or '').upper() == 'F' and not b.get('look_hair'): look['hair'] = 'ponytail'
        out.append({'id': b['boxer_id'], 'name': b['name'], 'px': draw(look)}); seen.add(b['name'])
    for f in rd('fights'):  # a corner with no boxer row: a plain fighter, red gloves
        for n in (f.get('boxer_a'), f.get('boxer_b')):
            if n and n not in seen:
                out.append({'id': 'name:' + n, 'name': n, 'px': draw(dict(outfit='boxer', hair='short', colour='r'))}); seen.add(n)
    for p in rd('figures'):
        cue = FIG.get(p['name'])
        if cue is None: missing.append(p['name']); cue = dict(outfit='robe', colour='t')
        out.append({'id': p['id'], 'name': p['name'], 'px': draw(cue)})
    path = os.path.join(ROOT, 'data', 'portraits.json')
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in out) + '\n]\n')
    print('wrote', len(out), 'portraits to data/portraits.json')
    if missing: print('no cues for:', ', '.join(missing)); sys.exit(1)

if __name__ == '__main__':
    main()
