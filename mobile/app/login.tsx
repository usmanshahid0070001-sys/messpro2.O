import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert, SafeAreaView } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { router } from 'expo-router';
import api from '../src/api/client';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter email and password');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/api/auth/login', { email, password });
      await login(response.data.user, response.data.token);
      
      const role = response.data.user.role;
      if (role === 'superadmin' || role === 'admin') {
        router.replace('/restricted');
      } else if (role === 'manager') {
        router.replace('/(manager)/dashboard');
      } else if (role === 'student') {
        router.replace('/(student)/dashboard');
      } else {
        Alert.alert('Error', 'Unknown role');
      }
    } catch (error: any) {
      Alert.alert('Login Failed', error.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 justify-center px-6">
      <View className="mb-10 items-center">
        <Text className="text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">MessPro<Text className="text-blue-500">.</Text></Text>
        <Text className="text-zinc-500 dark:text-zinc-400 text-center">Sign in to your account</Text>
      </View>

      <View className="space-y-4">
        <View>
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Email</Text>
          <TextInput 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100"
            placeholder="Enter your email"
            placeholderTextColor="#71717a"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View>
          <Text className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Password</Text>
          <TextInput 
            className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-zinc-100"
            placeholder="Enter your password"
            placeholderTextColor="#71717a"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity 
          onPress={handleLogin}
          disabled={loading}
          className={`w-full bg-blue-500 rounded-xl py-3.5 items-center justify-center mt-4 ${loading ? 'opacity-70' : ''}`}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-bold text-base">Sign In</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
