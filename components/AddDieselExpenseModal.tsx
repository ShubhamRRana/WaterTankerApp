import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  ScrollView,
  Dimensions,
} from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSave: (expenseData: {
    vehicleNumber: string;
    amount: string;
    quantity: string;
    location: string;
    notes?: string;
  }) => void;
};

const AddDieselExpenseModal = ({ visible, onClose, onSave }: Props) => {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [quantity, setQuantity] = useState('');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');
  const [showVehicleDropdown, setShowVehicleDropdown] = useState(false);

  // Sample vehicle data - in a real app, this would come from props or API
  const vehicles = [
    { id: '1', number: 'DL-01-AB-1234' },
    { id: '2', number: 'DL-02-CD-5678' },
    { id: '3', number: 'DL-03-EF-9012' },
  ];

  const handleSave = () => {
    if (!vehicleNumber || !amount || !quantity || !location) {
      return;
    }

    onSave({
      vehicleNumber,
      amount,
      quantity,
      location,
      notes: notes || undefined,
    });

    // Reset form
    setVehicleNumber('');
    setAmount('');
    setQuantity('');
    setLocation('');
    setNotes('');
    onClose();
  };

  const handleCancel = () => {
    // Reset form
    setVehicleNumber('');
    setAmount('');
    setQuantity('');
    setLocation('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Add Diesel Expense</Text>
          
          <ScrollView style={styles.formContainer} showsVerticalScrollIndicator={false}>
            {/* Vehicle Number */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Vehicle Number *</Text>
              <TouchableOpacity
                style={styles.dropdownContainer}
                onPress={() => setShowVehicleDropdown(!showVehicleDropdown)}
                activeOpacity={0.7}
              >
                <Text style={[styles.dropdownText, !vehicleNumber && styles.placeholderText]}>
                  {vehicleNumber || 'Select Vehicle'}
                </Text>
                <Text style={styles.dropdownArrow}>▼</Text>
              </TouchableOpacity>
              
              {showVehicleDropdown && (
                <View style={styles.dropdownList}>
                  {vehicles.map((vehicle) => (
                    <TouchableOpacity
                      key={vehicle.id}
                      style={styles.dropdownItem}
                      onPress={() => {
                        setVehicleNumber(vehicle.number);
                        setShowVehicleDropdown(false);
                      }}
                    >
                      <Text style={styles.dropdownItemText}>{vehicle.number}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Amount */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Amount (₹) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter amount"
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Quantity */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Quantity (Liters) *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter quantity"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Location */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Location *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter location"
                value={location}
                onChangeText={setLocation}
                placeholderTextColor="#9CA3AF"
              />
            </View>

            {/* Notes */}
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Notes (Optional)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter notes"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                placeholderTextColor="#9CA3AF"
              />
            </View>
          </ScrollView>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.saveButton}
              onPress={handleSave}
              activeOpacity={0.7}
            >
              <Text style={styles.saveButtonText}>Save Expense</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#374151',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: Dimensions.get('window').height * 0.8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
  },
  formContainer: {
    maxHeight: Dimensions.get('window').height * 0.5,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  dropdownContainer: {
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#9CA3AF',
  },
  dropdownArrow: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  dropdownList: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
    borderRadius: 8,
    marginTop: 4,
    zIndex: 1000,
    elevation: 5,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  dropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#6B7280',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#4B5563',
    borderWidth: 1,
    borderColor: '#6B7280',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
});

export default AddDieselExpenseModal;
