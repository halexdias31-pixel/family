#include <Arduino.h>
// verse.cpp - a different Bible verse every morning on the Waveshare ESP32-S3-ePaper-1.54. GPL-3.0, as GxEPD2.
// Wake -> Wi-Fi -> fetch ?verse=today -> draw -> sleep until 06:02 UK time. Wi-Fi is typed into the install page (Improv).
// Pins from Waveshare's demo: github.com/waveshareteam/ESP32-S3-ePaper-1.54, 02_Example/Arduino/*/user_config.h.

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <GxEPD2_BW.h>
#include <Fonts/FreeSerif12pt7b.h>
#include <Fonts/FreeSerif9pt7b.h>
#include <Fonts/FreeSerifItalic9pt7b.h>
#include "improv.h"

#define EPD_PWR 6   // panel power, LOW = on; e-paper keeps its picture with the power off
GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> display(GxEPD2_154_D67(/*CS*/ 11, /*DC*/ 10, /*RST*/ 9, /*BUSY*/ 8));

const char *URL = "https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec?verse=today";
const char *NAME = "Verse of the day", *VERSION = "2026-10-19-g-builtin";   // told to the install page when it asks

// A verse is always shown: these, by date, when the backend cannot be reached or does not answer with a verse yet.
const char *const BUILT_IN[][2] = {
  { "In the beginning God created the heaven and the earth.", "Genesis 1:1" },
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
};

void builtIn(String &text, String &ref) {
  struct tm now;
  long day = getLocalTime(&now, 10000) ? mktime(&now) / 86400 : 0;
  int n = sizeof(BUILT_IN) / sizeof(BUILT_IN[0]);
  text = BUILT_IN[day % n][0]; ref = BUILT_IN[day % n][1];
}

bool online() { return WiFi.status() == WL_CONNECTED; }

// Apps Script answers on script.google.com, then redirects to googleusercontent.com - follow it.
bool fetchVerse(String &text, String &ref) {
  WiFiClientSecure client;
  client.setInsecure();   // a verse is public and read-only; no certificate to keep up to date
  HTTPClient http;
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.setTimeout(20000);
  JsonDocument doc;
  bool ok = http.begin(client, URL) && http.GET() == 200 && !deserializeJson(doc, http.getString());
  http.end();
  text = (const char *)(doc["text"] | ""); ref = (const char *)(doc["ref"] | "");
  return ok && text.length() && ref.length();
}

// The built-in fonts are plain ASCII: turn curly quotes and dashes from a sheet into straight ones.
String asciiOnly(String s) {
  s.replace("\xE2\x80\x98", "'"); s.replace("\xE2\x80\x99", "'");
  s.replace("\xE2\x80\x9C", "\""); s.replace("\xE2\x80\x9D", "\"");
  s.replace("\xE2\x80\x93", "-"); s.replace("\xE2\x80\x94", "-"); s.replace("\xE2\x80\xA6", "...");
  String out;
  for (unsigned i = 0; i < s.length(); i++) if ((uint8_t)s[i] < 128) out += s[i];
  return out;
}

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

// One plain sentence in the middle of the screen: what is happening, or what to do.
void say(const String &msg) {
  display.setFont(&FreeSerif12pt7b);
  String lines[8]; int n = min(wrap(msg, 184, lines, 8), 8);
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setTextColor(GxEPD_BLACK);
    for (int i = 0; i < n; i++) {
      display.setCursor(8 + (184 - textWidth(lines[i])) / 2, 100 - n * 12 + (i + 1) * 24 - 6);
      display.print(lines[i]);
    }
  } while (display.nextPage());
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

uint64_t secondsUntilWake() {
  struct tm now;
  if (!getLocalTime(&now, 10000)) return 24 * 3600ULL;   // no clock: try again in a day
  struct tm next = now;
  next.tm_hour = 6; next.tm_min = 2; next.tm_sec = 0;   // 06:02, safely after midnight's new verse
  time_t t = mktime(&next);
  if (t <= mktime(&now)) { next.tm_mday += 1; t = mktime(&next); }
  return (uint64_t)(t - mktime(&now));
}

