#!/bin/sh
# fit-test.sh - builds and runs test/fit-test.cpp (fit.h on the computer, no board). Writes only to a temp dir.
set -e
HERE=$(cd "$(dirname "$0")" && pwd)
T=$(mktemp -d)
g++ -std=c++17 -Wall -o "$T/fit-test" "$HERE/fit-test.cpp"
"$T/fit-test"
rm -rf "$T"
