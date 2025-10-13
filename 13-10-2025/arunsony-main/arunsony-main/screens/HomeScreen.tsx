import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface HomeScreenProps {
  navigation: any;
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        
        {/* Welcome Header */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeHeader}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Welcome back!</Text>
              <Text style={styles.userName}>Arun Kumar</Text>
              <Text style={styles.userLevel}>Gold Member</Text>
          </View>
            <View style={styles.profileIcon}>
              <AntDesign name="user" size={32} color="#FFD700" />
        </View>
            </View>
          </View>

        {/* Quick Stats */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <AntDesign name="linechart" size={24} color="#FFD700" />
            <Text style={styles.statValue}>₹15,420</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
          </View>

          <View style={styles.statCard}>
            <AntDesign name="team" size={24} color="#FFD700" />
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Team Members</Text>
          </View>

          <View style={styles.statCard}>
            <AntDesign name="star" size={24} color="#FFD700" />
            <Text style={styles.statValue}>3</Text>
            <Text style={styles.statLabel}>Level</Text>
          </View>
        </View>

        {/* Quick Actions */}
        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Products')}
            >
              <AntDesign name="shopping" size={32} color="#FFD700" />
              <Text style={styles.actionText}>Shop Products</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('TabNavigator', { screen: 'Team' })}
            >
              <AntDesign name="adduser" size={32} color="#FFD700" />
              <Text style={styles.actionText}>Add Referral</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('Earnings')}
            >
              <AntDesign name="wallet" size={32} color="#FFD700" />
              <Text style={styles.actionText}>View Earnings</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => navigation.navigate('TabNavigator', { screen: 'Team' })}
            >
              <AntDesign name="team" size={32} color="#FFD700" />
              <Text style={styles.actionText}>My Team</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.activitySection}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          
          <View style={styles.activityCard}>
            <AntDesign name="checkcircle" size={20} color="#4CAF50" />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>New referral joined - Sarah M.</Text>
              <Text style={styles.activityTime}>2 hours ago</Text>
            </View>
          </View>

          <View style={styles.activityCard}>
            <AntDesign name="wallet" size={20} color="#FFD700" />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Earning received - ₹1,200</Text>
              <Text style={styles.activityTime}>1 day ago</Text>
            </View>
        </View>

          <View style={styles.activityCard}>
            <AntDesign name="star" size={20} color="#FFD700" />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>Level up to Gold achieved!</Text>
              <Text style={styles.activityTime}>3 days ago</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    padding: 20,
    paddingTop: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  userLevel: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: '600',
  },
  profileIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#2A2A2A',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  actionsSection: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 20,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  actionCard: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 15,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 10,
    textAlign: 'center',
  },
  activitySection: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 15,
    marginBottom: 20,
    borderRadius: 12,
  },
  activityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  activityContent: {
    flex: 1,
    marginLeft: 12,
  },
  activityText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
});
