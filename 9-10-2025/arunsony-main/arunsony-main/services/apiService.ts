import { apiService as baseApiService } from './api';

// Extended API service for referral code flow
class ReferralApiService {
  private baseService = baseApiService;

  // Products endpoints
  async getProducts() {
    return this.baseService.request('/api/products');
  }

  // Orders endpoints
  async createOrder(userId: number, orderItems: any[], shippingAddress: string) {
    return this.baseService.request(`/api/orders?userId=${userId}&shippingAddress=${encodeURIComponent(shippingAddress)}`, {
      method: 'POST',
      body: JSON.stringify(orderItems),
    });
  }

  async getOrder(orderId: number) {
    return this.baseService.request(`/api/orders/${orderId}`);
  }

  // Payment endpoints
  async createActivationPaymentOrder(userId: number) {
    return this.baseService.request(`/api/payments/create-razorpay-order?userId=${userId}`, {
      method: 'POST',
      body: JSON.stringify({
        amount: 100000, // ₹1000 in paise
        currency: 'INR',
        receipt: `CQ_ACTIVATION_${userId}_${Date.now()}`
      }),
    });
  }

  async verifyPayment(verificationData: any) {
    return this.baseService.request('/api/payments/verify', {
      method: 'POST',
      body: JSON.stringify(verificationData),
    });
  }

  // User endpoints
  async getUserProfile() {
    return this.baseService.request('/api/users/decode');
  }

  async getUserPaymentStatus(userId: number) {
    return this.baseService.request(`/api/users/payment-status/${userId}`);
  }

  async getUserProgress(userId: number) {
    return this.baseService.request(`/api/users/progress/${userId}`);
  }

  // Authentication endpoints (delegated to base service)
  async login(credentials: any) {
    return this.baseService.login(credentials);
  }

  async register(userData: any) {
    return this.baseService.register(userData);
  }

  async verifyOtp(email: string, otp: string) {
    return this.baseService.verifyOtp(email, otp);
  }

  // Token management (delegated to base service)
  setToken(token: string) {
    this.baseService.setToken(token);
  }

  clearToken() {
    this.baseService.clearToken();
  }

  // Generic request method
  async get(endpoint: string) {
    return this.baseService.request(endpoint);
  }

  async post(endpoint: string, data?: any) {
    return this.baseService.request(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // Health check
  async healthCheck() {
    return this.baseService.healthCheck();
  }
}

export const apiService = new ReferralApiService();
export default apiService;
