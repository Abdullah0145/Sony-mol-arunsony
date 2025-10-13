import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../components/AuthContext';
import { testNetworkConnectivityAxios } from '../services/api-axios';

interface JoinScreenProps {
  navigation: any;
}

export default function JoinScreen({ navigation }: JoinScreenProps) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useAuth();

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return { text: 'Weak', color: '#FF4444' };
    if (strength <= 4) return { text: 'Medium', color: '#FFA500' };
    return { text: 'Strong', color: '#00FF00' };
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return false;
    }
    if (!formData.phone.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Error', 'Please enter a password');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleJoin = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Test network connectivity first
      console.log('🔍 Testing network connectivity before registration...');
      const isConnected = await testNetworkConnectivityAxios();
      
      if (!isConnected) {
        Alert.alert(
          'Network Error', 
          'Unable to connect to the server. Please check your internet connection and try again.',
          [{ text: 'OK' }]
        );
        return;
      }

      console.log('✅ Network connectivity confirmed, proceeding with registration...');
      
      const result = await register({
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phoneNumber: formData.phone.trim(),
        password: formData.password,
        referredByCode: formData.referralCode.trim() || undefined,
      });

      if (result.success) {
        // Navigate to OTP verification screen
        navigation.navigate('OtpVerification', {
          email: formData.email.trim(),
          fullName: formData.fullName.trim()
        });
      } else {
        Alert.alert('Registration Failed', result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => navigation.goBack()}
              >
                <Text style={styles.backButtonText}>←</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Join CQ Wealth</Text>
              <View style={styles.placeholder} />
            </View>

            {/* Logo */}
            <View style={styles.logoContainer}>
              <Text style={styles.logoIcon}>👑</Text>
              <Text style={styles.logoText}>CQ Wealth</Text>
              <Text style={styles.logoSubtext}>Start Your Financial Journey</Text>
            </View>

            {/* Membership Info */}
            <View style={styles.membershipInfo}>
              <Text style={styles.membershipTitle}>Membership Fee: ₹1,000</Text>
              <Text style={styles.membershipDescription}>
                Get access to our premium wealth building network and start earning from day one
              </Text>
            </View>

            {/* Registration Form */}
            <View style={styles.formContainer}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  placeholderTextColor="#666666"
                  value={formData.fullName}
                  onChangeText={(value) => updateFormData('fullName', value)}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor="#666666"
                  value={formData.email}
                  onChangeText={(value) => updateFormData('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#666666"
                  value={formData.phone}
                  onChangeText={(value) => updateFormData('phone', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Create a password"
                    placeholderTextColor="#666666"
                    value={formData.password}
                    onChangeText={(value) => updateFormData('password', value)}
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
                {formData.password.length > 0 && (
                  <View style={styles.passwordStrengthContainer}>
                    <Text style={styles.passwordStrengthLabel}>Password Strength:</Text>
                    <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthText(getPasswordStrength(formData.password)).color }]}>
                      {getPasswordStrengthText(getPasswordStrength(formData.password)).text}
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm Password *</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Confirm your password"
                    placeholderTextColor="#666666"
                    value={formData.confirmPassword}
                    onChangeText={(value) => updateFormData('confirmPassword', value)}
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
                {formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword && (
                  <Text style={styles.passwordMismatchText}>Passwords do not match</Text>
                )}
                {formData.confirmPassword.length > 0 && formData.password === formData.confirmPassword && formData.password.length > 0 && (
                  <Text style={styles.passwordMatchText}>✓ Passwords match</Text>
                )}
              </View>

              {/* Password Requirements */}
              <View style={styles.passwordRequirementsContainer}>
                <Text style={styles.passwordRequirementsTitle}>Password Requirements:</Text>
                <View style={styles.requirementItem}>
                  <Text style={[styles.requirementIcon, { color: formData.password.length >= 6 ? '#00FF00' : '#666666' }]}>
                    {formData.password.length >= 6 ? '✓' : '○'}
                  </Text>
                  <Text style={styles.requirementText}>At least 6 characters</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[styles.requirementIcon, { color: /[A-Z]/.test(formData.password) ? '#00FF00' : '#666666' }]}>
                    {/[A-Z]/.test(formData.password) ? '✓' : '○'}
                  </Text>
                  <Text style={styles.requirementText}>One uppercase letter</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Text style={[styles.requirementIcon, { color: /[0-9]/.test(formData.password) ? '#00FF00' : '#666666' }]}>
                    {/[0-9]/.test(formData.password) ? '✓' : '○'}
                  </Text>
                  <Text style={styles.requirementText}>One number</Text>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter referral code if you have one"
                  placeholderTextColor="#666666"
                  value={formData.referralCode}
                  onChangeText={(value) => updateFormData('referralCode', value)}
                  autoCapitalize="none"
                />
              </View>

              <TouchableOpacity 
                style={[styles.joinButton, isLoading && styles.joinButtonDisabled]}
                onPress={handleJoin}
                disabled={isLoading}
              >
                <Text style={styles.joinButtonText}>
                  {isLoading ? 'Creating Account...' : 'Join Now'}
                </Text>
              </TouchableOpacity>

              {/* Network Test Button */}
              <TouchableOpacity 
                style={styles.networkTestButton}
                onPress={() => navigation.navigate('NetworkTest')}
              >
                <Text style={styles.networkTestButtonText}>🔧 Network Test</Text>
              </TouchableOpacity>

              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>OR</Text>
                <View style={styles.dividerLine} />
              </View>

                             <TouchableOpacity 
                 style={styles.loginButton}
                 onPress={() => navigation.navigate('Login')}
               >
                <Text style={styles.loginButtonText}>Already have an account? Login</Text>
              </TouchableOpacity>
            </View>

            {/* Benefits */}
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>What You Get:</Text>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Access to wealth building network</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Premium products package</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Training and support</Text>
              </View>
              <View style={styles.benefitItem}>
                <Text style={styles.benefitIcon}>✅</Text>
                <Text style={styles.benefitText}>Earning potential from day 1</Text>
              </View>
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
  content: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
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
    marginBottom: 30,
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
  },
  membershipInfo: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: 'center',
  },
  membershipTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  membershipDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 20,
  },
  formContainer: {
    marginBottom: 30,
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
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    color: '#FFFFFF',
  },
  passwordContainer: {
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
  passwordStrengthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  passwordStrengthLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginRight: 8,
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  passwordMismatchText: {
    fontSize: 12,
    color: '#FF4444',
    marginTop: 5,
  },
  passwordMatchText: {
    fontSize: 12,
    color: '#00FF00',
    marginTop: 5,
  },
  passwordRequirementsContainer: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  passwordRequirementsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  requirementIcon: {
    fontSize: 14,
    marginRight: 8,
    width: 16,
  },
  requirementText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  joinButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  joinButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  joinButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  networkTestButton: {
    backgroundColor: '#333333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  networkTestButtonText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#333333',
  },
  dividerText: {
    color: '#666666',
    marginHorizontal: 15,
    fontSize: 14,
  },
  loginButton: {
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#FFD700',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  benefitsContainer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
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
    marginBottom: 10,
  },
  benefitIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  benefitText: {
    fontSize: 14,
    color: '#CCCCCC',
  },
});
