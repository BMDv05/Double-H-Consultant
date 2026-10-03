import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import { LangProvider } from './LangContext.jsx';
import './styles.css';

/* Hidden admin: typing /admin (or /admin/) in the address bar opens #/admin.
   The Express server already serves index.html for any non-/api path. */
const p = window.location.pathname.replace(/\/+$/, '');
if (p === '/admin') {
  window.location.replace(window.location.origin + '/#/admin');
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
