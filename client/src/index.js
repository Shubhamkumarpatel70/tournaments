import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import Clarity from '@microsoft/clarity';
import './index.css';
import App from './App';

// Initialize Microsoft Clarity
if (process.env.REACT_APP_CLARITY_PROJECT_ID) {
  Clarity.start(process.env.REACT_APP_CLARITY_PROJECT_ID);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);

