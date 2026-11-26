#include <Arduino.h>
// docket.cpp - what is due now on the owner's Docket, on the Waveshare ESP32-S3-ePaper-1.54 (200x200, black and white). GPL-3.0, as GxEPD2.
// Every wake: Wi-Fi on, ask the private address for its list (`&do=list`, backend/post-account.gs docketAnswer_), draw the first rows
// (a tick box and the title each), keep the list in NVS, sleep 10 minutes. No answer: the last good list, marked "offline".
// The Wi-Fi name, its password and the private address are NOT in this file or the .bin: install.html sends them over USB (README.md).
// Board code (pins, panel power, battery latch, USB name, staying awake on a computer) is attic/epaper-verse/verse.cpp's.

#include <Preferences.h>
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <USB.h>
#include "tusb.h"
#include <GxEPD2_BW.h>
#include <Fonts/FreeSans12pt7b.h>
#include <Fonts/FreeSansBold9pt7b.h>
#include <Fonts/FreeSans9pt7b.h>
#include "fit.h"

#define EPD_PWR 6    // panel power, LOW = on; e-paper keeps its picture with the power off
#define VBAT_PWR 17  // the battery latch: HIGH keeps a battery-only board on after ⏻ (attic/epaper-verse 485)
GxEPD2_BW<GxEPD2_154_D67, GxEPD2_154_D67::HEIGHT> display(GxEPD2_154_D67(/*CS*/ 11, /*DC*/ 10, /*RST*/ 9, /*BUSY*/ 8));

const char *const VERSION = "READY docket-screen 1";
const unsigned long SLEEP_MS = 10UL * 60 * 1000, AWAKE = 60000, WIFI_WAIT = 20000;
const int TOP = 26, ROW_H = 29, BOX = 16, TEXT_X = 28, MAX_BODY = 3000;

Preferences keep;   // namespace "docket": ssid, pass, url (from the installer), last (the last good list)

int textWidth(const std::string &s) {
  int16_t x, y; uint16_t w, h;
  display.getTextBounds(s.c_str(), 0, 0, &x, &y, &w, &h);
  return w;
}

// The heading band in black: "Docket" on the left; on the right "offline", "+N more" or nothing.
// Then one row per item: an empty tick box (a thick one when overdue) and the title, cut to fit (fit.h).
void drawList(const std::vector<fit::Row> &rows, bool offline, const char *say) {
  fit::Layout L = fit::layout(rows.size(), TOP, 200, ROW_H);
  pinMode(EPD_PWR, OUTPUT); digitalWrite(EPD_PWR, LOW);
  display.init(0, true, 2, false);
  display.setRotation(0);
  display.setFullWindow();
  display.firstPage();
  do {
    display.fillScreen(GxEPD_WHITE);
    display.fillRect(0, 0, 200, TOP - 4, GxEPD_BLACK);
    display.setTextColor(GxEPD_WHITE);
    display.setFont(&FreeSansBold9pt7b);
    display.setCursor(6, 16); display.print("Docket");
    std::string right = offline ? "offline" : L.more ? "+" + std::to_string(L.more) + " more" : "";
    if (!right.empty()) {
      display.setFont(&FreeSans9pt7b);
      display.setCursor(194 - textWidth(right), 16); display.print(right.c_str());
    }
    display.setTextColor(GxEPD_BLACK);
    display.setFont(&FreeSans12pt7b);
    if (say) {   // nothing to list: all done, or how to set the screen up
      std::string a = fit::fitTitle(say, 188, textWidth);
      display.setCursor((200 - textWidth(a)) / 2, 112); display.print(a.c_str());
    }
    for (int i = 0; i < L.shown; i++) {
      int y = TOP + i * ROW_H, by = y + (ROW_H - BOX) / 2;
      display.drawRect(4, by, BOX, BOX, GxEPD_BLACK);
      if (rows[i].over) { display.drawRect(5, by + 1, BOX - 2, BOX - 2, GxEPD_BLACK); display.drawRect(6, by + 2, BOX - 4, BOX - 4, GxEPD_BLACK); }
      std::string t = fit::fitTitle(fit::asciiOf(rows[i].title), 200 - TEXT_X - 2, textWidth);
      display.setCursor(TEXT_X, y + ROW_H - 8); display.print(t.c_str());
    }
  } while (display.nextPage());
  display.hibernate();
  digitalWrite(EPD_PWR, HIGH);
}

// The private address with `do=list` added (unless the address already says what to do).
String listUrl(String u) {
  if (u.indexOf("do=") >= 0) return u;
  return u + (u.indexOf('?') >= 0 ? "&do=list" : "?do=list");
}

