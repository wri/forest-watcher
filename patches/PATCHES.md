# Patches

Description of patches created with the `patch-package` library.

| Library Name (asc)                                | Version       | Date     | Patch Description |
| ------------------------------------------------- | ------------- | -------- | ----------------- |
| `@mauron85/react-native-background-geolocation`   | v0.6.3        | —        | Android: AndroidX migration, minSdkVersion alignment, modern permissions library |
| `@react-native-mapbox-gl/maps`                    | v8.6.0-beta.0 | 01/05/26 | Android/JS: String refs migrated to `React.createRef()`; removed unsupported `renderMode="custom"`; fixed `ViewPropTypes` named import. Regenerated 2026-05-01. |
| `react-native-app-auth`                           | v6.4.3        | —        | Android: OAuth redirect URI handling |
| `react-native-audio-recorder-player`              | v3.6.12       | —        | Android: fixed paused-state detection (`startPlayer`), added `OnSeekCompleteListener` to resume playback after async `seekTo` on API 26+, and updated seek promise result message |
| `react-native-device-info`                        | v9.0.2        | —        | Android: Compatibility fix (see patch file for details) |
| `react-native-fs`                                 | v2.18.0       | —        | Android: Ensure all API methods assume URI parameters are not percent-encoded consistently |
| `react-native-hyperlink`                          | v0.0.19       | —        | Android/iOS: Older React Native compatibility fix |
| `react-native-keyboard-spacer`                    | v0.4.1        | —        | Android/iOS: Older React Native compatibility fix |
| `react-native-localize`                           | v1.3.3        | 13/10/20 | Android: Fix GFW-791: not refreshing default language when changed while app is open |
| `react-native-navigation`                         | v7.30.3       | —        | ⚠️ Stale — superseded by v7.40.3 patch; candidate for removal |
| `react-native-navigation`                         | v7.40.3       | —        | iOS: Fixes inability to hide a container navigation controller (stack) topBar when a child navigation controller within it has a topBar component |
| `react-native-safe-area`                          | v0.5.1        | —        | Android/iOS: Compatibility fix (package superseded by `react-native-safe-area-context`, already in deps) |
| `react-native-share`                              | v10.0.2       | —        | Android: Fix local file MIME type on Android share sheet |
| `react-native-snap-carousel`                      | v3.9.1        | 01/05/26 | JS: Fixed `import { ViewPropTypes }` named import from `deprecated-react-native-prop-types` (was broken default import) |
| `react-native`                                    | v0.76.7       | —        | JS: FormData filename RFC 2183 encoding fix |
| `reactotron-react-native`                         | v5.1.9        | —        | Dev-only: Compatibility fix for development tooling |
| `realm`                                           | v12.13.2      | —        | ⚠️ Contains generated cmake build artifacts — likely accidental commit; candidate for removal |
| `rn-fetch-blob`                                   | v0.12.0       | 06/07/20 | Android: Fix `readStream` not always working with content:// URIs; fix crash in RNFB ([#490](https://github.com/joltup/rn-fetch-blob/issues/490)) |
