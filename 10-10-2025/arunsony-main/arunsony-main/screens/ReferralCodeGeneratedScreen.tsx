import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Share,
  Clipboard,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

const ReferralCodeGeneratedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, refreshToken, forceLogout } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(5);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  // Auto-navigate to dashboard after 5 seconds if referral code is found
  useEffect(() => {
    if (referralCode && !loading && !error) {
      const countdownTimer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            console.log('Auto-navigating to dashboard after showing referral code');
            goToDashboard();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownTimer);
    }
  }, [referralCode, loading, error]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError('');
      
      // First, try to get the real referral code from AsyncStorage
      const storedReferralCode = await AsyncStorage.getItem('userReferralCode');
      if (storedReferralCode) {
        console.log('Found real referral code in storage:', storedReferralCode);
        setReferralCode(storedReferralCode);
        setLoading(false);
        return;
      }
      
      // Get user profile with referral code from backend using fetch
      let token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      // Try to refresh token if it's expired
      const tokenRefreshed = await refreshToken();
      if (tokenRefreshed) {
        token = await AsyncStorage.getItem('token');
        console.log('✅ Token refreshed, using new token');
      }

      const response = await fetch('https://asmlmbackend-production.up.railway.app/api/users/decode', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile response:', userData);
        setUserProfile(userData);
      
        // Check if referral code exists in the profile
        if (userData.refer) {
          console.log('Found referral code in profile:', userData.refer);
          setReferralCode(userData.refer);
        } else {
          // If not in profile, try to get it from payment status
          const statusResponse = await fetch(`https://asmlmbackend-production.up.railway.app/api/users/payment-status/${user?.userId}`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            console.log('Payment status response:', statusData);
            
            if (statusData.referralCode) {
              console.log('Found referral code in payment status:', statusData.referralCode);
              setReferralCode(statusData.referralCode);
            } else {
              // Try to get user progress which might contain referral code
              const progressResponse = await fetch(`https://asmlmbackend-production.up.railway.app/api/users/progress/${user?.userId}`, {
                method: 'GET',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                }
              });
              
              if (progressResponse.ok) {
                const progressData = await progressResponse.json();
                console.log('User progress response:', progressData);
                
                if (progressData.referralCode) {
                  console.log('Found referral code in user progress:', progressData.referralCode);
                  setReferralCode(progressData.referralCode);
                } else {
                  console.log('No referral code found in any endpoint - trying fallback from user context');
                  // Fallback: try to get referral code from user context
                  if (user?.refer || user?.referralCode) {
                    const fallbackCode = user.refer || user.referralCode;
                    console.log('Using fallback referral code from user context:', fallbackCode);
                    setReferralCode(fallbackCode);
                  } else {
                    console.log('No referral code found in any endpoint - this might be an issue');
                    setError('Referral code not found. Your payment was successful but the referral code was not generated. Please contact support.');
                  }
                }
            } else {
              console.log('Failed to fetch user progress - trying fallback from user context');
              // Fallback: try to get referral code from user context
              if (user?.refer || user?.referralCode) {
                const fallbackCode = user.refer || user.referralCode;
                console.log('Using fallback referral code from user context:', fallbackCode);
                setReferralCode(fallbackCode);
              } else {
                setError('Failed to fetch user progress. Please try again.');
              }
            }
            }
          } else {
            console.log('Failed to fetch payment status - trying fallback from user context');
            // Fallback: try to get referral code from user context
            if (user?.refer || user?.referralCode) {
              const fallbackCode = user.refer || user.referralCode;
              console.log('Using fallback referral code from user context:', fallbackCode);
              setReferralCode(fallbackCode);
            } else {
              setError('Failed to fetch payment status. Please try again.');
            }
          }
        }
      } else {
        const errorText = await response.text();
        console.error('Profile fetch failed:', response.status, errorText);
        
        // If token is expired, try to refresh it
        if (response.status === 400 && errorText.includes('JWT expired')) {
          console.log('🔄 JWT expired, attempting token refresh...');
          const tokenRefreshed = await refreshToken();
          if (tokenRefreshed) {
            console.log('✅ Token refreshed, retrying profile fetch...');
            // Retry the request with new token
            const newToken = await AsyncStorage.getItem('token');
            const retryResponse = await fetch('https://asmlmbackend-production.up.railway.app/api/users/decode', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${newToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (retryResponse.ok) {
              const userData = await retryResponse.json();
              console.log('✅ Profile fetch successful after token refresh:', userData);
              setUserProfile(userData);
              if (userData.refer) {
                setReferralCode(userData.refer);
              } else {
                setError('Referral code not found in profile');
              }
              setLoading(false);
              return;
            }
          }
        }
        
        console.log('Profile fetch failed - trying fallback from user context');
        // Fallback: try to get referral code from user context
        if (user?.refer || user?.referralCode) {
          const fallbackCode = user.refer || user.referralCode;
          console.log('Using fallback referral code from user context:', fallbackCode);
          setReferralCode(fallbackCode);
        } else {
          setError(`Failed to fetch user profile (${response.status}). Please try again.`);
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.log('Network error - trying fallback from user context');
      // Fallback: try to get referral code from user context
      if (user?.refer || user?.referralCode) {
        const fallbackCode = user.refer || user.referralCode;
        console.log('Using fallback referral code from user context:', fallbackCode);
        setReferralCode(fallbackCode);
      } else {
        setError('Network error. Please check your connection and try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = async () => {
    try {
      await Clipboard.setString(referralCode);
      Alert.alert('Copied!', 'Referral code copied to clipboard');
    } catch (error) {
      Alert.alert('Error', 'Failed to copy referral code');
    }
  };

  const shareReferralCode = async () => {
    try {
      const message = `Join me on this amazing wealth building platform! Use my referral code: ${referralCode}\n\nDownload the app and start earning today!`;
      
      await Share.share({
        message,
        title: 'Join CQ Wealth Platform',
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral code');
    }
  };

  const goToDashboard = () => {
    // Navigate to main dashboard with full access
    navigation.reset({
      index: 0,
      routes: [{ name: 'TabNavigator' as never }],
    });
  };

  const handleForceLogout = async () => {
    try {
      console.log('🔄 Force logout and clear cache...');
      await forceLogout();
      Alert.alert(
        'Cache Cleared',
        'Please login again to get fresh tokens and real referral code.',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('Login' as never);
            }
          }
        ]
      );
    } catch (error) {
      console.error('Force logout error:', error);
      Alert.alert('Error', 'Failed to clear cache. Please restart the app.');
    }
  };

  const goToTeam = () => {
    navigation.navigate('Team' as never);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading your referral code...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <AntDesign name="exclamationcircle" size={80} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Error Loading Referral Code</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={fetchUserProfile}
          >
            <AntDesign name="reload1" size={20} color="#000000" />
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: '#FF6B6B', marginTop: 10 }]}
            onPress={handleForceLogout}
          >
            <AntDesign name="delete" size={20} color="#FFFFFF" />
            <Text style={[styles.retryButtonText, { color: '#FFFFFF' }]}>Clear Cache & Re-login</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Success Animation */}
        <View style={styles.successIcon}>
          <AntDesign name="checkcircle" size={80} color="#FFD700" />
        </View>

        {/* Success Message */}
        <Text style={styles.successTitle}>🎉 CQ Wealth Account Activated!</Text>
        <Text style={styles.successSubtitle}>
          Congratulations! Your CQ Wealth account has been successfully activated.
        </Text>

        {/* Referral Code Section */}
        <View style={styles.referralSection}>
          <Text style={styles.referralTitle}>Your Referral Code</Text>
          <View style={styles.referralCodeContainer}>
            <Text style={styles.referralCode}>{referralCode}</Text>
          </View>
          
          <View style={styles.referralActions}>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyReferralCode}
            >
              <AntDesign name="copy1" size={20} color="#000000" />
              <Text style={styles.copyButtonText}>Copy Code</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.shareButton}
              onPress={shareReferralCode}
            >
              <AntDesign name="sharealt" size={20} color="#000000" />
              <Text style={styles.shareButtonText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Benefits Section */}
        <View style={styles.benefitsSection}>
          <Text style={styles.benefitsTitle}>What's Next?</Text>
          
          <View style={styles.benefitItem}>
            <AntDesign name="team" size={24} color="#FFD700" />
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Start Referring</Text>
              <Text style={styles.benefitDescription}>
                Share your referral code and earn ₹50 for each successful referral
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <AntDesign name="linechart" size={24} color="#FFD700" />
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Track Earnings</Text>
              <Text style={styles.benefitDescription}>
                Monitor your earnings and referral performance in real-time
              </Text>
            </View>
          </View>
          
          <View style={styles.benefitItem}>
            <AntDesign name="gift" size={24} color="#FFD700" />
            <View style={styles.benefitText}>
              <Text style={styles.benefitTitle}>Level Up</Text>
              <Text style={styles.benefitDescription}>
                Progress through tiers and unlock higher rewards
              </Text>
            </View>
          </View>
        </View>

        {/* Auto-navigation countdown */}
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>
            Auto-navigating to dashboard in {countdown} seconds...
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={goToDashboard}
          >
            <AntDesign name="home" size={20} color="#000000" />
            <Text style={styles.primaryButtonText}>Go to Dashboard</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={goToTeam}
          >
            <AntDesign name="team" size={20} color="#FFD700" />
            <Text style={styles.secondaryButtonText}>View Team</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 16,
    fontSize: 16,
  },
  successIcon: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  referralSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    marginBottom: 32,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  referralTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
  },
  referralCodeContainer: {
    backgroundColor: '#000000',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  referralCode: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    letterSpacing: 4,
  },
  referralActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  copyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  shareButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  shareButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  benefitsSection: {
    marginBottom: 32,
  },
  benefitsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  benefitText: {
    flex: 1,
    marginLeft: 16,
  },
  benefitTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  benefitDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  actionButtons: {
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  secondaryButtonText: {
    color: '#FFD700',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  errorMessage: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  backButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  backButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: 'bold',
  },
  countdownContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    alignItems: 'center',
  },
  countdownText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ReferralCodeGeneratedScreen;
