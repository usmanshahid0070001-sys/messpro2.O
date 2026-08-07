import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { useAuth } from '../src/context/AuthContext';
import { router } from 'expo-router';

export default function RestrictedScreen() {
  const { logout, user } = useAuth();

  const handleOpenWeb = () => {
    Linking.openURL('https://messpro.app'); // Replace with actual web url
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center px-6">
      <View className="items-center max-w-sm w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-6">
          <Text className="text-2xl">🔒</Text>
        </View>
        
        <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 text-center">
          Web-Only Role
        </Text>
        
        <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-8 leading-relaxed">
          Your account ({user?.role}) is only accessible on the full web dashboard. Please log in on your computer.
        </Text>

        <TouchableOpacity 
          onPress={handleOpenWeb}
          className="w-full bg-blue-500 py-3.5 rounded-xl items-center mb-3"
        >
          <Text className="text-white font-semibold">Open Web Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={handleLogout}
          className="w-full py-3.5 rounded-xl items-center border border-zinc-200 dark:border-zinc-800"
        >
          <Text className="text-zinc-700 dark:text-zinc-300 font-semibold">Sign Out</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
