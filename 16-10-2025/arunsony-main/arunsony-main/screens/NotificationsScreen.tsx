import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';

interface NotificationsScreenProps {
  navigation: any;
}

export default function NotificationsScreen({ navigation }: NotificationsScreenProps) {
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Earnings', 'Referrals', 'Products', 'System'];

  const notifications = [
    {
      id: '1',
      type: 'Earnings',
      title: 'New Commission Earned!',
      message: 'You earned ₹250 from Amit Kumar\'s referral',
      time: '2 minutes ago',
      isRead: false,
      icon: 'linechart',
      color: '#4CAF50'
    },
    {
      id: '2',
      type: 'Referrals',
      title: 'New Team Member!',
      message: 'Priya Sharma joined your network',
      time: '1 hour ago',
      isRead: false,
      icon: 'team',
      color: '#2196F3'
    },
    {
      id: '3',
      type: 'Products',
      title: 'Order Shipped',
      message: 'Your CQ Wealth T-Shirt has been shipped',
      time: '3 hours ago',
      isRead: true,
      icon: 'gift',
      color: '#9C27B0'
    },
    {
      id: '4',
      type: 'System',
      title: 'Withdrawal Processed',
      message: '₹1,000 has been transferred to your bank account',
      time: '1 day ago',
      isRead: true,
      icon: 'wallet',
      color: '#FF9800'
    },
    {
      id: '5',
      type: 'Earnings',
      title: 'Level Up Achievement!',
      message: 'Congratulations! You\'ve reached Gold level',
      time: '2 days ago',
      isRead: true,
      icon: 'star',
      color: '#FFD700'
    },
    {
      id: '6',
      type: 'System',
      title: 'Maintenance Notice',
      message: 'Scheduled maintenance on Sunday 2-4 AM',
      time: '3 days ago',
      isRead: true,
      icon: 'tool',
      color: '#607D8B'
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    if (activeFilter === 'All') return true;
    return notification.type === activeFilter;
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (notificationId: string) => {
    Alert.alert('Marked as Read', 'Notification marked as read');
  };

  const markAllAsRead = () => {
    Alert.alert('All Read', 'All notifications marked as read');
  };

  const deleteNotification = (notificationId: string) => {
    Alert.alert('Deleted', 'Notification deleted');
  };

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
          <Text style={styles.headerTitle}>Notifications</Text>
          <TouchableOpacity 
            style={styles.markAllButton}
            onPress={markAllAsRead}
          >
            <Text style={styles.markAllText}>Mark All Read</Text>
          </TouchableOpacity>
        </View>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <View style={styles.unreadBadge}>
            <Text style={styles.unreadText}>{unreadCount} unread notifications</Text>
          </View>
        )}

        {/* Filter Section */}
        <View style={styles.filterSection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
            {filters.map((filter) => (
              <TouchableOpacity
                key={filter}
                style={[styles.filterChip, activeFilter === filter && styles.activeFilterChip]}
                onPress={() => setActiveFilter(filter)}
              >
                <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.notificationsList} showsVerticalScrollIndicator={false}>
          {filteredNotifications.map((notification) => (
            <View key={notification.id} style={[
              styles.notificationCard,
              !notification.isRead && styles.unreadCard
            ]}>
              <View style={styles.notificationHeader}>
                <View style={styles.notificationIcon}>
                  <AntDesign name={notification.icon as any} size={20} color={notification.color} />
                </View>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                <View style={styles.notificationActions}>
                  {!notification.isRead && (
                    <View style={styles.unreadDot} />
                  )}
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => deleteNotification(notification.id)}
                  >
                    <AntDesign name="delete" size={16} color="#666666" />
                  </TouchableOpacity>
                </View>
              </View>
              
              <Text style={styles.notificationMessage}>{notification.message}</Text>
              
              {!notification.isRead && (
                <TouchableOpacity 
                  style={styles.markReadButton}
                  onPress={() => markAsRead(notification.id)}
                >
                  <Text style={styles.markReadText}>Mark as Read</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}

          {/* Empty State */}
          {filteredNotifications.length === 0 && (
            <View style={styles.emptyState}>
              <AntDesign name="bells" size={48} color="#666666" />
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptyDescription}>
                You're all caught up! No {activeFilter.toLowerCase()} notifications at the moment.
              </Text>
            </View>
          )}
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
  markAllButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markAllText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: 'bold',
  },
  unreadBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  unreadText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  filterScroll: {
    flexDirection: 'row',
  },
  filterChip: {
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  activeFilterChip: {
    backgroundColor: '#FFD700',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  activeFilterText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  notificationsList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  notificationCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#FFD700',
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  notificationInfo: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666666',
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFD700',
    marginRight: 8,
  },
  actionButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationMessage: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginBottom: 10,
  },
  markReadButton: {
    alignSelf: 'flex-start',
    backgroundColor: '#2A2A2A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  markReadText: {
    color: '#FFD700',
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 15,
    marginBottom: 5,
  },
  emptyDescription: {
    fontSize: 14,
    color: '#CCCCCC',
    textAlign: 'center',
  },
});

