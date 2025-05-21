import React      from 'react';
import ReactDOM   from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App';

import { AuthProvider }             from './contexts/AuthContext';
import { ThemeStoreAuthProvider }   from './contexts/ThemeStoreAuthContext';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeStoreAuthProvider>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeStoreAuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
