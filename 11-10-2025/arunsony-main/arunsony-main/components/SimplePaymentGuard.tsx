import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from './AuthContext';

interface SimplePaymentGuardProps {
  children: React.ReactNode;
  navigation: any;
}

export default function SimplePaymentGuard({ children, navigation }: SimplePaymentGuardProps) {
  const { hasPaid, updatePaymentStatus, user } = useAuth();

  // Check if user has full access (either paid or has referral code)
  const hasFullAccess = hasPaid || (user?.refer || user?.referralCode);
  
  console.log('SimplePaymentGuard - Access Check:', {
    hasPaid,
    hasReferralCode: !!(user?.refer || user?.referralCode),
    referralCode: user?.refer || user?.referralCode,
    hasFullAccess
  });

  // If user has full access (paid or has referral code), show the protected content
  if (hasFullAccess) {
    return <>{children}</>;
  }

  // If user hasn't paid, show payment required screen
  const handleMakePayment = () => {
    navigation.navigate('Products');
  };

  const handleTestFullAccess = () => {
    Alert.alert(
      'Test Full Access',
      'This will give you full access for testing purposes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Grant Full Access',
          onPress: () => {
            updatePaymentStatus(true);
            Alert.alert(
              'Full Access Granted!',
              'You now have full access to all features.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleTestLimitedAccess = () => {
    Alert.alert(
      'Test Limited Access',
      'This will set limited access for testing purposes.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Set Limited Access',
          onPress: () => {
            updatePaymentStatus(false);
            Alert.alert(
              'Limited Access Set!',
              'You now have limited access.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Payment Required</Text>
          <Text style={styles.headerSubtitle}>Complete your setup to access this feature</Text>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          
          {/* Status */}
          <View style={styles.statusCard}>
            <AntDesign name="lock" size={40} color="#FFD700" />
            <Text style={styles.statusTitle}>Premium Feature</Text>
            <Text style={styles.statusText}>
              This feature requires a one-time payment of ₹1,000 to activate your account.
            </Text>
          </View>

          {/* User Info */}
          {user && (
            <View style={styles.userCard}>
              <Text style={styles.userText}>
                Welcome, {user.name || user.fullName || 'Member'}!
              </Text>
              <Text style={styles.userSubtext}>
                Complete your payment to unlock all features
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity 
              style={styles.paymentButton}
              onPress={handleMakePayment}
            >
              <AntDesign name="creditcard" size={20} color="#000000" />
              <Text style={styles.paymentButtonText}>Make Payment - ₹1,000</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={handleTestFullAccess}
            >
              <AntDesign name="unlock" size={20} color="#4CAF50" />
              <Text style={styles.testButtonText}>Test: Grant Full Access</Text>
            </TouchableOpacity>
          </View>

          {/* Test Controls */}
          <View style={styles.testSection}>
            <Text style={styles.testTitle}>🧪 Testing Controls</Text>
            <View style={styles.testButtons}>
              <TouchableOpacity 
                style={styles.testFullButton}
                onPress={handleTestFullAccess}
              >
                <Text style={styles.testFullButtonText}>Full Access</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.testLimitedButton}
                onPress={handleTestLimitedAccess}
              >
                <Text style={styles.testLimitedButtonText}>Limited Access</Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  mainContent: {
    flex: 1,
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  statusTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginTop: 15,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  userCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
  },
  userText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  userSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionButtons: {
    marginBottom: 20,
  },
  paymentButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#FFD700',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  paymentButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  testButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  testButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  testSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  testTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  testButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  testFullButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testFullButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  testLimitedButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  testLimitedButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
