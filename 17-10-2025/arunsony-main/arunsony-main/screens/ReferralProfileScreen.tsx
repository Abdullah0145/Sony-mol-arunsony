import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface ReferralProfileScreenProps {
  navigation: any;
  route?: {
    params?: {
      userReferrals?: any[];
      userProgress?: any;
    };
  };
}

export default function ReferralProfileScreen({ navigation, route }: ReferralProfileScreenProps) {
  const { user } = useAuth();
  const [userReferrals, setUserReferrals] = useState<any[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use passed data or fetch fresh data
    if (route?.params?.userReferrals) {
      setUserReferrals(route.params.userReferrals);
      setUserProgress(route.params.userProgress);
      setIsLoading(false);
    } else {
      fetchReferralData();
    }
  }, [route?.params]);

  const fetchReferralData = async () => {
    try {
      if (user?.userId) {
        const [progressResponse, referralsResponse] = await Promise.all([
          apiServiceAxios.getUserProgress(user.userId),
          apiServiceAxios.getUserReferrals(user.userId)
        ]);

        if (progressResponse.success && progressResponse.data) {
          setUserProgress(progressResponse.data);
        }
        if (referralsResponse.success && referralsResponse.data) {
          setUserReferrals(referralsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching referral data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return `${Math.floor(diffInSeconds / 2592000)} months ago`;
  };
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Referral Profile</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading referral details...</Text>
              </View>
            ) : (
              <>
                {/* Summary Stats */}
                {userProgress && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Referral Summary</Text>
                    <View style={styles.summaryStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{userProgress.referralCount || 0}</Text>
                        <Text style={styles.statLabel}>Total Referrals</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹{userProgress.walletBalance?.toFixed(0) || '0'}</Text>
                        <Text style={styles.statLabel}>Total Earnings</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* All Referrals List */}
                <View style={styles.referralsSection}>
                  <Text style={styles.sectionTitle}>All Referrals ({userReferrals.length})</Text>
                  
                  {userReferrals.length > 0 ? (
                    userReferrals
                      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
                              <Text style={styles.referralPhone}>{referral.phoneNumber || 'N/A'}</Text>
                            </View>
                            <View style={styles.referralDetails}>
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
                    <View style={styles.emptyContainer}>
                      <AntDesign name="team" size={48} color="#666666" />
                      <Text style={styles.emptyTitle}>No Referrals Yet</Text>
                      <Text style={styles.emptySubtitle}>Start sharing your referral code to get referrals!</Text>
                    </View>
                  )}
                </View>
              </>
            )}
          </View>

        </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#CCCCCC',
    marginTop: 10,
    fontSize: 16,
  },
  summaryCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  summaryStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  referralsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  personIcon: {
    fontSize: 24,
    marginRight: 15,
  },
  referralContent: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  referralTime: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 2,
  },
  referralPhone: {
    fontSize: 12,
    color: '#999999',
  },
  referralDetails: {
    alignItems: 'flex-end',
  },
  statusContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  pendingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

