import React from 'react';
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

type Props = {
  onBack: () => void;
  onOpenFleet?: () => void;
  onOpenDrivers?: () => void;
  currentUser: User | null;
  onLogout: () => void;
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

const OwnerDashboard = ({ onBack, onOpenFleet, onOpenDrivers, currentUser, onLogout }: Props): React.ReactElement => {
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
                onPress={a.id === 'fleet' ? onOpenFleet : a.id === 'drivers' ? onOpenDrivers : undefined}
              >
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
});

export default OwnerDashboard;


