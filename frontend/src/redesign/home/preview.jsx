import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import { LangProvider } from "../../LangContext.jsx";
import ConsultingSite from "../ConsultingSite.jsx";
import "./preview.module.css";
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <HashRouter>
      <LangProvider>
        <ConsultingSite />
      </LangProvider>
    </HashRouter>
  </StrictMode>,
);
