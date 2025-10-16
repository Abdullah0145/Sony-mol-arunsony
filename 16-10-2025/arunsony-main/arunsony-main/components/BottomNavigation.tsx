import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from './AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface BottomNavigationProps {
  navigation: any;
  currentScreen: string;
}

export default function BottomNavigation({ navigation, currentScreen }: BottomNavigationProps) {
  const { user } = useAuth();
  const [availableRewardsCount, setAvailableRewardsCount] = useState(0);

  useEffect(() => {
    if (user?.userId) {
      loadAvailableRewardsCount();
    }
  }, [user?.userId]);

  const loadAvailableRewardsCount = async () => {
    try {
      const response = await apiServiceAxios.getAvailableRewards(Number(user.userId));
      if (response.success && response.data) {
        setAvailableRewardsCount(response.data.availableRewards?.length || 0);
      }
    } catch (error) {
      console.error('Error loading available rewards count:', error);
    }
  };
  return (
    <View style={styles.bottomNav}>
      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Dashboard')}
      >
        <AntDesign 
          name="home" 
          size={24} 
          color={currentScreen === 'Dashboard' ? "#FFD700" : "#FFFFFF"} 
        />
        <Text style={currentScreen === 'Dashboard' ? styles.navTextActive : styles.navText}>
          Home
        </Text>
      </TouchableOpacity>

              <TouchableOpacity 
          style={styles.navItem}
          onPress={() => navigation.navigate('TabNavigator', { screen: 'Team' })}
        >
          <AntDesign 
            name="team" 
            size={24} 
            color={currentScreen === 'Referrals' ? "#FFD700" : "#FFFFFF"} 
          />
          <Text style={currentScreen === 'Referrals' ? styles.navTextActive : styles.navText}>
            Referrals
          </Text>
        </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate('Earnings')}
      >
        <AntDesign 
          name="linechart" 
          size={24} 
          color={currentScreen === 'Earnings' ? "#FFD700" : "#FFFFFF"} 
        />
        <Text style={currentScreen === 'Earnings' ? styles.navTextActive : styles.navText}>
          Earnings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.navItem}
        onPress={() => navigation.navigate(availableRewardsCount > 0 ? 'ReferralRewards' : 'Products')}
      >
        <View style={styles.iconContainer}>
          <AntDesign 
            name={availableRewardsCount > 0 ? "gift" : "shoppingcart"} 
            size={24} 
            color={currentScreen === 'Products' || currentScreen === 'ReferralRewards' ? "#FFD700" : "#FFFFFF"} 
          />
          {availableRewardsCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationText}>{availableRewardsCount}</Text>
            </View>
          )}
        </View>
        <Text style={currentScreen === 'Products' || currentScreen === 'ReferralRewards' ? styles.navTextActive : styles.navText}>
          {availableRewardsCount > 0 ? 'Rewards' : 'Products'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: '#1A1A1A',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
  },
  iconContainer: {
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#1A1A1A',
  },
  notificationText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  navTextActive: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
