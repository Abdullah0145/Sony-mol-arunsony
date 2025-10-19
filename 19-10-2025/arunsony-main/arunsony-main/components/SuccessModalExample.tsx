/**
 * EXAMPLE: How to use SuccessModal in your screens
 * 
 * This file shows practical examples of integrating SuccessModal
 * into different screens in your app.
 */

import React, { useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import SuccessModal from './SuccessModal';

// ============================================
// EXAMPLE 1: Payment Success in Checkout Screen
// ============================================
export function CheckoutScreenExample() {
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  const handlePaymentSuccess = async () => {
    // Your payment logic here
    // After successful payment:
    setShowPaymentSuccess(true);
  };

  return (
    <View>
      {/* Your checkout UI */}
      
      <TouchableOpacity onPress={handlePaymentSuccess}>
        <Text>Pay Now</Text>
      </TouchableOpacity>

      {/* Payment Success Modal */}
      <SuccessModal
        visible={showPaymentSuccess}
        onClose={() => {
          setShowPaymentSuccess(false);
          // Navigate to orders screen
          // navigation.navigate('Orders');
        }}
        type="payment"
        title="Payment Successful!"
        message="Your payment has been processed successfully"
        buttonText="View Order"
        duration={4000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 2: Order Confirmation
// ============================================
export function OrderConfirmationExample() {
  const [showOrderConfirmed, setShowOrderConfirmed] = useState(false);

  const handleOrderPlacement = async () => {
    // Your order placement logic
    setShowOrderConfirmed(true);
  };

  return (
    <View>
      <SuccessModal
        visible={showOrderConfirmed}
        onClose={() => setShowOrderConfirmed(false)}
        type="order"
        title="Order Confirmed!"
        message="Your order has been placed successfully"
        buttonText="Track Order"
        duration={5000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 3: Withdrawal Request
// ============================================
export function WithdrawalExample() {
  const [showWithdrawalSuccess, setShowWithdrawalSuccess] = useState(false);
  const [withdrawalAmount] = useState(5000);

  const handleWithdrawal = async () => {
    // Your withdrawal logic
    setShowWithdrawalSuccess(true);
  };

  return (
    <View>
      <SuccessModal
        visible={showWithdrawalSuccess}
        onClose={() => setShowWithdrawalSuccess(false)}
        type="withdrawal"
        title="Withdrawal Requested!"
        message={`Your withdrawal request of ₹${withdrawalAmount} has been submitted. It will be processed within 24-48 hours.`}
        buttonText="View Status"
        duration={5000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 4: Login Success
// ============================================
export function LoginSuccessExample() {
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  const handleLogin = async () => {
    // Your login logic
    setShowLoginSuccess(true);
  };

  return (
    <View>
      <SuccessModal
        visible={showLoginSuccess}
        onClose={() => {
          setShowLoginSuccess(false);
          // Navigate to dashboard
          // navigation.navigate('Dashboard');
        }}
        type="login"
        title="Welcome Back!"
        message="You have successfully logged in"
        buttonText="Get Started"
        duration={2000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 5: OTP Verification
// ============================================
export function OTPVerificationExample() {
  const [showOTPSuccess, setShowOTPSuccess] = useState(false);

  const handleOTPVerification = async () => {
    // Your OTP verification logic
    setShowOTPSuccess(true);
  };

  return (
    <View>
      <SuccessModal
        visible={showOTPSuccess}
        onClose={() => {
          setShowOTPSuccess(false);
          // Navigate to next screen
          // navigation.navigate('Dashboard');
        }}
        type="otp"
        title="OTP Verified!"
        message="Your phone number has been verified successfully"
        buttonText="Continue"
        duration={2000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 6: Custom Success (Account Activation)
// ============================================
export function AccountActivationExample() {
  const [showActivationSuccess, setShowActivationSuccess] = useState(false);

  const handleActivation = async () => {
    // Your activation logic
    setShowActivationSuccess(true);
  };

  return (
    <View>
      <SuccessModal
        visible={showActivationSuccess}
        onClose={() => setShowActivationSuccess(false)}
        type="custom"
        title="Account Activated!"
        message="Congratulations! Your MLM account has been activated successfully. Start earning now!"
        icon="star"
        buttonText="Start Earning"
        duration={4000}
      />
    </View>
  );
}

// ============================================
// EXAMPLE 7: Complete Checkout Flow with Success Modal
// ============================================
export function CompleteCheckoutExample() {
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [orderAmount] = useState(1000);

  const handleCompletePayment = async (paymentData) => {
    try {
      // Verify payment with backend
      const response = await verifyPayment(paymentData);
      
      if (response.success) {
        // Show success modal
        setShowPaymentSuccess(true);
        
        // Navigate to orders after 3 seconds
        setTimeout(() => {
          // navigation.navigate('Orders');
        }, 3000);
      }
    } catch (error) {
      console.error('Payment failed:', error);
    }
  };

  return (
    <View>
      {/* Your checkout form */}
      
      <SuccessModal
        visible={showPaymentSuccess}
        onClose={() => {
          setShowPaymentSuccess(false);
          // navigation.navigate('Orders');
        }}
        type="payment"
        title="Payment Successful!"
        message={`Your payment of ₹${orderAmount} has been processed successfully. Order ID: ORD123`}
        buttonText="View Order"
        duration={4000}
      />
    </View>
  );
}

// Helper function (mock)
async function verifyPayment(paymentData: any) {
  // Your payment verification logic
  return { success: true };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});

