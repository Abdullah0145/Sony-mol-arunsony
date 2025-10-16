import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Clipboard, Share, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface ShareReferralScreenProps {
  navigation: any;
}

interface ReferralStats {
  totalReferrals: number;
  totalEarned: string;
  activeMembers: number;
  thisMonthReferrals: number;
}

export default function ShareReferralScreen({ navigation }: ShareReferralScreenProps) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ReferralStats>({
    totalReferrals: 0,
    totalEarned: '₹0',
    activeMembers: 0,
    thisMonthReferrals: 0,
  });
  const { user } = useAuth();
  
  // Get actual referral code from user data
  const referralCode = user?.referralCode || user?.refer || `CQ${user?.userId || '12345'}`;
  // Direct APK download link with referral tracking
  const referralUrl = `https://expo.dev/accounts/arun-j/projects/MLMApp/builds/c55b55cb-c3d4-4b60-bcc4-2c79e6433976?ref=${referralCode}`;
  const shareMessage = `Join CQ Wealth and start earning! Use my referral code: ${referralCode}\n\nDownload APK: ${referralUrl}\n\nAfter installing, use referral code: ${referralCode}`;

  const sharePlatforms = [
    { name: 'WhatsApp', icon: 'message1', color: '#25D366' },
    { name: 'Telegram', icon: 'message1', color: '#0088cc' },
    { name: 'Facebook', icon: 'facebook-square', color: '#1877f2' },
    { name: 'Instagram', icon: 'instagram', color: '#e4405f' },
    { name: 'Twitter', icon: 'twitter', color: '#1da1f2' },
    { name: 'Email', icon: 'mail', color: '#ea4335' },
    { name: 'SMS', icon: 'message1', color: '#34c759' },
    { name: 'Copy Link', icon: 'copy1', color: '#ff9500' },
  ];

  // Fetch referral stats
  useEffect(() => {
    fetchReferralStats();
  }, []);

  const fetchReferralStats = async () => {
    try {
      setLoading(true);
      
      if (!user?.userId) {
        console.log('No user ID available');
        setLoading(false);
        return;
      }

      // Fetch referral data and earnings data in parallel
      const [referralsResponse, balanceResponse] = await Promise.all([
        apiServiceAxios.getUserReferrals(user.userId),
        apiServiceAxios.getApprovedWalletBalance()
      ]);

      if (referralsResponse.success && referralsResponse.data) {
        const referrals = referralsResponse.data.referrals || [];
        const totalReferrals = referrals.length;
        
        // Count active members (those who paid activation)
        const activeMembers = referrals.filter((ref: any) => ref.hasPaidActivation === true).length;
        
        // Count this month's referrals
        const currentDate = new Date();
        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();
        
        const thisMonthReferrals = referrals.filter((ref: any) => {
          if (!ref.createdAt) return false;
          const refDate = new Date(ref.createdAt);
          return refDate.getMonth() === currentMonth && refDate.getFullYear() === currentYear;
        }).length;

        // Get total earned - use same source as Dashboard's lifetime earnings
        let totalEarned = '₹0';
        if (balanceResponse.success && balanceResponse.data) {
          const earnings = balanceResponse.data.totalEarnings || 0;
          totalEarned = `₹${earnings.toFixed(0)}`;
          console.log('✅ ShareReferral - Lifetime earnings:', earnings);
        }

        setStats({
          totalReferrals,
          totalEarned,
          activeMembers,
          thisMonthReferrals,
        });
        
        console.log('📊 ShareReferral - Stats updated:', {
          totalReferrals,
          totalEarned,
          activeMembers,
          thisMonthReferrals
        });
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      Alert.alert('Error', 'Failed to load referral statistics');
    } finally {
      setLoading(false);
    }
  };

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
      const result = await Share.share({
        message: shareMessage,
        url: referralUrl,
        title: 'Join CQ Wealth',
      });

      if (result.action === Share.sharedAction) {
        if (result.activityType) {
          // Shared with activity type of result.activityType
          console.log('Shared with activity type:', result.activityType);
        } else {
          // Shared
          console.log('Shared successfully');
        }
      } else if (result.action === Share.dismissedAction) {
        // Dismissed
        console.log('Share dismissed');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to share referral');
    }
  };

  const shareViaPlatform = (platform: string) => {
    try {
      if (platform === 'Copy Link') {
        Clipboard.setString(shareMessage);
        Alert.alert('Copied!', 'Share message copied to clipboard');
      } else {
        // For other platforms, copy the share message to clipboard
        Clipboard.setString(shareMessage);
        Alert.alert('Share', `Share message copied to clipboard for ${platform}:\n\n${shareMessage}`);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to copy share message');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Share Referral</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Referral Code Card */}
          <View style={styles.referralCard}>
            <Text style={styles.cardTitle}>Your Referral Code</Text>
            <Text style={styles.referralCode}>{referralCode}</Text>
            <Text style={styles.referralUrl}>{referralUrl}</Text>
            
            <View style={styles.copyButtons}>
              <TouchableOpacity 
                style={[styles.copyButton, copied && styles.copiedButton]}
                onPress={copyToClipboard}
              >
                <AntDesign name="copy1" size={20} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>
                  {copied ? 'Copied!' : 'Copy Code'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.shareButton}
                onPress={shareReferral}
              >
                <AntDesign name="sharealt" size={20} color="#FFFFFF" />
                <Text style={styles.copyButtonText}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Share Options */}
          <View style={styles.shareSection}>
            <Text style={styles.sectionTitle}>Share via</Text>
            
            <View style={styles.shareGrid}>
              {sharePlatforms.map((platform, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.shareOption}
                  onPress={() => shareViaPlatform(platform.name)}
                >
                  <View style={[styles.platformIcon, { backgroundColor: platform.color }]}>
                    <AntDesign name={platform.icon as any} size={24} color="#FFFFFF" />
                  </View>
                  <Text style={styles.platformName}>{platform.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Share Message Preview */}
          <View style={styles.messageSection}>
            <Text style={styles.sectionTitle}>Share Message</Text>
            <View style={styles.messageCard}>
              <Text style={styles.messageText}>{shareMessage}</Text>
            </View>
          </View>

          {/* Referral Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Referral Stats</Text>
            <Text style={styles.statsDescription}>
              Track your referral performance and earnings from all commission levels
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading stats...</Text>
              </View>
            ) : (
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalReferrals}</Text>
                  <Text style={styles.statLabel}>Total Referrals</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.totalEarned}</Text>
                  <Text style={styles.statLabel}>Total Earned</Text>
                  <Text style={styles.statSubLabel}>All Level Commissions</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.activeMembers}</Text>
                  <Text style={styles.statLabel}>Active Members</Text>
                </View>
                
                <View style={styles.statCard}>
                  <Text style={styles.statNumber}>{stats.thisMonthReferrals}</Text>
                  <Text style={styles.statLabel}>This Month</Text>
                </View>
              </View>
            )}
          </View>

          {/* Tips Section */}
          <View style={styles.tipsSection}>
            <Text style={styles.sectionTitle}>Sharing Tips</Text>
            
            <View style={styles.tipItem}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Share on social media platforms for maximum reach</Text>
            </View>
            
            <View style={styles.tipItem}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Personalize your message to increase conversion</Text>
            </View>
            
            <View style={styles.tipItem}>
              <AntDesign name="bulb1" size={20} color="#FFD700" />
              <Text style={styles.tipText}>Follow up with potential referrals</Text>
            </View>
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
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  referralCard: {
    backgroundColor: '#FFD700',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 10,
  },
  referralCode: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 5,
  },
  referralUrl: {
    fontSize: 12,
    color: '#333333',
    marginBottom: 20,
    textAlign: 'center',
  },
  copyButtons: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  copyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2196F3',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  copiedButton: {
    backgroundColor: '#4CAF50',
  },
  copyButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  shareSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  shareGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  shareOption: {
    width: '30%',
    alignItems: 'center',
    marginBottom: 20,
  },
  platformIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  platformName: {
    color: '#FFFFFF',
    fontSize: 12,
    textAlign: 'center',
  },
  messageSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  messageCard: {
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
  },
  messageText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  statsDescription: {
    fontSize: 13,
    color: '#999999',
    marginBottom: 15,
    lineHeight: 18,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  loadingText: {
    color: '#CCCCCC',
    fontSize: 14,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  statSubLabel: {
    fontSize: 10,
    color: '#999999',
    textAlign: 'center',
    marginTop: 3,
    fontStyle: 'italic',
  },
  tipsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  tipText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
  },
});

