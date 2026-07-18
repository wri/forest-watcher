#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

# Xcode 26 simulator runtimes (e.g. iOS 26.x) are arm64-only.
# If this script is launched from a Rosetta x86_64 shell on Apple Silicon,
# re-exec under native arm64 so xcodebuild can resolve those destinations.
if [ "${RUN_IOS_ARM64_REEXEC:-0}" != "1" ] \
  && [ "$(uname -m)" = "x86_64" ] \
  && [ "$(sysctl -in hw.optional.arm64 2>/dev/null || echo 0)" = "1" ]; then
  echo "Detected Rosetta shell. Re-running under native arm64 for iOS Simulator support."
  exec env RUN_IOS_ARM64_REEXEC=1 /usr/bin/arch -arm64 /bin/bash "$0" "$@"
fi

if [ ! -e .env ]; then
  if [ -f .env.ios ]; then
    ln -s .env.ios .env
    echo "Linked .env -> .env.ios for iOS config."
  else
    echo "Missing .env. Create it from .env.sample or add .env.ios before running iOS."
    exit 1
  fi
fi

if ! grep -Eq '^API_AUTH=.+' .env; then
  echo "Missing API_AUTH in .env. Fill in the auth endpoint before running iOS."
  exit 1
fi

if [ -f .env.ios ]; then
  printf '.env.ios\n' > /tmp/envfile
else
  printf '.env\n' > /tmp/envfile
fi

export BUILD_DIR="$ROOT_DIR/ios/build"
mkdir -p "$BUILD_DIR"
ruby node_modules/react-native-config/ios/ReactNativeConfig/BuildXCConfig.rb "$ROOT_DIR" "$ROOT_DIR/ios/tmp.xcconfig"
ruby node_modules/react-native-config/ios/ReactNativeConfig/BuildDotenvConfig.rb "$ROOT_DIR" "$ROOT_DIR/node_modules/react-native-config/ios/ReactNativeConfig"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "0")"
if [ "$NODE_MAJOR" -gt 22 ]; then
  echo "Warning: Node $NODE_MAJOR may be incompatible with this React Native iOS toolchain."
  echo "Try Node 20 or 22 LTS if build output looks malformed."

  # If nvm is available and Node 22 is installed, switch automatically.
  if [ -s "$HOME/.nvm/nvm.sh" ] && [ -d "$HOME/.nvm/versions/node/v22.22.0" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.nvm/nvm.sh"
    nvm use 22.22.0 >/dev/null
    NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "0")"
    echo "Switched to Node $(node -v) for iOS run."
  fi
fi

# Allow explicit override from CLI arg or env var.
SIM_EXCLUDES_ARM64=0
if grep -Eq '^EXCLUDED_ARCHS\[sdk=iphonesimulator\*\][[:space:]]*=[[:space:]]*arm64' "$ROOT_DIR/ios/ForestWatcher.debug.xcconfig" 2>/dev/null; then
  SIM_EXCLUDES_ARM64=1
fi

if [ "${1:-}" != "" ]; then
  SIMULATOR_NAME="$1"
elif [ "${IOS_SIMULATOR:-}" != "" ]; then
  SIMULATOR_NAME="$IOS_SIMULATOR"
else
  # Stable preference order across recent Xcode simulator sets.
  # If arm64 simulator arch is excluded by project settings, iOS 26.x runtimes
  # are ineligible and we must prefer x86_64-era simulator models.
  if [ "$SIM_EXCLUDES_ARM64" = "1" ]; then
    preferred_devices=("iPhone 16 Pro" "iPhone 16" "iPhone 15 Pro" "iPhone 15")
  else
    preferred_devices=("iPhone 17 Pro" "iPhone 16 Pro" "iPhone 16" "iPhone 15 Pro" "iPhone 15")
  fi

  for preferred in "${preferred_devices[@]}"; do
    if xcrun simctl list devices available | grep -Fq "$preferred ("; then
      SIMULATOR_NAME="$preferred"
      break
    fi
  done

  if [ "$SIMULATOR_NAME" = "" ]; then
    # Last resort: first available iPhone simulator.
    SIMULATOR_NAME="$(xcrun simctl list devices available | awk -F '[()]' '/iPhone/{gsub(/^[[:space:]]+|[[:space:]]+$/, "", $1); print $1; exit}')"
  fi
fi

if [ "$SIMULATOR_NAME" = "" ]; then
  echo "No available iOS simulator found. Install one in Xcode > Settings > Components."
  exit 1
fi

if [ "${IOS_SIMULATOR_RUNTIME:-}" != "" ]; then
  SIMULATOR_RUNTIME="$IOS_SIMULATOR_RUNTIME"
elif [ "$SIM_EXCLUDES_ARM64" = "1" ]; then
  SIMULATOR_RUNTIME=""
else
  SIMULATOR_RUNTIME="26.5"
fi

if [ "$SIMULATOR_RUNTIME" != "" ]; then
  SIMULATOR_UDID="$(xcrun simctl list devices available | awk -v runtime="$SIMULATOR_RUNTIME" -v name="$SIMULATOR_NAME" '
    /^-- / { in_runtime = ($0 == "-- iOS " runtime " --") }
    in_runtime && index($0, name " (") {
      if (match($0, /\(([0-9A-F-]+)\)/)) {
        print substr($0, RSTART + 1, RLENGTH - 2)
        exit
      }
    }
  ')"
else
  SIMULATOR_UDID="$(xcrun simctl list devices available | awk -v name="$SIMULATOR_NAME" '
    index($0, name " (") {
      if (match($0, /\(([0-9A-F-]+)\)/)) {
        print substr($0, RSTART + 1, RLENGTH - 2)
        exit
      }
    }
  ')"
fi

if [ "$SIMULATOR_UDID" != "" ]; then
  if [ "$SIMULATOR_RUNTIME" != "" ]; then
    echo "Using iOS simulator: $SIMULATOR_NAME (iOS $SIMULATOR_RUNTIME, $SIMULATOR_UDID)"
  else
    echo "Using iOS simulator: $SIMULATOR_NAME (first compatible runtime, $SIMULATOR_UDID)"
  fi
  npx react-native run-ios --mode Debug --udid "$SIMULATOR_UDID"
else
  echo "Using iOS simulator: $SIMULATOR_NAME (first available runtime)"
  npx react-native run-ios --mode Debug --simulator "$SIMULATOR_NAME"
fi