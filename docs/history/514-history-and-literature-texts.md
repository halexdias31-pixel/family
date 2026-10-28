# 514 — Public-domain history and literature texts in the Library

Owner (via the coordinator, 28 Oct 2026): add these public-domain texts to the Library, "no risks: record source + licence; if
uncertain, leave out and say so"; one card per numbered section where that is how it is cited, a stanza for poetry, a chapter
otherwise, Shakespeare a scene; History texts under History, literature under English Literature; tags Writing / Book / Chapter /
Section and Text. Later: "all the poems from the Power and Conflict anthology" — only the public-domain ones, the rest named.

## What it is
- `data/texts/`: `index.json` (each text and its cards' places, no words, ~340 KB, fetched when a finder paints) and one
  `TX-NNNN.json` per text (the words, fetched only when one of its cards is drawn). Every file under 2 MB; 16.5 MB in all.
  `data/texts/LICENSE` lists every text's source and licence; each file names them again and every card prints them.
- `js/texts.js` (kind `pdtext`, beside `js/works.js`, nothing changed there), facets `txWriting` Writing, `txBook` Book,
  `txChapter` Chapter, `txSection` Section, `txText` Text, `txAnthology` Anthology (facets.json 37.99x). History texts sit on
  the History shelf under Manuscripts, figures, writings, events or texts → Texts; literature on the English Literature shelf.
- No `min_age` is set by hand: nothing here is scripture, so the age rule does not apply.
- Built by `tools/pd-texts.py <download dir> <repo>` (run with `python3 -I`, downloads in their own folder). The etexts'
  licence header/footer and their name are cut, as their terms allow for public-domain text; editorial matter that may still
  be in copyright (Sassoon's Owen introduction, M. Robertson's Keats notes, the 1997 Owen transcriber's notes) is left out.
- `js/check-texts.js` (in check-all): the index loads, every file loads and matches its index, every text has a source with a
  public-domain licence and a LICENSE line, no file reaches 2 MB, no etext licence left in the words, no two cards share a place.

## Texts, cards and bytes
```
index.json 339378 bytes
TX-0001 A Christmas Carol                                 5 cards    160604 bytes
TX-0002 Strange Case of Dr Jekyll and Mr Hyde            10 cards    141387 bytes
TX-0003 Frankenstein                                     27 cards    406360 bytes
TX-0004 Pride and Prejudice                              61 cards    692524 bytes
TX-0005 Jane Eyre                                        37 cards   1045701 bytes
TX-0006 Great Expectations                               59 cards   1023146 bytes
TX-0007 The Sign of Four                                 12 cards    237783 bytes
TX-0008 Romeo and Juliet                                 25 cards    146034 bytes
TX-0009 Macbeth                                          28 cards    107661 bytes
TX-0010 The Tempest                                      10 cards    102484 bytes
TX-0011 Much Ado About Nothing                           13 cards    126094 bytes
TX-0012 Julius Caesar                                    18 cards    120141 bytes
TX-0013 The Merchant of Venice                           20 cards    124194 bytes
TX-0014 Twelfth Night                                    18 cards    118784 bytes
TX-0015 Othello                                          15 cards    160285 bytes
TX-0016 Hamlet                                           21 cards    184372 bytes
TX-0017 King Lear                                        26 cards    160525 bytes
TX-0018 A Midsummer Night’s Dream                        11 cards     99309 bytes
TX-0019 All’s Well That Ends Well                        23 cards    138247 bytes
TX-0020 Antony and Cleopatra                             42 cards    156810 bytes
TX-0021 As You Like It                                   23 cards    129187 bytes
TX-0022 The Comedy of Errors                             11 cards     91222 bytes
TX-0023 Coriolanus                                       29 cards    171844 bytes
TX-0024 Cymbeline                                        29 cards    166588 bytes
TX-0025 Henry IV, Part 1                                 19 cards    145084 bytes
TX-0026 Henry IV, Part 2                                 20 cards    154990 bytes
TX-0027 Henry V                                          28 cards    154509 bytes
TX-0028 Henry VI, Part 1                                 27 cards    133921 bytes
TX-0029 Henry VI, Part 2                                 24 cards    154025 bytes
TX-0030 Henry VI, Part 3                                 28 cards    150352 bytes
TX-0031 Henry VIII                                       17 cards    146929 bytes
TX-0032 King John                                        16 cards    124691 bytes
TX-0033 Love’s Labour’s Lost                              9 cards    131591 bytes
TX-0034 Measure for Measure                              17 cards    129956 bytes
TX-0035 The Merry Wives of Windsor                       23 cards    133214 bytes
TX-0036 Pericles                                         26 cards    113585 bytes
TX-0037 Richard II                                       19 cards    134036 bytes
TX-0038 Richard III                                      25 cards    181111 bytes
TX-0039 The Taming of the Shrew                          12 cards    114329 bytes
TX-0040 Timon of Athens                                  18 cards    114964 bytes
TX-0041 Titus Andronicus                                 14 cards    123610 bytes
TX-0042 Troilus and Cressida                             24 cards    161414 bytes
TX-0043 The Two Gentlemen of Verona                      20 cards    105041 bytes
TX-0044 The Two Noble Kinsmen                            25 cards    145575 bytes
TX-0045 The Winter’s Tale                                15 cards    148794 bytes
TX-0046 Shakespeare’s Sonnets                           154 cards     97888 bytes
TX-0047 The Histories                                  1483 cards   1688982 bytes
TX-0048 History of the Peloponnesian War                 26 cards   1179681 bytes
TX-0049 The Lives of the Twelve Caesars                 485 cards   1002504 bytes
TX-0050 The Gallic War                                  384 cards    488490 bytes
TX-0051 The Anglo-Saxon Chronicle                       403 cards    231694 bytes
TX-0052 Germania and Agricola                            92 cards    128934 bytes
TX-0053 The Genuine Works of Hippocrates                 86 cards    170775 bytes
TX-0054 Magna Carta                                      64 cards     52439 bytes
TX-0055 Declaration of Independence                      33 cards      8573 bytes
TX-0056 Constitution of the United States                74 cards     45507 bytes
TX-0057 Bill of Rights 1689                              52 cards     17138 bytes
TX-0058 Presidential Inaugural Addresses                 55 cards    767326 bytes
TX-0059 Fireside Chats                                   25 cards    445536 bytes
TX-0060 Gettysburg Address                                1 cards      1780 bytes
TX-0061 Songs of Innocence and of Experience            201 cards     30744 bytes
TX-0062 Poems of Wilfred Owen                           109 cards     33949 bytes
TX-0063 Wessex Poems and Other Verses                   489 cards     89209 bytes
TX-0064 Poems of the Past and the Present               563 cards    100778 bytes
TX-0065 Lyrical Ballads                                 303 cards     87411 bytes
TX-0066 Poems in Two Volumes, Volume 1                  220 cards     75568 bytes
TX-0067 Poems in Two Volumes, Volume 2                  192 cards     52885 bytes
TX-0068 Lamia, Isabella, The Eve of St. Agnes, and Ot   177 cards    129952 bytes
TX-0069 Keats’s Poems (1817)                             97 cards     67621 bytes
TX-0070 Maud, and Other Poems                           241 cards     84002 bytes
TX-0071 Browning’s Shorter Poems                        485 cards    197147 bytes
TX-0072 Shelley’s Shorter Poems, 1816–1822              728 cards    263769 bytes
TX-0073 Power and Conflict (AQA)                         15 cards     12128 bytes
total 8236 cards
```

## Left out, and why
- Folger Shakespeare (CC BY-NC) — the 1994 public-domain Complete Works etext is used. Plays follow that etext's own scene
  headings; where it lacks one (e.g. Much Ado III.3–5) the scenes share a card.
- Avalon's Magna Carta translation names no source (its translator's copyright is unknown) and the British Library's is in
  copyright, so Magna Carta is McKechnie's Latin and translation (1914; he died 1930).
- Tacitus, Church & Brodribb: not found as a public-domain etext this pass; the Oxford translation (revised) of the Germania
  and Agricola is used. The Histories etext is Fyfe's (d. 1965, in copyright in the UK) — left out. Annals not added.
- Suetonius, Rolfe (Loeb 1914): not found as an etext; Thomson revised by Forester (1889) used.
- Bede: the only etext is A. M. Sellar's 1907 translation, whose translator's death date could not be confirmed — left out;
  Giles/Jane not found as a clean etext.
- Galen, On the Natural Faculties (Brock 1916): no clean etext found — left out.
- Hippocrates: Adams volume 1 only (five works); volume 2 (with the Oath) is not an etext.
- Herodotus: Macaulay (1890). Thucydides: Crawley (1874) is not section-numbered, so a card a chapter (large cards).
- Jekyll and Hyde is in (TX-0002). An Inspector Calls (Priestley d. 1984) is in copyright — not added.
- Power and Conflict: the nine copyrighted poems are reference cards only ("Not available (copyright)").
- Churchill excluded as asked. Shelley: the shorter poems 1816–1822 only (Ozymandias), not the complete works.
