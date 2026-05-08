# Building for Android with Capacitor

This project is pre-configured with Capacitor. Follow these steps to run it as a native Android app in Android Studio.

## Prerequisites
- Node.js + Bun installed
- Android Studio (with Android SDK + an emulator or a real device with USB debugging)
- JDK 17

## 1. Get the code
1. In Lovable, click **+** (chat input) → **GitHub** → **Connect GitHub** → push to a new repo.
2. On your machine: `git clone <your-repo>` then `cd <project>`.

## 2. Install dependencies
```bash
bun install
```

## 3. Add the Android platform (first time only)
```bash
bunx cap add android
```
This creates an `android/` folder (Gradle project).

## 4. Build the web app and sync into Android
Run this every time you change web code:
```bash
bun run build
bunx cap sync android
```

## 5. Open in Android Studio
```bash
bunx cap open android
```
Then in Android Studio: **Run ▶** (pick an emulator or connected device).

## Updating after web changes
```bash
bun run build && bunx cap sync android
```
No need to re-open Android Studio — just hit Run again.

## Notes
- The backend (Lovable Cloud / Supabase) keeps working as-is — auth, database, and storage all run from the device against the same backend.
- If you change `capacitor.config.ts` (e.g. app name/ID), run `bunx cap sync android` again.
- For a release `.apk` / `.aab`, in Android Studio: **Build → Generate Signed Bundle / APK**.
