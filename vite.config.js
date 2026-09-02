// vite.config.js
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// ─────────────────────────────────────────────────────────────────────────────
// URL do backend em produção.
// Definida diretamente aqui para não depender de variáveis de ambiente
// do painel do Vercel (que podem estar desatualizadas ou travadas).
// Para trocar de backend no futuro, basta editar esta linha.
// ─────────────────────────────────────────────────────────────────────────────
const BACKEND_PRODUCAO = "https://opa5-backend.onrender.com";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Em desenvolvimento local usa localhost; em produção usa o Render.
  const apiUrl =
    mode === "development"
      ? env.VITE_API_URL || "http://localhost:8000"
      : BACKEND_PRODUCAO;

  return {
    plugins: [react()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl),
    },
    server: {
      port: 3000,
      proxy: {
        "/api": { target: "http://localhost:8000", changeOrigin: true },
      },
    },
  };
});
