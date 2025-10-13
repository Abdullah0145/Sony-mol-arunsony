import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  ActivityIndicator 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios, UserReward } from '../services/api-axios';
import LoadingSpinner from '../components/LoadingSpinner';
import LoadingButton from '../components/LoadingButton';

interface ReferralRewardsScreenProps {
  navigation: any;
  route?: {
    params?: {
      refreshRewards?: boolean;
    };
  };
}

export default function ReferralRewardsScreen({ navigation, route }: ReferralRewardsScreenProps) {
  const { user } = useAuth();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [availableRewards, setAvailableRewards] = useState<UserReward[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [claiming, setClaiming] = useState<number | null>(null);

  useEffect(() => {
    if (user?.userId) {
      loadRewards();
    }
  }, [user?.userId]);

  useEffect(() => {
    if (route?.params?.refreshRewards) {
      loadRewards();
    }
  }, [route?.params?.refreshRewards]);

  const loadRewards = async () => {
    try {
      setLoading(true);
      
      if (user?.userId) {
        const [userRewardsResponse, availableRewardsResponse] = await Promise.all([
          apiServiceAxios.getUserRewards(Number(user.userId)),
          apiServiceAxios.getAvailableRewards(Number(user.userId))
        ]);

        if (userRewardsResponse.success && userRewardsResponse.data) {
          setUserRewards(userRewardsResponse.data.rewards || []);
        }

        if (availableRewardsResponse.success && availableRewardsResponse.data) {
          setAvailableRewards(availableRewardsResponse.data.availableRewards || []);
        }
      }
    } catch (error) {
      console.error('Error loading rewards:', error);
      Alert.alert('Error', 'Failed to load rewards. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadRewards();
  };

  const handleClaimReward = async (userRewardId: number) => {
    try {
      setClaiming(userRewardId);
      
      const response = await apiServiceAxios.claimReward(userRewardId);
      
      if (response.success) {
        Alert.alert(
          'Reward Claimed! 🎉',
          'Your reward has been successfully claimed!',
          [{ text: 'OK', onPress: () => {
            loadRewards();
            // Navigate back to dashboard and trigger refresh
            navigation.navigate('Dashboard', { refreshData: true });
          }}]
        );
      } else {
        Alert.alert('Error', response.error || 'Failed to claim reward');
      }
    } catch (error) {
      console.error('Error claiming reward:', error);
      Alert.alert('Error', 'Failed to claim reward. Please try again.');
    } finally {
      setClaiming(null);
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType.toLowerCase()) {
      case 'cash':
        return '💰';
      case 'gift':
        return '🎁';
      case 'discount':
        return '🏷️';
      case 'points':
        return '⭐';
      default:
        return '🎯';
    }
  };

  const getProgressPercentage = (current: number, required: number) => {
    return Math.min((current / required) * 100, 100);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not claimed';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const renderRewardCard = (reward: UserReward, isAvailable: boolean = false) => (
    <View key={reward.userRewardId} style={styles.rewardCard}>
      <View style={styles.rewardHeader}>
        <View style={styles.rewardIconContainer}>
          <Text style={styles.rewardIcon}>{getRewardIcon(reward.rewardType)}</Text>
        </View>
        <View style={styles.rewardInfo}>
          <Text style={styles.rewardName}>{reward.rewardName}</Text>
          <Text style={styles.rewardType}>{reward.rewardType}</Text>
          {reward.rewardValue && (
            <Text style={styles.rewardValue}>₹{reward.rewardValue}</Text>
          )}
        </View>
        <View style={styles.statusContainer}>
          {reward.isClaimed ? (
            <View style={[styles.statusBadge, styles.claimedBadge]}>
              <Text style={styles.statusText}>Claimed</Text>
            </View>
          ) : isAvailable ? (
            <View style={[styles.statusBadge, styles.availableBadge]}>
              <Text style={styles.statusText}>Available</Text>
            </View>
          ) : (
            <View style={[styles.statusBadge, styles.pendingBadge]}>
              <Text style={styles.statusText}>Pending</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.rewardDetails}>
        <Text style={styles.levelText}>Level {reward.levelNumber}</Text>
        <Text style={styles.requirementText}>
          Requires {reward.requiredReferrals} referrals
        </Text>
        
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${getProgressPercentage(reward.userCurrentReferrals, reward.requiredReferrals)}%` }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {reward.userCurrentReferrals}/{reward.requiredReferrals}
          </Text>
        </View>

        {reward.eligibilityStatus && (
          <Text style={styles.eligibilityText}>{reward.eligibilityStatus}</Text>
        )}

        {reward.isClaimed && reward.claimedAt && (
          <Text style={styles.claimedDateText}>
            Claimed on: {formatDate(reward.claimedAt)}
          </Text>
        )}
      </View>

             {isAvailable && !reward.isClaimed && (
               <LoadingButton
                 title="Claim Reward"
                 onPress={() => handleClaimReward(reward.userRewardId)}
                 loading={claiming === reward.userRewardId}
                 loadingText="Claiming..."
                 variant="primary"
                 size="medium"
                 style={styles.claimButton}
                 loadingColor="#000000"
               />
             )}
    </View>
  );

         if (loading) {
           return (
             <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
               <View style={styles.header}>
                 <TouchableOpacity 
                   style={styles.backButton}
                   onPress={() => navigation.goBack()}
                 >
                   <Text style={styles.backButtonText}>←</Text>
                 </TouchableOpacity>
                 <Text style={styles.headerTitle}>My Rewards</Text>
                 <View style={styles.placeholder} />
               </View>
               <LoadingSpinner 
                 size="large" 
                 color="#FFD700" 
                 text="Loading your rewards..." 
                 animated={true}
               />
             </SafeAreaView>
           );
         }
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>My Rewards</Text>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={onRefresh}
          >
            <Text style={styles.refreshButtonText}>↻</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
          }
        >
          {/* Main Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>🎁 MY REWARDS</Text>
            <Text style={styles.subtitle}>Track your progress and claim your earned rewards!</Text>
          </View>

          {/* Available Rewards Section */}
          {availableRewards.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🎯 Available to Claim</Text>
                <Text style={styles.sectionSubtitle}>You can claim these rewards now!</Text>
              </View>
              {availableRewards.map(reward => renderRewardCard(reward, true))}
            </View>
          )}

          {/* All Rewards Section */}
          {userRewards.length > 0 && (
            <View style={styles.sectionContainer}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>📊 All My Rewards</Text>
                <Text style={styles.sectionSubtitle}>Complete overview of your reward progress</Text>
                </View>
              {userRewards.map(reward => renderRewardCard(reward, false))}
                </View>
          )}

          {/* Empty State */}
          {userRewards.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🎁</Text>
              <Text style={styles.emptyTitle}>No Rewards Yet</Text>
              <Text style={styles.emptyText}>
                Start referring friends to unlock amazing rewards! Your progress will be tracked here.
                </Text>
              <TouchableOpacity 
                style={styles.ctaButton}
                onPress={() => navigation.navigate('TabNavigator', { screen: 'Team' })}
              >
                <Text style={styles.ctaButtonText}>Start Referring</Text>
              </TouchableOpacity>
              </View>
          )}

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Keep Earning Rewards!</Text>
            <Text style={styles.ctaText}>
              Share your referral code with friends and family to unlock more rewards.
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('TabNavigator', { screen: 'Team' })}
            >
              <Text style={styles.ctaButtonText}>Go to Referrals</Text>
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
  content: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#FFD700',
  },
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    fontSize: 20,
    color: '#FFD700',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#CCCCCC',
  },
  titleSection: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 15,
    borderRadius: 12,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 15,
    marginBottom: 25,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  rewardCard: {
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  rewardIconContainer: {
    marginRight: 15,
  },
  rewardIcon: {
    fontSize: 40,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  rewardType: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 3,
  },
  rewardValue: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  statusContainer: {
    alignItems: 'flex-end',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  claimedBadge: {
    backgroundColor: '#4CAF50',
  },
  availableBadge: {
    backgroundColor: '#2196F3',
  },
  pendingBadge: {
    backgroundColor: '#FF9800',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  rewardDetails: {
    marginBottom: 15,
  },
  levelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFD700',
    marginBottom: 5,
  },
  requirementText: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  progressContainer: {
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#3A3A3A',
    borderRadius: 4,
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
  eligibilityText: {
    fontSize: 12,
    color: '#FFD700',
    fontStyle: 'italic',
    marginBottom: 5,
  },
  claimedDateText: {
    fontSize: 12,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  claimButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  claimButtonDisabled: {
    backgroundColor: '#666666',
  },
  claimButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    margin: 15,
    borderRadius: 12,
  },
  emptyIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  ctaSection: {
    padding: 20,
    backgroundColor: '#1A1A1A',
    margin: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
    textAlign: 'center',
  },
  ctaText: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
