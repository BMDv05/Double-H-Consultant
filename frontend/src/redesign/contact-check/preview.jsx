import { useState } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter } from "react-router-dom";
import ConsultingContact from "../ConsultingContact.jsx";
import "../foundation/tokens.css";
function Preview() {
  const [lang, setLang] = useState("en");
  const [mode, setMode] = useState("success");
  const [calls, setCalls] = useState(0);
  async function submit() {
    setCalls((n) => n + 1);
    if (mode === "error")
      throw { kind: "server", message: "Raw unlocalized server diagnostic" };
    return { ok: true, id: 4242 };
  }
  return (
    <div className="dh-public" lang={lang} dir={lang === "ar" ? "rtl" : "ltr"}>
      <div style={{ padding: 12, background: "white" }}>
        <strong>MOCK ONLY — no live submissions</strong>{" "}
        <button
          type="button"
          onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
        >
          Switch language
        </button>{" "}
        <label>
          Response mode{" "}
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="success">Success</option>
            <option value="error">Server error</option>
          </select>
        </label>{" "}
        <output aria-label="Mock request count">{calls}</output>
      </div>
      <ConsultingContact lang={lang} onBook={() => {}} submit={submit} />
    </div>
  );
}
createRoot(document.getElementById("root")).render(
  <HashRouter>
    <Preview />
  </HashRouter>,
);
