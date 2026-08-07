import React from 'react';
import { View, Text, SafeAreaView } from 'react-native';

export default function StudentDashboard() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-50 dark:bg-zinc-950 items-center justify-center">
      <Text className="text-xl font-bold text-zinc-900 dark:text-zinc-50">Student Dashboard</Text>
      <Text className="text-zinc-500 dark:text-zinc-400 mt-2">Welcome to MessPro</Text>
    </SafeAreaView>
  );
}
