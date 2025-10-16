# Razorpay Internal Distribution Build Guide

This guide explains how to build an internal distribution APK with full Razorpay SDK support for Android.

## Prerequisites

1. **Node.js and npm** - Ensure you have Node.js v18+ installed
2. **EAS CLI** - Install globally: `npm install -g eas-cli`
3. **Expo Account** - You need to be logged in to EAS
4. **Android SDK** - Required for local builds (optional if building on EAS servers)

## Configuration Files

### 1. `app.json` - Expo Configuration
- Added custom config plugin (`app.plugin.js`) for Razorpay native module support
- Configured `expo-dev-client` for development builds
- Android permissions: `INTERNET`, `ACCESS_NETWORK_STATE`

### 2. `eas.json` - Build Configuration
Three build profiles configured:

#### Development Profile
```json
{
  "development": {
    "distribution": "internal",
    "developmentClient": true,
    "android": {
      "buildType": "apk",
      "gradleCommand": ":app:assembleDebug"
    }
  }
}
```
- **Purpose**: Testing with fast refresh and debugging
- **Output**: Debug APK with dev tools
- **Use case**: Internal testing during development

#### Preview Profile
```json
{
  "preview": {
    "distribution": "internal",
    "developmentClient": true,
    "android": {
      "buildType": "apk",
      "gradleCommand": ":app:assembleRelease"
    }
  }
}
```
- **Purpose**: Production-like testing
- **Output**: Release APK with optimizations
- **Use case**: Pre-production testing and QA

#### Production Profile
```json
{
  "production": {
    "android": {
      "buildType": "apk",
      "gradleCommand": ":app:assembleRelease"
    }
  }
}
```
- **Purpose**: Final production release
- **Output**: Optimized release APK
- **Use case**: Distribution to end users

### 3. `app.plugin.js` - Custom Razorpay Plugin
Automatically configures:
- Maven repository for Razorpay SDK (JitPack)
- ProGuard rules for production builds
- Native module linking

### 4. `proguard-rules.pro` - Code Obfuscation Rules
Protects Razorpay SDK classes from being stripped during minification:
- Keeps all Razorpay classes and methods
- Preserves JavaScript interface methods
- Maintains React Native bridge compatibility

## Building the APK

### Option 1: Using Build Scripts (Recommended)

#### Development Build
```bash
build-razorpay-apk.bat
```

#### Preview Build (Recommended for distribution)
```bash
build-razorpay-preview.bat
```

### Option 2: Manual Build Commands

#### Development Build
```bash
# Install dependencies
npm install

# Prebuild native modules
npx expo prebuild --clean

# Build with EAS (Local)
eas build --profile development --platform android --local
```

#### Preview Build
```bash
# Install dependencies
npm install

# Prebuild native modules
npx expo prebuild --clean

# Build with EAS (Local)
eas build --profile preview --platform android --local
```

#### Cloud Build (Alternative)
If you prefer building on EAS servers (no local Android SDK required):
```bash
# Development
eas build --profile development --platform android

# Preview
eas build --profile preview --platform android
```

## Build Output

After successful build:
- **Local builds**: APK file will be in your project directory
- **Cloud builds**: Download link will be provided in terminal and EAS dashboard

APK naming format: `build-[timestamp].apk`

## Installation on Android Devices

1. **Enable Unknown Sources**: 
   - Go to Settings > Security > Unknown Sources (Enable)
   - Or for newer Android: Settings > Apps > Special Access > Install Unknown Apps

2. **Transfer APK**: 
   - USB transfer, or
   - Cloud storage (Google Drive, Dropbox), or
   - Direct download from EAS dashboard

3. **Install**:
   - Tap the APK file
   - Follow installation prompts

## Testing Razorpay Integration

### Before Testing
1. Ensure you're using the correct Razorpay Key
   - Test Mode: `rzp_test_*` (in `src/config/razorpay.ts`)
   - Live Mode: `rzp_live_*` (currently configured)

2. Backend API must be running and accessible
   - Check API endpoint in `services/api-axios.ts`
   - Ensure payment endpoints are functional

### Test Flow
1. **Register/Login** to the app
2. **Navigate to Payment Screen**
3. **Initiate Payment** (₹1000 activation)
4. **Razorpay Checkout** should open with payment options
5. **Complete Payment** using test/real card
6. **Verify Payment** is processed and user status is updated

### Testing with Test Cards (Test Mode Only)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4111 1111 1111 1112
- CVV: Any 3 digits
- Expiry: Any future date

## Troubleshooting

### Build Fails
1. **Clear cache and rebuild**:
   ```bash
   npm run android -- --clean
   npx expo prebuild --clean
   ```

2. **Check Java version**: Ensure Java 17 is installed
   ```bash
   java -version
   ```

3. **Android SDK**: Verify ANDROID_HOME is set correctly

### Razorpay Not Working
1. **Check API Key**: Verify in `src/config/razorpay.ts`
2. **Check Permissions**: Ensure INTERNET permission is granted
3. **Check Logs**: Use `adb logcat` to view Android logs
4. **Backend Connection**: Test API endpoints with Postman

### ProGuard Issues (Release Builds)
If payment fails in release build:
1. Check `proguard-rules.pro` is applied
2. Verify Razorpay classes are not stripped
3. Test with debug build first

## Environment Configuration

### Development
- Use Razorpay test keys
- Point to development backend
- Enable debug logging

### Production
- Use Razorpay live keys (currently configured)
- Point to production backend
- Disable debug logging

## Security Notes

⚠️ **Important Security Considerations**:

1. **Never commit Razorpay keys to Git**
   - Use environment variables
   - Configure in EAS secrets for cloud builds

2. **Key Configuration for EAS Cloud Builds**:
   ```bash
   eas secret:create --scope project --name RAZORPAY_KEY_ID --value rzp_live_xxx
   ```

3. **Backend Security**:
   - All payment verification must happen on backend
   - Never trust client-side payment status
   - Implement proper signature verification

4. **ProGuard**:
   - Always enable in production builds
   - Protects your code from reverse engineering

## Distribution

### Internal Distribution Options

1. **Direct APK Sharing**:
   - Send APK file directly to testers
   - Best for small teams

2. **EAS Update**:
   - Use for JavaScript-only updates
   - No need to rebuild for minor changes

3. **Firebase App Distribution** (Optional):
   - Automated distribution to testers
   - Crash reporting and analytics

## Next Steps

After successful build:

1. **Test thoroughly** on multiple devices
2. **Verify payment flow** end-to-end
3. **Check all features** work as expected
4. **Gather feedback** from internal testers
5. **Fix issues** and rebuild if necessary
6. **Deploy to production** when ready

## Support

For issues:
- Check EAS build logs: `eas build:list`
- Review Razorpay integration docs: https://razorpay.com/docs/
- Check React Native Razorpay: https://github.com/razorpay/react-native-razorpay

## Version Information

- **Expo SDK**: 53.0.23
- **React Native**: 0.79.5
- **React Native Razorpay**: 2.3.0
- **Expo Dev Client**: 5.2.4

---

**Last Updated**: October 2025
**Maintained by**: Development Team

