import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TruckIcon, LockClosedIcon, ArrowRightIcon } from 'react-native-heroicons/outline';

const DriverLogin = ({ onBack, onLogin }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ phoneNumber: '', password: '' });

  const validatePhone = (value) => {
    const digitsOnly = value.replace(/\D/g, '');
    if (digitsOnly.length === 0) return 'Phone number is required';
    if (digitsOnly.length !== 10) return 'Enter a valid 10-digit phone number';
    return '';
  };

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 6) return 'Password must be at least 6 characters';
    return '';
  };

  const handleLogin = () => {
    const phoneError = validatePhone(phoneNumber);
    const passError = validatePassword(password);
    const newErrors = { phoneNumber: phoneError, password: passError };
    setErrors(newErrors);
    if (phoneError || passError) return;
    onLogin('driver', { phoneNumber, password });
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <ArrowRightIcon size={24} color="#FFFFFF" style={{ transform: [{ rotate: '180deg' }] }} />
          </TouchableOpacity>
          <Text style={styles.title}>Driver Login</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Login Form */}
        <View style={styles.formContainer}>
          <View style={styles.inputContainer}>
            <TruckIcon size={20} color="#B0B0B0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#B0B0B0"
              value={phoneNumber}
              onChangeText={(text) => {
                setPhoneNumber(text);
                if (errors.phoneNumber) {
                  setErrors((prev) => ({ ...prev, phoneNumber: validatePhone(text) }));
                }
              }}
              keyboardType="phone-pad"
              autoCapitalize="none"
            />
          </View>
          {errors.phoneNumber ? <Text style={styles.errorText}>{errors.phoneNumber}</Text> : null}

          <View style={styles.inputContainer}>
            <LockClosedIcon size={20} color="#B0B0B0" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#B0B0B0"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password) {
                  setErrors((prev) => ({ ...prev, password: validatePassword(text) }));
                }
              }}
              secureTextEntry
            />
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          <TouchableOpacity
            style={[
              styles.loginButton,
              (validatePhone(phoneNumber) || validatePassword(password)) && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            disabled={!!(validatePhone(phoneNumber) || validatePassword(password))}
          >
            <Text style={styles.loginButtonText}>Login</Text>
            <ArrowRightIcon size={20} color="#000000" />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerCenter}>
            <View style={styles.footerIcon}>
              <Text style={styles.footerIconText}>WT</Text>
            </View>
            <Text style={styles.footerText}>WaterTanker</Text>
          </View>
        </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  backButton: {
    padding: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  placeholder: {
    width: 34,
  },
  formContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#FFFFFF',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
  },
  loginButton: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  loginButtonDisabled: {
    backgroundColor: '#7F6A28',
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#1A1A1A',
    marginTop: 'auto',
  },
  footerCenter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    width: 24,
    height: 24,
    backgroundColor: '#000000',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  footerIconText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  footerText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
});

export default DriverLogin;
