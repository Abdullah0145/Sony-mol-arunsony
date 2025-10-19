// Enhanced API Service using Axios for React Native
import axios, { AxiosInstance, AxiosResponse, AxiosError } from 'axios';

// Use Railway backend for both development and production
const BASE_URL = 'https://asmlmbackend-production.up.railway.app';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  id?: string;
  userId?: string;
  email: string;
  name?: string;
  fullName?: string;
  phoneNumber?: string;
  phone?: string;
  memberId?: string;
  level?: string;
  status: string;
  refer?: string;
  referralCode?: string;
  walletBalance?: number;
  referralCount?: number;
  hasPaidActivation?: boolean;
  isFirstOrder?: boolean;
  createdAt?: string;
}

export interface UserProgress {
  tierName?: string;
  levelNumber?: number;
  walletBalance?: number;
  referralCount?: number;
  firstOrder?: boolean;
}

export interface UserReward {
  userRewardId: number;
  userId: number;
  userName: string;
  userEmail: string;
  levelId: number;
  levelNumber: number;
  requiredReferrals: number;
  levelDescription: string;
  rewardId: number;
  rewardName: string;
  rewardType: string;
  rewardValue?: number;
  rewardDescription?: string;
  isClaimed: boolean;
  claimedAt?: string;
  createdAt?: string;
  userCurrentReferrals: number;
  isEligible: boolean;
  eligibilityStatus: string;
}

export interface ClaimRewardRequest {
  userRewardId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  referredByCode?: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  userId?: number;
  name?: string;
  email?: string;
  phoneNumber?: string;
  status?: string;
  refer?: string;
  referralCount?: number;
  walletBalance?: number;
  hasPaidActivation?: boolean;
  isFirstOrder?: boolean;
  user?: User;
}

