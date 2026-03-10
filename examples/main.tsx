import React from 'react';
import { createRoot } from 'react-dom/client';
import { ModalProvider } from 'react-modal';
import App from './App';
import './styles.css';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ModalProvider>
      <App />
    </ModalProvider>
  </React.StrictMode>
);
