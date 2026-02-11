import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-center"
      richColors
      expand={false}
      visibleToasts={3}
      toastOptions={{
        duration: 4000,
        className: 'shadow-lg border border-slate-200',
        style: {
          zIndex: 9999,
        },
      }}
    />
  </StrictMode>,
)
