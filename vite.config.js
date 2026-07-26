import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig((mode) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    base: env.VITE_APP_PUBLIC_URL ?? "./", //Set the base of frontend assets
    server: {
      strictPort: true //Prevent multiple dev server instances
    }
  };
});