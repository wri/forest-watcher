#!/bin/bash

set -euo pipefail

# Ensure script runs from repository root regardless of caller cwd.
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

# Install JavaScript dependencies without changing the lockfile.
yarn install --frozen-lockfile

# Download Realm native binaries.
node node_modules/realm/scripts/download-realm.js ios --sync

# Re-install iOS pods so native React Native pods match JS dependencies.
cd ios
rm -rf Pods

if command -v bundle >/dev/null 2>&1; then
	bundle exec pod install --repo-update
else
	pod install --repo-update
fi

cd ..

echo "~~~~~ It's done! ~~~~~"