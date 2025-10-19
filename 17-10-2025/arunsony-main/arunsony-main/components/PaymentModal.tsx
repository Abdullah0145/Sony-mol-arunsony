import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { razorpayService } from '../services/razorpayService';

interface PaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (data: any) => void;
  amount: number;
  userId: number;
  userDetails: {
    name: string;
    email: string;
    contact: string;
  };
  description?: string;
  isActivationPayment?: boolean;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  amount,
  userId,
  userDetails,
  description = 'CQ Wealth Payment',
  isActivationPayment = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(userDetails.contact);

  const handlePayment = async () => {
    if (!contact.trim()) {
      Alert.alert('Error', 'Please enter your contact number');
      return;
    }

    setLoading(true);
    
    try {
      const updatedUserDetails = {
        ...userDetails,
        contact: contact.trim(),
      };

      let result;
      
      if (isActivationPayment) {
        result = await razorpayService.processActivationPayment(userId, updatedUserDetails);
      } else {
        result = await razorpayService.processPayment(amount, userId, updatedUserDetails, description);
      }

      if (result.success) {
        Alert.alert(
          'Payment Successful',
          result.message,
          [
            {
              text: 'OK',
              onPress: () => {
                onPaymentSuccess(result.data);
                onClose();
              },
            },
          ]
        );
      } else {
        Alert.alert('Payment Failed', result.message);
      }
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Error', 'An unexpected error occurred during payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {isActivationPayment ? 'Account Activation Payment' : 'Payment'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Amount</Text>
              <Text style={styles.amount}>₹{amount}</Text>
            </View>

            <View style={styles.userInfoContainer}>
              <Text style={styles.userInfoLabel}>Payment Details</Text>
              <Text style={styles.userInfo}>Name: {userDetails.name}</Text>
              <Text style={styles.userInfo}>Email: {userDetails.email}</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Contact Number *</Text>
                <TextInput
                  style={styles.input}
                  value={contact}
                  onChangeText={setContact}
                  placeholder="Enter your contact number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>

            {description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionLabel}>Description</Text>
                <Text style={styles.description}>{description}</Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handlePayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>
                  {isActivationPayment ? 'Activate Account - ₹1 (Test)' : `Pay ₹${amount}`}
                </Text>
              )}
            </TouchableOpacity>

            <Text style={styles.securityNote}>
              🔒 Your payment is secured by Razorpay
            </Text>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: '90%',
    maxWidth: 400,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
  },
  content: {
    padding: 20,
  },
  amountContainer: {
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  amountLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  amount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2e7d32',
  },
  userInfoContainer: {
    marginBottom: 20,
  },
  userInfoLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  inputContainer: {
    marginTop: 10,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  descriptionContainer: {
    marginBottom: 20,
    padding: 10,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
  },
  payButton: {
    backgroundColor: '#F37254',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  payButtonDisabled: {
    backgroundColor: '#ccc',
  },
  payButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
  },
});
