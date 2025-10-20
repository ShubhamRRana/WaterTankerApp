import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';

type Props = {
  onBack: () => void;
  onSubmit?: (vehicleData: VehicleData) => void;
};

type VehicleData = {
  vehicleNumber: string;
  capacity: string;
  lastServiceDate: string;
  nextServiceDate: string;
  insuranceExpiryDate: string;
};

const AddVehicle = ({ onBack, onSubmit }: Props): React.ReactElement => {
  const [formData, setFormData] = useState<VehicleData>({
    vehicleNumber: '',
    capacity: '',
    lastServiceDate: '',
    nextServiceDate: '',
    insuranceExpiryDate: '',
  });

  const [errors, setErrors] = useState<Partial<VehicleData>>({});

  const parseDateFromInput = (dateString: string): Date | null => {
    const digitsDate = dateString.replace(/[^0-9]/g, '').slice(0, 8);
    const d = parseInt(digitsDate.slice(0, 2) || '0', 10);
    const m = parseInt(digitsDate.slice(2, 4) || '0', 10);
    const y = parseInt(digitsDate.slice(4, 8) || '0', 10);
    if (y < 1000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const candidate = new Date(y, m - 1, d);
    if (candidate.getFullYear() !== y || candidate.getMonth() !== m - 1 || candidate.getDate() !== d) return null;
    return candidate;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<VehicleData> = {};

    if (!formData.vehicleNumber.trim()) {
      newErrors.vehicleNumber = 'Vehicle number is required';
    }

    if (!formData.capacity.trim()) {
      newErrors.capacity = 'Capacity is required';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      newErrors.capacity = 'Please enter a valid capacity';
    }

    if (!formData.lastServiceDate.trim()) {
      newErrors.lastServiceDate = 'Last service date is required';
    } else {
      const lastServiceDate = parseDateFromInput(formData.lastServiceDate);
      if (!lastServiceDate) {
        newErrors.lastServiceDate = 'Enter a valid date (DD/MM/YYYY)';
      }
    }

    if (!formData.nextServiceDate.trim()) {
      newErrors.nextServiceDate = 'Next service date is required';
    } else {
      const nextServiceDate = parseDateFromInput(formData.nextServiceDate);
      if (!nextServiceDate) {
        newErrors.nextServiceDate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startEntered = new Date(nextServiceDate.getFullYear(), nextServiceDate.getMonth(), nextServiceDate.getDate());
        if (startEntered < startToday) {
          newErrors.nextServiceDate = 'Cannot accept past date';
        }
      }
    }

    if (!formData.insuranceExpiryDate.trim()) {
      newErrors.insuranceExpiryDate = 'Insurance expiry date is required';
    } else {
      const insuranceExpiryDate = parseDateFromInput(formData.insuranceExpiryDate);
      if (!insuranceExpiryDate) {
        newErrors.insuranceExpiryDate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startEntered = new Date(insuranceExpiryDate.getFullYear(), insuranceExpiryDate.getMonth(), insuranceExpiryDate.getDate());
        if (startEntered < startToday) {
          newErrors.insuranceExpiryDate = 'Cannot accept past date';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (): void => {
    if (validateForm()) {
      onSubmit?.(formData);
      Alert.alert(
        'Vehicle Added',
        'Vehicle has been successfully added to your fleet.',
        [{ text: 'OK', onPress: onBack }]
      );
    }
  };

  const updateField = (field: keyof VehicleData, value: string): void => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Add New Vehicle</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Vehicle Number *</Text>
            <TextInput
              style={[styles.input, errors.vehicleNumber && styles.inputError]}
              placeholder="Enter vehicle number"
              placeholderTextColor="#6B7280"
              value={formData.vehicleNumber}
              onChangeText={(text) => updateField('vehicleNumber', text)}
            />
            {errors.vehicleNumber && <Text style={styles.errorText}>{errors.vehicleNumber}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Capacity (Liters) *</Text>
            <TextInput
              style={[styles.input, errors.capacity && styles.inputError]}
              placeholder="Enter capacity in liters"
              placeholderTextColor="#6B7280"
              value={formData.capacity}
              onChangeText={(text) => updateField('capacity', text)}
              keyboardType="numeric"
            />
            {errors.capacity && <Text style={styles.errorText}>{errors.capacity}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Last Service Date *</Text>
            <View style={styles.selector}>
              <TextInput
                value={formData.lastServiceDate}
                onChangeText={(text) => {
                  const digits = text.replace(/[^0-9]/g, '').slice(0, 8);
                  let out = '';
                  if (digits.length <= 2) out = digits;
                  else if (digits.length <= 4) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  else out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                  updateField('lastServiceDate', out);
                  
                  // Real-time validation
                  const date = parseDateFromInput(out);
                  if (out && out.length >= 10) {
                    if (!date) {
                      setErrors(prev => ({ ...prev, lastServiceDate: 'Enter a valid date (DD/MM/YYYY)' }));
                    } else {
                      setErrors(prev => ({ ...prev, lastServiceDate: undefined }));
                    }
                  }
                }}
                placeholder="__ / __ / ____"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                style={styles.selectorText}
                maxLength={10}
              />
            </View>
            <Text style={styles.hintText}>Format: DD/MM/YYYY</Text>
            {errors.lastServiceDate && <Text style={styles.errorText}>{errors.lastServiceDate}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Next Service Date *</Text>
            <View style={styles.selector}>
              <TextInput
                value={formData.nextServiceDate}
                onChangeText={(text) => {
                  const digits = text.replace(/[^0-9]/g, '').slice(0, 8);
                  let out = '';
                  if (digits.length <= 2) out = digits;
                  else if (digits.length <= 4) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  else out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                  updateField('nextServiceDate', out);
                  
                  // Real-time validation
                  const date = parseDateFromInput(out);
                  if (out && out.length >= 10) {
                    if (!date) {
                      setErrors(prev => ({ ...prev, nextServiceDate: 'Enter a valid date (DD/MM/YYYY)' }));
                    } else {
                      const today = new Date();
                      const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const startEntered = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      if (startEntered < startToday) {
                        setErrors(prev => ({ ...prev, nextServiceDate: 'Cannot accept past date' }));
                      } else {
                        setErrors(prev => ({ ...prev, nextServiceDate: undefined }));
                      }
                    }
                  }
                }}
                placeholder="__ / __ / ____"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                style={styles.selectorText}
                maxLength={10}
              />
            </View>
            {errors.nextServiceDate && <Text style={styles.errorText}>{errors.nextServiceDate}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Insurance Expiry Date *</Text>
            <View style={styles.selector}>
              <TextInput
                value={formData.insuranceExpiryDate}
                onChangeText={(text) => {
                  const digits = text.replace(/[^0-9]/g, '').slice(0, 8);
                  let out = '';
                  if (digits.length <= 2) out = digits;
                  else if (digits.length <= 4) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  else out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                  updateField('insuranceExpiryDate', out);
                  
                  // Real-time validation
                  const date = parseDateFromInput(out);
                  if (out && out.length >= 10) {
                    if (!date) {
                      setErrors(prev => ({ ...prev, insuranceExpiryDate: 'Enter a valid date (DD/MM/YYYY)' }));
                    } else {
                      const today = new Date();
                      const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                      const startEntered = new Date(date.getFullYear(), date.getMonth(), date.getDate());
                      if (startEntered < startToday) {
                        setErrors(prev => ({ ...prev, insuranceExpiryDate: 'Cannot accept past date' }));
                      } else {
                        setErrors(prev => ({ ...prev, insuranceExpiryDate: undefined }));
                      }
                    }
                  }
                }}
                placeholder="__ / __ / ____"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                style={styles.selectorText}
                maxLength={10}
              />
            </View>
            <Text style={styles.hintText}>Format: DD/MM/YYYY</Text>
            {errors.insuranceExpiryDate && <Text style={styles.errorText}>{errors.insuranceExpiryDate}</Text>}
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.cancelButton} onPress={onBack} activeOpacity={0.8}>
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} activeOpacity={0.8}>
            <Text style={styles.submitButtonText}>Add Vehicle</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  headerSpacer: { width: 36 },
  content: { padding: 16, paddingBottom: 100 },
  form: { },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 16, color: '#FFFFFF', fontWeight: '600', marginBottom: 8 },
  input: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#FFFFFF' },
  inputError: { borderColor: '#DC2626' },
  selector: { backgroundColor: '#1A1A1A', borderWidth: 1, borderColor: '#2A2A2A', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 14 },
  selectorText: { color: '#FFFFFF', fontSize: 16 },
  hintText: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
  footer: { position: 'absolute', left: 16, right: 16, bottom: 16 },
  buttonRow: { flexDirection: 'row', gap: 12 },
  cancelButton: { flex: 1, backgroundColor: '#2A2A2A', paddingVertical: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#404040' },
  cancelButtonText: { color: '#FFFFFF', fontWeight: '600', fontSize: 16 },
  submitButton: { flex: 1, backgroundColor: '#D4AF37', paddingVertical: 14, borderRadius: 8, alignItems: 'center' },
  submitButtonText: { color: '#000000', fontWeight: '700', fontSize: 16 },
});

export default AddVehicle;
