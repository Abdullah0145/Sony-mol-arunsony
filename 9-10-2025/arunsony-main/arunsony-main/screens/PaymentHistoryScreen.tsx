import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * PaymentHistoryScreen - Displays user's payment history from backend
 * 
 * Features:
 * - Fetches real payment data from backend API
 * - Shows transaction types: Payments, Earnings, Withdrawals
 * - Displays formatted amounts and dates
 * - Pull-to-refresh functionality
 * - Fallback data when no transactions available
 * - Error handling with graceful degradation
 */

interface PaymentHistoryScreenProps {
  navigation: any;
}

export default function PaymentHistoryScreen({ navigation }: PaymentHistoryScreenProps) {
  const { user, forceLogout } = useAuth();
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedPeriod, setSelectedPeriod] = useState('All Time');
  const [isLoading, setIsLoading] = useState(true);
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [authError, setAuthError] = useState(false);

  const filters = ['All', 'Payments', 'Earnings', 'Withdrawals', 'Referrals', 'Products'];
  const periods = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months'];

  // Fetch payment history on component mount
  useEffect(() => {
    if (user?.userId) {
      fetchPaymentHistory();
    }
  }, [user?.userId]);

  const fetchPaymentHistory = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching payment history for user:', user?.userId);
      
      if (!user?.userId) {
        console.log('❌ No user ID available');
        setPaymentHistory([]);
        return;
      }

      // Fetch real payment history from backend
      console.log('📡 Calling backend API for payment history...');
      const response = await apiServiceAxios.getUserPaymentHistory(parseInt(user.userId));
      
      if (response.success && response.data) {
        console.log('✅ Payment history received from backend:', response.data);
        
        const backendPayments = response.data.payments || [];
        const formattedPayments = backendPayments.map((payment: any, index: number) => {
          // Format the payment data for display
          const amount = payment.amount || 0;
          const isPositive = amount > 0;
          const formattedAmount = `${isPositive ? '+' : ''}₹${Math.abs(amount)}`;
          
          // Determine transaction type and icon
          let type = 'Payments';
          let icon = 'creditcard';
          let color = '#FFD700';
          
          if (payment.type) {
            switch (payment.type.toString().toUpperCase()) {
              case 'CREDIT':
              case 'EARNING':
              case 'COMMISSION':
                type = 'Earnings';
                icon = 'wallet';
                color = '#4CAF50';
                break;
              case 'DEBIT':
              case 'WITHDRAWAL':
                type = 'Withdrawals';
                icon = 'logout';
                color = '#FF6B6B';
                break;
              case 'PAYMENT':
                type = 'Payments';
                icon = 'creditcard';
                color = '#FFD700';
                break;
              default:
                type = 'Payments';
                icon = 'creditcard';
                color = '#FFD700';
            }
          }
          
          // Format date
          let formattedDate = 'Today';
          if (payment.createdAt) {
            const date = new Date(payment.createdAt);
            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            if (diffDays === 1) {
              formattedDate = 'Today';
            } else if (diffDays === 2) {
              formattedDate = 'Yesterday';
            } else if (diffDays <= 7) {
              formattedDate = `${diffDays - 1} days ago`;
            } else {
              formattedDate = date.toLocaleDateString();
            }
          }
          
          return {
            id: payment.id?.toString() || index.toString(),
            type: type,
            title: payment.description || `${type} Transaction`,
            description: payment.description || 'Transaction',
            amount: formattedAmount,
            date: formattedDate,
            status: payment.status || 'Completed',
            icon: icon,
            color: color,
            originalData: payment // Keep original data for reference
          };
        });
        
        setPaymentHistory(formattedPayments);
        console.log('✅ Payment history formatted and set:', formattedPayments.length, 'transactions');
      } else {
        console.log('⚠️ No payment history data received from backend');
        
        // Show basic wallet information if no transactions
        const fallbackPayments = [];
        
        if (user.walletBalance && user.walletBalance > 0) {
          fallbackPayments.push({
            id: 'wallet-balance',
            type: 'Earnings',
            title: 'Current Wallet Balance',
            description: 'Your current wallet balance',
            amount: `+₹${user.walletBalance}`,
            date: 'Current',
            status: 'Active',
            icon: 'wallet',
            color: '#4CAF50'
          });
        }
        
        if (user.hasPaidActivation) {
          fallbackPayments.push({
            id: 'activation-payment',
            type: 'Payments',
            title: 'Account Activation',
            description: 'CQ Wealth activation payment',
            amount: '-₹1',
            date: 'Completed',
            status: 'Completed',
            icon: 'creditcard',
            color: '#FFD700'
          });
        }
        
        setPaymentHistory(fallbackPayments);
        console.log('📊 Fallback payment history set:', fallbackPayments.length, 'items');
      }
    } catch (error: any) {
      console.error('Error fetching payment history:', error);
      
      // Check if it's an authentication error
      if (error?.response?.status === 401 || error?.message?.includes('Authentication failed')) {
        setAuthError(true);
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Re-login', onPress: handleForceLogout }
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to load payment history. Showing basic information.');
        
        // Show fallback data even on error
        const fallbackPayments = [];
        
        if (user?.walletBalance && user.walletBalance > 0) {
          fallbackPayments.push({
            id: 'wallet-balance-error',
            type: 'Earnings',
            title: 'Current Wallet Balance',
            description: 'Your current wallet balance',
            amount: `+₹${user.walletBalance}`,
            date: 'Current',
            status: 'Active',
            icon: 'wallet',
            color: '#4CAF50'
          });
        }
        
        if (user?.hasPaidActivation) {
          fallbackPayments.push({
            id: 'activation-payment-error',
            type: 'Payments',
            title: 'Account Activation',
            description: 'CQ Wealth activation payment',
            amount: '-₹1',
            date: 'Completed',
            status: 'Completed',
            icon: 'creditcard',
            color: '#FFD700'
          });
        }
        
        setPaymentHistory(fallbackPayments);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setAuthError(false);
    console.log('🔄 Refreshing payment history...');
    await fetchPaymentHistory();
    setRefreshing(false);
    console.log('✅ Payment history refresh completed');
  };

  const handleForceLogout = async () => {
    try {
      console.log('Clearing cache and forcing logout...');
      await forceLogout();
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error during force logout:', error);
      Alert.alert('Error', 'Failed to logout. Please restart the app.');
    }
  };

  // Helper functions to transform backend data
  const getTransactionType = (backendType: string) => {
    switch (backendType?.toUpperCase()) {
      case 'DEPOSIT':
      case 'CREDIT':
        return 'Earnings';
      case 'WITHDRAW':
      case 'DEBIT':
        return 'Withdrawals';
      case 'REFERRAL_BONUS':
      case 'COMMISSION':
        return 'Referrals';
      case 'PRODUCT_PURCHASE':
        return 'Products';
      default:
        return 'Payments';
    }
  };

  const getTransactionTitle = (type: string, description: string) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
      case 'CREDIT':
        return 'Wallet Credit';
      case 'WITHDRAW':
      case 'DEBIT':
        return 'Withdrawal';
      case 'REFERRAL_BONUS':
      case 'COMMISSION':
        return 'Referral Commission';
      case 'PRODUCT_PURCHASE':
        return 'Product Purchase';
      default:
        return description || 'Transaction';
    }
  };

  const formatAmount = (amount: number, type: string) => {
    const isCredit = ['DEPOSIT', 'CREDIT', 'REFERRAL_BONUS', 'COMMISSION'].includes(type?.toUpperCase());
    const prefix = isCredit ? '+' : '-';
    return `${prefix}₹${amount || 0}`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - date.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) return 'Today';
      if (diffDays === 2) return 'Yesterday';
      if (diffDays <= 7) return `${diffDays - 1} days ago`;
      
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Processing';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Completed';
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
      case 'CREDIT':
      case 'REFERRAL_BONUS':
      case 'COMMISSION':
        return 'linechart';
      case 'WITHDRAW':
      case 'DEBIT':
        return 'bank';
      case 'PRODUCT_PURCHASE':
        return 'gift';
      default:
        return 'wallet';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type?.toUpperCase()) {
      case 'DEPOSIT':
      case 'CREDIT':
      case 'REFERRAL_BONUS':
      case 'COMMISSION':
        return '#4CAF50';
      case 'WITHDRAW':
      case 'DEBIT':
        return '#FF9800';
      case 'PRODUCT_PURCHASE':
        return '#9C27B0';
      default:
        return '#2196F3';
    }
  };

  // Mock transactions for demo (will be replaced by real data)
  const mockTransactions = [
    {
      id: '1',
      type: 'Earnings',
      title: 'Level 1 Commission',
      description: 'Commission from Amit Kumar',
      amount: '+₹250',
      date: 'Today, 2:30 PM',
      status: 'Completed',
      icon: 'linechart',
      color: '#4CAF50'
    },
    {
      id: '2',
      type: 'Withdrawal',
      title: 'Bank Transfer',
      description: 'To HDFC Bank - 1234',
      amount: '-₹1,000',
      date: 'Yesterday, 4:15 PM',
      status: 'Processing',
      icon: 'bank',
      color: '#FF9800'
    },
    {
      id: '3',
      type: 'Referrals',
      title: 'New Referral Bonus',
      description: 'Priya Sharma joined',
      amount: '+₹100',
      date: '2 days ago',
      status: 'Completed',
      icon: 'team',
      color: '#2196F3'
    },
    {
      id: '4',
      type: 'Products',
      title: 'Product Purchase',
      description: 'CQ Wealth T-Shirt',
      amount: '-₹500',
      date: '3 days ago',
      status: 'Completed',
      icon: 'gift',
      color: '#9C27B0'
    },
    {
      id: '5',
      type: 'Earnings',
      title: 'Level 2 Commission',
      description: 'Commission from Rahul Gupta',
      amount: '+₹50',
      date: '1 week ago',
      status: 'Completed',
      icon: 'linechart',
      color: '#4CAF50'
    },
    {
      id: '6',
      type: 'Withdrawal',
      title: 'UPI Transfer',
      description: 'To amit@upi',
      amount: '-₹500',
      date: '1 week ago',
      status: 'Completed',
      icon: 'bank',
      color: '#FF9800'
    }
  ];

  // Use real payment history data
  const allTransactions = paymentHistory;

  const filteredTransactions = allTransactions.filter(transaction => {
    if (activeFilter === 'All') return true;
    return transaction.type === activeFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return '#4CAF50';
      case 'Processing': return '#FF9800';
      case 'Failed': return '#F44336';
      case 'Pending': return '#FFC107';
      default: return '#666666';
    }
  };

  const getTotalAmount = () => {
    return filteredTransactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount.replace(/[₹,]/g, ''));
      return total + amount;
    }, 0);
  };

  const getTotalEarnings = () => {
    if (!allTransactions || allTransactions.length === 0) return 0;
    return allTransactions
      .filter(transaction => ['Earnings', 'Referrals'].includes(transaction.type))
      .reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount.replace(/[₹,+]/g, ''));
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
  };

  const getTotalWithdrawals = () => {
    if (!allTransactions || allTransactions.length === 0) return 0;
    return allTransactions
      .filter(transaction => transaction.type === 'Withdrawals')
      .reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount.replace(/[₹,-]/g, ''));
        return total + (isNaN(amount) ? 0 : amount);
      }, 0);
  };

  const viewTransactionDetails = (transaction: any) => {
    Alert.alert(
      'Transaction Details',
      `Type: ${transaction.type}\nTitle: ${transaction.title}\nDescription: ${transaction.description}\nAmount: ${transaction.amount}\nDate: ${transaction.date}\nStatus: ${transaction.status}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFD700']}
              tintColor="#FFD700"
            />
          }
        >
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Payment History</Text>
            <TouchableOpacity 
              style={styles.exportButton}
              onPress={fetchPaymentHistory}
            >
              <AntDesign name="reload1" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Earnings</Text>
              <Text style={styles.summaryAmount}>₹{getTotalEarnings()}</Text>
              <Text style={styles.summaryPeriod}>All time</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Withdrawals</Text>
              <Text style={styles.summaryAmount}>₹{getTotalWithdrawals()}</Text>
              <Text style={styles.summaryPeriod}>All time</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Available Balance</Text>
              <Text style={styles.summaryAmount}>₹{user?.walletBalance || 0}</Text>
              <Text style={styles.summaryPeriod}>Ready to withdraw</Text>
            </View>
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filter by Type</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {filters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                  onPress={() => setActiveFilter(filter)}
                >
                  <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Period Filter */}
          <View style={styles.periodSection}>
            <Text style={styles.filterTitle}>Time Period</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {periods.map((period) => (
                <TouchableOpacity
                  key={period}
                  style={[styles.filterChip, selectedPeriod === period && styles.activeFilterChip]}
                  onPress={() => setSelectedPeriod(period)}
                >
                  <Text style={[styles.filterText, selectedPeriod === period && styles.activeFilterText]}>
                    {period}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Filtered Results Summary */}
          <View style={styles.resultsSummary}>
            <Text style={styles.resultsText}>
              {filteredTransactions.length} transactions found
            </Text>
            <Text style={styles.resultsAmount}>
              Net: ₹{getTotalAmount().toLocaleString()}
            </Text>
          </View>

          {/* Transactions List */}
          <View style={styles.transactionsSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading payment history...</Text>
              </View>
            ) : authError ? (
              <View style={styles.emptyContainer}>
                <AntDesign name="exclamationcircle" size={48} color="#FF6B6B" />
                <Text style={styles.emptyTitle}>Authentication Error</Text>
                <Text style={styles.emptyDescription}>
                  Your session has expired. Please log in again to view your payment history.
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={handleForceLogout}
                >
                  <AntDesign name="logout" size={16} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Re-login</Text>
                </TouchableOpacity>
              </View>
            ) : filteredTransactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AntDesign name="inbox" size={48} color="#666666" />
                <Text style={styles.emptyTitle}>No Transactions Found</Text>
                <Text style={styles.emptyDescription}>
                  {activeFilter === 'All' 
                    ? 'You haven\'t made any transactions yet.' 
                    : `No ${activeFilter.toLowerCase()} transactions found.`}
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchPaymentHistory}
                >
                  <AntDesign name="reload1" size={16} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredTransactions.map((transaction) => (
              <TouchableOpacity
                key={transaction.id}
                style={styles.transactionCard}
                onPress={() => viewTransactionDetails(transaction)}
              >
                <View style={styles.transactionHeader}>
                  <View style={styles.transactionIcon}>
                    <AntDesign name={transaction.icon as any} size={20} color={transaction.color} />
                  </View>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionTitle}>{transaction.title}</Text>
                    <Text style={styles.transactionDescription}>{transaction.description}</Text>
                  </View>
                  <View style={styles.transactionAmount}>
                    <Text style={[
                      styles.amountText,
                      { color: transaction.amount.startsWith('+') ? '#4CAF50' : '#F44336' }
                    ]}>
                      {transaction.amount}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(transaction.status) }]}>
                      <Text style={styles.statusText}>{transaction.status}</Text>
                    </View>
                  </View>
                </View>
                
                <View style={styles.transactionFooter}>
                  <Text style={styles.transactionDate}>{transaction.date}</Text>
                  <TouchableOpacity 
                    style={styles.detailsButton}
                    onPress={() => viewTransactionDetails(transaction)}
                  >
                    <Text style={styles.detailsButtonText}>View Details</Text>
                    <AntDesign name="right" size={12} color="#FFD700" />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
              ))
            )}
          </View>

          {/* Empty State */}
          {filteredTransactions.length === 0 && (
            <View style={styles.emptyState}>
              <AntDesign name="inbox" size={48} color="#666666" />
              <Text style={styles.emptyTitle}>No transactions found</Text>
              <Text style={styles.emptyDescription}>
                No transactions match your current filters
              </Text>
            </View>
          )}

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
  exportButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  summaryPeriod: {
    fontSize: 10,
    color: '#666666',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  periodSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  resultsSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  resultsText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  resultsAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  transactionsSection: {
    paddingHorizontal: 20,
  },
  transactionCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  transactionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  transactionDescription: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
  },
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsButtonText: {
    fontSize: 12,
    color: '#FFD700',
    marginRight: 5,
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    margin: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 15,
  },
});

