@echo off
echo Building CQ Wealth APK for development...
echo.

REM Set environment variables for development build
set NODE_ENV=development
set EXPO_DEV=true

REM Build the APK using expo run:android with release variant
echo Starting APK build...
npx expo run:android --variant release --no-install

echo.
echo Build completed! Check the android/app/build/outputs/apk/release/ directory for your APK file.
pause
