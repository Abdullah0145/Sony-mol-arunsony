# 🚀 CQ Wealth - Internal Distribution Build with Razorpay

## 📱 Quick Start (For First-Time Builders)

### Prerequisites
- ✅ Windows PC
- ✅ Node.js v18+ installed
- ✅ Internet connection

### Build in 4 Steps

#### Step 1: Open Terminal
Open PowerShell or Command Prompt in the `arunsony` folder

#### Step 2: Verify Setup
```bash
verify-razorpay-setup.bat
```
This checks if everything is ready to build.

#### Step 3: Install & Login (First time only)
```bash
npm install
npm install -g eas-cli
eas login
```

#### Step 4: Build APK
```bash
build-razorpay-preview.bat
```

**That's it!** The APK will be created in the current folder.

---

## 📂 Files Overview

### 🔨 Build Scripts
| File | Purpose | When to Use |
|------|---------|-------------|
| `verify-razorpay-setup.bat` | Check if ready to build | Before first build |
| `build-razorpay-apk.bat` | Build development APK | Daily testing |
| `build-razorpay-preview.bat` | Build preview APK | ⭐ **Distribution** |

### 📖 Documentation
| File | Purpose |
|------|---------|
| `BUILD_README.md` | **This file** - Start here |
| `QUICK_BUILD_REFERENCE.md` | Quick commands & tips |
| `RAZORPAY_BUILD_GUIDE.md` | Detailed build instructions |
| `RAZORPAY_SETUP_SUMMARY.md` | Technical setup details |

### ⚙️ Configuration Files
| File | Purpose |
|------|---------|
| `app.json` | Expo app configuration |
| `eas.json` | Build profiles |
| `app.plugin.js` | Custom Razorpay plugin |
| `package.json` | Dependencies |
| `src/config/razorpay.ts` | Razorpay API keys |

---

## 🎯 Which Build Should I Use?

```
┌─────────────────────────────────────────────────────────┐
│                     Choose Your Build                   │
└─────────────────────────────────────────────────────────┘

🧪 Development Build
   └─► build-razorpay-apk.bat
   ├─► Use for: Testing new features
   ├─► Size: Large (~50-80 MB)
   ├─► Speed: Fast (5-10 min)
   └─► Includes: Debug tools

📦 Preview Build ⭐ RECOMMENDED
   └─► build-razorpay-preview.bat
   ├─► Use for: Sharing with team/testers
   ├─► Size: Medium (~30-50 MB)
   ├─► Speed: Medium (8-15 min)
   └─► Includes: Optimizations

🚀 Production Build
   └─► eas build --profile production --platform android
   ├─► Use for: Final release
   ├─► Size: Small (~20-40 MB)
   ├─► Speed: Slow (10-20 min)
   └─► Includes: Max optimizations
```

---

## 💡 Common Scenarios

### Scenario 1: First Time Building
```bash
# Check setup
verify-razorpay-setup.bat

# Install dependencies
npm install

# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
build-razorpay-preview.bat
```

### Scenario 2: Daily Development
```bash
# Quick build for testing
build-razorpay-apk.bat
```

### Scenario 3: Share with Team
```bash
# Build optimized version
build-razorpay-preview.bat

# Share the generated APK file
```

### Scenario 4: Update After Code Changes
```bash
# Just rebuild
build-razorpay-preview.bat
```

---

## 📱 Installing on Android Device

### Method 1: USB Transfer
1. Connect Android device to PC via USB
2. Copy APK to device (e.g., Downloads folder)
3. Open file manager on device
4. Tap the APK file
5. Tap "Install"

### Method 2: Cloud Share
1. Upload APK to Google Drive / Dropbox
2. Open link on Android device
3. Download APK
4. Tap to install

### ⚠️ Enable Installation
If you see "Installation blocked":
1. Go to Settings
2. Find "Install unknown apps" or "Unknown sources"
3. Enable for your file manager / browser
4. Try installing again

---

## 🧪 Testing Razorpay Payment

### After Installing APK:

1. **Open app** on your device
2. **Register** new account or **Login**
3. **Navigate** to payment screen
4. **Click** "Pay ₹1000" button
5. **Razorpay checkout** should open
6. **Complete** payment with test/real card
7. **Verify** payment success message

### Test Cards (Test Mode Only)
- **Success:** 4111 1111 1111 1111
- **Failure:** 4111 1111 1111 1112
- **CVV:** Any 3 digits
- **Expiry:** Any future date

### Live Mode (Currently Configured)
- Use real payment cards
- Actual money will be charged
- Test mode key: Change in `src/config/razorpay.ts`

---

## 🐛 Troubleshooting

### Build Fails

**Error: "EAS CLI not found"**
```bash
npm install -g eas-cli
```

**Error: "Not logged in"**
```bash
eas login
```

**Error: "Native module not found"**
```bash
npx expo prebuild --clean
npm install
build-razorpay-preview.bat
```

**Error: "Build failed with Gradle error"**
```bash
cd android
gradlew clean
cd ..
build-razorpay-preview.bat
```

### Razorpay Not Working

**Problem: Payment UI doesn't open**
- Check internet connection
- Verify API key in `src/config/razorpay.ts`
- Check backend API is running

**Problem: Payment succeeds but verification fails**
- Check backend logs
- Verify signature verification logic
- Test backend API endpoints

### APK Installation Issues

**Problem: "App not installed"**
- Free up storage space
- Uninstall old version first
- Try rebooting device

**Problem: "Installation blocked"**
- Enable "Unknown sources" in settings
- Use different file manager

---

## 📊 Build Time & Size Reference

