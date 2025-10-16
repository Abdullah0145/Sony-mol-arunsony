import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingScreen from './LoadingScreen';
import { apiServiceAxios, User, LoginRequest, RegisterRequest } from '../services/api-axios';

interface AuthContextType {
  isAuthenticated: boolean;
  hasPaid: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterRequest) => Promise<{ success: boolean; message: string; needsOtp?: boolean }>;
  logout: () => void;
  forceLogout: () => Promise<void>;
  user: User | null;
  resetSessionTimer: () => void;
  isLoading: boolean;
  checkPaymentStatus: () => Promise<void>;
  updatePaymentStatus: (hasPaid: boolean) => void;
  updateUserBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPaid, setHasPaid] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Session timeout after 30 minutes of inactivity
  const SESSION_TIMEOUT = 30 * 60 * 1000;

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  // Set up session timeout when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      resetSessionTimer();
    } else {
      clearSessionTimeout();
    }
  }, [isAuthenticated]);

  const clearSessionTimeout = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
  };

  const resetSessionTimer = () => {
    clearSessionTimeout();
    if (isAuthenticated) {
      sessionTimeoutRef.current = setTimeout(() => {
        console.log('Session expired due to inactivity');
        logout();
      }, SESSION_TIMEOUT);
    }
  };

  const checkAuthState = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      const userData = await AsyncStorage.getItem('user');
      const paymentStatus = await AsyncStorage.getItem('hasPaid');
      
      if (token && refreshToken && userData) {
        const parsedUser = JSON.parse(userData);
        // Add refresh token to user object
        parsedUser.refreshToken = refreshToken;
        apiServiceAxios.setTokens(token, refreshToken);
        setUser(parsedUser);
        setIsAuthenticated(true);
        
        // Check payment status
        if (paymentStatus) {
          setHasPaid(JSON.parse(paymentStatus));
        } else {
          // Check payment status from backend
          await checkPaymentStatus();
        }
        
        // Log access details for debugging
        const hasReferralCode = !!(parsedUser.refer || parsedUser.referralCode);
        const currentHasPaid = paymentStatus ? JSON.parse(paymentStatus) : false;
        const hasFullAccess = currentHasPaid || hasReferralCode;
        
        console.log('Auth State Check - Access Details:', {
          hasPaid: currentHasPaid,
          hasReferralCode,
          referralCode: parsedUser.refer || parsedUser.referralCode,
          hasFullAccess
        });
      }
    } catch (error) {
      console.log('Error checking auth state:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('Attempting login with email:', email);
    
    try {
      const response = await apiServiceAxios.login({ email, password });
      
      if (response.success && response.data) {
        const { token, accessToken, refreshToken, ...userData } = response.data;
        
        // Use accessToken if available, otherwise fall back to token for backward compatibility
        const finalAccessToken = accessToken || token;
        
        // Create user object from the response data
        const user = {
          id: userData.userId,
          userId: userData.userId, // Add userId field for compatibility
          name: userData.name,
          email: userData.email,
          phoneNumber: userData.phoneNumber,
          status: userData.status,
          refer: userData.refer,
          referralCount: userData.referralCount,
          walletBalance: userData.walletBalance,
          hasPaidActivation: userData.hasPaidActivation,
          isFirstOrder: userData.isFirstOrder,
          refreshToken: refreshToken // Include refresh token in user object
        };
        
        // Store tokens and user data
        await AsyncStorage.setItem('token', finalAccessToken);
        if (refreshToken) {
          await AsyncStorage.setItem('refreshToken', refreshToken);
        }
        await AsyncStorage.setItem('user', JSON.stringify(user));
        
        // Set API tokens and update state
        if (refreshToken) {
          apiServiceAxios.setTokens(finalAccessToken, refreshToken);
        } else {
          apiServiceAxios.setToken(finalAccessToken);
        }
        setUser(user);
        
        // Delay authentication state to allow success modal to show
        setTimeout(() => {
          setIsAuthenticated(true);
        }, 2500); // 2.5 seconds delay
        
        // Set payment status directly from login response
        const hasPaid = userData.hasPaidActivation || false;
        setHasPaid(hasPaid);
        await AsyncStorage.setItem('hasPaid', JSON.stringify(hasPaid));
        console.log('Payment status set from login response:', hasPaid);
        
        // Load stored referral code if available
        const storedReferralCode = await AsyncStorage.getItem('userReferralCode');
        if (storedReferralCode) {
          console.log('Loading stored referral code:', storedReferralCode);
          user.refer = storedReferralCode;
          user.referralCode = storedReferralCode;
          await AsyncStorage.setItem('user', JSON.stringify(user));
        }
        
        // Check if user has full access (either paid or has referral code)
        const hasReferralCode = !!(userData.refer || userData.referralCode);
        const hasFullAccess = hasPaid || hasReferralCode;
        
        if (hasFullAccess) {
          console.log('User has full access - CQ Wealth activated (payment or referral code)');
          console.log('Access details:', { hasPaid, hasReferralCode, referralCode: userData.refer || userData.referralCode });
        } else {
          console.log('User needs to complete CQ Wealth activation');
        }
        
        console.log('Login successful, user authenticated');
        return true;
      } else {
        console.log('Login failed:', response.message);
        return false;
      }
    } catch (error) {
      console.log('Login error:', error);
      return false;
    }
  };

  const register = async (userData: RegisterRequest): Promise<{ success: boolean; message: string; needsOtp?: boolean }> => {
    console.log('Attempting registration with email:', userData.email);
    
    try {
      const response = await apiServiceAxios.register(userData);
      
      if (response.success) {
        console.log('Registration successful');
        return {
          success: true,
          message: response.message,
          needsOtp: false // OTP handling can be added later if needed
        };
      } else {
        console.log('Registration failed:', response.message);
        return {
          success: false,
          message: response.message
        };
      }
    } catch (error) {
      console.log('Registration error:', error);
      return {
        success: false,
        message: 'An error occurred during registration'
      };
    }
  };

  const refreshToken = async () => {
    try {
      console.log('🔄 Attempting to refresh JWT token...');
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) {
        console.log('❌ No refresh token found');
        return false;
      }

      const response = await fetch('https://asmlmbackend-production.up.railway.app/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token refreshed successfully');
        
        // Update stored tokens
        await AsyncStorage.setItem('token', data.accessToken);
        if (data.refreshToken) {
          await AsyncStorage.setItem('refreshToken', data.refreshToken);
        }
        
        // Update API service tokens
        apiServiceAxios.setToken(data.accessToken);
        if (data.refreshToken) {
          apiServiceAxios.setRefreshToken(data.refreshToken);
        }
        
        return true;
      } else {
        console.log('❌ Token refresh failed:', response.status);
        return false;
      }
    } catch (error) {
      console.log('❌ Token refresh error:', error);
      return false;
    }
  };

  const checkPaymentStatus = async () => {
    try {
      // Check if user has made their first payment (₹1 for testing)
      if (user && user.id) {
        try {
          // Use the new payment status endpoint
          const response = await apiServiceAxios.getUserPaymentStatus(parseInt(user.id));
          if (response.success && response.data) {
            const hasPaidActivation = response.data.hasPaidActivation;
            setHasPaid(hasPaidActivation);
            await AsyncStorage.setItem('hasPaid', JSON.stringify(hasPaidActivation));
            console.log('Payment status checked from backend:', hasPaidActivation);
          } else {
            // Fallback to payment history check
            const historyResponse = await apiServiceAxios.getPaymentHistory();
            if (historyResponse.success && historyResponse.data) {
              const hasCompletedPayment = historyResponse.data.some((payment: any) => 
                payment.status === 'COMPLETED' && payment.amount >= 1
              );
              setHasPaid(hasCompletedPayment);
              await AsyncStorage.setItem('hasPaid', JSON.stringify(hasCompletedPayment));
              console.log('Payment status checked from payment history:', hasCompletedPayment);
            } else {
              // Final fallback to wallet balance check
              const hasMadePayment = user.walletBalance && user.walletBalance >= 1;
              setHasPaid(hasMadePayment);
              await AsyncStorage.setItem('hasPaid', JSON.stringify(hasMadePayment));
              console.log('Payment status checked from wallet balance (fallback):', hasMadePayment);
            }
          }
        } catch (backendError) {
          console.log('Backend payment check failed, using fallback:', backendError);
          // Fallback to wallet balance check
          const hasMadePayment = user.walletBalance && user.walletBalance >= 1;
          setHasPaid(hasMadePayment);
          await AsyncStorage.setItem('hasPaid', JSON.stringify(hasMadePayment));
          console.log('Payment status checked from wallet balance (fallback):', hasMadePayment);
        }
      }
    } catch (error) {
      console.log('Error checking payment status:', error);
    }
  };

  const updatePaymentStatus = async (paid: boolean) => {
    setHasPaid(paid);
    await AsyncStorage.setItem('hasPaid', JSON.stringify(paid));
    console.log('Payment status updated:', paid);
  };

  const updateUserBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, walletBalance: newBalance };
      setUser(updatedUser);
      AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      console.log('User balance updated:', newBalance);
    }
  };

  const logout = async () => {
    console.log('Logging out user');
    try {
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('hasPaid');
      await AsyncStorage.removeItem('userReferralCode');
      console.log('User data removed from storage');
    } catch (error) {
      console.log('Error removing user data:', error);
    }
      apiServiceAxios.clearToken();
    clearSessionTimeout();
    setUser(null);
    setIsAuthenticated(false);
    setHasPaid(false);
    console.log('User logged out successfully');
  };

  const forceLogout = async () => {
    console.log('🔄 Force logout - clearing all tokens and forcing fresh login');
    await logout();
    // Clear all AsyncStorage data
    try {
      await AsyncStorage.clear();
      console.log('✅ All storage cleared');
    } catch (error) {
      console.log('Error clearing storage:', error);
    }
  };

  const value = {
    isAuthenticated,
    hasPaid,
    login,
    register,
    logout,
    forceLogout,
    user,
    refreshToken,
    resetSessionTimer,
    isLoading,
    checkPaymentStatus,
    updatePaymentStatus,
    updateUserBalance
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
