import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import './components/ui/input.css';
import App from './App.tsx';

// Add dark mode class to html element by default
document.documentElement.classList.add('dark');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
