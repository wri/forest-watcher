# iOS 2026: Firebase CocoaPods → Swift Package Manager Migration

**Ticket**: FW-34
**Deadline**: October 1, 2026 (Firebase stops publishing new versions to CocoaPods)
**Status**: Planned — post-OS update (FW-30)

---

## Context

Firebase is ending new version publication to CocoaPods for the Apple SDK in **October 2026**. CocoaPods registry enters read-only mode on **December 2, 2026**. Projects that stay on CocoaPods will receive no further Firebase features, performance improvements, or security fixes after October 2026.

Reference: [Firebase iOS SDK Release Notes](https://firebase.google.com/support/release-notes/ios) · [Firebase iOS Setup](https://firebase.google.com/docs/ios/setup)

---

## Current State (Forest Watcher)

| Item | Value |
|------|-------|
| `@react-native-firebase/app` | `21.6.1` |
| `@react-native-firebase/analytics` | `21.6.1` |
| iOS installation method | CocoaPods via `use_frameworks! :linkage => :static` |
| Podfile flags | `$RNFirebaseAsStaticFramework = true`, `$RNFirebaseAnalyticsWithoutAdIdSupport = true` |
| Firebase modules in use | `app`, `analytics` |
| RN Firebase migration guides available | v22, v23, v24, v25 (per rnfirebase.io) |

**Note**: The current `firebase-ios-sdk` (as required by the latest `react-native-firebase`) already mandates **Xcode 26.2+** — making Xcode 26 a hard prerequisite. This is also the prerequisite for the iOS 26 OS update (FW-30), confirming correct sequencing.

---

## Migration Path Options

### Option A — Full SPM Migration (preferred, pending RN Firebase support)

Remove Firebase pods from Podfile; add `firebase-ios-sdk` via Xcode SPM (`https://github.com/firebase/firebase-ios-sdk`). Upgrade `@react-native-firebase/*` to the first version that ships RN CLI SPM support.

**Blockers**:
- `react-native-firebase` v21 does not document SPM support for React Native CLI projects. Native modules depend on pod autolinking to resolve Firebase pod targets.
- Forcing SPM before official RN Firebase support risks broken native module linking.

**Effort**: Medium (2–3 days) once RN Firebase ships a compatible release.
**This is the target path.**

### Option B — Pin to last CocoaPods-compatible Firebase version

Set `$FirebaseSDKVersion` to the final pre-October 2026 release and stay on CocoaPods indefinitely.

**Consequence**: No Firebase security fixes or updates after October 2026. Not viable beyond the short term.

### Option C — Upgrade RN Firebase to v22+ progressively, then SPM

Follow the v22 → v23 → v24 → v25 migration guides on rnfirebase.io as part of the SPM migration effort. Each major version brings the SDK closer to SPM alignment.

**Risk**: Multiple sequential breaking migrations; scope better suited to a dedicated sprint after OS update.

---

## Timing Assessment

| Task | Deadline | Dependency |
|------|----------|------------|
| iOS 26 OS Update (FW-30) | App Store Fall 2026 | Xcode 26 required |
| Firebase CocoaPods migration (FW-34) | October 1, 2026 | Xcode 26 required (same prerequisite) |
| CocoaPods registry read-only | December 2, 2026 | — |

---

## Decision: Post-OS Update

The Firebase SPM migration is scheduled **after** the iOS 26 OS update completes for these reasons:

1. **RN Firebase SPM support is not yet stable for RN CLI projects.** Attempting the migration now means working outside documented support, which risks build regressions during a critical compliance window.
2. **Scope isolation reduces risk.** The OS update already spans RN dependency upgrades, deprecated API cleanup, and privacy manifest work. Adding a dependency manager change increases blast radius without a forcing function today.
3. **Xcode 26 prerequisite is shared.** The OS update delivers Xcode 26 as a foundation. The Firebase SPM migration depends on that same foundation. Sequencing is natural.
4. **October deadline is achievable.** If the OS update targets completion by August 2026, there are ~8 weeks to execute the SPM migration cleanly before the October cutoff.

---

## Post-OS Update Migration Steps

Once the OS update (FW-30) is complete and `react-native-firebase` confirms RN CLI SPM support:

1. **Audit Firebase modules in use.** Confirm the full set (currently `app`, `analytics`).
2. **Upgrade `@react-native-firebase/*`** to the latest SPM-compatible version, following migration guides (v22 → … → latest) on [rnfirebase.io](https://rnfirebase.io).
3. **Remove Firebase-specific Podfile configuration**: `$RNFirebaseAsStaticFramework`, `$RNFirebaseAnalyticsWithoutAdIdSupport`, any direct Firebase pod references.
4. **Add `firebase-ios-sdk` via Xcode → File → Add Packages** (`https://github.com/firebase/firebase-ios-sdk`). Select only the products in use (`FirebaseAnalytics`, `FirebaseCore`).
5. **Run `pod install`** — verify remaining CocoaPods dependencies (non-Firebase RN modules) are clean.
6. **Evaluate `use_frameworks! :linkage => :static`** — this flag may still be required by other pods. Do not remove it unless all other static framework requirements are resolved.
7. **Build and run on simulator and device.** Verify no linker errors.
8. **Confirm Analytics event delivery** in Firebase console from a TestFlight build.
9. **Update privacy manifest** if Firebase Analytics data collection declarations change post-migration.

---

## Acceptance Criteria

- [ ] `@react-native-firebase` packages on SPM-compatible version
- [ ] `firebase-ios-sdk` managed via Xcode SPM (visible in project Package Dependencies)
- [ ] No Firebase pod declarations remaining in Podfile
- [ ] `pod install` clean with no Firebase-related pod resolution
- [ ] Analytics events confirmed in Firebase console from a TestFlight build
- [ ] Build passes with Xcode 26 + iOS 26 SDK
- [ ] No regressions in crash reporting, analytics, or push notification flows
