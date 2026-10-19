// improv.h - the Improv Wi-Fi serial protocol (improv-wifi.com), the part install.js speaks. Plain C++, so test/improv-test.js can run it.
// A packet is "IMPROV", version 1, type, length, data, checksum (low byte of the sum of everything before it).
#pragma once
#include <stdint.h>
#include <string.h>

enum { IMPROV_STATE = 1, IMPROV_ERROR = 2, IMPROV_RPC = 3, IMPROV_RESULT = 4 };
enum { READY = 2, PROVISIONING = 3, PROVISIONED = 4 };
enum { CMD_WIFI = 1, CMD_STATE = 2, CMD_INFO = 3 };

struct Improv {
  uint8_t b[300]; int n = 0;
  // Takes one byte; true when b holds a whole RPC packet with a good checksum. cmd() is b[9]; its fields start at b[11].
  bool feed(uint8_t c) {
    static const char head[] = "IMPROV\x01";
    if (n < 7 && c != (uint8_t)head[n]) { n = c == 'I'; if (n) b[0] = c; return false; }
    b[n++] = c;
    if (n < 10 || n < 10 + b[8]) return false;
    int len = n; n = 0;
    uint8_t sum = 0;
    for (int i = 0; i < len - 1; i++) sum += b[i];
    return sum == b[len - 1] && b[7] == IMPROV_RPC && b[8] >= 2;
  }
  int cmd() { return b[9]; }
  // Wi-Fi name and password from a CMD_WIFI packet.
  bool wifi(char ssid[33], char pass[65]) {
    int s = b[11], p = b[12 + s];
    if (s > 32 || p > 64 || 13 + s + p > 11 + b[10]) return false;
    memcpy(ssid, b + 12, s); ssid[s] = 0;
    memcpy(pass, b + 13 + s, p); pass[p] = 0;
    return s > 0;
  }
};

// Writes one packet into out; returns its length. data[0..len) is the body.
inline int improvPacket(uint8_t *out, uint8_t type, const uint8_t *data, int len) {
  memcpy(out, "IMPROV\x01", 7); out[7] = type; out[8] = len;
  memcpy(out + 9, data, len);
  uint8_t sum = 0;
  for (int i = 0; i < 9 + len; i++) sum += out[i];
  out[9 + len] = sum; out[10 + len] = '\n';
  return 11 + len;
}

// An RPC result: the command, then each string with its length in front.
inline int improvResult(uint8_t *out, uint8_t cmd, const char *const strs[], int k) {
  uint8_t d[250]; int n = 2;
  for (int i = 0; i < k; i++) { int l = strlen(strs[i]); d[n++] = l; memcpy(d + n, strs[i], l); n += l; }
  d[0] = cmd; d[1] = n - 2;
  return improvPacket(out, IMPROV_RESULT, d, n);
}
