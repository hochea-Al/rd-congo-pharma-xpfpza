
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import { supabase } from './integrations/supabase/client';
import Icon from '../components/Icon';

interface Expert {
  id: string;
  full_name: string;
  specialization: string;
  experience_years: number;
  bio: string;
  avatar_url: string;
  consultation_fee: number;
  is_available: boolean;
  rating: number;
  total_consultations: number;
}

export default function ExpertsScreen() {
  const router = useRouter();
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExperts();
  }, []);

  const fetchExperts = async () => {
    try {
      console.log('Fetching experts...');
      const { data, error } = await supabase
        .from('experts')
        .select('*')
        .eq('is_available', true)
        .order('rating', { ascending: false });

      if (error) {
        console.log('Experts fetch error:', error);
      } else {
        setExperts(data || []);
      }
    } catch (error) {
      console.log('Experts fetch exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConsultation = (expert: Expert) => {
    Alert.alert(
      'Consultation avec ' + expert.full_name,
      `Tarif: ${formatPrice(expert.consultation_fee)} FC\n\nVoulez-vous programmer une consultation?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Programmer', 
          onPress: () => {
            // Here you would implement the consultation booking logic
            Alert.alert('Fonctionnalité à venir', 'La prise de rendez-vous sera bientôt disponible');
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD').format(price);
  };

  const renderExpert = (expert: Expert) => (
    <View key={expert.id} style={styles.expertCard}>
      <View style={styles.expertHeader}>
        <Image source={{ uri: expert.avatar_url }} style={styles.avatar} />
        <View style={styles.expertInfo}>
          <Text style={styles.expertName}>{expert.full_name}</Text>
          <Text style={styles.specialization}>{expert.specialization}</Text>
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Icon name="star" size={16} color={colors.warning} />
              <Text style={styles.statText}>{expert.rating.toFixed(1)}</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="time" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{expert.experience_years} ans</Text>
            </View>
            <View style={styles.stat}>
              <Icon name="people" size={16} color={colors.textSecondary} />
              <Text style={styles.statText}>{expert.total_consultations}</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.bio}>{expert.bio}</Text>

      <View style={styles.expertFooter}>
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Consultation</Text>
          <Text style={styles.price}>{formatPrice(expert.consultation_fee)} FC</Text>
        </View>
        <TouchableOpacity
          style={buttonStyles.primary}
          onPress={() => handleConsultation(expert)}
        >
          <Text style={buttonStyles.primaryText}>Consulter</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des experts...</Text>
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
        <Text style={styles.title}>Nos Experts</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Consultez nos spécialistes</Text>
          <Text style={styles.introText}>
            Nos experts en phytothérapie sont là pour vous conseiller et vous accompagner 
            dans votre parcours de santé naturelle.
          </Text>
        </View>

        {/* Experts List */}
        <View style={styles.expertsContainer}>
          {experts.length > 0 ? (
            experts.map(renderExpert)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="person" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun expert disponible</Text>
              <Text style={styles.emptySubtext}>
                Nos experts reviendront bientôt
              </Text>
            </View>
          )}
        </View>
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
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
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
  intro: {
    padding: 16,
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
  },
  introTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    lineHeight: 24,
  },
  expertsContainer: {
    padding: 16,
    gap: 16,
  },
  expertCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  expertHeader: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  bio: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  expertFooter: {
    ...commonStyles.spaceBetween,
    alignItems: 'center',
  },
  priceContainer: {
    alignItems: 'flex-start',
  },
  priceLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  emptyContainer: {
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
