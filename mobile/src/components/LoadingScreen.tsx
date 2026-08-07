import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <ActivityIndicator size="large" color="#3b82f6" />
    </View>
  );
}
