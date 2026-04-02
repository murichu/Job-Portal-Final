import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      "@":           fileURLToPath(new URL("./src",           import.meta.url)),
      "@components": fileURLToPath(new URL("./src/components", import.meta.url)),
      "@pages":      fileURLToPath(new URL("./src/pages",      import.meta.url)),
      "@context":    fileURLToPath(new URL("./src/context",    import.meta.url)),
      "@assets":     fileURLToPath(new URL("./src/assets",     import.meta.url)),
      "@hooks":      fileURLToPath(new URL("./src/hooks",      import.meta.url)),
    },
  },

  build: {
    // Raise the warning threshold — quill + lucide push bundle size
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          router: ["react-router-dom", "react-router"],
          ui:     ["lucide-react", "react-toastify"],
          editor: ["quill"],
          utils:  ["axios", "moment", "dompurify", "k-convert"],
        },
      },
    },
  },

  server: {
    port: 5173,
    open: true,
  },
});
