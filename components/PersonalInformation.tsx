import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, ArrowDownTrayIcon } from 'react-native-heroicons/outline';
import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
  address?: string;
};

type Props = {
  onBack: () => void;
  currentUser: User | null;
  onUpdateProfile?: (updatedUser: Partial<User>) => void;
};

const PersonalInformation = ({ onBack, currentUser, onUpdateProfile }: Props): React.ReactElement => {
  const [fullName, setFullName] = useState(currentUser?.name || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [isEditing, setIsEditing] = useState(false);

  const [errors, setErrors] = useState<{
    fullName: string;
    phoneNumber: string;
  }>({
    fullName: '',
    phoneNumber: '',
  });

  const validateForm = (): boolean => {
    const newErrors = {
      fullName: '',
      phoneNumber: '',
    };

    if (!fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid 10-digit phone number';
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== '');
  };

  const handleSave = (): void => {
    if (!validateForm()) {
      return;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        name: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
      });
    }

    Alert.alert(
      'Profile Updated',
      'Your personal information has been updated successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleCancel = (): void => {
    setFullName(currentUser?.name || '');
    setPhoneNumber(currentUser?.phoneNumber || '');
    setAddress(currentUser?.address || '');
    setErrors({ fullName: '', phoneNumber: '' });
  };

  const getRoleDisplayName = (role: string): string => {
    switch (role) {
      case 'customer': return 'Customer';
      case 'admin': return 'Administrator';
      case 'driver': return 'Driver';
      default: return 'Customer';
    }
  };

  const handleExportProfile = async (): Promise<void> => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'No user data available to export.');
        return;
      }

      // Prepare CSV data for user profile
      const csvHeaders = 'Field,Value\n';
      const csvRows = [
        ['User ID', currentUser.id],
        ['Full Name', currentUser.name],
        ['Phone Number', currentUser.phoneNumber],
        ['Account Type', getRoleDisplayName(currentUser.role)],
        ['Address', currentUser.address || 'Not provided'],
        ['Created At', new Date(currentUser.createdAt).toLocaleDateString()],
      ].map(row => row.join(',')).join('\n');
      
      const csvContent = csvHeaders + csvRows;

      // Create filename with unique timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Profile_${currentUser.name.replace(/\s+/g, '_')}_${timestamp}.csv`;
      
      // Create file using new Expo FileSystem API
      const file = new File(Paths.cache, filename);
      await file.create();
      await file.write(csvContent);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Profile Information',
        });
        
        Alert.alert(
          'Export Successful',
          'Your profile information has been exported and is ready to share.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Export Complete',
          `Profile information has been saved as ${filename}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export profile information. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.cancelButton} onPress={onBack} activeOpacity={0.7}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Personal Information</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.exportButton} 
            onPress={handleExportProfile}
            activeOpacity={0.8}
          >
            <ArrowDownTrayIcon size={16} color="#FFFFFF" />
            <Text style={styles.exportText}>Export</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.8}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Full Name Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Full Name *</Text>
          <TextInput
            style={[styles.input, errors.fullName ? styles.inputError : null]}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (errors.fullName) {
                setErrors(prev => ({ ...prev, fullName: '' }));
              }
            }}
            placeholder="Enter your full name"
            placeholderTextColor="#6B7280"
            autoCapitalize="words"
          />
          {errors.fullName ? <Text style={styles.errorText}>{errors.fullName}</Text> : null}
        </View>

        {/* Phone Number Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Phone Number *</Text>
          <TextInput
            style={[styles.input, errors.phoneNumber ? styles.inputError : null]}
            value={phoneNumber}
            onChangeText={(text) => {
              // Allow only digits
              const digitsOnly = text.replace(/\D/g, '');
              setPhoneNumber(digitsOnly);
              if (errors.phoneNumber) {
                setErrors(prev => ({ ...prev, phoneNumber: '' }));
              }
            }}
            placeholder="Enter your phone number"
            placeholderTextColor="#6B7280"
            keyboardType="phone-pad"
            maxLength={10}
          />
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}
        </View>

        {/* Address Field */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.multilineInput]}
            value={address}
            onChangeText={setAddress}
            placeholder="Enter your address"
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
          />
        </View>

        {/* Account Type Field (Read-only) */}
        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Account Type</Text>
          <View style={[styles.input, styles.readOnlyInput]}>
            <Text style={styles.readOnlyText}>
              {getRoleDisplayName(currentUser?.role || 'customer')}
            </Text>
          </View>
          <Text style={styles.helpText}>Account type cannot be changed</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  cancelButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  exportText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  fieldContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: '#FFFFFF',
    minHeight: 48,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  readOnlyInput: {
    backgroundColor: '#2A2A2A',
    borderColor: '#2A2A2A',
  },
  readOnlyText: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  inputError: {
    borderColor: '#DC2626',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 14,
    marginTop: 6,
  },
  helpText: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 6,
    fontStyle: 'italic',
  },
});

export default PersonalInformation;
