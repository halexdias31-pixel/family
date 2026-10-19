#include <Arduino.h>
// epaper-verse.ino - a different Bible verse every morning on the Waveshare ESP32-S3-ePaper-1.54.
// Wakes, joins Wi-Fi, asks the Apps Script backend for ?verse=today, draws it, deep-sleeps until about 6am.
// Wi-Fi and the backend address are typed in on a phone (WiFiManager's setup page), kept in flash. GPL-3.0, as GxEPD2.
// Pins come from Waveshare's own demo: github.com/waveshareteam/ESP32-S3-ePaper-1.54, 02_Example/Arduino/*/user_config.h.

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <time.h>
#include <GxEPD2_BW.h>
#include <Fonts/FreeSerif12pt7b.h>
#include <Fonts/FreeSerif9pt7b.h>
#include <Fonts/FreeSerifItalic9pt7b.h>
#include <WiFiManager.h>
#include <ArduinoJson.h>
#include <Preferences.h>

// E-paper wiring on this board (Waveshare user_config.h). The panel is SSD1681-class, 200x200 black/white.
#define EPD_PWR   6    // panel power switch, LOW = on (Waveshare's POWEER_EPD_ON writes 0)
#define EPD_BUSY  8
#define EPD_RST   9
#define EPD_DC   10
#define EPD_CS   11
#define EPD_SCK  12
#define EPD_MOSI 13

GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> display(GxEPD2_154_D67(EPD_CS, EPD_DC, EPD_RST, EPD_BUSY));

const char *TZ_LONDON = "GMT0BST,M3.5.0/1,M10.5.0";   // UK time, summer time included
const int WAKE_HOUR = 6;
const uint64_t RETRY_SECONDS = 30 * 60;
const char *SETUP_AP = "Verse-Setup";
#define BOOT_BUTTON 0
// The site's own backend (js/data.js API); changeable on the setup page.
const char *DEFAULT_URL = "https://script.google.com/macros/s/AKfycbyDr5ZsF63_zfgx3tlhqPF3H7U8zSY8TjB8EKY30ZWxBfDIR0QztN4B64V9c-mud7Go/exec";

Preferences prefs;
String verseUrl;
bool displayReady = false;

void sleepFor(uint64_t seconds) {
  Serial.printf("Sleeping %llu s\n", seconds);
  Serial.flush();
  digitalWrite(EPD_PWR, HIGH);   // panel off; e-paper keeps its picture with no power
  esp_sleep_enable_timer_wakeup(seconds * 1000000ULL);
  esp_deep_sleep_start();
}

bool joinSaved() {
  WiFi.mode(WIFI_STA);
  WiFi.begin();   // the network WiFiManager saved
  for (int i = 0; i < 40 && WiFi.status() != WL_CONNECTED; i++) delay(500);
  return WiFi.status() == WL_CONNECTED;
}

// Apps Script answers on script.google.com, then redirects to googleusercontent.com - follow it.
bool fetchVerse(String &text, String &ref) {
  WiFiClientSecure client;
  client.setInsecure();   // a verse is public and read-only; no certificate to keep up to date
  HTTPClient http;
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.setTimeout(20000);
  if (!http.begin(client, verseUrl + "?verse=today")) return false;
  int code = http.GET();
  String body = code == 200 ? http.getString() : "";
  http.end();
  Serial.printf("HTTP %d, %d bytes\n", code, body.length());
  JsonDocument doc;
  if (code != 200 || deserializeJson(doc, body)) return false;
  text = (const char *)(doc["text"] | "");
  ref = (const char *)(doc["ref"] | "");
  text.trim(); ref.trim();
  return text.length() > 0 && ref.length() > 0;
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

void startDisplay() {
  if (displayReady) return;
  SPI.begin(EPD_SCK, -1, EPD_MOSI, EPD_CS);
  display.epd2.selectSPI(SPI, SPISettings(4000000, MSBFIRST, SPI_MODE0));
  display.init(115200, true, 2, false);
  display.setRotation(0);
  displayReady = true;
}

// Setup instructions on the screen itself, for the phone that will do the typing.
void drawSetup() {
  startDisplay();
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.setTextColor(GxEPD_BLACK);
    display.setFont(&FreeSerif12pt7b);
    display.setCursor(8, 28); display.print("Wi-Fi setup");
    display.setFont(&FreeSerif9pt7b);
    display.setCursor(8, 60);  display.print("On your phone, join");
    display.setCursor(8, 82);  display.print("the Wi-Fi network:");
    display.setCursor(8, 108); display.print(SETUP_AP);
    display.setCursor(8, 140); display.print("A page opens; pick your");
    display.setCursor(8, 162); display.print("home Wi-Fi, type its");
    display.setCursor(8, 184); display.print("password, press Save.");
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
  display.hibernate();
}

uint64_t secondsUntilWake() {
  struct tm now;
  if (!getLocalTime(&now, 10000)) return 24 * 3600ULL;   // no clock: try again in a day
  struct tm next = now;
  next.tm_hour = WAKE_HOUR; next.tm_min = 2; next.tm_sec = 0;   // 06:02, safely after midnight's new verse
  time_t t = mktime(&next);
  if (t <= mktime(&now)) { next.tm_mday += 1; t = mktime(&next); }
  return (uint64_t)(t - mktime(&now));
}

// The phone page: home Wi-Fi plus the backend address. Returns true once connected.
bool runPortal(uint16_t seconds) {
  drawSetup();
  WiFiManager wm;
  WiFiManagerParameter urlField("url", "Verse address (leave as it is)", verseUrl.c_str(), 200);
  wm.addParameter(&urlField);
  wm.setConfigPortalTimeout(seconds);
  bool ok = wm.startConfigPortal(SETUP_AP);
  String u = urlField.getValue(); u.trim();
  if (u.startsWith("https://") && u != verseUrl) { verseUrl = u; prefs.putString("url", u); }
  return ok;
}

// The last verse drawn is kept in flash, so a setup screen that timed out can be put back.
void showVerse(const String &text, const String &ref) {
  startDisplay();
  drawVerse(asciiOnly(text), asciiOnly(ref));
}

void setup() {
  Serial.begin(115200);
  delay(200);
  pinMode(EPD_PWR, OUTPUT);
  digitalWrite(EPD_PWR, LOW);   // panel on
  pinMode(BOOT_BUTTON, INPUT_PULLUP);
  prefs.begin("verse", false);
  verseUrl = prefs.getString("url", DEFAULT_URL);

  // RESET, then hold BOOT within two seconds: open the setup page again (a new router, a new password).
  bool askedSetup = false;
  for (int i = 0; i < 20 && !askedSetup; i++) { askedSetup = digitalRead(BOOT_BUTTON) == LOW; delay(100); }

  bool online = !askedSetup && joinSaved();
  if (!online) online = runPortal(askedSetup || !prefs.getBool("ever", false) ? 600 : 180);
  if (online) prefs.putBool("ever", true);

  String text, ref;
  bool ok = false;
  if (online) {
    configTzTime(TZ_LONDON, "pool.ntp.org", "time.google.com");
    ok = fetchVerse(text, ref);
  }
  if (ok) {
    prefs.putString("text", text); prefs.putString("ref", ref);
    showVerse(text, ref);
    uint64_t s = secondsUntilWake();
    WiFi.disconnect(true);
    sleepFor(s);
  }
  // Failed: the screen keeps the old verse, or gets it back if the setup page covered it.
  if (displayReady && prefs.getString("text", "").length()) showVerse(prefs.getString("text", ""), prefs.getString("ref", ""));
  sleepFor(RETRY_SECONDS);
}

void loop() {}
