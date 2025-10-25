import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions, Alert } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RoleSelection from './RoleSelection';
import CustomerLogin from './CustomerLogin';
import CustomerRegistration from './CustomerRegistration';
import AdminLogin from './AdminLogin';
import AdminRegistration from './AdminRegistration';
import DriverLogin from './DriverLogin';
import CustomerDashboard from './CustomerDashboard';
import DriverDashboard from './DriverDashboard';
import BookTanker from './BookTanker';
import OwnerDashboard from './OwnerDashboard';
import FleetManagement from './FleetManagement';
import AddVehicle from './AddVehicle';
import DriversManagement from './DriversManagement';
import AddDriver from './AddDriver';
import EditDriver from './EditDriver';
import TrackTanker from './TrackTanker';
import CustomerProfile from './CustomerProfile';
import PersonalInformation from './PersonalInformation';
import OrderHistory from './OrderHistory';
import BusinessReports from './BusinessReports';
import BankAccountManagement from './BankAccountManagement';
import DieselExpensesPage from './DieselExpensesPage';

export type RoleId = 'customer' | 'admin' | 'driver';

const DRIVERS_STORAGE_KEY = '@water_tanker_drivers';
const USERS_STORAGE_KEY = '@water_tanker_users';
const ORDERS_STORAGE_KEY = '@water_tanker_orders';
const VEHICLES_STORAGE_KEY = '@water_tanker_vehicles';

type Credentials = { phoneNumber: string; password: string };

