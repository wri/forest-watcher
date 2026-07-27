#!/bin/bash

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_ROOT"

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]' 2>/dev/null || echo "0")"
if [ "$NODE_MAJOR" -gt 22 ]; then
  if [ -s "$HOME/.nvm/nvm.sh" ] && [ -d "$HOME/.nvm/versions/node/v22.22.0" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.nvm/nvm.sh"
    nvm use 22.22.0 >/dev/null
    echo "Using Node $(node -v) for Metro."
  else
    echo "Warning: Node $NODE_MAJOR may be unstable with this RN toolchain."
    echo "Install/use Node 22.22.0 for Metro stability."
  fi
fi

# Clear stale Metro listener if present.
METRO_PIDS="$(lsof -ti tcp:8081 2>/dev/null || true)"
if [ "$METRO_PIDS" != "" ]; then
  echo "Killing stale process(es) on :8081 -> $METRO_PIDS"
  # shellcheck disable=SC2086
  kill -9 $METRO_PIDS 2>/dev/null || true
fi

# Reset watchman subscriptions to avoid stale file graph issues.
if command -v watchman >/dev/null 2>&1; then
  watchman watch-del-all >/dev/null 2>&1 || true
fi

# Metro can be memory-hungry on large workspaces; provide a safe default heap
# if the caller hasn't already configured one.
if [[ "${NODE_OPTIONS:-}" != *"max-old-space-size"* ]]; then
  export NODE_OPTIONS="${NODE_OPTIONS:+$NODE_OPTIONS }--max-old-space-size=4096"
  echo "Using NODE_OPTIONS=$NODE_OPTIONS"
fi

exec npx react-native start "$@"
