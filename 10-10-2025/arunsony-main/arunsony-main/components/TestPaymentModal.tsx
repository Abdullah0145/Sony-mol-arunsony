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

interface TestPaymentModalProps {
  visible: boolean;
  onClose: () => void;
  onPaymentSuccess: (data: any) => void;
  userId: number;
  userDetails: {
    name: string;
    email: string;
    contact: string;
  };
}

export const TestPaymentModal: React.FC<TestPaymentModalProps> = ({
  visible,
  onClose,
  onPaymentSuccess,
  userId,
  userDetails,
}) => {
  const [loading, setLoading] = useState(false);
  const [contact, setContact] = useState(userDetails.contact);

  const handleTestPayment = async () => {
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

      // Use ₹1 for testing instead of ₹1000
      const result = await razorpayService.processPayment(
        1, // ₹1 for testing
        userId,
        updatedUserDetails,
        'Test Payment - ₹1'
      );

      if (result.success) {
        Alert.alert(
          'Test Payment Successful!',
          'Payment of ₹1 completed successfully! This is just for testing.',
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
        Alert.alert('Test Payment Failed', result.message);
      }
    } catch (error) {
      console.error('Test payment error:', error);
      Alert.alert('Error', 'An unexpected error occurred during test payment');
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
            <Text style={styles.title}>Test Payment - ₹1</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            <View style={styles.amountContainer}>
              <Text style={styles.amountLabel}>Test Amount</Text>
              <Text style={styles.amount}>₹1</Text>
              <Text style={styles.testNote}>This is just for testing the payment flow</Text>
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

            <View style={styles.warningContainer}>
              <Text style={styles.warningTitle}>⚠️ Test Payment</Text>
              <Text style={styles.warningText}>
                This is a test payment of ₹1 to verify the payment flow works correctly.
                In production, the activation payment would be ₹1000.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.payButton, loading && styles.payButtonDisabled]}
              onPress={handleTestPayment}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payButtonText}>Test Payment - ₹1</Text>
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
    backgroundColor: '#e8f5e8',
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
  testNote: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 5,
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
  warningContainer: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 5,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
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
