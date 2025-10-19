# Razorpay Integration Setup Guide

## Overview
This guide will help you set up Razorpay payment integration in your React Native Expo app. Since you're using Expo, you'll need to create a development build to use native modules like Razorpay.

## Prerequisites
- Your backend is already configured with Razorpay (✅ Done)
- Razorpay account with test/live keys
- Expo CLI installed
- EAS CLI installed (for building)

## Step 1: Configure Your Razorpay Keys

1. **Update the configuration file:**
   Edit `src/config/razorpay.ts` and replace the placeholder values:

   ```typescript
   export const RAZORPAY_CONFIG = {
     // Replace with your actual Razorpay key ID
     keyId: 'rzp_test_your_actual_key_id_here',
     
     // Replace with your company details
     companyName: 'Your MLM Company Name',
     companyLogo: 'https://your-logo-url.com/logo.png',
     
     // Set environment
     environment: 'test', // Change to 'production' for live
   };
   ```

2. **Get your Razorpay keys:**
   - Login to your Razorpay Dashboard
   - Go to Settings → API Keys
   - Copy your Test Key ID (starts with `rzp_test_`)
   - For production, use Live Key ID (starts with `rzp_live_`)

## Step 2: Build Development Client

Since Razorpay requires native modules, you need to create a development build:

1. **Install EAS CLI (if not already installed):**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **Login to Expo:**
   ```bash
   eas login
   ```

3. **Configure EAS Build:**
   ```bash
   eas build:configure
   ```

4. **Build for Android:**
   ```bash
   eas build --profile development --platform android
   ```

5. **Build for iOS (if needed):**
   ```bash
   eas build --profile development --platform ios
   ```

## Step 3: Install and Test

1. **Install the development build:**
   - Download the APK/IPA from the EAS build link
   - Install it on your device/emulator

2. **Start the development server:**
   ```bash
   npx expo start --dev-client
   ```

3. **Open the app:**
   - Use the development build app (not Expo Go)
   - Scan the QR code or enter the URL

## Step 4: Integration Examples

### Basic Payment Integration

```typescript
import { razorpayService } from './services/razorpayService';

// Process a payment
const result = await razorpayService.processPayment(
  1000, // Amount in rupees
  userId, // Your user ID
  {
    name: 'John Doe',
    email: 'john@example.com',
    contact: '9876543210'
  },
  'Payment description'
);

if (result.success) {
  console.log('Payment successful:', result.data);
} else {
  console.log('Payment failed:', result.message);
}
```

### Account Activation Payment

```typescript
import { ActivationPaymentButton } from './components/ActivationPaymentButton';

// In your component
<ActivationPaymentButton
  userId={userId}
  userDetails={userDetails}
  onActivationSuccess={(data) => {
    // Handle successful activation
    console.log('Account activated:', data);
  }}
/>
```

### Custom Payment Modal

```typescript
import { PaymentModal } from './components/PaymentModal';

// In your component
<PaymentModal
  visible={showPayment}
  onClose={() => setShowPayment(false)}
  onPaymentSuccess={(data) => {
    // Handle successful payment
    console.log('Payment successful:', data);
  }}
  amount={1000}
  userId={userId}
  userDetails={userDetails}
  description="Custom payment description"
/>
```

## Step 5: Backend Integration

Your backend is already configured. The frontend will make requests to:

- `POST /api/payments/create-order` - Create payment order
- `POST /api/payments/verify` - Verify payment
- `POST /api/payments/create-activation-order` - Create activation payment

Make sure your backend URL is correctly configured in `services/api-axios.ts`.

## Step 6: Testing

### Test Mode
- Use Razorpay test keys
- Use test card numbers:
  - Success: `4111 1111 1111 1111`
  - Failure: `4000 0000 0000 0002`
  - CVV: Any 3 digits
  - Expiry: Any future date

### Production Mode
- Switch to live keys in `razorpay.ts`
- Set `environment: 'production'`
- Test with real payment methods

## Step 7: Webhook Configuration

Your backend already handles webhooks at `/api/payments/webhook`. Configure this URL in your Razorpay dashboard:

1. Go to Razorpay Dashboard → Settings → Webhooks
2. Add webhook URL: `https://your-backend-url.com/api/payments/webhook`
3. Select events: `payment.captured`, `payment.failed`

## Troubleshooting

### Common Issues

1. **"Cannot read property 'Open' of null"**
   - This happens in Expo Go. Use development build instead.

2. **"Invalid key"**
   - Check your Razorpay key ID in `razorpay.ts`
   - Ensure you're using the correct test/live key

3. **"Order not found"**
   - Check backend API connectivity
   - Verify order creation is successful

4. **Payment verification fails**
   - Check webhook signature verification
   - Ensure backend has correct secret key

### Debug Steps

1. **Check console logs:**
   ```typescript
   console.log('Payment result:', result);
   ```

2. **Verify API calls:**
   - Check network requests in React Native debugger
   - Verify backend logs

3. **Test backend endpoints:**
   - Use Postman to test payment creation
   - Verify webhook delivery

## Security Considerations

1. **Never expose secret keys in frontend**
2. **Always verify payments on backend**
3. **Use HTTPS in production**
4. **Implement proper error handling**
5. **Log all payment attempts**

## Production Deployment

1. **Update configuration:**
   ```typescript
   environment: 'production',
   keyId: 'rzp_live_your_live_key_id',
   ```

2. **Build production version:**
   ```bash
   eas build --profile production --platform android
   ```

3. **Test thoroughly with real payments**

## Support

- Razorpay Documentation: https://razorpay.com/docs/
- React Native Razorpay: https://github.com/razorpay/react-native-razorpay
- Expo Development Build: https://docs.expo.dev/development/introduction/

## Files Created/Modified

- `services/razorpayService.ts` - Main Razorpay service
- `components/PaymentModal.tsx` - Payment modal component
- `components/ActivationPaymentButton.tsx` - Activation payment button
- `components/PaymentExample.tsx` - Example usage
- `src/config/razorpay.ts` - Configuration file
- `app.json` - Added expo-dev-client plugin
- `package.json` - Added dependencies

## Next Steps

1. Configure your Razorpay keys
2. Build development client
3. Test payment flow
4. Integrate into your existing screens
5. Deploy to production
