# The icon images in data/icons/120/

Each `data/icons/120/<id>.png` is a 1-bit 120x160 (black and white, dithered) reduction, made for an e-ink panel, of a
photograph or scan of a historic icon on Wikimedia Commons. Every source file is marked **public domain**
on Commons (the painted works are centuries old; faithful reproductions of 2D public-domain works are
themselves public domain — PD-Art). The reduction is `tools/epaper-verse` work (docs/history/479).
The same record is on each row of `data/icons.json` as `image_source`.

**Masters (docs/history/499).** `data/icons/master/<id>.jpg` is the same Commons file, fetched through
`commons.wikimedia.org/w/thumb.php` at 600px on its longest side, made greyscale and saved as a JPEG of 80 KB at
most. Public domain as its source is. `make-icons.js` makes each 1-bit bitmap from its master, so a better
reduction (a larger panel, another dither) can be made again without fetching anything.

| id | icon | Commons file | licence |
|---|---|---|---|
| christ_pantokrator | Christ Pantokrator | [Spas vsederzhitel sinay.jpg](https://commons.wikimedia.org/wiki/File:Spas_vsederzhitel_sinay.jpg) | Public domain |
| christ_mandylion | The Holy Face | [Simon Ushakov - Спас Нерукотворный - Google Art Project.jpg](https://commons.wikimedia.org/wiki/File:Simon_Ushakov_-_%D0%A1%D0%BF%D0%B0%D1%81_%D0%9D%D0%B5%D1%80%D1%83%D0%BA%D0%BE%D1%82%D0%B2%D0%BE%D1%80%D0%BD%D1%8B%D0%B9_-_Google_Art_Project.jpg) | Public domain |
| christ_high_priest | Christ the Great High Priest | [Christ Great Hierophant (Candia, 16th c.).jpg](https://commons.wikimedia.org/wiki/File:Christ_Great_Hierophant_(Candia,_16th_c.).jpg) | Public domain |
| christ_emmanuel | Christ Emmanuel | [Spas Emmanuil s arhangelami ikona.jpg](https://commons.wikimedia.org/wiki/File:Spas_Emmanuil_s_arhangelami_ikona.jpg) | Public domain |
| christ_nymphios | Christ the Bridegroom | [Christ the Bridegroom Icon.jpg](https://commons.wikimedia.org/wiki/File:Christ_the_Bridegroom_Icon.jpg) | Public domain |
| christ_ampelos | Christ the Vine | [Christ the True Vine icon (Athens, 16th century).jpg](https://commons.wikimedia.org/wiki/File:Christ_the_True_Vine_icon_(Athens,_16th_century).jpg) | Public domain |
| deesis | The Deesis | [Deesis mosaic Hagia Sophia.jpg](https://commons.wikimedia.org/wiki/File:Deesis_mosaic_Hagia_Sophia.jpg) | Public domain |
| anastasis | The Resurrection | [Chora Anastasis.jpg](https://commons.wikimedia.org/wiki/File:Chora_Anastasis.jpg) | Public domain |
| crucifixion | The Crucifixion | [Crucifixion of Jesus, Russian icon by Dionisius, 1500.jpg](https://commons.wikimedia.org/wiki/File:Crucifixion_of_Jesus,_Russian_icon_by_Dionisius,_1500.jpg) | Public domain |
| hodegetria | Hodegetria | [Double-side icon with Crucifixion and Hodegetria (14th century, Byzantine museum) back.jpg](https://commons.wikimedia.org/wiki/File:Double-side_icon_with_Crucifixion_and_Hodegetria_(14th_century,_Byzantine_museum)_back.jpg) | Public domain |
| eleousa | Eleousa | [The Virgin of Tenderness - Google Art Project.jpg](https://commons.wikimedia.org/wiki/File:The_Virgin_of_Tenderness_-_Google_Art_Project.jpg) | Public domain |
| platytera | Platytera | [1200-33 Yaroslavl Our Lady Great Panagia anagoria.JPG](https://commons.wikimedia.org/wiki/File:1200-33_Yaroslavl_Our_Lady_Great_Panagia_anagoria.JPG) | Public domain |
| orans | The Orans | [Oranta-Kyiv.jpg](https://commons.wikimedia.org/wiki/File:Oranta-Kyiv.jpg) | Public domain |
| nikopoios | Nikopoios | [Madonna Nicopeia San Marco interior.png](https://commons.wikimedia.org/wiki/File:Madonna_Nicopeia_San_Marco_interior.png) | Public domain |
| galaktotrophousa | The Milk-Giver | [Galaktotrophousa, by Antonio Papadopoulos, Crete, 15th century, inv. 40071 - Pinacoteca Vaticana - Vatican Museums - DSC01247.jpg](https://commons.wikimedia.org/wiki/File:Galaktotrophousa,_by_Antonio_Papadopoulos,_Crete,_15th_century,_inv._40071_-_Pinacoteca_Vaticana_-_Vatican_Museums_-_DSC01247.jpg) | Public domain |
| pantanassa | Pantanassa | [Pantanassa (Vatopedi monastery).jpg](https://commons.wikimedia.org/wiki/File:Pantanassa_(Vatopedi_monastery).jpg) | Public domain |
| zoodochos_pigi | The Life-Giving Spring | [Kirill Ulanov. Theotokos, Life-giving Spring. 1703.jpg](https://commons.wikimedia.org/wiki/File:Kirill_Ulanov._Theotokos,_Life-giving_Spring._1703.jpg) | Public domain |
| unburnt_bush | The Unburnt Bush | [Neopalimaya Kupina.jpg](https://commons.wikimedia.org/wiki/File:Neopalimaya_Kupina.jpg) | Public domain |
| strastnaya | Theotokos of the Passion | [Theotokos of the Passion.jpg](https://commons.wikimedia.org/wiki/File:Theotokos_of_the_Passion.jpg) | Public domain |
| agiosoritissa | Agiosoritissa | [Agiosoritissa ikona.jpg](https://commons.wikimedia.org/wiki/File:Agiosoritissa_ikona.jpg) | Public domain |
| trinity | The Hospitality of Abraham | [Andrey Rublev - Св. Троица - Google Art Project.jpg](https://commons.wikimedia.org/wiki/File:Andrey_Rublev_-_%D0%A1%D0%B2._%D0%A2%D1%80%D0%BE%D0%B8%D1%86%D0%B0_-_Google_Art_Project.jpg) | Public domain |
| portaitissa | Panagia Portaitissa | [Panagia Portaitissa.jpg](https://commons.wikimedia.org/wiki/File:Panagia_Portaitissa.jpg) | Public domain |
| axion_estin | Axion Estin | [Mount Athos' Axion Estin icon.jpg](https://commons.wikimedia.org/wiki/File:Mount_Athos%27_Axion_Estin_icon.jpg) | Public domain |
| tricheirousa | Panagia Tricheirousa | [VergineTricherusa.jpg](https://commons.wikimedia.org/wiki/File:VergineTricherusa.jpg) | Public domain |
| gorgoepikoos | Panagia Gorgoepikoos | [Gorgoepikoos Skoroposlushnitsa.jpg](https://commons.wikimedia.org/wiki/File:Gorgoepikoos_Skoroposlushnitsa.jpg) | Public domain |
| paramythia | Panagia Paramythia | [Panagia Paramythia Icon from Vatopedi Monastery 14th Century.jpg](https://commons.wikimedia.org/wiki/File:Panagia_Paramythia_Icon_from_Vatopedi_Monastery_14th_Century.jpg) | Public domain |
| glykophilousa_philotheou | Panagia Glykophilousa | [Cretan School - The Virgin Glykophilousa - NG.M.02103 - National Museum of Art, Architecture and Design.jpg](https://commons.wikimedia.org/wiki/File:Cretan_School_-_The_Virgin_Glykophilousa_-_NG.M.02103_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | Public domain |
| blachernitissa | The Blachernitissa | [Vlahernskaya.jpg](https://commons.wikimedia.org/wiki/File:Vlahernskaya.jpg) | Public domain |
| vladimir | Our Lady of Vladimir | [Virgin of Vladimir.jpg](https://commons.wikimedia.org/wiki/File:Virgin_of_Vladimir.jpg) | Public domain |
| kazan | Our Lady of Kazan | [Kazan moscow.jpg](https://commons.wikimedia.org/wiki/File:Kazan_moscow.jpg) | Public domain |
| tikhvin | The Tikhvin Icon | [Tikhvinskaya.jpg](https://commons.wikimedia.org/wiki/File:Tikhvinskaya.jpg) | Public domain |
| smolensk | The Smolensk Icon | [Odigitriya Smolenskaya Dionisiy.jpg](https://commons.wikimedia.org/wiki/File:Odigitriya_Smolenskaya_Dionisiy.jpg) | Public domain |
| znamenie | The Sign of Novgorod | [Orthodox icon of Our Lady of the Sign. Veliky Novgorod, Russia.jpg](https://commons.wikimedia.org/wiki/File:Orthodox_icon_of_Our_Lady_of_the_Sign._Veliky_Novgorod,_Russia.jpg) | Public domain |
| kursk_root | The Kursk Root Icon | [Kursko-Korennaya ikona.jpg](https://commons.wikimedia.org/wiki/File:Kursko-Korennaya_ikona.jpg) | Public domain |
| don | The Don Icon | [Feofan Donskaja.jpg](https://commons.wikimedia.org/wiki/File:Feofan_Donskaja.jpg) | Public domain |
| pochaev | The Pochaev Icon | [Pochaevskaya.jpg](https://commons.wikimedia.org/wiki/File:Pochaevskaya.jpg) | Public domain |
| bogolyubskaya | The Bogolyubovo Icon | [Bogolyubskaya ikona s Zosimoy i Savvatiem.jpg](https://commons.wikimedia.org/wiki/File:Bogolyubskaya_ikona_s_Zosimoy_i_Savvatiem.jpg) | Public domain |
| feodorovskaya | The Feodorovskaya Icon | [Feodorovskaya 1904.jpg](https://commons.wikimedia.org/wiki/File:Feodorovskaya_1904.jpg) | Public domain |
| joy_of_all | Joy of All Who Sorrow | [Novgorod Art and History Museum - Joy of All Who Sorrow icon - 2025-08 - p16.jpg](https://commons.wikimedia.org/wiki/File:Novgorod_Art_and_History_Museum_-_Joy_of_All_Who_Sorrow_icon_-_2025-08_-_p16.jpg) | CC0 |
| unexpected_joy | The Unexpected Joy | [Our Lady the Unexpected Joy.jpeg](https://commons.wikimedia.org/wiki/File:Our_Lady_the_Unexpected_Joy.jpeg) | Public domain |
| softener | Softener of Evil Hearts | [Семистрельная икона.jpg](https://commons.wikimedia.org/wiki/File:%D0%A1%D0%B5%D0%BC%D0%B8%D1%81%D1%82%D1%80%D0%B5%D0%BB%D1%8C%D0%BD%D0%B0%D1%8F_%D0%B8%D0%BA%D0%BE%D0%BD%D0%B0.jpg) | Public domain |
| f_nativity_theotokos | The Nativity of the Theotokos | [Nativity of Mary icon.jpg](https://commons.wikimedia.org/wiki/File:Nativity_of_Mary_icon.jpg) | Public domain |
| f_exaltation | The Exaltation of the Cross | [Exaltation of the Cross - Palekh icon (19 c, priv.coll).jpg](https://commons.wikimedia.org/wiki/File:Exaltation_of_the_Cross_-_Palekh_icon_(19_c,_priv.coll).jpg) | Public domain |
| f_entry_theotokos | The Entry of the Theotokos | [Presentation of Mary, II Half of XIV Century, St Mary Perivleptos Church, Ohrid Icon Gallery.jpg](https://commons.wikimedia.org/wiki/File:Presentation_of_Mary,_II_Half_of_XIV_Century,_St_Mary_Perivleptos_Church,_Ohrid_Icon_Gallery.jpg) | Public domain |
| f_nativity | The Nativity of Christ | [Nativity (15th c., Annunciation Cathedral in Moscow).jpg](https://commons.wikimedia.org/wiki/File:Nativity_(15th_c.,_Annunciation_Cathedral_in_Moscow).jpg) | Public domain |
| f_theophany | Theophany | [Baptism (15th c., Annunciation Cathedral in Moscow).jpg](https://commons.wikimedia.org/wiki/File:Baptism_(15th_c.,_Annunciation_Cathedral_in_Moscow).jpg) | Public domain |
| f_hypapante | The Meeting of the Lord | [Sretenie (Annunciation Cathedral in Moscow).jpg](https://commons.wikimedia.org/wiki/File:Sretenie_(Annunciation_Cathedral_in_Moscow).jpg) | Public domain |
| f_annunciation | The Annunciation | [Благовещение Устюжское - Google Art Project.jpg](https://commons.wikimedia.org/wiki/File:%D0%91%D0%BB%D0%B0%D0%B3%D0%BE%D0%B2%D0%B5%D1%89%D0%B5%D0%BD%D0%B8%D0%B5_%D0%A3%D1%81%D1%82%D1%8E%D0%B6%D1%81%D0%BA%D0%BE%D0%B5_-_Google_Art_Project.jpg) | Public domain |
| f_palm_sunday | The Entry into Jerusalem | [Entry into Jerusalem (Annunciation Cathedral in Moscow).jpg](https://commons.wikimedia.org/wiki/File:Entry_into_Jerusalem_(Annunciation_Cathedral_in_Moscow).jpg) | Public domain |
| f_ascension | The Ascension | [Ascension (1410-20s, GTG).jpg](https://commons.wikimedia.org/wiki/File:Ascension_(1410-20s,_GTG).jpg) | Public domain |
| f_pentecost | Pentecost | [The Descent of the Holy Spirit Novgorod.jpeg](https://commons.wikimedia.org/wiki/File:The_Descent_of_the_Holy_Spirit_Novgorod.jpeg) | Public domain |
| f_transfiguration | The Transfiguration | [Transfiguration by Feofan Grek from Spaso-Preobrazhensky Cathedral in Pereslavl-Zalessky (15th c, Tretyakov gallery).jpeg](https://commons.wikimedia.org/wiki/File:Transfiguration_by_Feofan_Grek_from_Spaso-Preobrazhensky_Cathedral_in_Pereslavl-Zalessky_(15th_c,_Tretyakov_gallery).jpeg) | Public domain |
| f_dormition | The Dormition | [Theofanus uspenie.jpg](https://commons.wikimedia.org/wiki/File:Theofanus_uspenie.jpg) | Public domain |
| f_pokrov | The Protection of the Theotokos | [Pokrov (icon, 1399).jpeg](https://commons.wikimedia.org/wiki/File:Pokrov_(icon,_1399).jpeg) | Public domain |
| f_orthodoxy | The Triumph of Orthodoxy | [Triumph orthodoxy.jpg](https://commons.wikimedia.org/wiki/File:Triumph_orthodoxy.jpg) | Public domain |
| f_ladder | The Ladder of Divine Ascent | [The Ladder of Divine Ascent Monastery of St Catherine Sinai 12th century.jpg](https://commons.wikimedia.org/wiki/File:The_Ladder_of_Divine_Ascent_Monastery_of_St_Catherine_Sinai_12th_century.jpg) | Public domain |
| f_synaxis_archangels | The Synaxis of the Archangels | [Kirill Ulanov. Synaxis of the Archangel Michael and the Other Bodiless Powers. 1704.jpg](https://commons.wikimedia.org/wiki/File:Kirill_Ulanov._Synaxis_of_the_Archangel_Michael_and_the_Other_Bodiless_Powers._1704.jpg) | Public domain |
| s_nicholas | St Nicholas of Myra | [Novgorod School - Saint Nicholas - NG.M.02422 - National Museum of Art, Architecture and Design.jpg](https://commons.wikimedia.org/wiki/File:Novgorod_School_-_Saint_Nicholas_-_NG.M.02422_-_National_Museum_of_Art,_Architecture_and_Design.jpg) | Public domain |
| s_george | St George the Trophy-Bearer | [S.George (Novgorod, mid. 14 c, GTG).jpg](https://commons.wikimedia.org/wiki/File:S.George_(Novgorod,_mid._14_c,_GTG).jpg) | Public domain |
| s_demetrios | St Demetrios of Thessaloniki | [Saint Demetrius of Protat.JPG](https://commons.wikimedia.org/wiki/File:Saint_Demetrius_of_Protat.JPG) | Public domain |
| s_forerunner | St John the Forerunner | [Maryhill Museum - St. John the Forerunner 01.jpg](https://commons.wikimedia.org/wiki/File:Maryhill_Museum_-_St._John_the_Forerunner_01.jpg) | Public domain |
| s_michael | The Archangel Michael | [Andrey Rublev - Архангел Михаил. Из Деисусного чина ("Звенигородский") - Google Art Project.jpg](https://commons.wikimedia.org/wiki/File:Andrey_Rublev_-_%D0%90%D1%80%D1%85%D0%B0%D0%BD%D0%B3%D0%B5%D0%BB_%D0%9C%D0%B8%D1%85%D0%B0%D0%B8%D0%BB._%D0%98%D0%B7_%D0%94%D0%B5%D0%B8%D1%81%D1%83%D1%81%D0%BD%D0%BE%D0%B3%D0%BE_%D1%87%D0%B8%D0%BD%D0%B0_(%22%D0%97%D0%B2%D0%B5%D0%BD%D0%B8%D0%B3%D0%BE%D1%80%D0%BE%D0%B4%D1%81%D0%BA%D0%B8%D0%B9%22)_-_Google_Art_Project.jpg) | Public domain |
| s_constantine_helen | Sts Constantine and Helen | [Constantine and Helen.png](https://commons.wikimedia.org/wiki/File:Constantine_and_Helen.png) | Public domain |
| s_panteleimon | St Panteleimon | [Byzantine - Saint Panteleimon - Walters 4820864.jpg](https://commons.wikimedia.org/wiki/File:Byzantine_-_Saint_Panteleimon_-_Walters_4820864.jpg) | Public domain |
| s_paraskevi | St Paraskevi | [0898Ha. Hermitage Museum (Hall 144). Icon of the Great Martyr Paraskeva Pyatnitsa.jpg](https://commons.wikimedia.org/wiki/File:0898Ha._Hermitage_Museum_(Hall_144)._Icon_of_the_Great_Martyr_Paraskeva_Pyatnitsa.jpg) | Public domain |
| s_catherine | St Catherine of Alexandria | [Icon of Saint Catherine.jpg](https://commons.wikimedia.org/wiki/File:Icon_of_Saint_Catherine.jpg) | Public domain |
| s_spyridon | St Spyridon of Trimythous | [Saint Spyridon icon.jpg](https://commons.wikimedia.org/wiki/File:Saint_Spyridon_icon.jpg) | Public domain |
| s_elias | The Prophet Elias | [0159Hb. Fiery Ascent of the Prophet Elijah, 1st half of the 17th century.jpg](https://commons.wikimedia.org/wiki/File:0159Hb._Fiery_Ascent_of_the_Prophet_Elijah,_1st_half_of_the_17th_century.jpg) | Public domain |
| s_three_hierarchs | The Three Hierarchs | [Three Holy Hierarchs (Novgorod).jpg](https://commons.wikimedia.org/wiki/File:Three_Holy_Hierarchs_(Novgorod).jpg) | Public domain |
| s_nektarios | St Nektarios of Aegina | [Saint Nektarios of Aegina at Rizario.jpg](https://commons.wikimedia.org/wiki/File:Saint_Nektarios_of_Aegina_at_Rizario.jpg) | Public domain |
| s_seraphim | St Seraphim of Sarov | [Seraphim of Sarov (after 1903, priv.coll).jpg](https://commons.wikimedia.org/wiki/File:Seraphim_of_Sarov_(after_1903,_priv.coll).jpg) | Public domain |
| s_silouan | St Silouan the Athonite | [Silouanicon.jpg](https://commons.wikimedia.org/wiki/File:Silouanicon.jpg) | Public domain |

## Left out

Nine icons had no public-domain copy on Commons (elaiovrytissa, vimatarissa, fovera_prostasia, evangelistria_tinos,
soumela, myrtidiotissa, chozoviotissa, ekatontapyliani, malevi). The owner: "Don't use those abstract recreations,
delete them." They are not in the set until a real image is found (docs/history/483).
