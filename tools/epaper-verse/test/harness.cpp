// harness.cpp - improv.h on a computer: stdin is the install page, stdout the board. Wi-Fi "home" / "secret" "works".
#include <stdio.h>
#include "../improv.h"
uint8_t out[300]; bool on = false;
void put(int n) { fwrite(out, 1, n, stdout); fflush(stdout); }
void reply(uint8_t type, uint8_t v) { put(improvPacket(out, type, &v, 1)); }
int main() {
  Improv im; int c;
  fputs("boot log line\n", stdout);   // the board prints other things too; the page must skip them
  while ((c = getchar()) != EOF) {
    if (!im.feed(c)) continue;
    char ssid[33], pass[65];
    if (im.cmd() == CMD_STATE) { reply(IMPROV_STATE, on ? PROVISIONED : READY); if (on) put(improvResult(out, CMD_STATE, nullptr, 0)); }
    else if (im.cmd() == CMD_INFO) { const char *i[] = { "Verse of the day", "v", "ESP32-S3", "Verse screen" }; put(improvResult(out, CMD_INFO, i, 4)); }
    else if (im.cmd() == CMD_WIFI && im.wifi(ssid, pass)) {
      reply(IMPROV_STATE, PROVISIONING);
      on = !strcmp(ssid, "home") && !strcmp(pass, "secret");
      if (on) { reply(IMPROV_STATE, PROVISIONED); put(improvResult(out, CMD_WIFI, nullptr, 0)); } else reply(IMPROV_ERROR, 3);
    } else reply(IMPROV_ERROR, 2);
  }
}
