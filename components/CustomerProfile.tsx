import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, UserIcon, PhoneIcon, MapPinIcon, ClipboardDocumentListIcon, PencilIcon, CheckIcon, XMarkIcon } from 'react-native-heroicons/outline';

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
  address?: string;
};

type Order = {
  id: string;
  bookingId: string;
  userId: string;
  name: string;
  address: string;
  date: string;
  time: string;
  amount: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'in-transit' | 'delivered' | 'cancelled';
  tankerSize: '10k' | '20k';
  agency: string;
  comments?: string;
  createdAt: string;
};

type Props = {
  onBack: () => void;
  currentUser: User | null;
  onLogout: () => void;
  orders?: Order[];
  onUpdateProfile?: (updatedUser: Partial<User>) => void;
  onNavigate?: (screen: 'personalInformation' | 'orderHistory') => void;
};

const CustomerProfile = ({ onBack, currentUser, onLogout, orders = [], onUpdateProfile, onNavigate }: Props): React.ReactElement => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(currentUser?.name || '');
  const [editPhone, setEditPhone] = useState(currentUser?.phoneNumber || '');
  const [editAddress, setEditAddress] = useState(currentUser?.address || '');

  // Calculate statistics
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOrders = orders.filter(order => order.status === 'delivered').length;

  const handleSaveProfile = () => {
    if (!editName.trim() || !editPhone.trim()) {
      Alert.alert('Error', 'Name and phone number are required');
      return;
    }

    if (onUpdateProfile) {
      onUpdateProfile({
        name: editName.trim(),
        phoneNumber: editPhone.trim(),
        address: editAddress.trim(),
      });
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(currentUser?.name || '');
    setEditPhone(currentUser?.phoneNumber || '');
    setEditAddress(currentUser?.address || '');
    setIsEditing(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 2);
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity style={styles.logoutButton} onPress={onLogout} activeOpacity={0.7}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Customer Information Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{getInitials(currentUser?.name || 'User')}</Text>
            </View>
          </View>
          
          <View style={styles.userInfo}>
            {isEditing ? (
              <View style={styles.editContainer}>
                <TextInput
                  style={styles.editInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Enter name"
                  placeholderTextColor="#6B7280"
                />
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile} activeOpacity={0.7}>
                    <CheckIcon size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelButton} onPress={handleCancelEdit} activeOpacity={0.7}>
                    <XMarkIcon size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.nameContainer}>
                <Text style={styles.userName}>{currentUser?.name || 'Demo Customer'}</Text>
                <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)} activeOpacity={0.7}>
                  <PencilIcon size={16} color="#D4AF37" />
                </TouchableOpacity>
              </View>
            )}
            
            <Text style={styles.userId}>{currentUser?.phoneNumber || '9876543210'}</Text>
            <Text style={styles.userRole}>Customer</Text>
          </View>
        </View>

        {/* Statistics Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalOrders}</Text>
            <Text style={styles.statLabel}>Total Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{formatCurrency(totalSpent)}</Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
        </View>

        {/* Contact Information Card */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Contact Information</Text>
          
          <View style={styles.contactItem}>
            <PhoneIcon size={20} color="#1E3A8A" />
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Phone:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.editContactInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="Enter phone number"
                  placeholderTextColor="#6B7280"
                  keyboardType="phone-pad"
                />
              ) : (
                <Text style={styles.contactValue}>{currentUser?.phoneNumber || '9876543210'}</Text>
              )}
            </View>
          </View>

          <View style={styles.contactItem}>
            <MapPinIcon size={20} color="#DC2626" />
            <View style={styles.contactDetails}>
              <Text style={styles.contactLabel}>Address:</Text>
              {isEditing ? (
                <TextInput
                  style={[styles.editContactInput, { height: 60, textAlignVertical: 'top' }]}
                  value={editAddress}
                  onChangeText={setEditAddress}
                  placeholder="Enter address"
                  placeholderTextColor="#6B7280"
                  multiline
                />
              ) : (
                <Text style={styles.contactValue}>{currentUser?.address || '123 Main St, New Delhi'}</Text>
              )}
            </View>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Account</Text>
          
          <TouchableOpacity 
            style={styles.accountItem} 
            activeOpacity={0.7}
            onPress={() => onNavigate?.('personalInformation')}
          >
            <UserIcon size={20} color="#1E3A8A" />
            <Text style={styles.accountItemText}>Personal Information</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.accountItem} 
            activeOpacity={0.7}
            onPress={() => onNavigate?.('orderHistory')}
          >
            <ClipboardDocumentListIcon size={20} color="#D97706" />
            <Text style={styles.accountItemText}>Order History</Text>
            <Text style={styles.arrowText}>›</Text>
          </TouchableOpacity>
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
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#DC2626',
    borderRadius: 6,
  },
  logoutText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  profileCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#1E3A8A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '700',
  },
  userInfo: {
    alignItems: 'center',
    width: '100%',
  },
  nameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginRight: 8,
  },
  editButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editContainer: {
    width: '100%',
    marginBottom: 8,
  },
  editInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  saveButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userId: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#f5f5f5',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  infoCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  contactDetails: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 16,
    color: '#FFFFFF',
    lineHeight: 22,
  },
  editContactInput: {
    backgroundColor: '#2A2A2A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    fontSize: 16,
    color: '#FFFFFF',
  },
  accountItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A2A',
  },
  accountItemText: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
    marginLeft: 12,
  },
  arrowText: {
    fontSize: 18,
    color: '#6B7280',
    fontWeight: '600',
  },
});

export default CustomerProfile;
