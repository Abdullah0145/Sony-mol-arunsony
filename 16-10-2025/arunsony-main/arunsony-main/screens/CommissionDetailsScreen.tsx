import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface CommissionDetailsScreenProps {
  navigation: any;
  route?: {
    params?: {
      commissionHistory?: any[];
      commissionStats?: any;
    };
  };
}

export default function CommissionDetailsScreen({ navigation, route }: CommissionDetailsScreenProps) {
  const { user } = useAuth();
  const [commissionHistory, setCommissionHistory] = useState<any[]>([]);
  const [commissionStats, setCommissionStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Use passed data or fetch fresh data
    if (route?.params?.commissionHistory) {
      setCommissionHistory(route.params.commissionHistory);
      setCommissionStats(route.params.commissionStats);
      setIsLoading(false);
    } else {
      fetchCommissionData();
    }
  }, [route?.params]);

  const fetchCommissionData = async () => {
    try {
      if (user?.userId) {
        const [historyResponse, statsResponse] = await Promise.all([
          apiServiceAxios.getUserCommissionHistory(user.userId),
          apiServiceAxios.getUserCommissionStats(user.userId)
        ]);

        if (historyResponse.success && historyResponse.data) {
          setCommissionHistory(historyResponse.data);
        }
        if (statsResponse.success && statsResponse.data) {
          setCommissionStats(statsResponse.data);
        }
      }
    } catch (error) {
      console.error('Error fetching commission data:', error);
    } finally {
      setIsLoading(false);
    }
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
            <Text style={styles.headerTitle}>Commission Details</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Content */}
          <View style={styles.content}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading commission details...</Text>
              </View>
            ) : commissionHistory.length > 0 ? (
              <>
                {/* Summary Stats */}
                {commissionStats && (
                  <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Commission Summary</Text>
                    <View style={styles.summaryStats}>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>₹{commissionStats.totalEarnings?.toFixed(0) || '0'}</Text>
                        <Text style={styles.statLabel}>Total Earnings</Text>
                      </View>
                      <View style={styles.statItem}>
                        <Text style={styles.statValue}>{commissionStats.totalCommissions || '0'}</Text>
                        <Text style={styles.statLabel}>Total Commissions</Text>
                      </View>
                    </View>
                  </View>
                )}

                {/* Commission Breakdown by Level */}
                <View style={styles.breakdownSection}>
                  <Text style={styles.sectionTitle}>Commission Breakdown by Level</Text>
                  
                  {(() => {
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
                  })()}
                </View>

                {/* Detailed Commission History */}
                <View style={styles.historySection}>
                  <Text style={styles.sectionTitle}>Detailed Commission History</Text>
                  
                  {commissionHistory
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((commission, index) => (
                      <View key={index} style={styles.historyItem}>
                        <View style={styles.historyInfo}>
                          <Text style={styles.historyTitle}>
                            Level {commission.referralLevel || 1} Commission
                          </Text>
                          <Text style={styles.historyDate}>
                            {new Date(commission.createdAt).toLocaleDateString()}
                          </Text>
                        </View>
                        <View style={styles.historyAmount}>
                          <Text style={styles.historyAmountText}>
                            ₹{parseFloat(commission.commissionAmount || 0).toFixed(0)}
                          </Text>
                          <Text style={styles.historyStatus}>
                            {commission.commissionStatus}
                          </Text>
                        </View>
                      </View>
                    ))}
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <AntDesign name="inbox" size={48} color="#666666" />
                <Text style={styles.emptyTitle}>No Commission Data</Text>
                <Text style={styles.emptySubtitle}>You haven't earned any commissions yet</Text>
              </View>
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
  breakdownSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  levelCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  levelNumber: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  commissionInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  referralCount: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  commissionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  perReferral: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  historySection: {
    marginBottom: 20,
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  historyAmount: {
    alignItems: 'flex-end',
  },
  historyAmountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  historyStatus: {
    fontSize: 12,
    color: '#CCCCCC',
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

