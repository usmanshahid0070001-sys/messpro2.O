import { Stack } from 'expo-router';
import { AuthProvider } from '../src/context/AuthContext';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import '../global.css'; // Assuming nativewind css configuration

export default function RootLayout() {
  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <StatusBar style="auto" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="restricted" />
          <Stack.Screen name="(manager)" />
          <Stack.Screen name="(student)" />
        </Stack>
      </View>
    </AuthProvider>
  );
}
