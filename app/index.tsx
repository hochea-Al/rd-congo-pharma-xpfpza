
import React, { useState, useMemo, useEffect } from 'react';
import { View, Text, ScrollView, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { commonStyles, colors } from '../styles/commonStyles';
import { useCart } from '../hooks/useCart';
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
  categories?: {
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function HomeScreen() {
  const router = useRouter();
  const { addToCart, getTotalItems } = useCart();
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
        .eq('in_stock', true)
        .order('rating', { ascending: false })
        .limit(20);

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

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleProductPress = (productId: string) => {
    console.log('Navigating to product:', productId);
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = (product: Product) => {
    console.log('Adding product to cart:', product.name);
    addToCart({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: product.image,
      category: product.categories?.name || 'Autre',
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

  const renderProduct = ({ item }: { item: Product }) => (
    <ProductCard
      product={{
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: item.categories?.name || 'Autre',
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

  const quickActions = [
    {
      icon: 'sparkles',
      title: 'Assistant IA',
      subtitle: 'Conseils personnalisés',
      onPress: () => router.push('/ai-assistant'),
      featured: true,
    },
    {
      icon: 'storefront',
      title: 'Boutique',
      subtitle: 'Tous nos produits',
      onPress: () => router.push('/shop'),
    },
    {
      icon: 'people',
      title: 'Experts',
      subtitle: 'Consultations',
      onPress: () => router.push('/experts'),
    },
    {
      icon: 'chatbubbles',
      title: 'Témoignages',
      subtitle: 'Avis clients',
      onPress: () => router.push('/testimonials'),
    },
    {
      icon: 'car',
      title: 'Livraison',
      subtitle: 'Zones & tarifs',
      onPress: () => router.push('/delivery'),
    },
  ];

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bienvenue sur</Text>
          <Text style={styles.title}>PhytoRDC</Text>
          <Text style={styles.subtitle}>Médecine traditionnelle & Phytothérapie</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
            <Icon name="person-circle" size={28} color={colors.primary} />
          </TouchableOpacity>
          <CartButton itemCount={getTotalItems()} onPress={handleCartPress} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Rechercher des remèdes naturels..."
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Services</Text>
          <View style={styles.actionsGrid}>
            {quickActions.map((action, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.actionCard,
                  action.featured && styles.featuredActionCard
                ]} 
                onPress={action.onPress}
              >
                <Icon 
                  name={action.icon} 
                  size={24} 
                  color={action.featured ? colors.white : colors.primary} 
                />
                <Text style={[
                  styles.actionTitle,
                  action.featured && styles.featuredActionTitle
                ]}>
                  {action.title}
                </Text>
                <Text style={[
                  styles.actionSubtitle,
                  action.featured && styles.featuredActionSubtitle
                ]}>
                  {action.subtitle}
                </Text>
                {action.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>NOUVEAU</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categoriesContainer}>
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </View>

        {/* Featured Products */}
        <View style={styles.productsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Produits populaires</Text>
            <TouchableOpacity onPress={() => router.push('/shop')}>
              <Text style={styles.seeAllText}>Voir tout</Text>
            </TouchableOpacity>
          </View>
          
          <FlatList
            data={filteredProducts.slice(0, 6)}
            renderItem={renderProduct}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.productsContainer}
            scrollEnabled={false}
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
        </View>

        {/* Bottom Spacing */}
        <View style={{ height: 20 }} />
      </ScrollView>
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
  greeting: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  subtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileButton: {
    padding: 4,
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  quickActions: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
  },
  featuredActionCard: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    ...commonStyles.shadow,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  featuredActionTitle: {
    color: colors.white,
  },
  featuredActionSubtitle: {
    color: colors.white + '80',
  },
  featuredBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  featuredBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
  categoriesContainer: {
    paddingHorizontal: 16,
  },
  productsSection: {
    padding: 16,
  },
  sectionHeader: {
    ...commonStyles.spaceBetween,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  productsContainer: {
    gap: 8,
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
});
