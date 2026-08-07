import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import LoadingScreen from '../src/components/LoadingScreen';

export default function Index() {
  const { isAuthenticated, loading, role } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/login" />;
  }

  if (role === 'superadmin' || role === 'admin') {
    return <Redirect href="/restricted" />;
  }

  if (role === 'manager') {
    return <Redirect href="/(manager)/dashboard" />;
  }

  if (role === 'student') {
    return <Redirect href="/(student)/dashboard" />;
  }

  return <Redirect href="/login" />;
}
