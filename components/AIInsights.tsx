
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { supabase } from '../app/integrations/supabase/client';

interface AIInsight {
  totalInteractions: number;
  favoriteCategories: Array<{ name: string; count: number }>;
  recommendationAccuracy: number;
  plantIdentifications: number;
  chatSessions: number;
  healthProfileComplete: boolean;
}

export default function AIInsights() {
  const [insights, setInsights] = useState<AIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Récupérer les statistiques de comportement
      const { data: behaviorData } = await supabase
        .from('user_behavior_tracking')
        .select('action_type, metadata, products(categories(name))')
        .eq('user_id', user.id);

      // Récupérer les sessions de chat
      const { data: chatSessions } = await supabase
        .from('ai_chat_sessions')
        .select('id')
        .eq('user_id', user.id);

      // Récupérer les identifications de plantes
      const { data: plantIds } = await supabase
        .from('plant_identifications')
        .select('id')
        .eq('user_id', user.id);

      // Récupérer le profil de santé
      const { data: healthProfile } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Calculer les catégories favorites
      const categoryCount: { [key: string]: number } = {};
      behaviorData?.forEach(item => {
        if (item.products?.categories?.name) {
          const category = item.products.categories.name;
          categoryCount[category] = (categoryCount[category] || 0) + 1;
        }
      });

      const favoriteCategories = Object.entries(categoryCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Calculer la précision des recommandations (simulée)
      const totalRecommendations = behaviorData?.filter(item => 
        item.metadata?.source?.includes('recommendation')
      ).length || 0;
      const acceptedRecommendations = behaviorData?.filter(item => 
        item.metadata?.source?.includes('recommendation') && 
        item.action_type === 'add_to_cart'
      ).length || 0;
      
      const recommendationAccuracy = totalRecommendations > 0 
        ? (acceptedRecommendations / totalRecommendations) * 100 
        : 0;

      const healthProfileComplete = !!(
        healthProfile?.age_range &&
        healthProfile?.health_conditions?.length > 0 &&
        healthProfile?.health_goals?.length > 0
      );

      setInsights({
        totalInteractions: behaviorData?.length || 0,
        favoriteCategories,
        recommendationAccuracy,
        plantIdentifications: plantIds?.length || 0,
        chatSessions: chatSessions?.length || 0,
        healthProfileComplete
      });

    } catch (error) {
      console.error('Error fetching AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text style={styles.loadingText}>Analyse de vos données...</Text>
      </View>
    );
  }

  if (!insights) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="bar-chart" size={48} color={colors.textSecondary} />
        <Text style={styles.emptyTitle}>Pas encore de données</Text>
        <Text style={styles.emptyDescription}>
          Utilisez l'IA pour obtenir des insights personnalisés
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="trending-up" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Insights IA</Text>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Icon name="activity" size={24} color={colors.primary} />
          <Text style={styles.statNumber}>{insights.totalInteractions}</Text>
          <Text style={styles.statLabel}>Interactions</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="message-circle" size={24} color={colors.success} />
          <Text style={styles.statNumber}>{insights.chatSessions}</Text>
          <Text style={styles.statLabel}>Sessions chat</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="camera" size={24} color={colors.warning} />
          <Text style={styles.statNumber}>{insights.plantIdentifications}</Text>
          <Text style={styles.statLabel}>Plantes identifiées</Text>
        </View>

        <View style={styles.statCard}>
          <Icon name="target" size={24} color={colors.error} />
          <Text style={styles.statNumber}>
            {Math.round(insights.recommendationAccuracy)}%
          </Text>
          <Text style={styles.statLabel}>Précision IA</Text>
        </View>
      </View>

      {/* Favorite Categories */}
      {insights.favoriteCategories.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Vos catégories préférées</Text>
          {insights.favoriteCategories.map((category, index) => (
            <View key={category.name} style={styles.categoryItem}>
              <View style={styles.categoryRank}>
                <Text style={styles.categoryRankText}>{index + 1}</Text>
              </View>
              <View style={styles.categoryInfo}>
                <Text style={styles.categoryName}>{category.name}</Text>
                <View style={styles.categoryBar}>
                  <View 
                    style={[
                      styles.categoryBarFill,
                      { 
                        width: `${(category.count / insights.favoriteCategories[0].count) * 100}%`,
                        backgroundColor: index === 0 ? colors.primary : 
                                       index === 1 ? colors.success : colors.warning
                      }
                    ]} 
                  />
                </View>
              </View>
              <Text style={styles.categoryCount}>{category.count}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Health Profile Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Profil de santé</Text>
        <View style={[
          styles.healthProfileCard,
          { backgroundColor: insights.healthProfileComplete ? colors.success + '20' : colors.warning + '20' }
        ]}>
          <Icon 
            name={insights.healthProfileComplete ? "check-circle" : "alert-circle"} 
            size={24} 
            color={insights.healthProfileComplete ? colors.success : colors.warning} 
          />
          <View style={styles.healthProfileInfo}>
            <Text style={styles.healthProfileTitle}>
              {insights.healthProfileComplete ? 'Profil complet' : 'Profil incomplet'}
            </Text>
            <Text style={styles.healthProfileDescription}>
              {insights.healthProfileComplete 
                ? 'Vos recommandations sont optimisées'
                : 'Complétez votre profil pour de meilleurs conseils'
              }
            </Text>
          </View>
          {!insights.healthProfileComplete && (
            <TouchableOpacity style={styles.completeButton}>
              <Text style={styles.completeButtonText}>Compléter</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* AI Tips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Conseils IA</Text>
        <View style={styles.tipCard}>
          <Icon name="lightbulb" size={20} color={colors.primary} />
          <Text style={styles.tipText}>
            {insights.totalInteractions < 10 
              ? "Explorez plus de produits pour améliorer vos recommandations"
              : insights.chatSessions === 0
              ? "Essayez notre assistant IA pour des conseils personnalisés"
              : insights.plantIdentifications === 0
              ? "Utilisez l'identification de plantes pour découvrir de nouveaux remèdes"
              : "Continuez à utiliser nos services IA pour des conseils toujours plus précis !"
            }
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...commonStyles.shadow,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    margin: 16,
    marginTop: 0,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  categoryRank: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  categoryRankText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 4,
  },
  categoryBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  categoryBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  categoryCount: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 12,
  },
  healthProfileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
  },
  healthProfileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  healthProfileTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  healthProfileDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  completeButton: {
    backgroundColor: colors.warning,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  completeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.primary + '10',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
    marginLeft: 12,
  },
});
