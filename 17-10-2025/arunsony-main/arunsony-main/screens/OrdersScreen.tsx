import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiServiceAxios } from '../services/api-axios';

interface OrdersScreenProps {
  navigation: any;
}

interface Order {
  id: number;
  orderNumber: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  deliveryStatus: string;
  createdAt: string;
  description: string;
  shippingName?: string;
  shippingPhone?: string;
  shippingAddress?: string;
  shippingCity?: string;
  shippingState?: string;
  shippingPincode?: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
}

export default function OrdersScreen({ navigation }: OrdersScreenProps) {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const statusFilters = ['All', 'PENDING', 'SUCCESS', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'FAILED'];

  useEffect(() => {
    if (user?.userId) {
      fetchOrders();
    }
  }, [user?.userId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Fetching orders for user:', user?.userId);
      
      if (!user?.userId) {
        console.log('❌ No user ID available');
        setOrders([]);
        return;
      }

      const response = await apiServiceAxios.getUserOrders(parseInt(user.userId));
      
      if (response.success && response.data) {
        console.log('✅ Orders received from backend:', response.data);
        
        const ordersData = response.data.data?.orders || [];
        setOrders(ordersData);
        console.log('✅ Orders set:', ordersData.length, 'orders');
      } else {
        console.log('⚠️ No orders data received from backend');
        setOrders([]);
      }
    } catch (error: any) {
      console.error('❌ Error fetching orders:', error);
      Alert.alert('Error', 'Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'DELIVERED':
        return '#4CAF50';
      case 'PENDING':
      case 'CONFIRMED':
        return '#FF9800';
      case 'SHIPPED':
        return '#2196F3';
      case 'FAILED':
        return '#F44336';
      default:
        return '#666666';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
      case 'COMPLETED':
      case 'DELIVERED':
        return 'checkcircle';
      case 'PENDING':
      case 'CONFIRMED':
        return 'clockcircle';
      case 'SHIPPED':
        return 'car';
      case 'FAILED':
        return 'closecircle';
      default:
        return 'questioncircle';
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'SUCCESS':
        return 'Paid';
      case 'COMPLETED':
        return 'Completed';
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return 'Confirmed';
      case 'SHIPPED':
        return 'Shipped';
      case 'DELIVERED':
        return 'Delivered';
      case 'FAILED':
        return 'Failed';
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Unknown date';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown date';
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus === 'All') return true;
    return order.paymentStatus?.toUpperCase() === filterStatus || 
           order.deliveryStatus?.toUpperCase() === filterStatus;
  });

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const renderOrderDetailsModal = () => {
    if (!selectedOrder) return null;

    return (
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Order Details</Text>
            <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
              <AntDesign name="close" size={24} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          <ScrollView 
            style={styles.modalBody} 
            contentContainerStyle={styles.modalBodyContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Order Info */}
            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Order Number</Text>
              <Text style={styles.detailValue}>{selectedOrder.orderNumber}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Order Date</Text>
              <Text style={styles.detailValue}>{formatDate(selectedOrder.createdAt)}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Description</Text>
              <Text style={styles.detailValue}>{selectedOrder.description}</Text>
            </View>

            <View style={styles.detailSection}>
              <Text style={styles.detailLabel}>Total Amount</Text>
              <Text style={[styles.detailValue, { color: '#FFD700', fontSize: 18 }]}>
                ₹{selectedOrder.totalAmount.toLocaleString()}
              </Text>
            </View>

             {/* Payment Status */}
             <View style={styles.sectionDivider}>
               <Text style={styles.sectionTitle}>Payment Status</Text>
               <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.paymentStatus) }]}>
                 <AntDesign name={getStatusIcon(selectedOrder.paymentStatus) as any} size={14} color="#FFFFFF" />
                 <Text style={styles.statusText}>{getStatusText(selectedOrder.paymentStatus)}</Text>
               </View>
             </View>

             {/* Delivery Status */}
             <View style={styles.sectionDivider}>
               <Text style={styles.sectionTitle}>Delivery Status</Text>
               <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.deliveryStatus) }]}>
                 <AntDesign name={getStatusIcon(selectedOrder.deliveryStatus) as any} size={14} color="#FFFFFF" />
                 <Text style={styles.statusText}>{getStatusText(selectedOrder.deliveryStatus)}</Text>
               </View>
             </View>

            {/* Shipping Details */}
            {(selectedOrder.shippingName || selectedOrder.shippingAddress) && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Shipping Details</Text>
                
                {selectedOrder.shippingName && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Recipient Name</Text>
                    <Text style={styles.detailValue}>{selectedOrder.shippingName}</Text>
                  </View>
                )}

                {selectedOrder.shippingPhone && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Phone Number</Text>
                    <Text style={styles.detailValue}>{selectedOrder.shippingPhone}</Text>
                  </View>
                )}

                {selectedOrder.shippingAddress && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Address</Text>
                    <Text style={styles.detailValue}>{selectedOrder.shippingAddress}</Text>
                  </View>
                )}

                {(selectedOrder.shippingCity || selectedOrder.shippingState || selectedOrder.shippingPincode) && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Location</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.shippingCity && selectedOrder.shippingCity}
                      {selectedOrder.shippingCity && selectedOrder.shippingState && ', '}
                      {selectedOrder.shippingState && selectedOrder.shippingState}
                      {selectedOrder.shippingPincode && ` - ${selectedOrder.shippingPincode}`}
                    </Text>
                  </View>
                )}
              </View>
            )}

            {/* Payment Details */}
            {(selectedOrder.razorpayOrderId || selectedOrder.razorpayPaymentId) && (
              <View style={styles.sectionDivider}>
                <Text style={styles.sectionTitle}>Payment Details</Text>
                
                {selectedOrder.razorpayOrderId && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Razorpay Order ID</Text>
                    <Text style={[styles.detailValue, styles.monospace]}>{selectedOrder.razorpayOrderId}</Text>
                  </View>
                )}

                {selectedOrder.razorpayPaymentId && (
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Razorpay Payment ID</Text>
                    <Text style={[styles.detailValue, styles.monospace]}>{selectedOrder.razorpayPaymentId}</Text>
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.closeButton}
              onPress={() => setShowDetailsModal(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView 
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#FFD700']}
              tintColor="#FFD700"
            />
          }
        >
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Orders</Text>
            <TouchableOpacity 
              style={styles.refreshButton}
              onPress={onRefresh}
            >
              <AntDesign name="reload1" size={20} color="#FFD700" />
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Total Orders</Text>
              <Text style={styles.summaryAmount}>{orders.length}</Text>
              <Text style={styles.summaryPeriod}>All time</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>Delivered</Text>
              <Text style={styles.summaryAmount}>
                {orders.filter(o => o.deliveryStatus === 'DELIVERED').length}
              </Text>
              <Text style={styles.summaryPeriod}>Completed</Text>
            </View>
            
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>In Transit</Text>
              <Text style={styles.summaryAmount}>
                {orders.filter(o => o.deliveryStatus === 'SHIPPED').length}
              </Text>
              <Text style={styles.summaryPeriod}>Active</Text>
            </View>
          </View>

          {/* Filter Section */}
          <View style={styles.filterSection}>
            <Text style={styles.filterTitle}>Filter by Status</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
              {statusFilters.map((filter) => (
                <TouchableOpacity
                  key={filter}
                  style={[styles.filterChip, filterStatus === filter && styles.activeFilterChip]}
                  onPress={() => setFilterStatus(filter)}
                >
                  <Text style={[styles.filterText, filterStatus === filter && styles.activeFilterText]}>
                    {filter}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Orders List */}
          <View style={styles.ordersSection}>
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FFD700" />
                <Text style={styles.loadingText}>Loading orders...</Text>
              </View>
            ) : filteredOrders.length === 0 ? (
              <View style={styles.emptyContainer}>
                <AntDesign name="inbox" size={48} color="#666666" />
                <Text style={styles.emptyTitle}>No Orders Found</Text>
                <Text style={styles.emptyDescription}>
                  {filterStatus === 'All' 
                    ? 'You haven\'t placed any orders yet.' 
                    : `No orders with status "${filterStatus}".`}
                </Text>
                <TouchableOpacity 
                  style={styles.refreshButton}
                  onPress={fetchOrders}
                >
                  <AntDesign name="reload1" size={16} color="#FFFFFF" />
                  <Text style={styles.refreshButtonText}>Refresh</Text>
                </TouchableOpacity>
              </View>
            ) : (
              filteredOrders.map(order => (
                <TouchableOpacity
                  key={order.id}
                  style={styles.orderCard}
                  onPress={() => viewOrderDetails(order)}
                >
                  <View style={styles.orderHeader}>
                    <View style={styles.orderIcon}>
                      <AntDesign name="shoppingcart" size={20} color="#FFD700" />
                    </View>
                    <View style={styles.orderInfo}>
                      <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                      <Text style={styles.orderDescription}>{order.description}</Text>
                    </View>
                    <View style={styles.orderAmount}>
                      <Text style={styles.amountText}>₹{order.totalAmount.toLocaleString()}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.deliveryStatus) }]}>
                        <AntDesign name={getStatusIcon(order.deliveryStatus) as any} size={12} color="#FFFFFF" />
                        <Text style={styles.statusText}>{getStatusText(order.deliveryStatus)}</Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

        </ScrollView>
      </View>

      {/* Order Details Modal */}
      {showDetailsModal && renderOrderDetailsModal()}
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
  refreshButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summarySection: {
    flexDirection: 'row',
    paddingHorizontal: 15,
    marginBottom: 20,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#CCCCCC',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 2,
  },
  summaryPeriod: {
    fontSize: 10,
    color: '#666666',
  },
  filterSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
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
  ordersSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
  },
  orderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  orderDescription: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  orderAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  orderDate: {
    fontSize: 12,
    color: '#666666',
  },
  statusContainer: {
    flexDirection: 'row',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 13,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    margin: 16,
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
    marginBottom: 20,
    lineHeight: 20,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#CCCCCC',
    marginTop: 15,
  },
  // Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxHeight: '85%',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalBody: {
    maxHeight: '70%',
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 100,
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  detailSection: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 12,
    color: '#999999',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 12,
  },
  sectionDivider: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 16,
    textTransform: 'uppercase',
  },
  closeButton: {
    backgroundColor: '#FFD700',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

