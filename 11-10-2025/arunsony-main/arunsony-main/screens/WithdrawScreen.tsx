import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface WithdrawScreenProps {
  navigation: any;
}

export default function WithdrawScreen({ navigation }: WithdrawScreenProps) {
  const { user, forceLogout } = useAuth();
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [amount, setAmount] = useState('');
  const [upiId, setUpiId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [accountName, setAccountName] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);

  const paymentMethods = [
    { id: 'UPI', name: 'UPI Transfer', icon: 'mobile1', minAmount: 100 },
    { id: 'BANK', name: 'Bank Transfer', icon: 'bank', minAmount: 500 },
    { id: 'PAYTM', name: 'Paytm Wallet', icon: 'wallet', minAmount: 50 },
    { id: 'GPAY', name: 'Google Pay', icon: 'wallet', minAmount: 100 },
  ];

  const quickAmounts = [500, 1000, 2000, 5000];

  // Load user balance on component mount
  useEffect(() => {
    loadUserBalance();
  }, []);

  const loadUserBalance = async () => {
    try {
      // Fetch real-time balance from backend
      const response = await apiServiceAxios.getProfile();
      if (response.success && response.data) {
        const updatedBalance = response.data.walletBalance || 0;
        setAvailableBalance(updatedBalance);
        console.log('✅ Updated wallet balance from backend:', updatedBalance);
      } else if (user?.walletBalance !== undefined) {
        // Fallback to cached balance if API fails
        setAvailableBalance(user.walletBalance);
        console.log('⚠️ Using cached wallet balance:', user.walletBalance);
      }
      // TODO: Load pending withdrawal amount from API
      setPendingAmount(0);
    } catch (error) {
      console.error('Error loading user balance:', error);
      // Fallback to cached balance on error
      if (user?.walletBalance !== undefined) {
        setAvailableBalance(user.walletBalance);
      }
    }
  };

  const submitWithdrawalRequest = async (withdrawAmount: number, methodName: string) => {
    try {
      setLoading(true);
      
      const description = `Withdrawal via ${methodName}`;
      const response = await apiServiceAxios.createWithdrawalRequest(
        withdrawAmount,
        description,
        selectedMethod
      );

      if (response.success) {
        const newBalance = response.data?.newBalance || 'Updated';
        Alert.alert(
          'Success', 
          `Withdrawal request submitted successfully!\nNew balance: ₹${newBalance}`
        );
        setAmount('');
        // Refresh balance
        await loadUserBalance();
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

  const handleWithdraw = async () => {
    const withdrawAmount = parseInt(amount);
    
    if (!amount || withdrawAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (withdrawAmount > availableBalance) {
      Alert.alert('Error', 'Insufficient balance');
      return;
    }

    const selectedMethodData = paymentMethods.find(m => m.id === selectedMethod);
    if (withdrawAmount < selectedMethodData!.minAmount) {
      Alert.alert('Error', `Minimum withdrawal amount is ₹${selectedMethodData!.minAmount}`);
      return;
    }

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
            <Text style={styles.formLabel}>UPI ID</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter UPI ID (e.g., user@upi)"
              placeholderTextColor="#666666"
              value={upiId}
              onChangeText={setUpiId}
            />
          </View>
        );
      case 'BANK':
        return (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Account Holder Name</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter account holder name"
              placeholderTextColor="#666666"
              value={accountName}
              onChangeText={setAccountName}
            />
            <Text style={styles.formLabel}>Account Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter account number"
              placeholderTextColor="#666666"
              value={accountNumber}
              onChangeText={setAccountNumber}
              keyboardType="numeric"
            />
            <Text style={styles.formLabel}>IFSC Code</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter IFSC code"
              placeholderTextColor="#666666"
              value={ifscCode}
              onChangeText={setIfscCode}
              autoCapitalize="characters"
            />
          </View>
        );
      default:
        return (
          <View style={styles.formSection}>
            <Text style={styles.formLabel}>Mobile Number</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Enter mobile number"
              placeholderTextColor="#666666"
              keyboardType="phone-pad"
            />
          </View>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
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
            <Text style={styles.pendingAmount}>Pending: ₹{pendingAmount}</Text>
          </View>

          {/* Amount Input */}
          <View style={styles.amountSection}>
            <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
            
            <View style={styles.amountInput}>
              <Text style={styles.currencySymbol}>₹</Text>
              <TextInput
                style={styles.amountTextInput}
                placeholder="Enter amount"
                placeholderTextColor="#666666"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
              />
            </View>

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
            <TouchableOpacity 
              style={[styles.withdrawButton, loading && styles.disabledButton]}
              onPress={handleWithdraw}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#000" size="small" />
              ) : (
                <Text style={styles.withdrawButtonText}>Withdraw Now</Text>
              )}
            </TouchableOpacity>
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

          {/* Transaction History */}
          <View style={styles.historySection}>
            <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
            
            <View style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionAmount}>₹2,000</Text>
                <Text style={styles.transactionMethod}>UPI Transfer</Text>
                <Text style={styles.transactionDate}>2 days ago</Text>
              </View>
              <View style={styles.transactionStatus}>
                <Text style={styles.statusCompleted}>Completed</Text>
              </View>
            </View>

            <View style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionAmount}>₹1,500</Text>
                <Text style={styles.transactionMethod}>Bank Transfer</Text>
                <Text style={styles.transactionDate}>1 week ago</Text>
              </View>
              <View style={styles.transactionStatus}>
                <Text style={styles.statusCompleted}>Completed</Text>
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
  },
  statusCompleted: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

