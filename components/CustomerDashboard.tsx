import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TruckIcon, MapPinIcon, UserIcon, ArrowLeftIcon } from 'react-native-heroicons/outline';

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: 'customer' | 'admin' | 'driver';
  createdAt: string;
};

type Props = {
  onBack: () => void;
  onNavigate: (screen: 'bookTanker' | 'trackTanker' | 'profile') => void;
  currentUser: User | null;
  onLogout: () => void;
};

const CustomerDashboard = ({ onBack, onNavigate, currentUser, onLogout }: Props): React.ReactElement => {
  // Component updated to include onLogout prop
  const [selectedButton, setSelectedButton] = useState<'bookTanker' | 'trackTanker' | 'profile' | null>(null);
  const [buttonAnimations] = useState({
    bookTanker: new Animated.Value(0),
    trackTanker: new Animated.Value(0),
    profile: new Animated.Value(0),
  });

  const handleButtonPress = (buttonType: 'bookTanker' | 'trackTanker' | 'profile'): void => {
    if (selectedButton === buttonType) return;

    setSelectedButton(buttonType);

    Animated.sequence([
      Animated.timing(buttonAnimations[buttonType], { toValue: 1, duration: 150, useNativeDriver: true }),
      Animated.timing(buttonAnimations[buttonType], { toValue: 0, duration: 150, useNativeDriver: true }),
    ]).start();

    setTimeout(() => {
      onNavigate(buttonType);
    }, 200);
  };

  const dashboardButtons = [
    { id: 'bookTanker', title: 'Book Tanker', subtitle: 'Schedule a water tanker delivery', icon: TruckIcon, color: '#D4AF37' },
    { id: 'trackTanker', title: 'Track Tanker', subtitle: 'Monitor your delivery status', icon: MapPinIcon, color: '#1E3A8A' },
    { id: 'profile', title: 'Profile', subtitle: 'Manage your account settings', icon: UserIcon, color: '#059669' },
  ] as const;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
          <ArrowLeftIcon size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Customer Dashboard</Text>
          <Text style={styles.headerSubtitle}>
            Welcome back, {currentUser?.name || 'User'}!
          </Text>
        </View>
      </View>

      {/* Dashboard Buttons */}
      <View style={styles.buttonsContainer}>
        {dashboardButtons.map((button) => {
          const IconComponent = button.icon;
          const scaleValue = buttonAnimations[button.id].interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

          return (
            <Animated.View key={button.id} style={[styles.buttonWrapper, { transform: [{ scale: scaleValue }] }]}>
              <TouchableOpacity style={[styles.dashboardButton, { borderLeftColor: button.color }]} onPress={() => handleButtonPress(button.id)} activeOpacity={0.8}>
                <View style={styles.buttonContent}>
                  <View style={[styles.buttonIcon, { backgroundColor: button.color }]}>
                    <IconComponent size={28} color="#FFFFFF" />
                  </View>
                  <View style={styles.buttonTextContainer}>
                    <Text style={styles.buttonTitle}>{button.title}</Text>
                    <Text style={styles.buttonSubtitle}>{button.subtitle}</Text>
                  </View>
                  <View style={styles.buttonArrow}>
                    <Text style={styles.arrowText}>›</Text>
                  </View>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>

      {/* Footer Info */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Choose an option to get started with your water tanker service</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000000' },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: '#1A1A1A', borderBottomWidth: 1, borderBottomColor: '#2A2A2A' },
  backButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  headerCenter: { flex: 1, alignItems: 'center' },
  headerTitle: { fontSize: 20, fontWeight: '600', color: '#FFFFFF', marginBottom: 2 },
  headerSubtitle: { fontSize: 14, color: '#9CA3AF' },
  buttonsContainer: { flex: 1, paddingHorizontal: 20, paddingTop: 32, gap: 16 },
  buttonWrapper: { marginBottom: 4 },
  dashboardButton: { backgroundColor: '#1A1A1A', borderRadius: 12, borderLeftWidth: 4, padding: 20, shadowColor: '#000000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 8, elevation: 8 },
  buttonContent: { flexDirection: 'row', alignItems: 'center' },
  buttonIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  buttonTextContainer: { flex: 1 },
  buttonTitle: { fontSize: 18, fontWeight: '600', color: '#FFFFFF', marginBottom: 4 },
  buttonSubtitle: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },
  buttonArrow: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2A2A2A', justifyContent: 'center', alignItems: 'center' },
  arrowText: { fontSize: 18, color: '#FFFFFF', fontWeight: '600' },
  footer: { paddingHorizontal: 20, paddingVertical: 24, alignItems: 'center' },
  footerText: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20 },
});

export default CustomerDashboard;
