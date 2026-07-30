# iOS 2026 Release Readiness

**Ticket**: FW-30  
**Last Updated**: 2026-06-24  
**Environment**: Xcode 26 / iOS 26.5 SDK, React Native 0.79.0

---

## Acceptance Criteria Status

| # | Criterion | Status | Evidence / Notes |
|---|---|---|---|
| 1 | App builds successfully with Xcode 26 + iOS 26 SDK | ⛔ BLOCKED | Build now gets past the prior `react-native-navigation` compile failures and stops at simulator link time in legacy `Mapbox.framework` (`built for 'iOS'`). |
| 2 | APNs trust store update | ✅ N/A | Push notifications are not used by this app. |
| 3 | High-priority deprecated API warnings resolved | ⚠️ PARTIAL | `AddressBook.framework` removed. Remaining warning triage depends on successful clean build. |
| 4 | Receipt validation (SHA-256 / AppTransaction) | ✅ N/A | No IAP or StoreKit receipt validation flow in app code. |
| 5 | Required-reason API declarations complete | ✅ DONE | `ios/ForestWatcher/PrivacyInfo.xcprivacy` completed and audited. |
| 6 | App Store Connect Age Rating questionnaire | ⬜ PENDING | Manual App Store Connect action. |
| 7 | TestFlight build tested and approved | ⬜ PENDING | Blocked by Criterion #1 build failure. |

---

## Completed Work (This Cycle)

| Item | File(s) | Outcome |
|---|---|---|
| Removed deprecated AddressBook framework | `ios/ForestWatcher.xcodeproj/project.pbxproj` | Deprecated framework removed from iOS project links and references. |
| Raised iOS deployment target to 16.0 | `ios/Podfile` | Aligns baseline with current SDK/toolchain expectations. |
| Removed Apple Silicon simulator arch exclusion | `ios/Podfile` | Eliminates legacy `EXCLUDED_ARCHS[sdk=iphonesimulator*] = arm64` workaround. |
| Added Xcode 26 private-header fix (`netinet6/in6.h`) | `ios/Podfile` (post_install patching) | Prevents private-header compile failure in pod sources. |
| Added fmt consteval compatibility workaround | `ios/Podfile` (post_install patching) | Disables problematic consteval path for Apple Clang under Xcode 26. |
| Added React Runtime module-name compatibility fixes | `ios/Podfile` + RNN patched sources via post_install | Handles `React-RuntimeApple` vs `React_RuntimeApple` lookup behavior in Xcode 26. |
| Added React runtime framework/header search path mirroring for RNN target | `ios/Podfile` (xcconfig patching) | Resolved a chain of transitive React runtime header-not-found failures. |
| Patched ReactNativeNavigation old-arch iOS sources for RN 0.79 | `patches/react-native-navigation+8.3.2.patch` | Moves the build past the prior `RNNReactButtonView` / `RNNEventEmitter` / `RNNAppDelegate` compile blockers. |
| Switched app bootstrap to explicit bridge startup | `ios/ForestWatcher/AppDelegate.mm` | Aligns app launch with the old-architecture RNN bootstrap path. |

---

## Current Blockers (Ordered)

### Blocker 1: Legacy Mapbox simulator linkage
- **Current error**: `ld: building for 'iOS-simulator', but linking in dylib .../Mapbox.framework/Mapbox built for 'iOS'`
- **Evidence**: `ios/buildlogs/fw30-sim-build.log` from the 2026-06-24 simulator build against `iPhone 17, OS 26.5`
- **Impact**: arm64 simulator build still cannot complete, so the iOS 26 test matrix cannot start.

### Blocker 2: Generic device build gate still pending
- **State**: the generic device debug build was not re-run after the current RNN/AppDelegate fixes.
- **Impact**: even though compile failures moved forward, device-side readiness remains unverified until `generic/platform=iOS` is rerun.

### Blocker 3: Map stack follow-up after migration
- **Current dependency**: `@rnmapbox/maps 10.2.10`
- **Impact**: simulator linker blocker from legacy `Mapbox.framework` is resolved; old-architecture deprecation remains a future maintenance risk.
- **Follow-up**: plan New Architecture migration before adopting rnmapbox 10.3+.

### Blocker 4: App Store and signing pipeline actions
- Provisioning/TestFlight steps remain pending once build blocker is resolved.
- Age Rating update is still a manual ASC task.

---

## What Changed Since Previous Report

- Xcode 26 is now actively used (previous report was blocked at tool availability).
- Build is no longer blocked by `react-native-navigation` compile errors; it now fails later at the legacy Mapbox simulator link step.
- `ios/ForestWatcher/AppDelegate.mm` now bootstraps RNN through an explicit `RCTBridge` path that matches the old-architecture setting.
- Several early Xcode 26 compatibility failures have already been burned down and documented in Podfile post-install patching.

---

## Immediate Next Actions

1. Decide whether to use a narrow simulator workaround for legacy Mapbox or move directly to the dedicated `@rnmapbox/maps` migration scope.
2. Re-run `xcodebuild -destination "generic/platform=iOS" CODE_SIGNING_ALLOWED=NO build` to verify the device gate with the current RNN patch set.
3. Start executing `docs/roadmap/ios-2026-test-matrix.md` only after at least one Debug build gate is green.
