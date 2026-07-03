import { BrowserRouter, Routes, Route } from 'react-router-dom';
import SuperAdminLayout from './components/layout/SuperAdminLayout.jsx';
import GlobalDashboard from './pages/SuperAdmin/GlobalDashboard.jsx';
import TenantManagement from './pages/SuperAdmin/TenantManagement.jsx';
import SubscriptionPackages from './pages/SuperAdmin/SubscriptionPackages.jsx';
import CustomizationMatrix from './pages/SuperAdmin/CustomizationMatrix.jsx';
import ThirdPartyIntegrations from './pages/SuperAdmin/ThirdPartyIntegrations.jsx';
import SecurityControls from './pages/SuperAdmin/SecurityControls.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SuperAdminLayout />}>
          <Route index element={<GlobalDashboard />} />
          <Route path="hostels" element={<TenantManagement />} />
          <Route path="subscriptions" element={<SubscriptionPackages />} />
          <Route path="customization" element={<CustomizationMatrix />} />
          <Route path="integrations" element={<ThirdPartyIntegrations />} />
          <Route path="security" element={<SecurityControls />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}