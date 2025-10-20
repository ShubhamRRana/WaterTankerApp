import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

type Props = {
  onBack: () => void;
  onAddDriver?: () => void;
};

const DriversManagement = ({ onBack, onAddDriver }: Props): React.ReactElement => {
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
          <Text style={styles.driversCount}>Drivers (0)</Text>
        </View>
        
        <View style={styles.card}>
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No drivers found</Text>
          </View>
        </View>
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
});

export default DriversManagement;
