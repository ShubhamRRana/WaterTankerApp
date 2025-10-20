import React, { useState, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RoleSelection from './RoleSelection';
import CustomerLogin from './CustomerLogin';
import CustomerRegistration from './CustomerRegistration';
import AdminLogin from './AdminLogin';
import AdminRegistration from './AdminRegistration';
import DriverLogin from './DriverLogin';
import CustomerDashboard from './CustomerDashboard';
import BookTanker from './BookTanker';
import OwnerDashboard from './OwnerDashboard';
import FleetManagement from './FleetManagement';
import AddVehicle from './AddVehicle';
import DriversManagement from './DriversManagement';

export type RoleId = 'customer' | 'admin' | 'driver';

type Credentials = { phoneNumber: string; password: string };

type TouchPosition = { x: number; y: number };

type CurrentScreen =
  | 'roleSelection'
  | 'customerLogin'
  | 'customerRegistration'
  | 'adminLogin'
  | 'adminRegistration'
  | 'driverLogin'
  | 'customerDashboard'
  | 'ownerDashboard'
  | 'bookTanker'
  | 'fleetManagement'
  | 'addVehicle'
  | 'driversManagement';

const App = (): React.ReactElement => {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('roleSelection');
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [touchPosition, setTouchPosition] = useState<TouchPosition>({ x: 0, y: 0 });
  const slideAnimation = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const isAnimating = useRef(false);

  const handleRoleSelect = (roleId: RoleId, position: TouchPosition = { x: 0, y: 0 }): void => {
    if (isAnimating.current) return;

    setSelectedRole(roleId);
    setTouchPosition(position);
    setCurrentScreen(`${roleId}Login` as CurrentScreen);

    isAnimating.current = true;
    slideAnimation.setValue(Dimensions.get('window').height);

    Animated.timing(slideAnimation, {
      toValue: 0,
      duration: 400,
      useNativeDriver: true,
    }).start(() => {
      isAnimating.current = false;
    });
  };

  const handleBackToRoleSelection = (): void => {
    if (isAnimating.current) return;

    isAnimating.current = true;

    Animated.timing(slideAnimation, {
      toValue: Dimensions.get('window').height,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setCurrentScreen('roleSelection');
      setSelectedRole(null);
      isAnimating.current = false;
    });
  };

  const handleLogin = (role: RoleId, credentials: Credentials): void => {
    if (role === 'customer') {
      setCurrentScreen('customerDashboard');
    }
    if (role === 'admin') {
      setCurrentScreen('ownerDashboard');
    }
  };

  const handleDashboardNavigation = (screen: 'bookTanker' | 'trackTanker' | 'profile'): void => {
    if (screen === 'bookTanker') {
      setCurrentScreen('bookTanker');
    }
  };

  const handleBackToLogin = (): void => {
    setCurrentScreen('customerLogin');
  };

  const handleBackToAdminLogin = (): void => {
    setCurrentScreen('adminLogin');
  };

  const handleCreateAccount = (): void => {
    setCurrentScreen('customerRegistration');
  };

  const handleCreateAdminAccount = (): void => {
    setCurrentScreen('adminRegistration');
  };

  const handleRegistration = (userData: Record<string, unknown>): void => {
    setCurrentScreen('customerLogin');
  };

  const handleAdminRegistration = (userData: Record<string, unknown>): void => {
    setCurrentScreen('adminLogin');
  };

  const renderCurrentScreen = (): React.ReactElement => {
    switch (currentScreen) {
      case 'roleSelection':
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
      case 'customerLogin':
        return (
          <Animated.View
            style={[
              styles.loginScreen,
              {
                transform: [{ translateY: slideAnimation }],
              },
            ]}
          >
            <CustomerLogin
              onBack={handleBackToRoleSelection}
              onLogin={handleLogin}
              onCreateAccount={handleCreateAccount}
            />
          </Animated.View>
        );
      case 'customerRegistration':
        return (
          <CustomerRegistration
            onBack={handleBackToLogin}
            onRegister={handleRegistration}
          />
        );
      case 'adminLogin':
        return (
          <Animated.View
            style={[
              styles.loginScreen,
              {
                transform: [{ translateY: slideAnimation }],
              },
            ]}
          >
            <AdminLogin
              onBack={handleBackToRoleSelection}
              onLogin={handleLogin}
              onCreateAccount={handleCreateAdminAccount}
            />
          </Animated.View>
        );
      case 'adminRegistration':
        return (
          <AdminRegistration
            onBack={handleBackToAdminLogin}
            onRegister={handleAdminRegistration}
          />
        );
      case 'driverLogin':
        return (
          <Animated.View
            style={[
              styles.loginScreen,
              {
                transform: [{ translateY: slideAnimation }],
              },
            ]}
          >
            <DriverLogin
              onBack={handleBackToRoleSelection}
              onLogin={handleLogin}
            />
          </Animated.View>
        );
      case 'customerDashboard':
        return (
          <CustomerDashboard
            onBack={handleBackToLogin}
            onNavigate={handleDashboardNavigation}
          />
        );
      case 'ownerDashboard':
        return (
          <OwnerDashboard
            onBack={handleBackToAdminLogin}
            onOpenFleet={() => setCurrentScreen('fleetManagement')}
            onOpenDrivers={() => setCurrentScreen('driversManagement')}
          />
        );
      case 'bookTanker':
        return (
          <BookTanker
            onBack={() => setCurrentScreen('customerDashboard')}
            onSubmit={(payload) => {
              const bookingId = `WT-${Date.now().toString(36).toUpperCase()}`;
              Alert.alert(
                'Tanker booked successfully',
                `Your booking ID is ${bookingId}. Please save it for tracking.`,
                [
                  {
                    text: 'OK',
                    onPress: () => setCurrentScreen('customerDashboard'),
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        );
      case 'fleetManagement':
        return (
          <FleetManagement
            onBack={() => setCurrentScreen('ownerDashboard')}
            onAddVehicle={() => setCurrentScreen('addVehicle')}
          />
        );
      case 'addVehicle':
        return (
          <AddVehicle
            onBack={() => setCurrentScreen('fleetManagement')}
            onSubmit={(vehicleData) => {
              console.log('Vehicle added:', vehicleData);
              // Here you would typically save to your backend/database
            }}
          />
        );
      case 'driversManagement':
        return (
          <DriversManagement
            onBack={() => setCurrentScreen('ownerDashboard')}
            onAddDriver={() => {
              // TODO: Implement add driver functionality
              console.log('Add driver pressed');
            }}
          />
        );
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>{renderCurrentScreen()}</View>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loginScreen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});

export default App;
