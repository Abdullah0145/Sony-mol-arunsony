import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiService } from '../services/apiService';

interface Product {
  id: number;
  name: string;
  productName?: string; // Keep for backward compatibility
  price: number;
  description?: string;
  isActive: boolean;
  category?: string;
  stockQuantity?: number;
  imageUrl?: string;
}

interface CartItem {
  productId: number;
  quantity: number;
}

const ProductsScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user, hasPaid } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isFirstOrder, setIsFirstOrder] = useState(true);

  useEffect(() => {
    loadProducts();
    checkUserStatus();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products...');
      const response = await apiService.getProducts();
      console.log('Products response:', response);
      setProducts(response.data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      Alert.alert('Error', `Failed to load products: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  const checkUserStatus = async () => {
    try {
      if (user?.userId) {
        const response = await apiService.getUserPaymentStatus(user.userId);
        setIsFirstOrder(response.data.isFirstOrder);
      }
    } catch (error) {
      console.error('Error checking user status:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    await checkUserStatus();
    setRefreshing(false);
  };

  const addToCart = (productId: number) => {
    console.log('Adding product to cart:', productId);
    console.log('Current cart:', cart);
    console.log('Is first order:', isFirstOrder);
    
    if (isFirstOrder) {
      // For first order, user must buy all 4 products
      if (cart.length >= 4) {
        Alert.alert('First Order', 'You must purchase exactly 4 products for your first order (CQ Wealth activation).');
        return;
      }
      
      const existingItem = cart.find(item => item.productId === productId);
      if (existingItem) {
        Alert.alert('Already Added', 'This product is already in your cart.');
        return;
      }
      
      const newCart = [...cart, { productId, quantity: 1 }];
      console.log('New cart after adding:', newCart);
      setCart(newCart);
    } else {
      // For subsequent orders, normal cart behavior
      const existingItem = cart.find(item => item.productId === productId);
      if (existingItem) {
        setCart(cart.map(item => 
          item.productId === productId 
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ));
      } else {
        setCart([...cart, { productId, quantity: 1 }]);
      }
    }
  };

  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setCart(cart.map(item => 
      item.productId === productId 
        ? { ...item, quantity }
        : item
    ));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const proceedToCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add products to your cart first.');
      return;
    }

    if (isFirstOrder && cart.length !== 4) {
      Alert.alert(
        'First Order Requirement',
        'For your first order (CQ Wealth activation), you must purchase exactly 4 products worth ₹1000 total.',
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    if (isFirstOrder && getTotalPrice() !== 1000) {
      Alert.alert(
        'First Order Amount',
        `Your first order must be exactly ₹1000. Current total: ₹${getTotalPrice()}`,
        [
          { text: 'OK', style: 'default' }
        ]
      );
      return;
    }

    // Navigate to checkout with cart data
    navigation.navigate('Checkout' as never, { 
      cart, 
      totalPrice: getTotalPrice(),
      isFirstOrder 
    } as never);
  };

  const renderProduct = ({ item }: { item: Product }) => {
    const cartItem = cart.find(cartItem => cartItem.productId === item.id);
    const isInCart = !!cartItem;

  return (
      <View style={styles.productCard}>
        <View style={styles.productInfo}>
          <Text style={styles.productName}>
            {item.name || item.productName || `Product ${item.id}`}
              </Text>
          <Text style={styles.productPrice}>₹{item.price}</Text>
          {item.description && (
            <Text style={styles.productDescription}>{item.description}</Text>
          )}
          </View>

        <View style={styles.productActions}>
          {isInCart ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
              >
                <AntDesign name="minus" size={16} color="#FFD700" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>

              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
              >
                <AntDesign name="plus" size={16} color="#FFD700" />
              </TouchableOpacity>
                      </View>
          ) : (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => addToCart(item.id)}
            >
              <AntDesign name="plus" size={16} color="#000000" />
              <Text style={styles.addButtonText}>Add</Text>
            </TouchableOpacity>
                    )}
                </View>
      </View>
    );
  };

  const renderCartSummary = () => {
    console.log('Rendering cart summary, cart length:', cart.length);
    console.log('Cart contents:', cart);
    
    if (cart.length === 0) {
      console.log('Cart is empty, not rendering summary');
      return null;
    }

    console.log('Rendering cart summary with', cart.length, 'items');
    return (
      <View style={styles.cartSummary}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartText}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                    </Text>
          <Text style={styles.totalPrice}>Total: ₹{getTotalPrice()}</Text>
                  </View>
                        
                        <TouchableOpacity 
                          style={[
            styles.checkoutButton,
            isFirstOrder && cart.length !== 4 && styles.checkoutButtonDisabled
          ]}
          onPress={proceedToCheckout}
          disabled={isFirstOrder && cart.length !== 4}
        >
          <Text style={styles.checkoutButtonText}>
            {isFirstOrder ? 'Activate CQ Wealth (₹1000)' : 'Checkout'}
                        </Text>
                      </TouchableOpacity>
                  </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FFD700" />
          <Text style={styles.loadingText}>Loading products...</Text>
                </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Products</Text>
        {isFirstOrder && (
          <View style={styles.firstOrderBanner}>
            <AntDesign name="gift" size={16} color="#FFD700" />
            <Text style={styles.firstOrderText}>
              First Order: Buy 4 products (₹1000) to activate CQ Wealth
            </Text>
              </View>
            )}
          </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FFD700"
          />
        }
      />


      {renderCartSummary()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  firstOrderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  firstOrderText: {
    color: '#FFD700',
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    marginTop: 10,
    fontSize: 16,
  },
  productsList: {
    padding: 20,
    paddingBottom: 100,
  },
  productCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#CCCCCC',
  },
  productActions: {
    marginLeft: 16,
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 4,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    backgroundColor: '#1A1A1A',
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFD700',
    padding: 20,
    borderTopWidth: 2,
    borderTopColor: '#FFD700',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 1000,
  },
  cartInfo: {
    flex: 1,
  },
  cartText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  totalPrice: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#666666',
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ProductsScreen;