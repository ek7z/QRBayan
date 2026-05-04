import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return undefined;
          }

          if (id.includes("qr-code-styling")) {
            return "qr-renderer";
          }

          if (id.includes("lucide-react")) {
            return "icons";
          }

          return undefined;
        },
      },
    },
  },
});
