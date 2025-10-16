import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';
import LoadingButton from '../components/LoadingButton';
import SuccessModal from '../components/SuccessModal';

interface Withdrawal {
  id: number;
  amount: number;
  status: string;
  statusDisplay: string;
  statusColor: string;
  description: string;
  createdAt: string;
}

interface WithdrawScreenProps {
  navigation: any;
}

export default function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const { user, forceLogout, updateUserBalance } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showWithdrawalSuccess, setShowWithdrawalSuccess] = useState(false);
  
  // Validation error states
  const [errors, setErrors] = useState({
    amount: '',
    upiId: '',
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
    mobileNumber: '',
  });
  const [mobileNumber, setMobileNumber] = useState('');

  const paymentMethods = [
    { id: 'UPI', name: 'UPI Transfer', icon: 'mobile1', minAmount: 100 },
    { id: 'BANK', name: 'Bank Transfer', icon: 'bank', minAmount: 500 },
    { id: 'PAYTM', name: 'Paytm Wallet', icon: 'wallet', minAmount: 50 },
    { id: 'GPAY', name: 'Google Pay', icon: 'wallet', minAmount: 100 },
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  // Load user balance and withdrawal history on component mount
  useEffect(() => {
    loadUserBalance();
    loadWithdrawalHistory();
  }, []);

  // Refresh function for pull-to-refresh
  const onRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        loadUserBalance(true), // Force refresh
        loadWithdrawalHistory()
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const loadUserBalance = async (forceRefresh = false) => {
    try {
      // Fetch wallet balance from profile API (actual available balance)
      const profileResponse = await apiServiceAxios.getProfile();
      if (profileResponse.success && profileResponse.data) {
        const walletBalance = profileResponse.data.walletBalance || 0;
        setAvailableBalance(walletBalance);
        // Also update the user balance in AuthContext
        updateUserBalance(walletBalance);
        console.log('✅ Updated wallet balance from profile:', walletBalance);
      } else if (user?.walletBalance !== undefined) {
        // Fallback to cached balance if profile API fails
        setAvailableBalance(user.walletBalance);
        console.log('⚠️ Using cached wallet balance:', user.walletBalance);
      }
      // TODO: Load pending withdrawal amount from API
      setPendingAmount(0);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      // Fallback to cached balance on error
      if (user?.walletBalance !== undefined) {
        setAvailableBalance(user.walletBalance);
      }
    }
  };

  const loadWithdrawalHistory = async () => {
    try {
      setHistoryLoading(true);
      
      if (!user?.userId) {
        return;
      }

      const response = await apiServiceAxios.getUserWithdrawals(Number(user.userId));

      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals || []);
      }
    } catch (error) {
      console.error('Error loading withdrawal history:', error);
    } finally {
      setHistoryLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = now.getTime() - date.getTime();
      const diffMinutes = Math.floor(diffTime / (1000 * 60));
      const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      // Show exact time for today's transactions
      if (diffDays === 0) {
        if (diffMinutes < 1) {
          return 'Just now';
        } else if (diffMinutes < 60) {
          return `${diffMinutes} minutes ago`;
        } else {
          return `${diffHours} hours ago`;
        }
      }
      // Show relative time for recent transactions
      else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return `${diffDays} days ago`;
      } else if (diffDays < 30) {
        const weeks = Math.floor(diffDays / 7);
        return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
      } else {
        // Show exact date for older transactions
        return date.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      }
    } catch (error) {
      return 'Unknown date';
    }
  };

  const formatAmount = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'success':
      case 'completed':
        return <AntDesign name="checkcircle" size={16} color="#00C851" />;
      case 'failed':
        return <AntDesign name="closecircle" size={16} color="#FF4444" />;
      case 'pending':
      default:
        return <AntDesign name="clockcircle" size={16} color="#FFA500" />;
    }
  };

  const submitWithdrawalRequest = async (withdrawAmount: number, methodName: string) => {
    try {
      setLoading(true);
      
      const description = `Withdrawal via ${methodName}`;
      
      // For PAYTM/GPAY, use mobile number as UPI ID if not provided
      const finalUpiId = selectedMethod === 'UPI' ? upiId : 
                         (selectedMethod === 'PAYTM' || selectedMethod === 'GPAY') ? mobileNumber : 
                         '';
      
      const response = await apiServiceAxios.createWithdrawalRequest(
        withdrawAmount,
        description,
        selectedMethod,
        finalUpiId,
        accountNumber,
        ifscCode,
        accountHolderName,
        bankName
      );

      if (response.success) {
        // Show success modal
        setShowWithdrawalSuccess(true);
        setAmount('');
        // Clear form fields
        setUpiId('');
        setAccountNumber('');
        setIfscCode('');
        setAccountHolderName('');
        setBankName('');
        setMobileNumber('');
        clearErrors();
        // Add a small delay to ensure backend has processed the withdrawal
        setTimeout(async () => {
          await loadUserBalance(true); // Force refresh
          await loadWithdrawalHistory();
        }, 1000);
      } else {
        Alert.alert('Error', response.error || 'Failed to submit withdrawal request');
      }
    } catch (error: any) {
      console.error('Withdrawal error:', error);
      
      // Handle authentication errors specifically
      if (error.response?.status === 401) {
        Alert.alert(
          'Authentication Error', 
          'Your session has expired. Please log in again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Clear Cache & Re-login', onPress: () => {
              forceLogout();
              navigation.navigate('Login');
            }}
          ]
        );
      } else {
        Alert.alert('Error', 'Failed to submit withdrawal request. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Validation functions
  const validateUpiId = (upi: string): string => {
    if (!upi || upi.trim() === '') {
      return 'UPI ID is required';
    }
    // UPI ID format: username@provider (e.g., user@paytm, 1234567890@ybl)
    const upiRegex = /^[\w.-]+@[\w.-]+$/;
    if (!upiRegex.test(upi)) {
      return 'Invalid UPI ID format (e.g., user@paytm)';
    }
    return '';
  };

  const validateAccountNumber = (accNum: string): string => {
    if (!accNum || accNum.trim() === '') {
      return 'Account number is required';
    }
    if (accNum.length < 9 || accNum.length > 18) {
      return 'Account number must be 9-18 digits';
    }
    if (!/^\d+$/.test(accNum)) {
      return 'Account number must contain only digits';
    }
    return '';
  };

  const validateIfscCode = (ifsc: string): string => {
    if (!ifsc || ifsc.trim() === '') {
      return 'IFSC code is required';
    }
    // IFSC format: 4 letters + 0 + 6 alphanumeric (e.g., SBIN0001234)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifsc.toUpperCase())) {
      return 'Invalid IFSC code format (e.g., SBIN0001234)';
    }
    return '';
  };

  const validateAccountHolderName = (name: string): string => {
    if (!name || name.trim() === '') {
      return 'Account holder name is required';
    }
    if (name.trim().length < 3) {
      return 'Name must be at least 3 characters';
    }
    if (!/^[a-zA-Z\s.]+$/.test(name)) {
      return 'Name should contain only letters';
    }
    return '';
  };

  const validateBankName = (bank: string): string => {
    if (!bank || bank.trim() === '') {
      return 'Bank name is required';
    }
    if (bank.trim().length < 3) {
      return 'Bank name must be at least 3 characters';
    }
    return '';
  };

  const validateMobileNumber = (mobile: string): string => {
    if (!mobile || mobile.trim() === '') {
      return 'Mobile number is required';
    }
    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return 'Invalid mobile number (10 digits starting with 6-9)';
    }
    return '';
  };

  const validateAmount = (amt: string): string => {
    if (!amt || amt.trim() === '') {
      return 'Amount is required';
    }
    const withdrawAmount = parseInt(amt);
    if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
      return 'Please enter a valid amount';
    }
    if (withdrawAmount > availableBalance) {
      return `Insufficient balance (Available: ₹${availableBalance})`;
    }
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    if (selectedMethodData && withdrawAmount < selectedMethodData.minAmount) {
      return `Minimum amount is ₹${selectedMethodData.minAmount}`;
    }
    return '';
  };

  const validateForm = (): boolean => {
    const newErrors = {
      amount: '',
      upiId: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      mobileNumber: '',
    };

    // Validate amount
    newErrors.amount = validateAmount(amount);

    // Validate payment method specific fields
    if (selectedMethod === 'UPI') {
      newErrors.upiId = validateUpiId(upiId);
    } else if (selectedMethod === 'BANK') {
      newErrors.accountHolderName = validateAccountHolderName(accountHolderName);
      newErrors.accountNumber = validateAccountNumber(accountNumber);
      newErrors.ifscCode = validateIfscCode(ifscCode);
      newErrors.bankName = validateBankName(bankName);
    } else {
      // For PAYTM, GPAY
      newErrors.mobileNumber = validateMobileNumber(mobileNumber);
    }

    setErrors(newErrors);

    // Check if there are any errors
    return !Object.values(newErrors).some(error => error !== '');
  };

  const clearErrors = () => {
    setErrors({
      amount: '',
      upiId: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: '',
      bankName: '',
      mobileNumber: '',
    });
  };

  const handleWithdraw = async () => {
    // Clear previous errors
    clearErrors();

    // Validate form
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    const withdrawAmount = parseInt(amount);
    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);

    Alert.alert(
      'Confirm Withdrawal',
      `Withdraw ₹${withdrawAmount} via ${selectedMethodData!.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: () => submitWithdrawalRequest(withdrawAmount, selectedMethodData!.name)
        }
      ]
    );
  };

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case 'UPI':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>UPI ID *</Text>
            <TextInput
              style={[styles.textInput, errors.upiId && styles.inputError]}
              placeholder="Enter UPI ID (e.g., user@paytm)"
              placeholderTextColor="#666666"
              value={upiId}
              onChangeText={(text) => {
                setUpiId(text);
                if (errors.upiId) {
                  setErrors({...errors, upiId: ''});
                }
              }}
              autoCapitalize="none"
            />
            {errors.upiId ? (
              <Text style={styles.errorText}>{errors.upiId}</Text>
            ) : null}
          </View>
        );
      case 'BANK':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Account Holder Name *</Text>
            <TextInput
              style={[styles.textInput, errors.accountHolderName && styles.inputError]}
              placeholder="Enter account holder name"
              placeholderTextColor="#666666"
              value={accountHolderName}
              onChangeText={(text) => {
                setAccountHolderName(text);
                if (errors.accountHolderName) {
                  setErrors({...errors, accountHolderName: ''});
                }
              }}
              autoCapitalize="words"
            />
            {errors.accountHolderName ? (
              <Text style={styles.errorText}>{errors.accountHolderName}</Text>
            ) : null}
            
            <Text style={styles.formLabel}>Account Number *</Text>
            <TextInput
              style={[styles.textInput, errors.accountNumber && styles.inputError]}
              placeholder="Enter account number"
              placeholderTextColor="#666666"
              value={accountNumber}
              onChangeText={(text) => {
                setAccountNumber(text);
                if (errors.accountNumber) {
                  setErrors({...errors, accountNumber: ''});
                }
              }}
              keyboardType="numeric"
            />
            {errors.accountNumber ? (
              <Text style={styles.errorText}>{errors.accountNumber}</Text>
            ) : null}
            
            <Text style={styles.formLabel}>IFSC Code *</Text>
            <TextInput
              style={[styles.textInput, errors.ifscCode && styles.inputError]}
              placeholder="Enter IFSC code (e.g., SBIN0001234)"
              placeholderTextColor="#666666"
              value={ifscCode}
              onChangeText={(text) => {
                setIfscCode(text.toUpperCase());
                if (errors.ifscCode) {
                  setErrors({...errors, ifscCode: ''});
                }
              }}
              autoCapitalize="characters"
              maxLength={11}
            />
            {errors.ifscCode ? (
              <Text style={styles.errorText}>{errors.ifscCode}</Text>
            ) : null}
            
            <Text style={styles.formLabel}>Bank Name *</Text>
            <TextInput
              style={[styles.textInput, errors.bankName && styles.inputError]}
              placeholder="Enter bank name"
              placeholderTextColor="#666666"
              value={bankName}
              onChangeText={(text) => {
                setBankName(text);
                if (errors.bankName) {
                  setErrors({...errors, bankName: ''});
                }
              }}
              autoCapitalize="words"
            />
            {errors.bankName ? (
              <Text style={styles.errorText}>{errors.bankName}</Text>
            ) : null}
          </View>
        );
      default:
        return (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Mobile Number *</Text>
            <TextInput
              style={[styles.textInput, errors.mobileNumber && styles.inputError]}
              placeholder="Enter mobile number (10 digits)"
              placeholderTextColor="#666666"
              value={mobileNumber}
              onChangeText={(text) => {
                setMobileNumber(text);
                if (errors.mobileNumber) {
                  setErrors({...errors, mobileNumber: ''});
                }
              }}
              keyboardType="phone-pad"
              maxLength={10}
            />
            {errors.mobileNumber ? (
              <Text style={styles.errorText}>{errors.mobileNumber}</Text>
            ) : null}
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingBottom: 100 }}
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
            <Text style={styles.headerTitle}>Withdraw Earnings</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceTitle}>Available Balance</Text>
            <Text style={styles.balanceAmount}>₹{availableBalance.toLocaleString()}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
            
            <View style={[styles.amountInput, errors.amount && styles.inputError]}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountTextInput}
                placeholder="Enter amount"
                placeholderTextColor="#666666"
                value={amount}
                onChangeText={(text) => {
                  setAmount(text);
                  if (errors.amount) {
                    setErrors({...errors, amount: ''});
                  }
                }}
                keyboardType="numeric"
              />
            </View>
            {errors.amount ? (
              <Text style={styles.errorText}>{errors.amount}</Text>
            ) : null}

            {/* Quick Amount Buttons */}
            <View style={styles.quickAmounts}>
              {quickAmounts.map((quickAmount) => (
                <TouchableOpacity
                  key={quickAmount}
                  style={styles.quickAmountButton}
                  onPress={() => setAmount(quickAmount.toString())}
                >
                  <Text style={styles.quickAmountText}>₹{quickAmount}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.methodsSection}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            {paymentMethods.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.methodCard,
                  selectedMethod === method.id && styles.selectedMethodCard
                ]}
                onPress={() => setSelectedMethod(method.id)}
              >
                <AntDesign 
                  name={method.icon as any} 
                  size={24} 
                  color={selectedMethod === method.id ? '#000000' : '#FFD700'} 
                />
                <View style={styles.methodInfo}>
                  <Text style={[
                    styles.methodName,
                    selectedMethod === method.id && styles.selectedMethodText
                  ]}>
                    {method.name}
                  </Text>
                  <Text style={[
                    styles.methodMin,
                    selectedMethod === method.id && styles.selectedMethodText
                  ]}>
                    Min: ₹{method.minAmount}
                  </Text>
                </View>
                {selectedMethod === method.id && (
                  <AntDesign name="checkcircle" size={20} color="#000000" />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Payment Form */}
          {renderPaymentForm()}

          {/* Withdraw Button */}
          <View style={styles.withdrawSection}>
            <LoadingButton
              title="Withdraw Now"
              onPress={handleWithdraw}
              loading={loading}
              loadingText="Processing withdrawal..."
              variant="primary"
              size="large"
              style={styles.withdrawButton}
              loadingColor="#000000"
            />
          </View>

          {/* Clear Cache Button */}
          <View style={styles.clearCacheSection}>
            <TouchableOpacity 
              style={styles.clearCacheButton}
              onPress={() => {
                Alert.alert(
                  'Clear Cache & Re-login',
                  'This will clear all stored data and log you out. Continue?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Clear & Re-login', onPress: () => {
                      forceLogout();
                      navigation.navigate('Login');
                    }}
                  ]
                );
              }}
            >
              <Text style={styles.clearCacheButtonText}>Clear Cache & Re-login</Text>
            </TouchableOpacity>
          </View>

          {/* Recent Withdrawals History */}
          <View style={styles.historySection}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
              <TouchableOpacity
                style={styles.viewAllButton}
                onPress={() => navigation.navigate('WithdrawalHistory')}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {historyLoading ? (
              <View style={styles.historyLoading}>
                <ActivityIndicator size="small" color="#FFD700" />
                <Text style={styles.historyLoadingText}>Loading history...</Text>
              </View>
            ) : withdrawals.length === 0 ? (
              <View style={styles.emptyHistory}>
                <Text style={styles.emptyHistoryText}>No withdrawal history</Text>
              </View>
            ) : (
              withdrawals.slice(0, 2).map((withdrawal) => (
                <View key={withdrawal.id} style={styles.transactionItem}>
                  <View style={styles.transactionInfo}>
                    <Text style={styles.transactionAmount}>{formatAmount(withdrawal.amount)}</Text>
                    <Text style={styles.transactionMethod}>
                      {withdrawal.description || 'Withdrawal Request'}
                    </Text>
                    <Text style={styles.transactionDate}>{formatDate(withdrawal.createdAt)}</Text>
                  </View>
                  <View style={styles.transactionStatus}>
                    {getStatusIcon(withdrawal.status)}
                    <Text style={[styles.transactionStatusText, { color: withdrawal.statusColor }]}>
                      {withdrawal.statusDisplay}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

        </ScrollView>
      </View>

      {/* Withdrawal Success Modal */}
      <SuccessModal
        visible={showWithdrawalSuccess}
        onClose={() => setShowWithdrawalSuccess(false)}
        type="withdrawal"
        title="Withdrawal Requested!"
        message={`Your withdrawal request of ₹${parseFloat(amount || '0').toLocaleString()} has been submitted successfully. It will be processed within 24-48 hours.`}
        buttonText="View Status"
        duration={5000}
      />
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
  historyButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  balanceCard: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  balanceTitle: {
    fontSize: 16,
    color: '#000000',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  pendingAmount: {
    fontSize: 14,
    color: '#333333',
  },
  amountSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currencySymbol: {
    fontSize: 24,
    color: '#FFD700',
    marginRight: 10,
  },
  amountTextInput: {
    flex: 1,
    fontSize: 24,
    color: '#FFFFFF',
    paddingVertical: 15,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  methodsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedMethodCard: {
    backgroundColor: '#FFD700',
  },
  methodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  methodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  selectedMethodText: {
    color: '#000000',
  },
  methodMin: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    marginBottom: 15,
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#FF4444',
    fontSize: 12,
    marginTop: -10,
    marginBottom: 10,
    paddingLeft: 5,
  },
  withdrawSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  withdrawButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  clearCacheSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  clearCacheButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearCacheButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  historySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  transactionMethod: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 12,
    color: '#666666',
  },
  transactionStatus: {
    alignItems: 'flex-end',
    flexDirection: 'row',
    gap: 4,
  },
  transactionStatusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusCompleted: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  viewAllText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: '600',
  },
  historyLoading: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 8,
  },
  historyLoadingText: {
    color: '#ccc',
    fontSize: 14,
  },
  emptyHistory: {
    alignItems: 'center',
    padding: 20,
  },
  emptyHistoryText: {
    color: '#666',
    fontSize: 14,
  },
});

