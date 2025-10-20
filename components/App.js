import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import RoleSelection from './RoleSelection';
import CustomerLogin from './CustomerLogin';
import CustomerRegistration from './CustomerRegistration';
import AdminLogin from './AdminLogin';
import AdminRegistration from './AdminRegistration';
import DriverLogin from './DriverLogin';
import CustomerDashboard from './CustomerDashboard';
import BookTanker from './BookTanker';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState('roleSelection');
  const [selectedRole, setSelectedRole] = useState(null);
  const [touchPosition, setTouchPosition] = useState({ x: 0, y: 0 });
  const slideAnimation = useRef(new Animated.Value(Dimensions.get('window').height)).current;
  const isAnimating = useRef(false);

  const handleRoleSelect = (roleId, position = { x: 0, y: 0 }) => {
    if (isAnimating.current) return;
    
    setSelectedRole(roleId);
    setTouchPosition(position);
    setCurrentScreen(`${roleId}Login`);
    
    // Start slide-up animation
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

  const handleBackToRoleSelection = () => {
    if (isAnimating.current) return;
    
    // Start slide-down animation
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

  const handleLogin = (role, credentials) => {
    console.log(`${role} login attempted with:`, credentials);
    // TODO: Implement actual login logic here
    // For now, just navigate to dashboard for customer role
    if (role === 'customer') {
      setCurrentScreen('customerDashboard');
    }
  };

  const handleDashboardNavigation = (screen) => {
    console.log(`Navigate to ${screen}`);
    if (screen === 'bookTanker') {
      setCurrentScreen('bookTanker');
    }
  };

  const handleBackToLogin = () => {
    setCurrentScreen('customerLogin');
  };

  const handleBackToAdminLogin = () => {
    setCurrentScreen('adminLogin');
  };

  const handleCreateAccount = () => {
    console.log('Create account requested');
    setCurrentScreen('customerRegistration');
  };

  const handleCreateAdminAccount = () => {
    console.log('Create admin account requested');
    setCurrentScreen('adminRegistration');
  };

  const handleRegistration = (userData) => {
    console.log('Registration successful:', userData);
    // TODO: Implement actual registration logic
    // For now, just navigate back to login
    setCurrentScreen('customerLogin');
  };

  const handleAdminRegistration = (userData) => {
    console.log('Admin registration successful:', userData);
    // TODO: Implement actual admin registration logic
    // For now, just navigate back to admin login
    setCurrentScreen('adminLogin');
  };

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'roleSelection':
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
      case 'customerLogin':
        return (
          <Animated.View 
            style={[
              styles.loginScreen,
              {
                transform: [{ translateY: slideAnimation }]
              }
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
                transform: [{ translateY: slideAnimation }]
              }
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
                transform: [{ translateY: slideAnimation }]
              }
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
      case 'bookTanker':
        return (
          <BookTanker 
            onBack={() => setCurrentScreen('customerDashboard')}
            onSubmit={(payload) => {
              console.log('Book tanker request:', payload);
              setCurrentScreen('customerDashboard');
            }}
          />
        );
      default:
        return <RoleSelection onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {renderCurrentScreen()}
      </View>
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
