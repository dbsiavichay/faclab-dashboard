import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import dynamicImport from 'vite-plugin-dynamic-import'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react({
    babel: {
      plugins: [
        ['babel-plugin-react-compiler', { target: '19' }],
        'babel-plugin-macros'
      ]
    }
  }),
  dynamicImport()],
  assetsInclude: ['**/*.md'],
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
      '@app': path.join(__dirname, 'src/app'),
      '@features': path.join(__dirname, 'src/features'),
      '@shared': path.join(__dirname, 'src/shared'),
      '@stores': path.join(__dirname, 'src/stores'),
      '@configs': path.join(__dirname, 'src/configs'),
      '@legacy': path.join(__dirname, 'src/views'),
    },
  },
  build: {
    outDir: 'build'
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['src/shared/**', 'src/app/**', 'src/features/**'],
    },
  },
});