// Improv: answers the install page while it waits. A Wi-Fi name and password are joined (and kept by the chip) on the spot.
uint8_t out[300];
void reply(uint8_t type, uint8_t value) { Serial.write(out, improvPacket(out, type, &value, 1)); }
void result(uint8_t cmd, const char *const s[], int k) { Serial.write(out, improvResult(out, cmd, s, k)); }
Improv improv;
bool newWifi = false;

void serveImprov() {
  while (Serial.available()) {
    if (!improv.feed(Serial.read())) continue;
    char ssid[33], pass[65];
    if (improv.cmd() == CMD_STATE) {
      reply(IMPROV_STATE, online() ? PROVISIONED : READY);
      if (online()) result(CMD_STATE, nullptr, 0);
    } else if (improv.cmd() == CMD_INFO) {
      const char *info[] = { NAME, VERSION, "ESP32-S3", "Verse screen" };
      result(CMD_INFO, info, 4);
    } else if (improv.cmd() == CMD_WIFI && improv.wifi(ssid, pass)) {
      reply(IMPROV_STATE, PROVISIONING);
      say("Connecting to Wi-Fi...");
      WiFi.begin(ssid, pass);
      for (int i = 0; i < 40 && !online(); i++) delay(500);
      if (online()) { reply(IMPROV_STATE, PROVISIONED); result(CMD_WIFI, nullptr, 0); newWifi = true; say("Connected - getting today's verse"); }
      else { reply(IMPROV_ERROR, 3); say("Wi-Fi password didn't work - press Install again"); }
    } else reply(IMPROV_ERROR, 2);
  }
}

// Waits up to ms, answering the install page; stops early once online if asked to.
void waitFor(unsigned long ms, bool untilOnline) {
  for (unsigned long t = millis(); millis() - t < ms && !(untilOnline && online()) && !newWifi; delay(20)) serveImprov();
}

bool showToday() {
  String text, ref;
  if (!online()) return false;
  if (!fetchVerse(text, ref)) builtIn(text, ref);
  drawVerse(asciiOnly(text), asciiOnly(ref));
  return true;
}

void setup() {
  Serial.begin(115200);
  pinMode(EPD_PWR, OUTPUT); digitalWrite(EPD_PWR, LOW);
  SPI.begin(12, -1, 13, 11);
  display.epd2.selectSPI(SPI, SPISettings(4000000, MSBFIRST, SPI_MODE0));
  display.init(115200, true, 2, false);
  bool byHand = esp_sleep_get_wakeup_cause() != ESP_SLEEP_WAKEUP_TIMER;   // plugged in or RESET, not the morning alarm
  configTzTime("GMT0BST,M3.5.0/1,M10.5.0", "pool.ntp.org", "time.google.com");   // UK time, summer time included

  WiFi.mode(WIFI_STA);
  WiFi.begin();   // the Wi-Fi saved last time, if any
  if (byHand) say("Connecting to Wi-Fi...");
  waitFor(20000, true);
  if (!online() && byHand) { say("Now type your Wi-Fi name and password on the Chromebook."); waitFor(600000, true); }
  bool shown = showToday();
  if (!shown && byHand) say("No Wi-Fi - plug me into the Chromebook and press Install");
  if (byHand) {   // two minutes in which Install can still change the Wi-Fi
    newWifi = false;
    waitFor(120000, false);
    if (newWifi) shown = showToday();
  }
  display.hibernate();
  digitalWrite(EPD_PWR, HIGH);
  esp_sleep_enable_timer_wakeup((shown ? secondsUntilWake() : 30 * 60ULL) * 1000000ULL);
  esp_deep_sleep_start();
}

void loop() {}
