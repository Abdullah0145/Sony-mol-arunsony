import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, Alert, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import type { ImageSourcePropType } from 'react-native';

interface Product {
  id: number;
  name: string;
  description: string;
  rating: number;
  reviews: number;
  currentPrice: number;
  originalPrice: number;
  discount: string;
  image: ImageSourcePropType;
  category: string;
  inStock: boolean;
  bestSeller?: boolean;
  newArrival?: boolean;
}

interface ProductDetailsScreenProps {
  navigation: any;
  route?: any;
}

export default function ProductDetailsScreen({ navigation, route }: ProductDetailsScreenProps) {
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('Blue');
  const [customText, setCustomText] = useState('');
  const [customMessage, setCustomMessage] = useState('');

  // Get product data from route params
  const product: Product = route?.params?.product || {
    id: 1,
    name: 'Custom Photo T-Shirt',
    description: 'High-quality cotton t-shirt with your custom photo print. Perfect for personalization and gifting.',
    rating: 4.5,
    reviews: 124,
    currentPrice: 250,
    originalPrice: 350,
    discount: '29% OFF',
    image: require('../assets/tshirtone.jpg'),
    category: 'T-Shirts',
    inStock: true,
    bestSeller: true,
  };

  // Define available options based on category
  const getAvailableSizes = () => {
    if (product.category === 'T-Shirts') {
      return ['S', 'M', 'L', 'XL', 'XXL'];
    } else if (product.category === 'Mugs') {
      return ['Small (250ml)', 'Medium (350ml)', 'Large (500ml)'];
    } else if (product.category === 'Keychain') {
      return ['Standard', 'Large', 'Mini'];
    }
    return ['One Size'];
  };

  const getAvailableColors = () => {
    if (product.category === 'T-Shirts') {
      return ['Blue', 'Red', 'Black', 'White', 'Gray'];
    } else if (product.category === 'Mugs') {
      return ['White', 'Black', 'Blue', 'Red', 'Green'];
    } else if (product.category === 'Keychain') {
      return ['Silver', 'Gold', 'Black', 'Colorful'];
    }
    return ['Default'];
  };

  const getFeatures = () => {
    if (product.category === 'T-Shirts') {
      return [
        '100% Premium Cotton',
        'Custom Photo Printing',
        'Multiple Size Options',
        'Fast Delivery',
        '30-Day Return Policy'
      ];
    } else if (product.category === 'Mugs') {
      return [
        'Ceramic Material',
        'Custom Text/Photo Printing',
        'Microwave & Dishwasher Safe',
        'Multiple Size Options',
        'Perfect Gift Item'
      ];
    } else if (product.category === 'Keychain') {
      return [
        'Durable Material',
        'Custom Text/Photo Engraving',
        'Multiple Size Options',
        'Lightweight Design',
        'Perfect for Gifts'
      ];
    }
    return ['High Quality', 'Customizable', 'Fast Delivery'];
  };

  const getSpecifications = () => {
    if (product.category === 'T-Shirts') {
      return {
        'Material': '100% Cotton',
        'Weight': '180 GSM',
        'Fit': 'Regular Fit',
        'Care': 'Machine Washable',
        'Print Type': 'Digital Print'
      };
    } else if (product.category === 'Mugs') {
      return {
        'Material': 'Premium Ceramic',
        'Capacity': '350ml',
        'Finish': 'Glossy',
        'Care': 'Dishwasher Safe',
        'Print Type': 'Heat Transfer'
      };
    } else if (product.category === 'Keychain') {
      return {
        'Material': 'Metal/Plastic',
        'Size': 'Standard',
        'Finish': 'Matte/Glossy',
        'Durability': 'Weather Resistant',
        'Engraving': 'Laser Engraved'
      };
    }
    return {
      'Material': 'Premium Quality',
      'Weight': 'Lightweight',
      'Finish': 'High Quality',
      'Care': 'Easy Maintenance'
    };
  };


  const buyNow = () => {
    let orderDetails = `Order placed for ${quantity} ${product.name}`;
    orderDetails += `\nSize: ${selectedSize}`;
    orderDetails += `\nColor: ${selectedColor}`;
    
    if (customText) {
      orderDetails += `\nCustom Text: "${customText}"`;
    }
    if (customMessage) {
      orderDetails += `\nCustom Message: "${customMessage}"`;
    }
    
    orderDetails += `\nTotal: ₹${product.currentPrice * quantity}`;
    
    Alert.alert('Order Confirmation', orderDetails);
  };

  const increaseQuantity = () => {
    setQuantity(quantity + 1);
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const isCustomizable = product.category === 'Mugs' || product.category === 'Keychain';

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.mainContainer}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <AntDesign name="arrowleft" size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerIcons}>
              <TouchableOpacity style={styles.iconButton}>
                <AntDesign name="hearto" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton}>
                <AntDesign name="hearto" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Product Image */}
          <View style={styles.imageContainer}>
            <Image source={product.image} style={styles.productImage} resizeMode="cover" />
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{product.discount}</Text>
            </View>
            {product.bestSeller && (
              <View style={styles.bestSellerBadge}>
                <Text style={styles.bestSellerText}>Best Seller</Text>
              </View>
            )}
            {product.newArrival && (
              <View style={styles.newArrivalBadge}>
                <Text style={styles.newArrivalText}>New</Text>
              </View>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productDescription}>{product.description}</Text>
            
            <View style={styles.ratingContainer}>
              <AntDesign name="star" size={16} color="#FFD700" />
              <Text style={styles.ratingText}>
                {product.rating} ({product.reviews} reviews)
              </Text>
            </View>

            <View style={styles.priceContainer}>
              <Text style={styles.currentPrice}>₹{product.currentPrice}</Text>
              <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
            </View>
          </View>

          {/* Size Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Size</Text>
            <View style={styles.sizeOptions}>
              {getAvailableSizes().map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeButton,
                    selectedSize === size && styles.selectedSizeButton
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSize === size && styles.selectedSizeText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.sectionTitle}>Select Color</Text>
            <View style={styles.colorOptions}>
              {getAvailableColors().map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[
                    styles.colorButton,
                    selectedColor === color && styles.selectedColorButton
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  <Text style={[
                    styles.colorText,
                    selectedColor === color && styles.selectedColorText
                  ]}>
                    {color}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Customization Options for Mugs and Keychains */}
          {isCustomizable && (
            <View style={styles.customizationSection}>
              <Text style={styles.sectionTitle}>Customization Options</Text>
              
              <View style={styles.customField}>
                <Text style={styles.customLabel}>Custom Text (Max 20 characters)</Text>
                <TextInput
                  style={styles.customInput}
                  value={customText}
                  onChangeText={setCustomText}
                  placeholder="Enter text to display on product"
                  placeholderTextColor="#666666"
                  maxLength={20}
                />
                <Text style={styles.characterCount}>{customText.length}/20</Text>
              </View>

              <View style={styles.customField}>
                <Text style={styles.customLabel}>Custom Message (Max 50 characters)</Text>
                <TextInput
                  style={[styles.customInput, styles.messageInput]}
                  value={customMessage}
                  onChangeText={setCustomMessage}
                  placeholder="Enter a special message"
                  placeholderTextColor="#666666"
                  maxLength={50}
                  multiline
                  numberOfLines={2}
                />
                <Text style={styles.characterCount}>{customMessage.length}/50</Text>
              </View>

              <View style={styles.customizationNote}>
                <AntDesign name="infocirlceo" size={16} color="#FFD700" />
                <Text style={styles.noteText}>
                  Your custom text and message will be printed/engraved on the product. Please review carefully before ordering.
                </Text>
              </View>
            </View>
          )}

          {/* Quantity Selection */}
          <View style={styles.quantitySection}>
            <Text style={styles.sectionTitle}>Quantity</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={decreaseQuantity}
              >
                <AntDesign name="minus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity 
                style={styles.quantityButton}
                onPress={increaseQuantity}
              >
                <AntDesign name="plus" size={20} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Features */}
          <View style={styles.featuresSection}>
            <Text style={styles.sectionTitle}>Features</Text>
            {getFeatures().map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <AntDesign name="checkcircle" size={16} color="#4CAF50" />
                <Text style={styles.featureText}>{feature}</Text>
              </View>
            ))}
          </View>

          {/* Specifications */}
          <View style={styles.specsSection}>
            <Text style={styles.sectionTitle}>Specifications</Text>
            {Object.entries(getSpecifications()).map(([key, value]) => (
              <View key={key} style={styles.specItem}>
                <Text style={styles.specKey}>{key}</Text>
                <Text style={styles.specValue}>{value}</Text>
              </View>
            ))}
          </View>

          {/* Total Price */}
          <View style={styles.totalSection}>
            <Text style={styles.totalLabel}>Total Price:</Text>
            <Text style={styles.totalPrice}>₹{product.currentPrice * quantity}</Text>
          </View>

        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.buyButton}
            onPress={buyNow}
          >
            <Text style={styles.buyButtonText}>Buy Now</Text>
          </TouchableOpacity>
        </View>
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
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerIcons: {
    flexDirection: 'row',
  },
  iconButton: {
    marginLeft: 15,
  },
  imageContainer: {
    alignItems: 'center',
    padding: 20,
    position: 'relative',
  },
  productImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  discountBadge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  discountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bestSellerBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  bestSellerText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  newArrivalBadge: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  newArrivalText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  productInfo: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  productName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  productDescription: {
    fontSize: 16,
    color: '#CCCCCC',
    lineHeight: 24,
    marginBottom: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  ratingText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFD700',
    marginRight: 10,
  },
  originalPrice: {
    fontSize: 18,
    color: '#666666',
    textDecorationLine: 'line-through',
  },
  selectionSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sizeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  sizeButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedSizeButton: {
    backgroundColor: '#FFD700',
  },
  sizeText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedSizeText: {
    color: '#000000',
  },
  colorOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  colorButton: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 10,
    marginBottom: 10,
  },
  selectedColorButton: {
    backgroundColor: '#FFD700',
  },
  colorText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedColorText: {
    color: '#000000',
  },
  customizationSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  customField: {
    marginBottom: 15,
  },
  customLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  customInput: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#FFFFFF',
  },
  messageInput: {
    height: 60,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
    marginTop: 4,
  },
  customizationNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#1A1A1A',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
  },
  noteText: {
    fontSize: 12,
    color: '#CCCCCC',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  quantitySection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: 'flex-start',
  },
  quantityButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featureText: {
    color: '#FFFFFF',
    fontSize: 14,
    marginLeft: 10,
  },
  specsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  specItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  specKey: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  specValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#1A1A1A',
    marginHorizontal: 20,
    borderRadius: 8,
    marginBottom: 20,
  },
  totalLabel: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalPrice: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
    justifyContent: 'center',
  },
  buyButton: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 8,
    flex: 1,
    maxWidth: 200,
  },
  buyButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});