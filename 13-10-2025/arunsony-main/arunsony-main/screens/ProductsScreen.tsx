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
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { useAuth } from '../components/AuthContext';
import { apiService } from '../services/apiService';
import LoadingSpinner from '../components/LoadingSpinner';

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
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

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
      const productsData = response.data || [];
      console.log('Products with images:', productsData.map(p => ({ id: p.id, name: p.name, imageUrl: p.imageUrl })));
      setProducts(productsData);
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

    // Check if first order requirements are met
    const isFirstOrderComplete = isFirstOrder && cart.length === 4 && getTotalPrice() >= 1000;
    const canCheckout = !isFirstOrder || isFirstOrderComplete;

    if (!canCheckout) {
      if (isFirstOrder && cart.length !== 4) {
        Alert.alert(
          'First Order Requirement',
          `For your first order (CQ Wealth activation), you must purchase exactly 4 products worth ₹1000 or more.\n\nCurrent: ${cart.length} products, ₹${getTotalPrice()}`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }

      if (isFirstOrder && getTotalPrice() < 1000) {
        Alert.alert(
          'First Order Amount',
          `Your first order must be ₹1000 or more.\n\nCurrent total: ₹${getTotalPrice()}\nNeed: ₹${1000 - getTotalPrice()} more`,
          [
            { text: 'OK', style: 'default' }
          ]
        );
        return;
      }
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

    // Helper function to get full image URL
    const getImageUrl = (imageUrl: string | null | undefined) => {
      if (!imageUrl) return null;
      if (imageUrl.startsWith('http')) return imageUrl;
      return `https://asmlmbackend-production.up.railway.app${imageUrl}`;
    };

  return (
      <View style={styles.productCard}>
        {/* Product Image Section */}
        <View style={styles.imageSection}>
          <View style={styles.productImageContainer}>
            {item.imageUrl && !imageErrors.has(item.id) ? (
              <Image
                source={{ uri: getImageUrl(item.imageUrl) }}
                style={styles.productImage}
                resizeMode="cover"
                onError={() => {
                  console.log('Failed to load image:', item.imageUrl);
                  setImageErrors(prev => new Set(prev).add(item.id));
                }}
                onLoad={() => console.log('Image loaded successfully:', item.imageUrl)}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <AntDesign name="gift" size={40} color="#FFD700" />
                <Text style={styles.placeholderText}>
                  {item.imageUrl ? 'Failed to Load' : 'No Image'}
                </Text>
              </View>
            )}
          </View>
          
          {/* Category Badge */}
          {item.category && (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{item.category}</Text>
            </View>
          )}
        </View>
        
        {/* Product Info Section */}
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.name || item.productName || `Product ${item.id}`}
          </Text>
          
          {item.description && (
            <Text style={styles.productDescription} numberOfLines={2}>
              {item.description}
            </Text>
          )}
          
          <View style={styles.priceSection}>
            <Text style={styles.productPrice}>₹{item.price}</Text>
            {item.stockQuantity !== undefined && (
              <Text style={styles.stockText}>
                {item.stockQuantity > 0 ? `${item.stockQuantity} in stock` : 'Out of stock'}
              </Text>
            )}
          </View>
        </View>

        {/* Action Section */}
        <View style={styles.actionSection}>
          {isInCart ? (
            <View style={styles.quantityControls}>
              <TouchableOpacity
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, cartItem.quantity - 1)}
              >
                <AntDesign name="minus" size={14} color="#FFD700" />
              </TouchableOpacity>
              
              <Text style={styles.quantityText}>{cartItem.quantity}</Text>

              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={() => updateQuantity(item.id, cartItem.quantity + 1)}
              >
                <AntDesign name="plus" size={14} color="#FFD700" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.addButton, item.stockQuantity === 0 && styles.addButtonDisabled]}
              onPress={() => item.stockQuantity !== 0 && addToCart(item.id)}
              disabled={item.stockQuantity === 0}
            >
              <AntDesign name="shoppingcart" size={16} color="#000000" />
              <Text style={styles.addButtonText}>
                {item.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Text>
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

    // Check if first order requirements are met
    const isFirstOrderComplete = isFirstOrder && cart.length === 4 && getTotalPrice() >= 1000;
    const canCheckout = !isFirstOrder || isFirstOrderComplete;

    console.log('Rendering cart summary with', cart.length, 'items');
    console.log('First order complete:', isFirstOrderComplete, 'Can checkout:', canCheckout);
    
    return (
      <View style={styles.cartSummary}>
        <View style={styles.cartInfo}>
          <Text style={styles.cartText}>
            {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
          </Text>
          <Text style={styles.totalPrice}>Total: ₹{getTotalPrice()}</Text>
          {isFirstOrder && !isFirstOrderComplete && (
            <Text style={styles.requirementText}>
              {cart.length < 4 
                ? `Need ${4 - cart.length} more products for activation`
                : `Need ₹${1000 - getTotalPrice()} more for activation`
              }
            </Text>
          )}
          {isFirstOrderComplete && (
            <Text style={styles.successText}>
              ✓ Ready for CQ Wealth activation!
            </Text>
          )}
        </View>
                        
        <TouchableOpacity 
          style={[
            styles.checkoutButton,
            !canCheckout && styles.checkoutButtonDisabled,
            isFirstOrderComplete && styles.checkoutButtonHighlighted
          ]}
          onPress={proceedToCheckout}
          disabled={!canCheckout}
        >
          <Text style={[
            styles.checkoutButtonText,
            !canCheckout && styles.checkoutButtonTextDisabled,
            isFirstOrderComplete && styles.checkoutButtonTextHighlighted
          ]}>
            Checkout
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <LoadingSpinner 
          size="large" 
          color="#FFD700" 
          text="Loading products..." 
          animated={true}
        />
      </SafeAreaView>
    );
  }

  return (
     <SafeAreaView style={styles.container}>
       <View style={styles.header}>
         <View style={styles.headerTop}>
           <Text style={styles.title}>Products</Text>
           <TouchableOpacity
             style={styles.viewToggle}
             onPress={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
           >
             <AntDesign 
               name={viewMode === 'list' ? 'appstore1' : 'bars'} 
               size={20} 
               color="#FFD700" 
             />
           </TouchableOpacity>
         </View>
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
         contentContainerStyle={[
           styles.productsList,
           viewMode === 'grid' && styles.productsGrid
         ]}
         numColumns={viewMode === 'grid' ? 2 : 1}
         key={viewMode} // Force re-render when view mode changes
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
   headerTop: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 10,
   },
   title: {
     fontSize: 24,
     fontWeight: 'bold',
     color: '#FFFFFF',
   },
   viewToggle: {
     backgroundColor: '#333333',
     padding: 10,
     borderRadius: 8,
     borderWidth: 1,
     borderColor: '#FFD700',
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
     paddingBottom: 200, // Significantly increased to prevent cart overlap
   },
   productsGrid: {
     paddingHorizontal: 10,
   },
  productCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    marginHorizontal: 5,
    borderWidth: 1,
    borderColor: '#333333',
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flex: 1,
  },
  imageSection: {
    position: 'relative',
    height: 200,
    backgroundColor: '#2A2A2A',
  },
  productImageContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2A2A2A',
  },
  placeholderText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 8,
    fontWeight: '500',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryBadgeText: {
    color: '#000000',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productInfo: {
    padding: 16,
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 6,
    lineHeight: 20,
  },
  productDescription: {
    fontSize: 13,
    color: '#CCCCCC',
    marginBottom: 12,
    lineHeight: 18,
  },
  priceSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  productPrice: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFD700',
  },
  stockText: {
    fontSize: 11,
    color: '#888888',
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  addButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  addButtonDisabled: {
    backgroundColor: '#666666',
    elevation: 0,
    shadowOpacity: 0,
  },
  addButtonText: {
    color: '#000000',
    fontWeight: 'bold',
    marginLeft: 6,
    fontSize: 14,
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    borderRadius: 12,
    padding: 4,
    justifyContent: 'center',
  },
  quantityButton: {
    backgroundColor: '#1A1A1A',
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 24,
    textAlign: 'center',
  },
  cartSummary: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 16,
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
    minHeight: 80,
  },
  cartInfo: {
    flex: 1,
    paddingRight: 12,
  },
  cartText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  totalPrice: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 2,
  },
  checkoutButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    minWidth: 140,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#666666',
    elevation: 0,
    shadowOpacity: 0,
  },
  checkoutButtonHighlighted: {
    backgroundColor: '#00C851', // Green for success
    elevation: 4,
    shadowColor: '#00C851',
    shadowOpacity: 0.3,
    transform: [{ scale: 1.05 }], // Slightly larger when highlighted
  },
  checkoutButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  checkoutButtonTextDisabled: {
    color: '#999999',
  },
  checkoutButtonTextHighlighted: {
    color: '#FFFFFF',
    fontWeight: '900',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  requirementText: {
    color: '#FF6B6B',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  successText: {
    color: '#00C851',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});

export default ProductsScreen;