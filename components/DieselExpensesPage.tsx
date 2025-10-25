import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon } from 'react-native-heroicons/outline';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AddDieselExpenseModal from './AddDieselExpenseModal';

type Props = {
  onBack: () => void;
};

type DieselExpense = {
  id: string;
  vehicleNumber: string;
  amount: string;
  quantity: string;
  location: string;
  notes?: string;
  date: string;
  month: string;
  year: string;
};


const DieselExpensesPage = ({ onBack }: Props) => {
  const [filterType, setFilterType] = useState<'month' | 'year'>('month');
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [expenses, setExpenses] = useState<DieselExpense[]>([]);

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  const years = [2025, 2024, 2023, 2022, 2021];


  const handleSaveExpense = (expenseData: {
    vehicleNumber: string;
    amount: string;
    quantity: string;
    location: string;
    notes?: string;
  }) => {
    const newExpense: DieselExpense = {
      id: `EXP-${Date.now().toString(36).toUpperCase()}`,
      ...expenseData,
      date: new Date().toISOString(),
      month: months[selectedMonth],
      year: selectedYear.toString(),
    };
    
    setExpenses(prevExpenses => [...prevExpenses, newExpense]);
  };

  // Filter expenses by selected month and year
  const filteredExpenses = expenses.filter(expense => 
    expense.month === months[selectedMonth] && expense.year === selectedYear.toString()
  );

  // Calculate monthly summary
  const totalDieselFilled = filteredExpenses.reduce((total, expense) => 
    total + parseFloat(expense.quantity || '0'), 0
  );

  const totalAmount = filteredExpenses.reduce((total, expense) => 
    total + parseFloat(expense.amount || '0'), 0
  );

  const averagePricePerLiter = totalDieselFilled > 0 ? totalAmount / totalDieselFilled : 0;

  const getTotalAmountSpent = (): number => {
    return filteredExpenses.reduce((total, expense) => 
      total + parseFloat(expense.amount || '0'), 0
    );
  };

  const getTotalFillings = (): number => {
    return filteredExpenses.length;
  };

  const exportToExcel = async (): Promise<void> => {
    try {
      let csvContent = 'Vehicle Number,Amount,Quantity (L),Location,Notes,Date\n';
      
      filteredExpenses.forEach(expense => {
        csvContent += `${expense.vehicleNumber},${expense.amount},${expense.quantity},${expense.location},${expense.notes || ''},${new Date(expense.date).toLocaleDateString()}\n`;
      });

      const fileName = `diesel_expenses_${months[selectedMonth]}_${selectedYear}.csv`;
      const fileUri = `/tmp/${fileName}`;
      
      await FileSystem.writeAsStringAsync(fileUri, csvContent);
      
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      } else {
        Alert.alert('Export Complete', `File saved as ${fileName}`);
      }
    } catch (error) {
      Alert.alert('Export Failed', 'Unable to export data. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Diesel Expenses</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Title */}
        <View style={styles.titleSection}>
          <Text style={styles.mainTitle}>Diesel Expenses</Text>
          <Text style={styles.subtitle}>Track and analyze your fuel expenses</Text>
        </View>

        {/* Filter Toggle */}
        <View style={styles.filterSection}>
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, filterType === 'month' && styles.toggleSelected]}
              onPress={() => setFilterType('month')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, filterType === 'month' && styles.toggleTextSelected]}>
                Month
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, filterType === 'year' && styles.toggleSelected]}
              onPress={() => setFilterType('year')}
              activeOpacity={0.8}
            >
              <Text style={[styles.toggleText, filterType === 'year' && styles.toggleTextSelected]}>
                Year
              </Text>
            </TouchableOpacity>
          </View>

          {/* Month/Year Selection */}
          {filterType === 'month' ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
              {months.map((month, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.selectionButton, selectedMonth === index && styles.selectionSelected]}
                  onPress={() => setSelectedMonth(index)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectionText, selectedMonth === index && styles.selectionTextSelected]}>
                    {month}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.selectionRow}>
              {years.map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[styles.selectionButton, selectedYear === year && styles.selectionSelected]}
                  onPress={() => setSelectedYear(year)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.selectionText, selectedYear === year && styles.selectionTextSelected]}>
                    {year}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Summary Section */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>
            {filterType === 'month' ? 'Monthly Summary' : `Yearly Summary - ${selectedYear}`}
          </Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>₹{getTotalAmountSpent().toFixed(0)}</Text>
              <Text style={styles.summaryLabel}>Total Amount Spent</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryValue}>{getTotalFillings()}</Text>
              <Text style={styles.summaryLabel}>Total Fillings</Text>
            </View>
          </View>
        </View>

        {/* Diesel Expenses List */}
        <View style={styles.tableSection}>
          <Text style={styles.sectionTitle}>Diesel Expenses ({filteredExpenses.length})</Text>
          {filteredExpenses.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                No diesel expenses found for {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
          ) : (
            <View style={styles.expensesList}>
              {filteredExpenses.map((expense) => (
                <View key={expense.id} style={styles.expenseItem}>
                  <View style={styles.expenseHeader}>
                    <Text style={styles.expenseVehicle}>{expense.vehicleNumber}</Text>
                    <Text style={styles.expenseAmount}>₹{parseFloat(expense.amount).toFixed(0)}</Text>
                  </View>
                  <View style={styles.expenseDetails}>
                    <Text style={styles.expenseQuantity}>{expense.quantity}L</Text>
                    <Text style={styles.expenseLocation}>{expense.location}</Text>
                  </View>
                  {expense.notes && (
                    <Text style={styles.expenseNotes}>{expense.notes}</Text>
                  )}
                  <Text style={styles.expenseDate}>
                    {new Date(expense.date).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Export Button */}
        <TouchableOpacity style={styles.exportButton} onPress={exportToExcel} activeOpacity={0.8}>
          <Text style={styles.exportButtonText}>Export to Excel</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Diesel Expense Button - Fixed at bottom */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.addExpenseButton}
          onPress={() => setShowAddExpenseModal(true)}
          activeOpacity={0.8}
        >
          <Text style={styles.addExpenseButtonText}>Add Diesel Expense</Text>
        </TouchableOpacity>
      </View>

      <AddDieselExpenseModal
        visible={showAddExpenseModal}
        onClose={() => setShowAddExpenseModal(false)}
        onSave={handleSaveExpense}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 20, 
    paddingVertical: 16, 
    backgroundColor: '#1A1A1A',
    borderBottomWidth: 1, 
    borderBottomColor: '#2A2A2A' 
  },
  backButton: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    backgroundColor: '#2A2A2A', 
    justifyContent: 'center', 
    alignItems: 'center' 
  },
  headerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#FFFFFF', 
    fontSize: 20, 
    fontWeight: '700' 
  },
  content: { padding: 16, paddingBottom: 40 },
  titleSection: { alignItems: 'center', marginBottom: 24 },
  mainTitle: { 
    fontSize: 32, 
    color: '#D4AF37', 
    fontWeight: '700', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 16, 
    color: '#9CA3AF', 
    textAlign: 'center' 
  },
  filterSection: { marginBottom: 24 },
  toggleContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#1A1A1A', 
    borderRadius: 8, 
    padding: 4, 
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  toggleButton: { 
    flex: 1, 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 6, 
    alignItems: 'center' 
  },
  toggleSelected: { 
    backgroundColor: '#D4AF37' 
  },
  toggleText: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#9CA3AF' 
  },
  toggleTextSelected: { 
    color: '#000000' 
  },
  selectionRow: { 
    flexDirection: 'row' 
  },
  selectionButton: { 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 10, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  selectionSelected: { 
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37'
  },
  selectionText: { 
    fontSize: 14, 
    fontWeight: '500', 
    color: '#9CA3AF' 
  },
  selectionTextSelected: { 
    color: '#000000' 
  },
  summarySection: { marginBottom: 24 },
  summaryTitle: { 
    fontSize: 18, 
    color: '#FFFFFF', 
    fontWeight: '700', 
    textAlign: 'center', 
    marginBottom: 16 
  },
  summaryCards: { 
    flexDirection: 'row', 
    justifyContent: 'space-between' 
  },
  summaryCard: { 
    flex: 1, 
    backgroundColor: '#1A1A1A', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4
  },
  summaryValue: { 
    fontSize: 24, 
    color: '#D4AF37', 
    fontWeight: '700', 
    marginBottom: 4 
  },
  summaryLabel: { 
    fontSize: 14, 
    color: '#9CA3AF', 
    fontWeight: '500' 
  },
  tableSection: { marginBottom: 24 },
  tableHeader: { 
    flexDirection: 'row', 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  tableHeaderText: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: '600', 
    color: '#FFFFFF' 
  },
  tableRow: { 
    flexDirection: 'row', 
    backgroundColor: '#1A1A1A', 
    paddingVertical: 12, 
    paddingHorizontal: 16, 
    borderRadius: 8, 
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#2A2A2A'
  },
  tableRowLabel: { 
    flex: 1, 
    fontSize: 16, 
    color: '#D4AF37', 
    fontWeight: '600' 
  },
  tableRowValue: { 
    flex: 1, 
    fontSize: 16, 
    color: '#FFFFFF', 
    textAlign: 'center' 
  },
  exportButton: { 
    backgroundColor: '#D4AF37', 
    paddingVertical: 16, 
    paddingHorizontal: 24, 
    borderRadius: 8, 
    alignItems: 'center',
    marginTop: 16
  },
  exportButtonText: { 
    color: '#000000', 
    fontSize: 16, 
    fontWeight: '700' 
  },
  bottomButtonContainer: {
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 4,
  },
  addExpenseButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  addExpenseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#FFFFFF',
    fontWeight: '700',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  expensesList: {
    marginTop: 8,
  },
  expenseItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  expenseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  expenseVehicle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  expenseAmount: {
    fontSize: 16,
    fontWeight: '700',
    color: '#059669',
  },
  expenseDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  expenseQuantity: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  expenseLocation: {
    fontSize: 14,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  expenseNotes: {
    fontSize: 14,
    color: '#FFFFFF',
    fontStyle: 'italic',
    marginBottom: 8,
  },
  expenseDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default DieselExpensesPage;
