# iOS 2026 Release Readiness

**Ticket**: FW-30  
**Last Updated**: 2026-06-22  
**Environment**: Xcode 26 / iOS 26.5 SDK, React Native 0.79.0

---

## Acceptance Criteria Status

| # | Criterion | Status | Evidence / Notes |
|---|---|---|---|
| 1 | App builds successfully with Xcode 26 + iOS 26 SDK | ⛔ BLOCKED | Build runs on Xcode 26 but fails in `react-native-navigation` (`RNNReactButtonView.mm` type/interface mismatches). |
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

---

## Current Blockers (Ordered)

### Blocker 1: ReactNativeNavigation iOS compile incompatibility
- **Current error family**: `node_modules/react-native-navigation/lib/ios/RNNReactButtonView.mm`
- **Symptoms**:
  - `expected a type`
  - missing selector declarations on `RNNComponentView`
  - `property 'surface' not found`
- **Impact**: iOS build cannot complete, therefore no test matrix execution and no TestFlight validation.

### Blocker 2: Legacy Mapbox stack migration (known major scope)
- **Current dependency**: `@react-native-mapbox-gl/maps 8.6.0-beta.0` / old Mapbox iOS SDK line
- **Impact**: still a known high-risk path for long-term iOS 26 readiness and simulator/device parity.
- **Follow-up**: dedicated migration to `@rnmapbox/maps` remains required but is outside this immediate compile blocker.

### Blocker 3: App Store and signing pipeline actions
- Provisioning/TestFlight steps remain pending once build blocker is resolved.
- Age Rating update is still a manual ASC task.

---

## What Changed Since Previous Report

- Xcode 26 is now actively used (previous report was blocked at tool availability).
- Build is no longer blocked by "Xcode not installed"; it is now blocked by concrete `react-native-navigation` compile errors.
- Several early Xcode 26 compatibility failures have already been burned down and documented in Podfile post-install patching.

---

## Immediate Next Actions

1. Resolve `RNNReactButtonView.mm` compile mismatch for RN 0.79/Xcode 26 compatibility.
2. Re-run `xcodebuild` and confirm Criterion #1 passes on device generic build.
3. Start executing `docs/roadmap/ios-2026-test-matrix.md` flows and record results.