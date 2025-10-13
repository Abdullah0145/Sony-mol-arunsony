import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Alert, Clipboard, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../components/AuthContext';

interface ReferralsScreenProps {
  navigation: any;
}

export default function TeamScreen({ navigation }: ReferralsScreenProps) {
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  
  // Get actual referral code from user data
  const referralCode = user?.referralCode || user?.refer || `CQ${user?.userId || '12345'}`;
  const referralUrl = `https://expo.dev/accounts/arun-j/projects/MLMApp/builds/c55b55cb-c3d4-4b60-bcc4-2c79e6433976?ref=${referralCode}`;

  const copyToClipboard = () => {
    try {
      Clipboard.setString(referralCode);
      setCopied(true);
      Alert.alert('Copied!', `Referral code "${referralCode}" copied to clipboard`);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      Alert.alert('Error', 'Failed to copy to clipboard');
    }
  };

  const shareReferral = async () => {
    try {
      const shareMessage = `Join CQ Wealth and start earning! Use my referral code: ${referralCode}\n\nDownload APK: ${referralUrl}\n\nAfter installing, use referral code: ${referralCode}`;
      
      const result = await Share.share({
        message: shareMessage,
        url: referralUrl,
        title: 'Join CQ Wealth',
      });

      if (result.action === Share.sharedAction) {
        console.log('Shared successfully');
      } else if (result.action === Share.dismissedAction) {
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.referralsTitle}>Referrals</Text>
        </View>

        {/* Your Referral Code Section */}
        <View style={styles.referralCodeCard}>
          <Text style={styles.referralCodeTitle}>Your Referral Code</Text>
          <Text style={styles.referralCode}>{referralCode}</Text>
          <Text style={styles.referralUrl}>{referralUrl}</Text>
          <View style={styles.referralButtons}>
            <TouchableOpacity 
              style={[styles.copyButton, copied && styles.copiedButton]}
              onPress={copyToClipboard}
            >
              <Text style={styles.copyIcon}>📋</Text>
              <Text style={styles.copyText}>{copied ? 'Copied!' : 'Copy Code'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.shareButton}
              onPress={shareReferral}
            >
              <Text style={styles.shareIcon}>📤</Text>
              <Text style={styles.shareText}>Share</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Statistics Overview */}
        <View style={styles.statsSection}>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Text style={styles.statIcon}>👥</Text>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Total Referrals</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📈</Text>
              <Text style={styles.statNumber}>18</Text>
              <Text style={styles.statLabel}>Active Members</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>📅</Text>
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>This Month</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statIcon}>💰</Text>
              <Text style={styles.statNumber}>₹12450</Text>
              <Text style={styles.statLabel}>Total Earned</Text>
            </View>
          </View>
        </View>

        {/* Commission Breakdown Section */}
        <View style={styles.commissionSection}>
          <Text style={styles.sectionTitle}>Commission Breakdown</Text>
          
          <View style={styles.commissionItem}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>1</Text>
            </View>
            <View style={styles.commissionInfo}>
              <Text style={styles.levelTitle}>Level 1</Text>
              <Text style={styles.referralCount}>8 referrals</Text>
            </View>
            <View style={styles.commissionAmount}>
              <Text style={styles.amount}>₹2,000</Text>
              <Text style={styles.perReferral}>₹250 each</Text>
            </View>
          </View>

          <View style={styles.commissionItem}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>2</Text>
            </View>
            <View style={styles.commissionInfo}>
              <Text style={styles.levelTitle}>Level 2</Text>
              <Text style={styles.referralCount}>12 referrals</Text>
            </View>
            <View style={styles.commissionAmount}>
              <Text style={styles.amount}>₹600</Text>
              <Text style={styles.perReferral}>₹50 each</Text>
            </View>
          </View>

          <View style={styles.commissionItem}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>3</Text>
            </View>
            <View style={styles.commissionInfo}>
              <Text style={styles.levelTitle}>Level 3</Text>
              <Text style={styles.referralCount}>4 referrals</Text>
            </View>
            <View style={styles.commissionAmount}>
              <Text style={styles.amount}>₹200</Text>
              <Text style={styles.perReferral}>₹50 each</Text>
            </View>
          </View>

          <View style={styles.commissionItem}>
            <View style={styles.levelCircle}>
              <Text style={styles.levelNumber}>4</Text>
            </View>
            <View style={styles.commissionInfo}>
              <Text style={styles.levelTitle}>Level 4</Text>
              <Text style={styles.referralCount}>0 referrals</Text>
            </View>
            <View style={styles.commissionAmount}>
              <Text style={styles.amount}>₹0</Text>
              <Text style={styles.perReferral}>₹50 each</Text>
            </View>
          </View>
        </View>

        {/* Recent Referrals Section */}
        <View style={styles.recentReferralsSection}>
          <Text style={styles.sectionTitle}>Recent Referrals</Text>
          
          <View style={styles.referralItem}>
            <Text style={styles.personIcon}>👤</Text>
            <View style={styles.referralContent}>
              <Text style={styles.referralName}>Amit Kumar</Text>
              <Text style={styles.referralTime}>2 hours ago</Text>
            </View>
            <View style={styles.referralDetails}>
              <Text style={styles.earnedAmount}>₹250</Text>
              <View style={styles.statusContainer}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>L1</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.referralItem}>
            <Text style={styles.personIcon}>👤</Text>
            <View style={styles.referralContent}>
              <Text style={styles.referralName}>Priya Sharma</Text>
              <Text style={styles.referralTime}>1 day ago</Text>
            </View>
            <View style={styles.referralDetails}>
              <Text style={styles.earnedAmount}>₹50</Text>
              <View style={styles.statusContainer}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>L2</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.referralItem}>
            <Text style={styles.personIcon}>👤</Text>
            <View style={styles.referralContent}>
              <Text style={styles.referralName}>Rahul Gupta</Text>
              <Text style={styles.referralTime}>2 days ago</Text>
            </View>
            <View style={styles.referralDetails}>
              <Text style={styles.earnedAmount}>₹250</Text>
              <View style={styles.statusContainer}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>L1</Text>
                </View>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeBadgeText}>Active</Text>
                </View>
              </View>
            </View>
          </View>

          <View style={styles.referralItem}>
            <Text style={styles.personIcon}>👤</Text>
            <View style={styles.referralContent}>
              <Text style={styles.referralName}>Sneha Patel</Text>
              <Text style={styles.referralTime}>3 days ago</Text>
            </View>
            <View style={styles.referralDetails}>
              <Text style={styles.earnedAmount}>₹50</Text>
              <View style={styles.statusContainer}>
                <View style={styles.levelBadge}>
                  <Text style={styles.levelBadgeText}>L3</Text>
                </View>
                <View style={styles.pendingBadge}>
                  <Text style={styles.pendingBadgeText}>Pending</Text>
                </View>
              </View>
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
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    padding: 20,
    paddingTop: 10,
  },
  referralsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  referralCodeCard: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 20,
    borderRadius: 12,
  },
  referralCodeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  referralCode: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  referralUrl: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 20,
  },
  referralButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  copyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
    justifyContent: 'center',
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  copyIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  copyText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  shareIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  shareText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  statIcon: {
    fontSize: 24,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  commissionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  commissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  levelCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FFD700',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  levelNumber: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  commissionInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  referralCount: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  commissionAmount: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  perReferral: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  recentReferralsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  referralItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  personIcon: {
    fontSize: 20,
    marginRight: 15,
  },
  referralContent: {
    flex: 1,
  },
  referralName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  referralTime: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  referralDetails: {
    alignItems: 'flex-end',
  },
  earnedAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  statusContainer: {
    flexDirection: 'row',
  },
  levelBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginRight: 5,
  },
  levelBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
  },
  activeBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  activeBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pendingBadge: {
    backgroundColor: '#666666',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  pendingBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
