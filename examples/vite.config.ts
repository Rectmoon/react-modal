import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      'react-modal': path.resolve(__dirname, '../src/index.ts'),
    },
  },
  root: __dirname,
  server: {
    port: 5174,
  },
});
