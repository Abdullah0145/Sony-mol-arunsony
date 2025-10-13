import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TermsScreenProps {
  navigation: any;
}

export default function TermsScreen({ navigation }: TermsScreenProps) {
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
          <Text style={styles.headerTitle}>Terms & Privacy</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          {/* Terms Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Terms & Conditions</Text>
            <Text style={styles.sectionText}>
              By using CQ Wealth services, you agree to the following terms and conditions:
            </Text>
            
            <View style={styles.termsList}>
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>1.</Text>
                <Text style={styles.termText}>
                  Membership is open to individuals aged 18 and above who comply with our eligibility criteria.
                </Text>
              </View>
              
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>2.</Text>
                <Text style={styles.termText}>
                  All earnings are subject to applicable taxes and regulatory compliance.
                </Text>
              </View>
              
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>3.</Text>
                <Text style={styles.termText}>
                  Members must maintain ethical business practices and comply with local wealth building regulations.
                </Text>
              </View>
              
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>4.</Text>
                <Text style={styles.termText}>
                  The company reserves the right to modify terms, benefits, and compensation structure with prior notice.
                </Text>
              </View>
              
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>5.</Text>
                <Text style={styles.termText}>
                  Membership fees are non-refundable except as specified in our refund policy.
                </Text>
              </View>
              
              <View style={styles.termItem}>
                <Text style={styles.termNumber}>6.</Text>
                <Text style={styles.termText}>
                  Members are responsible for maintaining accurate personal and financial information.
                </Text>
              </View>
            </View>
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Privacy Policy</Text>
            <Text style={styles.sectionText}>
              We are committed to protecting your privacy and ensuring the security of your personal information.
            </Text>
            
            <View style={styles.privacyList}>
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Information We Collect</Text>
                <Text style={styles.privacyText}>
                  We collect personal information including name, email, phone number, and payment details to provide our services.
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>How We Use Information</Text>
                <Text style={styles.privacyText}>
                  Your information is used to process memberships, calculate earnings, provide support, and send important updates.
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Information Sharing</Text>
                <Text style={styles.privacyText}>
                  We do not sell your personal information. We may share data with trusted partners for service delivery.
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Data Security</Text>
                <Text style={styles.privacyText}>
                  We implement industry-standard security measures to protect your personal and financial information.
                </Text>
              </View>
              
              <View style={styles.privacyItem}>
                <Text style={styles.privacyTitle}>Your Rights</Text>
                <Text style={styles.privacyText}>
                  You have the right to access, update, or delete your personal information by contacting our support team.
                </Text>
              </View>
            </View>
          </View>

          {/* Contact Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <Text style={styles.contactText}>
              For questions about these terms or privacy policy, please contact us:
            </Text>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Email:</Text>
              <Text style={styles.contactValue}>support@cqwealth.com</Text>
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Phone:</Text>
              <Text style={styles.contactValue}>+91 1800-123-4567</Text>
            </View>
            
            <View style={styles.contactInfo}>
              <Text style={styles.contactLabel}>Address:</Text>
              <Text style={styles.contactValue}>
                CQ Wealth{'\n'}
                123 Business Park, Suite 456{'\n'}
                Mumbai, Maharashtra 400001{'\n'}
                India
              </Text>
            </View>
          </View>

          {/* Last Updated */}
          <View style={styles.lastUpdated}>
            <Text style={styles.lastUpdatedText}>
              Last updated: December 2024
            </Text>
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
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 15,
  },
  sectionText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 20,
  },
  termsList: {
    marginBottom: 10,
  },
  termItem: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  termNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 10,
    minWidth: 20,
  },
  termText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    flex: 1,
  },
  privacyList: {
    marginBottom: 10,
  },
  privacyItem: {
    marginBottom: 20,
  },
  privacyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  privacyText: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  contactText: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 20,
  },
  contactInfo: {
    marginBottom: 15,
  },
  contactLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 5,
  },
  contactValue: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
  lastUpdated: {
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  lastUpdatedText: {
    fontSize: 12,
    color: '#666666',
  },
});
