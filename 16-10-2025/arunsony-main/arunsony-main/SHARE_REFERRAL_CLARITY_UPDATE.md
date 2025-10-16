# Share Referral Screen - User Clarity Update

## Overview
Enhanced the Share Referral Screen to clearly communicate that "Total Earned" includes earnings from ALL commission levels.

## Problem Solved
Users might not understand that the ₹310 shown includes:
- Direct referral commissions (Level 1): ₹200
- Indirect referral commissions (Level 2): ₹110
- Any other level commissions

## Solution Implemented

### Visual Updates

#### 1. Section Header with Description
```
Your Referral Stats
Track your referral performance and earnings from all commission levels
```

#### 2. Enhanced Stat Card
```
┌─────────────────────┐
│       ₹310          │  ← Large, bold, gold text
│   Total Earned      │  ← Medium gray text
│All Level Commissions│  ← Small, italic, lighter gray
└─────────────────────┘
```

### Code Changes

#### ShareReferralScreen.tsx
```typescript
// Added description above stats
<Text style={styles.statsDescription}>
  Track your referral performance and earnings from all commission levels
</Text>

// Added sub-label to Total Earned card
<View style={styles.statCard}>
  <Text style={styles.statNumber}>{stats.totalEarned}</Text>
  <Text style={styles.statLabel}>Total Earned</Text>
  <Text style={styles.statSubLabel}>All Level Commissions</Text>
</View>
```

#### New Styles Added
```typescript
statsDescription: {
  fontSize: 13,
  color: '#999999',
  marginBottom: 15,
  lineHeight: 18,
}

statSubLabel: {
  fontSize: 10,
  color: '#999999',
  textAlign: 'center',
  marginTop: 3,
  fontStyle: 'italic',
}
```

## User Experience Benefits

### Before
- Shows: "₹310" under "Total Earned"
- User might wonder: "Where did this come from?"

### After
- Shows: "₹310" under "Total Earned" with "All Level Commissions"
- Section description explains: "Track your referral performance and earnings from all commission levels"
- User understands: "This is my total earnings from all referral levels!"

## Example Calculation Shown to User

The ₹310 visible to the user breaks down as:
- **Level 1 (Direct)**: 2 referrals × ₹100 = ₹200
- **Level 2 (Indirect)**: 2 referrals × ₹55 = ₹110
- **Total**: ₹310 ✅

The screen now clearly indicates this total includes "All Level Commissions"

## Technical Details
- Uses same data source as Dashboard's "Lifetime Earnings"
- Endpoint: `/api/users/approved-balance`
- Field: `totalEarnings`
- Format: `₹{value.toFixed(0)}`

## Testing
✅ User sees ₹310 as Total Earned
✅ User sees "All Level Commissions" sub-label
✅ User sees descriptive text about commission levels
✅ Value matches Dashboard's Lifetime Earnings
✅ Visual hierarchy is clear and readable

