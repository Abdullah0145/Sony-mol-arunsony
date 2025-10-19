# Withdraw Screen - Form Validations

## Overview
Added comprehensive form validations to the Withdraw Earnings screen to ensure data integrity and prevent invalid withdrawal requests.

## Validation Rules Implemented

### 1. **Amount Validation**
- **Required**: Amount cannot be empty
- **Valid Number**: Must be a positive number greater than 0
- **Sufficient Balance**: Amount cannot exceed available balance
- **Minimum Amount**: Must meet the minimum withdrawal requirement for selected payment method
  - UPI: ₹100
  - Bank Transfer: ₹500
  - Paytm: ₹50
  - Google Pay: ₹100

**Error Messages:**
- "Amount is required"
- "Please enter a valid amount"
- "Insufficient balance (Available: ₹X)"
- "Minimum amount is ₹X"

### 2. **UPI ID Validation**
- **Required**: UPI ID cannot be empty
- **Format**: Must follow UPI format: `username@provider`
- **Examples**: `user@paytm`, `9876543210@ybl`, `john.doe@oksbi`

**Error Messages:**
- "UPI ID is required"
- "Invalid UPI ID format (e.g., user@paytm)"

### 3. **Bank Transfer Validation**

#### Account Holder Name
- **Required**: Cannot be empty
- **Minimum Length**: At least 3 characters
- **Characters**: Only letters, spaces, and periods allowed
- **Examples**: `John Doe`, `A.K. Sharma`

**Error Messages:**
- "Account holder name is required"
- "Name must be at least 3 characters"
- "Name should contain only letters"

#### Account Number
- **Required**: Cannot be empty
- **Length**: 9-18 digits
- **Format**: Only numeric digits
- **Examples**: `123456789012`, `1234567890123456`

**Error Messages:**
- "Account number is required"
- "Account number must be 9-18 digits"
- "Account number must contain only digits"

#### IFSC Code
- **Required**: Cannot be empty
- **Format**: Indian IFSC format (11 characters)
  - First 4 characters: Bank code (letters)
  - 5th character: Always '0'
  - Last 6 characters: Branch code (alphanumeric)
- **Auto-uppercase**: Automatically converts to uppercase
- **Max Length**: 11 characters
- **Examples**: `SBIN0001234`, `HDFC0000123`, `ICIC0001234`

**Error Messages:**
- "IFSC code is required"
- "Invalid IFSC code format (e.g., SBIN0001234)"

#### Bank Name
- **Required**: Cannot be empty
- **Minimum Length**: At least 3 characters
- **Examples**: `State Bank of India`, `HDFC Bank`, `ICICI Bank`

**Error Messages:**
- "Bank name is required"
- "Bank name must be at least 3 characters"

### 4. **Mobile Number Validation** (for Paytm/Google Pay)
- **Required**: Cannot be empty
- **Format**: 10 digits starting with 6, 7, 8, or 9 (Indian mobile numbers)
- **Max Length**: 10 digits
- **Examples**: `9876543210`, `8765432109`, `7654321098`

**Error Messages:**
- "Mobile number is required"
- "Invalid mobile number (10 digits starting with 6-9)"

## UI/UX Features

### Visual Feedback
1. **Required Field Indicator**: All fields marked with asterisk (*)
2. **Error Highlighting**: Invalid fields show red border
3. **Inline Error Messages**: Error text appears below each field in red
4. **Real-time Validation**: Errors clear as user types
5. **Auto-formatting**:
   - IFSC Code: Auto-uppercase
   - Mobile Number: Limited to 10 digits
   - Account Holder Name: Auto-capitalize words
   - Bank Name: Auto-capitalize words

### User Flow
```
1. User fills the form
2. User clicks "Withdraw Now"
3. Validation runs automatically
4. If errors exist:
   - Alert shown: "Validation Error - Please fix the errors in the form"
   - Invalid fields highlighted in red
   - Error messages displayed below fields
5. If validation passes:
   - Confirmation dialog appears
   - User confirms withdrawal
   - Request submitted
```

## Code Structure

### Validation Functions
```typescript
validateAmount(amt: string): string
validateUpiId(upi: string): string
validateAccountNumber(accNum: string): string
validateIfscCode(ifsc: string): string
validateAccountHolderName(name: string): string
validateBankName(bank: string): string
validateMobileNumber(mobile: string): string
validateForm(): boolean
clearErrors(): void
```

### State Management
```typescript
const [errors, setErrors] = useState({
  amount: '',
  upiId: '',
  accountNumber: '',
  ifscCode: '',
  accountHolderName: '',
  bankName: '',
  mobileNumber: '',
});
```

### Styles
```typescript
inputError: {
  borderWidth: 1,
  borderColor: '#FF4444',
}

errorText: {
  color: '#FF4444',
  fontSize: 12,
  marginTop: -10,
  marginBottom: 10,
  paddingLeft: 5,
}
```

## Examples

### Valid Inputs
```
Amount: 1000
UPI ID: user@paytm
Account Number: 123456789012
IFSC Code: SBIN0001234
Account Holder Name: John Doe
Bank Name: State Bank of India
Mobile Number: 9876543210
```

### Invalid Inputs (with errors)
```
Amount: 50 → "Minimum amount is ₹100" (for UPI)
UPI ID: userpaytm → "Invalid UPI ID format (e.g., user@paytm)"
Account Number: 12345 → "Account number must be 9-18 digits"
IFSC Code: SBIN123 → "Invalid IFSC code format (e.g., SBIN0001234)"
Account Holder Name: Jo → "Name must be at least 3 characters"
Mobile Number: 5876543210 → "Invalid mobile number (10 digits starting with 6-9)"
```

## Testing Checklist
- [ ] Amount validation works for all payment methods
- [ ] UPI ID format validation works correctly
- [ ] Bank account details all validate properly
- [ ] IFSC code auto-converts to uppercase
- [ ] Mobile number limited to 10 digits
- [ ] Error messages display below fields
- [ ] Invalid fields show red border
- [ ] Errors clear when user starts typing
- [ ] Form cannot be submitted with errors
- [ ] Validation alert appears on submission with errors
- [ ] Successful submission clears all fields and errors
- [ ] All required fields marked with asterisk (*)

## Benefits
1. ✅ **Data Integrity**: Ensures only valid data is submitted
2. ✅ **Better UX**: Immediate feedback to users
3. ✅ **Reduced Errors**: Prevents backend errors from invalid data
4. ✅ **User Guidance**: Clear error messages guide users
5. ✅ **Professional**: Industry-standard validation patterns

