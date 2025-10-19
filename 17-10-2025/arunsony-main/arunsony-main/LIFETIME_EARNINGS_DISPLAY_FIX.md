# Lifetime Earnings Display Fix

## Issue Description
The earnings screen in the mobile app was showing ₹100 instead of ₹200 for the "Pending + Confirmed" card. The user expected to see their lifetime total earnings (pending + confirmed) across all months, which should be ₹200.

## Root Cause
The `prioritizeMLMCommissions` function in `utils/commissionUtils.ts` was only using either `totalPaidCommissions` or `totalCommissions`, but not the sum of both pending and confirmed commissions to show the lifetime total.

## Solution
Updated the commission utility functions to calculate the **lifetime total earnings** as the sum of pending and confirmed commissions:

### Changes Made

#### 1. Updated `prioritizeMLMCommissions` function
```typescript
// BEFORE: Only used one commission type
if (commissionStats.totalPaidCommissions && commissionStats.totalPaidCommissions > 0) {
  totalEarnings = commissionStats.totalPaidCommissions;
}

// AFTER: Calculate lifetime total (pending + confirmed)
const pendingAmount = commissionStats.pendingCommissions || 0;
const confirmedAmount = commissionStats.totalCommissions || 0;
const lifetimeTotal = pendingAmount + confirmedAmount;

if (lifetimeTotal > 0) {
  totalEarnings = lifetimeTotal;
}
```

#### 2. Updated `getDisplayCommissionAmount` function
- Now calculates and returns the lifetime total (pending + confirmed)
- Consistent with the main prioritization logic

#### 3. Updated `getCommissionSource` function
- Provides detailed breakdown showing pending and confirmed amounts
- Better logging for debugging commission calculations

## Expected Result
- **"Pending + Confirmed" card** now shows ₹200 (lifetime total)
- **"Pending" card** shows ₹100 (pending commissions)
- **"Confirmed" card** shows ₹100 (confirmed commissions)
- **"This Month" card** shows current month's earnings

## Files Modified
- `arunsony/utils/commissionUtils.ts`

## Testing
The fix has been deployed and should now correctly display:
- Lifetime total earnings: ₹200
- Pending commissions: ₹100  
- Confirmed commissions: ₹100
- Total (Pending + Confirmed): ₹200 ✅

## Impact
- Users will now see their correct lifetime total earnings
- The earnings screen accurately reflects all earnings across all months
- Better transparency in commission breakdown
- Consistent earnings display across the app

## Deployment Status
✅ **COMPLETED** - Changes committed and pushed to repository
