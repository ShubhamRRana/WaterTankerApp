import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, PlusIcon, PencilIcon, TrashIcon } from 'react-native-heroicons/outline';

type Driver = {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  experience: string;
  status: 'active' | 'inactive';
  assignedVehicle?: string;
};

type Props = {
  onBack: () => void;
  onAddDriver: () => void;
  onEditDriver: (driver: Driver) => void;
};

const DriversManagement = ({ onBack, onAddDriver, onEditDriver }: Props) => {
  const [drivers, setDrivers] = useState<Driver[]>([
    {
      id: '1',
      name: 'Rajesh Kumar',
      phoneNumber: '+91 98765 43210',
      licenseNumber: 'DL-1234567890',
      experience: '5 years',
      status: 'active',
      assignedVehicle: 'TN-01-AB-1234'
    },
    {
      id: '2',
      name: 'Suresh Patel',
      phoneNumber: '+91 98765 43211',
      licenseNumber: 'DL-1234567891',
      experience: '3 years',
      status: 'active',
      assignedVehicle: 'TN-01-AB-1235'
    },
    {
      id: '3',
      name: 'Amit Singh',
      phoneNumber: '+91 98765 43212',
      licenseNumber: 'DL-1234567892',
      experience: '7 years',
      status: 'inactive'
    }
  ]);

  const handleDeleteDriver = (driverId: string) => {
    Alert.alert(
      'Delete Driver',
      'Are you sure you want to delete this driver?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            setDrivers(drivers.filter(driver => driver.id !== driverId));
          }
        }
      ]
    );
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? '#059669' : '#DC2626';
  };

  const getStatusText = (status: string) => {
    return status === 'active' ? 'Active' : 'Inactive';
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Drivers Management</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddDriver} activeOpacity={0.7}>
          <PlusIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Drivers Management</Text>
          <Text style={styles.subtitle}>Manage your driver team and assignments</Text>
        </View>

        {/* Summary Cards */}
        <View style={styles.summarySection}>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{drivers.length}</Text>
              <Text style={styles.summaryLabel}>Total Drivers</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{drivers.filter(d => d.status === 'active').length}</Text>
              <Text style={styles.summaryLabel}>Active Drivers</Text>
            </View>
          </View>
        </View>

        {/* Drivers List */}
        <View style={styles.driversSection}>
          <Text style={styles.sectionTitle}>Drivers ({drivers.length})</Text>
          {drivers.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No drivers found</Text>
              <TouchableOpacity style={styles.addFirstDriverButton} onPress={onAddDriver} activeOpacity={0.8}>
                <Text style={styles.addFirstDriverButtonText}>Add Your First Driver</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.driversList}>
              {drivers.map((driver) => (
                <View key={driver.id} style={styles.driverCard}>
                  <View style={styles.driverHeader}>
                    <View style={styles.driverInfo}>
                      <Text style={styles.driverName}>{driver.name}</Text>
                      <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(driver.status) }]} />
                        <Text style={[styles.statusText, { color: getStatusColor(driver.status) }]}>
                          {getStatusText(driver.status)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.driverActions}>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => onEditDriver(driver)}
                        activeOpacity={0.7}
                      >
                        <PencilIcon size={20} color="#D4AF37" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDeleteDriver(driver.id)}
                        activeOpacity={0.7}
                      >
                        <TrashIcon size={20} color="#DC2626" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  
                  <View style={styles.driverDetails}>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Phone:</Text>
                      <Text style={styles.detailValue}>{driver.phoneNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>License:</Text>
                      <Text style={styles.detailValue}>{driver.licenseNumber}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Experience:</Text>
                      <Text style={styles.detailValue}>{driver.experience}</Text>
                    </View>
                    {driver.assignedVehicle && (
                      <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Vehicle:</Text>
                        <Text style={styles.detailValue}>{driver.assignedVehicle}</Text>
                      </View>
                    )}
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
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1, 
    borderBottomColor: '#2A2A2A' 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#2A2A2A', 
    justifyContent: 'center', 
    alignItems: 'center',
    marginRight: 16
  },
  headerTitle: { 
    flex: 1, 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '700' 
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center'
  },
  content: { padding: 16, paddingBottom: 40 },
  titleSection: { alignItems: 'center', marginBottom: 24 },
  mainTitle: { 
    fontSize: 32, 
    color: '#D4AF37', 
    fontWeight: '700', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    textAlign: 'center' 
  },
  summarySection: { marginBottom: 24 },
  summaryCards: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  summaryCard: { 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  summaryValue: { 
    fontSize: 24, 
    color: '#D4AF37', 
    fontWeight: '700', 
    marginBottom: 4 
  },
  summaryLabel: { 
    fontSize: 14, 
    color: '#9CA3AF', 
    fontWeight: '500' 
  },
  driversSection: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 16,
  },
  addFirstDriverButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  addFirstDriverButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  driversList: {
    gap: 12,
  },
  driverCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  driverInfo: {
    flex: 1,
  },
  driverName: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 4,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  driverActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverDetails: {
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});

export default DriversManagement;
