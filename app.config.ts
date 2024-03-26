import { defineConfig } from "@solidjs/start/config";
import unocss from "unocss/vite";

export default defineConfig({
  vite: {
    plugins: [unocss()],
    ssr: { external: ["@prisma/client"] },
  },
});
