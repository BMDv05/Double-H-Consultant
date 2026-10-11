import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './LangContext.jsx';
import './styles.css';

/* Move a typed path into the hash so deep links work with HashRouter:
   /admin → #/admin, /contact → #/contact, /en/contact → #/en/contact.
   The server serves index.html for every non-/api path. */
try {
  if (!window.location.hash || window.location.hash === '#') {
    const p = window.location.pathname.replace(/\/+$/, '') || '/';
    if (p !== '/') window.location.hash = '#' + p;
  }
} catch {
  /* non-browser environment: ignore */
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
