import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { apiServiceAxios } from '../services/api-axios';

interface TermsScreenProps {
  navigation: any;
}

interface TermsData {
  id: number;
  type: string;
  title: string;
  content: string;
  version: string;
  updatedAt: string;
}

export default function TermsScreen({ navigation }: TermsScreenProps) {
  const [termsData, setTermsData] = useState<TermsData | null>(null);
  const [privacyData, setPrivacyData] = useState<TermsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTermsAndPrivacy();
  }, []);

  const fetchTermsAndPrivacy = async () => {
    try {
      setIsLoading(true);
      const response = await apiServiceAxios.getAllActiveTerms();
      
      if (response.success && response.data) {
        if (response.data.terms) {
          setTermsData(response.data.terms);
        }
        if (response.data.privacy) {
          setPrivacyData(response.data.privacy);
        }
      }
    } catch (error) {
      console.error('Error fetching terms:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFD700" />
              <Text style={styles.loadingText}>Loading...</Text>
            </View>
          ) : (
            <>
          {/* Terms Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{termsData?.title || 'Terms & Conditions'}</Text>
            <Text style={[styles.sectionText, {whiteSpace: 'pre-line' as any}]}>
              {termsData?.content || 'By using CQ Wealth services, you agree to the following terms and conditions.'}
            </Text>
            {termsData?.version && (
              <Text style={styles.versionText}>Version: {termsData.version}</Text>
            )}
          </View>

          {/* Privacy Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{privacyData?.title || 'Privacy Policy'}</Text>
            <Text style={[styles.sectionText, {whiteSpace: 'pre-line'}]}>
              {privacyData?.content || 'We are committed to protecting your privacy and ensuring the security of your personal information.'}
            </Text>
            {privacyData?.version && (
              <Text style={styles.versionText}>Version: {privacyData.version}</Text>
            )}
          </View>
            </>
          )}

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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 10,
  },
  versionText: {
    fontSize: 12,
    color: '#999999',
    marginTop: 15,
    fontStyle: 'italic',
  },
});
