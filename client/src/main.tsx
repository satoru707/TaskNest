import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import { Toaster } from 'sonner';
import App from './App';
import { ThemeProvider } from './contexts/ThemeContext';
import './index.css';

// Auth0 configuration would typically come from environment variables
const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'your-auth0-domain.auth0.com';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'your-auth0-client-id';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Router>
        <ThemeProvider>
          <App />
          <Toaster position="top-right" richColors closeButton />
        </ThemeProvider>
      </Router>
    </Auth0Provider>
  </StrictMode>
);