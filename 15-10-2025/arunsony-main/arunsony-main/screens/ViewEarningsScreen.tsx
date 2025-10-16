import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface ViewEarningsScreenProps {
  navigation: any;
}

export default function ViewEarningsScreen({ navigation }: ViewEarningsScreenProps) {
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const periods = ['This Week', 'This Month', 'Last Month', 'This Year'];
  
  const earningsData = {
    totalEarned: 12450,
    thisMonth: 2850,
    pending: 500,
    withdrawn: 9100,
    monthlyBreakdown: [
      { month: 'Jan 2024', amount: 1200, referrals: 3, growth: '+12%' },
      { month: 'Feb 2024', amount: 1800, referrals: 5, growth: '+12%' },
      { month: 'Mar 2024', amount: 2400, referrals: 7, growth: '+12%' },
      { month: 'Apr 2024', amount: 1950, referrals: 4, growth: '+12%' },
      { month: 'May 2024', amount: 2850, referrals: 8, growth: '+12%' },
      { month: 'Jun 2024', amount: 2250, referrals: 6, growth: '+12%' },
    ],
    levelBreakdown: [
      { level: 'Level 1', referrals: 8, amount: 2000, commission: '₹250 each' },
      { level: 'Level 2', referrals: 12, amount: 600, commission: '₹50 each' },
      { level: 'Level 3', referrals: 4, amount: 200, commission: '₹50 each' },
      { level: 'Level 4', referrals: 0, amount: 0, commission: '₹50 each' },
    ]
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
            <Text style={styles.headerTitle}>Earnings Analysis</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Period Selector */}
          <View style={styles.periodSection}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[
                    styles.periodButton,
                    selectedPeriod === period && styles.selectedPeriodButton
                  ]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[
                    styles.periodText,
                    selectedPeriod === period && styles.selectedPeriodText
                  ]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryGrid}>
              <View style={styles.summaryCard}>
                <AntDesign name="wallet" size={24} color="#4CAF50" />
                <Text style={styles.summaryAmount}>₹{earningsData.totalEarned.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Total Earned</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <AntDesign name="linechart" size={24} color="#2196F3" />
                <Text style={styles.summaryAmount}>₹{earningsData.thisMonth.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>This Month</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <AntDesign name="clockcircle" size={24} color="#FFC107" />
                <Text style={styles.summaryAmount}>₹{earningsData.pending.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Pending</Text>
              </View>
              
              <View style={styles.summaryCard}>
                <AntDesign name="arrowdown" size={24} color="#9C27B0" />
                <Text style={styles.summaryAmount}>₹{earningsData.withdrawn.toLocaleString()}</Text>
                <Text style={styles.summaryLabel}>Withdrawn</Text>
              </View>
            </View>
          </View>

          {/* Level Breakdown */}
          <View style={styles.breakdownSection}>
            <Text style={styles.sectionTitle}>Level Breakdown</Text>
            
            {earningsData.levelBreakdown.map((level, index) => (
              <View key={index} style={styles.levelItem}>
                <View style={styles.levelHeader}>
                  <View style={styles.levelCircle}>
                    <Text style={styles.levelNumber}>{index + 1}</Text>
                  </View>
                  <View style={styles.levelInfo}>
                    <Text style={styles.levelName}>{level.level}</Text>
                    <Text style={styles.levelReferrals}>{level.referrals} referrals</Text>
                  </View>
                  <View style={styles.levelAmount}>
                    <Text style={styles.amountText}>₹{level.amount.toLocaleString()}</Text>
                    <Text style={styles.commissionText}>{level.commission}</Text>
                  </View>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${(level.amount / earningsData.totalEarned) * 100}%` }
                    ]} 
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Monthly Trend */}
          <View style={styles.trendSection}>
            <Text style={styles.sectionTitle}>Monthly Trend</Text>
            
            {earningsData.monthlyBreakdown.map((month, index) => (
              <View key={index} style={styles.monthItem}>
                <View style={styles.monthInfo}>
                  <Text style={styles.monthName}>{month.month}</Text>
                  <Text style={styles.monthReferrals}>{month.referrals} referrals</Text>
                </View>
                
                <View style={styles.monthStats}>
                  <Text style={styles.monthAmount}>₹{month.amount.toLocaleString()}</Text>
                  <Text style={styles.monthGrowth}>{month.growth}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Performance Insights */}
          <View style={styles.insightsSection}>
            <Text style={styles.sectionTitle}>Performance Insights</Text>
            
            <View style={styles.insightCard}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Best Performing Month</Text>
                <Text style={styles.insightText}>May 2024 with ₹2,850 earnings</Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Most Active Level</Text>
                <Text style={styles.insightText}>Level 2 with 12 referrals</Text>
              </View>
            </View>
            
            <View style={styles.insightCard}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <View style={styles.insightContent}>
                <Text style={styles.insightTitle}>Growth Rate</Text>
                <Text style={styles.insightText}>Consistent 12% monthly growth</Text>
              </View>
            </View>
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
  periodSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  periodButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  selectedPeriodButton: {
    backgroundColor: '#FFD700',
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  selectedPeriodText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  summarySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  summaryCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  summaryAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 8,
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  breakdownSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  levelItem: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
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
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  levelReferrals: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  levelAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  commissionText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  progressBar: {
    height: 4,
    backgroundColor: '#333333',
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 2,
  },
  trendSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  monthItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  monthInfo: {
    flex: 1,
  },
  monthName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  monthReferrals: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  monthStats: {
    alignItems: 'flex-end',
  },
  monthAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 5,
  },
  monthGrowth: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: 'bold',
  },
  insightsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  insightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  insightContent: {
    flex: 1,
    marginLeft: 15,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  insightText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});

