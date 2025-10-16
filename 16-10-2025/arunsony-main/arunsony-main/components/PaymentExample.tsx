import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { PaymentModal } from './PaymentModal';
import { ActivationPaymentButton } from './ActivationPaymentButton';

interface PaymentExampleProps {
  userId: number;
  userDetails: {
    name: string;
    email: string;
    contact: string;
  };
}

export const PaymentExample: React.FC<PaymentExampleProps> = ({
  userId,
  userDetails,
}) => {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(0);

  const handlePaymentSuccess = (data: any) => {
    console.log('Payment successful:', data);
    Alert.alert('Success', 'Payment completed successfully!');
  };

  const handleActivationSuccess = (data: any) => {
    console.log('Account activated:', data);
    Alert.alert('Success', 'Your account has been activated!');
  };

  const openPaymentModal = (amount: number) => {
    setSelectedAmount(amount);
    setShowPaymentModal(true);
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Payment Integration Example</Text>
      
      {/* Account Activation Payment */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Activation</Text>
        <Text style={styles.sectionDescription}>
          Activate your CQ Wealth account to access all features
        </Text>
        <ActivationPaymentButton
          userId={userId}
          userDetails={userDetails}
          onActivationSuccess={handleActivationSuccess}
        />
      </View>

      {/* Custom Payment Options */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Custom Payments</Text>
        <Text style={styles.sectionDescription}>
          Make payments for different amounts
        </Text>
        
        <View style={styles.paymentOptions}>
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => openPaymentModal(500)}
          >
            <Text style={styles.paymentOptionText}>Pay ₹500</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => openPaymentModal(1000)}
          >
            <Text style={styles.paymentOptionText}>Pay ₹1000</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.paymentOption}
            onPress={() => openPaymentModal(2000)}
          >
            <Text style={styles.paymentOptionText}>Pay ₹2000</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Payment Modal */}
      <PaymentModal
        visible={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentSuccess={handlePaymentSuccess}
        amount={selectedAmount}
        userId={userId}
        userDetails={userDetails}
        description={`Payment for ₹${selectedAmount}`}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  paymentOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  paymentOption: {
    backgroundColor: '#F37254',
    padding: 15,
    borderRadius: 8,
    width: '30%',
    alignItems: 'center',
    marginBottom: 10,
  },
  paymentOptionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
