import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';

type Props = {
  onBack: () => void;
  onSubmit?: (driverData: {
    name: string;
    phoneNumber: string;
    licenseNumber: string;
    licenseExpiryDate: string | null;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    joiningDate: string | null;
    monthlySalary: string;
  }) => void;
};

const AddDriver = ({ onBack, onSubmit }: Props): React.ReactElement => {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseExpiryDate, setLicenseExpiryDate] = useState('');
  const [address, setAddress] = useState('');
  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [monthlySalary, setMonthlySalary] = useState('');

  const [errors, setErrors] = useState<{
    name: string;
    phoneNumber: string;
    licenseNumber: string;
    licenseExpiryDate: string;
    address: string;
    emergencyContactName: string;
    emergencyContactPhone: string;
    joiningDate: string;
    monthlySalary: string;
  }>({
    name: '',
    phoneNumber: '',
    licenseNumber: '',
    licenseExpiryDate: '',
    address: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    joiningDate: '',
    monthlySalary: '',
  });

  const parseDateFromInput = (dateInput: string): Date | null => {
    const digitsDate = dateInput.replace(/[^0-9]/g, '').slice(0, 8);
    const d = parseInt(digitsDate.slice(0, 2) || '0', 10);
    const m = parseInt(digitsDate.slice(2, 4) || '0', 10);
    const y = parseInt(digitsDate.slice(4, 8) || '0', 10);
    if (y < 1000 || m < 1 || m > 12 || d < 1 || d > 31) return null;
    const candidate = new Date(y, m - 1, d);
    if (candidate.getFullYear() !== y || candidate.getMonth() !== m - 1 || candidate.getDate() !== d) return null;
    return candidate;
  };

  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^[6-9]\d{9}$/;
    return phoneRegex.test(phone);
  };

  const validateSalary = (salary: string): boolean => {
    const salaryNum = parseFloat(salary);
    return !isNaN(salaryNum) && salaryNum > 0;
  };

  const computeErrors = (): typeof errors => {
    const next = {
      name: '',
      phoneNumber: '',
      licenseNumber: '',
      licenseExpiryDate: '',
      address: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      joiningDate: '',
      monthlySalary: '',
    };

    // Name validation
    if (!name.trim()) {
      next.name = 'Name is required';
    } else if (name.trim().length < 2) {
      next.name = 'Name must be at least 2 characters';
    }

    // Phone number validation
    if (!phoneNumber.trim()) {
      next.phoneNumber = 'Phone number is required';
    } else if (!validatePhoneNumber(phoneNumber)) {
      next.phoneNumber = 'Enter a valid 10-digit phone number';
    }

    // License number validation
    if (!licenseNumber.trim()) {
      next.licenseNumber = 'License number is required';
    } else if (licenseNumber.trim().length < 5) {
      next.licenseNumber = 'License number must be at least 5 characters';
    }

    // License expiry date validation
    if (!licenseExpiryDate || licenseExpiryDate.length < 10) {
      next.licenseExpiryDate = 'Enter a valid date (DD/MM/YYYY)';
    } else {
      const expiryDate = parseDateFromInput(licenseExpiryDate);
      if (!expiryDate) {
        next.licenseExpiryDate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startExpiry = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
        if (startExpiry <= startToday) {
          next.licenseExpiryDate = 'License must not be expired';
        }
      }
    }

    // Address validation
    if (!address.trim()) {
      next.address = 'Address is required';
    } else if (address.trim().length < 10) {
      next.address = 'Address must be at least 10 characters';
    }

    // Emergency contact name validation
    if (!emergencyContactName.trim()) {
      next.emergencyContactName = 'Emergency contact name is required';
    } else if (emergencyContactName.trim().length < 2) {
      next.emergencyContactName = 'Emergency contact name must be at least 2 characters';
    }

    // Emergency contact phone validation
    if (!emergencyContactPhone.trim()) {
      next.emergencyContactPhone = 'Emergency contact phone is required';
    } else if (!validatePhoneNumber(emergencyContactPhone)) {
      next.emergencyContactPhone = 'Enter a valid 10-digit phone number';
    }

    // Joining date validation
    if (!joiningDate || joiningDate.length < 10) {
      next.joiningDate = 'Enter a valid date (DD/MM/YYYY)';
    } else {
      const joinDate = parseDateFromInput(joiningDate);
      if (!joinDate) {
        next.joiningDate = 'Enter a valid date (DD/MM/YYYY)';
      } else {
        const today = new Date();
        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const startJoin = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate());
        if (startJoin > startToday) {
          next.joiningDate = 'Joining date cannot be in the future';
        }
      }
    }

    // Monthly salary validation
    if (!monthlySalary.trim()) {
      next.monthlySalary = 'Monthly salary is required';
    } else if (!validateSalary(monthlySalary)) {
      next.monthlySalary = 'Enter a valid salary amount';
    }

    return next;
  };

  const isFormValid = (): boolean => {
    const next = computeErrors();
    const hasError = Object.values(next).some((v) => v);
    return !hasError;
  };

  const handleSubmit = (): void => {
    const nextErrors = computeErrors();
    setErrors(nextErrors);
    const hasError = Object.values(nextErrors).some((v) => v);
    if (hasError) return;

    const licenseExpiryDateParsed = parseDateFromInput(licenseExpiryDate);
    const joiningDateParsed = parseDateFromInput(joiningDate);

    const driverData = {
      name: name.trim(),
      phoneNumber: phoneNumber.trim(),
      licenseNumber: licenseNumber.trim(),
      licenseExpiryDate: licenseExpiryDateParsed ? licenseExpiryDateParsed.toISOString() : null,
      address: address.trim(),
      emergencyContactName: emergencyContactName.trim(),
      emergencyContactPhone: emergencyContactPhone.trim(),
      joiningDate: joiningDateParsed ? joiningDateParsed.toISOString() : null,
      monthlySalary: monthlySalary.trim(),
    };

    if (onSubmit) {
      onSubmit(driverData);
    }
  };

  const formatDateInput = (value: string): string => {
    const digits = value.replace(/[^0-9]/g, '').slice(0, 8);
    let out = '';
    if (digits.length <= 2) out = digits;
    else if (digits.length <= 4) out = `${digits.slice(0, 2)}/${digits.slice(2)}`;
    else out = `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
    return out;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add Driver</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Name *</Text>
          <TextInput
            value={name}
            onChangeText={(v) => {
              setName(v);
              setErrors((prev) => ({
                ...prev,
                name: v.trim() ? (v.trim().length < 2 ? 'Name must be at least 2 characters' : '') : 'Name is required',
              }));
            }}
            placeholder="Enter driver's full name"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          {!!errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            value={phoneNumber}
            onChangeText={(v) => {
              const digits = v.replace(/[^0-9]/g, '').slice(0, 10);
              setPhoneNumber(digits);
              setErrors((prev) => ({
                ...prev,
                phoneNumber: !digits ? 'Phone number is required' : (validatePhoneNumber(digits) ? '' : 'Enter a valid 10-digit phone number'),
              }));
            }}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {!!errors.phoneNumber && <Text style={styles.errorText}>{errors.phoneNumber}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>License Number *</Text>
          <TextInput
            value={licenseNumber}
            onChangeText={(v) => {
              setLicenseNumber(v);
              setErrors((prev) => ({
                ...prev,
                licenseNumber: !v.trim() ? 'License number is required' : (v.trim().length < 5 ? 'License number must be at least 5 characters' : ''),
              }));
            }}
            placeholder="Enter driving license number"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          {!!errors.licenseNumber && <Text style={styles.errorText}>{errors.licenseNumber}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>License Expiry Date *</Text>
          <View style={styles.selector}>
            <TextInput
              value={licenseExpiryDate}
              onChangeText={(v) => {
                const formatted = formatDateInput(v);
                setLicenseExpiryDate(formatted);
                const expiryDate = parseDateFromInput(formatted);
                setErrors((prev) => ({
                  ...prev,
                  licenseExpiryDate: !formatted || formatted.length < 10 ? 'Enter a valid date (DD/MM/YYYY)' : 
                    (!expiryDate ? 'Enter a valid date (DD/MM/YYYY)' : 
                      (() => {
                        const today = new Date();
                        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const startExpiry = new Date(expiryDate.getFullYear(), expiryDate.getMonth(), expiryDate.getDate());
                        return startExpiry <= startToday ? 'License must not be expired' : '';
                      })()),
                }));
              }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              style={styles.selectorText}
              maxLength={10}
            />
          </View>
          {!!errors.licenseExpiryDate && <Text style={styles.errorText}>{errors.licenseExpiryDate}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            value={address}
            onChangeText={(v) => {
              setAddress(v);
              setErrors((prev) => ({
                ...prev,
                address: !v.trim() ? 'Address is required' : (v.trim().length < 10 ? 'Address must be at least 10 characters' : ''),
              }));
            }}
            placeholder="Enter complete address"
            placeholderTextColor="#6B7280"
            style={[styles.input, { height: 96, textAlignVertical: 'top' }]}
            multiline
          />
          {!!errors.address && <Text style={styles.errorText}>{errors.address}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Emergency Contact Name *</Text>
          <TextInput
            value={emergencyContactName}
            onChangeText={(v) => {
              setEmergencyContactName(v);
              setErrors((prev) => ({
                ...prev,
                emergencyContactName: !v.trim() ? 'Emergency contact name is required' : (v.trim().length < 2 ? 'Emergency contact name must be at least 2 characters' : ''),
              }));
            }}
            placeholder="Enter emergency contact name"
            placeholderTextColor="#6B7280"
            style={styles.input}
          />
          {!!errors.emergencyContactName && <Text style={styles.errorText}>{errors.emergencyContactName}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Emergency Contact Phone *</Text>
          <TextInput
            value={emergencyContactPhone}
            onChangeText={(v) => {
              const digits = v.replace(/[^0-9]/g, '').slice(0, 10);
              setEmergencyContactPhone(digits);
              setErrors((prev) => ({
                ...prev,
                emergencyContactPhone: !digits ? 'Emergency contact phone is required' : (validatePhoneNumber(digits) ? '' : 'Enter a valid 10-digit phone number'),
              }));
            }}
            placeholder="Enter 10-digit phone number"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="phone-pad"
            maxLength={10}
          />
          {!!errors.emergencyContactPhone && <Text style={styles.errorText}>{errors.emergencyContactPhone}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Joining Date *</Text>
          <View style={styles.selector}>
            <TextInput
              value={joiningDate}
              onChangeText={(v) => {
                const formatted = formatDateInput(v);
                setJoiningDate(formatted);
                const joinDate = parseDateFromInput(formatted);
                setErrors((prev) => ({
                  ...prev,
                  joiningDate: !formatted || formatted.length < 10 ? 'Enter a valid date (DD/MM/YYYY)' : 
                    (!joinDate ? 'Enter a valid date (DD/MM/YYYY)' : 
                      (() => {
                        const today = new Date();
                        const startToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
                        const startJoin = new Date(joinDate.getFullYear(), joinDate.getMonth(), joinDate.getDate());
                        return startJoin > startToday ? 'Joining date cannot be in the future' : '';
                      })()),
                }));
              }}
              placeholder="DD/MM/YYYY"
              placeholderTextColor="#6B7280"
              keyboardType="number-pad"
              style={styles.selectorText}
              maxLength={10}
            />
          </View>
          {!!errors.joiningDate && <Text style={styles.errorText}>{errors.joiningDate}</Text>}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Monthly Salary *</Text>
          <TextInput
            value={monthlySalary}
            onChangeText={(v) => {
              setMonthlySalary(v);
              setErrors((prev) => ({
                ...prev,
                monthlySalary: !v.trim() ? 'Monthly salary is required' : (validateSalary(v) ? '' : 'Enter a valid salary amount'),
              }));
            }}
            placeholder="Enter monthly salary in ₹"
            placeholderTextColor="#6B7280"
            style={styles.input}
            keyboardType="numeric"
          />
          {!!errors.monthlySalary && <Text style={styles.errorText}>{errors.monthlySalary}</Text>}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.addButton, !isFormValid() && { opacity: 0.5 }]}
          onPress={handleSubmit}
          disabled={!isFormValid()}
          activeOpacity={0.9}
        >
          <Text style={styles.addButtonText}>Add Driver</Text>
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
    fontWeight: '500',
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
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    backgroundColor: '#000000',
  },
  addButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    shadowColor: '#D4AF37',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addButtonText: {
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

export default AddDriver;
