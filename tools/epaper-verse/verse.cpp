#include <Arduino.h>
// verse.cpp - a Bible verse a day on the Waveshare ESP32-S3-ePaper-1.54. GPL-3.0, as GxEPD2.
// No Wi-Fi, no clock, nothing to set up: wake -> clear the panel -> draw the next verse -> sleep 24 hours.
// Pins from Waveshare's demo: github.com/waveshareteam/ESP32-S3-ePaper-1.54, 02_Example/Arduino/*/user_config.h.

#include <Preferences.h>
#include <GxEPD2_BW.h>
#include <Fonts/FreeSerif12pt7b.h>
#include <Fonts/FreeSerif9pt7b.h>
#include <Fonts/FreeSerifItalic9pt7b.h>
#ifdef VERSE_ICONS   // the icon screen: build with -DVERSE_ICONS; icons.h is written by make-icons.js
#include "icons.h"
#endif
#include "pictures.h"   // every icon of data/icons.json at 120x160, written by make-icons.js (470)

#define EPD_PWR 6   // panel power, LOW = on; e-paper keeps its picture with the power off
GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> display(GxEPD2_154_D67(/*CS*/ 11, /*DC*/ 10, /*RST*/ 9, /*BUSY*/ 8));

// Short KJV verses (brackets removed), each fits 200x200. One a day, in order, then round again.
const char *const VERSES[][2] = {
  { "In the beginning God created the heaven and the earth.", "Genesis 1:1" },
  { "Have not I commanded thee? Be strong and of a good courage; be not afraid, neither be thou dismayed: for the LORD thy God is with thee whithersoever thou goest.", "Joshua 1:9" },
  { "The LORD is my shepherd; I shall not want.", "Psalm 23:1" },
  { "The LORD is my light and my salvation; whom shall I fear? the LORD is the strength of my life; of whom shall I be afraid?", "Psalm 27:1" },
  { "Delight thyself also in the LORD; and he shall give thee the desires of thine heart.", "Psalm 37:4" },
  { "God is our refuge and strength, a very present help in trouble.", "Psalm 46:1" },
  { "Be still, and know that I am God: I will be exalted among the heathen, I will be exalted in the earth.", "Psalm 46:10" },
  { "Cast thy burden upon the LORD, and he shall sustain thee: he shall never suffer the righteous to be moved.", "Psalm 55:22" },
  { "This is the day which the LORD hath made; we will rejoice and be glad in it.", "Psalm 118:24" },
  { "Thy word is a lamp unto my feet, and a light unto my path.", "Psalm 119:105" },
  { "I will lift up mine eyes unto the hills, from whence cometh my help.", "Psalm 121:1" },
  { "My help cometh from the LORD, which made heaven and earth.", "Psalm 121:2" },
  { "O give thanks unto the LORD; for he is good: for his mercy endureth for ever.", "Psalm 136:1" },
  { "I will praise thee; for I am fearfully and wonderfully made: marvellous are thy works; and that my soul knoweth right well.", "Psalm 139:14" },
  { "He healeth the broken in heart, and bindeth up their wounds.", "Psalm 147:3" },
  { "Trust in the LORD with all thine heart; and lean not unto thine own understanding.", "Proverbs 3:5" },
  { "In all thy ways acknowledge him, and he shall direct thy paths.", "Proverbs 3:6" },
  { "A soft answer turneth away wrath: but grievous words stir up anger.", "Proverbs 15:1" },
  { "Commit thy works unto the LORD, and thy thoughts shall be established.", "Proverbs 16:3" },
  { "A merry heart doeth good like a medicine: but a broken spirit drieth the bones.", "Proverbs 17:22" },
  { "The name of the LORD is a strong tower: the righteous runneth into it, and is safe.", "Proverbs 18:10" },
  { "Train up a child in the way he should go: and when he is old, he will not depart from it.", "Proverbs 22:6" },
  { "To every thing there is a season, and a time to every purpose under the heaven:", "Ecclesiastes 3:1" },
  { "Thou wilt keep him in perfect peace, whose mind is stayed on thee: because he trusteth in thee.", "Isaiah 26:3" },
  { "But they that wait upon the LORD shall renew their strength; they shall mount up with wings as eagles; they shall run, and not be weary; and they shall walk, and not faint.", "Isaiah 40:31" },
  { "Fear thou not; for I am with thee: be not dismayed; for I am thy God: I will strengthen thee; yea, I will help thee; yea, I will uphold thee with the right hand of my righteousness.", "Isaiah 41:10" },
  { "It is of the LORD'S mercies that we are not consumed, because his compassions fail not.", "Lamentations 3:22" },
  { "They are new every morning: great is thy faithfulness.", "Lamentations 3:23" },
  { "He hath shewed thee, O man, what is good; and what doth the LORD require of thee, but to do justly, and to love mercy, and to walk humbly with thy God?", "Micah 6:8" },
  { "The LORD is good, a strong hold in the day of trouble; and he knoweth them that trust in him.", "Nahum 1:7" },
  { "The LORD thy God in the midst of thee is mighty; he will save, he will rejoice over thee with joy; he will rest in his love, he will joy over thee with singing.", "Zephaniah 3:17" },
  { "Blessed are the peacemakers: for they shall be called the children of God.", "Matthew 5:9" },
  { "Ye are the light of the world. A city that is set on an hill cannot be hid.", "Matthew 5:14" },
  { "But seek ye first the kingdom of God, and his righteousness; and all these things shall be added unto you.", "Matthew 6:33" },
  { "Take therefore no thought for the morrow: for the morrow shall take thought for the things of itself. Sufficient unto the day is the evil thereof.", "Matthew 6:34" },
  { "Ask, and it shall be given you; seek, and ye shall find; knock, and it shall be opened unto you:", "Matthew 7:7" },
  { "Come unto me, all ye that labour and are heavy laden, and I will give you rest.", "Matthew 11:28" },
  { "But Jesus beheld them, and said unto them, With men this is impossible; but with God all things are possible.", "Matthew 19:26" },
  { "Jesus said unto him, If thou canst believe, all things are possible to him that believeth.", "Mark 9:23" },
  { "And the second is like, namely this, Thou shalt love thy neighbour as thyself. There is none other commandment greater than these.", "Mark 12:31" },
  { "For with God nothing shall be impossible.", "Luke 1:37" },
  { "And as ye would that men should do to you, do ye also to them likewise.", "Luke 6:31" },
  { "And the light shineth in darkness; and the darkness comprehended it not.", "John 1:5" },
  { "For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life.", "John 3:16" },
  { "And ye shall know the truth, and the truth shall make you free.", "John 8:32" },
  { "A new commandment I give unto you, That ye love one another; as I have loved you, that ye also love one another.", "John 13:34" },
  { "Jesus saith unto him, I am the way, the truth, and the life: no man cometh unto the Father, but by me.", "John 14:6" },
  { "Peace I leave with you, my peace I give unto you: not as the world giveth, give I unto you. Let not your heart be troubled, neither let it be afraid.", "John 14:27" },
  { "This is my commandment, That ye love one another, as I have loved you.", "John 15:12" },
  { "These things I have spoken unto you, that in me ye might have peace. In the world ye shall have tribulation: but be of good cheer; I have overcome the world.", "John 16:33" },
  { "And we know that all things work together for good to them that love God, to them who are the called according to his purpose.", "Romans 8:28" },
  { "Rejoicing in hope; patient in tribulation; continuing instant in prayer;", "Romans 12:12" },
  { "Be not overcome of evil, but overcome evil with good.", "Romans 12:21" },
  { "Now the God of hope fill you with all joy and peace in believing, that ye may abound in hope, through the power of the Holy Ghost.", "Romans 15:13" },
  { "Charity suffereth long, and is kind; charity envieth not; charity vaunteth not itself, is not puffed up,", "1 Corinthians 13:4" },
  { "And now abideth faith, hope, charity, these three; but the greatest of these is charity.", "1 Corinthians 13:13" },
  { "Let all your things be done with charity.", "1 Corinthians 16:14" },
  { "(For we walk by faith, not by sight:)", "2 Corinthians 5:7" },
  { "And he said unto me, My grace is sufficient for thee: for my strength is made perfect in weakness. Most gladly therefore will I rather glory in my infirmities, that the power of Christ may rest upon me.", "2 Corinthians 12:9" },
  { "Bear ye one another's burdens, and so fulfil the law of Christ.", "Galatians 6:2" },
  { "And let us not be weary in well doing: for in due season we shall reap, if we faint not.", "Galatians 6:9" },
  { "And be ye kind one to another, tenderhearted, forgiving one another, even as God for Christ's sake hath forgiven you.", "Ephesians 4:32" },
  { "Rejoice in the Lord alway: and again I say, Rejoice.", "Philippians 4:4" },
  { "I can do all things through Christ which strengtheneth me.", "Philippians 4:13" },
  { "But my God shall supply all your need according to his riches in glory by Christ Jesus.", "Philippians 4:19" },
  { "And whatsoever ye do, do it heartily, as to the Lord, and not unto men;", "Colossians 3:23" },
  { "Rejoice evermore.", "1 Thessalonians 5:16" },
  { "Pray without ceasing.", "1 Thessalonians 5:17" },
  { "In every thing give thanks: for this is the will of God in Christ Jesus concerning you.", "1 Thessalonians 5:18" },
  { "For God hath not given us the spirit of fear; but of power, and of love, and of a sound mind.", "2 Timothy 1:7" },
  { "Now faith is the substance of things hoped for, the evidence of things not seen.", "Hebrews 11:1" },
  { "Jesus Christ the same yesterday, and to day, and for ever.", "Hebrews 13:8" },
  { "If any of you lack wisdom, let him ask of God, that giveth to all men liberally, and upbraideth not; and it shall be given him.", "James 1:5" },
  { "Every good gift and every perfect gift is from above, and cometh down from the Father of lights, with whom is no variableness, neither shadow of turning.", "James 1:17" },
  { "Casting all your care upon him; for he careth for you.", "1 Peter 5:7" },
  { "He that loveth not knoweth not God; for God is love.", "1 John 4:8" },
  { "There is no fear in love; but perfect love casteth out fear: because fear hath torment. He that feareth is not made perfect in love.", "1 John 4:18" },
  { "We love him, because he first loved us.", "1 John 4:19" },
  { "And God shall wipe away all tears from their eyes; and there shall be no more death, neither sorrow, nor crying, neither shall there be any more pain: for the former things are passed away.", "Revelation 21:4" },
};
const int N = sizeof(VERSES) / sizeof(VERSES[0]);

