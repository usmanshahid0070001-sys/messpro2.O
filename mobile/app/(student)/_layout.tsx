import { Tabs } from 'expo-router';
import { useAuth } from '../../src/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { hasPermission } from '../../src/utils/permissions';

export default function StudentLayout() {
  const { user } = useAuth();
  
  // MOCK: Assuming all features are enabled for the hostel for this scaffolding.
  const enabledFeatures = [
    { name: 'Service Management', isEnabled: true },
    { name: 'Complaint Management', isEnabled: true },
    { name: 'User Management', isEnabled: true },
    { name: 'Residence Management', isEnabled: true },
    { name: 'QR Attendance', isEnabled: true },
    { name: 'Manual Attendance', isEnabled: true },
    { name: 'Bill Generation', isEnabled: true },
    { name: 'Bill Management', isEnabled: true },
    { name: 'Meal settings', isEnabled: true },
  ];

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: {
        backgroundColor: '#18181b', // zinc-900
        borderTopColor: '#27272a', // zinc-800
      },
      tabBarActiveTintColor: '#3b82f6', // blue-500
      tabBarInactiveTintColor: '#a1a1aa', // zinc-400
    }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => <Ionicons name="home" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="meals"
        options={{
          title: 'Meals',
          tabBarIcon: ({ color }) => <Ionicons name="restaurant" size={24} color={color} />,
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color }) => <Ionicons name="time" size={24} color={color} />,
        }}
      />
      
      <Tabs.Screen
        name="qr-attendance"
        options={{
          title: 'QR Code',
          href: enabledFeatures.some(f => f.name === 'QR Attendance' && f.isEnabled) ? '/(student)/qr-attendance' : null,
          tabBarIcon: ({ color }) => <Ionicons name="qr-code" size={24} color={color} />,
        }}
      />

      {/* Web Only Stubs below */}
      <Tabs.Screen
        name="bills"
        options={{
          title: 'Bills',
          href: hasPermission('bill_generation', user, enabledFeatures) ? '/(student)/bills' : null,
          tabBarIcon: ({ color }) => <Ionicons name="receipt" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
