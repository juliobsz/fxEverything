import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { crx } from "@crxjs/vite-plugin";
import { defineConfig } from "vite";
import zipPack from "vite-plugin-zip-pack";

import manifest from "./manifest.config";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    crx({ manifest }),
    zipPack({
      inDir: "dist",
      outDir: "release",
      outFileName: "fxeverything-0.1.0.zip",
    }),
  ],
  build: {
    target: "chrome111",
  },
});
