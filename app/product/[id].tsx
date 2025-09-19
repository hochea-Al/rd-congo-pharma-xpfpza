
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles, buttonStyles } from '../../styles/commonStyles';
import { useCart } from '../../hooks/useCart';
import Icon from '../../components/Icon';
import { supabase } from '../integrations/supabase/client';

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

export default function ProductDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchProduct();
    }
  }, [id]);

  const fetchProduct = async () => {
    try {
      console.log('Fetching product:', id);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          categories (
            name
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.log('Product fetch error:', error);
        Alert.alert('Erreur', 'Produit non trouvé');
        router.back();
        return;
      }

      setProduct(data);
    } catch (error) {
      console.log('Product fetch exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD').format(price);
  };

  const handleAddToCart = () => {
    if (!product) return;

    console.log('Adding product to cart:', product.name, 'quantity:', quantity);
    
    for (let i = 0; i < quantity; i++) {
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
    }

    Alert.alert(
      'Ajouté au panier!',
      `${quantity}x ${product.name} ajouté(s) au panier`,
      [
        { text: 'Continuer', style: 'cancel' },
        { text: 'Voir le panier', onPress: () => router.push('/cart') }
      ]
    );
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Icon
        key={index}
        name="star"
        size={16}
        color={index < rating ? colors.warning : colors.border}
      />
    ));
  };

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement du produit...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.errorContainer}>
          <Icon name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.errorText}>Produit non trouvé</Text>
          <TouchableOpacity style={buttonStyles.primary} onPress={() => router.back()}>
            <Text style={buttonStyles.primaryText}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {product.name}
        </Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Icon name="heart-outline" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Product Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.image }} style={styles.productImage} />
          {!product.in_stock && (
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockText}>Rupture de stock</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.productInfo}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{product.categories?.name}</Text>
          </View>
          
          <Text style={styles.productName}>{product.name}</Text>
          
          <View style={styles.ratingContainer}>
            <View style={styles.stars}>
              {renderStars(Math.floor(product.rating))}
            </View>
            <Text style={styles.ratingText}>
              {product.rating.toFixed(1)} ({product.reviews} avis)
            </Text>
          </View>

          <Text style={styles.price}>{formatPrice(product.price)} FC</Text>
          
          <Text style={styles.description}>{product.description}</Text>
        </View>

        {/* Usage Instructions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode d&apos;emploi</Text>
          <View style={styles.usageContainer}>
            <Icon name="information-circle" size={20} color={colors.primary} />
            <Text style={styles.usageText}>{product.usage}</Text>
          </View>
        </View>

        {/* Contraindications */}
        {product.contraindications && product.contraindications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Contre-indications</Text>
            <View style={styles.contraindicationsContainer}>
              <Icon name="warning" size={20} color={colors.warning} />
              <View style={styles.contraindicationsList}>
                {product.contraindications.map((item, index) => (
                  <Text key={index} style={styles.contraindicationItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Quantity Selector */}
        {product.in_stock && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quantité</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity
                style={[styles.quantityButton, quantity <= 1 && styles.quantityButtonDisabled]}
                onPress={decrementQuantity}
                disabled={quantity <= 1}
              >
                <Icon name="remove" size={20} color={quantity <= 1 ? colors.textSecondary : colors.text} />
              </TouchableOpacity>
              <Text style={styles.quantityText}>{quantity}</Text>
              <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
                <Icon name="add" size={20} color={colors.text} />
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalPrice}>
            {formatPrice(product.price * quantity)} FC
          </Text>
        </View>
        <TouchableOpacity
          style={[
            buttonStyles.primary,
            !product.in_stock && buttonStyles.disabled,
            { flex: 1 }
          ]}
          onPress={handleAddToCart}
          disabled={!product.in_stock}
        >
          <Text style={buttonStyles.primaryText}>
            {product.in_stock ? 'Ajouter au panier' : 'Indisponible'}
          </Text>
        </TouchableOpacity>
      </View>
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
  backButton: {
    padding: 4,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  favoriteButton: {
    padding: 4,
  },
  scrollContainer: {
    flexGrow: 1,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
    marginBottom: 24,
  },
  imageContainer: {
    position: 'relative',
    height: 300,
    backgroundColor: colors.surface,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: colors.error,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.surface,
  },
  productInfo: {
    padding: 16,
  },
  categoryBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  productName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  stars: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  section: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  usageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primaryLight,
    padding: 16,
    borderRadius: 12,
  },
  usageText: {
    flex: 1,
    fontSize: 14,
    color: colors.primary,
    lineHeight: 20,
    marginLeft: 12,
  },
  contraindicationsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningLight,
    padding: 16,
    borderRadius: 12,
  },
  contraindicationsList: {
    flex: 1,
    marginLeft: 12,
  },
  contraindicationItem: {
    fontSize: 14,
    color: colors.warning,
    lineHeight: 20,
    marginBottom: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 8,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityButtonDisabled: {
    backgroundColor: colors.surface,
  },
  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginHorizontal: 24,
    minWidth: 30,
    textAlign: 'center',
  },
  bottomActions: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    gap: 16,
  },
  totalContainer: {
    alignItems: 'flex-start',
  },
  totalLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});
