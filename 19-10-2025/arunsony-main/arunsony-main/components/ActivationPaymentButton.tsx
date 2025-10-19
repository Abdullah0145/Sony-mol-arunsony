import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { PaymentModal } from './PaymentModal';
import { razorpayService } from '../services/razorpayService';

interface ActivationPaymentButtonProps {
  userId: number;
  userDetails: {
    name: string;
    email: string;
    contact: string;
  };
  onActivationSuccess: (data: any) => void;
  disabled?: boolean;
  style?: any;
}

export const ActivationPaymentButton: React.FC<ActivationPaymentButtonProps> = ({
  userId,
  userDetails,
  onActivationSuccess,
  disabled = false,
  style,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleActivationPayment = async () => {
    if (disabled) return;
    
    setLoading(true);
    try {
      const result = await razorpayService.processActivationPayment(userId, userDetails);
      
      if (result.success) {
        Alert.alert(
          'Account Activated!',
          'Your MLM account has been successfully activated. You can now access all features.',
          [
            {
              text: 'OK',
              onPress: () => onActivationSuccess(result.data),
            },
          ]
        );
      } else {
        Alert.alert('Activation Failed', result.message);
      }
    } catch (error) {
      console.error('Activation payment error:', error);
      Alert.alert('Error', 'Failed to process activation payment');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (data: any) => {
    onActivationSuccess(data);
  };

  return (
    <>
      <TouchableOpacity
        style={[
          styles.activationButton,
          disabled && styles.activationButtonDisabled,
          style,
        ]}
        onPress={() => setShowPaymentModal(true)}
        disabled={disabled || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <>
            <Text style={styles.activationButtonText}>
              Activate Account
            </Text>
            <Text style={styles.activationButtonSubtext}>
              Pay ₹1 to unlock all features (Test)
            </Text>
          </>
        )}
      </TouchableOpacity>

      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={1}
        userId={userId}
        userDetails={userDetails}
        description="MLM Account Activation Payment (Test - ₹1)"
        isActivationPayment={true}
      />
    </>
  );
};

const styles = StyleSheet.create({
  activationButton: {
    backgroundColor: '#2e7d32',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginVertical: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activationButtonDisabled: {
    backgroundColor: '#ccc',
  },
  activationButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  activationButtonSubtext: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.9,
  },
});
