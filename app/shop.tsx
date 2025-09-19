
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useCart } from '../hooks/useCart';
import { useAITracking } from '../hooks/useAITracking';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import CartButton from '../components/CartButton';
import Icon from '../components/Icon';
import { supabase } from './integrations/supabase/client';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category_id: string;
  usage: string;
  contraindications: string[];
  in_stock: boolean;
  rating: number;
  reviews: number;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function ShopScreen() {
  const router = useRouter();
  const { addToCart, getTotalItems } = useCart();
  const { trackSearch, trackAddToCart } = useAITracking();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching products and categories...');
      
      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (categoriesError) {
        console.log('Categories error:', categoriesError);
      } else {
        setCategories(categoriesData || []);
      }

      // Fetch products with category info
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .order('name');

      if (productsError) {
        console.log('Products error:', productsError);
      } else {
        setProducts(productsData || []);
      }

    } catch (error) {
      console.log('Fetch data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(product => product.category_id === selectedCategory);
    }

    // Show only in-stock products
    filtered = filtered.filter(product => product.in_stock);

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleProductPress = (productId: string) => {
    console.log('Navigating to product:', productId);
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding product to cart:', product.name);
    
    // Track add to cart for AI recommendations
    trackAddToCart(product.id, {
      source: 'shop_page',
      category: (product as any).categories?.name,
      price: product.price,
      search_query: searchQuery || null,
      selected_category: selectedCategory || null
    });
    
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: (product as any).categories?.name || 'Autre',
      usage: product.usage,
      contraindications: product.contraindications,
      inStock: product.in_stock,
      rating: product.rating,
      reviews: product.reviews,
    });
  };

  const handleCartPress = () => {
    console.log('Navigating to cart');
    router.push('/cart');
  };

  const handleAIPress = () => {
    router.push('/ai-assistant');
  };

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={{
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: (item as any).categories?.name || 'Autre',
        usage: item.usage,
        contraindications: item.contraindications,
        inStock: item.in_stock,
        rating: item.rating,
        reviews: item.reviews,
      }}
      onPress={() => handleProductPress(item.id)}
      onAddToCart={() => handleAddToCart(item)}
    />
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des produits...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Boutique</Text>
          <Text style={styles.subtitle}>Remèdes naturels traditionnels</Text>
        </View>
        <CartButton itemCount={getTotalItems()} onPress={handleCartPress} />
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={(text) => {
          setSearchQuery(text);
          if (text.length > 2) {
            trackSearch(text, {
              source: 'shop_page',
              selected_category: selectedCategory
            });
          }
        }}
        placeholder="Rechercher des produits..."
      />

      {/* Category Filter */}
      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      {/* Products Grid */}
      <FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.productsContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Icon name="search" size={48} color={colors.textSecondary} />
            <Text style={styles.emptyText}>Aucun produit trouvé</Text>
            <Text style={styles.emptySubtext}>
              Essayez de modifier vos critères de recherche
            </Text>
          </View>
        }
      />

      {/* Floating AI Button */}
      <TouchableOpacity style={styles.floatingAIButton} onPress={handleAIPress}>
        <Icon name="sparkles" size={24} color={colors.white} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    ...commonStyles.spaceBetween,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  productsContainer: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  floatingAIButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...commonStyles.shadow,
    elevation: 8,
  },
});
