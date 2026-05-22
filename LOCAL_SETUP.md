# Forest Watcher — Local Development Setup

## Overview

Forest Watcher is a **React Native 0.76.x** mobile app (Android & iOS) for monitoring forested areas. It integrates with the GFW (Global Forest Watch) API, Mapbox, Firebase, Sentry, and OAuth providers (Google, Facebook, Apple).

> **Note:** There is no web app in this repository. The `docs/web/` folder references a separate project.

---

## 1. Prerequisites (Minimal Global Dependencies)

### Node.js and Ruby via asdf

This project uses [asdf](https://asdf-vm.com/) to pin both Node.js and Ruby versions via the `.tool-versions` file.

```bash
# Install asdf (macOS via Homebrew)
brew install asdf

# Add asdf to your shell — append to ~/.zshrc (zsh) or ~/.bash_profile (bash)
echo '. /usr/local/opt/asdf/libexec/asdf.sh' >> ~/.zshrc
# or for bash:
echo '. /usr/local/opt/asdf/libexec/asdf.sh' >> ~/.bash_profile

# Reload your shell
source ~/.zshrc  # or source ~/.bash_profile

# Add the nodejs and ruby plugins
asdf plugin add nodejs
asdf plugin add ruby

# In the project root, install the pinned versions from .tool-versions
cd forest-watcher
asdf install   # installs nodejs 24.14.1 and ruby 3.0.2
```

Versions are pinned in [.tool-versions](.tool-versions):
```
nodejs 24.14.1
ruby 3.0.2
```

### Yarn (via corepack, no global install needed)

```bash
corepack enable
corepack prepare yarn@1 --activate
```

> If `corepack` is not available on Node 14, install yarn globally with `npm install -g yarn`.

### Watchman (macOS)

```bash
brew install watchman
```

### React Native CLI (project-local)

Instead of installing `react-native-cli` globally, use npx which invokes the local version:

```bash
npx react-native <command>
```

The `package.json` scripts already wrap this, so you'll normally just use `yarn android` / `yarn ios`.

---

## 2. Android Setup

### Android Studio & SDK

1. Install [Android Studio](https://developer.android.com/studio).
2. Through Android Studio SDK Manager install:
   - **Android SDK Platform 35** (compileSdkVersion 35, targetSdkVersion 35)
   - **Android SDK Build-Tools 35.0.0**
   - **NDK 21.4.7075529** (required by native modules)
   - **CMake** (if prompted)
3. Set environment variables in your shell profile (`~/.zshrc` or `~/.bashrc`):

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

### Java

Android Gradle Plugin requires **JDK 17**. Install via:

```bash
brew install openjdk@17
sudo ln -sfn /usr/local/opt/openjdk@17/libexec/openjdk.jdk /Library/Java/JavaVirtualMachines/openjdk-17.jdk
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Android Emulator

Create an AVD (Android Virtual Device) through Android Studio with API level 30+.

---

## 3. iOS Setup (optional, macOS only)

1. Install **Xcode** from the App Store.
2. Install Xcode CLI Tools: `xcode-select --install`
3. Install CocoaPods (uses the asdf-managed Ruby 3.0.2 — no `sudo` needed):
   ```bash
   gem install cocoapods
   ```
4. Install pods:
   ```bash
   cd ios && pod install && cd ..
   ```

Or use the built-in script: `bash iOSQuickStart.sh`

---

## 4. Environment Configuration

The app reads environment variables via `react-native-config` from three files at the project root.

### Copy the sample file

```bash
cp .env.sample .env
cp .env.sample .env.android
cp .env.sample .env.ios
```

Then edit all three files and fill in your credentials (adjust per-platform values for Google OAuth if needed):

```bash
# ── GFW API ──────────────────────────────────────────────
API_URL=https://production-api.globalforestwatch.org/v1
API_AUTH=https://production-api.globalforestwatch.org
API_AUTH_CALLBACK_PATH=/auth/success
DATASET_COUNTRIES=134caa0a-21f7-451d-a7fe-30db31a424aa

# ── Google OAuth ─────────────────────────────────────────
LOGIN_GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
LOGIN_GOOGLE_REDIRECT_SCHEMA=<your-google-redirect-schema>
LOGIN_GOOGLE_REDIRECT_SCHEMA_DEBUG=<your-google-redirect-schema>.debug

# ── Facebook OAuth ───────────────────────────────────────
LOGIN_FACEBOOK_APP_ID=<your-facebook-app-id>
LOGIN_FACEBOOK_CLIENT_TOKEN=<your-facebook-client-token>
LOGIN_FACEBOOK_PROTOCOL_SCHEME=<your-facebook-protocol-scheme>

# ── Mapbox ───────────────────────────────────────────────
MAPBOX_BASE_URL=https://api.mapbox.com
MAPBOX_TOKEN=<your-mapbox-public-token>

# ── Transifex (translations, optional for dev) ──────────
TRANSIFEX_URL=https://www.transifex.com
TRANSIFEX_PROJECT=<transifex-project-slug>
TRANSIFEX_SLUG=<transifex-resource-slug>
TRANSIFEX_API_TOKEN=<transifex-api-token>

# ── Sentry (crash reporting, optional for dev) ──────────
SENTRY_DSN=<your-sentry-dsn>
```

### Additional Config Files You Need

| File | Location | Source |
|------|----------|--------|
| `google-services.json` | `android/app/` | Firebase Console → Project Settings → Android app |
| `GoogleService-Info.plist` | `ios/` | Firebase Console → Project Settings → iOS app |
| `sentry.properties` | `android/` AND `ios/` | Sentry project settings (org, project, auth token) |

### Mapbox Maven Token (Android builds)

The file [android/gradle.properties](android/gradle.properties) contains a `MAPBOX_MAVEN_PASSWORD` used to download Mapbox native SDK artifacts. You may need a valid Mapbox **secret token** with `Downloads:Read` scope. If the existing token is expired, generate one at https://account.mapbox.com/access-tokens/ and update `MAPBOX_MAVEN_PASSWORD` in `android/gradle.properties` (do NOT commit secret tokens).

---

## 5. Install & Run

```bash
# 1. Use correct Node and Ruby versions (reads .tool-versions automatically)
asdf install   # only needed once, or after pulling new version pins

# 2. Install dependencies (also runs patch-package via the prepare script)
yarn

# 3. Run on Android emulator/device
yarn android

# 4. Run on iOS simulator (macOS only)
cd ios && pod install && cd ..
yarn ios

# 5. Start Metro bundler standalone (if needed)
yarn start
# or with cache reset:
yarn start:reset
```

### Useful Scripts

| Command | Description |
|---------|-------------|
| `yarn android` | Build & launch on Android |
| `yarn ios` | Build & launch on iOS |
| `yarn start` | Start Metro bundler |
| `yarn start:reset` | Start Metro with cache reset |
| `yarn clear` | Delete node_modules, clean caches, reinstall |
| `yarn test` | Run Jest tests |
| `yarn lint` | Run ESLint |
| `yarn release:android` | Build release APK (`android/app/build/outputs/apk/`) |

---

## 6. Resources to Request

Collect the following credentials/keys from your team or respective service dashboards:

### Must-Have (app won't function without these)

| Resource | Where to Get It | Env Var / File |
|----------|----------------|----------------|
| **Mapbox Public Token** | https://account.mapbox.com/access-tokens/ | `MAPBOX_TOKEN` |
| **Mapbox Secret Token** (Downloads:Read scope) | Same Mapbox dashboard | `MAPBOX_MAVEN_PASSWORD` in `android/gradle.properties` |
| **Google OAuth Client ID** (Android + iOS) | Google API Console → Credentials → OAuth 2.0 Client IDs | `LOGIN_GOOGLE_CLIENT_ID`, `LOGIN_GOOGLE_REDIRECT_SCHEMA` |
| **Facebook App ID + Client Token** | Facebook Developer Console → Settings → Basic (App ID) and Advanced (Client Token) | `LOGIN_FACEBOOK_APP_ID`, `LOGIN_FACEBOOK_CLIENT_TOKEN`, `LOGIN_FACEBOOK_PROTOCOL_SCHEME` |
| **Firebase config files** | Firebase Console → Project Settings | `google-services.json`, `GoogleService-Info.plist` |
| **GFW API access** | Confirm you can reach `production-api.globalforestwatch.org` | `API_URL`, `API_AUTH` |

### Nice-to-Have (optional for local development)

| Resource | Where to Get It | Env Var / File |
|----------|----------------|----------------|
| **Sentry DSN** | Sentry → Project Settings → Client Keys | `SENTRY_DSN` |
| **Sentry auth token** | Sentry → Settings → Auth Tokens | `sentry.properties` |
| **Transifex API Token** | Transifex → Organization Settings → API | `TRANSIFEX_API_TOKEN` |
| **Transifex Project/Slug** | Transifex project dashboard | `TRANSIFEX_PROJECT`, `TRANSIFEX_SLUG` |
| **Android release keystore** | Team-managed signing key | `keystore_password`, `key_alias`, `key_password` in `gradle.properties` |

### Ask Your Team Specifically For

1. **"Can I get the Firebase project config files?"** → `google-services.json` + `GoogleService-Info.plist`
2. **"What Mapbox tokens should I use?"** → public token for `MAPBOX_TOKEN`, secret token for `MAPBOX_MAVEN_PASSWORD`
3. **"What are the Google and Facebook OAuth credentials for dev?"** → Client IDs, redirect schemes, app IDs
4. **"Is there a dev/staging GFW API, or should I use production?"** → Affects `API_URL` and `API_AUTH`
5. **"Do we have shared Sentry and Transifex projects?"** → DSN, properties file, API tokens
6. **"Do I need the Android release keystore for local debug builds?"** → Usually no for debug, but needed for release

---

## 7. Project Architecture (Quick Reference)

```
app/
├── main.js              # Entry point, navigation setup, Mapbox init
├── store.js             # Redux store (thunk + saga + offline + auth middleware)
├── combinedReducer.js   # Root reducer
├── config/              # Constants, OAuth config, theme, static data
├── screens/             # Screen components (react-native-navigation)
├── components/          # Reusable UI components
├── containers/          # Connected (Redux) components
├── redux-modules/       # Redux actions/reducers per feature
├── sagas/               # Redux-saga side effects
├── helpers/             # Utility functions
├── locales/             # i18n translation files
├── offline/             # Offline-first data handling
├── types/               # Flow type definitions
└── assets/              # Images, fonts, animations
```

Key tech choices:
- **Navigation:** `react-native-navigation` (Wix) — native navigation, not React Navigation
- **State:** Redux + redux-saga + redux-offline
- **Maps:** Mapbox GL Native (`@react-native-mapbox-gl/maps`)
- **Database:** Realm 12.13.2
- **Auth:** OAuth via `react-native-app-auth` (Google), `react-native-fbsdk-next` (Facebook), `@invertase/react-native-apple-authentication` (Apple)
- **Env config:** `react-native-config` reads `.env` / `.env.android` / `.env.ios`

---

## 8. Troubleshooting

- **Metro cache issues:** `yarn start:reset` or `yarn clear`
- **Android build fails with Mapbox Maven 401:** Your `MAPBOX_MAVEN_PASSWORD` is expired. Generate a new secret token.
- **Pod install fails:** Make sure you're on the correct Ruby version (`asdf current` should show `ruby 3.0.2`). Try `pod repo update` first.
- **Node version mismatch:** Run `asdf install` in the project root to activate the pinned version from `.tool-versions`.
- **Patches not applied:** Run `yarn` again — the `prepare` script runs `patch-package` automatically.
