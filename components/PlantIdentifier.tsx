
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image
} from 'react-native';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from './Icon';
import { supabase } from '../app/integrations/supabase/client';
import * as ImagePicker from 'expo-image-picker';

interface PlantIdentification {
  plant: {
    name: string;
    scientificName: string;
    confidence: number;
  };
  medicinalProperties: string[];
  usage: string;
  warnings: string;
  relatedProducts: string[];
  disclaimer: string;
}

interface PlantIdentifierProps {
  onProductsFound?: (productIds: string[]) => void;
}

export default function PlantIdentifier({ onProductsFound }: PlantIdentifierProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [identification, setIdentification] = useState<PlantIdentification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin d\'accéder à vos photos pour identifier les plantes.'
      );
      return false;
    }
    return true;
  };

  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setIdentification(null);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Erreur', 'Impossible de sélectionner l\'image');
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Nous avons besoin d\'accéder à votre caméra pour prendre des photos.'
      );
      return;
    }

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
        setIdentification(null);
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Erreur', 'Impossible de prendre la photo');
    }
  };

  const identifyPlant = async () => {
    if (!selectedImage) {
      Alert.alert('Erreur', 'Veuillez sélectionner une image');
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const response = await supabase.functions.invoke('plant-identification', {
        body: {
          imageUrl: selectedImage,
          userId: user?.id
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      setIdentification(response.data);
      
      if (response.data.relatedProducts && onProductsFound) {
        onProductsFound(response.data.relatedProducts);
      }

      // Enregistrer l'action pour améliorer les recommandations
      if (user) {
        await supabase
          .from('user_behavior_tracking')
          .insert({
            user_id: user.id,
            action_type: 'search',
            session_id: `session_${Date.now()}`,
            metadata: { 
              source: 'plant_identification',
              plant_name: response.data.plant.name,
              confidence: response.data.plant.confidence
            }
          });
      }

    } catch (error) {
      console.error('Error identifying plant:', error);
      Alert.alert('Erreur', 'Impossible d\'identifier la plante. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return colors.success;
    if (confidence >= 0.6) return colors.warning;
    return colors.error;
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'Très fiable';
    if (confidence >= 0.6) return 'Modérément fiable';
    return 'Peu fiable';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="camera" size={24} color={colors.primary} />
        <Text style={styles.headerTitle}>Identifier une plante</Text>
      </View>

      {/* Instructions */}
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Comment ça marche ?</Text>
        <View style={styles.instructionItem}>
          <Icon name="camera" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Prenez une photo claire de la plante</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="search" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Notre IA analyse l'image</Text>
        </View>
        <View style={styles.instructionItem}>
          <Icon name="info" size={16} color={colors.primary} />
          <Text style={styles.instructionText}>Recevez les propriétés médicinales</Text>
        </View>
      </View>

      {/* Image Selection */}
      <View style={styles.imageSection}>
        {selectedImage ? (
          <View style={styles.imageContainer}>
            <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            <TouchableOpacity 
              style={styles.removeImageButton}
              onPress={() => {
                setSelectedImage(null);
                setIdentification(null);
              }}
            >
              <Icon name="x" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Icon name="image" size={48} color={colors.textSecondary} />
            <Text style={styles.placeholderText}>Aucune image sélectionnée</Text>
          </View>
        )}

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.imageButton} onPress={takePhoto}>
            <Icon name="camera" size={20} color={colors.white} />
            <Text style={styles.imageButtonText}>Prendre photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
            <Icon name="image" size={20} color={colors.white} />
            <Text style={styles.imageButtonText}>Galerie</Text>
          </TouchableOpacity>
        </View>

        {selectedImage && (
          <TouchableOpacity 
            style={[styles.identifyButton, isLoading && styles.identifyButtonDisabled]}
            onPress={identifyPlant}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Icon name="search" size={20} color={colors.white} />
            )}
            <Text style={styles.identifyButtonText}>
              {isLoading ? 'Identification...' : 'Identifier la plante'}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Results */}
      {identification && (
        <View style={styles.resultsContainer}>
          <View style={styles.resultHeader}>
            <Icon name="check-circle" size={24} color={colors.success} />
            <Text style={styles.resultTitle}>Plante identifiée</Text>
          </View>

          {/* Plant Info */}
          <View style={styles.plantInfo}>
            <View style={styles.plantNameContainer}>
              <Text style={styles.plantName}>{identification.plant.name}</Text>
              <Text style={styles.scientificName}>{identification.plant.scientificName}</Text>
            </View>
            
            <View style={styles.confidenceContainer}>
              <View 
                style={[
                  styles.confidenceBadge,
                  { backgroundColor: getConfidenceColor(identification.plant.confidence) }
                ]}
              >
                <Text style={styles.confidenceText}>
                  {Math.round(identification.plant.confidence * 100)}%
                </Text>
              </View>
              <Text style={styles.confidenceLabel}>
                {getConfidenceText(identification.plant.confidence)}
              </Text>
            </View>
          </View>

          {/* Properties */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Propriétés médicinales</Text>
            <View style={styles.propertiesContainer}>
              {identification.medicinalProperties.map((property, index) => (
                <View key={index} style={styles.propertyTag}>
                  <Text style={styles.propertyText}>{property}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Usage */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Usage traditionnel</Text>
            <Text style={styles.sectionContent}>{identification.usage}</Text>
          </View>

          {/* Warnings */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⚠️ Précautions</Text>
            <Text style={styles.warningText}>{identification.warnings}</Text>
          </View>

          {/* Disclaimer */}
          <View style={styles.disclaimer}>
            <Text style={styles.disclaimerText}>{identification.disclaimer}</Text>
          </View>
        </View>
      )}
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
  instructionsContainer: {
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
  imageSection: {
    margin: 16,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderContainer: {
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  placeholderText: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  imageButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  imageButtonText: {
    color: colors.white,
    fontWeight: '600',
    marginLeft: 8,
  },
  identifyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.success,
    padding: 16,
    borderRadius: 12,
  },
  identifyButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  identifyButtonText: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  resultsContainer: {
    margin: 16,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginLeft: 8,
  },
  plantInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  plantNameContainer: {
    flex: 1,
  },
  plantName: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
  },
  scientificName: {
    fontSize: 14,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 2,
  },
  confidenceContainer: {
    alignItems: 'center',
  },
  confidenceBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '600',
  },
  confidenceLabel: {
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 4,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  propertiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  propertyTag: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  propertyText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  warningText: {
    fontSize: 14,
    color: colors.error,
    lineHeight: 20,
  },
  disclaimer: {
    backgroundColor: colors.warning + '20',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});
