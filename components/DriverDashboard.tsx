import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowRightIcon, PlusIcon, TruckIcon } from 'react-native-heroicons/outline';

type Props = {
  onBack: () => void;
  onNavigate: (screen: 'bookTanker' | 'trackTanker' | 'profile') => void;
  currentUser: {
    id: string;
    name: string;
    phoneNumber: string;
    role: string;
  } | null;
};

const DriverDashboard = ({ onBack, onNavigate, currentUser }: Props): React.ReactElement => {
  // Mock data for statistics - in a real app, this would come from props or API
  const stats = {
    activeDeliveries: 0,
    outForDelivery: 0,
    totalCompleted: 0,
    todayCompleted: 0,
  };

  const deliveries = []; // Empty array for now - in real app, this would come from props

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <ArrowRightIcon size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.title}>Driver Dashboard</Text>
          <Text style={styles.subtitle}>Welcome back, {currentUser?.name || 'Driver'}</Text>
        </View>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.activeDeliveries}</Text>
            <Text style={styles.statLabel}>Active Deliveries</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.outForDelivery}</Text>
            <Text style={styles.statLabel}>Out for Delivery</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.totalCompleted}</Text>
            <Text style={styles.statLabel}>Total Completed</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{stats.todayCompleted}</Text>
            <Text style={styles.statLabel}>Today's Completed</Text>
          </View>
        </View>

        {/* Add New Delivery Button */}
        <TouchableOpacity 
          style={styles.addDeliveryButton}
          onPress={() => onNavigate('bookTanker')}
        >
          <PlusIcon size={20} color="#FFFFFF" />
          <Text style={styles.addDeliveryButtonText}>Add New Delivery</Text>
        </TouchableOpacity>

        {/* All Deliveries Section */}
        <View style={styles.deliveriesSection}>
          <Text style={styles.sectionTitle}>All Deliveries</Text>
          
          {deliveries.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyStateIcon}>
                <TruckIcon size={48} color="#D4AF37" />
              </View>
              <Text style={styles.emptyStateTitle}>No deliveries</Text>
              <Text style={styles.emptyStateSubtitle}>New deliveries will appear here</Text>
            </View>
          ) : (
            <View style={styles.deliveriesList}>
              {/* Delivery items would be rendered here */}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  backButton: {
    padding: 5,
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E3A8A',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280',
    textAlign: 'center',
  },
  addDeliveryButton: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addDeliveryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  deliveriesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateIcon: {
    width: 80,
    height: 80,
    backgroundColor: '#F3F4F6',
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  deliveriesList: {
    // Styles for delivery items would go here
  },
});

export default DriverDashboard;