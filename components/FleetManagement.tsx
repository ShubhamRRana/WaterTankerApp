import React, { useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

type Props = {
  onBack: () => void;
  onAddVehicle?: () => void;
};

type FilterKey = 'all' | 'maintenance' | 'insurance';

const FleetManagement = ({ onBack, onAddVehicle }: Props): React.ReactElement => {
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const summary = useMemo(() => ({
    totalVehicles: 0,
    dueMaintenance: 0,
    insuranceExpiring: 0,
  }), []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Fleet Management</Text>
          <Text style={styles.headerSubtitle}>Manage vehicles, maintenance and insurance</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tilesRow}>
          <View style={[styles.tile, styles.tileBorder]}>
            <Text style={styles.tileValue}>{summary.totalVehicles}</Text>
            <Text style={styles.tileLabel}>Total Vehicles</Text>
          </View>
          <View style={[styles.tile, styles.tileBorder]}>
            <Text style={[styles.tileValue, styles.warning]}>{summary.dueMaintenance}</Text>
            <Text style={styles.tileLabel}>Due for Maintenance</Text>
          </View>
        </View>
        <View style={styles.tilesRow}>
          <View style={[styles.tile, styles.tileBorder]}> 
            <Text style={[styles.tileValue, styles.error]}>{summary.insuranceExpiring}</Text>
            <Text style={styles.tileLabel}>Insurance Expiring</Text>
          </View>
          <View style={[styles.tile, styles.tileGhost]} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filter</Text>
          <View style={styles.filtersRow}>
            {([
              { key: 'all', label: 'All' },
              { key: 'maintenance', label: 'Due for Maintenance' },
              { key: 'insurance', label: 'Insurance Expiring' },
            ] as { key: FilterKey; label: string }[]).map(({ key, label }) => {
              const selected = activeFilter === key;
              return (
                <TouchableOpacity
                  key={key}
                  onPress={() => setActiveFilter(key)}
                  activeOpacity={0.8}
                  style={[styles.filterChip, selected ? styles.filterChipActive : styles.filterChipInactive]}
                >
                  <Text style={selected ? styles.filterTextActive : styles.filterTextInactive}>{label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.85} style={styles.primaryCta} onPress={onAddVehicle}>
          <Text style={styles.primaryCtaText}>Add Vehicle</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  backButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 22, color: '#FFFFFF', fontWeight: '600' },
  headerCenter: { flex: 1, alignItems: 'flex-start', marginLeft: 12 },
  headerTitle: { fontSize: 22, color: '#FFFFFF', fontWeight: '700' },
  headerSubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 2 },
  headerSpacer: { width: 36 },
  content: { padding: 16, paddingBottom: 112 },

  tilesRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  tile: { width: '48%', backgroundColor: '#1A1A1A', borderRadius: 12, paddingVertical: 18, paddingHorizontal: 16, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  tileBorder: { },
  tileGhost: { width: '48%', backgroundColor: 'transparent' },
  tileValue: { fontSize: 20, color: '#FFFFFF', fontWeight: '700', marginBottom: 6 },
  tileLabel: { fontSize: 13, color: '#9CA3AF' },
  warning: { color: '#D97706' },
  error: { color: '#DC2626' },

  section: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', marginTop: 12, shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  sectionTitle: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 10 },
  filtersRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  filterChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999, borderWidth: 1 },
  filterChipActive: { backgroundColor: '#1E3A8A', borderColor: '#1E3A8A' },
  filterChipInactive: { backgroundColor: '#111111', borderColor: '#2A2A2A' },
  filterTextActive: { color: '#FFFFFF', fontWeight: '600' },
  filterTextInactive: { color: '#9CA3AF', fontWeight: '500' },

  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  primaryCta: { backgroundColor: '#D4AF37', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  primaryCtaText: { color: '#000000', fontWeight: '700', fontSize: 16 },
});

export default FleetManagement;


