import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { getRazorpayKey } from '../src/config/razorpay';

export const RazorpayTest: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const testRazorpayIntegration = async () => {
    setLoading(true);
    
    try {
      console.log('🧪 Testing Razorpay Integration...');
      console.log('Key ID:', getRazorpayKey());
      
      const options = {
        description: 'Test Payment',
        image: 'https://your-logo-url.com/logo.png',
        currency: 'INR',
        key: getRazorpayKey(),
        amount: '100', // ₹1 for testing
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Razorpay Integration Test</Text>
      <Text style={styles.subtitle}>Key: {getRazorpayKey()}</Text>
      
      <TouchableOpacity
        style={[styles.testButton, loading && styles.testButtonDisabled]}
        onPress={testRazorpayIntegration}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.testButtonText}>Test Razorpay Integration</Text>
        )}
      </TouchableOpacity>
      
      <Text style={styles.note}>
        This will open Razorpay checkout with a test payment of ₹1
      </Text>
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
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
    fontFamily: 'monospace',
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
  },
});
