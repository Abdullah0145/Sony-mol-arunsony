import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { testNetworkConnectivityAxios, apiServiceAxios } from '../services/api-axios';

interface NetworkTestScreenProps {
  navigation: any;
}

export default function NetworkTestScreen({ navigation }: NetworkTestScreenProps) {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addResult = (result: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
  };

  const runNetworkTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      addResult('🔍 Starting network tests...');
      
      // Test 1: Basic connectivity
      addResult('📡 Test 1: Basic connectivity test');
      const isConnected = await testNetworkConnectivityAxios();
      addResult(isConnected ? '✅ Basic connectivity: PASSED' : '❌ Basic connectivity: FAILED');
      
      if (!isConnected) {
        addResult('❌ Basic connectivity failed, stopping tests');
        return;
      }
      
      // Test 2: Health endpoint
      addResult('📡 Test 2: Health endpoint test');
      try {
        const healthResponse = await apiServiceAxios.healthCheck();
        addResult(healthResponse.success ? '✅ Health endpoint: PASSED' : '❌ Health endpoint: FAILED');
        if (healthResponse.success) {
          addResult(`📦 Health response: ${JSON.stringify(healthResponse.data)}`);
        }
      } catch (error) {
        addResult(`❌ Health endpoint: FAILED - ${error}`);
      }
      
      // Test 3: Debug endpoint
      addResult('📡 Test 3: Debug endpoint test');
      try {
        const debugResponse = await fetch('https://asmlmbackend-production.up.railway.app/api/users/debug', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (debugResponse.ok) {
          const debugData = await debugResponse.json();
          addResult('✅ Debug endpoint: PASSED');
          addResult(`📦 Debug response: ${JSON.stringify(debugData)}`);
        } else {
          addResult(`❌ Debug endpoint: FAILED - Status: ${debugResponse.status}`);
        }
      } catch (error) {
        addResult(`❌ Debug endpoint: FAILED - ${error}`);
      }
      
      // Test 4: Get OTP for testing
      addResult('📡 Test 4: Get OTP for testing');
      try {
        const otpResponse = await fetch('https://asmlmbackend-production.up.railway.app/api/users/get-otp/j.arun80964@gmail.com', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
          credentials: 'omit',
        });
        
        if (otpResponse.ok) {
          const otpData = await otpResponse.json();
          addResult('✅ Get OTP endpoint: PASSED');
          addResult(`📦 OTP response: ${JSON.stringify(otpData)}`);
          if (otpData.otp) {
            addResult(`🎯 OTP for testing: ${otpData.otp}`);
            addResult(`📧 Email: ${otpData.email}`);
          }
        } else {
          addResult(`❌ Get OTP endpoint: FAILED - Status: ${otpResponse.status}`);
        }
      } catch (error) {
        addResult(`❌ Get OTP endpoint: FAILED - ${error}`);
      }
      
      // Test 5: Registration endpoint (without actually registering)
      addResult('📡 Test 5: Registration endpoint test');
      try {
        const registerResponse = await fetch('https://asmlmbackend-production.up.railway.app/api/users/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
          },
          mode: 'cors',
          credentials: 'omit',
          body: JSON.stringify({
            name: 'Test User',
            email: 'test@example.com',
            phoneNumber: '1234567890',
            password: 'testpassword123'
          })
        });
        
        if (registerResponse.ok) {
          const registerData = await registerResponse.json();
          addResult('✅ Registration endpoint: PASSED');
          addResult(`📦 Registration response: ${JSON.stringify(registerData)}`);
        } else {
          addResult(`❌ Registration endpoint: FAILED - Status: ${registerResponse.status}`);
        }
      } catch (error) {
        addResult(`❌ Registration endpoint: FAILED - ${error}`);
      }
      
      addResult('🎉 Network tests completed!');
      
    } catch (error) {
      addResult(`💥 Test suite failed: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Network Test</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Test Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity 
            style={[styles.testButton, isLoading && styles.testButtonDisabled]}
            onPress={runNetworkTests}
            disabled={isLoading}
          >
            <Text style={styles.testButtonText}>
              {isLoading ? 'Running Tests...' : 'Run Network Tests'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={clearResults}
          >
            <Text style={styles.clearButtonText}>Clear Results</Text>
          </TouchableOpacity>
        </View>

        {/* Test Results */}
        <ScrollView style={styles.resultsContainer}>
          {testResults.length === 0 ? (
            <Text style={styles.noResultsText}>
              No test results yet. Tap "Run Network Tests" to start.
            </Text>
          ) : (
            testResults.map((result, index) => (
              <Text key={index} style={styles.resultText}>
                {result}
              </Text>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  controlsContainer: {
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  testButtonDisabled: {
    backgroundColor: '#333333',
    opacity: 0.7,
  },
  clearButton: {
    backgroundColor: '#333333',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 15,
  },
  noResultsText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 50,
  },
  resultText: {
    color: '#FFFFFF',
    fontSize: 12,
    marginBottom: 5,
    fontFamily: 'monospace',
  },
});
