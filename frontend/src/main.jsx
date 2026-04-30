import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
      position="top-right"
      toastOptions={{
        style: {
          background: '#16161f',
          color: '#e2e8f0',
          border: '1px solid rgba(139,92,246,0.3)',
          fontFamily: 'Inter, sans-serif',
          fontSize: '0.875rem',
        },
        success: { iconTheme: { primary: '#8b5cf6', secondary: '#fff' } },
        error:   { iconTheme: { primary: '#f87171', secondary: '#fff' } },
      }}
    />
  </StrictMode>
);
