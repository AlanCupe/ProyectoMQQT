import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { config as loadEnv } from 'dotenv';

// Cargar las variables de entorno desde el archivo .env
loadEnv();

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0'||process.env.VITE_HOST || 'localhost',
    port:  5173 || parseInt(process.env.VITE_PORT) ,
  },
});

