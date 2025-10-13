# FRESH USER TEST SCRIPT - Rs1 Referral Code Generation
# This script helps test the complete flow with a fresh user

Write-Host "FRESH USER TEST SCRIPT" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

# Test user details
$testEmail = "freshtest@example.com"
$testPhone = "7777777777"
$testName = "Fresh Test User"
$testPassword = "testpass123"

Write-Host "Test User Details:" -ForegroundColor Yellow
Write-Host "Email: $testEmail"
Write-Host "Phone: $testPhone"
Write-Host "Name: $testName"
Write-Host ""

# Step 1: Register fresh user
Write-Host "Step 1: Registering fresh user..." -ForegroundColor Green
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
    Write-Host "Registration successful: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
    Write-Host ""
    Write-Host "Please check your email ($testEmail) for the OTP" -ForegroundColor Yellow
    Write-Host "Check spam folder if not in inbox" -ForegroundColor Yellow
    Write-Host ""
} catch {
    Write-Host "Registration failed: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Check your email for OTP"
Write-Host "2. Use the frontend app to register with: $testEmail"
Write-Host "3. Enter the OTP when prompted"
Write-Host "4. Login with: $testEmail / $testPassword"
Write-Host "5. Add 4 products to cart"
Write-Host "6. Go to checkout"
Write-Host "7. Click 'Test Mode - Pay Rs1'"
Write-Host "8. Complete the Rs1 payment"
Write-Host "9. Check for referral code generation"
Write-Host ""
Write-Host "Fresh user test setup complete!" -ForegroundColor Green
