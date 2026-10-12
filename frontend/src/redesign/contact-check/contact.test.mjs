import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
import esbuild from "esbuild";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter } from "react-router-dom";
const require = createRequire(import.meta.url);
const code = esbuild.buildSync({
  entryPoints: ["src/redesign/ConsultingContact.jsx"],
  bundle: true,
  write: false,
  format: "cjs",
  jsx: "automatic",
  loader: { ".module.css": "empty" },
  external: ["react", "react/jsx-runtime", "react-router-dom"],
}).outputFiles[0].text;
const mod = { exports: {} };
new Function("module", "exports", "require", code)(mod, mod.exports, require);
const { default: Contact, buildContactPayload } = mod.exports;
const form = {
  name: "Example Client",
  email: "example@example.com",
  subject: "A".repeat(120),
  message: "B".repeat(2700),
  honeypot: "",
};
test("General inquiry stays bounded for every service and both languages", () => {
  for (const lang of ["en", "ar"])
    for (const division of [
      "bim",
      "arch",
      "civil",
      "elec",
      "mgmt",
      "bd",
      "startup",
      "medical",
      "law",
    ]) {
      const payload = buildContactPayload({ ...form, division }, lang);
      assert.ok(payload.subject.length <= 200);
      assert.equal(payload.message.length, 2700);
      assert.equal(payload.lang, lang);
      assert.ok(payload.subject.startsWith("["));
    }
});
test("Unknown service values cannot become an inquiry prefix; invalid required fields reject", () => {
  assert.equal(
    buildContactPayload({ ...form, division: "unknown" }, "en").subject,
    form.subject,
  );
  assert.throws(
    () => buildContactPayload({ ...form, name: "" }, "en"),
    (err) => err.kind === "validation" && err.field === "name",
  );
  assert.throws(
    () => buildContactPayload({ ...form, email: "invalid" }, "ar"),
    (err) => err.kind === "validation" && err.field === "email",
  );
});
test("Query prefill is encoded, contains nine service choices, and no seeded contacts", () => {
  const html = renderToStaticMarkup(
    React.createElement(
      MemoryRouter,
      { initialEntries: ["/contact?division=law&subject=%3Cscript%3E"] },
      React.createElement(Contact, { lang: "en", onBook: () => {} }),
    ),
  );
  assert.ok(html.includes('value="&lt;script&gt;"'));
  assert.ok(!html.includes("<script>"));
  for (const id of [
    "bim",
    "arch",
    "civil",
    "elec",
    "mgmt",
    "bd",
    "startup",
    "medical",
    "law",
  ])
    assert.ok(html.includes(`value="${id}"`));
  assert.ok(!html.includes("555"));
  assert.ok(!html.includes("New York"));
  assert.equal((html.match(/<h1/g) || []).length, 1);
});
