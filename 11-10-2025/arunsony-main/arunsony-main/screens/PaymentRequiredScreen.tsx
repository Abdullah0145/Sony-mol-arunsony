import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { PaymentModal } from '../components/PaymentModal';
import { TestPaymentModal } from '../components/TestPaymentModal';

interface PaymentRequiredScreenProps {
  navigation: any;
}

export default function PaymentRequiredScreen({ navigation }: PaymentRequiredScreenProps) {
  const { user, updatePaymentStatus, hasPaid, logout } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTestPaymentModal, setShowTestPaymentModal] = useState(false);

  const handleMakePayment = () => {
    // Use real Razorpay integration
    if (user) {
      // Show payment modal with real Razorpay integration
      setShowPaymentModal(true);
    } else {
      Alert.alert('Error', 'User information not available. Please login again.');
    }
  };

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
    setShowPaymentModal(false);
    updatePaymentStatus(true);
    Alert.alert(
      'Payment Successful!',
      'Welcome to CQ Wealth! You now have full access to all features.',
      [
        {
          text: 'OK',
          onPress: () => {
            // The app will automatically switch to MainNavigator due to hasPaid state change
            console.log('Payment completed, switching to full access');
          },
        },
      ]
    );
  };

  const handleTestPayment = () => {
    if (user) {
      setShowTestPaymentModal(true);
    } else {
      Alert.alert('Error', 'User information not available. Please login again.');
    }
  };

  const handleTestPaymentSuccess = (data: any) => {
    console.log('Test payment successful:', data);
    setShowTestPaymentModal(false);
    updatePaymentStatus(true); // Update payment status after successful test payment
    Alert.alert(
      'Test Payment Successful!',
      'Payment of ₹1 completed successfully! You now have full access to all features.',
      [
        {
          text: 'OK',
          onPress: () => {
            console.log('Test payment completed successfully, user now has full access');
          },
        },
      ]
    );
  };

  const handleLogout = () => {
    // Use AuthContext logout instead of navigation
    // This will automatically switch to AuthNavigator
    logout();
  };


  const handleTestFullAccess = () => {
    Alert.alert(
      'Test Full Access',
      'This will simulate having full access without payment for testing purposes.',
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
              'You now have full access to all features for testing.',
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
      'This will simulate limited access (no payment made) for testing purposes.',
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
              'You now have limited access for testing.',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Welcome to CQ Wealth</Text>
          <Text style={styles.headerSubtitle}>Complete your setup to start earning</Text>
          
          {/* Status Indicator */}
          <View style={styles.statusIndicator}>
            <View style={[styles.statusDot, { backgroundColor: hasPaid ? '#4CAF50' : '#FF9800' }]} />
            <Text style={styles.statusText}>
              Current Access: {hasPaid ? 'Full Access' : 'Limited Access'}
            </Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          
          {/* Welcome Message */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIcon}>
              <AntDesign name="star" size={40} color="#FFD700" />
            </View>
            <Text style={styles.welcomeTitle}>Welcome, {user?.name || user?.fullName || 'Member'}!</Text>
            <Text style={styles.welcomeText}>
              You're almost ready to start your wealth building journey. Complete your first payment to unlock all features and start earning.
            </Text>
          </View>

          {/* Payment Card */}
          <View style={styles.paymentCard}>
            <View style={styles.paymentHeader}>
              <AntDesign name="creditcard" size={24} color="#FFD700" />
              <Text style={styles.paymentTitle}>Activation Payment</Text>
            </View>
            
            <View style={styles.paymentAmount}>
              <Text style={styles.amountLabel}>One-time Payment</Text>
              <Text style={styles.amountValue}>₹1,000</Text>
            </View>
            
            <Text style={styles.paymentDescription}>
              This payment activates your account and gives you access to all premium features, products, and earning opportunities.
            </Text>
          </View>

          {/* Benefits Section */}
          <View style={styles.benefitsSection}>
            <Text style={styles.benefitsTitle}>What you'll unlock:</Text>
            
            <View style={styles.benefitsList}>
              <View style={styles.benefitItem}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Full Dashboard Access</Text>
                  <Text style={styles.benefitDescription}>Complete access to your earnings, referrals, and analytics</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Commission Earnings</Text>
                  <Text style={styles.benefitDescription}>Start earning commissions from your referrals and team</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Premium Products</Text>
                  <Text style={styles.benefitDescription}>Access to exclusive products and member benefits</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Withdrawal System</Text>
                  <Text style={styles.benefitDescription}>Withdraw your earnings to your bank account</Text>
                </View>
              </View>
              
              <View style={styles.benefitItem}>
                <AntDesign name="checkcircle" size={20} color="#4CAF50" />
                <View style={styles.benefitContent}>
                  <Text style={styles.benefitTitle}>Referral Rewards</Text>
                  <Text style={styles.benefitDescription}>Earn bonuses for bringing new members to the platform</Text>
                </View>
              </View>
            </View>
          </View>

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
              style={styles.testPaymentButton}
              onPress={handleTestPayment}
            >
              <AntDesign name="setting" size={20} color="#FFD700" />
              <Text style={styles.testPaymentButtonText}>Test Payment - ₹1</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.logoutButton}
              onPress={handleLogout}
            >
              <Text style={styles.logoutButtonText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Test Buttons Section */}
          <View style={styles.testSection}>
            <Text style={styles.testSectionTitle}>🧪 Testing Controls</Text>
            <Text style={styles.testSectionSubtitle}>Use these buttons to test different access levels</Text>
            
            <View style={styles.testButtons}>
              <TouchableOpacity 
                style={styles.testFullAccessButton}
                onPress={handleTestFullAccess}
              >
                <AntDesign name="unlock" size={16} color="#4CAF50" />
                <Text style={styles.testFullAccessButtonText}>Grant Full Access</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.testLimitedAccessButton}
                onPress={handleTestLimitedAccess}
              >
                <AntDesign name="lock" size={16} color="#FF9800" />
                <Text style={styles.testLimitedAccessButtonText}>Set Limited Access</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.testButtons}>
              <TouchableOpacity 
                style={styles.testNavigationButton}
                onPress={() => {
                  console.log('Navigation object:', navigation);
                  if (navigation && navigation.navigate) {
                    console.log('Attempting to navigate to Products');
                    navigation.navigate('Products');
                  } else {
                    console.log('Navigation not available');
                    Alert.alert('Navigation Error', 'Navigation not available. This is expected in some contexts.');
                  }
                }}
              >
                <AntDesign name="shoppingcart" size={16} color="#2196F3" />
                <Text style={styles.testNavigationButtonText}>Test Navigation to Products</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <AntDesign name="checkcircle" size={16} color="#4CAF50" />
            <Text style={styles.securityText}>
              Your payment is secure and processed through trusted payment gateways
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Payment Modal */}
      {user && (
        <PaymentModal
          visible={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onPaymentSuccess={handlePaymentSuccess}
          amount={1}
          userId={user.id || 1}
          userDetails={{
            name: user.name || user.fullName || 'User',
            email: user.email || 'user@example.com',
            contact: user.phoneNumber || user.phone || '9876543210',
          }}
          description="CQ Wealth Account Activation Payment (Test - ₹1)"
          isActivationPayment={true}
        />
      )}

      {/* Test Payment Modal */}
      {user && (
        <TestPaymentModal
          visible={showTestPaymentModal}
          onClose={() => setShowTestPaymentModal(false)}
          onPaymentSuccess={handleTestPaymentSuccess}
          userId={user.id || 1}
          userDetails={{
            name: user.name || user.fullName || 'User',
            email: user.email || 'user@example.com',
            contact: user.phoneNumber || user.phone || '9876543210',
          }}
        />
      )}
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
    padding: 20,
    paddingBottom: 10,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  mainContent: {
    padding: 20,
  },
  welcomeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  welcomeIcon: {
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  welcomeText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  paymentAmount: {
    alignItems: 'center',
    marginBottom: 15,
  },
  amountLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  amountValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  paymentDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  benefitsSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitsList: {
    gap: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  benefitContent: {
    flex: 1,
    marginLeft: 12,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  benefitDescription: {
    fontSize: 12,
    color: '#CCCCCC',
    lineHeight: 16,
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
  testPaymentButton: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 12,
  },
  testPaymentButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logoutButton: {
    backgroundColor: 'transparent',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#666666',
    fontSize: 16,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    borderWidth: 1,
    borderColor: '#4CAF50',
  },
  securityText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 8,
    flex: 1,
  },
  testSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  testSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
    textAlign: 'center',
  },
  testSectionSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 15,
  },
  testButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  testFullAccessButton: {
    flex: 1,
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testFullAccessButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testLimitedAccessButton: {
    flex: 1,
    backgroundColor: '#FF9800',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testLimitedAccessButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  testNavigationButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  testNavigationButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});
