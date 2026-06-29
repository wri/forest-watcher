#!/bin/bash
# Shared utilities for Android sideload scripts

set -euo pipefail

find_adb() {
    local adb="${ADB:-$(command -v adb || true)}"

    if [ -z "$adb" ] || [ ! -x "$adb" ]; then
        local sdk_adb="${ANDROID_HOME:+$ANDROID_HOME/platform-tools/adb}"
        if [ -n "$sdk_adb" ] && [ -x "$sdk_adb" ]; then
            adb="$sdk_adb"
        else
            adb="$HOME/Android/platform-tools/adb"
        fi
    fi

    if [ ! -x "$adb" ]; then
        echo "Error: adb not found. Install Android SDK or set ADB=/path/to/adb" >&2
        exit 1
    fi

    echo "$adb"
}

get_target_device() {
    local adb="$1"
    local serials
    local count

    serials=$("$adb" devices | awk '$2=="device"{print $1}')
    count=$(echo "$serials" | sed '/^$/d' | wc -l | tr -d ' ')

    if [ "$count" -eq 0 ]; then
        echo "No Android device or emulator found. Connect one or set SERIAL=<device-id>." >&2
        exit 1
    fi

    if [ "$count" -gt 1 ] && [ -z "${SERIAL:-}" ]; then
        echo "Multiple Android devices/emulators detected. Set SERIAL=<device-id>." >&2
        echo "$serials" >&2
        exit 1
    fi

    echo "${SERIAL:-$(echo "$serials" | head -n 1)}"
}
