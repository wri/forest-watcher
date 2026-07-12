#!/bin/bash

set -euo pipefail

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