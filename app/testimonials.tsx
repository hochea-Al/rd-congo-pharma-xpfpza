
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import { supabase } from './integrations/supabase/client';
import Icon from '../components/Icon';
import SimpleBottomSheet from '../components/BottomSheet';

interface Testimonial {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  products: {
    name: string;
  };
  profiles: {
    full_name: string;
  };
}

export default function TestimonialsScreen() {
  const router = useRouter();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    rating: 5,
    comment: '',
  });
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    fetchTestimonials();
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchTestimonials = async () => {
    try {
      console.log('Fetching testimonials...');
      const { data, error } = await supabase
        .from('testimonials')
        .select(`
          *,
          products (name),
          profiles (full_name)
        `)
        .eq('is_approved', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.log('Testimonials fetch error:', error);
      } else {
        setTestimonials(data || []);
      }
    } catch (error) {
      console.log('Testimonials fetch exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!user) {
      Alert.alert('Connexion requise', 'Veuillez vous connecter pour laisser un témoignage');
      return;
    }

    if (!newTestimonial.comment.trim()) {
      Alert.alert('Erreur', 'Veuillez écrire votre témoignage');
      return;
    }

    try {
      const { error } = await supabase
        .from('testimonials')
        .insert({
          user_id: user.id,
          rating: newTestimonial.rating,
          comment: newTestimonial.comment.trim(),
          product_id: null, // General testimonial
        });

      if (error) {
        console.log('Add testimonial error:', error);
        Alert.alert('Erreur', 'Impossible d\'ajouter le témoignage');
        return;
      }

      Alert.alert(
        'Témoignage envoyé!', 
        'Votre témoignage sera publié après modération. Merci!',
        [{ text: 'OK', onPress: () => {
          setShowAddForm(false);
          setNewTestimonial({ rating: 5, comment: '' });
        }}]
      );

    } catch (error) {
      console.log('Add testimonial exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
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

  const renderRatingSelector = () => {
    return (
      <View style={styles.ratingSelector}>
        <Text style={styles.ratingLabel}>Note:</Text>
        <View style={styles.ratingStars}>
          {Array.from({ length: 5 }, (_, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => setNewTestimonial(prev => ({ ...prev, rating: index + 1 }))}
            >
              <Icon
                name="star"
                size={24}
                color={index < newTestimonial.rating ? colors.warning : colors.border}
              />
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderTestimonial = (testimonial: Testimonial) => (
    <View key={testimonial.id} style={styles.testimonialCard}>
      <View style={styles.testimonialHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.userName}>
            {testimonial.profiles?.full_name || 'Utilisateur anonyme'}
          </Text>
          <View style={styles.rating}>
            {renderStars(testimonial.rating)}
          </View>
        </View>
        <Text style={styles.date}>
          {new Date(testimonial.created_at).toLocaleDateString('fr-FR')}
        </Text>
      </View>

      <Text style={styles.comment}>{testimonial.comment}</Text>

      {testimonial.products && (
        <View style={styles.productTag}>
          <Icon name="leaf" size={14} color={colors.primary} />
          <Text style={styles.productName}>{testimonial.products.name}</Text>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Chargement des témoignages...</Text>
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
        <Text style={styles.title}>Témoignages</Text>
        <TouchableOpacity onPress={() => setShowAddForm(true)} style={styles.addButton}>
          <Icon name="add" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.introTitle}>Ce que disent nos clients</Text>
          <Text style={styles.introText}>
            Découvrez les expériences de nos clients avec nos remèdes naturels traditionnels.
          </Text>
        </View>

        {/* Testimonials List */}
        <View style={styles.testimonialsContainer}>
          {testimonials.length > 0 ? (
            testimonials.map(renderTestimonial)
          ) : (
            <View style={styles.emptyContainer}>
              <Icon name="chatbubble" size={48} color={colors.textSecondary} />
              <Text style={styles.emptyText}>Aucun témoignage pour le moment</Text>
              <Text style={styles.emptySubtext}>
                Soyez le premier à partager votre expérience!
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Add Testimonial Bottom Sheet */}
      <SimpleBottomSheet
        isVisible={showAddForm}
        onClose={() => setShowAddForm(false)}
      >
        <View style={styles.addForm}>
          <Text style={styles.formTitle}>Ajouter un témoignage</Text>
          
          {renderRatingSelector()}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Votre témoignage</Text>
            <TextInput
              style={styles.textArea}
              value={newTestimonial.comment}
              onChangeText={(text) => setNewTestimonial(prev => ({ ...prev, comment: text }))}
              placeholder="Partagez votre expérience avec nos produits..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.formButtons}>
            <TouchableOpacity
              style={[buttonStyles.secondary, { flex: 1 }]}
              onPress={() => setShowAddForm(false)}
            >
              <Text style={buttonStyles.secondaryText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[buttonStyles.primary, { flex: 1 }]}
              onPress={handleAddTestimonial}
            >
              <Text style={buttonStyles.primaryText}>Publier</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SimpleBottomSheet>
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
  addButton: {
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
  testimonialsContainer: {
    padding: 16,
    gap: 16,
  },
  testimonialCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  testimonialHeader: {
    ...commonStyles.spaceBetween,
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  rating: {
    flexDirection: 'row',
    gap: 2,
  },
  date: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  comment: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: 12,
  },
  productTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  productName: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '600',
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
  addForm: {
    padding: 20,
    gap: 20,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  ratingSelector: {
    alignItems: 'center',
    gap: 8,
  },
  ratingLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  ratingStars: {
    flexDirection: 'row',
    gap: 8,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
    minHeight: 100,
  },
  formButtons: {
    flexDirection: 'row',
    gap: 12,
  },
});
