
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useCart } from '../hooks/useCart';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import Icon from '../components/Icon';

export default function CheckoutScreen() {
  const router = useRouter();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    city: 'Kinshasa',
  });
  const [paymentMethod, setPaymentMethod] = useState('mobile_money');

  const formatPrice = (price: number) => {
    return `${price.toLocaleString()} FC`;
  };

  const handlePlaceOrder = () => {
    console.log('Placing order with info:', customerInfo);
    
    if (!customerInfo.name || !customerInfo.phone || !customerInfo.address) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
      return;
    }

    Alert.alert(
      'Commande confirmée!',
      'Votre commande a été enregistrée. Vous recevrez un appel pour confirmer la livraison.',
      [
        {
          text: 'OK',
          onPress: () => {
            clearCart();
            router.push('/');
          },
        },
      ]
    );
  };

  const deliveryFee = 2000;
  const subtotal = getTotalPrice();
  const total = subtotal + deliveryFee;

  return (
    <SafeAreaView style={commonStyles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Finaliser la commande</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={commonStyles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Résumé de la commande</Text>
          {cartItems.map((item) => (
            <View key={item.product.id} style={styles.orderItem}>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemDetails}>
                {item.quantity} x {formatPrice(item.product.price)}
              </Text>
              <Text style={styles.itemTotal}>
                {formatPrice(item.product.price * item.quantity)}
              </Text>
            </View>
          ))}
          
          <View style={styles.priceBreakdown}>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Sous-total:</Text>
              <Text style={styles.priceValue}>{formatPrice(subtotal)}</Text>
            </View>
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Livraison:</Text>
              <Text style={styles.priceValue}>{formatPrice(deliveryFee)}</Text>
            </View>
            <View style={[styles.priceRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations de livraison</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nom complet *</Text>
            <TextInput
              style={styles.input}
              value={customerInfo.name}
              onChangeText={(text) => setCustomerInfo(prev => ({ ...prev, name: text }))}
              placeholder="Votre nom complet"
              placeholderTextColor={colors.grey}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Numéro de téléphone *</Text>
            <TextInput
              style={styles.input}
              value={customerInfo.phone}
              onChangeText={(text) => setCustomerInfo(prev => ({ ...prev, phone: text }))}
              placeholder="+243 XXX XXX XXX"
              placeholderTextColor={colors.grey}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Adresse de livraison *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={customerInfo.address}
              onChangeText={(text) => setCustomerInfo(prev => ({ ...prev, address: text }))}
              placeholder="Votre adresse complète"
              placeholderTextColor={colors.grey}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Ville</Text>
            <TextInput
              style={styles.input}
              value={customerInfo.city}
              onChangeText={(text) => setCustomerInfo(prev => ({ ...prev, city: text }))}
              placeholder="Ville"
              placeholderTextColor={colors.grey}
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mode de paiement</Text>
          
          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'mobile_money' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('mobile_money')}
          >
            <Icon name="phone-portrait" size={24} color={colors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Mobile Money</Text>
              <Text style={styles.paymentSubtitle}>Airtel Money, Orange Money, M-Pesa</Text>
            </View>
            <Icon 
              name={paymentMethod === 'mobile_money' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.paymentOption, paymentMethod === 'cash' && styles.selectedPayment]}
            onPress={() => setPaymentMethod('cash')}
          >
            <Icon name="cash" size={24} color={colors.primary} />
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentTitle}>Paiement à la livraison</Text>
              <Text style={styles.paymentSubtitle}>Payez en espèces lors de la réception</Text>
            </View>
            <Icon 
              name={paymentMethod === 'cash' ? 'radio-button-on' : 'radio-button-off'} 
              size={20} 
              color={colors.primary} 
            />
          </TouchableOpacity>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.bottomActions}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total à payer:</Text>
          <Text style={styles.totalPrice}>{formatPrice(total)}</Text>
        </View>
        
        <TouchableOpacity style={styles.placeOrderButton} onPress={handlePlaceOrder}>
          <Text style={styles.placeOrderText}>Confirmer la commande</Text>
        </TouchableOpacity>
      </View>
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
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  itemName: {
    flex: 2,
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  itemDetails: {
    flex: 1,
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  itemTotal: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    fontWeight: '600',
    textAlign: 'right',
  },
  priceBreakdown: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '600',
  },
  totalValue: {
    fontSize: 18,
    color: colors.primary,
    fontWeight: '700',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: colors.text,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundAlt,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  selectedPayment: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '10',
  },
  paymentInfo: {
    flex: 1,
    marginLeft: 16,
  },
  paymentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  paymentSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  bottomActions: {
    backgroundColor: colors.backgroundAlt,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.primary,
  },
  placeOrderButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  placeOrderText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.backgroundAlt,
  },
});