### Development Build
- **Build Time:** 5-10 minutes (local), 15-20 minutes (cloud)
- **APK Size:** 50-80 MB
- **Install Size:** 100-150 MB

### Preview Build (Recommended)
- **Build Time:** 8-15 minutes (local), 20-30 minutes (cloud)
- **APK Size:** 30-50 MB
- **Install Size:** 70-100 MB

### Production Build
- **Build Time:** 10-20 minutes (local), 25-40 minutes (cloud)
- **APK Size:** 20-40 MB
- **Install Size:** 50-80 MB

*Times vary based on machine specs and internet connection*

---

## 🔍 Build Status Indicators

During build, you'll see:

```
✅ Dependencies installed
✅ Native code generated
✅ JavaScript bundled
✅ Android compiled
✅ APK signed
✅ Build complete
```

If any step fails, check the error message and refer to troubleshooting.

---

## 🎓 Learning Path

### Beginner
1. Read this file (BUILD_README.md)
2. Run `verify-razorpay-setup.bat`
3. Try building with `build-razorpay-preview.bat`
4. Install and test on device

### Intermediate
1. Read `QUICK_BUILD_REFERENCE.md`
2. Understand build profiles
3. Customize build for your needs
4. Test different scenarios

### Advanced
1. Read `RAZORPAY_BUILD_GUIDE.md`
2. Understand `RAZORPAY_SETUP_SUMMARY.md`
3. Modify configuration files
4. Implement custom features

---

## 📞 Support Checklist

Before asking for help, verify:

- [ ] Ran `verify-razorpay-setup.bat`
- [ ] Node.js v18+ installed
- [ ] Ran `npm install` successfully
- [ ] EAS CLI installed globally
- [ ] Logged into EAS
- [ ] Internet connection stable
- [ ] Enough disk space (10GB+)
- [ ] Android device has "Unknown sources" enabled
- [ ] Backend API is running and accessible

---

## 🎯 Success Criteria

Your build is successful when:

✅ Build script completes without errors  
✅ APK file is generated  
✅ APK installs on Android device  
✅ App opens without crashes  
✅ Can register/login  
✅ Razorpay checkout opens  
✅ Payment can be completed  
✅ Payment verification works  
✅ User account activates after payment  

---

## 🚀 Production Deployment

When ready to deploy:

1. **Switch to Live Razorpay Key** (if needed)
   - Edit `src/config/razorpay.ts`
   - Change `environment` to `'production'`

2. **Build Production APK**
   ```bash
   eas build --profile production --platform android
   ```

3. **Test Thoroughly**
   - Test all features
   - Verify payments work
   - Check on multiple devices

4. **Distribute**
   - Upload to Google Play Store, or
   - Distribute via Firebase App Distribution, or
   - Share APK directly with users

---

## 🔐 Security Reminders

⚠️ **Important:**

1. **Never commit API keys** to Git
2. **Use environment variables** for sensitive data
3. **Always verify payments** on backend
4. **Enable ProGuard** for production builds
5. **Keep dependencies updated**
6. **Monitor payment logs**

---

## 📝 Quick Commands Cheat Sheet

```bash
# Verify setup
verify-razorpay-setup.bat

# Install dependencies
npm install

# Install EAS CLI
npm install -g eas-cli

# Login to EAS
eas login

# Build development APK
build-razorpay-apk.bat

# Build preview APK (recommended)
build-razorpay-preview.bat

# Build production APK
eas build --profile production --platform android

# Check build status
eas build:list

# Clean and rebuild
npx expo prebuild --clean
build-razorpay-preview.bat
```

---

## 🌟 Tips for Success

1. **Start Simple**
   - Build development APK first
   - Test on one device
   - Expand testing gradually

2. **Test Early, Test Often**
   - Build frequently during development
   - Test on real devices
   - Catch issues early

3. **Keep Documentation Handy**
   - Bookmark these files
   - Refer to troubleshooting section
   - Read error messages carefully

4. **Backup Your Work**
   - Commit to Git regularly
   - Keep APK versions organized
   - Document changes

5. **Stay Updated**
   - Update dependencies periodically
   - Check for Expo SDK updates
   - Monitor Razorpay SDK changes

---

## 📚 File Navigation

```
arunsony/
│
├─ 📖 Documentation (READ THESE)
│  ├─ BUILD_README.md ← START HERE
│  ├─ QUICK_BUILD_REFERENCE.md
│  ├─ RAZORPAY_BUILD_GUIDE.md
│  └─ RAZORPAY_SETUP_SUMMARY.md
│
├─ 🔨 Build Scripts (RUN THESE)
│  ├─ verify-razorpay-setup.bat
│  ├─ build-razorpay-apk.bat
│  └─ build-razorpay-preview.bat
│
├─ ⚙️ Configuration (DON'T TOUCH UNLESS YOU KNOW)
│  ├─ app.json
│  ├─ eas.json
│  ├─ app.plugin.js
│  ├─ package.json
│  └─ src/config/razorpay.ts
│
└─ 📱 App Code (YOUR CODE HERE)
   ├─ screens/
   ├─ components/
   └─ services/
```

---

## ✨ You're All Set!

Everything you need to build an internal distribution APK with Razorpay support is configured and ready.

**Next Step:**
```bash
verify-razorpay-setup.bat
```

Then:
```bash
build-razorpay-preview.bat
```

**Questions?** Check the troubleshooting section or documentation files.

**Good luck!** 🚀

---

*Last updated: October 11, 2025*  
*Expo SDK: 53.0.23 | React Native: 0.79.5 | Razorpay: 2.3.0*

