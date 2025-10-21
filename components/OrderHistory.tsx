import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, CalendarIcon, ClockIcon, MapPinIcon, TruckIcon, CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon, ArrowDownTrayIcon } from 'react-native-heroicons/outline';
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
  orders: Order[];
  onReorder?: (order: {
    address: string;
    tankerSize: string;
    agency: string;
  }) => void;
};

const OrderHistory = ({ onBack, currentUser, orders, onReorder }: Props): React.ReactElement => {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth(); // 0-based index

  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // Generate years array (last 6 years including current year)
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Generate months array
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];

  // Filter orders by selected year and month, then sort by date (newest first)
  const filteredOrders = orders
    .filter(order => {
      const orderDate = new Date(order.date);
      const orderYear = orderDate.getFullYear();
      const orderMonth = orderDate.getMonth();
      return orderYear === selectedYear && orderMonth === selectedMonth;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate completed orders and total revenue for the selected month
  const completedOrders = filteredOrders.filter(order => order.status === 'delivered');
  const totalCompletedOrders = completedOrders.length;
  const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircleIcon size={20} color="#059669" />;
      case 'cancelled':
        return <XCircleIcon size={20} color="#DC2626" />;
      case 'pending':
        return <ClockIcon size={20} color="#D97706" />;
      case 'confirmed':
      case 'in-transit':
        return <ExclamationTriangleIcon size={20} color="#1E3A8A" />;
      default:
        return <ClockIcon size={20} color="#6B7280" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return '#059669';
      case 'cancelled':
        return '#DC2626';
      case 'pending':
        return '#D97706';
      case 'confirmed':
      case 'in-transit':
        return '#1E3A8A';
      default:
        return '#6B7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      case 'confirmed':
        return 'Confirmed';
      case 'delivered':
        return 'Delivered';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const handleReorder = (order: Order) => {
    if (onReorder) {
      onReorder({
        address: order.address,
        tankerSize: order.tankerSize,
        agency: order.agency,
      });
    }
  };

  const handleExportToExcel = async (): Promise<void> => {
    try {
      // Prepare CSV data
      const csvHeaders = 'S.No,Booking ID,Date,Time,Status,Agency,Tanker Size,Amount (₹),Address\n';
      const csvRows = filteredOrders.map((order, index) => {
        return [
          index + 1,
          order.bookingId,
          order.date ? new Date(order.date).toLocaleDateString() : 'N/A',
          order.time ? new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
          getStatusText(order.status),
          order.agency,
          order.tankerSize,
          order.totalAmount,
          `"${order.address}"` // Wrap address in quotes to handle commas
        ].join(',');
      }).join('\n');
      
      const csvContent = csvHeaders + csvRows;

      // Create filename with unique timestamp (including milliseconds)
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `Order_History_${timestamp}.csv`;
      
      // Create file using new Expo FileSystem API
      const file = new File(Paths.cache, filename);
      await file.create();
      await file.write(csvContent);

      // Check if sharing is available
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Order History',
        });
        
        Alert.alert(
          'Export Successful',
          'Order history has been exported and is ready to share.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Export Complete',
          `Order history has been saved as ${filename}.`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert(
        'Export Failed',
        'Failed to export order history. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Year Selector */}
        <View style={styles.yearSelectorContainer}>
          <Text style={styles.sectionTitle}>Select Year</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.yearScrollContainer}
          >
            {years.map((year) => (
              <TouchableOpacity
                key={year}
                style={[
                  styles.yearButton,
                  selectedYear === year && styles.yearButtonSelected
                ]}
                onPress={() => setSelectedYear(year)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.yearButtonText,
                  selectedYear === year && styles.yearButtonTextSelected
                ]}>
                  {year}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Month Selector */}
        <View style={styles.monthSelectorContainer}>
          <Text style={styles.sectionTitle}>Select Month</Text>
          <ScrollView 
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.monthScrollContainer}
          >
            {months.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthButton,
                  selectedMonth === index && styles.monthButtonSelected
                ]}
                onPress={() => setSelectedMonth(index)}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.monthButtonText,
                  selectedMonth === index && styles.monthButtonTextSelected
                ]}>
                  {month}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Monthly Summary */}
        <View style={styles.summaryContainer}>
          <Text style={styles.sectionTitle}>Monthly Summary</Text>
          <View style={styles.summaryCards}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{totalCompletedOrders}</Text>
              <Text style={styles.summaryLabel}>Completed Orders</Text>
            </View>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryNumber}>{formatCurrency(totalRevenue)}</Text>
              <Text style={styles.summaryLabel}>Total Revenue</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        <View style={styles.ordersContainer}>
          <View style={styles.ordersHeader}>
            <Text style={styles.sectionTitle}>
              Orders ({filteredOrders.length})
            </Text>
            {filteredOrders.length > 0 && (
              <TouchableOpacity 
                style={styles.exportButton} 
                onPress={handleExportToExcel}
                activeOpacity={0.8}
              >
                <ArrowDownTrayIcon size={16} color="#FFFFFF" />
                <Text style={styles.exportButtonText}>Export</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {filteredOrders.length === 0 ? (
            <View style={styles.emptyState}>
              <CalendarIcon size={48} color="#6B7280" />
              <Text style={styles.emptyStateTitle}>No Orders Found</Text>
              <Text style={styles.emptyStateText}>
                No orders found for {months[selectedMonth]} {selectedYear}
              </Text>
            </View>
          ) : (
            filteredOrders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View style={styles.orderIdContainer}>
                    <Text style={styles.agencyName}>{order.agency}</Text>
                    <Text style={styles.orderDate}>{formatDate(order.date)}</Text>
                  </View>
                  <View style={styles.statusContainer}>
                    {getStatusIcon(order.status)}
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(order.status) }
                    ]}>
                      {getStatusText(order.status)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderDetails}>
                  <View style={styles.detailRow}>
                    <MapPinIcon size={16} color="#6B7280" />
                    <Text style={styles.detailText}>{order.address}</Text>
                  </View>
                  
                  <View style={styles.detailRow}>
                    <TruckIcon size={16} color="#6B7280" />
                    <Text style={styles.detailText}>
                      {order.tankerSize} Tanker • {formatCurrency(order.totalAmount)}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderFooter}>
                  <Text style={styles.orderAmount}>
                    {formatCurrency(order.totalAmount)}
                  </Text>
                  
                  {order.status === 'delivered' && (
                    <TouchableOpacity
                      style={styles.reorderButton}
                      onPress={() => handleReorder(order)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.reorderButtonText}>Reorder</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )}
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
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  yearSelectorContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  yearScrollContainer: {
    paddingHorizontal: 4,
  },
  yearButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  yearButtonSelected: {
    backgroundColor: '#D4AF37',
    borderColor: '#D4AF37',
  },
  yearButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  yearButtonTextSelected: {
    color: '#000000',
    fontWeight: '600',
  },
  monthSelectorContainer: {
    marginBottom: 24,
  },
  monthScrollContainer: {
    paddingHorizontal: 4,
  },
  monthButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  monthButtonSelected: {
    backgroundColor: '#1E3A8A',
    borderColor: '#1E3A8A',
  },
  monthButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  monthButtonTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  summaryContainer: {
    marginBottom: 24,
  },
  summaryCards: {
    flexDirection: 'row',
    gap: 12,
  },
  summaryCard: {
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
  summaryNumber: {
    fontSize: 24,
    fontWeight: '700',
    color: '#D4AF37',
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  ordersContainer: {
    marginBottom: 24,
  },
  ordersHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 4,
  },
  exportButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
    paddingHorizontal: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderIdContainer: {
    flex: 1,
  },
  agencyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#D4AF37',
    marginBottom: 2
  },
  orderId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  orderDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#9CA3AF',
    flex: 1,
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A2A2A',
  },
  orderAmount: {
    fontSize: 18,
    fontWeight: '700',
    color: '#D4AF37',
  },
  reorderButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1E3A8A',
    borderRadius: 6,
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default OrderHistory;
