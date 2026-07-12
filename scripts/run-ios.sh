#!/bin/bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

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
if [ "${1:-}" != "" ]; then
  SIMULATOR_NAME="$1"
elif [ "${IOS_SIMULATOR:-}" != "" ]; then
  SIMULATOR_NAME="$IOS_SIMULATOR"
else
  # Stable preference order across recent Xcode simulator sets.
  # We intentionally prefer these known-good targets over arbitrary booted
  # devices (e.g. iPhone 17 runtimes) which can fail this project's build.
  for preferred in "iPhone 16 Pro" "iPhone 16" "iPhone 15 Pro" "iPhone 15"; do
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

echo "Using iOS simulator: $SIMULATOR_NAME"
npx react-native run-ios --mode Debug --simulator "$SIMULATOR_NAME"