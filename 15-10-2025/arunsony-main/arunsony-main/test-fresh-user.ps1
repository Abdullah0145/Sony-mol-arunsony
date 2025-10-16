# 🧪 FRESH USER TEST SCRIPT - Rs1 Referral Code Generation
# This script helps test the complete flow with a fresh user

Write-Host "🧪 FRESH USER TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Test user details
$testEmail = "freshtest@example.com"
$testPhone = "7777777777"
$testName = "Fresh Test User"
$testPassword = "testpass123"

Write-Host "📋 Test User Details:" -ForegroundColor Yellow
Write-Host "Email: $testEmail"
Write-Host "Phone: $testPhone"
Write-Host "Name: $testName"
Write-Host ""

# Step 1: Register fresh user
Write-Host "🔐 Step 1: Registering fresh user..." -ForegroundColor Green
$headers = @{"Content-Type"="application/json"}
$body = @{
    name = $testName
    email = $testEmail
    phoneNumber = $testPhone
    password = $testPassword
    referredByCode = $null
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "https://asmlmbackend-production.up.railway.app/api/users/register" -Method POST -Headers $headers -Body $body
    Write-Host "✅ Registration successful: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
    Write-Host ""
    Write-Host "📧 Please check your email ($testEmail) for the OTP" -ForegroundColor Yellow
    Write-Host "📧 Check spam folder if not in inbox" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "❌ Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

# Step 2: Wait for user to verify OTP
Write-Host "⏳ Step 2: Waiting for OTP verification..." -ForegroundColor Yellow
Write-Host "Please verify the OTP in your email and then press Enter to continue..."
Read-Host

# Step 3: Login with fresh user
Write-Host "🔑 Step 3: Logging in with fresh user..." -ForegroundColor Green
$loginBody = @{
    email = $testEmail
    password = $testPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "https://asmlmbackend-production.up.railway.app/api/users/login" -Method POST -Headers $headers -Body $loginBody
    Write-Host "✅ Login successful: $($loginResponse.StatusCode)" -ForegroundColor Green
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $userId = $loginData.userId
    $token = $loginData.token
    
    Write-Host "User ID: $userId"
    Write-Host "Token: $($token.Substring(0, 20))..."
    Write-Host ""
} catch {
    Write-Host "❌ Login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 4: Check user status
Write-Host "👤 Step 4: Checking user status..." -ForegroundColor Green
$authHeaders = @{
    "Content-Type" = "application/json"
    "Authorization" = "Bearer $token"
}

try {
    $statusResponse = Invoke-WebRequest -Uri "https://asmlmbackend-production.up.railway.app/api/users/payment-status/$userId" -Headers $authHeaders
    Write-Host "✅ User status retrieved: $($statusResponse.StatusCode)" -ForegroundColor Green
    $statusData = $statusResponse.Content | ConvertFrom-Json
    Write-Host "User Status:"
    Write-Host "  - Has Paid Activation: $($statusData.hasPaidActivation)"
    Write-Host "  - Is First Order: $($statusData.isFirstOrder)"
    Write-Host "  - User ID: $($statusData.userId)"
    Write-Host ""
    
    if ($statusData.isFirstOrder -eq $true) {
        Write-Host "✅ Perfect! User has isFirstOrder=true - ready for referral code generation" -ForegroundColor Green
    } else {
        Write-Host "⚠️ User has isFirstOrder=false - referral code generation may be skipped" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Failed to get user status: $($_.Exception.Message)" -ForegroundColor Red
}

# Step 5: Test products
Write-Host "🛍️ Step 5: Testing products..." -ForegroundColor Green
try {
    $productsResponse = Invoke-WebRequest -Uri "https://asmlmbackend-production.up.railway.app/api/products" -Headers $authHeaders
    Write-Host "✅ Products retrieved: $($productsResponse.StatusCode)" -ForegroundColor Green
    $products = $productsResponse.Content | ConvertFrom-Json
    Write-Host "Available products: $($products.Count)"
    foreach ($product in $products) {
        Write-Host "  - $($product.name): Rs$($product.price)"
    }
    Write-Host ""
} catch {
    Write-Host "❌ Failed to get products: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎯 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Use the frontend app to login with: $testEmail / $testPassword"
Write-Host "2. Add 4 products to cart"
Write-Host "3. Go to checkout"
Write-Host "4. Click 'Test Mode - Pay Rs1'"
Write-Host "5. Complete the Rs1 payment"
Write-Host "6. Check for referral code generation"
Write-Host ""
Write-Host "✅ Fresh user test setup complete!" -ForegroundColor Green
