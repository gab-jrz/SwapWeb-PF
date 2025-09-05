import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import istanbul from 'vite-plugin-istanbul'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    istanbul({
      include: ['src/**/*.js', 'src/**/*.jsx'],
      exclude: ['node_modules', 'cypress/**/*', 'src/**/*.test.*'],
      extension: ['.js', '.jsx'],
      cypress: true,
      requireEnv: false,
    }),
  ],
})
