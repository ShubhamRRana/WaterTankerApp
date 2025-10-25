import React, { useState, useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
};

type Order = {
  id: string;
  bookingId: string;
  userId: string;
  name: string;
  address: string;
  date: string;
  time: string;
  amount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  tankerSize: '10k' | '20k';
  agency: string;
  comments?: string;
  createdAt: string;
};

type Props = {
  onBack: () => void;
  onOpenFleet?: () => void;
  onOpenDrivers?: () => void;
  onOpenReports?: () => void;
  onOpenBankAccount?: () => void;
  onOpenDieselExpenses?: () => void;
  currentUser: User | null;
  onLogout: () => void;
  orders?: Order[];
};

const metricCards = [
  { id: 'totalOrders', title: 'Total Orders', value: '0' },
  { id: 'pending', title: 'Pending', value: '0' },
  { id: 'active', title: 'Active', value: '0' },
  { id: 'revenue', title: 'Revenue', value: '₹0' },
  { id: 'dieselExpenses', title: 'Diesel Expenses', value: '₹0' },
  { id: 'fuelEntries', title: 'Fuel Entries', value: '0' },
] as const;

const quickActions = [
  { id: 'fleet', label: 'Manage Fleet', icon: '🚚' },
  { id: 'drivers', label: 'Drivers', icon: '🧑🏻‍✈️' },
  { id: 'reports', label: 'Reports', icon: '📊' },
  { id: 'bank', label: 'Bank Account', icon: '🏦' },
  { id: 'diesel', label: 'Add Diesel Expenses', icon: '⛽' },
] as const;

const filterOptions = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'in-transit', label: 'In Transit' },
  { id: 'delivered', label: 'Delivered' },
] as const;

const OwnerDashboard = ({ onBack, onOpenFleet, onOpenDrivers, onOpenReports, onOpenBankAccount, onOpenDieselExpenses, currentUser, onLogout, orders = [] }: Props): React.ReactElement => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'pending' | 'confirmed' | 'in-transit' | 'delivered'>('all');

  const handleDieselExpense = () => {
    if (onOpenDieselExpenses) {
      onOpenDieselExpenses();
    }
  };

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') {
      return orders;
    }
    return orders.filter(order => order.status === selectedFilter);
  }, [orders, selectedFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#D97706';
      case 'confirmed': return '#1E3A8A';
      case 'in-transit': return '#059669';
      case 'delivered': return '#059669';
      case 'cancelled': return '#DC2626';
      default: return '#9CA3AF';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}> 
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Owner Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome, {currentUser?.name || 'Admin'}!
          </Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.metricsGrid}>
          {metricCards.map((m) => (
            <View key={m.id} style={styles.metricCard}>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.title}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsList}>
            {quickActions.map((a) => (
              <TouchableOpacity
                key={a.id}
                style={styles.actionRow}
                activeOpacity={0.8}
                onPress={a.id === 'fleet' ? onOpenFleet : a.id === 'drivers' ? onOpenDrivers : a.id === 'reports' ? onOpenReports : a.id === 'bank' ? onOpenBankAccount : a.id === 'diesel' ? handleDieselExpense : undefined}
              >
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.ordersSection]}>
          <Text style={styles.sectionTitle}>Orders by Status</Text>
          <View style={styles.filterContainer}>
            {filterOptions.map((filter) => (
              <TouchableOpacity
                key={filter.id}
                style={[
                  styles.filterButton,
                  selectedFilter === filter.id && styles.filterButtonActive
                ]}
                onPress={() => setSelectedFilter(filter.id as any)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedFilter === filter.id && styles.filterButtonTextActive
                ]}>
                  {filter.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.section, styles.recentOrdersSection]}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No orders found</Text>
            </View>
          ) : (
            <View style={styles.ordersList}>
              {filteredOrders.map((order) => (
                <View key={order.id} style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{order.bookingId}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                      <Text style={styles.statusText}>{order.status.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={styles.customerName}>{order.name}</Text>
                  <Text style={styles.orderAddress}>{order.address}</Text>
                  <View style={styles.orderDetails}>
                    <View style={styles.orderDetailItem}>
                      <Text style={styles.orderDetailLabel}>Tanker Size</Text>
                      <Text style={styles.orderDetailValue}>{order.tankerSize}L</Text>
                    </View>
                    <View style={styles.orderDetailItem}>
                      <Text style={styles.orderDetailLabel}>Amount</Text>
                      <Text style={styles.orderDetailValue}>₹{order.totalAmount}</Text>
                    </View>
                    <View style={styles.orderDetailItem}>
                      <Text style={styles.orderDetailLabel}>Date</Text>
                      <Text style={styles.orderDetailValue}>{formatDate(order.date)}</Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 22, color: '#FFFFFF', fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 22, color: '#FFFFFF', fontWeight: '700' },
  headerSubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  headerSpacer: { width: 36 },
  logoutButton: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6 },
  logoutButtonText: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },
  content: { padding: 16, paddingBottom: 40 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  metricCard: { width: '48%', backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 16, marginBottom: 16, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  metricValue: { fontSize: 20, color: '#FFFFFF', fontWeight: '700', marginBottom: 6 },
  metricLabel: { fontSize: 13, color: '#9CA3AF' },
  section: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  sectionTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 8 },
  actionsList: { },
  actionRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1A1A1A', paddingVertical: 14, paddingHorizontal: 12, borderRadius: 12, marginTop: 10, borderWidth: 1, borderColor: '#2A2A2A' },
  actionIcon: { width: 26, textAlign: 'center', marginRight: 12, fontSize: 16, color: '#D4AF37' },
  actionLabel: { fontSize: 15, color: '#FFFFFF', fontWeight: '500' },
  filterContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  filterButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#2A2A2A', backgroundColor: '#1A1A1A' },
  filterButtonActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterButtonText: { fontSize: 14, color: '#9CA3AF', fontWeight: '500' },
  filterButtonTextActive: { color: '#FFFFFF' },
  ordersList: { marginTop: 12 },
  orderCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#2A2A2A' },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  orderId: { fontSize: 16, color: '#FFFFFF', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 10, color: '#FFFFFF', fontWeight: '600' },
  customerName: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 4 },
  orderAddress: { fontSize: 14, color: '#9CA3AF', marginBottom: 12 },
  orderDetails: { flexDirection: 'row', justifyContent: 'space-between' },
  orderDetailItem: { flex: 1 },
  orderDetailLabel: { fontSize: 12, color: '#9CA3AF', marginBottom: 2 },
  orderDetailValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  emptyState: { alignItems: 'center', paddingVertical: 32 },
  emptyStateText: { fontSize: 16, color: '#9CA3AF' },
  ordersSection: { marginTop: 24 },
  recentOrdersSection: { marginTop: 16 },
});

export default OwnerDashboard;


