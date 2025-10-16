# Share Referral Screen - Real Data Implementation

## Overview
Updated the Share Referral Screen to display real-time data instead of hardcoded values.

## Changes Made

### 1. API Service Integration
**Using `api-axios.ts` service** (same as Dashboard for consistency):
- `getUserReferrals(userId)` - Fetches user's referral list with details
- `getApprovedWalletBalance()` - Fetches user's earnings and balance information

### 2. ShareReferralScreen Updates (`screens/ShareReferralScreen.tsx`)

#### New Features:
- **Real-time Data Fetching**: Automatically loads data when screen opens
- **Loading State**: Shows loading indicator while fetching data
- **Error Handling**: Displays alerts if data fetching fails

#### Stats Displayed:
1. **Total Referrals**: Count of all users referred by the current user
2. **Total Earned**: **Lifetime Earnings from All Level Commissions**
   - Uses the SAME data source as Dashboard's "Lifetime Earnings" (formatted in ₹)
   - Includes commissions from ALL levels (Level 1, Level 2, Level 3, etc.)
   - Sub-label clearly states "All Level Commissions" for user clarity
   - Section description: "Track your referral performance and earnings from all commission levels"
3. **Active Members**: Count of referrals who have paid their activation fee
4. **This Month Referrals**: Count of referrals made in the current month

**Important**: Total Earned in Share Referral Screen = Lifetime Earnings in Dashboard (both use `getApprovedWalletBalance().totalEarnings`)

**User Clarity Features**:
- Description text: "Track your referral performance and earnings from all commission levels"
- Sub-label under "Total Earned": "All Level Commissions"
- Clear indication that earnings include all commission tiers

### 3. Data Calculation Logic

```typescript
// Total Referrals
totalReferrals = referrals.length

// Active Members
activeMembers = referrals.filter(ref => ref.hasPaidActivation === true).length

// This Month Referrals
thisMonthReferrals = referrals.filter(ref => 
  ref.createdAt.month === currentMonth && 
  ref.createdAt.year === currentYear
).length

// Total Earned (Lifetime Earnings)
// Uses apiServiceAxios.getApprovedWalletBalance() - SAME as Dashboard
totalEarned = balanceResponse.totalEarnings.toFixed(0) (formatted as ₹X)
```

### 4. Data Consistency
- **Total Earned** uses `apiServiceAxios.getApprovedWalletBalance()` 
- This is the EXACT SAME method used by Dashboard for "Lifetime Earnings"
- Both screens will always show identical lifetime earnings values
- Data fetched in parallel using `Promise.all()` for better performance

## Backend Endpoints Used

### GET `/api/users/referrals/{userId}`
Returns:
```json
{
  "referralCount": 10,
  "referrals": [
    {
      "userId": 123,
      "email": "user@example.com",
      "name": "User Name",
      "status": "ACTIVE",
      "hasPaidActivation": true,
      "createdAt": "2024-10-01T10:00:00"
    }
  ]
}
```

### GET `/api/users/approved-balance`
Returns:
```json
{
  "approvedBalance": 5000.00,
  "totalEarnings": 12450.00,
  "totalWithdrawals": 2000.00,
  "userId": 123,
  "userEmail": "user@example.com"
}
```

## UI/UX Improvements
- Loading indicator shows while fetching data
- Stats automatically refresh when screen is opened
- Error handling with user-friendly alerts
- Real-time accurate data display

## Testing Checklist
- [ ] Stats load correctly on screen open
- [ ] Total Referrals matches actual count
- [ ] **Total Earned matches Dashboard's Lifetime Earnings (CRITICAL)**
- [ ] Total Earned displays correct amount with ₹ symbol and proper formatting
- [ ] Active Members shows only users with hasPaidActivation = true
- [ ] This Month shows only current month's referrals
- [ ] Loading indicator appears during data fetch
- [ ] Error alert shows if data fetch fails
- [ ] Works with different user accounts
- [ ] Data consistency: Navigate between Dashboard and Share Referral - earnings should match

