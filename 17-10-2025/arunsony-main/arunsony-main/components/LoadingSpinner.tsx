import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet, Animated, Easing } from 'react-native';

interface LoadingSpinnerProps {
  size?: 'small' | 'large';
  color?: string;
  text?: string;
  overlay?: boolean;
  animated?: boolean;
}

export default function LoadingSpinner({ 
  size = 'large', 
  color = '#FFD700', 
  text = 'Loading...', 
  overlay = false,
  animated = true 
}: LoadingSpinnerProps) {
  const spinValue = new Animated.Value(0);

  React.useEffect(() => {
    if (animated) {
      const spin = () => {
        spinValue.setValue(0);
        Animated.timing(spinValue, {
          toValue: 1,
          duration: 1000,
          easing: Easing.linear,
          useNativeDriver: true,
        }).start(() => spin());
      };
      spin();
    }
  }, [animated, spinValue]);

  const rotate = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const containerStyle = overlay ? styles.overlayContainer : styles.container;
  const contentStyle = overlay ? styles.overlayContent : styles.content;

  return (
    <View style={containerStyle}>
      <View style={contentStyle}>
        {animated ? (
          <Animated.View style={[styles.spinnerContainer, { transform: [{ rotate }] }]}>
            <ActivityIndicator size={size} color={color} />
          </Animated.View>
        ) : (
          <ActivityIndicator size={size} color={color} />
        )}
        {text && <Text style={styles.loadingText}>{text}</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  content: {
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  overlayContent: {
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 30,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 8,
  },
});
