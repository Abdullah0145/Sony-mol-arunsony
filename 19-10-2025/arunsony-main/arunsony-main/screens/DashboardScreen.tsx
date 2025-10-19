import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios, UserProgress, UserReward } from '../services/api-axios';

interface DashboardScreenProps {
  navigation: any;
  route?: {
    params?: {
      refreshData?: boolean;
    };
  };
}

export default function DashboardScreen({ navigation, route }: DashboardScreenProps) {
  const { user, hasPaid, updatePaymentStatus } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [realTimePaymentStatus, setRealTimePaymentStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thisMonthEarnings, setThisMonthEarnings] = useState<number>(0);
  const [thisMonthPercentage, setThisMonthPercentage] = useState<string>('0%');
  const [availableRewardsCount, setAvailableRewardsCount] = useState<number>(0);
  const [lifetimeEarnings, setLifetimeEarnings] = useState<number>(0);
  const [totalWithdrawals, setTotalWithdrawals] = useState<number>(0);
  const [commissionRate, setCommissionRate] = useState<string>('10%');
  const [progressPercentage, setProgressPercentage] = useState<string>('0%');
  const [nextLevelInfo, setNextLevelInfo] = useState<{
    nextLevel: number;
    referralsNeeded: number;
    currentReferrals: number;
  } | null>(null);
  const [tierRequirements, setTierRequirements] = useState<any[]>([]);

  // Function to get commission rate from backend
  const fetchCommissionRate = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserCommissionRates(Number(user.userId));
        if (response.success && response.data) {
          const primaryRate = response.data.primaryCommissionRate;
          if (primaryRate !== undefined && primaryRate !== null) {
            setCommissionRate(`${primaryRate}%`);
            console.log('✅ Commission rate fetched from backend:', primaryRate + '%');
          }
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching commission rate:', error);
      // Fallback to default rate
      setCommissionRate('10%');
    }
  };

  // Function to get tier requirements from backend
  const fetchTierRequirements = async () => {
    try {
      const response = await apiServiceAxios.getTierRequirements();
      if (response.success && response.data) {
        setTierRequirements(response.data);
        console.log('✅ Tier requirements fetched from backend:', response.data);
      }
    } catch (error) {
      console.error('Dashboard - Error fetching tier requirements:', error);
      // Fallback to hardcoded values
      setTierRequirements([]);
    }
  };

  // Function to calculate progress percentage to next tier
  const calculateProgressPercentage = (tierName?: string, levelNumber?: number, referralCount?: number) => {
    if (!tierName || !levelNumber || referralCount === undefined) {
      setProgressPercentage('0%');
      setNextLevelInfo(null);
      return;
    }

    // Use dynamic tier requirements from backend, fallback to hardcoded if not available
    let tierMinimums: { [key: string]: number } = {};
    
    if (tierRequirements && tierRequirements.length > 0) {
      // Build tier requirements from backend data
      tierRequirements.forEach((tier: any) => {
        if (tier.name && tier.levels && tier.levels.length > 0) {
          // Get the minimum referrals for the first level of each tier
          const firstLevel = tier.levels[0];
          if (firstLevel && firstLevel.requiredReferrals) {
            tierMinimums[tier.name.toUpperCase()] = firstLevel.requiredReferrals;
          }
        }
      });
      console.log('✅ Using dynamic tier requirements from backend:', tierMinimums);
    } else {
      // Fallback to hardcoded values
      tierMinimums = {
        'BRONZE': 1,    // Minimum 1 referral to start BRONZE
        'SILVER': 5,    // Minimum 5 referrals to start SILVER
        'GOLD': 8,      // Minimum 8 referrals to start GOLD
        'DIAMOND': 10   // Minimum 10 referrals to start DIAMOND
      };
      console.log('⚠️ Using fallback hardcoded tier requirements:', tierMinimums);
    }

    // Get current tier minimum and next tier minimum
    const currentTierMin = tierMinimums[tierName] || 1;
    const nextTierMin = getNextTierMinimum(tierName, tierMinimums);

    if (nextTierMin === null) {
      // User is at the highest tier (DIAMOND) - show 100% progress
      setProgressPercentage('100%');
      setNextLevelInfo({
        nextLevel: levelNumber,
        referralsNeeded: 0,
        currentReferrals: referralCount
      });
      return;
    }

    // Calculate progress to next tier
    const progressToNextTier = Math.min((referralCount / nextTierMin) * 100, 100);
    const referralsNeeded = Math.max(nextTierMin - referralCount, 0);
    
    setProgressPercentage(`${Math.round(progressToNextTier)}%`);
    setNextLevelInfo({
      nextLevel: levelNumber,
      referralsNeeded: referralsNeeded,
      currentReferrals: referralCount
    });

    console.log('📊 Tier progress calculation:', {
      tierName,
      levelNumber,
      referralCount,
      currentTierMin,
      nextTierMin,
      progressToNextTier: Math.round(progressToNextTier),
      referralsNeeded
    });
  };

  // Helper function to get next tier minimum requirements
  const getNextTierMinimum = (currentTier: string, tierMinimums: { [key: string]: number }): number | null => {
    // Define the progression order
    const tierOrder = ['BRONZE', 'SILVER', 'GOLD', 'DIAMOND'];
    const currentIndex = tierOrder.indexOf(currentTier);
    
    if (currentIndex === -1 || currentIndex === tierOrder.length - 1) {
      // Current tier not found or is the highest tier
      return null;
    }
    
    const nextTier = tierOrder[currentIndex + 1];
    return tierMinimums[nextTier] || null;
  };

  // Helper function to get next tier name
  const getNextTierName = (currentTier?: string): string => {
    const tierNames: { [key: string]: string } = {
      'BRONZE': 'Silver',
      'SILVER': 'Gold',
      'GOLD': 'Diamond',
      'DIAMOND': 'Max Tier'
    };
    return tierNames[currentTier || ''] || 'Next Tier';
  };

  const fetchUserProgress = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserProgress(Number(user.userId));
        if (response.success && response.data) {
          setUserProgress(response.data);
          console.log('Dashboard - User progress fetched:', response.data);
          
          // Calculate progress percentage after fetching user progress
          calculateProgressPercentage(
            response.data.tierName,
            response.data.levelNumber,
            response.data.referralCount
          );
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching user progress:', error);
    }
  };

  const fetchRealTimePaymentStatus = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserPaymentStatus(Number(user.userId));
        if (response.success && response.data) {
          setRealTimePaymentStatus(response.data.hasPaidActivation);
          console.log('Dashboard - Real-time payment status fetched:', response.data.hasPaidActivation);
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching real-time payment status:', error);
    }
  };

  const fetchThisMonthEarnings = async () => {
    try {
      if (user?.userId) {
        console.log('Dashboard - Fetching APPROVED this month earnings for user:', user.userId);
        
        // Fetch commission history to calculate this month's APPROVED earnings only
        const historyResponse = await apiServiceAxios.getUserCommissionHistory(Number(user.userId));
        console.log('Dashboard - Commission history response:', historyResponse);

        if (historyResponse.success && historyResponse.data) {
          const commissionHistoryData = historyResponse.data;
          console.log('Dashboard - Commission history data:', commissionHistoryData);

          // Calculate "This Month" - ONLY show APPROVED commissions where user is the REFERRER (earned commissions)
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
          const currentMonthCommissions = commissionHistoryData.filter((commission: any) => {
            if (!commission.createdAt) return false;
            const commissionDate = new Date(commission.createdAt);
            const commissionMonth = commissionDate.toLocaleDateString('en-US', { month: 'short' });
            return commissionMonth === currentMonth;
          });
          
          // Only count APPROVED commissions where this user is the referrer (earned money)
          const approvedCommissions = currentMonthCommissions.filter((commission: any) => {
            return commission.referrerUserId === user.userId && 
                   commission.commissionStatus === 'PAID'; // Only approved/paid commissions
          });
          
          const currentMonthTotal = approvedCommissions.reduce((total: number, commission: any) => {
            return total + (parseFloat(commission.commissionAmount) || 0);
          }, 0);
          
          setThisMonthEarnings(currentMonthTotal);
          
          // Calculate percentage change (simplified for dashboard) - also only approved commissions
          const previousMonth = new Date();
          previousMonth.setMonth(previousMonth.getMonth() - 1);
          const previousMonthName = previousMonth.toLocaleDateString('en-US', { month: 'short' });
          
          const previousMonthCommissions = commissionHistoryData.filter((commission: any) => {
            if (!commission.createdAt) return false;
            const commissionDate = new Date(commission.createdAt);
            const commissionMonth = commissionDate.toLocaleDateString('en-US', { month: 'short' });
            return commissionMonth === previousMonthName;
          });
          
          const previousMonthEarnings = previousMonthCommissions
            .filter((commission: any) => 
              commission.referrerUserId === user.userId && 
              commission.commissionStatus === 'PAID' // Only approved/paid commissions
            )
            .reduce((total: number, commission: any) => {
              return total + (parseFloat(commission.commissionAmount) || 0);
            }, 0);
          
          const percentageChange = previousMonthEarnings === 0 ? 
            (currentMonthTotal > 0 ? '+100%' : '0%') :
            `${currentMonthTotal >= previousMonthEarnings ? '+' : ''}${Math.round(((currentMonthTotal - previousMonthEarnings) / previousMonthEarnings) * 100)}%`;
          
          setThisMonthPercentage(percentageChange);
          
          console.log('Dashboard - APPROVED this month earnings calculated:', {
            currentMonth,
            currentMonthTotal,
            previousMonthName,
            previousMonthEarnings,
            percentageChange,
            approvedCommissions: approvedCommissions.length,
            totalCommissions: currentMonthCommissions.length
          });
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching approved this month earnings:', error);
    }
  };

  const refreshDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserProgress(),
        fetchRealTimePaymentStatus(),
        fetchThisMonthEarnings(),
        fetchAvailableRewardsCount(),
        fetchLifetimeEarnings(),
        fetchCommissionRate(),
        fetchTierRequirements()
      ]);
    } catch (error) {
      console.error('Dashboard - Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAvailableRewardsCount = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getAvailableRewards(Number(user.userId));
        if (response.success && response.data) {
          const availableRewards = response.data.availableRewards || [];
          setAvailableRewardsCount(availableRewards.length);
          console.log('Dashboard - Available rewards count:', availableRewards.length);
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching available rewards count:', error);
      setAvailableRewardsCount(0);
    }
  };

  const fetchLifetimeEarnings = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getApprovedWalletBalance();
        if (response.success && response.data) {
          setLifetimeEarnings(response.data.totalEarnings || 0);
          setTotalWithdrawals(response.data.totalWithdrawals || 0);
          console.log('✅ Lifetime earnings updated:', response.data.totalEarnings);
          console.log('✅ Total withdrawals updated:', response.data.totalWithdrawals);
        }
      }
    } catch (error) {
      console.error('Error fetching lifetime earnings:', error);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      refreshDashboardData();
    }
  }, [user?.userId]);

  // Listen for refresh parameter from navigation
  useEffect(() => {
    if (route?.params?.refreshData) {
      console.log('Dashboard - Refresh triggered from navigation');
      refreshDashboardData();
      // Clear the refresh parameter to avoid unnecessary re-renders
      navigation.setParams({ refreshData: undefined });
    }
  }, [route?.params?.refreshData]);

  
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
          
          {/* Header */}
          <View style={styles.header}>
          
          <View style={styles.headerMain}>
            <Text style={styles.dashboardTitle}>Dashboard</Text>
            <View style={styles.headerIcons}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={refreshDashboardData}
                disabled={isLoading}
              >
                <AntDesign 
                  name="reload1" 
                  size={20} 
                  color={isLoading ? "#666666" : "#FFD700"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.iconButton}
                onPress={() => navigation.navigate('Profile')}
              >
                <AntDesign name="user" size={30} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
          
          <Text style={styles.welcomeText}>
            Welcome back, {user?.name || user?.fullName || 'Member'}!
          </Text>
        </View>

        {/* Member Status Card */}
        <View style={styles.goldMemberCard}>
          <View style={styles.goldMemberLeft}>
            <AntDesign name="star" size={32} color="#000000" style={styles.crownIcon} />
            <View style={styles.goldMemberInfo}>
              <Text style={styles.goldMemberTitle}>
                {userProgress?.tierName || 'Loading...'} Member
              </Text>
              <Text style={styles.commissionRate}>
                {commissionRate} Commission Rate
              </Text>
            </View>
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>
              Level {userProgress?.levelNumber || '...'}
            </Text>
          </View>
          <View style={styles.progressSection}>
            <Text style={styles.progressLabel}>
              {nextLevelInfo ? 
                `Progress to ${getNextTierName(userProgress?.tierName)}` :
                `Progress to ${userProgress?.tierName === 'BRONZE' ? 'Silver' : 
                            userProgress?.tierName === 'SILVER' ? 'Gold' : 
                            userProgress?.tierName === 'GOLD' ? 'Diamond' : 'Next Tier'}`
              }
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: progressPercentage as any
              }]} />
            </View>
            <Text style={styles.progressText}>
              {progressPercentage}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AntDesign name="linechart" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {lifetimeEarnings > 0 ? '+₹' + lifetimeEarnings.toFixed(0) : '₹0'}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                ₹{lifetimeEarnings.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>Lifetime Earnings</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AntDesign name="team" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {userProgress?.referralCount && userProgress.referralCount > 0 ? '+' + userProgress.referralCount : '0'}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                {userProgress?.referralCount || 0}
              </Text>
              <Text style={styles.statLabel}>Active Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AntDesign name="linechart" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {thisMonthPercentage}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                ₹{thisMonthEarnings.toFixed(0)}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AntDesign name="wallet" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {userProgress?.walletBalance && userProgress.walletBalance > 0 ? '₹' + userProgress.walletBalance.toFixed(0) : '₹0'}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                ₹{userProgress?.walletBalance?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.statLabel}>Available Balance</Text>
            </View>
          </View>
        </View>

                            {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ShareReferral')}
              >
                <AntDesign name="team" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Share Referral</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Withdraw')}
              >
                <AntDesign name="wallet" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Withdraw</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('ReferralRewards')}
              >
                <View style={styles.rewardButtonContainer}>
                  <AntDesign name="gift" size={24} color="#FFD700" style={styles.actionIcon} />
                  {availableRewardsCount > 0 && (
                    <View style={styles.rewardBadge}>
                      <Text style={styles.rewardBadgeText}>{availableRewardsCount}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.actionText}>My Rewards</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Orders')}
              >
                <AntDesign name="shoppingcart" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>My Orders</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Additional Actions */}
          <View style={styles.additionalActionsSection}>
            <Text style={styles.sectionTitle}>More Actions</Text>
            <View style={styles.additionalActionsGrid}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('PaymentHistory')}
              >
                <AntDesign name="creditcard" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Payment History</Text>
              </TouchableOpacity>


              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Support')}
              >
                <AntDesign name="customerservice" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Support</Text>
              </TouchableOpacity>
            </View>
          </View>

        </ScrollView>
    </SafeAreaView>
  );
}
 
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },

  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  dashboardTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 20,
    marginRight: 10,
  },

  welcomeText: {
    color: '#CCCCCC',
    fontSize: 16,
  },
  goldMemberCard: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  goldMemberLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  crownIcon: {
    marginRight: 15,
  },
  goldMemberInfo: {
    flex: 1,
  },
  goldMemberTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  commissionRate: {
    fontSize: 14,
    color: '#333333',
  },
  levelBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 15,
  },
  levelText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  progressSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressLabel: {
    color: '#000000',
    fontSize: 14,
    flex: 1,
  },
  progressBar: {
    flex: 2,
    height: 8,
    backgroundColor: '#999999',
    borderRadius: 4,
    marginHorizontal: 10,
  },
  progressFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#000000',
    borderRadius: 4,
  },
  progressText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  statHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },

  statChange: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  statAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  quickActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  additionalActionsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  additionalActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionIcon: {
    marginBottom: 10,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  rewardButtonContainer: {
    position: 'relative',
  },
  rewardBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  rewardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },

});
