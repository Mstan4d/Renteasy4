import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: '/Renteasy-frontend/',
  resolve: {
    alias: {
      // Fix the old shared import paths
      '../../../../shared': path.resolve(__dirname, 'src/shared')
    }
  }
})