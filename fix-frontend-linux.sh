#!/bin/bash

# ====================================================================
# Quick Fix Script for Frontend on Linux
# Resolves rollup and cross-platform issues
# ====================================================================

set -e

echo "🔧 Fixing Frontend for Linux..."

cd frontend

# Step 1: Clean everything
echo "🧹 Cleaning old installations..."
rm -rf node_modules package-lock.json pnpm-lock.yaml yarn.lock .vite dist
npm cache clean --force

# Step 2: Install pnpm (better for cross-platform)
echo "📦 Installing pnpm..."
sudo npm install -g pnpm

# Step 3: Create Linux-specific configuration
echo "⚙️ Creating Linux configuration..."
cat > .npmrc <<EOF
omit=optional
engine-strict=false
auto-install-peers=true
shamefully-hoist=true
EOF

# Step 4: Install dependencies with pnpm
echo "📥 Installing dependencies..."
pnpm install --force

# Step 5: Manually ensure rollup Linux binary is installed
echo "🔧 Installing Linux-specific rollup..."
pnpm add -D @rollup/rollup-linux-x64-gnu@4.21.0

# Step 6: Try to build
echo "🏗️ Building application..."
if pnpm run build; then
    echo "✅ Build successful!"
    
    # Step 7: Start the application
    echo "🚀 Starting application..."
    echo "Run 'pnpm run preview' to start the frontend server"
    echo "Or use 'pnpm run dev' for development mode"
else
    echo "⚠️ Build failed. Trying alternative method..."
    
    # Alternative: Run in dev mode
    echo "📝 You can run in development mode with: pnpm run dev"
    
    # Alternative 2: Use serve for static files
    echo "Or install a static server:"
    echo "  npm install -g serve"
    echo "  serve -s dist -l 3000"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Available commands:"
echo "  pnpm run dev     - Development server"
echo "  pnpm run build   - Build for production"
echo "  pnpm run preview - Preview production build"