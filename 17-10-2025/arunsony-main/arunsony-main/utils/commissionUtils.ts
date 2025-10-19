/**
 * Commission Utility Functions
 * 
 * This file contains utility functions for handling commission data
 * and prioritizing MLM commission system over legacy referral bonus system.
 */

export interface CommissionStats {
  totalCommissions: number;
  totalPaidCommissions: number;
  pendingCommissions: number;
  walletCommissionTotal: number;
  totalEarnings: number;
  directReferrals: number;
  indirectReferrals: number;
  directCommissionTotal: number;
  indirectCommissionTotal: number;
  totalCommissionRecords: number;
  walletTransactionCount: number;
}

/**
 * Prioritizes MLM commission data over legacy referral bonus data
 * 
 * @param commissionStats - Raw commission stats from backend
 * @returns Updated commission stats with prioritized earnings
 */
export const prioritizeMLMCommissions = (commissionStats: CommissionStats): CommissionStats => {
  let totalEarnings = 0;
  
  // Calculate lifetime total earnings (pending + confirmed)
  // This should show the user's total earnings across all months
  const pendingAmount = commissionStats.pendingCommissions || 0;
  const confirmedAmount = commissionStats.totalCommissions || 0;
  const lifetimeTotal = pendingAmount + confirmedAmount;
  
  // First, try to get MLM commissions (the correct system)
  if (lifetimeTotal > 0) {
    totalEarnings = lifetimeTotal;
    console.log('✅ Using MLM commissions (lifetime total - pending + confirmed):', totalEarnings);
    console.log('   - Pending:', pendingAmount);
    console.log('   - Confirmed:', confirmedAmount);
    console.log('   - Lifetime Total:', lifetimeTotal);
  } else if (commissionStats.walletCommissionTotal && commissionStats.walletCommissionTotal > 0) {
    // Fallback to legacy system only if no MLM commissions exist
    totalEarnings = commissionStats.walletCommissionTotal;
    console.log('⚠️ Fallback to legacy referral bonuses:', totalEarnings);
  }
  
  // Return updated stats with prioritized earnings
  return {
    ...commissionStats,
    totalEarnings: totalEarnings
  };
};

/**
 * Gets the correct commission amount for display
 * Prioritizes MLM commissions over legacy referral bonuses
 * 
 * @param commissionStats - Raw commission stats from backend
 * @returns The correct commission amount to display
 */
export const getDisplayCommissionAmount = (commissionStats: CommissionStats): number => {
  // Calculate lifetime total earnings (pending + confirmed)
  const pendingAmount = commissionStats.pendingCommissions || 0;
  const confirmedAmount = commissionStats.totalCommissions || 0;
  const lifetimeTotal = pendingAmount + confirmedAmount;
  
  // First, try to get MLM commissions (the correct system)
  if (lifetimeTotal > 0) {
    return lifetimeTotal;
  } else if (commissionStats.walletCommissionTotal && commissionStats.walletCommissionTotal > 0) {
    // Fallback to legacy system only if no MLM commissions exist
    return commissionStats.walletCommissionTotal;
  }
  
  return 0;
};

/**
 * Determines if the commission data is from MLM system or legacy system
 * 
 * @param commissionStats - Raw commission stats from backend
 * @returns Object indicating the source and amount
 */
export const getCommissionSource = (commissionStats: CommissionStats): {
  source: 'MLM' | 'Legacy' | 'None';
  amount: number;
  message: string;
} => {
  // Calculate lifetime total earnings (pending + confirmed)
  const pendingAmount = commissionStats.pendingCommissions || 0;
  const confirmedAmount = commissionStats.totalCommissions || 0;
  const lifetimeTotal = pendingAmount + confirmedAmount;
  
  if (lifetimeTotal > 0) {
    return {
      source: 'MLM',
      amount: lifetimeTotal,
      message: `MLM Commission (Lifetime Total): ₹${lifetimeTotal} (Pending: ₹${pendingAmount} + Confirmed: ₹${confirmedAmount})`
    };
  } else if (commissionStats.walletCommissionTotal && commissionStats.walletCommissionTotal > 0) {
    return {
      source: 'Legacy',
      amount: commissionStats.walletCommissionTotal,
      message: `Legacy Referral Bonus: ₹${commissionStats.walletCommissionTotal}`
    };
  }
  
  return {
    source: 'None',
    amount: 0,
    message: 'No commissions available'
  };
};
