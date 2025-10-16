import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface WithdrawalHistoryScreenProps {
  navigation: any;
}

interface Withdrawal {
  id: number;
  amount: number;
  status: string;
  statusDisplay: string;
  statusColor: string;
  description: string;
  createdAt: string;
}

export default function WithdrawalHistoryScreen({ navigation }: WithdrawalHistoryScreenProps) {
  const { user, forceLogout } = useAuth();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWithdrawalHistory();
  }, []);

  const loadWithdrawalHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.userId) {
        setError('User not found');
        return;
      }

      console.log('Loading withdrawal history for user:', user.userId);
      const response = await apiServiceAxios.getUserWithdrawals(Number(user.userId));

      if (response.success && response.data) {
        setWithdrawals(response.data.withdrawals || []);
        console.log('Withdrawal history loaded:', response.data.withdrawals?.length || 0, 'records');
      } else {
        setError(response.error || 'Failed to load withdrawal history');
      }
    } catch (error: any) {
      console.error('Error loading withdrawal history:', error);
      
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
        setError('Failed to load withdrawal history. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawalHistory();
    setRefreshing(false);
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
        return <AntDesign name="checkcircle" size={14} color="#FFFFFF" />;
      case 'failed':
        return <AntDesign name="closecircle" size={14} color="#FFFFFF" />;
      case 'pending':
      default:
        return <AntDesign name="clockcircle" size={14} color="#FFFFFF" />;
    }
  };

  const renderWithdrawalItem = (withdrawal: Withdrawal) => (
    <View key={withdrawal.id} style={styles.withdrawalItem}>
      <View style={styles.withdrawalHeader}>
        <Text style={styles.amount}>{formatAmount(withdrawal.amount)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: withdrawal.statusColor }]}>
          {getStatusIcon(withdrawal.status)}
          <Text style={styles.statusText}>
            {withdrawal.statusDisplay}
          </Text>
        </View>
      </View>
      
      <Text style={styles.description}>
        {withdrawal.description || 'Withdrawal Request'}
      </Text>
      
      <Text style={styles.date}>
        {formatDate(withdrawal.createdAt)}
      </Text>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <AntDesign name="wallet" size={64} color="#666" />
      <Text style={styles.emptyTitle}>No Withdrawal History</Text>
      <Text style={styles.emptySubtitle}>
        You haven't made any withdrawal requests yet.
      </Text>
      <TouchableOpacity
        style={styles.createWithdrawalButton}
        onPress={() => navigation.navigate('Withdraw')}
      >
        <Text style={styles.createWithdrawalButtonText}>Make Withdrawal</Text>
      </TouchableOpacity>
    </View>
  );

  const renderErrorState = () => (
    <View style={styles.errorState}>
      <AntDesign name="exclamationcircle" size={64} color="#FF4444" />
      <Text style={styles.errorTitle}>Error Loading History</Text>
      <Text style={styles.errorSubtitle}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={loadWithdrawalHistory}
      >
        <Text style={styles.retryButtonText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Withdrawal History</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading withdrawal history...</Text>
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
        <Text style={styles.headerTitle}>Withdrawal History</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <AntDesign name="reload1" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
            colors={['#FFD700']}
          />
        }
      >
        {error ? (
          renderErrorState()
        ) : withdrawals.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.withdrawalsList}>
            <Text style={styles.sectionTitle}>Recent Withdrawals</Text>
            {withdrawals.map(renderWithdrawalItem)}
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
  refreshButton: {
    padding: 8,
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
  },
  loadingText: {
    color: '#fff',
    marginTop: 16,
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 15,
  },
  withdrawalsList: {
    paddingBottom: 20,
  },
  withdrawalItem: {
    backgroundColor: '#2a2a2a',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  withdrawalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
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
  description: {
    fontSize: 14,
    color: '#ccc',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#888',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  createWithdrawalButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createWithdrawalButtonText: {
    color: '#000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF4444',
    marginTop: 20,
    marginBottom: 8,
  },
  errorSubtitle: {
    fontSize: 16,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#FF4444',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
