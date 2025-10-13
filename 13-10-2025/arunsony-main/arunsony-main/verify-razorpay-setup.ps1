# Razorpay Build Setup Verification Script
# PowerShell version

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Razorpay Build Setup Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$errors = 0

# Check Node.js
Write-Host "[1/8] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "[✅] Node.js found: $nodeVersion" -ForegroundColor Green
    } else {
        Write-Host "[❌] Node.js not found. Please install Node.js v18+" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "[❌] Node.js not found. Please install Node.js v18+" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Check npm
Write-Host "[2/8] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "[✅] npm found: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "[❌] npm not found" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "[❌] npm not found" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Check node_modules
Write-Host "[3/8] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "[✅] node_modules found" -ForegroundColor Green
} else {
    Write-Host "[⚠️] node_modules not found. Run 'npm install'" -ForegroundColor Yellow
    $errors++
}
Write-Host ""

# Check Expo CLI
Write-Host "[4/8] Checking Expo CLI..." -ForegroundColor Yellow
try {
    $expoVersion = expo --version 2>$null
    if ($expoVersion) {
        Write-Host "[✅] Expo CLI found: $expoVersion" -ForegroundColor Green
    } else {
        Write-Host "[⚠️] Expo CLI not found globally. Will use npx" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[⚠️] Expo CLI not found globally. Will use npx" -ForegroundColor Yellow
}
Write-Host ""

# Check EAS CLI
Write-Host "[5/8] Checking EAS CLI..." -ForegroundColor Yellow
try {
    $easVersion = eas --version 2>$null
    if ($easVersion) {
        Write-Host "[✅] EAS CLI found: $easVersion" -ForegroundColor Green
    } else {
        Write-Host "[❌] EAS CLI not found. Install with: npm install -g eas-cli" -ForegroundColor Red
        $errors++
    }
} catch {
    Write-Host "[❌] EAS CLI not found. Install with: npm install -g eas-cli" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Check config files
Write-Host "[6/8] Checking configuration files..." -ForegroundColor Yellow

$configFiles = @{
    "app.json" = "app.json exists"
    "eas.json" = "eas.json exists"
    "app.plugin.js" = "app.plugin.js exists"
    "android\app\proguard-rules.pro" = "proguard-rules.pro exists"
}

foreach ($file in $configFiles.Keys) {
    if (Test-Path $file) {
        Write-Host "[✅] $($configFiles[$file])" -ForegroundColor Green
    } else {
        Write-Host "[❌] $file not found" -ForegroundColor Red
        $errors++
    }
}
Write-Host ""

# Check Razorpay config
Write-Host "[7/8] Checking Razorpay configuration..." -ForegroundColor Yellow
if (Test-Path "src\config\razorpay.ts") {
    Write-Host "[✅] razorpay.ts exists" -ForegroundColor Green
    
    $razorpayContent = Get-Content "src\config\razorpay.ts" -Raw
    if ($razorpayContent -match "rzp_live_") {
        Write-Host "[✅] Razorpay Live key configured" -ForegroundColor Green
    } elseif ($razorpayContent -match "rzp_test_") {
        Write-Host "[⚠️] Razorpay Test key configured (use Live key for production)" -ForegroundColor Yellow
    } else {
        Write-Host "[❌] Razorpay key not found" -ForegroundColor Red
        $errors++
    }
} else {
    Write-Host "[❌] razorpay.ts not found" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Check Razorpay package
Write-Host "[8/8] Checking react-native-razorpay package..." -ForegroundColor Yellow
if (Test-Path "node_modules\react-native-razorpay") {
    Write-Host "[✅] react-native-razorpay installed" -ForegroundColor Green
} else {
    Write-Host "[❌] react-native-razorpay not found. Run 'npm install'" -ForegroundColor Red
    $errors++
}
Write-Host ""

# Summary
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

if ($errors -eq 0) {
    Write-Host "[✅] All checks passed! Ready to build.`n" -ForegroundColor Green
    Write-Host "Next steps:" -ForegroundColor White
    Write-Host "1. Run: npm install (if not done)" -ForegroundColor White
    Write-Host "2. Run: eas login (if not logged in)" -ForegroundColor White
    Write-Host "3. Run: .\build-razorpay-preview.bat`n" -ForegroundColor White
} else {
    Write-Host "[❌] Found $errors issue(s). Please fix before building.`n" -ForegroundColor Red
    Write-Host "Common fixes:" -ForegroundColor White
    Write-Host "- Install Node.js: https://nodejs.org/" -ForegroundColor White
    Write-Host "- Install EAS CLI: npm install -g eas-cli" -ForegroundColor White
    Write-Host "- Install dependencies: npm install" -ForegroundColor White
    Write-Host "- Login to EAS: eas login`n" -ForegroundColor White
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Read-Host "Press Enter to exit"

