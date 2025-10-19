import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiServiceAxios } from '../services/api-axios';
import SuccessModal from '../components/SuccessModal';

interface ForgotPasswordScreenProps {
  navigation: any;
}

export default function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showOTPSentSuccess, setShowOTPSentSuccess] = useState(false);

  const handleSendOtp = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    console.log('🔐 Forgot Password: Starting OTP request for email:', email);
    setIsLoading(true);
    
    try {
      console.log('🔐 Forgot Password: Calling API service...');
      const response = await apiServiceAxios.forgotPassword(email);
      console.log('🔐 Forgot Password: API response:', response);
      
      if (response.success) {
        console.log('🔐 Forgot Password: Success! Showing success modal');
        // Show success modal
        setShowOTPSentSuccess(true);
      } else {
        console.log('🔐 Forgot Password: API returned error:', response.message);
        if (response.error === 'Email Service Error') {
          Alert.alert(
            'Email Service Unavailable',
            'Our email service is currently experiencing configuration issues with Gmail SMTP. This is a backend configuration problem that needs to be fixed by the development team.\n\nFor now, please:\n\n1. Contact our support team for manual password reset\n2. Try again later when the email service is restored\n3. Use the registration flow if you need to create a new account',
            [
              { text: 'Contact Support', onPress: () => navigation.navigate('Support') },
              { text: 'Try Registration', onPress: () => navigation.navigate('Join') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else if (response.error === 'Service Not Found') {
          Alert.alert(
            'Forgot Password Service Unavailable',
            'The forgot password feature is currently being updated on our servers. Please try one of these options:\n\n1. Contact our support team for manual password reset\n2. Try again later when the service is restored\n3. Use the registration flow if you need to create a new account',
            [
              { text: 'Contact Support', onPress: () => navigation.navigate('Support') },
              { text: 'Try Registration', onPress: () => navigation.navigate('Join') },
              { text: 'OK', style: 'cancel' }
            ]
          );
        } else {
          Alert.alert('Error', response.message || 'Failed to send OTP. Please try again.');
        }
      }
    } catch (error) {
      console.log('🔐 Forgot Password: Exception caught:', error);
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Forgot Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔐</Text>
            <Text style={styles.logoText}>Reset Password</Text>
            <Text style={styles.logoSubtext}>Enter your email to receive a reset code</Text>
          </View>

          {/* Form */}
          <View style={styles.formContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your email address"
                placeholderTextColor="#666666"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <TouchableOpacity 
              style={[styles.sendButton, isLoading && styles.sendButtonDisabled]}
              onPress={handleSendOtp}
              disabled={isLoading}
            >
              <Text style={styles.sendButtonText}>
                {isLoading ? 'Sending...' : 'Send Reset Code'}
              </Text>
            </TouchableOpacity>

            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                We'll send a 6-digit verification code to your email address. 
                This code will expire in 5 minutes.
              </Text>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* OTP Sent Success Modal */}
      <SuccessModal
        visible={showOTPSentSuccess}
        onClose={() => {
          setShowOTPSentSuccess(false);
          navigation.navigate('ResetPassword', { email });
        }}
        type="success"
        title="OTP Sent!"
        message="A 6-digit OTP has been sent to your email address. Please check your inbox."
        buttonText="Enter OTP"
        duration={3000}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 50,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  logoSubtext: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
  },
  sendButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  sendButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sendButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  helpContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  helpText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
});
