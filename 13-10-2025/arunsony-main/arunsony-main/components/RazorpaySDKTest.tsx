import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';

export const RazorpaySDKTest: React.FC = () => {
  const [sdkLoaded, setSdkLoaded] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkSDKAvailability();
  }, []);

  const checkSDKAvailability = async () => {
    try {
      // Try to import Razorpay dynamically
      const RazorpayCheckout = require('react-native-razorpay').default;
      
      if (RazorpayCheckout && typeof RazorpayCheckout.open === 'function') {
        console.log('✅ Razorpay SDK is properly loaded');
        setSdkLoaded(true);
      } else {
        console.log('❌ Razorpay SDK is not properly loaded');
        setSdkLoaded(false);
      }
    } catch (error) {
      console.error('❌ Error loading Razorpay SDK:', error);
      setSdkLoaded(false);
    }
  };

  const testBasicIntegration = async () => {
    if (!sdkLoaded) {
      Alert.alert('Error', 'Razorpay SDK is not loaded properly');
      return;
    }

    setLoading(true);
    
    try {
      const RazorpayCheckout = require('react-native-razorpay').default;
      
      console.log('🧪 Testing basic Razorpay integration...');
      
      const options = {
        description: 'Test Payment',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: 'rzp_live_AEcWKhM01jAKqu',
        amount: '100', // ₹1
        name: 'CQ Wealth Company',
        order_id: 'test_order_' + Date.now(),
        prefill: {
          email: 'test@example.com',
          contact: '9876543210',
          name: 'Test User',
        },
        theme: { color: '#F37254' },
      };

      console.log('🚀 Opening Razorpay with options:', options);
      
      const data = await RazorpayCheckout.open(options);
      console.log('✅ Razorpay test successful:', data);
      
      Alert.alert('Success', 'Razorpay integration is working!');
    } catch (error) {
      console.error('❌ Razorpay test failed:', error);
      Alert.alert('Error', `Razorpay test failed: ${error.message || error}`);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (sdkLoaded === null) return '#666';
    return sdkLoaded ? '#4CAF50' : '#F44336';
  };

  const getStatusText = () => {
    if (sdkLoaded === null) return 'Checking...';
    return sdkLoaded ? 'SDK Loaded ✅' : 'SDK Not Loaded ❌';
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Razorpay SDK Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </Text>
      </View>
      
      <TouchableOpacity
        style={[
          styles.testButton, 
          (!sdkLoaded || loading) && styles.testButtonDisabled
        ]}
        onPress={testBasicIntegration}
        disabled={!sdkLoaded || loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.testButtonText}>
            Test Basic Integration
          </Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>
        This tests if the Razorpay SDK is properly integrated in your development build
      </Text>
      
      {!sdkLoaded && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>SDK Not Loaded - Possible Issues:</Text>
          <Text style={styles.errorText}>• Development build doesn't include Razorpay</Text>
          <Text style={styles.errorText}>• SDK not properly linked</Text>
          <Text style={styles.errorText}>• Need to rebuild development client</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statusText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#F37254',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonDisabled: {
    backgroundColor: '#ccc',
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  note: {
    fontSize: 12,
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#F44336',
    marginBottom: 10,
  },
  errorText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
});
