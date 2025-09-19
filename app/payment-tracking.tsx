
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, commonStyles, buttonStyles } from '../styles/commonStyles';
import { supabase } from './integrations/supabase/client';
import Icon from '../components/Icon';

interface Order {
  id: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  payment_method: string;
  created_at: string;
  order_items: {
    quantity: number;
    unit_price: number;
    products: {
      name: string;
      image: string;
    };
  }[];
}

export default function PaymentTrackingScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'payment' | 'tracking'>('payment');
  const [orders, setOrders] = useState<Order[]>([]);
  const [trackingCode, setTrackingCode] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const fetchOrders = async () => {
    if (!user) return;

    setLoading(true);
    try {
      console.log('Fetching orders for user:', user.id);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            quantity,
            unit_price,
            products (
              name,
              image
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.log('Orders fetch error:', error);
      } else {
        setOrders(data || []);
      }
    } catch (error) {
      console.log('Orders fetch exception:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return colors.warning;
      case 'confirmed': return colors.info;
      case 'preparing': return colors.primary;
      case 'shipped': return colors.secondary;
      case 'delivered': return colors.success;
      case 'cancelled': return colors.error;
      default: return colors.textSecondary;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'confirmed': return 'Confirmée';
      case 'preparing': return 'En préparation';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  const getPaymentMethodText = (method: string) => {
    switch (method) {
      case 'cash_on_delivery': return 'Paiement à la livraison';
      case 'mobile_money': return 'Mobile Money';
      case 'bank_transfer': return 'Virement bancaire';
      default: return method;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-CD').format(price);
  };

  const handleTrackOrder = () => {
    if (!trackingCode.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un code de suivi');
      return;
    }

    // Find order by ID (simplified tracking)
    const order = orders.find(o => o.id.includes(trackingCode.toLowerCase()));
    if (order) {
      Alert.alert(
        'Commande trouvée',
        `Statut: ${getStatusText(order.status)}\nMontant: ${formatPrice(order.total_amount)} FC`,
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert('Commande non trouvée', 'Vérifiez votre code de suivi');
    }
  };

  const renderPaymentMethods = () => (
    <View style={styles.paymentMethods}>
      <Text style={styles.sectionTitle}>Méthodes de paiement acceptées</Text>
      
      <View style={styles.methodCard}>
        <Icon name="cash" size={24} color={colors.success} />
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>Paiement à la livraison</Text>
          <Text style={styles.methodDescription}>
            Payez en espèces lors de la réception de votre commande
          </Text>
        </View>
      </View>

      <View style={styles.methodCard}>
        <Icon name="phone-portrait" size={24} color={colors.primary} />
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>Mobile Money</Text>
          <Text style={styles.methodDescription}>
            Orange Money, Airtel Money, M-Pesa
          </Text>
        </View>
      </View>

      <View style={styles.methodCard}>
        <Icon name="card" size={24} color={colors.info} />
        <View style={styles.methodInfo}>
          <Text style={styles.methodName}>Virement bancaire</Text>
          <Text style={styles.methodDescription}>
            Virement vers notre compte bancaire
          </Text>
        </View>
      </View>
    </View>
  );

  const renderOrderItem = (order: Order) => (
    <View key={order.id} style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>#{order.id.slice(-8).toUpperCase()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
            {getStatusText(order.status)}
          </Text>
        </View>
      </View>

      <Text style={styles.orderDate}>
        {new Date(order.created_at).toLocaleDateString('fr-FR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })}
      </Text>

      <View style={styles.orderItems}>
        {order.order_items?.slice(0, 2).map((item, index) => (
          <Text key={index} style={styles.orderItemText}>
            {item.quantity}x {item.products?.name}
          </Text>
        ))}
        {order.order_items?.length > 2 && (
          <Text style={styles.moreItems}>
            +{order.order_items.length - 2} autres produits
          </Text>
        )}
      </View>

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.paymentMethod}>
            {getPaymentMethodText(order.payment_method)}
          </Text>
          <Text style={styles.orderTotal}>
            {formatPrice(order.total_amount)} FC
          </Text>
        </View>
        <TouchableOpacity style={styles.trackButton}>
          <Text style={styles.trackButtonText}>Suivre</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTrackingSection = () => (
    <View style={styles.trackingSection}>
      <Text style={styles.sectionTitle}>Suivre une commande</Text>
      
      <View style={styles.trackingInput}>
        <TextInput
          style={styles.input}
          value={trackingCode}
          onChangeText={setTrackingCode}
          placeholder="Entrez votre code de suivi"
          placeholderTextColor={colors.textSecondary}
        />
        <TouchableOpacity style={buttonStyles.primary} onPress={handleTrackOrder}>
          <Text style={buttonStyles.primaryText}>Suivre</Text>
        </TouchableOpacity>
      </View>

      {user && orders.length > 0 && (
        <View style={styles.recentOrders}>
          <Text style={styles.subsectionTitle}>Vos commandes récentes</Text>
          {orders.slice(0, 3).map(renderOrderItem)}
        </View>
      )}
    </View>
  );

  if (!user) {
    return (
      <SafeAreaView style={commonStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Icon name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Paiement & Suivi</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.loginPrompt}>
          <Icon name="person" size={48} color={colors.textSecondary} />
          <Text style={styles.loginPromptTitle}>Connexion requise</Text>
          <Text style={styles.loginPromptText}>
            Connectez-vous pour voir vos commandes et effectuer le suivi
          </Text>
          <TouchableOpacity
            style={buttonStyles.primary}
            onPress={() => router.push('/login')}
          >
            <Text style={buttonStyles.primaryText}>Se connecter</Text>
          </TouchableOpacity>
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
        <Text style={styles.title}>Paiement & Suivi</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payment' && styles.activeTab]}
          onPress={() => setActiveTab('payment')}
        >
          <Text style={[styles.tabText, activeTab === 'payment' && styles.activeTabText]}>
            Paiement
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'tracking' && styles.activeTab]}
          onPress={() => setActiveTab('tracking')}
        >
          <Text style={[styles.tabText, activeTab === 'tracking' && styles.activeTabText]}>
            Suivi
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {activeTab === 'payment' ? renderPaymentMethods() : renderTrackingSection()}
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
  tabs: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    margin: 16,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.surface,
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 12,
  },
  paymentMethods: {
    gap: 12,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodInfo: {
    flex: 1,
    marginLeft: 12,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4,
  },
  methodDescription: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  trackingSection: {
    gap: 20,
  },
  trackingInput: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  recentOrders: {
    gap: 12,
  },
  orderCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderHeader: {
    ...commonStyles.spaceBetween,
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  orderItems: {
    marginBottom: 12,
  },
  orderItemText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  moreItems: {
    fontSize: 12,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  orderFooter: {
    ...commonStyles.spaceBetween,
    alignItems: 'center',
  },
  paymentMethod: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  trackButton: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  trackButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  loginPrompt: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  loginPromptTitle: {
    fontSize: 20,
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
    marginBottom: 24,
  },
});
