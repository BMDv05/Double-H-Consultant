import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './LangContext.jsx';
import './styles.css';

// The server returns index.html for every path, so a typed /admin or /contact
// lands here without a hash. Move the path into the hash route HashRouter reads.
const { pathname, hash } = window.location;
if (pathname !== '/' && !hash) {
  window.history.replaceState(null, '', `/#${pathname.replace(/\/+$/, '')}`);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <LangProvider>
        <App />
      </LangProvider>
    </HashRouter>
  </StrictMode>
);
