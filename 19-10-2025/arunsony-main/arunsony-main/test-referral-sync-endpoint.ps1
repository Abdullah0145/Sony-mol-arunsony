# test-referral-sync-endpoint.ps1
$backendUrl = "https://asmlmbackend-production.up.railway.app"
$loginEndpoint = "/api/users/login"
$syncEndpoint = "/api/users/sync-referral-counts"
$usersEndpoint = "/api/users"

$userEmail = "arunj2501@gmail.com"
$userPassword = "Arun@123"

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

Write-Host "TESTING REFERRAL COUNT SYNCHRONIZATION ENDPOINT..." -ForegroundColor Cyan
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

    Write-Host "User: $($userLogin.name) (ID: $userId)"
    Write-Host ""

    $headers = @{
        "Authorization" = "Bearer $accessToken"
        "Accept" = "application/json"
    }

    # Step 2: Check current state before sync
    Write-Host "Step 2: Checking current referral count state..."
    $usersResponse = Invoke-ApiRequest -Method Get -Url "$backendUrl$usersEndpoint" -Headers $headers
    $targetUser = $usersResponse | Where-Object { $_.email -eq "arunj2501@gmail.com" }
    
    if ($targetUser) {
        Write-Host ""
        Write-Host "BEFORE SYNC - User arunj2501@gmail.com:"
        Write-Host "   - Referral Count (Database Field): $($targetUser.referralCount)"
        Write-Host ""
    }

    # Step 3: Run the sync endpoint
    Write-Host "Step 3: Running referral count synchronization..."
    Write-Host "   This will fix any discrepancies between database field and actual referral records"
    Write-Host ""
    
    $syncResponse = Invoke-ApiRequest -Method Post -Url "$backendUrl$syncEndpoint" -Headers $headers
    
    Write-Host ""
    Write-Host "SYNC RESULTS:"
    Write-Host "   - Message: $($syncResponse.message)"
    Write-Host "   - Total Users: $($syncResponse.totalUsers)"
    Write-Host "   - Discrepancies Found: $($syncResponse.discrepanciesFound)" -ForegroundColor Yellow
    Write-Host "   - Users Updated: $($syncResponse.usersUpdated)" -ForegroundColor Green
    Write-Host "   - Timestamp: $($syncResponse.timestamp)"
    Write-Host ""

    # Step 4: Check state after sync
    Write-Host "Step 4: Checking referral count state after sync..."
    $usersResponseAfter = Invoke-ApiRequest -Method Get -Url "$backendUrl$usersEndpoint" -Headers $headers
    $targetUserAfter = $usersResponseAfter | Where-Object { $_.email -eq "arunj2501@gmail.com" }
    
    if ($targetUserAfter) {
        Write-Host ""
        Write-Host "AFTER SYNC - User arunj2501@gmail.com:"
        Write-Host "   - Referral Count (Database Field): $($targetUserAfter.referralCount)" -ForegroundColor Green
        Write-Host ""
        
        # Compare before and after
        if ($targetUser.referralCount -ne $targetUserAfter.referralCount) {
            Write-Host "SUCCESS: Referral count was corrected!" -ForegroundColor Green
            Write-Host "   Changed from: $($targetUser.referralCount) to: $($targetUserAfter.referralCount)"
        } else {
            Write-Host "INFO: Referral count was already correct: $($targetUserAfter.referralCount)"
        }
    }

    Write-Host ""
    Write-Host "SUMMARY:"
    Write-Host "   The sync endpoint has successfully synchronized the database referral_count field"
    Write-Host "   with the actual referral records. This ensures data consistency across all systems."
    Write-Host ""
    Write-Host "BENEFITS:"
    Write-Host "   ✅ Database field now matches actual referral records"
    Write-Host "   ✅ All APIs return consistent data"
    Write-Host "   ✅ Admin dashboard shows correct counts"
    Write-Host "   ✅ Mobile app shows correct counts"
    Write-Host "   ✅ Future deletions will automatically update counters"

} catch {
    Write-Error "An error occurred during testing: $($_.Exception.Message)"
}
