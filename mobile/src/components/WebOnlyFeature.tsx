import React from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WebOnlyFeatureProps {
  featureName: string;
}

export default function WebOnlyFeature({ featureName }: WebOnlyFeatureProps) {
  const handleOpenWeb = () => {
    Linking.openURL('https://messpro.app'); // Replace with actual web url
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center px-6">
      <View className="items-center max-w-sm w-full bg-white dark:bg-zinc-900 p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <View className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-2xl items-center justify-center mb-6">
          <Ionicons name="desktop-outline" size={32} color="#3b82f6" />
        </View>
        
        <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2 text-center">
          Available on Web
        </Text>
        
        <Text className="text-zinc-500 dark:text-zinc-400 text-center mb-8 leading-relaxed">
          The <Text className="font-semibold text-zinc-700 dark:text-zinc-300">{featureName}</Text> feature is currently optimized for the full web dashboard.
        </Text>

        <TouchableOpacity 
          onPress={handleOpenWeb}
          className="w-full bg-blue-500 py-3.5 rounded-xl items-center"
        >
          <Text className="text-white font-semibold">Open Web Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