type User = {
  id: string;
  name: string;
  phoneNumber: string;
  password: string;
  role: RoleId;
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

type TouchPosition = { x: number; y: number };

type Driver = {
  id: string;
  name: string;
  phoneNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string | null;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  joiningDate: string | null;
  monthlySalary: string;
  password: string;
};

type Vehicle = {
  id: string;
  vehicleNumber: string;
  capacity: string;
  lastServiceDate: string;
  nextServiceDate: string;
  insuranceExpiryDate: string;
  createdAt: string;
};

type CurrentScreen =
  | 'roleSelection'
  | 'customerLogin'
  | 'customerRegistration'
  | 'adminLogin'
  | 'adminRegistration'
  | 'driverLogin'
  | 'customerDashboard'
  | 'driverDashboard'
  | 'ownerDashboard'
  | 'bookTanker'
  | 'trackTanker'
  | 'customerProfile'
  | 'personalInformation'
  | 'orderHistory'
  | 'fleetManagement'
  | 'addVehicle'
  | 'driversManagement'
  | 'addDriver'
  | 'editDriver'
  | 'bankAccountManagement'
  | 'businessReports'
  | 'dieselExpenses';

const App = (): React.ReactElement => {
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('roleSelection');
  const [selectedRole, setSelectedRole] = useState<RoleId | null>(null);
  const [touchPosition, setTouchPosition] = useState<TouchPosition>({ x: 0, y: 0 });
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [reorderData, setReorderData] = useState<{
    name?: string;
    address?: string;
    tankerSize?: '10k' | '20k';
    agency?: string;
  } | null>(null);
  const slideAnimation = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const isAnimating = useRef(false);

  // Load data from AsyncStorage on app startup
  useEffect(() => {
    loadDrivers();
    loadUsers();
    loadOrders();
    loadVehicles();
  }, []);

  const loadDrivers = async (): Promise<void> => {
    try {
      const savedDrivers = await AsyncStorage.getItem(DRIVERS_STORAGE_KEY);
      if (savedDrivers) {
        const driversData = JSON.parse(savedDrivers);
        setDrivers(driversData);
      }
    } catch (error) {
      console.error('Error loading drivers:', error);
    }
  };

  const saveDrivers = async (driversToSave: Driver[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(DRIVERS_STORAGE_KEY, JSON.stringify(driversToSave));
    } catch (error) {
      console.error('Error saving drivers:', error);
    }
  };

  const loadUsers = async (): Promise<void> => {
    try {
      const savedUsers = await AsyncStorage.getItem(USERS_STORAGE_KEY);
      if (savedUsers) {
        const usersData = JSON.parse(savedUsers);
        setUsers(usersData);
      } else {
        // Initialize with sample users for testing
        const sampleUsers: User[] = [
          {
            id: 'USR-SAMPLE1',
            name: 'Demo Customer',
            phoneNumber: '9876543210',
            password: 'password123',
            role: 'customer',
            createdAt: new Date().toISOString(),
            address: '123 Main St, New Delhi',
          },
          {
            id: 'USR-SAMPLE2',
            name: 'Admin User',
            phoneNumber: '9876543211',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString(),
          }
        ];
        setUsers(sampleUsers);
        await saveUsers(sampleUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const saveUsers = async (usersToSave: User[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(usersToSave));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const loadOrders = async (): Promise<void> => {
    try {
      const savedOrders = await AsyncStorage.getItem(ORDERS_STORAGE_KEY);
      if (savedOrders) {
        const ordersData = JSON.parse(savedOrders);
        // Migrate existing orders to include totalAmount field
        const migratedOrders = ordersData.map((order: any) => ({
          ...order,
          totalAmount: order.totalAmount || order.amount || 0,
        }));
        setOrders(migratedOrders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const saveOrders = async (ordersToSave: Order[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(ordersToSave));
    } catch (error) {
      console.error('Error saving orders:', error);
    }
  };

  const loadVehicles = async (): Promise<void> => {
    try {
      const savedVehicles = await AsyncStorage.getItem(VEHICLES_STORAGE_KEY);
      if (savedVehicles) {
        const vehiclesData = JSON.parse(savedVehicles);
        setVehicles(vehiclesData);
      }
    } catch (error) {
      console.error('Error loading vehicles:', error);
    }
  };

  const saveVehicles = async (vehiclesToSave: Vehicle[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(VEHICLES_STORAGE_KEY, JSON.stringify(vehiclesToSave));
    } catch (error) {
      console.error('Error saving vehicles:', error);
    }
  };

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
    if (role === 'driver') {
      // For drivers, check in the drivers array (only drivers added by owner can login)
      const driver = drivers.find(d => 
        d.phoneNumber === credentials.phoneNumber && 
        d.password === credentials.password
      );

      if (driver) {
        // Create a user object from driver data for consistency
        const driverUser: User = {
          id: driver.id,
          name: driver.name,
          phoneNumber: driver.phoneNumber,
          password: driver.password,
          role: 'driver',
          createdAt: driver.joiningDate || new Date().toISOString()
        };
        setCurrentUser(driverUser);
        setCurrentScreen('driverDashboard'); // Redirect drivers to their dashboard
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid credentials. Only drivers added by the owner can login.',
          [{ text: 'OK' }]
        );
      }
    } else {
      // For customers and admins, check in the users array
      const user = users.find(u => 
        u.phoneNumber === credentials.phoneNumber && 
        u.password === credentials.password && 
        u.role === role
      );

      if (user) {
        setCurrentUser(user);
        if (role === 'customer') {
          setCurrentScreen('customerDashboard');
        } else if (role === 'admin') {
          setCurrentScreen('ownerDashboard');
        }
      } else {
        Alert.alert(
          'Login Failed',
          'Invalid credentials. Please check your phone number and password.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const handleDashboardNavigation = (screen: 'bookTanker' | 'trackTanker' | 'profile'): void => {
    if (screen === 'bookTanker') {
      setCurrentScreen('bookTanker');
    } else if (screen === 'trackTanker') {
      setCurrentScreen('trackTanker');
    } else if (screen === 'profile') {
      setCurrentScreen('customerProfile');
    }
  };

  const handleBackToLogin = (): void => {
    setCurrentUser(null);
    setCurrentScreen('customerLogin');
  };

  const handleBackToAdminLogin = (): void => {
    setCurrentUser(null);
    setCurrentScreen('adminLogin');
  };

  const handleLogout = (): void => {
    setCurrentUser(null);
    setCurrentScreen('roleSelection');
  };

  const handleUpdateProfile = async (updatedUser: Partial<User>): Promise<void> => {
    if (!currentUser) return;
    
    const updatedUsers = users.map(user => 
      user.id === currentUser.id 
        ? { ...user, ...updatedUser }
        : user
    );
    
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    
    // Update current user
    setCurrentUser({ ...currentUser, ...updatedUser });
    
    Alert.alert(
      'Profile Updated',
      'Your profile has been updated successfully.',
      [{ text: 'OK' }]
    );
  };

  const handleProfileNavigation = (screen: 'personalInformation' | 'orderHistory'): void => {
    if (screen === 'personalInformation') {
      setCurrentScreen('personalInformation');
    } else if (screen === 'orderHistory') {
      setCurrentScreen('orderHistory');
    }
  };

  const handleReorder = (order: {
    address: string;
    tankerSize: string;
    agency: string;
  }): void => {
    // Convert tanker size from "10k"/"20k" to "10k"/"20k" format
    const tankerSize = order.tankerSize === '10k' ? '10k' : '20k';
    
    setReorderData({
      address: order.address,
      tankerSize: tankerSize,
      agency: order.agency,
    });
    setCurrentScreen('bookTanker');
  };

  const handleCreateAccount = (): void => {
    setCurrentScreen('customerRegistration');
  };

  const handleCreateAdminAccount = (): void => {
    setCurrentScreen('adminRegistration');
  };

  const handleRegistration = async (userData: Record<string, unknown>): Promise<void> => {
    const newUser: User = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: userData.name as string,
      phoneNumber: userData.phoneNumber as string,
      password: userData.password as string,
      role: 'customer',
      createdAt: new Date().toISOString(),
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    
    Alert.alert(
      'Registration Successful',
      'Your account has been created. Please login to continue.',
      [{ text: 'OK', onPress: () => setCurrentScreen('customerLogin') }]
    );
  };

  const handleAdminRegistration = async (userData: Record<string, unknown>): Promise<void> => {
    const newUser: User = {
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      name: userData.name as string,
      phoneNumber: userData.phoneNumber as string,
      password: userData.password as string,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    await saveUsers(updatedUsers);
    
    Alert.alert(
      'Registration Successful',
      'Your admin account has been created. Please login to continue.',
      [{ text: 'OK', onPress: () => setCurrentScreen('adminLogin') }]
    );
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
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        );
      case 'driverDashboard':
        return (
          <DriverDashboard
            onBack={handleBackToLogin}
            onNavigate={handleDashboardNavigation}
            currentUser={currentUser}
          />
        );
      case 'ownerDashboard':
        return (
          <OwnerDashboard
            onBack={handleBackToAdminLogin}
            onOpenFleet={() => setCurrentScreen('fleetManagement')}
            onOpenDrivers={() => setCurrentScreen('driversManagement')}
            onOpenReports={() => setCurrentScreen('businessReports')}
            onOpenBankAccount={() => setCurrentScreen('bankAccountManagement')}
            onOpenDieselExpenses={() => setCurrentScreen('dieselExpenses')}
            currentUser={currentUser}
            onLogout={handleLogout}
            orders={orders}
          />
        );
      case 'bookTanker':
        return (
          <BookTanker
            onBack={() => {
              setReorderData(null);
              setCurrentScreen('customerDashboard');
            }}
            onSubmit={async (payload) => {
              if (!currentUser) {
                Alert.alert('Error', 'User not logged in');
                return;
              }

              const bookingId = `WT-${Date.now().toString(36).toUpperCase()}`;
              const orderAmount = payload.tankerSize === '10k' ? 600 : 1200;
              const newOrder: Order = {
                id: `ORD-${Date.now().toString(36).toUpperCase()}`,
                bookingId,
                userId: currentUser.id,
                name: payload.name,
                address: payload.address,
                date: payload.date || '',
                time: payload.time || '',
                amount: orderAmount,
                totalAmount: orderAmount,
                status: 'pending',
                tankerSize: payload.tankerSize || '10k',
                agency: payload.agency,
                comments: payload.comments,
                createdAt: new Date().toISOString(),
              };

              const updatedOrders = [...orders, newOrder];
              setOrders(updatedOrders);
              await saveOrders(updatedOrders);

              Alert.alert(
                'Tanker booked successfully',
                `Your booking ID is ${bookingId}. Please save it for tracking.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setReorderData(null);
                      setCurrentScreen('customerDashboard');
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
            prefilledData={reorderData}
          />
        );
      case 'trackTanker':
        return (
          <TrackTanker
            onBack={() => setCurrentScreen('customerDashboard')}
            onReorder={handleReorder}
            orders={currentUser ? orders.filter(order => order.userId === currentUser.id) : []}
            currentUser={currentUser}
            onUpdateOrders={async (updatedOrders) => {
              setOrders(updatedOrders);
              await saveOrders(updatedOrders);
            }}
          />
        );
      case 'customerProfile':
        return (
          <CustomerProfile
            onBack={() => setCurrentScreen('customerDashboard')}
            currentUser={currentUser}
            onLogout={handleLogout}
            orders={currentUser ? orders.filter(order => order.userId === currentUser.id) : []}
            onUpdateProfile={handleUpdateProfile}
            onNavigate={handleProfileNavigation}
          />
        );
      case 'personalInformation':
        return (
          <PersonalInformation
            onBack={() => setCurrentScreen('customerProfile')}
            currentUser={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      case 'orderHistory':
        return (
          <OrderHistory
            onBack={() => setCurrentScreen('customerProfile')}
            currentUser={currentUser}
            orders={currentUser ? orders.filter(order => order.userId === currentUser.id) : []}
            onReorder={handleReorder}
          />
        );
      case 'fleetManagement':
        return (
          <FleetManagement
            onBack={() => setCurrentScreen('ownerDashboard')}
            onAddVehicle={() => setCurrentScreen('addVehicle')}
            vehicles={vehicles}
          />
        );
      case 'addVehicle':
        return (
          <AddVehicle
            onBack={() => setCurrentScreen('fleetManagement')}
            onSubmit={async (vehicleData) => {
              const newVehicle: Vehicle = {
                id: `VEH-${Date.now().toString(36).toUpperCase()}`,
                vehicleNumber: vehicleData.vehicleNumber,
                capacity: vehicleData.capacity,
                lastServiceDate: vehicleData.lastServiceDate,
                nextServiceDate: vehicleData.nextServiceDate,
                insuranceExpiryDate: vehicleData.insuranceExpiryDate,
                createdAt: new Date().toISOString(),
              };
              const updatedVehicles = [...vehicles, newVehicle];
              setVehicles(updatedVehicles);
              await saveVehicles(updatedVehicles);
            }}
          />
        );
      case 'driversManagement':
        return (
          <DriversManagement
            onBack={() => setCurrentScreen('ownerDashboard')}
            onAddDriver={() => setCurrentScreen('addDriver')}
            onEditDriver={(driver) => {
              // Ensure driver has password field for editing
              const driverWithPassword = {
                ...driver,
                password: driver.password || 'default123' // Provide default password for existing drivers
              };
              setEditingDriver(driverWithPassword);
              setCurrentScreen('editDriver');
            }}
            onDeleteDriver={async (driverToDelete) => {
              const updatedDrivers = drivers.filter(driver => driver.id !== driverToDelete.id);
              setDrivers(updatedDrivers);
              await saveDrivers(updatedDrivers);
              Alert.alert(
                'Driver Deleted',
                `${driverToDelete.name} has been removed from the drivers list.`,
                [{ text: 'OK' }]
              );
            }}
            drivers={drivers}
          />
        );
      case 'addDriver':
        return (
          <AddDriver
            onBack={() => setCurrentScreen('driversManagement')}
            onSubmit={async (driverData) => {
              const newDriver: Driver = {
                id: `DRV-${Date.now().toString(36).toUpperCase()}`,
                ...driverData,
              };
              const updatedDrivers = [...drivers, newDriver];
              setDrivers(updatedDrivers);
              await saveDrivers(updatedDrivers);
              Alert.alert(
                'Driver added successfully',
                `${driverData.name} has been added to the drivers list.`,
                [
                  {
                    text: 'OK',
                    onPress: () => setCurrentScreen('driversManagement'),
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        );
      case 'editDriver':
        return editingDriver ? (
          <EditDriver
            onBack={() => {
              setEditingDriver(null);
              setCurrentScreen('driversManagement');
            }}
            driver={editingDriver}
            onSubmit={async (driverData) => {
              const updatedDrivers = drivers.map(driver => 
                driver.id === editingDriver.id 
                  ? { ...driver, ...driverData }
                  : driver
              );
              setDrivers(updatedDrivers);
              await saveDrivers(updatedDrivers);
              Alert.alert(
                'Driver updated successfully',
                `${driverData.name}'s details have been updated.`,
                [
                  {
                    text: 'OK',
                    onPress: () => {
                      setEditingDriver(null);
                      setCurrentScreen('driversManagement');
                    },
                  },
                ],
                { cancelable: false }
              );
            }}
          />
        ) : (
          <RoleSelection onRoleSelect={handleRoleSelect} />
        );
      case 'businessReports':
        return (
          <BusinessReports
            onBack={() => setCurrentScreen('ownerDashboard')}
          />
        );
      case 'bankAccountManagement':
        return (
          <BankAccountManagement
            onBack={() => setCurrentScreen('ownerDashboard')}
          />
        );
      case 'dieselExpenses':
        return (
          <DieselExpensesPage
            onBack={() => setCurrentScreen('ownerDashboard')}
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
