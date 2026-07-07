# Building the Android app

deAIfy uses Expo's [Continuous Native Generation](https://docs.expo.dev/workflow/continuous-native-generation/):
the `android/` folder is **generated** from `app.json` and is git-ignored. There are two ways to
produce an installable/uploadable build.

## Option A: EAS (cloud, no local Android SDK needed)

```bash
npm run build:android         # eas build -p android --profile preview  → .apk
npx eas build -p android --profile production   # → .aab for the Play Store
```

Requires a free Expo account (`npx eas login`). EAS manages the signing keystore for you.

## Option B: Local build (what this repo is set up for)

Prerequisites: **JDK 17** and the **Android SDK** (`ANDROID_HOME` set).

```bash
# 1. Generate the native android/ project from app.json
npx expo prebuild --platform android --clean

# 2. Build the release App Bundle
cd android
./gradlew bundleRelease

# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Signing

A Play Store **AAB must be signed** with an upload key. This project is configured to read the
keystore from Gradle properties so no secrets live in the tracked source.

The upload keystore is kept **outside** the repository (see the signing credentials file you were
given). To build with it, the following are supplied via `android/gradle.properties` (git-ignored)
or `-P` flags:

```
DEAIFY_UPLOAD_STORE_FILE=/absolute/path/to/deAIfy-upload.keystore
DEAIFY_UPLOAD_KEY_ALIAS=deaify-upload
DEAIFY_UPLOAD_STORE_PASSWORD=********
DEAIFY_UPLOAD_KEY_PASSWORD=********
```

> **Keep the keystore and its passwords safe.** With **Play App Signing** (recommended, enabled by
> default for new apps) Google holds the real app-signing key, so a lost *upload* key can be reset
> via Google Play support, but back it up anyway.

### Uploading to the Play Store

1. Go to the [Play Console](https://play.google.com/console) with your company account.
2. Create the app, then **Production → Create new release**.
3. Upload `app-release.aab`. Package name: **`com.deaify.app`** (permanent).
4. Complete the store listing (the icons in `assets/images/` and `docs/og-image.png` can be reused).
