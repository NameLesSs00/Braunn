import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import locatorBabel from '@locator/babel-jsx'

// Wrapper to fix Windows path issues in Locator.js
const locatorBabelWrapper = (babel) => {
  const pluginFn = locatorBabel.default || locatorBabel
  const plugin = pluginFn(babel)
  const originalEnter = plugin.visitor.Program.enter
  plugin.visitor.Program.enter = function (path, state) {
    if (state.filename) state.filename = state.filename.replace(/\\/g, '/')
    if (state.cwd) state.cwd = state.cwd.replace(/\\/g, '/')
    return originalEnter.apply(this, arguments)
  }
  return plugin
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    react({
      babel: {
        plugins: [
          // Locator.js: enables click-to-source in dev mode only
          ...(mode === 'development' ? [[locatorBabelWrapper, { env: 'development' }]] : []),
        ],
      },
    }),
  ],
  server: {
    // proxy: {
    //   '/api': {
    //     target: 'http://gear-pms-api.runasp.net',
    //     changeOrigin: true,
    //   },
          proxy: {
      '/api': {
        target: 'https://pmss.runasp.net/',
        changeOrigin: true,
      },
    },
  },
}))
