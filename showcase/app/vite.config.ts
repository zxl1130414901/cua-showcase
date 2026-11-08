import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// 离线单文件产物：不使用 ESM，所有资源内联（由 scripts/inline-html.mjs 完成）
export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    target: 'es2019',
    cssCodeSplit: false,
    chunkSizeWarningLimit: 1200,
    assetsInlineLimit: 100_000_000,
    modulePreload: false,
    rollupOptions: {
      output: {
        format: 'iife',
        inlineDynamicImports: true,
        entryFileNames: 'app.js',
        assetFileNames: 'app.[ext]',
      },
    },
  },
});
