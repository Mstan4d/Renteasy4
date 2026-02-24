import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // 🔑 CRITICAL FIX
  base: mode === 'production' ? '/Renteasy-frontend/' : '/',

  resolve: {
    alias: {
      '../../../../shared': path.resolve(__dirname, 'src/shared')
    }
  }
}))