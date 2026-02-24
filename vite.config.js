import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  
  // For production (deployed to server root), keep '/'
  // For local file opening, use './'
  base: mode === 'production' ? '/' : './',

  // Your existing alias – this only matches exact strings, so it's fine
  resolve: {
    alias: {
      '../../../../shared': path.resolve(__dirname, 'src/shared')
    }
  }
}))