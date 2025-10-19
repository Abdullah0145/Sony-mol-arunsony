# Lifetime Earnings Consistency Across Screens

## Summary
Ensured that "Total Earned" in Share Referral Screen matches "Lifetime Earnings" in Dashboard Screen.

## Implementation Details

### API Service Used
Both screens now use **`apiServiceAxios.getApprovedWalletBalance()`** from `services/api-axios.ts`

### Backend Endpoint
`GET /api/users/approved-balance`

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

### Data Flow

#### Dashboard Screen
```typescript
const fetchLifetimeEarnings = async () => {
  const response = await apiServiceAxios.getApprovedWalletBalance();
  if (response.success && response.data) {
    setLifetimeEarnings(response.data.totalEarnings || 0);
  }
};
```

Display: `₹{lifetimeEarnings.toFixed(0)}`

#### Share Referral Screen
```typescript
const fetchReferralStats = async () => {
  const balanceResponse = await apiServiceAxios.getApprovedWalletBalance();
  if (balanceResponse.success && balanceResponse.data) {
    const earnings = balanceResponse.data.totalEarnings || 0;
    totalEarned = `₹${earnings.toFixed(0)}`;
  }
};
```

Display: `{stats.totalEarned}`

## Key Points
1. ✅ Both screens use the same API service (`api-axios.ts`)
2. ✅ Both screens call the same endpoint (`/api/users/approved-balance`)
3. ✅ Both screens use the same data field (`totalEarnings`)
4. ✅ Both screens format the value identically (`toFixed(0)` with ₹ symbol)
5. ✅ Data is fetched from backend, ensuring real-time accuracy

## Backend Calculation
The backend calculates `totalEarnings` by:
1. Summing all APPROVED/SUCCESS wallet transactions (DEPOSIT, REFERRAL_BONUS, COMMISSION)
2. Adding approved commissions from ReferralNetwork table (if not already in WalletTransaction)
3. Does NOT subtract withdrawals (that's tracked separately)

## User Clarity Improvements
To help users understand what "Total Earned" includes, the Share Referral Screen now features:

1. **Section Description**:
   ```
   "Track your referral performance and earnings from all commission levels"
   ```

2. **Stat Card Sub-label**:
   ```
   Total Earned
   All Level Commissions  ← Italic, smaller text
   ```

This makes it clear that the earnings include:
- Level 1 commissions (direct referrals)
- Level 2 commissions (indirect referrals)
- Level 3+ commissions (network referrals)
- All other commission types

## Expected Result
**Dashboard → Lifetime Earnings** = **Share Referral → Total Earned**

Both should always display the same value in rupees.

Example:
- Direct Level Commissions: 2 × ₹100 = ₹200
- Indirect Commissions: 2 × ₹55 = ₹110
- **Total Earned Displayed: ₹310** ✅

