/* improv-test.js - proves improv.h answers the Improv packets ESP Web Tools sends: node tools/epaper-verse/test/improv-test.js (needs g++). */
'use strict';
const { execFileSync, spawnSync } = require('child_process');
const os = require('os'), path = require('path');
const bin = path.join(os.tmpdir(), 'improv-harness-' + process.pid);
execFileSync('g++', ['-O1', '-o', bin, path.join(__dirname, 'harness.cpp')]);

/* Framed as improv-wifi-serial-sdk's writePacketToStream: header, version 1, type, length, data, checksum, newline. */
const packet = (type, data) => { const p = [...Buffer.from('IMPROV'), 1, type, data.length, ...data]; return [...p, p.reduce((a, b) => a + b, 0) & 255, 10]; };
const rpc = (cmd, data = []) => packet(3, [cmd, data.length, ...data]);
const wifi = (s, p) => rpc(1, [s.length, ...Buffer.from(s), p.length, ...Buffer.from(p)]);
/* Read as the SDK reads: skip lines that are not IMPROV, check version and checksum, split results into strings. */
function talk(bytes) {
  const o = [...spawnSync(bin, { input: Buffer.from(bytes) }).stdout], got = [];
  for (let i = 0; i < o.length;) {
    if (Buffer.from(o.slice(i, i + 6)).toString() !== 'IMPROV') { i++; continue; }
    const type = o[i + 7], len = o[i + 8], data = o.slice(i + 9, i + 9 + len);
    const sum = o.slice(i, i + 9 + len).reduce((a, b) => a + b, 0) & 255;
    if (o[i + 6] !== 1 || o[i + 9 + len] !== sum) got.push('BAD');
    else if (type === 4) { const s = []; for (let j = 2; j < 2 + data[1]; j += data[j] + 1) s.push(Buffer.from(data.slice(j + 1, j + 1 + data[j])).toString()); got.push('result ' + data[0] + ' [' + s.join(',') + ']'); }
    else got.push((type === 1 ? 'state ' : 'error ') + data[0]);
    i += 11 + len;
  }
  return got.join('; ');
}
const cases = [
  ['fresh board: state is Ready', rpc(2), 'state 2'],
  ['device info', rpc(3), 'result 3 [Verse of the day,v,ESP32-S3,Verse screen]'],
  ['good Wi-Fi, then asked again', [...wifi('home', 'secret'), ...rpc(2)], 'state 3; state 4; result 1 []; state 4; result 2 []'],
  ['wrong password', wifi('home', 'nope'), 'state 3; error 3'],
  ['noise and a bad checksum are ignored', [...Buffer.from('IMPRxyz\n'), ...rpc(2).map((b, i, a) => (i === a.length - 2 ? b ^ 1 : b)), ...rpc(2)], 'state 2'],
  ['unknown command', rpc(9), 'error 2'],
  ['an empty password is fine', wifi('home', ''), 'state 3; error 3'],
];
const fails = cases.filter(([, b, want]) => talk(b) !== want).map(([n, b, want]) => n + ': got "' + talk(b) + '", want "' + want + '"');
require('fs').rmSync(bin, { force: true });
if (fails.length) { console.log('FAILED — Improv\n  ' + fails.join('\n  ')); process.exit(1); }
console.log('improv-test: ' + cases.length + ' exchanges as the install page sends them');
