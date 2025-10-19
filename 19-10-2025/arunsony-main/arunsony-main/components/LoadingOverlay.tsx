import React from 'react';
import { View, Modal, StyleSheet, Text, Animated, Easing } from 'react-native';
import LoadingSpinner from './LoadingSpinner';

interface LoadingOverlayProps {
  visible: boolean;
  message?: string;
  subMessage?: string;
}

export default function LoadingOverlay({ 
  visible, 
  message = 'Loading...', 
  subMessage 
}: LoadingOverlayProps) {
  const fadeAnim = new Animated.Value(0);

  React.useEffect(() => {
    if (visible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.ease,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, fadeAnim]);

  if (!visible) return null;

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
    >
      <Animated.View style={[styles.overlay, { opacity: fadeAnim }]}>
        <View style={styles.container}>
          <LoadingSpinner 
            size="large" 
            color="#FFD700" 
            text={message}
            overlay={true}
            animated={true}
          />
          {subMessage && (
            <Text style={styles.subMessage}>{subMessage}</Text>
          )}
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    alignItems: 'center',
  },
  subMessage: {
    color: '#CCCCCC',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
});
