import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios, UserProgress } from '../services/api-axios';

interface ProfileScreenProps {
  navigation: any;
}

export default function ProfileScreen({ navigation }: ProfileScreenProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [realTimePaymentStatus, setRealTimePaymentStatus] = useState<boolean | null>(null);
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const { logout, user, hasPaid, checkPaymentStatus, forceLogout } = useAuth();
  
  // Use user data from auth context if available, otherwise use default data
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || user?.name || 'Loading...',
    email: user?.email || 'Loading...',
    phone: user?.phoneNumber || user?.phone || 'Loading...',
    memberId: user?.referralCode || user?.refer || 'Loading...',
    joinDate: 'Loading...',
    level: user?.level || 'Loading...',
    status: user?.status || 'Loading...',
    totalEarnings: user?.walletBalance ? `₹${user.walletBalance}` : 'Loading...',
    totalReferrals: user?.referralCount?.toString() || 'Loading...',
    rank: 'Loading...'
  });

  const [editData, setEditData] = useState(profileData);

  // Fetch profile data from backend
  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const response = await apiServiceAxios.getProfile();
      if (response.success && response.data) {
        const backendData = response.data;
        const updatedProfileData = {
          fullName: backendData.name || backendData.fullName || 'N/A',
          email: backendData.email || 'N/A',
          phone: backendData.phoneNumber || backendData.phone || 'N/A',
          memberId: backendData.refer || backendData.referralCode || 'N/A',
          joinDate: backendData.createdAt ? new Date(backendData.createdAt).toLocaleDateString() : 'N/A',
          level: backendData.level || 'N/A',
          status: backendData.status || 'N/A',
          totalEarnings: backendData.walletBalance ? `₹${backendData.walletBalance}` : '₹0',
          totalReferrals: backendData.referralCount?.toString() || '0',
          rank: 'N/A' // This would need to be calculated or provided by backend
        };
        setProfileData(updatedProfileData);
        setEditData(updatedProfileData);
      } else {
        console.log('Failed to fetch profile:', response.message);
        // Keep existing data if fetch fails
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Keep existing data if fetch fails
    } finally {
      setIsLoading(false);
    }
  };

  // Update profile data when user changes and fetch from backend
  useEffect(() => {
    if (user) {
      // First update with auth context data
      const updatedProfileData = {
        ...profileData,
        fullName: user.fullName || user.name || profileData.fullName,
        email: user.email || profileData.email,
        memberId: user.referralCode || user.refer || profileData.memberId,
        level: user.level || profileData.level,
        status: user.status || profileData.status,
        totalEarnings: user.walletBalance ? `₹${user.walletBalance}` : profileData.totalEarnings,
        totalReferrals: user.referralCount?.toString() || profileData.totalReferrals,
      };
      setProfileData(updatedProfileData);
      setEditData(updatedProfileData);
      
      // Then fetch fresh data from backend
      fetchProfileData();
      fetchRealTimePaymentStatus();
      fetchUserProgress();
    }
  }, [user]);

  const handleSave = () => {
    setProfileData(editData);
    setIsEditing(false);
    Alert.alert('Success', 'Profile updated successfully!');
  };

  const handleCancel = () => {
    setEditData(profileData);
    setIsEditing(false);
  };

  const updateEditData = (field: string, value: string) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const fetchRealTimePaymentStatus = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserPaymentStatus(user.userId);
        if (response.success && response.data) {
          setRealTimePaymentStatus(response.data.hasPaidActivation);
          console.log('Real-time payment status fetched:', response.data.hasPaidActivation);
        }
      }
    } catch (error) {
      console.error('Error fetching real-time payment status:', error);
    }
  };

  const fetchUserProgress = async () => {
    try {
      if (user?.userId) {
        const response = await apiServiceAxios.getUserProgress(user.userId);
        if (response.success && response.data) {
          setUserProgress(response.data);
          console.log('User progress fetched:', response.data);
        }
      }
    } catch (error) {
      console.error('Error fetching user progress:', error);
    }
  };

  const handleClearCache = async () => {
    Alert.alert(
      'Clear Cache & Re-login',
      'This will clear all stored data and force you to login again. This will fix the JWT token issue and get your real referral code.',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Clear Cache',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log('🔄 Clearing cache and forcing logout...');
              await forceLogout();
              Alert.alert(
                'Cache Cleared',
                'Please login again to get fresh tokens and your real referral code.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      navigation.navigate('Login' as never);
                    }
                  }
                ]
              );
            } catch (error) {
              console.error('Clear cache error:', error);
              Alert.alert('Error', 'Failed to clear cache. Please restart the app.');
            }
          }
        }
      ]
    );
  };

  const refreshPaymentStatus = async () => {
    try {
      await checkPaymentStatus();
      await fetchProfileData();
      await fetchRealTimePaymentStatus();
      await fetchUserProgress();
      Alert.alert('Success', 'Profile data refreshed from backend!');
    } catch (error) {
      Alert.alert('Error', 'Failed to refresh profile data');
    }
  };

  const profileSections = [
    {
      title: 'Personal Information',
      icon: 'user',
      items: [
        { label: 'Full Name', value: isEditing ? editData.fullName : profileData.fullName, key: 'fullName', editable: true },
        { label: 'Email', value: isEditing ? editData.email : profileData.email, key: 'email', editable: true },
        { label: 'Phone', value: isEditing ? editData.phone : profileData.phone, key: 'phone', editable: true },
      ]
    },
    {
      title: 'Membership Details',
      icon: 'star',
      items: [
        { label: 'Member ID', value: profileData.memberId, key: 'memberId', editable: false },
        { label: 'Join Date', value: profileData.joinDate, key: 'joinDate', editable: false },
        { label: 'Level', value: userProgress?.levelNumber !== undefined ? `Level ${userProgress.levelNumber}` : 'Loading...', key: 'level', editable: false },
        { label: 'Status', value: profileData.status, key: 'status', editable: false },
      ]
    },
    {
      title: 'Performance Stats',
      icon: 'linechart',
      items: [
        { 
          label: 'Total Earnings', 
          value: userProgress?.walletBalance !== undefined ? `₹${userProgress.walletBalance.toFixed(2)}` : profileData.totalEarnings, 
          key: 'totalEarnings', 
          editable: false 
        },
        { 
          label: 'Total Referrals', 
          value: userProgress?.referralCount !== undefined ? userProgress.referralCount.toString() : profileData.totalReferrals, 
          key: 'totalReferrals', 
          editable: false 
        },
        { 
          label: 'Current Tier', 
          value: userProgress?.tierName || 'Loading...', 
          key: 'currentTier', 
          editable: false,
          statusColor: userProgress?.tierName ? '#4CAF50' : '#FFD700'
        },
        { 
          label: 'Level', 
          value: userProgress?.levelNumber !== undefined ? `Level ${userProgress.levelNumber}` : 'Loading...', 
          key: 'level', 
          editable: false,
          statusColor: userProgress?.levelNumber ? '#4CAF50' : '#FFD700'
        },
        { 
          label: 'First Order', 
          value: userProgress?.firstOrder !== undefined ? (userProgress.firstOrder ? '✅ Completed' : '❌ Pending') : 'Loading...', 
          key: 'firstOrder', 
          editable: false,
          statusColor: userProgress?.firstOrder !== undefined ? (userProgress.firstOrder ? '#4CAF50' : '#FF6B6B') : '#FFD700'
        },
      ]
    },
    {
      title: 'Payment & Access Status',
      icon: 'checkcircle',
      items: [
        { 
          label: 'Payment Status', 
          value: hasPaid ? '✅ Paid' : '❌ Not Paid', 
          key: 'paymentStatus', 
          editable: false,
          statusColor: hasPaid ? '#4CAF50' : '#FF6B6B'
        },
        { 
          label: 'Backend Payment', 
          value: realTimePaymentStatus !== null 
            ? (realTimePaymentStatus ? '✅ Activated' : '❌ Not Activated')
            : '⏳ Loading...', 
          key: 'backendPayment', 
          editable: false,
          statusColor: realTimePaymentStatus !== null 
            ? (realTimePaymentStatus ? '#4CAF50' : '#FF6B6B')
            : '#FFD700'
        },
        { 
          label: 'Referral Code', 
          value: user?.refer || user?.referralCode || '❌ No Code', 
          key: 'referralCode', 
          editable: false,
          statusColor: (user?.refer || user?.referralCode) ? '#4CAF50' : '#FF6B6B'
        },
        { 
          label: 'Access Level', 
          value: (hasPaid || user?.refer || user?.referralCode) ? '✅ Full Access' : '❌ Limited Access', 
          key: 'accessLevel', 
          editable: false,
          statusColor: (hasPaid || user?.refer || user?.referralCode) ? '#4CAF50' : '#FF6B6B'
        },
      ]
    }
  ];

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              // Show success message before navigation
              Alert.alert(
                'Logged Out',
                'You have been successfully logged out.',
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      // The navigation will be handled automatically by the auth context
                    },
                  },
                ]
              );
            } catch (error) {
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
          
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Profile</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity 
                style={styles.refreshButton}
                onPress={fetchProfileData}
                disabled={isLoading}
              >
                <AntDesign 
                  name="reload1" 
                  size={16} 
                  color={isLoading ? "#666666" : "#FFD700"} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.editButton}
                onPress={() => setIsEditing(!isEditing)}
              >
                <Text style={styles.editButtonText}>
                  {isEditing ? 'Cancel' : 'Edit'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile Picture Section */}
          <View style={styles.profilePictureSection}>
            <View style={styles.profilePicture}>
              <Text style={styles.profileInitials}>AK</Text>
            </View>
            <Text style={styles.profileName}>{profileData.fullName}</Text>
            <Text style={styles.profileLevel}>
              {userProgress?.tierName || 'Loading...'} Member
            </Text>
          </View>

          {/* Profile Sections */}
          {profileSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <View style={styles.sectionHeader}>
                <AntDesign name={section.icon as any} size={20} color="#FFD700" />
                <Text style={styles.sectionTitle}>{section.title}</Text>
              </View>
              
              {section.items.map((item, itemIndex) => (
                <View key={itemIndex} style={styles.profileItem}>
                  <Text style={styles.itemLabel}>{item.label}</Text>
                  {isEditing && item.editable ? (
                    <TextInput
                      style={styles.editInput}
                      value={item.value}
                      onChangeText={(value) => updateEditData(item.key, value)}
                      placeholderTextColor="#666666"
                    />
                  ) : (
                    <Text style={[
                      styles.itemValue, 
                      item.statusColor && { color: item.statusColor }
                    ]}>{item.value}</Text>
                  )}
                </View>
              ))}
            </View>
          ))}

          {/* Debug Information Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AntDesign name="infocirlceo" size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>Debug Information</Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>Frontend hasPaid</Text>
              <Text style={[styles.itemValue, { color: hasPaid ? '#4CAF50' : '#FF6B6B' }]}>
                {hasPaid ? 'true' : 'false'}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>Backend hasPaidActivation (Cached)</Text>
              <Text style={[styles.itemValue, { color: user?.hasPaidActivation ? '#4CAF50' : '#FF6B6B' }]}>
                {user?.hasPaidActivation ? 'true' : 'false'}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>Backend hasPaidActivation (Real-time)</Text>
              <Text style={[styles.itemValue, { 
                color: realTimePaymentStatus !== null 
                  ? (realTimePaymentStatus ? '#4CAF50' : '#FF6B6B')
                  : '#FFD700'
              }]}>
                {realTimePaymentStatus !== null ? (realTimePaymentStatus ? 'true' : 'false') : 'loading...'}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>User Referral Code</Text>
              <Text style={[styles.itemValue, { color: (user?.refer || user?.referralCode) ? '#4CAF50' : '#FF6B6B' }]}>
                {user?.refer || user?.referralCode || 'null'}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>Access Decision</Text>
              <Text style={[styles.itemValue, { color: (hasPaid || user?.refer || user?.referralCode) ? '#4CAF50' : '#FF6B6B' }]}>
                {(hasPaid || user?.refer || user?.referralCode) ? 'Full Access' : 'Limited Access'}
              </Text>
            </View>
            
            <View style={styles.profileItem}>
              <Text style={styles.itemLabel}>User Progress Data</Text>
              <Text style={[styles.itemValue, { color: userProgress ? '#4CAF50' : '#FFD700' }]}>
                {userProgress ? 'Loaded' : 'Loading...'}
              </Text>
            </View>
            
            {userProgress && (
              <>
                <View style={styles.profileItem}>
                  <Text style={styles.itemLabel}>Tier Name</Text>
                  <Text style={[styles.itemValue, { color: '#4CAF50' }]}>
                    {userProgress.tierName || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.profileItem}>
                  <Text style={styles.itemLabel}>Level Number</Text>
                  <Text style={[styles.itemValue, { color: '#4CAF50' }]}>
                    {userProgress.levelNumber || 'N/A'}
                  </Text>
                </View>
                
                <View style={styles.profileItem}>
                  <Text style={styles.itemLabel}>Wallet Balance</Text>
                  <Text style={[styles.itemValue, { color: '#4CAF50' }]}>
                    ₹{userProgress.walletBalance?.toFixed(2) || '0.00'}
                  </Text>
                </View>
                
                <View style={styles.profileItem}>
                  <Text style={styles.itemLabel}>Referral Count</Text>
                  <Text style={[styles.itemValue, { color: '#4CAF50' }]}>
                    {userProgress.referralCount || 0}
                  </Text>
                </View>
                
                <View style={styles.profileItem}>
                  <Text style={styles.itemLabel}>First Order</Text>
                  <Text style={[styles.itemValue, { color: userProgress.firstOrder ? '#4CAF50' : '#FF6B6B' }]}>
                    {userProgress.firstOrder ? 'true' : 'false'}
                  </Text>
                </View>
              </>
            )}
            
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={refreshPaymentStatus}
            >
              <AntDesign name="reload1" size={16} color="#000000" />
              <Text style={styles.debugButtonText}>Refresh All Profile Data</Text>
            </TouchableOpacity>
          </View>

          {/* Settings Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AntDesign name="setting" size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>Settings</Text>
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive app notifications</Text>
              </View>
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: '#333333', true: '#FFD700' }}
                thumbColor={notificationsEnabled ? '#000000' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Receive email updates</Text>
              </View>
              <Switch
                value={emailNotifications}
                onValueChange={setEmailNotifications}
                trackColor={{ false: '#333333', true: '#FFD700' }}
                thumbColor={emailNotifications ? '#000000' : '#FFFFFF'}
              />
            </View>
            
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <Text style={styles.settingLabel}>SMS Notifications</Text>
                <Text style={styles.settingDescription}>Receive SMS updates</Text>
              </View>
              <Switch
                value={smsNotifications}
                onValueChange={setSmsNotifications}
                trackColor={{ false: '#333333', true: '#FFD700' }}
                thumbColor={smsNotifications ? '#000000' : '#FFFFFF'}
              />
            </View>
          </View>

          {/* Action Buttons */}
          {isEditing && (
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSave}
              >
                <Text style={styles.saveButtonText}>Save Changes</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Quick Actions */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AntDesign name="appstore1" size={20} color="#FFD700" />
              <Text style={styles.sectionTitle}>Quick Actions</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Orders')}
            >
              <AntDesign name="shoppingcart" size={20} color="#FFD700" />
              <Text style={styles.actionText}>My Orders</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('PaymentHistory')}
            >
              <AntDesign name="creditcard" size={20} color="#FFD700" />
              <Text style={styles.actionText}>Payment History</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Support')}
            >
              <AntDesign name="customerservice" size={20} color="#FFD700" />
              <Text style={styles.actionText}>Contact Support</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Support')}
            >
              <AntDesign name="questioncircleo" size={20} color="#FFD700" />
              <Text style={styles.actionText}>Help & FAQ</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={() => navigation.navigate('Terms')}
            >
              <AntDesign name="filetext1" size={20} color="#FFD700" />
              <Text style={styles.actionText}>Terms & Privacy</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleClearCache}
            >
              <AntDesign name="delete" size={20} color="#FF9500" />
              <Text style={[styles.actionText, { color: '#FF9500' }]}>Clear Cache & Re-login</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.actionItem}
              onPress={handleLogout}
            >
              <AntDesign name="logout" size={20} color="#FF6B6B" />
              <Text style={[styles.actionText, { color: '#FF6B6B' }]}>Logout</Text>
              <AntDesign name="right" size={16} color="#666666" />
            </TouchableOpacity>
          </View>

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
  mainContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  refreshButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  editButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  profilePictureSection: {
    alignItems: 'center',
    padding: 20,
    marginBottom: 10,
  },
  profilePicture: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  profileInitials: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  profileName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  profileLevel: {
    fontSize: 14,
    color: '#FFD700',
  },
  section: {
    backgroundColor: '#1A1A1A',
    margin: 15,
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  profileItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  itemLabel: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  itemValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editInput: {
    backgroundColor: '#2A2A2A',
    borderWidth: 1,
    borderColor: '#FFD700',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: '#FFFFFF',
    minWidth: 120,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#333333',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginLeft: 10,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  actionText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
  },
  debugButton: {
    backgroundColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 10,
  },
  debugButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

