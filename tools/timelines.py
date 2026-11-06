#!/usr/bin/env python3
"""The timelines (1040 batch F): each one an animation that pans along its span from event to event, a pixel scene per event.

The owner: "not a boring list ... an animation which took the user to see, e.g., church history from the beginning to current
day, or timelines which already finished like World War II, World War I, Old Testament ... malleable: some more zoomed in,
some covering a long span." This script is the source of two things; re-run it, never hand-edit what it writes (rule 13):
  data/timeline.json   the events of the eras it owns (World War 1, Old Testament, Roman Empire, Space Race), ids fixed here;
                       the Church History era is tools/church-history.py's, the World War 2 rows the sheet's.
  data/timelines.json  one row per timeline: its window (years on screen at once), unit (how the axis counts), and its
                       events by id with a 2-5 word caption and a 16x16 scene (tools/tl_icons.py). Dates and facts are read
                       from the event rows by the app, so a fact lives once.
    python3 tools/timelines.py
"""
import json, os, sys
from urllib.parse import quote

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from tl_icons import D as ICON  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


def wp(*titles):
    return ' | '.join('https://en.wikipedia.org/wiki/' + quote(t.replace(' ', '_'), safe="_(),'") for t in titles)


TRAD = 'traditional biblical chronology (early date); approximate'
# ---------- THE EVENTS THIS SCRIPT OWNS: id, name, from, to, iso, iso_to, said, basis, places, theatre, summary, sources
EV = {
    'World War 1': [
        ('EV-0201', 'Archduke Franz Ferdinand assassinated', 1914, 1914, '1914-06-28', '', '28 June 1914', 'documented', 'Sarajevo', 'Balkans',
         'Gavrilo Princip shoots the heir to Austria-Hungary and his wife in Sarajevo; the July Crisis follows.', wp('Assassination of Archduke Franz Ferdinand')),
        ('EV-0202', 'Austria-Hungary declares war on Serbia', 1914, 1914, '1914-07-28', '', '28 July 1914', 'documented', 'Vienna | Belgrade', 'Balkans',
         'A month after Sarajevo, Austria-Hungary declares war; the alliances pull Russia, Germany and France in within days.', wp('July Crisis')),
        ('EV-0203', 'Britain declares war on Germany', 1914, 1914, '1914-08-04', '', '4 August 1914', 'documented', 'London | Belgium', 'Western Front',
         'Germany invades neutral Belgium on the way to France, and Britain declares war.', wp('United Kingdom declaration of war on Germany (1914)')),
        ('EV-0204', 'First Battle of the Marne', 1914, 1914, '1914-09-06', '1914-09-12', '6–12 September 1914', 'documented', 'Marne, France', 'Western Front',
         'The French and British stop the German advance on Paris; both sides dig in and trench warfare begins.', wp('First Battle of the Marne')),
        ('EV-0205', 'The Christmas truce', 1914, 1914, '1914-12-24', '1914-12-26', '24–26 December 1914', 'documented', 'Flanders', 'Western Front',
         'Along parts of the Western Front soldiers stop fighting for Christmas, meet in no man\'s land and exchange gifts.', wp('Christmas truce')),
        ('EV-0206', 'Gallipoli landings', 1915, 1916, '1915-04-25', '1916-01-09', '25 April 1915 – 9 January 1916', 'documented', 'Gallipoli, Ottoman Empire', 'Gallipoli',
         'Allied troops, many from Australia and New Zealand, land on the Gallipoli peninsula; the campaign fails and they withdraw.', wp('Gallipoli campaign')),
        ('EV-0207', 'The Lusitania sunk', 1915, 1915, '1915-05-07', '', '7 May 1915', 'documented', 'Off Ireland', 'At sea',
         'A German U-boat sinks the liner Lusitania; nearly 1,200 die, 128 of them American, and opinion in the USA turns.', wp('Sinking of the RMS Lusitania')),
        ('EV-0208', 'Battle of Verdun', 1916, 1916, '1916-02-21', '1916-12-18', '21 February – 18 December 1916', 'documented', 'Verdun, France', 'Western Front',
         'The longest battle of the war; France holds Verdun at a terrible cost to both sides.', wp('Battle of Verdun')),
        ('EV-0209', 'Battle of Jutland', 1916, 1916, '1916-05-31', '1916-06-01', '31 May – 1 June 1916', 'documented', 'North Sea', 'At sea',
         'The British and German fleets meet in the war\'s biggest sea battle; the German fleet stays in port afterwards.', wp('Battle of Jutland')),
        ('EV-0210', 'Battle of the Somme', 1916, 1916, '1916-07-01', '1916-11-18', '1 July – 18 November 1916', 'documented', 'Somme, France', 'Western Front',
         'The British army loses about 57,000 men on the first day; the battle gains a few miles in five months.', wp('Battle of the Somme')),
        ('EV-0211', 'Tanks go into battle', 1916, 1916, '1916-09-15', '', '15 September 1916', 'documented', 'Flers–Courcelette, France', 'Western Front',
         'British tanks are used in battle for the first time, at Flers–Courcelette during the Somme.', wp('Battle of Flers–Courcelette')),
        ('EV-0212', 'The USA declares war on Germany', 1917, 1917, '1917-04-06', '', '6 April 1917', 'documented', 'Washington, D.C.', 'Western Front',
         'After unrestricted U-boat warfare and the Zimmermann telegram, the United States enters the war.', wp('American entry into World War I')),
        ('EV-0213', 'Battle of Passchendaele', 1917, 1917, '1917-07-31', '1917-11-10', '31 July – 10 November 1917', 'documented', 'Ypres, Belgium', 'Western Front',
         'The Third Battle of Ypres, fought in deep mud; the village of Passchendaele is taken in November.', wp('Battle of Passchendaele')),
        ('EV-0214', 'The Bolsheviks take power in Russia', 1917, 1917, '1917-11-07', '', '7 November 1917 (25 October, old style)', 'documented', 'Petrograd', 'Eastern Front',
         'Lenin\'s Bolsheviks seize power in the October Revolution and seek peace with Germany.', wp('October Revolution')),
        ('EV-0215', 'Treaty of Brest-Litovsk', 1918, 1918, '1918-03-03', '', '3 March 1918', 'documented', 'Brest-Litovsk', 'Eastern Front',
         'Soviet Russia makes peace with Germany, giving up large lands, and leaves the war.', wp('Treaty of Brest-Litovsk')),
        ('EV-0216', 'The German Spring Offensive', 1918, 1918, '1918-03-21', '1918-07-18', '21 March – 18 July 1918', 'documented', 'France | Belgium', 'Western Front',
         'Germany\'s last great attack in the west gains ground fast but cannot break through.', wp('German spring offensive')),
        ('EV-0217', 'The Hundred Days Offensive', 1918, 1918, '1918-08-08', '1918-11-11', '8 August – 11 November 1918', 'documented', 'Amiens, France', 'Western Front',
         'Starting at Amiens, the Allies push the German army back in a run of victories to the end of the war.', wp('Hundred Days Offensive')),
        ('EV-0218', 'The Armistice', 1918, 1918, '1918-11-11', '', '11 November 1918', 'documented', 'Compiègne, France', 'Western Front',
         'Germany signs the armistice in a railway carriage; the guns fall silent at 11 o\'clock.', wp('Armistice of 11 November 1918')),
        ('EV-0219', 'Treaty of Versailles', 1919, 1919, '1919-06-28', '', '28 June 1919', 'documented', 'Versailles, France', 'Peace',
         'The peace treaty with Germany is signed five years to the day after Sarajevo.', wp('Treaty of Versailles')),
    ],
    'Old Testament': [
        ('EV-0301', 'The call of Abraham', -2091, -2091, '-2091-01-01', '', 'c. 2091 BC (traditional)', TRAD, 'Ur | Haran | Canaan', 'Patriarchs',
         'God calls Abram to leave his country for the land he will show him, promising to make of him a great nation (Genesis 12).', wp('Abraham')),
        ('EV-0302', "Jacob's family settles in Egypt", -1876, -1876, '-1876-01-01', '', 'c. 1876 BC (traditional)', TRAD, 'Egypt', 'Patriarchs',
         'In famine Jacob and his sons go down to Egypt, where Joseph rules under Pharaoh (Genesis 46).', wp('Joseph (Genesis)')),
        ('EV-0303', 'The Exodus from Egypt', -1446, -1446, '-1446-01-01', '', 'c. 1446 BC (early date; many scholars say c. 1250 BC)', TRAD, 'Egypt | Red Sea', 'Exodus',
         'Moses leads the Israelites out of slavery in Egypt through the sea (Exodus 12–14).', wp('The Exodus')),
        ('EV-0304', 'The Law given at Sinai', -1446, -1446, '-1446-01-01', '', 'c. 1446 BC (traditional)', TRAD, 'Mount Sinai', 'Exodus',
         'At Sinai God gives the Ten Commandments and makes his covenant with Israel (Exodus 19–20).', wp('Ten Commandments')),
        ('EV-0305', 'Joshua leads Israel into Canaan', -1406, -1406, '-1406-01-01', '', 'c. 1406 BC (traditional)', TRAD, 'Jericho | Canaan', 'Conquest',
         'After forty years in the wilderness Israel crosses the Jordan and Jericho falls (Joshua 3–6).', wp('Joshua')),
        ('EV-0306', 'Saul anointed the first king', -1050, -1050, '-1050-01-01', '', 'c. 1050 BC', 'approximate', 'Israel', 'Kingdom',
         'Samuel anoints Saul as Israel\'s first king (1 Samuel 10).', wp('Saul')),
        ('EV-0307', 'David king in Jerusalem', -1003, -1003, '-1003-01-01', '', 'c. 1000 BC', 'approximate', 'Jerusalem', 'Kingdom',
         'David takes Jerusalem and makes it his capital (2 Samuel 5).', wp('David')),
        ('EV-0308', "Solomon's Temple begun", -966, -966, '-0966-01-01', '', 'c. 966 BC (1 Kings 6:1)', 'approximate', 'Jerusalem', 'Kingdom',
         'Solomon builds the Temple in Jerusalem in the fourth year of his reign (1 Kings 6).', wp("Solomon's Temple")),
        ('EV-0309', 'The kingdom divides', -931, -931, '-0931-01-01', '', 'c. 931 BC', 'approximate', 'Israel | Judah', 'Divided kingdom',
         'After Solomon the ten northern tribes follow Jeroboam (Israel) and the south keeps Rehoboam (Judah) (1 Kings 12).', wp('Kingdom of Israel (united monarchy)')),
        ('EV-0310', 'Assyria takes Samaria', -722, -722, '-0722-01-01', '', '722 BC', 'documented (Assyrian records)', 'Samaria', 'Divided kingdom',
         'The Assyrians capture Samaria and carry the northern kingdom of Israel into exile (2 Kings 17).', wp('Fall of Samaria')),
        ('EV-0311', 'Babylon destroys Jerusalem', -587, -587, '-0587-01-01', '', '587/586 BC', 'documented (Babylonian records)', 'Jerusalem | Babylon', 'Exile',
         'Nebuchadnezzar burns the Temple and takes the people of Judah to Babylon (2 Kings 25).', wp('Siege of Jerusalem (587 BC)')),
        ('EV-0312', 'Cyrus lets the exiles return', -538, -538, '-0538-01-01', '', '538 BC', 'documented (Cyrus Cylinder; Ezra 1)', 'Babylon | Jerusalem', 'Return',
         'Cyrus of Persia, conqueror of Babylon, lets the Jews go home and rebuild the Temple (Ezra 1).', wp('Cyrus the Great', 'Return to Zion')),
        ('EV-0313', 'The Second Temple finished', -516, -516, '-0516-01-01', '', '516/515 BC', 'approximate', 'Jerusalem', 'Return',
         'The rebuilt Temple is dedicated in the sixth year of Darius (Ezra 6).', wp('Second Temple')),
        ('EV-0314', "Nehemiah rebuilds Jerusalem's walls", -445, -445, '-0445-01-01', '', 'c. 445 BC', 'approximate', 'Jerusalem', 'Return',
         'Nehemiah, cupbearer to the Persian king, returns and rebuilds the city walls in 52 days (Nehemiah 6).', wp('Nehemiah')),
    ],
    'Roman Empire': [
        ('EV-0401', 'Julius Caesar assassinated', -44, -44, '-0044-03-15', '', '15 March 44 BC (the Ides of March)', 'documented', 'Rome', 'Rome',
         'Senators stab Caesar to death; the civil wars that follow end the Republic.', wp('Assassination of Julius Caesar')),
        ('EV-0402', 'Octavian becomes Augustus', -27, -27, '-0027-01-16', '', '16 January 27 BC', 'documented', 'Rome', 'Rome',
         'The Senate gives Octavian the name Augustus; he rules as the first emperor.', wp('Augustus')),
        ('EV-0403', 'Battle of the Teutoburg Forest', 9, 9, '0009-09-01', '', 'September AD 9', 'documented (day uncertain)', 'Germania', 'Frontiers',
         'Germanic tribes under Arminius destroy three Roman legions; Rome stops at the Rhine.', wp('Battle of the Teutoburg Forest')),
        ('EV-0404', 'Claudius invades Britain', 43, 43, '0043-01-01', '', 'AD 43', 'documented', 'Britain', 'Frontiers',
         'Four legions land in Britain and it becomes a Roman province.', wp('Roman conquest of Britain')),
        ('EV-0405', 'Vesuvius buries Pompeii', 79, 79, '0079-08-24', '', '24 August AD 79 (the traditional day; perhaps October)', 'documented (day debated)', 'Pompeii | Herculaneum', 'Italy',
         'Mount Vesuvius erupts and buries Pompeii and Herculaneum in ash.', wp('Eruption of Mount Vesuvius in 79 AD')),
        ('EV-0406', 'The empire at its largest', 117, 117, '0117-01-01', '', 'AD 117', 'documented', 'Roman Empire', 'Frontiers',
         'Under Trajan the empire reaches its greatest size, from Britain to Mesopotamia.', wp('Trajan')),
        ('EV-0407', "Hadrian's Wall begun", 122, 122, '0122-01-01', '', 'AD 122', 'documented', 'Northern Britain', 'Frontiers',
         'Hadrian orders a wall across northern Britain to mark and guard the frontier.', wp("Hadrian's Wall")),
        ('EV-0408', 'Caracalla makes free men citizens', 212, 212, '0212-01-01', '', 'AD 212', 'documented', 'Roman Empire', 'Rome',
         'The Constitutio Antoniniana makes almost every free man in the empire a Roman citizen.', wp('Constitutio Antoniniana')),
        ('EV-0409', 'The empire divided East and West', 395, 395, '0395-01-17', '', '17 January 395', 'documented', 'Constantinople | Milan', 'Rome',
         'Theodosius I dies and his sons rule the East and the West; the empire is never one again.', wp('Theodosius I')),
        ('EV-0410', 'The Visigoths sack Rome', 410, 410, '0410-08-24', '0410-08-27', '24–27 August 410', 'documented', 'Rome', 'Italy',
         'Alaric\'s Visigoths sack Rome, the first time in 800 years an enemy has taken the city.', wp('Sack of Rome (410)')),
    ],
    'Space Race': [
        ('EV-0501', 'Sputnik 1 launched', 1957, 1957, '1957-10-04', '', '4 October 1957', 'documented', 'Baikonur', 'Soviet Union',
         'The Soviet Union puts the first artificial satellite into orbit; it beeps round the Earth for three weeks.', wp('Sputnik 1')),
        ('EV-0502', 'Laika orbits the Earth', 1957, 1957, '1957-11-03', '', '3 November 1957', 'documented', 'Baikonur', 'Soviet Union',
         'Sputnik 2 carries the dog Laika, the first animal to orbit the Earth.', wp('Laika')),
        ('EV-0503', 'NASA begins work', 1958, 1958, '1958-10-01', '', '1 October 1958', 'documented', 'Washington, D.C.', 'United States',
         'The United States sets up NASA to run its space programme.', wp('NASA')),
        ('EV-0504', 'Yuri Gagarin, first person in space', 1961, 1961, '1961-04-12', '', '12 April 1961', 'documented', 'Baikonur', 'Soviet Union',
         'Gagarin orbits the Earth once in Vostok 1, in 108 minutes.', wp('Vostok 1')),
        ('EV-0505', 'Kennedy sets the Moon goal', 1961, 1961, '1961-05-25', '', '25 May 1961', 'documented', 'Washington, D.C.', 'United States',
         'President Kennedy asks Congress to land a man on the Moon before the decade is out.', wp('Apollo program')),
        ('EV-0506', 'John Glenn orbits the Earth', 1962, 1962, '1962-02-20', '', '20 February 1962', 'documented', 'Cape Canaveral', 'United States',
         'Glenn, in Friendship 7, is the first American to orbit the Earth.', wp('Mercury-Atlas 6')),
        ('EV-0507', 'Valentina Tereshkova, first woman in space', 1963, 1963, '1963-06-16', '', '16 June 1963', 'documented', 'Baikonur', 'Soviet Union',
         'Tereshkova flies Vostok 6 for almost three days.', wp('Valentina Tereshkova')),
        ('EV-0508', 'The first spacewalk', 1965, 1965, '1965-03-18', '', '18 March 1965', 'documented', 'Earth orbit', 'Soviet Union',
         'Alexei Leonov leaves Voskhod 2 and floats in space for about 12 minutes.', wp('Voskhod 2')),
        ('EV-0509', 'Apollo 8 orbits the Moon', 1968, 1968, '1968-12-24', '', '24 December 1968', 'documented', 'Lunar orbit', 'United States',
         'The first people to leave Earth\'s orbit circle the Moon and photograph Earthrise.', wp('Apollo 8')),
        ('EV-0510', 'Apollo 11 lands on the Moon', 1969, 1969, '1969-07-20', '', '20 July 1969', 'documented', 'Sea of Tranquility', 'United States',
         'Neil Armstrong and Buzz Aldrin walk on the Moon while Michael Collins orbits above.', wp('Apollo 11')),
        ('EV-0511', 'Apollo and Soyuz dock in orbit', 1975, 1975, '1975-07-17', '', '17 July 1975', 'documented', 'Earth orbit', 'Cooperation',
         'An American and a Soviet spacecraft dock and the crews shake hands: the race ends in a handshake.', wp('Apollo–Soyuz')),
    ],
}

