/* @family. — verse.gs: ?verse=today, one short KJV verse a day for the e-paper on the owner's desk (369). Tiny JSON, no payload. */

/* SHORT ENOUGH FOR 200x200 (≤ 220 characters), cut from data/bible so the words are the KJV's own. */
const VERSES = [
  ["In the beginning God created the heaven and the earth.","Genesis 1:1"],
  ["Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.","Joshua 1:9"],
  ["The LORD is my shepherd; I shall not want.","Psalm 23:1"],
  ["The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?","Psalm 27:1"],
  ["Delight thyself also in the LORD; and he shall give thee the desires of thine heart.","Psalm 37:4"],
  ["God is our refuge and strength, a very present help in trouble.","Psalm 46:1"],
  ["Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.","Psalm 46:10"],
  ["Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.","Psalm 55:22"],
  ["This is the day which the LORD hath made; we will rejoice and be glad in it.","Psalm 118:24"],
  ["Thy word is a lamp unto my feet, and a light unto my path.","Psalm 119:105"],
  ["I will lift up mine eyes unto the hills, from whence cometh my help.","Psalm 121:1"],
  ["My help cometh from the LORD, which made heaven and earth.","Psalm 121:2"],
  ["O give thanks unto the LORD; for he is good: for his mercy endureth for ever.","Psalm 136:1"],
  ["I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.","Psalm 139:14"],
  ["He healeth the broken in heart, and bindeth up their wounds.","Psalm 147:3"],
  ["# Trust in the LORD with all thine heart; and lean not unto thine own understanding.","Proverbs 3:5"],
  ["In all thy ways acknowledge him, and he shall direct thy paths.","Proverbs 3:6"],
  ["A soft answer turneth away wrath: but grievous words stir up anger.","Proverbs 15:1"],
  ["Commit thy works unto the LORD, and thy thoughts shall be established.","Proverbs 16:3"],
  ["A merry heart doeth good like a medicine: but a broken spirit drieth the bones.","Proverbs 17:22"],
  ["The name of the LORD is a strong tower: the righteous runneth into it, and is safe.","Proverbs 18:10"],
  ["Train up a child in the way he should go: and when he is old, he will not depart from it.","Proverbs 22:6"],
  ["To every thing there is a season, and a time to every purpose under the heaven:","Ecclesiastes 3:1"],
  ["Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.","Isaiah 26:3"],
  ["But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.","Isaiah 40:31"],
  ["# Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.","Isaiah 41:10"],
  ["# It is of the LORD'S mercies that we are not consumed, because his compassions fail not.","Lamentations 3:22"],
  ["They are new every morning: great is thy faithfulness.","Lamentations 3:23"],
  ["He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?","Micah 6:8"],
  ["The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.","Nahum 1:7"],
  ["The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.","Zephaniah 3:17"],
  ["Blessed are the peacemakers: for they shall be called the children of God.","Matthew 5:9"],
  ["Ye are the light of the world. A city that is set on an hill cannot be hid.","Matthew 5:14"],
  ["But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.","Matthew 6:33"],
  ["Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.","Matthew 6:34"],
  ["# Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:","Matthew 7:7"],
  ["# Come unto me, all ye that labour and are heavy laden, and I will give you rest.","Matthew 11:28"],
  ["But Jesus beheld them, and said unto them, With men this is impossible; but with God all things are possible.","Matthew 19:26"],
  ["Jesus said unto him, If thou canst believe, all things are possible to him that believeth.","Mark 9:23"],
  ["And the second is like, namely this, Thou shalt love thy neighbour as thyself. There is none other commandment greater than these.","Mark 12:31"],
  ["For with God nothing shall be impossible.","Luke 1:37"],
  ["And as ye would that men should do to you, do ye also to them likewise.","Luke 6:31"],
  ["And the light shineth in darkness; and the darkness comprehended it not.","John 1:5"],
  ["# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.","John 3:16"],
  ["And ye shall know the truth, and the truth shall make you free.","John 8:32"],
  ["A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.","John 13:34"],
  ["Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.","John 14:6"],
  ["Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.","John 14:27"],
  ["This is my commandment, That ye love one another, as I have loved you.","John 15:12"],
  ["These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.","John 16:33"],
  ["And we know that all things work together for good to them that love God, to them who are the called according to his purpose.","Romans 8:28"],
  ["Rejoicing in hope; patient in tribulation; continuing instant in prayer;","Romans 12:12"],
  ["Be not overcome of evil, but overcome evil with good.","Romans 12:21"],
  ["Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.","Romans 15:13"],
  ["Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,","1 Corinthians 13:4"],
  ["And now abideth faith, hope, charity, these three; but the greatest of these is charity.","1 Corinthians 13:13"],
  ["Let all your things be done with charity.","1 Corinthians 16:14"],
  ["(For we walk by faith, not by sight:)","2 Corinthians 5:7"],
  ["And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.","2 Corinthians 12:9"],
  ["Bear ye one another's burdens, and so fulfil the law of Christ.","Galatians 6:2"],
  ["And let us not be weary in well doing: for in due season we shall reap, if we faint not.","Galatians 6:9"],
  ["And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.","Ephesians 4:32"],
  ["Rejoice in the Lord alway: and again I say, Rejoice.","Philippians 4:4"],
  ["I can do all things through Christ which strengtheneth me.","Philippians 4:13"],
  ["But my God shall supply all your need according to his riches in glory by Christ Jesus.","Philippians 4:19"],
  ["And whatsoever ye do, do it heartily, as to the Lord, and not unto men;","Colossians 3:23"],
  ["Rejoice evermore.","1 Thessalonians 5:16"],
  ["Pray without ceasing.","1 Thessalonians 5:17"],
  ["In every thing give thanks: for this is the will of God in Christ Jesus concerning you.","1 Thessalonians 5:18"],
  ["For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.","2 Timothy 1:7"],
  ["Now faith is the substance of things hoped for, the evidence of things not seen.","Hebrews 11:1"],
  ["Jesus Christ the same yesterday, and to day, and for ever.","Hebrews 13:8"],
  ["If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.","James 1:5"],
  ["Every good gift and every perfect gift is from above, and cometh down from the Father of lights, with whom is no variableness, neither shadow of turning.","James 1:17"],
  ["Casting all your care upon him; for he careth for you.","1 Peter 5:7"],
  ["He that loveth not knoweth not God; for God is love.","1 John 4:8"],
  ["There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.","1 John 4:18"],
  ["We love him, because he first loved us.","1 John 4:19"],
  ["And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.","Revelation 21:4"]
];

