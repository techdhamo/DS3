import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Image,
  Dimensions,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

const { width } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

// Categories matching the images
const categories = [
  { id: '1', name: 'Water Bottle', image: 'https://picsum.photos/seed/water/100/100' },
  { id: '2', name: 'Night Lamp', image: 'https://picsum.photos/seed/lamp/100/100' },
  { id: '3', name: 'Self Care', image: 'https://picsum.photos/seed/care/100/100' },
  { id: '4', name: 'Home & Living', image: 'https://picsum.photos/seed/home/100/100' },
  { id: '5', name: 'Kitchen', image: 'https://picsum.photos/seed/kitchen/100/100' },
  { id: '6', name: 'Mobile Acc', image: 'https://picsum.photos/seed/mobile/100/100' },
];

// Products
const products = {
  nightLamp: [
    {
      id: 'lamp-1',
      code: 'LI-001',
      name: 'Star Master Style Starry Sky Projector Lamp',
      price: 180,
      image: 'https://picsum.photos/seed/starlamp/150/150',
      rating: 4.5,
      reviews: 234,
      supplier: 'DeoDap',
    },
    {
      id: 'lamp-2',
      code: 'LI-002',
      name: 'Breathing Tech Light Soft Silicone LED',
      price: 290,
      image: 'https://picsum.photos/seed/breathing/150/150',
      rating: 4.8,
      reviews: 189,
      supplier: 'IndiaMart',
    },
  ],
  selfCare: [
    {
      id: 'care-1',
      name: 'Electric Scalp Massager',
      price: 499,
      originalPrice: 699,
      image: 'https://picsum.photos/seed/massager/150/150',
      rating: 4.6,
      reviews: 156,
      supplier: 'DeoDap',
    },
    {
      id: 'care-2',
      name: 'Manicure Pedicure Set',
      price: 299,
      image: 'https://picsum.photos/seed/manicure/150/150',
      rating: 4.4,
      reviews: 89,
      supplier: 'TradeIndia',
    },
  ],
};

const banners = [
  {
    id: '1',
    title: 'Chic Accessories',
    subtitle: 'Shop Now, Elevate Your Style',
    gradient: ['#8b5cf6', '#a855f7'],
  },
  {
    id: '2',
    title: 'MINI JOY DECOR',
    subtitle: 'Designed to delight',
    cta: 'PRODUCTS START AT ₹49/-',
    gradient: ['#ec4899', '#f43f5e'],
  },
];

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [wishlist, setWishlist] = useState<string[]>([]);

  const toggleWishlist = (id: string) => {
    setWishlist(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity style={styles.categoryItem}>
      <Image source={{ uri: item.image }} style={styles.categoryImage} />
      <Text style={styles.categoryText} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderProduct = (product: any) => (
    <TouchableOpacity
      style={styles.productCard}
      onPress={() => navigation.navigate('ProductDetail', { productId: product.id })}
    >
      <View style={styles.productImageContainer}>
        <Image source={{ uri: product.image }} style={styles.productImage} />
        
        {/* Wishlist Button */}
        <TouchableOpacity
          style={styles.wishlistButton}
          onPress={() => toggleWishlist(product.id)}
        >
          <Icon
            name={wishlist.includes(product.id) ? 'heart' : 'heart-outline'}
            size={16}
            color={wishlist.includes(product.id) ? '#ef4444' : '#6b7280'}
          />
        </TouchableOpacity>

        {/* Cart Button */}
        <TouchableOpacity style={styles.cartButton}>
          <Icon name="cart-plus" size={16} color="#ffffff" />
        </TouchableOpacity>

        {/* Supplier Badge */}
        <View style={styles.supplierBadge}>
          <Text style={styles.supplierText}>{product.supplier}</Text>
        </View>
      </View>

      <View style={styles.productInfo}>
        {product.code && (
          <Text style={styles.productCode}>({product.code})</Text>
        )}
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.originalPrice && (
            <Text style={styles.originalPrice}>₹{product.originalPrice}</Text>
          )}
        </View>

        <View style={styles.ratingContainer}>
          <Icon name="star" size={12} color="#fbbf24" />
          <Text style={styles.ratingText}>{product.rating}</Text>
          <Text style={styles.reviewText}>({product.reviews})</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search for Products"
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>All Categories</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={categories}
          renderItem={renderCategory}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      </View>

      {/* Banners */}
      <ScrollView
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        style={styles.bannersContainer}
      >
        {banners.map((banner) => (
          <View
            key={banner.id}
            style={[
              styles.banner,
              { backgroundColor: banner.gradient[0] },
            ]}
          >
            <Text style={styles.bannerTitle}>{banner.title}</Text>
            <Text style={styles.bannerSubtitle}>{banner.subtitle}</Text>
            {banner.cta && (
              <View style={styles.ctaBadge}>
                <Text style={styles.ctaText}>{banner.cta}</Text>
              </View>
            )}
          </View>
        ))}
      </ScrollView>

      {/* Night Lamp Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Night Lamp</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {products.nightLamp.map(renderProduct)}
        </View>
      </View>

      {/* Self Care Section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Self Care</Text>
          <TouchableOpacity>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.productsGrid}>
          {products.selfCare.map(renderProduct)}
        </View>
      </View>

      {/* Dropshipping Badge */}
      <View style={styles.dropshipBanner}>
        <View style={styles.dropshipIconContainer}>
          <Icon name="truck-fast" size={24} color="#ffffff" />
        </View>
        <View>
          <Text style={styles.dropshipTitle}>Premium Dropshipping</Text>
          <Text style={styles.dropshipSubtitle}>Direct from suppliers to your door</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#374151',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#7c3aed',
    fontWeight: '500',
  },
  categoriesList: {
    paddingRight: 16,
  },
  categoryItem: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryImage: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  categoryText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
    textAlign: 'center',
  },
  bannersContainer: {
    marginHorizontal: 16,
    marginBottom: 20,
  },
  banner: {
    width: width - 32,
    height: 120,
    borderRadius: 16,
    padding: 16,
    marginRight: 16,
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ctaBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  ctaText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  productCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  productImageContainer: {
    position: 'relative',
    width: '100%',
    aspectRatio: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
  },
  wishlistButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartButton: {
    position: 'absolute',
    top: 44,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: '#7c3aed',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  supplierBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(124,58,237,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  supplierText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '600',
  },
  productInfo: {
    padding: 12,
  },
  productCode: {
    fontSize: 11,
    color: '#7c3aed',
    fontWeight: '500',
  },
  productName: {
    fontSize: 13,
    color: '#374151',
    fontWeight: '500',
    marginTop: 4,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#7c3aed',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  ratingText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
  },
  reviewText: {
    fontSize: 11,
    color: '#9ca3af',
    marginLeft: 4,
  },
  dropshipBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    margin: 16,
    padding: 16,
    borderRadius: 16,
    marginBottom: 100,
  },
  dropshipIconContainer: {
    width: 48,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  dropshipTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  dropshipSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
});