# ---------- THE TIMELINES: id, name, era (whose textbook animation its tile opens), window in years, axis unit, events
# (id, scene, caption). A short window is zoomed in (a war, month by month); a long one pans across centuries.
TL = [
    ('church', 'Church history', 'Church History', 300, 'year', [
        ('EV-0027', 'dove', 'The Church is born'), ('EV-0028', 'council', 'Council of Jerusalem'), ('EV-0029', 'fire', "Nero's persecution"),
        ('EV-0030', 'temple', 'The Temple destroyed'), ('EV-0033', 'fire', 'Polycarp martyred'), ('EV-0040', 'cross', 'Edict of Milan'),
        ('EV-0041', 'council', 'Council of Nicaea'), ('EV-0042', 'city', 'Constantinople founded'), ('EV-0045', 'scroll', 'New Testament listed'),
        ('EV-0051', 'council', 'Council of Chalcedon'), ('EV-0053', 'dome', 'Hagia Sophia dedicated'), ('EV-0057', 'icon', 'Iconoclasm begins'),
        ('EV-0061', 'icon', 'Triumph of Orthodoxy'), ('EV-0063', 'book', 'Cyril and Methodius'), ('EV-0066', 'wave', "Baptism of Rus'"),
        ('EV-0068', 'bolt', 'The Great Schism'), ('EV-0070', 'sword', 'Constantinople sacked'), ('EV-0076', 'wall', 'Fall of Constantinople'),
        ('EV-0078', 'scroll', "Luther's 95 Theses"), ('EV-0080', 'council', 'Council of Trent'), ('EV-0086', 'ship', 'Missionaries reach Alaska'),
        ('EV-0093', 'dome', 'Patriarchate restored'), ('EV-0094', 'fire', 'Soviet persecution'), ('EV-0101', 'treaty', 'Anathemas of 1054 lifted'),
        ('EV-0106', 'council', 'Great Council in Crete'), ('EV-0109', 'star', '1700 years since Nicaea')]),
    ('ww1', 'World War I', '', 1, 'month', [
        ('EV-0201', 'bomb', 'Archduke shot'), ('EV-0202', 'flag', 'Austria attacks Serbia'), ('EV-0203', 'flag', 'Britain joins in'),
        ('EV-0204', 'helmet', 'Battle of the Marne'), ('EV-0205', 'star', 'The Christmas truce'), ('EV-0206', 'ship', 'Gallipoli landings'),
        ('EV-0207', 'ship', 'Lusitania sunk'), ('EV-0208', 'burst', 'Battle of Verdun'), ('EV-0209', 'ship', 'Battle of Jutland'),
        ('EV-0210', 'helmet', 'Battle of the Somme'), ('EV-0211', 'tank', 'First tanks'), ('EV-0212', 'flag', 'The USA joins in'),
        ('EV-0213', 'helmet', 'Passchendaele'), ('EV-0214', 'flag', 'Russian Revolution'), ('EV-0215', 'treaty', 'Russia makes peace'),
        ('EV-0216', 'burst', 'Spring Offensive'), ('EV-0217', 'tank', 'The Hundred Days'), ('EV-0218', 'dove', 'The Armistice'),
        ('EV-0219', 'treaty', 'Treaty of Versailles')]),
    ('ww2', 'World War II', 'World War 2', 1.5, 'month', [
        ('EV-0003', 'tank', 'Poland invaded'), ('EV-0004', 'flag', 'Britain and France declare war'), ('EV-0006', 'ship', 'Dunkirk evacuation'),
        ('EV-0007', 'flag', 'France falls'), ('EV-0008', 'plane', 'Battle of Britain'), ('EV-0009', 'fire', 'The Blitz'),
        ('EV-0011', 'tank', 'Operation Barbarossa'), ('EV-0012', 'bomb', 'Pearl Harbor'), ('EV-0014', 'ship', 'Battle of Midway'),
        ('EV-0015', 'burst', 'Battle of Stalingrad'), ('EV-0016', 'tank', 'El Alamein'), ('EV-0017', 'tank', 'Battle of Kursk'),
        ('EV-0019', 'ship', 'D-Day landings'), ('EV-0020', 'treaty', 'Yalta Conference'), ('EV-0022', 'flag', 'VE Day'),
        ('EV-0024', 'cloud', 'Hiroshima'), ('EV-0026', 'dove', 'Japan surrenders')]),
    ('ot', 'Old Testament', '', 600, 'century', [
        ('EV-0301', 'tent', 'Abraham is called'), ('EV-0302', 'pyramid', 'Jacob goes to Egypt'), ('EV-0303', 'sea', 'The Exodus'),
        ('EV-0304', 'scroll', 'The Law at Sinai'), ('EV-0305', 'wall', 'Into Canaan'), ('EV-0306', 'crown', 'Saul, first king'),
        ('EV-0307', 'crown', 'David in Jerusalem'), ('EV-0308', 'temple', "Solomon's Temple"), ('EV-0309', 'bolt', 'The kingdom divides'),
        ('EV-0310', 'fire', 'Samaria falls'), ('EV-0311', 'fire', 'Jerusalem destroyed'), ('EV-0312', 'treaty', 'Cyrus sends them home'),
        ('EV-0313', 'temple', 'Second Temple finished'), ('EV-0314', 'wall', 'Walls rebuilt')]),
    ('rome', 'Roman Empire', '', 250, 'year', [
        ('EV-0401', 'sword', 'Caesar assassinated'), ('EV-0402', 'crown', 'Augustus, first emperor'), ('EV-0403', 'eagle', 'Teutoburg Forest'),
        ('EV-0404', 'ship', 'Britain invaded'), ('EV-0029', 'fire', "Nero's persecution"), ('EV-0405', 'volcano', 'Pompeii buried'),
        ('EV-0406', 'eagle', 'Empire at its largest'), ('EV-0407', 'wall', "Hadrian's Wall"), ('EV-0408', 'scroll', 'Citizens everywhere'),
        ('EV-0040', 'cross', 'Edict of Milan'), ('EV-0042', 'city', 'Constantinople founded'), ('EV-0409', 'bolt', 'East and West split'),
        ('EV-0410', 'fire', 'Rome sacked'), ('EV-0052', 'crown', 'Last Western emperor'), ('EV-0076', 'wall', 'Constantinople falls')]),
    ('space', 'Space race', '', 3, 'month', [
        ('EV-0501', 'satellite', 'Sputnik 1'), ('EV-0502', 'dog', 'Laika in orbit'), ('EV-0503', 'star', 'NASA begins'),
        ('EV-0504', 'astronaut', 'Gagarin in space'), ('EV-0505', 'moon', 'Kennedy: the Moon'), ('EV-0506', 'rocket', 'Glenn orbits Earth'),
        ('EV-0507', 'astronaut', 'First woman in space'), ('EV-0508', 'astronaut', 'First spacewalk'), ('EV-0509', 'moon', 'Apollo 8 circles Moon'),
        ('EV-0510', 'moon', 'Moon landing'), ('EV-0511', 'satellite', 'Apollo–Soyuz handshake')]),
]

