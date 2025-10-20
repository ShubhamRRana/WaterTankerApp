import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

// Helpers for masked inputs
const clamp = (num, min, max) => Math.min(Math.max(num, min), max);

const BookTanker = ({ onBack, onSubmit }) => {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [dateInput, setDateInput] = useState(''); // "DD/MM/YYYY"
  const [timeInput, setTimeInput] = useState(''); // "HH:MM"
  const [meridiem, setMeridiem] = useState('AM');
  const [tankerSize, setTankerSize] = useState(null); // '10k' | '20k'
  const [agency, setAgency] = useState('');
  const [comments, setComments] = useState('');

  const [errors, setErrors] = useState({
    name: '',
    address: '',
    date: '',
    time: '',
    tankerSize: '',
    agency: '',
  });

  const parseDateFromInput = () => {
    const digitsDate = dateInput.replace(/[^0-9]/g, '').slice(0, 8);
    const d = parseInt(digitsDate.slice(0, 2) || '0', 10);
    const m = parseInt(digitsDate.slice(2, 4) || '0', 10);
    const y = parseInt(digitsDate.slice(4, 8) || '0', 10);
    if (y < 1000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const candidate = new Date(y, m - 1, d);
    if (candidate.getFullYear() !== y || candidate.getMonth() !== m - 1 || candidate.getDate() !== d) return null;
    return candidate;
  };

  const parseTimeFromInput = () => {
    const digitsTime = timeInput.replace(/[^0-9]/g, '').slice(0, 4);
    const hh = parseInt(digitsTime.slice(0, 2) || '0', 10);
    const mm = parseInt(digitsTime.slice(2, 4) || '0', 10);
    if (hh < 1 || hh > 12 || mm < 0 || mm > 59) return null;
    let hour24 = hh % 12; // 12 -> 0, 1..11 -> 1..11
    if (meridiem === 'PM') hour24 = (hour24 + 12) % 24;
    return { hour24, mm };
  };

  const validateAll = () => {
    const next = { name: '', address: '', date: '', time: '', tankerSize: '', agency: '' };
    if (!name.trim()) next.name = 'Name is required';
    if (!address.trim()) next.address = 'Address is required';
    const d = parseDateFromInput();
    if (!dateInput || dateInput.length < 10 || !d) next.date = 'Enter a valid date (DD/MM/YYYY)';
    else {
      const today = new Date();
      const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startEntered = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      if (startEntered < startToday) next.date = 'Date cannot be in the past';
    }
    const t = parseTimeFromInput();
    if (!timeInput || timeInput.length < 5 || !t) next.time = 'Enter a valid time (HH:MM)';
    if (!tankerSize) next.tankerSize = 'Select tanker quantity';
    if (!agency.trim()) next.agency = 'Agency is required';
    setErrors(next);
    const hasError = Object.values(next).some((v) => v);
    return !hasError;
  };

  const handleSubmit = () => {
    if (!validateAll()) return;

    const d = parseDateFromInput();
    const t = parseTimeFromInput();
    const dateIso = d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString() : null;
    const timeIso = d && t ? new Date(d.getFullYear(), d.getMonth(), d.getDate(), t.hour24, t.mm, 0, 0).toISOString() : null;

    const payload = {
      name,
      address,
      date: dateIso,
      time: timeIso,
      tankerSize,
      agency,
      comments,
    };
    if (onSubmit) onSubmit(payload);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Tanker</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Name</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter your name"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            value={address}
            onChangeText={setAddress}
            placeholder="Delivery address"
            placeholderTextColor="#6B7280"
            style={[styles.input, { height: 96, textAlignVertical: 'top' }]}
            multiline
          />
          {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.row}>
          <View style={[styles.field, styles.rowItem]}>
            <Text style={styles.label}>Date</Text>
            <View style={styles.selector}>
              <TextInput
                value={dateInput}
                onChangeText={(v) => {
                  const digits = v.replace(/[^0-9]/g, '').slice(0, 8);
                  let out = '';
                  if (digits.length <= 2) out = digits;
                  else if (digits.length <= 4) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
                  else out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
                  setDateInput(out);
                }}
                placeholder="__ / __ / ____"
                placeholderTextColor="#6B7280"
                keyboardType="number-pad"
                style={styles.selectorText}
                maxLength={10}
              />
            </View>
            {!!errors.date && <Text style={styles.errorText}>{errors.date}</Text>}
          </View>
          <View style={[styles.field, styles.rowItem]}>
            <Text style={styles.label}>Time</Text>
            <View style={styles.timeRow}>
              <View style={[styles.selector, { flex: 1 }]}>
                <TextInput
                  value={timeInput}
                  onChangeText={(v) => {
                    const digits = v.replace(/[^0-9]/g, '').slice(0, 4);
                    let out = '';
                    if (digits.length <= 2) out = digits;
                    else out = `${digits.slice(0, 2)}:${digits.slice(2)}`;
                    setTimeInput(out);
                  }}
                  placeholder="__ : __"
                  placeholderTextColor="#6B7280"
                  keyboardType="number-pad"
                  style={styles.selectorText}
                  maxLength={5}
                />
              </View>
              <TouchableOpacity
                onPress={() => setMeridiem((m) => (m === 'AM' ? 'PM' : 'AM'))}
                activeOpacity={0.8}
                style={styles.ampmButton}
              >
                <Text style={styles.ampmText}>{meridiem}</Text>
              </TouchableOpacity>
            </View>
            {!!errors.time && <Text style={styles.errorText}>{errors.time}</Text>}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Choose tanker quantity</Text>
          <View style={styles.quantityRow}>
            <TouchableOpacity
              style={[styles.quantityButton, tankerSize === '10k' && styles.quantitySelected]}
              onPress={() => setTankerSize('10k')}
              activeOpacity={0.8}
            >
              <Text style={styles.quantityTitle}>10,000 Liters</Text>
              <Text style={styles.quantityPrice}>₹600</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.quantityButton, tankerSize === '20k' && styles.quantitySelected]}
              onPress={() => setTankerSize('20k')}
              activeOpacity={0.8}
            >
              <Text style={styles.quantityTitle}>20,000 Liters</Text>
              <Text style={styles.quantityPrice}>₹1200</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Choose Tanker Agency</Text>
          <TextInput
            value={agency}
            onChangeText={setAgency}
            placeholder="Select/enter agency"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          {!!errors.agency && <Text style={styles.errorText}>{errors.agency}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Additional comments</Text>
          <TextInput
            value={comments}
            onChangeText={setComments}
            placeholder="Any instructions for the driver"
            placeholderTextColor="#6B7280"
            style={[styles.input, { height: 96, textAlignVertical: 'top' }]}
            multiline
          />
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.bookButton, !validateAll() && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!validateAll()}
          activeOpacity={0.9}
        >
          <Text style={styles.bookButtonText}>Book Tanker</Text>
        </TouchableOpacity>
      </View>

      {/* Native pickers removed in favor of masked inputs */}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  selector: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  selectorText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ampmButton: {
    marginLeft: 8,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  ampmText: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  rowItem: {
    flex: 1,
  },
  quantityRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quantityButton: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 12,
    padding: 14,
  },
  quantitySelected: {
    borderColor: '#D4AF37',
    backgroundColor: '#232014',
  },
  quantityTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  quantityPrice: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  bookButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '700',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
  },
});

export default BookTanker;


