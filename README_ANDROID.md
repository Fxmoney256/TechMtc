# TechMtc Android

This project wraps the TechMtc class app as a native Android application using Android WebView.

## Build an APK in Android Studio

1. Install Android Studio.
2. Open the `TechMtc_Android` folder.
3. Allow Android Studio to download/sync the required Gradle and Android SDK components.
4. Connect an Android phone with USB debugging enabled, or start an emulator.
5. Press **Run** to install TechMtc directly.
6. To create an APK: **Build > Build App Bundles or APKs > Build APKs**.
7. For Google Play: **Build > Generate Signed Bundle / APK > Android App Bundle**.

## Current app behaviour

- First Year / Second Year Technician Mathematics
- Manual topic entry and details
- Timetable with topic date/time/venue/remarks
- Attendance records
- Manual course work entry
- PDF resource picker
- Forum and replies
- Trainer / Trainee view switch

## Important prototype limitation

The data is stored with WebView local storage on each Android device. It is not yet synchronized between the trainer's phone and trainees' phones. A production version should use a hosted database/authentication/storage service.
