# TechMtc — GitHub APK Builder

This project is ready to build TechMtc.apk using GitHub Actions.

## Upload to GitHub

1. Sign in to GitHub.
2. Click **New repository**.
3. Name it `TechMtc`.
4. Choose **Private** or **Public**.
5. Click **Create repository**.
6. On the new repository page, choose **uploading an existing file**.
7. Upload the CONTENTS of this `TechMtc_GitHub` folder, including the hidden `.github` folder.
8. Commit the files.

## Build the APK online

After the files are uploaded:

1. Open your GitHub repository.
2. Click the **Actions** tab.
3. Open **Build TechMtc APK**.
4. Click **Run workflow**.
5. When the workflow completes successfully, open that workflow run.
6. Scroll to **Artifacts**.
7. Download **TechMtc-APK**.
8. Extract the downloaded ZIP.
9. Inside it is `TechMtc.apk`.

Copy `TechMtc.apk` to your Android phone and install it.

## Important

The APK built by this workflow is a DEBUG APK intended for testing and direct installation.
It is not the Play Store release bundle yet.

The current TechMtc Android app stores data locally on the phone. The shared website version uses a server. A later Android version can be connected to the shared online backend so trainer and trainee devices share the same class data.
