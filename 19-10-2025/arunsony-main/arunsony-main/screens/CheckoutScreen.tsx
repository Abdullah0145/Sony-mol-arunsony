import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import RazorpayCheckout from 'react-native-razorpay';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../components/AuthContext';
import { apiService } from '../services/apiService';
import { apiServiceAxios } from '../services/api-axios';
import SuccessModal from '../components/SuccessModal';

interface CartItem {
  productId: number;
  quantity: number;
}

interface Product {
  id: number;
  productName: string;
  name: string;
  price: number;
}

interface RouteParams {
  cart: CartItem[];
  totalPrice: number;
  isFirstOrder: boolean;
}

const CheckoutScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user, updatePaymentStatus } = useAuth();
  const { cart, totalPrice, isFirstOrder } = route.params as RouteParams;
  
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingState, setShippingState] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [loading, setLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await apiService.getProducts();
      setProducts((response.data as Product[]) || []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const getProductDetails = (productId: number) => {
    return products?.find(p => p.id === productId);
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      
      const orderItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const userId = Number(user?.userId || user?.id || 0);
      console.log('Creating order with userId:', userId, 'User object:', user);
      
      // Use new backend endpoint with Razorpay integration
      const response = await apiServiceAxios.createOrderWithRazorpay(
        orderItems,
        userId,
        shippingAddress,
        shippingName,
        shippingPhone,
        shippingCity,
        shippingState,
        shippingPincode
      );

      console.log('Order created with Razorpay:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createPaymentOrder = async (testMode: boolean = false) => {
    try {
      if (testMode) {
        // Create a test payment order for ₹1
        const testPaymentOrder = {
          key: 'rzp_live_AEcWKhM01jAKqu', // Use same live key as backend
          amount: 100, // ₹1 in paise
          currency: 'INR',
          razorpayOrderId: 'test_order_' + Date.now(),
          description: 'Test CQ Wealth Activation Payment'
        };
        console.log('Test payment order created:', testPaymentOrder);
        return testPaymentOrder;
      } else {
        const response = await apiService.createActivationPaymentOrder(Number(user?.userId || user?.id || 0));
        console.log('Payment order created:', response.data);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  };

  const createRealRazorpayOrderForTest = async () => {
    try {
      // Create a real Razorpay order for ₹1 using the backend
      const response = await fetch(
        `https://asmlmbackend-production.up.railway.app/api/payments/create-razorpay-order?userId=${user?.userId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(user as any)?.token || ''}`
          },
          body: JSON.stringify({
            amount: 100, // ₹1 in paise
            currency: 'INR',
            receipt: `CQ_TEST_ACTIVATION_${user?.userId}_${Date.now()}`
          })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to create Razorpay order for test');
      }

      const paymentOrder = await response.json();
      console.log('Real Razorpay order created for ₹1:', paymentOrder);
      return paymentOrder;
    } catch (error) {
      console.error('Error creating real Razorpay order for test:', error);
      throw error;
    }
  };

  const processTestPayment = async () => {
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingState.trim() || !shippingPincode.trim()) {
      Alert.alert('Shipping Details Required', 'Please fill in all shipping details including name, phone, address, city, state, and pincode.');
      return;
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create order in backend (this creates PENDING order)
      const order = await createOrder();
      console.log('Order created successfully:', order);

      // Check if order requires payment
      if (order && order.requiresPayment && order.activationStatus === 'PENDING_PAYMENT') {
        // Step 2: Create real Razorpay order for ₹1
        const paymentOrder = await createRealRazorpayOrderForTest();
        console.log('Real Razorpay order created for ₹1:', paymentOrder);

        // Validate payment order
        if (!paymentOrder || !paymentOrder.id || !paymentOrder.amount) {
          throw new Error('Invalid payment order response from server');
        }

        // Step 3: Process real Razorpay payment for ₹1
        const options = {
          description: 'CQ Wealth Activation Payment (₹1 Test)',
          image: 'https://your-logo-url.com/logo.png',
          currency: paymentOrder.currency || 'INR',
          key: 'rzp_live_AEcWKhM01jAKqu', // Use same live key as backend
          amount: paymentOrder.amount,
          order_id: paymentOrder.id,
          name: 'CQ Wealth App',
          prefill: {
            email: user?.email || '',
            contact: user?.phoneNumber || '',
            name: user?.name || '',
          },
          theme: { color: '#FFD700' },
        };

        const razorpayResponse: any = await RazorpayCheckout.open(options);
        console.log('Real Razorpay payment result for ₹1:', razorpayResponse);

        // Step 4: Complete payment in backend (this activates user)
        const verifyPaymentResponse = await fetch(
          `https://asmlmbackend-production.up.railway.app/api/orders/${order.orderId}/verify-payment?userId=${user?.userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(user as any)?.token || ''}`
            },
            body: JSON.stringify({
              razorpay_payment_id: razorpayResponse.razorpay_payment_id,
              razorpay_order_id: razorpayResponse.razorpay_order_id,
              razorpay_signature: razorpayResponse.razorpay_signature
            })
          }
        );

        if (verifyPaymentResponse.ok) {
          const paymentResult = await verifyPaymentResponse.json();
          console.log('Payment verification result:', paymentResult);

          // Update payment status in AuthContext
          if (user?.userId) {
            await updatePaymentStatus(true);
            console.log('Payment status updated to true - user now has full access');
            
            // Update user context with real referral code from payment result
            if (paymentResult.referralCode) {
              console.log('Storing real referral code in user context:', paymentResult.referralCode);
              // Store the real referral code in AsyncStorage for persistence
              await AsyncStorage.setItem('userReferralCode', paymentResult.referralCode);
              // Update the user object with the real referral code
              if (user) {
                user.refer = paymentResult.referralCode;
                user.referralCode = paymentResult.referralCode;
              }
            }
          }

          // Show success modal
          setShowPaymentSuccess(true);
        } else {
          throw new Error('Failed to complete payment in backend');
        }
      } else {
        throw new Error('Order creation failed or payment not required');
      }

    } catch (error: any) {
      console.error('Real payment error for ₹1:', error);

      if (error.code === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
      } else if (error.message?.includes('Invalid payment order')) {
        Alert.alert(
          'Payment Setup Error',
          'Failed to create payment order. Please try again.'
        );
      } else if (error.message?.includes('Cannot read property')) {
        Alert.alert(
          'Data Error',
          'There was an issue with the payment data. Please try again.'
        );
      } else {
        Alert.alert(
          'Payment Error',
          `Error: ${error.message || 'An error occurred during payment processing.'}`
        );
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const processPayment = async () => {
    if (!shippingName.trim() || !shippingPhone.trim() || !shippingAddress.trim() || !shippingCity.trim() || !shippingState.trim() || !shippingPincode.trim()) {
      Alert.alert('Shipping Details Required', 'Please fill in all shipping details including name, phone, address, city, state, and pincode.');
      return;
    }

    try {
      setProcessingPayment(true);

      // Step 1: Create order in backend (this creates PENDING order)
      const order = await createOrder();
      console.log('Order created successfully:', order);

      // Check if order requires payment
      if (order && order.requiresPayment && order.activationStatus === 'PENDING_PAYMENT') {
        // Step 2: Use Razorpay order from createOrder response (already created with correct amount)
        const razorpayOrder = order.razorpayOrder;
        console.log('Razorpay order from createOrder:', razorpayOrder);

        // Validate Razorpay order
        if (!razorpayOrder || !razorpayOrder.id || !razorpayOrder.amount) {
          throw new Error('Invalid Razorpay order response from server');
        }

        // Step 3: Process Razorpay payment with correct cart amount
        const options = {
          description: isFirstOrder ? 'CQ Wealth Activation Payment' : 'Product Purchase',
          image: 'https://your-logo-url.com/logo.png',
          currency: razorpayOrder.currency || 'INR',
          key: 'rzp_live_AEcWKhM01jAKqu', // Use same live key as backend
          amount: razorpayOrder.amount,
          order_id: razorpayOrder.id,
          name: 'CQ Wealth App',
          prefill: {
            email: user?.email || '',
            contact: user?.phoneNumber || '',
            name: user?.name || '',
          },
          theme: { color: '#FFD700' },
        };

        const paymentResult = await RazorpayCheckout.open(options);
        console.log('Payment result:', paymentResult);

        // Step 4: Complete payment in backend (this activates user)
        const completePaymentResponse = await fetch(
          `https://asmlmbackend-production.up.railway.app/api/orders/${order.orderId}/complete-payment?userId=${user?.userId}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(user as any)?.token || ''}`
            }
          }
        );

        if (completePaymentResponse.ok) {
          const paymentResult = await completePaymentResponse.json();
          console.log('Payment completion result:', paymentResult);

          // Update payment status in AuthContext
          if (user?.userId) {
            await updatePaymentStatus(true);
            console.log('Payment status updated to true - user now has full access');
            
            // Update user context with real referral code from payment result
            if (paymentResult.referralCode) {
              console.log('Storing real referral code in user context:', paymentResult.referralCode);
              // Store the real referral code in AsyncStorage for persistence
              await AsyncStorage.setItem('userReferralCode', paymentResult.referralCode);
              // Update the user object with the real referral code
              if (user) {
                user.refer = paymentResult.referralCode;
                user.referralCode = paymentResult.referralCode;
              }
            }
          }

          // Show success modal
          setShowPaymentSuccess(true);
        } else {
          throw new Error('Failed to complete payment in backend');
        }
      } else {
        throw new Error('Order creation failed or payment not required');
      }

    } catch (error: any) {
      console.error('Payment error:', error);
      
      if (error.code === 'PAYMENT_CANCELLED') {
        Alert.alert('Payment Cancelled', 'Payment was cancelled by user.');
      } else if (error.message?.includes('Invalid payment order')) {
        Alert.alert(
          'Payment Setup Error',
          'Failed to create payment order. Please try again.'
        );
      } else if (error.message?.includes('Cannot read property')) {
        Alert.alert(
          'Data Error',
          'There was an issue with the payment data. Please try again.'
        );
      } else {
        Alert.alert(
          'Payment Error',
          `Error: ${error.message || 'An error occurred during payment processing.'}`
        );
      }
    } finally {
      setProcessingPayment(false);
    }
  };

  const renderOrderSummary = () => {
    return (
      <View style={styles.orderSummary}>
        <Text style={styles.sectionTitle}>Order Summary</Text>
        
        {cart.map((item) => {
          const product = getProductDetails(item.productId);
          if (!product) return null;
          
          return (
            <View key={item.productId} style={styles.orderItem}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>
                  {product.name || product.productName || `Product ${product.id}`}
                </Text>
                <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemPrice}>
                ₹{product.price * item.quantity}
              </Text>
            </View>
          );
        })}
        
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Amount:</Text>
          <Text style={styles.totalAmount}>₹{totalPrice}</Text>
        </View>
        
        {isFirstOrder && (
          <View style={styles.activationNote}>
            <AntDesign name="gift" size={16} color="#FFD700" />
            <Text style={styles.activationText}>
              This is your CQ Wealth activation order. After payment, you'll receive your referral code!
            </Text>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Checkout</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {renderOrderSummary()}

        <View style={styles.shippingSection}>
          <Text style={styles.sectionTitle}>Shipping Details</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Recipient Name *"
            placeholderTextColor="#666666"
            value={shippingName}
            onChangeText={setShippingName}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Phone Number *"
            placeholderTextColor="#666666"
            value={shippingPhone}
            onChangeText={setShippingPhone}
            keyboardType="phone-pad"
          />
          
          <TextInput
            style={styles.addressInput}
            placeholder="Full Address *"
            placeholderTextColor="#666666"
            value={shippingAddress}
            onChangeText={setShippingAddress}
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
          
          <View style={styles.row}>
            <TextInput
              style={[styles.input, styles.halfWidth]}
              placeholder="City *"
              placeholderTextColor="#666666"
              value={shippingCity}
              onChangeText={setShippingCity}
            />
            
            <TextInput
              style={[styles.input, styles.halfWidth]}
              placeholder="State *"
              placeholderTextColor="#666666"
              value={shippingState}
              onChangeText={setShippingState}
            />
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Pincode *"
            placeholderTextColor="#666666"
            value={shippingPincode}
            onChangeText={setShippingPincode}
            keyboardType="number-pad"
            maxLength={6}
          />
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          <View style={styles.paymentMethod}>
            <AntDesign name="creditcard" size={24} color="#FFD700" />
            <Text style={styles.paymentMethodText}>Razorpay (Cards, UPI, Net Banking)</Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.totalSection}>
          <Text style={styles.footerTotalLabel}>Total Amount:</Text>
          <Text style={styles.footerTotalAmount}>₹{totalPrice}</Text>
        </View>
        
        <TouchableOpacity
          style={[
            styles.payButton,
            (loading || processingPayment) && styles.payButtonDisabled
          ]}
          onPress={processPayment}
          disabled={loading || processingPayment}
        >
          {loading || processingPayment ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <AntDesign name="creditcard" size={20} color="#000000" />
              <Text style={styles.payButtonText}>
                {isFirstOrder ? 'Activate CQ Wealth - Pay ₹1000' : `Pay ₹${totalPrice}`}
              </Text>
            </>
          )}
        </TouchableOpacity>

        {/* Test Payment Button - Always show for testing */}
        <TouchableOpacity
          style={[
            styles.testPayButton,
            (loading || processingPayment) && styles.payButtonDisabled
          ]}
          onPress={processTestPayment}
          disabled={loading || processingPayment}
        >
          {loading || processingPayment ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <>
              <AntDesign name="creditcard" size={20} color="#000000" />
              <Text style={styles.payButtonText}>
                Real Payment - Pay ₹1
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Payment Success Modal */}
      <SuccessModal
        visible={showPaymentSuccess}
        onClose={() => {
          setShowPaymentSuccess(false);
          if (isFirstOrder) {
            navigation.navigate('ReferralCodeGenerated' as never);
          } else {
            navigation.navigate('Orders' as never);
          }
        }}
        type="payment"
        title="Payment Successful!"
        message={isFirstOrder 
          ? `Your CQ Wealth account has been activated! You can now start earning through referrals.`
          : `Your order has been placed successfully! Amount: ₹${totalPrice.toLocaleString()}`}
        buttonText={isFirstOrder ? "View Referral Code" : "View Orders"}
        duration={4000}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  orderSummary: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 16,
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  activationNote: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  activationText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    flex: 1,
  },
  shippingSection: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 12,
  },
  addressInput: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333333',
    minHeight: 80,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  paymentSection: {
    marginBottom: 24,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
  },
  paymentMethodText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 12,
    fontWeight: '600',
  },
  footer: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  footerTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerTotalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  payButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  testPayButton: {
    backgroundColor: '#00FF00',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
  },
  payButtonDisabled: {
    backgroundColor: '#666666',
  },
  payButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

export default CheckoutScreen;
