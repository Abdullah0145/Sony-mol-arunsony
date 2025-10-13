# test-referral-count-discrepancy.ps1
$backendUrl = "https://asmlmbackend-production.up.railway.app"
$loginEndpoint = "/api/users/login"
$userProgressEndpoint = "/api/users/progress/"
$userReferralsEndpoint = "/api/referrals/user/"

$userEmail = "arunj2501@gmail.com"
$userPassword = "Arun@123"
$userId = 121

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
        
        Write-Host "🚀 API REQUEST: Method=$Method, URL=$Url"
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "📡 API Response Status: Success"
        Write-Host "📦 API Response Data: $($response | ConvertTo-Json -Compress)"
        return $response
    } catch {
        Write-Error "❌ API Request Failed: $($_.Exception.Message)"
        throw $_.Exception
    }
}

function LoginUser {
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
            Write-Host "✅ Login successful! Token obtained."
            return $loginResponse
        } else {
            Write-Error "❌ Login failed: No access token in response."
            return $null
        }
    } catch {
        Write-Error "❌ Login failed: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "🔍 INVESTIGATING REFERRAL COUNT DISCREPANCY..." -ForegroundColor Cyan
Write-Host ""

try {
    # Step 1: Login to get authentication token
    Write-Host "Step 1: Login to get authentication token..."
    $userLogin = LoginUser -Email $userEmail -Password $userPassword
    if (-not $userLogin) {
        throw "Failed to login user."
    }
    $accessToken = $userLogin.accessToken
    $userId = $userLogin.userId
    $userName = $userLogin.name

    Write-Host "User: $userName (ID: $userId)"
    Write-Host ""

    # Step 2: Check User Progress (Dashboard uses this)
    Write-Host "Step 2: Checking User Progress (Dashboard data source)..."
    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Accept" = "application/json"
    }
    $progressResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$userProgressEndpoint$userId" -Headers $headers
    
    Write-Host ""
    Write-Host "📊 USER PROGRESS DATA (Dashboard):"
    Write-Host "   - Referral Count: $($progressResponse.referralCount)" -ForegroundColor Yellow
    Write-Host "   - Level Number: $($progressResponse.levelNumber)"
    Write-Host "   - Tier Name: $($progressResponse.tierName)"
    Write-Host "   - Wallet Balance: $($progressResponse.walletBalance)"
    Write-Host ""

    # Step 3: Check User Referrals (Referrals screen uses this)
    Write-Host "Step 3: Checking User Referrals (Referrals screen data source)..."
    $referralsResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$userReferralsEndpoint$userId" -Headers $headers
    
    Write-Host ""
    Write-Host "👥 USER REFERRALS DATA (Referrals Screen):"
    Write-Host "   - Referral Count: $($referralsResponse.referralCount)" -ForegroundColor Yellow
    Write-Host "   - Actual Referrals: $($referralsResponse.referrals.Count)"
    Write-Host "   - Referrer Email: $($referralsResponse.referrerEmail)"
    Write-Host ""
    
    # Step 4: Show detailed referral information
    Write-Host "📋 DETAILED REFERRAL INFORMATION:"
    $referralsResponse.referrals | ForEach-Object {
        Write-Host "   - User ID: $($_.userId)"
        Write-Host "   - Name: $($_.name)"
        Write-Host "   - Email: $($_.email)"
        Write-Host "   - Phone: $($_.phoneNumber)"
        Write-Host "   - Status: $($_.status)"
        Write-Host "   - Has Paid Activation: $($_.hasPaidActivation)"
        Write-Host "   - Created At: $($_.createdAt)"
        Write-Host ""
    }

    # Step 5: Analysis
    Write-Host "🔍 DISCREPANCY ANALYSIS:"
    Write-Host "   Dashboard (User Progress): $($progressResponse.referralCount) referrals" -ForegroundColor Red
    Write-Host "   Referrals Screen: $($referralsResponse.referralCount) referrals" -ForegroundColor Red
    Write-Host "   Actual Referral Records: $($referralsResponse.referrals.Count) referrals" -ForegroundColor Red
    Write-Host ""
    
    if ($progressResponse.referralCount -ne $referralsResponse.referralCount) {
        Write-Host "❌ DISCREPANCY FOUND!" -ForegroundColor Red
        Write-Host "   - User Progress API uses: user.getReferralCount() (database field)"
        Write-Host "   - Referrals API uses: referrals.size() (actual referral records count)"
        Write-Host "   - This suggests the referralCount field in Users table is not in sync with actual referrals"
    } else {
        Write-Host "✅ No discrepancy found - counts match!"
    }

    Write-Host ""
    Write-Host "💡 RECOMMENDATION:"
    Write-Host "   The referralCount field in the Users table should be synchronized with actual referral records."
    Write-Host "   This can happen when:"
    Write-Host "   1. Referrals are added but referralCount is not updated"
    Write-Host "   2. referralCount is updated but referrals are not properly linked"
    Write-Host "   3. Data inconsistency from previous operations"

} catch {
    Write-Error "An error occurred during investigation: $($_.Exception.Message)"
}
