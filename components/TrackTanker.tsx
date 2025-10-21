import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeftIcon, FunnelIcon, Bars3Icon } from 'react-native-heroicons/outline';

type Props = {
  onBack: () => void;
  onReorder?: (order: Order) => void;
  orders: Order[];
  currentUser: User | null;
  onUpdateOrders: (orders: Order[]) => void;
};

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
};

type OrderStatus = 'delivered' | 'cancelled' | 'pending' | 'confirmed' | 'in-transit';

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
  status: OrderStatus;
  tankerSize: '10k' | '20k';
  agency: string;
  comments?: string;
  createdAt: string;
};

type FilterOption = 'all' | OrderStatus;

type SortOption = 'newest-first' | 'oldest-first' | 'amount-high-to-low' | 'amount-low-to-high';

const TrackTanker = ({ onBack, onReorder, orders, currentUser, onUpdateOrders }: Props): React.ReactElement => {
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<FilterOption>('all');
  const [selectedSort, setSelectedSort] = useState<SortOption>('newest-first');

  const filterOptions: { key: FilterOption; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: orders.length },
    { key: 'delivered', label: 'Delivered', count: orders.filter(o => o.status === 'delivered').length },
    { key: 'cancelled', label: 'Cancelled', count: orders.filter(o => o.status === 'cancelled').length },
    { key: 'pending', label: 'Pending', count: orders.filter(o => o.status === 'pending').length },
    { key: 'confirmed', label: 'Confirmed', count: orders.filter(o => o.status === 'confirmed').length },
    { key: 'in-transit', label: 'In Transit', count: orders.filter(o => o.status === 'in-transit').length },
  ];

  const sortOptions: { key: SortOption; label: string }[] = [
    { key: 'newest-first', label: 'Newest First' },
    { key: 'oldest-first', label: 'Oldest First' },
    { key: 'amount-high-to-low', label: 'Amount: High to Low' },
    { key: 'amount-low-to-high', label: 'Amount: Low to High' },
  ];

  const getFilteredAndSortedOrders = (): Order[] => {
    let filtered = orders;

    // Apply filter
    if (selectedFilter !== 'all') {
      filtered = orders.filter(order => order.status === selectedFilter);
    }

    // Apply sort
    const sorted = [...filtered].sort((a, b) => {
      switch (selectedSort) {
        case 'newest-first':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'oldest-first':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'amount-high-to-low':
          return b.amount - a.amount;
        case 'amount-low-to-high':
          return a.amount - b.amount;
        default:
          return 0;
      }
    });

    return sorted;
  };

  const getStatusColor = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered': return '#059669';
      case 'cancelled': return '#DC2626';
      case 'pending': return '#D97706';
      case 'confirmed': return '#1E3A8A';
      case 'in-transit': return '#7C3AED';
      default: return '#6B7280';
    }
  };

  const getStatusLabel = (status: OrderStatus): string => {
    switch (status) {
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'in-transit': return 'In Transit';
      default: return 'Unknown';
    }
  };

  const filteredOrders = getFilteredAndSortedOrders();

  const handleReorder = (order: Order): void => {
    if (onReorder) {
      onReorder(order);
    }
  };

  const handleDelete = (orderId: string): void => {
    const updatedOrders = orders.filter(order => order.id !== orderId);
    onUpdateOrders(updatedOrders);
  };


  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order History</Text>
        <View style={{ width: 40 }} />
      </View>


      {/* Filter and Sort Buttons */}
      <View style={styles.actionButtonsContainer}>
        <TouchableOpacity 
          style={styles.filterButton} 
          onPress={() => setShowFilterModal(true)}
          activeOpacity={0.8}
        >
          <FunnelIcon size={16} color="#FFFFFF" />
          <Text style={styles.filterButtonText}>Filter ({filterOptions.find(f => f.key === selectedFilter)?.count || 0})</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.sortButton} 
          onPress={() => setShowSortModal(true)}
          activeOpacity={0.8}
        >
          <Bars3Icon size={16} color="#FFFFFF" />
          <Text style={styles.sortButtonText}>Sort</Text>
        </TouchableOpacity>
      </View>

      {/* Order Count */}
      <Text style={styles.orderCountText}>Showing {filteredOrders.length} of {orders.length} orders</Text>

      {/* Orders List */}
      <ScrollView style={styles.ordersContainer} showsVerticalScrollIndicator={false}>
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>No orders found</Text>
            <Text style={styles.emptyStateSubtitle}>Your order history will appear here</Text>
          </View>
        ) : (
          filteredOrders.map((order) => (
            <View key={order.id} style={styles.orderCard}>
              <View style={styles.orderHeader}>
                <Text style={styles.bookingId}>{order.bookingId}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
                  <Text style={styles.statusText}>{getStatusLabel(order.status)}</Text>
                </View>
              </View>
              
              {/* Agency Name */}
              <View style={styles.agencyRow}>
                <Text style={styles.agencyLabel}>Agency:</Text>
                <Text style={styles.agencyName}>{order.agency}</Text>
              </View>
              
              {/* Date and Time */}
              <View style={styles.dateTimeRow}>
                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>Date:</Text>
                  <Text style={styles.dateTimeValue}>
                    {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}
                  </Text>
                </View>
                <View style={styles.dateTimeItem}>
                  <Text style={styles.dateTimeLabel}>Time:</Text>
                  <Text style={styles.dateTimeValue}>
                    {order.time ? new Date(order.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                  </Text>
                </View>
              </View>
              
              {/* Quantity and Price */}
              <View style={styles.quantityPriceRow}>
                <View style={styles.quantityItem}>
                  <Text style={styles.quantityLabel}>Quantity:</Text>
                  <Text style={styles.quantityValue}>{order.tankerSize}L</Text>
                </View>
                <View style={styles.priceItem}>
                  <Text style={styles.priceLabel}>Price:</Text>
                  <Text style={styles.priceValue}>₹{order.totalAmount.toLocaleString()}</Text>
                </View>
              </View>
              
              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  style={styles.reorderButton} 
                  onPress={() => handleReorder(order)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.reorderButtonText}>Reorder</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton} 
                  onPress={() => handleDelete(order.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>


      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Filter Orders</Text>
            
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  selectedFilter === option.key && styles.filterOptionSelected
                ]}
                onPress={() => {
                  setSelectedFilter(option.key);
                  setShowFilterModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.filterOptionText,
                  selectedFilter === option.key && styles.filterOptionTextSelected
                ]}>
                  {option.label} ({option.count})
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowFilterModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal
        visible={showSortModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowSortModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Sort Orders</Text>
            
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.sortOption,
                  selectedSort === option.key && styles.sortOptionSelected
                ]}
                onPress={() => {
                  setSelectedSort(option.key);
                  setShowSortModal(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.sortOptionText,
                  selectedSort === option.key && styles.sortOptionTextSelected
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowSortModal(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2A2A2A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E3A8A',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginRight: 6,
    gap: 6,
  },
  filterButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  sortButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginLeft: 6,
    gap: 6,
  },
  sortButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  orderCountText: {
    fontSize: 14,
    color: '#9CA3AF',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  ordersContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#9CA3AF',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#2A2A2A',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  agencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  agencyLabel: {
    fontSize: 14,
    color: '#9CA3AF',
    marginRight: 8,
  },
  agencyName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  dateTimeItem: {
    flex: 1,
  },
  dateTimeLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  dateTimeValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  quantityPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  quantityItem: {
    flex: 1,
  },
  quantityLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  quantityValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  priceItem: {
    flex: 1,
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#D4AF37',
  },
  orderAddress: {
    fontSize: 14,
    color: '#9CA3AF',
    marginBottom: 12,
    fontStyle: 'italic',
  },
  actionButtons: {
    flexDirection: 'row',
    marginTop: 12,
    gap: 8,
  },
  reorderButton: {
    flex: 1,
    backgroundColor: '#D4AF37',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  reorderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    margin: 20,
    minWidth: 280,
    borderWidth: 1,
    borderColor: '#2A2A2A',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  filterOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#2A2A2A',
  },
  filterOptionSelected: {
    backgroundColor: '#1E3A8A',
  },
  filterOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  filterOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sortOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: '#2A2A2A',
  },
  sortOptionSelected: {
    backgroundColor: '#1E3A8A',
  },
  sortOptionText: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  sortOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  closeButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 8,
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default TrackTanker;
