
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function DeliveryScreen() {
  const router = useRouter();

  const deliveryZones = [
    {
      zone: 'Kinshasa Centre',
      areas: ['Gombe', 'Barumbu', 'Kinshasa', 'Lingwala'],
      price: 2000,
      duration: '2-4 heures',
    },
    {
      zone: 'Kinshasa Est',
      areas: ['Kintambo', 'Ngaliema', 'Lemba', 'Limete'],
      price: 3000,
      duration: '4-6 heures',
    },
    {
      zone: 'Kinshasa Ouest',
      areas: ['Bandalungwa', 'Selembao', 'Bumbu', 'Makala'],
      price: 3500,
      duration: '6-8 heures',
    },
    {
      zone: 'Kinshasa Sud',
      areas: ['Kasa-Vubu', 'Kalamu', 'Ngaba', 'Mont-Ngafula'],
      price: 4000,
      duration: '6-10 heures',
    },
    {
      zone: 'Kinshasa Nord',
      areas: ['Gombe Nord', 'Tshangu', 'Maluku', 'Nsele'],
      price: 5000,
      duration: '1-2 jours',
    },
  ];

  const deliverySteps = [
    {
      icon: 'checkmark-circle',
      title: 'Commande confirmée',
      description: 'Votre commande est validée et en préparation',
    },
    {
      icon: 'cube',
      title: 'Préparation',
      description: 'Nos experts préparent soigneusement vos produits',
    },
    {
      icon: 'car',
      title: 'En route',
      description: 'Votre commande est en cours de livraison',
    },
    {
      icon: 'home',
      title: 'Livrée',
      description: 'Votre commande est arrivée à destination',
    },
  ];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD').format(price);
  };

  const renderDeliveryZone = (zone: any, index: number) => (
    <View key={index} style={styles.zoneCard}>
      <View style={styles.zoneHeader}>
        <Text style={styles.zoneName}>{zone.zone}</Text>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{formatPrice(zone.price)} FC</Text>
          <Text style={styles.duration}>{zone.duration}</Text>
        </View>
      </View>
      <View style={styles.areasContainer}>
        {zone.areas.map((area: string, areaIndex: number) => (
          <View key={areaIndex} style={styles.areaTag}>
            <Text style={styles.areaText}>{area}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderDeliveryStep = (step: any, index: number) => (
    <View key={index} style={styles.stepContainer}>
      <View style={styles.stepIcon}>
        <Icon name={step.icon} size={24} color={colors.primary} />
      </View>
      <View style={styles.stepContent}>
        <Text style={styles.stepTitle}>{step.title}</Text>
        <Text style={styles.stepDescription}>{step.description}</Text>
      </View>
      {index < deliverySteps.length - 1 && <View style={styles.stepLine} />}
    </View>
  );

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Livraison</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Introduction */}
        <View style={styles.intro}>
          <Icon name="car" size={48} color={colors.primary} />
          <Text style={styles.introTitle}>Livraison à domicile</Text>
          <Text style={styles.introText}>
            Nous livrons vos remèdes naturels directement chez vous dans toute la ville de Kinshasa.
          </Text>
        </View>

        {/* Delivery Zones */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Zones de livraison</Text>
          <Text style={styles.sectionSubtitle}>
            Tarifs et délais de livraison par zone
          </Text>
          <View style={styles.zonesContainer}>
            {deliveryZones.map(renderDeliveryZone)}
          </View>
        </View>

        {/* Delivery Process */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Processus de livraison</Text>
          <Text style={styles.sectionSubtitle}>
            Suivez votre commande étape par étape
          </Text>
          <View style={styles.stepsContainer}>
            {deliverySteps.map(renderDeliveryStep)}
          </View>
        </View>

        {/* Important Notes */}
        <View style={styles.notesSection}>
          <Text style={styles.notesTitle}>Informations importantes</Text>
          <View style={styles.notesList}>
            <View style={styles.noteItem}>
              <Icon name="time" size={16} color={colors.warning} />
              <Text style={styles.noteText}>
                Les délais peuvent varier selon les conditions de circulation
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="call" size={16} color={colors.primary} />
              <Text style={styles.noteText}>
                Notre livreur vous contactera avant la livraison
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="card" size={16} color={colors.success} />
              <Text style={styles.noteText}>
                Paiement à la livraison accepté (espèces ou mobile money)
              </Text>
            </View>
            <View style={styles.noteItem}>
              <Icon name="shield-checkmark" size={16} color={colors.primary} />
              <Text style={styles.noteText}>
                Tous nos produits sont soigneusement emballés et sécurisés
              </Text>
            </View>
          </View>
        </View>

        {/* Contact */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Besoin d&apos;aide?</Text>
          <Text style={styles.contactText}>
            Contactez notre service client pour toute question sur votre livraison
          </Text>
          <View style={styles.contactButtons}>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="call" size={20} color={colors.primary} />
              <Text style={styles.contactButtonText}>+243 XXX XXX XXX</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.contactButton}>
              <Icon name="logo-whatsapp" size={20} color={colors.success} />
              <Text style={styles.contactButtonText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
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
  intro: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 16,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  introText: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  zonesContainer: {
    gap: 12,
  },
  zoneCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  zoneHeader: {
    ...commonStyles.spaceBetween,
    marginBottom: 12,
  },
  zoneName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.primary,
  },
  duration: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  areasContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  areaTag: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  areaText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '500',
  },
  stepsContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  stepContainer: {
    position: 'relative',
  },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepContent: {
    marginLeft: 48,
    marginTop: -40,
    paddingBottom: 24,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  stepLine: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 24,
    backgroundColor: colors.border,
  },
  notesSection: {
    margin: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
  },
  notesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  notesList: {
    gap: 12,
  },
  noteItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  contactSection: {
    margin: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
});
