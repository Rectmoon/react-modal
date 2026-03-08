import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'examples',
  resolve: {
    alias: {
      'react-modal': path.resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
