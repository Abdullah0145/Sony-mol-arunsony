# Quick Build Reference - Razorpay APK

## 🚀 Quick Start (3 Steps)

### 1. Install Dependencies
```bash
npm install
```

### 2. Login to EAS (First time only)
```bash
npx eas login
```

### 3. Build APK

**For Testing (Development Build)**:
```bash
build-razorpay-apk.bat
```

**For Distribution (Preview Build)** - ⭐ RECOMMENDED:
```bash
build-razorpay-preview.bat
```

---

## 📱 Build Profiles Comparison

| Profile | Build Time | Size | Debug Tools | Razorpay | Use Case |
|---------|-----------|------|-------------|----------|----------|
| **Development** | Fast | Large | ✅ Yes | ✅ Yes | Internal testing |
| **Preview** | Medium | Medium | ❌ No | ✅ Yes | Pre-production QA |
| **Production** | Slow | Small | ❌ No | ✅ Yes | Public release |

---

## ⚡ Manual Commands

### Local Build (Requires Android SDK)
```bash
# Development
eas build --profile development --platform android --local

# Preview (Recommended)
eas build --profile preview --platform android --local
```

### Cloud Build (No Android SDK required)
```bash
# Development
eas build --profile development --platform android

# Preview (Recommended)
eas build --profile preview --platform android
```

---

## 🔍 Verify Build

After building, test Razorpay integration:

1. ✅ Install APK on Android device
2. ✅ Open app and register/login
3. ✅ Navigate to payment screen
4. ✅ Click "Pay ₹1000" button
5. ✅ Razorpay checkout opens
6. ✅ Complete payment
7. ✅ Verify payment success

---

## 🛠️ Troubleshooting

### Build Fails
```bash
# Clean and rebuild
npx expo prebuild --clean
npm install
```

### Razorpay Not Opening
- Check: `src/config/razorpay.ts` has correct API key
- Verify: Internet permission in `app.json`
- Test: Backend API is accessible

### APK Install Fails
- Enable "Install from Unknown Sources" in Android settings
- Check: Device has enough storage
- Try: Uninstall old version first

---

## 📦 What's Included

✅ Razorpay SDK v2.3.0  
✅ Payment verification  
✅ ProGuard rules for security  
✅ Custom Expo config plugin  
✅ Internal distribution support  
✅ Development & Preview builds  

---

## 📝 Files Modified

| File | Purpose |
|------|---------|
| `app.json` | Added Razorpay plugin |
| `eas.json` | Configured build profiles |
| `app.plugin.js` | Custom Razorpay integration |
| `android/app/proguard-rules.pro` | Security rules |
| `metro.config.js` | Metro bundler config |

---

## 🎯 Recommended Build Flow

1. **Development Phase**: Use `development` profile
   - Fast iteration
   - Debug tools available
   - Test features quickly

2. **Testing Phase**: Use `preview` profile
   - Test production-like build
   - Catch release-only issues
   - Share with QA team

3. **Release Phase**: Use `production` profile
   - Final optimized build
   - Deploy to users
   - Maximum performance

---

## 📚 Need More Details?

See: `RAZORPAY_BUILD_GUIDE.md` for comprehensive documentation

---

**Quick Support Checklist**

- [ ] Node.js v18+ installed
- [ ] `npm install` completed
- [ ] Logged into EAS (`eas login`)
- [ ] Android device ready for testing
- [ ] Backend API is running
- [ ] Razorpay key configured

---

**Build Time Estimates**

- Development: ~5-10 minutes (local), ~15-20 minutes (cloud)
- Preview: ~8-15 minutes (local), ~20-30 minutes (cloud)
- Production: ~10-20 minutes (local), ~25-40 minutes (cloud)

*Times vary based on machine specs and internet connection*

