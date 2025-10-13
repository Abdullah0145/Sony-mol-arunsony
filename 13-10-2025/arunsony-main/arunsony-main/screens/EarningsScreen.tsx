import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface EarningsScreenProps {
  navigation: any;
}

interface EarningsData {
  totalCommissions: number;
  pendingCommissions: number;
  totalEarnings: number;
  directReferrals: number;
  indirectReferrals: number;
  directCommissionTotal: number;
  indirectCommissionTotal: number;
}

interface MonthlyEarnings {
  month: string;
  amount: number;
  referrals?: number;
  change?: string;
}

export default function EarningsScreen({ navigation }: EarningsScreenProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsData | null>(null);
  const [monthlyEarnings, setMonthlyEarnings] = useState<MonthlyEarnings[]>([]);
  const [currentMonthTotal, setCurrentMonthTotal] = useState<number>(0);

  useEffect(() => {
    fetchEarningsData();
  }, []);

  const fetchEarningsData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching earnings data for user:', user?.userId);

      if (!user?.userId) {
        console.log('No user ID available');
        return;
      }

      // Fetch commission statistics
      const statsResponse = await apiServiceAxios.getUserCommissionStats(user.userId);
      console.log('Commission stats response:', statsResponse);

      if (statsResponse.success && statsResponse.data) {
        console.log('💰 Real earnings data from backend:', statsResponse.data);
        setEarningsData(statsResponse.data);
      }

      // Fetch commission history first (needed for real referral data)
      const historyResponse = await apiServiceAxios.getUserCommissionHistory(user.userId);
      console.log('Commission history response:', historyResponse);

      let commissionHistoryData: any[] = [];
      if (historyResponse.success && historyResponse.data) {
        commissionHistoryData = historyResponse.data;
        console.log('📋 Commission history data:', commissionHistoryData);
        console.log('📋 Commission statuses:', commissionHistoryData.map(c => ({
          amount: c.commissionAmount,
          status: c.commissionStatus,
          createdAt: c.createdAt
        })));
      }

      // Create REAL monthly earnings data from user's commission history
      if (commissionHistoryData && commissionHistoryData.length > 0) {
        console.log('📊 Creating real monthly earnings from commission history...');
        
        // Group commissions by month
        const commissionsByMonth: { [key: string]: any[] } = {};
        const referralsByMonth: { [key: string]: Set<string> } = {};
        
        commissionHistoryData.forEach((commission: any) => {
          if (commission.createdAt) {
            const date = new Date(commission.createdAt);
            const monthKey = date.toLocaleDateString('en-US', { month: 'short' });
            
            // Group commissions by month
            if (!commissionsByMonth[monthKey]) {
              commissionsByMonth[monthKey] = [];
            }
            commissionsByMonth[monthKey].push(commission);
            
            // Count unique referrals by month
            if (!referralsByMonth[monthKey]) {
              referralsByMonth[monthKey] = new Set();
            }
            referralsByMonth[monthKey].add(commission.referredUserId);
          }
        });

        // Generate last 6 months with real data
        const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
        const formattedMonthly = months.map((month, index) => {
          const monthCommissions = commissionsByMonth[month] || [];
          const monthReferrals = referralsByMonth[month] || new Set();
          
          // Calculate total earnings for this month
          const monthTotal = monthCommissions.reduce((total: number, commission: any) => {
            return total + (parseFloat(commission.commissionAmount) || 0);
          }, 0);
          
          // Calculate percentage change
          const previousMonth = index > 0 ? months[index - 1] : null;
          const previousAmount = previousMonth ? (commissionsByMonth[previousMonth] || []).reduce((total: number, commission: any) => {
            return total + (parseFloat(commission.commissionAmount) || 0);
          }, 0) : 0;
          
          const change = previousAmount === 0 ? (monthTotal > 0 ? '+100%' : '0%') : 
            `${monthTotal >= previousAmount ? '+' : ''}${Math.round(((monthTotal - previousAmount) / previousAmount) * 100)}%`;
          
          console.log(`📊 ${month}: ₹${monthTotal} (${monthCommissions.length} commissions, ${monthReferrals.size} referrals) = ${change}`);
          
          return {
            month: month,
            amount: monthTotal,
            referrals: monthReferrals.size,
            change: change
          };
        });

        // Sort by latest month first (reverse the array)
        formattedMonthly.reverse();
        setMonthlyEarnings(formattedMonthly);
        
        console.log('📅 Real monthly earnings created:', formattedMonthly);
      } else {
        // No commission history - show empty monthly data
        console.log('📊 No commission history found - showing empty monthly data');
        const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
        const emptyMonthly = months.map(month => ({
          month: month,
          amount: 0,
          referrals: 0,
          change: '0%'
        }));
        emptyMonthly.reverse(); // Latest first
        setMonthlyEarnings(emptyMonthly);
      }
        
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
      
      setCurrentMonthTotal(currentMonthTotal);
      
      console.log('📊 Current month name:', currentMonth);
      console.log('📊 Current month commissions (ALL):', currentMonthCommissions.length);
      console.log('📊 Earned commissions (as referrer):', earnedCommissions.length);
      console.log('📊 Current month total (EARNED only):', currentMonthTotal);
      console.log('📊 Commission details:', earnedCommissions.map(c => ({
        amount: c.commissionAmount,
        referrer: c.referrerUserId,
        referred: c.referredUserId,
        level: c.referralLevel,
        status: c.commissionStatus
      })));

    } catch (error) {
      console.error('Error fetching earnings data:', error);
      Alert.alert('Error', 'Failed to load earnings data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading earnings data...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Earnings</Text>
            <TouchableOpacity style={styles.downloadButton}>
              <AntDesign name="download" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Earnings Overview Cards */}
          <View style={styles.earningsCards}>
            <View style={styles.cardRow}>
              <View style={styles.earningsCard}>
                <AntDesign name="wallet" size={20} color="#4CAF50" />
                <Text style={styles.cardAmount}>
                  {isLoading ? '...' : `₹${earningsData?.totalEarnings || 0}`}
                </Text>
                <Text style={styles.cardLabel}>Pending + Confirmed</Text>
              </View>
              
              <View style={styles.earningsCard}>
                <AntDesign name="linechart" size={20} color="#2196F3" />
                <Text style={styles.cardAmount}>
                  {isLoading ? '...' : `₹${currentMonthTotal || 0}`}
                </Text>
                <Text style={styles.cardLabel}>This Month (Pending + Confirmed)</Text>
              </View>
            </View>
            
            <View style={styles.cardRow}>
              <View style={styles.earningsCard}>
                <AntDesign name="clockcircle" size={20} color="#FFC107" />
                <Text style={styles.cardAmount}>
                  {isLoading ? '...' : `₹${earningsData?.pendingCommissions || 0}`}
                </Text>
                <Text style={styles.cardLabel}>Pending</Text>
              </View>
              
              <View style={styles.earningsCard}>
                <AntDesign name="arrowdown" size={20} color="#9C27B0" />
                <Text style={styles.cardAmount}>
                  {isLoading ? '...' : `₹${earningsData?.totalCommissions || 0}`}
                </Text>
                <Text style={styles.cardLabel}>Confirmed</Text>
              </View>
            </View>
          </View>


          {/* Monthly Earnings Section */}
          <View style={styles.monthlySection}>
            <Text style={styles.sectionTitle}>Monthly Earnings</Text>
            
            {monthlyEarnings.length > 0 ? (
              monthlyEarnings.map((item, index) => (
                <View key={index} style={styles.monthlyItem}>
                  <View style={styles.monthlyLeft}>
                    <AntDesign name="calendar" size={20} color="#FFC107" style={styles.monthlyIcon} />
                    <View style={styles.monthlyInfo}>
                      <Text style={styles.monthText}>{item.month}</Text>
                      <Text style={styles.referralText}>{item.referrals || 0} new referrals</Text>
                    </View>
                  </View>
                  
                  <View style={styles.monthlyRight}>
                    <Text style={styles.monthlyAmount}>₹{item.amount || 0}</Text>
                    <Text style={styles.monthlyChange}>↑{item.change || '0%'}</Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <AntDesign name="inbox" size={48} color="#666666" />
                <Text style={styles.emptyText}>No earnings data available</Text>
                <Text style={styles.emptySubtext}>Start referring users to earn commissions</Text>
              </View>
            )}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  downloadButton: {
    padding: 8,
  },
  earningsCards: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  cardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  earningsCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cardAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  monthlySection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  monthlyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  monthlyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  monthlyIcon: {
    marginRight: 12,
  },
  monthlyInfo: {
    flex: 1,
  },
  monthText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  referralText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  monthlyRight: {
    alignItems: 'flex-end',
  },
  monthlyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 4,
  },
  monthlyChange: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  emptySubtext: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
});
