import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface WithdrawalDetailsScreenProps {
  navigation: any;
  route?: {
    params?: {
      withdrawalId: number;
      withdrawal: any;
    };
  };
}

interface WithdrawalDetails {
  id: number;
  amount: number;
  status: string;
  statusDisplay: string;
  statusColor: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  paymentMethod: string;
  accountDetails: {
    upiId?: string;
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
    bankName?: string;
  };
  transactionId?: string;
  processingTime?: string;
  notes?: string;
}

export default function WithdrawalDetailsScreen({ navigation, route }: WithdrawalDetailsScreenProps) {
  const { user, forceLogout } = useAuth();
  const [withdrawalDetails, setWithdrawalDetails] = useState<WithdrawalDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (route?.params?.withdrawal) {
      // Use passed data if available
      setWithdrawalDetails(route.params.withdrawal);
      setLoading(false);
    } else if (route?.params?.withdrawalId) {
      // Fetch detailed data from backend
      fetchWithdrawalDetails();
    }
  }, [route?.params]);

  const fetchWithdrawalDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId || !route?.params?.withdrawalId) {
        setError('Invalid withdrawal ID');
        return;
      }

      console.log('Fetching withdrawal details for ID:', route.params.withdrawalId);
      const response = await apiServiceAxios.getWithdrawalDetails(
        Number(user.userId), 
        route.params.withdrawalId
      );

      if (response.success && response.data) {
        setWithdrawalDetails(response.data);
        console.log('Withdrawal details loaded:', response.data);
      } else {
        setError(response.error || 'Failed to load withdrawal details');
      }
    } catch (error: any) {
      console.error('Error loading withdrawal details:', error);
      
      // Handle authentication errors
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
        setError('Failed to load withdrawal details. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
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
        return <AntDesign name="checkcircle" size={20} color="#4CAF50" />;
      case 'failed':
        return <AntDesign name="closecircle" size={20} color="#F44336" />;
      case 'pending':
      default:
        return <AntDesign name="clockcircle" size={20} color="#FF9800" />;
    }
  };

  const renderDetailRow = (label: string, value: string, icon?: React.ReactNode) => (
    <View style={styles.detailRow}>
      <View style={styles.detailLabelContainer}>
        {icon}
        <Text style={styles.detailLabel}>{label}</Text>
      </View>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdrawal Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading withdrawal details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !withdrawalDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdrawal Details</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.errorContainer}>
          <AntDesign name="exclamationcircle" size={64} color="#FF4444" />
          <Text style={styles.errorTitle}>Error Loading Details</Text>
          <Text style={styles.errorSubtitle}>{error || 'Withdrawal details not found'}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchWithdrawalDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Withdrawal Details</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusHeader}>
            {getStatusIcon(withdrawalDetails.status)}
            <Text style={styles.statusTitle}>{withdrawalDetails.statusDisplay}</Text>
          </View>
          <Text style={styles.amount}>{formatAmount(withdrawalDetails.amount)}</Text>
          <Text style={styles.description}>{withdrawalDetails.description || 'Withdrawal Request'}</Text>
        </View>

        {/* Transaction Details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Transaction Details</Text>
          
          {renderDetailRow(
            'Transaction ID',
            withdrawalDetails.transactionId || 'Not available',
            <AntDesign name="filetext1" size={16} color="#FFD700" />
          )}
          
          {renderDetailRow(
            'Amount',
            formatAmount(withdrawalDetails.amount),
            <AntDesign name="wallet" size={16} color="#FFD700" />
          )}
          
          {renderDetailRow(
            'Payment Method',
            withdrawalDetails.paymentMethod || 'Not specified',
            <AntDesign name="creditcard" size={16} color="#FFD700" />
          )}
          
          {renderDetailRow(
            'Requested On',
            formatDate(withdrawalDetails.createdAt),
            <AntDesign name="calendar" size={16} color="#FFD700" />
          )}
          
          {withdrawalDetails.updatedAt && withdrawalDetails.updatedAt !== withdrawalDetails.createdAt && 
            renderDetailRow(
              'Last Updated',
              formatDate(withdrawalDetails.updatedAt),
              <AntDesign name="clockcircle" size={16} color="#FFD700" />
            )
          }
          
          {withdrawalDetails.processingTime && 
            renderDetailRow(
              'Processing Time',
              withdrawalDetails.processingTime,
              <AntDesign name="clockcircle" size={16} color="#FFD700" />
            )
          }
        </View>

        {/* Account Details */}
        {withdrawalDetails.accountDetails && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            
            {withdrawalDetails.accountDetails.upiId && 
              renderDetailRow(
                'UPI ID',
                withdrawalDetails.accountDetails.upiId,
                <AntDesign name="mobile1" size={16} color="#FFD700" />
              )
            }
            
            {withdrawalDetails.accountDetails.accountNumber && 
              renderDetailRow(
                'Account Number',
                withdrawalDetails.accountDetails.accountNumber,
                <AntDesign name="creditcard" size={16} color="#FFD700" />
              )
            }
            
            {withdrawalDetails.accountDetails.ifscCode && 
              renderDetailRow(
                'IFSC Code',
                withdrawalDetails.accountDetails.ifscCode,
                <AntDesign name="bank" size={16} color="#FFD700" />
              )
            }
            
            {withdrawalDetails.accountDetails.accountHolderName && 
              renderDetailRow(
                'Account Holder',
                withdrawalDetails.accountDetails.accountHolderName,
                <AntDesign name="user" size={16} color="#FFD700" />
              )
            }
            
            {withdrawalDetails.accountDetails.bankName && 
              renderDetailRow(
                'Bank Name',
                withdrawalDetails.accountDetails.bankName,
                <AntDesign name="bank" size={16} color="#FFD700" />
              )
            }
          </View>
        )}

        {/* Additional Notes */}
        {withdrawalDetails.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesContainer}>
              <Text style={styles.notesText}>{withdrawalDetails.notes}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#2a2a2a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#ccc',
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    marginBottom: 5,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  statusCard: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 20,
    marginVertical: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  amount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  detailLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 14,
    color: '#ccc',
    marginLeft: 8,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    textAlign: 'right',
    flex: 1,
  },
  notesContainer: {
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  notesText: {
    fontSize: 14,
    color: '#ccc',
    lineHeight: 20,
  },
});
