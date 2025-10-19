@echo off
echo ========================================
echo Building Preview APK with Razorpay Support
echo ========================================
echo.

echo Step 1: Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo Failed to install dependencies
    exit /b %errorlevel%
)
echo.

echo Step 2: Pre-building native modules...
call npx expo prebuild --clean
if %errorlevel% neq 0 (
    echo Failed to prebuild
    exit /b %errorlevel%
)
echo.

echo Step 3: Building APK with EAS (Preview Profile)...
call eas build --profile preview --platform android --local
if %errorlevel% neq 0 (
    echo Failed to build APK
    exit /b %errorlevel%
)
echo.

echo ========================================
echo Build Complete!
echo The APK file will be in the current directory
echo ========================================
pause

