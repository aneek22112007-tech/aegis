import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { installRecovery } from './recover';
import './index.css';
import './ui/system.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Root element is missing');
}

installRecovery();

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
