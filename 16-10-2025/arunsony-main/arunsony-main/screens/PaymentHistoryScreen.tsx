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
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Real data states for summary cards
  const [lifetimeEarnings, setLifetimeEarnings] = useState<number>(0);
  const [totalWithdrawalsAmount, setTotalWithdrawalsAmount] = useState<number>(0);
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [realDataLoading, setRealDataLoading] = useState(true);

  const filters = ['All', 'Payments', 'Earnings', 'Withdrawals', 'Referrals', 'Products'];
  const periods = ['All Time', 'This Month', 'Last Month', 'Last 3 Months', 'Last 6 Months'];

  // Fetch payment history on component mount
  useEffect(() => {
    if (user?.userId) {
      fetchComprehensiveTransactionHistory();
      fetchRealSummaryData();
    }
  }, [user?.userId]);

  // Fetch real data for summary cards
  const fetchRealSummaryData = async () => {
    try {
      setRealDataLoading(true);
      console.log('🔍 Fetching real summary data for user:', user?.userId);
      
      if (!user?.userId) {
        console.log('❌ No user ID available for summary data');
        return;
      }

      // Fetch all real data in parallel
      const [commissionStatsResponse, withdrawalHistoryResponse, userProgressResponse] = await Promise.all([
        apiServiceAxios.getUserCommissionStats(parseInt(user.userId)),
        apiServiceAxios.getUserWithdrawals(parseInt(user.userId)),
        apiServiceAxios.getUserProgress(parseInt(user.userId))
      ]);

      // Process commission stats for lifetime earnings (paid commissions)
      if (commissionStatsResponse.success && commissionStatsResponse.data) {
        const commissionStats = commissionStatsResponse.data;
        // Get total paid commissions as lifetime earnings
        const paidCommissions = commissionStats.totalPaidCommissions || commissionStats.totalCommissions || 0;
        setLifetimeEarnings(paidCommissions);
        console.log('✅ Lifetime earnings (paid commissions):', paidCommissions);
      } else {
        console.log('⚠️ No commission stats data available');
        setLifetimeEarnings(0);
      }

      // Process withdrawal history for successful withdrawals total amount
      if (withdrawalHistoryResponse.success && withdrawalHistoryResponse.data) {
        const withdrawals = withdrawalHistoryResponse.data.withdrawals || withdrawalHistoryResponse.data || [];
        // Calculate total amount of successful withdrawals
        const successfulWithdrawals = withdrawals.filter((withdrawal: any) => 
          withdrawal.status === 'COMPLETED' || withdrawal.status === 'SUCCESS' || withdrawal.status === 'APPROVED'
        );
        const totalWithdrawalAmount = successfulWithdrawals.reduce((total: number, withdrawal: any) => {
          return total + (parseFloat(withdrawal.amount) || 0);
        }, 0);
        setTotalWithdrawalsAmount(totalWithdrawalAmount);
        console.log('✅ Total successful withdrawals amount:', totalWithdrawalAmount);
      } else {
        console.log('⚠️ No withdrawal history data available');
        setTotalWithdrawalsAmount(0);
      }

      // Process user progress for available balance (wallet balance)
      if (userProgressResponse.success && userProgressResponse.data) {
        const userProgress = userProgressResponse.data;
        const walletBalance = userProgress.walletBalance || 0;
        setAvailableBalance(walletBalance);
        console.log('✅ Available balance (wallet balance):', walletBalance);
      } else {
        console.log('⚠️ No user progress data available');
        setAvailableBalance(0);
      }

    } catch (error: any) {
      console.error('❌ Error fetching real summary data:', error);
      
      // Set fallback values on error
      setLifetimeEarnings(0);
      setTotalWithdrawalsAmount(0);
      setAvailableBalance(0);
      
      // Check if it's an authentication error
      if (error?.response?.status === 401 || error?.message?.includes('Authentication failed')) {
        setAuthError(true);
      }
    } finally {
      setRealDataLoading(false);
    }
  };

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

  // Comprehensive transaction history from multiple sources
  const fetchComprehensiveTransactionHistory = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching comprehensive transaction history for user:', user?.userId);
      
      if (!user?.userId) {
        console.log('❌ No user ID available');
        setPaymentHistory([]);
        return;
      }

      // Fetch data from multiple sources in parallel
      const [paymentHistoryResponse, commissionHistoryResponse, withdrawalHistoryResponse] = await Promise.all([
        apiServiceAxios.getUserPaymentHistory(parseInt(user.userId)),
        apiServiceAxios.getUserCommissionHistory(parseInt(user.userId)),
        apiServiceAxios.getUserWithdrawals(parseInt(user.userId))
      ]);

      const allTransactions: any[] = [];

      // Process Payment History (normalize to proper types: Payments vs Earnings)
      if (paymentHistoryResponse.success && paymentHistoryResponse.data) {
        const payments = paymentHistoryResponse.data.payments || paymentHistoryResponse.data || [];
        const formattedPayments = payments.map((payment: any, index: number) => {
          const rawAmount = Number(payment.amount) || 0;
          const typeText = (payment.type || '').toString().toUpperCase();
          const descText = (payment.description || '').toString().toLowerCase();

          // Heuristics: treat commission-like or credit entries as Earnings (+)
          const isCredit = typeText === 'CREDIT' || typeText === 'DEPOSIT';
          const isCommissionLike = typeText === 'COMMISSION' || descText.includes('commission');
          const isWithdrawalLike = typeText === 'WITHDRAW' || typeText === 'DEBIT';

          let normalizedType = 'Payments';
          let icon: any = 'creditcard';
          let color = '#FFD700';
          let amountStr = `-₹${Math.abs(rawAmount)}`;

          if (isCredit || isCommissionLike) {
            normalizedType = 'Earnings';
            icon = 'linechart';
            color = '#4CAF50';
            amountStr = `+₹${Math.abs(rawAmount)}`;
          } else if (isWithdrawalLike) {
            normalizedType = 'Withdrawals';
            icon = 'bank';
            color = '#FF9800';
            amountStr = `-₹${Math.abs(rawAmount)}`;
          } else {
            // Payments like activation/product purchases remain negative
            normalizedType = 'Payments';
            icon = 'creditcard';
            color = '#FFD700';
            amountStr = `-₹${Math.abs(rawAmount)}`;
          }

          return {
            id: `payment-${payment.id || index}`,
            type: normalizedType,
            title: payment.description || (normalizedType === 'Earnings' ? 'Wallet Credit' : 'Payment Transaction'),
            description: payment.reference || payment.transactionId || 'CQ Wealth Payment',
            amount: amountStr,
            date: formatTransactionDate(payment.createdAt || payment.date),
            status: getTransactionStatus(payment.status),
            icon,
            color,
            originalData: payment,
            source: 'payments'
          };
        });
        allTransactions.push(...formattedPayments);
        console.log('✅ Payment transactions:', formattedPayments.length);
      }

      // Process Commission History (Earnings)
      if (commissionHistoryResponse.success && commissionHistoryResponse.data) {
        const commissions = Array.isArray(commissionHistoryResponse.data) 
          ? commissionHistoryResponse.data 
          : commissionHistoryResponse.data.commissions || [];
        
        const formattedCommissions = commissions
          .filter((commission: any) => commission.referrerUserId === user.userId) // Only earned commissions
          .map((commission: any, index: number) => ({
            id: `commission-${commission.id || index}`,
            type: 'Earnings',
            title: 'Commission Earned',
            description: `From referral: ${commission.referredUserName || 'Unknown User'}`,
            amount: `+₹${commission.commissionAmount || 0}`,
            date: formatTransactionDate(commission.createdAt),
            status: getTransactionStatus(commission.commissionStatus),
            icon: 'linechart',
            color: '#4CAF50',
            originalData: commission,
            source: 'commissions'
          }));
        allTransactions.push(...formattedCommissions);
        console.log('✅ Commission transactions:', formattedCommissions.length);
      }

      // Process Withdrawal History
      if (withdrawalHistoryResponse.success && withdrawalHistoryResponse.data) {
        const withdrawals = withdrawalHistoryResponse.data.withdrawals || withdrawalHistoryResponse.data || [];
        const formattedWithdrawals = withdrawals.map((withdrawal: any, index: number) => ({
          id: `withdrawal-${withdrawal.id || index}`,
          type: 'Withdrawals',
          title: 'Withdrawal Request',
          description: withdrawal.description || `To ${withdrawal.paymentMethod || 'Bank Account'}`,
          amount: `-₹${withdrawal.amount || 0}`,
          date: formatTransactionDate(withdrawal.createdAt),
          status: getTransactionStatus(withdrawal.status),
          icon: 'bank',
          color: '#FF9800',
          originalData: withdrawal,
          source: 'withdrawals'
        }));
        allTransactions.push(...formattedWithdrawals);
        console.log('✅ Withdrawal transactions:', formattedWithdrawals.length);
      }

      // Sort transactions by date (newest first)
      allTransactions.sort((a, b) => {
        // Get dates from multiple possible fields
        const dateA = new Date(a.originalData?.createdAt || a.originalData?.date || a.originalData?.timestamp || 0);
        const dateB = new Date(b.originalData?.createdAt || b.originalData?.date || b.originalData?.timestamp || 0);
        
        // If dates are invalid, put them at the end
        if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) {
          return 0; // Keep original order if both are invalid
        }
        if (isNaN(dateA.getTime())) return 1; // Put invalid dates at end
        if (isNaN(dateB.getTime())) return -1; // Put invalid dates at end
        
        // Sort newest first (dateB - dateA)
        return dateB.getTime() - dateA.getTime();
      });

      if (allTransactions.length > 0) {
        // Log the sorted order for debugging
        console.log('📅 Transactions sorted (newest first):');
        allTransactions.slice(0, 5).forEach((tx, index) => {
          const date = new Date(tx.originalData?.createdAt || tx.originalData?.date || tx.originalData?.timestamp || 0);
          console.log(`${index + 1}. ${tx.type} - ${tx.title} (${tx.date}) - ${date.toISOString()}`);
        });
        
        setPaymentHistory(allTransactions);
        console.log('✅ Comprehensive transaction history set:', allTransactions.length, 'total transactions');
      } else {
        // Show fallback data if no real transactions
        setPaymentHistory(getFallbackTransactions());
        console.log('📊 No real transactions found, showing fallback data');
      }

    } catch (error: any) {
      console.error('❌ Error fetching comprehensive transaction history:', error);
      
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
        Alert.alert('Error', 'Failed to load transaction history. Showing basic information.');
        setPaymentHistory(getFallbackTransactions());
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to format transaction dates
  const formatTransactionDate = (dateString: string) => {
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

  // Helper function to get transaction status
  const getTransactionStatus = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'PAID':
      case 'APPROVED':
        return 'Completed';
      case 'PENDING':
        return 'Processing';
      case 'FAILED':
      case 'REJECTED':
        return 'Failed';
      default:
        return 'Completed';
    }
  };

  // Fallback transactions when no real data is available
  const getFallbackTransactions = () => {
    const fallbackTransactions = [];
    
    if (user?.walletBalance && user.walletBalance > 0) {
      fallbackTransactions.push({
        id: 'wallet-balance',
        type: 'Earnings',
        title: 'Current Wallet Balance',
        description: 'Your current wallet balance',
        amount: `+₹${user.walletBalance}`,
        date: 'Current',
        status: 'Active',
        icon: 'wallet',
        color: '#4CAF50',
        source: 'fallback'
      });
    }
    
    if (user?.hasPaidActivation) {
      fallbackTransactions.push({
        id: 'activation-payment',
        type: 'Payments',
        title: 'Account Activation',
        description: 'CQ Wealth activation payment',
        amount: '-₹1',
        date: 'Completed',
        status: 'Completed',
        icon: 'creditcard',
        color: '#FFD700',
        source: 'fallback'
      });
    }
    
    return fallbackTransactions;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setAuthError(false);
    console.log('🔄 Refreshing payment history and summary data...');
    await Promise.all([
      fetchComprehensiveTransactionHistory(),
      fetchRealSummaryData()
    ]);
    setRefreshing(false);
    console.log('✅ Payment history and summary data refresh completed');
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

  // Helper function to filter transactions by selected period
  const filterByPeriod = (transaction: any) => {
    if (selectedPeriod === 'All Time') return true;
    
    try {
      const transactionDate = new Date(transaction.originalData?.createdAt || transaction.originalData?.date || transaction.originalData?.timestamp || 0);
      const now = new Date();
      
      if (isNaN(transactionDate.getTime())) return true; // Include if date is invalid
      
      switch (selectedPeriod) {
        case 'This Month':
          return transactionDate.getMonth() === now.getMonth() && 
                 transactionDate.getFullYear() === now.getFullYear();
        
        case 'Last Month':
          const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
          return transactionDate.getMonth() === lastMonth.getMonth() && 
                 transactionDate.getFullYear() === lastMonth.getFullYear();
        
        case 'Last 3 Months':
          const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3);
          return transactionDate >= threeMonthsAgo;
        
        case 'Last 6 Months':
          const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6);
          return transactionDate >= sixMonthsAgo;
        
        default:
          return true;
      }
    } catch (error) {
      console.error('Error filtering by period:', error);
      return true; // Include if there's an error
    }
  };

  // Use real payment history data
  const allTransactions = paymentHistory;

  const filteredTransactions = allTransactions.filter(transaction => {
    // Filter by type
    const typeMatch = activeFilter === 'All' || transaction.type === activeFilter;
    
    // Filter by period
    const periodMatch = filterByPeriod(transaction);
    
    return typeMatch && periodMatch;
  });

  // Chronological grouping helpers
  const getTxDate = (tx: any) => new Date(tx.originalData?.createdAt || tx.originalData?.date || tx.originalData?.timestamp || 0);

  const getGroupLabel = (date: Date) => {
    if (isNaN(date.getTime())) return 'Unknown Date';
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfYesterday = new Date(startOfToday);
    startOfYesterday.setDate(startOfToday.getDate() - 1);
    const startOfTomorrow = new Date(startOfToday);
    startOfTomorrow.setDate(startOfToday.getDate() + 1);

    if (date >= startOfToday && date < startOfTomorrow) return 'Today';
    if (date >= startOfYesterday && date < startOfToday) return 'Yesterday';
    // Default: Month Year (e.g., Oct 2025)
    return date.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
  };

  // Build grouped list in newest->oldest order
  const groupedTransactions: { label: string; items: any[] }[] = (() => {
    const groups: Record<string, any[]> = {};
    filteredTransactions.forEach(tx => {
      const label = getGroupLabel(getTxDate(tx));
      if (!groups[label]) groups[label] = [];
      groups[label].push(tx);
    });
    // Maintain chronological order of groups by first item date (newest first)
    const entries = Object.entries(groups).map(([label, items]) => ({
      label,
      items: items.sort((a, b) => getTxDate(b).getTime() - getTxDate(a).getTime()),
      firstDate: getTxDate(items[0])
    }));
    entries.sort((a, b) => b.firstDate.getTime() - a.firstDate.getTime());
    return entries.map(e => ({ label: e.label, items: e.items }));
  })();

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
      .filter(transaction => transaction.status === 'SUCCESS' || transaction.status === 'Completed') // Only include approved/confirmed transactions
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

  const getApprovedBalance = () => {
    // Calculate approved balance: Total Earnings - Total Withdrawals
    const totalEarnings = getTotalEarnings(); // This now only includes SUCCESS transactions
    const totalWithdrawals = getTotalWithdrawals();
    return Math.max(0, totalEarnings - totalWithdrawals);
  };

  const viewTransactionDetails = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const renderTransactionDetailsModal = () => {
    if (!selectedTransaction) return null;

    const tx = selectedTransaction.originalData || selectedTransaction;
    const hasRazorpayDetails = tx.razorpayOrderId || tx.razorpayPaymentId;
    const hasShippingDetails = tx.shippingName || tx.shippingAddress;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Transaction Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <AntDesign name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Basic Transaction Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Transaction Type</Text>
              <Text style={styles.detailValue}>{selectedTransaction.type}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Title</Text>
              <Text style={styles.detailValue}>{selectedTransaction.title}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selectedTransaction.description}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Amount</Text>
              <Text style={[styles.detailValue, { color: selectedTransaction.color }]}>
                {selectedTransaction.amount}
              </Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Date</Text>
              <Text style={styles.detailValue}>{selectedTransaction.date}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Status</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedTransaction.status) }]}>
                <AntDesign name={selectedTransaction.status === 'Completed' ? 'checkcircle' : selectedTransaction.status === 'Processing' ? 'clockcircle' : 'closecircle'} size={14} color="#FFFFFF" />
                <Text style={styles.statusText}>{selectedTransaction.status}</Text>
              </View>
            </View>

            {/* Razorpay Transaction Details */}
            {hasRazorpayDetails && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                
                {tx.razorpayOrderId && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Razorpay Order ID</Text>
                    <Text style={[styles.detailValue, styles.monospace]}>{tx.razorpayOrderId}</Text>
                  </View>
                )}

                {tx.razorpayPaymentId && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Razorpay Payment ID</Text>
                    <Text style={[styles.detailValue, styles.monospace]}>{tx.razorpayPaymentId}</Text>
                  </View>
                )}

                {tx.razorpaySignature && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Transaction Signature</Text>
                    <Text style={[styles.detailValue, styles.monospace, styles.smallText]}>
                      {tx.razorpaySignature}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Shipping Details */}
            {hasShippingDetails && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Shipping Details</Text>
                
                {tx.shippingName && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Recipient Name</Text>
                    <Text style={styles.detailValue}>{tx.shippingName}</Text>
                  </View>
                )}

                {tx.shippingPhone && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{tx.shippingPhone}</Text>
                  </View>
                )}

                {tx.shippingAddress && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{tx.shippingAddress}</Text>
                  </View>
                )}

                {(tx.shippingCity || tx.shippingState || tx.shippingPincode) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {tx.shippingCity && tx.shippingCity}
                      {tx.shippingCity && tx.shippingState && ', '}
                      {tx.shippingState && tx.shippingState}
                      {tx.shippingPincode && ` - ${tx.shippingPincode}`}
                    </Text>
                  </View>
                )}

                {tx.deliveryStatus && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Delivery Status</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tx.deliveryStatus) }]}>
                      <AntDesign name={tx.deliveryStatus === 'DELIVERED' ? 'checkcircle' : tx.deliveryStatus === 'SHIPPED' ? 'car' : 'clockcircle'} size={14} color="#FFFFFF" />
                      <Text style={styles.statusText}>{tx.deliveryStatus}</Text>
                    </View>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
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
              onPress={onRefresh}
            >
              <AntDesign name="reload1" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Lifetime Earnings</Text>
              <Text style={styles.summaryAmount}>
                {realDataLoading ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  `₹${lifetimeEarnings.toLocaleString()}`
                )}
              </Text>
              <Text style={styles.summaryPeriod}>Paid commissions</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Withdrawals</Text>
              <Text style={styles.summaryAmount}>
                {realDataLoading ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  `₹${totalWithdrawalsAmount.toLocaleString()}`
                )}
              </Text>
              <Text style={styles.summaryPeriod}>Successful withdrawals</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Available Balance</Text>
              <Text style={styles.summaryAmount}>
                {realDataLoading ? (
                  <ActivityIndicator size="small" color="#FFD700" />
                ) : (
                  `₹${availableBalance.toLocaleString()}`
                )}
              </Text>
              <Text style={styles.summaryPeriod}>Wallet balance</Text>
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

          {/* Transactions List (Grouped chronologically) */}
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
              groupedTransactions.map(section => (
                <View key={section.label} style={{ marginBottom: 14 }}>
                  <Text style={styles.sectionHeader}>{section.label}</Text>
                  {section.items.map(transaction => (
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
                            <AntDesign name={transaction.status === 'Completed' ? 'checkcircle' : transaction.status === 'Processing' ? 'clockcircle' : 'closecircle'} size={12} color="#FFFFFF" />
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
                  ))}
                </View>
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

      {/* Transaction Details Modal */}
      {showDetailsModal && renderTransactionDetailsModal()}
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
  sectionHeader: {
    fontSize: 12,
    color: '#888888',
    marginBottom: 6,
    marginLeft: 2,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
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
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    maxHeight: 400,
    padding: 20,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  smallText: {
    fontSize: 10,
  },
  sectionDivider: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

