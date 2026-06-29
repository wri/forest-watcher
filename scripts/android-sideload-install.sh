#!/bin/bash
# Install debug APK to connected Android device

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
source "$SCRIPT_DIR/android-sideload-common.sh"

APK_DIR="$PROJECT_ROOT/android/app/build/outputs/apk/debug"

if [ ! -d "$APK_DIR" ]; then
    echo "Error: APK directory not found. Run 'yarn android:sideload:build' first." >&2
    exit 1
fi

APK_FILE=$(find "$APK_DIR" -maxdepth 1 -name "*.apk" -type f | head -n 1)

if [ -z "$APK_FILE" ]; then
    echo "Error: No APK found in $APK_DIR. Run 'yarn android:sideload:build' first." >&2
    exit 1
fi

ADB=$(find_adb)
TARGET=$(get_target_device "$ADB")

echo "Installing $(basename "$APK_FILE") to device $TARGET..."
"$ADB" -s "$TARGET" install -r "$APK_FILE"
