
import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  ActivityIndicator
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { supabase } from '../app/integrations/supabase/client';

interface SymptomAnalysis {
  possibleConditions: Array<{
    condition: string;
    probability: number;
    description: string;
  }>;
  recommendedPlants: Array<{
    name: string;
    scientificName: string;
    properties: string[];
    usage: string;
    dosage: string;
    contraindications: string[];
  }>;
  urgencyLevel: 'low' | 'medium' | 'high';
  recommendations: string[];
  disclaimer: string;
}

export default function SymptomAnalyzer() {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [newSymptom, setNewSymptom] = useState('');
  const [severity, setSeverity] = useState<'mild' | 'moderate' | 'severe'>('mild');
  const [duration, setDuration] = useState('');
  const [analysis, setAnalysis] = useState<SymptomAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const commonSymptoms = [
    'Maux de tête', 'Fièvre', 'Toux', 'Mal de gorge', 'Nausées',
    'Maux d\'estomac', 'Diarrhée', 'Fatigue', 'Douleurs musculaires',
    'Irritation de la peau', 'Insomnie', 'Stress', 'Brûlures'
  ];

  const severityOptions = [
    { key: 'mild' as const, label: 'Léger', color: colors.success, icon: 'happy' },
    { key: 'moderate' as const, label: 'Modéré', color: colors.warning, icon: 'sad' },
    { key: 'severe' as const, label: 'Sévère', color: colors.error, icon: 'skull' }
  ];

  const addSymptom = (symptom: string) => {
    if (symptom.trim() && !symptoms.includes(symptom.trim())) {
      setSymptoms(prev => [...prev, symptom.trim()]);
      setNewSymptom('');
    }
  };

  const removeSymptom = (symptom: string) => {
    setSymptoms(prev => prev.filter(s => s !== symptom));
  };

  const analyzeSymptoms = async () => {
    if (symptoms.length === 0) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un symptôme');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await supabase.functions.invoke('symptom-analyzer', {
        body: {
          symptoms,
          severity,
          duration,
          userId: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setAnalysis(response.data);
    } catch (error) {
      console.error('Error analyzing symptoms:', error);
      Alert.alert('Erreur', 'Impossible d\'analyser les symptômes. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setSymptoms([]);
    setNewSymptom('');
    setSeverity('mild');
    setDuration('');
    setAnalysis(null);
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return colors.error;
      case 'medium': return colors.warning;
      default: return colors.success;
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'alert-circle';
      case 'medium': return 'warning';
      default: return 'checkmark-circle';
    }
  };

  const getUrgencyText = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'Urgence élevée';
      case 'medium': return 'Attention requise';
      default: return 'Situation normale';
    }
  };

  if (analysis) {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={resetAnalysis} style={styles.backButton}>
            <Icon name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Analyse des symptômes</Text>
        </View>

        {/* Urgency Level */}
        <View style={[
          styles.urgencyCard,
          { backgroundColor: getUrgencyColor(analysis.urgencyLevel) + '20' }
        ]}>
          <Icon 
            name={getUrgencyIcon(analysis.urgencyLevel)} 
            size={24} 
            color={getUrgencyColor(analysis.urgencyLevel)} 
          />
          <View style={styles.urgencyInfo}>
            <Text style={[styles.urgencyTitle, { color: getUrgencyColor(analysis.urgencyLevel) }]}>
              {getUrgencyText(analysis.urgencyLevel)}
            </Text>
            <Text style={styles.urgencyDescription}>
              Basé sur vos symptômes: {symptoms.join(', ')}
            </Text>
          </View>
        </View>

        {/* Possible Conditions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conditions possibles</Text>
          {analysis.possibleConditions.map((condition, index) => (
            <View key={index} style={styles.conditionCard}>
              <View style={styles.conditionHeader}>
                <Text style={styles.conditionName}>{condition.condition}</Text>
                <View style={styles.probabilityBadge}>
                  <Text style={styles.probabilityText}>
                    {Math.round(condition.probability * 100)}%
                  </Text>
                </View>
              </View>
              <Text style={styles.conditionDescription}>{condition.description}</Text>
              <View style={styles.probabilityBar}>
                <View 
                  style={[
                    styles.probabilityBarFill,
                    { 
                      width: `${condition.probability * 100}%`,
                      backgroundColor: condition.probability > 0.7 ? colors.error :
                                     condition.probability > 0.5 ? colors.warning : colors.success
                    }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>

        {/* Recommended Plants */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Plantes recommandées</Text>
          {analysis.recommendedPlants.map((plant, index) => (
            <View key={index} style={styles.plantCard}>
              <View style={styles.plantHeader}>
                <Text style={styles.plantName}>{plant.name}</Text>
                <Text style={styles.plantScientific}>{plant.scientificName}</Text>
              </View>
              
              <View style={styles.plantProperties}>
                {plant.properties.map((property, propIndex) => (
                  <View key={propIndex} style={styles.propertyTag}>
                    <Text style={styles.propertyText}>{property}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.plantDetail}>
                <Icon name="leaf" size={16} color={colors.success} />
                <Text style={styles.plantDetailText}>{plant.usage}</Text>
              </View>

              <View style={styles.plantDetail}>
                <Icon name="medical" size={16} color={colors.primary} />
                <Text style={styles.plantDetailText}>{plant.dosage}</Text>
              </View>

              {plant.contraindications.length > 0 && (
                <View style={styles.plantDetail}>
                  <Icon name="warning" size={16} color={colors.warning} />
                  <Text style={[styles.plantDetailText, { color: colors.warning }]}>
                    Contre-indications: {plant.contraindications.join(', ')}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommandations</Text>
          {analysis.recommendations.map((recommendation, index) => (
            <View key={index} style={styles.recommendationItem}>
              <Text style={styles.recommendationText}>{recommendation}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Icon name="information-circle" size={20} color={colors.warning} />
          <Text style={styles.disclaimerText}>{analysis.disclaimer}</Text>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="medical" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Analyse de symptômes</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsCard}>
        <Text style={styles.instructionsTitle}>Comment ça marche ?</Text>
        <View style={styles.instructionItem}>
          <Icon name="list" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Listez vos symptômes</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="thermometer" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Indiquez la sévérité</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="analytics" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Recevez une analyse IA</Text>
        </View>
      </View>

      {/* Symptoms Input */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Vos symptômes</Text>
        
        {/* Add Custom Symptom */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={newSymptom}
            onChangeText={setNewSymptom}
            placeholder="Décrivez un symptôme..."
            placeholderTextColor={colors.textSecondary}
          />
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => addSymptom(newSymptom)}
          >
            <Icon name="add" size={20} color={colors.white} />
          </TouchableOpacity>
        </View>

        {/* Common Symptoms */}
        <Text style={styles.subsectionTitle}>Symptômes courants</Text>
        <View style={styles.symptomsGrid}>
          {commonSymptoms.map((symptom) => (
            <TouchableOpacity
              key={symptom}
              style={[
                styles.symptomChip,
                symptoms.includes(symptom) && styles.symptomChipSelected
              ]}
              onPress={() => 
                symptoms.includes(symptom) 
                  ? removeSymptom(symptom)
                  : addSymptom(symptom)
              }
            >
              <Text
                style={[
                  styles.symptomChipText,
                  symptoms.includes(symptom) && styles.symptomChipTextSelected
                ]}
              >
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Selected Symptoms */}
        {symptoms.length > 0 && (
          <View style={styles.selectedSymptoms}>
            <Text style={styles.subsectionTitle}>Symptômes sélectionnés</Text>
            {symptoms.map((symptom) => (
              <View key={symptom} style={styles.selectedSymptomItem}>
                <Text style={styles.selectedSymptomText}>{symptom}</Text>
                <TouchableOpacity onPress={() => removeSymptom(symptom)}>
                  <Icon name="close" size={16} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </View>

      {/* Severity */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sévérité des symptômes</Text>
        <View style={styles.severityOptions}>
          {severityOptions.map((option) => (
            <TouchableOpacity
              key={option.key}
              style={[
                styles.severityOption,
                severity === option.key && styles.severityOptionSelected,
                { borderColor: option.color }
              ]}
              onPress={() => setSeverity(option.key)}
            >
              <Icon 
                name={option.icon} 
                size={24} 
                color={severity === option.key ? colors.white : option.color} 
              />
              <Text
                style={[
                  styles.severityOptionText,
                  severity === option.key && styles.severityOptionTextSelected
                ]}
              >
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Duration */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Durée des symptômes</Text>
        <TextInput
          style={styles.textInput}
          value={duration}
          onChangeText={setDuration}
          placeholder="Ex: Depuis 2 jours, Ce matin, Une semaine..."
          placeholderTextColor={colors.textSecondary}
        />
      </View>

      {/* Analyze Button */}
      <TouchableOpacity
        style={[
          styles.analyzeButton,
          (symptoms.length === 0 || isLoading) && styles.analyzeButtonDisabled
        ]}
        onPress={analyzeSymptoms}
        disabled={symptoms.length === 0 || isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color={colors.white} />
        ) : (
          <Icon name="analytics" size={20} color={colors.white} />
        )}
        <Text style={styles.analyzeButtonText}>
          {isLoading ? 'Analyse en cours...' : 'Analyser les symptômes'}
        </Text>
      </TouchableOpacity>

      {/* Warning */}
      <View style={styles.warningCard}>
        <Icon name="alert-triangle" size={20} color={colors.warning} />
        <Text style={styles.warningText}>
          Cette analyse est à titre informatif uniquement. En cas de symptômes graves 
          ou persistants, consultez immédiatement un professionnel de santé.
        </Text>
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
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  instructionsCard: {
    margin: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 8,
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
  subsectionTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    marginBottom: 8,
    marginTop: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  symptomChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  symptomChipText: {
    fontSize: 12,
    color: colors.text,
  },
  symptomChipTextSelected: {
    color: colors.white,
  },
  selectedSymptoms: {
    marginTop: 16,
  },
  selectedSymptomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary + '20',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedSymptomText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '500',
  },
  severityOptions: {
    flexDirection: 'row',
    gap: 12,
  },
  severityOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    backgroundColor: colors.white,
  },
  severityOptionSelected: {
    backgroundColor: colors.primary,
  },
  severityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
    marginTop: 8,
  },
  severityOptionTextSelected: {
    color: colors.white,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  analyzeButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  analyzeButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warning + '20',
    margin: 16,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  warningText: {
    flex: 1,
    fontSize: 12,
    color: colors.text,
    lineHeight: 16,
    marginLeft: 12,
  },
  urgencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 16,
    borderRadius: 12,
  },
  urgencyInfo: {
    flex: 1,
    marginLeft: 12,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  urgencyDescription: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  conditionCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  conditionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  conditionName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  probabilityBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  probabilityText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.white,
  },
  conditionDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  probabilityBar: {
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  probabilityBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  plantCard: {
    backgroundColor: colors.white,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  plantHeader: {
    marginBottom: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  plantScientific: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  plantProperties: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  propertyTag: {
    backgroundColor: colors.success + '20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 4,
  },
  propertyText: {
    fontSize: 10,
    color: colors.success,
    fontWeight: '500',
  },
  plantDetail: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  plantDetailText: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
    marginLeft: 8,
  },
  recommendationItem: {
    backgroundColor: colors.white,
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 20,
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
