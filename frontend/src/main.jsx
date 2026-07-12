import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

// Local Imports
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { Provider } from 'react-redux';
import { store } from './store/store.js';
import useUIStore from './store/useUIStore.js';
import { initVersionCheck } from './utils/versionCheck.js';
import './index.css';

// ─── CONFIGURATION ───────────────────────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const customToastOptions = {
  className: 'dark:bg-slate-800 dark:text-white bg-white text-[#111111] border border-[#e0e0e0] dark:border-slate-700 shadow-xl font-sans font-bold text-sm rounded-2xl',
  style: { padding: '12px 20px' },
  success: { iconTheme: { primary: '#10b981', secondary: '#ffffff' } },
  error: { iconTheme: { primary: '#f43f5e', secondary: '#ffffff' } },
  loading: {
    icon: (
      <div className="flex items-center gap-2.5">
        <div 
          className="w-5 h-5 rounded-full border-[3px] border-indigo-500/20 border-t-blue-500 animate-spin" 
          style={{ animationTimingFunction: 'linear' }}
        />
        <span className="font-display font-black tracking-tight text-[#111111] dark:text-white text-base animate-[pulse_2s_cubic-bezier(0.4,0,0.6,1)_infinite]">
          Loading MessPro<span className="text-blue-500">.</span>
        </span>
      </div>
    ),
  },
};

// ─── ROOT WRAPPER ────────────────────────────────────────────────────────────

// Smoothly fades out and removes the initial index.html loading screen
const RootApp = () => {
  // Initialize theme from Zustand
  const { theme } = useUIStore();

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const loader = document.getElementById('initial-loader-container');
    if (loader) {
      loader.style.opacity = '0';
      const timeout = setTimeout(() => loader.remove(), 500); 
      return () => clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    // Initialize version check for auto-updates on Vercel deployments
    initVersionCheck();
  }, []);

  return <App />;
};

// ─── RENDER ──────────────────────────────────────────────────────────────────

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthProvider>
          
          <RootApp />
          <Toaster 
            position="top-center" 
            reverseOrder={false} 
            toastOptions={customToastOptions} 
          />
          
        </AuthProvider>
      </Provider>
    </QueryClientProvider>
  </React.StrictMode>
);
