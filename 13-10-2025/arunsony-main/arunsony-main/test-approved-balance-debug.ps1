# Test script to debug approved balance endpoint
Write-Host "🔍 Testing Approved Balance Endpoint with Debug Logging..." -ForegroundColor Cyan

# Test user credentials (same as before)
$testUser = @{
    email = "arunj2501@gmail.com"
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
        
        Write-Host "`n2. 💰 Fetching approved balance (with debug logs)..." -ForegroundColor Yellow
        $headers = @{
            "Authorization" = "Bearer $token"
            "Content-Type" = "application/json"
        }
        
        $balanceResponse = Invoke-RestMethod -Uri "$baseUrl/api/users/approved-balance" -Method GET -Headers $headers
        
        Write-Host "`n📊 Approved Balance Response:" -ForegroundColor Green
        $balanceResponse | ConvertTo-Json -Depth 3
        
        Write-Host "`n🔍 Key Values:" -ForegroundColor Cyan
        Write-Host "  - Approved Balance: ₹$($balanceResponse.approvedBalance)" -ForegroundColor White
        Write-Host "  - Total Earnings: ₹$($balanceResponse.totalEarnings)" -ForegroundColor White
        Write-Host "  - Total Withdrawals: ₹$($balanceResponse.totalWithdrawals)" -ForegroundColor White
        Write-Host "  - User ID: $($balanceResponse.userId)" -ForegroundColor White
        Write-Host "  - User Email: $($balanceResponse.userEmail)" -ForegroundColor White
        
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
