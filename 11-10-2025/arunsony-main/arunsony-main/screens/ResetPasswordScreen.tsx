import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiServiceAxios } from '../services/api-axios';

interface ResetPasswordScreenProps {
  navigation: any;
  route: any;
}

export default function ResetPasswordScreen({ navigation, route }: ResetPasswordScreenProps) {
  const { email } = route.params;
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) return; // Prevent multiple characters
    
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

  const handleResetPassword = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      Alert.alert('Error', 'Please enter the complete 6-digit OTP');
      return;
    }

    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    console.log('🔑 Reset Password: Starting password reset');
    console.log('🔑 Email:', email);
    console.log('🔑 OTP:', otpString);
    console.log('🔑 New Password Length:', newPassword.length);
    
    setIsLoading(true);
    try {
      const response = await apiServiceAxios.resetPassword(email, otpString, newPassword);
      console.log('🔑 Reset Password: API response:', response);
      
      if (response.success) {
        console.log('🔑 Reset Password: Success! Navigating to Login');
        Alert.alert(
          'Success',
          'Your password has been reset successfully. You can now login with your new password.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('Login')
            }
          ]
        );
      } else {
        console.log('🔑 Reset Password: API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to reset password. Please try again.');
      }
    } catch (error) {
      console.log('🔑 Reset Password: Exception caught:', error);
      Alert.alert('Error', 'An error occurred. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    console.log('🔄 Resend OTP: Starting resend for email:', email);
    setIsLoading(true);
    try {
      const response = await apiServiceAxios.forgotPassword(email);
      console.log('🔄 Resend OTP: API response:', response);
      
      if (response.success) {
        console.log('🔄 Resend OTP: Success! Clearing OTP fields');
        Alert.alert('Success', 'A new OTP has been sent to your email address.');
        setOtp(['', '', '', '', '', '']);
      } else {
        console.log('🔄 Resend OTP: API returned error:', response.message);
        Alert.alert('Error', response.message || 'Failed to resend OTP. Please try again.');
      }
    } catch (error) {
      console.log('🔄 Resend OTP: Exception caught:', error);
      Alert.alert('Error', 'An error occurred. Please try again.');
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
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.headerTitle}>Reset Password</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoIcon}>🔑</Text>
            <Text style={styles.logoText}>Enter Verification Code</Text>
            <Text style={styles.logoSubtext}>Code sent to</Text>
            <Text style={styles.emailText}>{email}</Text>
          </View>

          {/* OTP Input */}
          <View style={styles.otpContainer}>
            <Text style={styles.otpLabel}>Enter 6-digit code</Text>
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

          {/* Password Inputs */}
          <View style={styles.passwordContainer}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor="#666666"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Confirm Password</Text>
              <View style={styles.passwordInputContainer}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Confirm new password"
                  placeholderTextColor="#666666"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Text style={styles.eyeIcon}>
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Reset Button */}
          <TouchableOpacity 
            style={[styles.resetButton, isLoading && styles.resetButtonDisabled]}
            onPress={handleResetPassword}
            disabled={isLoading}
          >
            <Text style={styles.resetButtonText}>
              {isLoading ? 'Resetting...' : 'Reset Password'}
            </Text>
          </TouchableOpacity>

          {/* Resend OTP */}
          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Didn't receive the code?</Text>
            <TouchableOpacity onPress={handleResendOtp} disabled={isLoading}>
              <Text style={styles.resendButton}>Resend OTP</Text>
            </TouchableOpacity>
          </View>
          </View>
        </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    padding: 20,
    minHeight: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    
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
    marginBottom: 40,
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
    marginBottom: 0,
  },
  otpLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
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
  passwordContainer: {
    marginBottom: 10,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
  },
  eyeButton: {
    padding: 15,
    paddingLeft: 10,
  },
  eyeIcon: {
    fontSize: 20,
  },
  resetButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 30,
  },
  resetButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  resetButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  resendContainer: {
    alignItems: 'center',
  },
  resendText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 5,
  },
  resendButton: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
