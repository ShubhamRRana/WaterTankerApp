import React, { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

type BankAccount = {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolderName: string;
  ifscCode: string;
  branchName: string;
  accountType: 'savings' | 'current';
  isPrimary: boolean;
  createdAt: string;
};

type Props = {
  onBack: () => void;
};

const BANK_ACCOUNTS_STORAGE_KEY = '@water_tanker_bank_accounts';

const BankAccountManagement = ({ onBack }: Props): React.ReactElement => {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountNumber: '',
    confirmAccountNumber: '',
    accountHolderName: '',
    ifscCode: '',
    branchName: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadBankAccounts();
  }, []);

  const loadBankAccounts = async (): Promise<void> => {
    try {
      const savedAccounts = await AsyncStorage.getItem(BANK_ACCOUNTS_STORAGE_KEY);
      if (savedAccounts) {
        const accountsData = JSON.parse(savedAccounts);
        setBankAccounts(accountsData);
      }
    } catch (error) {
      console.error('Error loading bank accounts:', error);
    }
  };

  const saveBankAccounts = async (accountsToSave: BankAccount[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(BANK_ACCOUNTS_STORAGE_KEY, JSON.stringify(accountsToSave));
    } catch (error) {
      console.error('Error saving bank accounts:', error);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.bankName.trim()) {
      newErrors.bankName = 'Bank name is required';
    }

    if (!formData.accountNumber.trim()) {
      newErrors.accountNumber = 'Account number is required';
    } else if (formData.accountNumber.length < 9) {
      newErrors.accountNumber = 'Account number must be at least 9 digits';
    }

    if (!formData.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = 'Confirm account number is required';
    } else if (formData.confirmAccountNumber !== formData.accountNumber) {
      newErrors.confirmAccountNumber = 'Account numbers do not match';
    }

    if (!formData.accountHolderName.trim()) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.ifscCode.trim()) {
      newErrors.ifscCode = 'IFSC code is required';
    } else if (formData.ifscCode.length !== 11) {
      newErrors.ifscCode = 'IFSC code must be 11 characters';
    }

    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAccount = async (): Promise<void> => {
    if (!validateForm()) return;

    const newAccount: BankAccount = {
      id: Date.now().toString(),
      bankName: formData.bankName,
      accountNumber: formData.accountNumber,
      accountHolderName: formData.accountHolderName,
      ifscCode: formData.ifscCode,
      branchName: formData.branchName,
      accountType: 'savings', // Default to savings
      isPrimary: bankAccounts.length === 0, // First account is primary
      createdAt: new Date().toISOString(),
    };

    const updatedAccounts = [...bankAccounts, newAccount];
    setBankAccounts(updatedAccounts);
    await saveBankAccounts(updatedAccounts);
    
    setIsAddModalVisible(false);
    resetForm();
    
    Alert.alert(
      'Success',
      'Bank account added successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleEditAccount = async (): Promise<void> => {
    if (!validateForm() || !editingAccount) return;

    const updatedAccounts = bankAccounts.map(account =>
      account.id === editingAccount.id
        ? { ...account, bankName: formData.bankName, accountNumber: formData.accountNumber, accountHolderName: formData.accountHolderName, ifscCode: formData.ifscCode, branchName: formData.branchName }
        : account
    );

    setBankAccounts(updatedAccounts);
    await saveBankAccounts(updatedAccounts);
    
    setIsEditModalVisible(false);
    setEditingAccount(null);
    resetForm();
    
    Alert.alert(
      'Success',
      'Bank account updated successfully!',
      [{ text: 'OK' }]
    );
  };

  const handleDeleteAccount = (accountId: string): void => {
    Alert.alert(
      'Delete Bank Account',
      'Are you sure you want to delete this bank account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedAccounts = bankAccounts.filter(account => account.id !== accountId);
            setBankAccounts(updatedAccounts);
            await saveBankAccounts(updatedAccounts);
            
            Alert.alert(
              'Success',
              'Bank account deleted successfully!',
              [{ text: 'OK' }]
            );
          },
        },
      ]
    );
  };

  const handleSetPrimary = async (accountId: string): Promise<void> => {
    const updatedAccounts = bankAccounts.map(account => ({
      ...account,
      isPrimary: account.id === accountId,
    }));

    setBankAccounts(updatedAccounts);
    await saveBankAccounts(updatedAccounts);
    
    Alert.alert(
      'Success',
      'Primary bank account updated!',
      [{ text: 'OK' }]
    );
  };

  const openEditModal = (account: BankAccount): void => {
    setEditingAccount(account);
    setFormData({
      bankName: account.bankName,
      accountNumber: account.accountNumber,
      confirmAccountNumber: account.accountNumber, // Pre-fill with same value for edit
      accountHolderName: account.accountHolderName,
      ifscCode: account.ifscCode,
      branchName: account.branchName,
    });
    setIsEditModalVisible(true);
  };

  const resetForm = (): void => {
    setFormData({
      bankName: '',
      accountNumber: '',
      confirmAccountNumber: '',
      accountHolderName: '',
      ifscCode: '',
      branchName: '',
    });
    setErrors({});
  };

  const formatAccountNumber = (accountNumber: string): string => {
    return accountNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Text style={styles.backText}>‹</Text>
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Bank Account Management</Text>
          <Text style={styles.headerSubtitle}>Manage your business bank accounts</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {bankAccounts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No bank accounts added yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Add your first bank account to start managing payments
            </Text>
          </View>
        ) : (
          <View style={styles.accountsList}>
            {bankAccounts.map((account) => (
              <View key={account.id} style={styles.accountCard}>
                <View style={styles.accountHeader}>
                  <View style={styles.accountInfo}>
                    <Text style={styles.bankName}>{account.bankName}</Text>
                    <Text style={styles.accountNumber}>
                      {formatAccountNumber(account.accountNumber)}
                    </Text>
                    <Text style={styles.accountHolder}>{account.accountHolderName}</Text>
                  </View>
                  {account.isPrimary && (
                    <View style={styles.primaryBadge}>
                      <Text style={styles.primaryBadgeText}>Primary</Text>
                    </View>
                  )}
                </View>
                
                <View style={styles.accountDetails}>
                  <Text style={styles.detailLabel}>IFSC Code</Text>
                  <Text style={styles.detailValue}>{account.ifscCode}</Text>
                  
                  <Text style={styles.detailLabel}>Branch</Text>
                  <Text style={styles.detailValue}>{account.branchName}</Text>
                  
                  <Text style={styles.detailLabel}>Account Type</Text>
                  <Text style={styles.detailValue}>
                    {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}
                  </Text>
                </View>

                <View style={styles.accountActions}>
                  {!account.isPrimary && (
                    <TouchableOpacity
                      style={styles.primaryButton}
                      onPress={() => handleSetPrimary(account.id)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.primaryButtonText}>Set as Primary</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => openEditModal(account)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.editButtonText}>Edit</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDeleteAccount(account.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.deleteButtonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setIsAddModalVisible(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>+ Add Bank Account</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Account Modal */}
      <Modal
        visible={isAddModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsAddModalVisible(false);
                resetForm();
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Bank Account</Text>
            <TouchableOpacity
              onPress={handleAddAccount}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bank Name *</Text>
              <TextInput
                style={[styles.formInput, errors.bankName && styles.formInputError]}
                value={formData.bankName}
                onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                placeholder="Enter bank name"
                placeholderTextColor="#6B7280"
              />
              {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Number *</Text>
              <TextInput
                style={[styles.formInput, errors.accountNumber && styles.formInputError]}
                value={formData.accountNumber}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                placeholder="Enter account number"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm Account Number *</Text>
              <TextInput
                style={[styles.formInput, errors.confirmAccountNumber && styles.formInputError]}
                value={formData.confirmAccountNumber}
                onChangeText={(text) => setFormData({ ...formData, confirmAccountNumber: text })}
                placeholder="Re-enter account number"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              {errors.confirmAccountNumber && <Text style={styles.errorText}>{errors.confirmAccountNumber}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Holder Name *</Text>
              <TextInput
                style={[styles.formInput, errors.accountHolderName && styles.formInputError]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Enter account holder name"
                placeholderTextColor="#6B7280"
              />
              {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>IFSC Code *</Text>
              <TextInput
                style={[styles.formInput, errors.ifscCode && styles.formInputError]}
                value={formData.ifscCode}
                onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
                placeholder="Enter IFSC code"
                placeholderTextColor="#6B7280"
                autoCapitalize="characters"
              />
              {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Branch Name *</Text>
              <TextInput
                style={[styles.formInput, errors.branchName && styles.formInputError]}
                value={formData.branchName}
                onChangeText={(text) => setFormData({ ...formData, branchName: text })}
                placeholder="Enter branch name"
                placeholderTextColor="#6B7280"
              />
              {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
            </View>

          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Edit Account Modal */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => {
                setIsEditModalVisible(false);
                setEditingAccount(null);
                resetForm();
              }}
              style={styles.modalCloseButton}
            >
              <Text style={styles.modalCloseText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Edit Bank Account</Text>
            <TouchableOpacity
              onPress={handleEditAccount}
              style={styles.modalSaveButton}
            >
              <Text style={styles.modalSaveText}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Bank Name *</Text>
              <TextInput
                style={[styles.formInput, errors.bankName && styles.formInputError]}
                value={formData.bankName}
                onChangeText={(text) => setFormData({ ...formData, bankName: text })}
                placeholder="Enter bank name"
                placeholderTextColor="#6B7280"
              />
              {errors.bankName && <Text style={styles.errorText}>{errors.bankName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Number *</Text>
              <TextInput
                style={[styles.formInput, errors.accountNumber && styles.formInputError]}
                value={formData.accountNumber}
                onChangeText={(text) => setFormData({ ...formData, accountNumber: text })}
                placeholder="Enter account number"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              {errors.accountNumber && <Text style={styles.errorText}>{errors.accountNumber}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Confirm Account Number *</Text>
              <TextInput
                style={[styles.formInput, errors.confirmAccountNumber && styles.formInputError]}
                value={formData.confirmAccountNumber}
                onChangeText={(text) => setFormData({ ...formData, confirmAccountNumber: text })}
                placeholder="Re-enter account number"
                placeholderTextColor="#6B7280"
                keyboardType="numeric"
              />
              {errors.confirmAccountNumber && <Text style={styles.errorText}>{errors.confirmAccountNumber}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Account Holder Name *</Text>
              <TextInput
                style={[styles.formInput, errors.accountHolderName && styles.formInputError]}
                value={formData.accountHolderName}
                onChangeText={(text) => setFormData({ ...formData, accountHolderName: text })}
                placeholder="Enter account holder name"
                placeholderTextColor="#6B7280"
              />
              {errors.accountHolderName && <Text style={styles.errorText}>{errors.accountHolderName}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>IFSC Code *</Text>
              <TextInput
                style={[styles.formInput, errors.ifscCode && styles.formInputError]}
                value={formData.ifscCode}
                onChangeText={(text) => setFormData({ ...formData, ifscCode: text.toUpperCase() })}
                placeholder="Enter IFSC code"
                placeholderTextColor="#6B7280"
                autoCapitalize="characters"
              />
              {errors.ifscCode && <Text style={styles.errorText}>{errors.ifscCode}</Text>}
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>Branch Name *</Text>
              <TextInput
                style={[styles.formInput, errors.branchName && styles.formInputError]}
                value={formData.branchName}
                onChangeText={(text) => setFormData({ ...formData, branchName: text })}
                placeholder="Enter branch name"
                placeholderTextColor="#6B7280"
              />
              {errors.branchName && <Text style={styles.errorText}>{errors.branchName}</Text>}
            </View>

          </ScrollView>
        </SafeAreaView>
      </Modal>
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
  content: { padding: 16, paddingBottom: 40 },
  emptyState: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  emptyStateTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', marginBottom: 8 },
  emptyStateSubtitle: { fontSize: 14, color: '#9CA3AF', textAlign: 'center', lineHeight: 20 },
  accountsList: { gap: 16 },
  accountCard: { backgroundColor: '#1A1A1A', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#2A2A2A', shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  accountHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  accountInfo: { flex: 1 },
  bankName: { fontSize: 18, color: '#FFFFFF', fontWeight: '600', marginBottom: 4 },
  accountNumber: { fontSize: 16, color: '#D4AF37', fontWeight: '500', marginBottom: 4 },
  accountHolder: { fontSize: 14, color: '#9CA3AF' },
  primaryBadge: { backgroundColor: '#059669', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  primaryBadgeText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  accountDetails: { marginBottom: 16, gap: 8 },
  detailLabel: { fontSize: 12, color: '#9CA3AF', fontWeight: '500' },
  detailValue: { fontSize: 14, color: '#FFFFFF', fontWeight: '500' },
  accountActions: { flexDirection: 'row', gap: 8 },
  primaryButton: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flex: 1 },
  primaryButtonText: { fontSize: 12, color: '#000000', fontWeight: '600', textAlign: 'center' },
  editButton: { backgroundColor: '#D4AF37', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flex: 1 },
  editButtonText: { fontSize: 12, color: '#000000', fontWeight: '600', textAlign: 'center' },
  deleteButton: { backgroundColor: '#DC2626', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 6, flex: 1 },
  deleteButtonText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600', textAlign: 'center' },
  addButton: { backgroundColor: '#D4AF37', borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginTop: 16, shadowColor: '#000000', shadowOpacity: 0.25, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  addButtonText: { fontSize: 16, color: '#000000', fontWeight: '600' },
  modalContainer: { flex: 1, backgroundColor: '#000000' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  modalCloseButton: { paddingVertical: 8 },
  modalCloseText: { fontSize: 16, color: '#9CA3AF' },
  modalTitle: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
  modalSaveButton: { backgroundColor: '#D4AF37', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6 },
  modalSaveText: { fontSize: 16, color: '#000000', fontWeight: '600' },
  modalContent: { flex: 1, padding: 20 },
  formGroup: { marginBottom: 20 },
  formLabel: { fontSize: 14, color: '#FFFFFF', fontWeight: '500', marginBottom: 8 },
  formInput: { backgroundColor: '#1A1A1A', borderRadius: 8, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#FFFFFF', borderWidth: 1, borderColor: '#2A2A2A' },
  formInputError: { borderColor: '#DC2626' },
  errorText: { fontSize: 12, color: '#DC2626', marginTop: 4 },
});

export default BankAccountManagement;