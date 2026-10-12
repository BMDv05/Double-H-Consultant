import { lazy, Suspense } from "react";
import { useLocation } from "react-router-dom";
import { useLang } from "./LangContext.jsx";
import ConsultingSite from "./redesign/ConsultingSite.jsx";
const LegacyApp = lazy(() => import("./LegacyApp.jsx"));
export default function App() {
  const { pathname } = useLocation();
  const { lang } = useLang();
  const route = pathname.replace(/\/+$/, "") || "/";
  if (route === "/admin") {
    return (
      <Suspense
        fallback={
          <p role="status">
            {lang === "ar"
              ? "\u062C\u0627\u0631\u064D \u0627\u0644\u062A\u062D\u0645\u064A\u0644\u2026"
              : "Loading\u2026"}
          </p>
        }
      >
        <LegacyApp />
      </Suspense>
    );
  }
  return <ConsultingSite />;
}