int textWidth(const String &s) {
  int16_t x, y; uint16_t w, h;
  display.getTextBounds(s, 0, 0, &x, &y, &w, &h);
  return w;
}

// Breaks the verse into lines no wider than maxW. Returns how many lines it needed.
int wrap(const String &text, int maxW, String lines[], int maxLines) {
  int n = 0; String line, word;
  String t = text + " ";
  for (unsigned i = 0; i < t.length(); i++) {
    char c = t[i];
    if (c != ' ') { word += c; continue; }
    if (!word.length()) continue;
    String tryLine = line.length() ? line + " " + word : word;
    if (textWidth(tryLine) <= maxW || !line.length()) line = tryLine;
    else { if (n < maxLines) lines[n] = line; n++; line = word; }
    word = "";
  }
  if (line.length()) { if (n < maxLines) lines[n] = line; n++; }
  return n;
}

void drawVerse(const String &text, const String &ref) {
  const int M = 8, W = 200 - 2 * M, REF_TOP = 176;
  const GFXfont *fonts[] = { &FreeSerif12pt7b, &FreeSerif9pt7b };
  const int lineH[] = { 24, 18 };
  String lines[14]; int n = 0, f = 0;
  for (f = 0; f < 2; f++) {            // the bigger font if the verse fits in it, else the smaller
    display.setFont(fonts[f]);
    n = wrap(text, W, lines, 14);
    if (n * lineH[f] <= REF_TOP - M - 4 || f == 1) break;
  }
  if (n > 14) n = 14;
  int top = M + (REF_TOP - M - n * lineH[f]) / 2;   // the block sits in the middle of the space above the reference
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setTextColor(GxEPD_BLACK);
    display.setFont(fonts[f]);
    for (int i = 0; i < n; i++) {
      display.setCursor(M + (W - textWidth(lines[i])) / 2, top + (i + 1) * lineH[f] - 6);
      display.print(lines[i]);
    }
    display.drawFastHLine(70, REF_TOP, 60, GxEPD_BLACK);
    display.setFont(&FreeSerifItalic9pt7b);
    display.setCursor(M + (W - textWidth(ref)) / 2, 194);
    display.print(ref);
  } while (display.nextPage());
}

