import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Clipboard, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import BottomNavigation from '../components/BottomNavigation';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios, UserProgress } from '../services/api-axios';

interface ReferralsScreenProps {
  navigation: any;
}


export default function ReferralsScreen({ navigation }: ReferralsScreenProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [realTimePaymentStatus, setRealTimePaymentStatus] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commissionStats, setCommissionStats] = useState<any>(null);
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);
  const [thisMonthReferrals, setThisMonthReferrals] = useState<number>(0);
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [referralStats, setReferralStats] = useState<any>(null);
  
  // Get actual referral code from user data
  const referralCode = user?.referralCode || user?.refer || `CQ${user?.userId || '12345'}`;
  const referralUrl = `https://expo.dev/accounts/arun-j/projects/MLMApp/builds/c55b55cb-c3d4-4b60-bcc4-2c79e6433976?ref=${referralCode}`;

  // Helper function to calculate time ago
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };

  const fetchUserProgress = async () => {
    try {
      if (user?.userId) {
        console.log('ReferralsScreen - Fetching user progress for userId:', user.userId);
        const response = await apiServiceAxios.getUserProgress(Number(user.userId));
        console.log('ReferralsScreen - API response:', response);
        if (response.success && response.data) {
          setUserProgress(response.data);
          console.log('ReferralsScreen - User progress fetched and set:', response.data);
        } else {
          console.log('ReferralsScreen - API response not successful or no data:', response);
        }
      } else {
        console.log('ReferralsScreen - No user or userId available');
      }
    } catch (error) {
      console.error('ReferralsScreen - Error fetching user progress:', error);
    }
  };

  const fetchRealTimePaymentStatus = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserPaymentStatus(Number(user.userId));
        if (response.success && response.data) {
          setRealTimePaymentStatus(response.data.hasPaidActivation);
          console.log('ReferralsScreen - Real-time payment status fetched:', response.data.hasPaidActivation);
        }
      }
    } catch (error) {
      console.error('ReferralsScreen - Error fetching real-time payment status:', error);
    }
  };

  const fetchCommissionData = async () => {
    try {
      if (user?.userId) {
        console.log('ReferralsScreen - Fetching commission data for user:', user.userId);
        
        // Fetch commission statistics
        const statsResponse = await apiServiceAxios.getUserCommissionStats(Number(user.userId));
        console.log('ReferralsScreen - Commission stats response:', statsResponse);
        
        if (statsResponse.success && statsResponse.data) {
          setCommissionStats(statsResponse.data);
          console.log('ReferralsScreen - Commission stats set:', statsResponse.data);
        }

        // Fetch commission history for recent referrals
        const historyResponse = await apiServiceAxios.getUserCommissionHistory(Number(user.userId));
        console.log('ReferralsScreen - Commission history response:', historyResponse);
        
        if (historyResponse.success && historyResponse.data) {
          setCommissionHistory(historyResponse.data);
          console.log('ReferralsScreen - Commission history set:', historyResponse.data.length, 'records');
          
          // Calculate this month referrals
          const currentMonth = new Date().toLocaleDateString('en-US', { month: 'short' });
          const thisMonthCommissions = historyResponse.data.filter((commission: any) => {
            if (!commission.createdAt) return false;
            const commissionDate = new Date(commission.createdAt);
            const commissionMonth = commissionDate.toLocaleDateString('en-US', { month: 'short' });
            return commissionMonth === currentMonth;
          });
          
          // Count unique referrals this month
          const uniqueReferrals = new Set();
          thisMonthCommissions.forEach((commission: any) => {
            if (commission.referredUserId) {
              uniqueReferrals.add(commission.referredUserId);
            }
          });
          
          setThisMonthReferrals(uniqueReferrals.size);
          console.log('ReferralsScreen - This month referrals:', uniqueReferrals.size);
        }
      }
    } catch (error) {
      console.error('ReferralsScreen - Error fetching commission data:', error);
    }
  };

  const fetchUserReferralsData = async () => {
    try {
      if (user?.userId) {
        console.log('ReferralsScreen - Fetching user referrals for user:', user.userId);
        
        // Fetch user referrals
        const referralsResponse = await apiServiceAxios.getUserReferrals(Number(user.userId));
        console.log('ReferralsScreen - User referrals response:', referralsResponse);
        
        if (referralsResponse.success && referralsResponse.data) {
          const referralsData = referralsResponse.data;
          setUserReferrals(referralsData.referrals || []);
          
          // Calculate additional stats from referrals data
          const referrals = referralsData.referrals || [];
          const paidReferrals = referrals.filter((ref: any) => ref.hasPaidActivation === true).length;
          const unpaidReferrals = referrals.filter((ref: any) => ref.hasPaidActivation === false).length;
          
          // Use backend's referralCount which only counts PAID referrals
          const stats = {
            totalReferrals: referralsData.referralCount || 0, // Backend only counts paid referrals
            activeReferrals: paidReferrals, // Active = paid
            paidReferrals: paidReferrals,
            pendingReferrals: unpaidReferrals, // Pending = unpaid
            conversionRate: referrals.length > 0 ? (paidReferrals / referrals.length * 100).toFixed(1) : 0
          };
          
          setReferralStats(stats);
          console.log('ReferralsScreen - Referral stats calculated:', stats);
        }
      }
    } catch (error) {
      console.error('ReferralsScreen - Error fetching user referrals:', error);
    }
  };

  const refreshReferralsData = async () => {
    console.log('ReferralsScreen - Starting refresh data...');
    setIsLoading(true);
    try {
      await Promise.all([
        fetchUserProgress(),
        fetchRealTimePaymentStatus(),
        fetchCommissionData(),
        fetchUserReferralsData()
      ]);
      console.log('ReferralsScreen - Refresh data completed');
    } catch (error) {
      console.error('ReferralsScreen - Error refreshing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('ReferralsScreen - useEffect triggered, user:', user);
    if (user?.userId) {
      console.log('ReferralsScreen - User has userId, calling refreshReferralsData');
      refreshReferralsData();
    } else {
      console.log('ReferralsScreen - No user or userId, skipping refresh');
    }
  }, [user?.userId]);

  const copyToClipboard = () => {
    try {
      Clipboard.setString(referralCode);
      setCopied(true);
      Alert.alert('Copied!', `Referral code "${referralCode}" copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const shareReferral = async () => {
    try {
      const shareMessage = `Join CQ Wealth and start earning! Use my referral code: ${referralCode}\n\nDownload APK: ${referralUrl}\n\nAfter installing, use referral code: ${referralCode}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: referralUrl,
        title: 'Join CQ Wealth',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerMain}>
            <Text style={styles.referralsTitle}>Referrals</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={refreshReferralsData}
              disabled={isLoading}
            >
              <AntDesign 
                name="reload1" 
                size={20} 
                color={isLoading ? "#666666" : "#FFD700"} 
              />
            </TouchableOpacity>
          </View>
        </View>


        {/* Your Referral Code Section */}
        <View style={styles.referralCodeCard}>
          <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
          <Text style={styles.referralCode}>{referralCode}</Text>
          <Text style={styles.referralUrl}>{referralUrl}</Text>
          <View style={styles.referralButtons}>
            <TouchableOpacity 
              style={[styles.copyButton, copied && styles.copiedButton]}
              onPress={copyToClipboard}
            >
              <Text style={styles.copyIcon}>📋</Text>
              <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareReferral}
            >
              <Text style={styles.shareIcon}>📤</Text>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Overview */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Referral Stats</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>
                {referralStats?.totalReferrals !== undefined ? referralStats.totalReferrals : (userProgress?.referralCount !== undefined ? userProgress.referralCount : '...')}
              </Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>✅</Text>
              <Text style={styles.statNumber}>
                {referralStats?.activeReferrals !== undefined ? referralStats.activeReferrals : '...'}
              </Text>
              <Text style={styles.statLabel}>Active Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💳</Text>
              <Text style={styles.statNumber}>
                {referralStats?.paidReferrals !== undefined ? referralStats.paidReferrals : '...'}
              </Text>
              <Text style={styles.statLabel}>Paid Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📊</Text>
              <Text style={styles.statNumber}>
                {referralStats?.conversionRate !== undefined ? `${referralStats.conversionRate}%` : '...'}
              </Text>
              <Text style={styles.statLabel}>Conversion Rate</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>
                {thisMonthReferrals}
              </Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNumber}>
                ₹{userProgress?.walletBalance !== undefined ? userProgress.walletBalance.toFixed(0) : '...'}
              </Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>
        </View>

        {/* Commission Breakdown Section */}
        <View style={styles.commissionSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Commission Breakdown</Text>
            {commissionHistory && commissionHistory.length >= 3 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('CommissionDetails', { 
                  commissionHistory: commissionHistory,
                  commissionStats: commissionStats 
                })}
              >
                <Text style={styles.viewMoreText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {commissionHistory && commissionHistory.length > 0 ? (
            // Group commissions by level
            (() => {
              const commissionsByLevel: { [key: number]: any[] } = {};
              commissionHistory.forEach((commission: any) => {
                const level = commission.referralLevel || 1;
                if (!commissionsByLevel[level]) {
                  commissionsByLevel[level] = [];
                }
                commissionsByLevel[level].push(commission);
              });

              return Object.keys(commissionsByLevel)
                .map(level => parseInt(level))
                .sort((a, b) => a - b)
                .map(level => {
                  const levelCommissions = commissionsByLevel[level];
                  const totalAmount = levelCommissions.reduce((sum, commission) => 
                    sum + (parseFloat(commission.commissionAmount) || 0), 0);
                  const uniqueReferrals = new Set(levelCommissions.map(c => c.referredUserId)).size;
                  const avgAmount = uniqueReferrals > 0 ? totalAmount / uniqueReferrals : 0;

                  return (
                    <View key={level} style={styles.commissionItem}>
                      <View style={styles.levelCircle}>
                        <Text style={styles.levelNumber}>{level}</Text>
                      </View>
                      <View style={styles.commissionInfo}>
                        <Text style={styles.levelTitle}>Level {level}</Text>
                        <Text style={styles.referralCount}>{uniqueReferrals} referrals</Text>
                      </View>
                      <View style={styles.commissionAmount}>
                        <Text style={styles.amount}>₹{totalAmount.toFixed(0)}</Text>
                        <Text style={styles.perReferral}>₹{avgAmount.toFixed(0)} each</Text>
                      </View>
                    </View>
                  );
                });
            })()
          ) : (
            <View style={styles.commissionItem}>
              <View style={styles.levelCircle}>
                <Text style={styles.levelNumber}>1</Text>
              </View>
              <View style={styles.commissionInfo}>
                <Text style={styles.levelTitle}>Level 1</Text>
                <Text style={styles.referralCount}>0 referrals</Text>
              </View>
              <View style={styles.commissionAmount}>
                <Text style={styles.amount}>₹0</Text>
                <Text style={styles.perReferral}>₹0 each</Text>
              </View>
            </View>
          )}
        </View>

        {/* Recent Referrals Section */}
        <View style={styles.recentReferralsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Referrals</Text>
            {userReferrals && userReferrals.length >= 3 && (
              <TouchableOpacity 
                style={styles.viewMoreButton}
                onPress={() => navigation.navigate('ReferralProfile', { 
                  userReferrals: userReferrals,
                  userProgress: userProgress 
                })}
              >
                <Text style={styles.viewMoreText}>View All</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {userReferrals && userReferrals.length > 0 ? (
            // Show recent user referrals (last 4)
            userReferrals
              .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 4)
              .map((referral: any, index: number) => {
                const createdAt = new Date(referral.createdAt);
                const timeAgo = getTimeAgo(createdAt);
                const status = referral.status === 'ACTIVE' ? 'Active' : 'Pending';
                const statusStyle = referral.status === 'ACTIVE' ? styles.activeBadge : styles.pendingBadge;
                const statusTextStyle = referral.status === 'ACTIVE' ? styles.activeBadgeText : styles.pendingBadgeText;
                const paymentStatus = referral.hasPaidActivation ? 'Paid' : 'Unpaid';
                const paymentStyle = referral.hasPaidActivation ? styles.activeBadge : styles.pendingBadge;

                return (
                  <View key={referral.userId || index} style={styles.referralItem}>
                    <Text style={styles.personIcon}>👤</Text>
                    <View style={styles.referralContent}>
                      <Text style={styles.referralName}>{referral.name || referral.email}</Text>
                      <Text style={styles.referralTime}>{timeAgo}</Text>
                    </View>
                    <View style={styles.referralDetails}>
                      <Text style={styles.earnedAmount}>{referral.phoneNumber || 'N/A'}</Text>
                      <View style={styles.statusContainer}>
                        <View style={paymentStyle}>
                          <Text style={statusTextStyle}>{paymentStatus === 'Paid' ? '✓' : '⏱'}</Text>
                          <Text style={statusTextStyle}>{paymentStatus}</Text>
                        </View>
                        <View style={statusStyle}>
                          <Text style={statusTextStyle}>{status === 'Active' ? '✓' : '⏱'}</Text>
                          <Text style={statusTextStyle}>{status}</Text>
                        </View>
                      </View>
                    </View>
                  </View>
                );
              })
          ) : (
            <View style={styles.referralItem}>
              <Text style={styles.personIcon}>👤</Text>
              <View style={styles.referralContent}>
                <Text style={styles.referralName}>No referrals yet</Text>
                <Text style={styles.referralTime}>Start sharing your referral code!</Text>
              </View>
              <View style={styles.referralDetails}>
                <Text style={styles.earnedAmount}>₹0</Text>
                <View style={styles.statusContainer}>
                  <View style={styles.pendingBadge}>
                    <Text style={styles.pendingBadgeText}>⏱</Text>
                    <Text style={styles.pendingBadgeText}>None</Text>
                  </View>
                </View>
              </View>
            </View>
          )}
        </View>


        </ScrollView>

        {/* Fixed Bottom Navigation */}
        <BottomNavigation navigation={navigation} currentScreen="Referrals" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  mainContainer: {
    flex: 1,
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  refreshButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    borderRadius: 15,
    marginRight: 10,
  },
  headerMain: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  referralsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'left',
  },
  referralCodeCard: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  referralCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  referralUrl: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 20,
  },
  referralButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  copyIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  copyText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  shareText: {
    color: '#FFD700',
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
    width: '31%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 10,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  commissionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  viewMoreButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  viewMoreText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  levelCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  levelNumber: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commissionInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  referralCount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  commissionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  perReferral: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  recentReferralsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  personIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  referralContent: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  referralTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  referralDetails: {
    alignItems: 'flex-end',
  },
  earnedAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  levelBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  levelBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#666666',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
    alignSelf: 'flex-start',
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

});
