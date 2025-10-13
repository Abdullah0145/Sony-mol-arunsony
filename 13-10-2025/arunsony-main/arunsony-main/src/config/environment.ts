// Environment configuration
export const isDevelopment = __DEV__;
export const isProduction = !__DEV__;

// API Configuration
export const API_CONFIG = {
  baseUrl: 'https://asmlmbackend-production.up.railway.app',
  timeout: 30000,
};

// App Configuration
export const APP_CONFIG = {
  name: 'CQ Wealth',
  version: '1.0.0',
  environment: isDevelopment ? 'development' : 'production',
};
