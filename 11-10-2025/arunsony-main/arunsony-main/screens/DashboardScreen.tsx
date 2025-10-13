import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios, UserProgress } from '../services/api-axios';

interface DashboardScreenProps {
  navigation: any;
}

export default function DashboardScreen({ navigation }: DashboardScreenProps) {
  const { user, hasPaid, updatePaymentStatus } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [realTimePaymentStatus, setRealTimePaymentStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [thisMonthEarnings, setThisMonthEarnings] = useState<number>(0);
  const [thisMonthPercentage, setThisMonthPercentage] = useState<string>('0%');

  const fetchUserProgress = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserProgress(user.userId);
        if (response.success && response.data) {
          setUserProgress(response.data);
          console.log('Dashboard - User progress fetched:', response.data);
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching user progress:', error);
    }
  };

  const fetchRealTimePaymentStatus = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserPaymentStatus(user.userId);
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
        console.log('Dashboard - Fetching this month earnings for user:', user.userId);
        
        // Fetch commission history to calculate this month's earnings
        const historyResponse = await apiServiceAxios.getUserCommissionHistory(user.userId);
        console.log('Dashboard - Commission history response:', historyResponse);

        if (historyResponse.success && historyResponse.data) {
          const commissionHistoryData = historyResponse.data;
          console.log('Dashboard - Commission history data:', commissionHistoryData);

          // Calculate "This Month" - ONLY show commissions where user is the REFERRER (earned commissions)
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
          const currentMonthCommissions = commissionHistoryData.filter((commission: any) => {
            if (!commission.createdAt) return false;
            const commissionDate = new Date(commission.createdAt);
            const commissionMonth = commissionDate.toLocaleDateString('en-US', { month: 'short' });
            return commissionMonth === currentMonth;
          });
          
          // Only count commissions where this user is the referrer (earned money)
          const earnedCommissions = currentMonthCommissions.filter((commission: any) => {
            return commission.referrerUserId === user.userId;
          });
          
          const currentMonthTotal = earnedCommissions.reduce((total: number, commission: any) => {
            return total + (parseFloat(commission.commissionAmount) || 0);
          }, 0);
          
          setThisMonthEarnings(currentMonthTotal);
          
          // Calculate percentage change (simplified for dashboard)
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
            .filter((commission: any) => commission.referrerUserId === user.userId)
            .reduce((total: number, commission: any) => {
              return total + (parseFloat(commission.commissionAmount) || 0);
            }, 0);
          
          const percentageChange = previousMonthEarnings === 0 ? 
            (currentMonthTotal > 0 ? '+100%' : '0%') :
            `${currentMonthTotal >= previousMonthEarnings ? '+' : ''}${Math.round(((currentMonthTotal - previousMonthEarnings) / previousMonthEarnings) * 100)}%`;
          
          setThisMonthPercentage(percentageChange);
          
          console.log('Dashboard - This month earnings calculated:', {
            currentMonth,
            currentMonthTotal,
            previousMonthName,
            previousMonthEarnings,
            percentageChange,
            earnedCommissions: earnedCommissions.length
          });
        }
      }
    } catch (error) {
      console.error('Dashboard - Error fetching this month earnings:', error);
    }
  };

  const refreshDashboardData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserProgress(),
        fetchRealTimePaymentStatus(),
        fetchThisMonthEarnings()
      ]);
    } catch (error) {
      console.error('Dashboard - Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.userId) {
      refreshDashboardData();
    }
  }, [user?.userId]);

  const handleTestLimitedAccess = () => {
    Alert.alert(
      'Test Limited Access',
      'This will simulate limited access (no payment made) for testing purposes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set Limited Access',
          onPress: () => {
            updatePaymentStatus(false);
            Alert.alert(
              'Limited Access Set!',
              'You now have limited access for testing.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };
  
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
                style={styles.testButton}
                onPress={handleTestLimitedAccess}
              >
                <AntDesign name="lock" size={20} color="#FF9800" />
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
                {userProgress?.tierName === 'BRONZE' ? '10%' : 
                 userProgress?.tierName === 'SILVER' ? '20%' : 
                 userProgress?.tierName === 'GOLD' ? '30%' : 
                 userProgress?.tierName === 'DIAMOND' ? '40%' : '10%'} Commission Rate
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
              Progress to {userProgress?.tierName === 'BRONZE' ? 'Silver' : 
                          userProgress?.tierName === 'SILVER' ? 'Gold' : 
                          userProgress?.tierName === 'GOLD' ? 'Diamond' : 'Next Level'}
            </Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { 
                width: userProgress?.referralCount ? `${Math.min((userProgress.referralCount / 5) * 100, 100)}%` : '0%' 
              }]} />
            </View>
            <Text style={styles.progressText}>
              {userProgress?.referralCount ? `${Math.min((userProgress.referralCount / 5) * 100, 100)}%` : '0%'}
            </Text>
          </View>
        </View>

        {/* Statistics Section */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statHeader}>
                <AntDesign name="wallet" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {userProgress?.walletBalance && userProgress.walletBalance > 0 ? '+₹' + userProgress.walletBalance.toFixed(0) : '₹0'}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                ₹{userProgress?.walletBalance?.toFixed(2) || '0.00'}
              </Text>
              <Text style={styles.statLabel}>Total Earnings</Text>
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
                <AntDesign name="star" size={20} color="#FFD700" />
                <Text style={styles.statChange}>
                  {userProgress?.referralCount ? `${Math.min((userProgress.referralCount / 5) * 100, 100)}%` : '0%'}
                </Text>
              </View>
              <Text style={styles.statAmount}>
                {userProgress?.tierName || 'Loading...'}
              </Text>
              <Text style={styles.statLabel}>Current Tier</Text>
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
                onPress={() => navigation.navigate('Earnings')}
              >
                <AntDesign name="linechart" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>View Earnings</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Products')}
              >
                <AntDesign name="gift" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Order Products</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => navigation.navigate('Withdraw')}
              >
                <AntDesign name="wallet" size={24} color="#FFD700" style={styles.actionIcon} />
                <Text style={styles.actionText}>Withdraw</Text>
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

        {/* Recent Activity */}
        <View style={styles.recentActivitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityItem}>
            <AntDesign name="team" size={20} color="#FFD700" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New referral: John Doe joined</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <AntDesign name="wallet" size={20} color="#FFD700" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Earned ₹250 from Level 1</Text>
              <Text style={styles.activityTime}>4 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <AntDesign name="star" size={20} color="#FFD700" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Congratulations! Reached Gold level</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
          </View>

          <View style={styles.activityItem}>
            <AntDesign name="linechart" size={20} color="#FFD700" style={styles.activityIcon} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Withdrawal of ₹1,000 processed</Text>
              <Text style={styles.activityTime}>2 days ago</Text>
            </View>
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
  testButton: {
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
  recentActivitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  activityIcon: {
    marginRight: 15,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 5,
  },
  activityTime: {
    color: '#CCCCCC',
    fontSize: 12,
  },

});
