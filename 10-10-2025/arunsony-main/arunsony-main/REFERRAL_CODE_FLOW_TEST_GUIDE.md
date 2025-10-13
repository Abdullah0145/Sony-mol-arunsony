# 🧪 **REFERRAL CODE FLOW - LIVE TESTING GUIDE**

## **🚀 APP IS NOW RUNNING**

**Web Interface:** http://localhost:8081  
**Mobile QR Code:** Scan the QR code in your terminal  
**Development Server:** Metro Bundler is active  

---

## **📱 TESTING STEPS**

### **Step 1: Access the App**
1. **Web Browser:** Go to http://localhost:8081
2. **Mobile Device:** Scan the QR code with Expo Go app
3. **Android Emulator:** Press `a` in the terminal

### **Step 2: Test User Registration & Login**
1. **Register a new user:**
   - Email: `testuser@example.com`
   - Name: `Test User`
   - Phone: `+1234567890`
   - Password: `TestPassword123!`

2. **Login with the registered user**
3. **Verify authentication works**

### **Step 3: Test Products Screen**
1. **Navigate to Products screen**
2. **Verify 4 products are loaded:**
   - Starter Package (₹250)
   - Growth Package (₹250) 
   - Success Package (₹250)
   - Elite Package (₹250)

### **Step 4: Test MLM Activation Flow**
1. **Add all 4 products to cart** (required for MLM activation)
2. **Verify cart shows:** "4 items in cart, Total: ₹1000"
3. **Click "Activate MLM (₹1000)" button**
4. **Proceed to checkout**

### **Step 5: Test Payment Flow**
1. **Fill in shipping address**
2. **Choose payment method**
3. **Complete test payment** (₹1 for testing)
4. **Verify payment success**

### **Step 6: Test Referral Code Generation**
1. **After successful payment, you should be redirected to ReferralCodeGeneratedScreen**
2. **Verify the screen shows:**
   - ✅ Success animation
   - ✅ "MLM Account Activated!" message
   - ✅ Your referral code (e.g., REF123456)
   - ✅ Copy and Share buttons

### **Step 7: Test Referral Code Fetching Logic**
1. **Check if referral code is displayed correctly**
2. **Test the "Copy Code" button**
3. **Test the "Share" button**
4. **Navigate to other screens and back to verify persistence**

---

## **🔍 WHAT TO LOOK FOR**

### **✅ Success Indicators**
- **Loading State:** Shows spinner while fetching referral code
- **Success State:** Displays referral code with copy/share options
- **No Errors:** No "failed to fetch referral code" messages
- **Smooth Flow:** Seamless transition from payment to referral code screen

### **⚠️ Error Scenarios to Test**
1. **Network Disconnection:**
   - Disconnect internet during referral code fetch
   - Should show error message with retry button
   - Should fall back to user context data

2. **API Failures:**
   - Backend might return errors
   - Should gracefully handle and show fallback

3. **Token Issues:**
   - Invalid/expired tokens
   - Should prompt for re-login

---

## **🧪 SPECIFIC TEST CASES**

### **Test Case 1: Happy Path**
```
1. Register → Login → Products → Add 4 items → Checkout → Payment → Referral Code
Expected: Referral code displayed successfully
```

### **Test Case 2: Error Handling**
```
1. Complete payment flow
2. Disconnect internet
3. Navigate to referral code screen
Expected: Error message with retry button, fallback to cached data
```

### **Test Case 3: Fallback Logic**
```
1. Complete payment flow
2. API returns error
3. Check referral code screen
Expected: Uses fallback referral code from user context
```

### **Test Case 4: UI Components**
```
1. Check loading spinner appears
2. Check error UI with retry button
3. Check success UI with copy/share buttons
4. Check navigation works properly
```

---

## **📊 EXPECTED RESULTS**

### **Backend API Responses**
- **Health Check:** ✅ 200 OK
- **Products:** ✅ 4 products returned
- **User Registration:** ✅ 200 OK
- **User Login:** ✅ 200 OK with JWT token
- **User Profile:** ✅ 200 OK with referral code
- **Payment Status:** ✅ 200 OK with payment info

### **Frontend Behavior**
- **Loading States:** ✅ Spinners show during API calls
- **Error Handling:** ✅ Graceful error messages
- **Fallback Logic:** ✅ Uses cached data when API fails
- **User Experience:** ✅ Smooth, intuitive flow

### **Referral Code Display**
- **Format:** REF + 6 digits (e.g., REF123456)
- **Copy Function:** ✅ Copies to clipboard
- **Share Function:** ✅ Opens share dialog
- **Persistence:** ✅ Code remains available across screens

---

## **🐛 DEBUGGING TIPS**

### **If Referral Code Doesn't Appear:**
1. **Check Console Logs:** Look for API errors
2. **Check Network Tab:** Verify API calls are successful
3. **Check User Context:** Verify user data has referral code
4. **Check Fallback:** Ensure fallback logic is working

### **If Errors Occur:**
1. **Check Error Messages:** Should be user-friendly
2. **Check Retry Button:** Should allow retrying failed requests
3. **Check Fallback:** Should use cached data as backup
4. **Check Navigation:** Should allow going back

### **Console Commands for Debugging:**
```javascript
// Check user data
console.log('User:', user);

// Check referral code
console.log('Referral Code:', user?.refer || user?.referralCode);

// Check API responses
console.log('API Response:', response);
```

---

## **📱 MOBILE TESTING**

### **Android Testing:**
1. **Press `a` in terminal** to open Android emulator
2. **Or scan QR code** with Expo Go app on physical device
3. **Test touch interactions** and mobile-specific features

### **iOS Testing:**
1. **Press `i` in terminal** to open iOS simulator
2. **Or scan QR code** with Expo Go app on iPhone
3. **Test iOS-specific behaviors**

---

## **🎯 SUCCESS CRITERIA**

The referral code flow test is **SUCCESSFUL** if:

1. ✅ **User can complete full MLM activation flow**
2. ✅ **Referral code is generated and displayed**
3. ✅ **Copy and Share functions work**
4. ✅ **Error handling works gracefully**
5. ✅ **Fallback logic provides backup**
6. ✅ **UI is responsive and user-friendly**
7. ✅ **No "failed to fetch referral code" errors**

---

## **📋 TEST CHECKLIST**

- [ ] App loads successfully
- [ ] User registration works
- [ ] User login works
- [ ] Products screen loads 4 products
- [ ] Cart functionality works
- [ ] Checkout process works
- [ ] Payment processing works
- [ ] Referral code screen appears
- [ ] Referral code is displayed
- [ ] Copy button works
- [ ] Share button works
- [ ] Error handling works
- [ ] Fallback logic works
- [ ] Navigation works properly
- [ ] No console errors
- [ ] Smooth user experience

---

## **🚨 IF ISSUES OCCUR**

1. **Check the terminal** for any error messages
2. **Check browser console** for JavaScript errors
3. **Check network tab** for failed API calls
4. **Try the retry button** if errors appear
5. **Refresh the app** if needed
6. **Check the test results document** for known issues

---

**🎉 Ready to test! The referral code flow should now work perfectly with all the fixes applied!**
