/* @family. — qr.js A QR CODE DRAWN HERE, no library and no service: byte mode, error level M, versions 1–10 (up to 213 bytes, ample for a link). */


/* GF(256) over 0x11D, the field Reed–Solomon codes in a QR code live in. */
const QR_EXP_ = new Array(512), QR_LOG_ = new Array(256);
(() => { let x = 1; for (let i = 0; i < 255; i++) { QR_EXP_[i] = x; QR_LOG_[x] = i; x <<= 1; if (x & 256) x ^= 0x11D; }
  for (let i = 255; i < 512; i++) QR_EXP_[i] = QR_EXP_[i - 255]; })();