// True with the body when the address answered with a list. Apps Script answers through a redirect, so redirects are followed.
// The certificate is not pinned (setInsecure): the link is still encrypted, the token is the only secret, and it can be renewed on the Docket.
bool fetch(std::string &body) {
  String ssid = keep.getString("ssid", ""), pass = keep.getString("pass", ""), url = keep.getString("url", "");
  if (!ssid.length() || !url.length()) return false;
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid.c_str(), pass.c_str());
  unsigned long t0 = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - t0 < WIFI_WAIT) delay(100);
  bool ok = false;
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClientSecure tls; tls.setInsecure();
    HTTPClient http;
    http.setFollowRedirects(HTTPC_FORCE_FOLLOW_REDIRECTS);
    http.setTimeout(15000);
    if (http.begin(tls, listUrl(url)) && http.GET() == 200) {
      String b = http.getString();
      if (b.length() <= MAX_BODY) { body = b.c_str(); std::vector<fit::Row> r; ok = fit::parseList(body, r); }
    }
    http.end();
  }
  WiFi.disconnect(true); WiFi.mode(WIFI_OFF);
  return ok;
}

// Fetch, draw, keep. What the serial "SAVE" and every wake run. Returns true when the list came fresh.
bool refresh() {
  if (!keep.getString("url", "").length()) {
    drawList({}, false, "Plug in to set up");
    return false;
  }
  std::string body; std::vector<fit::Row> rows;
  bool fresh = fetch(body);
  if (fresh) keep.putString("last", body.c_str());
  else body = keep.getString("last", "").c_str();
  bool have = fit::parseList(body, rows);
  drawList(rows, !fresh, rows.size() ? nullptr : have ? "All done" : "No list yet");
  return fresh;
}

// What install.html sends over USB (Web Serial, 115200) while the screen is awake, one line each:
//   HELLO -> READY docket-screen 1;  WIFI <name> / PASS <password> / URL <private address> -> OK (held, not yet kept);
//   SAVE -> SAVED (kept in NVS), then a fetch and DRAWN fresh|offline;  FORGET -> FORGOTTEN (all of it wiped);  REFRESH -> DRAWN ...
// Nothing said back ever repeats the password or the address.
String heard, nSsid, nPass, nUrl;
bool gotSsid = false, gotPass = false, gotUrl = false;
bool hear() {
  bool acted = false;
  while (Serial.available()) {
    char c = Serial.read();
    if (c != '\n' && c != '\r') { if (heard.length() < 600) heard += c; continue; }
    String h = heard; heard = "";
    if (h == "HELLO") Serial.println(VERSION);
    else if (h.startsWith("WIFI ")) { nSsid = h.substring(5); gotSsid = true; Serial.println("OK"); }
    else if (h.startsWith("PASS")) { nPass = h.length() > 5 ? h.substring(5) : ""; gotPass = true; Serial.println("OK"); }   // an open network has none
    else if (h.startsWith("URL ")) { nUrl = h.substring(4); nUrl.trim(); gotUrl = true; Serial.println("OK"); }
    else if (h == "SAVE") {
      if (!gotSsid || !gotUrl || !nUrl.startsWith("https://")) { Serial.println("NO need WIFI and an https URL"); continue; }
      keep.putString("ssid", nSsid); keep.putString("pass", gotPass ? nPass : ""); keep.putString("url", nUrl); keep.remove("last");
      nPass = ""; gotSsid = gotPass = gotUrl = false;
      Serial.println("SAVED"); Serial.flush();
      Serial.println(refresh() ? "DRAWN fresh" : "DRAWN offline");
      acted = true;
    }
    else if (h == "REFRESH") { Serial.println(refresh() ? "DRAWN fresh" : "DRAWN offline"); acted = true; }
    else if (h == "FORGET") { keep.clear(); Serial.println("FORGOTTEN"); refresh(); acted = true; }
    else if (h.length()) Serial.println("NO");
    Serial.flush();
  }
  return acted;
}

// After a plug-in, RESET or ⏻ the screen stays awake 60 s, and as long as a computer is attached, listening (deep sleep turns its
// USB off, attic/epaper-verse 482); the 10-minute timer wake listens 3 s. Awake on a computer, it still refreshes every 10 minutes.
void setup() {
  gpio_hold_dis((gpio_num_t)VBAT_PWR);
  pinMode(VBAT_PWR, OUTPUT); digitalWrite(VBAT_PWR, HIGH);
  gpio_hold_en((gpio_num_t)VBAT_PWR);
  keep.begin("docket", false);
  bool timer = esp_sleep_get_wakeup_cause() == ESP_SLEEP_WAKEUP_TIMER;
  USB.manufacturerName("@family.");
  USB.productName("@family. screen");
  Serial.begin(115200);
  USB.begin();
  SPI.begin(12, -1, 13, 11);
  display.epd2.selectSPI(SPI, SPISettings(4000000, MSBFIRST, SPI_MODE0));
  refresh();
  Serial.println(VERSION);
  unsigned long drawn = millis(), until = millis() + (timer ? 3000 : AWAKE);
  while ((long)(until - millis()) > 0 || tud_mounted()) {
    if (hear()) { drawn = millis(); until = millis() + AWAKE; }
    if (millis() - drawn >= SLEEP_MS) { refresh(); drawn = millis(); }
    delay(10);
  }
  keep.end();
  gpio_deep_sleep_hold_en();
  esp_sleep_enable_timer_wakeup((uint64_t)SLEEP_MS * 1000ULL);
  esp_deep_sleep_start();
}

void loop() {}
