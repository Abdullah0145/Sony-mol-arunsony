import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from './AuthContext';

interface PaymentGuardProps {
  children: React.ReactNode;
  navigation: any;
  fallbackScreen?: string;
}

export default function PaymentGuard({ children, navigation, fallbackScreen = 'Products' }: PaymentGuardProps) {
  const { hasPaid, user } = useAuth();

  // Check if user has full access (either paid or has referral code)
  const hasFullAccess = hasPaid || (user?.refer || user?.referralCode);
  
  console.log('PaymentGuard - Access Check:', {
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

  const handleGoBack = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleGoBack}
          >
            <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Payment Required</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Main Content */}
        <View style={styles.mainContent}>
          {/* Lock Icon */}
          <View style={styles.lockContainer}>
            <AntDesign name="lock" size={80} color="#FFD700" />
          </View>

          {/* Title */}
          <Text style={styles.title}>Premium Access Required</Text>
          
          {/* Description */}
          <Text style={styles.description}>
            To access this feature, you need to make your first payment of ₹1,000 to unlock all premium features and start earning.
          </Text>

          {/* Benefits List */}
          <View style={styles.benefitsContainer}>
            <Text style={styles.benefitsTitle}>What you'll get:</Text>
            
            <View style={styles.benefitItem}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Full access to all features</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Start earning commissions</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Access to premium products</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Referral rewards system</Text>
            </View>
            
            <View style={styles.benefitItem}>
              <AntDesign name="checkcircle" size={20} color="#4CAF50" />
              <Text style={styles.benefitText}>Withdrawal capabilities</Text>
            </View>
          </View>

          {/* User Info */}
          {user && (
            <View style={styles.userInfo}>
              <Text style={styles.userInfoText}>
                Welcome, {user.name || user.fullName || 'Member'}!
              </Text>
              <Text style={styles.userInfoSubtext}>
                Complete your payment to unlock your earning potential
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
              style={styles.backButtonSecondary}
              onPress={handleGoBack}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoText}>
              💡 This is a one-time payment to activate your account and start earning
            </Text>
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
  mainContent: {
    flex: 1,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lockContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  benefitsContainer: {
    width: '100%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 12,
    flex: 1,
  },
  userInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
    width: '100%',
    alignItems: 'center',
  },
  userInfoText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  userInfoSubtext: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionButtons: {
    width: '100%',
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
    marginBottom: 15,
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
  backButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  additionalInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
    width: '100%',
  },
  additionalInfoText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 18,
  },
});
