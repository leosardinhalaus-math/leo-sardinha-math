#!/bin/sh
set -eu
cd "$(dirname "$0")/.."
mkdir -p build
c++ -std=c++20 -O2 -Wall -Wextra -Werror -pedantic -Isrc tests/CoreTests.cpp src/Film.cpp -o build/core-tests
./build/core-tests

c++ -std=c++20 -O2 -Wall -Wextra -Werror -pedantic -Isrc tests/CameraTests.cpp -o build/camera-tests
./build/camera-tests
