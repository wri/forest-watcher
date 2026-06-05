#!/usr/bin/env bash

set -euo pipefail

SDK_ROOT="${ANDROID_SDK_ROOT:-${ANDROID_HOME:-}}"

if [[ -z "$SDK_ROOT" ]]; then
  echo "Set ANDROID_HOME or ANDROID_SDK_ROOT before running this check." >&2
  exit 1
fi

if [[ $# -gt 0 ]]; then
  apk_path="$1"
else
  apk_path="$(find android/app/build/outputs/apk -type f -name '*.apk' | sort | tail -n 1)"
fi

if [[ -z "$apk_path" || ! -f "$apk_path" ]]; then
  echo "Provide an APK path or build an APK first." >&2
  exit 1
fi

zipalign_bin="$(find "$SDK_ROOT/build-tools" -type f -name zipalign | sort -V | tail -n 1)"
ndk_root="${ANDROID_NDK_HOME:-}"

if [[ -z "$ndk_root" ]]; then
  ndk_root="$(find "$SDK_ROOT/ndk" -mindepth 1 -maxdepth 1 -type d | sort -V | tail -n 1)"
fi

llvm_readelf=""

if [[ -n "$ndk_root" ]]; then
  # Support different host prebuilts (linux, darwin x86_64/arm64, windows).
  # llvm-readelf may be provided as a symlink in some NDK packages.
  llvm_readelf="$(find "$ndk_root/toolchains/llvm/prebuilt" \( -type f -o -type l \) \( -name llvm-readelf -o -name llvm-readelf.exe \) 2>/dev/null | sort | head -n 1)"
fi

if [[ -z "$zipalign_bin" || ! -x "$zipalign_bin" ]]; then
  echo "Could not find zipalign under $SDK_ROOT/build-tools." >&2
  exit 1
fi

if [[ -z "$ndk_root" || ! -x "$llvm_readelf" ]]; then
  echo "Could not find llvm-readelf under the Android NDK." >&2
  exit 1
fi

tmp_dir="$(mktemp -d)"
trap 'rm -rf "$tmp_dir"' EXIT

unzip -qq "$apk_path" 'lib/*' -d "$tmp_dir"

echo "APK: $apk_path"
echo
echo "ZIP alignment check"
"$zipalign_bin" -c -P 16 -v 4 "$apk_path"

echo
echo "ELF segment alignment check"

shopt -s nullglob
so_files=("$tmp_dir"/lib/arm64-v8a/*.so "$tmp_dir"/lib/x86_64/*.so)

if [[ ${#so_files[@]} -eq 0 ]]; then
  echo "No 64-bit native libraries found in the APK."
  exit 0
fi

failed=0

for so_file in "${so_files[@]}"; do
  bad_alignments=()

  while IFS= read -r load_line; do
    align_value="${load_line##* }"
    if (( align_value < 0x4000 )); then
      bad_alignments+=("$align_value")
    fi
  done < <("$llvm_readelf" -lW "$so_file" | grep 'LOAD')

  if [[ ${#bad_alignments[@]} -eq 0 ]]; then
    echo "ALIGNED   ${so_file#$tmp_dir/}"
  else
    failed=1
    echo "UNALIGNED ${so_file#$tmp_dir/} (${bad_alignments[*]})"
  fi
done

if (( failed != 0 )); then
  exit 1
fi