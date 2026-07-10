import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    react({
      babel: {
        plugins: [

        ],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://gear-pms-api.runasp.net',
        changeOrigin: true,
      },
    // proxy: {
    //   '/api': {
    //     target: 'https://pmss.runasp.net/',
    //     changeOrigin: true,
    //   },
    },
  },
}))
