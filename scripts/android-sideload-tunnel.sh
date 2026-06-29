#!/bin/bash
# Set up adb reverse tunnel for Metro bundler

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/android-sideload-common.sh"

ADB=$(find_adb)
TARGET=$(get_target_device "$ADB")

"$ADB" -s "$TARGET" reverse tcp:8081 tcp:8081
echo "Reverse tunnel established on device $TARGET (tcp:8081)"
