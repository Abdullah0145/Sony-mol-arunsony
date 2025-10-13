import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface BottomNavigationProps {
  navigation: any;
  currentScreen: string;
}

export default function BottomNavigation({ navigation, currentScreen }: BottomNavigationProps) {
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
          onPress={() => navigation.navigate('Referrals')}
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
        onPress={() => navigation.navigate('Products')}
      >
        <AntDesign 
          name="gift" 
          size={24} 
          color={currentScreen === 'Products' ? "#FFD700" : "#FFFFFF"} 
        />
        <Text style={currentScreen === 'Products' ? styles.navTextActive : styles.navText}>
          Products
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
