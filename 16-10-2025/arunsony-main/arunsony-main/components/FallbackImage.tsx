import React, { useState } from 'react';
import { Image, ImageProps, View, Text } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';

interface FallbackImageProps extends Omit<ImageProps, 'source'> {
  source: { uri: string };
  fallbackUri?: string;
  productName?: string;
  showPlaceholder?: boolean;
}

const FallbackImage: React.FC<FallbackImageProps> = ({
  source,
  fallbackUri,
  productName,
  showPlaceholder = true,
  style,
  ...props
}) => {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);

  const handleError = () => {
    console.log('❌ Failed to load image:', source.uri);
    if (!imageError) {
      setImageError(true);
    } else if (!fallbackError && fallbackUri) {
      console.log('🔄 Trying fallback image:', fallbackUri);
      setFallbackError(true);
    } else {
      console.log('❌ All images failed to load');
    }
  };

  const handleLoad = () => {
    console.log('✅ Image loaded successfully:', source.uri);
  };

  // If both original and fallback failed, show placeholder
  if (imageError && (fallbackError || !fallbackUri)) {
    if (showPlaceholder) {
      return (
        <View style={[style, { backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }]}>
          <AntDesign name="picture" size={40} color="#ccc" />
          {productName && (
            <Text style={{ color: '#666', fontSize: 12, marginTop: 4, textAlign: 'center' }}>
              {productName}
            </Text>
          )}
        </View>
      );
    }
    return null;
  }

  // Determine which image to show
  const imageUri = imageError ? fallbackUri : source.uri;

  return (
    <Image
      key={`${imageUri}-${imageError}-${fallbackError}`}
      source={{ uri: imageUri || '' }}
      style={style}
      onError={handleError}
      onLoad={handleLoad}
      {...props}
    />
  );
};

export default FallbackImage;
