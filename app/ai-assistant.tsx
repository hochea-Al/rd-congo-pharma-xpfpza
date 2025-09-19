
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, commonStyles } from '../styles/commonStyles';
import { useRouter } from 'expo-router';
import Icon from '../components/Icon';
import AIChatBot from '../components/AIChatBot';
import AIRecommendations from '../components/AIRecommendations';
import PlantIdentifier from '../components/PlantIdentifier';
import HealthProfileForm from '../components/HealthProfileForm';
import SymptomAnalyzer from '../components/SymptomAnalyzer';

type AIFeature = 'chat' | 'recommendations' | 'plant-id' | 'health-profile' | 'symptom-analyzer';

export default function AIAssistantScreen() {
  const [activeFeature, setActiveFeature] = useState<AIFeature | null>(null);
  const router = useRouter();

  const features = [
    {
      key: 'chat' as const,
      title: 'Assistant IA',
      description: 'Posez vos questions sur la phytothérapie',
      icon: 'message-circle',
      color: colors.primary,
      gradient: ['#667eea', '#764ba2']
    },
    {
      key: 'recommendations' as const,
      title: 'Recommandations',
      description: 'Produits personnalisés pour vous',
      icon: 'sparkles',
      color: colors.success,
      gradient: ['#11998e', '#38ef7d']
    },
    {
      key: 'plant-id' as const,
      title: 'Identifier une plante',
      description: 'Reconnaissance par photo',
      icon: 'camera',
      color: colors.warning,
      gradient: ['#f093fb', '#f5576c']
    },
    {
      key: 'health-profile' as const,
      title: 'Profil de santé',
      description: 'Personnalisez vos recommandations',
      icon: 'heart',
      color: colors.error,
      gradient: ['#4facfe', '#00f2fe']
    },
    {
      key: 'symptom-analyzer' as const,
      title: 'Analyse de symptômes',
      description: 'Diagnostic IA personnalisé',
      icon: 'medical',
      color: colors.primary,
      gradient: ['#667eea', '#764ba2']
    }
  ];

  const handleFeaturePress = (feature: AIFeature) => {
    setActiveFeature(feature);
  };

  const handleBack = () => {
    setActiveFeature(null);
  };

  const renderFeatureContent = () => {
    switch (activeFeature) {
      case 'chat':
        return <AIChatBot isVisible={true} onClose={handleBack} />;
      case 'recommendations':
        return (
          <View style={styles.featureContainer}>
            <View style={styles.featureHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.featureTitle}>Recommandations IA</Text>
            </View>
            <AIRecommendations />
          </View>
        );
      case 'plant-id':
        return (
          <View style={styles.featureContainer}>
            <View style={styles.featureHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.featureTitle}>Identifier une plante</Text>
            </View>
            <PlantIdentifier 
              onProductsFound={(productIds) => {
                console.log('Related products found:', productIds);
              }}
            />
          </View>
        );
      case 'health-profile':
        return (
          <View style={styles.featureContainer}>
            <View style={styles.featureHeader}>
              <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Icon name="arrow-left" size={24} color={colors.text} />
              </TouchableOpacity>
              <Text style={styles.featureTitle}>Profil de santé</Text>
            </View>
            <HealthProfileForm 
              onSave={(profile) => {
                console.log('Health profile saved:', profile);
              }}
            />
          </View>
        );
      case 'symptom-analyzer':
        return (
          <View style={styles.featureContainer}>
            <SymptomAnalyzer />
          </View>
        );
      default:
        return null;
    }
  };

  if (activeFeature) {
    return renderFeatureContent();
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Assistant IA</Text>
        <View style={styles.headerRight}>
          <Icon name="brain" size={24} color={colors.primary} />
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeIcon}>
            <Icon name="sparkles" size={32} color={colors.primary} />
          </View>
          <Text style={styles.welcomeTitle}>Intelligence Artificielle</Text>
          <Text style={styles.welcomeSubtitle}>
            Découvrez la puissance de l'IA pour votre santé naturelle
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          {features.map((feature) => (
            <TouchableOpacity
              key={feature.key}
              style={[
                styles.featureCard,
                features.length % 2 !== 0 && feature.key === features[features.length - 1].key && styles.featureCardFull
              ]}
              onPress={() => handleFeaturePress(feature.key)}
              activeOpacity={0.8}
            >
              <View style={[styles.featureIconContainer, { backgroundColor: feature.color + '20' }]}>
                <Icon name={feature.icon} size={28} color={feature.color} />
              </View>
              <Text style={styles.featureCardTitle}>{feature.title}</Text>
              <Text style={styles.featureCardDescription}>{feature.description}</Text>
              <View style={styles.featureCardArrow}>
                <Icon name="arrow-right" size={16} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoCard}>
            <Icon name="shield-check" size={24} color={colors.success} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Sécurisé et fiable</Text>
              <Text style={styles.infoDescription}>
                Notre IA est entraînée sur des données vérifiées de phytothérapie congolaise
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="zap" size={24} color={colors.warning} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Réponses instantanées</Text>
              <Text style={styles.infoDescription}>
                Obtenez des conseils personnalisés en quelques secondes
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Icon name="users" size={24} color={colors.primary} />
            <View style={styles.infoContent}>
              <Text style={styles.infoTitle}>Expertise locale</Text>
              <Text style={styles.infoDescription}>
                Basé sur la médecine traditionnelle et les plantes de RDC
              </Text>
            </View>
          </View>
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="alert-triangle" size={20} color={colors.warning} />
          <Text style={styles.disclaimerText}>
            L'IA fournit des informations éducatives. Consultez toujours un professionnel 
            de santé pour un diagnostic et un traitement appropriés.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  headerRight: {
    padding: 8,
  },
  content: {
    flex: 1,
  },
  welcomeSection: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: colors.white,
    marginBottom: 16,
  },
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    ...commonStyles.shadow,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  featureCardDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
  featureCardArrow: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  featureCardFull: {
    width: '100%',
  },
  featureContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  featureHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 16,
  },
  infoSection: {
    padding: 16,
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 12,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '20',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  disclaimerText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
    marginLeft: 12,
  },
});
