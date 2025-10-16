@echo off
setlocal enabledelayedexpansion

echo ========================================
echo Razorpay Build Setup Verification
echo ========================================
echo.

set ERRORS=0

:: Check Node.js
echo [1/8] Checking Node.js...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌] Node.js not found. Please install Node.js v18+
    set /a ERRORS+=1
) else (
    node --version
    echo [✅] Node.js found
)
echo.

:: Check npm
echo [2/8] Checking npm...
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌] npm not found
    set /a ERRORS+=1
) else (
    npm --version
    echo [✅] npm found
)
echo.

:: Check if node_modules exists
echo [3/8] Checking dependencies...
if exist "node_modules\" (
    echo [✅] node_modules found
) else (
    echo [⚠️] node_modules not found. Run 'npm install'
    set /a ERRORS+=1
)
echo.

:: Check Expo CLI
echo [4/8] Checking Expo CLI...
where expo >nul 2>&1
if %errorlevel% neq 0 (
    echo [⚠️] Expo CLI not found globally. Will use npx
) else (
    expo --version
    echo [✅] Expo CLI found
)
echo.

:: Check EAS CLI
echo [5/8] Checking EAS CLI...
where eas >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌] EAS CLI not found. Install with: npm install -g eas-cli
    set /a ERRORS+=1
) else (
    eas --version
    echo [✅] EAS CLI found
)
echo.

:: Check config files
echo [6/8] Checking configuration files...
set CONFIG_OK=1

if exist "app.json" (
    echo [✅] app.json exists
) else (
    echo [❌] app.json not found
    set /a ERRORS+=1
    set CONFIG_OK=0
)

if exist "eas.json" (
    echo [✅] eas.json exists
) else (
    echo [❌] eas.json not found
    set /a ERRORS+=1
    set CONFIG_OK=0
)

if exist "app.plugin.js" (
    echo [✅] app.plugin.js exists
) else (
    echo [❌] app.plugin.js not found
    set /a ERRORS+=1
    set CONFIG_OK=0
)

if exist "android\app\proguard-rules.pro" (
    echo [✅] proguard-rules.pro exists
) else (
    echo [❌] proguard-rules.pro not found
    set /a ERRORS+=1
    set CONFIG_OK=0
)
echo.

:: Check Razorpay config
echo [7/8] Checking Razorpay configuration...
if exist "src\config\razorpay.ts" (
    echo [✅] razorpay.ts exists
    findstr /C:"rzp_live_" "src\config\razorpay.ts" >nul 2>&1
    if !errorlevel! equ 0 (
        echo [✅] Razorpay Live key configured
    ) else (
        findstr /C:"rzp_test_" "src\config\razorpay.ts" >nul 2>&1
        if !errorlevel! equ 0 (
            echo [⚠️] Razorpay Test key configured (use Live key for production)
        ) else (
            echo [❌] Razorpay key not found
            set /a ERRORS+=1
        )
    )
) else (
    echo [❌] razorpay.ts not found
    set /a ERRORS+=1
)
echo.

:: Check Razorpay package
echo [8/8] Checking react-native-razorpay package...
if exist "node_modules\react-native-razorpay\" (
    echo [✅] react-native-razorpay installed
) else (
    echo [❌] react-native-razorpay not found. Run 'npm install'
    set /a ERRORS+=1
)
echo.

:: Summary
echo ========================================
echo Verification Summary
echo ========================================
if %ERRORS% equ 0 (
    echo [✅] All checks passed! Ready to build.
    echo.
    echo Next steps:
    echo 1. Run: npm install (if not done)
    echo 2. Run: eas login (if not logged in)
    echo 3. Run: build-razorpay-preview.bat
) else (
    echo [❌] Found %ERRORS% issue(s). Please fix before building.
    echo.
    echo Common fixes:
    echo - Install Node.js: https://nodejs.org/
    echo - Install EAS CLI: npm install -g eas-cli
    echo - Install dependencies: npm install
    echo - Login to EAS: eas login
)
echo ========================================
echo.

pause

