import { defineConfig, presetUno, presetAttributify } from "unocss";
import { presetDaisy } from "@unscatty/unocss-preset-daisy";

export default defineConfig({
  presets: [presetUno(), presetAttributify(), presetDaisy()],
  theme: {
    extend: {
      colors: {
        blue: {},
        accent: {},
        base: {},
      },
    },
  },
});
