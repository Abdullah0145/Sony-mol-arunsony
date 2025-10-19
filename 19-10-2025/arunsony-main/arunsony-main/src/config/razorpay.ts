// Razorpay Configuration
// Replace these with your actual Razorpay keys

export const RAZORPAY_CONFIG = {
  // Test keys (for development)
  // keyId: 'rzp_test_v0oLerNqSI17tx',
  
  // Production keys (for production)
  keyId: 'rzp_live_AEcWKhM01jAKqu',
  
  // Company details
  companyName: 'CQ Wealth Company',
  companyLogo: 'https://your-logo-url.com/logo.png', // Replace with your logo URL
  
  // Theme colors
  theme: {
    color: '#F37254', // Razorpay orange
    // You can customize this color
  },
  
  // Currency
  currency: 'INR',
  
  // Environment
  environment: 'production', // Live environment for real payments
};

// Helper function to get the appropriate key based on environment
export const getRazorpayKey = (): string => {
  return RAZORPAY_CONFIG.keyId;
};

// Helper function to check if we're in test mode
export const isTestMode = (): boolean => {
  return RAZORPAY_CONFIG.environment === 'test';
};
