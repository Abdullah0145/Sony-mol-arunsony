# 🧪 **FRESH USER TEST GUIDE - ₹1 Referral Code Generation**

## **📋 OVERVIEW**

This guide will help you test the ₹1 payment flow with a fresh user to properly generate referral codes.

---

## **🎯 STEP-BY-STEP TESTING PROCESS**

### **Step 1: Create Fresh User in Frontend App**

1. **Open your React Native app**
2. **Go to Registration Screen**
3. **Register with these details:**
   - **Name:** `Fresh Test User`
   - **Email:** `freshtest@example.com`
   - **Phone:** `7777777777`
   - **Password:** `testpass123`
   - **Referral Code:** (leave empty)

4. **Check your email for OTP** (it will be sent to `freshtest@example.com`)
5. **Enter the OTP** to complete registration

### **Step 2: Login with Fresh User**

1. **Login with:**
   - **Email:** `freshtest@example.com`
   - **Password:** `testpass123`

2. **Verify user status:**
   - User should have `isFirstOrder: true`
   - User should have `hasPaidActivation: false`

### **Step 3: Test ₹1 Payment Flow**

1. **Add 4 products to cart** (any 4 products)
2. **Go to checkout**
3. **Enter shipping address:** `Test Address`
4. **Click "Test Mode - Pay ₹1"** button
5. **Complete the ₹1 payment** in Razorpay
6. **Check the referral code screen**

### **Step 4: Verify Results**

**Expected Results:**
- ✅ **Payment successful** (₹1)
- ✅ **User status updated:** `hasPaidActivation: true`, `isFirstOrder: false`
- ✅ **Referral code generated:** Format `REF123456`
- ✅ **No TypeError errors**

---

## **🔍 TROUBLESHOOTING**

### **If OTP doesn't arrive:**
- Check spam folder
- Wait 1-2 minutes
- Try a different email address

### **If payment fails:**
- Ensure you have ₹1 in your Razorpay test account
- Check internet connection
- Try the ₹1000 payment as backup

### **If referral code doesn't show:**
- Check terminal logs for errors
- Verify user status in backend
- Ensure payment verification completed

---

## **📊 EXPECTED BACKEND LOGS**

When successful, you should see:
```
✅ Order created successfully
✅ Payment order created
✅ Payment verification successful
✅ User payment status updated: hasPaidActivation=true, isFirstOrder=false
✅ Referral code generated: REF123456
```

---

## **🎉 SUCCESS CRITERIA**

The test is successful when:
1. ✅ Fresh user registration works
2. ✅ ₹1 payment completes successfully
3. ✅ Referral code is displayed on screen
4. ✅ No TypeError or API errors
5. ✅ User status shows `hasPaidActivation: true`

---

## **📝 NOTES**

- **Fresh users** start with `isFirstOrder: true`
- **Referral code generation** only happens on first order
- **₹1 test payment** will work with fresh users
- **Existing users** with `isFirstOrder: false` won't generate new referral codes

**Ready to test! 🚀**
