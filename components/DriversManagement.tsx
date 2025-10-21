import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';

type Driver = {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string | null;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  joiningDate: string | null;
  monthlySalary: string;
};

type Props = {
  onBack: () => void;
  onAddDriver?: () => void;
  onEditDriver?: (driver: Driver) => void;
  drivers: Driver[];
};

const DriversManagement = ({ onBack, onAddDriver, onEditDriver, drivers }: Props): React.ReactElement => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Drivers Management</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.content}>
        <View style={styles.driversTile}>
          <Text style={styles.driversCount}>Drivers ({drivers.length})</Text>
        </View>
        
        {drivers.length === 0 ? (
          <View style={styles.card}>
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No drivers found</Text>
            </View>
          </View>
        ) : (
          <ScrollView style={styles.driversList} showsVerticalScrollIndicator={false}>
            {drivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} onEditDriver={onEditDriver} />
            ))}
          </ScrollView>
        )}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.addDriverButton} 
          onPress={onAddDriver}
          activeOpacity={0.8}
        >
          <Text style={styles.addDriverButtonText}>Add Driver</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const DriverCard = ({ driver, onEditDriver }: { driver: Driver; onEditDriver?: (driver: Driver) => void }): React.ReactElement => {
  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const formatPhoneNumber = (phone: string): string => {
    return phone.replace(/(\d{5})(\d{5})/, '$1 $2');
  };

  const handleMenuPress = (): void => {
    Alert.alert(
      'Driver Options',
      `Want to edit details for ${driver.name}?`,
      [
        {
          text: 'Edit Details',
          onPress: () => onEditDriver?.(driver),
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  return (
    <View style={styles.driverCard}>
      <View style={styles.driverHeader}>
        <Text style={styles.driverName}>{driver.name}</Text>
        <TouchableOpacity onPress={handleMenuPress} style={styles.menuButton} activeOpacity={0.7}>
          <Text style={styles.menuIcon}>⋯</Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.driverDetails}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Phone:</Text>
          <Text style={styles.detailValue}>{formatPhoneNumber(driver.phoneNumber)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License:</Text>
          <Text style={styles.detailValue}>{driver.licenseNumber}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>License Expiry:</Text>
          <Text style={[styles.detailValue, styles.expiryDate]}>
            {formatDate(driver.licenseExpiryDate)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Joining Date:</Text>
          <Text style={styles.detailValue}>{formatDate(driver.joiningDate)}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Emergency Contact:</Text>
          <Text style={styles.detailValue}>
            {driver.emergencyContactName} ({formatPhoneNumber(driver.emergencyContactPhone)})
          </Text>
        </View>
      </View>
    </View>
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
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  headerSpacer: {
    width: 36,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  driversTile: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
    flex: 1,
    justifyContent: 'center',
  },
  driversCount: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  addDriverButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addDriverButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  footer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
  },
  driversList: {
    flex: 1,
    marginBottom: 80, // Space for the footer button
  },
  driverCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  driverHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  driverName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
  },
  menuButton: {
    padding: 8,
    borderRadius: 4,
    backgroundColor: '#2A2A2A',
  },
  menuIcon: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  driverDetails: {
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  detailLabel: {
    color: '#9CA3AF',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
  detailValue: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '400',
    flex: 2,
    textAlign: 'right',
  },
  expiryDate: {
    color: '#D97706', // Warning amber for expiry dates
  },
});

export default DriversManagement;
