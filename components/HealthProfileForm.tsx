
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { supabase } from '../app/integrations/supabase/client';

interface HealthProfile {
  age_range: string;
  health_conditions: string[];
  allergies: string[];
  current_medications: string[];
  health_goals: string[];
  preferences: {
    organic_only: boolean;
    local_plants: boolean;
    avoid_bitter: boolean;
  };
}

interface HealthProfileFormProps {
  onSave?: (profile: HealthProfile) => void;
}

export default function HealthProfileForm({ onSave }: HealthProfileFormProps) {
  const [profile, setProfile] = useState<HealthProfile>({
    age_range: '',
    health_conditions: [],
    allergies: [],
    current_medications: [],
    health_goals: [],
    preferences: {
      organic_only: false,
      local_plants: true,
      avoid_bitter: false
    }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newAllergy, setNewAllergy] = useState('');
  const [newMedication, setNewMedication] = useState('');

  const ageRanges = [
    '18-25', '26-35', '36-45', '46-55', '56-65', '65+'
  ];

  const commonConditions = [
    'Hypertension', 'Diabète', 'Arthrite', 'Insomnie', 'Stress',
    'Troubles digestifs', 'Migraines', 'Fatigue chronique', 'Allergies',
    'Problèmes de peau', 'Troubles respiratoires', 'Douleurs articulaires'
  ];

  const healthGoals = [
    'Améliorer l\'immunité', 'Perdre du poids', 'Augmenter l\'énergie',
    'Réduire le stress', 'Améliorer le sommeil', 'Soulager les douleurs',
    'Améliorer la digestion', 'Détoxifier l\'organisme', 'Renforcer les os',
    'Améliorer la circulation', 'Équilibrer les hormones', 'Prévention générale'
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: existingProfile } = await supabase
        .from('user_health_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingProfile) {
        setProfile({
          age_range: existingProfile.age_range || '',
          health_conditions: existingProfile.health_conditions || [],
          allergies: existingProfile.allergies || [],
          current_medications: existingProfile.current_medications || [],
          health_goals: existingProfile.health_goals || [],
          preferences: existingProfile.preferences || {
            organic_only: false,
            local_plants: true,
            avoid_bitter: false
          }
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const saveProfile = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Erreur', 'Vous devez être connecté pour sauvegarder votre profil');
        return;
      }

      const { error } = await supabase
        .from('user_health_profiles')
        .upsert({
          user_id: user.id,
          ...profile,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      Alert.alert('Succès', 'Profil de santé sauvegardé avec succès');
      onSave?.(profile);
    } catch (error) {
      console.error('Error saving profile:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le profil');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCondition = (condition: string) => {
    setProfile(prev => ({
      ...prev,
      health_conditions: prev.health_conditions.includes(condition)
        ? prev.health_conditions.filter(c => c !== condition)
        : [...prev.health_conditions, condition]
    }));
  };

  const toggleGoal = (goal: string) => {
    setProfile(prev => ({
      ...prev,
      health_goals: prev.health_goals.includes(goal)
        ? prev.health_goals.filter(g => g !== goal)
        : [...prev.health_goals, goal]
    }));
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setProfile(prev => ({
        ...prev,
        allergies: [...prev.allergies, newAllergy.trim()]
      }));
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    setProfile(prev => ({
      ...prev,
      allergies: prev.allergies.filter(a => a !== allergy)
    }));
  };

  const addMedication = () => {
    if (newMedication.trim()) {
      setProfile(prev => ({
        ...prev,
        current_medications: [...prev.current_medications, newMedication.trim()]
      }));
      setNewMedication('');
    }
  };

  const removeMedication = (medication: string) => {
    setProfile(prev => ({
      ...prev,
      current_medications: prev.current_medications.filter(m => m !== medication)
    }));
  };

  const togglePreference = (key: keyof typeof profile.preferences) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: !prev.preferences[key]
      }
    }));
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="heart" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Profil de santé</Text>
      </View>

      <View style={styles.content}>
        {/* Age Range */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tranche d'âge</Text>
          <View style={styles.optionsGrid}>
            {ageRanges.map((range) => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.optionButton,
                  profile.age_range === range && styles.optionButtonSelected
                ]}
                onPress={() => setProfile(prev => ({ ...prev, age_range: range }))}
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.age_range === range && styles.optionTextSelected
                  ]}
                >
                  {range} ans
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Health Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions de santé</Text>
          <Text style={styles.sectionSubtitle}>Sélectionnez vos préoccupations actuelles</Text>
          <View style={styles.optionsGrid}>
            {commonConditions.map((condition) => (
              <TouchableOpacity
                key={condition}
                style={[
                  styles.optionButton,
                  profile.health_conditions.includes(condition) && styles.optionButtonSelected
                ]}
                onPress={() => toggleCondition(condition)}
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.health_conditions.includes(condition) && styles.optionTextSelected
                  ]}
                >
                  {condition}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Allergies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Allergies connues</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newAllergy}
              onChangeText={setNewAllergy}
              placeholder="Ajouter une allergie..."
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.addButton} onPress={addAllergy}>
              <Icon name="plus" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {profile.allergies.map((allergy, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{allergy}</Text>
                <TouchableOpacity onPress={() => removeAllergy(allergy)}>
                  <Icon name="x" size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Current Medications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Médicaments actuels</Text>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              value={newMedication}
              onChangeText={setNewMedication}
              placeholder="Ajouter un médicament..."
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.addButton} onPress={addMedication}>
              <Icon name="plus" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.tagContainer}>
            {profile.current_medications.map((medication, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{medication}</Text>
                <TouchableOpacity onPress={() => removeMedication(medication)}>
                  <Icon name="x" size={14} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>

        {/* Health Goals */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Objectifs de santé</Text>
          <Text style={styles.sectionSubtitle}>Que souhaitez-vous améliorer ?</Text>
          <View style={styles.optionsGrid}>
            {healthGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.optionButton,
                  profile.health_goals.includes(goal) && styles.optionButtonSelected
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text
                  style={[
                    styles.optionText,
                    profile.health_goals.includes(goal) && styles.optionTextSelected
                  ]}
                >
                  {goal}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Preferences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => togglePreference('organic_only')}
          >
            <View style={styles.preferenceLeft}>
              <Icon name="leaf" size={20} color={colors.success} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Produits biologiques uniquement</Text>
                <Text style={styles.preferenceDescription}>Privilégier les plantes certifiées bio</Text>
              </View>
            </View>
            <View
              style={[
                styles.checkbox,
                profile.preferences.organic_only && styles.checkboxChecked
              ]}
            >
              {profile.preferences.organic_only && (
                <Icon name="check" size={14} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => togglePreference('local_plants')}
          >
            <View style={styles.preferenceLeft}>
              <Icon name="map-pin" size={20} color={colors.primary} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Plantes locales (RDC)</Text>
                <Text style={styles.preferenceDescription}>Favoriser les plantes congolaises</Text>
              </View>
            </View>
            <View
              style={[
                styles.checkbox,
                profile.preferences.local_plants && styles.checkboxChecked
              ]}
            >
              {profile.preferences.local_plants && (
                <Icon name="check" size={14} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.preferenceItem}
            onPress={() => togglePreference('avoid_bitter')}
          >
            <View style={styles.preferenceLeft}>
              <Icon name="frown" size={20} color={colors.warning} />
              <View style={styles.preferenceText}>
                <Text style={styles.preferenceTitle}>Éviter les goûts amers</Text>
                <Text style={styles.preferenceDescription}>Préférer les préparations douces</Text>
              </View>
            </View>
            <View
              style={[
                styles.checkbox,
                profile.preferences.avoid_bitter && styles.checkboxChecked
              ]}
            >
              {profile.preferences.avoid_bitter && (
                <Icon name="check" size={14} color={colors.white} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={saveProfile}
          disabled={isLoading}
        >
          <Icon name="save" size={20} color={colors.white} />
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Sauvegarde...' : 'Sauvegarder le profil'}
          </Text>
        </TouchableOpacity>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Ces informations nous aident à personnaliser vos recommandations. 
            Elles ne remplacent pas un avis médical professionnel.
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
  content: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  optionButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    marginRight: 8,
    marginBottom: 8,
  },
  optionButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  optionText: {
    fontSize: 12,
    color: colors.text,
  },
  optionTextSelected: {
    color: colors.white,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.white,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: colors.primary,
    marginRight: 6,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  preferenceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  preferenceText: {
    marginLeft: 12,
    flex: 1,
  },
  preferenceTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  preferenceDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  saveButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  saveButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  disclaimer: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
