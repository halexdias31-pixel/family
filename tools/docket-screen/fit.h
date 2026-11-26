// fit.h - the Docket screen's pure parts: read the private address's list, make titles drawable, fit them to 200x200.
// No Arduino here, so test/fit-test.cpp runs it on a computer (g++) with a pretend font. GPL-3.0, as the firmware.
#pragma once
#include <string>
#include <vector>
#include <functional>

namespace fit {

// The list answer (backend/post-account.gs docketAnswer_, `do=list`): the first line is exactly "docket-list",
// then one open item per line in the card's order (dkSort_): "- title", or "! title" for an overdue one.
const char *const HEAD = "docket-list";

struct Row { std::string title; bool over; };

// False when the body is not a list (a refusal, a Google sign-in page, a cut-off answer): the screen then keeps its last good list.
inline bool parseList(const std::string &body, std::vector<Row> &rows) {
  rows.clear();
  size_t at = 0; bool first = true;
  while (at <= body.size()) {
    size_t nl = body.find('\n', at);
    std::string line = body.substr(at, nl == std::string::npos ? std::string::npos : nl - at);
    if (!line.empty() && line.back() == '\r') line.pop_back();
    if (first) { if (line != HEAD) return false; first = false; }
    else if (line.size() >= 2 && (line[0] == '-' || line[0] == '!') && line[1] == ' ') rows.push_back({ line.substr(2), line[0] == '!' });
    else if (!line.empty()) return false;
    if (nl == std::string::npos) break;
    at = nl + 1;
  }
  return !first;
}

// The panel's fonts (Adafruit GFX) hold ASCII 0x20-0x7E only: curly quotes and dashes become straight ones,
// common accented letters lose their accent, anything else (an emoji) is dropped; runs of spaces become one.
inline std::string asciiOf(const std::string &s) {
  static const char *const MAP[][2] = {
    { "\xE2\x80\x98", "'" }, { "\xE2\x80\x99", "'" }, { "\xE2\x80\x9C", "\"" }, { "\xE2\x80\x9D", "\"" },
    { "\xE2\x80\x93", "-" }, { "\xE2\x80\x94", "-" }, { "\xE2\x80\xA6", "..." }, { "\xC2\xA0", " " }, { "\xC2\xA3", "GBP" },
    { "\xC3\xA0", "a" }, { "\xC3\xA1", "a" }, { "\xC3\xA2", "a" }, { "\xC3\xA4", "a" }, { "\xC3\xA7", "c" },
    { "\xC3\xA8", "e" }, { "\xC3\xA9", "e" }, { "\xC3\xAA", "e" }, { "\xC3\xAB", "e" }, { "\xC3\xAD", "i" }, { "\xC3\xAF", "i" },
    { "\xC3\xB1", "n" }, { "\xC3\xB3", "o" }, { "\xC3\xB4", "o" }, { "\xC3\xB6", "o" }, { "\xC3\xBA", "u" }, { "\xC3\xBC", "u" },
    { "\xC3\x89", "E" }, { "\xC3\x9C", "U" }, { "\xC3\x96", "O" },
  };
  std::string out;
  for (size_t i = 0; i < s.size();) {
    unsigned char c = s[i];
    if (c < 0x80) { char ch = (c < 0x20 || c == 0x7F) ? ' ' : (char)c; if (!(ch == ' ' && (out.empty() || out.back() == ' '))) out += ch; i++; continue; }
    bool hit = false;
    for (auto &m : MAP) { std::string k = m[0]; if (s.compare(i, k.size(), k) == 0) { out += m[1]; i += k.size(); hit = true; break; } }
    if (hit) continue;
    size_t n = c >= 0xF0 ? 4 : c >= 0xE0 ? 3 : c >= 0xC0 ? 2 : 1;   // one whole character, whatever its length
    i += n;
  }
  while (!out.empty() && out.back() == ' ') out.pop_back();
  return out;
}

// One title on one line: as it is if it fits maxW, else cut (at a word if one ends in the last third) with "..." on the end.
inline std::string fitTitle(const std::string &t, int maxW, const std::function<int(const std::string &)> &width) {
  if (width(t) <= maxW) return t;
  std::string s = t;
  while (!s.empty() && width(s + "...") > maxW) s.pop_back();
  size_t sp = s.rfind(' ');
  if (sp != std::string::npos && sp >= s.size() * 2 / 3) s = s.substr(0, sp);
  while (!s.empty() && (s.back() == ' ' || s.back() == ',' || s.back() == '-')) s.pop_back();
  return s + "...";
}

// How the 200x200 panel is shared: a heading band, then rows of one tick box and one title each.
struct Layout { int shown; int more; };
inline Layout layout(int total, int top, int height, int rowH) {
  int cap = (height - top) / rowH;
  if (cap < 0) cap = 0;
  int shown = total < cap ? total : cap;
  return { shown, total - shown };
}

}  // namespace fit
