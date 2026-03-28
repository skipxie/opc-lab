import { defineConfig } from 'dotenv';

export default defineConfig({
  define: {
    'process.env': {
      NODE_ENV: 'development',
      PORT: 3000,
      DB_HOST: '8.163.33.195',
      DB_PORT: 3806,
      DB_USERNAME: 'opclab_X14.',
      DB_PASSWORD: 'bBJHLwL8exXtz2kF',
      DB_DATABASE: 'opc',
      SESSION_SECRET: 'opc-lab-session-secret-change-in-production',
      FRONTEND_URL: 'http://localhost:5173',
    },
  },
});
