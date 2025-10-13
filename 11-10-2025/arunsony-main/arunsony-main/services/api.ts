// API Configuration and Service
const BASE_URL = 'https://asmlmbackend-production.up.railway.app';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  memberId: string;
  level: string;
  status: string;
  referralCode?: string;
  createdAt: string;
  lastLogin?: string;
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
  token: string;
  user: User;
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = BASE_URL;
  }

  setToken(token: string) {
    this.token = token;
  }

  clearToken() {
    this.token = null;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Log request details
    console.log('🚀 API Request:', {
      method: options.method || 'GET',
      url,
      headers,
      body: options.body ? JSON.parse(options.body as string) : undefined
    });

    try {
      // Add timeout and additional fetch options for React Native
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
        // Additional options for React Native compatibility
        mode: 'cors',
        credentials: 'omit',
      });

      clearTimeout(timeoutId);

      console.log('📡 API Response Status:', response.status, response.statusText);
      const responseHeaders: Record<string, string> = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });
      console.log('📡 Response Headers:', responseHeaders);

      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log('📦 API Response Data:', data);

      if (!response.ok) {
        console.log('❌ API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          data
        });
        
        return {
          success: false,
          message: data.message || data.error || 'An error occurred',
          error: data.error || 'Unknown error',
        };
      }

      console.log('✅ API Success Response:', data);

      return {
        success: true,
        message: data.message || 'Success',
        data: data.data || data,
      };
    } catch (error) {
      console.error('💥 API Request Error:', error);
      
      // More detailed error handling
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            message: 'Request timeout. Please try again.',
            error: 'Request timeout',
          };
        }
        
        if (error.message.includes('Network request failed')) {
          return {
            success: false,
            message: 'Network connection failed. Please check your internet connection and try again.',
            error: 'Network request failed',
          };
        }
        
        if (error.message.includes('fetch')) {
          return {
            success: false,
            message: 'Unable to connect to server. Please try again later.',
            error: 'Fetch error',
          };
        }
      }
      
      return {
        success: false,
        message: 'Network error. Please check your connection.',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Authentication endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyOtp(email: string, otp: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/api/users/verify-otp', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });
  }

  async resendOtp(email: string): Promise<ApiResponse> {
    return this.request('/api/users/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request('/api/users/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse> {
    return this.request('/api/users/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  // User endpoints
  async getProfile(): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile');
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<User>> {
    return this.request<User>('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  // Dashboard endpoints
  async getDashboard(): Promise<ApiResponse> {
    return this.request('/api/dashboard');
  }

  async getEarnings(): Promise<ApiResponse> {
    return this.request('/api/earnings');
  }

  async getTeam(): Promise<ApiResponse> {
    return this.request('/api/team');
  }

  async getProducts(): Promise<ApiResponse> {
    return this.request('/api/products');
  }

  // Health check
  async healthCheck(): Promise<ApiResponse> {
    return this.request('/health');
  }
}

export const apiService = new ApiService();

// Network connectivity test function
export const testNetworkConnectivity = async (): Promise<boolean> => {
  try {
    console.log('🔍 Testing network connectivity...');
    
    // Test basic connectivity
    const response = await fetch('https://asmlmbackend-production.up.railway.app/health', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      },
      mode: 'cors',
      credentials: 'omit',
    });
    
    const data = await response.text();
    console.log('✅ Network test successful:', data);
    return true;
  } catch (error) {
    console.error('❌ Network test failed:', error);
    return false;
  }
};
export default apiService;
