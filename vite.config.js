# Create or update vite.config.js with the new alias
# (We'll add the '@shared' alias while keeping the old one)
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  resolve: {
    alias: {
      '../../../../shared': path.resolve(__dirname, 'src/shared'),
      '@shared': path.resolve(__dirname, 'src/shared')
    }
  }
}))
EOF

# Add all changed files
git add src/modules/providers/pages/ProviderSubscribe.jsx
git add src/modules/providers/pages/ProviderSubscription.jsx
git add vite.config.js

# Commit
git commit -m "Add Vite alias for shared lib to fix deployment"

# Push
git push origin main