// fit-test.cpp - fit.h on a computer with a pretend font (every character 11 px wide, as FreeSans12pt's letters roughly are).
// Run: sh tools/docket-screen/test/fit-test.sh  (g++, no board). Exit 1 on any wrong answer.
#include "../fit.h"
#include <cstdio>

static int fails = 0;
static void want(bool ok, const char *what) { if (!ok) { std::printf("FAILED - %s\n", what); fails++; } }

int main() {
  auto w = [](const std::string &s) { return (int)s.size() * 11; };
  std::vector<fit::Row> r;

  want(fit::parseList("docket-list\n! Late thing\n- Floss\n- Read\n", r) && r.size() == 3 && r[0].over && !r[1].over && r[2].title == "Read", "a list of three, the first overdue");
  want(fit::parseList("docket-list\r\n- A\r\n", r) && r.size() == 1 && r[0].title == "A", "Windows line ends");
  want(fit::parseList("docket-list", r) && r.empty(), "all done: the heading alone");
  want(!fit::parseList("That address is not right.", r), "a refusal is not a list");
  want(!fit::parseList("<!doctype html><html>", r), "a sign-in page is not a list");
  want(!fit::parseList("docket-list\nsomething else", r), "a strange line makes it not a list");
  want(!fit::parseList("", r), "an empty answer is not a list");

  want(fit::asciiOf("Mum\xE2\x80\x99s tea \xE2\x80\x93 caf\xC3\xA9") == "Mum's tea - cafe", "curly quote, dash and accent");
  want(fit::asciiOf("Water \xF0\x9F\x92\xA7  now ") == "Water now", "an emoji dropped, spaces tidied");

  want(fit::fitTitle("Floss", 170, w) == "Floss", "a short title is left alone");
  std::string longT = "Charge the batteries for the camera";
  std::string got = fit::fitTitle(longT, 170, w);
  want(w(got) <= 170 && got.size() > 3 && got.compare(got.size() - 3, 3, "...") == 0, "a long title is cut to fit with ...");
  want(got == "Charge the...", "cut at a word near the end");
  want(fit::fitTitle("Supercalifragilisticexpialidocious", 170, w) == "Supercalifra...", "one long word cut mid-word");
  want(w(fit::fitTitle("x", 20, w)) <= 33, "a tiny width does not loop");

  fit::Layout L = fit::layout(10, 26, 200, 29);
  want(L.shown == 6 && L.more == 4, "ten items: six shown, four more");
  L = fit::layout(3, 26, 200, 29);
  want(L.shown == 3 && L.more == 0, "three items: all shown");
  L = fit::layout(0, 26, 200, 29);
  want(L.shown == 0 && L.more == 0, "nothing open");

  std::printf("fit-test: %d wrong\n", fails);
  return fails ? 1 : 0;
}