COLS = ('id', 'name', 'date_from', 'date_to', 'date_iso', 'date_iso_to', 'date_text', 'date_basis', 'places', 'theatre', 'summary', 'sources')


def order(e):
    """BC years are negative, so the file is in date order by year first, then by day (an ISO string with a minus misorders)."""
    return (e['date_from'], e['date_iso'][-5:])


def main():
    tl_p, out_p = os.path.join(ROOT, 'data', 'timeline.json'), os.path.join(ROOT, 'data', 'timelines.json')
    rows = [e for e in json.load(open(tl_p, encoding='utf-8')) if e['era'] not in EV]
    for era, evs in EV.items():
        for t in evs:
            r = dict(zip(COLS, t))
            r.update(era=era, figures='', writings='')
            rows.append({c: r[c] for c in ('id', 'name', 'date_from', 'date_to', 'date_iso', 'date_iso_to', 'date_text', 'date_basis',
                                           'places', 'theatre', 'era', 'summary', 'figures', 'writings', 'sources')})
    rows.sort(key=order)
    ids = {e['id'] for e in rows}
    out = []
    for tid, name, era, window, unit, evs in TL:
        miss = [e for e, _, _ in evs if e not in ids]
        if miss:
            sys.exit('timelines.py: ' + tid + ' names events that are no row: ' + ', '.join(miss))
        out.append({'id': 'TL-' + tid, 'name': name, 'era': era, 'window': window, 'unit': unit,
                    'events': [{'id': e, 'label': lab, 'px': ICON[ic]} for e, ic, lab in evs]})
    with open(tl_p, 'w', encoding='utf-8') as fh:
        fh.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False, separators=(',', ':')) for r in rows) + '\n]\n')
    with open(out_p, 'w', encoding='utf-8') as fh:
        fh.write('[\n' + ',\n'.join(json.dumps(r, ensure_ascii=False) for r in out) + '\n]\n')
    print(len(out), 'timelines,', sum(len(v) for v in EV.values()), 'events of their own')


if __name__ == '__main__':
    main()
