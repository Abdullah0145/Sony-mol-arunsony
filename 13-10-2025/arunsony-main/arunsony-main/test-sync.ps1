# test-sync.ps1
$backendUrl = "https://asmlmbackend-production.up.railway.app"
$loginEndpoint = "/api/users/login"
$userProgressEndpoint = "/api/users/progress/"
$userReferralsEndpoint = "/api/referrals/user/"
$availableRewardsEndpoint = "/api/userrewards/available/"

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
        
        Write-Host "API REQUEST: Method=$Method, URL=$Url"
        $response = Invoke-RestMethod @params -ErrorAction Stop
        Write-Host "API Response Status: Success"
        return $response
    } catch {
        Write-Error "API Request Failed: $($_.Exception.Message)"
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
            Write-Host "Login successful! Token obtained."
            return $loginResponse
        } else {
            Write-Error "Login failed: No access token in response."
            return $null
        }
    } catch {
        Write-Error "Login failed: $($_.Exception.Message)"
        return $null
    }
}

Write-Host "TESTING REFERRAL COUNT SYNCHRONIZATION FIX..." -ForegroundColor Cyan
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

    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Accept" = "application/json"
    }

    # Step 2: Test User Progress (Dashboard)
    Write-Host "Step 2: Testing User Progress API (Dashboard)..."
    $progressResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$userProgressEndpoint$userId" -Headers $headers
    
    Write-Host ""
    Write-Host "USER PROGRESS API (Dashboard):"
    Write-Host "   - Referral Count: $($progressResponse.referralCount)" -ForegroundColor Yellow
    Write-Host "   - Level Number: $($progressResponse.levelNumber)"
    Write-Host "   - Tier Name: $($progressResponse.tierName)"
    Write-Host ""

    # Step 3: Test User Referrals (Referrals Screen)
    Write-Host "Step 3: Testing User Referrals API (Referrals Screen)..."
    $referralsResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$userReferralsEndpoint$userId" -Headers $headers
    
    Write-Host ""
    Write-Host "USER REFERRALS API (Referrals Screen):"
    Write-Host "   - Referral Count: $($referralsResponse.referralCount)" -ForegroundColor Yellow
    Write-Host "   - Actual Referrals: $($referralsResponse.referrals.Count)"
    Write-Host ""

    # Step 4: Test Available Rewards (UserRewardService)
    Write-Host "Step 4: Testing Available Rewards API (UserRewardService)..."
    $rewardsResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$availableRewardsEndpoint$userId" -Headers $headers
    
    Write-Host ""
    Write-Host "AVAILABLE REWARDS API:"
    Write-Host "   - Available Rewards Count: $($rewardsResponse.availableRewards.Count)"
    if ($rewardsResponse.availableRewards.Count -gt 0) {
        $firstReward = $rewardsResponse.availableRewards[0]
        Write-Host "   - First Reward - User Current Referrals: $($firstReward.userCurrentReferrals)" -ForegroundColor Yellow
        Write-Host "   - First Reward - Required Referrals: $($firstReward.requiredReferrals)"
        Write-Host "   - First Reward - Is Eligible: $($firstReward.isEligible)"
        Write-Host "   - First Reward - Eligibility Status: $($firstReward.eligibilityStatus)"
    }
    Write-Host ""

    # Step 5: Analysis
    Write-Host "REFERRAL COUNT SYNCHRONIZATION TEST RESULTS:"
    Write-Host "   Dashboard (User Progress): $($progressResponse.referralCount) referrals" -ForegroundColor Cyan
    Write-Host "   Referrals Screen: $($referralsResponse.referralCount) referrals" -ForegroundColor Cyan
    Write-Host "   Actual Referral Records: $($referralsResponse.referrals.Count) referrals" -ForegroundColor Cyan
    
    if ($rewardsResponse.availableRewards.Count -gt 0) {
        $firstReward = $rewardsResponse.availableRewards[0]
        Write-Host "   UserRewardService: $($firstReward.userCurrentReferrals) referrals" -ForegroundColor Cyan
    }
    Write-Host ""

    # Check if all counts match
    $allCountsMatch = $true
    $expectedCount = $referralsResponse.referrals.Count
    
    if ($progressResponse.referralCount -ne $expectedCount) {
        $allCountsMatch = $false
        Write-Host "User Progress API mismatch: Expected $expectedCount, got $($progressResponse.referralCount)" -ForegroundColor Red
    }
    
    if ($referralsResponse.referralCount -ne $expectedCount) {
        $allCountsMatch = $false
        Write-Host "User Referrals API mismatch: Expected $expectedCount, got $($referralsResponse.referralCount)" -ForegroundColor Red
    }
    
    if ($rewardsResponse.availableRewards.Count -gt 0) {
        $firstReward = $rewardsResponse.availableRewards[0]
        if ($firstReward.userCurrentReferrals -ne $expectedCount) {
            $allCountsMatch = $false
            Write-Host "UserRewardService mismatch: Expected $expectedCount, got $($firstReward.userCurrentReferrals)" -ForegroundColor Red
        }
    }

    if ($allCountsMatch) {
        Write-Host "SUCCESS: All referral counts are now synchronized!" -ForegroundColor Green
        Write-Host "   All APIs now show consistent referral count: $expectedCount" -ForegroundColor Green
    } else {
        Write-Host "FAILURE: Referral counts are still inconsistent" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "DETAILED REFERRAL RECORDS:"
    $referralsResponse.referrals | ForEach-Object {
        Write-Host "   - User ID: $($_.userId)"
        Write-Host "   - Name: $($_.name)"
        Write-Host "   - Email: $($_.email)"
        Write-Host "   - Status: $($_.status)"
        Write-Host "   - Has Paid Activation: $($_.hasPaidActivation)"
        Write-Host ""
    }

} catch {
    Write-Error "An error occurred during testing: $($_.Exception.Message)"
}
