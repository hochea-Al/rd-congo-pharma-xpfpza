
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import { supabase } from './integrations/supabase/client';
import Icon from '../components/Icon';
import AIInsights from '../components/AIInsights';

interface Profile {
  id: string;
  full_name: string;
  phone: string;
  address: string;
  city: string;
}

export default function ProfileScreen() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    address: '',
    city: 'Kinshasa',
  });

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      console.log('Fetching profile for user:', user.id);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.log('Profile fetch error:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setFormData({
          full_name: data.full_name || '',
          phone: data.phone || '',
          address: data.address || '',
          city: data.city || 'Kinshasa',
        });
      }
    } catch (error) {
      console.log('Profile fetch exception:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData = {
        user_id: user.id,
        full_name: formData.full_name,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (profile) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(profileData)
          .eq('user_id', user.id);
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert(profileData);
      }

      if (result.error) {
        console.log('Profile save error:', result.error);
        Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
        return;
      }

      Alert.alert('Succès', 'Profil mis à jour avec succès');
      setEditing(false);
      fetchProfile();

    } catch (error) {
      console.log('Profile save exception:', error);
      Alert.alert('Erreur', 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnexion',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.auth.signOut();
            if (error) {
              Alert.alert('Erreur', error.message);
            } else {
              router.replace('/');
            }
          }
        }
      ]
    );
  };

  const menuItems = [
    {
      icon: 'sparkles',
      title: 'Assistant IA',
      subtitle: 'Conseils personnalisés et insights',
      onPress: () => router.push('/ai-assistant'),
      featured: true,
    },
    {
      icon: 'bag',
      title: 'Mes commandes',
      subtitle: 'Voir l\'historique de vos achats',
      onPress: () => router.push('/payment-tracking'),
    },
    {
      icon: 'heart',
      title: 'Mes favoris',
      subtitle: 'Produits que vous aimez',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité sera bientôt disponible'),
    },
    {
      icon: 'notifications',
      title: 'Notifications',
      subtitle: 'Gérer vos préférences',
      onPress: () => Alert.alert('À venir', 'Cette fonctionnalité sera bientôt disponible'),
    },
    {
      icon: 'help-circle',
      title: 'Aide & Support',
      subtitle: 'Contactez notre équipe',
      onPress: () => Alert.alert('Support', 'Contactez-nous au +243 XXX XXX XXX'),
    },
  ];

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Profil</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loginPrompt}>
          <Icon name="person-circle" size={80} color={colors.textSecondary} />
          <Text style={styles.loginPromptTitle}>Connexion requise</Text>
          <Text style={styles.loginPromptText}>
            Connectez-vous pour accéder à votre profil et gérer vos informations
          </Text>
          <View style={styles.authButtons}>
            <TouchableOpacity
              style={buttonStyles.primary}
              onPress={() => router.push('/login')}
            >
              <Text style={buttonStyles.primaryText}>Se connecter</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={buttonStyles.secondary}
              onPress={() => router.push('/register')}
            >
              <Text style={buttonStyles.secondaryText}>S&apos;inscrire</Text>
            </TouchableOpacity>
          </View>
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
        <Text style={styles.title}>Profil</Text>
        <TouchableOpacity onPress={() => setEditing(!editing)} style={styles.editButton}>
          <Icon name={editing ? "close" : "create"} size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Icon name="person-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.userName}>
            {profile?.full_name || user?.email || 'Utilisateur'}
          </Text>
          <Text style={styles.userEmail}>{user?.email}</Text>
        </View>

        {/* Profile Form */}
        {editing ? (
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                value={formData.full_name}
                onChangeText={(value) => handleInputChange('full_name', value)}
                placeholder="Votre nom complet"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Téléphone</Text>
              <TextInput
                style={styles.input}
                value={formData.phone}
                onChangeText={(value) => handleInputChange('phone', value)}
                placeholder="+243 XXX XXX XXX"
                placeholderTextColor={colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Adresse</Text>
              <TextInput
                style={styles.input}
                value={formData.address}
                onChangeText={(value) => handleInputChange('address', value)}
                placeholder="Votre adresse complète"
                placeholderTextColor={colors.textSecondary}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ville</Text>
              <TextInput
                style={styles.input}
                value={formData.city}
                onChangeText={(value) => handleInputChange('city', value)}
                placeholder="Kinshasa"
                placeholderTextColor={colors.textSecondary}
              />
            </View>

            <TouchableOpacity
              style={[buttonStyles.primary, loading && buttonStyles.disabled]}
              onPress={handleSaveProfile}
              disabled={loading}
            >
              <Text style={buttonStyles.primaryText}>
                {loading ? 'Sauvegarde...' : 'Sauvegarder'}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <View style={styles.infoItem}>
              <Icon name="person" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {profile?.full_name || 'Non renseigné'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="call" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {profile?.phone || 'Non renseigné'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="location" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {profile?.address || 'Non renseigné'}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Icon name="business" size={20} color={colors.textSecondary} />
              <Text style={styles.infoText}>
                {profile?.city || 'Kinshasa'}
              </Text>
            </View>
          </View>
        )}

        {/* AI Insights */}
        {!editing && user && (
          <View style={styles.aiInsightsContainer}>
            <AIInsights />
          </View>
        )}

        {/* Menu Items */}
        {!editing && (
          <View style={styles.menu}>
            {menuItems.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={[
                  styles.menuItem,
                  item.featured && styles.featuredMenuItem
                ]} 
                onPress={item.onPress}
              >
                <Icon 
                  name={item.icon} 
                  size={24} 
                  color={item.featured ? colors.white : colors.primary} 
                />
                <View style={styles.menuItemContent}>
                  <Text style={[
                    styles.menuItemTitle,
                    item.featured && styles.featuredMenuItemTitle
                  ]}>
                    {item.title}
                  </Text>
                  <Text style={[
                    styles.menuItemSubtitle,
                    item.featured && styles.featuredMenuItemSubtitle
                  ]}>
                    {item.subtitle}
                  </Text>
                </View>
                <Icon 
                  name="chevron-forward" 
                  size={20} 
                  color={item.featured ? colors.white : colors.textSecondary} 
                />
                {item.featured && (
                  <View style={styles.featuredBadge}>
                    <Text style={styles.featuredBadgeText}>IA</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Sign Out */}
        {!editing && (
          <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
            <Icon name="log-out" size={20} color={colors.error} />
            <Text style={styles.signOutText}>Se déconnecter</Text>
          </TouchableOpacity>
        )}
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
  editButton: {
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
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  userName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  form: {
    padding: 16,
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  profileInfo: {
    padding: 16,
    gap: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 16,
    color: colors.text,
  },
  menu: {
    padding: 16,
    gap: 12,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    margin: 16,
    padding: 16,
    backgroundColor: colors.errorLight,
    borderRadius: 12,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.error,
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loginPromptTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  loginPromptText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  authButtons: {
    width: '100%',
    gap: 12,
  },
  aiInsightsContainer: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    ...commonStyles.shadow,
  },
  featuredMenuItem: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  featuredMenuItemTitle: {
    color: colors.white,
  },
  featuredMenuItemSubtitle: {
    color: colors.white + '80',
  },
  featuredBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  featuredBadgeText: {
    fontSize: 8,
    fontWeight: '700',
    color: colors.white,
  },
});
