import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ShieldCheckIcon, TruckIcon, UserIcon } from 'react-native-heroicons/outline';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const RoleSelection = ({ onRoleSelect }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [glowAnimations] = useState({
    customer: new Animated.Value(0),
    admin: new Animated.Value(0),
    driver: new Animated.Value(0),
  });
  const [outerGlowAnimations] = useState({
    customer: new Animated.Value(0),
    admin: new Animated.Value(0),
    driver: new Animated.Value(0),
  });
  const [isAnimating, setIsAnimating] = useState(false);
  const [waterDrops] = useState(() => 
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * Dimensions.get('window').width,
      y: Math.random() * Dimensions.get('window').height,
      animation: new Animated.Value(0),
      size: Math.random() * 3 + 2,
    }))
  );
  
  // Android-specific animation optimizations
  const isAndroid = Platform.OS === 'android';
  
  // Reset animations when component mounts
  useEffect(() => {
    Object.values(glowAnimations).forEach(anim => anim.setValue(0));
    Object.values(outerGlowAnimations).forEach(anim => anim.setValue(0));
    
    // Start water drop animations
    waterDrops.forEach((drop, index) => {
      const delay = index * 200;
      setTimeout(() => {
        Animated.loop(
          Animated.sequence([
            Animated.timing(drop.animation, {
              toValue: 1,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
            Animated.timing(drop.animation, {
              toValue: 0,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ])
        ).start();
      }, delay);
    });
  }, []);

  const startGlowAnimation = (roleId) => {
    const glowDuration = isAndroid ? 150 : 200;
    const outerGlowDuration = isAndroid ? 200 : 300;
    
    // Start inner glow animation
    Animated.sequence([
      Animated.timing(glowAnimations[roleId], {
        toValue: 1,
        duration: glowDuration,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnimations[roleId], {
        toValue: 0,
        duration: glowDuration,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Start outer glow animation with delay for layered effect
    Animated.sequence([
      Animated.delay(50),
      Animated.timing(outerGlowAnimations[roleId], {
        toValue: 1,
        duration: outerGlowDuration,
        useNativeDriver: true,
      }),
      Animated.timing(outerGlowAnimations[roleId], {
        toValue: 0,
        duration: outerGlowDuration,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleRoleSelect = (roleId, event) => {
    if (isAnimating) return; // Prevent multiple animations
    
    setSelectedRole(roleId);
    setIsAnimating(true);
    startGlowAnimation(roleId);
    
    // Get touch position for animation origin
    const touchPosition = event?.nativeEvent?.pageY ? { 
      x: event.nativeEvent.pageX, 
      y: event.nativeEvent.pageY 
    } : { x: 0, y: 0 };
    
    // Navigate to login screen with touch position
    setTimeout(() => {
      onRoleSelect(roleId, touchPosition);
    }, isAndroid ? 50 : 100);
  };

  const roles = [
    {
      id: 'customer',
      title: 'Customer',
      description: 'Book water tanker services',
      icon: UserIcon,
      featured: true
    },
    {
      id: 'admin',
      title: 'Admin',
      description: 'Manage operations and users',
      icon: ShieldCheckIcon,
      featured: false
    },
    {
      id: 'driver',
      title: 'Driver',
      description: 'Deliver water tanker services',
      icon: TruckIcon,
      featured: false
    }
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient */}
      <LinearGradient
        colors={['#000000', '#1a1a1a']}
        style={styles.backgroundGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Animated Water Drops */}
      {waterDrops.map((drop) => (
        <Animated.View
          key={drop.id}
          style={[
            styles.waterDrop,
            {
              left: drop.x,
              top: drop.y,
              width: drop.size,
              height: drop.size,
              borderRadius: drop.size / 2,
              opacity: drop.animation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.1, 0.4],
              }),
              transform: [
                {
                  translateY: drop.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, -20],
                  }),
                },
                {
                  scale: drop.animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1.2],
                  }),
                },
              ],
            },
          ]}
        />
      ))}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>WT</Text>
          </View>
          <Text style={styles.headerText}>WaterTanker</Text>
        </View>
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <Text style={styles.heroTitle}>Welcome to WaterTanker</Text>
        <Text style={styles.heroSubtitle}>
          Choose your role to get started with our water delivery service
        </Text>
      </View>

      {/* All Role Cards */}
      <View style={styles.rolesContainer}>
        {roles.map((role) => {
          const IconComponent = role.icon;
          const glowOpacity = glowAnimations[role.id].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1],
          });
          const outerGlowOpacity = outerGlowAnimations[role.id].interpolate({
            inputRange: [0, 1],
            outputRange: [0, 0.8],
          });
          
          return (
            <TouchableOpacity
              key={role.id}
              style={styles.roleCard}
              onPress={(event) => handleRoleSelect(role.id, event)}
              activeOpacity={0.8}
            >
              {/* Outer Glow Layer */}
              <Animated.View 
                style={[
                  styles.roleCardOuterGlow,
                  {
                    opacity: outerGlowOpacity,
                    transform: [{
                      scale: outerGlowAnimations[role.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.3],
                      })
                    }]
                  }
                ]}
              />
              
              {/* Inner Glow Layer */}
              <Animated.View 
                style={[
                  styles.roleCardGlow,
                  {
                    opacity: glowOpacity,
                    transform: [{
                      scale: glowAnimations[role.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.1],
                      })
                    }]
                  }
                ]}
              />
              
              <View style={styles.roleCardContent}>
                <Text style={styles.roleCardTitle}>{role.title}</Text>
                <Text style={styles.roleCardDescription}>{role.description}</Text>
              </View>
              <View style={styles.roleCardIcon}>
                <IconComponent size={48} color="#FFFFFF" />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Social Proof removed as requested */}

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Need help? Contact us at support@watertanker.com
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  waterDrop: {
    position: 'absolute',
    backgroundColor: '#D4AF37',
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingVertical: 30,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#CCCCCC',
    textAlign: 'center',
    lineHeight: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1A1A1A',
  },
  headerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    width: 32,
    height: 32,
    backgroundColor: '#000000',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  headerIconText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  headerText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  rolesContainer: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    gap: 16,
  },
  roleCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  roleCardOuterGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    right: -8,
    bottom: -8,
    borderRadius: 20,
    backgroundColor: '#B8860B',
    shadowColor: '#B8860B',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 30,
  },
  roleCardGlow: {
    position: 'absolute',
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 14,
    backgroundColor: '#B8860B',
    shadowColor: '#B8860B',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.9,
    shadowRadius: 25,
    elevation: 25,
  },
  roleCardContent: {
    flex: 1,
  },
  roleCardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  roleCardDescription: {
    fontSize: 14,
    fontWeight: '400',
    color: '#CCCCCC',
    lineHeight: 20,
  },
  featuredBadge: {
    backgroundColor: '#D4AF37',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  featuredText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
  },
  roleCardIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2A2A2A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  socialProof: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    alignItems: 'center',
  },
  socialProofText: {
    fontSize: 14,
    fontWeight: '400',
    color: '#888888',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  footerText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#666666',
    textAlign: 'center',
  },
});

export default RoleSelection;
