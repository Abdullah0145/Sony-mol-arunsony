import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface LevelsScreenProps {
  navigation: any;
}

export default function LevelsScreen({ navigation }: LevelsScreenProps) {
  const levels = [
    {
      name: 'Bronze',
      icon: '🥉',
      earning: '10%',
      price: '₹1,000',
      benefits: [
        'Access to wealth building network',
        'Basic training materials',
        'Product package worth ₹500',
        'Support via email',
        'Monthly newsletter'
      ]
    },
    {
      name: 'Silver',
      icon: '🥈',
      earning: '20%',
      price: '₹2,500',
      benefits: [
        'All Bronze benefits',
        'Advanced training program',
        'Product package worth ₹1,200',
        'Priority support',
        'Weekly webinars',
        'Team building tools'
      ]
    },
    {
      name: 'Gold',
      icon: '👑',
      earning: '30%',
      price: '₹5,000',
      benefits: [
        'All Silver benefits',
        'Premium training suite',
        'Product package worth ₹2,500',
        '24/7 support',
        'Personal mentor',
        'Exclusive events access',
        'Advanced analytics'
      ]
    },
    {
      name: 'Diamond',
      icon: '💎',
      earning: '40%',
      price: '₹10,000',
      benefits: [
        'All Gold benefits',
        'VIP training program',
        'Product package worth ₹5,000',
        'Dedicated account manager',
        'Luxury retreat access',
        'Custom marketing materials',
        'Profit sharing bonus'
      ]
    }
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Membership Levels</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Introduction */}
        <View style={styles.introSection}>
          <Text style={styles.introTitle}>Choose Your Success Path</Text>
          <Text style={styles.introDescription}>
            Each level offers unique benefits and earning potential. Start with Bronze and upgrade as you grow your network.
          </Text>
        </View>

        {/* Levels */}
        {levels.map((level, index) => (
          <View key={index} style={styles.levelCard}>
            <View style={styles.levelHeader}>
              <Text style={styles.levelIcon}>{level.icon}</Text>
              <View style={styles.levelInfo}>
                <Text style={styles.levelName}>{level.name}</Text>
                <Text style={styles.levelEarning}>Earn {level.earning}</Text>
              </View>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{level.price}</Text>
              </View>
            </View>

            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Benefits:</Text>
              {level.benefits.map((benefit, benefitIndex) => (
                <View key={benefitIndex} style={styles.benefitItem}>
                  <Text style={styles.benefitIcon}>✓</Text>
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>

                         <TouchableOpacity 
               style={styles.selectButton}
               onPress={() => navigation.navigate('Join')}
             >
              <Text style={styles.selectButtonText}>Select {level.name}</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* Comparison Table */}
        <View style={styles.comparisonSection}>
          <Text style={styles.comparisonTitle}>Quick Comparison</Text>
          <View style={styles.comparisonTable}>
            <View style={styles.tableHeader}>
              <Text style={styles.tableHeaderText}>Level</Text>
              <Text style={styles.tableHeaderText}>Earning</Text>
              <Text style={styles.tableHeaderText}>Price</Text>
            </View>
            {levels.map((level, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={styles.tableCell}>{level.name}</Text>
                <Text style={styles.tableCell}>{level.earning}</Text>
                <Text style={styles.tableCell}>{level.price}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <View style={styles.ctaSection}>
          <Text style={styles.ctaTitle}>Ready to Start Earning?</Text>
          <Text style={styles.ctaDescription}>
            Join thousands of successful members building their financial future
          </Text>
                     <TouchableOpacity 
             style={styles.ctaButton}
             onPress={() => navigation.navigate('Join')}
           >
            <Text style={styles.ctaButtonText}>Get Started Today</Text>
          </TouchableOpacity>
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
  introSection: {
    padding: 20,
    paddingBottom: 10,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  introDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 22,
  },
  levelCard: {
    backgroundColor: '#1A1A1A',
    margin: 15,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  levelHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  levelIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  levelInfo: {
    flex: 1,
  },
  levelName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  levelEarning: {
    fontSize: 16,
    color: '#FFD700',
    fontWeight: 'bold',
  },
  priceContainer: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  benefitsContainer: {
    marginBottom: 20,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 10,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitIcon: {
    fontSize: 16,
    color: '#FFD700',
    marginRight: 10,
    fontWeight: 'bold',
  },
  benefitText: {
    fontSize: 14,
    color: '#CCCCCC',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  comparisonSection: {
    padding: 20,
  },
  comparisonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  comparisonTable: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#2A2A2A',
    paddingVertical: 15,
  },
  tableHeaderText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: '#FFFFFF',
  },
  ctaSection: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
  },
  ctaButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
