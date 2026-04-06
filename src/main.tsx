import { StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from './lib/queryClient'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="min-h-screen bg-linear-to-br from-black via-black to-violet-950 flex items-center justify-center">
            <div className="text-white/60 text-lg animate-pulse">Loading...</div>
          </div>
        }
      >
        <App />
      </Suspense>
    </QueryClientProvider>
  </StrictMode>,
)
