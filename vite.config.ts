import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import basicSsl from "@vitejs/plugin-basic-ssl";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  // basicSsl serves the dev server over HTTPS with an auto-generated
  // self-signed certificate (a secure context, so the mic works).
  // plugins: [react(), basicSsl()],
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  // The @interactly-ai/web package ships as untyped CommonJS. Pre-bundling it
  // lets Vite convert it to ESM so the named import resolves cleanly.
  optimizeDeps: {
    include: ["@interactly-ai/web"],
  },
  server: {
  host: "local.interactly.ai",
  port: 3000,
    https: {
      cert: readFileSync("./local.interactly.ai.pem"),
      key: readFileSync("./local.interactly.ai-key.pem"),
    },
  },
  preview: {
    host: "local.interactly.ai",
    port: 3000,
    strictPort: true,
    allowedHosts: ["local.interactly.ai"],
  },
});