class ApiService {
  private axiosInstance: AxiosInstance;
  private token: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing: boolean = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: BASE_URL,
      timeout: 30000, // 30 seconds
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });

    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        console.log('🚀 API REQUEST:', {
          method: config.method?.toUpperCase(),
          url: config.url,
          baseURL: config.baseURL,
          fullURL: `${config.baseURL}${config.url}`,
          headers: config.headers,
          data: config.data,
          timeout: config.timeout,
        });

        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
          console.log('🔑 Added Authorization header');
        }

        return config;
      },
      (error) => {
        console.error('💥 REQUEST ERROR:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log('📡 API Response Status:', response.status, response.statusText);
        console.log('📦 API Response Data:', response.data);
        console.log('✅ API Success Response:', response.data);
        return response;
      },
      async (error: AxiosError) => {
        console.error('💥 API Response Error:', error);
        
        const originalRequest = error.config as any;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.axiosInstance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshAccessToken();
            this.processQueue(null, newToken);
            
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            console.error('Token refresh failed, redirecting to login');
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }
        
        if (error.response) {
          // Server responded with error status
          console.log('❌ API Error Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
        } else if (error.request) {
          // Request was made but no response received
          console.log('❌ No response received:', error.request);
        } else {
          // Something else happened
          console.log('❌ Request setup error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  setToken(token: string) {
    this.token = token;
  }

  setRefreshToken(refreshToken: string) {
    this.refreshToken = refreshToken;
  }

  setTokens(accessToken: string, refreshToken: string) {
    this.token = accessToken;
    this.refreshToken = refreshToken;
  }

  clearToken() {
    this.token = null;
    this.refreshToken = null;
  }

  async initializeTokensFromStorage() {
    try {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      const [token, refreshToken] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('refreshToken')
      ]);
      
      if (token && refreshToken) {
        this.setTokens(token, refreshToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to initialize tokens from storage:', error);
      return false;
    }
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private async refreshAccessToken(): Promise<string> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/users/refresh-token`, {
        refreshToken: this.refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      
      this.setTokens(accessToken, newRefreshToken);
      
      // Store tokens in AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('token', accessToken);
      await AsyncStorage.setItem('refreshToken', newRefreshToken);
      
      return accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.clearToken();
      
      // Clear tokens from AsyncStorage
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('token');
      await AsyncStorage.removeItem('refreshToken');
      
      throw error;
    }
  }

  private handleApiError(error: AxiosError): ApiResponse {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data as any;
      
      if (status === 404) {
        // Check if it's actually an email server error disguised as 404
        if (data?.error && data.error.includes('Mail server connection failed')) {
          console.log('🚨 EMAIL SERVER ERROR: Gmail SMTP configuration issue');
          console.log('🚨 Error details:', data.error);
          return {
            success: false,
            message: 'Email service is temporarily unavailable. Please contact support for password reset.',
            error: 'Email Service Error',
          };
        }
        
        console.log('🚨 404 ERROR: The forgot password endpoint is not deployed on Railway backend');
        console.log('🚨 Available endpoints: /api/users/register, /api/users/login, /api/users/verify-otp');
        console.log('🚨 Missing endpoint: /api/users/forgot-password');
        return {
          success: false,
          message: 'Forgot password service is currently unavailable. Please contact support or try again later.',
          error: 'Service Not Found',
        };
      }
      
      return {
        success: false,
        message: data?.message || data?.error || 'An error occurred',
        error: data?.error || 'Unknown error',
      };
    } else if (error.request) {
      // Request was made but no response received
      return {
        success: false,
        message: 'Network connection failed. Please check your internet connection and try again.',
        error: 'Network request failed',
      };
    } else {
      // Something else happened
      return {
        success: false,
        message: 'An unexpected error occurred. Please try again.',
        error: error.message || 'Unknown error',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await this.axiosInstance.post('/api/users/login', credentials);
      return {
        success: true,
        message: 'Login successful',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/users/register', userData);
      return {
        success: true,
        message: response.data.message || 'Registration successful',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/users/verify-otp', {
        email,
        otp,
      });
      return {
        success: true,
        message: response.data.message || 'OTP verified successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async resendOtp(email: string): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/users/resend-otp', {
        email,
      });
      return {
        success: true,
        message: response.data.message || 'OTP resent successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    try {
      console.log('🔐 FORGOT PASSWORD API CALL START');
      console.log('🔐 Base URL:', this.axiosInstance.defaults.baseURL);
      console.log('🔐 Full Endpoint:', `${this.axiosInstance.defaults.baseURL}/api/users/forgot-password`);
      console.log('🔐 Request Payload:', { email });
      console.log('🔐 Current Headers:', this.axiosInstance.defaults.headers);
      
      const response = await this.axiosInstance.post('/api/users/forgot-password', {
        email,
      });
      
      console.log('🔐 FORGOT PASSWORD SUCCESS');
      console.log('🔐 Response Status:', response.status);
      console.log('🔐 Response Headers:', response.headers);
      console.log('🔐 Response Data:', response.data);
      
      return {
        success: true,
        message: response.data.message || 'Password reset email sent',
        data: response.data,
      };
    } catch (error) {
      console.log('🔐 FORGOT PASSWORD ERROR');
      console.log('🔐 Error Object:', error);
      console.log('🔐 Error Type:', typeof error);
      console.log('🔐 Error Message:', (error as any)?.message);
      console.log('🔐 Error Response:', (error as any)?.response);
      console.log('🔐 Error Request:', (error as any)?.request);
      
      return this.handleApiError(error as AxiosError);
    }
  }

  async resetPassword(email: string, otp: string, newPassword: string): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/users/reset-password', {
        email,
        otp,
        newPassword,
      });
      return {
        success: true,
        message: response.data.message || 'Password reset successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getProfile(): Promise<ApiResponse<User>> {
    try {
      const response = await this.axiosInstance.get('/api/users/decode');
      return {
        success: true,
        message: 'Profile retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async healthCheck(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/health');
      return {
        success: true,
        message: 'Health check successful',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getOtpForTesting(email: string): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/users/get-otp/${email}`);
      return {
        success: true,
        message: 'OTP retrieved for testing',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // Payment endpoints
  async createPaymentOrder(orderData: any): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/payments/create-order', orderData);
      return {
        success: true,
        message: 'Payment order created successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async createActivationPaymentOrder(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post(`/api/payments/create-activation-order?userId=${userId}`);
      return {
        success: true,
        message: 'Activation payment order created successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async verifyPayment(verificationData: any): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post('/api/payments/verify', verificationData);
      return {
        success: true,
        message: 'Payment verified successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // Order endpoints (NEW - Razorpay Integration)
  async createOrderWithRazorpay(
    orderItems: any[], 
    userId?: number, 
    shippingAddress?: string,
    shippingName?: string,
    shippingPhone?: string,
    shippingCity?: string,
    shippingState?: string,
    shippingPincode?: string
  ): Promise<ApiResponse> {
    try {
      const params = new URLSearchParams();
      if (userId) params.append('userId', userId.toString());
      if (shippingAddress) params.append('shippingAddress', shippingAddress);
      if (shippingName) params.append('shippingName', shippingName);
      if (shippingPhone) params.append('shippingPhone', shippingPhone);
      if (shippingCity) params.append('shippingCity', shippingCity);
      if (shippingState) params.append('shippingState', shippingState);
      if (shippingPincode) params.append('shippingPincode', shippingPincode);
      
      const response = await this.axiosInstance.post(
        `/api/orders?${params.toString()}`,
        orderItems
      );
      return {
        success: true,
        message: 'Order created successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async verifyOrderPayment(orderId: number, paymentData: any): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.post(
        `/api/orders/${orderId}/verify-payment`,
        paymentData
      );
      return {
        success: true,
        message: 'Payment verified successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getOrderStatus(orderId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/orders/${orderId}/status`);
      return {
        success: true,
        message: 'Order status retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserOrders(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/orders/user/${userId}`);
      return {
        success: true,
        message: 'User orders retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getPaymentHistory(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/api/payments/history');
      return {
        success: true,
        message: 'Payment history retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserPaymentHistory(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/payments/user/${userId}`);
      return {
        success: true,
        message: 'User payment history retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // Commission/Earnings related methods
  async getUserCommissionHistory(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/commissions/history/${userId}`);
      return {
        success: true,
        message: 'User commission history retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserTotalCommissions(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/commissions/total/${userId}`);
      return {
        success: true,
        message: 'User total commissions retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserCommissionStats(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/commissions/stats/${userId}`);
      return {
        success: true,
        message: 'User commission statistics retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserCommissionRates(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/commissions/rates/${userId}`);
      return {
        success: true,
        message: 'User commission rates retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getMonthlyRevenue(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/commissions/monthly-revenue`);
      return {
        success: true,
        message: 'Monthly revenue data retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserPaymentStatus(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/users/payment-status/${userId}`);
      return {
        success: true,
        message: 'Payment status retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserProgress(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/users/progress/${userId}`);
      return {
        success: true,
        message: 'User progress retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getApprovedWalletBalance(): Promise<ApiResponse<{approvedBalance: number, totalEarnings: number, totalWithdrawals: number}>> {
    try {
      const response = await this.axiosInstance.get('/api/users/approved-balance');
      return {
        success: true,
        message: 'Approved wallet balance retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserReferrals(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/users/referrals/${userId}`);
      return {
        success: true,
        message: 'User referrals retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // Withdrawal related methods
  async createWithdrawalRequest(
    amount: number, 
    description: string, 
    paymentMethod: string,
    upiId?: string,
    accountNumber?: string,
    ifscCode?: string,
    accountHolderName?: string,
    bankName?: string
  ): Promise<ApiResponse> {
    try {
      const requestBody: any = {
        amount: amount,
        description: description,
        paymentMethod: paymentMethod
      };

      // Add optional fields if provided
      if (upiId) requestBody.upiId = upiId;
      if (accountNumber) requestBody.accountNumber = accountNumber;
      if (ifscCode) requestBody.ifscCode = ifscCode;
      if (accountHolderName) requestBody.accountHolderName = accountHolderName;
      if (bankName) requestBody.bankName = bankName;

      const response = await this.axiosInstance.post('/api/withdrawals', requestBody);
      return {
        success: true,
        message: 'Withdrawal request created successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getUserWithdrawals(userId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/withdrawals/user/${userId}`);
      return {
        success: true,
        message: 'User withdrawals retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getWithdrawalDetails(userId: number, withdrawalId: number): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/withdrawals/user/${userId}/${withdrawalId}`);
      return {
        success: true,
        message: 'Withdrawal details retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getWithdrawalStatistics(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/api/withdrawals/statistics');
      return {
        success: true,
        message: 'Withdrawal statistics retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // User Rewards API Methods
  async getUserRewards(userId: number): Promise<ApiResponse<{rewards: UserReward[]}>> {
    try {
      const response = await this.axiosInstance.get(`/api/userrewards/user/${userId}`);
      return {
        success: true,
        message: 'User rewards retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getAvailableRewards(userId: number): Promise<ApiResponse<{availableRewards: UserReward[]}>> {
    try {
      const response = await this.axiosInstance.get(`/api/userrewards/available/${userId}`);
      return {
        success: true,
        message: 'Available rewards retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async claimReward(userRewardId: number): Promise<ApiResponse<{claimedReward: UserReward}>> {
    try {
      const response = await this.axiosInstance.post('/api/userrewards/claim', {
        userRewardId
      });
      return {
        success: true,
        message: 'Reward claimed successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  // Terms & Conditions endpoints
  async getActiveTerms(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/api/terms/active/terms');
      return {
        success: true,
        message: 'Terms retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getActivePrivacy(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/api/terms/active/privacy');
      return {
        success: true,
        message: 'Privacy policy retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getAllActiveTerms(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get('/api/terms/active/all');
      return {
        success: true,
        message: 'All terms retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }

  async getTierRequirements(): Promise<ApiResponse> {
    try {
      const response = await this.axiosInstance.get(`/api/tiers/structure`);
      return {
        success: true,
        message: 'Tier requirements retrieved successfully',
        data: response.data,
      };
    } catch (error) {
      return this.handleApiError(error as AxiosError);
    }
  }
}

// Create and export the API service instance
const apiServiceAxios = new ApiService();
export { apiServiceAxios };
export default apiServiceAxios;

// Network connectivity test function using axios
export const testNetworkConnectivityAxios = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing network connectivity with axios...');
    
    const response = await axios.get('https://asmlmbackend-production.up.railway.app/health', {
      timeout: 10000,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
    });
    
    console.log('✅ Network test successful:', response.data);
    return true;
  } catch (error) {
    console.error('❌ Network test failed:', error);
    return false;
  }
};

// export default apiServiceAxios; // Removed to avoid confusion with named export
