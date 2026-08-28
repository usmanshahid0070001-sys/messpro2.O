import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Provider } from 'react-redux'
import { store } from './store'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { registerServiceWorker, activateWaitingServiceWorker } from './pwa/registerServiceWorker'
import { toast } from 'sonner'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 15, // 15 minutes default stale time
      refetchOnWindowFocus: false, // Prevent the app from refreshing/refetching on tab switch
      retry: (failureCount, error: any) => {
        // Don't retry on 401/403/404 errors
        if (error?.response?.status && [401, 403, 404].includes(error.response.status)) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
})

// Initialize Progressive Web App (PWA) Service Worker lifecycle
registerServiceWorker((registration) => {
  toast.info('Update Available', {
    description: 'A new version of MessPro is ready.',
    action: {
      label: 'Reload',
      onClick: () => activateWaitingServiceWorker(registration),
    },
    duration: 12000,
  })
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <App />
          </TooltipProvider>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  </StrictMode>,
)


