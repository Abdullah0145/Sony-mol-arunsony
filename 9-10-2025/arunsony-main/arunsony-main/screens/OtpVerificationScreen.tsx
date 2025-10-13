import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiServiceAxios } from '../services/api-axios';

interface OtpVerificationScreenProps {
  navigation: any;
  route: {
    params: {
      email: string;
      fullName: string;
    };
  };
}

export default function OtpVerificationScreen({ navigation, route }: OtpVerificationScreenProps) {
  const { email, fullName } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    setIsLoading(true);
    try {
      console.log('🔐 Verifying OTP for email:', email);
      const response = await apiServiceAxios.verifyOtp(email, otpString);
      
      if (response.success) {
        Alert.alert(
          'Success!',
          'OTP verified successfully! You can now login.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        Alert.alert('Verification Failed', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during OTP verification. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      console.log('📧 Resending OTP for email:', email);
      const response = await apiServiceAxios.resendOtp(email);
      
      if (response.success) {
        Alert.alert('Success', 'OTP has been resent to your email');
        setOtp(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else {
        Alert.alert('Error', response.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setIsResending(false);
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
            <Text style={styles.headerTitle}>Verify OTP</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>📧</Text>
            <Text style={styles.logoText}>Verify Your Email</Text>
            <Text style={styles.logoSubtext}>Enter the 6-digit code sent to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter OTP Code</Text>
            <View style={styles.otpInputContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
                    if (ref) inputRefs.current[index] = ref;
                  }}
                  style={styles.otpInput}
                  value={digit}
                  onChangeText={(value) => handleOtpChange(value, index)}
                  onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
                  keyboardType="numeric"
                  maxLength={1}
                  textAlign="center"
                  selectTextOnFocus
                />
              ))}
            </View>
          </View>

          {/* Verify Button */}
          <TouchableOpacity 
            style={[styles.verifyButton, isLoading && styles.verifyButtonDisabled]}
            onPress={handleVerifyOtp}
            disabled={isLoading}
          >
            <Text style={styles.verifyButtonText}>
              {isLoading ? 'Verifying...' : 'Verify OTP'}
            </Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity 
              onPress={handleResendOtp}
              disabled={isResending}
            >
              <Text style={[styles.resendButton, isResending && styles.resendButtonDisabled]}>
                {isResending ? 'Resending...' : 'Resend OTP'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Help Text */}
          <View style={styles.helpContainer}>
            <Text style={styles.helpText}>
              Check your email inbox and spam folder for the OTP code.
            </Text>
          </View>
        </View>
      </KeyboardAvoidingView>
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
    marginBottom: 5,
  },
  emailText: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  otpContainer: {
    marginBottom: 40,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  otpInputContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  otpInput: {
    width: 45,
    height: 55,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  verifyButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  verifyButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  verifyButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  resendContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  resendText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 10,
  },
  resendButton: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
  resendButtonDisabled: {
    color: '#666666',
  },
  helpContainer: {
    alignItems: 'center',
  },
  helpText: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
