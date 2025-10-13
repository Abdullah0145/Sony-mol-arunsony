import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ReferralRewardsScreenProps {
  navigation: any;
}

export default function ReferralRewardsScreen({ navigation }: ReferralRewardsScreenProps) {
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
          <Text style={styles.headerTitle}>Referral Rewards</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Main Title */}
          <View style={styles.titleSection}>
            <Text style={styles.mainTitle}>🎁 REFERRAL REWARDS STRUCTURE</Text>
            <Text style={styles.subtitle}>Earn amazing rewards by referring friends!</Text>
          </View>

          {/* Tier 1 - Gold */}
          <View style={styles.tierSection}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: '#FFD700' }]}>
                <Text style={[styles.tierBadgeText, { color: '#000000' }]}>
                  TIER 1 - GOLD
                </Text>
              </View>
            </View>
            
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>🎧</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Earbuds</Text>
                  <Text style={styles.referralsRequired}>50 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '4%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/50</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>⌚</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Watch</Text>
                  <Text style={styles.referralsRequired}>100 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '2%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/100</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>📱</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Tab</Text>
                  <Text style={styles.referralsRequired}>250 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '1%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/250</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>⌚</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Smart Watch</Text>
                  <Text style={styles.referralsRequired}>600 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.3%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/600</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tier 2 - Silver */}
          <View style={styles.tierSection}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: '#C0C0C0' }]}>
                <Text style={[styles.tierBadgeText, { color: '#FFFFFF' }]}>
                  TIER 2 - SILVER
                </Text>
              </View>
            </View>
            
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>📷</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Camera</Text>
                  <Text style={styles.referralsRequired}>1,300 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.2%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/1,300</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>🏍️</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Royal Enfield</Text>
                  <Text style={styles.referralsRequired}>4,000 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.05%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/4,000</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>💻</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>Mac Book</Text>
                  <Text style={styles.referralsRequired}>10,000 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.02%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/10,000</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Tier 3 - Bronze */}
          <View style={styles.tierSection}>
            <View style={styles.tierHeader}>
              <View style={[styles.tierBadge, { backgroundColor: '#CD7F32' }]}>
                <Text style={[styles.tierBadgeText, { color: '#FFFFFF' }]}>
                  TIER 3 - BRONZE
                </Text>
              </View>
            </View>
            
            <View style={styles.rewardsGrid}>
              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>🏠</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>2 BHK Flat</Text>
                  <Text style={styles.referralsRequired}>80,000 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.003%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/80,000</Text>
                </View>
              </View>

              <View style={styles.rewardCard}>
                <View style={styles.productImageContainer}>
                  <Text style={styles.productEmoji}>💰</Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.productName}>₹1.5 Crore</Text>
                  <Text style={styles.referralsRequired}>300,000 Referrals Required</Text>
                </View>
                <View style={styles.progressContainer}>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '0.001%' }]} />
                  </View>
                  <Text style={styles.progressText}>2/300,000</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Call to Action */}
          <View style={styles.ctaSection}>
            <Text style={styles.ctaTitle}>Start Earning Rewards Today!</Text>
            <Text style={styles.ctaText}>
              Share your referral code with friends and family to start earning these amazing rewards.
            </Text>
            <TouchableOpacity 
              style={styles.ctaButton}
              onPress={() => navigation.navigate('Referrals')}
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
  tierSection: {
    marginHorizontal: 15,
    marginBottom: 25,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
  },
  tierHeader: {
    marginBottom: 20,
    alignItems: 'center',
  },
  tierBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  tierBadgeText: {
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  rewardsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  rewardCard: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#3A3A3A',
  },
  productImageContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  productEmoji: {
    fontSize: 50,
    marginBottom: 5,
  },
  rewardInfo: {
    alignItems: 'center',
    marginBottom: 10,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 5,
  },
  referralsRequired: {
    fontSize: 12,
    color: '#FFD700',
    textAlign: 'center',
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
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
    fontSize: 10,
    color: '#CCCCCC',
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
