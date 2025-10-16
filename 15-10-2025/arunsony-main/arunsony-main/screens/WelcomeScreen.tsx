import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';

interface WelcomeScreenProps {
  navigation: any;
}

export default function WelcomeScreen({ navigation }: WelcomeScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // If user is already authenticated, navigate to main app
    if (isAuthenticated) {
      navigation.replace('TabNavigator');
    }
  }, [isAuthenticated, navigation]);

  const { width: screenWidth } = Dimensions.get('window');

  const carouselData = [
    {
      id: '1',
      type: 'features',
      title: 'Why Choose CQ Wealth?',
      content: [
        {
          icon: 'linechart',
          title: 'Unlimited Earning Potential',
          description: 'Earn from multiple levels with our proven wealth building structure'
        },
        {
          icon: 'team',
          title: 'Build Your Network',
          description: 'Create a strong downline and watch your passive income grow.'
        },
        {
          icon: 'gift',
          title: 'Premium Products',
          description: 'Custom t-shirts, mugs, and chocolates for every member.'
        },
        {
          icon: 'star',
          title: 'Level Up System',
          description: 'Progress from Bronze to Diamond with exclusive perks.'
        }
      ]
    },
    {
      id: '2',
      type: 'levels',
      title: 'Membership Levels',
      content: [
        { name: 'Bronze', earning: 'Earn 10%', color: '#CD7F32' },
        { name: 'Silver', earning: 'Earn 20%', color: '#C0C0C0' },
        { name: 'Gold', earning: 'Earn 30%', color: '#FFD700' },
        { name: 'Diamond', earning: 'Earn 40%', color: '#B9F2FF' }
      ]
    },
    {
      id: '3',
      type: 'cta',
      title: 'Exclusive Benefits Await',
      description: 'Unlock premium rewards, exclusive products, and a supportive community of successful entrepreneurs'
    },
    {
      id: '4',
      type: 'hero',
      title: 'CQ Wealth',
      subtitle: 'Join the ultimate referral lifestyle club and build your financial freedom.'
    }
  ];

  const renderCarouselItem = ({ item }: { item: any }) => {
    switch (item.type) {
      case 'features':
        return (
          <View style={[styles.carouselItem, { width: screenWidth }]}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            {item.content.map((feature: any, index: number) => (
              <View key={index} style={styles.featureCard}>
                <AntDesign name={feature.icon as any} size={24} color="#FFD700" style={styles.featureIcon} />
                <View style={styles.featureContent}>
                  <Text style={styles.featureTitle}>{feature.title}</Text>
                  <Text style={styles.featureDescription}>{feature.description}</Text>
                </View>
              </View>
            ))}
          </View>
        );

      case 'levels':
        return (
          <View style={[styles.carouselItem, { width: screenWidth }]}>
            <Text style={styles.sectionTitle}>{item.title}</Text>
            <View style={styles.levelGrid}>
              {item.content.map((level: any, index: number) => (
                <TouchableOpacity 
                  key={index}
                  style={styles.levelCard}
                  onPress={() => navigation.navigate('Levels')}
                >
                  <AntDesign name="star" size={32} color={level.color} style={styles.levelIcon} />
                  <Text style={styles.levelName}>{level.name}</Text>
                  <Text style={styles.levelEarning}>{level.earning}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );

             case 'cta':
         return (
           <View style={[styles.carouselItem, { width: screenWidth }]}>
             <Text style={styles.sectionTitle}>{item.title}</Text>
             <Text style={styles.readyDescription}>{item.description}</Text>
             
             {/* Benefits Grid */}
             <View style={styles.benefitsGrid}>
               <View style={styles.benefitItem}>
                 <AntDesign name="gift" size={32} color="#FFD700" />
                 <Text style={styles.benefitTitle}>Premium Products</Text>
                 <Text style={styles.benefitSubtitle}>Exclusive merchandise</Text>
               </View>
               
               <View style={styles.benefitItem}>
                 <AntDesign name="team" size={32} color="#FFD700" />
                 <Text style={styles.benefitTitle}>Community</Text>
                 <Text style={styles.benefitSubtitle}>Supportive network</Text>
               </View>
               
               <View style={styles.benefitItem}>
                 <AntDesign name="heart" size={32} color="#FFD700" />
                 <Text style={styles.benefitTitle}>Rewards</Text>
                 <Text style={styles.benefitSubtitle}>Loyalty bonuses</Text>
               </View>
               
               <View style={styles.benefitItem}>
                 <AntDesign name="star" size={32} color="#FFD700" />
                 <Text style={styles.benefitTitle}>VIP Access</Text>
                 <Text style={styles.benefitSubtitle}>Special privileges</Text>
               </View>
             </View>
           </View>
         );

      case 'hero':
        return (
          <View style={[styles.carouselItem, { width: screenWidth }]}>
            <View style={styles.heroSection}>
              <View style={styles.logoContainer}>
                <AntDesign name="star" size={48} color="#FFD700" />
              </View>
              <Text style={styles.mainTitle}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              
              <TouchableOpacity 
                style={styles.primaryButton}
                onPress={() => navigation.navigate('Join')}
              >
                <Text style={styles.primaryButtonText}>Join Now</Text>
                <AntDesign name="arrowright" size={18} color="#000000" style={{ marginLeft: 10 }} />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.loginLink}
                onPress={() => navigation.navigate('Login')}
              >
                <Text style={styles.loginText}>Already a Member? Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const onViewableItemsChanged = ({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <FlatList
        ref={flatListRef}
        data={carouselData}
        renderItem={renderCarouselItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
      />
      
      {/* Pagination Dots */}
      <View style={styles.paginationContainer}>
        {carouselData.map((_, index) => (
          <View
            key={index}
            style={[
              styles.paginationDot,
              { backgroundColor: index === currentIndex ? '#FFD700' : '#666666' }
            ]}
          />
        ))}
      </View>

      {/* Skip Button */}
      <TouchableOpacity 
        style={styles.skipButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.skipText}>Skip</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  carouselItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  heroSection: {
    alignItems: 'center',
    padding: 20,
    paddingTop: 40,
  },
  logoContainer: {
    marginBottom: 15,
  },
  mainTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginLink: {
    marginBottom: 20,
  },
  loginText: {
    color: '#CCCCCC',
    fontSize: 16,
    textDecorationLine: 'underline',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    textAlign: 'center',
    marginBottom: 20,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    width: '100%',
  },
  featureIcon: {
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  featureDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  levelGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
  },
  levelCard: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  levelIcon: {
    marginBottom: 10,
  },
  levelName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  levelEarning: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  readyDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  secondaryButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 100,
    left: 0,
    right: 0,
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  skipButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
  },
  skipText: {
    color: '#CCCCCC',
    fontSize: 16,
    fontWeight: '600',
  },
  benefitsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  benefitItem: {
    width: '48%',
    backgroundColor: '#2A2A2A',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  benefitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
    marginBottom: 5,
    textAlign: 'center',
  },
  benefitSubtitle: {
    fontSize: 12,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});
