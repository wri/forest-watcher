# iOS 2026 Privacy & Compliance Audit

**Ticket**: FW-30 (Phase C)
**Audit Date**: 2026-06-11
**Environment at audit**: Xcode 15.4 / RN 0.79.0 / iOS min target 16.0
**Status**: Pending Xcode 26 build validation

---

## Required-Reason API Declarations

App manifest: `ios/ForestWatcher/PrivacyInfo.xcprivacy`

| API Category | Reasons Declared | Sources | Status |
|---|---|---|---|
| `NSPrivacyAccessedAPICategoryUserDefaults` | CA92.1, 1C8F.1, C56D.1 | App + Firebase + GoogleUtilities | ✅ Complete |
| `NSPrivacyAccessedAPICategoryFileTimestamp` | C617.1, 3B52.1 | App + GoogleUtilities + lottie-ios | ✅ Complete |
| `NSPrivacyAccessedAPICategoryDiskSpace` | E174.1 | App (react-native-fs, rn-fetch-blob) | ✅ Complete |
| `NSPrivacyAccessedAPICategorySystemBootTime` | 35F9.1 | App + Sentry | ✅ Complete |

All four required-reason API categories are declared. No gaps found against the current installed pod set.

### Notes on pods without own privacy manifests
The following pods do **not** ship a `PrivacyInfo.xcprivacy` and rely on the app manifest:
- `Mapbox-iOS-SDK 5.9.0` — uses file timestamps, disk space; covered by app manifest
- `MapboxMobileEvents 0.10.2` — likely uses system boot time for telemetry; covered
- `@mauron85/react-native-background-geolocation 0.6.3` — uses system boot time for location tracking; covered
- `react-native-navigation 8.3.2` — no required-reason API usage expected
- `react-native-fs 2.18.0` — file timestamps + disk space; covered

---

## Privacy Tracking

- `NSPrivacyTracking`: `false` ✅
- `NSPrivacyTrackingDomains`: empty ✅
- No advertising identifiers, IDFA, or cross-app tracking in use.
- Firebase Analytics configured with `$RNFirebaseAnalyticsWithoutAdIdSupport = true` ✅

---

## Collected Data Types

- `NSPrivacyCollectedDataTypes`: empty array in app manifest ✅
- Sentry pod correctly declares `CrashData`, `PerformanceData`, `OtherDiagnosticData` — not linked, not tracking.
- FirebaseInstallations declares its own data — not linked, not tracking.

The app itself does not collect data beyond what individual SDK manifests declare.

---

## In-App Purchases / Receipt Validation

Not applicable. No StoreKit / IAP / AppTransaction usage found in app code.

---

## APNs Trust Store

Not applicable. Push notifications are not used (`UIBackgroundModes` = `location` only; no push entitlement in `ForestWatcher.entitlements`).

---

## Entitlements Review

| Entitlement | Value | Status |
|---|---|---|
| `com.apple.developer.applesignin` | Default | ✅ |
| `com.apple.developer.icloud-container-identifiers` | iCloud.com.wri.forestwatcher | ✅ |
| `com.apple.developer.icloud-services` | CloudDocuments | ✅ |
| `com.apple.developer.ubiquity-container-identifiers` | iCloud.com.wri.forestwatcher | ✅ |

No push notification entitlement — consistent with no APNs usage.

---

## Permission Usage Descriptions (Info.plist)

| Permission | Key | Status |
|---|---|---|
| Camera | NSCameraUsageDescription | ✅ Present |
| Location Always | NSLocationAlwaysUsageDescription | ✅ Present |
| Location Always + When In Use | NSLocationAlwaysAndWhenInUseUsageDescription | ✅ Present |
| Location When In Use | NSLocationWhenInUseUsageDescription | ✅ Present |
| Microphone | NSMicrophoneUsageDescription | ✅ Present |
| Photo Library | NSPhotoLibraryUsageDescription | ✅ Present |
| Motion | NSMotionUsageDescription | ✅ Present |

No Contact, Calendar, Bluetooth, or Notification permission descriptions found — consistent with app functionality.

---

## Deprecated Framework Removal

| Framework | Action | Status |
|---|---|---|
| `AddressBook.framework` | Removed from `project.pbxproj` (PBXBuildFile + PBXFileReference + Frameworks group + Frameworks build phase) | ✅ Done (commit: FW-30) |

No code in `app/` or `ios/ForestWatcher/` referenced AddressBook APIs — purely legacy linker reference.

---

## Open Items / Risks

| # | Item | Severity | Owner |
|---|---|---|---|
| 1 | `Mapbox-iOS-SDK 5.9.0` has no privacy manifest and is extremely old. Must be replaced with `@rnmapbox/maps` (MapboxMaps SDK v11) before Xcode 26 archive. | CRITICAL | FW-30 |
| 2 | `MapboxMobileEvents 0.10.2` — may transmit telemetry to Mapbox; may require additional privacy manifest declarations once audited with Xcode 26 tools. | HIGH | FW-30 |
| 3 | Privacy manifest completeness must be re-validated with Xcode 26 `Generate Privacy Report` tool after pod upgrade. | HIGH | FW-30 validation run |
| 4 | `@sentry/react-native 6.10.0` / Sentry 8.48.0 — verify latest version doesn't add new required-reason APIs. | MEDIUM | Pre-submission check |

---

## Validation Steps (Pending Xcode 26)

```
# After installing Xcode 26 and running pod install:
xcodebuild archive -workspace ios/ForestWatcher.xcworkspace \
  -scheme ForestWatcher -configuration Release \
  -archivePath build/ForestWatcher.xcarchive
# Then in Xcode: Product > Archive > Distribute > Generate Privacy Report
```

Re-run this audit after Mapbox upgrade and pod install to confirm no new API categories appear.
