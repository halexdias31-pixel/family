#!/bin/sh
# build.sh - builds docket.cpp and merges it into the one docket-screen.bin install.js writes at 0 (as attic/epaper-verse/build.sh).
# PIO=<pio binary> and OUT=<dir for PlatformIO's caches> may be set; nothing is written in the repo but the .bin and its .md5.
# The .bin holds no Wi-Fi name, password or private address: the installer sends those over USB into the board's NVS (README.md).
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${OUT:-${TMPDIR:-/tmp}/docket-screen-build}
PIO=${PIO:-pio}
export PLATFORMIO_CORE_DIR="$OUT/core" PLATFORMIO_BUILD_DIR="$OUT/build" PLATFORMIO_LIBDEPS_DIR="$OUT/libdeps"
"$PIO" run ${PIO_JOBS:+-j $PIO_JOBS} -d "$HERE" -e docket-screen
B="$OUT/build/docket-screen"
ESPTOOL="python3 $OUT/core/packages/tool-esptool/esptool.py"
[ -f "$OUT/core/packages/tool-esptool/esptool.py" ] || ESPTOOL="$OUT/core/packages/tool-esptool/esptool"   # esptool 5: a program, not a .py
$ESPTOOL --chip esp32s3 merge-bin -o "$HERE/docket-screen.bin" --flash-mode keep --flash-freq keep --flash-size keep \
  0x0 "$B/bootloader.bin" 0x8000 "$B/partitions.bin" \
  0xe000 "$OUT/core/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin" 0x10000 "$B/firmware.bin"
md5sum "$HERE/docket-screen.bin" | cut -c1-32 > "$HERE/docket-screen.md5"   # the installer reads the flash back against it
sha256sum "$HERE/docket-screen.bin"
