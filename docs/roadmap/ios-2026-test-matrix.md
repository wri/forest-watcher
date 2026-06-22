# iOS 2026 Test Matrix

**Ticket**: FW-30 (Phase D)  
**Target**: Xcode 26 + iOS 26 / iPadOS 26 SDK  
**Last Updated**: 2026-06-22  
**Current Status**: BLOCKED AT BUILD STAGE (ReactNativeNavigation compile errors)

---

## Prerequisite Checklist (Before Functional Testing)

- [x] Xcode 26 installed and selected for CLI builds
- [x] `pod install` runs successfully with current Podfile patches
- [x] `xcodebuild` execution path validated (build attempts running on iOS 26.5 SDK)
- [ ] iOS build completes successfully (currently blocked in `react-native-navigation`)
- [ ] `@react-native-mapbox-gl/maps` upgraded to `@rnmapbox/maps` (tracked, not completed)

---

## Build Matrix

| Configuration | Target | Architecture | Expected Result | Actual Result |
|---|---|---|---|---|
| Debug | iOS 26 Simulator (arm64) | arm64 | ✅ Build succeeds | ⛔ Blocked by upstream iOS compile errors before matrix execution |
| Debug | iOS 26 Device (generic) | arm64 | ✅ Build succeeds | ⛔ Fails in `RNNReactButtonView.mm` |
| Release | iOS 26 Device | arm64 | ✅ Archive succeeds | ⬜ Not attempted (blocked by Debug compile failure) |
| Release | TestFlight | arm64 | ✅ Upload succeeds | ⬜ Not attempted (blocked by build readiness) |

---

## Active Build Error Snapshot

Current blocking errors from `/tmp/xcode-build.log`:
- `RNNReactButtonView.mm: expected a type`
- `RNNReactButtonView.mm: no visible @interface for 'RNNComponentView' declares selector ...`
- `RNNReactButtonView.mm: cannot initialize parameter of type 'id<RCTSurfacePresenterObserver>' ...`
- `RNNReactButtonView.mm: property 'surface' not found on object of type 'RNNReactButtonView *'`

Interpretation: ReactNativeNavigation iOS source compatibility issue with current RN/Xcode combination is preventing all downstream matrix execution.

---

## Core Flow Test Cases

### Flow 1: App Launch + Auth
| # | Step | Expected | Status |
|---|---|---|---|
| 1.1 | Cold launch app | Splash -> login screen | ⬜ |
| 1.2 | Sign in with Apple | Successful auth + home screen | ⬜ |
| 1.3 | Sign in with Facebook | Successful auth + home screen | ⬜ |
| 1.4 | OAuth flow (other providers) | Redirect returns correctly | ⬜ |

### Flow 2: Map + Location (CRITICAL)
| # | Step | Expected | Status |
|---|---|---|---|
| 2.1 | Open map screen | Map renders with tiles | ⬜ |
| 2.2 | Request location permission | System prompt appears | ⬜ |
| 2.3 | Grant "Always" permission | Location tracking activates | ⬜ |
| 2.4 | Background location tracking | Route records in background | ⬜ |
| 2.5 | Offline map tiles load | Cached tiles render without network | ⬜ |
| 2.6 | MBTiles source renders | Custom tile layers display | ⬜ |
| 2.7 | Contextual layers toggle | GeoJSON/vector layers show/hide | ⬜ |

### Flow 3: Reports
| # | Step | Expected | Status |
|---|---|---|---|
| 3.1 | Create new report | Form opens, fields functional | ⬜ |
| 3.2 | Attach photo from camera | Camera opens, photo attaches | ⬜ |
| 3.3 | Attach photo from library | Photo picker opens, photo attaches | ⬜ |
| 3.4 | Attach audio recording | Microphone prompt, recording saves | ⬜ |
| 3.5 | Upload report (online) | Report uploads successfully | ⬜ |
| 3.6 | Queue report (offline) | Report queued, uploads when online | ⬜ |

### Flow 4: Bundle Import/Export (CRITICAL)
| # | Step | Expected | Status |
|---|---|---|---|
| 4.1 | Import .gfwbundle file | Bundle imported, data available | ⬜ |
| 4.2 | Export reports bundle | Bundle created and shared | ⬜ |
| 4.3 | Share via Files app | Share sheet appears, file accessible | ⬜ |
| 4.4 | Import from Files app | Document picker opens, import succeeds | ⬜ |
| 4.5 | iCloud document access | Security-scoped resource access works | ⬜ |

### Flow 5: Offline Mode
| # | Step | Expected | Status |
|---|---|---|---|
| 5.1 | Disable network | Offline banner appears | ⬜ |
| 5.2 | Navigate app offline | Core screens accessible | ⬜ |
| 5.3 | Re-enable network | Sync resumes automatically | ⬜ |

### Flow 6: Areas + Alerts
| # | Step | Expected | Status |
|---|---|---|---|
| 6.1 | View monitored areas | Areas display on map | ⬜ |
| 6.2 | Load alert datasets | Alert pins render correctly | ⬜ |
| 6.3 | Draw new area | Drawing tool activates, area saves | ⬜ |

---

## iOS 26-Specific Checks

| # | Check | Expected | Status |
|---|---|---|---|
| iOS26.1 | App runs on iOS 26 simulator | No crash, no visual regression | ⬜ |
| iOS26.2 | Dark mode (if supported) | No layout issues | ⬜ |
| iOS26.3 | Stage Manager (iPadOS 26) | Resizable window behavior acceptable | ⬜ |
| iOS26.4 | Privacy manifest report clean | No undeclared required-reason APIs | ⬜ |
| iOS26.5 | No App Store binary warnings | Xcode Organizer shows no rejections | ⬜ |

---

## Known Blockers for Test Execution

| Blocker | Impact | Workaround Path |
|---|---|---|
| ReactNativeNavigation iOS compile mismatch (`RNNReactButtonView.mm`) | Blocks all runtime and functional tests | Patch/fork/upgrade RNN for RN 0.79 + Xcode 26 compatibility |
| Legacy Mapbox dependency line | Known medium/large risk for full iOS 26 readiness | Migrate to `@rnmapbox/maps` in dedicated scope |
| Signing/TestFlight setup | Blocks distribution validation after local build passes | Configure provisioning/certificates and run archive/upload |