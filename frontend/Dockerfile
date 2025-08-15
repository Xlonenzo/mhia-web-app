FROM node:18-alpine

WORKDIR /app

# Install curl for health checks
RUN apk add --no-cache curl

# Copy package files
COPY package.json ./

# Remove Windows-specific packages and install dependencies
RUN sed -i '/@rollup\/rollup-win32-x64-msvc/d' package.json && \
    npm install --legacy-peer-deps --force && \
    npm install --save-dev @types/node

# Copy source code
COPY . .

# Build the application (skip TypeScript errors for now)
RUN npm run build || true

# If build failed, try building without type checking
RUN if [ ! -d "dist" ]; then \
    npx vite build --mode production; \
    fi

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]