#ifdef VERSE_ICONS
// The icon screen: the verse's icon as big as leaves the verse room, the verse beneath, the reference at the foot.
// If even the 40px icon does not fit, the 20px one sits beside the reference instead.
void drawVerseIcon(const String &text, const String &ref, int which) {
  const int M = 8, W = 200 - 2 * M, REF_TOP = 176, NS = sizeof(ICON_SIZES) / sizeof(ICON_SIZES[0]);
  const GFXfont *fonts[] = { &FreeSerif12pt7b, &FreeSerif9pt7b };
  const int lineH[] = { 24, 18 };
  String lines[14]; int n = 0, f = 1, s = NS - 1; bool beside = true;
  for (int si = 0; si < NS - 1 && beside; si++)
    for (int fi = 0; fi < 2; fi++) {
      display.setFont(fonts[fi]);
      n = wrap(text, W, lines, 14);
      if (ICON_SIZES[si] + 6 + n * lineH[fi] <= REF_TOP - M) { f = fi; s = si; beside = false; break; }
    }
  if (beside) { display.setFont(fonts[1]); n = wrap(text, W, lines, 14); }
  if (n > 14) n = 14;
  const int px = ICON_SIZES[s];
  int block = (beside ? 0 : px + 6) + n * lineH[f];
  int top = M + max(0, (REF_TOP - M - block) / 2);
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setTextColor(GxEPD_BLACK);
    int y = top;
    if (!beside) { display.drawBitmap(100 - px / 2, y, ICONS[which][s], px, px, GxEPD_BLACK); y += px + 6; }
    display.setFont(fonts[f]);
    for (int i = 0; i < n; i++) {
      display.setCursor(M + (W - textWidth(lines[i])) / 2, y + (i + 1) * lineH[f] - 6);
      display.print(lines[i]);
    }
    display.drawFastHLine(70, REF_TOP, 60, GxEPD_BLACK);
    display.setFont(&FreeSerifItalic9pt7b);
    int iw = beside ? px + 4 : 0, x = M + (W - textWidth(ref) - iw) / 2;
    if (beside) display.drawBitmap(x, 179, ICONS[which][s], px, px, GxEPD_BLACK);
    display.setCursor(x + iw, 194);
    display.print(ref);
  } while (display.nextPage());
}
#endif

