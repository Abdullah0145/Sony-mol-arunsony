import RazorpayCheckout from 'react-native-razorpay';
import { apiServiceAxios } from './api-axios';
import { getRazorpayKey, RAZORPAY_CONFIG } from '../src/config/razorpay';

export interface CreatePaymentRequest {
  amount: number;
  currency?: string;
  receipt: string;
  userId: number;
  description?: string;
}

export interface PaymentResponse {
  orderId: string;
  razorpayOrderId: string;
  currency: string;
  amount: number;
  key: string;
  status: string;
  message: string;
}

export interface PaymentVerificationRequest {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  userId: number;
}

export interface PaymentVerificationResponse {
  success: boolean;
  message: string;
  paymentId?: string;
  orderId?: string;
  status?: string;
}

class RazorpayService {
  private readonly razorpayKeyId: string;

  constructor() {
    this.razorpayKeyId = getRazorpayKey();
  }

  /**
   * Create a payment order on the backend
   */
  async createPaymentOrder(request: CreatePaymentRequest): Promise<PaymentResponse> {
    try {
      const response = await apiServiceAxios.createPaymentOrder(request);
      return response.data;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw new Error('Failed to create payment order');
    }
  }

  /**
   * Create CQ Wealth activation payment order (₹1000)
   */
  async createActivationPaymentOrder(userId: number): Promise<PaymentResponse> {
    try {
      const response = await apiServiceAxios.createActivationPaymentOrder(userId);
      return response.data;
    } catch (error) {
      console.error('Error creating activation payment order:', error);
      throw new Error('Failed to create activation payment order');
    }
  }

  /**
   * Verify payment on the backend
   */
  async verifyPayment(request: PaymentVerificationRequest): Promise<PaymentVerificationResponse> {
    try {
      const response = await apiServiceAxios.verifyPayment(request);
      return response.data;
    } catch (error) {
      console.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  /**
   * Open Razorpay checkout
   */
  async openRazorpayCheckout(paymentData: PaymentResponse, userDetails: {
    name: string;
    email: string;
    contact: string;
  }): Promise<{ success: boolean; data?: any; error?: any }> {
    try {
      console.log('🔑 Razorpay Checkout Debug Info:');
      console.log('Frontend Key:', this.razorpayKeyId);
      console.log('Backend Key:', paymentData.key);
      console.log('Order ID:', paymentData.razorpayOrderId);
      console.log('Amount:', paymentData.amount);
      console.log('Currency:', paymentData.currency);

      const options = {
        description: 'CQ Wealth Account Activation Payment',
        image: RAZORPAY_CONFIG.companyLogo,
        currency: paymentData.currency,
        key: this.razorpayKeyId, // Use frontend key instead of backend key
        amount: paymentData.amount.toString(),
        name: RAZORPAY_CONFIG.companyName,
        order_id: paymentData.razorpayOrderId,
        prefill: {
          email: userDetails.email,
          contact: userDetails.contact,
          name: userDetails.name,
        },
        theme: RAZORPAY_CONFIG.theme,
      };

      console.log('🚀 Opening Razorpay with options:', options);
      const data = await RazorpayCheckout.open(options);
      console.log('✅ Razorpay checkout successful:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Razorpay checkout error:', error);
      return { success: false, error };
    }
  }

  /**
   * Complete payment flow: Create order -> Open checkout -> Verify payment
   */
  async processPayment(
    amount: number,
    userId: number,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    },
    description: string = 'CQ Wealth Payment'
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Step 1: Create payment order on backend
      const paymentRequest: CreatePaymentRequest = {
        amount,
        currency: 'INR',
        receipt: `CQ_${userId}_${Date.now()}`,
        userId,
        description,
      };

      const paymentData = await this.createPaymentOrder(paymentRequest);
      
      if (paymentData.status !== 'created') {
        throw new Error(paymentData.message || 'Failed to create payment order');
      }

      // Step 2: Open Razorpay checkout
      const checkoutResult = await this.openRazorpayCheckout(paymentData, userDetails);
      
      if (!checkoutResult.success) {
        return {
          success: false,
          message: 'Payment cancelled or failed',
          data: checkoutResult.error,
        };
      }

      // Step 3: Verify payment on backend
      const verificationRequest: PaymentVerificationRequest = {
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: checkoutResult.data.razorpay_payment_id,
        razorpaySignature: checkoutResult.data.razorpay_signature,
        userId,
      };

      const verificationResult = await this.verifyPayment(verificationRequest);
      
      if (verificationResult.success) {
        return {
          success: true,
          message: 'Payment completed successfully',
          data: verificationResult,
        };
      } else {
        return {
          success: false,
          message: verificationResult.message || 'Payment verification failed',
        };
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Payment processing failed',
      };
    }
  }

  /**
   * Process CQ Wealth activation payment (₹1000)
   */
  async processActivationPayment(
    userId: number,
    userDetails: {
      name: string;
      email: string;
      contact: string;
    }
  ): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Step 1: Create activation payment order
      const paymentData = await this.createActivationPaymentOrder(userId);
      
      if (paymentData.status !== 'created') {
        throw new Error(paymentData.message || 'Failed to create activation payment order');
      }

      // Step 2: Open Razorpay checkout
      const checkoutResult = await this.openRazorpayCheckout(paymentData, userDetails);
      
      if (!checkoutResult.success) {
        return {
          success: false,
          message: 'Payment cancelled or failed',
          data: checkoutResult.error,
        };
      }

      // Step 3: Verify payment
      const verificationRequest: PaymentVerificationRequest = {
        razorpayOrderId: paymentData.razorpayOrderId,
        razorpayPaymentId: checkoutResult.data.razorpay_payment_id,
        razorpaySignature: checkoutResult.data.razorpay_signature,
        userId,
      };

      const verificationResult = await this.verifyPayment(verificationRequest);
      
      if (verificationResult.success) {
        return {
          success: true,
          message: 'Account activation payment completed successfully',
          data: verificationResult,
        };
      } else {
        return {
          success: false,
          message: verificationResult.message || 'Payment verification failed',
        };
      }
    } catch (error) {
      console.error('Activation payment processing error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Activation payment processing failed',
      };
    }
  }
}

export const razorpayService = new RazorpayService();
