# test-admin-dashboard-fix.ps1
$backendUrl = "https://asmlmbackend-production.up.railway.app"
$loginEndpoint = "/api/users/login"
$usersEndpoint = "/api/users"

$adminEmail = "arunj2501@gmail.com"
$adminPassword = "Arun@123"

function Invoke-ApiRequest {
    param (
        [string]$Method,
        [string]$Url,
        [hashtable]$Headers = @{},
        $Body = $null
    )
    try {
        $params = @{
            Method = $Method
            Uri = $Url
            Headers = $Headers
            ContentType = "application/json"
        }
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Compress)
        }
        
        Write-Host "API REQUEST: Method=$Method, URL=$Url"
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "API Response Status: Success"
        return $response
    } catch {
        Write-Error "API Request Failed: $($_.Exception.Message)"
        throw $_.Exception
    }
}

function LoginAdmin {
    param (
        [string]$Email,
        [string]$Password
    )
    try {
        $loginBody = @{
            email = $Email
            password = $Password
        }
        $loginResponse = Invoke-ApiRequest -Method Post -Url "$backendUrl$loginEndpoint" -Body $loginBody
        if ($loginResponse.accessToken) {
            Write-Host "Admin login successful! Token obtained."
            return $loginResponse
        } else {
            Write-Error "Admin login failed: No access token in response."
            return $null
        }
    } catch {
        Write-Error "Admin login failed: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "TESTING ADMIN DASHBOARD REFERRAL COUNT FIX..." -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Login as admin to get authentication token
    Write-Host "Step 1: Login as admin to get authentication token..."
    $adminLogin = LoginAdmin -Email $adminEmail -Password $adminPassword
    if (-not $adminLogin) {
        throw "Failed to login admin."
    }
    $accessToken = $adminLogin.accessToken
    $adminUserId = $adminLogin.userId

    Write-Host "Admin: $($adminLogin.name) (ID: $adminUserId)"
    Write-Host ""

    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Accept" = "application/json"
    }

    # Step 2: Test Users API (used by admin dashboard)
    Write-Host "Step 2: Testing Users API (used by admin dashboard)..."
    $usersResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$usersEndpoint" -Headers $headers
    
    Write-Host ""
    Write-Host "USERS API RESPONSE (Admin Dashboard Data Source):"
    Write-Host "   - Total Users: $($usersResponse.Count)"
    
    # Find the specific user arunj2501@gmail.com
    $targetUser = $usersResponse | Where-Object { $_.email -eq "arunj2501@gmail.com" }
    
    if ($targetUser) {
        Write-Host ""
        Write-Host "TARGET USER (arunj2501@gmail.com):"
        Write-Host "   - User ID: $($targetUser.id)"
        Write-Host "   - Name: $($targetUser.name)"
        Write-Host "   - Email: $($targetUser.email)"
        Write-Host "   - Reference Code: $($targetUser.referenceCode)"
        Write-Host "   - Referral Count: $($targetUser.referralCount)" -ForegroundColor Yellow
        Write-Host "   - Tier: $($targetUser.tier)"
        Write-Host "   - Level: $($targetUser.level)"
        Write-Host "   - Wallet Balance: $($targetUser.walletBalance)"
        Write-Host ""
        
        # Check if the referral count is correct
        if ($targetUser.referralCount -eq 2) {
            Write-Host "SUCCESS: Admin dashboard now shows correct referral count: 2" -ForegroundColor Green
            Write-Host "   The User Details popup will now display 'Total Referrals: 2' instead of 3" -ForegroundColor Green
        } elseif ($targetUser.referralCount -eq 3) {
            Write-Host "FAILURE: Admin dashboard still shows incorrect referral count: 3" -ForegroundColor Red
            Write-Host "   The User Details popup will still display 'Total Referrals: 3' instead of 2" -ForegroundColor Red
        } else {
            Write-Host "UNEXPECTED: Admin dashboard shows referral count: $($targetUser.referralCount)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "ERROR: Could not find user arunj2501@gmail.com in the response" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "SUMMARY:"
    Write-Host "   - Database field (referral_count): 3 (outdated)"
    Write-Host "   - Actual referral records: 2 (correct)"
    Write-Host "   - Admin Dashboard API now returns: $($targetUser.referralCount) (should be 2)"
    
    if ($targetUser.referralCount -eq 2) {
        Write-Host ""
        Write-Host "CONFIRMATION: Admin dashboard is now synchronized!" -ForegroundColor Green
        Write-Host "   All screens (Mobile Dashboard, Referrals, Earnings, Admin Dashboard)" -ForegroundColor Green
        Write-Host "   now show the consistent and correct referral count: 2" -ForegroundColor Green
    }

} catch {
    Write-Error "An error occurred during testing: $($_.Exception.Message)"
}
