# Test script to verify approved balance API is working correctly
Write-Host "🔍 Testing Approved Balance API..." -ForegroundColor Cyan

# Test user credentials (user 138 who had the ₹100 commission approved)
$testUser = @{
    email = "arunj2501@gmail.com"  # This should be user 138's email
    password = "password123"
}

$baseUrl = "https://asbackend-production.up.railway.app"

try {
    Write-Host "`n1. 🔐 Logging in as test user..." -ForegroundColor Yellow
    $loginBody = @{
        email = $testUser.email
        password = $testUser.password
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    
    if ($loginResponse.token) {
        $token = $loginResponse.token
        Write-Host "✅ Login successful! Token received." -ForegroundColor Green
        Write-Host "👤 User ID: $($loginResponse.user?.userId)" -ForegroundColor Cyan
        Write-Host "👤 User Name: $($loginResponse.user?.name)" -ForegroundColor Cyan
        
        Write-Host "`n2. 💰 Testing Approved Balance API..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/approved-balance" -Method GET -Headers $headers
        
        Write-Host "`n📊 API Response:" -ForegroundColor Green
        $balanceResponse | ConvertTo-Json -Depth 3
        
        Write-Host "`n🔍 Key Values Analysis:" -ForegroundColor Cyan
        Write-Host "  - Approved Balance: ₹$($balanceResponse.approvedBalance)" -ForegroundColor White
        Write-Host "  - Total Earnings: ₹$($balanceResponse.totalEarnings)" -ForegroundColor White
        Write-Host "  - Total Withdrawals: ₹$($balanceResponse.totalWithdrawals)" -ForegroundColor White
        Write-Host "  - User ID: $($balanceResponse.userId)" -ForegroundColor White
        Write-Host "  - User Email: $($balanceResponse.userEmail)" -ForegroundColor White
        
        # Analysis
        Write-Host "`n📈 Analysis:" -ForegroundColor Yellow
        if ($balanceResponse.approvedBalance -eq 100) {
            Write-Host "  ✅ APPROVED BALANCE: ₹100 (CORRECT - Commission approved!)" -ForegroundColor Green
        } elseif ($balanceResponse.approvedBalance -eq 0) {
            Write-Host "  ❌ APPROVED BALANCE: ₹0 (INCORRECT - Should be ₹100)" -ForegroundColor Red
        } else {
            Write-Host "  ⚠️ APPROVED BALANCE: ₹$($balanceResponse.approvedBalance) (Unexpected amount)" -ForegroundColor Yellow
        }
        
        if ($balanceResponse.totalEarnings -eq 100) {
            Write-Host "  ✅ TOTAL EARNINGS: ₹100 (CORRECT - Commission included!)" -ForegroundColor Green
        } elseif ($balanceResponse.totalEarnings -eq 0) {
            Write-Host "  ❌ TOTAL EARNINGS: ₹0 (INCORRECT - Should be ₹100)" -ForegroundColor Red
        } else {
            Write-Host "  ⚠️ TOTAL EARNINGS: ₹$($balanceResponse.totalEarnings) (Unexpected amount)" -ForegroundColor Yellow
        }
        
        Write-Host "`n3. 🔍 Testing Profile API for comparison..." -ForegroundColor Yellow
        $profileResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/profile" -Method GET -Headers $headers
        
        Write-Host "Profile Wallet Balance: ₹$($profileResponse.walletBalance)" -ForegroundColor Cyan
        Write-Host "Profile vs Approved Balance: Profile(₹$($profileResponse.walletBalance)) vs Approved(₹$($balanceResponse.approvedBalance))" -ForegroundColor Cyan
        
    } else {
        Write-Host "❌ Login failed: No token received" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Status Code: $statusCode" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Error Body: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "   Could not read error response body" -ForegroundColor Red
        }
    }
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green
