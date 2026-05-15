# Debug on Physical Android Device

Run and debug the dev build alongside the production app on a real Android device over USB.

---

## 1. Enable Developer Options & USB Debugging

Enable Developer Options on the device, then turn on **USB Debugging** under Developer Options. Steps vary slightly by manufacturer but follow the standard Android pattern.

---

## 2. Install ADB

ADB (Android Debug Bridge) is part of the Android SDK Platform Tools.

**macOS (Homebrew):**
```bash
brew install android-platform-tools
```

Verify:
```bash
adb version
# Android Debug Bridge version 1.0.41
```

Confirm the device is recognised after plugging in via USB (accept the "Allow USB Debugging" prompt on the device):
```bash
adb devices
# List of devices attached
# R3CN90XXXXX    device
```

Reference: [Android SDK Platform Tools](https://developer.android.com/tools/releases/platform-tools)

---

## 3. Build & Install the Dev APK

The project provides npm scripts for the full flow. From the project root:

```bash
# Build, install, and set up the Metro tunnel in one step
yarn android:sideload
```

Or run each step individually:

```bash
# 1. Compile the debug APK
yarn android:sideload:build

# 2. Push it to the connected device
yarn android:sideload:install

# 3. Reverse-tunnel port 8081 so the device can reach Metro on your Mac
yarn android:sideload:tunnel
```

The tunnel step (`adb reverse`) must be re-run each time you replug the cable or restart ADB.  
If more than one device is connected, the scripts auto-pick the first non-emulator entry. For multiple physical devices, pass the serial explicitly:

```bash
adb -s <SERIAL> reverse tcp:8081 tcp:8081
adb -s <SERIAL> install -r android/app/build/outputs/apk/debug/<apk-name>.apk
```

The dev build installs as `com.forestwatcher.debug` and coexists with the production app. Start Metro before launching it:

```bash
yarn start
```

Reference: [React Native — Running on Device](https://reactnative.dev/docs/running-on-device)

---

## 4. Mirror the Device with scrcpy

[scrcpy](https://github.com/Genymobile/scrcpy) streams the device display to your Mac over the existing ADB connection — no extra software on the device required.

**Install (Homebrew):**
```bash
brew install scrcpy
```

**Launch:**
```bash
scrcpy
```

**Recommended flags:**

| Flag | Effect |
|---|---|
| `--stay-awake` | Prevents the device screen from sleeping while connected |
| `--turn-screen-off` | Keeps the device screen off while still mirroring to your Mac |
| `--max-fps 30` | Caps frame rate to reduce USB bandwidth |
| `--window-title "Forest Watcher"` | Names the mirror window |

Example combining common options:
```bash
scrcpy --stay-awake --max-fps 30 --window-title "Forest Watcher"
```

If multiple devices are connected:
```bash
scrcpy -s <SERIAL> --stay-awake
```

Reference: [scrcpy — GitHub](https://github.com/Genymobile/scrcpy) · [scrcpy — Connection options](https://github.com/Genymobile/scrcpy/blob/master/doc/connection.md)