/* A LEDGER TAB CALLED `verses` (columns `text`, `ref`) WINS when it has rows; a missing or empty tab falls back to the list above. */
function verseList_() {
  try {
    const sh = SpreadsheetApp.openById(LEDGER_ID).getSheetByName('verses');
    if (sh && sh.getLastRow() > 1) {
      const v = sh.getDataRange().getValues(), h = v[0].map(c => String(c).trim().toLowerCase());
      const t = h.indexOf('text'), r = h.indexOf('ref');
      const rows = v.slice(1).map(x => [String(x[t] || '').trim(), String(x[r] || '').trim()]).filter(x => x[0]);
      if (t >= 0 && rows.length) return rows;
    }
  } catch (err) {}
  return VERSES;
}

/* DAY n SHOWS (n * step) mod N with step coprime to N: every N days in a row are all different, and no day repeats yesterday. */
function verseFor_(ymd, list) {
  const N = list.length, m = String(ymd).match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const day = Math.floor(Date.UTC(+m[1], +m[2] - 1, +m[3]) / 864e5);
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  let step = 37 % N || 1;
  while (N > 2 && (gcd(step, N) !== 1 || step === 1)) step = (step + 1) % N;
  const v = list[((day * step) % N + N) % N];
  return { text: v[0], ref: v[1], date: ymd };
}

/* `?verse=today` (or `?verse=2026-10-19`): {text, ref, date}, through `jsonOut` like every other reply. */
function verseOut_(p) {
  const asked = String(p.verse || '');
  const ymd = /^\d{4}-\d{2}-\d{2}$/.test(asked) ? asked
    : Utilities.formatDate(new Date(), 'Europe/London', 'yyyy-MM-dd');
  return jsonOut(verseFor_(ymd, verseList_()));
}
