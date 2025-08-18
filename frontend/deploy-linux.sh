#!/bin/bash

echo "🚀 Starting Linux deployment setup..."

# Clean all npm/node artifacts
echo "🧹 Cleaning previous installations..."
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock
rm -rf .vite
rm -rf dist

# Clear npm cache
echo "🗑️ Clearing npm cache..."
npm cache clean --force

# Create .npmrc for Linux
echo "📝 Creating Linux-specific .npmrc..."
cat > .npmrc << EOF
# Linux-specific npm configuration
omit=optional
no-optional=true
force=true
engine-strict=false
EOF

# Install dependencies with Linux-specific flags
echo "📦 Installing dependencies for Linux..."
npm install --no-optional --force

# Remove any Windows-specific packages that might have been installed
echo "🔧 Removing Windows-specific packages if any..."
npm uninstall @rollup/rollup-win32-x64-msvc 2>/dev/null || true
npm uninstall @rollup/rollup-win32-ia32-msvc 2>/dev/null || true
npm uninstall @rollup/rollup-win32-arm64-msvc 2>/dev/null || true

# Build the application
echo "🏗️ Building the application..."
npm run build

echo "✅ Linux deployment setup complete!"
echo "📌 You can now run 'npm run start' or 'npm run dev'"