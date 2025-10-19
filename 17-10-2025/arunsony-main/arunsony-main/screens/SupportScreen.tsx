import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface SupportScreenProps {
  navigation: any;
}

export default function SupportScreen({ navigation }: SupportScreenProps) {
  const [activeTab, setActiveTab] = useState('FAQ');
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [expandedHelpCategory, setExpandedHelpCategory] = useState<string | null>(null);
  const [contactForm, setContactForm] = useState({
    subject: '',
    message: '',
    priority: 'Medium'
  });

  const tabs = ['FAQ', 'Contact', 'Help Center'];

  const faqCategories = [
    {
      title: 'Getting Started',
      icon: 'rocket1',
      faqs: [
        {
          question: 'How do I join CQ Wealth?',
          answer: 'To join CQ Wealth, simply click the "Join Now" button on the home screen, fill out the registration form, and pay the membership fee. You\'ll receive immediate access to our network and earning opportunities.'
        },
        {
          question: 'What are the different membership levels?',
          answer: 'We offer 3 membership levels: Bronze , Silver , and Gold . Each level offers different earning percentages and benefits.'
        },
        {
          question: 'How do I start earning money?',
          answer: 'You can start earning immediately by referring new members to the platform. You earn commissions from your direct referrals and their referrals through our multi-level structure.'
        }
      ]
    },
    {
      title: 'Earnings & Payments',
      icon: 'wallet',
      faqs: [
        {
          question: 'How are commissions calculated?',
          answer: 'Commissions are calculated based on your membership level and the level of your referrals. Level 1 referrals earn you the highest commission, with decreasing amounts for deeper levels.'
        },
        {
          question: 'When can I withdraw my earnings?',
          answer: 'You can withdraw your earnings once you have a minimum balance of ₹100. Withdrawals are processed within 2-3 business days.'
        },
        {
          question: 'What payment methods are available?',
          answer: 'We support UPI, bank transfers, Paytm, and Google Pay for withdrawals. You can add multiple payment methods in your profile settings.'
        }
      ]
    },
    {
      title: 'Referrals & Network',
      icon: 'team',
      faqs: [
        {
          question: 'How many levels can I earn from?',
          answer: 'You can earn from up to 3 levels of referrals, with the commission percentage decreasing at each level as per our compensation plan.'
        },
        {
          question: 'How do I share my referral link?',
          answer: 'Go to the Referrals screen and tap "Share Referral". You can copy your referral code or share it directly via WhatsApp, Telegram, or other social media platforms.'
        },
        {
          question: 'Can I see my team structure?',
          answer: 'Yes, you can view your complete team structure in the Referrals section of the app.'
        }
      ]
    },
    {
      title: 'Products & Orders',
      icon: 'gift',
      faqs: [
        {
          question: 'What products are available?',
          answer: 'We offer premium CQ Wealth merchandise including custom Dairy , Pen and Keychains .All products are high-quality and branded with our logo.'
        },
        {
          question: 'How do I place an order?',
          answer: 'Navigate to the Products screen, browse available items, add them to your cart, and proceed to checkout. You can pay using your earnings balance or other payment methods.'
        },
        {
          question: 'What is the delivery time?',
          answer: 'Standard delivery takes 3-5 business days within India. Express delivery options are available for faster shipping at additional cost.'
        }
      ]
    }
  ];

  const helpCategories = [
    {
      title: 'Account Issues',
      icon: 'user',
      description: 'Problems with login, profile, or account settings',
      color: '#4CAF50',
      items: [
        '• Forgot password - Use "Forgot Password" on login screen to reset via email',
        '• Can\'t login - Verify your email/phone and password. Clear app cache if needed',
        '• Update profile - Go to Profile > Edit to update your name, email, or phone',
        '• Change password - Profile > Security Settings > Change Password',
        '• Account verification - Check your email for verification link after signup',
        '• Locked account - Contact support if account is locked after 5 failed attempts',
        '• Delete account - Go to Profile > Settings > Delete Account (irreversible)'
      ]
    },
    {
      title: 'Payment Problems',
      icon: 'creditcard',
      description: 'Issues with withdrawals, payments, or transactions',
      color: '#FF9800',
      items: [
        '• Withdrawal pending - Withdrawals take 2-3 business days to process',
        '• Payment failed - Check your bank details and ensure minimum balance of ₹500',
        '• Missing commission - Commissions appear within 24 hours of referral activation',
        '• Refund request - Contact support with transaction ID for refund processing',
        '• Update bank details - Profile > Payment Methods > Add/Update Bank Account',
        '• Transaction history - View all transactions in Payment History screen',
        '• Tax information - Download tax documents from Profile > Tax Documents',
        '• Payment disputes - Report within 7 days via Support > Payment Problems'
      ]
    },
    {
      title: 'Technical Support',
      icon: 'tool',
      description: 'App crashes, bugs, or technical difficulties',
      color: '#2196F3',
      items: [
        '• App crashing - Update to latest version from Play Store',
        '• Slow performance - Clear app cache: Settings > Apps > CQ Wealth > Clear Cache',
        '• Loading issues - Check your internet connection and restart app',
        '• Features not working - Ensure app has all required permissions',
        '• Screen display issues - Adjust display settings in Profile > Display',
        '• Notification problems - Enable notifications in phone settings',
        '• Data sync issues - Force sync by pulling down on Dashboard screen',
        '• Report a bug - Help > Report Bug with screenshots and details'
      ]
    },
    {
      title: 'Referral Issues',
      icon: 'team',
      description: 'Problems with referrals or commission calculations',
      color: '#9C27B0',
      items: [
        '• Referral not counted - Referral must complete activation payment to count',
        '• Commission not received - Commissions process within 24 hours of payment',
        '• Wrong commission amount - Verify your tier level and referral depth',
        '• Can\'t find referral code - Go to Referrals > Share Referral to view your code',
        '• Team not showing - Pull down to refresh Team screen for latest updates',
        '• Level confusion - Bronze=10%, Silver=20%, Gold=30%, Diamond=40% commission',
        '• Multi-level tracking - Track up to 4 levels of referrals in Team screen',
        '• Referral link not working - Regenerate link in Referrals > Share Referral'
      ]
    },
    {
      title: 'Product Support',
      icon: 'gift',
      description: 'Questions about products, orders, or delivery',
      color: '#F44336',
      items: [
        '• Order status - Track orders in Profile > My Orders with real-time updates',
        '• Delivery time - Standard delivery: 3-5 days, Express: 1-2 days',
        '• Product quality issues - Report within 7 days for replacement/refund',
        '• Order cancellation - Cancel within 24 hours for full refund',
        '• Shipping charges - Free shipping on orders above ₹999',
        '• Return policy - 7-day return policy on all products (unused condition)',
        '• Product availability - Check product page for stock status',
        '• Bulk orders - Contact support for bulk orders and custom branding'
      ]
    },
    {
      title: 'General Inquiries',
      icon: 'questioncircleo',
      description: 'General questions about CQ Wealth',
      color: '#607D8B',
      items: [
        '• How it works - Refer members, earn commissions on 4 levels of network',
        '• Membership tiers - Bronze (₹1K), Silver (₹2.5K), Gold (₹5K), Diamond (₹10K)',
        '• Earning potential - Unlimited based on network growth and tier level',
        '• Training resources - Access training materials in Support > FAQ section',
        '• Company information - Learn more at www.cqwealth.com/about',
        '• Privacy policy - View full policy at Profile > Legal > Privacy Policy',
        '• Terms of service - Review terms at Profile > Legal > Terms & Conditions',
        '• Partnership opportunities - Email partnerships@cqwealth.com'
      ]
    }
  ];

  const contactMethods = [
    {
      title: 'Live Chat',
      icon: 'message1',
      description: 'Chat with our support team',
      action: () => Alert.alert('Live Chat', 'Connecting you to live chat...')
    },
    {
      title: 'Email Support',
      icon: 'mail',
      description: 'info@camelq.info',
      action: () => Alert.alert('Email', 'Opening email client...')
    },
    {
      title: 'Phone Support',
      icon: 'phone',
      description: '+91 9059614343',
      action: () => Alert.alert('Phone', 'Calling support...')
    }
    
  ];

  const toggleFAQ = (question: string) => {
    setExpandedFAQ(expandedFAQ === question ? null : question);
  };

  const toggleHelpCategory = (title: string) => {
    setExpandedHelpCategory(expandedHelpCategory === title ? null : title);
  };

  const submitContactForm = () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    Alert.alert('Success', 'Your message has been sent. We\'ll get back to you within 24 hours.');
    setContactForm({ subject: '', message: '', priority: 'Medium' });
  };

  const renderFAQContent = () => (
    <View style={styles.faqContent}>
      {faqCategories.map((category, categoryIndex) => (
        <View key={categoryIndex} style={styles.faqCategory}>
          <View style={styles.categoryHeader}>
            <AntDesign name={category.icon as any} size={20} color="#FFD700" />
            <Text style={styles.categoryTitle}>{category.title}</Text>
          </View>
          
          {category.faqs.map((faq, faqIndex) => (
            <TouchableOpacity
              key={faqIndex}
              style={styles.faqItem}
              onPress={() => toggleFAQ(faq.question)}
            >
              <View style={styles.faqQuestion}>
                <Text style={styles.faqQuestionText}>{faq.question}</Text>
                <AntDesign 
                  name={expandedFAQ === faq.question ? "up" : "down"} 
                  size={16} 
                  color="#FFD700" 
                />
              </View>
              
              {expandedFAQ === faq.question && (
                <Text style={styles.faqAnswer}>{faq.answer}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      ))}
    </View>
  );

  const renderContactContent = () => (
    <View style={styles.contactContent}>
      {/* Contact Methods */}
      <View style={styles.contactMethods}>
        <Text style={styles.sectionTitle}>Contact Methods</Text>
        {contactMethods.map((method, index) => (
          <TouchableOpacity
            key={index}
            style={styles.contactMethod}
            onPress={method.action}
          >
            <AntDesign name={method.icon as any} size={24} color="#FFD700" />
            <View style={styles.contactMethodInfo}>
              <Text style={styles.contactMethodTitle}>{method.title}</Text>
              <Text style={styles.contactMethodDescription}>{method.description}</Text>
            </View>
            <AntDesign name="right" size={16} color="#666666" />
          </TouchableOpacity>
        ))}
      </View>

    </View>
  );

  const renderHelpCenterContent = () => (
    <View style={styles.helpCenterContent}>
      <Text style={styles.sectionTitle}>How can we help you?</Text>
      
      {helpCategories.map((category, index) => (
        <View key={index}>
          <TouchableOpacity
            style={styles.helpCategory}
            onPress={() => toggleHelpCategory(category.title)}
          >
            <View style={[styles.helpIcon, { backgroundColor: category.color }]}>
              <AntDesign name={category.icon as any} size={24} color="#FFFFFF" />
            </View>
            <View style={styles.helpInfo}>
              <Text style={styles.helpTitle}>{category.title}</Text>
              <Text style={styles.helpDescription}>{category.description}</Text>
            </View>
            <AntDesign 
              name={expandedHelpCategory === category.title ? "up" : "down"} 
              size={16} 
              color="#FFD700" 
            />
          </TouchableOpacity>
          
          {expandedHelpCategory === category.title && (
            <View style={styles.helpItemsContainer}>
              {category.items.map((item, itemIndex) => (
                <Text key={itemIndex} style={styles.helpItemText}>
                  {item}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      <View style={styles.emergencyContact}>
        <Text style={styles.emergencyTitle}>Need Immediate Help?</Text>
        <Text style={styles.emergencyDescription}>
          For urgent issues, call our 24/7 support line
        </Text>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={() => Alert.alert('Emergency', 'Calling emergency support...')}
        >
          <AntDesign name="phone" size={20} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>Call Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Support</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tab, activeTab === tab && styles.activeTab]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {activeTab === 'FAQ' && renderFAQContent()}
          {activeTab === 'Contact' && renderContactContent()}
          {activeTab === 'Help Center' && renderHelpCenterContent()}
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
  tabContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FFD700',
  },
  tabText: {
    color: '#CCCCCC',
    fontSize: 14,
    fontWeight: '500',
  },
  activeTabText: {
    color: '#FFD700',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  // FAQ Styles
  faqContent: {
    paddingHorizontal: 20,
  },
  faqCategory: {
    marginBottom: 25,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginLeft: 10,
  },
  faqItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestionText: {
    fontSize: 14,
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  // Contact Styles
  contactContent: {
    paddingHorizontal: 20,
  },
  contactMethods: {
    marginBottom: 30,
  },
  contactMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  contactMethodInfo: {
    flex: 1,
    marginLeft: 15,
  },
  contactMethodTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  contactMethodDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  contactForm: {
    marginBottom: 20,
  },
  formField: {
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  formInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  messageInput: {
    height: 100,
  },
  priorityButtons: {
    flexDirection: 'row',
  },
  priorityButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    marginRight: 10,
    alignItems: 'center',
  },
  activePriorityButton: {
    backgroundColor: '#FFD700',
  },
  priorityButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  activePriorityButtonText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Help Center Styles
  helpCenterContent: {
    paddingHorizontal: 20,
  },
  helpCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  helpIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  helpInfo: {
    flex: 1,
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  helpDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  helpItemsContainer: {
    backgroundColor: '#0D0D0D',
    padding: 15,
    marginTop: -10,
    marginBottom: 10,
    borderBottomLeftRadius: 8,
    borderBottomRightRadius: 8,
    marginHorizontal: 0,
  },
  helpItemText: {
    fontSize: 13,
    color: '#CCCCCC',
    lineHeight: 22,
    marginBottom: 8,
  },
  emergencyContact: {
    backgroundColor: '#1A1A1A',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  emergencyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
    marginBottom: 15,
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F44336',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emergencyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});

