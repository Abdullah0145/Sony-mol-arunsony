import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AntDesign from '@expo/vector-icons/AntDesign';

// Import AuthContext
import { AuthProvider, useAuth } from './components/AuthContext';
import { useUserActivity } from './components/useUserActivity';

// Import screens
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import JoinScreen from './screens/JoinScreen';
import LevelsScreen from './screens/LevelsScreen';
import TermsScreen from './screens/TermsScreen';
import DashboardScreen from './screens/DashboardScreen';
import EarningsScreen from './screens/EarningsScreen';
import ProductsScreen from './screens/ProductsScreen';

// Import new detailed screens
import ShareReferralScreen from './screens/ShareReferralScreen';
import ViewEarningsScreen from './screens/ViewEarningsScreen';
import WithdrawScreen from './screens/WithdrawScreen';
import WithdrawalHistoryScreen from './screens/WithdrawalHistoryScreen';
import WithdrawalDetailsScreen from './screens/WithdrawalDetailsScreen';
import ActivityDetailsScreen from './screens/ActivityDetailsScreen';
import CommissionDetailsScreen from './screens/CommissionDetailsScreen';
import ReferralProfileScreen from './screens/ReferralProfileScreen';
import ProductDetailsScreen from './screens/ProductDetailsScreen';
import EarningsBreakdownScreen from './screens/EarningsBreakdownScreen';

// Import new essential screens
import ProfileScreen from './screens/ProfileScreen';
import PaymentHistoryScreen from './screens/PaymentHistoryScreen';
import OrdersScreen from './screens/OrdersScreen';
import SupportScreen from './screens/SupportScreen';
import TeamScreen from './screens/TeamScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import TrainingScreen from './screens/TrainingScreen';
import OtpVerificationScreen from './screens/OtpVerificationScreen';
import NetworkTestScreen from './screens/NetworkTestScreen';
import ReferralRewardsScreen from './screens/ReferralRewardsScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import ResetPasswordScreen from './screens/ResetPasswordScreen';
import PaymentRequiredScreen from './screens/PaymentRequiredScreen';
import CheckoutScreen from './screens/CheckoutScreen';
import ReferralCodeGeneratedScreen from './screens/ReferralCodeGeneratedScreen';

// Import protected screens
import ProtectedDashboardScreen from './screens/ProtectedDashboardScreen';
import ProtectedEarningsScreen from './screens/ProtectedEarningsScreen';
import ProtectedTeamScreen from './screens/ProtectedTeamScreen';

// Import PaymentGuard
import PaymentGuard from './components/PaymentGuard';
import SimplePaymentGuard from './components/SimplePaymentGuard';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof AntDesign.glyphMap;

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home';
          } else if (route.name === 'Team') {
            iconName = focused ? 'team' : 'team';
          } else if (route.name === 'Earnings') {
            iconName = focused ? 'linechart' : 'linechart';
          } else if (route.name === 'Products') {
            iconName = focused ? 'gift' : 'gift';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'user' : 'user';
          } else {
            iconName = 'home';
          }

          return <AntDesign name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#FFD700',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#1A1A1A',
          borderTopColor: '#333333',
          borderTopWidth: 1,
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={ProtectedDashboardScreen} options={{ title: 'Home' }} />
      <Tab.Screen name="Team" component={ProtectedTeamScreen} options={{ title: 'Referrals' }} />
      <Tab.Screen name="Earnings" component={ProtectedEarningsScreen} options={{ title: 'Earnings' }} />
      <Tab.Screen name="Products" component={ProductsScreen} options={{ title: 'Products' }} />
    </Tab.Navigator>
  );
}

// Auth Navigator for login/signup flow
function AuthNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Join" component={JoinScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} />
      <Stack.Screen name="NetworkTest" component={NetworkTestScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
    </Stack.Navigator>
  );
}

// Main Navigator for authenticated users - SIMPLIFIED
function MainNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="TabNavigator"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#000000' },
      }}
    >
      {/* Main App with Tabs */}
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      
      {/* Payment Required Screen */}
      <Stack.Screen name="PaymentRequired" component={PaymentRequiredScreen} />
      
      
      {/* All other screens */}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Levels" component={LevelsScreen} />
      <Stack.Screen name="ShareReferral" component={ShareReferralScreen} />
      <Stack.Screen name="ViewEarnings" component={ViewEarningsScreen} />
      <Stack.Screen name="Withdraw" component={WithdrawScreen} />
      <Stack.Screen name="WithdrawalHistory" component={WithdrawalHistoryScreen} />
      <Stack.Screen name="WithdrawalDetails" component={WithdrawalDetailsScreen} />
      <Stack.Screen name="ActivityDetails" component={ActivityDetailsScreen} />
      <Stack.Screen name="CommissionDetails" component={CommissionDetailsScreen} />
      <Stack.Screen name="ReferralProfile" component={ReferralProfileScreen} />
      <Stack.Screen name="ProductDetails" component={ProductDetailsScreen} />
      <Stack.Screen name="EarningsBreakdown" component={EarningsBreakdownScreen} />
      <Stack.Screen name="PaymentHistory" component={PaymentHistoryScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Training" component={TrainingScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrdersScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="ReferralRewards" component={ReferralRewardsScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="ReferralCodeGenerated" component={ReferralCodeGeneratedScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }}>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </SafeAreaView>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function AppContent() {
  const { isAuthenticated, hasPaid } = useAuth();
  
  // Track user activity to reset session timers
  useUserActivity();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      {isAuthenticated ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}
