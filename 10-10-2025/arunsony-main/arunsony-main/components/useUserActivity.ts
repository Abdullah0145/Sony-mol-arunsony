import { useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuth } from './AuthContext';

export function useUserActivity() {
  const { resetSessionTimer } = useAuth();

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App became active, reset session timer
        resetSessionTimer();
      }
    };

    // Listen for app state changes
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Reset timer when hook mounts (user is active)
    resetSessionTimer();

    return () => {
      subscription?.remove();
    };
  }, [resetSessionTimer]);
}
