#!/bin/sh
# build.sh - builds verse.cpp and merges it into the one epaper-verse.bin install.js writes at 0 (482). Re-run after pictures.h changes.
# PIO=<pio binary> and OUT=<dir for PlatformIO's caches> may be set; nothing is written in the repo but the .bin.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
OUT=${OUT:-${TMPDIR:-/tmp}/epaper-verse-build}
PIO=${PIO:-pio}
export PLATFORMIO_CORE_DIR="$OUT/core" PLATFORMIO_BUILD_DIR="$OUT/build" PLATFORMIO_LIBDEPS_DIR="$OUT/libdeps"
"$PIO" run -d "$HERE" -e epaper-verse
B="$OUT/build/epaper-verse"
ESPTOOL="python3 $OUT/core/packages/tool-esptool/esptool.py"
[ -f "$OUT/core/packages/tool-esptool/esptool.py" ] || ESPTOOL="$(dirname "$PIO")/python -m esptool"
$ESPTOOL --chip esp32s3 merge-bin -o "$HERE/epaper-verse.bin" --flash-mode keep --flash-freq keep --flash-size keep \
  0x0 "$B/bootloader.bin" 0x8000 "$B/partitions.bin" \
  0xe000 "$OUT/core/packages/framework-arduinoespressif32/tools/partitions/boot_app0.bin" 0x10000 "$B/firmware.bin"
sha256sum "$HERE/epaper-verse.bin"