// Icon mode (470): one icon, its title beneath; the website's widget chose it.
void drawPicture(int k) {
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.drawBitmap((200 - PIC_W) / 2, 4, PICS[k], PIC_W, PIC_H, GxEPD_BLACK);
    display.setTextColor(GxEPD_BLACK);
    display.setFont(&FreeSerifItalic9pt7b);
    String t = PIC_TITLES[k];
    display.setCursor(max(0, (200 - textWidth(t)) / 2), 192);
    display.print(t);
  } while (display.nextPage());
}

// What the website's widget sends over USB (Web Serial, 115200), in the first seconds after a plug-in or RESET:
// "SHOW VERSE <n>" or "SHOW ICON <n>" (0-based). The screen answers "OK" and keeps it; the daily alarm then moves on from there.
bool listen(int &mode, int &i) {
  Serial.begin(115200);
  Serial.println("READY epaper-verse 470");
  String line; unsigned long until = millis() + 6000;
  while (millis() < until) {
    while (Serial.available()) {
      char c = Serial.read();
      if (c != '\n' && c != '\r') { if (line.length() < 40) line += c; continue; }
      line.trim();
      if (line.startsWith("SHOW VERSE ")) { mode = 0; i = line.substring(11).toInt(); }
      else if (line.startsWith("SHOW ICON ")) { mode = 1; i = line.substring(10).toInt(); }
      else { line = ""; continue; }
      i = max(0, i) % (mode ? NPICS : N);
      Serial.println("OK");
      Serial.flush();
      return true;
    }
    delay(10);
  }
  return false;
}

void setup() {
  // Which verse or icon: the daily alarm moves on by one; plugging in or RESET shows the same one again unless the website sends one.
  Preferences keep;
  keep.begin("verse", false);
  int mode = keep.getInt("mode", 0), i = keep.getInt("i", 0);
  i %= (mode ? NPICS : N);
  if (esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER) { i = (i + 1) % (mode ? NPICS : N); keep.putInt("i", i); }
  else if (listen(mode, i)) { keep.putInt("mode", mode); keep.putInt("i", i); }
  keep.end();

  pinMode(EPD_PWR, OUTPUT); digitalWrite(EPD_PWR, LOW);
  SPI.begin(12, -1, 13, 11);
  display.epd2.selectSPI(SPI, SPISettings(4000000, MSBFIRST, SPI_MODE0));
  display.init(0, true, 2, false);
  display.clearScreen();   // a full refresh to white first: nothing old (an earlier picture, a ghost) survives
  if (mode) drawPicture(i);
  else
#ifdef VERSE_ICONS
  drawVerseIcon(VERSES[i][0], VERSES[i][1], VERSE_ICON[i]);
#else
  drawVerse(VERSES[i][0], VERSES[i][1]);
#endif
  display.hibernate();
  digitalWrite(EPD_PWR, HIGH);
  esp_sleep_enable_timer_wakeup(24ULL * 3600 * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
