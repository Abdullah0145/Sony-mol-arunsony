import React, { useEffect, useRef } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, Animated, Dimensions } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import LottieView from 'lottie-react-native';

interface SuccessModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'payment' | 'order' | 'withdrawal' | 'login' | 'otp' | 'custom';
  title?: string;
  message?: string;
  buttonText?: string;
  icon?: keyof typeof AntDesign.glyphMap;
  duration?: number;
}

const { width, height } = Dimensions.get('window');

export default function SuccessModal({
  visible,
  onClose,
  type,
  title,
  message,
  buttonText = 'Continue',
  icon,
  duration = 3000,
}: SuccessModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const checkmarkScale = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (visible) {
      // Start animations
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Checkmark animation
      setTimeout(() => {
        Animated.spring(checkmarkScale, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }).start();
      }, 200);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      // Auto close after duration
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      checkmarkScale.setValue(0);
      pulseAnim.setValue(1);
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const getConfig = () => {
    switch (type) {
      case 'success':
        return {
          title: title || 'Success!',
          message: message || 'Operation completed successfully',
          icon: icon || 'checkcircle',
          color: '#4CAF50',
        };
      case 'payment':
        return {
          title: title || 'Payment Successful!',
          message: message || 'Your payment has been processed successfully',
          icon: icon || 'checkcircle',
          color: '#4CAF50',
        };
      case 'order':
        return {
          title: title || 'Order Confirmed!',
          message: message || 'Your order has been placed successfully',
          icon: icon || 'shoppingcart',
          color: '#2196F3',
        };
      case 'withdrawal':
        return {
          title: title || 'Withdrawal Requested!',
          message: message || 'Your withdrawal request has been submitted',
          icon: icon || 'wallet',
          color: '#FF9800',
        };
      case 'login':
        return {
          title: title || 'Login Successful!',
          message: message || 'Welcome back!',
          icon: icon || 'smileo',
          color: '#4CAF50',
        };
      case 'otp':
        return {
          title: title || 'OTP Verified!',
          message: message || 'Your phone number has been verified',
          icon: icon || 'checkcircle',
          color: '#4CAF50',
        };
      default:
        return {
          title: title || 'Success!',
          message: message || 'Operation completed successfully',
          icon: icon || 'checkcircle',
          color: '#FFD700',
        };
    }
  };

  const config = getConfig();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.overlayBackground,
            {
              opacity: fadeAnim,
            },
          ]}
        />
        
        <View style={styles.container}>
          <Animated.View
            style={[
              styles.modal,
              {
                transform: [{ scale: scaleAnim }],
                opacity: fadeAnim,
              },
            ]}
          >
            {/* Animated Circle Background */}
            <Animated.View
              style={[
                styles.circleBackground,
                {
                  backgroundColor: config.color + '20',
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />

            {/* Icon Container */}
            <View style={[styles.iconContainer, { backgroundColor: config.color }]}>
              <Animated.View
                style={[
                  styles.iconWrapper,
                  {
                    transform: [{ scale: checkmarkScale }],
                  },
                ]}
              >
                <AntDesign name={config.icon} size={60} color="#FFFFFF" />
              </Animated.View>
            </View>

            {/* Content */}
            <View style={styles.content}>
              <Text style={styles.title}>{config.title}</Text>
              <Text style={styles.message}>{config.message}</Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: config.color }]}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>{buttonText}</Text>
            </TouchableOpacity>

            {/* Decorative Elements */}
            <View style={styles.decorativeElements}>
              <View style={[styles.decorativeDot, { backgroundColor: config.color, top: 20, left: 20 }]} />
              <View style={[styles.decorativeDot, { backgroundColor: config.color, top: 40, right: 30 }]} />
              <View style={[styles.decorativeDot, { backgroundColor: config.color, bottom: 30, left: 30 }]} />
              <View style={[styles.decorativeDot, { backgroundColor: config.color, bottom: 20, right: 20 }]} />
            </View>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlayBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  container: {
    width: width * 0.85,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    backgroundColor: '#1A1A1A',
    borderRadius: 24,
    padding: 30,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  circleBackground: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    top: -50,
    left: -50,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 8,
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 12,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },
  decorativeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    opacity: 0.3,
  },
});

