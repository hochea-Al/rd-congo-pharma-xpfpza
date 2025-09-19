
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import ProductCard from './ProductCard';
import Icon from './Icon';
import { supabase } from '../app/integrations/supabase/client';
import { useRouter } from 'expo-router';

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

interface Recommendation {
  recommendations: Product[];
  type: string;
  reasoning: string;
  count: number;
}

export default function AIRecommendations() {
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<'behavioral' | 'health_profile' | 'collaborative'>('behavioral');
  const router = useRouter();

  const recommendationTypes = [
    {
      key: 'behavioral' as const,
      label: 'Basé sur vos goûts',
      icon: 'trending-up',
      description: 'Selon votre historique'
    },
    {
      key: 'health_profile' as const,
      label: 'Pour votre santé',
      icon: 'heart',
      description: 'Adapté à votre profil'
    },
    {
      key: 'collaborative' as const,
      label: 'Populaires',
      icon: 'users',
      description: 'Aimés par d\'autres'
    }
  ];

  useEffect(() => {
    fetchRecommendations();
  }, [selectedType]);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Si pas connecté, récupérer les produits populaires
        const { data: products } = await supabase
          .from('products')
          .select('*')
          .eq('in_stock', true)
          .order('rating', { ascending: false })
          .limit(5);

        setRecommendations({
          recommendations: products || [],
          type: 'popular',
          reasoning: 'Produits les plus populaires',
          count: products?.length || 0
        });
        return;
      }

      const response = await supabase.functions.invoke('ai-recommendations', {
        body: {
          userId: user.id,
          type: selectedType,
          limit: 5
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setRecommendations(response.data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      Alert.alert('Erreur', 'Impossible de charger les recommandations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProductPress = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleAddToCart = async (product: Product) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Enregistrer l'action pour améliorer les recommandations futures
        await supabase
          .from('user_behavior_tracking')
          .insert({
            user_id: user.id,
            product_id: product.id,
            action_type: 'add_to_cart',
            session_id: `session_${Date.now()}`,
            metadata: { source: 'ai_recommendations', type: selectedType }
          });
      }
      
      Alert.alert('Succès', `${product.name} ajouté au panier`);
    } catch (error) {
      console.error('Error tracking behavior:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Icon name="sparkles" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Recommandations IA</Text>
        </View>
        <TouchableOpacity onPress={fetchRecommendations} disabled={isLoading}>
          <Icon 
            name="refresh-cw" 
            size={20} 
            color={isLoading ? colors.textSecondary : colors.primary} 
          />
        </TouchableOpacity>
      </View>

      {/* Type Selector */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.typeSelector}
        contentContainerStyle={styles.typeSelectorContent}
      >
        {recommendationTypes.map((type) => (
          <TouchableOpacity
            key={type.key}
            style={[
              styles.typeButton,
              selectedType === type.key && styles.typeButtonActive
            ]}
            onPress={() => setSelectedType(type.key)}
          >
            <Icon 
              name={type.icon} 
              size={16} 
              color={selectedType === type.key ? colors.white : colors.primary} 
            />
            <Text
              style={[
                styles.typeButtonText,
                selectedType === type.key && styles.typeButtonTextActive
              ]}
            >
              {type.label}
            </Text>
            <Text
              style={[
                styles.typeButtonDescription,
                selectedType === type.key && styles.typeButtonDescriptionActive
              ]}
            >
              {type.description}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Content */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Génération des recommandations...</Text>
        </View>
      ) : recommendations ? (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Reasoning */}
          <View style={styles.reasoningContainer}>
            <Icon name="info" size={16} color={colors.primary} />
            <Text style={styles.reasoningText}>{recommendations.reasoning}</Text>
          </View>

          {/* Products */}
          <View style={styles.productsContainer}>
            {recommendations.recommendations.map((product) => (
              <View key={product.id} style={styles.productWrapper}>
                <ProductCard
                  product={product}
                  onPress={() => handleProductPress(product.id)}
                  onAddToCart={() => handleAddToCart(product)}
                />
              </View>
            ))}
          </View>

          {recommendations.recommendations.length === 0 && (
            <View style={styles.emptyContainer}>
              <Icon name="package" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyTitle}>Aucune recommandation</Text>
              <Text style={styles.emptyDescription}>
                Explorez notre catalogue pour obtenir des recommandations personnalisées
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <Icon name="sparkles" size={48} color={colors.textSecondary} />
          <Text style={styles.emptyTitle}>Recommandations IA</Text>
          <Text style={styles.emptyDescription}>
            Appuyez sur actualiser pour obtenir vos recommandations personnalisées
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  typeSelector: {
    backgroundColor: colors.white,
  },
  typeSelectorContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  typeButton: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    minWidth: 100,
  },
  typeButtonActive: {
    backgroundColor: colors.primary,
  },
  typeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginTop: 4,
  },
  typeButtonTextActive: {
    color: colors.white,
  },
  typeButtonDescription: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  typeButtonDescriptionActive: {
    color: colors.white + '80',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loadingText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 12,
  },
  reasoningContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    backgroundColor: colors.primary + '10',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  reasoningText: {
    fontSize: 13,
    color: colors.text,
    marginLeft: 8,
    flex: 1,
  },
  productsContainer: {
    paddingHorizontal: 16,
  },
  productWrapper: {
    marginBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
});
